import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get('Groq_API');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl } = await req.json();
    console.log('Processing file URL:', fileUrl);
    
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to fetch file content');
    }

    const contentType = fileResponse.headers.get('content-type');
    console.log('File content type:', contentType);

    let content;
    if (contentType?.includes('application/pdf') || 
        contentType?.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation') ||
        contentType?.includes('application/vnd.ms-powerpoint')) {
      content = `Please analyze this ${contentType} file available at: ${fileUrl} and create comprehensive flashcards that cover all key concepts and important details.`;
    } else {
      content = await fileResponse.text();
    }

    console.log('Sending content to Groq API...');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: `You are an expert at creating comprehensive educational flashcards. Your task is to:
            1. Thoroughly analyze the content and identify ALL important concepts, definitions, and key points
            2. Create 10-15 high-quality flashcards that cover the material comprehensively
            3. Ensure each flashcard focuses on a single concept or idea
            4. Write clear, concise questions for the front and detailed, informative answers for the back
            5. Include examples where appropriate to enhance understanding
            Format your response as a valid JSON array of objects with 'front' and 'back' properties.
            Example: [{"front": "Question?", "back": "Answer"}]
            IMPORTANT: Your response must contain ONLY the JSON array, with no additional text or formatting.`
          },
          {
            role: 'user',
            content: `Generate comprehensive flashcards from this content: ${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Groq API response received');
    
    let flashcardsText = data.choices[0].message.content;
    console.log('Raw Groq API response content:', flashcardsText);
    
    flashcardsText = flashcardsText.trim();
    flashcardsText = flashcardsText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    console.log('Cleaned flashcards text:', flashcardsText);
    
    try {
      const flashcards = JSON.parse(flashcardsText);
      
      if (!Array.isArray(flashcards)) {
        console.error('Parsed content is not an array:', flashcards);
        throw new Error('Response is not an array of flashcards');
      }
      
      const validFlashcards = flashcards.every(card => 
        card && 
        typeof card === 'object' && 
        'front' in card && 
        'back' in card &&
        typeof card.front === 'string' &&
        typeof card.back === 'string'
      );
      
      if (!validFlashcards) {
        console.error('Invalid flashcard format in array:', flashcards);
        throw new Error('One or more flashcards have invalid format');
      }
      
      return new Response(
        JSON.stringify({ flashcards }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing or validating flashcards:', parseError);
      console.log('Failed to parse text:', flashcardsText);
      throw new Error(`Failed to process flashcards: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in generate-flashcards function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
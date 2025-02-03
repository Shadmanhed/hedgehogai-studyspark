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
      content = `Please analyze this ${contentType} file available at: ${fileUrl} and create comprehensive flashcards. Your task is to:
1. Examine EVERY slide/page and create flashcards ONLY from the content actually present
2. For each slide/section:
   - Create flashcards for key concepts AS THEY ARE DEFINED in the document
   - Include important facts and details EXACTLY as presented
   - Use examples and applications ONLY from the material
   - Maintain technical terms and definitions AS SHOWN
3. Format guidelines:
   - Front: Clear, focused question about a specific concept from the slides
   - Back: Answer using ONLY information present in the slides
4. Important rules:
   - Do not add external information or examples
   - Use only definitions and explanations from the document
   - Keep all technical terms exactly as presented
   - Maintain the original context and meaning
5. Create 25-35 flashcards that accurately reflect the document's content

IMPORTANT: Generate flashcards ONLY from information actually present in the document. Do not add external knowledge or examples.`;
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
1. Analyze the content with extreme attention to detail
2. Create 25-35 detailed flashcards that cover EVERY important concept
3. Ensure each flashcard focuses on a specific piece of information
4. Include ALL relevant details, examples, and context
5. Write clear, engaging questions for the front
6. Provide detailed, complete answers for the back
7. Never omit any important information
8. Include specific examples, dates, numbers, and technical terms exactly as presented
Format your response as a valid JSON array of objects with 'front' and 'back' properties.
Example: [{"front": "Question?", "back": "Detailed answer"}]
IMPORTANT: Your response must contain ONLY the JSON array, with no additional text or formatting.`
          },
          {
            role: 'user',
            content: `Generate comprehensive flashcards from this content: ${content}`
          }
        ],
        temperature: 0.3,
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

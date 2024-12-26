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
    
    // Fetch the file content
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to fetch file content');
    }

    // Get the content type from the response
    const contentType = fileResponse.headers.get('content-type');
    console.log('File content type:', contentType);

    // Convert file content to text, handling different file types
    let content;
    if (contentType?.includes('application/pdf') || 
        contentType?.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation') ||
        contentType?.includes('application/vnd.ms-powerpoint')) {
      // For binary files, we'll use the URL directly
      content = `Please generate flashcards from this ${contentType} file: ${fileUrl}`;
    } else {
      // For text files, we can read the content directly
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
            content: `You are an expert at creating educational flashcards. Create exactly 5 flashcards from the provided content. 
            Format your response as a valid JSON array of objects with 'front' and 'back' properties.
            Example: [{"front": "Question?", "back": "Answer"}]
            IMPORTANT: Your response must contain ONLY the JSON array, with no additional text, markdown formatting, or code blocks.`
          },
          {
            role: 'user',
            content: `Generate 5 flashcards from this content: ${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Groq API response received');
    
    // Get the raw content from the response
    let flashcardsText = data.choices[0].message.content;
    console.log('Raw Groq API response content:', flashcardsText);
    
    // Clean up the response
    flashcardsText = flashcardsText.trim();
    
    // Remove any markdown code block markers if present
    flashcardsText = flashcardsText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    console.log('Cleaned flashcards text:', flashcardsText);
    
    try {
      const flashcards = JSON.parse(flashcardsText);
      
      // Validate the structure
      if (!Array.isArray(flashcards)) {
        console.error('Parsed content is not an array:', flashcards);
        throw new Error('Response is not an array of flashcards');
      }
      
      // Validate each flashcard
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
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Summarize function called');
    const { text, fileUrl } = await req.json();
    
    let contentToSummarize = '';
    
    if (text) {
      console.log('Processing text input');
      contentToSummarize = text;
    } else if (fileUrl) {
      console.log('Processing file from URL:', fileUrl);
      // Here we would process the file from the URL
      // For now, we'll just use the URL as a placeholder
      contentToSummarize = `Content from file: ${fileUrl}`;
    } else {
      throw new Error('No text or file URL provided');
    }

    console.log('Sending request to OpenAI');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise summaries of academic notes and documents. Focus on key points and maintain academic language.'
          },
          {
            role: 'user',
            content: `Please summarize the following text concisely while maintaining key academic points: ${contentToSummarize}`
          }
        ],
      }),
    });

    const data = await response.json();
    console.log('Received response from OpenAI');
    const summary = data.choices[0].message.content;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in summarize function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
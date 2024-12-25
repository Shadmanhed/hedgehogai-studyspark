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
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }
    
    let contentToSummarize = '';
    
    if (text) {
      console.log('Processing text input');
      contentToSummarize = text;
    } else if (fileUrl) {
      console.log('Processing file from URL:', fileUrl);
      // Fetch the file content from the URL
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        console.error('Failed to fetch file:', fileResponse.status, fileResponse.statusText);
        throw new Error('Failed to fetch file content');
      }
      contentToSummarize = await fileResponse.text();
      console.log('Successfully fetched file content');
    } else {
      throw new Error('No text or file URL provided');
    }

    if (!contentToSummarize) {
      throw new Error('No content to summarize');
    }

    console.log('Content length to summarize:', contentToSummarize.length);
    console.log('Sending request to OpenAI');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',  // Fixed model name
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Received response from OpenAI');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response format:', data);
      throw new Error('Invalid response format from OpenAI');
    }

    const summary = data.choices[0].message.content;
    console.log('Successfully generated summary');

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in summarize function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during summarization',
        details: error.toString()
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
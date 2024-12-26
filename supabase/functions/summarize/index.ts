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
    console.log('Summarize function called');
    const { text, fileUrl } = await req.json();
    
    if (!groqApiKey) {
      console.error('Groq API key not found');
      throw new Error('Groq API key not configured');
    }
    
    let contentToSummarize = '';
    
    if (text) {
      console.log('Processing text input, length:', text.length);
      contentToSummarize = text;
    } else if (fileUrl) {
      console.log('Processing file from URL:', fileUrl);
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        console.error('Failed to fetch file:', fileResponse.status, fileResponse.statusText);
        throw new Error('Failed to fetch file content');
      }
      contentToSummarize = await fileResponse.text();
      console.log('Successfully fetched file content, length:', contentToSummarize.length);
    } else {
      throw new Error('No text or file URL provided');
    }

    if (!contentToSummarize) {
      throw new Error('No content to summarize');
    }

    console.log('Sending request to Groq API...');
    
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
            content: 'You are a helpful assistant that creates concise summaries of academic notes and documents. Focus on key points and maintain academic language. Your summary should be comprehensive yet concise.'
          },
          {
            role: 'user',
            content: `Please summarize the following text, focusing on the main academic concepts and key points: ${contentToSummarize}`
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
    console.log('Received response from Groq API');
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected Groq response format:', data);
      throw new Error('Invalid response format from Groq API');
    }

    const summary = data.choices[0].message.content;
    console.log('Successfully generated summary, length:', summary.length);

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
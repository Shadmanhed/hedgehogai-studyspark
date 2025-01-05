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
      
      const contentType = fileResponse.headers.get('content-type');
      console.log('File content type:', contentType);
      
      if (contentType?.includes('application/pdf') || 
          contentType?.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation') ||
          contentType?.includes('application/vnd.ms-powerpoint')) {
        contentToSummarize = `Please analyze this ${contentType} document available at: ${fileUrl}. Your task is to:
1. Extract and organize ALL information with extreme attention to detail
2. Include:
   - Main concepts and their complete explanations
   - All supporting details and examples
   - Technical terms and their definitions
   - Numerical data and statistics
   - Relationships between concepts
   - Case studies and practical applications
3. Maintain the original structure and hierarchy
4. Present information in a clear, logical flow
5. Use bullet points for key concepts and examples
6. Include ALL specific examples and technical details
7. Verify accuracy of information through cross-referencing
8. Highlight important definitions and concepts
Do not omit any content, no matter how minor it might seem.`;
      } else {
        contentToSummarize = await fileResponse.text();
      }
      
      console.log('Successfully processed file content');
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
            content: `You are an expert academic summarizer with exceptional attention to detail. Your task is to:
1. Create a comprehensive summary that captures EVERY piece of information
2. Maintain all specific details, examples, and technical terms
3. Preserve the original structure and hierarchy
4. Include ALL numerical data, dates, and specific examples
5. Use bullet points to highlight key concepts and examples
6. Never skip or summarize away any detail
7. Present information in a clear, engaging style
8. Double-check all facts and figures for accuracy
9. Use clear headings for different sections
10. Format the output with proper spacing and organization

Remember: The goal is to create a detailed yet readable summary that could be used to reconstruct the original content.
Use bullet points (•) for listing key points and examples.`
          },
          {
            role: 'user',
            content: `Please provide a comprehensive academic summary of the following content: ${contentToSummarize}`
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
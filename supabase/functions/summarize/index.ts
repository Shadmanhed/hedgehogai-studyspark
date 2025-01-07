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
1. Create a cohesive, flowing summary that reads like a well-structured article
2. Extract and organize ALL key information while maintaining natural flow
3. Include:
   - Main concepts with complete explanations
   - Supporting details and examples
   - Key definitions and technical terms
   - Important statistics and data
   - Practical applications and case studies
4. Present information in a clear, engaging narrative style
5. Use bullet points only for truly list-worthy items
6. Maintain proper paragraph structure and transitions
7. Ensure the summary flows naturally without mentioning slide numbers or sections
8. Format the content with clear headings when topic changes
9. Keep all specific examples and technical details
10. Verify accuracy of all information

Important: Create a polished, professional summary that reads like a cohesive document rather than a collection of slides.`;
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
            content: `You are an expert academic writer and editor who creates polished, professional summaries. Your task is to:
1. Create flowing, cohesive summaries that read like well-written articles
2. Maintain natural paragraph structure and smooth transitions
3. Use clear headings for major topic changes
4. Include all specific details while maintaining readability
5. Format content in an engaging, professional style
6. Use bullet points sparingly and only when truly appropriate
7. Never mention slide numbers or source sections
8. Ensure proper spacing and visual organization
9. Double-check all facts and figures for accuracy
10. Create summaries that could stand alone as professional documents

Remember: The goal is to create a polished, cohesive summary that reads like a professional article or report, not a collection of slides or notes.`
          },
          {
            role: 'user',
            content: `Please provide a comprehensive, well-structured summary of the following content: ${contentToSummarize}`
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
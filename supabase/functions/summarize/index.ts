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
1. Create an easy-to-understand summary that highlights key terminology
2. Structure the content in a clear, logical flow with these elements:
   - Begin with a brief overview of the main topic
   - Define and explain important terms and concepts clearly
   - Provide real-world examples and applications
   - Include key statistics and data in context
3. Highlight and explain important terminology by:
   - Defining technical terms in simple language
   - Providing examples of how terms are used
   - Connecting terms to practical applications
4. Maintain a natural, conversational tone while being informative
5. Use clear paragraph breaks and headings for different topics
6. Include bullet points only for truly important lists or key points
7. Ensure smooth transitions between topics
8. Keep all specific examples and technical details, but explain them clearly
9. Format the content for easy reading and understanding
10. Double-check accuracy of all information

Important: Create a polished, accessible summary that explains complex topics clearly while preserving all important information.`;
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
            content: `You are an expert educator and writer who creates clear, accessible summaries. Your task is to:
1. Create engaging summaries that explain complex topics clearly
2. Define and explain important terminology in simple terms
3. Use clear headings to organize different topics
4. Break down complex concepts into understandable parts
5. Include practical examples and applications
6. Maintain an educational, approachable tone
7. Use simple language while preserving technical accuracy
8. Create clear paragraph structure and transitions
9. Highlight key terms and concepts effectively
10. Ensure summaries are both informative and easy to understand

Remember: The goal is to create an accessible, educational summary that explains complex topics clearly while preserving all important information and terminology.`
          },
          {
            role: 'user',
            content: `Please provide a clear, well-structured summary that explains all important concepts and terminology from the following content: ${contentToSummarize}`
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
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const klustrApiKey = Deno.env.get('KLUSTR_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to handle file content based on content type
const getContentToSummarize = async (fileUrl: string, contentType: string | null): Promise<string> => {
  if (contentType?.includes('application/pdf') || 
      contentType?.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation') ||
      contentType?.includes('application/vnd.ms-powerpoint')) {
    return generatePromptForDocument(contentType, fileUrl);
  }
  const response = await fetch(fileUrl);
  return await response.text();
};

// Function to generate the prompt for document analysis
const generatePromptForDocument = (contentType: string, fileUrl: string): string => {
  return `Please analyze this ${contentType} document available at: ${fileUrl}. Your task is to:
1. Read and analyze EVERY slide/page in detail
2. Create a comprehensive summary that includes:
   - The main topic and purpose of the presentation
   - Key points from EACH slide
   - Important definitions and concepts AS PRESENTED in the slides
   - Examples and case studies mentioned
   - Any data, statistics, or numerical information
   - Relationships between concepts as shown
3. Structure the summary with:
   - A brief overview of the presentation's main topic
   - Detailed summaries of each major section
   - Clear explanations of technical terms AS THEY APPEAR in the slides
   - Integration of examples and applications FROM THE SLIDES
4. Important guidelines:
   - Only include information that is actually present in the slides
   - Do not generate additional examples or definitions
   - Maintain the original context and meaning
   - Keep all specific details and technical terms exactly as presented
   - Follow the presentation's structure and flow

Remember: Your summary should be based SOLELY on the content actually present in the slides/document, without adding external information or examples.`;
};

// Function to get the system message for the AI
const getSystemMessage = (): { role: string; content: string } => {
  return {
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
  };
};

// Main handler function
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Summarize function called');
    const { text, fileUrl } = await req.json();
    
    if (!klustrApiKey) {
      console.error('Klustr API key not found');
      throw new Error('Klustr API key not configured');
    }
    
    let contentToSummarize = '';
    
    if (text) {
      console.log('Processing text input, length:', text.length);
      contentToSummarize = text;
    } else if (fileUrl) {
      contentToSummarize = await getContentToSummarize(fileUrl);
    } else {
      throw new Error('No text or file URL provided');
    }

    if (!contentToSummarize) {
      throw new Error('No content to summarize');
    }

    console.log('Sending request to Klustr API...');
    const response = await fetch('https://api.klustr.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${klustrApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          getSystemMessage(),
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
      console.error('Klustr API error:', errorData);
      throw new Error(`Klustr API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Received response from Klustr API');
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected Klustr response format:', data);
      throw new Error('Invalid response format from Klustr API');
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
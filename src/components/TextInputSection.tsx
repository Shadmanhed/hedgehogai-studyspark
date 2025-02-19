import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TextInputSectionProps {
  text: string;
  setText: (text: string) => void;
  isLoading: boolean;
  onSummaryGenerated: (summary: string) => void;
}

export const TextInputSection = ({ text, setText, isLoading, onSummaryGenerated }: TextInputSectionProps) => {
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to summarize",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting summarization process...');
      console.log('Text length:', text.length);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      console.log('User authenticated:', user.id);

      console.log('Calling summarize function with text input...');
      const { data: summaryResponse, error: summaryError } = await supabase.functions.invoke('summarize', {
        body: { text },
      });

      if (summaryError) {
        console.error('Summary error:', summaryError);
        throw summaryError;
      }

      if (!summaryResponse?.summary) {
        console.error('No summary received in response:', summaryResponse);
        throw new Error('No summary received from the server');
      }

      console.log('Summary received:', summaryResponse);

      console.log('Saving summary to database...');
      const { error: dbError } = await supabase.from('summaries').insert({
        user_id: user.id,
        original_text: text,
        summary: summaryResponse.summary,
        title: text.split('\n')[0].substring(0, 50)
      });

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      console.log('Summary saved successfully');

      toast({
        title: "Success",
        description: "Your notes have been summarized and saved!",
      });

      onSummaryGenerated(summaryResponse.summary);
    } catch (error) {
      console.error('Error in handleSummarize:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to summarize notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Textarea
        placeholder="Paste your notes here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[200px]"
      />
      <Button 
        onClick={handleSummarize} 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Summarizing...
          </>
        ) : (
          'Summarize Notes'
        )}
      </Button>
    </>
  );
};
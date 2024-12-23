import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const NoteSummarizer = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: summaryResponse, error: summaryError } = await supabase.functions.invoke('summarize', {
        body: { text },
      });

      if (summaryError) throw summaryError;

      // Save the summary to the database
      const { error: dbError } = await supabase.from('summaries').insert({
        user_id: user.id,
        original_text: text,
        summary: summaryResponse.summary,
        title: text.split('\n')[0].substring(0, 50) // Use first line as title
      });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Your notes have been summarized and saved!",
      });

      setText("");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to summarize notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">AI Note Summarizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
};
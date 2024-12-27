import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";

export const AITeacher = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending question to AI Teacher...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.functions.invoke('ai-teacher', {
        body: { question },
      });

      if (error) throw error;

      // Store the interaction in the database
      const { error: dbError } = await supabase
        .from('ai_interactions')
        .insert({
          question,
          answer: data.answer,
          user_id: user.id,
        });

      if (dbError) throw dbError;

      // Set the answer to display it
      setAnswer(data.answer);

      toast({
        title: "Success",
        description: "Answer received!",
      });

      // Clear the question field
      setQuestion("");
    } catch (error) {
      console.error('Error processing question:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get answer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">AI Teacher</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Ask your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Ask Question"}
        </Button>
      </form>

      {answer && (
        <Card className="p-6 bg-white shadow-md">
          <h3 className="text-lg font-semibold mb-2">Answer:</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
        </Card>
      )}
    </div>
  );
};
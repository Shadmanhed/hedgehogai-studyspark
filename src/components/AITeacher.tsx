import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuestionInput } from "./ai-teacher/QuestionInput";
import { AnswerDisplay } from "./ai-teacher/AnswerDisplay";

export const AITeacher = () => {
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (question: string) => {
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <QuestionInput onSubmit={handleSubmit} isLoading={isLoading} />
      <AnswerDisplay answer={answer} />
    </div>
  );
};
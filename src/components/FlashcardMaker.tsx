import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const FlashcardMaker = () => {
  const [frontContent, setFrontContent] = useState("");
  const [backContent, setBackContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontContent.trim() || !backContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both sides of the flashcard",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating flashcard...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('flashcards')
        .insert({
          front_content: frontContent,
          back_content: backContent,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flashcard created successfully!",
      });

      // Clear the form
      setFrontContent("");
      setBackContent("");
    } catch (error) {
      console.error('Error creating flashcard:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create flashcard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Flashcard Maker</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="front" className="block text-sm font-medium mb-1">
            Front
          </label>
          <Input
            id="front"
            placeholder="Enter front content"
            value={frontContent}
            onChange={(e) => setFrontContent(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="back" className="block text-sm font-medium mb-1">
            Back
          </label>
          <Input
            id="back"
            placeholder="Enter back content"
            value={backContent}
            onChange={(e) => setBackContent(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Flashcard"}
        </Button>
      </form>
    </div>
  );
};
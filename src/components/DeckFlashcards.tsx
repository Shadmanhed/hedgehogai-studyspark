import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flashcard } from "./Flashcard";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface DeckFlashcard {
  id: string;
  front_content: string;
  back_content: string;
  created_at: string;
}

export const DeckFlashcards = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: flashcards } = useQuery({
    queryKey: ['deck-flashcards', deckId],
    queryFn: async () => {
      console.log('Fetching flashcards for deck:', deckId);
      const { data, error } = await supabase
        .from('deck_flashcards')
        .select(`
          flashcard_id,
          flashcards (
            id,
            front_content,
            back_content,
            created_at
          )
        `)
        .eq('deck_id', deckId);

      if (error) throw error;
      
      // Transform the data to match the expected format
      return data.map(item => item.flashcards) as DeckFlashcard[];
    }
  });

  const handleDelete = async (flashcardId: string) => {
    try {
      const { error } = await supabase
        .from('deck_flashcards')
        .delete()
        .eq('deck_id', deckId)
        .eq('flashcard_id', flashcardId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flashcard removed from deck successfully!",
      });
    } catch (error) {
      console.error('Error removing flashcard from deck:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove flashcard from deck",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/flashcards')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Decks
        </Button>
      </div>

      {flashcards && flashcards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map((flashcard) => (
            <Flashcard
              key={flashcard.id}
              id={flashcard.id}
              frontContent={flashcard.front_content}
              backContent={flashcard.back_content}
              onDelete={handleDelete}
              onAddToDeck={() => {}}
              hideAddToDeck
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No flashcards in this deck yet.</p>
      )}
    </div>
  );
};
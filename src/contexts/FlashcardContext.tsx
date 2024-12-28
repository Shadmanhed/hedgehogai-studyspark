import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Flashcard {
  id: string;
  front_content: string;
  back_content: string;
  created_at: string;
}

interface FlashcardContextType {
  flashcards: Flashcard[] | undefined;
  isLoading: boolean;
  handleDelete: (id: string) => Promise<void>;
  handleAddToDeck: (flashcardId: string, deckId: string) => Promise<void>;
  refetchFlashcards: () => Promise<void>;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();

  const { data: flashcards, refetch: refetchFlashcards, isLoading } = useQuery({
    queryKey: ['flashcards'],
    queryFn: async () => {
      console.log('Fetching flashcards...');
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Flashcard[];
    }
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flashcard deleted successfully!",
      });

      refetchFlashcards();
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete flashcard",
        variant: "destructive",
      });
    }
  };

  const handleAddToDeck = async (flashcardId: string, deckId: string) => {
    try {
      const { error } = await supabase
        .from('deck_flashcards')
        .insert([{
          deck_id: deckId,
          flashcard_id: flashcardId,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flashcard added to deck successfully!",
      });
    } catch (error) {
      console.error('Error adding flashcard to deck:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add flashcard to deck",
        variant: "destructive",
      });
    }
  };

  return (
    <FlashcardContext.Provider value={{ 
      flashcards, 
      isLoading, 
      handleDelete, 
      handleAddToDeck, 
      refetchFlashcards 
    }}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};
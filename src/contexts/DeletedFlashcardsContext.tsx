import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeletedFlashcard {
  id: string;
  front_content: string;
  back_content: string;
  created_at: string;
}

interface DeletedFlashcardsContextType {
  deletedFlashcards: DeletedFlashcard[];
  addDeletedFlashcard: (flashcard: DeletedFlashcard) => void;
  restoreFlashcard: (flashcard: DeletedFlashcard) => Promise<void>;
  clearDeletedFlashcards: () => void;
}

const DeletedFlashcardsContext = createContext<DeletedFlashcardsContextType | undefined>(undefined);

export const DeletedFlashcardsProvider = ({ children }: { children: ReactNode }) => {
  const [deletedFlashcards, setDeletedFlashcards] = useState<DeletedFlashcard[]>([]);
  const { toast } = useToast();

  const addDeletedFlashcard = (flashcard: DeletedFlashcard) => {
    setDeletedFlashcards((prev) => [flashcard, ...prev]);
  };

  const restoreFlashcard = async (flashcard: DeletedFlashcard) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('flashcards')
        .insert([{
          id: flashcard.id,
          user_id: user.id,
          front_content: flashcard.front_content,
          back_content: flashcard.back_content,
        }]);

      if (error) throw error;

      setDeletedFlashcards((prev) => 
        prev.filter((f) => f.id !== flashcard.id)
      );

      toast({
        title: "Success",
        description: "Flashcard restored successfully!",
      });
    } catch (error) {
      console.error('Error restoring flashcard:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to restore flashcard",
        variant: "destructive",
      });
    }
  };

  const clearDeletedFlashcards = () => {
    setDeletedFlashcards([]);
  };

  return (
    <DeletedFlashcardsContext.Provider 
      value={{ 
        deletedFlashcards, 
        addDeletedFlashcard, 
        restoreFlashcard, 
        clearDeletedFlashcards 
      }}
    >
      {children}
    </DeletedFlashcardsContext.Provider>
  );
};

export const useDeletedFlashcards = () => {
  const context = useContext(DeletedFlashcardsContext);
  if (context === undefined) {
    throw new Error('useDeletedFlashcards must be used within a DeletedFlashcardsProvider');
  }
  return context;
};
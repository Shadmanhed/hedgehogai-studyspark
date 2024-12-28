import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FlashcardUploader } from "./FlashcardUploader";
import { Flashcard } from "./Flashcard";
import { DeckManager } from "./DeckManager";

interface Flashcard {
  id: string;
  front_content: string;
  back_content: string;
  created_at: string;
}

export const FlashcardMaker = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: flashcards, refetch: refetchFlashcards } = useQuery({
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

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    
    try {
      console.log('Uploading file for flashcard generation...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      console.log('File uploaded successfully:', uploadData);
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      console.log('Generating flashcards from file...');
      const { data: flashcardsResponse, error: flashcardsError } = await supabase.functions.invoke('generate-flashcards', {
        body: { fileUrl: publicUrl },
      });

      if (flashcardsError) throw flashcardsError;

      // Save the generated flashcards
      const { error: saveError } = await supabase
        .from('flashcards')
        .insert(flashcardsResponse.flashcards.map((fc: any) => ({
          user_id: user.id,
          front_content: fc.front,
          back_content: fc.back,
          file_url: publicUrl
        })));

      if (saveError) throw saveError;
      
      toast({
        title: "Success",
        description: "Flashcards generated and saved successfully!",
      });

      refetchFlashcards();
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate flashcards",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">AI Flashcard Generator</h2>
        <FlashcardUploader
          isLoading={isLoading}
          onFileUpload={handleFileUpload}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Manage Decks</h3>
        <DeckManager />
      </div>

      {flashcards && flashcards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Your Flashcards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((flashcard) => (
              <Flashcard
                key={flashcard.id}
                id={flashcard.id}
                frontContent={flashcard.front_content}
                backContent={flashcard.back_content}
                onDelete={handleDelete}
                onAddToDeck={handleAddToDeck}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
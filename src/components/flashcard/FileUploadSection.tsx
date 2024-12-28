import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FlashcardUploader } from "../FlashcardUploader";
import { useFlashcards } from "@/contexts/FlashcardContext";

export const FileUploadSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { refetchFlashcards } = useFlashcards();

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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">AI Flashcard Generator</h2>
      <FlashcardUploader
        isLoading={isLoading}
        onFileUpload={handleFileUpload}
      />
    </div>
  );
};
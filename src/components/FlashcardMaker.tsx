import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const FlashcardMaker = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'text/plain'
    ];

    if (!validTypes.includes(fileType)) {
      toast({
        title: "Error",
        description: "Please upload a PDF, PowerPoint, or text file",
        variant: "destructive",
      });
      return;
    }

    setFile(file);
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
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate flashcards",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">AI Flashcard Generator</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium mb-1">
            Upload Document (PDF, PowerPoint, or Text file)
          </label>
          <Input
            id="file-upload"
            type="file"
            accept=".pdf,.ppt,.pptx,.txt"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent/90"
          />
        </div>
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Generating flashcards... This may take a moment.
          </div>
        )}
      </div>
    </div>
  );
};
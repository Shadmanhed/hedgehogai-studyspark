import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { useQuery } from "@tanstack/react-query";

interface Flashcard {
  id: string;
  front_content: string;
  back_content: string;
  created_at: string;
}

export const FlashcardMaker = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [showBack, setShowBack] = useState<Record<string, boolean>>({});

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

      // Refresh the flashcards list
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
      setFile(null);
    }
  };

  const toggleFlashcard = (id: string) => {
    setShowBack(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-8">
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

      {flashcards && flashcards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Your Flashcards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((flashcard) => (
              <Card 
                key={flashcard.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => toggleFlashcard(flashcard.id)}
              >
                <div className="min-h-[150px] flex items-center justify-center text-center">
                  {showBack[flashcard.id] ? (
                    <p>{flashcard.back_content}</p>
                  ) : (
                    <p>{flashcard.front_content}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Click to flip
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
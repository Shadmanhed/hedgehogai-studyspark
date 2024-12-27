import { Input } from "./ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadSectionProps {
  onSummaryGenerated: (summary: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const FileUploadSection = ({ onSummaryGenerated, setIsLoading }: FileUploadSectionProps) => {
  const [file, setFile] = useState<File | null>(null);
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
      console.log('Uploading file...');
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

      console.log('Processing file for summarization...');
      const { data: summaryResponse, error: summaryError } = await supabase.functions.invoke('summarize', {
        body: { fileUrl: publicUrl },
      });

      if (summaryError) throw summaryError;

      onSummaryGenerated(summaryResponse.summary);
      
      toast({
        title: "Success",
        description: "File uploaded and processed successfully!",
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
        Upload Document (PDF, PowerPoint, or Text file)
      </label>
      <div className="min-h-[2.5rem] w-full">
        <Input
          id="file-upload"
          type="file"
          accept=".pdf,.ppt,.pptx,.txt"
          onChange={handleFileUpload}
          className="w-full h-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent/90 cursor-pointer"
        />
      </div>
    </div>
  );
};
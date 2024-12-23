import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "./ui/input";

export const NoteSummarizer = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
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
    
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', file);

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

      // Now process the file for summarization
      const { data: summaryResponse, error: summaryError } = await supabase.functions.invoke('summarize', {
        body: { fileUrl: publicUrl },
      });

      if (summaryError) throw summaryError;

      setText(summaryResponse.summary);
      
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
    }
  };

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to summarize",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Getting user...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      console.log('User authenticated:', user.id);

      console.log('Calling summarize function...');
      const { data: summaryResponse, error: summaryError } = await supabase.functions.invoke('summarize', {
        body: { text },
      });

      if (summaryError) {
        console.error('Summary error:', summaryError);
        throw summaryError;
      }
      console.log('Summary generated:', summaryResponse);

      // Save the summary to the database
      console.log('Saving summary to database...');
      const { error: dbError } = await supabase.from('summaries').insert({
        user_id: user.id,
        original_text: text,
        summary: summaryResponse.summary,
        title: text.split('\n')[0].substring(0, 50) // Use first line as title
      });

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      toast({
        title: "Success",
        description: "Your notes have been summarized and saved!",
      });

      setText("");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to summarize notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Upload or Enter Text</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
            Upload Document (PDF, PowerPoint, or Text file)
          </label>
          <Input
            id="file-upload"
            type="file"
            accept=".pdf,.ppt,.pptx,.txt"
            onChange={handleFileUpload}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent/90"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">Or enter text manually</span>
          </div>
        </div>
        <Textarea
          placeholder="Paste your notes here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px]"
        />
        <Button 
          onClick={handleSummarize} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            'Summarize Notes'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
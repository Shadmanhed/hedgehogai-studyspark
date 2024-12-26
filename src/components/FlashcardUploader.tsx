import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

interface FlashcardUploaderProps {
  isLoading: boolean;
  onFileUpload: (file: File) => void;
}

export const FlashcardUploader = ({ isLoading, onFileUpload }: FlashcardUploaderProps) => {
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    onFileUpload(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium mb-1">
          Upload Document (PDF, PowerPoint, or Text file)
        </label>
        <Input
          id="file-upload"
          type="file"
          accept=".pdf,.ppt,.pptx,.txt"
          onChange={handleFileChange}
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
  );
};
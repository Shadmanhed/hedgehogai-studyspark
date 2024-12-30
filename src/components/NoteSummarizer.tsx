import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileUploadSection } from "./FileUploadSection";
import { TextInputSection } from "./TextInputSection";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";

export const NoteSummarizer = () => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSummaryGenerated = (generatedSummary: string) => {
    setSummary(generatedSummary);
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Upload or Enter Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploadSection 
            onSummaryGenerated={handleSummaryGenerated}
            setIsLoading={setIsLoading}
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or enter text manually</span>
            </div>
          </div>
          <TextInputSection 
            text=""
            setText={() => {}}
            isLoading={isLoading}
            onSummaryGenerated={handleSummaryGenerated}
          />
        </CardContent>
      </Card>

      {summary && (
        <Card className="w-full max-w-3xl mx-auto animate-fade-up">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Summary Output</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {summary}
                </p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileUploadSection } from "./FileUploadSection";
import { TextInputSection } from "./TextInputSection";

export const NoteSummarizer = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSummaryGenerated = (summary: string) => {
    setText(summary);
  };

  return (
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
          text={text}
          setText={setText}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};
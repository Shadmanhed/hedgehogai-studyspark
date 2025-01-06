import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileUploadSection } from "./FileUploadSection";
import { TextInputSection } from "./TextInputSection";
import { ScrollArea } from "./ui/scroll-area";

export const NoteSummarizer = () => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");

  const handleSummaryGenerated = (generatedSummary: string) => {
    setSummary(generatedSummary);
  };

  const formatSummaryContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.trim().startsWith('•')) {
        const listItems = paragraph.split('\n').map(item => item.trim());
        return (
          <div key={index} className="mb-6">
            <ul className="space-y-3 list-disc pl-6">
              {listItems.map((item, i) => (
                <li key={i} className="text-lg leading-relaxed text-gray-700">
                  {item.replace('•', '').trim()}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      return (
        <p key={index} className="text-lg leading-relaxed text-gray-700 mb-6">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center gradient-text">
            Upload or Enter Text
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUploadSection 
            onSummaryGenerated={handleSummaryGenerated}
            setIsLoading={setIsLoading}
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Or enter text manually
              </span>
            </div>
          </div>
          <TextInputSection 
            text={text}
            setText={setText}
            isLoading={isLoading}
            onSummaryGenerated={handleSummaryGenerated}
          />
        </CardContent>
      </Card>

      {summary && (
        <Card className="w-full max-w-4xl mx-auto animate-fade-up">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center gradient-text">
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] rounded-md border p-8 bg-white/50 backdrop-blur-sm">
              <div className="prose prose-lg max-w-none">
                {formatSummaryContent(summary)}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
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

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center gradient-text">Upload or Enter Text</CardTitle>
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
              <span className="px-2 bg-background text-muted-foreground">Or enter text manually</span>
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
        <Card className="w-full max-w-3xl mx-auto animate-fade-up">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center gradient-text">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] rounded-md border p-6 bg-white/50 backdrop-blur-sm">
              <div className="prose prose-lg max-w-none">
                {summary.split('\n\n').map((paragraph, index) => (
                  <div key={index} className="mb-4">
                    {paragraph.startsWith('•') ? (
                      <ul className="list-disc pl-4">
                        {paragraph.split('\n').map((item, i) => (
                          <li key={i} className="text-lg leading-relaxed">
                            {item.replace('•', '').trim()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-lg leading-relaxed">{paragraph}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
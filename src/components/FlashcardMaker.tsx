import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { FileUploadSection } from "./flashcard/FileUploadSection";
import { DeckSection } from "./flashcard/DeckSection";
import { FlashcardList } from "./flashcard/FlashcardList";

export const FlashcardMaker = () => {
  return (
    <FlashcardProvider>
      <div className="space-y-8">
        <FileUploadSection />
        <DeckSection />
        <FlashcardList />
      </div>
    </FlashcardProvider>
  );
};
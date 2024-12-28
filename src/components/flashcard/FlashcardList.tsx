import { Flashcard } from "../Flashcard";
import { useFlashcards } from "@/contexts/FlashcardContext";

export const FlashcardList = () => {
  const { flashcards, handleDelete, handleAddToDeck } = useFlashcards();

  if (!flashcards?.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Your Flashcards</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map((flashcard) => (
          <Flashcard
            key={flashcard.id}
            id={flashcard.id}
            frontContent={flashcard.front_content}
            backContent={flashcard.back_content}
            onDelete={handleDelete}
            onAddToDeck={handleAddToDeck}
          />
        ))}
      </div>
    </div>
  );
};
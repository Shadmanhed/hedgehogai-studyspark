import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface FlashcardProps {
  id: string;
  frontContent: string;
  backContent: string;
  onDelete: (id: string) => void;
  onAddToDeck: (id: string) => void;
}

export const Flashcard = ({ id, frontContent, backContent, onDelete, onAddToDeck }: FlashcardProps) => {
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="relative group">
      <Card 
        className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowBack(!showBack)}
      >
        <div className="min-h-[150px] flex items-center justify-center text-center">
          {showBack ? (
            <p>{backContent}</p>
          ) : (
            <p>{frontContent}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Click to flip
        </p>
      </Card>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="destructive"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="mr-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAddToDeck(id);
          }}
        >
          Add to Deck
        </Button>
      </div>
    </div>
  );
};
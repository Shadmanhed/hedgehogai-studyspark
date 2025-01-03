import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Trash2, RotateCcw } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDeletedFlashcards } from "@/contexts/DeletedFlashcardsContext";

interface FlashcardProps {
  id: string;
  frontContent: string;
  backContent: string;
  onDelete: (id: string) => void;
  onAddToDeck: (id: string, deckId: string) => void;
  hideAddToDeck?: boolean;
  isDeleted?: boolean;
}

export const Flashcard = ({ 
  id, 
  frontContent, 
  backContent, 
  onDelete, 
  onAddToDeck,
  hideAddToDeck = false,
  isDeleted = false
}: FlashcardProps) => {
  const [showBack, setShowBack] = useState(false);
  const { restoreFlashcard } = useDeletedFlashcards();

  const { data: decks } = useQuery({
    queryKey: ['decks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleRestore = async () => {
    await restoreFlashcard({
      id,
      front_content: frontContent,
      back_content: backContent,
      created_at: new Date().toISOString(),
    });
  };

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
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        {isDeleted ? (
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleRestore();
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button
              variant="destructive"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {!hideAddToDeck && (
              <Select
                onValueChange={(deckId) => {
                  onAddToDeck(id, deckId);
                }}
              >
                <SelectTrigger className="w-[140px] bg-white" onClick={(e) => e.stopPropagation()}>
                  <SelectValue placeholder="Add to deck" />
                </SelectTrigger>
                <SelectContent>
                  {decks?.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </>
        )}
      </div>
    </div>
  );
};
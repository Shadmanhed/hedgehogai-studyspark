import { Flashcard } from "../Flashcard";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FolderPlus, Trash2 } from "lucide-react";

export const FlashcardList = () => {
  const { flashcards, handleDelete, handleAddToDeck } = useFlashcards();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const { toast } = useToast();

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

  const handleSelectAll = () => {
    if (selectedCards.length === flashcards?.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(flashcards?.map(card => card.id) || []);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      for (const cardId of selectedCards) {
        await handleDelete(cardId);
      }
      
      toast({
        title: "Success",
        description: `Deleted ${selectedCards.length} flashcards!`,
      });
      
      setSelectedCards([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete flashcards",
        variant: "destructive",
      });
    }
  };

  const handleAddSelectedToDeck = async (deckId: string) => {
    try {
      const promises = selectedCards.map(cardId => handleAddToDeck(cardId, deckId));
      await Promise.all(promises);
      
      toast({
        title: "Success",
        description: `Added ${selectedCards.length} flashcards to deck!`,
      });
      
      setSelectedCards([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add flashcards to deck",
        variant: "destructive",
      });
    }
  };

  const toggleCardSelection = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  if (!flashcards?.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Your Flashcards</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="whitespace-nowrap"
          >
            {selectedCards.length === flashcards.length ? "Deselect All" : "Select All"}
          </Button>
          {selectedCards.length > 0 && (
            <>
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </Button>
              <Select onValueChange={handleAddSelectedToDeck}>
                <SelectTrigger className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <FolderPlus className="h-4 w-4" />
                    <SelectValue placeholder="Add selected to deck" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {decks?.map((deck) => (
                    <SelectItem 
                      key={deck.id} 
                      value={deck.id}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map((flashcard) => (
          <div 
            key={flashcard.id} 
            className={`relative ${selectedCards.includes(flashcard.id) ? 'ring-2 ring-primary rounded-lg' : ''}`}
          >
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedCards.includes(flashcard.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCards(prev => [...prev, flashcard.id]);
                  } else {
                    setSelectedCards(prev => prev.filter(id => id !== flashcard.id));
                  }
                }}
                className="bg-white border-2 h-5 w-5"
              />
            </div>
            <Flashcard
              id={flashcard.id}
              frontContent={flashcard.front_content}
              backContent={flashcard.back_content}
              onDelete={handleDelete}
              onAddToDeck={handleAddToDeck}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
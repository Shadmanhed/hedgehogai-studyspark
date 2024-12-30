import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

export const DeckManager = () => {
  const [newDeckName, setNewDeckName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: decks, refetch: refetchDecks } = useQuery({
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

  const handleCreateDeck = async () => {
    try {
      if (!newDeckName.trim()) {
        toast({
          title: "Error",
          description: "Please enter a deck name",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('decks')
        .insert([{
          user_id: user.id,
          name: newDeckName.trim(),
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deck created successfully!",
      });

      setNewDeckName("");
      refetchDecks();
    } catch (error) {
      console.error('Error creating deck:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create deck",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deck deleted successfully!",
      });

      refetchDecks();
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete deck",
        variant: "destructive",
      });
    }
  };

  const handleDeckClick = (deckId: string) => {
    navigate(`/flashcards/deck/${deckId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter deck name"
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleCreateDeck();
            }
          }}
        />
        <Button onClick={handleCreateDeck}>Create Deck</Button>
      </div>

      {decks && decks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <div key={deck.id} className="relative group">
              <Button
                variant="outline"
                className="w-full h-auto py-4 px-6 text-left flex flex-col items-start"
                onClick={() => handleDeckClick(deck.id)}
              >
                <span className="font-semibold">{deck.name}</span>
                <span className="text-sm text-muted-foreground">
                  Created {new Date(deck.created_at).toLocaleDateString()}
                </span>
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDeck(deck.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface Deck {
  id: string;
  name: string;
  created_at: string;
}

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
      return data as Deck[];
    }
  });

  const createDeck = async () => {
    if (!newDeckName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a deck name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('decks')
        .insert([{ name: newDeckName.trim(), user_id: user.id }]);

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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter deck name"
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
        />
        <Button onClick={createDeck}>Create Deck</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks?.map((deck) => (
          <Card 
            key={deck.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/flashcards/deck/${deck.id}`)}
          >
            <h3 className="font-semibold">{deck.name}</h3>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(deck.created_at).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
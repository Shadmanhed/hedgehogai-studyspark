import { DeckManager } from "../DeckManager";

export const DeckSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Manage Decks</h3>
      <DeckManager />
    </div>
  );
};
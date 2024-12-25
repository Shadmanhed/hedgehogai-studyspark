import { FlashcardMaker } from "@/components/FlashcardMaker";
import { Navbar } from "@/components/Navbar";

const FlashcardMakerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Flashcard Maker</h1>
        <FlashcardMaker />
      </main>
    </div>
  );
};

export default FlashcardMakerPage;
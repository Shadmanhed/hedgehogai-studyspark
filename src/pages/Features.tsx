import { Navbar } from "@/components/Navbar";
import { Brain, BookOpen, GraduationCap } from "lucide-react";

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Our Features</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="feature-card p-6 rounded-lg shadow-lg bg-white">
            <BookOpen className="w-12 h-12 text-secondary mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Note Summarizer</h3>
            <p className="text-muted-foreground mb-4">
              Upload your notes and get concise, easy-to-review summaries instantly.
              Perfect for quick revision and study preparation.
            </p>
          </div>

          <div className="feature-card p-6 rounded-lg shadow-lg bg-white">
            <Brain className="w-12 h-12 text-secondary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Flashcard Generator</h3>
            <p className="text-muted-foreground mb-4">
              Create effective flashcards automatically from your study materials.
              Enhance your memory retention with spaced repetition.
            </p>
          </div>

          <div className="feature-card p-6 rounded-lg shadow-lg bg-white">
            <GraduationCap className="w-12 h-12 text-secondary mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Teacher</h3>
            <p className="text-muted-foreground mb-4">
              Get personalized explanations and answers to your questions 24/7.
              Like having a tutor available whenever you need help.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Features;
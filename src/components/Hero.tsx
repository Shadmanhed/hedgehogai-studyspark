import { GraduationCap, BookOpen, Brain } from "lucide-react";
import { Button } from "./ui/button";

export const Hero = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-primary to-white">
      <div className="text-center max-w-4xl mx-auto animate-fade-up">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text tracking-normal leading-tight">
          Study Smarter with HedgehogAI
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Enhance your learning with AI-powered study tools. Get precise summaries,
          effective flashcards, and expert tutoring - all tailored to your needs.
        </p>
        <Button
          size="lg"
          className="bg-accent hover:bg-accent/90 text-white rounded-full px-8"
        >
          Get Started
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-6xl mx-auto p-4">
        <div className="feature-card animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <BookOpen className="w-12 h-12 text-secondary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Advanced Note Summarizer</h3>
          <p className="text-muted-foreground">
            Transform your study materials into clear, comprehensive summaries that retain key academic concepts and important details.
          </p>
        </div>

        <div className="feature-card animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Brain className="w-12 h-12 text-secondary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Smart Flashcard Creator</h3>
          <p className="text-muted-foreground">
            Generate well-structured flashcards that highlight essential concepts and help reinforce your understanding effectively.
          </p>
        </div>

        <div className="feature-card animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <GraduationCap className="w-12 h-12 text-secondary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Intelligent AI Teacher</h3>
          <p className="text-muted-foreground">
            Get detailed explanations and step-by-step guidance tailored to your learning style and academic level.
          </p>
        </div>
      </div>
    </div>
  );
};
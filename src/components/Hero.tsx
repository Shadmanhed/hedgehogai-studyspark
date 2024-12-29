import { GraduationCap, BookOpen, Brain } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export const Hero = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-primary to-white">
      <div className="text-center max-w-4xl mx-auto animate-fade-up">
        <h1 className="text-3xl md:text-6xl font-bold mb-6 gradient-text tracking-normal leading-relaxed py-2 px-4">
          Study Smarter with HedgehogAI
        </h1>
        <p className="text-base md:text-xl text-muted-foreground mb-8 px-4">
          Transform your learning experience with our AI-powered study tools. Whether you're preparing for exams,
          learning new concepts, or reviewing materials, HedgehogAI helps you study more efficiently and effectively.
        </p>
        <Button
          size="lg"
          className="bg-accent hover:bg-accent/90 text-white rounded-full px-8"
          onClick={handleGetStarted}
        >
          Get Started
        </Button>
      </div>

      <div 
        ref={featuresRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-6xl mx-auto p-4"
      >
        <div 
          className="feature-card animate-fade-up cursor-pointer hover:shadow-xl transition-all" 
          style={{ animationDelay: "0.1s" }}
          onClick={() => navigate("/summarizer")}
        >
          <BookOpen className="w-12 h-12 text-secondary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Advanced Note Summarizer</h3>
          <p className="text-muted-foreground">
            Transform lengthy study materials into clear, comprehensive summaries. Our AI analyzes your content,
            extracts key concepts, and creates well-structured summaries perfect for quick revision and deep understanding.
          </p>
        </div>

        <div 
          className="feature-card animate-fade-up cursor-pointer hover:shadow-xl transition-all" 
          style={{ animationDelay: "0.2s" }}
          onClick={() => navigate("/flashcards")}
        >
          <Brain className="w-12 h-12 text-secondary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Smart Flashcard Creator</h3>
          <p className="text-muted-foreground">
            Automatically generate effective study flashcards from your documents. Our AI identifies important concepts,
            creates question-answer pairs, and helps you organize them into customized decks for optimal learning.
          </p>
        </div>

        <div 
          className="feature-card animate-fade-up cursor-pointer hover:shadow-xl transition-all" 
          style={{ animationDelay: "0.3s" }}
          onClick={() => navigate("/ai-teacher")}
        >
          <GraduationCap className="w-12 h-12 text-secondary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Intelligent AI Teacher</h3>
          <p className="text-muted-foreground">
            Get personalized explanations and instant answers to your academic questions. Our AI teacher provides
            detailed, step-by-step guidance, helping you understand complex topics at your own pace.
          </p>
        </div>
      </div>

      <div className="mt-16 text-center max-w-4xl mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold mb-6">Why Choose HedgehogAI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-lg bg-white shadow-lg">
            <h3 className="text-xl font-semibold mb-3">Time-Saving</h3>
            <p className="text-muted-foreground">
              Cut down study preparation time by up to 50% with our AI-powered tools that automate note-taking and flashcard creation.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-lg">
            <h3 className="text-xl font-semibold mb-3">Comprehensive Learning</h3>
            <p className="text-muted-foreground">
              Our AI ensures no important concept is missed, creating thorough summaries and flashcards that cover all key points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
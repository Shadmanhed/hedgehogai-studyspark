import { Navbar } from "@/components/Navbar";
import { Steps } from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-center mb-12">How It Works</h1>
        
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">1. Sign Up</h2>
              <p className="text-muted-foreground">
                Create your account to get started with all our AI-powered study tools.
                Your progress and materials will be saved securely.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">2. Choose Your Tool</h2>
              <p className="text-muted-foreground">
                Select from our range of study tools: AI Note Summarizer, Flashcard Generator,
                or AI Teacher. Each tool is designed to help you study more effectively.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">3. Upload or Input</h2>
              <p className="text-muted-foreground">
                Upload your study materials or input your questions. Our AI will process
                your content and provide you with helpful summaries, flashcards, or answers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">4. Study and Review</h2>
              <p className="text-muted-foreground">
                Use the generated materials to study effectively. Review your flashcards,
                read through summaries, or get help from our AI Teacher whenever needed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HowItWorks;
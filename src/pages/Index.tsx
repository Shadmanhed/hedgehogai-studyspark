import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Button 
              onClick={() => navigate('/summarizer')}
              className="bg-accent hover:bg-accent/90 text-white px-8 py-4 text-lg"
            >
              Try AI Note Summarizer
            </Button>
            
            <div className="mt-8">
              <PomodoroTimer />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
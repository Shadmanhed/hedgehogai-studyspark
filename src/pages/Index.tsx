import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PomodoroTimer } from "@/components/PomodoroTimer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
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
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
          <PomodoroTimer />
        </section>
      </main>
    </div>
  );
};

export default Index;
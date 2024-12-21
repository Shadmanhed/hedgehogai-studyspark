import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Hero />
      </main>
    </div>
  );
};

export default Index;
import { NoteSummarizer } from "@/components/NoteSummarizer";
import { Navbar } from "@/components/Navbar";

const Summarizer = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">AI Note Summarizer</h1>
        <NoteSummarizer />
      </main>
    </div>
  );
};

export default Summarizer;
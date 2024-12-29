import { Navbar } from "@/components/Navbar";
import { PomodoroTimer as Timer } from "@/components/PomodoroTimer";

const PomodoroTimer = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Timer</h1>
        <div className="max-w-4xl mx-auto">
          <Timer />
        </div>
      </main>
    </div>
  );
};

export default PomodoroTimer;
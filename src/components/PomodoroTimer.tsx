import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Bell, Pause, Play, RotateCcw } from "lucide-react";
import { useToast } from "./ui/use-toast";

export const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const { toast } = useToast();

  const totalTime = 25 * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          setProgress((newTime / totalTime) * 100);
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      toast({
        title: "Time's up!",
        description: "Take a 5-minute break before starting your next session.",
        duration: 5000,
      });
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, toast]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    console.log("Timer toggled:", !isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
    setProgress(100);
    console.log("Timer reset");
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-2xl shadow-lg animate-fade-up">
      <h3 className="text-2xl font-heading font-bold mb-4 gradient-text">
        Pomodoro Study Timer
      </h3>
      <div className="mb-6">
        <Progress value={progress} className="h-3" />
      </div>
      <div className="text-4xl font-bold mb-6 text-accent">
        {formatTime(timeLeft)}
      </div>
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTimer}
          className="w-12 h-12 rounded-full"
        >
          {isRunning ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="w-12 h-12 rounded-full"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
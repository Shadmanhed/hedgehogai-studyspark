import { formatTime } from "@/lib/utils";
import { Progress } from "../ui/progress";

interface TimerDisplayProps {
  mode: "pomodoro" | "stopwatch";
  timeLeft: number;
  stopwatchTime: number;
  progress: number;
}

export const TimerDisplay = ({
  mode,
  timeLeft,
  stopwatchTime,
  progress,
}: TimerDisplayProps) => {
  return (
    <div className="text-center">
      {mode === "pomodoro" && (
        <div className="mb-6">
          <Progress value={progress} className="h-3" />
        </div>
      )}
      <div className="text-4xl font-bold mb-6 text-accent">
        {mode === "pomodoro" ? formatTime(timeLeft) : formatTime(stopwatchTime)}
      </div>
    </div>
  );
};
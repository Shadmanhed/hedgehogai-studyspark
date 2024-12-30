import { Button } from "../ui/button";
import { Timer, Watch, Pause, Play, RotateCcw } from "lucide-react";

interface TimerControlsProps {
  mode: "pomodoro" | "stopwatch";
  isRunning: boolean;
  onModeSwitch: (mode: "pomodoro" | "stopwatch") => void;
  onToggle: () => void;
  onReset: () => void;
}

export const TimerControls = ({
  mode,
  isRunning,
  onModeSwitch,
  onToggle,
  onReset,
}: TimerControlsProps) => {
  return (
    <>
      <div className="flex gap-4 justify-center mb-6">
        <Button
          variant={mode === "pomodoro" ? "default" : "outline"}
          onClick={() => onModeSwitch("pomodoro")}
          className="gap-2"
        >
          <Timer className="h-4 w-4" />
          Pomodoro
        </Button>
        <Button
          variant={mode === "stopwatch" ? "default" : "outline"}
          onClick={() => onModeSwitch("stopwatch")}
          className="gap-2"
        >
          <Watch className="h-4 w-4" />
          Stopwatch
        </Button>
      </div>
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
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
          onClick={onReset}
          className="w-12 h-12 rounded-full"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
};
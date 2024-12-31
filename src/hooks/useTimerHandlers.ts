import { useToast } from "@/components/ui/use-toast";
import { useTimer } from "./useTimer";

export const useTimerHandlers = () => {
  const { timerState, updateTimer, saveStudySession } = useTimer();
  const { toast } = useToast();
  const totalTime = 25 * 60;
  const breakTime = 5 * 60;

  const handleTimeUp = () => {
    if (timerState.timeLeft === 0 && timerState.isRunning) {
      updateTimer({ isRunning: false });
      
      if (timerState.mode === "pomodoro") {
        saveStudySession(totalTime, "pomodoro");
        updateTimer({
          mode: "break",
          timeLeft: breakTime,
          progress: 100,
          isRunning: true
        });
        toast({
          title: "Time's up!",
          description: "Starting your 5-minute break.",
          duration: 5000,
        });
      } else if (timerState.mode === "break") {
        updateTimer({
          mode: "pomodoro",
          timeLeft: totalTime,
          progress: 100,
        });
        toast({
          title: "Break finished!",
          description: "Ready to start your next Pomodoro session?",
          duration: 5000,
        });
      }
    }
  };

  const handleTimerToggle = () => {
    updateTimer({ isRunning: !timerState.isRunning });
    console.log("Timer toggled:", !timerState.isRunning);
  };

  const handleTimerReset = () => {
    if (timerState.isRunning) {
      if (timerState.mode === "pomodoro") {
        saveStudySession(totalTime - timerState.timeLeft, "pomodoro");
      } else if (timerState.mode === "stopwatch") {
        saveStudySession(timerState.stopwatchTime, "stopwatch");
      }
    }
    updateTimer({
      isRunning: false,
      timeLeft: timerState.mode === "pomodoro" ? totalTime : timerState.mode === "break" ? breakTime : timerState.timeLeft,
      progress: timerState.mode === "pomodoro" || timerState.mode === "break" ? 100 : timerState.progress,
      stopwatchTime: timerState.mode === "stopwatch" ? 0 : timerState.stopwatchTime,
    });
    console.log("Timer reset");
  };

  const handleModeSwitch = (newMode: "pomodoro" | "stopwatch") => {
    if (timerState.isRunning) {
      if (timerState.mode === "pomodoro") {
        saveStudySession(totalTime - timerState.timeLeft, "pomodoro");
      } else if (timerState.mode === "stopwatch") {
        saveStudySession(timerState.stopwatchTime, "stopwatch");
      }
    }

    const currentIsRunning = timerState.isRunning;
    
    updateTimer({
      mode: newMode,
      isRunning: currentIsRunning,
      timeLeft: newMode === "pomodoro" ? totalTime : timerState.timeLeft,
      progress: newMode === "pomodoro" ? 100 : timerState.progress,
      stopwatchTime: newMode === "stopwatch" ? timerState.stopwatchTime : 0,
    });
  };

  return {
    handleTimeUp,
    handleTimerToggle,
    handleTimerReset,
    handleModeSwitch,
    timerState,
  };
};
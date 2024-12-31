import { useEffect } from "react";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { TimerDisplay } from "./timer/TimerDisplay";
import { TimerControls } from "./timer/TimerControls";
import { StudySessionsTable } from "./timer/StudySessionsTable";
import { useTimer } from "@/hooks/useTimer";

export const PomodoroTimer = () => {
  const { timerState, updateTimer, saveStudySession } = useTimer();
  const { toast } = useToast();
  const totalTime = 25 * 60;
  const breakTime = 5 * 60;

  const { data: studySessions = [] } = useQuery({
    queryKey: ["study-sessions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
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
  }, [timerState.timeLeft, timerState.isRunning, timerState.mode]);

  const toggleTimer = () => {
    updateTimer({ isRunning: !timerState.isRunning });
    console.log("Timer toggled:", !timerState.isRunning);
  };

  const resetTimer = () => {
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

  const switchMode = (newMode: "pomodoro" | "stopwatch") => {
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

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-2xl shadow-lg animate-fade-up">
        <h3 className="text-2xl font-heading font-bold mb-4 gradient-text">
          {timerState.mode === "pomodoro" ? "Pomodoro Timer" : 
           timerState.mode === "break" ? "Break Time" : "Stopwatch"}
        </h3>
        
        <TimerDisplay
          mode={timerState.mode}
          timeLeft={timerState.timeLeft}
          stopwatchTime={timerState.stopwatchTime}
          progress={timerState.progress}
        />
        
        <TimerControls
          mode={timerState.mode}
          isRunning={timerState.isRunning}
          onModeSwitch={switchMode}
          onToggle={toggleTimer}
          onReset={resetTimer}
        />
      </div>

      <StudySessionsTable sessions={studySessions} />
    </div>
  );
};
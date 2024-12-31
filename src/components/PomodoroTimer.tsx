import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { TimerDisplay } from "./timer/TimerDisplay";
import { TimerControls } from "./timer/TimerControls";
import { StudySessionsTable } from "./timer/StudySessionsTable";
import { useTimerHandlers } from "@/hooks/useTimerHandlers";

export const PomodoroTimer = () => {
  const {
    timerState,
    handleTimeUp,
    handleTimerToggle,
    handleTimerReset,
    handleModeSwitch,
  } = useTimerHandlers();

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
    handleTimeUp();
  }, [timerState.timeLeft, timerState.isRunning, timerState.mode]);

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
          onModeSwitch={handleModeSwitch}
          onToggle={handleTimerToggle}
          onReset={handleTimerReset}
        />
      </div>

      <StudySessionsTable sessions={studySessions} />
    </div>
  );
};
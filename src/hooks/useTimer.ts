import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  progress: number;
  mode: "pomodoro" | "stopwatch";
  stopwatchTime: number;
  lastUpdated: number;
}

const TIMER_KEY = "timer-state";
const TOTAL_TIME = 25 * 60;

const getInitialState = (): TimerState => ({
  timeLeft: TOTAL_TIME,
  isRunning: false,
  progress: 100,
  mode: "pomodoro",
  stopwatchTime: 0,
  lastUpdated: Date.now(),
});

export const useTimer = () => {
  const queryClient = useQueryClient();

  const { data: timerState = getInitialState() } = useQuery({
    queryKey: [TIMER_KEY],
    queryFn: () => {
      const stored = localStorage.getItem(TIMER_KEY);
      if (!stored) return getInitialState();
      
      const state: TimerState = JSON.parse(stored);
      if (state.isRunning) {
        const elapsed = Math.floor((Date.now() - state.lastUpdated) / 1000);
        if (state.mode === "pomodoro") {
          state.timeLeft = Math.max(0, state.timeLeft - elapsed);
          state.progress = (state.timeLeft / TOTAL_TIME) * 100;
        } else {
          state.stopwatchTime += elapsed;
        }
      }
      return state;
    },
    refetchInterval: 1000,
  });

  const mutation = useMutation({
    mutationFn: async (newState: TimerState) => {
      newState.lastUpdated = Date.now();
      localStorage.setItem(TIMER_KEY, JSON.stringify(newState));
      return newState;
    },
    onSuccess: (newState) => {
      queryClient.setQueryData([TIMER_KEY], newState);
    },
  });

  const saveStudySession = async (duration: number, sessionType: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No user found");
      return;
    }

    try {
      const { error } = await supabase.from("study_sessions").insert({
        duration,
        session_type: sessionType,
        user_id: user.id,
      });

      if (error) throw error;
      console.log("Study session saved:", { duration, sessionType, userId: user.id });
    } catch (error) {
      console.error("Error saving study session:", error);
    }
  };

  return {
    timerState,
    updateTimer: (newState: Partial<TimerState>) => {
      mutation.mutate({
        ...timerState,
        ...newState,
      });
    },
    saveStudySession,
  };
};
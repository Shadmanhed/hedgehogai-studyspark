import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  progress: number;
  mode: "pomodoro" | "stopwatch" | "break";
  stopwatchTime: number;
  lastUpdated: number;
}

const TIMER_KEY = "timer-state";
const TOTAL_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const getInitialState = (): TimerState => ({
  timeLeft: TOTAL_TIME,
  isRunning: false,
  progress: 100,
  mode: "pomodoro",
  stopwatchTime: 0,
  lastUpdated: Date.now(),
});

export const useTimerState = () => {
  const queryClient = useQueryClient();

  const { data: timerState = getInitialState() } = useQuery({
    queryKey: [TIMER_KEY],
    queryFn: () => {
      const stored = localStorage.getItem(TIMER_KEY);
      if (!stored) return getInitialState();
      
      const state: TimerState = JSON.parse(stored);
      if (state.isRunning) {
        const elapsed = Math.floor((Date.now() - state.lastUpdated) / 1000);
        if (state.mode === "pomodoro" || state.mode === "break") {
          state.timeLeft = Math.max(0, state.timeLeft - elapsed);
          state.progress = (state.timeLeft / (state.mode === "pomodoro" ? TOTAL_TIME : BREAK_TIME)) * 100;
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

  return {
    timerState,
    updateTimer: (newState: Partial<TimerState>) => {
      mutation.mutate({
        ...timerState,
        ...newState,
      });
    },
  };
};
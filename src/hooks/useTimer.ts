import { useTimerState } from "./useTimerState";
import { useStudySessions } from "./useStudySessions";

export const useTimer = () => {
  const { timerState, updateTimer } = useTimerState();
  const { saveStudySession } = useStudySessions();

  return {
    timerState,
    updateTimer,
    saveStudySession,
  };
};
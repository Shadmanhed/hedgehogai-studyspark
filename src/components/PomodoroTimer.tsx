import { useEffect } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Bell, Pause, Play, RotateCcw, Timer, Watch } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { format } from "date-fns";
import { useTimer } from "@/hooks/useTimer";
import { useQuery } from "@tanstack/react-query";

export const PomodoroTimer = () => {
  const { timerState, updateTimer, saveStudySession } = useTimer();
  const { toast } = useToast();
  const totalTime = 25 * 60;

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
    if (timerState.mode === "pomodoro" && timerState.timeLeft === 0 && timerState.isRunning) {
      updateTimer({ isRunning: false });
      saveStudySession(totalTime, "pomodoro");
      toast({
        title: "Time's up!",
        description: "Take a 5-minute break before starting your next session.",
        duration: 5000,
      });
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
      } else {
        saveStudySession(timerState.stopwatchTime, "stopwatch");
      }
    }
    updateTimer({
      isRunning: false,
      timeLeft: timerState.mode === "pomodoro" ? totalTime : timerState.timeLeft,
      progress: timerState.mode === "pomodoro" ? 100 : timerState.progress,
      stopwatchTime: timerState.mode === "stopwatch" ? 0 : timerState.stopwatchTime,
    });
    console.log("Timer reset");
  };

  const switchMode = (newMode: "pomodoro" | "stopwatch") => {
    if (timerState.isRunning) {
      if (timerState.mode === "pomodoro") {
        saveStudySession(totalTime - timerState.timeLeft, "pomodoro");
      } else {
        saveStudySession(timerState.stopwatchTime, "stopwatch");
      }
    }
    updateTimer({
      mode: newMode,
      isRunning: false,
      timeLeft: newMode === "pomodoro" ? totalTime : timerState.timeLeft,
      progress: newMode === "pomodoro" ? 100 : timerState.progress,
      stopwatchTime: newMode === "stopwatch" ? 0 : timerState.stopwatchTime,
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex gap-4 justify-center mb-6">
        <Button
          variant={timerState.mode === "pomodoro" ? "default" : "outline"}
          onClick={() => switchMode("pomodoro")}
          className="gap-2"
        >
          <Timer className="h-4 w-4" />
          Pomodoro
        </Button>
        <Button
          variant={timerState.mode === "stopwatch" ? "default" : "outline"}
          onClick={() => switchMode("stopwatch")}
          className="gap-2"
        >
          <Watch className="h-4 w-4" />
          Stopwatch
        </Button>
      </div>

      <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-2xl shadow-lg animate-fade-up">
        <h3 className="text-2xl font-heading font-bold mb-4 gradient-text">
          {timerState.mode === "pomodoro" ? "Pomodoro Timer" : "Stopwatch"}
        </h3>
        {timerState.mode === "pomodoro" && (
          <div className="mb-6">
            <Progress value={timerState.progress} className="h-3" />
          </div>
        )}
        <div className="text-4xl font-bold mb-6 text-accent">
          {timerState.mode === "pomodoro"
            ? formatTime(timerState.timeLeft)
            : formatTime(timerState.stopwatchTime)}
        </div>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTimer}
            className="w-12 h-12 rounded-full"
          >
            {timerState.isRunning ? (
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

      <div className="mt-8">
        <h3 className="text-2xl font-heading font-bold mb-4">Study Sessions</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studySessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    {format(new Date(session.created_at), "PPp")}
                  </TableCell>
                  <TableCell className="capitalize">
                    {session.session_type}
                  </TableCell>
                  <TableCell>{formatTime(session.duration)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
import { useState, useEffect } from "react";
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

export const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [mode, setMode] = useState<"pomodoro" | "stopwatch">("pomodoro");
  const [studySessions, setStudySessions] = useState<any[]>([]);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  const totalTime = 25 * 60;
  const [stopwatchTime, setStopwatchTime] = useState(0);

  useEffect(() => {
    // Get the current user's ID when component mounts
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      console.log("Current user:", user?.id);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchStudySessions();
    }
  }, [userId]);

  const fetchStudySessions = async () => {
    if (!userId) {
      console.log("No user ID available");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudySessions(data || []);
      console.log("Fetched study sessions:", data);
    } catch (error) {
      console.error("Error fetching study sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load study sessions",
        duration: 3000,
      });
    }
  };

  const saveStudySession = async (duration: number, sessionType: string) => {
    if (!userId) {
      console.log("No user ID available");
      toast({
        title: "Error",
        description: "Please log in to save study sessions",
        duration: 3000,
      });
      return;
    }

    try {
      const { error } = await supabase.from("study_sessions").insert({
        duration,
        session_type: sessionType,
        user_id: userId,
      });

      if (error) throw error;
      console.log("Study session saved:", { duration, sessionType, userId });
      fetchStudySessions();
      toast({
        title: "Success",
        description: "Study session saved successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving study session:", error);
      toast({
        title: "Error",
        description: "Failed to save study session",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      if (mode === "pomodoro" && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prev) => {
            const newTime = prev - 1;
            setProgress((newTime / totalTime) * 100);
            return newTime;
          });
        }, 1000);
      } else if (mode === "stopwatch") {
        interval = setInterval(() => {
          setStopwatchTime((prev) => prev + 1);
        }, 1000);
      }
    }

    if (mode === "pomodoro" && timeLeft === 0 && isRunning) {
      setIsRunning(false);
      saveStudySession(totalTime - timeLeft, "pomodoro");
      toast({
        title: "Time's up!",
        description: "Take a 5-minute break before starting your next session.",
        duration: 5000,
      });
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, stopwatchTime, toast]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    console.log("Timer toggled:", !isRunning);
  };

  const resetTimer = () => {
    if (isRunning) {
      if (mode === "pomodoro") {
        saveStudySession(totalTime - timeLeft, "pomodoro");
      } else {
        saveStudySession(stopwatchTime, "stopwatch");
      }
    }
    setIsRunning(false);
    if (mode === "pomodoro") {
      setTimeLeft(25 * 60);
      setProgress(100);
    } else {
      setStopwatchTime(0);
    }
    console.log("Timer reset");
  };

  const switchMode = (newMode: "pomodoro" | "stopwatch") => {
    if (isRunning) {
      if (mode === "pomodoro") {
        saveStudySession(totalTime - timeLeft, "pomodoro");
      } else {
        saveStudySession(stopwatchTime, "stopwatch");
      }
    }
    setMode(newMode);
    setIsRunning(false);
    if (newMode === "pomodoro") {
      setTimeLeft(25 * 60);
      setProgress(100);
    } else {
      setStopwatchTime(0);
    }
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
      {!userId ? (
        <div className="text-center p-4 bg-yellow-100 rounded-lg">
          Please log in to track your study sessions
        </div>
      ) : (
        // ... keep existing code (timer UI and study sessions table)
        <>
          <div className="flex gap-4 justify-center mb-6">
            <Button
              variant={mode === "pomodoro" ? "default" : "outline"}
              onClick={() => switchMode("pomodoro")}
              className="gap-2"
            >
              <Timer className="h-4 w-4" />
              Pomodoro
            </Button>
            <Button
              variant={mode === "stopwatch" ? "default" : "outline"}
              onClick={() => switchMode("stopwatch")}
              className="gap-2"
            >
              <Watch className="h-4 w-4" />
              Stopwatch
            </Button>
          </div>

          <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-2xl shadow-lg animate-fade-up">
            <h3 className="text-2xl font-heading font-bold mb-4 gradient-text">
              {mode === "pomodoro" ? "Pomodoro Timer" : "Stopwatch"}
            </h3>
            {mode === "pomodoro" && (
              <div className="mb-6">
                <Progress value={progress} className="h-3" />
              </div>
            )}
            <div className="text-4xl font-bold mb-6 text-accent">
              {mode === "pomodoro"
                ? formatTime(timeLeft)
                : formatTime(stopwatchTime)}
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
        </>
      )}
    </div>
  );
};

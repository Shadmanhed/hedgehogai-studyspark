import { supabase } from "@/integrations/supabase/client";

export const useStudySessions = () => {
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
    saveStudySession,
  };
};
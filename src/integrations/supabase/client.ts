// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ohvnmllkabnzcjymtsog.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9odm5tbGxrYWJuemNqeW10c29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NzU4NDYsImV4cCI6MjA1MDQ1MTg0Nn0.NCrWPl2IrvYyTLrAXAdTihLtOprOT_fWj-ZW0TzMtUk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
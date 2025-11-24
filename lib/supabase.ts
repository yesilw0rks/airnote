import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnckqafklmlfiwfdjrsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY2txYWZrbG1sZml3ZmRqcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzI0NTMsImV4cCI6MjA3OTIwODQ1M30.Ov2vl_7tOHDaalVirnQ__DudbrEjK8weS6Dh2C5-3JU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://example.supabase.co";

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "public-anon-key";

export const API_URL =
  import.meta.env.VITE_API_URL || `${SUPABASE_URL}/functions/v1/make-server-a694af94`;

const adminEmailsRaw = import.meta.env.VITE_ADMIN_EMAILS || "admin@example.com";

export const ADMIN_EMAILS = new Set(
  adminEmailsRaw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);


-- Add profile fields for onboarding
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profession text,
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text;

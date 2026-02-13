
-- Fix profiles: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Fix doa_entries: drop restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Users CRUD own doa" ON public.doa_entries;

CREATE POLICY "Users CRUD own doa"
  ON public.doa_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also fix all other tables that have the same restrictive-only pattern
DROP POLICY IF EXISTS "Users CRUD own itikaf" ON public.itikaf_rows;
CREATE POLICY "Users CRUD own itikaf"
  ON public.itikaf_rows FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users CRUD own letter" ON public.letter_for_me;
CREATE POLICY "Users CRUD own letter"
  ON public.letter_for_me FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users CRUD own quran entries" ON public.quran_journal_entries;
CREATE POLICY "Users CRUD own quran entries"
  ON public.quran_journal_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users CRUD own settings" ON public.settings;
CREATE POLICY "Users CRUD own settings"
  ON public.settings FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users CRUD own tadabbur" ON public.tadabbur_weeks;
CREATE POLICY "Users CRUD own tadabbur"
  ON public.tadabbur_weeks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users CRUD own checks" ON public.tracker_checks;
CREATE POLICY "Users CRUD own checks"
  ON public.tracker_checks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users CRUD own habits" ON public.tracker_habits;
CREATE POLICY "Users CRUD own habits"
  ON public.tracker_habits FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

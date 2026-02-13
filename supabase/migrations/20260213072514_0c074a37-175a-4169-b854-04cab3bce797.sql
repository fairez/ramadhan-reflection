
-- Add length constraints to all text columns across tables

-- doa_entries
ALTER TABLE public.doa_entries
  ADD CONSTRAINT chk_doa_content_len CHECK (length(content) <= 5000),
  ADD CONSTRAINT chk_doa_category_len CHECK (length(category) <= 200);

-- quran_journal_entries
ALTER TABLE public.quran_journal_entries
  ADD CONSTRAINT chk_qj_title_len CHECK (length(title) <= 200),
  ADD CONSTRAINT chk_qj_content_len CHECK (length(content) <= 10000),
  ADD CONSTRAINT chk_qj_ayah_ref_len CHECK (length(ayah_ref) <= 200);

-- letter_for_me
ALTER TABLE public.letter_for_me
  ADD CONSTRAINT chk_letter_title_len CHECK (length(title) <= 500),
  ADD CONSTRAINT chk_letter_content_len CHECK (length(content) <= 20000);

-- tadabbur_weeks
ALTER TABLE public.tadabbur_weeks
  ADD CONSTRAINT chk_tadabbur_ayat_len CHECK (length(ayat) <= 2000),
  ADD CONSTRAINT chk_tadabbur_tafsir_len CHECK (length(tafsir) <= 5000),
  ADD CONSTRAINT chk_tadabbur_reflection_len CHECK (length(reflection) <= 5000),
  ADD CONSTRAINT chk_tadabbur_apply_len CHECK (length(apply_to_life) <= 5000),
  ADD CONSTRAINT chk_tadabbur_waktu_len CHECK (length(waktu) <= 500);

-- itikaf_rows
ALTER TABLE public.itikaf_rows
  ADD CONSTRAINT chk_itikaf_lokasi_len CHECK (length(lokasi) <= 200),
  ADD CONSTRAINT chk_itikaf_teman_len CHECK (length(teman) <= 200),
  ADD CONSTRAINT chk_itikaf_target_len CHECK (length(target) <= 500);

-- tracker_habits
ALTER TABLE public.tracker_habits
  ADD CONSTRAINT chk_habit_name_len CHECK (length(name) <= 100);

-- profiles
ALTER TABLE public.profiles
  ADD CONSTRAINT chk_profile_name_len CHECK (length(name) <= 100),
  ADD CONSTRAINT chk_profile_email_len CHECK (length(email) <= 255),
  ADD CONSTRAINT chk_profile_city_len CHECK (length(city) <= 100),
  ADD CONSTRAINT chk_profile_country_len CHECK (length(country) <= 100),
  ADD CONSTRAINT chk_profile_profession_len CHECK (length(profession) <= 200);

-- settings
ALTER TABLE public.settings
  ADD CONSTRAINT chk_settings_timezone_len CHECK (length(timezone) <= 100);

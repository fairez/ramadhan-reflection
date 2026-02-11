import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { SaveIndicator } from "@/components/SaveIndicator";
import { useAutosave } from "@/hooks/useAutosave";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TadabburWeek {
  id?: string;
  week_number: number;
  waktu: string;
  ayat: string;
  tafsir: string;
  reflection: string;
  apply_to_life: string;
}

const emptyWeek = (n: number): TadabburWeek => ({
  week_number: n, waktu: "", ayat: "", tafsir: "", reflection: "", apply_to_life: "",
});

const tadabburSteps = [
  "Murnikan niat kita",
  "Baca pelan-pelan arti surat adh-dhuha secara keseluruhan",
  "Pilih salah satu ayat yang paling membuatmu penasaran",
  "Munculkan pertanyaan dan lihat akhir dari ayat tersebut",
  "Pelajari tafsir ayat tersebut",
  "Renungi ayat tersebut, kaitkan dengan pengalaman dan ilmu yang dimiliki",
  "Tuliskan apa yang bisa diaplikasikan dalam kehidupan sehari-hari!",
];

const promptQuestions = [
  "Pernahkah muncul kekhawatiran hingga membuat malas melakukan apapun?",
  "Apa yang bisa kita usahakan agar kekhawatiran tadi hilang?",
  "Pernahkah merasa putus asa dari rahmat Allah?",
  "Yuk temukan kasih-sayang Allah di surat ini, di ayat berapa saja?",
];

export default function TadabburPage() {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<TadabburWeek[]>([1, 2, 3, 4].map(emptyWeek));
  const [activeWeek, setActiveWeek] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("tadabbur_weeks")
      .select("*")
      .eq("user_id", user.id)
      .order("week_number")
      .then(({ data }) => {
        if (data && data.length > 0) {
          const merged = [1, 2, 3, 4].map((n) => {
            const found = data.find((d) => d.week_number === n);
            return found
              ? { id: found.id, week_number: n, waktu: found.waktu || "", ayat: found.ayat || "", tafsir: found.tafsir || "", reflection: found.reflection || "", apply_to_life: found.apply_to_life || "" }
              : emptyWeek(n);
          });
          setWeeks(merged);
        }
        setLoaded(true);
      });
  }, [user]);

  const saveFn = useCallback(
    async (week: TadabburWeek) => {
      if (!user) return;
      await supabase.from("tadabbur_weeks").upsert({
        user_id: user.id,
        week_number: week.week_number,
        waktu: week.waktu,
        ayat: week.ayat,
        tafsir: week.tafsir,
        reflection: week.reflection,
        apply_to_life: week.apply_to_life,
      }, { onConflict: "user_id,week_number" });
    },
    [user]
  );

  const { save, status } = useAutosave(saveFn);

  const updateWeek = (idx: number, field: keyof TadabburWeek, value: string) => {
    const updated = [...weeks];
    (updated[idx] as any)[field] = value;
    setWeeks(updated);
    save(updated[idx]);
  };

  const getStatus = (w: TadabburWeek) => {
    const fields = [w.waktu, w.ayat, w.tafsir, w.reflection, w.apply_to_life];
    const filled = fields.filter((f) => f.trim().length > 0).length;
    if (filled === 0) return "Belum diisi";
    if (filled < 5) return "Sedang dikerjakan";
    return "Selesai ✓";
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Time to Tadabbur</h1>
            <p className="text-muted-foreground text-sm mt-1">Ramadhan with Adh-Dhuha — Tadabbur mingguan</p>
          </div>
          <SaveIndicator status={status} />
        </div>

        {/* Guide panel */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full bg-gold/10 border border-gold/20 rounded-xl p-4 text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-foreground">Panduan Tadabbur</span>
          </div>
          {showGuide ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card rounded-xl p-6 border space-y-4">
                <h3 className="font-serif text-lg text-foreground">Tahapan Tadabbur</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  {tadabburSteps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
                <h3 className="font-serif text-lg text-foreground pt-2">Pertanyaan Pemantik</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {promptQuestions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Week cards */}
        {loaded && (
          <div className="space-y-4">
            {weeks.map((week, idx) => (
              <div key={idx} className="bg-card rounded-xl shadow-card border overflow-hidden">
                <button
                  onClick={() => setActiveWeek(activeWeek === idx ? -1 : idx)}
                  className="w-full p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${getStatus(week) === "Selesai ✓" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {idx + 1}
                    </div>
                    <div className="text-left">
                      <span className="font-serif text-foreground">Pekan {["I", "II", "III", "IV"][idx]}</span>
                      <p className="text-xs text-muted-foreground">{getStatus(week)}</p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${activeWeek === idx ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {activeWeek === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4">
                        <Field label="Waktu" value={week.waktu} onChange={(v) => updateWeek(idx, "waktu", v)} placeholder="Contoh: Kemarin, Senin pagi…" />
                        <Field label="Hari ini saya belajar ayat…" value={week.ayat} onChange={(v) => updateWeek(idx, "ayat", v)} placeholder="QS. Ad-Dhuha ayat …" />
                        <Field label="Understand the Context & Tafsir" value={week.tafsir} onChange={(v) => updateWeek(idx, "tafsir", v)} multiline placeholder="Tuliskan konteks dan tafsir…" />
                        <Field label="Bagian Terfavoritku / My Reflection" value={week.reflection} onChange={(v) => updateWeek(idx, "reflection", v)} multiline placeholder="Refleksi pribadi…" />
                        <Field label="Apply to Life!" value={week.apply_to_life} onChange={(v) => updateWeek(idx, "apply_to_life", v)} multiline placeholder="Action items yang ingin diterapkan…" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}

function Field({ label, value, onChange, multiline, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <Tag
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground/40 ${
          multiline ? "min-h-[100px] resize-y" : ""
        }`}
        maxLength={multiline ? 5000 : 500}
      />
    </div>
  );
}

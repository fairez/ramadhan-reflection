import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import {
  PenLine, CheckSquare, BookOpen, Moon, Calendar, Heart,
  TrendingUp, FileText, BookMarked, Target
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Stats {
  trackerPercent: number;
  totalChecks: number;
  totalHabits: number;
  quranEntries: number;
  tadabburDone: number;
}

const quickTiles = [
  { path: "/tracker", label: "Ramadan Tracker", icon: CheckSquare, color: "bg-primary/10 text-primary" },
  { path: "/daily-targets", label: "Target Harian", icon: Target, color: "bg-primary/10 text-primary" },
  { path: "/letter", label: "A Letter for Me", icon: PenLine, color: "bg-gold/10 text-gold-dark" },
  { path: "/tadabbur", label: "Time to Tadabbur", icon: BookOpen, color: "bg-teal-light/10 text-teal" },
  { path: "/quran-journal", label: "Qur'an Journaling", icon: Moon, color: "bg-primary/10 text-primary" },
  { path: "/itikaf", label: "Jadwal I'tikaf", icon: Calendar, color: "bg-gold/10 text-gold-dark" },
  { path: "/doa", label: "Langitkan Do'amu", icon: Heart, color: "bg-destructive/10 text-destructive" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    trackerPercent: 0, totalChecks: 0, totalHabits: 0, quranEntries: 0, tadabburDone: 0,
  });
  const [ramadhanDay, setRamadhanDay] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    const userId = user!.id;

    // Get settings
    const { data: settings } = await supabase
      .from("settings")
      .select("ramadhan_start_date")
      .eq("user_id", userId)
      .maybeSingle();

    if (settings?.ramadhan_start_date) {
      setStartDate(settings.ramadhan_start_date);
      const start = new Date(settings.ramadhan_start_date);
      const today = new Date();
      const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diff >= 1 && diff <= 30) setRamadhanDay(diff);
      else if (diff > 30) setRamadhanDay(30);
      else setRamadhanDay(null);
    }

    // Get tracker stats
    const { data: habits } = await supabase
      .from("tracker_habits")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true);

    const { count: checksCount } = await supabase
      .from("tracker_checks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("checked", true);

    const totalHabits = habits?.length || 0;
    const totalChecks = checksCount || 0;
    const totalPossible = totalHabits * 30;
    const trackerPercent = totalPossible > 0 ? Math.round((totalChecks / totalPossible) * 100) : 0;

    // Quran entries count
    const { count: quranCount } = await supabase
      .from("quran_journal_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Tadabbur done
    const { data: tadabbur } = await supabase
      .from("tadabbur_weeks")
      .select("week_number, ayat")
      .eq("user_id", userId);

    const tadabburDone = tadabbur?.filter(t => t.ayat && t.ayat.trim().length > 0).length || 0;

    setStats({
      trackerPercent,
      totalChecks,
      totalHabits,
      quranEntries: quranCount || 0,
      tadabburDone,
    });
  }

  const greeting = user?.user_metadata?.full_name
    ? `Assalamu'alaikum, ${user.user_metadata.full_name.split(" ")[0]}!`
    : "Assalamu'alaikum!";

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-1">{greeting}</h1>
          <p className="text-muted-foreground">
            {ramadhanDay
              ? `Hari ke-${ramadhanDay} Ramadhan`
              : startDate
                ? "Ramadhan telah berlalu — teruslah istiqomah!"
                : "Atur tanggal mulai Ramadhan di pengaturan"}
          </p>
          {!startDate && (
            <SetStartDate userId={user!.id} onSet={(d) => { setStartDate(d); loadData(); }} />
          )}
        </div>

        {/* Progress widgets */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-card-foreground">Tracker</span>
            </div>
            <Progress value={stats.trackerPercent} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">{stats.trackerPercent}% • {stats.totalChecks} dari {stats.totalHabits * 30}</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-card-foreground">Jurnal Qur'an</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.quranEntries}</p>
            <p className="text-xs text-muted-foreground">entri refleksi</p>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card border">
            <div className="flex items-center gap-2 mb-3">
              <BookMarked className="h-4 w-4 text-teal" />
              <span className="text-sm font-medium text-card-foreground">Tadabbur</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.tadabburDone}/4</p>
            <p className="text-xs text-muted-foreground">pekan selesai</p>
          </div>
        </div>

        {/* Quick tiles */}
        <div>
          <h2 className="font-serif text-xl mb-4 text-foreground">Modul Jurnal</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickTiles.map(({ path, label, icon: Icon, color }, i) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={path}
                  className="flex flex-col items-center gap-3 p-5 bg-card rounded-xl shadow-card border hover:shadow-elevated transition-all group"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm text-center font-medium text-card-foreground">{label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}

function SetStartDate({ userId, onSet }: { userId: string; onSet: (d: string) => void }) {
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!date) return;
    setSaving(true);
    await supabase.from("settings").upsert({ user_id: userId, ramadhan_start_date: date });
    onSet(date);
    setSaving(false);
  };

  return (
    <div className="mt-4 flex items-center gap-3 bg-gold/10 p-4 rounded-xl border border-gold/20">
      <label className="text-sm font-medium text-foreground">Tanggal mulai Ramadhan:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border rounded-lg px-3 py-1.5 text-sm bg-background"
      />
      <button
        onClick={handleSave}
        disabled={saving || !date}
        className="bg-gold text-teal-deep px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
      >
        {saving ? "Menyimpan…" : "Simpan"}
      </button>
    </div>
  );
}

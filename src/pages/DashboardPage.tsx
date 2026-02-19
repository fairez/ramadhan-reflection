import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import {
  PenLine, CheckSquare, BookOpen, Moon, Calendar, Heart,
  TrendingUp, FileText, BookMarked, Target, Settings, Pencil, Check
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
  const [isRamadhanOver, setIsRamadhanOver] = useState<boolean>(false);
  const [daysUntilRamadhan, setDaysUntilRamadhan] = useState<number | null>(null);
  const [showEditDate, setShowEditDate] = useState<boolean>(false);
  const [sapaanName, setSapaanName] = useState<string | null>(null);
  const [editingSapaan, setEditingSapaan] = useState(false);
  const [sapaanInput, setSapaanInput] = useState("");

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    const userId = user!.id;

    // Load sapaan name from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", userId)
      .maybeSingle();
    const customName = profile?.name || null;
    setSapaanName(customName);
    setSapaanInput(customName || "");

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
      today.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diff >= 1 && diff <= 30) {
        // Sedang Ramadhan
        setRamadhanDay(diff);
        setIsRamadhanOver(false);
        setDaysUntilRamadhan(null);
      } else if (diff > 30) {
        // Ramadhan sudah lewat
        setRamadhanDay(null);
        setIsRamadhanOver(true);
        setDaysUntilRamadhan(null);
      } else if (diff <= 0 && diff >= -29) {
        // Dalam 30 hari sebelum Ramadhan
        setRamadhanDay(null);
        setIsRamadhanOver(false);
        setDaysUntilRamadhan(Math.abs(diff) + 1);
      } else {
        // Lebih dari 30 hari sebelum Ramadhan
        setRamadhanDay(null);
        setIsRamadhanOver(false);
        setDaysUntilRamadhan(null);
      }
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

  async function saveSapaan() {
    if (!sapaanInput.trim()) return;
    await supabase
      .from("profiles")
      .upsert({ user_id: user!.id, name: sapaanInput.trim() });
    setSapaanName(sapaanInput.trim());
    setEditingSapaan(false);
  }

  const displayName = sapaanName
    ? sapaanName
    : user?.user_metadata?.full_name
      ? user.user_metadata.full_name.split(" ")[0]
      : null;

  const greeting = displayName
    ? `Assalamu'alaikum, ${displayName}!`
    : "Assalamu'alaikum!";

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            {editingSapaan ? (
              <>
                <input
                  autoFocus
                  value={sapaanInput}
                  onChange={(e) => setSapaanInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveSapaan(); if (e.key === "Escape") setEditingSapaan(false); }}
                  placeholder="Nama panggilanmu"
                  className="font-serif text-3xl md:text-4xl text-foreground bg-transparent border-b-2 border-primary outline-none w-full max-w-xs"
                />
                <button onClick={saveSapaan} className="text-primary hover:text-primary/70 transition-colors" title="Simpan">
                  <Check className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <h1 className="font-serif text-3xl md:text-4xl text-foreground">{greeting}</h1>
                <button
                  onClick={() => { setSapaanInput(sapaanName || ""); setEditingSapaan(true); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Ubah nama sapaan"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-muted-foreground">
              {ramadhanDay
                ? (
                  <>
                    {`Hari ke-${ramadhanDay} Ramadhan`}
                    <span className="block text-sm mt-0.5 text-primary/80">
                      Semangat, manfaatkan waktu Ramadhan sebaik-baiknya
                    </span>
                  </>
                )
                : isRamadhanOver
                  ? "Ramadhan telah berlalu — teruslah istiqomah!"
                  : daysUntilRamadhan !== null
                    ? (
                      <>
                        Sedikit lagi Ramadhan
                        <span className="block text-sm mt-0.5 text-gold/90">
                          {daysUntilRamadhan} hari lagi menuju Ramadhan 🌙
                        </span>
                      </>
                    )
                    : "Atur tanggal mulai Ramadhan di pengaturan"}
            </p>
            {startDate && (
              <button
                onClick={() => setShowEditDate((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5 shrink-0"
                title="Ubah tanggal mulai Ramadhan"
              >
                <Settings className="h-3.5 w-3.5" />
                Ubah tanggal
              </button>
            )}
          </div>
          {(!startDate || showEditDate) && (
            <ChangeStartDate
              userId={user!.id}
              initialDate={startDate ?? ""}
              onSet={(d) => { setStartDate(d); setShowEditDate(false); loadData(); }}
            />
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

function ChangeStartDate({
  userId,
  initialDate,
  onSet,
}: {
  userId: string;
  initialDate: string;
  onSet: (d: string) => void;
}) {
  const [date, setDate] = useState(initialDate);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!date) return;
    setSaving(true);
    await supabase.from("settings").upsert({ user_id: userId, ramadhan_start_date: date });
    onSet(date);
    setSaving(false);
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 bg-gold/10 p-4 rounded-xl border border-gold/20">
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

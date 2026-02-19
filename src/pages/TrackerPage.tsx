import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckCircle2, Circle, Flame, Sparkles, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import trackerHabitsData from "@/data/tracker-habits.json";

type DifficultyLevel = 'easy' | 'medium' | 'on_fire';
type TrackerHabitsData = {
  [K in DifficultyLevel]: string[];
};

interface Habit {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

interface CheckMap {
  [key: string]: boolean; // habit_id-day_number -> checked
}

export default function TrackerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checks, setChecks] = useState<CheckMap>({});
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<string | null>(null);
  const [checkingDifficulty, setCheckingDifficulty] = useState(true);
  const [selectingDifficulty, setSelectingDifficulty] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState<'easy' | 'medium' | 'on_fire' | null>(null);
  const [pendingHabits, setPendingHabits] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    checkIfHabitsExist();
  }, [user]);

  async function checkIfHabitsExist() {
    if (!user) return;

    // Check if user already has habits (means they've selected difficulty before)
    const { data: existingHabits } = await supabase
      .from("tracker_habits")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1);

    if (existingHabits && existingHabits.length > 0) {
      // User has habits, so difficulty was already selected
      setDifficultyLevel("selected"); // Just a flag, not the actual level
      loadData();
    } else {
      // No habits yet, show difficulty selection
      setDifficultyLevel(null);
      setLoading(false);
    }
    setCheckingDifficulty(false);
  }

  async function loadData() {
    const userId = user!.id;
    const { data: h } = await supabase
      .from("tracker_habits")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("sort_order");

    const { data: c } = await supabase
      .from("tracker_checks")
      .select("*")
      .eq("user_id", userId)
      .eq("checked", true);

    setHabits(h || []);
    const checkMap: CheckMap = {};
    c?.forEach((ck) => {
      checkMap[`${ck.habit_id}-${ck.day_number}`] = true;
    });
    setChecks(checkMap);
    setLoading(false);
  }

  async function toggleCheck(habitId: string, day: number) {
    const key = `${habitId}-${day}`;
    const isChecked = checks[key];

    // Optimistic update
    setChecks((prev) => ({ ...prev, [key]: !isChecked }));

    if (isChecked) {
      await supabase
        .from("tracker_checks")
        .delete()
        .eq("user_id", user!.id)
        .eq("habit_id", habitId)
        .eq("day_number", day);
    } else {
      await supabase.from("tracker_checks").upsert({
        user_id: user!.id,
        habit_id: habitId,
        day_number: day,
        checked: true,
      });
    }
  }

  async function addHabit() {
    if (!newHabit.trim()) return;
    const maxOrder = habits.reduce((max, h) => Math.max(max, h.sort_order), 0);
    const { data } = await supabase
      .from("tracker_habits")
      .insert({ user_id: user!.id, name: newHabit.trim(), sort_order: maxOrder + 1 })
      .select()
      .single();
    if (data) {
      setHabits([...habits, data]);
      setNewHabit("");
    }
  }

  async function removeHabit(id: string) {
    // Verify ownership
    const { data: existing } = await supabase
      .from("tracker_habits")
      .select("id")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single();

    if (!existing) {
      toast({ title: "Unauthorized", description: "Habit not found or access denied", variant: "destructive" });
      return;
    }

    await supabase.from("tracker_habits").update({ is_active: false }).eq("id", id);
    setHabits(habits.filter((h) => h.id !== id));
    toast({ title: "Kebiasaan dihapus" });
  }

  function handleDifficultySelect(level: 'easy' | 'medium' | 'on_fire') {
    // Get habits from JSON file
    const habitsToShow = (trackerHabitsData as TrackerHabitsData)[level];

    if (!habitsToShow || habitsToShow.length === 0) {
      toast({
        title: "Error",
        description: `Tidak ada kebiasaan untuk level ${level}`,
        variant: "destructive"
      });
      return;
    }

    // Show confirmation screen with habits list
    setPendingDifficulty(level);
    setPendingHabits(habitsToShow);
  }

  function handleConfirmDifficulty() {
    if (!pendingDifficulty || !user) return;
    insertHabits(pendingDifficulty);
  }

  function handleCancelConfirmation() {
    setPendingDifficulty(null);
    setPendingHabits([]);
  }

  async function insertHabits(level: 'easy' | 'medium' | 'on_fire') {
    if (!user) return;

    setSelectingDifficulty(true);
    try {
      // Check if user already has habits (prevent re-seeding)
      const { data: existingHabits } = await supabase
        .from("tracker_habits")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1);

      if (existingHabits && existingHabits.length > 0) {
        throw new Error("Anda sudah memiliki kebiasaan. Tidak dapat mengatur ulang target.");
      }

      // Get habits from JSON file
      const habitsToInsert = (trackerHabitsData as TrackerHabitsData)[level];

      if (!habitsToInsert || habitsToInsert.length === 0) {
        throw new Error(`Tidak ada kebiasaan untuk level ${level}`);
      }

      // Insert habits into database
      const habitsData = habitsToInsert.map((habit, index) => ({
        user_id: user.id,
        name: habit,
        sort_order: index + 1,
        is_active: true
      }));

      const { error: insertError } = await supabase
        .from("tracker_habits")
        .insert(habitsData);

      if (insertError) throw insertError;

      setDifficultyLevel("selected");
      setPendingDifficulty(null);
      setPendingHabits([]);
      toast({
        title: "Target berhasil diset!",
        description: `Level ${level === 'easy' ? 'Easy' : level === 'medium' ? 'Medium' : 'On Fire!'} telah dipilih.`
      });

      // Reload data to show the new habits
      await loadData();
    } catch (error: any) {
      toast({
        title: "Gagal menyimpan",
        description: error.message || "Terjadi kesalahan, coba lagi.",
        variant: "destructive"
      });
    } finally {
      setSelectingDifficulty(false);
    }
  }

  function renderGrid(days: number[]) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left p-2 min-w-[140px] sticky left-0 bg-card z-10 text-foreground">Kebiasaan</th>
              {days.map((d) => (
                <th key={d} className="p-1 text-center min-w-[32px] text-muted-foreground font-medium">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const checkedCount = days.filter((d) => checks[`${habit.id}-${d}`]).length;
              return (
                <tr key={habit.id} className="border-t border-border/50 hover:bg-muted/30">
                  <td className="p-2 sticky left-0 bg-card z-10">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-foreground truncate">{habit.name}</span>
                      <span className="text-muted-foreground text-[10px]">{checkedCount}/{days.length}</span>
                    </div>
                  </td>
                  {days.map((d) => {
                    const key = `${habit.id}-${d}`;
                    const checked = checks[key];
                    return (
                      <td key={d} className="p-1 text-center">
                        <button
                          onClick={() => toggleCheck(habit.id, d)}
                          className="transition-colors hover:opacity-80"
                        >
                          {checked ? (
                            <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <Circle className="h-5 w-5 text-border mx-auto" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const days1 = Array.from({ length: 15 }, (_, i) => i + 1);
  const days2 = Array.from({ length: 15 }, (_, i) => i + 16);

  // Show difficulty selection if not selected yet
  if (checkingDifficulty) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Memuat...</div>
        </div>
      </AppLayout>
    );
  }

  // Show confirmation screen if difficulty is selected but not confirmed
  if (pendingDifficulty && pendingHabits.length > 0) {
    const difficultyLabels = {
      easy: 'Easy',
      medium: 'Medium',
      on_fire: 'On Fire!'
    };
    const difficultyIcons = {
      easy: Sparkles,
      medium: Target,
      on_fire: Flame
    };
    const difficultyColors = {
      easy: 'text-green-500',
      medium: 'text-blue-500',
      on_fire: 'text-primary'
    };
    const Icon = difficultyIcons[pendingDifficulty];

    return (
      <AppLayout>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Konfirmasi Target</h1>
            <p className="text-muted-foreground text-sm mt-1">Tinjau kebiasaan yang akan ditambahkan</p>
          </div>

          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3 justify-center">
                <Icon className={`h-6 w-6 ${difficultyColors[pendingDifficulty]}`} />
                <CardTitle className="text-center">Level {difficultyLabels[pendingDifficulty]}</CardTitle>
              </div>
              <CardDescription className="text-center">
                Berikut adalah daftar kebiasaan yang akan ditambahkan ke tracker kamu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 max-h-[400px] overflow-y-auto">
                {pendingHabits.map((habit, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {index + 1}
                    </div>
                    <span className="text-foreground">{habit}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleCancelConfirmation}
                  variant="outline"
                  className="flex-1"
                  disabled={selectingDifficulty}
                >
                  Kembali
                </Button>
                <Button
                  onClick={handleConfirmDifficulty}
                  className="flex-1"
                  disabled={selectingDifficulty}
                >
                  {selectingDifficulty ? "Menyimpan..." : "Konfirmasi"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AppLayout>
    );
  }

  if (!difficultyLevel) {
    return (
      <AppLayout>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Ramadan Tracker</h1>
            <p className="text-muted-foreground text-sm mt-1">Pilih level targetmu untuk memulai</p>
          </div>

          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-center">Pilih Level Target</CardTitle>
              <CardDescription className="text-center">
                Pilih tingkat kesulitan yang sesuai dengan komitmenmu di bulan Ramadhan ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Easy */}
              <motion.button
                onClick={() => handleDifficultySelect('easy')}
                disabled={selectingDifficulty}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-primary/50 transition-all text-left bg-card hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">Easy</h3>
                    <p className="text-sm text-muted-foreground">Perfect for beginners</p>
                    <p className="text-xs text-muted-foreground mt-1">8 kebiasaan dasar untuk memulai perjalanan Ramadhanmu</p>
                  </div>
                </div>
              </motion.button>

              {/* Medium */}
              <motion.button
                onClick={() => handleDifficultySelect('medium')}
                disabled={selectingDifficulty}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-primary/50 transition-all text-left bg-card hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">Medium</h3>
                    <p className="text-sm text-muted-foreground">Balanced challenge</p>
                    <p className="text-xs text-muted-foreground mt-1">14 kebiasaan untuk keseimbangan ibadah yang lebih lengkap</p>
                  </div>
                </div>
              </motion.button>

              {/* On Fire! */}
              <motion.button
                onClick={() => handleDifficultySelect('on_fire')}
                disabled={selectingDifficulty}
                className="w-full p-6 rounded-xl border-2 border-primary/30 hover:border-primary transition-all text-left bg-primary/5 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">On Fire!</h3>
                    <p className="text-sm text-muted-foreground">Maximum commitment</p>
                    <p className="text-xs text-muted-foreground mt-1">16+ kebiasaan komprehensif untuk Ramadhan yang maksimal</p>
                  </div>
                </div>
              </motion.button>
            </CardContent>
          </Card>
        </motion.div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Ramadan Tracker</h1>
            <p className="text-muted-foreground text-sm mt-1">Lacak ibadah harianmu selama 30 hari Ramadhan</p>
          </div>
          <Link
            to="/daily-targets"
            className="flex items-center gap-1.5 shrink-0 text-sm text-primary hover:text-primary/80 border border-primary/30 hover:border-primary/60 px-3 py-1.5 rounded-lg transition-all mt-1"
          >
            <Target className="h-3.5 w-3.5" />
            Target Harian
          </Link>
        </div>

        {/* Add habit */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="Tambah kebiasaan baru…"
            className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background"
            maxLength={100}
          />
          <Button onClick={addHabit} size="sm" className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-1" /> Tambah
          </Button>
        </div>

        {!loading && (
          <div className="bg-card rounded-xl shadow-card border overflow-hidden">
            <Tabs defaultValue="1-15">
              <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 p-0">
                <TabsTrigger value="1-15" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
                  Hari 1–15
                </TabsTrigger>
                <TabsTrigger value="16-30" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
                  Hari 16–30
                </TabsTrigger>
              </TabsList>
              <TabsContent value="1-15" className="p-2 md:p-4 mt-0">
                {renderGrid(days1)}
              </TabsContent>
              <TabsContent value="16-30" className="p-2 md:p-4 mt-0">
                {renderGrid(days2)}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Manage habits */}
        {habits.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Kelola Kebiasaan</h3>
            <div className="grid gap-1">
              {habits.map((h) => (
                <div key={h.id} className="flex items-center justify-between px-3 py-2 bg-card rounded-lg border text-sm">
                  <span className="text-foreground">{h.name}</span>
                  <button onClick={() => removeHabit(h.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}

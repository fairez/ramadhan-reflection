import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

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

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Ramadan Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">Lacak ibadah harianmu selama 30 hari Ramadhan</p>
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

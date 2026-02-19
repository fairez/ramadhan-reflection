import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { CheckCircle2, Circle, Loader2, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export default function DailyTargetsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkedHabits, setCheckedHabits] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [todayDay, setTodayDay] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    loadSettings();
  }, [user]);

  useEffect(() => {
    if (!user || selectedDay === null) return;
    loadData();
  }, [user, selectedDay]);

  // Helper function to convert date to Ramadhan day number
  function dateToRamadhanDay(date: Date, startDateStr: string): number | null {
    const start = new Date(startDateStr);
    const diff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diff >= 1 && diff <= 30) return diff;
    return null;
  }

  // Helper function to convert Ramadhan day number to date
  function ramadhanDayToDate(day: number, startDateStr: string): Date {
    const start = new Date(startDateStr);
    const date = new Date(start);
    date.setDate(start.getDate() + (day - 1));
    return date;
  }

  // Format date for display
  function formatDate(date: Date): string {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  async function loadSettings() {
    const userId = user!.id;
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
      let calculatedDay: number | null = null;
      if (diff >= 1 && diff <= 30) calculatedDay = diff;
      else if (diff > 30) calculatedDay = 30;

      setTodayDay(calculatedDay);
      const dayToUse = calculatedDay || 1;
      setSelectedDay(dayToUse);
      setSelectedDate(ramadhanDayToDate(dayToUse, settings.ramadhan_start_date));
    } else {
      setStartDate(null);
      setTodayDay(null);
      setSelectedDay(1);
      setSelectedDate(new Date());
    }
  }

  async function loadData() {
    if (selectedDay === null) return;

    const userId = user!.id;

    // Load active habits
    const { data: h } = await supabase
      .from("tracker_habits")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("sort_order");

    // Load checks for selected day
    const { data: c } = await supabase
      .from("tracker_checks")
      .select("habit_id")
      .eq("user_id", userId)
      .eq("day_number", selectedDay)
      .eq("checked", true);

    setHabits(h || []);
    const checkedSet = new Set<string>();
    c?.forEach((ck) => {
      checkedSet.add(ck.habit_id);
    });
    setCheckedHabits(checkedSet);
    setLoading(false);
  }

  async function toggleCheck(habitId: string) {
    if (selectedDay === null) return;

    const isChecked = checkedHabits.has(habitId);
    const newCheckedSet = new Set(checkedHabits);

    // Optimistic update
    if (isChecked) {
      newCheckedSet.delete(habitId);
    } else {
      newCheckedSet.add(habitId);
    }
    setCheckedHabits(newCheckedSet);

    if (isChecked) {
      await supabase
        .from("tracker_checks")
        .delete()
        .eq("user_id", user!.id)
        .eq("habit_id", habitId)
        .eq("day_number", selectedDay);
    } else {
      await supabase.from("tracker_checks").upsert({
        user_id: user!.id,
        habit_id: habitId,
        day_number: selectedDay,
        checked: true,
      });
    }
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <Link
            to="/tracker"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Ramadan Tracker
          </Link>
          <h1 className="font-serif text-3xl text-foreground">Target Harian</h1>
          <p className="text-muted-foreground text-sm mt-1">Lacak target harianmu per hari Ramadhan</p>
        </div>

        {/* Day selector with calendar */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Pilih Hari:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  <span>{formatDate(selectedDate)}</span>
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date || !startDate) return;
                  setSelectedDate(date);
                  const day = dateToRamadhanDay(date, startDate);
                  if (day !== null) {
                    setSelectedDay(day);
                    setLoading(true);
                  }
                }}
                disabled={(date) => {
                  if (!startDate) return true;
                  const start = new Date(startDate);
                  start.setHours(0, 0, 0, 0);
                  const end = new Date(start);
                  end.setDate(start.getDate() + 29);
                  end.setHours(23, 59, 59, 999);
                  const dateToCheck = new Date(date);
                  dateToCheck.setHours(0, 0, 0, 0);
                  return dateToCheck < start || dateToCheck > end;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {selectedDate && selectedDay !== null && startDate && (
            <div className="text-sm text-muted-foreground">
              <span>Hari ke-{selectedDay} Ramadhan</span>
              {todayDay !== null && selectedDay === todayDay && (
                <span className="ml-2 text-primary">(Hari ini)</span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : habits.length === 0 ? (
          <div className="bg-card rounded-xl shadow-card border p-8 text-center">
            <p className="text-muted-foreground">Tidak ada target harian hari ini</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-card border overflow-hidden">
            <div className="p-4 space-y-3">
              {habits.map((habit) => {
                const isChecked = checkedHabits.has(habit.id);
                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <button
                      onClick={() => toggleCheck(habit.id)}
                      className="transition-colors hover:opacity-80 flex-shrink-0"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-border" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-foreground ${isChecked ? "line-through text-muted-foreground" : ""
                        }`}
                    >
                      {habit.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}

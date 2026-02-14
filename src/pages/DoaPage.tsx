import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { SaveIndicator } from "@/components/SaveIndicator";
import { useAutosave } from "@/hooks/useAutosave";
import { Button } from "@/components/ui/button";
import { Plus, Pin, PinOff, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface DoaEntry {
  id: string;
  entry_date: string;
  category: string;
  content: string;
  pinned: boolean;
}

const categories = ["Keluarga", "Rezeki", "Iman", "Kesehatan", "Ilmu", "Akhirat", "Lainnya"];

export default function DoaPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<DoaEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadEntries();
  }, [user]);

  async function loadEntries() {
    const { data } = await supabase
      .from("doa_entries")
      .select("*")
      .eq("user_id", user!.id)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setEntries(data || []);
    setLoaded(true);
  }

  async function createEntry() {
    const { data } = await supabase
      .from("doa_entries")
      .insert({ user_id: user!.id, content: "", category: "", entry_date: new Date().toISOString().split("T")[0] })
      .select()
      .single();
    if (data) {
      setEntries([data, ...entries]);
      setEditingId(data.id);
    }
  }

  async function deleteEntry(id: string) {
    // Verify ownership
    const { data: existing } = await supabase
      .from("doa_entries")
      .select("id")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single();
    
    if (!existing) {
      toast({ title: "Unauthorized", description: "Entry not found or access denied", variant: "destructive" });
      return;
    }
    
    await supabase.from("doa_entries").delete().eq("id", id);
    setEntries(entries.filter((e) => e.id !== id));
    toast({ title: "Do'a dihapus" });
  }

  async function togglePin(entry: DoaEntry) {
    // Verify ownership
    const { data: existing } = await supabase
      .from("doa_entries")
      .select("id")
      .eq("id", entry.id)
      .eq("user_id", user!.id)
      .single();
    
    if (!existing) {
      toast({ title: "Unauthorized", description: "Entry not found or access denied", variant: "destructive" });
      return;
    }
    
    const newPinned = !entry.pinned;
    await supabase.from("doa_entries").update({ pinned: newPinned }).eq("id", entry.id);
    setEntries(
      entries
        .map((e) => (e.id === entry.id ? { ...e, pinned: newPinned } : e))
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
    );
  }

  const saveFn = useCallback(
    async (entry: DoaEntry) => {
      if (!user) return;
      
      // Verify ownership
      const { data: existing } = await supabase
        .from("doa_entries")
        .select("id")
        .eq("id", entry.id)
        .eq("user_id", user.id)
        .single();
      
      if (!existing) {
        // Silently fail for autosave - don't show error toast to avoid spam
        return;
      }
      
      await supabase.from("doa_entries").update({
        content: entry.content,
        category: entry.category,
      }).eq("id", entry.id);
    },
    [user]
  );

  const { save, status } = useAutosave(saveFn);

  const updateEntry = (id: string, field: keyof DoaEntry, value: any) => {
    const updated = entries.map((e) => (e.id === id ? { ...e, [field]: value } : e));
    setEntries(updated);
    const entry = updated.find((e) => e.id === id);
    if (entry) save(entry);
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Langitkan Do'amu</h1>
            <p className="text-muted-foreground text-sm mt-1">Ruang khusus untuk mencurahkan do'a</p>
          </div>
          <div className="flex items-center gap-2">
            <SaveIndicator status={status} />
            <Button onClick={createEntry} className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" /> Do'a Baru
            </Button>
          </div>
        </div>

        {loaded && entries.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>Belum ada do'a. Langitkan do'amu sekarang!</p>
          </div>
        )}

        <div className="grid gap-4">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              className={`bg-card rounded-xl p-5 shadow-card border ${entry.pinned ? "ring-2 ring-gold/30" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">{entry.entry_date}</span>
                  <select
                    value={entry.category}
                    onChange={(e) => updateEntry(entry.id, "category", e.target.value)}
                    className="text-xs border rounded-md px-2 py-0.5 bg-background text-foreground"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {entry.pinned && <span className="text-xs text-gold font-medium">📌 Disematkan</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => togglePin(entry)} className="text-muted-foreground hover:text-gold transition-colors p-1">
                    {entry.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => deleteEntry(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <textarea
                value={entry.content}
                onChange={(e) => updateEntry(entry.id, "content", e.target.value)}
                placeholder="Ya Allah, aku berdo'a…"
                className="w-full bg-transparent outline-none resize-none text-foreground placeholder:text-muted-foreground/40 leading-relaxed text-sm min-h-[80px]"
                maxLength={5000}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}

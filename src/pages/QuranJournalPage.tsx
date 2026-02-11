import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { SaveIndicator } from "@/components/SaveIndicator";
import { useAutosave } from "@/hooks/useAutosave";
import { Button } from "@/components/ui/button";
import { Plus, Search, ArrowLeft, Printer, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Entry {
  id: string;
  entry_date: string;
  title: string;
  content: string;
  tags: string[];
  ayah_ref: string;
  created_at: string;
}

export default function QuranJournalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadEntries();
  }, [user]);

  async function loadEntries() {
    const { data } = await supabase
      .from("quran_journal_entries")
      .select("*")
      .eq("user_id", user!.id)
      .order("entry_date", { ascending: false });
    setEntries(data || []);
    setLoaded(true);
  }

  async function createEntry() {
    const { data } = await supabase
      .from("quran_journal_entries")
      .insert({ user_id: user!.id, title: "", content: "", entry_date: new Date().toISOString().split("T")[0] })
      .select()
      .single();
    if (data) {
      setEntries([data, ...entries]);
      setSelected(data);
    }
  }

  async function deleteEntry(id: string) {
    await supabase.from("quran_journal_entries").delete().eq("id", id);
    setEntries(entries.filter((e) => e.id !== id));
    if (selected?.id === id) setSelected(null);
    toast({ title: "Entri dihapus" });
  }

  const saveFn = useCallback(
    async (entry: Entry) => {
      if (!user) return;
      await supabase.from("quran_journal_entries").update({
        title: entry.title,
        content: entry.content,
        ayah_ref: entry.ayah_ref,
        tags: entry.tags,
      }).eq("id", entry.id);
    },
    [user]
  );

  const { save, status } = useAutosave(saveFn);

  const updateSelected = (field: keyof Entry, value: any) => {
    if (!selected) return;
    const updated = { ...selected, [field]: value };
    setSelected(updated);
    setEntries(entries.map((e) => (e.id === updated.id ? updated : e)));
    save(updated);
  };

  const filtered = entries.filter(
    (e) =>
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.content?.toLowerCase().includes(search.toLowerCase()) ||
      e.ayah_ref?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" /> Kembali
                </button>
                <div className="flex items-center gap-2">
                  <SaveIndicator status={status} />
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-card border space-y-4">
                <input
                  type="text"
                  value={selected.title}
                  onChange={(e) => updateSelected("title", e.target.value)}
                  placeholder="Judul refleksi…"
                  className="w-full text-xl font-serif bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50"
                  maxLength={200}
                />
                <input
                  type="text"
                  value={selected.ayah_ref}
                  onChange={(e) => updateSelected("ayah_ref", e.target.value)}
                  placeholder="Referensi ayat (contoh: QS. Al-Baqarah: 183)"
                  className="w-full text-sm bg-transparent outline-none text-muted-foreground placeholder:text-muted-foreground/40"
                  maxLength={200}
                />
                <textarea
                  value={selected.content}
                  onChange={(e) => updateSelected("content", e.target.value)}
                  placeholder="Tuliskan refleksi atau hikmah yang ingin kamu abadikan…"
                  className="w-full min-h-[300px] bg-transparent outline-none resize-none text-foreground placeholder:text-muted-foreground/40 leading-relaxed"
                  maxLength={10000}
                />
                <input
                  type="text"
                  value={(selected.tags || []).join(", ")}
                  onChange={(e) => updateSelected("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                  placeholder="Tags (pisahkan dengan koma)"
                  className="w-full text-sm bg-transparent outline-none text-muted-foreground placeholder:text-muted-foreground/40"
                  maxLength={200}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-serif text-3xl text-foreground">Qur'an Journaling</h1>
                  <p className="text-muted-foreground text-sm mt-1">Catat refleksi dan hikmah dari Al-Qur'an</p>
                </div>
                <Button onClick={createEntry} className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1" /> Entri Baru
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari refleksi…"
                  className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm bg-background"
                  maxLength={200}
                />
              </div>

              {loaded && filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{entries.length === 0 ? "Belum ada entri. Mulai tulis refleksimu!" : "Tidak ditemukan."}</p>
                </div>
              )}

              <div className="grid gap-3">
                {filtered.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => setSelected(entry)}
                    className="bg-card rounded-xl p-5 shadow-card border cursor-pointer hover:shadow-elevated transition-shadow group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-foreground truncate">{entry.title || "Tanpa judul"}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{entry.entry_date} {entry.ayah_ref && `• ${entry.ayah_ref}`}</p>
                        {entry.content && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{entry.content}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}

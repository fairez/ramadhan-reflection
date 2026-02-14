import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ItikafRow {
  id: string;
  day_number: number;
  lokasi: string;
  teman: string;
  target: string;
}

export default function ItikafPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<ItikafRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("itikaf_rows")
      .select("*")
      .eq("user_id", user.id)
      .order("day_number")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRows(data);
        } else {
          // seed 10 default rows
          const defaults: Omit<ItikafRow, "id">[] = Array.from({ length: 10 }, (_, i) => ({
            day_number: i + 1, lokasi: "", teman: "", target: "",
          }));
          seedRows(defaults);
        }
        setLoaded(true);
      });
  }, [user]);

  async function seedRows(defaults: Omit<ItikafRow, "id">[]) {
    const toInsert = defaults.map((d) => ({ ...d, user_id: user!.id }));
    const { data } = await supabase.from("itikaf_rows").insert(toInsert).select();
    if (data) setRows(data);
  }

  async function addRow() {
    const maxDay = rows.reduce((m, r) => Math.max(m, r.day_number), 0);
    const { data } = await supabase
      .from("itikaf_rows")
      .insert({ user_id: user!.id, day_number: maxDay + 1 })
      .select()
      .single();
    if (data) setRows([...rows, data]);
  }

  async function removeRow(id: string) {
    // Verify ownership
    const { data: existing } = await supabase
      .from("itikaf_rows")
      .select("id")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single();
    
    if (!existing) {
      toast({ title: "Unauthorized", description: "Entry not found or access denied", variant: "destructive" });
      return;
    }
    
    await supabase.from("itikaf_rows").delete().eq("id", id);
    setRows(rows.filter((r) => r.id !== id));
  }

  async function updateRow(id: string, field: keyof ItikafRow, value: string) {
    // Verify ownership
    const { data: existing } = await supabase
      .from("itikaf_rows")
      .select("id")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single();
    
    if (!existing) {
      toast({ title: "Unauthorized", description: "Entry not found or access denied", variant: "destructive" });
      return;
    }
    
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    // Debounce handled at component level with simple timeout
    await supabase.from("itikaf_rows").update({ [field]: value }).eq("id", id);
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Jadwal I'tikaf</h1>
            <p className="text-muted-foreground text-sm mt-1">Rencanakan I'tikaf 10 hari terakhir Ramadhan</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" /> Cetak
            </Button>
            <Button onClick={addRow} size="sm" className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" /> Tambah
            </Button>
          </div>
        </div>

        {loaded && (
          <div className="bg-card rounded-xl shadow-card border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground w-16">Hari</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Lokasi</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Teman I'tikaf</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">Target</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="p-3 text-foreground font-medium">{row.day_number}</td>
                    <td className="p-2">
                      <input
                        value={row.lokasi}
                        onChange={(e) => updateRow(row.id, "lokasi", e.target.value)}
                        className="w-full bg-transparent px-1 py-1 text-foreground outline-none"
                        placeholder="Masjid…"
                        maxLength={200}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={row.teman}
                        onChange={(e) => updateRow(row.id, "teman", e.target.value)}
                        className="w-full bg-transparent px-1 py-1 text-foreground outline-none"
                        placeholder="Nama teman…"
                        maxLength={200}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={row.target}
                        onChange={(e) => updateRow(row.id, "target", e.target.value)}
                        className="w-full bg-transparent px-1 py-1 text-foreground outline-none"
                        placeholder="Target ibadah…"
                        maxLength={500}
                      />
                    </td>
                    <td className="p-2">
                      <button onClick={() => removeRow(row.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { SaveIndicator } from "@/components/SaveIndicator";
import { useAutosave } from "@/hooks/useAutosave";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LetterPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);

  const saveFn = useCallback(
    async (data: { title: string; content: string }) => {
      if (!user) return;
      await supabase.from("letter_for_me").upsert({
        user_id: user.id,
        title: data.title,
        content: data.content,
      });
    },
    [user]
  );

  const { save, status } = useAutosave(saveFn);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("letter_for_me")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title || "");
          setContent(data.content || "");
        }
        setLoaded(true);
      });
  }, [user]);

  const handleChange = (t: string, c: string) => {
    setTitle(t);
    setContent(c);
    save({ title: t, content: c });
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">A Letter for Me</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tuliskan pesan untuk diri sendiri agar terus semangat di Bulan Ramadhan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SaveIndicator status={status} />
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" />
              Cetak
            </Button>
          </div>
        </div>

        {loaded && (
          <div className="bg-card rounded-xl p-6 md:p-8 shadow-card border space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => handleChange(e.target.value, content)}
              placeholder="Judul surat (opsional)"
              maxLength={500}
              className="w-full text-xl font-serif bg-transparent border-none outline-none placeholder:text-muted-foreground/50 text-foreground"
            />
            <textarea
              value={content}
              onChange={(e) => handleChange(title, e.target.value)}
              placeholder="Tulis suratmu di sini…&#10;&#10;Dear self, di Ramadhan tahun ini aku ingin…"
              maxLength={20000}
              className="w-full min-h-[400px] bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/40 leading-relaxed"
            />
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}

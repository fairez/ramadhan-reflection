import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Moon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const CONSENT_KEY = "ramadhan_journal_consent";

export function hasConsented(): boolean {
  return localStorage.getItem(CONSENT_KEY) === "true";
}

export default function ConsentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    } else if (user?.email) {
      setName(user.email.split("@")[0]);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!agreed) {
      toast({ title: "Persetujuan diperlukan", description: "Silakan centang persetujuan terlebih dahulu.", variant: "destructive" });
      return;
    }
    if (!name.trim()) {
      toast({ title: "Nama diperlukan", description: "Silakan isi nama kamu.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          profession: profession || null,
          age: age ? parseInt(age, 10) : null,
          city: city.trim() || null,
          country: country.trim() || null,
        })
        .eq("user_id", user!.id);

      if (error) throw error;

      localStorage.setItem(CONSENT_KEY, "true");
      navigate("/dashboard", { replace: true });
    } catch {
      toast({ title: "Gagal menyimpan", description: "Terjadi kesalahan, coba lagi.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border/50 bg-card/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Moon className="h-7 w-7 text-accent" />
          </div>
          <CardTitle className="font-serif text-2xl">Selamat Datang</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Sebelum mulai, lengkapi profil singkat dan setujui penyimpanan data kamu.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Nama kamu" maxLength={100} />
          </div>

          {/* Profession */}
          <div className="space-y-1.5">
            <Label htmlFor="profession">Profesi / Status</Label>
            <Select value={profession} onValueChange={setProfession}>
              <SelectTrigger id="profession">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mahasiswa">Mahasiswa</SelectItem>
                <SelectItem value="Siswa SMA/SMK">Siswa SMA/SMK</SelectItem>
                <SelectItem value="Alumni">Alumni</SelectItem>
                <SelectItem value="Profesional">Profesional</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <Label htmlFor="age">Usia</Label>
            <Input id="age" type="number" min={10} max={100} value={age} onChange={e => setAge(e.target.value)} placeholder="Contoh: 22" />
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">Kota</Label>
              <Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="Jakarta" maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Negara</Label>
              <Input id="country" value={country} onChange={e => setCountry(e.target.value)} placeholder="Indonesia" maxLength={100} />
            </div>
          </div>

          {/* Consent */}
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dengan mencentang kotak di bawah, saya menyetujui bahwa data jurnal dan profil saya disimpan di platform ini. 
                Platform akan menjaga kerahasiaan data sesuai ketentuan yang berlaku dan hanya digunakan untuk keperluan Ramadhan Journal.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="agree" checked={agreed} onCheckedChange={v => setAgreed(v === true)} />
              <Label htmlFor="agree" className="text-sm font-medium cursor-pointer">
                Saya setuju menyimpan data saya
              </Label>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={saving || !agreed} className="w-full">
            {saving ? "Menyimpan…" : "Lanjutkan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

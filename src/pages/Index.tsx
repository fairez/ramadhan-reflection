import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Moon, ChevronDown, BookOpen, CheckSquare, PenLine, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const sections = [
  { icon: PenLine, title: "A Letter for Me", desc: "Tuliskan pesan semangat untuk diri sendiri" },
  { icon: CheckSquare, title: "Ramadan Tracker", desc: "Lacak ibadah harianmu selama 30 hari" },
  { icon: BookOpen, title: "Time to Tadabbur", desc: "Tadabbur mingguan bersama Surah Ad-Dhuha" },
  { icon: Moon, title: "Qur'an Journaling", desc: "Catat refleksi dan hikmah dari Al-Qur'an" },
  { icon: Calendar, title: "Jadwal I'tikaf", desc: "Rencanakan jadwal I'tikaf 10 hari terakhir" },
  { icon: Heart, title: "Langitkan Do'amu", desc: "Ruang khusus untuk mencurahkan do'a" },
];

export default function Index() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-teal-deep/70 via-teal-dark/50 to-teal-deep/90" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center px-6 max-w-2xl"
        >
          <Moon className="h-14 w-14 text-gold mx-auto mb-6" />
          <h1 className="font-serif text-5xl md:text-7xl text-primary-foreground mb-4 leading-tight">
            Ramadhan<br />Journal
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 font-light">
            Jadikan Ramadhanmu makin <span className="text-gold italic">outstanding</span> dengan tadabbur dan refleksi mendalam
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={signInWithGoogle}
              size="lg"
              className="bg-gold hover:bg-gold-dark text-teal-deep font-semibold px-8 py-6 text-base rounded-xl shadow-elevated"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Masuk dengan Google
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById("sections")?.scrollIntoView({ behavior: "smooth" })}
              className="border-primary-foreground/30 text-black hover:bg-primary-foreground/10 px-8 py-6 text-base rounded-xl"
            >
              Lihat Fitur
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-6 w-6 text-primary-foreground/40" />
        </motion.div>
      </section>

      {/* Sections preview */}
      <section id="sections" className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-4 text-foreground">
            Isi <span className="text-gold">Jurnalmu</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
            Enam modul jurnal untuk menemani perjalanan Ramadhanmu dari hari pertama hingga terakhir
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sections.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow border"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-serif text-lg mb-2 text-card-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button onClick={signInWithGoogle} size="lg" className="bg-primary hover:bg-teal-dark text-primary-foreground px-8 py-6 rounded-xl">
              Mulai Jurnalmu
              <Moon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-hero py-8 px-6 text-center">
        <p className="text-primary-foreground/50 text-sm">
          © 2026 Ramadhan Journal — Terinspirasi oleh <span className="text-gold/70">@guidelight.id</span>
        </p>
      </footer>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Moon } from "lucide-react";

export default function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl bg-card/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-primary-foreground/10"
      >
        <Moon className="h-8 w-8 text-gold mb-6" />
        <h1 className="font-serif text-3xl md:text-4xl text-primary-foreground mb-6">
          Hi, <span className="text-gold">#LightSeekers</span>
        </h1>
        <div className="space-y-4 text-primary-foreground/80 text-sm md:text-base leading-relaxed">
          <p>
            Ramadhan adalah bulan yang Allah pilih sebagai waktu diturunkannya Al-Qur'an: sebagai petunjuk,
            penjelas kebenaran, dan pembeda antara yang hak dan batil.
          </p>
          <p>
            Ramadhan bukan hanya tentang seberapa banyak ayat yang kita kejar, tetapi seberapa dalam ayat
            itu membentuk cara kita berpikir, merasa, dan melangkah. <span className="text-gold italic">Tadabbur</span> adalah
            cara kita duduk lebih lama bersama Al-Qur'an.
          </p>
          <p>
            Semoga Jurnal Ramadhan ini menjadi teman setia tadabbur Al-Qur'anmu sepanjang Ramadhan.
            Dalam menemani langkah kecilmu menuju hati yang lebih terang, iman yang lebih hidup,
            dan hubungan yang lebih dekat dengan Allah.
          </p>
        </div>
        <div className="mt-8">
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="bg-gold hover:bg-gold-dark text-teal-deep font-semibold rounded-xl px-8"
          >
            Lanjutkan ke Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

# 🌙 Ramadhan Reflection

A private Ramadhan journaling and reflection web application designed to help users build consistency in reflection, self-evaluation (muhasabah), and daily spiritual growth.

This project focuses on simplicity, privacy, and structured reflection during the month of Ramadhan.

---

## ✨ Purpose

Ramadhan is not just about routine — it is about intentional growth.

This application helps users:

- Reflect daily with guided prompts  
- Journal insights privately  
- Track consistency throughout Ramadhan  
- Build self-awareness through structured reflection  

The system is designed for personal use — entries are private and tied to authenticated users.

---

## 🏗 Tech Stack

- **Frontend:** React + TypeScript  
- **Bundler:** Vite  
- **Styling:** TailwindCSS  
- **UI Components:** shadcn/ui  
- **Backend & Auth:** Supabase  
- **Deployment:** Netlify / Vercel (Static Hosting)

---

## 🚀 Local Development

### 1️⃣ Clone the repository

```bash
git clone https://github.com/fairez/ramadhan-reflection.git
cd ramadhan-reflection
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure environment variables

Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can obtain these values from your Supabase dashboard.

### 4️⃣ Run development server

```bash
npm run dev
```


## 📦 Available Scripts

```bash
npm run dev        # Start development
npm run build      # Production build
npm run preview    # Preview production build
```

---

## 🔐 Security Notes

- Do NOT commit `.env` files.
- Never expose service role keys in frontend code.
- Always enable RLS in Supabase.
- Keep the repository clean from secrets before pushing public.

---

## 📈 Future Improvements

- Daily guided reflection prompts
- Habit tracking dashboard
- Reflection analytics
- Multi-language support
- Ramadhan progress calendar
- Export to PDF / Markdown
- Reminder notifications

---

## 📄 License

MIT License

---

Built as a rapid prototype to validate structured spiritual journaling during Ramadhan.

# 🛡️ Nöbet Yönetim Sistemi

Özel güvenlik şirketleri için yarı-otomatik nöbet planlama sistemi.

## 🚀 Özellikler

### Personel Yönetimi
- 👥 Personel ekleme/silme/düzenleme
- 🎖️ Rol atama (Çavuş, Onbaşı, Er)
- 📊 Kıdem seviyesi (Normal, Kıdemli, Dede)
- 🚫 Alt rol filtreleme (Haberci, Santral hariç)

### İzin Takibi
- 🏖️ Çoklu izin türleri (Yıllık, Hafta sonu, Hastalık, Mükafat, Mazeret)
- 📅 Tarih aralığı ile izin tanımlama
- ⏰ Saat bazlı izin desteği

### Otomatik Nöbet
- 🤖 Çapraz, Kaya1, Kaya2 için otomatik planlama
- ⚖️ Adil dağıtım (kıdem önceliği)
- 🌙 18:00-22:00 özel kuralı (Çavuş + 1 Er)
- ✅ İzin kontrolü
- 📝 Manuel müdahale desteği

### Yeni Kural (v2.0)
- **Normal personel** → Günde max 2 nöbet (Sabah + Akşam)
- **Kıdemli/Dede** → Günde max 1 nöbet

## 🛠️ Kurulum

```bash
# Clone
git clone https://github.com/alexceogit/oc-duty-manager.git
cd oc-duty-manager

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add Supabase credentials to .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key

# Start development
npm run dev
```

## 🏗️ Deployment

### Vercel (Önerilen)
```bash
# Deploy to Vercel
npx vercel --prod

# Environment variables ekle:
# VITE_SUPABASE_URL
# VITE_SUPABASE_KEY
```

### Supabase Database Schema
```sql
-- Personnel table
create table personnel (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  main_role text not null,
  sub_role text,
  seniority text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Leaves table
create table leaves (
  id uuid default gen_random_uuid() primary key,
  personnel_id uuid references personnel(id),
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  start_time text,
  end_time text,
  is_approved boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Duty assignments table
create table duty_assignments (
  id uuid default gen_random_uuid() primary key,
  personnel_id uuid references personnel(id),
  location text not null,
  shift text,
  date date not null,
  is_manual boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table personnel enable row level security;
alter table leaves enable row level security;
alter table duty_assignments enable row level security;

-- Public access (demo)
create policy "Public access" on personnel for all using (true);
create policy "Public access" on leaves for all using (true);
create policy "Public access" on duty_assignments for all using (true);
```

## 📱 Kullanım

1. **Personel Ekle**: 👥 sekmesinden personel ekleyin
2. **İzin Gir**: 🏖️ sekmesinden izinleri kaydedin
3. **Nöbet Oluştur**: 🗓️ sekmesinde "Otomatik Oluştur"a tıklayın
4. **Manuel Düzelt**: Personeli sürükleyerek nöbet ekleyin/kaldırın

## 🔧 Teknoloji

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **State**: React Context API
- **Icons**: Heroicons (SVG)

## 📄 Lisans

MIT License

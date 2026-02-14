# 🛡️ OC-Duty Manager - Nöbet Yönetim Sistemi

**Versiyon:** 2.0.0  
**Son Güncelleme:** 2026-02-14  
**Teknoloji Stack:** React 19 + TypeScript + Supabase + Vite + Tailwind CSS 4

---

## 📋 İçindekiler

1. [Proje Hakkında](#proje-hakkında)
2. [Özellikler](#özellikler)
3. [Teknoloji Stack](#teknoloji-stack)
4. [Proje Yapısı](#proje-yapısı)
5. [Veritabanı Şeması](#veritabanı-şeması)
6. [API ve Servisler](#api-ve-servisler)
7. [Nöbet Algoritması](#nöbet-algoritması)
8. [Kurulum ve Deployment](#kurulum-ve-deployment)
9. [Kullanım Kılavuzu](#kullanım-kılavuzu)
10. [Biletlenmiş Buglar ve Çözümler](#biletlenmiş-buglar-ve-çözümler)
11. [Yapılacaklar](#yapılacaklar)

---

## 🏢 Proje Hakkında

OC-Duty Manager, özel güvenlik şirketleri için geliştirilmiş yarı-otomatik nöbet planlama sistemidir. Sistem, manuel süreçleri dijitalleştirerek:

- **Adil nöbet dağılımı** sağlar
- **Personel izinlerini** otomatik takip eder
- **İstisna kurallarını** yönetir
- **Görsel takvim** üzerinden planlamayı kolaylaştırır

### Hedef Kullanıcılar
- Güvenlik şirketi yöneticileri
- Nöbet planlaması yapan amirler
- Personel takip sistemi operatörleri

---

## ✨ Özellikler

### 👥 Personel Yönetimi

| Özellik | Açıklama |
|---------|----------|
| Ekleme/Silme/Düzenleme | CRUD operasyonları |
| Ana Rol Atama | Çavuş, Onbaşı, Er |
| Alt Rol Atama | Haberci, Santral, Yazıcı, Nizamiye, Şoför, Rolsüz |
| Kıdem Seviyesi | Normal, Kıdemli, Dede |
| Durum Takibi | Aktif/Pasif |

### 🏖️ İzin Takibi

| Özellik | Açıklama |
|---------|----------|
| İzin Türleri | Yıllık İzin, Hafta Sonu İzni, Hastalık İzni, Mükafat İzni, Mazeret İzni |
| Tarih Aralığı | Başlangıç ve bitiş tarihi |
| Saat Bazlı | Opsiyonel başlangıç/bitiş saati |
| Onay Sistemi | İzin onay akışı |
| Notlar | Opsiyonel açıklama alanı |

### 📅 Nöbet Planlama

| Özellik | Açıklama |
|---------|----------|
| Otomatik Planlama | Çapraz, Kaya1, Kaya2 için algoritmik dağılım |
| Manuel Müdahale | Sürükle-bırak ile manuel atama |
| Lokasyonlar | Çapraz, Kaya1, Kaya2, Nizamiye, 24cü, Santral |
| Vardiya Türleri | Gündüz 1, Gündüz 2, Akşam 1, Gece 1, Gece 2, Santral Gündüz/Gece |

### ⚙️ Gelişmiş Özellikler

| Özellik | Açıklama |
|---------|----------|
| İstisna Yönetimi | Personele özel vardiya/lokasyon muafiyetleri |
| Aylık Takvim | Tüm ayın nöbet görünümü |
| 8 Saat Kuralı | Ardışık nöbetler arası minimum dinlenme süresi |
| Gece Kısıtlaması | Dede rütbesi gece nöbeti alamaz |
| Gündüz Doldurma | Boş gündüz vardiyalarını gece personel ile doldurma |

---

## 🛠️ Teknoloji Stack

### Frontend
```
React 19.2.0          → UI Framework
TypeScript 5.9        → Type Safety
Vite 7.2.4           → Build Tool
Tailwind CSS 4.1     → Styling
React Router DOM 7.13 → Routing
```

### Backend-as-a-Service
```
Supabase (PostgreSQL) → Database & Auth
@supabase-js 2.95     → Client Library
```

### Yardımcı Kütüphaneler
```
date-fns 4.1         → Date Utilities
uuid 13.0            → ID Generation
@types/uuid 10       → TypeScript Types
```

### Development
```
ESLint 9.39          → Code Linting
TypeScript ESLint 8   → TS Linting
PostCSS 8.5          → CSS Processing
Autoprefixer 10      → CSS Vendor Prefixes
```

---

## 📁 Proje Yapısı

```
oc-duty-manager/
├── src/
│   ├── components/          # Reusable UI Components
│   │   ├── AddDutyModal.tsx       # Manuel nöbet ekleme modalı
│   │   ├── AddLeaveModal.tsx       # İzin ekleme modalı
│   │   ├── ConfirmationModal.tsx   # Onay modalı
│   │   ├── DutyScheduler.tsx        # Ana nöbet planlama componenti
│   │   ├── ExemptionSettings.tsx   # İstisna ayarları
│   │   ├── LeaveManager.tsx        # İzin yönetimi
│   │   ├── MonthlyAssignmentModal.tsx # Aylık atama modalı
│   │   ├── MonthlyCalendar.tsx     # Aylık takvim görünümü
│   │   ├── PersonnelFormModal.tsx  # Personel form modalı
│   │   ├── PersonnelList.tsx       # Personel listesi
│   │   ├── ProtectedRoute.tsx      # Korumalı route
│   │   └── SettingsPanel.tsx       # Ayarlar paneli
│   │
│   ├── context/            # State Management
│   │   └── AppContext.tsx   # Global state (React Context + Reducer)
│   │
│   ├── pages/              # Page Components
│   │   └── LoginPage.tsx   # Login sayfası
│   │
│   ├── services/           # API Services
│   │   └── supabase.ts     # Supabase client ve helper fonksiyonları
│   │
│   ├── types/              # TypeScript Types
│   │   └── index.ts        # Tüm type tanımları
│   │
│   ├── utils/              # Utility Functions
│   ├── hooks/              # Custom React Hooks
│   ├── assets/             # Static Assets
│   ├── App.tsx             # Ana App Component
│   ├── main.tsx            # Entry Point
│   ├── index.css           # Global Styles
│   └── config.ts           # Environment Configuration
│
├── supabase/
│   └── schema.sql          # Database Schema
│
├── scripts/                # Utility Scripts
├── public/                 # Public Static Files
├── dist/                   # Production Build
│
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript Config
├── vite.config.ts          # Vite Config
├── tailwind.config.js      # Tailwind Config
├── eslint.config.js        # ESLint Config
│
├── .env                    # Environment Variables (local)
├── .env.example            # Environment Template
├── .gitignore
│
├── README.md               # Proje Dokümantasyonu
└── SUPABASE_INTEGRATION.md # Supabase Entegrasyon Rehberi
```

---

## 🗄️ Veritabanı Şeması

### Tablolar

#### 1. profiles (Kullanıcı Profilleri)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexler:**
- `idx_profiles_role` → role kolonu

**RLS Politikaları:**
- Kullanıcılar kendi profillerini görüntüleyebilir
- Adminler tüm profilleri görebilir/değiştirebilir

---

#### 2. personnel (Personel)
```sql
CREATE TABLE personnel (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  main_role TEXT NOT NULL CHECK (main_role IN ('Çavuş', 'Onbaşı', 'Er')),
  sub_role TEXT CHECK (sub_role IN ('Haberci', 'Santral', 'Yazıcı', 'Nizamiye', 'Şoför', 'Rolsüz')),
  seniority TEXT NOT NULL CHECK (seniority IN ('Normal', 'Kıdemli', 'Dede')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexler:**
- `idx_personnel_is_active` → is_active kolonu
- `idx_personnel_last_name` → last_name kolonu

**RLS Politikaları:**
- Authenticated kullanıcılar aktif personeli görebilir
- Sadece adminler personel ekleyebilir/silebilir

---

#### 3. leaves (İzinler)
```sql
CREATE TABLE leaves (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('Yıllık İzin', 'Hafta Sonu İzni', 'Hastalık İzni', 'Mükafat İzni', 'Mazeret İzni')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_approved BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexler:**
- `idx_leaves_dates` → start_date, end_date
- `idx_leaves_personnel` → personnel_id

**RLS Politikaları:**
- Authenticated kullanıcılar onaylı izinleri görebilir
- Admin/manager izinleri yönetebilir

---

#### 4. duty_assignments (Nöbet Atamaları)
```sql
CREATE TABLE duty_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('Çapraz', 'Kaya1', 'Kaya2', 'Nizamiye', 'Santral')),
  shift TEXT CHECK (shift IN ('Gündüz 1', 'Gündüz 2', 'Akşam 1', 'Gece 1', 'Gece 2')),
  date DATE NOT NULL,
  is_manual BOOLEAN DEFAULT false,
  is_devriye BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexler:**
- `idx_duties_date` → date kolonu
- `idx_duties_personnel` → personnel_id kolonu

**Not:** `personnel_id` için NULL değerine izin verilmez. Devriye atamaları için `'devriye-sistem-placeholder'` UUID'si kullanılır.

**RLS Politikaları:**
- Authenticated kullanıcılar tüm atamaları görebilir
- Sadece admin/manager atamaları değiştirebilir

---

#### 5. personnel_exemptions (İstisnalar)
```sql
CREATE TABLE personnel_exemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE NOT NULL,
  exemption_type TEXT NOT NULL CHECK (exemption_type IN ('shift', 'location', 'shift_location')),
  target_value TEXT NOT NULL,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Exemption Tipleri:**
- `shift` → Belirli vardiya (örn: "Gece 1")
- `location` → Belirli lokasyon (örn: "Kaya1")
- `shift_location` → Vardiya + Lokasyon kombinasyonu (örn: "Gece 1|Kaya2")

---

### Row Level Security (RLS)

Tüm tablolarda RLS etkinleştirilmiştir:

```sql
-- RLS Enable
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## 🔌 API ve Servisler

### Supabase Client (`src/services/supabase.ts`)

#### Bağlantı
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);
```

#### Helper Fonksiyonları

| Fonksiyon | Açıklama | Parametreler |
|-----------|----------|--------------|
| `testConnection()` | Bağlantı testi | - |
| `getPersonnel()` | Aktif personeli getir | - |
| `addPersonnel(person)` | Personel ekle | Person object |
| `updatePersonnel(id, updates)` | Personel güncelle | id, updates |
| `deletePersonnel(id)` | Personel sil (soft delete) | id |
| `getLeaves(startDate?, endDate?)` | İzinleri getir | Tarih aralığı (opsiyonel) |
| `addLeave(leave)` | İzin ekle | Leave object |
| `getDuties(date?)` | Nöbetleri getir | Tarih (opsiyonel) |
| `getDutiesByMonth(startDate, endDate)` | Aylık nöbetler | Tarih aralığı |
| `addDuty(duty)` | Nöbet ekle | Duty object |
| `updateDuty(id, updates)` | Nöbet güncelle | id, updates |
| `deleteDuty(id)` | Nöbet sil | id |
| `clearDutiesForDate(date)` | Tarihe ait otomatik nöbetleri temizle | date |
| `getExemptions()` | İstisnaları getir | - |
| `addExemption(exemption)` | İstisna ekle | Exemption object |
| `updateExemption(id, updates)` | İstisna güncelle | id, updates |
| `deleteExemption(id)` | İstisna sil (soft delete) | id |

---

## 🧮 Nöbet Algoritması

### Çalışma Mantığı

Algoritma (`src/context/AppContext.tsx` → `runAutoSchedule()` fonksiyonu):

```
1. Uygun personel filtreleme
   ├── Aktif personel
   ├── İzinde olmayan
   ├── Günlük nöbet limitini aşmayan
   └── Vardiya kısıtlamalarına uygun

2. Kıdem önceliği sıralama
   ├── Normal → Kıdemli → Dede
   └── Her kıdem grubu eşit dağılım

3. Vardiya bazlı atama (sıralı işlem)
   ├── Akşam 1 → Gece 1 → Gece 2 → Gündüz 1 → Gündüz 2
   └── Her vardiya için lokasyon bazlı dağılım

4. 8 saat kuralı kontrolü
   └── Ardışık nöbetler arası minimum 8 saat dinlenme

5. Devriye fallback
   └── Personel bulunamazsa "Devriye" ataması
```

### Kıdem Öncelik Matrisi

| Kıdem | Günlük Max Nöbet | Gece Nöbeti | Öncelik |
|-------|------------------|-------------|---------|
| Normal | 2 | ✅ Evet | En düşük |
| Kıdemli | 1 | ✅ Evet | Orta |
| Dede | 1 | ❌ Hayır | En yüksek |

### Lokasyon Bazlı Kapasite

| Lokasyon | Gündüz Vardiya | Akşam/Gece Vardiya |
|----------|----------------|---------------------|
| Çapraz | 1 kişi | 1 kişi |
| Kaya1 | 1 kişi | 2 kişi |
| Kaya2 | 1 kişi | 2 kişi |

### Vardiya Saatleri

| Vardiya | Saat Aralığı | Süre |
|---------|--------------|------|
| Gündüz 1 | 06:00 - 12:00 | 6 saat |
| Gündüz 2 | 12:00 - 18:00 | 6 saat |
| Akşam 1 | 18:00 - 22:00 | 4 saat |
| Gece 1 | 22:00 - 02:00 | 4 saat |
| Gece 2 | 02:00 - 06:00 | 4 saat |

### Özel Kurallar

1. **8 Saat Dinlenme Kuralı:** Ardışık vardiyalar arasında minimum 8 saat olmalı
2. **Dede Kısıtlaması:** Dede rütbesi gece vardiyalarına (Gece 1, Gece 2) atanamaz
3. **Alt Rol Hariç Tutma:** Haberci ve Santral sub-rolleri otomatik planlamaya dahil edilmez
4. **Gündüz Doldurma:** Boş gündüz vardiyaları, gece vardiyalarından personel çekilerek doldurulabilir

---

## 🚀 Kurulum ve Deployment

### Yerel Geliştirme Ortamı

```bash
# 1. Projeyi klonla
git clone https://github.com/alexceogit/oc-duty-manager.git
cd oc-duty-manager

# 2. Bağımlılıkları yükle
npm install

# 3. Environment variables dosyası oluştur
cp .env.example .env

# 4. .env dosyasını düzenle
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_KEY=your-anon-key

# 5. Development server başlat
npm run dev
```

### Vercel Deployment

```bash
# 1. Vercel CLI ile giriş yap
npx vercel login

# 2. Environment variables ekle
# Vercel Dashboard → Settings → Environment Variables
# VITE_SUPABASE_URL
# VITE_SUPABASE_KEY

# 3. Deploy et
npx vercel --prod
```

### Supabase Kurulumu

```bash
# 1. Supabase projesi oluştur
# https://supabase.com

# 2. Schema'yı çalıştır
# Supabase Dashboard → SQL Editor → Run supabase-schema.sql

# 3. RLS politikalarını doğrula
# Supabase Dashboard → Authentication → Policies
```

### Environment Variables

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_KEY` | Supabase anon key | `eyJhbGci...` |

---

## 📖 Kullanım Kılavuzu

### 1. Personel Ekleme

1. 👥 **Personel** sekmesine tıkla
2. **+ Ekle** butonuna tıkla
3. Formu doldur:
   - Ad, Soyad
   - Ana Rol (Çavuş/Onbaşı/Er)
   - Alt Rol (opsiyonel)
   - Kıdem (Normal/Kıdemli/Dede)
4. **Kaydet** butonuna tıkla

### 2. İzin Girme

1. 🏖️ **İzinler** sekmesine tıkla
2. **+ İzin Ekle** butonuna tıkla
3. Formu doldur:
   - Personel seç
   - İzin türü seç
   - Başlangıç/Bitiş tarihi
   - Saat aralığı (opsiyonel)
   - Not (opsiyonel)
4. **Kaydet** butonuna tıkla

### 3. Otomatik Nöbet Oluşturma

1. 🗓️ **Nöbetler** sekmesine tıkla
2. Tarih seç (navigasyon butonları ile)
3. **Otomatik Oluştur** butonuna tıkla
4. Sistem nöbetleri otomatik oluşturur
5. **Kaydet** onay modalını onayla

### 4. Manuel Nöbet Ekleme

**Yöntem 1: Sürükle-Bırak**
1. 👥 Personel listesinden bir personeli sürükle
2. Uygun vardiya slotuna bırak

**Yöntem 2: Modal ile Ekleme**
1. Vardiya slotundaki **+** butonuna tıkla
2. Modal'dan personel seç
3. **Kaydet** butonuna tıkla

### 5. Devriye Ataması

1. Manuel nöbet modalını aç
2. **"Tüm Vardiyayı DEVRİYE Yap"** checkbox'ını işaretle
3. **Kaydet** butonuna tıkla
4. Slot "🚨 DEVRİYE" olarak görünür

### 6. Aylık Takvim Görünümü

1. 📅 **Aylık Takvim** sekmesine tıkla
2. Ay navigasyonu ile geçmiş/gelecek aylara git
3. Her gün için nöbet dağılımını gör
4. Düzenlemek için güne tıkla

### 7. İstisna Yönetimi

1. ⚙️ **Ayarlar** sekmesine tıkla
2. **İstisna Yönetimi** bölümüne git
3. **+ İstisna Ekle** butonuna tıkla
4. İstisna türünü seç:
   - **Vardiya:** Belirli bir vardiya için muaf
   - **Lokasyon:** Belirli bir lokasyon için muaf
   - **Vardiya+Lokasyon:** Kombineli muafiyet
5. Personel seç ve kaydet

---

## 🐛 Biletlenmiş Buglar ve Çözümler

### Bug #1: Devriye Nöbetlerinde "Undefined" Görünümü

**Tarih:** 2026-02-14  
**Durum:** ✅ Çözüldü

**Problem:**
Devriye nöbetleri kaydedildikten sonra frontend'de "undefined" olarak görünüyordu.

**Kök Neden:**
`savePendingDuties()` fonksiyonunda devriye nöbetleri için `personnel_id: null` gönderiliyordu. Ancak Supabase veritabanında `NOT NULL` constraint'i bulunuyordu, bu nedenle kayıt başarısız oluyordu.

**Çözüm:**
```typescript
// Önce (HATALI):
personnel_id: isDevriye ? null : personnelId

// Sonra (DOĞRU):
personnel_id: isDevriye ? 'devriye-sistem-placeholder' : personnelId
```

**Dosya:** `src/context/AppContext.tsx`  
**Satır:** ~800

---

### Bug #2: Pending Duties Silme Sorunu

**Tarih:** 2026-02-10  
**Durum:** ✅ Çözüldü

**Problem:**
Manuel olarak eklenen nöbetler (pending) silinemiyordu.

**Kök Neden:**
`deleteDuty()` fonksiyonu sadece kaydedilmiş nöbetleri siliyor, pending nöbetleri ignore ediyordu.

**Çözüm:**
Fonksiyona pending duty kontrolü eklendi:
```typescript
const pendingDuty = state.pendingDuties.find(d => d.id === id);
if (pendingDuty) {
  dispatch({ type: 'SET_PENDING_DUTIES', payload: state.pendingDuties.filter(d => d.id !== id) });
} else {
  // Supabase'den sil
}
```

---

### Bug #3: Veri Senkronizasyonu

**Tarih:** 2026-02-10  
**Durum:** ✅ Çözüldü

**Problem:**
Nöbetler kaydedildikten sonra veriler otomatik yenilenmiyordu.

**Çözüm:**
`savePendingDuties()` fonksiyonunun sonuna `refreshData()` çağrısı eklendi.

---

## 📋 Yapılacaklar (Roadmap)

### v2.1 (Kısa Vadeli)
- [ ] Nizamiye lokasyonu için tam entegrasyon
- [ ] Santral lokasyonu için tam entegrasyon
- [ ] Excel export özelliği
- [ ] PDF rapor oluşturma

### v2.2 (Orta Vadeli)
- [ ] Çoklu lokasyon desteği
- [ ] Mobil uygulama (React Native)
- [ ] Push notification
- [ ] Personnel performance analytics

### v3.0 (Uzun Vadeli)
- [ ] AI-based scheduling optimization
- [ ] Multi-company support
- [ ] API for third-party integrations
- [ ] White-label solution

---

## 📞 Destek

**Proje Sahibi:** AlexCEO  
**GitHub:** https://github.com/alexceogit/oc-duty-manager  
**Deployment:** https://oc-duty-manager.vercel.app

---

## 📄 Lisans

MIT License

---

## 🏗️ Son Build Bilgileri

```
Build Date: 2026-02-14
Build Command: npm run build
Output: dist/
Bundle Size: ~535 kB (gzipped: ~150 kB)
Type Checking: TypeScript 5.9
ESLint: Configured
```

---

*Bu dokümantasyon OC-Duty Manager v2.0 için hazırlanmıştır.*

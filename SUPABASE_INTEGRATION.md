# 🛡️ Nöbet Yönetim Sistemi - Supabase Entegrasyonu

## 📋 Database Schema

```bash
# Supabase SQL Editor'da çalıştır
supabase-schema.sql
```

Bu dosya şunları oluşturur:
- `personnel` - Personel tablosu
- `leaves` - İzinler tablosu  
- `duty_assignments` - Nöbet atamaları tablosu

## 🌱 Mock Data (Test İçin)

### Supabase'e Mock Data Ekleme

```bash
# Environment variables ayarla
export VITE_SUPABASE_URL=https://your-project.supabase.co
export VITE_SUPABASE_KEY=your-anon-key

# Seed script çalıştır
npm run seed
```

### Local Mock Data

Uygulama Supabase bağlantısı olmadan da çalışır - otomatik mock data kullanır.

## 🔧 Environment Variables

```bash
# .env dosyası oluştur
cp .env.example .env

# Doldur:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

## 📊 Mock Data İçeriği

| Kategori | Sayı |
|----------|------|
| Çavuş | 3 |
| Onbaşı | 3 |
| Er (Normal) | 5 |
| Er (Kıdemli) | 2 |
| Er (Dede) | 2 |
| Özel Roller | 5 |
| **Toplam** | **20** |

## 🏗️ Supabase Kurulum

1. https://supabase.com'da yeni proje oluştur
2. SQL Editor'da `supabase-schema.sql` çalıştır
3. Project URL ve Anon Key al
4. `.env` dosyasına ekle
5. `npm run seed` ile mock data ekle

## 📁 Dosya Yapısı

```
oc-duty-manager/
├── supabase-schema.sql    # Database schema
├── scripts/
│   └── seed.ts            # Mock data seeder
└── src/
    └── services/
        ├── supabase.ts     # Supabase client
        └── mockData.ts     # Local mock data
```

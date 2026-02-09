import { createClient } from '@supabase/supabase-js';

const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaXRkZ2lqZ3R2c2R5aWFuamx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY0NzU3NiwiZXhwIjoyMDg2MjIzNTc2fQ.xzXkXecSw-MNSD8532yzNGaPFmzkDTLy4ov6rC3IXBg';
const supabaseUrl = 'https://fbitdgijgtvsdyianjlz.supabase.co';

const supabase = createClient(supabaseUrl, serviceKey);

const personnel = [
  { first_name: 'Mete', last_name: 'ANDAÇ', main_role: 'Çavuş', sub_role: 'Nizamiye', seniority: 'Kıdemli' },
  { first_name: 'Hüseyin', last_name: 'KARAÇALI', main_role: 'Çavuş', sub_role: 'Şoför', seniority: 'Kıdemli' },
  { first_name: 'Hasan Boray', last_name: 'ATARKAN', main_role: 'Çavuş', sub_role: null, seniority: 'Kıdemli' },
  { first_name: 'Hasan', last_name: 'KUMBUR', main_role: 'Çavuş', sub_role: 'Yazıcı', seniority: 'Normal' },
  { first_name: 'Görkem', last_name: 'SERINOVA', main_role: 'Çavuş', sub_role: null, seniority: 'Normal' },
  { first_name: 'Zafer İsa', last_name: 'TOSUN', main_role: 'Çavuş', sub_role: null, seniority: 'Normal' },
  { first_name: 'Alican', last_name: 'YÜCEL', main_role: 'Er', sub_role: null, seniority: 'Kıdemli' },
  { first_name: 'Ataberk', last_name: 'BAL', main_role: 'Er', sub_role: null, seniority: 'Kıdemli' },
  { first_name: 'Ahmet Şadi', last_name: 'AKGÖNÜL', main_role: 'Er', sub_role: null, seniority: 'Kıdemli' },
  { first_name: 'Barış', last_name: 'ÇUBUK', main_role: 'Er', sub_role: 'Santral', seniority: 'Kıdemli' },
  { first_name: 'Çağrı', last_name: 'KARABEY', main_role: 'Er', sub_role: 'Haberci', seniority: 'Kıdemli' },
  { first_name: 'Kubilay', last_name: 'ÖNDER', main_role: 'Er', sub_role: 'Haberci', seniority: 'Kıdemli' },
  { first_name: 'Mustafa', last_name: 'KUBİLAY', main_role: 'Er', sub_role: null, seniority: 'Kıdemli' },
  { first_name: 'Orhan', last_name: 'EVRAN', main_role: 'Er', sub_role: null, seniority: 'Kıdemli' },
  { first_name: 'Tayfun', last_name: 'ÖZBOLAT', main_role: 'Er', sub_role: null, seniority: 'Kıdemli' },
  { first_name: 'Osman', last_name: 'YENİÇERİ', main_role: 'Er', sub_role: 'Santral', seniority: 'Normal' },
  { first_name: 'Ramazan Ali', last_name: 'GÜRBÜZ', main_role: 'Er', sub_role: null, seniority: 'Normal' },
  { first_name: 'Hüseyin', last_name: 'TUR', main_role: 'Er', sub_role: null, seniority: 'Normal' },
  { first_name: 'Özer', last_name: 'YAĞLI', main_role: 'Er', sub_role: null, seniority: 'Normal' },
  { first_name: 'Metehan', last_name: 'GÖK', main_role: 'Er', sub_role: null, seniority: 'Normal' },
  { first_name: 'Murat', last_name: 'ALKIN', main_role: 'Er', sub_role: null, seniority: 'Normal' },
  { first_name: 'İsmail Talha', last_name: 'TIBIK', main_role: 'Er', sub_role: null, seniority: 'Normal' },
  { first_name: 'Yener Vladislav', last_name: 'ÖZKIRAÇ', main_role: 'Er', sub_role: null, seniority: 'Normal' },
];

console.log(personnel.length + ' personel ekleniyor...');

const { data, error } = await supabase.from('personnel').insert(personnel);

if (error) {
  console.log('Hata:', error.message);
} else {
  console.log('Basarili! ' + personnel.length + ' personel eklendi.');
}

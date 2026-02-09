// ============================================
// SETTINGS PANEL COMPONENT
// ============================================

import { useApp } from '../context/AppContext';

export default function SettingsPanel() {
  const { state } = useApp();

  return (
    <div className="space-y-6">
      {/* Algorithm Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          ⚙️ Otomatik Nöbet Algoritması Ayarları
        </h2>

        <div className="space-y-4">
          {/* Multiple Duties per Day */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Günde Birden Fazla Nöbet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Normal personelin günde 2 nöbet yapmasına izin ver
              </p>
            </div>
            <div className="relative inline-block w-12 h-6 align-middle select-none">
              <input
                type="checkbox"
                checked={state.settings.allowMultipleDutiesPerDay}
                readOnly
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-indigo-600"
              />
              <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                state.settings.allowMultipleDutiesPerDay ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`} />
            </div>
          </div>

          {/* Max Duties Normal */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Normal Personel Maksimum
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Normal kıdemli personel günde max X nöbet
              </p>
            </div>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {state.settings.maxDutiesPerDayNormal}
            </span>
          </div>

          {/* Max Duties Senior */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Kıdemli/Dede Personel Maksimum
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Kıdemli ve dede personel günde max X nöbet
              </p>
            </div>
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {state.settings.maxDutiesPerDaySenior}
            </span>
          </div>

          {/* Excluded Sub-roles */}
          <div className="py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white mb-2">
              Otomatik Nöbete Dahil Edilmeyecek Roller
            </p>
            <div className="flex flex-wrap gap-2">
              {state.settings.excludeSubRoles.map(role => (
                <span
                  key={role}
                  className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm"
                >
                  {role}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Haberci ve Santral personeli manuel olarak atanır.
            </p>
          </div>

          {/* Priority Order */}
          <div className="py-3">
            <p className="font-medium text-gray-900 dark:text-white mb-2">
              Öncelik Sırası (Düşük → Yüksek Yük)
            </p>
            <div className="flex flex-wrap gap-2">
              {state.settings.priorityOrder.map((level, index) => (
                <div
                  key={level}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className={
                    level === 'Dede' ? 'text-purple-600 dark:text-purple-400' :
                    level === 'Kıdemli' ? 'text-blue-600 dark:text-blue-400' :
                    'text-green-600 dark:text-green-400'
                  }>
                    {level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 18:00-22:00 Special Rule */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-3">
          🌙 18:00-22:00 Özel Kuralı
        </h3>
        <div className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
          <p>✓ Öncelik çavuşlardadır</p>
          <p>✓ Yanında mutlaka 1 er bulunmalıdır</p>
          <p>✓ Gündüz vardiyalarında çavuşu zorlamamak için</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📊 İstatistikler
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {state.personnel.filter(p => p.isActive).length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Aktif Personel</p>
          </div>
          
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {state.personnel.filter(p => p.seniority === 'Normal').length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Normal</p>
          </div>
          
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {state.personnel.filter(p => p.seniority === 'Kıdemli').length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Kıdemli</p>
          </div>
          
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {state.personnel.filter(p => p.seniority === 'Dede').length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dede</p>
          </div>
        </div>

        <div className="mt-4 text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            📅 Bugün {state.currentDate.toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>

      {/* Export */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📤 Dışa Aktar
        </h2>
        
        <div className="flex gap-3">
          <button className="flex-1 btn-primary flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF Olarak İndir
          </button>
          
          <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel Olarak İndir
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          💾 Veri Yönetimi
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Supabase Durumu</p>
              <p className="text-sm text-gray-500">
                {state.supabaseConnected ? 'Bağlandı' : 'Bağlanmadı'}
              </p>
            </div>
            <span className={`w-3 h-3 rounded-full ${state.supabaseConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

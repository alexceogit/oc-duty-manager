// ============================================
// MONTHLY ASSIGNMENT MODAL
// ============================================

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { DutyAssignment } from '../types';

// Local interface for day assignment data
interface DayAssignment {
  date: Date;
  nizamiye?: DutyAssignment;
  yirmiDortcu?: DutyAssignment;
  santralGündüz?: DutyAssignment;
  santralGece?: DutyAssignment;
}

interface MonthlyAssignmentModalProps {
  date: Date;
  existingAssignments?: DayAssignment;
  onClose: () => void;
}

export default function MonthlyAssignmentModal({ 
  date, 
  existingAssignments,
  onClose 
}: MonthlyAssignmentModalProps) {
  const { state, addDuty, deleteDuty } = useApp();
  
  // Selected personnel
  const [nizamiyePersonnel, setNizamiyePersonnel] = useState<string | null>(
    existingAssignments?.nizamiye?.personnelId || null
  );
  const [yirmiDortcuPersonnel, setYirmiDortcuPersonnel] = useState<string | null>(
    existingAssignments?.yirmiDortcu?.personnelId || null
  );
  const [santralGündüzPersonnel, setSantralGündüzPersonnel] = useState<string | null>(
    existingAssignments?.santralGündüz?.personnelId || null
  );
  const [santralGecePersonnel, setSantralGecePersonnel] = useState<string | null>(
    existingAssignments?.santralGece?.personnelId || null
  );

  const dateStr = date.toISOString().split('T')[0];

  // Get all existing assignments for this date (including from other locations)
  const allExistingDuties = useMemo(() => {
    return state.duties.filter(d => 
      new Date(d.date).toISOString().split('T')[0] === dateStr
    );
  }, [state.duties, dateStr]);

  // Available personnel for this date
  const availablePersonnel = useMemo(() => {
    return state.personnel.filter(p => {
      if (!p.isActive) return false;
      
      // Check if on leave
      const onLeave = state.leaves.some(l => {
        if (l.personnelId !== p.id) return false;
        const leaveStart = new Date(l.startDate);
        const leaveEnd = new Date(l.endDate);
        const checkDate = new Date(dateStr);
        return checkDate >= leaveStart && checkDate <= leaveEnd;
      });
      
      if (onLeave) return false;

      // Check if already has 2 duties (normal) or 1 (senior)
      const existingDuties = allExistingDuties.filter(d => d.personnelId === p.id);
      const maxDuties = p.seniority === 'Normal' ? 2 : 1;
      
      return existingDuties.length < maxDuties;
    });
  }, [state.personnel, state.leaves, allExistingDuties, dateStr]);

  // Validation states
  const hasNizamiye = !!nizamiyePersonnel;
  const hasYirmiDortcu = !!yirmiDortcuPersonnel;
  const hasSantral = !!santralGündüzPersonnel && !!santralGecePersonnel;
  const isValid = hasYirmiDortcu && hasSantral;

  // Handle save
  const handleSave = async () => {
    // Remove existing assignments for these locations
    if (existingAssignments?.nizamiye) {
      deleteDuty(existingAssignments.nizamiye.id);
    }
    if (existingAssignments?.yirmiDortcu) {
      deleteDuty(existingAssignments.yirmiDortcu.id);
    }
    if (existingAssignments?.santralGündüz) {
      deleteDuty(existingAssignments.santralGündüz.id);
    }
    if (existingAssignments?.santralGece) {
      deleteDuty(existingAssignments.santralGece.id);
    }

    // Add new assignments with error handling
    const errors: string[] = [];

    if (nizamiyePersonnel) {
      try {
        await addDuty({
          personnelId: nizamiyePersonnel,
          location: 'Nizamiye',
          date: new Date(dateStr),
          isManual: true
        });
      } catch (e: any) {
        errors.push(`Nizamiye: ${e.message}`);
      }
    }

    if (yirmiDortcuPersonnel) {
      try {
        await addDuty({
          personnelId: yirmiDortcuPersonnel,
          location: '24cü',
          date: new Date(dateStr),
          isManual: true
        });
      } catch (e: any) {
        errors.push(`24.cü: ${e.message}`);
      }
    }

    if (santralGündüzPersonnel) {
      try {
        await addDuty({
          personnelId: santralGündüzPersonnel,
          location: 'Santral',
          shift: 'Santral Gündüz',
          date: new Date(dateStr),
          isManual: true
        });
      } catch (e: any) {
        errors.push(`Santral Gündüz: ${e.message}`);
      }
    }

    if (santralGecePersonnel) {
      try {
        await addDuty({
          personnelId: santralGecePersonnel,
          location: 'Santral',
          shift: 'Santral Gece',
          date: new Date(dateStr),
          isManual: true
        });
      } catch (e: any) {
        errors.push(`Santral Gece: ${e.message}`);
      }
    }

    if (errors.length > 0) {
      alert('Hata oluştu:\n' + errors.join('\n'));
    }
    onClose();
  };

  const getPersonName = (id: string | null) => {
    if (!id) return null;
    const person = state.personnel.find(p => p.id === id);
    return person ? `${person.firstName} ${person.lastName}` : null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              📅 {date.toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Aylık nöbet ataması
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Validation Summary */}
          <div className={`p-4 rounded-lg ${
            isValid 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {isValid ? (
                <span className="text-green-600 dark:text-green-400">✅</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">⚠️</span>
              )}
              <span className={`font-medium ${isValid ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                {isValid ? 'Atamalar tamamlandı' : 'Eksik atamalar var'}
              </span>
            </div>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span>{hasNizamiye ? '✅' : '○'}</span>
                <span>Nizamiye (opsiyonel)</span>
              </li>
              <li className="flex items-center gap-2">
                <span>{hasYirmiDortcu ? '✅' : '❌'}</span>
                <span>24cü (zorunlu)</span>
              </li>
              <li className="flex items-center gap-2">
                <span>{hasSantral ? '✅' : '❌'}</span>
                <span>Santral - 2 vardiya (zorunlu)</span>
              </li>
            </ul>
          </div>

          {/* Nizamiye Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                🏛️ Nizamiye (24 saat) - Opsiyonel
              </h3>
            </div>
            <div className="p-4">
              {nizamiyePersonnel ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      state.personnel.find(p => p.id === nizamiyePersonnel)?.seniority === 'Dede' ? 'bg-purple-100 text-purple-700' :
                      state.personnel.find(p => p.id === nizamiyePersonnel)?.seniority === 'Kıdemli' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {state.personnel.find(p => p.id === nizamiyePersonnel)?.firstName[0]}
                      {state.personnel.find(p => p.id === nizamiyePersonnel)?.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getPersonName(nizamiyePersonnel)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {state.personnel.find(p => p.id === nizamiyePersonnel)?.mainRole}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNizamiyePersonnel(null)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <select
                  value=""
                  onChange={(e) => setNizamiyePersonnel(e.target.value || null)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="">Personel seçin (opsiyonel)</option>
                  {availablePersonnel
                    .filter(p => !yirmiDortcuPersonnel || p.id !== yirmiDortcuPersonnel)
                    .filter(p => !santralGündüzPersonnel || p.id !== santralGündüzPersonnel)
                    .filter(p => !santralGecePersonnel || p.id !== santralGecePersonnel)
                    .map(person => (
                      <option key={person.id} value={person.id}>
                        {person.firstName} {person.lastName} ({person.mainRole})
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>

          {/* 24cü Section */}
          <div className={`border rounded-lg overflow-hidden ${
            yirmiDortcuPersonnel 
              ? 'border-green-200 dark:border-green-800' 
              : 'border-red-200 dark:border-red-800'
          }`}>
            <div className={`px-4 py-3 border-b ${
              yirmiDortcuPersonnel 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <h3 className={`font-semibold ${
                yirmiDortcuPersonnel 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                🚨 24cü (24 saat) - Zorunlu
              </h3>
            </div>
            <div className="p-4">
              {yirmiDortcuPersonnel ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      state.personnel.find(p => p.id === yirmiDortcuPersonnel)?.seniority === 'Dede' ? 'bg-purple-100 text-purple-700' :
                      state.personnel.find(p => p.id === yirmiDortcuPersonnel)?.seniority === 'Kıdemli' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {state.personnel.find(p => p.id === yirmiDortcuPersonnel)?.firstName[0]}
                      {state.personnel.find(p => p.id === yirmiDortcuPersonnel)?.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getPersonName(yirmiDortcuPersonnel)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {state.personnel.find(p => p.id === yirmiDortcuPersonnel)?.mainRole}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setYirmiDortcuPersonnel(null)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                    ⚠️ Bu alan zorunludur!
                  </p>
                  <select
                    value=""
                    onChange={(e) => setYirmiDortcuPersonnel(e.target.value || null)}
                    className="w-full p-3 border border-red-300 dark:border-red-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Personel seçin (zorunlu)</option>
                    {availablePersonnel
                      .filter(p => !nizamiyePersonnel || p.id !== nizamiyePersonnel)
                      .filter(p => !santralGündüzPersonnel || p.id !== santralGündüzPersonnel)
                      .filter(p => !santralGecePersonnel || p.id !== santralGecePersonnel)
                      .map(person => (
                        <option key={person.id} value={person.id}>
                          {person.firstName} {person.lastName} ({person.mainRole})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Santral Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-orange-50 dark:bg-orange-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-orange-700 dark:text-orange-300">
                📞 Santral (2 vardiya) - Zorunlu
              </h3>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Gündüz: 08:00-20:00 | Gece: 20:00-08:00
              </p>
            </div>
            <div className="p-4 space-y-4">
              {/* Santral Gündüz */}
              <div className={`p-3 rounded-lg ${
                santralGündüzPersonnel 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-slate-700/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    🌅 Gündüz Vardiyası (08:00-20:00)
                  </span>
                  {santralGündüzPersonnel ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Atandı</span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Gerekli</span>
                  )}
                </div>
                {santralGündüzPersonnel ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        state.personnel.find(p => p.id === santralGündüzPersonnel)?.seniority === 'Dede' ? 'bg-purple-100 text-purple-700' :
                        state.personnel.find(p => p.id === santralGündüzPersonnel)?.seniority === 'Kıdemli' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {state.personnel.find(p => p.id === santralGündüzPersonnel)?.firstName[0]}
                        {state.personnel.find(p => p.id === santralGündüzPersonnel)?.lastName[0]}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getPersonName(santralGündüzPersonnel)}
                      </span>
                    </div>
                    <button
                      onClick={() => setSantralGündüzPersonnel(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <select
                    value=""
                    onChange={(e) => setSantralGündüzPersonnel(e.target.value || null)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-sm"
                  >
                    <option value="">Seçiniz</option>
                    {availablePersonnel
                      .filter(p => !nizamiyePersonnel || p.id !== nizamiyePersonnel)
                      .filter(p => !yirmiDortcuPersonnel || p.id !== yirmiDortcuPersonnel)
                      .filter(p => !santralGecePersonnel || p.id !== santralGecePersonnel)
                      .map(person => (
                        <option key={person.id} value={person.id}>
                          {person.firstName} {person.lastName}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* Santral Gece */}
              <div className={`p-3 rounded-lg ${
                santralGecePersonnel 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-slate-700/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    🌙 Gece Vardiyası (20:00-08:00)
                  </span>
                  {santralGecePersonnel ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Atandı</span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Gerekli</span>
                  )}
                </div>
                {santralGecePersonnel ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        state.personnel.find(p => p.id === santralGecePersonnel)?.seniority === 'Dede' ? 'bg-purple-100 text-purple-700' :
                        state.personnel.find(p => p.id === santralGecePersonnel)?.seniority === 'Kıdemli' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {state.personnel.find(p => p.id === santralGecePersonnel)?.firstName[0]}
                        {state.personnel.find(p => p.id === santralGecePersonnel)?.lastName[0]}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getPersonName(santralGecePersonnel)}
                      </span>
                    </div>
                    <button
                      onClick={() => setSantralGecePersonnel(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <select
                    value=""
                    onChange={(e) => setSantralGecePersonnel(e.target.value || null)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-sm"
                  >
                    <option value="">Seçiniz</option>
                    {availablePersonnel
                      .filter(p => !nizamiyePersonnel || p.id !== nizamiyePersonnel)
                      .filter(p => !yirmiDortcuPersonnel || p.id !== yirmiDortcuPersonnel)
                      .filter(p => !santralGündüzPersonnel || p.id !== santralGündüzPersonnel)
                      .map(person => (
                        <option key={person.id} value={person.id}>
                          {person.firstName} {person.lastName}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {!hasSantral && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  ⚠️ Santral için iki vardiya da atanmalıdır!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              isValid
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

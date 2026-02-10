// ============================================
// EXEMPTION SETTINGS MODAL - Manage Personnel Exemptions
// ============================================

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Personnel, PersonnelExemption, ExemptionType, ShiftType, DutyLocation } from '../types';

interface ExemptionSettingsProps {
  onClose: () => void;
  personnel: Personnel;
}

export default function ExemptionSettings({ onClose, personnel }: ExemptionSettingsProps) {
  const { state, addExemption, deleteExemption } = useApp();
  
  const [formData, setFormData] = useState({
    exemptionType: 'shift' as ExemptionType,
    targetValue: '' as string,
    targetShift: '' as string,
    targetLocation: '' as string,
    reason: ''
  });

  const [isAdding, setIsAdding] = useState(false);

  // Get exemptions for this personnel
  const personnelExemptions = state.exemptions.filter(e => e.personnelId === personnel.id && e.isActive);

  const shifts: ShiftType[] = ['Gündüz 1', 'Gündüz 2', 'Akşam 1', 'Gece 1', 'Gece 2'];
  const locations: DutyLocation[] = ['Çapraz', 'Kaya1', 'Kaya2'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetValue: string;

    if (formData.exemptionType === 'shift_location') {
      if (!formData.targetShift || !formData.targetLocation) {
        alert('Lütfen hem vardiya hem lokasyon seçiniz.');
        return;
      }
      targetValue = `${formData.targetShift}|${formData.targetLocation}`;
    } else {
      if (!formData.targetValue) {
        alert('Lütfen bir değer seçiniz.');
        return;
      }
      targetValue = formData.targetValue;
    }

    addExemption({
      personnelId: personnel.id,
      exemptionType: formData.exemptionType,
      targetValue,
      reason: formData.reason || undefined,
      isActive: true
    });

    setFormData({
      exemptionType: 'shift',
      targetValue: '',
      targetShift: '',
      targetLocation: '',
      reason: ''
    });
    setIsAdding(false);
  };

  const handleDeleteExemption = (id: string) => {
    if (confirm('Bu muafiyet silinsin mi?')) {
      deleteExemption(id);
    }
  };

  const getExemptionLabel = (exemption: PersonnelExemption) => {
    if (exemption.exemptionType === 'shift') {
      return `Vardiya: ${exemption.targetValue}`;
    } else if (exemption.exemptionType === 'location') {
      return `Lokasyon: ${exemption.targetValue}`;
    } else {
      // Combined: "shift|location" format
      const [shift, location] = (exemption.targetValue as string).split('|');
      return `Vardiya + Lokasyon: ${shift} → ${location}`;
    }
  };

  const getExemptionIcon = (exemption: PersonnelExemption) => {
    if (exemption.exemptionType === 'shift') {
      return '🕐';
    } else if (exemption.exemptionType === 'location') {
      return '📍';
    } else {
      return '🔄';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                🚫 Muafiyetler
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {personnel.firstName} {personnel.lastName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Add New Exemption Form */}
          {isAdding ? (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Muafiyet Türü
                </label>
                <select
                  value={formData.exemptionType}
                  onChange={e => {
                    setFormData({ 
                      ...formData, 
                      exemptionType: e.target.value as ExemptionType,
                      targetValue: '',
                      targetShift: '',
                      targetLocation: ''
                    });
                  }}
                  className="select"
                >
                  <option value="shift">Vardiya Muafiyeti</option>
                  <option value="location">Lokasyon Muafiyeti</option>
                  <option value="shift_location">Vardiya + Lokasyon</option>
                </select>
              </div>

              {/* Combined Shift + Location Selection */}
              {formData.exemptionType === 'shift_location' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vardiya
                    </label>
                    <select
                      value={formData.targetShift}
                      onChange={e => setFormData({ ...formData, targetShift: e.target.value })}
                      className="select"
                      required
                    >
                      <option value="">Seçiniz...</option>
                      {shifts.map(shift => (
                        <option key={shift} value={shift}>{shift}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lokasyon
                    </label>
                    <select
                      value={formData.targetLocation}
                      onChange={e => setFormData({ ...formData, targetLocation: e.target.value })}
                      className="select"
                      required
                    >
                      <option value="">Seçiniz...</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {formData.exemptionType === 'shift' ? 'Vardiya' : 'Lokasyon'}
                  </label>
                  <select
                    value={formData.targetValue}
                    onChange={e => setFormData({ ...formData, targetValue: e.target.value })}
                    className="select"
                    required
                  >
                    <option value="">Seçiniz...</option>
                    {formData.exemptionType === 'shift' ? (
                      shifts.map(shift => (
                        <option key={shift} value={shift}>{shift}</option>
                      ))
                    ) : (
                      locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sebep (Opsiyonel)
                </label>
                <textarea
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Muafiyet sebebini giriniz..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setFormData({ exemptionType: 'shift', targetValue: '', targetShift: '', targetLocation: '', reason: '' });
                  }}
                  className="flex-1 btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Ekle
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full btn-primary mb-6"
            >
              ➕ Yeni Muafiyet Ekle
            </button>
          )}

          {/* Existing Exemptions List */}
          {personnelExemptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">✅</div>
              <p>Bu personel için tanımlı muafiyet yok.</p>
              <p className="text-sm mt-1">Personel tüm nöbetlere dahil edilebilir.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mevcut Muafiyetler ({personnelExemptions.length})
              </h3>
              {personnelExemptions.map(exemption => (
                <div
                  key={exemption.id}
                  className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getExemptionIcon(exemption)}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getExemptionLabel(exemption)}
                      </p>
                      {exemption.reason && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {exemption.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteExemption(exemption.id)}
                    className="p-1 text-red-600 hover:text-red-800 rounded"
                    title="Sil"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Not:</strong> Muafiyetler otomatik nöbet planlamasını etkiler. 
              Belirtilen vardiya veya lokasyonlara bu personel atanmaz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

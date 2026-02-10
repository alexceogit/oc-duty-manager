// ============================================
// ADD LEAVE MODAL
// ============================================

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { LeaveType } from '../types';

interface AddLeaveModalProps {
  onClose: () => void;
}

export default function AddLeaveModal({ onClose }: AddLeaveModalProps) {
  const { state, addLeave } = useApp();
  
  const [formData, setFormData] = useState({
    personnelId: '',
    leaveType: 'Yıllık İzin' as LeaveType,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.personnelId) {
      setError('Lütfen personel seçiniz.');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Lütfen tarih aralığı giriniz.');
      return;
    }

    try {
      await addLeave({
        personnelId: formData.personnelId,
        leaveType: formData.leaveType,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        isApproved: true,
        notes: formData.notes || undefined
      });
      onClose();
    } catch (err: any) {
      setError('İzin eklenirken hata oluştu: ' + err.message);
    }
  };

  const leaveTypes: LeaveType[] = [
    'Yıllık İzin',
    'Hafta Sonu İzni',
    'Hastalık İzni',
    'Mükafat İzni',
    'Mazeret İzni'
  ];

  // Get active personnel
  const activePersonnel = state.personnel.filter(p => p.isActive);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🏖️ İzin Ekle
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Personel *
              </label>
              <select
                value={formData.personnelId}
                onChange={e => setFormData({ ...formData, personnelId: e.target.value })}
                className="select"
                required
              >
                <option value="">Seçiniz...</option>
                {activePersonnel.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName} ({person.mainRole})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İzin Türü
              </label>
              <select
                value={formData.leaveType}
                onChange={e => setFormData({ ...formData, leaveType: e.target.value as LeaveType })}
                className="select"
              >
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Başlangıç Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bitiş Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Başlangıç Saati (Opsiyonel)
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bitiş Saati (Opsiyonel)
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Not (Opsiyonel)
              </label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                rows={2}
                placeholder="Varsa not..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
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
        </div>
      </div>
    </div>
  );
}

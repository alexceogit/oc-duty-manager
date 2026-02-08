// ============================================
// ADD PERSONNEL MODAL
// ============================================

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { MainRole, SubRole, SeniorityLevel } from '../types';

interface AddPersonnelModalProps {
  onClose: () => void;
}

export default function AddPersonnelModal({ onClose }: AddPersonnelModalProps) {
  const { addPersonnel } = useApp();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mainRole: 'Er' as MainRole,
    subRole: '' as SubRole | '',
    seniority: 'Normal' as SeniorityLevel
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('Lütfen ad ve soyad giriniz.');
      return;
    }

    addPersonnel({
      firstName: formData.firstName,
      lastName: formData.lastName,
      mainRole: formData.mainRole,
      subRole: formData.subRole || null,
      seniority: formData.seniority,
      isActive: true
    });

    onClose();
  };

  const mainRoles: MainRole[] = ['Çavuş', 'Onbaşı', 'Er'];
  const subRoles: SubRole[] = ['Haberci', 'Santral', 'Yazıcı', 'Nizamiye', 'Şoför', 'Rolsüz'];
  const seniorities: SeniorityLevel[] = ['Normal', 'Kıdemli', 'Dede'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              👤 Yeni Personel Ekle
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ad *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="input"
                  placeholder="Ad"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Soyad *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="input"
                  placeholder="Soyad"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ana Rol
              </label>
              <select
                value={formData.mainRole}
                onChange={e => setFormData({ ...formData, mainRole: e.target.value as MainRole })}
                className="select"
              >
                {mainRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alt Rol (Opsiyonel)
              </label>
              <select
                value={formData.subRole}
                onChange={e => setFormData({ ...formData, subRole: e.target.value as SubRole | '' })}
                className="select"
              >
                <option value="">Yok</option>
                {subRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Haberci ve Santral personeli otomatik nöbete dahil edilmez.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kıdem Seviyesi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {seniorities.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, seniority: level })}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      formData.seniority === level
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Normal personel öncelikli olarak günde max 2 nöbet alabilir.
              </p>
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

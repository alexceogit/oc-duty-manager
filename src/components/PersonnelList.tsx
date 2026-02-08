// ============================================
// PERSONNEL LIST COMPONENT
// ============================================

import { useApp } from '../context/AppContext';
import { MainRole, SubRole, SeniorityLevel } from '../types';

export default function PersonnelList() {
  const { state, updatePersonnel, deletePersonnel } = useApp();

  const getRoleBadgeColor = (role: MainRole) => {
    switch (role) {
      case 'Çavuş': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Onbaşı': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Er': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSeniorityBadgeColor = (seniority: SeniorityLevel) => {
    switch (seniority) {
      case 'Dede': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Kıdemli': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Normal': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (state.personnel.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">👥</div>
        <p className="text-gray-500 dark:text-gray-400">
          Henüz personel eklenmemiş.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {state.personnel.map(person => (
        <div
          key={person.id}
          className={`personnel-card ${
            person.seniority === 'Normal' ? 'personnel-card-normal' :
            person.seniority === 'Kıdemli' ? 'personnel-card-senior' :
            'personnel-card-dede'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {person.firstName} {person.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(person.mainRole)}`}>
                  {person.mainRole}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeniorityBadgeColor(person.seniority)}`}>
                  {person.seniority}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const newStatus = !person.isActive;
                  if (confirm(`${person.firstName} ${person.lastName} ${newStatus ? 'aktif' : 'pasif'} yapılsın mı?`)) {
                    updatePersonnel(person.id, { isActive: newStatus });
                  }
                }}
                className={`p-1 rounded ${person.isActive ? 'text-green-600' : 'text-gray-400'}`}
                title={person.isActive ? 'Aktif' : 'Pasif'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  {person.isActive ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  )}
                </svg>
              </button>
              <button
                onClick={() => {
                  if (confirm('Silinsin mi?')) {
                    deletePersonnel(person.id);
                  }
                }}
                className="p-1 text-red-600 hover:text-red-800 rounded"
                title="Sil"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {person.subRole && (
            <div className="mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Alt Rol: {person.subRole}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

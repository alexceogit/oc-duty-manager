// ============================================
// LEAVE MANAGER COMPONENT
// ============================================

import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function LeaveManager() {
  const { state } = useApp();

  // Group leaves by personnel
  const leavesByPersonnel = state.leaves.reduce((acc, leave) => {
    const person = state.personnel.find(p => p.id === leave.personnelId);
    if (person) {
      if (!acc[person.id]) {
        acc[person.id] = { person, leaves: [] };
      }
      acc[person.id].leaves.push(leave);
    }
    return acc;
  }, {} as Record<string, { person: typeof state.personnel[0]; leaves: typeof state.leaves }>);

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case 'Yıllık İzin': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Hafta Sonu İzni': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Hastalık İzni': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Mükafat İzni': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Mazeret İzni': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (state.leaves.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🏖️</div>
        <p className="text-gray-500 dark:text-gray-400">
          Bugün için izinli personel yok.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(leavesByPersonnel).map(([personId, { person, leaves }]) => (
        <div
          key={personId}
          className="bg-white dark:bg-slate-800 rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  {person.firstName[0]}{person.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {person.firstName} {person.lastName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {person.mainRole} • {person.seniority}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {leaves.map(leave => (
              <div
                key={leave.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getLeaveTypeBadge(leave.leaveType)}`}>
                    {leave.leaveType}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {format(leave.startDate instanceof Date ? leave.startDate : parseISO(leave.startDate as string), 'd MMM', { locale: tr })} - 
                    {format(leave.endDate instanceof Date ? leave.endDate : parseISO(leave.endDate as string), 'd MMM yyyy', { locale: tr })}
                  </span>
                  {leave.startTime && (
                    <span className="text-xs text-gray-500">
                      {leave.startTime} - {leave.endTime}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm('İzin silinsin mi?')) {
                      // deleteLeave(leave.id); // Implement
                    }
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

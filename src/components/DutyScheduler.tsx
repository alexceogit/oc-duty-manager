// ============================================
// DUTY SCHEDULER COMPONENT
// ============================================

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { DutyLocation, ShiftType } from '../types';

const locations: DutyLocation[] = ['Çapraz', 'Kaya1', 'Kaya2'];
const shifts: ShiftType[] = ['Gündüz 1', 'Gündüz 2', 'Akşam 1', 'Gece 1', 'Gece 2'];

const shiftTimeRanges: Partial<Record<ShiftType, string>> = {
  'Gündüz 1': '06:00 - 12:00',
  'Gündüz 2': '12:00 - 18:00',
  'Akşam 1': '18:00 - 22:00',
  'Gece 1': '22:00 - 02:00',
  'Gece 2': '02:00 - 06:00',
  'Santral Gündüz': '08:00 - 20:00',
  'Santral Gece': '20:00 - 08:00'
};

export default function DutyScheduler() {
  const { state, addDuty, deleteDuty } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<DutyLocation | 'Hepsi'>('Hepsi');
  const [draggedPersonnel, setDraggedPersonnel] = useState<string | null>(null);

  const dateStr = state.currentDate.toISOString().split('T')[0];

  // Get duties for current date
  const todayDuties = state.duties.filter(d => 
    new Date(d.date).toISOString().split('T')[0] === dateStr
  );

  // Filter by location if selected
  const filteredDuties = selectedLocation === 'Hepsi'
    ? todayDuties
    : todayDuties.filter(d => d.location === selectedLocation);

  // Group duties by location and shift
  const dutiesBySlot = filteredDuties.reduce((acc, duty) => {
    const key = `${duty.location}-${duty.shift || 'Nizamiye'}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(duty);
    return acc;
  }, {} as Record<string, typeof todayDuties>);

  // Get available personnel for this date
  const availablePersonnel = state.personnel.filter(p => {
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

    // NEW RULE: Normal personnel can have max 2 duties per day
    const existingDuties = todayDuties.filter(d => d.personnelId === p.id);
    const maxDuties = p.seniority === 'Normal' ? 2 : 1;
    
    return existingDuties.length < maxDuties;
  });

  // Check if personnel is already assigned to a slot
  const isAssigned = (personnelId: string, location: DutyLocation, shift?: ShiftType) => {
    return todayDuties.some(d => 
      d.personnelId === personnelId && 
      d.location === location &&
      (!shift || d.shift === shift)
    );
  };

  const handleDrop = (location: DutyLocation, shift?: ShiftType) => {
    if (!draggedPersonnel) return;

    // Check if already assigned to this slot
    if (isAssigned(draggedPersonnel, location, shift)) {
      setDraggedPersonnel(null);
      return;
    }

    addDuty({
      personnelId: draggedPersonnel,
      location,
      shift,
      date: new Date(dateStr),
      isManual: true
    });

    setDraggedPersonnel(null);
  };

  const getLocationColor = (location: DutyLocation) => {
    switch (location) {
      case 'Çapraz': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'Kaya1': return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'Kaya2': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20';
      default: return 'border-gray-500';
    }
  };

  const getShiftType = (shift: ShiftType) => {
    if (shift === 'Gece 1' || shift === 'Gece 2') return 'night';
    if (shift === 'Akşam 1') return 'evening';
    return 'day';
  };

  if (todayDuties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🗓️</div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {dateStr} tarihi için henüz nöbet oluşturulmamış.
        </p>
        <p className="text-sm text-gray-400">
          Otomatik oluştur'a tıklayın veya personeli sürükleyerek ekleyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedLocation('Hepsi')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            selectedLocation === 'Hepsi'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          Hepsi
        </button>
        {locations.map(location => (
          <button
            key={location}
            onClick={() => setSelectedLocation(location)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedLocation === location
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            {location}
          </button>
        ))}
      </div>

      {/* Duty Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {locations.map(location => (
          <div
            key={location}
            className={`rounded-xl border-2 ${getLocationColor(location)} overflow-hidden`}
          >
            {/* Location Header */}
            <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {location === 'Çapraz' && '🏛️'}
                {location === 'Kaya1' && '🪨'}
                {location === 'Kaya2' && '🪨'}
                {' '}{location}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {location === 'Çapraz' ? '1 kişi/vardiya' : 'Gece: 2, Gündüz: 1'}
              </p>
            </div>

            {/* Shifts */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {shifts.map(shift => {
                const slotDuties = dutiesBySlot[`${location}-${shift}`] || [];
                const isNight = shift === 'Gece 1' || shift === 'Gece 2';
                const maxPersonnel = isNight && location !== 'Çapraz' ? 2 : 1;

                return (
                  <div
                    key={shift}
                    className="p-3 bg-white dark:bg-slate-800"
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(location, shift)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`shift-badge ${getShiftType(shift) === 'night' ? 'shift-night' : getShiftType(shift) === 'evening' ? 'shift-evening' : getShiftType(shift) === 'day' ? 'shift-day' : 'shift-morning'}`}>
                        {shift}
                      </span>
                      <span className="text-xs text-gray-500">
                        {shiftTimeRanges[shift]}
                      </span>
                    </div>

                    {/* Assigned Personnel */}
                    <div className="space-y-2">
                      {slotDuties.map(duty => {
                        const person = state.personnel.find(p => p.id === duty.personnelId);
                        if (!person) return null;

                        return (
                          <div
                            key={duty.id}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              duty.isManual ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                person.seniority === 'Dede' ? 'bg-purple-100 text-purple-700' :
                                person.seniority === 'Kıdemli' ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {person.firstName[0]}{person.lastName[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {person.firstName} {person.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {person.mainRole}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteDuty(duty.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Kaldır"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}

                      {/* Empty Slots */}
                      {slotDuties.length < maxPersonnel && (
                        <div className="text-center py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                          <p className="text-xs text-gray-500">
                            {maxPersonnel - slotDuties.length} slot boş
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Available Personnel */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          📋 Uygun Personel ({availablePersonnel.length})
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Yeni kural: Normal personel günde max 2 nöbet alabilir.
        </p>
        <div className="flex flex-wrap gap-2">
          {availablePersonnel.map(person => {
            const existingDuties = todayDuties.filter(d => d.personnelId === person.id);
            
            return (
              <div
                key={person.id}
                draggable
                onDragStart={() => setDraggedPersonnel(person.id)}
                onDragEnd={() => setDraggedPersonnel(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-move ${
                  existingDuties.length >= 2
                    ? 'bg-gray-100 dark:bg-gray-700 opacity-50'
                    : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 hover:shadow-md'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  person.seniority === 'Dede' ? 'bg-purple-100 text-purple-700' :
                  person.seniority === 'Kıdemli' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {person.firstName[0]}{person.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {person.firstName} {person.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {existingDuties.length}/2 nöbet
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// DUTY SCHEDULER COMPONENT
// ============================================

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { DutyLocation, ShiftType } from '../types';
import { AddDutyModal } from './AddDutyModal';

const locations: DutyLocation[] = ['Çapraz', 'Kaya1', 'Kaya2'];
const shifts: ShiftType[] = ['Akşam 1', 'Gece 1', 'Gece 2', 'Gündüz 1', 'Gündüz 2'];

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
  
  // Modal state for adding manual duty
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalData, setAddModalData] = useState<{ 
    location: DutyLocation; 
    shift: ShiftType;
    isDevriye?: boolean;
  } | null>(null);

  const dateStr = state.currentDate.toISOString().split('T')[0];

  // Get both saved duties and pending duties
  const savedDuties = state.duties.filter(d => 
    new Date(d.date).toISOString().split('T')[0] === dateStr
  );
  
  const pendingDuties = state.pendingDuties.filter(d => 
    new Date(d.date).toISOString().split('T')[0] === dateStr
  );
  
  // Combine saved and pending duties for display
  const allDuties = [...savedDuties, ...pendingDuties];

  // Filter by location if selected
  const filteredDuties = selectedLocation === 'Hepsi'
    ? allDuties
    : allDuties.filter(d => d.location === selectedLocation);

  // Group duties by location and shift
  const dutiesBySlot = filteredDuties.reduce((acc, duty) => {
    const key = `${duty.location}-${duty.shift || 'Nizamiye'}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(duty);
    return acc;
  }, {} as Record<string, typeof filteredDuties>);

  // Get available personnel for this date (excluding those in pending duties)
  const assignedPersonnelIds = new Set(pendingDuties.map(d => d.personnelId).filter(id => id !== 'devriye-placeholder'));
  
  const availablePersonnel = state.personnel.filter(p => {
    if (!p.isActive) return false;
    if (assignedPersonnelIds.has(p.id)) return false;
    
    // Check if on leave
    const onLeave = state.leaves.some(l => {
      if (l.personnelId !== p.id) return false;
      const leaveStart = new Date(l.startDate);
      const leaveEnd = new Date(l.endDate);
      const checkDate = new Date(dateStr);
      return checkDate >= leaveStart && checkDate <= leaveEnd;
    });
    
    if (onLeave) return false;

    // Count saved duties only (pending doesn't count against limit)
    const existingDuties = savedDuties.filter(d => d.personnelId === p.id);
    const maxDuties = p.seniority === 'Normal' ? 2 : 1;
    
    return existingDuties.length < maxDuties;
  });

  // Check if personnel is already assigned to a slot (check both saved and pending)
  const isAssigned = (personnelId: string, location: DutyLocation, shift?: ShiftType) => {
    return allDuties.some(d => 
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

  if (allDuties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🗓️</div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {dateStr} tarihi için henüz nöbet oluşturulmamış.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Otomatik oluştur'a tıklayın veya personeli sürükleyerek ekleyin.
        </p>
        {/* Manuel Nöbet Oluştur Butonu */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Manuel Nöbet Oluştur
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending indicator */}
      {pendingDuties.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            📝 <strong>{pendingDuties.length} nöbet</strong> oluşturuldu. Kaydetmek için sayfanın üstündeki "Kaydet" butonuna tıklayın.
          </p>
        </div>
      )}

      {/* Header with Manual Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          📅 {dateStr} Nöbet Çizelgesi
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Manuel Ekle
        </button>
      </div>

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
                let slotDuties = dutiesBySlot[`${location}-${shift}`] || [];
                
                // Sort by seniority: Çavuş > Kıdemli > Normal > Dede
                const seniorityOrder: Record<string, number> = {
                  'Çavuş': 0,
                  'Kıdemli': 1,
                  'Normal': 2,
                  'Dede': 3
                };
                slotDuties.sort((a, b) => {
                  const personA = state.personnel.find(p => p.id === a.personnelId);
                  const personB = state.personnel.find(p => p.id === b.personnelId);
                  if (a.isDevriye) return 1;
                  if (b.isDevriye) return -1;
                  const orderA = personA ? seniorityOrder[personA.seniority] || 99 : 99;
                  const orderB = personB ? seniorityOrder[personB.seniority] || 99 : 99;
                  return orderA - orderB;
                });
                
                const isMultiPerson = location !== 'Çapraz' && (shift === 'Akşam 1' || shift === 'Gece 1' || shift === 'Gece 2');
                const maxPersonnel = isMultiPerson ? 2 : 1;

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
                        const isDevriye = duty.personnelId === 'devriye-placeholder' || duty.isDevriye;
                        const person = !isDevriye ? state.personnel.find(p => p.id === duty.personnelId) : null;

                        return (
                          <div
                            key={duty.id}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              isDevriye 
                                ? 'bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-600' 
                                : duty.isManual 
                                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
                                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isDevriye ? (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-orange-200 text-orange-700">
                                  D
                                </div>
                              ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  person?.seniority === 'Dede' ? 'bg-purple-100 text-purple-700' :
                                  person?.seniority === 'Kıdemli' ? 'bg-blue-100 text-blue-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {person?.firstName[0]}{person?.lastName[0]}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {isDevriye ? '🚨 DEVRİYE' : `${person?.firstName} ${person?.lastName}`}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {isDevriye ? 'Devriye atanacak' : person?.mainRole}
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

                      {/* Empty Slots with + Button */}
                      {slotDuties.length < maxPersonnel && (
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: maxPersonnel - slotDuties.length }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setAddModalData({ location, shift });
                                setIsAddModalOpen(true);
                              }}
                              className="flex-1 min-w-[80px] py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                              title="Manuel nöbet ekle"
                            >
                              <span className="text-gray-400 group-hover:text-blue-500 text-lg font-bold">+</span>
                            </button>
                          ))}
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

      {/* Add Duty Modal */}
      {addModalData && (
        <AddDutyModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setAddModalData(null);
          }}
          locProp={addModalData.location}
          shiftProp={addModalData.shift}
          date={state.currentDate}
        />
      )}

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
            const existingDuties = savedDuties.filter(d => d.personnelId === person.id);
            const isInPending = pendingDuties.some(d => d.personnelId === person.id && d.personnelId !== 'devriye-placeholder');
            
            return (
              <div
                key={person.id}
                draggable
                onDragStart={() => setDraggedPersonnel(person.id)}
                onDragEnd={() => setDraggedPersonnel(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-move ${
                  existingDuties.length >= 2 || isInPending
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
                    {existingDuties.length}/2 nöbet {isInPending && '(+1 bekleyen)'}
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

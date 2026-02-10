// ============================================
// MONTHLY CALENDAR COMPONENT
// ============================================

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { DutyLocation, DutyAssignment } from '../types';
import MonthlyAssignmentModal from './MonthlyAssignmentModal';

const specialLocations: DutyLocation[] = ['Nizamiye', '24cü', 'Santral'];

type DayStatus = 'complete' | 'incomplete' | 'empty';

interface DayAssignment {
  date: Date;
  nizamiye?: DutyAssignment;
  yirmiDortcu?: DutyAssignment;
  santralGündüz?: DutyAssignment;
  santralGece?: DutyAssignment;
}

export default function MonthlyCalendar() {
  const { state } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get all assignments for special locations
  const specialDuties = useMemo(() => {
    return state.duties.filter(d => 
      specialLocations.includes(d.location)
    );
  }, [state.duties]);

  // Group duties by date
  const assignmentsByDate = useMemo(() => {
    const map = new Map<string, DayAssignment>();
    
    specialDuties.forEach(duty => {
      const dateKey = new Date(duty.date).toISOString().split('T')[0];
      
      if (!map.has(dateKey)) {
        map.set(dateKey, { date: new Date(duty.date) });
      }
      
      const entry = map.get(dateKey)!;
      if (duty.location === 'Nizamiye') {
        entry.nizamiye = duty;
      } else if (duty.location === '24cü') {
        entry.yirmiDortcu = duty;
      } else if (duty.location === 'Santral') {
        if (duty.shift === 'Santral Gündüz') {
          entry.santralGündüz = duty;
        } else if (duty.shift === 'Santral Gece') {
          entry.santralGece = duty;
        }
      }
    });
    
    return map;
  }, [specialDuties]);

  // Get day status
  const getDayStatus = (date: Date): DayStatus => {
    const dateKey = date.toISOString().split('T')[0];
    const assignment = assignmentsByDate.get(dateKey);
    
    if (!assignment) return 'empty';
    
    const hasYirmiDortcu = !!assignment.yirmiDortcu;
    const hasSantral = !!assignment.santralGündüz && !!assignment.santralGece;
    
    if (hasYirmiDortcu && hasSantral) return 'complete';
    return 'incomplete';
  };

  // Calendar generation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before first day of month
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  }, [currentMonth]);

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getStatusIcon = (status: DayStatus) => {
    switch (status) {
      case 'complete': return '✅';
      case 'incomplete': return '⚠️';
      case 'empty': return '○';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Tamamlandı</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Eksik</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></span>
          <span className="text-gray-600 dark:text-gray-400">Boş</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-100 dark:bg-slate-700">
          {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="p-2 min-h-[100px] bg-gray-50 dark:bg-slate-800/50"></div>;
            }
            
            const status = getDayStatus(day);
            const dateKey = day.toISOString().split('T')[0];
            const assignment = assignmentsByDate.get(dateKey);
            const isToday = new Date().toISOString().split('T')[0] === dateKey;
            
            return (
              <button
                key={dateKey}
                onClick={() => handleDayClick(day)}
                className={`p-2 min-h-[100px] border border-gray-100 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left ${
                  isToday ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isToday 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {day.getDate()}
                  </span>
                  <span className="text-lg">{getStatusIcon(status)}</span>
                </div>
                
                {/* Assignment Indicators */}
                {assignment && (
                  <div className="space-y-1">
                    {/* Nizamiye */}
                    <div className={`text-xs px-1.5 py-0.5 rounded ${
                      assignment.nizamiye 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' 
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    }`}>
                      Nizamiye {assignment.nizamiye ? '✓' : '○'}
                    </div>
                    
                    {/* 24cü */}
                    <div className={`text-xs px-1.5 py-0.5 rounded ${
                      assignment.yirmiDortcu 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' 
                        : 'bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400'
                    }`}>
                      24cü {assignment.yirmiDortcu ? '✓' : '✗'}
                    </div>
                    
                    {/* Santral */}
                    <div className={`text-xs px-1.5 py-0.5 rounded ${
                      assignment.santralGündüz && assignment.santralGece
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' 
                        : 'bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400'
                    }`}>
                      Santral {assignment.santralGündüz && assignment.santralGece ? '✓' : '✗'}
                    </div>
                  </div>
                )}
                
                {!assignment && (
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Atama yok
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedDate && (
        <MonthlyAssignmentModal
          date={selectedDate}
          existingAssignments={assignmentsByDate.get(selectedDate.toISOString().split('T')[0])}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

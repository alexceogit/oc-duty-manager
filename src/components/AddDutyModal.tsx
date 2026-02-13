import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { DutyLocation, ShiftType } from '../types';

interface AddDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  locProp?: DutyLocation;
  shiftProp?: ShiftType;
  date: Date;
  existingAssignmentId?: string;
}

const locations: DutyLocation[] = ['Çapraz', 'Kaya1', 'Kaya2'];
const allShifts: ShiftType[] = ['Gündüz 1', 'Gündüz 2', 'Akşam 1', 'Gece 1', 'Gece 2'];

export function AddDutyModal({ isOpen, onClose, locProp, shiftProp, date, existingAssignmentId }: AddDutyModalProps) {
  const { state, addDuty, deleteDuty } = useApp();
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(null);
  const [isDevriye, setIsDevriye] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Allow selection within modal if not pre-selected
  const [selectedLocation, setSelectedLocation] = useState<DutyLocation | undefined>(locProp);
  const [selectedShift, setSelectedShift] = useState<ShiftType | undefined>(shiftProp);
  const [showLocationSelector, setShowLocationSelector] = useState(!locProp);
  const [showShiftSelector, setShowShiftSelector] = useState(!shiftProp);

  // Use selected values or fall back to props
  const location = selectedLocation || locProp;
  const shift = selectedShift || shiftProp;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPersonnelId(null);
      setIsDevriye(false);
      setError(null);
      if (!locProp) {
        setSelectedLocation(undefined);
        setShowLocationSelector(true);
      }
      if (!shiftProp) {
        setSelectedShift(undefined);
        setShowShiftSelector(true);
      }
    }
  }, [isOpen, locProp, shiftProp]);

  const dateStr = date.toISOString().split('T')[0];

  // Get already assigned personnel IDs for this location/shift/date
  const assignedPersonnelIds = useMemo(() => {
    return state.duties
      .filter(d => {
        const dutyDate = new Date(d.date).toISOString().split('T')[0];
        return dutyDate === dateStr && d.location === location && d.shift === shift && d.id !== existingAssignmentId;
      })
      .map(d => d.personnelId);
  }, [state.duties, dateStr, location, shift, existingAssignmentId]);

  // Filter available personnel (not already assigned to this slot)
  const availablePersonnel = useMemo(() => {
    return state.personnel.filter(p => {
      // Must be active
      if (!p.isActive) return false;
      // Not already assigned to this slot
      if (assignedPersonnelIds.includes(p.id)) return false;
      return true;
    });
  }, [state.personnel, assignedPersonnelIds]);

  // Check if this shift needs 2 people
  const needsTwoPeople = (location !== 'Çapraz') && 
    (shift === 'Akşam 1' || shift === 'Gece 1' || shift === 'Gece 2');

  const handleSubmit = async () => {
    // Validate required fields
    if (!location || !shift) {
      setError('Lütfen lokasyon ve vardiya seçin');
      return;
    }
    
    if (!isDevriye && !selectedPersonnelId) {
      setError('Lütfen bir personel seçin');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // If there's an existing assignment, delete it first
      if (existingAssignmentId) {
        await deleteDuty(existingAssignmentId);
      }

      // Calculate how many devriye assignments needed for this shift
      const isNight = shift === 'Gece 1' || shift === 'Gece 2';
      const isAkşam = shift === 'Akşam 1';
      const needsTwoPeople = (location !== 'Çapraz') && (isNight || isAkşam);
      const devriyeCount = needsTwoPeople ? 2 : 1;

      // Validate
      if (!isDevriye && !selectedPersonnelId) {
        setError('Lütfen bir personel seçin');
        return;
      }

      // Add the new duty(s)
      if (isDevriye) {
        // Entire shift is Devriye - create multiple devriye assignments
        for (let i = 0; i < devriyeCount; i++) {
          await addDuty({
            personnelId: 'devriye-placeholder',
            location,
            shift,
            date: new Date(dateStr),
            isManual: true,
            isDevriye: true
          });
        }
      } else {
        // Normal personnel assignment - personnelId must be a valid string
        await addDuty({
          personnelId: selectedPersonnelId!,  // We validated it's not null/empty
          location,
          shift,
          date: new Date(dateStr),
          isManual: true,
          isDevriye: false
        });
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Nöbet eklenirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedPersonnelId(null);
    setIsDevriye(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  // Check if we need to show selectors
  const needsLocation = showLocationSelector || !location;
  const needsShift = showShiftSelector || !shift;
  
  // Location selection UI
  const LocationSelector = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Lokasyon Seçin {!needsLocation && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {locations.map(loc => (
          <button
            key={loc}
            onClick={() => {
              setSelectedLocation(loc);
              setShowLocationSelector(false);
            }}
            className={`p-3 rounded-lg border-2 transition-colors ${
              selectedLocation === loc
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
            }`}
          >
            <span className="text-lg">
              {loc === 'Çapraz' ? '🏛️' : '🪨'}
            </span>
            <p className="text-sm font-medium mt-1">{loc}</p>
          </button>
        ))}
      </div>
    </div>
  );

  // Shift selection UI
  const ShiftSelector = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Vardiya Seçin {!needsShift && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {allShifts.map(sh => (
          <button
            key={sh}
            onClick={() => {
              setSelectedShift(sh);
              setShowShiftSelector(false);
            }}
            className={`p-3 rounded-lg border-2 transition-colors ${
              selectedShift === sh
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
            }`}
          >
            <p className="font-medium text-sm">{sh}</p>
            <p className="text-xs text-gray-500">{shiftDisplay[sh]}</p>
          </button>
        ))}
      </div>
    </div>
  );

  // Format shift display
  const shiftDisplay: Record<ShiftType, string> = {
    'Gündüz 1': '06:00 - 12:00',
    'Gündüz 2': '12:00 - 18:00',
    'Akşam 1': '18:00 - 22:00',
    'Gece 1': '22:00 - 02:00',
    'Gece 2': '02:00 - 06:00',
    'Santral Gündüz': '08:00 - 20:00',
    'Santral Gece': '20:00 - 08:00'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Manuel Nöbet Ekle
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Assignment Info */}
        {!needsLocation && !needsShift ? (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Lokasyon:</span>
                <p className="font-medium text-gray-900 dark:text-white">{location}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Vardiya:</span>
                <p className="font-medium text-gray-900 dark:text-white">{shift} ({shiftDisplay[shift]})</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-gray-400">Tarih:</span>
                <p className="font-medium text-gray-900 dark:text-white">{dateStr}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">
              ℹ️ Manuel nöbet eklemek için lokasyon ve vardiya seçiniz
            </p>
          </div>
        )}

        {/* Location Selector */}
        {needsLocation && <LocationSelector />}
        
        {/* Shift Selector */}
        {needsShift && <ShiftSelector />}

        {/* Devriye Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
            <input
              type="checkbox"
              checked={isDevriye}
              onChange={(e) => {
                setIsDevriye(e.target.checked);
                setSelectedPersonnelId(null);
              }}
              className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Tüm Vardiyayı DEVRİYE Yap</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Seçilirse bu vardiyadaki tüm slotlar Devriye olur</p>
            </div>
          </label>
        </div>

        {/* Personnel Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Personel Seçin
          </label>
          
          {isDevriye ? (
            <div className="text-center py-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-amber-700 dark:text-amber-400 font-medium">
                🚨 Tüm vardiya Devriye yapılacak
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                {needsTwoPeople ? '2 kişilik yer de Devriye olacak' : 'Bu yer Devriye olacak'}
              </p>
            </div>
          ) : availablePersonnel.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>Uygun personel bulunamadı.</p>
              <p className="text-sm mt-1">Bu vardiya için tüm personel zaten atanmış olabilir.</p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
              {availablePersonnel.map(person => (
                <button
                  key={person.id}
                  onClick={() => setSelectedPersonnelId(person.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${
                    selectedPersonnelId === person.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                  } ${person.seniority === 'Kıdemli' ? 'border-l-4 border-yellow-500' : ''}`}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {person.firstName} {person.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {person.mainRole} • {person.seniority}
                    </p>
                  </div>
                  {selectedPersonnelId === person.id && (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            disabled={isSubmitting}
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={(!selectedPersonnelId && !isDevriye) || isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Ekleniyor...' : isDevriye ? 'Tüm Vardiyayı Devriye Yap' : 'Nöbet Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}

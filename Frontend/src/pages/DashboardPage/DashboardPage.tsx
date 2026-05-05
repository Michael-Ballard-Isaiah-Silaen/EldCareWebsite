import React, { useState, useEffect } from 'react';
import CustomAxios from '../../lib/actions/CustomAxios';
import { IoIosStats } from "react-icons/io";
import { FiLink } from "react-icons/fi";

interface Schedule {
  _id: string;
  medicationName: string;
  dosage: string;
  consumptionDate: string;
  consumptionTime: string;
  color: string;
  medBoxSlot?: number | null;
  confirmation?: boolean;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DashboardPage = () => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const year = 2026;

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDaySchedules, setSelectedDaySchedules] = useState<Schedule[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState("");

  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    startDate: '',
    consumptionTimes: ['08:00'],
    takenEvery: 1,
    color: '#3B82F6'
  });

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  const todaySchedules = schedules.filter(s => s.consumptionDate === todayStr);
  todaySchedules.sort((a, b) => a.consumptionTime.localeCompare(b.consumptionTime));
  
  const todayConfirmedSchedules = todaySchedules.filter(s => s.confirmation === true).length;
  const todayTotalSchedules = todaySchedules.length;
  const todayCompliancePercentage = todayTotalSchedules > 0 ? Math.round((todayConfirmedSchedules / todayTotalSchedules) * 100) : 0;
  
  const currentFormattedDate = `${months[new Date().getMonth()]} ${new Date().getDate()}, ${new Date().getFullYear()}`;

  const fetchSchedules = async () => {
    try {
      const response = await CustomAxios('get', '/schedules');
      setSchedules(response.data || []); 
    } catch (error) {
      console.error("Error fetching schedules", error);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [currentMonthIndex]);

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  
  const getFirstDayOfMonth = (month: number, year: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const daysInMonth = getDaysInMonth(currentMonthIndex, year);
  const firstDay = getFirstDayOfMonth(currentMonthIndex, year);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : prev));
  const handleNextMonth = () => setCurrentMonthIndex((prev) => (prev < 11 ? prev + 1 : prev));

  const currentMonthSchedules = schedules.filter(s => {
    const monthStr = String(currentMonthIndex + 1).padStart(2, '0');
    return s.consumptionDate.startsWith(`${year}-${monthStr}`);
  });
  
  const confirmedSchedules = currentMonthSchedules.filter(s => s.confirmation === true).length;
  
  const compliancePercentage = currentMonthSchedules.length > 0 
    ? Math.round((confirmedSchedules / currentMonthSchedules.length) * 100) 
    : 0;

  const handleAddTime = () => {
    setFormData({ ...formData, consumptionTimes: [...formData.consumptionTimes, ''] });
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.consumptionTimes];
    newTimes[index] = value;
    setFormData({ ...formData, consumptionTimes: newTimes });
  };

  const handleRemoveTime = (index: number) => {
    const newTimes = formData.consumptionTimes.filter((_, i) => i !== index);
    setFormData({ ...formData, consumptionTimes: newTimes });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await CustomAxios('post', '/schedules/routine', formData);
      setShowAddModal(false);
      fetchSchedules();
    } catch (error) {
      console.error("Error uploading schedule", error);
    }
  };

  const handleSlotChange = async (scheduleId: string, slotNumber: number) => {
    try {
      await CustomAxios('put', `/schedules/${scheduleId}`, { medBoxSlot: slotNumber });
      setSchedules(prevSchedules => 
        prevSchedules.map(s => s._id === scheduleId ? { ...s, medBoxSlot: slotNumber } : s)
      );
      setSelectedDaySchedules(prevSchedules => 
        prevSchedules.map(s => s._id === scheduleId ? { ...s, medBoxSlot: slotNumber } : s)
      );
    } catch (error) {
      console.error("Error updating MedBox slot", error);
    }
  };

  const openDayDetails = (day: number) => {
    const dateStr = `${year}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const daySchedules = schedules.filter(s => s.consumptionDate === dateStr);
    daySchedules.sort((a, b) => a.consumptionTime.localeCompare(b.consumptionTime));
    
    setSelectedDateStr(`${months[currentMonthIndex]} ${day}, ${year}`);
    setSelectedDaySchedules(daySchedules);
    setShowDayModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={handlePrevMonth} className="p-2 bg-white rounded hover:bg-gray-300" disabled={currentMonthIndex === 0}>&lt;</button>
          <h2 className="text-2xl font-light w-48 text-center">{months[currentMonthIndex]} {year}</h2>
          <button onClick={handleNextMonth} className="p-2 bg-white rounded hover:bg-gray-300" disabled={currentMonthIndex === 11}>&gt;</button>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="text-[#0A2D6E] px-12 py-2 rounded-xl shadow-lg bg-gradient-to-r from-[#F1E1B4] to-[#FFF2CE]"
        >
          + Schedule
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-100 border-b text-center py-2 font-semibold text-gray-700">
          <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
        </div>
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="border border-gray-100 bg-gray-50"></div>
          ))}
          {days.map(day => {
            const dateStr = `${year}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayMeds = schedules.filter(s => s.consumptionDate === dateStr);

            return (
              <div 
                key={day} 
                onClick={() => openDayDetails(day)}
                className="border border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition overflow-hidden flex flex-col"
              >
                <span className="text-gray-500 font-medium text-sm mb-1">{day}</span>
                <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                  {dayMeds.map((med, idx) => (
                    <div 
                      key={idx} 
                      className="text-xs px-2 py-1 rounded text-white truncate font-medium"
                      style={{ backgroundColor: med.color || '#3B82F6' }}
                    >
                      [{med.medBoxSlot || 'X'}] {med.consumptionTime} - {med.medicationName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex flex-col w-full bg-[#FFFFFF] rounded-lg shadow-lg p-6 mt-6">
          <div className="flex flex-row items-center gap-2">
            <IoIosStats size={20} color='#0A2D6E'/>
            <p className="text-[#0A2D6E] font-semibold text-xl">Compliance</p>
          </div>
          
          <div className="flex justify-between items-center mt-5">
            <p className="text-[#585757] font-semibold text-lg">This Month</p>
            <p className="text-[#0A2D6E] font-bold text-md">{compliancePercentage}%</p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-[#0D6FFF] h-2.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${compliancePercentage}%` }}
            ></div>
          </div>
          <p className="font-light mt-4">💪 Keep going, you can do it!</p>

          <div className="bg-slate-100 justify-center items-center self-center w-full mt-6 mb-4 rounded-xl h-1"></div>

          <div className="flex justify-between items-center mt-5">
            <p className="text-[#585757] font-semibold text-lg">Today</p>
            <p className="text-[#0A2D6E] font-bold text-md">{todayConfirmedSchedules}/{todayTotalSchedules} Taken</p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 mb-4">
            <div 
              className="bg-[#008809] h-2.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${todayCompliancePercentage}%` }}
            ></div>
          </div>

          <div className="flex flex-row items-center gap-4 mt-4 mb-4">
            <FiLink size={30} color='#0A2D6E'/>
            <div className="flex flex-col">
              <p className="text-[#585757] text-lg font-bold">Today's Schedule</p>
              <p className="text-[#585757] font-light text-sm">{currentFormattedDate}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {todaySchedules.length === 0 ? (
              <p className="text-gray-500 text-sm">No schedules for today.</p>
            ) : (
              todaySchedules.map((med, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-row items-center p-4 rounded-xl shadow-sm text-white"
                  style={{ backgroundColor: med.color || '#3B82F6' }}
                >
                  <input 
                    type="checkbox" 
                    checked={med.confirmation || false} 
                    readOnly
                    className="w-5 h-5 mr-4 cursor-default accent-white"
                  />
                  <div className="flex flex-col">
                    <p className="font-bold text-md">{med.medicationName}</p>
                    <p className="font-medium text-sm">{med.consumptionTime} , {med.dosage}</p>
                  </div>
                </div>
              ))
            )}
          </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add Medication Schedule</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Medication Name</label>
                <input required type="text" className="mt-1 w-full border rounded p-2" 
                  value={formData.medicationName} onChange={e => setFormData({...formData, medicationName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dosage</label>
                <input required type="text" className="mt-1 w-full border rounded p-2" placeholder="e.g. 1 Pill, 10ml"
                  value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input required type="date" className="mt-1 w-full border rounded p-2" 
                  value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consumption Time(s)</label>
                {formData.consumptionTimes.map((time, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input required type="time" className="flex-1 border rounded p-2" 
                      value={time} onChange={e => handleTimeChange(idx, e.target.value)} />
                    {idx > 0 && (
                      <button type="button" onClick={() => handleRemoveTime(idx)} className="px-3 bg-red-100 text-red-600 rounded">X</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddTime} className="text-sm text-blue-600 hover:underline">+ Add another time</button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Taken Every (Days)</label>
                  <input required type="number" min="1" className="mt-1 w-full border rounded p-2" 
                    value={formData.takenEvery} onChange={e => setFormData({...formData, takenEvery: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tag Color</label>
                  <input type="color" className="mt-1 h-10 w-14 border cursor-pointer" 
                    value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Upload Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">{selectedDateStr}</h3>
            {selectedDaySchedules.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No medications scheduled for this day.</p>
            ) : (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {selectedDaySchedules.map((med, idx) => (
                  <div key={idx} className="flex flex-col p-3 rounded shadow-sm border-l-4 gap-2 bg-white" style={{ borderLeftColor: med.color || '#3B82F6', border: '1px solid #e5e7eb', borderLeftWidth: '4px' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{med.medicationName}</p>
                        <p className="text-sm text-gray-500">{med.dosage}</p>
                      </div>
                      <div className="font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded text-sm">
                        {med.consumptionTime}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
                      <label className="text-sm font-medium text-gray-600">MedBox Slot:</label>
                      <select
                        value={med.medBoxSlot || ""}
                        onChange={(e) => handleSlotChange(med._id, parseInt(e.target.value))}
                        className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 cursor-pointer hover:bg-gray-100 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="" disabled>Select</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(slot => (
                          <option key={slot} value={slot}>Slot {slot}</option>
                        ))}
                      </select>
                    </div>

                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 text-right">
              <button onClick={() => setShowDayModal(false)} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 shadow transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;


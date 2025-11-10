

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

// --- START OF types.ts ---
interface ProductionData {
  machineId: number;
  "SIRA NO": string | null;
  "İŞ EMRİ TARİH ve SAATİ": string | Date;
  "TERMİN TARİHİ": string | Date;
  "MÜŞTERİ ADI": string;
  "PARÇA NO": string;
  "PARÇA ADI": string;
  "TOPLAM ADET": string;
  "ÇEVRİM SÜRESİ": string;
  "TOPLAM DK": string;
  "BRÜT ÜRÜN GRAMAJI": string;
  "HAMMADDE ADI": string;
  "TOPLAM GEREKLİ HAMMADDE KG": string;
  "BOYA KODU": string;
  "TOPLAM GEREKLİ BOYA": string;
  "TOPLAM GEREKLİ BOYA KG.": string;
  "TOPLAM GÖZ": string;
  "BASKI SAYISI": string;
  "MAKİNE ÇALIŞMA SAATİ": string;
  "MAKİNE DURUŞ SAATİ": string;
  "PARÇA ÜRETİM SONU TARİHİ ve SAATİ"?: string | Date | null;
  [key: string]: any; // Allow for extra properties from parser
}

interface JobDetailModalProps {
  job: ProductionData | null;
  onClose: () => void;
  translations: any;
  headers: string[];
}

interface DowntimeData {
  machineId: number;
  jobDowntime: number;
  idleTime: number;
  totalLoss: number;
}

interface DowntimeHistogramProps {
  downtimeData: DowntimeData[];
  translations: any;
  machineTonnages: { [key: number]: number };
}

interface GanttChartViewProps {
  planData: ProductionData[];
  translations: any;
  machineIds: number[];
  machineTonnages: { [key: number]: number };
  onTaskClick: (job: ProductionData) => void;
}
// --- END OF types.ts ---

// --- START OF translations.ts ---
const translations = {
  tr: {
    title: 'TE PLAST Üretim Asistanı',
    subtitle: 'Üretim Planınızı Yönetin',
    productionData: 'Üretim Verileri',
    machine: 'Makine',
    ton: 'Ton',
    noData: 'Bu makine için üretim verisi bulunmamaktadır.',
    // Dashboard keys
    todaysDate: "Bugünün Tarihi",
    machineStatusDashboard: "Makinelerin Günlük Durumu",
    inProduction: "Üretimde",
    idle: "Boşta",
    setMaintenance: "Bakıma Al",
    scheduledMaintenance: "Planlı Bakım",
    inMaintenance: "Bakımda",
    weeklyCapacity: "Haftalık Kapasite",
    monthlyCapacity: "Aylık Kapasite",
    used: "Kullanımda",
    // Downtime Histogram keys
    totalDowntime: "Makinelerin Toplam Duruş Süreleri",
    machineLossTimes: "Makinelerin Kayıp Zamanları",
    jobDowntimeShort: "İş Sırası Kayıp",
    idleTimeShort: "İş Arası Kayıp",
    totalLossShort: "Toplam Kayıp",
    hours: "saat",
    totalIdleTime: "Toplam İş Arası Kayıp",
    totalJobDowntime: "Toplam İş Sırası Kayıp",
    overallTotalLoss: "Genel Toplam Kayıp",
    // Upload keys
    uploadExcel: 'Excel Yükle',
    updateExcel: 'Planı Güncelle',
    uploadPrompt: 'Başlamak için lütfen üretim planı Excel dosyanızı yükleyin.',
    processingFile: 'Dosya işleniyor...',
    fileError: 'Dosya okunurken bir hata oluştu. Lütfen dosyanın doğru formatta olduğundan emin olun.',
    // Gantt keys
    plannerView: 'Planlayıcı',
    ganttView: 'Gantt Şeması',
    filterByMachine: 'Makineye Göre Filtrele:',
    filterByCustomer: 'Müşteriye Göre Filtrele:',
    allCustomers: 'Tüm Müşteriler',
    generalTimeline: 'Genel Zaman Çizelgesi',
    dailyTimeline: 'Günlük Zaman Çizelgesi',
    day: 'Gün',
    week: 'Hafta',
    month: 'Ay',
    hourly: 'Saatlik',
    selectDate: 'Tarih Seçin:',
    machineLegend: 'Makine Renkleri',
    ganttLocale: 'tr',
    weekNumber: 'Hafta #%W',
    // Tooltip keys
    customerName: 'Müşteri Adı',
    partNo: 'Parça No',
    partName: 'Parça Adı',
    totalQuantity: 'Toplam Adet',
    paintCode: 'Boya Kodu',
    productionEndDate: 'Üretim Bitiş Tarihi',
    // Modal keys
    jobDetailModalTitle: 'İş Emri Detayları',
    close: 'Kapat',
  },
  en: {
    title: 'TE PLAST Production Assistant',
    subtitle: 'Manage Your Production Plan',
    productionData: 'Production Data',
    machine: 'Machine',
    ton: 'Ton',
    noData: 'No production data available for this machine.',
    // Dashboard keys
    todaysDate: "Today's Date",
    machineStatusDashboard: "Daily Machine Status",
    inProduction: "In Production",
    idle: "Idle",
    setMaintenance: "Set Maintenance",
    scheduledMaintenance: "Scheduled Maintenance",
    inMaintenance: "In Maintenance",
    weeklyCapacity: "Weekly Capacity",
    monthlyCapacity: "Monthly Capacity",
    used: "Used",
    // Downtime Histogram keys
    totalDowntime: "Total Machine Downtime",
    machineLossTimes: "Machine Time Losses",
    jobDowntimeShort: "Job Downtime",
    idleTimeShort: "Idle Time",
    totalLossShort: "Total Loss",
    hours: "hours",
    totalIdleTime: "Total Idle Time",
    totalJobDowntime: "Total Job Downtime",
    overallTotalLoss: "Overall Total Loss",
    // Upload keys
    uploadExcel: 'Upload Excel',
    updateExcel: 'Update Plan',
    uploadPrompt: 'Please upload your production plan Excel file to get started.',
    processingFile: 'Processing file...',
    fileError: 'An error occurred while reading the file. Please ensure it is a valid Excel file.',
    // Gantt keys
    plannerView: 'Planner',
    ganttView: 'Gantt Chart',
    filterByMachine: 'Filter by Machine:',
    filterByCustomer: 'Filter by Customer:',
    allCustomers: 'All Customers',
    generalTimeline: 'General Timeline',
    dailyTimeline: 'Daily Timeline',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    hourly: 'Hourly',
    selectDate: 'Select Date:',
    machineLegend: 'Machine Legend',
    ganttLocale: 'en',
    weekNumber: 'Week #%W',
    // Tooltip keys
    customerName: 'Customer Name',
    partNo: 'Part No',
    partName: 'Part Name',
    totalQuantity: 'Total Quantity',
    paintCode: 'Paint Code',
    productionEndDate: 'Production End Date',
    // Modal keys
    jobDetailModalTitle: 'Job Order Details',
    close: 'Close',
  }
};
// --- END OF translations.ts ---

// --- START OF utils/dateUtils.ts ---
const parseGanttDate = (dateInput: string | Date | null | undefined): Date | null => {
  if (dateInput instanceof Date) {
    return dateInput;
  }
  if (typeof dateInput === 'number') {
    dateInput = String(dateInput);
  }
  if (typeof dateInput !== 'string' || !dateInput.trim()) {
    return null;
  }
  try {
    const parts = dateInput.split(' ');
    const datePart = parts[0];
    if (!datePart) return null;
    const dateMatch = datePart.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if (!dateMatch) {
      const serial = parseFloat(dateInput);
      if (!isNaN(serial) && serial > 0) {
        const date = new Date((serial - 25569) * 86400 * 1000);
        const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
        if (!isNaN(adjustedDate.getTime())) {
          return adjustedDate;
        }
      }
      const parsed = new Date(dateInput);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    const [, dayStr, monthStr, yearStr] = dateMatch;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    let year = parseInt(yearStr, 10);
    if (year < 100) {
      year += 2000;
    }
    if (isNaN(day) || isNaN(month) || isNaN(year) || year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    let hours = 0;
    let minutes = 0;
    const timePart = parts[1];
    if (timePart && timePart.includes(':')) {
      const timeComponents = timePart.split(':').map(Number);
      hours = timeComponents[0] || 0;
      minutes = timeComponents[1] || 0;
      if (isNaN(hours) || isNaN(minutes)) {
          hours = 0;
          minutes = 0;
      }
    }
    return new Date(year, month - 1, day, hours, minutes);
  } catch (e) {
    console.error("Failed to parse date string:", dateInput, e);
    return null;
  }
};

const formatGanttDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const getFormattedDate = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

const parseDowntimeToHours = (timeStr: string | null | undefined): number => {
  if (!timeStr || typeof timeStr !== 'string') {
    return 0;
  }
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return 0;
  }
  const [hours, minutes, seconds] = parts;
  return hours + minutes / 60 + seconds / 3600;
};
// --- END OF utils/dateUtils.ts ---

// --- START OF components/JobDetailModal.tsx ---
const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose, translations: t, headers }) => {
  if (!job) {
    return null;
  }

  const formatDateForDisplay = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '-';
    const dateObj = parseGanttDate(dateInput);
    if (!dateObj || isNaN(dateObj.getTime())) {
      return String(dateInput ?? '-');
    }
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = String(dateObj.getFullYear());
    if (dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0 || dateObj.getSeconds() !== 0) {
      const hours = dateObj.getHours();
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } else {
      return `${day}.${month}.${year}`;
    }
  };

  const dateHeaders = new Set([
    "İŞ EMRİ TARİH ve SAATİ",
    "TERMİN TARİHİ",
    "PARÇA ÜRETİM SONU TARİHİ ve SAATİ",
  ]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-button" aria-label={t.close}>
          &times;
        </button>
        <h2 className="text-xl font-bold text-brand-primary mb-4">{t.jobDetailModalTitle}</h2>
        <div className="space-y-2 text-sm">
          {headers.map(header => {
            const value = job[header];
            const displayValue = dateHeaders.has(header)
                ? formatDateForDisplay(value)
                : String(value ?? '-');
            return (
                 <div key={header} className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
                    <dt className="font-semibold text-slate-600 col-span-1">{header}</dt>
                    <dd className="text-brand-secondary col-span-2">{displayValue}</dd>
                </div>
            )
          })}
        </div>
        <div className="mt-6 flex justify-end">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
            >
                {t.close}
            </button>
        </div>
      </div>
    </div>
  );
};
// --- END OF components/JobDetailModal.tsx ---

// --- START OF components/ProductionTable.tsx ---
const ProductionTable: React.FC<{
  data: ProductionData[];
  headers: string[];
  noDataText: string;
  onRowClick: (job: ProductionData) => void;
}> = ({ data, headers, noDataText, onRowClick }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500">
        <p>{noDataText}</p>
    </div>;
  }
  
    const formatDateForDisplay = (dateInput: string | Date | null | undefined): string => {
      if (!dateInput) return '-';
      const dateObj = parseGanttDate(dateInput);
      if (!dateObj || isNaN(dateObj.getTime())) {
        return String(dateInput ?? '-');
      }
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = String(dateObj.getFullYear());
      if (dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0 || dateObj.getSeconds() !== 0) {
        const hours = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
      } else {
        return `${day}.${month}.${year}`;
      }
    };

    const dateHeaders = new Set([
      "İŞ EMRİ TARİH ve SAATİ",
      "TERMİN TARİHİ",
      "PARÇA ÜRETİM SONU TARİHİ ve SAATİ",
    ]);

  const highlightHeader = "PARÇA ÜRETİM SONU TARİHİ ve SAATİ";

  return (
    <div className="overflow-auto rounded-lg border border-slate-200 shadow-sm h-full bg-white">
      <table className="w-full min-w-max text-sm text-left text-brand-primary">
        <thead className="text-xs text-brand-primary uppercase bg-slate-50 sticky top-0">
          <tr>
            {headers.map((header) => (
              <th 
                key={header} 
                scope="col" 
                className={`px-4 py-3 font-semibold ${
                  header === highlightHeader ? 'bg-blue-100 text-brand-accent' : ''
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => onRowClick(row)}>
              {headers.map((header) => {
                const cellValue = row[header];
                const displayValue = dateHeaders.has(header)
                  ? formatDateForDisplay(cellValue)
                  : String(cellValue ?? '-');
                return (
                  <td 
                    key={`${rowIndex}-${header}`} 
                    className={`px-4 py-3 whitespace-nowrap ${
                      header === highlightHeader ? 'bg-blue-50 font-semibold text-brand-secondary' : ''
                    }`}
                  >
                    {displayValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
// --- END OF components/ProductionTable.tsx ---

// --- START OF components/MachineStatusDashboard.tsx ---
const MachineStatusDashboard: React.FC<{
  planData: ProductionData[];
  translations: any;
  machineIds: number[];
  machineTonnages: { [key: number]: number };
  onAddMaintenance: (machineId: number) => void;
}> = ({
  planData,
  translations: t,
  machineIds,
  machineTonnages,
  onAddMaintenance,
}) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString(t.machine === 'Makine' ? 'tr-TR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const getActiveJobForToday = (machineId: number, data: ProductionData[]): ProductionData | null => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    for (const job of data) {
      if (job.machineId !== machineId) continue;
      const startDate = parseGanttDate(job['İŞ EMRİ TARİH ve SAATİ']);
      const endDate = parseGanttDate(job['PARÇA ÜRETİM SONU TARİHİ ve SAATİ']);
      if (startDate && endDate) {
        if (startDate <= endOfToday && endDate >= now) {
          return job;
        }
      }
    }
    return null;
  };

  const getWeeklyCapacity = (machineId: number, data: ProductionData[]): number => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(today.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      let totalHours = 0;
      const totalWeekHours = 24 * 7;
      const machineJobs = data.filter(job => job.machineId === machineId);
      for (const job of machineJobs) {
          const jobStart = parseGanttDate(job['İŞ EMRİ TARİH ve SAATİ']);
          const jobEnd = parseGanttDate(job['PARÇA ÜRETİM SONU TARİHİ ve SAATİ']);
          if (!jobStart || !jobEnd) continue;
          const overlapStart = Math.max(jobStart.getTime(), startOfWeek.getTime());
          const overlapEnd = Math.min(jobEnd.getTime(), endOfWeek.getTime());
          if (overlapEnd > overlapStart) {
              const durationMs = overlapEnd - overlapStart;
              totalHours += durationMs / (1000 * 60 * 60);
          }
      }
      return Math.round((totalHours / totalWeekHours) * 100);
  };

  const getMonthlyCapacity = (machineId: number, data: ProductionData[]): number => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      let totalHours = 0;
      const daysInMonth = endOfMonth.getDate();
      const totalMonthHours = 24 * daysInMonth;
      const machineJobs = data.filter(job => job.machineId === machineId);
      for (const job of machineJobs) {
          const jobStart = parseGanttDate(job['İŞ EMRİ TARİH ve SAATİ']);
          const jobEnd = parseGanttDate(job['PARÇA ÜRETİM SONU TARİHİ ve SAATİ']);
          if (!jobStart || !jobEnd) continue;
          const overlapStart = Math.max(jobStart.getTime(), startOfMonth.getTime());
          const overlapEnd = Math.min(jobEnd.getTime(), endOfMonth.getTime());
          if (overlapEnd > overlapStart) {
              const durationMs = overlapEnd - overlapStart;
              totalHours += durationMs / (1000 * 60 * 60);
          }
      }
      return Math.round((totalHours / totalMonthHours) * 100);
  };

  return (
    <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t.machineStatusDashboard}</h2>
        <div className="text-right">
          <p className="font-semibold text-slate-700">{t.todaysDate}</p>
          <p className="text-sm text-slate-500">{formattedDate}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {machineIds.map((id) => {
          const activeJob = getActiveJobForToday(id, planData);
          const weeklyCapacity = getWeeklyCapacity(id, planData);
          const monthlyCapacity = getMonthlyCapacity(id, planData);
          const weeklyCapacityColor = weeklyCapacity > 90 ? 'bg-red-500' : weeklyCapacity > 70 ? 'bg-yellow-500' : 'bg-green-500';
          const monthlyCapacityColor = monthlyCapacity > 90 ? 'bg-red-500' : monthlyCapacity > 70 ? 'bg-yellow-500' : 'bg-green-500';

          return (
            <div key={id} className="border border-slate-200 rounded-lg p-3 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-brand-primary">
                  {t.machine} {id}
                </h3>
                <p className="text-xs text-slate-500 mb-2">
                  ({machineTonnages[id]} {t.ton})
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t.weeklyCapacity}</p>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div className={`${weeklyCapacityColor} h-2.5 rounded-full`} style={{ width: `${weeklyCapacity}%` }}></div>
                  </div>
                  <p className="text-xs text-right text-slate-500">{weeklyCapacity}% {t.used}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t.monthlyCapacity}</p>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div className={`${monthlyCapacityColor} h-2.5 rounded-full`} style={{ width: `${monthlyCapacity}%` }}></div>
                  </div>
                  <p className="text-xs text-right text-slate-500">{monthlyCapacity}% {t.used}</p>
                </div>
              </div>

              {activeJob ? (
                 activeJob['PARÇA NO'] === 'BAKIM' ? (
                    <div className="text-sm pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                         <span className="relative flex h-2.5 w-2.5">
                           <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                         </span>
                         <span className="font-semibold text-orange-700">{t.inMaintenance}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 truncate" title={activeJob['PARÇA ADI']}>
                         {activeJob['PARÇA ADI']}
                      </p>
                    </div>
                 ) : (
                    <div className="text-sm pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        <span className="font-semibold text-green-700">{t.inProduction}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 truncate" title={activeJob['PARÇA ADI']}>
                        {activeJob['PARÇA ADI']}
                      </p>
                    </div>
                 )
              ) : (
                <div className="text-sm pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                       <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"></span>
                    </span>
                    <span className="font-semibold text-slate-600">{t.idle}</span>
                  </div>
                   <button 
                     onClick={() => onAddMaintenance(id)}
                     className="mt-2 w-full text-xs bg-blue-100/60 text-blue-800 hover:bg-blue-200/60 font-semibold py-1 px-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-accent">
                     {t.setMaintenance}
                   </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
// --- END OF components/MachineStatusDashboard.tsx ---

// --- START OF components/DowntimeHistogram.tsx ---
const DowntimeHistogram: React.FC<DowntimeHistogramProps> = ({ downtimeData, translations: t, machineTonnages }) => {
  if (!downtimeData || downtimeData.length === 0) {
    return null;
  }
  const barColors = {
    idleTime: '#f59e0b',
    jobDowntime: '#ef4444',
    totalLoss: '#475569',
  };
  const totals = downtimeData.reduce(
    (acc, data) => {
        acc.idleTime += data.idleTime;
        acc.jobDowntime += data.jobDowntime;
        acc.totalLoss += data.totalLoss;
        return acc;
    },
    { idleTime: 0, jobDowntime: 0, totalLoss: 0 }
  );
  const maxVal = Math.max(...downtimeData.map(d => d.totalLoss), 1);

  const Bar = ({ value, maxValue, color, title, labelStyle }: { value: number; maxValue: number; color: string; title: string; labelStyle: string }) => {
    const heightPercentage = (value / maxValue) * 100;
    if (heightPercentage < 0.1) {
      return <div className="relative w-1/3"></div>;
    }
    return (
      <div
        className="relative w-1/3 rounded-t-md transition-all duration-500"
        style={{ height: `${heightPercentage}%`, backgroundColor: color }}
        title={title}
      >
        <span className={`absolute left-1/2 -translate-x-1/2 text-xs ${labelStyle}`}>
          {value.toFixed(2)}
        </span>
      </div>
    );
  };

  return (
    <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-brand-primary w-1/4">{t.machineLossTimes}</h2>
        <div className="flex-1 flex justify-center gap-6 text-center -mt-1">
          <div>
            <p className="text-xs font-semibold text-slate-500">{t.totalIdleTime}</p>
            <p className="text-xl font-bold text-amber-500">{totals.idleTime.toFixed(2)} <span className="text-sm font-medium text-slate-600">{t.hours}</span></p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">{t.totalJobDowntime}</p>
            <p className="text-xl font-bold text-red-500">{totals.jobDowntime.toFixed(2)} <span className="text-sm font-medium text-slate-600">{t.hours}</span></p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">{t.overallTotalLoss}</p>
            <p className="text-xl font-bold text-slate-600">{totals.totalLoss.toFixed(2)} <span className="text-sm font-medium text-slate-600">{t.hours}</span></p>
          </div>
        </div>
        <div className="w-1/4 flex justify-end items-center gap-4 text-xs font-semibold">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-sm mr-1.5" style={{backgroundColor: barColors.idleTime}}></span>
            <span>{t.idleTimeShort}</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-sm mr-1.5" style={{backgroundColor: barColors.jobDowntime}}></span>
            <span>{t.jobDowntimeShort}</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-sm mr-1.5" style={{backgroundColor: barColors.totalLoss}}></span>
            <span>{t.totalLossShort}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-around items-end h-56 space-x-1">
        {downtimeData.map(({ machineId, jobDowntime, idleTime, totalLoss }) => (
          <div 
            key={machineId} 
            className={`flex flex-col items-center flex-1 h-full text-center px-2 border-r border-slate-200 last:border-r-0`}
          >
             <div className="w-full flex-grow flex items-end justify-center gap-1.5 pt-8">
               <Bar 
                 value={idleTime} maxValue={maxVal} color={barColors.idleTime}
                 title={`${t.machine} ${machineId} - ${t.idleTimeShort}: ${idleTime.toFixed(2)} ${t.hours}`}
                 labelStyle="font-semibold text-slate-600 -top-5"
               />
               <Bar 
                 value={jobDowntime} maxValue={maxVal} color={barColors.jobDowntime}
                 title={`${t.machine} ${machineId} - ${t.jobDowntimeShort}: ${jobDowntime.toFixed(2)} ${t.hours}`}
                 labelStyle="font-semibold text-slate-600 -top-5"
               />
                <Bar 
                 value={totalLoss} maxValue={maxVal} color={barColors.totalLoss}
                 title={`${t.machine} ${machineId} - ${t.totalLossShort}: ${totalLoss.toFixed(2)} ${t.hours}`}
                 labelStyle="bg-slate-700 text-white px-1.5 py-0.5 rounded-md font-bold -top-7"
               />
            </div>
            <div className="text-sm font-bold text-brand-primary mt-2">
              {t.machine} {machineId}
            </div>
            <div className="text-xs text-slate-500">
              ({machineTonnages[machineId]} {t.ton})
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
// --- END OF components/DowntimeHistogram.tsx ---

// --- START OF components/GanttChartView.tsx ---
// FIX: Define GeneralView and TimelineView types.
type GeneralView = 'day' | 'week' | 'month';
type TimelineView = 'general' | 'daily';
const GanttChartView: React.FC<GanttChartViewProps> = ({ planData, translations: t, machineIds, machineTonnages, onTaskClick }) => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [filteredMachines, setFilteredMachines] = useState<number[]>(machineIds);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [generalView, setGeneralView] = useState<GeneralView>('week');
  const [timelineView, setTimelineView] = useState<TimelineView>('general');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const customerOptions = useMemo(() => {
    const customers = new Set(planData.map(p => p['MÜŞTERİ ADI']).filter(Boolean));
    return ['all', ...Array.from(customers)];
  }, [planData]);

  const machineColors = ['#3b82f6', '#10b981', '#ef4444', '#f97316', '#8b5cf6', '#ec4899'];

  const handleTaskClick = (id: string) => {
      const task = (window as any).gantt.getTask(id);
      if (task.type === (window as any).gantt.config.types.project) return;
      const job = planData[parseInt(id, 10)];
      if(job) {
        onTaskClick(job);
      }
  };

  const handleMachineFilterChange = (machineId: number) => {
    setFilteredMachines(prev =>
      prev.includes(machineId) ? prev.filter(id => id !== machineId) : [...prev, machineId]
    );
  };

  useEffect(() => {
    const gantt = (window as any).gantt;
    if (!ganttContainer.current) return;
    
    gantt.plugins({ tooltip: true });
    gantt.clearAll();

    gantt.config.columns = [{ name: "text", label: t.productionData, tree: true, width: '*' }];
    gantt.config.readonly = true;
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.i18n.setLocale(t.ganttLocale);
    gantt.config.row_height = 35;
    gantt.config.task_height = 18;
    gantt.config.scale_height = 65;
    gantt.config.autofit = false;

    gantt.templates.task_class = (start: Date, end: Date, task: any): string => {
        let classes = `machine_${task.machineId}`;
        if (task.due_date && end > task.due_date) {
            classes += ' overdue';
        }
        return classes;
    };
    
    gantt.templates.tooltip_text = (start: Date, end: Date, task: any) => {
        if (task.type === gantt.config.types.project) {
            return `<b>${task.text}</b>`;
        }
        return `<b>${t.customerName}:</b> ${task.customer || '-'}<br/>` +
               `<b>${t.partNo}:</b> ${task.part_no || '-'}<br/>` +
               `<b>${t.partName}:</b> ${task.text || '-'}<br/>` +
               `<b>${t.totalQuantity}:</b> ${task.total_quantity || '-'}<br/>` +
               `<b>${t.paintCode}:</b> ${task.paint_code || '-'}<br/>` +
               `<b>${t.productionEndDate}:</b> ${gantt.templates.tooltip_date_format(end)}`;
    };
    
    const onClickEvent = gantt.attachEvent("onTaskClick", handleTaskClick);

    gantt.init(ganttContainer.current);
    
    return () => {
        gantt.detachEvent(onClickEvent);
    }

  }, [t]);

  useEffect(() => {
    const gantt = (window as any).gantt;
    if (timelineView === 'general') {
        gantt.config.start_date = null;
        gantt.config.end_date = null;
        gantt.config.fit_tasks = true;
        
        if (generalView === 'day') {
            gantt.config.scales = [
              { unit: "day", step: 1, date: "%d %M" },
              { unit: "hour", step: 1, date: "%H:%i" }
            ];
        } else if (generalView === 'week') {
            gantt.config.scales = [
              { unit: "month", step: 1, date: "%F, %Y" },
              { unit: "week", step: 1, date: t.weekNumber },
              { unit: "day", step: 1, date: "%d" }
            ];
        } else {
            gantt.config.scales = [
              { unit: "year", step: 1, date: "%Y" },
              { unit: "month", step: 1, date: "%F" }
            ];
        }
    } else {
        gantt.config.fit_tasks = false;
        gantt.config.scales = [
            {unit: "day", step: 1, date: "%d %M, %Y"},
            {unit: "hour", step: 1, date: "%H:00"}
        ];
        const date = new Date(selectedDate);
        date.setUTCHours(0, 0, 0, 0);
        gantt.config.start_date = date;
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        gantt.config.end_date = endDate;
    }
    gantt.render();
  }, [timelineView, generalView, selectedDate, t.weekNumber]);

  useEffect(() => {
    const gantt = (window as any).gantt;
    const filteredData = planData.filter(
      p => filteredMachines.includes(p.machineId) && (selectedCustomer === 'all' || p['MÜŞTERİ ADI'] === selectedCustomer)
    );
    const tasks = [] as any[];
    const displayedMachines = [...new Set(filteredData.map(p => Number(p.machineId)))].sort((a, b) => Number(a) - Number(b));
    displayedMachines.forEach(id => {
        tasks.push({
            id: `machine-${id}`,
            text: `${t.machine} ${id} (${machineTonnages[id as number]} ${t.ton})`,
            type: gantt.config.types.project,
            open: true,
            machineId: id as number,
            hide_bar: true,
        });
    });
    filteredData.forEach((job) => {
      const planDataIndex = planData.findIndex(p => p === job);
      if (planDataIndex === -1) return;
      const startDate = parseGanttDate(job['İŞ EMRİ TARİH ve SAATİ']);
      let endDate = parseGanttDate(job['PARÇA ÜRETİM SONU TARİHİ ve SAATİ']);
      const dueDate = parseGanttDate(job['TERMİN TARİHİ']);
      if (!startDate || !endDate) return;
      if (endDate < startDate) {
        const durationHoursStr = String(job['MAKİNE ÇALIŞMA SAATİ']).replace(',', '.');
        const durationHours = parseFloat(durationHoursStr);
        if (!isNaN(durationHours) && durationHours > 0) {
          const newEndDate = new Date(startDate.getTime());
          newEndDate.setHours(newEndDate.getHours() + durationHours);
          endDate = newEndDate;
        }
      }
      tasks.push({
        id: String(planDataIndex),
        text: job['PARÇA ADI'] || 'N/A',
        start_date: formatGanttDate(startDate),
        end_date: formatGanttDate(endDate),
        due_date: dueDate,
        parent: `machine-${job.machineId}`,
        machineId: job.machineId,
        customer: job['MÜŞTERİ ADI'],
        part_no: job['PARÇA NO'],
        total_quantity: job['TOPLAM ADET'],
        paint_code: job['BOYA KODU'],
      });
    });
    gantt.clearAll();
    gantt.parse({ data: tasks });
  }, [planData, filteredMachines, selectedCustomer, t, machineTonnages]);

  return (
    <main className="flex-grow flex flex-col space-y-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">{t.filterByCustomer}</label>
                <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white text-brand-primary">
                    {customerOptions.map(c => <option key={c} value={c}>{c === 'all' ? t.allCustomers : c}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">{t.filterByMachine}</label>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {machineIds.map(id => (
                        <div key={id} className="flex items-center">
                            <input type="checkbox" id={`machine-${id}`} checked={filteredMachines.includes(id)} onChange={() => handleMachineFilterChange(id)} className="h-4 w-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"/>
                            <label htmlFor={`machine-${id}`} className="ml-1.5 text-sm text-slate-700">{t.machine} {id}</label>
                        </div>
                    ))}
                </div>
            </div>
             <div className="lg:col-span-2 flex flex-col md:flex-row items-start md:items-end gap-4">
                <div className="flex-1 w-full">
                     <label className="text-sm font-semibold text-slate-600 block mb-1">{timelineView === 'general' ? t.generalTimeline : t.dailyTimeline}</label>
                     <div className="flex items-center p-1 rounded-md bg-slate-200 w-full">
                         <button onClick={() => setTimelineView('general')} className={`flex-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${timelineView === 'general' ? 'bg-white text-brand-primary shadow' : 'text-slate-600'}`}>{t.generalTimeline}</button>
                         <button onClick={() => setTimelineView('daily')} className={`flex-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${timelineView === 'daily' ? 'bg-white text-brand-primary shadow' : 'text-slate-600'}`}>{t.dailyTimeline}</button>
                     </div>
                </div>
                {timelineView === 'general' ? (
                    <div className="flex-1 w-full">
                        <div className="flex items-center p-1 rounded-md bg-slate-200 w-full">
                            <button onClick={() => setGeneralView('day')} className={`flex-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${generalView === 'day' ? 'bg-white text-brand-primary shadow' : 'text-slate-600'}`}>{t.day}</button>
                            <button onClick={() => setGeneralView('week')} className={`flex-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${generalView === 'week' ? 'bg-white text-brand-primary shadow' : 'text-slate-600'}`}>{t.week}</button>
                            <button onClick={() => setGeneralView('month')} className={`flex-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${generalView === 'month' ? 'bg-white text-brand-primary shadow' : 'text-slate-600'}`}>{t.month}</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 w-full">
                         <label htmlFor="date-select" className="text-sm font-semibold text-slate-600 block mb-1">{t.selectDate}</label>
                        <input type="date" id="date-select" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white text-brand-primary focus:ring-brand-accent focus:border-brand-accent"/>
                    </div>
                )}
            </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex-grow flex flex-col">
         <div className="mb-2">
            <h3 className="text-sm font-semibold text-slate-600">{t.machineLegend}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                {machineIds.map((id, index) => (
                    <div key={id} className="flex items-center">
                        <span className="h-3 w-3 rounded-sm" style={{backgroundColor: machineColors[index]}}></span>
                        <span className="ml-1.5 text-xs text-slate-700">{t.machine} {id}</span>
                    </div>
                ))}
            </div>
         </div>
        <div ref={ganttContainer} className="flex-grow" style={{ width: '100%' }}></div>
      </div>
    </main>
  );
};
// --- END OF components/GanttChartView.tsx ---

// --- START OF App.tsx ---
declare var XLSX: any;
declare var gantt: any;

const machineTonnages: { [key: number]: number } = { 1: 320, 2: 120, 3: 150, 4: 130, 5: 130, 6: 150 };

const displayedHeaders = ["SIRA NO", "İŞ EMRİ TARİH ve SAATİ", "TERMİN TARİHİ", "MÜŞTERİ ADI", "PARÇA NO", "PARÇA ADI", "TOPLAM ADET", "ÇEVRİM SÜRESİ", "TOPLAM DK", "BRÜT ÜRÜN GRAMAJI", "HAMMADDE ADI", "TOPLAM GEREKLİ HAMMADDE KG", "BOYA KODU", "TOPLAM GEREKLİ BOYA", "TOPLAM GEREKLİ BOYA KG.", "TOPLAM GÖZ", "BASKI SAYISI", "MAKİNE ÇALIŞMA SAATİ", "MAKİNE DURUŞ SAATİ", "PARÇA ÜRETİM SONU TARİHİ ve SAATİ"];

type View = 'planner' | 'gantt';

const formatDurationString = (timeStr: string | null | undefined): string => {
    if (!timeStr || typeof timeStr !== 'string') return timeStr || '';
    const match = timeStr.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(am|pm)?/i);
    if (!match) {
        if (/^(\d{1,2}):(\d{2}):(\d{2})$/.test(timeStr)) return timeStr;
        const timeSerial = parseFloat(timeStr);
        if (!isNaN(timeSerial) && timeSerial >= 0 && timeSerial < 1) {
            const totalSeconds = Math.round(timeSerial * 86400);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return [String(hours).padStart(2, '0'), String(minutes).padStart(2, '0'), String(seconds).padStart(2, '0')].join(':');
        }
        return timeStr; 
    }
    let [, hours, minutes, seconds, modifier] = match;
    let h = parseInt(hours, 10);
    if (modifier) {
        modifier = modifier.toLowerCase();
        if (modifier === 'pm' && h < 12) h += 12;
        if (modifier === 'am' && h === 12) h = 0;
    }
    return [String(h).padStart(2, '0'), minutes, seconds].join(':');
};

const LanguageToggle: React.FC<{ language: 'tr' | 'en', setLanguage: (lang: 'tr' | 'en') => void }> = ({ language, setLanguage }) => (
    <div className="flex items-center p-1 rounded-full bg-slate-200">
        <button onClick={() => setLanguage('tr')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'tr' ? 'bg-white text-brand-primary shadow' : 'text-slate-600 hover:text-brand-primary'}`}>TR</button>
        <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'en' ? 'bg-white text-brand-primary shadow' : 'text-slate-600 hover:text-brand-primary'}`}>EN</button>
    </div>
);

const ViewToggle: React.FC<{ view: View, setView: (view: View) => void, t: any }> = ({ view, setView, t }) => (
  <div className="flex items-center p-1 rounded-full bg-slate-200">
      <button onClick={() => setView('planner')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${view === 'planner' ? 'bg-white text-brand-primary shadow' : 'text-slate-600 hover:text-brand-primary'}`}>{t.plannerView}</button>
      <button onClick={() => setView('gantt')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${view === 'gantt' ? 'bg-white text-brand-primary shadow' : 'text-slate-600 hover:text-brand-primary'}`}>{t.ganttView}</button>
  </div>
);

const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [planData, setPlanData] = useState<ProductionData[]>([]);
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [view, setView] = useState<View>('planner');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ProductionData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[language];

  useEffect(() => {
    try {
      const savedPlanData = localStorage.getItem('planData');
      const savedLanguage = localStorage.getItem('language') as 'tr' | 'en';
      if (savedPlanData) {
        const parsedData = JSON.parse(savedPlanData, (key, value) => {
           if (["İŞ EMRİ TARİH ve SAATİ", "TERMİN TARİHİ", "PARÇA ÜRETİM SONU TARİHİ ve SAATİ"].includes(key) && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
             return new Date(value);
           }
           return value;
        });
        setPlanData(parsedData);
      }
      if (savedLanguage) setLanguage(savedLanguage);
    } catch (e) { console.error("Failed to load data from localStorage", e); }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('planData', JSON.stringify(planData)); } catch (e) { console.error("Failed to save planData to localStorage", e); }
  }, [planData]);

   useEffect(() => {
    try { localStorage.setItem('language', language); } catch (e) { console.error("Failed to save language to localStorage", e); }
  }, [language]);

  const machineIds = useMemo(() => [...new Set(planData.map(p => p.machineId))].sort((a,b) => Number(a) - Number(b)), [planData]);

  const downtimeData = useMemo(() => {
    if (planData.length === 0) return [];
    const jobDowntimeByMachine: { [key: number]: number } = {};
    const idleTimeByMachine: { [key: number]: number } = {};
    for (const job of planData) {
        if (!jobDowntimeByMachine[job.machineId]) jobDowntimeByMachine[job.machineId] = 0;
        jobDowntimeByMachine[job.machineId] += parseDowntimeToHours(job['MAKİNE DURUŞ SAATİ']);
    }
    for (const id of machineIds) {
      idleTimeByMachine[id] = 0;
      const machineJobs = planData.filter(job => job.machineId === id).sort((a, b) => {
          const dateA = parseGanttDate(a['İŞ EMRİ TARİH ve SAATİ']);
          const dateB = parseGanttDate(b['İŞ EMRİ TARİH ve SAATİ']);
          if (dateA && dateB) return dateA.getTime() - dateB.getTime();
          return 0;
      });
      for (let i = 0; i < machineJobs.length - 1; i++) {
          const currentJobEnd = parseGanttDate(machineJobs[i]['PARÇA ÜRETİM SONU TARİHİ ve SAATİ']);
          const nextJobStart = parseGanttDate(machineJobs[i + 1]['İŞ EMRİ TARİH ve SAATİ']);
          if (currentJobEnd && nextJobStart && nextJobStart.getTime() > currentJobEnd.getTime()) {
              const idleMillis = nextJobStart.getTime() - currentJobEnd.getTime();
              idleTimeByMachine[id] += idleMillis / (1000 * 60 * 60);
          }
      }
    }
    return machineIds.map(id => {
        const jobDowntime = jobDowntimeByMachine[id] || 0;
        const idleTime = idleTimeByMachine[id] || 0;
        return { machineId: id, jobDowntime, idleTime, totalLoss: jobDowntime + idleTime };
    });
  }, [planData, machineIds]);
  
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);

  useEffect(() => {
    if (machineIds.length > 0 && !machineIds.includes(selectedMachineId as number)) {
      setSelectedMachineId(machineIds[0]);
    } else if (machineIds.length === 0) {
      setSelectedMachineId(null);
    }
  }, [machineIds, selectedMachineId]);
  
  const handleAddMaintenance = (machineId: number) => {
    const today = new Date();
    const startMaintenanceDate = new Date(today);
    startMaintenanceDate.setHours(8, 0, 0, 0);
    const endMaintenanceDate = new Date(today);
    endMaintenanceDate.setHours(17, 0, 0, 0);
    const terminDate = new Date(today);
    terminDate.setHours(0,0,0,0);
    const newMaintenanceRecord: ProductionData = {
      machineId, "SIRA NO": null, "İŞ EMRİ TARİH ve SAATİ": startMaintenanceDate, "TERMİN TARİHİ": terminDate,
      "MÜŞTERİ ADI": "-", "PARÇA NO": "BAKIM", "PARÇA ADI": t.scheduledMaintenance, "TOPLAM ADET": "-",
      "ÇEVRİM SÜRESİ": "-", "TOPLAM DK": "480", "BRÜT ÜRÜN GRAMAJI": "-", "HAMMADDE ADI": "-",
      "TOPLAM GEREKLİ HAMMADDE KG": "-", "BOYA KODU": "-", "TOPLAM GEREKLİ BOYA": "-", "TOPLAM GEREKLİ BOYA KG.": "-",
      "TOPLAM GÖZ": "-", "BASKI SAYISI": "-", "MAKİNE ÇALIŞMA SAATİ": "8", "MAKİNE DURUŞ SAATİ": "00:00:00",
      "PARÇA ÜRETİM SONU TARİHİ ve SAATİ": endMaintenanceDate,
    };
    setPlanData(prevData => [...prevData, newMaintenanceRecord]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsFileLoading(true);
    setError(null);
    setPlanData([]);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: false, dateNF:'dd.mm.yyyy hh:mm' });
        const sheetNames = ["MAKİNE 1", "MAKİNE 2", "MAKİNE 3", "MAKİNE 4", "MAKİNE 5", "MAKİNE 6"];
        let allData: ProductionData[] = [];
        const headerMapping: { [key: string]: keyof ProductionData } = {
          A: "SIRA NO", B: "İŞ EMRİ TARİH ve SAATİ", C: "TERMİN TARİHİ", D: "MÜŞTERİ ADI",
          E: "PARÇA NO", F: "PARÇA ADI", G: "TOPLAM ADET", H: "ÇEVRİM SÜRESİ", I: "TOPLAM DK",
          L: "BRÜT ÜRÜN GRAMAJI", M: "HAMMADDE ADI", N: "TOPLAM GEREKLİ HAMMADDE KG", O: "BOYA KODU",
          P: "TOPLAM GEREKLİ BOYA", Q: "TOPLAM GEREKLİ BOYA KG.", R: "TOPLAM GÖZ", S: "BASKI SAYISI",
          V: "MAKİNE ÇALIŞMA SAATİ", X: "MAKİNE DURUŞ SAATİ", AA: "PARÇA ÜRETİM SONU TARİHİ ve SAATİ",
        };
        for (const sheetName of sheetNames) {
          if (workbook.Sheets[sheetName]) {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 'A', raw: false });
            const machineId = parseInt(sheetName.split(' ')[1]);
            const processedData = jsonData.slice(1).filter(row => row['E'] && row['E'] !== '#N/A').map((row: any) => {
                const newRow: any = { machineId };
                 for (const col in headerMapping) {
                  const header = headerMapping[col];
                  newRow[header] = header === "MAKİNE DURUŞ SAATİ" ? formatDurationString(row[col]) : (row[col] || null);
                }
                return newRow as ProductionData;
              });
            allData = allData.concat(processedData);
          }
        }
        setPlanData(allData);
        setError(null);
      } catch (err) {
        console.error("File parsing error:", err);
        setError(t.fileError);
      } finally { setIsFileLoading(false); }
    };
    reader.onerror = () => { setError(t.fileError); setIsFileLoading(false); };
    reader.readAsArrayBuffer(file);
    if (e.target) e.target.value = '';
  };

  const openJobModal = (job: ProductionData) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const filteredData = useMemo(() => selectedMachineId ? planData.filter(p => p.machineId === selectedMachineId) : [], [selectedMachineId, planData]);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 lg:p-8 space-y-4 bg-brand-bg text-brand-primary">
      <header className="flex justify-between items-start">
        <div className="flex items-center gap-4">
            <img src="./assets/teplastlogo.png" alt="Company Logo" className="h-12 sm:h-14 w-auto" />
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{t.title}</h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1">{t.subtitle}</p>
            </div>
        </div>
         <div className="flex items-center gap-4">
            {planData.length > 0 && (
              <>
                <ViewToggle view={view} setView={setView} t={t} />
                <LanguageToggle language={language} setLanguage={setLanguage} />
              </>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls, .csv"/>
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isFileLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-slate-400 disabled:cursor-wait"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                {planData.length > 0 ? t.updateExcel : t.uploadExcel}
            </button>
        </div>
      </header>
      
      {isFileLoading ? (
         <main className="flex-grow flex flex-col items-center justify-center text-center">
            <svg className="animate-spin h-8 w-8 text-brand-accent mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="mt-4 text-lg font-semibold">{t.processingFile}</p>
         </main>
      ) : planData.length === 0 ? (
         <main className="flex-grow flex flex-col items-center justify-center text-center">
            <p className="text-slate-600 max-w-md">{error || t.uploadPrompt}</p>
         </main>
      ) : (
        view === 'planner' ? (
        <div className="flex-grow flex flex-col space-y-6 min-h-0">
          <DowntimeHistogram downtimeData={downtimeData} translations={t} machineTonnages={machineTonnages} />
          <MachineStatusDashboard planData={planData} translations={t} machineIds={machineIds} machineTonnages={machineTonnages} onAddMaintenance={handleAddMaintenance} />
          <main className="flex-grow flex flex-col min-h-0">
            <section className="flex flex-col overflow-hidden flex-grow">
                <h2 className="text-xl font-semibold mb-4">{t.productionData}</h2>
                <div className="border-b border-slate-200">
                  <nav className="-mb-px flex space-x-1 sm:space-x-2" aria-label="Tabs">
                    {machineIds.map((id) => (
                      <button
                        key={id}
                        onClick={() => setSelectedMachineId(id)}
                        className={`${id === selectedMachineId ? 'border-brand-accent text-brand-accent' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-400'} whitespace-nowrap py-2 px-1 sm:px-2 border-b-2 font-semibold text-xs sm:text-sm transition-colors focus:outline-none`}
                        aria-current={id === selectedMachineId ? 'page' : undefined}
                      >
                        {t.machine} {id} ({machineTonnages[id]} {t.ton})
                      </button>
                    ))}
                  </nav>
                </div>
                <div className="flex-grow overflow-hidden mt-4">
                   <ProductionTable data={filteredData} headers={displayedHeaders} noDataText={t.noData} onRowClick={openJobModal} />
                </div>
            </section>
          </main>
        </div>
        ) : (
          <GanttChartView planData={planData} translations={t} machineIds={machineIds} machineTonnages={machineTonnages} onTaskClick={openJobModal} />
        )
      )}
      {isModalOpen && <JobDetailModal job={selectedJob} onClose={() => setIsModalOpen(false)} translations={t} headers={displayedHeaders} />}
    </div>
  );
};
// --- END OF App.tsx ---

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
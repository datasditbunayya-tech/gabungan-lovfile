import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title: string;
  filename: string;
}

// Export to Excel
export function exportToExcel(data: ExportData, selectedMonth?: string) {
  const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, data.title);
  
  const monthSuffix = selectedMonth ? `_${selectedMonth}` : '';
  XLSX.writeFile(wb, `${data.filename}${monthSuffix}.xlsx`);
}

// Export to PDF
export function exportToPDF(data: ExportData, studentName?: string) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('BUNAYYA ISLAMIC SCHOOL', 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(data.title, 105, 25, { align: 'center' });
  
  if (studentName) {
    doc.setFontSize(12);
    doc.text(`Nama Siswa: ${studentName}`, 14, 35);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 42);
  }
  
  // Table
  doc.autoTable({
    head: [data.headers],
    body: data.rows,
    startY: studentName ? 50 : 35,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });
  
  doc.save(`${data.filename}.pdf`);
}

// Helper function to get month options
export function getMonthOptions() {
  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];
  
  const currentYear = new Date().getFullYear();
  return months.map(m => ({
    value: `${currentYear}-${m.value}`,
    label: `${m.label} ${currentYear}`,
  }));
}

// Filter data by month
export function filterByMonth<T extends { date?: string; created_at?: string }>(
  data: T[],
  selectedMonth: string
): T[] {
  if (!selectedMonth) return data;
  
  return data.filter(item => {
    const date = item.date || item.created_at || '';
    return date.startsWith(selectedMonth);
  });
}

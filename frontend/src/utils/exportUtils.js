import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (val) => {
  if (!val && val !== 0) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};

export function exportToExcel(data, columns, filename, title) {
  const header = columns.map(c => c.label);
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.key];
      if (c.type === 'currency') return formatCurrency(val);
      if (c.type === 'date') return formatDate(val);
      return val ?? '-';
    })
  );

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  const colWidths = columns.map(c => ({ wch: Math.max(c.label.length, 20) }));
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportToPDF(data, columns, filename, title) {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tanggal Cetak: ${formatDate(new Date().toISOString())}`, 14, 23);

  const head = [columns.map(c => c.label)];
  const body = data.map(row =>
    columns.map(c => {
      const val = row[c.key];
      if (c.type === 'currency') return formatCurrency(val);
      if (c.type === 'date') return formatDate(val);
      return val ?? '-';
    })
  );

  autoTable(doc, {
    head,
    body,
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

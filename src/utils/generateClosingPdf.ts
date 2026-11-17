import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Transaction,
  formatCurrency,
  formatDateBR,
  formatMonthLabel,
  getReimbursementLabel,
} from '../types/fund';

export interface ClosingPdfParams {
  selectedMonth: string;
  closingDate: string;
  closingResponsible: string;
  totalCeiling: number;
  totalInflows: number;
  totalOutflows: number;
  finalBalance: number;
  reimbursedPaid: number;
  reimbursedPending: number;
  transactions: Transaction[];
}

async function loadLogoDataUrl(): Promise<{
  dataUrl: string;
  width: number;
  height: number;
} | null> {
  try {
    const res = await fetch('/assets/aistudio/Marcas-07_68a5121c.jpg');
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read logo'));
      reader.readAsDataURL(blob);
    });

    const dims = await new Promise<{ width: number; height: number }>(
      (resolve) => {
        const img = new Image();
        img.onload = () =>
          resolve({
            width: img.naturalWidth || 240,
            height: img.naturalHeight || 288,
          });
        img.onerror = () => resolve({ width: 240, height: 288 });
        img.src = dataUrl;
      }
    );

    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

export async function generateClosingPdf(
  params: ClosingPdfParams
): Promise<void> {
  const {
    selectedMonth,
    closingDate,
    closingResponsible,
    totalCeiling,
    totalInflows,
    totalOutflows,
    finalBalance,
    reimbursedPaid,
    reimbursedPending,
    transactions,
  } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const logo = await loadLogoDataUrl();
  let headerTextX = margin;

  if (logo?.dataUrl) {
    const logoHeight = 16;
    const logoWidth = (logo.width / logo.height) * logoHeight;
    doc.addImage(logo.dataUrl, 'JPEG', margin, 11, logoWidth, logoHeight);
    headerTextX = margin + logoWidth + 4;
  }

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 61, 122); // ACB Navy #003D7A
  doc.text(
    'RELATÓRIO DE PRESTAÇÃO DE CONTAS - FUNDO FIXO (ACB)',
    headerTextX,
    17
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Mês de Referência: ${formatMonthLabel(selectedMonth)}  |  Fechamento: ${formatDateBR(closingDate)}`,
    headerTextX,
    22.5
  );
  doc.text(
    `Associação Comercial da Bahia  |  Emissão: ${formatDateBR(
      new Date().toISOString().slice(0, 10)
    )}`,
    headerTextX,
    27
  );

  doc.setDrawColor(0, 61, 122);
  doc.setLineWidth(0.6);
  doc.line(margin, 31, pageWidth - margin, 31);

  // 4 Financial Summary Boxes
  const gap = 3;
  const boxWidth = (contentWidth - gap * 3) / 4;
  const boxY = 36;
  const boxHeight = 16;

  const kpis = [
    {
      label: 'TETO OPERACIONAL',
      value: formatCurrency(totalCeiling),
      color: [15, 23, 42] as const,
    },
    {
      label: 'ENTRADAS / APORTES',
      value: formatCurrency(totalInflows),
      color: [4, 120, 87] as const,
    },
    {
      label: 'DESPESAS REALIZADAS',
      value: formatCurrency(totalOutflows),
      color: [190, 18, 60] as const,
    },
    {
      label: 'SALDO DISPONÍVEL',
      value: formatCurrency(finalBalance),
      color: [0, 61, 122] as const,
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (boxWidth + gap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, boxY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 2.5, boxY + 5);

    doc.setFontSize(10);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 2.5, boxY + 12);
  });

  // 2 Reimbursement Summary Boxes
  const reimY = boxY + boxHeight + 4;
  const reimWidth = (contentWidth - gap) / 2;
  const reimHeight = 14;

  // Paid
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, reimY, reimWidth, reimHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(6, 95, 70);
  doc.text('REEMBOLSADO AOS FUNCIONÁRIOS', margin + 2.5, reimY + 5);
  doc.setFontSize(9.5);
  doc.text(formatCurrency(reimbursedPaid), margin + 2.5, reimY + 11);

  // Pending
  const pendingX = margin + reimWidth + gap;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(pendingX, reimY, reimWidth, reimHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setTextColor(146, 64, 14);
  doc.text(
    'PENDENTE DE REEMBOLSO AOS FUNCIONÁRIOS',
    pendingX + 2.5,
    reimY + 5
  );
  doc.setFontSize(9.5);
  doc.text(formatCurrency(reimbursedPending), pendingX + 2.5, reimY + 11);

  // Transactions Table Section Title
  const tableTitleY = reimY + reimHeight + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('DETALHAMENTO DAS MOVIMENTAÇÕES', margin, tableTitleY);

  const sorted = [...transactions].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const rows =
    sorted.length > 0
      ? sorted.map((tx) => [
          formatDateBR(tx.date),
          tx.description,
          tx.category,
          tx.requester,
          tx.receipt ? 'Anexado' : tx.type === 'OUT' ? 'Pendente' : 'N/A',
          getReimbursementLabel(tx),
          `${tx.type === 'OUT' ? '-' : '+'} ${formatCurrency(tx.amount)}`,
        ])
      : [
          [
            '-',
            'Nenhuma movimentação registrada neste período.',
            '-',
            '-',
            '-',
            '-',
            'R$ 0,00',
          ],
        ];

  autoTable(doc, {
    startY: tableTitleY + 3,
    margin: { left: margin, right: margin },
    head: [
      [
        'Data',
        'Descrição / Estabelecimento',
        'Categoria',
        'Solicitante',
        'Anexo',
        'Reembolso',
        'Valor (R$)',
      ],
    ],
    body: rows,
    styles: {
      font: 'helvetica',
      fontSize: 7.8,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [0, 61, 122],
      fontStyle: 'bold',
      lineColor: [203, 213, 225],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 19 },
      1: { cellWidth: 48 },
      2: { cellWidth: 27 },
      3: { cellWidth: 25 },
      4: { cellWidth: 17, halign: 'center' },
      5: { cellWidth: 23 },
      6: { cellWidth: 23, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (
        data.section === 'body' &&
        data.column.index === 6 &&
        sorted[data.row.index]
      ) {
        const tx = sorted[data.row.index];
        data.cell.styles.textColor =
          tx.type === 'OUT' ? [190, 18, 60] : [4, 120, 87];
      }
    },
  });

  // Signatures block after table
  const finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY || tableTitleY + 24;

  const pageHeight = doc.internal.pageSize.getHeight();
  let sigY = finalY + 24;
  if (sigY + 18 > pageHeight - 12) {
    doc.addPage();
    sigY = 34;
  }

  const sigWidth = 64;
  const leftSigX = margin + 12;
  const rightSigX = pageWidth - margin - 12 - sigWidth;

  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.35);
  doc.line(leftSigX, sigY, leftSigX + sigWidth, sigY);
  doc.line(rightSigX, sigY, rightSigX + sigWidth, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(closingResponsible, leftSigX + sigWidth / 2, sigY + 4.5, {
    align: 'center',
  });
  doc.text('Aprovação Financeira', rightSigX + sigWidth / 2, sigY + 4.5, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Responsável pelo Fundo Fixo', leftSigX + sigWidth / 2, sigY + 8.5, {
    align: 'center',
  });
  doc.text(
    'Departamento de Controladoria',
    rightSigX + sigWidth / 2,
    sigY + 8.5,
    { align: 'center' }
  );

  const periodSuffix = selectedMonth || 'todos_periodos';
  doc.save(`fechamento_fundo_fixo_acb_${periodSuffix}.pdf`);
}

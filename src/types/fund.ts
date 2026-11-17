export type TransactionType = 'OUT' | 'IN';

export type ReimbursementStatus =
  | 'UNREVIEWED'
  | 'NOT_APPLICABLE'
  | 'PENDING'
  | 'PAID';

export interface ReceiptAttachment {
  name: string;
  type: 'image' | 'pdf';
  data: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  requester: string;
  reimbursementStatus: ReimbursementStatus;
  receipt: ReceiptAttachment | null;
}

export interface FundData {
  fundLimit: number;
  fundComplement: number;
  transactions: Transaction[];
}

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Copa',
  'Transporte/Combustível',
  'Material de Escritório',
  'Manutenção/Serviços',
  'Correios/Logística',
  'Fundo Complementar',
  'Outros',
] as const;

export const ALL_FILTER_CATEGORIES = [
  ...EXPENSE_CATEGORIES.slice(0, 6),
  'Aporte/Reembolso',
  'Fundo Complementar',
  'Outros',
] as const;

export const REIMBURSEMENT_LABELS: Record<ReimbursementStatus, string> = {
  UNREVIEWED: 'Não verificado',
  NOT_APPLICABLE: 'Não se aplica',
  PENDING: 'A reembolsar',
  PAID: 'Reembolsado',
};

export function getEffectiveReimbursementStatus(
  tx: Transaction
): ReimbursementStatus {
  if (tx.type !== 'OUT') return 'NOT_APPLICABLE';
  if (tx.reimbursementStatus && tx.reimbursementStatus in REIMBURSEMENT_LABELS) {
    return tx.reimbursementStatus;
  }
  return 'UNREVIEWED';
}

export function getReimbursementLabel(tx: Transaction): string {
  return tx.type === 'OUT'
    ? REIMBURSEMENT_LABELS[getEffectiveReimbursementStatus(tx)]
    : 'Não se aplica';
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export function formatMonthLabel(monthKey: string): string {
  if (!monthKey) return 'Todos os períodos';
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) return monthKey;
  const date = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

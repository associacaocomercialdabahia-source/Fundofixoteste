import React from 'react';
import { FileDown, Printer, X } from 'lucide-react';
import {
  Transaction,
  formatCurrency,
  formatDateBR,
  formatMonthLabel,
  getReimbursementLabel,
} from '../types/fund';

interface PrintReportModalProps {
  isOpen: boolean;
  selectedMonth: string;
  closingDate: string;
  closingResponsible: string;
  onClosingDateChange: (value: string) => void;
  onClosingResponsibleChange: (value: string) => void;
  totalCeiling: number;
  totalInflows: number;
  totalOutflows: number;
  finalBalance: number;
  reimbursedPaid: number;
  reimbursedPending: number;
  transactions: Transaction[];
  onClose: () => void;
  onDownloadPdf: () => void;
  onBrowserPrint: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  selectedMonth,
  closingDate,
  closingResponsible,
  onClosingDateChange,
  onClosingResponsibleChange,
  totalCeiling,
  totalInflows,
  totalOutflows,
  finalBalance,
  reimbursedPaid,
  reimbursedPending,
  transactions,
  onClose,
  onDownloadPdf,
  onBrowserPrint,
}) => {
  if (!isOpen) return null;

  const sorted = [...transactions].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const handleDownloadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDownloadPdf();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="printModalTitle"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h3
            id="printModalTitle"
            className="font-semibold text-slate-900 text-base flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-indigo-700" />
            <span>Fechamento e prestação de contas</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleDownloadSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="closingDateInput"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Data de fechamento do fundo fixo
              </label>
              <input
                id="closingDateInput"
                type="date"
                required
                value={closingDate}
                onChange={(e) => onClosingDateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label
                htmlFor="closingResponsibleInput"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Nome do responsável / Tesoureiro
              </label>
              <input
                id="closingResponsibleInput"
                type="text"
                value={closingResponsible}
                onChange={(e) => onClosingResponsibleChange(e.target.value)}
                placeholder="Ex: Maria Souza - Tesouraria ACB"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Live A4 Sheet Preview */}
          <div className="border border-slate-300 rounded-lg bg-slate-100 p-4 overflow-x-auto">
            <div className="bg-white border border-slate-200 rounded p-5 min-w-[640px] text-slate-900 space-y-4 shadow-xs">
              <div className="flex justify-between items-center border-b-2 border-[#003D7A] pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/aistudio/Marcas-07_68a5121c.jpg"
                    alt="Associação Comercial da Bahia"
                    referrerPolicy="no-referrer"
                    className="h-12 w-auto object-contain shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#003D7A]">
                      RELATÓRIO DE PRESTAÇÃO DE CONTAS - FUNDO FIXO (ACB)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Mês de referência:{' '}
                      <strong>{formatMonthLabel(selectedMonth)}</strong> |
                      Fechamento: <strong>{formatDateBR(closingDate)}</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 shrink-0">
                  <p>Associação Comercial da Bahia</p>
                  <p>
                    Emissão: {formatDateBR(new Date().toISOString().slice(0, 10))}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="border border-slate-200 p-2 rounded bg-slate-50">
                  <span className="text-[10px] text-slate-500 block">
                    Teto operacional
                  </span>
                  <strong className="font-mono tabular-nums text-slate-900">
                    {formatCurrency(totalCeiling)}
                  </strong>
                </div>
                <div className="border border-slate-200 p-2 rounded bg-slate-50">
                  <span className="text-[10px] text-slate-500 block">
                    Entradas / Aportes
                  </span>
                  <strong className="font-mono tabular-nums text-emerald-700">
                    {formatCurrency(totalInflows)}
                  </strong>
                </div>
                <div className="border border-slate-200 p-2 rounded bg-slate-50">
                  <span className="text-[10px] text-slate-500 block">
                    Despesas realizadas
                  </span>
                  <strong className="font-mono tabular-nums text-rose-700">
                    {formatCurrency(totalOutflows)}
                  </strong>
                </div>
                <div className="border border-slate-200 p-2 rounded bg-slate-50">
                  <span className="text-[10px] text-slate-500 block">
                    Saldo disponível
                  </span>
                  <strong className="font-mono tabular-nums text-indigo-800">
                    {formatCurrency(finalBalance)}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="border border-emerald-200 p-2 rounded bg-emerald-50/70 flex justify-between">
                  <span className="text-emerald-900">
                    Reembolsado aos funcionários
                  </span>
                  <strong className="font-mono tabular-nums text-emerald-800">
                    {formatCurrency(reimbursedPaid)}
                  </strong>
                </div>
                <div className="border border-amber-200 p-2 rounded bg-amber-50/70 flex justify-between">
                  <span className="text-amber-900">
                    A reembolsar aos funcionários
                  </span>
                  <strong className="font-mono tabular-nums text-amber-800">
                    {formatCurrency(reimbursedPending)}
                  </strong>
                </div>
              </div>

              <table className="w-full border-collapse text-[11px] text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                    <th className="p-1.5 border border-slate-200">Data</th>
                    <th className="p-1.5 border border-slate-200">Descrição</th>
                    <th className="p-1.5 border border-slate-200">Categoria</th>
                    <th className="p-1.5 border border-slate-200">Solicitante</th>
                    <th className="p-1.5 border border-slate-200 text-center">
                      Anexo
                    </th>
                    <th className="p-1.5 border border-slate-200">Reembolso</th>
                    <th className="p-1.5 border border-slate-200 text-right">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-3 border border-slate-200 text-center text-slate-500"
                      >
                        Nenhuma movimentação registrada neste período.
                      </td>
                    </tr>
                  ) : (
                    sorted.map((tx) => (
                      <tr key={tx.id}>
                        <td className="p-1.5 border border-slate-200 font-mono tabular-nums whitespace-nowrap">
                          {formatDateBR(tx.date)}
                        </td>
                        <td className="p-1.5 border border-slate-200">
                          {tx.description}
                        </td>
                        <td className="p-1.5 border border-slate-200">
                          {tx.category}
                        </td>
                        <td className="p-1.5 border border-slate-200">
                          {tx.requester}
                        </td>
                        <td className="p-1.5 border border-slate-200 text-center">
                          {tx.receipt
                            ? 'Anexado'
                            : tx.type === 'OUT'
                            ? 'Pendente'
                            : 'N/A'}
                        </td>
                        <td className="p-1.5 border border-slate-200">
                          {getReimbursementLabel(tx)}
                        </td>
                        <td
                          className={`p-1.5 border border-slate-200 text-right font-mono tabular-nums font-semibold whitespace-nowrap ${
                            tx.type === 'OUT'
                              ? 'text-rose-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {tx.type === 'OUT' ? '-' : '+'}{' '}
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="pt-6 flex justify-around text-center text-[11px]">
                <div className="w-52 border-t border-slate-500 pt-1.5">
                  <strong>
                    {closingResponsible.trim() || 'Responsável pelo Fundo Fixo'}
                  </strong>
                  <div className="text-slate-500">
                    Responsável pelo Fundo Fixo
                  </div>
                </div>
                <div className="w-52 border-t border-slate-500 pt-1.5">
                  <strong>Aprovação Financeira</strong>
                  <div className="text-slate-500">
                    Departamento de Controladoria
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onBrowserPrint}
              className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-sm font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Baixar PDF</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

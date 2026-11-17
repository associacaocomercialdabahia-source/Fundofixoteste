import React from 'react';
import {
  Transaction,
  formatCurrency,
  formatDateBR,
  formatMonthLabel,
  getReimbursementLabel,
} from '../types/fund';

interface PrintableReportProps {
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

export const PrintableReport: React.FC<PrintableReportProps> = ({
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
}) => {
  const sorted = [...transactions].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <div id="printableReport" aria-hidden="true">
      <div className="font-sans text-slate-900 p-4 leading-snug">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-[#003D7A] pb-3 mb-5 gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/Marcas-07_68a5121c.jpg"
              alt="Associação Comercial da Bahia"
              referrerPolicy="no-referrer"
              className="h-14 w-auto object-contain shrink-0"
            />
            <div>
              <h1 className="text-lg font-bold text-[#003D7A] m-0">
                RELATÓRIO DE PRESTAÇÃO DE CONTAS — FUNDO FIXO (ACB)
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Mês de Referência:{' '}
                <strong>{formatMonthLabel(selectedMonth)}</strong> | Data do
                Fechamento: <strong>{formatDateBR(closingDate)}</strong>
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 shrink-0">
            <p>Associação Comercial da Bahia</p>
            <p>Emissão: {formatDateBR(new Date().toISOString().slice(0, 10))}</p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-4 gap-2.5 mb-4">
          <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
            <span className="text-[10px] uppercase text-slate-500 font-bold block">
              Teto Operacional
            </span>
            <strong className="text-sm text-slate-900 font-mono tabular-nums">
              {formatCurrency(totalCeiling)}
            </strong>
          </div>
          <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
            <span className="text-[10px] uppercase text-slate-500 font-bold block">
              Entradas / Aportes
            </span>
            <strong className="text-sm text-emerald-700 font-mono tabular-nums">
              {formatCurrency(totalInflows)}
            </strong>
          </div>
          <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
            <span className="text-[10px] uppercase text-slate-500 font-bold block">
              Despesas Realizadas
            </span>
            <strong className="text-sm text-rose-700 font-mono tabular-nums">
              {formatCurrency(totalOutflows)}
            </strong>
          </div>
          <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
            <span className="text-[10px] uppercase text-slate-500 font-bold block">
              Saldo (Teto − Despesas)
            </span>
            <strong className="text-sm text-indigo-800 font-mono tabular-nums">
              {formatCurrency(finalBalance)}
            </strong>
          </div>
        </div>

        {/* Reimbursements Summary */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="border border-emerald-300 p-2.5 rounded bg-emerald-50">
            <span className="text-[10px] uppercase text-emerald-900 font-bold block">
              Reembolsado aos Funcionários
            </span>
            <strong className="text-sm text-emerald-800 font-mono tabular-nums">
              {formatCurrency(reimbursedPaid)}
            </strong>
          </div>
          <div className="border border-amber-300 p-2.5 rounded bg-amber-50">
            <span className="text-[10px] uppercase text-amber-900 font-bold block">
              Pendente de Reembolso aos Funcionários
            </span>
            <strong className="text-sm text-amber-800 font-mono tabular-nums">
              {formatCurrency(reimbursedPending)}
            </strong>
          </div>
        </div>

        {/* Table */}
        <h3 className="text-xs font-bold uppercase text-slate-700 mb-2">
          Detalhamento das Movimentações
        </h3>
        <table className="w-full border-collapse text-[11px] text-left mb-8">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300">
              <th className="p-2 border border-slate-300 w-[11%]">Data</th>
              <th className="p-2 border border-slate-300 w-[26%]">
                Descrição / Estabelecimento
              </th>
              <th className="p-2 border border-slate-300 w-[15%]">Categoria</th>
              <th className="p-2 border border-slate-300 w-[14%]">
                Solicitante
              </th>
              <th className="p-2 border border-slate-300 text-center w-[10%]">
                Anexo
              </th>
              <th className="p-2 border border-slate-300 w-[12%]">Reembolso</th>
              <th className="p-2 border border-slate-300 text-right w-[12%]">
                Valor (R$)
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-4 border border-slate-300 text-center text-slate-500"
                >
                  Nenhuma movimentação registrada neste período.
                </td>
              </tr>
            ) : (
              sorted.map((tx) => (
                <tr key={tx.id}>
                  <td className="p-1.5 border border-slate-300 font-mono tabular-nums">
                    {formatDateBR(tx.date)}
                  </td>
                  <td className="p-1.5 border border-slate-300">
                    {tx.description}
                  </td>
                  <td className="p-1.5 border border-slate-300">
                    {tx.category}
                  </td>
                  <td className="p-1.5 border border-slate-300">
                    {tx.requester}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center">
                    {tx.receipt
                      ? 'Anexado'
                      : tx.type === 'OUT'
                      ? 'Pendente'
                      : 'N/A'}
                  </td>
                  <td className="p-1.5 border border-slate-300">
                    {getReimbursementLabel(tx)}
                  </td>
                  <td
                    className={`p-1.5 border border-slate-300 text-right font-bold font-mono tabular-nums ${
                      tx.type === 'OUT' ? 'text-rose-700' : 'text-emerald-700'
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

        {/* Signatures */}
        <div className="mt-14 flex justify-around text-center text-xs">
          <div className="w-56 border-t border-slate-600 pt-2">
            <strong>{closingResponsible}</strong>
            <br />
            <span className="text-slate-600">Responsável pelo Fundo Fixo</span>
          </div>
          <div className="w-56 border-t border-slate-600 pt-2">
            <strong>Aprovação Financeira</strong>
            <br />
            <span className="text-slate-600">
              Departamento de Controladoria
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

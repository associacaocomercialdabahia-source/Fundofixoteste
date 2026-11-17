import React from 'react';
import { formatCurrency } from '../types/fund';

interface KpiGridProps {
  currentBalance: number;
  totalCeiling: number;
  reimbursedPaid: number;
  reimbursedPending: number;
  totalOutflows: number;
  pendingReceiptsCount: number;
  usagePercent: number;
}

export const KpiGrid: React.FC<KpiGridProps> = ({
  currentBalance,
  totalCeiling,
  reimbursedPaid,
  reimbursedPending,
  totalOutflows,
  pendingReceiptsCount,
  usagePercent,
}) => {
  const isNegative = currentBalance < 0;
  const isHighUsage = usagePercent >= 85;

  return (
    <section
      aria-label="Indicadores do mês"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* Saldo Disponível */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Saldo disponível
          </span>
          <span
            className={`text-xs font-medium ${
              isNegative ? 'text-rose-700' : 'text-indigo-700'
            }`}
          >
            {isNegative ? 'Excedido' : 'Regular'}
          </span>
        </div>
        <div>
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight ${
              isNegative ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {formatCurrency(currentBalance)}
          </div>
          <p className="text-xs text-slate-500 mt-1.5 font-mono tabular-nums">
            Teto total: {formatCurrency(totalCeiling)}
          </p>
        </div>
      </div>

      {/* Reembolsado aos Funcionários */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Reembolsado aos funcionários
          </span>
          <span className="text-xs font-medium text-emerald-700">Quitado</span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight text-emerald-700">
            {formatCurrency(reimbursedPaid)}
          </div>
          <p className="text-xs text-amber-700 mt-1.5 font-medium font-mono tabular-nums">
            A reembolsar: {formatCurrency(reimbursedPending)}
          </p>
        </div>
      </div>

      {/* Total Despesas */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Total de despesas
          </span>
          <span className="text-xs font-medium text-rose-700">Saídas</span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight text-rose-600">
            {formatCurrency(totalOutflows)}
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            {pendingReceiptsCount === 0
              ? 'Todos os comprovantes anexados'
              : `${pendingReceiptsCount} comprovante(s) pendente(s)`}
          </p>
        </div>
      </div>

      {/* Uso do Fundo Total */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Utilização do teto total
          </span>
          <span
            className={`text-xs font-medium ${
              isHighUsage ? 'text-amber-700' : 'text-slate-600'
            }`}
          >
            {isHighUsage ? 'Atenção' : 'Dentro do limite'}
          </span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
            {usagePercent.toFixed(1)}%
          </div>
          <div
            className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(usagePercent)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isHighUsage ? 'bg-amber-600' : 'bg-indigo-700'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, usagePercent))}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

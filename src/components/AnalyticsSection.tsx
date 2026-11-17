import React, { useMemo, useState } from 'react';
import { Transaction, formatCurrency } from '../types/fund';

interface AnalyticsSectionProps {
  monthTransactions: Transaction[];
  fundLimit: number;
  fundComplement: number;
  reimbursedPaid: number;
  reimbursedPending: number;
}

const CHART_COLORS = [
  '#3730a3', // indigo-800
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#e11d48', // rose-600
  '#0284c7', // sky-600
  '#7c3aed', // violet-600
  '#475569', // slate-600
  '#0d9488', // teal-600
];

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  monthTransactions,
  fundLimit,
  fundComplement,
  reimbursedPaid,
  reimbursedPending,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    let grandTotal = 0;
    monthTransactions
      .filter((t) => t.type === 'OUT')
      .forEach((t) => {
        const cat = t.category || 'Outros';
        totals[cat] = (totals[cat] || 0) + (t.amount || 0);
        grandTotal += t.amount || 0;
      });

    const entries = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount], index) => ({
        category,
        amount,
        percent: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));

    return { entries, grandTotal };
  }, [monthTransactions]);

  // SVG Donut math
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  const totalCeiling = fundLimit + fundComplement;
  const reimbursementSum = reimbursedPaid + reimbursedPending;
  const paidWidth =
    reimbursementSum > 0 ? (reimbursedPaid / reimbursementSum) * 100 : 0;
  const pendingWidth =
    reimbursementSum > 0 ? (reimbursedPending / reimbursementSum) * 100 : 0;

  const activeEntry = hoveredCategory
    ? categoryBreakdown.entries.find((e) => e.category === hoveredCategory)
    : null;

  return (
    <section
      id="reembolsos-analise"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
    >
      {/* Left: Despesas por Categoria (Interactive SVG Donut) */}
      <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Despesas por categoria
          </h2>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {categoryBreakdown.entries.length} grupo(s)
          </span>
        </div>

        {categoryBreakdown.entries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-medium text-slate-600">
              Sem despesas no período
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Lance uma saída para visualizar a distribuição por categoria.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="relative flex items-center justify-center py-2">
              <svg
                width="156"
                height="156"
                viewBox="0 0 156 156"
                role="img"
                aria-label="Distribuição de despesas por categoria"
              >
                <circle
                  cx="78"
                  cy="78"
                  r={radius}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="18"
                />
                {categoryBreakdown.entries.map((entry) => {
                  const dashLength =
                    (entry.percent / 100) * circumference;
                  const dashArray = `${dashLength} ${circumference - dashLength}`;
                  const dashOffset = -cumulativeOffset;
                  cumulativeOffset += dashLength;
                  const isDimmed =
                    hoveredCategory !== null &&
                    hoveredCategory !== entry.category;

                  return (
                    <circle
                      key={entry.category}
                      cx="78"
                      cy="78"
                      r={radius}
                      fill="none"
                      stroke={entry.color}
                      strokeWidth={hoveredCategory === entry.category ? 21 : 18}
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      transform="rotate(-90 78 78)"
                      className="transition-all duration-150 cursor-pointer"
                      style={{ opacity: isDimmed ? 0.35 : 1 }}
                      onMouseEnter={() => setHoveredCategory(entry.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6 text-center">
                <span className="text-[11px] font-medium text-slate-500 truncate max-w-[90px]">
                  {activeEntry ? activeEntry.category : 'Total saídas'}
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                  {formatCurrency(
                    activeEntry
                      ? activeEntry.amount
                      : categoryBreakdown.grandTotal
                  )}
                </span>
              </div>
            </div>

            <ul className="space-y-2 border-t border-slate-100 pt-3">
              {categoryBreakdown.entries.map((entry) => (
                <li
                  key={entry.category}
                  onMouseEnter={() => setHoveredCategory(entry.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="flex items-center justify-between gap-2 text-xs py-0.5 rounded hover:bg-slate-50 px-1.5 transition-colors cursor-default"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: entry.color }}
                      aria-hidden="true"
                    />
                    <span className="text-slate-700 truncate">
                      {entry.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                    <span className="text-slate-400">
                      {entry.percent.toFixed(0)}%
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right: Resumo de Fundo & Suplementação + Reembolsos aos Funcionários */}
      <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Composição do teto e suplementação
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-slate-100 py-4">
            <div>
              <span className="text-xs text-slate-500 block">
                Teto fixo regular
              </span>
              <strong className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5 block">
                {formatCurrency(fundLimit)}
              </strong>
            </div>
            <div>
              <span className="text-xs text-amber-700 block font-medium">
                Fundo complementar
              </span>
              <strong className="text-lg font-bold text-amber-800 font-mono tabular-nums mt-0.5 block">
                {formatCurrency(fundComplement)}
              </strong>
            </div>
            <div>
              <span className="text-xs text-indigo-700 block font-medium">
                Teto operacional total
              </span>
              <strong className="text-lg font-bold text-indigo-800 font-mono tabular-nums mt-0.5 block">
                {formatCurrency(totalCeiling)}
              </strong>
            </div>
          </div>
        </div>

        {/* Reembolsos aos Funcionários */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Reembolsos aos funcionários
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Valores integrais das despesas do mês conforme situação de devolução ao colaborador.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-600">
              Total envolvido: {formatCurrency(reimbursementSum)}
            </span>
          </div>

          {reimbursementSum === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg py-5 px-4 text-center text-xs text-slate-500 mt-3">
              Nenhum reembolso pago ou pendente neste período.
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="w-full h-6 bg-slate-100 rounded-md overflow-hidden flex">
                {paidWidth > 0 && (
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${paidWidth}%` }}
                    title={`Reembolsado: ${formatCurrency(reimbursedPaid)}`}
                  />
                )}
                {pendingWidth > 0 && (
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${pendingWidth}%` }}
                    title={`A reembolsar: ${formatCurrency(reimbursedPending)}`}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between py-2 px-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <span className="font-medium text-emerald-900">
                    Reembolsado ao colaborador
                  </span>
                  <span className="font-bold text-emerald-800 font-mono tabular-nums">
                    {formatCurrency(reimbursedPaid)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                  <span className="font-medium text-amber-900">
                    Pendente de reembolso
                  </span>
                  <span className="font-bold text-amber-800 font-mono tabular-nums">
                    {formatCurrency(reimbursedPending)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Guidance Note */}
        <div className="border-t border-slate-100 pt-3 text-xs text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-800">
            Orientação operacional:
          </span>{' '}
          Selecione o mês de referência na barra superior para auditar comprovantes do período. Em demandas extraordinárias da diretoria ou eventos, ajuste o Fundo Complementar para ampliar a margem temporária do caixa.
        </div>
      </div>
    </section>
  );
};

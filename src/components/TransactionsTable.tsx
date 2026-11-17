import React from 'react';
import {
  AlertCircle,
  Download,
  Edit3,
  FileCheck,
  Printer,
  Search,
  Trash2,
} from 'lucide-react';
import {
  ALL_FILTER_CATEGORIES,
  REIMBURSEMENT_LABELS,
  ReimbursementStatus,
  Transaction,
  formatCurrency,
  formatDateBR,
  getEffectiveReimbursementStatus,
} from '../types/fund';

interface TransactionsTableProps {
  transactions: Transaction[];
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: 'ALL' | 'OUT' | 'IN';
  onTypeFilterChange: (value: 'ALL' | 'OUT' | 'IN') => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  onClearFilters: () => void;
  onNewTransaction: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onViewReceipt: (tx: Transaction) => void;
  onUpdateReimbursement: (id: string, status: ReimbursementStatus) => void;
  onOpenPrintModal: () => void;
  onExportCSV: () => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onClearFilters,
  onNewTransaction,
  onEdit,
  onDelete,
  onViewReceipt,
  onUpdateReimbursement,
  onOpenPrintModal,
  onExportCSV,
}) => {
  const hasActiveFilters =
    search.trim() !== '' || typeFilter !== 'ALL' || categoryFilter !== 'ALL';

  const sorted = [...transactions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <section
      id="movimentacoes"
      className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col"
    >
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-base font-semibold text-slate-900">
            Histórico de movimentações
          </h2>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {sorted.length} registro(s)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Type Filter */}
          <div
            role="group"
            aria-label="Filtrar por tipo de operação"
            className="flex items-center p-1 bg-slate-100 rounded-lg"
          >
            {(
              [
                { value: 'ALL', label: 'Todos' },
                { value: 'OUT', label: 'Saídas' },
                { value: 'IN', label: 'Entradas' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onTypeFilterChange(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  typeFilter === opt.value
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:flex-initial sm:w-52">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar descrição ou solicitante..."
              aria-label="Buscar movimentações"
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            aria-label="Filtrar por categoria"
            className="text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="ALL">Todas as categorias</option>
            {ALL_FILTER_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Secondary Utility Actions */}
          <button
            type="button"
            onClick={onOpenPrintModal}
            className="text-xs bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir fechamento</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="text-xs bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-medium text-slate-700">
            Nenhuma movimentação encontrada neste recorte
          </p>
          <p className="text-xs text-slate-500 max-w-md">
            {hasActiveFilters
              ? 'Ajuste ou limpe os filtros de pesquisa para visualizar os lançamentos deste mês.'
              : 'Cadastre uma despesa ou aporte de reposição para iniciar a prestação de contas deste mês.'}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Limpar filtros
              </button>
            ) : (
              <button
                type="button"
                onClick={onNewTransaction}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors cursor-pointer"
              >
                Registrar primeiro lançamento
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium text-xs border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Data</th>
                <th className="py-3 px-4">Descrição / Fornecedor</th>
                <th className="py-3 px-4 whitespace-nowrap">Categoria</th>
                <th className="py-3 px-4 whitespace-nowrap">Responsável</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  Valor (R$)
                </th>
                <th className="py-3 px-4 text-center whitespace-nowrap">
                  Comprovante
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  Reembolso & Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((tx) => {
                const isOut = tx.type === 'OUT';
                const status = getEffectiveReimbursementStatus(tx);

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono tabular-nums text-xs">
                      {formatDateBR(tx.date)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 min-w-[220px]">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-xs">
                      {tx.category}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-xs">
                      {tx.requester}
                    </td>
                    <td
                      className={`py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums font-semibold ${
                        isOut ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {isOut ? '−' : '+'} {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {tx.receipt ? (
                        <button
                          type="button"
                          onClick={() => onViewReceipt(tx)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200 cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Ver nota</span>
                        </button>
                      ) : isOut ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Pendente</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {isOut && (
                          <select
                            aria-label={`Reembolso ao funcionário: ${tx.description}`}
                            value={status}
                            onChange={(e) =>
                              onUpdateReimbursement(
                                tx.id,
                                e.target.value as ReimbursementStatus
                              )
                            }
                            className={`w-34 px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                              status === 'PENDING'
                                ? 'border-amber-300 bg-amber-50 text-amber-900 font-medium'
                                : status === 'PAID'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-medium'
                                : 'border-slate-300 bg-white text-slate-600'
                            }`}
                          >
                            {Object.entries(REIMBURSEMENT_LABELS).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              )
                            )}
                          </select>
                        )}
                        <button
                          type="button"
                          onClick={() => onEdit(tx)}
                          className="text-slate-500 hover:text-indigo-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Editar movimentação"
                          aria-label={`Editar ${tx.description}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(tx.id)}
                          className="text-slate-500 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir movimentação"
                          aria-label={`Excluir ${tx.description}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

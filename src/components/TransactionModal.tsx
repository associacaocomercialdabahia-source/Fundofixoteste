import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Check, Paperclip, X } from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  REIMBURSEMENT_LABELS,
  ReceiptAttachment,
  ReimbursementStatus,
  Transaction,
  TransactionType,
} from '../types/fund';

interface TransactionModalProps {
  isOpen: boolean;
  editingTransaction: Transaction | null;
  onClose: () => void;
  onSave: (
    payload: Omit<Transaction, 'id'> & { id?: string }
  ) => Promise<boolean>;
  onError: (message: string) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  editingTransaction,
  onClose,
  onSave,
  onError,
}) => {
  const [type, setType] = useState<TransactionType>('OUT');
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Alimentação');
  const [requester, setRequester] = useState<string>('');
  const [reimbursementStatus, setReimbursementStatus] =
    useState<ReimbursementStatus>('UNREVIEWED');
  const [receipt, setReceipt] = useState<ReceiptAttachment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setAmount(String(editingTransaction.amount));
      setDescription(editingTransaction.description);
      setCategory(
        editingTransaction.type === 'IN'
          ? 'Aporte/Reembolso'
          : editingTransaction.category
      );
      setRequester(editingTransaction.requester);
      setReimbursementStatus(
        editingTransaction.type === 'OUT'
          ? editingTransaction.reimbursementStatus || 'UNREVIEWED'
          : 'NOT_APPLICABLE'
      );
      setReceipt(editingTransaction.receipt || null);
    } else {
      setType('OUT');
      setDate(new Date().toISOString().slice(0, 10));
      setAmount('');
      setDescription('');
      setCategory('Alimentação');
      setRequester('');
      setReimbursementStatus('UNREVIEWED');
      setReceipt(null);
    }
  }, [isOpen, editingTransaction]);

  if (!isOpen) return null;

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    if (nextType === 'IN') {
      setCategory('Aporte/Reembolso');
      setReimbursementStatus('NOT_APPLICABLE');
    } else {
      if (category === 'Aporte/Reembolso') {
        setCategory('Alimentação');
      }
      if (reimbursementStatus === 'NOT_APPLICABLE' && !editingTransaction) {
        setReimbursementStatus('UNREVIEWED');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onError('O arquivo excede o tamanho máximo permitido de 5MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;
      setReceipt({
        name: file.name,
        type: file.type === 'application/pdf' ? 'pdf' : 'image',
        data: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      onError('Informe um valor válido maior que zero.');
      return;
    }

    setSubmitting(true);
    try {
      const ok = await onSave({
        id: editingTransaction?.id,
        date,
        type,
        amount: numericAmount,
        description: description.trim(),
        category: type === 'IN' ? 'Aporte/Reembolso' : category,
        requester: requester.trim(),
        reimbursementStatus:
          type === 'OUT' ? reimbursementStatus : 'NOT_APPLICABLE',
        receipt,
      });
      if (ok) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transactionModalTitle"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3
            id="transactionModalTitle"
            className="font-semibold text-slate-900 text-base"
          >
            {editingTransaction ? 'Editar movimentação' : 'Nova movimentação'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo de Operação */}
          <div>
            <span className="block text-xs font-medium text-slate-700 mb-2">
              Tipo de operação
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('OUT')}
                className={`flex items-center justify-center gap-2 p-2.5 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  type === 'OUT'
                    ? 'border-rose-600 bg-rose-50 text-rose-800'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                <span>Saída (Despesa)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('IN')}
                className={`flex items-center justify-center gap-2 p-2.5 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  type === 'IN'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                <span>Entrada (Aporte)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="txDate"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Data *
              </label>
              <input
                id="txDate"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label
                htmlFor="txAmount"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Valor (R$) *
              </label>
              <input
                id="txAmount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="txDescription"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Descrição / Estabelecimento *
            </label>
            <input
              id="txDescription"
              type="text"
              required
              placeholder="Ex: Café da copa, Correios Sedex, Papelaria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="txCategory"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Categoria *
              </label>
              <select
                id="txCategory"
                disabled={type === 'IN'}
                value={type === 'IN' ? 'Aporte/Reembolso' : category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {type === 'IN' ? (
                  <option value="Aporte/Reembolso">Aporte/Reembolso</option>
                ) : (
                  EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="txRequester"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Solicitante / Beneficiário *
              </label>
              <input
                id="txRequester"
                type="text"
                required
                placeholder="Ex: Carlos Eduardo"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {type === 'OUT' && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label
                  htmlFor="txReimbursement"
                  className="text-xs font-medium text-slate-800"
                >
                  Reembolso ao funcionário
                </label>
                <select
                  id="txReimbursement"
                  value={reimbursementStatus}
                  onChange={(e) =>
                    setReimbursementStatus(
                      e.target.value as ReimbursementStatus
                    )
                  }
                  className="sm:w-48 px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {Object.entries(REIMBURSEMENT_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-500">
                Se o colaborador pagou com recursos próprios, selecione &ldquo;A reembolsar&rdquo; ou &ldquo;Reembolsado&rdquo;.
              </p>
            </div>
          )}

          {/* Receipt Upload */}
          <div>
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Anexar Nota Fiscal / Comprovante
            </span>
            {!receipt ? (
              <label className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1">
                <Paperclip className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-medium text-indigo-700">
                  Clique para selecionar imagem ou PDF
                </span>
                <span className="text-[11px] text-slate-400">
                  JPG, PNG ou PDF (máx. 5MB)
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 px-3 py-2.5 rounded-lg text-xs text-indigo-900">
                <span className="truncate font-medium max-w-[260px]">
                  {receipt.name}
                </span>
                <button
                  type="button"
                  onClick={() => setReceipt(null)}
                  className="text-rose-600 hover:text-rose-800 font-semibold ml-3 cursor-pointer"
                >
                  Remover
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

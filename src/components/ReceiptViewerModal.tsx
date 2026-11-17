import React from 'react';
import { Download, FileText, X } from 'lucide-react';
import { Transaction } from '../types/fund';

interface ReceiptViewerModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction || !transaction.receipt) return null;

  const { receipt, description } = transaction;

  return (
    <div
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receiptModalTitle"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <h3
            id="receiptModalTitle"
            className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2 truncate"
          >
            <FileText className="w-4 h-4 text-indigo-700 shrink-0" />
            <span className="truncate">Comprovante: {description}</span>
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={receipt.data}
              download={receipt.name}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar visualizador"
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto flex items-center justify-center bg-slate-50 min-h-[340px]">
          {receipt.type === 'pdf' ? (
            <embed
              src={receipt.data}
              type="application/pdf"
              className="w-full h-[500px] rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            <img
              src={receipt.data}
              alt={`Comprovante fiscal: ${description}`}
              referrerPolicy="no-referrer"
              className="max-h-[520px] w-auto object-contain rounded-lg border border-slate-200 bg-white shadow-xs"
            />
          )}
        </div>
      </div>
    </div>
  );
};

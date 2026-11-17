import React, { useState } from 'react';
import {
  DownloadCloud,
  RotateCcw,
  UploadCloud,
  X,
} from 'lucide-react';
import { FundData } from '../types/fund';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportJSON: () => void;
  onImportJSON: (data: FundData) => Promise<void>;
  onResetDemo: () => Promise<void>;
  onError: (msg: string) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onExportJSON,
  onImportJSON,
  onResetDemo,
  onError,
}) => {
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        if (
          !Array.isArray(parsed.transactions) ||
          !Number.isFinite(parsed.fundLimit) ||
          !Number.isFinite(parsed.fundComplement)
        ) {
          throw new Error('Formato de backup inválido.');
        }
        setBusy(true);
        await onImportJSON(parsed as FundData);
        onClose();
      } catch {
        onError('Erro ao ler o arquivo JSON. Verifique o formato do backup.');
      } finally {
        setBusy(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    setBusy(true);
    try {
      await onResetDemo();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backupModalTitle"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3
            id="backupModalTitle"
            className="font-semibold text-slate-900 text-base"
          >
            Backup e restauração
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

        <div className="p-6 space-y-5">
          {/* Export */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-800">
              Exportar backup completo
            </h4>
            <p className="text-xs text-slate-500">
              Baixe os limites configurados e todo o histórico de movimentações em formato JSON.
            </p>
            <button
              type="button"
              onClick={() => {
                onExportJSON();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Exportar arquivo (.json)</span>
            </button>
          </div>

          <div className="border-t border-slate-100" />

          {/* Import */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-800">
              Importar backup (.json)
            </h4>
            <p className="text-xs text-slate-500">
              Registros com o mesmo ID serão atualizados; os demais lançamentos permanecem preservados.
            </p>
            <label className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5">
              <UploadCloud className="w-6 h-6 text-slate-400" />
              <span className="text-xs font-medium text-indigo-700">
                {busy
                  ? 'Importando dados...'
                  : 'Clique para selecionar o arquivo .json'}
              </span>
              <input
                type="file"
                accept=".json"
                disabled={busy}
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          <div className="border-t border-slate-100" />

          {/* Reset Demo */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-800">
              Ambiente de demonstração
            </h4>
            <p className="text-xs text-slate-500">
              Restaura os lançamentos iniciais de outubro e novembro para testar novamente.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={handleReset}
              className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar dados da demonstração</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

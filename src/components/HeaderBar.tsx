import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface HeaderBarProps {
  onNewTransaction: () => void;
  onOpenPrintModal: () => void;
  onOpenBackupModal: () => void;
  onScrollTo: (sectionId: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onNewTransaction,
  onOpenPrintModal,
  onOpenBackupModal,
  onScrollTo,
}) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Identity with ACB Crest */}
        <a
          href="#visao-geral"
          onClick={(e) => {
            e.preventDefault();
            onScrollTo('visao-geral');
          }}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 text-slate-900 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003D7A] rounded"
        >
          {!logoError ? (
            <img
              src="/assets/aistudio/Marcas-07_68a5121c.jpg"
              alt="Associação Comercial da Bahia"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="h-11 w-auto object-contain shrink-0 bg-white rounded"
            />
          ) : (
            <span className="h-9 px-2.5 rounded bg-[#003D7A] text-white text-xs font-bold flex items-center justify-center shrink-0">
              ACB
            </span>
          )}
          <span className="font-bold text-base tracking-tight text-[#003D7A] font-[var(--font-display)]">
            Fundo Fixo ACB
          </span>
        </a>

        {/* Zone 2: Concise single-line nav links */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => onScrollTo('visao-geral')}
            className="hover:text-[#003D7A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Visão Geral
          </button>
          <button
            type="button"
            onClick={() => onScrollTo('reembolsos-analise')}
            className="hover:text-[#003D7A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Reembolsos
          </button>
          <button
            type="button"
            onClick={() => onScrollTo('movimentacoes')}
            className="hover:text-[#003D7A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Movimentações
          </button>
          <button
            type="button"
            onClick={onOpenPrintModal}
            className="hover:text-[#003D7A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Fechamento
          </button>
          <button
            type="button"
            onClick={onOpenBackupModal}
            className="hover:text-[#003D7A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Backup
          </button>
        </nav>

        {/* Zone 3: 1 Primary CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNewTransaction}
            className="bg-[#003D7A] hover:bg-[#002D5A] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003D7A] focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Movimentação</span>
          </button>
        </div>
      </div>
    </header>
  );
};

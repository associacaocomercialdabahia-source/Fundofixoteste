import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface ReceiptAttachment {
  name: string;
  type: 'image' | 'pdf';
  data: string;
}

interface Transaction {
  id: string;
  date: string;
  type: 'OUT' | 'IN';
  amount: number;
  description: string;
  category: string;
  requester: string;
  reimbursementStatus: 'UNREVIEWED' | 'NOT_APPLICABLE' | 'PENDING' | 'PAID';
  receipt: ReceiptAttachment | null;
}

interface StoredReceipt {
  mimeType: string;
  buffer: Buffer;
}

function buildDemoTransactions(): Transaction[] {
  return [
    {
      id: 'acb-202611-01',
      date: '2026-11-03',
      type: 'IN',
      amount: 2000.0,
      description: 'Reposição Mensal de Caixa — Tesouraria ACB',
      category: 'Aporte/Reembolso',
      requester: 'Controladoria ACB',
      reimbursementStatus: 'NOT_APPLICABLE',
      receipt: {
        name: 'comprovante_aporte_nov2026.svg',
        type: 'image',
        data: '/api/receipts/demo-aporte-nov',
      },
    },
    {
      id: 'acb-202611-02',
      date: '2026-11-04',
      type: 'OUT',
      amount: 148.9,
      description: 'Café em grãos, açúcar e copos descartáveis — Copa Presidência',
      category: 'Copa',
      requester: 'Mariana Costa',
      reimbursementStatus: 'NOT_APPLICABLE',
      receipt: {
        name: 'nfce_supermercado_salvador_4021.svg',
        type: 'image',
        data: '/api/receipts/demo-copa-nov',
      },
    },
    {
      id: 'acb-202611-03',
      date: '2026-11-06',
      type: 'OUT',
      amount: 84.5,
      description: 'Corrida aplicativo — Visita institucional SEBRAE Bahia',
      category: 'Transporte/Combustível',
      requester: 'Carlos Eduardo',
      reimbursementStatus: 'PAID',
      receipt: {
        name: 'recibo_transporte_0611.svg',
        type: 'image',
        data: '/api/receipts/demo-transporte-nov',
      },
    },
    {
      id: 'acb-202611-04',
      date: '2026-11-09',
      type: 'OUT',
      amount: 236.0,
      description: 'Papel A4, pastas catálogo e toners auxiliares',
      category: 'Material de Escritório',
      requester: 'Fernanda Oliveira',
      reimbursementStatus: 'PENDING',
      receipt: {
        name: 'danfe_papelaria_comercio_889.svg',
        type: 'image',
        data: '/api/receipts/demo-papelaria-nov',
      },
    },
    {
      id: 'acb-202611-05',
      date: '2026-11-11',
      type: 'OUT',
      amount: 320.0,
      description: 'Reparo emergencial fechadura Auditório Palácio da Associação',
      category: 'Manutenção/Serviços',
      requester: 'Roberto Nascimento',
      reimbursementStatus: 'NOT_APPLICABLE',
      receipt: {
        name: 'nfse_chaveiro_comercio_112.svg',
        type: 'image',
        data: '/api/receipts/demo-manutencao-nov',
      },
    },
    {
      id: 'acb-202611-06',
      date: '2026-11-13',
      type: 'OUT',
      amount: 112.4,
      description: 'Sedex e envio de convites oficiais — Diretoria Executiva',
      category: 'Correios/Logística',
      requester: 'Luciana Mendes',
      reimbursementStatus: 'PAID',
      receipt: {
        name: 'recibo_correios_agencia_comercio.svg',
        type: 'image',
        data: '/api/receipts/demo-correios-nov',
      },
    },
    {
      id: 'acb-202611-07',
      date: '2026-11-15',
      type: 'OUT',
      amount: 194.8,
      description: 'Coffee break reunião extraordinária Câmara Empresarial',
      category: 'Alimentação',
      requester: 'Carlos Eduardo',
      reimbursementStatus: 'PENDING',
      receipt: null,
    },
    {
      id: 'acb-202611-08',
      date: '2026-11-16',
      type: 'OUT',
      amount: 67.2,
      description: 'Pilhas alcalinas microfones e adaptadores HDMI',
      category: 'Outros',
      requester: 'Roberto Nascimento',
      reimbursementStatus: 'UNREVIEWED',
      receipt: null,
    },
    {
      id: 'acb-202610-01',
      date: '2026-10-02',
      type: 'IN',
      amount: 2000.0,
      description: 'Aporte Inicial Fundo Fixo — Outubro/2026',
      category: 'Aporte/Reembolso',
      requester: 'Controladoria ACB',
      reimbursementStatus: 'NOT_APPLICABLE',
      receipt: {
        name: 'comprovante_aporte_out2026.svg',
        type: 'image',
        data: '/api/receipts/demo-aporte-out',
      },
    },
    {
      id: 'acb-202610-02',
      date: '2026-10-08',
      type: 'OUT',
      amount: 418.0,
      description: 'Lanche e água mineral — Fórum de Desenvolvimento Regional',
      category: 'Alimentação',
      requester: 'Mariana Costa',
      reimbursementStatus: 'PAID',
      receipt: {
        name: 'nf_catering_bahia_out.svg',
        type: 'image',
        data: '/api/receipts/demo-alimentacao-out',
      },
    },
    {
      id: 'acb-202610-03',
      date: '2026-10-14',
      type: 'OUT',
      amount: 195.5,
      description: 'Abastecimento veículo institucional — Agenda FIEB',
      category: 'Transporte/Combustível',
      requester: 'Roberto Nascimento',
      reimbursementStatus: 'NOT_APPLICABLE',
      receipt: {
        name: 'cupom_posto_barra_out.svg',
        type: 'image',
        data: '/api/receipts/demo-combustivel-out',
      },
    },
    {
      id: 'acb-202610-04',
      date: '2026-10-21',
      type: 'OUT',
      amount: 265.0,
      description: 'Manutenção preventiva purificador de água da secretaria',
      category: 'Manutenção/Serviços',
      requester: 'Fernanda Oliveira',
      reimbursementStatus: 'PAID',
      receipt: {
        name: 'os_manutencao_purificador.svg',
        type: 'image',
        data: '/api/receipts/demo-purificador-out',
      },
    },
  ];
}

function renderDemoReceiptSvg(
  title: string,
  emitter: string,
  cnpj: string,
  date: string,
  amount: string,
  docNumber: string
): string {
  const safe = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="620" viewBox="0 0 480 620">
  <rect width="480" height="620" fill="#f8fafc"/>
  <rect x="32" y="24" width="416" height="572" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <rect x="32" y="24" width="416" height="72" rx="8" fill="#312e81"/>
  <rect x="32" y="84" width="416" height="12" fill="#312e81"/>
  <text x="56" y="56" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">COMPROVANTE FISCAL DIGITAL</text>
  <text x="56" y="76" fill="#c7d2fe" font-family="monospace" font-size="11">${safe(docNumber)}</text>
  <text x="56" y="132" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">ESTABELECIMENTO / EMITENTE</text>
  <text x="56" y="152" fill="#0f172a" font-family="sans-serif" font-size="15" font-weight="bold">${safe(emitter)}</text>
  <text x="56" y="172" fill="#475569" font-family="monospace" font-size="12">CNPJ: ${safe(cnpj)}</text>
  <line x1="56" y1="196" x2="424" y2="196" stroke="#e2e8f0" stroke-dasharray="4 4"/>
  <text x="56" y="226" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">DESCRIÇÃO DA DESPESA / LANÇAMENTO</text>
  <text x="56" y="248" fill="#0f172a" font-family="sans-serif" font-size="13">${safe(title)}</text>
  <text x="56" y="294" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">DATA DE EMISSÃO</text>
  <text x="56" y="314" fill="#0f172a" font-family="monospace" font-size="13">${safe(date)}</text>
  <text x="260" y="294" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">PAGAMENTO</text>
  <text x="260" y="314" fill="#0f172a" font-family="sans-serif" font-size="13">Fundo Fixo ACB</text>
  <rect x="56" y="352" width="368" height="76" rx="6" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="76" y="380" fill="#475569" font-family="sans-serif" font-size="11" font-weight="bold">VALOR TOTAL DO DOCUMENTO</text>
  <text x="76" y="410" fill="#0f172a" font-family="monospace" font-size="24" font-weight="bold">${safe(amount)}</text>
  <line x1="56" y1="464" x2="424" y2="464" stroke="#e2e8f0" stroke-dasharray="4 4"/>
  <text x="56" y="492" fill="#64748b" font-family="monospace" font-size="10">CHAVE DE ACESSO (DEMONSTRAÇÃO)</text>
  <text x="56" y="510" fill="#334155" font-family="monospace" font-size="10">2926 1115 4321 9800 0144 6500 1000 0040 2110 8842</text>
  <rect x="56" y="534" width="368" height="36" rx="4" fill="#ecfdf5" stroke="#a7f3d0"/>
  <text x="240" y="556" text-anchor="middle" fill="#065f46" font-family="sans-serif" font-size="11" font-weight="bold">DOCUMENTO CONFERIDO — PRESTAÇÃO DE CONTAS ACB</text>
</svg>`;
}

const DEMO_RECEIPTS: Record<string, { title: string; emitter: string; cnpj: string; date: string; amount: string; docNumber: string }> = {
  'demo-aporte-nov': {
    title: 'Reposição Mensal de Caixa — Fundo Fixo',
    emitter: 'Associação Comercial da Bahia — Tesouraria',
    cnpj: '15.106.473/0001-23',
    date: '03/11/2026',
    amount: 'R$ 2.000,00',
    docNumber: 'RECIBO INTERNO Nº 2026/11-01',
  },
  'demo-copa-nov': {
    title: 'Café em grãos, açúcar e copos descartáveis',
    emitter: 'Atacadão Comércio Salvador Ltda.',
    cnpj: '13.482.910/0001-88',
    date: '04/11/2026',
    amount: 'R$ 148,90',
    docNumber: 'NFC-e Nº 004.021 — Série 001',
  },
  'demo-transporte-nov': {
    title: 'Deslocamento visita institucional SEBRAE Bahia',
    emitter: 'Mobilidade Urbana Digital S.A.',
    cnpj: '17.895.646/0001-87',
    date: '06/11/2026',
    amount: 'R$ 84,50',
    docNumber: 'RECIBO ELETRÔNICO #88412',
  },
  'demo-papelaria-nov': {
    title: 'Papel A4, pastas catálogo e toners auxiliares',
    emitter: 'Papelaria Praça Cairu Ltda.',
    cnpj: '09.224.718/0001-19',
    date: '09/11/2026',
    amount: 'R$ 236,00',
    docNumber: 'DANFE NF-e Nº 000.889',
  },
  'demo-manutencao-nov': {
    title: 'Reparo emergencial fechadura Auditório Principal',
    emitter: 'Chaveiro & Serralheria Bahia ME',
    cnpj: '21.334.502/0001-54',
    date: '11/11/2026',
    amount: 'R$ 320,00',
    docNumber: 'NFS-e Salvador Nº 2026/112',
  },
  'demo-correios-nov': {
    title: 'Postagem Sedex — Convites Oficiais Diretoria',
    emitter: 'ECT — Agência Comércio Salvador',
    cnpj: '34.028.316/0008-94',
    date: '13/11/2026',
    amount: 'R$ 112,40',
    docNumber: 'COMPROVANTE POSTAL Nº 77419',
  },
  'demo-aporte-out': {
    title: 'Aporte Inicial Fundo Fixo — Outubro/2026',
    emitter: 'Associação Comercial da Bahia — Tesouraria',
    cnpj: '15.106.473/0001-23',
    date: '02/10/2026',
    amount: 'R$ 2.000,00',
    docNumber: 'RECIBO INTERNO Nº 2026/10-01',
  },
  'demo-alimentacao-out': {
    title: 'Lanche e água mineral — Fórum Regional',
    emitter: 'Sabores da Bahia Catering Ltda.',
    cnpj: '18.902.114/0001-03',
    date: '08/10/2026',
    amount: 'R$ 418,00',
    docNumber: 'NF-e Nº 001.408',
  },
  'demo-combustivel-out': {
    title: 'Abastecimento veículo institucional',
    emitter: 'Posto Barra Avenida Combustíveis',
    cnpj: '14.552.009/0001-71',
    date: '14/10/2026',
    amount: 'R$ 195,50',
    docNumber: 'NFC-e Nº 019.334',
  },
  'demo-purificador-out': {
    title: 'Manutenção preventiva purificador de água',
    emitter: 'HidroClean Assistência Técnica',
    cnpj: '27.410.892/0001-60',
    date: '21/10/2026',
    amount: 'R$ 265,00',
    docNumber: 'OS / NFS-e Nº 2026/084',
  },
};

let fundState = {
  fundLimit: 2000,
  fundComplement: 500,
  transactions: buildDemoTransactions(),
};

const uploadedReceipts = new Map<string, StoredReceipt>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '6mb' }));

  // Get full shared fund state
  app.get('/api/fund', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(fundState);
  });

  // Update settings or upsert transaction
  app.post('/api/fund', (req, res) => {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Requisição inválida.' });
      return;
    }

    if (body.action === 'settings') {
      const limit = Number(body.fundLimit);
      const complement = Number(body.fundComplement) || 0;
      if (!Number.isFinite(limit) || limit < 0 || !Number.isFinite(complement) || complement < 0) {
        res.status(400).json({ error: 'Valores de teto inválidos.' });
        return;
      }
      fundState.fundLimit = limit;
      fundState.fundComplement = complement;
      res.json(fundState);
      return;
    }

    if (body.transaction && typeof body.transaction === 'object') {
      const tx = body.transaction as Transaction;
      const id = String(body.id || tx.id || crypto.randomUUID());
      const normalized: Transaction = {
        id,
        date: String(tx.date || new Date().toISOString().slice(0, 10)),
        type: tx.type === 'IN' ? 'IN' : 'OUT',
        amount: Number(tx.amount) || 0,
        description: String(tx.description || '').trim(),
        category: String(tx.category || 'Outros'),
        requester: String(tx.requester || '').trim(),
        reimbursementStatus:
          tx.type === 'IN'
            ? 'NOT_APPLICABLE'
            : tx.reimbursementStatus || 'UNREVIEWED',
        receipt: tx.receipt || null,
      };

      const existingIdx = fundState.transactions.findIndex((t) => t.id === id);
      if (existingIdx >= 0) {
        fundState.transactions[existingIdx] = normalized;
      } else {
        fundState.transactions.unshift(normalized);
      }
      res.json({ ok: true, transaction: normalized });
      return;
    }

    res.status(400).json({ error: 'Ação não reconhecida.' });
  });

  // Delete transaction
  app.delete('/api/fund', (req, res) => {
    const id = req.body?.id;
    if (!id) {
      res.status(400).json({ error: 'ID não informado.' });
      return;
    }
    fundState.transactions = fundState.transactions.filter((t) => t.id !== id);
    res.json({ ok: true });
  });

  // Reset demo data
  app.post('/api/fund/reset', (_req, res) => {
    fundState = {
      fundLimit: 2000,
      fundComplement: 500,
      transactions: buildDemoTransactions(),
    };
    res.json(fundState);
  });

  // Upload receipt attachment
  app.post(
    '/api/receipts',
    express.raw({ type: '*/*', limit: '5mb' }),
    (req, res) => {
      const buffer = req.body as Buffer;
      if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
        res.status(400).json({ error: 'Arquivo vazio ou inválido.' });
        return;
      }
      const mimeType = req.headers['content-type'] || 'application/octet-stream';
      const id = `rec-${crypto.randomUUID()}`;
      uploadedReceipts.set(id, { mimeType, buffer });
      res.json({ url: `/api/receipts/${id}` });
    }
  );

  // Serve receipt (uploaded or demo SVG receipt)
  app.get('/api/receipts/:id', (req, res) => {
    const { id } = req.params;
    const uploaded = uploadedReceipts.get(id);
    if (uploaded) {
      res.setHeader('Content-Type', uploaded.mimeType);
      res.send(uploaded.buffer);
      return;
    }

    const demo = DEMO_RECEIPTS[id];
    if (demo) {
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.send(
        renderDemoReceiptSvg(
          demo.title,
          demo.emitter,
          demo.cnpj,
          demo.date,
          demo.amount,
          demo.docNumber
        )
      );
      return;
    }

    res.status(404).json({ error: 'Comprovante não encontrado.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fundo Fixo ACB server listening on http://localhost:${PORT}`);
  });
}

startServer();

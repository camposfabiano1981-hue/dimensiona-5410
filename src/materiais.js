/* ================================================================
   MATERIAIS — cadastro com normas de fabricação, quantitativo automático
   do projeto e lista de materiais (anexo do memorial descritivo)
   ================================================================ */
const CAT_MAT = {
  entrada: { nome: 'Padrão de entrada', espec: 'Padrão de entrada conforme a norma de fornecimento da distribuidora (Energisa NDU 001 / NDU 003): caixa de medição homologada, dispositivo de proteção geral, ramal de entrada, eletroduto e aterramento do neutro.', normas: 'Energisa NDU 001 v7.0; ABNT NBR 5410' },
  cond: { nome: 'Condutores e cabos', espec: 'Condutores de cobre, têmpera mole, encordoamento classe 5 (flexível) ou classe 2. Condutores isolados 450/750 V com isolação de PVC 70 °C ou não halogenada; cabos 0,6/1 kV com isolação de PVC, EPR/HEPR ou XLPE. Identificação por cores (NBR 5410, 6.1.5.3): neutro azul-claro; proteção verde-amarelo ou verde; fases preto, vermelho e branco.', normas: 'ABNT NBR NM 247-3; NBR 13248; NBR 7288; NBR 7286; NBR 7287; NBR NM 280' },
  prot: { nome: 'Dispositivos de proteção', espec: 'Disjuntores termomagnéticos com capacidade de interrupção compatível com a corrente de curto-circuito presumida; dispositivos diferenciais-residuais de alta sensibilidade (30 mA) nos circuitos exigidos por 5.1.3.2.2; dispositivos de proteção contra surtos (DPS) na origem e nos quadros, coordenados entre si.', normas: 'ABNT NBR NM 60898; NBR IEC 60947-2; NBR NM 61008; NBR NM 61009; NBR IEC 61643-11' },
  quad: { nome: 'Quadros de distribuição', espec: 'Quadros de distribuição em chapa de aço com pintura eletrostática ou em material isolante autoextinguível, com trilho DIN, barramentos de fase, neutro e proteção identificados, porta com fecho, espelho de proteção e espaço de reserva conforme a Tabela 59 da NBR 5410.', normas: 'ABNT NBR IEC 61439-1; NBR IEC 61439-3' },
  dutos: { nome: 'Eletrodutos, eletrocalhas e acessórios', espec: 'Eletrodutos rígidos ou flexíveis não propagantes de chama, com diâmetro nominal mínimo de 16 mm e taxa de ocupação conforme 6.2.11.1.6; eletrocalhas, perfilados e leitos com continuidade elétrica, ligados à equipotencialização.', normas: 'ABNT NBR 15465; NBR 15715; NBR 5597; NBR 5598; NBR IEC 61537' },
  caixas: { nome: 'Caixas', espec: 'Caixas de embutir e de derivação em material isolante não propagante de chama, com orelhas metálicas, compatíveis com os dispositivos e com o número de condutores.', normas: 'ABNT NBR IEC 60670-1' },
  disp: { nome: 'Tomadas, interruptores e dispositivos de comando', espec: 'Tomadas 2P+T no padrão brasileiro (10 A e 20 A, 250 V), interruptores de 10 A e placas em material termoplástico, com certificação compulsória do Inmetro.', normas: 'ABNT NBR 14136; NBR NM 60884-1; NBR NM 60669-1' },
  ilum: { nome: 'Iluminação', espec: 'Luminárias e lâmpadas LED com os dados fotométricos considerados no cálculo luminotécnico (fluxo, potência, temperatura de cor e IRC), com certificação do Inmetro.', normas: 'ABNT NBR IEC 60598-1; NBR IEC 62560; NBR ISO/CIE 8995-1' },
  spda: { nome: 'SPDA — proteção contra descargas atmosféricas', espec: 'Captação, descidas e anéis em cobre nu, alumínio ou aço cobreado com as seções mínimas da NBR 5419-3:2026; aterramento em anel (arranjo B) com cabo de cobre nu ou aço cobreado de 50 mm²; conectores de medição, fixadores, proteção mecânica das descidas e caixas de inspeção.', normas: 'ABNT NBR 5419-3:2026; NBR 13571; NBR 16254' },
  aterr: { nome: 'Aterramento e equipotencialização', espec: 'Hastes de aço-cobreado, cabo de cobre nu, conectores apropriados (cunha, compressão ou solda exotérmica), caixas de inspeção e barramento de equipotencialização principal (BEP).', normas: 'ABNT NBR 13571; NBR 16254; NBR 5410 (6.4)' },
  clima: { nome: 'Equipamentos de climatização', espec: 'Condicionadores de ar com selo de eficiência do Programa Brasileiro de Etiquetagem, instalados conforme o fabricante e a ABNT NBR 16655, com circuito exclusivo.', normas: 'ABNT NBR 16401-1; NBR 16655; Inmetro (PBE)' },
  div: { nome: 'Materiais diversos', espec: 'Conectores de emenda e derivação, terminais de compressão, fitas isolantes e de autofusão, abraçadeiras e demais materiais de fixação e acabamento, de primeira qualidade.', normas: 'Conforme o fabricante; certificação Inmetro quando compulsória' }
};
const ORDEM_CAT = Object.keys(CAT_MAT);
/* cadastro padrão de itens escolhidos pelo projetista (quantidade informada) */
const CADASTRO_PADRAO = [
  ['prot', 'DPS classe II — 275 V, In 20 kA, Imáx 40 kA', 'un', 'ABNT NBR IEC 61643-11'],
  ['prot', 'DPS classe I+II — 275 V, Iimp 12,5 kA (origem da instalação)', 'un', 'ABNT NBR IEC 61643-11'],
  ['quad', 'Barramento de neutro com bornes', 'un', 'ABNT NBR IEC 61439-3'],
  ['quad', 'Barramento de proteção (terra) com bornes', 'un', 'ABNT NBR IEC 61439-3'],
  ['quad', 'Barramento pente (fases) para disjuntores DIN', 'un', 'ABNT NBR IEC 61439-3'],
  ['dutos', 'Eletroduto PVC flexível corrugado 3/4" (25 mm)', 'm', 'ABNT NBR 15465'],
  ['dutos', 'Eletroduto PVC flexível corrugado 1" (32 mm)', 'm', 'ABNT NBR 15465'],
  ['dutos', 'Curva 90° PVC rígido roscável 3/4"', 'un', 'ABNT NBR 15465'],
  ['dutos', 'Luva PVC rígido roscável 3/4"', 'un', 'ABNT NBR 15465'],
  ['dutos', 'Bucha e arruela de alumínio 3/4"', 'cj', ''],
  ['dutos', 'Abraçadeira tipo D com cunha 3/4"', 'un', ''],
  ['dutos', 'Condulete múltiplo 3/4" com tampa', 'un', ''],
  ['dutos', 'Vergalhão roscado 1/4" com porcas, arruelas e suspensão para perfilado', 'cj', ''],
  ['caixas', 'Caixa de embutir 4×2" em PVC', 'un', 'ABNT NBR IEC 60670-1'],
  ['caixas', 'Caixa de embutir 4×4" em PVC', 'un', 'ABNT NBR IEC 60670-1'],
  ['caixas', 'Caixa octogonal 4×4" com fundo móvel (laje)', 'un', 'ABNT NBR IEC 60670-1'],
  ['caixas', 'Caixa de passagem de alvenaria/concreto 30×30×30 cm com tampa', 'un', ''],
  ['disp', 'Tomada 2P+T 10 A — 250 V com placa 4×2"', 'un', 'ABNT NBR 14136; NBR NM 60884-1'],
  ['disp', 'Tomada 2P+T 20 A — 250 V com placa 4×2"', 'un', 'ABNT NBR 14136; NBR NM 60884-1'],
  ['disp', 'Conjunto 2 tomadas 2P+T 10 A em placa 4×2"', 'un', 'ABNT NBR 14136; NBR NM 60884-1'],
  ['disp', 'Interruptor simples 10 A com placa 4×2"', 'un', 'ABNT NBR NM 60669-1'],
  ['disp', 'Interruptor simples duplo 10 A com placa 4×2"', 'un', 'ABNT NBR NM 60669-1'],
  ['disp', 'Interruptor paralelo (three-way) 10 A com placa 4×2"', 'un', 'ABNT NBR NM 60669-1'],
  ['disp', 'Interruptor intermediário (four-way) 10 A', 'un', 'ABNT NBR NM 60669-1'],
  ['disp', 'Conjunto interruptor simples + tomada 2P+T 10 A em placa 4×2"', 'un', 'ABNT NBR 14136; NBR NM 60669-1'],
  ['disp', 'Saída de fio com placa 4×2" (ponto de força, chuveiro)', 'un', 'ABNT NBR IEC 60670-1'],
  ['disp', 'Pulsador de campainha com placa 4×2"', 'un', 'ABNT NBR NM 60669-1'],
  ['disp', 'Placa cega 4×2"', 'un', ''],
  ['disp', 'Sensor de presença de teto 127/220 V', 'un', ''],
  ['ilum', 'Lâmpada LED bulbo A60 9 W E27 (pontos sem luminária definida)', 'un', 'ABNT NBR IEC 62560'],
  ['ilum', 'Refletor LED 50 W IP65 (área externa)', 'un', 'ABNT NBR IEC 60598-1'],
  ['aterr', 'Barramento de equipotencialização principal (BEP) em cobre', 'un', 'ABNT NBR 5410 (6.4.2)'],
  ['aterr', 'Conector/abraçadeira de equipotencialização para tubulação metálica', 'un', 'ABNT NBR 16254'],
  ['div', 'Conector de emenda/derivação por alavanca (2 a 5 vias)', 'un', ''],
  ['div', 'Terminal de compressão tipo ilhós/pino para condutor flexível', 'un', ''],
  ['div', 'Fita isolante de PVC 19 mm × 20 m', 'rolo', ''],
  ['div', 'Fita de autofusão 19 mm × 10 m', 'rolo', ''],
  ['div', 'Abraçadeira de nylon (pacote com 100)', 'pct', ''],
  ['div', 'Anilhas/etiquetas de identificação de circuitos', 'cj', '']
];
function materiaisPadrao() {
  return { reservaCabo: 10, reservaDuto: 10, padrao: true, clima: false, auto: {}, itens: CADASTRO_PADRAO.map(([cat, desc, un, norma], i) => ({ id: 'm' + (i + 1), cat, desc, un, norma, fab: '', qtd: 0 })) };
}

const COR_FASE = { A: 'preto', B: 'vermelho', C: 'branco' };
const nomeIsol = i => ({ PVC: 'PVC 70 °C', LSHF: 'não halogenado (LSHF/A) 70 °C', EPR: 'EPR/HEPR 90 °C', XLPE: 'XLPE 90 °C' })[i] || i;
const MODULOS_STD = [4, 8, 12, 16, 18, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96];
function reservaTab59(n) { return n <= 6 ? 2 : n <= 12 ? 3 : n <= 30 ? 4 : Math.ceil(0.15 * n); }

/* quantitativo automático a partir do projeto */
function materiaisAuto(proj, calc) {
  const M = proj.materiais || materiaisPadrao(), P = proj.params, R = calc.res, out = {};
  const add = (key, cat, desc, un, norma, q, origem, ord = []) => { const o = out[key] = out[key] || { key, cat, desc, un, norma, q: 0, origem: [], ord }; o.q += q; if (origem && !o.origem.includes(origem)) o.origem.push(origem); };
  const FO = { F: 0, N: 1, PE: 2 };
  const rc = 1 + (+M.reservaCabo || 0) / 100, rd = 1 + (+M.reservaDuto || 0) / 100;
  // condutores
  proj.circuitos.forEach(c => {
    const r = R[c.id]; if (!r || !r.cabos) return;
    const mat = MATERIAL[c.material === 'Al' ? 'Al' : 'Cu'], L = (+c.L || 0) * rc, norma = normaCabo(c.tipoCabo, c.isolacao);
    r.cabos.forEach(k => {
      if (k.multipolar) add(`cabo|mult|${c.isolacao}|${c.material}|${k.vias}|${k.S}`, 'cond', `Cabo multipolar 0,6/1 kV, ${mat}, isolação ${nomeIsol(c.isolacao)} — ${k.vias} × ${fS(k.S)} mm²`, 'm', norma, L, c.num, [2, c.isolacao, k.S, k.vias]);
      else {
        const cor = k.func === 'N' ? 'azul-claro (neutro)' : k.func === 'PE' ? 'verde-amarelo (proteção)' : `${COR_FASE[k.fase] || 'preto'} (fase)`;
        const tipo = c.tipoCabo === 'isolado' ? 'Condutor isolado 450/750 V' : 'Cabo unipolar 0,6/1 kV';
        add(`cabo|${c.tipoCabo}|${c.isolacao}|${c.material}|${k.S}|${k.func}${k.func === 'F' ? k.fase : ''}`, 'cond', `${tipo}, ${mat} classe ${c.material === 'Al' ? 2 : P.classe}, ${nomeIsol(c.isolacao)} — ${fS(k.S)} mm², cor ${cor}`, 'm', norma, L, c.num, [c.tipoCabo === 'isolado' ? 0 : 1, c.isolacao, k.S, FO[k.func] * 10 + 'ABC'.indexOf(k.fase || 'A')]);
      }
    });
  });
  // disjuntores e DR
  proj.circuitos.forEach(c => {
    const r = R[c.id]; if (!r || !r.In) return;
    if (c.dispositivo === 'fus_gG') add(`fus|${r.In}`, 'prot', `Fusível gG ${r.In} A com base`, 'un', 'ABNT NBR IEC 60269', 1, c.num);
    else if (c.dispositivo === 'disj_60947') add(`dj947|${r.polos}|${r.In}|${r.icn}`, 'prot', `Disjuntor ${r.polos}P ${r.In} A — ${nfmt(r.icn, 1)} kA`, 'un', 'ABNT NBR IEC 60947-2', 1, c.num);
    else add(`dj|${r.polos}|${r.curva}|${r.In}|${r.icn}`, 'prot', `Disjuntor termomagnético ${r.polos}P curva ${r.curva} ${r.In} A — ${nfmt(r.icn, 1)} kA`, 'un', 'ABNT NBR NM 60898', 1, c.num, [0, r.polos, r.In]);
    if (r.drUsado) add(`dr|${r.drTipo}|${r.drPolos}|${r.drIn}|${r.idn}`, 'prot', r.drTipo === 'DDR' ? `Disjuntor diferencial-residual (DDR) ${r.drPolos}P ${r.drIn} A — ${r.idn} mA` : `Interruptor diferencial-residual (IDR) ${r.drPolos}P ${r.drIn} A — ${r.idn} mA`, 'un', r.drTipo === 'DDR' ? 'ABNT NBR NM 61009' : 'ABNT NBR NM 61008', 1, c.num, [1, r.drPolos, r.drIn]);
  });
  // quadros (módulos DIN com espaço de reserva da Tabela 59)
  Object.values(calc.quadros).forEach(q => {
    if (!q.cs.length || q.q === 'QM') return;
    const mod = q.cs.reduce((s, c) => { const r = R[c.id]; return s + (r.polos || 1) + (r.drUsado ? (r.drPolos || 2) : 0); }, 0), res = reservaTab59(q.cs.length), n = mod + res * 2;
    const std = MODULOS_STD.find(x => x >= n) || n;
    add(`quad|${q.q}`, 'quad', `Quadro de distribuição ${q.q}${(proj.quadros[q.q] || {}).desc ? ' (' + proj.quadros[q.q].desc + ')' : ''} — ${std} módulos DIN, com barramentos de fase, neutro e proteção; ${q.cs.length} circuitos + reserva para ${res} circuitos (Tabela 59)`, 'un', 'ABNT NBR IEC 61439-3', 1, q.q);
  });
  // DPS de cada quadro, pelo motor de proteção contra surtos (NBR 5410 6.3.5 e NBR 5419-4)
  const ps = calc.spda && calc.spda.projeto;
  if (calc.dps) {
    Object.values(calc.dps.quadros).filter(r => r.ativo).forEach(r => r.materiais.forEach(([d, q, u, n]) => add(`${/condutor/i.test(d) ? 'dpscond' : /retaguarda/i.test(d) ? 'dpsback' : 'dps'}|${d}`, 'prot', d, u, n, q, r.q)));
    (calc.dps.sinal || []).forEach(x => add(`dps|sinal|${x.k}`, 'prot', `${x.mat} — categoria ${calc.dps.catSinal}`, 'un', 'IEC 61643-21', x.n, 'linhas de sinal'));
    if (calc.dps.classe3) add(`dps|III|${calc.dps.classe3.Uc}`, 'prot', `DPS classe III junto ao equipamento sensível — Uc ${calc.dps.classe3.Uc} V`, 'un', 'ABNT NBR IEC 61643-11', calc.dps.classe3.n, 'equipamentos sensíveis');
  }
  // SPDA (NBR 5419-3)
  if (ps) ps.materiais.forEach(([d, q, u, n]) => add(`spda|${d}`, 'spda', d, u, n, q, 'SPDA'));
  // eletrodutos
  Object.values(calc.trechos).forEach(t => {
    if (!t.aplica || !t.esc || (calc.calhas || {})[t.key]) return;
    const L = (+t.cfg.comp > 0 ? +t.cfg.comp : Math.max(...t.circuitos.map(c => +c.L || 0))) * rd;
    add(`duto|${t.cfg.tipo}|${t.esc.dn}`, 'dutos', `Eletroduto ${t.esc.nome} DN ${t.esc.dn} (${t.esc.pol})`, 'm', t.esc.norma, L, t.exclusivo ? 'circ. ' + t.circuitos[0].num : t.key);
  });
  // eletrocalhas
  Object.values(calc.calhas || {}).forEach(t => {
    if (!t.esc) return;
    const L = (+t.cfg.comp > 0 ? +t.cfg.comp : Math.max(...t.circuitos.map(c => +c.L || 0))) * rd;
    add(`calha|${t.cfg.tipo}|${t.esc.W}|${t.esc.H}`, 'dutos', `${t.esc.nome} ${t.esc.W} × ${t.esc.H} mm, com tampa, emendas e acessórios`, 'm', 'ABNT NBR IEC 61537', L, t.key);
    if (t.nSup) add(`calhasup|${t.cfg.tipo}|${t.esc.W}`, 'dutos', `Suporte / suspensão para ${t.esc.nome.toLowerCase()} ${t.esc.W} mm`, 'un', 'ABNT NBR IEC 61537', t.nSup, t.key);
  });
  // iluminação
  (proj.lumi || []).forEach(a => {
    const r = calc.lumi[a.id]; if (!r || !r.N) return; const pr = r.prod;
    add(`lum|${pr.id}`, 'ilum', `${pr.tipo === 'lampada' ? 'Lâmpada' : 'Luminária'} ${pr.fab && pr.fab !== '—' ? pr.fab + ' ' : ''}${pr.mod}${r.nLamp > 1 ? ` (${r.nLamp} lâmpadas)` : ''}`, 'un', pr.tipo === 'lampada' ? 'ABNT NBR IEC 62560' : 'ABNT NBR IEC 60598-1', r.N, a.nome);
  });
  // iluminação externa: projetores e postes
  (proj.lumiExt || []).forEach(a => {
    const r = (calc.lumiExt || {})[a.id]; if (!r || !r.N) return; const pr = r.prod;
    add(`lumx|${pr.id}|${pr.W}|${pr.lm}`, 'ilum', `${pr.nome}${pr.id === 'custom' ? ` ${nfmt(pr.W, 0)} W / ${nfmt(pr.lm, 0)} lm` : ''} — ${nfmt(pr.lm, 0)} lm, facho ${nfmt(pr.facho, 0)}°, ${pr.ip || 'IP65'} mín., com braço/suporte`, 'un', 'ABNT NBR IEC 60598-1 / IEC 60598-2-5', r.N, a.nome);
    add(`poste|${nfmt(r.h, 1)}`, 'ilum', `Poste de aço galvanizado a fogo, altura útil ${nfmt(r.h, 1)} m, com base, chumbadores e caixa de passagem`, 'un', 'ABNT NBR 14744', r.nPostes, a.nome);
    add('rele-fotoe', 'ilum', 'Relé fotoelétrico (ou temporizador) para comando da iluminação externa', 'un', 'ABNT NBR 5123', 1, a.nome);
  });
  // aterramento (sistemas de hastes)
  if (calc.aterr) (proj.aterr.arr || []).forEach(a => {
    const r = calc.aterr.arr[a.id]; if (!r || !r.materiais) return;
    r.materiais.forEach(([d, q, u]) => add(`aterr|${d}`, 'aterr', d, u, /Haste/.test(d) ? 'ABNT NBR 13571' : /Eletroduto/.test(d) ? 'ABNT NBR 15465' : /Conector|Cabo|Condutor/.test(d) ? 'ABNT NBR 16254' : '', q, a.nome));
  });
  // padrão de entrada Energisa
  if (M.padrao && calc.energisa) Object.values(calc.energisa.ucs || {}).forEach(u => {
    const pd = u.padrao || u.cat; if (!pd || !pd.caixa) return;
    add(`ent|cx|${pd.caixa}`, 'entrada', `Caixa de medição ${pd.caixa} — padrão Energisa (NDU 001), categoria ${pd.cat}`, 'un', 'Energisa NDU 001', 1, u.u.nome);
    if (pd.disj) add(`ent|dj|${pd.fases}|${pd.disj}`, 'entrada', `Disjuntor termomagnético geral ${pd.fases}P ${pd.disj} A — proteção do padrão de entrada`, 'un', 'ABNT NBR NM 60898 / NBR IEC 60947-2', 1, u.u.nome);
    if (pd.ramalEnt) add(`ent|ramal|${pd.cat}`, 'entrada', `Ramal de entrada: ${pd.ramalEnt}`, 'vb', 'Energisa NDU 001', 1, u.u.nome);
    if (pd.eletro) add(`ent|duto|${pd.eletro}`, 'entrada', `Eletroduto do ramal de entrada ${pd.eletro}`, 'vb', 'Energisa NDU 001', 1, u.u.nome);
  });
  // climatização (opcional)
  if (M.clima && calc.clima) proj.clima.amb.forEach(a => { const r = calc.clima.amb[a.id]; if (r && r.equip.n) add(`clima|${r.equip.cap}`, 'clima', `Condicionador de ar split ${nfmt(r.equip.cap, 0)} BTU/h`, 'un', 'Inmetro (PBE); ABNT NBR 16655', r.equip.n, a.nome); });
  return Object.values(out).map(o => { const ov = (M.auto || {})[o.key] || {}; const q = o.un === 'm' ? Math.ceil(o.q) : o.q; return { ...o, q, qtd: ov.qtd != null && ov.qtd !== '' ? +ov.qtd : q, fab: ov.fab || '', off: !!ov.off, auto: true }; });
}
function calcMateriais(proj, calc) {
  const M = proj.materiais || materiaisPadrao(), auto = materiaisAuto(proj, calc);
  const manual = (M.itens || []).map(x => ({ ...x, qtd: +x.qtd || 0, auto: false }));
  const cmpOrd = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { const x = a[i], y = b[i]; if (x === y) continue; if (x == null) return -1; if (y == null) return 1; return typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)); } return 0; };
  auto.sort((a, b) => ORDEM_CAT.indexOf(a.cat) - ORDEM_CAT.indexOf(b.cat) || cmpOrd(a.ord || [], b.ord || []));
  const lista = [...auto.filter(x => !x.off && x.qtd > 0), ...manual.filter(x => x.qtd > 0)]
    .sort((a, b) => ORDEM_CAT.indexOf(a.cat) - ORDEM_CAT.indexOf(b.cat) || (a.auto === b.auto ? 0 : a.auto ? -1 : 1));
  const porCat = ORDEM_CAT.map(k => ({ cat: k, ...CAT_MAT[k], itens: lista.filter(x => x.cat === k) })).filter(g => g.itens.length);
  return { auto, manual, lista, porCat };
}

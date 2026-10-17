/* ================================================================
   LUMINOTÉCNICA — ABNT NBR ISO/CIE 8995-1:2013 (iluminação de ambientes de trabalho)
   Método dos lúmens + verificação ponto a ponto da uniformidade.
   ================================================================ */
/* Requisitos (Em mantida em lx, UGRL, Ra mínimo; t = área com tarefa → Uo ≥ 0,7) */
const AMB_8995 = [
  ['Áreas gerais da edificação', 'Saguão de entrada', 100, 22, 60, 0], ['Áreas gerais da edificação', 'Sala de espera', 200, 22, 80, 0],
  ['Áreas gerais da edificação', 'Áreas de circulação e corredores', 100, 28, 40, 0], ['Áreas gerais da edificação', 'Escadas, escadas rolantes e esteiras rolantes', 150, 25, 40, 0],
  ['Áreas gerais da edificação', 'Refeitórios e cantinas', 200, 22, 80, 0], ['Áreas gerais da edificação', 'Salas de descanso', 100, 22, 80, 0],
  ['Áreas gerais da edificação', 'Salas para exercícios físicos', 300, 22, 80, 1], ['Áreas gerais da edificação', 'Vestiários, banheiros e toaletes', 200, 25, 80, 0],
  ['Áreas gerais da edificação', 'Enfermaria (primeiros socorros)', 500, 19, 80, 1], ['Áreas gerais da edificação', 'Salas para atendimento médico', 500, 16, 90, 1],
  ['Áreas gerais da edificação', 'Casa de máquinas, salas de quadros e painéis elétricos', 200, 25, 60, 1], ['Áreas gerais da edificação', 'Almoxarifados e câmaras frias', 100, 25, 60, 0],
  ['Áreas gerais da edificação', 'Expedição e embalagem', 300, 25, 60, 1], ['Áreas gerais da edificação', 'Estoque em prateleiras (corredores)', 150, 22, 60, 0],
  ['Escritórios', 'Arquivamento, cópia e circulação', 300, 19, 80, 1], ['Escritórios', 'Escrever, teclar, ler e processar dados', 500, 19, 80, 1],
  ['Escritórios', 'Desenho técnico', 750, 16, 80, 1], ['Escritórios', 'Estações de trabalho CAD', 500, 19, 80, 1],
  ['Escritórios', 'Salas de reunião e conferência', 500, 19, 80, 1], ['Escritórios', 'Recepção', 300, 22, 80, 1], ['Escritórios', 'Arquivos', 200, 25, 80, 0],
  ['Educação', 'Salas de aula', 300, 19, 80, 1], ['Educação', 'Salas de aula noturnas e educação de adultos', 500, 19, 80, 1],
  ['Educação', 'Quadro negro / lousa', 500, 19, 80, 1], ['Educação', 'Salas de desenho técnico', 750, 16, 80, 1],
  ['Educação', 'Laboratórios e salas de aplicação', 500, 19, 80, 1], ['Educação', 'Salas de informática', 500, 19, 80, 1],
  ['Educação', 'Salas de música', 300, 19, 80, 1], ['Educação', 'Salas dos professores', 300, 19, 80, 1],
  ['Educação', 'Biblioteca — estantes', 200, 19, 80, 0], ['Educação', 'Biblioteca — salas de leitura', 500, 19, 80, 1],
  ['Educação', 'Creches e salas de recreação infantil', 300, 19, 80, 1], ['Educação', 'Ginásios e quadras esportivas', 300, 22, 80, 1],
  ['Educação', 'Circulação e corredores', 100, 25, 80, 0],
  ['Comércio e hotelaria', 'Varejo — área de vendas', 300, 22, 80, 1], ['Comércio e hotelaria', 'Varejo — área do caixa', 500, 19, 80, 1],
  ['Comércio e hotelaria', 'Varejo — mesa de embrulho', 500, 19, 80, 1], ['Comércio e hotelaria', 'Recepção, caixa e portaria', 300, 22, 80, 1],
  ['Comércio e hotelaria', 'Cozinha profissional', 500, 22, 80, 1], ['Comércio e hotelaria', 'Restaurante self-service', 200, 22, 80, 0],
  ['Comércio e hotelaria', 'Bufê', 300, 22, 80, 0], ['Comércio e hotelaria', 'Salas de conferência', 500, 19, 80, 1], ['Comércio e hotelaria', 'Corredores de hotel', 100, 25, 80, 0],
  ['Saúde', 'Salas de espera', 200, 22, 80, 0], ['Saúde', 'Corredores durante o dia', 200, 22, 80, 0], ['Saúde', 'Corredores durante a noite', 50, 22, 80, 0],
  ['Saúde', 'Salas de médicos e de enfermagem', 500, 19, 80, 1], ['Saúde', 'Enfermarias — iluminação geral', 100, 19, 80, 0],
  ['Saúde', 'Enfermarias — leitura', 300, 19, 80, 1], ['Saúde', 'Enfermarias — exame e tratamento', 1000, 19, 90, 1], ['Saúde', 'Salas de exames — iluminação geral', 500, 19, 90, 1],
  ['Indústria', 'Montagem — trabalho grosseiro', 200, 25, 80, 1], ['Indústria', 'Montagem — trabalho médio', 300, 25, 80, 1],
  ['Indústria', 'Montagem — trabalho fino', 500, 22, 80, 1], ['Indústria', 'Montagem — trabalho muito fino', 750, 19, 80, 1],
  ['Indústria', 'Usinagem, tolerância ≥ 0,1 mm', 300, 22, 60, 1], ['Indústria', 'Usinagem de precisão, tolerância < 0,1 mm', 500, 19, 60, 1],
  ['Estacionamentos internos', 'Rampas de entrada e saída (dia)', 300, 25, 20, 0], ['Estacionamentos internos', 'Rampas de entrada e saída (noite)', 75, 25, 20, 0],
  ['Estacionamentos internos', 'Vias de circulação', 75, 25, 20, 0], ['Estacionamentos internos', 'Áreas de estacionamento', 75, null, 20, 0], ['Estacionamentos internos', 'Bilheteria / caixa', 300, 19, 80, 1],
  ['Residencial (referência)', 'Sala de estar — geral', 150, null, 80, 0], ['Residencial (referência)', 'Sala de estar — leitura (local)', 500, null, 80, 1],
  ['Residencial (referência)', 'Cozinha — geral', 150, null, 80, 0], ['Residencial (referência)', 'Cozinha — bancada, pia e fogão (local)', 300, null, 80, 1],
  ['Residencial (referência)', 'Quarto — geral', 150, null, 80, 0], ['Residencial (referência)', 'Quarto — espelho e cabeceira (local)', 300, null, 80, 1],
  ['Residencial (referência)', 'Banheiro — geral', 150, null, 80, 0], ['Residencial (referência)', 'Banheiro — espelho (local)', 300, null, 80, 1],
  ['Residencial (referência)', 'Hall, escadas, despensa e garagem', 100, null, 80, 0]
].map(([g, n, Em, UGR, Ra, t]) => ({ id: slugAmb(g.slice(0, 4) + ' ' + n), g, n, Em, UGR, Ra, tarefa: !!t, resid: g.startsWith('Residencial') }));
function slugAmb(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48); }
const AMB = Object.fromEntries(AMB_8995.map(a => [a.id, a]));
const AMB_PADRAO = AMB_8995.find(a => a.n.startsWith('Escrever')).id;

/* Catálogo de produtos — dados de fabricantes e revendedores (conferir na ficha técnica oficial pelo código) */
const CAT_LUM = [
  { id: 'phi-bulbo9', fab: 'Philips', mod: 'Lâmpada LED bulbo A60 9 W E27', tipo: 'lampada', W: 9, lm: 806, Ra: 80, vida: 25000, fonte: 'anúncios de revendedores (Magalu, Andra)' },
  { id: 'ldv-bulbo9', fab: 'Ledvance', mod: 'Lâmpada LED Classic A 9 W E27', tipo: 'lampada', W: 9, lm: 806, Ra: 80, vida: 25000, fonte: 'anúncios de revendedores (Leroy Merlin, Magnani)' },
  { id: 'ldv-bulbo12', fab: 'Ledvance', mod: 'Lâmpada LED bulbo 12 W E27', tipo: 'lampada', W: 12, lm: 1018, Ra: 80, vida: 25000, fonte: 'anúncios de revendedores (Santil, Laydner)' },
  { id: 'ldv-bulbo15', fab: 'Ledvance', mod: 'Lâmpada LED bulbo CLA90 15 W E27', tipo: 'lampada', W: 15, lm: 1311, Ra: 80, vida: 25000, fonte: 'anúncio de revendedor (Santil)' },
  { id: 'phi-bulbo16', fab: 'Philips', mod: 'Lâmpada LED bulbo 16 W E27', tipo: 'lampada', W: 16, lm: 1521, Ra: 80, vida: 25000, fonte: 'anúncio de revendedor (Meta Elétrica)' },
  { id: 'ldv-t8-60', fab: 'Ledvance', mod: 'Lâmpada LED tubular T8 60 cm 9 W G13', tipo: 'lampada', W: 9, lm: 900, Ra: 80, vida: 15000, tubo: true, fonte: 'anúncios de revendedores (Santil, Loja Elétrica)' },
  { id: 'phi-t8-60', fab: 'Philips', mod: 'CorePro LEDtube T8 60 cm 9 W G13', tipo: 'lampada', W: 9, lm: 900, Ra: 80, vida: 25000, tubo: true, fonte: 'anúncios de revendedores (Andra, Abastece)' },
  { id: 'ldv-t8-120', fab: 'Ledvance', mod: 'Lâmpada LED tubular T8 120 cm 18 W G13', tipo: 'lampada', W: 18, lm: 1850, Ra: 80, vida: 25000, tubo: true, fonte: 'anúncio de revendedor (Abastece), registro Inmetro 003939/2023' },
  { id: 'phi-t8-120', fab: 'Philips', mod: 'CorePro LEDtube T8 120 cm 18 W G13', tipo: 'lampada', W: 18, lm: 1850, Ra: 80, vida: 30000, tubo: true, fonte: 'ficha de revendedor' },
  { id: 'ldv-painel36', fab: 'Ledvance', mod: 'Painel LED de embutir 62×62 cm 36 W', tipo: 'luminaria', W: 36, lm: 4680, Ra: 80, vida: 25000, facho: 120, up: 0, fonte: 'Catálogo Ledvance 25|26 (revendedores citam 3.600 a 4.320 lm)' },
  { id: 'lum-lht44', fab: 'Lumicenter', mod: 'LHT44-E — painel LED de embutir 60 cm 40 W', tipo: 'luminaria', W: 40, lm: 3700, Ra: 80, vida: 50000, facho: 110, up: 0, ugr: 17, fonte: 'ficha de revendedor; ficha oficial em lumicenter.com' },
  { id: 'elg-painel36', fab: 'Elgin', mod: 'Painel LED 62×62 cm 36 W (48PL6262BN01)', tipo: 'luminaria', W: 36, lm: 2880, Ra: 80, vida: 30000, facho: 120, up: 0, fonte: 'anúncio de revendedor' },
  { id: 'pix-painel40', fab: 'PIX', mod: 'Painel LED de embutir 62×62 cm 40 W', tipo: 'luminaria', W: 40, lm: 3600, Ra: 80, vida: 25000, facho: 120, up: 0, fonte: 'anúncio de revendedor' },
  { id: 'lum-ef40-17', fab: 'Lumicenter', mod: 'EF40-E — downlight 17,5 W (EF40-E12000840)', tipo: 'luminaria', W: 17.5, lm: 2100, Ra: 80, vida: 50000, facho: 90, up: 0, fonte: 'página oficial lumicenter.com' },
  { id: 'lum-ef40-26', fab: 'Lumicenter', mod: 'EF40-E — downlight 26 W (EF40-E13000840)', tipo: 'luminaria', W: 26, lm: 3090, Ra: 80, vida: 50000, facho: 90, up: 0, fonte: 'página oficial lumicenter.com' },
  { id: 'lum-ef93', fab: 'Lumicenter', mod: 'EF93-E — downlight 6,5 W', tipo: 'luminaria', W: 6.5, lm: 545, Ra: 80, vida: 50000, facho: 90, up: 0, fonte: 'página oficial lumicenter.com (510 a 580 lm)' },
  { id: 'ldv-down12', fab: 'Ledvance', mod: 'Downlight LED de embutir 12 W', tipo: 'luminaria', W: 12, lm: 840, Ra: 80, vida: 25000, facho: 110, up: 0, fonte: 'Catálogo Ledvance 25|26 (840 a 900 lm)' },
  { id: 'ldv-down18', fab: 'Ledvance', mod: 'Downlight LED quadrado de embutir 18 W, 22 cm', tipo: 'luminaria', W: 18, lm: 1350, Ra: 80, vida: 25000, facho: 110, up: 0, fonte: 'anúncio de revendedor (1.260 a 1.440 lm conforme a cor)' },
  { id: 'phi-plafon18', fab: 'Philips', mod: 'Plafon LED de sobrepor redondo 18 W 4000 K', tipo: 'luminaria', W: 18, lm: 1300, Ra: 80, vida: 20000, facho: 120, up: 0, fonte: 'anúncio de revendedor' },
  { id: 'phi-plafon24', fab: 'Philips', mod: 'Plafon LED de sobrepor quadrado 24 W', tipo: 'luminaria', W: 24, lm: 2000, Ra: 80, vida: 20000, facho: 120, up: 0, fonte: 'anúncios de revendedores (Leroy Merlin)' },
  { id: 'ldv-plafon18', fab: 'Ledvance', mod: 'Plafon LED slim quadrado 18 W 4000 K', tipo: 'luminaria', W: 18, lm: 1350, Ra: 80, vida: 25000, facho: 110, up: 0, fonte: 'anúncio de revendedor (Laydner)' },
  { id: 'ldv-flood50', fab: 'Ledvance', mod: 'Refletor LED Floodlight Compact 50 W IP65', tipo: 'luminaria', W: 50, lm: 5000, Ra: 80, vida: 25000, facho: 100, up: 0, fonte: 'anúncio de revendedor (Abastece)' },
  { id: 'phi-flood50', fab: 'Philips', mod: 'Refletor LED G2 50 W IP65', tipo: 'luminaria', W: 50, lm: 4750, Ra: 70, vida: 25000, facho: 100, up: 0, fonte: 'loja oficial Philips' },
  { id: 'phi-flood100', fab: 'Philips', mod: 'Refletor LED G2 100 W IP65', tipo: 'luminaria', W: 100, lm: 9500, Ra: 70, vida: 25000, facho: 100, up: 0, fonte: 'loja oficial Philips' },
  { id: 'ldv-flood200', fab: 'Ledvance', mod: 'Refletor LED Floodlight PFM 200 W 5000 K IP65', tipo: 'luminaria', W: 200, lm: 25000, Ra: 70, vida: 25000, facho: 100, up: 0, fonte: 'anúncio de revendedor (Abastece)' },
  { id: 'gen-hb100', fab: 'Genérico', mod: 'Luminária industrial LED (high bay) 100 W, 150 lm/W', tipo: 'luminaria', W: 100, lm: 15000, Ra: 80, vida: 50000, facho: 120, up: 0, fonte: 'referência de mercado (150 lm/W)' },
  { id: 'gen-hb150', fab: 'Genérico', mod: 'Luminária industrial LED (high bay) 150 W, 150 lm/W', tipo: 'luminaria', W: 150, lm: 22500, Ra: 80, vida: 50000, facho: 120, up: 0, fonte: 'referência de mercado (150 lm/W)' },
  { id: 'gen-hb200', fab: 'Genérico', mod: 'Luminária industrial LED (high bay) 200 W, 150 lm/W', tipo: 'luminaria', W: 200, lm: 30000, Ra: 80, vida: 50000, facho: 90, up: 0, fonte: 'referência de mercado (150 lm/W)' }
];
const CATL = Object.fromEntries(CAT_LUM.map(p => [p.id, p]));
/* Corpos de luminária para lâmpadas avulsas — rendimento (LOR) e distribuição típicos */
const CORPOS = {
  plafonier: { nome: 'Plafonier ou arandela com globo (bulbo)', lor: 0.80, facho: 140, up: 0.05 },
  pendente: { nome: 'Pendente aberto (bulbo)', lor: 0.85, facho: 120, up: 0.10 },
  spot: { nome: 'Spot / embutido com refletor (bulbo)', lor: 0.70, facho: 90, up: 0 },
  calha: { nome: 'Calha de sobrepor aberta (tubo)', lor: 0.90, facho: 150, up: 0.25 },
  aletada: { nome: 'Luminária com refletor aletado (tubos)', lor: 0.75, facho: 100, up: 0 },
  leitosa: { nome: 'Luminária com difusor leitoso (tubos)', lor: 0.65, facho: 120, up: 0 },
  hermetica: { nome: 'Luminária hermética (tubos)', lor: 0.70, facho: 120, up: 0.05 }
};
const REFL_TETO = [0.8, 0.7, 0.5, 0.3], REFL_PAREDE = [0.7, 0.5, 0.3, 0.1], REFL_PISO = [0.3, 0.2, 0.1];
const FM_PRESETS = [['0.8', '0,80 — ambiente muito limpo, limpeza anual'], ['0.75', '0,75 — ambiente limpo'], ['0.7', '0,70 — ambiente normal (mínimo recomendado)'], ['0.6', '0,60 — ambiente sujo'], ['calc', 'Calcular (CIE 97: LLMF × LSF × LMF × RSMF)']];

function nDeFacho(f) { if (!(f > 0) || f >= 179) return 1; const c = Math.cos(f / 2 * Math.PI / 180); return clamp(Math.log(0.5) / Math.log(c), 0.6, 30); }
function ffParalelos(a, b, c) {
  const X = a / c, Y = b / c, x1 = Math.sqrt(1 + X * X), y1 = Math.sqrt(1 + Y * Y);
  return 2 / (Math.PI * X * Y) * (Math.log(Math.sqrt((1 + X * X) * (1 + Y * Y) / (1 + X * X + Y * Y))) + X * y1 * Math.atan(X / y1) + Y * x1 * Math.atan(Y / x1) - X * Math.atan(X) - Y * Math.atan(Y));
}
/* fração do fluxo descendente que atinge diretamente o plano de trabalho (fontes cosⁿ distribuídas no forro) */
function fracaoDireta(L, W, h, n) {
  const ns = 6, nr = 18; let soma = 0; const dA = (L / nr) * (W / nr), k = (n + 1) / (2 * Math.PI);
  for (let i = 0; i < ns; i++) for (let j = 0; j < ns; j++) {
    const xs = (i + 0.5) * L / ns, ys = (j + 0.5) * W / ns; let f = 0;
    for (let a = 0; a < nr; a++) for (let b = 0; b < nr; b++) { const dx = (a + 0.5) * L / nr - xs, dy = (b + 0.5) * W / nr - ys, d2 = dx * dx + dy * dy + h * h; f += Math.pow(h, n + 1) / Math.pow(d2, (n + 3) / 2) * dA; }
    soma += Math.min(1, k * f);
  }
  return soma / (ns * ns);
}
/* utilância por radiosidade de três superfícies (plano de trabalho, paredes, teto) */
function utilancia(L, W, h, n, up, rc, rw, rf) {
  const AF = L * W, AW = 2 * (L + W) * h;
  const Ffc = ffParalelos(L, W, h), Ffw = 1 - Ffc, Fwf = AF * Ffw / AW, Fww = Math.max(0, 1 - 2 * Fwf);
  const fd = fracaoDireta(L, W, h, n);
  const F = { f: { f: 0, w: Ffw, c: Ffc }, w: { f: Fwf, w: Fww, c: Fwf }, c: { f: Ffc, w: Ffw, c: 0 } };
  const rho = { f: rf, w: rw, c: rc }, ids = ['f', 'w', 'c'];
  const e0 = { f: (1 - up) * fd, w: (1 - up) * (1 - fd), c: up };
  const M = ids.map(i => ids.map(j => (i === j ? 1 : 0) - rho[j] * F[j][i]));
  const b = ids.map(i => e0[i]);
  const x = resolver3(M, b);
  return { U: x[0], fd, direto: e0.f, Ffc };
}
function resolver3(A, b) {
  const m = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < 3; c++) { let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r; [m[c], m[p]] = [m[p], m[c]]; for (let r = 0; r < 3; r++) if (r !== c) { const f = m[r][c] / m[c][c]; for (let k = c; k < 4; k++) m[r][k] -= f * m[c][k]; } }
  return m.map((r, i) => r[3] / r[i]);
}
function cargaMinima5410(A) { return A <= 6 ? 100 : 100 + 60 * Math.floor((A - 6) / 4 + 1e-9); }

function defaultsAmbiente(i = 1) {
  return { id: uid(), nome: `Ambiente ${i}`, amb: AMB_PADRAO, Em: null, L: 6, W: 4, pd: 2.8, hwp: 0.75, susp: 0, rc: 0.7, rw: 0.5, rf: 0.2,
    prod: 'ldv-painel36', corpo: 'aletada', nLamp: 2, cW: 36, clm: 3600, cRa: 80, cFacho: 120, cUp: 0, fm: '0.8', llmf: 0.9, lsf: 1, lmf: 0.9, rsmf: 0.95,
    uf: null, nx: null, ny: null, circuito: '', obs: '' };
}

function calcAmbiente(a) {
  const r = { avisos: [], falhas: [] };
  const req = AMB[a.amb] || AMB[AMB_PADRAO]; r.req = req;
  r.Em = +a.Em > 0 ? +a.Em : req.Em; r.Ra = req.Ra; r.UGR = req.UGR; r.tarefa = req.tarefa;
  const L = Math.max(0.5, +a.L || 0), W = Math.max(0.5, +a.W || 0); r.L = L; r.W = W; r.A = L * W;
  r.hLum = (+a.pd || 2.8) - (+a.susp || 0); r.hm = r.hLum - (+a.hwp || 0);
  if (!(r.hm > 0.2)) { r.falhas.push('Altura útil (luminária até o plano de trabalho) inválida — revise pé-direito, suspensão e plano de trabalho.'); r.hm = 0.2; }
  r.K = L * W / (r.hm * (L + W));
  // produto
  const p = a.prod === 'custom' ? { fab: '—', mod: 'Luminária informada pelo projetista', tipo: 'luminaria', W: +a.cW || 0, lm: +a.clm || 0, Ra: +a.cRa || 80, facho: +a.cFacho || 120, up: (+a.cUp || 0) / 100 } : (CATL[a.prod] || CAT_LUM[0]);
  r.prod = p;
  if (p.tipo === 'lampada') {
    const cp = CORPOS[a.corpo] || (p.tubo ? CORPOS.aletada : CORPOS.plafonier); r.corpo = cp;
    r.nLamp = Math.max(1, Math.round(+a.nLamp || 1)); r.lor = cp.lor; r.facho = cp.facho; r.up = cp.up;
    r.phiLamp = p.lm; r.phi = p.lm * r.nLamp; r.Wlum = p.W * r.nLamp;
  } else { r.nLamp = 1; r.lor = 1; r.facho = p.facho || 120; r.up = p.up || 0; r.phi = p.lm; r.Wlum = p.W; }
  r.n = nDeFacho(r.facho);
  // fator de utilização
  const u = utilancia(L, W, r.hm, r.n, r.up, +a.rc, +a.rw, +a.rf);
  r.Ucalc = u.U * r.lor; r.fd = u.fd; r.direto = u.direto;
  r.UF = +a.uf > 0 ? +a.uf : r.Ucalc; r.ufFonte = +a.uf > 0 ? 'informado (tabela do fabricante)' : 'calculado por radiosidade de três superfícies';
  // fator de manutenção
  if (a.fm === 'calc') { r.FM = (+a.llmf || 1) * (+a.lsf || 1) * (+a.lmf || 1) * (+a.rsmf || 1); r.fmFonte = `CIE 97: ${[a.llmf, a.lsf, a.lmf, a.rsmf].map(v => nfmt(+v, 2)).join(' × ')}`; }
  else { r.FM = +a.fm || 0.8; r.fmFonte = 'valor adotado'; }
  if (r.FM < 0.7 - 1e-9) r.avisos.push(`Fator de manutenção ${nfmt(r.FM, 2)} abaixo de 0,70, valor mínimo recomendado pela NBR ISO/CIE 8995-1 (anexo D).`);
  if (!(r.phi > 0)) { r.falhas.push('Fluxo luminoso da luminária não informado.'); r.phi = 1; }
  // quantidade
  r.Nreq = r.Em * r.A / (r.phi * r.UF * r.FM);
  let nx = +a.nx > 0 ? Math.round(+a.nx) : null, ny = +a.ny > 0 ? Math.round(+a.ny) : null;
  if (!nx || !ny) {
    const N = Math.max(1, Math.ceil(r.Nreq - 1e-9)); let best = null;
    for (let y = 1; y <= N; y++) { const x = Math.ceil(N / y); const sx = L / x, sy = W / y; const sc = (x * y - N) * 2 + Math.abs(Math.log(sx / sy)) * 3; if (!best || sc < best.sc) best = { x, y, sc }; }
    nx = nx || best.x; ny = ny || best.y;
  }
  r.nx = nx; r.ny = ny; r.N = nx * ny; r.Sx = L / nx; r.Sy = W / ny;
  r.Emed = r.N * r.phi * r.UF * r.FM / r.A;
  r.SHR = 1.5 / Math.pow(r.n, 0.4); r.Smax = r.SHR * r.hm;
  if (Math.max(r.Sx, r.Sy) > r.Smax + 1e-6) r.avisos.push(`Espaçamento entre luminárias (${nfmt(Math.max(r.Sx, r.Sy), 2)} m) acima do recomendado para a distribuição (${nfmt(r.Smax, 2)} m = ${nfmt(r.SHR, 2)} × hm): risco de baixa uniformidade.`);
  // ponto a ponto (malha com 0,5 m de borda excluída)
  const I0 = r.phi * r.lor * (1 - r.up) * (r.n + 1) / (2 * Math.PI);
  const Eref = (r.UF / r.lor - r.direto) > 0 ? (r.Ucalc / r.lor - r.direto) * r.N * r.phi * r.lor / r.A : 0;
  const bx = Math.min(0.5, L / 4), by = Math.min(0.5, W / 4), gx = Math.max(4, Math.min(20, Math.round((L - 2 * bx) / 0.5) + 1)), gy = Math.max(4, Math.min(20, Math.round((W - 2 * by) / 0.5) + 1));
  let emin = Infinity, emax = 0, esum = 0; const malha = [];
  for (let i = 0; i < gx; i++) { const linha = []; for (let j = 0; j < gy; j++) {
    const px = bx + (L - 2 * bx) * i / (gx - 1), py = by + (W - 2 * by) * j / (gy - 1); let E = 0;
    for (let a2 = 0; a2 < nx; a2++) for (let b2 = 0; b2 < ny; b2++) { const lx = (a2 + 0.5) * r.Sx, ly = (b2 + 0.5) * r.Sy, dx = px - lx, dy = py - ly, d2 = dx * dx + dy * dy + r.hm * r.hm, ct = r.hm / Math.sqrt(d2); E += I0 * Math.pow(ct, r.n) * ct / d2; }
    E = (E + Eref) * r.FM * (r.UF / r.Ucalc); linha.push(E); emin = Math.min(emin, E); emax = Math.max(emax, E); esum += E;
  } malha.push(linha); }
  r.malha = malha; r.Emin = emin; r.Emax = emax; r.EmedPP = esum / (gx * gy); r.Uo = r.Emin / r.EmedPP; r.gx = gx; r.gy = gy;
  // potência
  r.P = r.N * r.Wlum; r.dens = r.P / r.A; r.dens100 = r.dens / (r.Emed / 100);
  r.VA = r.P / 0.92;
  if (req.resid) { r.VAmin = cargaMinima5410(r.A); }
  // verificações
  r.okEm = r.Emed + 1e-6 >= r.Em; r.okRa = (p.Ra || 0) >= (r.Ra || 0); r.okUo = !r.tarefa || r.Uo + 1e-6 >= 0.7;
  if (!r.okEm) r.falhas.push(`Iluminância média ${nfmt(r.Emed, 0)} lx abaixo da exigida (${r.Em} lx).`);
  if (!r.okRa) r.falhas.push(`Índice de reprodução de cor do produto (Ra ${p.Ra}) abaixo do exigido (Ra ${r.Ra}).`);
  if (!r.okUo) r.avisos.push(`Uniformidade Emín/Eméd = ${nfmt(r.Uo, 2)} abaixo de 0,7 exigido na área da tarefa (NBR ISO/CIE 8995-1).`);
  if (r.UGR != null) { if (p.ugr != null) { if (p.ugr > r.UGR) r.falhas.push(`UGR do produto (${p.ugr}) acima do limite UGRL ${r.UGR}.`); } else r.avisos.push(`Confirmar na ficha fotométrica do fabricante que o UGR da instalação não ultrapassa UGRL = ${r.UGR}.`); }
  if (r.Emed > r.Em * 1.5) r.avisos.push(`Iluminância média ${nfmt(r.Emed, 0)} lx muito acima da exigida (${r.Em} lx): considere menos luminárias ou outro produto.`);
  r.status = r.falhas.length ? 'fail' : (r.avisos.length ? 'warn' : 'ok');
  return r;
}
function calcLumi(proj) { const out = {}; (proj.lumi || []).forEach(a => { out[a.id] = calcAmbiente(a); }); return out; }

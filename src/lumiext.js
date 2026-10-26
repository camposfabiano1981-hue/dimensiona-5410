/* ================================================================
   ILUMINAÇÃO DE EXTERIORES — método dos lúmens (fluxo) e método ponto a ponto
   Referências: Mamede Filho, Instalações Elétricas Industriais (iluminação de exteriores
   com projetores: N = E·S/(Φ·Fu·Fd) e verificação ponto a ponto); ABNT NBR 5101
   (iluminação pública — classes por iluminância da edição 2018); EN 12464-2 / CIE S 015
   (locais de trabalho externos); EN 12193 (iluminação esportiva).
   ================================================================ */
/* requisitos: [grupo, ambiente, Eméd (lx), U0 = Emín/Eméd, referência] — valores de referência; confirmar na edição vigente */
const REQ_EXT = [
  ['Vias públicas — veículos (NBR 5101)', 'V1 — vias de trânsito rápido e arteriais de tráfego intenso', 30, 0.40, 'NBR 5101:2018'],
  ['Vias públicas — veículos (NBR 5101)', 'V2 — vias arteriais e coletoras de tráfego médio a intenso', 20, 0.30, 'NBR 5101:2018'],
  ['Vias públicas — veículos (NBR 5101)', 'V3 — vias coletoras e locais de tráfego médio', 15, 0.20, 'NBR 5101:2018'],
  ['Vias públicas — veículos (NBR 5101)', 'V4 — vias locais de tráfego leve', 10, 0.20, 'NBR 5101:2018'],
  ['Vias públicas — veículos (NBR 5101)', 'V5 — vias locais de tráfego muito leve', 5, 0.20, 'NBR 5101:2018'],
  ['Vias públicas — pedestres (NBR 5101)', 'P1 — calçadões e vias de pedestres de uso intenso', 20, 0.30, 'NBR 5101:2018'],
  ['Vias públicas — pedestres (NBR 5101)', 'P2 — vias de pedestres de uso médio', 10, 0.25, 'NBR 5101:2018'],
  ['Vias públicas — pedestres (NBR 5101)', 'P3 — vias de pedestres de uso leve', 5, 0.20, 'NBR 5101:2018'],
  ['Vias públicas — pedestres (NBR 5101)', 'P4 — vias de pedestres de uso muito leve', 3, 0.20, 'NBR 5101:2018'],
  ['Locais de trabalho externos (EN 12464-2)', 'Passagens exclusivas de pedestres', 5, 0.25, 'EN 12464-2'],
  ['Locais de trabalho externos (EN 12464-2)', 'Circulação de veículos lentos (até 10 km/h)', 10, 0.40, 'EN 12464-2'],
  ['Locais de trabalho externos (EN 12464-2)', 'Tráfego regular de veículos (até 40 km/h)', 20, 0.40, 'EN 12464-2'],
  ['Locais de trabalho externos (EN 12464-2)', 'Manobra, carga e descarga de veículos; passagens de pedestres', 50, 0.40, 'EN 12464-2'],
  ['Locais de trabalho externos (EN 12464-2)', 'Pátio industrial — movimentação eventual de materiais', 20, 0.25, 'EN 12464-2'],
  ['Locais de trabalho externos (EN 12464-2)', 'Pátio industrial — movimentação contínua de materiais', 50, 0.40, 'EN 12464-2'],
  ['Estacionamentos externos (EN 12464-2)', 'Estacionamento de tráfego leve (residências, pequeno comércio)', 5, 0.25, 'EN 12464-2'],
  ['Estacionamentos externos (EN 12464-2)', 'Estacionamento de tráfego médio (escritórios, shoppings)', 10, 0.25, 'EN 12464-2'],
  ['Estacionamentos externos (EN 12464-2)', 'Estacionamento de tráfego intenso (grandes centros, eventos)', 20, 0.25, 'EN 12464-2'],
  ['Áreas esportivas externas (EN 12193)', 'Quadra poliesportiva — recreação e treino (classe III)', 75, 0.50, 'EN 12193'],
  ['Áreas esportivas externas (EN 12193)', 'Quadra poliesportiva — competição local (classe II)', 200, 0.60, 'EN 12193']
].map(([g, n, Em, U0, ref]) => ({ id: slugAmb(g.slice(0, 6) + ' ' + n), g, n, Em, U0, ref }));
const REQX = Object.fromEntries(REQ_EXT.map(r => [r.id, r]));
const REQX_PADRAO = REQ_EXT.find(r => r.n.startsWith('Estacionamento de tráfego médio')).id;
/* luminárias externas genéricas: fluxo e abertura típicos de catálogo — usar os dados do fabricante */
const CAT_EXT = [
  { id: 'ref30', nome: 'Refletor LED 30 W', tipo: 'projetor', W: 30, lm: 3000, facho: 120, ip: 'IP65' },
  { id: 'ref50', nome: 'Refletor LED 50 W', tipo: 'projetor', W: 50, lm: 5000, facho: 120, ip: 'IP65' },
  { id: 'ref100', nome: 'Refletor LED 100 W', tipo: 'projetor', W: 100, lm: 10000, facho: 120, ip: 'IP65' },
  { id: 'ref150', nome: 'Refletor LED 150 W', tipo: 'projetor', W: 150, lm: 15000, facho: 120, ip: 'IP65' },
  { id: 'ref200', nome: 'Refletor LED 200 W', tipo: 'projetor', W: 200, lm: 20000, facho: 120, ip: 'IP65' },
  { id: 'ref200e', nome: 'Projetor LED 200 W — facho estreito 60°', tipo: 'projetor', W: 200, lm: 22000, facho: 60, ip: 'IP66' },
  { id: 'ref400e', nome: 'Projetor LED 400 W — facho estreito 60° (quadras)', tipo: 'projetor', W: 400, lm: 52000, facho: 60, ip: 'IP66' },
  { id: 'pub60', nome: 'Luminária viária LED 60 W', tipo: 'viaria', W: 60, lm: 7800, facho: 130, ip: 'IP66' },
  { id: 'pub100', nome: 'Luminária viária LED 100 W', tipo: 'viaria', W: 100, lm: 13000, facho: 130, ip: 'IP66' },
  { id: 'pub150', nome: 'Luminária viária LED 150 W', tipo: 'viaria', W: 150, lm: 19500, facho: 130, ip: 'IP66' },
  { id: 'jardim', nome: 'Luminária de poste para jardim LED 20 W', tipo: 'jardim', W: 20, lm: 2000, facho: 160, ip: 'IP65' }
];
const CATX = Object.fromEntries(CAT_EXT.map(p => [p.id, p]));
const ARRANJOS_EXT = { lado: 'Postes em um lado, projetores voltados para a área', ambos: 'Postes nos dois lados (frente a frente)', alternado: 'Postes nos dois lados, alternados', cantos: 'Postes nos quatro cantos, voltados para o centro', grade: 'Postes distribuídos em grade dentro da área' };
function ambExtPadrao(i = 1) {
  return { id: uid(), nome: `Área externa ${i}`, req: REQX_PADRAO, Em: null, U0: null, L: 30, W: 20, arranjo: 'lado', n: 3, nx: 2, ny: 2, k: 1, h: 8, tilt: 50, recuo: 0.5, prod: 'ref150', cW: 100, clm: 10000, cFacho: 120, fd: 0.80, fu: 0.45, circuito: '', obs: '' };
}
const mDeFacho = f => Math.max(0.2, Math.log(0.5) / Math.log(Math.cos(Math.min(170, Math.max(10, f)) / 2 * Math.PI / 180)));
/* posição e direção de mira de cada projetor */
function postesExt(a, r) {
  const L = r.L, W = r.W, n = Math.max(1, Math.round(+a.n || 1)), k = Math.max(1, Math.round(+a.k || 1)), rc = +a.recuo || 0, t = (+a.tilt || 0) * Math.PI / 180, P = [];
  const mira = (x, y, az) => { for (let j = 0; j < k; j++) { const azj = a.arranjo === 'grade' && k > 1 ? az + 2 * Math.PI * j / k : az; P.push({ x, y, ax: Math.sin(t) * Math.cos(azj), ay: Math.sin(t) * Math.sin(azj), az: -Math.cos(t) }); } };
  const posts = [];
  if (a.arranjo === 'lado' || a.arranjo === 'ambos' || a.arranjo === 'alternado') {
    const d1 = a.arranjo === 'alternado' ? 0.25 : 0.5, d2 = a.arranjo === 'alternado' ? 0.75 : 0.5;
    for (let i = 0; i < n; i++) posts.push([(i + d1) * L / n, -rc, Math.PI / 2]);
    if (a.arranjo !== 'lado') for (let i = 0; i < n; i++) posts.push([(i + d2) * L / n, W + rc, -Math.PI / 2]);
  } else if (a.arranjo === 'cantos') {
    [[-rc, -rc], [L + rc, -rc], [L + rc, W + rc], [-rc, W + rc]].forEach(([x, y]) => posts.push([x, y, Math.atan2(W / 2 - y, L / 2 - x)]));
  } else {
    const nx = Math.max(1, Math.round(+a.nx || 1)), ny = Math.max(1, Math.round(+a.ny || 1));
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) posts.push([(i + 0.5) * L / nx, (j + 0.5) * W / ny, 0]);
  }
  posts.forEach(([x, y, az]) => mira(x, y, az));
  r.postes = posts.map(([x, y, az]) => ({ x, y, az }));
  return P;
}
function calcAreaExt(a) {
  const r = { avisos: [], falhas: [] };
  const req = REQX[a.req] || REQX[REQX_PADRAO]; r.req = req;
  r.Em = +a.Em > 0 ? +a.Em : req.Em; r.U0req = +a.U0 > 0 ? +a.U0 : req.U0;
  r.L = Math.max(1, +a.L || 0); r.W = Math.max(1, +a.W || 0); r.A = r.L * r.W; r.h = Math.max(2, +a.h || 0);
  const p = a.prod === 'custom' ? { id: 'custom', nome: 'Projetor/luminária informado pelo projetista', tipo: 'projetor', W: +a.cW || 0, lm: +a.clm || 0, facho: +a.cFacho || 120, ip: '' } : (CATX[a.prod] || CATX.ref150);
  r.prod = p; r.phi = p.lm; r.Wlum = p.W; r.m = mDeFacho(p.facho);
  if (!(r.phi > 0)) { r.falhas.push('Fluxo luminoso do projetor não informado.'); r.phi = 1; }
  r.Fd = +a.fd > 0 ? +a.fd : 0.8; r.Fu = +a.fu > 0 ? +a.fu : 0.45;
  // método dos lúmens (fluxo): número de projetores necessário
  r.Nreq = r.Em * r.A / (r.phi * r.Fu * r.Fd);
  const lum = postesExt(a, r); r.N = lum.length; r.k = Math.max(1, Math.round(+a.k || 1)); r.nPostes = r.postes.length;
  r.Emed = r.N * r.phi * r.Fu * r.Fd / r.A;
  // método ponto a ponto: E = I(θ)·cos γ / d² = I(θ)·h / d³, com I(θ) = I0·cosᵐθ em torno do eixo de mira
  const I0 = r.phi * (r.m + 1) / (2 * Math.PI); r.I0 = I0;
  const d = Math.max(r.L, r.W), pg = Math.max(0.5, 0.2 * Math.pow(5, Math.log10(d)));
  const gx = Math.max(4, Math.min(40, Math.ceil(r.L / pg))), gy = Math.max(4, Math.min(40, Math.ceil(r.W / pg)));
  let emin = Infinity, emax = 0, esum = 0; const malha = [];
  for (let i = 0; i < gx; i++) { const lin = []; for (let j = 0; j < gy; j++) {
    const px = (i + 0.5) * r.L / gx, py = (j + 0.5) * r.W / gy; let E = 0;
    lum.forEach(q => { const vx = px - q.x, vy = py - q.y, vz = -r.h, dd = Math.sqrt(vx * vx + vy * vy + vz * vz), ct = (vx * q.ax + vy * q.ay + vz * q.az) / dd; if (ct > 0) E += I0 * Math.pow(ct, r.m) * r.h / (dd * dd * dd); });
    E *= r.Fd; lin.push(E); emin = Math.min(emin, E); emax = Math.max(emax, E); esum += E;
  } malha.push(lin); }
  r.malha = malha; r.gx = gx; r.gy = gy; r.passo = pg;
  r.EminPP = emin; r.EmaxPP = emax; r.EmedPP = esum / (gx * gy); r.U0 = emin / r.EmedPP; r.Ud = emin / emax;
  r.FuEf = r.EmedPP * r.A / (r.N * r.phi * r.Fd);
  r.P = r.N * r.Wlum; r.dens = r.P / r.A; r.VA = r.P / 0.95;
  // sugestão de quantidade para o arranjo escolhido: fluxo (método dos lúmens) e espaçamento máximo de 3 × h entre postes
  const nProj = Math.max(1, Math.ceil(r.Nreq - 1e-9)), smax = 3 * r.h; r.smax = smax;
  r.sugestao = a.arranjo === 'cantos' ? { k: Math.ceil(nProj / 4) }
    : a.arranjo === 'grade' ? (() => { const np = Math.ceil(nProj / r.k), nx = Math.max(Math.ceil(r.L / smax), Math.round(Math.sqrt(np * r.L / r.W)) || 1), ny = Math.max(Math.ceil(r.W / smax), Math.ceil(np / nx)); return { nx, ny }; })()
    : { n: Math.max(Math.ceil(r.L / smax), Math.ceil(nProj / r.k / (a.arranjo === 'lado' ? 1 : 2))) };
  // verificações
  if (+a.tilt > 70) r.avisos.push(`Inclinação de ${nfmt(+a.tilt, 0)}° em relação à vertical: acima de cerca de 70° o ofuscamento e a luz desperdiçada aumentam; prefira postes mais altos.`);
  const esp = a.arranjo === 'grade' ? Math.max(r.L / Math.max(1, Math.round(+a.nx || 1)), r.W / Math.max(1, Math.round(+a.ny || 1))) : a.arranjo === 'cantos' ? Math.max(r.L, r.W) : r.L / Math.max(1, Math.round(+a.n || 1));
  r.esp = esp; if (a.arranjo !== 'cantos' && esp > smax + 1e-6) r.avisos.push(`Espaçamento entre postes (${nfmt(esp, 1)} m) maior que 3 × a altura de montagem (${nfmt(smax, 1)} m): risco de baixa uniformidade.`);
  if (a.arranjo === 'lado' && r.W > 2 * r.h + 1e-6) r.avisos.push(`Área com ${nfmt(r.W, 1)} m de profundidade iluminada por um só lado (mais de 2 × h = ${nfmt(2 * r.h, 1)} m): considere postes nos dois lados ou mais altos.`);
  r.okEm = r.EmedPP + 1e-6 >= r.Em; r.okU0 = r.U0 + 1e-6 >= r.U0req;
  if (!r.okEm) r.falhas.push(`Iluminância média ponto a ponto ${nfmt(r.EmedPP, 0)} lx abaixo da exigida (${nfmt(r.Em, 0)} lx).`);
  if (!r.okU0) r.falhas.push(`Uniformidade Emín/Eméd = ${nfmt(r.U0, 2)} abaixo da exigida (${nfmt(r.U0req, 2)}).`);
  if (r.EmedPP > r.Em * 2) r.avisos.push(`Iluminância média ${nfmt(r.EmedPP, 0)} lx muito acima da exigida (${nfmt(r.Em, 0)} lx): reduza a potência ou a quantidade.`);
  if (Math.abs(r.FuEf - r.Fu) > 0.15) r.avisos.push(`Fator de utilização efetivo do ponto a ponto (${nfmt(r.FuEf, 2)}) difere do adotado no método dos lúmens (${nfmt(r.Fu, 2)}): ajuste o Fu ou a mira dos projetores.`);
  r.status = r.falhas.length ? 'fail' : (r.avisos.length ? 'warn' : 'ok');
  return r;
}
function calcLumiExt(proj) { const out = {}; (proj.lumiExt || []).forEach(a => { out[a.id] = calcAreaExt(a); }); return out; }

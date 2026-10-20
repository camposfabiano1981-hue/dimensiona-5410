/* ================================================================
   ATERRAMENTO — resistividade do solo, hastes, cabos e malhas
   ABNT NBR 7117-1:2020 (resistividade pelo método de Wenner e modelo do solo)
   ABNT NBR 5410:2004 (6.4 — aterramento; 5.1.2.2.4 — esquema TT)
   ABNT NBR 15751:2013 e IEEE Std 80-2013 (malhas: resistência, toque, passo, condutor)
   Energisa NDU 001 v7.0, 8.10 (R ≤ 20 Ω; hastes de 2,40 m espaçadas de 2,40 m)
   Kindermann & Campagnolo, Aterramento Elétrico (haste e resistência mútua entre hastes)
   ================================================================ */
const TIPOS_ATERR = {
  haste: 'Haste única', linha: 'Hastes alinhadas', triangulo: 'Hastes em triângulo', quadVazio: 'Hastes em quadrado vazio',
  quadCheio: 'Hastes em quadrado cheio', circ: 'Hastes em circunferência', cabo: 'Cabo horizontal enterrado (contrapeso)', malha: 'Malha de aterramento'
};
const TIPOS_HASTES = ['haste', 'linha', 'triangulo', 'quadVazio', 'quadCheio', 'circ'];
const FUNC_ATERR = {
  entrada: { nome: 'Padrão de entrada — neutro da concessionária', rmax: 20, ref: 'Energisa NDU 001 v7.0, 8.10: R ≤ 20 Ω em qualquer época do ano' },
  massas: { nome: 'Aterramento das massas / BEP', rmax: 10, ref: 'critério do projetista (NBR 5410, 6.4); no esquema TT, RA × IΔn ≤ 50 V' },
  spda: { nome: 'SPDA — subsistema de aterramento', rmax: 10, ref: 'NBR 5419-3: recomenda-se resistência da ordem de 10 Ω' },
  subestacao: { nome: 'Subestação / malha de terra', rmax: 10, ref: 'critério do projetista; segurança verificada por toque e passo (NBR 15751)' },
  outro: { nome: 'Outro', rmax: 10, ref: 'critério do projetista' }
};
const HASTES_COM = [
  ['h34-240', '3/4" × 2,40 m — aço cobreado (NDU 001)', 2.4, 17.3], ['h58-240', '5/8" × 2,40 m — aço cobreado', 2.4, 15.9],
  ['h58-300', '5/8" × 3,00 m — aço cobreado', 3.0, 15.9], ['h12-240', '1/2" × 2,40 m — aço cobreado', 2.4, 12.7]
];
/* diâmetro externo aproximado de cabos nus de cobre, classe 2 (mm) */
const DIAM_NU = { 16: 5.1, 25: 6.4, 35: 7.6, 50: 9.0, 70: 10.7, 95: 12.6, 120: 14.2, 150: 15.8, 185: 17.6, 240: 20.1, 300: 22.6 };
const SECOES_NU = Object.keys(DIAM_NU).map(Number);
/* constantes dos materiais — IEEE Std 80-2013, Tabela 1 (Ta = 40 °C) */
const MAT_TERRA = {
  cu: { nome: 'Cobre nu recozido (100 % IACS)', ar: 0.00393, K0: 234, Tm: 1083, rr: 1.72, tcap: 3.42 },
  cuDuro: { nome: 'Cobre nu meio-duro (97 % IACS)', ar: 0.00381, K0: 242, Tm: 1084, rr: 1.78, tcap: 3.42 },
  cuAco40: { nome: 'Aço cobreado 40 % IACS', ar: 0.00378, K0: 245, Tm: 1084, rr: 4.40, tcap: 3.85 },
  cuAco30: { nome: 'Aço cobreado 30 % IACS', ar: 0.00378, K0: 245, Tm: 1084, rr: 5.86, tcap: 3.85 },
  acoZn: { nome: 'Aço zincado', ar: 0.00320, K0: 293, Tm: 419, rr: 20.10, tcap: 3.93 }
};
/* resistividade típica de alguns solos — Kindermann & Campagnolo, Aterramento Elétrico (faixas da literatura;
   quando há faixa adota-se o limite superior, a favor da segurança). Sempre que possível, medir pelo método de Wenner. */
const SOLOS_TIPICOS = {
  lama: { nome: 'Lama / solo alagadiço', faixa: '5 a 100', rho: 100 },
  jardim50: { nome: 'Terra de jardim com 50 % de umidade', faixa: '140', rho: 140 },
  jardim20: { nome: 'Terra de jardim com 20 % de umidade', faixa: '480', rho: 480 },
  argila40: { nome: 'Argila com 40 % de umidade', faixa: '80', rho: 80 },
  argila20: { nome: 'Argila com 20 % de umidade', faixa: '330', rho: 330 },
  argilaSeca: { nome: 'Argila seca', faixa: '1.500 a 5.000', rho: 5000 },
  areiaMolhada: { nome: 'Areia molhada', faixa: '1.300', rho: 1300 },
  areiaSeca: { nome: 'Areia seca', faixa: '3.000 a 8.000', rho: 8000 },
  calcario: { nome: 'Calcário compacto', faixa: '1.000 a 5.000', rho: 5000 },
  granito: { nome: 'Granito', faixa: '1.500 a 10.000', rho: 10000 }
};
const CAIXAS_INSP = { todas: 'Uma caixa de inspeção em cada haste', primeira: 'Caixa de inspeção só na primeira haste (conexão do condutor)' };
const CONEXAO_TERRA = { solda: 'Solda exotérmica (temperatura de fusão do material)', compressao: 'Conector de compressão ou aparafusado (250 °C)' };
const POS_HASTES_MALHA = { nenhuma: 'Sem hastes', cantos: 'Nos 4 cantos', perimetro: 'Em todos os cruzamentos do perímetro', todos: 'Em todos os cruzamentos' };

function soloPadrao() {
  return { modo: 'tipico', tipoSolo: 'argila20', rho: 300, p: 0.20, media: 'geo', descartar: true, modelo: 'homog', fs: 1.0, local: '', data: '', equip: '', med: [] };
}
function arrPadrao(tipo = 'linha', funcao = 'massas') {
  return {
    id: uid(), nome: TIPOS_ATERR[tipo], tipo, funcao, rmax: FUNC_ATERR[funcao].rmax, haste: 'h34-240', L: 2.4, d: 17.3, n: 3, e: 2.4, m: 3, raio: 3,
    Lc: 20, hc: 0.5, S: 50, mat: 'cu', Lx: 20, Ly: 15, Nx: 4, Ny: 5, posH: 'perimetro', Lh: 2.4, dh: 17.3,
    Scond: 16, Lq: 5, caixas: 'todas',
    seg: tipo === 'malha', I3I0: 1500, sf: 100, xr: 5, tf: 0.5, tc: 1.0, brita: true, rhoS: 3000, hs: 0.10, peso: 50, conexao: 'solda', Smin: 50, rhoMan: null, obs: ''
  };
}
function aterrPadrao() { return { modo: 'simplificado', solo: soloPadrao(), arr: [] }; }

/* ---------- solo (NBR 7117-1) ---------- */
function rhoWenner(a, R, p) { const t = 1 + 2 * a / Math.sqrt(a * a + 4 * p * p) - a / Math.sqrt(a * a + p * p); return 4 * Math.PI * a * R / t; }
const mediaAr = v => v.reduce((s, x) => s + x, 0) / v.length;
const mediaGeo = v => Math.exp(v.reduce((s, x) => s + Math.log(x), 0) / v.length);
function rhoApar2c(a, r1, r2, h) {
  const K = (r2 - r1) / (r2 + r1); let s = 0;
  for (let n = 1; n <= 2000; n++) { const Kn = Math.pow(K, n); if (Math.abs(Kn) < 1e-7) break; const x = 2 * n * h / a; s += Kn / Math.sqrt(1 + x * x) - Kn / Math.sqrt(4 + x * x); }
  return r1 * (1 + 4 * s);
}
function nelderMead(f, x0, passo, it = 600) {
  const n = x0.length; let S = [x0, ...x0.map((_, i) => x0.map((v, j) => v + (i === j ? passo[j] : 0)))].map(x => ({ x, f: f(x) }));
  for (let k = 0; k < it; k++) {
    S.sort((a, b) => a.f - b.f);
    if (Math.abs(S[n].f - S[0].f) < 1e-10) break;
    const c = S.slice(0, n).reduce((acc, p) => acc.map((v, j) => v + p.x[j] / n), Array(n).fill(0));
    const mv = (t) => c.map((v, j) => v + t * (S[n].x[j] - v));
    const xr = mv(-1), fr = f(xr);
    if (fr < S[0].f) { const xe = mv(-2), fe = f(xe); S[n] = fe < fr ? { x: xe, f: fe } : { x: xr, f: fr }; }
    else if (fr < S[n - 1].f) S[n] = { x: xr, f: fr };
    else { const xc = mv(0.5), fc = f(xc); if (fc < S[n].f) S[n] = { x: xc, f: fc }; else S = S.map((p, i) => i ? { x: p.x.map((v, j) => S[0].x[j] + 0.5 * (v - S[0].x[j])), f: 0 } : p).map((p, i) => i ? { x: p.x, f: f(p.x) } : p); }
  }
  S.sort((a, b) => a.f - b.f); return S[0];
}
function calcSolo(S, simples = false) {
  const r = { modo: S.modo, fs: +S.fs > 0 ? +S.fs : 1, avisos: [], falhas: [], linhas: [], porA: [] };
  if (S.modo === 'tipico') {
    const t = SOLOS_TIPICOS[S.tipoSolo] || SOLOS_TIPICOS.argila20;
    r.tipo = t; r.rhoBase = t.rho; r.modelo = 'homog'; r.rho = r.rhoBase * r.fs;
    r.avisos.push(`Resistividade estimada pelo tipo de solo (${t.nome.toLowerCase()}: ${t.faixa} Ω·m). Confirme por medição de Wenner antes da execução.`);
    return r;
  }
  if (S.modo === 'direto') {
    r.rhoBase = +S.rho || 0; r.modelo = 'homog'; r.rho = r.rhoBase * r.fs;
    if (!(r.rhoBase > 0)) r.falhas.push('Informe a resistividade do solo.');
    return r;
  }
  const med = S.media === 'ar' ? mediaAr : mediaGeo, p = +S.p || 0;
  r.linhas = (S.med || []).filter(m => +m.a > 0 && +m.R > 0).map(m => ({ dir: m.dir || '', a: +m.a, R: +m.R, rho: rhoWenner(+m.a, +m.R, p) }));
  const grupos = {}; r.linhas.forEach(l => { (grupos[l.a.toFixed(3)] = grupos[l.a.toFixed(3)] || []).push(l); });
  r.porA = Object.values(grupos).sort((x, y) => x[0].a - y[0].a).map(g => {
    const m0 = med(g.map(l => l.rho));
    g.forEach(l => { l.desvio = (l.rho - m0) / m0; l.desc = !!S.descartar && Math.abs(l.desvio) > 0.5; });
    const ok = g.filter(l => !l.desc), v = ok.length ? ok : g;
    return { a: g[0].a, n: g.length, nDesc: g.length - ok.length, rho: med(v.map(l => l.rho)), min: Math.min(...g.map(l => l.rho)), max: Math.max(...g.map(l => l.rho)) };
  });
  if (!r.porA.length) { r.falhas.push('Informe as medições de Wenner (espaçamento e resistência lida) ou use a resistividade informada.'); r.rho = 0; r.modelo = 'homog'; return r; }
  const nd = r.linhas.filter(l => l.desc).length; if (nd) r.avisos.push(`${nd} medição(ões) com desvio superior a 50 % da média do espaçamento foram descartadas.`);
  r.rhoMed = med(r.porA.map(x => x.rho));
  r.rhoMinMax = (Math.min(...r.porA.map(x => x.rho)) + Math.max(...r.porA.map(x => x.rho))) / 2;
  r.modelo = !simples && S.modelo === '2c' && r.porA.length >= 3 ? '2c' : 'homog';
  if (!simples && S.modelo === '2c' && r.porA.length < 3) r.avisos.push('O modelo de duas camadas exige medições em pelo menos 3 espaçamentos; adotado solo homogêneo.');
  if (r.modelo === '2c') {
    const A = r.porA, amin = A[0].a, amax = A[A.length - 1].a;
    const erro = x => { const [r1, r2, h] = x.map(Math.exp); if (h < 0.05 || h > 3 * amax) return 1e9; return A.reduce((s, q) => { const d = Math.log(rhoApar2c(q.a, r1, r2, h) / q.rho); return s + d * d; }, 0); };
    let best = null;
    for (const hf of [0.5, 1, 2]) { const s = nelderMead(erro, [Math.log(A[0].rho), Math.log(A[A.length - 1].rho), Math.log(Math.sqrt(amin * amax) * hf)], [0.3, 0.3, 0.4]); if (!best || s.f < best.f) best = s; }
    const [r1, r2, h] = best.x.map(Math.exp);
    r.m2 = { rho1: r1, rho2: r2, h, K: (r2 - r1) / (r2 + r1), erro: 100 * Math.sqrt(best.f / A.length) };
    r.porA.forEach(q => { q.modelo = rhoApar2c(q.a, r1, r2, h); });
    if (r.m2.erro > 15) r.avisos.push(`Ajuste do modelo de duas camadas com desvio médio de ${nfmt(r.m2.erro, 1)} %: o solo pode exigir modelo com mais camadas (software de estratificação).`);
    r.rho = r.rhoMed * r.fs;
  } else r.rho = r.rhoMed * r.fs;
  return r;
}
/* resistividade equivalente vista por um eletrodo que alcança a profundidade d (Hummel — camadas em paralelo) */
function rhoHummel(m2, d) { return d <= m2.h ? m2.rho1 : d / (m2.h / m2.rho1 + (d - m2.h) / m2.rho2); }
function rhoArranjo(a, rs) {
  if (+a.rhoMan > 0) return { rho: +a.rhoMan, txt: 'resistividade informada para o arranjo' };
  if (!rs.m2 || rs.modelo !== '2c') return { rho: rs.rho, txt: rs.modo === 'tipico' ? `valor típico — ${rs.tipo.nome.toLowerCase()}` + (rs.fs !== 1 ? `, × ${nfmt(rs.fs, 2)} (fator sazonal)` : '') : rs.modo === 'direto' ? 'resistividade informada (solo homogêneo)' : `solo homogêneo — média ${rs.modo === 'wenner' ? 'das medições de Wenner' : ''}`.trim() + (rs.fs !== 1 ? `, × ${nfmt(rs.fs, 2)} (fator sazonal)` : '') };
  const m = rs.m2; let d, base;
  if (TIPOS_HASTES.includes(a.tipo)) { d = +a.L; base = `Hummel até a profundidade da haste (${nfmt(d, 2)} m)`; }
  else if (a.tipo === 'cabo') { const rho = (+a.hc <= m.h ? m.rho1 : m.rho2); return { rho: rho * rs.fs, txt: `camada onde o cabo está enterrado (${+a.hc <= m.h ? '1ª' : '2ª'} camada)${rs.fs !== 1 ? `, × ${nfmt(rs.fs, 2)} (fator sazonal)` : ''}` }; }
  else { d = Math.max(Math.sqrt((+a.Lx * +a.Ly) / Math.PI), a.posH !== 'nenhuma' ? +a.hc + +a.Lh : 0); base = `Hummel até a profundidade de influência da malha (${nfmt(d, 2)} m = maior entre o raio equivalente √(A/π) e a ponta das hastes)`; }
  return { rho: rhoHummel(m, d) * rs.fs, txt: base + (rs.fs !== 1 ? `, × ${nfmt(rs.fs, 2)} (fator sazonal)` : ''), d };
}

/* ---------- eletrodos ---------- */
const rHaste = (rho, L, d) => rho / (2 * Math.PI * L) * Math.log(4 * L / d);
function rMutua(rho, L, e) { const b = Math.sqrt(L * L + e * e); return rho / (4 * Math.PI * L) * Math.log(((b + L) ** 2 - e * e) / (e * e - (b - L) ** 2)); }
function posHastes(a) {
  const e = +a.e, n = Math.max(1, Math.round(+a.n || 1)), m = Math.max(2, Math.round(+a.m || 2));
  switch (a.tipo) {
    case 'haste': return [[0, 0]];
    case 'linha': return Array.from({ length: n }, (_, i) => [i * e, 0]);
    case 'triangulo': return [[0, 0], [e, 0], [e / 2, e * Math.sqrt(3) / 2]];
    case 'quadVazio': { const p = []; for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) if (i === 0 || j === 0 || i === m - 1 || j === m - 1) p.push([i * e, j * e]); return p; }
    case 'quadCheio': { const p = []; for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) p.push([i * e, j * e]); return p; }
    case 'circ': { const R = +a.raio; return Array.from({ length: n }, (_, i) => [R * Math.cos(2 * Math.PI * i / n), R * Math.sin(2 * Math.PI * i / n)]); }
  }
  return [];
}
function reqHastes(rho, L, d, pos) {
  const R1 = rHaste(rho, L, d);
  const Rh = pos.map((p, h) => pos.reduce((s, q, m) => s + (m === h ? R1 : rMutua(rho, L, Math.hypot(p[0] - q[0], p[1] - q[1]))), 0));
  return { R1, Rh, Req: 1 / Rh.reduce((s, x) => s + 1 / x, 0) };
}
const rCabo = (rho, L, d, h) => rho / (Math.PI * L) * (Math.log(2 * L / Math.sqrt(2 * (d / 2) * h)) - 1);
function secaoTermica(I_kA, tc, mat, conexao) {
  const M = MAT_TERRA[mat] || MAT_TERRA.cu, Tm = conexao === 'compressao' ? 250 : M.Tm;
  const fator = Math.sqrt((M.tcap * 1e-4) / (tc * M.ar * M.rr) * Math.log((M.K0 + Tm) / (M.K0 + 40)));
  return { A: I_kA / fator, Tm, fator };
}
function k12(x, hr) {
  const P = [[0, -0.04 * x + 1.41, 0.15 * x + 5.50], [0.1, -0.05 * x + 1.20, 0.10 * x + 4.68], [1 / 6, -0.05 * x + 1.13, -0.05 * x + 4.40]];
  if (hr <= 0) return [P[0][1], P[0][2]];
  for (let i = 1; i < P.length; i++) if (hr <= P[i][0]) { const t = (hr - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); return [P[i - 1][1] + t * (P[i][1] - P[i - 1][1]), P[i - 1][2] + t * (P[i][2] - P[i - 1][2])]; }
  return [P[2][1], P[2][2]];
}
function posHastesMalha(a, Dx, Dy, Nx, Ny) {
  const p = [], cols = Ny, rows = Nx;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const borda = i === 0 || j === 0 || i === cols - 1 || j === rows - 1, canto = (i === 0 || i === cols - 1) && (j === 0 || j === rows - 1);
    if (a.posH === 'todos' || (a.posH === 'perimetro' && borda) || (a.posH === 'cantos' && canto)) p.push([i * Dx, j * Dy]);
  }
  return p;
}
function calcMalha(a, rho, r) {
  const Lx = +a.Lx, Ly = +a.Ly, Nx = Math.max(2, Math.round(+a.Nx)), Ny = Math.max(2, Math.round(+a.Ny)), h = +a.hc;
  const Dy = Ly / (Nx - 1), Dx = Lx / (Ny - 1), D = Math.max(Dx, Dy), d = (DIAM_NU[+a.S] || Math.sqrt(4 * +a.S / Math.PI) * 1.13) / 1000;
  const LC = Nx * Lx + Ny * Ly, A = Lx * Ly, Lp = 2 * (Lx + Ly), pos = posHastesMalha(a, Dx, Dy, Nx, Ny), nR = pos.length, Lr = +a.Lh, LR = nR * Lr, b = +a.dh / 2000;
  Object.assign(r, { Lx, Ly, Nx, Ny, Dx, Dy, D, d, LC, A, Lp, pos, nR, Lr, LR, h, LT: LC + LR });
  r.Rsverak = rho * (1 / (LC + LR) + 1 / Math.sqrt(20 * A) * (1 + 1 / (1 + h * Math.sqrt(20 / A))));
  const x = Math.max(Lx, Ly) / Math.min(Lx, Ly), [k1, k2] = k12(x, h / Math.sqrt(A)), aP = Math.sqrt((d / 2) * 2 * h);
  r.sch = { x, k1, k2, aP };
  r.sch.R1 = rho / (Math.PI * LC) * (Math.log(2 * LC / aP) + k1 * LC / Math.sqrt(A) - k2);
  if (nR) {
    r.sch.R2 = rho / (2 * Math.PI * nR * Lr) * (Math.log(4 * Lr / b) - 1 + 2 * k1 * Lr / Math.sqrt(A) * (Math.sqrt(nR) - 1) ** 2);
    r.sch.Rm = rho / (Math.PI * LC) * (Math.log(2 * LC / Lr) + k1 * LC / Math.sqrt(A) - k2 + 1);
    r.sch.Rg = (r.sch.R1 * r.sch.R2 - r.sch.Rm ** 2) / (r.sch.R1 + r.sch.R2 - 2 * r.sch.Rm);
  } else r.sch.Rg = r.sch.R1;
  r.metodoR = nR && r.sch.Rg > 0 ? 'Schwarz' : 'Sverak';
  r.R = r.metodoR === 'Schwarz' ? r.sch.Rg : r.Rsverak;
  if (h < 0.25 || h > 2.5) r.avisos.push('Profundidade da malha fora da faixa de validade das equações da IEEE 80 (0,25 m a 2,5 m).');
  if (!a.seg) return;
  // segurança — NBR 15751:2013 / IEEE Std 80-2013
  const ts = +a.tf, kc = +a.peso === 70 ? 0.157 : 0.116, Ta = (+a.xr || 0) / (2 * Math.PI * 60);
  r.Df = Ta > 0 ? Math.sqrt(1 + Ta / ts * (1 - Math.exp(-2 * ts / Ta))) : 1;
  r.IG = r.Df * (+a.sf / 100) * +a.I3I0; r.GPR = r.IG * r.R;
  const rhoS = a.brita ? +a.rhoS : rho; r.Cs = a.brita ? 1 - 0.09 * (1 - rho / rhoS) / (2 * +a.hs + 0.09) : 1; r.rhoS = rhoS; r.kc = kc;
  r.Etoque = (1000 + 1.5 * r.Cs * rhoS) * kc / Math.sqrt(ts); r.Epasso = (1000 + 6 * r.Cs * rhoS) * kc / Math.sqrt(ts);
  const na = 2 * LC / Lp, nb = Math.sqrt(Lp / (4 * Math.sqrt(A))), n = na * nb, hastesBorda = nR > 0 && a.posH !== 'nenhuma';
  const Kii = hastesBorda ? 1 : 1 / Math.pow(2 * n, 2 / n), Kh = Math.sqrt(1 + h / 1);
  const Km = 1 / (2 * Math.PI) * (Math.log(D * D / (16 * h * d) + (D + 2 * h) ** 2 / (8 * D * d) - h / (4 * d)) + Kii / Kh * Math.log(8 / (Math.PI * (2 * n - 1))));
  const Ki = 0.644 + 0.148 * n, LM = hastesBorda ? LC + (1.55 + 1.22 * (Lr / Math.sqrt(Lx * Lx + Ly * Ly))) * LR : LC + LR;
  const Ks = 1 / Math.PI * (1 / (2 * h) + 1 / (D + h) + 1 / D * (1 - Math.pow(0.5, n - 2))), LS = 0.75 * LC + 0.85 * LR;
  Object.assign(r, { na, nb, n, Kii, Kh, Km, Ki, LM, Ks, LS, Em: rho * Km * Ki * r.IG / LM, Es: rho * Ks * Ki * r.IG / LS });
  r.okGPR = r.GPR <= r.Etoque; r.okToque = r.Em <= r.Etoque; r.okPasso = r.Es <= r.Epasso;
  if (n > 25 || D < 2.5 || d > 0.25 * h) r.avisos.push('Geometria fora dos limites das equações simplificadas da IEEE 80 (n ≤ 25, D ≥ 2,5 m, d < 0,25 h): confirme com software de malha.');
  if (Math.max(Dx, Dy) / Math.min(Dx, Dy) > 1.5) r.avisos.push(`Espaçamentos diferentes nas duas direções (${nfmt(Dx, 2)} m × ${nfmt(Dy, 2)} m): adotado o maior (D = ${nfmt(D, 2)} m), a favor da segurança.`);
  const IF = r.Df * +a.I3I0 / 1000, sec = secaoTermica(IF, +a.tc, a.mat, a.conexao);
  r.cond = { IF, ...sec, Smin: +a.Smin || 0 }; r.cond.Sreq = Math.max(sec.A, r.cond.Smin); r.cond.ok = +a.S >= r.cond.Sreq;
  if (!r.okToque) r.falhas.push(`Tensão de toque de malha Em = ${nfmt(r.Em, 0)} V acima da admissível (${nfmt(r.Etoque, 0)} V): reduza o espaçamento, aumente a malha, acrescente hastes no perímetro ou use camada de brita mais resistiva.`);
  if (!r.okPasso) r.falhas.push(`Tensão de passo Es = ${nfmt(r.Es, 0)} V acima da admissível (${nfmt(r.Epasso, 0)} V).`);
  if (!r.cond.ok) r.falhas.push(`Condutor de ${a.S} mm² abaixo da seção exigida (${nfmt(r.cond.Sreq, 1)} mm²).`);
}
function calcArranjo(a, rs, proj, calc) {
  const r = { avisos: [], falhas: [], tipo: a.tipo, funcao: a.funcao };
  const ra = rhoArranjo(a, rs); r.rho = ra.rho; r.rhoTxt = ra.txt;
  if (!(r.rho > 0)) { r.falhas.push('Resistividade do solo não definida.'); r.status = 'fail'; r.R = NaN; return r; }
  if (TIPOS_HASTES.includes(a.tipo)) {
    const L = +a.L, d = +a.d / 1000; r.pos = posHastes(a); r.nH = r.pos.length;
    Object.assign(r, reqHastes(r.rho, L, d, r.pos)); r.R = r.Req; r.K = r.Req / r.R1;
    if (r.nH > 1) { const e = Math.min(...r.pos.flatMap((p, i) => r.pos.slice(i + 1).map(q => Math.hypot(p[0] - q[0], p[1] - q[1])))); r.eMin = e; if (e < L - 1e-6) r.avisos.push(`Espaçamento entre hastes (${nfmt(e, 2)} m) menor que o comprimento da haste (${nfmt(L, 2)} m): as zonas de influência se sobrepõem e o ganho com hastes adicionais é pequeno.`); }
    if (+a.rmax > 0) { r.nMin = null; for (let k = 1; k <= 60; k++) { const q = reqHastes(r.rho, L, d, Array.from({ length: k }, (_, i) => [i * (+a.e || L), 0])); if (q.Req <= +a.rmax) { r.nMin = k; r.nMinR = q.Req; break; } } }
  } else if (a.tipo === 'cabo') {
    r.dCabo = (DIAM_NU[+a.S] || Math.sqrt(4 * +a.S / Math.PI) * 1.13) / 1000; r.R = rCabo(r.rho, +a.Lc, r.dCabo, +a.hc);
  } else calcMalha(a, r.rho, r);
  r.rmax = +a.rmax || 0;
  if (a.funcao === 'massas' && proj.params.aterramento === 'TT') {
    const idn = Math.max(0, ...proj.circuitos.map(c => calc.res[c.id]).filter(x => x && x.drUsado).map(x => +x.idn || 0));
    if (idn > 0) { r.tt = { idn, RAmax: 50 / (idn / 1000) }; if (r.R * idn / 1000 > 50) r.falhas.push(`Esquema TT: RA × IΔn = ${nfmt(r.R * idn / 1000, 1)} V > 50 V.`); }
  }
  if (a.funcao === 'entrada') {
    const ce = calc.energisa && Object.values(calc.energisa.ucs || {})[0], cat = ce && ce.cat;
    if (cat) { r.ndu = { hastes: cat.hastes, aterr: cat.aterr, cat: cat.cat }; if (TIPOS_HASTES.includes(a.tipo) && r.nH < cat.hastes) r.falhas.push(`A NDU 001 exige no mínimo ${cat.hastes} haste(s) para a categoria ${cat.cat}.`); }
    if (TIPOS_HASTES.includes(a.tipo) && r.nH > 1 && r.eMin < 2.4 - 1e-6) r.avisos.push('A NDU 001 (8.10) pede hastes distanciadas entre si de 2,40 m.');
  }
  r.okR = !(r.rmax > 0) || r.R <= r.rmax;
  if (!r.okR) r.falhas.push(`Resistência calculada ${nfmt(r.R, 2)} Ω acima do limite de ${nfmt(r.rmax, 1)} Ω${r.nMin ? ` — com hastes alinhadas espaçadas de ${nfmt(+a.e || +a.L, 2)} m seriam necessárias ${r.nMin} hastes (${nfmt(r.nMinR, 2)} Ω)` : ''}.`);
  r.status = r.falhas.length ? 'fail' : (r.avisos.length ? 'warn' : 'ok');
  return r;
}
/* comprimento do cabo nu que interliga as hastes (m) */
function caboInterligacao(a, r) {
  const e = +a.e, n = r.nH, m = Math.round(+a.m);
  switch (a.tipo) {
    case 'linha': return (n - 1) * e;
    case 'triangulo': return 3 * e;
    case 'quadVazio': return 4 * (m - 1) * e;
    case 'quadCheio': return 2 * m * (m - 1) * e;
    case 'circ': return n < 2 ? 0 : (n === 2 ? 2 * +a.raio : n * 2 * +a.raio * Math.sin(Math.PI / n));
  }
  return 0;
}
/* complementos dos arranjos de hastes: resistência em função do nº de hastes alinhadas e lista de materiais */
function complementosHastes(a, r) {
  const L = +a.L, d = +a.d / 1000, e = +a.e || L, nMax = Math.min(30, Math.max(8, r.nH + 2, (r.nMin || 0) + 1));
  r.serie = Array.from({ length: nMax }, (_, i) => ({ n: i + 1, R: reqHastes(r.rho, L, d, Array.from({ length: i + 1 }, (_, k) => [k * e, 0])).Req }));
  r.Lcabo = caboInterligacao(a, r);
  const S = +a.Scond || 16, haste = (HASTES_COM.find(h => h[0] === a.haste) || [])[1] || `${nfmt(L, 2)} m × Ø ${nfmt(+a.d, 1)} mm`;
  r.materiais = [
    ['Haste de aterramento aço-cobreada (NBR 13571) — ' + haste.replace(/ — aço cobreado.*$/, ''), r.nH, 'un'],
    ['Conector cabo–haste (cunha, grampo ou solda exotérmica)', r.nH, 'un'],
    ['Caixa de inspeção de aterramento com tampa', a.caixas === 'primeira' ? 1 : r.nH, 'un'],
    ...(r.Lcabo > 0 ? [[`Cabo de cobre nu ${S} mm² — interligação das hastes (enterrado a ${nfmt(+a.hc, 2)} m)`, +r.Lcabo.toFixed(1), 'm']] : []),
    ...(+a.Lq > 0 ? [[`Condutor de aterramento ${S} mm² — da primeira haste ao quadro / BEP`, +(+a.Lq).toFixed(1), 'm'], ['Eletroduto de proteção do condutor de aterramento', +(+a.Lq).toFixed(1), 'm']] : [])
  ];
}
function calcAterramento(proj, calc) {
  const T = proj.aterr || aterrPadrao(), simples = T.modo !== 'completo';
  const solo = calcSolo(T.solo || soloPadrao(), simples), arr = {};
  (T.arr || []).forEach(a => {
    if (simples && !TIPOS_HASTES.includes(a.tipo)) { arr[a.id] = { excluido: true, status: 'off', avisos: [], falhas: [], R: NaN, rmax: +a.rmax || 0 }; return; }
    const r = arr[a.id] = calcArranjo(a, solo, proj, calc);
    if (TIPOS_HASTES.includes(a.tipo) && r.rho > 0) complementosHastes(a, r);
  });
  const lista = Object.values(arr).filter(x => !x.excluido);
  return { simples, solo, arr, status: solo.falhas.length || lista.some(x => x.status === 'fail') ? 'fail' : (lista.some(x => x.status === 'warn') || solo.avisos.length ? 'warn' : 'ok') };
}

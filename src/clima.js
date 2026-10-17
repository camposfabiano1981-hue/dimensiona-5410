/* ================================================================
   CARGA TÉRMICA DE CLIMATIZAÇÃO
   ABNT NBR 16401-1:2024 (projeto), NBR 16401-2:2024 (conforto térmico),
   NBR 16401-3:2008 (qualidade do ar — vigente após a suspensão da edição 2024),
   NBR 15220-2 (propriedades térmicas de componentes)
   Cálculo horário do dia de projeto: ganhos instantâneos + condução periódica nas camadas.
   ================================================================ */
const MESES_C = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
/* modelo de céu claro ASHRAE (Fundamentals 1997, cap. 29): A (W/m²), B, C — dia 21 de cada mês */
const ASHRAE_ABC = [[1202, 0.141, 0.103], [1187, 0.142, 0.104], [1164, 0.149, 0.109], [1130, 0.164, 0.120], [1106, 0.177, 0.130], [1092, 0.185, 0.137], [1093, 0.186, 0.138], [1107, 0.182, 0.134], [1136, 0.165, 0.121], [1166, 0.152, 0.111], [1190, 0.144, 0.106], [1204, 0.141, 0.103]];
const DIA_21 = [21, 52, 80, 111, 141, 172, 202, 233, 264, 294, 325, 355];
/* fração da amplitude diária (ASHRAE), horas solares 1 a 24 */
const FRAC_AMP = [0.87, 0.92, 0.96, 0.99, 1.00, 0.98, 0.93, 0.84, 0.71, 0.56, 0.39, 0.23, 0.11, 0.03, 0.00, 0.03, 0.10, 0.21, 0.34, 0.47, 0.58, 0.68, 0.76, 0.82];
const ORIENT = { N: ['Norte', 0], NE: ['Nordeste', 45], L: ['Leste', 90], SE: ['Sudeste', 135], S: ['Sul', 180], SO: ['Sudoeste', 225], O: ['Oeste', 270], NO: ['Noroeste', 315], H: ['Horizontal (cobertura)', null] };
/* materiais — valores típicos da NBR 15220-2 (Tabela B.3); blocos vazados como camada equivalente */
const MAT_C = {
  reboco: { nome: 'Argamassa (reboco/contrapiso)', lam: 1.15, rho: 2000, c: 1.00 },
  tijMac: { nome: 'Tijolo cerâmico maciço', lam: 0.90, rho: 1700, c: 0.92 },
  blocoCer: { nome: 'Bloco cerâmico vazado — camada equivalente', lam: 0.47, rho: 710, c: 0.92 },
  blocoCon: { nome: 'Bloco de concreto vazado — camada equivalente', lam: 1.00, rho: 1100, c: 1.00 },
  concreto: { nome: 'Concreto armado', lam: 1.75, rho: 2400, c: 1.00 },
  gesso: { nome: 'Placa de gesso', lam: 0.35, rho: 900, c: 0.84 },
  madeira: { nome: 'Madeira / compensado', lam: 0.15, rho: 600, c: 1.34 },
  eps: { nome: 'Poliestireno expandido (EPS)', lam: 0.040, rho: 15, c: 1.42 },
  la: { nome: 'Lã de vidro / lã de rocha', lam: 0.045, rho: 40, c: 0.70 },
  pu: { nome: 'Poliuretano rígido', lam: 0.030, rho: 35, c: 1.67 },
  telhaCer: { nome: 'Telha cerâmica', lam: 1.05, rho: 2000, c: 0.92 },
  fibro: { nome: 'Telha de fibrocimento', lam: 0.95, rho: 1900, c: 0.84 },
  aco: { nome: 'Aço (telha metálica)', lam: 55, rho: 7800, c: 0.46 },
  pvc: { nome: 'Forro de PVC', lam: 0.20, rho: 1300, c: 0.96 },
  arH: { nome: 'Câmara de ar não ventilada > 5 cm (fluxo horizontal)', R: 0.17 },
  arD: { nome: 'Câmara de ar não ventilada > 5 cm (fluxo descendente)', R: 0.21 }
};
const L_ = (mat, e) => ({ mat, e });
function consPadrao() {
  return [
    { id: 'pTij6', nome: 'Parede de bloco cerâmico vazado rebocada (14 cm)', tipo: 'parede', cam: [L_('reboco', 2.5), L_('blocoCer', 9), L_('reboco', 2.5)] },
    { id: 'pTijMac', nome: 'Parede de tijolo maciço rebocada (15 cm)', tipo: 'parede', cam: [L_('reboco', 2.5), L_('tijMac', 10), L_('reboco', 2.5)] },
    { id: 'pBloco', nome: 'Parede de bloco de concreto rebocada (19 cm)', tipo: 'parede', cam: [L_('reboco', 2.5), L_('blocoCon', 14), L_('reboco', 2.5)] },
    { id: 'pConc', nome: 'Parede de concreto maciço (10 cm)', tipo: 'parede', cam: [L_('concreto', 10)] },
    { id: 'pDry', nome: 'Divisória de gesso acartonado com câmara de ar', tipo: 'parede', cam: [L_('gesso', 1.25), L_('arH', 7), L_('gesso', 1.25)] },
    { id: 'cTelhaLaje', nome: 'Telha cerâmica + câmara de ar + laje maciça 10 cm', tipo: 'cobertura', cam: [L_('telhaCer', 1), L_('arD', 20), L_('concreto', 10), L_('reboco', 1.5)] },
    { id: 'cFibroForro', nome: 'Telha de fibrocimento + câmara de ar + forro de PVC', tipo: 'cobertura', cam: [L_('fibro', 0.6), L_('arD', 20), L_('pvc', 1)] },
    { id: 'cFibro', nome: 'Telha de fibrocimento sem forro', tipo: 'cobertura', cam: [L_('fibro', 0.6)] },
    { id: 'cLaje', nome: 'Laje maciça 10 cm exposta (impermeabilizada)', tipo: 'cobertura', cam: [L_('reboco', 2), L_('concreto', 10), L_('reboco', 1.5)] },
    { id: 'cSand', nome: 'Telha metálica sanduíche com EPS 30 mm', tipo: 'cobertura', cam: [L_('aco', 0.05), L_('eps', 3), L_('aco', 0.05)] },
    { id: 'cTelhaLajeLa', nome: 'Telha cerâmica + câmara + lã de vidro 50 mm + laje 10 cm', tipo: 'cobertura', cam: [L_('telhaCer', 1), L_('arD', 20), L_('la', 5), L_('concreto', 10), L_('reboco', 1.5)] }
  ];
}
const VIDROS = {
  simples: { nome: 'Vidro simples incolor 4 a 6 mm', U: 5.7, FS: 0.86 },
  laminado: { nome: 'Vidro laminado incolor 8 mm', U: 5.6, FS: 0.77 },
  verde: { nome: 'Vidro simples verde 6 mm', U: 5.7, FS: 0.62 },
  refletivo: { nome: 'Vidro refletivo / controle solar', U: 5.4, FS: 0.45 },
  pelicula: { nome: 'Vidro simples com película de controle solar', U: 5.6, FS: 0.45 },
  duplo: { nome: 'Vidro duplo incolor (câmara 12 mm)', U: 2.8, FS: 0.75 },
  duploBE: { nome: 'Vidro duplo com baixo emissivo', U: 1.8, FS: 0.40 }
};
const SOMBRA = { nenhuma: ['Sem proteção', 1.0], cortinaClara: ['Cortina ou persiana interna clara', 0.65], cortinaEscura: ['Cortina ou persiana interna escura', 0.80], blackout: ['Blackout interno claro', 0.55], brise: ['Brise / marquise externa (sombreamento parcial)', 0.50], toldo: ['Toldo ou veneziana externa', 0.25] };
const ABSORT = { clara: ['Branca / muito clara', 0.30], media: ['Cor média (bege, cinza claro)', 0.50], escura: ['Escura (cinza escuro, verde)', 0.70], telha: ['Telha cerâmica', 0.75], preta: ['Preta / asfáltica', 0.90] };
/* ângulo de incidência → razão FS(θ)/FS(0) para vidro simples incolor (ASHRAE, vidro 1a) */
const ANG_FS = [[0, 1], [40, 0.977], [50, 0.953], [60, 0.907], [70, 0.779], [80, 0.488], [90, 0]];
const FS_DIFUSO = 0.907;
/* calor liberado por pessoas — ASHRAE Fundamentals (valores ajustados), reproduzidos na NBR 16401-1 */
const ATIV_P = {
  teatro: ['Sentado em teatro / cinema', 65, 30], sentadoLeve: ['Sentado, trabalho muito leve (escritório, residência, hotel)', 70, 45], escritorio: ['Trabalho de escritório moderado', 75, 55],
  emPe: ['Em pé, trabalho leve; andando (loja, comércio)', 75, 55], banco: ['Andando, em pé (farmácia, banco)', 75, 70], restaurante: ['Trabalho sedentário (restaurante)', 80, 80],
  bancada: ['Trabalho leve em bancada (fábrica)', 80, 140], danca: ['Dança moderada', 90, 160], maquina: ['Andando 4,8 km/h; trabalho leve com máquinas', 110, 185],
  pesado: ['Trabalho pesado; boliche', 170, 255], academia: ['Atividade atlética (academia)', 210, 315]
};
/* ar exterior — valores de referência por pessoa (Fp) e por área (Fa), nível 1; confira na Tabela 1 da NBR 16401-3:2008 */
const AR_EXT = {
  nenhum: ['Sem ar exterior mecânico', 0, 0], residencia: ['Residência — sala, quarto, escritório', 2.5, 0.3], escritorio: ['Escritório', 2.5, 0.3], reuniao: ['Sala de reunião / recepção', 2.5, 0.3],
  aula: ['Sala de aula', 5.0, 0.6], auditorio: ['Auditório', 2.5, 0.3], restaurante: ['Restaurante / refeitório', 3.8, 0.9], loja: ['Loja / área de vendas', 3.8, 0.6],
  academia: ['Academia', 10.0, 0.3], biblioteca: ['Biblioteca', 2.5, 0.6], hotel: ['Dormitório de hotel', 2.5, 0.3], consultorio: ['Consultório / sala de exames', 2.5, 0.3], custom: ['Informado pelo projetista', null, null]
};
const CAP_SPLIT = [7000, 9000, 12000, 18000, 22000, 24000, 30000, 36000, 48000, 55000, 60000];
const BTU_W = 3.412142, W_TR = 3516.85;

/* ---------- psicrometria (ASHRAE Fundamentals, cap. 1) ---------- */
const pAtm = z => 101.325 * Math.pow(1 - 2.25577e-5 * z, 5.2559); // kPa
function pws(t) { const T = t + 273.15; return Math.exp(-5.8002206e3 / T + 1.3914993 - 4.8640239e-2 * T + 4.1764768e-5 * T * T - 1.4452093e-8 * T * T * T + 6.5459673 * Math.log(T)) / 1000; } // kPa
const Wsat = (t, p) => 0.621945 * pws(t) / (p - pws(t));
function WdeTBU(t, tw, p) { const ws = Wsat(tw, p); return ((2501 - 2.326 * tw) * ws - 1.006 * (t - tw)) / (2501 + 1.86 * t - 4.186 * tw); }
function WdeUR(t, ur, p) { const pw = ur / 100 * pws(t); return 0.621945 * pw / (p - pw); }
const URdeW = (t, W, p) => 100 * (p * W / (0.621945 + W)) / pws(t);
const entalpia = (t, W) => 1.006 * t + W * (2501 + 1.86 * t);
const rhoAr = (t, W, p) => p / (0.287042 * (t + 273.15) * (1 + 1.607858 * W)); // kg ar seco/m³
function TBUdeW(t, W, p) { let lo = -10, hi = t; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (WdeTBU(t, m, p) > W) hi = m; else lo = m; } return (lo + hi) / 2; }
function orvalho(W, p) { const pw = p * W / (0.621945 + W); let lo = -20, hi = 50; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (pws(m) > pw) hi = m; else lo = m; } return (lo + hi) / 2; }

/* ---------- conforto térmico: PMV/PPD (ISO 7730 / ASHRAE 55) ---------- */
function pmvPPD(ta, tr, vel, ur, met, clo, wme = 0) {
  const pa = ur * 10 * Math.exp(16.6536 - 4030.183 / (ta + 235));
  const icl = 0.155 * clo, m = met * 58.15, w = wme * 58.15, mw = m - w;
  const fcl = icl <= 0.078 ? 1 + 1.29 * icl : 1.05 + 0.645 * icl;
  const hcf = 12.1 * Math.sqrt(Math.max(vel, 0)), taa = ta + 273, tra = tr + 273;
  const tcla = taa + (35.5 - ta) / (3.5 * icl + 0.1);
  const p1 = icl * fcl, p2 = p1 * 3.96, p3 = p1 * 100, p4 = p1 * taa, p5 = 308.7 - 0.028 * mw + p2 * Math.pow(tra / 100, 4);
  let xn = tcla / 100, xf = tcla / 50, hc = hcf, n = 0;
  while (Math.abs(xn - xf) > 0.00015 && n < 200) { xf = (xf + xn) / 2; const hcn = 2.38 * Math.pow(Math.abs(100 * xf - taa), 0.25); hc = Math.max(hcf, hcn); xn = (p5 + p4 * hc - p2 * Math.pow(xf, 4)) / (100 + p3 * hc); n++; }
  const tcl = 100 * xn - 273;
  const hl1 = 3.05e-3 * (5733 - 6.99 * mw - pa), hl2 = mw > 58.15 ? 0.42 * (mw - 58.15) : 0, hl3 = 1.7e-5 * m * (5867 - pa), hl4 = 0.0014 * m * (34 - ta);
  const hl5 = 3.96 * fcl * (Math.pow(xn, 4) - Math.pow(tra / 100, 4)), hl6 = fcl * hc * (tcl - ta);
  const ts = 0.303 * Math.exp(-0.036 * m) + 0.028, pmv = ts * (mw - hl1 - hl2 - hl3 - hl4 - hl5 - hl6);
  return { pmv, ppd: 100 - 95 * Math.exp(-0.03353 * Math.pow(pmv, 4) - 0.2179 * pmv * pmv), tcl };
}

/* ---------- propriedades de componentes (NBR 15220-2) ---------- */
function propsCons(cons) {
  const roof = cons.tipo === 'cobertura', Rsi = roof ? 0.17 : 0.13, Rse = 0.04;
  let R = 0, CT = 0;
  (cons.cam || []).forEach(l => { const m = MAT_C[l.mat]; if (!m) return; if (m.R != null) R += m.R; else { R += (l.e / 100) / m.lam; CT += (l.e / 100) * m.rho * m.c; } });
  return { Rsi, Rse, Rt: R + Rsi + Rse, U: 1 / (R + Rsi + Rse), CT };
}

/* ---------- geometria solar e radiação (ASHRAE 1997, céu claro) ---------- */
function solHora(lat, mes, hs) {
  const n = DIA_21[mes], dec = 23.45 * Math.sin(2 * Math.PI * (284 + n) / 365) * Math.PI / 180, L = lat * Math.PI / 180, H = 15 * (hs - 12) * Math.PI / 180;
  const sU = Math.sin(L) * Math.sin(dec) + Math.cos(L) * Math.cos(dec) * Math.cos(H), sE = -Math.cos(dec) * Math.sin(H), sN = Math.cos(L) * Math.sin(dec) - Math.sin(L) * Math.cos(dec) * Math.cos(H);
  return { sU, sE, sN, beta: Math.asin(Math.max(-1, Math.min(1, sU))) };
}
function irradiancia(clima, orient, hs) {
  const [A, B, C] = ASHRAE_ABC[clima.mes], s = solHora(clima.lat, clima.mes, hs), rg = clima.rhoSolo ?? 0.2;
  if (s.sU <= 0.0005) return { Et: 0, ED: 0, Ed: 0, cos: 0, beta: s.beta };
  const EDN = (clima.cn || 1) * A / Math.exp(B / s.sU);
  let cos, Ed, Er;
  if (orient === 'H') { cos = s.sU; Ed = C * EDN; Er = 0; }
  else { const az = ORIENT[orient][1] * Math.PI / 180; cos = Math.sin(az) * s.sE + Math.cos(az) * s.sN; const Y = cos > -0.2 ? 0.55 + 0.437 * cos + 0.313 * cos * cos : 0.45; Ed = C * Y * EDN; Er = EDN * (C + s.sU) * rg * 0.5; }
  const ED = EDN * Math.max(0, cos);
  return { Et: ED + Ed + Er, ED, Ed: Ed + Er, cos: Math.max(0, cos), beta: s.beta };
}
function tempExt(clima, h) { return clima.tbs - clima.amp * FRAC_AMP[(h + 23) % 24]; } // h = hora solar 1..24 → índice
function fsAngular(cosTh) { const th = Math.acos(Math.min(1, Math.max(0, cosTh))) * 180 / Math.PI; for (let i = 1; i < ANG_FS.length; i++) if (th <= ANG_FS[i][0]) { const [a0, f0] = ANG_FS[i - 1], [a1, f1] = ANG_FS[i]; return f0 + (f1 - f0) * (th - a0) / (a1 - a0); } return 0; }

/* ---------- condução em regime periódico: diferenças finitas (Crank-Nicolson) ---------- */
const _cacheCond = new Map();
function conducaoPeriodica(cons, Te, Ti) {
  const key = JSON.stringify([cons.cam, cons.tipo, Te.map(x => +x.toFixed(3)), Ti]);
  if (_cacheCond.has(key)) return _cacheCond.get(key);
  const P = propsCons(cons), hi = 1 / P.Rsi, ho = 1 / P.Rse;
  const cel = [], Rgap = []; let rPend = 0;
  (cons.cam || []).forEach(l => { const m = MAT_C[l.mat]; if (!m) return; if (m.R != null) { rPend += m.R; return; } const e = l.e / 100, n = Math.max(2, Math.ceil(e / 0.01)), dx = e / n; for (let k = 0; k < n; k++) { cel.push({ dx, lam: m.lam, C: m.rho * m.c * 1000 * dx }); Rgap.push(k === 0 ? rPend : 0); } rPend = 0; });
  let out;
  if (!cel.length) { out = Te.map(t => (t - Ti) / P.Rt); }
  else {
    const N = cel.length, G = new Array(N + 1);
    G[0] = 1 / (1 / ho + Rgap[0] + cel[0].dx / (2 * cel[0].lam));
    for (let i = 1; i < N; i++) G[i] = 1 / (cel[i - 1].dx / (2 * cel[i - 1].lam) + Rgap[i] + cel[i].dx / (2 * cel[i].lam));
    G[N] = 1 / (cel[N - 1].dx / (2 * cel[N - 1].lam) + rPend + 1 / hi);
    const dt = 300, passos = 3600 / dt, T = new Float64Array(N).fill((Te.reduce((a, b) => a + b, 0) / 24 + Ti) / 2);
    const a = new Float64Array(N), b = new Float64Array(N), c = new Float64Array(N), d = new Float64Array(N), cp = new Float64Array(N), dp = new Float64Array(N);
    const teAt = s => { const hf = (s * dt / 3600) % 24, i0 = Math.floor(hf), f = hf - i0; return Te[i0] + (Te[(i0 + 1) % 24] - Te[i0]) * f; };
    const res = new Array(24).fill(0), dias = 8;
    for (let s = 0; s < dias * 24 * passos; s++) {
      const te0 = teAt(s), te1 = teAt(s + 1);
      for (let i = 0; i < N; i++) {
        const Gw = G[i], Ge = G[i + 1], k = cel[i].C / dt;
        a[i] = i > 0 ? -0.5 * Gw : 0; c[i] = i < N - 1 ? -0.5 * Ge : 0; b[i] = k + 0.5 * (Gw + Ge);
        const Tw = i > 0 ? T[i - 1] : te0, Tee = i < N - 1 ? T[i + 1] : Ti;
        d[i] = k * T[i] + 0.5 * (Gw * (Tw - T[i]) + Ge * (Tee - T[i]));
        if (i === 0) d[i] += 0.5 * Gw * te1; if (i === N - 1) d[i] += 0.5 * Ge * Ti;
      }
      cp[0] = c[0] / b[0]; dp[0] = d[0] / b[0];
      for (let i = 1; i < N; i++) { const m = b[i] - a[i] * cp[i - 1]; cp[i] = c[i] / m; dp[i] = (d[i] - a[i] * dp[i - 1]) / m; }
      T[N - 1] = dp[N - 1]; for (let i = N - 2; i >= 0; i--) T[i] = dp[i] - cp[i] * T[i + 1];
      const tt = s + 1; if (tt >= (dias - 1) * 24 * passos && tt % passos === 0) res[(tt / passos) % 24] = G[N] * (T[N - 1] - Ti);
    }
    out = res;
  }
  // índice 0 = 0 h (= 24 h); reorganiza para horas 1..24
  const q = Array.from({ length: 24 }, (_, i) => out[(i + 1) % 24]);
  const tmax = Te.indexOf(Math.max(...Te)), qmax = q.indexOf(Math.max(...q)), teM = Te.reduce((x, y) => x + y, 0) / 24, qM = q.reduce((x, y) => x + y, 0) / 24;
  const r = { q, atraso: ((qmax - ((tmax + 23) % 24)) + 24) % 24, fd: (Math.max(...q) - qM) / Math.max(1e-9, P.U * (Math.max(...Te) - teM)) };
  if (_cacheCond.size > 400) _cacheCond.clear();
  _cacheCond.set(key, r);
  return r;
}

/* ---------- dados padrão ---------- */
function climaPadrao() {
  return { cidade: '', uf: 'MS', lat: -20.47, alt: 530, mes: 0, freq: '1%', tbs: 34, tbu: 24, amp: 11, rhoSolo: 0.2, cn: 1, fonte: '', tint: 24, urInt: 50, vel: 0.10, met: 1.1, clo: 0.57, trm: null, margem: 10, cop: 3.2,
    cons: consPadrao(), amb: [] };
}
function ambClimaPadrao(i = 1) {
  return { id: uid(), nome: `Ambiente ${i}`, area: 12, pd: 2.7, pessoas: 2, ativ: 'sentadoLeve', hIni: 8, hFim: 18, ilumWm2: 8, lumiId: '', equip: [], infil: 0.5, arExt: 'residencia', fp: null, fa: null, env: [], obs: '' };
}
function envPadrao(tipo = 'parede') { return { tipo, orient: tipo === 'cobertura' ? 'H' : 'N', area: 10, cons: tipo === 'cobertura' ? 'cTelhaLaje' : 'pTij6', cor: tipo === 'cobertura' ? 'telha' : 'media', vidro: 'simples', sombra: 'cortinaClara', dT: 3 }; }

/* ---------- cálculo de um ambiente (perfil horário) ---------- */
function calcAmbClima(a, C, proj, calc) {
  const r = { avisos: [], falhas: [] }, p = pAtm(+C.alt || 0), Ti = +C.tint;
  r.p = p; r.Wo = WdeTBU(+C.tbs, +C.tbu, p); r.Wi = WdeUR(Ti, +C.urInt, p); r.rho = rhoAr(Ti, r.Wi, p);
  const H = Array.from({ length: 24 }, (_, i) => i + 1), To = H.map(h => tempExt(C, h));
  const cons = Object.fromEntries((C.cons || []).map(k => [k.id, k]));
  const comp = {}; const add = (k, h, s, l = 0) => { comp[k] = comp[k] || { s: new Array(24).fill(0), l: new Array(24).fill(0) }; comp[k].s[h] += s; comp[k].l[h] += l; };
  r.env = [];
  (a.env || []).forEach((e, i) => {
    const A = Math.max(0, +e.area || 0); if (!A) return;
    if (e.tipo === 'janela') {
      const v = VIDROS[e.vidro] || VIDROS.simples, fsh = (SOMBRA[e.sombra] || SOMBRA.nenhuma)[1];
      const qs = H.map(h => { const I = irradiancia(C, e.orient, h); return A * v.FS * fsh * (I.ED * fsAngular(I.cos) + I.Ed * FS_DIFUSO); });
      const qc = H.map((h, j) => A * v.U * (To[j] - Ti));
      qs.forEach((q, j) => add('Insolação em vidros', j, q)); qc.forEach((q, j) => add('Condução em vidros', j, q));
      r.env.push({ i, e, A, U: v.U, FS: v.FS, fsh, qmax: Math.max(...qs.map((q, j) => q + qc[j])) });
    } else if (e.tipo === 'divisoria' || e.tipo === 'piso') {
      const k = cons[e.cons]; if (!k) { r.falhas.push(`Elemento ${i + 1}: construção não encontrada.`); return; }
      const P = propsCons(k), dT = +e.dT || 0;
      H.forEach((h, j) => add(e.tipo === 'piso' ? 'Piso / laje sobre espaço não condicionado' : 'Divisórias com ambientes não condicionados', j, A * P.U * dT));
      r.env.push({ i, e, A, U: P.U, CT: P.CT, qmax: A * P.U * dT });
    } else {
      const k = cons[e.cons]; if (!k) { r.falhas.push(`Elemento ${i + 1}: construção não encontrada.`); return; }
      const orient = e.tipo === 'cobertura' ? 'H' : e.orient, alpha = (ABSORT[e.cor] || ABSORT.media)[1], ho = 17, dR = orient === 'H' ? 3.9 : 0;
      const Te = H.map((h, j) => To[j] + alpha * irradiancia(C, orient, h).Et / ho - dR);
      const cp = conducaoPeriodica({ ...k, tipo: e.tipo === 'cobertura' ? 'cobertura' : 'parede' }, Te, Ti), P = propsCons({ ...k, tipo: e.tipo === 'cobertura' ? 'cobertura' : 'parede' });
      cp.q.forEach((q, j) => add(e.tipo === 'cobertura' ? 'Cobertura' : 'Paredes externas', j, A * q));
      r.env.push({ i, e, A, U: P.U, CT: P.CT, alpha, atraso: cp.atraso, fd: cp.fd, Temax: Math.max(...Te), qmax: Math.max(...cp.q) * A });
    }
  });
  // cargas internas (no horário de ocupação)
  const ocup = h => { const i0 = +a.hIni, i1 = +a.hFim; return i0 <= i1 ? (h > i0 && h <= i1) : (h > i0 || h <= i1); };
  const at = ATIV_P[a.ativ] || ATIV_P.sentadoLeve, np = Math.max(0, +a.pessoas || 0);
  let Wil = (+a.ilumWm2 || 0) * (+a.area || 0); r.ilumFonte = `${nfmt(+a.ilumWm2 || 0, 1)} W/m² × ${nfmt(+a.area || 0, 2)} m²`;
  if (a.lumiId && calc && calc.lumi && calc.lumi[a.lumiId]) { const amb = (proj.lumi || []).find(x => x.id === a.lumiId); Wil = calc.lumi[a.lumiId].P; r.ilumFonte = `luminotécnica: ${amb ? amb.nome : ''} (${nfmt(Wil, 0)} W)`; }
  r.Wil = Wil; r.Weq = (a.equip || []).reduce((s, x) => s + (+x.qtd || 0) * (+x.W || 0) * ((x.fu ?? 1) * 1), 0); r.WeqL = (a.equip || []).reduce((s, x) => s + (+x.qtd || 0) * (+x.WL || 0), 0);
  H.forEach((h, j) => { if (!ocup(h)) return; add('Pessoas', j, np * at[1], np * at[2]); add('Iluminação', j, Wil); add('Equipamentos', j, r.Weq, r.WeqL); });
  // ar exterior (NBR 16401-3:2008: Vef = Pz·Fp + Az·Fa) e infiltração
  const ae = AR_EXT[a.arExt] || AR_EXT.nenhum, Fp = a.arExt === 'custom' ? (+a.fp || 0) : (+a.fp > 0 ? +a.fp : ae[1]), Fa = a.arExt === 'custom' ? (+a.fa || 0) : (+a.fa > 0 ? +a.fa : ae[2]);
  r.Fp = Fp; r.Fa = Fa; r.Vef = np * Fp + (+a.area || 0) * Fa; // L/s
  r.Vinf = (+a.infil || 0) * (+a.area || 0) * (+a.pd || 0) / 3.6; // L/s
  const cpa = 1.006 + 1.86 * r.Wi, hfg = 2501;
  H.forEach((h, j) => {
    const dT = To[j] - Ti, dW = Math.max(0, r.Wo - r.Wi);
    if (ocup(h) && r.Vef > 0) add('Ar exterior (NBR 16401-3)', j, r.rho * r.Vef / 1000 * cpa * dT * 1000, r.rho * r.Vef / 1000 * hfg * dW * 1000);
    if (r.Vinf > 0) add('Infiltração', j, r.rho * r.Vinf / 1000 * cpa * dT * 1000, r.rho * r.Vinf / 1000 * hfg * dW * 1000);
  });
  // totais horários
  r.comp = comp; r.To = To;
  r.S = H.map((h, j) => Object.values(comp).reduce((s, c) => s + c.s[j], 0)); r.L = H.map((h, j) => Object.values(comp).reduce((s, c) => s + c.l[j], 0));
  r.T = r.S.map((s, j) => s + r.L[j]);
  r.jPico = r.T.indexOf(Math.max(...r.T)); r.hPico = r.jPico + 1;
  r.Qs = r.S[r.jPico]; r.Ql = r.L[r.jPico]; r.Q = r.T[r.jPico]; r.FCS = r.Q > 0 ? r.Qs / r.Q : 1;
  r.Qproj = r.Q * (1 + (+C.margem || 0) / 100);
  r.BTU = r.Qproj * BTU_W; r.TR = r.Qproj / W_TR; r.kcal = r.Qproj * 0.859845; r.Wm2 = (+a.area || 0) > 0 ? r.Q / (+a.area) : 0;
  r.picoComp = Object.entries(comp).map(([k, c]) => ({ k, s: c.s[r.jPico], l: c.l[r.jPico] })).filter(x => Math.abs(x.s) + Math.abs(x.l) > 0.5);
  // vazão de insuflamento (ΔT de insuflamento 10 K) e equipamento
  r.Vins = r.Qs / (r.rho * cpa * 10) ; // L/s
  const cap = CAP_SPLIT.find(c => c + 1e-6 >= r.BTU);
  if (cap) { r.equip = { n: 1, cap }; }
  else { const n = Math.ceil(r.BTU / 60000); const c2 = CAP_SPLIT.find(c => c * n + 1e-6 >= r.BTU) || 60000; r.equip = { n, cap: c2 }; r.avisos.push(`Carga acima de 60.000 BTU/h: ${n} equipamentos de ${nfmt(c2, 0)} BTU/h ou sistema central (VRF, self-contained ou água gelada).`); }
  r.Pel = r.equip.n * r.equip.cap / BTU_W / (+C.cop || 3.2);
  if (r.FCS < 0.7) r.avisos.push(`Fator de calor sensível ${nfmt(r.FCS, 2)}: carga latente elevada — verifique a capacidade sensível do equipamento e a desumidificação.`);
  if (!(a.env || []).length) r.avisos.push('Ambiente sem elementos da envoltória (paredes, cobertura, janelas) — apenas cargas internas foram consideradas.');
  if (+a.infil > 0 && r.Vef > 0) r.avisos.push('Com ar exterior mecânico, o ambiente fica pressurizado: avalie zerar a infiltração.');
  r.status = r.falhas.length ? 'fail' : (r.avisos.length ? 'warn' : 'ok');
  return r;
}
function calcClima(proj, calc) {
  const C = proj.clima; if (!C) return null;
  const out = { C, amb: {}, avisos: [] };
  const p = pAtm(+C.alt || 0); out.p = p; out.Wo = WdeTBU(+C.tbs, +C.tbu, p); out.URo = URdeW(+C.tbs, out.Wo, p); out.ho = entalpia(+C.tbs, out.Wo);
  out.Wi = WdeUR(+C.tint, +C.urInt, p); out.hi = entalpia(+C.tint, out.Wi); out.TBUi = TBUdeW(+C.tint, out.Wi, p); out.orvalhoI = orvalho(out.Wi, p);
  if (+C.tbu > +C.tbs) out.avisos.push('TBU maior que TBS: confira os dados climáticos.');
  const tr = C.trm != null && C.trm !== '' ? +C.trm : +C.tint;
  out.conf = pmvPPD(+C.tint, tr, +C.vel, +C.urInt, +C.met, +C.clo); out.trm = tr;
  out.confOK = Math.abs(out.conf.pmv) <= 0.5 + 1e-9;
  (C.amb || []).forEach(a => { out.amb[a.id] = calcAmbClima(a, C, proj, calc); });
  const R = Object.values(out.amb);
  out.T = Array.from({ length: 24 }, (_, j) => R.reduce((s, r) => s + r.T[j], 0)); out.jPico = out.T.indexOf(Math.max(...out.T));
  out.Qsimult = out.T[out.jPico] || 0; out.Qsoma = R.reduce((s, r) => s + r.Q, 0);
  return out;
}

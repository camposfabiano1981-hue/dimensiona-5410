/* ================================================================
   MOTOR DE CÁLCULO — ABNT NBR 5410:2004. Sem dependência de DOM.
   ================================================================ */
const FREQ = 60;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const nfmt = (v, d = 2) => (v == null || !isFinite(v)) ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const fS = S => S == null ? '—' : String(S).replace('.', ',');
const secoesDe = mat => mat === 'Al' ? SECOES_AL : SECOES_CU;
function secaoPE(S, mat = 'Cu') {
  if (S <= 16) return S; if (S <= 35) return 16;
  const h = S / 2; return secoesDe(mat).find(x => x >= h - 1e-9) || S;
}
function nFases(lig) { return { FN: 1, FF: 2, FFN: 2, FFF: 3, FFFN: 3 }[lig] || 1; }
function temNeutro(lig) { return lig === 'FN' || lig === 'FFN' || lig === 'FFFN'; }
function idx42(n) { if (n <= 8) return n - 1; if (n <= 11) return 8; if (n <= 15) return 9; if (n <= 19) return 10; return 11; }
function fca42(ref, n) { const a = T42[ref] || T42[1]; return a[Math.min(idx42(n), a.length - 1)]; }
function refsAgrup(ref) { if (ref === 'C') return [1, 2, 3]; if (ref === 'E' || ref === 'F') return [1, 4, 5]; if (ref === 'G' || ref === 'D') return []; return [1]; }
function refEfetivo(met, tipoCabo, vde) {
  if (met.ref === 'EF') return tipoCabo === 'multipolar' ? 'E' : 'F';
  if (met.vde) return vde === 'alto' ? 'B1' : 'B2';
  return met.ref;
}
function linhaTab(tab, n) { const ks = Object.keys(tab).map(Number).sort((a, b) => a - b); const k = ks.find(x => x >= n) ?? ks[ks.length - 1]; return { k, v: tab[k] }; }
function catVal(cat, path, def) { const v = cat && cat[path]; return (v != null && isFinite(v) && v > 0) ? +v : def; }
function diamCondutor(cat, tipo, S, nVias) {
  if (tipo === 'multipolar') { const n = clamp(nVias || 3, 2, 5); return catVal(cat, `multipolar.${n}.${S}`, DIAM.multipolar[n][S] ?? null); }
  if (tipo === 'isolado' && DIAM.isolado[S] == null) return catVal(cat, `unipolar.${S}`, DIAM.unipolar[S] ?? null);
  return catVal(cat, `${tipo}.${S}`, DIAM[tipo][S] ?? null);
}
function itensEletroduto(cat, tipo) { const E = ELETRODUTOS[tipo] || ELETRODUTOS.pvc_rigido; return E.itens.map(it => ({ ...it, di: catVal(cat, `eletro.${tipo}.${it.dn}`, it.di) })); }

function capacidade(mat, isol, ref, nCarr, arrF, arrG, S) {
  const g = grupoIsol(isol);
  if (COLS_ABCD.includes(ref)) {
    const t = (g === 'PVC' ? T36 : T37)[mat]; const i = COLS_ABCD.indexOf(ref) * 2 + (nCarr === 2 ? 0 : 1);
    return { Ic: t[S] ? t[S][i] : null, tabela: g === 'PVC' ? '36' : '37', col: `método ${ref}, ${nCarr} condutores carregados` };
  }
  const t = (g === 'PVC' ? T38 : T39)[mat]; let i, col;
  if (ref === 'E') { i = nCarr === 2 ? 0 : 1; col = `método E (cabo multipolar), ${nCarr} condutores carregados`; }
  else if (ref === 'F') {
    if (nCarr === 2) { i = 2; col = 'método F, 2 cabos unipolares justapostos'; }
    else if (arrF === 'plano') { i = 4; col = 'método F, 3 cabos unipolares justapostos em plano'; }
    else { i = 3; col = 'método F, 3 cabos unipolares em trifólio'; }
  } else { i = arrG === 'vertical' ? 6 : 5; col = `método G, cabos unipolares espaçados (${arrG === 'vertical' ? 'vertical' : 'horizontal'})`; }
  return { Ic: t[S] ? t[S][i] : null, tabela: g === 'PVC' ? '38' : '39', col };
}
function fatorTemp(temp, isol, solo) {
  const temps = Object.keys(T40).map(Number).sort((a, b) => a - b);
  let tt = temps.find(t => t >= temp - 1e-9); if (temp < 10) tt = 10;
  if (tt == null) return { f: null, tt: null };
  return { f: T40[tt][(solo ? 2 : 0) + (grupoIsol(isol) === 'PVC' ? 0 : 1)], tt };
}
function r20De(mat, classe, S) { if (mat === 'Al') return R20.Al2[S]; return (+classe === 2 ? R20.Cu2[S] : (R20.Cu5[S] ?? R20.Cu2[S])); }

/* Resistência em CA e reatância indutiva (guia, itens 6.3 e 6.4 — método da IEC 60287) */
function impedancia(o) {
  const { mat, classe, isol, S, nCarr, D, gmd } = o;
  const R0 = r20De(mat, classe, S), th = THETA(isol), alfa = ALFA[mat];
  const Rl = R0 * (1 + alfa * (th - 20));
  const xs2 = 8 * Math.PI * FREQ / Rl * 1e-4, xs4 = xs2 * xs2, ys = xs4 / (192 + 0.8 * xs4);
  const kp = mat === 'Al' ? 0.8 : 1, xp2 = xs2 * kp, xp4 = xp2 * xp2, fp = xp4 / (192 + 0.8 * xp4);
  const dc = 1.2 * Math.sqrt(S), s = Math.max(D, dc * 1.05), q = dc / s;
  const yp = nCarr === 2 ? fp * q * q * 2.9 : fp * q * q * (0.312 * q * q + 1.18 / (fp + 0.27));
  const R = Rl * (1 + ys + yp);
  const g = Math.max(gmd, dc * 0.55);
  const L = 0.05 + 0.2 * Math.log(2 * g / dc);
  const X = 2 * Math.PI * FREQ * L * 1e-3;
  return { R0, Rl, ys, yp, R, X, L, dc, s, gmd: g, alfa, th };
}

function potencias(c) {
  const v = +c.pot || 0, fp = clamp(+c.fp || 1, 0.05, 1);
  const mult = { W: 1, kW: 1000, VA: 1, kVA: 1000, cv: 735.5, HP: 745.7 };
  const m = mult[c.unid] || 1;
  if (c.tipo === 'motor') { const eta = clamp(+c.rend || 1, 0.05, 1); const Pmec = v * m; const P = Pmec / eta; return { P, S: P / fp, fp, Pmec, eta }; }
  if (c.unid === 'VA' || c.unid === 'kVA') { const S = v * m; return { P: S * fp, S, fp }; }
  const P = v * m; return { P, S: P / fp, fp };
}

/* DR de alta sensibilidade — 5.1.3.2.2 */
function motivoDR(c, P, In) {
  if (P.aterramento === 'TT') return 'esquema TT — o seccionamento automático deve ser assegurado por dispositivo DR';
  if (c.tipo === 'dist' || c.tipo === 'controle') return null;
  const tomada = c.tipo === 'tug' || c.tipo === 'tue', ate32 = tomada && In <= 32, isentaIlum = c.tipo === 'ilum' && c.lumAlta;
  switch (c.local) {
    case 'banheiro': return isentaIlum ? null : 'alínea a) — ponto de utilização situado em local contendo banheira ou chuveiro';
    case 'externa': return ate32 ? 'alínea b) — tomada de corrente situada em área externa à edificação' : null;
    case 'internoExt': return ate32 ? 'alínea c) — tomada em área interna que pode alimentar equipamento no exterior' : null;
    case 'cozinha': case 'servico': case 'garagem': case 'molhada': {
      const nomes = { cozinha: 'cozinha/copa-cozinha', servico: 'área de serviço/lavanderia', garagem: 'garagem', molhada: 'dependência interna molhada ou sujeita a lavagem' };
      if (P.edificacao === 'residencial') { if (isentaIlum) return null; if (tomada && !ate32) return null; return `alínea d) — ponto de utilização em ${nomes[c.local]} de local de habitação`; }
      return ate32 ? `alínea e) — ponto de tomada em ${nomes[c.local]} de edificação não residencial` : null;
    }
  }
  return null;
}

function paramsPadrao() {
  return {
    sistema: '127/220', U0: 127, U: 220, fornecimento: 'trifasico', aterramento: 'TN-S', RA: 30, edificacao: 'residencial',
    origem: 'entrega', dvTotal: 5, dvTerminal: 4, dvDist: 1, supLongo: true, tempAmb: 30, tempSolo: 20, classe: 5,
    material: 'Cu', isolacao: 'PVC', tipoCabo: 'isolado', metodo: '7', tipoEletroduto: 'pvc_rigido', eletrodutoMin: '1/2"',
    dispositivo: 'disj_60898', curva: 'C', inMin: 10, icc: 3, icn: 6, icn947: 25, verifCC: true, verifPE: true, classe3: true, tCC: 0.02,
    im947: 10, cosPartida: 0.35, secMaxPar: 240, fdPadrao: 1
  };
}
let _uid = 0;
function uid() { _uid++; return 'c' + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 6) + _uid; }
function defaultsCircuito(P, tipo = 'tug') {
  const c = {
    id: uid(), num: '', desc: '', quadro: 'QD-1', tipo, local: 'seco', ligacao: 'FN', fases: 'A', pot: 1000, unid: 'VA', fp: 0.8,
    rend: 0.8, fs: 1, ipIn: 6, L: 15, material: P.material || 'Cu', tipoCabo: P.tipoCabo || 'isolado', isolacao: P.isolacao || 'PVC', metodo: P.metodo || '7', vde: 'baixo',
    arranjoF: 'trifolio', arranjoG: 'horizontal', temp: null, resistSolo: 2.5, prof: 0.7, trecho: '', agrupAuto: true, nAgrup: 1, refAgrup: 1,
    camadas: 1, porCamada: 2, agrupD: 'mesmo', espD: 0, fctManual: null, fcaManual: null, pe: true, neutroReduzido: false, harmonicas: false,
    nPar: null, dispositivo: P.dispositivo || 'disj_60898', curva: P.curva || 'C', inManual: null, icnManual: null, i2tManual: null,
    dr: 'auto', drTipo: 'IDR', idn: 30, lumAlta: false, secaoManual: null, dvMax: null, alimenta: '', demandaAuto: true, potLumi: false, obs: ''
  };
  if (tipo === 'ilum') Object.assign(c, { unid: 'VA', fp: 0.92, pot: 600 });
  if (tipo === 'tue') Object.assign(c, { unid: 'W', fp: 1, pot: 1500 });
  if (tipo === 'controle') Object.assign(c, { unid: 'VA', fp: 1, pot: 100, ligacao: 'FN' });
  if (tipo === 'motor') Object.assign(c, { unid: 'cv', fp: 0.85, rend: 0.8, pot: 1, ligacao: 'FFF', fases: 'ABC', fs: 1, curva: 'D' });
  if (tipo === 'dist') Object.assign(c, { unid: 'VA', fp: 0.92, pot: 10000, ligacao: 'FFFN', fases: 'ABC', demandaAuto: true });
  return c;
}

/* ============== DIMENSIONAMENTO DE UM CIRCUITO ============== */
function dimensionar(c, ctx) {
  if (c.nPar > 0) return dimN(c, ctx, Math.round(+c.nPar), false);
  let ult = null;
  const lim = Math.min(+ctx.P.secMaxPar || 1000, c.tipoCabo === 'multipolar' ? 300 : 1000);
  for (let n = 1; n <= 8; n++) {
    const r = dimN(c, ctx, n, true); ult = r;
    if (r.reqs.every(q => q.S != null) && r.Sf <= lim) { if (n > 1) r.avisos.push(`Seção acima de ${fS(lim)} mm² por condutor: adotados ${n} condutores em paralelo por fase (paralelismo automático).`); return r; }
  }
  return ult;
}
function dimN(c, ctx, nPar, auto) {
  const P = ctx.P, pw = ctx.pot, cat = ctx.cat;
  const r = { id: c.id, avisos: [], falhas: [], reqs: [], nPar, nParAuto: auto };
  const U0 = +P.U0, U = +P.U, lig = c.ligacao, mat = c.material === 'Al' ? 'Al' : 'Cu', isol = ISOL[c.isolacao] ? c.isolacao : 'PVC';
  const SECS = secoesDe(mat);
  r.mat = mat; r.isol = isol;
  Object.assign(r, { P: pw.P, S: pw.S, fp: pw.fp, Pmec: pw.Pmec, eta: pw.eta, potAuto: !!pw.auto, dem: pw.dem, potLumi: pw.lumi || null });
  if (pw.ciclo) r.falhas.push('Alimentação circular entre quadros — revise os campos "Quadro" e "Alimenta o quadro".');
  const fasesOK = { monofasico: ['FN'], bifasico: ['FN', 'FF', 'FFN'], trifasico: ['FN', 'FF', 'FFN', 'FFF', 'FFFN'] }[P.fornecimento] || [];
  if (!fasesOK.includes(lig)) r.falhas.push(`Ligação ${esquemaTxt(lig, c.pe)} incompatível com fornecimento ${P.fornecimento}.`);

  // Alumínio (6.2.3.8)
  if (mat === 'Al') {
    if (P.edificacao === 'residencial') r.falhas.push('Condutores de alumínio não são permitidos em instalações residenciais (6.2.3.8).');
    if (P.edificacao === 'publica') r.falhas.push('Condutores de alumínio não são permitidos em locais BD4 de afluência de público (6.2.3.8).');
    if (P.edificacao === 'industrial') { if (P.origem === 'entrega') r.falhas.push('Alumínio em instalação industrial exige alimentação por subestação, transformador ou fonte própria (6.2.3.8).'); r.avisos.push('Alumínio: instalação e manutenção por pessoas qualificadas e seção ≥ 16 mm² (6.2.3.8).'); }
    if (P.edificacao === 'comercial') r.avisos.push('Alumínio em instalação comercial: seção ≥ 50 mm², locais exclusivamente BD1 e manutenção por pessoas qualificadas (6.2.3.8).');
    if (c.tipo === 'controle') r.falhas.push('Circuitos de sinalização e controle devem ser de cobre (Tabela 47).');
  }

  // 1. Corrente de projeto
  let I;
  switch (lig) {
    case 'FN': r.V = U0; r.Vref = U0; I = r.S / U0; break;
    case 'FF': r.V = U; r.Vref = U; I = r.S / U; break;
    case 'FFN': r.V = U; r.Vref = U0; I = r.S / (2 * U0); break;
    default: r.V = U; r.Vref = U; I = r.S / (Math.sqrt(3) * U);
  }
  r.Icarga = I; r.fs = c.tipo === 'motor' ? Math.max(1, +c.fs || 1) : 1; r.IB = I * r.fs;
  if (!(r.IB > 0)) r.falhas.push('Potência nula ou inválida.');

  // 2. Linha elétrica
  const met = MET[c.metodo] || MET['7']; r.met = met;
  const ref = refEfetivo(met, c.tipoCabo, c.vde); r.ref = ref; r.vde = met.vde ? (c.vde === 'alto' ? 'alto' : 'baixo') : null;
  if (!met.tipos.includes(c.tipoCabo)) {
    if (c.tipoCabo === 'isolado') r.falhas.push(`Condutores isolados não são admitidos na maneira de instalar nº ${met.id} (Tabela 33): só em condutos fechados ou sobre isoladores (6.2.11.1).`);
    else r.falhas.push(`A maneira de instalar nº ${met.id} (Tabela 33) não se aplica a ${TIPO_CABO[c.tipoCabo]}.`);
  }
  r.conduto = condutoDe(met, c.tipoCabo);
  r.nCarr = (lig === 'FN' || lig === 'FF') ? 2 : 3;
  r.harm = lig === 'FFFN' && !!c.harmonicas; r.fh = r.harm ? 0.86 : 1;
  const Ic = S => capacidade(mat, isol, ref, r.nCarr, c.arranjoF, c.arranjoG, S);
  const cap0 = Ic(SECS[Math.min(4, SECS.length - 1)]); r.tabCap = cap0.tabela; r.colCap = cap0.col;

  // 3. Temperatura, solo e profundidade
  const solo = ref === 'D'; r.solo = solo;
  r.temp = (c.temp != null && c.temp !== '') ? +c.temp : (solo ? +P.tempSolo : +P.tempAmb);
  if (c.fctManual > 0) { r.FCT = +c.fctManual; r.fctFonte = 'valor informado pelo projetista'; }
  else {
    const f = fatorTemp(r.temp, isol, solo);
    if (f.f == null) { r.falhas.push(`Temperatura de ${r.temp} °C acima do limite da Tabela 40 para isolação ${ISOL[isol]}.`); r.FCT = 1; r.fctFonte = 'Tabela 40 — fora da faixa'; }
    else { r.FCT = f.f; r.tempTab = f.tt; r.fctFonte = `Tabela 40 — ${solo ? 'temperatura do solo' : 'temperatura ambiente'} ${nfmt(r.temp, 0)} °C${f.tt !== r.temp ? ` (linha de ${f.tt} °C)` : ''}, isolação ${grupoIsol(isol) === 'PVC' ? (isol === 'LSHF' ? 'LSHF/A' : 'PVC') : 'EPR/XLPE'}`; }
  }
  r.FCR = 1; r.FCP = 1;
  if (solo) {
    const tipoSolo = met.enterrado === 'direto' ? 'direto' : 'duto';
    const rs = +c.resistSolo || 2.5; r.resistSolo = rs; r.tipoSolo = tipoSolo;
    const ks = Object.keys(T41[tipoSolo]).map(Number).sort((a, b) => a - b); const k = ks.find(x => x >= rs - 1e-9);
    if (k == null) { r.FCR = T41[tipoSolo][3]; r.avisos.push('Resistividade térmica do solo acima de 3 K·m/W: fora da Tabela 41; adotado o fator de 3 K·m/W — avaliar estudo específico (IEC 60287).'); }
    else r.FCR = T41[tipoSolo][k];
    r.fcrFonte = `Tabela 41 — ${tipoSolo === 'direto' ? 'cabos diretamente enterrados' : 'cabos em dutos enterrados'}, resistividade ${nfmt(rs, 1)} K·m/W${k != null && k !== rs ? ` (coluna de ${nfmt(k, 1)} K·m/W)` : ''}`;
    const pr = +c.prof || 0.7; r.prof = pr;
    if (pr > 0.7 + 1e-9) { r.FCP = Math.max(0.5, 1 - Math.round((Math.min(pr, 2) - 0.7) * 100) / 1000); if (pr > 2) r.avisos.push('Profundidade acima de 2 m: a regra prática de 1 % a cada 10 cm vale até 2 m — avaliar pela IEC 60287.'); }
    r.fcpFonte = `profundidade de ${nfmt(pr, 2)} m (tabelas para 0,7 m; redução de 1 % a cada 10 cm adicionais, até 2 m)`;
  }

  // 4. Agrupamento
  const tr = (c.trecho || '').trim();
  const proprio = c.nPar > 0 ? Math.round(+c.nPar) : 1;
  r.nAgrup = c.agrupAuto ? (tr ? Math.max(1, (ctx.nTrecho[tr] || proprio) - proprio + nPar) : nPar) : Math.max(1, Math.round(+c.nAgrup || 1)) + (nPar - 1);
  const n = r.nAgrup;
  if (c.fcaManual > 0) { r.FCA = +c.fcaManual; r.fcaFonte = 'valor informado pelo projetista'; }
  else if (ref === 'G') { r.FCA = 1; r.fcaFonte = 'cabos espaçados (método G) — sem redução por agrupamento'; }
  else if (c.refAgrup === 'dif' && n > 1) { r.FCA = 1 / Math.sqrt(n); r.fcaFonte = `cabos de seções diferentes no agrupamento — F = 1/√n = 1/√${n} (6.2.5.5.5)`; }
  else if (ref === 'D') {
    if (n <= 1) { r.FCA = 1; r.fcaFonte = 'circuito único na linha enterrada'; }
    else if (c.agrupD === 'eletrodutos' || c.agrupD === 'direto') {
      const isD = c.agrupD === 'direto'; const tab = isD ? T44 : (c.tipoCabo === 'multipolar' ? T45M : T45U);
      const esp = clamp(+c.espD || 0, 0, isD ? 4 : 3); const L = linhaTab(tab, n);
      if (n > 20) r.avisos.push(`Tabela ${isD ? 44 : 45} cobre até 20 circuitos; adotado o fator de 20 — confirmar pela IEC 60287.`);
      r.FCA = L.v[esp];
      r.fcaFonte = `Tabela ${isD ? 44 : 45} — ${n} circuito${n > 1 ? 's' : ''}${L.k !== n ? ` (linha de ${L.k})` : ''} ${isD ? 'diretamente enterrados' : (c.tipoCabo === 'multipolar' ? 'em cabos multipolares em dutos individuais' : 'em cabos unipolares em dutos individuais')}, espaçamento ${(isD ? ESP44 : ESP45)[esp]}`;
    } else { r.FCA = fca42(1, n); r.fcaFonte = `Tabela 42, ref. 1 — ${n} circuitos no mesmo duto enterrado (em feixe)`; }
  } else if ((ref === 'C' || ref === 'E' || ref === 'F') && +c.camadas > 1) {
    const cam = Math.round(+c.camadas), pc = Math.max(2, Math.round(+c.porCamada || 2));
    r.FCA = T43[idx43(cam)][idx43(pc)];
    r.fcaFonte = `Tabela 43 — ${cam} camadas com ${pc} circuitos (ou cabos multipolares) por camada`;
  } else {
    const refs = refsAgrup(ref); const rf = refs.includes(+c.refAgrup) ? +c.refAgrup : refs[0];
    r.refAgrup = rf; r.FCA = fca42(rf, n);
    r.fcaFonte = `Tabela 42, ref. ${rf} — ${REF42[rf].toLowerCase()}, ${n} circuito${n > 1 ? 's' : ''}${nPar > 1 ? ' (cada conjunto em paralelo conta como um circuito)' : ''}`;
  }
  r.fTot = r.FCT * r.FCR * r.FCP * r.FCA * r.fh;

  // 5. Seção mínima — Tabela 47 / 6.2.3.8
  r.Smin = mat === 'Al' ? (P.edificacao === 'comercial' ? 50 : 16) : (c.tipo === 'controle' ? 0.5 : (c.tipo === 'ilum' ? 1.5 : 2.5));
  r.reqs.push({ crit: mat === 'Al' && P.edificacao === 'comercial' ? 'Seção mínima (Tabela 47 e 6.2.3.8)' : 'Seção mínima (6.2.6.1, Tabela 47)', S: r.Smin });

  // 6. Dispositivo de proteção
  const D = DISP[c.dispositivo] || DISP.disj_60898; r.disp = D; r.dispKey = c.dispositivo;
  const inMin = c.tipo === 'controle' ? 0 : Math.max(+P.inMin || 0, 0);
  let In = c.inManual ? +c.inManual : D.lista.find(x => x >= r.IB - 1e-9 && x >= inMin);
  if (In == null) { r.falhas.push(`Corrente de projeto ${nfmt(r.IB)} A acima da maior corrente nominal da série (${D.lista[D.lista.length - 1]} A) — escolha disjuntor em caixa moldada (NBR IEC 60947-2) ou fusível gG.`); In = D.lista[D.lista.length - 1]; }
  if (c.inManual && In < r.IB - 1e-9) r.falhas.push(`In = ${In} A informado é menor que IB = ${nfmt(r.IB)} A (5.3.4.1).`);
  r.In = In; r.I2f = D.I2(In); r.I2 = r.I2f * In;
  r.polos = { FN: 1, FF: 2, FFN: 2, FFF: 3, FFFN: 3 }[lig];
  r.curva = c.dispositivo === 'disj_60898' ? (c.curva || 'C') : null;
  r.icc = +(ctx.quadro.icc ?? P.icc) || 0;
  r.icn = c.icnManual > 0 ? +c.icnManual : (c.dispositivo === 'fus_gG' ? 50 : (c.dispositivo === 'disj_60947' ? +P.icn947 : +P.icn));
  r.icnOk = r.icn + 1e-9 >= r.icc;
  if (!r.icnOk) r.falhas.push(`Capacidade de interrupção ${nfmt(r.icn, 1)} kA menor que a corrente de curto-circuito presumida ${nfmt(r.icc, 1)} kA (5.3.5.5.1).`);

  // 7. Capacidade de condução (6.2.5 e 5.3.4.1)
  r.IzReq = In * Math.max(1, r.I2f / 1.45);
  r.IcReq = r.IzReq / (r.fTot * nPar);
  r.Scap = SECS.find(S => (Ic(S).Ic ?? 0) + 1e-9 >= r.IcReq) ?? null;
  r.reqs.push({ crit: 'Capacidade de condução de corrente (6.2.5 e 5.3.4.1)', S: r.Scap });

  // 8. Queda de tensão (6.2.7)
  r.classe = mat === 'Al' ? 2 : (+P.classe === 2 ? 2 : 5);
  r.cos = r.fp; r.sin = Math.sqrt(Math.max(0, 1 - r.cos * r.cos));
  r.kdv = { FN: 2, FF: 2, FFN: 1.5, FFF: Math.sqrt(3), FFFN: Math.sqrt(3) }[lig];
  r.L = +c.L || 0;
  r.ferro = !!(ctx.trechoTipo && ELETRODUTOS[ctx.trechoTipo] && ELETRODUTOS[ctx.trechoTipo].ferro && r.conduto === 'circ');
  const geo = S => {
    const dIso = c.tipoCabo === 'multipolar' ? (DIAM.isolado[S] ?? 1.8 * Math.sqrt(S)) : (diamCondutor(cat, c.tipoCabo, S) ?? 1.8 * Math.sqrt(S));
    const Dax = dIso * (ref === 'G' ? 2 : 1);
    const plano = r.nCarr === 3 && ((ref === 'F' && c.arranjoF === 'plano') || ref === 'G');
    return { D: Dax, gmd: plano ? Dax * Math.cbrt(2) : Dax, arr: ref === 'G' ? 'espaçados de um diâmetro' : (plano ? 'justapostos em plano' : (r.nCarr === 3 ? 'justapostos em trifólio' : 'justapostos')), plano };
  };
  const Z = S => { const g = geo(S); return { ...impedancia({ mat, classe: r.classe, isol, S, nCarr: r.nCarr, D: g.D, gmd: g.gmd }), arr: g.arr, plano: g.plano, Dax: g.D }; };
  const dvPct = (S, Ii = r.IB, cs = r.cos, sn = r.sin) => { const z = Z(S); const ff = r.ferro ? fatorFerro(S, cs) : 1; return r.kdv * Ii * (r.L / 1000) * (z.R * cs + z.X * sn) / nPar / r.Vref * 100 * ff; };
  r.dvFn = dvPct; r.Zfn = Z;
  r.dvMont = +ctx.mont.dv || 0; r.montFonte = ctx.mont.fonte; r.montCirc = ctx.mont.circ || null;
  r.Lcaminho = (ctx.mont.Lcam || 0) + r.L;
  r.supLongo = 0;
  if (P.supLongo && P.origem !== 'entrega' && r.Lcaminho > 100) r.supLongo = Math.min(0.5, (r.Lcaminho - 100) * 0.005);
  r.limTotal = +P.dvTotal + r.supLongo;
  if (c.tipo === 'dist') r.limCirc = (c.dvMax > 0) ? +c.dvMax : +P.dvDist;
  else r.limCirc = Math.min((c.dvMax > 0) ? +c.dvMax : +P.dvTerminal, 4);
  r.Sdv = SECS.find(S => dvPct(S) <= r.limCirc + 1e-9 && r.dvMont + dvPct(S) <= r.limTotal + 1e-9) ?? null;
  r.reqs.push({ crit: 'Queda de tensão (6.2.7)', S: r.Sdv });

  // 9. Curto-circuito (5.3.5)
  if (P.verifCC) {
    let I2t, fonte;
    if (c.i2tManual > 0) { I2t = +c.i2tManual; fonte = 'energia específica passante informada pelo fabricante do dispositivo'; }
    else if (c.dispositivo === 'disj_60898' && P.classe3 && In <= 32 && r.icc <= 10) {
      const tier = [3, 4.5, 6, 10].find(t => t >= r.icc - 1e-9);
      I2t = CL3[In <= 16 ? 'a' : 'b'][tier];
      fonte = `limite máximo da classe 3 de limitação de energia (EN 60898-1, anexo ZA) para In ${In <= 16 ? '≤ 16 A' : 'entre 16 A e 32 A'} e nível de ${nfmt(tier, 1)} kA`;
    } else { I2t = Math.pow(r.icc * 1000, 2) * (+P.tCC || 0.02); fonte = `Icc² × t, com t = ${nfmt(+P.tCC || 0.02, 3)} s (estimativa sem considerar limitação de corrente)`; }
    r.cc = { I2t, fonte };
    r.Scc = SECS.find(S => { const k = fatorK(mat, isol, S); return k * k * (S * nPar) * (S * nPar) + 1e-6 >= I2t; }) ?? null;
    r.reqs.push({ crit: 'Solicitação térmica no curto-circuito (5.3.5.5.2)', S: r.Scc });
  }

  // 10. DR (5.1.3.2.2)
  r.drMotivo = motivoDR(c, P, In); r.drExigido = !!r.drMotivo;
  r.drUsado = c.dr === 'sim' || (c.dr !== 'nao' && r.drExigido);
  r.idn = +c.idn || 30;
  if (r.drExigido && c.dr === 'nao') r.falhas.push(`Dispositivo DR obrigatório (${r.drMotivo}) — 5.1.3.2.2.`);
  if (r.drExigido && r.drUsado && r.idn > 30 && P.aterramento !== 'TT') r.falhas.push('A proteção complementar exige DR de alta sensibilidade (IΔn ≤ 30 mA) — 5.1.3.2.2.');
  if (r.drUsado) {
    r.drTipo = c.drTipo === 'DDR' ? 'DDR' : 'IDR';
    r.drIn = r.drTipo === 'DDR' ? In : (DR_LISTA.find(x => x >= In) || null);
    if (r.drIn == null) r.falhas.push('Não há interruptor DR padronizado com corrente nominal ≥ In; usar disjuntor DR ou relé diferencial com transformador toroidal.');
    r.drPolos = (lig === 'FN' || lig === 'FF') ? 2 : 4;
  }

  // 11. Seccionamento automático
  r.tn = null; r.tt = null;
  if (!c.pe) r.falhas.push('Todo circuito deve dispor de condutor de proteção (PE) — 5.1.2.2.3.');
  if (String(P.aterramento).startsWith('TN')) {
    if (r.drUsado) r.tn = { viaDR: true };
    else if (c.dispositivo === 'fus_gG') { r.tn = { fusivel: true }; r.avisos.push('Seccionamento automático com fusível: confirmar pela curva tempo × corrente do fabricante que Ia ≤ U0/Zs no tempo máximo admitido.'); }
    else if (c.pe) {
      const mult = c.dispositivo === 'disj_60898' ? CURVA_MAG[r.curva][1] : (+P.im947 || 10);
      const Ia = mult * In, rho = RHO_TN[mat];
      const Lmax = S => 0.8 * U0 * S * nPar / (rho * (1 + S / secaoPE(S, mat)) * Ia);
      const Stn = SECS.find(S => Lmax(S) + 1e-9 >= r.L) ?? null;
      r.tn = { Ia, mult, rho, LmaxFn: Lmax, S: Stn };
      r.reqs.push({ crit: 'Seccionamento automático, esquema TN (5.1.2.2.4)', S: Stn });
    }
  } else if (P.aterramento === 'TT') {
    r.tt = { RA: +P.RA || 0, ok: (+P.RA || 0) * r.idn / 1000 <= 50 };
    if (!r.drUsado) r.falhas.push('No esquema TT o seccionamento automático deve ser feito por dispositivo DR (5.1.2.2.5).');
    else if (!r.tt.ok) r.falhas.push(`RA × IΔn = ${nfmt(r.tt.RA * r.idn / 1000, 2)} V > 50 V — reduzir a resistência de aterramento ou IΔn.`);
  }

  // 12. Motor — partida
  if (c.tipo === 'motor') {
    const Ip = (+c.ipIn || 6) * r.Icarga, cp = clamp(+P.cosPartida || 0.35, 0.1, 1), sp = Math.sqrt(1 - cp * cp);
    r.partida = { Ip, cp, sp, lim: 10, ipIn: +c.ipIn || 6, S: SECS.find(S => r.dvMont + dvPct(S, Ip, cp, sp) <= 10 + 1e-9) ?? null };
    r.reqs.push({ crit: 'Queda de tensão na partida do motor (6.5.1.3)', S: r.partida.S });
    if (r.curva) { const lo = CURVA_MAG[r.curva][0] * In; r.partida.lo = lo; if (Ip > lo) r.avisos.push(`Corrente de partida (${nfmt(Ip, 1)} A) acima do limiar inferior de disparo magnético da curva ${r.curva} (${nfmt(lo, 0)} A): risco de disparo na partida — usar curva D ou disjuntor-motor.`); }
  }
  if (c.secaoManual) r.reqs.push({ crit: 'Seção mínima imposta pelo projetista', S: +c.secaoManual });

  // 13. Seção adotada
  r.reqs.filter(q => q.S == null).forEach(q => r.falhas.push(`Nenhuma seção ${nPar > 1 ? `(com ${nPar} condutores por fase) ` : ''}atende ao critério "${q.crit}" — rever método, comprimento ou usar condutores em paralelo.`));
  const Smax = Math.max(...r.reqs.filter(q => q.S != null).map(q => q.S), r.Smin);
  r.Sf = SECS.find(x => x >= Smax - 1e-9) ?? SECS[SECS.length - 1];
  r.Ic = Ic(r.Sf).Ic ?? 0; r.Iz = r.Ic * r.fTot * nPar;
  r.dv = dvPct(r.Sf); r.dvTotal = r.dvMont + r.dv;
  r.z = Z(r.Sf); r.ffe = r.ferro ? fatorFerro(r.Sf, r.cos) : 1;
  r.k = fatorK(mat, isol, r.Sf); r.thetaCC = THETA_CC(isol, r.Sf);
  if (r.tn && r.tn.LmaxFn) r.tn.Lmax = r.tn.LmaxFn(r.Sf);
  if (r.partida) r.partida.dv = r.dvMont + dvPct(r.Sf, r.partida.Ip, r.partida.cp, r.partida.sp);
  if (r.cc) { r.cc.Scalc = Math.sqrt(r.cc.I2t) / r.k / nPar; r.cc.k2S2 = r.k * r.k * Math.pow(r.Sf * nPar, 2); }

  // 14. Neutro e PE
  r.hasN = temNeutro(lig);
  if (r.hasN) {
    if (lig === 'FFFN' && c.neutroReduzido && !r.harm && T48[r.Sf]) { r.SN = T48[r.Sf]; r.neutroTxt = `Tabela 48 — neutro reduzido admitido (circuito trifásico equilibrado, 3ª harmônica ≤ 15 %, neutro protegido contra sobrecorrentes): ${fS(r.SN)} mm²`; }
    else { r.SN = r.Sf; r.neutroTxt = lig === 'FFFN' ? (r.harm ? 'neutro carregado por harmônicas de 3ª ordem (> 15 %): seção igual à das fases (6.2.6.2)' : 'seção igual à das fases (6.2.6.2)') : 'circuito monofásico ou bifásico com neutro: seção igual à das fases (6.2.6.2)'; }
  }
  if (c.pe) {
    r.SPEtab = secaoPE(r.Sf, mat); r.SPE = r.SPEtab;
    if (P.verifCC && P.verifPE && r.cc) {
      const kpe = fatorKPE(mat, isol, r.Sf, false); const Sreq = Math.sqrt(r.cc.I2t) / kpe / nPar;
      r.pe = { k: kpe, Sreq, Sadi: SECS.find(S => S >= Sreq - 1e-9) ?? null };
      if (r.pe.Sadi != null && r.pe.Sadi > r.SPE) r.SPE = Math.min(r.pe.Sadi, r.Sf);
    }
  } else r.SPE = null;

  // 15. Composição física
  const letras = (c.fases || 'ABC').split('').slice(0, nFases(lig));
  const jogo = letras.map(l => ({ func: 'F', fase: l, S: r.Sf }));
  if (r.hasN) jogo.push({ func: 'N', S: r.SN });
  if (c.pe) jogo.push({ func: 'PE', S: r.SPE });
  r.condutores = jogo; r.nVias = jogo.length; r.cabos = [];
  for (let j = 0; j < nPar; j++) {
    if (c.tipoCabo === 'multipolar') r.cabos.push({ multipolar: true, vias: r.nVias, S: r.Sf, d: diamCondutor(cat, 'multipolar', r.Sf, r.nVias), cond: jogo });
    else jogo.forEach(k => r.cabos.push({ ...k, d: diamCondutor(cat, c.tipoCabo, k.S) }));
  }
  if (r.cabos.some(k => k.d == null)) r.avisos.push(`Diâmetro externo não catalogado para ${TIPO_CABO[c.tipoCabo]} de ${fS(r.Sf)} mm² — informe-o em Tabelas da norma › Diâmetros.`);
  if (c.tipoCabo === 'multipolar' && r.Sf > 300) r.falhas.push('Cabos multipolares são fabricados até 300 mm²: use cabos unipolares ou condutores em paralelo.');
  if (nPar > 1) r.avisos.push(`${nPar} condutores por fase em paralelo: mesmo tipo, seção e comprimento, e cada grupo com um condutor de cada fase (trifólio ou disposição simétrica), para repartir igualmente a corrente.`);
  if (r.dv > r.limCirc + 1e-9 || r.dvTotal > r.limTotal + 1e-9) r.falhas.push(`Queda de tensão acima do limite (${nfmt(r.dv)} % no circuito; ${nfmt(r.dvTotal)} % acumulada).`);
  if (met.vde) r.avisos.push(`Maneira de instalar nº ${met.id}: método ${ref} adotado para ${r.vde === 'alto' ? (met.vde === 5 ? '5·De ≤ V < 50·De' : 'V ≥ 20·De') : (met.vde === 5 ? '1,5·De ≤ V < 5·De' : '1,5·De ≤ V < 20·De')} (V = altura do espaço ou da canaleta; De = diâmetro externo do cabo).`);
  return r;
}

/* ============== PROJETO COMPLETO ============== */
function calcularProjeto(proj) {
  const P = proj.params, C = proj.circuitos, Q = proj.quadros || {}, cat = proj.catalogo || {};
  const nTrecho = {}; C.forEach(c => { const t = (c.trecho || '').trim(); if (t) nTrecho[t] = (nTrecho[t] || 0) + (c.nPar > 0 ? Math.round(+c.nPar) : 1); });
  const tipoTrecho = {}; C.forEach(c => { const k = chaveTrecho(c); if (!tipoTrecho[k]) tipoTrecho[k] = trechoCfg(proj, k, C.filter(x => chaveTrecho(x) === k)).tipo; });
  const pot = {}, demQD = {}, visit = new Set();
  const lumi = typeof calcLumi === 'function' ? calcLumi(proj) : {}, lumiCirc = {};
  const lumiExt = typeof calcLumiExt === 'function' ? calcLumiExt(proj) : {};
  [[proj.lumi, lumi], [proj.lumiExt, lumiExt]].forEach(([L, R]) => (L || []).forEach(a => { const l = R[a.id]; if (!a.circuito || !l) return; const o = lumiCirc[a.circuito] = lumiCirc[a.circuito] || { W: 0, amb: [] }; o.W += l.P; o.amb.push(a.nome); }));
  function potC(c) {
    if (pot[c.id]) return pot[c.id];
    if (c.tipo === 'ilum' && c.potLumi && lumiCirc[c.id]) { const o = lumiCirc[c.id]; return pot[c.id] = { ...potencias({ ...c, pot: o.W, unid: 'W' }), lumi: o }; }
    if (c.tipo === 'dist' && c.demandaAuto && c.alimenta) {
      if (visit.has(c.id)) return { P: 0, S: 0, fp: 1, ciclo: true };
      visit.add(c.id); const d = demandaQD(c.alimenta); visit.delete(c.id);
      return pot[c.id] = { P: d.P, S: d.S, fp: d.S > 0 ? clamp(d.P / d.S, 0.05, 1) : 1, auto: true, dem: d };
    }
    return pot[c.id] = potencias(c);
  }
  function demandaQD(q) {
    if (demQD[q]) return demQD[q];
    const fd0 = Q[q]?.fd, fd = (fd0 != null && fd0 !== '' && +fd0 > 0) ? +fd0 : (+P.fdPadrao > 0 ? +P.fdPadrao : 1); let Pt = 0, St = 0, Pf = 0, Sf = 0, n = 0;
    C.filter(c => c.quadro === q).forEach(c => { const p = potC(c); if (c.tipo === 'dist') { Pf += p.P; Sf += p.S; } else { Pt += p.P; St += p.S; n++; } });
    const dm = +(Q[q]?.demManual) || 0; let Pd = Pt * fd + Pf, Sd = St * fd + Sf;
    if (dm > 0) { const fpE = (St + Sf) > 0 ? clamp((Pt + Pf) / (St + Sf), 0.05, 1) : 0.92; Sd = dm * 1000; Pd = Sd * fpE; }
    return demQD[q] = { q, fd, Pterm: Pt, Sterm: St, Pjus: Pf, Sjus: Sf, P: Pd, S: Sd, n, manual: dm > 0, dm };
  }
  C.forEach(potC);
  const feederOf = {}, dupFeed = {};
  C.forEach(c => { if (c.tipo === 'dist' && c.alimenta) { if (feederOf[c.alimenta]) dupFeed[c.alimenta] = true; else feederOf[c.alimenta] = c; } });
  const res = {}, emCalc = new Set();
  function montQD(q) {
    const f = feederOf[q];
    if (f && !emCalc.has(f.id)) { const rf = calcC(f); return { dv: rf.dvTotal || 0, fonte: 'alimentador', circ: f.num, Lcam: rf.Lcaminho || 0 }; }
    return { dv: +(Q[q]?.dvMont ?? 0) || 0, fonte: 'manual', Lcam: +(Q[q]?.Lmont ?? 0) || 0 };
  }
  function calcC(c) {
    if (res[c.id]) return res[c.id];
    emCalc.add(c.id);
    const r = dimensionar(c, { P, pot: potC(c), mont: montQD(c.quadro), nTrecho, quadro: Q[c.quadro] || {}, cat, trechoTipo: tipoTrecho[chaveTrecho(c)] });
    emCalc.delete(c.id);
    if (dupFeed[c.alimenta] && c.tipo === 'dist') r.avisos.push(`Mais de um alimentador declarado para o quadro ${c.alimenta}; a queda a montante usa o primeiro.`);
    return res[c.id] = r;
  }
  C.forEach(calcC);
  const trechos = calcTrechos(proj, res);
  const calhas = calcCalhas(proj, res);
  C.forEach(c => { const r = res[c.id]; r.status = r.falhas.length ? 'fail' : (r.avisos.length ? 'warn' : 'ok'); });
  const quadros = calcQuadros(proj, res, demandaQD);
  return { res, trechos, calhas, quadros, demandaQD, lumi, lumiExt, lumiCirc };
}

/* ============== ELETRODUTOS ============== */
function chaveTrecho(c) { const t = (c.trecho || '').trim(); return t || ('#' + c.id); }
function trechoCfg(proj, key, circs) {
  const P = proj.params, s = (proj.trechos || {})[key] || {};
  const enterrado = circs.some(c => (MET[c.metodo] || {}).ref === 'D');
  return { tipo: s.tipo || P.tipoEletroduto || 'pvc_rigido', comp: s.comp ?? null, curvas: s.curvas ?? 0, local: s.local || (enterrado ? 'externo' : 'interno'), semCaixa: !!s.semCaixa, min: s.min || P.eletrodutoMin || '1/2"' };
}
function calcTrechos(proj, res) {
  const T = {}, cat = proj.catalogo || {};
  proj.circuitos.forEach(c => { const key = chaveTrecho(c); if (!T[key]) T[key] = { key, exclusivo: key.startsWith('#'), circuitos: [] }; T[key].circuitos.push(c); });
  Object.values(T).forEach(t => {
    const cs = t.circuitos; t.nome = t.exclusivo ? `Exclusivo — circuito ${cs[0].num}` : `Trecho ${t.key}`;
    t.cfg = trechoCfg(proj, t.key, cs);
    const conds = cs.map(c => res[c.id].conduto);
    t.avisos = []; t.falhas = [];
    if (conds.every(x => x === 'circ')) t.aplica = true;
    else { t.aplica = false; t.motivo = conds.some(x => x === 'circ') ? 'circuitos do trecho com maneiras de instalar diferentes — revise o campo trecho' : (conds.some(x => x === 'ncirc') ? 'conduto de seção não circular (eletrocalha, canaleta, moldura): ocupação não coberta por 6.2.11.1.6' : 'linha sem eletroduto (cabos sobre superfície, bandeja, leito ou diretamente enterrados)'); }
    t.itens = [];
    cs.forEach(c => { (res[c.id].cabos || []).forEach(k => t.itens.push({ circ: c.num, cid: c.id, ...k, A: k.d ? Math.PI * k.d * k.d / 4 : 0 })); });
    t.n = t.itens.length; t.A = t.itens.reduce((s, k) => s + k.A, 0);
    t.taxa = t.n <= 1 ? 0.53 : (t.n === 2 ? 0.31 : 0.40);
    t.Areq = t.A / t.taxa; t.diMin = Math.sqrt(4 * t.Areq / Math.PI);
    if (t.aplica) {
      const E = ELETRODUTOS[t.cfg.tipo] || ELETRODUTOS.pvc_rigido;
      const lista = itensEletroduto(cat, t.cfg.tipo); const imin = POL_ORDEM.indexOf(t.cfg.min);
      let idx = lista.findIndex(it => POL_ORDEM.indexOf(it.pol) >= imin && Math.PI * it.di * it.di / 4 + 1e-9 >= t.Areq);
      const base = t.cfg.local === 'externo' ? 30 : 15, curvas = +t.cfg.curvas || 0;
      t.Lim = base - 3 * curvas; t.base = base;
      if (curvas > 3) t.falhas.push(`${curvas} curvas de 90° entre caixas: o máximo admitido é 3 (6.2.11.1).`);
      t.excesso = 0;
      if (t.cfg.comp > 0 && t.cfg.comp > t.Lim + 1e-9) {
        t.excesso = t.cfg.comp - t.Lim;
        if (t.cfg.semCaixa && idx >= 0) { t.acrescimo = Math.ceil(t.excesso / 6 - 1e-9); idx += t.acrescimo; t.avisos.push(`Trecho ${nfmt(t.excesso, 1)} m acima do limite sem caixa de passagem: eletroduto aumentado em ${t.acrescimo} tamanho(s) nominal(is), um a cada 6 m ou fração (6.2.11.1).`); }
        else t.falhas.push(`Trecho de ${nfmt(t.cfg.comp, 1)} m excede o limite de ${nfmt(t.Lim, 1)} m (${base} m ${t.cfg.local === 'externo' ? 'em área externa' : 'em área interna'} − 3 m por curva) — instalar caixa de passagem (6.2.11.1).`);
      }
      if (E.ferro) t.avisos.push('Eletroduto metálico ferromagnético: todos os condutores de cada circuito (fases, neutro e PE) no mesmo eletroduto, para evitar correntes parasitas e aquecimento.');
      if (idx < 0 || idx >= lista.length) { t.esc = null; t.falhas.push('Nenhum eletroduto da série escolhida comporta os condutores — dividir o trecho ou trocar o tipo de eletroduto.'); }
      else { const it = lista[idx]; t.esc = { ...it, nome: E.nome, norma: E.norma, Ai: Math.PI * it.di * it.di / 4 }; t.esc.ocup = t.A / t.esc.Ai * 100; }
    }
    t.status = t.falhas.length ? 'fail' : (t.avisos.length ? 'warn' : 'ok');
    cs.forEach(c => { const r = res[c.id]; r.trechoKey = t.key; r.trecho = t; if (t.falhas.length) r.avisos.push(`Eletroduto (${t.nome}): ${t.falhas.join(' ')}`); });
  });
  return T;
}

/* ============== QUADROS E BALANCEAMENTO ============== */
function cargaFases(c, r) {
  const S = r.S || 0, f = (c.fases || '').split('').slice(0, nFases(c.ligacao)); const o = { A: 0, B: 0, C: 0 };
  f.forEach(l => { if (o[l] != null) o[l] += S / f.length; }); return o;
}
function calcQuadros(proj, res, demandaQD) {
  const nomes = new Set(Object.keys(proj.quadros || {})); proj.circuitos.forEach(c => nomes.add(c.quadro));
  const out = {};
  [...nomes].forEach(q => {
    const cs = proj.circuitos.filter(c => c.quadro === q);
    const fases = { A: 0, B: 0, C: 0 };
    cs.forEach(c => { const f = cargaFases(c, res[c.id]); fases.A += f.A; fases.B += f.B; fases.C += f.C; });
    const usadas = { monofasico: ['A'], bifasico: ['A', 'B'], trifasico: ['A', 'B', 'C'] }[proj.params.fornecimento] || ['A', 'B', 'C'];
    const vals = usadas.map(l => fases[l]); const mx = Math.max(...vals), mn = Math.min(...vals);
    out[q] = { q, cs, fases, usadas, deseq: mx > 0 && usadas.length > 1 ? (mx - mn) / mx * 100 : 0, dem: demandaQD(q), alim: proj.circuitos.find(c => c.tipo === 'dist' && c.alimenta === q) || null };
  });
  return out;
}
function balancearFases(proj, calc, q) {
  const usadas = { monofasico: ['A'], bifasico: ['A', 'B'], trifasico: ['A', 'B', 'C'] }[proj.params.fornecimento];
  const cs = proj.circuitos.filter(c => c.quadro === q); const load = { A: 0, B: 0, C: 0 };
  cs.filter(c => nFases(c.ligacao) === 3).forEach(c => { const f = cargaFases(c, calc.res[c.id]); usadas.forEach(l => load[l] += f[l]); });
  const mov = cs.filter(c => nFases(c.ligacao) < 3).sort((a, b) => (calc.res[b.id].S || 0) - (calc.res[a.id].S || 0));
  const pares = usadas.length === 3 ? ['AB', 'BC', 'CA'] : (usadas.length === 2 ? ['AB'] : []);
  mov.forEach(c => {
    const S = calc.res[c.id].S || 0;
    if (nFases(c.ligacao) === 1) { const l = usadas.slice().sort((a, b) => load[a] - load[b])[0]; c.fases = l; load[l] += S; }
    else if (pares.length) {
      let best = pares[0], bestMax = Infinity;
      pares.forEach(p => { const t = { ...load }; p.split('').forEach(l => t[l] += S / 2); const m = Math.max(...usadas.map(l => t[l])); if (m < bestMax - 1e-9) { bestMax = m; best = p; } });
      c.fases = best; best.split('').forEach(l => load[l] += S / 2);
    }
  });
}

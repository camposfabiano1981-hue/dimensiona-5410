/* ================================================================
   DIAGRAMAS UNIFILAR E MULTIFILAR DOS QUADROS DE DISTRIBUIÇÃO
   Gerados a partir do dimensionamento dos circuitos: dispositivo geral, DPS,
   disjuntores, DR, condutores e distribuição de fases. Símbolos gráficos da
   IEC 60617 (prática usual herdada da NBR 5444); cores dos condutores conforme
   NBR 5410, 6.1.5.3 (fases: convenção do projeto).
   ================================================================ */
const DG_COR = { ink: '#1b1f23', mut: '#5b6670', line: '#9aa6b0', face: '#ffffff', acc: '#0b5a70' };
const COR_COND = { A: '#1f1f1f', B: '#c62828', C: '#ffffff', N: '#3b8ed8', PE: '#2e9d4f' };
const DIAG_UNI = 15, DIAG_MULTI = 12;
const escD = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cortaD = (s, n) => (s = String(s ?? '')).length > n ? s.slice(0, Math.max(1, n - 1)) + '…' : s;
function caboDiag(c, r) { const k = r.nPar > 1 ? `${r.nPar}×` : ''; return `${k}${nFases(c.ligacao)}#${fS(r.Sf)}${r.hasN ? ` + N#${fS(r.SN)}` : ''}${r.SPE ? ` + PE#${fS(r.SPE)}` : ''} mm²${c.material === 'Al' ? ' Al' : ''}`; }

/* dados de um quadro para os diagramas */
function dadosQuadro(proj, calc, nome) {
  const q = calc.quadros[nome], Qd = proj.quadros[nome] || {}, P = proj.params, R = calc.res;
  const alim = q.alim, ra = alim ? R[alim.id] : null;
  let ent;
  if (alim) ent = { txt: `Alimentador ${alim.num}${alim.quadro && alim.quadro !== nome ? ` — do ${alim.quadro}` : ''}`, cabo: `${caboDiag(alim, ra)} · proteção ${protecaoCurta(alim, ra)} ${ra.polos}P`, In: ra.In };
  else {
    const u = calc.energisa && Object.values(calc.energisa.ucs || {})[0], pd = u && u.padrao;
    ent = { txt: pd ? `Do padrão de entrada (categoria ${pd.cat})` : 'Da origem da instalação (ponto de entrega)', cabo: pd && pd.ramalEnt ? `Ramal de entrada: ${pd.ramalEnt}` : '', In: pd ? pd.disj : null };
  }
  const cs = q.cs.map(c => {
    const r = R[c.id], nF = nFases(c.ligacao);
    return { id: c.id, num: c.num, desc: c.desc || TIPOS[c.tipo], fs: (c.fases || 'ABC').split('').slice(0, nF), N: !!r.hasN, PE: !!r.SPE, Sf: r.Sf, nPar: r.nPar, cabo: caboDiag(c, r),
      polos: r.polos, fus: c.dispositivo === 'fus_gG', prot: protecaoCurta(c, r), dr: r.drUsado ? { tipo: r.drTipo, In: r.drIn, idn: r.idn, polos: r.drPolos } : null, S: r.S, alimenta: c.tipo === 'dist' && c.alimenta && !(c.desc || '').includes(c.alimenta) ? c.alimenta : '' };
  });
  const sist = { monofasico: 'monofásico', bifasico: 'bifásico', trifasico: 'trifásico' }[P.fornecimento] || '';
  return { nome, desc: Qd.desc || '', usadas: q.usadas, cs, ent, q,
    dg: { In: +Qd.dgIn > 0 ? +Qd.dgIn : ent.In, polos: q.usadas.length },
    dps: (() => { const x = calc.dps && calc.dps.quadros[nome]; if (x) return x.ativo ? { classe: x.classe, Uc: x.Uc, UcN: x.UcN, In: x.In, Iimp: x.classe === 'I+II' ? x.Iimp : null, Up: x.Up, lig: x.lig, ligTxt: x.ligTxt, semNPE: !!x.semNPE } : null;
      return Qd.dps !== false ? { classe: 'II', Uc: ucDPS(P.U0), In: 20, Up: P.U0 <= 150 ? 1.2 : 1.5, lig: 'pe' } : null; })(),
    reserva: reservaTab59(cs.length), sistemaTxt: `${P.U0}/${P.U} V · ${sist} · esquema ${P.aterramento} · ${cs.length} circuito${cs.length === 1 ? '' : 's'}` };
}

/* primitivas de desenho */
const tD = (x, y, s, o = {}) => `<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" font-size="${o.fs || 11}" fill="${o.cor || DG_COR.ink}"${o.b ? ' font-weight="700"' : ''}${o.anc ? ` text-anchor="${o.anc}"` : ''} font-family="Arial, Helvetica, sans-serif">${escD(s)}</text>`;
const lD = (x1, y1, x2, y2, o = {}) => `<line x1="${(+x1).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x2).toFixed(1)}" y2="${(+y2).toFixed(1)}" stroke="${o.cor || DG_COR.ink}" stroke-width="${o.w || 1.4}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''} stroke-linecap="round"/>`;
const xD = (x, y, s = 3.6, cor) => lD(x - s, y - s, x + s, y + s, { cor }) + lD(x - s, y + s, x + s, y - s, { cor });
/* disjuntor (IEC 60617): contato móvel inclinado e × no contato fixo; horizontal (x1 → x2) ou vertical (y1 → y2) */
const disjH = (x1, x2, y, cor) => lD(x1, y, x2 - 3, y - 10, { cor }) + xD(x2, y, 3.6, cor);
const disjV = (x, y1, y2, cor, a = 10) => lD(x, y1, x + a, y2 - 3, { cor }) + xD(x, y2, a > 7 ? 3.6 : 3, cor);
const fusH = (x1, x2, y, cor) => `<rect x="${x1 + 2}" y="${y - 5}" width="${x2 - x1 - 4}" height="10" fill="${DG_COR.face}" stroke="${cor || DG_COR.ink}" stroke-width="1.3"/>` + lD(x1, y, x2, y, { cor });
const fusV = (x, y1, y2, cor) => `<rect x="${x - 5}" y="${y1 + 2}" width="10" height="${y2 - y1 - 4}" fill="${DG_COR.face}" stroke="${cor || DG_COR.ink}" stroke-width="1.3"/>` + lD(x, y1, x, y2, { cor });
/* interruptor (contato sem ×), com toróide do DR */
const interH = (x1, x2, y) => lD(x1, y, x2 - 3, y - 10) + lD(x2, y - 5, x2, y + 1);
const interV = (x, y1, y2, a = 10) => lD(x, y1, x + a, y2 - 3) + lD(x - 3, y2, x + 1, y2);
function drH(x1, x2, y, ddr) {
  return `<ellipse cx="${x1 + 5}" cy="${y}" rx="3.6" ry="8" fill="none" stroke="${DG_COR.acc}" stroke-width="1.4"/>` + lD(x1, y, x1 + 12, y)
    + (ddr ? disjH(x1 + 12, x2, y) : interH(x1 + 12, x2, y)) + lD(x1 + 5, y - 8, (x1 + 12 + x2) / 2, y - 6, { cor: DG_COR.acc, w: 1, dash: '2 2' });
}
function marcas(x, y, c) {
  // traços dos condutores: fase "/", neutro "/" com círculo, proteção "/" com traço
  const ks = [...c.fs.map(() => 'F'), ...(c.N ? ['N'] : []), ...(c.PE ? ['PE'] : [])], x0 = x - (ks.length - 1) * 3.5;
  return ks.map((k, i) => { const xi = x0 + i * 7; return lD(xi - 3, y + 6, xi + 3, y - 6, { w: 1.2 }) + (k === 'N' ? `<circle cx="${xi + 3.6}" cy="${y - 7.4}" r="1.9" fill="${DG_COR.face}" stroke="${DG_COR.ink}" stroke-width="1"/>` : k === 'PE' ? lD(xi + 1, y - 6, xi + 6, y - 6, { w: 1.2 }) : ''); }).join('');
}
function terraD(x, y, cor) { return lD(x - 8, y, x + 8, y, { cor }) + lD(x - 5, y + 4, x + 5, y + 4, { cor }) + lD(x - 2, y + 8, x + 2, y + 8, { cor }); }
function dpsD(x, y, h = 22) { return `<rect x="${x - 7}" y="${y}" width="14" height="${h}" fill="${DG_COR.face}" stroke="${DG_COR.ink}" stroke-width="1.3"/>` + lD(x - 4, y + h - 5, x + 4, y + 5, { w: 1.1 }) + lD(x + 4, y + 5, x + 7, y + 5, { w: 1.1 }); }
const caixaNum = (x, y, num) => { const w = Math.max(24, String(num).length * 7 + 10); return { w, s: `<rect x="${x}" y="${y - 10}" width="${w}" height="20" rx="3" fill="${DG_COR.face}" stroke="${DG_COR.ink}" stroke-width="1.2"/>` + tD(x + w / 2, y + 4, num, { fs: 10.5, b: true, anc: 'middle' }) }; };
const fasesTxtD = c => `${c.fs.length > 1 ? 'Fases' : 'Fase'} ${c.fs.join('-')}`;

/* ---------- diagrama unifilar: barramento vertical, circuitos à direita ---------- */
function unifilarSVG(d, ini = 0, fim = d.cs.length) {
  const W = 760, xb = 130, dy = 40, rows = d.cs.slice(ini, fim), ult = fim >= d.cs.length, nRes = ult ? d.reserva : 0;
  const y0 = ini ? 74 : 186, yUlt = y0 + (rows.length - 1 + (nRes ? 1 : 0)) * dy, yEnd = Math.max(yUlt + 14, !ini && d.dps ? 268 : 0), H = Math.round(yEnd + (ult ? 104 : 34));
  let g = `<rect width="${W}" height="${H}" fill="${DG_COR.face}"/>`;
  g += tD(16, 24, `${d.nome}${d.desc ? ' — ' + d.desc : ''} · diagrama unifilar${ini ? ` (continuação: circuitos ${rows[0].num} a ${rows[rows.length - 1].num})` : ''}`, { fs: 14, b: true });
  g += tD(16, 42, d.sistemaTxt, { fs: 10.5, cor: DG_COR.mut });
  if (!ini) {
    g += lD(xb, 54, xb, 104) + `<polygon points="${xb - 5},60 ${xb + 5},60 ${xb},70" fill="${DG_COR.ink}"/>`;
    g += tD(xb + 16, 72, d.ent.txt, { b: true }) + (d.ent.cabo ? tD(xb + 16, 87, cortaD(d.ent.cabo, 98), { fs: 10, cor: DG_COR.mut }) : '');
    g += disjV(xb, 104, 132) + tD(xb + 18, 124, d.dg.In ? `DG — disjuntor geral ${d.dg.polos}P ${d.dg.In} A` : 'DG — disjuntor geral (definir a corrente nominal)');
    g += lD(xb, 132, xb, 156);
    if (d.dps) {
      g += `<circle cx="${xb}" cy="166" r="2.8" fill="${DG_COR.ink}"/>` + lD(xb, 166, xb - 52, 166) + lD(xb - 52, 166, xb - 52, 178) + dpsD(xb - 52, 178) + lD(xb - 52, 200, xb - 52, 210) + terraD(xb - 52, 210);
      g += tD(xb - 12, 236, `DPS classe ${d.dps.classe}`, { fs: 9.5, anc: 'end' }) + tD(xb - 12, 248, d.dps.Iimp ? `Iimp ${nfmt(d.dps.Iimp, 1)} kA · Uc ${d.dps.Uc} V` : `Uc ${d.dps.Uc} V · In ${nfmt(d.dps.In, 0)} kA`, { fs: 9, anc: 'end', cor: DG_COR.mut })
        + tD(xb - 12, 260, `${d.dps.lig === 'npe' ? `${d.usadas.length}+1 (N–PE centelhador)` : d.dps.semNPE ? `${d.usadas.length}+0 → PEN/BEP` : `${d.usadas.length + 1}+0 → PE`}${d.dps.Up ? ` · Up ${nfmt(d.dps.Up, 1)} kV` : ''}`, { fs: 9, anc: 'end', cor: DG_COR.mut });
    }
  }
  g += lD(xb, ini ? 56 : 156, xb, yEnd, { w: 5 }) + (ini ? lD(xb, 50, xb, 60, { w: 5, dash: '3 3' }) : '');
  rows.forEach((c, i) => {
    const y = y0 + i * dy;
    g += `<circle cx="${xb}" cy="${y}" r="2.8" fill="${DG_COR.ink}"/>` + lD(xb, y, 160, y) + (c.fus ? fusH(160, 192, y) : disjH(160, 192, y));
    g += tD(176, y - 14, `${c.prot}${c.fus ? '' : ` ${c.polos}P`}`, { fs: 9.5, anc: 'middle' });
    let xc = 192;
    if (c.dr) { g += lD(192, y, 210, y) + drH(210, 254, y, c.dr.tipo === 'DDR') + tD(234, y - 14, `${c.dr.tipo} ${c.dr.In ?? '?'}A ${c.dr.idn}mA`, { fs: 9, anc: 'middle', cor: DG_COR.acc }); xc = 254; }
    g += lD(xc, y, 338, y) + marcas(296, y, c) + tD(296, y - 14, `${c.nPar > 1 ? c.nPar + '×' : ''}#${fS(c.Sf)}`, { fs: 9.5, anc: 'middle' });
    const cx = caixaNum(338, y, c.num), xt = 338 + cx.w + 10;
    g += cx.s + tD(xt, y - 2, cortaD(c.desc + (c.alimenta ? ` → ${c.alimenta}` : ''), Math.floor((W - 12 - xt) / 6.2)));
    g += tD(xt, y + 12, cortaD(`${nfmt(c.S, 0)} VA · ${fasesTxtD(c)} · ${c.cabo}`, Math.floor((W - 12 - xt) / 5.3)), { fs: 9.5, cor: DG_COR.mut });
  });
  if (nRes) {
    const y = yUlt;
    g += lD(xb, y, 160, y, { cor: DG_COR.line, dash: '4 3' }) + disjH(160, 192, y, DG_COR.line) + lD(192, y, 338, y, { cor: DG_COR.line, dash: '4 3' });
    g += tD(348, y + 4, `Reserva: espaço para ${nRes} circuito${nRes === 1 ? '' : 's'} futuro${nRes === 1 ? '' : 's'} (NBR 5410, Tabela 59)`, { fs: 10.5, cor: DG_COR.mut });
  }
  g += tD(xb, yEnd + 16, `Barramentos: ${d.usadas.length}F + N + PE`, { fs: 9.5, anc: 'middle', cor: DG_COR.mut });
  if (ult) {
    const dm = d.q.dem, f = d.q.fases, y = yEnd + 42;
    g += lD(16, y - 14, W - 16, y - 14, { cor: DG_COR.line, w: 0.8 });
    g += tD(16, y, `Carga instalada ${nfmt(dm.Sterm + (dm.Sjus || 0), 0)} VA · demanda ${nfmt(dm.S, 0)} VA${dm.manual ? ' (informada)' : ` (FD ${nfmt(dm.fd * 100, 0)} %)`}`, { fs: 10.5 });
    if (d.usadas.length > 1) g += tD(16, y + 16, `${d.usadas.map(l => `Fase ${l}: ${nfmt(f[l], 0)} VA`).join(' · ')} · desequilíbrio ${nfmt(d.q.deseq, 1)} %`, { fs: 10, cor: DG_COR.mut });
    const yl = y + 40; let x = 16;
    [['F', 'fase'], ['N', 'neutro'], ['PE', 'proteção (PE)']].forEach(([k, l]) => { g += lD(x, yl, x + 28, yl) + marcas(x + 14, yl, { fs: k === 'F' ? ['A'] : [], N: k === 'N', PE: k === 'PE' }) + tD(x + 34, yl + 4, l, { fs: 9.5 }); x += 120; });
    g += tD(x, yl + 4, 'Seções em mm² (#) · proteção: curva, corrente nominal e polos · DR: In e IΔn', { fs: 9.5, cor: DG_COR.mut });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagrama unifilar do quadro ${escD(d.nome)}">${g}</svg>`;
}

/* ---------- diagrama multifilar: barramentos horizontais, circuitos em colunas ---------- */
function fioD(x1, y1, x2, y2, k, bar) {
  const w = bar ? 4 : 2;
  if (k === 'C') return lD(x1, y1, x2, y2, { cor: '#59636b', w: w + 1.8 }) + lD(x1, y1, x2, y2, { cor: COR_COND.C, w });
  if (k === 'PE') return lD(x1, y1, x2, y2, { cor: COR_COND.PE, w }) + lD(x1, y1, x2, y2, { cor: '#f2c500', w, dash: bar ? '7 7' : '4 4' });
  return lD(x1, y1, x2, y2, { cor: COR_COND[k], w });
}
const noD = (x, y, k) => `<circle cx="${x.toFixed(1)}" cy="${y}" r="3" fill="${k === 'C' ? '#59636b' : k === 'PE' ? COR_COND.PE : COR_COND[k]}"/>`;
function multifilarSVG(d, ini = 0, fim = Math.min(d.cs.length, DIAG_MULTI)) {
  const W = 760, cond = [...d.usadas, 'N', 'PE'], yb = {}; cond.forEach((k, i) => { yb[k] = 66 + i * 15; });
  const rows = d.cs.slice(ini, fim), yBot = yb.PE, xB0 = 106, xB1 = W - 34, x0 = 214, dx = (xB1 - x0) / Math.max(rows.length, 6);
  const yBrk = yBot + 34, yDR = yBrk + 44, yTor = yDR + 32, yLoad = yTor + 22, yT = yLoad + 34, H = yT + 236;
  let g = `<rect width="${W}" height="${H}" fill="${DG_COR.face}"/>`;
  g += tD(16, 22, `${d.nome}${d.desc ? ' — ' + d.desc : ''} · diagrama multifilar${d.cs.length > DIAG_MULTI ? ` (circuitos ${rows[0].num} a ${rows[rows.length - 1].num})` : ''}`, { fs: 14, b: true });
  g += tD(16, 39, cortaD(`${d.ent.txt}${d.ent.cabo ? ' · ' + d.ent.cabo : ''}`, 120), { fs: 10, cor: DG_COR.mut });
  // entrada, dispositivo geral e barramentos
  const fases = d.usadas;
  cond.forEach(k => {
    g += tD(8, yb[k] + 3.5, k, { fs: 9, b: true, cor: DG_COR.mut });
    if (fases.includes(k)) g += fioD(24, yb[k], 52, yb[k], k) + fioD(78, yb[k], xB0, yb[k], k) + lD(52, yb[k], 75, yb[k] - 9) + xD(78, yb[k], 3.4);
    else g += fioD(24, yb[k], xB0, yb[k], k);
    g += fioD(xB0, yb[k], xB1, yb[k], k, true) + tD(xB1 + 7, yb[k] + 3.5, k, { fs: 9.5, b: true });
  });
  g += lD(63, yb[fases[0]] - 5, 63, yb[fases[fases.length - 1]] - 4, { w: 1, dash: '2 2' }) + tD(64, yb[fases[0]] - 13, d.dg.In ? `DG ${d.dg.polos}P ${d.dg.In} A` : 'DG', { fs: 9.5, anc: 'middle' });
  if (d.dps) {
    const vivos = d.dps.semNPE ? [...fases] : [...fases, 'N'], yD = yBot + 26, xs = vivos.map((k, i) => 124 + i * 14);
    let yC = yD + 34;
    if (d.dps.lig === 'npe') {
      // n+1: fases ao neutro por varistores; neutro ao PE por centelhador
      const xN = xs[xs.length - 1], yG = yC + 6;
      fases.forEach((k, i) => { g += fioD(xs[i], yb[k], xs[i], yD, k) + noD(xs[i], yb[k], k) + dpsD(xs[i], yD, 20) + lD(xs[i], yD + 20, xs[i], yC); });
      g += lD(xs[0], yC, xN, yC) + fioD(xN, yb.N, xN, yC, 'N') + noD(xN, yb.N, 'N') + `<circle cx="${xN}" cy="${yC}" r="2.6" fill="${DG_COR.ink}"/>`;
      g += `<rect x="${xN - 7}" y="${yG}" width="14" height="20" fill="${DG_COR.face}" stroke="${DG_COR.ink}" stroke-width="1.3"/><polygon points="${xN - 3},${yG + 6} ${xN + 3},${yG + 6} ${xN},${yG + 10}" fill="${DG_COR.ink}"/><polygon points="${xN - 3},${yG + 15} ${xN + 3},${yG + 15} ${xN},${yG + 11}" fill="${DG_COR.ink}"/>`;
      yC = yG + 30; g += lD(xN, yG + 20, xN, yC) + fioD(114, yC, xN, yC, 'PE') + fioD(114, yb.PE, 114, yC, 'PE') + noD(114, yb.PE, 'PE');
    } else {
      vivos.forEach((k, i) => { g += fioD(xs[i], yb[k], xs[i], yD, k) + noD(xs[i], yb[k], k) + dpsD(xs[i], yD, 20) + lD(xs[i], yD + 20, xs[i], yC); });
      g += fioD(114, yC, xs[xs.length - 1], yC, 'PE') + fioD(114, yb.PE, 114, yC, 'PE') + noD(114, yb.PE, 'PE');
    }
    g += tD(110, yC + 18, `DPS classe ${d.dps.classe} · ${d.dps.lig === 'npe' ? `${fases.length}+1` : `${vivos.length}+0`}`, { fs: 9.5 }) + tD(110, yC + 30, d.dps.Iimp ? `Iimp ${nfmt(d.dps.Iimp, 1)} kA · Uc ${d.dps.Uc} V` : `Uc ${d.dps.Uc} V · In ${nfmt(d.dps.In, 0)} kA`, { fs: 9, cor: DG_COR.mut });
  }
  // legenda das cores
  [['A', 'fase A — preto'], ['B', 'fase B — vermelho'], ['C', 'fase C — branco'], ['N', 'neutro — azul-claro'], ['PE', 'proteção — verde-amarelo']].filter(([k]) => cond.includes(k)).forEach(([k, l], i) => {
    const y = yT + 20 + i * 18; g += fioD(16, y, 44, y, k) + tD(50, y + 3.5, l, { fs: 9.5 });
  });
  g += tD(16, yT + 20 + 5 * 18 + 6, 'N e PE: NBR 5410, 6.1.5.3', { fs: 8.5, cor: DG_COR.mut }) + tD(16, yT + 20 + 5 * 18 + 18, 'fases: convenção do projeto', { fs: 8.5, cor: DG_COR.mut });
  // circuitos
  rows.forEach((c, j) => {
    const xc = x0 + dx * (j + 0.5), ws = [...c.fs, ...(c.N ? ['N'] : []), ...(c.PE ? ['PE'] : [])], sp = 9, xs = ws.map((k, i) => xc - (ws.length - 1) * sp / 2 + i * sp), nF = c.fs.length;
    ws.forEach((k, i) => {
      const x = xs[i], fase = i < nF, noDR = c.dr && (fase || k === 'N');
      if (fase) {
        g += fioD(x, yb[k], x, yBrk, k) + (c.fus ? fusV(x, yBrk, yBrk + 24) : disjV(x, yBrk, yBrk + 24, undefined, 6));
        g += fioD(x, yBrk + 24, x, noDR ? yDR : yLoad, k);
      } else g += fioD(x, yb[k], x, noDR ? yDR : yLoad, k);
      if (noDR) g += interV(x, yDR, yDR + 22, 6) + fioD(x, yDR + 22, x, yLoad, k);
      g += noD(x, yb[k], k);
    });
    if (nF > 1 && !c.fus) g += lD(xs[0] + 3, yBrk + 11, xs[nF - 1] + 3, yBrk + 11, { w: 1, dash: '2 2' });
    if (c.dr) {
      const nd = nF + (c.N ? 1 : 0), xa = xs[0], xz = xs[nd - 1];
      g += `<ellipse cx="${((xa + xz) / 2).toFixed(1)}" cy="${yTor}" rx="${((xz - xa) / 2 + 7).toFixed(1)}" ry="4.5" fill="none" stroke="${DG_COR.acc}" stroke-width="1.5"/>`;
      g += lD(xz + 7, yTor - 3, xz + 7, yDR + 11, { cor: DG_COR.acc, w: 1, dash: '2 2' }) + lD(xa + 3, yDR + 11, xz + 7, yDR + 11, { cor: DG_COR.acc, w: 1, dash: '2 2' });
    }
    const bw = Math.max(ws.length * sp + 10, String(c.num).length * 7 + 10);
    g += `<rect x="${(xc - bw / 2).toFixed(1)}" y="${yLoad}" width="${bw.toFixed(1)}" height="20" rx="3" fill="${DG_COR.face}" stroke="${DG_COR.ink}" stroke-width="1.2"/>` + tD(xc, yLoad + 14, c.num, { fs: 10, b: true, anc: 'middle' });
    const len = H - 10 - yT, lin = (dxl, s, o) => `<text transform="translate(${(xc + dxl).toFixed(1)},${yT}) rotate(-90)" text-anchor="end" font-size="${o.fs}" fill="${o.cor || DG_COR.ink}" font-family="Arial, Helvetica, sans-serif">${escD(cortaD(s, Math.floor(len / (o.fs * 0.56))))}</text>`;
    g += lin(-3, c.desc + (c.alimenta ? ` → ${c.alimenta}` : ''), { fs: 10 }) + lin(9, `${nfmt(c.S, 0)} VA · ${c.prot}${c.fus ? '' : ` ${c.polos}P`}${c.dr ? ` · ${c.dr.tipo} ${c.dr.idn} mA` : ''} · ${c.cabo}`, { fs: 9, cor: DG_COR.mut });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagrama multifilar do quadro ${escD(d.nome)}">${g}</svg>`;
}
/* blocos de circuitos por figura */
function partesDiagrama(d, tipo) {
  const mx = tipo === 'multi' ? DIAG_MULTI : DIAG_UNI, n = Math.max(1, Math.ceil(d.cs.length / Math.ceil(d.cs.length / mx))), out = [];
  for (let i = 0; i < Math.max(1, d.cs.length); i += n) out.push(tipo === 'multi' ? multifilarSVG(d, i, Math.min(d.cs.length, i + n)) : unifilarSVG(d, i, Math.min(d.cs.length, i + n)));
  return out;
}

/* ---------- convenções ---------- */
function convencoesSVG() {
  const W = 760, H = 214; let g = `<rect width="${W}" height="${H}" fill="${DG_COR.face}"/>`;
  const item = (x, y, simb, rot, sub) => simb + tD(x + 66, y + 4, rot, { fs: 10.5, b: true }) + (sub ? tD(x + 66, y + 18, sub, { fs: 9, cor: DG_COR.mut }) : '');
  g += item(16, 34, lD(16, 34, 30, 34) + disjH(30, 56, 34) + lD(56, 34, 70, 34), 'Disjuntor termomagnético', 'NBR NM 60898 / NBR IEC 60947-2');
  g += item(270, 34, lD(270, 34, 284, 34) + fusH(284, 312, 34) + lD(312, 34, 324, 34), 'Fusível gG', 'NBR IEC 60269');
  g += item(520, 34, lD(520, 34, 526, 34) + drH(526, 568, 34) + lD(568, 34, 576, 34), 'Interruptor DR (IDR)', 'NBR NM 61008 — toróide e contato');
  g += item(16, 92, lD(16, 92, 26, 92) + drH(26, 68, 92, true) + lD(68, 92, 76, 92), 'Disjuntor DR (DDR)', 'NBR NM 61009');
  g += item(270, 92, dpsD(296, 78, 22) + lD(296, 100, 296, 106) + terraD(296, 106), 'DPS e aterramento', 'NBR IEC 61643-11 — ligado ao PE');
  g += item(520, 92, lD(540, 74, 540, 112, { w: 5 }) + `<circle cx="540" cy="92" r="2.8" fill="${DG_COR.ink}"/>` + lD(540, 92, 566, 92), 'Barramento e derivação', 'ponto = ligação; cruzamento sem ponto = isolado');
  g += item(16, 152, lD(16, 152, 64, 152) + marcas(40, 152, { fs: ['A', 'B'], N: true, PE: true }), 'Condutores', '/ fase · /o neutro · /┴ proteção (PE)');
  g += item(270, 152, caixaNum(282, 152, '5').s, 'Circuito', 'número do circuito no quadro de cargas');
  let x = 520; ['A', 'B', 'C', 'N', 'PE'].forEach((k, i) => { g += fioD(x + i * 9, 140, x + i * 9, 166, k); });
  g += tD(586, 156, 'Cores dos condutores', { fs: 10.5, b: true }) + tD(586, 170, 'A preto · B vermelho · C branco', { fs: 9, cor: DG_COR.mut }) + tD(586, 182, 'N azul-claro · PE verde-amarelo', { fs: 9, cor: DG_COR.mut });
  g += tD(16, 204, 'Símbolos gráficos conforme a IEC 60617 (prática usual da antiga NBR 5444). Diagramas gerados a partir do dimensionamento dos circuitos.', { fs: 9, cor: DG_COR.mut });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Convenções dos diagramas">${g}</svg>`;
}

/* ---------- documento: diagramas dos quadros ---------- */
const figDiag = (svg, caption) => { const ar = arDe(svg); return { t: 'fig', svg: svgDoc(svg, 760, Math.round(760 * ar)), ar, full: true, px: 1520, w: 180, caption }; };
function construirDiagramas(proj, calc, opt = {}) {
  const o = Object.assign({ assinatura: true }, opt), I = proj.info, P = proj.params, R = calc.res, B = [];
  const Q = Object.values(calc.quadros).filter(q => q.cs.length), f0 = v => nfmt(v, 0);
  B.push({ t: 'title', kicker: 'ABNT NBR 5410:2004 — Instalações elétricas de baixa tensão', text: 'Diagramas unifilares e multifilares', sub: 'Quadros de distribuição — dispositivos de proteção, condutores e distribuição dos circuitos entre as fases' });
  B.push({ t: 'meta', rows: [['Obra', I.obra || '—'], ['Proprietário / cliente', I.cliente || '—'], ['Endereço', [I.endereco, I.cidade].filter(Boolean).join(' — ') || '—'],
    ['Responsável técnico', [I.responsavel, I.registro].filter(Boolean).join(' — ') || '—'], ['ART / TRT / RRT', I.art || '—'], ['Data / revisão', `${dataCurta(I.data) || '—'} — ${I.revisao || 'R00'}`]] });
  let n = 0; const sec = t => { n++; B.push({ t: 'h1', text: `${n}. ${t}` }); return n; };
  sec('Objetivo');
  B.push({ t: 'p', text: `Este documento apresenta os diagramas unifilares e multifilares dos ${Q.length} quadro${Q.length === 1 ? '' : 's'} de distribuição da obra acima identificada: dispositivo geral, dispositivos de proteção contra surtos (DPS), disjuntores e dispositivos DR de cada circuito, condutores com as seções em mm² e distribuição dos circuitos entre as fases, conforme o dimensionamento da memória de cálculo pela ABNT NBR 5410.` });
  sec('Normas e convenções');
  B.push({ t: 'list', items: ['ABNT NBR 5410:2004 Versão Corrigida:2008 — Instalações elétricas de baixa tensão.', 'IEC 60617 — Símbolos gráficos para diagramas (a ABNT NBR 5444 foi cancelada; seus símbolos permanecem de uso corrente).',
    'ABNT NBR IEC 61439-1 e NBR IEC 61439-3 — Quadros de distribuição.', 'ABNT NBR NM 60898, NBR IEC 60947-2, NBR NM 61008 e NBR NM 61009 — Disjuntores e dispositivos DR.', 'ABNT NBR IEC 61643-11 — Dispositivos de proteção contra surtos.'] });
  B.push(figDiag(convencoesSVG(), 'Convenções adotadas nos diagramas.'));
  Q.forEach(q => {
    const d = dadosQuadro(proj, calc, q.q), s = sec(`Quadro ${q.q}${d.desc ? ' — ' + d.desc : ''}`);
    B.push({ t: 'kv4', rows: [['Alimentação', [d.ent.txt, d.ent.cabo].filter(Boolean).join(' — ')], ['Dispositivo geral', d.dg.In ? `Disjuntor ${d.dg.polos}P ${d.dg.In} A` : 'a definir'],
      ['DPS', d.dps ? `Classe ${d.dps.classe}, ${d.dps.Iimp ? `Iimp ${nfmt(d.dps.Iimp, 1)} kA (10/350 µs), ` : ''}Uc ${d.dps.Uc} V, In ${nfmt(d.dps.In, 0)} kA${d.dps.Up ? `, Up ≤ ${nfmt(d.dps.Up, 1)} kV` : ''} — ${d.dps.ligTxt || `${d.usadas.length} fase(s) e neutro ao PE`}` : 'não previsto neste quadro'], ['Demanda', `${f0(q.dem.S)} VA${q.dem.manual ? ' (informada)' : ` — FD ${f0(q.dem.fd * 100)} %`}`]].reduce((a, r, i) => (i % 2 ? a[a.length - 1].push(...r) : a.push([...r]), a), []) });
    const uni = partesDiagrama(d, 'uni'), multi = partesDiagrama(d, 'multi'), alt = svg => Math.min(250, 172 * arDe(svg) + 22);
    B.push({ t: 'h2', text: `${s}.1 Diagrama unifilar`, keep: alt(uni[0]) });
    uni.forEach((svg, i, l) => B.push(figDiag(svg, `Diagrama unifilar do quadro ${q.q}${l.length > 1 ? ` — parte ${i + 1} de ${l.length}` : ''}.`)));
    B.push({ t: 'h2', text: `${s}.2 Diagrama multifilar`, keep: alt(multi[0]) });
    multi.forEach((svg, i, l) => B.push(figDiag(svg, `Diagrama multifilar do quadro ${q.q}${l.length > 1 ? ` — parte ${i + 1} de ${l.length}` : ''}: barramentos de fase, neutro e proteção, dispositivos de cada circuito e cores dos condutores.`)));
    B.push({ t: 'h2', text: `${s}.3 Relação dos circuitos` });
    B.push({ t: 'table', small: true, head: ['Circ.', 'Descrição', 'Fases', 'Condutores', 'Proteção', 'DR', 'S (VA)'], widths: [7, 33, 8, 22, 11, 11, 8], align: 'llllllr',
      rows: d.cs.map(c => [c.num, c.desc + (c.alimenta ? ` → ${c.alimenta}` : ''), c.fs.join('-') + (c.N ? '-N' : ''), c.cabo, `${c.prot}${c.fus ? '' : ` ${c.polos}P`}`, c.dr ? `${c.dr.tipo} ${c.dr.In ?? '?'} A / ${c.dr.idn} mA` : '—', f0(c.S)]) });
    B.push({ t: 'note', text: `Reserva de espaço para ${d.reserva} circuito(s) futuro(s), conforme a Tabela 59 da NBR 5410 (${d.cs.length} circuitos).` });
  });
  sec('Notas');
  B.push({ t: 'list', items: [
    'Seções dos condutores em mm², cobre salvo indicação; condutores e dispositivos conforme a memória de cálculo dos circuitos.',
    'Neutro na cor azul-claro e condutor de proteção em verde-amarelo (NBR 5410, 6.1.5.3); cores das fases conforme a convenção do projeto.',
    `DPS ligados entre cada condutor vivo e o barramento de proteção, com condutores de ligação curtos e retilíneos; Uc ≥ 1,1 × U0 = ${nfmt(1.1 * P.U0, 0)} V.`,
    'Barramentos de neutro e de proteção independentes e identificados; o barramento de proteção é ligado ao BEP e ao eletrodo de aterramento.',
    'Antes da energização, conferir os diagramas com o quadro montado e realizar os ensaios da seção 7 da NBR 5410.'] });
  if (o.assinatura) B.push({ t: 'sign', place: [I.cidade, dataExtenso(I.data)].filter(Boolean).join(', '), name: I.responsavel || 'Responsável técnico', reg: [I.registro, I.art ? 'ART ' + I.art : ''].filter(Boolean).join(' — ') });
  return B;
}

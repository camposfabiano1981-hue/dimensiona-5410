/* ================================================================
   DPS — memória de cálculo da proteção contra surtos
   ================================================================ */
const VER_DPS = { ok: true, fail: false, warn: false };

/* ---------- desenhos de ligação dos DPS: NBR 5410, Figura 13 (esquemas 1, 2 e 3), ligação em T e em V ---------- */
const ESQ_DPS = { 1: 'Esquema de conexão 1 (Figura 13) — DPS entre cada fase e o BEP / PE; neutro aterrado no BEP', 2: 'Esquema de conexão 2 (Figura 13) — DPS entre cada condutor vivo (fases e neutro) e o PE', 3: 'Esquema de conexão 3 (Figura 13) — DPS entre fases e neutro; centelhador entre neutro e PE' };
function centD(x, y, h = 22) {
  const m = y + h / 2;
  return `<rect x="${x - 7}" y="${y}" width="14" height="${h}" fill="${DG_COR.face}" stroke="${DG_COR.ink}" stroke-width="1.3"/><polygon points="${x - 3.5},${m - 6} ${x + 3.5},${m - 6} ${x},${m - 1.5}" fill="${DG_COR.ink}"/><polygon points="${x - 3.5},${m + 6} ${x + 3.5},${m + 6} ${x},${m + 1.5}" fill="${DG_COR.ink}"/>`;
}
function ligacaoDPSSVG(r, o = {}) {
  const W = 480, H = 300, fases = r.fases && r.fases.length ? r.fases : ['A', 'B', 'C'].slice(0, r.nF || 3), cond = [...fases, 'N'], yb = {};
  cond.forEach((k, i) => { yb[k] = 62 + i * 15; });
  const xIni = 36, xFim = 464, x0 = 186, dx = 42, yPE = 244, hD = 26, emV = !!r.emV, F2 = r.F2 && !emV ? r.F2 : null, yDps = F2 ? 160 : 138;
  const rot = k => k === 'N' ? 'N' : `L${fases.indexOf(k) + 1}`, cota = { w: 0.9, cor: DG_COR.acc }, txC = (x, y, t, anc = 'end', b = true) => tD(x, y, t, { fs: 9, anc, cor: DG_COR.acc, b });
  let g = `<rect width="${W}" height="${H}" fill="${DG_COR.face}"/>` + tD(12, 20, o.titulo || `${r.q} — DPS classe ${r.classe}`, { fs: 12.5, b: true }) + tD(12, 35, o.sub || ESQ_DPS[r.esquema], { fs: 9.2, cor: DG_COR.mut });
  // condutores vivos que chegam ao quadro e proteção a montante F1 (fusível ou disjuntor)
  cond.forEach(k => { g += fioD(xIni, yb[k], xFim, yb[k], k) + tD(xIni - 6, yb[k] + 3.5, rot(k), { fs: 9.5, b: true, anc: 'end' }); });
  fases.forEach(k => { g += `<rect x="80" y="${yb[k] - 3}" width="28" height="6" fill="${DG_COR.face}"/>` + disjH(82, 106, yb[k]); });
  g += tD(72, yb[fases[0]] - 13, `${o.f1 || (r.Imont ? `F1 ${r.Imont} A` : 'F1')} — fusível ou disjuntor`, { fs: 9, cor: DG_COR.mut }) + tD(xFim, 50, 'para os circuitos →', { fs: 8.5, anc: 'end', cor: DG_COR.mut });
  // ligação em V: o condutor é interrompido, desce até o borne do DPS e volta a subir; em T, derivação do condutor
  const desce = (x, k) => {
    if (emV) return `<rect x="${x - 12}" y="${yb[k] - 3}" width="24" height="6" fill="${DG_COR.face}"/>` + fioD(x - 11, yb[k], x - 1.5, yDps, k) + fioD(x + 1.5, yDps, x + 11, yb[k], k) + noD(x - 11, yb[k], k) + noD(x + 11, yb[k], k);
    return fioD(x, yb[k], x, yDps, k) + noD(x, yb[k], k) + (F2 && k !== 'N' ? fusV(x, 128, 150) : '');
  };
  const xs = [], lista = r.esquema === 1 ? fases : cond, vPE = emV && r.esquema !== 3;
  if (r.esquema === 3) {
    const xN = x0 + fases.length * dx, yNo = yDps + hD + 12;
    fases.forEach((k, i) => { const x = x0 + i * dx; xs.push(x); g += desce(x, k) + dpsD(x, yDps, hD) + lD(x, yDps + hD, x, yNo); });
    g += fioD(x0, yNo, xN, yNo, 'N') + fioD(xN, yb.N, xN, yNo, 'N') + noD(xN, yb.N, 'N') + `<circle cx="${xN}" cy="${yNo}" r="2.6" fill="${DG_COR.ink}"/>`
      + lD(xN, yNo, xN, yNo + 6) + centD(xN, yNo + 6, 22) + fioD(xN, yNo + 28, xN, yPE, 'PE') + noD(xN, yPE, 'PE') + tD(xN + 12, yNo + 21, 'centelhador N–PE', { fs: 8.5, cor: DG_COR.mut });
  } else if (vPE) {
    // em V, o lado do PE também passa pelo DPS: BEP → borne de terra do DPS → barra PE dos circuitos (≤ 0,5 m)
    const yC = yDps + hD + 16, xL = x0 + (lista.length - 1) * dx, xB = xL + 40;
    lista.forEach((k, i) => { const x = x0 + i * dx; xs.push(x); g += desce(x, k) + dpsD(x, yDps, hD) + fioD(x, yDps + hD, x, yC, 'PE') + noD(x, yC, 'PE'); });
    g += fioD(x0, yC, xB, yC, 'PE') + `<rect x="${xB}" y="${yC - 5}" width="46" height="10" fill="${DG_COR.face}" stroke="${DG_COR.ink}" stroke-width="1.1"/>` + [10, 23, 36].map(d => `<circle cx="${xB + d}" cy="${yC}" r="2.2" fill="none" stroke="${DG_COR.ink}"/>`).join('')
      + tD(xB + 23, yC - 9, 'barra PE', { fs: 8.5, anc: 'middle', cor: DG_COR.mut }) + fioD(x0, yC, x0, yPE, 'PE') + noD(x0, yPE, 'PE')
      + lD(xL, yC + 12, xB, yC + 12, cota) + lD(xL, yC + 8, xL, yC + 16, cota) + lD(xB, yC + 8, xB, yC + 16, cota) + txC((xL + xB) / 2, yC + 24, '≤ 0,5 m', 'middle');
    if (r.esquema === 1) { const xN = xB + 58; g += fioD(xN, yb.N, xN, yPE, 'PE') + noD(xN, yb.N, 'N') + noD(xN, yPE, 'PE') + tD(xN - 6, yPE - 28, 'N aterrado', { fs: 8.5, anc: 'end', cor: DG_COR.mut }) + tD(xN - 6, yPE - 17, 'no BEP (PEN)', { fs: 8.5, anc: 'end', cor: DG_COR.mut }); }
  } else {
    lista.forEach((k, i) => { const x = x0 + i * dx; xs.push(x); g += desce(x, k) + dpsD(x, yDps, hD) + fioD(x, yDps + hD, x, yPE, 'PE') + noD(x, yPE, 'PE'); });
    if (r.esquema === 1) { const xN = x0 + fases.length * dx + 18; g += fioD(xN, yb.N, xN, yPE, 'PE') + noD(xN, yb.N, 'N') + noD(xN, yPE, 'PE') + tD(xN + 8, yPE - 28, 'N aterrado', { fs: 8.5, cor: DG_COR.mut }) + tD(xN + 8, yPE - 17, 'no BEP (PEN)', { fs: 8.5, cor: DG_COR.mut }); }
  }
  // barra de equipotencialização
  g += fioD(132, yPE, xFim, yPE, 'PE', true) + lD(132, yPE, 132, yPE + 8) + terraD(132, yPE + 8) + tD(xFim, yPE + 16, vPE ? 'BEP' : 'barra PE / BEP', { fs: 9, anc: 'end', cor: DG_COR.mut, b: vPE });
  if (F2) g += tD(xs[xs.length - 1] + 14, 142, `F2 ${F2} A gL/gG`, { fs: 8.5, cor: DG_COR.mut });
  // cotas: em T, a (condutor → DPS) e b (DPS → barra PE / BEP), com a + b ≤ 0,5 m; em V com n+1, b ≤ 0,5 m
  const xd = x0 - 26, ya = yb[lista[0]], yb1 = yDps + hD;
  if (!emV) {
    g += lD(xd, ya, xd, yDps, cota) + lD(xd, yb1, xd, yPE, cota) + [ya, yDps, yb1, yPE].map(y => lD(xd - 4, y, xd + 4, y, cota)).join('') + lD(xd, yDps, xd, yb1, { ...cota, dash: '2 2' })
      + txC(xd - 5, (ya + yDps) / 2 + 3, 'a') + txC(xd - 5, (yb1 + yPE) / 2 + 3, 'b') + txC(xd - 16, (ya + yPE) / 2 - 2, 'a + b') + txC(xd - 16, (ya + yPE) / 2 + 10, '≤ 0,5 m');
  } else if (!vPE) {
    g += lD(xd, yb1, xd, yPE, cota) + lD(xd - 4, yb1, xd + 4, yb1, cota) + lD(xd - 4, yPE, xd + 4, yPE, cota) + txC(xd - 6, (yb1 + yPE) / 2 - 2, 'b ≤ 0,5 m') + tD(xd - 6, (yb1 + yPE) / 2 + 10, 'ligação em V', { fs: 8.5, anc: 'end', cor: DG_COR.acc });
  } else g += tD(xd - 6, yDps + 6, 'ligação', { fs: 8.5, anc: 'end', cor: DG_COR.acc }) + tD(xd - 6, yDps + 17, 'em V', { fs: 8.5, anc: 'end', cor: DG_COR.acc });
  // especificação
  const corr = r.classe === 'I+II' ? `Iimp ${nfmt(r.Iimp, 1)} kA` : `In ${nfmt(r.In, 0)} kA`;
  g += tD(12, 279, o.l1 ?? `DPS classe ${r.classe}${r.classe === 'I+II' && r.tec ? ` (${r.tec})` : ''} · Uc ${r.Uc} V · ${corr} · Up ≤ ${nfmt(r.Up, 1)} kV`, { fs: 9.5, b: true })
    + tD(12, 293, o.l2 ?? `${emV ? 'Ligação em V (série): o condutor passa pelo DPS; ΔU desprezível' : 'Ligação em T (paralelo): a + b ≤ 0,5 m'} · condutores de ligação ${fS(r.S)} mm² Cu${F2 ? ` · retaguarda F2 ${F2} A` : ''}`, { fs: 9, cor: DG_COR.mut });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Esquema de ligação do DPS">${g}</svg>`;
}
/* zonas de proteção contra raios (NBR 5419-4) e DPS em cascata */
function zprDPSSVG(c, calc) {
  const W = 560, H = 270, ps = calc.spda && calc.spda.projeto, L = Object.values(c.quadros).filter(r => r.ativo), ent = L.filter(r => r.nivel === 0), dist = L.filter(r => r.nivel > 0);
  const Z = ['#f5f7f9', '#eaf2f6', '#dcebf1', '#cfe3eb'];
  let g = `<rect width="${W}" height="${H}" fill="${Z[0]}"/>`;
  g += `<rect x="120" y="44" width="430" height="216" fill="${Z[1]}" stroke="${DG_COR.acc}" stroke-width="1.4" stroke-dasharray="6 3"/><rect x="290" y="70" width="252" height="182" fill="${Z[2]}" stroke="${DG_COR.acc}" stroke-width="1.2" stroke-dasharray="6 3"/><rect x="446" y="112" width="88" height="96" fill="${Z[3]}" stroke="${DG_COR.acc}" stroke-width="1" stroke-dasharray="4 3"/>`;
  g += tD(12, 20, 'Zonas de proteção contra raios (NBR 5419-4) e DPS em cascata', { fs: 12, b: true }) + tD(12, 60, 'ZPR 0', { fs: 10, b: true, cor: DG_COR.acc }) + tD(12, 72, 'externa', { fs: 8.5, cor: DG_COR.mut })
    + tD(126, 58, 'ZPR 1 — edificação', { fs: 10, b: true, cor: DG_COR.acc }) + tD(296, 84, 'ZPR 2', { fs: 10, b: true, cor: DG_COR.acc }) + tD(452, 126, 'ZPR 3', { fs: 10, b: true, cor: DG_COR.acc });
  if (ps) g += lD(520, 44, 520, 24, { w: 2 }) + `<polyline points="540,6 532,20 538,20 529,34" fill="none" stroke="#c98a00" stroke-width="1.8"/>` + tD(512, 36, `SPDA NP ${ps.base}`, { fs: 9, anc: 'end', cor: DG_COR.mut });
  const caixa = (x, y, r, sub) => `<rect x="${x - 40}" y="${y - 18}" width="80" height="36" rx="3" fill="#fff" stroke="${DG_COR.ink}" stroke-width="1.2"/>` + tD(x, y - 4, r, { fs: 10, b: true, anc: 'middle' }) + tD(x, y + 10, sub, { fs: 8.5, anc: 'middle', cor: DG_COR.mut });
  const corr = r => r.classe === 'I+II' ? `I+II · ${nfmt(r.Iimp, 1)} kA` : `II · In ${nfmt(r.In, 0)} kA`;
  const yE = 156; g += lD(14, yE, 80, yE, { w: 1.8 }) + tD(16, yE - 8, 'rede de BT', { fs: 8.5, cor: DG_COR.mut });
  (ent.length ? ent : [{ q: 'entrada', classe: '—', In: 0 }]).slice(0, 1).forEach(r => { g += caixa(120, yE, r.q, r.classe === '—' ? 'sem DPS' : corr(r)); });
  const ys = dist.slice(0, 4).map((r, i, a) => a.length === 1 ? yE : 100 + i * (130 / Math.max(1, a.length - 1)));
  dist.slice(0, 4).forEach((r, i) => {
    const y = ys[i], up = c.quadros[calc.quadros[r.q].alim.quadro], Lc = +calc.quadros[r.q].alim.L || 0;
    g += lD(160, yE, 205, yE, { w: 1.6 }) + lD(205, yE, 205, y, { w: 1.6 }) + lD(205, y, 250, y, { w: 1.6 }) + caixa(290, y, r.q, corr(r)) + tD(228, y - 5, `${nfmt(Lc, 0)} m`, { fs: 8.5, anc: 'middle', cor: DG_COR.mut });
    if (up && up.q !== (ent[0] || {}).q) g += tD(290, y + 26, `de ${up.q}`, { fs: 8, anc: 'middle', cor: DG_COR.mut });
  });
  if (dist.length > 4) g += tD(290, 246, `+ ${dist.length - 4} quadro(s)`, { fs: 8.5, anc: 'middle', cor: DG_COR.mut });
  const yq = dist.length ? ys[0] : yE;
  g += lD(dist.length ? 330 : 160, yq, 406, yq, { w: 1.4, dash: '5 3' }) + lD(406, yq, 406, 160) + lD(406, 160, 446, 160, { w: 1.4, dash: '5 3' }) + tD(372, yq - 6, 'circuito', { fs: 8.5, anc: 'middle', cor: DG_COR.mut })
    + caixa(490, 160, 'Equip.', c.classe3 ? `III · ${c.classe3.n} ponto(s)` : 'classe III se preciso');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Zonas de proteção e DPS em cascata">${g}</svg>`;
}
/* equipotencialização principal: eletrodo de aterramento, BEP, DPS ligados ao BEP e linhas e tubulações que entram
   (NBR 5410, 6.4.2.1 e nota a da Figura 13; NBR 5419-3 com SPDA) */
function bepDPSSVG(c, calc, proj) {
  const W = 600, H = 432, P = proj.params, b = c.bep, ps = calc.spda && calc.spda.projeto, yG = 262, yB = 228;
  const Q = Object.values(c.quadros), ent = Q.find(r => r.ativo && r.origem), qd = Q.find(r => r.ativo && !r.origem), loc = b.local;
  const bep = loc === 'quadro' ? { x1: 212, x2: 292 } : loc === 'junto' ? { x1: 148, x2: 432 } : { x1: 172, x2: 432 };
  const COR = { tel: '#7a4fb3', agua: '#3b8ed8', terra: '#8a6d3b', parede: '#b9c3cb' };
  const dpsMini = (x, y, h = 22) => `<rect x="${x - 5}" y="${y}" width="10" height="${h}" fill="#fff" stroke="${DG_COR.ink}" stroke-width="1.2"/>` + lD(x - 3, y + h - 4, x + 3, y + 4, { w: 1 });
  const liga = (x, y) => lD(x, y, x, yB, { cor: COR_COND.PE, w: 2 }) + (x > bep.x2 ? lD(x, yB, bep.x2, yB, { cor: COR_COND.PE, w: 2 }) : '') + `<circle cx="${Math.min(x, bep.x2)}" cy="${yB}" r="2.6" fill="${COR_COND.PE}"/>`;
  let g = `<rect width="${W}" height="${H}" fill="#fff"/><rect x="0" y="${yG}" width="${W}" height="${386 - yG}" fill="#f4eee4"/>` + lD(0, yG, W, yG, { w: 1.6, cor: COR.terra });
  g += `<rect x="138" y="44" width="6" height="${yG - 44}" fill="${COR.parede}"/>` + lD(138, 44, 592, 44, { w: 2, cor: COR.parede }) + tD(580, 58, 'edificação', { fs: 9, anc: 'end', cor: DG_COR.mut })
    + tD(12, 20, 'Equipotencialização principal — aterramento, BEP e DPS', { fs: 12.5, b: true }) + tD(12, 35, b.txt, { fs: 9, cor: DG_COR.mut });
  // linha de sinal com DPS no distribuidor geral (DG)
  g += lD(8, 60, 330, 60, { cor: COR.tel, w: 2 }) + tD(10, 54, 'linha de sinal', { fs: 8.5, cor: COR.tel }) + tD(10, 72, '(telefonia, dados)', { fs: 8.5, cor: COR.tel })
    + `<rect x="330" y="50" width="44" height="20" fill="#fff" stroke="${COR.tel}" stroke-width="1.2"/>` + tD(352, 64, 'DG', { fs: 9, b: true, anc: 'middle', cor: COR.tel }) + dpsMini(384, 52, 16) + lD(374, 60, 379, 60, { cor: COR.tel }) + liga(384, 68)
    + tD(392, 64, 'DPS de sinal', { fs: 8.5, cor: COR.tel });
  // quadro de entrada e quadro de distribuição
  const qmB = loc === 'quadro' ? 244 : 180, n = ent ? Math.min(4, ent.lig === 'npe' ? ent.nF + 1 : ent.nPolos) : 4;
  g += `<rect x="200" y="74" width="104" height="${qmB - 74}" fill="#fff" stroke="${DG_COR.ink}" stroke-width="1.3"/>` + tD(252, 88, ent ? ent.q : 'Quadro de entrada', { fs: 10.5, b: true, anc: 'middle' });
  if (qd) g += `<rect x="470" y="74" width="104" height="70" fill="#fff" stroke="${DG_COR.ink}" stroke-width="1.3"/>` + tD(522, 88, qd.q, { fs: 10.5, b: true, anc: 'middle' }) + fioD(482, 134, 562, 134, 'PE', true) + tD(522, 128, 'barra PE', { fs: 8.5, anc: 'middle', cor: DG_COR.mut });
  const neu = P.aterramento === 'TN-C-S' ? 'fases e PEN' : P.aterramento === 'TT' ? 'fases e N (TT)' : 'fases, N e PE (TN-S)';
  g += lD(8, 100, 200, 100, { w: 3 }) + lD(200, 100, 296, 100, { w: 2.2 }) + tD(10, 93, 'rede de BT', { fs: 8.5, cor: DG_COR.mut }) + tD(10, 112, neu, { fs: 8.5, cor: DG_COR.mut });
  if (qd) g += lD(304, 100, 470, 100, { w: 2.2 }) + tD(432, 94, 'alimentador', { fs: 8.5, anc: 'middle', cor: DG_COR.mut });
  // DPS de entrada: junto ao BEP ou no quadro
  if (loc === 'junto') {
    const xs = Array.from({ length: n }, (_, i) => 156 + i * 12);
    g += lD(192, 100, 192, 124) + lD(xs[0], 124, 192, 124) + `<circle cx="192" cy="100" r="2.6" fill="${DG_COR.ink}"/>` + xs.map(x => lD(x, 124, x, 140) + dpsMini(x, 140) + lD(x, 162, x, yB, { cor: COR_COND.PE, w: 2 })).join('') + tD(174, 176, 'DPS', { fs: 8.5, b: true, anc: 'middle' });
    g += fioD(212, 168, 292, 168, 'PE', true) + tD(252, 178, 'barra PE', { fs: 8, anc: 'middle', cor: DG_COR.mut }) + liga(290, 172) + tD(306, 206, 'PE principal', { fs: 8.5, cor: DG_COR.mut });
  } else {
    const xs = Array.from({ length: n }, (_, i) => 220 + i * 16), yPE = loc === 'quadro' ? yB : 168;
    g += xs.map(x => lD(x, 100, x, 112) + `<circle cx="${x}" cy="100" r="2.4" fill="${DG_COR.ink}"/>` + dpsMini(x, 112) + lD(x, 134, x, yPE, { cor: COR_COND.PE, w: 2 })).join('') + tD(xs[n - 1] + 10, 128, 'DPS', { fs: 8.5, b: true });
    if (loc === 'separado') g += fioD(212, 168, 292, 168, 'PE', true) + tD(252, 178, 'barra PE', { fs: 8, anc: 'middle', cor: DG_COR.mut }) + liga(290, 172) + tD(306, 206, 'PE principal', { fs: 8.5, cor: DG_COR.mut });
  }
  // neutro na origem
  if (P.aterramento !== 'TT') g += lD(300, 100, 300, loc === 'quadro' ? yB : 180, { w: 1.6, dash: '4 2' }) + (loc === 'quadro' ? `<circle cx="292" cy="${yB}" r="2.4" fill="${DG_COR.ink}"/>` + lD(300, yB, 292, yB, { w: 1.6, dash: '4 2' }) : lD(300, 180, 300, yB, { w: 1.6, dash: '4 2' }));
  g += tD(310, 150, P.aterramento === 'TN-C-S' ? 'PEN aterrado' : P.aterramento === 'TT' ? 'TT: N não' : 'PE da rede', { fs: 8.5, cor: DG_COR.mut })
    + tD(310, 161, P.aterramento === 'TT' ? 'ligado ao BEP' : 'no BEP', { fs: 8.5, cor: DG_COR.mut });
  // BEP
  g += fioD(bep.x1, yB, bep.x2, yB, 'PE', true) + (loc === 'quadro' ? tD(258, yB + 12, 'barra PE = BEP', { fs: 8.5, b: true, anc: 'middle' }) : tD(bep.x2 - 2, yB - 7, 'BEP', { fs: 10, b: true, anc: 'end' }));
  // tubulações metálicas e armaduras
  g += lD(8, 250, 566, 250, { cor: COR.agua, w: 4 }) + tD(10, 244, 'tubulações (água, gás)', { fs: 8.5, cor: COR.agua }) + `<rect x="405" y="245" width="10" height="10" fill="#fff" stroke="${DG_COR.ink}"/>` + liga(410, 245);
  g += lD(bep.x1 + 4, yB, bep.x1 + 4, yG + 8, { dash: '4 3', w: 1.2 }) + lD(bep.x1 + 4, yG + 8, 141, yG + 8, { dash: '4 3', w: 1.2 }) + lD(141, yG, 141, yG + 14, { w: 3, cor: COR.parede }) + tD(136, yG + 22, 'armaduras / fundação', { fs: 8, anc: 'end', cor: DG_COR.mut });
  // PE principal até o quadro de distribuição
  if (qd) g += lD(bep.x2, yB, bep.x2, 212, { cor: COR_COND.PE, w: 2 }) + lD(bep.x2, 212, 522, 212, { cor: COR_COND.PE, w: 2 }) + lD(522, 212, 522, 144, { cor: COR_COND.PE, w: 2 }) + tD(470, 207, `PE → ${qd.q}`, { fs: 8.5, cor: DG_COR.mut });
  // eletrodo de aterramento (anel do SPDA ou hastes) e condutor de aterramento
  const xa = bep.x1 + 44, e = b.eletrodo;
  g += lD(xa, yB, xa, ps ? 300 : 288, { cor: COR.terra, w: 2.2 }) + tD(xa + 6, 280, `condutor de aterramento${e ? ` ${fS(e.S)} mm²` : ''}`, { fs: 8.5, cor: COR.terra });
  if (ps) {
    g += lD(30, 300, 592, 300, { cor: COR.terra, w: 3 }) + tD(300, 316, 'anel de aterramento do SPDA (arranjo B), interligado ao BEP', { fs: 8.5, anc: 'middle', cor: COR.terra })
      + lD(592, 30, 592, 300, { w: 2 }) + lD(588, 30, 596, 30, { w: 2 }) + tD(584, 238, 'descida do SPDA', { fs: 8.5, anc: 'end', cor: DG_COR.mut }) + `<circle cx="592" cy="300" r="2.6" fill="${COR.terra}"/><circle cx="${xa}" cy="300" r="2.6" fill="${COR.terra}"/>`;
  } else {
    const nh = Math.max(1, Math.min(4, e ? e.n : 3)), xs = Array.from({ length: nh }, (_, i) => xa + i * 50);
    g += lD(xa, 288, xs[nh - 1], 288, { cor: COR.terra, w: 2.2 }) + xs.map(x => lD(x, 288, x, 352, { cor: COR.terra, w: 3 })).join('')
      + tD(xs[nh - 1] + 10, 330, `${e ? `${e.n} haste(s)` : 'hastes'}${e && e.R != null ? ` — R = ${nfmt(e.R, 1)} Ω` : ''}`, { fs: 8.5, cor: COR.terra });
  }
  // notas: seções
  g += `<rect x="0" y="386" width="${W}" height="${H - 386}" fill="#fff"/>`
    + tD(12, 402, `Equipotencialização principal: condutores ≥ ${fS(b.Seq)} mm² Cu (metade do maior PE, ${fS(b.maxPE || 0)} mm²; mínimo 6 e até 25 mm² — NBR 5410).`, { fs: 9, cor: DG_COR.ink })
    + tD(12, 416, ps ? `Com SPDA: ${b.Sbar} mm² Cu entre barramentos e ao aterramento; ${b.Sint} mm² Cu para as instalações metálicas internas (NBR 5419-3).` : 'Linhas de energia e de sinal e tubulações metálicas que entram na edificação: ligadas ao BEP, diretamente ou por DPS.', { fs: 9, cor: DG_COR.ink })
    + tD(12, 429, `DPS de entrada ligados ${b.ligDPS === 'BEP' ? 'ao BEP' : 'à barra PE do quadro'}, com condutores curtos (≤ 0,5 m), retilíneos e sem laços.`, { fs: 9, cor: DG_COR.ink });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Equipotencialização principal: aterramento, BEP e DPS">${g}</svg>`;
}
/* galeria de referência: formas de ligar o DPS */
function formasLigacaoDPS(U0 = 127) {
  const Uc = ucDPS(U0), base = { q: '', fases: ['A', 'B', 'C'], nF: 3, Uc, In: 20, Iimp: 12.5, Up: 1.5, S: 10, Imont: null };
  return [
    [{ ...base, esquema: 1, classe: 'I+II', S: 16 }, 'Esquema 1 — neutro aterrado no BEP', 'TN-C-S no quadro de entrada (PEN separado no BEP): DPS só nas fases, ligados ao BEP.'],
    [{ ...base, esquema: 2, classe: 'II' }, 'Esquema 2 — n+0 (fases e neutro ao PE)', 'TN-S e TT a jusante do DR: um DPS por condutor vivo, todos ao PE.'],
    [{ ...base, esquema: 3, classe: 'II' }, 'Esquema 3 — n+1 (fases ao neutro e centelhador N–PE)', 'TT a montante do DR (3+1): o centelhador N–PE recebe a soma das correntes.'],
    [{ ...base, esquema: 2, classe: 'II', F2: 125, Imont: 200 }, 'Ligação em T (paralelo) com retaguarda F2', 'O DPS fica num ramal com fusível próprio; a + b ≤ 0,5 m; a atuação de F2 tira só o DPS de serviço — use a sinalização remota.'],
    [{ ...base, esquema: 2, classe: 'II', emV: true }, 'Ligação em V (série)', 'O condutor é interrompido e passa pelos bornes do DPS; o lado do PE também: BEP → DPS → barra PE dos circuitos, a ≤ 0,5 m. ΔU desprezível; a proteção a montante (fusível ou disjuntor, dentro do limite do fabricante) é a retaguarda e, se atuar, desliga a instalação.']
  ].map(([r, cap, sub]) => ({ svg: ligacaoDPSSVG(r, { titulo: cap, sub: ESQ_DPS[r.esquema] }), caption: cap, sub }));
}
function construirMemorialDPS(proj, calc, opt = {}) {
  const o = Object.assign({ assinatura: true }, opt), I = proj.info, P = proj.params, c = calc.dps || calcDPS(proj, calc), ps = calc.spda && calc.spda.projeto, B = [];
  const Q = Object.values(c.quadros).filter(r => r.ativo), f1 = v => nfmt(v, 1), f2 = v => nfmt(v, 2);
  B.push({ t: 'title', kicker: 'ABNT NBR 5410:2004 — 6.3.5 · ABNT NBR 5419-4:2026', text: 'Memória de cálculo — proteção contra surtos (DPS)', sub: 'Seleção, coordenação e instalação dos dispositivos de proteção contra surtos nos quadros de distribuição' });
  B.push({ t: 'meta', rows: [['Obra', I.obra || '—'], ['Proprietário / cliente', I.cliente || '—'], ['Endereço', [I.endereco, I.cidade].filter(Boolean).join(' — ') || '—'],
    ['Responsável técnico', [I.responsavel, I.registro].filter(Boolean).join(' — ') || '—'], ['ART / TRT / RRT', I.art || '—'], ['Data / revisão', `${dataCurta(I.data) || '—'} — ${I.revisao || 'R00'}`]] });
  let n = 0; const sec = t => { n++; B.push({ t: 'h1', text: `${n}. ${t}` }); return n; };
  sec('Objetivo');
  B.push({ t: 'p', text: `Este documento apresenta a seleção dos dispositivos de proteção contra surtos (DPS) dos ${Q.length} quadro${Q.length === 1 ? '' : 's'} da obra acima identificada — classe, modos de proteção, tensão de operação contínua, correntes, nível de proteção, condutores de ligação, proteção de retaguarda e coordenação — segundo a ABNT NBR 5410:2004 (6.3.5) e a ABNT NBR 5419-4:2026.` });
  sec('Normas e documentos de referência');
  B.push({ t: 'list', items: ['ABNT NBR 5410:2004 Versão Corrigida:2008 — Instalações elétricas de baixa tensão (6.3.5, Tabelas 31 e 49, Figura 13; influências externas AQ).', 'ABNT NBR 5419-4:2026 — Proteção contra descargas atmosféricas — Parte 4: Sistemas elétricos e eletrônicos internos na estrutura.',
    'ABNT NBR IEC 61643-11:2021 — Dispositivos de proteção contra surtos de baixa tensão — Parte 11: Requisitos e métodos de ensaio para sistemas de baixa tensão em CA.', 'IEC 61643-12:2020 — Seleção e princípios de aplicação de DPS (coordenação); IEC 61643-21 — DPS para linhas de sinal; IEC 62305-4 — nível de proteção efetivo e distância de proteção (Anexo D).',
    'Siemens — Dispositivos de proteção contra surtos DPS 5SD7, catálogo (edição 2021): nível de exposição F, seção dos condutores de ligação pela proteção a montante e distância de proteção.', 'Schneider Electric — Electrical Installation Guide: faixas de Imáx por exposição e ΔU dos condutores de ligação.',
    ...(calc.energisa && Object.keys(calc.energisa.ucs || {}).length ? ['Energisa ETU-124.2 — Especificação técnica de dispositivo de proteção contra surtos (DPS).'] : []), 'Catálogos e instruções dos fabricantes dos DPS escolhidos (retaguarda, Isccr, coordenação e instalação).'] });
  sec('Dados da instalação e critérios');
  B.push({ t: 'table', head: ['Parâmetro', 'Valor adotado'], widths: [42, 58], rows: [
    ['Tensão nominal (U0 / U)', `${P.U0} / ${P.U} V`], ['Esquema de aterramento', P.aterramento], ['SPDA', ps ? `NP ${ps.base} — Iimp ≥ ${f2(ps.Iimp)} kA por modo no ponto de entrada (NBR 5419-4)` : 'não previsto'],
    ...(c.metodo === 'F' ? [['Nível ceráunico Td', c.Td != null ? `${nfmt(c.Td, 0)} dias de trovoada por ano` : 'não informado'], ['Alimentação em baixa tensão', c.sub ? 'totalmente subterrânea (LBT = 0)' : `linha aérea — LBT = ${nfmt(c.LBT, 2)} km`],
      ['Situação da linha e da edificação', `${DELTA_DPS.find(x => x[0] === c.delta)[1]} — δ = ${nfmt(c.delta, 2)}`]] : [['Exposição a surtos', EXPO_DPS[c.exp][1]]]),
    ['Obrigatoriedade do DPS (NBR 5410)', c.necess.txt], ['Corrente nominal dos DPS classe II', c.InTxt],
    ['Equipamentos protegidos', `categoria ${CAT_UW_TXT[c.catEq]} — Uw = ${f1(uwTab31(P.U0, c.catEq))} kV`],
    ['Suportabilidade a impulso (Tabela 31)', `${c.Uw[1]}: IV ${f1(c.Uw[2][0])} kV · III ${f1(c.Uw[2][1])} kV · II ${f1(c.Uw[2][2])} kV · I ${f1(c.Uw[2][3])} kV`], ['Distância de proteção', DIST_DPS[c.critDist]]] });
  B.push({ t: 'list', items: [
    'Obrigatoriedade (NBR 5410, influências externas): DPS obrigatório na edificação com SPDA (AQ3) e na alimentada por linha total ou parcialmente aérea em região com mais de 25 dias de trovoada por ano (AQ2); nos demais casos é recomendado para proteger os equipamentos.',
    'Classe pelas zonas de proteção contra raios (NBR 5419-4:2026, que mantém as ZPR): na fronteira ZPR 0 → 1 (entrada da linha), DPS classe I+II quando a estrutura tem SPDA ou a linha aérea está exposta a descargas diretas (área rural, fim de rede) e classe II nos demais casos; na fronteira ZPR 1 → 2 (quadros de distribuição), classe II; na ZPR 2 → 3 (junto ao equipamento sensível), classe III — critério também adotado pelos fabricantes (Clamper, Finder, Siemens).',
    'Tensão de operação contínua (Tabela 49): Uc ≥ 1,1 × U0 nos modos das fases e Uc ≥ U0 no modo neutro–PE. Modos pela Figura 13: neutro aterrado no BEP — DPS só nas fases (esquema 1); TN-S — fases e neutro ao PE (esquema 2); TT a montante do DR — fases ao neutro e centelhador N–PE (esquema 3).',
    c.metodo === 'F' ? `Corrente nominal dos DPS classe II pelo nível de exposição F = Td × (1,6 + 2 × LBT + δ), com LBT em km (até 0,5) e δ pela situação da linha: F ≤ 40 → In 5 kA; 40 < F ≤ 80 → In 10 kA; F > 80 → In 20 kA (catálogo Siemens); Imáx ≈ 2 × In; mínimo de 5 kA da NBR 5410.`
      : `Corrente nominal dos DPS classe II pela exposição, segundo as faixas do guia Schneider e dos catálogos: Imáx de ${EXPO_DPS.baixa[0]} kA (baixa), ${EXPO_DPS.media[0]} kA (média) ou ${EXPO_DPS.alta[0]} kA (alta), com In ≈ Imáx / 2 e mínimo de 5 kA da NBR 5410.`,
    'Corrente de impulso dos DPS classe I+II: metade da corrente de pico do nível de proteção do SPDA vai para o aterramento e a outra metade se divide entre os serviços metálicos que entram na estrutura e entre os condutores de cada um — Iimp = Ip × 0,5 / (n serviços × m condutores) (NBR 5419-1, Anexo E), com mínimo de 12,5 kA por modo; na ligação n+1, o centelhador N–PE com a soma das correntes (sem Iimp determinada, 50 kA trifásico ou 25 kA monofásico) e In ≥ 20 kA trifásico ou 10 kA monofásico (NBR 5410, 6.3.5.2.4). Centelhadores: corrente subsequente interrompida Ifi ≥ curto-circuito presumido; N–PE com Ifi ≥ 100 A (NBR 5410).',
    'Nível de proteção: Up ≤ suportabilidade da categoria II (Tabela 31); nível efetivo Up/f = Up + ΔU para varistores e Up/f = máx(Up; ΔU) para centelhadores, com ΔU ≈ 1 kV por metro de condutor de ligação nas classes I e II (≈ 8 kA em 8/20 µs — guia Schneider; IEC 62305-4) e desprezível na ligação em V.',
    c.critDist === 'fab' ? `Distância de proteção: ${D_PROT_FAB} m entre o DPS do quadro e o equipamento, medidos pelo circuito; acima disso, DPS complementar junto ao equipamento (prática de fabricante, catálogo Siemens).`
      : `Distância de proteção por oscilação: lpo = (Uw − Up/f) / ${K_OSC} V/m; circuitos terminais mais longos que lpo pedem DPS classe III junto aos equipamentos, salvo quando o circuito tem menos de 10 m ou Up/f < Uw/2 (IEC 62305-4, Anexo D).`,
    'Condutores de ligação: comprimento total até 0,5 m (condutor vivo → retaguarda → DPS → barramento PE), ou ligação em V (série) quando maior; seção mínima de 4 mm² Cu, ou 16 mm² Cu para DPS classe I / estrutura com SPDA (NBR 5410), e não inferior à indicada pelo fabricante para a proteção a montante, que define a corrente de curto-circuito a suportar (catálogo Siemens).',
    'Proteção de retaguarda: a corrente máxima indicada pelo fabricante; se a proteção a montante for maior (catálogo Siemens) ou se o curto-circuito presumido passar do suportado pelo desligador interno do DPS (catálogo Clamper), fusível ou disjuntor dedicado por fase no ramal do DPS com o valor indicado — valores menores podem romper com surtos abaixo dos nominais do DPS. O conjunto DPS + retaguarda deve ser o ensaiado pelo fabricante (modelo, corrente e curva), com capacidade de interrupção e Isccr ≥ curto-circuito presumido no quadro; o desligador térmico interno, sozinho, não dispensa a retaguarda.',
    `Coordenação entre estágios: produtos declarados coordenados pelo fabricante ou pelo menos ${D_COORD} m de cabo entre eles (IEC 61643-12, informativo), ou indutor de desacoplamento.`,
    `DPS a jusante de DR: o DR, instantâneo ou temporizado, deve ter imunidade a correntes de surto de no mínimo ${IMUN_DR} kA (8/20 µs); DR tipo S recomendado.`,
    'Linhas de sinal: toda linha externa de sinal (telefonia, dados, vídeo, antena) recebe DPS no ponto de entrada da edificação, ligado ao BEP (ou ao BEL mais próximo nas linhas que vão a outras edificações ou antenas); componentes de sinal na entrada suportam no mínimo 1,5 kV de impulso (NBR 5410, nota da Tabela 31). Todas as linhas e tubulações metálicas que entram na edificação são equipotencializadas no BEP, diretamente ou por DPS.'] });
  const sQ = sec('Seleção por quadro');
  Q.forEach((r, i) => {
    B.push({ t: 'h2', text: `${sQ}.${i + 1} Quadro ${r.q}${r.desc ? ' — ' + r.desc : ''}` });
    B.push({ t: 'kv4', rows: [['Posição', `${r.origem ? 'Ponto de entrada (origem)' : 'Quadro de distribuição'} — fronteira ${r.zpr}`, 'Classe', r.classe], ['Ligação', r.ligTxt, 'Uc', `${r.Uc} V${r.semNPE ? '' : ` (N–PE ${r.UcN} V)`}`],
      ['Produto de referência', r.prod ? `${r.prod.fab} ${r.prod.mod} ou equivalente` : 'genérico — valores típicos', 'Retaguarda F2', r.F2 ? `${r.backTipo === 'fus' ? 'fusível gL/gG' : 'disjuntor'} ${r.F2} A${r.backIcn ? ` · ${nfmt(r.backIcn, 0)} kA` : ''}` : 'não exigida (F1 a montante)'],
      ...(r.classe === 'I+II' ? [['Tecnologia', TEC_DPS[r.tec], 'Ligação dos condutores', r.emV ? 'em V — série (ΔU desprezível)' : 'em T — paralelo']] : []),
      ['Correntes', r.classe === 'I+II' ? `Iimp ${f2(r.Iimp)} kA (10/350 µs) por modo${r.lig === 'npe' ? `; N–PE ${f1(r.IimpNPE)} kA` : ''}; In ${nfmt(r.In, 0)} kA` : `In ${nfmt(r.In, 0)} kA; Imáx ${r.Imax} kA (8/20 µs)${r.lig === 'npe' ? `; N–PE In ${nfmt(r.InNPE, 0)} kA` : ''}`, 'Nível de proteção', `Up ≤ ${f2(r.Up)} kV; Up/f = ${f2(r.Upf)} kV${r.UpPE != null ? `; fase–PE ${f2(r.UpPE)} kV` : ''}`],
      ['Condutores de ligação', `${f2(r.L)} m · ${fS(r.S)} mm² Cu`, 'Proteção a montante', r.Imont ? `${r.Imont} A${r.F2 ? ` · retaguarda F2 de ${r.F2} A` : ''}` : 'não informada'],
      ['Retaguarda do fabricante', r.back ? `até ${r.back} A` : 'conforme o fabricante', 'Distância de proteção', r.soDist ? 'quadro só de distribuição' : r.distDispensa ? 'dispensada (Up/f < Uw/2)' : c.critDist === 'fab' ? `${D_PROT_FAB} m (fabricante)` : `lpo = ${f1(r.dProt)} m`]] });
    r.verifs.forEach(([st, t]) => B.push(st === 'info' ? { t: 'note', text: t } : { t: 'ver', ok: VER_DPS[st], text: t }));
    const sl = ligacaoDPSSVG(r);
    if (c.mem.ligacao) B.push({ t: 'fig', svg: svgDoc(sl, 480, 300), ar: 0.625, px: 960, w: 112, caption: `Esquema de ligação dos DPS do ${r.q}: ${ESQ_DPS[r.esquema].split(' — ')[0].toLowerCase()}, ${r.emV ? 'ligação em V (série)' : 'ligação em T (paralelo)'}${r.F2 ? `, retaguarda F2 de ${r.F2} A` : ''}; condutores de ligação de ${fS(r.S)} mm².` });
  });
  const prods = [...new Map(Q.filter(r => r.prod).map(r => [r.prod.id, r.prod])).values()];
  if (prods.length) {
    sec('Produtos de referência');
    B.push({ t: 'table', small: true, head: ['Fabricante e modelo', 'Classe', 'Uc', 'In / Imáx', 'Iimp', 'Up', 'Retaguarda / Isccr'], widths: [30, 9, 9, 13, 9, 9, 21], align: 'lllllll',
      rows: prods.map(x => [`${x.fab} ${x.mod}`, x.classe, `${x.Uc} V`, `${x.In} / ${x.Imax || '—'} kA`, x.Iimp ? `${nfmt(x.Iimp, 1)} kA` : '—', `${nfmt(x.Up, 1)} kV`, `${x.back ? `${x.back} A gL/gG` : '—'}${x.isccr ? ` · ${x.isccr} kA` : ''}${x.iscSem ? ` (sem retaguarda ${x.iscSem} kA)` : ''}`]) });
    B.push({ t: 'note', text: `Valores declarados pelos fabricantes (${prods.map(x => x.fonte).join('; ')}). São referência de especificação — admite-se produto equivalente que atenda às mesmas verificações; confira a versão e a configuração do produto na ficha técnica.` });
  }
  sec(c.mem.zpr ? 'Zonas de proteção, classe III e coordenação' : 'Classe III e coordenação');
  const sz = zprDPSSVG(c, calc);
  if (c.mem.zpr) B.push({ t: 'fig', svg: svgDoc(sz, 560, 270), ar: 270 / 560, full: true, px: 1120, w: 172, caption: 'Zonas de proteção contra raios (NBR 5419-4) e DPS em cascata: entrada na fronteira ZPR 0 → 1, quadros na ZPR 1 → 2 e DPS classe III junto aos equipamentos sensíveis (ZPR 2 → 3).' });
  const longe = Q.filter(r => r.foraDist && r.foraDist.length).map(r => `${r.q} (circuitos ${r.foraDist.join(', ')}; distância de proteção ${f1(r.dProt)} m)`);
  B.push({ t: 'p', text: (c.classe3 ? `Previstos ${c.classe3.n} DPS classe III (Uc ${c.classe3.Uc} V) junto aos equipamentos sensíveis, coordenados com os DPS do quadro que os alimenta.` : 'Não foram indicados pontos com equipamentos sensíveis que exijam DPS classe III; avaliar junto a equipamentos eletrônicos distantes do quadro.')
    + (longe.length ? ` Circuitos além da distância de proteção do DPS do quadro: ${longe.join('; ')} — os equipamentos sensíveis alimentados por eles devem receber DPS classe III próprio.` : '') });
  B.push({ t: 'p', text: `Os DPS em cascata (entrada → quadros → equipamentos) devem ser do mesmo fabricante ou declarados coordenados por ele; na falta dessa declaração, recomenda-se pelo menos ${D_COORD} m de cabo entre os estágios (IEC 61643-12, informativo) ou indutor de desacoplamento, observada a instrução do fabricante.` });
  const sS = sec('Linhas de sinal');
  B.push({ t: 'p', text: c.sinal.length ? `Linhas externas de sinal que entram na edificação, com DPS no ponto de entrada ligado ao BEP (categoria de ensaio ${c.catSinal}, IEC 61643-21):` : 'Não foram informadas linhas externas de sinal. Toda linha que vier a entrar na edificação (telefonia, dados, vídeo, antena) deve receber DPS no ponto de entrada, ligado ao BEP (NBR 5410).' });
  if (c.sinal.length) B.push({ t: 'table', head: ['Linha', 'Quantidade', 'DPS'], widths: [34, 14, 52], align: 'lrl', rows: c.sinal.map(x => [x.nome, String(x.n), x.mat]) });
  const formas = formasLigacaoDPS(P.U0);
  if (c.mem.vt) {
    sec('Ligação em V e em T');
    B.push({ t: 'p', text: `Os condutores de ligação do DPS podem ser derivados do barramento até o DPS e do DPS à barra PE (ligação em T, paralelo), com a + b ≤ 0,5 m, ou o condutor de chegada pode entrar e sair pelos bornes do DPS (ligação em V, série), restando só o trecho b até a barra PE (IEC 60364-5-534; NBR 5410). Neste projeto: ${Q.map(r => `${r.q} em ${r.emV ? 'V' : 'T'}`).join('; ')}.` });
    B.push({ t: 'table', small: true, head: ['Aspecto', 'T — paralelo (derivação)', 'V — série (passante)'], widths: [20, 40, 40], align: 'lll', rows: VT_DPS.map(x => x.slice()) });
    formas.slice(3).forEach(f => B.push({ t: 'fig', svg: svgDoc(f.svg, 480, 300), ar: 0.625, px: 960, w: 112, caption: `${f.caption}. ${f.sub}` }));
  }
  if (c.mem.formas) {
    sec('Formas de ligação dos DPS (Figura 13)');
    B.push({ t: 'p', text: 'A NBR 5410 (Figura 13) define três esquemas de conexão conforme o neutro e o esquema de aterramento: neutro aterrado no BEP — DPS só nas fases (esquema 1); DPS entre cada condutor vivo e o PE (esquema 2); DPS entre fases e neutro e centelhador entre neutro e PE (esquema 3). O esquema adotado em cada quadro está na seção de seleção.' });
    formas.slice(0, 3).forEach(f => B.push({ t: 'fig', svg: svgDoc(f.svg, 480, 300), ar: 0.625, px: 960, w: 112, caption: `${f.caption}. ${f.sub}` }));
  }
  if (c.mem.bep) {
    const bp = c.bep, ps2 = calc.spda && calc.spda.projeto, TT = P.aterramento === 'TT';
    sec('Equipotencialização principal (BEP)');
    B.push({ t: 'p', text: `O barramento de equipotencialização principal (BEP) fica junto ou próximo do ponto de entrada da alimentação. Neste projeto: ${minIni(bp.txt)}. Pela nota a da Figura 13 da NBR 5410, os DPS são ligados ao BEP quando instalados junto a ele ou quando a barra PE do quadro principal acumula a função de BEP, e à barra PE do quadro quando ela não é o BEP.` });
    B.push({ t: 'list', items: [
      `Condutor de aterramento, do eletrodo ao BEP${bp.eletrodo ? ` — ${bp.eletrodo.nome}, ${fS(bp.eletrodo.S)} mm² Cu${bp.eletrodo.R != null ? `, R = ${f1(bp.eletrodo.R)} Ω` : ''}` : ''}.`,
      'Condutor(es) de proteção principal(is) da instalação — barra PE dos quadros.',
      TT ? 'Neutro: no esquema TT o neutro da alimentação não é ligado ao BEP.' : `Neutro da alimentação (${P.aterramento === 'TN-C-S' ? 'PEN de chegada, aterrado no BEP' : 'PE da rede ligado ao BEP'}).`,
      `DPS das linhas de energia (ligados ao ${bp.ligDPS}) e DPS das linhas de sinal que entram na edificação.`,
      'Tubulações metálicas de água, gás, esgoto e ar-condicionado; condutos, blindagens e capas metálicas de cabos que entram ou saem da edificação.',
      'Armaduras do concreto e demais elementos estruturais metálicos.',
      ...(ps2 ? ['Subsistema de aterramento do SPDA (anel, arranjo B) e descidas, interligados ao BEP — equipotencialização para descargas atmosféricas (NBR 5419-3).'] : [])] });
    B.push({ t: 'table', head: ['Condutor', 'Seção mínima (cobre)', 'Referência'], widths: [46, 22, 32], rows: [
      ['Equipotencialização principal (ao BEP)', `${fS(bp.Seq)} mm²`, `NBR 5410 — metade do maior PE (${fS(bp.maxPE || 0)} mm²), mínimo 6 mm², até 25 mm²`],
      ...(bp.eletrodo ? [['Condutor de aterramento (eletrodo → BEP)', `${fS(bp.eletrodo.S)} mm²`, 'adotado no projeto de aterramento']] : []),
      ...(ps2 ? [['Entre barramentos e ao subsistema de aterramento', `${bp.Sbar} mm²`, 'NBR 5419-3 (com SPDA)'], ['Instalações metálicas internas ao barramento', `${bp.Sint} mm²`, 'NBR 5419-3 (com SPDA)']] : []),
      ['DPS de entrada ao BEP / barra PE', `${fS((Q.find(r => r.origem) || {}).S || 16)} mm²`, 'NBR 5410 e fabricante — condutor ≤ 0,5 m']] });
    const sb = bepDPSSVG(c, calc, proj);
    B.push({ t: 'fig', svg: svgDoc(sb, 600, 432), ar: 432 / 600, full: true, px: 1200, w: 172, caption: `Equipotencialização principal: eletrodo de aterramento, BEP, DPS de entrada ligados ao ${bp.ligDPS}, linha de sinal com DPS no DG, tubulações metálicas e armaduras${ps2 ? ', com o anel de aterramento e a descida do SPDA' : ''}.` });
  }
  sec('Instalação');
  B.push({ t: 'list', items: ['Instalar os DPS junto ao barramento de proteção do quadro, com condutores curtos, retilíneos e sem laços; preferir a ligação em V (entrada e saída nos mesmos bornes) quando o comprimento passar de 0,5 m.',
    'Manter separados os condutores de chegada (não protegidos) e os condutores já protegidos que saem do quadro, sem percursos paralelos próximos, para evitar o reacoplamento do surto.',
    'Proteger cada conjunto de DPS pela retaguarda indicada pelo fabricante (de preferência fusível gL/gG), com indicação de fim de vida visível; na ligação em paralelo, ligar o contato de sinalização remota, pois a atuação da retaguarda tira o DPS de serviço sem desligar a instalação.', 'Interligar o barramento PE dos quadros ao BEP; com SPDA, ligar o DPS de entrada ao BEP pelo caminho mais curto. Equipotencializar no BEP todas as linhas e tubulações metálicas que entram na edificação.',
    'Inspecionar os DPS periodicamente e após descargas atmosféricas na região, substituindo os módulos sinalizados.'] });
  sec('Conclusão');
  const fal = Q.filter(r => r.status === 'fail');
  B.push({ t: 'p', text: fal.length ? `Os DPS dos quadros ${fal.map(r => r.q).join(', ')} não atendem a todas as verificações; ajuste a especificação conforme indicado.` : `Os DPS especificados para os ${Q.length} quadros atendem às verificações de tensão, corrente, nível de proteção e instalação da ABNT NBR 5410 e da ABNT NBR 5419-4.` });
  if (o.assinatura) B.push({ t: 'sign', place: [I.cidade, dataExtenso(I.data)].filter(Boolean).join(', '), name: I.responsavel || 'Responsável técnico', reg: [I.registro, I.art ? 'ART ' + I.art : ''].filter(Boolean).join(' — ') });
  return B;
}

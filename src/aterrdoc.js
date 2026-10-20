/* ================================================================
   ATERRAMENTO — desenhos (planta, corte, curva do solo) e memorial
   ================================================================ */
function corAterr(doc) {
  return doc ? { ink: '#1b1f23', mut: '#6a737b', line: '#b9c3cb', grid: '#e1e6ea', acc: '#0b5a70', cu: '#b5652c', solo1: '#efe4d2', solo2: '#e2d2b8', brita: '#d9dcdf', bg: '#ffffff', warn: '#c0782a' }
    : { ink: 'var(--ink)', mut: 'var(--muted)', line: 'var(--line-strong)', grid: 'var(--line)', acc: 'var(--accent)', cu: 'var(--copper)', solo1: 'var(--sunk)', solo2: 'var(--line)', brita: 'var(--line)', bg: 'var(--sheet)', warn: 'var(--warn)' };
}
const txtA = (C, x, y, s, o = {}) => `<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" font-size="${o.fs || 10}" fill="${o.cor || C.ink}" font-family="Arial"${o.anc ? ` text-anchor="${o.anc}"` : ''}${o.b ? ' font-weight="700"' : ''}${o.rot ? ` transform="rotate(${o.rot} ${(+x).toFixed(1)} ${(+y).toFixed(1)})"` : ''}>${s}</text>`;
function cotaA(C, x1, y1, x2, y2, rot, off = 0) {
  const vert = Math.abs(x1 - x2) < 0.5, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, t = 4;
  const tick = (x, y) => vert ? `<line x1="${x - t}" y1="${y}" x2="${x + t}" y2="${y}" stroke="${C.mut}"/>` : `<line x1="${x}" y1="${y - t}" x2="${x}" y2="${y + t}" stroke="${C.mut}"/>`;
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${C.mut}" stroke-width="0.8"/>${tick(x1, y1)}${tick(x2, y2)}` +
    (vert ? txtA(C, mx - 6 - off, my, rot, { fs: 9.5, anc: 'middle', cor: C.mut, rot: -90 }) : txtA(C, mx, my - 5 - off, rot, { fs: 9.5, anc: 'middle', cor: C.mut }));
}
const hasteP = (C, x, y, k) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5" fill="${C.cu}" stroke="${C.ink}" stroke-width="0.8"/><line x1="${(x - 3.5).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + 3.5).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${C.bg}" stroke-width="1"/><line x1="${x.toFixed(1)}" y1="${(y - 3.5).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + 3.5).toFixed(1)}" stroke="${C.bg}" stroke-width="1"/>` + (k ? txtA(C, x + 7, y - 7, k, { fs: 8.5, cor: C.mut }) : '');

/* planta do arranjo (vista superior) */
function arranjoSVG(a, r, doc = true) {
  const C = corAterr(doc), W = 480, H = 260, f2 = v => nfmt(v, 2);
  let g = '';
  if (a.tipo === 'malha') {
    const sc = Math.min(380 / r.Lx, 190 / r.Ly), w = r.Lx * sc, h = r.Ly * sc, x0 = (W - w) / 2 + 14, y0 = (H - h) / 2 - 6;
    for (let j = 0; j < r.Nx; j++) { const y = y0 + j * r.Dy * sc; g += `<line x1="${x0.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x0 + w).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${C.cu}" stroke-width="1.6"/>`; }
    for (let i = 0; i < r.Ny; i++) { const x = x0 + i * r.Dx * sc; g += `<line x1="${x.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y0 + h).toFixed(1)}" stroke="${C.cu}" stroke-width="1.6"/>`; }
    r.pos.forEach(p => { g += hasteP(C, x0 + p[0] * sc, y0 + p[1] * sc); });
    g += cotaA(C, x0, y0 + h + 16, x0 + w, y0 + h + 16, `Lx = ${f2(r.Lx)} m`) + cotaA(C, x0 - 16, y0, x0 - 16, y0 + h, `Ly = ${f2(r.Ly)} m`);
    if (r.Ny > 1) g += cotaA(C, x0, y0 - 10, x0 + r.Dx * sc, y0 - 10, `${f2(r.Dx)} m`);
    if (r.Nx > 1) g += cotaA(C, x0 + w + 12, y0, x0 + w + 12, y0 + r.Dy * sc, `${f2(r.Dy)} m`, -14);
    g += txtA(C, 10, H - 8, `${r.Nx} × ${r.Ny} condutores de ${a.S} mm² · ${r.nR} haste(s) · enterrada a ${f2(r.h)} m`, { fs: 9, cor: C.mut });
  } else if (a.tipo === 'cabo') {
    const x0 = 50, x1 = W - 50, y = H / 2;
    g += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${C.cu}" stroke-width="3"/><circle cx="${x0}" cy="${y}" r="4" fill="${C.ink}"/>` + txtA(C, x0, y - 12, 'conexão', { fs: 9, cor: C.mut, anc: 'middle' });
    g += cotaA(C, x0, y + 26, x1, y + 26, `L = ${f2(+a.Lc)} m — cabo de ${a.S} mm² a ${f2(+a.hc)} m de profundidade`);
  } else {
    const pos = r.pos, xs = pos.map(p => p[0]), ys = pos.map(p => p[1]), minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
    const sx = maxx - minx, sy = maxy - miny, sc = Math.min(sx > 0 ? 360 / sx : 1e9, sy > 0 ? 170 / sy : 1e9, 60);
    const cx = W / 2 - (minx + sx / 2) * sc, cy = H / 2 - 4 - (miny + sy / 2) * sc, X = p => cx + p[0] * sc, Y = p => cy + p[1] * sc;
    const lig = (p, q) => `<line x1="${X(p).toFixed(1)}" y1="${Y(p).toFixed(1)}" x2="${X(q).toFixed(1)}" y2="${Y(q).toFixed(1)}" stroke="${C.cu}" stroke-width="1.4" stroke-dasharray="5 3"/>`;
    if (a.tipo === 'linha') for (let i = 1; i < pos.length; i++) g += lig(pos[i - 1], pos[i]);
    if (a.tipo === 'triangulo' || a.tipo === 'circ') pos.forEach((p, i) => { g += lig(p, pos[(i + 1) % pos.length]); });
    if (a.tipo === 'quadVazio' || a.tipo === 'quadCheio') { const e = +a.e, m = Math.round(+a.m); for (let i = 0; i < m; i++) { if (a.tipo === 'quadCheio' || i === 0 || i === m - 1) { g += lig([i * e, 0], [i * e, (m - 1) * e]) + lig([0, i * e], [(m - 1) * e, i * e]); } } if (a.tipo === 'quadVazio') g += lig([0, 0], [(m - 1) * e, 0]) + lig([0, (m - 1) * e], [(m - 1) * e, (m - 1) * e]) + lig([0, 0], [0, (m - 1) * e]) + lig([(m - 1) * e, 0], [(m - 1) * e, (m - 1) * e]); }
    pos.forEach((p, i) => { g += hasteP(C, X(p), Y(p), pos.length <= 12 ? 'H' + (i + 1) : ''); });
    if (a.tipo === 'circ') g += `<line x1="${X([0, 0]).toFixed(1)}" y1="${Y([0, 0]).toFixed(1)}" x2="${X(pos[0]).toFixed(1)}" y2="${Y(pos[0]).toFixed(1)}" stroke="${C.mut}" stroke-width="0.8"/>` + txtA(C, (X([0, 0]) + X(pos[0])) / 2, Y([0, 0]) - 6, `r = ${f2(+a.raio)} m`, { fs: 9.5, anc: 'middle', cor: C.mut });
    else if (pos.length > 1) { const p = pos[0], q = pos[1]; g += Math.abs(p[1] - q[1]) < 1e-9 ? cotaA(C, X(p), Y(p) + 22, X(q), Y(q) + 22, `e = ${f2(+a.e)} m`) : cotaA(C, X(p) - 22, Y(p), X(q) - 22, Y(q), `e = ${f2(+a.e)} m`); }
    g += txtA(C, 10, H - 8, `${pos.length} haste(s) de ${f2(+a.L)} m × Ø ${nfmt(+a.d, 1)} mm${pos.length > 1 ? ' interligadas por cabo nu (tracejado)' : ''}`, { fs: 9, cor: C.mut });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Planta do arranjo de aterramento"><rect width="${W}" height="${H}" fill="${C.bg}"/>${txtA(C, 10, 16, 'PLANTA', { fs: 9, b: true, cor: C.mut })}${g}</svg>`;
}

/* corte (vista lateral) com camadas do solo */
function corteAterrSVG(a, r, rs, doc = true) {
  const C = corAterr(doc), W = 480, H = 210, y0 = 46, f2 = v => nfmt(v, 2), m2 = rs.modelo === '2c' ? rs.m2 : null;
  const hastes = TIPOS_HASTES.includes(a.tipo) || (a.tipo === 'malha' && r.nR > 0), Lh = a.tipo === 'malha' ? +a.Lh : +a.L;
  const prof = Math.max(hastes ? Lh + (a.tipo === 'malha' ? +a.hc : 0) : 0, (a.tipo !== 'haste' && !TIPOS_HASTES.includes(a.tipo)) ? +a.hc * 2.5 : 0, m2 ? m2.h * 1.25 : 0, 1);
  const sc = (H - y0 - 20) / prof, Y = z => y0 + z * sc;
  let g = `<rect x="0" y="${y0}" width="${W}" height="${H - y0}" fill="${C.solo1}"/>`;
  if (m2 && m2.h < prof) g += `<rect x="0" y="${Y(m2.h).toFixed(1)}" width="${W}" height="${(H - Y(m2.h)).toFixed(1)}" fill="${C.solo2}"/><line x1="0" y1="${Y(m2.h).toFixed(1)}" x2="${W}" y2="${Y(m2.h).toFixed(1)}" stroke="${C.mut}" stroke-dasharray="6 4"/>` + txtA(C, W - 8, Y(m2.h) - 6, `h₁ = ${f2(m2.h)} m`, { fs: 9.5, anc: 'end', cor: C.mut }) + txtA(C, W - 8, Y(m2.h) + 14, `ρ₂ = ${nfmt(m2.rho2, 0)} Ω·m`, { fs: 9.5, anc: 'end', cor: C.mut });
  g += txtA(C, W - 8, y0 + 14, m2 ? `ρ₁ = ${nfmt(m2.rho1, 0)} Ω·m` : `ρ = ${nfmt(r.rho, 0)} Ω·m`, { fs: 9.5, anc: 'end', cor: C.mut });
  const brita = a.tipo === 'malha' && a.brita;
  if (brita) g += `<rect x="0" y="${y0 - 10}" width="${W}" height="10" fill="${C.brita}" stroke="${C.mut}" stroke-width="0.5"/>` + txtA(C, W - 8, y0 - 14, `brita ${f2(+a.hs)} m — ρs = ${nfmt(+a.rhoS, 0)} Ω·m`, { fs: 9, cor: C.mut, anc: 'end' });
  g += `<line x1="0" y1="${y0}" x2="${W}" y2="${y0}" stroke="${C.ink}" stroke-width="1.4"/>` + txtA(C, 8, y0 - (brita ? 14 : 6), 'superfície do solo', { fs: 9, cor: C.mut });
  const rod = (x, ztop, L) => `<rect x="${(x - 2.5).toFixed(1)}" y="${Y(ztop).toFixed(1)}" width="5" height="${(L * sc).toFixed(1)}" fill="${C.cu}" stroke="${C.ink}" stroke-width="0.6"/>`;
  if (TIPOS_HASTES.includes(a.tipo)) {
    const n = Math.min(r.nH, 4), xs = Array.from({ length: n }, (_, i) => 90 + i * Math.min(110, 260 / Math.max(n - 1, 1)));
    xs.forEach(x => { g += rod(x, 0, +a.L); });
    if (n > 1) g += `<line x1="${xs[0]}" y1="${Y(0.15).toFixed(1)}" x2="${xs[n - 1]}" y2="${Y(0.15).toFixed(1)}" stroke="${C.cu}" stroke-width="2"/>` + cotaA(C, xs[0], y0 - 14, xs[1], y0 - 14, `e = ${f2(+a.e)} m`);
    g += cotaA(C, xs[0] - 22, Y(0), xs[0] - 22, Y(+a.L), `L = ${f2(+a.L)} m`) + txtA(C, xs[0] + 8, Y(+a.L) - 4, `Ø ${nfmt(+a.d, 1)} mm`, { fs: 9, cor: C.mut });
  } else if (a.tipo === 'cabo') {
    g += `<line x1="40" y1="${Y(+a.hc).toFixed(1)}" x2="${W - 40}" y2="${Y(+a.hc).toFixed(1)}" stroke="${C.cu}" stroke-width="3"/>` + cotaA(C, 60, Y(0), 60, Y(+a.hc), `h = ${f2(+a.hc)} m`);
  } else {
    const n = Math.min(r.Ny, 6), xs = Array.from({ length: n }, (_, i) => 70 + i * (300 / Math.max(n - 1, 1)));
    g += `<line x1="${xs[0]}" y1="${Y(+a.hc).toFixed(1)}" x2="${xs[n - 1]}" y2="${Y(+a.hc).toFixed(1)}" stroke="${C.cu}" stroke-width="2.2"/>`;
    xs.forEach(x => { g += `<circle cx="${x.toFixed(1)}" cy="${Y(+a.hc).toFixed(1)}" r="3" fill="${C.cu}"/>`; });
    if (r.nR) { g += rod(xs[0], +a.hc, Lh) + rod(xs[n - 1], +a.hc, Lh); g += cotaA(C, xs[n - 1] + 22, Y(+a.hc), xs[n - 1] + 22, Y(+a.hc + Lh), `${f2(Lh)} m`, -14); }
    g += cotaA(C, xs[0] - 22, Y(0), xs[0] - 22, Y(+a.hc), `h = ${f2(+a.hc)} m`);
    if (n > 1) g += cotaA(C, xs[0], Y(+a.hc) + 18, xs[1], Y(+a.hc) + 18, `D = ${f2(r.D)} m (fora de escala)`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Corte do sistema de aterramento"><rect width="${W}" height="${H}" fill="${C.bg}"/>${g}${txtA(C, 10, 16, 'CORTE (escala vertical)', { fs: 9, b: true, cor: C.mut })}</svg>`;
}

/* curva de resistividade aparente × espaçamento (Wenner) */
function soloSVG(rs, doc = true) {
  const C = corAterr(doc), W = 480, H = 240, ml = 52, mr = 16, mt = 26, mb = 34, pw = W - ml - mr, ph = H - mt - mb;
  const A = rs.porA; if (!A.length) return '';
  const amin = Math.min(...A.map(q => q.a)), amax = Math.max(...A.map(q => q.a)), lmin = Math.log10(amin) - 0.12, lmax = Math.max(Math.log10(amax) + 0.12, lmin + 0.6);
  const vals = [...rs.linhas.map(l => l.rho), ...A.map(q => q.modelo || q.rho), rs.rhoMed], ymax = Math.max(...vals) * 1.12;
  const step = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000].find(s => ymax / s <= 6) || 20000;
  const X = a => ml + (Math.log10(a) - lmin) / (lmax - lmin) * pw, Yv = v => mt + ph - v / ymax * ph;
  let g = '';
  for (let v = 0; v <= ymax; v += step) g += `<line x1="${ml}" y1="${Yv(v).toFixed(1)}" x2="${W - mr}" y2="${Yv(v).toFixed(1)}" stroke="${C.grid}"/>` + txtA(C, ml - 5, Yv(v) + 3, nfmt(v, 0), { fs: 9, anc: 'end', cor: C.mut });
  for (let e = Math.floor(lmin); e <= Math.ceil(lmax); e++) for (const m of [1, 2, 5]) { const a = m * 10 ** e; if (Math.log10(a) > lmax + 1e-9 || Math.log10(a) < lmin - 1e-9) continue; g += `<line x1="${X(a).toFixed(1)}" y1="${mt}" x2="${X(a).toFixed(1)}" y2="${mt + ph}" stroke="${C.grid}"/>` + txtA(C, X(a), H - mb + 13, nfmt(a, a < 1 ? 1 : 0), { fs: 9, anc: 'middle', cor: C.mut }); }
  g += `<line x1="${ml}" y1="${mt + ph}" x2="${W - mr}" y2="${mt + ph}" stroke="${C.ink}"/><line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt + ph}" stroke="${C.ink}"/>`;
  rs.linhas.forEach(l => { g += l.desc ? `<path d="M${X(l.a) - 3} ${Yv(l.rho) - 3} l6 6 M${X(l.a) - 3} ${Yv(l.rho) + 3} l6 -6" stroke="${C.warn}" stroke-width="1.2"/>` : `<circle cx="${X(l.a).toFixed(1)}" cy="${Yv(l.rho).toFixed(1)}" r="2.6" fill="none" stroke="${C.mut}"/>`; });
  g += `<line x1="${ml}" y1="${Yv(rs.rhoMed).toFixed(1)}" x2="${W - mr}" y2="${Yv(rs.rhoMed).toFixed(1)}" stroke="${C.warn}" stroke-width="1.2" stroke-dasharray="6 4"/>`;
  if (rs.m2) { let d = ''; for (let i = 0; i <= 60; i++) { const a = 10 ** (lmin + (lmax - lmin) * i / 60); d += `${i ? 'L' : 'M'}${X(a).toFixed(1)} ${Yv(rhoApar2c(a, rs.m2.rho1, rs.m2.rho2, rs.m2.h)).toFixed(1)} `; } g += `<path d="${d}" fill="none" stroke="${C.acc}" stroke-width="2"/>`; }
  A.forEach(q => { g += `<circle cx="${X(q.a).toFixed(1)}" cy="${Yv(q.rho).toFixed(1)}" r="4" fill="${C.acc}"/>`; });
  const leg = [[C.acc, 'média por espaçamento', 'pt'], ...(rs.m2 ? [[C.acc, 'modelo de duas camadas', 'ln']] : []), [C.warn, `média ${nfmt(rs.rhoMed, 0)} Ω·m`, 'dash']];
  leg.forEach(([c, t, k], i) => { const x = ml + 6 + i * 150; g += (k === 'pt' ? `<circle cx="${x + 6}" cy="12" r="4" fill="${c}"/>` : `<line x1="${x}" y1="12" x2="${x + 14}" y2="12" stroke="${c}" stroke-width="2"${k === 'dash' ? ' stroke-dasharray="5 3"' : ''}/>`) + txtA(C, x + 18, 15, t, { fs: 9 }); });
  g += txtA(C, ml + pw / 2, H - 4, 'espaçamento a (m) — escala logarítmica', { fs: 9, anc: 'middle', cor: C.mut }) + txtA(C, 12, mt + ph / 2, 'ρa (Ω·m)', { fs: 9, anc: 'middle', cor: C.mut, rot: -90 });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Curva de resistividade aparente do solo"><rect width="${W}" height="${H}" fill="${C.bg}"/>${g}</svg>`;
}

/* esboço da instalação (vista lateral, sem escala): quadro/BEP, eletroduto, caixas de inspeção, cabo nu e hastes */
function esquemaHastesSVG(a, r, doc = true) {
  const C = corAterr(doc), W = 520, H = 250, yS = 92, f2 = v => nfmt(v, 2), S = +a.Scond || 16;
  const n = r.nH, mostra = Math.min(n, 4), xs = mostra === 1 ? [300] : Array.from({ length: mostra }, (_, i) => 190 + i * 250 / (mostra - 1));
  const zc = yS + 26, zL = yS + 118, x0 = xs[0], xl = xs[mostra - 1];
  let g = `<rect x="0" y="${yS}" width="${W}" height="${H - yS}" fill="${C.solo1}"/><line x1="0" y1="${yS}" x2="${W}" y2="${yS}" stroke="${C.ink}" stroke-width="1.4"/>`;
  // quadro de medição / BEP na parede
  g += `<rect x="18" y="16" width="10" height="${yS - 16}" fill="${C.solo2}" stroke="${C.mut}" stroke-width="0.6"/><rect x="28" y="24" width="46" height="40" fill="${C.bg}" stroke="${C.ink}" stroke-width="1.2"/><line x1="34" y1="54" x2="68" y2="54" stroke="${C.cu}" stroke-width="2.2"/>` +
    txtA(C, 51, 37, 'QUADRO', { fs: 7.5, anc: 'middle', b: true }) + txtA(C, 51, 47, '/ BEP', { fs: 7.5, anc: 'middle', b: true });
  // condutor de aterramento em eletroduto até a primeira caixa
  g += `<path d="M58 64 V${yS + 6} H${x0 - 12}" fill="none" stroke="${C.mut}" stroke-width="7" stroke-linejoin="round" opacity=".35"/><path d="M58 64 V${yS + 6} H${x0}" fill="none" stroke="${C.cu}" stroke-width="1.8"/>` +
    txtA(C, 82, yS - 24, `condutor ${S} mm²`, { fs: 8.5, cor: C.mut }) + txtA(C, 82, yS - 13, `em eletroduto${+a.Lq > 0 ? ` (${f2(+a.Lq)} m)` : ''}`, { fs: 8.5, cor: C.mut });
  if (mostra > 1) g += `<line x1="${x0}" y1="${zc}" x2="${xl}" y2="${zc}" stroke="${C.cu}" stroke-width="2.4"/>`;
  xs.forEach((x, i) => {
    if (a.caixas !== 'primeira' || i === 0) g += `<rect x="${x - 12}" y="${yS - 5}" width="24" height="${zc - yS + 9}" fill="${C.bg}" stroke="${C.ink}" stroke-width="1"/><rect x="${x - 15}" y="${yS - 8}" width="30" height="4" fill="${C.mut}"/>`;
    g += `<rect x="${x - 3}" y="${zc - 6}" width="6" height="${zL - zc + 6}" fill="${C.cu}" stroke="${C.ink}" stroke-width="0.6"/><circle cx="${x}" cy="${zc}" r="3.2" fill="${C.ink}"/>` +
      txtA(C, x + 7, zL - 4, 'H' + (n > 4 && i === 3 ? n : i + 1), { fs: 8.5, cor: C.mut });
  });
  if (n > 4) g += txtA(C, (xs[2] + xs[3]) / 2, zc - 6, '· · ·', { fs: 12, anc: 'middle', b: true });
  g += cotaA(C, xl + 22, yS, xl + 22, zc, `${f2(+a.hc)} m`, -20) + cotaA(C, xl + 54, yS, xl + 54, zL, `L = ${f2(+a.L)} m`, -14);
  if (mostra > 1) g += cotaA(C, xs[0], zL + 14, xs[1], zL + 14, `e = ${f2(+a.e)} m`);
  g += `<line x1="${x0 + 12}" y1="${yS - 7}" x2="${x0 + 34}" y2="${yS - 32}" stroke="${C.mut}" stroke-width="0.7"/>` + txtA(C, x0 + 37, yS - 30, a.caixas === 'primeira' ? 'caixa de inspeção (conexão)' : 'caixa de inspeção em cada haste', { fs: 8.5 });
  g += txtA(C, 10, H - 6, `${n} haste(s) aço-cobreada(s) Ø ${nfmt(+a.d, 1)} mm × ${f2(+a.L)} m${n > 1 ? ` interligadas por cabo de cobre nu ${S} mm² a ${f2(+a.hc)} m` : ''}`, { fs: 8.5, cor: C.mut });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Esboço da instalação do aterramento"><rect width="${W}" height="${H}" fill="${C.bg}"/>${g}${txtA(C, W - 8, 16, `ESBOÇO DA INSTALAÇÃO — sem escala`, { fs: 9, b: true, cor: C.mut, anc: 'end' })}</svg>`;
}
/* resistência de aterramento em função do número de hastes alinhadas */
function serieHastesSVG(r, rmax, doc = true) {
  const C = corAterr(doc), W = 480, H = 210, ml = 46, mr = 14, mt = 22, mb = 30, pw = W - ml - mr, ph = H - mt - mb, S = r.serie;
  const ymax = Math.max(...S.map(x => x.R), rmax || 0) * 1.1, step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000].find(v => ymax / v <= 6) || 2000;
  const bw = pw / S.length, Y = v => mt + ph - v / ymax * ph;
  let g = '';
  for (let v = 0; v <= ymax; v += step) g += `<line x1="${ml}" y1="${Y(v).toFixed(1)}" x2="${W - mr}" y2="${Y(v).toFixed(1)}" stroke="${C.grid}"/>` + txtA(C, ml - 5, Y(v) + 3, nfmt(v, 0), { fs: 9, anc: 'end', cor: C.mut });
  S.forEach((x, i) => {
    const ok = !(rmax > 0) || x.R <= rmax, atual = x.n === r.nH && (r.tipo === 'linha' || r.tipo === 'haste');
    g += `<rect x="${(ml + i * bw + bw * 0.18).toFixed(1)}" y="${Y(x.R).toFixed(1)}" width="${(bw * 0.64).toFixed(1)}" height="${(mt + ph - Y(x.R)).toFixed(1)}" fill="${ok ? C.acc : C.line}"${atual ? ` stroke="${C.ink}" stroke-width="1.6"` : ''}/>` +
      txtA(C, ml + i * bw + bw / 2, H - mb + 13, String(x.n), { fs: 9, anc: 'middle', cor: C.mut });
    if (S.length <= 12) g += txtA(C, ml + i * bw + bw / 2, Y(x.R) - 3, nfmt(x.R, x.R < 10 ? 1 : 0), { fs: 8, anc: 'middle', cor: C.ink });
  });
  if (rmax > 0) g += `<line x1="${ml}" y1="${Y(rmax).toFixed(1)}" x2="${W - mr}" y2="${Y(rmax).toFixed(1)}" stroke="${C.warn}" stroke-width="1.4" stroke-dasharray="6 4"/>` + txtA(C, W - mr - 2, Y(rmax) - 4, `limite ${nfmt(rmax, 1)} Ω`, { fs: 9, anc: 'end', cor: C.warn });
  g += `<line x1="${ml}" y1="${mt + ph}" x2="${W - mr}" y2="${mt + ph}" stroke="${C.ink}"/>` + txtA(C, ml + pw / 2, H - 4, 'número de hastes alinhadas, mesmo espaçamento', { fs: 9, anc: 'middle', cor: C.mut }) + txtA(C, 12, mt + ph / 2, 'R (Ω)', { fs: 9, anc: 'middle', cor: C.mut, rot: -90 });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Resistência em função do número de hastes"><rect width="${W}" height="${H}" fill="${C.bg}"/>${g}</svg>`;
}

/* ---------- memorial ---------- */
function geomArranjoTxt(a, r) {
  const f2 = v => nfmt(v, 2);
  if (a.tipo === 'haste') return `1 haste de ${f2(+a.L)} m, Ø ${nfmt(+a.d, 1)} mm`;
  if (a.tipo === 'linha') return `${r.nH} hastes de ${f2(+a.L)} m alinhadas, espaçadas de ${f2(+a.e)} m`;
  if (a.tipo === 'triangulo') return `3 hastes de ${f2(+a.L)} m nos vértices de um triângulo equilátero de lado ${f2(+a.e)} m`;
  if (a.tipo === 'quadVazio') return `${r.nH} hastes de ${f2(+a.L)} m no perímetro de um quadrado de lado ${f2((+a.m - 1) * +a.e)} m (espaçamento ${f2(+a.e)} m)`;
  if (a.tipo === 'quadCheio') return `${r.nH} hastes de ${f2(+a.L)} m em quadrado cheio ${a.m} × ${a.m}, espaçamento ${f2(+a.e)} m`;
  if (a.tipo === 'circ') return `${r.nH} hastes de ${f2(+a.L)} m em circunferência de raio ${f2(+a.raio)} m`;
  if (a.tipo === 'cabo') return `cabo de ${a.S} mm² com ${f2(+a.Lc)} m, enterrado a ${f2(+a.hc)} m`;
  return `malha de ${f2(r.Lx)} × ${f2(r.Ly)} m com ${r.Nx} × ${r.Ny} condutores de ${a.S} mm² a ${f2(r.h)} m; ${r.nR} haste(s) de ${f2(r.Lr)} m (${POS_HASTES_MALHA[a.posH].toLowerCase()})`;
}
function construirMemorialAterramento(proj, calc, ca) {
  const T = proj.aterr, I = proj.info, S = T.solo, rs = ca.solo, B = [], A = T.arr.filter(a => !ca.arr[a.id].excluido), simples = ca.simples;
  const f0 = v => nfmt(v, 0), f1 = v => nfmt(v, 1), f2 = v => nfmt(v, 2), f3 = v => nfmt(v, 3);
  const temMalha = A.some(a => a.tipo === 'malha'), temSeg = A.some(a => a.tipo === 'malha' && a.seg);
  if (simples) B.push({ t: 'title', kicker: 'ABNT NBR 5410:2004 · NBR 13571 · NBR 15749:2009' + (A.some(a => a.funcao === 'entrada') ? ' · Energisa NDU 001' : ''), text: 'Memorial de cálculo de aterramento', sub: 'Método simplificado — eletrodos de hastes verticais: resistência de aterramento, número de hastes, esboço da instalação e lista de materiais' });
  else B.push({ t: 'title', kicker: 'ABNT NBR 5410:2004 · NBR 7117-1:2020 · NBR 15751:2013 · IEEE Std 80-2013', text: 'Memorial de cálculo de aterramento', sub: 'Resistividade do solo, resistência de aterramento de hastes, cabos e malhas' + (temSeg ? ' e verificação das tensões de toque e de passo' : '') });
  B.push({ t: 'meta', rows: [['Obra', I.obra || '—'], ['Endereço', [I.endereco, I.cidade].filter(Boolean).join(' — ') || '—'], ['Esquema de aterramento da instalação', proj.params.aterramento],
    ['Responsável técnico', [I.responsavel, I.registro].filter(Boolean).join(' — ') || '—'], ['ART / TRT / RRT', I.art || '—'], ['Data / revisão', `${dataCurta(I.data) || '—'} — ${I.revisao || 'R00'}`]] });
  let n = 0; const sec = t => { n++; B.push({ t: 'h1', text: `${n}. ${t}` }); return n; };
  sec('Objetivo');
  if (simples) B.push({ t: 'p', text: `Calcular a resistência de aterramento ${A.length === 1 ? 'do eletrodo de hastes' : `dos ${A.length} eletrodos de hastes`} da obra pelo método simplificado (fórmula da haste vertical e resistência mútua entre hastes), dimensionar o número de hastes necessário para o limite aplicável, apresentar o esboço da instalação e relacionar os materiais, segundo a ABNT NBR 5410:2004${A.some(a => a.funcao === 'entrada') ? ' e a norma de fornecimento Energisa NDU 001 v7.0' : ''}.` });
  else B.push({ t: 'p', text: `Determinar a resistividade do solo e calcular a resistência de aterramento ${A.length === 1 ? 'do sistema de aterramento' : `dos ${A.length} sistemas de aterramento`} da obra, verificando os limites aplicáveis${temSeg ? ' e a segurança das pessoas quanto às tensões de toque e de passo' : ''}, segundo a ABNT NBR 5410:2004, a ABNT NBR 7117-1:2020${temMalha ? ', a ABNT NBR 15751:2013 e a IEEE Std 80-2013' : ''}.` });
  sec('Normas e documentos de referência');
  B.push({ t: 'list', items: [
    'ABNT NBR 5410:2004 Versão Corrigida:2008 — Instalações elétricas de baixa tensão (6.4 — aterramento e equipotencialização).',
    ...(!simples || rs.modo === 'wenner' ? ['ABNT NBR 7117-1:2020 — Parâmetros do solo para projetos de aterramentos elétricos — Parte 1: Medição da resistividade e modelagem geoelétrica.'] : []),
    'ABNT NBR 15749:2009 — Medição de resistência de aterramento e de potenciais na superfície do solo em sistemas de aterramento.',
    ...(temMalha ? ['ABNT NBR 15751:2013 — Sistemas de aterramento de subestações — Requisitos.', 'IEEE Std 80-2013 — Guide for Safety in AC Substation Grounding.'] : []),
    'ABNT NBR 13571 — Haste de aterramento aço-cobreada e acessórios.',
    ...(A.some(a => a.funcao === 'spda') ? ['ABNT NBR 5419-3:2015 — Proteção contra descargas atmosféricas — Parte 3: Danos físicos a estruturas e perigos à vida.'] : []),
    ...(A.some(a => a.funcao === 'entrada') ? ['Energisa NDU 001 v7.0 — Fornecimento de energia elétrica em tensão secundária (8.10 — Aterramento).'] : []),
    'KINDERMANN, G.; CAMPAGNOLO, J. M. Aterramento Elétrico. Porto Alegre: Sagra Luzzatto — resistência de hastes e resistência mútua.'
  ] });

  const s3 = sec('Resistividade do solo');
  if (rs.modo === 'tipico') {
    B.push({ t: 'p', text: `Resistividade estimada pelo tipo de solo do local: ${rs.tipo.nome.toLowerCase()}, faixa típica de ${rs.tipo.faixa} Ω·m (Kindermann & Campagnolo). Adotado ρ = ${f0(rs.rhoBase)} Ω·m${/ a /.test(rs.tipo.faixa) ? ', limite superior da faixa, a favor da segurança' : ''}${rs.fs !== 1 ? `; com o fator sazonal ${f2(rs.fs)}, ρ = ${f0(rs.rho)} Ω·m` : ''}. Solo considerado homogêneo.` });
    B.push({ t: 'table', head: ['Tipo de solo', 'Resistividade típica (Ω·m)'], widths: [60, 40], align: 'lr', rows: Object.values(SOLOS_TIPICOS).map(t => [t.nome + (t === rs.tipo ? '  ◄ adotado' : ''), t.faixa]) });
    B.push({ t: 'note', text: 'A resistividade real varia com a umidade, a temperatura, a compactação e a estratificação do solo. Recomenda-se medir pelo método de Wenner (NBR 7117-1) e, após a execução, medir a resistência do eletrodo (NBR 15749).' });
  } else if (rs.modo === 'direto') {
    B.push({ t: 'p', text: `Resistividade adotada: ρ = ${f0(rs.rhoBase)} Ω·m${rs.fs !== 1 ? `, multiplicada pelo fator sazonal ${f2(rs.fs)} (ρ = ${f0(rs.rho)} Ω·m)` : ''}, considerada solo homogêneo.${S.local ? ` Origem do dado: ${S.local}.` : ''}` });
    B.push({ t: 'note', text: 'Recomenda-se confirmar a resistividade por medição em campo pelo método de Wenner (NBR 7117-1), em época seca, antes da execução.' });
  } else {
    B.push({ t: 'p', text: `Medição pelo método de Wenner (quatro eletrodos igualmente espaçados), conforme a ABNT NBR 7117-1:2020${S.local ? `, em ${S.local}` : ''}${S.data ? `, em ${dataCurta(S.data)}` : ''}${S.equip ? `, com ${S.equip}` : ''}. Profundidade dos eletrodos de medição p = ${f2(+S.p)} m.` });
    B.push({ t: 'eq', lines: ['ρa = 4π·a·R / [1 + 2a/√(a² + 4p²) − a/√(a² + p²)]          (≈ 2π·a·R quando p ≤ a/10)', `Média por espaçamento: ${S.media === 'ar' ? 'aritmética' : 'geométrica (distribuição log-normal das resistividades, NBR 7117-1:2020)'}${S.descartar ? '; descartadas as leituras com desvio superior a 50 % da média do espaçamento' : ''}`] });
    B.push({ t: 'h3', text: `${s3}.1 Medições` });
    B.push({ t: 'table', small: true, head: ['Direção', 'a (m)', 'R (Ω)', 'ρa (Ω·m)', 'Desvio', 'Situação'], widths: [16, 14, 14, 18, 14, 24], align: 'lrrrrl',
      rows: rs.linhas.map(l => [l.dir || '—', f2(l.a), f2(l.R), f0(l.rho), (l.desvio >= 0 ? '+' : '') + f0(l.desvio * 100) + ' %', l.desc ? 'descartada' : 'considerada']) });
    B.push({ t: 'h3', text: `${s3}.2 Resistividade aparente por espaçamento` });
    B.push({ t: 'table', head: ['a (m)', 'Leituras', 'ρa médio (Ω·m)', 'Mín. – máx.', ...(rs.m2 ? ['Modelo (Ω·m)'] : [])], widths: rs.m2 ? [14, 14, 22, 28, 22] : [18, 18, 28, 36], align: 'rrrrr',
      rows: rs.porA.map(q => [f2(q.a), `${q.n - q.nDesc}/${q.n}`, f0(q.rho), `${f0(q.min)} – ${f0(q.max)}`, ...(rs.m2 ? [f0(q.modelo)] : [])]) });
    B.push({ t: 'h3', text: `${s3}.3 Modelo do solo` });
    if (rs.m2) {
      B.push({ t: 'p', text: 'Solo estratificado em duas camadas horizontais, com os parâmetros ajustados às médias medidas pelo método dos mínimos quadrados (curva teórica de Wenner para duas camadas):' });
      B.push({ t: 'eq', lines: ['ρa(a) = ρ₁ · {1 + 4 Σ [Kⁿ/√(1 + (2nh/a)²) − Kⁿ/√(4 + (2nh/a)²)]},   K = (ρ₂ − ρ₁)/(ρ₂ + ρ₁)', `ρ₁ = ${f0(rs.m2.rho1)} Ω·m   ρ₂ = ${f0(rs.m2.rho2)} Ω·m   h₁ = ${f2(rs.m2.h)} m   K = ${f3(rs.m2.K)}   desvio médio = ${f1(rs.m2.erro)} %`, `Média das resistividades aparentes: ${f0(rs.rhoMed)} Ω·m${rs.fs !== 1 ? `;  fator sazonal ${f2(rs.fs)}` : ''}`] });
    } else B.push({ t: 'p', text: `Solo considerado homogêneo, com a resistividade igual à média das resistividades aparentes por espaçamento: ρ = ${f0(rs.rhoMed)} Ω·m${rs.fs !== 1 ? `; com o fator sazonal ${f2(rs.fs)}, ρ = ${f0(rs.rho)} Ω·m` : ''}. Para comparação, (ρmáx + ρmín)/2 = ${f0(rs.rhoMinMax)} Ω·m (IEEE 80, eq. 50).` });
    const svg = soloSVG(rs, true); if (svg) B.push({ t: 'fig', svg: svgDoc(svg, 480, 240), ar: 0.5, w: 110, caption: 'Curva de resistividade aparente medida (pontos), média por espaçamento' + (rs.m2 ? ' e modelo de duas camadas ajustado.' : '.') });
  }
  rs.avisos.filter(x => rs.modo !== 'tipico' || !/^Resistividade estimada/.test(x)).forEach(x => B.push({ t: 'note', text: x }));

  sec('Critérios de projeto');
  B.push({ t: 'table', head: ['Sistema', 'Função', 'Limite de resistência', 'Referência'], widths: [26, 26, 16, 32], align: 'llrl',
    rows: A.map(a => { const r = ca.arr[a.id]; return [a.nome, FUNC_ATERR[a.funcao].nome, r.rmax > 0 ? `${f1(r.rmax)} Ω` : '—', FUNC_ATERR[a.funcao].ref]; }) });
  if (proj.params.aterramento === 'TT') B.push({ t: 'p', text: 'Esquema TT (NBR 5410, 5.1.2.2.4.3): a resistência do eletrodo das massas deve atender RA × IΔn ≤ 50 V, com IΔn a maior corrente diferencial-residual nominal dos dispositivos DR que protegem as massas ligadas ao eletrodo.' });
  else B.push({ t: 'p', text: `Esquema ${proj.params.aterramento}: o seccionamento automático é garantido pelos dispositivos de proteção contra sobrecorrentes e DR (memória dos circuitos); o aterramento deve ter a menor resistência praticável e todas as massas e elementos condutivos devem ser ligados ao barramento de equipotencialização principal (BEP), conforme 6.4.2.` });

  const s5 = sec('Metodologia de cálculo');
  const L5 = ['Haste vertical:            R₁ = ρ/(2πL) · ln(4L/d)', 'Resistência mútua (hastes h e m a e metros):  Rhm = ρ/(4πL) · ln{[(b + L)² − e²] / [e² − (b − L)²]},   b = √(L² + e²)',
    'Resistência de cada haste no conjunto:  Rh = R₁ + Σ Rhm;      Req = 1 / Σ (1/Rh);      índice de redução K = Req/R₁',
    ...(simples ? ['Número de hastes: menor quantidade de hastes alinhadas, com o espaçamento adotado, para a qual Req ≤ Rmáx'] : ['Cabo horizontal enterrado:  R = ρ/(πL) · [ln(2L/√(2·r·h)) − 1]   (r = raio do condutor; h = profundidade)'])];
  if (temMalha) L5.push('Malha (Sverak):  Rg = ρ · [1/LT + 1/√(20A) · (1 + 1/(1 + h·√(20/A)))]', 'Malha com hastes (Schwarz):  Rg = (R₁R₂ − Rm²)/(R₁ + R₂ − 2Rm)   — R₁ condutores, R₂ hastes, Rm mútua (k₁, k₂ da IEEE 80)');
  B.push({ t: 'eq', lines: L5 });
  B.push({ t: 'p', text: 'As hastes de um conjunto são consideradas interligadas e equipotenciais; a contribuição do cabo de interligação é desprezada, a favor da segurança. ' + (rs.m2 ? 'Em solo de duas camadas, a resistividade vista pelo eletrodo é a equivalente de Hummel até a profundidade alcançada (camadas em paralelo): ρeq = d / (h₁/ρ₁ + (d − h₁)/ρ₂).' : '') });
  if (temSeg) {
    B.push({ t: 'eq', lines: ['Tensões admissíveis (NBR 15751 / IEEE 80, pessoa de 50 kg: 0,116; 70 kg: 0,157):', '  Etoque = (1000 + 1,5·Cs·ρs) · k/√ts        Epasso = (1000 + 6·Cs·ρs) · k/√ts', '  Cs = 1 − 0,09·(1 − ρ/ρs)/(2hs + 0,09)', 'Corrente de malha: IG = Df · Sf · 3I₀;   Df = √[1 + (Ta/tf)·(1 − e^(−2tf/Ta))];   Ta = X/(ωR);   GPR = IG · Rg',
      'Tensão de malha: Em = ρ·Km·Ki·IG/LM;   tensão de passo: Es = ρ·Ks·Ki·IG/LS', 'Condutor (IEEE 80, eq. 37):  A = I / √[(TCAP·10⁻⁴)/(tc·αr·ρr) · ln((K₀ + Tm)/(K₀ + Ta))]'] });
  }

  const s6 = sec('Cálculo dos sistemas de aterramento');
  A.forEach((a, i) => memArranjo(B, a, ca.arr[a.id], rs, proj, `${s6}.${i + 1}`));

  sec('Resumo');
  B.push({ t: 'table', head: ['Sistema', 'Configuração', 'ρ de cálculo (Ω·m)', 'R (Ω)', 'Limite (Ω)', 'Situação'], widths: [20, 34, 13, 10, 10, 13], align: 'llrrrl',
    rows: A.map(a => { const r = ca.arr[a.id]; return [a.nome, geomArranjoTxt(a, r), f0(r.rho), f2(r.R), r.rmax > 0 ? f1(r.rmax) : '—', statusTxt(r.status)]; }) });

  const mats = {}; A.forEach(a => (ca.arr[a.id].materiais || []).forEach(([d, q, u]) => { const k = d + '|' + u; mats[k] = (mats[k] || 0) + q; }));
  if (Object.keys(mats).length) {
    sec('Lista de materiais');
    B.push({ t: 'table', head: ['Item', 'Descrição', 'Quantidade', 'Unid.'], widths: [8, 64, 16, 12], align: 'llrl', rows: Object.entries(mats).map(([k, q], i) => { const [d, u] = k.split('|'); return [String(i + 1), d, u === 'm' ? f1(q) : f0(q), u]; }) });
    B.push({ t: 'note', text: 'Quantidades de projeto, sem perdas; acrescente reserva para emendas, sobras e conexões. Cabos e condutores conforme a seção indicada em cada sistema e a norma da concessionária, quando aplicável.' });
  }

  sec('Execução, medição e manutenção');
  B.push({ t: 'list', items: [
    'Medir a resistência de aterramento após a execução pelo método da queda de potencial (ABNT NBR 15749), com o eletrodo de potencial a cerca de 62 % da distância ao eletrodo de corrente, de preferência em época seca; registrar o resultado no relatório de comissionamento.',
    'Se o valor medido superar o limite, acrescentar hastes interligadas (espaçamento mínimo igual ao comprimento da haste) ou ampliar o cabo contrapeso/malha, e repetir a medição.',
    'Conexões cabo–haste por solda exotérmica ou conector apropriado, acessíveis em caixa de inspeção; condutor de aterramento contínuo, sem emendas e protegido mecanicamente nos trechos expostos.',
    'Interligar o eletrodo ao barramento de equipotencialização principal (BEP) e equipotencializar as tubulações metálicas, estruturas e demais elementos condutivos (NBR 5410, 6.4.2).',
    'Inspecionar as conexões e medir a resistência periodicamente, conforme o plano de manutenção da instalação.'
  ] });
  B.push({ t: 'sign', place: [I.cidade, dataExtenso(I.data)].filter(Boolean).join(', '), name: I.responsavel || 'Responsável técnico', reg: [I.registro, I.art ? 'ART ' + I.art : ''].filter(Boolean).join(' — ') });
  return B;
}
function memArranjo(B, a, r, rs, proj, num) {
  const f0 = v => nfmt(v, 0), f1 = v => nfmt(v, 1), f2 = v => nfmt(v, 2), f3 = v => nfmt(v, 3);
  B.push({ t: 'h2', text: `${num} ${a.nome}` });
  B.push({ t: 'kv4', rows: [['Tipo', TIPOS_ATERR[a.tipo], 'Função', FUNC_ATERR[a.funcao].nome], ['Configuração', geomArranjoTxt(a, r), 'ρ de cálculo', `${f0(r.rho)} Ω·m — ${r.rhoTxt}`]] });
  if (!(r.rho > 0)) { r.falhas.forEach(x => B.push({ t: 'ver', ok: false, text: x })); return; }
  const hastes = TIPOS_HASTES.includes(a.tipo);
  if (hastes) B.push({ t: 'fig', svg: svgDoc(esquemaHastesSVG(a, r, true), 520, 250), ar: 250 / 520, w: 110, caption: `Esboço da instalação (vista lateral, sem escala): condutor de aterramento em eletroduto desde o quadro/BEP, caixas de inspeção, cabo nu de interligação e hastes.` });
  B.push({ t: 'fig', svg: svgDoc(arranjoSVG(a, r, true), 480, 260), ar: 260 / 480, w: 100, caption: `Planta — ${a.nome}.` });
  if (!hastes || rs.modelo === '2c') B.push({ t: 'fig', svg: svgDoc(corteAterrSVG(a, r, rs, true), 480, 210), ar: 210 / 480, w: 100, caption: 'Corte esquemático com as camadas do solo consideradas (escala vertical; distâncias horizontais fora de escala).' });
  if (TIPOS_HASTES.includes(a.tipo)) {
    const L = +a.L, d = +a.d / 1000, Lin = [`R₁ = ${f0(r.rho)} / (2π × ${f2(L)}) × ln(4 × ${f2(L)} / ${nfmt(d, 4)}) = ${f2(r.R1)} Ω`];
    if (r.nH > 1) {
      const e = r.eMin, b = Math.sqrt(L * L + e * e);
      Lin.push(`Mútua entre hastes vizinhas (e = ${f2(e)} m):  b = ${f3(b)} m;   Rhm = ${f2(rMutua(r.rho, L, e))} Ω`);
      Lin.push(`Req = 1 / Σ(1/Rh) = ${f2(r.Req)} Ω;    K = ${f2(r.Req)} / ${f2(r.R1)} = ${f3(r.K)}`);
    }
    B.push({ t: 'eq', lines: Lin });
    if (r.nH > 1 && r.nH <= 16) B.push({ t: 'table', small: true, head: ['Haste', ...r.Rh.map((_, i) => 'H' + (i + 1))], widths: [16, ...r.Rh.map(() => 84 / r.Rh.length)], align: 'l' + 'r'.repeat(r.Rh.length), rows: [['Rh (Ω)', ...r.Rh.map(f2)]] });
    if (r.serie) {
      const sr = r.serie.slice(0, 12);
      B.push({ t: 'p', text: `Resistência em função do número de hastes alinhadas espaçadas de ${f2(+a.e || L)} m${r.nMin ? ` — mínimo para ${f1(r.rmax)} Ω: ${r.nMin} haste(s)` : ''}:` });
      B.push({ t: 'table', small: true, head: ['Hastes', ...sr.map(x => String(x.n))], widths: [16, ...sr.map(() => 84 / sr.length)], align: 'l' + 'r'.repeat(sr.length), rows: [['R (Ω)', ...sr.map(x => f1(x.R))]] });
      B.push({ t: 'fig', svg: svgDoc(serieHastesSVG(r, r.rmax, true), 480, 210), ar: 210 / 480, w: 95, caption: 'Resistência de aterramento em função do número de hastes alinhadas (barras escuras: atendem ao limite; contorno: quantidade adotada).' });
    }
  } else if (a.tipo === 'cabo') {
    B.push({ t: 'eq', lines: [`R = ${f0(r.rho)} / (π × ${f2(+a.Lc)}) × [ln(2 × ${f2(+a.Lc)} / √(2 × ${nfmt(r.dCabo / 2, 4)} × ${f2(+a.hc)})) − 1] = ${f2(r.R)} Ω`] });
  } else {
    B.push({ t: 'table', head: ['Grandeza', 'Valor', 'Grandeza', 'Valor'], widths: [30, 20, 30, 20], align: 'lrlr', rows: [
      ['Área A', `${f1(r.A)} m²`, 'Comprimento dos condutores LC', `${f1(r.LC)} m`], ['Espaçamento Dx × Dy', `${f2(r.Dx)} × ${f2(r.Dy)} m`, 'Hastes nR × Lr', `${r.nR} × ${f2(r.Lr)} m`],
      ['Diâmetro do condutor d', `${nfmt(r.d * 1000, 1)} mm`, 'Comprimento total LT', `${f1(r.LT)} m`]] });
    const L = [`Sverak:  Rg = ${f0(r.rho)} × [1/${f1(r.LT)} + 1/√(20 × ${f1(r.A)}) × (1 + 1/(1 + ${f2(r.h)} × √(20/${f1(r.A)})))] = ${f3(r.Rsverak)} Ω`];
    if (r.nR) L.push(`Schwarz:  k₁ = ${f3(r.sch.k1)}, k₂ = ${f3(r.sch.k2)};  R₁ = ${f3(r.sch.R1)} Ω;  R₂ = ${f3(r.sch.R2)} Ω;  Rm = ${f3(r.sch.Rm)} Ω  →  Rg = ${f3(r.sch.Rg)} Ω`);
    L.push(`Adotado: Rg = ${f3(r.R)} Ω (${r.metodoR})`);
    B.push({ t: 'eq', lines: L });
    if (a.seg && r.IG != null) {
      B.push({ t: 'p', text: `Verificação de segurança com corrente de falta fase-terra 3I₀ = ${f0(+a.I3I0)} A, fator de divisão Sf = ${f0(+a.sf)} %, X/R = ${f1(+a.xr)}, tempo de eliminação tf = ${f2(+a.tf)} s, pessoa de ${a.peso} kg${a.brita ? `, camada de brita de ${f2(+a.hs)} m com ρs = ${f0(+a.rhoS)} Ω·m` : ', sem camada superficial'}.` });
      B.push({ t: 'eq', lines: [`Df = ${f3(r.Df)};   IG = ${f3(r.Df)} × ${f2(+a.sf / 100)} × ${f0(+a.I3I0)} = ${f0(r.IG)} A;   GPR = ${f0(r.IG)} × ${f3(r.R)} = ${f0(r.GPR)} V`,
        `Cs = ${f3(r.Cs)};   Etoque = ${f0(r.Etoque)} V;   Epasso = ${f0(r.Epasso)} V`,
        `n = ${f2(r.n)};  Kii = ${f3(r.Kii)};  Kh = ${f3(r.Kh)};  Km = ${f3(r.Km)};  Ki = ${f3(r.Ki)};  LM = ${f1(r.LM)} m  →  Em = ${f0(r.Em)} V`,
        `Ks = ${f3(r.Ks)};  LS = ${f1(r.LS)} m  →  Es = ${f0(r.Es)} V`,
        `Condutor: IF = Df × 3I₀ = ${f2(r.cond.IF)} kA;  tc = ${f2(+a.tc)} s;  Tm = ${f0(r.cond.Tm)} °C (${MAT_TERRA[a.mat].nome})  →  A = ${f1(r.cond.A)} mm²;  mínimo adotado ${f0(r.cond.Smin)} mm²`] });
      B.push({ t: 'table', head: ['Verificação', 'Calculado', 'Admissível', 'Situação'], widths: [40, 20, 20, 20], align: 'lrrl', rows: [
        ['Elevação de potencial (GPR) × toque', `${f0(r.GPR)} V`, `${f0(r.Etoque)} V`, r.okGPR ? 'dispensa Em/Es' : 'verificar Em/Es'],
        ['Tensão de toque de malha Em', `${f0(r.Em)} V`, `${f0(r.Etoque)} V`, r.okToque ? 'Atende' : 'Não atende'],
        ['Tensão de passo Es', `${f0(r.Es)} V`, `${f0(r.Epasso)} V`, r.okPasso ? 'Atende' : 'Não atende'],
        ['Seção do condutor', `${a.S} mm²`, `≥ ${f1(r.cond.Sreq)} mm²`, r.cond.ok ? 'Atende' : 'Não atende']] });
    }
  }
  if (r.rmax > 0) B.push({ t: 'ver', ok: r.okR, text: `Resistência de aterramento R = ${f2(r.R)} Ω ${r.okR ? '≤' : '>'} ${f1(r.rmax)} Ω (${FUNC_ATERR[a.funcao].ref})` });
  if (r.tt) B.push({ t: 'ver', ok: r.R * r.tt.idn / 1000 <= 50, text: `Esquema TT: RA × IΔn = ${f2(r.R)} × ${f3(r.tt.idn / 1000)} = ${f1(r.R * r.tt.idn / 1000)} V ≤ 50 V (RA máx. ${f0(r.tt.RAmax)} Ω)` });
  if (r.ndu) B.push({ t: 'ver', ok: !TIPOS_HASTES.includes(a.tipo) || r.nH >= r.ndu.hastes, text: `Padrão de entrada categoria ${r.ndu.cat} (NDU 001): mínimo de ${r.ndu.hastes} haste(s) e condutor de aterramento de ${r.ndu.aterr} mm²` });
  if (a.tipo === 'malha' && a.seg && r.IG != null) { B.push({ t: 'ver', ok: r.okToque, text: `Tensão de toque: Em = ${f0(r.Em)} V ${r.okToque ? '≤' : '>'} ${f0(r.Etoque)} V` }); B.push({ t: 'ver', ok: r.okPasso, text: `Tensão de passo: Es = ${f0(r.Es)} V ${r.okPasso ? '≤' : '>'} ${f0(r.Epasso)} V` }); }
  if (r.nMin && !r.okR) B.push({ t: 'note', text: `Para atingir ${f1(r.rmax)} Ω com hastes alinhadas espaçadas de ${f2(+a.e || +a.L)} m seriam necessárias ${r.nMin} hastes (Req = ${f2(r.nMinR)} Ω).` });
  r.avisos.forEach(x => B.push({ t: 'note', text: x }));
  if (a.obs) B.push({ t: 'note', text: a.obs });
}

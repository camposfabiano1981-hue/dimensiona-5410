/* ================================================================
   SPDA — desenhos (planta da cobertura, elevação, gráfico de risco)
   e memorial de análise de risco e projeto (NBR 5419:2026)
   ================================================================ */
const COR_SPDA = { cobre: '#b5652c', terra: '#2e9d4f', ink: '#1b1f23', mut: '#5b6670', face: '#ffffff', edif: '#eef2f4', linha: '#9aa6b0', acc: '#0b5a70' };

/* planta da cobertura: captação, descidas, anel de aterramento e eletrodos adicionais */
function plantaSPDASVG(p) {
  const C = COR_SPDA, W = 560, mg = 62, a = p.dParede, ext = p.nExtra ? Math.min(3, p.lr) : 0, Lt = p.L + 2 * (a + ext), Wt = p.W + 2 * (a + ext);
  const sc = Math.min((W - 2 * mg) / Lt, 330 / Wt), H = Math.round(Wt * sc + 2 * mg + 46), ox = (W - p.L * sc) / 2, oy = mg + (a + ext) * sc;
  const X = x => ox + x * sc, Y = y => oy + (p.W - y) * sc;
  let g = `<rect width="${W}" height="${H}" fill="${C.face}"/>`;
  // anel de aterramento
  g += `<rect x="${X(-a).toFixed(1)}" y="${Y(p.W + a).toFixed(1)}" width="${(p.Lx * sc).toFixed(1)}" height="${(p.Ly * sc).toFixed(1)}" fill="none" stroke="${C.terra}" stroke-width="2" stroke-dasharray="7 4"/>`;
  // edificação
  g += `<rect x="${X(0).toFixed(1)}" y="${Y(p.W).toFixed(1)}" width="${(p.L * sc).toFixed(1)}" height="${(p.W * sc).toFixed(1)}" fill="${C.edif}" stroke="${C.ink}" stroke-width="1.2"/>`;
  // proteção dos mastros (ângulo de proteção) e malha de captação
  if (p.mastros) {
    g += `<defs><clipPath id="spda-cob"><rect x="${X(0).toFixed(1)}" y="${Y(p.W).toFixed(1)}" width="${(p.L * sc).toFixed(1)}" height="${(p.W * sc).toFixed(1)}"/></clipPath></defs><g clip-path="url(#spda-cob)">`;
    p.mastros.forEach(([x, y]) => { g += `<circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="${(p.rp * sc).toFixed(1)}" fill="${C.acc}" fill-opacity="0.06" stroke="${C.acc}" stroke-width="1" stroke-dasharray="4 3"/>`; });
    g += '</g>';
  }
  const cap = (x1, y1, x2, y2) => lD(X(x1), Y(y1), X(x2), Y(y2), { cor: C.cobre, w: 2.4 });
  g += cap(0, 0, p.L, 0) + cap(p.L, 0, p.L, p.W) + cap(p.L, p.W, 0, p.W) + cap(0, p.W, 0, 0);
  if (!p.mastros) { for (let i = 1; i <= p.nx; i++) g += cap(i * p.celX, 0, i * p.celX, p.W); for (let j = 1; j <= p.ny; j++) g += cap(0, j * p.celY, p.L, j * p.celY); }
  else p.mastros.forEach(([x, y]) => {
    const dx = Math.min(x, p.L - x), dy = Math.min(y, p.W - y);
    g += dx <= dy ? cap(x, y, x < p.L / 2 ? 0 : p.L, y) : cap(x, y, x, y < p.W / 2 ? 0 : p.W);
    g += `<circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="6" fill="${C.face}" stroke="${C.ink}" stroke-width="1.6"/>` + xD(X(x), Y(y), 3.6);
  });
  // descidas, ligação ao anel e eletrodos adicionais
  p.desc.forEach(([x, y], i) => {
    const nx = x <= 1e-6 ? -1 : x >= p.L - 1e-6 ? 1 : 0, ny = y <= 1e-6 ? -1 : y >= p.W - 1e-6 ? 1 : 0;
    g += lD(X(x), Y(y), X(x + nx * a), Y(y + ny * a), { cor: C.terra, w: 1.6 });
    if (p.nExtra) g += lD(X(x + nx * a), Y(y + ny * a), X(x + nx * (a + ext)), Y(y + ny * (a + ext)), { cor: C.terra, w: 2.6 });
    g += `<circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="5.5" fill="${C.cobre}" stroke="${C.ink}" stroke-width="1"/>`;
    const tx = X(x) + (nx || (ny ? 0.7 : 0)) * 14, ty = Y(y) - (ny || 0) * 14 + (ny ? 0 : -9);
    g += tD(tx, ty + 4, `D${i + 1}`, { fs: 10, b: true, anc: nx < 0 ? 'end' : nx > 0 ? 'start' : 'middle' });
  });
  // cotas e legenda
  g += tD(X(p.L / 2), Y(-a - ext) + 30, `${nfmt(p.L, 2)} m`, { fs: 10, anc: 'middle', cor: C.mut });
  g += `<text x="${(X(-a - ext) - 30).toFixed(1)}" y="${Y(p.W / 2).toFixed(1)}" font-size="10" fill="${C.mut}" font-family="Arial" text-anchor="middle" transform="rotate(-90 ${(X(-a - ext) - 30).toFixed(1)} ${Y(p.W / 2).toFixed(1)})">${nfmt(p.W, 2)} m</text>`;
  const yl = H - 18;
  [[x => lD(x, yl, x + 26, yl, { cor: C.cobre, w: 2.4 }), 'captação'], [x => `<circle cx="${x + 13}" cy="${yl}" r="5" fill="${C.cobre}" stroke="${C.ink}"/>`, 'descida'], [x => lD(x, yl, x + 26, yl, { cor: C.terra, w: 2, dash: '7 4' }), 'anel de aterramento'],
    ...(p.mastros ? [[x => `<circle cx="${x + 13}" cy="${yl}" r="5" fill="${C.face}" stroke="${C.ink}"/>` + xD(x + 13, yl, 3), 'mastro e raio protegido']] : [])]
    .forEach(([f, l], i) => { const x = 14 + i * 132; g += f(x) + tD(x + 32, yl + 4, l, { fs: 9.5 }); });
  g += tD(W / 2, 22, `${p.mastros ? `Captores Franklin — ${p.mx * p.my} mastro(s) de ${nfmt(p.hm, 1)} m · α = ${nfmt(p.a, 1)}°` : `Malha de captação ${nfmt(p.celX, 2)} × ${nfmt(p.celY, 2)} m (máx. ${p.malha} × ${p.malha} m)`} · ${p.nDesc} descidas · NP ${p.base}`, { fs: 11, b: true, anc: 'middle' });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Planta do SPDA">${g}</svg>`;
}

/* elevação: descidas da fachada, anéis, anel de aterramento e zona protegida */
function elevacaoSPDASVG(p) {
  const C = COR_SPDA, W = 560, mg = 40, Hm = p.mastros ? p.hm : 0;
  const dxEsf = p.mastros ? 0 : (p.H < p.r ? Math.sqrt(p.r * p.r - (p.r - p.H) ** 2) : p.r);
  const ext = p.mastros ? Math.max(2, Math.min(p.rp, p.L * 0.5)) : Math.min(dxEsf, p.L * 0.9), span = p.L + 2 * ext + 4, alt = p.H + Hm + 2 + p.prof + 1.2, util = W - 2 * mg - 56;
  const sc = Math.min(util / span, 300 / alt), Hs = Math.round(alt * sc + 2 * mg + 20), x0 = mg + (util - p.L * sc) / 2, y0 = mg + (p.H + Hm + 2) * sc;
  const X = x => x0 + x * sc, Y = y => y0 - y * sc;
  let g = `<rect width="${W}" height="${Hs}" fill="${C.face}"/>`;
  // solo
  g += lD(10, Y(0), W - 10, Y(0), { cor: C.ink, w: 1.2 });
  for (let x = 14; x < W - 10; x += 12) g += lD(x, Y(0), x - 6, Y(0) + 6, { cor: C.linha, w: 0.8 });
  // zona protegida: esfera rolante (malha) ou ângulo de proteção (mastros)
  if (!p.mastros) {
    const d = Math.min(dxEsf, p.L * 0.9), arc = (xc, s) => { let path = ''; for (let k = 0; k <= 24; k++) { const xx = p.L / 2 + s * (p.L / 2 + d * k / 24), yy = p.r - Math.sqrt(Math.max(0, p.r * p.r - (xx - xc) ** 2)); path += `${k ? 'L' : 'M'}${X(xx).toFixed(1)} ${Y(Math.min(yy, p.H)).toFixed(1)} `; } return `<path d="${path}" fill="none" stroke="${C.acc}" stroke-width="1.3" stroke-dasharray="5 4"/>`; };
    if (p.H < p.r) { g += arc(-dxEsf, -1) + arc(p.L + dxEsf, 1); g += tD(X(-d * 0.55), Y(p.H * 0.55), `esfera rolante r = ${p.r} m`, { fs: 9.5, anc: 'middle', cor: C.acc }); }
  } else {
    const xs = [...new Set(p.mastros.map(m => +m[0].toFixed(3)))];
    xs.forEach(xm => { const t = Math.tan(p.a * Math.PI / 180) * p.hm; g += `<path d="M${X(xm - t).toFixed(1)} ${Y(p.H).toFixed(1)} L${X(xm).toFixed(1)} ${Y(p.H + p.hm).toFixed(1)} L${X(xm + t).toFixed(1)} ${Y(p.H).toFixed(1)}" fill="${C.acc}" fill-opacity="0.07" stroke="${C.acc}" stroke-width="1.2" stroke-dasharray="5 4"/>`;
      g += lD(X(xm), Y(p.H), X(xm), Y(p.H + p.hm), { cor: C.ink, w: 2.2 }) + `<polygon points="${X(xm) - 3},${Y(p.H + p.hm) + 6} ${X(xm) + 3},${Y(p.H + p.hm) + 6} ${X(xm)},${Y(p.H + p.hm) - 2}" fill="${C.cobre}"/>`; });
    g += tD(X(xs[0]) + 8, Y(p.H + p.hm * 0.6), `α = ${nfmt(p.a, 1)}°`, { fs: 9.5, cor: C.acc });
  }
  // edificação, captação no topo e anéis intermediários
  g += `<rect x="${X(0).toFixed(1)}" y="${Y(p.H).toFixed(1)}" width="${(p.L * sc).toFixed(1)}" height="${(p.H * sc).toFixed(1)}" fill="${C.edif}" stroke="${C.ink}" stroke-width="1.2"/>`;
  g += lD(X(0), Y(p.H), X(p.L), Y(p.H), { cor: C.cobre, w: 2.6 });
  p.yAneis.forEach(y => { g += lD(X(0), Y(y), X(p.L), Y(y), { cor: C.cobre, w: 1.6, dash: '6 4' }) + tD(X(p.L) + 6, Y(y) + 3.5, `anel ${nfmt(y, 0)} m`, { fs: 9, cor: C.mut }); });
  // descidas da fachada (y = 0), proteção mecânica, conector de medição e anel enterrado
  const fach = p.desc.filter(d => d[1] <= 1e-6).map(d => d[0]);
  fach.forEach(x => {
    g += lD(X(x), Y(p.H), X(x), Y(-p.prof), { cor: C.cobre, w: 2.2 });
    if (!p.natural) g += `<rect x="${(X(x) - 3.5).toFixed(1)}" y="${Y(2.5).toFixed(1)}" width="7" height="${(2.5 * sc).toFixed(1)}" fill="none" stroke="${C.mut}" stroke-width="1"/>` + `<rect x="${(X(x) - 5).toFixed(1)}" y="${(Y(1.5) - 4).toFixed(1)}" width="10" height="8" fill="${C.face}" stroke="${C.ink}" stroke-width="1"/>`;
  });
  g += lD(X(-p.dParede), Y(-p.prof), X(p.L + p.dParede), Y(-p.prof), { cor: C.terra, w: 2, dash: '7 4' });
  if (p.nExtra) fach.forEach(x => { g += lD(X(x), Y(-p.prof), X(x), Y(-p.prof - Math.min(p.lv, 3)), { cor: C.terra, w: 2.6 }); });
  // cotas
  g += lD(X(p.L) + 40, Y(0), X(p.L) + 40, Y(p.H), { cor: C.mut, w: 0.8 }) + tD(X(p.L) + 46, Y(p.H / 2) + 3.5, `${nfmt(p.H, 2)} m`, { fs: 10, cor: C.mut });
  g += tD(X(p.L / 2), Y(-p.prof) + 18, `anel de aterramento a ${nfmt(p.prof, 2)} m de profundidade e ${nfmt(p.dParede, 2)} m da parede`, { fs: 9.5, anc: 'middle', cor: C.terra });
  g += tD(W / 2, 20, `Elevação — ${fach.length} descida(s) na fachada · ${p.natural ? 'descidas naturais (armaduras)' : 'proteção mecânica até 2,5 m e conector de medição'}`, { fs: 11, b: true, anc: 'middle' });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Hs}" role="img" aria-label="Elevação do SPDA">${g}</svg>`;
}

/* gráfico de risco em escala logarítmica: R1 sem medidas, com as medidas adotadas e o tolerável */
function riscoSPDASVG(c) {
  const C = COR_SPDA, W = 560, H = 190, x0 = 170, x1 = W - 20, lo = -9, hi = -3, X = v => x0 + (Math.log10(Math.max(v, 1e-9)) - lo) / (hi - lo) * (x1 - x0);
  const linhas = [['R1 sem medidas', c.semProt.R1, RT_SPDA.R1], ['R1 com as medidas', c.risco.R1, RT_SPDA.R1], ['F sem medidas (×10⁻⁵)', c.semProt.F * 1e-5, c.risco.FT * 1e-5], ['F com as medidas (×10⁻⁵)', c.risco.F * 1e-5, c.risco.FT * 1e-5]];
  let g = `<rect width="${W}" height="${H}" fill="${C.face}"/>`;
  for (let e = lo; e <= hi; e++) { const x = X(10 ** e); g += lD(x, 30, x, H - 30, { cor: '#e1e6ea', w: 1 }) + tD(x, H - 14, `10${String(e).replace('-', '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`, { fs: 9, anc: 'middle', cor: C.mut }); }
  linhas.forEach(([rot, v, t], i) => {
    const y = 40 + i * 30, ok = v <= t * (1 + 1e-9);
    g += tD(x0 - 8, y + 4, rot, { fs: 10, anc: 'end' }) + `<rect x="${x0}" y="${y - 8}" width="${Math.max(1, X(v) - x0).toFixed(1)}" height="16" rx="2" fill="${ok ? '#3d8b5f' : '#c0392b'}"/>`;
    g += lD(X(t), y - 12, X(t), y + 12, { cor: C.ink, w: 2 }) + tD(Math.min(X(v), x1 - 40) + 6, y + 4, i < 2 ? `${nfmt(v * 1e5, 2)} × 10⁻⁵` : `${nfmt(v * 1e5, 3)} /ano`, { fs: 9.5, cor: C.ink });
  });
  g += tD(20, 18, 'Traço vertical: valor tolerável. Verde: atende; vermelho: não atende.', { fs: 9.5, cor: C.mut });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de risco">${g}</svg>`;
}

/* ---------- memorial ---------- */
const e10 = (v, k = 5) => v == null ? '—' : `${nfmt(v * 10 ** k, 3)} × 10⁻${String(k).replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`;
function construirMemorialSPDA(proj, calc, opt = {}) {
  const o = Object.assign({ assinatura: true }, opt), I = proj.info, sp = proj.spda, c = calc.spda || calcSPDA(proj, calc), B = [];
  const f0 = v => nfmt(v, 0), f1 = v => nfmt(v, 1), f2 = v => nfmt(v, 2), f3 = v => nfmt(v, 3), r = c.risco, s0 = c.semProt, p = c.projeto;
  B.push({ t: 'title', kicker: 'ABNT NBR 5419:2026 — Proteção contra descargas atmosféricas', text: 'Análise de risco e projeto do SPDA', sub: `${sp.nome || 'Estrutura'} — análise de risco (Parte 2), sistema de proteção contra descargas atmosféricas (Parte 3) e proteção contra surtos (Parte 4)` });
  B.push({ t: 'meta', rows: [['Obra', I.obra || '—'], ['Proprietário / cliente', I.cliente || '—'], ['Endereço', [I.endereco, I.cidade].filter(Boolean).join(' — ') || '—'],
    ['Responsável técnico', [I.responsavel, I.registro].filter(Boolean).join(' — ') || '—'], ['ART / TRT / RRT', I.art || '—'], ['Data / revisão', `${dataCurta(I.data) || '—'} — ${I.revisao || 'R00'}`]] });
  let n = 0; const sec = t => { n++; B.push({ t: 'h1', text: `${n}. ${t}` }); return n; };
  sec('Objetivo');
  B.push({ t: 'p', text: `Este memorial apresenta a análise de risco da estrutura "${sp.nome || 'Estrutura'}" frente às descargas atmosféricas, segundo a ABNT NBR 5419-2:2026, a definição das medidas de proteção e ${p ? `o projeto do sistema de proteção contra descargas atmosféricas (SPDA) com nível de proteção ${p.base}, segundo a ABNT NBR 5419-3:2026, além da proteção contra surtos na entrada das linhas (ABNT NBR 5419-4:2026)` : 'a proteção contra surtos na entrada das linhas (ABNT NBR 5419-4:2026)'}.` });
  sec('Normas e documentos de referência');
  B.push({ t: 'list', items: ['ABNT NBR 5419-1:2026 — Proteção contra descargas atmosféricas — Parte 1: Princípios gerais.', 'ABNT NBR 5419-2:2026 — Parte 2: Análise de risco (densidade de descargas NG no Anexo F).',
    'ABNT NBR 5419-3:2026 — Parte 3: Danos físicos a estruturas e perigos à vida.', 'ABNT NBR 5419-4:2026 — Parte 4: Sistemas elétricos e eletrônicos internos na estrutura.',
    'ABNT NBR 5410:2004 Versão Corrigida:2008 — Instalações elétricas de baixa tensão.', 'ABNT NBR 13571 — Haste de aterramento aço-cobreada e acessórios.', 'ABNT NBR 7117-1:2020 — Medição da resistividade e determinação da estratificação do solo.'] });
  sec('Caracterização da estrutura');
  B.push({ t: 'table', head: ['Parâmetro', 'Valor adotado'], widths: [42, 58], rows: [
    ['Dimensões (L × W × H)', `${f2(+sp.L)} × ${f2(+sp.W)} × ${f2(+sp.H)} m`], ['Localização relativa (CD)', `${CD_LOC[sp.cd][1]} — CD = ${fp(CD_LOC[sp.cd][0])}`],
    ['Densidade de descargas NG', `${nfmt(c.ng.valor, c.ng.valor % 1 ? 2 : 0)} descargas/km²/ano — ${c.ng.fonte}`], ['Ocupação (perda LF)', `${OCUP_SPDA[sp.ocup][1]} — LF = ${fp(OCUP_SPDA[sp.ocup][0])}`],
    ['Piso / solo junto às descidas (rt)', `${RT_PISO[sp.piso][1]} — rt = ${fp(RT_PISO[sp.piso][0])}`], ['Providências contra incêndio (rp)', `${RP_OP[sp.rp][1]} — rp = ${fp(RP_OP[sp.rp][0])}`],
    ['Risco de incêndio ou explosão (rf)', `${RF_OP[sp.rf][1]} — rf = ${fp(RF_OP[sp.rf][0])}`], ['Perigo especial (hz)', `${HZ_OP[sp.hz][1]} — hz = ${fp(HZ_OP[sp.hz][0])}`],
    ['Pessoas na zona / total e permanência', `${f0(+sp.nzNt)} % · ${f0(+sp.tz)} h/ano`], ['Falha de sistemas internos põe a vida em risco', `${VIDA_OP[sp.vida][1]}${sp.vida !== 'nao' ? ` — LO = ${fp(VIDA_OP[sp.vida][0])}` : ''}`],
    ['Patrimônio cultural (R3)', sp.patrimonio ? `Sim — ${f0(+sp.czCt)} % do valor na zona` : 'Não'], ['Sistemas internos críticos', sp.critico ? 'Sim — frequência tolerável de 0,1 por ano' : 'Não — frequência tolerável de 1 por ano']] });
  const lin = (sp.linhas || []).filter(l => l.ativa);
  if (lin.length) B.push({ t: 'table', small: true, head: ['Linha', 'Instalação (CI)', 'LL (m)', 'Ambiente (CE)', 'Tipo (CT)', 'Blindagem (CLD / CLI)', 'UW (kV)'], widths: [16, 14, 8, 14, 14, 26, 8], align: 'llrlllr',
    rows: lin.map(l => [l.nome, `${CI_LIN[l.inst][1]} (${fp(CI_LIN[l.inst][0])})`, f0(+l.LL), `${CE_LIN[l.ce][1]} (${fp(CE_LIN[l.ce][0])})`, `${CT_LIN[l.ct][1]} (${fp(CT_LIN[l.ct][0])})`, `${BLIND_LIN[l.blind][2]} (${fp(BLIND_LIN[l.blind][0])} / ${fp(BLIND_LIN[l.blind][1])})`, nfmt(+l.uw, 1)]) });
  else B.push({ t: 'p', text: 'A estrutura não possui linhas externas de energia ou de telecomunicações conectadas.' });
  const sR = sec('Análise de risco (NBR 5419-2:2026)');
  B.push({ t: 'h2', text: `${sR}.1 Áreas de exposição e número anual de eventos perigosos` });
  B.push({ t: 'eq', lines: [`AD = L × W + 2 × (3H) × (L + W) + π × (3H)² = ${f0(r.AD)} m²;   ND = NG × AD × CD × 10⁻⁶ = ${nfmt(c.ng.valor, c.ng.valor % 1 ? 2 : 0)} × ${f0(r.AD)} × ${fp(r.CD)} × 10⁻⁶ = ${nfmt(r.ND, 4)} /ano`,
    `AM = 2 × 500 × (L + W) + π × 500² = ${f0(r.AM)} m²;   NM = NG × AM × 10⁻⁶ = ${nfmt(r.NM, 3)} /ano`,
    ...r.linhas.map(l => `${l.nome}: AL = 40 × LL = ${f0(l.AL)} m²; NL = NG × AL × CI × CE × CT × 10⁻⁶ = ${nfmt(l.NL, 4)} /ano; AI = 4 000 × LL; NI = ${nfmt(l.NI, 3)} /ano`)] });
  B.push({ t: 'h2', text: `${sR}.2 Perdas` });
  B.push({ t: 'eq', lines: [`fração de exposição = (nz / nt) × (tz / 8 760) = ${f3(r.fr)}`, `LA = LU = rt × LT × fração = ${fp(r.rt)} × 10⁻² × ${f3(r.fr)} = ${e10(r.LA, 5)}`,
    `LB = LV = rp × rf × hz × LF × fração = ${fp(r.rp)} × ${fp(r.rf)} × ${fp(r.hz)} × ${fp(r.LF)} × ${f3(r.fr)} = ${e10(r.LB, 5)}`, ...(r.vida ? [`LC = LM = LW = LZ = LO × fração = ${fp(r.LO)} × ${f3(r.fr)} = ${e10(r.LC, 5)}`] : [])] });
  B.push({ t: 'h2', text: `${sR}.3 Componentes de risco` });
  const comp = [['RA', 'Ferimentos por tensões de toque e passo (descarga na estrutura)', 'ND × PA × LA', true], ['RB', 'Danos físicos (descarga na estrutura)', 'ND × PB × LB', true], ['RC', 'Falha de sistemas internos (descarga na estrutura)', 'ND × PC × LC', r.vida], ['RM', 'Falha de sistemas internos (descarga perto da estrutura)', 'NM × PM × LM', r.vida],
    ['RU', 'Ferimentos (descarga na linha)', 'NL × PU × LU', true], ['RV', 'Danos físicos (descarga na linha)', 'NL × PV × LV', true], ['RW', 'Falha de sistemas internos (descarga na linha)', 'NL × PW × LW', r.vida], ['RZ', 'Falha de sistemas internos (descarga perto da linha)', 'NI × PZ × LZ', r.vida]];
  B.push({ t: 'table', small: true, head: ['Comp.', 'Origem do dano', 'Expressão', 'Sem medidas', 'Com as medidas adotadas'], widths: [8, 42, 16, 17, 17], align: 'lllrr',
    rows: [...comp.filter(x => x[3]).map(([k, d, e]) => [k, d, e, e10(s0[k]), e10(r[k])]), ['R1', 'Risco de perda de vida humana', 'soma', e10(s0.R1), e10(r.R1)], ...(sp.patrimonio ? [['R3', 'Risco de perda de patrimônio cultural', 'RB + RV', e10(s0.R3, 4), e10(r.R3, 4)]] : [])] });
  B.push({ t: 'p', text: `Probabilidades com as medidas adotadas: PB = ${fp(r.PB)} (${NP_TXT[c.npAdot]}); PTA = ${fp(r.PTA)}; PEB = PSPD = ${fp(r.PSPD)} (${DPS_TXT[c.dpsAdot]}); PTU = ${fp(r.PTU)}.${r.linhas.length ? ' ' + r.linhas.map(l => `${l.nome}: PLD = ${fp(l.PLD)}, PLI = ${fp(l.PLI)}, PU = ${nfmt(l.PU, 4)}, PV = ${nfmt(l.PV, 4)}, PW = ${nfmt(l.PW, 4)}, PZ = ${nfmt(l.PZ, 4)}`).join('; ') + '.' : ''}` });
  B.push({ t: 'h2', text: `${sR}.4 Combinações de nível de proteção e DPS` });
  B.push({ t: 'table', small: true, head: ['Nível de proteção', ...DPS_OPCOES.map(d => DPS_TXT[d].replace('DPS compatíveis com ', 'DPS '))], widths: [24, 19, 19, 19, 19], align: 'lrrrr',
    rows: c.matriz.map(m => [NP_TXT[m.np], ...m.cel.map(x => x ? `${nfmt(x.R1 * 1e5, 3)}${x.okR1 && x.okR3 ? ' ✓' : ''}` : '—')]) });
  B.push({ t: 'note', text: 'Valores de R1 em 10⁻⁵ (✓ atende ao risco tolerável). Com SPDA, os DPS da entrada devem ser compatíveis com o mesmo nível de proteção (equipotencialização para descargas atmosféricas).' });
  const svgR = riscoSPDASVG(c), arR = arDe(svgR);
  B.push({ t: 'fig', svg: svgDoc(svgR, 560, Math.round(560 * arR)), ar: arR, w: 120, caption: 'Risco R1 e frequência de danos F antes e depois das medidas de proteção, comparados aos valores toleráveis.' });
  B.push({ t: 'h2', text: `${sR}.5 Verificação` });
  B.push({ t: 'ver', ok: r.okR1, text: `R1 = ${e10(r.R1)} ${r.okR1 ? '≤' : '>'} RT = 1 × 10⁻⁵ (perda de vida humana)` });
  if (sp.patrimonio) B.push({ t: 'ver', ok: r.okR3, text: `R3 = ${e10(r.R3, 4)} ${r.okR3 ? '≤' : '>'} RT = 1 × 10⁻⁴ (patrimônio cultural)` });
  B.push({ t: 'ver', ok: r.okF, text: `Frequência de danos F = FC + FM + FW + FZ = ${nfmt(r.F, 4)} /ano ${r.okF ? '≤' : '>'} FT = ${nfmt(r.FT, 1)} /ano (sistemas internos${sp.critico ? ' críticos' : ''})` });
  B.push({ t: 'p', text: c.npMin == null ? 'Nenhuma combinação de nível de proteção e DPS atende ao risco tolerável: são necessárias medidas adicionais (providências contra incêndio, restrições de acesso, isolação das descidas, blindagens).'
    : c.npMin === 'nenhum' ? `${c.dpsMin === 'nenhum' ? 'Sem SPDA e sem DPS coordenados, o risco R1 atende ao tolerável' : `Sem SPDA, o risco R1 atende ao tolerável com ${minusc(DPS_TXT[c.dpsMin])} na entrada das linhas`}. ${c.opcional ? `O SPDA ${NP_TXT[c.npAdot]} é adotado por opção do projeto (proteção do patrimônio ou exigência de outra regulamentação).` : 'Não é exigido SPDA pela análise de risco.'}`
    : `A análise de risco exige SPDA com nível de proteção mínimo NP ${c.npMin}${c.dpsMin !== 'nenhum' ? ` e ${minusc(DPS_TXT[c.dpsMin])}` : ''}. Adotado: ${NP_TXT[c.npAdot]} e ${minusc(DPS_TXT[c.dpsAdot])}.` });
  if (p) {
    const sP = sec('Projeto do SPDA (NBR 5419-3:2026)');
    B.push({ t: 'h2', text: `${sP}.1 Nível de proteção e parâmetros` });
    B.push({ t: 'table', head: ['Parâmetro', `NP ${p.base}`], widths: [55, 45], rows: [['Raio da esfera rolante', `${p.r} m`], ['Máximo afastamento da malha de captação', `${p.malha} × ${p.malha} m`],
      ['Ângulo de proteção', p.mastros ? (p.a != null ? `${f1(p.a)}° para captor de ${f1(p.hm)} m` : 'não aplicável à altura do captor') : (p.a != null ? `${f1(p.a)}° para ${f1(Math.min(p.H, p.r))} m de altura` : '—')],
      ['Distância típica entre descidas e entre anéis', `${p.dDesc} m (tolerância de 20 %)`], ['Coeficiente ki (distância de segurança)', fp(p.ki)], ['Corrente de pico de referência', `${p.Ip} kA`]] });
    B.push({ t: 'h2', text: `${sP}.2 Subsistema de captação` });
    if (p.mastros) B.push({ t: 'eq', lines: [`Captores Franklin: ${p.mx} × ${p.my} = ${p.mx * p.my} mastro(s) de ${f2(p.hm)} m acima da cobertura`, `α(${f2(p.hm)} m; NP ${p.base}) = ${p.a != null ? f1(p.a) + '°' : '—'};   raio protegido no plano da cobertura = h × tg α = ${f2(p.rp)} m`, `ponto mais distante de um captor: ${f2(p.dmax)} m ${p.ok ? '≤' : '>'} ${f2(p.rp)} m`, `condutores de captação (perímetro e interligações): ${f0(p.Lcapt)} m`] });
    else B.push({ t: 'eq', lines: [`Método das malhas: condutores no perímetro da cobertura e ${p.nx} + ${p.ny} condutores internos`, `malha resultante: ${f2(p.celX)} × ${f2(p.celY)} m ≤ ${p.malha} × ${p.malha} m`, `comprimento da captação: perímetro ${f1(p.per)} m + internos ${f1(p.nx * p.W + p.ny * p.L)} m = ${f0(p.Lcapt)} m`] });
    B.push({ t: 'p', text: 'Os condutores de captação seguem as bordas, cumeeiras e saliências da cobertura; elementos metálicos da cobertura (rufos, calhas, antenas, equipamentos) são interligados à captação ou protegidos por captores próprios, respeitada a distância de segurança.' });
    const svgP = plantaSPDASVG(p), arP = arDe(svgP);
    B.push({ t: 'fig', svg: svgDoc(svgP, 560, Math.round(560 * arP)), ar: arP, full: true, px: 1120, w: 172, caption: `Planta da cobertura: captação, ${p.nDesc} descidas (D1 a D${p.nDesc}) e anel de aterramento.` });
    B.push({ t: 'h2', text: `${sP}.3 Descidas e anéis` });
    B.push({ t: 'eq', lines: [`perímetro = ${f1(p.per)} m;   descidas: ${p.nDesc} (cantos e intermediárias), espaçamento máximo de ${f1(p.espDesc)} m ≤ ${p.dDesc} m (+20 %)`, `anéis intermediários: ${p.nAneis}${p.nAneis ? ` (a ${p.yAneis.map(f0).join(', ')} m de altura)` : ' — altura menor que o espaçamento típico'};   comprimento das descidas: ${p.natural ? 'descidas naturais' : f0(p.Ldesc) + ' m'}`] });
    B.push({ t: 'p', text: p.natural ? 'As descidas utilizam as armaduras de aço interligadas da estrutura (componentes naturais), com continuidade elétrica verificada; são previstos pontos de conexão para o anel de aterramento e para medição.' : 'As descidas são instaladas preferencialmente nos cantos, afastadas de portas e janelas, com conector de medição (desconexão para ensaio) e proteção mecânica por eletroduto de PVC rígido junto ao solo.' });
    B.push({ t: 'h2', text: `${sP}.4 Subsistema de aterramento (arranjo B — anel)` });
    B.push({ t: 'eq', lines: [`anel a ${f2(p.dParede)} m das paredes e ${f2(p.prof)} m de profundidade: ${f2(p.Lx)} × ${f2(p.Ly)} m; comprimento ${f1(p.Lanel)} m`, `raio médio re = √(A / π) = √(${f1(p.Aanel)} / π) = ${f2(p.re)} m;   l1 (NP ${p.base}, ρ = ${f0(p.rho)} Ω·m) = ${f2(p.l1)} m`,
      p.okAnel ? `re ≥ l1: não são necessários eletrodos adicionais` : `re < l1: ${p.nExtra} eletrodos adicionais de ${f2(p.lr)} m (horizontais) ou ${f2(p.lv)} m (verticais) — adotadas ${p.hastesPorEl} haste(s) de 2,4 m por descida`,
      `resistência estimada do anel (informativa): R = ρ / (2π²D) × [ln(8D/d) + ln(4D/h)] = ${f2(p.Ranel)} Ω (ρ ${p.rhoTxt})`] });
    B.push({ t: 'p', text: 'O anel de aterramento é interligado ao barramento de equipotencialização principal (BEP) e ao aterramento das instalações elétricas, formando um único sistema de aterramento. A eficácia do subsistema é verificada pela continuidade elétrica dos condutores e conexões; a resistência calculada é informativa.' });
    B.push({ t: 'h2', text: `${sP}.5 Distância de segurança` });
    B.push({ t: 'eq', lines: [`s = ki × (kc / km) × l = ${fp(p.ki)} × (${fp(p.kc)} / ${fp(p.km)}) × ${f2(p.lSep)} = ${f2(p.s)} m`, `kc = ${fp(p.kc)} (${p.natural ? 'descidas naturais' : `${p.nDesc} descidas`}); km = ${fp(p.km)} (${p.km === 1 ? 'ar' : 'material sólido'}); l = altura até a equipotencialização junto ao solo`] });
    B.push({ t: 'p', text: `Partes metálicas e instalações internas a menos de ${f2(p.s)} m da captação ou das descidas devem ser interligadas ao SPDA ou afastadas dessa distância.` });
    const svgE = elevacaoSPDASVG(p), arE = arDe(svgE);
    B.push({ t: 'fig', svg: svgDoc(svgE, 560, Math.round(560 * arE)), ar: arE, full: true, px: 1120, w: 172, caption: `Elevação: captação, descidas, anéis, anel de aterramento e zona protegida (${p.mastros ? 'ângulo de proteção dos captores' : 'esfera rolante'}).` });
    B.push({ t: 'h2', text: `${sP}.6 Equipotencialização e DPS (NBR 5419-4:2026)` });
    B.push({ t: 'p', text: `Na entrada das linhas de energia e de sinal, os condutores metálicos são ligados ao BEP diretamente ou por DPS classe I. Para o NP ${p.base}, metade da corrente de pico de ${p.Ip} kA dividida entre os ${p.nModos} condutores da linha de energia resulta em Iimp ≥ ${f1(p.Iimp)} kA (10/350 µs) por modo de proteção. Nos quadros de distribuição a jusante são previstos DPS classe II coordenados.` });
    B.push({ t: 'h2', text: `${sP}.7 Materiais` });
    B.push({ t: 'table', small: true, head: ['Descrição', 'Qtd.', 'Un.', 'Norma'], widths: [58, 9, 7, 26], align: 'lrll', rows: p.materiais.map(([d, q, u, nn]) => [d, u === 'm' ? f0(q) : String(q), u, nn]) });
    B.push({ t: 'note', text: 'Seções mínimas (NBR 5419-3:2026): captação e descidas — cobre ou aço cobreado 35 mm², alumínio 70 mm², aço zincado a quente 50 mm²; aterramento — cobre (7 ou 19 fios) ou aço cobreado 50 mm². Não utilizar aço zincado a quente na transição concreto–solo.' });
  }
  const sI = sec('Inspeção e manutenção');
  const comp2 = p ? p.inspecao.completa : INSP_SPDA[sp.insp][0];
  B.push({ t: 'list', items: [`Inspeção visual anual e inspeção completa a cada ${comp2} ano${comp2 > 1 ? 's' : ''} (${INSP_SPDA[sp.insp][1].toLowerCase()}).`, 'Inspeções também após a conclusão da obra, após alterações ou reparos na estrutura e após descarga atmosférica na estrutura.',
    'Verificar: integridade e fixação dos condutores e captores, corrosão, conexões, continuidade elétrica das descidas e do aterramento, distâncias de segurança e equipotencializações, estado dos DPS.', 'Registrar as inspeções em relatório técnico com ART, mantendo a documentação do SPDA atualizada.'] });
  sec('Conclusão');
  B.push({ t: 'p', text: `${r.okR1 && r.okR3 ? 'Com as medidas adotadas, o risco de perda de vida humana atende ao valor tolerável da ABNT NBR 5419-2:2026' : 'As medidas adotadas não atendem ao risco tolerável; revise o nível de proteção e as medidas complementares'}${r.okF ? '' : ', e a frequência de danos aos sistemas internos exige medidas de proteção contra surtos (MPS)'}. ${p ? `O SPDA nível ${p.base} tem ${p.nDesc} descidas, ${p.mastros ? `${p.mx * p.my} captor(es) Franklin` : 'captação em malha'} e anel de aterramento de ${f0(p.Lanel)} m.` : ''}` });
  if (sp.obs) B.push({ t: 'note', text: sp.obs });
  if (o.assinatura) B.push({ t: 'sign', place: [I.cidade, dataExtenso(I.data)].filter(Boolean).join(', '), name: I.responsavel || 'Responsável técnico', reg: [I.registro, I.art ? 'ART ' + I.art : ''].filter(Boolean).join(' — ') });
  return B;
}

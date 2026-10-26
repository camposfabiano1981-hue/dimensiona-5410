/* ================================================================
   LUMINOTÉCNICA — desenhos (luminárias, locação, mapa de iluminância)
   e relatório de cálculo luminotécnico
   ================================================================ */
const COR_E = ['#2c3e94', '#1f8fbf', '#3cb371', '#e8d23a', '#e8762c', '#c8302c'];
function corE(x) { const t = clamp((x - 0.5) / 1.0, 0, 1) * (COR_E.length - 1), i = Math.min(COR_E.length - 2, Math.floor(t)), f = t - i; const h = c => [1, 3, 5].map(j => parseInt(c.slice(j, j + 2), 16)); const a = h(COR_E[i]), b = h(COR_E[i + 1]); return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * f)).join(',')})`; }
const coresPlanta = doc => doc ? { ink: '#1b1f23', mut: '#6a737b', face: '#ffffff', parede: '#c9d1d7', acc: '#0b5a70' } : { ink: 'var(--ink)', mut: 'var(--muted)', face: 'var(--sheet)', parede: 'var(--line)', acc: 'var(--accent)' };

/* ---------- iluminação de exteriores: planta com mapa de iluminância, postes e mira ---------- */
function plantaExtSVG(a, r, doc = true, opt = {}) {
  const C = coresPlanta(doc), Wd = 520, mg = 46, sc = Math.min((Wd - 2 * mg) / r.L, 300 / r.W), w = r.L * sc, h = r.W * sc, Hd = h + 2 * mg + 18, x0 = mg, y0 = mg;
  let g = `<rect x="0" y="0" width="${Wd}" height="${Hd.toFixed(0)}" fill="${C.face}"/>`;
  const cx = w / r.gx, cy = h / r.gy;
  r.malha.forEach((lin, i) => lin.forEach((E, j) => { g += `<rect x="${(x0 + i * cx).toFixed(1)}" y="${(y0 + h - (j + 1) * cy).toFixed(1)}" width="${(cx + 0.5).toFixed(1)}" height="${(cy + 0.5).toFixed(1)}" fill="${corE(E / r.Em)}"/>`; }));
  if (opt.valores !== false) { const si = Math.max(1, Math.ceil(r.gx / 10)), sj = Math.max(1, Math.ceil(r.gy / 7)), fs = Math.min(cx * si, cy * sj) * 0.34;
    for (let i = Math.floor(si / 2); i < r.gx; i += si) for (let j = Math.floor(sj / 2); j < r.gy; j += sj) g += `<text x="${(x0 + (i + 0.5) * cx).toFixed(1)}" y="${(y0 + h - (j + 0.5) * cy + fs * 0.35).toFixed(1)}" font-size="${Math.max(6, Math.min(11, fs)).toFixed(1)}" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="700">${nfmt(r.malha[i][j], 0)}</text>`; }
  g += `<rect x="${x0}" y="${y0}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="${C.ink}" stroke-width="1.2"/>`;
  const X = x => x0 + x * sc, Y = y => y0 + h - y * sc;
  r.postes.forEach(p => {
    const k = Math.max(1, r.k), px = X(p.x), py = Y(p.y);
    for (let j = 0; j < k; j++) { const az = a.arranjo === 'grade' && k > 1 ? p.az + 2 * Math.PI * j / k : p.az, len = (+a.tilt > 3 ? 14 + (+a.tilt) / 90 * 22 : 0); if (len) g += `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${(px + Math.cos(az) * len).toFixed(1)}" y2="${(py - Math.sin(az) * len).toFixed(1)}" stroke="${C.ink}" stroke-width="1.6" marker-end="url(#seta${doc ? 'd' : 'u'})"/>`; }
    g += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5.5" fill="${C.face}" stroke="${C.ink}" stroke-width="1.6"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2" fill="${C.ink}"/>`;
  });
  const t = (x, y, s, o = '') => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="10" fill="${C.mut}" font-family="Arial" ${o}>${s}</text>`;
  g += t(x0 + w / 2, y0 + h + 30, `${nfmt(r.L, 1)} m`, 'text-anchor="middle"') + `<text x="${(x0 - 30).toFixed(1)}" y="${(y0 + h / 2).toFixed(1)}" font-size="10" fill="${C.mut}" font-family="Arial" text-anchor="middle" transform="rotate(-90 ${(x0 - 30).toFixed(1)} ${(y0 + h / 2).toFixed(1)})">${nfmt(r.W, 1)} m</text>`;
  g += t(8, Hd - 6, `${r.nPostes} poste(s) × ${r.k} proj. · h ${nfmt(r.h, 1)} m · incl. ${nfmt(+a.tilt || 0, 0)}° · Eméd ${nfmt(r.EmedPP, 0)} lx · U0 ${nfmt(r.U0, 2)}`);
  const defs = `<defs><marker id="seta${doc ? 'd' : 'u'}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${C.ink}"/></marker></defs>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${Hd.toFixed(0)}" role="img" aria-label="Planta da área externa com iluminância">${defs}${g}</svg>`;
}
function memLumiExt(B, a, r, num) {
  const f0 = v => nfmt(v, 0), f1 = v => nfmt(v, 1), f2 = v => nfmt(v, 2), f3 = v => nfmt(v, 3);
  B.push({ t: 'h2', text: `${num} ${a.nome}` });
  B.push({ t: 'kv4', rows: [['Área', `${f1(r.L)} × ${f1(r.W)} m = ${f0(r.A)} m²`, 'Requisito', `${r.req.n} — ${f0(r.Em)} lx, U0 ≥ ${f2(r.U0req)} (${r.req.ref})`],
    ['Projetor', `${r.prod.nome} — ${f0(r.Wlum)} W, ${f0(r.phi)} lm, facho ${f0(r.prod.facho)}°${r.prod.ip ? ', ' + r.prod.ip : ''}`, 'Arranjo', `${ARRANJOS_EXT[a.arranjo]}: ${r.nPostes} poste(s) × ${r.k} projetor(es), h = ${f1(r.h)} m, inclinação ${f0(+a.tilt || 0)}°`]] });
  B.push({ t: 'eq', lines: [`Método dos lúmens:  N = ${f0(r.Em)} × ${f0(r.A)} / (${f0(r.phi)} × ${f2(r.Fu)} × ${f2(r.Fd)}) = ${f2(r.Nreq)}  →  adotados ${r.N} projetores;  Eméd = ${f1(r.Emed)} lx`,
    `Ponto a ponto:  m = ${f2(r.m)};  I0 = ${f0(r.phi)} × (${f2(r.m)} + 1) / 2π = ${f0(r.I0)} cd;  malha ${r.gx} × ${r.gy} pontos (passo ${f2(r.passo)} m)`,
    `Eméd = ${f1(r.EmedPP)} lx;  Emín = ${f1(r.EminPP)} lx;  Emáx = ${f1(r.EmaxPP)} lx;  U0 = Emín/Eméd = ${f2(r.U0)};  Emín/Emáx = ${f2(r.Ud)};  Fu efetivo = ${f2(r.FuEf)}`,
    `Potência instalada = ${r.N} × ${f0(r.Wlum)} W = ${f0(r.P)} W  (${f2(r.dens)} W/m²)`] });
  const pl = plantaExtSVG(a, r, true), ar = Math.min(1.25, arDe(pl));
  B.push({ t: 'fig', svg: svgDoc(pl, 520, Math.round(520 * ar)), ar, w: ar > 0.9 ? 80 : 110, caption: `Planta de ${a.nome}: postes (círculos), direção de mira dos projetores (setas) e iluminância mantida calculada ponto a ponto (lx). Cores: azul ≤ 0,5 × Eméd exigida; verde próximo da exigida; vermelho ≥ 1,5 × a exigida.` });
  B.push({ t: 'ver', ok: r.okEm, text: `Iluminância média ${f0(r.EmedPP)} lx ${r.okEm ? '≥' : '<'} ${f0(r.Em)} lx exigidos` });
  B.push({ t: 'ver', ok: r.okU0, text: `Uniformidade Emín/Eméd = ${f2(r.U0)} ${r.okU0 ? '≥' : '<'} ${f2(r.U0req)}` });
  r.avisos.forEach(x => B.push({ t: 'note', text: x }));
  if (a.obs) B.push({ t: 'note', text: a.obs });
}

/* ---------- classificação do produto para o desenho ---------- */
function corpoKey(r) { return Object.keys(CORPOS).find(k => CORPOS[k] === r.corpo) || (r.prod.tubo ? 'aletada' : 'plafonier'); }
function tipoDesenho(r) {
  const p = r.prod, m = `${p.mod || ''} ${p.id || ''}`;
  if (p.tipo === 'lampada') return p.tubo ? 'tubo-' + corpoKey(r) : corpoKey(r);
  if (/painel|LHT44/i.test(m)) return 'painel';
  if (/downlight|EF40|EF93/i.test(m)) return 'downlight';
  if (/plafon/i.test(m)) return /quadrad/i.test(m) ? 'plafonQ' : 'plafonR';
  if (/refletor|flood/i.test(m)) return 'refletor';
  if (/high bay|industrial/i.test(m)) return 'highbay';
  return 'generica';
}
const compTubo = r => /120/.test(r.prod.mod || '') ? 1.2 : 0.6;
function dimLum(r) {
  const m = r.prod.mod || '';
  if (/62×62/.test(m)) return '620 × 620 mm';
  if (/painel/i.test(m) && /60 cm/.test(m)) return '600 × 600 mm';
  if (r.prod.tubo) return `lâmpada de ${compTubo(r) === 1.2 ? '1.200' : '600'} mm`;
  return null;
}
const NOME_DESENHO = { painel: 'painel de embutir', downlight: 'downlight de embutir', plafonR: 'plafon de sobrepor', plafonQ: 'plafon de sobrepor', refletor: 'refletor (projetor)', highbay: 'industrial suspensa', generica: 'luminária', plafonier: 'plafonier com globo', pendente: 'pendente', spot: 'spot de embutir', 'tubo-calha': 'calha de sobrepor', 'tubo-aletada': 'refletor com aletas', 'tubo-leitosa': 'difusor leitoso', 'tubo-hermetica': 'hermética' };

/* ---------- desenho da luminária: vista inferior + corte (160 × 100) ---------- */
function desenhoLuminaria(r, P = PAL_DOC) {
  const tp = tipoDesenho(r), ln = P.ln, mut = P.mut, face = P.face, luz = '#ffe7a3', luzS = '#d9a93a', leit = '#f6f3ea';
  const nL = Math.max(1, Math.min(4, r.nLamp || 1));
  const forro = (y, a = null, b = null) => { let s = ''; const seg = (x1, x2) => { s += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${ln}" stroke-width="1.2"/>`; for (let x = x1 + 2; x < x2 - 3; x += 6) s += `<line x1="${x}" y1="${y}" x2="${x + 4}" y2="${y - 4}" stroke="${mut}" stroke-width=".6"/>`; }; if (a == null) seg(84, 156); else { seg(84, a); seg(b, 156); } return s; };
  const raios = (x, y, ang, len) => [-ang, -ang / 2, 0, ang / 2, ang].map(g => { const t = g * Math.PI / 180; return `<line x1="${x}" y1="${y}" x2="${(x + len * Math.sin(t)).toFixed(1)}" y2="${(y + len * Math.cos(t)).toFixed(1)}" stroke="${luzS}" stroke-width=".7" stroke-dasharray="2 2"/>`; }).join('');
  const ang = clamp((r.facho || 120) / 2, 20, 60);
  let A = '', C = '', rotA = 'Vista inferior', rotC = 'Corte';
  if (tp === 'painel') {
    A = `<rect x="16" y="20" width="48" height="48" fill="${face}" stroke="${ln}" stroke-width="1.6"/><rect x="20" y="24" width="40" height="40" fill="${luz}" stroke="${luzS}" stroke-width=".6"/>`;
    C = forro(36, 92, 148) + `<rect x="92" y="32" width="56" height="7" fill="${face}" stroke="${ln}" stroke-width="1.2"/><rect x="94" y="38" width="52" height="1.8" fill="${luz}"/>` + raios(120, 41, ang, 34);
  } else if (tp === 'downlight' || tp === 'spot') {
    A = `<circle cx="40" cy="44" r="25" fill="${face}" stroke="${ln}" stroke-width="1.6"/><circle cx="40" cy="44" r="${tp === 'spot' ? 14 : 18}" fill="${luz}" stroke="${luzS}" stroke-width=".6"/>${tp === 'spot' ? `<circle cx="40" cy="44" r="6" fill="none" stroke="${luzS}" stroke-dasharray="2 1.5"/>` : ''}`;
    C = forro(40, 100, 140) + (tp === 'spot' ? `<path d="M106 40 V20 H134 V40" fill="${face}" stroke="${ln}" stroke-width="1.2"/><circle cx="120" cy="31" r="6" fill="${luz}" stroke="${luzS}"/><rect x="117" y="20" width="6" height="5" fill="${mut}"/>` : `<path d="M104 40 L108 22 H132 L136 40 Z" fill="${face}" stroke="${ln}" stroke-width="1.2"/><line x1="110" y1="26" x2="130" y2="26" stroke="${mut}" stroke-width=".6"/>`)
      + `<rect x="99" y="40" width="42" height="2.6" fill="${face}" stroke="${ln}" stroke-width="1"/><rect x="105" y="40.6" width="30" height="1.6" fill="${luz}"/>` + raios(120, 43, ang, 34);
  } else if (tp === 'plafonR' || tp === 'plafonQ') {
    A = tp === 'plafonR' ? `<circle cx="40" cy="44" r="26" fill="${face}" stroke="${ln}" stroke-width="1.6"/><circle cx="40" cy="44" r="22" fill="${luz}" stroke="${luzS}" stroke-width=".6"/>` : `<rect x="15" y="19" width="50" height="50" rx="4" fill="${face}" stroke="${ln}" stroke-width="1.6"/><rect x="19" y="23" width="42" height="42" rx="2" fill="${luz}" stroke="${luzS}" stroke-width=".6"/>`;
    C = forro(28) + `<rect x="94" y="28" width="52" height="7" rx="2.5" fill="${face}" stroke="${ln}" stroke-width="1.2"/><rect x="96" y="34" width="48" height="2" fill="${luz}"/>` + raios(120, 37, 55, 32);
  } else if (tp.startsWith('tubo-')) {
    const k = tp.slice(5), h = 10 + 6 * nL, y0 = 44 - h / 2;
    let tubos = ''; for (let i = 0; i < nL; i++) tubos += `<rect x="12" y="${(y0 + 4 + i * 6 + (6 - 3.6) / 2).toFixed(1)}" width="56" height="3.6" rx="1.8" fill="${luz}" stroke="${luzS}" stroke-width=".5"/>`;
    A = `<rect x="8" y="${y0}" width="64" height="${h}" rx="${k === 'hermetica' ? 6 : 1.5}" fill="${k === 'leitosa' ? leit : face}" stroke="${ln}" stroke-width="1.5"/>` + (k === 'leitosa' ? tubos.replace(new RegExp(`fill="${luz}"`, 'g'), 'fill="none"').replace(/stroke-width=".5"/g, 'stroke-width=".6" stroke-dasharray="2 1.5"') : tubos);
    if (k === 'aletada') for (let x = 14; x < 68; x += 6) A += `<line x1="${x}" y1="${y0 + 1}" x2="${x}" y2="${y0 + h - 1}" stroke="${ln}" stroke-width=".6"/>`;
    if (k === 'hermetica') A += `<rect x="6" y="${44 - 3}" width="4" height="6" fill="${mut}"/><rect x="70" y="${44 - 3}" width="4" height="6" fill="${mut}"/>`;
    const cx = nL === 1 ? [120] : Array.from({ length: nL }, (_, i) => 120 - 6 * (nL - 1) + 12 * i);
    const tc = y => cx.map(x => `<circle cx="${x}" cy="${y}" r="3.4" fill="${luz}" stroke="${luzS}" stroke-width=".6"/>`).join('');
    if (k === 'calha') C = forro(28) + `<path d="M98 28 V34 H142 V28" fill="${face}" stroke="${ln}" stroke-width="1.2"/>` + tc(38) + raios(120, 42, 65, 30);
    else if (k === 'aletada') { C = forro(28) + `<path d="M98 28 H142 L136 46 H104 Z" fill="${face}" stroke="${ln}" stroke-width="1.2"/><path d="M102 30 Q120 50 138 30" fill="none" stroke="${mut}" stroke-width=".7"/>` + tc(37); for (let x = 108; x <= 132; x += 6) C += `<line x1="${x}" y1="42" x2="${x}" y2="46" stroke="${ln}" stroke-width=".7"/>`; C += raios(120, 48, ang, 28); }
    else if (k === 'leitosa') C = forro(28) + `<rect x="98" y="28" width="44" height="10" fill="${face}" stroke="${ln}" stroke-width="1.2"/>` + tc(35) + `<path d="M98 38 Q120 52 142 38 Z" fill="${leit}" stroke="${ln}" stroke-width="1"/>` + raios(120, 46, 55, 26);
    else C = forro(28) + `<rect x="98" y="28" width="44" height="8" rx="2" fill="${face}" stroke="${ln}" stroke-width="1.2"/>` + tc(37) + `<path d="M98 36 Q120 54 142 36 Z" fill="${leit}" fill-opacity=".85" stroke="${ln}" stroke-width="1"/><text x="146" y="46" font-size="6" fill="${mut}" font-family="Arial">IP65</text>` + raios(120, 47, 55, 24);
  } else if (tp === 'plafonier') {
    A = `<circle cx="40" cy="44" r="24" fill="${leit}" stroke="${ln}" stroke-width="1.5"/><circle cx="40" cy="44" r="9" fill="${luz}" stroke="${luzS}" stroke-dasharray="2 1.5"/>`;
    C = forro(26) + `<rect x="108" y="26" width="24" height="4" fill="${face}" stroke="${ln}" stroke-width="1"/><path d="M100 30 A20 20 0 0 0 140 30 Z" fill="${leit}" stroke="${ln}" stroke-width="1.2"/><rect x="117" y="30" width="6" height="4" fill="${mut}"/><circle cx="120" cy="39" r="5" fill="${luz}" stroke="${luzS}"/>` + raios(120, 52, 60, 22);
  } else if (tp === 'pendente') {
    A = `<circle cx="40" cy="44" r="25" fill="${face}" stroke="${ln}" stroke-width="1.6"/><circle cx="40" cy="44" r="7" fill="${luz}" stroke="${luzS}"/><circle cx="40" cy="44" r="12" fill="none" stroke="${mut}" stroke-width=".6"/>`;
    C = forro(14) + `<rect x="114" y="14" width="12" height="3" fill="${face}" stroke="${ln}"/><line x1="120" y1="17" x2="120" y2="34" stroke="${ln}" stroke-width="1"/><path d="M110 34 H130 L144 54 H96 Z" fill="${face}" stroke="${ln}" stroke-width="1.2"/><circle cx="120" cy="50" r="5" fill="${luz}" stroke="${luzS}"/>` + raios(120, 55, 50, 24);
  } else if (tp === 'refletor') {
    rotA = 'Vista frontal'; rotC = 'Vista lateral';
    A = `<rect x="10" y="22" width="60" height="42" rx="4" fill="${face}" stroke="${ln}" stroke-width="1.6"/><rect x="15" y="27" width="50" height="32" rx="2" fill="${luz}" stroke="${luzS}" stroke-width=".6"/>` + [18, 26, 34, 42, 50, 58].map(x => `<line x1="${x}" y1="18" x2="${x}" y2="22" stroke="${ln}" stroke-width="1"/>`).join('') + `<path d="M24 64 V72 M56 64 V72 M24 72 H56" fill="none" stroke="${ln}" stroke-width="1.4"/>`;
    C = `<line x1="96" y1="76" x2="146" y2="76" stroke="${ln}" stroke-width="1.2"/><path d="M114 76 V58 M126 76 V58" stroke="${ln}" stroke-width="1.4"/><g transform="rotate(25 120 44)"><rect x="104" y="32" width="32" height="24" rx="2" fill="${face}" stroke="${ln}" stroke-width="1.2"/><rect x="104" y="53" width="32" height="3" fill="${luz}"/>${[108, 114, 120, 126, 132].map(x => `<line x1="${x}" y1="28" x2="${x}" y2="32" stroke="${ln}" stroke-width=".9"/>`).join('')}</g>` + `<line x1="112" y1="60" x2="100" y2="74" stroke="${luzS}" stroke-dasharray="2 2" stroke-width=".7"/><line x1="122" y1="62" x2="118" y2="74" stroke="${luzS}" stroke-dasharray="2 2" stroke-width=".7"/>`;
  } else if (tp === 'highbay') {
    A = `<circle cx="40" cy="44" r="28" fill="${face}" stroke="${ln}" stroke-width="1.6"/><circle cx="40" cy="44" r="16" fill="${luz}" stroke="${luzS}" stroke-width=".6"/>` + Array.from({ length: 24 }, (_, i) => { const t = i * Math.PI / 12; return `<line x1="${(40 + 18 * Math.cos(t)).toFixed(1)}" y1="${(44 + 18 * Math.sin(t)).toFixed(1)}" x2="${(40 + 27 * Math.cos(t)).toFixed(1)}" y2="${(44 + 27 * Math.sin(t)).toFixed(1)}" stroke="${ln}" stroke-width=".6"/>`; }).join('');
    C = forro(8) + `<line x1="120" y1="8" x2="120" y2="18" stroke="${ln}" stroke-width="1"/><circle cx="120" cy="20" r="2.5" fill="none" stroke="${ln}"/><path d="M102 30 H138 V38 H102 Z" fill="${face}" stroke="${ln}" stroke-width="1.2"/>` + Array.from({ length: 9 }, (_, i) => `<line x1="${104 + i * 4}" y1="23" x2="${104 + i * 4}" y2="30" stroke="${ln}" stroke-width=".9"/>`).join('') + `<path d="M106 38 H134 L130 42 H110 Z" fill="${luz}" stroke="${luzS}" stroke-width=".6"/>` + raios(120, 43, ang, 32);
  } else {
    A = `<rect x="14" y="28" width="52" height="32" rx="2" fill="${face}" stroke="${ln}" stroke-width="1.6"/><rect x="18" y="32" width="44" height="24" fill="${luz}" stroke="${luzS}" stroke-width=".6"/>`;
    C = forro(28) + `<rect x="96" y="28" width="48" height="9" fill="${face}" stroke="${ln}" stroke-width="1.2"/><rect x="98" y="36" width="44" height="1.6" fill="${luz}"/>` + raios(120, 39, ang, 30);
  }
  const dim = dimLum(r);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100" role="img" aria-label="Desenho da luminária: ${escH(NOME_DESENHO[tp] || 'luminária')}"><rect width="160" height="100" fill="${P.fill}"/><line x1="80" y1="8" x2="80" y2="88" stroke="${P.face}" stroke-width="1"/>${A}${C}`
    + `<text x="40" y="94" text-anchor="middle" font-size="6.5" fill="${mut}" font-family="Arial">${rotA}</text><text x="120" y="94" text-anchor="middle" font-size="6.5" fill="${mut}" font-family="Arial">${rotC}</text>`
    + (dim ? `<text x="40" y="85" text-anchor="middle" font-size="6.2" fill="${ln}" font-family="Arial">${escH(dim)}</text>` : '') + `<text x="120" y="85" text-anchor="middle" font-size="6.2" fill="${ln}" font-family="Arial">${escH(NOME_DESENHO[tp] || '')}</text></svg>`;
}

/* ---------- símbolo em planta (unidades em cm) ---------- */
function simboloPlanta(r, x, y, fs, C) {
  const tp = tipoDesenho(r), sw = (fs / 7).toFixed(2), f = v => v.toFixed(1);
  if (tp === 'painel') { const s = /62×62/.test(r.prod.mod || '') ? 62 : 60, h = s / 2; return `<rect x="${f(x - h)}" y="${f(y - h)}" width="${s}" height="${s}" fill="${C.face}" stroke="${C.ink}" stroke-width="${sw}"/><path d="M${f(x - h)} ${f(y - h)}L${f(x + h)} ${f(y + h)}M${f(x + h)} ${f(y - h)}L${f(x - h)} ${f(y + h)}" stroke="${C.ink}" stroke-width="${(fs / 12).toFixed(2)}"/>`; }
  if (tp.startsWith('tubo-')) { const len = compTubo(r) * 100 + 6, nL = Math.max(1, r.nLamp || 1), w = 8 + 7 * nL; let s = `<rect x="${f(x - len / 2)}" y="${f(y - w / 2)}" width="${f(len)}" height="${f(w)}" fill="${C.face}" stroke="${C.ink}" stroke-width="${sw}"/>`; for (let i = 0; i < nL; i++) { const yy = y - w / 2 + 4 + 7 * i + 3.5; s += `<line x1="${f(x - len / 2 + 4)}" y1="${f(yy)}" x2="${f(x + len / 2 - 4)}" y2="${f(yy)}" stroke="${C.ink}" stroke-width="${(fs / 12).toFixed(2)}"/>`; } return s; }
  if (tp === 'plafonQ') { const s = Math.max(30, fs * 1.4), h = s / 2; return `<rect x="${f(x - h)}" y="${f(y - h)}" width="${f(s)}" height="${f(s)}" fill="${C.face}" stroke="${C.ink}" stroke-width="${sw}"/><rect x="${f(x - h * 0.55)}" y="${f(y - h * 0.55)}" width="${f(s * 0.55)}" height="${f(s * 0.55)}" fill="none" stroke="${C.ink}" stroke-width="${(fs / 12).toFixed(2)}"/>`; }
  if (tp === 'refletor') { const w = Math.max(40, fs * 1.8), h = w * 0.6; return `<rect x="${f(x - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" fill="${C.face}" stroke="${C.ink}" stroke-width="${sw}"/><path d="M${f(x - w / 2 + 4)} ${f(y + h / 2 - 3)}H${f(x + w / 2 - 4)}" stroke="${C.ink}" stroke-width="${sw}"/>`; }
  if (tp === 'highbay') { const R = Math.max(25, fs * 1.1); let s = `<circle cx="${f(x)}" cy="${f(y)}" r="${f(R)}" fill="${C.face}" stroke="${C.ink}" stroke-width="${sw}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 0.55)}" fill="none" stroke="${C.ink}" stroke-width="${(fs / 12).toFixed(2)}"/>`; for (let i = 0; i < 8; i++) { const t = i * Math.PI / 4; s += `<line x1="${f(x + R * 0.62 * Math.cos(t))}" y1="${f(y + R * 0.62 * Math.sin(t))}" x2="${f(x + R * Math.cos(t))}" y2="${f(y + R * Math.sin(t))}" stroke="${C.ink}" stroke-width="${(fs / 14).toFixed(2)}"/>`; } return s; }
  if (tp === 'downlight' || tp === 'spot') { const R = Math.max(9, fs * 0.6); return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(R)}" fill="${C.face}" stroke="${C.ink}" stroke-width="${sw}"/><path d="M${f(x - R * 0.6)} ${f(y)}H${f(x + R * 0.6)}M${f(x)} ${f(y - R * 0.6)}V${f(y + R * 0.6)}" stroke="${C.ink}" stroke-width="${(fs / 12).toFixed(2)}"/>`; }
  const R = Math.max(14, fs * 0.8);
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(R)}" fill="${C.face}" stroke="${C.ink}" stroke-width="${sw}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 0.35)}" fill="${C.ink}"/>`;
}

/* ---------- mapa de iluminância (opcionalmente com valores) ---------- */
function plantaSVG(r, doc, opt = {}) {
  const S = 100, L = r.L * S, W = r.W * S, m = Math.max(L, W) * 0.09, fs = Math.max(L, W) / 26, C = coresPlanta(doc);
  const bx = Math.min(0.5, r.L / 4) * S, by = Math.min(0.5, r.W / 4) * S, dx = (L - 2 * bx) / (r.gx - 1), dy = (W - 2 * by) / (r.gy - 1);
  let cel = '', val = '';
  r.malha.forEach((lin, i) => lin.forEach((E, j) => { cel += `<rect x="${(bx + i * dx - dx / 2).toFixed(1)}" y="${(by + j * dy - dy / 2).toFixed(1)}" width="${(dx + 0.6).toFixed(1)}" height="${(dy + 0.6).toFixed(1)}" fill="${corE(E / r.Em)}"/>`; }));
  if (opt.valores) {
    const si = Math.max(1, Math.ceil(r.gx / 8)), sj = Math.max(1, Math.ceil(r.gy / 6)), fv = Math.min(dx * si, dy * sj) * 0.32;
    for (let i = 0; i < r.gx; i += si) for (let j = 0; j < r.gy; j += sj) val += `<text x="${(bx + i * dx).toFixed(1)}" y="${(by + j * dy + fv * 0.35).toFixed(1)}" text-anchor="middle" font-size="${fv.toFixed(1)}" font-family="Arial" font-weight="700" fill="#1b1f23" stroke="#ffffff" stroke-width="${(fv * 0.2).toFixed(1)}" paint-order="stroke">${Math.round(r.malha[i][j])}</text>`;
  }
  let lum = '';
  for (let a = 0; a < r.nx; a++) for (let b = 0; b < r.ny; b++) lum += simboloPlanta(r, (a + 0.5) * r.Sx * S, (b + 0.5) * r.Sy * S, fs, { ...C, face: opt.valores ? 'none' : C.face });
  const cota = `<text x="${L / 2}" y="${W + m * 0.72}" text-anchor="middle" font-size="${fs}" fill="${C.mut}" font-family="Arial">${nfmt(r.L, 2)} m</text><text x="${-m * 0.42}" y="${W / 2}" text-anchor="middle" font-size="${fs}" fill="${C.mut}" font-family="Arial" transform="rotate(-90 ${-m * 0.42} ${W / 2})">${nfmt(r.W, 2)} m</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(-m).toFixed(0)} ${(-m * 0.5).toFixed(0)} ${(L + 1.5 * m).toFixed(0)} ${(W + 1.5 * m).toFixed(0)}" role="img" aria-label="Mapa de iluminância do ambiente com ${r.N} luminárias">${cel}<rect x="0" y="0" width="${L}" height="${W}" fill="none" stroke="${C.ink}" stroke-width="${fs / 3}"/>${lum}${val}${cota}</svg>`;
}

/* ---------- planta de locação com cotas ---------- */
function locacaoSVG(r, ref, doc = true) {
  const C = coresPlanta(doc), S = 100, L = r.L * S, W = r.W * S, M = Math.max(L, W), fs = M / 32, e = Math.max(12, M * 0.02), F = v => v.toFixed(1);
  const xs = [0, ...Array.from({ length: r.nx }, (_, a) => (a + 0.5) * r.Sx * S), L], ys = [0, ...Array.from({ length: r.ny }, (_, b) => (b + 0.5) * r.Sy * S), W];
  const tk = fs * 0.35, txt = (x, y, t, o = {}) => `<text x="${F(x)}" y="${F(y)}" text-anchor="middle" font-size="${F(o.fs || fs * 0.95)}" fill="${o.cor || C.ink}" font-family="Arial"${o.rot ? ` transform="rotate(-90 ${F(x)} ${F(y)})"` : ''}>${t}</text>`;
  let s = `<rect x="${F(-e)}" y="${F(-e)}" width="${F(L + 2 * e)}" height="${F(W + 2 * e)}" fill="${C.parede}" stroke="${C.ink}" stroke-width="${F(fs / 10)}"/><rect x="0" y="0" width="${F(L)}" height="${F(W)}" fill="${C.face}" stroke="${C.ink}" stroke-width="${F(fs / 10)}"/>`;
  xs.slice(1, -1).forEach(x => { s += `<line x1="${F(x)}" y1="0" x2="${F(x)}" y2="${F(W)}" stroke="${C.mut}" stroke-width="${F(fs / 16)}" stroke-dasharray="${F(fs * 0.6)} ${F(fs * 0.3)}"/>`; });
  ys.slice(1, -1).forEach(y => { s += `<line x1="0" y1="${F(y)}" x2="${F(L)}" y2="${F(y)}" stroke="${C.mut}" stroke-width="${F(fs / 16)}" stroke-dasharray="${F(fs * 0.6)} ${F(fs * 0.3)}"/>`; });
  xs.slice(1, -1).forEach(x => ys.slice(1, -1).forEach(y => { s += simboloPlanta(r, x, y, fs, C); }));
  if (ref) s += txt(xs[1] + fs * 1.6, ys[1] - fs * 1.2, ref, { fs: fs * 0.7, cor: C.acc });
  // cadeias de cotas
  const cadeiaH = (y, pts, rotulos) => { let o = `<line x1="${F(pts[0])}" y1="${F(y)}" x2="${F(pts[pts.length - 1])}" y2="${F(y)}" stroke="${C.ink}" stroke-width="${F(fs / 14)}"/>`; pts.forEach(x => { o += `<path d="M${F(x - tk)} ${F(y + tk)}L${F(x + tk)} ${F(y - tk)}M${F(x)} ${F(y - tk * 1.6)}V${F(y + tk * 1.6)}" stroke="${C.ink}" stroke-width="${F(fs / 12)}"/>`; }); rotulos.forEach((t, i) => { const a = pts[i], b = pts[i + 1]; if (b - a >= fs * 2.8 || rotulos.length === 1) o += txt((a + b) / 2, y - fs * 0.45, t); }); return o; };
  const cadeiaV = (x, pts, rotulos) => { let o = `<line x1="${F(x)}" y1="${F(pts[0])}" x2="${F(x)}" y2="${F(pts[pts.length - 1])}" stroke="${C.ink}" stroke-width="${F(fs / 14)}"/>`; pts.forEach(y => { o += `<path d="M${F(x - tk)} ${F(y + tk)}L${F(x + tk)} ${F(y - tk)}M${F(x - tk * 1.6)} ${F(y)}H${F(x + tk * 1.6)}" stroke="${C.ink}" stroke-width="${F(fs / 12)}"/>`; }); rotulos.forEach((t, i) => { const a = pts[i], b = pts[i + 1]; if (b - a >= fs * 2.8 || rotulos.length === 1) o += txt(x - fs * 0.45, (a + b) / 2, t, { rot: true }); }); return o; };
  const seg = p => p.slice(1).map((v, i) => nfmt((v - p[i]) / S, 2));
  const y1 = -e - fs * 2.3, y2 = y1 - fs * 2.3, x1 = -e - fs * 2.3, x2 = x1 - fs * 2.3;
  s += cadeiaH(y1, xs, seg(xs)) + cadeiaH(y2, [0, L], [`${nfmt(r.L, 2)} m`]) + cadeiaV(x1, ys, seg(ys)) + cadeiaV(x2, [0, W], [`${nfmt(r.W, 2)} m`]);
  xs.forEach(x => { s += `<line x1="${F(x)}" y1="${F(-e - fs * 0.3)}" x2="${F(x)}" y2="${F(y1 - fs * 0.3)}" stroke="${C.mut}" stroke-width="${F(fs / 20)}"/>`; });
  ys.forEach(y => { s += `<line x1="${F(-e - fs * 0.3)}" y1="${F(y)}" x2="${F(x1 - fs * 0.3)}" y2="${F(y)}" stroke="${C.mut}" stroke-width="${F(fs / 20)}"/>`; });
  const vx = x2 - fs * 1.2, vy = y2 - fs * 1.2, vw = L + e + fs * 1.2 - vx, vh = W + e + fs * 1.2 - vy;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${F(vx)} ${F(vy)} ${F(vw)} ${F(vh)}" role="img" aria-label="Planta de locação com ${r.N} luminárias e cotas">${s}</svg>`;
}

/* ---------- tipos de luminária usados no projeto (L1, L2, …) ---------- */
function chaveLum(a, r) { const p = r.prod; if (a.prod === 'custom') return `custom|${p.W}|${p.lm}|${r.facho}`; return p.tipo === 'lampada' ? `${a.prod}|${corpoKey(r)}|${r.nLamp}` : a.prod; }
function refsLuminarias(proj, calc) {
  const out = {}, porAmb = {}; let n = 0;
  (proj.lumi || []).forEach(a => { const r = calc.lumi[a.id]; if (!r) return; const k = chaveLum(a, r); if (!out[k]) out[k] = { ref: `L${++n}`, r, qtd: 0, ambs: [], W: 0 }; out[k].qtd += r.N; out[k].W += r.P; out[k].ambs.push(a.nome); porAmb[a.id] = out[k].ref; });
  return { tipos: Object.values(out), porAmb };
}
const nomeLum = r => `${r.prod.fab !== '—' ? r.prod.fab + ' ' : ''}${r.prod.mod}${r.prod.tipo === 'lampada' ? ` em ${r.corpo.nome.split(' (')[0].toLowerCase()}, ${r.nLamp} lâmpada${r.nLamp > 1 ? 's' : ''}` : ''}`;

/* ---------- bloco de cálculo de um ambiente (memória e relatório) ---------- */
function memLumiAmbiente(B, a, r, proj, num, refs) {
  const p = r.prod, ref = refs ? refs.porAmb[a.id] : '';
  const f0 = v => nfmt(v, 0), f1 = v => nfmt(v, 1), f2 = v => nfmt(v, 2), f3 = v => nfmt(v, 3);
  B.push({ t: 'h2', text: `${num} ${a.nome} — ${r.req.n}` });
  B.push({ t: 'kv4', rows: [
    ['Dimensões', `${f2(r.L)} × ${f2(r.W)} m — ${f2(r.A)} m²`, 'Pé-direito', `${f2(+a.pd)} m`],
    ['Plano de trabalho', `${f2(+a.hwp)} m`, 'Suspensão', `${f2(+a.susp || 0)} m`],
    ['Refletâncias', `teto ${f0(a.rc * 100)} % · paredes ${f0(a.rw * 100)} % · piso ${f0(a.rf * 100)} %`, 'Requisito', `Em ${r.Em} lx · UGRL ${r.UGR ?? '—'} · Ra ≥ ${r.Ra}${r.tarefa ? ' · Uo ≥ 0,70' : ''}`],
    ['Luminária', `${ref ? ref + ' — ' : ''}${nomeLum(r)}`, 'Dados', `${f1(r.Wlum)} W · ${f0(r.phi)} lm · Ra ${p.Ra}${r.lor < 1 ? ` · LOR ${f2(r.lor)}` : ''}`]
  ] });
  B.push({ t: 'eq', lines: [
    `hm = pé-direito − suspensão − plano de trabalho = ${f2(+a.pd)} − ${f2(+a.susp || 0)} − ${f2(+a.hwp)} = ${f2(r.hm)} m`,
    `K = L × W / [hm × (L + W)] = ${f2(r.L)} × ${f2(r.W)} / [${f2(r.hm)} × (${f2(r.L)} + ${f2(r.W)})] = ${f2(r.K)}`,
    `UF = ${f3(r.UF)}   (${r.ufFonte}${r.ufFonte.startsWith('calc') ? `; facho ${f0(r.facho)}° → n = ${f2(r.n)}` : ''})`,
    `FM = ${f2(r.FM)}   (${r.fmFonte})`,
    `N = Em × A / (Φ × UF × FM) = ${r.Em} × ${f2(r.A)} / (${f0(r.phi)} × ${f3(r.UF)} × ${f2(r.FM)}) = ${f2(r.Nreq)}   →   adotado ${r.N} (${r.nx} × ${r.ny})`,
    `Eméd = N × Φ × UF × FM / A = ${r.N} × ${f0(r.phi)} × ${f3(r.UF)} × ${f2(r.FM)} / ${f2(r.A)} = ${f0(r.Emed)} lx`,
    `Ponto a ponto (${r.gx} × ${r.gy} pontos): Emín = ${f0(r.Emin)} lx; Eméd = ${f0(r.EmedPP)} lx; Emáx = ${f0(r.Emax)} lx; Uo = ${f2(r.Uo)}`,
    `P = ${r.N} × ${f1(r.Wlum)} = ${f0(r.P)} W;   ${f1(r.dens)} W/m²;   ${f2(r.dens100)} W/m² por 100 lx`] });
  const loc = locacaoSVG(r, ref, true), arL = Math.min(1.25, arDe(loc));
  B.push({ t: 'fig', svg: svgDoc(loc, 480, Math.round(480 * arL)), ar: arL, w: arL > 0.9 ? 74 : 96, caption: `Planta de locação: ${r.N} luminárias${ref ? ' ' + ref : ''} em malha de ${r.nx} × ${r.ny}, espaçamento ${f2(r.Sx)} × ${f2(r.Sy)} m e afastamento das paredes de ${f2(r.Sx / 2)} × ${f2(r.Sy / 2)} m (cotas em metros). Altura de montagem ${f2(r.hLum)} m.` });
  const mapa = plantaSVG(r, true, { valores: true }), arM = Math.min(1.25, arDe(mapa));
  B.push({ t: 'fig', svg: svgDoc(mapa, 480, Math.round(480 * arM)), ar: arM, w: arM > 0.9 ? 66 : 86, caption: `Iluminância mantida no plano de trabalho a ${f2(+a.hwp)} m (lx), cálculo ponto a ponto: Emín ${f0(r.Emin)} lx, Eméd ${f0(r.EmedPP)} lx, Emáx ${f0(r.Emax)} lx. Cores: azul ≤ 0,5 × Em; verde próximo de Em; vermelho ≥ 1,5 × Em.` });
  B.push({ t: 'ver', ok: r.okEm, text: `Eméd = ${f0(r.Emed)} lx ≥ Em = ${r.Em} lx` });
  if (r.tarefa) B.push({ t: 'ver', ok: r.okUo, text: `Uo = ${f2(r.Uo)} ≥ 0,70 (área da tarefa)` });
  B.push({ t: 'ver', ok: r.okRa, text: `Ra ${p.Ra} ≥ ${r.Ra}` });
  B.push({ t: 'ver', ok: r.FM >= 0.7 - 1e-9, text: `FM = ${f2(r.FM)} ≥ 0,70` });
  if (r.UGR != null) B.push(p.ugr != null ? { t: 'ver', ok: p.ugr <= r.UGR, text: `UGR da luminária ${p.ugr} ≤ UGRL ${r.UGR}` } : { t: 'note', text: `UGRL = ${r.UGR}: o índice de ofuscamento da instalação deve ser confirmado pela tabela UGR do fabricante (método tabular CIE 117).` });
  if (r.VAmin != null) B.push({ t: 'note', text: `Para comparação, a NBR 5410 (9.5.2.1.2), como alternativa para locais de habitação, prevê ao menos ${r.VAmin} VA de iluminação para ${f2(r.A)} m²; a carga obtida pela luminotécnica é ${f0(r.VA)} VA.` });
  r.falhas.concat(r.avisos).forEach(x => B.push({ t: 'note', text: x }));
  if (a.obs) B.push({ t: 'note', text: a.obs });
}

/* ---------- relatório de cálculo luminotécnico ---------- */
function construirRelatorioLumi(proj, calc) {
  const I = proj.info, A = proj.lumi || [], R = calc.lumi || {}, X = proj.lumiExt || [], RX = calc.lumiExt || calcLumiExt(proj), B = [];
  const f0 = v => nfmt(v, 0), f1 = v => nfmt(v, 1), f2 = v => nfmt(v, 2);
  const refs = refsLuminarias(proj, calc);
  const partesTit = [A.length ? `${A.length} ambiente${A.length === 1 ? '' : 's'} interno${A.length === 1 ? '' : 's'}` : '', X.length ? `${X.length} área${X.length === 1 ? '' : 's'} externa${X.length === 1 ? '' : 's'}` : ''].filter(Boolean).join(' e ');
  B.push({ t: 'title', kicker: [A.length ? 'ABNT NBR ISO/CIE 8995-1:2013 — Interiores' : '', X.length ? 'NBR 5101 · EN 12464-2 — Exteriores' : ''].filter(Boolean).join(' · ') || 'ABNT NBR ISO/CIE 8995-1:2013', text: 'Relatório de cálculo luminotécnico', sub: `Iluminação de ${partesTit || 'ambientes'} — método dos lúmens com verificação ponto a ponto` });
  B.push({ t: 'meta', rows: [
    ['Obra', I.obra || '—'], ['Proprietário / cliente', I.cliente || '—'],
    ['Endereço', [I.endereco, I.cidade].filter(Boolean).join(' — ') || '—'],
    ['Responsável técnico', [I.responsavel, I.registro].filter(Boolean).join(' — ') || '—'],
    ['ART / TRT / RRT', I.art || '—'], ['Data / revisão', `${dataCurta(I.data) || '—'} — ${I.revisao || 'R00'}`]
  ] });
  let n = 0; const sec = t => { n++; B.push({ t: 'h1', text: `${n}. ${t}` }); return n; };
  sec('Objetivo');
  if (!A.length && !X.length) { B.push({ t: 'p', text: 'Nenhum ambiente foi cadastrado na aba Luminotécnica.' }); return B; }
  if (A.length) B.push({ t: 'p', text: `Este relatório apresenta o cálculo da iluminação geral dos ${A.length} ambientes internos da obra acima identificada: quantidade e disposição das luminárias, iluminância média mantida, uniformidade, potência instalada e verificação dos requisitos da ABNT NBR ISO/CIE 8995-1:2013 (iluminância mantida, uniformidade, reprodução de cor e limite de ofuscamento). As plantas indicam a locação das luminárias com cotas e a distribuição de iluminância no plano de trabalho.` });
  if (X.length) B.push({ t: 'p', text: `${A.length ? 'Apresenta também' : 'Este relatório apresenta'} a iluminação de ${X.length} área${X.length === 1 ? '' : 's'} externa${X.length === 1 ? '' : 's'} (pátios, estacionamentos, vias internas ou quadras) com projetores ou luminárias em postes: número de projetores pelo método dos lúmens e verificação da iluminância média e da uniformidade pelo método ponto a ponto, segundo os níveis da ABNT NBR 5101 e da EN 12464-2.` });
  sec('Normas e documentos de referência');
  B.push({ t: 'list', items: [
    'ABNT NBR ISO/CIE 8995-1:2013 — Iluminação de ambientes de trabalho — Parte 1: Interior.',
    'CIE 97:2005 — Maintenance of indoor electric lighting systems (fator de manutenção).',
    'CIE 117:1995 — Discomfort glare in interior lighting (índice UGR).',
    'ABNT NBR 5410:2004 Versão Corrigida:2008 — Instalações elétricas de baixa tensão (9.5.2 — previsão de cargas de iluminação).',
    ...(X.length ? ['ABNT NBR 5101 — Iluminação pública e viária (classes de iluminação; valores por iluminância da edição 2018).', 'EN 12464-2:2024 / CIE S 015 — Iluminação de locais de trabalho externos.', 'EN 12193 — Iluminação de instalações esportivas (quando aplicável).', 'MAMEDE FILHO, J. Instalações Elétricas Industriais. Rio de Janeiro: LTC — iluminação de exteriores (métodos dos lúmens e ponto a ponto).'] : []),
    'Catálogos e fichas técnicas dos fabricantes das luminárias e lâmpadas indicadas.'
  ] });
  const sM = sec('Metodologia e premissas');
  if (A.length) {
  B.push({ t: 'eq', lines: ['hm = pé-direito − suspensão − altura do plano de trabalho', 'K = L × W / [hm × (L + W)]          (índice do local)', 'N = Em × A / (Φ × UF × FM)          Eméd = N × Φ × UF × FM / A', 'FM = LLMF × LSF × LMF × RSMF (CIE 97)          Uo = Emín / Eméd', 'E(P) = Σ I(θ) × cos θ / d² + E refletida;   I(θ) = I0 × cosⁿθ'] });
  B.push({ t: 'list', items: [
    'Iluminância mantida (Em) no plano de trabalho conforme a seção 5 da NBR ISO/CIE 8995-1 para o tipo de ambiente, tarefa ou atividade, ou o valor indicado pelo projetista.',
    'Uniformidade Emín/Eméd ≥ 0,7 na área da tarefa; verificação ponto a ponto em malha no plano de trabalho, excluída uma faixa de até 0,5 m junto às paredes.',
    'Fator de utilização (UF) calculado pelo método da radiosidade em três superfícies (plano de trabalho, paredes e teto), com distribuição de intensidade cosⁿθ obtida da abertura do facho, ou informado pela tabela do fabricante. Trata-se de estimativa: para a emissão final, confirmar com a fotometria (arquivo IES ou LDT) do produto especificado.',
    'Fator de manutenção não inferior a 0,70 (NBR ISO/CIE 8995-1, anexo D), adotado ou calculado pela CIE 97.',
    'Luminárias em malha regular, com espaçamento S entre centros e afastamento S/2 das paredes.',
    'O índice de ofuscamento unificado (UGR) depende da fotometria e não é calculado neste relatório; deve ser confirmado pela tabela UGR do fabricante.'
  ] });
  }
  if (X.length) {
    if (A.length) B.push({ t: 'h3', text: `${sM}.1 Iluminação de exteriores` });
    B.push({ t: 'eq', lines: ['Método dos lúmens (fluxo):  N = Eméd × S / (Φ × Fu × Fd)          Eméd = N × Φ × Fu × Fd / S', 'Método ponto a ponto:  E(P) = Σ I(θ) × cos γ / d² = Σ I(θ) × h / d³;   I(θ) = I0 × cosᵐθ;   I0 = Φ × (m + 1) / 2π', 'm = ln 0,5 / ln cos(β/2)   (β = abertura do facho);   θ = ângulo entre o raio e o eixo de mira do projetor', 'U0 = Emín / Eméd;   Fu efetivo = Eméd,pp × S / (N × Φ × Fd);   malha de cálculo com passo p = 0,2 × 5^log₁₀(d)'] });
    B.push({ t: 'list', items: [
      'Níveis de iluminância média e uniformidade (Emín/Eméd) conforme a ABNT NBR 5101 para vias públicas e a EN 12464-2 para locais de trabalho e estacionamentos externos, ou o valor indicado pelo projetista.',
      'O número de projetores é obtido pelo método dos lúmens com o fator de utilização Fu (parcela do fluxo que atinge a área) e o fator de depreciação Fd; a distribuição é verificada pelo método ponto a ponto, considerando a inclinação e a direção de mira de cada projetor.',
      'Distribuição de intensidade simétrica em torno do eixo de mira, obtida da abertura do facho. Para luminárias viárias assimétricas e projetos executivos, confirmar com a fotometria do fabricante (arquivo IES ou LDT) em software de cálculo.'
    ] });
  }
  if (A.length) {
  sec('Luminárias adotadas');
  B.push({ t: 'table', small: true, head: ['Ref.', 'Fabricante', 'Produto', 'P (W)', 'Fluxo (lm)', 'lm/W', 'Ra', 'Qtd.', 'P total (W)'], widths: [6, 12, 40, 7, 9, 7, 5, 6, 8], align: 'lllrrrrrr',
    rows: refs.tipos.map(t => [t.ref, t.r.prod.fab, nomeLum(t.r).replace(t.r.prod.fab + ' ', ''), f1(t.r.Wlum), f0(t.r.phi), f0(t.r.phi / (t.r.Wlum || 1)), String(t.r.prod.Ra), String(t.qtd), f0(t.W)])
      .concat([['Total', '', '', '', '', '', '', String(refs.tipos.reduce((s, t) => s + t.qtd, 0)), f0(refs.tipos.reduce((s, t) => s + t.W, 0))]]), lastBold: true });
  B.push({ t: 'figs', itens: refs.tipos.map(t => ({ svg: svgDoc(desenhoLuminaria(t.r, PAL_DOC)), caption: `${t.ref} — ${nomeLum(t.r)}`, sub: `${f1(t.r.Wlum)} W · ${f0(t.r.phi)} lm · Ra ${t.r.prod.Ra}${dimLum(t.r) ? ' · ' + dimLum(t.r) : ''}${t.r.prod.fonte ? ` · fonte: ${t.r.prod.fonte}` : ''}`, circs: `${t.qtd} unid. — ${t.ambs.join(', ')}`, rot: 'Quantidade: ' })) });
  B.push({ t: 'note', text: 'Desenhos esquemáticos, sem escala, para identificação do tipo de luminária. Dimensões, fotometria e acessórios devem ser confirmados na ficha técnica do produto especificado.' });
  sec('Resumo dos resultados');
  B.push({ t: 'table', small: true, head: ['Ambiente', 'Área (m²)', 'Em (lx)', 'Ref.', 'N', 'Arranjo', 'Eméd (lx)', 'Uo', 'P (W)', 'W/m²', 'Situação'], widths: [22, 8, 7, 6, 5, 8, 8, 6, 7, 7, 16], align: 'lrrlrcrrrrl',
    rows: A.map(a => { const r = R[a.id]; return [a.nome, f2(r.A), String(r.Em), refs.porAmb[a.id], String(r.N), `${r.nx} × ${r.ny}`, f0(r.Emed), f2(r.Uo), f0(r.P), f1(r.dens), statusTxt(r.status)]; })
      .concat([['Total', f2(A.reduce((s, a) => s + R[a.id].A, 0)), '', '', String(A.reduce((s, a) => s + R[a.id].N, 0)), '', '', '', f0(A.reduce((s, a) => s + R[a.id].P, 0)), '', '']]), lastBold: true });
  const sA = sec('Cálculo por ambiente');
  A.forEach((a, i) => memLumiAmbiente(B, a, R[a.id], proj, `${sA}.${i + 1}`, refs));
  }
  if (X.length) {
    const sX = sec('Iluminação de exteriores');
    B.push({ t: 'table', small: true, head: ['Área', 'S (m²)', 'Exigido', 'Projetor', 'N', 'h (m)', 'Eméd (lx)', 'U0', 'P (W)', 'Situação'], widths: [18, 7, 12, 19, 4, 6, 8, 6, 7, 13], align: 'lrllrrrrrl',
      rows: X.map(a => { const r = RX[a.id]; return [a.nome, f0(r.A), `${f0(r.Em)} lx / ${f2(r.U0req)}`, r.prod.nome, String(r.N), f1(r.h), f0(r.EmedPP), f2(r.U0), f0(r.P), statusTxt(r.status)]; }) });
    X.forEach((a, i) => memLumiExt(B, a, RX[a.id], `${sX}.${i + 1}`));
  }
  sec('Potência de iluminação por circuito');
  const RR = { ...R, ...RX }, grupos = {}; [...A, ...X].forEach(a => { const k = a.circuito && proj.circuitos.some(c => c.id === a.circuito) ? a.circuito : ''; (grupos[k] = grupos[k] || []).push(a); });
  B.push({ t: 'table', small: true, head: ['Circuito', 'Ambientes', 'Luminárias', 'P (W)', 'Uso no dimensionamento do circuito'], widths: [22, 30, 12, 9, 27], align: 'llrrl',
    rows: Object.entries(grupos).map(([k, as]) => { const c = proj.circuitos.find(x => x.id === k), rc = c ? calc.res[c.id] : null; const P = as.reduce((s, a) => s + RR[a.id].P, 0); return [c ? `${c.num} — ${c.desc || 'Iluminação'}` : 'Sem circuito associado', as.map(a => a.nome).join(', '), String(as.reduce((s, a) => s + RR[a.id].N, 0)), f0(P), c ? (c.potLumi ? `potência adotada no circuito (${f0(rc.S)} VA, FP ${f2(rc.fp)})` : `circuito com ${f0(rc.S)} VA informados pelo projetista`) : '—']; }) });
  sec('Conclusão');
  const todos = [...A, ...X], fal = todos.filter(a => RR[a.id].status === 'fail'), obs = todos.filter(a => RR[a.id].status === 'warn');
  if (!fal.length) B.push({ t: 'p', text: `Os ${todos.length} ${A.length && X.length ? 'ambientes e áreas externas' : (X.length ? 'áreas externas' : 'ambientes')} calculados atendem aos níveis de iluminância exigidos com as luminárias e o arranjo indicados.${obs.length ? ` ${obs.map(a => a.nome).join(', ')} possuem observações (uniformidade, ofuscamento, fator de manutenção ou mira) a confirmar com a fotometria do produto.` : ''}` });
  else { B.push({ t: 'p', text: `${todos.length - fal.length} de ${todos.length} ambientes atendem aos requisitos. Pendências:` }); B.push({ t: 'list', items: fal.map(a => `${a.nome} — ${RR[a.id].falhas.join(' ')}`) }); }
  B.push({ t: 'p', text: 'Após a instalação, recomenda-se medir a iluminância no plano de trabalho em malha de pontos, com luxímetro calibrado, para confirmar os valores calculados, e manter o plano de manutenção (limpeza e substituição) adotado no fator de manutenção.' });
  B.push({ t: 'sign', place: [I.cidade, dataExtenso(I.data)].filter(Boolean).join(', '), name: I.responsavel || 'Responsável técnico', reg: I.registro || '' });
  return B;
}

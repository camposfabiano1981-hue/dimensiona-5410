/* ================================================================
   ESQUEMAS ILUSTRATIVOS — TABELA 33 (desenhos próprios, esquemáticos)
   pictograma(id, paleta) → SVG 160 × 100
   ================================================================ */
const PAL_UI = { ln: 'var(--ink)', mut: 'var(--muted)', face: 'var(--sunk)', fill: 'var(--sheet)', cu: 'var(--copper)', capa: 'var(--c-capa)', acc: 'var(--accent)' };
const PAL_DOC = { ln: '#1b1f23', mut: '#6a737b', face: '#eef2f4', fill: '#ffffff', cu: '#b5652c', capa: '#8a949b', acc: '#0b5a70' };
let _pid = 0;
function pictograma(id, P = PAL_UI) {
  const m = MET[id]; if (!m) return '';
  const u = 'pg' + (++_pid);
  const sw = (w = 1) => `stroke="${P.ln}" stroke-width="${w}"`;
  const T = (x, y, s, a = 'middle') => `<text x="${x}" y="${y}" font-size="7" font-family="Arial, Helvetica, sans-serif" fill="${P.mut}" text-anchor="${a}">${s}</text>`;
  const iso = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.fill}" ${sw(0.8)}/><circle cx="${x}" cy="${y}" r="${(r * 0.5).toFixed(2)}" fill="${P.cu}"/>`;
  const uni = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.capa}" ${sw(0.8)}/><circle cx="${x}" cy="${y}" r="${(r * 0.7).toFixed(2)}" fill="${P.fill}"/><circle cx="${x}" cy="${y}" r="${(r * 0.4).toFixed(2)}" fill="${P.cu}"/>`;
  const nu = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.cu}" ${sw(0.6)}/>`;
  const multi = (x, y, R) => { let s = `<circle cx="${x}" cy="${y}" r="${R}" fill="${P.capa}" ${sw(0.9)}/>`; for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 3, cx = x + R * 0.42 * Math.cos(a), cy = y + R * 0.42 * Math.sin(a); s += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(R * 0.36).toFixed(2)}" fill="${P.fill}" ${sw(0.5)}/><circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(R * 0.18).toFixed(2)}" fill="${P.cu}"/>`; } return s; };
  const trio = (x, y, r, f) => f(x - r, y + r * 0.577, r) + f(x + r, y + r * 0.577, r) + f(x, y - r * 1.155, r);
  const fio = m.tipos.includes('isolado') ? iso : uni;
  const conteudo = (x, y, esc = 1, tipo = m.cont) => {
    if (tipo === 'multi') return multi(x, y, 8 * esc);
    if (tipo === 'nus') return nu(x, y, 3.5 * esc);
    if (tipo === 'cabos') return multi(x - 13 * esc, y, 8 * esc) + trio(x + 11 * esc, y + 1.5 * esc, 4.2 * esc, uni);
    return trio(x, y + 1, 3.6 * esc, fio);
  };
  const tubo = (x, y, R, tipo = m.cont) => `<circle cx="${x}" cy="${y}" r="${R}" fill="${P.fill}" ${sw(1.4)}/>` + conteudo(x, y, tipo === 'multi' ? 0.95 : 1, tipo);
  const tuboRet = (x, y, w, h) => `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="2" fill="${P.fill}" ${sw(1.4)}/>` + conteudo(x, y, m.cont === 'multi' ? 0.95 : 1);
  const paredeE = (x2 = 28) => `<rect x="8" y="6" width="${x2 - 8}" height="88" fill="url(#${u}h)"/><line x1="${x2}" y1="6" x2="${x2}" y2="94" ${sw(1.6)}/>`;
  const teto = (y2 = 22) => `<rect x="8" y="6" width="144" height="${y2 - 6}" fill="url(#${u}h)"/><line x1="8" y1="${y2}" x2="152" y2="${y2}" ${sw(1.6)}/>`;
  const seta = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${P.mut}" stroke-width="0.7" marker-start="url(#${u}a)" marker-end="url(#${u}a)"/>`;
  let b = '';
  switch (m.cena) {
    case 'isolante':
      b = `<rect x="46" y="6" width="5" height="88" fill="${P.mut}"/><rect x="51" y="6" width="51" height="88" fill="url(#${u}i)"/><rect x="102" y="6" width="7" height="88" fill="url(#${u}h)" ${sw(0.8)}/>`
        + (m.tubo ? tubo(88, 50, 12) : conteudo(90, 50, 1.05))
        + T(76, 99, 'parede termicamente isolante') + T(134, 50, 'interior');
      break;
    case 'alvenaria':
      b = `<rect x="34" y="6" width="84" height="88" fill="url(#${u}b)"/><line x1="34" y1="6" x2="34" y2="94" ${sw(1.2)}/><line x1="118" y1="6" x2="118" y2="94" ${sw(1.6)}/>`;
      if (m.tubo === 'circ') b += tubo(100, 50, 12);
      else if (m.tubo === 'rect') b += tuboRet(97, 50, 28, 24);
      else { b += conteudo(97, 50, 0.85); if (m.protecao) b += `<rect x="113" y="34" width="3" height="32" fill="${P.ln}"/>` + T(140, 30, 'proteção') + `<line x1="128" y1="32" x2="116" y2="40" stroke="${P.mut}" stroke-width="0.6"/>`; }
      b += T(76, 99, 'alvenaria');
      break;
    case 'parede':
      b = paredeE();
      if (m.tubo === 'circ') b += tubo(42, 50, 14);
      else if (m.tubo === 'rect') b += tuboRet(46, 50, 36, 26);
      else b += conteudo(54, 50, 1.05);
      break;
    case 'afastado':
      b = paredeE() + `<line x1="28" y1="72" x2="96" y2="72" ${sw(2)}/><line x1="28" y1="64" x2="40" y2="72" ${sw(1)}/>` + conteudo(80, 56, 1.05) + seta(29, 84, 66, 84) + T(48, 94, '≥ 0,3 De');
      break;
    case 'teto':
      b = teto() + multi(56, 30.5, 8) + uni(92, 26.6, 4.2) + uni(100.4, 26.6, 4.2) + uni(96.2, 33.9, 4.2) + T(80, 94, 'fixado diretamente no teto');
      break;
    case 'tetoAfastado':
      b = teto() + `<line x1="56" y1="22" x2="56" y2="40" ${sw(1)}/><line x1="96" y1="22" x2="96" y2="40" ${sw(1)}/>` + multi(56, 48, 8) + trio(96, 48, 4.2, uni) + seta(122, 23, 122, 39) + T(140, 34, '> 0,3 De');
      break;
    case 'bandeja':
    case 'bandejaPerf':
      b = `<path d="M26 54 V76 H134 V54" fill="none" ${sw(2)}${m.cena === 'bandejaPerf' ? ` stroke-dasharray="9 4"` : ''}/>` + conteudo(80, 66, 1.05) + T(80, 92, m.cena === 'bandejaPerf' ? 'bandeja perfurada' : 'bandeja não perfurada ou prateleira');
      break;
    case 'tela':
      b = `<line x1="26" y1="50" x2="26" y2="80" ${sw(1.6)}/><line x1="134" y1="50" x2="134" y2="80" ${sw(1.6)}/><path d="M26 76 ${Array.from({ length: 18 }, (_, i) => `L${32 + i * 6} ${i % 2 ? 76 : 72}`).join(' ')} L134 76" fill="none" ${sw(1)}/>` + conteudo(80, 62, 1.05) + T(80, 92, 'suporte, eletrocalha aramada ou tela');
      break;
    case 'leito':
      b = `<rect x="24" y="46" width="5" height="36" fill="${P.ln}"/><rect x="131" y="46" width="5" height="36" fill="${P.ln}"/><line x1="29" y1="77" x2="131" y2="77" ${sw(3)}/>` + conteudo(80, 66, 1.05) + T(80, 94, 'leito');
      break;
    case 'suspenso':
      b = `<path d="M10 22 Q80 34 150 22" fill="none" ${sw(1.4)}/><line x1="60" y1="27.5" x2="60" y2="42" ${sw(0.8)}/><line x1="100" y1="27.5" x2="100" y2="42" ${sw(0.8)}/>` + conteudo(80, 52, 1.05) + T(80, 14, 'cabo de suporte');
      break;
    case 'isoladores':
      b = `<rect x="18" y="74" width="124" height="7" fill="${P.face}" ${sw(1)}/>` + [44, 80, 116].map(x => `<rect x="${x - 2}" y="62" width="4" height="12" fill="${P.ln}"/><path d="M${x - 9} 63 Q${x} 50 ${x + 9} 63 Z" fill="${P.face}" ${sw(1)}/>` + nu(x, 52, 4)).join('') + T(80, 94, 'condutores sobre isoladores');
      break;
    case 'espaco':
      b = `<rect x="14" y="6" width="22" height="88" fill="url(#${u}h)"/><line x1="36" y1="6" x2="36" y2="94" ${sw(1.6)}/><rect x="124" y="6" width="22" height="88" fill="url(#${u}h)"/><line x1="124" y1="6" x2="124" y2="94" ${sw(1.6)}/>`
        + (m.tubo === 'circ' ? tubo(80, 46, 14) : m.tubo === 'rect' ? tuboRet(80, 46, 36, 26) : conteudo(80, 46, 1.05)) + seta(37, 80, 123, 80) + T(80, 90, 'V — espaço de construção');
      break;
    case 'forro':
      b = teto(20) + `<line x1="20" y1="20" x2="20" y2="70" ${sw(0.8)}/><line x1="140" y1="20" x2="140" y2="70" ${sw(0.8)}/><rect x="8" y="70" width="144" height="4" fill="${P.face}" ${sw(1)}/>` + conteudo(78, 61, 1.05) + seta(148, 21, 148, 69) + T(80, 88, 'forro falso ou piso elevado') + T(143, 48, 'V', 'end');
      break;
    case 'calhaH':
      b = paredeE() + `<rect x="28" y="34" width="44" height="32" fill="${P.fill}" ${sw(1.4)}/><line x1="72" y1="32" x2="72" y2="68" ${sw(3)}/>` + conteudo(50, 50) + seta(92, 50, 140, 50) + T(116, 62, 'horizontal');
      break;
    case 'calhaV':
      b = `<rect x="8" y="6" width="144" height="88" fill="${P.face}"/><rect x="58" y="8" width="30" height="84" fill="${P.fill}" ${sw(1.4)}/>`
        + (m.cont === 'multi' ? `<line x1="73" y1="10" x2="73" y2="90" stroke="${P.capa}" stroke-width="9"/>` : [66, 73, 80].map(x => `<line x1="${x}" y1="10" x2="${x}" y2="90" stroke="${P.ln}" stroke-width="3.4"/><line x1="${x}" y1="10" x2="${x}" y2="90" stroke="${P.cu}" stroke-width="1.2"/>`).join(''))
        + seta(112, 18, 112, 82) + T(132, 54, 'vertical') + T(30, 54, 'parede');
      break;
    case 'piso':
    case 'pisoVent':
      b = `<rect x="8" y="50" width="144" height="44" fill="url(#${u}s)"/><line x1="8" y1="50" x2="152" y2="50" ${sw(1.4)}/><rect x="52" y="50" width="56" height="32" fill="${P.fill}" ${sw(1.2)}/>`
        + (m.cena === 'pisoVent' ? [52, 64, 76, 88, 100].map(x => `<rect x="${x}" y="46" width="8" height="4" fill="${P.ln}"/>`).join('') : `<rect x="49" y="46" width="62" height="4" fill="${P.ln}"/>`)
        + (m.tubo === 'circ' ? tubo(80, 66, 13) : conteudo(80, 67, 0.95)) + T(80, 40, m.cena === 'pisoVent' ? 'canaleta ventilada no piso' : 'canaleta fechada no piso');
      break;
    case 'calhaSusp':
      b = teto(18) + `<line x1="54" y1="18" x2="54" y2="46" ${sw(1)}/><line x1="106" y1="18" x2="106" y2="46" ${sw(1)}/><rect x="42" y="46" width="76" height="30" fill="${P.fill}" ${sw(1.4)}/><line x1="40" y1="46" x2="120" y2="46" ${sw(3)}/>` + conteudo(80, 62) + T(80, 92, 'eletrocalha ou perfilado suspenso');
      break;
    case 'solo':
      b = `<rect x="8" y="22" width="144" height="72" fill="url(#${u}s)"/><line x1="8" y1="22" x2="152" y2="22" ${sw(1.4)}/>` + Array.from({ length: 12 }, (_, i) => `<line x1="${14 + i * 12}" y1="22" x2="${17 + i * 12}" y2="17" stroke="${P.mut}" stroke-width="0.8"/>`).join('')
        + (m.tubo ? tubo(78, 64, 13) : `<rect x="54" y="47" width="48" height="4" fill="${P.ln}"/>` + conteudo(78, 66, 1)) + seta(124, 23, 124, 63) + T(130, 46, '0,7 m', 'start');
      break;
    case 'moldura':
      b = paredeE() + `<rect x="28" y="38" width="36" height="24" rx="2" fill="${P.face}" ${sw(1.3)}/><rect x="32" y="42" width="13" height="16" fill="${P.fill}" ${sw(0.7)}/><rect x="47" y="42" width="13" height="16" fill="${P.fill}" ${sw(0.7)}/>` + fio(38.5, 50, 3.6) + fio(53.5, 50, 3.6) + T(98, 52, 'moldura', 'start');
      break;
    case 'rodape':
      b = paredeE() + `<rect x="28" y="80" width="124" height="14" fill="url(#${u}h)"/><line x1="28" y1="80" x2="152" y2="80" ${sw(1.6)}/><rect x="28" y="48" width="54" height="32" fill="${P.fill}" ${sw(1.4)}/><line x1="46" y1="48" x2="46" y2="80" ${sw(1)}/><line x1="64" y1="48" x2="64" y2="80" ${sw(1)}/>`
        + (m.cont === 'multi' ? multi(55, 64, 7) : fio(37, 64, 4) + fio(55, 64, 4) + fio(73, 64, 4)) + T(90, 44, 'canaleta com separações', 'start');
      break;
    case 'porta':
    case 'janela':
      b = paredeE(30) + `<path d="M30 30 H74 V44 H64 V56 H74 V70 H30 Z" fill="${P.face}" ${sw(1.4)}/>` + tubo(46, 50, 10, 'trio')
        + (m.cena === 'janela' ? `<line x1="74" y1="47" x2="150" y2="47" ${sw(1)}/><line x1="74" y1="53" x2="150" y2="53" ${sw(1)}/>` + T(112, 66, 'caixilho de janela') : T(112, 54, 'caixilho de porta'));
      break;
    case 'canaletaParede':
      b = `<rect x="34" y="6" width="84" height="88" fill="url(#${u}b)"/><line x1="118" y1="6" x2="118" y2="94" ${sw(1.6)}/><rect x="88" y="34" width="30" height="32" fill="${P.fill}" ${sw(1.2)}/><line x1="119" y1="32" x2="119" y2="68" ${sw(3)}/>` + conteudo(103, 50, 0.95) + T(76, 99, 'canaleta embutida em parede');
      break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100" role="img" aria-label="Esquema ilustrativo da maneira de instalar nº ${m.id}"><defs>`
    + `<pattern id="${u}h" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="${P.face}"/><line x1="0" y1="0" x2="0" y2="5" stroke="${P.mut}" stroke-width="0.9"/></pattern>`
    + `<pattern id="${u}b" width="14" height="7" patternUnits="userSpaceOnUse"><rect width="14" height="7" fill="${P.face}"/><path d="M0 0.25H14M0 3.5H14M3.5 0V3.5M10.5 3.5V7" stroke="${P.mut}" stroke-width="0.5" fill="none"/></pattern>`
    + `<pattern id="${u}i" width="8" height="5" patternUnits="userSpaceOnUse"><rect width="8" height="5" fill="${P.fill}"/><path d="M0 2.5 Q2 0 4 2.5 T8 2.5" stroke="${P.mut}" stroke-width="0.6" fill="none"/></pattern>`
    + `<pattern id="${u}s" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="${P.face}"/><circle cx="1.5" cy="1.5" r="0.7" fill="${P.mut}"/><circle cx="5" cy="4.5" r="0.55" fill="${P.mut}"/></pattern>`
    + `<marker id="${u}a" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L6 3 L0 6 Z" fill="${P.mut}"/></marker>`
    + `</defs><rect width="160" height="100" fill="${P.fill}"/>${b}</svg>`;
}

/* cores literais para figuras do documento (as variáveis CSS não existem fora da página) */
const COR_DOC = { '--ink': '#1b1f23', '--muted': '#6a737b', '--sunk': '#eef2f4', '--sheet': '#ffffff', '--line-strong': '#97a6b1', '--line': '#cbd4da', '--copper': '#b5652c', '--c-fase-a': '#232323', '--c-fase-b': '#c62828', '--c-fase-c': '#f3f3f1', '--c-neutro': '#5fa8e6', '--c-pe': '#2e9d4f', '--c-pe2': '#f2c500', '--c-capa': '#6e7880', '--accent': '#0b5a70' };
function svgDoc(svg, w, h) {
  let s = svg.replace(/var\((--[a-z0-9-]+)\)/g, (m, k) => COR_DOC[k] || '#888888');
  if (!/xmlns=/.test(s)) s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  if (w && h) s = s.replace('<svg', `<svg width="${w}" height="${h}"`);
  return s;
}

/* rasteriza o SVG para PNG (memória em PDF e Word) */
const _pngCache = {};
function svgParaPNG(svg, w = 480, h = 300) {
  if (_pngCache[svg]) return _pngCache[svg];
  return _pngCache[svg] = new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { try { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(img, 0, 0, w, h); res(cv.toDataURL('image/png')); } catch (e) { rej(e); } };
    img.onerror = () => rej(new Error('Falha ao gerar a imagem do esquema da Tabela 33.'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

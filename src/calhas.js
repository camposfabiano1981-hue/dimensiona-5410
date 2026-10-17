/* ================================================================
   ELETROCALHAS, PERFILADOS, BANDEJAS, LEITOS E CANALETAS
   Trechos formados pelos circuitos cuja maneira de instalar (Tabela 33)
   usa conduto retangular ou suporte aberto.
   ================================================================ */
const CALHA_MET = {
  '12': 'bandeja', '13': 'perfurada', '14': 'aramada', '16': 'leito',
  '24': 'eletrocalha', '25': 'eletrocalha', '31': 'eletrocalha', '31A': 'eletrocalha', '32': 'eletrocalha', '32A': 'eletrocalha', '35': 'eletrocalha', '36': 'eletrocalha',
  '5': 'canaleta', '6': 'canaleta', '26': 'canaleta', '27': 'canaleta', '33': 'canaleta', '34': 'canaleta', '43': 'canaleta', '71': 'canaleta', '72': 'canaleta', '72A': 'canaleta', '75': 'canaleta', '75A': 'canaleta'
};
const LARG_STD = [50, 75, 100, 150, 200, 250, 300, 400, 500, 600];
const TIPOS_CALHA = {
  eletrocalha: { nome: 'Eletrocalha lisa com tampa', aberta: false, larguras: LARG_STD, alturas: [50, 75, 100], H: 50, taxa: 40 },
  perfurada: { nome: 'Eletrocalha / bandeja perfurada', aberta: true, larguras: LARG_STD, alturas: [50, 75, 100], H: 50, taxa: 40 },
  bandeja: { nome: 'Bandeja não perfurada / prateleira', aberta: true, larguras: LARG_STD, alturas: [50, 75, 100], H: 50, taxa: 40 },
  perfilado: { nome: 'Perfilado com tampa', aberta: false, larguras: [38], alturas: [19, 38], H: 38, taxa: 40 },
  aramada: { nome: 'Eletrocalha aramada (tela)', aberta: true, larguras: [50, 100, 150, 200, 300, 400, 500, 600], alturas: [35, 50, 75], H: 50, taxa: 40 },
  leito: { nome: 'Leito para cabos', aberta: true, larguras: [150, 200, 300, 400, 500, 600, 800, 1000], alturas: [50, 75, 100, 150], H: 100, taxa: 40 },
  canaleta: { nome: 'Canaleta / conduto retangular (dimensões informadas)', aberta: false, larguras: [], alturas: [], H: 20, taxa: 40 }
};
const DENS_METAL = { Cu: 8.89, Al: 2.70 };   // kg/km por mm²
const DENS_ISOL = 1.45;                        // kg/km por mm² (PVC/EPR, aproximado)

function pesoCabo(k, mat) {
  const Sm = k.multipolar ? k.cond.reduce((s, q) => s + q.S, 0) : k.S;
  const At = Math.PI * (k.d || 0) * (k.d || 0) / 4;
  const Aiso = Math.max(0, At - Sm / 0.85);
  return (Sm * (DENS_METAL[mat] || DENS_METAL.Cu) + Aiso * DENS_ISOL) / 1000; // kg/m
}
function calhaCfg(proj, key, tipoPadrao) {
  const s = (proj.trechos || {})[key] || {};
  const tipo = TIPOS_CALHA[s.tipoCalha] ? s.tipoCalha : tipoPadrao;
  const T = TIPOS_CALHA[tipo];
  return {
    tipo, H: +s.altura || T.H, largura: +s.largura || null, larg: +s.largCanaleta || 30, alt: +s.altCanaleta || 20,
    taxa: +s.taxa || T.taxa, reserva: s.reserva != null ? +s.reserva : 20, vao: +s.vao || 1.5, carga: +s.carga || null,
    comp: s.comp ?? null, septo: !!s.septo, camada: s.camada || 'auto'
  };
}
function calcCalhas(proj, res) {
  const out = {};
  const grupos = {};
  proj.circuitos.forEach(c => { const tipo = CALHA_MET[c.metodo]; if (!tipo) return; const key = chaveTrecho(c); (grupos[key] = grupos[key] || { tipos: new Set(), circs: [] }).circs.push(c); grupos[key].tipos.add(tipo); });
  Object.entries(grupos).forEach(([key, g]) => {
    const cs = g.circs; const tipoPadrao = [...g.tipos][0];
    const cfg = calhaCfg(proj, key, tipoPadrao); const T = TIPOS_CALHA[cfg.tipo];
    const t = { key, exclusivo: key.startsWith('#'), nome: key.startsWith('#') ? `Exclusivo — circuito ${cs[0].num}` : `Trecho ${key}`, circuitos: cs, cfg, T, avisos: [], falhas: [], itens: [] };
    if (g.tipos.size > 1) t.avisos.push('Circuitos do trecho têm maneiras de instalar de tipos diferentes; adotado ' + T.nome.toLowerCase() + '.');
    cs.forEach(c => { const r = res[c.id]; (r.cabos || []).forEach(k => t.itens.push({ circ: c.num, cid: c.id, ...k, A: k.d ? Math.PI * k.d * k.d / 4 : 0, w: pesoCabo(k, r.mat) })); });
    t.n = t.itens.length; t.A = t.itens.reduce((s, k) => s + k.A, 0); t.somaD = t.itens.reduce((s, k) => s + (k.d || 0), 0); t.peso = t.itens.reduce((s, k) => s + k.w, 0);
    const rsv = 1 + (cfg.reserva || 0) / 100, taxa = cfg.taxa / 100;
    // camada única: suportes abertos com circuitos calculados em camada única (Tabela 42, ref. 2 a 5)
    const refsUnica = cs.every(c => { const r = res[c.id]; return ['C', 'E', 'F'].includes(r.ref) && !(+c.camadas > 1) && r.refAgrup !== 1; });
    t.camadaUnica = T.aberta && (cfg.camada === 'sim' || (cfg.camada === 'auto' && refsUnica));
    t.Wcamada = t.camadaUnica ? t.somaD * rsv : 0;
    if (cfg.tipo === 'canaleta') {
      t.esc = { W: cfg.larg, H: cfg.alt, nome: T.nome };
    } else {
      const H = T.alturas.includes(cfg.H) ? cfg.H : T.H; t.H = H;
      t.Wmin = Math.max(t.A * rsv / (taxa * H), t.Wcamada);
      const W = cfg.largura || T.larguras.find(x => x + 1e-9 >= t.Wmin);
      if (W == null) { t.esc = null; t.falhas.push(`Nenhuma largura padronizada comporta os cabos (mínimo ${nfmt(t.Wmin, 0)} mm com altura ${H} mm) — use maior altura, divida o trecho ou dois níveis de suporte.`); }
      else t.esc = { W, H, nome: T.nome };
      if (cfg.largura && W + 1e-9 < t.Wmin) t.falhas.push(`Largura fixada de ${W} mm menor que a mínima de ${nfmt(t.Wmin, 0)} mm.`);
    }
    if (t.esc) {
      t.esc.Au = t.esc.W * t.esc.H; t.ocup = t.A / t.esc.Au * 100; t.ocupRes = t.ocup * rsv;
      if (t.ocupRes > cfg.taxa + 1e-6) t.falhas.push(`Ocupação de ${nfmt(t.ocup, 1)} % (${nfmt(t.ocupRes, 1)} % com a reserva) acima da taxa máxima adotada de ${nfmt(cfg.taxa, 0)} %.`);
      if (t.camadaUnica && t.somaD * rsv > t.esc.W + 1e-6) t.falhas.push(`Os cabos não cabem em camada única: soma dos diâmetros ${nfmt(t.somaD, 0)} mm${cfg.reserva ? ` (+${cfg.reserva} % de reserva)` : ''} > largura ${t.esc.W} mm.`);
    }
    // camada única x agrupamento dos circuitos
    if (T.aberta && !t.camadaUnica && cs.some(c => ['C', 'E', 'F'].includes(res[c.id].ref) && !(+c.camadas > 1) && res[c.id].refAgrup !== 1)) t.avisos.push('Os circuitos foram dimensionados para camada única (Tabela 42, ref. 2 a 5); se os cabos ficarem em mais de uma camada, informe as camadas no circuito (Tabela 43).');
    // peso e suportes
    t.nSup = cfg.comp > 0 ? Math.ceil(cfg.comp / cfg.vao - 1e-9) + 1 : null;
    if (cfg.vao > 2 + 1e-9) t.avisos.push(`Vão entre suportes de ${nfmt(cfg.vao, 2)} m: a prática de mercado limita a 2 m (padrão 1,5 m).`);
    if (cfg.carga) { if (t.peso > cfg.carga + 1e-9) t.falhas.push(`Peso dos cabos ${nfmt(t.peso, 2)} kg/m acima da carga admissível de ${nfmt(cfg.carga, 1)} kg/m informada para o vão de ${nfmt(cfg.vao, 2)} m.`); }
    else if (cfg.tipo !== 'canaleta') t.avisos.push(`Informe a carga admissível do fabricante (kg/m) para o vão de ${nfmt(cfg.vao, 2)} m; peso estimado dos cabos: ${nfmt(t.peso, 2)} kg/m.`);
    if (cfg.septo) t.avisos.push('Circuitos de energia junto a circuitos de sinal ou de extrabaixa tensão: usar septo divisor contínuo entre os sistemas, conforme as prescrições de separação de circuitos da NBR 5410.');
    if (cfg.tipo !== 'canaleta') t.avisos.push('Eletrocalhas e leitos metálicos devem ser contínuos eletricamente e ligados à equipotencialização (6.4).');
    t.status = t.falhas.length ? 'fail' : 'ok';
    cs.forEach(c => { res[c.id].calha = t; if (t.falhas.length) res[c.id].avisos.push(`Eletrocalha (${t.nome}): ${t.falhas.join(' ')}`); });
    out[key] = t;
  });
  return out;
}
function calhaTxt(r) { const t = r.calha; if (!t) return null; return t.esc ? `${t.T.nome} ${t.esc.W}×${t.esc.H} mm${t.exclusivo ? '' : ' — ' + t.key}` : 'não dimensionada'; }

/* Corte esquemático da eletrocalha: cabos em linhas a partir do fundo */
function corteCalhaSVG(t, P = PAL_UI, pre = 'cc') {
  if (!t.esc) return '';
  const W = t.esc.W, H = t.esc.H, m = Math.max(6, W * 0.06), VW = W + 2 * m, VH = Math.max(H, 20) + 2 * m;
  const itens = t.itens.map((k, i) => ({ ...k, i, r: Math.max(0.5, (k.d || 4) / 2) })).sort((a, b) => b.r - a.r);
  const pos = []; let x = 0, y = H, linha = 0;
  itens.forEach(k => { if (x + 2 * k.r > W + 1e-6) { y -= 2 * linha; x = 0; linha = 0; } pos.push({ k, cx: x + k.r, cy: y - k.r }); x += 2 * k.r; linha = Math.max(linha, k.r); });
  const cor = q => q.func === 'N' ? 'var(--c-neutro)' : (q.func === 'PE' ? `url(#${pre}-pe)` : `var(--c-fase-${(q.fase || 'A').toLowerCase()})`);
  const sw = Math.max(0.4, W / 300);
  const perfil = t.T.aberta && t.cfg.tipo === 'leito' ? `<rect x="${m - 3}" y="${m}" width="3" height="${H}" fill="${P.ln}"/><rect x="${m + W}" y="${m}" width="3" height="${H}" fill="${P.ln}"/><line x1="${m}" y1="${m + H + 1.5}" x2="${m + W}" y2="${m + H + 1.5}" stroke="${P.ln}" stroke-width="3"/>`
    : `<path d="M${m} ${m} V${m + H} H${m + W} V${m}" fill="${P.face}" stroke="${P.ln}" stroke-width="${2 * sw}" ${t.T.aberta && t.cfg.tipo !== 'bandeja' ? `stroke-dasharray="${W / 30} ${W / 60}"` : ''}/>${!t.T.aberta ? `<line x1="${m - 2}" y1="${m}" x2="${m + W + 2}" y2="${m}" stroke="${P.ln}" stroke-width="${3 * sw}"/>` : ''}`;
  const cab = pos.map(({ k, cx, cy }) => {
    const X = m + cx, Y = m + cy;
    if (k.multipolar) return `<circle cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" r="${k.r.toFixed(1)}" fill="var(--c-capa)" stroke="${P.ln}" stroke-width="${sw}"/>` + k.cond.map((q, j) => { const a = -Math.PI / 2 + j * 2 * Math.PI / k.vias; const xx = X + k.r * 0.45 * Math.cos(a), yy = Y + k.r * 0.45 * Math.sin(a); return `<circle cx="${xx.toFixed(1)}" cy="${yy.toFixed(1)}" r="${(k.r * 0.33).toFixed(1)}" fill="${cor(q)}" stroke="${P.ln}" stroke-width="${sw / 2}"/>`; }).join('');
    return `<circle cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" r="${(k.r * 0.98).toFixed(1)}" fill="${cor(k)}" stroke="${P.ln}" stroke-width="${sw}"/><circle cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" r="${Math.min(Math.sqrt(k.S / Math.PI), k.r * 0.7).toFixed(1)}" fill="var(--copper)"/>`;
  }).join('');
  return `<svg viewBox="0 0 ${VW.toFixed(1)} ${VH.toFixed(1)}" role="img" aria-label="Corte da ${t.T.nome} ${W} por ${H} mm com ${t.n} cabos"><defs><pattern id="${pre}-pe" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)"><rect width="4" height="4" fill="var(--c-pe)"/><rect width="2" height="4" fill="var(--c-pe2)"/></pattern></defs>${perfil}${cab}</svg>`;
}

/* ================================================================
   MEMORIAL DE CÁLCULO DE CARGA TÉRMICA (NBR 16401-1:2024 / 16401-2:2024 / 16401-3:2008)
   ================================================================ */
/* atraso térmico — ABNT NBR 15220-2 (homogêneo: 0,7284·√(Rt·CT); heterogêneo: 1,382·Rt·√(B1 + B2)) */
function atrasoNBR15220(cons) {
  const cam = (cons.cam || []).map(l => ({ m: MAT_C[l.mat], e: l.e / 100 })).filter(x => x.m);
  if (!cam.length) return 0;
  const Rt = cam.reduce((s, x) => s + (x.m.R != null ? x.m.R : x.e / x.m.lam), 0), CT = cam.reduce((s, x) => s + (x.m.R != null ? 0 : x.e * x.m.rho * x.m.c), 0);
  const mats = cam.filter(x => x.m.R == null);
  if (mats.length === 1 && cam.length === 1) return 0.7284 * Math.sqrt(Rt * CT);
  const ext = cam[0]; if (ext.m.R != null) return 1.382 * Rt * Math.sqrt(0.226 * CT / Rt);
  const Rext = ext.e / ext.m.lam, CText = ext.e * ext.m.rho * ext.m.c;
  const B1 = 0.226 * (CT - CText) / Rt; let B2 = 0.205 * (ext.m.lam * ext.m.rho * ext.m.c / Rt) * (Rext - (Rt - Rext) / 10); if (B2 < 0) B2 = 0;
  return 1.382 * Rt * Math.sqrt(Math.max(0, B1 + B2));
}
function camadasTxt(cons) { return (cons.cam || []).map(l => { const m = MAT_C[l.mat]; return m ? `${m.nome.split(' — ')[0].split(' (')[0].toLowerCase()} ${nfmt(+l.e, l.e % 1 ? 2 : 0)} cm` : ''; }).filter(Boolean).join(' + '); }
/* gráfico do perfil horário (W) */
function graficoCargaSVG(r, doc = true) {
  const C = doc ? { ink: '#1b1f23', mut: '#6a737b', grid: '#e1e6ea', t: '#0b5a70', s: '#c0782a', bg: '#ffffff' } : { ink: 'var(--ink)', mut: 'var(--muted)', grid: 'var(--line)', t: 'var(--accent)', s: 'var(--warn)', bg: 'var(--sheet)' };
  const W = 480, H = 230, ml = 48, mr = 14, mt = 26, mb = 30, pw = W - ml - mr, ph = H - mt - mb;
  const ymax = Math.max(100, ...r.T) * 1.12, step = [100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000].find(s => ymax / s <= 6) || 100000;
  const x = h => ml + (h - 1) * pw / 23, y = v => mt + ph - Math.max(0, v) * ph / ymax;
  let g = ''; for (let v = 0; v <= ymax; v += step) g += `<line x1="${ml}" y1="${y(v).toFixed(1)}" x2="${W - mr}" y2="${y(v).toFixed(1)}" stroke="${C.grid}" stroke-width="1"/><text x="${ml - 5}" y="${(y(v) + 3).toFixed(1)}" text-anchor="end" font-size="9" fill="${C.mut}" font-family="Arial">${nfmt(v, 0)}</text>`;
  for (let h = 2; h <= 24; h += 2) g += `<text x="${x(h).toFixed(1)}" y="${H - mb + 13}" text-anchor="middle" font-size="9" fill="${C.mut}" font-family="Arial">${h}</text>`;
  const pl = arr => arr.map((v, j) => `${j ? 'L' : 'M'}${x(j + 1).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const jp = r.jPico;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Perfil horário da carga térmica"><rect width="${W}" height="${H}" fill="${C.bg}"/>${g}
    <line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt + ph}" stroke="${C.ink}" stroke-width="1"/><line x1="${ml}" y1="${mt + ph}" x2="${W - mr}" y2="${mt + ph}" stroke="${C.ink}" stroke-width="1"/>
    <path d="${pl(r.S)}" fill="none" stroke="${C.s}" stroke-width="2" stroke-dasharray="5 3"/><path d="${pl(r.T)}" fill="none" stroke="${C.t}" stroke-width="2.4"/>
    <circle cx="${x(jp + 1).toFixed(1)}" cy="${y(r.T[jp]).toFixed(1)}" r="4" fill="${C.t}"/><text x="${Math.min(W - mr - 4, x(jp + 1) + 6).toFixed(1)}" y="${(y(r.T[jp]) - 6).toFixed(1)}" font-size="9.5" font-weight="700" fill="${C.t}" font-family="Arial" text-anchor="${jp > 18 ? 'end' : 'start'}">${nfmt(r.T[jp], 0)} W às ${jp + 1} h</text>
    <text x="${ml + pw / 2}" y="${H - 4}" text-anchor="middle" font-size="9" fill="${C.mut}" font-family="Arial">hora solar</text><text x="10" y="${mt + ph / 2}" text-anchor="middle" font-size="9" fill="${C.mut}" font-family="Arial" transform="rotate(-90 10 ${mt + ph / 2})">W</text>
    <line x1="${W - 170}" y1="11" x2="${W - 150}" y2="11" stroke="${C.t}" stroke-width="2.4"/><text x="${W - 146}" y="14" font-size="9" fill="${C.ink}" font-family="Arial">total</text>
    <line x1="${W - 110}" y1="11" x2="${W - 90}" y2="11" stroke="${C.s}" stroke-width="2" stroke-dasharray="5 3"/><text x="${W - 86}" y="14" font-size="9" fill="${C.ink}" font-family="Arial">sensível</text></svg>`;
}

function construirMemorialClima(proj, calc, cc) {
  const C = cc.C, I = proj.info, B = [], A = C.amb || [];
  const f0 = v => nfmt(v, 0), f1 = v => nfmt(v, 1), f2 = v => nfmt(v, 2), f3 = v => nfmt(v, 3), f4 = v => nfmt(v, 4);
  B.push({ t: 'title', kicker: 'ABNT NBR 16401-1:2024 · NBR 16401-2:2024 · NBR 16401-3:2008', text: 'Memorial de cálculo de carga térmica', sub: 'Climatização de ambientes — cálculo horário do dia de projeto e verificação do conforto térmico' });
  B.push({ t: 'meta', rows: [['Obra', I.obra || '—'], ['Endereço', [I.endereco, I.cidade].filter(Boolean).join(' — ') || '—'], ['Localidade climática', [C.cidade, C.uf].filter(Boolean).join(' / ') || '—'],
    ['Responsável técnico', [I.responsavel, I.registro].filter(Boolean).join(' — ') || '—'], ['ART / TRT / RRT', I.art || '—'], ['Data / revisão', `${dataCurta(I.data) || '—'} — ${I.revisao || 'R00'}`]] });
  let n = 0; const sec = t => { n++; B.push({ t: 'h1', text: `${n}. ${t}` }); return n; };
  sec('Objetivo');
  B.push({ t: 'p', text: `Determinar a carga térmica de resfriamento dos ${A.length} ambientes climatizados da obra, verificar as condições internas de conforto térmico e indicar a capacidade dos equipamentos de climatização, segundo a ABNT NBR 16401 — Instalações de ar-condicionado: Parte 1 (projeto, edição 2024), Parte 2 (parâmetros de conforto térmico, edição 2024) e Parte 3 (qualidade do ar interior, edição 2008).` });
  sec('Normas e documentos de referência');
  B.push({ t: 'list', items: [
    'ABNT NBR 16401-1:2024 — Instalações de ar-condicionado — Sistemas centrais e unitários — Parte 1: Projetos das instalações.',
    'ABNT NBR 16401-2:2024 — Parte 2: Parâmetros de conforto térmico.',
    'ABNT NBR 16401-3:2008 — Parte 3: Qualidade do ar interior (a edição de 2024 foi suspensa pela ABNT e a de 2008 voltou a vigorar).',
    'ABNT NBR 15220-2 — Desempenho térmico de edificações: cálculo da transmitância, capacidade e atraso térmicos de componentes.',
    'ISO 7730 / ASHRAE Standard 55 — índices PMV e PPD de conforto térmico.',
    'ASHRAE Handbook — Fundamentals: modelo de radiação solar de céu claro, temperatura sol-ar, perfil diário de temperatura e taxas de calor liberado por pessoas.',
    'Lei nº 13.589/2018 — Plano de Manutenção, Operação e Controle (PMOC) dos sistemas de climatização de edifícios de uso público e coletivo.'
  ] });
  sec('Condições externas de projeto');
  B.push({ t: 'table', head: ['Parâmetro', 'Valor'], widths: [44, 56], rows: [
    ['Localidade', [C.cidade, C.uf].filter(Boolean).join(' / ') || '—'], ['Latitude / altitude', `${f2(+C.lat)}° / ${f0(+C.alt)} m`], ['Pressão atmosférica', `${f2(cc.p)} kPa`],
    ['Dia de projeto', `21 de ${MESES_C[+C.mes].toLowerCase()} (hora solar)`], ['Frequência anual de excedência', C.freq || '—'],
    ['Temperatura de bulbo seco (TBS)', `${f1(+C.tbs)} °C`], ['Temperatura de bulbo úmido coincidente (TBU)', `${f1(+C.tbu)} °C`],
    ['Umidade relativa / umidade absoluta', `${f0(cc.URo)} % / ${f4(cc.Wo)} kg/kg`], ['Entalpia', `${f1(cc.ho)} kJ/kg`], ['Amplitude diária de temperatura', `${f1(+C.amp)} K`], ['Refletância do solo', f2(+C.rhoSolo)],
    ['Fonte dos dados climáticos', C.fonte || 'informados pelo projetista']] });
  const sC = sec('Condições internas e conforto térmico (NBR 16401-2:2024)');
  B.push({ t: 'table', head: ['Parâmetro', 'Valor'], widths: [44, 56], rows: [
    ['Temperatura de bulbo seco interna', `${f1(+C.tint)} °C`], ['Umidade relativa interna', `${f0(+C.urInt)} %`], ['Bulbo úmido / ponto de orvalho', `${f1(cc.TBUi)} °C / ${f1(cc.orvalhoI)} °C`],
    ['Umidade absoluta / entalpia', `${f4(cc.Wi)} kg/kg / ${f1(cc.hi)} kJ/kg`], ['Temperatura radiante média', `${f1(cc.trm)} °C`], ['Velocidade do ar na zona ocupada', `${f2(+C.vel)} m/s`],
    ['Taxa metabólica / isolamento da roupa', `${f2(+C.met)} met / ${f2(+C.clo)} clo`]] });
  B.push({ t: 'eq', lines: [`PMV = ${f2(cc.conf.pmv)}   (modelo de Fanger, ISO 7730 / ASHRAE 55)`, `PPD = 100 − 95 · exp(−0,03353 · PMV⁴ − 0,2179 · PMV²) = ${f1(cc.conf.ppd)} %`] });
  B.push({ t: 'ver', ok: cc.confOK, text: `Conforto térmico: −0,5 ≤ PMV = ${f2(cc.conf.pmv)} ≤ +0,5 (PPD ≤ 10 %) — critério de aceitabilidade da ASHRAE 55, base da NBR 16401-2:2024` });
  if (!cc.confOK) B.push({ t: 'note', text: 'Condição interna fora da faixa de conforto: revise a temperatura, a umidade, a velocidade do ar ou as hipóteses de atividade e vestimenta.' });
  sec('Metodologia de cálculo');
  B.push({ t: 'p', text: 'A carga térmica é calculada hora a hora para o dia de projeto, com a temperatura externa variando segundo o perfil diário da ASHRAE e a radiação solar pelo modelo de céu claro. A carga de projeto de cada ambiente é o maior valor horário do total (sensível + latente). A condução nas paredes e coberturas é resolvida em regime periódico pela equação da condução unidimensional nas camadas do componente (diferenças finitas, Crank-Nicolson), o que considera a inércia térmica (atraso e amortecimento). Insolação em vidros, pessoas, iluminação e equipamentos são tratados como ganhos instantâneos, a favor da segurança.' });
  B.push({ t: 'eq', lines: [
    'Te(h) = To(h) + α · It(h) / ho − ε·ΔR / ho          (temperatura sol-ar; ho = 17 W/m²K; ε·ΔR/ho = 3,9 K em superfícies horizontais)',
    'To(h) = TBS − amplitude · f(h)          (f: fração da amplitude diária, ASHRAE)',
    'q_cond(h) = A · q″(h)          (q″: fluxo na face interna em regime periódico; em regime permanente q″ = U · (Te − Ti))',
    'q_vidro(h) = A · FS · Fs · [ID(h) · k(θ) + Id(h) · kd] + A · U · (To − Ti)',
    'q_pessoas = n · (qs + ql)          q_ilum = P_ilum          q_equip = Σ n · P',
    'Vef = Pz · Fp + Az · Fa   (NBR 16401-3:2008);   q_s = ρ · V · cp · (To − Ti);   q_l = ρ · V · hfg · (Wo − Wi)',
    'Q = máx_h [Σ q_s(h) + Σ q_l(h)];   Q_proj = Q · (1 + margem);   FCS = Q_s / Q',
    '1 W = 3,412 BTU/h = 0,8598 kcal/h;   1 TR = 3.516,85 W'] });
  sec('Componentes construtivos (NBR 15220-2)');
  const usados = new Set(A.flatMap(a => (a.env || []).filter(e => e.tipo !== 'janela').map(e => e.cons)));
  const consU = (C.cons || []).filter(k => usados.has(k.id));
  if (consU.length) B.push({ t: 'table', small: true, head: ['Componente', 'Camadas (exterior → interior)', 'U (W/m²K)', 'CT (kJ/m²K)', 'Atraso φ (h)'], widths: [26, 44, 10, 10, 10], align: 'llrrr',
    rows: consU.map(k => { const tp = k.tipo === 'cobertura' ? k : { ...k, tipo: 'parede' }, P = propsCons(tp); return [k.nome, camadasTxt(k), f2(P.U), f0(P.CT), f1(atrasoNBR15220(k))]; }) });
  const vid = [...new Set(A.flatMap(a => (a.env || []).filter(e => e.tipo === 'janela').map(e => e.vidro)))];
  if (vid.length) B.push({ t: 'table', small: true, head: ['Vidro', 'U (W/m²K)', 'Fator solar FS'], widths: [60, 20, 20], align: 'lrr', rows: vid.map(v => [VIDROS[v].nome, f2(VIDROS[v].U), f2(VIDROS[v].FS)]) });
  B.push({ t: 'note', text: 'Propriedades dos materiais: valores típicos da NBR 15220-2 (blocos vazados representados por camada equivalente); vidros com U e fator solar típicos de catálogo — confirme com os produtos especificados.' });
  const sA = sec('Cálculo por ambiente');
  A.forEach((a, i) => memAmbClima(B, a, cc.amb[a.id], C, cc, proj, `${sA}.${i + 1}`));
  sec('Resumo da carga térmica e dos equipamentos');
  const R = A.map(a => cc.amb[a.id]);
  B.push({ t: 'table', small: true, head: ['Ambiente', 'Área (m²)', 'Sensível (W)', 'Latente (W)', 'Total (W)', 'BTU/h (c/ margem)', 'TR', 'Pico', 'Equipamento indicado'], widths: [18, 8, 10, 10, 10, 12, 7, 7, 18], align: 'lrrrrrrcl',
    rows: A.map((a, k) => { const r = R[k]; return [a.nome, f2(+a.area), f0(r.Qs), f0(r.Ql), f0(r.Q), f0(r.BTU), f2(r.TR), `${r.hPico} h`, `${r.equip.n > 1 ? r.equip.n + ' × ' : ''}${nfmt(r.equip.cap, 0)} BTU/h`]; })
      .concat([['Total (soma dos picos)', f2(A.reduce((s, a) => s + (+a.area || 0), 0)), f0(R.reduce((s, r) => s + r.Qs, 0)), f0(R.reduce((s, r) => s + r.Ql, 0)), f0(cc.Qsoma), f0(R.reduce((s, r) => s + r.BTU, 0)), f2(R.reduce((s, r) => s + r.TR, 0)), '', '']]), lastBold: true });
  if (R.length > 1) B.push({ t: 'p', text: `Carga simultânea máxima do conjunto: ${f0(cc.Qsimult)} W às ${cc.jPico + 1} h (${f0(cc.Qsimult * BTU_W)} BTU/h; ${f2(cc.Qsimult / W_TR)} TR) — base para o dimensionamento de sistemas centrais ou multi-split.` });
  B.push({ t: 'p', text: `Potência elétrica estimada dos equipamentos indicados: ${f2(R.reduce((s, r) => s + r.Pel, 0) / 1000)} kW (COP de referência ${f2(+C.cop)}); confirme com os dados do fabricante para o dimensionamento dos circuitos.` });
  sec('Recomendações');
  B.push({ t: 'list', items: [
    'Selecionar os equipamentos pela capacidade de refrigeração total e sensível nas condições de projeto, conforme os dados de desempenho do fabricante.',
    'Instalação dos sistemas split conforme as instruções do fabricante e a ABNT NBR 16655 (sistemas residenciais de ar-condicionado split e compacto), com drenagem do condensado e afastamentos recomendados.',
    'Garantir a vazão de ar exterior calculada (NBR 16401-3:2008), com filtragem adequada, e manter o PMOC atualizado nos edifícios de uso público e coletivo (Lei nº 13.589/2018).',
    'Circuitos de alimentação dos equipamentos dimensionados conforme a ABNT NBR 5410, com dispositivo de proteção dedicado.'
  ] });
  B.push({ t: 'sign', place: [I.cidade, dataExtenso(I.data)].filter(Boolean).join(', '), name: I.responsavel || 'Responsável técnico', reg: [I.registro, I.art ? 'ART ' + I.art : ''].filter(Boolean).join(' — ') });
  return B;
}
function memAmbClima(B, a, r, C, cc, proj, num) {
  const f0 = v => nfmt(v, 0), f1 = v => nfmt(v, 1), f2 = v => nfmt(v, 2);
  const at = ATIV_P[a.ativ] || ATIV_P.sentadoLeve, cons = Object.fromEntries((C.cons || []).map(k => [k.id, k]));
  B.push({ t: 'h2', text: `${num} ${a.nome}` });
  B.push({ t: 'kv4', rows: [['Área', `${f2(+a.area)} m²`, 'Pé-direito / volume', `${f2(+a.pd)} m / ${f1((+a.area) * (+a.pd))} m³`], ['Ocupação', `${f0(+a.pessoas)} pessoa(s) — ${at[0].toLowerCase()}`, 'Horário de uso', `${a.hIni} h às ${a.hFim} h`]] });
  if (r.env.length) B.push({ t: 'table', small: true, head: ['Elemento', 'Orientação', 'Área (m²)', 'Componente', 'U (W/m²K)', 'α / FS', 'Máx. (W)'], widths: [12, 12, 9, 34, 9, 10, 14], align: 'llrlrrr',
    rows: r.env.map(x => { const e = x.e; const tipo = { parede: 'Parede', cobertura: 'Cobertura', janela: 'Janela', divisoria: 'Divisória', piso: 'Piso/laje' }[e.tipo]; return [tipo, e.tipo === 'cobertura' ? 'horizontal' : (e.tipo === 'divisoria' || e.tipo === 'piso' ? `ΔT ${f1(+e.dT)} K` : ORIENT[e.orient][0]), f2(x.A), e.tipo === 'janela' ? `${VIDROS[e.vidro].nome}; ${SOMBRA[e.sombra][0].toLowerCase()} (Fs ${f2(x.fsh)})` : (cons[e.cons] || {}).nome || '—', f2(x.U), e.tipo === 'janela' ? f2(x.FS) : (x.alpha != null ? f2(x.alpha) : '—'), f0(x.qmax)]; }) });
  const L = [`Pessoas: ${f0(+a.pessoas)} × (${at[1]} W sensível + ${at[2]} W latente)`, `Iluminação: ${r.ilumFonte} → ${f0(r.Wil)} W`];
  if ((a.equip || []).length) L.push(`Equipamentos: ${(a.equip || []).map(x => `${x.qtd} × ${f0(+x.W)} W${+x.WL ? ` (+${f0(+x.WL)} W lat.)` : ''} ${x.desc || ''}`.trim()).join('; ')} = ${f0(r.Weq)} W sensível${r.WeqL ? ` + ${f0(r.WeqL)} W latente` : ''}`);
  L.push(`Ar exterior: Vef = ${f0(+a.pessoas)} × ${f2(r.Fp)} + ${f2(+a.area)} × ${f2(r.Fa)} = ${f1(r.Vef)} L/s   (${(AR_EXT[a.arExt] || AR_EXT.nenhum)[0].toLowerCase()})`);
  if (r.Vinf > 0) L.push(`Infiltração: ${f2(+a.infil)} renovações/h × ${f1((+a.area) * (+a.pd))} m³ / 3,6 = ${f1(r.Vinf)} L/s`);
  B.push({ t: 'eq', lines: L });
  B.push({ t: 'table', small: true, head: [`Componente no horário de pico (${r.hPico} h)`, 'Sensível (W)', 'Latente (W)', 'Total (W)', '%'], widths: [46, 14, 14, 14, 12], align: 'lrrrr',
    rows: r.picoComp.map(x => [x.k, f0(x.s), f0(x.l), f0(x.s + x.l), f1((x.s + x.l) / r.Q * 100)]).concat([['Total', f0(r.Qs), f0(r.Ql), f0(r.Q), '100,0']]), lastBold: true });
  B.push({ t: 'eq', lines: [`Q = ${f0(r.Q)} W;   Q_proj = ${f0(r.Q)} × (1 + ${f0(+C.margem)} %) = ${f0(r.Qproj)} W = ${f0(r.BTU)} BTU/h = ${f0(r.kcal)} kcal/h = ${f2(r.TR)} TR`, `FCS = ${f0(r.Qs)} / ${f0(r.Q)} = ${f2(r.FCS)};   densidade = ${f0(r.Wm2)} W/m²;   vazão de insuflamento (ΔT 10 K) ≈ ${f0(r.Vins)} L/s`] });
  B.push({ t: 'fig', svg: svgDoc(graficoCargaSVG(r, true), 480, 220), ar: 220 / 480, w: 110, caption: `Perfil horário da carga térmica de ${a.nome} no dia de projeto (21 de ${MESES_C[+C.mes].toLowerCase()}): total e parcela sensível.` });
  B.push({ t: 'ver', ok: r.equip.n * r.equip.cap + 1e-6 >= r.BTU, text: `Equipamento indicado: ${r.equip.n > 1 ? r.equip.n + ' × ' : ''}${nfmt(r.equip.cap, 0)} BTU/h ≥ ${f0(r.BTU)} BTU/h (potência elétrica estimada ${f0(r.Pel)} W)` });
  r.falhas.concat(r.avisos).forEach(x => B.push({ t: 'note', text: x }));
  if (a.obs) B.push({ t: 'note', text: a.obs });
}

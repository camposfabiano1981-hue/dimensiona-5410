/* ================================================================
   MEMORIAL DE CÁLCULO DE DEMANDA — apresentação à distribuidora (Grupo Energisa)
   ================================================================ */
const MODOS_E = { individual: 'Unidade consumidora individual (NDU 001)', agrupamento: 'Agrupamento de até 3 unidades consumidoras (NDU 003, item 9.3)', edificio: 'Edificação de múltiplas unidades consumidoras (NDU 003, item 9.4)' };
const PAPEIS_UC = { unidade: 'Unidade consumidora', condominio: 'Condomínio / serviço comum', loja: 'Loja / sala comercial', outro: 'Outra carga (D2)' };
const SOLICITACOES = ['Ligação nova', 'Aumento de carga', 'Alteração de categoria / tipo de ligação', 'Ligação provisória (canteiro de obras)', 'Desmembramento de unidade', 'Regularização'];

/* esquema simplificado da entrada de serviço (desenho sem escala) */
function esquemaEntradaSVG(r, doc = true) {
  const p = r.padrao; if (!p) return '';
  const C = doc ? { ink: '#1b1f23', mut: '#56606a', acc: '#0b5a70', terra: '#8a6d3b', caixa: '#eef2f4', cu: '#b5652c', al: '#6a737b', bg: '#ffffff' } : { ink: 'var(--ink)', mut: 'var(--muted)', acc: 'var(--accent)', terra: 'var(--warn)', caixa: 'var(--sunk)', cu: 'var(--copper)', al: 'var(--muted)', bg: 'var(--sheet)' };
  const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.fs || 6.2}" fill="${o.cor || C.ink}" font-family="Arial"${o.anc ? ` text-anchor="${o.anc}"` : ''}${o.b ? ' font-weight="700"' : ''}>${escH(s)}</text>`;
  const hastes = Array.from({ length: p.hastes }, (_, i) => { const x = 226 + i * 14; return `<line x1="${x}" y1="152" x2="${x}" y2="176" stroke="${C.cu}" stroke-width="2"/><path d="M${x - 2} 176 L${x} 180 L${x + 2} 176 Z" fill="${C.cu}"/>`; }).join('');
  const ligH = p.hastes > 1 ? `<line x1="226" y1="156" x2="${226 + (p.hastes - 1) * 14}" y2="156" stroke="${C.cu}" stroke-width="1.2"/>` : '';
  let solo = ''; for (let x = 4; x < 316; x += 7) solo += `<line x1="${x}" y1="150" x2="${x - 5}" y2="156" stroke="${C.terra}" stroke-width=".6"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 190" role="img" aria-label="Esquema da entrada de serviço, categoria ${p.cat}"><rect width="320" height="190" fill="${C.bg}"/>
  <line x1="0" y1="150" x2="320" y2="150" stroke="${C.terra}" stroke-width="1.2"/>${solo}
  <rect x="18" y="14" width="8" height="136" fill="${C.caixa}" stroke="${C.ink}" stroke-width="1"/><line x1="4" y1="18" x2="60" y2="18" stroke="${C.ink}" stroke-width="1.4"/>
  ${t(8, 10, 'Rede secundária da distribuidora', { cor: C.mut, fs: 5.6 })}
  <path d="M26 20 Q112 44 196 30" fill="none" stroke="${C.al}" stroke-width="1.6"/>
  ${t(112, 26, `Ramal de conexão: ${p.ramal === 'multiplex' ? `multiplex Al ${r.cat.mux}/${r.cat.nAl} mm²` : `concêntrico Al ${r.cat.conc} mm²`}`, { anc: 'middle', fs: 5.8 })}
  <rect x="196" y="28" width="7" height="122" fill="${C.caixa}" stroke="${C.ink}" stroke-width="1"/>
  ${t(190, 60, p.pConc ? `Poste: concreto duplo T ${p.pConc} daN` : '', { anc: 'end', fs: 5.6 })}${t(190, 68, p.pAco ? `ou aço galvanizado ${p.pAco} daN` : '', { anc: 'end', fs: 5.6 })}${t(190, 76, p.pont ? `ou pontalete ${p.pont} daN` : '', { anc: 'end', fs: 5.6 })}
  <path d="M206 34 V96" stroke="${C.cu}" stroke-width="2.4" stroke-dasharray="4 2"/><circle cx="206" cy="33" r="2.4" fill="none" stroke="${C.ink}"/>
  ${t(190, 92, `Ramal de entrada: Cu ${p.fF}/${p.fN} mm² (${p.isol === 'PVC' ? 'PVC' : 'XLPE/EPR'})`, { anc: 'end', fs: 5.6 })}${t(190, 100, `Eletroduto ${p.eletro}${p.sub ? ' — subterrâneo' : ' — embutido'}`, { anc: 'end', fs: 5.6 })}
  <rect x="210" y="96" width="44" height="34" rx="1.5" fill="${C.caixa}" stroke="${C.ink}" stroke-width="1.2"/>
  ${t(232, 105, p.caixa, { anc: 'middle', b: true, fs: 6 })}<rect x="216" y="109" width="12" height="16" fill="${C.bg}" stroke="${C.ink}" stroke-width=".8"/>${t(222, 120, 'kWh', { anc: 'middle', fs: 4.6 })}
  <rect x="234" y="110" width="14" height="14" fill="${C.bg}" stroke="${C.ink}" stroke-width=".8"/>${t(241, 119.5, `${p.disj} A`, { anc: 'middle', fs: 4.6 })}
  <path d="M232 130 V152" stroke="${C.cu}" stroke-width="1.2"/>${ligH}${hastes}
  ${t(260, 168, `Aterramento: Cu ${p.aterr} mm²`, { fs: 5.6 })}${t(260, 176, `${p.hastes} haste${p.hastes > 1 ? 's' : ''} aço cobreado`, { fs: 5.6 })}
  <path d="M254 113 H292" stroke="${C.cu}" stroke-width="1.6"/><rect x="292" y="104" width="22" height="18" fill="${C.caixa}" stroke="${C.ink}" stroke-width="1"/>${t(303, 115.5, 'QD', { anc: 'middle', b: true, fs: 6 })}
  ${t(273, 109, 'ramal de saída', { anc: 'middle', fs: 5 })}
  ${t(316, 52, `Categoria ${p.cat} — ${p.fios} fios`, { anc: 'end', b: true, cor: C.acc, fs: 6.6 })}${t(316, 61, `${E_TENSAO_TXT(r)}`, { anc: 'end', cor: C.mut, fs: 5.6 })}
  </svg>`;
}

const E_TENSAO_TXT = r => r.tabCat === 21 ? '254/127 V' : '220/127 V';
function construirMemorialDemanda(proj, calc, ce) {
  const E = ce.E, I = proj.info, B = [];
  const f0 = v => nfmt(v, 0), f1 = v => nfmt(v, 1), f2 = v => nfmt(v, 2), f3 = v => nfmt(v, 3);
  const R = (E.ucs || []).map(u => ce.ucs[u.id]);
  const usa003 = E.modo !== 'individual';
  B.push({ t: 'title', kicker: `Grupo Energisa — ${ENERGISA_UN[E.un] || E.un}`, text: 'Memorial de cálculo de demanda', sub: `${MODOS_E[E.modo]} — fornecimento em tensão secundária ${ENERGISA_TENSOES[E.tensao]?.nome.split(' —')[0] || E.tensao}` });
  B.push({ t: 'meta', rows: [
    ['Obra / empreendimento', I.obra || '—'], ['Endereço', [I.endereco, I.cidade].filter(Boolean).join(' — ') || '—'],
    ['Município / UF', [E.municipio || I.cidade, E.uf].filter(Boolean).join(' / ') || '—'], ['Coordenadas (lat., long.)', E.coord || '—'],
    ['Distribuidora', ENERGISA_UN[E.un] || E.un], ['Solicitação', `${E.solicitacao}${E.protocolo ? ' — protocolo ' + E.protocolo : ''}`],
    ['Responsável técnico', [I.responsavel, I.registro].filter(Boolean).join(' — ') || '—'], ['ART / TRT / RRT', I.art || '—'], ['Data / revisão', `${dataCurta(I.data) || '—'} — ${I.revisao || 'R00'}`]
  ] });
  let n = 0; const sec = t => { n++; B.push({ t: 'h1', text: `${n}. ${t}` }); return n; };
  sec('Objetivo');
  B.push({ t: 'p', text: `Apresentar à ${ENERGISA_UN[E.un] || 'distribuidora'} a relação de cargas instaladas, o cálculo da demanda provável e o enquadramento na categoria de atendimento ${R.length > 1 ? 'das unidades consumidoras' : 'da unidade consumidora'} da obra identificada acima, com o dimensionamento do padrão de entrada (ramal de conexão, ramal de entrada, proteção, eletroduto, aterramento, poste e caixa de medição), segundo a ${NDU001_VER}${usa003 ? ` e a ${NDU003_VER}` : ''}.` });
  sec('Normas e documentos de referência');
  B.push({ t: 'list', items: [
    `Energisa ${NDU001_VER} — Fornecimento de energia elétrica em tensão secundária a edificações individuais.`,
    ...(usa003 ? [`Energisa ${NDU003_VER} — Fornecimento de energia elétrica em tensão primária e secundária a agrupamentos ou edificações de múltiplas unidades consumidoras.`] : []),
    'Energisa NDU 002 — Fornecimento de energia elétrica em tensão primária (cargas acima de 75 kW).',
    'ANEEL — Resolução Normativa nº 1.000/2021 (regras de prestação do serviço público de distribuição).',
    'ABNT NBR 5410:2004 Versão Corrigida:2008 — Instalações elétricas de baixa tensão (instalações internas).'
  ] });
  sec('Dados da solicitação e das unidades consumidoras');
  B.push({ t: 'table', head: ['Item', 'Informação'], widths: [36, 64], rows: [
    ['Tipo de atendimento', MODOS_E[E.modo]], ['Tensão de fornecimento', ENERGISA_TENSOES[E.tensao]?.nome || E.tensao], ['Localização', E.area === 'rural' ? 'Área rural' : 'Área urbana'],
    ['Número de unidades consumidoras', String(E.modo === 'edificio' ? (ce.N || 0) + R.filter(r => r.u.papel !== 'unidade').length : R.length)]
  ] });
  B.push({ t: 'table', small: true, head: ['UC', 'Titular', 'CPF / CNPJ', 'Contato', 'Nº instalação', 'Unidade / complemento', 'Classe', 'Atividade desenvolvida'], widths: [8, 17, 12, 14, 9, 13, 11, 16], align: 'llllllll',
    rows: R.map(r => [r.u.nome, r.u.titular || '—', r.u.doc || '—', r.u.contato || '—', r.u.instalacao || 'nova', r.u.complemento || '—', CLASSES_UC[r.u.classe] || r.u.classe, r.u.atividadeDesc || ATIV_T5[r.u.atividade]?.nome || '—']) });
  const sC = sec('Critérios de cálculo (NDU 001, item 9)');
  B.push({ t: 'eq', lines: ['D (kVA) = d (kW) / 0,92', 'd (kW) = d1 + d2 + d3 + d4 + d5 + d6 + d7'] });
  B.push({ t: 'list', items: [
    'd1 — iluminação e tomadas de uso geral, fatores da Tabela 5 (residências: percentual acumulativo por faixa de 1 kW); cargas de uso simultâneo com fator de 100 % (nota I).',
    'd2 — aparelhos de aquecimento de água (chuveiros, torneiras, aquecedores), Tabela 6, pelo número total de aparelhos.',
    'd3 — secadoras de roupa, máquinas de lavar louça, fornos de micro-ondas e hidromassagens, Tabela 7.',
    'd4 — fogões e fornos elétricos, Tabela 8.',
    'd5 — ar-condicionado tipo janela ou split, potências da Tabela 9 e fatores das Tabelas 10 (residencial) e 11 (não residencial); unidades centrais com fator de 100 % (nota I).',
    'd6 — motores e máquinas de solda tipo motor-gerador: demanda individual em kVA das Tabelas 12 (monofásicos) e 13 (trifásicos), na coluna correspondente ao número de motores da instalação, convertida em kW pelo fator de potência do motor (nota III).',
    'd7 — máquinas de solda a transformador e aparelhos de raios X, Tabela 14 (ligação V-V invertida: potência em dobro); potência em kVA tomada como kW, a favor da segurança.',
    'Aparelhos de reserva não são computados (nota VI); potências não constantes da Tabela 4 são as informadas pelo fabricante.',
    'Enquadramento (item 6.5 e Tabelas 16 a 23): tipos M e B pela carga instalada (kW) e tipo T pela demanda calculada (kVA), com as restrições de motores e máquinas de solda de cada tipo.'
  ] });
  // unidades
  const sU = sec(R.length > 1 ? 'Cálculo por unidade consumidora' : 'Cálculo da unidade consumidora');
  R.forEach((r, i) => memUC(B, r, E, R.length > 1 ? `${sU}.${i + 1}` : `${sU}.1`));
  // agrupamento / edifício
  if (E.modo === 'agrupamento') {
    const sA = sec('Demanda do agrupamento (NDU 003, item 9.3)');
    B.push({ t: 'table', small: true, head: ['UC', 'Carga instalada (kW)', 'Demanda (kVA)', 'Tipo', 'Categoria', 'Disjuntor (A)'], widths: [24, 16, 16, 12, 16, 16], align: 'lrrccc',
      rows: R.map(r => [r.u.nome, f2(r.C), f2(r.D), r.tipo, r.cat ? r.cat.cat : '—', r.padrao ? r.padrao.disj : '—']).concat([['Total', f2(R.reduce((s, r) => s + r.C, 0)), f2(ce.Dsoma), '', '', '']]), lastBold: true });
    B.push({ t: 'eq', lines: [E.agrupDem === 'nota' ? `D agrupamento = Σ C (unidades M e B) + Σ D (unidades T) = ${f2(ce.Dnota)}` : `D agrupamento = Σ D das unidades = ${R.map(r => f2(r.D)).join(' + ')} = ${f2(ce.Dsoma)} kVA`, `I = D / (√3 × ${E.tensao === '254/127' ? 254 : 220}) = ${f1(ce.Iagr)} A`] });
    ce.avisos.forEach(x => B.push({ t: 'note', text: x }));
  }
  if (E.modo === 'edificio') {
    sec('Demanda da edificação (NDU 003, item 9.4)');
    B.push({ t: 'eq', lines: ['D = D1 + D2', 'D1 = f × a   (f: Tabela 03, fator de multiplicação pelo número de apartamentos; a: Tabela 04, demanda por apartamento em função da área útil)', 'D2 = demanda do condomínio, lojas e outras cargas, calculadas pela NDU 001'] });
    const cj = (E.conj || []).filter(c => +c.n > 0);
    B.push({ t: 'table', small: true, head: ['Conjunto', 'Nº de apartamentos', 'Área útil (m²)', ...(E.metodo003 === 'conjuntos' ? ['f', 'a (kVA)', 'D (kVA)'] : [])], widths: E.metodo003 === 'conjuntos' ? [34, 14, 14, 12, 12, 14] : [52, 24, 24], align: E.metodo003 === 'conjuntos' ? 'lrrrrr' : 'lrr',
      rows: cj.map((c, k) => [c.desc || `Conjunto ${k + 1}`, String(c.n), f2(+c.area), ...(E.metodo003 === 'conjuntos' ? (() => { const l = (ce.lin || [])[k] || {}; return [l.f != null ? f3(l.f) : '—', l.a != null ? f3(l.a) : '—', l.D != null ? f2(l.D) : '—']; })() : [])]).concat([['Total', String(ce.N || 0), '', ...(E.metodo003 === 'conjuntos' ? ['', '', f2(ce.D1 || 0)] : [])]]), lastBold: true });
    if (ce.tabOK) {
      if (E.metodo003 === 'conjuntos') B.push({ t: 'eq', lines: [`D1 = Σ (f × a) por conjunto de mesma área = ${f2(ce.D1)} kVA`] });
      else B.push({ t: 'eq', lines: [`Área média ponderada = Σ (n × área) / N = ${f2(ce.Amed)} m²   (N = ${ce.N} apartamentos)`, `D1 = f(${ce.N}) × a(${f2(ce.Amed)} m²) = ${ce.f != null ? f3(ce.f) : '—'} × ${ce.a != null ? f3(ce.a) : '—'} = ${f2(ce.D1)} kVA`] });
    }
    B.push({ t: 'eq', lines: [`D2 = ${ce.D2lin.length ? ce.D2lin.map(r => `${f2(r.D)} (${r.u.nome})`).join(' + ') : '0'} = ${f2(ce.D2)} kVA`, `D = D1 + D2 = ${f2(ce.D1)} + ${f2(ce.D2)} = ${f2(ce.Dtot)} kVA;   I = D / (√3 × 220) = ${f1(ce.Itot)} A`] });
    if (E.t003 && E.t003.fonte) B.push({ t: 'note', text: `Valores das Tabelas 03 e 04 informados conforme: ${E.t003.fonte}.` });
    ce.falhas.concat(ce.avisos).forEach(x => B.push({ t: 'note', text: x }));
  }
  // perturbações
  const pert = R.flatMap(r => r.itens.filter(it => ['mot1', 'mot3', 'solda', 'soldaR', 'raiox'].includes(it.g)).map(it => [r.u.nome, it.desc, String(it.q), it.ref || '', GRUPOS_CARGA[it.g].nome.split(' (')[0]]));
  sec('Cargas que podem provocar perturbações no sistema');
  if (pert.length) B.push({ t: 'table', small: true, head: ['UC', 'Equipamento', 'Qtd.', 'Potência', 'Tipo'], widths: [14, 36, 8, 18, 24], align: 'llrll', rows: pert });
  else B.push({ t: 'p', text: 'Não há motores, máquinas de solda ou aparelhos de raios X na relação de cargas.' });
  // declaração
  sec('Declaração de carga instalada');
  R.forEach(r => B.push({ t: 'p', text: `${r.u.nome}${r.u.titular ? ' — ' + r.u.titular : ''}: declaro, para fins de solicitação de fornecimento de energia elétrica à ${ENERGISA_UN[E.un] || 'distribuidora'}, que a carga instalada da unidade consumidora é de **${f2(r.C)} kW**, com demanda provável de **${f2(r.D)} kVA**, conforme a relação de cargas e o cálculo apresentados neste memorial, e que as instalações internas seguem a ABNT NBR 5410.` }));
  if (E.obs) B.push({ t: 'note', text: E.obs });
  const local = [E.municipio || I.cidade, dataExtenso(I.data)].filter(Boolean).join(', ');
  B.push({ t: 'sign', titular: true, place: local, name: R.length === 1 && R[0].u.titular ? R[0].u.titular : 'Titular / interessado', reg: R.length === 1 && R[0].u.doc ? `CPF/CNPJ ${R[0].u.doc}` : '' });
  B.push({ t: 'sign', place: '', name: I.responsavel || 'Responsável técnico', reg: [I.registro, I.art ? 'ART ' + I.art : ''].filter(Boolean).join(' — ') });
  return B;
}

function memUC(B, r, E, num) {
  const u = r.u, f0 = v => nfmt(v, 0), f1 = v => nfmt(v, 1), f2 = v => nfmt(v, 2), f3 = v => nfmt(v, 3);
  B.push({ t: 'h2', text: `${num} ${u.nome}${u.titular ? ' — ' + u.titular : ''}${u.papel !== 'unidade' ? ' (' + PAPEIS_UC[u.papel].toLowerCase() + ')' : ''}` });
  B.push({ t: 'kv4', rows: [['Classe', CLASSES_UC[u.classe] || u.classe, 'Tabela 5', ATIV_T5[u.atividade]?.nome || '—'], ['Nº instalação', u.instalacao || 'ligação nova', 'Unidade', u.complemento || '—'], ['Atividade', u.atividadeDesc || '—', 'Contato', u.contato || '—']] });
  B.push({ t: 'h3', text: 'a) Relação de cargas instaladas' });
  B.push({ t: 'table', small: true, head: ['Parcela', 'Descrição', 'Qtd.', 'Unitário', 'Total (kW)'], widths: [9, 51, 8, 18, 14], align: 'llrrr',
    rows: r.itens.map(it => [GRUPOS_CARGA[it.g].d, it.desc, String(it.q), it.ref ? `${it.ref}${it.g.startsWith('mot') ? ` (${f2(it.kWu)} kW)` : it.g === 'arj' ? ` (${f0(it.W)} W)` : ''}` : `${f0(it.W)} W`, f3(it.kWt)]).concat([['', 'Carga instalada total (C)', '', '', f3(r.C)]]), lastBold: true });
  B.push({ t: 'h3', text: 'b) Demanda provável' });
  const L = [];
  if (r.Cil > 0) L.push(`d1 = ${r.det.d1.lin.map(l => `${f2(l.kW)} × ${l.fd} %`).join(' + ')}${r.Csim > 0 ? ` + ${f3(r.Csim)} × 100 %` : ''} = ${f3(r.d.d1)} kW   (${ATIV_T5[u.atividade]?.nome}${u.simultaneo ? ', uso simultâneo' : ''}; C = ${f3(r.Cil)} kW)`);
  else if (r.Csim > 0) L.push(`d1 = ${f3(r.Csim)} × 100 % = ${f3(r.d.d1)} kW`);
  [['d2', 6], ['d3', 7], ['d4', 8]].forEach(([d, t]) => { const x = r.det[d]; if (x.n) L.push(`${d} = ${f3(x.P)} kW × ${x.fd} % (${x.n} aparelho${x.n > 1 ? 's' : ''}, Tabela ${t}) = ${f3(r.d[d])} kW`); });
  if (r.det.d5.n || r.det.d5.Pc) L.push(`d5 = ${r.det.d5.n ? `${f3(r.det.d5.P)} kW × ${r.det.d5.fd} % (${r.det.d5.n} aparelho${r.det.d5.n > 1 ? 's' : ''}, Tabela ${r.det.d5.tab})` : '0'}${r.det.d5.Pc ? ` + ${f3(r.det.d5.Pc)} kW (centrais, 100 %)` : ''} = ${f3(r.d.d5)} kW`);
  if (r.det.d6.lin.length) L.push(`d6 = ${r.det.d6.lin.map(l => `${l.it.q} × ${f2(l.kva)} kVA × ${f2(l.cos)}`).join(' + ')} = ${f3(r.d.d6)} kW   (${r.det.d6.nM} motor${r.det.d6.nM > 1 ? 'es' : ''}: coluna "${r.det.d6.colTxt}")`);
  if (r.det.d7.lin.length) L.push(`d7 = ${r.det.d7.lin.map(l => `${f2(l.P)} × ${l.fd} %`).join(' + ')} = ${f3(r.d.d7)} kW`);
  L.push(`d = ${['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].filter(k => r.d[k] > 0).map(k => f3(r.d[k])).join(' + ') || '0'} = ${f3(r.DkW)} kW`);
  L.push(`D = ${f3(r.DkW)} / 0,92 = ${f2(r.D)} kVA   (fator de demanda global d / C = ${f2(r.FDglobal * 100)} %)`);
  B.push({ t: 'eq', lines: L });
  B.push({ t: 'h3', text: 'c) Enquadramento e padrão de entrada' });
  if (r.cat) {
    B.push({ t: 'ver', ok: !r.falhas.length, text: `Tipo ${r.tipo} — categoria ${r.cat.cat} (Tabela ${r.tabCat}): ${r.baseTxt} = ${f2(r.baseVal)} na faixa ${r.padrao.faixa}` });
    const p = r.padrao;
    B.push({ t: 'table', head: ['Item do padrão de entrada', 'Especificação (NDU 001, Tabela ' + r.tabCat + ')'], widths: [34, 66], rows: [
      ['Categoria / tipo de ligação', `${p.cat} — ${p.fios} fios (${p.fases === 1 ? 'fase e neutro' : p.fases === 2 ? 'duas fases e neutro' : 'três fases e neutro'}), ${E.tensao} V`],
      ['Faixa de enquadramento', p.faixa],
      ['Corrente de demanda', `${f1(r.Iproj)} A`],
      ['Disjuntor termomagnético', `${p.disj} A (limite superior da faixa)${r.disjDem ? `; pela demanda de projeto: ${r.disjDem} A (Tabela ${r.tabCat}, nota V)` : ''}`],
      ['Ramal de conexão', p.ramalCon],
      ['Ramal de entrada e de saída', p.ramalEnt],
      ['Eletroduto', `${p.eletro} (${p.sub ? 'subterrâneo' : 'embutido'})`],
      ['Aterramento', `condutor de cobre ${p.aterr} mm² e ${p.hastes} haste${p.hastes > 1 ? 's' : ''} de aço cobreado`],
      ['Poste / pontalete', [p.pConc ? `concreto duplo T ${p.pConc} daN` : '', p.pAco ? `aço galvanizado ${p.pAco} daN` : '', p.pont ? `pontalete ${p.pont} daN` : ''].filter(Boolean).join(' · ') || 'N.A.'],
      ['Caixa de medição', p.caixa]
    ] });
    B.push({ t: 'fig', svg: svgDoc(esquemaEntradaSVG(r, true), 480, 285), ar: 190 / 320, w: 110, caption: `Esquema da entrada de serviço — categoria ${p.cat} (desenho sem escala; detalhes construtivos conforme os desenhos da NDU 001).` });
  }
  r.falhas.forEach(x => B.push({ t: 'ver', ok: false, text: x }));
  r.avisos.forEach(x => B.push({ t: 'note', text: x }));
}

/* ================================================================
   MEMORIAL DESCRITIVO — instalação elétrica de baixa tensão (NBR 5410)
   Influências externas (4.2.6), descrição dos sistemas, especificação
   dos materiais com normas de fabricação e anexos escolhidos.
   ================================================================ */
/* classificação das influências externas — NBR 5410, 4.2.6 (códigos da IEC 60364-5-51) */
const INFLUENCIAS = [
  ['AA', 'Temperatura ambiente', [['AA1', '−60 °C a +5 °C'], ['AA2', '−40 °C a +5 °C'], ['AA3', '−25 °C a +5 °C'], ['AA4', '−5 °C a +40 °C'], ['AA5', '+5 °C a +40 °C'], ['AA6', '+5 °C a +60 °C'], ['AA7', '−25 °C a +55 °C'], ['AA8', '−50 °C a +40 °C']]],
  ['AB', 'Condições climáticas (temperatura e umidade)', [['AB4', 'locais abrigados, sem controle de temperatura e umidade'], ['AB5', 'locais abrigados, com controle de temperatura']]],
  ['AC', 'Altitude', [['AC1', '≤ 2.000 m'], ['AC2', '> 2.000 m']]],
  ['AD', 'Presença de água', [['AD1', 'desprezível'], ['AD2', 'gotejamento'], ['AD3', 'precipitação'], ['AD4', 'aspersão'], ['AD5', 'jatos'], ['AD6', 'ondas'], ['AD7', 'imersão'], ['AD8', 'submersão']]],
  ['AE', 'Presença de corpos sólidos', [['AE1', 'desprezível'], ['AE2', 'pequenos objetos (≥ 2,5 mm)'], ['AE3', 'objetos muito pequenos (≥ 1 mm)'], ['AE4', 'poeira leve'], ['AE5', 'poeira moderada'], ['AE6', 'poeira intensa']]],
  ['AF', 'Presença de substâncias corrosivas ou poluentes', [['AF1', 'desprezível'], ['AF2', 'agentes de origem atmosférica'], ['AF3', 'intermitente ou acidental'], ['AF4', 'permanente']]],
  ['AG', 'Choques mecânicos', [['AG1', 'fracos'], ['AG2', 'médios'], ['AG3', 'severos']]],
  ['AH', 'Vibrações', [['AH1', 'fracas'], ['AH2', 'médias'], ['AH3', 'severas']]],
  ['AK', 'Presença de flora e mofo', [['AK1', 'desprezível'], ['AK2', 'prejudicial']]],
  ['AL', 'Presença de fauna', [['AL1', 'desprezível'], ['AL2', 'prejudicial']]],
  ['AM', 'Influências eletromagnéticas, eletrostáticas ou ionizantes', [['AM', 'níveis normais (sem fontes significativas)'], ['AM*', 'fontes significativas de harmônicas ou de perturbações']]],
  ['AN', 'Radiação solar', [['AN1', 'desprezível'], ['AN2', 'média'], ['AN3', 'alta']]],
  ['AP', 'Efeitos sísmicos', [['AP1', 'desprezíveis'], ['AP2', 'fracos'], ['AP3', 'médios'], ['AP4', 'fortes']]],
  ['AQ', 'Descargas atmosféricas', [['AQ1', 'desprezíveis (≤ 25 dias de trovoada por ano)'], ['AQ2', 'indiretas (> 25 dias por ano; riscos provenientes da rede)'], ['AQ3', 'diretas (partes da instalação expostas)']]],
  ['AR', 'Movimentação do ar', [['AR1', 'desprezível'], ['AR2', 'média'], ['AR3', 'forte']]],
  ['AS', 'Vento', [['AS1', 'desprezível'], ['AS2', 'médio'], ['AS3', 'forte']]],
  ['BA', 'Competência das pessoas', [['BA1', 'comuns'], ['BA2', 'crianças'], ['BA3', 'incapacitadas'], ['BA4', 'advertidas'], ['BA5', 'qualificadas']]],
  ['BB', 'Resistência elétrica do corpo humano', [['BB1', 'alta (condições secas)'], ['BB2', 'normal (condições úmidas)'], ['BB3', 'baixa (condições molhadas)'], ['BB4', 'muito baixa (condições imersas)']]],
  ['BC', 'Contato das pessoas com o potencial de terra', [['BC1', 'nulo'], ['BC2', 'raro'], ['BC3', 'frequente'], ['BC4', 'contínuo']]],
  ['BD', 'Condições de fuga das pessoas em emergências', [['BD1', 'normal (baixa densidade, fuga fácil)'], ['BD2', 'longa (baixa densidade, fuga difícil)'], ['BD3', 'tumultuada (alta densidade, fuga fácil)'], ['BD4', 'longa e tumultuada (alta densidade, fuga difícil)']]],
  ['BE', 'Natureza dos materiais processados ou armazenados', [['BE1', 'riscos desprezíveis'], ['BE2', 'riscos de incêndio'], ['BE3', 'riscos de explosão'], ['BE4', 'riscos de contaminação']]],
  ['CA', 'Materiais de construção', [['CA1', 'não combustíveis'], ['CA2', 'combustíveis']]],
  ['CB', 'Estrutura das edificações', [['CB1', 'riscos desprezíveis'], ['CB2', 'sujeita à propagação de incêndio'], ['CB3', 'sujeita a movimentação'], ['CB4', 'flexível ou instável']]]
];
const INFL = Object.fromEntries(INFLUENCIAS.map(([k, n, cl]) => [k, { nome: n, classes: Object.fromEntries(cl) }]));
const IP_AD = { AD1: 'IPX0', AD2: 'IPX1', AD3: 'IPX3', AD4: 'IPX4', AD5: 'IPX5', AD6: 'IPX6', AD7: 'IPX7', AD8: 'IPX8' };
const IP_AE = { AE1: 'IP2X', AE2: 'IP3X', AE3: 'IP4X', AE4: 'IP5X', AE5: 'IP6X', AE6: 'IP6X' };
function medidaInfluencia(k, cod, P) {
  const normal = 'Condição normal: sem exigências especiais além das regras gerais da norma.';
  switch (k) {
    case 'AA': return cod === 'AA4' || cod === 'AA5' ? `Componentes para temperatura ambiente normal; capacidade de condução corrigida pela Tabela 40 para ${P.tempAmb} °C (ar) e ${P.tempSolo} °C (solo).` : 'Componentes especificados para a faixa de temperatura indicada; capacidade de condução corrigida pela Tabela 40.';
    case 'AB': return 'Componentes para uso interno em locais abrigados; nos locais externos, componentes adequados às intempéries.';
    case 'AC': return cod === 'AC1' ? normal : 'Verificar a redução da capacidade de interrupção e da isolação dos dispositivos acima de 2.000 m.';
    case 'AD': return `Componentes com grau de proteção mínimo ${IP_AD[cod] || 'IPX0'}${cod === 'AD1' ? ' nos locais secos; áreas molhadas tratadas como locais específicos' : ''}.`;
    case 'AE': return `Componentes com grau de proteção mínimo ${IP_AE[cod] || 'IP2X'}.`;
    case 'AF': return cod === 'AF1' ? normal : 'Componentes e linhas com proteção contra corrosão (materiais plásticos, galvanização a fogo) adequada ao agente presente.';
    case 'AG': return cod === 'AG1' ? 'Componentes de uso residencial e comercial; linhas embutidas ou protegidas.' : 'Eletrodutos e invólucros com resistência mecânica reforçada ou proteção mecânica adicional nos trechos expostos.';
    case 'AH': return cod === 'AH1' ? normal : 'Fixações e conexões resistentes a vibração; ligações flexíveis aos equipamentos.';
    case 'AK': case 'AL': return /1$/.test(cod) ? normal : 'Proteção contra a ação de flora, mofo ou fauna (invólucros vedados, materiais resistentes).';
    case 'AM': return cod === 'AM' ? 'Equipamentos em conformidade com as normas de compatibilidade eletromagnética; circuitos de energia separados dos de sinal.' : 'Avaliar harmônicas no dimensionamento do neutro (6.2.6.2) e a compatibilidade eletromagnética dos equipamentos sensíveis.';
    case 'AN': return cod === 'AN1' ? 'Ambientes internos protegidos da radiação solar.' : 'Eletrodutos, cabos e invólucros externos resistentes à radiação ultravioleta.';
    case 'AP': return cod === 'AP1' ? normal : 'Fixações e linhas elétricas adequadas aos esforços sísmicos.';
    case 'AQ': return cod === 'AQ1' ? normal : cod === 'AQ2' ? 'Dispositivos de proteção contra surtos (DPS) na origem da instalação e nos quadros de distribuição (5.4 e 6.3.5).' : 'DPS na origem e nos quadros e sistema de proteção contra descargas atmosféricas conforme a ABNT NBR 5419.';
    case 'AR': case 'AS': return /1$/.test(cod) ? normal : 'Fixações e linhas externas dimensionadas para os esforços do vento e da movimentação do ar.';
    case 'BA': return { BA1: 'Proteção básica por isolação, barreiras e invólucros; proteção supletiva por seccionamento automático; DR de 30 mA nos locais exigidos (5.1.3.2.2).', BA2: 'Tomadas com obturadores (NBR 14136) e componentes fora do alcance de crianças.', BA3: 'Proteção adicional por DR de 30 mA e componentes inacessíveis às pessoas incapacitadas.', BA4: 'Acesso restrito a pessoas advertidas (NR-10).', BA5: 'Acesso restrito a pessoas qualificadas (NR-10).' }[cod];
    case 'BB': return cod === 'BB1' || cod === 'BB2' ? 'Tensão de contato limite UL = 50 V em condições normais.' : 'Tensão de contato limite reduzida (UL = 25 V), DR de 30 mA e equipotencialização suplementar.';
    case 'BC': return 'Todas as massas ligadas ao condutor de proteção; equipotencialização principal no BEP (6.4.2).';
    case 'BD': return cod === 'BD1' ? normal : 'Linhas elétricas não propagantes de chama, livres de halogênio e com baixa emissão de fumaça e gases tóxicos nas rotas de fuga (5.2.2.2).';
    case 'BE': return { BE1: normal, BE2: 'Proteção contra incêndio (5.2.2.3): linhas não propagantes de chama e DR de no máximo 500 mA.', BE3: 'Instalação em atmosfera explosiva conforme a ABNT NBR IEC 60079.', BE4: 'Medidas contra contaminação conforme o processo e as normas aplicáveis.' }[cod];
    case 'CA': return cod === 'CA1' ? normal : 'Componentes embutidos em material combustível com invólucros e eletrodutos adequados (5.2.2.4).';
    case 'CB': return { CB1: normal, CB2: 'Barreiras corta-fogo nas travessias de paredes e pisos pelas linhas elétricas.', CB3: 'Juntas de dilatação e trechos flexíveis nas transições estruturais.', CB4: 'Linhas elétricas flexíveis e fixações adequadas à movimentação da estrutura.' }[cod];
  }
  return '';
}
function influenciasPadrao(edif = 'residencial') {
  const base = { AA: 'AA4', AB: 'AB4', AC: 'AC1', AD: 'AD1', AE: 'AE1', AF: 'AF1', AG: 'AG1', AH: 'AH1', AK: 'AK1', AL: 'AL1', AM: 'AM', AN: 'AN1', AP: 'AP1', AQ: 'AQ2', AR: 'AR1', AS: 'AS1', BA: 'BA1', BB: 'BB1', BC: 'BC2', BD: 'BD1', BE: 'BE1', CA: 'CA1', CB: 'CB1' };
  if (edif === 'industrial') Object.assign(base, { AE: 'AE4', AG: 'AG2', AH: 'AH2', AM: 'AM*', BA: 'BA4', BC: 'BC3' });
  if (edif === 'publica') Object.assign(base, { BD: 'BD3' });
  return base;
}
function locaisPadrao(edif = 'residencial') {
  const L = [
    ['Banheiros — locais com banheira ou chuveiro (NBR 5410, 9.1)', 'AD3/AD4, BB3', 'Circuitos protegidos por DR de 30 mA; tomadas somente fora dos volumes 0, 1 e 2; chuveiro em circuito exclusivo com condutor de proteção; equipotencialização suplementar.'],
    ['Cozinha, copa, área de serviço e lavanderia', 'AD2/AD3, BB2', 'Tomadas protegidas por DR de 30 mA (5.1.3.2.2); TUG e TUE em circuitos independentes.'],
    ['Áreas externas, garagem e quintal', 'AD3/AD4, AN2, AG2', 'Componentes com grau de proteção IPX4 ou superior; eletrodutos e cabos resistentes à radiação UV; DR de 30 mA nas tomadas externas.'],
    ['Quadros de distribuição e de medição', 'BA1', 'Quadros com espelho e porta, identificação dos circuitos, em local de fácil acesso e livre de obstáculos (6.5.4).']
  ];
  if (edif !== 'residencial') L.splice(0, 2, ['Sanitários e copas', 'AD2/AD3, BB2', 'Tomadas protegidas por DR de 30 mA; componentes com grau de proteção adequado às lavagens.']);
  return L.map(([local, infl, medidas]) => ({ local, infl, medidas }));
}
function descritivoPadrao(edif = 'residencial') {
  return { uso: '', area: null, pavimentos: 1, padraoLocal: 'no limite do lote com a via pública, conforme a norma da distribuidora', ramal: 'aereo', descricao: '', consideracoes: '', influencias: influenciasPadrao(edif), locais: locaisPadrao(edif) };
}

/* lista de normas sem repetições: "NBR x" e "ABNT NBR x" são a mesma; "NDU 001" está contida em "NDU 001 v7.0" */
function normasUnicas(lista) {
  const chave = t => t.replace(/^ABNT\s+/, '').replace(/\s*\(.*\)$/, '').trim();
  const toks = lista.filter(Boolean).flatMap(x => x.split(/\s*[;\/]\s*(?=(?:ABNT|NBR|IEC|Energisa|Inmetro|Conforme))/)).map(t => t.trim()).filter(Boolean)
    .map(t => /^NBR/.test(t) ? 'ABNT ' + t : t);
  const vistos = new Map();
  toks.forEach(t => { const k = chave(t); if (![...vistos.keys()].some(v => v === k || v.startsWith(k + ' '))) { [...vistos.keys()].filter(v => k.startsWith(v + ' ')).forEach(v => vistos.delete(v)); vistos.set(k, t); } });
  return [...vistos.values()];
}

/* partes anexadas (memórias de cálculo e lista de materiais) com rótulo ANEXO ou PARTE */
function anexarPartes(B, partes, rotulo, proj, calc, opt) {
  partes.forEach((p, i) => {
    const L = String.fromCharCode(65 + i);
    B.push({ t: 'break' });
    B.push({ t: 'parte', rotulo, letra: L, text: p.nome, sub: normaDe(p, proj) });
    p.build(proj, calc, { ...opt, assinatura: false }).forEach(b => {
      if (b.t === 'title' || b.t === 'meta' || (b.t === 'sign' && !b.titular)) return;
      B.push(b.t === 'h1' || b.t === 'h2' || b.t === 'h3' ? { ...b, text: prefixoParte(b.text, L) } : b);
    });
  });
}

function construirMemorialDescritivo(proj, calc, ids, opt = {}) {
  const I = proj.info, P = proj.params, D = proj.descritivo || descritivoPadrao(P.edificacao), R = calc.res, C = proj.circuitos, B = [];
  const cm = calc.materiais || calcMateriais(proj, calc);
  const anexos = MEMORIAS.filter(m => (ids || []).includes(m.id) && m.tem(proj, calc));
  const letra = id => { const i = anexos.findIndex(m => m.id === id); return i < 0 ? null : String.fromCharCode(65 + i); };
  const refA = id => letra(id) ? ` (Anexo ${letra(id)})` : '';
  const f0 = v => nfmt(v, 0), f1 = v => nfmt(v, 1), f2 = v => nfmt(v, 2);
  const temL = (proj.lumi || []).length + (proj.lumiExt || []).length > 0, temK = proj.clima.amb.length > 0, temE = (proj.energisa.ucs || []).length > 0, temT = (proj.aterr.arr || []).some(a => calc.aterr && !calc.aterr.arr[a.id].excluido);
  B.push({ t: 'title', kicker: 'ABNT NBR 5410:2004 — Instalações elétricas de baixa tensão', text: 'Memorial descritivo', sub: 'Projeto das instalações elétricas de baixa tensão — descrição da instalação, influências externas, critérios de projeto, especificação dos materiais e anexos' });
  B.push({ t: 'meta', rows: [['Obra', I.obra || '—'], ['Proprietário / cliente', I.cliente || '—'], ['Endereço', [I.endereco, I.cidade].filter(Boolean).join(' — ') || '—'],
    ['Uso / área / pavimentos', [D.uso || EDIFICACAO[P.edificacao], +D.area > 0 ? `${f2(+D.area)} m²` : '', +D.pavimentos > 0 ? `${D.pavimentos} pavimento(s)` : ''].filter(Boolean).join(' — ')],
    ['Responsável técnico', [I.responsavel, I.registro].filter(Boolean).join(' — ') || '—'], ['ART / TRT / RRT', I.art || '—'], ['Data / revisão', `${dataCurta(I.data) || '—'} — ${I.revisao || 'R00'}`]] });
  let n = 0; const sec = t => { n++; B.push({ t: 'h1', text: `${n}. ${t}` }); return n; };

  sec('Objetivo e escopo');
  B.push({ t: 'p', text: `Este memorial descreve o projeto das instalações elétricas de baixa tensão da obra acima identificada, elaborado segundo a ABNT NBR 5410:2004 (versão corrigida 2008) e as normas complementares relacionadas. Compreende a entrada de energia, os quadros de distribuição, os circuitos terminais de iluminação, tomadas e equipamentos, as linhas elétricas, os dispositivos de proteção${temL ? ', a iluminação' : ''}${temK ? ', a alimentação da climatização' : ''} e o aterramento e a equipotencialização.` });
  if (anexos.length) B.push({ t: 'p', text: `Integram este memorial, como anexos, ${anexos.length === 1 ? 'o documento' : `os ${anexos.length} documentos`} relacionados na seção de anexos, que contêm os cálculos e os quantitativos que fundamentam as especificações aqui descritas.` });
  if (D.descricao) B.push({ t: 'p', text: D.descricao });

  sec('Normas e documentos de referência');
  B.push({ t: 'list', items: [
    'ABNT NBR 5410:2004 Versão Corrigida:2008 — Instalações elétricas de baixa tensão.',
    ...(P.origem === 'trafo' ? ['ABNT NBR 14039 — Instalações elétricas de média tensão de 1,0 kV a 36,2 kV.'] : []),
    ...(temE ? ['Energisa NDU 001 v7.0 — Fornecimento de energia elétrica em tensão secundária' + (proj.energisa.modo !== 'individual' ? '; NDU 003 v8.1 — edificações de uso coletivo.' : '.')] : (I.concessionaria ? [I.concessionaria + '.'] : [])),
    ...(temL ? ['ABNT NBR ISO/CIE 8995-1:2013 — Iluminação de ambientes de trabalho — Parte 1: Interior.'] : []),
    ...(temK ? ['ABNT NBR 16401-1:2024 e NBR 16401-2:2024 — Instalações de ar-condicionado.'] : []),
    ...(temT ? ['ABNT NBR 15749:2009 — Medição de resistência de aterramento; ABNT NBR 7117-1:2020 — Resistividade do solo.'] : []),
    ...(P.edificacao === 'publica' ? ['ABNT NBR 13570 — Instalações elétricas em locais de afluência de público.'] : []),
    proj.spda && proj.spda.ativo ? 'ABNT NBR 5419-1 a 5419-4:2026 — Proteção contra descargas atmosféricas.' : 'ABNT NBR 5419 (partes 1 a 4) — Proteção contra descargas atmosféricas (quando aplicável).',
    'NR-10 — Segurança em instalações e serviços em eletricidade (Ministério do Trabalho e Emprego).',
    'Normas de fabricação dos materiais, relacionadas na seção de especificação dos materiais.'
  ] });

  const sC = sec('Caracterização da obra e da instalação');
  const aterrTxt = { 'TN-S': 'TN-S — neutro e condutor de proteção separados em toda a instalação', 'TN-C-S': 'TN-C-S — neutro e proteção combinados no ramal (PEN) e separados a partir do quadro', 'TT': 'TT — massas ligadas a eletrodo de aterramento independente do neutro' }[P.aterramento] || P.aterramento;
  const qd = Object.values(calc.quadros).filter(q => q.cs.length), Pinst = C.filter(c => c.tipo !== 'dist').reduce((s, c) => s + (R[c.id].P || 0), 0);
  const uc = temE && calc.energisa ? Object.values(calc.energisa.ucs)[0] : null;
  B.push({ t: 'table', head: ['Item', 'Descrição'], widths: [34, 66], rows: [
    ['Tipo de edificação', `${EDIFICACAO[P.edificacao]}${D.uso ? ' — ' + D.uso : ''}`],
    ...(+D.area > 0 ? [['Área construída', `${f2(+D.area)} m²${+D.pavimentos > 0 ? ` em ${D.pavimentos} pavimento(s)` : ''}`]] : []),
    ['Sistema de alimentação', `${{ monofasico: 'monofásico', bifasico: 'bifásico', trifasico: 'trifásico' }[P.fornecimento]}, ${P.U0}/${P.U} V, 60 Hz`],
    ['Origem da instalação', { entrega: 'ponto de entrega em tensão secundária de distribuição', trafo: 'terminais secundários do transformador MT/BT próprio', gerador: 'grupo gerador próprio' }[P.origem]],
    ['Esquema de aterramento', aterrTxt],
    ['Carga instalada (circuitos terminais)', `${f0(Pinst)} W`],
    ...(uc ? [['Demanda e categoria (Energisa)', `${f2(uc.D)} kVA — categoria ${uc.cat.cat}${refA('energisa')}`]] : []),
    ['Quadros de distribuição', `${qd.length} — ${qd.map(q => q.q).join(', ')}`],
    ['Circuitos', `${C.length} (${C.filter(c => c.tipo !== 'dist').length} terminais e ${C.filter(c => c.tipo === 'dist').length} alimentador(es))`]
  ] });

  const sI = sec('Influências externas');
  B.push({ t: 'p', text: 'As influências externas foram classificadas segundo 4.2.6 da ABNT NBR 5410, e os componentes e as linhas elétricas foram selecionados para atendê-las (seção 5.2 e capítulo 6). Classificação adotada para a edificação em geral:' });
  const inf = { ...influenciasPadrao(P.edificacao), ...(D.influencias || {}) };
  B.push({ t: 'table', small: true, head: ['Código', 'Influência externa', 'Classe adotada', 'Medidas no projeto'], widths: [9, 25, 24, 42], align: 'llll',
    rows: INFLUENCIAS.map(([k, nome]) => { const cod = inf[k]; const txt = (D.medidas || {})[k] || medidaInfluencia(k, cod, P); return [cod.replace('*', ''), nome, INFL[k].classes[cod] || '—', txt]; }) });
  const locais = (D.locais || []).filter(l => l.local);
  if (locais.length) {
    B.push({ t: 'h3', text: `${sI}.1 Locais com influências específicas` });
    B.push({ t: 'table', small: true, head: ['Local', 'Influências', 'Medidas adotadas'], widths: [28, 16, 56], align: 'lll', rows: locais.map(l => [l.local, l.infl || '—', l.medidas || '—']) });
  }

  const sK = sec('Critérios de projeto');
  B.push({ t: 'list', items: [
    `Proteção contra choques elétricos (5.1): proteção básica por isolação e invólucros; proteção supletiva por seccionamento automático da alimentação no esquema ${P.aterramento}; proteção adicional por dispositivos DR de alta sensibilidade (30 mA) nos circuitos exigidos por 5.1.3.2.2.`,
    'Proteção contra sobrecorrentes (5.3 e 6.3.4): coordenação IB ≤ In ≤ Iz e I2 ≤ 1,45 Iz; verificação da capacidade de interrupção e da suportabilidade térmica dos condutores ao curto-circuito.',
    `Queda de tensão (6.2.7): até ${f1(P.dvTotal)} % do ponto de entrega ao ponto de utilização, com no máximo 4 % nos circuitos terminais.`,
    'Seções mínimas (6.2.6): 1,5 mm² nos circuitos de iluminação e 2,5 mm² nos circuitos de força e tomadas (cobre); neutro e condutor de proteção conforme 6.2.6.2 e Tabela 58.',
    ...(P.edificacao === 'residencial' ? ['Previsão de cargas e divisão de circuitos em locais de habitação (9.5): iluminação e tomadas em circuitos distintos; equipamentos com corrente nominal superior a 10 A em circuitos independentes; cozinha, copa e área de serviço com circuitos de tomadas exclusivos.'] : []),
    'Proteção contra sobretensões (5.4 e 6.3.5): DPS na origem da instalação e nos quadros, com nível de proteção compatível com a suportabilidade a impulso dos equipamentos.',
    'Quadros de distribuição com espaço de reserva conforme a Tabela 59 (6.5.4.7) e identificação de todos os circuitos.',
    `Detalhamento dos cálculos de condutores, proteção e quedas de tensão na memória de cálculo${refA('circuitos')}.`
  ] });

  const sD = sec('Descrição das instalações');
  let k = 0; const sub = t => { k++; B.push({ t: 'h2', text: `${sD}.${k} ${t}` }); };
  sub('Entrada de energia e medição');
  if (uc && uc.padrao) {
    const pd = uc.padrao;
    B.push({ t: 'p', text: `O fornecimento será feito pela ${ENERGISA_UN[proj.energisa.un] || 'distribuidora'} em tensão secundária ${proj.energisa.tensao} V, com padrão de entrada da categoria ${pd.cat} (${pd.faixa}), ${pd.fios} fios. Ramal de ligação: ${pd.ramalCon}. Ramal de entrada: ${pd.ramalEnt}, em eletroduto de ${pd.eletro}. Proteção geral por disjuntor de ${pd.disj} A e medição em caixa ${pd.caixa}, instalada ${D.padraoLocal || 'conforme a norma da distribuidora'}. Aterramento do neutro com ${pd.hastes} haste(s) e condutor de ${pd.aterr} mm²${refA('energisa')}.` });
  } else B.push({ t: 'p', text: `O fornecimento será feito em tensão secundária ${P.U0}/${P.U} V pela distribuidora local, com padrão de entrada conforme a norma de fornecimento vigente, instalado ${D.padraoLocal || 'conforme a norma da distribuidora'}.` });
  sub('Quadros de distribuição');
  B.push({ t: 'p', text: `Os quadros de distribuição recebem os dispositivos de proteção dos circuitos, os dispositivos DR e os DPS, com barramentos independentes de neutro e de proteção${letra('diagramas') ? `, conforme os diagramas unifilares e multifilares do Anexo ${letra('diagramas')}` : ''}. Relação dos quadros:` });
  B.push({ t: 'table', small: true, head: ['Quadro', 'Descrição', 'Circuitos', 'Demanda (VA)', 'Alimentação'], widths: [10, 26, 10, 14, 40], align: 'llrrl',
    rows: qd.map(q => { const a = q.alim, ra = a && R[a.id]; return [q.q, (proj.quadros[q.q] || {}).desc || '—', String(q.cs.length), f0(q.dem.S), a ? `Circuito ${a.num}: ${condutoresTxt(ra)}, ${protecaoTxt(a, ra)}` : 'Origem da instalação / ponto de entrega']; }) });
  sub('Circuitos terminais');
  const tipos = Object.keys(TIPOS).filter(t => t !== 'dist' && C.some(c => c.tipo === t));
  B.push({ t: 'table', small: true, head: ['Tipo de circuito', 'Quantidade', 'Potência (W)', 'Seções (mm²)', 'Proteção'], widths: [34, 12, 14, 16, 24], align: 'lrrll',
    rows: tipos.map(t => { const cs = C.filter(c => c.tipo === t), sec2 = [...new Set(cs.map(c => R[c.id].Sf))].sort((a, b) => a - b), ins = [...new Set(cs.map(c => R[c.id].In))].sort((a, b) => a - b); return [TIPOS[t], String(cs.length), f0(cs.reduce((s, c) => s + R[c.id].P, 0)), sec2.map(fS).join(', '), `${ins.join(', ')} A`]; }) });
  const comDR = C.filter(c => R[c.id].drUsado);
  if (comDR.length) B.push({ t: 'p', text: `Circuitos com proteção diferencial-residual: ${comDR.map(c => c.num).join(', ')}.` });
  sub('Linhas elétricas');
  const mets = [...new Set(C.map(c => c.metodo))].map(id => MET[id]).filter(Boolean);
  const dutos = [...new Set(Object.values(calc.trechos).filter(t => t.aplica && t.esc).map(t => `${t.esc.nome} (${t.esc.norma})`))];
  B.push({ t: 'list', items: [
    ...mets.map(m => `Maneira de instalar nº ${m.id} da Tabela 33 — ${m.desc.charAt(0).toLowerCase() + m.desc.slice(1)} (método ${m.ref === 'EF' ? 'E/F' : m.ref}).`),
    ...(dutos.length ? [`Eletrodutos: ${dutos.join('; ')}, com diâmetros conforme a taxa de ocupação de 6.2.11.1.6${refA('eletrodutos')}.`] : []),
    ...(Object.keys(calc.calhas || {}).length ? [`Eletrocalhas, perfilados ou leitos conforme a NBR IEC 61537, dimensionados pela ocupação e pela carga dos cabos${refA('calhas')}.`] : []),
    'Condutores identificados por cores (6.1.5.3): neutro azul-claro, proteção verde-amarelo ou verde, fases em preto, vermelho e branco. Não é permitida emenda de condutores no interior de eletrodutos.'
  ] });
  if (temL) {
    const LI = proj.lumi || [], LX = proj.lumiExt || [], RX = calc.lumiExt || {};
    const N = LI.reduce((s, a) => s + calc.lumi[a.id].N, 0), Pl = LI.reduce((s, a) => s + calc.lumi[a.id].P, 0);
    sub('Iluminação');
    if (LI.length) B.push({ t: 'p', text: `Iluminação de ${LI.length} ambiente(s) interno(s) dimensionada pela ABNT NBR ISO/CIE 8995-1 (iluminância mantida, UGR, Ra e uniformidade), com ${N} luminária(s) LED e potência total de ${f0(Pl)} W${refA('lumi')}.` });
    if (LX.length) {
      const Nx = LX.reduce((s, a) => s + RX[a.id].N, 0), Px = LX.reduce((s, a) => s + RX[a.id].P, 0), Npo = LX.reduce((s, a) => s + RX[a.id].nPostes, 0);
      const cx = [...new Set(LX.map(a => a.circuito).filter(Boolean))].map(id => calc.res[id]).filter(Boolean), comDR = cx.length > 0 && cx.every(r => r.drUsado);
      B.push({ t: 'p', text: `Iluminação externa de ${LX.length} área(s) (${LX.map(a => a.nome).join(', ')}) com ${Nx} projetor(es) ou luminária(s) LED em ${Npo} poste(s), potência total de ${f0(Px)} W, dimensionada pelo método dos lúmens e verificada ponto a ponto quanto à iluminância média e à uniformidade, com níveis da ABNT NBR 5101 e da EN 12464-2${refA('lumi')}. Os equipamentos externos têm grau de proteção mínimo IP65, os postes são ligados ao condutor de proteção, ${comDR ? 'os circuitos de iluminação externa são protegidos por dispositivo DR de 30 mA' : 'recomenda-se proteger os circuitos de iluminação externa por dispositivo DR de 30 mA'} e o comando é feito por relé fotoelétrico ou temporizador.` });
    }
  }
  if (temK) {
    const eq = proj.clima.amb.map(a => calc.clima.amb[a.id]).filter(Boolean);
    sub('Climatização');
    B.push({ t: 'p', text: `Previsão de ${eq.reduce((s, r) => s + r.equip.n, 0)} condicionador(es) de ar, com capacidade total de ${f0(eq.reduce((s, r) => s + r.equip.n * r.equip.cap, 0))} BTU/h, definidos pelo cálculo de carga térmica da ABNT NBR 16401${refA('clima')}. Cada equipamento é alimentado por circuito exclusivo com condutor de proteção.` });
  }
  sub('Aterramento e equipotencialização');
  const sis = temT ? proj.aterr.arr.filter(a => !calc.aterr.arr[a.id].excluido) : [];
  B.push({ t: 'p', text: `Esquema de aterramento ${P.aterramento}. Todas as massas e os pontos de utilização são ligados ao condutor de proteção, que acompanha todos os circuitos. O barramento de equipotencialização principal (BEP), junto ao quadro geral, interliga o condutor de aterramento, os condutores de proteção, as tubulações metálicas e os demais elementos condutivos da edificação (6.4.2).${sis.length ? ' Eletrodos de aterramento: ' + sis.map(a => `${a.nome} — ${geomArranjoTxt(a, calc.aterr.arr[a.id])}, R = ${f2(calc.aterr.arr[a.id].R)} Ω`).join('; ') + refA('aterr') + '.' : ''}` });
  const cs = calc.spda && calc.spda.ativo ? calc.spda : null, ps = cs && cs.projeto;
  if (cs) {
    sub('Proteção contra descargas atmosféricas (SPDA)');
    B.push({ t: 'p', text: `A análise de risco pela ABNT NBR 5419-2:2026 resultou em R1 = ${nfmt(cs.risco.R1 * 1e5, 2)} × 10⁻⁵ com as medidas adotadas (tolerável 1 × 10⁻⁵)${cs.npMin === 'nenhum' ? ', sem exigência de SPDA' : cs.npMin ? `, com exigência mínima de SPDA NP ${cs.npMin}` : ''}${refA('spda')}. ${ps ? `Adotado SPDA ${NP_TXT[cs.npAdot]}${cs.opcional ? ' por opção do projeto' : ''}: captação ${ps.mastros ? `por ${ps.mx * ps.my} captor(es) Franklin` : `em malha de até ${ps.malha} × ${ps.malha} m`}, ${ps.nDesc} descidas${ps.nAneis ? `, ${ps.nAneis} anel(éis) intermediário(s)` : ''} e anel de aterramento de ${nfmt(ps.Lanel, 0)} m (arranjo B), interligado ao BEP e ao aterramento da instalação elétrica.` : 'Não é instalado SPDA.'}` });
  }
  sub('Proteção contra surtos');
  const qdps = calc.dps ? Object.values(calc.dps.quadros).filter(r => r.ativo) : [];
  B.push({ t: 'p', text: `Previstos dispositivos de proteção contra surtos (DPS) na origem da instalação e nos quadros de distribuição, ligados entre os condutores vivos e o barramento de proteção, com condutores de ligação curtos e retilíneos (6.3.5)${inf.AQ === 'AQ1' ? '' : ', em razão da classificação ' + inf.AQ + ' quanto a descargas atmosféricas'}${ps ? `; no quadro de entrada, DPS classe I+II compatíveis com o nível de proteção do SPDA (NBR 5419-4)` : ''}${refA('dps')}.` });
  if (qdps.length) B.push({ t: 'list', items: qdps.map(r => `${r.q}: ${r.spec}; condutores de ligação de ${fS(r.S)} mm² Cu com até ${nfmt(r.L, 2)} m.`) });

  const sM = sec('Especificação dos materiais e normas de fabricação');
  B.push({ t: 'p', text: `Os materiais devem ser novos, de primeira qualidade, com certificação de conformidade do Inmetro quando compulsória, e atender às normas de fabricação indicadas. ${cm.lista.length ? `Os quantitativos constam da lista de materiais${refA('materiais')}.` : ''}` });
  const cats = cm.porCat.length ? cm.porCat : ['cond', 'prot', 'quad', 'dutos', 'caixas', 'disp', 'aterr'].map(c => ({ cat: c, ...CAT_MAT[c], itens: [] }));
  cats.forEach((g, i) => {
    B.push({ t: 'h3', text: `${sM}.${i + 1} ${g.nome}` });
    B.push({ t: 'p', text: g.espec });
    B.push({ t: 'note', text: 'Normas de fabricação: ' + normasUnicas([g.normas, ...g.itens.map(x => x.norma)]).join('; ') + '.' });
  });

  sec('Execução, inspeção, ensaios e documentação');
  B.push({ t: 'list', items: [
    'Os serviços devem ser executados por profissionais habilitados e capacitados, com observância da NR-10 e das recomendações dos fabricantes.',
    'Concluída a instalação, realizar a verificação final (seção 7): inspeção visual e ensaios de continuidade dos condutores de proteção e das ligações equipotenciais, resistência de isolamento, seccionamento automático da alimentação, funcionamento dos dispositivos DR e polaridade' + (temT ? ', além da medição da resistência de aterramento (NBR 15749).' : '.'),
    'Identificar os circuitos nos quadros e manter junto ao quadro geral o diagrama unifilar atualizado; entregar ao proprietário a documentação da instalação "como construído" (6.1.8).',
    'Realizar a manutenção e as verificações periódicas previstas na seção 8 da NBR 5410.',
    ...(D.consideracoes ? [D.consideracoes] : [])
  ] });

  if (anexos.length) {
    sec('Anexos');
    B.push({ t: 'table', head: ['Anexo', 'Documento', 'Referência normativa'], widths: [10, 50, 40], align: 'lll', rows: anexos.map((m, i) => [String.fromCharCode(65 + i), m.titulo, normaDe(m, proj)]) });
  }
  if (opt.assinatura !== false) B.push(assinaturaRT(I));
  anexarPartes(B, anexos, 'ANEXO', proj, calc, opt);
  return B;
}

function construirListaMateriais(proj, calc, opt = {}) {
  const I = proj.info, M = proj.materiais || materiaisPadrao(), cm = calc.materiais || calcMateriais(proj, calc), B = [];
  B.push({ t: 'title', kicker: 'Projeto de instalações elétricas de baixa tensão', text: 'Lista de materiais', sub: 'Quantitativo dos materiais elétricos com especificação e norma de fabricação' });
  B.push({ t: 'meta', rows: [['Obra', I.obra || '—'], ['Endereço', [I.endereco, I.cidade].filter(Boolean).join(' — ') || '—'], ['Responsável técnico', [I.responsavel, I.registro].filter(Boolean).join(' — ') || '—'], ['Data / revisão', `${dataCurta(I.data) || '—'} — ${I.revisao || 'R00'}`]] });
  B.push({ t: 'p', text: `Quantitativo composto pelos itens levantados automaticamente a partir do projeto (condutores, proteção, quadros, eletrodutos, eletrocalhas, iluminação e aterramento) e pelos itens escolhidos no cadastro de materiais. Comprimentos de condutores com acréscimo de ${nfmt(+M.reservaCabo || 0, 0)} % e de eletrodutos e eletrocalhas com acréscimo de ${nfmt(+M.reservaDuto || 0, 0)} % para curvas, conexões e sobras.` });
  let item = 0;
  cm.porCat.forEach((g, i) => {
    B.push({ t: 'h2', text: `${i + 1} ${g.nome}` });
    B.push({ t: 'table', small: true, head: ['Item', 'Descrição / especificação', 'Norma de fabricação', 'Fabricante / ref.', 'Unid.', 'Qtd.'], widths: [7, 45, 20, 12, 7, 9], align: 'lllllr',
      rows: g.itens.map(x => [String(++item), x.desc, x.norma || '—', x.fab || '—', x.un, x.un === 'm' ? nfmt(x.qtd, 0) : nfmt(x.qtd, x.qtd % 1 ? 1 : 0)]) });
  });
  if (!cm.lista.length) B.push({ t: 'p', text: 'Nenhum material com quantidade definida.' });
  B.push({ t: 'note', text: 'Quantidades de projeto: confirmar no levantamento executivo. Fabricantes e referências indicados admitem similares técnicos equivalentes, com a mesma norma de fabricação e certificação.' });
  if (opt.assinatura !== false) B.push(assinaturaRT(I));
  return B;
}

/* ================================================================
   DPS — memória de cálculo da proteção contra surtos
   ================================================================ */
const VER_DPS = { ok: true, fail: false, warn: false };
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
    'ABNT NBR IEC 61643-11 — Dispositivos de proteção contra surtos de baixa tensão — Requisitos e métodos de ensaio.', 'IEC 61643-12 — Seleção e princípios de aplicação de DPS (coordenação); IEC 62305-4 — nível de proteção efetivo e distância de proteção (Anexo D).',
    'Siemens — Dispositivos de proteção contra surtos DPS 5SD7, catálogo (edição 2021): nível de exposição F, seção dos condutores de ligação pela proteção a montante e distância de proteção.',
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
    'Classe: I+II no ponto de entrada quando a estrutura tem SPDA (descargas diretas); II nos quadros de distribuição (descargas indiretas e manobras); III junto a equipamentos sensíveis quando o nível de proteção efetivo ou a distância excedem o que o DPS do quadro protege.',
    'Tensão de operação contínua (Tabela 49): Uc ≥ 1,1 × U0 nos modos das fases e Uc ≥ U0 no modo neutro–PE. Modos pela Figura 13: neutro aterrado no BEP — DPS só nas fases (esquema 1); TN-S — fases e neutro ao PE (esquema 2); TT a montante do DR — fases ao neutro e centelhador N–PE (esquema 3).',
    c.metodo === 'F' ? `Corrente nominal dos DPS classe II pelo nível de exposição F = Td × (1,6 + 2 × LBT + δ), com LBT em km (até 0,5) e δ pela situação da linha: F ≤ 40 → In 5 kA; 40 < F ≤ 80 → In 10 kA; F > 80 → In 20 kA (catálogo Siemens); Imáx ≈ 2 × In; mínimo de 5 kA da NBR 5410.`
      : `Corrente nominal dos DPS classe II pela exposição, segundo as faixas usuais dos fabricantes: Imáx de ${EXPO_DPS.baixa[0]} kA (baixa), ${EXPO_DPS.media[0]} kA (média) ou ${EXPO_DPS.alta[0]} kA (alta), com In ≈ Imáx / 2 e mínimo de 5 kA da NBR 5410.`,
    'Corrente de impulso dos DPS classe I+II: Iimp ≥ 12,5 kA por modo (10/350 µs) ou o valor do nível de proteção do SPDA; na ligação n+1, o centelhador N–PE com a soma das correntes. Centelhadores: corrente subsequente interrompida Ifi ≥ curto-circuito presumido; N–PE com Ifi ≥ 100 A (NBR 5410).',
    'Nível de proteção: Up ≤ suportabilidade da categoria II (Tabela 31); nível efetivo Up/f = Up + ΔU para varistores e Up/f = máx(Up; ΔU) para centelhadores, com ΔU ≈ 1 kV por metro de condutor de ligação para DPS classe I e desprezível para classe II ou ligação em V (IEC 62305-4).',
    c.critDist === 'fab' ? `Distância de proteção: ${D_PROT_FAB} m entre o DPS do quadro e o equipamento, medidos pelo circuito; acima disso, DPS complementar junto ao equipamento (prática de fabricante, catálogo Siemens).`
      : `Distância de proteção por oscilação: lpo = (Uw − Up/f) / ${K_OSC} V/m; circuitos terminais mais longos que lpo pedem DPS classe III junto aos equipamentos, salvo quando o circuito tem menos de 10 m ou Up/f < Uw/2 (IEC 62305-4, Anexo D).`,
    'Condutores de ligação: comprimento total até 0,5 m (condutor vivo → DPS → barramento PE), ou ligação em V (série) quando maior; seção mínima de 4 mm² Cu, ou 16 mm² Cu para DPS classe I / estrutura com SPDA (NBR 5410), e não inferior à indicada pelo fabricante para a proteção a montante, que define a corrente de curto-circuito a suportar (catálogo Siemens).',
    'Proteção de retaguarda: a corrente máxima indicada pelo fabricante; se a proteção a montante for maior, fusível ou disjuntor dedicado no ramal do DPS com o valor indicado — valores menores podem romper com surtos abaixo dos nominais do DPS. Isccr do DPS ≥ curto-circuito presumido no quadro.',
    `Coordenação entre estágios: produtos declarados coordenados pelo fabricante ou pelo menos ${D_COORD} m de cabo entre eles (IEC 61643-12, informativo), ou indutor de desacoplamento.`,
    `DPS a jusante de DR: o DR, instantâneo ou temporizado, deve ter imunidade a correntes de surto de no mínimo ${IMUN_DR} kA (8/20 µs); DR tipo S recomendado.`] });
  const sQ = sec('Seleção por quadro');
  Q.forEach((r, i) => {
    B.push({ t: 'h2', text: `${sQ}.${i + 1} Quadro ${r.q}${r.desc ? ' — ' + r.desc : ''}` });
    B.push({ t: 'kv4', rows: [['Posição', r.origem ? 'Ponto de entrada (origem)' : 'Quadro de distribuição', 'Classe', r.classe], ['Ligação', r.ligTxt, 'Uc', `${r.Uc} V${r.semNPE ? '' : ` (N–PE ${r.UcN} V)`}`],
      ...(r.classe === 'I+II' ? [['Tecnologia', TEC_DPS[r.tec], 'Ligação dos condutores', r.emV ? 'em V — série (ΔU desprezível)' : 'em T — paralelo']] : []),
      ['Correntes', r.classe === 'I+II' ? `Iimp ${f2(r.Iimp)} kA (10/350 µs) por modo${r.lig === 'npe' ? `; N–PE ${f1(r.IimpNPE)} kA` : ''}; In ${nfmt(r.In, 0)} kA` : `In ${nfmt(r.In, 0)} kA; Imáx ${r.Imax} kA (8/20 µs)`, 'Nível de proteção', `Up ≤ ${f2(r.Up)} kV; Up/f = ${f2(r.Upf)} kV${r.UpPE != null ? `; fase–PE ${f2(r.UpPE)} kV` : ''}`],
      ['Condutores de ligação', `${f2(r.L)} m · ${fS(r.S)} mm² Cu`, 'Proteção a montante', r.Imont ? `${r.Imont} A${r.F2 ? ` · retaguarda F2 de ${r.F2} A` : ''}` : 'não informada'],
      ['Retaguarda do fabricante', r.back ? `até ${r.back} A` : 'conforme o fabricante', 'Distância de proteção', r.soDist ? 'quadro só de distribuição' : r.distDispensa ? 'dispensada (Up/f < Uw/2)' : c.critDist === 'fab' ? `${D_PROT_FAB} m (fabricante)` : `lpo = ${f1(r.dProt)} m`]] });
    r.verifs.forEach(([st, t]) => B.push(st === 'info' ? { t: 'note', text: t } : { t: 'ver', ok: VER_DPS[st], text: t }));
  });
  sec('Classe III e coordenação');
  const longe = Q.filter(r => r.foraDist && r.foraDist.length).map(r => `${r.q} (circuitos ${r.foraDist.join(', ')}; distância de proteção ${f1(r.dProt)} m)`);
  B.push({ t: 'p', text: (c.classe3 ? `Previstos ${c.classe3.n} DPS classe III (Uc ${c.classe3.Uc} V) junto aos equipamentos sensíveis, coordenados com os DPS do quadro que os alimenta.` : 'Não foram indicados pontos com equipamentos sensíveis que exijam DPS classe III; avaliar junto a equipamentos eletrônicos distantes do quadro.')
    + (longe.length ? ` Circuitos além da distância de proteção do DPS do quadro: ${longe.join('; ')} — os equipamentos sensíveis alimentados por eles devem receber DPS classe III próprio.` : '') });
  B.push({ t: 'p', text: `Os DPS em cascata (entrada → quadros → equipamentos) devem ser do mesmo fabricante ou declarados coordenados por ele; na falta dessa declaração, recomenda-se pelo menos ${D_COORD} m de cabo entre os estágios (IEC 61643-12, informativo) ou indutor de desacoplamento, observada a instrução do fabricante.` });
  sec('Instalação');
  B.push({ t: 'list', items: ['Instalar os DPS junto ao barramento de proteção do quadro, com condutores curtos, retilíneos e sem laços; preferir a ligação em V (entrada e saída nos mesmos bornes) quando o comprimento passar de 0,5 m.',
    'Proteger cada conjunto de DPS pela retaguarda indicada pelo fabricante (de preferência fusível gL/gG), com indicação de fim de vida visível; na ligação em paralelo, ligar o contato de sinalização remota, pois a atuação da retaguarda tira o DPS de serviço sem desligar a instalação.', 'Interligar o barramento PE dos quadros ao BEP; com SPDA, ligar o DPS de entrada ao BEP pelo caminho mais curto.',
    'Inspecionar os DPS periodicamente e após descargas atmosféricas na região, substituindo os módulos sinalizados.'] });
  sec('Conclusão');
  const fal = Q.filter(r => r.status === 'fail');
  B.push({ t: 'p', text: fal.length ? `Os DPS dos quadros ${fal.map(r => r.q).join(', ')} não atendem a todas as verificações; ajuste a especificação conforme indicado.` : `Os DPS especificados para os ${Q.length} quadros atendem às verificações de tensão, corrente, nível de proteção e instalação da ABNT NBR 5410 e da ABNT NBR 5419-4.` });
  if (o.assinatura) B.push({ t: 'sign', place: [I.cidade, dataExtenso(I.data)].filter(Boolean).join(', '), name: I.responsavel || 'Responsável técnico', reg: [I.registro, I.art ? 'ART ' + I.art : ''].filter(Boolean).join(' — ') });
  return B;
}

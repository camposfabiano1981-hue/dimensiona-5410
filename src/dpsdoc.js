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
  B.push({ t: 'list', items: ['ABNT NBR 5410:2004 Versão Corrigida:2008 — Instalações elétricas de baixa tensão (6.3.5, Tabelas 31 e 49, Figura 13).', 'ABNT NBR 5419-4:2026 — Proteção contra descargas atmosféricas — Parte 4: Sistemas elétricos e eletrônicos internos na estrutura.',
    'ABNT NBR IEC 61643-11 — Dispositivos de proteção contra surtos de baixa tensão — Requisitos e métodos de ensaio.', 'IEC 61643-12 — Seleção e princípios de aplicação de DPS (coordenação); IEC 62305-4 — nível de proteção efetivo e distância de proteção (Anexo D); IEC 60364-5-534 — seleção e instalação de DPS.', ...(calc.energisa && Object.keys(calc.energisa.ucs || {}).length ? ['Energisa ETU-124.2 — Especificação técnica de dispositivo de proteção contra surtos (DPS).'] : []), 'Catálogos e instruções dos fabricantes dos DPS (retaguarda, coordenação e instalação).'] });
  sec('Dados da instalação e critérios');
  B.push({ t: 'table', head: ['Parâmetro', 'Valor adotado'], widths: [42, 58], rows: [
    ['Tensão nominal (U0 / U)', `${P.U0} / ${P.U} V`], ['Esquema de aterramento', P.aterramento], ['SPDA', ps ? `NP ${ps.base} — Iimp ≥ ${f2(ps.Iimp)} kA por modo no ponto de entrada (NBR 5419-4)` : 'não previsto'],
    ['Exposição a surtos', EXPO_DPS[c.exp][1]], ['Equipamentos protegidos', `categoria ${CAT_UW_TXT[c.catEq]} — Uw = ${f1(uwTab31(P.U0, c.catEq))} kV`],
    ['Suportabilidade a impulso (Tabela 31)', `${c.Uw[1]}: IV ${f1(c.Uw[2][0])} kV · III ${f1(c.Uw[2][1])} kV · II ${f1(c.Uw[2][2])} kV · I ${f1(c.Uw[2][3])} kV`]] });
  B.push({ t: 'list', items: [
    'Classe: I+II no ponto de entrada quando a estrutura tem SPDA ou exposição alta; II nos quadros de distribuição; III junto a equipamentos sensíveis quando o nível de proteção efetivo excede a suportabilidade deles.',
    'Tensão de operação contínua (Tabela 49): Uc ≥ 1,1 × U0 nos modos das fases e Uc ≥ U0 no modo neutro–PE; no esquema TT a montante do DR, ligação n+1 (Figura 13).',
    'Nível de proteção: Up ≤ suportabilidade da categoria II (Tabela 31); nível efetivo Up/f = Up + ΔU para varistores e Up/f = máx(Up; ΔU) para centelhadores, com ΔU ≈ 1 kV por metro de condutor de ligação para DPS classe I e desprezível para classe II ou ligação em V (IEC 62305-4).',
    `Distância de proteção por oscilação: lpo = (Uw − Up/f) / ${K_OSC} V/m; circuitos terminais mais longos que lpo pedem DPS classe III junto aos equipamentos, salvo quando o circuito tem menos de 10 m ou Up/f < Uw/2 (IEC 62305-4, Anexo D).`,
    `Sobretensões temporárias: o DPS deve suportar UT ≥ ${nfmt(UT_FATOR, 2)} × U0 = ${nfmt(UT_FATOR * P.U0, 0)} V por 5 s (falhas na baixa tensão)${P.aterramento === 'TT' ? ` e o centelhador N–PE, ${UT_NPE_TT} V por 200 ms (falhas na alta tensão)` : ''}, conforme o ensaio TOV da IEC 61643-11.`,
    `Correntes: In ≥ 5 kA por modo (8/20 µs); Iimp ≥ 12,5 kA por modo (10/350 µs) ou o valor do nível do SPDA. Imáx pela exposição segundo as faixas usuais dos fabricantes: baixa ${EXPO_DPS.baixa[0]} kA, média ${EXPO_DPS.media[0]} kA, alta ${EXPO_DPS.alta[0]} kA.`,
    'Condutores de ligação: comprimento total até 0,5 m (condutor vivo → DPS → barramento PE) e seção mínima de 4 mm² Cu, ou 16 mm² Cu para DPS classe I / estrutura com SPDA; os condutores devem suportar o curto-circuito até a atuação da retaguarda.',
    'Centelhadores: corrente subsequente interrompida Ifi ≥ curto-circuito presumido no ponto de instalação; centelhador N–PE com Ifi ≥ 100 A (IEC 60364-5-534).',
    `Proteção de retaguarda e corrente de curto-circuito suportável (Isccr) conforme o fabricante; coordenação entre estágios por produtos declarados coordenados pelo fabricante ou por pelo menos ${D_COORD} m de cabo entre eles (IEC 61643-12, informativo), ou indutor de desacoplamento.`,
    'DPS instalado a jusante de DR geral: o DR deve ser seletivo (tipo S) e imune a surtos, para não desligar a instalação a cada descarga.'] });
  const sQ = sec('Seleção por quadro');
  Q.forEach((r, i) => {
    B.push({ t: 'h2', text: `${sQ}.${i + 1} Quadro ${r.q}${r.desc ? ' — ' + r.desc : ''}` });
    B.push({ t: 'kv4', rows: [['Posição', r.origem ? 'Ponto de entrada (origem)' : 'Quadro de distribuição', 'Classe', r.classe], ['Ligação', r.ligTxt, 'Uc', `${r.Uc} V (N–PE ${r.UcN} V)`],
      ...(r.classe === 'I+II' ? [['Tecnologia', TEC_DPS[r.tec], 'Ligação dos condutores', r.emV ? 'em V (ΔU desprezível)' : 'derivação']] : []),
      ['Correntes', r.classe === 'I+II' ? `Iimp ${f2(r.Iimp)} kA (10/350 µs) por modo${r.lig === 'npe' ? `; N–PE ${f1(r.IimpNPE)} kA` : ''}; In ${nfmt(r.In, 0)} kA` : `In ${nfmt(r.In, 0)} kA; Imáx ${r.Imax} kA (8/20 µs)`, 'Nível de proteção', `Up ≤ ${f2(r.Up)} kV; Up/f = ${f2(r.Upf)} kV`],
      ['Condutores de ligação', `${f2(r.L)} m · ${fS(r.S)} mm² Cu`, 'Retaguarda', r.back ? `até ${r.back} A (fabricante)` : 'conforme o fabricante'],
      ['TOV suportável', r.UT ? `UT = ${nfmt(r.UT, 0)} V` : `UT ≥ ${nfmt(r.UTmin, 0)} V por 5 s`, 'Distância de proteção', r.soDist ? 'quadro só de distribuição' : r.lpoDispensa ? 'dispensada (Up/f < Uw/2)' : `lpo = ${f1(r.lpo)} m`]] });
    r.verifs.forEach(([st, t]) => B.push(st === 'info' ? { t: 'note', text: t } : { t: 'ver', ok: VER_DPS[st], text: t }));
  });
  sec('Classe III e coordenação');
  const longe = Q.filter(r => r.foraLpo && r.foraLpo.length).map(r => `${r.q} (circuitos ${r.foraLpo.join(', ')}; lpo = ${f1(r.lpo)} m)`);
  B.push({ t: 'p', text: (c.classe3 ? `Previstos ${c.classe3.n} DPS classe III (Uc ${c.classe3.Uc} V) junto aos equipamentos sensíveis, coordenados com os DPS do quadro que os alimenta.` : 'Não foram indicados pontos com equipamentos sensíveis que exijam DPS classe III; avaliar junto a equipamentos eletrônicos distantes do quadro.')
    + (longe.length ? ` Circuitos além da distância de proteção do DPS do quadro: ${longe.join('; ')} — os equipamentos sensíveis alimentados por eles devem receber DPS classe III próprio.` : '') });
  B.push({ t: 'p', text: `Os DPS em cascata (entrada → quadros → equipamentos) devem ser do mesmo fabricante ou declarados coordenados por ele; na falta dessa declaração, recomenda-se pelo menos ${D_COORD} m de cabo entre os estágios (IEC 61643-12, informativo) ou indutor de desacoplamento, observada a instrução do fabricante.` });
  sec('Instalação');
  B.push({ t: 'list', items: ['Instalar os DPS junto ao barramento de proteção do quadro, com condutores curtos, retilíneos e sem laços; preferir a ligação em V (entrada e saída nos mesmos bornes) quando o comprimento passar de 0,5 m.',
    'Proteger cada conjunto de DPS pela retaguarda indicada pelo fabricante, com indicação de fim de vida visível e contato de sinalização quando disponível.', 'Interligar o barramento PE dos quadros ao BEP; com SPDA, ligar o DPS de entrada ao BEP pelo caminho mais curto.',
    'Inspecionar os DPS periodicamente e após descargas atmosféricas na região, substituindo os módulos sinalizados.'] });
  sec('Conclusão');
  const fal = Q.filter(r => r.status === 'fail');
  B.push({ t: 'p', text: fal.length ? `Os DPS dos quadros ${fal.map(r => r.q).join(', ')} não atendem a todas as verificações; ajuste a especificação conforme indicado.` : `Os DPS especificados para os ${Q.length} quadros atendem às verificações de tensão, corrente, nível de proteção e instalação da ABNT NBR 5410 e da ABNT NBR 5419-4.` });
  if (o.assinatura) B.push({ t: 'sign', place: [I.cidade, dataExtenso(I.data)].filter(Boolean).join(', '), name: I.responsavel || 'Responsável técnico', reg: [I.registro, I.art ? 'ART ' + I.art : ''].filter(Boolean).join(' — ') });
  return B;
}

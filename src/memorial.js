/* ================================================================
   MEMÓRIA DE CÁLCULO — modelo de documento em blocos
   Blocos: title, meta, h1, h2, h3, p, eq, kv4, table, list, ver, note, spec, fig, figs, sign, break
   ================================================================ */
const f2 = v => nfmt(v, 2), f1 = v => nfmt(v, 1), f0 = v => nfmt(v, 0), f3 = v => nfmt(v, 3), f4 = v => nfmt(v, 4);
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function dataExtenso(iso) { if (!iso) return ''; const [y, m, d] = iso.split('-').map(Number); if (!y) return iso; return `${d} de ${MESES[m - 1]} de ${y}`; }
function dataCurta(iso) { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; }
const fR = v => nfmt(v, v < 0.1 ? 4 : (v < 1 ? 3 : 2));
function composicao(c) { return esquemaTxt(c.ligacao, c.pe); }
function fasesTxt(c) { const f = (c.fases || '').split('').slice(0, nFases(c.ligacao)); return f.length ? 'fase' + (f.length > 1 ? 's ' : ' ') + f.join(', ') : ''; }
function cabosTxt(c) { const n = normaCabo(c.tipoCabo, c.isolacao); return `${TIPO_CABO[c.tipoCabo]}, ${MATERIAL[c.material === 'Al' ? 'Al' : 'Cu']}, isolação ${ISOL[c.isolacao] || ISOL.PVC}${n ? ` (${n})` : ''}`; }
function condutoresTxt(r) {
  const k = r.nPar > 1 ? `${r.nPar} × ` : '';
  const p = [`Fase ${k}${fS(r.Sf)}`]; if (r.hasN) p.push(`Neutro ${k}${fS(r.SN)}`); if (r.SPE) p.push(`PE ${k}${fS(r.SPE)}`);
  return p.join(' · ') + ' mm²';
}
function protecaoTxt(c, r) {
  if (c.dispositivo === 'fus_gG') return `Fusível gG ${r.In} A`;
  if (c.dispositivo === 'disj_60947') return `Disjuntor ${r.polos}P ${r.In} A — ${f1(r.icn)} kA`;
  return `Disjuntor ${r.polos}P ${r.curva}${r.In} — ${f1(r.icn)} kA`;
}
function protecaoCurta(c, r) { return c.dispositivo === 'disj_60898' ? `${r.curva}${r.In}` : (c.dispositivo === 'fus_gG' ? `gG ${r.In} A` : `${r.In} A`); }
function drTxt(r) { return r.drUsado ? `${r.drTipo === 'DDR' ? 'Disj. DR' : 'IDR'} ${r.drPolos}P ${r.drIn ?? '?'} A / ${r.idn} mA` : '—'; }
function eletrodutoTxt(r) {
  if (r.calha) return calhaTxt(r);
  const t = r.trecho; if (!t) return '—';
  if (!t.aplica) return 'não se aplica';
  if (!t.esc) return 'não dimensionado';
  return `${t.esc.nome} DN ${t.esc.dn} (${t.esc.pol})${t.exclusivo ? '' : ' — ' + t.key}`;
}
function statusTxt(s) { return s === 'ok' ? 'Atende' : (s === 'warn' ? 'Atende, com observações' : 'Não atende'); }
function potTxt(c, r) {
  if (r.potAuto) return `${f0(r.S)} VA (demanda do quadro ${c.alimenta}) — ${f0(r.P)} W`;
  if (r.potLumi) return `${f0(r.P)} W (luminotécnica: ${r.potLumi.amb.join(', ')}) — ${f0(r.S)} VA`;
  if (c.tipo === 'motor') return `${nfmt(+c.pot, c.pot % 1 ? 2 : 0)} ${c.unid} no eixo — ${f0(r.P)} W absorvidos; ${f0(r.S)} VA`;
  return `${f0(r.S)} VA — ${f0(r.P)} W`;
}

function construirMemorial(proj, calc, opt = {}) {
  const o = Object.assign({ metodologia: true, detalhe: true, eletrodutos: true, calhas: true, quadro: true, lumi: true, anexo33: true, assinatura: true }, opt);
  const P = proj.params, I = proj.info, C = proj.circuitos, R = calc.res; const B = [];
  const nOK = C.filter(c => R[c.id].status !== 'fail').length;
  const K = Object.values(calc.calhas || {}), temK = o.calhas && K.length > 0;
  const A = proj.lumi || [], temL = o.lumi && A.length > 0;
  const TE = Object.values(calc.trechos).filter(t => !(calc.calhas || {})[t.key]);
  B.push({ t: 'title', kicker: 'ABNT NBR 5410:2004 — Instalações elétricas de baixa tensão', text: 'Memória de cálculo', sub: `Dimensionamento de condutores, dispositivos de proteção, eletrodutos${K.length ? ' e eletrocalhas' : ''} dos circuitos elétricos${temL ? ' e cálculo luminotécnico (ABNT NBR ISO/CIE 8995-1)' : ''}` });
  B.push({ t: 'meta', rows: [
    ['Obra', I.obra || '—'], ['Proprietário / cliente', I.cliente || '—'],
    ['Endereço', [I.endereco, I.cidade].filter(Boolean).join(' — ') || '—'],
    ['Responsável técnico', [I.responsavel, I.registro].filter(Boolean).join(' — ') || '—'],
    ['ART / TRT / RRT', I.art || '—'], ['Data / revisão', `${dataCurta(I.data) || '—'} — ${I.revisao || 'R00'}`]
  ] });
  let n = 0; const sec = t => { n++; B.push({ t: 'h1', text: `${n}. ${t}` }); return n; };
  const temAl = C.some(c => c.material === 'Al');

  sec('Objetivo');
  B.push({ t: 'p', text: `Este documento apresenta a memória de cálculo do dimensionamento dos condutores, dos dispositivos de proteção contra sobrecorrentes e choques elétricos e dos eletrodutos dos ${C.length} circuitos de baixa tensão da obra acima identificada, segundo os critérios da ABNT NBR 5410:2004 (versão corrigida 2008). Conforme 6.2.6.1.2, a seção adotada para cada circuito é a maior entre as exigidas pelos critérios de seção mínima, capacidade de condução de corrente, queda de tensão, sobrecarga, curto-circuito e proteção contra choques elétricos.` });

  sec('Normas e documentos de referência');
  B.push({ t: 'list', items: [
    'ABNT NBR 5410:2004 Versão Corrigida:2008 — Instalações elétricas de baixa tensão.',
    'ABNT NBR NM 60898 — Disjuntores para proteção de sobrecorrentes para instalações domésticas e similares.',
    'ABNT NBR IEC 60947-2 — Dispositivos de manobra e comando de baixa tensão — Disjuntores.',
    'ABNT NBR NM 61008 / NBR NM 61009 — Interruptores e disjuntores a corrente diferencial-residual.',
    'ABNT NBR NM 247-3 e ABNT NBR 13248 — Condutores isolados 450/750 V (PVC e não halogenados).',
    'ABNT NBR 7288, NBR 7286 e NBR 7287 — Cabos de potência 0,6/1 kV com isolação de PVC, EPR/HEPR e XLPE.',
    'ABNT NBR NM 280 — Condutores de cabos isolados (resistência elétrica).',
    'ABNT NBR 15465 e ABNT NBR 5598 — Eletrodutos plásticos e de aço-carbono.',
    ...(K.length ? ['ABNT NBR IEC 61537 — Encaminhamento de cabos — Sistemas de eletrocalhas e de leitos para cabos.'] : []),
    ...(A.length ? ['ABNT NBR ISO/CIE 8995-1:2013 — Iluminação de ambientes de trabalho — Parte 1: Interior.', 'CIE 97:2005 — Guia de manutenção de sistemas de iluminação elétrica de interiores.'] : []),
    'IEC 60364-5-52:2009 e IEC 60287-1-1 — Capacidade de condução, agrupamento e cálculo de resistência e reatância.',
    'Guia de Dimensionamento de Cabos para Baixa Tensão — Prysmian, Rev. 9 (2020).',
    ...(I.concessionaria ? [I.concessionaria + '.'] : [])
  ] });

  sec('Dados do sistema e premissas');
  const aterr = { 'TN-S': 'TN-S (neutro e proteção separados)', 'TN-C-S': 'TN-C-S', 'TT': 'TT (massas ligadas a eletrodo próprio)' }[P.aterramento] || P.aterramento;
  const orig = { entrega: 'ponto de entrega em tensão secundária de distribuição', trafo: 'terminais secundários do transformador MT/BT', gerador: 'terminais do grupo gerador próprio' }[P.origem];
  B.push({ t: 'table', head: ['Parâmetro', 'Valor adotado'], widths: [42, 58], rows: [
    ['Tensão nominal (U0 / U)', `${P.U0} / ${P.U} V — 60 Hz`],
    ['Fornecimento', { monofasico: 'Monofásico', bifasico: 'Bifásico', trifasico: 'Trifásico' }[P.fornecimento]],
    ['Esquema de aterramento', aterr + (P.aterramento === 'TT' ? ` — RA = ${f1(P.RA)} Ω` : '')],
    ['Tipo de edificação', EDIFICACAO[P.edificacao] || P.edificacao],
    ['Origem da instalação', orig],
    ['Limites de queda de tensão', `${f1(P.dvTotal)} % total (6.2.7.1); ${f1(P.dvTerminal)} % nos circuitos terminais (6.2.7.2); ${f1(P.dvDist)} % adotado nos alimentadores${P.supLongo && P.origem !== 'entrega' ? '; acréscimo de 0,005 %/m acima de 100 m, até 0,5 %' : ''}`],
    ['Temperatura de referência', `${P.tempAmb} °C (ar) e ${P.tempSolo} °C (solo), salvo indicação no circuito`],
    ['Condutores', `${temAl ? 'Cobre e alumínio, conforme o circuito' : 'Cobre'}; encordoamento classe ${P.classe} (${+P.classe === 5 ? 'flexível' : 'encordoado'})${temAl ? '; alumínio classe 2' : ''}`],
    ['Corrente nominal mínima dos disjuntores', `${P.inMin} A (critério de projeto)`],
    ['Capacidade de interrupção', `${f1(P.icn)} kA (NBR NM 60898); ${f1(P.icn947)} kA (NBR IEC 60947-2)`],
    ['Verificação ao curto-circuito', P.verifCC ? (P.classe3 ? `disjuntores até 32 A: classe 3 de limitação de energia; demais: t = ${f3(P.tCC)} s` : `t = ${f3(P.tCC)} s`) + (P.verifPE ? '; inclui o condutor de proteção' : '') : 'não realizada'],
    ['Condutores em paralelo', `automático acima de ${fS(P.secMaxPar)} mm² por condutor, quando o circuito não definir outro valor`]
  ] });
  B.push({ t: 'p', text: 'Premissas:' });
  B.push({ t: 'list', items: [
    'As potências dos circuitos são as informadas pelo projetista a partir da previsão de cargas (NBR 5410, 9.5.2, quando aplicável).',
    'Capacidades de condução de corrente das Tabelas 36 a 39 e fatores de correção das Tabelas 40 a 45; quatro condutores carregados: fator 0,86 sobre a coluna de três.',
    'Resistência em corrente alternada calculada na temperatura máxima de serviço contínuo (70 °C para PVC e LSHF/A; 90 °C para EPR/HEPR e XLPE — Tabela 35), a partir da resistência a 20 °C da ABNT NBR NM 280, com os efeitos pelicular e de proximidade (IEC 60287).',
    'Reatância indutiva calculada pela distância média geométrica entre condutores (GMD) e pelo diâmetro do condutor, para a disposição de cada maneira de instalar.',
    'Em eletrodutos de aço (ferromagnéticos), a queda de tensão é multiplicada por 1,00 a 1,18 conforme a seção e o fator de potência; todos os condutores do circuito ficam no mesmo eletroduto.',
    'Linhas enterradas: tabelas para 0,7 m de profundidade e 2,5 K·m/W; abaixo de 0,7 m, redução de 1 % a cada 10 cm, até 2 m.',
    'Fatores de temperatura aplicados pela linha da Tabela 40 imediatamente superior à temperatura informada, a favor da segurança.',
    'Diâmetros externos de condutores e internos de eletrodutos: valores típicos de catálogo, a confirmar com o fabricante especificado.',
    ...(temAl ? ['Condutores de alumínio usados somente nas condições de 6.2.3.8 (instalações industriais e comerciais, nunca em residências).'] : [])
  ] });

  if (o.metodologia) {
    const s = sec('Critérios de dimensionamento');
    B.push({ t: 'h3', text: `${s}.1 Corrente de projeto (IB)` });
    B.push({ t: 'eq', lines: ['F+N:    IB = S / U0            F+F:  IB = S / U', 'F+F+N:  IB = S / (2 × U0)      F+F+F e F+F+F+N:  IB = S / (√3 × U)', 'Motores: S = Peixo / (η × cosφ);  IB = In,motor × FS (fator de serviço)'] });
    B.push({ t: 'h3', text: `${s}.2 Capacidade de condução e proteção contra sobrecargas (6.2.5 e 5.3.4.1)` });
    B.push({ t: 'eq', lines: ['Iz = n × Ic × FCT × FCA × FCR × FCP', 'IB ≤ In ≤ Iz      e      I2 ≤ 1,45 × Iz'] });
    B.push({ t: 'p', text: 'Ic é a capacidade de condução tabelada (Tabelas 36 a 39) para o método de referência e o número de condutores carregados (Tabela 46); n é o número de condutores por fase; FCT, FCA, FCR e FCP são os fatores de temperatura (Tabela 40), de agrupamento (Tabelas 42 a 45), de resistividade térmica do solo (Tabela 41) e de profundidade. Para disjuntores NBR NM 60898, I2 = 1,45 × In; para NBR IEC 60947-2, I2 = 1,30 × In; para fusíveis gG, I2 = 1,6 × In (In ≥ 16 A).' });
    B.push({ t: 'h3', text: `${s}.3 Queda de tensão (6.2.7)` });
    B.push({ t: 'eq', lines: ['ΔV% = k × IB × L × (R × cosφ + XL × senφ) / (n × V) × 100', 'R = R′ × (1 + ys + yp);   R′ = R20 × [1 + α × (θ − 20)]   (α = 0,00393 cobre; 0,00403 alumínio)', 'XL = 2π × f × [0,05 + 0,2 × ln(2 × GMD / dc)] × 10⁻³   (Ω/km; L em km)', 'k = 2 (F+N, F+F) · √3 (F+F+F, F+F+F+N) · 1,5 (F+F+N, carga equilibrada; V = U0)'] });
    B.push({ t: 'p', text: `A queda de tensão acumulada (quadros a montante + circuito) não deve exceder ${f1(P.dvTotal)} %, e a dos circuitos terminais não deve exceder 4 %.` });
    B.push({ t: 'h3', text: `${s}.4 Curto-circuito (5.3.5)` });
    B.push({ t: 'eq', lines: ['I²t ≤ k² × S²   →   S ≥ √(I²t) / k', 'k (cobre) = 115 PVC/LSHF-A · 103 PVC > 300 mm² · 143 EPR/XLPE', 'k (alumínio) = 76 PVC/LSHF-A · 68 PVC > 300 mm² · 94 EPR/XLPE'] });
    B.push({ t: 'p', text: 'A capacidade de interrupção do dispositivo deve ser igual ou superior à corrente de curto-circuito presumida no ponto de instalação. Para tempos de atuação inferiores a 0,1 s, a energia I²t é a deixada passar pelo dispositivo. O condutor de proteção é verificado pela mesma expressão (6.4.3.1.2).' });
    B.push({ t: 'h3', text: `${s}.5 Seccionamento automático — proteção contra choques (5.1.2.2.4)` });
    B.push({ t: 'eq', lines: ['Lmax = 0,8 × U0 × n × Sf / [ρ × (1 + m) × Ia]', 'ρ = 0,0225 Ω·mm²/m (cobre) · 0,036 Ω·mm²/m (alumínio)   m = Sf / SPE', 'Ia = corrente de disparo magnético (curva B: 5 In; C: 10 In; D: 20 In)'] });
    B.push({ t: 'p', text: 'Método convencional para o esquema TN: o comprimento do circuito não deve exceder Lmax, o que garante a atuação instantânea do disparador. Circuitos protegidos por dispositivo DR têm o seccionamento assegurado por ele. No esquema TT, RA × IΔn ≤ 50 V.' });
    B.push({ t: 'h3', text: `${s}.6 Seção mínima, neutro e condutor de proteção` });
    B.push({ t: 'p', text: 'Seção mínima (6.2.6.1, Tabela 47): cobre 1,5 mm² em iluminação, 2,5 mm² em força e 0,5 mm² em sinalização e controle; alumínio 16 mm² (50 mm² em instalações comerciais). Neutro (6.2.6.2): igual à fase em circuitos monofásicos e bifásicos; redução pela Tabela 48 apenas em circuitos trifásicos equilibrados, com 3ª harmônica até 15 %. Condutor de proteção (Tabela 58): SPE = S até 16 mm²; 16 mm² de 16 a 35 mm²; S/2 acima de 35 mm².' });
    B.push({ t: 'h3', text: `${s}.7 Dispositivo DR (5.1.3.2.2)` });
    B.push({ t: 'p', text: 'Proteção complementar por DR de alta sensibilidade (IΔn ≤ 30 mA) nos circuitos que atendem locais com banheira ou chuveiro, tomadas em áreas externas, tomadas internas que possam alimentar equipamentos no exterior e, em locais de habitação, cozinhas, copas-cozinhas, lavanderias, áreas de serviço, garagens e demais dependências molhadas ou sujeitas a lavagens.' });
    B.push({ t: 'h3', text: `${s}.8 Eletrodutos (6.2.11.1)` });
    B.push({ t: 'eq', lines: ['Taxa máxima de ocupação: 53 % (1 condutor) · 31 % (2 condutores) · 40 % (3 ou mais)', 'Ai,mín = Σ(π × d² / 4) / taxa   →   Di ≥ √(4 × Ai,mín / π)'] });
    B.push({ t: 'p', text: 'Trechos contínuos sem caixa de passagem: até 15 m em áreas internas e 30 m em áreas externas, reduzidos de 3 m por curva de 90°, com no máximo três curvas entre caixas.' });
    if (K.length) {
      B.push({ t: 'h3', text: `${s}.9 Eletrocalhas, perfilados, bandejas e leitos` });
      B.push({ t: 'eq', lines: ['Wmín = ΣA × (1 + reserva) / (taxa × H)          (largura mínima para a altura útil H)', 'Camada única (suportes abertos, Tabela 42 ref. 2 a 5):  Σd × (1 + reserva) ≤ W', 'Peso dos cabos ≤ carga admissível do fabricante para o vão entre suportes'] });
      B.push({ t: 'p', text: 'A NBR 5410 não fixa taxa de ocupação para condutos de seção não circular; adota-se como critério de projeto 40 % da seção útil, por analogia com 6.2.11.1.6, acrescida de reserva para ampliação. A capacidade de condução dos circuitos já considera a maneira de instalar da Tabela 33 e o agrupamento das Tabelas 42 e 43. Eletrocalhas e leitos metálicos devem ter continuidade elétrica e ser ligados à equipotencialização (6.4).' });
    }
    if (temL) {
      B.push({ t: 'h3', text: `${s}.${K.length ? 10 : 9} Iluminação de interiores (NBR ISO/CIE 8995-1)` });
      B.push({ t: 'eq', lines: ['K = L × W / [hm × (L + W)]          (índice do local; hm = altura da luminária ao plano de trabalho)', 'N = Em × A / (Φ × UF × FM)          Eméd = N × Φ × UF × FM / A', 'FM = LLMF × LSF × LMF × RSMF (CIE 97) ≥ 0,70;   Uo = Emín / Eméd ≥ 0,70 na área da tarefa', 'E(P) = Σ I(θ) × cos θ / d² + E refletida;   I(θ) = I0 × cosⁿθ'] });
      B.push({ t: 'p', text: 'O fator de utilização (UF) é calculado pelo método da radiosidade em três superfícies (plano de trabalho, paredes e teto), com a distribuição de intensidade da luminária aproximada por cosⁿθ a partir da abertura do facho e com os fatores de forma entre o plano de trabalho e o teto; quando o fabricante fornece a tabela de UF, o valor tabelado é usado. A uniformidade é verificada ponto a ponto numa malha no plano de trabalho, excluída uma faixa de até 0,5 m junto às paredes.' });
    }
  }

  const sR = sec('Quadro-resumo dos circuitos');
  B.push({ t: 'h3', text: `${sR}.1 Cargas e correntes` });
  B.push({ t: 'table', small: true, head: ['Circ.', 'Descrição', 'Quadro', 'Ligação', 'Fases', 'U (V)', 'P (W)', 'FP', 'S (VA)', 'IB (A)', 'L (m)'], widths: [6, 26, 8, 11, 7, 6, 8, 6, 8, 7, 7], align: 'lllllrrrrrr',
    rows: C.map(c => { const r = R[c.id]; return [c.num, c.desc || TIPOS[c.tipo], c.quadro, composicao(c), (c.fases || '').split('').slice(0, nFases(c.ligacao)).join('-'), r.V, f0(r.P), f2(r.fp), f0(r.S), f2(r.IB), f1(r.L)]; }) });
  B.push({ t: 'h3', text: `${sR}.2 Condutores, proteção e condutos` });
  B.push({ t: 'table', small: true, head: ['Circ.', 'Mét.', 'Fatores', 'F / N / PE (mm²)', 'Iz (A)', 'Proteção', 'DR', 'ΔV circ./acum. %', 'Eletroduto / calha', 'Situação'], widths: [6, 6, 7, 15, 7, 11, 12, 11, 15, 10], align: 'llllrlllll',
    rows: C.map(c => { const r = R[c.id]; const t = r.trecho; const k = r.nPar > 1 ? `${r.nPar}×` : ''; return [c.num, `${r.met.id}/${r.ref}`, f2(r.fTot), [k + fS(r.Sf), r.hasN ? k + fS(r.SN) : '—', r.SPE ? k + fS(r.SPE) : '—'].join(' / ') + (c.material === 'Al' ? ' Al' : ''), f1(r.Iz), protecaoCurta(c, r) + (c.dispositivo !== 'fus_gG' ? ` ${r.polos}P` : ''), r.drUsado ? `${r.drIn ?? '?'} A/${r.idn} mA` : '—', `${f2(r.dv)} / ${f2(r.dvTotal)}`, r.calha ? (r.calha.esc ? `${r.calha.esc.W}×${r.calha.esc.H} mm` : '—') : (t && t.esc ? `DN ${t.esc.dn} (${t.esc.pol})` : (t && !t.aplica ? 'n/a' : '—')), statusTxt(r.status)]; }) });

  if (o.detalhe) { const sD = sec('Memória detalhada por circuito'); C.forEach((c, i) => memCircuito(B, c, R[c.id], proj, calc, `${sD}.${i + 1}`)); }
  if (o.eletrodutos && TE.length) { const sE = sec('Dimensionamento dos eletrodutos'); TE.forEach((t, i) => memTrecho(B, t, `${sE}.${i + 1}`)); }
  if (temK) { const sK = sec('Dimensionamento das eletrocalhas, bandejas e leitos'); K.forEach((t, i) => memCalha(B, t, `${sK}.${i + 1}`)); }
  if (o.quadro) { const sQ = sec('Quadros de carga e equilíbrio de fases'); Object.values(calc.quadros).forEach((q, i) => memQuadro(B, q, proj, calc, `${sQ}.${i + 1}`)); }
  if (temL) memLumi(B, proj, calc, sec('Cálculo luminotécnico'));

  sec('Conclusão');
  const falhas = C.filter(c => R[c.id].status === 'fail'), obs = C.filter(c => R[c.id].status === 'warn');
  if (!falhas.length) B.push({ t: 'p', text: `Os ${C.length} circuitos dimensionados atendem aos critérios da ABNT NBR 5410:2004 aplicados nesta memória.${obs.length ? ` Os circuitos ${obs.map(c => c.num).join(', ')} possuem observações, relacionadas na memória detalhada, que devem ser consideradas na execução.` : ''}` });
  else { B.push({ t: 'p', text: `${nOK} de ${C.length} circuitos atendem aos critérios aplicados. Os circuitos abaixo apresentam pendências que devem ser resolvidas antes da emissão final:` }); B.push({ t: 'list', items: falhas.map(c => `Circuito ${c.num} — ${R[c.id].falhas.join(' ')}`) }); }
  B.push({ t: 'p', text: 'Os dispositivos, condutores e eletrodutos especificados devem possuir certificação de conformidade e ser instalados conforme as prescrições da NBR 5410 e as recomendações dos fabricantes. Após a execução, a instalação deve ser submetida à verificação final (inspeção visual e ensaios) prevista na seção 7 da NBR 5410.' });
  if (I.obs) B.push({ t: 'note', text: I.obs });
  if (o.assinatura) B.push({ t: 'sign', place: [I.cidade, dataExtenso(I.data)].filter(Boolean).join(', '), name: I.responsavel || 'Responsável técnico', reg: I.registro || '' });

  if (o.anexo33) {
    const usados = [...new Set(C.map(c => c.metodo))].map(id => MET[id]).filter(Boolean);
    B.push({ t: 'break' });
    B.push({ t: 'h1', text: 'Anexo A — Maneiras de instalar adotadas (Tabela 33)' });
    B.push({ t: 'p', text: 'Esquemas ilustrativos das maneiras de instalar utilizadas neste projeto, com o respectivo método de referência para determinação da capacidade de condução de corrente.' });
    B.push({ t: 'figs', itens: usados.map(m => ({ svg: pictograma(m.id, PAL_DOC), caption: `Nº ${m.id} — método ${m.ref === 'EF' ? 'E/F' : (m.vde ? 'B2/B1' : m.ref)}`, sub: m.desc, circs: C.filter(c => c.metodo === m.id).map(c => c.num).join(', ') })) });
  }
  return B;
}

function memCircuito(B, c, r, proj, calc, num) {
  const P = proj.params, Q = proj.quadros || {};
  B.push({ t: 'h2', text: `${num} Circuito ${c.num} — ${c.desc || TIPOS[c.tipo]}` });
  B.push({ t: 'kv4', rows: [
    ['Quadro', c.quadro + (Q[c.quadro]?.desc ? ` — ${Q[c.quadro].desc}` : ''), 'Tipo', TIPOS[c.tipo]],
    ['Ligação', `${composicao(c)} — ${LIG_LONGO[c.ligacao]}, ${c.pe ? 'com' : 'sem'} condutor de proteção${fasesTxt(c) ? ' — ' + fasesTxt(c) : ''}`, 'Tensão', `${r.V} V`],
    ['Local', LOCAIS[c.local] || '—', 'Comprimento', `${f1(r.L)} m`],
    ['Potência', potTxt(c, r), 'Fator de potência', f2(r.fp)]
  ] });
  let k = 0; const st = t => { k++; B.push({ t: 'h3', text: `${String.fromCharCode(96 + k)}) ${t}` }); };
  const npar = r.nPar > 1;

  st('Corrente de projeto');
  const L = [];
  if (r.potAuto) { const d = r.dem; L.push(`S = FD × ΣS(terminais) + ΣS(quadros a jusante) = ${f2(d.fd)} × ${f0(d.Sterm)} + ${f0(d.Sjus)} = ${f0(r.S)} VA`); L.push(`cosφ médio = P / S = ${f0(r.P)} / ${f0(r.S)} = ${f2(r.fp)}`); }
  else if (c.tipo === 'motor') { L.push(`Peixo = ${nfmt(+c.pot, c.pot % 1 ? 2 : 0)} ${c.unid} = ${f1(r.Pmec)} W`); L.push(`P = Peixo / η = ${f1(r.Pmec)} / ${f2(r.eta)} = ${f1(r.P)} W;   S = P / cosφ = ${f1(r.P)} / ${f2(r.fp)} = ${f1(r.S)} VA`); }
  else if (r.potLumi) { L.push(`P = Σ potência das luminárias (cálculo luminotécnico: ${r.potLumi.amb.join(', ')}) = ${f0(r.P)} W`); L.push(`S = P / cosφ = ${f0(r.P)} / ${f2(r.fp)} = ${f1(r.S)} VA`); }
  else if (c.unid === 'W' || c.unid === 'kW') L.push(`S = P / cosφ = ${f0(r.P)} / ${f2(r.fp)} = ${f1(r.S)} VA`);
  const In0 = { FN: `S / U0 = ${f1(r.S)} / ${P.U0}`, FF: `S / U = ${f1(r.S)} / ${P.U}`, FFN: `S / (2 × U0) = ${f1(r.S)} / (2 × ${P.U0})`, FFF: `S / (√3 × U) = ${f1(r.S)} / (√3 × ${P.U})`, FFFN: `S / (√3 × U) = ${f1(r.S)} / (√3 × ${P.U})` }[c.ligacao];
  if (c.tipo === 'motor') { L.push(`In,motor = ${In0} = ${f2(r.Icarga)} A`); L.push(`IB = In,motor × FS = ${f2(r.Icarga)} × ${f2(r.fs)} = ${f2(r.IB)} A`); }
  else L.push(`IB = ${In0} = ${f2(r.IB)} A`);
  B.push({ t: 'eq', lines: L });

  st('Linha elétrica e fatores de correção');
  B.push({ t: 'fig', svg: pictograma(r.met.id, PAL_DOC), caption: `Tabela 33 — maneira de instalar nº ${r.met.id}, método de referência ${r.ref}`, w: 46 });
  const cb = cabosTxt(c);
  B.push({ t: 'p', text: `Maneira de instalar nº ${r.met.id} (Tabela 33): ${r.met.desc.charAt(0).toLowerCase() + r.met.desc.slice(1)} — método de referência **${r.ref}**${r.vde ? ` (${r.vde === 'alto' ? (r.met.vde === 5 ? '5·De ≤ V < 50·De' : 'V ≥ 20·De') : (r.met.vde === 5 ? '1,5·De ≤ V < 5·De' : '1,5·De ≤ V < 20·De')})` : ''}. ${cb.charAt(0).toUpperCase() + cb.slice(1)}; ${r.nCarr} condutores carregados (Tabela 46)${r.harm ? ', com neutro carregado por harmônicas — 4 condutores carregados, fator 0,86' : ''}${npar ? `; ${r.nPar} condutores por fase em paralelo` : ''}.` });
  const F = [`FCT = ${f2(r.FCT)}   (${r.fctFonte})`];
  if (r.solo) { F.push(`FCR = ${f2(r.FCR)}   (${r.fcrFonte})`); F.push(`FCP = ${f2(r.FCP)}   (${r.fcpFonte})`); }
  F.push(`FCA = ${f3(r.FCA)}   (${r.fcaFonte})`);
  if (r.harm) F.push('fh = 0,86   (neutro carregado — harmônicas de 3ª ordem > 15 %)');
  F.push(`Fator total = ${[r.FCT, r.solo ? r.FCR : null, r.solo ? r.FCP : null, r.FCA, r.harm ? r.fh : null].filter(x => x != null).map(x => nfmt(x, x % 0.01 > 1e-9 ? 3 : 2)).join(' × ')} = ${f3(r.fTot)}`);
  B.push({ t: 'eq', lines: F });

  st('Dispositivo de proteção contra sobrecorrentes');
  const dnome = c.dispositivo === 'disj_60898' ? `${r.disp.nome} ${r.polos}P, curva ${r.curva}, conforme ${r.disp.norma}` : `${r.disp.nome}${c.dispositivo !== 'fus_gG' ? ` ${r.polos}P` : ''}, conforme ${r.disp.norma}`;
  B.push({ t: 'p', text: `${dnome}. ${c.inManual ? 'Corrente nominal definida pelo projetista.' : `Corrente nominal: menor valor padronizado igual ou superior a IB${c.tipo !== 'controle' && +P.inMin > 0 ? ` e a ${P.inMin} A` : ''}.`}` });
  B.push({ t: 'eq', lines: [`In ≥ IB = ${f2(r.IB)} A   →   In = ${r.In} A`, `I2 = ${f2(r.I2f)} × In = ${f2(r.I2)} A`] });

  st('Capacidade de condução de corrente (6.2.5 e 5.3.4.1)');
  const fuse = r.I2f > 1.45 + 1e-9;
  B.push({ t: 'eq', lines: [
    fuse ? `Iz,mín = In × I2f / 1,45 = ${r.In} × ${f2(r.I2f)} / 1,45 = ${f2(r.IzReq)} A` : `Iz,mín = In = ${r.In} A`,
    `Ic,mín = Iz,mín / (fator total${npar ? ' × n' : ''}) = ${f2(r.IzReq)} / (${f3(r.fTot)}${npar ? ` × ${r.nPar}` : ''}) = ${f2(r.IcReq)} A`] });
  if (r.Scap != null) { const ic = capacidade(r.mat, r.isol, r.ref, r.nCarr, c.arranjoF, c.arranjoG, r.Scap).Ic; B.push({ t: 'p', text: `Tabela ${r.tabCap} (${MATERIAL[r.mat]}), ${r.colCap}: menor seção com Ic ≥ ${f2(r.IcReq)} A → **${fS(r.Scap)} mm²** (Ic = ${nfmt(ic, ic % 1 ? 1 : 0)} A).` }); }
  else B.push({ t: 'ver', ok: false, text: 'Nenhuma seção da tabela atende ao critério.' });

  st('Seção mínima (6.2.6.1, Tabela 47)');
  B.push({ t: 'p', text: r.mat === 'Al' ? `Condutor de alumínio: seção mínima de ${fS(r.Smin)} mm² (Tabela 47${P.edificacao === 'comercial' ? ' e 6.2.3.8 — instalação comercial' : ''}).` : `Circuito de ${c.tipo === 'ilum' ? 'iluminação' : (c.tipo === 'controle' ? 'sinalização e controle' : 'força')}: seção mínima de ${fS(r.Smin)} mm² (cobre, instalação fixa com cabos isolados).` });

  st('Queda de tensão (6.2.7)');
  if (r.Sdv != null && r.Scap != null && r.Sdv > Math.max(r.Scap, r.Smin)) { const Sb = Math.max(r.Scap, r.Smin); B.push({ t: 'p', text: `Com ${fS(Sb)} mm² a queda no circuito seria de ${f2(r.dvFn(Sb))} % (acumulada ${f2(r.dvMont + r.dvFn(Sb))} %), acima do limite. O critério exige **${fS(r.Sdv)} mm²**.` }); }
  const z = r.z, Vn = c.ligacao === 'FN' || c.ligacao === 'FFN' ? 'U0' : 'U';
  B.push({ t: 'eq', lines: [
    `R′(${z.th} °C) = ${fR(z.R0)} × [1 + ${nfmt(z.alfa, 5)} × (${z.th} − 20)] = ${fR(z.Rl)} Ω/km   (${fS(r.Sf)} mm², ${MATERIAL[r.mat]} classe ${r.classe})`,
    `R = R′ × (1 + ys + yp) = ${fR(z.Rl)} × (1 + ${f4(z.ys)} + ${f4(z.yp)}) = ${fR(z.R)} Ω/km`,
    `XL = 2π × 60 × [0,05 + 0,2 × ln(2 × ${f1(z.gmd)} / ${f1(z.dc)})] × 10⁻³ = ${f3(z.X)} Ω/km   (condutores ${z.arr})`,
    `cosφ = ${f2(r.cos)};   senφ = ${f2(r.sin)};   L = ${f4(r.L / 1000)} km${npar ? `;   n = ${r.nPar}` : ''}${r.ferro ? `;   fator de eletroduto de aço = ${f2(r.ffe)}` : ''}`,
    `ΔV% = ${nfmt(r.kdv, r.kdv % 1 ? 3 : 0)} × ${f2(r.IB)} × ${f4(r.L / 1000)} × (${fR(z.R)} × ${f2(r.cos)} + ${f3(z.X)} × ${f2(r.sin)})${npar ? ` / ${r.nPar}` : ''} / ${r.Vref} × 100${r.ferro ? ` × ${f2(r.ffe)}` : ''} = ${f2(r.dv)} %   (${Vn} = ${r.Vref} V)`] });
  const mont = r.montFonte === 'alimentador' ? `a montante, alimentador ${r.montCirc}` : 'a montante, informada para o quadro';
  B.push({ t: 'ver', ok: r.dv <= r.limCirc + 1e-9, text: `ΔV do circuito = ${f2(r.dv)} % ≤ ${f2(r.limCirc)} %` });
  B.push({ t: 'ver', ok: r.dvTotal <= r.limTotal + 1e-9, text: `ΔV acumulada = ${f2(r.dvMont)} % (${mont}) + ${f2(r.dv)} % = ${f2(r.dvTotal)} % ≤ ${f2(r.limTotal)} %${r.supLongo > 0 ? ` (limite acrescido de ${f2(r.supLongo)} % — linha de ${f0(r.Lcaminho)} m)` : ''}` });

  st('Curto-circuito (5.3.5)');
  B.push({ t: 'ver', ok: r.icnOk, text: `Icc presumida no quadro ${c.quadro} = ${f1(r.icc)} kA; capacidade de interrupção do dispositivo = ${f1(r.icn)} kA` });
  if (r.cc) {
    B.push({ t: 'eq', lines: [`I²t = ${f0(r.cc.I2t)} A²s   (${r.cc.fonte})`, `k = ${r.k}   (${MATERIAL[r.mat]}, ${ISOL[r.isol]}, ${r.Sf > 300 && r.isol === 'PVC' ? 'acima de 300 mm²' : 'temperatura final ' + r.thetaCC + ' °C'})`, `S ≥ √(I²t) / k${npar ? ' / n' : ''} = √${f0(r.cc.I2t)} / ${r.k}${npar ? ` / ${r.nPar}` : ''} = ${f2(r.cc.Scalc)} mm²   →   seção requerida: ${fS(r.Scc)} mm²`] });
    B.push({ t: 'ver', ok: r.cc.k2S2 + 1e-6 >= r.cc.I2t, text: `k² × S² = ${r.k}² × ${npar ? `(${r.nPar} × ${fS(r.Sf)})` : fS(r.Sf)}² = ${f0(r.cc.k2S2)} A²s ≥ I²t = ${f0(r.cc.I2t)} A²s` });
  } else B.push({ t: 'p', text: 'Verificação da solicitação térmica não realizada (desativada nos parâmetros do projeto).' });

  st(`Proteção contra choques elétricos — seccionamento automático (esquema ${P.aterramento})`);
  if (r.tt) { B.push({ t: 'eq', lines: [`RA × IΔn = ${f1(r.tt.RA)} × ${nfmt(r.idn / 1000, 3)} = ${f2(r.tt.RA * r.idn / 1000)} V`] }); B.push({ t: 'ver', ok: r.drUsado && r.tt.ok, text: `RA × IΔn ≤ 50 V${r.drUsado ? '' : ' — dispositivo DR ausente'}` }); }
  else if (r.tn && r.tn.viaDR) B.push({ t: 'p', text: `Circuito protegido por dispositivo DR com IΔn = ${r.idn} mA, que assegura o seccionamento automático em caso de falta à massa.` });
  else if (r.tn && r.tn.fusivel) B.push({ t: 'p', text: 'Proteção por fusível: o seccionamento deve ser confirmado pela curva tempo × corrente do fabricante, com a corrente de falta Ia ≤ U0 / Zs.' });
  else if (r.tn && r.tn.Ia) {
    const Spe = secaoPE(r.Sf, r.mat), m = r.Sf / Spe;
    B.push({ t: 'eq', lines: [
      `Ia = ${r.tn.mult} × In = ${r.tn.mult} × ${r.In} = ${f0(r.tn.Ia)} A   (limite superior do disparo instantâneo${r.curva ? `, curva ${r.curva}` : ''})`,
      `m = Sf / SPE = ${fS(r.Sf)} / ${fS(Spe)} = ${f2(m)};   ρ = ${nfmt(r.tn.rho, 4)} Ω·mm²/m`,
      `Lmax = 0,8 × ${P.U0} × ${npar ? `${r.nPar} × ` : ''}${fS(r.Sf)} / [${nfmt(r.tn.rho, 4)} × (1 + ${f2(m)}) × ${f0(r.tn.Ia)}] = ${f2(r.tn.Lmax)} m`] });
    if (r.tn.S != null && r.tn.S > Math.max(r.Scap || 0, r.Smin, r.Sdv || 0)) B.push({ t: 'p', text: `O critério de seccionamento exige **${fS(r.tn.S)} mm²** (alternativa: proteger o circuito por dispositivo DR).` });
    B.push({ t: 'ver', ok: r.L <= r.tn.Lmax + 1e-9, text: `L = ${f1(r.L)} m ≤ Lmax = ${f2(r.tn.Lmax)} m` });
  } else B.push({ t: 'p', text: 'Verificação não aplicável — circuito sem condutor de proteção.' });

  st('Proteção complementar por dispositivo DR (5.1.3.2.2)');
  if (r.drExigido) B.push({ t: 'p', text: `Exigido — ${r.drMotivo}.` });
  else B.push({ t: 'p', text: r.drUsado ? 'Não exigido pela norma para este circuito; adotado por decisão de projeto.' : (c.tipo === 'ilum' && c.lumAlta ? 'Não exigido: aparelhos de iluminação instalados a altura igual ou superior a 2,50 m.' : 'Não exigido pela norma para este circuito.') });
  if (r.drUsado) B.push({ t: 'ver', ok: r.drIn != null && (!r.drExigido || r.idn <= 30 || P.aterramento === 'TT'), text: `Adotado ${r.drTipo === 'DDR' ? 'disjuntor diferencial-residual' : 'interruptor diferencial-residual'} ${r.drPolos}P ${r.drIn ?? '—'} A, IΔn = ${r.idn} mA${r.drTipo === 'IDR' ? ` (In,DR ≥ In = ${r.In} A)` : ''}` });
  else if (r.drExigido) B.push({ t: 'ver', ok: false, text: 'Dispositivo DR obrigatório não previsto.' });

  if (r.partida) {
    st('Partida do motor (6.5.1.3)');
    B.push({ t: 'eq', lines: [`Ip = (Ip/In) × In,motor = ${f1(r.partida.ipIn)} × ${f2(r.Icarga)} = ${f2(r.partida.Ip)} A;   cosφp = ${f2(r.partida.cp)}`, `ΔVp acumulada = ${f2(r.partida.dv)} %`] });
    B.push({ t: 'ver', ok: r.partida.dv <= 10 + 1e-9, text: `Queda de tensão durante a partida = ${f2(r.partida.dv)} % ≤ 10 %` });
    if (r.partida.lo != null) B.push({ t: 'ver', ok: r.partida.Ip <= r.partida.lo, text: `Ip = ${f1(r.partida.Ip)} A ≤ limiar inferior de disparo magnético da curva ${r.curva} (${f0(r.partida.lo)} A)` });
  }

  st('Seção adotada e verificação final');
  B.push({ t: 'table', head: ['Critério', 'Seção requerida (mm²)'], widths: [72, 28], align: 'lr', rows: r.reqs.map(q => [q.crit, q.S == null ? 'não atendido' : fS(q.S)]).concat([[`Seção adotada (maior valor)${npar ? ` — ${r.nPar} condutores por fase` : ''}`, fS(r.Sf)]]), lastBold: true });
  B.push({ t: 'eq', lines: [`Iz = ${npar ? `${r.nPar} × ` : ''}Ic × fator total = ${npar ? `${r.nPar} × ` : ''}${nfmt(r.Ic, r.Ic % 1 ? 1 : 0)} × ${f3(r.fTot)} = ${f2(r.Iz)} A   (Tabela ${r.tabCap}, ${fS(r.Sf)} mm²)`] });
  B.push({ t: 'ver', ok: r.IB <= r.In + 1e-9 && r.In <= r.Iz + 1e-9, text: `IB = ${f2(r.IB)} A ≤ In = ${r.In} A ≤ Iz = ${f2(r.Iz)} A` });
  B.push({ t: 'ver', ok: r.I2 <= 1.45 * r.Iz + 1e-9, text: `I2 = ${f2(r.I2)} A ≤ 1,45 × Iz = ${f2(1.45 * r.Iz)} A` });
  const np = [];
  if (r.hasN) np.push(`Neutro: ${r.neutroTxt}.`);
  if (r.SPE) {
    np.push(`Condutor de proteção (Tabela 58): ${r.Sf <= 16 ? 'S ≤ 16 mm² → SPE = S' : (r.Sf <= 35 ? '16 < S ≤ 35 mm² → SPE = 16 mm²' : 'S > 35 mm² → SPE = S/2, na seção padronizada superior')} = ${fS(r.SPEtab)} mm².`);
    if (r.pe) np.push(`Verificação adiabática do PE (6.4.3.1.2, k = ${r.pe.k}): S ≥ √${f0(r.cc.I2t)} / ${r.pe.k}${npar ? ` / ${r.nPar}` : ''} = ${f2(r.pe.Sreq)} mm² → PE adotado ${fS(r.SPE)} mm².`);
  }
  if (np.length) B.push({ t: 'p', text: np.join(' ') });
  const t = r.trecho, kc = r.calha;
  if (kc) B.push({ t: 'p', text: kc.esc ? `Conduto: ${kc.exclusivo ? 'exclusivo do circuito' : `trecho ${kc.key}, compartilhado com os circuitos ${kc.circuitos.filter(x => x.id !== c.id).map(x => x.num).join(', ') || '—'}`} — ${kc.T.nome.toLowerCase()} ${kc.esc.W} × ${kc.esc.H} mm, ocupação ${f1(kc.ocup)} % (ver dimensionamento das eletrocalhas).` : 'Conduto: não foi possível dimensionar a eletrocalha — ver dimensionamento das eletrocalhas.' });
  else if (t) B.push({ t: 'p', text: t.aplica ? (t.esc ? `Eletroduto: ${t.exclusivo ? 'exclusivo do circuito' : `trecho ${t.key}, compartilhado com os circuitos ${t.circuitos.filter(x => x.id !== c.id).map(x => x.num).join(', ') || '—'}`} — ${t.esc.nome} DN ${t.esc.dn} (${t.esc.pol}), ocupação ${f1(t.esc.ocup)} % (ver dimensionamento dos eletrodutos).` : 'Eletroduto: não foi possível dimensionar — ver dimensionamento dos eletrodutos.') : `Eletroduto: não se aplica — ${t.motivo}.` });
  B.push({ t: 'spec', status: r.status, text: `Especificação: ${condutoresTxt(r)} — ${cabosTxt(c)}; ${protecaoTxt(c, r)}${r.drUsado ? '; ' + drTxt(r) : ''}${kc ? (kc.esc ? `; ${kc.T.nome.toLowerCase()} ${kc.esc.W} × ${kc.esc.H} mm` : '') : (t && t.esc ? `; eletroduto DN ${t.esc.dn} (${t.esc.pol})` : '')}.`, label: statusTxt(r.status) });
  if (r.falhas.length || r.avisos.length) B.push({ t: 'list', items: r.falhas.map(x => 'Pendência: ' + x).concat(r.avisos.map(x => 'Observação: ' + x)) });
  if (c.obs) B.push({ t: 'note', text: c.obs });
}

function memTrecho(B, t, num) {
  B.push({ t: 'h2', text: `${num} ${t.nome}${t.exclusivo ? '' : ' — circuitos ' + t.circuitos.map(c => c.num).join(', ')}` });
  if (!t.aplica) { B.push({ t: 'p', text: `Não se aplica: ${t.motivo}.` }); return; }
  B.push({ t: 'table', small: true, head: ['Circuito', 'Condutor / cabo', 'Seção (mm²)', 'Ø externo (mm)', 'Área (mm²)'], widths: [16, 36, 16, 16, 16], align: 'llrrr',
    rows: t.itens.map(k => [k.circ, k.multipolar ? `Cabo multipolar ${k.vias} vias` : ({ F: `Fase ${k.fase}`, N: 'Neutro', PE: 'Proteção (PE)' }[k.func]), fS(k.S), k.d ? f1(k.d) : '—', f1(k.A)]).concat([['Total', `${t.n} condutor(es)/cabo(s)`, '', '', f1(t.A)]]), lastBold: true });
  const ELN = ELETRODUTOS[t.cfg.tipo];
  B.push({ t: 'eq', lines: [`Taxa máxima de ocupação (${t.n} ${t.n === 1 ? 'condutor' : 'condutores'}): ${f0(t.taxa * 100)} %`, `Ai,mín = ${f1(t.A)} / ${f2(t.taxa)} = ${f1(t.Areq)} mm²   →   Di,mín = √(4 × ${f1(t.Areq)} / π) = ${f2(t.diMin)} mm`] });
  if (t.esc) B.push({ t: 'ver', ok: t.falhas.length === 0, text: `Adotado: ${ELN.nome} (${ELN.norma}) DN ${t.esc.dn} (${t.esc.pol}) — Di = ${f1(t.esc.di)} mm; área interna ${f1(t.esc.Ai)} mm²; ocupação ${f1(t.esc.ocup)} %` });
  if (t.cfg.comp > 0) B.push({ t: 'ver', ok: !(t.excesso > 0) || (t.cfg.semCaixa && t.acrescimo), text: `Comprimento entre caixas: ${f1(t.cfg.comp)} m com ${t.cfg.curvas} curva(s) de 90°; limite ${t.base} m − ${3 * t.cfg.curvas} m = ${f1(t.Lim)} m` });
  else B.push({ t: 'note', text: 'Comprimento do trecho entre caixas não informado: verificar no projeto os limites de 6.2.11.1 (15 m internos / 30 m externos, menos 3 m por curva).' });
  t.falhas.concat(t.avisos).forEach(x => B.push({ t: 'note', text: x }));
}

function memQuadro(B, q, proj, calc, num) {
  const R = calc.res, Qd = (proj.quadros || {})[q.q] || {};
  B.push({ t: 'h2', text: `${num} Quadro ${q.q}${Qd.desc ? ' — ' + Qd.desc : ''}` });
  if (!q.cs.length) { B.push({ t: 'p', text: 'Quadro sem circuitos.' }); return; }
  const us = q.usadas;
  const wDesc = 100 - (6 + 11 + 8 + 6 + 8 + 6 + 6 + 9 + us.length * 8);
  B.push({ t: 'table', small: true, head: ['Circ.', 'Descrição', 'Ligação', 'P (W)', 'FP', 'S (VA)', 'FCT', 'FCA', ...us.map(l => `Fase ${l} (VA)`), 'Proteção'], widths: [6, wDesc, 11, 8, 6, 8, 6, 6, ...us.map(() => 8), 9], align: 'lllrrrrr' + us.map(() => 'r').join('') + 'l',
    rows: q.cs.map(c => { const r = R[c.id]; const f = cargaFases(c, r); return [c.num, c.desc || TIPOS[c.tipo], composicao(c), f0(r.P), f2(r.fp), f0(r.S), f2(r.FCT), f2(r.FCA), ...us.map(l => f[l] ? f0(f[l]) : '—'), protecaoCurta(c, r)]; })
      .concat([['Total', '', '', f0(q.cs.reduce((s, c) => s + R[c.id].P, 0)), '', f0(q.cs.reduce((s, c) => s + R[c.id].S, 0)), '', '', ...us.map(l => f0(q.fases[l])), '']]), lastBold: true });
  const d = q.dem;
  const L = [`Carga instalada dos circuitos terminais = ${f0(d.Sterm)} VA (${f0(d.Pterm)} W)`];
  if (d.Sjus > 0) L.push(`Demanda dos quadros alimentados a jusante = ${f0(d.Sjus)} VA`);
  if (d.manual) L.push(`Demanda informada pelo projetista = ${nfmt(d.dm, 2)} kVA = ${f0(d.S)} VA   (substitui o cálculo pelo fator de demanda)`);
  else L.push(`Demanda = FD × ΣS + ΣS jusante = ${f0(d.fd * 100)} % × ${f0(d.Sterm)}${d.Sjus > 0 ? ` + ${f0(d.Sjus)}` : ''} = ${f0(d.S)} VA   (${Math.abs(d.fd - 1) < 1e-9 ? 'fator de demanda de 100 %: toda a carga instalada' : 'fator de demanda adotado pelo projetista'})`);
  const P = proj.params, Id = P.fornecimento === 'trifasico' ? d.S / (Math.sqrt(3) * P.U) : (P.fornecimento === 'bifasico' ? d.S / (2 * P.U0) : d.S / P.U0);
  L.push(`Corrente de demanda = ${f0(d.S)} / ${P.fornecimento === 'trifasico' ? `(√3 × ${P.U})` : (P.fornecimento === 'bifasico' ? `(2 × ${P.U0})` : P.U0)} = ${f1(Id)} A`);
  if (us.length > 1) L.push(`Desequilíbrio = (Smáx − Smín) / Smáx × 100 = ${f1(q.deseq)} %`);
  B.push({ t: 'eq', lines: L });
  if (q.alim) B.push({ t: 'p', text: `Alimentado pelo circuito ${q.alim.num} (quadro ${q.alim.quadro}): ${condutoresTxt(R[q.alim.id])}, ${protecaoTxt(q.alim, R[q.alim.id])}.` });
}

function memCalha(B, t, num) {
  const cfg = t.cfg, rs = cfg.reserva || 0;
  B.push({ t: 'h2', text: `${num} ${t.nome}${t.exclusivo ? '' : ' — circuitos ' + t.circuitos.map(c => c.num).join(', ')}` });
  B.push({ t: 'p', text: `${t.T.nome}; maneira de instalar nº ${[...new Set(t.circuitos.map(c => c.metodo))].join(', ')} da Tabela 33${t.T.aberta ? ' (suporte aberto)' : ' (conduto fechado)'}.${cfg.comp > 0 ? ` Comprimento do trecho: ${f1(+cfg.comp)} m.` : ''}` });
  B.push({ t: 'table', small: true, head: ['Circuito', 'Condutor / cabo', 'Seção (mm²)', 'Ø externo (mm)', 'Área (mm²)', 'Peso (kg/m)'], widths: [14, 32, 13, 14, 13, 14], align: 'llrrrr',
    rows: t.itens.map(k => [k.circ, k.multipolar ? `Cabo multipolar ${k.vias} vias` : ({ F: `Fase ${k.fase}`, N: 'Neutro', PE: 'Proteção (PE)' }[k.func]), fS(k.S), k.d ? f1(k.d) : '—', f1(k.A), f3(k.w)]).concat([['Total', `${t.n} condutor(es)/cabo(s)`, '', f0(t.somaD), f1(t.A), f2(t.peso)]]), lastBold: true });
  const L = [];
  if (cfg.tipo === 'canaleta') L.push(`Seção útil informada = ${cfg.larg} × ${cfg.alt} = ${f0(cfg.larg * cfg.alt)} mm²`);
  else L.push(`Wmín = ΣA × (1 + reserva) / (taxa × H) = ${f1(t.A)} × ${f2(1 + rs / 100)} / (${f2(cfg.taxa / 100)} × ${t.H}) = ${f1(t.A * (1 + rs / 100) / (cfg.taxa / 100 * t.H))} mm`);
  if (t.camadaUnica) L.push(`Camada única: Σd × (1 + reserva) = ${f0(t.somaD)} × ${f2(1 + rs / 100)} = ${f0(t.somaD * (1 + rs / 100))} mm ≤ W`);
  if (t.esc) L.push(`Adotado ${t.esc.W} × ${t.esc.H} mm:  ocupação = ${f1(t.A)} / ${f0(t.esc.Au)} = ${f1(t.ocup)} %  (${f1(t.ocupRes)} % com a reserva de ${f0(rs)} %)`);
  if (t.nSup) L.push(`Suportes: ${f1(+cfg.comp)} m / ${f2(cfg.vao)} m + 1 = ${t.nSup} suportes`);
  B.push({ t: 'eq', lines: L });
  if (t.esc) { const sv = corteCalhaSVG(t, PAL_DOC, 'mk' + safeKey(t.key)), ar = Math.min(1, arDe(sv)); B.push({ t: 'fig', svg: svgDoc(sv, 480, Math.round(480 * ar)), ar, w: ar > 0.75 ? 46 : 80, caption: `Corte esquemático: ${t.T.nome.toLowerCase()} ${t.esc.W} × ${t.esc.H} mm com ${t.n} cabos (fase A preta, B vermelha, C branca, neutro azul, PE verde-amarelo).` }); }
  if (t.esc) B.push({ t: 'ver', ok: t.ocupRes <= cfg.taxa + 1e-6, text: `Ocupação com reserva ${f1(t.ocupRes)} % ≤ taxa máxima adotada ${f0(cfg.taxa)} %` });
  if (t.camadaUnica && t.esc) B.push({ t: 'ver', ok: t.somaD * (1 + rs / 100) <= t.esc.W + 1e-6, text: `Cabos em camada única: ${f0(t.somaD * (1 + rs / 100))} mm ≤ ${t.esc.W} mm` });
  if (cfg.carga) B.push({ t: 'ver', ok: t.peso <= cfg.carga + 1e-9, text: `Peso dos cabos ${f2(t.peso)} kg/m ≤ carga admissível ${f1(cfg.carga)} kg/m (vão de ${f2(cfg.vao)} m)` });
  t.falhas.concat(t.avisos).forEach(x => B.push({ t: 'note', text: x }));
}
function arDe(svg) { const m = /viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/.exec(svg); return m ? +m[4] / +m[3] : 0.625; }
function safeKey(k) { return String(k).replace(/[^a-zA-Z0-9]/g, ''); }

function memLumi(B, proj, calc, s) {
  const A = proj.lumi, R = calc.lumi, refs = refsLuminarias(proj, calc);
  B.push({ t: 'p', text: `Cálculo da iluminação geral dos ${A.length} ambientes pelo método dos lúmens, com verificação ponto a ponto da uniformidade, segundo os requisitos da ABNT NBR ISO/CIE 8995-1:2013. Os dados das luminárias são os de catálogo dos fabricantes indicados e devem ser confirmados na ficha técnica do produto especificado.` });
  B.push({ t: 'h3', text: `${s}.1 Resumo` });
  B.push({ t: 'table', small: true, head: ['Ambiente', 'Área (m²)', 'Em (lx)', 'Luminária', 'N', 'Eméd (lx)', 'Uo', 'P (W)', 'W/m²', 'Circ.', 'Situação'], widths: [17, 7, 7, 21, 5, 8, 6, 7, 7, 6, 9], align: 'lrrlrrrrrll',
    rows: A.map(a => { const r = R[a.id]; const c = proj.circuitos.find(x => x.id === a.circuito); return [a.nome, f2(r.A), String(r.Em), `${r.prod.fab !== '—' ? r.prod.fab + ' ' : ''}${r.prod.mod}`, String(r.N), f0(r.Emed), f2(r.Uo), f0(r.P), f1(r.dens), c ? c.num : '—', statusTxt(r.status)]; })
      .concat([['Total', f2(A.reduce((x, a) => x + R[a.id].A, 0)), '', '', String(A.reduce((x, a) => x + R[a.id].N, 0)), '', '', f0(A.reduce((x, a) => x + R[a.id].P, 0)), '', '', '']]), lastBold: true });
  A.forEach((a, i) => memLumiAmbiente(B, a, R[a.id], proj, `${s}.${i + 2}`, refs));
}

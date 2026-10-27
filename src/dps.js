/* ================================================================
   DPS — PROTEÇÃO CONTRA SURTOS
   ABNT NBR 5410:2004 (6.3.5, Tabelas 31 e 49, Figura 13), ABNT NBR 5419-4:2026,
   ABNT NBR IEC 61643-11 / IEC 61643-12, IEC 62305-4 e métodos de catálogos de
   fabricantes: Siemens 5SD7 (nível de exposição F, seção dos condutores pela
   proteção a montante, distância de proteção de 30 m) e faixas usuais de Imáx
   ================================================================ */
const UC_DPS = [175, 275, 320, 385, 440, 460, 600];
const ucDPS = U0 => UC_DPS.find(v => v >= 1.1 * U0 - 1e-9) || Math.ceil(1.1 * U0);
/* suportabilidade a impulso exigível (Tabela 31): [U0 máx, sistemas, [IV, III, II, I] kV] */
const UW_TAB31 = [[150, '115–230 / 120–240 / 127–220 V', [4, 2.5, 1.5, 0.8]], [300, '220/380 / 230/400 / 277/480 V', [6, 4, 2.5, 1.5]], [600, '400/690 V', [8, 6, 4, 2.5]], [Infinity, '1 000 V', [12, 8, 6, 4]]];
const CAT_UW = { IV: 0, III: 1, II: 2, I: 3 };
const CAT_UW_TXT = { IV: 'IV — origem da instalação', III: 'III — distribuição e circuitos terminais', II: 'II — equipamentos de utilização', I: 'I — equipamentos especialmente protegidos (eletrônicos sensíveis)' };
const uwTab31 = (U0, cat) => UW_TAB31.find(x => U0 <= x[0])[2][CAT_UW[cat]];
/* exposição a surtos: faixas usuais de catálogos de fabricantes para DPS classe II (Imáx 8/20 µs) */
const EXPO_DPS = {
  baixa: [20, 'Baixa — área urbana central, entorno com edificações mais altas ou protegidas por SPDA, linhas subterrâneas'],
  media: [40, 'Média — periferia urbana, poucas edificações protegidas no entorno'],
  alta: [65, 'Alta — área rural, edificação isolada ou em elevação, linha aérea longa']
};
const LIG_DPS = { auto: 'Pelo esquema de aterramento', pe: 'Fases e neutro ao PE (n+0)', npe: 'Fases ao neutro e centelhador N–PE (n+1)' };
const TEC_DPS = { varistor: 'Varistor (limitador de tensão)', centelhador: 'Centelhador (comutador de tensão)' };
/* método do nível de exposição F (catálogo Siemens 5SD7): F = Td × (1,6 + 2 × LBT + δ), LBT em km limitado a 0,5;
   Tabela 1 — δ pela situação da linha aérea e da edificação; Tabela 2 — In do DPS classe II pelo valor de F */
const METODO_DPS = { F: 'Nível de exposição F (catálogo Siemens)', faixa: 'Faixas de exposição baixa, média e alta (catálogos)' };
const DELTA_DPS = [[0, 'Completamente envolvida por estruturas'], [0.5, 'Algumas estruturas próximas ou situação desconhecida'], [0.75, 'Terreno plano ou descampado'], [1, 'Sobre morro, junto a água superficial ou área montanhosa']];
const IN_F = [[40, 5], [80, 10], [Infinity, 20]];
const inPorF = F => IN_F.find(x => F <= x[0])[1];
/* seção dos condutores de ligação pela proteção a montante F1 (catálogo Siemens 5SD7):
   [F1 até (A), Lq2 — lado da fase (mm²), Lq3 — lado do PE (mm²), fusível F2 no ramal do DPS (A gL/gG)];
   ligação em série (em V) ou em paralelo (em T), DPS classe I / I+II ou classe II */
const LQ_DPS = {
  'I|V': [[63, 10, 16], [80, 16, 16], [100, 25, 16], [125, 35, 16]],
  'I|T': [[25, 6, 16], [80, 10, 16], [125, 16, 16], [160, 25, 25], [250, 35, 35, 160], [315, 50, 50, 160], [Infinity, 50, 50, 160]],
  'II|V': [[40, 6, 6], [63, 10, 10]],
  'II|T': [[50, 6, 6], [80, 10, 10], [125, 16, 16], [Infinity, 16, 16, 125]]
};
function lqDPS(cl1, emV, F1) {
  const t = LQ_DPS[(cl1 ? 'I' : 'II') + '|' + (emV ? 'V' : 'T')], x = t.find(r => F1 <= r[0] + 1e-9);
  return x ? { fase: x[1], pe: x[2], F2: x[3] || null } : { fora: true, max: t[t.length - 1][0] };
}
const DIST_DPS = { norma: 'Distância por oscilação lpo (IEC 62305-4, Anexo D)', fab: 'Prática de fabricante — 30 m (catálogo Siemens)' };
const K_OSC = 25, D_COORD = 10, D_PROT_FAB = 30, IMUN_DR = 3, BACK_CLAMPER = 100;
/* zonas de proteção contra raios (NBR 5419-4): classe do DPS em cada fronteira, na simplificação usual dos catálogos (Clamper, Finder) */
const ZPR_DPS = [['ZPR 0 → 1', 'entrada da linha na edificação', 'I ou I+II com SPDA; II sem SPDA'], ['ZPR 1 → 2', 'quadros de distribuição', 'II'], ['ZPR 2 → 3', 'junto ao equipamento sensível', 'III']];
/* linhas de sinal externas (NBR 5410: toda linha externa de sinal recebe DPS na entrada da edificação, ligado ao BEP) */
const SINAL_DPS = { sinTel: ['Telefonia ou dados em par metálico', 'DPS para linha de sinal em par metálico (telefonia/dados), junto ao DG e ao BEP'], sinRede: ['Rede de dados externa (Ethernet / PoE)', 'DPS para rede de dados RJ45 (Ethernet/PoE), junto ao BEP'], sinCoax: ['Cabo coaxial (antena, CATV, CFTV)', 'DPS coaxial para antena/CATV/CFTV, junto ao BEP'] };
function dpsPadrao() { return { metodo: 'F', Td: null, alim: 'aerea', LBT: 0.5, delta: 0.5, exposicao: 'media', catEq: 'II', nSens: 0, critDist: 'norma', nServ: 1, sinTel: 0, sinRede: 0, sinCoax: 0 }; }

function calcDPS(proj, calc) {
  const P = proj.params, D = { ...dpsPadrao(), ...(proj.dps || {}) }, ps = calc.spda && calc.spda.projeto, out = { quadros: {}, falhas: [], avisos: [] };
  const exp = EXPO_DPS[D.exposicao] ? D.exposicao : 'media', catEq = CAT_UW[D.catEq] != null ? D.catEq : 'II';
  const metodo = METODO_DPS[D.metodo] ? D.metodo : 'F', critDist = DIST_DPS[D.critDist] ? D.critDist : 'norma';
  const Td = +D.Td > 0 ? +D.Td : null, sub = D.alim === 'subterranea', delta = DELTA_DPS.some(x => x[0] === +D.delta) ? +D.delta : 0.5;
  const LBT = sub ? 0 : Math.min(Math.max(+D.LBT || 0, 0), 0.5);
  const nServ = Math.max(1, Math.round(+D.nServ || 1));
  Object.assign(out, { exp, catEq, metodo, critDist, Td, sub, delta, LBT, nServ, nSens: Math.max(0, Math.round(+D.nSens || 0)), Uw: UW_TAB31.find(x => P.U0 <= x[0]) });
  // linhas de sinal que entram na edificação
  out.sinal = Object.keys(SINAL_DPS).map(k => ({ k, n: Math.max(0, Math.round(+D[k] || 0)), nome: SINAL_DPS[k][0], mat: SINAL_DPS[k][1] })).filter(x => x.n);
  out.catSinal = ps ? 'D1 (10/350 µs, descargas diretas)' : 'C2 (8/20 µs)';
  const prof = q => { let d = 0, x = q; while (x && x.alim && d < 12) { d++; x = calc.quadros[x.alim.quadro]; } return d; };
  // obrigatoriedade (NBR 5410, influências externas AQ): estrutura com SPDA (AQ3) ou linha aérea com Td > 25 (AQ2)
  out.necess = ps ? { obrig: true, txt: 'obrigatório — edificação com SPDA (AQ3)' }
    : sub ? { obrig: false, txt: 'não obrigatório — alimentação em baixa tensão totalmente subterrânea; recomendado para proteger os equipamentos' }
    : Td == null ? { obrig: null, txt: 'informe o nível ceráunico Td: com alimentação aérea, o DPS é obrigatório acima de 25 dias de trovoada por ano (AQ2)' }
    : Td > 25 ? { obrig: true, txt: `obrigatório — alimentação aérea e Td = ${nfmt(Td, 0)} > 25 dias de trovoada por ano (AQ2)` }
    : { obrig: false, txt: `não obrigatório — Td = ${nfmt(Td, 0)} ≤ 25 dias de trovoada por ano (AQ1); recomendado para proteger os equipamentos` };
  // corrente nominal dos DPS classe II: nível de exposição F (Siemens) ou faixas de exposição (Imáx de catálogo)
  if (metodo === 'F') {
    out.F = Td != null ? Td * (1.6 + 2 * LBT + delta) : null; out.InExp = out.F != null ? inPorF(out.F) : 20; out.ImaxExp = 2 * out.InExp;
    out.InTxt = out.F != null ? `nível de exposição F = ${nfmt(Td, 0)} × (1,6 + 2 × ${nfmt(LBT, 2)} + ${nfmt(delta, 2)}) = ${nfmt(out.F, 0)} → In ${out.InExp} kA` : 'Td não informado: adotado In 20 kA (F > 80, situação da maior parte do país)';
  } else {
    out.ImaxExp = EXPO_DPS[exp][0]; out.InExp = Math.max(5, out.ImaxExp / 2);
    out.InTxt = `exposição ${EXPO_DPS[exp][1].split(' — ')[0].toLowerCase()} — Imáx ${out.ImaxExp} kA`;
  }
  const pd = calc.energisa && Object.values(calc.energisa.ucs || {})[0];
  Object.values(calc.quadros).forEach(q => {
    if (!q.cs.length) return;
    const Qd = proj.quadros[q.q] || {}, r = out.quadros[q.q] = { q: q.q, desc: Qd.desc || '', ativo: Qd.dps !== false, verifs: [], materiais: [] };
    if (!r.ativo) { r.status = 'off'; return; }
    const nF = q.usadas.length, origem = !q.alim, v = (st, t) => r.verifs.push([st, t]);
    r.origem = origem; r.nF = nF; r.fases = q.usadas.slice();
    r.nivel = prof(q); r.zpr = ZPR_DPS[Math.min(r.nivel, 1)][0];
    // classe: I+II na entrada quando há SPDA (descargas diretas); II nos demais quadros
    r.classeAuto = origem && (ps || (metodo === 'faixa' && exp === 'alta')) ? 'I+II' : 'II';
    r.classe = ['I+II', 'II'].includes(Qd.dpsClasse) ? Qd.dpsClasse : r.classeAuto;
    const cl1 = r.classe === 'I+II';
    // modos de proteção (Figura 13): no TN-C-S o neutro é aterrado no BEP do quadro de entrada e dispensa o módulo N–PE
    r.lig = Qd.dpsLig === 'pe' || Qd.dpsLig === 'npe' ? Qd.dpsLig : (P.aterramento === 'TT' ? 'npe' : 'pe');
    r.semNPE = r.lig === 'pe' && origem && P.aterramento === 'TN-C-S';
    r.nPolos = r.semNPE ? nF : nF + 1;
    r.esquema = r.lig === 'npe' ? 3 : r.semNPE ? 1 : 2;
    r.ligTxt = r.lig === 'npe' ? `${nF}+1 — fases ao neutro e centelhador N–PE` : r.semNPE ? `${nF}+0 — fases ao PEN / BEP (neutro aterrado no BEP)` : `${nF + 1}+0 — fases e neutro ao PE`;
    // tensão de operação contínua (Tabela 49): valor do produto ou menor valor comercial
    r.UcMinF = 1.1 * P.U0; r.UcMinN = P.U0; r.UcProd = +Qd.dpsUc > 0; r.Uc = r.UcProd ? +Qd.dpsUc : ucDPS(P.U0);
    r.UcN = r.lig === 'npe' ? Math.max(255, ucDPS(P.U0 / 1.1)) : r.Uc;
    // correntes: In pelo método escolhido (mínimo de 5 kA da NBR 5410); Iimp ≥ 12,5 kA ou o do nível do SPDA
    r.Imax = out.ImaxExp; r.InReq = Math.max(5, out.InExp, cl1 ? 20 : 0); r.InProd = +Qd.dpsIn > 0; r.In = r.InProd ? +Qd.dpsIn : r.InReq;
    if (cl1) { r.IimpSPDA = ps ? ps.Iimp / nServ : 0; r.IimpMin = Math.max(12.5, r.IimpSPDA); r.Iimp = Math.max(12.5, +Qd.dpsIimp || 0, r.IimpMin); r.IimpNPE = r.lig === 'npe' ? r.Iimp * (nF + 1) : r.Iimp; }
    // nível de proteção (Tabela 31) e nível efetivo com os condutores de ligação
    r.Uw2 = uwTab31(P.U0, 'II'); r.Uw3 = uwTab31(P.U0, 'III'); r.UwEq = uwTab31(P.U0, catEq);
    r.Up = +Qd.dpsUp > 0 ? +Qd.dpsUp : (cl1 ? 1.5 : (P.U0 <= 150 ? 1.2 : 1.5)); r.UpPadrao = !(+Qd.dpsUp > 0);
    r.tec = cl1 && Qd.dpsTec === 'centelhador' ? 'centelhador' : 'varistor'; r.emV = !!Qd.dpsV;
    // ΔU ≈ 1 kV por metro de condutor de ligação para correntes de descarga direta (classe I); desprezível na classe II e na ligação em V
    r.L = +Qd.dpsL > 0 ? +Qd.dpsL : 0.5; r.dU = cl1 && !r.emV ? r.L * 1 : 0;
    r.Upf = r.tec === 'centelhador' ? Math.max(r.Up, r.dU) : r.Up + r.dU;
    r.UpPE = r.lig === 'npe' && +Qd.dpsUpPE > 0 ? +Qd.dpsUpPE : null; r.UpfPE = r.UpPE != null ? r.UpPE + r.dU : null;
    r.soDist = q.cs.every(c => c.tipo === 'dist'); r.UwRef = r.soDist ? r.Uw3 : r.UwEq; r.catRef = r.soDist ? 'III' : catEq;
    // proteção a montante (F1), retaguarda do fabricante e curto-circuito
    r.back = +Qd.dpsBack > 0 ? +Qd.dpsBack : null; r.isccr = +Qd.dpsIsccr > 0 ? +Qd.dpsIsccr : null; r.icc = +Qd.icc || +P.icc || null;
    r.ifi = +Qd.dpsIfi > 0 ? +Qd.dpsIfi : null;
    r.Imont = q.alim ? calc.res[q.alim.id].In : (+Qd.dgIn > 0 ? +Qd.dgIn : (pd && pd.padrao && pd.padrao.disj) || null);
    // condutores de ligação: mínimo da NBR 5410 e seção do fabricante pela proteção a montante
    r.SminNBR = cl1 || (ps && origem) ? 16 : 4;
    r.lq = r.Imont ? lqDPS(cl1, r.emV, r.Imont) : null;
    r.Srec = Math.max(r.SminNBR, r.lq && !r.lq.fora ? Math.max(r.lq.fase, r.lq.pe) : 0);
    r.S = +Qd.dpsS > 0 ? +Qd.dpsS : r.Srec;
    r.F2 = r.back && r.Imont && r.Imont > r.back ? r.back : (!r.back && r.lq && r.lq.F2 ? r.lq.F2 : null);
    // retaguarda pelo curto-circuito (prática Clamper): acima do curto suportável pelo desligador interno, fusível dedicado por fase
    r.iscSem = +Qd.dpsIscSem > 0 ? +Qd.dpsIscSem : null; r.F2cc = !!(r.iscSem && r.icc && r.icc > r.iscSem + 1e-9);
    if (r.F2cc && !r.F2) r.F2 = r.back || BACK_CLAMPER;
    // distância de proteção: oscilação (lpo = (Uw − Up/f) / k, dispensada se Up/f < Uw/2 ou circuito < 10 m) ou 30 m do fabricante
    if (critDist === 'fab') { r.dProt = D_PROT_FAB; r.distDispensa = false; }
    else { r.dProt = Math.max(0, (r.UwEq - r.Upf) * 1000 / K_OSC); r.distDispensa = r.Upf < r.UwEq / 2; }
    r.foraDist = r.soDist || r.distDispensa ? [] : q.cs.filter(c => c.tipo !== 'dist' && (critDist === 'fab' || (+c.L || 0) >= 10) && (+c.L || 0) > r.dProt + 1e-9).map(c => c.num);
    // verificações
    const cmp = (a, b) => a >= b - 1e-9 ? '≥' : '<';
    v(r.Uc >= r.UcMinF - 1e-9 ? 'ok' : 'fail', `Uc = ${r.Uc} V ${cmp(r.Uc, r.UcMinF)} 1,1 × U0 = ${nfmt(r.UcMinF, 0)} V nos modos das fases (Tabela 49)${r.UcProd ? ' — valor do produto' : ' — menor valor comercial'}`);
    v(r.UcN >= r.UcMinN - 1e-9 ? 'ok' : 'fail', `Uc N–PE = ${r.UcN} V ${cmp(r.UcN, r.UcMinN)} U0 = ${P.U0} V${r.lig === 'npe' ? ' (centelhador)' : ''}`);
    if (r.semNPE) v('ok', 'Neutro aterrado no BEP deste quadro (TN-C-S): DPS só nas fases, ligados ao PEN / BEP (NBR 5410, Figura 13, esquema de conexão 1)');
    v(r.Up <= r.Uw2 + 1e-9 ? 'ok' : 'fail', `Up = ${nfmt(r.Up, 2)} kV ≤ ${nfmt(r.Uw2, 1)} kV (categoria II da Tabela 31)${r.UpPadrao ? ' — valor típico; confirme no catálogo' : ''}`);
    if (cl1) {
      if (r.tec === 'centelhador') v(r.ifi && r.icc ? (r.ifi >= r.icc - 1e-9 ? 'ok' : 'fail') : 'info', r.ifi && r.icc ? `Corrente subsequente interrompida Ifi = ${nfmt(r.ifi, 1)} kA ${cmp(r.ifi, r.icc)} curto-circuito presumido de ${nfmt(r.icc, 1)} kA` : `Centelhador: a corrente subsequente interrompida Ifi deve ser ≥ ${r.icc ? nfmt(r.icc, 1) + ' kA (curto-circuito presumido)' : 'a corrente de curto-circuito presumida no quadro'}; informe o valor do catálogo`);
      v(r.Iimp >= r.IimpMin - 1e-9 ? 'ok' : 'fail', `Iimp = ${nfmt(r.Iimp, 2)} kA (10/350 µs) por modo ≥ ${nfmt(r.IimpMin, 2)} kA${ps ? ` — NP ${ps.base}: ${ps.Ip} kA × 0,5 / (${nServ} serviço${nServ > 1 ? 's' : ''} × ${ps.nModos} condutores) = ${nfmt(r.IimpSPDA, 2)} kA (NBR 5419-1, Anexo E)${r.IimpSPDA < 12.5 ? '; mínimo de 12,5 kA' : ''}` : ' (mínimo de 12,5 kA)'}`);
      if (r.lig === 'npe') v('info', `Centelhador N–PE: Iimp ≥ ${nfmt(r.IimpNPE, 1)} kA (soma das correntes dos ${nF + 1} condutores)`);
    }
    if (r.lig === 'npe') v('info', 'Centelhador N–PE: corrente subsequente interrompida Ifi ≥ 100 A (NBR 5410).');
    v(r.In >= r.InReq - 1e-9 ? 'ok' : 'fail', `${r.InProd ? `In do produto = ${nfmt(r.In, 0)} kA ${cmp(r.In, r.InReq)} ${nfmt(r.InReq, 0)} kA exigidos` : `In = ${nfmt(r.In, 0)} kA`} (8/20 µs) por modo — ${out.InTxt}${cl1 ? '; DPS classe I+II: In ≥ 20 kA (faixa de catálogo)' : ''}; mínimo de 5 kA da NBR 5410`);
    v(r.L <= 0.5 + 1e-9 ? 'ok' : 'fail', `Condutores de ligação: ${nfmt(r.L, 2)} m ≤ 0,5 m (comprimento total, condutor vivo → DPS → barramento PE)`);
    v(r.S >= r.SminNBR - 1e-9 ? 'ok' : 'fail', `Seção dos condutores de ligação ${fS(r.S)} mm² ${cmp(r.S, r.SminNBR)} ${r.SminNBR} mm² Cu (NBR 5410${r.SminNBR === 16 ? ', DPS classe I / estrutura com SPDA' : ''})`);
    const lig = r.emV ? 'ligação em série (em V)' : 'ligação em paralelo (em T)';
    if (r.lq && !r.lq.fora) { const sl = Math.max(r.lq.fase, r.lq.pe); v(r.S >= sl - 1e-9 ? 'ok' : 'warn', `Seção pela proteção a montante de ${r.Imont} A — ${lig}, catálogo Siemens: lado da fase ${r.lq.fase} mm², lado do PE ${r.lq.pe} mm²${r.lq.F2 ? `, com fusível F2 de ${r.lq.F2} A gL/gG no ramal do DPS` : ''}${r.S < sl - 1e-9 ? ` — adotados ${fS(r.S)} mm²` : ''}`); }
    else if (r.lq) v('warn', `Ligação em série (em V) com proteção a montante de ${r.Imont} A: o fabricante prevê até ${r.lq.max} A — use a ligação em paralelo (em T) com retaguarda própria.`);
    else v('info', 'Informe o disjuntor geral do quadro para obter a seção dos condutores de ligação pela proteção a montante (catálogo Siemens).');
    v(r.Upf <= r.UwRef + 1e-9 ? 'ok' : 'warn', `Nível efetivo Up/f = ${r.tec === 'centelhador' ? 'máx(Up; ΔU)' : 'Up + ΔU'} = ${r.tec === 'centelhador' ? `máx(${nfmt(r.Up, 2)}; ${nfmt(r.dU, 2)})` : `${nfmt(r.Up, 2)} + ${nfmt(r.dU, 2)}`} = ${nfmt(r.Upf, 2)} kV ${r.Upf <= r.UwRef + 1e-9 ? '≤' : '>'} Uw = ${nfmt(r.UwRef, 1)} kV (categoria ${r.catRef}${r.soDist ? ', quadro só de distribuição' : ''})${r.Upf > r.UwRef + 1e-9 ? ': prever DPS classe III junto aos equipamentos ou ligação em V' : ''}`);
    if (r.lig === 'npe') v(r.UpfPE == null ? 'info' : r.UpfPE <= r.UwRef + 1e-9 ? 'ok' : 'warn', r.UpfPE == null ? 'Ligação n+1: confirme no catálogo o Up entre fase e PE (módulo da fase em série com o centelhador N–PE; na linha Siemens 5SD7, de 1,7 a 2,5 kV).' : `Nível de proteção fase–PE da ligação n+1: ${nfmt(r.UpPE, 2)} + ${nfmt(r.dU, 2)} = ${nfmt(r.UpfPE, 2)} kV ${r.UpfPE <= r.UwRef + 1e-9 ? '≤' : '>'} Uw = ${nfmt(r.UwRef, 1)} kV${r.UpfPE > r.UwRef + 1e-9 ? ': proteger os equipamentos com DPS classe II ou III a jusante' : ''}`);
    if (!r.soDist) {
      const base = critDist === 'fab' ? `Distância de proteção de ${D_PROT_FAB} m (prática de fabricante, catálogo Siemens)` : `Distância de proteção por oscilação lpo = (Uw − Up/f) / ${K_OSC} V/m = ${nfmt(r.dProt, 1)} m`;
      v(r.foraDist.length && !out.nSens ? 'warn' : 'ok', r.distDispensa ? `Distância de proteção: Up/f = ${nfmt(r.Upf, 2)} kV < Uw/2 = ${nfmt(r.UwEq / 2, 2)} kV — distância por oscilação dispensada` : `${base}${!r.foraDist.length ? ' — todos os circuitos atendem' : `; circuitos ${r.foraDist.join(', ')} mais longos: ${out.nSens ? `equipamentos sensíveis protegidos pelos ${out.nSens} DPS classe III previstos` : 'DPS classe III junto aos equipamentos sensíveis'}`}`);
    }
    if (r.back == null && r.F2) v('info', `Proteção a montante de ${r.Imont} A: prever fusível F2 de ${r.F2} A gL/gG no ramal do DPS (catálogo Siemens) ou a retaguarda indicada pelo fabricante do produto.`);
    else if (r.back == null) v('info', 'Proteção de retaguarda: informe a corrente máxima do fusível ou disjuntor indicada pelo fabricante do DPS.');
    else if (r.Imont && r.Imont > r.back) v('warn', `A proteção a montante (${r.Imont} A) excede a retaguarda máxima do DPS (${r.back} A): instalar dispositivo de retaguarda dedicado de ${r.back} A — valor menor pode romper com surtos abaixo dos nominais do DPS.`);
    else v('ok', `Proteção a montante${r.Imont ? ` de ${r.Imont} A` : ''} dentro da retaguarda máxima do fabricante (${r.back} A)`);
    if (r.iscSem && r.icc) v(r.F2cc ? 'info' : 'ok', r.F2cc ? `Curto-circuito presumido ${nfmt(r.icc, 1)} kA > ${nfmt(r.iscSem, 1)} kA suportados pelo desligador interno do DPS: fusível de retaguarda dedicado por fase, de ${r.F2} A gL/gG (prática Clamper)` : `Curto-circuito presumido ${nfmt(r.icc, 1)} kA ≤ ${nfmt(r.iscSem, 1)} kA suportados pelo desligador interno: retaguarda dedicada dispensada pelo curto-circuito`);
    if (r.isccr && r.icc) v(r.icc <= r.isccr + 1e-9 ? 'ok' : 'fail', `Corrente de curto-circuito presumida ${nfmt(r.icc, 1)} kA ≤ ${nfmt(r.isccr, 1)} kA suportável pelo DPS com a retaguarda (Isccr)`);
    else v('info', 'Informe a corrente de curto-circuito suportável do DPS (Isccr) para comparar com a do quadro.');
    if (P.aterramento === 'TT') v(r.lig === 'npe' ? 'ok' : 'warn', r.lig === 'npe' ? 'Esquema TT: DPS a montante do DR com ligação n+1 (NBR 5410, Figura 13, esquema de conexão 3)' : 'Esquema TT com DPS ao PE: só a jusante do DR; a montante do DR use a ligação n+1 (NBR 5410, Figura 13)');
    if (!origem) {
      const up = out.quadros[q.alim.quadro], Lc = +q.alim.L || 0;
      if (up && up.ativo && Qd.dpsCoord) v('ok', `Coordenação com o DPS do ${q.alim.quadro}: produtos declarados coordenados pelo fabricante`);
      else if (up && up.ativo && Lc < D_COORD) v('warn', `Coordenação: ${nfmt(Lc, 1)} m de cabo entre os DPS do ${q.alim.quadro} e deste quadro (< ${D_COORD} m) — use DPS declarados coordenados pelo fabricante ou indutor de desacoplamento.`);
      else if (up && up.ativo) v('ok', `Coordenação com o DPS do ${q.alim.quadro}: ${nfmt(Lc, 1)} m de cabo entre os estágios (≥ ${D_COORD} m)`);
    }
    if (Qd.dpsJusDR) v('info', `DPS a jusante de DR: o DR, instantâneo ou temporizado, deve ter imunidade a correntes de surto de no mínimo ${IMUN_DR} kA (8/20 µs) — DR tipo S recomendado.`);
    r.status = r.verifs.some(x => x[0] === 'fail') ? 'fail' : r.verifs.some(x => x[0] === 'warn') ? 'warn' : 'ok';
    // especificação e materiais
    const corr = cl1 ? `Iimp ${nfmt(r.Iimp, 1)} kA (10/350 µs), In ${nfmt(r.In, 0)} kA` : `In ${nfmt(r.In, 0)} kA, Imáx ${r.Imax} kA (8/20 µs)`;
    r.spec = `DPS classe ${r.classe}${cl1 ? ` (${r.tec})` : ''}, ligação ${r.ligTxt}: Uc ${r.Uc} V, ${corr}, Up ≤ ${nfmt(r.Up, 1)} kV`;
    const nb = 'ABNT NBR IEC 61643-11';
    if (r.lig === 'pe') r.materiais.push([`DPS classe ${r.classe} unipolar${cl1 ? ` (${r.tec})` : ''} — Uc ${r.Uc} V, ${corr}, Up ≤ ${nfmt(r.Up, 1)} kV`, r.nPolos, 'un', nb]);
    else {
      r.materiais.push([`DPS classe ${r.classe} unipolar (fase–neutro) — Uc ${r.Uc} V, ${corr}, Up ≤ ${nfmt(r.Up, 1)} kV`, nF, 'un', nb]);
      r.materiais.push([`Centelhador N–PE classe ${r.classe} — Uc ${r.UcN} V, ${cl1 ? `Iimp ${nfmt(r.IimpNPE, 0)} kA (10/350 µs)` : `In ${nfmt(r.In * (nF + 1) / 2, 0)} kA (8/20 µs)`}`, 1, 'un', nb]);
    }
    r.materiais.push([`Condutor de cobre ${fS(r.S)} mm² para ligação dos DPS (fases e PE)`, Math.max(1, Math.ceil((r.nPolos + 1) * r.L)), 'm', 'ABNT NBR NM 247-3']);
    if (r.F2) r.materiais.push([`Fusível gL/gG ou disjuntor de retaguarda dos DPS — ${r.F2} A (conforme o fabricante)`, nF, 'un', 'ABNT NBR IEC 60269 / NBR NM 60898']);
  });
  const lista = Object.values(out.quadros).filter(r => r.ativo);
  if (out.nSens) out.classe3 = { n: out.nSens, Uc: ucDPS(P.U0) };
  if (lista.some(r => r.foraDist && r.foraDist.length) && !out.nSens) out.avisos.push('Há circuitos além da distância de proteção do DPS do quadro: informe os pontos com equipamentos sensíveis para prever DPS classe III junto a eles.');
  else if (lista.some(r => r.status === 'warn' && r.Upf > r.UwRef) && !out.nSens) out.avisos.push('O nível de proteção efetivo excede a suportabilidade dos equipamentos em algum quadro: informe os pontos com equipamentos sensíveis para prever DPS classe III.');
  // o DPS obrigatório fica no ponto de entrada ou no quadro de distribuição principal (NBR 5410)
  const ent = Object.values(out.quadros).find(r => calc.quadros[r.q] && !calc.quadros[r.q].alim);
  out.semEntrada = !!(out.necess.obrig && ent && !ent.ativo);
  if (out.semEntrada) out.avisos.push(`DPS obrigatório (${out.necess.txt.split(' — ')[1]}) e o quadro de entrada ${ent.q} está sem DPS: instale-o no ponto de entrada ou no quadro de distribuição principal (NBR 5410).`);
  out.status = out.semEntrada || lista.some(r => r.status === 'fail') ? 'fail' : (lista.some(r => r.status === 'warn') || out.avisos.length ? 'warn' : 'ok');
  return out;
}

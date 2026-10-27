/* ================================================================
   DPS — PROTEÇÃO CONTRA SURTOS
   ABNT NBR 5410:2004 (6.3.5, Tabelas 31 e 49), ABNT NBR 5419-4:2026,
   ABNT NBR IEC 61643-11 / IEC 61643-12, IEC 62305-4 e critérios usuais
   de catálogos de fabricantes (Imáx por exposição, Iimp por nível de proteção)
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
/* parâmetros complementares: k da distância de proteção por oscilação (IEC 62305-4, Anexo D),
   distância informativa de coordenação entre estágios (IEC 61643-12) e sobretensões temporárias (IEC 61643-11) */
const K_OSC = 25, D_COORD = 10, UT_FATOR = 1.45, UT_NPE_TT = 1200;
function dpsPadrao() { return { exposicao: 'media', catEq: 'II', nSens: 0 }; }

function calcDPS(proj, calc) {
  const P = proj.params, D = { ...dpsPadrao(), ...(proj.dps || {}) }, ps = calc.spda && calc.spda.projeto, out = { quadros: {}, falhas: [], avisos: [] };
  const exp = EXPO_DPS[D.exposicao] ? D.exposicao : 'media', catEq = CAT_UW[D.catEq] != null ? D.catEq : 'II';
  Object.assign(out, { exp, catEq, nSens: Math.max(0, Math.round(+D.nSens || 0)), Uw: UW_TAB31.find(x => P.U0 <= x[0]) });
  Object.values(calc.quadros).forEach(q => {
    if (!q.cs.length) return;
    const Qd = proj.quadros[q.q] || {}, r = out.quadros[q.q] = { q: q.q, desc: Qd.desc || '', ativo: Qd.dps !== false, verifs: [], materiais: [] };
    if (!r.ativo) { r.status = 'off'; return; }
    const nF = q.usadas.length, origem = !q.alim, v = (st, t) => r.verifs.push([st, t]);
    r.origem = origem; r.nF = nF;
    // classe: I+II na entrada quando há SPDA ou exposição alta; II nos demais quadros
    r.classeAuto = origem && (ps || exp === 'alta') ? 'I+II' : 'II';
    r.classe = ['I+II', 'II'].includes(Qd.dpsClasse) ? Qd.dpsClasse : r.classeAuto;
    const cl1 = r.classe === 'I+II';
    // modos de proteção pela ligação
    r.lig = Qd.dpsLig === 'pe' || Qd.dpsLig === 'npe' ? Qd.dpsLig : (P.aterramento === 'TT' ? 'npe' : 'pe');
    r.ligTxt = r.lig === 'pe' ? `${nF + 1}+0 — fases e neutro ao PE` : `${nF}+1 — fases ao neutro e centelhador N–PE`;
    r.nPolos = nF + 1;
    // tensão de operação contínua (Tabela 49)
    r.UcMinF = 1.1 * P.U0; r.UcMinN = P.U0; r.Uc = ucDPS(P.U0); r.UcN = r.lig === 'npe' ? Math.max(255, ucDPS(P.U0 / 1.1)) : r.Uc;
    // correntes: In ≥ 5 kA (NBR 5410); Imáx pela exposição (fabricantes); Iimp ≥ 12,5 kA ou o do nível do SPDA
    r.Imax = EXPO_DPS[exp][0]; r.In = Math.max(5, r.Imax / 2, cl1 ? 20 : 0);
    if (cl1) { r.IimpMin = Math.max(12.5, ps ? ps.Iimp : 0); r.Iimp = Math.max(12.5, +Qd.dpsIimp || 0, r.IimpMin); r.IimpNPE = r.lig === 'npe' ? r.Iimp * (nF + 1) : r.Iimp; }
    // nível de proteção (Tabela 31) e nível efetivo com os condutores de ligação
    r.Uw2 = uwTab31(P.U0, 'II'); r.Uw3 = uwTab31(P.U0, 'III'); r.UwEq = uwTab31(P.U0, catEq);
    r.Up = +Qd.dpsUp > 0 ? +Qd.dpsUp : (cl1 ? 1.5 : (P.U0 <= 150 ? 1.2 : 1.5)); r.UpPadrao = !(+Qd.dpsUp > 0);
    r.tec = cl1 && Qd.dpsTec === 'centelhador' ? 'centelhador' : 'varistor'; r.emV = !!Qd.dpsV;
    // ΔU ≈ 1 kV por metro de condutor de ligação para correntes de descarga direta (classe I); desprezível na classe II e na ligação em V
    r.L = +Qd.dpsL > 0 ? +Qd.dpsL : 0.5; r.dU = cl1 && !r.emV ? r.L * 1 : 0;
    r.Upf = r.tec === 'centelhador' ? Math.max(r.Up, r.dU) : r.Up + r.dU;
    r.soDist = q.cs.every(c => c.tipo === 'dist'); r.UwRef = r.soDist ? r.Uw3 : r.UwEq; r.catRef = r.soDist ? 'III' : catEq;
    // condutores de ligação, retaguarda e curto-circuito
    r.Smin = cl1 || (ps && origem) ? 16 : 4; r.S = +Qd.dpsS > 0 ? +Qd.dpsS : r.Smin;
    r.back = +Qd.dpsBack > 0 ? +Qd.dpsBack : null; r.isccr = +Qd.dpsIsccr > 0 ? +Qd.dpsIsccr : null; r.icc = +Qd.icc || +P.icc || null;
    r.Imont = q.alim ? calc.res[q.alim.id].In : (+Qd.dgIn > 0 ? +Qd.dgIn : null);
    // sobretensões temporárias (TOV) e corrente subsequente dos centelhadores
    r.UTmin = UT_FATOR * P.U0; r.UT = +Qd.dpsUT > 0 ? +Qd.dpsUT : null; r.UTnpe = P.aterramento === 'TT' && r.lig === 'npe' ? UT_NPE_TT : null;
    r.ifi = +Qd.dpsIfi > 0 ? +Qd.dpsIfi : null;
    // distância de proteção por oscilação: lpo = (Uw − Up/f) / k; desconsiderada se o circuito tem menos de 10 m ou Up/f < Uw/2
    r.lpo = Math.max(0, (r.UwEq - r.Upf) * 1000 / K_OSC); r.lpoDispensa = r.Upf < r.UwEq / 2;
    r.foraLpo = r.soDist || r.lpoDispensa ? [] : q.cs.filter(c => c.tipo !== 'dist' && (+c.L || 0) >= 10 && (+c.L || 0) > r.lpo).map(c => c.num);
    // verificações
    v(r.Uc >= r.UcMinF - 1e-9 ? 'ok' : 'fail', `Uc = ${r.Uc} V ≥ 1,1 × U0 = ${nfmt(r.UcMinF, 0)} V nos modos das fases (Tabela 49)`);
    v(r.UcN >= r.UcMinN - 1e-9 ? 'ok' : 'fail', `Uc N–PE = ${r.UcN} V ≥ U0 = ${P.U0} V${r.lig === 'npe' ? ' (centelhador)' : ''}`);
    v(r.Up <= r.Uw2 + 1e-9 ? 'ok' : 'fail', `Up = ${nfmt(r.Up, 2)} kV ≤ ${nfmt(r.Uw2, 1)} kV (categoria II da Tabela 31)${r.UpPadrao ? ' — valor típico; confirme no catálogo' : ''}`);
    v(r.UT ? (r.UT >= r.UTmin - 1e-9 ? 'ok' : 'fail') : 'info', r.UT ? `Sobretensão temporária suportável UT = ${nfmt(r.UT, 0)} V ${r.UT >= r.UTmin - 1e-9 ? '≥' : '<'} 1,45 × U0 = ${nfmt(r.UTmin, 0)} V por 5 s (falhas na baixa tensão)` : `Sobretensão temporária: o DPS deve suportar UT ≥ 1,45 × U0 = ${nfmt(r.UTmin, 0)} V por 5 s (ensaio TOV do fabricante, IEC 61643-11)`);
    if (r.UTnpe) v('info', `Centelhador N–PE no esquema TT: suportar ${UT_NPE_TT} V por 200 ms (falhas na alta tensão)`);
    if (cl1) {
      if (r.tec === 'centelhador') v(r.ifi && r.icc ? (r.ifi >= r.icc - 1e-9 ? 'ok' : 'fail') : 'info', r.ifi && r.icc ? `Corrente subsequente interrompida Ifi = ${nfmt(r.ifi, 1)} kA ${r.ifi >= r.icc - 1e-9 ? '≥' : '<'} curto-circuito presumido de ${nfmt(r.icc || 0, 1)} kA` : `Centelhador: a corrente subsequente interrompida Ifi deve ser ≥ ${r.icc ? nfmt(r.icc, 1) + ' kA (curto-circuito presumido)' : 'a corrente de curto-circuito presumida no quadro'}; informe o valor do catálogo`);
      v(r.Iimp >= r.IimpMin - 1e-9 ? 'ok' : 'fail', `Iimp = ${nfmt(r.Iimp, 2)} kA (10/350 µs) por modo ≥ ${nfmt(r.IimpMin, 2)} kA${ps && origem ? ` (NP ${ps.base} do SPDA)` : ' (mínimo de 12,5 kA)'}`);
      if (r.lig === 'npe') v('info', `Centelhador N–PE: Iimp ≥ ${nfmt(r.IimpNPE, 1)} kA (soma das correntes dos ${nF + 1} condutores)`);
    }
    v(r.In >= 5 ? 'ok' : 'fail', `In = ${nfmt(r.In, 0)} kA (8/20 µs) ≥ 5 kA por modo; Imáx = ${r.Imax} kA para exposição ${EXPO_DPS[exp][1].split(' — ')[0].toLowerCase()}`);
    v(r.L <= 0.5 + 1e-9 ? 'ok' : 'fail', `Condutores de ligação: ${nfmt(r.L, 2)} m ≤ 0,5 m (comprimento total, condutor vivo → DPS → barramento PE)`);
    v(r.S >= r.Smin - 1e-9 ? 'ok' : 'fail', `Seção dos condutores de ligação ${fS(r.S)} mm² ≥ ${r.Smin} mm² Cu${r.Smin === 16 ? ' (DPS classe I / estrutura com SPDA)' : ''}`);
    v(r.Upf <= r.UwRef + 1e-9 ? 'ok' : 'warn', `Nível efetivo Up/f = ${r.tec === 'centelhador' ? 'máx(Up; ΔU)' : 'Up + ΔU'} = ${r.tec === 'centelhador' ? `máx(${nfmt(r.Up, 2)}; ${nfmt(r.dU, 2)})` : `${nfmt(r.Up, 2)} + ${nfmt(r.dU, 2)}`} = ${nfmt(r.Upf, 2)} kV ${r.Upf <= r.UwRef + 1e-9 ? '≤' : '>'} Uw = ${nfmt(r.UwRef, 1)} kV (categoria ${r.catRef}${r.soDist ? ', quadro só de distribuição' : ''})${r.Upf > r.UwRef + 1e-9 ? ': prever DPS classe III junto aos equipamentos ou ligação em V' : ''}`);
    if (!r.soDist) v(r.foraLpo.length && !out.nSens ? 'warn' : 'ok', r.lpoDispensa ? `Distância de proteção: Up/f = ${nfmt(r.Upf, 2)} kV < Uw/2 = ${nfmt(r.UwEq / 2, 2)} kV — distância por oscilação dispensada` : `Distância de proteção por oscilação lpo = (Uw − Up/f) / ${K_OSC} V/m = ${nfmt(r.lpo, 1)} m${!r.foraLpo.length ? ' — todos os circuitos atendem' : `; circuitos ${r.foraLpo.join(', ')} mais longos: ${out.nSens ? `equipamentos sensíveis protegidos pelos ${out.nSens} DPS classe III previstos` : `DPS classe III junto aos equipamentos sensíveis ou DPS com Up/f ≤ ${nfmt(r.UwEq / 2, 2)} kV`}`}`);
    if (r.back == null) v('info', 'Proteção de retaguarda: informe a corrente máxima do fusível ou disjuntor indicada pelo fabricante do DPS.');
    else if (r.Imont && r.Imont > r.back) v('warn', `A proteção a montante (${r.Imont} A) excede a retaguarda máxima do DPS (${r.back} A): instalar dispositivo de retaguarda dedicado de até ${r.back} A.`);
    else v('ok', `Proteção a montante${r.Imont ? ` de ${r.Imont} A` : ''} dentro da retaguarda máxima do fabricante (${r.back} A)`);
    if (r.isccr && r.icc) v(r.icc <= r.isccr + 1e-9 ? 'ok' : 'fail', `Corrente de curto-circuito presumida ${nfmt(r.icc, 1)} kA ≤ ${nfmt(r.isccr, 1)} kA suportável pelo DPS com a retaguarda (Isccr)`);
    else v('info', 'Informe a corrente de curto-circuito suportável do DPS (Isccr) para comparar com a do quadro.');
    if (P.aterramento === 'TT') v(r.lig === 'npe' ? 'ok' : 'warn', r.lig === 'npe' ? 'Esquema TT: DPS a montante do DR com ligação n+1 (NBR 5410, Figura 13)' : 'Esquema TT com DPS ao PE: só a jusante do DR; a montante do DR use a ligação n+1 (NBR 5410, Figura 13)');
    if (!origem) {
      const up = out.quadros[q.alim.quadro], Lc = +q.alim.L || 0;
      if (up && up.ativo && Qd.dpsCoord) v('ok', `Coordenação com o DPS do ${q.alim.quadro}: produtos declarados coordenados pelo fabricante`);
      else if (up && up.ativo && Lc < D_COORD) v('warn', `Coordenação: ${nfmt(Lc, 1)} m de cabo entre os DPS do ${q.alim.quadro} e deste quadro (< ${D_COORD} m) — use DPS declarados coordenados pelo fabricante ou indutor de desacoplamento.`);
      else if (up && up.ativo) v('ok', `Coordenação com o DPS do ${q.alim.quadro}: ${nfmt(Lc, 1)} m de cabo entre os estágios (≥ ${D_COORD} m)`);
    }
    if (Qd.dpsJusDR) v('info', 'DPS a jusante de DR geral: o DR deve ser seletivo (tipo S) e imune a surtos, para não atuar a cada descarga.');
    if (r.lig === 'npe') v('info', 'Centelhador N–PE: corrente subsequente interrompida Ifi ≥ 100 A (IEC 60364-5-534).');
    r.status = r.verifs.some(x => x[0] === 'fail') ? 'fail' : r.verifs.some(x => x[0] === 'warn') ? 'warn' : 'ok';
    // especificação e materiais
    const corr = cl1 ? `Iimp ${nfmt(r.Iimp, 1)} kA (10/350 µs), In ${nfmt(r.In, 0)} kA` : `In ${nfmt(r.In, 0)} kA, Imáx ${r.Imax} kA (8/20 µs)`;
    r.spec = `DPS classe ${r.classe}${cl1 ? ` (${r.tec})` : ''}, ligação ${r.ligTxt}: Uc ${r.Uc} V, ${corr}, Up ≤ ${nfmt(r.Up, 1)} kV, UT ≥ ${nfmt(r.UTmin, 0)} V/5 s`;
    const nb = 'ABNT NBR IEC 61643-11';
    if (r.lig === 'pe') r.materiais.push([`DPS classe ${r.classe} unipolar${cl1 ? ` (${r.tec})` : ''} — Uc ${r.Uc} V, ${corr}, Up ≤ ${nfmt(r.Up, 1)} kV`, nF + 1, 'un', nb]);
    else {
      r.materiais.push([`DPS classe ${r.classe} unipolar (fase–neutro) — Uc ${r.Uc} V, ${corr}, Up ≤ ${nfmt(r.Up, 1)} kV`, nF, 'un', nb]);
      r.materiais.push([`Centelhador N–PE classe ${r.classe} — Uc ${r.UcN} V, ${cl1 ? `Iimp ${nfmt(r.IimpNPE, 0)} kA (10/350 µs)` : `In ${nfmt(r.In * (nF + 1) / 2, 0)} kA (8/20 µs)`}`, 1, 'un', nb]);
    }
    r.materiais.push([`Condutor de cobre verde-amarelo ${fS(r.S)} mm² para ligação dos DPS`, Math.max(1, Math.ceil((nF + 2) * r.L)), 'm', 'ABNT NBR NM 247-3']);
    if (r.back && r.Imont && r.Imont > r.back) r.materiais.push([`Disjuntor de retaguarda dos DPS ${nF + (r.lig === 'pe' ? 1 : 0)}P até ${r.back} A (conforme o fabricante)`, 1, 'un', 'ABNT NBR NM 60898']);
  });
  const lista = Object.values(out.quadros).filter(r => r.ativo);
  if (out.nSens) out.classe3 = { n: out.nSens, Uc: ucDPS(P.U0) };
  if (lista.some(r => r.foraLpo && r.foraLpo.length) && !out.nSens) out.avisos.push('Há circuitos além da distância de proteção do DPS do quadro: informe os pontos com equipamentos sensíveis para prever DPS classe III junto a eles.');
  else if (lista.some(r => r.status === 'warn' && r.Upf > r.UwRef) && !out.nSens) out.avisos.push('O nível de proteção efetivo excede a suportabilidade dos equipamentos em algum quadro: informe os pontos com equipamentos sensíveis para prever DPS classe III.');
  out.status = lista.some(r => r.status === 'fail') ? 'fail' : (lista.some(r => r.status === 'warn') || out.avisos.length ? 'warn' : 'ok');
  return out;
}

/* ================================================================
   INTERFACE — seção Proteção contra surtos (DPS)
   ================================================================ */
function normalizarDPS(d) {
  const out = { ...dpsPadrao(), ...(d || {}) };
  if (!EXPO_DPS[out.exposicao]) out.exposicao = 'media';
  if (CAT_UW[out.catEq] == null) out.catEq = 'II';
  if (!METODO_DPS[out.metodo]) out.metodo = 'F';
  if (!DIST_DPS[out.critDist]) out.critDist = 'norma';
  if (!DELTA_DPS.some(x => x[0] === +out.delta)) out.delta = 0.5;
  if (out.alim !== 'subterranea') out.alim = 'aerea';
  return out;
}
const ICONE_VER = { ok: 'ok', fail: 'fail', warn: 'warn', info: 'info' };
function dpsResHTML(r) {
  if (!r.ativo) return '<p class="mini" style="padding:10px 14px;margin:0">Quadro sem DPS (desmarcado).</p>';
  return `<div class="spec" style="padding:10px 14px"><div class="linha"><span><small>Especificação</small><b>${esc(r.spec)}</b></span></div></div>
    <ul class="verif">${r.verifs.map(([st, t]) => `<li class="${ICONE_VER[st]}"><span>${esc(t)}</span></li>`).join('')}</ul>
    <div class="tw" style="margin:0 14px 12px"><table class="tbl"><thead><tr><th>Material</th><th class="r">Qtd.</th></tr></thead><tbody>${r.materiais.map(([d, q, u]) => `<tr><td class="wrap">${esc(d)}</td><td class="r">${q} ${u}</td></tr>`).join('')}</tbody></table></div>`;
}
function renderDPS() {
  const D = PROJ.dps, c = CALC.dps, P = PROJ.params, ps = CALC.spda && CALC.spda.projeto;
  const Q = Object.values(CALC.quadros).filter(q => q.cs.length);
  $('#tab-dps').innerHTML = `
  <div class="mem-bar"><div><h2 class="tit">Proteção contra surtos (DPS)</h2><p class="sub" style="margin:0">Seleção dos DPS de cada quadro pela ABNT NBR 5410 (6.3.5, Tabelas 31 e 49) e pela ABNT NBR 5419-4:2026, com as faixas usuais de catálogos de fabricantes para a corrente máxima. ${ps ? `Com o SPDA NP ${ps.base}, o quadro de entrada recebe DPS classe I+II com Iimp ≥ ${nfmt(ps.Iimp, 2)} kA por modo.` : ''}</p></div>
  <div class="mem-bt"><span class="mini" style="align-self:center">Memória do DPS:</span><button class="btn pri" type="button" data-exp="pdf" data-doc="dps">PDF</button><button class="btn" type="button" data-exp="docx" data-doc="dps">Word</button><button class="btn" type="button" data-exp="html" data-doc="dps">HTML</button></div></div>
  <fieldset data-scope="dpsg"><legend>Critérios gerais</legend><div class="grade">
    ${fSel('dg', 'metodo', 'Método de seleção da corrente nominal (classe II)', D.metodo, Object.entries(METODO_DPS), { cls: 'w2', struct: true })}
    ${D.metodo === 'F' ? `${fNum('dg', 'Td', 'Nível ceráunico Td', D.Td, { u: 'dias/ano', ph: 'mapa', dica: 'dias de trovoada por ano (mapa isoceráunico)' })}
    ${fSel('dg', 'alim', 'Alimentação em baixa tensão', D.alim, [['aerea', 'Linha aérea (total ou parcial)'], ['subterranea', 'Totalmente subterrânea']], { struct: true })}
    ${D.alim === 'aerea' ? fNum('dg', 'LBT', 'Linha aérea de BT (LBT)', D.LBT, { u: 'km', dica: 'acima de 0,5 km, usar 0,5' }) : ''}
    ${fSel('dg', 'delta', 'Situação da linha e da edificação (δ)', D.delta, DELTA_DPS.map(([k, t]) => [k, `${t} — δ = ${nfmt(k, 2)}`]), { cls: 'w2', type: 'numsel' })}`
    : fSel('dg', 'exposicao', 'Exposição a surtos (Imáx dos DPS classe II)', D.exposicao, Object.entries(EXPO_DPS).map(([k, v]) => [k, `${v[1].split(' — ')[0]} — Imáx ${v[0]} kA`]), { cls: 'w2', struct: true, dica: EXPO_DPS[D.exposicao][1].split(' — ')[1] })}
    ${fSel('dg', 'catEq', 'Equipamentos protegidos (categoria de suportabilidade)', D.catEq, Object.entries(CAT_UW_TXT).map(([k, v]) => [k, `${v} — Uw ${nfmt(uwTab31(P.U0, k), 1)} kV`]), { cls: 'w2' })}
    ${fSel('dg', 'critDist', 'Distância de proteção até os equipamentos', D.critDist, Object.entries(DIST_DPS), { cls: 'w2' })}
    ${fNum('dg', 'nSens', 'Pontos com equipamentos sensíveis (DPS classe III)', D.nSens, { dica: 'junto aos equipamentos distantes do quadro' })}
    ${fInfo('Esquema / tensão', `${esc(P.aterramento)} · ${P.U0}/${P.U} V`)}
  </div></fieldset>
  <div id="dps-resumo"></div>
  ${Q.map(q => { const Qd = PROJ.quadros[q.q] || {}, r = c.quadros[q.q], pre = 'dq-' + safeId(q.q), cl1 = r.ativo && r.classe === 'I+II';
    return `<article class="quadro"><div class="quadro-cab"><div><h3>${esc(q.q)}</h3><span class="mini">${q.alim ? `alimentado por ${esc(q.alim.num)}` : 'ponto de entrada'}${Qd.desc ? ' · ' + esc(Qd.desc) : ''}</span></div>
      <div class="grade g3" data-scope="dpsq" data-q="${esc(q.q)}" style="flex:1 1 560px">
        ${fChk(pre, 'dps', 'DPS neste quadro', Qd.dps !== false, { struct: true })}
        ${fSel(pre, 'dpsClasse', 'Classe', Qd.dpsClasse || 'auto', [['auto', `Automática (${r.classeAuto || '—'})`], ['I+II', 'I+II — ponto de entrada'], ['II', 'II — quadro de distribuição']], { struct: true })}
        ${fSel(pre, 'dpsLig', 'Ligação', Qd.dpsLig || 'auto', Object.entries(LIG_DPS), { cls: 'w2', struct: true })}
        ${fNum(pre, 'dpsUp', 'Up do produto', Qd.dpsUp, { u: 'kV', ph: r.ativo ? r.Up : '' })}
        ${cl1 ? fSel(pre, 'dpsTec', 'Tecnologia (classe I)', Qd.dpsTec || 'varistor', [['varistor', 'Varistor'], ['centelhador', 'Centelhador']], { struct: true }) : ''}
        ${cl1 ? fNum(pre, 'dpsIimp', 'Iimp do produto por modo', Qd.dpsIimp, { u: 'kA', ph: r.IimpMin }) : ''}
        ${cl1 && r.tec === 'centelhador' ? fNum(pre, 'dpsIfi', 'Ifi do centelhador', Qd.dpsIfi, { u: 'kA', ph: 'catálogo' }) : ''}
        ${fNum(pre, 'dpsUc', 'Uc do produto', Qd.dpsUc, { u: 'V', ph: r.ativo ? ucDPS(P.U0) : '' })}${fNum(pre, 'dpsIn', 'In do produto', Qd.dpsIn, { u: 'kA', ph: r.ativo ? `≥ ${nfmt(r.InReq, 0)}` : '' })}
        ${r.ativo && r.lig === 'npe' ? fNum(pre, 'dpsUpPE', 'Up fase–PE (n+1)', Qd.dpsUpPE, { u: 'kV', ph: 'catálogo' }) : ''}
        ${fNum(pre, 'dpsL', 'Condutores de ligação (total)', Qd.dpsL, { u: 'm', ph: 0.5 })}${fNum(pre, 'dpsS', 'Seção dos condutores de ligação', Qd.dpsS, { u: 'mm²', ph: r.ativo ? r.Srec : '' })}
        ${fNum(pre, 'dpsBack', 'Retaguarda máxima (fabricante)', Qd.dpsBack, { u: 'A', ph: 'catálogo' })}${fNum(pre, 'dpsIsccr', 'Isccr do DPS (fabricante)', Qd.dpsIsccr, { u: 'kA', ph: 'catálogo' })}
        ${fChk(pre, 'dpsV', 'Ligação em V — série (ΔU desprezível)', !!Qd.dpsV)}${q.alim ? fChk(pre, 'dpsCoord', 'Coordenado com o DPS a montante (fabricante)', !!Qd.dpsCoord) : ''}${fChk(pre, 'dpsJusDR', 'DPS a jusante de DR geral', !!Qd.dpsJusDR)}
      </div></div><div id="${pre}-res">${dpsResHTML(r)}</div></article>`; }).join('')}`;
  renderDPSResumo();
}
function renderDPSResumo() {
  const box = $('#dps-resumo'); if (!box) return; const c = CALC.dps, L = Object.values(c.quadros).filter(r => r.ativo);
  box.innerHTML = `<div class="res" style="margin-bottom:14px"><div class="res-cab"><h3>Resumo</h3><span class="pill ${c.status}">${statusTxt(c.status)}</span></div>
    <ul class="verif"><li class="${c.necess.obrig == null ? 'info' : 'ok'}"><span>Obrigatoriedade (NBR 5410): ${esc(c.necess.txt)}</span></li><li class="info"><span>Corrente nominal dos DPS classe II: ${esc(c.InTxt)}</span></li></ul>
    <div class="metr num">${L.map(r => `<div><small>${esc(r.q)}</small><span${r.status === 'fail' ? ' class="bad"' : ''}>${r.classe} · ${r.classe === 'I+II' ? `${nfmt(r.Iimp, 1)} kA` : `${r.Imax} kA`}</span><small style="text-transform:none;letter-spacing:0">${r.lig === 'npe' ? `${r.nF}+1` : `${r.nF + 1}+0`} · Up ${nfmt(r.Up, 1)} kV</small></div>`).join('')}${c.classe3 ? `<div><small>Classe III</small><span>${c.classe3.n} ponto(s)</span></div>` : ''}</div>
    ${c.avisos.length ? `<ul class="msgs">${c.avisos.map(x => `<li class="warn">${esc(x)}</li>`).join('')}</ul>` : ''}</div>`;
}
function atualizarDPSParcial() {
  renderDPSResumo();
  Object.values(CALC.dps.quadros).forEach(r => { const el = $('#dq-' + safeId(r.q) + '-res'); if (el) el.innerHTML = dpsResHTML(r); });
}

/* ================================================================
   INTERFACE — aba Aterramento
   ================================================================ */
function arrSel() { return (PROJ.aterr.arr || []).find(a => a.id === ASEL) || null; }
function normalizarAterr(t) {
  const base = aterrPadrao(), out = { ...base, ...(t || {}) };
  out.solo = { ...soloPadrao(), ...((t && t.solo) || {}) }; out.solo.med = Array.isArray(out.solo.med) ? out.solo.med : [];
  out.arr = (Array.isArray(out.arr) ? out.arr : []).map(a => ({ ...arrPadrao(a.tipo || 'linha', FUNC_ATERR[a.funcao] ? a.funcao : 'massas'), ...a }));
  return out;
}
function renderAterr() {
  const T = PROJ.aterr, S = T.solo, ca = CALC.aterr;
  if (!arrSel()) ASEL = T.arr[0]?.id || null;
  $('#tab-aterr').innerHTML = `
  <div class="mem-bar"><div><h2 class="tit">Aterramento</h2><p class="sub" style="margin:0">Resistividade do solo pelo método de Wenner (NBR 7117-1:2020), resistência de hastes, cabos e malhas, e verificação das tensões de toque e de passo (NBR 15751:2013 / IEEE Std 80-2013).</p></div>
  <div class="mem-bt"><span class="mini" style="align-self:center">Memorial de aterramento:</span><button class="btn pri" type="button" data-exp="pdf" data-doc="aterr">PDF</button><button class="btn" type="button" data-exp="docx" data-doc="aterr">Word</button><button class="btn" type="button" data-exp="html" data-doc="aterr">HTML</button></div></div>
  <fieldset data-scope="asolo"><legend>Resistividade do solo (NBR 7117-1:2020)</legend><div class="grade">
    ${fSel('as', 'modo', 'Origem do dado', S.modo, [['wenner', 'Medições pelo método de Wenner'], ['direto', 'Resistividade informada']], { struct: true })}
    ${S.modo === 'direto' ? fNum('as', 'rho', 'Resistividade do solo', S.rho, { u: 'Ω·m' }) + fTxt('as', 'local', 'Origem do dado', S.local, { cls: 'w2', ph: 'ex.: sondagem, obra vizinha, estimativa' })
      : `${fNum('as', 'p', 'Profundidade dos eletrodos de medição', S.p, { u: 'm' })}
         ${fSel('as', 'media', 'Média por espaçamento', S.media, [['geo', 'Geométrica (log-normal, NBR 7117-1:2020)'], ['ar', 'Aritmética']])}
         ${fSel('as', 'modelo', 'Modelo do solo', S.modelo, [['homog', 'Homogêneo (média)'], ['2c', 'Duas camadas (ajuste)']], { struct: true })}
         ${fChk('as', 'descartar', 'Descartar leituras com desvio > 50 % da média', S.descartar)}
         ${fTxt('as', 'local', 'Local da medição', S.local, { ph: 'ex.: terreno da obra, eixo A–B' })}${fTxt('as', 'data', 'Data da medição', S.data, { ph: 'aaaa-mm-dd' })}${fTxt('as', 'equip', 'Instrumento', S.equip, { ph: 'terrômetro, modelo' })}`}
    ${fNum('as', 'fs', 'Fator sazonal (multiplica ρ)', S.fs, { dica: '1,0 se medido em época seca' })}
  </div>
  ${S.modo === 'wenner' ? `<div class="tw" style="margin-top:12px"><table class="tbl nt"><thead><tr><th>Direção</th><th>a (m)</th><th>R lida (Ω)</th><th class="r">ρa (Ω·m)</th><th class="r">Desvio</th><th></th></tr></thead><tbody>
    ${S.med.map((m, i) => `<tr data-scope="amed" data-i="${i}"><td><input type="text" data-k="dir" value="${esc(m.dir || '')}" style="width:70px" aria-label="Direção"></td><td><input type="text" inputmode="decimal" data-k="a" data-type="num" value="${esc(showNum(m.a))}" style="width:64px" aria-label="Espaçamento"></td><td><input type="text" inputmode="decimal" data-k="R" data-type="num" value="${esc(showNum(m.R))}" style="width:74px" aria-label="Resistência lida"></td><td class="r" id="am-r-${i}">—</td><td class="r" id="am-d-${i}">—</td><td><button class="btn sm" type="button" data-delmed="${i}" aria-label="Remover leitura">×</button></td></tr>`).join('')}
  </tbody></table></div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"><button class="btn sm" type="button" id="bt-add-med">+ leitura</button><button class="btn sm" type="button" id="bt-med-serie">+ série 1, 2, 4, 8 e 16 m</button></div>` : ''}
  <div id="a-solo-res" style="margin-top:12px"></div></fieldset>
  <div class="bancada">
    <aside class="lista" aria-label="Sistemas de aterramento">
      <div class="lista-topo"><select id="a-novo-tipo" aria-label="Tipo de arranjo" style="flex:1 1 150px;width:auto">${opts(Object.entries(TIPOS_ATERR), 'linha')}</select><button class="btn pri" type="button" id="bt-add-arr">Adicionar</button></div>
      <div class="lista-itens" id="a-itens"></div>
      <div style="padding:10px;border-top:1px solid var(--line);display:grid;gap:6px"><button class="btn" type="button" id="bt-arr-ndu">Padrão de entrada (NDU 001)</button></div>
    </aside>
    <div class="editor" id="a-ed"></div>
  </div>`;
  renderAterrSolo(); renderArrLista(); renderArrEditor();
}
function renderAterrSolo() {
  const box = $('#a-solo-res'); if (!box) return; const rs = CALC.aterr.solo, S = PROJ.aterr.solo;
  (S.med || []).forEach((m, i) => { const l = rs.linhas.find(x => x.a === +m.a && x.R === +m.R && (x.dir || '') === (m.dir || '')); const r = $('#am-r-' + i), d = $('#am-d-' + i); if (r) r.textContent = l ? nfmt(l.rho, 0) : '—'; if (d) d.innerHTML = l ? `<span style="color:${l.desc ? 'var(--warn)' : 'inherit'}">${(l.desvio >= 0 ? '+' : '') + nfmt(l.desvio * 100, 0)} %${l.desc ? ' ✗' : ''}</span>` : '—'; });
  const res = rs.modo === 'direto' ? `<p class="mini" style="margin:0">ρ de cálculo = <b>${nfmt(rs.rho, 0)} Ω·m</b> (solo homogêneo${rs.fs !== 1 ? `, com fator sazonal ${nfmt(rs.fs, 2)}` : ''}).</p>`
    : !rs.porA.length ? '' : `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:14px;align-items:start">
      <div style="min-width:0">${soloSVG(rs, false)}</div>
      <div style="min-width:0"><table class="tbl nt"><thead><tr><th>a (m)</th><th class="r">Leituras</th><th class="r">ρa médio</th>${rs.m2 ? '<th class="r">Modelo</th>' : ''}</tr></thead><tbody>${rs.porA.map(q => `<tr><td>${nfmt(q.a, 2)}</td><td class="r">${q.n - q.nDesc}/${q.n}</td><td class="r">${nfmt(q.rho, 0)}</td>${rs.m2 ? `<td class="r">${nfmt(q.modelo, 0)}</td>` : ''}</tr>`).join('')}</tbody></table>
      <p class="mini" style="margin:8px 0 0">${rs.m2 ? `Duas camadas: ρ₁ = <b>${nfmt(rs.m2.rho1, 0)}</b> Ω·m, ρ₂ = <b>${nfmt(rs.m2.rho2, 0)}</b> Ω·m, h₁ = <b>${nfmt(rs.m2.h, 2)}</b> m (desvio ${nfmt(rs.m2.erro, 1)} %). ` : ''}Média: <b>${nfmt(rs.rhoMed, 0)} Ω·m</b>${rs.fs !== 1 ? ` · com fator sazonal: ${nfmt(rs.rho, 0)} Ω·m` : ''}.</p></div></div>`;
  box.innerHTML = res + (rs.falhas.length || rs.avisos.length ? `<ul class="msgs" style="padding:8px 0 0">${rs.falhas.map(x => `<li class="fail">${esc(x)}</li>`).join('')}${rs.avisos.map(x => `<li class="warn">${esc(x)}</li>`).join('')}</ul>` : '');
}
function renderArrLista() {
  const box = $('#a-itens'); if (!box) return; const A = PROJ.aterr.arr;
  if (!A.length) { box.innerHTML = '<p class="mini" style="padding:12px">Nenhum sistema de aterramento. Escolha o tipo e clique em Adicionar, ou crie o padrão de entrada da NDU 001.</p>'; return; }
  box.innerHTML = A.map((a, i) => { const r = CALC.aterr.arr[a.id]; return `<button type="button" class="item" data-asel="${a.id}" aria-current="${a.id === ASEL}"><span class="n">${i + 1}</span><span class="d">${esc(a.nome)}</span><span class="pill ${r.status}">${pillTxt(r.status)}</span><span class="e">${TIPOS_ATERR[a.tipo]} · ${nfmt(r.R, 2)} Ω${r.rmax > 0 ? ` / ${nfmt(r.rmax, 0)} Ω` : ''}</span></button>`; }).join('');
}
function renderArrEditor() {
  const box = $('#a-ed'); if (!box) return; const a = arrSel();
  if (!a) { box.innerHTML = '<div class="res" style="padding:24px"><h2 class="tit">Sem sistemas de aterramento</h2><p class="sub">Calcule desde uma haste única até uma malha completa: escolha o tipo na lista ao lado.</p></div>'; return; }
  box.innerHTML = `<div class="ed-topo"><span class="mini">Sistema ${PROJ.aterr.arr.indexOf(a) + 1} de ${PROJ.aterr.arr.length}</span><span style="display:flex;gap:6px">${PROJ.params.aterramento === 'TT' && a.funcao === 'massas' ? '<button class="btn sm" type="button" id="bt-aplicar-ra">Usar R como RA do esquema TT</button>' : ''}<button class="btn sm" type="button" id="bt-dup-arr">Duplicar</button><button class="btn sm" type="button" id="bt-exc-arr">Excluir</button></span></div>
    <section class="res" id="a-res" aria-live="polite"></section><div id="a-form"></div>`;
  renderArrRes(); renderArrForm();
}
function renderArrRes() {
  const box = $('#a-res'); const a = arrSel(); if (!box || !a) return; const r = CALC.aterr.arr[a.id], f2 = v => nfmt(v, 2), f0 = v => nfmt(v, 0);
  const met = [['Resistência', `${f2(r.R)} Ω`], ['Limite', r.rmax > 0 ? `${nfmt(r.rmax, 1)} Ω` : '—'], ['Resistividade de cálculo', `${f0(r.rho)} Ω·m`]];
  if (TIPOS_HASTES.includes(a.tipo)) met.push(['Hastes', String(r.nH)], ['R de uma haste', `${f2(r.R1)} Ω`], ['Índice de redução K', nfmt(r.K, 3)], ...(r.nMin && !r.okR ? [['Hastes alinhadas p/ limite', String(r.nMin)]] : []));
  if (a.tipo === 'malha') { met.push(['Método', r.metodoR], ['Sverak', `${nfmt(r.Rsverak, 3)} Ω`], ['Condutores', `${f0(r.LC)} m`], ['Hastes', `${r.nR} × ${f2(r.Lr)} m`]); if (a.seg && r.IG != null) met.push(['GPR', `${f0(r.GPR)} V`], ['Toque Em / adm.', `${f0(r.Em)} / ${f0(r.Etoque)} V`], ['Passo Es / adm.', `${f0(r.Es)} / ${f0(r.Epasso)} V`], ['Condutor mínimo', `${nfmt(r.cond.Sreq, 1)} mm²`]); }
  if (r.tt) met.push(['RA máx. (TT)', `${f0(r.tt.RAmax)} Ω`]);
  box.innerHTML = `<div class="res-cab"><h3>${esc(a.nome)}</h3><span class="pill ${r.status}">${statusTxt(r.status)}</span></div>
    <div class="metr num">${met.map(([x, y]) => `<div><small>${x}</small><span${(x === 'Resistência' && !r.okR) || (x.startsWith('Toque') && r.okToque === false) || (x.startsWith('Passo') && r.okPasso === false) ? ' class="bad"' : ''}>${y}</span></div>`).join('')}</div>
    ${r.rho > 0 ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:14px;padding:12px 14px"><div style="min-width:0">${arranjoSVG(a, r, false)}</div><div style="min-width:0">${corteAterrSVG(a, r, CALC.aterr.solo, false)}</div></div>` : ''}
    <p class="mini" style="margin:0;padding:0 14px 10px">ρ: ${esc(r.rhoTxt || '')}</p>
    ${r.falhas.length || r.avisos.length ? `<ul class="msgs">${r.falhas.map(x => `<li class="fail">${esc(x)}</li>`).join('')}${r.avisos.map(x => `<li class="warn">${esc(x)}</li>`).join('')}</ul>` : ''}`;
}
function renderArrForm() {
  const box = $('#a-form'); const a = arrSel(); if (!box || !a) return; const r = CALC.aterr.arr[a.id];
  const hastes = TIPOS_HASTES.includes(a.tipo), secs = SECOES_NU.map(s => [s, `${s} mm²`]);
  let geo = '';
  if (hastes) {
    geo = `${fSel('aa', 'haste', 'Haste', a.haste, [...HASTES_COM.map(h => [h[0], h[1]]), ['custom', 'Outra (informar)']], { cls: 'w2', struct: true })}
      ${fNum('aa', 'L', 'Comprimento da haste', a.L, { u: 'm' })}${fNum('aa', 'd', 'Diâmetro da haste', a.d, { u: 'mm' })}
      ${a.tipo === 'linha' || a.tipo === 'circ' ? fNum('aa', 'n', 'Número de hastes', a.n) : ''}
      ${a.tipo === 'quadVazio' || a.tipo === 'quadCheio' ? fNum('aa', 'm', 'Hastes por lado', a.m) : ''}
      ${a.tipo === 'circ' ? fNum('aa', 'raio', 'Raio da circunferência', a.raio, { u: 'm' }) : ''}
      ${a.tipo !== 'haste' && a.tipo !== 'circ' ? fNum('aa', 'e', 'Espaçamento entre hastes', a.e, { u: 'm' }) : (a.tipo === 'haste' ? fNum('aa', 'e', 'Espaçamento p/ hastes adicionais', a.e, { u: 'm', dica: 'usado na sugestão de nº de hastes' }) : '')}`;
  } else if (a.tipo === 'cabo') {
    geo = `${fNum('aa', 'Lc', 'Comprimento do cabo', a.Lc, { u: 'm' })}${fNum('aa', 'hc', 'Profundidade', a.hc, { u: 'm' })}${fSel('aa', 'S', 'Seção do cabo nu', a.S, secs, { type: 'numsel' })}`;
  } else {
    geo = `${fNum('aa', 'Lx', 'Comprimento Lx', a.Lx, { u: 'm' })}${fNum('aa', 'Ly', 'Largura Ly', a.Ly, { u: 'm' })}
      ${fNum('aa', 'Nx', 'Condutores paralelos a Lx', a.Nx, { dica: r.Dy ? `espaçamento ${nfmt(r.Dy, 2)} m` : '' })}${fNum('aa', 'Ny', 'Condutores paralelos a Ly', a.Ny, { dica: r.Dx ? `espaçamento ${nfmt(r.Dx, 2)} m` : '' })}
      ${fNum('aa', 'hc', 'Profundidade da malha', a.hc, { u: 'm' })}${fSel('aa', 'S', 'Seção do condutor', a.S, secs, { type: 'numsel' })}
      ${fSel('aa', 'posH', 'Hastes', a.posH, Object.entries(POS_HASTES_MALHA), { struct: true })}
      ${a.posH !== 'nenhuma' ? fNum('aa', 'Lh', 'Comprimento das hastes', a.Lh, { u: 'm' }) + fNum('aa', 'dh', 'Diâmetro das hastes', a.dh, { u: 'mm' }) : ''}
      ${fChk('aa', 'seg', 'Verificar tensões de toque e de passo (NBR 15751)', a.seg, { cls: 'wide', struct: true })}`;
  }
  const seg = a.tipo === 'malha' && a.seg ? `<fieldset data-scope="aarr"><legend>Falta à terra e segurança (NBR 15751 / IEEE 80)</legend><div class="grade">
      ${fNum('aa', 'I3I0', 'Corrente de falta fase-terra 3I₀', a.I3I0, { u: 'A' })}${fNum('aa', 'sf', 'Fator de divisão Sf', a.sf, { u: '%', dica: 'parcela que escoa pela malha' })}
      ${fNum('aa', 'xr', 'Relação X/R no ponto de falta', a.xr)}${fNum('aa', 'tf', 'Tempo de eliminação da falta', a.tf, { u: 's' })}
      ${fSel('aa', 'peso', 'Critério de peso corporal', a.peso, [[50, '50 kg (mais restritivo)'], [70, '70 kg']], { type: 'numsel' })}
      ${fChk('aa', 'brita', 'Camada superficial de brita', a.brita, { struct: true })}
      ${a.brita ? fNum('aa', 'rhoS', 'Resistividade da brita', a.rhoS, { u: 'Ω·m' }) + fNum('aa', 'hs', 'Espessura da brita', a.hs, { u: 'm' }) : ''}
      ${fSel('aa', 'mat', 'Material do condutor', a.mat, Object.entries(MAT_TERRA).map(([k, v]) => [k, v.nome]))}
      ${fSel('aa', 'conexao', 'Conexões', a.conexao, Object.entries(CONEXAO_TERRA))}
      ${fNum('aa', 'tc', 'Duração para o condutor', a.tc, { u: 's', dica: 'tempo da proteção de retaguarda' })}${fNum('aa', 'Smin', 'Seção mínima adotada', a.Smin, { u: 'mm²' })}
    </div></fieldset>` : '';
  box.innerHTML = `
  <fieldset data-scope="aarr"><legend>Sistema de aterramento</legend><div class="grade">
    ${fTxt('aa', 'nome', 'Nome', a.nome, { cls: 'w2' })}
    ${fSel('aa', 'tipo', 'Configuração', a.tipo, Object.entries(TIPOS_ATERR), { struct: true })}
    ${fSel('aa', 'funcao', 'Função', a.funcao, Object.entries(FUNC_ATERR).map(([k, v]) => [k, v.nome]), { struct: true, cls: 'w2' })}
    ${fNum('aa', 'rmax', 'Resistência máxima', a.rmax, { u: 'Ω', dica: FUNC_ATERR[a.funcao].ref })}
    ${fNum('aa', 'rhoMan', 'ρ do arranjo (opcional)', a.rhoMan, { u: 'Ω·m', ph: Math.round(r.rho), dica: 'deixe vazio para usar o modelo do solo' })}
  </div></fieldset>
  <fieldset data-scope="aarr"><legend>Geometria</legend><div class="grade">${geo}</div></fieldset>
  ${seg}
  <fieldset data-scope="aarr"><legend>Observações</legend><div class="grade"><div class="campo wide"><label for="aa-obs">Texto incluído no memorial deste sistema</label><textarea id="aa-obs" data-k="obs">${esc(a.obs)}</textarea></div></div></fieldset>`;
}
function efeitosArranjo(a, k) {
  if (k === 'haste') { const h = HASTES_COM.find(x => x[0] === a.haste); if (h) { a.L = h[2]; a.d = h[3]; } return true; }
  if (k === 'funcao') { a.rmax = FUNC_ATERR[a.funcao].rmax; return true; }
  if (k === 'tipo') { if (Object.values(TIPOS_ATERR).includes(a.nome)) a.nome = TIPOS_ATERR[a.tipo]; if (a.tipo === 'malha' && a.funcao === 'entrada') a.funcao = 'subestacao'; return true; }
  if (k === 'L' || k === 'd') { const h = HASTES_COM.find(x => x[0] === a.haste); if (h && (+a.L !== h[2] || +a.d !== h[3])) a.haste = 'custom'; }
  return false;
}
function atualizarAterrParcial() { renderAterrSolo(); renderArrLista(); renderArrRes(); }
function criarArranjoNDU() {
  const ce = CALC.energisa && Object.values(CALC.energisa.ucs || {})[0], cat = ce && ce.cat, n = cat ? cat.hastes : 3;
  const a = arrPadrao('linha', 'entrada'); Object.assign(a, { nome: `Padrão de entrada${cat ? ` — categoria ${cat.cat}` : ''} (NDU 001)`, n: Math.max(1, n), haste: 'h34-240', L: 2.4, d: 17.3, e: 2.4, rmax: 20 });
  if (n === 1) a.tipo = 'haste';
  PROJ.aterr.arr.push(a); ASEL = a.id; mudou(true);
  toast(cat ? `Arranjo criado com ${n} haste(s) de 3/4" × 2,40 m, conforme a categoria ${cat.cat} da NDU 001.` : 'Arranjo criado com 3 hastes; calcule a demanda Energisa para ajustar ao mínimo da categoria.');
}

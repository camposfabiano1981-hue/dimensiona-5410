/* ================================================================
   INTERFACE — DEMANDA ENERGISA (NDU 001 / NDU 003)
   ================================================================ */
function ucSel() { const E = PROJ.energisa; return (E.ucs || []).find(u => u.id === USEL) || null; }
function normalizarEnergisa(e) {
  const base = energisaPadrao(), out = { ...base, ...(e || {}) };
  out.ucs = (Array.isArray(out.ucs) && out.ucs.length ? out.ucs : base.ucs).map((u, i) => { const n = { ...ucPadrao(i + 1), ...u }; n.cargas = (Array.isArray(u.cargas) ? u.cargas : []).map(c => ({ ...cargaPadrao(c.g || 'ilum'), ...c })); return n; });
  out.conj = Array.isArray(out.conj) ? out.conj : [];
  out.t003 = { f: [], a: [], fonte: '', ...(out.t003 || {}) };
  if (!ENERGISA_TENSOES[out.tensao]) out.tensao = '220/127';
  return out;
}
function opcoesPotCarga(c, i) {
  const pre = 'cg' + i;
  if (c.g === 'mot1' || c.g === 'mot3') { const tab = c.g === 'mot1' ? T12_MOT1 : T13_MOT3; return `<select id="${pre}-cv" data-k="cv" data-type="numsel" data-struct="1" aria-label="Potência do motor">${opts(Object.keys(tab).map(k => [+k, `${CV_TXT[k]} cv`]), String(+(+c.cv).toFixed(3)))}</select>`; }
  if (c.g === 'arj') return `<span style="display:flex;gap:4px;flex-wrap:wrap"><select id="${pre}-btu" data-k="btu" data-type="numsel" data-struct="1" aria-label="Capacidade">${opts(Object.keys(T9_AR).map(k => [+k, `${nfmt(+k, 0)} BTU/h`]), c.btu)}</select><select id="${pre}-tipoAr" data-k="tipoAr" data-struct="1" aria-label="Tipo">${opts([['split', 'split'], ['janela', 'janela']], c.tipoAr)}</select><input type="text" inputmode="decimal" id="${pre}-W" data-k="W" data-type="num" value="${esc(showNum(c.W))}" placeholder="${showNum(arW({ ...c, W: null }) ?? '')} W" aria-label="Potência informada (W)" style="width:76px"></span>`;
  if (c.g === 'solda' || c.g === 'soldaR' || c.g === 'raiox') return `<span style="display:flex;gap:6px;align-items:center"><input type="text" inputmode="decimal" id="${pre}-kva" data-k="kva" data-type="num" value="${esc(showNum(c.kva))}" placeholder="kVA" aria-label="Potência (kVA)" style="width:76px">${c.g === 'solda' ? `<label class="chk" style="font-size:12px"><input type="checkbox" data-k="vv" data-type="chk"${c.vv ? ' checked' : ''}><span>V-V inv.</span></label>` : ''}</span>`;
  return `<input type="text" inputmode="decimal" id="${pre}-W" data-k="W" data-type="num" value="${esc(showNum(c.W))}" placeholder="W" aria-label="Potência unitária (W)" style="width:90px">`;
}
function totalCarga(r, i) { const it = r.itens.find(x => x.i === i); return it ? nfmt(it.kWt, 3) : '—'; }
function renderEnergisa() {
  const E = PROJ.energisa, ce = CALC.energisa;
  if (!ucSel()) USEL = E.ucs[0]?.id || null;
  const unOpts = Object.entries(ENERGISA_UN).map(([k, v]) => [k, `${k} — ${v}`]);
  $('#tab-energisa').innerHTML = `
  <div class="mem-bar"><div><h2 class="tit">Demanda — Grupo Energisa</h2><p class="sub" style="margin:0">Cálculo da demanda provável e enquadramento na categoria de atendimento pela ${NDU001_VER}; agrupamentos e edifícios pela ${NDU003_VER}. O memorial sai pronto para anexar ao pedido de ligação.</p></div>
  <div class="mem-bt"><span class="mini" style="align-self:center">Memorial de demanda:</span><button class="btn pri" type="button" data-exp="pdf" data-doc="energisa">PDF</button><button class="btn" type="button" data-exp="docx" data-doc="energisa">Word</button><button class="btn" type="button" data-exp="html" data-doc="energisa">HTML</button></div></div>
  <fieldset data-scope="energ"><legend>Solicitação e fornecimento</legend><div class="grade">
    ${fSel('e', 'un', 'Distribuidora', E.un, unOpts, { cls: 'w2', struct: true })}
    ${fSel('e', 'tensao', 'Tensão de fornecimento', E.tensao, Object.entries(ENERGISA_TENSOES).map(([k, v]) => [k, v.nome]), { cls: 'w2', struct: true })}
    ${fSel('e', 'area', 'Localização', E.area, [['urbana', 'Área urbana'], ['rural', 'Área rural']])}
    ${fSel('e', 'modo', 'Tipo de atendimento', E.modo, Object.entries(MODOS_E), { cls: 'w2', struct: true })}
    ${fSel('e', 'solicitacao', 'Solicitação', E.solicitacao, SOLICITACOES.map(s => [s, s]), { cls: 'w2' })}
    ${fTxt('e', 'protocolo', 'Protocolo / nº do pedido', E.protocolo)}
    ${fTxt('e', 'municipio', 'Município', E.municipio, { ph: PROJ.info.cidade || '' })}${fTxt('e', 'uf', 'UF', E.uf)}
    ${fTxt('e', 'coord', 'Coordenadas (latitude, longitude)', E.coord, { cls: 'w2', ph: '-20,4697, -54,6201' })}
    <div class="campo wide"><label for="e-obs">Observações para o memorial</label><textarea id="e-obs" data-k="obs">${esc(E.obs)}</textarea></div>
  </div></fieldset>
  <div id="e-coletivo">${E.modo === 'individual' ? '' : coletivoHTML()}</div>
  <div class="bancada">
    <aside class="lista" aria-label="Unidades consumidoras">
      <div class="lista-topo"><button class="btn pri" type="button" id="bt-add-uc" style="flex:1">Adicionar UC</button></div>
      <div class="lista-itens" id="e-itens"></div>
    </aside>
    <div class="editor" id="e-ed"></div>
  </div>`;
  renderUCLista(); renderUCEditor();
}
function coletivoHTML() {
  const E = PROJ.energisa, ce = CALC.energisa, f2 = v => nfmt(v, 2);
  const msgs = ce.falhas.map(x => `<li class="fail">${esc(x)}</li>`).concat(ce.avisos.map(x => `<li class="warn">${esc(x)}</li>`)).join('');
  if (E.modo === 'agrupamento') {
    const R = E.ucs.map(u => ce.ucs[u.id]);
    return `<section class="res"><div class="res-cab"><h3>Agrupamento — ${R.length} UC${R.length > 1 ? 's' : ''}</h3><span class="pill ${ce.status}">${statusTxt(ce.status)}</span></div>
      <div class="grade" data-scope="energ" style="padding:12px 14px 0">${fSel('e', 'agrupDem', 'Demanda do agrupamento', E.agrupDem, [['soma', 'Soma das demandas das UCs (kVA)'], ['nota', 'Σ carga instalada (M e B) + Σ demanda (T)']], { cls: 'w2' })}</div>
      <div class="metr num" id="e-agr"><div><small>Σ C</small><span>${f2(R.reduce((s, r) => s + r.C, 0))} kW</span></div><div><small>Σ D</small><span>${f2(ce.Dsoma)} kVA</span></div><div><small>D adotada</small><span>${f2(ce.Dagr)} kVA</span></div><div><small>Corrente</small><span>${nfmt(ce.Iagr, 1)} A</span></div></div>
      ${msgs ? `<ul class="msgs">${msgs}</ul>` : ''}</section>`;
  }
  const t = E.t003, cj = E.conj;
  const tabEd = (nome, k, cab) => `<div style="min-width:0"><b class="mini">${nome}</b><div class="tw" style="margin-top:4px"><table class="tbl"><thead><tr><th>${cab[0]}</th><th>${cab[1]}</th><th></th></tr></thead><tbody>${(t[k] || []).map((row, i) => `<tr data-scope="t003" data-tab="${k}" data-i="${i}"><td><input type="text" inputmode="decimal" data-k="0" data-type="num" value="${esc(showNum(row[0]))}" aria-label="${cab[0]}"></td><td><input type="text" inputmode="decimal" data-k="1" data-type="num" value="${esc(showNum(row[1]))}" aria-label="${cab[1]}"></td><td><button class="btn sm" type="button" data-del003="${k}:${i}" aria-label="Remover linha">×</button></td></tr>`).join('')}</tbody></table></div><button class="btn sm" type="button" data-add003="${k}" style="margin-top:6px">+ linha</button></div>`;
  return `<section class="res"><div class="res-cab"><h3>Edificação de múltiplas UCs — NDU 003</h3><span class="pill ${ce.status}">${statusTxt(ce.status)}</span></div>
    <div style="padding:12px 14px">
      <div class="grade" data-scope="energ">${fSel('e', 'metodo003', 'Cálculo de D1', E.metodo003, [['ponderada', 'Área média ponderada de todos os apartamentos'], ['conjuntos', 'Por conjuntos de mesma área (mín. 4 aptos por conjunto)']], { cls: 'w2', struct: true })}${fTxt('e', 'fonte003', 'Fonte dos valores das Tabelas 03 e 04', t.fonte, { cls: 'w2', ph: 'NDU 003 v8.1, Tabelas 03 e 04' })}</div>
      <b class="mini" style="display:block;margin-top:10px">Conjuntos de apartamentos (D1)</b>
      <div class="tw" style="margin-top:4px"><table class="tbl"><thead><tr><th>Descrição</th><th>Nº de aptos</th><th>Área útil (m²)</th><th></th></tr></thead><tbody>
        ${cj.map((c, i) => `<tr data-scope="conj" data-i="${i}"><td><input type="text" data-k="desc" value="${esc(c.desc || '')}" style="width:180px" aria-label="Descrição"></td><td><input type="text" inputmode="decimal" data-k="n" data-type="num" value="${esc(showNum(c.n))}" aria-label="Número de apartamentos"></td><td><input type="text" inputmode="decimal" data-k="area" data-type="num" value="${esc(showNum(c.area))}" aria-label="Área útil"></td><td><button class="btn sm" type="button" data-delconj="${i}" aria-label="Remover conjunto">×</button></td></tr>`).join('')}
      </tbody></table></div><button class="btn sm" type="button" id="bt-add-conj" style="margin-top:6px">+ conjunto</button>
      <p class="mini" style="margin:12px 0 6px">Tabelas da NDU 003 v8.1 — informe os valores do seu exemplar (a norma não está disponível nesta aplicação). Linhas "até N apartamentos" e "até área (m²)", em ordem crescente.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">${tabEd('Tabela 03 — fator de multiplicação f', 'f', ['Até N aptos', 'f'])}${tabEd('Tabela 04 — demanda por apartamento a', 'a', ['Até área (m²)', 'a (kVA)'])}</div>
      <div class="metr num" id="e-edif" style="margin-top:12px"><div><small>Apartamentos</small><span>${ce.N || 0}</span></div><div><small>D1</small><span>${f2(ce.D1 || 0)} kVA</span></div><div><small>D2 (cond./lojas)</small><span>${f2(ce.D2 || 0)} kVA</span></div><div><small>D = D1 + D2</small><span>${f2(ce.Dtot || 0)} kVA</span></div><div><small>Corrente</small><span>${nfmt(ce.Itot || 0, 1)} A</span></div></div>
    </div>${msgs ? `<ul class="msgs">${msgs}</ul>` : ''}</section>`;
}
function renderUCLista() {
  const box = $('#e-itens'); if (!box) return; const E = PROJ.energisa, ce = CALC.energisa;
  box.innerHTML = E.ucs.map((u, i) => { const r = ce.ucs[u.id]; return `<button type="button" class="item" data-usel="${u.id}" aria-current="${u.id === USEL}"><span class="n">${i + 1}</span><span class="d">${esc(u.nome || 'UC')}${u.titular ? ' — ' + esc(u.titular) : ''}</span><span class="pill ${r.status}">${pillTxt(r.status)}</span><span class="e">${r.cat ? r.cat.cat : r.tipo} · C ${nfmt(r.C, 2)} kW · D ${nfmt(r.D, 2)} kVA${E.modo === 'edificio' ? ' · ' + PAPEIS_UC[u.papel].split(' ')[0] : ''}</span></button>`; }).join('');
}
function renderUCEditor() {
  const box = $('#e-ed'); if (!box) return; const u = ucSel();
  if (!u) { box.innerHTML = '<div class="res" style="padding:24px"><h2 class="tit">Sem unidades</h2><p class="sub">Adicione uma unidade consumidora.</p></div>'; return; }
  box.innerHTML = `<div class="ed-topo"><span class="mini">UC ${PROJ.energisa.ucs.indexOf(u) + 1} de ${PROJ.energisa.ucs.length}</span><span style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn sm" type="button" id="bt-imp-uc">Importar cargas dos circuitos</button><button class="btn sm" type="button" id="bt-dup-uc">Duplicar</button><button class="btn sm" type="button" id="bt-exc-uc">Excluir</button></span></div>
    <section class="res" id="e-res" aria-live="polite"></section><div id="e-form"></div>`;
  renderUCRes(); renderUCForm();
}
function renderUCRes() {
  const box = $('#e-res'); const u = ucSel(); if (!box || !u) return; const r = CALC.energisa.ucs[u.id], p = r.padrao, f2 = v => nfmt(v, 2), f3 = v => nfmt(v, 3);
  const met = [['Carga instalada C', `${f2(r.C)} kW`], ['Demanda d', `${f2(r.DkW)} kW`], ['Demanda D', `${f2(r.D)} kVA`], ['FD global', `${nfmt(r.FDglobal * 100, 1)} %`], ['Tipo · categoria', `${r.tipo} · ${r.cat ? r.cat.cat : '—'}`], ['Corrente de demanda', r.Iproj ? `${nfmt(r.Iproj, 1)} A` : '—'], ['Disjuntor (categoria · demanda)', p ? `${p.disj} · ${r.disjDem ?? '—'} A` : '—'], ['Caixa', p ? p.caixa : '—']];
  const parc = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].map(k => `<tr><td>${k}</td><td>${{ d1: 'Iluminação, tomadas e pequenos aparelhos', d2: 'Aquecimento de água', d3: 'Secadoras, lava-louças, micro-ondas', d4: 'Fogões e fornos', d5: 'Ar-condicionado', d6: 'Motores', d7: 'Solda e raios X' }[k]}</td><td class="r">${f3(r.d[k] || 0)}</td></tr>`).join('');
  box.innerHTML = `<div class="res-cab"><h3>${esc(u.nome)}${u.titular ? ' — ' + esc(u.titular) : ''}</h3><span class="pill ${r.status}">${statusTxt(r.status)}</span></div>
    <div class="metr num">${met.map(([a, b]) => `<div><small>${a}</small><span>${b}</span></div>`).join('')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px;padding:12px 14px">
      <div style="min-width:0"><table class="tbl"><thead><tr><th>Parcela</th><th>Cargas</th><th class="r">kW</th></tr></thead><tbody>${parc}<tr class="tot"><td colspan="2">d = Σ · D = d / 0,92</td><td class="r">${f3(r.DkW)} · ${f2(r.D)} kVA</td></tr></tbody></table></div>
      <div style="min-width:0">${p ? `<table class="tbl"><tbody>
        <tr><td>Faixa (Tabela ${r.tabCat})</td><td class="wrap">${p.faixa}</td></tr><tr><td>Ramal de conexão</td><td class="wrap">${p.ramalCon}</td></tr><tr><td>Ramal de entrada</td><td class="wrap">${p.ramalEnt}</td></tr>
        <tr><td>Eletroduto</td><td>${p.eletro}</td></tr><tr><td>Aterramento</td><td class="wrap">Cu ${p.aterr} mm² + ${p.hastes} haste${p.hastes > 1 ? 's' : ''}</td></tr><tr><td>Poste / pontalete</td><td class="wrap">${[p.pConc ? `concreto ${p.pConc} daN` : '', p.pAco ? `aço ${p.pAco} daN` : '', p.pont ? `pontalete ${p.pont} daN` : ''].filter(Boolean).join(' · ') || 'N.A.'}</td></tr>
      </tbody></table>` : '<p class="mini">Categoria não determinada.</p>'}</div>
    </div>
    ${p ? `<div class="planta" style="grid-template-columns:minmax(0,560px)"><div>${esquemaEntradaSVG(r, false)}</div></div>` : ''}
    ${r.falhas.length || r.avisos.length ? `<ul class="msgs">${r.falhas.map(x => `<li class="fail">${esc(x)}</li>`).join('')}${r.avisos.map(x => `<li class="warn">${esc(x)}</li>`).join('')}</ul>` : ''}`;
}
function renderUCForm() {
  const box = $('#e-form'); const u = ucSel(); if (!box || !u) return; const E = PROJ.energisa, r = CALC.energisa.ucs[u.id];
  const t21 = E.tensao === '254/127';
  box.innerHTML = `
  <fieldset data-scope="uc"><legend>Identificação da unidade consumidora</legend><div class="grade">
    ${fTxt('u', 'nome', 'Identificação (UC)', u.nome)}
    ${E.modo === 'edificio' ? fSel('u', 'papel', 'Papel no edifício', u.papel, Object.entries(PAPEIS_UC), { struct: true, dica: 'Condomínio, lojas e outros compõem D2.' }) : ''}
    ${fTxt('u', 'titular', 'Titular', u.titular, { cls: 'w2' })}${fTxt('u', 'doc', 'CPF / CNPJ', u.doc)}
    ${fTxt('u', 'contato', 'Telefone / e-mail do titular', u.contato, { cls: 'w2' })}
    ${fTxt('u', 'instalacao', 'Nº da instalação / UC (se existente)', u.instalacao)}${fTxt('u', 'complemento', 'Unidade / complemento', u.complemento, { ph: 'casa, apto 101, sala 2…' })}
    ${fSel('u', 'classe', 'Classe', u.classe, Object.entries(CLASSES_UC))}
    ${fTxt('u', 'atividadeDesc', 'Atividade desenvolvida no local', u.atividadeDesc, { cls: 'w2', ph: 'ex.: residência unifamiliar; comércio varejista' })}
    ${fSel('u', 'atividade', 'Atividade para a Tabela 5', u.atividade, Object.entries(ATIV_T5).map(([k, v]) => [k, v.nome]), { cls: 'w2', struct: true })}
  </div></fieldset>
  <fieldset data-scope="uc"><legend>Ligação e padrão de entrada</legend><div class="grade">
    ${t21 ? fInfo('Tipo de ligação', 'M — 3 fios (254/127 V)') : fSel('u', 'ligacao', 'Tipo de ligação', u.ligacao, [['auto', `Automático (${r.tipo})`], ['M', 'M — F+N, 127 V'], ['B', 'B — 2F+N, 220/127 V'], ['T', 'T — 3F+N, 220/127 V']], { struct: true })}
    ${t21 ? '' : fChk('u', 'req220', 'Possui equipamentos em 220 V (duas fases)', u.req220, { struct: true })}
    ${t21 ? '' : fChk('u', 'reqTri', 'Possui equipamentos trifásicos', u.reqTri, { struct: true })}
    ${fChk('u', 'simultaneo', 'Iluminação e tomadas de uso simultâneo (FD 100 %)', u.simultaneo, { struct: true })}
    ${fSel('u', 'isolacao', 'Isolação do ramal de entrada', u.isolacao, [['XLPE', 'XLPE / HEPR / EPR 90 °C'], ['PVC', 'PVC 70 °C']], { struct: true })}
    ${fSel('u', 'instalacaoRamal', 'Ramal de entrada', u.instalacaoRamal, [['embutido', 'Embutido'], ['subterraneo', 'Subterrâneo']], { struct: true })}
    ${fSel('u', 'ramalCon', 'Ramal de conexão', u.ramalCon, [['multiplex', 'Multiplexado (Al)'], ['concentrico', 'Concêntrico (Al)']], { struct: true })}
  </div></fieldset>
  <fieldset><legend>Relação de cargas instaladas</legend>
    <div class="tw"><table class="tbl"><thead><tr><th>Parcela</th><th>Descrição</th><th>Qtd.</th><th>Potência unitária</th><th class="r">Total (kW)</th><th></th></tr></thead><tbody>
    ${u.cargas.map((c, i) => `<tr data-scope="carga" data-i="${i}"><td><select data-k="g" data-struct="1" aria-label="Parcela" style="max-width:200px">${opts(Object.entries(GRUPOS_CARGA).map(([k, g]) => [k, g.nome]), c.g)}</select></td><td><input type="text" data-k="desc" value="${esc(c.desc || '')}" style="width:220px" aria-label="Descrição"></td><td><input type="text" inputmode="decimal" data-k="qtd" data-type="num" value="${esc(showNum(c.qtd))}" style="width:56px" aria-label="Quantidade"></td><td>${opcoesPotCarga(c, i)}</td><td class="r" id="ct-${i}">${totalCarga(r, i)}</td><td><button class="btn sm" type="button" data-delcarga="${i}" aria-label="Remover carga">×</button></td></tr>`).join('')}
    <tr class="tot"><td colspan="4">Carga instalada total</td><td class="r" id="ct-tot">${nfmt(r.C, 3)}</td><td></td></tr></tbody></table></div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center">
      <select id="e-novo-g" aria-label="Parcela da nova carga" style="width:auto;max-width:320px">${opts(Object.entries(GRUPOS_CARGA).map(([k, g]) => [k, g.nome]), 'ilum')}</select><button class="btn" type="button" id="bt-add-carga">Adicionar carga</button>
      <select id="e-t4" aria-label="Aparelho da Tabela 4" style="width:auto;max-width:320px">${opts(T4_APAR.map((a, i) => [i, `${a[0]} — ${nfmt(a[1], 0)} W`]), 0)}</select><button class="btn" type="button" id="bt-add-t4">Adicionar da Tabela 4</button>
    </div>
    <p class="mini" style="margin:8px 0 0">Tabela 4 da NDU 001 é orientativa: prefira a potência do fabricante. Aparelhos de reserva não entram no cálculo.</p>
  </fieldset>`;
}
function atualizarEnergisaParcial() {
  const u = ucSel(); if (u) { const r = CALC.energisa.ucs[u.id]; u.cargas.forEach((c, i) => { const el = $('#ct-' + i); if (el) el.textContent = totalCarga(r, i); }); const t = $('#ct-tot'); if (t) t.textContent = nfmt(r.C, 3); }
  renderUCLista(); renderUCRes();
  const col = $('#e-coletivo'); if (col && PROJ.energisa.modo !== 'individual') { const ae = document.activeElement, id = ae && ae.closest('#e-coletivo') ? null : 1; if (id) col.innerHTML = coletivoHTML(); else { const m = $('#e-agr') || $('#e-edif'); if (m) { const tmp = document.createElement('div'); tmp.innerHTML = coletivoHTML(); const n = tmp.querySelector('#e-agr, #e-edif'); if (n) m.outerHTML = n.outerHTML; } } }
}

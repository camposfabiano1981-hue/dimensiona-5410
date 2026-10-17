/* ================================================================
   INTERFACE — CARGA TÉRMICA / CLIMATIZAÇÃO
   ================================================================ */
function ambCSel() { return (PROJ.clima.amb || []).find(a => a.id === CSEL) || null; }
function normalizarClima(c) {
  const base = climaPadrao(), out = { ...base, ...(c || {}) };
  out.cons = Array.isArray(out.cons) && out.cons.length ? out.cons : base.cons;
  out.amb = (Array.isArray(out.amb) ? out.amb : []).map((a, i) => ({ ...ambClimaPadrao(i + 1), ...a, equip: Array.isArray(a.equip) ? a.equip : [], env: (Array.isArray(a.env) ? a.env : []).map(e => ({ ...envPadrao(e.tipo || 'parede'), ...e })) }));
  return out;
}
function renderClima() {
  const C = PROJ.clima, cc = CALC.clima;
  if (!ambCSel()) CSEL = C.amb[0]?.id || null;
  const confPill = cc.confOK ? 'ok' : 'fail';
  $('#tab-clima').innerHTML = `
  <div class="mem-bar"><div><h2 class="tit">Climatização — carga térmica</h2><p class="sub" style="margin:0">Cálculo horário do dia de projeto pela ABNT NBR 16401-1:2024, com verificação do conforto térmico pela NBR 16401-2:2024 (PMV/PPD) e ar exterior pela NBR 16401-3:2008 (a edição de 2024 está suspensa).</p></div>
  <div class="mem-bt"><span class="mini" style="align-self:center">Memorial de carga térmica:</span><button class="btn pri" type="button" data-exp="pdf" data-doc="clima">PDF</button><button class="btn" type="button" data-exp="docx" data-doc="clima">Word</button><button class="btn" type="button" data-exp="html" data-doc="clima">HTML</button></div></div>
  <fieldset data-scope="clima"><legend>Condições externas de projeto (NBR 16401-1:2024, Anexo A)</legend><div class="grade">
    ${fTxt('k', 'cidade', 'Localidade', C.cidade, { ph: 'ex.: Campo Grande' })}${fTxt('k', 'uf', 'UF', C.uf)}
    ${fNum('k', 'lat', 'Latitude (sul negativa)', C.lat, { u: '°' })}${fNum('k', 'alt', 'Altitude', C.alt, { u: 'm' })}
    ${fSel('k', 'mes', 'Mês do dia de projeto (dia 21)', C.mes, MESES_C.map((m, i) => [i, m]), { type: 'numsel' })}
    ${fSel('k', 'freq', 'Frequência anual', C.freq, [['0,4%', '0,4 %'], ['1%', '1 %'], ['2%', '2 %']])}
    ${fNum('k', 'tbs', 'TBS de projeto', C.tbs, { u: '°C' })}${fNum('k', 'tbu', 'TBU coincidente', C.tbu, { u: '°C' })}
    ${fNum('k', 'amp', 'Amplitude diária', C.amp, { u: 'K' })}${fNum('k', 'rhoSolo', 'Refletância do solo', C.rhoSolo)}
    ${fTxt('k', 'fonte', 'Fonte dos dados climáticos', C.fonte, { cls: 'wide', ph: 'NBR 16401-1:2024, Anexo A — estação, frequência' })}
    ${fInfo('Ar externo', `<span id="k-ext">UR ${nfmt(cc.URo, 0)} % · W ${nfmt(cc.Wo * 1000, 1)} g/kg · h ${nfmt(cc.ho, 1)} kJ/kg</span>`)}
  </div></fieldset>
  <fieldset data-scope="clima"><legend>Condições internas e conforto térmico (NBR 16401-2:2024)</legend><div class="grade">
    ${fNum('k', 'tint', 'TBS interna', C.tint, { u: '°C' })}${fNum('k', 'urInt', 'Umidade relativa', C.urInt, { u: '%' })}
    ${fNum('k', 'vel', 'Velocidade do ar', C.vel, { u: 'm/s' })}${fNum('k', 'trm', 'Temperatura radiante média', C.trm, { u: '°C', ph: C.tint })}
    ${fSel('k', 'met', 'Atividade (met)', C.met, [[1.0, '1,0 — sentado, em repouso'], [1.1, '1,1 — escritório, leitura'], [1.2, '1,2 — sentado, atividade leve'], [1.4, '1,4 — em pé, atividade leve'], [1.6, '1,6 — em pé, atividade média'], [2.0, '2,0 — caminhando']], { type: 'numsel' })}
    ${fSel('k', 'clo', 'Vestimenta (clo)', C.clo, [[0.36, '0,36 — bermuda e camiseta'], [0.5, '0,5 — roupa leve de verão'], [0.57, '0,57 — calça e camisa de manga curta'], [0.61, '0,61 — calça e camisa de manga longa'], [0.74, '0,74 — terno leve'], [1.0, '1,0 — roupa de inverno']], { type: 'numsel' })}
    ${fInfo('Conforto (PMV · PPD)', `<span id="k-conf"><span class="pill ${confPill}">PMV ${nfmt(cc.conf.pmv, 2)} · PPD ${nfmt(cc.conf.ppd, 1)} %</span></span>`)}
    ${fNum('k', 'margem', 'Margem de segurança', C.margem, { u: '%' })}${fNum('k', 'cop', 'COP para estimar a potência elétrica', C.cop)}
  </div><p class="mini" style="margin:8px 0 0">Critério de aceitabilidade: −0,5 ≤ PMV ≤ +0,5 (PPD ≤ 10 %), conforme a ASHRAE 55, base da NBR 16401-2:2024. Velocidade do ar na zona ocupada recomendada até 0,20 m/s em distribuição convencional.</p></fieldset>
  <details class="res" style="padding:0 14px 12px" ${CCONS_ABERTO ? 'open' : ''} id="k-cons-box"><summary style="padding:12px 0;cursor:pointer;font-weight:600">Componentes construtivos — U, capacidade e atraso térmico (NBR 15220-2)</summary>${consHTML()}</details>
  <div class="bancada">
    <aside class="lista" aria-label="Ambientes climatizados">
      <div class="lista-topo"><button class="btn pri" type="button" id="bt-add-camb" style="flex:1">Adicionar ambiente</button>${(PROJ.lumi || []).length ? '<button class="btn" type="button" id="bt-camb-lumi" style="flex:1">Trazer da luminotécnica</button>' : ''}</div>
      <div class="lista-itens" id="k-itens"></div>
      <div style="padding:10px;border-top:1px solid var(--line)"><button class="btn" type="button" id="bt-circ-clima" style="width:100%">Criar circuitos dos equipamentos</button></div>
    </aside>
    <div class="editor" id="k-ed"></div>
  </div>`;
  renderCambLista(); renderCambEditor();
}
function consHTML() {
  const C = PROJ.clima;
  return `<div class="tw"><table class="tbl"><thead><tr><th>Componente</th><th>Tipo</th><th>Camadas (exterior → interior)</th><th class="r">U</th><th class="r">CT</th><th class="r">φ (h)</th><th></th></tr></thead><tbody>
    ${C.cons.map((k, i) => { const P = propsCons(k.tipo === 'cobertura' ? k : { ...k, tipo: 'parede' }); return `<tr data-scope="ccons" data-c="${i}"><td><input type="text" data-k="nome" value="${esc(k.nome)}" style="width:240px" aria-label="Nome do componente"></td>
      <td><select data-k="tipo" data-struct="1" aria-label="Tipo">${opts([['parede', 'parede'], ['cobertura', 'cobertura']], k.tipo)}</select></td>
      <td><div style="display:grid;gap:4px">${k.cam.map((l, j) => `<span style="display:flex;gap:4px;align-items:center" data-l="${j}"><select data-k="mat" data-l="${j}" data-struct="1" aria-label="Material" style="max-width:230px">${opts(Object.entries(MAT_C).map(([m, x]) => [m, x.nome]), l.mat)}</select><input type="text" inputmode="decimal" data-k="e" data-l="${j}" data-type="num" value="${esc(showNum(l.e))}" style="width:56px" aria-label="Espessura (cm)"><em class="mini">cm</em><button class="btn sm" type="button" data-delcam="${i}:${j}" aria-label="Remover camada">×</button></span>`).join('')}<button class="btn sm" type="button" data-addcam="${i}" style="justify-self:start">+ camada</button></div></td>
      <td class="r" id="kc-u-${i}">${nfmt(P.U, 2)}</td><td class="r">${nfmt(P.CT, 0)}</td><td class="r">${nfmt(atrasoNBR15220(k), 1)}</td><td><button class="btn sm" type="button" data-delcons="${i}" aria-label="Remover componente">×</button></td></tr>`; }).join('')}
  </tbody></table></div><button class="btn sm" type="button" id="bt-add-cons" style="margin-top:8px">+ componente</button>
  <p class="mini" style="margin:6px 0 0">U em W/m²K (Rsi 0,13 em paredes e 0,17 em coberturas — fluxo descendente; Rse 0,04), CT em kJ/m²K e atraso φ pela NBR 15220-2. Blocos vazados como camada equivalente — ajuste λ, ρ e c pelo fabricante ou pela NBR 15220-3 se necessário.</p>`;
}
function renderCambLista() {
  const box = $('#k-itens'); if (!box) return; const A = PROJ.clima.amb;
  if (!A.length) { box.innerHTML = '<p class="mini" style="padding:12px">Nenhum ambiente. Adicione um ambiente ou traga os da luminotécnica.</p>'; return; }
  box.innerHTML = A.map((a, i) => { const r = CALC.clima.amb[a.id]; return `<button type="button" class="item" data-csel="${a.id}" aria-current="${a.id === CSEL}"><span class="n">${i + 1}</span><span class="d">${esc(a.nome)}</span><span class="pill ${r.status}">${pillTxt(r.status)}</span><span class="e">${nfmt(r.Q, 0)} W · ${nfmt(r.BTU, 0)} BTU/h · ${r.equip.n > 1 ? r.equip.n + '×' : ''}${nfmt(r.equip.cap / 1000, 0)}k</span></button>`; }).join('');
}
function renderCambEditor() {
  const box = $('#k-ed'); if (!box) return; const a = ambCSel();
  if (!a) { box.innerHTML = '<div class="res" style="padding:24px"><h2 class="tit">Sem ambientes</h2><p class="sub">Adicione os ambientes climatizados com a envoltória (paredes, janelas, cobertura), a ocupação e os equipamentos.</p></div>'; return; }
  box.innerHTML = `<div class="ed-topo"><span class="mini">Ambiente ${PROJ.clima.amb.indexOf(a) + 1} de ${PROJ.clima.amb.length}</span><span style="display:flex;gap:6px"><button class="btn sm" type="button" id="bt-dup-camb">Duplicar</button><button class="btn sm" type="button" id="bt-exc-camb">Excluir</button></span></div>
    <section class="res" id="k-res" aria-live="polite"></section><div id="k-form"></div>`;
  renderCambRes(); renderCambForm();
}
function renderCambRes() {
  const box = $('#k-res'); const a = ambCSel(); if (!box || !a) return; const r = CALC.clima.amb[a.id], f0 = v => nfmt(v, 0);
  const met = [['Carga total (pico)', `${f0(r.Q)} W`], ['Com margem', `${f0(r.BTU)} BTU/h`], ['TR', nfmt(r.TR, 2)], ['Sensível · latente', `${f0(r.Qs)} · ${f0(r.Ql)} W`], ['FCS', nfmt(r.FCS, 2)], ['Hora do pico', `${r.hPico} h`], ['Densidade', `${f0(r.Wm2)} W/m²`], ['Ar exterior', `${nfmt(r.Vef, 1)} L/s`], ['Equipamento', `${r.equip.n > 1 ? r.equip.n + ' × ' : ''}${nfmt(r.equip.cap, 0)} BTU/h`], ['Potência elétrica', `${f0(r.Pel)} W`]];
  box.innerHTML = `<div class="res-cab"><h3>${esc(a.nome)}</h3><span class="pill ${r.status}">${statusTxt(r.status)}</span></div>
    <div class="metr num">${met.map(([x, y]) => `<div><small>${x}</small><span>${y}</span></div>`).join('')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:14px;padding:12px 14px">
      <div style="min-width:0">${graficoCargaSVG(r, false)}</div>
      <div style="min-width:0"><table class="tbl"><thead><tr><th>Componente às ${r.hPico} h</th><th class="r">Sens. (W)</th><th class="r">Lat. (W)</th></tr></thead><tbody>${r.picoComp.map(x => `<tr><td>${esc(x.k)}</td><td class="r">${f0(x.s)}</td><td class="r">${f0(x.l)}</td></tr>`).join('')}<tr class="tot"><td>Total</td><td class="r">${f0(r.Qs)}</td><td class="r">${f0(r.Ql)}</td></tr></tbody></table></div>
    </div>
    ${r.falhas.length || r.avisos.length ? `<ul class="msgs">${r.falhas.map(x => `<li class="fail">${esc(x)}</li>`).join('')}${r.avisos.map(x => `<li class="warn">${esc(x)}</li>`).join('')}</ul>` : ''}`;
}
function renderCambForm() {
  const box = $('#k-form'); const a = ambCSel(); if (!box || !a) return; const C = PROJ.clima, r = CALC.clima.amb[a.id];
  const consOp = tipo => C.cons.filter(k => tipo === 'cobertura' ? k.tipo === 'cobertura' : k.tipo !== 'cobertura').map(k => [k.id, k.nome]);
  const lumis = (PROJ.lumi || []).map(x => [x.id, `${x.nome} (${nfmt(CALC.lumi[x.id].P, 0)} W)`]);
  const ae = AR_EXT[a.arExt] || AR_EXT.nenhum;
  box.innerHTML = `
  <fieldset data-scope="camb"><legend>Ambiente e ocupação</legend><div class="grade">
    ${fTxt('ka', 'nome', 'Nome', a.nome, { cls: 'w2' })}${fNum('ka', 'area', 'Área', a.area, { u: 'm²' })}${fNum('ka', 'pd', 'Pé-direito', a.pd, { u: 'm' })}
    ${fNum('ka', 'pessoas', 'Ocupantes', a.pessoas)}${fSel('ka', 'ativ', 'Atividade (calor por pessoa)', a.ativ, Object.entries(ATIV_P).map(([k, v]) => [k, `${v[0]} — ${v[1]} + ${v[2]} W`]), { cls: 'wide' })}
    ${fNum('ka', 'hIni', 'Uso: das', a.hIni, { u: 'h' })}${fNum('ka', 'hFim', 'até', a.hFim, { u: 'h' })}
    ${fSel('ka', 'lumiId', 'Iluminação pela luminotécnica', a.lumiId, [['', '— informar W/m² —'], ...lumis], { cls: 'w2', struct: true })}
    ${a.lumiId ? fInfo('Iluminação', `${nfmt(r.Wil, 0)} W`) : fNum('ka', 'ilumWm2', 'Densidade de iluminação', a.ilumWm2, { u: 'W/m²' })}
    ${fNum('ka', 'infil', 'Infiltração', a.infil, { u: 'ren/h' })}
    ${fSel('ka', 'arExt', 'Ar exterior (NBR 16401-3:2008)', a.arExt, Object.entries(AR_EXT).map(([k, v]) => [k, v[1] != null ? `${v[0]} — ${nfmt(v[1], 1)} L/s·p + ${nfmt(v[2], 1)} L/s·m²` : v[0]]), { cls: 'wide', struct: true })}
    ${a.arExt !== 'nenhum' ? fNum('ka', 'fp', 'Fp (por pessoa)', a.fp, { u: 'L/s', ph: ae[1] ?? '' }) + fNum('ka', 'fa', 'Fa (por área)', a.fa, { u: 'L/s·m²', ph: ae[2] ?? '' }) : ''}
  </div><p class="mini" style="margin:8px 0 0">Valores de Fp e Fa de referência (nível 1): confira na Tabela 1 da NBR 16401-3:2008 para o tipo de recinto.</p></fieldset>
  <fieldset><legend>Envoltória</legend>
    <div class="tw"><table class="tbl"><thead><tr><th>Elemento</th><th>Orientação / ΔT</th><th>Área (m²)</th><th>Componente ou vidro</th><th>Cor / proteção</th><th class="r">Máx. (W)</th><th></th></tr></thead><tbody>
    ${a.env.map((e, i) => { const x = r.env.find(z => z.i === i); return `<tr data-scope="cenv" data-i="${i}">
      <td><select data-k="tipo" data-struct="1" aria-label="Elemento">${opts([['parede', 'Parede externa'], ['janela', 'Janela / vidro'], ['cobertura', 'Cobertura'], ['divisoria', 'Divisória (não condic.)'], ['piso', 'Piso/laje (não condic.)']], e.tipo)}</select></td>
      <td>${e.tipo === 'cobertura' ? 'horizontal' : (e.tipo === 'divisoria' || e.tipo === 'piso' ? `<span class="unid"><input type="text" inputmode="decimal" data-k="dT" data-type="num" value="${esc(showNum(e.dT))}" style="width:56px" aria-label="Diferença de temperatura (K)"><em>K</em></span>` : `<select data-k="orient" data-struct="1" aria-label="Orientação">${opts(Object.entries(ORIENT).filter(([k]) => k !== 'H' || e.tipo === 'janela').map(([k, v]) => [k, v[0]]), e.orient)}</select>`)}</td>
      <td><input type="text" inputmode="decimal" data-k="area" data-type="num" value="${esc(showNum(e.area))}" style="width:64px" aria-label="Área"></td>
      <td>${e.tipo === 'janela' ? `<select data-k="vidro" data-struct="1" aria-label="Vidro" style="max-width:230px">${opts(Object.entries(VIDROS).map(([k, v]) => [k, `${v.nome} (FS ${nfmt(v.FS, 2)})`]), e.vidro)}</select>` : `<select data-k="cons" data-struct="1" aria-label="Componente" style="max-width:260px">${opts(consOp(e.tipo), e.cons)}</select>`}</td>
      <td>${e.tipo === 'janela' ? `<select data-k="sombra" data-struct="1" aria-label="Proteção solar">${opts(Object.entries(SOMBRA).map(([k, v]) => [k, `${v[0]} (${nfmt(v[1], 2)})`]), e.sombra)}</select>` : (e.tipo === 'parede' || e.tipo === 'cobertura' ? `<select data-k="cor" data-struct="1" aria-label="Cor externa">${opts(Object.entries(ABSORT).map(([k, v]) => [k, `${v[0]} (α ${nfmt(v[1], 2)})`]), e.cor)}</select>` : '—')}</td>
      <td class="r" id="ke-${i}">${x ? nfmt(x.qmax, 0) : '—'}</td><td><button class="btn sm" type="button" data-delenv="${i}" aria-label="Remover elemento">×</button></td></tr>`; }).join('')}
    </tbody></table></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">${[['parede', '+ parede'], ['janela', '+ janela'], ['cobertura', '+ cobertura'], ['divisoria', '+ divisória'], ['piso', '+ piso/laje']].map(([t, l]) => `<button class="btn sm" type="button" data-addenv="${t}">${l}</button>`).join('')}</div>
    <p class="mini" style="margin:8px 0 0">Informe a área líquida das paredes (descontadas as janelas). Divisórias e pisos com ambientes não condicionados usam a diferença de temperatura informada.</p>
  </fieldset>
  <fieldset><legend>Equipamentos</legend>
    <div class="tw"><table class="tbl"><thead><tr><th>Descrição</th><th>Qtd.</th><th>Sensível (W)</th><th>Latente (W)</th><th></th></tr></thead><tbody>
    ${a.equip.map((x, i) => `<tr data-scope="ceq" data-i="${i}"><td><input type="text" data-k="desc" value="${esc(x.desc || '')}" style="width:220px" aria-label="Descrição"></td><td><input type="text" inputmode="decimal" data-k="qtd" data-type="num" value="${esc(showNum(x.qtd))}" style="width:50px" aria-label="Quantidade"></td><td><input type="text" inputmode="decimal" data-k="W" data-type="num" value="${esc(showNum(x.W))}" style="width:70px" aria-label="Potência sensível"></td><td><input type="text" inputmode="decimal" data-k="WL" data-type="num" value="${esc(showNum(x.WL))}" style="width:70px" aria-label="Potência latente"></td><td><button class="btn sm" type="button" data-deleq="${i}" aria-label="Remover equipamento">×</button></td></tr>`).join('')}
    </tbody></table></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"><select id="k-eq-novo" aria-label="Equipamento típico" style="width:auto">${opts(EQ_TIPICOS.map((x, i) => [i, `${x[0]} — ${x[1]} W`]), 0)}</select><button class="btn sm" type="button" id="bt-add-eq">+ equipamento</button></div>
  </fieldset>
  <fieldset data-scope="camb"><legend>Observações</legend><div class="grade"><div class="campo wide"><label for="ka-obs">Texto incluído no memorial deste ambiente</label><textarea id="ka-obs" data-k="obs">${esc(a.obs)}</textarea></div></div></fieldset>`;
}
const EQ_TIPICOS = [['Computador de mesa com monitor', 150, 0], ['Notebook', 45, 0], ['Impressora laser (média em uso)', 150, 0], ['Televisor LED 50"', 110, 0], ['Geladeira / frigobar', 80, 0], ['Cafeteira', 300, 100], ['Forno de micro-ondas (média)', 300, 0], ['Servidor / rack pequeno', 500, 0], ['Projetor multimídia', 300, 0], ['Equipamento informado', 100, 0]];
function atualizarClimaParcial() {
  const cc = CALC.clima;
  const ext = $('#k-ext'); if (ext) ext.textContent = `UR ${nfmt(cc.URo, 0)} % · W ${nfmt(cc.Wo * 1000, 1)} g/kg · h ${nfmt(cc.ho, 1)} kJ/kg`;
  const cf = $('#k-conf'); if (cf) cf.innerHTML = `<span class="pill ${cc.confOK ? 'ok' : 'fail'}">PMV ${nfmt(cc.conf.pmv, 2)} · PPD ${nfmt(cc.conf.ppd, 1)} %</span>`;
  PROJ.clima.cons.forEach((k, i) => { const el = $('#kc-u-' + i); if (el) el.textContent = nfmt(propsCons(k.tipo === 'cobertura' ? k : { ...k, tipo: 'parede' }).U, 2); });
  const a = ambCSel(); if (a) { const r = cc.amb[a.id]; a.env.forEach((e, i) => { const el = $('#ke-' + i), x = r.env.find(z => z.i === i); if (el) el.textContent = x ? nfmt(x.qmax, 0) : '—'; }); }
  renderCambLista(); renderCambRes();
}
function criarCircuitosClima() {
  const C = PROJ.clima, cc = CALC.clima; let n = 0, u = 0;
  C.amb.forEach(a => { const r = cc.amb[a.id]; for (let k = 0; k < r.equip.n; k++) {
    const tag = `${a.id}:${k}`, W = Math.round(r.equip.cap / BTU_W / (+C.cop || 3.2) / 10) * 10, desc = `TUE — ar-condicionado ${nfmt(r.equip.cap, 0)} BTU/h — ${a.nome}${r.equip.n > 1 ? ` (${k + 1})` : ''}`;
    let c = PROJ.circuitos.find(x => x.climaTag === tag);
    if (c) { Object.assign(c, { desc, pot: W }); u++; }
    else { c = defaultsCircuito(PROJ.params, 'tue'); Object.assign(c, { num: proxNum(), desc, quadro: Object.keys(PROJ.quadros).find(q => q !== 'QM') || Object.keys(PROJ.quadros)[0], local: 'seco', pot: W, unid: 'W', fp: 0.9, climaTag: tag });
      if (PROJ.params.fornecimento !== 'monofasico') { c.ligacao = 'FF'; c.fases = 'AB'; c.pe = true; } metodoCompativel(c); PROJ.circuitos.push(c); n++; }
  } });
  mudou(true); toast(`${n} circuito(s) criado(s) e ${u} atualizado(s) para os equipamentos de climatização.`);
}

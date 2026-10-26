/* ================================================================
   INTERFACE — iluminação de exteriores (aba Luminotécnica, modo Exteriores)
   ================================================================ */
let LMODO = 'int', XSEL = null;
function areaXSel() { return (PROJ.lumiExt || []).find(a => a.id === XSEL) || null; }
function lumiModoHTML() {
  const ni = (PROJ.lumi || []).length, nx = (PROJ.lumiExt || []).length;
  return `<div class="ref-sel" role="group" aria-label="Tipo de iluminação"><button class="btn sm" type="button" data-lmodo="int" aria-pressed="${LMODO === 'int'}">Interiores — NBR ISO/CIE 8995-1 (${ni})</button><button class="btn sm" type="button" data-lmodo="ext" aria-pressed="${LMODO === 'ext'}">Exteriores — projetores e postes (${nx})</button></div>`;
}
function lumiExpHTML() {
  return (PROJ.lumi || []).length + (PROJ.lumiExt || []).length ? `<div class="mem-bt"><span class="mini" style="align-self:center">Relatório luminotécnico:</span><button class="btn pri" type="button" data-exp="pdf" data-doc="lumi">PDF</button><button class="btn" type="button" data-exp="docx" data-doc="lumi">Word</button><button class="btn" type="button" data-exp="html" data-doc="lumi">HTML</button></div>` : '';
}
function efeitosAreaExt(a, k) {
  if (k === 'arranjo') { a.tilt = a.arranjo === 'grade' ? 0 : (a.arranjo === 'cantos' ? 60 : 50); if (a.arranjo === 'grade') a.recuo = 0; else if (!(+a.recuo > 0)) a.recuo = 0.5; }
  if (k === 'prod' && a.prod === 'custom' && !(+a.clm > 0)) { const p = CATX.ref100; Object.assign(a, { cW: p.W, clm: p.lm, cFacho: p.facho }); }
  return ['arranjo', 'req', 'prod', 'circuito'].includes(k);
}
function renderLumiExt() {
  const X = PROJ.lumiExt || [];
  if (!areaXSel()) XSEL = X[0]?.id || null;
  const tot = X.reduce((s, a) => s + (CALC.lumiExt[a.id]?.P || 0), 0);
  $('#tab-lumi').innerHTML = `
  <div class="mem-bar"><h2 class="tit" style="margin:0">Luminotécnica</h2>${lumiExpHTML()}</div>
  ${lumiModoHTML()}
  <p class="sub">Iluminação de exteriores — pátios, estacionamentos, vias internas e quadras — com projetores ou luminárias em postes. Número de projetores pelo método dos lúmens, N = E × S / (Φ × Fu × Fd), e verificação da iluminância média e da uniformidade (U0 = Emín/Eméd) pelo método ponto a ponto, considerando a altura, a inclinação e a direção de mira de cada projetor (Mamede Filho, Instalações Elétricas Industriais). Níveis da ABNT NBR 5101 (vias públicas), da EN 12464-2 (locais de trabalho e estacionamentos externos) e da EN 12193 (quadras). ${X.length ? `${X.length} área${X.length > 1 ? 's' : ''} · ${nfmt(tot, 0)} W.` : ''}</p>
  <div class="bancada">
    <aside class="lista" aria-label="Áreas externas">
      <div class="lista-topo"><button class="btn pri" type="button" id="bt-add-ext" style="flex:1">Adicionar área externa</button></div>
      <div class="lista-itens" id="lumx-itens"></div>
    </aside>
    <div class="editor" id="lumx-ed"></div>
  </div>`;
  renderLumiExtLista(); renderLumiExtEditor();
}
function renderLumiExtLista() {
  const box = $('#lumx-itens'); if (!box) return; const X = PROJ.lumiExt || [];
  if (!X.length) { box.innerHTML = '<p class="mini" style="padding:12px">Nenhuma área externa. Clique em Adicionar área externa.</p>'; return; }
  box.innerHTML = X.map((a, i) => { const r = CALC.lumiExt[a.id]; return `<button type="button" class="item" data-xsel="${a.id}" aria-current="${a.id === XSEL}"><span class="n">${i + 1}</span><span class="d">${esc(a.nome || 'Área externa')}</span><span class="pill ${r.status}">${pillTxt(r.status)}</span><span class="e">${r.N} × ${nfmt(r.Wlum, 0)} W · ${nfmt(r.EmedPP, 0)}/${nfmt(r.Em, 0)} lx · U0 ${nfmt(r.U0, 2)}</span></button>`; }).join('');
}
function renderLumiExtEditor() {
  const box = $('#lumx-ed'); if (!box) return; const a = areaXSel();
  if (!a) { box.innerHTML = '<div class="res" style="padding:24px"><h2 class="tit">Sem áreas externas</h2><p class="sub">Adicione uma área (estacionamento, pátio, via interna ou quadra) para calcular o número de projetores, a iluminância média, a uniformidade e a potência. O resultado pode alimentar a potência de um circuito de iluminação.</p></div>'; return; }
  box.innerHTML = `<div class="ed-topo"><span class="mini">Área ${PROJ.lumiExt.indexOf(a) + 1} de ${PROJ.lumiExt.length}</span><span style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn sm" type="button" id="bt-dup-ext">Duplicar</button><button class="btn sm" type="button" id="bt-exc-ext">Excluir</button></span></div>
    <section class="res" id="lumx-res" aria-live="polite"></section><div id="lumx-form" data-scope="lext"></div>`;
  renderLumiExtRes(); renderLumiExtForm();
}
function sugExtTxt(a, r) {
  const s = r.sugestao;
  if (s.n != null) return s.n !== Math.round(+a.n || 1) ? `${s.n} poste(s) por lado` : '';
  if (s.k != null) return s.k !== r.k ? `${s.k} projetor(es) por poste` : '';
  return s.nx !== Math.round(+a.nx || 1) || s.ny !== Math.round(+a.ny || 1) ? `grade de ${s.nx} × ${s.ny} postes` : '';
}
function renderLumiExtRes() {
  const box = $('#lumx-res'); const a = areaXSel(); if (!box || !a) return; const r = CALC.lumiExt[a.id];
  const c = a.circuito ? PROJ.circuitos.find(x => x.id === a.circuito) : null, sug = sugExtTxt(a, r);
  const met = [['N (método dos lúmens)', nfmt(r.Nreq, 2)], ['N adotado', `${r.N} (${r.nPostes} × ${r.k})`], ['Eméd (lúmens)', `${nfmt(r.Emed, 0)} lx`], ['Eméd (ponto a ponto)', `${nfmt(r.EmedPP, 0)} lx`, !r.okEm], ['Emín · Emáx', `${nfmt(r.EminPP, 0)} · ${nfmt(r.EmaxPP, 0)} lx`], ['U0 = Emín/Eméd', nfmt(r.U0, 2), !r.okU0],
    ['Emín/Emáx', nfmt(r.Ud, 2)], ['Fu efetivo', nfmt(r.FuEf, 2)], ['I0 (eixo)', `${nfmt(r.I0, 0)} cd`], ['Potência', `${nfmt(r.P, 0)} W`], ['Densidade', `${nfmt(r.dens, 2)} W/m²`], ['Espaçamento', `${nfmt(r.esp, 1)} m (${nfmt(r.esp / r.h, 1)} × h)`]];
  const it = [[r.okEm ? 'ok' : 'fail', `Iluminância média ponto a ponto <b>${nfmt(r.EmedPP, 0)} lx</b> ≥ ${nfmt(r.Em, 0)} lx (${esc(r.req.ref)})`], [r.okU0 ? 'ok' : 'fail', `Uniformidade U0 = Emín/Eméd = <b>${nfmt(r.U0, 2)}</b> ≥ ${nfmt(r.U0req, 2)}`],
    [+a.tilt <= 70 ? 'ok' : 'fail', `Inclinação dos projetores ${nfmt(+a.tilt || 0, 0)}° ≤ 70° em relação à vertical (controle de ofuscamento)`], ['info', `Equipamento externo: grau de proteção mínimo IP65 e poste ligado ao condutor de proteção; DR de 30 mA recomendado no circuito (a NBR 5410, 5.1.3.2.2, o exige para tomadas em área externa)`]];
  box.innerHTML = `<div class="res-cab"><h3>${esc(a.nome || 'Área externa')} — ${esc(r.req.n)}</h3><span class="pill ${r.status}">${statusTxt(r.status)}</span></div>
    <div class="spec"><div class="linha"><span><small>Solução</small><b>${r.nPostes} poste(s) de ${nfmt(r.h, 1)} m × ${r.k} — ${esc(r.prod.nome)}</b></span></div>
    <div class="linha"><span><small>Projetor</small><b>${nfmt(r.Wlum, 0)} W · ${nfmt(r.phi, 0)} lm · facho ${nfmt(r.prod.facho, 0)}° (m = ${nfmt(r.m, 2)})</b></span><span><small>Requisito</small><b>Eméd ${nfmt(r.Em, 0)} lx · U0 ${nfmt(r.U0req, 2)}</b></span><span><small>Circuito</small><b>${c ? `${esc(c.num)}${c.potLumi ? ' (usa esta potência)' : ''}` : '—'}</b></span></div></div>
    <div class="metr num">${met.map(([x, y, bad]) => `<div><small>${x}</small><span class="${bad ? 'bad' : ''}">${y}</span></div>`).join('')}</div>
    <ul class="verif">${it.map(([k, t]) => `<li class="${k}"><span>${t}</span></li>`).join('')}</ul>
    <div class="planta"><div>${plantaExtSVG(a, r, false)}</div><div class="leg"><b>Iluminância no piso (lx)</b><span class="escala"></span><span class="mini" style="display:flex;justify-content:space-between"><span>0,5 × E</span><span>E exigida</span><span>1,5 × E</span></span>
      <span class="mini">Círculos: postes; setas: direção de mira (comprimento proporcional à inclinação). Malha de ${r.gx} × ${r.gy} pontos, passo ${nfmt(r.passo, 2)} m.</span>
      <span class="mini">Modelo de intensidade simétrico I(θ) = I0 · cos<sup>m</sup>θ em torno do eixo de mira; para luminárias viárias assimétricas, confirme com o arquivo IES/LDT do fabricante.</span>
      ${sug ? `<button class="btn sm" type="button" id="bt-sug-ext">Aplicar ${sug} (método dos lúmens)</button>` : ''}
      ${c && !c.potLumi ? `<button class="btn sm" type="button" data-potlumi="${c.id}">Usar a potência no circuito ${esc(c.num)}</button>` : ''}</div></div>
    ${r.falhas.length || r.avisos.length ? `<ul class="msgs">${r.falhas.map(x => `<li class="fail">${esc(x)}</li>`).join('')}${r.avisos.map(x => `<li class="warn">${esc(x)}</li>`).join('')}</ul>` : ''}`;
  const ph = { Em: nfmt(r.req.Em, 0), U0: nfmt(r.req.U0, 2) }; Object.entries(ph).forEach(([k, v]) => { const el = $('#x-' + k); if (el && document.activeElement !== el) el.placeholder = v; });
}
function renderLumiExtForm() {
  const box = $('#lumx-form'); const a = areaXSel(); if (!box || !a) return; const r = CALC.lumiExt[a.id], p = r.prod;
  const grupos = []; REQ_EXT.forEach(x => { let g = grupos.find(y => y[0] === x.g); if (!g) grupos.push(g = [x.g, []]); g[1].push([x.id, `${x.n} — ${x.Em} lx, U0 ${nfmt(x.U0, 2)}`]); });
  const circs = PROJ.circuitos.filter(c => c.tipo === 'ilum').map(c => [c.id, `${c.num} — ${c.desc || 'Iluminação'}`]);
  const prods = [['Projetores (refletores) LED', CAT_EXT.filter(x => x.tipo === 'projetor').map(x => [x.id, `${x.nome} — ${nfmt(x.lm, 0)} lm, ${x.facho}°`])], ['Luminárias viárias e de jardim', CAT_EXT.filter(x => x.tipo !== 'projetor').map(x => [x.id, `${x.nome} — ${nfmt(x.lm, 0)} lm, ${x.facho}°`])], ['Outro', [['custom', 'Informar os dados do projetor']]]];
  const lin = ['lado', 'ambos', 'alternado'].includes(a.arranjo);
  box.innerHTML = `
  <fieldset><legend>Área e requisito</legend><div class="grade">
    ${fTxt('x', 'nome', 'Nome da área', a.nome, { cls: 'w2' })}
    ${fSelG('x', 'req', 'Tipo de área (NBR 5101 / EN 12464-2 / EN 12193)', a.req, grupos, { cls: 'wide', struct: true })}
    ${fNum('x', 'Em', 'Iluminância média adotada', a.Em, { u: 'lx', ph: r.req.Em, dica: 'Vazio = valor de referência.' })}${fNum('x', 'U0', 'Uniformidade Emín/Eméd adotada', a.U0, { ph: r.req.U0 })}
    ${fSel('x', 'circuito', 'Circuito de iluminação', a.circuito, [['', '— nenhum —'], ...circs], { cls: 'w2', struct: true })}
  </div></fieldset>
  <fieldset><legend>Geometria e arranjo dos postes</legend><div class="grade">
    ${fNum('x', 'L', 'Comprimento da área', a.L, { u: 'm' })}${fNum('x', 'W', 'Largura da área', a.W, { u: 'm' })}
    ${fSel('x', 'arranjo', 'Arranjo', a.arranjo, Object.entries(ARRANJOS_EXT), { cls: 'wide', struct: true })}
    ${lin ? fNum('x', 'n', a.arranjo === 'lado' ? 'Postes no lado' : 'Postes por lado', a.n) : ''}
    ${a.arranjo === 'grade' ? fNum('x', 'nx', 'Postes no comprimento', a.nx) + fNum('x', 'ny', 'Postes na largura', a.ny) : ''}
    ${fNum('x', 'k', 'Projetores por poste', a.k)}${fNum('x', 'h', 'Altura de montagem', a.h, { u: 'm' })}
    ${fNum('x', 'tilt', 'Inclinação do projetor (0° = vertical para baixo)', a.tilt, { u: '°', dica: a.arranjo === 'grade' ? 'Na grade use 0° (facho para baixo).' : 'Típico 40° a 60°; acima de 70° há ofuscamento.' })}
    ${a.arranjo !== 'grade' ? fNum('x', 'recuo', 'Recuo do poste para fora da área', a.recuo, { u: 'm' }) : ''}
  </div></fieldset>
  <fieldset><legend>Projetor</legend><div class="grade">
    ${fSelG('x', 'prod', 'Projetor ou luminária (dados típicos de catálogo)', a.prod, prods, { cls: 'wide', struct: true })}
    ${a.prod === 'custom' ? fNum('x', 'cW', 'Potência', a.cW, { u: 'W' }) + fNum('x', 'clm', 'Fluxo luminoso', a.clm, { u: 'lm' }) + fNum('x', 'cFacho', 'Abertura do facho (50 % de I0)', a.cFacho, { u: '°' }) : ''}
    <div class="campo wide"><span class="lbl">Dados do produto</span><span class="mini" style="padding-top:4px">${nfmt(p.W, 0)} W · ${nfmt(p.lm, 0)} lm · ${nfmt(p.lm / (p.W || 1), 0)} lm/W · facho ${nfmt(p.facho, 0)}°${p.ip ? ' · ' + p.ip : ''}. Produto genérico; confirme fluxo e fotometria na ficha técnica do fabricante.</span></div>
  </div></fieldset>
  <fieldset><legend>Fatores do método dos lúmens</legend><div class="grade">
    ${fNum('x', 'fu', 'Fator de utilização Fu', a.fu, { dica: 'Parcela do fluxo que atinge a área: 0,4 a 0,7 para projetores bem apontados.' })}
    ${fNum('x', 'fd', 'Fator de depreciação Fd', a.fd, { dica: 'Manutenção do fluxo e sujeira: 0,70 a 0,85 para LED.' })}
  </div></fieldset>
  <fieldset><legend>Observações</legend><div class="grade"><div class="campo wide"><label for="x-obs">Texto incluído no relatório desta área</label><textarea id="x-obs" data-k="obs">${esc(a.obs)}</textarea></div></div></fieldset>`;
}
function aplicarSugestaoExt() {
  const a = areaXSel(), r = a && CALC.lumiExt[a.id]; if (!r) return; const s = r.sugestao;
  if (s.n != null) a.n = s.n; else if (s.k != null) a.k = s.k; else { a.nx = s.nx; a.ny = s.ny; }
  mudou(true); const q = CALC.lumiExt[a.id]; toast(`${q.N} projetor(es): Eméd ${nfmt(q.EmedPP, 0)} lx, U0 ${nfmt(q.U0, 2)}.`);
}

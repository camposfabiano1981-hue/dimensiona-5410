/* ================================================================
   INTERFACE — barra de menus suspensos: itens numerados, submenus (▸),
   atalhos de teclado alinhados à direita e separadores
   ================================================================ */
/* tabelas de referência: [código, rótulo curto (botões da aba), rótulo do menu] */
const REF_TABS = [['33', 'Tab. 33', 'Tabela 33 — tipos de linhas elétricas'], ['35', 'Tab. 35', 'Tabela 35 — temperaturas dos condutores'], ['36', 'Tab. 36', 'Tabela 36 — capacidade de condução, PVC (A1 a D)'], ['37', 'Tab. 37', 'Tabela 37 — capacidade de condução, EPR/XLPE (A1 a D)'],
  ['38', 'Tab. 38', 'Tabela 38 — capacidade de condução, PVC (E, F e G)'], ['39', 'Tab. 39', 'Tabela 39 — capacidade de condução, EPR/XLPE (E, F e G)'], ['40', 'Tab. 40/41', 'Tabelas 40 e 41 — temperatura e resistividade do solo'], ['42', 'Tab. 42/43', 'Tabelas 42 e 43 — agrupamento de circuitos'],
  ['44', 'Tab. 44/45', 'Tabelas 44 e 45 — cabos enterrados'], ['46', 'Tab. 46/47/48/58', 'Tabelas 46, 47, 48 e 58 — seções mínimas'], ['k', 'Fator k', 'Fator k — curto-circuito e condutor de proteção'], ['r20', 'Resistências', 'Resistência dos condutores (NBR NM 280)'], ['cat', 'Diâmetros', 'Diâmetros de cabos e eletrodutos'],
  ['dps', 'DPS', 'DPS — NBR 5410, NBR 5419-4 e fabricantes'], ['spda', 'SPDA (NBR 5419)', 'SPDA — NBR 5419:2026 (níveis, ângulos e materiais)'], ['8995', 'NBR ISO/CIE 8995-1', 'NBR ISO/CIE 8995-1 — iluminação de interiores'], ['ext', 'Exteriores (NBR 5101 / EN 12464-2)', 'Exteriores — NBR 5101, EN 12464-2 e EN 12193'], ['lum', 'Lâmpadas e luminárias', 'Lâmpadas e luminárias'], ['ndu', 'Energisa NDU 001', 'Energisa NDU 001 — demanda e categorias']];
const ATALHOS = { F2: ['projeto'], F4: ['circuitos'], F8: ['quadros'], F9: ['memoria', 'mem:descritivo'] };
let MENU_ABERTO = null;
function menuDef() {
  const nome5410 = REF_TABS.slice(0, 13);
  return [
    { id: 'projeto', rot: 'Projeto', tabs: ['projeto'], itens: [
      { r: 'Dados do projeto e parâmetros gerais', go: 'projeto', k: 'F2' }, '-',
      { r: 'Novo projeto', act: 'novo', conf: 'Confirmar: apagar o projeto atual?' },
      { r: 'Abrir projeto…', act: 'abrir', k: 'Ctrl+O' },
      { r: 'Salvar projeto', act: 'salvar', k: 'Ctrl+S' }, '-',
      { r: 'Carregar o projeto de exemplo', act: 'exemplo', conf: 'Confirmar: substituir pelo exemplo?' }] },
    { id: 'inst', rot: 'Instalações', tabs: ['circuitos', 'eletrodutos', 'eletrocalhas', 'quadros', 'dps', 'energisa'], itens: [
      { r: 'Circuitos — condutores e proteção', go: 'circuitos', k: 'F4' },
      { r: 'Eletrodutos', go: 'eletrodutos' },
      { r: 'Eletrocalhas, perfilados e leitos', go: 'eletrocalhas' },
      { r: 'Quadros de carga', go: 'quadros', k: 'F8' },
      { r: 'Proteção contra surtos (DPS)', go: 'dps' }, '-',
      { r: 'Demanda Energisa — padrão de entrada', go: 'energisa' }] },
    { id: 'sist', rot: 'Sistemas', tabs: ['lumi', 'clima', 'aterr', 'spda'], itens: [
      { r: 'Luminotécnica', sub: [{ r: 'Interiores — NBR ISO/CIE 8995-1', act: 'lumi:int', go: 'lumi', chk: LMODO === 'int' }, { r: 'Exteriores — projetores e postes', act: 'lumi:ext', go: 'lumi', chk: LMODO === 'ext' }] },
      { r: 'Climatização — carga térmica', go: 'clima' },
      { r: 'Aterramento', sub: [{ r: 'Simplificado — hastes', act: 'aterr:simplificado', go: 'aterr', chk: PROJ.aterr.modo !== 'completo' }, { r: 'Completo — solo em camadas, cabo e malha', act: 'aterr:completo', go: 'aterr', chk: PROJ.aterr.modo === 'completo' }] },
      { r: 'SPDA — proteção contra descargas atmosféricas (NBR 5419)', go: 'spda' }] },
    { id: 'mat', rot: 'Materiais', tabs: ['materiais'], itens: [
      { r: 'Cadastro e lista de materiais', go: 'materiais' },
      { r: 'Exportar a lista de materiais', sub: [{ r: 'PDF', act: 'exp:pdf.materiais' }, { r: 'Word', act: 'exp:docx.materiais' }, { r: 'HTML', act: 'exp:html.materiais' }, { r: 'Excel', act: 'exp:xlsxmat' }] }] },
    { id: 'docs', rot: 'Documentos', tabs: ['memoria'], itens: [
      { r: 'Memorial descritivo', act: 'mem:descritivo', go: 'memoria', k: 'F9' },
      { r: 'Memórias de cálculo', sub: MEMORIAS.map(m => ({ r: m.nome, act: 'mem:' + m.id, go: 'memoria', dis: !m.tem(PROJ, CALC) })) },
      { r: 'Relatório consolidado', act: 'mem:consolidado', go: 'memoria' }, '-',
      { r: 'Quadro de cargas (Excel)', act: 'exp:xlsx' },
      { r: 'Lista de materiais (Excel)', act: 'exp:xlsxmat' }] },
    { id: 'tab', rot: 'Tabelas', tabs: ['tabelas'], itens: [
      { r: 'NBR 5410 — tabelas de dimensionamento', sub: nome5410.map(([k, , l]) => ({ r: l, act: 'ref:' + k, go: 'tabelas' })) },
      ...REF_TABS.slice(13).map(([k, , l]) => ({ r: l, act: 'ref:' + k, go: 'tabelas' }))] }
  ];
}
function menuLista(itens) {
  let n = 0;
  return itens.map(it => {
    if (it === '-') return '<div class="mb-sep" role="separator"></div>';
    n++;
    const atr = [it.chk != null ? `role="menuitemradio" aria-checked="${!!it.chk}"` : 'role="menuitem"', it.sub ? 'aria-haspopup="menu" aria-expanded="false"' : '', it.dis ? 'aria-disabled="true"' : '', it.go ? `data-go="${it.go}"` : '', it.act ? `data-act="${it.act}"` : '', it.conf ? `data-conf="${esc(it.conf)}"` : ''].filter(Boolean).join(' ');
    return `<div class="mb-li${it.sub ? ' tem-sub' : ''}" role="none"><button type="button" class="mb-op" tabindex="-1" data-n="${n}" ${atr}><span class="mb-chk" aria-hidden="true">${it.chk ? '✓' : ''}</span><span class="mb-rot">${n} - ${esc(it.r)}</span>${it.sub ? '<span class="mb-seta" aria-hidden="true">▸</span>' : `<span class="mb-k">${esc(it.k || '')}</span>`}</button>${it.sub ? `<div class="mb-drop mb-sub" role="menu" hidden>${menuLista(it.sub)}</div>` : ''}</div>`;
  }).join('');
}
function renderMenubar() {
  const box = $('#menubar'); if (!box) return;
  box.innerHTML = menuDef().map((m, i) => `<div class="mb-item" role="none"><button type="button" class="mb-top" role="menuitem" id="mb-${m.id}" data-menu="${m.id}" aria-haspopup="menu" aria-expanded="false" tabindex="${i ? -1 : 0}">${esc(m.rot)}</button></div>`).join('');
}
const menuDesktop = () => window.matchMedia('(min-width: 701px)').matches;
const itensDe = d => [...d.children].filter(c => c.classList.contains('mb-li')).map(c => c.firstElementChild);
function focarItem(d, onde) { const l = itensDe(d).filter(b => b.getAttribute('aria-disabled') !== 'true'); const b = onde === 'ultimo' ? l[l.length - 1] : l[0]; if (b) b.focus(); }
function ajustarDrop(d, sub) {
  if (!menuDesktop()) return;
  d.style.left = ''; d.classList.remove('esq');
  const r = d.getBoundingClientRect(), W = document.documentElement.clientWidth;
  if (r.right > W - 8) { if (sub) d.classList.add('esq'); else d.style.left = `${Math.min(0, W - 8 - r.right)}px`; }
}
function abrirMenu(id, foco) {
  fecharMenus(false);
  const m = menuDef().find(x => x.id === id), top = $('#mb-' + id); if (!m || !top) return;
  top.parentElement.insertAdjacentHTML('beforeend', `<div class="mb-drop" role="menu" aria-labelledby="mb-${id}">${menuLista(m.itens)}</div>`);
  top.setAttribute('aria-expanded', 'true'); MENU_ABERTO = id;
  const d = top.parentElement.lastElementChild; ajustarDrop(d, false);
  if (foco) focarItem(d, foco);
}
function fecharMenus(focarTopo) {
  const id = MENU_ABERTO; MENU_ABERTO = null;
  $$('#menubar .mb-item > .mb-drop').forEach(d => d.remove());
  $$('#menubar .mb-top').forEach(b => b.setAttribute('aria-expanded', 'false'));
  if (focarTopo && id) $('#mb-' + id).focus();
}
function abrirSub(li, foco) {
  const d = li.querySelector(':scope > .mb-drop'); if (!d) return;
  [...li.parentElement.children].forEach(c => { if (c !== li && c.classList.contains('aberto')) fecharSub(c); });
  d.hidden = false; li.classList.add('aberto'); li.firstElementChild.setAttribute('aria-expanded', 'true'); ajustarDrop(d, true);
  if (foco) focarItem(d, 'primeiro');
}
function fecharSub(li) {
  li.querySelectorAll('.mb-li.aberto').forEach(x => { x.classList.remove('aberto'); x.firstElementChild.setAttribute('aria-expanded', 'false'); x.querySelector(':scope > .mb-drop').hidden = true; });
  li.classList.remove('aberto'); li.firstElementChild.setAttribute('aria-expanded', 'false'); const d = li.querySelector(':scope > .mb-drop'); if (d) d.hidden = true;
}
function moverTopo(passo) {
  const tops = $$('#menubar .mb-top'), i = tops.findIndex(b => b.dataset.menu === MENU_ABERTO || b === document.activeElement), j = (Math.max(0, i) + passo + tops.length) % tops.length, aberto = MENU_ABERTO != null;
  tops.forEach((b, k) => b.tabIndex = k === j ? 0 : -1);
  if (aberto) abrirMenu(tops[j].dataset.menu, 'primeiro'); else tops[j].focus();
}
function ativarItem(el) {
  if (el.getAttribute('aria-disabled') === 'true') return;
  const li = el.parentElement;
  if (li.classList.contains('tem-sub')) { if (li.classList.contains('aberto') && !menuDesktop()) fecharSub(li); else abrirSub(li, true); return; }
  if (el.dataset.conf && !el.dataset.armado) {
    const rot = el.querySelector('.mb-rot'); el.dataset.txt = rot.textContent; el.dataset.armado = '1'; el.classList.add('armado'); rot.textContent = `${el.dataset.n} - ${el.dataset.conf}`;
    clearTimeout(el._t); el._t = setTimeout(() => { if (!el.isConnected) return; delete el.dataset.armado; el.classList.remove('armado'); rot.textContent = el.dataset.txt; }, 4000);
    return;
  }
  fecharMenus(false);
  acaoMenu(el.dataset.act || '', el.dataset.go);
}
function acaoMenu(a, go) {
  const [k, v] = a.split(':');
  if (k === 'novo') { PROJ = projetoVazio(); SEL = null; LSEL = null; XSEL = null; mudou(true); irPara('projeto'); toast('Projeto em branco criado.'); return; }
  if (k === 'exemplo') { PROJ = projetoExemplo(); SEL = PROJ.circuitos[0]?.id || null; LSEL = null; XSEL = null; mudou(true); toast('Projeto de exemplo carregado.'); return; }
  if (k === 'abrir') return $('#arquivo').click();
  if (k === 'salvar') return $('#bt-salvar').click();
  if (k === 'exp') { const [tipo, doc] = v.split('.'); return exportar(tipo, document.createElement('button'), doc); }
  if (k === 'lumi') LMODO = v;
  else if (k === 'aterr') { PROJ.aterr.modo = v; if (v === 'simplificado' && PROJ.aterr.solo.modelo === '2c') PROJ.aterr.solo.modelo = 'homog'; recalc(); salvarLocal(); }
  else if (k === 'mem') MEMSEL = v;
  else if (k === 'ref') REFTAB = v;
  if (go) irPara(go);
}
function cliqueMenu(el) {
  if (el.classList.contains('mb-top')) { if (MENU_ABERTO === el.dataset.menu) fecharMenus(false); else abrirMenu(el.dataset.menu); return; }
  if (el.classList.contains('mb-op')) ativarItem(el);
}
/* caminho da tela atual (Menu › item › modo) e situação dos circuitos */
function renderTrilha() {
  const box = $('#trilha'); if (!box || !PROJ) return;
  const M = menuDef(), m = M.find(x => x.tabs.includes(TAB)) || M[0];
  const ROT = { projeto: 'Dados do projeto', circuitos: 'Circuitos', eletrodutos: 'Eletrodutos', eletrocalhas: 'Eletrocalhas', quadros: 'Quadros de carga', energisa: 'Demanda Energisa', lumi: 'Luminotécnica', clima: 'Climatização', aterr: 'Aterramento', spda: 'SPDA — NBR 5419:2026', dps: 'Proteção contra surtos (DPS)', materiais: 'Cadastro e lista de materiais', tabelas: 'Tabelas' };
  let p = [m.rot, ROT[TAB]];
  if (TAB === 'lumi') p.push(LMODO === 'ext' ? 'Exteriores' : 'Interiores');
  else if (TAB === 'aterr') p.push(PROJ.aterr.modo === 'completo' ? 'Completo' : 'Simplificado');
  else if (TAB === 'memoria') p = [m.rot, MEMSEL === 'descritivo' ? 'Memorial descritivo' : MEMSEL === 'consolidado' ? 'Relatório consolidado' : 'Memórias de cálculo', MEMO[MEMSEL] ? MEMO[MEMSEL].nome : ''];
  else if (TAB === 'tabelas') { const t = REF_TABS.find(x => x[0] === REFTAB); p.push(t ? t[2] : ''); }
  const n = PROJ.circuitos.length, nf = PROJ.circuitos.filter(c => CALC.res[c.id].status === 'fail').length;
  p = p.filter(Boolean);
  box.innerHTML = `<span class="tr-cam">${p.map((x, i) => i === p.length - 1 ? `<b>${esc(x)}</b>` : esc(x)).join('<span class="tr-sep" aria-hidden="true">›</span>')}</span>
    <span class="tr-st"><button type="button" class="tr-chip${nf ? ' fail' : ''}" data-go="circuitos">${n} circuito${n === 1 ? '' : 's'}${nf ? ` · ${nf} pendente${nf === 1 ? '' : 's'}` : ' · OK'}</button><span class="tr-at">F2 projeto · F4 circuitos · F8 quadros · F9 memorial · Ctrl+S salvar</span></span>`;
  $$('#menubar .mb-top').forEach(b => b.classList.toggle('atual', b.dataset.menu === m.id));
}

/* ---------- eventos do menu ---------- */
document.addEventListener('pointerdown', ev => { if (MENU_ABERTO && !ev.target.closest('#menubar')) fecharMenus(false); });
document.addEventListener('pointerover', ev => {
  if (ev.pointerType !== 'mouse' || !MENU_ABERTO || !menuDesktop()) return;
  const el = ev.target.closest && ev.target.closest('#menubar button'); if (!el) return;
  if (el.classList.contains('mb-top')) { if (MENU_ABERTO !== el.dataset.menu) abrirMenu(el.dataset.menu); return; }
  const li = el.parentElement;
  if (li.classList.contains('tem-sub')) abrirSub(li, false);
  else [...li.parentElement.children].forEach(c => { if (c.classList.contains('aberto')) fecharSub(c); });
});
document.addEventListener('keydown', ev => {
  const el = ev.target.closest && ev.target.closest('#menubar button'), k = ev.key;
  if (!el) {
    if (k === 'Escape' && MENU_ABERTO) { fecharMenus(true); return; }
    if (ATALHOS[k] && !ev.ctrlKey && !ev.altKey && !ev.metaKey && !ev.shiftKey) { ev.preventDefault(); fecharMenus(false); const [go, a] = ATALHOS[k]; acaoMenu(a || '', go); return; }
    if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && !ev.shiftKey && /^[so]$/i.test(k)) { ev.preventDefault(); acaoMenu(k.toLowerCase() === 's' ? 'salvar' : 'abrir'); }
    return;
  }
  if (el.classList.contains('mb-top')) {
    if (k === 'ArrowRight' || k === 'ArrowLeft') { ev.preventDefault(); if (!MENU_ABERTO) { const tops = $$('#menubar .mb-top'), j = (tops.indexOf(el) + (k === 'ArrowRight' ? 1 : tops.length - 1)) % tops.length; tops.forEach((b, x) => b.tabIndex = x === j ? 0 : -1); tops[j].focus(); } else moverTopo(k === 'ArrowRight' ? 1 : -1); }
    else if (k === 'ArrowDown' || k === 'Enter' || k === ' ') { ev.preventDefault(); abrirMenu(el.dataset.menu, 'primeiro'); }
    else if (k === 'ArrowUp') { ev.preventDefault(); abrirMenu(el.dataset.menu, 'ultimo'); }
    else if (k === 'Escape') { ev.preventDefault(); fecharMenus(true); }
    return;
  }
  const d = el.closest('.mb-drop'), li = el.parentElement, sub = d.classList.contains('mb-sub');
  const l = itensDe(d).filter(b => b.getAttribute('aria-disabled') !== 'true'), i = l.indexOf(el);
  if (k === 'ArrowDown' || k === 'ArrowUp') { ev.preventDefault(); const b = l[(i + (k === 'ArrowDown' ? 1 : l.length - 1)) % l.length]; if (b) b.focus(); }
  else if (k === 'Home' || k === 'End') { ev.preventDefault(); focarItem(d, k === 'End' ? 'ultimo' : 'primeiro'); }
  else if (k === 'ArrowRight') { ev.preventDefault(); if (li.classList.contains('tem-sub')) abrirSub(li, true); else moverTopo(1); }
  else if (k === 'ArrowLeft') { ev.preventDefault(); if (sub) { const p = d.parentElement; fecharSub(p); p.firstElementChild.focus(); } else moverTopo(-1); }
  else if (k === 'Enter' || k === ' ') { ev.preventDefault(); ativarItem(el); }
  else if (k === 'Escape') { ev.preventDefault(); if (sub) { const p = d.parentElement; fecharSub(p); p.firstElementChild.focus(); } else fecharMenus(true); }
  else if (/^[1-9]$/.test(k)) { const b = itensDe(d).find(x => x.dataset.n === k); if (b) { ev.preventDefault(); b.focus(); ativarItem(b); } }
  else if (k === 'Tab') fecharMenus(false);
});

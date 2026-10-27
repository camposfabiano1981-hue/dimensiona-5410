/* ================================================================
   INTERFACE
   ================================================================ */
const LS_KEY = 'dimensiona5410.projeto.v1', LS_TAB = 'dimensiona5410.aba';
const ABAS = ['projeto', 'circuitos', 'eletrodutos', 'eletrocalhas', 'quadros', 'dps', 'energisa', 'lumi', 'clima', 'aterr', 'spda', 'materiais', 'memoria', 'tabelas'];
const QDIAG = {};
let PROJ, CALC, SEL = null, LSEL = null, USEL = null, CSEL = null, ASEL = null, CCONS_ABERTO = false, DESC_ABERTO = false, MEMSEL = 'descritivo', LPLANTA = 'mapa', TAB = 'circuitos', REFTAB = '33', REFMAT = 'Cu';
const MEMOPT = { metodologia: true, detalhe: true, anexo33: true, assinatura: true };
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = escH;
const parseNum = v => { if (v == null) return null; let s = String(v).trim(); if (!s) return null; if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.'); const n = Number(s); return isFinite(n) ? n : null; };
const showNum = v => (v == null || v === '') ? '' : String(v).replace('.', ',');
const safeId = s => String(s).replace(/[^a-zA-Z0-9_-]/g, '_');
const EMOLDURA = window.self !== window.top;
const DOWNLOADS = (() => {
  try { if (window.claude && typeof window.claude.use === 'function') return Promise.resolve(window.claude.use('downloads')).catch(() => null); } catch (e) { }
  return Promise.resolve(null);
})();

/* ---------- campos ---------- */
function fTxt(pre, k, label, v, o = {}) {
  return `<div class="campo ${o.cls || ''}"><label for="${pre}-${k}">${label}</label><input type="text" id="${pre}-${k}" data-k="${k}" value="${esc(v ?? '')}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.list ? ` list="${o.list}"` : ''} autocomplete="off">${o.dica ? `<span class="dica">${o.dica}</span>` : ''}</div>`;
}
const pct = v => (v == null || v === '') ? v : +(+v * 100).toFixed(4);
function fNum(pre, k, label, v, o = {}) {
  if (o.pct) { v = pct(v); if (o.ph != null && typeof o.ph === 'number') o.ph = pct(o.ph); }
  const inp = `<input type="text" inputmode="decimal" class="numin" id="${pre}-${k}" data-k="${k}" data-type="${o.pct ? 'pct' : 'num'}" value="${esc(showNum(v))}"${o.ph != null ? ` placeholder="${esc(showNum(o.ph))}"` : ''} autocomplete="off">`;
  return `<div class="campo ${o.cls || ''}"><label for="${pre}-${k}">${label}</label>${o.u ? `<div class="unid">${inp}<em>${o.u}</em></div>` : inp}${o.dica ? `<span class="dica">${o.dica}</span>` : ''}</div>`;
}
const opts = (list, v) => list.map(([val, l]) => `<option value="${esc(val)}"${String(val) === String(v ?? '') ? ' selected' : ''}>${esc(l)}</option>`).join('');
function fSel(pre, k, label, v, list, o = {}) {
  return `<div class="campo ${o.cls || ''}"><label for="${pre}-${k}">${label}</label><select id="${pre}-${k}" data-k="${k}"${o.type ? ` data-type="${o.type}"` : ''}${o.struct ? ' data-struct="1"' : ''}>${opts(list, v)}</select>${o.dica ? `<span class="dica">${o.dica}</span>` : ''}</div>`;
}
function fSelG(pre, k, label, v, grupos, o = {}) {
  const corpo = grupos.map(([g, list]) => g ? `<optgroup label="${esc(g)}">${opts(list, v)}</optgroup>` : opts(list, v)).join('');
  return `<div class="campo ${o.cls || ''}"><label for="${pre}-${k}">${label}</label><select id="${pre}-${k}" data-k="${k}"${o.struct ? ' data-struct="1"' : ''}>${corpo}</select>${o.dica ? `<span class="dica">${o.dica}</span>` : ''}</div>`;
}
const fInfo = (label, html, id) => `<div class="campo"><span class="lbl">${label}</span><b class="num"${id ? ` id="${id}"` : ''} style="padding-top:6px">${html}</b></div>`;
function fChk(pre, k, label, v, o = {}) {
  return `<div class="campo ${o.cls || ''}"><label class="chk" for="${pre}-${k}"><input type="checkbox" id="${pre}-${k}" data-k="${k}" data-type="chk"${v ? ' checked' : ''}${o.struct ? ' data-struct="1"' : ''}><span>${label}</span></label>${o.dica ? `<span class="dica">${o.dica}</span>` : ''}</div>`;
}
function lerValor(el) {
  const t = el.dataset.type;
  if (t === 'chk') return el.checked;
  if (t === 'num') return parseNum(el.value);
  if (t === 'pct') { const n = parseNum(el.value); return n == null ? null : n / 100; }
  if (t === 'numsel') return el.value === '' ? null : Number(el.value);
  if (t === 'agrup') return el.value === 'dif' ? 'dif' : Number(el.value);
  return el.value;
}

/* ---------- persistência ---------- */
let _tSalvar = null;
function salvarLocal() { clearTimeout(_tSalvar); _tSalvar = setTimeout(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(PROJ)); } catch (e) { } }, 350); }
function normalizarProjeto(p) {
  const base = projetoVazio();
  const out = { ...base, ...p };
  out.info = { ...base.info, ...(p.info || {}) };
  out.params = { ...paramsPadrao(), ...(p.params || {}) };
  if (!EDIFICACAO[out.params.edificacao]) out.params.edificacao = out.params.edificacao === 'nao' ? 'comercial' : 'residencial';
  if (!ISOL[out.params.isolacao]) out.params.isolacao = 'PVC';
  out.quadros = { ...(p.quadros || {}) };
  out.trechos = { ...(p.trechos || {}) };
  out.catalogo = { ...(p.catalogo || {}) };
  out.energisa = normalizarEnergisa(p.energisa);
  out.clima = normalizarClima(p.clima);
  out.aterr = normalizarAterr(p.aterr);
  out.spda = normalizarSPDA(p.spda);
  out.dps = normalizarDPS(p.dps);
  out.materiais = normalizarMateriais(p.materiais);
  out.descritivo = normalizarDescritivo(p.descritivo, out.params.edificacao);
  out.memorias = { grupo: MEMORIAS.map(m => m.id), ...(p.memorias || {}) };
  out.lumi = (Array.isArray(p.lumi) ? p.lumi : []).map((a, i) => { const n = { ...defaultsAmbiente(i + 1), ...a }; if (!AMB[n.amb]) n.amb = AMB_PADRAO; if (n.prod !== 'custom' && !CATL[n.prod]) n.prod = CAT_LUM[0].id; return n; });
  out.lumiExt = (Array.isArray(p.lumiExt) ? p.lumiExt : []).map((a, i) => { const n = { ...ambExtPadrao(i + 1), ...a }; if (!REQX[n.req]) n.req = REQX_PADRAO; if (n.prod !== 'custom' && !CATX[n.prod]) n.prod = 'ref150'; if (!ARRANJOS_EXT[n.arranjo]) n.arranjo = 'lado'; return n; });
  out.circuitos = (Array.isArray(p.circuitos) ? p.circuitos : []).map(c => { const d = defaultsCircuito(out.params, c.tipo || 'tug'); const n = { ...d, ...c, id: c.id || d.id }; if (!ISOL[n.isolacao]) n.isolacao = 'PVC'; if (!MET[n.metodo]) n.metodo = d.metodo; return n; });
  garantirQuadros(out);
  return out;
}
function garantirQuadros(p) {
  if (!Object.keys(p.quadros).length) p.quadros['QD-1'] = { desc: 'Quadro de distribuição', fd: null, icc: p.params.icc, dvMont: 0 };
  p.circuitos.forEach(c => { if (!c.quadro) c.quadro = Object.keys(p.quadros)[0]; if (!p.quadros[c.quadro]) p.quadros[c.quadro] = { desc: '', fd: null, icc: p.params.icc, dvMont: 0 }; });
  if (!Array.isArray(p.lumi)) p.lumi = [];
  if (!Array.isArray(p.lumiExt)) p.lumiExt = [];
}
function carregar() {
  try { const s = localStorage.getItem(LS_KEY); if (s) return normalizarProjeto(JSON.parse(s)); } catch (e) { }
  return projetoExemplo();
}

/* ---------- ciclo de atualização ---------- */
function recalc() { garantirQuadros(PROJ); if (!PROJ.energisa) PROJ.energisa = energisaPadrao(); if (!PROJ.clima) PROJ.clima = climaPadrao(); CALC = calcularProjeto(PROJ); CALC.energisa = calcEnergisa(PROJ); CALC.clima = calcClima(PROJ, CALC); if (!PROJ.aterr) PROJ.aterr = aterrPadrao(); CALC.aterr = calcAterramento(PROJ, CALC); if (!PROJ.spda) PROJ.spda = spdaPadrao(); CALC.spda = calcSPDA(PROJ, CALC); if (!PROJ.dps) PROJ.dps = dpsPadrao(); CALC.dps = calcDPS(PROJ, CALC); if (!PROJ.materiais) PROJ.materiais = materiaisPadrao(); if (!PROJ.descritivo) PROJ.descritivo = descritivoPadrao(PROJ.params.edificacao); CALC.materiais = calcMateriais(PROJ, CALC); }
function circSel() { return PROJ.circuitos.find(c => c.id === SEL) || null; }
function ambSel() { return (PROJ.lumi || []).find(a => a.id === LSEL) || null; }
function mudou(struct) { recalc(); salvarLocal(); renderCabecalho(); if (struct) renderAba(); else renderParcial(); }
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 3200); }

function onCampo(ev, isChange) {
  const el = ev.target; if (!el.dataset || !el.dataset.k) return;
  const box = el.closest('[data-scope]'); if (!box) return;
  const isTexto = el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && el.type !== 'checkbox' && el.type !== 'date');
  if (isTexto && isChange) return;
  if (!isTexto && !isChange) return;
  const sc = box.dataset.scope, k = el.dataset.k, v = lerValor(el);
  let struct = !!el.dataset.struct;
  if (sc === 'circ') { const c = circSel(); if (!c) return; if (k === 'esquema') { const [l, pe] = String(v).split('+'); c.ligacao = l; c.pe = pe === 'PE'; struct = efeitosCircuito(c, 'ligacao') || struct; } else { c[k] = v; struct = efeitosCircuito(c, k) || struct; } }
  else if (sc === 'params') { PROJ.params[k] = v; struct = efeitosParams(k) || struct; }
  else if (sc === 'info') { PROJ.info[k] = v; if (k === 'obra') PROJ.exemplo = false; }
  else if (sc === 'quadro') { const q = PROJ.quadros[box.dataset.q]; if (q) q[k] = v; }
  else if (sc === 'trecho') { const key = box.dataset.t; const T = PROJ.trechos[key] = PROJ.trechos[key] || {}; T[k] = v; if (k === 'tipoCalha') { delete T.altura; delete T.largura; } }
  else if (sc === 'clima') { PROJ.clima[k] = v; }
  else if (sc === 'ccons') { const kk = PROJ.clima.cons[+box.dataset.c]; if (!kk) return; if (el.dataset.l != null) { const l = kk.cam[+el.dataset.l]; if (l) l[k] = v; } else kk[k] = v; }
  else if (sc === 'camb') { const a = ambCSel(); if (!a) return; a[k] = v; }
  else if (sc === 'cenv') { const a = ambCSel(); const e = a && a.env[+box.dataset.i]; if (!e) return; e[k] = v; if (k === 'tipo') { const d = envPadrao(v); e.cons = d.cons; e.cor = d.cor; e.orient = v === 'cobertura' ? 'H' : (e.orient === 'H' && v !== 'janela' ? 'N' : e.orient); } }
  else if (sc === 'ceq') { const a = ambCSel(); const x = a && a.equip[+box.dataset.i]; if (x) x[k] = v; }
  else if (sc === 'energ') { const E = PROJ.energisa; if (k === 'fonte003') E.t003.fonte = v; else E[k] = v; if (k === 'modo' && v === 'edificio' && !E.conj.length) E.conj.push({ desc: 'Apartamentos tipo', n: 8, area: 60 }); }
  else if (sc === 'uc') { const u = ucSel(); if (!u) return; u[k] = v; }
  else if (sc === 'carga') { const u = ucSel(); const c = u && u.cargas[+box.dataset.i]; if (!c) return; c[k] = v; if (k === 'g') { const d = cargaPadrao(v); c.cv = d.cv; } }
  else if (sc === 'conj') { const c = PROJ.energisa.conj[+box.dataset.i]; if (c) c[k] = v; }
  else if (sc === 't003') { const row = PROJ.energisa.t003[box.dataset.tab][+box.dataset.i]; if (row) row[+k] = v; }
  else if (sc === 'amb') { const a = ambSel(); if (!a) return; a[k] = v; struct = efeitosAmbiente(a, k) || struct; }
  else if (sc === 'lext') { const a = areaXSel(); if (!a) return; a[k] = v; struct = efeitosAreaExt(a, k) || struct; }
  else if (sc === 'memopt') { MEMOPT[k] = v; struct = true; }
  else if (sc === 'memgrupo') { const g = new Set(PROJ.memorias.grupo); if (v) g.add(k); else g.delete(k); PROJ.memorias.grupo = MEMORIAS.map(m => m.id).filter(id => g.has(id)); struct = true; }
  else if (sc === 'asolo') { PROJ.aterr.solo[k] = v; }
  else if (sc === 'mat') { PROJ.materiais[k] = v; }
  else if (sc === 'matauto') { const A = PROJ.materiais.auto, o = A[box.dataset.key] = A[box.dataset.key] || {}; if (k === 'inc') o.off = !v; else if (k === 'qtd' && (v == null || v === '')) delete o.qtd; else o[k] = v; }
  else if (sc === 'matitem') { const x = PROJ.materiais.itens[+box.dataset.i]; if (x) x[k] = v; }
  else if (sc === 'desc') { PROJ.descritivo[k] = v; }
  else if (sc === 'descinf') { const D = PROJ.descritivo, inf = box.dataset.inf; if (k === 'cod') D.influencias[inf] = v; else { D.medidas = D.medidas || {}; if (v) D.medidas[inf] = v; else delete D.medidas[inf]; } }
  else if (sc === 'desclocal') { const l = PROJ.descritivo.locais[+box.dataset.i]; if (l) l[k] = v; }
  else if (sc === 'amed') { const m = PROJ.aterr.solo.med[+box.dataset.i]; if (m) m[k] = v; }
  else if (sc === 'dpsg') { PROJ.dps[k] = v; }
  else if (sc === 'dpsq') { const q = PROJ.quadros[box.dataset.q] = PROJ.quadros[box.dataset.q] || {}; q[k] = v; }
  else if (sc === 'spda') { PROJ.spda[k] = v; struct = efeitosSPDA(k) || struct; }
  else if (sc === 'spdalin') { const l = PROJ.spda.linhas[+box.dataset.i]; if (l) l[k] = v; }
  else if (sc === 'aarr') { const a = arrSel(); if (!a) return; a[k] = v; struct = efeitosArranjo(a, k) || struct; }
  else if (sc === 'cat') { if (v == null || !(v > 0)) delete PROJ.catalogo[k]; else PROJ.catalogo[k] = v; }
  mudou(struct);
}
function metodoCompativel(c) {
  const m = MET[c.metodo];
  if (m && m.tipos.includes(c.tipoCabo)) return;
  const par = MET_PAR[c.metodo];
  c.metodo = (par && MET[par].tipos.includes(c.tipoCabo)) ? par : METODOS.find(x => x.tipos.includes(c.tipoCabo)).id;
}
function efeitosCircuito(c, k) {
  if (k === 'ligacao') {
    const n = nFases(c.ligacao), us = { monofasico: 'A', bifasico: 'AB', trifasico: 'ABC' }[PROJ.params.fornecimento];
    if (n === 1) c.fases = (c.fases && c.fases.length === 1) ? c.fases : 'A';
    else if (n === 2) c.fases = (c.fases && c.fases.length === 2) ? c.fases : 'AB';
    else c.fases = 'ABC';
    if (!us.includes(c.fases[0])) c.fases = n === 1 ? 'A' : 'AB';
    if (c.ligacao !== 'FFFN') { c.neutroReduzido = false; c.harmonicas = false; }
    return true;
  }
  if (k === 'tipoCabo') { metodoCompativel(c); return true; }
  if (k === 'material') { if (c.material === 'Al' && c.secaoManual && c.secaoManual < 16) c.secaoManual = null; if (c.material === 'Al' && c.tipoCabo === 'isolado' && c.isolacao !== 'PVC') c.isolacao = 'PVC'; return true; }
  if (k === 'tipo') {
    if (c.tipo === 'motor' && !['cv', 'HP', 'kW', 'W'].includes(c.unid)) c.unid = 'cv';
    if (c.tipo !== 'motor' && ['cv', 'HP'].includes(c.unid)) c.unid = 'W';
    if (c.tipo === 'dist') { c.local = 'quadro'; if (!c.alimenta) c.demandaAuto = false; }
    if (c.tipo === 'controle') c.material = 'Cu';
    return true;
  }
  if (k === 'dispositivo') { c.inManual = null; return true; }
  if (k === 'quadro' && c.alimenta === c.quadro) { c.alimenta = ''; return true; }
  return false;
}
function efeitosAmbiente(a, k) {
  if (k === 'prod') { const p = CATL[a.prod]; if (p && p.tipo === 'lampada') { if (!CORPOS[a.corpo] || (p.tubo ? !['calha', 'aletada', 'leitosa', 'hermetica'].includes(a.corpo) : ['calha', 'aletada', 'leitosa', 'hermetica'].includes(a.corpo))) a.corpo = p.tubo ? 'aletada' : 'plafonier'; a.nLamp = p.tubo ? 2 : 1; } a.uf = null; return true; }
  if (k === 'L' || k === 'W') { a.nx = null; a.ny = null; }
  return ['corpo', 'fm', 'amb', 'circuito'].includes(k);
}
function efeitosParams(k) {
  const P = PROJ.params;
  const pres = { '127/220': [127, 220], '220/380': [220, 380], '220/440': [220, 440], '254/440': [254, 440], '115/230': [115, 230], '230/400': [230, 400] };
  if (k === 'sistema' && pres[P.sistema]) { [P.U0, P.U] = pres[P.sistema]; return true; }
  if (k === 'U0' || k === 'U') { P.sistema = 'outro'; }
  if (k === 'origem') { P.dvTotal = P.origem === 'entrega' ? 5 : 7; P.dvDist = Math.max(0.5, P.dvTotal - P.dvTerminal); return true; }
  if (k === 'tipoCabo' && !METODOS.find(m => m.id === P.metodo && m.tipos.includes(P.tipoCabo))) { P.metodo = METODOS.find(m => m.tipos.includes(P.tipoCabo)).id; return true; }
  return false;
}

/* ---------- arquivos ---------- */
async function oferecerArquivo(nome, dados, mime) {
  const dl = await DOWNLOADS;
  if (dl) {
    try { await dl.save({ filename: nome, data: dados }); toast(`${nome} salvo.`); }
    catch (e) { if (e && e.code === 'declined') toast('Download cancelado.'); else toast('Não foi possível salvar o arquivo' + (e && e.message ? `: ${e.message}` : '.')); }
    return;
  }
  const blob = dados instanceof Blob ? dados : new Blob([dados], { type: mime });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = nome; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
  toast(`${nome} gerado.`);
}
function slug() { return (PROJ.info.obra || 'projeto').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 50) || 'projeto'; }
function docAtual(doc) { return docMemoria(PROJ, CALC, doc === 'memoria' ? 'consolidado' : doc, MEMOPT, PROJ.memorias.grupo); }
async function exportar(tipo, bt, doc) {
  const txt = bt.textContent; bt.disabled = true; bt.textContent = 'Gerando…';
  try {
    const { blocos, nome, meta } = tipo.startsWith('xlsx') ? {} : docAtual(doc);
    if (tipo === 'pdf') await oferecerArquivo(nome + '.pdf', await gerarPDF(blocos, meta), 'application/pdf');
    else if (tipo === 'docx') await oferecerArquivo(nome + '.docx', await gerarDOCX(blocos, meta), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    else if (tipo === 'xlsxmat') await oferecerArquivo(`lista-de-materiais-${slug()}-${(PROJ.info.revisao || 'R00').toLowerCase()}.xlsx`, await gerarXLSX(PROJ, CALC, 'materiais'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    else if (tipo === 'xlsx') await oferecerArquivo(`quadro-de-cargas-${slug()}-${(PROJ.info.revisao || 'R00').toLowerCase()}.xlsx`, await gerarXLSX(PROJ, CALC), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    else await oferecerArquivo(nome + '.html', gerarHTMLArquivo(blocos, meta.titulo), 'text/html');
  } catch (e) { console.error(e); toast(e.message || 'Falha ao gerar o arquivo.'); }
  finally { bt.disabled = false; bt.textContent = txt; }
}
function abrirArquivo(file) {
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const p = JSON.parse(fr.result);
      if (!p || !Array.isArray(p.circuitos) || !p.params) throw new Error('formato');
      PROJ = normalizarProjeto(p); PROJ.exemplo = false; SEL = PROJ.circuitos[0]?.id || null; LSEL = PROJ.lumi[0]?.id || null; mudou(true); toast(`Projeto "${PROJ.info.obra || file.name}" aberto.`);
    } catch (e) { toast('Arquivo inválido: use um projeto salvo pelo Dimensiona 5410 (.json).'); }
  };
  fr.readAsText(file);
}
function confirmar2(bt, rotulo, acao) {
  if (bt.dataset.armado) { clearTimeout(bt._t); delete bt.dataset.armado; bt.textContent = bt.dataset.txt; bt.classList.remove('perigo'); acao(); return; }
  bt.dataset.txt = bt.textContent; bt.dataset.armado = '1'; bt.textContent = rotulo; bt.classList.add('perigo');
  bt._t = setTimeout(() => { delete bt.dataset.armado; bt.textContent = bt.dataset.txt; bt.classList.remove('perigo'); }, 4000);
}

/* ---------- cabeçalho ---------- */
function renderCabecalho() {
  const I = PROJ.info, P = PROJ.params;
  $('#carimbo').innerHTML = [['Obra', I.obra || 'sem nome'], ['Responsável', I.responsavel || '—'], ['Sistema', `${P.U0}/${P.U} V · ${P.aterramento}`], ['Rev. · data', `${I.revisao || 'R00'} · ${dataCurta(I.data) || '—'}`]]
    .map(([a, b]) => `<div><small>${a}</small><span title="${esc(b)}">${esc(b)}</span></div>`).join('');
  $('#banner').hidden = !PROJ.exemplo;
  renderTrilha();
}
function irPara(tab) {
  TAB = ABAS.includes(tab) ? tab : 'circuitos';
  try { localStorage.setItem(LS_TAB, TAB); } catch (e) { }
  try { if (!EMOLDURA) history.replaceState(null, '', '#' + TAB); } catch (e) { }
  ABAS.forEach(a => { $('#tab-' + a).hidden = a !== TAB; });
  renderCabecalho(); renderAba();
}
function renderAba() { ({ projeto: renderProjeto, circuitos: renderCircuitos, eletrodutos: renderEletrodutos, eletrocalhas: renderEletrocalhas, quadros: renderQuadros, energisa: renderEnergisa, lumi: renderLumi, clima: renderClima, aterr: renderAterr, spda: renderSPDA, dps: renderDPS, materiais: renderMateriais, memoria: renderMemoria, tabelas: renderTabelas })[TAB](); }
function renderParcial() {
  if (TAB === 'circuitos') { renderLista(); renderResultado(); const c = circSel(), d = $('#c-dem-val'); if (c && d) d.innerHTML = demCircTxt(c); }
  else if (TAB === 'projeto') Object.values(CALC.quadros).forEach(q => { const el = $('#pd-' + safeId(q.q)); if (el) el.innerHTML = demQuadroTxt(q.dem); });
  else if (TAB === 'eletrocalhas') Object.values(CALC.calhas).forEach(t => { const pre = 'k-' + safeId(t.key); const r = $('#' + pre + '-res'); if (r) r.innerHTML = calhaRes(t); const p = $('#' + pre + '-pill'); if (p) p.outerHTML = pillCalha(t, pre); });
  else if (TAB === 'lumi') { if (LMODO === 'ext') { renderLumiExtLista(); renderLumiExtRes(); } else { renderLumiLista(); renderLumiRes(); } }
  else if (TAB === 'energisa') atualizarEnergisaParcial();
  else if (TAB === 'clima') atualizarClimaParcial();
  else if (TAB === 'aterr') atualizarAterrParcial();
  else if (TAB === 'spda') renderSPDARes();
  else if (TAB === 'dps') atualizarDPSParcial();
  else if (TAB === 'materiais') renderMatResumo();
  else if (TAB === 'memoria') { clearTimeout(renderParcial._t); renderParcial._t = setTimeout(() => { const f = $('#folha'); if (f && TAB === 'memoria') f.innerHTML = renderHTMLDoc(docAtual(MEMSEL).blocos); }, 400); }
  else if (TAB === 'eletrodutos') Object.values(CALC.trechos).forEach(t => { const pre = 't-' + safeId(t.key); const r = $('#' + pre + '-res'); if (r) r.innerHTML = trechoRes(t); const p = $('#' + pre + '-pill'); if (p) p.outerHTML = pillTrecho(t, pre); });
  else if (TAB === 'quadros') Object.values(CALC.quadros).forEach(q => { const r = $('#q-' + safeId(q.q) + '-res'); if (r) r.innerHTML = quadroRes(q); const g = $('#q-' + safeId(q.q) + '-diag'); if (g) g.innerHTML = diagramaHTML(q); });
}

/* ---------- PROJETO ---------- */
function renderProjeto() {
  const I = PROJ.info, P = PROJ.params;
  const metOpts = METODOS.filter(m => m.tipos.includes(P.tipoCabo)).map(m => [m.id, `${m.id} — ${refEfetivo(m, P.tipoCabo, 'baixo')} — ${m.desc}`]);
  $('#tab-projeto').innerHTML = `
  <h2 class="tit">Dados do projeto</h2>
  <p class="sub">Identificação da obra e parâmetros gerais. Os parâmetros valem para todos os circuitos; os padrões de instalação são usados nos circuitos novos.</p>
  <fieldset data-scope="info"><legend>Identificação da obra</legend><div class="grade">
    ${fTxt('i', 'obra', 'Obra', I.obra, { cls: 'w2' })}${fTxt('i', 'cliente', 'Proprietário / cliente', I.cliente)}
    ${fTxt('i', 'endereco', 'Endereço', I.endereco, { cls: 'w2' })}${fTxt('i', 'cidade', 'Cidade – UF', I.cidade)}
    ${fTxt('i', 'responsavel', 'Responsável técnico', I.responsavel)}${fTxt('i', 'registro', 'Registro profissional', I.registro, { ph: 'CREA/CFT nº' })}
    ${fTxt('i', 'art', 'ART / TRT / RRT', I.art)}
    <div class="campo"><label for="i-data">Data</label><input type="date" id="i-data" data-k="data" value="${esc(I.data)}"></div>
    ${fTxt('i', 'revisao', 'Revisão', I.revisao)}
    ${fTxt('i', 'concessionaria', 'Norma da distribuidora (referência)', I.concessionaria, { cls: 'w2' })}
    <div class="campo wide"><label for="i-obs">Observações para a memória</label><textarea id="i-obs" data-k="obs">${esc(I.obs)}</textarea></div>
  </div></fieldset>
  <fieldset data-scope="params"><legend>Sistema elétrico</legend><div class="grade">
    ${fSel('p', 'sistema', 'Sistema de tensões', P.sistema, [['127/220', '127/220 V'], ['220/380', '220/380 V'], ['230/400', '230/400 V'], ['115/230', '115/230 V'], ['220/440', '220/440 V'], ['254/440', '254/440 V'], ['outro', 'Outro (informar)']], { struct: true })}
    ${fNum('p', 'U0', 'Tensão fase-neutro U0', P.U0, { u: 'V' })}${fNum('p', 'U', 'Tensão fase-fase U', P.U, { u: 'V' })}
    ${fSel('p', 'fornecimento', 'Fornecimento', P.fornecimento, [['monofasico', 'Monofásico (F+N)'], ['bifasico', 'Bifásico (F+F+N)'], ['trifasico', 'Trifásico (F+F+F+N)']], { struct: true })}
    ${fSel('p', 'aterramento', 'Esquema de aterramento', P.aterramento, [['TN-S', 'TN-S'], ['TN-C-S', 'TN-C-S'], ['TT', 'TT']], { struct: true })}
    ${P.aterramento === 'TT' ? fNum('p', 'RA', 'Resistência de aterramento RA', P.RA, { u: 'Ω' }) : ''}
    ${fSel('p', 'edificacao', 'Edificação', P.edificacao, Object.entries(EDIFICACAO), { dica: 'Define as regras de DR (5.1.3.2.2) e de uso do alumínio (6.2.3.8).' })}
    ${fSel('p', 'classe', 'Encordoamento (cobre)', P.classe, [[5, 'Classe 5 — flexível'], [2, 'Classe 2 — encordoado']], { type: 'numsel' })}
  </div></fieldset>
  <fieldset data-scope="params"><legend>Queda de tensão (6.2.7)</legend><div class="grade">
    ${fSel('p', 'origem', 'Origem da instalação', P.origem, [['entrega', 'Ponto de entrega em BT (5 %)'], ['trafo', 'Transformador próprio (7 %)'], ['gerador', 'Gerador próprio (7 %)']], { struct: true })}
    ${fNum('p', 'dvTotal', 'Limite total', P.dvTotal, { u: '%' })}
    ${fNum('p', 'dvTerminal', 'Limite em circuitos terminais', P.dvTerminal, { u: '%', dica: 'Máximo de 4 % pela norma (6.2.7.2).' })}
    ${fNum('p', 'dvDist', 'Limite adotado em alimentadores', P.dvDist, { u: '%', dica: 'Parcela do total reservada aos circuitos de distribuição.' })}
    ${P.origem !== 'entrega' ? fChk('p', 'supLongo', 'Acréscimo de 0,005 %/m para linhas acima de 100 m (até 0,5 %)', P.supLongo, { cls: 'w2' }) : ''}
  </div></fieldset>
  <fieldset data-scope="params"><legend>Proteção e curto-circuito</legend><div class="grade">
    ${fNum('p', 'inMin', 'Corrente nominal mínima dos disjuntores', P.inMin, { u: 'A' })}
    ${fNum('p', 'icc', 'Icc presumida padrão para quadros novos', P.icc, { u: 'kA', dica: 'Cada quadro tem sua própria Icc na aba Quadros de carga.' })}
    ${fNum('p', 'icn', 'Icn dos disjuntores NBR NM 60898', P.icn, { u: 'kA' })}
    ${fNum('p', 'icn947', 'Icu dos disjuntores NBR IEC 60947-2', P.icn947, { u: 'kA' })}
    ${fNum('p', 'im947', 'Disparo magnético (60947-2) Im/In', P.im947, { u: '× In' })}
    ${fChk('p', 'verifCC', 'Verificar solicitação térmica no curto-circuito', P.verifCC)}
    ${fChk('p', 'verifPE', 'Verificar também o condutor de proteção (6.4.3.1.2)', P.verifPE)}
    ${fChk('p', 'classe3', 'Disjuntores até 32 A com limitação classe 3', P.classe3, { dica: 'Usa o I²t máximo da classe 3 (EN 60898-1, anexo ZA).' })}
    ${fNum('p', 'tCC', 'Tempo de atuação nos demais casos', P.tCC, { u: 's' })}
    ${fNum('p', 'cosPartida', 'cosφ na partida de motores', P.cosPartida)}
    ${fNum('p', 'secMaxPar', 'Seção máxima por condutor antes do paralelismo', P.secMaxPar, { u: 'mm²', dica: 'Acima dela o circuito passa a usar condutores em paralelo.' })}
  </div></fieldset>
  <fieldset data-scope="params"><legend>Demanda dos quadros (alimentadores)</legend>
    <p class="mini" style="margin:0 0 10px">O alimentador de um quadro é calculado pela demanda desse quadro: fator de demanda × carga instalada dos circuitos terminais + demanda dos quadros a jusante. O padrão é 100 % (toda a carga instalada). Informe um fator por quadro ou a demanda já calculada (kVA) — por exemplo, pela norma da distribuidora — e o alimentador é recalculado.</p>
    <div class="grade">${fNum('p', 'fdPadrao', 'Fator de demanda padrão', P.fdPadrao, { u: '%', pct: true, dica: 'Usado nos quadros sem fator próprio.' })}</div>
    <div class="tw" style="margin-top:12px"><table class="tbl"><thead><tr><th>Quadro</th><th>Fator de demanda</th><th>Demanda informada</th><th class="r">Resultado</th></tr></thead><tbody>
    ${Object.values(CALC.quadros).map(q => { const Qd = PROJ.quadros[q.q] || {}, pre = 'pq-' + safeId(q.q); return `<tr data-scope="quadro" data-q="${esc(q.q)}"><td><b>${esc(q.q)}</b>${Qd.desc ? `<br><span class="mini">${esc(Qd.desc)}</span>` : ''}</td>
      <td><span class="unid"><input type="text" inputmode="decimal" id="${pre}-fd" data-k="fd" data-type="pct" value="${esc(showNum(pct(Qd.fd)))}" placeholder="${showNum(pct(P.fdPadrao))}" aria-label="Fator de demanda do ${esc(q.q)} (%)"><em>%</em></span></td>
      <td><span class="unid"><input type="text" inputmode="decimal" id="${pre}-dm" data-k="demManual" data-type="num" value="${esc(showNum(Qd.demManual))}" placeholder="calculada" aria-label="Demanda informada do ${esc(q.q)} (kVA)"><em>kVA</em></span></td>
      <td class="r" id="pd-${safeId(q.q)}">${demQuadroTxt(q.dem)}</td></tr>`; }).join('')}
    </tbody></table></div>
  </fieldset>
  <fieldset data-scope="params"><legend>Padrões para circuitos novos</legend><div class="grade">
    ${fNum('p', 'tempAmb', 'Temperatura ambiente', P.tempAmb, { u: '°C' })}${fNum('p', 'tempSolo', 'Temperatura do solo', P.tempSolo, { u: '°C' })}
    ${fSel('p', 'material', 'Material do condutor', P.material, Object.entries(MATERIAL))}
    ${fSel('p', 'tipoCabo', 'Tipo de condutor', P.tipoCabo, Object.entries(TIPO_CABO), { struct: true })}
    ${fSel('p', 'isolacao', 'Isolação', P.isolacao, Object.entries(ISOL))}
    ${fSel('p', 'metodo', 'Maneira de instalar (Tabela 33)', P.metodo, metOpts, { cls: 'wide' })}
    ${fSel('p', 'tipoEletroduto', 'Eletroduto', P.tipoEletroduto, Object.entries(ELETRODUTOS).map(([k, e]) => [k, `${e.nome} (${e.norma})`]))}
    ${fSel('p', 'eletrodutoMin', 'Menor eletroduto admitido', P.eletrodutoMin, POL_ORDEM.map(p => [p, p]))}
    ${fSel('p', 'dispositivo', 'Dispositivo de proteção', P.dispositivo, Object.entries(DISP).map(([k, d]) => [k, `${d.nome} (${d.norma})`]))}
    ${fSel('p', 'curva', 'Curva de disparo', P.curva, [['B', 'B'], ['C', 'C'], ['D', 'D']])}
  </div></fieldset>`;
}

/* ---------- CIRCUITOS ---------- */
function renderCircuitos() {
  if (!circSel()) SEL = PROJ.circuitos[0]?.id || null;
  $('#tab-circuitos').innerHTML = `
  <div class="bancada">
    <aside class="lista" aria-label="Circuitos">
      <div class="lista-topo">
        <select id="novo-tipo" aria-label="Tipo do novo circuito" style="flex:1 1 140px;width:auto">${opts(Object.entries(TIPOS), 'tug')}</select>
        <button class="btn pri" type="button" id="bt-add">Adicionar</button>
      </div>
      <div class="lista-itens" id="lista-itens"></div>
    </aside>
    <div class="editor" id="editor"></div>
  </div>`;
  renderLista(); renderEditor();
}
function pillTxt(s) { return s === 'ok' ? 'OK' : (s === 'warn' ? 'Obs.' : 'Pendente'); }
function dotsFases(c) { return `<span class="dots" aria-hidden="true">${(c.fases || '').split('').slice(0, nFases(c.ligacao)).map(l => `<i class="dot ${l}"></i>`).join('')}</span>`; }
function renderLista() {
  const box = $('#lista-itens'); if (!box) return;
  if (!PROJ.circuitos.length) { box.innerHTML = '<p class="mini" style="padding:12px">Nenhum circuito. Escolha o tipo acima e clique em Adicionar.</p>'; return; }
  let ult = null;
  box.innerHTML = PROJ.circuitos.map(c => {
    const r = CALC.res[c.id]; let g = '';
    if (c.quadro !== ult) { ult = c.quadro; g = `<div class="grupo">${esc(c.quadro)}</div>`; }
    return `${g}<button type="button" class="item" data-sel="${c.id}" aria-current="${c.id === SEL}">
      <span class="n">${esc(c.num || '?')}</span><span class="d">${esc(c.desc || TIPOS[c.tipo])}</span><span class="pill ${r.status}">${pillTxt(r.status)}</span>
      <span class="e">${dotsFases(c)}${r.nPar > 1 ? r.nPar + '×' : ''}${fS(r.Sf)} mm²${c.material === 'Al' ? ' Al' : ''} · ${esc(protecaoCurta(c, r))}${r.drUsado ? ' · DR' : ''} · ${nfmt(r.IB, 1)} A</span></button>`;
  }).join('');
}
function renderEditor() {
  const box = $('#editor'); if (!box) return;
  const c = circSel();
  if (!c) { box.innerHTML = '<div class="res" style="padding:24px"><h2 class="tit">Sem circuitos</h2><p class="sub">Adicione o primeiro circuito pela lista ao lado. O cálculo e a memória são atualizados a cada alteração.</p></div>'; return; }
  box.innerHTML = `
    <div class="ed-topo">
      <span class="mini">Circuito ${PROJ.circuitos.indexOf(c) + 1} de ${PROJ.circuitos.length}</span>
      <span style="display:flex;flex-wrap:wrap;gap:6px">
        <button class="btn sm" type="button" id="bt-sobe" aria-label="Mover para cima">↑</button>
        <button class="btn sm" type="button" id="bt-desce" aria-label="Mover para baixo">↓</button>
        <button class="btn sm" type="button" id="bt-dup">Duplicar</button>
        <button class="btn sm" type="button" id="bt-exc">Excluir</button>
      </span>
    </div>
    <section class="res" id="ed-res" aria-live="polite"></section>
    <div id="ed-form" data-scope="circ"></div>`;
  renderResultado(); renderForm();
}
function renderForm() {
  const box = $('#ed-form'); const c = circSel(); if (!box || !c) return;
  const P = PROJ.params, r = CALC.res[c.id];
  const qs = Object.keys(PROJ.quadros).map(q => [q, q]);
  const ligOK = { monofasico: ['FN'], bifasico: ['FN', 'FF', 'FFN'], trifasico: Object.keys(LIG) }[P.fornecimento];
  const esqs = ESQUEMAS.filter(([l, pe]) => ligOK.includes(l) || (l === c.ligacao && !!pe === !!c.pe));
  if (!esqs.some(([l, pe]) => l === c.ligacao && !!pe === !!c.pe)) esqs.push([c.ligacao, !!c.pe]);
  const ligs = esqs.map(([l, pe]) => [esquemaVal(l, pe), `${esquemaTxt(l, pe)} — ${LIG_LONGO[l]}${pe ? ', com PE' : ''}`]);
  const usadas = { monofasico: 'A', bifasico: 'AB', trifasico: 'ABC' }[P.fornecimento];
  const nf = nFases(c.ligacao);
  const fasesOp = (nf === 1 ? usadas.split('') : nf === 2 ? (usadas.length === 3 ? ['AB', 'BC', 'CA'] : ['AB']) : ['ABC']).map(f => [f, f.split('').join('-')]);
  if (!fasesOp.find(f => f[0] === c.fases)) fasesOp.unshift([c.fases, c.fases]);
  const unids = c.tipo === 'motor' ? ['cv', 'HP', 'kW', 'W'] : ['W', 'kW', 'VA', 'kVA'];
  const met = r.met, ref = r.ref, refs = refsAgrup(ref);
  const metOpts = METODOS.filter(m => m.tipos.includes(c.tipoCabo) || m.id === c.metodo).map(m => [m.id, `${m.id} — ${refEfetivo(m, c.tipoCabo, c.vde)} — ${m.desc}`]);
  const D = DISP[c.dispositivo];
  const autoDem = c.tipo === 'dist' && c.demandaAuto && c.alimenta;
  const lumiC = (CALC.lumiCirc || {})[c.id];
  const trs = [...new Set(PROJ.circuitos.map(x => (x.trecho || '').trim()).filter(Boolean))];
  const secs = secoesDe(c.material === 'Al' ? 'Al' : 'Cu');
  const multiCam = ref === 'C' || ref === 'E' || ref === 'F';
  const agrupOpts = [...refs.map(x => [x, `Ref. ${x} — ${REF42[x]}`]), ['dif', 'Cabos de seções diferentes — F = 1/√n']];
  box.innerHTML = `
  <fieldset><legend>Identificação</legend><div class="grade">
    ${fTxt('c', 'num', 'Nº do circuito', c.num)}
    ${fTxt('c', 'desc', 'Descrição', c.desc, { cls: 'w2' })}
    ${fSel('c', 'quadro', 'Quadro de origem', c.quadro, qs, { struct: true })}
    ${fSel('c', 'tipo', 'Tipo de circuito', c.tipo, Object.entries(TIPOS), { struct: true })}
    ${fSel('c', 'local', 'Local dos pontos atendidos', c.local, Object.entries(LOCAIS), { cls: 'w2', struct: true })}
  </div></fieldset>
  <fieldset><legend>Carga</legend><div class="grade">
    ${fSel('c', 'esquema', 'Esquema de ligação', esquemaVal(c.ligacao, c.pe), ligs, { struct: true, cls: 'w2' })}
    ${fSel('c', 'fases', 'Fases', c.fases, fasesOp)}
    ${c.tipo === 'dist' ? fSel('c', 'alimenta', 'Alimenta o quadro', c.alimenta, [['', '— nenhum —'], ...qs.filter(q => q[0] !== c.quadro)], { struct: true }) : ''}
    ${c.tipo === 'dist' && c.alimenta ? fChk('c', 'demandaAuto', 'Usar a demanda do quadro alimentado', c.demandaAuto, { struct: true }) : ''}
    ${autoDem ? `${fInfo(`Demanda do ${esc(c.alimenta)}`, demCircTxt(c), 'c-dem-val')}<div data-scope="quadro" data-q="${esc(c.alimenta)}" style="display:contents">
      ${fNum('cq', 'fd', `Fator de demanda do ${esc(c.alimenta)}`, (PROJ.quadros[c.alimenta] || {}).fd, { u: '%', pct: true, ph: P.fdPadrao, dica: 'Vazio = padrão do projeto.' })}
      ${fNum('cq', 'demManual', 'Ou demanda informada', (PROJ.quadros[c.alimenta] || {}).demManual, { u: 'kVA', ph: 'calculada', dica: 'Substitui o cálculo pelo fator.' })}</div>` : (c.tipo === 'ilum' && c.potLumi && lumiC) ? `${fInfo('Potência (luminotécnica)', `${nfmt(lumiC.W, 0)} W`)}${fNum('c', 'fp', 'Fator de potência', c.fp)}` : `
    <div class="campo"><label for="c-pot">${c.tipo === 'motor' ? 'Potência no eixo' : 'Potência'}</label><div class="unid"><input type="text" inputmode="decimal" class="numin" id="c-pot" data-k="pot" data-type="num" value="${esc(showNum(c.pot))}" autocomplete="off"><select id="c-unid" data-k="unid" aria-label="Unidade">${opts(unids.map(u => [u, u]), c.unid)}</select></div></div>
    ${fNum('c', 'fp', 'Fator de potência', c.fp)}`}
    ${c.tipo === 'ilum' && lumiC ? fChk('c', 'potLumi', `Usar a potência da luminotécnica (${lumiC.amb.length} ambiente${lumiC.amb.length > 1 ? 's' : ''} — ${nfmt(lumiC.W, 0)} W)`, c.potLumi, { cls: 'w2', struct: true }) : ''}
    ${c.tipo === 'motor' ? fNum('c', 'rend', 'Rendimento η', c.rend) + fNum('c', 'fs', 'Fator de serviço', c.fs) + fNum('c', 'ipIn', 'Ip / In', c.ipIn, { dica: 'Relação entre corrente de partida e nominal.' }) : ''}
    ${fNum('c', 'L', 'Comprimento do circuito', c.L, { u: 'm' })}
  </div></fieldset>
  <fieldset><legend>Linha elétrica</legend>
    <div class="met-bloco">
      <figure class="met-fig">${pictograma(met.id)}<figcaption>Tabela 33 · nº <b>${esc(met.id)}</b> · método <b>${esc(ref)}</b></figcaption></figure>
      <div class="grade">
        ${fSel('c', 'material', 'Material', c.material, Object.entries(MATERIAL).map(([k, v]) => [k, v.charAt(0).toUpperCase() + v.slice(1)]), { struct: true })}
        ${fSel('c', 'tipoCabo', 'Tipo de condutor', c.tipoCabo, Object.entries(TIPO_CABO), { struct: true })}
        ${fSel('c', 'isolacao', 'Isolação', c.isolacao, Object.entries(ISOL), { struct: true })}
        ${fSel('c', 'metodo', 'Maneira de instalar (Tabela 33) — nº, método de referência', c.metodo, metOpts, { cls: 'wide', struct: true })}
        ${met.vde ? fSel('c', 'vde', 'Altura do espaço V em relação ao cabo', c.vde, met.vde === 5 ? [['baixo', '1,5·De ≤ V < 5·De → B2'], ['alto', '5·De ≤ V < 50·De → B1']] : [['baixo', '1,5·De ≤ V < 20·De → B2'], ['alto', 'V ≥ 20·De → B1']], { cls: 'w2', struct: true }) : ''}
      </div>
    </div>
    <div class="grade" style="margin-top:12px">
    ${ref === 'F' && r.nCarr === 3 ? fSel('c', 'arranjoF', 'Arranjo dos cabos', c.arranjoF, [['trifolio', 'Trifólio'], ['plano', 'Justapostos em plano']]) : ''}
    ${ref === 'G' ? fSel('c', 'arranjoG', 'Disposição', c.arranjoG, [['horizontal', 'Espaçados na horizontal'], ['vertical', 'Espaçados na vertical']]) : ''}
    ${fNum('c', 'temp', r.solo ? 'Temperatura do solo' : 'Temperatura ambiente', c.temp, { u: '°C', ph: r.solo ? P.tempSolo : P.tempAmb })}
    ${r.solo ? fNum('c', 'resistSolo', 'Resistividade térmica do solo', c.resistSolo, { u: 'K·m/W' }) + fNum('c', 'prof', 'Profundidade', c.prof, { u: 'm', dica: 'Acima de 0,7 m: −1 % a cada 10 cm.' }) : ''}
    ${fTxt('c', 'trecho', 'Trecho de eletroduto', c.trecho, { ph: 'ex.: E1', list: 'lst-trechos', dica: 'Circuitos com o mesmo trecho dividem o eletroduto e contam no agrupamento.' })}
    <datalist id="lst-trechos">${trs.map(t => `<option value="${esc(t)}">`).join('')}</datalist>
    ${fChk('c', 'agrupAuto', `Agrupamento automático (${r.nAgrup} circuito${r.nAgrup > 1 ? 's' : ''})`, c.agrupAuto, { struct: true })}
    ${c.agrupAuto ? '' : fNum('c', 'nAgrup', 'Nº de circuitos agrupados', c.nAgrup)}
    ${ref !== 'G' && ref !== 'D' ? fSel('c', 'refAgrup', 'Forma de agrupamento (Tabela 42)', c.refAgrup, agrupOpts, { type: 'agrup', cls: 'w2', struct: true }) : ''}
    ${ref === 'D' ? fSel('c', 'agrupD', 'Agrupamento enterrado', c.agrupD, [['mesmo', 'No mesmo duto (Tabela 42)'], ['eletrodutos', 'Dutos individuais (Tabela 45)'], ['direto', 'Diretamente enterrados (Tabela 44)']], { struct: true }) : ''}
    ${ref === 'D' && c.agrupD !== 'mesmo' ? fSel('c', 'espD', 'Espaçamento', c.espD, (c.agrupD === 'direto' ? ESP44 : ESP45).map((e, i) => [i, e]), { type: 'numsel' }) : ''}
    ${multiCam && c.refAgrup !== 'dif' ? fSel('c', 'camadas', 'Camadas (Tabela 43)', c.camadas, [[1, 'Camada única'], [2, '2 camadas'], [3, '3 camadas'], [4, '4 ou 5 camadas'], [6, '6 a 8 camadas'], [9, '9 ou mais camadas']], { type: 'numsel', struct: true }) : ''}
    ${multiCam && +c.camadas > 1 ? fSel('c', 'porCamada', 'Circuitos por camada', c.porCamada, [[2, '2'], [3, '3'], [4, '4 ou 5'], [6, '6 a 8'], [9, '9 ou mais']], { type: 'numsel' }) : ''}
    ${fNum('c', 'fctManual', 'FCT informado', c.fctManual, { ph: 'automático' })}
    ${fNum('c', 'fcaManual', 'FCA informado', c.fcaManual, { ph: 'automático' })}
  </div></fieldset>
  <fieldset><legend>Condutores</legend><div class="grade">
    ${c.ligacao === 'FFFN' ? fChk('c', 'harmonicas', 'Harmônicas de 3ª ordem acima de 15 %', c.harmonicas, { struct: true }) : ''}
    ${c.ligacao === 'FFFN' && !c.harmonicas ? fChk('c', 'neutroReduzido', 'Admitir neutro reduzido (Tabela 48)', c.neutroReduzido) : ''}
    ${fSel('c', 'nPar', 'Condutores por fase', c.nPar ?? '', [['', `Automático (${r.nPar})`], ...[1, 2, 3, 4, 5, 6, 8].map(n => [n, n === 1 ? '1 (sem paralelo)' : `${n} em paralelo`])], { type: 'numsel' })}
    ${fSel('c', 'secaoManual', 'Seção mínima imposta', c.secaoManual ?? '', [['', 'Automática'], ...secs.map(s => [s, fS(s) + ' mm²'])], { type: 'numsel' })}
    ${fNum('c', 'dvMax', 'Limite de queda no circuito', c.dvMax, { u: '%', ph: c.tipo === 'dist' ? P.dvDist : P.dvTerminal })}
  </div></fieldset>
  <fieldset><legend>Proteção</legend><div class="grade">
    ${fSel('c', 'dispositivo', 'Dispositivo', c.dispositivo, Object.entries(DISP).map(([k, d]) => [k, `${d.nome} (${d.norma})`]), { cls: 'w2', struct: true })}
    ${c.dispositivo === 'disj_60898' ? fSel('c', 'curva', 'Curva', c.curva, [['B', 'B (3 a 5 In)'], ['C', 'C (5 a 10 In)'], ['D', 'D (10 a 20 In)']]) : ''}
    ${fSel('c', 'inManual', 'Corrente nominal', c.inManual ?? '', [['', 'Automática'], ...D.lista.map(x => [x, x + ' A'])], { type: 'numsel' })}
    ${fNum('c', 'icnManual', 'Capacidade de interrupção', c.icnManual, { u: 'kA', ph: c.dispositivo === 'fus_gG' ? 50 : (c.dispositivo === 'disj_60947' ? P.icn947 : P.icn) })}
    ${fNum('c', 'i2tManual', 'I²t do fabricante', c.i2tManual, { u: 'A²s', ph: 'automático' })}
    ${fSel('c', 'dr', 'Dispositivo DR', c.dr, [['auto', r.drExigido ? 'Automático (exigido)' : 'Automático (não exigido)'], ['sim', 'Sim'], ['nao', 'Não']], { struct: true })}
    ${r.drUsado ? fSel('c', 'drTipo', 'Tipo de DR', c.drTipo, [['IDR', 'Interruptor DR'], ['DDR', 'Disjuntor DR']]) + fSel('c', 'idn', 'IΔn', c.idn, [[10, '10 mA'], [30, '30 mA'], [100, '100 mA'], [300, '300 mA'], [500, '500 mA']], { type: 'numsel' }) : ''}
    ${c.tipo === 'ilum' ? fChk('c', 'lumAlta', 'Luminárias a 2,50 m ou mais de altura', c.lumAlta, { struct: true, dica: 'Dispensa de DR prevista em 5.1.3.2.2.' }) : ''}
  </div></fieldset>
  <fieldset><legend>Observações</legend><div class="grade"><div class="campo wide"><label for="c-obs">Texto incluído na memória deste circuito</label><textarea id="c-obs" data-k="obs">${esc(c.obs)}</textarea></div></div></fieldset>`;
}
function renderResultado() {
  const box = $('#ed-res'); const c = circSel(); if (!box || !c) return;
  const r = CALC.res[c.id];
  const iGov = r.reqs.findIndex(q => q.S === r.Sf);
  const met = [
    [r.potAuto ? `Demanda (FD ${r.dem && r.dem.manual ? 'inf.' : nfmt(r.dem ? r.dem.fd * 100 : 100, 0) + ' %'})` : 'Potência', `${nfmt(r.S, 0)} VA`],
    ['IB', nfmt(r.IB) + ' A'], ['In', r.In + ' A'], ['Iz', nfmt(r.Iz) + ' A', r.Iz + 1e-9 < r.In],
    ['ΔV circuito', `${nfmt(r.dv)} %`, r.dv > r.limCirc + 1e-9], ['ΔV acumulada', `${nfmt(r.dvTotal)} %`, r.dvTotal > r.limTotal + 1e-9],
    ['Método', `${r.met.id} · ${r.ref}`], ['Fatores', nfmt(r.fTot, 3)], ['R · XL (Ω/km)', `${fR(r.z.R)} · ${nfmt(r.z.X, 3)}`]
  ];
  if (r.nPar > 1) met.push(['Paralelo', `${r.nPar} por fase`]);
  if (r.tn && r.tn.Lmax != null) met.push(['Lmax (TN)', nfmt(r.tn.Lmax, 1) + ' m', r.L > r.tn.Lmax]);
  box.innerHTML = `
    <div class="res-cab"><h3>Circuito ${esc(c.num)} — ${esc(c.desc || TIPOS[c.tipo])}</h3><span class="pill ${r.status}">${statusTxt(r.status)}</span></div>
    <div class="spec">
      <div class="linha"><span><small>Condutores</small><b>${condutoresTxt(r)}</b></span><span class="mini">${esc(cabosTxt(c))}</span></div>
      <div class="linha"><span><small>Proteção</small><b>${esc(protecaoTxt(c, r))}</b></span><span><small>DR</small><b>${esc(drTxt(r))}</b></span><span><small>${r.calha ? 'Eletrocalha' : 'Eletroduto'}</small><b>${esc(eletrodutoTxt(r))}</b></span></div>
    </div>
    <div class="metr num">${met.map(([a, b, bad]) => `<div><small>${a}</small><span class="${bad ? 'bad' : ''}">${b}</span></div>`).join('')}</div>
    <table class="crit"><thead><tr><th>Critério</th><th style="text-align:right">Seção requerida</th></tr></thead><tbody>
      ${r.reqs.map((q, i) => `<tr class="${i === iGov ? 'gov' : ''}"><td>${esc(q.crit)}${i === iGov ? ' — determinante' : ''}</td><td class="s">${q.S == null ? 'não atendido' : fS(q.S) + ' mm²'}</td></tr>`).join('')}
      ${r.SPE && r.SPE !== r.SPEtab ? `<tr><td>Condutor de proteção — verificação adiabática (6.4.3.1.2)</td><td class="s">PE ${fS(r.SPE)} mm²</td></tr>` : ''}
    </tbody></table>
    ${r.falhas.length || r.avisos.length ? `<ul class="msgs">${r.falhas.map(x => `<li class="fail">${esc(x)}</li>`).join('')}${r.avisos.map(x => `<li class="warn">${esc(x)}</li>`).join('')}</ul>` : ''}`;
}
function proxNum() { const ns = PROJ.circuitos.map(c => parseInt(c.num, 10)).filter(n => isFinite(n)); return String(ns.length ? Math.max(...ns) + 1 : 1); }
function addCircuito(tipo) {
  const base = circSel(); const c = defaultsCircuito(PROJ.params, tipo);
  c.num = proxNum(); c.quadro = base ? base.quadro : Object.keys(PROJ.quadros)[0];
  c.desc = { ilum: 'Iluminação', tug: 'Tomadas de uso geral', tue: 'Tomada de uso específico', motor: 'Motor', controle: 'Sinalização e controle', dist: 'Alimentador' }[tipo];
  if (PROJ.params.fornecimento !== 'trifasico' && nFases(c.ligacao) === 3) { c.ligacao = PROJ.params.fornecimento === 'bifasico' ? 'FFN' : 'FN'; c.fases = c.ligacao === 'FN' ? 'A' : 'AB'; }
  metodoCompativel(c);
  const i = base ? PROJ.circuitos.indexOf(base) + 1 : PROJ.circuitos.length;
  PROJ.circuitos.splice(i, 0, c); SEL = c.id; mudou(true);
  const d = $('#c-desc'); if (d) { d.focus(); d.select(); }
}

/* ---------- ELETRODUTOS ---------- */
function corteSVG(t, pre) {
  if (!t.aplica || !t.esc) return `<svg viewBox="0 0 100 100" role="img" aria-label="Sem eletroduto dimensionado"><circle cx="50" cy="50" r="44" fill="var(--sunk)" stroke="var(--line-strong)" stroke-width="2" stroke-dasharray="5 4"/><text x="50" y="54" text-anchor="middle" font-size="10" fill="var(--muted)" font-family="IBM Plex Sans, Arial">n/a</text></svg>`;
  const R = t.esc.di / 2, wall = Math.max(1.2, R * 0.12), raios = t.itens.map(k => (k.d || 1) / 2);
  const pos = empacotar(R, raios), V = R + wall + 1;
  const cor = q => q.func === 'N' ? 'var(--c-neutro)' : (q.func === 'PE' ? `url(#${pre}-pe)` : `var(--c-fase-${(q.fase || 'A').toLowerCase()})`);
  const circs = pos.map((p, i) => {
    const k = t.itens[i];
    if (k.multipolar) {
      const nv = k.vias, rr = p.r * 0.36, rc = nv === 1 ? 0 : p.r * 0.42;
      const nuc = k.cond.map((q, j) => { const a = -Math.PI / 2 + j * 2 * Math.PI / nv, x = p.x + rc * Math.cos(a), y = p.y + rc * Math.sin(a); return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${rr.toFixed(2)}" fill="${cor(q)}" stroke="var(--ink)" stroke-width="${(V / 160).toFixed(3)}"/><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${Math.min(rr * 0.6, Math.sqrt(q.S / Math.PI)).toFixed(2)}" fill="var(--copper)"/>`; }).join('');
      return `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${p.r.toFixed(2)}" fill="var(--c-capa)" stroke="var(--ink)" stroke-width="${(V / 120).toFixed(3)}"/>${nuc}`;
    }
    return `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${(p.r * 0.985).toFixed(2)}" fill="${cor(k)}" stroke="var(--ink)" stroke-width="${(V / 140).toFixed(3)}"/><circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${Math.min(Math.sqrt(k.S / Math.PI), p.r * 0.7).toFixed(2)}" fill="var(--copper)"/>`;
  }).join('');
  return `<svg viewBox="${-V} ${-V} ${2 * V} ${2 * V}" role="img" aria-label="Corte do eletroduto DN ${t.esc.dn} com ${t.n} condutores, ocupação ${nfmt(t.esc.ocup, 1)} %">
    <defs><pattern id="${pre}-pe" patternUnits="userSpaceOnUse" width="${(V / 9).toFixed(2)}" height="${(V / 9).toFixed(2)}" patternTransform="rotate(45)"><rect width="${(V / 9).toFixed(2)}" height="${(V / 9).toFixed(2)}" fill="var(--c-pe)"/><rect width="${(V / 18).toFixed(2)}" height="${(V / 9).toFixed(2)}" fill="var(--c-pe2)"/></pattern></defs>
    <circle r="${(R + wall / 2).toFixed(2)}" fill="var(--sunk)" stroke="var(--line-strong)" stroke-width="${wall.toFixed(2)}"/>${circs}</svg>`;
}
function empacotar(R, raios) {
  const idx = raios.map((r, i) => ({ r, i })).sort((a, b) => b.r - a.r), pl = [];
  const cabe = (x, y, r) => Math.hypot(x, y) <= R - r + 1e-6 && pl.every(p => Math.hypot(x - p.x, y - p.y) >= p.r + r - 1e-6);
  const inter = (x0, y0, r0, x1, y1, r1) => { const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy); if (!d || d > r0 + r1 + 1e-9 || d < Math.abs(r0 - r1) - 1e-9) return []; const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r0 * r0 - a * a)), xm = x0 + a * dx / d, ym = y0 + a * dy / d; return [[xm + h * dy / d, ym - h * dx / d], [xm - h * dy / d, ym + h * dx / d]]; };
  idx.forEach(({ r, i }) => {
    const cand = [[0, R - r]];
    pl.forEach(p => cand.push(...inter(0, 0, R - r, p.x, p.y, p.r + r)));
    for (let a = 0; a < pl.length; a++) for (let b = a + 1; b < pl.length; b++) cand.push(...inter(pl[a].x, pl[a].y, pl[a].r + r, pl[b].x, pl[b].y, pl[b].r + r));
    let best = null; cand.forEach(([x, y]) => { if (cabe(x, y, r) && (!best || y > best[1] + 1e-9 || (Math.abs(y - best[1]) < 1e-9 && Math.abs(x) < Math.abs(best[0])))) best = [x, y]; });
    if (!best) best = [0, 0];
    pl.push({ x: best[0], y: best[1], r, i });
  });
  return pl.sort((a, b) => a.i - b.i);
}
function pillTrecho(t, pre) { return `<span class="pill ${t.aplica ? t.status : 'warn'}" id="${pre}-pill">${t.aplica ? (t.esc ? `DN ${t.esc.dn} · ${t.esc.pol}` : 'Não cabe') : 'Não se aplica'}</span>`; }
function trechoRes(t) {
  const pre = 't-' + safeId(t.key);
  const lin = t.aplica ? `
      <div class="mini">Circuitos: <b>${t.circuitos.map(c => esc(c.num)).join(', ')}</b></div>
      <table class="tbl" style="margin:8px 0"><tbody>
        <tr><td>Condutores / cabos</td><td class="r">${t.n}</td></tr>
        <tr><td>Área total (ΣA)</td><td class="r">${nfmt(t.A, 1)} mm²</td></tr>
        <tr><td>Taxa máxima de ocupação</td><td class="r">${nfmt(t.taxa * 100, 0)} %</td></tr>
        <tr><td>Diâmetro interno mínimo</td><td class="r">${nfmt(t.diMin, 1)} mm</td></tr>
        ${t.esc ? `<tr><td>Adotado (Di ${nfmt(t.esc.di, 1)} mm)</td><td class="r"><b>${esc(t.esc.nome)} DN ${t.esc.dn} (${t.esc.pol})</b></td></tr><tr><td>Ocupação</td><td class="r">${nfmt(t.esc.ocup, 1)} %</td></tr>` : ''}
        ${t.cfg.comp > 0 ? `<tr><td>Limite sem caixa (${t.cfg.curvas} curva${t.cfg.curvas == 1 ? '' : 's'})</td><td class="r">${nfmt(t.Lim, 1)} m · trecho ${nfmt(t.cfg.comp, 1)} m</td></tr>` : ''}
      </tbody></table>` : `<p class="mini">${esc(t.motivo)}.</p>`;
  const msgs = t.falhas.map(x => `<li class="fail">${esc(x)}</li>`).concat(t.avisos.map(x => `<li class="warn">${esc(x)}</li>`)).join('');
  return `<div class="trecho-corpo"><div class="corte">${corteSVG(t, pre)}<div class="leg">${t.esc ? `Di ${nfmt(t.esc.di, 1)} mm` : ''}</div></div><div style="min-width:0">${lin}</div></div>${msgs ? `<ul class="msgs">${msgs}</ul>` : ''}`;
}
function renderEletrodutos() {
  const T = Object.values(CALC.trechos).filter(t => !CALC.calhas[t.key]);
  const nk = Object.keys(CALC.calhas).length;
  $('#tab-eletrodutos').innerHTML = `
  <h2 class="tit">Eletrodutos</h2>
  <p class="sub">Cada trecho reúne os circuitos com o mesmo código no campo "Trecho de eletroduto"; circuitos sem código têm eletroduto exclusivo. A ocupação segue 6.2.11.1.6 e o comprimento entre caixas, 6.2.11.1. Em eletroduto de aço, a queda de tensão dos circuitos recebe o fator para conduto ferromagnético. Cores: fase A preta, B vermelha, C branca, neutro azul-claro, PE verde-amarelo.${nk ? ` Os ${nk} trecho(s) em eletrocalha, perfilado, bandeja, leito ou canaleta estão na aba Eletrocalhas.` : ''}</p>
  ${T.length ? '' : '<p class="mini">Nenhum trecho em eletroduto.</p>'}
  <div class="trechos">${T.map(t => {
    const pre = 't-' + safeId(t.key);
    const lista = itensEletroduto(PROJ.catalogo, t.cfg.tipo);
    return `<article class="trecho"><div class="trecho-cab"><h3>${esc(t.nome)}</h3>${pillTrecho(t, pre)}</div>
      <div id="${pre}-res">${trechoRes(t)}</div>
      ${t.aplica ? `<div class="grade" data-scope="trecho" data-t="${esc(t.key)}">
        ${fSel(pre, 'tipo', 'Tipo de eletroduto', t.cfg.tipo, Object.entries(ELETRODUTOS).map(([k, e]) => [k, e.nome]), { struct: true, cls: 'w2' })}
        ${fSel(pre, 'min', 'Menor tamanho', t.cfg.min, POL_ORDEM.filter(p => lista.some(i => i.pol === p)).map(p => [p, p]))}
        ${fNum(pre, 'comp', 'Comprimento entre caixas', t.cfg.comp, { u: 'm' })}
        ${fNum(pre, 'curvas', 'Curvas de 90°', t.cfg.curvas)}
        ${fSel(pre, 'local', 'Área', t.cfg.local, [['interno', 'Interna (15 m)'], ['externo', 'Externa (30 m)']])}
        ${fChk(pre, 'semCaixa', 'Caixa de passagem inviável', t.cfg.semCaixa, { cls: 'w2', dica: 'Aumenta um tamanho a cada 6 m excedentes.' })}
      </div>` : ''}</article>`;
  }).join('')}</div>`;
}

/* ---------- QUADROS ---------- */
function correnteDem(S) { const P = PROJ.params; return P.fornecimento === 'trifasico' ? S / (Math.sqrt(3) * P.U) : (P.fornecimento === 'bifasico' ? S / (2 * P.U0) : S / P.U0); }
function demQuadroTxt(d) { return `${nfmt(d.S, 0)} VA · ${nfmt(correnteDem(d.S), 1)} A${d.manual ? ' (informada)' : ` (FD ${nfmt(d.fd * 100, 0)} %)`}`; }
function demCircTxt(c) { const r = CALC.res[c.id]; const d = r.dem; return d ? `${nfmt(d.S, 0)} VA${d.manual ? ' — informada' : ` — FD ${nfmt(d.fd * 100, 0)} % × ${nfmt(d.Sterm, 0)} VA${d.Sjus ? ` + ${nfmt(d.Sjus, 0)} VA a jusante` : ''}`}` : `${nfmt(r.S, 0)} VA`; }
function quadroRes(q) {
  const R = CALC.res, us = q.usadas, mx = Math.max(1, ...us.map(l => q.fases[l]));
  const linhas = q.cs.map(c => { const r = R[c.id], f = cargaFases(c, r); const k = r.nPar > 1 ? r.nPar + '×' : ''; return `<tr class="clic" data-ir="${c.id}"><td>${esc(c.num)}</td><td class="wrap">${esc(c.desc || TIPOS[c.tipo])}</td><td>${composicao(c)}</td><td class="r">${nfmt(r.P, 0)}</td><td class="r">${nfmt(r.fp, 2)}</td><td class="r">${nfmt(r.S, 0)}</td><td class="r">${nfmt(r.IB, 2)}</td><td class="r">${nfmt(r.FCT, 2)}</td><td class="r">${nfmt(r.FCA, 2)}</td><td>${k}${fS(r.Sf)} / ${r.hasN ? k + fS(r.SN) : '—'} / ${r.SPE ? k + fS(r.SPE) : '—'}${c.material === 'Al' ? ' Al' : ''}</td><td>${esc(protecaoCurta(c, r))}</td><td>${r.drUsado ? r.drIn + ' A' : '—'}</td><td class="r">${nfmt(r.dvTotal, 2)}</td>${us.map(l => `<td class="r">${f[l] ? nfmt(f[l], 0) : '—'}</td>`).join('')}<td><span class="pill ${r.status}">${pillTxt(r.status)}</span></td></tr>`; }).join('');
  const d = q.dem;
  return `${q.cs.length ? `<div class="tw"><table class="tbl"><thead><tr><th>Circ.</th><th>Descrição</th><th>Ligação</th><th class="r">P (W)</th><th class="r">FP</th><th class="r">S (VA)</th><th class="r">IB (A)</th><th class="r">FCT</th><th class="r">FCA</th><th>F / N / PE (mm²)</th><th>Proteção</th><th>DR</th><th class="r">ΔV acum. %</th>${us.map(l => `<th class="r">Fase ${l}</th>`).join('')}<th>Situação</th></tr></thead>
    <tbody>${linhas}<tr class="tot"><td colspan="3">Total</td><td class="r">${nfmt(q.cs.reduce((s, c) => s + R[c.id].P, 0), 0)}</td><td></td><td class="r">${nfmt(q.cs.reduce((s, c) => s + R[c.id].S, 0), 0)}</td><td colspan="7"></td>${us.map(l => `<td class="r">${nfmt(q.fases[l], 0)}</td>`).join('')}<td></td></tr></tbody></table></div>` : '<p class="mini" style="padding:12px 14px">Nenhum circuito neste quadro.</p>'}
    <div class="demanda num"><span>Carga instalada <b>${nfmt(d.Sterm, 0)} VA</b></span>${d.Sjus ? `<span>Quadros a jusante <b>${nfmt(d.Sjus, 0)} VA</b></span>` : ''}<span>Demanda ${d.manual ? '(informada)' : `(FD ${nfmt(d.fd * 100, 0)} %)`} <b>${nfmt(d.S, 0)} VA</b></span><span>Corrente de demanda <b>${nfmt(correnteDem(d.S), 1)} A</b></span>${q.alim ? `<span>Alimentado por <b>${esc(q.alim.num)}</b> (${condutoresTxt(CALC.res[q.alim.id])})</span>` : ''}</div>
    ${us.length > 1 ? `<div class="balanco">${us.map(l => `<div class="bar"><span>Fase ${l}</span><span class="trilho"><span class="enc" style="display:block;width:${(q.fases[l] / mx * 100).toFixed(1)}%"></span></span><span class="v">${nfmt(q.fases[l], 0)} VA</span></div>`).join('')}<div class="mini">Desequilíbrio entre fases: <b>${nfmt(q.deseq, 1)} %</b> — (Smáx − Smín) / Smáx</div></div>` : ''}`;
}
function diagramaHTML(q) {
  const m = QDIAG[q.q] || 'uni', d = dadosQuadro(PROJ, CALC, q.q);
  return `<div class="ref-sel" role="group" aria-label="Diagrama do quadro ${esc(q.q)}" style="margin:12px 0 8px">${[['uni', 'Diagrama unifilar'], ['multi', 'Diagrama multifilar'], ['off', 'Ocultar diagrama']].map(([k, l]) => `<button class="btn sm" type="button" data-qdiag="${esc(q.q)}" data-modo="${k}" aria-pressed="${k === m}">${l}</button>`).join('')}</div>
    ${m === 'off' ? '' : `<div class="diag-folha">${partesDiagrama(d, m).join('')}</div>`}`;
}
function renderQuadros() {
  const Q = CALC.quadros, P = PROJ.params;
  $('#tab-quadros').innerHTML = `
  <div class="mem-bar"><div><h2 class="tit">Quadros de carga</h2>
  <p class="sub" style="margin:0">Resumo por quadro, demanda e equilíbrio de fases. O fator de demanda padrão é 100 %; ajuste-o por quadro ou informe a demanda em kVA — o alimentador é recalculado em seguida. Clique numa linha para editar o circuito.</p></div>
  <div class="mem-bt"><button class="btn pri" type="button" data-exp="xlsx">Quadro de cargas (Excel)</button><span class="mini" style="align-self:center;margin-left:6px">Diagramas:</span><button class="btn" type="button" data-exp="pdf" data-doc="diagramas">PDF</button><button class="btn" type="button" data-exp="docx" data-doc="diagramas">Word</button><button class="btn" type="button" data-exp="html" data-doc="diagramas">HTML</button></div></div>
  <div class="banner" style="border-style:solid"><span>Novo quadro:</span><span style="display:flex;gap:8px;flex:1 1 260px"><input type="text" id="novo-quadro" placeholder="ex.: QD-2" aria-label="Nome do novo quadro" style="max-width:220px"><button class="btn" type="button" id="bt-add-q">Criar quadro</button></span></div>
  ${Object.values(Q).map(q => {
    const pre = 'q-' + safeId(q.q), Qd = PROJ.quadros[q.q] || {};
    return `<article class="quadro"><div class="quadro-cab">
      <div><h3>${esc(q.q)}</h3><span class="mini">${q.cs.length} circuito${q.cs.length === 1 ? '' : 's'}${q.alim ? ` · alimentado por ${esc(q.alim.num)}` : ''}</span></div>
      <div class="grade g3" data-scope="quadro" data-q="${esc(q.q)}" style="flex:1 1 560px">
        ${fTxt(pre, 'desc', 'Descrição', Qd.desc)}
        ${fNum(pre, 'fd', 'Fator de demanda', Qd.fd, { u: '%', pct: true, ph: P.fdPadrao })}
        ${fNum(pre, 'demManual', 'Demanda informada', Qd.demManual, { u: 'kVA', ph: 'calculada' })}
        ${fNum(pre, 'icc', 'Icc presumida', Qd.icc, { u: 'kA' })}
        ${fNum(pre, 'dgIn', 'Disjuntor geral', Qd.dgIn, { u: 'A', ph: q.alim ? CALC.res[q.alim.id].In : 'definir', dica: q.alim ? `Vazio = ${CALC.res[q.alim.id].In} A (proteção do alimentador).` : 'Usado nos diagramas.' })}
        ${fChk(pre, 'dps', 'DPS classe II no quadro', Qd.dps !== false, { struct: true })}
        ${q.alim ? `<div class="campo"><span class="lbl">ΔV a montante</span><b class="num" style="padding-top:6px">${nfmt(CALC.res[q.alim.id].dvTotal, 2)} % (de ${esc(q.alim.num)})</b></div>` : fNum(pre, 'dvMont', 'ΔV a montante', Qd.dvMont, { u: '%' }) + (P.origem !== 'entrega' && P.supLongo ? fNum(pre, 'Lmont', 'Linha a montante', Qd.Lmont, { u: 'm' }) : '')}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${q.usadas.length > 1 && q.cs.length ? `<button class="btn sm" type="button" data-bal="${esc(q.q)}">Equilibrar fases</button>` : ''}${!q.cs.length ? `<button class="btn sm" type="button" data-delq="${esc(q.q)}">Remover quadro</button>` : ''}</div>
    </div><div id="${pre}-res">${quadroRes(q)}</div>${q.cs.length ? `<div class="diag" id="${pre}-diag">${diagramaHTML(q)}</div>` : ''}</article>`;
  }).join('')}`;
}

/* ---------- ELETROCALHAS ---------- */
function pillCalha(t, pre) { return `<span class="pill ${t.status === 'fail' ? 'fail' : 'ok'}" id="${pre}-pill">${t.esc ? (t.cfg.tipo === 'canaleta' ? `${t.esc.W} × ${t.esc.H} mm` : `${t.esc.W} × ${t.esc.H} mm`) : 'Não cabe'}${t.status === 'fail' && t.esc ? ' · pend.' : ''}</span>`; }
function calhaRes(t) {
  const pre = 'k-' + safeId(t.key), cfg = t.cfg, T = t.T;
  const mets = [...new Set(t.circuitos.map(c => c.metodo))];
  const lin = `
    <div class="mini">Circuitos: <b>${t.circuitos.map(c => esc(c.num)).join(', ')}</b> · Tabela 33 nº ${mets.map(esc).join(', ')}</div>
    <table class="tbl" style="margin:8px 0"><tbody>
      <tr><td>Cabos / condutores</td><td class="r">${t.n}</td></tr>
      <tr><td>Área total dos cabos (ΣA)</td><td class="r">${nfmt(t.A, 0)} mm²</td></tr>
      <tr><td>Soma dos diâmetros (Σd)</td><td class="r">${nfmt(t.somaD, 0)} mm</td></tr>
      <tr><td>Taxa máxima · reserva</td><td class="r">${nfmt(cfg.taxa, 0)} % · ${nfmt(cfg.reserva, 0)} %</td></tr>
      ${t.Wmin != null ? `<tr><td>Largura mínima (altura útil ${t.H} mm)</td><td class="r">${nfmt(t.Wmin, 0)} mm</td></tr>` : ''}
      ${t.esc ? `<tr><td>Adotada</td><td class="r"><b>${t.esc.W} × ${t.esc.H} mm</b></td></tr><tr><td>Ocupação (com reserva)</td><td class="r${t.ocupRes > cfg.taxa + 1e-6 ? ' bad' : ''}">${nfmt(t.ocup, 1)} % (${nfmt(t.ocupRes, 1)} %)</td></tr>` : ''}
      ${T.aberta ? `<tr><td>Disposição dos cabos</td><td class="r">${t.camadaUnica ? `camada única (Σd ${nfmt(t.somaD * (1 + cfg.reserva / 100), 0)} mm com reserva)` : 'mais de uma camada'}</td></tr>` : ''}
      <tr><td>Peso dos cabos (estimado)</td><td class="r${cfg.carga && t.peso > cfg.carga ? ' bad' : ''}">${nfmt(t.peso, 2)} kg/m${cfg.carga ? ` · admissível ${nfmt(cfg.carga, 1)} kg/m` : ''}</td></tr>
      ${t.nSup ? `<tr><td>Suportes (vão de ${nfmt(cfg.vao, 2)} m)</td><td class="r">${t.nSup} em ${nfmt(+cfg.comp, 1)} m</td></tr>` : ''}
    </tbody></table>`;
  const msgs = t.falhas.map(x => `<li class="fail">${esc(x)}</li>`).concat(t.avisos.map(x => `<li class="warn">${esc(x)}</li>`)).join('');
  return `<div class="trecho-corpo calha"><div class="corte larga">${corteCalhaSVG(t, PAL_UI, pre) || '<p class="mini">Sem dimensão adotada.</p>'}<div class="leg">${t.esc ? `${esc(T.nome)}` : ''}</div></div><div style="min-width:0">${lin}</div></div>${msgs ? `<ul class="msgs">${msgs}</ul>` : ''}`;
}
function renderEletrocalhas() {
  const K = Object.values(CALC.calhas);
  $('#tab-eletrocalhas').innerHTML = `
  <h2 class="tit">Eletrocalhas, perfilados, bandejas e leitos</h2>
  <p class="sub">Formados automaticamente pelos circuitos cuja maneira de instalar (Tabela 33) usa eletrocalha, canaleta, bandeja, prateleira, tela ou leito (nº 5, 6, 12 a 16, 24 a 27, 31 a 36, 43, 71 a 75). Circuitos com o mesmo código no campo "Trecho" dividem o mesmo conduto. A NBR 5410 não fixa taxa de ocupação para condutos não circulares: adota-se 40 % da seção útil (critério de 6.2.11.1.6, editável), com reserva para ampliação. Em suportes abertos dimensionados em camada única (Tabela 42, ref. 2 a 5), a soma dos diâmetros não pode exceder a largura.</p>
  ${K.length ? '' : `<div class="banner" style="border-style:solid"><span>Nenhum circuito usa eletrocalha, bandeja ou leito. Escolha uma dessas maneiras de instalar no circuito (por exemplo, nº 31 — eletrocalha, ou nº 13 — bandeja perfurada).</span></div>`}
  <div class="trechos">${K.map(t => {
    const pre = 'k-' + safeId(t.key), cfg = t.cfg, T = t.T;
    return `<article class="trecho"><div class="trecho-cab"><h3>${esc(t.nome)}</h3>${pillCalha(t, pre)}</div>
      <div id="${pre}-res">${calhaRes(t)}</div>
      <div class="grade" data-scope="trecho" data-t="${esc(t.key)}">
        ${fSel(pre, 'tipoCalha', 'Tipo de conduto / suporte', cfg.tipo, Object.entries(TIPOS_CALHA).map(([k, x]) => [k, x.nome]), { struct: true, cls: 'w2' })}
        ${cfg.tipo === 'canaleta' ? fNum(pre, 'largCanaleta', 'Largura interna', cfg.larg, { u: 'mm' }) + fNum(pre, 'altCanaleta', 'Altura interna', cfg.alt, { u: 'mm' })
          : fSel(pre, 'altura', 'Altura útil (aba)', t.H, T.alturas.map(h => [h, h + ' mm']), { type: 'numsel' }) + fSel(pre, 'largura', 'Largura', cfg.largura ?? '', [['', 'Automática'], ...T.larguras.map(w => [w, w + ' mm'])], { type: 'numsel' })}
        ${fNum(pre, 'taxa', 'Taxa máxima de ocupação', cfg.taxa, { u: '%' })}
        ${fNum(pre, 'reserva', 'Reserva para ampliação', cfg.reserva, { u: '%' })}
        ${fNum(pre, 'comp', 'Comprimento do trecho', cfg.comp, { u: 'm' })}
        ${cfg.tipo !== 'canaleta' ? fNum(pre, 'vao', 'Vão entre suportes', cfg.vao, { u: 'm' }) + fNum(pre, 'carga', 'Carga admissível do fabricante', cfg.carga, { u: 'kg/m', ph: 'informar' }) : ''}
        ${T.aberta ? fSel(pre, 'camada', 'Cabos em camada única', cfg.camada, [['auto', 'Automático (pelo agrupamento)'], ['sim', 'Sim'], ['nao', 'Não']], { cls: 'w2' }) : ''}
        ${fChk(pre, 'septo', 'Divide o espaço com circuitos de sinal ou extrabaixa tensão', cfg.septo, { cls: 'w2' })}
      </div></article>`;
  }).join('')}</div>`;
}

/* ---------- LUMINOTÉCNICA ---------- */
function renderLumi() {
  if (LMODO === 'ext') return renderLumiExt();
  const A = PROJ.lumi || [];
  if (!ambSel()) LSEL = A[0]?.id || null;
  const tot = A.reduce((s, a) => s + (CALC.lumi[a.id]?.P || 0), 0);
  $('#tab-lumi').innerHTML = `
  <div class="mem-bar"><h2 class="tit" style="margin:0">Luminotécnica</h2>${lumiExpHTML()}</div>
  ${lumiModoHTML()}
  <p class="sub">Iluminação de interiores segundo a ABNT NBR ISO/CIE 8995-1:2013: iluminância mantida (Em), uniformidade (Uo ≥ 0,7 na área da tarefa), limite de ofuscamento (UGRL) e reprodução de cor (Ra). Quantidade pelo método dos lúmens, fator de utilização calculado por radiosidade (ou informado pela tabela do fabricante), fator de manutenção conforme a CIE 97 e verificação ponto a ponto da uniformidade. ${A.length ? `${A.length} ambiente${A.length > 1 ? 's' : ''} · ${nfmt(tot, 0)} W de iluminação.` : ''}</p>
  <div class="bancada">
    <aside class="lista" aria-label="Ambientes">
      <div class="lista-topo"><button class="btn pri" type="button" id="bt-add-amb" style="flex:1">Adicionar ambiente</button></div>
      <div class="lista-itens" id="lumi-itens"></div>
    </aside>
    <div class="editor" id="lumi-ed"></div>
  </div>`;
  renderLumiLista(); renderLumiEditor();
}
function renderLumiLista() {
  const box = $('#lumi-itens'); if (!box) return; const A = PROJ.lumi || [];
  if (!A.length) { box.innerHTML = '<p class="mini" style="padding:12px">Nenhum ambiente. Clique em Adicionar ambiente.</p>'; return; }
  box.innerHTML = A.map((a, i) => { const r = CALC.lumi[a.id]; return `<button type="button" class="item" data-lsel="${a.id}" aria-current="${a.id === LSEL}"><span class="n">${i + 1}</span><span class="d">${esc(a.nome || 'Ambiente')}</span><span class="pill ${r.status}">${pillTxt(r.status)}</span><span class="e">${r.N} × ${nfmt(r.Wlum, 0)} W · ${nfmt(r.Emed, 0)}/${r.Em} lx · Uo ${nfmt(r.Uo, 2)}</span></button>`; }).join('');
}
function renderLumiEditor() {
  const box = $('#lumi-ed'); if (!box) return; const a = ambSel();
  if (!a) { box.innerHTML = '<div class="res" style="padding:24px"><h2 class="tit">Sem ambientes</h2><p class="sub">Adicione um ambiente para calcular a quantidade de luminárias, a iluminância média, a uniformidade e a potência de iluminação. O resultado pode alimentar a potência de um circuito de iluminação.</p></div>'; return; }
  box.innerHTML = `<div class="ed-topo"><span class="mini">Ambiente ${PROJ.lumi.indexOf(a) + 1} de ${PROJ.lumi.length}</span><span style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn sm" type="button" id="bt-dup-amb">Duplicar</button><button class="btn sm" type="button" id="bt-exc-amb">Excluir</button></span></div>
    <section class="res" id="lumi-res" aria-live="polite"></section><div id="lumi-form" data-scope="amb"></div>`;
  renderLumiRes(); renderLumiForm();
}
function lumiVerif(r) {
  const it = [];
  it.push([r.okEm ? 'ok' : 'fail', `Iluminância média Eméd = <b>${nfmt(r.Emed, 0)} lx</b> ≥ Em = ${r.Em} lx`]);
  it.push([r.tarefa ? (r.okUo ? 'ok' : 'fail') : 'info', `Uniformidade Uo = Emín / Eméd = <b>${nfmt(r.Uo, 2)}</b>${r.tarefa ? ' ≥ 0,70 (área da tarefa)' : ' — sem exigência de tarefa; recomendável ≥ 0,40'}`]);
  it.push([r.okRa ? 'ok' : 'fail', `Reprodução de cor do produto Ra ${r.prod.Ra || '—'} ≥ Ra mín ${r.Ra}`]);
  if (r.UGR != null) it.push([r.prod.ugr != null ? (r.prod.ugr <= r.UGR ? 'ok' : 'fail') : 'info', r.prod.ugr != null ? `UGR da luminária ${r.prod.ugr} ≤ UGRL ${r.UGR}` : `UGRL = ${r.UGR}: confirmar o UGR na tabela do fabricante (método tabular CIE 117)`]);
  it.push([r.FM >= 0.7 - 1e-9 ? 'ok' : 'fail', `Fator de manutenção FM = <b>${nfmt(r.FM, 2)}</b> ≥ 0,70 (NBR ISO/CIE 8995-1, anexo D)`]);
  if (r.VAmin != null) it.push(['info', `NBR 5410, 9.5.2.1.2 (alternativa para habitação): ${nfmt(r.A, 2)} m² → mínimo de ${r.VAmin} VA; previsto ${nfmt(r.VA, 0)} VA pela luminotécnica`]);
  return `<ul class="verif">${it.map(([c, t]) => `<li class="${c}"><span>${t}</span></li>`).join('')}</ul>`;
}
function renderLumiRes() {
  const box = $('#lumi-res'); const a = ambSel(); if (!box || !a) return; const r = CALC.lumi[a.id];
  const p = r.prod, c = a.circuito ? PROJ.circuitos.find(x => x.id === a.circuito) : null;
  const met = [['K (índice do local)', nfmt(r.K, 2)], ['UF (utilização)', nfmt(r.UF, 3)], ['FM (manutenção)', nfmt(r.FM, 2)], ['N calculado', nfmt(r.Nreq, 2)], ['N adotado', `${r.N} (${r.nx} × ${r.ny})`],
    ['Eméd (lúmens)', `${nfmt(r.Emed, 0)} lx`, !r.okEm], ['Emín · Emáx', `${nfmt(r.Emin, 0)} · ${nfmt(r.Emax, 0)} lx`], ['Uo', nfmt(r.Uo, 2), !r.okUo], ['Potência', `${nfmt(r.P, 0)} W`], ['Densidade', `${nfmt(r.dens, 1)} W/m²`], ['W/m² por 100 lx', nfmt(r.dens100, 2)], ['Espaçamento', `${nfmt(r.Sx, 2)} × ${nfmt(r.Sy, 2)} m`]];
  box.innerHTML = `<div class="res-cab"><h3>${esc(a.nome || 'Ambiente')} — ${esc(r.req.n)}</h3><span class="pill ${r.status}">${statusTxt(r.status)}</span></div>
    <div class="spec"><div class="linha"><span><small>Solução</small><b>${r.N} × ${esc(p.fab !== '—' ? p.fab + ' ' : '')}${esc(p.mod)}${p.tipo === 'lampada' ? ` — ${r.nLamp} lâmpada${r.nLamp > 1 ? 's' : ''} por luminária (${esc(r.corpo.nome.toLowerCase())})` : ''}</b></span></div>
    <div class="linha"><span><small>Fluxo por luminária</small><b>${nfmt(r.phi, 0)} lm${r.lor < 1 ? ` × LOR ${nfmt(r.lor, 2)}` : ''}</b></span><span><small>Requisito</small><b>Em ${r.Em} lx · UGRL ${r.UGR ?? '—'} · Ra ${r.Ra}</b></span><span><small>Circuito</small><b>${c ? `${esc(c.num)}${c.potLumi ? ' (usa esta potência)' : ''}` : '—'}</b></span></div></div>
    <div class="metr num">${met.map(([x, y, bad]) => `<div><small>${x}</small><span class="${bad ? 'bad' : ''}">${y}</span></div>`).join('')}</div>
    ${lumiVerif(r)}
    <div class="ref-sel" style="margin:0;padding:10px 14px 0;border-top:1px solid var(--line)">${[['mapa', 'Mapa de iluminância'], ['valores', 'Valores (lx)'], ['locacao', 'Locação e cotas'], ['luminaria', 'Desenho da luminária']].map(([k, l]) => `<button class="btn sm" type="button" data-planta="${k}" aria-pressed="${k === LPLANTA}">${l}</button>`).join('')}</div>
    <div class="planta" style="border-top:0"><div>${LPLANTA === 'locacao' ? locacaoSVG(r, refsLuminarias(PROJ, CALC).porAmb[a.id], false) : (LPLANTA === 'luminaria' ? desenhoLuminaria(r, PAL_UI) : plantaSVG(r, false, { valores: LPLANTA === 'valores' }))}</div><div class="leg">${LPLANTA === 'locacao' ? `<b>Locação</b><span class="mini">${r.N} luminárias em ${r.nx} × ${r.ny}; espaçamento ${nfmt(r.Sx, 2)} × ${nfmt(r.Sy, 2)} m; afastamento das paredes ${nfmt(r.Sx / 2, 2)} × ${nfmt(r.Sy / 2, 2)} m. Cotas em metros.</span>` : LPLANTA === 'luminaria' ? `<b>${esc(nomeLum(r))}</b><span class="mini">${nfmt(r.Wlum, 1)} W · ${nfmt(r.phi, 0)} lm${dimLum(r) ? ' · ' + dimLum(r) : ''}. Desenho esquemático, sem escala.</span>` : `<b>Mapa de iluminância</b><span class="escala"></span><span class="mini" style="display:flex;justify-content:space-between"><span>0,5 × Em</span><span>Em</span><span>1,5 × Em</span></span>`}<span class="mini">Plano de trabalho a ${nfmt(+a.hwp, 2)} m, borda de ${nfmt(Math.min(0.5, r.L / 4), 2)} m excluída; malha de ${r.gx} × ${r.gy} pontos.</span><span class="mini">Altura útil hm = ${nfmt(r.hm, 2)} m · espaçamento máximo recomendado ${nfmt(r.Smax, 2)} m.</span>
    ${c && !c.potLumi ? `<button class="btn sm" type="button" data-potlumi="${c.id}">Usar a potência no circuito ${esc(c.num)}</button>` : ''}</div></div>
    ${r.falhas.length || r.avisos.length ? `<ul class="msgs">${r.falhas.map(x => `<li class="fail">${esc(x)}</li>`).join('')}${r.avisos.map(x => `<li class="warn">${esc(x)}</li>`).join('')}</ul>` : ''}`;
  const ph = { uf: nfmt(r.Ucalc, 3), nx: r.nx, ny: r.ny }; Object.entries(ph).forEach(([k, v]) => { const el = $('#a-' + k); if (el && document.activeElement !== el) el.placeholder = v; });
}
function renderLumiForm() {
  const box = $('#lumi-form'); const a = ambSel(); if (!box || !a) return; const r = CALC.lumi[a.id], p = r.prod;
  const grupos = []; AMB_8995.forEach(x => { let g = grupos.find(y => y[0] === x.g); if (!g) grupos.push(g = [x.g, []]); g[1].push([x.id, `${x.n} — ${x.Em} lx`]); });
  const circs = PROJ.circuitos.filter(c => c.tipo === 'ilum').map(c => [c.id, `${c.num} — ${c.desc || 'Iluminação'}`]);
  const pr = v => `${nfmt(v * 100, 0)} %`;
  const prods = [['Luminárias completas', CAT_LUM.filter(x => x.tipo === 'luminaria').map(x => [x.id, `${x.fab} — ${x.mod} (${nfmt(x.lm, 0)} lm)`])], ['Lâmpadas (em luminária a escolher)', CAT_LUM.filter(x => x.tipo === 'lampada').map(x => [x.id, `${x.fab} — ${x.mod} (${nfmt(x.lm, 0)} lm)`])], ['Outro', [['custom', 'Informar os dados da luminária']]]];
  const corpos = Object.entries(CORPOS).filter(([k]) => p.tubo ? ['calha', 'aletada', 'leitosa', 'hermetica'].includes(k) : !['calha', 'aletada', 'leitosa', 'hermetica'].includes(k)).map(([k, x]) => [k, `${x.nome} — rendimento ${nfmt(x.lor, 2)}`]);
  box.innerHTML = `
  <fieldset><legend>Ambiente e requisito</legend><div class="grade">
    ${fTxt('a', 'nome', 'Nome do ambiente', a.nome, { cls: 'w2' })}
    ${fSelG('a', 'amb', 'Tipo de ambiente, tarefa ou atividade (NBR ISO/CIE 8995-1)', a.amb, grupos, { cls: 'wide', struct: true })}
    ${fNum('a', 'Em', 'Iluminância mantida adotada', a.Em, { u: 'lx', ph: r.req.Em, dica: 'Vazio = valor da norma.' })}
    ${fSel('a', 'circuito', 'Circuito de iluminação', a.circuito, [['', '— nenhum —'], ...circs], { cls: 'w2', struct: true })}
  </div></fieldset>
  <fieldset><legend>Geometria</legend><div class="grade">
    ${fNum('a', 'L', 'Comprimento', a.L, { u: 'm' })}${fNum('a', 'W', 'Largura', a.W, { u: 'm' })}${fNum('a', 'pd', 'Pé-direito', a.pd, { u: 'm' })}
    ${fNum('a', 'hwp', 'Altura do plano de trabalho', a.hwp, { u: 'm', dica: '0,75 m mesas; 0 piso/circulação.' })}${fNum('a', 'susp', 'Suspensão das luminárias', a.susp, { u: 'm' })}
  </div></fieldset>
  <fieldset><legend>Refletâncias</legend><div class="grade">
    ${fSel('a', 'rc', 'Teto', a.rc, REFL_TETO.map(v => [v, pr(v)]), { type: 'numsel' })}${fSel('a', 'rw', 'Paredes', a.rw, REFL_PAREDE.map(v => [v, pr(v)]), { type: 'numsel' })}${fSel('a', 'rf', 'Piso', a.rf, REFL_PISO.map(v => [v, pr(v)]), { type: 'numsel' })}
  </div></fieldset>
  <fieldset><legend>Luminária</legend><div class="grade">
    ${fSelG('a', 'prod', 'Produto (catálogo de fabricantes)', a.prod, prods, { cls: 'wide', struct: true })}
    ${p.tipo === 'lampada' ? fSel('a', 'corpo', 'Luminária para a lâmpada', a.corpo, corpos, { cls: 'w2', struct: true }) + fNum('a', 'nLamp', 'Lâmpadas por luminária', a.nLamp) : ''}
    ${a.prod === 'custom' ? fNum('a', 'cW', 'Potência', a.cW, { u: 'W' }) + fNum('a', 'clm', 'Fluxo luminoso', a.clm, { u: 'lm' }) + fNum('a', 'cRa', 'Ra', a.cRa) + fNum('a', 'cFacho', 'Abertura do facho', a.cFacho, { u: '°' }) + fNum('a', 'cUp', 'Fluxo para cima', a.cUp, { u: '%' }) : ''}
    <div class="campo wide"><span class="lbl">Dados do produto</span><span class="mini" style="padding-top:4px">${nfmt(p.W, 1)} W · ${nfmt(p.lm, 0)} lm · ${nfmt(p.lm / (p.W || 1), 0)} lm/W · Ra ${p.Ra || '—'}${p.vida ? ` · vida ${nfmt(p.vida, 0)} h` : ''}${p.ugr != null ? ` · UGR ${p.ugr}` : ''}${p.fonte ? ` · fonte: ${esc(p.fonte)}` : ''}. Confirme os dados na ficha técnica do fabricante.</span></div>
  </div></fieldset>
  <fieldset><legend>Fatores e arranjo</legend><div class="grade">
    ${fSel('a', 'fm', 'Fator de manutenção', a.fm, FM_PRESETS, { cls: 'w2', struct: true })}
    ${a.fm === 'calc' ? fNum('a', 'llmf', 'LLMF (fluxo da lâmpada)', a.llmf) + fNum('a', 'lsf', 'LSF (sobrevivência)', a.lsf) + fNum('a', 'lmf', 'LMF (luminária)', a.lmf) + fNum('a', 'rsmf', 'RSMF (superfícies)', a.rsmf) : ''}
    ${fNum('a', 'uf', 'Fator de utilização', a.uf, { ph: nfmt(r.Ucalc, 3), dica: 'Vazio = calculado; ou informe o da tabela do fabricante.' })}
    ${fNum('a', 'nx', 'Luminárias no comprimento', a.nx, { ph: r.nx })}${fNum('a', 'ny', 'Luminárias na largura', a.ny, { ph: r.ny })}
  </div></fieldset>
  <fieldset><legend>Observações</legend><div class="grade"><div class="campo wide"><label for="a-obs">Texto incluído na memória deste ambiente</label><textarea id="a-obs" data-k="obs">${esc(a.obs)}</textarea></div></div></fieldset>`;
}

/* ---------- MEMÓRIA ---------- */
function renderMemoria() {
  const disp = MEMORIAS.filter(m => m.tem(PROJ, CALC)), grupo = PROJ.memorias.grupo.filter(id => disp.some(m => m.id === id));
  if (MEMSEL !== 'consolidado' && MEMSEL !== 'descritivo' && !disp.some(m => m.id === MEMSEL)) MEMSEL = 'descritivo';
  const blocos = docAtual(MEMSEL).blocos, sel = MEMO[MEMSEL];
  const linha = m => { const ok = disp.includes(m), fl = ok && m.falha(PROJ, CALC);
    return `<div class="mem-item${MEMSEL === m.id ? ' on' : ''}${ok ? '' : ' vazio'}" data-scope="memgrupo">
      <label class="chk" title="Anexar ao memorial descritivo e incluir no relatório consolidado"><input type="checkbox" data-k="${m.id}" data-type="chk"${grupo.includes(m.id) ? ' checked' : ''}${ok ? '' : ' disabled'} aria-label="Anexar ${esc(m.nome)}"></label>
      <button type="button" class="mem-nome" data-memsel="${m.id}"${ok ? '' : ' disabled'}><b>${esc(m.nome)}</b><span>${esc(normaDe(m, PROJ))} · ${ok ? esc(m.resumo(PROJ, CALC)) : 'sem dados no projeto'}</span></button>
      ${ok ? `<span class="pill ${fl ? 'fail' : 'ok'}">${fl ? 'Pendente' : 'OK'}</span><span class="mem-exp"><button class="btn sm" type="button" data-exp="pdf" data-doc="${m.id}">PDF</button><button class="btn sm" type="button" data-exp="docx" data-doc="${m.id}">Word</button><button class="btn sm" type="button" data-exp="html" data-doc="${m.id}">HTML</button></span>` : ''}
    </div>`; };
  $('#tab-memoria').innerHTML = `
  <div class="mem-bar"><div><h2 class="tit">Memorial descritivo e memórias de cálculo</h2><p class="sub" style="margin:0">O memorial descritivo descreve a instalação segundo a NBR 5410 e leva como anexos as memórias marcadas abaixo e a lista de materiais. Cada memória também pode ser emitida separadamente ou reunida no relatório consolidado.</p></div></div>
  <div class="mem-cons mem-desc${MEMSEL === 'descritivo' ? ' on' : ''}">
    <div><b>Memorial descritivo</b><span class="mini"> · NBR 5410 e normas complementares · ${grupo.length} anexo(s): ${grupo.map((id, i) => String.fromCharCode(65 + i) + ' ' + esc(MEMO[id].nome.toLowerCase())).join(', ') || 'nenhum'}</span></div>
    <div class="mem-bt"><button class="btn${MEMSEL === 'descritivo' ? ' pri' : ''}" type="button" data-memsel="descritivo">Visualizar</button><button class="btn pri" type="button" data-exp="pdf" data-doc="descritivo">PDF</button><button class="btn" type="button" data-exp="docx" data-doc="descritivo">Word</button><button class="btn" type="button" data-exp="html" data-doc="descritivo">HTML</button></div>
  </div>
  ${descritivoHTML()}
  <p class="mini" style="margin:12px 0 6px">Marque os documentos que serão <b>anexos do memorial descritivo</b> (e partes do relatório consolidado):</p>
  <div class="mem-lista" role="list">${MEMORIAS.map(linha).join('')}</div>
  <div class="mem-cons">
    <div><b>Relatório consolidado</b><span class="mini"> · ${grupo.length} de ${disp.length} memória(s) marcada(s)</span></div>
    <div class="mem-bt">
      <button class="btn${MEMSEL === 'consolidado' ? ' pri' : ''}" type="button" data-memsel="consolidado">Visualizar</button>
      <button class="btn pri" type="button" data-exp="pdf" data-doc="consolidado"${grupo.length ? '' : ' disabled'}>PDF</button>
      <button class="btn" type="button" data-exp="docx" data-doc="consolidado"${grupo.length ? '' : ' disabled'}>Word</button>
      <button class="btn" type="button" data-exp="html" data-doc="consolidado"${grupo.length ? '' : ' disabled'}>HTML</button>
      <button class="btn" type="button" data-exp="xlsx">Quadro de cargas (Excel)</button>
      ${EMOLDURA ? '' : '<button class="btn" type="button" id="bt-print">Imprimir</button>'}
    </div>
  </div>
  <div class="mem-opc" data-scope="memopt">
    ${fChk('m', 'metodologia', 'Critérios e fórmulas (NBR 5410)', MEMOPT.metodologia, { struct: true })}
    ${fChk('m', 'detalhe', 'Memória detalhada por circuito', MEMOPT.detalhe, { struct: true })}
    ${fChk('m', 'anexo33', 'Anexo com esquemas da Tabela 33', MEMOPT.anexo33, { struct: true })}
    ${fChk('m', 'assinatura', 'Campo de assinatura', MEMOPT.assinatura, { struct: true })}
  </div>
  <p class="aviso-prev">Pré-visualização: <b>${MEMSEL === 'consolidado' ? 'relatório consolidado' : MEMSEL === 'descritivo' ? 'memorial descritivo com anexos' : esc(sel.titulo)}</b>. No PDF e no Word o documento sai em A4, com cabeçalho, rodapé e numeração de páginas.</p>
  <article class="folha doc" id="folha">${grupo.length || MEMSEL !== 'consolidado' ? renderHTMLDoc(blocos) : '<p>Marque ao menos uma memória para compor o relatório consolidado.</p>'}</article>`;
}

/* ---------- TABELAS DA NORMA ---------- */
function tabelaHTML(head, rows, alignR = true, cls = '') { return `<div class="tw"><table class="tbl ${cls}"><thead><tr>${head.map((h, i) => `<th class="${i && alignR ? 'r' : ''}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((v, i) => `<td class="${i && alignR ? 'r' : ''}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
const h3t = (t, top = 18) => `<h3 class="tit" style="font-size:16px;margin:${top}px 0 8px">${t}</h3>`;
function renderTabelas() {
  const tabs = REF_TABS;
  let corpo = '', nota = '';
  const nf = v => v == null ? '—' : nfmt(v, v % 1 ? 1 : 0);
  const selMat = `<div class="ref-sel" style="margin-top:-4px">${['Cu', 'Al'].map(m => `<button class="btn sm" type="button" data-mat="${m}" aria-pressed="${m === REFMAT}">${m === 'Cu' ? 'Cobre' : 'Alumínio'}</button>`).join('')}</div>`;
  if (REFTAB === '33') {
    corpo = tabelaHTML(['Nº', 'Esquema ilustrativo', 'Descrição', 'Método de referência', 'Condutores admitidos', 'Conduto'], METODOS.map(m => [
      `<b>${m.id}</b>`, `<span class="t33-fig">${pictograma(m.id)}</span>`, `<span class="t33-desc">${esc(m.desc)}</span>`,
      m.ref === 'EF' ? 'E (multipolar)<br>F (unipolares)' : (m.vde ? (m.vde === 5 ? 'B2: 1,5·De ≤ V < 5·De<br>B1: 5·De ≤ V < 50·De' : 'B2: 1,5·De ≤ V < 20·De<br>B1: V ≥ 20·De') : m.ref),
      m.tipos.map(t => ({ isolado: 'condutor isolado', unipolar: 'cabo unipolar', multipolar: 'cabo multipolar' })[t]).join('<br>'),
      m.conduto === 'circ' ? 'eletroduto circular' : (m.conduto === 'ncirc' ? 'não circular' : (m.condIso ? 'eletroduto (isolados)' : '—'))]), false, 't33');
    nota = 'Tabela 33 — tipos de linhas elétricas (maneiras de instalar) e métodos de referência para a capacidade de condução. V = altura do espaço de construção ou da canaleta; De = diâmetro externo do cabo. Esquemas ilustrativos próprios, simplificados: o fundo hachurado indica a superfície (parede, teto ou piso), o quadriculado a alvenaria, as ondas a isolação térmica e os pontos o solo.';
  } else if (REFTAB === '35') {
    corpo = tabelaHTML(['Isolação', 'Serviço contínuo (°C)', 'Sobrecarga (°C)', 'Curto-circuito (°C)'], T35.map(r => r.map(String)));
    nota = 'Tabela 35 — temperaturas características dos condutores. A operação em sobrecarga não deve ultrapassar 100 h em 12 meses consecutivos nem 500 h na vida do cabo.';
  } else if (['36', '37', '38', '39'].includes(REFTAB)) {
    const T = { 36: T36, 37: T37, 38: T38, 39: T39 }[REFTAB][REFMAT], secs = secoesDe(REFMAT);
    const abcd = REFTAB === '36' || REFTAB === '37';
    corpo = selMat + tabelaHTML(['Seção (mm²)', ...(abcd ? COLS_ABCD.flatMap(c => [`${c} · 2`, `${c} · 3`]) : COLS_EFG)], secs.filter(s => T[s]).map(s => [fS(s), ...T[s].map(nf)]));
    nota = `Tabela ${REFTAB} — capacidades de condução de corrente (A), ${REFMAT === 'Cu' ? 'cobre' : 'alumínio'}, isolação ${REFTAB === '36' || REFTAB === '38' ? 'PVC ou LSHF/A, 70 °C' : 'EPR, HEPR ou XLPE, 90 °C'}; ${abcd ? 'ar a 30 °C e solo a 20 °C (método D: 2,5 K·m/W, 0,7 m). Colunas: método de referência · condutores carregados.' : 'ar a 30 °C. F e G: cabos unipolares ou condutores isolados, quando o método permitir.'}${REFMAT === 'Al' && REFTAB === '38' ? ' A linha de 630 mm² reproduz o valor publicado no guia de referência — confira com o exemplar da norma.' : ''}`;
  } else if (REFTAB === '40') {
    corpo = tabelaHTML(['Temperatura (°C)', 'PVC/LSHF — ambiente', 'EPR/XLPE — ambiente', 'PVC/LSHF — solo', 'EPR/XLPE — solo'], Object.entries(T40).map(([t, v]) => [t, ...v.map(x => x == null ? '—' : nfmt(x, 2))]))
      + h3t('Tabela 41 — resistividade térmica do solo') + tabelaHTML(['Resistividade (K·m/W)', ...Object.keys(T41.duto).map(k => nfmt(+k, 1))], [['Cabos em dutos enterrados', ...Object.values(T41.duto).map(x => nfmt(x, 2))], ['Cabos diretamente enterrados', ...Object.values(T41.direto).map(x => nfmt(x, 2))]]);
    nota = 'Tabela 40 — fatores de correção para temperaturas diferentes de 30 °C (ar) e 20 °C (solo); a aplicação usa a linha imediatamente superior à temperatura informada. Tabela 41 — fatores para cabos até 0,8 m de profundidade, complementados pela IEC 60364-5-52:2009. Profundidade entre 0,7 m e 2 m: redução de 1 % a cada 10 cm.';
  } else if (REFTAB === '42') {
    corpo = tabelaHTML(['Ref.', 'Forma de agrupamento', '1', '2', '3', '4', '5', '6', '7', '8', '9 a 11', '12 a 15', '16 a 19', '≥ 20', 'Métodos'], Object.entries(T42).map(([k, v]) => [k, `<span style="white-space:normal">${REF42[k]}</span>`, ...Array.from({ length: 12 }, (_, i) => v[i] != null ? nfmt(v[i], 2) : (i >= 9 ? nfmt(v[8], 2) : '—')), k === '1' ? 'A a F' : (k <= '3' ? 'C' : 'E e F')]))
      + h3t('Tabela 43 — mais de uma camada (métodos C, E e F)') + tabelaHTML(['Camadas \\ circuitos por camada', '2', '3', '4 ou 5', '6 a 8', '9 ou mais'], T43.map((r, i) => [T43_ROT[i], ...r.map(x => nfmt(x, 2))]));
    nota = 'Fatores aplicáveis a grupos homogêneos e uniformemente carregados. Distância horizontal entre cabos maior que o dobro do diâmetro: sem redução. Cabos unipolares: 2 ou 3 cabos formam um circuito; cabos multipolares: cada cabo é um circuito. Grupos com seções diferentes: F = 1/√n (6.2.5.5.5).';
  } else if (REFTAB === '44') {
    corpo = h3t('Tabela 44 — cabos diretamente enterrados', 0) + tabelaHTML(['Nº de circuitos', ...ESP44], Object.entries(T44).map(([n, v]) => [n, ...v.map(x => nfmt(x, 2))]))
      + h3t('Tabela 45 — cabos multipolares em dutos individuais enterrados') + tabelaHTML(['Nº de circuitos', ...ESP45], Object.entries(T45M).map(([n, v]) => [n, ...v.map(x => nfmt(x, 2))]))
      + h3t('Tabela 45 — cabos unipolares em dutos individuais enterrados') + tabelaHTML(['Nº de circuitos', ...ESP45], Object.entries(T45U).map(([n, v]) => [n, ...v.map(x => nfmt(x, 2))]));
    nota = 'Fatores para 0,7 m de profundidade e 2,5 K·m/W (erro de até ±10 %; para maior precisão, IEC 60287). Linhas intermediárias da Tabela 44: a aplicação usa a linha imediatamente superior.';
  } else if (REFTAB === '46') {
    corpo = h3t('Tabela 46 — condutores carregados', 0) + tabelaHTML(['Esquema de condutores vivos', 'Condutores carregados'], [['Monofásico a dois condutores (F+N ou F+F)', '2'], ['Monofásico a três condutores', '2'], ['Duas fases sem neutro (F+F)', '2'], ['Duas fases com neutro (F+F+N)', '3'], ['Trifásico sem neutro (F+F+F)', '3'], ['Trifásico com neutro (F+F+F+N)', '3 ou 4 — neutro carregado por harmônicas: fator 0,86']], false)
      + h3t('Tabela 47 — seção mínima dos condutores') + tabelaHTML(['Tipo de linha', 'Utilização do circuito', 'Seção mínima (mm²)'], T47, false)
      + h3t('Tabela 48 — seção reduzida do condutor neutro') + tabelaHTML(['Fase (mm²)', 'Neutro mínimo (mm²)'], [['S ≤ 25', 'S'], ...Object.entries(T48).sort((a, b) => a[0] - b[0]).map(([a, b]) => [a, String(b)])])
      + h3t('Tabela 58 — seção mínima do condutor de proteção') + tabelaHTML(['Fase S (mm²)', 'PE mínimo (mm²)'], [['S ≤ 16', 'S'], ['16 < S ≤ 35', '16'], ['S > 35', 'S / 2']]);
    nota = 'Neutro reduzido só em circuitos trifásicos equilibrados, com 3ª harmônica até 15 % e neutro protegido. PE fora do cabo ou do conduto das fases: mínimo 2,5 mm² Cu com proteção mecânica e 4 mm² sem ela (16 mm² Al). Alumínio (6.2.3.8): proibido em residências e locais BD4; em indústrias, S ≥ 16 mm² com subestação ou fonte própria; no comércio, S ≥ 50 mm² em locais BD1.';
  } else if (REFTAB === 'k') {
    corpo = h3t('Fator k — condutores vivos (5.3.5.5.2)', 0) + tabelaHTML(['Material', 'PVC ≤ 300 mm² (70→160 °C)', 'PVC > 300 mm² (70→140 °C)', 'LSHF/A (70→160 °C)', 'EPR/XLPE (90→250 °C)'], KTAB.map(r => r.map(String)))
      + h3t('Condutor de proteção isolado, não incorporado a cabo multipolar nem enfeixado') + tabelaHTML(['Material', 'PVC ≤ 300', 'PVC > 300', 'EPR/XLPE', 'LSHF/A'], KPE_TAB.isolado.map(r => r.map(String)))
      + h3t('Condutor de proteção como veia de cabo multipolar, enfeixado ou no mesmo conduto') + tabelaHTML(['Material', 'PVC ≤ 300', 'PVC > 300', 'EPR/XLPE', 'LSHF/A'], KPE_TAB.veia.map(r => r.map(String)))
      + h3t('Condutor de proteção nu em contato com a cobertura do cabo') + tabelaHTML(['Material', 'Cobertura PVC', 'Polietileno', 'SHF1'], KPE_TAB.nuCobertura.map(r => r.map(String)))
      + h3t('Condutor de proteção formado por armação, capa metálica ou condutor concêntrico') + tabelaHTML(['Material', 'PVC', 'EPR/XLPE'], KPE_TAB.armacao.map(r => r.map(String)))
      + h3t('Condutor de proteção nu sem risco para materiais adjacentes') + tabelaHTML(['Condição', 'T. inicial', 'k cobre', 'T. máx.', 'k alumínio', 'T. máx.', 'k aço', 'T. máx.'], KPE_TAB.nu.map(r => r.map(String)));
    nota = 'S ≥ √(I²t) / k, válida até 5 s. Conexões soldadas com estanho limitam a temperatura a cerca de 160 °C: k = 100 (cobre/EPR) ou 143 (PE isolado). A aplicação verifica o PE com o k da veia ou do condutor enfeixado, pois o PE segue no mesmo cabo ou conduto das fases.';
  } else if (REFTAB === 'r20') {
    corpo = tabelaHTML(['Seção (mm²)', 'Cobre classe 2 (Ω/km)', 'Cobre classe 5 (Ω/km)', 'Alumínio classe 2 (Ω/km)'], SECOES_CU.map(s => [fS(s), R20.Cu2[s] != null ? nfmt(R20.Cu2[s], R20.Cu2[s] < 0.1 ? 4 : 3) : '—', R20.Cu5[s] != null ? nfmt(R20.Cu5[s], R20.Cu5[s] < 0.1 ? 4 : 3) : '—', R20.Al2[s] != null ? nfmt(R20.Al2[s], R20.Al2[s] < 0.1 ? 4 : 3) : '—']));
    nota = 'Resistência máxima em corrente contínua a 20 °C (ABNT NBR NM 280). Na queda de tensão, R′ = R20 × [1 + α(θ − 20)], com α = 0,00393 (cobre) e 0,00403 (alumínio), e R = R′ × (1 + ys + yp), com os efeitos pelicular e de proximidade da IEC 60287. A reatância é calculada por XL = 2π·f·[0,05 + 0,2·ln(2·GMD/dc)]·10⁻³ Ω/km.';
  } else if (REFTAB === 'cat') {
    const cel = (path, def) => def == null ? '—' : `<input type="text" inputmode="decimal" id="cat-${safeId(path)}" data-k="${path}" data-type="num" value="${esc(showNum(PROJ.catalogo[path]))}" placeholder="${showNum(def)}" aria-label="${path}">`;
    corpo = `<div data-scope="cat">
      ${h3t('Diâmetro externo dos condutores (mm)', 0)}
      ${tabelaHTML(['Seção (mm²)', 'Isolado 750 V', 'Unipolar 0,6/1 kV', 'Multipolar 2 vias', '3 vias', '4 vias', '5 vias'], SECOES_CU.map(s => [fS(s), cel(`isolado.${s}`, DIAM.isolado[s]), cel(`unipolar.${s}`, DIAM.unipolar[s]), ...[2, 3, 4, 5].map(n => cel(`multipolar.${n}.${s}`, DIAM.multipolar[n][s]))]))}
      ${Object.entries(ELETRODUTOS).map(([k, e]) => `${h3t(`${e.nome} (${e.norma}) — diâmetro interno (mm)`)}${tabelaHTML(['DN', 'Referência', 'Di (mm)'], e.itens.map(it => [it.dn, it.pol, cel(`eletro.${k}.${it.dn}`, it.di)]))}`).join('')}
      <p style="margin-top:14px"><button class="btn" type="button" id="bt-cat-reset">Restaurar valores típicos</button></p></div>`;
    nota = 'Valores típicos de catálogo, usados na ocupação dos eletrodutos e na reatância. Deixe a célula vazia para usar o valor típico (exibido em cinza) ou digite o valor do fabricante especificado; os ajustes são salvos com o projeto.';
  }
  else if (REFTAB === '8995') {
    const linhas = []; let g = null;
    AMB_8995.forEach(a => { if (a.g !== g) { g = a.g; linhas.push([`<b>${esc(g)}</b>`, '', '', '', '']); } linhas.push([esc(a.n), String(a.Em), a.UGR ?? '—', String(a.Ra), a.tarefa ? '≥ 0,70' : '—']); });
    corpo = tabelaHTML(['Tipo de ambiente, tarefa ou atividade', 'Em (lx)', 'UGRL', 'Ra mín.', 'Uo'], linhas, true, 't8995');
    nota = 'ABNT NBR ISO/CIE 8995-1:2013, seção 5 — iluminância mantida (Em) no plano da tarefa, índice limite de ofuscamento unificado (UGRL) e índice mínimo de reprodução de cor (Ra). Na área da tarefa a uniformidade Emín/Eméd deve ser ≥ 0,7; no entorno imediato, ≥ 0,5. O fator de manutenção não deve ser inferior a 0,70 (anexo D; CIE 97). Os valores residenciais não constam da 8995-1 (que trata de locais de trabalho) e são referências de projeto da antiga NBR 5413; em habitações, a NBR 5410 (9.5.2.1.2) admite como alternativa a carga mínima de 100 VA até 6 m², mais 60 VA a cada 4 m² inteiros. Confira com o seu exemplar da norma.';
  } else if (REFTAB === 'ndu') {
    const pc = v => v == null ? 'N.A.' : (Array.isArray(v) ? `${v[0]} (${v[1]})` : (v === 'F' ? '= fase' : String(v)));
    const faixasT = (f, n, rot) => Array.from({ length: n }, (_, i) => [rot(i + 1), f(i + 1) + ' %']);
    const t5 = Object.values(ATIV_T5).map(a => { let ini = 0; return [a.nome, a.faixas.map(([l, fd]) => { const s = l === Infinity ? (ini ? `acima de ${nfmt(ini, 0)} kW: ${fd} %` : `${fd} %`) : `${nfmt(ini, 0)} a ${nfmt(ini + l, 0)} kW: ${fd} %`; ini += l === Infinity ? 0 : l; return s; }).join('<br>')]; });
    const cat = (T) => tabelaHTML(['Cat.', 'Fios', 'Faixa', 'Al multiplex / concêntrico / neutro', 'Cu PVC fase / neutro', 'Cu XLPE fase / neutro', 'Aterr. (mm²)', 'Hastes', 'Disjuntor (A)', 'Eletroduto', 'Poste conc. / aço / pontalete (daN)', 'Caixa'], T.map(catObj).map(c => [c.cat, String(c.fios), `${nfmt(c.lo, 1)} < ${c.base} ≤ ${nfmt(c.hi, 1)} ${c.base === 'D' ? 'kVA' : 'kW'}`, `${pc(c.mux)} / ${pc(c.conc)} / ${pc(c.nAl)}`, `${pc(c.pvcF)} / ${pc(c.pvcN)}`, `${pc(c.xlpeF)} / ${pc(c.xlpeN)}`, pc(c.aterr), String(c.hastes), c.disj, c.eletro, `${pc(c.pConc)} / ${pc(c.pAco)} / ${pc(c.pont)}`, c.caixa]), false);
    const mot = T => tabelaHTML(['cv', 'kW absorvido', 'kVA', 'cos φ', 'η', '1 motor (kVA)', '2 motores', '3 a 5', 'mais de 5'], Object.entries(T).map(([k, v]) => [CV_TXT[k], nfmt(v[0], 2), nfmt(v[1], 2), nfmt(v[2], 2), nfmt(v[3], 2), nfmt(v[6], 2), nfmt(v[7], 2), nfmt(v[8], 2), nfmt(v[9], 2)]));
    corpo = h3t('Tabela 5 — iluminação e tomadas de uso geral', 0) + tabelaHTML(['Atividade', 'Fator de demanda (residência: acumulativo por faixa)'], t5, false)
      + h3t('Tabelas 6, 7 e 8 — aquecimento de água, secadoras/lava-louças/micro-ondas, fogões e fornos') + tabelaHTML(['Nº de aparelhos', 'Tab. 6 aquecimento', 'Tab. 7 secadoras etc.', 'Tab. 8 fogões e fornos', 'Tab. 10 ar resid.', 'Tab. 11 ar não resid.'], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50, 60].map(n => [String(n), fdT6(n) + ' %', fdT7(n) + ' %', fdT8(n) + ' %', fdT10(n) + ' %', fdT11(n) + ' %']))
      + h3t('Tabela 9 — potência de ar-condicionado (W)') + tabelaHTML(['Capacidade (BTU/h)', 'Janela', 'Split'], Object.entries(T9_AR).map(([k, v]) => [nfmt(+k, 0), v[0] ? nfmt(v[0], 0) : '—', v[1] ? nfmt(v[1], 0) : '—']))
      + h3t('Tabela 12 — motores monofásicos') + mot(T12_MOT1) + h3t('Tabela 13 — motores trifásicos') + mot(T13_MOT3)
      + h3t('Tabela 14 — solda a transformador, raios X e galvanização') + tabelaHTML(['Equipamento', 'Fatores'], [['Solda a arco e galvanização', '1º maior 100 % · 2º maior 70 % · 3º maior 40 % · demais 30 %'], ['Solda a resistência', 'maior 100 % · demais 60 %'], ['Raios X', 'maior 100 % · demais 70 %']], false)
      + h3t('Tabela 16 — categorias de atendimento, 220/127 V') + cat(CAT_T16) + h3t('Tabela 21 — categorias de atendimento, 254/127 V (rede monofásica)') + cat(CAT_T21);
    nota = `Energisa ${NDU001_VER}. D (kVA) = (d1 + … + d7) / 0,92. Tipos M e B enquadrados pela carga instalada (kW); tipo T pela demanda (kVA). Valores "a (b)": cabo embutido (subterrâneo). Disjuntor dimensionado para o limite superior da faixa. A Tabela 16 vale para EAC, EMR, EMS, EMT, ERO, ESE e ESS. As tabelas da NDU 003 (agrupamentos e edifícios) são informadas na aba Demanda Energisa.`;
  } else if (REFTAB === 'dps') {
    const lqt = k => LQ_DPS[k].map(([f, a, b, f2]) => [f === Infinity ? `> ${LQ_DPS[k][LQ_DPS[k].length - 2][0]}` : `até ${f}`, String(a), String(b), f2 ? `${f2} A` : '—']);
    const lqb = (k, t) => `<p class="mini" style="margin:10px 0 4px"><b>${t}</b></p>` + tabelaHTML(['F1 (A gL/gG)', 'Lq2 — fase', 'Lq3 — PE', 'Fusível F2'], lqt(k), false);
    corpo = h3t('Suportabilidade a impulso exigível — Tabela 31 da NBR 5410 (kV)', 0) + tabelaHTML(['Tensão nominal', 'IV — origem', 'III — distribuição', 'II — utilização', 'I — especialmente protegidos'], UW_TAB31.map(([, s, v]) => [s, ...v.map(x => nfmt(x, 1))]))
      + h3t('Tensão de operação contínua mínima Uc — Tabela 49') + tabelaHTML(['Modo de proteção', 'TN-S / TN-C-S', 'TT'], [['Fase–neutro', '1,1 × U0', '1,1 × U0'], ['Fase–PE', '1,1 × U0', '1,1 × U0 (a jusante do DR)'], ['Neutro–PE', 'U0', 'U0 (centelhador, ligação n+1 a montante do DR)']], false)
      + h3t('Classe do DPS por zona de proteção contra raios — NBR 5419-4') + tabelaHTML(['Fronteira', 'Onde', 'Classe do DPS'], ZPR_DPS, false)
      + h3t('Formas de ligação — NBR 5410, Figura 13, e ligação em T ou em V') + `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:12px">${formasLigacaoDPS(PROJ.params.U0).map(f => `<figure style="margin:0" class="diag-folha">${f.svg}<figcaption class="mini"><b>${esc(f.caption)}.</b> ${esc(f.sub)}</figcaption></figure>`).join('')}</div>`
      + h3t('Obrigatoriedade do DPS — NBR 5410 (influências externas AQ)') + tabelaHTML(['Edificação e alimentação', 'Td ≤ 25 dias/ano (AQ1)', 'Td > 25 dias/ano (AQ2)'], [['Edificação com SPDA (AQ3)', 'obrigatório', 'obrigatório'], ['Linha de BT total ou parcialmente aérea', 'não obrigatório', 'obrigatório'], ['Linha de BT totalmente subterrânea', 'não obrigatório', 'não obrigatório']], false)
      + h3t('Nível de exposição F = Td × (1,6 + 2 × LBT + δ) — catálogo Siemens') + tabelaHTML(['Situação da linha aérea e da edificação', 'δ'], DELTA_DPS.map(([d, t]) => [t, nfmt(d, 2)]), false)
      + tabelaHTML(['Nível de exposição F', 'In do DPS classe II'], [['F ≤ 40', '5 kA'], ['40 < F ≤ 80', '10 kA'], ['F > 80', '20 kA']], false)
      + h3t('Correntes de descarga') + tabelaHTML(['Parâmetro', 'Critério'], [['In (8/20 µs) — classe II', '≥ 5 kA por modo (NBR 5410); pelo nível de exposição F ou pela faixa de exposição'], ['Iimp (10/350 µs) — classe I', '≥ 12,5 kA por modo; com SPDA: NP I 25 kA · NP II 18,75 kA · NP III e IV 12,5 kA (3F+N)'], ['Iimp N–PE na ligação n+1', 'soma dos modos: NP I 100 kA · NP II 75 kA · NP III e IV 50 kA'], ['Ifi — centelhadores', '≥ curto-circuito presumido; N–PE ≥ 100 A (NBR 5410)'], ['Iimp com SPDA — divisão da corrente', 'Iimp = Ip × 0,5 / (n serviços × m condutores) (NBR 5419-1, Anexo E); mínimo de 12,5 kA'], ['DPS de linhas de sinal', 'na entrada da edificação, ligado ao BEP; categoria D1 (10/350 µs) com SPDA ou C2 (8/20 µs) — IEC 61643-21; componentes na entrada ≥ 1,5 kV'], ...Object.values(EXPO_DPS).map(([v, t]) => [`Imáx classe II — ${t.split(' — ')[0].toLowerCase()} (faixa de catálogo)`, `${v} kA · ${t.split(' — ')[1]}`])], false)
      + h3t('Seção dos condutores de ligação pela proteção a montante F1 — catálogo Siemens (mm² Cu)')
      + lqb('I|V', 'Classe I e I+II — ligação em série (em V)') + lqb('I|T', 'Classe I e I+II — ligação em paralelo (em T)') + lqb('II|V', 'Classe II — ligação em série (em V)') + lqb('II|T', 'Classe II — ligação em paralelo (em T)')
      + h3t('Instalação') + tabelaHTML(['Item', 'Critério'], [['Condutores de ligação', 'comprimento total ≤ 0,5 m; ligação em V (série) quando maior'], ['Seção mínima', '4 mm² Cu; 16 mm² Cu para DPS classe I ou estrutura com SPDA (NBR 5410); não inferior à do fabricante para a proteção a montante'], ['Nível efetivo', 'varistor: Up/f = Up + ΔU; centelhador: Up/f = máx(Up; ΔU); ΔU ≈ 1 kV/m na classe I e ≈ 0 na ligação em V (IEC 62305-4)'], ['Distância de proteção', `lpo = (Uw − Up/f) / ${K_OSC} V/m (IEC 62305-4, Anexo D) ou ${D_PROT_FAB} m (prática de fabricante, catálogo Siemens)`], ['Retaguarda', 'fusível ou disjuntor máximo indicado pelo fabricante; dedicado (F2) quando a proteção a montante for maior (Siemens) ou quando o curto-circuito passar do suportado pelo desligador interno (Clamper: fusível gL/gG até 100 A por fase) — nunca menor que o indicado'], ['Coordenação', `DPS declarados coordenados pelo fabricante ou pelo menos ${D_COORD} m de cabo entre estágios (IEC 61643-12, informativo); abaixo disso, indutor de desacoplamento`], ['DR a montante do DPS', `imunidade a correntes de surto ≥ ${IMUN_DR} kA (8/20 µs), instantâneo ou temporizado; tipo S recomendado`]], false);
    nota = 'NBR 5410:2004 (vigente; revisão em andamento) e NBR 5419-4:2026. O nível de exposição F, as seções dos condutores pela proteção a montante e a distância de proteção de 30 m são do catálogo Siemens DPS 5SD7 (2021); as faixas de Imáx por exposição e os valores de Iimp por polo seguem catálogos de fabricantes do mercado (ex.: DEHN, Clamper, Schneider, Finder). Confirme os valores das Tabelas 31 e 49 e dos itens 6.3.5.2 no seu exemplar da norma, e os dados de Uc, Up, In, Iimp, Ifi, retaguarda e Isccr na ficha técnica do produto escolhido.';
  } else if (REFTAB === 'spda') {
    const nps = ['I', 'II', 'III', 'IV'], hs = [2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    corpo = tabelaHTML(['Nível de proteção', 'Esfera rolante (m)', 'Malha (m)', 'Descidas e anéis (m)', 'ki', 'Corrente de pico (kA)', 'PB', 'PEB / PSPD'], nps.map(k => { const P = NP_SPDA[k]; return [`NP ${k}`, String(P.r), `${P.malha} × ${P.malha}`, String(P.desc), fp(P.ki), String(P.Ip), fp(P.PB), fp(PSPD_NIV[k])]; }))
      + h3t('Ângulo de proteção α (graus) pela altura do captor acima do plano de referência') + tabelaHTML(['Altura h (m)', ...nps.map(k => `NP ${k}`)], hs.map(h => [String(h), ...nps.map(k => { const a = anguloProtecao(h, NP_SPDA[k].r); return a == null ? '—' : nfmt(a, 1); })]))
      + h3t('Seções mínimas dos materiais (NBR 5419-3:2026)') + tabelaHTML(['Material', 'Captação e descidas', 'Aterramento'], [['Cobre', '35 mm²', '50 mm² (cabo de 7 ou 19 fios)'], ['Aço cobreado', '35 mm²', '50 mm²'], ['Alumínio', '70 mm²', 'não utilizar'], ['Alumínio cobreado', '70 mm²', '—'], ['Aço zincado a quente', '50 mm²', 'conforme a norma — não usar na transição concreto–solo'], ['Captor vertical maciço', '200 mm² (Ø 16 mm)', '—'], ['Captor vertical tubular', '100 mm², parede de 1,2 mm', '—']], false)
      + h3t('Comprimento mínimo do eletrodo l1 (arranjo B)') + tabelaHTML(['ρ (Ω·m)', 'NP I', 'NP II', 'NP III e IV'], [100, 500, 800, 1000, 1500, 2000, 3000].map(r => [String(r), nfmt(l1Aterr('I', r), 1), nfmt(l1Aterr('II', r), 1), nfmt(l1Aterr('III', r), 1)]))
      + h3t('Densidade de descargas NG — Mato Grosso do Sul (Anexo F da NBR 5419-2:2026, descargas/km²/ano)') + (() => { const L = Object.entries(NG_ANEXO_F.MS.mun), m = Math.ceil(L.length / 2); return tabelaHTML(['Município', 'NG', 'Município', 'NG'], Array.from({ length: m }, (_, i) => [...(L[i] ? [esc(L[i][0]), String(L[i][1])] : ['', '']), ...(L[i + m] ? [esc(L[i + m][0]), String(L[i + m][1])] : ['', ''])]), true, 'nt'); })()
      + h3t('Distância de segurança s = ki × (kc / km) × l') + tabelaHTML(['Coeficiente', 'Valores'], [['ki', 'NP I: 0,08 · NP II: 0,06 · NP III e IV: 0,04'], ['kc', '1 descida: 1 · 2 descidas: 0,66 · 3 ou mais: 0,44'], ['km', 'ar: 1 · concreto ou alvenaria: 0,5']], false);
    nota = 'ABNT NBR 5419:2026. O ângulo de proteção é calculado pela equivalência de área com a esfera rolante, que reproduz as curvas da Parte 3; acima do raio da esfera só se aplicam a esfera rolante e as malhas. Distância entre descidas: valor típico, admitidos 20 % a mais. A edição de 2026 trocou "classe do SPDA" por "nível de proteção (NP)", manteve apenas o arranjo B (anel) no aterramento, equiparou o aço cobreado ao cobre e passou a verificar a eficácia do aterramento pela continuidade elétrica. As seções da tabela vêm de resumos técnicos da revisão; confira-as no texto oficial da ABNT. Inspeção: visual anual; completa a cada 3 anos (1 ano para explosivos, corrosão severa ou serviços essenciais).';
  } else if (REFTAB === 'ext') {
    const linhas = []; let g = null;
    REQ_EXT.forEach(a => { if (a.g !== g) { g = a.g; linhas.push([`<b>${esc(g)}</b>`, '', '', '']); } linhas.push([esc(a.n), nfmt(a.Em, 0), nfmt(a.U0, 2), esc(a.ref)]); });
    corpo = tabelaHTML(['Área externa', 'Eméd (lx)', 'U0 = Emín/Eméd', 'Referência'], linhas, true, 't8995')
      + h3t('Produtos genéricos para exteriores') + tabelaHTML(['Produto', 'P (W)', 'Fluxo (lm)', 'lm/W', 'Facho', 'm (cosᵐθ)', 'IP'], CAT_EXT.map(x => [esc(x.nome), nfmt(x.W, 0), nfmt(x.lm, 0), nfmt(x.lm / x.W, 0), x.facho + '°', nfmt(mDeFacho(x.facho), 2), x.ip]), false);
    nota = 'Níveis médios mantidos e uniformidade mínima para o cálculo de exteriores. NBR 5101: valores por iluminância das classes V1 a V5 (veículos) e P1 a P4 (pedestres) da edição de 2018; a edição de 2024 passou a usar as classes M, C e P, com requisitos de luminância — confirme na edição vigente e na norma da distribuidora ou da prefeitura. EN 12464-2 (CIE S 015) e EN 12193: valores de referência para locais de trabalho, estacionamentos e quadras externos. Método de cálculo: número de projetores pelo método dos lúmens N = E × S / (Φ × Fu × Fd) e verificação ponto a ponto E = Σ I(θ) × h / d³ (Mamede Filho, Instalações Elétricas Industriais, iluminação de exteriores). Os produtos são genéricos, com fluxo e facho típicos de catálogo.';
  } else if (REFTAB === 'lum') {
    corpo = tabelaHTML(['Fabricante', 'Produto', 'Tipo', 'P (W)', 'Fluxo (lm)', 'lm/W', 'Ra', 'Vida (h)', 'Fonte dos dados'], CAT_LUM.map(x => [esc(x.fab), `<span style="white-space:normal">${esc(x.mod)}</span>`, x.tipo === 'lampada' ? 'lâmpada' : 'luminária', nfmt(x.W, 1), nfmt(x.lm, 0), nfmt(x.lm / x.W, 0), String(x.Ra), x.vida ? nfmt(x.vida, 0) : '—', `<span class="mini" style="white-space:normal">${esc(x.fonte || '')}</span>`]), false)
      + h3t('Luminárias para lâmpadas avulsas (rendimento típico)') + tabelaHTML(['Luminária', 'Rendimento (LOR)', 'Abertura do facho', 'Fluxo para cima'], Object.values(CORPOS).map(x => [esc(x.nome), nfmt(x.lor, 2), x.facho + '°', nfmt(x.up * 100, 0) + ' %']));
    nota = 'Dados de catálogo e de fichas técnicas publicadas pelos fabricantes e revendedores (Philips/Signify, Ledvance, Lumicenter, Elgin, PIX), versões consultadas em 2026; os modelos e o fluxo luminoso mudam com frequência — confirme pelo código do produto na ficha do fabricante antes de especificar. Luminárias industriais "genéricas" representam a eficácia de mercado (150 lm/W). Para produtos fora da lista, use "Informar os dados da luminária" no ambiente; se o fabricante fornecer a tabela de fatores de utilização, informe o UF diretamente.';
  }
  $('#tab-tabelas').innerHTML = `<h2 class="tit">Tabelas da norma</h2>
    <p class="sub">Dados usados nos cálculos (ABNT NBR 5410:2004), conferidos com o Guia de Dimensionamento de Cabos para Baixa Tensão da Prysmian (Rev. 9). Confira com o seu exemplar da norma antes de emitir a memória.</p>
    <div class="ref-sel">${tabs.map(([k, l]) => `<button class="btn sm" type="button" data-ref="${k}" aria-pressed="${k === REFTAB}">${l}</button>`).join('')}</div>
    ${corpo}<p class="ref-nota">${nota}</p>`;
}

/* ---------- eventos ---------- */
document.addEventListener('input', ev => onCampo(ev, false));
document.addEventListener('toggle', ev => { if (ev.target && ev.target.id === 'k-cons-box') CCONS_ABERTO = ev.target.open; if (ev.target && ev.target.id === 'm-desc-box') DESC_ABERTO = ev.target.open; }, true);
document.addEventListener('change', ev => onCampo(ev, true));
document.addEventListener('click', ev => {
  const el = ev.target.closest('button, tr[data-ir]'); if (!el) return;
  if (el.closest('#menubar')) return cliqueMenu(el);
  if (el.dataset.go) return irPara(el.dataset.go);
  if (el.dataset.sel) { SEL = el.dataset.sel; renderLista(); renderEditor(); if (window.innerWidth < 900) $('#editor').scrollIntoView({ block: 'start' }); return; }
  if (el.dataset.ir) { SEL = el.dataset.ir; irPara('circuitos'); return; }
  if (el.dataset.exp) return exportar(el.dataset.exp, el, el.dataset.doc || (TAB === 'memoria' ? MEMSEL : 'circuitos'));
  if (el.dataset.memsel) { MEMSEL = el.dataset.memsel; renderMemoria(); renderTrilha(); if (window.innerWidth < 900) $('#folha').scrollIntoView({ block: 'start' }); return; }
  if (el.dataset.asel) { ASEL = el.dataset.asel; renderArrLista(); renderArrEditor(); if (window.innerWidth < 900) $('#a-ed').scrollIntoView({ block: 'start' }); return; }
  if (el.dataset.delmat) { PROJ.materiais.itens.splice(+el.dataset.delmat, 1); mudou(true); return; }
  if (el.dataset.dellocal) { PROJ.descritivo.locais.splice(+el.dataset.dellocal, 1); DESC_ABERTO = true; mudou(true); return; }
  if (el.dataset.delmed) { PROJ.aterr.solo.med.splice(+el.dataset.delmed, 1); mudou(true); return; }
  if (el.dataset.amodo) { PROJ.aterr.modo = el.dataset.amodo; if (el.dataset.amodo === 'simplificado' && PROJ.aterr.solo.modelo === '2c') PROJ.aterr.solo.modelo = 'homog'; mudou(true); return; }
  if (el.dataset.qdiag) { QDIAG[el.dataset.qdiag] = el.dataset.modo; const q = CALC.quadros[el.dataset.qdiag], g = q && $('#q-' + safeId(q.q) + '-diag'); if (g) g.innerHTML = diagramaHTML(q); return; }
  if (el.dataset.planta) { LPLANTA = el.dataset.planta; renderLumiRes(); return; }
  if (el.dataset.ref) { REFTAB = el.dataset.ref; renderTabelas(); renderTrilha(); return; }
  if (el.dataset.mat) { REFMAT = el.dataset.mat; renderTabelas(); return; }
  if (el.dataset.bal) { balancearFases(PROJ, CALC, el.dataset.bal); mudou(true); toast(`Fases do ${el.dataset.bal} redistribuídas.`); return; }
  if (el.dataset.csel) { CSEL = el.dataset.csel; renderCambLista(); renderCambEditor(); if (window.innerWidth < 900) $('#k-ed').scrollIntoView({ block: 'start' }); return; }
  if (el.dataset.addenv) { const a = ambCSel(); if (a) { a.env.push(envPadrao(el.dataset.addenv)); mudou(true); } return; }
  if (el.dataset.delenv) { const a = ambCSel(); if (a) { a.env.splice(+el.dataset.delenv, 1); mudou(true); } return; }
  if (el.dataset.deleq) { const a = ambCSel(); if (a) { a.equip.splice(+el.dataset.deleq, 1); mudou(true); } return; }
  if (el.dataset.addcam) { PROJ.clima.cons[+el.dataset.addcam].cam.push({ mat: 'reboco', e: 2 }); CCONS_ABERTO = true; mudou(true); return; }
  if (el.dataset.delcam) { const [i, j] = el.dataset.delcam.split(':').map(Number); const k = PROJ.clima.cons[i]; if (k.cam.length > 1) k.cam.splice(j, 1); CCONS_ABERTO = true; mudou(true); return; }
  if (el.dataset.delcons) { const k = PROJ.clima.cons[+el.dataset.delcons]; if (PROJ.clima.amb.some(a => a.env.some(e => e.cons === k.id))) { toast('Componente em uso em algum ambiente.'); return; } PROJ.clima.cons.splice(+el.dataset.delcons, 1); CCONS_ABERTO = true; mudou(true); return; }
  if (el.dataset.usel) { USEL = el.dataset.usel; renderUCLista(); renderUCEditor(); if (window.innerWidth < 900) $('#e-ed').scrollIntoView({ block: 'start' }); return; }
  if (el.dataset.delcarga) { const u = ucSel(); if (u) { u.cargas.splice(+el.dataset.delcarga, 1); mudou(true); } return; }
  if (el.dataset.delconj) { PROJ.energisa.conj.splice(+el.dataset.delconj, 1); mudou(true); return; }
  if (el.dataset.add003) { PROJ.energisa.t003[el.dataset.add003].push([null, null]); mudou(true); return; }
  if (el.dataset.del003) { const [t, i] = el.dataset.del003.split(':'); PROJ.energisa.t003[t].splice(+i, 1); mudou(true); return; }
  if (el.dataset.lmodo) { LMODO = el.dataset.lmodo; renderLumi(); renderTrilha(); return; }
  if (el.dataset.xsel) { XSEL = el.dataset.xsel; renderLumiExtLista(); renderLumiExtEditor(); if (window.innerWidth < 900) $('#lumx-ed').scrollIntoView({ block: 'start' }); return; }
  if (el.dataset.lsel) { LSEL = el.dataset.lsel; renderLumiLista(); renderLumiEditor(); if (window.innerWidth < 900) $('#lumi-ed').scrollIntoView({ block: 'start' }); return; }
  if (el.dataset.potlumi) { const c = PROJ.circuitos.find(x => x.id === el.dataset.potlumi); if (c) { c.potLumi = true; mudou(true); toast(`Circuito ${c.num} passa a usar a potência da luminotécnica.`); } return; }
  if (el.dataset.delq) { delete PROJ.quadros[el.dataset.delq]; PROJ.circuitos.forEach(c => { if (c.alimenta === el.dataset.delq) c.alimenta = ''; }); mudou(true); return; }
  switch (el.id) {
    case 'bt-add': return addCircuito($('#novo-tipo').value);
    case 'bt-dup': { const c = circSel(); if (!c) return; const n = JSON.parse(JSON.stringify(c)); n.id = uid(); n.num = proxNum(); n.desc = (c.desc || '') + ' (cópia)'; PROJ.circuitos.splice(PROJ.circuitos.indexOf(c) + 1, 0, n); SEL = n.id; mudou(true); return; }
    case 'bt-exc': return confirmar2(el, 'Confirmar exclusão', () => { const i = PROJ.circuitos.findIndex(c => c.id === SEL); if (i < 0) return; const [rm] = PROJ.circuitos.splice(i, 1); delete PROJ.trechos['#' + rm.id]; [...(PROJ.lumi || []), ...(PROJ.lumiExt || [])].forEach(a => { if (a.circuito === rm.id) a.circuito = ''; }); SEL = (PROJ.circuitos[i] || PROJ.circuitos[i - 1] || {}).id || null; mudou(true); toast(`Circuito ${rm.num} excluído.`); });
    case 'bt-sobe': case 'bt-desce': { const i = PROJ.circuitos.findIndex(c => c.id === SEL), j = i + (el.id === 'bt-sobe' ? -1 : 1); if (i < 0 || j < 0 || j >= PROJ.circuitos.length) return; [PROJ.circuitos[i], PROJ.circuitos[j]] = [PROJ.circuitos[j], PROJ.circuitos[i]]; mudou(true); return; }
    case 'bt-add-camb': { const a = ambClimaPadrao(PROJ.clima.amb.length + 1); PROJ.clima.amb.push(a); CSEL = a.id; mudou(true); return; }
    case 'bt-dup-camb': { const a = ambCSel(); if (!a) return; const n = JSON.parse(JSON.stringify(a)); n.id = uid(); n.nome = a.nome + ' (cópia)'; PROJ.clima.amb.splice(PROJ.clima.amb.indexOf(a) + 1, 0, n); CSEL = n.id; mudou(true); return; }
    case 'bt-exc-camb': return confirmar2(el, 'Confirmar exclusão', () => { const A = PROJ.clima.amb, i = A.findIndex(a => a.id === CSEL); if (i < 0) return; const [rm] = A.splice(i, 1); CSEL = (A[i] || A[i - 1] || {}).id || null; mudou(true); toast(`${rm.nome} excluído.`); });
    case 'bt-camb-lumi': { let n = 0; (PROJ.lumi || []).forEach(l => { if (PROJ.clima.amb.some(a => a.lumiId === l.id)) return; const a = ambClimaPadrao(PROJ.clima.amb.length + 1); Object.assign(a, { nome: l.nome, area: +(l.L * l.W).toFixed(2), pd: l.pd, lumiId: l.id, env: [envPadrao('cobertura')] }); a.env[0].area = a.area; PROJ.clima.amb.push(a); n++; }); if (n) CSEL = PROJ.clima.amb[PROJ.clima.amb.length - n].id; mudou(true); toast(n ? `${n} ambiente(s) trazido(s) da luminotécnica — complete paredes e janelas.` : 'Todos os ambientes da luminotécnica já estão na climatização.'); return; }
    case 'bt-add-eq': { const a = ambCSel(); if (!a) return; const t = EQ_TIPICOS[+$('#k-eq-novo').value]; a.equip.push({ desc: t[0], qtd: 1, W: t[1], WL: t[2] }); mudou(true); return; }
    case 'bt-add-cons': PROJ.clima.cons.push({ id: 'u' + uid(), nome: 'Novo componente', tipo: 'parede', cam: [{ mat: 'reboco', e: 2.5 }, { mat: 'blocoCer', e: 9 }, { mat: 'reboco', e: 2.5 }] }); CCONS_ABERTO = true; mudou(true); return;
    case 'bt-circ-clima': return criarCircuitosClima();
    case 'bt-add-med': { const M = PROJ.aterr.solo.med, u = M[M.length - 1]; M.push({ dir: u ? u.dir : 'A', a: u ? +u.a * 2 : 1, R: null }); mudou(true); return; }
    case 'bt-med-serie': { const M = PROJ.aterr.solo.med, dir = String.fromCharCode(65 + new Set(M.map(m => m.dir)).size); [1, 2, 4, 8, 16].forEach(a => M.push({ dir, a, R: null })); mudou(true); return; }
    case 'bt-add-arr': { const t = $('#a-novo-tipo').value, a = arrPadrao(t, t === 'malha' ? 'subestacao' : 'massas'); PROJ.aterr.arr.push(a); ASEL = a.id; mudou(true); return; }
    case 'bt-arr-ndu': return criarArranjoNDU();
    case 'bt-add-mat': { const cat = $('#mt-novo-cat').value; PROJ.materiais.itens.push({ id: uid(), cat, desc: 'Novo material', un: 'un', norma: '', fab: '', qtd: 0 }); mudou(true); return; }
    case 'bt-zera-mat': return confirmar2(el, 'Confirmar: zerar?', () => { PROJ.materiais.itens.forEach(x => { x.qtd = 0; }); mudou(true); toast('Quantidades do cadastro zeradas.'); });
    case 'bt-add-local': PROJ.descritivo.locais.push({ local: '', infl: '', medidas: '' }); DESC_ABERTO = true; mudou(true); return;
    case 'bt-inf-padrao': return confirmar2(el, 'Substituir a classificação?', () => { const d = descritivoPadrao(PROJ.params.edificacao); Object.assign(PROJ.descritivo, { influencias: d.influencias, medidas: {}, locais: d.locais }); DESC_ABERTO = true; mudou(true); toast('Classificação padrão restaurada.'); });
    case 'bt-dim-hastes': { const a = arrSel(), r = a && CALC.aterr.arr[a.id]; if (!r || !r.nMin) return; if (a.tipo === 'haste' && r.nMin > 1) a.tipo = 'linha'; a.n = r.nMin; mudou(true); toast(`${r.nMin} haste(s) alinhadas: R = ${nfmt(r.nMinR, 2)} Ω.`); return; }
    case 'bt-dup-arr': { const a = arrSel(); if (!a) return; const n = JSON.parse(JSON.stringify(a)); n.id = uid(); n.nome = a.nome + ' (cópia)'; PROJ.aterr.arr.splice(PROJ.aterr.arr.indexOf(a) + 1, 0, n); ASEL = n.id; mudou(true); return; }
    case 'bt-exc-arr': return confirmar2(el, 'Confirmar exclusão', () => { const A = PROJ.aterr.arr, i = A.findIndex(a => a.id === ASEL); if (i < 0) return; const [rm] = A.splice(i, 1); ASEL = (A[i] || A[i - 1] || {}).id || null; mudou(true); toast(`${rm.nome} excluído.`); });
    case 'bt-aplicar-ra': { const a = arrSel(); if (!a) return; PROJ.params.RA = +CALC.aterr.arr[a.id].R.toFixed(2); mudou(true); toast(`RA = ${nfmt(PROJ.params.RA, 2)} Ω aplicado ao esquema TT (verificação RA × IΔn nos circuitos).`); return; }
    case 'bt-add-uc': { const E = PROJ.energisa; const u = ucPadrao(E.ucs.length + 1); E.ucs.push(u); USEL = u.id; mudou(true); return; }
    case 'bt-dup-uc': { const u = ucSel(); if (!u) return; const n = JSON.parse(JSON.stringify(u)); n.id = uid(); n.nome = (u.nome || 'UC') + ' (cópia)'; PROJ.energisa.ucs.splice(PROJ.energisa.ucs.indexOf(u) + 1, 0, n); USEL = n.id; mudou(true); return; }
    case 'bt-exc-uc': return confirmar2(el, 'Confirmar exclusão', () => { const E = PROJ.energisa; if (E.ucs.length <= 1) { toast('O memorial precisa de ao menos uma UC.'); return; } const i = E.ucs.findIndex(u => u.id === USEL); const [rm] = E.ucs.splice(i, 1); USEL = (E.ucs[i] || E.ucs[i - 1]).id; mudou(true); toast(`${rm.nome} excluída.`); });
    case 'bt-imp-uc': return confirmar2(el, 'Substituir as cargas?', () => { const u = ucSel(); if (!u) return; u.cargas = cargasDoProjeto(PROJ, CALC); if (PROJ.circuitos.some(c => c.tipo !== 'dist' && nFases(c.ligacao) === 3)) u.reqTri = true; if (PROJ.circuitos.some(c => c.tipo !== 'dist' && (c.ligacao === 'FF' || c.ligacao === 'FFN'))) u.req220 = true; mudou(true); toast(`${u.cargas.length} cargas importadas dos circuitos.`); });
    case 'bt-add-carga': { const u = ucSel(); if (!u) return; u.cargas.push(cargaPadrao($('#e-novo-g').value)); mudou(true); return; }
    case 'bt-add-t4': { const u = ucSel(); if (!u) return; const a = T4_APAR[+$('#e-t4').value]; const g = a[2] || 'ilum'; const c = { ...cargaPadrao(g), desc: a[0], W: a[1] }; if (a[3]) c.cv = a[3]; u.cargas.push(c); mudou(true); return; }
    case 'bt-add-conj': PROJ.energisa.conj.push({ desc: `Conjunto ${PROJ.energisa.conj.length + 1}`, n: 4, area: 60 }); mudou(true); return;
    case 'bt-add-amb': { const a = defaultsAmbiente((PROJ.lumi || []).length + 1); const b = ambSel(); if (b) Object.assign(a, { pd: b.pd, hwp: b.hwp, susp: b.susp, rc: b.rc, rw: b.rw, rf: b.rf, prod: b.prod, corpo: b.corpo, nLamp: b.nLamp, fm: b.fm }); PROJ.lumi = PROJ.lumi || []; PROJ.lumi.push(a); LSEL = a.id; mudou(true); const n = $('#a-nome'); if (n) { n.focus(); n.select(); } return; }
    case 'bt-dup-amb': { const a = ambSel(); if (!a) return; const n = JSON.parse(JSON.stringify(a)); n.id = uid(); n.nome = (a.nome || '') + ' (cópia)'; PROJ.lumi.splice(PROJ.lumi.indexOf(a) + 1, 0, n); LSEL = n.id; mudou(true); return; }
    case 'bt-exc-amb': return confirmar2(el, 'Confirmar exclusão', () => { const i = PROJ.lumi.findIndex(a => a.id === LSEL); if (i < 0) return; const [rm] = PROJ.lumi.splice(i, 1); LSEL = (PROJ.lumi[i] || PROJ.lumi[i - 1] || {}).id || null; mudou(true); toast(`Ambiente ${rm.nome} excluído.`); });
    case 'bt-add-ext': { const a = ambExtPadrao((PROJ.lumiExt || []).length + 1), b = areaXSel(); if (b) Object.assign(a, { req: b.req, arranjo: b.arranjo, k: b.k, h: b.h, tilt: b.tilt, recuo: b.recuo, prod: b.prod, cW: b.cW, clm: b.clm, cFacho: b.cFacho, fu: b.fu, fd: b.fd }); PROJ.lumiExt.push(a); XSEL = a.id; mudou(true); const n = $('#x-nome'); if (n) { n.focus(); n.select(); } return; }
    case 'bt-dup-ext': { const a = areaXSel(); if (!a) return; const n = JSON.parse(JSON.stringify(a)); n.id = uid(); n.nome = (a.nome || '') + ' (cópia)'; PROJ.lumiExt.splice(PROJ.lumiExt.indexOf(a) + 1, 0, n); XSEL = n.id; mudou(true); return; }
    case 'bt-exc-ext': return confirmar2(el, 'Confirmar exclusão', () => { const X = PROJ.lumiExt, i = X.findIndex(a => a.id === XSEL); if (i < 0) return; const [rm] = X.splice(i, 1); XSEL = (X[i] || X[i - 1] || {}).id || null; mudou(true); toast(`${rm.nome} excluída.`); });
    case 'bt-sug-ext': return aplicarSugestaoExt();
    case 'bt-spda-ativar': PROJ.spda.ativo = true; mudou(true); return;
    case 'bt-spda-retirar': return confirmar2(el, 'Confirmar: retirar?', () => { PROJ.spda.ativo = false; mudou(true); toast('SPDA retirado do projeto (os dados ficam guardados).'); });
    case 'bt-spda-sug': { const s = CALC.spda.projeto && CALC.spda.projeto.sugestao; if (!s) return; Object.assign(PROJ.spda, { mx: s.mx, my: s.my }); mudou(true); return; }
    case 'bt-add-q': { const inp = $('#novo-quadro'); const n = (inp.value || '').trim(); if (!n) { toast('Informe o nome do quadro.'); inp.focus(); return; } if (PROJ.quadros[n]) { toast(`Já existe o quadro ${n}.`); return; } PROJ.quadros[n] = { desc: '', fd: null, icc: PROJ.params.icc, dvMont: 0 }; mudou(true); toast(`Quadro ${n} criado. Atribua circuitos a ele no campo "Quadro de origem".`); return; }
    case 'bt-cat-reset': PROJ.catalogo = {}; mudou(true); toast('Valores típicos restaurados.'); return;
    case 'bt-salvar': return oferecerArquivo(`${slug()}.dimensiona5410.json`, JSON.stringify(PROJ, null, 2), 'application/json');
    case 'bt-abrir': return $('#arquivo').click();
    case 'bt-novo': return confirmar2(el, 'Apagar e começar?', () => { PROJ = projetoVazio(); SEL = null; LSEL = null; XSEL = null; mudou(true); irPara('projeto'); toast('Projeto em branco criado.'); });
    case 'bt-banner-ok': PROJ.exemplo = false; mudou(false); return;
    case 'bt-banner-novo': PROJ = projetoVazio(); SEL = null; mudou(true); irPara('projeto'); return;
    case 'bt-print': document.body.classList.add('imprimindo'); setTimeout(() => { window.print(); document.body.classList.remove('imprimindo'); }, 50); return;
  }
});
$('#arquivo').addEventListener('change', ev => { const f = ev.target.files[0]; if (f) abrirArquivo(f); ev.target.value = ''; });
document.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.id === 'novo-quadro') { ev.preventDefault(); $('#bt-add-q').click(); } });

/* ---------- início ---------- */
(function iniciar() {
  const st = document.createElement('style'); st.textContent = DOC_CSS + `@media print{body.imprimindo .app>:not(main),body.imprimindo main>:not(#tab-memoria),body.imprimindo #tab-memoria>:not(#folha){display:none!important}body.imprimindo .folha{border:0;box-shadow:none;padding:0;max-width:none}body.imprimindo{background:#fff}}`;
  (document.head || document.body).appendChild(st);
  let t = null; try { t = (location.hash || '').slice(1) || localStorage.getItem(LS_TAB); } catch (e) { }
  try { PROJ = carregar(); recalc(); }
  catch (e) { console.error(e); PROJ = projetoExemplo(); recalc(); toast('O projeto salvo neste navegador não pôde ser lido; o exemplo foi carregado.'); }
  renderMenubar();
  SEL = PROJ.circuitos[0]?.id || null;
  try { irPara(ABAS.includes(t) ? t : 'circuitos'); }
  catch (e) { console.error(e); const m = document.querySelector('main'); if (m) m.insertAdjacentHTML('afterbegin', `<p class="banner">Erro ao abrir a página: ${esc(e.message)}. Recarregue a página.</p>`); }
})();

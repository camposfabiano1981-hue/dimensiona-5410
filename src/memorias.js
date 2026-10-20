/* ================================================================
   MEMÓRIAS DE CÁLCULO — documentos separados e relatório consolidado
   Cada memória é emitida sozinha ou agrupada, em partes A, B, C…,
   num único relatório com sumário e uma assinatura final.
   ================================================================ */
const MEMORIAS = [
  { id: 'circuitos', nome: 'Condutores e proteção dos circuitos', norma: 'ABNT NBR 5410:2004', arq: 'memoria-circuitos', titulo: 'Memória de cálculo — condutores e proteção', rodape: 'Memória de cálculo conforme ABNT NBR 5410:2004',
    tem: p => p.circuitos.length > 0, resumo: (p, k) => { const nf = p.circuitos.filter(c => k.res[c.id].status === 'fail').length; return `${p.circuitos.length} circuitos${nf ? ` · ${nf} com pendência` : ''}`; },
    falha: (p, k) => p.circuitos.some(c => k.res[c.id].status === 'fail'), build: (p, k, o) => construirMemorial(p, k, { ...o, parte: 'circuitos' }) },
  { id: 'eletrodutos', nome: 'Eletrodutos', norma: 'ABNT NBR 5410:2004 — 6.2.11', arq: 'memoria-eletrodutos', titulo: 'Memória de cálculo — eletrodutos', rodape: 'Dimensionamento de eletrodutos conforme ABNT NBR 5410:2004',
    tem: (p, k) => trechosEletroduto(k).length > 0, resumo: (p, k) => `${trechosEletroduto(k).length} trecho(s)`,
    falha: (p, k) => trechosEletroduto(k).some(t => t.aplica && t.falhas.length), build: (p, k, o) => construirMemorial(p, k, { ...o, parte: 'eletrodutos' }) },
  { id: 'calhas', nome: 'Eletrocalhas, perfilados, bandejas e leitos', norma: 'ABNT NBR 5410:2004 · NBR IEC 61537', arq: 'memoria-eletrocalhas', titulo: 'Memória de cálculo — eletrocalhas', rodape: 'Dimensionamento de eletrocalhas conforme ABNT NBR 5410:2004 e NBR IEC 61537',
    tem: (p, k) => Object.keys(k.calhas || {}).length > 0, resumo: (p, k) => `${Object.keys(k.calhas || {}).length} trecho(s)`,
    falha: (p, k) => Object.values(k.calhas || {}).some(t => t.status === 'fail'), build: (p, k, o) => construirMemorial(p, k, { ...o, parte: 'calhas' }) },
  { id: 'quadros', nome: 'Quadros de carga e demanda', norma: 'ABNT NBR 5410:2004', arq: 'memoria-quadros', titulo: 'Memória de cálculo — quadros de carga', rodape: 'Quadros de carga conforme ABNT NBR 5410:2004',
    tem: (p, k) => Object.values(k.quadros).some(q => q.cs.length), resumo: (p, k) => `${Object.keys(k.quadros).length} quadro(s)`, falha: () => false,
    build: (p, k, o) => construirMemorial(p, k, { ...o, parte: 'quadros' }) },
  { id: 'lumi', nome: 'Cálculo luminotécnico', norma: 'ABNT NBR ISO/CIE 8995-1:2013', arq: 'relatorio-luminotecnico', titulo: 'Relatório luminotécnico', rodape: 'Relatório luminotécnico conforme ABNT NBR ISO/CIE 8995-1:2013',
    tem: p => (p.lumi || []).length > 0, resumo: (p, k) => { const nf = p.lumi.filter(a => k.lumi[a.id].status === 'fail').length; return `${p.lumi.length} ambiente(s)${nf ? ` · ${nf} com pendência` : ''}`; },
    falha: (p, k) => (p.lumi || []).some(a => k.lumi[a.id].status === 'fail'), build: (p, k) => construirRelatorioLumi(p, k) },
  { id: 'energisa', nome: 'Demanda do padrão de entrada', norma: 'Energisa NDU 001 v7.0 / NDU 003 v8.1', arq: 'memorial-demanda-energisa', titulo: 'Memorial de cálculo de demanda',
    rodape: p => `Cálculo de demanda conforme Energisa ${p.energisa.modo === 'individual' ? 'NDU 001 v7.0' : 'NDU 001 v7.0 e NDU 003 v8.1'}`,
    tem: p => (p.energisa.ucs || []).length > 0, resumo: p => `${p.energisa.ucs.length} UC · ${MODOS_E[p.energisa.modo]}`, falha: (p, k) => k.energisa.status === 'fail',
    build: (p, k) => construirMemorialDemanda(p, k, k.energisa) },
  { id: 'clima', nome: 'Carga térmica de climatização', norma: 'ABNT NBR 16401-1:2024 · 16401-2:2024 · 16401-3:2008', arq: 'memorial-carga-termica', titulo: 'Memorial de cálculo de carga térmica', rodape: 'Carga térmica conforme ABNT NBR 16401-1:2024, NBR 16401-2:2024 e NBR 16401-3:2008',
    tem: p => (p.clima.amb || []).length > 0, resumo: p => `${p.clima.amb.length} ambiente(s)`, falha: (p, k) => Object.values(k.clima.amb).some(r => r.status === 'fail'),
    build: (p, k) => construirMemorialClima(p, k, k.clima) },
  { id: 'aterr', nome: 'Aterramento', norma: p => p.aterr.modo === 'completo' ? 'ABNT NBR 5410 · NBR 7117-1 · NBR 15751 · IEEE 80' : 'ABNT NBR 5410 · método simplificado de hastes', arq: 'memorial-aterramento', titulo: 'Memorial de cálculo de aterramento',
    rodape: p => p.aterr.modo === 'completo' ? 'Aterramento conforme ABNT NBR 5410:2004, NBR 7117-1:2020 e NBR 15751:2013' : 'Aterramento conforme ABNT NBR 5410:2004 — método simplificado de hastes',
    tem: p => (p.aterr.arr || []).length > 0, resumo: (p, k) => { const nf = p.aterr.arr.filter(a => k.aterr.arr[a.id].status === 'fail').length; return `${p.aterr.arr.length} sistema(s)${nf ? ` · ${nf} com pendência` : ''}`; },
    falha: (p, k) => k.aterr.status === 'fail', build: (p, k) => construirMemorialAterramento(p, k, k.aterr) },
  { id: 'materiais', nome: 'Lista de materiais', norma: 'Cadastro de materiais e normas de fabricação', arq: 'lista-de-materiais', titulo: 'Lista de materiais', rodape: 'Lista de materiais',
    tem: (p, k) => (k.materiais || calcMateriais(p, k)).lista.length > 0, resumo: (p, k) => `${(k.materiais || calcMateriais(p, k)).lista.length} itens`, falha: () => false,
    build: (p, k, o) => construirListaMateriais(p, k, o) }
];
const MEMO = Object.fromEntries(MEMORIAS.map(m => [m.id, m]));
const normaDe = (m, p) => typeof m.norma === 'function' ? m.norma(p) : m.norma;
const assinaturaRT = I => ({ t: 'sign', place: [I.cidade, dataExtenso(I.data)].filter(Boolean).join(', '), name: I.responsavel || 'Responsável técnico', reg: [I.registro, I.art ? 'ART ' + I.art : ''].filter(Boolean).join(' — ') });
const prefixoParte = (t, L) => /^\d/.test(t) ? `${L}.${t}` : `${L} — ${t}`;

function construirConsolidado(proj, calc, ids, opt = {}) {
  const I = proj.info, B = [], partes = MEMORIAS.filter(m => ids.includes(m.id) && m.tem(proj, calc));
  const nomes = partes.map(p => p.nome.toLowerCase());
  B.push({ t: 'title', kicker: 'Projeto de instalações elétricas — memórias de cálculo', text: 'Memorial de cálculo consolidado',
    sub: nomes.length ? (nomes.length > 1 ? nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1] : nomes[0]).replace(/^./, c => c.toUpperCase()) : 'Nenhuma memória selecionada' });
  B.push({ t: 'meta', rows: [['Obra', I.obra || '—'], ['Proprietário / cliente', I.cliente || '—'], ['Endereço', [I.endereco, I.cidade].filter(Boolean).join(' — ') || '—'],
    ['Responsável técnico', [I.responsavel, I.registro].filter(Boolean).join(' — ') || '—'], ['ART / TRT / RRT', I.art || '—'], ['Data / revisão', `${dataCurta(I.data) || '—'} — ${I.revisao || 'R00'}`]] });
  B.push({ t: 'h1', text: 'Sumário' });
  B.push({ t: 'table', head: ['Parte', 'Memória de cálculo', 'Referência normativa', 'Conteúdo'], widths: [9, 33, 34, 24], align: 'llll',
    rows: partes.map((p, i) => [String.fromCharCode(65 + i), p.nome, normaDe(p, proj), p.resumo(proj, calc)]) });
  B.push({ t: 'p', text: 'Cada parte reúne a memória de cálculo completa da respectiva disciplina, com numeração própria precedida da letra da parte. As partes também podem ser emitidas separadamente.' });
  anexarPartes(B, partes, 'PARTE', proj, calc, opt);
  if (opt.assinatura !== false) { B.push({ t: 'h1', text: 'Responsabilidade técnica' }); B.push({ t: 'p', text: `Declaro que as memórias de cálculo das partes ${partes.map((_, i) => String.fromCharCode(65 + i)).join(', ')} deste documento foram elaboradas sob minha responsabilidade técnica.` }); B.push(assinaturaRT(I)); }
  return B;
}
function metaMemoria(proj, id) {
  const I = proj.info, m = MEMO[id], t = m ? m.titulo : id === 'descritivo' ? 'Memorial descritivo' : 'Memorial de cálculo consolidado';
  const rod = m ? (typeof m.rodape === 'function' ? m.rodape(proj) : m.rodape) : id === 'descritivo' ? 'Memorial descritivo das instalações elétricas — ABNT NBR 5410:2004' : 'Memorial de cálculo consolidado';
  return { titulo: `${t} — ${I.obra || 'projeto'}`, cabecalho: `${t} — ${I.obra || 'projeto'}`.slice(0, 95), direita: `${I.revisao || 'R00'} · ${dataCurta(I.data)}`, rodape: rod + ' — gerado com Dimensiona 5410', assunto: m ? `${t} — ${normaDe(m, proj)}` : t };
}
function docMemoria(proj, calc, id, opt = {}, grupo) {
  const rev = (proj.info.revisao || 'R00').toLowerCase(), sl = slugTxt(proj.info.obra);
  if (id === 'descritivo') return { blocos: construirMemorialDescritivo(proj, calc, grupo || [], opt), nome: `memorial-descritivo-${sl}-${rev}`, meta: metaMemoria(proj, id) };
  if (id === 'consolidado') return { blocos: construirConsolidado(proj, calc, grupo || MEMORIAS.map(m => m.id), opt), nome: `memorial-consolidado-${sl}-${rev}`, meta: metaMemoria(proj, id) };
  const m = MEMO[id] || MEMO.circuitos;
  let blocos = m.build(proj, calc, opt);
  if (opt.assinatura === false) blocos = blocos.filter(b => b.t !== 'sign' || b.titular);
  return { blocos, nome: `${m.arq}-${sl}-${rev}`, meta: metaMemoria(proj, m.id) };
}
function slugTxt(t) { return (t || 'projeto').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 50) || 'projeto'; }

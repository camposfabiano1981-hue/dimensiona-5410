// Testes do motor de cálculo (sem navegador): node --test test/
// Carrega os módulos de src/ num contexto isolado e confere o projeto de exemplo
// contra valores verificados à mão e contra casos de referência das normas.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), vm = require('vm');

const SRC = path.join(__dirname, '..', 'src');
const MODULOS = ['tables', 'engine', 'calhas', 'lumi', 'energisa', 'clima', 'aterr', 'materiais', 'pictos', 'sample', 'memorial', 'lumidoc', 'energisadoc', 'climadoc', 'aterrdoc', 'descritivo', 'memorias', 'export'];
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(MODULOS.map(f => fs.readFileSync(path.join(SRC, f + '.js'), 'utf8')).join('\n') + `
this.api = { projetoExemplo, calcularProjeto, calcEnergisa, calcClima, pmvPPD, propsCons, conducaoPeriodica, consPadrao, irradiancia, climaPadrao,
  WdeTBU, URdeW, pAtm, calcAterramento, calcSolo, calcMalha, arrPadrao, reqHastes, rHaste, rhoApar2c, MEMORIAS, docMemoria, calcMateriais, INFLUENCIAS };`, ctx);
const A = ctx.api;

const P = A.projetoExemplo();
const K = A.calcularProjeto(P);
const E = A.calcEnergisa(P);
const C = A.calcClima(P, K);
K.energisa = E; K.clima = C;
const T = A.calcAterramento(P, K); K.aterr = T;
const MT = A.calcMateriais(P, K); K.materiais = MT;
const perto = (v, ref, tol, msg) => assert.ok(Math.abs(v - ref) <= tol, `${msg}: ${v} ≠ ${ref} ± ${tol}`);

test('NBR 5410 — circuitos do exemplo dimensionados sem falhas', () => {
  const esperado = { 1: [1.5, 10], 2: [1.5, 10], 3: [2.5, 16], 4: [4, 16], 5: [4, 16], 6: [4, 25], 7: [10, 40], 8: [2.5, 10], 9: [4, 16], 10: [2.5, 10], 11: [1.5, 10], 12: [2.5, 10], 'AL-1': [16, 63] };
  for (const c of P.circuitos) {
    const r = K.res[c.id];
    assert.equal(r.status, 'ok', `circuito ${c.num}: ${r.falhas.concat(r.avisos).join(' | ')}`);
    assert.deepEqual([r.Sf, r.In], esperado[c.num], `circuito ${c.num}: seção / disjuntor`);
    assert.ok(r.IB <= r.In && r.In <= r.Iz, `circuito ${c.num}: IB ≤ In ≤ Iz`);
  }
});

test('Luminotécnica — iluminância mantida atende a NBR ISO/CIE 8995-1', () => {
  for (const a of P.lumi) {
    const r = K.lumi[a.id];
    assert.ok(r.okEm, `${a.nome}: Em ${r.Emed} < ${r.Em}`);
    assert.notEqual(r.status, 'fail', a.nome);
  }
});

test('Energisa NDU 001 — demanda e categoria da UC de exemplo', () => {
  const u = Object.values(E.ucs)[0];
  perto(u.C, 23.688, 0.001, 'carga instalada (kW)');
  perto(u.D, 20.108, 0.01, 'demanda (kVA)');
  assert.equal(u.cat.cat, 'T3');
  assert.equal(u.cat.disj, '70');
});

test('Conforto — PMV/PPD reproduz os exemplos da ISO 7730 (Anexo D)', () => {
  // ta = tr = 22 °C, var 0,10 m/s, UR 60 %, 1,2 met, 0,5 clo → PMV −0,75, PPD 17 %
  const a = A.pmvPPD(22, 22, 0.1, 60, 1.2, 0.5);
  perto(a.pmv, -0.75, 0.02, 'PMV');
  perto(a.ppd, 17, 0.5, 'PPD');
  // ta = tr = 27 °C, var 0,10 m/s, UR 60 %, 1,2 met, 0,5 clo → PMV +0,77
  perto(A.pmvPPD(27, 27, 0.1, 60, 1.2, 0.5).pmv, 0.77, 0.02, 'PMV');
});

test('Componentes — U, capacidade térmica e regime permanente da condução', () => {
  const cons = A.consPadrao(), por = id => cons.find(k => k.id === id);
  const p = A.propsCons({ ...por('pTij6'), tipo: 'parede' });
  perto(p.U, 2.47, 0.01, 'U parede de bloco cerâmico (W/m²K)');
  perto(p.CT, 159, 1, 'CT parede de bloco cerâmico (kJ/m²K)');
  perto(A.propsCons(por('cTelhaLaje')).U, 2.00, 0.01, 'U telhado + laje');
  // temperatura externa constante: o fluxo periódico tem de convergir para U·ΔT
  const q = A.conducaoPeriodica({ ...por('pConc'), tipo: 'parede' }, Array(24).fill(34), 24).q;
  const U = A.propsCons({ ...por('pConc'), tipo: 'parede' }).U;
  q.forEach(v => perto(v, U * 10, 0.05, 'q permanente'));
});

test('Psicrometria — ar externo de projeto (TBS 34 °C / TBU 24 °C, 530 m)', () => {
  const p = A.pAtm(530), W = A.WdeTBU(34, 24, p);
  perto(W, 0.0159, 0.0002, 'umidade absoluta (kg/kg)');
  perto(A.URdeW(34, W, p), 44.6, 0.5, 'umidade relativa (%)');
});

test('Solar — irradiância horizontal ao meio-dia de janeiro em Campo Grande', () => {
  const I = A.irradiancia(A.climaPadrao(), 'H', 12);
  perto(I.ED + I.Ed, 1151, 15, 'irradiância global horizontal (W/m²)');
});

test('Carga térmica — ambientes do exemplo e equipamentos indicados', () => {
  const esperado = { 'Suíte': [2366, 9000], 'Sala de estar': [2736, 12000], 'Escritório (home office)': [2234, 9000] };
  for (const a of P.clima.amb) {
    const r = C.amb[a.id];
    perto(r.Q, esperado[a.nome][0], 5, `${a.nome}: carga de pico (W)`);
    assert.equal(r.equip.cap, esperado[a.nome][1], `${a.nome}: capacidade (BTU/h)`);
    assert.ok(r.BTU <= r.equip.n * r.equip.cap, `${a.nome}: equipamento cobre a carga com margem`);
  }
  assert.ok(C.confOK, 'conforto térmico atendido');
  perto(C.conf.pmv, -0.31, 0.01, 'PMV do exemplo');
});

test('Aterramento — haste e conjunto de hastes (Kindermann)', () => {
  perto(A.rHaste(100, 2.4, 0.0173), 41.90, 0.01, 'haste de 2,4 m × 17,3 mm em 100 Ω·m');
  const q = A.reqHastes(100, 2.4, 0.0127, [[0, 0], [3, 0], [6, 0]]);
  perto(q.Req, 17.38, 0.01, '3 hastes alinhadas a 3 m (Ω)');
  perto(q.Req / q.R1, 0.395, 0.002, 'índice de redução K');
});

test('Aterramento — malha reproduz o exemplo 1 do anexo B da IEEE Std 80-2013', () => {
  // 70 × 70 m, 11 × 11 condutores (D = 7 m), h = 0,5 m, d = 10 mm, sem hastes, ρ = 400 Ω·m, 3I0 = 3180 A, Sf = 0,6, ts = 0,5 s, brita 2500 Ω·m × 0,102 m, 70 kg
  const a = Object.assign(A.arrPadrao('malha', 'subestacao'), { Lx: 70, Ly: 70, Nx: 11, Ny: 11, hc: 0.5, S: 61.5, posH: 'nenhuma', I3I0: 3180, sf: 60, xr: 0, tf: 0.5, rhoS: 2500, hs: 0.102, peso: 70, tc: 0.5 });
  const r = { avisos: [], falhas: [] }; A.calcMalha(a, 400, r);
  perto(r.R, 2.78, 0.01, 'Rg (Sverak)'); perto(r.IG, 1908, 1, 'IG'); perto(r.Cs, 0.74, 0.005, 'Cs');
  perto(r.Etoque, 838, 4, 'Etoque 70 kg'); perto(r.Km, 0.89, 0.005, 'Km'); perto(r.Ki, 2.272, 0.001, 'Ki'); perto(r.Em, 1002, 2, 'Em');
  assert.equal(r.okToque, false, 'o exemplo 1 da IEEE 80 não atende ao toque');
});

test('Aterramento — estratificação do solo em duas camadas recupera o modelo', () => {
  const med = [1, 2, 4, 8, 16].map(a => ({ dir: 'A', a, R: A.rhoApar2c(a, 600, 150, 2.5) / (2 * Math.PI * a) }));
  const s = A.calcSolo({ modo: 'wenner', p: 0, media: 'geo', descartar: true, modelo: '2c', fs: 1, med });
  perto(s.m2.rho1, 600, 6, 'ρ1'); perto(s.m2.rho2, 150, 2, 'ρ2'); perto(s.m2.h, 2.5, 0.05, 'h1');
});

test('Aterramento — modo simplificado do exemplo (hastes)', () => {
  assert.equal(T.simples, true);
  const ent = T.arr[P.aterr.arr[0].id];
  assert.ok(ent.R <= 20 && ent.status !== 'fail', `padrão de entrada ${ent.R} Ω`);
  assert.equal(ent.nMin, 4, 'mínimo de hastes alinhadas para 20 Ω');
  assert.equal(ent.serie[3].R.toFixed(6), ent.R.toFixed(6), 'série de hastes coerente com o arranjo adotado');
  assert.ok(ent.materiais.some(m => /Haste/.test(m[0]) && m[1] === 4), 'lista de materiais com 4 hastes');
  perto(ent.Lcabo, 7.2, 1e-9, 'cabo de interligação (m)');
});

test('Aterramento — valor típico pelo tipo de solo e exclusão de malha no modo simplificado', () => {
  const p2 = JSON.parse(JSON.stringify(P));
  p2.aterr.solo = { ...p2.aterr.solo, modo: 'tipico', tipoSolo: 'argila20' };
  p2.aterr.arr.push(Object.assign(A.arrPadrao('malha', 'subestacao'), { id: 'm1' }));
  const t = A.calcAterramento(p2, K);
  assert.equal(t.solo.rho, 330);
  assert.equal(t.arr.m1.excluido, true, 'malha fica fora do modo simplificado');
  p2.aterr.modo = 'completo';
  assert.ok(A.calcAterramento(p2, K).arr.m1.R > 0, 'no modo completo a malha é calculada');
});

test('Materiais — quantitativo automático coerente com o projeto', () => {
  const soma = re => MT.lista.filter(x => re.test(x.desc)).reduce((s, x) => s + x.qtd, 0);
  const nDisj = P.circuitos.filter(c => c.dispositivo !== 'fus_gG').length;
  assert.equal(soma(/^Disjuntor termomagnético \d/), nDisj, 'um disjuntor por circuito');
  assert.equal(soma(/^Interruptor diferencial/), P.circuitos.filter(c => K.res[c.id].drUsado).length, 'um DR por circuito com DR');
  // condutores: comprimento × número de condutores × (1 + acréscimo), arredondado para cima por item
  const esperado = P.circuitos.reduce((s, c) => s + (+c.L) * K.res[c.id].cabos.length, 0) * 1.1;
  const cabos = MT.lista.filter(x => x.cat === 'cond').reduce((s, x) => s + x.qtd, 0);
  assert.ok(cabos >= esperado - 1e-9 && cabos <= esperado + MT.lista.filter(x => x.cat === 'cond').length, `metros de condutores ${cabos} × ${esperado}`);
  assert.ok(MT.lista.some(x => /Haste de aterramento/.test(x.desc) && x.qtd === 4), 'hastes do aterramento');
  assert.ok(MT.lista.every(x => x.cat !== 'cond' || /NBR/.test(x.norma)), 'condutores com norma de fabricação');
  assert.ok(MT.lista.some(x => !x.auto && /Tomada 2P\+T 10 A/.test(x.desc)), 'itens escolhidos no cadastro entram na lista');
});

test('Memorial descritivo — influências externas, materiais e anexos escolhidos', () => {
  const opt = { metodologia: true, detalhe: true, anexo33: true, assinatura: true };
  const B = A.docMemoria(P, K, 'descritivo', opt, ['circuitos', 'aterr', 'materiais']).blocos;
  const txt = JSON.stringify(B.map(b => ({ ...b, svg: undefined })));
  assert.ok(!/NaN|undefined|Infinity/.test(txt), 'valor inválido no texto');
  const inf = B.find(b => b.t === 'table' && b.head[0] === 'Código');
  assert.equal(inf.rows.length, A.INFLUENCIAS.length, 'todas as influências externas classificadas');
  const anexos = B.filter(b => b.t === 'parte');
  assert.deepEqual(Array.from(anexos, b => b.rotulo + ' ' + b.letra + ' ' + b.text), ['ANEXO A Condutores e proteção dos circuitos', 'ANEXO B Aterramento', 'ANEXO C Lista de materiais']);
  assert.ok(/ABNT NBR NM 247-3/.test(txt) && /ABNT NBR IEC 61643-11/.test(txt), 'normas de fabricação citadas');
  assert.equal(B.filter(b => b.t === 'sign' && !b.titular).length, 1, 'uma assinatura do responsável técnico');
});

test('Memoriais — cada memória separada e o consolidado são montados sem erro', () => {
  const opt = { metodologia: true, detalhe: true, anexo33: true, assinatura: true };
  const docs = Object.fromEntries(A.MEMORIAS.map(m => [m.id, A.docMemoria(P, K, m.id, opt).blocos]));
  docs.consolidado = A.docMemoria(P, K, 'consolidado', opt, A.MEMORIAS.map(m => m.id)).blocos;
  for (const [nome, B] of Object.entries(docs)) {
    assert.ok(Array.isArray(B) && B.length > 15, `${nome}: documento vazio`);
    assert.equal(B[0].t, 'title', `${nome}: começa pelo bloco de título`);
    assert.ok(!JSON.stringify(B.map(b => ({ ...b, svg: undefined }))).match(/NaN|undefined|Infinity/), `${nome}: valor inválido no texto`);
  }
  const partes = docs.consolidado.filter(b => b.t === 'parte');
  assert.equal(partes.length, A.MEMORIAS.length, 'uma parte por memória');
  assert.equal(docs.consolidado.filter(b => b.t === 'sign' && !b.titular).length, 1, 'uma única assinatura do responsável técnico');
  assert.ok(docs.consolidado.some(b => b.t === 'h1' && b.text.startsWith('H.')), 'numeração prefixada pela letra da parte');
});

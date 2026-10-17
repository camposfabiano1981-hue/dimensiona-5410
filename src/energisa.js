/* ================================================================
   DEMANDA — GRUPO ENERGISA
   NDU 001 v7.0 (nov/2024): edificações individuais em tensão secundária, até 75 kW
   NDU 003 v8.1 (nov/2024): agrupamentos e edificações de múltiplas unidades consumidoras
   ================================================================ */
const NDU001_VER = 'NDU 001 — versão 7.0, novembro/2024 (vigência 01/11/2024)';
const NDU003_VER = 'NDU 003 — versão 8.1, novembro/2024 (vigência 01/11/2024)';
const ENERGISA_UN = { EMS: 'Energisa Mato Grosso do Sul', EMT: 'Energisa Mato Grosso', ETO: 'Energisa Tocantins', EPB: 'Energisa Paraíba', ESE: 'Energisa Sergipe', ERO: 'Energisa Rondônia', EAC: 'Energisa Acre', EMR: 'Energisa Minas Rio', ESS: 'Energisa Sul Sudeste' };
/* tensões com tabela de categorias implementada (Tabela 16 vale para EAC, EMR, EMS, EMT, ERO, ESE e ESS; Tabela 21 para a rede monofásica de EMS, EMT, ESE e ESS) */
const ENERGISA_TENSOES = {
  '220/127': { nome: '220/127 V — rede trifásica (Tabela 16)', tab: 16, un: ['EAC', 'EMR', 'EMS', 'EMT', 'ERO', 'ESE', 'ESS'] },
  '254/127': { nome: '254/127 V — rede monofásica, áreas rurais (Tabela 21)', tab: 21, un: ['EMS', 'EMT', 'ESE', 'ESS'] }
};
const CLASSES_UC = { residencial: 'Residencial', comercial: 'Comercial, serviços e outras atividades', industrial: 'Industrial', rural: 'Rural', poder_publico: 'Poder público', servico_publico: 'Serviço público', iluminacao_publica: 'Iluminação pública', proprio: 'Consumo próprio' };
/* Tabela 5 — iluminação e tomadas de uso geral */
const ATIV_T5 = {
  residencia: { nome: 'Residência', faixas: [[1, 86], [1, 75], [1, 66], [1, 59], [1, 52], [1, 45], [1, 40], [1, 35], [1, 31], [1, 27], [Infinity, 24]] },
  restaurante: { nome: 'Restaurante e similares', faixas: [[Infinity, 86]] },
  loja: { nome: 'Loja e similares', faixas: [[Infinity, 86]] },
  igreja: { nome: 'Igreja e similares', faixas: [[Infinity, 86]] },
  hospital: { nome: 'Hospital e similares', faixas: [[50, 40], [Infinity, 50]] },
  hotel: { nome: 'Hotel e similares', faixas: [[20, 50], [80, 40], [Infinity, 30]] },
  area_comum: { nome: 'Área comum, áreas de serviço, garagem e similares', faixas: [[Infinity, 86]] },
  escritorio: { nome: 'Escritório', faixas: [[20, 86], [Infinity, 70]] },
  escola: { nome: 'Escola e similares', faixas: [[12, 86], [Infinity, 50]] },
  clube: { nome: 'Clube e similares', faixas: [[Infinity, 86]] },
  barbearia: { nome: 'Barbearia, salão de beleza e similares', faixas: [[Infinity, 86]] },
  banco: { nome: 'Banco e similares', faixas: [[Infinity, 86]] },
  canteiro: { nome: 'Canteiro de obras e similares', faixas: [[Infinity, 86]] },
  auditorio: { nome: 'Auditório, salão de exposição e similares', faixas: [[Infinity, 86]] },
  quartel: { nome: 'Quartel e similares', faixas: [[15, 100], [Infinity, 40]] }
};
const FD_T6 = [100, 75, 70, 66, 62, 59, 56, 53, 51, 49, 47, 45, 43, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31];
const fdT6 = n => n <= 0 ? 0 : (n <= 24 ? FD_T6[n - 1] : 30);
const fdT7 = n => n <= 0 ? 0 : n === 1 ? 100 : n <= 4 ? 70 : n <= 6 ? 60 : n <= 9 ? 50 : 45;
const FD_T8 = [100, 60, 48, 40, 37, 35, 33, 32, 31];
const fdT8 = n => n <= 0 ? 0 : n <= 9 ? FD_T8[n - 1] : n <= 11 ? 30 : n <= 15 ? 28 : n <= 20 ? 27 : n <= 25 ? 26 : 25;
const FD_T10 = [100, 88, 82, 78, 76, 74, 72, 71];
const fdT10 = n => n <= 0 ? 0 : n <= 8 ? FD_T10[n - 1] : n <= 11 ? 70 : n <= 14 ? 68 : n <= 16 ? 67 : n <= 22 ? 66 : n <= 30 ? 65 : n <= 50 ? 64 : 62;
const fdT11 = n => n <= 0 ? 0 : n <= 10 ? 100 : n <= 20 ? 90 : n <= 30 ? 82 : n <= 40 ? 80 : n <= 50 ? 77 : 75;
/* Tabela 9 — ar-condicionado: BTU/h → potência (W) [janela, split] */
const T9_AR = { 5000: [625, null], 6000: [760, null], 7000: [null, 740], 7100: [900, null], 8500: [1300, null], 9000: [null, 990], 10000: [1400, null], 12000: [1600, 1260], 14000: [1900, null], 15000: [2000, null], 18000: [2600, 2180], 21000: [2800, null], 22000: [null, 2430], 24000: [null, 2890], 30000: [3600, 3380], 36000: [null, 4195], 48000: [null, 4990], 60000: [null, 6710] };
/* Tabelas 12 e 13 — motores: cv → [kW absorvido, kVA, cos, η, I1, I2, demanda kVA com 1 / 2 / 3 a 5 / mais de 5 motores] */
const T12_MOT1 = { '0.333': [0.52, 0.74, 0.71, 0.47, 3.34, 1.93, 0.74, 0.59, 0.51, 0.44], '0.5': [0.66, 0.91, 0.72, 0.56, 4.15, 2.40, 0.91, 0.73, 0.64, 0.55], '0.75': [0.89, 1.24, 0.72, 0.62, 5.62, 3.25, 1.24, 0.99, 0.87, 0.74], '1': [1.10, 1.48, 0.74, 0.67, 6.75, 3.91, 1.48, 1.19, 1.04, 0.89], '1.5': [1.58, 1.92, 0.82, 0.70, 8.74, 5.06, 1.92, 1.54, 1.35, 1.15], '2': [2.07, 2.44, 0.85, 0.71, 11.09, 6.42, 2.44, 1.95, 1.71, 1.46], '3': [3.07, 3.19, 0.96, 0.72, 14.52, 8.41, 3.19, 2.56, 2.24, 1.92], '4': [3.98, 4.14, 0.96, 0.74, 18.84, 10.91, 4.14, 3.32, 2.90, 2.49], '5': [4.91, 5.22, 0.94, 0.75, 23.73, 13.74, 5.22, 4.18, 3.65, 3.13], '7.5': [7.46, 7.94, 0.94, 0.74, 36.07, 20.88, 7.94, 6.35, 5.55, 4.76], '10': [9.44, 10.04, 0.94, 0.78, 45.63, 26.42, 10.04, 8.03, 7.03, 6.02] };
const T13_MOT3 = { '0.167': [0.25, 0.37, 0.67, 0.49, 0.98, 0.57, 0.37, 0.30, 0.26, 0.22], '0.25': [0.34, 0.48, 0.69, 0.55, 1.27, 0.74, 0.48, 0.39, 0.34, 0.29], '0.333': [0.41, 0.55, 0.74, 0.60, 1.45, 0.84, 0.55, 0.44, 0.39, 0.33], '0.5': [0.57, 0.72, 0.79, 0.65, 1.88, 1.09, 0.72, 0.57, 0.50, 0.43], '0.667': [0.82, 1.08, 0.76, 0.67, 2.84, 1.65, 1.08, 0.87, 0.76, 0.65], '1': [1.13, 1.38, 0.82, 0.65, 3.62, 2.10, 1.38, 1.10, 0.97, 0.83], '1.5': [1.58, 2.02, 0.78, 0.70, 5.31, 3.07, 2.02, 1.62, 1.42, 1.21], '2': [1.94, 2.39, 0.81, 0.76, 6.28, 3.63, 2.39, 1.91, 1.67, 1.43], '3': [2.91, 3.63, 0.80, 0.76, 9.53, 5.52, 3.63, 2.91, 2.54, 2.18], '4': [3.82, 4.97, 0.77, 0.77, 13.03, 7.54, 4.97, 3.97, 3.48, 2.98], '5': [4.78, 5.62, 0.85, 0.77, 14.76, 8.54, 5.62, 4.50, 3.94, 3.37], '6': [5.45, 6.49, 0.84, 0.81, 17.03, 9.86, 6.49, 5.19, 4.54, 3.89], '7.5': [6.90, 8.12, 0.85, 0.80, 21.30, 12.33, 8.12, 6.49, 5.68, 4.87], '10': [9.68, 10.76, 0.90, 0.76, 28.24, 16.35, 10.76, 8.61, 7.53, 6.46], '12.5': [11.80, 12.04, 0.98, 0.78, 31.59, 18.29, 12.04, 9.63, 8.42, 7.22], '15': [13.63, 14.98, 0.91, 0.81, 39.31, 22.76, 14.98, 11.98, 10.48, 8.99], '20': [18.40, 20.67, 0.89, 0.80, 54.26, 31.41, 20.67, 16.54, 14.47, 12.40], '25': [22.44, 24.66, 0.91, 0.82, 64.71, 37.46, 24.66, 19.73, 17.26, 14.79], '30': [26.93, 29.59, 0.91, 0.82, 77.65, 44.96, 29.59, 23.67, 20.71, 17.75] };
const CV_TXT = { '0.167': '1/6', '0.25': '1/4', '0.333': '1/3', '0.5': '1/2', '0.667': '2/3', '0.75': '3/4', '1': '1', '1.5': '1 1/2', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7.5': '7 1/2', '10': '10', '12.5': '12 1/2', '15': '15', '20': '20', '25': '25', '30': '30' };
/* Tabela 4 — potência média de aparelhos (orientativa) [descrição, W, grupo sugerido] */
const T4_APAR = [
  ['Aparelho de Blu-ray', 12], ['Aparelho de DVD', 15], ['Aparelho de som', 110], ['Aquecedor de ambiente', 1612], ['Aquecedor de água por acumulação (boiler) 50 a 100 L', 1000, 'aquec'], ['Aquecedor de água por acumulação (boiler) 150 a 200 L', 1250, 'aquec'],
  ['Aquecedor de água por acumulação (boiler) 250 L', 1500, 'aquec'], ['Aquecedor de água por acumulação (boiler) 300 a 350 L', 2000, 'aquec'], ['Aquecedor de água por acumulação (boiler) 400 L', 2500, 'aquec'], ['Aquecedor de mamadeira', 100], ['Aquecedor de marmita', 60],
  ['Aspirador de pó', 717], ['Assadeira', 1000], ['Batedeira', 750], ['Bebedouro', 110], ['Bomba d’água 1 cv', 1051, 'mot1', 1], ['Bomba d’água 1/2 cv', 613, 'mot1', 0.5], ['Bomba d’água 1/4 cv', 335], ['Bomba d’água 3/4 cv', 849, 'mot1', 0.75],
  ['Cafeteira elétrica', 219], ['Cafeteira expresso', 794], ['Carregador lento — veículo elétrico', 3300, 'simult'], ['Chaleira elétrica', 941], ['Chuveiro elétrico', 6600, 'aquec'], ['Computador', 300], ['Enceradeira', 450], ['Espremedor de frutas', 54],
  ['Estabilizador', 1400], ['Exaustor para fogão', 160], ['Ferro elétrico automático a seco', 1050], ['Ferro elétrico automático a vapor', 1200], ['Fogão elétrico — cooktop de indução', 7000, 'fogao'], ['Forno elétrico embutido 50 L', 2422, 'fogao'],
  ['Forno micro-ondas 25 L', 1398, 'secad'], ['Freezer vertical frost free', 75], ['Freezer vertical/horizontal', 66], ['Frigobar', 26], ['Fritadeira elétrica', 1500], ['Furadeira', 235], ['Geladeira frost free 342 L', 55], ['Geladeira frost free 443 L', 118],
  ['Grill', 1600], ['Home theater', 350], ['Impressora', 15], ['Lavadora de louças', 1543, 'secad'], ['Lavadora de roupas 15 kg', 2280], ['Liquidificador', 1200], ['Monitor LCD', 37], ['Notebook', 30], ['Panela elétrica', 1100], ['Pipoqueira residencial', 1200],
  ['Prancha (chapinha)', 33], ['Projetor', 345], ['Purificador de ar', 66], ['Roteador', 7], ['Sanduicheira', 1000], ['Secador de cabelo', 2120], ['Televisor LCD', 217], ['Televisor LED', 112], ['Triturador de lixo', 1214], ['Ventilador', 250], ['Videogame', 120]
];
const GRUPOS_CARGA = {
  ilum: { nome: 'Iluminação, tomadas e pequenos aparelhos (d1 — Tab. 5)', un: 'W', d: 'd1' },
  simult: { nome: 'Carga de uso simultâneo — FD 100 % (d1 — Tab. 5, nota I)', un: 'W', d: 'd1' },
  aquec: { nome: 'Aquecimento de água: chuveiro, torneira, aquecedor (d2 — Tab. 6)', un: 'W', d: 'd2' },
  secad: { nome: 'Secadora, lava-louças, micro-ondas, hidromassagem (d3 — Tab. 7)', un: 'W', d: 'd3' },
  fogao: { nome: 'Fogões e fornos elétricos (d4 — Tab. 8)', un: 'W', d: 'd4' },
  arj: { nome: 'Ar-condicionado janela/split (d5 — Tab. 9, 10 e 11)', un: 'BTU/h', d: 'd5' },
  arc: { nome: 'Ar-condicionado central — FD 100 % (d5 — nota I)', un: 'W', d: 'd5' },
  mot1: { nome: 'Motor monofásico (d6 — Tab. 12)', un: 'cv', d: 'd6' },
  mot3: { nome: 'Motor trifásico ou solda motor-gerador (d6 — Tab. 13)', un: 'cv', d: 'd6' },
  solda: { nome: 'Solda a arco a transformador, galvanização (d7 — Tab. 14)', un: 'kVA', d: 'd7' },
  soldaR: { nome: 'Solda a resistência (d7 — Tab. 14)', un: 'kVA', d: 'd7' },
  raiox: { nome: 'Aparelho de raios X (d7 — Tab. 14)', un: 'kVA', d: 'd7' }
};
/* Tabelas 16 e 21 — categorias de atendimento
   [cat, fios, fases, base ('C' kW | 'D' kVA), lim. inf., lim. sup., Al multiplex fase, Al concêntrico fase, Al neutro,
    Cu PVC fase, Cu PVC neutro, Cu XLPE fase, Cu XLPE neutro, aterramento ('F' = igual ao condutor fase), hastes, disjuntor, eletroduto,
    poste concreto duplo T (daN), poste aço galvanizado (daN), pontalete (daN), caixa]   [a, b] = embutido / subterrâneo */
const CAT_T16 = [
  ['M1', 2, 1, 'C', 0, 3.8, 10, 10, 10, 6, 6, 6, 6, 6, 1, '30/32', '3/4"', 100, 90, 75, 'CMI-01'],
  ['M2', 2, 1, 'C', 3.8, 6.3, 10, 10, 10, 10, 10, 6, 6, 'F', 1, '50', '3/4"', 100, 90, 75, 'CMI-01'],
  ['M3', 2, 1, 'C', 6.3, 8.8, 16, 16, 16, 16, 16, 10, 10, 'F', 1, '70', '1"', 100, 90, 75, 'CMI-01'],
  ['B1', 3, 2, 'C', 0, 10.1, 10, 10, 10, 10, 10, 10, 10, 10, 1, '50', '3/4"', 100, 90, 75, 'CMI-02'],
  ['B2', 3, 2, 'C', 10.1, 12.7, 16, null, 16, 16, 16, [10, 16], [10, 16], 'F', 1, '60/63', '1"', 100, 90, 75, 'CMI-02'],
  ['B3', 3, 2, 'C', 12.7, 17.7, 25, null, 25, 25, 25, [16, 25], [16, 25], 16, 1, '80', '1 1/4"', 100, 90, 75, 'CMI-02'],
  ['T1', 4, 3, 'D', 0, 15.2, 10, null, 10, 10, 10, [6, 10], [6, 10], 10, 3, '40', '3/4"', 100, 90, 75, 'CMI-02'],
  ['T2', 4, 3, 'D', 15.2, 19.0, 16, null, 16, 16, 16, 10, 10, 'F', 3, '50', '1"', 100, 90, 75, 'CMI-02'],
  ['T3', 4, 3, 'D', 19.0, 26.6, 25, null, 25, 25, 25, [16, 25], [16, 25], 16, 3, '70', '1 1/4"', 100, 200, 75, 'CMI-02'],
  ['T4', 4, 3, 'D', 26.6, 38.1, 35, null, 25, null, null, [25, 35], 25, 16, 3, '100', '1 1/2"', 200, 200, 75, 'CMI-02'],
  ['T5', 4, 3, 'D', 38.1, 57.1, 70, null, 35, null, null, [50, 70], [25, 35], [25, 35], 3, '150', '2"', 300, null, null, 'CMD-BT 200'],
  ['T6', 4, 3, 'D', 57.1, 81.5, 120, null, 70, null, null, 95, 50, 50, 3, '200', '2 1/2"', 300, null, null, 'CMD-BT 200']
];
const CAT_T21 = [
  ['M1', 3, 2, 'C', 0, 12.0, 10, 10, 10, 10, 10, 10, 10, 10, 1, '50', '3/4"', 100, 90, 75, 'CMI-01'],
  ['M2', 3, 2, 'C', 12.0, 15.0, 16, 16, 16, 16, 16, 10, 10, 'F', 1, '60', '1"', 100, 90, 75, 'CMI-01'],
  ['M3', 3, 2, 'C', 15.0, 25.0, 35, null, 25, 35, 25, 25, 25, 16, 1, '100', '1"', 100, 90, 75, 'CMI-01']
];
const catObj = a => ({ cat: a[0], fios: a[1], fases: a[2], base: a[3], lo: a[4], hi: a[5], mux: a[6], conc: a[7], nAl: a[8], pvcF: a[9], pvcN: a[10], xlpeF: a[11], xlpeN: a[12], aterr: a[13], hastes: a[14], disj: a[15], eletro: a[16], pConc: a[17], pAco: a[18], pont: a[19], caixa: a[20] });

function energisaPadrao() {
  return { un: 'EMS', tensao: '220/127', area: 'urbana', modo: 'individual', solicitacao: 'Ligação nova', municipio: '', uf: 'MS', coord: '', protocolo: '', obs: '',
    ucs: [ucPadrao(1)], conj: [], metodo003: 'ponderada', t003: { f: [], a: [], fonte: '' }, agrupDem: 'soma' };
}
function ucPadrao(i = 1) {
  return { id: uid(), nome: `UC ${String(i).padStart(2, '0')}`, papel: 'unidade', titular: '', doc: '', instalacao: '', complemento: '', classe: 'residencial', atividade: 'residencia',
    contato: '', atividadeDesc: '', area: null, ligacao: 'auto', req220: false, reqTri: false, simultaneo: false, isolacao: 'XLPE', instalacaoRamal: 'embutido', ramalCon: 'multiplex', cargas: [] };
}
function cargaPadrao(g = 'ilum') { return { g, desc: '', qtd: 1, W: null, cv: g === 'mot3' ? 1 : 0.5, btu: 12000, tipoAr: 'split', kva: null, vv: false }; }

const kvMot = (g, cv) => (g === 'mot1' ? T12_MOT1 : T13_MOT3)[String(+(+cv).toFixed(3))];
function arW(c) { const t = T9_AR[+c.btu]; const w = t ? (c.tipoAr === 'janela' ? t[0] : t[1]) : null; return +c.W > 0 ? +c.W : w; }

/* ---------- d1: faixas da Tabela 5 ---------- */
function d1Tab5(ativ, C, simultaneo) {
  const A = ATIV_T5[ativ] || ATIV_T5.residencia, lin = [];
  if (simultaneo) { lin.push({ de: 0, ate: C, kW: C, fd: 100, d: C }); return { d: C, lin }; }
  let rest = C, ini = 0, d = 0;
  for (const [larg, fd] of A.faixas) { if (rest <= 1e-12) break; const kW = Math.min(rest, larg); lin.push({ de: ini, ate: ini + kW, kW, fd, d: kW * fd / 100 }); d += kW * fd / 100; rest -= kW; ini += kW; }
  return { d, lin };
}

/* ---------- cálculo de uma unidade consumidora (NDU 001, item 9) ---------- */
function calcUC(u, E) {
  const r = { u, avisos: [], falhas: [], itens: [], d: {}, det: {} };
  const naoRes = u.atividade !== 'residencia';
  const G = {}; Object.keys(GRUPOS_CARGA).forEach(k => { G[k] = []; });
  (u.cargas || []).forEach((c, i) => {
    const q = Math.max(0, Math.round(+c.qtd || 0)); if (!q || !GRUPOS_CARGA[c.g]) return;
    const it = { i, g: c.g, desc: c.desc || GRUPOS_CARGA[c.g].nome.split(' (')[0], q };
    if (c.g === 'arj') { it.W = arW(c); it.ref = `${nfmt(+c.btu, 0)} BTU/h ${c.tipoAr}`; if (!(it.W > 0)) { r.falhas.push(`Ar-condicionado "${it.desc}": capacidade ${nfmt(+c.btu, 0)} BTU/h não consta da Tabela 9 para o tipo ${c.tipoAr} — informe a potência (W).`); it.W = 0; } it.kWu = it.W / 1000; }
    else if (c.g === 'mot1' || c.g === 'mot3') { const t = kvMot(c.g, c.cv); it.cv = +c.cv; it.ref = `${CV_TXT[String(+(+c.cv).toFixed(3))] || nfmt(+c.cv, 2)} cv`; if (!t) { r.falhas.push(`Motor "${it.desc}" de ${nfmt(+c.cv, 2)} cv fora da Tabela ${c.g === 'mot1' ? 12 : 13}: consultar a concessionária.`); it.kWu = 0; it.tab = null; } else { it.tab = t; it.kWu = t[0]; } }
    else if (c.g === 'solda' || c.g === 'soldaR' || c.g === 'raiox') { it.kva = (+c.kva || 0) * (c.vv && c.g === 'solda' ? 2 : 1); it.kWu = it.kva; it.ref = `${nfmt(+c.kva || 0, 2)} kVA${c.vv && c.g === 'solda' ? ' (V-V invertida: em dobro)' : ''}`; }
    else { it.W = +c.W || 0; it.kWu = it.W / 1000; if (!(it.W > 0)) r.avisos.push(`Carga "${it.desc}" sem potência informada.`); }
    it.kWt = it.kWu * q; r.itens.push(it); G[c.g].push(it);
  });
  const soma = g => G[g].reduce((s, x) => s + x.kWt, 0), qt = g => G[g].reduce((s, x) => s + x.q, 0);
  r.C = r.itens.reduce((s, x) => s + x.kWt, 0);
  // d1
  r.Cil = soma('ilum'); r.Csim = soma('simult');
  const t5 = d1Tab5(u.atividade, r.Cil, u.simultaneo); r.det.d1 = t5; r.d.d1 = t5.d + r.Csim;
  // d2, d3, d4
  [['d2', 'aquec', fdT6], ['d3', 'secad', fdT7], ['d4', 'fogao', fdT8]].forEach(([d, g, f]) => { const n = qt(g), P = soma(g), fd = f(n); r.det[d] = { n, P, fd }; r.d[d] = P * fd / 100; });
  // d5
  { const n = qt('arj'), P = soma('arj'), fd = naoRes ? fdT11(n) : fdT10(n), Pc = soma('arc'); r.det.d5 = { n, P, fd, tab: naoRes ? 11 : 10, Pc }; r.d.d5 = P * fd / 100 + Pc; }
  // d6 — demanda individual pelo número total de motores da instalação
  { const nM = qt('mot1') + qt('mot3'), col = nM <= 1 ? 6 : nM === 2 ? 7 : nM <= 5 ? 8 : 9; const lin = [];
    let d6 = 0; [...G.mot1, ...G.mot3].forEach(it => { if (!it.tab) return; const kva = it.tab[col], cos = it.tab[2], kw = kva * cos; d6 += kw * it.q; lin.push({ it, kva, cos, kw }); });
    r.det.d6 = { nM, col, colTxt: ['1 motor', '2 motores', '3 a 5 motores', 'mais de 5 motores'][col - 6], lin }; r.d.d6 = d6;
    r.cvMono = G.mot1.reduce((s, x) => s + (x.cv || 0) * x.q, 0); r.cvTri = G.mot3.reduce((s, x) => s + (x.cv || 0) * x.q, 0); r.cvMax3 = Math.max(0, ...G.mot3.map(x => x.cv || 0)); }
  // d7
  { const lin = []; let d7 = 0;
    const aplica = (g, fds, rot) => { const un = []; G[g].forEach(it => { for (let k = 0; k < it.q; k++) un.push({ it, P: it.kWu }); }); un.sort((a, b) => b.P - a.P); un.forEach((x, k) => { const fd = fds[Math.min(k, fds.length - 1)]; d7 += x.P * fd / 100; lin.push({ rot, desc: x.it.desc, P: x.P, fd, ord: k + 1 }); }); };
    aplica('solda', [100, 70, 40, 30], 'Solda a arco / galvanização'); aplica('soldaR', [100, 60], 'Solda a resistência'); aplica('raiox', [100, 70], 'Raios X');
    r.det.d7 = { lin }; r.d.d7 = d7; r.soldaMax = Math.max(0, ...G.solda.map(x => x.kWu), ...G.soldaR.map(x => x.kWu)); }
  r.DkW = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].reduce((s, k) => s + (r.d[k] || 0), 0);
  r.D = r.DkW / 0.92;
  r.FDglobal = r.C > 0 ? r.DkW / r.C : 0;
  enquadrarUC(r, u, E);
  r.status = r.falhas.length ? 'fail' : (r.avisos.length ? 'warn' : 'ok');
  return r;
}

/* ---------- enquadramento (item 6.5) e padrão de entrada (Tabelas 16 e 21) ---------- */
function enquadrarUC(r, u, E) {
  const ten = ENERGISA_TENSOES[E.tensao] || ENERGISA_TENSOES['220/127'];
  if (!ten.un.includes(E.un)) r.avisos.push(`A ${ENERGISA_UN[E.un] || E.un} não consta da relação de empresas da Tabela ${ten.tab}; confirme a tensão de fornecimento com a distribuidora.`);
  if (r.C > 75 + 1e-9) r.falhas.push(`Carga instalada de ${nfmt(r.C, 2)} kW acima de 75 kW: atendimento em tensão primária, com projeto conforme a NDU 002 (NDU 001, itens 1 e 7).`);
  const tabela = ten.tab === 21 ? CAT_T21 : CAT_T16; r.tabCat = ten.tab;
  let tipo;
  if (ten.tab === 21) {
    tipo = 'M';
    if (r.cvTri > 0) r.falhas.push('Rede monofásica 254/127 V: motores trifásicos não podem ser atendidos — consultar a concessionária.');
    if (r.cvMono > 12 + 1e-9) r.falhas.push(`Motores monofásicos somam ${nfmt(r.cvMono, 2)} cv: o atendimento a 254/127 V não admite motor monofásico acima de 12 cv.`);
    if (r.C > 25 + 1e-9) r.falhas.push(`Carga instalada de ${nfmt(r.C, 2)} kW acima de 25 kW (limite da Tabela 21).`);
  } else {
    const okM = r.C <= 8.8 + 1e-9 && !u.req220 && !u.reqTri && r.cvTri === 0 && r.cvMono <= 2 + 1e-9 && r.soldaMax <= 2 + 1e-9;
    const okB = r.C <= 17.7 + 1e-9 && !u.reqTri && r.cvTri === 0 && r.cvMono <= 5 + 1e-9 && r.soldaMax <= 8 + 1e-9;
    tipo = u.ligacao !== 'auto' ? u.ligacao : (okM ? 'M' : (okB ? 'B' : 'T'));
    if (tipo === 'M' && !okM) r.falhas.push('Tipo M (F+N, 127 V) não atende: carga instalada acima de 8,80 kW, motores monofásicos acima de 2 cv, solda acima de 2 kVA ou equipamentos que exigem duas ou três fases.');
    if (tipo === 'B' && !okB) r.falhas.push('Tipo B (2F+N) não atende: carga instalada acima de 17,70 kW, motores trifásicos, motores monofásicos 220 V acima de 5 cv ou solda acima de 8 kW.');
    if (tipo === 'T') {
      if (r.cvMono + r.cvTri > 30 + 1e-9) r.falhas.push(`Motores somam ${nfmt(r.cvMono + r.cvTri, 2)} cv: o tipo T não admite soma das potências dos motores superior a 30 cv.`);
      if (r.cvMax3 > 5 + 1e-9) r.avisos.push('Motores trifásicos acima de 5 cv devem ter partida compensada (estrela-triângulo, série-paralelo, chave compensadora ou eletrônica), conforme a Tabela 15.');
      if (r.D > 81.5 + 1e-9) r.falhas.push(`Demanda de ${nfmt(r.D, 2)} kVA acima de 81,5 kVA (limite da categoria T6): consultar a concessionária (NDU 002 / transformador exclusivo).`);
    }
    if (u.ligacao !== 'auto' && ((u.ligacao === 'B' && okM) || (u.ligacao === 'T' && okB))) r.avisos.push('Ligação acima da exigida pela carga: admitida pela distribuidora com custeio pelo consumidor da diferença do medidor e dos materiais (Tabela 16, nota XIII).');
  }
  r.tipo = tipo;
  const cand = tabela.map(catObj).filter(c => c.cat[0] === tipo);
  const val = cand.length && cand[0].base === 'D' ? r.D : r.C; r.baseVal = val; r.baseTxt = cand.length && cand[0].base === 'D' ? 'demanda calculada (kVA)' : 'carga instalada (kW)';
  const cat = cand.find(c => val <= c.hi + 1e-9) || null;
  r.cat = cat;
  if (!cat) { if (cand.length) r.falhas.push(`${r.baseTxt.charAt(0).toUpperCase() + r.baseTxt.slice(1)} de ${nfmt(val, 2)} acima do limite do tipo ${tipo} (${nfmt(cand[cand.length - 1].hi, 2)}).`); return; }
  // padrão: escolhas de isolação, instalação e ramal de conexão
  const sub = u.instalacaoRamal === 'subterraneo' ? 1 : 0, pick = v => Array.isArray(v) ? v[sub] : v;
  let isol = u.isolacao === 'PVC' ? 'PVC' : 'XLPE';
  if (isol === 'PVC' && cat.pvcF == null) { isol = 'XLPE'; r.avisos.push(`Categoria ${cat.cat}: isolação PVC não aplicável (N.A. na Tabela ${ten.tab}); adotado cabo com isolação XLPE/HEPR/EPR 90 °C.`); }
  const fF = pick(isol === 'PVC' ? cat.pvcF : cat.xlpeF), fN = pick(isol === 'PVC' ? cat.pvcN : cat.xlpeN);
  let ramal = u.ramalCon === 'concentrico' ? 'concentrico' : 'multiplex';
  if (ramal === 'concentrico' && cat.conc == null) { ramal = 'multiplex'; r.avisos.push(`Categoria ${cat.cat}: cabo concêntrico não aplicável; adotado ramal de conexão multiplexado.`); }
  const at = cat.aterr === 'F' ? fF : pick(cat.aterr);
  const V = E.tensao === '254/127' ? 127 : 127, U = E.tensao === '254/127' ? 254 : 220;
  r.Iproj = tipo === 'T' ? r.D * 1000 / (Math.sqrt(3) * U) : (cat.fases === 2 ? r.D * 1000 / (2 * V) : r.D * 1000 / V);
  r.padrao = { cat: cat.cat, fios: cat.fios, fases: cat.fases, faixa: `${nfmt(cat.lo, 1)} < ${cat.base === 'D' ? 'D' : 'C'} ≤ ${nfmt(cat.hi, 1)} ${cat.base === 'D' ? 'kVA' : 'kW'}`,
    ramalCon: ramal === 'multiplex' ? `multiplexado de alumínio XLPE, fases ${cat.mux} mm² e neutro nu CAL ${cat.nAl} mm²` : `concêntrico de alumínio ${cat.conc} mm²`,
    ramalEnt: `cobre 0,6/1 kV, isolação ${isol === 'PVC' ? 'PVC 70 °C' : 'XLPE/HEPR/EPR 90 °C'}, ${u.instalacaoRamal === 'subterraneo' ? 'subterrâneo' : 'embutido'}: fase ${fF} mm² e neutro ${fN} mm²`,
    fF, fN, isol, ramal, aterr: at, hastes: cat.hastes, disj: cat.disj, eletro: cat.eletro, pConc: cat.pConc, pAco: cat.pAco, pont: cat.pont, caixa: cat.caixa, sub: !!sub };
  const disjMax = parseFloat(String(cat.disj).split('/').pop());
  r.disjDem = [10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 90, 100, 125, 150, 175, 200].find(x => x + 1e-9 >= r.Iproj && x <= disjMax) ?? null;
  if (r.Iproj > disjMax + 1e-9) r.avisos.push(`Corrente de demanda ${nfmt(r.Iproj, 1)} A acima do disjuntor da categoria; verifique o enquadramento.`);
}

/* ---------- agrupamentos e edifícios (NDU 003) ---------- */
function f003(t, N) { const rows = (t.f || []).filter(x => +x[0] > 0 && +x[1] > 0).sort((a, b) => a[0] - b[0]); if (!rows.length) return null; const r = rows.find(x => N <= +x[0] + 1e-9); return r ? +r[1] : null; }
function a003(t, A) { const rows = (t.a || []).filter(x => +x[0] > 0 && +x[1] > 0).sort((a, b) => a[0] - b[0]); if (!rows.length) return null; const r = rows.find(x => A <= +x[0] + 1e-9); return r ? +r[1] : null; }
function calcEnergisa(proj) {
  const E = proj.energisa || energisaPadrao(), out = { E, ucs: {}, avisos: [], falhas: [] };
  (E.ucs || []).forEach(u => { out.ucs[u.id] = calcUC(u, E); });
  const R = Object.values(out.ucs);
  if (E.modo === 'agrupamento') {
    if (R.length < 2 || R.length > 3) out.avisos.push('Agrupamento (NDU 003, item 9.3) corresponde a edificações com 2 ou 3 unidades consumidoras; acima disso use "Edifício de múltiplas unidades".');
    out.Dsoma = R.reduce((s, r) => s + r.D, 0);
    out.Dnota = R.reduce((s, r) => s + (r.tipo === 'T' ? r.D : r.C), 0);
    out.Dagr = E.agrupDem === 'nota' ? out.Dnota : out.Dsoma;
    out.Iagr = out.Dagr * 1000 / (Math.sqrt(3) * (E.tensao === '254/127' ? 254 : 220));
    out.avisos.push('Ramal de conexão, ramal de entrada e proteção geral do agrupamento: dimensionar pelas Tabelas 19 e 20 da NDU 003 v8.1 (220/127 V) a partir da demanda total — confira o enquadramento na norma.');
  }
  if (E.modo === 'edificio') {
    const t = E.t003 || {}, cj = (E.conj || []).filter(c => +c.n > 0 && +c.area > 0);
    out.N = cj.reduce((s, c) => s + +c.n, 0);
    out.tabOK = (t.f || []).some(x => +x[1] > 0) && (t.a || []).some(x => +x[1] > 0);
    if (!out.tabOK) out.falhas.push('Tabelas 03 (fator de multiplicação f) e 04 (demanda por apartamento a, em função da área útil) da NDU 003 v8.1 não preenchidas — informe os valores da norma para calcular D1.');
    if (out.tabOK && out.N > 0) {
      if (E.metodo003 === 'conjuntos') {
        if (cj.some(c => +c.n < 4)) out.avisos.push('Cálculo por conjuntos de mesma área: válido apenas se todos os conjuntos tiverem no mínimo 4 apartamentos (NDU 003).');
        out.lin = cj.map(c => { const f = f003(t, +c.n), a = a003(t, +c.area); return { c, f, a, D: f != null && a != null ? f * a : null }; });
        if (out.lin.some(l => l.D == null)) out.falhas.push('Número de apartamentos ou área fora das Tabelas 03/04 informadas.');
        out.D1 = out.lin.reduce((s, l) => s + (l.D || 0), 0);
      } else {
        out.Amed = cj.reduce((s, c) => s + c.n * c.area, 0) / out.N;
        out.f = f003(t, out.N); out.a = a003(t, out.Amed);
        if (out.f == null || out.a == null) out.falhas.push('Número total de apartamentos ou área média fora das Tabelas 03/04 informadas.');
        out.D1 = (out.f || 0) * (out.a || 0);
      }
    } else out.D1 = 0;
    out.D2lin = R.filter(r => r.u.papel !== 'unidade'); out.D2 = out.D2lin.reduce((s, r) => s + r.D, 0);
    out.Dtot = out.D1 + out.D2; out.Itot = out.Dtot * 1000 / (Math.sqrt(3) * 220);
    out.avisos.push('Entrada coletiva (ramal de conexão, ramal de entrada, proteção geral e medição): enquadrar pela demanda total nas tabelas de faixas de atendimento da NDU 003 v8.1.');
  }
  out.status = out.falhas.length || R.some(r => r.status === 'fail') ? 'fail' : (out.avisos.length || R.some(r => r.status === 'warn') ? 'warn' : 'ok');
  return out;
}

/* ---------- importação do levantamento de cargas a partir dos circuitos ---------- */
function cargasDoProjeto(proj, calc) {
  const out = [], ilum = { W: 0, c: [] }, tug = { W: 0, c: [] };
  proj.circuitos.forEach(c => {
    const r = calc.res[c.id], d = (c.desc || '').toLowerCase(), P = Math.round(r.P || 0);
    if (c.tipo === 'dist' || c.tipo === 'controle') return;
    if (c.tipo === 'ilum') { ilum.W += P; ilum.c.push(c.num); return; }
    if (c.tipo === 'motor') { const cv = +c.pot * ({ cv: 1, HP: 1.0139, kW: 1.3596, W: 0.0013596 }[c.unid] || 1); const tri = nFases(c.ligacao) === 3, tab = tri ? T13_MOT3 : T12_MOT1; const k = Object.keys(tab).map(Number).sort((a, b) => a - b).find(x => x + 1e-6 >= cv) ?? Math.max(...Object.keys(tab).map(Number)); out.push({ ...cargaPadrao(tri ? 'mot3' : 'mot1'), desc: `${c.desc} (circ. ${c.num})`, cv: +(+k).toFixed(3) }); return; }
    if (c.tipo === 'tug') { tug.W += P; tug.c.push(c.num); return; }
    let g = 'ilum';
    if (/chuveiro|ducha|torneira|aquecedor de água|boiler|aquecimento de água/.test(d)) g = 'aquec';
    else if (/ar[- ]condicionado|split|\bar cond/.test(d)) g = 'arj';
    else if (/forno|fogão|fogao|cooktop/.test(d)) g = 'fogao';
    else if (/micro-?ondas|lava-?louça|lavadora de louça|secadora|secador de roupa|hidromassagem|banheira/.test(d)) g = 'secad';
    else if (/veículo elétrico|veiculo eletrico|recarga/.test(d)) g = 'simult';
    out.push({ ...cargaPadrao(g), desc: `${c.desc} (circ. ${c.num})`, W: P });
  });
  if (tug.W) out.unshift({ ...cargaPadrao('ilum'), desc: `Tomadas de uso geral (circuitos ${tug.c.join(', ')})`, W: tug.W });
  if (ilum.W) out.unshift({ ...cargaPadrao('ilum'), desc: `Iluminação (circuitos ${ilum.c.join(', ')})`, W: ilum.W });
  return out;
}

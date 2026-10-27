/* ================================================================
   SPDA — PROTEÇÃO CONTRA DESCARGAS ATMOSFÉRICAS (ABNT NBR 5419:2026)
   Parte 2: análise de risco — R1 (vida humana), R3 (patrimônio cultural)
            e frequência de danos F aos sistemas internos
   Parte 3: SPDA — nível de proteção (NP), captação (malhas e ângulo de proteção
            equivalente à esfera rolante), descidas, anéis, aterramento em anel
            (arranjo B), distância de segurança, materiais e inspeção
   Parte 4: DPS na entrada — corrente de impulso por modo de proteção
   ================================================================ */
/* parâmetros por nível de proteção: raio da esfera rolante, malha, distância típica
   entre descidas e entre anéis, coeficiente ki, corrente de pico e probabilidade PB */
const NP_SPDA = {
  I: { r: 20, malha: 5, desc: 10, ki: 0.08, Ip: 200, PB: 0.02 },
  II: { r: 30, malha: 10, desc: 10, ki: 0.06, Ip: 150, PB: 0.05 },
  III: { r: 45, malha: 15, desc: 15, ki: 0.04, Ip: 100, PB: 0.1 },
  IV: { r: 60, malha: 20, desc: 20, ki: 0.04, Ip: 100, PB: 0.2 }
};
const NP_OPCOES = ['nenhum', 'IV', 'III', 'II', 'I'];
const NP_TXT = { nenhum: 'Sem SPDA', IV: 'NP IV', III: 'NP III', II: 'NP II', I: 'NP I', Inat: 'NP I com descidas naturais', metal: 'NP I com cobertura metálica e componentes naturais' };
const PB_SPDA = { nenhum: 1, IV: 0.2, III: 0.1, II: 0.05, I: 0.02, Inat: 0.01, metal: 0.001 };
const PSPD_NIV = { nenhum: 1, IV: 0.05, III: 0.05, II: 0.02, I: 0.01 };
const DPS_OPCOES = ['nenhum', 'IV', 'II', 'I'];
const DPS_TXT = { nenhum: 'Sem DPS coordenados', IV: 'DPS compatíveis com NP III–IV', III: 'DPS compatíveis com NP III–IV', II: 'DPS compatíveis com NP II', I: 'DPS compatíveis com NP I' };
const fp = v => String(v).replace('.', ',');
const minusc = s => s.charAt(0).toLowerCase() + s.slice(1);
const ordemDPS = d => ({ nenhum: 0, IV: 1, III: 1, II: 2, I: 3 })[d] ?? 0;
const npBase = np => (np === 'Inat' || np === 'metal') ? 'I' : np;
/* densidade de descargas atmosféricas NG (descargas/km²/ano) por município — ABNT NBR 5419-2:2026, Anexo F */
const NG_ANEXO_F = {
  MS: { nome: 'Mato Grosso do Sul', mun: {
    'Água Clara': 26,
    'Alcinópolis': 24,
    'Amambai': 24,
    'Anastácio': 22,
    'Anaurilândia': 24,
    'Angélica': 22,
    'Antônio João': 24,
    'Aparecida do Taboado': 18,
    'Aquidauana': 24,
    'Aral Moreira': 26,
    'Bandeirantes': 20,
    'Bataguassu': 24,
    'Batayporã': 22,
    'Bela Vista': 30,
    'Bodoquena': 22,
    'Bonito': 22,
    'Brasilândia': 26,
    'Caarapó': 24,
    'Camapuã': 22,
    'Campo Grande': 30,
    'Caracol': 26,
    'Cassilândia': 20,
    'Chapadão do Sul': 24,
    'Corguinho': 18,
    'Coronel Sapucaia': 24,
    'Corumbá': 26,
    'Costa Rica': 24,
    'Coxim': 22,
    'Deodápolis': 22,
    'Dois Irmãos do Buriti': 20,
    'Douradina': 20,
    'Dourados': 24,
    'Eldorado': 22,
    'Fátima do Sul': 24,
    'Figueirão': 24,
    'Glória de Dourados': 22,
    'Guia Lopes da Laguna': 22,
    'Iguatemi': 24,
    'Inocência': 20,
    'Itaporã': 20,
    'Itaquiraí': 24,
    'Ivinhema': 24,
    'Japorã': 24,
    'Jaraguari': 24,
    'Jardim': 22,
    'Jateí': 22,
    'Juti': 22,
    'Ladário': 16,
    'Laguna Carapã': 24,
    'Maracaju': 24,
    'Miranda': 20,
    'Mundo Novo': 20,
    'Naviraí': 24,
    'Nioaque': 24,
    'Nova Alvorada do Sul': 28,
    'Nova Andradina': 26,
    'Novo Horizonte do Sul': 22,
    'Paraíso das Águas': 24,
    'Paranaíba': 18,
    'Paranhos': 22,
    'Pedro Gomes': 24,
    'Ponta Porã': 26,
    'Porto Murtinho': 26,
    'Ribas do Rio Pardo': 28,
    'Rio Brilhante': 26,
    'Rio Negro': 20,
    'Rio Verde de Mato Grosso': 24,
    'Rochedo': 20,
    'Santa Rita do Pardo': 28,
    'São Gabriel do Oeste': 22,
    'Selvíria': 20,
    'Sete Quedas': 26,
    'Sidrolândia': 24,
    'Sonora': 24,
    'Tacuru': 24,
    'Taquarussu': 22,
    'Terenos': 20,
    'Três Lagoas': 22,
    'Vicentina': 22
  } }
};
/* NG adotado: tabela do Anexo F quando o município é escolhido; senão, o valor informado */
function ngSPDA(sp) {
  const T = NG_ANEXO_F[sp.ngUF], v = T && sp.ngMun && T.mun[sp.ngMun];
  return v ? { valor: v, tabela: true, mun: sp.ngMun, uf: sp.ngUF, fonte: `ABNT NBR 5419-2:2026, Anexo F — ${sp.ngMun}/${sp.ngUF}` } : { valor: Math.max(0, +sp.Ng || 0), tabela: false, fonte: sp.ngFonte || 'valor informado pelo projetista' };
}
/* fatores e probabilidades da análise de risco: [valor, descrição] */
const CD_LOC = { cercada: [0.25, 'Cercada por objetos mais altos'], menores: [0.5, 'Cercada por objetos da mesma altura ou mais baixos'], isolada: [1, 'Isolada — sem outros objetos nas vizinhanças'], colina: [2, 'Isolada no topo de colina ou monte'] };
const CI_LIN = { aerea: [1, 'Aérea'], enterrada: [0.5, 'Enterrada'], malha: [0.01, 'Enterrada, inteiramente dentro de malha de aterramento'] };
const CE_LIN = { rural: [1, 'Rural'], suburbano: [0.5, 'Suburbano'], urbano: [0.1, 'Urbano'], urbanoAlto: [0.01, 'Urbano com edifícios acima de 20 m'] };
const CT_LIN = { bt: [1, 'Baixa tensão, telecomunicações ou sinal'], at: [0.2, 'Alta tensão com transformador AT/BT na entrada'] };
/* blindagem e aterramento da linha: [CLD, CLI, descrição] */
const BLIND_LIN = {
  aereaSem: [1, 1, 'Aérea sem blindagem'], enterradaSem: [1, 1, 'Enterrada sem blindagem'], neutro: [1, 0.2, 'Energia com neutro multiaterrado'],
  enterradaNao: [1, 0.3, 'Enterrada blindada — blindagem não ligada ao barramento dos equipamentos'], aereaNao: [1, 0.1, 'Aérea blindada — blindagem não ligada ao barramento dos equipamentos'],
  ligada: [1, 0, 'Blindada — blindagem ligada ao mesmo barramento dos equipamentos'], duto: [0, 0, 'Cabo protegido contra descargas ou em duto metálico contínuo e ligado'], isolante: [0, 0, 'Interfaces isolantes (NBR 5419-4)']
};
const UW_LISTA = [1, 1.5, 2.5, 4, 6];
const PLD_RS = { ate20: [[1, 1, 0.95, 0.9, 0.8], 'Blindagem 5 < RS ≤ 20 Ω/km'], ate5: [[0.9, 0.8, 0.6, 0.3, 0.1], 'Blindagem 1 < RS ≤ 5 Ω/km'], ate1: [[0.6, 0.4, 0.2, 0.04, 0.02], 'Blindagem RS ≤ 1 Ω/km'] };
const PLI_LIN = { energia: [1, 0.6, 0.3, 0.16, 0.1], telecom: [1, 0.5, 0.2, 0.08, 0.04] };
const PTA_OP = { nenhuma: [1, 'Nenhuma medida'], avisos: [0.1, 'Avisos de alerta'], isolacao: [0.01, 'Isolação elétrica da descida exposta (ex.: 3 mm de polietileno reticulado)'], equipot: [0.01, 'Equipotencialização efetiva do solo'], restricao: [0, 'Restrições físicas ou estrutura usada como descida'] };
const PTU_OP = { nenhuma: [1, 'Nenhuma medida'], avisos: [0.1, 'Avisos de alerta'], isolacao: [0.01, 'Isolação elétrica'], restricao: [0, 'Restrições físicas'] };
const KS3_OP = { semCuidado: [1, 'Cabos sem blindagem, sem cuidado de roteamento (laços até 50 m²)'], grandes: [0.2, 'Sem blindagem, evitando grandes laços (até 10 m²)'], lacos: [0.01, 'Sem blindagem, evitando laços (até 0,5 m²)'], blindado: [0.0001, 'Cabos blindados ou em eletrodutos metálicos ligados nas extremidades'] };
const RT_PISO = { concreto: [1e-2, 'Agrícola ou concreto'], ceramica: [1e-3, 'Mármore ou cerâmica'], brita: [1e-4, 'Brita, carpete ou tapete'], asfalto: [1e-5, 'Asfalto, linóleo ou madeira'] };
const RP_OP = { nenhuma: [1, 'Nenhuma providência'], manual: [0.5, 'Extintores, hidrantes, alarme manual, compartimentação ou rotas de fuga'], automatica: [0.2, 'Extinção ou alarme automáticos'] };
const RF_OP = { exp0: [1, 'Explosão — zonas 0, 20 e explosivos sólidos'], exp1: [0.1, 'Explosão — zonas 1 e 21'], exp2: [0.001, 'Explosão — zonas 2 e 22'], alto: [0.1, 'Incêndio — risco alto'], normal: [0.01, 'Incêndio — risco normal'], baixo: [0.001, 'Incêndio — risco baixo'], nenhum: [0, 'Sem risco de incêndio ou explosão'] };
const HZ_OP = { nenhum: [1, 'Sem perigo especial'], baixo: [2, 'Baixo nível de pânico (até 2 pavimentos e 100 pessoas)'], medio: [5, 'Nível médio de pânico (100 a 1 000 pessoas)'], evacuacao: [5, 'Dificuldade de evacuação (pessoas imobilizadas, hospitais)'], alto: [10, 'Alto nível de pânico (mais de 1 000 pessoas)'] };
const OCUP_SPDA = { residencial: [0.01, 'Residencial e demais'], comercial: [0.02, 'Comercial ou industrial'], entretenimento: [0.05, 'Entretenimento público, igreja ou museu'], publico: [0.1, 'Hospital, hotel, escola ou edifício público'], explosao: [0.1, 'Estrutura com risco de explosão'] };
const VIDA_OP = { nao: [0, 'Não — falhas não põem a vida em risco'], hospital: [1e-3, 'Hospital — demais áreas'], uti: [1e-2, 'Hospital — UTI e centro cirúrgico'], explosao: [1e-1, 'Estrutura com risco de explosão'] };
const RT_SPDA = { R1: 1e-5, R3: 1e-4 };
/* materiais: captação e descidas; aterramento (seções mínimas da NBR 5419-3:2026) */
const MAT_CAPT = {
  cobre35: { nome: 'Cabo de cobre nu 35 mm²', S: 35, d: 7.6, norma: 'ABNT NBR 5419-3; NBR 6524' },
  aluminio70: { nome: 'Barra chata ou cabo de alumínio 70 mm²', S: 70, d: 10.7, norma: 'ABNT NBR 5419-3' },
  acoCobreado35: { nome: 'Cabo de aço cobreado 35 mm²', S: 35, d: 7.6, norma: 'ABNT NBR 5419-3:2026' },
  acoGalv50: { nome: 'Cordoalha de aço zincado a quente 50 mm²', S: 50, d: 9.0, norma: 'ABNT NBR 5419-3' }
};
const MAT_ATERR_SPDA = {
  cobre50: { nome: 'Cabo de cobre nu 50 mm² (7 ou 19 fios)', S: 50, d: 9.0, norma: 'ABNT NBR 5419-3; NBR 6524' },
  acoCobreado50: { nome: 'Cabo de aço cobreado 50 mm²', S: 50, d: 9.0, norma: 'ABNT NBR 5419-3:2026' }
};
const INSP_SPDA = { normal: [3, 'Demais estruturas'], severa: [1, 'Explosivos, corrosão atmosférica severa ou prestadores de serviços essenciais'] };

function linhaSPDA(tipo = 'energia') {
  return { id: uid(), nome: tipo === 'energia' ? 'Linha de energia' : 'Linha de telecomunicações', tipo, ativa: true, inst: tipo === 'energia' ? 'aerea' : 'aerea', LL: 1000, ce: 'urbano', ct: 'bt', blind: tipo === 'energia' ? 'neutro' : 'aereaSem', rs: 'ate20', uw: 2.5 };
}
function spdaPadrao() {
  return { ativo: false, nome: 'Edificação', L: 20, W: 12, H: 7, cd: 'menores', ngUF: 'MS', ngMun: '', Ng: null, ngFonte: '',
    ocup: 'residencial', piso: 'concreto', rp: 'nenhuma', rf: 'normal', hz: 'nenhum', nzNt: 100, tz: 8760, vida: 'nao', patrimonio: false, czCt: 100, critico: false,
    linhas: [linhaSPDA('energia'), linhaSPDA('telecom')],
    np: 'auto', dps: 'auto', pta: 'nenhuma', ptu: 'nenhuma', ks3: 'semCuidado', wm: null,
    metodo: 'malha', hm: 3, mx: 1, my: 1, matCapt: 'cobre35', matAterr: 'cobre50', natural: false, dParede: 1, prof: 0.5, km: 'ar', rhoFonte: 'aterr', rho: null, insp: 'normal', obs: '' };
}

/* ângulo de proteção equivalente à esfera rolante (mesma área protegida) — curvas da norma */
function anguloProtecao(h, r) {
  if (!(h > 0) || h > r + 1e-9) return null;
  h = Math.max(h, 2);
  const rs = Math.sqrt(h * (2 * r - h)), I = rs / 2 * Math.sqrt(Math.max(0, r * r - rs * rs)) + r * r / 2 * Math.asin(Math.min(1, rs / r));
  return Math.atan(2 * (r * rs - I) / (h * h)) * 180 / Math.PI;
}
/* comprimento mínimo do eletrodo l1 (Figura 3): só os NP I e II dependem da resistividade */
function l1Aterr(np, rho) { np = npBase(np); if (np === 'I') return rho > 500 ? 0.03 * rho - 10 : 5; if (np === 'II') return rho > 800 ? 0.02 * rho - 11 : 5; return 5; }
const kcSPDA = n => n <= 1 ? 1 : n === 2 ? 0.66 : 0.44;

/* ---------- análise de risco (NBR 5419-2) ---------- */
function calcRiscoSPDA(sp, np, dps) {
  const L = Math.max(0.1, +sp.L || 0), W = Math.max(0.1, +sp.W || 0), H = Math.max(0.1, +sp.H || 0), Ng = Math.max(0, +sp.Ng || 0);
  const r = { np, dps };
  r.AD = L * W + 2 * 3 * H * (L + W) + Math.PI * (3 * H) ** 2; r.CD = CD_LOC[sp.cd][0]; r.ND = Ng * r.AD * r.CD * 1e-6;
  r.AM = 2 * 500 * (L + W) + Math.PI * 500 ** 2; r.NM = Ng * r.AM * 1e-6;
  r.PSPD = PSPD_NIV[dps] ?? 1; r.PEB = r.PSPD;
  r.PB = PB_SPDA[np]; r.PTA = PTA_OP[sp.pta][0]; r.PA = r.PTA * r.PB; r.PTU = PTU_OP[sp.ptu][0];
  const fr = Math.min(1, Math.max(0, (+sp.nzNt || 0) / 100)) * Math.min(8760, Math.max(0, +sp.tz || 0)) / 8760; r.fr = fr;
  r.rt = RT_PISO[sp.piso][0]; r.rp = RP_OP[sp.rp][0]; r.rf = RF_OP[sp.rf][0]; r.hz = HZ_OP[sp.hz][0]; r.LF = OCUP_SPDA[sp.ocup][0]; r.LO = VIDA_OP[sp.vida][0];
  r.LA = r.LU = r.rt * 1e-2 * fr; r.LB = r.LV = r.rp * r.rf * r.hz * r.LF * fr; r.LC = r.LM = r.LW = r.LZ = r.LO * fr;
  const ks12 = +sp.wm > 0 ? Math.min(1, 0.12 * +sp.wm) : 1, ks3 = KS3_OP[sp.ks3][0];
  r.linhas = (sp.linhas || []).filter(l => l.ativa).map(l => {
    const o = { id: l.id, nome: l.nome, tipo: l.tipo }, iu = Math.max(0, UW_LISTA.indexOf(+l.uw)), LL = Math.max(0, +l.LL || 0);
    o.AL = 40 * LL; o.AI = 4000 * LL; o.CI = CI_LIN[l.inst][0]; o.CE = CE_LIN[l.ce][0]; o.CT = CT_LIN[l.ct][0];
    o.NL = Ng * o.AL * o.CI * o.CE * o.CT * 1e-6; o.NI = Ng * o.AI * o.CI * o.CE * o.CT * 1e-6;
    [o.CLD, o.CLI] = BLIND_LIN[l.blind]; o.PLD = l.blind === 'ligada' ? PLD_RS[l.rs][0][iu] : 1; o.PLI = PLI_LIN[l.tipo][iu]; o.UW = UW_LISTA[iu];
    o.PU = r.PTU * r.PEB * o.PLD * o.CLD; o.PV = r.PEB * o.PLD * o.CLD; o.PW = r.PSPD * o.PLD * o.CLD; o.PZ = r.PSPD * o.PLI * o.CLI;
    o.PC = r.PSPD * o.CLD; o.PMS = Math.min(1, (ks12 * ks12 * ks3 / o.UW) ** 2); o.PM = r.PSPD * o.PMS;
    return o;
  });
  const comb = k => 1 - r.linhas.reduce((p, o) => p * (1 - o[k]), 1);
  r.PC = comb('PC'); r.PM = comb('PM');
  const soma = f => r.linhas.reduce((s, o) => s + f(o), 0);
  r.RA = r.ND * r.PA * r.LA; r.RB = r.ND * r.PB * r.LB; r.RC = r.ND * r.PC * r.LC; r.RM = r.NM * r.PM * r.LM;
  r.RU = soma(o => o.NL * o.PU * r.LU); r.RV = soma(o => o.NL * o.PV * r.LV); r.RW = soma(o => o.NL * o.PW * r.LW); r.RZ = soma(o => o.NI * o.PZ * r.LZ);
  r.vida = sp.vida !== 'nao';
  r.R1 = r.RA + r.RB + r.RU + r.RV + (r.vida ? r.RC + r.RM + r.RW + r.RZ : 0);
  if (sp.patrimonio) { r.LB3 = r.rp * r.rf * 0.1 * Math.min(1, Math.max(0, (+sp.czCt || 0) / 100)); r.RB3 = r.ND * r.PB * r.LB3; r.RV3 = soma(o => o.NL * o.PV * r.LB3); r.R3 = r.RB3 + r.RV3; }
  // frequência de danos aos sistemas internos (pulsos eletromagnéticos e sobretensões)
  r.FC = r.ND * r.PC; r.FM = r.NM * r.PM; r.FW = soma(o => o.NL * o.PW); r.FZ = soma(o => o.NI * o.PZ); r.F = r.FC + r.FM + r.FW + r.FZ;
  r.FT = sp.critico ? 0.1 : 1;
  r.okR1 = r.R1 <= RT_SPDA.R1 * (1 + 1e-9); r.okR3 = !sp.patrimonio || r.R3 <= RT_SPDA.R3 * (1 + 1e-9); r.okF = r.F <= r.FT * (1 + 1e-9);
  return r;
}

/* ---------- posições das descidas e captores ---------- */
function posDescidas(L, W, dmax) {
  const per = 2 * (L + W);
  if (Math.ceil(per / dmax - 1e-9) <= 2) return [[0, 0], [L, W]];
  const kL = Math.max(1, Math.ceil(L / dmax - 1e-9)), kW = Math.max(1, Math.ceil(W / dmax - 1e-9)), P = [];
  for (let i = 0; i <= kL; i++) P.push([i * L / kL, 0]);
  for (let j = 1; j <= kW; j++) P.push([L, j * W / kW]);
  for (let i = kL - 1; i >= 0; i--) P.push([i * L / kL, W]);
  for (let j = kW - 1; j >= 1; j--) P.push([0, j * W / kW]);
  return P;
}
function franklinCobertura(L, W, mx, my, hm, r) {
  const a = anguloProtecao(hm, r), rp = a == null ? 0 : hm * Math.tan(a * Math.PI / 180), dmax = Math.hypot(L / (2 * mx), W / (2 * my));
  return { a, rp, dmax, ok: a != null && dmax <= rp + 1e-9 };
}

/* ---------- projeto do SPDA (NBR 5419-3) ---------- */
function projetoSPDA(sp, np, proj, calc) {
  const p = { np, base: npBase(np), avisos: [], falhas: [] }, P = NP_SPDA[p.base];
  const L = Math.max(0.1, +sp.L || 0), W = Math.max(0.1, +sp.W || 0), H = Math.max(0.1, +sp.H || 0);
  Object.assign(p, { L, W, H, r: P.r, malha: P.malha, dDesc: P.desc, ki: P.ki, Ip: P.Ip });
  p.per = 2 * (L + W);
  // captação
  if (sp.metodo === 'franklin') {
    const mx = Math.max(1, Math.round(+sp.mx || 1)), my = Math.max(1, Math.round(+sp.my || 1)), hm = Math.max(0.3, +sp.hm || 0);
    Object.assign(p, { mx, my, hm }, franklinCobertura(L, W, mx, my, hm, P.r));
    p.mastros = []; for (let i = 0; i < mx; i++) for (let j = 0; j < my; j++) p.mastros.push([(i + 0.5) * L / mx, (j + 0.5) * W / my]);
    if (p.a == null) p.falhas.push(`Mastro de ${nfmt(hm, 1)} m acima do limite do ângulo de proteção para o NP ${p.base} (${P.r} m): use o método das malhas ou da esfera rolante.`);
    else if (!p.ok) p.falhas.push(`Os captores não cobrem toda a cobertura: ponto mais distante a ${nfmt(p.dmax, 2)} m e raio protegido de ${nfmt(p.rp, 2)} m no plano da cobertura.`);
    // sugestão: menor quantidade de mastros que cobre a cobertura com a altura adotada
    let best = null; for (let n = 1; n <= 12; n++) for (let m = 1; m <= 12; m++) if (franklinCobertura(L, W, n, m, hm, P.r).ok && (!best || n * m < best.mx * best.my)) best = { mx: n, my: m };
    p.sugestao = best;
    p.Lcapt = p.per + mx * my * Math.min(L, W) / 2;
    p.nCruz = mx * my + 4;
  } else {
    p.nx = Math.max(0, Math.ceil(L / P.malha - 1e-9) - 1); p.ny = Math.max(0, Math.ceil(W / P.malha - 1e-9) - 1);
    p.celX = L / (p.nx + 1); p.celY = W / (p.ny + 1);
    p.Lcapt = p.per + p.nx * W + p.ny * L; p.nCruz = (p.nx + 2) * (p.ny + 2);
    p.a = anguloProtecao(Math.min(H, P.r), P.r);
  }
  if (H > 60) p.avisos.push('Estrutura com mais de 60 m: prever captação lateral nos 20 % superiores da altura (descargas laterais).');
  // descidas e anéis
  p.natural = !!sp.natural;
  p.desc = posDescidas(L, W, P.desc); p.nDesc = p.desc.length;
  const lados = []; for (let i = 0; i < p.nDesc; i++) { const a = p.desc[i], b = p.desc[(i + 1) % p.nDesc]; lados.push(Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])); }
  p.espDesc = Math.max(...lados);
  if (p.espDesc > P.desc * 1.2 + 1e-6) p.avisos.push(`Espaçamento entre descidas de ${nfmt(p.espDesc, 1)} m acima do valor típico de ${P.desc} m (+20 %).`);
  p.nAneis = Math.max(0, Math.ceil(H / P.desc - 1e-9) - 1); p.yAneis = Array.from({ length: p.nAneis }, (_, i) => (i + 1) * P.desc);
  p.Ldesc = p.natural ? 0 : p.nDesc * (H + 1); p.Laneis = p.nAneis * p.per;
  // aterramento em anel (arranjo B)
  const ca = calc && calc.aterr, rhoA = ca && ca.solo && ca.solo.rho > 0 ? ca.solo.rho : null;
  p.rho = sp.rhoFonte === 'direto' && +sp.rho > 0 ? +sp.rho : (rhoA || (+sp.rho > 0 ? +sp.rho : 100)); p.rhoTxt = sp.rhoFonte === 'direto' && +sp.rho > 0 ? 'informada' : (rhoA ? 'do módulo Aterramento' : 'valor de referência (100 Ω·m)');
  const a = Math.max(0, +sp.dParede || 0), hA = Math.max(0.5, +sp.prof || 0.5);
  p.dParede = a; p.prof = hA; p.Lx = L + 2 * a; p.Ly = W + 2 * a;
  p.Lanel = 2 * (p.Lx + p.Ly); p.Aanel = p.Lx * p.Ly; p.re = Math.sqrt(p.Aanel / Math.PI);
  p.l1 = l1Aterr(p.base, p.rho); p.okAnel = p.re >= p.l1 - 1e-9;
  p.lr = p.okAnel ? 0 : p.l1 - p.re; p.lv = p.lr / 2; p.nExtra = p.okAnel ? 0 : Math.max(2, p.nDesc); p.hastesPorEl = p.okAnel ? 0 : Math.max(1, Math.ceil(p.lv / 2.4 - 1e-9));
  const mA = MAT_ATERR_SPDA[sp.matAterr] || MAT_ATERR_SPDA.cobre50, D = 2 * p.re, d = mA.d / 1000;
  p.Ranel = p.rho / (2 * Math.PI * Math.PI * D) * (Math.log(8 * D / d) + Math.log(4 * D / hA));
  if (!p.okAnel) p.avisos.push(`Raio médio do anel re = ${nfmt(p.re, 2)} m menor que l1 = ${nfmt(p.l1, 2)} m: acrescentar ${p.nExtra} eletrodos de ${nfmt(p.lr, 2)} m na horizontal ou ${nfmt(p.lv, 2)} m na vertical, um junto a cada descida.`);
  // distância de segurança
  p.kc = kcSPDA(p.natural ? 4 : p.nDesc); p.km = sp.km === 'solido' ? 0.5 : 1; p.lSep = H; p.s = p.ki * p.kc / p.km * p.lSep;
  // DPS classe I na entrada (NBR 5419-4): metade da corrente de pico dividida entre os condutores da linha de energia
  const nModos = proj ? ({ monofasico: 2, bifasico: 3, trifasico: 4 }[proj.params.fornecimento] || 4) : 4;
  p.nModos = nModos; p.Iimp = P.Ip * 0.5 / nModos;
  // materiais
  const mC = MAT_CAPT[sp.matCapt] || MAT_CAPT.cobre35, M = [];
  const add = (desc, q, un, norma) => { if (q > 0) M.push([desc, un === 'm' ? Math.ceil(q) : q, un, norma]); };
  add(`${mC.nome} — captação${sp.metodo === 'franklin' ? ' (interligação dos captores)' : ' (malha e perímetro da cobertura)'}`, p.Lcapt * 1.05, 'm', mC.norma);
  if (sp.metodo === 'franklin') add(`Mastro de aço zincado com captor tipo Franklin, altura de ${nfmt(p.hm, 1)} m acima da cobertura, com base e fixações`, p.mx * p.my, 'un', 'ABNT NBR 5419-3');
  add(`${mC.nome} — descidas`, p.Ldesc * 1.05, 'm', mC.norma);
  add(`${mC.nome} — anéis intermediários`, p.Laneis * 1.05, 'm', mC.norma);
  add(`${mA.nome} — anel de aterramento a ${nfmt(hA, 1)} m de profundidade e ${nfmt(a, 1)} m das paredes`, (p.Lanel + p.nDesc * 1.5) * 1.05, 'm', mA.norma);
  if (p.nExtra) add(`Haste de aterramento de aço cobreado 5/8" × 2,4 m — eletrodos adicionais (${p.hastesPorEl} por descida)`, p.nExtra * p.hastesPorEl, 'un', 'ABNT NBR 13571');
  add('Suporte isolador ou fixador para condutor da captação (a cada 1 m)', Math.ceil(p.Lcapt / 1.0), 'un', 'ABNT NBR 5419-3');
  if (!p.natural) add('Fixador para condutor de descida (a cada 1 m até 20 m e 0,5 m acima)', p.nDesc * (Math.ceil(Math.min(H, 20)) + Math.ceil(Math.max(0, H - 20) / 0.5)), 'un', 'ABNT NBR 5419-3');
  add(sp.metodo === 'franklin' ? 'Conector de ligação captor/condutor' : 'Conector de cruzamento e emenda da malha de captação', p.nCruz, 'un', 'ABNT NBR 5419-3');
  if (!p.natural) add('Conector de medição (desconexão para ensaio) em cada descida', p.nDesc, 'un', 'ABNT NBR 5419-3');
  if (!p.natural) add('Eletroduto de PVC rígido para proteção mecânica da descida junto ao solo (2,5 m por descida)', p.nDesc * 2.5, 'm', 'ABNT NBR 15465');
  add('Caixa de inspeção do aterramento (ligação descida/anel)', p.nDesc, 'un', 'ABNT NBR 5419-3');
  add('Conexão por solda exotérmica ou conector de compressão (descida/anel e eletrodos)', p.nDesc + p.nExtra * p.hastesPorEl, 'un', 'ABNT NBR 16254');
  add('Ligação do anel de aterramento ao barramento de equipotencialização principal (BEP)', 1, 'vb', 'ABNT NBR 5419-3; NBR 5410');
  p.materiais = M;
  p.inspecao = { visual: 1, completa: INSP_SPDA[sp.insp][0], txt: INSP_SPDA[sp.insp][1] };
  return p;
}

function calcSPDA(proj, calc) {
  const sp0 = proj.spda || spdaPadrao(), out = { ativo: !!sp0.ativo, falhas: [], avisos: [] };
  if (!sp0.ativo) return out;
  out.ng = ngSPDA(sp0); const sp = { ...sp0, Ng: out.ng.valor };
  if (!(out.ng.valor > 0)) out.falhas.push('Escolha o município ou informe a densidade de descargas atmosféricas NG (Anexo F da NBR 5419-2:2026).');
  // combinações de nível de proteção e DPS: com SPDA, os DPS da entrada devem ser compatíveis com o NP
  const dpsDe = np => DPS_OPCOES.filter(d => np === 'nenhum' || ordemDPS(d) >= ordemDPS(npBase(np)));
  out.matriz = NP_OPCOES.map(np => ({ np, cel: DPS_OPCOES.map(d => dpsDe(np).includes(d) ? calcRiscoSPDA(sp, np, d) : null) }));
  const ok = r => r && r.okR1 && r.okR3, achar = (nps, dpss) => { for (const np of nps) for (const d of dpss(np)) { const r = calcRiscoSPDA(sp, np, d); if (ok(r)) return { np, dps: d }; } return null; };
  const min = achar(NP_OPCOES, dpsDe); out.npMin = min ? min.np : null; out.dpsMin = min ? min.dps : null;
  out.semProt = calcRiscoSPDA(sp, 'nenhum', 'nenhum');
  const esc = achar(sp.np === 'auto' ? NP_OPCOES : [sp.np], np => sp.dps === 'auto' ? dpsDe(np) : [sp.dps]);
  out.npAdot = sp.np === 'auto' ? (esc ? esc.np : 'I') : sp.np;
  out.dpsAdot = sp.dps === 'auto' ? (esc ? esc.dps : (dpsDe(out.npAdot).find(d => d !== 'nenhum') || 'I')) : sp.dps;
  if (sp.dps === 'auto' && !esc) out.dpsAdot = 'I';
  out.risco = calcRiscoSPDA(sp, out.npAdot, out.dpsAdot);
  if (out.npAdot !== 'nenhum' && (sp.linhas || []).some(l => l.ativa) && ordemDPS(out.dpsAdot) < ordemDPS(npBase(out.npAdot))) out.falhas.push(`Com SPDA ${NP_TXT[out.npAdot]}, os DPS na entrada das linhas devem ser compatíveis com o mesmo nível (equipotencialização para descargas atmosféricas).`);
  if (!out.risco.okR1) out.falhas.push(`R1 = ${nfmt(out.risco.R1 * 1e5, 2)} × 10⁻⁵ acima do tolerável (1 × 10⁻⁵) com ${NP_TXT[out.npAdot]}: adote nível de proteção mais alto, DPS coordenados ou providências contra incêndio e contra tensões de toque e passo.`);
  if (!out.risco.okR3) out.falhas.push(`R3 = ${nfmt(out.risco.R3 * 1e4, 2)} × 10⁻⁴ acima do tolerável (1 × 10⁻⁴) para o patrimônio cultural.`);
  if (!out.risco.okF) out.avisos.push(`Frequência de danos F = ${nfmt(out.risco.F, 3)} por ano acima da tolerável (${nfmt(out.risco.FT, 1)} por ano): prever MPS — DPS coordenados (NBR 5419-4), blindagem e roteamento dos cabos.`);
  out.opcional = out.npAdot !== 'nenhum' && out.npMin === 'nenhum';
  if (out.npAdot !== 'nenhum') { out.projeto = projetoSPDA(sp, out.npAdot, proj, calc); out.falhas.push(...out.projeto.falhas); out.avisos.push(...out.projeto.avisos); }
  out.status = out.falhas.length ? 'fail' : out.avisos.length ? 'warn' : 'ok';
  return out;
}

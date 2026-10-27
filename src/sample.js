/* ============== PROJETO DE EXEMPLO ============== */
function hojeISO() { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
function projetoVazio() {
  const P = paramsPadrao();
  return {
    versao: 1, exemplo: false,
    info: { obra: '', cliente: '', endereco: '', cidade: '', responsavel: '', registro: '', art: '', data: hojeISO(), revisao: 'R00', concessionaria: '', obs: '' },
    params: P,
    quadros: { 'QD-1': { desc: 'Quadro de distribuição', fd: null, icc: P.icc, dvMont: 0 } },
    trechos: {}, catalogo: {}, circuitos: [], lumi: [], lumiExt: [], energisa: energisaPadrao(), clima: climaPadrao(), aterr: aterrPadrao(), spda: spdaPadrao(), dps: { ...dpsPadrao(), Td: 80, LBT: 0.2, delta: 0.5, nSens: 2 }, materiais: materiaisPadrao(), descritivo: descritivoPadrao(P.edificacao),
    memorias: { grupo: MEMORIAS.map(m => m.id) }
  };
}
function projetoExemplo() {
  const proj = projetoVazio(); const P = proj.params;
  proj.exemplo = true;
  Object.assign(proj.info, { obra: 'Residência unifamiliar — exemplo', cliente: 'Proprietário (exemplo)', endereco: 'Rua Exemplo, 100 — Centro', cidade: 'Cidade – UF', responsavel: 'Nome do responsável técnico', registro: 'CREA/CFT nº 000000', art: 'a emitir', concessionaria: 'Norma de fornecimento da distribuidora local' });
  proj.quadros = {
    'QM': { desc: 'Quadro de medição (ponto de entrega)', fd: null, icc: 5, dvMont: 0 },
    'QD-1': { desc: 'Quadro de distribuição de circuitos', fd: null, icc: 3, dvMont: 0 }
  };
  proj.trechos = {
    'E1': { tipo: 'pvc_rigido', comp: 9, curvas: 2, local: 'interno' },
    'E2': { tipo: 'pvc_rigido', comp: 8, curvas: 2, local: 'interno' },
    'E3': { tipo: 'pvc_rigido', comp: 9, curvas: 1, local: 'interno' },
    'P1': { tipoCalha: 'perfilado', altura: 38, comp: 12, vao: 1.5, carga: 10 }
  };
  const mk = o => Object.assign(defaultsCircuito(P, o.tipo), o);
  proj.circuitos = [
    mk({ num: '1', desc: 'Iluminação — sala, circulação e quartos', tipo: 'ilum', local: 'seco', ligacao: 'FN', fases: 'A', pot: 780, unid: 'VA', fp: 0.92, L: 24, trecho: 'E1' }),
    mk({ num: '2', desc: 'Iluminação — cozinha, área de serviço e banheiros', tipo: 'ilum', local: 'banheiro', ligacao: 'FN', fases: 'B', pot: 540, unid: 'VA', fp: 0.92, L: 18, trecho: 'E2' }),
    mk({ num: '3', desc: 'TUG — sala e quartos', tipo: 'tug', local: 'seco', ligacao: 'FN', fases: 'C', pot: 1300, unid: 'VA', fp: 0.8, L: 22, trecho: 'E1' }),
    mk({ num: '4', desc: 'TUG — cozinha', tipo: 'tug', local: 'cozinha', ligacao: 'FN', fases: 'A', pot: 1900, unid: 'VA', fp: 0.8, L: 14, trecho: 'E2' }),
    mk({ num: '5', desc: 'TUG — área de serviço', tipo: 'tug', local: 'servico', ligacao: 'FN', fases: 'B', pot: 1300, unid: 'VA', fp: 0.8, L: 17, trecho: 'E2' }),
    mk({ num: '6', desc: 'TUE — chuveiro do banheiro social', tipo: 'tue', local: 'banheiro', ligacao: 'FF', fases: 'AB', pot: 5500, unid: 'W', fp: 1, L: 15, trecho: 'E3' }),
    mk({ num: '7', desc: 'TUE — chuveiro da suíte', tipo: 'tue', local: 'banheiro', ligacao: 'FF', fases: 'BC', pot: 7500, unid: 'W', fp: 1, L: 21, trecho: 'E3' }),
    mk({ num: '8', desc: 'TUE — ar-condicionado 12.000 BTU/h', tipo: 'tue', local: 'seco', ligacao: 'FF', fases: 'CA', pot: 1300, unid: 'W', fp: 0.9, L: 19, trecho: 'E1' }),
    mk({ num: '9', desc: 'TUE — forno elétrico', tipo: 'tue', local: 'cozinha', ligacao: 'FN', fases: 'C', pot: 1800, unid: 'W', fp: 1, L: 12, trecho: 'E2' }),
    mk({ num: '10', desc: 'Motor — bomba d’água 1/2 cv', tipo: 'motor', local: 'externa', ligacao: 'FF', fases: 'CA', pot: 0.5, unid: 'cv', fp: 0.8, rend: 0.7, fs: 1.15, ipIn: 6, L: 28, tipoCabo: 'unipolar', metodo: '61A', curva: 'C', dr: 'sim' }),
    mk({ num: '11', desc: 'Iluminação — garagem (perfilado)', tipo: 'ilum', local: 'garagem', ligacao: 'FN', fases: 'A', pot: 300, unid: 'VA', fp: 0.92, L: 20, metodo: '35', trecho: 'P1' }),
    mk({ num: '12', desc: 'TUG — garagem (perfilado)', tipo: 'tug', local: 'garagem', ligacao: 'FN', fases: 'B', pot: 600, unid: 'VA', fp: 0.8, L: 22, metodo: '35', trecho: 'P1' }),
    mk({ num: '13', desc: 'Iluminação externa — estacionamento', tipo: 'ilum', local: 'externa', ligacao: 'FN', fases: 'C', pot: 200, unid: 'W', fp: 0.95, L: 35, tipoCabo: 'unipolar', metodo: '61A', dr: 'sim', potLumi: true }),
    mk({ num: 'AL-1', desc: 'Alimentador do QD-1', tipo: 'dist', quadro: 'QM', local: 'quadro', alimenta: 'QD-1', demandaAuto: true, ligacao: 'FFFN', fases: 'ABC', L: 12, tipoCabo: 'unipolar', metodo: '61A', curva: 'C' })
  ];
  const c1 = proj.circuitos[0].id, c2 = proj.circuitos[1].id, amb = (o, i) => Object.assign(defaultsAmbiente(i), o);
  proj.lumi = [
    amb({ nome: 'Sala de estar', amb: 'resi-sala-de-estar-geral', L: 4.5, W: 3.6, pd: 2.7, hwp: 0.75, prod: 'ldv-plafon18', fm: '0.8', circuito: c1 }, 1),
    amb({ nome: 'Quarto 1', amb: 'resi-quarto-geral', L: 3.4, W: 3, pd: 2.7, hwp: 0.75, prod: 'phi-plafon18', fm: '0.8', circuito: c1 }, 2),
    amb({ nome: 'Cozinha', amb: 'resi-cozinha-bancada-pia-e-fogao-local', L: 3.2, W: 2.8, pd: 2.7, hwp: 0.9, prod: 'ldv-down12', fm: '0.8', circuito: c2 }, 3),
    amb({ nome: 'Escritório (home office)', amb: 'escr-escrever-teclar-ler-e-processar-dados', L: 3.2, W: 2.6, pd: 2.7, hwp: 0.75, prod: 'lum-ef40-17', fm: '0.8', circuito: c1 }, 4)
  ];
  proj.lumiExt = [Object.assign(ambExtPadrao(1), { nome: 'Estacionamento externo', req: REQX_PADRAO, L: 30, W: 18, arranjo: 'ambos', n: 2, k: 1, h: 7, tilt: 40, recuo: 0.5, prod: 'ref50', fu: 0.45, fd: 0.8, circuito: proj.circuitos.find(c => c.num === '13').id })];
  const K = proj.clima; Object.assign(K, { cidade: 'Campo Grande', uf: 'MS', lat: -20.47, alt: 530, mes: 0, freq: '1%', tbs: 34, tbu: 24, amp: 11, fonte: 'Valores ilustrativos do exemplo — substitua pelos do Anexo A da NBR 16401-1:2024 para a localidade' });
  const envK = (tipo, o) => Object.assign(envPadrao(tipo), o), ambK = o => Object.assign(ambClimaPadrao(), o);
  K.amb = [
    ambK({ nome: 'Suíte', area: 10.2, pd: 2.7, pessoas: 2, ativ: 'sentadoLeve', hIni: 18, hFim: 8, lumiId: proj.lumi[1].id, infil: 0.5, arExt: 'nenhum', env: [envK('parede', { orient: 'O', area: 7.68 }), envK('janela', { orient: 'O', area: 1.5, vidro: 'simples', sombra: 'cortinaClara' }), envK('parede', { orient: 'S', area: 8.1 }), envK('cobertura', { area: 10.2 })], equip: [{ desc: 'Televisor LED', qtd: 1, W: 110, WL: 0 }] }),
    ambK({ nome: 'Sala de estar', area: 16.2, pd: 2.7, pessoas: 4, ativ: 'sentadoLeve', hIni: 12, hFim: 23, lumiId: proj.lumi[0].id, infil: 0.5, arExt: 'nenhum', env: [envK('parede', { orient: 'N', area: 9.75 }), envK('janela', { orient: 'N', area: 2.4, vidro: 'simples', sombra: 'cortinaClara' }), envK('parede', { orient: 'L', area: 9.72 }), envK('cobertura', { area: 16.2 })], equip: [{ desc: 'Televisor LED 50"', qtd: 1, W: 110, WL: 0 }] }),
    ambK({ nome: 'Escritório (home office)', area: 8.32, pd: 2.7, pessoas: 1, ativ: 'escritorio', hIni: 8, hFim: 18, lumiId: proj.lumi[3].id, infil: 0, arExt: 'escritorio', env: [envK('parede', { orient: 'O', area: 7.44 }), envK('janela', { orient: 'O', area: 1.2, vidro: 'simples', sombra: 'cortinaClara' }), envK('cobertura', { area: 8.32 })], equip: [{ desc: 'Computador de mesa com monitor', qtd: 1, W: 150, WL: 0 }, { desc: 'Impressora', qtd: 1, W: 50, WL: 0 }] })
  ];
  const E = proj.energisa; Object.assign(E, { municipio: 'Campo Grande', uf: 'MS', solicitacao: 'Ligação nova' });
  const cg = (g, desc, o) => Object.assign(cargaPadrao(g), { desc }, o);
  Object.assign(E.ucs[0], { nome: 'UC 01', titular: 'Proprietário (exemplo)', doc: '000.000.000-00', complemento: 'Residência unifamiliar', atividadeDesc: 'Residência unifamiliar (uso residencial)', contato: '(67) 0000-0000', classe: 'residencial', atividade: 'residencia', req220: true,
    cargas: [cg('ilum', 'Iluminação (circuitos 1, 2 e 11)', { W: 1490 }), cg('ilum', 'Tomadas de uso geral (circuitos 3, 4, 5 e 12)', { W: 4080 }),
      cg('aquec', 'Chuveiro elétrico 220 V — banheiro social (circ. 6)', { W: 5500 }), cg('aquec', 'Chuveiro elétrico 220 V — suíte (circ. 7)', { W: 7500 }),
      cg('arj', 'Ar-condicionado split 12.000 BTU/h (circ. 8)', { btu: 12000, tipoAr: 'split' }), cg('fogao', 'Forno elétrico (circ. 9)', { W: 1800 }),
      cg('secad', 'Forno de micro-ondas 25 L', { W: 1398 }), cg('mot1', 'Bomba d’água 1/2 cv (circ. 10)', { cv: 0.5 })] });
  const T = proj.aterr;
  Object.assign(T.solo, { modo: 'wenner', p: 0.2, media: 'geo', descartar: true, modelo: 'homog', fs: 1, local: 'terreno da obra — direções A (frente) e B (lateral)', equip: 'terrômetro digital de 4 terminais',
    med: [['A', 1, 26.57], ['A', 2, 11.05], ['A', 4, 4.53], ['A', 8, 1.85], ['A', 16, 0.92], ['B', 1, 24.53], ['B', 2, 11.74], ['B', 4, 4.18], ['B', 8, 1.96], ['B', 16, 0.88]].map(([dir, a, R]) => ({ dir, a, R })) });
  const arK = (tipo, funcao, o) => Object.assign(arrPadrao(tipo, funcao), o);
  T.modo = 'simplificado';
  T.arr = [arK('linha', 'entrada', { nome: 'Padrão de entrada — categoria T3 (NDU 001)', n: 4, e: 2.4, haste: 'h34-240', L: 2.4, d: 17.3, rmax: 20, hc: 0.5, Scond: 16, Lq: 3, caixas: 'todas' })];
  Object.assign(proj.descritivo, { uso: 'Residência unifamiliar térrea', area: 120, pavimentos: 1, padraoLocal: 'no muro frontal, no limite do lote com a via pública, com leitura voltada para a calçada' });
  const qtd = (ini, q) => { const x = proj.materiais.itens.find(m => m.desc.startsWith(ini)); if (x) x.qtd = q; };
  [['DPS classe II', 4], ['Barramento de neutro', 1], ['Barramento de proteção', 1], ['Caixa de embutir 4×2', 30], ['Caixa octogonal', 14], ['Tomada 2P+T 10 A', 18], ['Tomada 2P+T 20 A', 4],
    ['Interruptor simples 10 A', 8], ['Interruptor paralelo', 2], ['Saída de fio', 3], ['Barramento de equipotencialização', 1], ['Conector de emenda', 40], ['Fita isolante', 5], ['Anilhas', 1]].forEach(([i, q]) => qtd(i, q));
  Object.assign(proj.spda, { ativo: true, nome: 'Residência unifamiliar térrea', L: 15, W: 8, H: 5.5, cd: 'menores', ngUF: 'MS', ngMun: 'Campo Grande',
    ocup: 'residencial', piso: 'ceramica', rp: 'manual', rf: 'normal', np: 'III', dps: 'auto', metodo: 'malha', matCapt: 'aluminio70', matAterr: 'cobre50', dParede: 1, prof: 0.5 });
  return proj;
}
if (typeof module !== 'undefined') module.exports = { projetoExemplo, projetoVazio };

/* ================================================================
   INTERFACE — aba SPDA (ABNT NBR 5419:2026)
   ================================================================ */
function normalizarSPDA(s) {
  const base = spdaPadrao(), out = { ...base, ...(s || {}) };
  out.linhas = Array.isArray(s && s.linhas) ? s.linhas.map(l => ({ ...linhaSPDA(l.tipo === 'telecom' ? 'telecom' : 'energia'), ...l })) : base.linhas;
  [['cd', CD_LOC], ['ocup', OCUP_SPDA], ['piso', RT_PISO], ['rp', RP_OP], ['rf', RF_OP], ['hz', HZ_OP], ['vida', VIDA_OP], ['pta', PTA_OP], ['ptu', PTU_OP], ['ks3', KS3_OP], ['matCapt', MAT_CAPT], ['matAterr', MAT_ATERR_SPDA], ['insp', INSP_SPDA]]
    .forEach(([k, T]) => { if (!T[out[k]]) out[k] = base[k]; });
  if (out.np !== 'auto' && PB_SPDA[out.np] == null) out.np = 'auto';
  if (out.dps !== 'auto' && PSPD_NIV[out.dps] == null) out.dps = 'auto';
  if (!['malha', 'franklin'].includes(out.metodo)) out.metodo = 'malha';
  if (!NG_ANEXO_F[out.ngUF]) out.ngUF = 'MS';
  if (out.ngMun && !NG_ANEXO_F[out.ngUF].mun[out.ngMun]) out.ngMun = '';
  out.linhas.forEach(l => { if (!CI_LIN[l.inst]) l.inst = 'aerea'; if (!CE_LIN[l.ce]) l.ce = 'urbano'; if (!CT_LIN[l.ct]) l.ct = 'bt'; if (!BLIND_LIN[l.blind]) l.blind = 'aereaSem'; if (!PLD_RS[l.rs]) l.rs = 'ate20'; if (!UW_LISTA.includes(+l.uw)) l.uw = 2.5; });
  return out;
}
const opSPDA = T => Object.entries(T).map(([k, v]) => [k, `${v[1]} (${fp(v[0])})`]);
function efeitosSPDA(k) { return ['metodo', 'rhoFonte', 'patrimonio', 'np', 'natural', 'ngMun'].includes(k); }
function renderSPDA() {
  const S = PROJ.spda;
  const cab = `<div class="mem-bar"><div><h2 class="tit">SPDA — proteção contra descargas atmosféricas</h2><p class="sub" style="margin:0">ABNT NBR 5419:2026 — análise de risco (Parte 2), projeto do SPDA (Parte 3) e DPS na entrada das linhas (Parte 4).</p></div>
    ${S.ativo ? '<div class="mem-bt"><span class="mini" style="align-self:center">Memorial do SPDA:</span><button class="btn pri" type="button" data-exp="pdf" data-doc="spda">PDF</button><button class="btn" type="button" data-exp="docx" data-doc="spda">Word</button><button class="btn" type="button" data-exp="html" data-doc="spda">HTML</button></div>' : ''}</div>`;
  if (!S.ativo) {
    $('#tab-spda').innerHTML = cab + `<div class="res" style="padding:24px"><h3 class="tit" style="font-size:17px">SPDA fora do projeto</h3>
      <p class="sub">Inclua o SPDA para fazer a análise de risco da estrutura (R1, R3 e frequência de danos), definir o nível de proteção e os DPS necessários e projetar a captação, as descidas e o aterramento em anel, com memorial, desenhos e lista de materiais.</p>
      <button class="btn pri" type="button" id="bt-spda-ativar">Incluir SPDA no projeto</button></div>`;
    return;
  }
  const lin = S.linhas.map((l, i) => `<tr data-scope="spdalin" data-i="${i}">
      <td><input type="checkbox" data-k="ativa" data-type="chk" data-struct="1"${l.ativa ? ' checked' : ''} aria-label="Linha presente"></td>
      <td><input type="text" data-k="nome" value="${esc(l.nome)}" style="width:170px" aria-label="Nome da linha"></td>
      <td><select data-k="tipo" data-struct="1" aria-label="Tipo" style="min-width:120px">${opts([['energia', 'Energia'], ['telecom', 'Telecomunicações']], l.tipo)}</select></td>
      <td><select data-k="inst" aria-label="Instalação">${opts(opSPDA(CI_LIN), l.inst)}</select></td>
      <td><input type="text" inputmode="decimal" data-k="LL" data-type="num" value="${esc(showNum(l.LL))}" style="width:70px" aria-label="Comprimento da linha (m)"></td>
      <td><select data-k="ce" aria-label="Ambiente">${opts(opSPDA(CE_LIN), l.ce)}</select></td>
      <td><select data-k="ct" aria-label="Tipo de linha">${opts(opSPDA(CT_LIN), l.ct)}</select></td>
      <td><select data-k="blind" data-struct="1" aria-label="Blindagem" style="max-width:260px">${opts(Object.entries(BLIND_LIN).map(([k, v]) => [k, `${v[2]} (CLD ${fp(v[0])}, CLI ${fp(v[1])})`]), l.blind)}</select>
        ${l.blind === 'ligada' ? `<select data-k="rs" aria-label="Resistência da blindagem" style="margin-top:4px">${opts(Object.entries(PLD_RS).map(([k, v]) => [k, v[1]]), l.rs)}</select>` : ''}</td>
      <td><select data-k="uw" data-type="numsel" aria-label="Tensão suportável UW" style="min-width:84px">${opts(UW_LISTA.map(u => [u, `${nfmt(u, 1)} kV`]), l.uw)}</select></td></tr>`).join('');
  $('#tab-spda').innerHTML = cab + `
  <div class="banner" style="border-style:solid"><span><b>NBR 5419:2026.</b> NG pela tabela municipal do Anexo F da Parte 2 (municípios de Mato Grosso do Sul incluídos; para outros estados, informe o valor). Probabilidades e perdas adotadas ficam listadas no memorial para conferência.</span><button class="btn sm" type="button" id="bt-spda-retirar">Retirar SPDA do projeto</button></div>
  <div id="spda-resumo"></div>
  <fieldset data-scope="spda"><legend>Estrutura e densidade de descargas</legend><div class="grade">
    ${fTxt('sp', 'nome', 'Estrutura', S.nome, { cls: 'w2' })}${fNum('sp', 'L', 'Comprimento L', S.L, { u: 'm' })}${fNum('sp', 'W', 'Largura W', S.W, { u: 'm' })}${fNum('sp', 'H', 'Altura H', S.H, { u: 'm' })}
    ${fSel('sp', 'cd', 'Localização relativa (CD)', S.cd, opSPDA(CD_LOC), { cls: 'w2' })}
    ${fSel('sp', 'ngMun', `Município — Anexo F (${NG_ANEXO_F[S.ngUF] ? NG_ANEXO_F[S.ngUF].nome : 'UF'})`, S.ngMun, [['', 'Outro município — informar NG'], ...Object.entries((NG_ANEXO_F[S.ngUF] || { mun: {} }).mun).map(([k, v]) => [k, `${k} — NG ${v}`])], { cls: 'w2', struct: true })}
    ${S.ngMun && NG_ANEXO_F[S.ngUF] && NG_ANEXO_F[S.ngUF].mun[S.ngMun] ? fInfo('Densidade de descargas NG', `${NG_ANEXO_F[S.ngUF].mun[S.ngMun]} /km²/ano`) + fChk('sp', 'ngTabela', 'Reproduzir a tabela do Anexo F do estado no memorial', S.ngTabela, { cls: 'w2' })
      : fNum('sp', 'Ng', 'Densidade de descargas NG', S.Ng, { u: '/km²/ano', ph: 'Anexo F' }) + fTxt('sp', 'ngFonte', 'Fonte do NG', S.ngFonte, { cls: 'w2', ph: 'ex.: Anexo F — município de …' })}
  </div></fieldset>
  <fieldset data-scope="spda"><legend>Ocupação e perdas (vida humana e patrimônio)</legend><div class="grade">
    ${fSel('sp', 'ocup', 'Tipo de ocupação (LF)', S.ocup, opSPDA(OCUP_SPDA), { cls: 'w2' })}${fSel('sp', 'piso', 'Piso ou solo junto às descidas (rt)', S.piso, opSPDA(RT_PISO), { cls: 'w2' })}
    ${fSel('sp', 'rp', 'Providências contra incêndio (rp)', S.rp, opSPDA(RP_OP), { cls: 'w2' })}${fSel('sp', 'rf', 'Risco de incêndio ou explosão (rf)', S.rf, opSPDA(RF_OP), { cls: 'w2' })}
    ${fSel('sp', 'hz', 'Perigo especial (hz)', S.hz, opSPDA(HZ_OP), { cls: 'w2' })}
    ${fNum('sp', 'nzNt', 'Pessoas na zona / total', S.nzNt, { u: '%' })}${fNum('sp', 'tz', 'Permanência das pessoas', S.tz, { u: 'h/ano', dica: '8 760 h = o ano todo' })}
    ${fSel('sp', 'vida', 'Falha de sistemas internos põe a vida em risco (LO)', S.vida, opSPDA(VIDA_OP), { cls: 'w2' })}
    ${fChk('sp', 'patrimonio', 'Patrimônio cultural (calcular R3)', S.patrimonio, { struct: true })}${S.patrimonio ? fNum('sp', 'czCt', 'Valor do patrimônio na zona', S.czCt, { u: '%' }) : ''}
    ${fChk('sp', 'critico', 'Sistemas internos críticos (FT = 0,1 por ano)', S.critico, { cls: 'w2' })}
  </div></fieldset>
  <fieldset><legend>Linhas que entram na estrutura</legend>
    <div class="tw"><table class="tbl nt"><thead><tr><th></th><th>Linha</th><th>Tipo</th><th>Instalação (CI)</th><th>LL (m)</th><th>Ambiente (CE)</th><th>Transformador (CT)</th><th>Blindagem</th><th>UW</th></tr></thead><tbody>${lin}</tbody></table></div>
    <p class="mini" style="margin:6px 0 0">LL: comprimento da linha até o primeiro nó (1 000 m quando desconhecido). UW: tensão suportável a impulso dos equipamentos ligados à linha.</p>
  </fieldset>
  <fieldset data-scope="spda"><legend>Medidas de proteção</legend><div class="grade">
    ${fSel('sp', 'np', 'Nível de proteção do SPDA', S.np, [['auto', 'Pela análise de risco (mínimo necessário)'], ...['nenhum', 'IV', 'III', 'II', 'I', 'Inat', 'metal'].map(k => [k, `${NP_TXT[k]} (PB = ${fp(PB_SPDA[k])})`])], { cls: 'w2', struct: true })}
    ${fSel('sp', 'dps', 'DPS na entrada das linhas (MPS)', S.dps, [['auto', 'Pela análise de risco'], ...DPS_OPCOES.map(d => [d, `${DPS_TXT[d]} (PEB = ${fp(PSPD_NIV[d])})`])], { cls: 'w2' })}
    ${fSel('sp', 'pta', 'Proteção contra toque e passo (PTA)', S.pta, opSPDA(PTA_OP), { cls: 'w2' })}${fSel('sp', 'ptu', 'Proteção na entrada das linhas (PTU)', S.ptu, opSPDA(PTU_OP), { cls: 'w2' })}
    ${fSel('sp', 'ks3', 'Cabeamento interno (KS3)', S.ks3, opSPDA(KS3_OP), { cls: 'w2' })}${fNum('sp', 'wm', 'Malha da blindagem espacial', S.wm, { u: 'm', ph: 'sem', dica: 'KS1 = KS2 = 0,12 × wm' })}
  </div></fieldset>
  <fieldset data-scope="spda"><legend>Projeto do SPDA (NBR 5419-3)</legend><div class="grade">
    ${fSel('sp', 'metodo', 'Captação', S.metodo, [['malha', 'Método das malhas (gaiola)'], ['franklin', 'Captores Franklin (ângulo de proteção)']], { cls: 'w2', struct: true })}
    ${S.metodo === 'franklin' ? fNum('sp', 'hm', 'Altura dos mastros acima da cobertura', S.hm, { u: 'm' }) + fNum('sp', 'mx', 'Mastros no comprimento', S.mx) + fNum('sp', 'my', 'Mastros na largura', S.my) : ''}
    ${fSel('sp', 'matCapt', 'Captação e descidas', S.matCapt, Object.entries(MAT_CAPT).map(([k, v]) => [k, v.nome]), { cls: 'w2' })}${fSel('sp', 'matAterr', 'Anel de aterramento', S.matAterr, Object.entries(MAT_ATERR_SPDA).map(([k, v]) => [k, v.nome]), { cls: 'w2' })}
    ${fChk('sp', 'natural', 'Descidas naturais (armaduras contínuas da estrutura)', S.natural, { cls: 'w2', struct: true })}
    ${fNum('sp', 'dParede', 'Afastamento do anel às paredes', S.dParede, { u: 'm' })}${fNum('sp', 'prof', 'Profundidade do anel', S.prof, { u: 'm', dica: 'mínimo 0,5 m' })}
    ${fSel('sp', 'km', 'Meio da distância de segurança (km)', S.km, [['ar', 'Ar (km = 1)'], ['solido', 'Concreto ou alvenaria (km = 0,5)']])}
    ${fSel('sp', 'rhoFonte', 'Resistividade do solo', S.rhoFonte, [['aterr', 'Do módulo Aterramento'], ['direto', 'Informada']], { struct: true })}${S.rhoFonte === 'direto' ? fNum('sp', 'rho', 'ρ do solo', S.rho, { u: 'Ω·m' }) : ''}
    ${fSel('sp', 'insp', 'Periodicidade da inspeção completa', S.insp, Object.entries(INSP_SPDA).map(([k, v]) => [k, `${v[0]} ano${v[0] > 1 ? 's' : ''} — ${v[1]}`]), { cls: 'w2' })}
    <div class="campo wide"><label for="sp-obs">Observações incluídas no memorial</label><textarea id="sp-obs" data-k="obs">${esc(S.obs)}</textarea></div>
  </div></fieldset>
  <section class="res" id="spda-res" aria-live="polite"></section>`;
  renderSPDARes();
}
function renderSPDARes() {
  const box = $('#spda-res'), rs = $('#spda-resumo'), c = CALC.spda; if (!box || !c || !c.ativo) return;
  const r = c.risco, s0 = c.semProt, p = c.projeto, e5 = v => `${nfmt(v * 1e5, 3)} × 10⁻⁵`;
  const met = [['R1 sem medidas', e5(s0.R1), !s0.okR1], ['R1 com as medidas', e5(r.R1), !r.okR1], ['Nível mínimo', c.npMin ? NP_TXT[c.npMin] : 'não atende', !c.npMin], ['Nível adotado', NP_TXT[c.npAdot]],
    ['DPS na entrada', DPS_TXT[c.dpsAdot].replace('DPS compatíveis com ', '')], ['Frequência de danos', `${nfmt(r.F, 3)} /ano (FT ${nfmt(r.FT, 1)})`, !r.okF], ...(PROJ.spda.patrimonio ? [['R3', `${nfmt(r.R3 * 1e4, 3)} × 10⁻⁴`, !r.okR3]] : [])];
  if (rs) rs.innerHTML = `<div class="res" style="margin-bottom:14px"><div class="res-cab"><h3>${esc(PROJ.spda.nome || 'Estrutura')} — análise de risco</h3><span class="pill ${c.status}">${statusTxt(c.status)}</span></div>
    <div class="metr num">${met.map(([x, y, bad]) => `<div><small>${x}</small><span${bad ? ' class="bad"' : ''}>${y}</span></div>`).join('')}</div></div>`;
  const comp = [['RA', 'Toque e passo (descarga na estrutura)', 1], ['RB', 'Danos físicos (descarga na estrutura)', 1], ['RC', 'Sistemas internos (descarga na estrutura)', r.vida], ['RM', 'Sistemas internos (descarga perto)', r.vida], ['RU', 'Ferimentos (descarga na linha)', 1], ['RV', 'Danos físicos (descarga na linha)', 1], ['RW', 'Sistemas internos (descarga na linha)', r.vida], ['RZ', 'Sistemas internos (descarga perto da linha)', r.vida]].filter(x => x[2]);
  const matriz = `<div class="tw"><table class="tbl nt"><thead><tr><th>R1 (× 10⁻⁵)</th>${DPS_OPCOES.map(d => `<th class="r">${esc(DPS_TXT[d].replace('DPS compatíveis com ', 'DPS '))}</th>`).join('')}</tr></thead><tbody>
    ${c.matriz.map(m => `<tr><td>${NP_TXT[m.np]}</td>${m.cel.map((x, j) => `<td class="r"${x && m.np === c.npAdot && DPS_OPCOES[j] === (c.dpsAdot === 'III' ? 'IV' : c.dpsAdot) ? ' style="outline:2px solid var(--accent);outline-offset:-2px"' : ''}>${x ? `<span class="${x.okR1 && x.okR3 ? '' : 'bad'}">${nfmt(x.R1 * 1e5, 3)}${x.okR1 && x.okR3 ? ' ✓' : ''}</span>` : '—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const tabComp = `<div class="tw"><table class="tbl nt"><thead><tr><th>Componente</th><th class="r">Sem medidas</th><th class="r">Com as medidas</th></tr></thead><tbody>
    ${comp.map(([k, d]) => `<tr><td><b>${k}</b> — ${d}</td><td class="r">${e5(s0[k])}</td><td class="r">${e5(r[k])}</td></tr>`).join('')}<tr class="tot"><td>R1</td><td class="r">${e5(s0.R1)}</td><td class="r">${e5(r.R1)}</td></tr></tbody></table></div>`;
  let proj = '';
  if (p) {
    const pm = [['Esfera rolante', `${p.r} m`], ['Malha máxima', `${p.malha} × ${p.malha} m`], ['Captação', p.mastros ? `${p.mx * p.my} mastro(s) · α ${p.a != null ? nfmt(p.a, 1) + '°' : '—'}` : `${nfmt(p.celX, 1)} × ${nfmt(p.celY, 1)} m`, p.mastros && !p.ok], ['Descidas', `${p.nDesc} · máx. ${nfmt(p.espDesc, 1)} m`], ['Anéis intermediários', String(p.nAneis)],
      ['Anel de aterramento', `${nfmt(p.Lanel, 0)} m · re ${nfmt(p.re, 2)} m`], ['l1 mínimo', `${nfmt(p.l1, 2)} m`, !p.okAnel], ['R estimada (informativa)', `${nfmt(p.Ranel, 2)} Ω`], ['Distância de segurança', `${nfmt(p.s, 2)} m`], ['DPS classe I (Iimp/modo)', `${nfmt(p.Iimp, 1)} kA`]];
    proj = `<h3 class="tit" style="font-size:15px;margin:16px 14px 6px">Projeto do SPDA — ${NP_TXT[c.npAdot]}${c.opcional ? ' (adotado por opção; não exigido pela análise de risco)' : ''}</h3>
      <div class="metr num">${pm.map(([x, y, bad]) => `<div><small>${x}</small><span${bad ? ' class="bad"' : ''}>${y}</span></div>`).join('')}</div>
      ${p.mastros && p.sugestao && (p.sugestao.mx !== p.mx || p.sugestao.my !== p.my) ? `<div style="padding:8px 14px 0"><button class="btn sm" type="button" id="bt-spda-sug">Aplicar ${p.sugestao.mx} × ${p.sugestao.my} mastro(s) — menor quantidade que cobre a cobertura</button></div>` : ''}
      <div class="diag-folha" style="margin:12px 14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr))">${plantaSPDASVG(p)}${elevacaoSPDASVG(p)}</div>
      <div class="tw" style="margin:0 14px 12px"><table class="tbl"><thead><tr><th>Material</th><th class="r">Qtd.</th><th>Norma</th></tr></thead><tbody>${p.materiais.map(([d, q, u, n]) => `<tr><td class="wrap">${esc(d)}</td><td class="r">${u === 'm' ? nfmt(q, 0) : q} ${u}</td><td class="mini wrap">${esc(n)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  box.innerHTML = `<div class="res-cab"><h3>Análise de risco e medidas de proteção</h3><span class="mini">${c.npMin == null ? 'nenhuma combinação atende' : c.npMin === 'nenhum' ? `SPDA não exigido · ${minusc(DPS_TXT[c.dpsMin])}` : `exigido NP ${c.npMin}`}</span></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:14px;padding:12px 14px">
      <div style="min-width:0"><p class="mini" style="margin:0 0 6px">Combinações de SPDA e DPS — R1 em 10⁻⁵ (✓ atende; contorno: adotado)</p>${matriz}<div class="diag-folha" style="margin-top:10px">${riscoSPDASVG(c)}</div></div>
      <div style="min-width:0"><p class="mini" style="margin:0 0 6px">Componentes de risco (NBR 5419-2)</p>${tabComp}<p class="mini" style="margin:8px 0 0">ND = ${nfmt(r.ND, 4)} · NM = ${nfmt(r.NM, 3)}${r.linhas.map(l => ` · ${esc(l.nome)}: NL = ${nfmt(l.NL, 4)}, NI = ${nfmt(l.NI, 3)}`).join('')} (eventos por ano)</p></div>
    </div>${proj}
    ${c.falhas.length || c.avisos.length ? `<ul class="msgs">${c.falhas.map(x => `<li class="fail">${esc(x)}</li>`).join('')}${c.avisos.map(x => `<li class="warn">${esc(x)}</li>`).join('')}</ul>` : ''}`;
}

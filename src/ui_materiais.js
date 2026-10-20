/* ================================================================
   INTERFACE — aba Materiais (cadastro e lista) e dados do memorial descritivo
   ================================================================ */
function normalizarMateriais(m) {
  const base = materiaisPadrao(), out = { ...base, ...(m || {}) };
  out.auto = { ...((m && m.auto) || {}) };
  out.itens = Array.isArray(m && m.itens) ? m.itens.map(x => ({ id: x.id || uid(), cat: CAT_MAT[x.cat] ? x.cat : 'div', desc: x.desc || '', un: x.un || 'un', norma: x.norma || '', fab: x.fab || '', qtd: x.qtd ?? 0 })) : base.itens;
  return out;
}
function normalizarDescritivo(d, edif) {
  const base = descritivoPadrao(edif), out = { ...base, ...(d || {}) };
  out.influencias = { ...base.influencias, ...((d && d.influencias) || {}) };
  out.medidas = { ...((d && d.medidas) || {}) };
  out.locais = Array.isArray(d && d.locais) ? d.locais : base.locais;
  return out;
}
const qtdTxt = (x) => x.un === 'm' ? nfmt(x.qtd, 0) : nfmt(x.qtd, x.qtd % 1 ? 1 : 0);
function renderMateriais() {
  const M = PROJ.materiais, cm = CALC.materiais;
  const porCatAuto = ORDEM_CAT.map(k => [k, cm.auto.filter(x => x.cat === k)]).filter(([, l]) => l.length);
  const porCatMan = ORDEM_CAT.map(k => [k, M.itens.map((x, i) => ({ ...x, i })).filter(x => x.cat === k)]).filter(([, l]) => l.length);
  $('#tab-materiais').innerHTML = `
  <div class="mem-bar"><div><h2 class="tit">Materiais</h2><p class="sub" style="margin:0">Cadastro dos materiais elétricos com as normas de fabricação. O quantitativo automático vem dos circuitos, quadros, eletrodutos, luminotécnica e aterramento; os itens do cadastro entram na lista quando recebem quantidade.</p></div>
  <div class="mem-bt"><span class="mini" style="align-self:center">Lista de materiais:</span><button class="btn pri" type="button" data-exp="pdf" data-doc="materiais">PDF</button><button class="btn" type="button" data-exp="docx" data-doc="materiais">Word</button><button class="btn" type="button" data-exp="html" data-doc="materiais">HTML</button><button class="btn" type="button" data-exp="xlsxmat">Excel</button></div></div>
  <fieldset data-scope="mat"><legend>Critérios do quantitativo</legend><div class="grade">
    ${fNum('mt', 'reservaCabo', 'Acréscimo nos condutores', M.reservaCabo, { u: '%' })}${fNum('mt', 'reservaDuto', 'Acréscimo em eletrodutos e eletrocalhas', M.reservaDuto, { u: '%' })}
    ${fChk('mt', 'padrao', 'Incluir o padrão de entrada (Energisa)', M.padrao, { struct: true })}${fChk('mt', 'clima', 'Incluir os condicionadores de ar', M.clima, { struct: true })}
  </div></fieldset>
  <div id="mt-resumo"></div>
  <section class="res"><div class="res-cab"><h3>Quantitativo automático do projeto</h3><span class="mini">${cm.auto.length} itens · desmarque para retirar da lista ou informe outra quantidade</span></div>
    <div class="tw" style="border:0;border-radius:0"><table class="tbl mat"><thead><tr><th></th><th>Descrição</th><th>Norma de fabricação</th><th>Fabricante / ref.</th><th>Origem</th><th class="r">Calculado</th><th class="r">Adotado</th></tr></thead><tbody>
    ${porCatAuto.map(([k, l]) => `<tr class="grp"><td colspan="7">${esc(CAT_MAT[k].nome)}</td></tr>` + l.map(x => `<tr data-scope="matauto" data-key="${esc(x.key)}"${x.off ? ' class="off"' : ''}>
      <td><input type="checkbox" data-k="inc" data-type="chk" data-struct="1"${x.off ? '' : ' checked'} aria-label="Incluir na lista"></td><td class="wrap">${esc(x.desc)}</td><td class="wrap mini">${esc(x.norma || '—')}</td>
      <td><input type="text" data-k="fab" value="${esc(x.fab)}" style="width:120px" aria-label="Fabricante ou referência"></td><td class="mini wrap">${esc((x.origem || []).join(', '))}</td>
      <td class="r">${x.un === 'm' ? nfmt(x.q, 0) : x.q} ${x.un}</td><td class="r"><input type="text" inputmode="decimal" data-k="qtd" data-type="num" value="${esc(showNum((M.auto[x.key] || {}).qtd ?? null))}" placeholder="${x.un === 'm' ? nfmt(x.q, 0) : x.q}" style="width:70px" aria-label="Quantidade adotada"></td></tr>`).join('')).join('')}
    </tbody></table></div></section>
  <section class="res"><div class="res-cab"><h3>Cadastro de materiais</h3><span class="mini">informe a quantidade para incluir o item na lista</span></div>
    <div class="tw" style="border:0;border-radius:0"><table class="tbl mat"><thead><tr><th>Descrição / especificação</th><th>Norma de fabricação</th><th>Fabricante / ref.</th><th>Unid.</th><th class="r">Qtd.</th><th></th></tr></thead><tbody>
    ${porCatMan.map(([k, l]) => `<tr class="grp"><td colspan="6">${esc(CAT_MAT[k].nome)}</td></tr>` + l.map(x => `<tr data-scope="matitem" data-i="${x.i}"${+x.qtd > 0 ? ' class="sel"' : ''}>
      <td><input type="text" data-k="desc" value="${esc(x.desc)}" style="width:100%;min-width:260px" aria-label="Descrição"></td><td><input type="text" data-k="norma" value="${esc(x.norma)}" style="width:170px" aria-label="Norma de fabricação"></td>
      <td><input type="text" data-k="fab" value="${esc(x.fab)}" style="width:120px" aria-label="Fabricante ou referência"></td><td><input type="text" data-k="un" value="${esc(x.un)}" style="width:52px" aria-label="Unidade"></td>
      <td class="r"><input type="text" inputmode="decimal" data-k="qtd" data-type="num" value="${esc(showNum(+x.qtd || null))}" placeholder="0" style="width:64px" aria-label="Quantidade"></td><td><button class="btn sm" type="button" data-delmat="${x.i}" aria-label="Remover item">×</button></td></tr>`).join('')).join('')}
    </tbody></table></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px"><select id="mt-novo-cat" aria-label="Categoria do novo item" style="width:auto">${opts(ORDEM_CAT.map(k => [k, CAT_MAT[k].nome]), 'div')}</select><button class="btn sm" type="button" id="bt-add-mat">+ item no cadastro</button><button class="btn sm" type="button" id="bt-zera-mat">Zerar quantidades do cadastro</button></div>
  </section>`;
  renderMatResumo();
}
function renderMatResumo() {
  const box = $('#mt-resumo'); if (!box) return; const cm = CALC.materiais;
  box.innerHTML = `<div class="mem-cons"><div><b>Lista de materiais</b><span class="mini"> · ${cm.lista.length} itens em ${cm.porCat.length} categorias</span></div><div class="mini">${cm.porCat.map(g => `${esc(g.nome)}: ${g.itens.length}`).join(' · ')}</div></div>`;
  document.querySelectorAll('tr[data-scope="matitem"]').forEach(tr => { const x = PROJ.materiais.itens[+tr.dataset.i]; tr.classList.toggle('sel', !!x && +x.qtd > 0); });
}

/* dados do memorial descritivo — formulário na aba Memória de cálculo */
function descritivoHTML() {
  const D = PROJ.descritivo, P = PROJ.params, inf = D.influencias;
  return `<details class="res" id="m-desc-box" style="padding:0 14px 12px"${DESC_ABERTO ? ' open' : ''}><summary style="padding:12px 0;cursor:pointer;font-weight:600">Dados do memorial descritivo — caracterização e influências externas (NBR 5410, 4.2.6)</summary>
  <div data-scope="desc"><div class="grade">
    ${fTxt('md', 'uso', 'Uso / finalidade da edificação', D.uso, { cls: 'w2', ph: EDIFICACAO[P.edificacao] })}${fNum('md', 'area', 'Área construída', D.area, { u: 'm²' })}${fNum('md', 'pavimentos', 'Pavimentos', D.pavimentos)}
    ${fTxt('md', 'padraoLocal', 'Localização do padrão de entrada', D.padraoLocal, { cls: 'wide' })}
    <div class="campo wide"><label for="md-descricao">Descrição complementar da obra (incluída no objetivo)</label><textarea id="md-descricao" data-k="descricao">${esc(D.descricao)}</textarea></div>
    <div class="campo wide"><label for="md-consideracoes">Considerações adicionais de execução</label><textarea id="md-consideracoes" data-k="consideracoes">${esc(D.consideracoes)}</textarea></div>
  </div></div>
  <div class="tw" style="margin-top:12px"><table class="tbl nt"><thead><tr><th>Código</th><th>Influência externa</th><th>Classe adotada</th><th>Medidas no projeto (deixe vazio para o texto padrão)</th></tr></thead><tbody>
  ${INFLUENCIAS.map(([k, nome, cl]) => `<tr data-scope="descinf" data-inf="${k}"><td><b>${k}</b></td><td class="wrap">${esc(nome)}</td><td><select data-k="cod" data-struct="1" aria-label="Classe de ${esc(nome)}" style="max-width:280px">${opts(cl.map(([c, d]) => [c, `${c.replace('*', '')} — ${d}`]), inf[k])}</select></td>
    <td><textarea data-k="medida" rows="2" style="min-width:260px;min-height:40px" placeholder="${esc(medidaInfluencia(k, inf[k], P))}" aria-label="Medidas no projeto">${esc((D.medidas || {})[k] || '')}</textarea></td></tr>`).join('')}
  </tbody></table></div>
  <h3 class="tit" style="font-size:15px;margin:14px 0 6px">Locais com influências específicas</h3>
  <div class="tw"><table class="tbl nt"><thead><tr><th>Local</th><th>Influências</th><th>Medidas adotadas</th><th></th></tr></thead><tbody>
  ${D.locais.map((l, i) => `<tr data-scope="desclocal" data-i="${i}"><td><textarea data-k="local" rows="2" style="min-width:240px;min-height:40px" aria-label="Local">${esc(l.local)}</textarea></td><td><input type="text" data-k="infl" value="${esc(l.infl)}" style="width:130px" aria-label="Influências"></td><td><textarea data-k="medidas" rows="2" style="min-width:300px;min-height:40px" aria-label="Medidas adotadas">${esc(l.medidas)}</textarea></td><td><button class="btn sm" type="button" data-dellocal="${i}" aria-label="Remover local">×</button></td></tr>`).join('')}
  </tbody></table></div>
  <div style="display:flex;gap:6px;margin-top:8px"><button class="btn sm" type="button" id="bt-add-local">+ local</button><button class="btn sm" type="button" id="bt-inf-padrao">Restaurar classificação padrão (${esc(EDIFICACAO[P.edificacao])})</button></div>
  </details>`;
}

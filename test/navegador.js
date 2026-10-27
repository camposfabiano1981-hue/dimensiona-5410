// Teste de ponta a ponta no navegador e geração dos documentos de exemplo.
//   npm install --no-save playwright && npx playwright install chromium
//   node test/navegador.js
// Abre index.html com o projeto de exemplo, navega pela barra de menus (mouse e teclado), percorre todas as
// seções (inclusive em largura de celular), exporta todos os documentos para exemplo/ e falha se houver erro de
// JavaScript, estouro horizontal ou navegação incorreta.
// Variáveis opcionais: CHROMIUM_PATH (executável do Chromium) e LIBS_DIR (cópias locais de jspdf,
// jspdf-autotable, docx e exceljs, para rodar sem internet).
const fs = require('fs'), path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright')); }

const RAIZ = path.join(__dirname, '..'), OUT = path.join(RAIZ, 'exemplo'), LIBS = process.env.LIBS_DIR;
const LOCAL = LIBS && {
  'jspdf@2.5.1': 'jspdf-2.5.1/package/dist/jspdf.umd.min.js',
  'jspdf-autotable@3.8.2': 'jspdf-autotable-3.8.2/package/dist/jspdf.plugin.autotable.min.js',
  'docx@8.5.0': 'docx-8.5.0/package/build/index.umd.js',
  'exceljs@4.4.0': 'exceljs/package/dist/exceljs.min.js'
};
const ABAS = ['projeto', 'circuitos', 'eletrodutos', 'eletrocalhas', 'quadros', 'dps', 'energisa', 'lumi', 'clima', 'aterr', 'spda', 'materiais', 'memoria', 'tabelas'];
// memorial descritivo com anexos e relatório consolidado (PDF, Word e HTML), memórias separadas e lista de materiais (PDF e Word),
// quadro de cargas (Excel, aba Memória) e lista de materiais (Excel, aba Materiais)
const SEPARADAS = ['circuitos', 'eletrodutos', 'calhas', 'quadros', 'diagramas', 'dps', 'lumi', 'energisa', 'clima', 'aterr', 'spda', 'materiais'];
const DOCS = [['memoria', 'descritivo', ['pdf', 'docx', 'html']], ...SEPARADAS.map(d => ['memoria', d, ['pdf', 'docx']]), ['memoria', 'consolidado', ['pdf', 'docx', 'html']], ['memoria', null, ['xlsx']], ['materiais', null, ['xlsxmat']]];

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await (await browser.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true })).newPage();
  const erros = [];
  page.on('pageerror', e => erros.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) erros.push(m.text()); });
  if (LOCAL) await page.route('**/*', r => {
    const u = r.request().url(), lib = Object.keys(LOCAL).find(k => u.includes(k));
    if (lib) return r.fulfill({ path: path.join(LIBS, LOCAL[lib]), contentType: 'text/javascript' });
    return u.startsWith('file:') || u.startsWith('data:') ? r.continue() : r.abort();
  });
  await page.goto('file://' + path.join(RAIZ, 'index.html') + '#projeto');
  await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(500);

  // barra de menus: cada seção é aberta pelo seu item de menu (submenus abertos com o mouse)
  const estado = () => page.evaluate(() => ({ TAB, LMODO, MEMSEL, REFTAB }));
  const ir = async t => {
    const m = await page.evaluate(t => menuDef().find(x => x.tabs.includes(t)).id, t);
    await page.click(`#mb-${m}`);
    const direto = await page.$(`#menubar .mb-item > .mb-drop > .mb-li > [data-go="${t}"]`);
    if (direto) await direto.click();
    else { const pai = await page.$(`#menubar .mb-item > .mb-drop > .mb-li.tem-sub:has([data-go="${t}"]) > .mb-op`); await pai.click(); await page.click(`#menubar .mb-sub:not([hidden]) [data-go="${t}"]`); }
    await page.waitForTimeout(120);
    const e = await estado(); if (e.TAB !== t) erros.push(`menu: esperado ${t}, aberto ${e.TAB}`);
  };
  const confere = (e, ref, msg) => { for (const k in ref) if (e[k] !== ref[k]) erros.push(`${msg}: ${k} = ${e[k]} (esperado ${ref[k]})`); };
  await page.click('#mb-sist'); await page.hover('#menubar .mb-drop > .mb-li:nth-child(1) > .mb-op'); await page.click('#menubar .mb-sub:not([hidden]) [data-act="lumi:ext"]'); await page.waitForTimeout(150);
  confere(await estado(), { TAB: 'lumi', LMODO: 'ext' }, 'Sistemas › Luminotécnica › Exteriores');
  await page.focus('#mb-projeto'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  const nLumi = String(await page.evaluate(() => MEMORIAS.findIndex(m => m.id === 'lumi') + 1));
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('2'); await page.keyboard.press(nLumi); await page.waitForTimeout(150);
  confere(await estado(), { TAB: 'memoria', MEMSEL: 'lumi' }, `teclado: Documentos › 2 › ${nLumi}`);
  await page.keyboard.press('F4'); await page.waitForTimeout(100); confere(await estado(), { TAB: 'circuitos' }, 'atalho F4');
  await page.keyboard.press('F9'); await page.waitForTimeout(100); confere(await estado(), { TAB: 'memoria', MEMSEL: 'descritivo' }, 'atalho F9');
  await page.click('#mb-tab'); await page.keyboard.press('Escape'); if (await page.$('#menubar .mb-drop')) erros.push('Esc não fechou o menu');
  await page.click('#mb-sist'); await page.mouse.click(5, 880); if (await page.$('#menubar .mb-drop')) erros.push('clique fora não fechou o menu');
  await page.evaluate(() => { LMODO = 'int'; });

  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f));
  for (const [aba, doc, tipos] of DOCS) {
    await ir(aba); await page.waitForTimeout(100);
    for (const t of tipos) {
      const sel = `#tab-${aba} [data-exp="${t}"]` + (doc ? `[data-doc="${doc}"]` : '');
      const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 90000 }), page.click(sel)]);
      const p = path.join(OUT, dl.suggestedFilename()); await dl.saveAs(p);
      console.log('gerado', path.relative(RAIZ, p), fs.statSync(p).size, 'bytes');
    }
  }
  const largura = {};
  for (const w of [1360, 390]) {
    await page.setViewportSize({ width: w, height: 844 });
    for (const t of ABAS) {
      await ir(t);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > w) largura[`${t}@${w}`] = sw;
    }
  }
  await browser.close();
  if (Object.keys(largura).length) erros.push('estouro horizontal: ' + JSON.stringify(largura));
  if (erros.length) { console.error('FALHOU:\n' + erros.join('\n')); process.exit(1); }
  console.log('ok — nenhuma falha em', ABAS.length, 'seções do menu e', DOCS.reduce((s, d) => s + d[2].length, 0), 'documentos');
})().catch(e => { console.error('FALHOU', e); process.exit(1); });

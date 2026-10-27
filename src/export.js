/* ================================================================
   RENDERIZADORES DA MEMÓRIA: HTML (prévia e arquivo), PDF, DOCX
   ================================================================ */
const JSPDF_URL = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
const AUTOTABLE_URL = 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js';
const DOCX_URL = 'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js';
const FONT_REG = '__FONT_REG__';
const FONT_BOLD = '__FONT_BOLD__';

const escH = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
function runs(text) { return String(text ?? '').split('**').map((t, i) => ({ text: t, b: i % 2 === 1 })).filter(r => r.text); }
const runsHTML = text => runs(text).map(r => r.b ? `<strong>${escH(r.text)}</strong>` : escH(r.text)).join('');

const DOC_CSS = `
.doc{background:var(--doc-bg);color:var(--doc-ink);font:10.5pt/1.5 'IBM Plex Sans','Segoe UI',Arial,sans-serif}
.doc .d-title{border:1.5px solid var(--doc-ink);padding:18px 20px 14px;margin-bottom:0}
.doc .d-kicker{font:600 8.5pt/1.2 'Barlow Semi Condensed','Arial Narrow',Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--doc-accent)}
.doc .d-title h2{font:700 21pt/1.1 'Barlow Semi Condensed','Arial Narrow',Arial,sans-serif;margin:6px 0 4px;text-transform:uppercase;letter-spacing:.02em}
.doc .d-title p{margin:0;color:var(--doc-muted)}
.doc .d-parte{background:var(--doc-head);border-left:4px solid var(--doc-accent);padding:14px 18px 12px;margin:6px 0 8px}
.doc .d-parte h2{font:700 17pt/1.15 'Barlow Semi Condensed','Arial Narrow',Arial,sans-serif;margin:4px 0 2px;text-transform:uppercase;letter-spacing:.02em}
.doc .d-parte p{margin:0;color:var(--doc-muted)}
.doc .d-meta{width:100%;border-collapse:collapse;margin:0 0 18px;font-size:9.5pt}
.doc .d-meta th,.doc .d-meta td{border:1px solid var(--doc-ink);border-top:0;padding:5px 8px;text-align:left;vertical-align:top}
.doc .d-meta th{width:28%;font:600 8pt/1.3 'Barlow Semi Condensed','Arial Narrow',Arial,sans-serif;text-transform:uppercase;letter-spacing:.06em;color:var(--doc-muted)}
.doc .d-h1{font:700 13pt/1.25 'Barlow Semi Condensed','Arial Narrow',Arial,sans-serif;color:var(--doc-accent);text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid var(--doc-line);padding-bottom:4px;margin:24px 0 10px}
.doc .d-h2{font:700 11pt/1.3 'IBM Plex Sans',Arial,sans-serif;background:var(--doc-head);padding:6px 10px;margin:22px 0 8px;border-left:3px solid var(--doc-accent)}
.doc .d-h3{font:600 10pt/1.3 'IBM Plex Sans',Arial,sans-serif;margin:14px 0 4px}
.doc p{margin:0 0 8px;max-width:none}
.doc .d-eq{font:9.5pt/1.65 'IBM Plex Mono',Consolas,monospace;background:var(--doc-eq);padding:8px 12px;margin:4px 0 8px;white-space:pre-wrap;overflow-wrap:anywhere}
.doc .d-tw{overflow-x:auto;margin:4px 0 12px}
.doc .d-tbl{width:100%;border-collapse:collapse;font-size:9pt;font-variant-numeric:tabular-nums}
.doc .d-tbl.small{font-size:8pt}
.doc .d-tbl th{background:var(--doc-head);font-weight:600;text-align:left}
.doc .d-tbl th,.doc .d-tbl td{border:1px solid var(--doc-line);padding:3px 6px;vertical-align:top}
.doc .d-tbl td.r,.doc .d-tbl th.r{text-align:right}
.doc .d-tbl tr.bold td{font-weight:600;background:var(--doc-eq)}
.doc .d-kv{width:100%;border-collapse:collapse;font-size:9pt;margin:4px 0 6px}
.doc .d-kv th{width:14%;font-weight:600;color:var(--doc-muted);text-align:left;padding:2px 8px 2px 0;vertical-align:top;white-space:nowrap}
.doc .d-kv td{padding:2px 14px 2px 0;vertical-align:top;width:36%}
@media (max-width:600px){.doc .d-kv th{white-space:normal}.doc .d-kv td{padding-right:8px;overflow-wrap:anywhere}}
.doc ul{margin:0 0 10px;padding-left:20px}.doc li{margin:2px 0}
.doc .d-ver{margin:2px 0 4px;font-weight:500}
.doc .d-ver.ok{color:var(--doc-ok)}.doc .d-ver.fail{color:var(--doc-fail)}
.doc .d-note{font-size:9pt;color:var(--doc-muted);border-left:2px solid var(--doc-line);padding-left:10px}
.doc .d-spec{border:1px solid var(--doc-ink);padding:8px 12px;margin:10px 0 6px;display:flex;gap:12px;align-items:flex-start;justify-content:space-between}
.doc .d-spec strong{font-weight:600}
.doc .d-spec span{flex:none;font:700 8pt/1.6 'Barlow Semi Condensed','Arial Narrow',Arial,sans-serif;text-transform:uppercase;letter-spacing:.06em;padding:1px 8px;border:1px solid currentColor}
.doc .d-spec span.ok{color:var(--doc-ok)}.doc .d-spec span.warn{color:var(--doc-warn)}.doc .d-spec span.fail{color:var(--doc-fail)}
.doc .d-sign{margin:40px auto 0;text-align:center;max-width:360px}
.doc .d-sign .line{border-top:1px solid var(--doc-ink);margin:48px 0 4px}
.doc .d-fig{margin:4px 0 10px;display:flex;gap:12px;align-items:center}
.doc .d-fig svg{width:180px;max-width:45%;height:auto;flex:none;border:1px solid var(--doc-line)}
.doc .d-fig figcaption{font-size:8.5pt;color:var(--doc-muted)}
.doc .d-figs{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:8px 0}
.doc .d-figs figure{margin:0;border:1px solid var(--doc-line);padding:8px;break-inside:avoid}
.doc .d-figs svg{width:100%;height:auto;display:block}
.doc .d-figs figcaption{font-size:8.5pt;margin-top:6px}
.doc .d-figs figcaption b{display:block;font-size:9pt}
`;

function renderHTMLDoc(blocks) {
  return blocks.map(b => {
    switch (b.t) {
      case 'title': return `<header class="d-title"><div class="d-kicker">${escH(b.kicker)}</div><h2>${escH(b.text)}</h2><p>${escH(b.sub)}</p></header>`;
      case 'parte': return `<header class="d-parte"><div class="d-kicker">${escH(b.rotulo || 'Parte')} ${escH(b.letra)}</div><h2>${escH(b.text)}</h2><p>${escH(b.sub)}</p></header>`;
      case 'meta': return `<table class="d-meta"><tbody>${b.rows.map(r => `<tr><th scope="row">${escH(r[0])}</th><td>${escH(r[1])}</td></tr>`).join('')}</tbody></table>`;
      case 'h1': return `<h3 class="d-h1">${escH(b.text)}</h3>`;
      case 'h2': return `<h4 class="d-h2">${escH(b.text)}</h4>`;
      case 'h3': return `<h5 class="d-h3">${escH(b.text)}</h5>`;
      case 'p': return `<p>${runsHTML(b.text)}</p>`;
      case 'eq': return `<div class="d-eq">${b.lines.map(escH).join('\n')}</div>`;
      case 'kv4': return `<table class="d-kv"><tbody>${b.rows.map(r => `<tr><th scope="row">${escH(r[0])}</th><td>${escH(r[1])}</td><th scope="row">${escH(r[2])}</th><td>${escH(r[3])}</td></tr>`).join('')}</tbody></table>`;
      case 'table': {
        const al = b.align || ''; const cls = i => al[i] === 'r' ? ' class="r"' : '';
        return `<div class="d-tw"><table class="d-tbl${b.small ? ' small' : ''}"><thead><tr>${b.head.map((h, i) => `<th${cls(i)}>${escH(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((r, ri) => `<tr${b.lastBold && ri === b.rows.length - 1 ? ' class="bold"' : ''}>${r.map((v, i) => `<td${cls(i)}>${escH(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      }
      case 'list': return `<ul>${b.items.map(i => `<li>${runsHTML(i)}</li>`).join('')}</ul>`;
      case 'ver': return `<p class="d-ver ${b.ok ? 'ok' : 'fail'}">${b.ok ? '✓' : '✗'} ${escH(b.text)}</p>`;
      case 'note': return `<p class="d-note">${runsHTML(b.text)}</p>`;
      case 'spec': return `<div class="d-spec"><div><strong>${escH(b.text)}</strong></div><span class="${b.status}">${escH(b.label)}</span></div>`;
      case 'sign': return `<div class="d-sign"><p>${escH(b.place)}</p><div class="line"></div><p><strong>${escH(b.name)}</strong><br>${escH(b.reg)}</p></div>`;
      case 'fig': return `<figure class="d-fig"${b.w > 60 ? ' style="flex-direction:column;align-items:flex-start"' : ''}>${b.w > 60 ? b.svg.replace('<svg', `<svg style="width:${Math.round(b.w * 3.9)}px;max-width:100%"`) : b.svg}<figcaption>${escH(b.caption)}</figcaption></figure>`;
      case 'figs': return `<div class="d-figs">${b.itens.map(f => `<figure>${f.svg}<figcaption><b>${escH(f.caption)}</b>${escH(f.sub)}${f.circs ? `<br><i>${escH(f.rot ?? 'Circuitos: ')}${escH(f.circs)}</i>` : ''}</figcaption></figure>`).join('')}</div>`;
      case 'break': return '<hr class="d-break">';
    }
    return '';
  }).join('\n');
}

function gerarHTMLArquivo(blocks, titulo) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escH(titulo)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600;700&family=IBM+Plex+Mono&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">
<style>:root{--doc-bg:#fff;--doc-ink:#1b1f23;--doc-muted:#56606a;--doc-line:#b9c3cb;--doc-head:#e7edf1;--doc-eq:#f2f5f7;--doc-accent:#0b5a70;--doc-ok:#1f6e43;--doc-fail:#a8231a;--doc-warn:#8a5a00;color-scheme:light}
body{margin:0;background:#e9edf0}.doc{max-width:180mm;margin:24px auto;padding:20mm 18mm;box-shadow:0 1px 4px rgba(0,0,0,.15)}
@page{size:A4;margin:18mm 16mm 18mm 22mm}@media print{body{background:#fff}.doc{box-shadow:none;margin:0;padding:0;max-width:none}.d-h2{break-after:avoid}.d-h1{break-after:avoid}.d-tbl tr,.d-eq,.d-spec,.d-fig{break-inside:avoid}.d-break{break-after:page;border:0}}
${DOC_CSS}</style></head><body><main class="doc">${renderHTMLDoc(blocks)}</main></body></html>`;
}

const _scripts = {};
function loadScript(src) {
  if (_scripts[src]) return _scripts[src];
  return _scripts[src] = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.async = true;
    s.onload = () => res(); s.onerror = () => { delete _scripts[src]; rej(new Error('Não foi possível carregar a biblioteca de exportação. Verifique a conexão com a internet.')); };
    document.head.appendChild(s);
  });
}

async function rasterizarFiguras(blocks) {
  const m = new Map();
  for (const b of blocks) {
    if (b.t === 'fig') { const px = b.px || 480; m.set(b.svg, await svgParaPNG(b.svg, px, Math.round(px * (b.ar || 0.625)))); }
    if (b.t === 'figs') for (const f of b.itens) m.set(f.svg, await svgParaPNG(f.svg));
  }
  return m;
}
function pngBytes(dataURL) { const bin = atob(dataURL.split(',')[1]); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }

/* ---------------- PDF ---------------- */
async function gerarPDF(blocks, meta) {
  await loadScript(JSPDF_URL); await loadScript(AUTOTABLE_URL);
  const imgs = await rasterizarFiguras(blocks);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  doc.addFileToVFS('DejaVuSans.ttf', FONT_REG); doc.addFont('DejaVuSans.ttf', 'DejaVu', 'normal');
  doc.addFileToVFS('DejaVuSans-Bold.ttf', FONT_BOLD); doc.addFont('DejaVuSans-Bold.ttf', 'DejaVu', 'bold');
  doc.setProperties({ title: meta.titulo, subject: meta.assunto || 'Memória de cálculo — NBR 5410', creator: 'Dimensiona 5410' });
  const M = { l: 22, r: 16, t: 24, b: 20 }, PW = 210, PH = 297, W = PW - M.l - M.r;
  const C = { ink: [27, 31, 35], muted: [86, 96, 106], line: [185, 195, 203], head: [231, 237, 241], eq: [242, 245, 247], acc: [11, 90, 112], ok: [31, 110, 67], fail: [168, 35, 26], warn: [138, 90, 0] };
  let y = M.t;
  const font = (b, s, c = C.ink) => { doc.setFont('DejaVu', b ? 'bold' : 'normal'); doc.setFontSize(s); doc.setTextColor(...c); };
  const lh = s => s * 0.3528 * 1.42;
  const novaPagina = () => { doc.addPage(); y = M.t; };
  const ensure = h => { if (y + h > PH - M.b) novaPagina(); };
  function paragrafo(text, { size = 9.5, x = M.l, w = W, color = C.ink, bold = false, after = 2.2, bullet = null } = {}) {
    const toks = []; runs(text).forEach(r => r.text.split(/(\s+)/).forEach(p => { if (p) toks.push({ w: p, b: r.b || bold }); }));
    const lines = [[]]; let lw = 0;
    toks.forEach(t => {
      font(t.b, size, color); const tw = doc.getTextWidth(t.w); const sp = /^\s+$/.test(t.w);
      if (sp) { if (lines[lines.length - 1].length) { lines[lines.length - 1].push({ ...t, tw }); lw += tw; } return; }
      if (lw + tw > w && lines[lines.length - 1].length) { const cur = lines[lines.length - 1]; while (cur.length && /^\s+$/.test(cur[cur.length - 1].w)) cur.pop(); lines.push([]); lw = 0; }
      lines[lines.length - 1].push({ ...t, tw }); lw += tw;
    });
    const h = lh(size);
    lines.forEach((ln, i) => {
      ensure(h);
      if (bullet && i === 0) { font(false, size, color); doc.text(bullet, x - 4, y + h * 0.75); }
      let cx = x; ln.forEach(t => { font(t.b, size, color); doc.text(t.w, cx, y + h * 0.75); cx += t.tw; });
      y += h;
    });
    y += after;
  }
  function tabela(head, rows, { small = false, widths = null, align = '', lastBold = false, noHead = false, colStyles = null } = {}) {
    const fs = small ? 7.2 : 8.4;
    ensure(Math.min(rows.length, 2) * 6 + (noHead ? 0 : 9));   // não deixa o cabeçalho sozinho no pé da página
    const columnStyles = {};
    (widths || []).forEach((p, i) => { columnStyles[i] = { cellWidth: W * p / 100 }; });
    [...align].forEach((a, i) => { columnStyles[i] = { ...(columnStyles[i] || {}), halign: a === 'r' ? 'right' : 'left' }; });
    if (colStyles) Object.entries(colStyles).forEach(([i, s]) => { columnStyles[i] = { ...(columnStyles[i] || {}), ...s }; });
    doc.autoTable({
      startY: y, head: noHead ? undefined : [head], body: rows, theme: 'grid', rowPageBreak: 'avoid', margin: { left: M.l, right: M.r, top: M.t, bottom: M.b },
      styles: { font: 'DejaVu', fontSize: fs, cellPadding: small ? 1 : 1.4, lineColor: C.line, lineWidth: 0.15, textColor: C.ink, overflow: 'linebreak', valign: 'top' },
      headStyles: { fillColor: C.head, textColor: C.ink, fontStyle: 'bold' }, columnStyles,
      didParseCell: d => { if (lastBold && d.section === 'body' && d.row.index === rows.length - 1) { d.cell.styles.fontStyle = 'bold'; d.cell.styles.fillColor = C.eq; } }
    });
    y = doc.lastAutoTable.finalY + 3.5;
  }
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    switch (b.t) {
      case 'title': {
        font(false, 9); const subL = doc.splitTextToSize(b.sub, W - 10), h = Math.max(30, 22 + subL.length * lh(9) + 2.5);
        doc.setDrawColor(...C.ink); doc.setLineWidth(0.5); doc.rect(M.l, y, W, h);
        font(true, 7.5, C.acc); doc.text(b.kicker.toUpperCase(), M.l + 5, y + 7);
        let ft = 19; font(true, ft, C.ink); while (doc.getTextWidth(b.text.toUpperCase()) > W - 10 && ft > 13) { ft -= 0.5; doc.setFontSize(ft); }
        doc.text(b.text.toUpperCase(), M.l + 5, y + 16);
        font(false, 9, C.muted); doc.text(subL, M.l + 5, y + 22.5);
        y += h; break;
      }
      case 'parte': {
        const h = 24; ensure(h + 40); doc.setFillColor(...C.head); doc.rect(M.l, y, W, h, 'F'); doc.setFillColor(...C.acc); doc.rect(M.l, y, 1.6, h, 'F');
        font(true, 8, C.acc); doc.text(`${(b.rotulo || 'Parte').toUpperCase()} ${b.letra}`, M.l + 6, y + 6.5);
        let ft = 15; font(true, ft, C.ink); while (doc.getTextWidth(b.text.toUpperCase()) > W - 12 && ft > 11) { ft -= 0.5; doc.setFontSize(ft); }
        doc.text(b.text.toUpperCase(), M.l + 6, y + 13.5);
        font(false, 8.6, C.muted); doc.text(doc.splitTextToSize(b.sub, W - 12)[0], M.l + 6, y + 19.5);
        y += h + 4; break;
      }
      case 'meta': {
        doc.autoTable({ startY: y, body: b.rows, theme: 'grid', margin: { left: M.l, right: M.r },
          styles: { font: 'DejaVu', fontSize: 8.8, cellPadding: 1.8, lineColor: C.ink, lineWidth: 0.3, textColor: C.ink },
          columnStyles: { 0: { cellWidth: W * 0.28, fontStyle: 'bold', textColor: C.muted, fontSize: 7.6 } } });
        y = doc.lastAutoTable.finalY + 6; break;
      }
      case 'h1': { font(true, 12.5, C.acc); const ls = doc.splitTextToSize(b.text.toUpperCase(), W), ex = (ls.length - 1) * lh(12.5); ensure(26 + ex); y += 3; font(true, 12.5, C.acc); doc.text(ls, M.l, y + 5); y += 7 + ex; doc.setDrawColor(...C.line); doc.setLineWidth(0.3); doc.line(M.l, y, M.l + W, y); y += 4; break; }
      case 'h2': {
        ensure(Math.max(34, b.keep || 0)); y += 3; font(true, 10.2, C.ink); const ls = doc.splitTextToSize(b.text, W - 6); const h = ls.length * lh(10.2) + 3;
        doc.setFillColor(...C.head); doc.rect(M.l, y, W, h, 'F'); doc.setFillColor(...C.acc); doc.rect(M.l, y, 1, h, 'F');
        doc.text(ls, M.l + 4, y + 1.5 + lh(10.2) * 0.75); y += h + 3; break;
      }
      case 'h3': ensure(18); y += 1.5; paragrafo(b.text, { size: 9.4, bold: true, after: 1 }); break;
      case 'p': paragrafo(b.text); break;
      case 'note': paragrafo(b.text, { size: 8.5, color: C.muted, x: M.l + 3, w: W - 3 }); break;
      case 'list': b.items.forEach(it => paragrafo(it, { size: 9.2, x: M.l + 5, w: W - 5, after: 1, bullet: '•' })); y += 1.5; break;
      case 'eq': {
        font(false, 8.6); const lines = b.lines.flatMap(l => doc.splitTextToSize(l, W - 8)); const h = lines.length * lh(8.6) + 3.4;
        if (h < PH - M.t - M.b) ensure(h);
        doc.setFillColor(...C.eq); doc.rect(M.l, y, W, h, 'F');
        let yy = y + 1.7; lines.forEach(l => { if (yy + lh(8.6) > PH - M.b) { novaPagina(); yy = y; } font(false, 8.6); doc.text(l, M.l + 4, yy + lh(8.6) * 0.75); yy += lh(8.6); });
        y = yy + 1.7 + 2; break;
      }
      case 'ver': paragrafo((b.ok ? '✓ ' : '✗ ') + b.text, { size: 9, color: b.ok ? C.ok : C.fail, after: 1.2 }); break;
      case 'kv4': {
        doc.autoTable({ startY: y, body: b.rows, theme: 'plain', margin: { left: M.l, right: M.r },
          styles: { font: 'DejaVu', fontSize: 8.3, cellPadding: { top: 0.6, bottom: 0.6, left: 0, right: 2.5 }, textColor: C.ink },
          columnStyles: { 0: { cellWidth: 25, textColor: C.muted, fontStyle: 'bold' }, 1: { cellWidth: W / 2 - 25 }, 2: { cellWidth: 25, textColor: C.muted, fontStyle: 'bold' }, 3: { cellWidth: W / 2 - 25 } } });
        y = doc.lastAutoTable.finalY + 2; break;
      }
      case 'table': tabela(b.head, b.rows, b); break;
      case 'spec': {
        font(true, 8.8); const ls = doc.splitTextToSize(b.text, W - 40); const h = ls.length * lh(8.8) + 4; ensure(h);
        doc.setDrawColor(...C.ink); doc.setLineWidth(0.3); doc.rect(M.l, y, W, h);
        doc.text(ls, M.l + 3, y + 2 + lh(8.8) * 0.75);
        const col = b.status === 'ok' ? C.ok : (b.status === 'warn' ? C.warn : C.fail); font(true, 7.4, col);
        const lab = b.label.toUpperCase(); const lw = doc.getTextWidth(lab) + 4; doc.setDrawColor(...col); doc.rect(M.l + W - lw - 3, y + 2, lw, 5); doc.text(lab, M.l + W - lw - 1, y + 5.6);
        y += h + 3; break;
      }
      case 'sign': {
        ensure(48); y += 14; font(false, 9.5); doc.text(b.place, PW / 2, y, { align: 'center' }); y += 20;
        doc.setDrawColor(...C.ink); doc.setLineWidth(0.3); doc.line(PW / 2 - 40, y, PW / 2 + 40, y); y += 5;
        font(true, 9.5); doc.text(b.name, PW / 2, y, { align: 'center' }); y += 4.5; font(false, 8.8, C.muted); doc.text(b.reg, PW / 2, y, { align: 'center' }); y += 6; break;
      }
      case 'fig': {
        if (b.full) {
          font(false, 8.2, C.muted); const ls = doc.splitTextToSize(b.caption, W), h = W * (b.ar || 0.625); ensure(h + 4 + ls.length * lh(8.2));
          doc.addImage(imgs.get(b.svg), 'PNG', M.l, y, W, h); doc.setDrawColor(...C.line); doc.setLineWidth(0.2); doc.rect(M.l, y, W, h);
          y += h + 3.5; font(false, 8.2, C.muted); ls.forEach(l => { y += lh(8.2) * 0.8; doc.text(l, M.l, y); y += lh(8.2) * 0.2; }); y += 4; break;
        }
        const w = b.w || 46, h = w * (b.ar || 0.625); ensure(h + 3);
        doc.addImage(imgs.get(b.svg), 'PNG', M.l, y, w, h); doc.setDrawColor(...C.line); doc.setLineWidth(0.2); doc.rect(M.l, y, w, h);
        font(false, 8.2, C.muted); const ls = doc.splitTextToSize(b.caption, W - w - 6); doc.text(ls, M.l + w + 5, y + h / 2 - (ls.length - 1) * lh(8.2) / 2 + 1);
        y += h + 3; break;
      }
      case 'figs': {
        const gap = 5, cw = (W - 2 * gap) / 3, ih = cw * 100 / 160;
        for (let i = 0; i < b.itens.length; i += 3) {
          const row = b.itens.slice(i, i + 3);
          const caps = row.map(f => { font(true, 8); const a = doc.splitTextToSize(f.caption, cw); font(false, 7.2); const s2 = doc.splitTextToSize(f.sub, cw); const c3 = f.circs ? doc.splitTextToSize((f.rot ?? 'Circuitos: ') + f.circs, cw) : []; return { a, s2, c3, h: a.length * lh(8) + (s2.length + c3.length) * lh(7.2) }; });
          const rh = ih + 2 + Math.max(...caps.map(c => c.h)); ensure(rh + 2);
          row.forEach((f, j) => {
            const x = M.l + j * (cw + gap); doc.addImage(imgs.get(f.svg), 'PNG', x, y, cw, ih); doc.setDrawColor(...C.line); doc.setLineWidth(0.2); doc.rect(x, y, cw, ih);
            let yy = y + ih + 2 + lh(8) * 0.75; font(true, 8); caps[j].a.forEach(l => { doc.text(l, x, yy); yy += lh(8); });
            font(false, 7.2, C.muted); caps[j].s2.forEach(l => { doc.text(l, x, yy); yy += lh(7.2); }); font(false, 7.2, C.acc); caps[j].c3.forEach(l => { doc.text(l, x, yy); yy += lh(7.2); });
          });
          y += rh + 4;
        }
        break;
      }
      case 'break': novaPagina(); break;
    }
  }
  // texto à esquerda e à direita na mesma linha: reduz a fonte (até 6 pt) e, se ainda faltar espaço, abrevia o texto da esquerda
  function linhaPar(esq, dir, yy) {
    const livre = PW - M.l - M.r - doc.getTextWidth(dir) - 4;
    let fs = 7.2; while (doc.getTextWidth(esq) > livre && fs > 6) { fs -= 0.2; doc.setFontSize(fs); }
    if (doc.getTextWidth(esq) > livre) { while (esq.length > 4 && doc.getTextWidth(esq + '…') > livre) esq = esq.slice(0, -1); esq = esq.trimEnd() + '…'; }
    doc.text(esq, M.l, yy); doc.setFontSize(7.2); doc.text(dir, PW - M.r, yy, { align: 'right' });
  }
  const np = doc.getNumberOfPages();
  for (let p = 1; p <= np; p++) {
    doc.setPage(p);
    font(false, 7.2, C.muted); linhaPar(meta.cabecalho, meta.direita, 13);
    doc.setDrawColor(...C.line); doc.setLineWidth(0.25); doc.line(M.l, 15, PW - M.r, 15); doc.line(M.l, PH - 13, PW - M.r, PH - 13);
    font(false, 7.2, C.muted); linhaPar(meta.rodape || 'Memória de cálculo conforme ABNT NBR 5410:2004 — gerada com Dimensiona 5410', `Página ${p} de ${np}`, PH - 9);
  }
  return doc.output('blob');
}

/* ---------------- DOCX ---------------- */
async function gerarDOCX(blocks, meta) {
  await loadScript(DOCX_URL);
  const imgs = await rasterizarFiguras(blocks);
  const D = window.docx; const FONT = 'Calibri', MONO = 'Consolas';
  const ACC = '0B5A70', MUT = '56606A', HEAD = 'E7EDF1', EQ = 'F2F5F7', LINE = 'B9C3CB';
  const tr = (text, o = {}) => runs(text).map(r => new D.TextRun({ text: r.text, bold: r.b || o.bold, size: o.size || 20, color: o.color, font: o.font || FONT }));
  const P = (text, o = {}) => new D.Paragraph({ children: tr(text, o), spacing: { after: o.after ?? 100, before: o.before ?? 0, line: o.line }, alignment: o.align, keepNext: o.keepNext, indent: o.indent, border: o.border, shading: o.shading });
  const borda = (c = LINE) => ({ style: D.BorderStyle.SINGLE, size: 4, color: c });
  const bordas = c => ({ top: borda(c), bottom: borda(c), left: borda(c), right: borda(c) });
  const LARG_DOCX = 11906 - 1250 - 900;   // largura útil da página A4 (twips), igual às margens da seção
  const grade = ws => ws && ws.length ? { columnWidths: ws.map(p => Math.round(LARG_DOCX * p / 100)), layout: D.TableLayoutType.FIXED } : {};
  const cell = (text, o = {}) => new D.TableCell({
    children: [new D.Paragraph({ children: tr(text, { size: o.size || 17, bold: o.bold, color: o.color }), alignment: o.right ? D.AlignmentType.RIGHT : D.AlignmentType.LEFT })],
    shading: o.fill ? { fill: o.fill, type: D.ShadingType.CLEAR, color: 'auto' } : undefined,
    width: o.w ? { size: Math.round(LARG_DOCX * o.w / 100), type: D.WidthType.DXA } : undefined,
    margins: { top: 30, bottom: 30, left: 70, right: 70 }, borders: o.borders
  });
  const out = [];
  for (const b of blocks) {
    switch (b.t) {
      case 'title':
        out.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, rows: [new D.TableRow({ children: [new D.TableCell({ borders: bordas('1B1F23'), margins: { top: 160, bottom: 160, left: 200, right: 200 }, children: [
          P(b.kicker.toUpperCase(), { size: 16, bold: true, color: ACC, after: 60 }), P(b.text.toUpperCase(), { size: 40, bold: true, after: 60 }), P(b.sub, { size: 19, color: MUT, after: 0 })] })] })] }));
        break;
      case 'meta':
        out.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, ...grade([28, 72]), rows: b.rows.map(r => new D.TableRow({ children: [cell(r[0].toUpperCase(), { w: 28, size: 15, bold: true, color: MUT, borders: bordas('1B1F23') }), cell(r[1], { w: 72, size: 19, borders: bordas('1B1F23') })] })) }));
        out.push(P('', { after: 120 })); break;
      case 'h1': out.push(new D.Paragraph({ heading: D.HeadingLevel.HEADING_1, keepNext: true, spacing: { before: 320, after: 140 }, border: { bottom: borda() }, children: [new D.TextRun({ text: b.text.toUpperCase(), bold: true, size: 26, color: ACC, font: FONT })] })); break;
      case 'parte': {
        const band = { shading: { fill: HEAD, type: D.ShadingType.CLEAR, color: 'auto' }, border: { left: { style: D.BorderStyle.SINGLE, size: 36, color: ACC } }, keepNext: true };
        out.push(new D.Paragraph({ ...band, spacing: { before: 0, after: 0 }, children: [new D.TextRun({ text: ' ' + (b.rotulo || 'Parte').toUpperCase() + ' ' + b.letra, bold: true, size: 16, color: ACC, font: FONT })] }));
        out.push(new D.Paragraph({ ...band, heading: D.HeadingLevel.HEADING_1, spacing: { before: 0, after: 0 }, children: [new D.TextRun({ text: ' ' + b.text.toUpperCase(), bold: true, size: 32, color: '1B1F23', font: FONT })] }));
        out.push(new D.Paragraph({ ...band, spacing: { before: 0, after: 240 }, children: [new D.TextRun({ text: ' ' + b.sub, size: 18, color: MUT, font: FONT })] }));
        break;
      }
      case 'h2': out.push(new D.Paragraph({ heading: D.HeadingLevel.HEADING_2, keepNext: true, spacing: { before: 280, after: 120 }, shading: { fill: HEAD, type: D.ShadingType.CLEAR, color: 'auto' }, border: { left: { style: D.BorderStyle.SINGLE, size: 18, color: ACC } }, children: [new D.TextRun({ text: ' ' + b.text, bold: true, size: 22, color: '1B1F23', font: FONT })] })); break;
      case 'h3': out.push(P(b.text, { bold: true, size: 20, before: 140, after: 60, keepNext: true })); break;
      case 'p': out.push(P(b.text)); break;
      case 'note': out.push(P(b.text, { size: 18, color: MUT, indent: { left: 200 } })); break;
      case 'list': b.items.forEach(it => out.push(new D.Paragraph({ children: tr(it, { size: 19 }), bullet: { level: 0 }, spacing: { after: 40 } }))); break;
      case 'eq': b.lines.forEach((l, i) => out.push(new D.Paragraph({ children: [new D.TextRun({ text: l, font: MONO, size: 17 })], shading: { fill: EQ, type: D.ShadingType.CLEAR, color: 'auto' }, indent: { left: 120, right: 120 }, spacing: { before: i === 0 ? 60 : 0, after: i === b.lines.length - 1 ? 120 : 0 }, keepNext: i < b.lines.length - 1 }))); break;
      case 'ver': out.push(new D.Paragraph({ spacing: { after: 50 }, children: [new D.TextRun({ text: (b.ok ? '✓ ' : '✗ ') + b.text, color: b.ok ? '1F6E43' : 'A8231A', size: 19, font: FONT })] })); break;
      case 'kv4': {
        const nb = { top: { style: D.BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: D.BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: D.BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: D.BorderStyle.NONE, size: 0, color: 'FFFFFF' } };
        out.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, ...grade([13, 37, 15, 35]), borders: { insideHorizontal: nb.top, insideVertical: nb.top, ...nb }, rows: b.rows.map(r => new D.TableRow({ children: [cell(r[0], { w: 13, bold: true, color: MUT, borders: nb }), cell(r[1], { w: 37, borders: nb }), cell(r[2], { w: 15, bold: true, color: MUT, borders: nb }), cell(r[3], { w: 35, borders: nb })] })) }));
        out.push(P('', { after: 60 })); break;
      }
      case 'table': {
        const al = b.align || '', ws = b.widths || [];
        const rows = [new D.TableRow({ tableHeader: true, children: b.head.map((h, i) => cell(h, { bold: true, fill: HEAD, size: b.small ? 15 : 17, right: al[i] === 'r', w: ws[i] })) })]
          .concat(b.rows.map((r, ri) => new D.TableRow({ cantSplit: true, children: r.map((v, i) => cell(String(v), { size: b.small ? 15 : 17, right: al[i] === 'r', w: ws[i], bold: b.lastBold && ri === b.rows.length - 1, fill: b.lastBold && ri === b.rows.length - 1 ? EQ : undefined })) })));
        out.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, ...grade(ws.length === b.head.length ? ws : null), rows })); out.push(P('', { after: 80 })); break;
      }
      case 'spec': {
        const col = b.status === 'ok' ? '1F6E43' : (b.status === 'warn' ? '8A5A00' : 'A8231A');
        out.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, rows: [new D.TableRow({ children: [
          new D.TableCell({ width: { size: 80, type: D.WidthType.PERCENTAGE }, borders: bordas('1B1F23'), margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [P(b.text, { bold: true, size: 18, after: 0 })] }),
          new D.TableCell({ width: { size: 20, type: D.WidthType.PERCENTAGE }, borders: bordas('1B1F23'), margins: { top: 80, bottom: 80, left: 80, right: 80 }, verticalAlign: D.VerticalAlign.CENTER, children: [new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [new D.TextRun({ text: b.label.toUpperCase(), bold: true, size: 15, color: col, font: FONT })] })] })] })] }));
        out.push(P('', { after: 60 })); break;
      }
      case 'sign':
        out.push(P(b.place, { align: D.AlignmentType.CENTER, before: 480, after: 720 }));
        out.push(P('______________________________________', { align: D.AlignmentType.CENTER, after: 40 }));
        out.push(P(b.name, { align: D.AlignmentType.CENTER, bold: true, after: 20 }));
        out.push(P(b.reg, { align: D.AlignmentType.CENTER, color: MUT })); break;
      case 'fig':
        { const wpx = b.full ? 640 : Math.round((b.w || 46) * 4.17); out.push(new D.Paragraph({ keepNext: true, spacing: { before: 60, after: 20 }, children: [new D.ImageRun({ data: pngBytes(imgs.get(b.svg)), transformation: { width: wpx, height: Math.round(wpx * (b.ar || 0.625)) } })] })); }
        out.push(P(b.caption, { size: 16, color: MUT, after: 100 })); break;
      case 'figs': {
        const nb = { style: D.BorderStyle.SINGLE, size: 4, color: LINE };
        const linhas = [];
        for (let i = 0; i < b.itens.length; i += 3) {
          const row = b.itens.slice(i, i + 3);
          while (row.length < 3) row.push(null);
          linhas.push(new D.TableRow({ cantSplit: true, children: row.map(f => new D.TableCell({ width: { size: 33, type: D.WidthType.PERCENTAGE }, borders: { top: nb, bottom: nb, left: nb, right: nb }, margins: { top: 80, bottom: 80, left: 80, right: 80 },
            children: f ? [new D.Paragraph({ children: [new D.ImageRun({ data: pngBytes(imgs.get(f.svg)), transformation: { width: 184, height: 115 } })] }), P(f.caption, { bold: true, size: 17, after: 20 }), P(f.sub, { size: 15, color: MUT, after: 20 }), ...(f.circs ? [P((f.rot ?? 'Circuitos: ') + f.circs, { size: 15, color: ACC, after: 0 })] : [])] : [P('')] })) }));
        }
        out.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, rows: linhas })); break;
      }
      case 'break': out.push(new D.Paragraph({ children: [new D.PageBreak()] })); break;
    }
  }
  const doc = new D.Document({
    creator: 'Dimensiona 5410', title: meta.titulo, description: meta.assunto || 'Memória de cálculo — ABNT NBR 5410:2004',
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1300, bottom: 1150, left: 1250, right: 900, header: 560, footer: 520 } } },
      headers: { default: new D.Header({ children: [new D.Paragraph({ border: { bottom: borda() }, tabStops: [{ type: D.TabStopType.RIGHT, position: 9700 }], children: [new D.TextRun({ text: meta.cabecalho, size: 15, color: MUT, font: FONT }), new D.TextRun({ text: '\t' + meta.direita, size: 15, color: MUT, font: FONT })] })] }) },
      footers: { default: new D.Footer({ children: [new D.Paragraph({ border: { top: borda() }, tabStops: [{ type: D.TabStopType.RIGHT, position: 9700 }], children: [new D.TextRun({ text: meta.rodape || 'Memória de cálculo conforme ABNT NBR 5410:2004 — gerada com Dimensiona 5410', size: 15, color: MUT, font: FONT }), new D.TextRun({ children: ['\tPágina ', D.PageNumber.CURRENT, ' de ', D.PageNumber.TOTAL_PAGES], size: 15, color: MUT, font: FONT })] })] }) },
      children: out
    }]
  });
  return await D.Packer.toBlob(doc);
}

/* ---------------- EXCEL (quadro de cargas) ---------------- */
const EXCELJS_URL = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
async function gerarXLSX(proj, calc, so) {
  await loadScript(EXCELJS_URL);
  const X = window.ExcelJS; if (!X) throw new Error('Biblioteca de planilhas indisponível.');
  const wb = new X.Workbook(); wb.creator = 'Dimensiona 5410'; wb.created = new Date(); wb.calcProperties.fullCalcOnLoad = true;
  const P = proj.params, I = proj.info, R = calc.res;
  const AZUL = 'FF0B5A70', CAB = 'FFE7EDF1', ENTRADA = 'FFFFF4CC', LN = { style: 'thin', color: { argb: 'FFB9C3CB' } }, BOX = { top: LN, left: LN, bottom: LN, right: LN };
  const usados = new Set();
  const nomeAba = s => { const b = String(s).replace(/[\\/?*\[\]:]/g, '-'); let n = b.slice(0, 31), k = 2; while (usados.has(n.toLowerCase())) n = b.slice(0, 27) + ' (' + k++ + ')'; usados.add(n.toLowerCase()); return n; };
  const L = i => { let s = ''; for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + (i - 1) % 26) + s; return s; };
  const r2 = v => v == null || !isFinite(v) ? null : Math.round(v * 100) / 100;
  const forn = { monofasico: 'monofásico', bifasico: 'bifásico', trifasico: 'trifásico' }[P.fornecimento];
  function cabecalho(ws, titulo, n) {
    const linhas = [titulo, `Obra: ${I.obra || '—'}${I.cliente ? ' — ' + I.cliente : ''}`, `Sistema: ${P.U0}/${P.U} V, ${forn}, esquema ${P.aterramento} · Responsável: ${[I.responsavel, I.registro].filter(Boolean).join(' — ') || '—'} · ${I.revisao || 'R00'} · ${dataCurta(I.data) || ''}`];
    linhas.forEach((t, i) => { ws.mergeCells(i + 1, 1, i + 1, n); const c = ws.getCell(i + 1, 1); c.value = t; c.font = i ? { size: 10, color: { argb: 'FF56606A' } } : { bold: true, size: 14, color: { argb: AZUL } }; });
    return linhas.length + 2;
  }
  // tabela: cols = [{h, w, fmt, al}], rows = arrays; retorna {r0, r1}
  function tabela(ws, r0, cols, rows) {
    const hr = ws.getRow(r0);
    cols.forEach((c, j) => { const cell = hr.getCell(j + 1); cell.value = c.h; cell.font = { bold: true, size: 10 }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CAB } }; cell.border = BOX; cell.alignment = { vertical: 'middle', horizontal: c.al === 'l' ? 'left' : 'center', wrapText: true }; if (c.w) ws.getColumn(j + 1).width = c.w; });
    hr.height = 30;
    rows.forEach((row, i) => { const rr = ws.getRow(r0 + 1 + i); row.forEach((v, j) => { const cell = rr.getCell(j + 1); cell.value = v; cell.border = BOX; cell.font = { size: 10 }; if (cols[j].fmt) cell.numFmt = cols[j].fmt; cell.alignment = { vertical: 'top', horizontal: cols[j].al === 'l' ? 'left' : (cols[j].al === 'c' ? 'center' : 'right'), wrapText: cols[j].al === 'l' }; }); });
    ws.views = [{ state: 'frozen', ySplit: r0, xSplit: 0 }];
    if (rows.length) ws.autoFilter = { from: { row: r0, column: 1 }, to: { row: r0 + rows.length, column: cols.length } };
    return { r0, r1: r0 + rows.length };
  }
  const fasesDe = c => (c.fases || '').split('').slice(0, nFases(c.ligacao)).join('-');
  const conduto = r => r.calha ? (r.calha.esc ? `${r.calha.T.nome} ${r.calha.esc.W}×${r.calha.esc.H} mm` : 'não dimensionada') : (r.trecho && r.trecho.esc ? `${r.trecho.esc.nome} DN ${r.trecho.esc.dn} (${r.trecho.esc.pol})` : (r.trecho && !r.trecho.aplica ? 'não se aplica' : '—'));
  const secoes = (c, r) => { const k = r.nPar > 1 ? r.nPar + '×' : ''; return `${k}${fS(r.Sf)} / ${r.hasN ? k + fS(r.SN) : '—'} / ${r.SPE ? k + fS(r.SPE) : '—'}${c.material === 'Al' ? ' Al' : ''}`; };

  /* lista de materiais (sozinha ou como última aba) */
  function abaMateriais() {
    const cm = calc.materiais || calcMateriais(proj, calc); if (!cm.lista.length) return;
    const ws = wb.addWorksheet(nomeAba('Lista de materiais'), { pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 } });
    const cols = [{ h: 'Item', w: 6, al: 'c' }, { h: 'Categoria', w: 22, al: 'l' }, { h: 'Descrição / especificação', w: 62, al: 'l' }, { h: 'Norma de fabricação', w: 30, al: 'l' }, { h: 'Fabricante / ref.', w: 18, al: 'l' }, { h: 'Unid.', w: 7, al: 'c' }, { h: 'Qtd.', w: 9, fmt: '#,##0.##' }, { h: 'Origem', w: 22, al: 'l' }];
    const r0 = cabecalho(ws, 'Lista de materiais', cols.length);
    tabela(ws, r0, cols, cm.lista.map((x, i) => [i + 1, CAT_MAT[x.cat].nome, x.desc, x.norma || '', x.fab || '', x.un, x.qtd, x.auto ? (x.origem || []).join(', ') : 'cadastro']));
  }
  if (so === 'materiais') { abaMateriais(); const b = await wb.xlsx.writeBuffer(); return new Blob([b], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); }

  /* uma aba por quadro */
  Object.values(calc.quadros).forEach(q => {
    const Qd = (proj.quadros || {})[q.q] || {}, us = q.usadas, d = q.dem;
    const cols = [{ h: 'Circ.', w: 8, al: 'c' }, { h: 'Descrição', w: 34, al: 'l' }, { h: 'Tipo', w: 18, al: 'l' }, { h: 'Ligação', w: 13, al: 'c' }, { h: 'Fases', w: 7, al: 'c' }, { h: 'P (W)', w: 10, fmt: '#,##0' }, { h: 'FP', w: 6, fmt: '0.00' }, { h: 'S (VA)', w: 10, fmt: '#,##0' }, { h: 'IB (A)', w: 8, fmt: '0.00' }, { h: 'FCT', w: 6, fmt: '0.00' }, { h: 'FCA', w: 6, fmt: '0.00' }, { h: 'F / N / PE (mm²)', w: 15, al: 'c' }, { h: 'Proteção', w: 11, al: 'c' }, { h: 'DR', w: 14, al: 'c' }, { h: 'ΔV acum. (%)', w: 9, fmt: '0.00' }, ...us.map(l => ({ h: `Fase ${l} (VA)`, w: 11, fmt: '#,##0' })), { h: 'Situação', w: 14, al: 'c' }];
    const ws = wb.addWorksheet(nomeAba('QC ' + q.q), { pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 } });
    const r0 = cabecalho(ws, `Quadro de cargas — ${q.q}${Qd.desc ? ' — ' + Qd.desc : ''}`, cols.length);
    const rows = q.cs.map(c => { const r = R[c.id], f = cargaFases(c, r); return [c.num, c.desc || TIPOS[c.tipo], TIPOS[c.tipo], composicao(c), fasesDe(c), r2(r.P), r2(r.fp), r2(r.S), r2(r.IB), r2(r.FCT), r2(r.FCA), secoes(c, r), protecaoCurta(c, r), r.drUsado ? `${r.drIn ?? '?'} A / ${r.idn} mA` : '—', r2(r.dvTotal), ...us.map(l => f[l] ? r2(f[l]) : null), statusTxt(r.status)]; });
    const { r1 } = tabela(ws, r0, cols, rows);
    const a = r0 + 1, b = Math.max(r1, a), cS = L(7), cP = L(5), cT = L(2), iF = 15;
    const tot = ws.getRow(r1 + 1); tot.getCell(1).value = 'Total';
    const soma = (j, res) => { const cell = tot.getCell(j + 1); cell.value = rows.length ? { formula: `SUM(${L(j)}${a}:${L(j)}${b})`, result: res } : 0; cell.numFmt = '#,##0'; };
    soma(5, r2(q.cs.reduce((s, c) => s + R[c.id].P, 0))); soma(7, r2(q.cs.reduce((s, c) => s + R[c.id].S, 0))); us.forEach((l, k) => soma(iF + k, r2(q.fases[l])));
    for (let j = 0; j < cols.length; j++) { const cell = tot.getCell(j + 1); cell.font = { bold: true, size: 10 }; cell.border = BOX; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CAB } }; }
    // bloco de demanda (FD e demanda informada editáveis: as fórmulas recalculam)
    let y = r1 + 3; const dist = TIPOS.dist.replace(/"/g, '');
    const lin = (rot, val, fmt, entrada) => { ws.mergeCells(y, 1, y, 4); const c1 = ws.getCell(y, 1); c1.value = rot; c1.font = { size: 10, bold: !entrada }; const c2 = ws.getCell(y, 5); ws.mergeCells(y, 5, y, 6); c2.value = val; c2.numFmt = fmt; c2.border = BOX; c2.font = { size: 10, bold: true }; if (entrada) c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ENTRADA } }; return `E${y++}`; };
    ws.getCell(y, 1).value = 'Demanda do quadro'; ws.getCell(y, 1).font = { bold: true, size: 12, color: { argb: AZUL } }; y++;
    const cTerm = lin('Carga instalada — circuitos terminais (VA)', rows.length ? { formula: `SUMIF(${cT}${a}:${cT}${b},"<>${dist}",${cS}${a}:${cS}${b})`, result: r2(d.Sterm) } : 0, '#,##0');
    const cJus = lin('Demanda dos quadros a jusante (VA)', rows.length ? { formula: `SUMIF(${cT}${a}:${cT}${b},"${dist}",${cS}${a}:${cS}${b})`, result: r2(d.Sjus) } : 0, '#,##0');
    const cFD = lin('Fator de demanda (editável)', d.fd, '0%', true);
    const cDM = lin('Demanda informada, kVA (opcional — substitui o fator)', d.manual ? d.dm : null, '0.00', true);
    const cD = lin('Demanda (VA)', { formula: `IF(N(${cDM})>0,${cDM}*1000,${cFD}*${cTerm}+${cJus})`, result: r2(d.S) }, '#,##0');
    const den = P.fornecimento === 'trifasico' ? `(SQRT(3)*${P.U})` : (P.fornecimento === 'bifasico' ? `(2*${P.U0})` : `${P.U0}`);
    const Idem = P.fornecimento === 'trifasico' ? d.S / (Math.sqrt(3) * P.U) : (P.fornecimento === 'bifasico' ? d.S / (2 * P.U0) : d.S / P.U0);
    lin(`Corrente de demanda (A) — ${forn}`, { formula: `${cD}/${den}`, result: r2(Idem) }, '0.0');
    if (us.length > 1 && rows.length) { const fr = us.map((l, k) => `${L(iF + k)}${r1 + 1}`).join(','); lin('Desequilíbrio entre fases (Smáx − Smín) / Smáx', { formula: `IF(MAX(${fr})>0,(MAX(${fr})-MIN(${fr}))/MAX(${fr}),0)`, result: q.deseq / 100 }, '0.0%'); }
    if (q.alim) lin(`Alimentado pelo circuito ${q.alim.num} (quadro ${q.alim.quadro})`, `${condutoresTxt(R[q.alim.id])} — ${protecaoTxt(q.alim, R[q.alim.id])}`, '@');
    y++; ws.mergeCells(y, 1, y, cols.length); const nt = ws.getCell(y, 1); nt.value = 'Células em amarelo podem ser editadas; as fórmulas de demanda e corrente recalculam. O dimensionamento dos condutores do alimentador deve ser refeito no Dimensiona 5410 se a demanda mudar.'; nt.font = { italic: true, size: 9, color: { argb: 'FF56606A' } }; nt.alignment = { wrapText: true }; ws.getRow(y).height = 26;
  });

  /* circuitos (todos) */
  {
    const cols = [{ h: 'Circ.', w: 8, al: 'c' }, { h: 'Quadro', w: 9, al: 'c' }, { h: 'Descrição', w: 34, al: 'l' }, { h: 'Tipo', w: 18, al: 'l' }, { h: 'Ligação', w: 13, al: 'c' }, { h: 'Fases', w: 7, al: 'c' }, { h: 'U (V)', w: 7, fmt: '0' }, { h: 'P (W)', w: 10, fmt: '#,##0' }, { h: 'FP', w: 6, fmt: '0.00' }, { h: 'S (VA)', w: 10, fmt: '#,##0' }, { h: 'IB (A)', w: 8, fmt: '0.00' }, { h: 'L (m)', w: 7, fmt: '0.0' },
      { h: 'Condutor', w: 30, al: 'l' }, { h: 'Maneira de instalar', w: 10, al: 'c' }, { h: 'FCT', w: 6, fmt: '0.00' }, { h: 'FCA', w: 6, fmt: '0.00' }, { h: 'Fator total', w: 8, fmt: '0.000' }, { h: 'F / N / PE (mm²)', w: 15, al: 'c' }, { h: 'Iz (A)', w: 8, fmt: '0.0' }, { h: 'Proteção', w: 18, al: 'l' }, { h: 'DR', w: 16, al: 'c' }, { h: 'ΔV circ. (%)', w: 9, fmt: '0.00' }, { h: 'ΔV acum. (%)', w: 9, fmt: '0.00' }, { h: 'Conduto', w: 28, al: 'l' }, { h: 'Situação', w: 14, al: 'c' }, { h: 'Pendências e observações', w: 60, al: 'l' }];
    const ws = wb.addWorksheet(nomeAba('Circuitos'), { pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 } });
    const r0 = cabecalho(ws, 'Circuitos — dimensionamento (ABNT NBR 5410)', cols.length);
    tabela(ws, r0, cols, proj.circuitos.map(c => { const r = R[c.id]; return [c.num, c.quadro, c.desc || TIPOS[c.tipo], TIPOS[c.tipo], composicao(c), fasesDe(c), r.V, r2(r.P), r2(r.fp), r2(r.S), r2(r.IB), r2(r.L), cabosTxt(c), `${r.met.id} / ${r.ref}`, r2(r.FCT), r2(r.FCA), r.fTot != null ? Math.round(r.fTot * 1000) / 1000 : null, secoes(c, r), r2(r.Iz), protecaoTxt(c, r), drTxt(r), r2(r.dv), r2(r.dvTotal), conduto(r), statusTxt(r.status), r.falhas.concat(r.avisos).join(' | ')]; }));
  }
  /* eletrodutos */
  const TE = Object.values(calc.trechos).filter(t => t.aplica && !(calc.calhas || {})[t.key]);
  if (TE.length) {
    const cols = [{ h: 'Trecho', w: 26, al: 'l' }, { h: 'Circuitos', w: 18, al: 'l' }, { h: 'Condutores', w: 10, fmt: '0' }, { h: 'ΣA (mm²)', w: 10, fmt: '0.0' }, { h: 'Taxa máx.', w: 9, fmt: '0%' }, { h: 'Di mín. (mm)', w: 10, fmt: '0.0' }, { h: 'Eletroduto adotado', w: 34, al: 'l' }, { h: 'Di (mm)', w: 8, fmt: '0.0' }, { h: 'Ocupação', w: 9, fmt: '0.0%' }, { h: 'Entre caixas (m)', w: 10, fmt: '0.0' }, { h: 'Curvas', w: 7, fmt: '0' }, { h: 'Situação', w: 12, al: 'c' }, { h: 'Observações', w: 60, al: 'l' }];
    const ws = wb.addWorksheet(nomeAba('Eletrodutos'));
    const r0 = cabecalho(ws, 'Eletrodutos — ocupação (6.2.11.1)', cols.length);
    tabela(ws, r0, cols, TE.map(t => [t.nome, t.circuitos.map(c => c.num).join(', '), t.n, r2(t.A), t.taxa, r2(t.diMin), t.esc ? `${t.esc.nome} DN ${t.esc.dn} (${t.esc.pol})` : 'não dimensionado', t.esc ? r2(t.esc.di) : null, t.esc ? t.esc.ocup / 100 : null, t.cfg.comp > 0 ? +t.cfg.comp : null, +t.cfg.curvas || 0, t.status === 'fail' ? 'Não atende' : 'Atende', t.falhas.concat(t.avisos).join(' | ')]));
  }
  /* eletrocalhas */
  const K = Object.values(calc.calhas || {});
  if (K.length) {
    const cols = [{ h: 'Trecho', w: 26, al: 'l' }, { h: 'Tipo', w: 28, al: 'l' }, { h: 'Circuitos', w: 16, al: 'l' }, { h: 'Cabos', w: 7, fmt: '0' }, { h: 'ΣA (mm²)', w: 10, fmt: '#,##0' }, { h: 'Σd (mm)', w: 9, fmt: '0' }, { h: 'Taxa máx.', w: 9, fmt: '0%' }, { h: 'Reserva', w: 8, fmt: '0%' }, { h: 'Larg. mín. (mm)', w: 10, fmt: '0' }, { h: 'Adotada L × H (mm)', w: 14, al: 'c' }, { h: 'Ocupação', w: 9, fmt: '0.0%' }, { h: 'Com reserva', w: 9, fmt: '0.0%' }, { h: 'Peso (kg/m)', w: 9, fmt: '0.00' }, { h: 'Carga adm. (kg/m)', w: 10, fmt: '0.0' }, { h: 'Vão (m)', w: 7, fmt: '0.00' }, { h: 'Suportes', w: 8, fmt: '0' }, { h: 'Situação', w: 12, al: 'c' }, { h: 'Observações', w: 60, al: 'l' }];
    const ws = wb.addWorksheet(nomeAba('Eletrocalhas'));
    const r0 = cabecalho(ws, 'Eletrocalhas, perfilados, bandejas e leitos', cols.length);
    tabela(ws, r0, cols, K.map(t => [t.nome, t.T.nome, t.circuitos.map(c => c.num).join(', '), t.n, r2(t.A), r2(t.somaD), t.cfg.taxa / 100, (t.cfg.reserva || 0) / 100, t.Wmin != null ? r2(t.Wmin) : null, t.esc ? `${t.esc.W} × ${t.esc.H}` : '—', t.esc ? t.ocup / 100 : null, t.esc ? t.ocupRes / 100 : null, r2(t.peso), t.cfg.carga || null, t.cfg.tipo !== 'canaleta' ? t.cfg.vao : null, t.nSup || null, t.status === 'fail' ? 'Não atende' : 'Atende', t.falhas.concat(t.avisos).join(' | ')]));
  }
  /* luminotécnico */
  const A = proj.lumi || [];
  if (A.length && calc.lumi) {
    const cols = [{ h: 'Ambiente', w: 22, al: 'l' }, { h: 'Atividade (NBR ISO/CIE 8995-1)', w: 34, al: 'l' }, { h: 'Área (m²)', w: 9, fmt: '0.00' }, { h: 'Em (lx)', w: 8, fmt: '0' }, { h: 'UGRL', w: 6, al: 'c' }, { h: 'Ra mín.', w: 7, fmt: '0' }, { h: 'Luminária', w: 40, al: 'l' }, { h: 'P lum. (W)', w: 9, fmt: '0.0' }, { h: 'Fluxo (lm)', w: 9, fmt: '#,##0' }, { h: 'K', w: 6, fmt: '0.00' }, { h: 'UF', w: 6, fmt: '0.000' }, { h: 'FM', w: 6, fmt: '0.00' }, { h: 'N calc.', w: 7, fmt: '0.00' }, { h: 'N', w: 5, fmt: '0' }, { h: 'Arranjo', w: 8, al: 'c' }, { h: 'Eméd (lx)', w: 9, fmt: '0' }, { h: 'Emín (lx)', w: 9, fmt: '0' }, { h: 'Uo', w: 6, fmt: '0.00' }, { h: 'P total (W)', w: 9, fmt: '#,##0' }, { h: 'W/m²', w: 7, fmt: '0.0' }, { h: 'Circuito', w: 8, al: 'c' }, { h: 'Situação', w: 14, al: 'c' }, { h: 'Observações', w: 60, al: 'l' }];
    const ws = wb.addWorksheet(nomeAba('Luminotécnico'));
    const r0 = cabecalho(ws, 'Cálculo luminotécnico — método dos lúmens (ABNT NBR ISO/CIE 8995-1)', cols.length);
    const rows = A.map(a => { const r = calc.lumi[a.id], c = proj.circuitos.find(x => x.id === a.circuito); return [a.nome, r.req.n, r2(r.A), r.Em, r.UGR ?? '—', r.Ra, `${r.prod.fab !== '—' ? r.prod.fab + ' — ' : ''}${r.prod.mod}${r.prod.tipo === 'lampada' ? ` (${r.nLamp} lâmp.)` : ''}`, r2(r.Wlum), Math.round(r.phi), r2(r.K), Math.round(r.UF * 1000) / 1000, r2(r.FM), r2(r.Nreq), r.N, `${r.nx} × ${r.ny}`, Math.round(r.Emed), Math.round(r.Emin), r2(r.Uo), r2(r.P), r2(r.dens), c ? c.num : '—', statusTxt(r.status), r.falhas.concat(r.avisos).join(' | ')]; });
    const { r1 } = tabela(ws, r0, cols, rows);
    const tot = ws.getRow(r1 + 1); tot.getCell(1).value = 'Total';
    [[2, '0.00', A.reduce((s, a) => s + calc.lumi[a.id].A, 0)], [13, '0', A.reduce((s, a) => s + calc.lumi[a.id].N, 0)], [18, '#,##0', A.reduce((s, a) => s + calc.lumi[a.id].P, 0)]].forEach(([j, f, v]) => { const cell = tot.getCell(j + 1); cell.value = { formula: `SUM(${L(j)}${r0 + 1}:${L(j)}${r1})`, result: r2(v) }; cell.numFmt = f; });
    for (let j = 0; j < cols.length; j++) { const cell = tot.getCell(j + 1); cell.font = { bold: true, size: 10 }; cell.border = BOX; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CAB } }; }
  }
  /* iluminação de exteriores */
  const AX = proj.lumiExt || [];
  if (AX.length && calc.lumiExt) {
    const cols = [{ h: 'Área', w: 22, al: 'l' }, { h: 'Requisito', w: 40, al: 'l' }, { h: 'L (m)', w: 7, fmt: '0.0' }, { h: 'W (m)', w: 7, fmt: '0.0' }, { h: 'Área (m²)', w: 9, fmt: '#,##0' }, { h: 'Eméd exig. (lx)', w: 9, fmt: '0' }, { h: 'U0 exig.', w: 7, fmt: '0.00' }, { h: 'Projetor', w: 36, al: 'l' }, { h: 'P (W)', w: 7, fmt: '0' }, { h: 'Fluxo (lm)', w: 9, fmt: '#,##0' }, { h: 'Facho (°)', w: 7, fmt: '0' }, { h: 'Arranjo', w: 30, al: 'l' }, { h: 'Postes', w: 7, fmt: '0' }, { h: 'h (m)', w: 6, fmt: '0.0' }, { h: 'Incl. (°)', w: 7, fmt: '0' }, { h: 'Fu', w: 6, fmt: '0.00' }, { h: 'Fd', w: 6, fmt: '0.00' }, { h: 'N calc.', w: 7, fmt: '0.00' }, { h: 'N', w: 5, fmt: '0' }, { h: 'Eméd pp (lx)', w: 9, fmt: '0' }, { h: 'Emín (lx)', w: 9, fmt: '0' }, { h: 'U0', w: 6, fmt: '0.00' }, { h: 'P total (W)', w: 9, fmt: '#,##0' }, { h: 'Circuito', w: 8, al: 'c' }, { h: 'Situação', w: 14, al: 'c' }, { h: 'Observações', w: 60, al: 'l' }];
    const ws = wb.addWorksheet(nomeAba('Iluminação externa'));
    const r0 = cabecalho(ws, 'Iluminação de exteriores — método dos lúmens e ponto a ponto (NBR 5101 / EN 12464-2)', cols.length);
    tabela(ws, r0, cols, AX.map(a => { const r = calc.lumiExt[a.id], c = proj.circuitos.find(x => x.id === a.circuito); return [a.nome, r.req.n, r2(r.L), r2(r.W), r2(r.A), r.Em, r2(r.U0req), r.prod.nome, r.Wlum, r.phi, r.prod.facho, ARRANJOS_EXT[a.arranjo], r.nPostes, r2(r.h), +a.tilt || 0, r2(r.Fu), r2(r.Fd), r2(r.Nreq), r.N, Math.round(r.EmedPP), Math.round(r.EminPP), r2(r.U0), r.P, c ? c.num : '—', statusTxt(r.status), r.falhas.concat(r.avisos).join(' | ')]; }));
  }
  /* demanda Energisa (NDU 001 / NDU 003) */
  if (calc.energisa && (proj.energisa || {}).ucs) {
    const ce = calc.energisa, E = ce.E, R = E.ucs.map(u => ce.ucs[u.id]);
    const cols = [{ h: 'UC', w: 10, al: 'l' }, { h: 'Titular', w: 26, al: 'l' }, { h: 'CPF / CNPJ', w: 18, al: 'l' }, { h: 'Nº instalação', w: 13, al: 'l' }, { h: 'Unidade', w: 18, al: 'l' }, { h: 'Classe', w: 14, al: 'l' }, { h: 'Atividade (Tab. 5)', w: 22, al: 'l' },
      { h: 'C (kW)', w: 9, fmt: '0.000' }, ...['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].map(h => ({ h: h + ' (kW)', w: 8, fmt: '0.000' })), { h: 'd (kW)', w: 9, fmt: '0.000' }, { h: 'D (kVA)', w: 9, fmt: '0.00' }, { h: 'Tipo', w: 6, al: 'c' }, { h: 'Categoria', w: 9, al: 'c' },
      { h: 'Disjuntor (A)', w: 10, al: 'c' }, { h: 'Ramal de conexão', w: 34, al: 'l' }, { h: 'Ramal de entrada', w: 40, al: 'l' }, { h: 'Aterramento', w: 18, al: 'l' }, { h: 'Eletroduto', w: 10, al: 'c' }, { h: 'Caixa', w: 12, al: 'c' }, { h: 'Situação', w: 14, al: 'c' }, { h: 'Observações', w: 60, al: 'l' }];
    const ws = wb.addWorksheet(nomeAba('Demanda Energisa'), { pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 } });
    const r0 = cabecalho(ws, `Demanda — ${ENERGISA_UN[E.un] || E.un} · ${MODOS_E[E.modo]} · ${ENERGISA_TENSOES[E.tensao]?.nome || E.tensao}`, cols.length);
    const { r1 } = tabela(ws, r0, cols, R.map(r => { const p = r.padrao || {}; return [r.u.nome, r.u.titular || '', r.u.doc || '', r.u.instalacao || 'nova', r.u.complemento || '', CLASSES_UC[r.u.classe] || '', ATIV_T5[r.u.atividade]?.nome || '', +r.C.toFixed(3), ...['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].map(k => +(r.d[k] || 0).toFixed(3)), { formula: `SUM(${L(8)}${0}:${L(14)}${0})`, result: +r.DkW.toFixed(3) }, { formula: '', result: +r.D.toFixed(2) }, r.tipo, r.cat ? r.cat.cat : '—', p.disj || '—', p.ramalCon || '', p.ramalEnt || '', p.aterr ? `Cu ${p.aterr} mm² + ${p.hastes} haste(s)` : '', p.eletro || '', p.caixa || '', statusTxt(r.status), r.falhas.concat(r.avisos).join(' | ')]; }));
    for (let i = r0 + 1; i <= r1; i++) { ws.getCell(i, 16).value = { formula: `SUM(${L(8)}${i}:${L(14)}${i})`, result: ws.getCell(i, 16).value.result }; ws.getCell(i, 17).value = { formula: `${L(15)}${i}/0.92`, result: ws.getCell(i, 17).value.result }; }
    let y = r1 + 2;
    const lin = (rot, val, fmt) => { ws.mergeCells(y, 1, y, 6); ws.getCell(y, 1).value = rot; ws.getCell(y, 1).font = { size: 10, bold: true }; const c = ws.getCell(y, 7); c.value = val; c.numFmt = fmt || '@'; c.font = { size: 10, bold: true }; c.border = BOX; y++; };
    if (E.modo === 'agrupamento') { lin('Demanda do agrupamento (kVA)', { formula: `SUM(${L(16)}${r0 + 1}:${L(16)}${r1})`, result: +ce.Dsoma.toFixed(2) }, '0.00'); lin('Corrente (A)', +ce.Iagr.toFixed(1), '0.0'); }
    if (E.modo === 'edificio') { lin('Apartamentos (N)', ce.N || 0, '0'); lin('D1 — apartamentos (kVA)', +(ce.D1 || 0).toFixed(2), '0.00'); lin('D2 — condomínio, lojas e outros (kVA)', +(ce.D2 || 0).toFixed(2), '0.00'); lin('D = D1 + D2 (kVA)', +(ce.Dtot || 0).toFixed(2), '0.00'); }
    ws.mergeCells(y + 1, 1, y + 1, cols.length); const nt = ws.getCell(y + 1, 1); nt.value = `Cálculo conforme Energisa ${NDU001_VER}${E.modo !== 'individual' ? ' e ' + NDU003_VER : ''}. D (kVA) = d (kW) / 0,92.`; nt.font = { italic: true, size: 9, color: { argb: 'FF56606A' } };
    const cols2 = [{ h: 'UC', w: 10, al: 'l' }, { h: 'Parcela', w: 8, al: 'c' }, { h: 'Grupo de carga', w: 44, al: 'l' }, { h: 'Descrição', w: 44, al: 'l' }, { h: 'Qtd.', w: 6, fmt: '0' }, { h: 'Unitário', w: 22, al: 'l' }, { h: 'kW unitário', w: 10, fmt: '0.000' }, { h: 'Total (kW)', w: 10, fmt: '0.000' }];
    const ws2 = wb.addWorksheet(nomeAba('Cargas Energisa'));
    const q0 = cabecalho(ws2, 'Relação de cargas instaladas por unidade consumidora (NDU 001)', cols2.length);
    const rows2 = R.flatMap(r => r.itens.map(it => [r.u.nome, GRUPOS_CARGA[it.g].d, GRUPOS_CARGA[it.g].nome, it.desc, it.q, it.ref || `${nfmt(it.W, 0)} W`, +it.kWu.toFixed(3), +it.kWt.toFixed(3)]));
    const { r1: q1 } = tabela(ws2, q0, cols2, rows2);
    for (let i = q0 + 1; i <= q1; i++) ws2.getCell(i, 8).value = { formula: `E${i}*G${i}`, result: ws2.getCell(i, 8).value };
  }
  /* carga térmica (NBR 16401) */
  if (calc.clima && (proj.clima || {}).amb && proj.clima.amb.length) {
    const cc = calc.clima, Cc = cc.C, A = Cc.amb;
    const cols = [{ h: 'Ambiente', w: 26, al: 'l' }, { h: 'Área (m²)', w: 9, fmt: '0.00' }, { h: 'Ocupantes', w: 9, fmt: '0' }, { h: 'Sensível (W)', w: 11, fmt: '#,##0' }, { h: 'Latente (W)', w: 11, fmt: '#,##0' }, { h: 'Total (W)', w: 11, fmt: '#,##0' }, { h: 'FCS', w: 7, fmt: '0.00' }, { h: 'Hora do pico', w: 8, fmt: '0' }, { h: 'W/m²', w: 8, fmt: '0' }, { h: 'Margem', w: 8, fmt: '0%' }, { h: 'BTU/h (c/ margem)', w: 12, fmt: '#,##0' }, { h: 'TR', w: 7, fmt: '0.00' }, { h: 'Ar exterior (L/s)', w: 10, fmt: '0.0' }, { h: 'Equipamento indicado', w: 22, al: 'l' }, { h: 'Potência elétrica (W)', w: 11, fmt: '#,##0' }, { h: 'Observações', w: 50, al: 'l' }];
    const ws = wb.addWorksheet(nomeAba('Carga térmica'), { pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 } });
    const r0 = cabecalho(ws, `Carga térmica — NBR 16401-1:2024 · ${[Cc.cidade, Cc.uf].filter(Boolean).join('/')} · TBS ${nfmt(+Cc.tbs, 1)} °C / TBU ${nfmt(+Cc.tbu, 1)} °C · interno ${nfmt(+Cc.tint, 1)} °C, ${nfmt(+Cc.urInt, 0)} %`, cols.length);
    const { r1 } = tabela(ws, r0, cols, A.map(a => { const r = cc.amb[a.id]; return [a.nome, +a.area, +a.pessoas, Math.round(r.Qs), Math.round(r.Ql), Math.round(r.Q), +r.FCS.toFixed(2), r.hPico, Math.round(r.Wm2), (+Cc.margem || 0) / 100, Math.round(r.BTU), +r.TR.toFixed(2), +r.Vef.toFixed(1), `${r.equip.n > 1 ? r.equip.n + ' × ' : ''}${r.equip.cap} BTU/h`, Math.round(r.Pel), r.falhas.concat(r.avisos).join(' | ')]; }));
    for (let i = r0 + 1; i <= r1; i++) { ws.getCell(i, 6).value = { formula: `D${i}+E${i}`, result: ws.getCell(i, 6).value }; ws.getCell(i, 11).value = { formula: `F${i}*(1+J${i})*3.412142`, result: ws.getCell(i, 11).value }; ws.getCell(i, 12).value = { formula: `F${i}*(1+J${i})/3516.85`, result: ws.getCell(i, 12).value }; }
    const tot = ws.getRow(r1 + 1); tot.getCell(1).value = 'Total (soma dos picos)';
    [[2, '0.00'], [4, '#,##0'], [5, '#,##0'], [6, '#,##0'], [11, '#,##0'], [12, '0.00'], [15, '#,##0']].forEach(([c, f]) => { const cell = tot.getCell(c); cell.value = { formula: `SUM(${L(c - 1)}${r0 + 1}:${L(c - 1)}${r1})` }; cell.numFmt = f; });
    for (let j = 1; j <= cols.length; j++) { const cell = tot.getCell(j); cell.font = { bold: true, size: 10 }; cell.border = BOX; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CAB } }; }
    const ws2 = wb.addWorksheet(nomeAba('Perfil horário'));
    const cols2 = [{ h: 'Hora solar', w: 9, fmt: '0' }, { h: 'Temperatura externa (°C)', w: 12, fmt: '0.0' }, ...A.map(a => ({ h: `${a.nome} (W)`, w: 16, fmt: '#,##0' })), { h: 'Simultânea (W)', w: 14, fmt: '#,##0' }];
    const q0 = cabecalho(ws2, `Perfil horário da carga térmica — dia 21 de ${MESES_C[+Cc.mes].toLowerCase()}`, cols2.length);
    const { r1: q1 } = tabela(ws2, q0, cols2, Array.from({ length: 24 }, (_, j) => [j + 1, +tempExt(Cc, j + 1).toFixed(1), ...A.map(a => Math.round(cc.amb[a.id].T[j])), Math.round(cc.T[j])]));
    for (let i = q0 + 1; i <= q1; i++) ws2.getCell(i, cols2.length).value = { formula: `SUM(${L(2)}${i}:${L(cols2.length - 2)}${i})`, result: ws2.getCell(i, cols2.length).value };
  }
  abaMateriais();
  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

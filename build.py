"""Gera a aplicação em um único arquivo HTML a partir de src/ e fonts/.

    python3 build.py

Saídas:
  index.html            aplicação completa (abre direto no navegador; publicada no GitHub Pages)
  dimensiona-5410.html  mesma aplicação sem <html>/<head>, para publicação como Artifact (não versionado)
"""
import base64, pathlib, sys
root = pathlib.Path(__file__).resolve().parent
src = root / 'src'
out_dir = root

shell = (src / 'shell.html').read_text(encoding='utf-8')
ORDEM = ['tables.js', 'engine.js', 'calhas.js', 'lumi.js', 'energisa.js', 'clima.js', 'pictos.js', 'sample.js', 'memorial.js', 'lumidoc.js', 'energisadoc.js', 'climadoc.js', 'export.js', 'ui_energisa.js', 'ui_clima.js', 'ui.js']
js = '\n'.join((src / f).read_text(encoding='utf-8') for f in ORDEM)
reg = base64.b64encode((root / 'fonts/DejaVuSans-sub.ttf').read_bytes()).decode()
bold = base64.b64encode((root / 'fonts/DejaVuSans-Bold-sub.ttf').read_bytes()).decode()
js = js.replace("'__FONT_REG__'", "'" + reg + "'").replace("'__FONT_BOLD__'", "'" + bold + "'")
assert '__FONT_' not in js
if '</script' in js.lower():
    sys.exit('script contains </script')

page = shell + '\n<script>\n' + js + '\n</script>\n'
(out_dir / 'dimensiona-5410.html').write_text(page, encoding='utf-8')

head, body = shell.split('<div class="app">', 1)
reset = ':root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}'
standalone = ('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
              '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
              f'<style>{reset}</style>\n{head}</head>\n<body>\n<div class="app">{body}\n<script>\n{js}\n</script>\n</body>\n</html>\n')
(out_dir / 'index.html').write_text(standalone, encoding='utf-8')
print('ok', len(page), len(standalone))

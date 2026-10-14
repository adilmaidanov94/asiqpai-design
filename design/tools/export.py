#!/usr/bin/env python3
"""Export design tokens (tokens.css -> tokens.json) and icons (icons.js -> SVG files).
Run from design/: python3 tools/export.py
"""
import json, os, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
css = (ROOT / 'assets/css/tokens.css').read_text(encoding='utf-8')
root_block = re.search(r':root\s*\{(.*?)\n\}', css, re.S).group(1)

tokens = {}
for m in re.finditer(r'--([a-z0-9-]+):\s*([^;]+);', root_block):
    name, val = m.group(1), m.group(2).strip()
    group = name.split('-')[0]
    tokens.setdefault(group, {})[name] = val

# Figma / Tokens Studio friendly structure
out = {
    "$meta": {"name": "ASIQPAI Design Tokens", "version": "1.0", "date": "2026-10-14", "theme": "dark-fixed",
              "source": "assets/css/tokens.css", "format": "W3C-DTCG-like; values are CSS strings"},
    "color": {}, "typography": {}, "spacing": {}, "radius": {}, "size": {}, "shadow": {}, "motion": {}
}
def put(cat, key, val, typ):
    out[cat][key] = {"$value": val, "$type": typ}
for g, items in tokens.items():
    for k, v in items.items():
        if g in ('bg', 'surface', 'line', 'fg', 'gold', 'trk', 'success', 'warning', 'danger', 'info', 'rec', 'scrim'):
            put('color', k, v, 'color' if not v.startswith('linear') else 'gradient')
        elif g in ('font', 'fs', 'lh', 'ts'):
            put('typography', k, v, 'fontFamily' if g == 'font' else 'dimension' if g == 'fs' else 'number')
        elif g in ('s', 'gutter'):
            put('spacing', k, v, 'dimension')
        elif g == 'r':
            put('radius', k, v, 'dimension')
        elif g in ('touch', 'appbar', 'tabbar', 'miniplayer'):
            put('size', k, v, 'dimension')
        elif g in ('shadow', 'glow'):
            put('shadow', k, v, 'shadow')
        elif g in ('ease', 'd'):
            put('motion', k, v, 'cubicBezier' if g == 'ease' else 'duration')
(ROOT / 'assets/tokens.json').write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
print('tokens.json:', sum(len(v) for k, v in out.items() if k != '$meta'), 'tokens')

# Icons
js = (ROOT / 'assets/js/icons.js').read_text(encoding='utf-8')
body = re.search(r'ASQ\.ICONS\s*=\s*\{(.*?)\n\};', js, re.S).group(1)
icons = re.findall(r"\n\s*([A-Za-z0-9]+):\s*'(.*?)'(?:,|\s*$)", body)
d = ROOT / 'assets/export/icons'; d.mkdir(parents=True, exist_ok=True)
for name, paths in icons:
    fill = 'currentColor' if name in ('play', 'pause', 'stop') else 'none'
    stroke = 'none' if fill != 'none' else 'currentColor'
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="%s" stroke="%s" '
           'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">%s</svg>' % (fill, stroke, paths))
    (d / (re.sub(r'(?<!^)(?=[A-Z])', '-', name).lower() + '.svg')).write_text(svg, encoding='utf-8')
print('icons:', len(icons))

# Logo mark + app icon
logo = ROOT / 'assets/export/logo'; logo.mkdir(parents=True, exist_ok=True)
mic = dict(icons)['mic']
mark = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0CF7E"/><stop offset=".45" stop-color="#D9AE52"/><stop offset="1" stop-color="#B48834"/></linearGradient></defs>
<rect width="128" height="128" rx="32" fill="url(#g)"/>
<g transform="translate(28 28) scale(3)" fill="none" stroke="#1A1408" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">%s</g>
</svg>''' % mic
(logo / 'asiqpai-mark.svg').write_text(mark, encoding='utf-8')
wordmark = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 96" width="420" height="96">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0CF7E"/><stop offset=".45" stop-color="#D9AE52"/><stop offset="1" stop-color="#B48834"/></linearGradient></defs>
<rect width="420" height="96" fill="#0E0D0B"/>
<rect x="16" y="16" width="64" height="64" rx="18" fill="url(#g)"/>
<g transform="translate(31 31) scale(1.45)" fill="none" stroke="#1A1408" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">%s</g>
<text x="100" y="62" font-family="Unbounded, Arial Black, sans-serif" font-weight="700" font-size="34" letter-spacing="3" fill="#F4EFE4">ASIQPAI</text>
</svg>''' % mic
(logo / 'asiqpai-wordmark.svg').write_text(wordmark, encoding='utf-8')
print('logo: 2 files')

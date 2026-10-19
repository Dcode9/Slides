#!/usr/bin/env python3
"""Inline everything from src/ into one self-contained HTML file."""
import pathlib, re
root = pathlib.Path(__file__).parent
src = root / 'src'
html = (src / 'index.html').read_text()
for key, fn in [('STYLE','style.css'),('PAPER','paper.js'),('CONTENT','content.js'),('WORLD','world.js'),('DECK','deck.js')]:
    body = (src / fn).read_text()
    assert '</script' not in body.lower(), fn
    html = html.replace('/*__%s__*/' % key, body)
out = root / 'Glimpses_of_India_X_Sigma.html'
out.write_text(html, encoding='utf-8')
(root / 'index.html').write_text(html, encoding='utf-8')
print(out, len(html)//1024, 'kB')

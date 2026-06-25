import type { Chart } from '../types'
import { SIGNS, PMETA, PORDER, signOf } from './astro'

const STROKE = '#C9A957'
const SUB = '#B2A079'
const ACC = '#A8742B'

/** Standalone SVG string (Word-safe fonts, no interactivity) for rasterization. */
function svgMarkup(houses: string[][], asc: number): string {
  let s = `<svg xmlns='http://www.w3.org/2000/svg' width='560' height='560' viewBox='0 0 400 400'>`
  s += `<rect x='2' y='2' width='396' height='396' rx='6' fill='#FCFAF4' stroke='${STROKE}' stroke-width='1.6'/>`
  s += `<polygon points='200,0 100,100 200,200 300,100' fill='#F1E6CF' opacity='0.85'/>`
  s += `<line x1='2' y1='2' x2='398' y2='398' stroke='${STROKE}' stroke-width='1.4'/><line x1='398' y1='2' x2='2' y2='398' stroke='${STROKE}' stroke-width='1.4'/>`
  s += `<polygon points='200,2 398,200 200,398 2,200' fill='none' stroke='${STROKE}' stroke-width='1.4'/>`
  const CEN: Array<[number, number]> = [
    [200, 100], [100, 40], [40, 100], [100, 200], [40, 300], [100, 360],
    [200, 300], [300, 360], [360, 300], [300, 200], [360, 100], [300, 40],
  ]
  for (let i = 0; i < 12; i++) {
    const c = CEN[i]
    const sign = signOf(i, asc)
    const pl = houses[i] || []
    s += `<text x='${c[0]}' y='${c[1] - 11}' text-anchor='middle' font-size='10' font-weight='600' fill='${SUB}' font-family='Arial'>${sign}</text>`
    if (pl.length)
      s += `<text x='${c[0]}' y='${c[1] + 8}' text-anchor='middle' font-size='13.5' font-weight='700' fill='${i === 0 ? ACC : '#9A6A28'}' font-family='Arial'>${pl.join('  ')}</text>`
    if (i === 0)
      s += `<text x='${c[0]}' y='${c[1] + 24}' text-anchor='middle' font-size='8' font-weight='700' fill='${ACC}' font-family='Arial'>ASC</text>`
  }
  return s + '</svg>'
}

function svgToPng(svgStr: string, size: number): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr)
    img.onload = () => {
      const cv = document.createElement('canvas')
      cv.width = size
      cv.height = size
      const ctx = cv.getContext('2d')!
      ctx.fillStyle = '#FCFAF4'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      resolve(cv.toDataURL('image/png'))
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function download(filename: string, blob: Blob) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    URL.revokeObjectURL(a.href)
    a.remove()
  }, 600)
}

const esc = (t: string) =>
  (t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const nl = (t: string) => esc(t).replace(/\n/g, '<br/>')

/** Build a Word-compatible .doc from a chart + its notes and trigger a download. */
export async function exportChartDoc(c: Chart): Promise<void> {
  const png = await svgToPng(svgMarkup(c.houses, c.ascSign), 560)

  let rows = ''
  PORDER.forEach((code) => {
    for (let i = 0; i < 12; i++) {
      if (c.houses[i].includes(code)) {
        rows += `<tr><td style='padding:4px 10px'><b>${code}</b> ${PMETA[code]}</td><td style='padding:4px 10px'>${SIGNS[signOf(i, c.ascSign) - 1]}</td><td style='padding:4px 10px'>House ${i + 1}</td></tr>`
      }
    }
  })

  const notesHtml = c.notes.whole ? `<p>${nl(c.notes.whole)}</p>` : '<p><i>No notes yet.</i></p>'

  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${esc(c.name)} — Astro Karma</title></head><body style="font-family:Calibri,Arial,sans-serif;color:#2C2820;line-height:1.5">
<h1 style='font-family:Georgia,serif;color:#7A521C;margin-bottom:2px'>${esc(c.name)}</h1>
<p style='color:#777;margin-top:0'>${esc(c.date)}${c.place ? ' &middot; ' + esc(c.place) : ''} &middot; ${SIGNS[c.ascSign - 1]} Lagna &middot; Lahiri ayan&#257;m&#347;a</p>
${png ? `<p><img src='${png}' width='340' height='340' alt='North Indian chart'/></p>` : ''}
<h2 style='font-family:Georgia,serif;color:#7A521C'>Planet positions</h2>
<table cellspacing='0' style='border-collapse:collapse;border:1px solid #ddd'>${rows || "<tr><td style='padding:6px'>No planets placed.</td></tr>"}</table>
<h2 style='font-family:Georgia,serif;color:#7A521C'>Notes</h2>
${notesHtml}
<p style='color:#aaa;font-size:11px;margin-top:28px'>Exported from Astro Karma &middot; ${new Date().toLocaleDateString()}</p>
</body></html>`

  download(`${(c.name || 'chart').replace(/[^\w]+/g, '_')}.doc`, new Blob(['﻿' + html], { type: 'application/msword' }))
}

export async function downloadChartsPng(elements, filename) {
  const svgToImage = (el) => new Promise((resolve) => {
    const svg = el?.querySelector("svg");
    if (!svg) { resolve(null); return; }
    const box = svg.getBoundingClientRect();
    const w = Math.ceil(box.width) || 600;
    const h = Math.ceil(box.height) || 320;
    const clone = svg.cloneNode(true);
    clone.setAttribute("width", w);
    clone.setAttribute("height", h);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const data = new XMLSerializer().serializeToString(clone);
    const src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(data)));
    const img = new Image();
    img.onload = () => resolve({ img, w, h });
    img.onerror = () => resolve(null);
    img.src = src;
  });
  const items = (await Promise.all(elements.map(svgToImage))).filter(Boolean);
  if (!items.length) return;
  const pad = 24;
  const maxW = Math.max(...items.map((i) => i.w));
  const totalH = items.reduce((s, i) => s + i.h, 0) + pad * (items.length + 1);
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = (maxW + pad * 2) * scale;
  canvas.height = totalH * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, maxW + pad * 2, totalH);
  let y = pad;
  for (const it of items) { ctx.drawImage(it.img, pad, y, it.w, it.h); y += it.h + pad; }
  const a = document.createElement("a");
  a.download = filename;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

export function downloadChartPng(el, filename) {
  if (!el) return;
  const svg = el.querySelector("svg");
  if (!svg) return;
  const box = svg.getBoundingClientRect();
  const w = Math.ceil(box.width) || 600;
  const h = Math.ceil(box.height) || 320;
  const clone = svg.cloneNode(true);
  clone.setAttribute("width", w);
  clone.setAttribute("height", h);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const data = new XMLSerializer().serializeToString(clone);
  const svg64 = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(data)));
  const img = new Image();
  img.onload = () => {
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);
    const a = document.createElement("a");
    a.download = filename;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };
  img.src = svg64;
}

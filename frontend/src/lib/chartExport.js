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

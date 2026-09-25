interface HeatPoint {
  u: number;
  v: number;
  weight?: number;
}

export function drawHeatmap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: HeatPoint[],
  radius: number = 25,
  blur: number = 15
) {
  if (points.length === 0) return;

  // 1. Offscreen shadow canvas for alpha accumulation
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = width;
  shadowCanvas.height = height;
  const sCtx = shadowCanvas.getContext('2d');
  if (!sCtx) return;

  // Create radial brush gradient
  const brushCanvas = document.createElement('canvas');
  const d = radius * 2;
  brushCanvas.width = d;
  brushCanvas.height = d;
  const bCtx = brushCanvas.getContext('2d');
  if (!bCtx) return;

  const gradient = bCtx.createRadialGradient(radius, radius, radius - blur, radius, radius, radius);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  bCtx.fillStyle = gradient;
  bCtx.fillRect(0, 0, d, d);

  // Draw brush at each point position onto shadow canvas
  for (const p of points) {
    const px = p.u * width;
    const py = (1 - p.v) * height; // Flip V for top-left origin
    sCtx.globalAlpha = Math.min(1, p.weight || 0.4);
    sCtx.drawImage(brushCanvas, px - radius, py - radius);
  }

  // 2. Palette gradient (Cold to Hot: Blue -> Cyan -> Green -> Yellow -> Red)
  const paletteCanvas = document.createElement('canvas');
  paletteCanvas.width = 256;
  paletteCanvas.height = 1;
  const pCtx = paletteCanvas.getContext('2d');
  if (!pCtx) return;

  const paletteGrad = pCtx.createLinearGradient(0, 0, 256, 0);
  paletteGrad.addColorStop(0.0, 'rgba(0, 0, 255, 0)');
  paletteGrad.addColorStop(0.25, 'rgba(0, 255, 255, 0.6)');
  paletteGrad.addColorStop(0.5, 'rgba(0, 255, 0, 0.8)');
  paletteGrad.addColorStop(0.75, 'rgba(255, 255, 0, 0.9)');
  paletteGrad.addColorStop(1.0, 'rgba(255, 0, 0, 1.0)');

  pCtx.fillStyle = paletteGrad;
  pCtx.fillRect(0, 0, 256, 1);
  const palette = pCtx.getImageData(0, 0, 256, 1).data;

  // 3. Colorize shadow canvas alpha pixels
  const imgData = sCtx.getImageData(0, 0, width, height);
  const pixels = imgData.data;

  for (let i = 3; i < pixels.length; i += 4) {
    const alpha = pixels[i]; // 0 to 255
    if (alpha > 0) {
      const paletteOffset = alpha * 4;
      pixels[i - 3] = palette[paletteOffset];     // R
      pixels[i - 2] = palette[paletteOffset + 1]; // G
      pixels[i - 1] = palette[paletteOffset + 2]; // B
      pixels[i] = Math.min(220, alpha * 1.2);    // Final opacity cap
    }
  }

  // Render colored result to main context
  ctx.putImageData(imgData, 0, 0);
}

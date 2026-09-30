import type { Formation, Lineup } from '../../domain/entities';
import type { Shirt } from '../../domain/entities/shirts';
import { SHIRT_SILHOUETTE, getShirt } from '../../domain/entities/shirts';
import type { ExportService } from '../../application/ports';
import { LineupService } from '../../domain/services/lineupService';

const CARD_W = 1080;
const CARD_H = 1500;
const SCALE = 2;

// Pitch area inside the card
const PX = 60;
const PY = 240;
const PW = CARD_W - PX * 2;
const PH = 990;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, base: number, weight: string): void {
  let size = base;
  ctx.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 12) {
    size -= 2;
    ctx.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
  }
}

function shade(hex: string, amount: number): string {
  // amount -1..1: darken/lighten a #rrggbb color
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.min(255, Math.max(0, Math.round(c + amount * 255)));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `rgb(${r},${g},${b})`;
}

export function safeFilename(name: string): string {
  const clean = name.trim().replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ');
  return clean || 'lineup-11';
}

export class CanvasExportService implements ExportService {
  async exportLineup(lineup: Lineup, formation: Formation, filename: string): Promise<void> {
    const blob = await this.renderLineupBlob(lineup, formation);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeFilename(filename)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async renderLineupBlob(lineup: Lineup, formation: Formation): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = CARD_W * SCALE;
    canvas.height = CARD_H * SCALE;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.scale(SCALE, SCALE);

    this.drawCard(ctx, lineup, formation);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Export failed');
    return blob;
  }

  private drawCard(ctx: CanvasRenderingContext2D, lineup: Lineup, formation: Formation): void {
    // Card background
    const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
    bg.addColorStop(0, '#0b3d20');
    bg.addColorStop(1, '#14532d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Team color strip
    ctx.fillStyle = lineup.color;
    ctx.fillRect(0, 0, CARD_W, 20);

    // Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    fitFont(ctx, lineup.name, CARD_W - 120, 58, 'bold');
    ctx.fillText(lineup.name, CARD_W / 2, 105);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '30px Arial, Helvetica, sans-serif';
    const date = new Date().toLocaleDateString();
    ctx.fillText(`${formation.name} • ${date}`, CARD_W / 2, 155);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '24px Arial, Helvetica, sans-serif';
    ctx.fillText(
      `${lineup.players.length}/11 • ${lineup.substitutes.length} subs`,
      CARD_W / 2,
      195
    );

    this.drawPitch(ctx);
    const shirt = lineup.shirtId ? (getShirt(lineup.shirtId) ?? null) : null;
    this.drawPlayers(ctx, lineup, formation, shirt);
    this.drawSubs(ctx, lineup);
  }

  private drawPitch(ctx: CanvasRenderingContext2D): void {
    // Mow stripes
    const stripes = 10;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#1a6b2f' : '#1d7534';
      ctx.fillRect(PX, PY + (PH / stripes) * i, PW, PH / stripes + 1);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 4;
    ctx.strokeRect(PX, PY, PW, PH);

    // Halfway line
    ctx.beginPath();
    ctx.moveTo(PX, PY + PH / 2);
    ctx.lineTo(PX + PW, PY + PH / 2);
    ctx.stroke();

    // Center circle + spot
    ctx.beginPath();
    ctx.arc(PX + PW / 2, PY + PH / 2, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(PX + PW / 2, PY + PH / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Boxes at both ends
    this.drawBoxes(ctx, PY, 1);
    this.drawBoxes(ctx, PY + PH, -1);
  }

  private drawBoxes(ctx: CanvasRenderingContext2D, goalLineY: number, dir: 1 | -1): void {
    const cx = PX + PW / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 4;

    // Penalty box: 460 x 150
    ctx.strokeRect(cx - 230, dir === 1 ? goalLineY : goalLineY - 150, 460, 150);
    // Six-yard box: 260 x 60
    ctx.strokeRect(cx - 130, dir === 1 ? goalLineY : goalLineY - 60, 260, 60);
    // Penalty spot
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(cx, goalLineY + dir * 105, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPlayers(ctx: CanvasRenderingContext2D, lineup: Lineup, formation: Formation, shirt: Shirt | null): void {
    const positions = LineupService.getFormationPositions(formation, lineup);
    for (const [positionId, pos] of positions) {
      const cx = PX + (pos.x / 100) * PW;
      const cy = PY + (pos.y / 100) * PH;
      const placed = lineup.players.find((p) => p.positionId === positionId);

      if (!placed) {
        // Empty slot marker
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.arc(cx, cy, 34, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        if (pos.label) {
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.font = 'bold 22px Arial, Helvetica, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(pos.label, cx, cy + 8);
        }
        continue;
      }

      // Chip
      if (shirt) {
        this.drawShirt(ctx, cx, cy, shirt);
      } else {
        ctx.beginPath();
        ctx.arc(cx + 3, cy + 5, 42, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 42, 0, Math.PI * 2);
        ctx.fillStyle = lineup.color;
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        const init = initials(placed.playerName);
        fitFont(ctx, init, 58, 34, 'bold');
        ctx.fillText(init, cx, cy + 12);
      }

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      fitFont(ctx, placed.playerName, 150, 27, 'bold');
      ctx.fillText(placed.playerName, cx, cy + 78);
    }
  }

  private drawShirt(ctx: CanvasRenderingContext2D, cx: number, cy: number, shirt: Shirt): void {
    const path = new Path2D(SHIRT_SILHOUETTE);
    const S = 0.84;
    ctx.save();
    ctx.translate(cx - 50 * S, cy - 44 * S);
    ctx.scale(S, S);

    // Shadow
    ctx.save();
    ctx.translate(3, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill(path);
    ctx.restore();

    // Fabric clipped to the silhouette
    ctx.save();
    ctx.clip(path);
    ctx.fillStyle = shirt.base;
    ctx.fillRect(0, 0, 100, 96);
    ctx.fillStyle = shirt.accent;
    if (shirt.pattern === 'stripes-v') {
      for (const x of [12, 32, 52, 72]) ctx.fillRect(x, 0, 10, 96);
    } else if (shirt.pattern === 'hoops') {
      for (const y of [10, 30, 50, 70]) ctx.fillRect(0, y, 100, 9);
    } else if (shirt.pattern === 'halves') {
      ctx.fillRect(50, 0, 50, 96);
    } else if (shirt.pattern === 'band-h') {
      ctx.fillRect(0, 39, 100, 18);
    } else if (shirt.pattern === 'sash') {
      ctx.save();
      ctx.translate(50, 48);
      ctx.rotate((28 * Math.PI) / 180);
      ctx.fillRect(-9, -70, 18, 140);
      ctx.restore();
    } else if (shirt.pattern === 'center') {
      ctx.fillRect(37, 0, 26, 96);
      if (shirt.accent2) {
        ctx.fillStyle = shirt.accent2;
        ctx.fillRect(32, 0, 4, 96);
        ctx.fillRect(64, 0, 4, 96);
      }
    } else if (shirt.pattern === 'sleeves') {
      this.poly(ctx, [[20, 15], [10, 34], [23, 41], [29, 31]]);
      this.poly(ctx, [[80, 15], [90, 34], [77, 41], [71, 31]]);
    }
    ctx.restore();

    // Outline + collar
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.stroke(path);
    ctx.lineWidth = 4;
    ctx.strokeStyle = shirt.trim;
    ctx.lineCap = 'round';
    ctx.stroke(new Path2D('M43 9 Q50 17 57 9'));
    ctx.restore();
  }

  private poly(ctx: CanvasRenderingContext2D, points: Array<[number, number]>): void {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
  }

  private drawSubs(ctx: CanvasRenderingContext2D, lineup: Lineup): void {
    if (lineup.substitutes.length === 0) return;
    const y0 = PY + PH + 45;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 26px Arial, Helvetica, sans-serif';
    ctx.fillText('SUBSTITUTES', CARD_W / 2, y0);

    ctx.fillStyle = '#ffffff';
    ctx.font = '26px Arial, Helvetica, sans-serif';
    const names = lineup.substitutes.map((s) => s.name).join('  •  ');
    // Simple word wrap (max 2 lines)
    const words = names.split('  •  ');
    const lines: string[] = [];
    let current = '';
    for (const w of words) {
      const trial = current ? `${current}  •  ${w}` : w;
      if (ctx.measureText(trial).width > CARD_W - 160 && current) {
        lines.push(current);
        current = w;
        if (lines.length === 2) break;
      } else {
        current = trial;
      }
    }
    if (current && lines.length < 2) lines.push(current);
    lines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, CARD_W / 2, y0 + 40 + i * 38);
    });
  }
}

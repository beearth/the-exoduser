import { GameState, Item } from '../types/game';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private miniCanvas: HTMLCanvasElement;
  private miniCtx: CanvasRenderingContext2D;

  constructor(canvasId: string, miniCanvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.miniCanvas = document.getElementById(miniCanvasId) as HTMLCanvasElement;
    this.miniCtx = this.miniCanvas.getContext('2d')!;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // 기존 HTML의 draw() 함수 내 로직들을 여기로 이관 및 현대화할 예정
  public drawMap(gameState: GameState, map: number[][], stageData: any) {
    const { ctx } = this;
    const { cam, mw, mh } = gameState as any; // 임시 타입 처리
    const T = 40; // Tile size constant

    ctx.save();
    ctx.translate(this.canvas.width / 2 - cam.x, this.canvas.height / 2 - cam.y);

    const s1 = Math.max(0, ~~((cam.x - this.canvas.width / 2) / T) - 1);
    const e1 = Math.min(mw, Math.ceil((cam.x + this.canvas.width / 2) / T) + 1);
    const s2 = Math.max(0, ~~((cam.y - this.canvas.height / 2) / T) - 1);
    const e2 = Math.min(mh, Math.ceil((cam.y + this.canvas.height / 2) / T) + 1);

    for (let ty = s2; ty < e2; ty++) {
      for (let tx = s1; tx < e1; tx++) {
        const px = tx * T;
        const py = ty * T;
        if (map[ty][tx] === 1) {
          ctx.fillStyle = stageData.w;
          ctx.fillRect(px, py, T, T);
        } else {
          ctx.fillStyle = stageData.f;
          ctx.fillRect(px, py, T, T);
        }
      }
    }
    ctx.restore();
  }
}

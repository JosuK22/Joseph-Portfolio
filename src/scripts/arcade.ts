/**
 * joseph_arcade — the hidden retro mini-game easter egg.
 *
 * Three tiny games rendered on a fixed 480x320 canvas inside a
 * terminal-window modal, styled to match the phosphor theme:
 *
 *   snake.exe     — found by typing "snake" anywhere on the page
 *   breakout.exe  — found by clicking a project card's window dots
 *                   in traffic-light order: red → yellow → green
 *   invaders.exe  — found with the Konami code (↑↑↓↓←→←→BA)
 *
 * Discovery state and per-game high scores persist in localStorage.
 * Games you haven't found yet show up as "???" tabs whose only reward
 * is a cryptic hint — finding one game is a breadcrumb to the others.
 *
 * This module is only ever loaded on demand (dynamic import from
 * secrets.ts), so none of it is in the critical path.
 */

const W = 480;
const H = 320;

const GREEN = '#00FF41';
const TEXT = '#9DFFB0';
const MUTED = '#6FAE7E';
const AMBER = '#FFB000';
const AMBER_LT = '#FFCE52';
const BG = '#050805';

export type GameId = 'snake' | 'breakout' | 'invaders';

const FOUND_KEY = 'jk-arcade-found';
const HS_PREFIX = 'jk-arcade-hs-';

interface Host {
  ctx: CanvasRenderingContext2D;
  beep(freq: number, durSec?: number, vol?: number): void;
  setHud(left: string, right: string): void;
  hs(id: GameId): number;
  saveHs(id: GameId, score: number): void;
}

interface Game {
  tick(dtMs: number): void;
  /** Returns true when the game consumed the key. */
  key(code: string, down: boolean): boolean;
  pointer(type: 'down' | 'move' | 'up', x: number, y: number): void;
}

// ---------------------------------------------------------------------
// Shared drawing helpers
// ---------------------------------------------------------------------

function txt(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  size = 16,
  color = TEXT,
  align: CanvasTextAlign = 'left'
): void {
  ctx.fillStyle = color;
  ctx.font = `${size}px 'VT323', monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(s, x, y);
}

function drawOverlay(ctx: CanvasRenderingContext2D, title: string, sub: string, hint: string): void {
  ctx.fillStyle = 'rgba(5, 8, 5, 0.78)';
  ctx.fillRect(0, 0, W, H);
  txt(ctx, title, W / 2, H / 2 - 52, 42, GREEN, 'center');
  txt(ctx, sub, W / 2, H / 2 + 2, 20, TEXT, 'center');
  txt(ctx, hint, W / 2, H / 2 + 32, 16, MUTED, 'center');
}

// ---------------------------------------------------------------------
// snake.exe
// ---------------------------------------------------------------------

class SnakeGame implements Game {
  private readonly host: Host;
  private readonly cols = 30;
  private readonly rows = 20;
  private readonly cell = 16;

  private body: { x: number; y: number }[] = [];
  private dir = { x: 1, y: 0 };
  private next = { x: 1, y: 0 };
  private food = { x: 0, y: 0 };
  private acc = 0;
  private interval = 130;
  private score = 0;
  private dead = false;
  private touch: { x: number; y: number } | null = null;

  constructor(host: Host) {
    this.host = host;
    this.reset();
  }

  private reset(): void {
    this.body = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
    ];
    this.dir = { x: 1, y: 0 };
    this.next = { x: 1, y: 0 };
    this.score = 0;
    this.interval = 130;
    this.acc = 0;
    this.dead = false;
    this.spawnFood();
    this.hud();
  }

  private hud(): void {
    this.host.setHud(`score ${this.score}`, `hi ${Math.max(this.host.hs('snake'), this.score)}`);
  }

  private spawnFood(): void {
    if (this.body.length >= this.cols * this.rows) return;
    do {
      this.food = {
        x: (Math.random() * this.cols) | 0,
        y: (Math.random() * this.rows) | 0,
      };
    } while (this.body.some((s) => s.x === this.food.x && s.y === this.food.y));
  }

  key(code: string, down: boolean): boolean {
    if (!down) return false;
    const d = this.dir;
    if ((code === 'ArrowUp' || code === 'KeyW') && d.y !== 1) this.next = { x: 0, y: -1 };
    else if ((code === 'ArrowDown' || code === 'KeyS') && d.y !== -1) this.next = { x: 0, y: 1 };
    else if ((code === 'ArrowLeft' || code === 'KeyA') && d.x !== 1) this.next = { x: -1, y: 0 };
    else if ((code === 'ArrowRight' || code === 'KeyD') && d.x !== -1) this.next = { x: 1, y: 0 };
    else if (code === 'Space' && this.dead) this.reset();
    else return false;
    return true;
  }

  pointer(type: 'down' | 'move' | 'up', x: number, y: number): void {
    if (type === 'down') {
      if (this.dead) {
        this.reset();
        return;
      }
      this.touch = { x, y };
    } else if (type === 'move' && this.touch) {
      // Drag-to-steer: every 24px of drag re-aims the snake.
      const dx = x - this.touch.x;
      const dy = y - this.touch.y;
      if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
      const d = this.dir;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && d.x !== -1) this.next = { x: 1, y: 0 };
        else if (dx < 0 && d.x !== 1) this.next = { x: -1, y: 0 };
      } else {
        if (dy > 0 && d.y !== -1) this.next = { x: 0, y: 1 };
        else if (dy < 0 && d.y !== 1) this.next = { x: 0, y: -1 };
      }
      this.touch = { x, y };
    } else if (type === 'up') {
      this.touch = null;
    }
  }

  tick(dtMs: number): void {
    if (!this.dead) {
      this.acc += dtMs;
      while (this.acc >= this.interval) {
        this.acc -= this.interval;
        this.step();
      }
    }
    this.render();
  }

  private step(): void {
    this.dir = this.next;
    const head = { x: this.body[0]!.x + this.dir.x, y: this.body[0]!.y + this.dir.y };
    const hitWall = head.x < 0 || head.y < 0 || head.x >= this.cols || head.y >= this.rows;
    if (hitWall || this.body.some((s) => s.x === head.x && s.y === head.y)) {
      this.dead = true;
      this.host.saveHs('snake', this.score);
      this.host.beep(110, 0.3);
      this.hud();
      return;
    }
    this.body.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.interval = Math.max(60, this.interval - 2);
      this.host.beep(660, 0.05);
      this.spawnFood();
      this.hud();
    } else {
      this.body.pop();
    }
  }

  private render(): void {
    const ctx = this.host.ctx;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = AMBER;
    ctx.fillRect(this.food.x * this.cell + 3, this.food.y * this.cell + 3, 10, 10);
    for (let i = 0; i < this.body.length; i++) {
      const s = this.body[i]!;
      ctx.fillStyle = i === 0 ? GREEN : TEXT;
      ctx.fillRect(s.x * this.cell + 1, s.y * this.cell + 1, this.cell - 2, this.cell - 2);
    }
    if (this.dead) {
      drawOverlay(ctx, 'GAME OVER', `score ${this.score} · hi ${this.host.hs('snake')}`, 'space / tap to restart');
    }
  }
}

// ---------------------------------------------------------------------
// breakout.exe
// ---------------------------------------------------------------------

class BreakoutGame implements Game {
  private readonly host: Host;
  private readonly PW = 64;
  private readonly PH = 8;
  private readonly PY = H - 22;
  private readonly BW = 44;
  private readonly BH = 12;
  private static readonly ROW_COLORS = [AMBER, AMBER_LT, GREEN, TEXT, MUTED];

  private paddleX = W / 2 - 32;
  private ball = { x: 0, y: 0, vx: 0, vy: 0 };
  private bricks: { x: number; y: number; row: number; alive: boolean }[] = [];
  private keys = { l: false, r: false };
  private score = 0;
  private lives = 3;
  private level = 1;
  private speed = 220;
  private launched = false;
  private dead = false;

  constructor(host: Host) {
    this.host = host;
    this.newGame();
  }

  private newGame(): void {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.speed = 220;
    this.dead = false;
    this.build();
    this.serve();
    this.hud();
  }

  private build(): void {
    this.bricks = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 10; c++) {
        this.bricks.push({ x: 2 + c * 48, y: 36 + r * 16, row: r, alive: true });
      }
    }
  }

  private serve(): void {
    this.launched = false;
    this.ball.vx = 0;
    this.ball.vy = 0;
  }

  private hud(): void {
    this.host.setHud(
      `score ${this.score} · lives ${'▮'.repeat(Math.max(0, this.lives))}`,
      `lvl ${this.level} · hi ${Math.max(this.host.hs('breakout'), this.score)}`
    );
  }

  private launch(): void {
    if (this.launched || this.dead) return;
    this.launched = true;
    const a = -Math.PI / 2 + (Math.random() * 0.6 - 0.3);
    this.ball.vx = Math.cos(a) * this.speed;
    this.ball.vy = Math.sin(a) * this.speed;
    this.host.beep(520, 0.05);
  }

  key(code: string, down: boolean): boolean {
    if (code === 'ArrowLeft' || code === 'KeyA') {
      this.keys.l = down;
      return true;
    }
    if (code === 'ArrowRight' || code === 'KeyD') {
      this.keys.r = down;
      return true;
    }
    if (code === 'Space' && down) {
      if (this.dead) this.newGame();
      else this.launch();
      return true;
    }
    return false;
  }

  pointer(type: 'down' | 'move' | 'up', x: number): void {
    if (type === 'move') {
      this.paddleX = Math.max(0, Math.min(W - this.PW, x - this.PW / 2));
    } else if (type === 'down') {
      if (this.dead) this.newGame();
      else this.launch();
    }
  }

  tick(dtMs: number): void {
    const s = dtMs / 1000;
    if (!this.dead) {
      if (this.keys.l) this.paddleX -= 340 * s;
      if (this.keys.r) this.paddleX += 340 * s;
      this.paddleX = Math.max(0, Math.min(W - this.PW, this.paddleX));
      if (!this.launched) {
        this.ball.x = this.paddleX + this.PW / 2;
        this.ball.y = this.PY - 6;
      } else {
        this.physics(s);
      }
    }
    this.render();
  }

  private physics(s: number): void {
    const b = this.ball;
    const r = 4;
    b.x += b.vx * s;
    b.y += b.vy * s;

    if (b.x < r) {
      b.x = r;
      b.vx = Math.abs(b.vx);
      this.host.beep(300, 0.03);
    } else if (b.x > W - r) {
      b.x = W - r;
      b.vx = -Math.abs(b.vx);
      this.host.beep(300, 0.03);
    }
    if (b.y < r) {
      b.y = r;
      b.vy = Math.abs(b.vy);
      this.host.beep(300, 0.03);
    }

    // Paddle — exit angle depends on where on the paddle the ball lands.
    if (
      b.vy > 0 &&
      b.y + r >= this.PY &&
      b.y + r <= this.PY + this.PH + 8 &&
      b.x >= this.paddleX - r &&
      b.x <= this.paddleX + this.PW + r
    ) {
      const rel = (b.x - (this.paddleX + this.PW / 2)) / (this.PW / 2);
      const ang = -Math.PI / 2 + rel * (Math.PI / 3);
      const sp = Math.hypot(b.vx, b.vy);
      b.vx = Math.cos(ang) * sp;
      b.vy = Math.sin(ang) * sp;
      b.y = this.PY - r;
      this.host.beep(440, 0.04);
    }

    for (const br of this.bricks) {
      if (!br.alive) continue;
      if (b.x + r > br.x && b.x - r < br.x + this.BW && b.y + r > br.y && b.y - r < br.y + this.BH) {
        br.alive = false;
        this.score += (5 - br.row) * 2;
        // Bounce along the axis of least penetration.
        const px = Math.min(b.x + r - br.x, br.x + this.BW - (b.x - r));
        const py = Math.min(b.y + r - br.y, br.y + this.BH - (b.y - r));
        if (px < py) b.vx = -b.vx;
        else b.vy = -b.vy;
        this.host.beep(600 + (4 - br.row) * 60, 0.04);
        this.hud();
        break;
      }
    }

    if (this.bricks.every((x) => !x.alive)) {
      this.level++;
      this.speed *= 1.12;
      this.build();
      this.serve();
      this.hud();
      this.host.beep(880, 0.12);
      return;
    }

    if (b.y > H + r) {
      this.lives--;
      this.host.beep(120, 0.25);
      if (this.lives <= 0) {
        this.dead = true;
        this.host.saveHs('breakout', this.score);
      } else {
        this.serve();
      }
      this.hud();
    }
  }

  private render(): void {
    const ctx = this.host.ctx;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    for (const br of this.bricks) {
      if (!br.alive) continue;
      ctx.fillStyle = BreakoutGame.ROW_COLORS[br.row]!;
      ctx.fillRect(br.x, br.y, this.BW, this.BH);
    }
    ctx.fillStyle = GREEN;
    ctx.fillRect(this.paddleX, this.PY, this.PW, this.PH);
    ctx.fillStyle = AMBER;
    ctx.fillRect(this.ball.x - 4, this.ball.y - 4, 8, 8);
    if (this.dead) {
      drawOverlay(ctx, 'GAME OVER', `score ${this.score} · hi ${this.host.hs('breakout')}`, 'space / tap to restart');
    } else if (!this.launched) {
      txt(ctx, 'space / tap to launch', W / 2, H - 60, 16, MUTED, 'center');
    }
  }
}

// ---------------------------------------------------------------------
// invaders.exe
// ---------------------------------------------------------------------

class InvadersGame implements Game {
  private readonly host: Host;
  private readonly COLS = 8;
  private readonly ROWS = 4;
  private readonly AW = 24; // alien sprite size
  private readonly AH = 14;
  private readonly PITCH_X = 44;
  private readonly PITCH_Y = 28;
  private readonly ORIGIN_X = 74;
  private readonly ORIGIN_Y = 42;
  private readonly SHIP_Y = H - 24;

  private alive: boolean[] = [];
  private offX = 0;
  private offY = 0;
  private dir = 1;
  private speed = 24;
  private playerX = W / 2;
  private keys = { l: false, r: false };
  private pBullet: { x: number; y: number } | null = null;
  private eBullets: { x: number; y: number }[] = [];
  private fireIn = 1.2;
  private score = 0;
  private lives = 3;
  private wave = 1;
  private dead = false;
  private flash = 0; // post-hit invulnerability / blink timer
  private animT = 0;
  private frame = 0;

  constructor(host: Host) {
    this.host = host;
    this.newGame();
  }

  private newGame(): void {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.dead = false;
    this.playerX = W / 2;
    this.flash = 0;
    this.newWave();
    this.hud();
  }

  private newWave(): void {
    this.alive = new Array(this.COLS * this.ROWS).fill(true);
    this.offX = 0;
    this.offY = 0;
    this.dir = 1;
    this.speed = 24 * Math.pow(1.25, this.wave - 1);
    this.pBullet = null;
    this.eBullets = [];
    this.fireIn = 1.2;
  }

  private hud(): void {
    this.host.setHud(
      `score ${this.score} · lives ${'▮'.repeat(Math.max(0, this.lives))}`,
      `wave ${this.wave} · hi ${Math.max(this.host.hs('invaders'), this.score)}`
    );
  }

  private alienPos(i: number): { x: number; y: number } {
    const c = i % this.COLS;
    const r = (i / this.COLS) | 0;
    return {
      x: this.ORIGIN_X + c * this.PITCH_X + this.offX,
      y: this.ORIGIN_Y + r * this.PITCH_Y + this.offY,
    };
  }

  private fire(): void {
    if (this.dead) {
      this.newGame();
      return;
    }
    if (this.pBullet) return;
    this.pBullet = { x: this.playerX, y: this.SHIP_Y - 8 };
    this.host.beep(700, 0.04);
  }

  key(code: string, down: boolean): boolean {
    if (code === 'ArrowLeft' || code === 'KeyA') {
      this.keys.l = down;
      return true;
    }
    if (code === 'ArrowRight' || code === 'KeyD') {
      this.keys.r = down;
      return true;
    }
    if (code === 'Space' && down) {
      this.fire();
      return true;
    }
    return false;
  }

  pointer(type: 'down' | 'move' | 'up', x: number): void {
    if (type === 'move') this.playerX = Math.max(14, Math.min(W - 14, x));
    else if (type === 'down') this.fire();
  }

  tick(dtMs: number): void {
    const s = dtMs / 1000;
    if (!this.dead) this.update(s);
    this.render();
  }

  private update(s: number): void {
    this.animT += s;
    if (this.animT > 0.35) {
      this.animT = 0;
      this.frame ^= 1;
    }
    if (this.flash > 0) this.flash -= s;

    if (this.keys.l) this.playerX -= 280 * s;
    if (this.keys.r) this.playerX += 280 * s;
    this.playerX = Math.max(14, Math.min(W - 14, this.playerX));

    // March the fleet; drop a row and speed up at each edge.
    this.offX += this.dir * this.speed * s;
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < this.alive.length; i++) {
      if (!this.alive[i]) continue;
      const p = this.alienPos(i);
      if (p.x < minX) minX = p.x;
      if (p.x + this.AW > maxX) maxX = p.x + this.AW;
      if (p.y + this.AH > maxY) maxY = p.y + this.AH;
    }
    if (minX < 8 || maxX > W - 8) {
      this.dir *= -1;
      this.offX += this.dir * 4;
      this.offY += 12;
      this.speed *= 1.05;
    }
    if (maxY >= this.SHIP_Y - 4) {
      this.dead = true;
      this.host.saveHs('invaders', this.score);
      this.host.beep(90, 0.4);
      return;
    }

    // Player bullet.
    if (this.pBullet) {
      this.pBullet.y -= 380 * s;
      if (this.pBullet.y < -10) this.pBullet = null;
      else {
        for (let i = 0; i < this.alive.length; i++) {
          if (!this.alive[i]) continue;
          const p = this.alienPos(i);
          const b = this.pBullet;
          if (b.x > p.x && b.x < p.x + this.AW && b.y > p.y && b.y < p.y + this.AH) {
            this.alive[i] = false;
            this.pBullet = null;
            this.score += 10;
            this.speed *= 1.03;
            this.host.beep(880 - ((i / this.COLS) | 0) * 80, 0.05);
            this.hud();
            break;
          }
        }
      }
    }

    // Enemy fire — the bottom-most alien of a random living column shoots.
    this.fireIn -= s;
    if (this.fireIn <= 0) {
      this.fireIn = 0.5 + Math.random() * Math.max(0.4, 1.4 - this.wave * 0.1);
      const cols: number[] = [];
      for (let c = 0; c < this.COLS; c++) {
        for (let r = this.ROWS - 1; r >= 0; r--) {
          if (this.alive[r * this.COLS + c]) {
            cols.push(r * this.COLS + c);
            break;
          }
        }
      }
      if (cols.length) {
        const p = this.alienPos(cols[(Math.random() * cols.length) | 0]!);
        this.eBullets.push({ x: p.x + this.AW / 2, y: p.y + this.AH });
      }
    }

    const eSpeed = 130 + this.wave * 15;
    for (let i = this.eBullets.length - 1; i >= 0; i--) {
      const b = this.eBullets[i]!;
      b.y += eSpeed * s;
      if (b.y > H + 10) {
        this.eBullets.splice(i, 1);
        continue;
      }
      if (
        this.flash <= 0 &&
        b.x > this.playerX - 12 &&
        b.x < this.playerX + 12 &&
        b.y > this.SHIP_Y &&
        b.y < this.SHIP_Y + 10
      ) {
        this.eBullets.splice(i, 1);
        this.lives--;
        this.flash = 1.5;
        this.host.beep(140, 0.25);
        this.hud();
        if (this.lives <= 0) {
          this.dead = true;
          this.host.saveHs('invaders', this.score);
        }
      }
    }

    if (this.alive.every((a) => !a)) {
      this.wave++;
      this.newWave();
      this.hud();
      this.host.beep(880, 0.12);
    }
  }

  private render(): void {
    const ctx = this.host.ctx;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < this.alive.length; i++) {
      if (!this.alive[i]) continue;
      const p = this.alienPos(i);
      ctx.fillStyle = TEXT;
      ctx.fillRect(p.x + 2, p.y + 2, 20, 8); // body
      ctx.fillRect(p.x, p.y, 3, 3); // antennae
      ctx.fillRect(p.x + 21, p.y, 3, 3);
      if (this.frame === 0) {
        ctx.fillRect(p.x + 3, p.y + 10, 4, 4); // legs out
        ctx.fillRect(p.x + 17, p.y + 10, 4, 4);
      } else {
        ctx.fillRect(p.x + 7, p.y + 10, 4, 4); // legs in
        ctx.fillRect(p.x + 13, p.y + 10, 4, 4);
      }
      ctx.fillStyle = BG;
      ctx.fillRect(p.x + 6, p.y + 4, 3, 3); // eyes
      ctx.fillRect(p.x + 15, p.y + 4, 3, 3);
    }

    // Player ship — blinks while invulnerable after a hit.
    if (this.flash <= 0 || ((this.flash * 10) | 0) % 2 === 0) {
      ctx.fillStyle = GREEN;
      ctx.fillRect(this.playerX - 12, this.SHIP_Y, 24, 8);
      ctx.fillRect(this.playerX - 2, this.SHIP_Y - 6, 4, 6);
    }

    if (this.pBullet) {
      ctx.fillStyle = AMBER;
      ctx.fillRect(this.pBullet.x - 1, this.pBullet.y - 8, 2, 8);
    }
    ctx.fillStyle = TEXT;
    for (const b of this.eBullets) ctx.fillRect(b.x - 1, b.y, 2, 8);

    if (this.dead) {
      drawOverlay(ctx, 'GAME OVER', `score ${this.score} · hi ${this.host.hs('invaders')}`, 'space / tap to restart');
    }
  }
}

// ---------------------------------------------------------------------
// Registry + persistence
// ---------------------------------------------------------------------

// Locked games never reveal their trigger — only a riddle whose solution IS
// the trigger. The player has to solve it and perform the secret out on the
// page; only then does the tab unlock for direct switching.
const GAMES: Record<GameId, { title: string; riddle: string; controls: string; make: (h: Host) => Game }> = {
  snake: {
    title: 'snake.exe',
    riddle: 'i eat and grow, but must never bite my own tail. type my five-letter name — anywhere, no prompt needed.',
    controls: 'arrows / wasd to steer · swipe on touch',
    make: (h) => new SnakeGame(h),
  },
  breakout: {
    title: 'breakout.exe',
    riddle: 'three little lights above my projects rehearse something, over and over. watch the order they wake — then wake them yourself.',
    controls: 'arrows / mouse to move · space or tap to launch',
    make: (h) => new BreakoutGame(h),
  },
  invaders: {
    title: 'invaders.exe',
    riddle: 'born 1986: a code that granted 30 lives. every arcade kid still knows it by heart. it begins by looking up. twice.',
    controls: 'arrows to move · space or tap to fire',
    make: (h) => new InvadersGame(h),
  },
};

function getFound(): GameId[] {
  try {
    const raw = JSON.parse(localStorage.getItem(FOUND_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((id): id is GameId => id in GAMES) : [];
  } catch {
    return [];
  }
}

function markFound(id: GameId): void {
  const found = getFound();
  if (found.includes(id)) return;
  found.push(id);
  try {
    localStorage.setItem(FOUND_KEY, JSON.stringify(found));
  } catch {}
}

// ---------------------------------------------------------------------
// The arcade window
// ---------------------------------------------------------------------

class Arcade {
  private root!: HTMLDivElement;
  private canvas!: HTMLCanvasElement;
  private tabsEl!: HTMLDivElement;
  private hudLeft!: HTMLSpanElement;
  private hudRight!: HTMLSpanElement;
  private controlsEl!: HTMLDivElement;

  private game: Game | null = null;
  private current: GameId | null = null;
  private raf = 0;
  private last = 0;
  private actx: AudioContext | null = null;

  private readonly host: Host = {
    ctx: null as unknown as CanvasRenderingContext2D, // set in build()
    beep: (freq, dur = 0.06, vol = 0.045) => this.beep(freq, dur, vol),
    setHud: (left, right) => {
      this.hudLeft.textContent = left;
      this.hudRight.textContent = right;
    },
    hs: (id) => {
      const n = Number(localStorage.getItem(HS_PREFIX + id));
      return Number.isFinite(n) ? n : 0;
    },
    saveHs: (id, score) => {
      if (score > this.host.hs(id)) {
        try {
          localStorage.setItem(HS_PREFIX + id, String(score));
        } catch {}
      }
    },
  };

  private build(): void {
    this.root = document.createElement('div');
    this.root.className = 'arcade';
    this.root.hidden = true;
    this.root.innerHTML = `
      <div class="arcade__win" role="dialog" aria-modal="true" aria-label="Hidden arcade" tabindex="-1">
        <div class="arcade__bar">
          <span class="dot dot--r" aria-hidden="true"></span>
          <span class="dot dot--y" aria-hidden="true"></span>
          <span class="dot dot--g" aria-hidden="true"></span>
          <span class="arcade__title">joseph_arcade v1.0 — you found it</span>
          <button class="arcade__close" type="button" aria-label="Close arcade">✕</button>
        </div>
        <div class="arcade__tabs"></div>
        <div class="arcade__screenwrap">
          <canvas class="arcade__screen" width="${W}" height="${H}"></canvas>
        </div>
        <div class="arcade__hud"><span class="arcade__hud-left"></span><span class="arcade__hud-right"></span></div>
        <div class="arcade__controls"></div>
      </div>`;

    this.canvas = this.root.querySelector('.arcade__screen')!;
    this.tabsEl = this.root.querySelector('.arcade__tabs')!;
    this.hudLeft = this.root.querySelector('.arcade__hud-left')!;
    this.hudRight = this.root.querySelector('.arcade__hud-right')!;
    this.controlsEl = this.root.querySelector('.arcade__controls')!;
    this.host.ctx = this.canvas.getContext('2d')!;

    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) this.close();
    });
    this.root.querySelector('.arcade__close')!.addEventListener('click', () => this.close());

    const toLocal = (e: PointerEvent) => {
      const r = this.canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
    };
    this.canvas.addEventListener('pointerdown', (e) => {
      this.canvas.setPointerCapture(e.pointerId);
      const p = toLocal(e);
      this.game?.pointer('down', p.x, p.y);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      const p = toLocal(e);
      this.game?.pointer('move', p.x, p.y);
    });
    this.canvas.addEventListener('pointerup', (e) => {
      const p = toLocal(e);
      this.game?.pointer('up', p.x, p.y);
    });

    document.body.appendChild(this.root);
  }

  private beep(freq: number, dur: number, vol: number): void {
    try {
      this.actx ??= new AudioContext();
      const t = this.actx.currentTime;
      const o = this.actx.createOscillator();
      const g = this.actx.createGain();
      o.type = 'square';
      o.frequency.value = freq;
      o.connect(g);
      g.connect(this.actx.destination);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch {}
  }

  private renderTabs(): void {
    const found = new Set(getFound());
    this.tabsEl.innerHTML = '';
    for (const id of Object.keys(GAMES) as GameId[]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'arcade__tab';
      if (found.has(id)) {
        b.textContent = GAMES[id].title;
        if (id === this.current) b.classList.add('active');
        b.addEventListener('click', () => this.switch(id));
      } else {
        b.textContent = '???';
        b.classList.add('locked');
        b.addEventListener('click', () => {
          this.controlsEl.textContent = `locked — solve me: ${GAMES[id].riddle}`;
          this.beep(180, 0.08, 0.04);
        });
      }
      this.tabsEl.appendChild(b);
    }
  }

  private switch(id: GameId): void {
    this.current = id;
    this.game = GAMES[id].make(this.host);
    this.controlsEl.textContent = `${GAMES[id].controls} · esc to close`;
    this.renderTabs();
  }

  private onKey = (e: KeyboardEvent): void => {
    const down = e.type === 'keydown';
    if (down && e.code === 'Escape') {
      this.close();
      return;
    }
    // Games own the arrows and space while the arcade is up — the page
    // behind must not scroll.
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    this.game?.key(e.code, down);
  };

  private loop = (t: number): void => {
    const dt = Math.min(50, t - this.last);
    this.last = t;
    this.game?.tick(dt);
    this.raf = requestAnimationFrame(this.loop);
  };

  open(id: GameId): void {
    if (!this.root) this.build();
    markFound(id);
    this.root.hidden = false;
    document.body.classList.add('arcade-open');
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKey);
    this.switch(id);
    (this.root.querySelector('.arcade__win') as HTMLElement).focus();
    this.beep(520, 0.07, 0.04);
    setTimeout(() => this.beep(780, 0.09, 0.04), 90);
    this.last = performance.now();
    if (!this.raf) this.raf = requestAnimationFrame(this.loop);
  }

  close(): void {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKey);
    if (this.root) this.root.hidden = true;
    document.body.classList.remove('arcade-open');
    this.game = null;
    this.current = null;
  }
}

let instance: Arcade | null = null;

export function openArcade(id: GameId): void {
  instance ??= new Arcade();
  instance.open(id);
}

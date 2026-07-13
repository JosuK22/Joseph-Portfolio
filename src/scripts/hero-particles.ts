/**
 * Hero particle portrait engine.
 *
 * On initial load the portrait assembles itself: particles spawn scattered
 * across the canvas with a little random drift, and the same spring-damper
 * that powers the hover interaction pulls each one to its rest position —
 * the intro costs no extra physics. It plays exactly once; after that
 * (resizes, re-inits) particles sit at their target positions from the
 * first frame. The cursor acts like a continuous distortion field: any
 * particle currently within KICK_RADIUS of the actual cursor position gets
 * pushed outward every frame (not a one-shot kick), so the disturbance
 * visibly follows the cursor through the portrait. The instant a particle
 * is no longer near the cursor, a spring-damper takes back over and glides
 * it back to its fixed rest position — decelerating and settling rather
 * than snapping. The silhouette never fully scatters: only particles the
 * cursor is currently near are ever displaced, and everything is
 * self-healing.
 *
 * Performance notes:
 *  - All image analysis (luminance, edge detection, dithering) runs once
 *    per image-load/resize — never inside the per-frame loop.
 *  - Particle state lives in flat typed arrays (struct-of-arrays), not an
 *    array of objects, to avoid per-particle allocation and GC pressure.
 *  - Particles are drawn with direct arc()+fill() and a precomputed flat
 *    color table (fillStyle is an array lookup, never a template-literal
 *    allocation or gradient/shadow op) — measured fastest in this engine's
 *    rendering context, see hero-particles conversation history.
 *  - The kick check is squared-distance first; sqrt only runs for the
 *    handful of particles actually inside the cursor's radius, not all of
 *    them. The cooldown is ~1 frame (not a real throttle) — it exists only
 *    to guard against re-entrant double-kicks within the same tick, not to
 *    delay repeated reaction across frames.
 *  - The rAF loop only runs while something is actually moving: while the
 *    pointer is over the canvas, or while any particle still has velocity
 *    or isn't back at rest. Once everything settles and the pointer isn't
 *    hovering, the loop stops entirely — zero ongoing CPU cost, including
 *    on initial load before any interaction happens.
 */

interface Target {
  x: number;
  y: number;
  brightness: number;
  detail: boolean;
}

const BRIGHTNESS_LEVELS = 6;
const DETAIL_DOT_RADIUS = 1;
const FLAT_DOT_RADIUS = 1.5;
const RESIZE_DEBOUNCE_MS = 150;

// --- Disperse-and-reassemble tuning ---
const KICK_RADIUS = 100; // px; wide enough that the disturbance is obvious without engulfing the whole portrait
const KICK_RADIUS_SQ = KICK_RADIUS * KICK_RADIUS;
const KICK_STRENGTH = 2; // velocity (px/frame) imparted at the cursor's exact center — small because it's now
                          // applied every frame the cursor lingers, not once; a one-shot-sized value here
                          // compounds frame over frame and blows particles far past the radius (measured: it did)
const KICK_COOLDOWN_MS = 16; // ~1 frame — particles react continuously as the cursor moves through them
const SPRING_STIFFNESS = 0.045; // pull-back strength; has to be high enough to counter a *continuous* push
const SPRING_DAMPING = 0.88; // per-frame velocity decay
const REST_EPSILON = 0.05; // px / (px/frame); below this on both position and velocity, a particle is "at rest"

// --- Scatter-in intro tuning ---
// The intro rides the same spring-damper as the hover interaction, but with
// its own gentler constants so the portrait coalesces slowly and floatily
// (~8–10s) instead of at hover-settle speed. They apply ONLY while the intro
// is playing; the moment it finishes — or the pointer enters the canvas —
// the stock constants above take over, so hover feel is untouched.
//
// Tuning guide: STIFFNESS is the speed knob — lower = slower assembly.
// DAMPING must stay close to 1 (it's a per-frame velocity *multiplier*):
// ~0.96 drifts, ~0.88 snaps; far below that it erases velocity outright and
// the particles freeze mid-scatter instead of settling slowly.
const INTRO_SPRING_STIFFNESS = 0.002;
const INTRO_SPRING_DAMPING = 0.96;
const INTRO_DRIFT = 2; // max random px/frame of initial scatter velocity

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Desktop/tablet/mobile particle budget. This canvas is currently only ever
 *  shown at >=1100px (see global.css), so this resolves to the desktop tier
 *  in practice — written generically so it scales correctly if that
 *  breakpoint is ever lowered. */
function getParticleBudget(viewportWidth: number): number {
  if (viewportWidth < 640) return 2200;
  if (viewportWidth < 1024) return 4200;
  return 6500;
}

export class HeroParticleField {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly reduceMotion: boolean;
  private readonly dpr: number;

  private portrait: HTMLImageElement | null = null;
  private width = 0;
  private height = 0;

  // Flat (level x size) color table — see buildParticleColors().
  private particleColors: string[] = [];

  // Particle state — struct-of-arrays. Avoids one allocation per particle
  // per frame and keeps the hot loop cache-friendly.
  private count = 0;
  private px = new Float32Array(0);
  private py = new Float32Array(0);
  private vx = new Float32Array(0); // current velocity from the spring-damper / kicks
  private vy = new Float32Array(0);
  private tx = new Float32Array(0); // fixed rest position — each particle's one spot in the portrait
  private ty = new Float32Array(0);
  private lastKick = new Float32Array(0); // performance.now() timestamp of this particle's last kick
  private radius = new Float32Array(0);
  private colorIndex = new Uint8Array(0);

  private pointer = { x: -9999, y: -9999, active: false };
  private rafId = 0;
  private visible = true;
  /** One-shot flag for the scatter-in intro; consumed by the first init
   *  that actually has targets, so resizes never re-play the entrance. */
  private introPending = true;
  /** True while the intro assembly is still playing — switches the spring
   *  to the gentler INTRO_* constants. Cleared when everything settles or
   *  the pointer enters the canvas (hover must always feel stock). */
  private introActive = false;

  private resizeObserver: ResizeObserver;
  private intersectionObserver: IntersectionObserver;
  private resizeTimer = 0;

  constructor(canvas: HTMLCanvasElement, portraitSrc: string) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('HeroParticleField: 2D context unavailable');
    this.ctx = ctx;

    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.particleColors = this.buildParticleColors();

    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerleave', this.onPointerLeave);

    this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
    this.resizeObserver.observe(canvas);

    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry?.isIntersecting ?? true;
      if (this.visible) this.start();
      else this.stop();
    });
    this.intersectionObserver.observe(canvas);

    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.resize();
    this.loadPortrait(portraitSrc);
    this.start();
  }

  destroy(): void {
    this.stop();
    window.clearTimeout(this.resizeTimer);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
  }

  // ---------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------

  private onVisibilityChange = (): void => {
    if (document.hidden) this.stop();
    else if (this.visible) this.start();
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (this.reduceMotion) return;
    // Interacting mid-intro hands control straight back to the stock
    // spring so the distortion field feels identical from the first touch.
    this.introActive = false;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = event.clientX - rect.left;
    this.pointer.y = event.clientY - rect.top;
    this.pointer.active = true;
    this.start();
  };

  private onPointerLeave = (): void => {
    this.pointer.active = false;
    this.start(); // let the settle-back animation play even if the loop had stopped
  };

  private start(): void {
    if (!this.rafId && this.visible) this.rafId = requestAnimationFrame(this.tick);
  }

  private stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private scheduleResize(): void {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => this.resize(), RESIZE_DEBOUNCE_MS);
  }

  private loadPortrait(src: string): void {
    const img = new Image();
    img.onload = () => {
      this.portrait = img;
      this.resize();
    };
    img.src = src;
  }

  // ---------------------------------------------------------------------
  // Sizing + particle (re)initialization
  // ---------------------------------------------------------------------

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    if (this.width < 1 || this.height < 1) return;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const budget = getParticleBudget(window.innerWidth);
    const targets = this.portrait ? this.buildTargets(budget) : [];
    this.initParticles(targets);
  }

  /** The first init that has real targets plays the one-time intro:
   *  particles spawn scattered across the whole canvas with a little random
   *  drift, and the regular spring-damper condenses them into the portrait
   *  (the loop keeps itself alive until everyone settles, then stops as
   *  usual). Every init after that — resizes, re-targets — places particles
   *  directly at rest so the entrance never re-plays. Reduced motion skips
   *  the intro entirely: its update loop never moves particles, so they
   *  must start assembled. */
  private initParticles(targets: Target[]): void {
    const n = targets.length;
    this.count = n;
    this.px = new Float32Array(n);
    this.py = new Float32Array(n);
    this.vx = new Float32Array(n);
    this.vy = new Float32Array(n);
    this.tx = new Float32Array(n);
    this.ty = new Float32Array(n);
    this.lastKick = new Float32Array(n).fill(-Infinity);
    this.radius = new Float32Array(n);
    this.colorIndex = new Uint8Array(n);

    const scatter = this.introPending && !this.reduceMotion && n > 0;
    if (scatter) {
      this.introPending = false;
      this.introActive = true;
    }

    for (let i = 0; i < n; i++) {
      const t = targets[i]!;
      this.tx[i] = t.x;
      this.ty[i] = t.y;
      if (scatter) {
        this.px[i] = Math.random() * this.width;
        this.py[i] = Math.random() * this.height;
        this.vx[i] = (Math.random() - 0.5) * INTRO_DRIFT;
        this.vy[i] = (Math.random() - 0.5) * INTRO_DRIFT;
      } else {
        this.px[i] = t.x;
        this.py[i] = t.y;
      }
      this.radius[i] = t.detail ? DETAIL_DOT_RADIUS : FLAT_DOT_RADIUS;
      this.colorIndex[i] = this.colorIndexFor(t.brightness, t.detail);
    }

    this.start();
  }

  // ---------------------------------------------------------------------
  // Image analysis — runs once per load/resize, NEVER inside the frame loop
  // ---------------------------------------------------------------------

  /**
   * Converts the portrait image into a weighted set of target points.
   *
   * 1. Draw the portrait into an offscreen canvas at display resolution.
   * 2. Compute per-pixel luminance (and discard the black background).
   * 3. Run a Sobel pass over the luminance field to find edges — eyes,
   *    eyebrows, beard texture, collar seams, the watch, fold lines, and
   *    the silhouette outline itself all show up as high-gradient regions.
   * 4. Combine luminance + edge strength into a single importance value:
   *    brightness sets a baseline (so flat-but-lit cloth doesn't vanish),
   *    edges multiply it up (so detail-rich regions dominate the budget).
   * 5. Scale total importance to match the particle budget exactly, then
   *    run Floyd-Steinberg error-diffusion dithering over that importance
   *    field instead of raw brightness. Error diffusion conserves "ink"
   *    across the whole image, so the dot count lands almost exactly on
   *    budget with NO random discarding — high-importance regions get
   *    denser coverage because they started with a higher value, not
   *    because of luck.
   */
  private buildTargets(budget: number): Target[] {
    const portrait = this.portrait;
    if (!portrait || this.width < 1 || this.height < 1) return [];

    const width = Math.round(this.width);
    const height = Math.round(this.height);

    const off = document.createElement('canvas');
    off.width = width;
    off.height = height;
    const octx = off.getContext('2d');
    if (!octx) return [];

    const scale = Math.min(width / portrait.width, height / portrait.height) * 0.95;
    const dw = portrait.width * scale;
    const dh = portrait.height * scale;
    octx.drawImage(portrait, (width - dw) / 2, (height - dh) / 2, dw, dh);

    const { data } = octx.getImageData(0, 0, width, height);
    const size = width * height;

    // -1 marks "not part of the subject" (background or near-black).
    const lum = new Float32Array(size);
    for (let p = 0; p < size; p++) {
      const i = p * 4;
      if (data[i + 3]! < 20) {
        lum[p] = -1;
        continue;
      }
      const l = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
      lum[p] = l < 35 ? -1 : l;
    }

    const edge = sobelMagnitude(lum, width, height);

    let edgeMax = 1;
    for (let p = 0; p < size; p++) if (edge[p]! > edgeMax) edgeMax = edge[p]!;

    const importance = new Float32Array(size);
    let totalImportance = 0;
    for (let p = 0; p < size; p++) {
      if (lum[p]! < 0) continue;
      const brightness = clamp01((lum[p]! - 35) / (255 - 35));
      const edgeNorm = clamp01(edge[p]! / edgeMax);
      // Baseline keeps flat bright cloth visible; the edge term is what
      // pushes facial/beard/seam/silhouette detail to the front of the queue.
      const value = brightness * (0.35 + 0.9 * edgeNorm);
      importance[p] = value;
      totalImportance += value;
    }

    const inkScale = totalImportance > 0 ? budget / totalImportance : 0;
    const errors = new Float32Array(size);
    const targets: Target[] = [];
    const DETAIL_EDGE_THRESHOLD = 0.18;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        if (lum[p]! < 0) continue;

        const ink = importance[p]! * inkScale + errors[p]!;
        const include = ink > 0.5;
        const err = ink - (include ? 1 : 0);

        if (x + 1 < width && lum[p + 1]! >= 0) errors[p + 1]! += err * (7 / 16);
        if (y + 1 < height) {
          if (x > 0 && lum[p + width - 1]! >= 0) errors[p + width - 1]! += err * (3 / 16);
          if (lum[p + width]! >= 0) errors[p + width]! += err * (5 / 16);
          if (x + 1 < width && lum[p + width + 1]! >= 0) errors[p + width + 1]! += err * (1 / 16);
        }

        if (include) {
          targets.push({
            x,
            y,
            brightness: clamp01((lum[p]! - 35) / (255 - 35)),
            detail: edge[p]! / edgeMax > DETAIL_EDGE_THRESHOLD,
          });
        }
      }
    }

    return targets;
  }

  // ---------------------------------------------------------------------
  // Color table — precomputed once, drawn with direct arc()+fill()
  // ---------------------------------------------------------------------

  /** Flat rgba() string table indexed by [brightnessLevel][size]. fillStyle
   *  assignment is then just an array lookup, never a template-literal
   *  allocation. Particles are always full-opacity — the portrait never
   *  fades, so there's no fade-stage dimension to this table. */
  private buildParticleColors(): string[] {
    const colors: string[] = [];
    for (let level = 0; level < BRIGHTNESS_LEVELS; level++) {
      const brightness = level / (BRIGHTNESS_LEVELS - 1);
      const lvl = 0.35 + 0.65 * brightness;
      const r = Math.round(lvl * 90);
      const g = Math.round(120 + lvl * 135);
      const b = Math.round(lvl * 110);
      for (let size = 0; size < 2; size++) {
        colors.push(`rgba(${r}, ${g}, ${b}, 1)`);
      }
    }
    return colors;
  }

  private colorIndexFor(brightness: number, detail: boolean): number {
    const level = Math.min(BRIGHTNESS_LEVELS - 1, Math.floor(brightness * BRIGHTNESS_LEVELS));
    return level * 2 + (detail ? 0 : 1);
  }

  // ---------------------------------------------------------------------
  // Animation loop
  // ---------------------------------------------------------------------

  private tick = (time: number): void => {
    if (!this.visible) {
      this.rafId = 0;
      return;
    }

    const stillActive = this.update(time);
    this.render();

    if (!stillActive) {
      // Nothing is moving and the pointer isn't hovering — stop redrawing an
      // unchanged frame forever instead of burning CPU at 60fps for no reason.
      this.rafId = 0;
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  /**
   * Every particle always has a fixed rest position (tx, ty). Two things
   * happen each frame:
   *
   * 1. Kick: if the cursor is within KICK_RADIUS of a particle's CURRENT
   *    position (not its rest spot — a particle already mid-flight reacts
   *    based on where it actually is, which is what makes the field feel
   *    continuous rather than locked to the static portrait), it gets an
   *    outward velocity impulse — strongest at the cursor's center, fading
   *    to nothing at the radius's edge. The cooldown is ~1 frame, so a
   *    particle the cursor sits on top of keeps getting pushed every frame
   *    instead of reacting once and then ignoring the cursor.
   * 2. Spring-damper: every particle, kicked or not, has its velocity pulled
   *    toward its rest position (spring) and decayed (damping), then moves
   *    by that velocity. This is what makes a kicked particle decelerate,
   *    settle, and "reassemble" instead of sliding to a stop in a straight
   *    line or snapping back instantly.
   *
   * Returns whether the loop should keep running: true while the pointer is
   * over the canvas, or while any particle still has velocity or hasn't
   * settled exactly back onto its rest position.
   */
  private update(time: number): boolean {
    if (this.reduceMotion) return false;

    const n = this.count;
    const active = this.pointer.active;
    const pointerX = this.pointer.x;
    const pointerY = this.pointer.y;
    const stiffness = this.introActive ? INTRO_SPRING_STIFFNESS : SPRING_STIFFNESS;
    const damping = this.introActive ? INTRO_SPRING_DAMPING : SPRING_DAMPING;
    let stillMoving = active;

    for (let i = 0; i < n; i++) {
      const tx = this.tx[i]!;
      const ty = this.ty[i]!;

      if (active && time - this.lastKick[i]! > KICK_COOLDOWN_MS) {
        // Distance is measured from where the particle actually is right
        // now, not where it's supposed to rest — so the disturbance follows
        // the cursor through the cloud instead of being pinned to the
        // static portrait layout.
        const dx = this.px[i]! - pointerX;
        const dy = this.py[i]! - pointerY;
        const distSq = dx * dx + dy * dy;
        // Squared-distance early-out — sqrt only runs for the handful of
        // particles actually inside the kick radius, not all of them.
        if (distSq < KICK_RADIUS_SQ) {
          const dist = Math.sqrt(distSq) || 0.0001;
          const falloff = 1 - dist / KICK_RADIUS; // 1 at the cursor, 0 at the radius edge
          const kick = falloff * falloff * KICK_STRENGTH;
          const jitter = 0.05; // just enough to keep a dense cluster from moving in perfect lockstep
          this.vx[i]! += (dx / dist) * kick + (Math.random() - 0.5) * kick * jitter;
          this.vy[i]! += (dy / dist) * kick + (Math.random() - 0.5) * kick * jitter;
          this.lastKick[i] = time;
        }
      }

      const vx = (this.vx[i]! + (tx - this.px[i]!) * stiffness) * damping;
      const vy = (this.vy[i]! + (ty - this.py[i]!) * stiffness) * damping;
      this.vx[i] = vx;
      this.vy[i] = vy;

      const restDx = tx - this.px[i]!;
      const restDy = ty - this.py[i]!;
      if (
        Math.abs(vx) > REST_EPSILON ||
        Math.abs(vy) > REST_EPSILON ||
        Math.abs(restDx) > REST_EPSILON ||
        Math.abs(restDy) > REST_EPSILON
      ) {
        this.px[i]! += vx;
        this.py[i]! += vy;
        stillMoving = true;
      } else {
        // Close enough — snap the last fraction of a pixel and zero the
        // tiny residual velocity so this particle doesn't keep the loop
        // alive forever on an imperceptible jitter.
        this.px[i] = tx;
        this.py[i] = ty;
        this.vx[i] = 0;
        this.vy[i] = 0;
      }
    }

    // Everything has settled — the intro is over; from here on the spring
    // runs at stock hover constants.
    if (this.introActive && !stillMoving) this.introActive = false;

    return stillMoving;
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.count; i++) {
      ctx.fillStyle = this.particleColors[this.colorIndex[i]!]!;
      ctx.beginPath();
      ctx.arc(this.px[i]!, this.py[i]!, this.radius[i]!, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** 3x3 Sobel gradient magnitude over a luminance field. Background pixels
 *  (lum < 0) read as 0, so the subject's silhouette edge itself also comes
 *  through as a strong gradient — which is what gives the assembled result
 *  a crisp outline rather than a soft-edged cloud. */
function sobelMagnitude(lum: Float32Array, width: number, height: number): Float32Array {
  const out = new Float32Array(width * height);
  const at = (x: number, y: number): number => {
    const v = lum[y * width + x]!;
    return v < 0 ? 0 : v;
  };
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx =
        at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) -
        (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
      const gy =
        at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) -
        (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));
      out[y * width + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return out;
}

export function mountHeroParticles(canvas: HTMLCanvasElement, portraitSrc: string): HeroParticleField {
  return new HeroParticleField(canvas, portraitSrc);
}

import * as THREE from "three";
import type { ProjectKind, ProjectStatus } from "@/data/content";

/**
 * Low-poly site dioramas, one per project kind, built from primitives so no
 * model files ship. Each sits on a ~1×1 footprint with its origin at the
 * base centre. Status changes the build: planned sites are a translucent
 * ghost, ongoing ones are part-built with a crane beside them, completed ones
 * are solid.
 */

const PAPER = 0xf4f1ea;
const RED = 0xe64446;
const NAVY = 0x0b1227;
const CONCRETE = 0xc9c4bb;
const ASPHALT = 0x2a2d35;
const GRAVEL = 0x9b8f7e;
const WATER = 0x3d7fd6;
const STEEL = 0x8d96a3;
const AMBER = 0xf2a93b;
const GREEN = 0x3fb37f;

export const STATUS_COLOR: Record<ProjectStatus, number> = {
  completed: GREEN,
  ongoing: AMBER,
  planned: 0xb9bcc6,
};

type Build = {
  /** Everything that belongs to the finished structure. */
  root: THREE.Group;
  /** Parts that animate every frame (crane jib, water shimmer, …). */
  tick?: (t: number) => void;
};

const mats = new Map<string, THREE.MeshStandardMaterial>();
function mat(color: number, ghost: boolean, opts: { emissive?: number; rough?: number; metal?: number } = {}) {
  const key = `${color}-${ghost}-${opts.emissive ?? 0}-${opts.rough ?? 0.75}-${opts.metal ?? 0}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      // Planned sites are drawn as a pale blueprint of the finished build.
      color: ghost ? 0x9fb4e0 : color,
      roughness: opts.rough ?? 0.75,
      metalness: opts.metal ?? 0,
      emissive: opts.emissive ?? 0x000000,
      flatShading: true,
      transparent: ghost,
      opacity: ghost ? 0.55 : 1,
      depthWrite: !ghost,
    });
    mats.set(key, m);
  }
  return m;
}

function box(w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y + h / 2, z);
  return mesh;
}

function cyl(r: number, h: number, m: THREE.Material, x = 0, y = 0, z = 0, seg = 10) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
  mesh.position.set(x, y + h / 2, z);
  return mesh;
}

/** Flat ribbon along a curve on the ground, for roads and rivers. */
function ribbon(curve: THREE.Curve<THREE.Vector3>, width: number, m: THREE.Material, from = 0, to = 1, y = 0.012) {
  const steps = 48;
  const pos: number[] = [];
  const idx: number[] = [];
  const side = new THREE.Vector3();
  for (let i = 0; i <= steps; i++) {
    const u = from + ((to - from) * i) / steps;
    const p = curve.getPointAt(u);
    const t = curve.getTangentAt(u);
    side.set(-t.z, 0, t.x).normalize().multiplyScalar(width / 2);
    pos.push(p.x + side.x, y, p.z + side.z, p.x - side.x, y, p.z - side.z);
    if (i < steps) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return new THREE.Mesh(g, m);
}

/** A tower crane: mast, slewing jib and a hook line. */
function crane(x: number, z: number, height = 0.72): Build {
  const root = new THREE.Group();
  const yellow = mat(AMBER, false, { rough: 0.6 });
  const dark = mat(NAVY, false);
  root.add(box(0.05, height, 0.05, yellow));
  const jib = new THREE.Group();
  jib.position.y = height;
  jib.add(box(0.62, 0.035, 0.035, yellow, 0.18, 0, 0));
  jib.add(box(0.1, 0.07, 0.07, dark, -0.12, -0.02, 0));
  const line = box(0.006, 0.3, 0.006, dark, 0.38, -0.3, 0);
  const hook = box(0.04, 0.03, 0.04, dark, 0.38, -0.32, 0);
  jib.add(line, hook);
  root.add(jib);
  root.position.set(x, 0, z);
  return { root, tick: (t) => (jib.rotation.y = Math.sin(t * 0.45) * 0.9) };
}

function bridge(ghost: boolean, progress: number): Build {
  const root = new THREE.Group();
  const river = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.05, 0, -0.55),
    new THREE.Vector3(0.06, 0, -0.15),
    new THREE.Vector3(-0.04, 0, 0.2),
    new THREE.Vector3(0.05, 0, 0.55),
  ]);
  const water = mat(WATER, false, { rough: 0.25, metal: 0.1, emissive: 0x0b2a55 });
  root.add(ribbon(river, 0.32, water));

  const concrete = mat(CONCRETE, ghost);
  const red = mat(RED, ghost, { rough: 0.55 });
  const deckY = 0.2;
  // The deck is laid from both banks towards the middle as work progresses.
  const span = 1.1;
  const laid = ghost ? 1 : progress / 100;
  const half = (span / 2) * laid;
  root.add(box(half, 0.04, 0.2, concrete, -span / 2 + half / 2, deckY, 0));
  root.add(box(half, 0.04, 0.2, concrete, span / 2 - half / 2, deckY, 0));
  for (const sx of [-0.33, 0.33]) {
    for (const sz of [-0.09, 0.09]) root.add(box(0.045, 0.5, 0.045, red, sx, 0, sz));
    root.add(box(0.045, 0.04, 0.22, red, sx, 0.46, 0));
  }
  const cableMat = mat(PAPER, ghost, { rough: 0.4 });
  for (const sz of [-0.09, 0.09]) {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.56, deckY + 0.04, sz),
      new THREE.Vector3(-0.33, 0.5, sz),
      new THREE.Vector3(0, deckY + 0.12, sz),
      new THREE.Vector3(0.33, 0.5, sz),
      new THREE.Vector3(0.56, deckY + 0.04, sz),
    ]);
    root.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.008, 4), cableMat));
    const samples = c.getSpacedPoints(120);
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const x = i * 0.065;
      // Hangers only where the deck has reached.
      if (Math.abs(x) < span / 2 - half) continue;
      const top = samples.reduce((a, b) => (Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a)).y;
      root.add(box(0.005, top - deckY - 0.04, 0.005, cableMat, x, deckY + 0.04, sz));
    }
  }
  return { root };
}

function road(ghost: boolean, progress: number): Build {
  const root = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.55, 0, 0.3),
    new THREE.Vector3(-0.2, 0, 0.05),
    new THREE.Vector3(0.1, 0, 0.22),
    new THREE.Vector3(0.5, 0, -0.3),
  ]);
  const done = ghost ? 0 : progress / 100;
  root.add(ribbon(curve, 0.26, mat(GRAVEL, ghost), 0, 1, 0.01));
  if (done > 0) {
    root.add(ribbon(curve, 0.24, mat(ASPHALT, false, { rough: 0.9 }), 0, done, 0.016));
    const dash = mat(PAPER, false);
    for (let u = 0.04; u < done - 0.02; u += 0.09) {
      const p = curve.getPointAt(u);
      const t = curve.getTangentAt(u);
      const d = box(0.05, 0.004, 0.012, dash, 0, 0.016, 0);
      d.position.x = p.x;
      d.position.z = p.z;
      d.rotation.y = -Math.atan2(t.z, t.x);
      root.add(d);
    }
  }
  // Cones mark the working end; on a finished road there is nothing to mark.
  const coneMat = mat(0xf26b1d, ghost, { rough: 0.6 });
  const at = curve.getPointAt(Math.min(0.97, Math.max(0.08, done || 0.5)));
  for (const [dx, dz] of [
    [0.12, 0.1],
    [-0.08, 0.14],
    [0.02, -0.14],
  ]) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 8), coneMat);
    cone.position.set(at.x + dx, 0.045, at.z + dz);
    root.add(cone);
  }
  if (!ghost && done < 1) {
    // Road roller parked at the paving front.
    const roller = new THREE.Group();
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 12), mat(STEEL, false, { metal: 0.4, rough: 0.5 }));
    drum.rotation.x = Math.PI / 2;
    drum.position.set(0.07, 0.05, 0);
    roller.add(drum, box(0.12, 0.08, 0.12, mat(AMBER, false), -0.04, 0.02, 0), box(0.06, 0.06, 0.1, mat(NAVY, false), -0.05, 0.1, 0));
    const p = curve.getPointAt(Math.max(0.05, done - 0.04));
    const t = curve.getTangentAt(Math.max(0.05, done - 0.04));
    roller.position.set(p.x, 0.016, p.z);
    roller.rotation.y = -Math.atan2(t.z, t.x);
    root.add(roller);
  }
  return { root };
}

function gable(w: number, h: number, d: number, m: THREE.Material, y: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  const mesh = new THREE.Mesh(g, m);
  mesh.rotation.y = Math.PI / 2;
  mesh.position.y = y;
  return mesh;
}

function school(ghost: boolean): Build {
  const root = new THREE.Group();
  const wall = mat(PAPER, ghost);
  const win = mat(NAVY, ghost);
  root.add(box(0.36, 0.26, 0.72, wall));
  root.add(gable(0.44, 0.16, 0.8, mat(RED, ghost, { rough: 0.6 }), 0.26));
  for (let i = -2; i <= 2; i++) {
    root.add(box(0.012, 0.07, 0.08, win, 0.18, 0.1, i * 0.14));
    root.add(box(0.012, 0.07, 0.08, win, -0.18, 0.1, i * 0.14));
  }
  root.add(box(0.012, 0.13, 0.1, mat(0x6b4a33, ghost), 0.18, 0, 0));
  // Flag in the yard.
  root.add(cyl(0.008, 0.5, mat(STEEL, ghost), 0.36, 0, -0.32, 6));
  const flag = box(0.004, 0.08, 0.12, mat(RED, ghost), 0.36, 0.4, -0.26);
  root.add(flag);
  return { root, tick: (t) => (flag.rotation.y = Math.sin(t * 2.2) * 0.25) };
}

function health(ghost: boolean): Build {
  const root = new THREE.Group();
  const wall = mat(PAPER, ghost);
  const red = mat(RED, ghost, { emissive: ghost ? 0 : 0x3a0606 });
  root.add(box(0.5, 0.28, 0.5, wall));
  root.add(box(0.54, 0.03, 0.54, mat(CONCRETE, ghost), 0, 0.28, 0));
  root.add(box(0.2, 0.06, 0.06, red, 0, 0.31, 0));
  root.add(box(0.06, 0.06, 0.2, red, 0, 0.31, 0));
  root.add(box(0.012, 0.1, 0.1, red, 0.25, 0.14, 0));
  root.add(box(0.012, 0.1, 0.03, red, 0.25, 0.175, 0));
  root.add(box(0.14, 0.02, 0.18, mat(CONCRETE, ghost), 0.31, 0.13, 0));
  const win = mat(NAVY, ghost);
  for (const z of [-0.16, 0.16]) root.add(box(0.012, 0.07, 0.09, win, 0.25, 0.1, z));
  return { root };
}

function waterTank(ghost: boolean, progress: number): Build {
  const root = new THREE.Group();
  const steel = mat(STEEL, ghost, { metal: 0.3, rough: 0.5 });
  const legH = 0.36;
  for (const [x, z] of [
    [-0.13, -0.13],
    [0.13, -0.13],
    [-0.13, 0.13],
    [0.13, 0.13],
  ]) {
    const leg = box(0.03, legH, 0.03, steel, x, 0, z);
    root.add(leg);
  }
  root.add(box(0.3, 0.02, 0.02, steel, 0, legH * 0.5, -0.13), box(0.3, 0.02, 0.02, steel, 0, legH * 0.5, 0.13));
  const tankH = 0.24 * (ghost ? 1 : Math.max(0.35, progress / 100));
  const tank = cyl(0.2, tankH, mat(PAPER, ghost), 0, legH, 0, 14);
  root.add(tank);
  root.add(cyl(0.205, 0.035, mat(WATER, ghost, { emissive: 0x0b2a55 }), 0, legH + tankH * 0.55, 0, 14));
  if (ghost || progress >= 100) {
    const lid = new THREE.Mesh(new THREE.ConeGeometry(0.21, 0.08, 14), mat(RED, ghost));
    lid.position.y = legH + tankH + 0.04;
    root.add(lid);
  }
  root.add(box(0.025, legH, 0.025, mat(WATER, ghost), 0.06, 0, 0.06));
  // Pipe out to a village tap.
  root.add(box(0.36, 0.02, 0.02, mat(WATER, ghost), 0.24, 0.01, 0.06));
  root.add(box(0.03, 0.09, 0.03, mat(CONCRETE, ghost), 0.42, 0, 0.06));
  return { root };
}

function pylon(ghost: boolean): Build {
  const root = new THREE.Group();
  const steel = mat(STEEL, ghost, { metal: 0.5, rough: 0.45 });
  const H = 0.78;
  const base = 0.13;
  const top = 0.035;
  // Four tapered legs and cross-bracing.
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const a = new THREE.Vector3(sx * base, 0, sz * base);
    const b = new THREE.Vector3(sx * top, H, sz * top);
    const len = a.distanceTo(b);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.018, len, 0.018), steel);
    leg.position.copy(a).add(b).multiplyScalar(0.5);
    leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    root.add(leg);
  }
  for (const [y, w] of [
    [0.25, 0.2],
    [0.5, 0.13],
  ]) {
    root.add(box(w, 0.012, 0.012, steel, 0, y, w / 2), box(w, 0.012, 0.012, steel, 0, y, -w / 2));
    root.add(box(0.012, 0.012, w, steel, w / 2, y, 0), box(0.012, 0.012, w, steel, -w / 2, y, 0));
  }
  for (const [y, w] of [
    [0.62, 0.5],
    [0.74, 0.36],
  ]) root.add(box(0.02, 0.02, w, steel, 0, y, 0));
  const wire = mat(NAVY, ghost);
  for (const [y, z] of [
    [0.6, 0.25],
    [0.6, -0.25],
    [0.72, 0.18],
    [0.72, -0.18],
  ]) {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.55, y - 0.18, z),
      new THREE.Vector3(-0.28, y - 0.08, z),
      new THREE.Vector3(0, y, z),
      new THREE.Vector3(0.28, y - 0.08, z),
      new THREE.Vector3(0.55, y - 0.18, z),
    ]);
    root.add(new THREE.Mesh(new THREE.TubeGeometry(c, 24, 0.004, 3), wire));
  }
  return { root };
}

/** Run-of-river / storage scheme: dam across the river, reservoir, penstock, powerhouse. */
function hydro(ghost: boolean, progress: number): Build {
  const root = new THREE.Group();
  const water = mat(WATER, false, { rough: 0.25, metal: 0.1, emissive: 0x0b2a55 });
  const river = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.08, 0, -0.56),
    new THREE.Vector3(0.04, 0, -0.1),
    new THREE.Vector3(-0.04, 0, 0.25),
    new THREE.Vector3(0.06, 0, 0.56),
  ]);
  root.add(ribbon(river, 0.22, water));
  // Reservoir pooled behind the dam (upstream, north).
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 24), water);
  pool.scale.set(1.25, 1, 0.75);
  pool.position.set(0, 0.018, -0.3);
  root.add(pool);

  const concrete = mat(CONCRETE, ghost);
  // The dam rises with progress; a planned one is the full blueprint.
  const damH = 0.26 * (ghost ? 1 : Math.max(0.3, progress / 100));
  root.add(box(0.7, damH, 0.1, concrete, 0, 0, -0.05));
  root.add(box(0.12, damH * 0.85, 0.05, mat(PAPER, ghost), 0, 0, 0.02));
  // Penstock down to the powerhouse.
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), mat(STEEL, ghost, { metal: 0.4, rough: 0.5 }));
  pipe.rotation.x = Math.PI / 2.6;
  pipe.position.set(0.24, 0.1, 0.12);
  root.add(pipe);
  root.add(box(0.26, 0.16, 0.2, mat(PAPER, ghost), 0.26, 0, 0.36));
  const roof = gable(0.24, 0.07, 0.3, mat(RED, ghost, { rough: 0.6 }), 0.16);
  roof.position.x = 0.26;
  roof.position.z = 0.36;
  root.add(roof);
  // Transmission mast beside the powerhouse.
  root.add(box(0.025, 0.42, 0.025, mat(STEEL, ghost, { metal: 0.5 }), 0.45, 0, 0.2));
  root.add(box(0.14, 0.02, 0.02, mat(STEEL, ghost, { metal: 0.5 }), 0.45, 0.38, 0.2));
  return { root };
}

export type Site = {
  group: THREE.Group;
  /** Invisible, generous pick target for the pointer. */
  hit: THREE.Mesh;
  ring: THREE.Mesh;
  tick: (t: number) => void;
};

/** Builds a project's diorama on its status plinth. */
export function buildSite(kind: ProjectKind, status: ProjectStatus, progress: number): Site {
  const ghost = status === "planned";
  const group = new THREE.Group();
  const builders: Record<ProjectKind, () => Build> = {
    bridge: () => bridge(ghost, progress),
    road: () => road(ghost, progress),
    school: () => school(ghost),
    health: () => health(ghost),
    water: () => waterTank(ghost, progress),
    power: () => pylon(ghost),
    hydro: () => hydro(ghost, progress),
  };
  const ticks: ((t: number) => void)[] = [];
  const main = builders[kind]();
  main.root.position.y = 0.05;
  main.root.scale.setScalar(1.3);
  group.add(main.root);
  if (main.tick) ticks.push(main.tick);

  if (status === "ongoing" && kind !== "road") {
    const c = crane(-0.5, -0.42);
    c.root.position.y = 0.05;
    c.root.scale.setScalar(1.3);
    group.add(c.root);
    if (c.tick) ticks.push(c.tick);
  }

  // Plinth: a paper disc like the hero's cut-out border, ringed in the status colour.
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.76, 0.05, 40), mat(PAPER, false, { rough: 0.9 }));
  plinth.position.y = 0.025;
  plinth.receiveShadow = true;
  group.add(plinth);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.02, 6, 64),
    new THREE.MeshBasicMaterial({ color: STATUS_COLOR[status], transparent: true }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.03;
  group.add(ring);

  group.traverse((o) => {
    if (o instanceof THREE.Mesh && o !== ring) {
      o.castShadow = !ghost;
      o.receiveShadow = true;
    }
  });

  const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.3, 12), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 0.65;
  group.add(hit);

  return {
    group,
    hit,
    ring,
    tick: (t) => {
      for (const fn of ticks) fn(t);
      if (status === "ongoing") {
        const k = (t * 0.6) % 1;
        ring.scale.setScalar(1 + k * 0.35);
        (ring.material as THREE.MeshBasicMaterial).opacity = 1 - k;
      }
    },
  };
}

/** A faceted snow peak for the Himalayan north. */
export function buildPeak(h: number) {
  const group = new THREE.Group();
  const rock = new THREE.Mesh(new THREE.ConeGeometry(0.75 * h, 1.1 * h, 6, 1), mat(0xc63d3f, false, { rough: 0.95 }));
  rock.position.y = 0.55 * h;
  rock.rotation.y = h * 3;
  const snow = new THREE.Mesh(new THREE.ConeGeometry(0.33 * h, 0.48 * h, 6, 1), mat(PAPER, false, { rough: 0.6 }));
  snow.position.y = 0.86 * h;
  snow.rotation.y = h * 3;
  group.add(rock, snow);
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return group;
}

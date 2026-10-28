import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import gsap from "gsap";
import type { ManifestoProject } from "@/data/content";
import { gorkhaPath } from "@/data/gorkha-path";
import { idle } from "../motion/idle";
import { buildPeak, buildSite, type Site } from "./models";

/**
 * The live Gorkha manifesto as a 3D map: Nepal's districts as a ground plane
 * (from public/svg/nepal-map.svg), Gorkha raised out of it, and a diorama on
 * each project site. Map units are the SVG's; one world unit is 100 of them,
 * with +x east and +z south so the camera looks north like the 2D map.
 *
 * `setIntro(p)` builds the scene from nothing (0) to the finished 3D view (1):
 * the map fades in and swings into its tilt, Gorkha rises, peaks grow and the
 * sites pop up. GorkhaMap tweens it in on entry and back out on exit. The pointer orbits a little on move;
 * drag pans, Shift/right-drag turns, pinch or ⌘/Ctrl + wheel zooms, and
 * clicking a site flies the camera to it.
 *
 * Building it is ~150ms of main-thread work, so it is spread over idle
 * periods, and every shader is compiled before the stage is first shown
 * rather than on the frame a peak or site first appears.
 */

const K = 0.01;
const CX = 650;
const CY = 1905;
const DEPTH = 0.3;
const DEG = Math.PI / 180;
/** Site and peak sizes relative to the models' own ~1-unit footprint. */
const SITE = 0.6;
const PEAK = 0.62;

const toWorld = (x: number, y: number) => new THREE.Vector3((x - CX) * K, 0, (y - CY) * K);

type Options = {
  host: HTMLElement;
  card: HTMLElement;
  projects: ManifestoProject[];
  peaks: { x: number; y: number; h: number }[];
  mapUrl: string;
  reduced: boolean;
  /** Fraction of the width the map is pushed left by (room for the text column). */
  shift: () => number;
  /** The project the card should follow changed (hovered, focused or picked in the list). */
  onActive: (id: string | null) => void;
  onFocus: (id: string | null) => void;
  /** Zoom changed (to disable the +/− buttons at their limits). */
  onView?: (v: { zoom: number; zoomMin: number; zoomMax: number }) => void;
};

export type GorkhaScene = {
  setIntro: (p: number) => void;
  /** Highlight from outside the canvas (the project list). */
  setListActive: (id: string | null) => void;
  focus: (id: string | null) => void;
  /** Multiplies the camera distance (<1 zooms in). */
  zoomBy: (f: number) => void;
  turnBy: (rad: number) => void;
  /** Back to the default view. */
  reset: () => void;
  destroy: () => void;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const backOut = (t: number) => {
  const s = 1.9;
  const u = t - 1;
  return t <= 0 ? 0 : t >= 1 ? 1 : u * u * ((s + 1) * u + s) + 1;
};

function districts(svg: string) {
  const data = new SVGLoader().parse(svg);
  const fills: THREE.BufferGeometry[] = [];
  const edges: number[] = [];
  for (const path of data.paths) {
    for (const shape of SVGLoader.createShapes(path)) {
      const g = new THREE.ShapeGeometry(shape, 2);
      g.deleteAttribute("uv");
      fills.push(g);
    }
    for (const sub of path.subPaths) {
      const pts = sub.getPoints();
      for (let i = 0; i < pts.length - 1; i++) edges.push(pts[i].x, pts[i].y, 0, pts[i + 1].x, pts[i + 1].y, 0);
    }
  }
  const fill = mergeGeometries(fills);
  fills.forEach((g) => g.dispose());
  const line = new THREE.BufferGeometry();
  line.setAttribute("position", new THREE.Float32BufferAttribute(edges, 3));
  for (const g of [fill, line]) {
    g.rotateX(Math.PI / 2);
    g.translate(-CX, 0, -CY);
    g.scale(K, K, K);
  }
  return { fill, line };
}

function gorkha() {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${gorkhaPath}"/></svg>`);
  const shape = SVGLoader.createShapes(data.paths[0])[0];
  const solid = new THREE.ExtrudeGeometry(shape, { depth: DEPTH / K, bevelEnabled: false, curveSegments: 1 });
  // Shape y (south) → +z; the extrusion runs downwards, so lift it by its depth.
  solid.rotateX(Math.PI / 2);
  solid.translate(-CX, DEPTH / K, -CY);
  solid.scale(K, K, K);

  const outline = new THREE.BufferGeometry().setFromPoints(
    shape.getPoints().map((p) => new THREE.Vector3((p.x - CX) * K, DEPTH + 0.004, (p.y - CY) * K)),
  );
  return { solid, outline };
}

export async function createGorkhaScene(o: Options): Promise<GorkhaScene> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  // The canvas fills the stage and redraws every frame it is on screen,
  // while the page scrolls over it: 1.5× keeps that well inside budget.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.opacity = "0";
  o.host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);

  scene.add(new THREE.HemisphereLight(0xfff6ec, 0x2a1020, 1.15));
  const sun = new THREE.DirectionalLight(0xfff1e0, 2.4);
  sun.position.set(-5, 11, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 7;
  sun.shadow.camera.bottom = -7;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 30;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x9db8ff, 0.5);
  rim.position.set(6, 4, -8);
  scene.add(rim);

  // Ground: every district, plus faint borders.
  const svg = await fetch(o.mapUrl).then((r) => r.text());
  await idle();
  const ground = districts(svg);
  const groundMesh = new THREE.Mesh(
    ground.fill,
    new THREE.MeshStandardMaterial({ color: 0x351719, roughness: 1, side: THREE.DoubleSide }),
  );
  groundMesh.receiveShadow = true;
  const borders = new THREE.LineSegments(
    ground.line,
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.09 }),
  );
  borders.position.y = 0.002;
  scene.add(groundMesh, borders);

  // Gorkha, raised out of the map.
  await idle();
  const g = gorkha();
  const lift = new THREE.Group();
  const solid = new THREE.Mesh(g.solid, [
    new THREE.MeshStandardMaterial({ color: 0xe64446, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0xa3282a, roughness: 0.9 }),
  ]);
  solid.castShadow = true;
  solid.receiveShadow = true;
  const outline = new THREE.Line(g.outline, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }));
  lift.add(solid, outline);
  scene.add(lift);

  const peaks = o.peaks.map((p) => {
    const m = buildPeak(p.h * PEAK);
    m.position.copy(toWorld(p.x, p.y));
    scene.add(m);
    return { mesh: m, h: p.h };
  });

  const sites = o.projects.map((p, i) => {
    // Without a reported figure, an ongoing site is drawn about half built.
    const built = p.status === "completed" ? 100 : p.status === "planned" ? 0 : (p.progress ?? 50);
    const site: Site = buildSite(p.kind, p.status, built);
    site.group.position.copy(toWorld(p.x, p.y));
    site.group.scale.setScalar(0.001);
    site.hit.userData.id = p.id;
    scene.add(site.group);
    return { id: p.id, i, site, base: toWorld(p.x, p.y), hover: 0 };
  });
  const hits = sites.map((s) => s.site.hit);

  /* ------------------------------------------------------------ camera */
  const cur = { yaw: 0, pitch: 89 * DEG, dist: 18, tx: 0, tz: 0.2 };
  let intro = 0;
  let mouseX = 0;
  let mouseY = 0;
  let dragYaw = 0;
  let dragPitch = 0;
  // Visitor's own view: pan offset (world units), zoom (distance multiplier).
  let panX = 0;
  let panZ = 0;
  let zoom = 1;
  let focused: string | null = null;
  let hovered: string | null = null;
  let listActive: string | null = null;
  let active: string | null = null;
  let w = 1;
  let h = 1;
  let fit = 1;

  const desired = () => {
    const e = smooth(0, 0.65, intro);
    const d = { yaw: (-38 + 22 * e) * DEG, pitch: (72 - 22 * e) * DEG, dist: (27 - 4.5 * e) * fit, tx: 0, tz: -0.2 };
    if (intro > 0.6) {
      d.yaw += mouseX * 5 * DEG + dragYaw;
      d.pitch += mouseY * 2.5 * DEG + dragPitch;
      d.tx += panX;
      d.tz += panZ;
      d.dist *= zoom;
    }
    const f = focused && sites.find((s) => s.id === focused);
    if (f) {
      d.tx = f.base.x;
      d.tz = f.base.z;
      d.dist = 7 * Math.min(1, zoom);
      d.pitch = Math.min(d.pitch, 44 * DEG);
    }
    d.pitch = Math.min(89 * DEG, Math.max(22 * DEG, d.pitch));
    return d;
  };

  const place = () => {
    const target = new THREE.Vector3(cur.tx, DEPTH * 0.5, cur.tz);
    camera.position.set(
      target.x + cur.dist * Math.cos(cur.pitch) * Math.sin(cur.yaw),
      target.y + cur.dist * Math.sin(cur.pitch),
      target.z + cur.dist * Math.cos(cur.pitch) * Math.cos(cur.yaw),
    );
    camera.lookAt(target);
  };

  const resize = () => {
    w = Math.max(1, o.host.clientWidth);
    h = Math.max(1, o.host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the whole district in frame on narrow screens.
    fit = Math.max(1, 1.25 / camera.aspect);
    const s = o.shift();
    if (s) camera.setViewOffset(w, h, w * s, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(o.host);

  /* ----------------------------------------------------------- pointer */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2(-9, -9);
  let pointerIn = false;
  // Drag pans the map; Shift- or right-drag turns it.
  let down: { x: number; y: number; yaw: number; pitch: number; panX: number; panZ: number; turn: boolean } | null =
    null;
  let dragged = false;
  // Two-finger pinch on touch screens.
  const touches = new Map<number, { x: number; y: number }>();
  let pinch: { d: number; zoom: number } | null = null;

  const ZOOM_MIN = 0.35;
  const ZOOM_MAX = 1.5;
  const setZoom = (z: number) => {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
    o.onView?.({ zoom, zoomMin: ZOOM_MIN, zoomMax: ZOOM_MAX });
  };
  const clampPan = () => {
    panX = Math.max(-4.5, Math.min(4.5, panX));
    panZ = Math.max(-5.5, Math.min(5.5, panZ));
  };
  const pinchDist = () => {
    const [a, b] = [...touches.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const pick = () => {
    if (!pointerIn || intro < 0.85) return null;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(hits, false)[0];
    return (hit?.object.userData.id as string | undefined) ?? null;
  };

  const onMove = (e: PointerEvent) => {
    const r = o.host.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    ndc.set(x * 2 - 1, -(y * 2 - 1));
    if (e.pointerType === "mouse") {
      mouseX = x * 2 - 1;
      mouseY = y * 2 - 1;
    }
    if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && touches.size === 2) {
      setZoom(pinch.zoom * (pinch.d / Math.max(1, pinchDist())));
      return;
    }
    if (down) {
      const dx = e.clientX - down.x;
      const dy = e.clientY - down.y;
      if (!dragged && Math.hypot(dx, dy) > 6) {
        dragged = true;
        o.host.dataset.dragging = "";
      }
      if (dragged && down.turn) {
        dragYaw = Math.max(-80 * DEG, Math.min(80 * DEG, down.yaw - dx * 0.3 * DEG));
        dragPitch = Math.max(-14 * DEG, Math.min(22 * DEG, down.pitch + dy * 0.15 * DEG));
      } else if (dragged) {
        // Grab the ground: world units per pixel at the current distance.
        const k = (2 * cur.dist * Math.tan((camera.fov * DEG) / 2)) / h;
        const fz = k / Math.max(0.5, Math.sin(cur.pitch));
        const c = Math.cos(cur.yaw);
        const sn = Math.sin(cur.yaw);
        panX = down.panX - dx * k * c - dy * fz * sn;
        panZ = down.panZ + dx * k * sn - dy * fz * c;
        clampPan();
        if (focused) api.focus(null);
      }
    }
  };
  const onEnter = () => (pointerIn = true);
  const onLeave = () => {
    pointerIn = false;
    mouseX = mouseY = 0;
    ndc.set(-9, -9);
  };
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.button !== 2) return;
    pointerIn = true;
    if (e.pointerType === "touch") {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) {
        pinch = { d: pinchDist(), zoom };
        down = null;
        return;
      }
    }
    // Panning (and focusing) only makes sense once the 3D map is up.
    if (intro < 0.6) return;
    const turn = e.button === 2 || e.shiftKey;
    down = { x: e.clientX, y: e.clientY, yaw: dragYaw, pitch: dragPitch, panX, panZ, turn };
    dragged = false;
    onMove(e);
  };
  const onUp = (e: PointerEvent) => {
    touches.delete(e.pointerId);
    if (touches.size < 2) pinch = null;
    if (!down) return;
    if (!dragged && !down.turn) {
      const id = pick();
      api.focus(id && id !== focused ? id : null);
    }
    down = null;
    dragged = false;
    delete o.host.dataset.dragging;
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && focused) api.focus(null);
  };
  // Trackpad pinch arrives as ctrl+wheel; ⌘/Ctrl + wheel zooms too. A plain
  // wheel keeps scrolling the page, since the pinned map fills the screen.
  const onWheel = (e: WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey) || intro < 0.6) return;
    e.preventDefault();
    // Pinch sends many small deltas, a mouse wheel a few large ones: cap each step.
    const delta = Math.max(-40, Math.min(40, e.deltaMode ? e.deltaY * 16 : e.deltaY));
    setZoom(zoom * Math.exp(delta * 0.005));
  };
  const onMenu = (e: Event) => e.preventDefault();
  o.host.addEventListener("pointermove", onMove);
  o.host.addEventListener("pointerenter", onEnter);
  o.host.addEventListener("pointerleave", onLeave);
  o.host.addEventListener("pointerdown", onDown);
  o.host.addEventListener("wheel", onWheel, { passive: false });
  o.host.addEventListener("contextmenu", onMenu);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  window.addEventListener("keydown", onKey);

  /* ------------------------------------------------------------- frame */
  const tmp = new THREE.Vector3();
  const setActive = () => {
    const next = focused ?? hovered ?? listActive;
    if (next !== active) {
      active = next;
      o.onActive(active);
    }
  };

  const render = (time: number, dt: number) => {
    const k = o.reduced ? 1 : 1 - Math.exp(-dt * 5);
    const d = desired();
    cur.yaw += (d.yaw - cur.yaw) * k;
    cur.pitch += (d.pitch - cur.pitch) * k;
    cur.dist += (d.dist - cur.dist) * k;
    cur.tx += (d.tx - cur.tx) * k;
    cur.tz += (d.tz - cur.tz) * k;
    place();

    const rise = Math.max(0.002, smooth(0.05, 0.45, intro));
    lift.scale.y = rise;
    const grow = smooth(0.25, 0.65, intro);
    for (const p of peaks) {
      p.mesh.visible = grow > 0.02;
      p.mesh.scale.set(1, Math.max(0.001, grow), 1);
      p.mesh.position.y = DEPTH * rise;
    }

    const next = down && dragged ? hovered : pick();
    if (next !== hovered) {
      hovered = next;
      o.host.dataset.hover = hovered ? "site" : "";
    }
    setActive();

    for (const s of sites) {
      const appear = backOut(clamp01((intro - 0.45 - s.i * 0.05) / 0.25));
      const on = s.id === active ? 1 : 0;
      s.hover += (on - s.hover) * (o.reduced ? 1 : 1 - Math.exp(-dt * 10));
      s.site.group.visible = appear > 0.01;
      s.site.group.scale.setScalar(Math.max(0.001, appear * SITE * (1 + s.hover * 0.2)));
      s.site.group.position.y = DEPTH * rise + s.hover * 0.08;
      if (!o.reduced) s.site.tick(time);
    }

    // The card rides above a hovered site's model; a focused (zoomed) site
    // gets it alongside, clear of its on-screen radius.
    const a = active && sites.find((s) => s.id === active);
    if (a) {
      const side = a.id === focused;
      const toScreen = (v: THREE.Vector3) => {
        v.project(camera);
        return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
      };
      const p = toScreen(tmp.set(a.base.x, DEPTH + (side ? 0.25 : 0.75) * (SITE / 0.85), a.base.z));
      const edge = toScreen(tmp.set(a.base.x + 0.8 * (SITE / 0.85), DEPTH + 0.25, a.base.z));
      const r = Math.hypot(edge.x - p.x, edge.y - p.y);
      o.card.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
      o.card.style.setProperty("--r", `${r.toFixed(1)}px`);
      // Right of the site unless that would run into the text column (desktop) or off screen.
      const room = (o.shift() ? w * 0.64 : w) - (p.x + r + 18);
      o.card.dataset.mode = side ? (room < 310 ? "side-left" : "side") : p.y < h * 0.36 ? "below" : "above";
      o.card.dataset.flip = !side && p.x > w * 0.62 ? "left" : "";
    }

    renderer.render(scene, camera);
  };

  // Only draw while the stage is on screen.
  let last = performance.now();
  const tick = () => {
    const now = performance.now();
    render(now / 1000, Math.min(0.05, (now - last) / 1000));
    last = now;
  };
  let running = false;
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) {
      running = true;
      last = performance.now();
      gsap.ticker.add(tick);
    } else if (!entry.isIntersecting && running) {
      running = false;
      gsap.ticker.remove(tick);
    }
  });

  // Warm up while the canvas is still transparent: compile every program
  // (in parallel where the browser can), then draw once with everything
  // shown so the shadow pass compiles and every buffer is uploaded. Left to
  // the first visible frames, Safari stalls ~200ms mid-scroll.
  await idle();
  await renderer.compileAsync(scene, camera);
  await idle();
  const hidden: THREE.Object3D[] = [];
  scene.traverse((obj) => {
    if (!obj.visible) {
      hidden.push(obj);
      obj.visible = true;
    }
  });
  place();
  renderer.render(scene, camera);
  hidden.forEach((obj) => (obj.visible = false));
  render(0, 1);
  io.observe(o.host);

  const api: GorkhaScene = {
    setIntro(p) {
      intro = clamp01(p);
      canvas.style.opacity = String(smooth(0, 0.3, intro));
      if (!running) render(performance.now() / 1000, 1);
    },
    setListActive(id) {
      listActive = id;
      setActive();
    },
    zoomBy(f) {
      setZoom(zoom * f);
    },
    turnBy(rad) {
      dragYaw = Math.max(-80 * DEG, Math.min(80 * DEG, dragYaw + rad));
    },
    reset() {
      panX = panZ = 0;
      dragYaw = dragPitch = 0;
      setZoom(1);
      api.focus(null);
    },
    focus(id) {
      if (id !== null) {
        // A fresh look at the site: drop any drag tilt.
        dragYaw *= 0.4;
        dragPitch = 0;
      }
      focused = id;
      o.onFocus(id);
      setActive();
    },
    destroy() {
      io.disconnect();
      ro.disconnect();
      gsap.ticker.remove(tick);
      o.host.removeEventListener("pointermove", onMove);
      o.host.removeEventListener("pointerenter", onEnter);
      o.host.removeEventListener("pointerleave", onLeave);
      o.host.removeEventListener("pointerdown", onDown);
      o.host.removeEventListener("wheel", onWheel);
      o.host.removeEventListener("contextmenu", onMenu);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKey);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
          obj.geometry.dispose();
          const m = obj.material as THREE.Material | THREE.Material[];
          (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose());
        }
      });
      renderer.dispose();
      canvas.remove();
    },
  };
  return api;
}

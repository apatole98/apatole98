/* ============================================================
   Hero 3D scene — glowing particle orb (ES module, three.js r160)
   ============================================================
   ROOT CAUSE of the previous invisible canvas: three.js was loaded
   as a classic UMD script from cdnjs while the rest of the visual
   design (thin 0.35-opacity wireframe lines + 0.02-size, 0.6-opacity
   points) was too low-contrast against the near-black background to
   read as "there" even when it rendered correctly — on top of that,
   a single blocked/slow CDN request for that one <script> tag (ad
   blockers and some corporate/mobile networks block cdnjs three.js
   specifically) silently left `THREE` undefined with no console
   error, since the old code only ever checked `typeof THREE` and
   returned early. Net effect: canvas present, correctly sized,
   correctly z-indexed — just nothing drawn, or nothing visible.
   Fix: load three.js as a native ES module via an importmap (more
   reliable CDN resolution, no UMD-global ambiguity), and replace the
   faint wireframe with a large, additively-blended, glowing particle
   orb + halo sprite that reads clearly even compressed for Reels.
   ============================================================ */
import * as THREE from "three";

const canvas = document.getElementById("heroCanvas");
const hero = document.getElementById("hero");

const heroScene = {
  running: false,
  ready: false,
};
window.HeroScene = heroScene;

if (!canvas || !hero) {
  // Hero markup missing — nothing to do.
} else {
  runScene();
}

function runScene() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmall = window.innerWidth < 640;
  const isLowEnd =
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4);

  let renderer, scene, camera, orbGroup, points, pointMaterial, glowSprite;
  let width, height;
  let rafId = null;
  let visible = true;
  let disposed = false;

  const pointer = { x: 0, y: 0 };
  const targetRotation = { x: 0, y: 0 };
  const currentRotation = { x: 0, y: 0 };
  const state = { intro: 0, scrollT: 0 };
  let clockStart = performance.now();

  try {
    init();
  } catch (err) {
    // WebGL unavailable or context creation failed — fail silently,
    // the hero still works perfectly with just text + CSS layers.
    canvas.style.display = "none";
    disposed = true;
    return;
  }

  function init() {
    width = window.innerWidth;
    height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    orbGroup = new THREE.Group();
    orbGroup.position.x = orbOffsetX();
    orbGroup.scale.setScalar(0.001); // starts hidden, intro grows it in
    scene.add(orbGroup);

    glowSprite = makeGlowSprite();
    orbGroup.add(glowSprite);

    const count = isSmall ? 3000 : isLowEnd ? 5000 : 8000;
    points = makeOrbPoints(count);
    pointMaterial = points.material;
    orbGroup.add(points);

    bindEvents();
    observeVisibility();

    heroScene.ready = true;

    if (!prefersReducedMotion) {
      start();
    } else {
      state.intro = 1;
      applyFrameState();
    }
  }

  function orbOffsetX() {
    return window.innerWidth < 860 ? 0 : 1.7;
  }

  function makeGlowSprite() {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(245,165,36,0.85)");
    g.addColorStop(0.35, "rgba(245,165,36,0.32)");
    g.addColorStop(0.7, "rgba(94,231,223,0.12)");
    g.addColorStop(1, "rgba(94,231,223,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.9,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(6.5, 6.5, 1);
    return sprite;
  }

  function makeOrbPoints(count) {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r = 1.9 + Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      randoms[i] = Math.random();
      scales[i] = 0.4 + Math.random() * 1.1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 7.5 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uFade: { value: 0 },
        uColorA: { value: new THREE.Color(0xf5a524) },
        uColorB: { value: new THREE.Color(0x5ee7df) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        uniform float uPixelRatio;
        uniform vec2 uMouse;
        attribute float aRandom;
        attribute float aScale;
        varying float vNoise;
        varying float vRandom;

        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        float snoise(vec3 v){
          const vec2 C = vec2(1.0/6.0,1.0/3.0);
          const vec4 D = vec4(0.0,0.5,1.0,2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 1.0/7.0;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main(){
          vec3 pos = position;
          float n = snoise(pos * 0.7 + uTime * 0.18 + aRandom * 12.0);
          vNoise = n;
          vRandom = aRandom;

          vec3 dir = normalize(pos);
          pos += dir * n * 0.45;
          pos.xy += uMouse * 0.5 * (0.3 + aRandom * 0.7);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = uSize * aScale * uPixelRatio * (40.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uFade;
        varying float vNoise;
        varying float vRandom;

        void main(){
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float falloff = smoothstep(0.5, 0.0, d);
          falloff = pow(falloff, 1.7);
          vec3 color = mix(uColorA, uColorB, clamp(vRandom + vNoise * 0.35, 0.0, 1.0));
          float alpha = falloff * (0.5 + 0.5 * abs(vNoise)) * uFade;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    return pts;
  }

  function bindEvents() {
    window.addEventListener("resize", onResize, { passive: true });

    window.addEventListener(
      "pointermove",
      (e) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
        targetRotation.y = pointer.x * 0.5;
        targetRotation.x = pointer.y * 0.3;
      },
      { passive: true }
    );

    if (window.DeviceOrientationEvent) {
      window.addEventListener(
        "deviceorientation",
        (e) => {
          if (e.gamma == null || e.beta == null) return;
          targetRotation.y = THREE.MathUtils.clamp(e.gamma / 45, -1, 1) * 0.5;
          targetRotation.x = THREE.MathUtils.clamp((e.beta - 45) / 45, -1, 1) * 0.3;
        },
        { passive: true }
      );
    }

    window.addEventListener(
      "touchmove",
      (e) => {
        if (!e.touches || !e.touches[0]) return;
        const t = e.touches[0];
        pointer.x = (t.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (t.clientY / window.innerHeight) * 2 - 1;
        targetRotation.y = pointer.x * 0.5;
        targetRotation.x = pointer.y * 0.3;
      },
      { passive: true }
    );
  }

  function observeVisibility() {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          if (visible && !prefersReducedMotion) start();
          else stop();
        });
      },
      { threshold: 0.05 }
    );
    io.observe(hero);
  }

  function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (!renderer || !camera) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    pointMaterial.uniforms.uPixelRatio.value = pr;
    orbGroup.position.x = orbOffsetX();
  }

  heroScene.setScrollProgress = function (t) {
    state.scrollT = Math.min(Math.max(t, 0), 1);
    if (!heroScene.running) applyFrameState();
  };

  heroScene.setIntro = function (t) {
    state.intro = Math.min(Math.max(t, 0), 1);
    if (!heroScene.running) applyFrameState();
  };

  function applyFrameState() {
    if (!orbGroup) return;
    const scrollScale = 1 - state.scrollT * 0.45;
    const scrollFade = 1 - state.scrollT;
    const scrollY = -state.scrollT * 1.3;

    orbGroup.scale.setScalar(state.intro * scrollScale);
    orbGroup.position.y = scrollY;
    pointMaterial.uniforms.uFade.value = state.intro * scrollFade;
    glowSprite.material.opacity = 0.9 * state.intro * scrollFade;

    camera.position.z = 7 + state.scrollT * 1.2;
    camera.lookAt(0, 0, 0);

    if (!heroScene.running) renderer.render(scene, camera);
  }

  function start() {
    if (heroScene.running || disposed) return;
    heroScene.running = true;
    tick();
  }
  function stop() {
    heroScene.running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function tick() {
    if (!heroScene.running) return;
    rafId = requestAnimationFrame(tick);

    const elapsed = (performance.now() - clockStart) / 1000;
    pointMaterial.uniforms.uTime.value = elapsed;

    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.045;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.045;

    orbGroup.rotation.y += 0.0016 + currentRotation.y * 0.012;
    orbGroup.rotation.x += 0.0008 + currentRotation.x * 0.012;

    pointMaterial.uniforms.uMouse.value.set(pointer.x * 0.4, -pointer.y * 0.3);

    applyFrameState();

    renderer.render(scene, camera);
  }
}

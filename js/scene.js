/* Three.js hero scene: rotating wireframe/particle sphere reacting to mouse + tilt. */
(function () {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas || typeof THREE === "undefined") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const heroScene = {
    running: false,
    init,
  };
  window.HeroScene = heroScene;

  const hero = document.getElementById("hero");
  let renderer, scene, camera, sphere, particles;
  let width, height;
  let pointer = { x: 0, y: 0 };
  let targetRotation = { x: 0, y: 0 };
  let currentRotation = { x: 0, y: 0 };
  let scrollT = 0;
  let rafId = null;
  let visible = true;

  function init() {
    width = window.innerWidth;
    height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const amber = new THREE.Color(0xf5a524);
    const cyan = new THREE.Color(0x5ee7df);

    // Wireframe icosahedron
    const geo = new THREE.IcosahedronGeometry(2.1, 3);
    const mat = new THREE.MeshBasicMaterial({
      color: amber,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);

    // Particle field around the sphere
    const particleCount = window.innerWidth < 640 ? 500 : 1100;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 2.4 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: cyan,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
    });
    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    bindEvents();
    observeVisibility();

    if (!prefersReducedMotion) {
      start();
    } else {
      renderer.render(scene, camera);
    }
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
    if (!("IntersectionObserver" in window) || !hero) return;
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  heroScene.setScrollProgress = function (t) {
    scrollT = t;
  };

  function start() {
    if (heroScene.running) return;
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

    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.04;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.04;

    sphere.rotation.x += 0.0016 + currentRotation.x * 0.01;
    sphere.rotation.y += 0.0022 + currentRotation.y * 0.01;
    particles.rotation.y -= 0.0009;
    particles.rotation.x -= 0.0004;

    camera.position.y = -scrollT * 1.4;
    camera.position.z = 6.5 + scrollT * 1.2;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

import React, { useEffect, useRef } from "react";

// Import images and audio
import audioFile from "@/assets/image/christmas/audio.mp3";
import image1 from "@/assets/image/christmas/imageteam3.webp";
import image2 from "@/assets/image/christmas/imageteam4.webp";
import image3 from "@/assets/image/christmas/imageteam5.webp";
import image4 from "@/assets/image/christmas/imageteam6.webp";
import image5 from "@/assets/image/christmas/imageteam7.webp";
import backgroundImage from "@/assets/image/christmas/caythong.jpg";

declare global {
  interface Window {
    THREE: any;
    Camera: any;
    Hands: any;
  }
}

const ChristmasMagic: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const btnStartRef = useRef<HTMLButtonElement>(null);
  const scriptsLoadedRef = useRef(false);
  const initializedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const cameraUtilsRef = useRef<any>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load external scripts
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    };

    const loadScripts = async () => {
      if (scriptsLoadedRef.current) return;

      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
        );
        scriptsLoadedRef.current = true;
      } catch (error) {
        console.error("Error loading scripts:", error);
      }
    };

    loadScripts();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const startSystem = () => {
    if (initializedRef.current) return;
    if (
      !scriptsLoadedRef.current ||
      !window.THREE ||
      !window.Hands ||
      !window.Camera
    ) {
      setTimeout(startSystem, 100);
      return;
    }

    initializedRef.current = true;
    if (btnStartRef.current) {
      btnStartRef.current.style.display = "none";
    }

    const THREE = window.THREE;
    const Hands = window.Hands;
    const Camera = window.Camera;

    // Audio setup
    const bgMusic = new Audio(audioFile);
    bgMusic.loop = true;
    bgMusic.volume = 1.0;
    bgMusicRef.current = bgMusic;
    bgMusic.play().catch((e) => console.log("Audio play error:", e));

    // Texture loader
    const loader = new THREE.TextureLoader();
    const photoFiles = [image1, image2, image3, image4, image5];
    const photoTextures: any[] = [];
    photoFiles.forEach((f, i) => {
      photoTextures[i] = loader.load(f);
    });

    function createCustomTexture(type: string) {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      const cx = 64,
        cy = 64;

      if (type === "gold_glow") {
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
        grd.addColorStop(0, "#FFFFFF");
        grd.addColorStop(0.2, "#FFFFE0");
        grd.addColorStop(0.5, "#FFD700");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 128, 128);
      } else if (type === "red_light") {
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
        grd.addColorStop(0, "#FFAAAA");
        grd.addColorStop(0.3, "#FF0000");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 128, 128);
      } else if (type === "gift_red") {
        ctx.fillStyle = "#D32F2F";
        ctx.fillRect(20, 20, 88, 88);
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(54, 20, 20, 88);
        ctx.fillRect(20, 54, 88, 20);
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, 88, 88);
      }
      return new THREE.CanvasTexture(canvas);
    }

    const textures: any = {
      gold: createCustomTexture("gold_glow"),
      red: createCustomTexture("red_light"),
      gift: createCustomTexture("gift_red"),
    };

    // System config
    const CONFIG = {
      goldCount: 2000,
      redCount: 300,
      giftCount: 150,
      explodeRadius: 65,
      photoOrbitRadius: 25,
      treeHeight: 70,
      treeBaseRadius: 35,
    };

    let scene: any, camera: any, renderer: any;
    let groupGold: any, groupRed: any, groupGift: any;
    let photoMeshes: any[] = [];
    let titleMesh: any, starMesh: any, loveMesh: any;

    let state = "TREE";
    let selectedIndex = 0;
    let handX = 0.5;

    // Three.js system
    function init3D() {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x000000, 0.0005); // Reduced fog density to show background

      camera = new THREE.PerspectiveCamera(
        60,
        containerWidth / containerHeight,
        0.1,
        1000
      );
      camera.position.z = 100;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearColor(0x000000, 0); // Transparent background
      renderer.setSize(containerWidth, containerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      groupGold = createParticleSystem("gold", CONFIG.goldCount, 3.5); // Increased from 2.0
      groupRed = createParticleSystem("red", CONFIG.redCount, 5.0); // Increased from 3.5
      groupGift = createParticleSystem("gift", CONFIG.giftCount, 4.5); // Increased from 3.0

      createPhotos();
      createDecorations();
      animate();
    }

    function createParticleSystem(type: string, count: number, size: number) {
      const pPositions: number[] = [];
      const pExplodeTargets: number[] = [];
      const pTreeTargets: number[] = [];
      const pHeartTargets: number[] = [];
      const sizes: number[] = [];
      const phases: number[] = [];

      for (let i = 0; i < count; i++) {
        // TREE
        const h = Math.random() * CONFIG.treeHeight;
        const y = h - CONFIG.treeHeight / 2;
        let radiusRatio =
          type === "gold"
            ? Math.sqrt(Math.random())
            : 0.9 + Math.random() * 0.1;
        const maxR = (1 - h / CONFIG.treeHeight) * CONFIG.treeBaseRadius;
        const r = maxR * radiusRatio;
        const theta = Math.random() * Math.PI * 2;
        pTreeTargets.push(r * Math.cos(theta), y, r * Math.sin(theta));

        // EXPLODE
        const u = Math.random();
        const v = Math.random();
        const phi = Math.acos(2 * v - 1);
        const lam = 2 * Math.PI * u;
        let radMult = type === "gift" ? 1.2 : 1.0;
        const rad = CONFIG.explodeRadius * Math.cbrt(Math.random()) * radMult;
        pExplodeTargets.push(
          rad * Math.sin(phi) * Math.cos(lam),
          rad * Math.sin(phi) * Math.sin(lam),
          rad * Math.cos(phi)
        );

        // SOFT HEART
        const tHeart = Math.random() * Math.PI * 2;
        let hx = 16 * Math.pow(Math.sin(tHeart), 3);
        let hy =
          13 * Math.cos(tHeart) -
          5 * Math.cos(2 * tHeart) -
          2 * Math.cos(3 * tHeart) -
          Math.cos(4 * tHeart);

        const rFill = Math.pow(Math.random(), 0.3);
        hx *= rFill;
        hy *= rFill;
        let hz = (Math.random() - 0.5) * 8 * rFill;

        const noise = 1.0;
        hx += (Math.random() - 0.5) * noise;
        hy += (Math.random() - 0.5) * noise;
        hz += (Math.random() - 0.5) * noise;

        const scaleH = 2.2;
        pHeartTargets.push(hx * scaleH, hy * scaleH + 5, hz);

        // INIT
        pPositions.push(
          pTreeTargets[i * 3],
          pTreeTargets[i * 3 + 1],
          pTreeTargets[i * 3 + 2]
        );
        sizes.push(size);
        phases.push(Math.random() * Math.PI * 2);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(pPositions, 3)
      );
      geo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

      const colors = new Float32Array(count * 3);
      const baseColor = new THREE.Color();
      if (type === "gold") baseColor.setHex(0xffd700);
      else if (type === "red") baseColor.setHex(0xff0000);
      else baseColor.setHex(0xffffff);

      for (let i = 0; i < count; i++) {
        colors[i * 3] = baseColor.r;
        colors[i * 3 + 1] = baseColor.g;
        colors[i * 3 + 2] = baseColor.b;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      geo.userData = {
        tree: pTreeTargets,
        explode: pExplodeTargets,
        heart: pHeartTargets,
        phases: phases,
        baseColor: baseColor,
        baseSize: size,
      };

      const mat = new THREE.PointsMaterial({
        size: size,
        map: textures[type],
        transparent: true,
        opacity: 1.0,
        vertexColors: true,
        blending:
          type === "gift" ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);
      return points;
    }

    function createPhotos() {
      const geo = new THREE.PlaneGeometry(8, 8);
      const borderGeo = new THREE.PlaneGeometry(9, 9);
      const borderMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

      for (let i = 0; i < 5; i++) {
        const mat = new THREE.MeshBasicMaterial({
          map: photoTextures[i],
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geo, mat);
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.position.z = -0.1;
        mesh.add(border);
        mesh.visible = false;
        mesh.scale.set(0, 0, 0);
        scene.add(mesh);
        photoMeshes.push(mesh);
      }
    }

    function createDecorations() {
      // MERRY CHRISTMAS
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = 'bold italic 90px "Times New Roman"';
        ctx.fillStyle = "#FFD700";
        ctx.textAlign = "center";
        ctx.shadowColor = "#FF0000";
        ctx.shadowBlur = 40;
        ctx.fillText("MERRY CHRISTMAS", 512, 130);
      }
      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      titleMesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 15), mat);
      titleMesh.position.set(0, 50, 0);
      scene.add(titleMesh);

      // STAR
      const starCanvas = document.createElement("canvas");
      starCanvas.width = 128;
      starCanvas.height = 128;
      const sCtx = starCanvas.getContext("2d");
      if (sCtx) {
        sCtx.fillStyle = "#FFFF99"; // Brighter yellow
        sCtx.shadowColor = "#FFFF00"; // Yellow glow
        sCtx.shadowBlur = 40; // Increased from 20 to 40
        sCtx.beginPath();
        const cx = 64,
          cy = 64,
          outer = 50,
          inner = 20;
        for (let i = 0; i < 5; i++) {
          sCtx.lineTo(
            cx + Math.cos(((18 + i * 72) / 180) * Math.PI) * outer,
            cy - Math.sin(((18 + i * 72) / 180) * Math.PI) * outer
          );
          sCtx.lineTo(
            cx + Math.cos(((54 + i * 72) / 180) * Math.PI) * inner,
            cy - Math.sin(((54 + i * 72) / 180) * Math.PI) * inner
          );
        }
        sCtx.closePath();
        sCtx.fill();
      }
      const starTex = new THREE.CanvasTexture(starCanvas);
      const starMat = new THREE.MeshBasicMaterial({
        map: starTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      starMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), starMat); // Increased size from 12x12 to 14x14
      starMesh.position.set(0, CONFIG.treeHeight / 2 + 2, 0);
      scene.add(starMesh);

      // PRODUCER WORKBENCH TEXT
      const loveCanvas = document.createElement("canvas");
      loveCanvas.width = 1600; // Increased width for larger text
      loveCanvas.height = 320; // Increased height
      const lCtx = loveCanvas.getContext("2d");
      if (lCtx) {
        lCtx.font = 'bold 130px "Segoe UI", sans-serif'; // Increased from 100px to 130px
        lCtx.textAlign = "center";

        // Multiple shadows for glow effect
        lCtx.shadowColor = "#8B5CF6"; // Purple shadow
        lCtx.shadowBlur = 60; // Increased from 40 to 60
        lCtx.shadowOffsetX = 0;
        lCtx.shadowOffsetY = 0;

        // Draw text with outline/stroke for better visibility
        lCtx.strokeStyle = "#1E40AF"; // Dark blue outline
        lCtx.lineWidth = 8;
        lCtx.strokeText("Producer Workbench 🚀", 800, 160);

        // Fill text with bright cyan
        lCtx.fillStyle = "#67E8F9"; // Brighter cyan (#22D3EE -> #67E8F9)
        lCtx.fillText("Producer Workbench 🚀", 800, 160);
      }
      const loveTex = new THREE.CanvasTexture(loveCanvas);
      const loveMat = new THREE.MeshBasicMaterial({
        map: loveTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      loveMesh = new THREE.Mesh(new THREE.PlaneGeometry(95, 20), loveMat); // Increased size for larger text
      loveMesh.position.set(0, 0, 20);
      loveMesh.visible = false;
      scene.add(loveMesh);
    }

    function updateParticleGroup(
      group: any,
      type: string,
      targetState: string,
      speed: number,
      handRotY: number,
      time: number
    ) {
      const positions = group.geometry.attributes.position.array;
      const sizes = group.geometry.attributes.size.array;
      const colors = group.geometry.attributes.color.array;
      const phases = group.geometry.userData.phases;
      const baseColor = group.geometry.userData.baseColor;
      const baseSize = group.geometry.userData.baseSize;

      const targetKey =
        targetState === "TREE"
          ? "tree"
          : targetState === "HEART"
          ? "heart"
          : "explode";
      const targets =
        group.geometry.userData[
          targetState === "PHOTO" ? "explode" : targetKey
        ];

      for (let i = 0; i < positions.length; i++) {
        positions[i] += (targets[i] - positions[i]) * speed;
      }
      group.geometry.attributes.position.needsUpdate = true;

      const count = positions.length / 3;

      if (targetState === "TREE") {
        group.rotation.y += 0.003;

        for (let i = 0; i < count; i++) {
          sizes[i] = baseSize;
          let brightness = 1.0;
          if (type === "red") {
            brightness = 0.8 + 0.6 * Math.sin(time * 3 + phases[i]); // Increased from 0.5-1.0 to 0.8-1.4
          } else if (type === "gold") {
            brightness = 1.2 + 0.6 * Math.sin(time * 10 + phases[i]); // Increased from 0.8-1.2 to 1.2-1.8
          }
          colors[i * 3] = baseColor.r * brightness;
          colors[i * 3 + 1] = baseColor.g * brightness;
          colors[i * 3 + 2] = baseColor.b * brightness;
        }
        group.geometry.attributes.color.needsUpdate = true;
        group.geometry.attributes.size.needsUpdate = true;
      } else if (targetState === "HEART") {
        group.rotation.y = 0;
        const beatScale = 1 + Math.abs(Math.sin(time * 3)) * 0.15;
        group.scale.set(beatScale, beatScale, beatScale);

        for (let i = 0; i < count; i++) {
          colors[i * 3] = baseColor.r;
          colors[i * 3 + 1] = baseColor.g;
          colors[i * 3 + 2] = baseColor.b;
          if (i % 3 === 0) sizes[i] = baseSize;
          else sizes[i] = 0;
        }
        group.geometry.attributes.color.needsUpdate = true;
        group.geometry.attributes.size.needsUpdate = true;
      } else {
        group.scale.set(1, 1, 1);
        group.rotation.y += (handRotY - group.rotation.y) * 0.1;

        for (let i = 0; i < count; i++) {
          sizes[i] = baseSize;
          let brightness = 1.0;
          if (type === "gold" || type === "red") {
            brightness = 0.8 + 0.5 * Math.sin(time * 12 + phases[i]);
          }
          colors[i * 3] = baseColor.r * brightness;
          colors[i * 3 + 1] = baseColor.g * brightness;
          colors[i * 3 + 2] = baseColor.b * brightness;
        }
        group.geometry.attributes.size.needsUpdate = true;
        group.geometry.attributes.color.needsUpdate = true;
      }
    }

    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const speed = 0.08;
      const handRotY = (handX - 0.5) * 4.0;

      updateParticleGroup(groupGold, "gold", state, speed, handRotY, time);
      updateParticleGroup(groupRed, "red", state, speed, handRotY, time);
      updateParticleGroup(groupGift, "gift", state, speed, handRotY, time);

      photoMeshes.forEach((mesh, i) => {
        if (!mesh.material.map && photoTextures[i]) {
          mesh.material.map = photoTextures[i];
          mesh.material.needsUpdate = true;
        }
      });

      if (state === "TREE") {
        titleMesh.visible = true;
        starMesh.visible = true;
        loveMesh.visible = false;
        titleMesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        starMesh.rotation.z -= 0.02;
        starMesh.material.opacity = 0.9 + 0.1 * Math.sin(time * 5); // Increased from 0.7-1.0 to 0.9-1.0
        photoMeshes.forEach((m) => {
          m.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
          m.visible = false;
        });
      } else if (state === "HEART") {
        titleMesh.visible = false;
        starMesh.visible = false;
        loveMesh.visible = true;
        photoMeshes.forEach((m) => {
          m.visible = false;
        });
        const s = 1 + Math.abs(Math.sin(time * 3)) * 0.1;
        loveMesh.scale.set(s, s, 1);
      } else if (state === "EXPLODE") {
        titleMesh.visible = false;
        starMesh.visible = false;
        loveMesh.visible = false;
        const baseAngle = groupGold.rotation.y;
        const angleStep = (Math.PI * 2) / 5;
        let bestIdx = 0;
        let maxZ = -999;
        photoMeshes.forEach((mesh, i) => {
          mesh.visible = true;
          const angle = baseAngle + i * angleStep;
          const x = Math.sin(angle) * CONFIG.photoOrbitRadius;
          const z = Math.cos(angle) * CONFIG.photoOrbitRadius;
          const y = Math.sin(time + i) * 3;
          mesh.position.lerp(new THREE.Vector3(x, y, z), 0.1);
          mesh.lookAt(camera.position);
          if (z > maxZ) {
            maxZ = z;
            bestIdx = i;
          }
          if (z > 5) {
            const ds = 1.0 + (z / CONFIG.photoOrbitRadius) * 0.8;
            mesh.scale.lerp(new THREE.Vector3(ds, ds, ds), 0.1);
          } else {
            mesh.scale.lerp(new THREE.Vector3(0.6, 0.6, 0.6), 0.1);
          }
        });
        selectedIndex = bestIdx;
      } else if (state === "PHOTO") {
        loveMesh.visible = false;
        photoMeshes.forEach((mesh, i) => {
          if (i === selectedIndex) {
            mesh.position.lerp(new THREE.Vector3(0, 0, 60), 0.1);
            mesh.scale.lerp(new THREE.Vector3(5, 5, 5), 0.1);
            mesh.lookAt(camera.position);
            mesh.rotation.z = 0;
          } else {
            mesh.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
          }
        });
      }
      renderer.render(scene, camera);
    }

    init3D();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const hands = new Hands({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: any) => {
      ctx.clearRect(0, 0, 100, 75);
      ctx.drawImage(results.image, 0, 0, 100, 75);

      if (results.multiHandLandmarks.length === 2) {
        const h1 = results.multiHandLandmarks[0];
        const h2 = results.multiHandLandmarks[1];
        const distIndex = Math.hypot(h1[8].x - h2[8].x, h1[8].y - h2[8].y);
        const distThumb = Math.hypot(h1[4].x - h2[4].x, h1[4].y - h2[4].y);
        if (distIndex < 0.15 && distThumb < 0.15) {
          state = "HEART";
          return;
        }
      }

      if (results.multiHandLandmarks.length > 0) {
        const lm = results.multiHandLandmarks[0];
        handX = lm[9].x;
        const tips = [8, 12, 16, 20];
        const wrist = lm[0];
        let openDist = 0;
        tips.forEach(
          (i) => (openDist += Math.hypot(lm[i].x - wrist.x, lm[i].y - wrist.y))
        );
        const avgDist = openDist / 4;
        const pinchDist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);

        if (avgDist < 0.25) {
          state = "TREE";
        } else if (pinchDist < 0.05) {
          state = "PHOTO";
        } else {
          state = "EXPLODE";
        }
      } else {
        state = "TREE";
      }
    });

    const cameraUtils = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 320,
      height: 240,
    });
    cameraUtils.start();
    cameraUtilsRef.current = cameraUtils;

    const handleResize = () => {
      if (camera && renderer && containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        camera.aspect = containerWidth / containerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerWidth, containerHeight);
      }
    };

    window.addEventListener("resize", handleResize);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Stop animation
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Stop camera
      if (cameraUtilsRef.current) {
        try {
          cameraUtilsRef.current.stop();
        } catch (e) {
          console.log("Error stopping camera:", e);
        }
      }
      // Stop audio
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <style>{`
        .guide {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px black;
        }
        #btnStart {
          pointer-events: auto;
          cursor: pointer;
          background: linear-gradient(to bottom, #D32F2F, #8B0000);
          color: #FFF;
          border: 2px solid #FFD700;
          padding: 15px 50px;
          border-radius: 30px;
          font-weight: 800;
          font-size: 16px;
          box-shadow: 0 0 30px rgba(255, 0, 0, 0.6);
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        #camera-preview {
          display: none;
        }
        #copyright {
          position: absolute;
          bottom: 10px;
          right: 15px;
          color: rgba(255, 255, 255, 0.3);
          font-size: 12px;
          z-index: 100;
          font-family: sans-serif;
          pointer-events: none;
          font-style: italic;
        }
      `}</style>

      <div
        id="ui-layer"
        className="absolute bottom-8 w-full text-center pointer-events-none z-[100]"
      >
        <div className="guide">
          🖐 <b>Open:</b> Explode &nbsp;|&nbsp; 🫶 <b>Heart:</b> Love
          &nbsp;|&nbsp; ✊ <b>Fist:</b> Tree
        </div>
        <button
          id="btnStart"
          ref={btnStartRef}
          onClick={startSystem}
          className="pointer-events-auto"
        >
          START MAGIC
        </button>
      </div>

      <div id="copyright">© by vandiep</div>

      <div ref={containerRef} id="canvas-container" className="w-full h-full" />
      <video ref={videoRef} className="input_video hidden" />
      <canvas ref={canvasRef} id="camera-preview" />
    </div>
  );
};

export default ChristmasMagic;

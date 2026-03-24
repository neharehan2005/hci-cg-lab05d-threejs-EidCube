import * as THREE from "three";
import { useEffect, useRef, useState } from "react";

const base = import.meta.env.BASE_URL;

function PremiumEidCubeAllInOne() {
  const mountRef = useRef(null);
  const [openTriggered, setOpenTriggered] = useState(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f1a); 
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    const loader = new THREE.TextureLoader();

   
    const textures = [
      loader.load(`${base}textures/front.jpg`),
      loader.load(`${base}textures/back.jpg`),
      loader.load(`${base}textures/right.jpg`),
      loader.load(`${base}textures/left.jpg`),
      loader.load(`${base}textures/top.jpg`),
      loader.load(`${base}textures/bottom.jpg`),
    ];

    const size = 3;
    const faces = [];

    const createFace = (pos, rot, material) => {
      const geo = new THREE.PlaneGeometry(size, size);
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(...pos);
      mesh.rotation.set(...rot);
      cubeGroup.add(mesh);
      faces.push(mesh);
    };

    const materials = textures.map((tex) =>
  new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.DoubleSide,
  })
);

    createFace([0, 0, size / 2], [0, 0, 0], materials[0]);       // front
    createFace([0, 0, -size / 2], [0, Math.PI, 0], materials[1]); // back
    createFace([size / 2, 0, 0], [0, -Math.PI / 2, 0], materials[2]); // right
    createFace([-size / 2, 0, 0], [0, Math.PI / 2, 0], materials[3]); // left
    createFace([0, size / 2, 0], [-Math.PI / 2, 0, 0], materials[4]); // top
    createFace([0, -size / 2, 0], [Math.PI / 2, 0, 0], materials[5]); // bottom

    // Eid Text
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "gold";
    ctx.fillText("Eid Mubarak", 256, 130);

    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      side: THREE.DoubleSide,
      opacity: 1,
    });

    const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), textMaterial);
    textMesh.position.z = 0;
    textMesh.visible = false;
    scene.add(textMesh);

    // Sparkling stars around text
    const starGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 8;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffaa, size: 0.05 })
    );
    scene.add(stars);

    // Animation
    let time = 0;
    const openDistance = 3.2;
    const targets = [
      { x: 0, y: 0, z: size / 2 + openDistance },
      { x: 0, y: 0, z: -size / 2 - openDistance },
      { x: size / 2 + openDistance, y: 0, z: 0 },
      { x: -size / 2 - openDistance, y: 0, z: 0 },
      { x: 0, y: size / 2 + openDistance, z: 0 },
      { x: 0, y: -size / 2 - openDistance, z: 0 },
    ];

    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      if (time < 2 && !openTriggered) {
        cubeGroup.rotation.x += 0.01;
        cubeGroup.rotation.y += 0.01;
      } else {
        faces.forEach((f, i) => {
          f.position.x += (targets[i].x - f.position.x) * 0.08;
          f.position.y += (targets[i].y - f.position.y) * 0.08;
          f.position.z += (targets[i].z - f.position.z) * 0.08;
        });

        textMesh.visible = true;
        const glow = Math.sin(time * 5) * 0.3 + 0.7;
        textMaterial.opacity = glow;

        stars.rotation.y += 0.002;

        // subtle camera zoom
        camera.position.z = 8 - Math.sin(time * 2) * 0.2;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleClick = () => setOpenTriggered(true);
    window.addEventListener("click", handleClick);

    return () => {
      renderer.dispose();
      window.removeEventListener("click", handleClick);
      if (mountRef.current && renderer.domElement)
        mountRef.current.removeChild(renderer.domElement);
    };
  }, [openTriggered]);

  return <div ref={mountRef}></div>;
}

export default PremiumEidCubeAllInOne;

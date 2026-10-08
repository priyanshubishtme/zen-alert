import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SensorNode3D {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.camera.position.set(10, 8, 15);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = options.autoRotate || false;

    this.components = {};
    this.isExploded = false;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.onComponentClick = options.onClick || null;

    this.initLighting();
    this.buildProceduralModel();
    this.bindEvents();

    this.animate();
  }

  initLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    this.scene.add(dirLight);
    
    const backLight = new THREE.DirectionalLight(0x5eeac6, 0.3); // Accent color light
    backLight.position.set(-10, -10, -10);
    this.scene.add(backLight);
  }

  createPart(name, geometry, material, position, explodedOffset) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.userData = { 
      name, 
      originalPos: new THREE.Vector3(...position), 
      explodedPos: new THREE.Vector3(...position).add(new THREE.Vector3(...explodedOffset))
    };
    this.scene.add(mesh);
    this.components[name] = mesh;
    return mesh;
  }

  buildProceduralModel() {
    const materials = {
      enclosure: new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.8, metalness: 0.2 }),
      solar: new THREE.MeshStandardMaterial({ color: 0x112233, roughness: 0.3, metalness: 0.8 }),
      pcb: new THREE.MeshStandardMaterial({ color: 0x005500, roughness: 0.9 }),
      lens: new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1, metalness: 0.9 }),
      metal: new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.8 }),
      sensor: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 }),
      battery: new THREE.MeshStandardMaterial({ color: 0x1e88e5, roughness: 0.5 })
    };

    // Main Enclosure
    this.createPart('Enclosure', new THREE.BoxGeometry(4, 5, 3), materials.enclosure, [0, 0, 0], [0, 0, 3]);

    // Solar Panel (on top, angled)
    const solarPanel = this.createPart('Solar Panel', new THREE.BoxGeometry(5, 0.2, 4), materials.solar, [0, 3, 0], [0, 4, 0]);
    solarPanel.rotation.x = Math.PI / 8;

    // Camera (front)
    const camBody = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.5), materials.pcb);
    const camLens = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16), materials.lens);
    camLens.rotation.x = Math.PI / 2;
    camLens.position.set(0, 0, 0.4);
    camBody.add(camLens);
    this.createPart('IMX219 Camera', camBody.geometry, materials.pcb, [0, 1.5, 1.6], [0, 1.5, 4]);
    this.components['IMX219 Camera'].add(camLens);

    // Antenna (side)
    this.createPart('LoRa Antenna', new THREE.CylinderGeometry(0.1, 0.1, 3), materials.lens, [2.2, 1, 0], [4, 1, 0]);

    // Sensors (bottom)
    this.createPart('MQ135 Gas Sensor', new THREE.CylinderGeometry(0.4, 0.4, 0.8), materials.metal, [-1, -2.8, 0.5], [-3, -4, 2]);
    this.createPart('MQ2 Smoke Sensor', new THREE.CylinderGeometry(0.4, 0.4, 0.8), materials.metal, [1, -2.8, 0.5], [3, -4, 2]);
    this.createPart('DHT11 Temp/Hum', new THREE.BoxGeometry(0.6, 1, 0.4), materials.battery, [0, -2.8, -0.5], [0, -4, -2]);
    this.createPart('GP2Y1010 PM2.5', new THREE.BoxGeometry(1.2, 1.2, 0.8), materials.sensor, [0, -2.8, 0.5], [0, -5, 4]);
    
    // Internal Electronics (ESP32, Battery)
    this.createPart('ESP32-S3', new THREE.BoxGeometry(1.5, 2.5, 0.2), materials.pcb, [0, 0, -1.2], [0, 0, -4]);
    this.createPart('Battery 18650', new THREE.CylinderGeometry(0.4, 0.4, 2.5), materials.battery, [-1, 0, -1], [-4, 0, -4]);
  }

  toggleExploded() {
    this.isExploded = !this.isExploded;
  }

  highlightComponent(name) {
    Object.values(this.components).forEach(mesh => {
      mesh.material.emissive?.setHex(0x000000);
    });
    if (name && this.components[name]) {
      if (this.components[name].material.emissive) {
         this.components[name].material.emissive.setHex(0x225544);
      }
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      if(!this.container) return;
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });

    if (this.onComponentClick) {
      this.renderer.domElement.addEventListener('click', (e) => {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(Object.values(this.components));

        if (intersects.length > 0) {
          let object = intersects[0].object;
          // Traverse up to find the root part if clicked a sub-mesh (like the lens)
          while(!object.userData.name && object.parent && object.parent !== this.scene) {
            object = object.parent;
          }
          if (object.userData.name) {
            this.highlightComponent(object.userData.name);
            this.onComponentClick(object.userData.name);
          }
        }
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();

    // Lerp positions for exploded view
    const targetLerp = 0.1;
    Object.values(this.components).forEach(mesh => {
      const targetPos = this.isExploded ? mesh.userData.explodedPos : mesh.userData.originalPos;
      mesh.position.lerp(targetPos, targetLerp);
    });

    this.renderer.render(this.scene, this.camera);
  }
}

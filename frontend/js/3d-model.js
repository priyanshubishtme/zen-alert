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
      enclosureBase: new THREE.MeshPhysicalMaterial({ 
        color: 0xffffff, 
        metalness: 0.1, 
        roughness: 0.2, 
        transmission: 0.9, // glass-like transparency
        transparent: true,
        opacity: 0.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      }),
      enclosureDark: new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.5, metalness: 0.8 }),
      solarBase: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.3 }),
      solarCell: new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.1, metalness: 0.9, clearcoat: 1.0 }),
      pcb: new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.7, metalness: 0.2 }),
      pcbGold: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 1.0 }),
      lensGlass: new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0.9, roughness: 0.1, clearcoat: 1.0 }),
      metal: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 1.0 }),
      sensorMesh: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6, metalness: 0.8, wireframe: true }),
      battery: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.5 }),
      antenna: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 }),
      ledGreen: new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 2.0 }),
      ledRed: new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.0 })
    };

    // 1. Enclosure (Transparent Acrylic Case)
    const enclosureBody = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.2, 3.2), materials.enclosureBase);
    const enclosureLid = new THREE.Mesh(new THREE.BoxGeometry(4.4, 5.4, 0.2), materials.enclosureDark);
    enclosureLid.position.set(0, 0, 1.6);
    enclosureBody.add(enclosureLid);
    this.createPart('Rugged Enclosure (IP67)', enclosureBody.geometry, materials.enclosureBase, [0, 0, 0], [0, 0, 4]);
    this.components['Rugged Enclosure (IP67)'].add(enclosureLid);

    // 2. Solar Panel (Detailed Grid)
    const solarGroup = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 4.2), materials.solarBase);
    // Add cells
    for(let i=0; i<4; i++) {
      for(let j=0; j<3; j++) {
        const cell = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 1.2), materials.solarCell);
        cell.position.set(-1.8 + i*1.2, 0.12, -1.2 + j*1.2);
        solarGroup.add(cell);
      }
    }
    this.createPart('10W Solar Panel', solarGroup.geometry, materials.solarBase, [0, 3.5, 0], [0, 6, 0]);
    solarGroup.children.forEach(c => this.components['10W Solar Panel'].add(c.clone()));
    this.components['10W Solar Panel'].rotation.x = Math.PI / 6;

    // 3. Camera Module (Detailed Lens)
    const camBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.4), materials.pcb);
    const camMount = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), materials.metal);
    camMount.rotation.x = Math.PI / 2;
    camMount.position.set(0, 0, 0.3);
    const camLens = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.35, 16), materials.lensGlass);
    camLens.rotation.x = Math.PI / 2;
    camLens.position.set(0, 0, 0.35);
    camBase.add(camMount);
    camBase.add(camLens);
    this.createPart('IMX219 AI Camera', camBase.geometry, materials.pcb, [0, 1.5, 1.8], [0, 1.5, 6]);
    this.components['IMX219 AI Camera'].add(camMount);
    this.components['IMX219 AI Camera'].add(camLens);

    // 4. LoRa Antenna (Tapered)
    const antBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16), materials.metal);
    const antMast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.15, 3.5, 16), materials.antenna);
    antMast.position.set(0, 2, 0);
    antBase.add(antMast);
    this.createPart('LoRa Mesh Antenna', antBase.geometry, materials.metal, [2.3, 1.5, 0], [5, 2, 0]);
    this.components['LoRa Mesh Antenna'].add(antMast);

    // 5. Sensors (Detailed Gas/Air Quality)
    // MQ135 (Air Quality)
    const mq135Base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 16), materials.pcb);
    const mq135Mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 16), materials.sensorMesh);
    mq135Mesh.position.set(0, -0.5, 0);
    mq135Base.add(mq135Mesh);
    this.createPart('MQ135 Air Quality Sensor', mq135Base.geometry, materials.pcb, [-1.2, -2.8, 0.8], [-3.5, -5, 3]);
    this.components['MQ135 Air Quality Sensor'].add(mq135Mesh);

    // MQ2 (Gas/Smoke)
    const mq2Base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 16), materials.pcb);
    const mq2Mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 16), materials.sensorMesh);
    mq2Mesh.position.set(0, -0.5, 0);
    mq2Base.add(mq2Mesh);
    this.createPart('MQ2 Gas/Smoke Sensor', mq2Base.geometry, materials.pcb, [1.2, -2.8, 0.8], [3.5, -5, 3]);
    this.components['MQ2 Gas/Smoke Sensor'].add(mq2Mesh);

    // DHT11 & GP2Y1010
    this.createPart('DHT11 Temp/Humidity', new THREE.BoxGeometry(0.8, 1.2, 0.5), materials.battery, [0, -2.9, -0.8], [0, -5, -3]);
    this.createPart('GP2Y1010 PM2.5 Optical', new THREE.BoxGeometry(1.4, 1.6, 0.8), materials.enclosureDark, [0, -2.8, 0.8], [0, -6, 5]);

    // 6. Internal Electronics
    // ESP32-S3 Board
    const espBoard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.8, 0.1), materials.pcb);
    const espChip = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.15), materials.enclosureDark);
    espChip.position.set(0, 0.5, 0.1);
    const espAnt = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.05), materials.pcbGold);
    espAnt.position.set(0, 1.2, 0.1);
    const espLed = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), materials.ledGreen);
    espLed.position.set(-0.6, -1, 0.1);
    espBoard.add(espChip);
    espBoard.add(espAnt);
    espBoard.add(espLed);
    this.createPart('ESP32-S3 Edge Controller', espBoard.geometry, materials.pcb, [0, 0, -1.2], [0, 0, -5]);
    this.components['ESP32-S3 Edge Controller'].add(espChip);
    this.components['ESP32-S3 Edge Controller'].add(espAnt);
    this.components['ESP32-S3 Edge Controller'].add(espLed);

    // Battery Pack (2x 18650)
    const battPack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 0.8), materials.battery);
    this.createPart('Dual 18650 Battery Pack', battPack.geometry, materials.battery, [-1.2, 0, -1], [-4, 0, -5]);

    // GPS & Power Mgmt
    const gpsBoard = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 0.1), materials.pcb);
    const gpsAnt = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.2), materials.pcbGold);
    gpsAnt.position.set(0, 0, 0.1);
    const gpsLed = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), materials.ledRed);
    gpsLed.position.set(-0.3, -0.3, 0.1);
    gpsBoard.add(gpsAnt);
    gpsBoard.add(gpsLed);
    this.createPart('NEO-6M GPS Module', gpsBoard.geometry, materials.pcb, [1.2, 1.2, -1.2], [4, 2, -5]);
    this.components['NEO-6M GPS Module'].add(gpsAnt);
    this.components['NEO-6M GPS Module'].add(gpsLed);

    this.createPart('MPPT Solar Charge Controller', new THREE.BoxGeometry(1.4, 1.8, 0.4), materials.pcb, [0, -1.8, -1.2], [0, -3.5, -6]);
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

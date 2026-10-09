import * as THREE from 'three';
import { SensorNode3D } from './3d-model.js';

// Setup 3D Scene
const sim3d = new SensorNode3D('sim3d', { autoRotate: true });
sim3d.camera.position.set(12, 10, 18);
sim3d.controls.autoRotateSpeed = 1.0;

// To make the background look like a forest, we'll add some low-poly trees to the scene
function addForestEnvironment(scene) {
  const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x1f4d36, roughness: 1.0 });
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3b2c, roughness: 1.0 });
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x223a2c, roughness: 1.0 });

  // Ground plane
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 0.5, 32), groundMaterial);
  ground.position.y = -6.2;
  scene.add(ground);

  // Simple Trees
  const treePositions = [
    [8, -6, 5], [-7, -6, 8], [-10, -6, -2], [6, -6, -8],
    [12, -6, -4], [-4, -6, -10], [10, -6, 10], [-12, -6, 5],
    [2, -6, 12], [-2, -6, -12], [14, -6, 2], [-8, -6, -7]
  ];

  treePositions.forEach(pos => {
    const scale = 0.5 + Math.random() * 0.8;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 2, 8), trunkMaterial);
    trunk.position.set(pos[0], pos[1] + 1, pos[2]);
    trunk.scale.set(scale, scale, scale);
    
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(2, 4, 8), treeMaterial);
    leaves.position.set(0, 2.5, 0);
    trunk.add(leaves);
    
    scene.add(trunk);
  });
}
addForestEnvironment(sim3d.scene);

// Lighting overrides for simulation states
const normalAmbient = 0xffffff;
const normalIntensity = 0.6;
const critAmbient = 0xff3333;
const critIntensity = 1.0;

let alarmLight;

function initAlarmLight() {
  alarmLight = new THREE.PointLight(0xff0000, 0, 20);
  alarmLight.position.set(0, 2, 0);
  sim3d.scene.add(alarmLight);
}
initAlarmLight();

// UI Elements
const els = {
  btnNormal: document.getElementById('btnNormal'),
  btnFireTest: document.getElementById('btnFireTest'),
  btnClear: document.getElementById('btnClear'),
  
  statusBadge: document.getElementById('statusBadge'),
  
  oledTitle: document.getElementById('oledTitle'),
  oledTemp: document.getElementById('oledTemp'),
  oledHum: document.getElementById('oledHum'),
  oledPm: document.getElementById('oledPm'),
  oledGas: document.getElementById('oledGas'),
  oledAi: document.getElementById('oledAi'),
  oledScreen: document.getElementById('oledScreen'),
  
  valTemp: document.getElementById('valTemp'),
  fillTemp: document.getElementById('fillTemp'),
  valMq2: document.getElementById('valMq2'),
  fillMq2: document.getElementById('fillMq2'),
  valPm25: document.getElementById('valPm25'),
  fillPm25: document.getElementById('fillPm25'),
  
  cameraPanel: document.getElementById('cameraPanel'),
  
  nodes: {
    sensors: document.getElementById('pipe-sensors'),
    esp32: document.getElementById('pipe-esp32'),
    camera: document.getElementById('pipe-camera'),
    fusion: document.getElementById('pipe-fusion'),
    alarm: document.getElementById('pipe-alarm'),
    lora: document.getElementById('pipe-lora'),
    gateway: document.getElementById('pipe-gateway'),
    dashboard: document.getElementById('pipe-dashboard')
  }
};

let simulationTimeline;
let alarmInterval;

function resetUI() {
  if (simulationTimeline) simulationTimeline.kill();
  if (alarmInterval) clearInterval(alarmInterval);
  alarmLight.intensity = 0;
  
  // Reset buttons
  els.btnNormal.classList.add('active');
  els.btnNormal.classList.remove('danger');
  els.btnFireTest.classList.remove('active');
  els.btnClear.classList.remove('active');
  
  // Reset OLED
  els.oledTitle.textContent = "🟢 SAFE";
  els.oledTemp.textContent = "24.8°C";
  els.oledHum.textContent = "61%";
  els.oledPm.textContent = "38";
  els.oledGas.textContent = "LOW";
  els.oledAi.textContent = "--";
  els.oledScreen.className = 'oled-display';
  
  // Reset Bars
  gsap.to(els.fillTemp, { width: "25%", background: "var(--accent)", duration: 0.5 });
  els.valTemp.textContent = "24.8°C";
  gsap.to(els.fillMq2, { width: "15%", background: "var(--accent)", duration: 0.5 });
  els.valMq2.textContent = "120";
  gsap.to(els.fillPm25, { width: "15%", background: "var(--accent)", duration: 0.5 });
  els.valPm25.textContent = "38 µg/m³";
  
  // Reset Status Badge
  els.statusBadge.className = 'px-3 py-1 rounded-full bg-severity-normal-bg text-severity-normal border border-severity-normal-border text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.2)] flex items-center gap-2';
  els.statusBadge.innerHTML = '<div class="w-2 h-2 rounded-full bg-severity-normal animate-pulse"></div> SAFE';
  
  // Reset Pipeline
  Object.values(els.nodes).forEach(n => n.className = 'pipe-node');
  els.nodes.sensors.classList.add('active');
  els.nodes.esp32.classList.add('active');
  
  // Hide Camera
  els.cameraPanel.classList.add('hidden');
}

function runFireTest() {
  resetUI();
  
  // Update buttons
  els.btnNormal.classList.remove('active');
  els.btnFireTest.classList.add('active');

  // Set the visible state immediately so the control never appears
  // unresponsive while the staged animations are starting.
  els.statusBadge.className = 'px-3 py-1 rounded-full bg-severity-high-bg text-severity-high border border-severity-high-border text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.2)] flex items-center gap-2';
  els.statusBadge.innerHTML = '<div class="w-2 h-2 rounded-full bg-severity-high animate-pulse"></div> ANOMALY';
  els.oledTitle.textContent = "⚠ WARNING";
  els.oledScreen.className = 'oled-display warn';
  els.nodes.sensors.className = 'pipe-node warn';
  els.nodes.esp32.className = 'pipe-node warn';

  simulationTimeline = gsap.timeline();
  
  // STAGE 1: SENSORS REACT (Warning State)
  simulationTimeline.add(() => {
    // Animate bars
    gsap.to(els.fillTemp, { width: "65%", background: "var(--severity-high)", duration: 2, ease: "power1.inOut", onUpdate: function() { els.valTemp.textContent = (24.8 + this.progress() * (47.8 - 24.8)).toFixed(1) + "°C"; els.oledTemp.textContent = els.valTemp.textContent; } });
    gsap.to(els.fillMq2, { width: "85%", background: "var(--severity-critical)", duration: 2.5, ease: "power1.inOut", onUpdate: function() { els.valMq2.textContent = Math.floor(120 + this.progress() * (850 - 120)); els.oledGas.textContent = (this.progress() > 0.5) ? "HIGH" : "RISING"; } });
    gsap.to(els.fillPm25, { width: "70%", background: "var(--severity-high)", duration: 3, ease: "power1.inOut", onUpdate: function() { els.valPm25.textContent = Math.floor(38 + this.progress() * (214 - 38)) + " µg/m³"; els.oledPm.textContent = Math.floor(38 + this.progress() * (214 - 38)); } });
    
    // Status update
    els.statusBadge.className = 'px-3 py-1 rounded-full bg-severity-high-bg text-severity-high border border-severity-high-border text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.2)] flex items-center gap-2';
    els.statusBadge.innerHTML = '<div class="w-2 h-2 rounded-full bg-severity-high animate-pulse"></div> ANOMALY';
    
    els.oledTitle.textContent = "⚠ WARNING";
    els.oledScreen.className = 'oled-display warn';
    
    els.nodes.sensors.className = 'pipe-node warn';
    els.nodes.esp32.className = 'pipe-node warn';
  });
  
  // STAGE 2: CAMERA VERIFICATION (After sensors cross threshold)
  simulationTimeline.add(() => {
    els.nodes.camera.className = 'pipe-node warn';
    els.cameraPanel.classList.remove('hidden');
    els.oledAi.textContent = "SCANNING";
  }, "+=2.5");
  
  // STAGE 3: FUSION & ALARM (Confirmed Incident)
  simulationTimeline.add(() => {
    els.oledAi.textContent = "91% FIRE";
    els.oledTitle.textContent = "🔴 FIRE ALERT";
    els.oledScreen.className = 'oled-display crit';
    
    els.statusBadge.className = 'px-3 py-1 rounded-full bg-severity-critical-bg text-severity-critical border border-severity-critical-border text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-2';
    els.statusBadge.innerHTML = '<div class="w-2 h-2 rounded-full bg-severity-critical animate-pulse"></div> CRITICAL';
    
    els.nodes.fusion.className = 'pipe-node crit';
    
    // Trigger alarm light in 3D scene
    alarmInterval = setInterval(() => {
      alarmLight.intensity = alarmLight.intensity === 0 ? 5 : 0;
    }, 500);
    
  }, "+=1.5");
  
  // STAGE 4: TRANSMISSION
  simulationTimeline.add(() => {
    els.nodes.alarm.className = 'pipe-node crit';
    els.nodes.lora.className = 'pipe-node crit';
    
    // Ripple effect on LoRa
    gsap.to(els.nodes.lora, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 3 });
    
  }, "+=0.5");
  
  // STAGE 5: DASHBOARD ALERT
  simulationTimeline.add(() => {
    els.nodes.gateway.className = 'pipe-node crit';
    els.nodes.dashboard.className = 'pipe-node crit';
    gsap.to(els.nodes.dashboard, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
  }, "+=1.0");
}

// Event Listeners
els.btnNormal.addEventListener('click', resetUI);
els.btnFireTest.addEventListener('click', runFireTest);
els.btnClear.addEventListener('click', resetUI);

// Init state
resetUI();

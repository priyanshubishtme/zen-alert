const state = {
  page: "map",
  online: true,
  lang: "en",
  theme: "dark",
  incidents: [
    {id:1,severity:"critical",type:"Forest Fire / Smoke",node:"N-BHW-007",location:"Bhowali Forest Edge",confidence:.91,time:"12:14:07",status:"OPEN",lat:29.3947,lon:79.5059},
    {id:2,severity:"high",type:"PM2.5 Spike",node:"N-BHW-011",location:"Sattal Corridor",confidence:.78,time:"12:11:28",status:"OPEN",lat:29.355,lon:79.523},
    {id:3,severity:"watch",type:"Gas / Air Quality",node:"N-BHW-004",location:"Roadside Cluster",confidence:.54,time:"12:06:41",status:"OPEN",lat:29.418,lon:79.476},
  ],
  nodes: [
    {id:"N-BHW-001",x:130,y:164,s:"green"},{id:"N-BHW-002",x:225,y:118,s:"green"},
    {id:"N-BHW-003",x:310,y:205,s:"yellow"},{id:"N-BHW-004",x:389,y:144,s:"watch"},
    {id:"N-BHW-005",x:470,y:194,s:"green"},{id:"N-BHW-006",x:544,y:132,s:"green"},
    {id:"N-BHW-007",x:652,y:214,s:"red"},{id:"N-BHW-008",x:757,y:173,s:"orange"},
    {id:"N-BHW-009",x:821,y:258,s:"green"},{id:"N-BHW-010",x:731,y:338,s:"green"},
    {id:"N-BHW-011",x:610,y:386,s:"orange"},{id:"N-BHW-012",x:482,y:360,s:"green"},
    {id:"N-BHW-013",x:351,y:405,s:"green"},{id:"N-BHW-014",x:245,y:341,s:"green"},
    {id:"N-BHW-015",x:121,y:398,s:"gray"},{id:"N-BHW-016",x:851,y:413,s:"green"}
  ],
  sensorHistory: [82,78,74,76,83,88,91,98,109,116,121,128,133,138,132,127,130,138,143,146,138,136,139,138],
  tick: 0
};

const I18N = {
  en: {live_map:"Live Map",incidents:"Incident Center",sensors:"Sensors & Air",devices:"Device Health",alerts:"Alerts",analytics:"Analytics",admin:"Admin",public_alert:"Public Alert View"},
  hi: {live_map:"लाइव मैप",incidents:"घटना केंद्र",sensors:"सेंसर और एयर",devices:"डिवाइस हेल्थ",alerts:"अलर्ट",analytics:"एनालिटिक्स",admin:"एडमिन",public_alert:"पब्लिक अलर्ट व्यू"}
};

const titles = {
  map:"Live Environmental Map", incidents:"Incident Center", sensors:"Sensors & Air Quality",
  devices:"Device Health", alerts:"Alert Operations", analytics:"Analytics & Reports", admin:"Administration", public:"Public Alert View"
};

const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];

function esc(v){return String(v).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

function toast(title, message, kind="info"){
  const host=$("#toastStack");
  const t=document.createElement("div");
  t.className="toast";
  const dot = kind==="critical" ? "🔴" : kind==="warn" ? "🟠" : "🟢";
  t.innerHTML=`<div>${dot}</div><div><strong>${esc(title)}</strong><span>${esc(message)}</span></div>`;
  host.appendChild(t); setTimeout(()=>t.remove(),4200);
}

function setPage(page){
  state.page=page;
  $$(".page").forEach(p=>p.classList.remove("active"));
  const el=$("#page-"+page); if(el) el.classList.add("active");
  $$(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===page));
  $("#pageTitle").textContent=titles[page]||"Dashboard";
  renderSubpage(page);
  $("#sidebar").classList.remove("open");
}

function setOnline(online){
  state.online=online;
  $("#connectionText").textContent=online?"Online":"Offline";
  const chip=$("#connectionChip"); chip.innerHTML=`<span class="status-dot ${online?"green":"gray"}"></span><span>${online?"Online":"Offline"}</span>`;
  $("#networkStatusText").textContent=online?"ONLINE":"OFFLINE";
  $("#offlineBanner").classList.toggle("show",!online);
  $("#lastSync").textContent=online?"Just now":"Last sync 12:18";
}

function updateI18n(){
  $$("[data-i18n]").forEach(el=>el.textContent=I18N[state.lang][el.dataset.i18n]||el.textContent);
  $("#langToggle").textContent=state.lang==="en"?"हि":"EN";
}

function renderNodes(){
  const g=$("#nodesLayer"); if(!g)return;
  const color={green:"#48cf8d",yellow:"#e5c45b",orange:"#ff914d",red:"#ff5f57",gray:"#7b8784"};
  g.innerHTML=state.nodes.map(n=>`
    <g class="node-pin" data-node="${n.id}">
      ${n.s==="red"?`<circle cx="${n.x}" cy="${n.y}" r="15" class="incident-ring" stroke="#ff5f57" opacity=".55"/>`:``}
      <circle cx="${n.x}" cy="${n.y}" r="7" class="node-core" fill="${color[n.s]||color.green}"/>
      <circle cx="${n.x}" cy="${n.y}" r="11" fill="none" stroke="${color[n.s]||color.green}" opacity=".25"/>
      <title>${n.id} · ${n.s.toUpperCase()}</title>
    </g>`).join("");
  $$(".node-pin",g).forEach(pin=>pin.addEventListener("click",()=>openNode(pin.dataset.node)));
}

function renderIncidents(){
  const list=$("#incidentList"); if(!list)return;
  list.innerHTML=state.incidents.map(i=>`
    <div class="incident-item" data-incident="${i.id}">
      <div class="incident-top">
        <div><span class="severity ${i.severity}">${i.severity.toUpperCase()}</span> <span class="incident-type">${esc(i.type)}</span></div>
        <span class="incident-time">${esc(i.time)}</span>
      </div>
      <div class="incident-location">${esc(i.location)} · ${esc(i.node)}</div>
      <div class="incident-meta"><span>Fusion confidence</span><b>${i.confidence.toFixed(2)}</b></div>
      <div class="confidence-mini"><i style="width:${i.confidence*100}%"></i></div>
    </div>`).join("");
  $$(".incident-item",list).forEach(x=>x.addEventListener("click",()=>openIncident(+x.dataset.incident)));
  $("#openIncidents").textContent=state.incidents.filter(i=>i.status==="OPEN").length;
}

function renderIncidentPins(){
  const g=$("#incidentLayer"); if(!g)return;
  const colors={critical:"#ff5f57",high:"#ff914d",watch:"#e5c45b"};
  const coords={1:[682,205],2:[610,386],3:[389,144]};
  g.innerHTML=state.incidents.map(i=>{
    const [x,y]=coords[i.id]||[500,250], c=colors[i.severity]||"#6fe1c8";
    return `<g class="incident-pin" data-incident="${i.id}">
      <circle cx="${x}" cy="${y}" r="17" fill="${c}" opacity=".10"/>
      <circle cx="${x}" cy="${y}" r="10" fill="${c}" stroke="#061210" stroke-width="3"/>
      <text x="${x+14}" y="${y+4}" fill="#e7f0ed" font-size="10" font-family="Inter,Arial">⚠ ${esc(i.type.split(" ")[0])}</text>
    </g>`;
  }).join("");
  $$(".incident-pin",g).forEach(pin=>pin.addEventListener("click",()=>openIncident(+pin.dataset.incident)));
}

function drawChart(canvas, data){
  if(!canvas)return;
  const ctx=canvas.getContext("2d"), dpr=window.devicePixelRatio||1;
  const w=canvas.clientWidth||600,h=canvas.clientHeight||160;
  canvas.width=w*dpr; canvas.height=h*dpr; ctx.scale(dpr,dpr); ctx.clearRect(0,0,w,h);
  const pad={l:24,r:14,t:12,b:20}, max=Math.max(...data)+20,min=Math.min(...data)-20;
  ctx.strokeStyle="#18372f";ctx.lineWidth=1;
  [0,.25,.5,.75,1].forEach(t=>{const y=pad.t+(h-pad.t-pad.b)*t;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke()});
  const points=data.map((v,i)=>[pad.l+i*(w-pad.l-pad.r)/(data.length-1),pad.t+(max-v)/(max-min)*(h-pad.t-pad.b)]);
  const grad=ctx.createLinearGradient(0,pad.t,0,h);grad.addColorStop(0,"rgba(111,225,200,.24)");grad.addColorStop(1,"rgba(111,225,200,0)");
  ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.lineTo(points.at(-1)[0],h-pad.b);ctx.lineTo(points[0][0],h-pad.b);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle="#6fe1c8";ctx.lineWidth=2.2;ctx.stroke();
  points.slice(-5).forEach(p=>{ctx.fillStyle="#ff8c78";ctx.beginPath();ctx.arc(p[0],p[1],3.2,0,Math.PI*2);ctx.fill()});
  ctx.fillStyle="#66847b";ctx.font="9px Inter,Arial";ctx.fillText("30m",w-45,h-4);ctx.fillText(String(Math.round(max)),4,pad.t+4);ctx.fillText(String(Math.round(min)),4,h-pad.b);
}

function refreshChart(){
  const c=$("#sensorChart"); if(c) drawChart(c,state.sensorHistory);
}

function openModal(){ $("#incidentModal").classList.add("show"); $("#incidentModal").setAttribute("aria-hidden","false");}
function closeModal(){ $("#incidentModal").classList.remove("show"); $("#incidentModal").setAttribute("aria-hidden","true");}
function openIncident(id){
  const i=state.incidents.find(x=>x.id===id)||state.incidents[0];
  $("#modalTitle").textContent=`${i.severity.toUpperCase()} · ${i.type}`;
  $("#modalNode").textContent=i.node;
  $("#modalConf").textContent=i.confidence.toFixed(2);
  $("#modalTime").textContent=i.time;
  openModal();
}
function openNode(id){ toast("Node selected",`${id} telemetry opened in the control room.`,`info`); }
function openDetail(){openIncident(1)}

function addIncident(type,severity,node,location,confidence){
  const id=Date.now();
  const d=new Date(); const time=d.toLocaleTimeString([], {hour12:false});
  state.incidents.unshift({id,severity,type,node,location,confidence,time,status:"OPEN",lat:29.3947,lon:79.5059});
  renderIncidents(); renderIncidentPins();
  const s=document.querySelector(".nav-count"); if(s)s.textContent=state.incidents.filter(i=>i.status==="OPEN").length;
  if(severity==="critical") toast("CRITICAL ALERT",`${type} verified at ${location}. Siren + responder alert triggered.`,"critical");
  else toast("New incident",`${type} detected at ${location}.`,"warn");
}

function simulateFire(){
  state.tick++; const conf=.85+Math.random()*.1;
  addIncident("Forest Fire / Smoke","critical","N-BHW-007","Bhowali Forest Edge",conf);
  $("#selectedPm").textContent="152"; $("#selectedGas").textContent="685"; $("#selectedTemp").textContent="42.1"; $("#selectedRh").textContent="17";
  state.sensorHistory.push(152,160); state.sensorHistory.splice(0,Math.max(0,state.sensorHistory.length-24)); refreshChart();
}
function simulateGas(){
  const conf=.66+Math.random()*.15;
  addIncident("Gas Leakage / Combustible","high","N-BHW-004","Roadside Cluster",conf);
  $("#selectedGas").textContent="728";
}

function renderSubpage(page){
  if(page==="map")return;
  const host=$("#page-"+page);
  const builders={incidents:buildIncidents,sensors:buildSensors,devices:buildDevices,alerts:buildAlerts,analytics:buildAnalytics,admin:buildAdmin,public:buildPublic};
  if(builders[page])host.innerHTML=builders[page]();
  attachSubpageEvents(page);
  if(page==="analytics"){const c=$("#analyticsChart"); if(c)drawChart(c,[42,48,51,45,56,64,58,67,74,71,82,96,89,102,98,110,118,112,126,121,133,129,140,138]);}
}

function buildIncidents(){
  return `<div class="data-grid">
    <div class="data-card"><small>OPEN</small><b>${state.incidents.length}</b><span class="warn">Active queue</span></div>
    <div class="data-card"><small>CRITICAL</small><b>1</b><span class="danger-text">Immediate action</span></div>
    <div class="data-card"><small>HIGH</small><b>1</b><span class="warn">Responder alert</span></div>
    <div class="data-card"><small>FALSE ALARMS</small><b>4</b><span class="good">2.1% rate</span></div>
  </div>
  <div class="subpage-grid">
    <div class="panel"><div class="section-pad">
      <div class="filter-row"><input class="search-box" id="incidentSearch" placeholder="Search incident, node or zone..." />
      <button class="chip active">All</button><button class="chip">Critical</button><button class="chip">High</button><button class="chip">Watch</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Severity</th><th>Type</th><th>Node</th><th>Zone</th><th>Confidence</th><th>Status</th><th>Action</th></tr></thead><tbody id="incidentTable">${incidentRows()}</tbody></table></div>
    </div></div>
    <div class="panel"><div class="panel-head"><div><span class="panel-title">Response workflow</span><span class="panel-sub">Evidence-first triage</span></div></div>
      <div class="section-pad"><div class="timeline"><div class="timeline-line"></div>
        <div class="timeline-item"><b>01</b><span>Sensor trigger → moving baseline anomaly</span></div>
        <div class="timeline-item"><b>02</b><span>Camera wakes → 1–3 verification frames</span></div>
        <div class="timeline-item"><b>03</b><span>YOLOv8 + CNN-LSTM fusion</span></div>
        <div class="timeline-item"><b>04</b><span>Severity rule → alert engine</span></div>
        <div class="timeline-item"><b>05</b><span>Acknowledge / dispatch / resolve</span></div>
        </div>
      </div></div>
  </div>`;
}
function incidentRows(){
  return state.incidents.map(i=>`<tr><td><span class="severity ${i.severity}">${i.severity.toUpperCase()}</span></td><td>${esc(i.type)}</td><td>${i.node}</td><td>${esc(i.location)}</td><td>${i.confidence.toFixed(2)}</td><td>${i.status}</td><td><button class="text-btn table-open" data-id="${i.id}">Open ↗</button></td></tr>`).join("");
}
function buildSensors(){
  return `<div class="data-grid"><div class="data-card"><small>PM2.5 PROXY</small><b>138</b><span class="warn">Above baseline</span></div><div class="data-card"><small>MQ2 GAS INDEX</small><b>612</b><span class="danger-text">Trigger-capable</span></div><div class="data-card"><small>MQ135 AIR INDEX</small><b>410</b><span class="warn">Elevated</span></div><div class="data-card"><small>ENVIRONMENT</small><b>41.2°C</b><span class="warn">18% RH</span></div></div>
  <div class="sensor-card-grid">
    ${sensorCard("PM2.5 proxy","N-BHW-007","138 µg/m³",80,"GP2Y1010 / PM proxy")}
    ${sensorCard("Gas / smoke","N-BHW-007","612",71,"MQ2 · smoke/LPG/combustible")}
    ${sensorCard("Air quality index","N-BHW-007","410",66,"MQ135 · qualitative index")}
    ${sensorCard("Temperature / RH","N-BHW-007","41.2°C / 18%",88,"DHT11 · prototype context")}
  </div>`;
}
function sensorCard(title,node,value,pct,desc){return `<div class="panel"><div class="panel-head"><div><span class="panel-title">${title}</span><span class="panel-sub">${node} · live telemetry</span></div><span class="status-dot green"></span></div><div class="section-pad"><div class="metric-big">${value}</div><div class="metric-note">${desc}</div><div class="gauge"><i style="width:${pct}%"></i></div></div></div>`}
function buildDevices(){
  const rows=state.nodes.map((n,i)=>`<tr><td>${n.id}</td><td><span class="status-dot ${n.s==="gray"?"gray":"green"}"></span> ${n.s==="gray"?"Offline":"Online"}</td><td>${i%3===0?72:81}%</td><td>${-72-i} dBm</td><td>${(0.6+i*.07).toFixed(1)}%</td><td>1.2.${i%4}</td><td>${i===4?"Drift check":"OK"}</td></tr>`).join("");
  return `<div class="data-grid"><div class="data-card"><small>NODES</small><b>16</b><span class="good">14 online</span></div><div class="data-card"><small>LOW BATTERY</small><b>2</b><span class="warn">Eco mode eligible</span></div><div class="data-card"><small>DRIFT FLAGS</small><b>1</b><span class="warn">Needs calibration</span></div><div class="data-card"><small>TAMPER</small><b>0</b><span class="good">No active tamper</span></div></div>
  <div class="panel"><div class="section-pad"><div class="table-wrap"><table class="data-table"><thead><tr><th>Node</th><th>Status</th><th>Battery</th><th>RSSI</th><th>Loss</th><th>Firmware</th><th>Health</th></tr></thead><tbody>${rows}</tbody></table></div></div></div>`;
}
function buildAlerts(){
  return `<div class="subpage-grid"><div class="panel"><div class="panel-head"><div><span class="panel-title">Alert Composer</span><span class="panel-sub">Manual broadcast to selected groups / zones</span></div></div><div class="section-pad">
  <div class="alert-composer"><div class="field"><label>ZONE / GROUP</label><select id="alertZone"><option>Bhowali Range · Field Responders</option><option>District Admin · Nainital</option><option>Forest-Edge Communities</option></select></div>
  <div class="field"><label>CHANNEL</label><select id="alertChannel"><option>SMS + Push + Siren</option><option>SMS fallback</option><option>CAP-compatible feed</option></select></div>
  <div class="field"><label>LANGUAGE</label><select><option>English</option><option>Hindi</option></select></div>
  <div class="field"><label>MESSAGE</label><textarea id="alertMsg">CRITICAL ENVIRONMENTAL ALERT: Hazard detected near Bhowali Forest Edge. Response team acknowledgement required.</textarea></div>
  <button class="btn btn-primary" id="sendAlert">Broadcast Alert</button></div></div></div>
  <div class="panel"><div class="panel-head"><div><span class="panel-title">Delivery Log</span><span class="panel-sub">Recent channel outcomes</span></div></div><div class="section-pad"><div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Incident</th><th>Channel</th><th>Group</th><th>Status</th></tr></thead><tbody><tr><td>12:14:07</td><td>INC-2041</td><td>Siren</td><td>Bhowali responders</td><td class="good">DELIVERED</td></tr><tr><td>12:14:07</td><td>INC-2041</td><td>SMS</td><td>District admin</td><td class="good">DELIVERED</td></tr><tr><td>12:11:29</td><td>INC-2040</td><td>Push</td><td>Forest Dept.</td><td class="good">DELIVERED</td></tr></tbody></table></div></div></div></div>`;
}
function buildAnalytics(){
  return `<div class="data-grid"><div class="data-card"><small>ALERTS / 7 DAYS</small><b>38</b><span class="good">-11% vs prior</span></div><div class="data-card"><small>AVG RESPONSE</small><b>4.2 min</b><span class="good">Human workflow</span></div><div class="data-card"><small>FALSE ALARM RATE</small><b>2.1%</b><span class="good">Fusion helps</span></div><div class="data-card"><small>NODE UPTIME</small><b>99.2%</b><span class="good">Gateway target</span></div></div>
  <div class="analytics-grid"><div class="panel"><div class="panel-head"><div><span class="panel-title">Hazard Signal Trend</span><span class="panel-sub">7-day composite anomaly score</span></div><span class="uptime">Demo data</span></div><div class="section-pad"><canvas class="chart-canvas chart-large" id="analyticsChart"></canvas></div></div>
  <div class="panel"><div class="panel-head"><div><span class="panel-title">Incident Mix</span><span class="panel-sub">Current prototype period</span></div></div><div class="section-pad"><div class="confidence-bars">
    <div><span>Fire / Smoke <b>42%</b></span><div class="bar"><i style="width:42%"></i></div></div>
    <div><span>PM2.5 Spike <b>31%</b></span><div class="bar"><i style="width:31%"></i></div></div>
    <div><span>Gas / AQ <b>19%</b></span><div class="bar"><i style="width:19%"></i></div></div>
    <div><span>Other anomalies <b>8%</b></span><div class="bar"><i style="width:8%"></i></div></div></div></div></div></div>`;
}
function buildAdmin(){
  return `<div class="subpage-grid"><div class="panel"><div class="panel-head"><div><span class="panel-title">Role-Based Access</span><span class="panel-sub">Admin · Officer · Responder · Viewer</span></div></div><div class="section-pad"><div class="table-wrap"><table class="data-table"><thead><tr><th>User</th><th>Role</th><th>Zone Access</th><th>2FA</th><th>Last Active</th></tr></thead><tbody><tr><td>Rohit</td><td>Officer</td><td>Bhowali</td><td class="good">Enabled</td><td>Now</td></tr><tr><td>Field Engineer</td><td>Admin</td><td>District</td><td class="good">Enabled</td><td>6 min ago</td></tr><tr><td>Responder 01</td><td>Responder</td><td>Bhowali</td><td class="warn">SMS</td><td>2 min ago</td></tr></tbody></table></div></div></div>
  <div class="panel"><div class="panel-head"><div><span class="panel-title">Thresholds</span><span class="panel-sub">Tune during pilot validation</span></div></div><div class="section-pad">
  <div class="field"><label>VISION + SENSOR CRITICAL</label><input value="0.85" /></div><div class="field" style="margin-top:8px"><label>WATCH RECHECK</label><input value="60 s" /></div><div class="field" style="margin-top:8px"><label>NODE OFFLINE</label><input value="15 min" /></div><div class="field" style="margin-top:8px"><label>FIRMWARE VERSION</label><input value="1.2.0" /></div>
  <button class="btn btn-primary" style="margin-top:10px" onclick="toast('Settings saved','Demo thresholds stored locally.','info')">Save Configuration</button></div></div></div>`;
}
function buildPublic(){
  const critical=state.incidents.find(i=>i.severity==="critical");
  return `<div class="hero-strip"><div><div class="hero-kicker">PUBLIC SAFETY VIEW · LOW BANDWIDTH</div><h2>${critical?"Active alert near Bhowali":"No active critical alerts"}</h2><p>${critical?"A verified environmental hazard is being handled by responders. Follow local instructions and avoid the affected boundary.":"No critical incident is currently active in this demo."}</p></div><div class="severity-box ${critical?"critical":"normal"}" style="margin:0;min-width:230px"><span>${critical?"CRITICAL":"NORMAL"}</span><small>${critical?"Updated just now":"Monitoring active"}</small></div></div>
  <div class="subpage-grid" style="margin-top:12px"><div class="panel"><div class="panel-head"><div><span class="panel-title">Safety Instructions</span><span class="panel-sub">Mobile-first guidance</span></div></div><div class="section-pad"><div class="timeline"><div class="timeline-line"></div><div class="timeline-item"><b>01</b><span>Move away from the marked risk area.</span></div><div class="timeline-item"><b>02</b><span>Keep emergency routes clear for responders.</span></div><div class="timeline-item"><b>03</b><span>Use local official instructions as the source of truth.</span></div><div class="timeline-item"><b>04</b><span>Return only after authorities mark the incident resolved.</span></div></div></div></div>
  <div class="panel"><div class="panel-head"><div><span class="panel-title">Alert Details</span><span class="panel-sub">Last published event</span></div></div><div class="section-pad">${critical?`<div class="detail-stat-grid"><div><span>Type</span><b>${critical.type}</b></div><div><span>Zone</span><b>${critical.location}</b></div><div><span>Confidence</span><b>${critical.confidence.toFixed(2)}</b></div><div><span>Time</span><b>${critical.time}</b></div></div>`:`<p class="muted">No active alert.</p>`}</div></div></div>`;
}

function attachSubpageEvents(page){
  if(page==="incidents"){
    $$(".table-open").forEach(b=>b.addEventListener("click",()=>openIncident(+b.dataset.id)));
    const s=$("#incidentSearch"); if(s)s.addEventListener("input",()=>{
      const q=s.value.toLowerCase(); $("#incidentTable").innerHTML=state.incidents.filter(i=>JSON.stringify(i).toLowerCase().includes(q)).map(i=>`<tr><td><span class="severity ${i.severity}">${i.severity.toUpperCase()}</span></td><td>${esc(i.type)}</td><td>${i.node}</td><td>${esc(i.location)}</td><td>${i.confidence.toFixed(2)}</td><td>${i.status}</td><td><button class="text-btn table-open" data-id="${i.id}">Open ↗</button></td></tr>`).join("");
      $$(".table-open").forEach(b=>b.addEventListener("click",()=>openIncident(+b.dataset.id)));
    });
  }
  if(page==="alerts"){const s=$("#sendAlert"); if(s)s.addEventListener("click",()=>{toast("Alert broadcast","Message queued for selected group and channel.","info");});}
}

function tick(){
  state.tick++;
  const delta=(Math.random()-.42)*5;
  const last=state.sensorHistory.at(-1)||130;
  const next=Math.max(48,Math.round(last+delta));
  state.sensorHistory.push(next); if(state.sensorHistory.length>24)state.sensorHistory.shift();
  $("#selectedPm").textContent=next;
  $("#avgPm").textContent=Math.round(state.sensorHistory.reduce((a,b)=>a+b,0)/state.sensorHistory.length);
  $("#latency").textContent=(1.1+Math.random()*.5).toFixed(1);
  $("#packetDelivery").textContent=(98.1+Math.random()*1.3).toFixed(1);
  refreshChart();
  if(state.tick%5===0 && state.online) $("#lastSync").textContent="Just now";
}

window.addEventListener("resize",refreshChart);

document.addEventListener("DOMContentLoaded",()=>{
  renderNodes(); renderIncidents(); renderIncidentPins(); refreshChart(); updateI18n();
  setInterval(tick,1600);
  $$(".nav-item").forEach(n=>n.addEventListener("click",()=>setPage(n.dataset.page)));
  $$("[data-go]").forEach(b=>b.addEventListener("click",()=>setPage(b.dataset.go)));
  $("#simulateFire").addEventListener("click",simulateFire);
  $("#simulateGas").addEventListener("click",simulateGas);
  $("#themeToggle").addEventListener("click",()=>{state.theme=state.theme==="dark"?"light":"dark";document.body.classList.toggle("light",state.theme==="light");toast("Theme changed",`${state.theme==="dark"?"Dark":"Light"} control-room theme active.`,"info")});
  $("#langToggle").addEventListener("click",()=>{state.lang=state.lang==="en"?"hi":"en";updateI18n();toast("Language changed",state.lang==="hi"?"हिंदी इंटरफेस सक्रिय है।":"English interface active.","info")});
  $("#globalAlertsBtn").addEventListener("click",()=>setPage("incidents"));
  $("#openDetail").addEventListener("click",openDetail);
  $("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
  $$(".modal [data-close-modal]").forEach(b=>b.addEventListener("click",closeModal));
  $$(".modal [data-action]").forEach(b=>b.addEventListener("click",()=>{
    const a=b.dataset.action; closeModal();
    if(a==="ack")toast("Incident acknowledged","Responder workflow updated; audit event recorded.","info");
    if(a==="dispatch")toast("Dispatch created","Field response task sent to the Bhowali response group.","warn");
    if(a==="false")toast("Marked as false alarm","Incident added to the labelled-data feedback queue.","info");
  }));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
  $$(".chip[data-layer]").forEach(ch=>{
    ch.addEventListener("click",()=>{
      ch.classList.toggle("active");
      const layer=ch.dataset.layer;
      if(layer==="heat")$("#heatLayer").style.opacity=ch.classList.contains("active")?".9":"0";
      if(layer==="nodes")$("#nodesLayer").style.opacity=ch.classList.contains("active")?"1":"0";
      if(layer==="incidents")$("#incidentLayer").style.opacity=ch.classList.contains("active")?"1":"0";
      if(layer==="zones")$("#riskPolygon").style.opacity=ch.classList.contains("active")?".85":"0";
    });
  });
  window.addEventListener("offline",()=>setOnline(false)); window.addEventListener("online",()=>setOnline(true));
});

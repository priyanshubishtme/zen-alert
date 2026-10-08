const state = {
  page: "map",
  online: true,
  lang: "en",
  theme: localStorage.getItem("zenalert-theme")==="dark" ? "dark" : "light",
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
  hi: {live_map:"लाइव मानचित्र",incidents:"घटना केंद्र",sensors:"सेंसर और वायु",devices:"डिवाइस स्थिति",alerts:"अलर्ट",analytics:"विश्लेषण",admin:"प्रशासन",public_alert:"सार्वजनिक अलर्ट"}
};

const titles = {
  en:{map:"Live Environmental Map",incidents:"Incident Center",sensors:"Sensors & Air Quality",devices:"Device Health",alerts:"Alert Operations",analytics:"Analytics & Reports",admin:"Administration",public:"Public Alert View"},
  hi:{map:"लाइव पर्यावरण मानचित्र",incidents:"घटना केंद्र",sensors:"सेंसर और वायु गुणवत्ता",devices:"डिवाइस स्थिति",alerts:"अलर्ट संचालन",analytics:"विश्लेषण और रिपोर्ट",admin:"प्रशासन",public:"सार्वजनिक अलर्ट"}
};

const HINDI = {
  "Live Map":"लाइव मानचित्र", "Incident Center":"घटना केंद्र", "Sensors & Air":"सेंसर और वायु", "Device Health":"डिवाइस स्थिति", "Analytics":"विश्लेषण", "Admin":"प्रशासन", "Public Alert View":"सार्वजनिक अलर्ट", "OPERATIONS / ENVIRONMENTAL MONITORING":"संचालन / पर्यावरण निगरानी", "Pilot Network":"पायलट नेटवर्क", "Resilient Environmental AI":"लचीला पर्यावरण एआई", "SYSTEM STATUS":"सिस्टम स्थिति", "ONLINE":"ऑनलाइन", "OFFLINE":"ऑफ़लाइन", "Just now":"अभी", "Online":"ऑनलाइन", "Offline":"ऑफ़लाइन", "Alerts":"अलर्ट",
  "BHOWALI RANGE · LIVE MONITORING":"भवाली रेंज · लाइव निगरानी", "Environmental operations at a glance.":"एक नज़र में पर्यावरण संचालन।", "See verified signals, active incidents and network health in one shared operational view.":"सत्यापित संकेतों, सक्रिय घटनाओं और नेटवर्क की स्थिति को एक ही साझा संचालन दृश्य में देखें।", "14 of 16 nodes reporting":"16 में से 14 नोड रिपोर्ट कर रहे हैं", "Last sync: just now":"अंतिम सिंक: अभी", "Coverage: Bhowali Range":"कवरेज: भवाली रेंज", "Create test fire event":"टेस्ट अग्नि घटना बनाएं", "Create test gas event":"टेस्ट गैस घटना बनाएं",
  "Nodes Online":"नोड ऑनलाइन", "Open Incidents":"खुली घटनाएं", "Avg PM2.5 Proxy":"औसत PM2.5 प्रॉक्सी", "Verified Alert Latency":"सत्यापित अलर्ट विलंब", "Gateway":"गेटवे", "Packet Delivery":"पैकेट डिलीवरी", "Above local baseline":"स्थानीय आधाररेखा से ऊपर", "Target 1–2 s":"लक्ष्य 1–2 से", "active":"सक्रिय", "ACK + retry enabled":"पुष्टि और पुन: प्रयास सक्षम",
  "Threat Map":"जोखिम मानचित्र", "Live Incident Feed":"लाइव घटना फ़ीड", "View all →":"सभी देखें →", "Nodes":"नोड", "Incidents":"घटनाएं", "Heat":"हीट", "Zones":"क्षेत्र", "Normal":"सामान्य", "Watch":"निगरानी", "High":"उच्च", "Critical":"गंभीर", "HIGH":"उच्च", "WATCH":"निगरानी", "Forest Fire / Smoke":"वन आग / धुआं", "Gas / Air Quality":"गैस / वायु गुणवत्ता", "Gas Leakage / Combustible":"गैस रिसाव / ज्वलनशील", "Selected Node · N-BHW-007":"चयनित नोड · N-BHW-007", "Healthy":"स्वस्थ", "PM2.5 proxy":"PM2.5 प्रॉक्सी", "Gas index":"गैस सूचकांक", "Temp":"तापमान", "Humidity":"नमी", "AI Fusion Confidence":"एआई फ्यूज़न भरोसा", "Current top incident":"वर्तमान प्रमुख घटना", "Gateway Health":"गेटवे स्थिति", "Fusion confidence":"फ्यूज़न भरोसा",
  "Response workflow":"प्रतिक्रिया कार्यप्रवाह", "Evidence-first triage":"साक्ष्य-आधारित जांच", "Active queue":"सक्रिय कतार", "Immediate action":"तत्काल कार्रवाई", "Responder alert":"प्रतिक्रिया दल अलर्ट", "FALSE ALARMS":"गलत अलार्म", "Search incident, node or zone...":"घटना, नोड या क्षेत्र खोजें...", "All":"सभी", "Severity":"गंभीरता", "Type":"प्रकार", "Node":"नोड", "Zone":"क्षेत्र", "Confidence":"भरोसा", "Status":"स्थिति", "Action":"कार्रवाई", "Open ↗":"खोलें ↗",
  "Alert Composer":"अलर्ट कंपोज़र", "Manual broadcast to selected groups / zones":"चुने हुए समूहों / क्षेत्रों को मैन्युअल प्रसारण", "Delivery Log":"डिलीवरी लॉग", "Recent channel outcomes":"हालिया चैनल परिणाम", "LANGUAGE":"भाषा", "MESSAGE":"संदेश", "Broadcast Alert":"अलर्ट प्रसारित करें", "English":"अंग्रेज़ी", "Hindi":"हिंदी", "DELIVERED":"वितरित", "Time":"समय", "Incident":"घटना", "Channel":"चैनल", "Group":"समूह",
  "Hazard Signal Trend":"जोखिम संकेत प्रवृत्ति", "7-day composite anomaly score":"7-दिन संयुक्त विसंगति स्कोर", "Demo data":"डेमो डेटा", "Incident Mix":"घटना मिश्रण", "Current prototype period":"वर्तमान प्रोटोटाइप अवधि", "ALERTS / 7 DAYS":"अलर्ट / 7 दिन", "AVG RESPONSE":"औसत प्रतिक्रिया", "FALSE ALARM RATE":"गलत अलार्म दर", "NODE UPTIME":"नोड अपटाइम", "Fire / Smoke":"आग / धुआं", "PM2.5 Spike":"PM2.5 वृद्धि", "Gas / AQ":"गैस / वायु गुणवत्ता", "Other anomalies":"अन्य विसंगतियां",
  "Role-Based Access":"भूमिका-आधारित पहुंच", "Thresholds":"सीमाएं", "Save Configuration":"कॉन्फ़िगरेशन सहेजें", "User":"उपयोगकर्ता", "Role":"भूमिका", "Zone Access":"क्षेत्र पहुंच", "Last Active":"अंतिम सक्रिय", "Enabled":"सक्षम", "Now":"अभी", "Safety Instructions":"सुरक्षा निर्देश", "Mobile-first guidance":"मोबाइल-अनुकूल निर्देश", "Alert Details":"अलर्ट विवरण", "Last published event":"अंतिम प्रकाशित घटना", "No active alert.":"कोई सक्रिय अलर्ट नहीं।",
  "INCIDENT DETAIL":"घटना विवरण", "Evidence frame":"साक्ष्य फ़्रेम", "Final confidence":"अंतिम भरोसा", "First seen":"पहली बार देखा गया", "Sensor snapshot":"सेंसर स्नैपशॉट", "live":"लाइव", "Acknowledge":"स्वीकार करें", "Dispatch":"भेजें", "Mark false alarm":"गलत अलार्म चिह्नित करें", "CRITICAL":"गंभीर", "NORMAL":"सामान्य",
  "Environmental early warning":"पर्यावरण प्रारंभिक चेतावनी", "Make every environmental signal actionable.":"हर पर्यावरणीय संकेत को कार्रवाई योग्य बनाएं।", "zenalert brings sensor data, verified incidents and response workflows into one clear operating picture for teams on the ground.":"zenalert सेंसर डेटा, सत्यापित घटनाओं और प्रतिक्रिया कार्यप्रवाह को जमीनी टीमों के लिए एक स्पष्ट संचालन दृश्य में लाता है।", "Enter live workspace":"लाइव कार्यक्षेत्र खोलें", "Open workspace":"कार्यस्थान खोलें", "Explore the platform":"प्लेटफ़ॉर्म देखें", "nodes reporting":"नोड रिपोर्ट कर रहे हैं", "verified latency":"सत्यापित विलंब", "gateway uptime":"गेटवे अपटाइम", "One calm control surface":"एक सहज नियंत्रण सतह", "Designed for the decisions that matter.":"महत्वपूर्ण निर्णयों के लिए डिज़ाइन किया गया।", "See the whole picture":"पूरा दृश्य देखें", "Verify before acting":"कार्रवाई से पहले सत्यापित करें", "Keep response moving":"प्रतिक्रिया को गतिमान रखें", "Monitor risk, telemetry and coverage without jumping between tools.":"टूल बदलने की आवश्यकता के बिना जोखिम, टेलीमेट्री और कवरेज की निगरानी करें।", "Combine sensor and vision evidence into a clear incident record.":"सेंसर और विज़न साक्ष्य को स्पष्ट घटना रिकॉर्ड में जोड़ें।", "Coordinate alerts, acknowledgements and field response in one place.":"अलर्ट, स्वीकृति और फील्ड प्रतिक्रिया को एक स्थान पर समन्वित करें।", "LIVE OVERVIEW":"लाइव अवलोकन", "Network healthy":"नेटवर्क स्वस्थ", "Open incidents":"खुली घटनाएं", "Air quality":"वायु गुणवत्ता", "Response state":"प्रतिक्रिया स्थिति", "Ready":"तैयार", "All channels available":"सभी चैनल उपलब्ध", "zenalert · resilient environmental AI":"zenalert · लचीला पर्यावरण एआई", "Built for local response teams":"स्थानीय प्रतिक्रिया टीमों के लिए निर्मित"
};

Object.assign(HINDI,{
  "Incident management":"घटना प्रबंधन","Review, verify and coordinate active environmental events.":"सक्रिय पर्यावरणीय घटनाओं की समीक्षा, सत्यापन और समन्वय करें।","Telemetry overview":"टेलीमेट्री अवलोकन","Track the sensor signals that inform every alert.":"हर अलर्ट को सूचित करने वाले सेंसर संकेतों को ट्रैक करें।","Network reliability":"नेटवर्क विश्वसनीयता","Monitor node connectivity, power and field health.":"नोड कनेक्टिविटी, पावर और फील्ड स्थिति की निगरानी करें।","Response communications":"प्रतिक्रिया संचार","Prepare and record targeted safety broadcasts.":"लक्षित सुरक्षा प्रसारण तैयार करें और रिकॉर्ड करें।","Operational insight":"संचालन अंतर्दृष्टि","Understand changing conditions and response performance.":"बदलती परिस्थितियों और प्रतिक्रिया प्रदर्शन को समझें।","Workspace settings":"कार्यस्थान सेटिंग्स","Maintain access, operating thresholds and readiness.":"पहुँच, संचालन सीमाएं और तैयारी बनाए रखें।","Public safety information":"सार्वजनिक सुरक्षा जानकारी","A focused, low-bandwidth view for people in the affected area.":"प्रभावित क्षेत्र के लोगों के लिए केंद्रित, कम-बैंडविड्थ दृश्य।","Live demo workspace":"लाइव डेमो कार्यस्थान","7 days":"7 दिन","30 days":"30 दिन","No incidents match this view.":"इस दृश्य से कोई घटना मेल नहीं खाती।","Message added to the local delivery log.":"संदेश स्थानीय डिलीवरी लॉग में जोड़ा गया है।"
});

const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];
const originalText = new WeakMap();
const originalAttrs = new WeakMap();

function t(value){ return state.lang === "hi" ? (HINDI[value] || value) : value; }

function localizeTree(root=document){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[]; let node;
  while(node=walker.nextNode()) nodes.push(node);
  nodes.forEach(textNode=>{
    if(textNode.parentElement?.closest("script,style")) return;
    const raw=originalText.has(textNode)?originalText.get(textNode):textNode.nodeValue;
    if(!originalText.has(textNode)) originalText.set(textNode,raw);
    const lead=raw.match(/^\s*/)[0], trail=raw.match(/\s*$/)[0], body=raw.trim();
    if(body) textNode.nodeValue=`${lead}${t(body)}${trail}`;
  });
  $$("[placeholder]").forEach(el=>{
    const saved=originalAttrs.get(el)||el.getAttribute("placeholder"); if(!originalAttrs.has(el)) originalAttrs.set(el,saved);
    el.setAttribute("placeholder",t(saved));
  });
}

function esc(v){return String(v).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

function toast(title, message, kind="info"){
  const host=$("#toastStack");
  const toastElement=document.createElement("div");
  toastElement.className="toast";
  const dot = kind==="critical" ? "🔴" : kind==="warn" ? "🟠" : "🟢";
  toastElement.innerHTML=`<div>${dot}</div><div><strong>${esc(t(title))}</strong><span>${esc(t(message))}</span></div>`;
  host.appendChild(toastElement); setTimeout(()=>toastElement.remove(),4200);
}

function setPage(page){
  state.page=page;
  $$(".page").forEach(p=>p.classList.remove("active"));
  const el=$("#page-"+page); if(el) el.classList.add("active");
  $$(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===page));
  $("#pageTitle").textContent=titles[state.lang][page]||"Dashboard";
  renderSubpage(page);
  updateI18n();
  $("#sidebar").classList.remove("open");
}

function setOnline(online){
  state.online=online;
  $("#connectionText").textContent=online?t("Online"):t("Offline");
  const chip=$("#connectionChip"); chip.innerHTML=`<span class="status-dot ${online?"green":"gray"}"></span><span>${online?t("Online"):t("Offline")}</span>`;
  $("#networkStatusText").textContent=online?t("ONLINE"):t("OFFLINE");
  $("#offlineBanner").classList.toggle("show",!online);
  $("#lastSync").textContent=online?t("Just now"):t("Last sync 12:18");
}

function updateI18n(){
  localizeTree();
  $("#langToggle").textContent=state.lang==="en"?"हिं":"EN";
  const landingLang=$("#landingLang"); if(landingLang) landingLang.textContent=state.lang==="en"?"हिं":"EN";
  $("#pageTitle").textContent=titles[state.lang][state.page]||"Dashboard";
  document.documentElement.lang=state.lang;
  refreshChart();
}

function applyTheme(theme){
  state.theme=theme==="dark"?"dark":"light";
  document.body.classList.toggle("light",state.theme==="light");
  localStorage.setItem("zenalert-theme",state.theme);
  $("#themeToggle").setAttribute("aria-label",state.theme==="dark"?"Switch to light theme":"Switch to dark theme");
  $("#themeToggle").setAttribute("aria-pressed",String(state.theme==="dark"));
  refreshChart();
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
        <div><span class="severity ${i.severity}">${t(i.severity.toUpperCase())}</span> <span class="incident-type">${esc(t(i.type))}</span></div>
        <span class="incident-time">${esc(i.time)}</span>
      </div>
      <div class="incident-location">${esc(i.location)} · ${esc(i.node)}</div>
      <div class="incident-meta"><span>${t("Fusion confidence")}</span><b>${i.confidence.toFixed(2)}</b></div>
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
  const styles=getComputedStyle(document.body);
  const isLight=document.body.classList.contains("light");
  const grid=isLight?"#dfe7ef":"#26394d", label=isLight?"#6b8093":"#8296aa", line=isLight?"#138f89":"#5bc7bf";
  ctx.strokeStyle=grid;ctx.lineWidth=1;
  [0,.25,.5,.75,1].forEach(t=>{const y=pad.t+(h-pad.t-pad.b)*t;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke()});
  const points=data.map((v,i)=>[pad.l+i*(w-pad.l-pad.r)/(data.length-1),pad.t+(max-v)/(max-min)*(h-pad.t-pad.b)]);
  const grad=ctx.createLinearGradient(0,pad.t,0,h);grad.addColorStop(0,isLight?"rgba(19,143,137,.12)":"rgba(91,199,191,.14)");grad.addColorStop(1,"rgba(91,199,191,0)");
  ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.lineTo(points.at(-1)[0],h-pad.b);ctx.lineTo(points[0][0],h-pad.b);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=line;ctx.lineWidth=2;ctx.stroke();
  const last=points.at(-1);ctx.fillStyle=line;ctx.beginPath();ctx.arc(last[0],last[1],3.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=label;ctx.font="9px Inter,Arial";ctx.fillText("30m",w-45,h-4);ctx.fillText(String(Math.round(max)),4,pad.t+4);ctx.fillText(String(Math.round(min)),4,h-pad.b);
}

function refreshChart(){
  const c=$("#sensorChart"); if(c) drawChart(c,state.sensorHistory);
}

function openModal(){ $("#incidentModal").classList.add("show"); $("#incidentModal").setAttribute("aria-hidden","false");}
function closeModal(){ $("#incidentModal").classList.remove("show"); $("#incidentModal").setAttribute("aria-hidden","true");}
function openIncident(id){
  const i=state.incidents.find(x=>x.id===id)||state.incidents[0];
  $("#modalTitle").textContent=`${t(i.severity.toUpperCase())} · ${t(i.type)}`;
  $("#modalNode").textContent=i.node;
  $("#modalConf").textContent=i.confidence.toFixed(2);
  $("#modalTime").textContent=i.time;
  openModal();
}
function openNode(id){ toast("Node selected",`${id} telemetry opened in the control room.`,`info`); }
function openDetail(){openIncident(1)}

function openWorkspace(){
  document.body.classList.remove("landing-active");
  requestAnimationFrame(refreshChart);
}
function showLanding(){
  document.body.classList.add("landing-active");
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
function toggleLanguage(){
  state.lang=state.lang==="en"?"hi":"en";
  renderIncidents();
  if(state.page!=="map") renderSubpage(state.page);
  updateI18n();
  toast(state.lang==="hi"?"भाषा बदली":"Language changed",state.lang==="hi"?"हिंदी इंटरफ़ेस सक्रिय है।":"English interface active.","info");
}

function addIncident(type,severity,node,location,confidence){
  const id=Date.now();
  const d=new Date(); const time=d.toLocaleTimeString([], {hour12:false});
  state.incidents.unshift({id,severity,type,node,location,confidence,time,status:"OPEN",lat:29.3947,lon:79.5059});
  renderIncidents(); renderIncidentPins();
  updateI18n();
  const s=document.querySelector(".nav-count"); if(s)s.textContent=state.incidents.filter(i=>i.status==="OPEN").length;
  const alertCount=$("#globalAlertCount"); if(alertCount)alertCount.textContent=state.incidents.filter(i=>i.status==="OPEN").length;
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
  if(builders[page])host.innerHTML=`${workspaceIntro(page)}${builders[page]()}`;
  attachSubpageEvents(page);
  if(page==="analytics"){const c=$("#analyticsChart"); if(c)drawChart(c,[42,48,51,45,56,64,58,67,74,71,82,96,89,102,98,110,118,112,126,121,133,129,140,138]);}
}

function workspaceIntro(page){
  const copy={
    incidents:["Incident management","Review, verify and coordinate active environmental events."],
    sensors:["Telemetry overview","Track the sensor signals that inform every alert."],
    devices:["Network reliability","Monitor node connectivity, power and field health."],
    alerts:["Response communications","Prepare and record targeted safety broadcasts."],
    analytics:["Operational insight","Understand changing conditions and response performance."],
    admin:["Workspace settings","Maintain access, operating thresholds and readiness."],
    public:["Public safety information","A focused, low-bandwidth view for people in the affected area."]
  }[page];
  return copy?`<div class="workspace-intro"><div><span>${copy[0]}</span><p>${copy[1]}</p></div><small>Live demo workspace</small></div>`:"";
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
      <div class="filter-row"><input class="search-box" id="incidentSearch" type="search" aria-label="Search incidents" placeholder="Search incident, node or zone..." />
      <button class="chip active" data-incident-filter="all">All</button><button class="chip" data-incident-filter="critical">Critical</button><button class="chip" data-incident-filter="high">High</button><button class="chip" data-incident-filter="watch">Watch</button></div>
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
function incidentRows(items=state.incidents){
  return items.map(i=>`<tr><td><span class="severity ${i.severity}">${t(i.severity.toUpperCase())}</span></td><td>${esc(t(i.type))}</td><td>${i.node}</td><td>${esc(i.location)}</td><td>${i.confidence.toFixed(2)}</td><td>${i.status}</td><td><button class="text-btn table-open" data-id="${i.id}">Open ↗</button></td></tr>`).join("") || `<tr><td colspan="7" class="muted">No incidents match this view.</td></tr>`;
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
  const rows=state.nodes.map((n,i)=>`<tr class="device-row" data-node="${n.id}" tabindex="0"><td>${n.id}</td><td><span class="status-dot ${n.s==="gray"?"gray":"green"}"></span> ${n.s==="gray"?"Offline":"Online"}</td><td>${i%3===0?72:81}%</td><td>${-72-i} dBm</td><td>${(0.6+i*.07).toFixed(1)}%</td><td>1.2.${i%4}</td><td>${i===4?"Drift check":"OK"}</td></tr>`).join("");
  return `<div class="data-grid"><div class="data-card"><small>NODES</small><b>16</b><span class="good">14 online</span></div><div class="data-card"><small>LOW BATTERY</small><b>2</b><span class="warn">Eco mode eligible</span></div><div class="data-card"><small>DRIFT FLAGS</small><b>1</b><span class="warn">Needs calibration</span></div><div class="data-card"><small>TAMPER</small><b>0</b><span class="good">No active tamper</span></div></div>
  <div class="panel"><div class="section-pad"><div class="table-wrap"><table class="data-table"><thead><tr><th>Node</th><th>Status</th><th>Battery</th><th>RSSI</th><th>Loss</th><th>Firmware</th><th>Health</th></tr></thead><tbody>${rows}</tbody></table></div></div></div>`;
}
function buildAlerts(){
  return `<div class="subpage-grid"><div class="panel"><div class="panel-head"><div><span class="panel-title">Alert Composer</span><span class="panel-sub">Manual broadcast to selected groups / zones</span></div></div><div class="section-pad">
  <div class="alert-composer"><div class="field"><label for="alertZone">ZONE / GROUP</label><select id="alertZone"><option>Bhowali Range · Field Responders</option><option>District Admin · Nainital</option><option>Forest-Edge Communities</option></select></div>
  <div class="field"><label for="alertChannel">CHANNEL</label><select id="alertChannel"><option>SMS + Push + Siren</option><option>SMS fallback</option><option>CAP-compatible feed</option></select></div>
  <div class="field"><label for="alertLanguage">LANGUAGE</label><select id="alertLanguage"><option value="en">English</option><option value="hi">Hindi</option></select></div>
  <div class="field"><label for="alertMsg">MESSAGE</label><textarea id="alertMsg">CRITICAL ENVIRONMENTAL ALERT: Hazard detected near Bhowali Forest Edge. Response team acknowledgement required.</textarea></div>
  <button class="btn btn-primary" id="sendAlert">Broadcast Alert</button></div></div></div>
  <div class="panel"><div class="panel-head"><div><span class="panel-title">Delivery Log</span><span class="panel-sub">Recent channel outcomes</span></div></div><div class="section-pad"><div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Incident</th><th>Channel</th><th>Group</th><th>Status</th></tr></thead><tbody id="deliveryLog"><tr><td>12:14:07</td><td>INC-2041</td><td>Siren</td><td>Bhowali responders</td><td class="good">DELIVERED</td></tr><tr><td>12:14:07</td><td>INC-2041</td><td>SMS</td><td>District admin</td><td class="good">DELIVERED</td></tr><tr><td>12:11:29</td><td>INC-2040</td><td>Push</td><td>Forest Dept.</td><td class="good">DELIVERED</td></tr></tbody></table></div></div></div></div>`;
}
function buildAnalytics(){
  return `<div class="data-grid"><div class="data-card"><small>ALERTS / 7 DAYS</small><b>38</b><span class="good">-11% vs prior</span></div><div class="data-card"><small>AVG RESPONSE</small><b>4.2 min</b><span class="good">Human workflow</span></div><div class="data-card"><small>FALSE ALARM RATE</small><b>2.1%</b><span class="good">Fusion helps</span></div><div class="data-card"><small>NODE UPTIME</small><b>99.2%</b><span class="good">Gateway target</span></div></div>
  <div class="analytics-grid"><div class="panel"><div class="panel-head"><div><span class="panel-title">Hazard Signal Trend</span><span class="panel-sub">Composite anomaly score</span></div><div class="range-tabs"><button class="chip active" data-range="7">7 days</button><button class="chip" data-range="30">30 days</button></div></div><div class="section-pad"><canvas class="chart-canvas chart-large" id="analyticsChart"></canvas></div></div>
  <div class="panel"><div class="panel-head"><div><span class="panel-title">Incident Mix</span><span class="panel-sub">Current prototype period</span></div></div><div class="section-pad"><div class="confidence-bars">
    <div><span>Fire / Smoke <b>42%</b></span><div class="bar"><i style="width:42%"></i></div></div>
    <div><span>PM2.5 Spike <b>31%</b></span><div class="bar"><i style="width:31%"></i></div></div>
    <div><span>Gas / AQ <b>19%</b></span><div class="bar"><i style="width:19%"></i></div></div>
    <div><span>Other anomalies <b>8%</b></span><div class="bar"><i style="width:8%"></i></div></div></div></div></div></div>`;
}
function buildAdmin(){
  const saved=JSON.parse(localStorage.getItem("zenalert-thresholds")||'{"critical":"0.85","recheck":"60 s","offline":"15 min","firmware":"1.2.0"}');
  return `<div class="subpage-grid"><div class="panel"><div class="panel-head"><div><span class="panel-title">Role-Based Access</span><span class="panel-sub">Admin · Officer · Responder · Viewer</span></div></div><div class="section-pad"><div class="table-wrap"><table class="data-table"><thead><tr><th>User</th><th>Role</th><th>Zone Access</th><th>2FA</th><th>Last Active</th></tr></thead><tbody><tr><td>Rohit</td><td>Officer</td><td>Bhowali</td><td class="good">Enabled</td><td>Now</td></tr><tr><td>Field Engineer</td><td>Admin</td><td>District</td><td class="good">Enabled</td><td>6 min ago</td></tr><tr><td>Responder 01</td><td>Responder</td><td>Bhowali</td><td class="warn">SMS</td><td>2 min ago</td></tr></tbody></table></div></div></div>
  <div class="panel"><div class="panel-head"><div><span class="panel-title">Thresholds</span><span class="panel-sub">Tune during pilot validation</span></div></div><div class="section-pad">
  <div class="field"><label for="thresholdCritical">VISION + SENSOR CRITICAL</label><input id="thresholdCritical" value="${esc(saved.critical)}" /></div><div class="field" style="margin-top:8px"><label for="thresholdRecheck">WATCH RECHECK</label><input id="thresholdRecheck" value="${esc(saved.recheck)}" /></div><div class="field" style="margin-top:8px"><label for="thresholdOffline">NODE OFFLINE</label><input id="thresholdOffline" value="${esc(saved.offline)}" /></div><div class="field" style="margin-top:8px"><label for="thresholdFirmware">FIRMWARE VERSION</label><input id="thresholdFirmware" value="${esc(saved.firmware)}" /></div>
  <button class="btn btn-primary" id="saveThresholds" style="margin-top:10px">Save Configuration</button></div></div></div>`;
}
function buildPublic(){
  const critical=state.incidents.find(i=>i.severity==="critical");
  return `<div class="hero-strip"><div><div class="hero-kicker">PUBLIC SAFETY VIEW · LOW BANDWIDTH</div><h2>${critical?"Active alert near Bhowali":"No active critical alerts"}</h2><p>${critical?"A verified environmental hazard is being handled by responders. Follow local instructions and avoid the affected boundary.":"No critical incident is currently active in this demo."}</p></div><div class="severity-box ${critical?"critical":"normal"}" style="margin:0;min-width:230px"><span>${critical?"CRITICAL":"NORMAL"}</span><small>${critical?"Updated just now":"Monitoring active"}</small></div></div>
  <div class="subpage-grid" style="margin-top:12px"><div class="panel"><div class="panel-head"><div><span class="panel-title">Safety Instructions</span><span class="panel-sub">Mobile-first guidance</span></div></div><div class="section-pad"><div class="timeline"><div class="timeline-line"></div><div class="timeline-item"><b>01</b><span>Move away from the marked risk area.</span></div><div class="timeline-item"><b>02</b><span>Keep emergency routes clear for responders.</span></div><div class="timeline-item"><b>03</b><span>Use local official instructions as the source of truth.</span></div><div class="timeline-item"><b>04</b><span>Return only after authorities mark the incident resolved.</span></div></div></div></div>
  <div class="panel"><div class="panel-head"><div><span class="panel-title">Alert Details</span><span class="panel-sub">Last published event</span></div></div><div class="section-pad">${critical?`<div class="detail-stat-grid"><div><span>Type</span><b>${critical.type}</b></div><div><span>Zone</span><b>${critical.location}</b></div><div><span>Confidence</span><b>${critical.confidence.toFixed(2)}</b></div><div><span>Time</span><b>${critical.time}</b></div></div>`:`<p class="muted">No active alert.</p>`}</div></div></div>`;
}

function attachSubpageEvents(page){
  if(page==="incidents"){
    let filter="all";
    const renderTable=()=>{
      const query=$("#incidentSearch").value.trim().toLowerCase();
      const rows=state.incidents.filter(i=>(filter==="all"||i.severity===filter)&&JSON.stringify(i).toLowerCase().includes(query));
      $("#incidentTable").innerHTML=incidentRows(rows);
      $$(".table-open").forEach(b=>b.addEventListener("click",()=>openIncident(+b.dataset.id)));
    };
    $$(".table-open").forEach(b=>b.addEventListener("click",()=>openIncident(+b.dataset.id)));
    $("#incidentSearch").addEventListener("input",renderTable);
    $$('[data-incident-filter]').forEach(button=>button.addEventListener("click",()=>{
      filter=button.dataset.incidentFilter;
      $$('[data-incident-filter]').forEach(chip=>chip.classList.toggle("active",chip===button));
      renderTable();
    }));
  }
  if(page==="devices"){
    $$(".device-row").forEach(row=>{
      const open=()=>openNode(row.dataset.node);
      row.addEventListener("click",open); row.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();open();}});
    });
  }
  if(page==="alerts"){
    const language=$("#alertLanguage"), message=$("#alertMsg"), zone=$("#alertZone"), channel=$("#alertChannel");
    const messageByLanguage={en:"CRITICAL ENVIRONMENTAL ALERT: Hazard detected near Bhowali Forest Edge. Response team acknowledgement required.",hi:"गंभीर पर्यावरण अलर्ट: भवाली वन किनारे के पास खतरा पाया गया है। प्रतिक्रिया दल की स्वीकृति आवश्यक है।"};
    language.value=state.lang;
    language.addEventListener("change",()=>{message.value=messageByLanguage[language.value];});
    $("#sendAlert").addEventListener("click",()=>{
      if(!message.value.trim()){
        toast("Message required","Add alert text before broadcasting.","warn");
        message.focus();
        return;
      }
      const now=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",hour12:false});
      const row=document.createElement("tr");
      row.innerHTML=`<td>${now}</td><td>MANUAL</td><td>${esc(channel.value)}</td><td>${esc(zone.value)}</td><td class="good">DELIVERED</td>`;
      $("#deliveryLog").prepend(row);
      localizeTree(row);
      toast("Alert broadcast","Message added to the local delivery log.","info");
    });
  }
  if(page==="analytics"){
    const trend={7:[42,48,51,45,56,64,58,67,74,71,82,96,89,102,98,110,118,112,126,121,133,129,140,138],30:[31,34,38,36,40,44,42,48,51,46,54,57,59,55,62,66,64,71,74,70,78,82,80,86,89,94,90,98,101,105]};
    $$('[data-range]').forEach(button=>button.addEventListener("click",()=>{
      $$('[data-range]').forEach(tab=>tab.classList.toggle("active",tab===button));
      drawChart($("#analyticsChart"),trend[button.dataset.range]);
    }));
  }
  if(page==="admin"){
    $("#saveThresholds").addEventListener("click",()=>{
      const values={critical:$("#thresholdCritical").value,recheck:$("#thresholdRecheck").value,offline:$("#thresholdOffline").value,firmware:$("#thresholdFirmware").value};
      if(Object.values(values).some(value=>!String(value).trim())){
        toast("Configuration incomplete","Complete every threshold field before saving.","warn");
        return;
      }
      localStorage.setItem("zenalert-thresholds",JSON.stringify(values));
      toast("Settings saved","Demo thresholds stored locally.","info");
    });
  }
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
  applyTheme(state.theme);
  renderNodes(); renderIncidents(); renderIncidentPins(); refreshChart(); updateI18n();
  setInterval(tick,1600);
  $$(".nav-item").forEach(n=>n.addEventListener("click",()=>setPage(n.dataset.page)));
  $$("[data-go]").forEach(b=>b.addEventListener("click",()=>setPage(b.dataset.go)));
  $("#simulateFire").addEventListener("click",simulateFire);
  $("#simulateGas").addEventListener("click",simulateGas);
  $("#themeToggle").addEventListener("click",()=>{applyTheme(state.theme==="dark"?"light":"dark");toast("Theme changed",`${state.theme==="dark"?"Dark":"Light"} control-room theme active.`,"info")});
  $("#langToggle").addEventListener("click",toggleLanguage);
  $("#landingLang").addEventListener("click",toggleLanguage);
  $("#landingStart").addEventListener("click",openWorkspace);
  $("#landingOpen").addEventListener("click",openWorkspace);
  $("#returnHome").addEventListener("click",showLanding);
  $("#landingHome").addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
  $("#globalAlertsBtn").addEventListener("click",()=>setPage("incidents"));
  $("#openDetail").addEventListener("click",openDetail);
  $("#mobileMenu").addEventListener("click",()=>{
    const sidebar=$("#sidebar"), isOpen=sidebar.classList.toggle("open");
    $("#mobileMenu").setAttribute("aria-expanded",String(isOpen));
    toast(isOpen?"Navigation opened":"Navigation closed",isOpen?"Choose a workspace page from the navigation.":"Workspace navigation is hidden.","info");
  });
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
      toast(`${ch.textContent.trim()} layer ${ch.classList.contains("active")?"shown":"hidden"}`,ch.classList.contains("active")?"The map layer is now visible.":"The map layer is now hidden.","info");
    });
  });
  window.addEventListener("offline",()=>setOnline(false)); window.addEventListener("online",()=>setOnline(true));
});

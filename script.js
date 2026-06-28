/* ========================
   ORIENTA — SCRIPT.JS
   Navigation, Chat IA, Interactions
   ======================== */

// ========================
// SCREEN NAVIGATION
// ========================

let screenHistory = [];
let currentScreen = "screen-login";
let offlineMode = false;
let voiceRecognition = null;

// Inicializar Web Speech API se disponível
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  voiceRecognition = new SpeechRecognition();
  voiceRecognition.lang = "pt-BR";
  voiceRecognition.continuous = false;
  voiceRecognition.interimResults = false;
  voiceRecognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("chat-input").value = transcript;
    sendMessage();
  };
  voiceRecognition.onerror = function (event) {
    showToast("Erro ao reconhecer voz: " + event.error);
  };
}

// Modo Offline
function toggleOfflineMode(checkbox) {
  offlineMode = checkbox.checked;
  localStorage.setItem("offlineMode", offlineMode);
  if (offlineMode) {
    showToast("📡 Modo offline ativado - apenas funcoes basicas");
    disableNetworkFeatures();
  } else {
    showToast("📡 Modo online ativado");
    enableNetworkFeatures();
  }
}

function disableNetworkFeatures() {
  // Desabilitar botão de imagem
  const btnAttach = document.querySelector(".btn-attach");
  if (btnAttach) btnAttach.style.opacity = "0.5";
  // Desabilitar upload de imagens
  const uploadArea = document.getElementById("img-upload-area");
  if (uploadArea) uploadArea.style.pointerEvents = "none";
}

function enableNetworkFeatures() {
  const btnAttach = document.querySelector(".btn-attach");
  if (btnAttach) btnAttach.style.opacity = "1";
  const uploadArea = document.getElementById("img-upload-area");
  if (uploadArea) uploadArea.style.pointerEvents = "auto";
}

// Entrada de voz
function startVoiceInput() {
  if (!voiceRecognition) {
    showToast("Reconhecimento de voz não suportado neste navegador");
    return;
  }
  const btn = document.getElementById("btn-voice");
  btn.style.color = "#ef4444";
  btn.style.animation = "pulse 1s infinite";
  voiceRecognition.start();
  setTimeout(() => {
    btn.style.color = "#3A8C68";
    btn.style.animation = "none";
  }, 5000);
}

// Sistema de cores para riscos (Semáforo)
const RISK_COLORS = {
  baixo: { color: "#3FB950", bg: "#0D2119", label: "Baixo risco" },
  medio: { color: "#D29922", bg: "#272115", label: "Risco moderado" },
  alto: { color: "#EF4444", bg: "#2B0B0B", label: "Alto risco" },
};

function getRiskLevel(area) {
  // Lógica simples de risco baseada na área
  if (area === "app") return "alto"; // APP precisa de atenção
  if (area === "rl") return "baixo"; // Reserva Legal ok
  if (area === "veg") return "baixo"; // Vegetação nativa ok
  if (area === "cad") return "baixo"; // CAR ok
  return "medio";
}

function applyRiskColor(element, riskLevel) {
  const risk = RISK_COLORS[riskLevel];
  if (risk) {
    element.style.borderLeft = "4px solid " + risk.color;
    element.style.backgroundColor = risk.bg;
  }
}

function showScreen(id) {
  const current = document.querySelector(".screen.active");
  const next = document.getElementById(id);
  if (!next || current === next) return;

  if (current) {
    screenHistory.push(current.id);
    current.classList.remove("active");
    current.classList.add("slide-out");
    setTimeout(() => current.classList.remove("slide-out"), 300);
  }

  next.classList.add("active");
  currentScreen = id;

  // Sync bottom nav if on main screens
  syncBottomNav(id);

  // Render dinâmico de cada tela
  if (id === "screen-home") {
    setGreeting();
    renderDashboard();
  }
  if (id === "screen-diagnostico") {
    renderDiagnostico();
  }
}

function goBack() {
  if (screenHistory.length === 0) return;
  const prevId = screenHistory.pop();
  const current = document.querySelector(".screen.active");
  const prev = document.getElementById(prevId);
  if (!prev || current === prev) return;

  current.classList.remove("active");
  prev.classList.add("active");
  currentScreen = prevId;
  syncBottomNav(prevId);
}

function switchTab(btn, screenId) {
  document
    .querySelectorAll(".nav-item")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  showScreen(screenId);
}

function syncBottomNav(screenId) {
  const map = {
    "screen-home": 0,
    "screen-ia": 1,
    "screen-mapa": 2,
    "screen-comunidade": 3,
    "screen-suporte": 4,
  };
  const idx = map[screenId];
  if (idx !== undefined) {
    document.querySelectorAll(".nav-item").forEach((b, i) => {
      b.classList.toggle("active", i === idx);
    });
  }
}

// ========================
// LOGIN
// ========================

function doLogin() {
  screenHistory = [];
  showScreen("screen-home");
}

// ========================
// GREETING
// ========================

function setGreeting() {
  const h = new Date().getHours();
  const el = document.getElementById("greeting-text");
  if (el) {
    if (h < 12) el.textContent = "Bom dia,";
    else if (h < 18) el.textContent = "Boa tarde,";
    else el.textContent = "Boa noite,";
  }

  // Data em português (ex.: "Sábado, 27 de junho")
  const dateEl = document.getElementById("home-hero-date");
  if (dateEl) {
    const now = new Date();
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const meses = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
    ];
    dateEl.textContent = `${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]}`;
  }

  // Garante que o dashboard está populado ao chegar na home
  if (typeof renderDashboard === "function") renderDashboard();
}

// ========================
// CHAT IA
// ========================

const IA_RESPONSES = {
  default: [
    "Pelo que encontrei aqui na sua propriedade, posso dizer que a situação tá bem encaminhada, Seu Raimundo. Mas sempre é bom ficar de olho, né? Me conta mais sobre o que cê quer saber — tô aqui pra isso. 🌿",
    "Boa pergunta, Seu Raimundo! Deixa eu te explicar direitinho... Bora resolver isso juntos. Com base nas informações da Fazenda São João, deixa eu te explicar como funciona de um jeito simples, sem complicação...",
    "Pode ficar tranquilo. Esse assunto parece complicado, mas eu vou te explicar de um jeito que faz sentido. A boa notícia é que sua situação tá bem — é só entender o que cada coisa significa.",
    "Bora conferir isso juntos! Analisando os dados do seu imóvel aqui, o que encontrei foi o seguinte...",
    "Boa, Seu Raimundo! Essa é uma dúvida que bastante produtor tem. Deixa eu te explicar direitinho, sem juridiquês, tá? Assim você sai daqui sabendo exatamente o que fazer.",
  ],
  plantar:
    "Seu Raimundo, sobre plantar nessa área — tudo depende de qual parte da propriedade cê tá pensando. Na sua área de cultivo principal, pode sim, sem problema! Mas se for perto do córrego, tem uma faixa que precisa ser respeitada por lei. Antes de plantar ali, bora conferir juntos se existe alguma restrição. Assim cê evita dor de cabeça mais pra frente. 🌱",
  reserva:
    "A boa notícia é que sua Reserva Legal de 48 hectares tá compatível com a legislação, Seu Raimundo! Pelo que encontrei aqui, cê tá dentro do que a lei exige pra sua região — que é 20% da área total na Caatinga. Pode ficar tranquilo com essa parte. Tá tudo certo! ✅",
  pendencia:
    "Tem um ponto que merece atenção, Seu Raimundo: encontramos uma área próxima ao Córrego São João que precisa de cuidado. Mas a boa notícia é que é algo que a gente resolve juntos — não é nada grave, não. Bora ver o que precisa ser feito pra regularizar. Assim cê evita dor de cabeça mais pra frente. ⚠️",
  regularizar:
    "Bora resolver isso juntos, Seu Raimundo! Os passos são bem simples: primeiro, a gente vê o que o diagnóstico indicou; depois, ajustamos o que precisa. No seu caso, o principal ponto é a APP próxima ao córrego. Mas pode ficar tranquilo — isso é mais comum do que parece e tem solução sim. Você não tá sozinho nisso. 👍",
  ampliar:
    "Sobre ampliar o cultivo: pelo que encontrei aqui, a sua área de cultivo principal ainda tem espaço pra crescer. Mas é importante não avançar sobre a Reserva Legal nem sobre a APP do córrego — isso a lei não permite. Se quiser ampliar em determinadas direções, bora conferir no mapa pra garantir que tá tudo certo. Assim cê evita dor de cabeça depois! 🌿",
  app: "A APP — Área de Preservação Permanente — é aquela faixa ao redor do córrego que a lei protege. Pensa assim: é como uma 'beira de rio' que precisa ficar preservada pra proteger a água. No seu caso, são 12 hectares perto do Córrego São João. Você não pode desmatar ou plantar nessa área sem autorização. Mas se essa vegetação já foi removida antes de 2008, pode haver uma opção de regularização. Bora entender melhor a sua situação?",
  car: "Seu CAR tá identificado e ativo no sistema — isso é ótimo, Seu Raimundo! O CAR é como o 'documento de identidade' da sua propriedade rural no sistema ambiental do governo. Estando ativo, você já tem acesso a vários benefícios e programas. Pode ficar tranquilo com essa parte. ✅",
};

function getIAResponse(msg) {
  const lower = msg.toLowerCase();
  if (
    lower.includes("plantar") ||
    lower.includes("planta") ||
    lower.includes("cultivar")
  )
    return IA_RESPONSES.plantar;
  if (lower.includes("reserva")) return IA_RESPONSES.reserva;
  if (
    lower.includes("pendência") ||
    lower.includes("pendencia") ||
    lower.includes("problema")
  )
    return IA_RESPONSES.pendencia;
  if (
    lower.includes("regularizar") ||
    lower.includes("regularização") ||
    lower.includes("regularizacao")
  )
    return IA_RESPONSES.regularizar;
  if (
    lower.includes("ampliar") ||
    lower.includes("cultivo") ||
    lower.includes("expand")
  )
    return IA_RESPONSES.ampliar;
  if (
    lower.includes("app") ||
    lower.includes("preservação") ||
    lower.includes("córrego") ||
    lower.includes("corrego")
  )
    return IA_RESPONSES.app;
  if (lower.includes("car") || lower.includes("cadastro"))
    return IA_RESPONSES.car;
  return IA_RESPONSES.default[
    Math.floor(Math.random() * IA_RESPONSES.default.length)
  ];
}

function sendMessage() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg) return;
  input.value = "";
  appendUserMsg(msg);
  hideSuggestions();
  showTyping();
  setTimeout(
    () => {
      removeTyping();
      appendAIMsg(getIAResponse(msg));
    },
    1200 + Math.random() * 600,
  );
}

function sendSuggestion(btn, text) {
  appendUserMsg(text);
  hideSuggestions();
  showTyping();
  setTimeout(
    () => {
      removeTyping();
      appendAIMsg(getIAResponse(text));
    },
    1200 + Math.random() * 600,
  );
}

function appendUserMsg(text) {
  const area = document.getElementById("chat-area");
  const div = document.createElement("div");
  div.className = "chat-msg user";
  div.innerHTML = `<div class="msg-bubble"><p>${escHtml(text)}</p></div>`;
  area.appendChild(div);
  scrollChat();
}

function appendAIMsg(text) {
  const area = document.getElementById("chat-area");
  const div = document.createElement("div");
  div.className = "chat-msg ai";
  div.innerHTML = `
    <div class="msg-avatar">🌿</div>
    <div class="msg-bubble">
      <p>${text}</p>
      <div class="msg-actions">
        <button class="btn-listen" onclick="speakText(this,'${escAttr(text)}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          Ouvir resposta
        </button>
      </div>
    </div>`;
  area.appendChild(div);
  scrollChat();

  // Auto read if enabled
  const autoRead = document.getElementById("toggle-autoread");
  if (autoRead && autoRead.checked) speakText(null, text);
}

let typingEl = null;
function showTyping() {
  const area = document.getElementById("chat-area");
  typingEl = document.createElement("div");
  typingEl.className = "chat-msg ai";
  typingEl.innerHTML = `<div class="msg-avatar">🌿</div><div class="msg-bubble"><div class="ia-typing"><span></span><span></span><span></span></div></div>`;
  area.appendChild(typingEl);
  scrollChat();
}
function removeTyping() {
  if (typingEl) {
    typingEl.remove();
    typingEl = null;
  }
}

function hideSuggestions() {
  const s = document.getElementById("chat-suggestions");
  if (s) {
    s.style.opacity = "0";
    s.style.transition = "opacity 0.3s";
    setTimeout(() => (s.style.display = "none"), 300);
  }
}

function scrollChat() {
  const area = document.getElementById("chat-area");
  if (area) setTimeout(() => (area.scrollTop = area.scrollHeight), 50);
}

function escHtml(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escAttr(t) {
  return t.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

// ========================
// SUPORTE CHAT
// ========================

const SUPORTE_RESPONSES = [
  "Olá, Seu Raimundo! Entendi sua dúvida. Pode ficar tranquilo que vou verificar aqui pra te dar o melhor suporte possível. Um momento! 😊",
  "Certo, Seu Raimundo! Vou encaminhar essa questão pra nossa equipe técnica. Enquanto isso, cê pode também consultar a IA do Orienta — ela resolve bastante coisa rapidinho e sem juridiquês! 🌿",
  "Obrigada por entrar em contato! Registrei sua solicitação aqui. Nossa equipe responde em até 24 horas. Se precisar de algo mais urgente, pode usar o chat com a IA direto no app — ela tá sempre disponível. 👍",
];

let suporteIdx = 0;

function sendSuporteMsg() {
  const input = document.getElementById("suporte-input");
  const msg = input.value.trim();
  if (!msg) return;
  input.value = "";

  const area = document.getElementById("suporte-area");
  // User message
  const userDiv = document.createElement("div");
  userDiv.className = "chat-msg user";
  userDiv.innerHTML = `<div class="msg-bubble"><p>${escHtml(msg)}</p></div>`;
  area.appendChild(userDiv);

  // AI response
  setTimeout(() => {
    const aiDiv = document.createElement("div");
    aiDiv.className = "chat-msg ai";
    const resp = SUPORTE_RESPONSES[suporteIdx % SUPORTE_RESPONSES.length];
    suporteIdx++;
    aiDiv.innerHTML = `<div class="msg-avatar" style="background:#e8f5e9;color:#2e7d32">👩</div><div class="msg-bubble"><p>${resp}</p></div>`;
    area.appendChild(aiDiv);
    area.scrollTop = area.scrollHeight;
  }, 1000);

  area.scrollTop = area.scrollHeight;
}

// ========================
// VOICE / TTS
// ========================

let currentUtterance = null;

// Velocidade da leitura — estado global, atualizado pelo #speed-select.
// Inicializa com 1 (Normal) ou com o valor salvo no localStorage.
let speechRate = (() => {
  try {
    const saved = parseFloat(localStorage.getItem("oriente-speech-rate"));
    return saved && saved >= 0.5 && saved <= 2 ? saved : 1;
  } catch (e) {
    return 1;
  }
})();

// Sincroniza o <select> com o estado salvo no carregamento
function syncSpeechRateUI() {
  const sel = document.getElementById("speed-select");
  if (sel) {
    // Seleciona a opção cujo value bate com speechRate
    // (com tolerância para floats como 0.7)
    const opts = Array.from(sel.options);
    const match = opts.find((o) => Math.abs(parseFloat(o.value) - speechRate) < 0.01);
    if (match) sel.value = match.value;
  }
}

// Handler do <select id="speed-select">
function setSpeechRate(value) {
  const v = parseFloat(value);
  if (!Number.isFinite(v) || v < 0.5 || v > 2) return;
  speechRate = v;
  try { localStorage.setItem("oriente-speech-rate", String(v)); } catch (e) {}
}

function speakText(btn, text) {
  if (!window.speechSynthesis) {
    showToast("Leitura por voz não disponível neste navegador.");
    return;
  }

  if (currentUtterance) {
    window.speechSynthesis.cancel();
    if (btn) btn.classList.remove("active");
    if (currentUtterance._btn === btn) {
      currentUtterance = null;
      return;
    }
  }

  const clean = text
    .replace(/<[^>]*>/g, "")
    .replace(/[🌿✅⚠️👍👋📊💧📋🌲]/gu, "");
  const u = new SpeechSynthesisUtterance(clean);
  u.rate = speechRate;
  u.lang = "pt-BR";
  u._btn = btn;

  if (btn) {
    btn.classList.add("active");
    btn.textContent = "⏸ Pausar";
  }

  u.onend = () => {
    if (btn) {
      btn.classList.remove("active");
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Ouvir resposta`;
    }
    currentUtterance = null;
  };

  currentUtterance = u;
  window.speechSynthesis.speak(u);
}

function testVoice() {
  speakText(
    null,
    "Olá Seu Raimundo! Este é um teste da leitura por voz do Orienta. Pode ficar tranquilo, a leitura está funcionando perfeitamente.",
  );
}

// ========================
// ACCESSIBILITY
// ========================

let fontLevel = 0; // -2 to +2
const fontLabels = ["Pequeno", "Menor", "Normal", "Grande", "Muito Grande"];
const fontScales = [0.85, 0.92, 1, 1.1, 1.2];

function changeFontSize(dir) {
  fontLevel = Math.max(-2, Math.min(2, fontLevel + dir));
  const idx = fontLevel + 2;
  document.documentElement.style.setProperty("--font-scale", fontScales[idx]);
  const disp = document.getElementById("font-size-display");
  if (disp) disp.textContent = fontLabels[idx];
}

function toggleReadingMode(cb) {
  document.body.classList.toggle("reading-mode", cb.checked);
}

// ========================
// IMAGE IA ANALYSIS (simulated)
// ========================

const IMG_ANALYSES = [
  {
    title: "📷 Imagem analisada — Área de mata",
    text: "Seu Raimundo, pelo que encontrei nessa foto, parece ser uma área com vegetação nativa em bom estado de conservação. Isso é ótimo! Essa área provavelmente faz parte da sua Reserva Legal ou de uma APP. Recomendo manter preservada — ela tem muito valor ambiental e legal, e pode até gerar benefícios pra você no futuro.",
  },
  {
    title: "📷 Imagem analisada — Próximo ao córrego",
    text: "Tem um ponto que merece atenção aqui, Seu Raimundo: essa imagem mostra o que parece ser uma área próxima a um curso d'água. Se for o Córrego São João, pode ser uma APP. Antes de fazer qualquer coisa nessa região, bora conferir juntos as restrições. Assim cê evita dor de cabeça mais pra frente!",
  },
  {
    title: "📷 Imagem analisada — Área de plantio",
    text: "Pelo que encontrei na imagem, parece uma área agrícola em uso. A boa notícia é que não identifiquei nenhum problema visual aparente. Mas lembre, Seu Raimundo: sempre confira se a área tá dentro dos limites permitidos no seu CAR antes de ampliar o cultivo. Assim você fica tranquilo!",
  },
];

function simulateImageUpload() {
  const modal = document.getElementById("modal-imganalysis");
  const content = document.getElementById("img-analysis-content");
  content.innerHTML =
    '<div class="ia-typing"><span></span><span></span><span></span></div><p style="color:#6B7280;font-size:13px;margin-top:12px;text-align:center">Analisando sua imagem...</p>';
  openModal("modal-imganalysis");

  const result = IMG_ANALYSES[Math.floor(Math.random() * IMG_ANALYSES.length)];
  setTimeout(() => {
    content.innerHTML = `
      <div style="margin-bottom:12px;font-size:28px">🌿</div>
      <h4>${result.title}</h4>
      <p style="margin-top:12px">${result.text}</p>
      <button class="btn-listen" style="margin-top:16px" onclick="speakText(this,'${escAttr(result.text)}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
        Ouvir análise
      </button>`;
  }, 2200);
}

// ========================
// DIAGNOSTICO CARDS
// ========================

function expandDiagCard(card) {
  const body = card.querySelector(".dc-body");
  const chevron = card.querySelector(".dc-chevron");
  const isOpen = body.style.display === "block";
  body.style.display = isOpen ? "none" : "block";
  chevron.classList.toggle("rotated", !isOpen);
}

// ========================
// SIMULATOR
// ========================

const SIM_RESULTS = {
  "ampliar cultivo": {
    icon: "🌱",
    title: "E se eu ampliar o cultivo?",
    text: `<p>Pelo que encontrei aqui na sua propriedade, ainda tem espaço pra ampliar o cultivo, Seu Raimundo — mas é importante respeitar os limites certos.</p>
    <p style="margin-top:10px"><strong>O que dá pra fazer:</strong> Ampliar em direção ao norte da propriedade, longe do córrego. Por ali tá livre.</p>
    <p style="margin-top:8px"><strong>O que não pode:</strong> Avançar sobre a Reserva Legal (48 ha) ou sobre a APP do córrego (12 ha). Isso a lei não permite.</p>
    <p style="margin-top:8px">Assim cê evita dor de cabeça mais pra frente! ✅</p>`,
  },
  "recuperar vegetação": {
    icon: "🌿",
    title: "E se eu recuperar a vegetação?",
    text: `<p>Essa é uma ótima ideia, Seu Raimundo! Recuperar a vegetação na área da APP pode ser exatamente o que cê precisa pra regularizar a situação do córrego.</p>
    <p style="margin-top:10px"><strong>Benefícios:</strong> Regularização ambiental, acesso a crédito rural e programas do governo que pagam pra quem preserva.</p>
    <p style="margin-top:8px"><strong>Como fazer:</strong> Pode ser por regeneração natural — só deixar a natureza agir, sem plantar nada — ou por plantio de mudas nativas da região.</p>
    <p style="margin-top:8px">Bora conferir as opções que se encaixam no seu caso? ✅</p>`,
  },
  "dividir a propriedade": {
    icon: "📋",
    title: "E se eu dividir a propriedade?",
    text: `<p>Tem um ponto que merece atenção aqui, Seu Raimundo. Dividir uma propriedade rural exige cuidado com a parte ambiental. Cada pedazo precisaria ter o próprio CAR e manter a proporção de Reserva Legal.</p>
    <p style="margin-top:10px"><strong>Ponto de atenção:</strong> Com 245 ha, uma divisão pode complicar o cumprimento da Reserva Legal em cada parte separada.</p>
    <p style="margin-top:8px">Recomendo conversar com um técnico rural antes de tomar essa decisão. Bora resolver isso juntos antes de dar qualquer passo!</p>`,
  },
  "nova atividade produtiva": {
    icon: "🏢",
    title: "E se eu instalar nova atividade?",
    text: `<p>Depende muito do tipo de atividade, Seu Raimundo! Pra instalar coisas novas na propriedade — galpões, tanques, chiqueiros — cê precisa checar algumas coisas antes:</p>
    <p style="margin-top:10px">✅ Se a área tá fora da APP e da Reserva Legal<br>✅ Se não tem restrição no zoneamento do município<br>⚠️ Algumas atividades precisam de licença ambiental</p>
    <p style="margin-top:8px">A boa notícia é que sua situação cadastral tá ok. Bora conferir o que se aplica ao seu caso específico!</p>`,
  },
};

function showSimResult(type) {
  const r = SIM_RESULTS[type];
  if (!r) return;
  const content = document.getElementById("modal-sim-content");
  content.innerHTML = `
    <div style="font-size:32px;margin-bottom:12px">${r.icon}</div>
    <h3 style="font-size:17px;font-weight:700;color:#1a1a2e;margin-bottom:14px">${r.title}</h3>
    <div style="font-size:13px;color:#6B7280;line-height:1.7">${r.text}</div>`;
  openModal("modal-sim");
}

// ========================
// AREA DETAIL
// ========================

const AREA_DETAILS = {
  app: {
    icon: "💧",
    title: "APP — Área de Preservação Permanente",
    status: "warn",
    statusText: "⚠ Requer atenção",
    oque: 'É a faixa de terra ao redor de rios, córregos e nascentes que a lei protege. Pensa como uma "beira de água" que precisa ficar preservada pra proteger o córrego.',
    como: "Encontramos uma área de preservação próxima ao Córrego São João. Tem um ponto que merece atenção antes de qualquer plantio ali, Seu Raimundo.",
    fazer:
      "Antes de fazer qualquer coisa nessa área, bora conferir juntos as restrições. Assim cê evita dor de cabeça mais pra frente. Você não tá sozinho nisso!",
  },
  rl: {
    icon: "🌿",
    title: "Reserva Legal",
    status: "ok",
    statusText: "✓ Compatível",
    oque: 'É aquela área da propriedade que a lei exige manter com vegetação nativa. É como se fosse uma parte da terra que fica "guardada" pra natureza.',
    como: "Sua Reserva Legal de 48 hectares tá compatível com a legislação da Caatinga — que exige 20% da área. Pode ficar tranquilo com essa parte, tá tudo certo!",
    fazer:
      "Continue mantendo a vegetação dessa área preservada. Ela é fundamental pra regularidade do seu CAR e ainda ajuda a proteger a água da propriedade.",
  },
  veg: {
    icon: "🌲",
    title: "Vegetação Nativa",
    status: "ok",
    statusText: "✓ 62 ha identificados",
    oque: "É a mata original da região, sem interferência humana. Essa vegetação é muito valiosa — tanto pra natureza quanto pra regularização da propriedade.",
    como: "Identificamos 62 hectares de vegetação nativa na sua propriedade. Excelente, Seu Raimundo! Isso é um diferencial muito bom.",
    fazer:
      "Continue preservando essa área. Ela conta muito pra regularização ambiental e no futuro pode até gerar créditos ambientais — que é dinheiro no bolso por preservar.",
  },
  cad: {
    icon: "📋",
    title: "Situação Cadastral (CAR)",
    status: "ok",
    statusText: "✓ Ativo e identificado",
    oque: 'O CAR é o registro da sua propriedade rural no sistema do governo federal. É como o "documento de identidade" da sua terra no sistema ambiental. Todo imóvel rural precisa ter.',
    como: "Seu cadastro tá identificado e ativo, sem sobreposições relevantes encontradas. Ótimo, Seu Raimundo! Isso é o primeiro passo pra tudo ficar em ordem.",
    fazer:
      "Mantenha os dados sempre atualizados no SICAR quando houver mudanças na propriedade. Isso evita problema mais pra frente e garante acesso a programas do governo.",
  },
};

function showAreaDetail(type) {
  const d = AREA_DETAILS[type];
  if (!d) return;
  const content = document.getElementById("modal-area-content");
  content.innerHTML = `
    <div style="font-size:32px;margin-bottom:8px">${d.icon}</div>
    <h3 style="font-size:17px;font-weight:700;color:#FFFFFF;margin-bottom:6px">${d.title}</h3>
    <div style="margin-bottom:16px">
      <span class="prop-status-badge ${d.status}" style="padding:6px 14px;border-radius:50px;font-size:12px;font-weight:600;background:${d.status === "ok" ? "#ecfdf5" : "#fffbeb"};color:${d.status === "ok" ? "#3A8C68" : "#F59E0B"}">${d.statusText}</span>
    </div>
    <div class="dc-row" style="margin-bottom:10px"><strong>O que é:</strong> ${d.oque}</div>
    <div class="dc-row" style="margin-bottom:10px"><strong>Como está:</strong> ${d.como}</div>
    <div class="dc-row" style="margin-bottom:16px"><strong>O que fazer:</strong> ${d.fazer}</div>`;
  openModal("modal-area");
}

// ========================
// MAP INTERACTIONS v2
// ========================

// Estado da seleção atual no mapa
let currentMapArea = null;
let audioGuideEnabled = false;
let lastNarratedArea = null;

// Banco de dados enriquecido por área do mapa
const AREA_DATA = {
  app: {
    title: "Beira protegida do rio",
    titleTech: "APP — Área de Preservação Permanente",
    status: "crit",
    statusIcon: "🔴",
    statusText: "Área Protegida",
    meaning:
      "É a faixa de terra ao redor do rio. A lei pede pra manter o mato ali pra proteger a água do Córrego São João.",
    can: [
      "Recuperar a vegetação com mudas nativas",
      "Manter a área exatamente como está",
      "Fazer manejo com orientação técnica",
    ],
    cant: [
      "Abrir novo cultivo",
      "Tirar a vegetação sem autorização",
      "Construir sem licença ambiental",
      "Tocar fogo na área",
    ],
    cautions: [
      "Construções existentes precisam ser regularizadas",
      "Recuperar essa área pode dar direito a crédito rural",
    ],
    questions: [
      {
        icon: "🌱",
        text: "Posso plantar aqui?",
        send: "Posso plantar na APP do Córrego São João?",
      },
      {
        icon: "🐄",
        text: "Posso criar gado?",
        send: "Posso criar gado na APP do Córrego São João?",
      },
      {
        icon: "🏠",
        text: "Posso construir?",
        send: "Posso construir na APP do Córrego São João?",
      },
      {
        icon: "💰",
        text: "Tem risco de multa?",
        send: "Tem risco de multa se mexer na APP?",
      },
    ],
    whyText:
      "Pense na beira do rio como o 'cinto de segurança' do Córrego São João. Mesmo quando não tem enchente, ele tá ali protegendo a água que você usa. A lei protege essa faixa porque sem ela o rio seca, a terra erode e você pode até perder o crédito rural. É como o portão da sua casa — tem que ficar fechado pra manter tudo seguro dentro.",
  },
  rl: {
    title: "Mato preservado",
    titleTech: "Reserva Legal — 48 ha",
    status: "ok",
    statusIcon: "🟢",
    statusText: "Tudo certo",
    meaning:
      "É uma parte da sua terra que a lei pede pra manter com a natureza. Como se fosse um pedaço da fazenda que fica 'guardado' pras árvores, bichos e nascentes.",
    can: [
      "Manter a vegetação como está",
      "Colher produtos não-madeireiros (castanha, frutas)",
      "Fazer pesquisa ou turismo rural",
    ],
    cant: [
      "Tirar o mato pra abrir cultivo",
      "Tocar fogo",
      "Construir (exceto moradia do caseiro, com licença)",
    ],
    cautions: [
      "Pode gerar créditos ambientais se mantida por muitos anos",
      "Sua Reserva Legal tá no tamanho certo: 20% (regra da Caatinga)",
    ],
    questions: [
      {
        icon: "📏",
        text: "Tá no tamanho certo?",
        send: "Minha Reserva Legal tá no tamanho certo?",
      },
      {
        icon: "💰",
        text: "Posso ganhar dinheiro?",
        send: "Como ganhar dinheiro com a Reserva Legal?",
      },
      {
        icon: "🔨",
        text: "Posso desmatar?",
        send: "Posso desmatar parte da Reserva Legal?",
      },
      {
        icon: "🌳",
        text: "O que pode crescer ali?",
        send: "Que tipo de planta pode crescer na Reserva Legal?",
      },
    ],
    whyText:
      "A Reserva Legal é como uma 'poupança verde' da sua fazenda. Você não usa hoje, mas ela te garante benefícios no futuro: água na propriedade, créditos ambientais, acesso a programas do governo e proteção da terra. Sem ela, sua propriedade fica fraca — como uma casa sem fundação.",
  },
  cult: {
    title: "Área de cultivo",
    titleTech: "Área Produtiva — 185 ha",
    status: "ok",
    statusIcon: "🟢",
    statusText: "Tudo certo",
    meaning:
      "Aqui é onde a mágica acontece: é sua área de trabalho, onde cê planta e produz. Boa parte da sua renda vem daqui.",
    can: [
      "Plantar as culturas do seu planejamento",
      "Ampliar dentro dos limites atuais",
      "Construir benfeitorias (galpão, silo) com licença",
    ],
    cant: [
      "Avançar sobre a Reserva Legal",
      "Avançar sobre a APP do Córrego São João",
      "Tocar fogo pra limpar o terreno",
    ],
    cautions: [
      "Considere rotação de culturas pra preservar o solo",
      "Considere técnicas de conservação de água",
    ],
    questions: [
      {
        icon: "🌽",
        text: "Posso ampliar?",
        send: "Posso ampliar minha área de cultivo?",
      },
      {
        icon: "💧",
        text: "Como economizar água?",
        send: "Como economizar água no cultivo?",
      },
      {
        icon: "🪵",
        text: "Posso desmatar?",
        send: "Posso desmatar parte da minha área de cultivo?",
      },
      {
        icon: "🌱",
        text: "Qual cultura é boa?",
        send: "Qual cultura é boa pra minha região?",
      },
    ],
    whyText:
      "Sua área de cultivo é como o coração da sua fazenda: ela precisa bater forte, mas com cuidado. Cuidar do solo, da água e respeitar os limites é o que faz essa terra render por muitos anos — pros seus filhos e netos.",
  },
  water: {
    title: "Córrego São João",
    titleTech: "Curso d'água natural",
    status: "warn",
    statusIcon: "💧",
    statusText: "Beira protegida",
    meaning:
      "Esse é o Córrego São João — a água que passa na sua propriedade. Ao redor dele existe uma faixa de proteção obrigatória (a APP).",
    can: [
      "Beber a água (com cuidado e tratamento)",
      "Usar para irrigação (com outorga)",
      "Pescar (respeitando regras)",
    ],
    cant: [
      "Tocar fogo na beira",
      "Poluir com esgoto, agroquímicos ou lixo",
      "Desviar o curso sem autorização",
      "Remover vegetação da APP (30m)",
    ],
    cautions: [
      "Se a água diminuir muito, vale pedir outorga",
      "A APP ao redor é o que mantém o córrego vivo",
    ],
    questions: [
      {
        icon: "💧",
        text: "Posso usar a água?",
        send: "Posso usar a água do Córrego São João pra irrigar?",
      },
      {
        icon: "🚿",
        text: "Preciso de autorização?",
        send: "Preciso de autorização pra usar água do rio?",
      },
      {
        icon: "🐟",
        text: "Posso pescar?",
        send: "Posso pescar no Córrego São João?",
      },
      {
        icon: "🌊",
        text: "Por que tá diminuindo?",
        send: "Por que o Córrego São João tá diminuindo?",
      },
    ],
    whyText:
      "O Córrego São João é como a veia da sua propriedade. Se você cuidar da beira (da APP), ele continua forte. Se tirar a vegetação ao redor, ele vai sumir aos poucos — e a água da sua casa, do seu gado, do seu cultivo também. É uma herança que você passa pros seus filhos.",
  },
  boundary: {
    title: "Limite da propriedade",
    titleTech: "Perímetro do CAR — 245 ha",
    status: "ok",
    statusIcon: "🟢",
    statusText: "Identificado",
    meaning:
      "É a 'cerca invisível' que mostra onde sua propriedade começa e termina. Tudo o que tá dentro dessa linha é seu — e tudo que tá fora, é do vizinho ou do governo.",
    can: [
      "Cercar a propriedade",
      "Construir aceiros (faixas de proteção contra fogo)",
      "Atualizar dados do CAR sempre que mudar",
    ],
    cant: [
      "Avançar pra dentro da terra do vizinho",
      "Avançar pra área pública sem permissão",
      "Tirar marcos divisórios",
    ],
    cautions: [
      "Mantenha seu CAR sempre atualizado no SICAR",
      "Seu imóvel tá com 245 ha registrados",
    ],
    questions: [
      {
        icon: "📋",
        text: "Como atualizar o CAR?",
        send: "Como atualizar meu CAR?",
      },
      {
        icon: "📐",
        text: "Posso vender parte?",
        send: "Posso vender parte da minha propriedade?",
      },
      {
        icon: "🪧",
        text: "Preciso de cerca?",
        send: "Preciso cercar toda a propriedade?",
      },
      {
        icon: "🏘️",
        text: "Vizinho invadiu?",
        send: "O que faço se o vizinho invadiu minha terra?",
      },
    ],
    whyText:
      "O limite da propriedade é como a 'certidão de nascimento' da sua terra: ele mostra pro mundo o que é seu. Manter os marcos no lugar e o CAR atualizado evita briga com vizinho e garante acesso a benefícios do governo.",
  },
};

// Matriz do simulador contextual: ação × área
const SIM_MAP_ACTIONS = {
  "plantar": {
    icon: "🌱",
    label: "Plantar milho",
  },
  "construir": {
    icon: "🏠",
    label: "Construir",
  },
  "estrada": {
    icon: "🚜",
    label: "Abrir estrada",
  },
  "gado": {
    icon: "🐄",
    label: "Criar gado",
  },
  "recuperar": {
    icon: "🌳",
    label: "Recuperar vegetação",
  },
  "lenha": {
    icon: "🪵",
    label: "Tirar lenha",
  },
};

const SIM_MAP_RESULTS = {
  app: {
    plantar: {
      level: "crit",
      icon: "❌",
      levelText: "Não recomendado",
      title: "Plantar milho aqui não é boa ideia",
      motivo:
        "Esta área é a APP do Córrego São João — a faixa que a lei protege ao redor do rio. Abrir cultivo aqui pode gerar multa de até R$ 50.000 por hectare, impedir crédito rural e até causar processo.",
      alternativas: [
        "Use a área verde de cultivo (185 ha) — tem espaço de sobra",
        "Plante na direção norte, longe do rio",
        "Recupere a vegetação aqui e ganhe crédito ambiental",
      ],
    },
    construir: {
      level: "crit",
      icon: "❌",
      levelText: "Não recomendado",
      title: "Construir aqui exige licença e quase sempre é negado",
      motivo:
        "A APP é área de preservação. Construir nela sem autorização é crime ambiental (Lei 9.605). Pode gerar multa pesada e demolição.",
      alternativas: [
        "Construa na área de cultivo",
        "Consulte um técnico ambiental pra ver exceções",
        "Solicite análise ao órgão ambiental",
      ],
    },
    estrada: {
      level: "crit",
      icon: "❌",
      levelText: "Não recomendado",
      title: "Abrir estrada aqui prejudica o rio",
      motivo:
        "Estradas na APP compactam o solo, matam a vegetação e podem assorear o Córrego São João. A água pode sumir em poucos anos.",
      alternativas: [
        "Passe ao lado da APP, sem cortar",
        "Faça pontes com licenciamento ambiental",
        "Consulte a prefeitura sobre estradas rurais",
      ],
    },
    gado: {
      level: "crit",
      icon: "❌",
      levelText: "Não recomendado",
      title: "Gado aqui compacta o solo e polui o rio",
      motivo:
        "O pisoteamento do gado na APP destrói a vegetação que protege o córrego. O esterco e a urina poluem a água. Em pouco tempo, o rio pode secar.",
      alternativas: [
        "Mantenha o gado na área de cultivo com cerca",
        "Faça piquetes rotacionados longe do rio",
        "Recupere a APP e ganhe benefícios ambientais",
      ],
    },
    recuperar: {
      level: "ok",
      icon: "✅",
      levelText: "Ótima escolha!",
      title: "Recuperar a vegetação aqui é a melhor decisão",
      motivo:
        "Plantar mudas nativas (ou deixar a natureza se recuperar sozinha) regulariza a APP, protege o Córrego São João e abre portas pra crédito rural e programas ambientais do governo.",
      alternativas: [
        "Use mudas nativas da Caatinga",
        "Consulte técnicos da EMATER local",
        "Pode gerar PSA (Pagamento por Serviços Ambientais)",
      ],
    },
    lenha: {
      level: "crit",
      icon: "❌",
      levelText: "Não recomendado",
      title: "Retirar lenha aqui é crime ambiental",
      motivo:
        "A APP é área protegida. Cortar árvores, mesmo pra lenha, gera multa pesada e processo criminal. Pode perder o CAR e o crédito rural.",
      alternativas: [
        "Use lenha de áreas autorizadas da sua propriedade",
        "Plante árvores de corte em áreas de cultivo",
        "Considere fogões mais eficientes",
      ],
    },
  },
  rl: {
    plantar: {
      level: "crit",
      icon: "❌",
      levelText: "Não recomendado",
      title: "Plantar na Reserva Legal não é permitido",
      motivo:
        "A Reserva Legal existe pra preservar a vegetação nativa. Abrir cultivo aqui reduz sua proteção ambiental, pode cancelar seu CAR e impedir acesso a programas do governo.",
      alternativas: [
        "Expanda na área de cultivo (tem espaço)",
        "Consulte um técnico sobre uso sustentável",
        "Explore produtos não-madeireiros (castanha, mel)",
      ],
    },
    construir: {
      level: "warn",
      icon: "⚠️",
      levelText: "Permitido com condições",
      title: "Construir aqui é restrito",
      motivo:
        "Construções na Reserva Legal são permitidas só em casos especiais (moradia do caseiro, por exemplo) e exigem licença ambiental específica.",
      alternativas: [
        "Construa na área de cultivo",
        "Consulte a Secretaria de Meio Ambiente",
        "Avalie técnicas de construção de baixo impacto",
      ],
    },
    estrada: {
      level: "warn",
      icon: "⚠️",
      levelText: "Permitido com condições",
      title: "Estrada aqui precisa de autorização",
      motivo:
        "A Reserva Legal pode ser atravessada por estradas, mas exige projeto técnico aprovado pelo órgão ambiental. Sem autorização, é infração.",
      alternativas: [
        "Passe ao lado da Reserva, quando possível",
        "Solicite licença prévia ao órgão ambiental",
        "Use técnicas de menor impacto (pontes, bueiros)",
      ],
    },
    gado: {
      level: "warn",
      icon: "⚠️",
      levelText: "Permitido com condições",
      title: "Gado pode entrar, mas com manejo",
      motivo:
        "A Reserva Legal pode receber gado em sistema silvipastoril (com árvores), mas o pisoteamento direto degrada a vegetação. O ideal é manter a área livre.",
      alternativas: [
        "Use áreas de cultivo pra pasto",
        "Considere sistemas integrados (ILPF)",
        "Mantenha a Reserva sem gado, se possível",
      ],
    },
    recuperar: {
      level: "ok",
      icon: "✅",
      levelText: "Excelente escolha",
      title: "Sua Reserva Legal já tá em bom estado",
      motivo:
        "A boa notícia é que essa área já tá preservada e compatível com a legislação. Continuar mantendo é o melhor caminho — você ainda pode ganhar créditos ambientais.",
      alternativas: [
        "Mantenha como está — já tá ótimo",
        "Cadastre a área pra programas de PSA",
        "Documente com fotos pra futuro CAR",
      ],
    },
    lenha: {
      level: "crit",
      icon: "❌",
      levelText: "Não permitido",
      title: "Tirar lenha da Reserva Legal é proibido",
      motivo:
        "Corte de árvores na Reserva Legal é infração ambiental grave, mesmo que pareça pouca quantidade. Pode gerar multa e processo.",
      alternativas: [
        "Use lenha de áreas autorizadas (reflorestamento)",
        "Considere fontes alternativas de energia",
        "Plante árvores de corte em áreas permitidas",
      ],
    },
  },
  cult: {
    plantar: {
      level: "ok",
      icon: "✅",
      levelText: "Pode plantar!",
      title: "Aqui é sua área de cultivo principal",
      motivo:
        "Boa notícia, Seu Raimundo: essa é a área onde você pode plantar tranquilo, desde que mantenha os limites (não avance sobre a Reserva Legal nem sobre a APP).",
      alternativas: [
        "Planeje rotação de culturas",
        "Considere técnicas de conservação do solo",
        "Documente sua produção com fotos",
      ],
    },
    construir: {
      level: "ok",
      icon: "✅",
      levelText: "Pode, com licença",
      title: "Construir aqui é permitido (com licença)",
      motivo:
        "Construir na área de cultivo é permitido, mas exige licença ambiental prévia pra obras maiores (galpão, silo, casa). Pra obras pequenas (cerca, bebedouro), geralmente não precisa.",
      alternativas: [
        "Consulte a prefeitura sobre a obra",
        "Solicite licença prévia se for o caso",
        "Documente a obra no CAR depois",
      ],
    },
    estrada: {
      level: "ok",
      icon: "✅",
      levelText: "Pode, com cuidado",
      title: "Abrir estrada interna aqui é tranquilo",
      motivo:
        "Estradas internas na área de cultivo são permitidas, mas precisam respeitar as curvas de nível pra evitar erosão e não podem cortar a APP ou a Reserva Legal.",
      alternativas: [
        "Siga as curvas de nível do terreno",
        "Faça bueiros nos pontos de água",
        "Documente a estrada no CAR",
      ],
    },
    gado: {
      level: "ok",
      icon: "✅",
      levelText: "Pode!",
      title: "Aqui é bom lugar pro gado",
      motivo:
        "Sua área de cultivo pode receber pasto e gado, desde que você mantenha os limites da propriedade e respeite a APP e a Reserva Legal.",
      alternativas: [
        "Considere piquetes rotacionados",
        "Mantenha água limpa pro gado",
        "Documente o rebanho e a pastagem",
      ],
    },
    recuperar: {
      level: "warn",
      icon: "⚠️",
      levelText: "Talvez não precise",
      title: "Essa área já tá em uso produtivo",
      motivo:
        "Recuperar vegetação aqui significa parar de cultivar. A Reserva Legal já cumpre esse papel — não é necessário recuperar mais áreas de produção.",
      alternativas: [
        "Mantenha a Reserva Legal pra essa função",
        "Considere técnicas agroflorestais",
        "Use sistemas integrados (ILPF)",
      ],
    },
    lenha: {
      level: "warn",
      icon: "⚠️",
      levelText: "Cuidado com a origem",
      title: "Tire lenha só de áreas autorizadas",
      motivo:
        "Se a lenha vem da sua área de cultivo (onde tem árvores plantadas), tudo certo. Se vem da APP ou da Reserva Legal, é proibido.",
      alternativas: [
        "Plante árvores de corte em áreas permitidas",
        "Documente a origem da lenha",
        "Considere fontes alternativas",
      ],
    },
  },
  water: {
    plantar: {
      level: "crit",
      icon: "❌",
      levelText: "Não recomendado",
      title: "Plantar na água não faz sentido",
      motivo:
        "Plantar dentro do leito do rio é impossível e proibido. Plante na APP (que é a faixa ao redor do rio) só se for pra recuperação.",
      alternativas: [
        "Plante na APP só pra recuperar",
        "Use a área de cultivo principal",
        "Consulte um técnico sobre uso sustentável",
      ],
    },
    construir: {
      level: "crit",
      icon: "❌",
      levelText: "Proibido",
      title: "Construir dentro do rio é crime",
      motivo:
        "Edificações dentro de cursos d'água são proibidas e podem causar enchentes, além de destruir o habitat de peixes e outros bichos.",
      alternativas: [
        "Construa longe do rio (mínimo 30m)",
        "Faça pontes com licenciamento",
        "Consulte o órgão ambiental",
      ],
    },
    estrada: {
      level: "crit",
      icon: "❌",
      levelText: "Proibido",
      title: "Passar por cima do rio exige ponte",
      motivo:
        "Estradas não podem cruzar o leito do rio diretamente. É preciso construir pontes ou bueiros com licenciamento ambiental.",
      alternativas: [
        "Construa uma ponte autorizada",
        "Faça um bueiro com projeto técnico",
        "Passe ao lado do rio, sem atravessar",
      ],
    },
    gado: {
      level: "warn",
      icon: "⚠️",
      levelText: "Cuidado",
      title: "Gado no rio polui a água",
      motivo:
        "Deixar gado beber direto no rio polui a água com esterco e urina. O pisoteamento também erode as margens e pode destruir o leito.",
      alternativas: [
        "Faça bebedouros artificiais longe do rio",
        "Cerque a margem pra impedir acesso",
        "Mantenha a APP preservada",
      ],
    },
    recuperar: {
      level: "ok",
      icon: "✅",
      levelText: "Ótima ideia",
      title: "Recuperar a APP é proteger o rio",
      motivo:
        "Plantar mudas nativas na faixa de APP ao redor do rio (e não no leito) é a melhor forma de cuidar do Córrego São João. Água boa pra sempre.",
      alternativas: [
        "Plante mudas nativas da Caatinga",
        "Consulte a EMATER local",
        "Pode gerar PSA (Pagamento por Serviços Ambientais)",
      ],
    },
    lenha: {
      level: "crit",
      icon: "❌",
      levelText: "Proibido",
      title: "Retirar lenha da APP é crime",
      motivo:
        "Cortar árvores na APP do Córrego São João é infração grave. Pode gerar multa pesada e processo criminal.",
      alternativas: [
        "Plante árvores em áreas autorizadas",
        "Use lenha de reflorestamento",
        "Considere fontes alternativas",
      ],
    },
  },
  boundary: {
    plantar: {
      level: "warn",
      icon: "⚠️",
      levelText: "Atenção aos limites",
      title: "Plante dentro da sua cerca",
      motivo:
        "Plantar dentro da sua propriedade é tranquilo. Mas se ultrapassar o limite (a cerca), você tá ocupando terra alheia ou pública, e isso gera problema.",
      alternativas: [
        "Respeite os marcos divisórios",
        "Consulte o CAR atualizado",
        "Documente a área plantada",
      ],
    },
    construir: {
      level: "warn",
      icon: "⚠️",
      levelText: "Respeite o limite",
      title: "Construir perto do limite exige cuidado",
      motivo:
        "Construções devem respeitar recuos mínimos (geralmente 5m do limite). Construir na linha divisória gera problema com o vizinho e pode exigir demolição.",
      alternativas: [
        "Mantenha recuo de pelo menos 5m do limite",
        "Consulte a prefeitura sobre recuos",
        "Comunique o vizinho sobre a obra",
      ],
    },
    estrada: {
      level: "ok",
      icon: "✅",
      levelText: "Pode, com limite",
      title: "Estrada interna, sem cruzar o limite",
      motivo:
        "Estradas dentro da sua propriedade são permitidas. Atravessar o limite exige acordo com o vizinho e/ou autorização legal.",
      alternativas: [
        "Mantenha a estrada dentro da sua terra",
        "Acorde com o vizinho se precisar atravessar",
        "Documente servidões de passagem",
      ],
    },
    gado: {
      level: "ok",
      icon: "✅",
      levelText: "Pode",
      title: "Pasto dentro da propriedade, ok",
      motivo:
        "Criar gado dentro da sua cerca é permitido. Cuidado pra não invadir terra do vizinho — o gado gosta de passear.",
      alternativas: [
        "Mantenha cercas em bom estado",
        "Considere piquetes rotacionados",
        "Documente o rebanho",
      ],
    },
    recuperar: {
      level: "warn",
      icon: "⚠️",
      levelText: "Talvez não precise",
      title: "As áreas de preservação já cumprem esse papel",
      motivo:
        "Recuperar a faixa de limite não é obrigatório, e geralmente não traz benefício ambiental. O ideal é manter a Reserva Legal e a APP preservadas.",
      alternativas: [
        "Foque na APP e na Reserva Legal",
        "Considere técnicas agroflorestais",
        "Plante árvores de corte em áreas permitidas",
      ],
    },
    lenha: {
      level: "warn",
      icon: "⚠️",
      levelText: "Cuidado com a origem",
      title: "Tire lenha só de áreas autorizadas",
      motivo:
        "Tirar lenha dentro da sua propriedade, em áreas autorizadas, é permitido. Nunca tire da APP ou da Reserva Legal.",
      alternativas: [
        "Use áreas de cultivo com árvores plantadas",
        "Documente a origem da lenha",
        "Considere fontes alternativas",
      ],
    },
  },
};

// Inicialização do mapa
document.addEventListener("DOMContentLoaded", () => {
  const mapEl = document.getElementById("property-map");
  if (!mapEl) return;

  // Vincular tap em qualquer elemento com data-area (polígonos + pins)
  document.querySelectorAll("[data-area]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const key = el.getAttribute("data-area");
      if (key) selectMapArea(key);
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const key = el.getAttribute("data-area");
        if (key) selectMapArea(key);
      }
    });
  });

  // Tap no fundo do mapa = limpar seleção
  mapEl.addEventListener("click", (e) => {
    if (e.target === mapEl) clearMapSelection();
  });

  // Áudio guiado: narrar ao arrastar o dedo/mouse
  let narrateTimer = null;
  mapEl.addEventListener("mousemove", (e) => {
    if (!audioGuideEnabled) return;
    clearTimeout(narrateTimer);
    narrateTimer = setTimeout(() => {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target) return;
      const areaEl = target.closest("[data-area]");
      if (!areaEl) return;
      const key = areaEl.getAttribute("data-area");
      if (key && key !== lastNarratedArea) {
        lastNarratedArea = key;
        const data = AREA_DATA[key];
        if (data) speakText(null, data.title + ". " + data.statusText + ".");
      }
    }, 350);
  });

  // Monta o conteúdo do modal de ajuda (legenda explicativa)
  const helpLegend = document.getElementById("map-help-legend");
  if (helpLegend) {
    helpLegend.innerHTML = `
      <div class="map-legend-item"><button onclick="openLegendInfo('free')"><span class="legend-color" style="background:#ecfdf5;border:2px solid #10b981"></span><span>🟢 Área livre — pode plantar e usar</span></button></div>
      <div class="map-legend-item"><button onclick="openLegendInfo('attention')"><span class="legend-color" style="background:#fffbeb;border:2px solid #f59e0b"></span><span>🟡 Atenção — tem restrição</span></button></div>
      <div class="map-legend-item"><button onclick="openLegendInfo('protected')"><span class="legend-color" style="background:#fef2f2;border:2px solid #dc2626"></span><span>🔴 Área protegida — não mexer</span></button></div>
      <div class="map-legend-item"><button onclick="openLegendInfo('water')"><span class="legend-color" style="background:#e0f2fe;border:2px solid #0ea5e9"></span><span>🔵 Beira de rio — APP</span></button></div>
      <div class="map-legend-item"><button onclick="openLegendInfo('forest')"><span class="legend-color" style="background:#dcfce7;border:2px solid #16a34a"></span><span>🌳 Mato preservado — Reserva Legal</span></button></div>
    `;
  }
});

// ==== Funções do mapa ====

function selectMapArea(areaKey) {
  const data = AREA_DATA[areaKey];
  if (!data) return;

  currentMapArea = areaKey;

  // Aplicar realce visual em todas as áreas/pins
  document.querySelectorAll(".map-area").forEach((el) => {
    el.classList.remove("map-area-highlight");
    if (el.getAttribute("data-area") === areaKey) {
      el.classList.add("map-area-highlight");
      el.classList.remove("map-area-dimmed");
    } else {
      el.classList.add("map-area-dimmed");
      el.classList.remove("map-area-highlight");
    }
  });

  // Atualizar pins (destacar o pin correspondente)
  document.querySelectorAll(".map-pin").forEach((pin) => {
    const pinArea = pin.getAttribute("data-area");
    if (pinArea === areaKey) {
      pin.style.opacity = "1";
      pin.style.transform = "scale(1.15)";
      pin.style.transformBox = "fill-box";
      pin.style.transformOrigin = "center";
    } else if (pin.classList.contains("map-pin--alert") && areaKey !== "app") {
      // mantém alerta visível
      pin.style.opacity = "0.7";
    } else {
      pin.style.opacity = "0.55";
    }
  });

  // Popular painel contextual
  document.getElementById("map-panel-status-icon").textContent = data.statusIcon;
  document.getElementById("map-panel-status-text").textContent = data.statusText;
  document.getElementById("map-panel-status").className =
    "map-panel-status map-panel-status--" + data.status;
  document.getElementById("map-panel-title").textContent = data.title;
  document.getElementById("map-panel-title-tech").textContent = data.titleTech;
  document.getElementById("map-panel-meaning").textContent = data.meaning;

  // Listas
  document.getElementById("map-panel-can").innerHTML = data.can
    .map((t) => `<li><span>${escHtml(t)}</span></li>`)
    .join("");
  document.getElementById("map-panel-cant").innerHTML = data.cant
    .map((t) => `<li><span>${escHtml(t)}</span></li>`)
    .join("");

  // Atenção (opcional)
  const cautionsEl = document.getElementById("map-panel-cautions");
  const cautionsTitle = document.getElementById("map-panel-cautions-title");
  if (data.cautions && data.cautions.length > 0) {
    cautionsEl.innerHTML = data.cautions
      .map((t) => `<li><span>${escHtml(t)}</span></li>`)
      .join("");
    cautionsTitle.style.display = "block";
    cautionsEl.style.display = "block";
  } else {
    cautionsTitle.style.display = "none";
    cautionsEl.style.display = "none";
  }

  // Perguntas rápidas (chips)
  document.getElementById("map-panel-questions").innerHTML = data.questions
    .map(
      (q) =>
        `<button class="map-question-chip" onclick="sendQuickQuestion(this, '${escAttr(q.send)}')"><span aria-hidden="true">${q.icon}</span><span>${escHtml(q.text)}</span></button>`,
    )
    .join("");

  // Abrir painel
  document.getElementById("map-panel").style.display = "flex";
}

function clearMapSelection() {
  currentMapArea = null;
  document.getElementById("map-panel").style.display = "none";
  document.querySelectorAll(".map-area").forEach((el) => {
    el.classList.remove("map-area-dimmed");
    el.classList.remove("map-area-highlight");
  });
  document.querySelectorAll(".map-pin").forEach((pin) => {
    pin.style.opacity = "";
    pin.style.transform = "";
  });
}

function speakMapPanel() {
  const title = document.getElementById("map-panel-title").textContent;
  const tech = document.getElementById("map-panel-title-tech").textContent;
  const meaning = document.getElementById("map-panel-meaning").textContent;
  const text = `${title}. ${tech}. ${meaning}`;
  speakText(null, text);
}

function sendQuickQuestion(btn, text) {
  clearMapSelection();
  showScreen("screen-ia");
  setTimeout(() => sendSuggestion(btn, text), 350);
}

function goToIaAboutArea() {
  if (!currentMapArea) return;
  const data = AREA_DATA[currentMapArea];
  const prompt = `Me explica melhor sobre ${data.title} (${data.titleTech}).`;
  clearMapSelection();
  showScreen("screen-ia");
  setTimeout(() => sendSuggestion(null, prompt), 350);
}

function openMapSimulator() {
  if (!currentMapArea) return;
  const data = AREA_DATA[currentMapArea];

  let html = `
    <div style="font-size: 32px; margin-bottom: 8px">🧪</div>
    <h3 style="font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 6px;">
      E se eu fizer isso aqui?
    </h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5;">
      Você tá em <strong>${escHtml(data.title)}</strong>. Escolha uma atividade pra ver se pode fazer aqui.
    </p>
    <div class="map-question-grid" style="grid-template-columns: 1fr 1fr;">
  `;

  Object.keys(SIM_MAP_ACTIONS).forEach((actionKey) => {
    const a = SIM_MAP_ACTIONS[actionKey];
    html += `
      <button class="map-question-chip" onclick="showSimMapResult('${currentMapArea}','${actionKey}')">
        <span aria-hidden="true">${a.icon}</span>
        <span>${a.label}</span>
      </button>
    `;
  });

  html += `</div>
    <button class="btn-outline-full" onclick="closeModal('modal-map-sim')" style="margin-top: 16px;">
      Fechar
    </button>
  `;

  document.getElementById("modal-map-sim-content").innerHTML = html;
  openModal("modal-map-sim");
}

function showSimMapResult(areaKey, actionKey) {
  const areaResults = SIM_MAP_RESULTS[areaKey];
  if (!areaResults) return;
  const r = areaResults[actionKey];
  if (!r) return;
  const action = SIM_MAP_ACTIONS[actionKey];

  const html = `
    <div class="sim-result">
      <span class="sim-result-icon" aria-hidden="true">${r.icon}</span>
      <span class="sim-result-level sim-result-level--${r.level}">
        ${r.levelText}
      </span>
      <p class="sim-result-title">${escHtml(r.title)}</p>
      <div class="sim-result-motivo">
        <strong>Por quê:</strong> ${escHtml(r.motivo)}
      </div>
      <p class="sim-result-alts-title">💡 Alternativas</p>
      <ul class="sim-result-alts">
        ${r.alternativas.map((alt) => `<li>${escHtml(alt)}</li>`).join("")}
      </ul>
      <button class="btn-listen" onclick="speakText(null, '${escAttr(r.title)}. ${escAttr(r.motivo)}')" style="margin-top: 12px; background: #f3f4f6; color: var(--text); border: 1.5px solid var(--border); padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
        🔊 Ouvir resposta
      </button>
      <button class="btn-outline-full" onclick="closeModal('modal-map-sim')" style="margin-top: 8px;">
        Entendi
      </button>
    </div>
  `;

  document.getElementById("modal-map-sim-content").innerHTML = html;
}

function openMapWhy() {
  if (!currentMapArea) return;
  const data = AREA_DATA[currentMapArea];

  const html = `
    <div style="font-size: 32px; margin-bottom: 8px">🧠</div>
    <h3 style="font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 6px;">
      Entender o motivo
    </h3>
    <p style="font-size: 12px; color: var(--text-secondary); font-style: italic; margin-bottom: 14px;">
      ${escHtml(data.titleTech)}
    </p>
    <div style="font-size: 15px; color: var(--text); line-height: 1.65; background: #fffbeb; padding: 16px; border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 14px;">
      ${escHtml(data.whyText)}
    </div>
    <button class="btn-listen" onclick="speakText(null, '${escAttr(data.whyText)}')" style="width: 100%; background: #f3f4f6; color: var(--text); border: 1.5px solid var(--border); padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
      🔊 Ouvir analogia
    </button>
    <button class="btn-outline-full" onclick="closeModal('modal-map-why')" style="margin-top: 12px;">
      Entendi
    </button>
  `;

  document.getElementById("modal-map-why-content").innerHTML = html;
  openModal("modal-map-why");
}

function toggleMapAudioGuide() {
  audioGuideEnabled = !audioGuideEnabled;
  const btn = document.getElementById("map-fab-audio");
  if (btn) {
    btn.classList.toggle("map-fab--active", audioGuideEnabled);
  }
  lastNarratedArea = null;
  showToast(audioGuideEnabled ? "🔊 Áudio guiado ativado" : "🔇 Áudio guiado desligado");
}

function openMapHelp() {
  openModal("modal-map-help");
}

function openLegendInfo(key) {
  const legends = {
    free: {
      icon: "🟢",
      title: "Área livre",
      text: "Pode plantar, criar gado e construir (com licença). É onde sua produção acontece sem grandes restrições — desde que respeite os limites da APP, da Reserva Legal e da propriedade.",
    },
    attention: {
      icon: "🟡",
      title: "Atenção",
      text: "Existe alguma restrição ou cuidado especial. Toque na área amarela pra entender o que pode ou não fazer. Geralmente aparece quando a IA identificou algo que merece uma olhada.",
    },
    protected: {
      icon: "🔴",
      title: "Área protegida",
      text: "Aqui a lei é mais forte. Não pode mexer sem autorização. Mexer errado gera multa pesada e pode até cancelar seu CAR. Toque pra entender as regras dessa área.",
    },
    water: {
      icon: "🔵",
      title: "Beira de rio",
      text: "É a faixa ao redor dos rios e córregos — a APP. Tem que ficar com mato preservado. Protege a água da sua propriedade e da vizinhança.",
    },
    forest: {
      icon: "🌳",
      title: "Mato preservado",
      text: "Vegetação nativa que a lei pede pra manter. Pode parecer que não tá 'produzindo', mas tá: protege o solo, a água e ainda pode render dinheiro com crédito ambiental.",
    },
  };
  const l = legends[key];
  if (!l) return;
  const html = `
    <div style="font-size: 56px; text-align: center; margin-bottom: 8px;" aria-hidden="true">${l.icon}</div>
    <h3 style="font-size: 18px; font-weight: 800; color: var(--text); text-align: center; margin-bottom: 12px;">
      ${escHtml(l.title)}
    </h3>
    <p style="font-size: 14px; color: var(--text); line-height: 1.6; margin-bottom: 16px;">
      ${escHtml(l.text)}
    </p>
    <button class="btn-listen" onclick="speakText(null, '${escAttr(l.title)}. ${escAttr(l.text)}')" style="width: 100%; background: #f3f4f6; color: var(--text); border: 1.5px solid var(--border); padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
      🔊 Ouvir explicação
    </button>
    <button class="btn-outline-full" onclick="closeModal('modal-map-legend')" style="margin-top: 12px;">
      Fechar
    </button>
  `;
  document.getElementById("modal-map-legend-content").innerHTML = html;
  openModal("modal-map-legend");
}

// Mantém closeMapPanel como alias (compatibilidade com handlers antigos)
function closeMapPanel() {
  clearMapSelection();
}

// ========================
// COMMUNITY
// ========================

function switchCommTab(btn, tabId) {
  document
    .querySelectorAll(".ctab")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("tab-posts").style.display =
    tabId === "tab-posts" ? "block" : "none";
  document.getElementById("tab-faq").style.display =
    tabId === "tab-faq" ? "block" : "none";
}

function toggleLike(btn) {
  const span = btn.querySelector("span");
  const current = parseInt(span.textContent);
  const liked = btn.dataset.liked === "true";
  span.textContent = liked ? current - 1 : current + 1;
  btn.dataset.liked = !liked;
  btn.style.background = liked ? "" : "#fce4ec";
}

function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = answer.style.display === "block";
  answer.style.display = isOpen ? "none" : "block";
  const svg = btn.querySelector("svg");
  svg.style.transform = isOpen ? "" : "rotate(180deg)";
  svg.style.transition = "transform 0.2s";
}

function showComments() {
  showToast("Comentários em breve!");
}

function showNewPost() {
  openModal("modal-newpost");
}

// ========================
// MODALS
// ========================

function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add("open");
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove("open");
}

// ========================
// TOAST
// ========================

let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

// ========================
// TOGGLE PASSWORD
// ========================

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-pass");
  const passInput = document.getElementById("login-pass");
  if (toggleBtn && passInput) {
    toggleBtn.addEventListener("click", () => {
      passInput.type = passInput.type === "password" ? "text" : "password";
    });
  }

  // Initial greeting
  setGreeting();

  // Hide all screens except splash on load
  document.querySelectorAll(".screen:not(#screen-splash)").forEach((s) => {
    s.style.display = "none";
  });
});

// ---- Splash Screen ----
window.addEventListener("load", () => {
  const splash = document.getElementById("screen-splash");
  if (splash) {
    splash.classList.add("active");
    splash.style.display = "flex";
    // After animation, show login
    setTimeout(() => {
      splash.classList.remove("active");
      splash.style.display = "none";
      // Re-show all screens (CSS will handle opacity via .active)
      document.querySelectorAll(".screen").forEach((s) => {
        s.style.display = "";
      });
      showScreen("screen-login");
    }, 3200);
  }
});

// ========================
// DASHBOARD & DIAGNÓSTICO v3
// ========================

const DASHBOARD_STATUS = {
  ok:       { count: 3, label: "Tá tudo certo",  foot: "Ver detalhes", icon: "🟢", level: "ok",   target: "screen-diagnostico" },
  warn:     { count: 1, label: "Atenção",         foot: "Ver detalhes", icon: "🟡", level: "warn", target: "screen-diagnostico" },
  crit:     { count: 1, label: "Pendências",      foot: "Resolver",     icon: "🔴", level: "crit", target: "screen-diagnostico" },
  proximos: { count: 2, label: "Próximos passos", foot: "Ver lista",    icon: "📄", level: "info", target: "screen-diagnostico" },
};

const DIAG_TIMELINE = [
  { icon: "1️⃣", label: "Imóvel localizado",      date: "14/03", status: "done" },
  { icon: "2️⃣", label: "Dados analisados",        date: "14/03", status: "done" },
  { icon: "3️⃣", label: "Legislação interpretada", date: "14/03", status: "done" },
  { icon: "4️⃣", label: "Diagnóstico pronto",      date: "15/03", status: "done" },
  { icon: "5️⃣", label: "Recomendações geradas",   date: "Hoje",   status: "current" },
];

const DICA_DO_DIA = [
  { icon: "💡", text: "Você sabia? Recuperar a APP do Córrego São João pode render crédito rural pra você." },
  { icon: "🌳", text: "Sua Reserva Legal tá em ordem — isso é raro e muito bom! Continue cuidando." },
  { icon: "💧", text: "A APP é como o 'cinto de segurança' do rio. Mesmo sem enchente, ela tá sempre protegendo." },
  { icon: "🌱", text: "Rotação de culturas ajuda a terra a render por mais tempo — e ainda protege o solo." },
  { icon: "📋", text: "Atualize seu CAR sempre que mudar algo na propriedade. Evita dor de cabeça depois." },
];

let dicaAtual = new Date().getDate() % DICA_DO_DIA.length;

function renderDashboard() {
  const grid = document.getElementById("dashboard-status-grid");
  if (!grid) {
    // O grid antigo de status foi substituído pelo botão
    // .prop-card-summary-btn dentro do .property-card.
    // Garante que a "Dica do dia" continua sendo renderizada.
    renderDica();
    return;
  }

  const cards = [
    DASHBOARD_STATUS.ok,
    DASHBOARD_STATUS.warn,
    DASHBOARD_STATUS.crit,
    DASHBOARD_STATUS.proximos,
  ];

  grid.innerHTML = cards
    .map(
      (c) => `
        <button
          class="status-card status-card--${c.level}"
          onclick="showScreen('${c.target}')"
          aria-label="${c.label}: ${c.count}"
        >
          <div class="status-card-icon" aria-hidden="true">${c.icon}</div>
          <div class="status-card-num">${c.count}</div>
          <div class="status-card-label">${c.label}</div>
          <div class="status-card-foot">${c.foot} →</div>
        </button>
      `
    )
    .join("");

  renderDica();
}

function renderDica() {
  const d = DICA_DO_DIA[dicaAtual];
  const icon = document.getElementById("dica-icon");
  const text = document.getElementById("dica-text");
  if (icon) icon.textContent = d.icon;
  if (text) text.textContent = d.text;
}

function nextDica() {
  dicaAtual = (dicaAtual + 1) % DICA_DO_DIA.length;
  renderDica();
}

function listenDica() {
  const d = DICA_DO_DIA[dicaAtual];
  if (typeof speakText === "function") {
    speakText(null, "Dica do dia. " + d.text);
  }
}

function renderDiagnostico() {
  const therm = document.getElementById("diag-thermometer");
  if (!therm) return;

  const total = 10;
  const okCount = 7;
  const warnCount = 1;
  const critCount = 0;
  const emptyCount = total - okCount - warnCount - critCount;

  // Termômetro — barrinhas
  const bars = document.getElementById("therm-bars");
  if (bars) {
    let html = "";
    for (let i = 0; i < okCount; i++)
      html += `<div class="therm-bar therm-bar--ok"></div>`;
    for (let i = 0; i < warnCount; i++)
      html += `<div class="therm-bar therm-bar--warn"></div>`;
    for (let i = 0; i < critCount; i++)
      html += `<div class="therm-bar therm-bar--crit"></div>`;
    for (let i = 0; i < emptyCount; i++)
      html += `<div class="therm-bar therm-bar--empty"></div>`;
    bars.innerHTML = html;
  }

  // Resumo qualitativo
  const summary = document.getElementById("therm-summary");
  if (summary) {
    if (critCount > 0) {
      summary.textContent =
        "Atenção: tem risco sério. Bora resolver agora.";
    } else if (warnCount > 0) {
      summary.textContent = "Tá bem. Só precisa de 1 cuidado.";
    } else {
      summary.textContent = "Tá tudo certo! Continue assim.";
    }
  }

  // Badge do termômetro
  const badge = document.getElementById("therm-badge");
  if (badge) {
    badge.className =
      "therm-badge" +
      (warnCount > 0
        ? " therm-badge--warn"
        : critCount > 0
        ? " therm-badge--crit"
        : "");
    badge.textContent =
      critCount > 0 ? "Crítico" : warnCount > 0 ? "Atenção" : "Tá certo";
  }

  // Microestatísticas
  const numOk = document.getElementById("therm-num-ok");
  const numWarn = document.getElementById("therm-num-warn");
  const numCrit = document.getElementById("therm-num-crit");
  if (numOk) numOk.textContent = okCount;
  if (numWarn) numWarn.textContent = warnCount;
  if (numCrit) numCrit.textContent = critCount;

  // Atualiza Orie conforme o termômetro
  // - critCount > 0  → preocupado (concerned) — risco sério
  // - warnCount > 0  → alerta — merece atenção
  // - sem pendências → comemorando — tudo certo
  const orieState =
    critCount > 0 ? "concerned" :
    warnCount > 0 ? "alert" :
    "celebrating";
  updateOrieState(orieState);

  // Timeline
  const tl = document.getElementById("diag-timeline-list");
  if (tl) {
    tl.innerHTML = DIAG_TIMELINE.map((step, i) => {
      const isLast = i === DIAG_TIMELINE.length - 1;
      const cls =
        step.status === "done"
          ? "tl-step tl-step--done"
          : step.status === "current"
          ? "tl-step tl-step--current"
          : "tl-step tl-step--pending";
      const dotContent =
        step.status === "done"
          ? "✓"
          : step.status === "current"
          ? "●"
          : i + 1;
      return `
        <li class="${cls}">
          <div class="tl-dot">${dotContent}</div>
          ${!isLast ? '<div class="tl-line"></div>' : ""}
          <div class="tl-body">
            <div class="tl-label">${step.icon} ${step.label}</div>
            <div class="tl-date">${step.date}</div>
          </div>
        </li>
      `;
    }).join("");
  }

  // Botões "Ver no mapa" — associa o handler goToMapArea em cada diag-card
  document.querySelectorAll("[data-diag-area]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      goToMapArea(btn.getAttribute("data-diag-area"));
    };
  });

  // Botões "Como fazer →" — manda a pergunta pré-pronta pra IA
  document.querySelectorAll("[data-diag-prompt]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const prompt = btn.getAttribute("data-diag-prompt");
      if (!prompt) return;
      if (typeof showScreen !== "function") return;
      showScreen("screen-ia");
      setTimeout(() => sendSuggestion(btn, prompt), 350);
    };
  });
}

function goToMapArea(areaKey) {
  if (typeof showScreen !== "function") return;
  showScreen("screen-mapa");
  // Aguarda a transição de tela antes de acionar a seleção da área
  setTimeout(() => {
    if (typeof selectMapArea === "function") selectMapArea(areaKey);
  }, 350);
}

function listenDiagnostico() {
  const summary = document.getElementById("therm-summary");
  if (summary && typeof speakText === "function") {
    speakText(null, "Resumo da sua propriedade. " + summary.textContent);
  }
}

// ========================
// ORIE MASCOTE & CONTRAST INDICATOR
// ========================

// ========================
// ORIE — Mascote da Orienta
// ========================
//
// Identidade visual:
// - Muda de planta estilizada em vaso de barro
// - Tronco verde redondo (onde fica o rosto) com 2 folhas saindo do topo
// - Olhos pretos amigáveis e boca suave
// - Estilo flat moderno, sem contornos pesados
//
// Estados emocionais:
//   happy        → sorriso aberto e suave
//   neutral      → boca reta, expressão tranquila
//   concerned    → boca curvada para baixo + sobrancelhas suaves
//   alert        → boca pequena "o" + balão de exclamação
//   celebrating  → sorriso largo + confetes coloridos

// Largura/altura do viewBox: 96x96 (mais espaço para confetes no celebrating)

// ============================================================================
// NOVA IDENTIDADE VISUAL — baseada em files/orie.svg (planta em vaso de barro)
// Paleta:
//   Vaso:   #F28C52 / #E67845 / #D86739 (laranja queimado) + #F59A65 (destaque)
//   Terra:  #5C3528 / #4B281E (marrom escuro)
//   Folhas: #6ED66E → #43B84A (claro) / #5AC75A → #2FA24A (mais escuro)
//   Caule:  #2FA24A / #43B84A
//   Olhos:  #111111 + brilho #FFFFFF
//   Boca:   #111111
//   Bochecha: #F28C52 (laranja suave)
// ============================================================================

// Folhas: 5 folhas verdes em formato arredondado com nervura central,
// concentradas no topo (y < 35), distribuídas em leque saindo do caule.
const ORIE_LEAVES = `
  <!-- Folha superior (topo, central) -->
  <path d="M48 6
           C56 4 64 8 65 16
           C66 23 56 25 48 20
           C40 25 30 23 31 16
           C32 8 40 4 48 6 Z"
        fill="#43B84A" stroke="#2FA24A" stroke-width="0.8" stroke-linejoin="round"/>
  <path d="M48 8 L48 19"
        stroke="#2FA24A" stroke-width="0.6" stroke-linecap="round" fill="none" opacity="0.6"/>

  <!-- Folha esquerda superior -->
  <path d="M36 16
           C30 9 21 9 18 14
           C15 20 22 25 32 22
           C36 28 41 28 43 23
           C45 16 41 15 36 16 Z"
        fill="#6ED66E" stroke="#2FA24A" stroke-width="0.8" stroke-linejoin="round"/>
  <path d="M36 17 Q30 20 22 20"
        stroke="#2FA24A" stroke-width="0.6" stroke-linecap="round" fill="none" opacity="0.55"/>

  <!-- Folha direita superior -->
  <path d="M60 16
           C66 9 75 9 78 14
           C81 20 74 25 64 22
           C60 28 55 28 53 23
           C51 16 55 15 60 16 Z"
        fill="#6ED66E" stroke="#2FA24A" stroke-width="0.8" stroke-linejoin="round"/>
  <path d="M60 17 Q66 20 74 20"
        stroke="#2FA24A" stroke-width="0.6" stroke-linecap="round" fill="none" opacity="0.55"/>

  <!-- Folha inferior esquerda -->
  <path d="M30 28
           C24 22 16 22 14 27
           C12 33 19 38 28 35
           C32 40 36 40 38 35
           C40 29 36 27 30 28 Z"
        fill="#5AC75A" stroke="#2FA24A" stroke-width="0.8" stroke-linejoin="round"/>
  <path d="M30 29 Q24 32 18 32"
        stroke="#2FA24A" stroke-width="0.6" stroke-linecap="round" fill="none" opacity="0.55"/>

  <!-- Folha inferior direita -->
  <path d="M66 28
           C72 22 80 22 82 27
           C84 33 77 38 68 35
           C64 40 60 40 58 35
           C56 29 60 27 66 28 Z"
        fill="#5AC75A" stroke="#2FA24A" stroke-width="0.8" stroke-linejoin="round"/>
  <path d="M66 29 Q72 32 78 32"
        stroke="#2FA24A" stroke-width="0.6" stroke-linecap="round" fill="none" opacity="0.55"/>
`;

const ORIE_BODY = `
  <!-- Sombra suave no chão -->
  <ellipse cx="48" cy="93" rx="22" ry="1.8"
           fill="#4B281E" opacity="0.20"/>

  <!-- Vaso de barro trapezoidal arredondado — MAIOR, ocupa a metade inferior
       (y=42 a y=92). O rosto fica dentro deste vaso. -->
  <!-- Borda/aba superior (mais clara, destaque) -->
  <rect x="20" y="42" width="56" height="7" rx="2.2"
        fill="#F59A65" stroke="#D86739" stroke-width="0.8"/>
  <!-- Brilho sutil na aba -->
  <rect x="22" y="43" width="52" height="1.8" rx="0.7"
        fill="#F7A97A" opacity="0.6"/>

  <!-- Corpo do vaso (trapezóide arredondado, grande) -->
  <path d="M23 49
           Q22 70 21 82
           Q21 88 22 90
           Q48 95 74 90
           Q75 88 75 82
           Q74 70 73 49 Z"
        fill="#E67845" stroke="#D86739" stroke-width="0.9" stroke-linejoin="round"/>

  <!-- Reflexo lateral esquerdo do vaso -->
  <path d="M26 52 Q24 70 23 86"
        stroke="#F59A65" stroke-width="1.6" stroke-linecap="round"
        fill="none" opacity="0.55"/>

  <!-- Sombra interna sutil à direita -->
  <path d="M68 52 Q70 72 69 88 Q66 90 65 88 L68 52 Z"
        fill="#D86739" opacity="0.30"/>

  <!-- Terra no topo do vaso (elipse marrom) -->
  <ellipse cx="48" cy="46" rx="24" ry="2.6"
           fill="#4B281E" stroke="#5C3528" stroke-width="0.6"/>
  <!-- Textura da terra (2 linhas curtas) -->
  <path d="M38 45.5 Q42 44.5 46 45.5"
        stroke="#5C3528" stroke-width="0.7" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M50 46 Q54 45 58 46"
        stroke="#5C3528" stroke-width="0.7" stroke-linecap="round" fill="none" opacity="0.7"/>

  <!-- Caule principal (curto, sobe da terra até a base das folhas) -->
  <path d="M48 46 Q47.6 40 48 33 Q48.1 28 48 26"
        stroke="#2FA24A" stroke-width="2.2" stroke-linecap="round" fill="none"/>

  <!-- Galho esquerdo superior -->
  <path d="M48 32 Q43 30 38 27"
        stroke="#43B84A" stroke-width="1.5" stroke-linecap="round" fill="none"/>

  <!-- Galho direito superior -->
  <path d="M48 32 Q53 30 58 27"
        stroke="#43B84A" stroke-width="1.5" stroke-linecap="round" fill="none"/>

  <!-- Galho esquerdo inferior -->
  <path d="M48 38 Q42 36 34 34"
        stroke="#43B84A" stroke-width="1.5" stroke-linecap="round" fill="none"/>

  <!-- Galho direito inferior -->
  <path d="M48 38 Q54 36 62 34"
        stroke="#43B84A" stroke-width="1.5" stroke-linecap="round" fill="none"/>
`;

// Sobrancelhas: pequenos traços acima dos olhos. Olhos ficam dentro do vaso (cy≈60).
const ORIE_BROWS = {
  happy:        "",
  neutral:      "",
  concerned:    `
    <path d="M37 56.5 Q40 55 43 56.5" stroke="#111111" stroke-width="1.2"
          fill="none" stroke-linecap="round"/>
    <path d="M53 56.5 Q56 55 59 56.5" stroke="#111111" stroke-width="1.2"
          fill="none" stroke-linecap="round"/>`,
  alert:        `
    <path d="M37 55 L43 57" stroke="#111111" stroke-width="1.2"
          fill="none" stroke-linecap="round"/>
    <path d="M53 57 L59 55" stroke="#111111" stroke-width="1.2"
          fill="none" stroke-linecap="round"/>`,
  celebrating:  "",
};

// Olhos: posicionados dentro do vaso (cy≈60, dentro do corpo y=49-90).
const ORIE_EYES = `
  <circle cx="41" cy="60" r="2.8" fill="#111111"/>
  <circle cx="55" cy="60" r="2.8" fill="#111111"/>
  <circle cx="41.9" cy="59.2" r="0.95" fill="#FFFFFF"/>
  <circle cx="55.9" cy="59.2" r="0.95" fill="#FFFFFF"/>
`;

// Boca: posicionada dentro do vaso, abaixo dos olhos (y ≈ 67-71).
const ORIE_MOUTHS = {
  happy: `
    <path d="M42 67 Q48 73 54 67" stroke="#111111" stroke-width="1.7"
          fill="none" stroke-linecap="round"/>
    <!-- Bochechas rosadas -->
    <ellipse cx="34" cy="68" rx="2.4" ry="1.4" fill="#F28C52" opacity="0.55"/>
    <ellipse cx="62" cy="68" rx="2.4" ry="1.4" fill="#F28C52" opacity="0.55"/>
  `,
  neutral: `
    <path d="M43 69 L53 69" stroke="#111111" stroke-width="1.5"
          fill="none" stroke-linecap="round"/>
  `,
  concerned: `
    <path d="M42 71 Q48 65 54 71" stroke="#111111" stroke-width="1.7"
          fill="none" stroke-linecap="round"/>
    <!-- Gota de "suor" -->
    <path d="M64 56 Q65.4 58.4 64 60.2 Q62.6 58.4 64 56 Z"
          fill="#7dd3fc" stroke="#0369a1" stroke-width="0.5"/>
  `,
  alert: `
    <ellipse cx="48" cy="69" rx="2" ry="2.5"
             fill="#111111"/>
    <!-- Sinal de exclamação ao lado (dentro do vaso) -->
    <g transform="translate(68, 54)">
      <circle r="5" fill="#fef3c7" stroke="#d97706" stroke-width="1.2"/>
      <path d="M0 -2.4 L0 1.2" stroke="#b45309" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="0" cy="3" r="0.7" fill="#b45309"/>
    </g>
  `,
  celebrating: `
    <path d="M41 65 Q48 74 55 65" stroke="#111111" stroke-width="1.8"
          fill="none" stroke-linecap="round"/>
    <path d="M41 65 Q48 68.5 55 65" fill="#111111"/>
    <!-- Bochechas rosadas mais fortes -->
    <ellipse cx="34" cy="68" rx="2.7" ry="1.6" fill="#F28C52" opacity="0.78"/>
    <ellipse cx="62" cy="68" rx="2.7" ry="1.6" fill="#F28C52" opacity="0.78"/>
    <!-- Confetes ao redor do topo (fora do vaso, sobre as folhas) -->
    <circle cx="14" cy="14" r="1.5" fill="#fbbf24"/>
    <rect x="76" y="12" width="2.5" height="2.5" fill="#34d399" transform="rotate(20 77.25 13.25)"/>
    <circle cx="10" cy="38" r="1.4" fill="#f472b6"/>
    <rect x="80" y="42" width="2.5" height="2.5" fill="#60a5fa" transform="rotate(-15 81.25 43.25)"/>
    <circle cx="22" cy="6" r="1.2" fill="#a78bfa"/>
    <path d="M84 28 L86 26 L88 30 Z" fill="#fb923c"/>
    <path d="M8 28 L6 26 L4 30 Z" fill="#22d3ee"/>
  `,
};

const ORIE_SVG_BASE = `
<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  ${ORIE_BODY}
  ${ORIE_LEAVES}
  <g id="orie-face">${ORIE_EYES}__MOUTH____BROWS__</g>
</svg>
`;

function getOrieSvg(state) {
  const mouth = ORIE_MOUTHS[state] || ORIE_MOUTHS.happy;
  const brows = ORIE_BROWS[state] || "";
  return ORIE_SVG_BASE
    .replace("__MOUTH__", mouth)
    .replace("__BROWS__", brows);
}

function injectOrie() {
  document.querySelectorAll(".orie-svg").forEach((el) => {
    if (!el.dataset.injected) {
      el.innerHTML = getOrieSvg("happy");
      el.dataset.injected = "1";
      el.dataset.state = "happy";
    }
  });
}

function updateOrieState(state) {
  const svg = getOrieSvg(state);
  document.querySelectorAll(".orie-svg").forEach((el) => {
    el.innerHTML = svg;
    el.dataset.injected = "1";
    el.dataset.state = state;
  });
}

/* === ALTO CONTRASTE — Toggle na topbar ============================
   O usuário pode ligar/desligar o modo alto contraste de duas formas:
   1. Botão na topbar da Home (#btn-contrast) — toggle direto.
   2. Checkbox dentro do painel de Acessibilidade (#toggle-contrast).
   Ambos ficam em sincronia via syncAccessibilityToggle().
   =============================================================== */

function syncAccessibilityToggle() {
  // Sincroniza TODOS os controles de alto contraste com o estado real do body.
  const isOn = document.body.classList.contains("high-contrast");
  const cb = document.getElementById("toggle-contrast");
  if (cb) cb.checked = isOn;
  const btn = document.getElementById("btn-contrast");
  if (btn) btn.setAttribute("aria-pressed", String(isOn));
}

function toggleContrastFromHeader() {
  // Toggle direto a partir do botão da topbar.
  document.body.classList.toggle("high-contrast");
  syncAccessibilityToggle();
}

function toggleContrast(cb) {
  document.body.classList.toggle("high-contrast", cb.checked);
  syncAccessibilityToggle();
}

// Inicialização: injetar Orie + sincronizar checkbox de contraste
document.addEventListener("DOMContentLoaded", () => {
  injectOrie();
  syncAccessibilityToggle();
  syncSpeechRateUI();
});

/* === ORIE — MASCOTE FLUTUANTE =====================================
   O mascote flutuante foi removido por decisão de UX (estava poluindo
   a tela). O Orie continua aparecendo nos seus 3 pontos fixos:
     1. .orie-welcome         — bloco de boas-vindas da Home
     2. .orie-svg-wrap--hero  — hero centralizado do Diagnóstico
     3. .orie-avatar-top      — avatar pequeno no Chat
   =============================================================== */

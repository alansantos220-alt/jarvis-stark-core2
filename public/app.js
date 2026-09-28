const chat = document.getElementById("chat");
const form = document.getElementById("commandForm");
const promptInput = document.getElementById("prompt");
const typing = document.getElementById("typing");
const connectionText = document.getElementById("connectionText");
const aiState = document.getElementById("aiState");
const netState = document.getElementById("netState");
const voiceState = document.getElementById("voiceState");
const voiceSelect = document.getElementById("voiceSelect");
const speed = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");
const muteBtn = document.getElementById("muteBtn");
const micBtn = document.getElementById("micBtn");

let muted = localStorage.getItem("jarvisMuted") === "true";
let voices = [];
let recognition = null;

function updateClock(){
  document.getElementById("clock").textContent =
    new Date().toLocaleTimeString("pt-BR", {hour12:false});
}
setInterval(updateClock, 1000); updateClock();

function addMessage(who, text){
  const wrap = document.createElement("div");
  wrap.className = `message ${who}`;
  wrap.innerHTML = `
    <div class="avatar">${who === "jarvis" ? "J" : "S"}</div>
    <div class="bubble">
      <span class="label">${who === "jarvis" ? "J.A.R.V.I.S." : "SENHOR"}</span>
      <p></p>
    </div>`;
  wrap.querySelector("p").textContent = text;
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

function setTyping(on){ typing.classList.toggle("active", on); }

function loadVoices(){
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";
  const pt = voices.filter(v => /^pt-BR/i.test(v.lang));
  const ordered = [...pt, ...voices.filter(v => !pt.includes(v))];
  ordered.forEach((voice, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${voice.name} — ${voice.lang}`;
    voiceSelect.appendChild(opt);
  });
  if (pt.length) {
    const index = ordered.indexOf(pt[0]);
    voiceSelect.value = index;
  }
}
speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

function speak(text){
  if(muted || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const clean = text.replace(/[*_`#]/g, "");
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = "pt-BR";
  u.rate = Number(speed.value);
  u.pitch = 0.95;
  const chosen = voices[Number(voiceSelect.value)];
  if(chosen) u.voice = chosen;
  speechSynthesis.speak(u);
}

function updateMute(){
  voiceState.textContent = muted ? "MUDO" : "ATIVA";
  muteBtn.textContent = muted ? "🔇 VOZ MUDADA" : "🔊 VOZ ATIVA";
  if(muted) speechSynthesis.cancel();
}
updateMute();

speed.addEventListener("input", () => {
  speedValue.textContent = `${Number(speed.value).toFixed(2)}x`;
});

muteBtn.addEventListener("click", () => {
  muted = !muted;
  localStorage.setItem("jarvisMuted", muted);
  updateMute();
});

document.getElementById("testVoiceBtn").addEventListener("click", () => {
  speak("Teste de voz concluído, senhor. O sistema está operacional.");
});

document.getElementById("clearBtn").addEventListener("click", () => {
  chat.innerHTML = "";
  addMessage("jarvis", "Histórico visual limpo, senhor. O núcleo permanece operacional.");
  speak("Histórico visual limpo, senhor. O núcleo permanece operacional.");
});

document.getElementById("fullscreenBtn").addEventListener("click", async () => {
  if(!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
  else await document.exitFullscreen?.();
});

document.querySelectorAll(".quick-actions button").forEach(btn => {
  btn.addEventListener("click", () => {
    promptInput.value = btn.dataset.command;
    form.requestSubmit();
  });
});

async function sendPrompt(prompt){
  addMessage("user", prompt);
  setTyping(true);

  try {
    const r = await fetch("/api/jarvis", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({prompt})
    });
    const data = await r.json();
    if(!r.ok) throw new Error(data.error || "Falha desconhecida.");
    addMessage("jarvis", data.response);
    speak(data.response);
  } catch(e) {
    addMessage("jarvis", `Senhor, encontrei uma falha de comunicação: ${e.message}`);
    speak(`Senhor, encontrei uma falha de comunicação: ${e.message}`);
  } finally {
    setTyping(false);
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const value = promptInput.value.trim();
  if(!value) return;
  promptInput.value = "";
  sendPrompt(value);
});

async function checkStatus(){
  try{
    const r = await fetch("/api/status");
    const data = await r.json();
    connectionText.textContent = data.online ? "ONLINE" : "OFFLINE";
    aiState.textContent = data.aiConfigured ? "PRONTA" : "SEM CHAVE";
    netState.textContent = "ATIVA";
  }catch{
    connectionText.textContent = "OFFLINE";
    aiState.textContent = "ERRO";
    netState.textContent = "INDISPONÍVEL";
  }
}
checkStatus();

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if(SR){
  recognition = new SR();
  recognition.lang = "pt-BR";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onstart = () => micBtn.classList.add("listening");
  recognition.onend = () => micBtn.classList.remove("listening");
  recognition.onresult = e => {
    promptInput.value = e.results[0][0].transcript;
    form.requestSubmit();
  };
  micBtn.addEventListener("click", () => {
    try { recognition.start(); } catch {}
  });
}else{
  micBtn.title = "Reconhecimento de voz não disponível neste navegador";
  micBtn.addEventListener("click", () => {
    addMessage("jarvis", "Senhor, o reconhecimento de voz não está disponível neste navegador.");
  });
}

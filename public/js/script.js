let selectedVoice = "Kore";
let selectedVoiceName = "Bora (Calm)";

const textarea = document.getElementById("text");
const counter = document.getElementById("charCount");
const statusBox = document.getElementById("status");
const resultList = document.getElementById("resultList");
const generateBtn = document.getElementById("btn");

const voiceDropdown = document.getElementById("voiceDropdown");
const voiceSelected = document.getElementById("voiceSelected");
const selectedVoiceNameEl = document.getElementById("selectedVoiceName");
const voiceOptions = document.querySelectorAll(".voice-option");

textarea.addEventListener("input", () => {
  counter.innerText = textarea.value.length;
});

voiceSelected.addEventListener("click", () => {
  voiceDropdown.classList.toggle("open");
});

voiceOptions.forEach((option) => {
  const playBtn = option.querySelector(".play-btn");

  option.addEventListener("click", () => {
    voiceOptions.forEach((v) => v.classList.remove("active"));
    option.classList.add("active");

    selectedVoice = option.dataset.voice;
    selectedVoiceName = option.dataset.name;
    selectedVoiceNameEl.innerText = selectedVoiceName;

    voiceDropdown.classList.remove("open");
  });

  playBtn.addEventListener("click", async (e) => {
    e.stopPropagation();

    const voice = option.dataset.voice;
    const name = option.dataset.name;

    playBtn.disabled = true;
    playBtn.innerText = "⏳";
    statusBox.innerText = `Previewing ${name}...`;

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: "សួស្តី នេះគឺជាសំឡេងសាកល្បង។",
          voice: voice,
          style: "short Khmer preview"
        })
      });

      if (!res.ok) {
        throw new Error("Preview failed");
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      await audio.play();

      statusBox.innerText = `${name} preview playing.`;
    } catch (err) {
      console.error(err);
      statusBox.innerText = "Preview failed.";
      alert("Preview failed.");
    } finally {
      playBtn.disabled = false;
      playBtn.innerText = "▶";
    }
  });
});

document.addEventListener("click", (e) => {
  if (!voiceDropdown.contains(e.target)) {
    voiceDropdown.classList.remove("open");
  }
});

generateBtn.addEventListener("click", generate);

async function generate() {
  const text = textarea.value.trim();

  if (!text) {
    alert("Please enter text first.");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerText = "Generating...";
  statusBox.innerText = "Generating speech...";

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        voice: selectedVoice,
        style: "natural Khmer narrator"
      })
    });

    if (!res.ok) {
      throw new Error("Generate failed");
    }

    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);

    const card = document.createElement("div");
    card.className = "audio-card";

    const title = document.createElement("div");
    title.className = "audio-title";
    title.innerText = `Voice: ${selectedVoiceName}`;

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = audioUrl;

    card.appendChild(title);
    card.appendChild(audio);

    resultList.prepend(card);

    await audio.play();

    statusBox.innerText = "Completed.";
  } catch (err) {
    console.error(err);
    statusBox.innerText = "Generate failed.";
    alert("Generate failed.");
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerText = "Generate Speech";
  }
}
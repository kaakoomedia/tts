let selectedVoice = "Kore";
let selectedVoiceName = "Bora";

const textarea = document.getElementById("text");
const counter = document.getElementById("charCount");
const statusBox = document.getElementById("status");
const resultList = document.getElementById("resultList");
const generateBtn = document.getElementById("btn");
const voiceItems = document.querySelectorAll(".voice-item");

textarea.addEventListener("input", () => {
  counter.innerText = textarea.value.length;
});

voiceItems.forEach((item) => {
  const playBtn = item.querySelector(".play-btn");

  item.addEventListener("click", () => {
    voiceItems.forEach((v) => v.classList.remove("active"));
    item.classList.add("active");

    selectedVoice = item.dataset.voice;
    selectedVoiceName = item.dataset.name;
  });

  playBtn.addEventListener("click", async (e) => {
    e.stopPropagation();

    const voice = item.dataset.voice;
    const voiceName = item.dataset.name;

    playBtn.disabled = true;
    playBtn.innerText = "⏳";
    statusBox.innerText = `Previewing ${voiceName} voice...`;

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: "សួស្តី នេះគឺជាសំឡេងសាកល្បងដែលលោកអ្នកអាចជ្រើសរើសយកបាន។",
          voice: voice,
          style: "short natural Khmer voice preview"
        })
      });

      if (!res.ok) {
        throw new Error("Preview failed");
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      await audio.play();

      statusBox.innerText = `${voiceName} preview playing.`;
    } catch (error) {
      console.error(error);
      statusBox.innerText = "Preview failed.";
      alert("Preview failed.");
    } finally {
      playBtn.disabled = false;
      playBtn.innerText = "▶";
    }
  });
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
  } catch (error) {
    console.error(error);
    statusBox.innerText = "Generate failed.";
    alert("Generate failed.");
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerText = "Generate Speech";
  }
}
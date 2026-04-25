async function generate() {
  const text = document.getElementById("text").value.trim();
  const raw = document.getElementById("voice").value;
  const { voice, style } = JSON.parse(raw);

  const btn = document.getElementById("btn");
  const status = document.getElementById("status");
  const resultList = document.getElementById("resultList");

  if (!text) {
    status.innerText = "⚠️ Please enter text first.";
    return;
  }

  btn.disabled = true;
  btn.innerText = "Generating...";
  status.innerText = "⏳ Generating voice, please wait...";

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, voice, style })
    });

    if (!res.ok) {
      throw new Error("Server error");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const card = document.createElement("div");
    card.className = "result-card";

    card.innerHTML = `
      <div class="result-top">
        <button class="play-btn">▶</button>

        <div class="result-info">
          <div class="result-title">Untitled</div>
          <div class="result-meta">Just now · ${style}</div>
        </div>
      </div>

      <div class="result-text">${text}</div>

      <audio class="result-audio" controls src="${url}"></audio>
    `;

    const playBtn = card.querySelector(".play-btn");
    const audio = card.querySelector("audio");

    playBtn.addEventListener("click", () => {
      audio.play();
    });

    resultList.prepend(card);

    audio.play();

    status.innerText = "✅ Voice generated successfully!";
  } catch (err) {
    console.error(err);
    status.innerText = "❌ Failed to generate voice.";
  }

  btn.disabled = false;
  btn.innerText = "Generate Speech";
}
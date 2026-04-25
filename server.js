import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const wavHeader = Buffer.alloc(44);

  wavHeader.write("RIFF", 0);
  wavHeader.writeUInt32LE(36 + pcmBuffer.length, 4);
  wavHeader.write("WAVE", 8);
  wavHeader.write("fmt ", 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20);
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(bitsPerSample, 34);
  wavHeader.write("data", 36);
  wavHeader.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([wavHeader, pcmBuffer]);
}

app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice, style } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [
        {
          parts: [
            {
              text: `
Speak ONLY in natural Khmer language.

Voice personality: ${style || "natural Khmer narrator"}

Rules:
- Clear Khmer pronunciation
- Human-like emotion
- Smooth pacing
- Do not translate to English

Text:
${text}
              `,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice || "Kore",
            },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];

    if (!part?.inlineData?.data) {
      console.log(JSON.stringify(response, null, 2));
      return res.status(500).json({ error: "No audio returned from Gemini" });
    }

    const pcmBuffer = Buffer.from(part.inlineData.data, "base64");
    const wavBuffer = pcmToWav(pcmBuffer);

    res.set({
      "Content-Type": "audio/wav",
      "Content-Disposition": "inline; filename=tts.wav",
    });

    res.send(wavBuffer);
  } catch (err) {
    console.error("TTS ERROR:", err);
    res.status(500).json({
      error: "TTS generation failed",
      details: err.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server running: http://localhost:3000");
});
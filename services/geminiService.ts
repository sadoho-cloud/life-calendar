
import { GoogleGenAI } from "@google/genai";

export const getReflection = async (age: number, weeksRemaining: number, expectedLifespan: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `我目前 ${age} 歲，在預期 ${expectedLifespan} 年的人生中大約還剩下 ${weeksRemaining} 個禮拜。
      請提供一段簡短、溫暖且發人省思的人生感悟或叮嚀（最多 3 句話）。
      風格應該平易近人，像是一位溫柔的長者在提醒我生命的珍貴與當下的美好，而不僅僅是生硬的哲學教條。
      必須使用「繁體中文」回答。直接輸出內容字串，不要有額外的標籤、引號或說明。`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });

    return response.text || "每一天都是一份禮物，這就是為什麼我們稱之為『現在』。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "生命不在於呼吸的次數，而在於那些讓你屏息的瞬間。";
  }
};

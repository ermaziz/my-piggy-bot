import { Telegraf } from 'telegraf';
import { GoogleGenAI } from '@google/genai';

const bot = new Telegraf(process.env.TGBOT_TOKEN);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

bot.start((ctx) => ctx.reply('你好！我是你的智能小帮手，有什么我可以帮你的吗？'));

bot.on('text', async (ctx) => {
  try {
    const userMessage = ctx.message.text;
    
    // 调用最新的 Google Gen AI SDK 标准模型
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
    });

    const replyText = response.text || '没听清，能再说一遍吗？';
    await ctx.reply(replyText);
  } catch (error) {
    console.error('Gemini Error:', error);
    await ctx.reply('哎呀，AI 思考时走神了，请稍后再试一次~');
  }
});

// Vercel Serverless 适配
export default async function handler(req, res) {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body);
    res.status(200).json({ ok: true });
  } else {
    res.status(200).send('Telegram Bot is running smoothly!');
  }
}

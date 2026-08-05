const { Telegraf } = require('telegraf');
const { GoogleGenAI } = require('@google/genai');

const bot = new Telegraf(process.env.TGBOT_TOKEN);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

bot.start((ctx) => ctx.reply('你好！我是你的小猪机器人，有什么我可以帮你的吗？'));

bot.on('text', async (ctx) => {
  try {
    await ctx.sendChatAction('typing');
    const userMessage = ctx.message.text;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: userMessage,
    });

    await ctx.reply(response.text);
  } catch (error) {
    console.error('Gemini Error:', error);
    await ctx.reply('哎呀，AI 思考时走神了，请稍后再试一次~');
  }
});

// Vercel Serverless Function 适配入口
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(200).send('Piggy Bot is running smoothly!');
  }
};

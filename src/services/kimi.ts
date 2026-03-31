import { supabase } from '../lib/supabase';

export async function getTarotReading(question: string, cardName: string) {
  const prompt = `You are a Gen Z tarot reader. You speak with modern slang, emojis, and a fun, slightly edgy but supportive vibe. 
The user asked: "${question}"
They drew the card: "${cardName}"
Give them a short, punchy, and insightful tarot reading based on this card and their question. Keep it under 150 words.`;

  return callKimiApi(prompt);
}

export async function getThreeCardReading(question: string, cards: string[]) {
  const prompt = `你是一个Z世代（00后）的塔罗牌占卜师。你的说话风格充满了中国现代网络流行语（比如：尊嘟假嘟、绝绝子、拿捏了、大无语事件、主线任务、NPC、emo、yyds、画大饼等），喜欢用emoji，态度有点拽但其实很暖心。
用户问的问题是："${question}"
他们抽到了一个三牌阵（过去、现在、未来）：
1. 过去: ${cards[0]}
2. 现在: ${cards[1]}
3. 未来: ${cards[2]}

请根据这三张牌和他们的问题，给他们一个连贯、犀利又深刻的塔罗牌解读。
请分段输出：
- 【过去】
- 【现在】
- 【未来】
- 【Vibe Check / 最终建议】
保持语言生动有趣，字数控制在400字以内。`;

  return callKimiApi(prompt);
}

async function callKimiApi(prompt: string) {
  const { data, error } = await supabase.functions.invoke('kimi-tarot', {
    body: { prompt }
  });

  if (error) {
    console.error("Supabase Edge Function Error:", error);
    throw new Error(`Failed to invoke function: ${error.message}`);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data.text;
}

import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api.deepseek.com';
const MODEL = 'deepseek-chat';

export async function POST(request: NextRequest) {
  try {
    const { emotions, intention } = await request.json();

    if (!emotions || !Array.isArray(emotions)) {
      return NextResponse.json({ insight: '' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ insight: '' });
    }

    // 汇总情绪数据
    const emotionSummary: Record<string, number> = {};
    emotions.forEach((e: string) => {
      emotionSummary[e] = (emotionSummary[e] || 0) + 1;
    });

    const total = emotions.length;
    const emotionList = Object.entries(emotionSummary)
      .map(([k, v]) => `${k} ${v}次`)
      .join('，');

    const response = await fetch(`${API_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `你是一个温和而洞察力强的减脂心态教练。你的任务是根据用户今天的进食情绪数据，生成一句简短的个性化洞察和建议。

要求：
1. 用温和、非评判的语气，像朋友在聊天
2. 如果情绪性进食较多，给出一个具体的小建议（不超过15个字）
3. 如果大多数是"真饿了"，给予真诚的肯定
4. 如果是社交场合进食，帮助用户消除负罪感
5. 总字数控制在60字以内，像一条推文
6. 不要用"你应该""你需要"这种命令式语气
7. 如果有今天的进食意图（严谨控制/正常维持/社交放松），结合意图给出更贴合的建议`,
          },
          {
            role: 'user',
            content: `今天共进食${total}次，情绪分布：${emotionList}。${intention ? `今天的进食意图是：${intention}。` : ''}请生成一句个性化洞察。`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ insight: '' });
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content?.trim() || '';

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Daily insight error:', error);
    return NextResponse.json({ insight: '' });
  }
}
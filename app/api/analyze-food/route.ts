import { NextRequest, NextResponse } from 'next/server';

// 如果你改用 OpenAI，只需修改这两个地方：
const API_BASE = 'https://api.deepseek.com';
const MODEL = 'deepseek-chat'; // 也可用 'gpt-4o-mini' 等其他兼容模型

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: '请提供食物描述（description 字段）' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY; // 环境变量名可改成 OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: '未配置 API 密钥，请联系管理员' },
        { status: 500 }
      );
    }

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
            content:
              '你是一个精确的营养师。根据用户描述，估算一餐正常分量食物的热量(千卡)、碳水化合物(克)、蛋白质(克)和脂肪(克)。只返回一个合法的JSON对象，格式为：{"foodName":"食物名称","calories":热量,"carbs":碳水,"protein":蛋白质,"fat":脂肪}，不要任何解释或其他文字。',
          },
          {
            role: 'user',
            content: description,
          },
        ],
        temperature: 0.1, // 降低随机性，让输出更稳定
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `AI 调用失败：${err}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'AI 返回内容为空' },
        { status: 500 }
      );
    }

    // 尝试解析 AI 返回的 JSON（有时模型会多输出一点东西，这里做简单清洗）
    let cleaned = content.trim();
    // 去除可能的 markdown 代码块标记
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '');
    }

    const parsed = JSON.parse(cleaned);

    // 确保返回字段完整
    return NextResponse.json({
      foodName: parsed.foodName || '未知食物',
      calories: Number(parsed.calories) || 0,
      carbs: Number(parsed.carbs) || 0,
      protein: Number(parsed.protein) || 0,
      fat: Number(parsed.fat) || 0,
    });
  } catch (error: any) {
    console.error('Analyze food error:', error);
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}
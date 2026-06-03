import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api.deepseek.com';
const MODEL = 'deepseek-chat';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: '请提供食物描述（description 字段）' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
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
            content: `你是一个精确的营养师，专长是分析食物营养成分。你的任务是解析用户的任何描述（包括带克数的），并给出最精确的估算。

分析原则：
1. 仔细拆解用户输入：识别出每种食物、具体分量（克、毫升、碗、个、杯等）和烹饪方式。
2. 如果用户明确给出了克数或毫升数，请以用户给出的数值为准进行计算。例如"鸡胸肉200g"就按200g计算，每100g鸡胸肉约含热量110千卡、碳水0g、蛋白质23g、脂肪2g，按比例计算。
3. 如果用户只描述了食物名称没有给份量（如"一碗牛肉面"），就按1人份的正常餐食估算。
4. 如果用户输入了多种食物（如"米饭150g+鸡胸肉200g"），请分别计算每种食物的营养素，然后汇总总数。
5. 常见份量参考：
   - 1碗米饭约150g，热量约170千卡
   - 1碗面条约200g，热量约220千卡（不含汤料）
   - 1个鸡蛋约50g，热量约70千卡
   - 1片吐司约30g，热量约80千卡
   - 1杯牛奶约250ml，热量约120千卡
6. 对于加工食品（如炸鸡、蛋糕），需考虑烹饪用油和调料的热量。

只返回一个合法的JSON对象，格式为：
{"foodName":"食物名称","calories":总热量,"carbs":总碳水,"protein":总蛋白质,"fat":总脂肪}
不要任何解释、分析步骤或多余文本。`,
          },
          {
            role: 'user',
            content: description,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
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

    // 解析 AI 返回的 JSON
    let cleaned = content.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '');
    }

    const parsed = JSON.parse(cleaned);

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
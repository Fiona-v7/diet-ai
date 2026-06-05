import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api.deepseek.com';
const MODEL = 'deepseek-chat';

export async function POST(request: NextRequest) {
  try {
    const { description, imageBase64 } = await request.json();

    if ((!description || typeof description !== 'string') && !imageBase64) {
      return NextResponse.json(
        { error: '请提供食物描述或图片' },
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

    const userContent: any[] = [];

    if (imageBase64) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
        },
      });
    }

    const textPrompt = description
      ? `请分析以下食物描述的营养成分：${description}${imageBase64 ? '（参考图片）' : ''}`
      : '请分析图片中的食物，估算其营养成分';

    userContent.push({
      type: 'text',
      text: textPrompt,
    });

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
            content: `你是一个精确的营养师，专长是分析食物营养成分。请解析用户提供的食物描述和/或图片，并给出最精确的估算。

分析原则：
1. 仔细拆解用户输入：识别出每种食物、具体分量和烹饪方式。
2. 如果用户明确给出了克数或毫升数，以用户给出的数值为准。
3. 如果只有图片，估算图片中食物的种类和分量。
4. 常见份量参考：
   - 1碗米饭约150g，热量约170千卡
   - 1碗面条约200g，热量约220千卡（不含汤料）
   - 1个鸡蛋约50g，热量约70千卡
   - 1片吐司约30g，热量约80千卡
   - 1杯牛奶约250ml，热量约120千卡
5. 加工食品需考虑烹饪用油和调料的热量及钠含量。

额外指标估算：
- sodium（钠，mg）：加工食品、调味料、酱汁等钠含量较高。新鲜食材钠含量极低。
- fiber（膳食纤维，g）：全谷物、蔬菜、水果、豆类含量较高。动物性食物含量为0。
- sugar（糖，g）：估算总糖含量，包括天然糖和添加糖。

只返回一个合法的JSON对象，格式为：
{"foodName":"食物名称","calories":总热量,"carbs":总碳水,"protein":总蛋白质,"fat":总脂肪,"sodium":钠mg,"fiber":膳食纤维g,"sugar":糖g}
不要任何解释、分析步骤或多余文本。`,
          },
          {
            role: 'user',
            content: userContent,
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
      sodium: Number(parsed.sodium) || 0,
      fiber: Number(parsed.fiber) || 0,
      sugar: Number(parsed.sugar) || 0,
    });
  } catch (error: any) {
    console.error('Analyze food error:', error);
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}
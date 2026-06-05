"use client"

import { Flame, Drumstick, Wheat, Droplet } from "lucide-react"

interface NutritionData {
  calories: number
  carbs: number
  protein: number
  fat: number
}

interface Meal {
  id?: number
  foodName: string
  calories: number
  carbs: number
  protein: number
  fat: number
  sodium: number
  fiber: number
  sugar: number
  date: string
  mealTime: string
  emotion: string
}

interface DashboardProps {
  dailyGoal: NutritionData
  currentIntake: NutritionData
  meals: Meal[]
  todayDate: string
  onDelete: (index: number) => void
  todayIntention: string
  aiInsight: string
  photoBase64: string
}

function CircularProgress({
  current,
  goal,
  size = 200,
  strokeWidth = 12,
}: {
  current: number
  goal: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = Math.min((current / goal) * 100, 100)
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const remaining = Math.max(goal - current, 0)

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-gray-900">{remaining}</span>
        <span className="text-sm text-gray-500">剩余卡路里</span>
      </div>
    </div>
  )
}

function LinearProgress({
  label,
  current,
  goal,
  color,
  icon: Icon,
}: {
  label: string
  current: number
  goal: number
  color: string
  icon: React.ComponentType<{ className?: string }>
}) {
  const percentage = Math.min((current / goal) * 100, 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-sm font-medium text-gray-900">{label}</span>
        </div>
        <span className="text-sm text-gray-500">
          {current}g / {goal}g
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color.replace("text-", "bg-")}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function MealItem({ meal, onDelete, index }: { meal: Meal; onDelete: (index: number) => void; index: number }) {
  const mealTimeColors: Record<string, string> = {
    '早餐': 'bg-yellow-100 text-yellow-700',
    '午餐': 'bg-orange-100 text-orange-700',
    '晚餐': 'bg-blue-100 text-blue-700',
    '加餐': 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="border-0 bg-white shadow-sm rounded-lg p-4 flex items-center justify-between group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
          <Flame className="h-5 w-5 text-green-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900 truncate">{meal.foodName}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${mealTimeColors[meal.mealTime] || 'bg-gray-100 text-gray-600'}`}>
              {meal.mealTime}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 bg-gray-100 text-gray-600">
              {meal.emotion}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            碳水 {meal.carbs}g · 蛋白质 {meal.protein}g · 脂肪 {meal.fat}g
          </p>
          {/* 额外指标 */}
          <div className="flex items-center gap-3 mt-1">
            {meal.sodium > 0 && (
              <span className="text-xs text-gray-400">钠 {meal.sodium}mg</span>
            )}
            {meal.fiber > 0 && (
              <span className="text-xs text-gray-400">纤维 {meal.fiber}g</span>
            )}
            {meal.sugar > 0 && (
              <span className="text-xs text-gray-400">糖 {meal.sugar}g</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <p className="font-semibold text-gray-900">{meal.calories}</p>
          <p className="text-xs text-gray-500">千卡</p>
        </div>
        <button
          onClick={() => {
            if (confirm('确定要删除这条记录吗？')) {
              onDelete(index);
            }
          }}
          className="text-gray-300 hover:text-red-500 transition-colors p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span className="sr-only">删除</span>
        </button>
      </div>
    </div>
  )
}

function EmotionSummary({ meals, aiInsight }: { meals: Meal[]; aiInsight: string }) {
  const emotionCounts: Record<string, number> = {};
  meals.forEach((m) => {
    emotionCounts[m.emotion] = (emotionCounts[m.emotion] || 0) + 1;
  });

  const total = meals.length;
  const emotionalEating = (emotionCounts['无聊'] || 0) + (emotionCounts['焦虑'] || 0) + (emotionCounts['开心'] || 0);
  const realHunger = emotionCounts['真饿了'] || 0;
  const social = emotionCounts['社交'] || 0;
  const allRealHunger = realHunger === total;

  let insight = '';
  let emoji = '';

  if (total === 0) {
    return null;
  }

  if (allRealHunger) {
    emoji = '⭐';
    insight = '今天每一次进食都是因为身体真的需要。你让食物回归了它最本质的功能——这不需要"坚持"，这是一种很舒服的状态。';
  } else if (realHunger >= total / 2) {
    emoji = '💚';
    insight = `今天 ${realHunger} 次进食是因为真的饿了——你的身体在按需索取，你在认真倾听它。`;
  } else if (emotionalEating > realHunger && emotionalEating >= total / 2) {
    emoji = '🧘';
    insight = `今天有 ${emotionalEating} 次进食和情绪有关。这不是"意志力不够"，这可能是一个信号——你最近压力变大了。也许你需要的不是少吃，而是给自己找一个放松的方式。`;
  } else if (social >= 2) {
    emoji = '🎉';
    insight = `今天有 ${social} 次社交场合的进食。和重要的人一起吃饭，是生活中很美好的部分。不用有负罪感，这不会影响你的长期目标。`;
  } else {
    emoji = '💪';
    insight = '你今天在努力倾听自己的身体。保持这种觉察，本身就是最好的减脂状态。';
  }

  const emotionColors: Record<string, string> = {
    '真饿了': 'bg-green-100 text-green-700',
    '常规': 'bg-blue-100 text-blue-700',
    '开心': 'bg-orange-100 text-orange-700',
    '社交': 'bg-purple-100 text-purple-700',
    '无聊': 'bg-yellow-100 text-yellow-700',
    '焦虑': 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">今日心态小结</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{insight}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(emotionCounts).map(([emotion, count]) => (
              <span key={emotion} className={`text-xs px-2 py-1 rounded-full ${emotionColors[emotion] || 'bg-gray-100 text-gray-600'}`}>
                {emotion} ×{count}
              </span>
            ))}
          </div>
          {aiInsight && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-start gap-2">
                <span className="text-sm mt-0.5 flex-shrink-0">🤖</span>
                <p className="text-sm text-gray-500 italic leading-relaxed break-words">{aiInsight}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniAvatar({ photoBase64, intakeRatio }: { photoBase64: string; intakeRatio: number }) {
  let ringColor = 'ring-green-300';
  let bgGlow = 'shadow-green-200';
  let emoji = '😊';

  if (intakeRatio <= 0.8) {
    ringColor = 'ring-green-300';
    bgGlow = 'shadow-green-200';
    emoji = '😊';
  } else if (intakeRatio <= 1.0) {
    ringColor = 'ring-yellow-400';
    bgGlow = 'shadow-yellow-200';
    emoji = '😐';
  } else {
    ringColor = 'ring-red-400';
    bgGlow = 'shadow-red-200';
    emoji = '😅';
  }

  return (
    <div className="relative inline-block">
      <div className={`absolute -inset-3 rounded-full ring-4 ${ringColor} shadow-lg ${bgGlow} animate-pulse`} />
      <div className={`relative w-16 h-16 rounded-full ring-4 ${ringColor} overflow-hidden bg-white`}>
        {photoBase64 ? (
          <img src={photoBase64} alt="减脂小人" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            🥗
          </div>
        )}
      </div>
      <span className="absolute -bottom-1 -right-1 text-lg">{emoji}</span>
    </div>
  );
}

export default function Dashboard({ dailyGoal, currentIntake, meals, todayDate, onDelete, todayIntention, aiInsight, photoBase64 }: DashboardProps) {
  const intakeRatio = dailyGoal.calories > 0 ? currentIntake.calories / dailyGoal.calories : 0;

  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-b from-green-50 to-gray-50 px-6 pb-8 pt-12">
        <div className="flex justify-center mb-4">
          <MiniAvatar photoBase64={photoBase64} intakeRatio={intakeRatio} />
        </div>
        <h1 className="mb-1 text-center text-xl font-semibold text-gray-900">今日摄入</h1>
        <p className="mb-2 text-center text-sm text-gray-500">{todayDate}</p>
        {todayIntention && (
          <div className="flex justify-center mb-2">
            <span className={`text-xs px-3 py-1 rounded-full ${
              todayIntention === '严谨控制' ? 'bg-green-100 text-green-700' :
              todayIntention === '社交放松' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              今日：{todayIntention}
            </span>
          </div>
        )}
        <p className="mb-8 text-center text-sm text-gray-500">
          目标: {dailyGoal.calories} 卡路里
        </p>

        <div className="flex justify-center">
          <CircularProgress current={currentIntake.calories} goal={dailyGoal.calories} />
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="border-0 bg-white shadow-sm rounded-lg p-5 space-y-5">
          <LinearProgress
            label="碳水化合物"
            current={currentIntake.carbs}
            goal={dailyGoal.carbs}
            color="text-amber-500"
            icon={Wheat}
          />
          <LinearProgress
            label="蛋白质"
            current={currentIntake.protein}
            goal={dailyGoal.protein}
            color="text-rose-500"
            icon={Drumstick}
          />
          <LinearProgress
            label="脂肪"
            current={currentIntake.fat}
            goal={dailyGoal.fat}
            color="text-sky-500"
            icon={Droplet}
          />
        </div>
      </div>

      <div className="px-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">今日餐食</h2>
        <div className="space-y-3">
          {meals.length > 0 ? (
            meals.map((meal, index) => <MealItem key={index} meal={meal} onDelete={onDelete} index={index} />)
          ) : (
            <p className="py-8 text-center text-gray-500">暂无餐食记录</p>
          )}
        </div>
      </div>

      {meals.length > 0 && (
        <div className="px-6 mt-6">
          <EmotionSummary meals={meals} aiInsight={aiInsight} />
        </div>
      )}
    </div>
  )
}
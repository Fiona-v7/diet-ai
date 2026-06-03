"use client"

import { useState } from "react"
import { Flame } from "lucide-react"

interface Meal {
  foodName: string
  calories: number
  carbs: number
  protein: number
  fat: number
  date: string
  mealTime: string
  emotion: string
}

interface HistoryPageProps {
  meals: Meal[]
  onClose: () => void
}

// 格式化日期显示
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[d.getDay()];
  return `${dateStr} 星期${weekday}`;
}

// 获取昨天日期
function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取今天日期
function getToday(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 日期加减
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function EmotionSummary({ meals }: { meals: Meal[] }) {
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

  if (total === 0) return null;

  if (allRealHunger) {
    emoji = '⭐';
    insight = '这一天每一次进食都是因为身体真的需要。你让食物回归了它最本质的功能。';
  } else if (realHunger >= total / 2) {
    emoji = '💚';
    insight = `这一天 ${realHunger} 次进食是因为真的饿了——你的身体在按需索取。`;
  } else if (emotionalEating > realHunger && emotionalEating >= total / 2) {
    emoji = '🧘';
    insight = `这一天有 ${emotionalEating} 次进食和情绪有关。这可能是一个信号——那时你可能压力比较大。`;
  } else if (social >= 2) {
    emoji = '🎉';
    insight = `这一天有 ${social} 次社交场合的进食。和重要的人一起吃饭，是生活的一部分。`;
  } else {
    emoji = '💪';
    insight = '这一天你在努力倾听自己的身体。';
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
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">心态小结</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{insight}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(emotionCounts).map(([emotion, count]) => (
              <span key={emotion} className={`text-xs px-2 py-1 rounded-full ${emotionColors[emotion] || 'bg-gray-100 text-gray-600'}`}>
                {emotion} ×{count}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HistoryPage({ meals, onClose }: HistoryPageProps) {
  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(getYesterday());

  const dateMeals = meals.filter((m) => m.date === selectedDate);
  const totalCalories = dateMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalCarbs = dateMeals.reduce((sum, m) => sum + m.carbs, 0);
  const totalProtein = dateMeals.reduce((sum, m) => sum + m.protein, 0);
  const totalFat = dateMeals.reduce((sum, m) => sum + m.fat, 0);

  const isToday = selectedDate === today;

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-12 pb-24">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onClose} className="text-gray-600 text-lg">
          ← 返回
        </button>
        <h1 className="text-xl font-semibold text-gray-900">历史记录</h1>
        <div className="w-10" />
      </div>

      {/* 日期选择器 */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setSelectedDate((d) => addDays(d, -1))}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{formatDate(selectedDate)}</p>
          {isToday && <p className="text-xs text-green-600">今天</p>}
        </div>
        <button
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
          disabled={isToday}
          className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center ${isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* 当日营养汇总 */}
      {dateMeals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">摄入汇总</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{totalCalories}</p>
              <p className="text-xs text-gray-500">千卡</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{totalCarbs}</p>
              <p className="text-xs text-gray-500">碳水g</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-600">{totalProtein}</p>
              <p className="text-xs text-gray-500">蛋白g</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-sky-600">{totalFat}</p>
              <p className="text-xs text-gray-500">脂肪g</p>
            </div>
          </div>
        </div>
      )}

      {/* 餐食列表 */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          餐食记录 ({dateMeals.length})
        </h2>
        {dateMeals.length > 0 ? (
          <div className="space-y-3">
            {dateMeals.map((meal, index) => (
              <HistoryMealItem key={index} meal={meal} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-400 mb-2">📭</p>
            <p className="text-sm text-gray-500">这一天没有餐食记录</p>
          </div>
        )}
      </div>

      {/* 心态小结 */}
      {dateMeals.length > 0 && <EmotionSummary meals={dateMeals} />}
    </div>
  )
}

function HistoryMealItem({ meal }: { meal: Meal }) {
  const mealTimeColors: Record<string, string> = {
    '早餐': 'bg-yellow-100 text-yellow-700',
    '午餐': 'bg-orange-100 text-orange-700',
    '晚餐': 'bg-blue-100 text-blue-700',
    '加餐': 'bg-purple-100 text-purple-700',
  }

  const emotionColors: Record<string, string> = {
    '真饿了': 'bg-green-100 text-green-700',
    '常规': 'bg-blue-100 text-blue-700',
    '开心': 'bg-orange-100 text-orange-700',
    '社交': 'bg-purple-100 text-purple-700',
    '无聊': 'bg-yellow-100 text-yellow-700',
    '焦虑': 'bg-red-100 text-red-700',
  }

  return (
    <div className="border-0 bg-white shadow-sm rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <Flame className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{meal.foodName}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${mealTimeColors[meal.mealTime] || 'bg-gray-100 text-gray-600'}`}>
              {meal.mealTime}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${emotionColors[meal.emotion] || 'bg-gray-100 text-gray-600'}`}>
              {meal.emotion}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            碳水 {meal.carbs}g · 蛋白质 {meal.protein}g · 脂肪 {meal.fat}g
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{meal.calories}</p>
        <p className="text-xs text-gray-500">卡路里</p>
      </div>
    </div>
  )
}
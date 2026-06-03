'use client';

import { useState, useEffect, useCallback } from 'react';
import Dashboard from '@/components/Dashboard';
import SettingsPage from '@/components/SettingsPage';

interface Nutrition {
  foodName: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

// 餐食记录类型：在原来基础上增加了 date 和 mealTime
interface Meal extends Nutrition {
  date: string;       // 格式 "2026-05-28"
  mealTime: string;   // "早餐" | "午餐" | "晚餐" | "加餐"
}

const defaultGoal = { calories: 2000, carbs: 200, protein: 100, fat: 60 };

// 获取今天的日期字符串
function getToday(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [dailyGoal, setDailyGoal] = useState(defaultGoal);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [mealTime, setMealTime] = useState('午餐');  // 餐次选择
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);  // 控制设置页显示

  // 首次加载时从 localStorage 读取数据
  useEffect(() => {
    const savedGoal = localStorage.getItem('diet-goal');
    const savedMeals = localStorage.getItem('diet-meals');
    if (savedGoal) setDailyGoal(JSON.parse(savedGoal));
    if (savedMeals) setMeals(JSON.parse(savedMeals));
  }, []);

  // 每次数据变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('diet-goal', JSON.stringify(dailyGoal));
    localStorage.setItem('diet-meals', JSON.stringify(meals));
  }, [dailyGoal, meals]);

  // 只汇总今天的记录
  const today = getToday();
  const todayMeals = meals.filter((m) => m.date === today);
  const currentIntake = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      carbs: acc.carbs + meal.carbs,
      protein: acc.protein + meal.protein,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, carbs: 0, protein: 0, fat: 0 }
  );

  // 调用 AI 接口添加餐食，同时带上 date 和 mealTime
  const addMeal = useCallback(async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (data.error) {
        alert('AI 分析失败: ' + data.error);
        return;
      }
      const newMeal: Meal = {
        foodName: data.foodName,
        calories: data.calories,
        carbs: data.carbs,
        protein: data.protein,
        fat: data.fat,
        date: getToday(),
        mealTime: mealTime,
      };
      setMeals((prev) => [...prev, newMeal]);
      setDescription('');
      setShowModal(false);
    } catch (error) {
      alert('请求失败，请检查服务器是否运行');
    } finally {
      setLoading(false);
    }
  }, [description, mealTime]);

  // 如果正在显示设置页面，就渲染设置页
  if (showSettings) {
    return (
      <SettingsPage
        currentGoal={dailyGoal}
        onSave={(newGoal) => setDailyGoal(newGoal)}
        onClose={() => setShowSettings(false)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Dashboard
        dailyGoal={dailyGoal}
        currentIntake={currentIntake}
        meals={todayMeals}
        todayDate={today}
      />

      {/* 右上角设置按钮 */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center z-50 hover:bg-gray-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <span className="sr-only">设置</span>
      </button>

      {/* 右下角悬浮"+"按钮 */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 text-white rounded-full text-3xl shadow-lg flex items-center justify-center z-50 hover:bg-green-600"
      >
        +
      </button>

      {/* 模态框：输入食物描述 + 选择餐次 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-bold mb-4">添加一餐</h3>

            {/* 餐次选择 */}
            <div className="mb-3">
              <label className="text-sm text-gray-600 mb-1 block">餐次</label>
              <select
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="早餐">早餐</option>
                <option value="午餐">午餐</option>
                <option value="晚餐">晚餐</option>
                <option value="加餐">加餐</option>
              </select>
            </div>

            {/* 食物描述输入 */}
            <input
              type="text"
              placeholder="例如：一碗牛肉面"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600"
              >
                取消
              </button>
              <button
                onClick={addMeal}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
              >
                {loading ? '分析中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import Dashboard from '@/components/Dashboard';
import SettingsPage from '@/components/SettingsPage';
import HistoryPage from '@/components/HistoryPage';
import AuthPage from '@/components/AuthPage';
import { supabase } from '@/lib/supabase';

interface Nutrition {
  foodName: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface Meal extends Nutrition {
  id?: number;
  date: string;
  mealTime: string;
  emotion: string;
}

const defaultGoal = { calories: 2000, carbs: 200, protein: 100, fat: 60 };

function getToday(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [dailyGoal, setDailyGoal] = useState(defaultGoal);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [mealTime, setMealTime] = useState('午餐');
  const [emotion, setEmotion] = useState('常规');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [todayIntention, setTodayIntention] = useState<string>('');
  const [showIntention, setShowIntention] = useState(false);

  const today = getToday();

  // 检查登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 从云端加载数据
  useEffect(() => {
    if (!user) return;

    const loadGoals = async () => {
      const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).single();
      if (data) {
        setDailyGoal({
          calories: data.calories,
          carbs: data.carbs,
          protein: data.protein,
          fat: data.fat,
        });
      }
    };

    const loadMeals = async () => {
      const { data } = await supabase.from('meals').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) {
        setMeals(
          data.map((m: any) => ({
            id: m.id,
            foodName: m.food_name,
            calories: m.calories,
            carbs: m.carbs,
            protein: m.protein,
            fat: m.fat,
            date: m.date,
            mealTime: m.meal_time,
            emotion: m.emotion,
          }))
        );
      }
    };

    loadGoals();
    loadMeals();

    const savedIntention = localStorage.getItem('diet-intention');
    const savedIntentionDate = localStorage.getItem('diet-intention-date');
    if (savedIntention && savedIntentionDate === today) {
      setTodayIntention(savedIntention);
    } else {
      setShowIntention(true);
    }
  }, [user, today]);

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

  const addMeal = useCallback(async () => {
    if (!description.trim() || !user) return;
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

      const { data: inserted } = await supabase.from('meals').insert({
        user_id: user.id,
        food_name: data.foodName,
        calories: data.calories,
        carbs: data.carbs,
        protein: data.protein,
        fat: data.fat,
        date: today,
        meal_time: mealTime,
        emotion: emotion,
      }).select().single();

      if (inserted) {
        setMeals((prev) => [{
          id: inserted.id,
          foodName: inserted.food_name,
          calories: inserted.calories,
          carbs: inserted.carbs,
          protein: inserted.protein,
          fat: inserted.fat,
          date: inserted.date,
          mealTime: inserted.meal_time,
          emotion: inserted.emotion,
        }, ...prev]);
      }

      setDescription('');
      setShowModal(false);
    } catch (error) {
      alert('请求失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  }, [description, mealTime, emotion, today, user]);

  const deleteMeal = useCallback(async (index: number) => {
    const mealToDelete = todayMeals[index];
    if (!mealToDelete) return;

    if (mealToDelete.id) {
      await supabase.from('meals').delete().eq('id', mealToDelete.id);
    }

    setMeals((prev) => prev.filter((m) => m.id !== mealToDelete.id));
  }, [todayMeals]);

  const saveGoal = useCallback(async (newGoal: Nutrition) => {
    setDailyGoal(newGoal);
    if (user) {
      await supabase.from('goals').upsert({
        user_id: user.id,
        calories: newGoal.calories,
        carbs: newGoal.carbs,
        protein: newGoal.protein,
        fat: newGoal.fat,
        updated_at: new Date().toISOString(),
      });
    }
  }, [user]);

  const saveIntention = useCallback((intention: string) => {
    setTodayIntention(intention);
    localStorage.setItem('diet-intention', intention);
    localStorage.setItem('diet-intention-date', today);
    setShowIntention(false);
  }, [today]);

  // 未登录 → 显示登录页
  if (!user) {
    return <AuthPage />;
  }

  if (showSettings) {
    return (
      <SettingsPage
        currentGoal={dailyGoal}
        onSave={saveGoal}
        onClose={() => setShowSettings(false)}
      />
    );
  }

  if (showHistory) {
    return (
      <HistoryPage
        meals={meals}
        onClose={() => setShowHistory(false)}
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
        onDelete={deleteMeal}
        todayIntention={todayIntention}
      />

      <button
        onClick={() => setShowHistory(true)}
        className="fixed top-4 right-16 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center z-50 hover:bg-gray-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="sr-only">历史记录</span>
      </button>

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

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 text-white rounded-full text-3xl shadow-lg flex items-center justify-center z-50 hover:bg-green-600"
      >
        +
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-bold mb-4">添加一餐</h3>

            <div className="mb-3">
              <label className="text-sm text-gray-600 mb-1 block">餐次</label>
              <select value={mealTime} onChange={(e) => setMealTime(e.target.value)} className="w-full border p-2 rounded">
                <option value="早餐">早餐</option>
                <option value="午餐">午餐</option>
                <option value="晚餐">晚餐</option>
                <option value="加餐">加餐</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="text-sm text-gray-600 mb-1 block">此刻感受</label>
              <select value={emotion} onChange={(e) => setEmotion(e.target.value)} className="w-full border p-2 rounded">
                <option value="真饿了">🟢 真饿了</option>
                <option value="无聊">🟡 无聊</option>
                <option value="焦虑">🔴 焦虑</option>
                <option value="开心">🟠 开心</option>
                <option value="社交">🔵 社交场合</option>
                <option value="常规">⚪ 常规进食</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="例如：一碗牛肉面"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">取消</button>
              <button onClick={addMeal} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50">
                {loading ? '分析中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showIntention && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-bold mb-2 text-center">🌅 早上好</h3>
            <p className="text-sm text-gray-500 mb-4 text-center">今天你想怎么和食物相处？</p>
            <div className="space-y-3">
              <button onClick={() => saveIntention('严谨控制')} className="w-full p-3 rounded-lg border-2 border-green-300 hover:bg-green-50 text-left">
                <span className="text-lg mr-2">🎯</span>
                <span className="font-semibold text-gray-900">严谨控制</span>
                <p className="text-xs text-gray-500 mt-1">严格按目标执行</p>
              </button>
              <button onClick={() => saveIntention('正常维持')} className="w-full p-3 rounded-lg border-2 border-blue-300 hover:bg-blue-50 text-left">
                <span className="text-lg mr-2">⚖️</span>
                <span className="font-semibold text-gray-900">正常维持</span>
                <p className="text-xs text-gray-500 mt-1">保持日常节奏</p>
              </button>
              <button onClick={() => saveIntention('社交放松')} className="w-full p-3 rounded-lg border-2 border-purple-300 hover:bg-purple-50 text-left">
                <span className="text-lg mr-2">🎉</span>
                <span className="font-semibold text-gray-900">社交放松</span>
                <p className="text-xs text-gray-500 mt-1">今天有饭局或聚会</p>
              </button>
            </div>
            <button onClick={() => saveIntention('正常维持')} className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600">跳过</button>
          </div>
        </div>
      )}
    </main>
  );
}
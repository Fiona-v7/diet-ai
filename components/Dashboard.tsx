"use client"

import { Flame, Drumstick, Wheat, Droplet } from "lucide-react"

interface NutritionData {
  calories: number
  carbs: number
  protein: number
  fat: number
}

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

interface DashboardProps {
  dailyGoal: NutritionData
  currentIntake: NutritionData
  meals: Meal[]
  todayDate: string
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

function MealItem({ meal }: { meal: Meal }) {
  const mealTimeColors: Record<string, string> = {
    '早餐': 'bg-yellow-100 text-yellow-700',
    '午餐': 'bg-orange-100 text-orange-700',
    '晚餐': 'bg-blue-100 text-blue-700',
    '加餐': 'bg-purple-100 text-purple-700',
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
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
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

export default function Dashboard({ dailyGoal, currentIntake, meals, todayDate }: DashboardProps) {
  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-green-50 to-gray-50 px-6 pb-8 pt-12">
        <h1 className="mb-1 text-center text-xl font-semibold text-gray-900">今日摄入</h1>
        <p className="mb-2 text-center text-sm text-gray-500">{todayDate}</p>
        <p className="mb-8 text-center text-sm text-gray-500">
          目标: {dailyGoal.calories} 卡路里
        </p>

        <div className="flex justify-center">
          <CircularProgress current={currentIntake.calories} goal={dailyGoal.calories} />
        </div>
      </div>

      {/* Macro Progress Bars */}
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

      {/* Meals List */}
      <div className="px-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">今日餐食</h2>
        <div className="space-y-3">
          {meals.length > 0 ? (
            meals.map((meal, index) => <MealItem key={index} meal={meal} />)
          ) : (
            <p className="py-8 text-center text-gray-500">暂无餐食记录</p>
          )}
        </div>
      </div>
    </div>
  )
}
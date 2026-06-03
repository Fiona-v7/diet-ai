"use client"

import { useState } from "react"

interface NutritionData {
  calories: number
  carbs: number
  protein: number
  fat: number
}

interface SettingsPageProps {
    currentGoal: NutritionData
    onSave: (goal: NutritionData) => void | Promise<void>
    onClose: () => void
  }

export default function SettingsPage({ currentGoal, onSave, onClose }: SettingsPageProps) {
  const [calories, setCalories] = useState(currentGoal.calories.toString())
  const [carbs, setCarbs] = useState(currentGoal.carbs.toString())
  const [protein, setProtein] = useState(currentGoal.protein.toString())
  const [fat, setFat] = useState(currentGoal.fat.toString())

  const handleSave = () => {
    const newGoal: NutritionData = {
      calories: Number(calories) || currentGoal.calories,
      carbs: Number(carbs) || currentGoal.carbs,
      protein: Number(protein) || currentGoal.protein,
      fat: Number(fat) || currentGoal.fat,
    }
    onSave(newGoal)
    onClose()
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-12 pb-24">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onClose} className="text-gray-600 text-lg">
          ← 返回
        </button>
        <h1 className="text-xl font-semibold text-gray-900">目标设置</h1>
        <div className="w-10" /> {/* 占位，保持标题居中 */}
      </div>

      {/* 设置表单 */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* 热量目标 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            每日热量目标（千卡）
          </label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="例如：2000"
          />
          <p className="text-xs text-gray-500 mt-1">
            建议：女性 1800-2200，男性 2000-2500（减脂期可适当减少 300-500）
          </p>
        </div>

        {/* 碳水化合物 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            碳水化合物目标（克）
          </label>
          <input
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="例如：200"
          />
          <p className="text-xs text-gray-500 mt-1">
            建议：占总热量的 45-65%（每克碳水=4千卡）
          </p>
        </div>

        {/* 蛋白质 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            蛋白质目标（克）
          </label>
          <input
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="例如：100"
          />
          <p className="text-xs text-gray-500 mt-1">
            建议：体重(kg) × 1.2-2.0 克（减脂期建议 1.5-2.0 克/公斤体重）
          </p>
        </div>

        {/* 脂肪 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            脂肪目标（克）
          </label>
          <input
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="例如：60"
          />
          <p className="text-xs text-gray-500 mt-1">
            建议：占总热量的 20-35%（每克脂肪=9千卡）
          </p>
        </div>
      </div>

      {/* 保存按钮 */}
      <button
        onClick={handleSave}
        className="w-full mt-8 bg-green-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors"
      >
        保存设置
      </button>
    </div>
  )
}
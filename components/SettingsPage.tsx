"use client"

import { useState, useRef } from "react"

interface NutritionData {
  calories: number
  carbs: number
  protein: number
  fat: number
}

interface SettingsPageProps {
  currentGoal: NutritionData
  photoBase64: string
  onSave: (goal: NutritionData) => void | Promise<void>
  onPhotoChange: (photo: string) => void
  onClose: () => void
}

export default function SettingsPage({ currentGoal, photoBase64, onSave, onPhotoChange, onClose }: SettingsPageProps) {
  const [calories, setCalories] = useState(currentGoal.calories.toString())
  const [carbs, setCarbs] = useState(currentGoal.carbs.toString())
  const [protein, setProtein] = useState(currentGoal.protein.toString())
  const [fat, setFat] = useState(currentGoal.fat.toString())
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        onPhotoChange(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-12 pb-24">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onClose} className="text-gray-600 text-lg">
          ← 返回
        </button>
        <h1 className="text-xl font-semibold text-gray-900">目标设置</h1>
        <div className="w-10" />
      </div>

      {/* 减脂小人照片 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">减脂小人形象</h3>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center overflow-hidden">
            {photoBase64 ? (
              <img src={photoBase64} alt="减脂小人" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">🥗</span>
            )}
          </div>
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              {photoBase64 ? '更换照片' : '上传照片'}
            </button>
            {photoBase64 && (
              <button
                onClick={() => onPhotoChange('')}
                className="ml-2 px-4 py-2 text-gray-500 text-sm hover:text-red-500"
              >
                移除
              </button>
            )}
            <p className="text-xs text-gray-400 mt-1">
              上传自己的照片，小人会根据每日热量完成度变化表情
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* 目标设置表单 */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
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

      <button
        onClick={handleSave}
        className="w-full mt-8 bg-green-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors"
      >
        保存设置
      </button>
    </div>
  )
}
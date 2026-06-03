"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleAuth = async () => {
    if (!email || !password) {
      setMessage("请填写邮箱和密码")
      return
    }
    if (password.length < 6) {
      setMessage("密码至少 6 位")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage("注册成功！请查看邮箱确认链接（或直接登录）")
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error: any) {
      setMessage(error.message || "认证失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-4xl">🥗</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">减脂心态伴侣</h1>
          <p className="text-sm text-gray-500 mt-1">理解为什么吃，比计算吃了多少更重要</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              className="w-full border p-2 rounded"
            />
          </div>

          {message && (
            <p className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '处理中...' : isSignUp ? '注册' : '登录'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isSignUp ? '已有账号？' : '没有账号？'}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
            className="text-green-600 ml-1 hover:underline"
          >
            {isSignUp ? '登录' : '注册'}
          </button>
        </p>
      </div>
    </div>
  )
}
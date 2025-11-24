'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
  id: number
  name: string
  email: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
        })

        if (!response.ok) {
          // 認証エラーの場合、ログインページへ
          router.push('/login')
          return
        }

        const datas = await response.json()
        setUser(datas.data)
        setIsLoading(false)
      } catch (error) {
        console.error('ユーザー情報の取得に失敗:', error)
        router.push('/login')
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        router.push('/login?message=logged_out')
      } else {
        console.error('ログアウトに失敗:', response.status)
      }
    } catch (error) {
      console.error('ログアウトに失敗:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">認証情報を確認中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                勤怠管理システム
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-gray-700">
                  {user.name} さん
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ダッシュボード
            </h2>
            <p className="text-gray-600">
              ログインに成功しました！
            </p>
            {user && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">ユーザー情報</h3>
                <p className="text-sm text-gray-600">ID: {user.id}</p>
                <p className="text-sm text-gray-600">名前: {user.name}</p>
                <p className="text-sm text-gray-600">メール: {user.email}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

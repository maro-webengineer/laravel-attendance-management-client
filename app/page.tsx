import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          勤怠管理システム
        </h1>
        <p className="text-gray-600">
          へようこそ
        </p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ログイン
          </Link>
          <Link
            href="/dashboard"
            className="block w-full px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ダッシュボード
          </Link>
        </div>
      </div>
    </div>
  )
}

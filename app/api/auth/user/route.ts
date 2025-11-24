import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

    // クライアントから送られてくるクッキーを取得
    const cookieHeader = request.headers.get('cookie') || ''

    // クッキーを解析して確認
    const cookies = cookieHeader.split(';').map(c => c.trim())

    cookies.forEach((cookie, index) => {
      const [name] = cookie.split('=')
    })

    if (!cookieHeader) {
      return NextResponse.json(
        { message: '認証情報がありません' },
        { status: 401 }
      )
    }

    const meResponse = await fetch(`${apiUrl}/api/user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Cookie': cookieHeader,
      },
    })

    console.log('📡 ユーザー情報レスポンスステータス:', meResponse.status)

    if (!meResponse.ok) {
      const errorText = await meResponse.text()
      console.error('❌ エラーレスポンス:', errorText)
      return NextResponse.json(
        { message: '認証に失敗しました' },
        { status: meResponse.status }
      )
    }

    const data = await meResponse.json()
    console.log('📦 レスポンスデータ:', data)

    // レスポンスをそのまま返す
    const response = NextResponse.json(data)

    // セッションクッキーを更新する場合に備えて転送
    const setCookieHeaders: string[] = []
    meResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        setCookieHeaders.push(value)
      }
    })

    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach(cookie => {
        response.headers.append('set-cookie', cookie)
      })
    }

    return response

  } catch (error) {
    console.error('❌ ユーザー情報取得エラー:', error)
    if (error instanceof Error) {
      console.error('メッセージ:', error.message)
      console.error('スタック:', error.stack)
    }
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

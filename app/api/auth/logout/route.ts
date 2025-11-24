import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

    // クライアントから送られてくるクッキーを取得
    const cookieHeader = request.headers.get('cookie') || ''

    // XSRF-TOKENを抽出
    let xsrfToken = ''
    const xsrfMatch = cookieHeader.match(/XSRF-TOKEN=([^;]+)/)
    if (xsrfMatch) {
      xsrfToken = decodeURIComponent(xsrfMatch[1])
    }

    // リクエストのOriginとRefererを動的に取得
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const referer = request.headers.get('referer') || origin

    const logoutResponse = await fetch(`${apiUrl}/api/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': xsrfToken,
        'Cookie': cookieHeader,
        'Referer': referer,
        'Origin': origin,
      },
    })

    if (!logoutResponse.ok) {
      const data = await logoutResponse.json().catch(() => ({}))
      return NextResponse.json(
        { message: data.message || 'ログアウトに失敗しました' },
        { status: logoutResponse.status }
      )
    }

    // ログアウト成功時、クッキーをクライアントに転送（セッション削除のため）
    const response = NextResponse.json({ message: 'ログアウトしました' })

    // LaravelのセッションクッキーをNext.jsのレスポンスに追加
    const logoutCookies = logoutResponse.headers.get('set-cookie')
    if (logoutCookies) {
      response.headers.set('set-cookie', logoutCookies)
    }

    return response

  } catch (error) {
    console.error('❌ ログアウトエラー:', error)
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

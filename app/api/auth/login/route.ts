import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

    const csrfResponse = await fetch(`${apiUrl}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!csrfResponse.ok) {
      throw new Error('CSRF トークンの取得に失敗しました')
    }

    // レスポンスのSet-Cookieヘッダーからすべてのクッキーを取得
    const allCookies: string[] = []
    csrfResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        allCookies.push(value)
      }
    })

    // XSRF-TOKENを抽出
    let xsrfToken = ''
    for (const cookie of allCookies) {
      const xsrfMatch = cookie.match(/XSRF-TOKEN=([^;]+)/)
      if (xsrfMatch) {
        xsrfToken = decodeURIComponent(xsrfMatch[1])
        break
      }
    }

    // すべてのクッキーを結合（セッションクッキーも含む）
    const cookieString = allCookies
      .map(cookie => {
        // Set-Cookieヘッダーの形式から、クッキー名=値の部分だけを抽出
        const match = cookie.match(/^([^=]+=[^;]+)/)
        return match ? match[1] : cookie.split(';')[0]
      })
      .join('; ')

    // リクエストのOriginとRefererを動的に取得（これがないと405エラーになる）
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const referer = request.headers.get('referer') || origin

    const loginResponse = await fetch(`${apiUrl}/api/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': xsrfToken,
        'Cookie': cookieString,
        'Referer': referer,
        'Origin': origin,
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await loginResponse.json()
    console.log('📦 loginResponseeeees:', loginResponse)

    if (!loginResponse.ok) {
      return NextResponse.json(
        { message: data.message || 'ログインに失敗しました' },
        { status: loginResponse.status }
      )
    }

    // ログイン成功時、クッキーをクライアントに転送
    const response = NextResponse.json(data)

    // LaravelのセッションクッキーをNext.jsのレスポンスに追加
    // 複数のSet-Cookieヘッダーがある場合に対応
    const setCookieHeaders: string[] = []
    loginResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        setCookieHeaders.push(value)
      }
    })

    // すべてのSet-Cookieヘッダーを転送（属性を維持）
    setCookieHeaders.forEach(cookie => {
      // クッキーの属性（domain、path、sameSite、secureなど）を維持
      // Next.jsのappendは完全なSet-Cookieヘッダーをそのまま転送する
      response.headers.append('set-cookie', cookie)
    })

    return response

  } catch (error) {
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

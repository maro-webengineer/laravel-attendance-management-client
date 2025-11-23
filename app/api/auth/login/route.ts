import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
    console.log('🔍 API URL:', apiUrl)

    // Step 1: CSRFクッキーを取得
    console.log('📝 Step 1: CSRFトークン取得中...')
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

    console.log('🍪 取得したクッキー:', allCookies)

    // XSRF-TOKENを抽出
    let xsrfToken = ''
    for (const cookie of allCookies) {
      const xsrfMatch = cookie.match(/XSRF-TOKEN=([^;]+)/)
      if (xsrfMatch) {
        xsrfToken = decodeURIComponent(xsrfMatch[1])
        console.log('✅ XSRFトークン抽出成功:', xsrfToken.substring(0, 20) + '...')
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

    console.log('✅ クッキー文字列:', cookieString.substring(0, 100) + '...')

    // Step 2: ログインリクエスト
    console.log('🔐 Step 2: ログインリクエスト送信中...')

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

    console.log('📡 ログインレスポンスステータス:', loginResponse.status)

    const data = await loginResponse.json()
    console.log('📦 レスポンスデータ:', data)

    if (!loginResponse.ok) {
      return NextResponse.json(
        { message: data.message || 'ログインに失敗しました' },
        { status: loginResponse.status }
      )
    }

    // ログイン成功時、クッキーをクライアントに転送
    const response = NextResponse.json(data)

    // LaravelのセッションクッキーをNext.jsのレスポンスに追加
    const loginCookies = loginResponse.headers.get('set-cookie')
    if (loginCookies) {
      response.headers.set('set-cookie', loginCookies)
    }
    console.log('response前 : ')
    return response

  } catch (error) {
    console.error('❌ ログインエラー:', error)
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

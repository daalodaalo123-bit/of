import { NextRequest, NextResponse } from 'next/server'

const VALID_CREDENTIALS = {
  username: 'fod',
  password: 'fod3322',
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      return NextResponse.json({ 
        success: true,
        message: 'Login successful',
        username: username
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Expense from '@/models/Expense'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const query: Record<string, any> = {}
    if (category && category.trim()) {
      query.category = category.trim()
    }

    const expenses = await Expense.find(query).sort({ expenseDate: -1, createdAt: -1 })
    return NextResponse.json(expenses)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    const amount = Number(body.amount)
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const validCategories = ['supplies', 'rent', 'salaries', 'utilities', 'equipment', 'other']
    const category = body.category && validCategories.includes(body.category) ? body.category : 'other'

    const expenseData = {
      id: body.id || `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount,
      category,
      description: body.description || null,
      expenseDate: body.expenseDate ? new Date(body.expenseDate) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const expense = new Expense(expenseData)
    await expense.save()

    return NextResponse.json(expense, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Expense from '@/models/Expense'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const expense = await Expense.findOne({ id: params.id })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()

    const validCategories = ['supplies', 'rent', 'salaries', 'utilities', 'equipment', 'other']
    if (body.category && !validCategories.includes(body.category)) {
      delete body.category
    }
    if (body.amount !== undefined) {
      const amount = Number(body.amount)
      if (isNaN(amount) || amount < 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      }
      body.amount = amount
    }
    if (body.expenseDate) {
      body.expenseDate = new Date(body.expenseDate)
    }

    body.updatedAt = new Date()

    const expense = await Expense.findOneAndUpdate({ id: params.id }, body, {
      new: true,
      runValidators: true,
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const expense = await Expense.findOneAndDelete({ id: params.id })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Expense deleted successfully', expense })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

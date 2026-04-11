import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Treatment from '../../../models/Treatment';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    const query = patientId ? { patientId } : {};
    const treatments = await Treatment.find(query).sort({ date: -1 });
    return NextResponse.json(treatments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { patientId, patientName, title, notes, beforeImages, afterImages, date } = body;

    if (!patientId || !patientName || !title || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const treatment = await Treatment.create({
      patientId,
      patientName,
      title,
      notes: notes || '',
      beforeImages: beforeImages || [],
      afterImages: afterImages || [],
      date: new Date(date),
    });

    return NextResponse.json(treatment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

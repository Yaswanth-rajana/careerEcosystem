import { NextResponse } from 'next/server';
import { ForgotPasswordSchema } from '@backend/validations/schemas';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ForgotPasswordSchema.parse(body);

    return NextResponse.json({
      success: true,
      message: `Password reset instructions have been sent to ${validated.email}.`,
    });
  } catch (error: any) {
    if (error.errors && error.errors[0]?.message) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Invalid email address' }, { status: 400 });
  }
}

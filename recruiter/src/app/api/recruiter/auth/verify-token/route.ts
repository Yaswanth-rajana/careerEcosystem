import { NextResponse } from 'next/server';
import { PasswordSetupTokenService } from '@backend/services/passwordSetupTokenService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'No setup token provided.' }, { status: 400 });
    }

    const verification = await PasswordSetupTokenService.verifyToken(token);
    if (!verification.valid || !verification.user) {
      return NextResponse.json({ valid: false, error: verification.error }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        name: verification.user.name,
        email: verification.user.email,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err.message }, { status: 500 });
  }
}

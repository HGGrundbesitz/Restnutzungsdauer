import {NextResponse} from 'next/server';

// Legacy endpoint intentionally disabled to prevent an unauthenticated mail relay.
export async function POST() {
  return NextResponse.json(
    {error: 'Dieser Endpunkt wurde durch /api/rnd-estimate ersetzt.'},
    {status: 410, headers: {'Cache-Control': 'no-store'}},
  );
}

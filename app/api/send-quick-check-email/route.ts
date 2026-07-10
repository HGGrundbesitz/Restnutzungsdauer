import {NextResponse} from 'next/server';

export async function POST() {
  return NextResponse.json(
    {error: 'Dieser Endpunkt wurde durch /api/rnd-estimate ersetzt.'},
    {status: 410, headers: {'Cache-Control': 'no-store'}},
  );
}

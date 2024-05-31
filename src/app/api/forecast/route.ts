import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const prisma = new PrismaClient();
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const horizon = parseInt(searchParams.get('horizon') || '0');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'startDate and endDate are required.' }, { status: 400 });
  }

  try {
    const windActualData = await prisma.windActual.findMany({
      where: { startTime: { gte: startDate, lte: endDate } },
      select: { startTime: true, generation: true },
    });

    const windForecastData = await prisma.windForecast.findMany({
      where: { startTime: { gte: startDate, lte: endDate } },
      select: { startTime: true, publishTime: true, generation: true },
      orderBy: { startTime: 'asc' },
    });
    console.log(windActualData);
    console.log(windForecastData);

    return NextResponse.json({ windActualData, windForecastData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching wind data:', error);
    return NextResponse.json({ error: 'An error occurred while fetching wind data.' }, { status: 500 });
  }
}
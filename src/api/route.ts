import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
// import prisma from '../../lib/prisma';
const prisma  = new PrismaClient();
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = (searchParams.get('formattedStartDate') || '');
  const endDate = (searchParams.get('formattedEndDate') || '');
  const horizon = parseInt(searchParams.get('horizon') || '0');
 const newstart = new Date(startDate);
  const publish = new Date(newstart.getTime() - horizon * 60000);
  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'startDate and endDate are required.' }, { status: 400 });
  }

  try {
    const windActualData = await prisma.windActual.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        startTime: true,
        generation: true,
      },
    });

    const windForecastData = await prisma.windForecast.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        publishTime: {
          lte: publish.toISOString(),
        },
      },
      select: {
        startTime: true,
        publishTime: true,
        generation: true,
      },
    });

    return NextResponse.json({ windActualData, windForecastData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching wind data:', error);
    return NextResponse.json({ error: 'An error occurred while fetching wind data.' }, { status: 500 });
  }
}
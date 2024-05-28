-- CreateTable
CREATE TABLE "WindActual" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "generation" INTEGER NOT NULL,

    CONSTRAINT "WindActual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WindForecast" (
    "id" SERIAL NOT NULL,
    "publishTime" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "generation" INTEGER NOT NULL,

    CONSTRAINT "WindForecast_pkey" PRIMARY KEY ("id")
);

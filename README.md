# Weather Forecasting App

Welcome to the Weather Forecasting App!
## Getting Started

Follow these instructions to set up and run the app on your local machine.

### Prerequisites

- Ensure you have [Docker](https://www.docker.com/get-started) installed on your machine.

### Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/R1shA3h/Wind-forcast.git
    cd Wind-forecast
    ```

2. **Start the application with Docker Compose**:

    ```bash
    docker compose up
    ```

    This command will build and start the Docker containers. Please wait for 250-300 seconds for Docker to set up everything for you.

3. **Access the application**:

    Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to see the result.

### Forecast is now on your fingertips!

![image](https://github.com/R1shA3h/Wind-forcast/assets/99585764/c010b229-4f68-41c7-8c22-42a16eaac9b2)

## File directory structure
```bash
├── wind-forecast
│   ├── .next
│   └── .vercel
├── data
│   ├── WINDACT.json
│   └── WINDFORCAST.json
├── lib
│   └── prisma.ts
├── node_modules
├── prisma
│   ├── migrations
│   └── schema.prisma
├── seed.js
├── public
├── src
│   └── app
│       ├── api
│       │   └── forecast
│       │       └── route.ts
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── .dockerignore
├── .env
├── .eslintrc.json
├── .gitignore
├── compose.yaml
├── Dockerfile
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.js
├── postcss.config.mjs
├── README.Docker.md
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```
## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a new Pull Request.

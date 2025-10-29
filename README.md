# Webhook Inspector

A tool for inspecting and managing webhooks with a modern web interface.

## Project Structure

- `api/` - Backend API server
- `web/` - Frontend web application

## Technologies

### Backend (API)
- Node.js
- TypeScript
- Drizzle ORM
- Docker (for database)

### Frontend (Web)
- React
- TypeScript
- Vite
- ESLint

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jhordanjes/webhook-inspector.git
cd webhook-inspector
```

2. Install dependencies:
```bash
pnpm install
```

3. Setup the API:
```bash
cd api
# Start the database
docker-compose up -d
# Run migrations
pnpm drizzle-kit push:pg
```

4. Setup environment variables:
- Create `.env` file in the `api` directory based on the example file

## Development

1. Start the API server:
```bash
cd api
pnpm dev
```

2. Start the web application:
```bash
cd web
pnpm dev
```

The web application will be available at `http://localhost:5173` and the API at `http://localhost:3000`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
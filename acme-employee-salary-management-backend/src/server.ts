import { env } from '@/config/env';
import createApp from '@/app';
import prisma from '@/database/client';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[server] Running on http://localhost:${env.port}`);
});

// ── Graceful shutdown ─────────────────────────────────────────

async function shutdown(signal: string) {
  console.log(`[server] ${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[server] Prisma disconnected. Goodbye.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

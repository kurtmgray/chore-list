import Fastify from 'fastify';
import cors from '@fastify/cors';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from './trpc/appRouter';
import { createContext } from './trpc/context';
import { config } from './config';

const server = Fastify({
  maxParamLength: 5000,
});

async function main() {
  // Register CORS
  await server.register(cors, {
    origin: ['http://localhost:5173'], // Vite dev server
    credentials: true,
  });

  // Register tRPC
  await server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }: { path?: string; error: any }) {
        console.error(`❌ tRPC failed on ${path ?? '<no-path>'}:`, error);
      },
    },
  });

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  try {
    await server.listen({ port: config.PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${config.PORT}`);
    console.log(`📡 tRPC endpoint: http://localhost:${config.PORT}/trpc`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
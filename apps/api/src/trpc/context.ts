import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../database';

export interface CreateContextOptions {
  req: FastifyRequest;
  res: FastifyReply;
}

export async function createContext({ req, res }: CreateContextOptions) {
  // For SLC: no auth, hardcode user/workspace
  // Future: Extract from JWT token or session
  return {
    db,
    req,
    res,
    // SLC defaults - will be replaced with real auth later
    userId: 1, // Kurt by default
    workspaceId: 1, // Kurt & Kaya household
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstashConfig =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

// Fallback simples em memória para desenvolvimento local (não distribuído,
// não use em produção com múltiplas instâncias).
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryLimiter(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}

const upstashLimiter = hasUpstashConfig
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "finance-app:ratelimit",
    })
  : null;

/**
 * Limita tentativas por chave (ex: IP, e-mail) — usado em login, registro e
 * troca de senha para mitigar brute-force.
 */
export async function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  if (upstashLimiter) {
    const result = await upstashLimiter.limit(key);
    return { success: result.success, remaining: result.remaining };
  }
  return memoryLimiter(key, limit, windowMs);
}

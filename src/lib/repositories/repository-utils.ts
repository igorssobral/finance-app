export async function withDbFallback<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Can't reach database server") || message.includes("ECONNREFUSED") || message.includes("P1001")) {
      return fallback;
    }

    throw error;
  }
}

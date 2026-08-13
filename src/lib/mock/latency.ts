export function latency(ms?: number) {
  const wait = ms ?? 120 + Math.random() * 180;
  return new Promise((resolve) => setTimeout(resolve, wait));
}

export function rejectWith(message: string): Promise<never> {
  return Promise.reject(new Error(message));
}
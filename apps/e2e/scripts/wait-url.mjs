const url = process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:4444";
const attempts = Number(process.env.WAIT_URL_ATTEMPTS ?? 80);
const intervalMs = Number(process.env.WAIT_URL_INTERVAL_MS ?? 250);

for (let i = 0; i < attempts; i += 1) {
  try {
    const res = await fetch(url);
    if (res.ok) process.exit(0);
  } catch {
    /* retry */
  }
  await new Promise((resolve) => setTimeout(resolve, intervalMs));
}

console.error(`[wait-url] ${url} did not become ready after ${attempts} attempts`);
process.exit(1);

import http from "node:http";
import net from "node:net";

const listenHost = process.env.WM_E2E_PROXY_HOST ?? "127.0.0.1";
const listenPort = Number(process.env.WM_E2E_PROXY_PORT ?? "4444");
const target = new URL(process.env.WM_E2E_PROXY_TARGET ?? "http://web:4444");
const targetPort = Number(target.port || (target.protocol === "https:" ? "443" : "80"));

if (target.protocol !== "http:") {
  throw new Error(`local-web-proxy only supports http targets, got ${target.href}`);
}

function upstreamHeaders(headers) {
  return { ...headers, host: target.host };
}

const server = http.createServer((req, res) => {
  const upstream = http.request(
    {
      hostname: target.hostname,
      port: targetPort,
      method: req.method,
      path: req.url,
      headers: upstreamHeaders(req.headers),
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.statusMessage, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  upstream.on("error", (err) => {
    if (res.headersSent) {
      res.destroy(err);
      return;
    }
    res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    res.end(`local web proxy upstream error: ${err.message}`);
  });

  req.pipe(upstream);
});

server.on("upgrade", (req, socket, head) => {
  const upstream = net.connect({ host: target.hostname, port: targetPort }, () => {
    upstream.write(`${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`);
    for (const [name, value] of Object.entries(upstreamHeaders(req.headers))) {
      if (value === undefined) continue;
      upstream.write(`${name}: ${Array.isArray(value) ? value.join(", ") : value}\r\n`);
    }
    upstream.write("\r\n");
    if (head.length > 0) upstream.write(head);
    upstream.pipe(socket);
    socket.pipe(upstream);
  });

  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
});

server.listen(listenPort, listenHost, () => {
  console.log(`[e2e-proxy] http://${listenHost}:${listenPort} -> ${target.origin}`);
});

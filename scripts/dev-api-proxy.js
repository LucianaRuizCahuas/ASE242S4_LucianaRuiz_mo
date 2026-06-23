const http = require("http");

const TARGET_HOST = process.env.API_TARGET_HOST || "localhost";
const TARGET_PORT = Number(process.env.API_TARGET_PORT || 8086);
const PROXY_PORT = Number(process.env.API_PROXY_PORT || 8090);

const buildCorsHeaders = (origin = "http://localhost:8082") => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
});

const applyCorsHeaders = (headers, origin) => {
  const nextHeaders = { ...headers };
  delete nextHeaders["access-control-allow-origin"];
  delete nextHeaders["access-control-allow-credentials"];
  delete nextHeaders["access-control-allow-methods"];
  delete nextHeaders["access-control-allow-headers"];

  return {
    ...nextHeaders,
    ...buildCorsHeaders(origin),
  };
};

const server = http.createServer((clientReq, clientRes) => {
  const origin = clientReq.headers.origin || "http://localhost:8082";

  if (clientReq.method === "OPTIONS") {
    clientRes.writeHead(204, buildCorsHeaders(origin));
    clientRes.end();
    return;
  }

  const headers = { ...clientReq.headers };
  delete headers.host;
  delete headers.origin;

  const proxyReq = http.request(
    {
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path: clientReq.url,
      method: clientReq.method,
      headers,
    },
    (proxyRes) => {
      const responseHeaders = { ...proxyRes.headers };
      delete responseHeaders["www-authenticate"];

      clientRes.writeHead(
        proxyRes.statusCode || 500,
        applyCorsHeaders(responseHeaders, origin),
      );
      proxyRes.pipe(clientRes);
    },
  );

  proxyReq.on("error", (error) => {
    clientRes.writeHead(502, {
      "Content-Type": "application/json",
      ...buildCorsHeaders(origin),
    });
    clientRes.end(
      JSON.stringify({
        message: "No se pudo conectar con el backend",
        detail: error.message,
      }),
    );
  });

  clientReq.pipe(proxyReq);
});

server.listen(PROXY_PORT, () => {
  console.log(
    `API proxy escuchando en http://localhost:${PROXY_PORT} -> http://${TARGET_HOST}:${TARGET_PORT}`,
  );
});

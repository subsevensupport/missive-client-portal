import http from "http";

const PORT = 3000;

const server = http.createServer((request, response) => {
  console.log(`${request.method} ${request.url}`);

  const headers = { "Content-Type": "text/html" };

  const routes = {
    "/": (request) => ({
      statusCode: 200,
      body: `<h1>Client Portal</h1><p>You requested ${request.url}</p>`,
    }),
    "/favicon.ico": (request) => ({
      statusCode: 204,
      body: "",
    }),
  };

  const defaultRoute = (request) => ({
    statusCode: 404,
    body: "The requested resource was not found.",
  });

  const routeHandler = routes[request.url] || defaultRoute;
  const route = routeHandler(request);

  const statusCode = route.statusCode;
  const body = route.body;

  console.log(`----> ${statusCode}: ${body}`);
  response.writeHead(statusCode, headers).end(body);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

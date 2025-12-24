import http from "http";

const PORT = 3000;

const server = http.createServer((request, response) => {
  console.log(`${request.method} ${request.url}`);

  const headers = { "Content-Type": "text/html" };

  const routes = {
    "/": {
      statusCode: 200,
      body: "<h1>Client Portal</h1>",
    },
    "/favicon.ico": {
      statusCode: 204,
      body: "",
    },
  };

  const defaultRoute = {
    statusCode: 404,
    body: "The requested resource was not found.",
  };

  const route = routes[request.url] || defaultRoute;

  const statusCode = route.statusCode;
  const body = route.body;

  console.log(`----> ${statusCode}: ${body}`);
  response.writeHead(statusCode, headers).end(body);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

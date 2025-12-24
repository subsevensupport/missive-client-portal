import http from "http";

const PORT = 3000;

const server = http.createServer((request, response) => {
  console.log(`${request.method} ${request.url}`);

  const routes = {
    "/": {
      headers: { "Content-Type": "text/html" },
      statusCode: 200,
      body: "<h1>Client Portal</h1>",
    },
    "/favicon.ico": {
      headers: { "Content-Type": "text/html" },
      statusCode: 204,
      body: "",
    },
  };

  const route = routes[request.url];
  const headers = route ? route.headers : { "Content-Type": "text/html" };

  const statusCode = route ? route.statusCode : 404;

  const body = route ? route.body : "The requested resource was not found.";

  console.log(`----> ${statusCode}: ${body}`);
  response.writeHead(statusCode, headers).end(body);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

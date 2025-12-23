import http from "http";

const PORT = 3000;

const server = http.createServer((request, response) => {
  console.log(`${request.method} ${request.url}`);

  let statusCode = 404;
  let headers = { "Content-Type": "text/html" };
  let body = "The requested resource was not found.";

  if (request.url === "/favicon.ico") {
    statusCode = 204;
    body = "";
  }
  if (request.url === "/") {
    statusCode = 200;
    body = "<h1>Client Portal</h1>";
  }

  console.log(`----> ${statusCode}: ${body}`);
  response.writeHead(statusCode, headers).end(body);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

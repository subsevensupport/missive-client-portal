import http from "http";

const PORT = 3000;

const server = http.createServer((request, response) => {
  console.log(`${request.method} ${request.url}`);

  const headers = { "Content-Type": "text/html" };

  let statusCode = 404;
  let body = "The requested resource was not found.";

  switch (request.url) {
    case "/":
      statusCode = 200;
      body = "<h1>Client Portal</h1>";
      break;
    case "/favicon.ico":
      statusCode = 204;
      body = "";
      break;
  }

  console.log(`----> ${statusCode}: ${body}`);
  response.writeHead(statusCode, headers).end(body);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

import http from "http";

const PORT = 3000;

const server = http.createServer((request, response) => {
  console.log("---");
  console.log("URL:", request.url);
  console.log("Method:", request.method);
  console.log("Headers:", request.headers);
  console.log("---");
  const statusCode = 200;
  const headers = { "Content-Type": "text/html" };
  response
    .writeHead(statusCode, headers)
    .end(`<h1>Hello Clients!</h1> <p>requested: ${request.url}</p>`);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

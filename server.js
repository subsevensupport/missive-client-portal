// Import Node's built-in HTTP module
// This gives us tools to create a web server
const http = require('http');

// Define which port our server will listen on
// Think of a port like an apartment number at an address
const PORT = 3000;

// Create the server
// This function runs every time someone visits our server
const server = http.createServer((request, response) => {
    // TODO(human): Write the response logic here
    //
    // Your task: Send back a greeting to the browser
    //
    // You have two tools available:
    //   response.writeHead(statusCode, headers) - Set the status and content type
    //   response.end(content) - Send the actual content and finish
    //
    // Example of writeHead: response.writeHead(200, { 'Content-Type': 'text/plain' })
    //   - 200 means "OK, everything worked"
    //   - 'text/plain' tells the browser "this is plain text, not HTML"
    //
    // Example of end: response.end('Some text here')
    //   - This sends the text and closes the connection

});

// Start the server listening for requests
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

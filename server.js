import http from "http";

const PORT = 3000;

const APIKEY = process.env.MISSIVE_API_KEY;

const MISSIVE_API_URL = "https://public.missiveapp.com/v1";
const CLIENT_LABELS = {
  NANN: "c460058e-4c8c-4a6e-a3cf-d8b296b7091d",
};

// Helper function to call Missive API
async function missiveFetch(endpoint) {
  const response = await fetch(`${MISSIVE_API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${APIKEY}`,
    },
  });
  return response.json();
}

const server = http.createServer(async (request, response) => {
  console.log(`${request.method} ${request.url}`);

  const routes = {
    "/": () => ({
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: `<h1>Client Portal</h1><p>Welcome! Try visiting <a href= "/tickets">/tickets</a></p>`,
    }),

    "/api/conversations": async () => {
      const conversationsData = await missiveFetch(
        `/conversations?shared_label=${CLIENT_LABELS["NANN"]}`,
      );
      const conversation = conversationsData.conversations[0];

      // come back to open/closed status - may have to get it from my user on the conversation
      // or if we can get the conversation level task
      const ticket = {
        id: conversation.id,
        title: conversation.subject,
        created_at: conversation.created_at,
        last_activity_at: conversation.last_activity_at,
        total_tasks: conversation.tasks_count,
        completed_tasks: conversation.completed_tasks_count,
      };

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket),
      };
    },

    "/tickets": async () => {
      const conversationsData = await missiveFetch(
        `/conversations?shared_label=${CLIENT_LABELS["NANN"]}`,
      );
      const conversation = conversationsData.conversations[0];

      const ticket = {
        id: conversation.id,
        title: conversation.subject,
        created_at: conversation.created_at,
        last_activity_at: conversation.last_activity_at,
        total_tasks: conversation.tasks_count,
        completed_tasks: conversation.completed_tasks_count,
      };

      function formatDateTime(unixTimestamp) {
        const date = new Date(unixTimestamp * 1000);
        const dateString = date.toLocaleDateString("en-US", {
          dateStyle: "medium",
        });
        const timeString = date.toLocaleTimeString("en-US", {
          timeStyle: "short",
        });
        return `${dateString} at ${timeString}`;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Client Portal</title>
        </head>
        <body>
          <h1>Your Tickets</h1>
          <ul>
            <li>
            <strong>${ticket.title}</strong>
              <ul>
                <li>${ticket.completed_tasks} out of ${ticket.total_tasks} tasks completed</li>
                <li>Created on ${formatDateTime(ticket.created_at)}</li>
                <li>Last activity on ${formatDateTime(ticket.last_activity_at)}</li>
              </ul>
            </li>
          </ul>
        </body>
        </html>
        `;

      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: html,
      };
    },

    "/favicon.ico": () => ({
      statusCode: 204,
      headers: { "Content-Type": "text/html" },
      body: "",
    }),
  };

  const defaultRoute = () => ({
    statusCode: 404,
    body: "The requested resource was not found.",
  });

  const routeHandler = routes[request.url] || defaultRoute;
  const route = await routeHandler();

  console.log(`----> ${route.statusCode}`);
  response.writeHead(route.statusCode, route.headers).end(route.body);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

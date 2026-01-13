import http from "http";

const PORT = 3000;

const APIKEY = process.env.MISSIVE_API_KEY;

const MISSIVE_API_URL = "https://public.missiveapp.com/v1";
const CLIENT_LABELS = {
  NANN: "c460058e-4c8c-4a6e-a3cf-d8b296b7091d",
};

async function missiveFetch(endpoint) {
  const response = await fetch(`${MISSIVE_API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${APIKEY}`,
    },
  });
  return response.json();
}

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

const server = http.createServer(async (request, response) => {
  console.log(`${request.method} ${request.url}`);

  const routes = {
    "/": () => ({
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: `<h1>Client Portal</h1><p>Welcome! Try visiting <a href= "/tickets">/tickets</a></p>`,
    }),

    "/tickets": async () => {
      const conversationsData = await missiveFetch(
        `/conversations?shared_label=${CLIENT_LABELS["NANN"]}`,
      );

      const tickets = conversationsData.conversations.map((conversation) => ({
        id: conversation.id,
        web_url: conversation.web_url,
        app_url: conversation.app_url,
        title: conversation.subject || conversation.latest_message_subject,
        team: conversation.team?.name ?? "none",
        closed: conversation.users?.[0]?.closed ?? undefined,
        created_at: conversation.created_at,
        last_activity_at: conversation.last_activity_at,
        total_tasks: conversation.tasks_count,
        completed_tasks: conversation.completed_tasks_count,
      }));

      const ticketsStr = tickets
        .map(
          (ticket) => `
        <li><a href="${ticket.app_url}"><strong>${ticket.title}</strong></a>
          <ul>
            <li>${ticket.closed ? "closed" : "open"}</li>
            <li>${ticket.team}</li>
            <li>${ticket.completed_tasks} out of ${ticket.total_tasks} tasks completed</li>
            <li>Created on ${formatDateTime(ticket.created_at)}</li>
            <li>Last activity on ${formatDateTime(ticket.last_activity_at)}</li>
          </ul>
        </li>
        `,
        )
        .join("");

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Client Portal</title>
        </head>
        <body>
          <h1>Your Tickets</h1>
          <ul>
            ${ticketsStr}
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

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

function formatSmartDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const now = new Date();

  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDay() === now.getDay()
  ) {
    return date.toLocaleTimeString("en-US", { timeStyle: "short" });
  }

  if (
    Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000)) <= 7
  ) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
        <div class="ticket">
          <a href="${ticket.app_url}" class="ticket-title">${ticket.title}</a>
          <div class="ticket-meta">
            <span class="status ${ticket.closed ? "closed" : "open"}">${ticket.closed ? "Closed" : "Open"}</span>
            <span class="team">${ticket.team}</span>
            <span class="tasks">${ticket.completed_tasks}/${ticket.total_tasks} tasks</span>
          </div>
          <div class="ticket-dates">
            <span class="created-date">Created: ${formatSmartDate(ticket.created_at)}</span>
            <span class="activity-date">Activity: ${formatSmartDate(ticket.last_activity_at)}</span>
          </div>
        </div>
        `,
        )
        .join("");

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Client Portal</title>
          <style>
            body {
              margin: 0 auto;
              padding: 20px;
              font-family: sans-serif;
              background: #f5f5f5;
            }

            .tickets-container {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 24px 12px;
            }

            .ticket {
              min-height: 125px;
              border: 1px solid #ddd;
              padding: 16px;
              margin-bottom: 12px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              display: flex;
              flex-direction: column;
            }

            .ticket-title {
              font-size: 18px;
              font-weight: bold;
              text-decoration: none;
              color: #333;
            }

            .ticket-title:hover {
              color: #0066cc;
            }

            .ticket-meta {
              margin-top: 8px;
              display: flex;
              gap: 12px;
              color: #666;
              font-size: 14px;
            }

            .status {
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: 500;
            }

            .status.open {
              background: #e6f4ea;
              color: #1e7e34;
            }

            .status.closed {
              background: #f0f0f0;
              color: #666;
            }

            .ticket-dates {
              margin-top: auto;
              padding-top: 8px;
              font-size: 13px;
              color: #888;
              display: flex;
              justify-content: space-between;
            }

          </style>
        </head>
        <body>
          <h1>Your Tickets</h1>
          <div class="tickets-container">
            ${ticketsStr}
          </div>
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

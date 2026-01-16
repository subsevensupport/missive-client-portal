import http from "http";
import ejs from "ejs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from "fs";

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
    date.getDate() === now.getDate() // getDate() gives day of the month, getDay() gives day of week
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

    "/styles.css": () => {
      const cssPath = join(__dirname, "public", "styles.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/css" },
        body: css,
      };
    },

    "/debug": async () => {
      const data = await missiveFetch(
        `/conversations/1f82c233-8c6b-4e2f-93bb-19f32167240f`,
      );
      const conversation = data.conversations[0];
      const body = JSON.stringify(conversation);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: body,
      };
    },

    "/tickets": async () => {
      const conversationsData = await missiveFetch(
        `/conversations?shared_label=${CLIENT_LABELS["NANN"]}`,
      );
      // TODO: filter conversations - probably just support and projects/opportunities, and maybe only closed_at within last week?
      const tickets = conversationsData.conversations.map((conversation) => ({
        id: conversation.id,
        web_url: conversation.web_url,
        app_url: conversation.app_url,
        title: conversation.subject || conversation.latest_message_subject,
        team: conversation.team?.name ?? "none",
        closed_at: conversation.closed_at,
        user_closed: conversation.users?.[0]?.closed ?? undefined,
        created_at: conversation.created_at,
        last_activity_at: conversation.last_activity_at,
        total_tasks: conversation.tasks_count,
        completed_tasks: conversation.completed_tasks_count,
      }));

      // Render the EJS template with our data
      const html = await ejs.renderFile(
        join(__dirname, 'views', 'pages', 'tickets.ejs'),
        { tickets, formatSmartDate }
      );

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

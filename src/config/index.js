function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name, defaultValue) {
  return process.env[name] || defaultValue;
}

export const config = {
  port: optionalEnv('PORT', '3000'),
  sessionSecret: requireEnv('SESSION_SECRET'),

  missive: {
    apiToken: requireEnv('MISSIVE_API_TOKEN'),
    baseUrl: 'https://public.missiveapp.com/v1',
  },

  smtp: {
    host: requireEnv('SMTP_HOST'),
    port: parseInt(optionalEnv('SMTP_PORT', '587'), 10),
    user: requireEnv('SMTP_USER'),
    pass: requireEnv('SMTP_PASS'),
  },

  email: {
    from: requireEnv('EMAIL_FROM'),
    testTo: optionalEnv('TEST_EMAIL', 'test@example.com'),
  },

  app: {
    url: requireEnv('APP_URL'),
    clientMarker: optionalEnv('CLIENT_MARKER', '[CLIENT]'),
  },

  auth: {
    tokenExpiryMinutes: 15,
    sessionMaxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  cache: {
    ttlSeconds: 300, // 5 minutes
  },
};

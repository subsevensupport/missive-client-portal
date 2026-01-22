import NodeCache from 'node-cache';
import { config } from '../config/index.js';
import { clientLabelsService } from './clientLabelsService.js';

const cache = new NodeCache({ stdTTL: config.cache.ttlSeconds });

async function missiveRequest(endpoint, params = {}) {
  const url = new URL(`${config.missive.baseUrl}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${config.missive.apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Missive API error: ${response.status} ${text}`);
  }

  return response.json();
}

function extractClientVisibleMessages(messages) {
  const marker = config.app.clientMarker;

  return messages
    .filter(msg => {
      const preview = msg.preview || '';
      const body = msg.body?.plain || msg.body?.html || '';
      return preview.includes(marker) || body.includes(marker);
    })
    .map(msg => ({
      id: msg.id,
      subject: msg.subject,
      preview: (msg.preview || '').replace(marker, '').trim(),
      deliveredAt: msg.delivered_at,
      from: msg.from_field,
    }));
}

export const missiveService = {
  async getConversationsForClient(clientCode, options = {}) {
    const labelUUID = clientLabelsService.getMissiveLabelId(clientCode);
    if (!labelUUID) {
      throw new Error(`Unknown client code: ${clientCode}`);
    }

    const cacheKey = `conversations:${clientCode}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch conversations by shared label
    const params = {
      shared_label: labelUUID,
      limit: 50,
    };

    const data = await missiveRequest('/conversations', params);

    // Transform to simpler format
    const result = (data.conversations || []).map(conv => ({
      id: conv.id,
      subject: conv.latest_message_subject || conv.subject || '(No subject)',
      lastActivityAt: conv.last_activity_at,
      messagesCount: conv.messages_count,
      closed: conv.users?.[0]?.closed || false,
      authors: conv.authors,
    }));

    cache.set(cacheKey, result);
    return result;
  },

  async getConversation(conversationId) {
    const cacheKey = `conversation:${conversationId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await missiveRequest(`/conversations/${conversationId}`);
    const conv = data.conversations?.[0];

    if (!conv) {
      return null;
    }

    const result = {
      id: conv.id,
      subject: conv.latest_message_subject || conv.subject || '(No subject)',
      lastActivityAt: conv.last_activity_at,
      closed: conv.users?.[0]?.closed || false,
      authors: conv.authors,
    };

    cache.set(cacheKey, result);
    return result;
  },

  async getConversationMessages(conversationId) {
    const cacheKey = `messages:${conversationId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch all messages (paginate if needed)
    let allMessages = [];
    let until = undefined;

    do {
      const params = { limit: 10 };
      if (until) params.until = until;

      const data = await missiveRequest(`/conversations/${conversationId}/messages`, params);
      const messages = data.messages || [];

      if (messages.length === 0) break;

      allMessages = allMessages.concat(messages);

      // Check if we got less than limit (last page)
      if (messages.length < 10) break;

      // Get oldest message timestamp for pagination
      until = messages[messages.length - 1].delivered_at;
    } while (true);

    // Filter to client-visible messages
    const result = extractClientVisibleMessages(allMessages);

    // Sort oldest to newest for display
    result.sort((a, b) => a.deliveredAt - b.deliveredAt);

    cache.set(cacheKey, result);
    return result;
  },

  clearCache() {
    cache.flushAll();
  },
};

import { missiveService } from '../services/missiveService.js';
import { authService } from '../services/authService.js';

export const threadController = {
  async showDashboard(req, res) {
    const clientEmail = req.session.clientEmail;
    const clientCode = authService.getClientCode(clientEmail);
    const selectedThreadId = req.query.thread;
    const filter = req.query.filter || 'all';
    const search = req.query.search || '';

    if (!clientCode) {
      return res.render('pages/dashboard', {
        title: 'Dashboard',
        threads: [],
        selectedThread: null,
        messages: [],
        selectedThreadId: null,
        filter,
        search,
        error: 'Client configuration error. Please contact support.',
      });
    }

    try {
      let threads = await missiveService.getConversationsForClient(clientCode);

      // Apply filter
      if (filter === 'open') {
        threads = threads.filter(t => !t.closed);
      } else if (filter === 'closed') {
        threads = threads.filter(t => t.closed);
      }

      // Apply search
      if (search) {
        const searchLower = search.toLowerCase();
        threads = threads.filter(t =>
          t.subject.toLowerCase().includes(searchLower)
        );
      }

      // Sort by last activity (newest first)
      threads.sort((a, b) => b.lastActivityAt - a.lastActivityAt);

      // Get selected thread content if specified
      let selectedThread = null;
      let messages = [];
      if (selectedThreadId) {
        // Verify thread belongs to this client by checking it's in the thread list
        const threadBelongsToClient = threads.some(t => t.id === selectedThreadId);
        if (threadBelongsToClient) {
          selectedThread = await missiveService.getConversation(selectedThreadId);
          if (selectedThread) {
            messages = await missiveService.getConversationMessages(selectedThreadId);
          }
        }
      }

      res.render('pages/dashboard', {
        title: 'Dashboard',
        threads,
        selectedThread,
        messages,
        selectedThreadId,
        filter,
        search,
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.render('pages/dashboard', {
        title: 'Dashboard',
        threads: [],
        selectedThread: null,
        messages: [],
        selectedThreadId: null,
        filter,
        search,
        error: 'Unable to load threads. Please try again later.',
      });
    }
  },

  async getThreadContent(req, res) {
    const clientEmail = req.session.clientEmail;
    const clientCode = authService.getClientCode(clientEmail);
    const threadId = req.params.id;

    if (!clientCode) {
      return res.status(403).render('partials/reading-pane', {
        selectedThread: null,
        messages: [],
        error: 'Client configuration error.',
      });
    }

    try {
      // Verify thread belongs to this client by checking shared label
      const clientThreads = await missiveService.getConversationsForClient(clientCode);
      const threadBelongsToClient = clientThreads.some(t => t.id === threadId);

      if (!threadBelongsToClient) {
        return res.status(403).render('partials/reading-pane', {
          selectedThread: null,
          messages: [],
          error: 'You do not have access to this thread.',
        });
      }

      const thread = await missiveService.getConversation(threadId);

      if (!thread) {
        return res.status(404).render('partials/reading-pane', {
          selectedThread: null,
          messages: [],
          error: 'Thread not found.',
        });
      }

      const messages = await missiveService.getConversationMessages(threadId);

      res.render('partials/reading-pane', {
        selectedThread: thread,
        messages,
      });
    } catch (error) {
      console.error('Thread content error:', error);
      res.status(500).render('partials/reading-pane', {
        selectedThread: null,
        messages: [],
        error: 'Unable to load thread. Please try again later.',
      });
    }
  },
};

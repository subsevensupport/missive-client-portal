import { db } from '../db/index.js';

export const clientLabelsService = {
  getLabelByCode(code) {
    return db.prepare(`
      SELECT * FROM client_labels WHERE code = ? AND active = 1
    `).get(code);
  },

  getLabelById(id) {
    return db.prepare(`
      SELECT * FROM client_labels WHERE id = ? AND active = 1
    `).get(id);
  },

  getMissiveLabelId(code) {
    const row = db.prepare(`
      SELECT missive_label_id FROM client_labels WHERE code = ? AND active = 1
    `).get(code);
    return row?.missive_label_id || null;
  },

  getAllLabels() {
    return db.prepare(`
      SELECT * FROM client_labels WHERE active = 1 ORDER BY code
    `).all();
  },

  getAllCodes() {
    return db.prepare(`
      SELECT code FROM client_labels WHERE active = 1 ORDER BY code
    `).all().map(row => row.code);
  },
};

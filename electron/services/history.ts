/**
 * 历史记录服务
 * 使用 SQLite 存储历史记录
 */

import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import type { HistoryRecord } from '../../src/types/models';

const DB_PATH = path.join(app.getPath('userData'), 'history.db');

/**
 * 历史记录服务
 */
export class HistoryService {
  private db: Database.Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.initDatabase();
  }

  /**
   * 初始化数据库
   */
  private initDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        original TEXT NOT NULL,
        result TEXT NOT NULL,
        templateId TEXT NOT NULL,
        templateName TEXT NOT NULL,
        modelId TEXT NOT NULL,
        modelName TEXT NOT NULL,
        isFavorite INTEGER DEFAULT 0,
        createdAt INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_createdAt ON history(createdAt DESC);
      CREATE INDEX IF NOT EXISTS idx_isFavorite ON history(isFavorite);
      CREATE VIRTUAL TABLE IF NOT EXISTS history_fts USING fts5(
        id UNINDEXED,
        original,
        result,
        content='history',
        content_rowid='rowid'
      );

      -- 触发器:同步全文搜索表
      CREATE TRIGGER IF NOT EXISTS history_ai AFTER INSERT ON history BEGIN
        INSERT INTO history_fts(rowid, id, original, result)
        VALUES (new.rowid, new.id, new.original, new.result);
      END;

      CREATE TRIGGER IF NOT EXISTS history_ad AFTER DELETE ON history BEGIN
        DELETE FROM history_fts WHERE rowid = old.rowid;
      END;

      CREATE TRIGGER IF NOT EXISTS history_au AFTER UPDATE ON history BEGIN
        UPDATE history_fts SET original = new.original, result = new.result
        WHERE rowid = old.rowid;
      END;
    `);
  }

  /**
   * 添加历史记录
   */
  add(record: Omit<HistoryRecord, 'id' | 'createdAt'>): HistoryRecord {
    const id = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO history (id, original, result, templateId, templateName, modelId, modelName, isFavorite, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      record.original,
      record.result,
      record.templateId,
      record.templateName,
      record.modelId,
      record.modelName,
      record.isFavorite ? 1 : 0,
      createdAt
    );

    return {
      id,
      ...record,
      createdAt
    };
  }

  /**
   * 全文搜索历史记录
   */
  search(query: string, limit: number = 50): HistoryRecord[] {
    const stmt = this.db.prepare(`
      SELECT h.* FROM history h
      INNER JOIN history_fts fts ON h.rowid = fts.rowid
      WHERE history_fts MATCH ?
      ORDER BY h.createdAt DESC
      LIMIT ?
    `);

    const rows = stmt.all(query, limit);
    return rows.map(this.rowToRecord);
  }

  /**
   * 获取所有历史记录
   */
  getAll(limit: number = 100, offset: number = 0): HistoryRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM history
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(limit, offset);
    return rows.map(this.rowToRecord);
  }

  /**
   * 获取收藏的历史记录
   */
  getFavorites(): HistoryRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM history
      WHERE isFavorite = 1
      ORDER BY createdAt DESC
    `);

    const rows = stmt.all();
    return rows.map(this.rowToRecord);
  }

  /**
   * 切换收藏状态
   */
  toggleFavorite(id: string): void {
    const stmt = this.db.prepare(`
      UPDATE history
      SET isFavorite = 1 - isFavorite
      WHERE id = ?
    `);

    stmt.run(id);
  }

  /**
   * 删除历史记录
   */
  delete(id: string): void {
    const stmt = this.db.prepare('DELETE FROM history WHERE id = ?');
    stmt.run(id);
  }

  /**
   * 按日期范围删除
   */
  deleteByDateRange(startDate: number, endDate: number): void {
    const stmt = this.db.prepare(`
      DELETE FROM history
      WHERE createdAt >= ? AND createdAt <= ?
    `);

    stmt.run(startDate, endDate);
  }

  /**
   * 清空所有历史记录
   */
  clear(): void {
    this.db.exec('DELETE FROM history');
  }

  /**
   * 获取统计信息
   */
  getStats(): { total: number; favorites: number } {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM history');
    const favStmt = this.db.prepare('SELECT COUNT(*) as count FROM history WHERE isFavorite = 1');

    const total = (totalStmt.get() as any).count;
    const favorites = (favStmt.get() as any).count;

    return { total, favorites };
  }

  /**
   * 将数据库行转换为记录对象
   */
  private rowToRecord(row: any): HistoryRecord {
    return {
      id: row.id,
      original: row.original,
      result: row.result,
      templateId: row.templateId,
      templateName: row.templateName,
      modelId: row.modelId,
      modelName: row.modelName,
      isFavorite: Boolean(row.isFavorite),
      createdAt: row.createdAt
    };
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    this.db.close();
  }
}

// 导出单例
export const historyService = new HistoryService();

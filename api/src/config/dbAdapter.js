import { db as postgresDb } from './database.js';
import sqlite from './sqlite.js';
import logger from './logger.js';

// Adaptador universal de banco de dados
class DatabaseAdapter {
  constructor() {
    this.isPostgres = process.env.DB_TYPE !== 'sqlite';
    this.db = this.isPostgres ? postgresDb : null;
  }

  // Buscar um registro
  async findOne(table, where) {
    try {
      if (this.isPostgres) {
        return await this.db(table).where(where).first();
      } else {
        const whereClause = Object.keys(where)
          .map(key => `${key} = ?`)
          .join(' AND ');
        const values = Object.values(where);
        const sql = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
        const result = sqlite.query(sql, values);
        return result[0] || null;
      }
    } catch (error) {
      logger.error(`Database findOne error: ${error.message}`);
      throw error;
    }
  }

  // Buscar múltiplos registros
  async findMany(table, where = {}, options = {}) {
    try {
      if (this.isPostgres) {
        let query = this.db(table);
        if (Object.keys(where).length > 0) {
          query = query.where(where);
        }
        if (options.orderBy) {
          query = query.orderBy(options.orderBy, options.order || 'asc');
        }
        if (options.limit) {
          query = query.limit(options.limit);
        }
        return await query;
      } else {
        let sql = `SELECT * FROM ${table}`;
        let values = [];
        
        if (Object.keys(where).length > 0) {
          const whereClause = Object.keys(where)
            .map(key => `${key} = ?`)
            .join(' AND ');
          sql += ` WHERE ${whereClause}`;
          values = Object.values(where);
        }
        
        if (options.orderBy) {
          sql += ` ORDER BY ${options.orderBy} ${options.order || 'ASC'}`;
        }
        
        if (options.limit) {
          sql += ` LIMIT ${options.limit}`;
        }
        
        return sqlite.query(sql, values);
      }
    } catch (error) {
      logger.error(`Database findMany error: ${error.message}`);
      throw error;
    }
  }

  // Inserir registro
  async insert(table, data) {
    try {
      if (this.isPostgres) {
        const [result] = await this.db(table).insert(data).returning('*');
        return result;
      } else {
        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(', ');
        const values = Object.values(data);
        
        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        sqlite.query(sql, values);
        
        // Retornar o registro inserido
        return await this.findOne(table, { id: data.id });
      }
    } catch (error) {
      logger.error(`Database insert error: ${error.message}`);
      throw error;
    }
  }

  // Atualizar registro
  async update(table, where, data) {
    try {
      if (this.isPostgres) {
        const [result] = await this.db(table).where(where).update(data).returning('*');
        return result;
      } else {
        const setClause = Object.keys(data)
          .map(key => `${key} = ?`)
          .join(', ');
        const whereClause = Object.keys(where)
          .map(key => `${key} = ?`)
          .join(' AND ');
        
        const values = [...Object.values(data), ...Object.values(where)];
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        
        sqlite.query(sql, values);
        
        // Retornar o registro atualizado
        return await this.findOne(table, where);
      }
    } catch (error) {
      logger.error(`Database update error: ${error.message}`);
      throw error;
    }
  }

  // Deletar registro
  async delete(table, where) {
    try {
      if (this.isPostgres) {
        return await this.db(table).where(where).del();
      } else {
        const whereClause = Object.keys(where)
          .map(key => `${key} = ?`)
          .join(' AND ');
        const values = Object.values(where);
        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
        
        const result = sqlite.query(sql, values);
        return result.changes || 0;
      }
    } catch (error) {
      logger.error(`Database delete error: ${error.message}`);
      throw error;
    }
  }

  // Executar query raw
  async raw(sql, params = []) {
    try {
      if (this.isPostgres) {
        return await this.db.raw(sql, params);
      } else {
        return sqlite.query(sql, params);
      }
    } catch (error) {
      logger.error(`Database raw query error: ${error.message}`);
      throw error;
    }
  }
}

// Instância singleton
const dbAdapter = new DatabaseAdapter();

export default dbAdapter;

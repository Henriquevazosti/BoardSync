import sqlite from './sqlite.js';
import logger from './logger.js';

// Adaptador universal de banco de dados
class DatabaseAdapter {
  constructor() {
    this.isPostgres = process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'postgresql';
    this.db = null;
    this.sqliteInitialized = false;
    
    // Forçar SQLite se não especificado
    if (!process.env.DB_TYPE || process.env.DB_TYPE === 'sqlite') {
      this.isPostgres = false;
    }
  }

  async initSQLite() {
    if (!this.sqliteInitialized && !this.isPostgres) {
      try {
        // O SQLite já foi conectado no server.js, só precisamos marcar como inicializado
        this.sqliteInitialized = true;
        logger.info('✅ SQLite adapter initialized successfully');
      } catch (error) {
        logger.error('❌ SQLite initialization failed:', error.message);
        throw error;
      }
    }
  }

  async getPostgresDb() {
    if (!this.db && this.isPostgres) {
      const { connectDatabase } = await import('./database.js');
      this.db = await connectDatabase();
    }
    return this.db;
  }

  // Buscar um registro
  async findOne(table, where) {
    try {
      if (this.isPostgres) {
        const db = await this.getPostgresDb();
        return await db(table).where(where).first();
      } else {
        await this.initSQLite();
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
        const db = await this.getPostgresDb();
        let query = db(table);
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
        await this.initSQLite();
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
        const db = await this.getPostgresDb();
        const [result] = await db(table).insert(data).returning('*');
        return result;
      } else {
        await this.initSQLite();
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
        const db = await this.getPostgresDb();
        const [result] = await db(table).where(where).update(data).returning('*');
        return result;
      } else {
        await this.initSQLite();
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
        const db = await this.getPostgresDb();
        return await db(table).where(where).del();
      } else {
        await this.initSQLite();
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
        const db = await this.getPostgresDb();
        return await db.raw(sql, params);
      } else {
        await this.initSQLite();
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

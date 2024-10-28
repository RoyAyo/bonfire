import { Pool, QueryResult } from 'pg';

class DatabasePool {
    pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USERNAME ?? 'test',
            host: process.env.DB_HOST ?? 'localhost',
            database: process.env.DB_NAME ?? 'task_1',
            password: process.env.DB_PASSWORD ?? '',
            port: 5432,
        });
    }

    async query(query: string, values?: any[]): Promise<QueryResult<any> | null> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(query, values);
            return result;
        } finally {
            client.release();
        }
    }
}

export default new DatabasePool();
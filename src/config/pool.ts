import { Pool, PoolClient, QueryResult } from 'pg';

class DatabasePool {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: 'test',
            host: 'localhost',
            database: 'task_1',
            password: '',
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
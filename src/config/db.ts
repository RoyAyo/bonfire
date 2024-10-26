import { Pool } from 'pg';

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'test',
    password: '',
    database: 'task_1',
    max: 10, // max number of clients in the pool
});

export default pool;
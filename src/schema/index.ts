import { PoolClient } from 'pg';

import pool from '../config/db';

class InitializeDB {
    private client: PoolClient | null = null;
    private dbName: string;

    constructor(dbName: string) {
        this.dbName = dbName;
    }

    private async createPool(): Promise<void> {
        try {
            this.client = await pool.connect();
            console.log('Pool created successfully');
        } catch (error) {
            console.error('Error creating pool', error);
        }
    }

    private async createDatabase(): Promise<void> {
        console.log("Creating database");
        await this.client?.query(`CREATE DATABASE ${this.dbName}`);
        console.log(`Database ${this.dbName} created successfully`);
    }

    private async createTable(query: string, tableName: string): Promise<void> {
        try {
            await this.client?.query(query);
        } catch (error) {
            console.error(`Error creating ${tableName} table`, error);
        }
    }

    private async checkIfExists(query: string): Promise<boolean> {
        try {
            const result = await this.client?.query(query);
            return (result?.rows.length ?? 0) > 0 || false;
        } catch (error) {
            console.error('Error checking existence', error);
            return false;
        }
    }

    public async createSchema(): Promise<void> {
        await this.createPool();
        try {
            if (!(await this.checkIfExists(`SELECT datname FROM pg_database WHERE datname='${this.dbName}'`))) {
                await this.createDatabase();
            }
            await this.createTable(`
                CREATE TABLE IF NOT EXISTS regions(
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL
                )`, 'Regions');
            
            await this.createTable(`
                CREATE TABLE IF NOT EXISTS questions(
                    id SERIAL PRIMARY KEY,
                    question VARCHAR(255) NOT NULL,
                    current_region_id INT NULL,
                    is_assigned BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );`, 'Questions');
            console.log('DB initialized...');
        } catch (error) {
            console.error('Error creating schema', error);
        } finally {
            this.client?.release();
        }
    }

    public async insertData(): Promise<void> {
        await this.createPool();
        try{
            const regions = [
                'Singapore', 'U.S.A', 'Germany', 'Poland', 'Nigeria', 
                'Ghana', 'South Africa', 'China', 'U.A.E', 'India', 'Australia'
            ];

            const questions = [
                { question: 'Who is your girl', current_region_id: 0, is_assigned: true },
                { question: 'What is your name?', current_region_id: 1, is_assigned: true },
                { question: 'What is your age?', current_region_id: 2, is_assigned: true },
                { question: 'What is your number?', current_region_id: 3, is_assigned: true },
                { question: 'How are you?', current_region_id: 4, is_assigned: true },
                { question: 'Tell me about you?', current_region_id: 5, is_assigned: true },
                { question: 'Tell me your values?', current_region_id: 6, is_assigned: true },
                { question: 'What are your goals?', current_region_id: 7, is_assigned: true },
                { question: 'What are your dreams?', current_region_id: 8, is_assigned: true },
                { question: 'What are your aspirations?', current_region_id: 9, is_assigned: true },
                { question: 'What are your fears?', current_region_id: 10, is_assigned: true },
                { question: 'What are you up to?' },
                { question: 'Whats your hobby?' },
                { question: 'Career goals?' }
            ];

            for (const region of regions) {
                await this.client?.query(`INSERT INTO regions(name) VALUES($1)`, [region]);
            }

            for (const question of questions) {
                const { question: q, current_region_id, is_assigned } = question;
                await this.client?.query(
                    `INSERT INTO questions(question, current_region_id, is_assigned) VALUES($1, $2, $3)`,
                    [q, current_region_id ?? null, is_assigned ?? false]
                );
            }
        }catch(error){
            console.error('Error inserting data', error);
        } finally {
            this.client?.release();
        }
    }
}

const dbInitializer = new InitializeDB('task_1');
// dbInitializer.createSchema();
dbInitializer.insertData();
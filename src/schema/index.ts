import pool from '../config/pool';
import dbClient from '../config/pool';
import * as dotenv from 'dotenv';

dotenv.config();

class InitializeDB {
    private dbName: string;

    constructor(dbName: string) {
        this.dbName = dbName;
    }

    private async createTable(query: string, tableName: string): Promise<void> {
        try {
            await dbClient.query(query);
        } catch (error) {
            console.error(`Error creating ${tableName} table`, error);
        }
    }

    private async checkIfExists(query: string): Promise<boolean> {
        try {
            const result = await dbClient.query(query);
            return (result?.rows.length ?? 0) > 0 || false;
        } catch (error) {
            console.error('Error checking existence', error);
            return false;
        }
    }

    public async createSchema(): Promise<void> {
        try {
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
            await this.createTable(`
                CREATE TABLE IF NOT EXISTS cycle(
                    id SERIAL PRIMARY KEY,
                    duration INT NOT NULL,
                    count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );`, 'Cycle');
            console.log('DB schemas initialized...');
            await this.seed();
        } catch (error) {
            console.error('Error creating schema', error);
        }
    }

    public async seed(): Promise<void> {
        console.log("Adding seed data...");
        // check regions
        const regionCount = await dbClient.query('SELECT COUNT(*) FROM regions');
        console.log(regionCount?.rows[0].count);
        if ((regionCount?.rows[0].count ?? 0) > 0) {
            console.log('Data already seeded...');
            console.log('Exiting...');
            return;
        }
        try{
            const regions = [
                'Singapore', 'U.S.A', 'Germany', 'Poland', 'Nigeria', 
                'Ghana', 'South Africa', 'China', 'U.A.E', 'India', 'Australia'
            ];

            const questions = [
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
                { question: 'What makes you happy?', current_region_id: 11, is_assigned: true },
            ];

            for (const region of regions) {
                await dbClient.query(`INSERT INTO regions(name) VALUES($1)`, [region]);
            }

            for (const question of questions) {
                const { question: q, current_region_id, is_assigned } = question;
                await dbClient.query(
                    `INSERT INTO questions(question, current_region_id, is_assigned) VALUES($1, $2, $3)`,
                    [q, current_region_id ?? null, is_assigned ?? false]
                );
            }
            console.log('Seed data added successfully...');
        }catch(error){
            console.error('Error inserting data', error);
        }
    }
}

const dbName = process.env.DB_NAME ?? 'task_1';
const db = new InitializeDB(dbName);
db.createSchema();
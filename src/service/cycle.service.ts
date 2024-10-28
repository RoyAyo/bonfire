import dbPool from '../config/pool';
import QuestionsService from './questions.service';

class CycleService {
    async getCurrentCycle(): Promise<any> {
        try {
            const result = await dbPool.query('SELECT * FROM cycle');
            return result?.rows[0] ?? null;
        } catch (error) {
            console.error('Error retrieving cycle', error);
            return null;
        }
    }

    async updateCycle(cycleDuration: number): Promise<void> {
        try {
            await dbPool.query('UPDATE cycle SET  = $1', [cycleDuration]);
            console.log('Cycle updated successfully');
        } catch (error) {
            console.error('Error updating cycle', error);
        }
    }
}

export default CycleService;
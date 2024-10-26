import dbPool from '../config/pool';

class QuestionService {

    async getLastAssignedQuestionId(): Promise<number | null> {
        try {
            const result = await dbPool.query('SELECT id FROM questions WHERE is_assigned = TRUE ORDER BY id DESC LIMIT 1');
            return result?.rows[0].id ?? null;
        } catch (error) {
            console.error('Error retrieving last assigned question', error);
            return null;
        }
    }

    async addQuestion(question: string): Promise<void> {
        try {
            await dbPool.query('INSERT INTO questions(question) VALUES($1)', [question]);
            console.log('Question added successfully');
        } catch (error) {
            console.error('Error adding question', error);
        }
    }

    private async reassignRegions(questionCount: number, regionCount: number): Promise<void> {
        try {
            let nextUnnasignedId = await this.nextUnnasignedId(questionCount);
            console.log(nextUnnasignedId, regionCount);
            await dbPool.query('UPDATE questions SET current_region_id = NULL, is_assigned = FALSE WHERE is_assigned = TRUE AND current_region_id = 0');
            await dbPool.query('UPDATE questions SET current_region_id = current_region_id - 1 WHERE is_assigned = TRUE');
            await dbPool.query('UPDATE questions SET is_assigned = TRUE, current_region_id = $1 WHERE id = $2', [regionCount - 1, nextUnnasignedId]);
        } catch (error) {
            console.error('Error reassigning questions', error);
        }
    }

    async updateRegionCounts(regionCount: number): Promise<void> {
        try {
            await dbPool.query(`
                UPDATE questions 
                SET current_region_id = CASE 
                    WHEN current_region_id != 0 AND is_assigned = TRUE THEN current_region_id - 1
                    WHEN current_region_id = 0 AND is_assigned = TRUE THEN $1
                    ELSE current_region_id
                END
            `, [regionCount - 1]);
            console.log('Region counts updated successfully');
        } catch (error) {
            console.error('Error updating region counts', error);
        }
    }

    async getQuestions(): Promise<string[]> {
        try {
            const result = await dbPool.query('SELECT * FROM questions');
            console.log(result?.rows)
            return result?.rows.map((row) => row.question) ?? [];
        } catch (error) {
            console.error('Error getting questions', error);
            return [];
        }
    }

    async count(): Promise<number> {
        const regions = await dbPool.query('SELECT COUNT(*) FROM questions');
        if(regions){
            return regions.rows[0].count;
        }
        return 0;
    }

    async nextUnnasignedId(questionCount: number): Promise<number> {
        let lastAssignedId = await this.getLastAssignedQuestionId();
        let result;
        if(lastAssignedId === questionCount) {
            result = await dbPool.query('SELECT id FROM questions WHERE is_assigned = FALSE ORDER BY id ASC LIMIT 1');
        } else {
            result = await dbPool.query('SELECT id FROM questions WHERE is_assigned = FALSE and id > $1 ORDER BY id ASC LIMIT 1', [lastAssignedId]);
        }
        return result?.rows[0].id ?? 0;
    }

    async includeNewRegion(regionCount: number): Promise<void> {
        const noOfquestions = await this.count();
        const result = await this.nextUnnasignedId(noOfquestions);
        if(result == 0) {
            return;
        }
        await dbPool.query(`UPDATE questions SET current_region_id = $1, is_assigned = TRUE WHERE id = $2`, [regionCount, result]);
        return;
    }

    async adjustRegions(): Promise<void> {
        try {
            const questionCountResult = await dbPool.query('SELECT COUNT(*) FROM questions');
            const regionCountResult = await dbPool.query('SELECT COUNT(*) FROM regions');
            const questionCount = parseInt(questionCountResult?.rows[0].count ?? '0', 10);
            const regionCount = parseInt(regionCountResult?.rows[0].count ?? '0', 10);

            if (questionCount === regionCount || regionCount > questionCount) {
                await this.updateRegionCounts(regionCount);
            } else {
                console.log("Reassigning regions")
                await this.reassignRegions(questionCount, regionCount);
            }
        } catch (error) {
            console.error('Error adjusting regions', error);
        }
    }
}

const questionService = new QuestionService();
questionService.adjustRegions();


export default QuestionService;
import dbPool from '../config/pool';
import QuestionsService from './questions.service';


class RegionService {
    private questionsService: QuestionsService;
    constructor() {
        this.questionsService = new QuestionsService();
    }

    async count(): Promise<number> {
        const regions = await dbPool.query('SELECT COUNT(*) FROM regions');
        if(regions){
            return regions.rows[0].count;
        }
        return 0;
    }

    async create(regionName: string): Promise<void> {
        // check the number of regions
        const noOfquestions = await this.questionsService.count();
        const noOfRegions = await this.count();
        if(noOfquestions > noOfRegions) {
            await this.questionsService.includeNewRegion(noOfRegions);
        }
        await dbPool.query(`INSERT INTO regions(name) VALUES('${regionName}')`);
    }

}

export default RegionService;
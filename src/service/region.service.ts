import dbPool from '../config/pool';
class RegionService {

    async count(): Promise<number> {
        const regions = await dbPool.query('SELECT COUNT(*) FROM regions');
        if(regions){
            return regions.rows[0].count;
        }
        return 0;
    }
}

export default RegionService;
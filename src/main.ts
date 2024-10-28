import * as dotenv from 'dotenv';
import Scheduler from './scheduler';

dotenv.config();

async function main() {
    const scheduler = new Scheduler();
    scheduler.run()
}

main();
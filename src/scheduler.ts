import schedule from 'node-schedule';
import QuestionService from './service/questions.service';
import CycleService from './service/cycle.service';
import dbPool from './config/pool';

class Scheduler {
  private questionService: QuestionService;
  private cycleService: CycleService;

  constructor() {
    this.questionService = new QuestionService();
    this.cycleService = new CycleService();
  }

  async scheduleNextIteration() {
    let nextCycleDate: Date;
    let currentCycle = (await this.cycleService.getCurrentCycle());
    let cycleCount = 1;

    if (!currentCycle) {
        nextCycleDate = new Date();
        nextCycleDate.setUTCHours(11, 0, 0, 0); // 7 PM SGT is 11 AM UTC
        const day = nextCycleDate.getUTCDay();
        const daysUntilNextMonday = (8 - day) % 7;
        nextCycleDate.setDate(nextCycleDate.getDate() + daysUntilNextMonday);
        cycleCount = 1;
    } else {
        const nextCycleInDays = currentCycle.duration ?? 7;
        cycleCount = currentCycle.count;
        nextCycleDate = new Date(Date.now() + nextCycleInDays * 24 * 60 * 60 * 1000);
    }

    console.log(`Next iteration scheduled for ${nextCycleDate}`);
    schedule.scheduleJob(nextCycleDate, this.run.bind(this, cycleCount + 1));
}

  async run(cycleCount: number = 1) {
    let currentCycle = (await this.cycleService.getCurrentCycle());
    if(!currentCycle) {
        await dbPool.query('INSERT INTO cycle(duration, count) VALUES($1, $2)', [7, 0]);
    } else {
        cycleCount = currentCycle.count;
        await dbPool.query('UPDATE cycle SET count = $1 WHERE id = $2', [cycleCount + 1, currentCycle.id]);
        await this.questionService.roundRobin();
    }

    await this.scheduleNextIteration();
  }

}

export default Scheduler;

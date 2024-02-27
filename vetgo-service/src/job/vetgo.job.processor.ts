import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
// Local event listeners 
@Processor('image:optimize',{
    // concurrency: 2, // so luong process chay dong thoi,
    // limiter: { // 2 job trong 60s
	// 	max: 2,
	// 	duration: 60000,
	// },
    lockDuration: 3000, 
})
export class VetGoJobProcessor extends WorkerHost {
    private logger = new Logger();
    async process(job: Job<any, any, string>, token?: string): Promise<any> {
        console.log('Job type: '  + job.name)

        switch(job.name) {
            case "sample": 
             const optimzied = await this.optimizeImage({});
             return optimzied;
            default:
                throw new Error('No job name match'); 
        }
    }
    async optimizeImage(img: any ) {
        this.logger.log('Processing image ....');
             // thoi gian làm qua lâu
             for (let index = 0; index < 10e5; index++) {
                const progress = ((index * 100) / 10e5).toFixed(2);
                this.logger.log(`${progress}%`);
            }
        return await new Promise( (resolve) => {
              // Sẽ blocking Event Loop ⭕️
         
            // fake thời gian xử lý ngầm là 30s
         setTimeout(()=> resolve(img), 1*1000);
        })
    }

    @OnWorkerEvent('active')
	onQueueActive(job: Job) {
		this.logger.log(`Job has been started: ${job.id}`);
	}

	@OnWorkerEvent('completed')
	onQueueComplete(job: Job, result: any) {
		this.logger.log(`Job has been finished: ${job.id}`);
	}

	@OnWorkerEvent('failed')
	onQueueFailed(job: Job, err: any) {
		this.logger.log(`Job has been failed: ${job.id}`);
		this.logger.log({ err });
	}

	@OnWorkerEvent('error')
	onQueueError(err: any) {
		this.logger.log(`Job has got error: `);
		this.logger.log({ err });
	}
}
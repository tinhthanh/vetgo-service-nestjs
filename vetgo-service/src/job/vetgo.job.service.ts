import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class VetGoJobService {
    constructor (
        @InjectQueue('image:optimize')
         private readonly imageOptimizeQueue: Queue
    ) {

    }
 
    async createVetGoJob(createDto: any) {
        const vetoJob = await this.imageOptimizeQueue.add('sample' , {foo: 'bar'});
        return vetoJob;
    }
}
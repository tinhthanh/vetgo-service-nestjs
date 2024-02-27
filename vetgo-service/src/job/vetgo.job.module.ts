import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { JobListener } from "./job-listener.job";
import { VetgoJobController } from "./vetgo.job.controller";
import { VetGoJobProcessor } from "./vetgo.job.processor";
import { VetGoJobService } from "./vetgo.job.service";

@Module({
    controllers:[VetgoJobController],
    providers: [VetGoJobService, VetGoJobProcessor, JobListener],
    imports: [
        BullModule.registerQueue({
            name: 'image:optimize',
            prefix: 'vetgo'
        })
    ]
})
export class VetGoJobModule {}
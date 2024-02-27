import { Controller, Get } from "@nestjs/common";
import { VetGoJobService } from "./vetgo.job.service";

@Controller("job")
export class VetgoJobController {

    constructor( private readonly vetgoJobService: VetGoJobService ) {}
    @Get()
    createJob() {
        return this.vetgoJobService.createVetGoJob({data: "demo"});
    }
}
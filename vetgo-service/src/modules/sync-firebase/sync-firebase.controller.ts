import { Controller, Get } from "@nestjs/common";
import { SyncFirebaseService } from "./sync-firebase.service";

@Controller('sync-firebase')
export class SyncFirebaseController {

    constructor(private readonly syncFirebaseService: SyncFirebaseService) {}
    @Get('test')
    test() {
        this.syncFirebaseService.firebaseSyncJob();
    }
}
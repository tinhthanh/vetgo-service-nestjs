import { Controller, Get, Param } from "@nestjs/common";
import { SyncFirebaseService } from "./sync-firebase.service";
import { CheckFirebaseService } from "./check-firebase.service";

@Controller('sync-firebase')
export class SyncFirebaseController {

    constructor(private checkFirebaseService: CheckFirebaseService, private readonly syncFirebaseService: SyncFirebaseService) {}
    @Get('test')
    test() {
        this.syncFirebaseService.firebaseSyncJob();
    }
    @Get('check-data')
    checkData() {
        this.checkFirebaseService.checkData();
    }
    @Get("cus-sync/:phone")
    syncCusByPhone(@Param('phone') phone: string) {
        console.log(phone);
        this.checkFirebaseService.syncCusById(phone).then();
    }

}
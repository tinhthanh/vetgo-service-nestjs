import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { FirebaseUtilService } from "./firebase-util.service";
import { FirebaseCurlService } from "./firebase-curl.service";
import { TelegramModule } from "../telegram/telegram.module";

@Module(
    {
        imports: [HttpModule, TelegramModule],
        providers: [FirebaseUtilService, FirebaseCurlService],
        exports: [FirebaseUtilService,FirebaseCurlService ]
    }
)
export class FirebaseUtilModule {}
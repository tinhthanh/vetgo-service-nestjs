import { Module } from "@nestjs/common";
import { FirebaseUtilModule } from "../firebase/firebase-util.module";
import { GithubModule } from "../github/github.module";
import { TelegramModule } from "../telegram/telegram.module";
import { SyncFirebaseController } from "./sync-firebase.controller";
import { SyncFirebaseService } from "./sync-firebase.service";
import { CheckFirebaseService } from "./check-firebase.service";
import { HttpModule } from "@nestjs/axios";

@Module(
    {
        controllers: [SyncFirebaseController],
        providers: [SyncFirebaseService,CheckFirebaseService],
        exports: [],
        imports: [
            FirebaseUtilModule,
            GithubModule,
            TelegramModule,
            HttpModule
        ]
    }
)
export class SyncFirebaseModule {}
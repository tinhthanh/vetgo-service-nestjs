import { Module } from "@nestjs/common";
import { FirebaseUtilModule } from "../firebase/firebase-util.module";
import { GithubModule } from "../github/github.module";
import { TelegramModule } from "../telegram/telegram.module";
import { SyncFirebaseController } from "./sync-firebase.controller";
import { SyncFirebaseService } from "./sync-firebase.service";

@Module(
    {
        controllers: [SyncFirebaseController],
        providers: [SyncFirebaseService],
        exports: [],
        imports: [
            FirebaseUtilModule,
            GithubModule,
            TelegramModule
        ]
    }
)
export class SyncFirebaseModule {}
import { Module } from "@nestjs/common";
import { FvetController } from "./fvet.controller";
import { GithubModule } from "../github/github.module";

@Module({
    imports: [GithubModule],
    controllers: [FvetController],
    providers: [],
})
export class FvetModule {
}
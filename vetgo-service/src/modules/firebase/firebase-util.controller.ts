// import { Controller, Get, Query } from "@nestjs/common";
// import { FirebaseUtilService } from "./firebase-util.service";
// import { Observable } from "rxjs";
// // for testing
// @Controller('firebase-util')
// export class FirebaseUtilController {
//     constructor(private readonly firebaseUtilService: FirebaseUtilService) {}
//     // get firebase token
//     @Get('get-token')
//     getToken(@Query('apiKey') apiKey: string): Observable<string> {
//         return this.firebaseUtilService.getToken(apiKey);
//     }
// }
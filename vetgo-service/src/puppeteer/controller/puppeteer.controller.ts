import { Body, Controller, Get, OnModuleDestroy, Post } from "@nestjs/common";
import { ReqKeyPress, ReqOpenOnlyUrl, ReqSendKey } from "../dto/action.dtb";
import { PuppeteerService } from "../service/puppeteer.service";
// https://nowsecure.nl -> link test có phải là boss hay không

@Controller('puppeteer')
export class PuppeteerController  implements OnModuleDestroy  {
    constructor(private readonly puppeteerService: PuppeteerService) { }
    onModuleDestroy() {
        this.puppeteerService.closeAllBrowsers();
    }
  @Post("/native/open-only-url")
 async openOnlyUrl(@Body() data: ReqOpenOnlyUrl) {
   return this.puppeteerService.openOnlyUrl(data.profileId, data.currentUrl);
 }
 
 @Post("/native/send-key")
 async sendKey(@Body() data: ReqSendKey) {
    return this.puppeteerService.sendKey(data.profileId, data.currentUrl, data.selector , data.text, data.delay);
 }
 @Post("/native/key-press")
 async keyPress(@Body() data: ReqKeyPress) {
    return this.puppeteerService.pressKey(data.profileId, data.currentUrl, data.selector , data.text);
 }
}
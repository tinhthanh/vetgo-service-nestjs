import * as puppeteer from 'puppeteer';

export abstract class Action {
    profileId: string;
}
export class ReqOpenOnlyUrl extends Action  {
    currentUrl: string;
}
export class ReqSendKey extends Action  {
    currentUrl: string;
    selector: string;
    text: string;
    delay: number;
}
export class ReqKeyPress extends Action  {
    currentUrl: string;
    selector: string;
    text: puppeteer.KeyInput
}
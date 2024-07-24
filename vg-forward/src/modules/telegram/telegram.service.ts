import { Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class TelegramService {
    constructor(private readonly httpService: HttpService) {}

    private async sendMessage(botToken: string, chatId: string, message: string): Promise<any> {
      const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
      try {
        const response = await lastValueFrom(this.httpService.get(apiUrl));
        return response.data;
      } catch (error) {
        // Handle the error accordingly
        throw error;
      }
    }
    async pingFirebase(message: string): Promise<void> {
        const botToken = '6889912323:AAFrI4RLXwEMEIxrXEMkIqC9mQJ83ok4rDE';
        const chatId = '-1002038267327';
        try {
        await this.sendMessage(botToken, chatId, message);
      } catch (error) {
        // Handle "Too Many Requests" or other errors accordingly.
        // You might want to log the error or implement a retry mechanism.
      }
    }
  }
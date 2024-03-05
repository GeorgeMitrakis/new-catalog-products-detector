import { Bot } from "grammy";

export class NotificationsHandler {
    private _bot;
    private _chat_id: string | number;
    
    constructor(botToken: string, chatId: string | number) {
        this._bot = new Bot(botToken);
        this._chat_id = chatId;
    }

    async send(message: string){
        return await this._bot.api.sendMessage(this._chat_id, message);
    }
}
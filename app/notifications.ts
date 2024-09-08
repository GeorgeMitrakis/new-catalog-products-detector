import { Bot } from "grammy";

export class NotificationsHandler {
    private _bot;
    
    constructor(botToken: string) {
        this._bot = new Bot(botToken);
    }

    async send(targetChatId: string | number, message: string){
        return await this._bot.api.sendMessage(targetChatId, message, {parse_mode: "HTML"});
    }
}

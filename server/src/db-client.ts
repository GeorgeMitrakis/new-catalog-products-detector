import { MongoClient, ServerApiVersion } from 'mongodb';
import settings from './settings';

class DbClient {
    private static _instance: MongoClient | null = null;

    private constructor(){}

    static getInstance(){
        if(!this._instance){
            const dbSettings = settings.getSettings().database;

            const uri = `${dbSettings.protocol}://${dbSettings.username}:${dbSettings.password}@${dbSettings.host}/?retryWrites=true&w=majority&appName=${dbSettings.appName}`;

            this._instance = new MongoClient(uri, {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                }
            })
        }

        return this._instance;
    }
}

export const dbClient = DbClient.getInstance();
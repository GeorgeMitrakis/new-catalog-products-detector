import { MongoClient, ServerApiVersion } from 'mongodb';
import type { ITarget } from "./targets";


interface dbSettings{
    "protocol": string,
    "username": string,
    "password": string,
    "host": string,
    "appName": string
}

class DbManager {

    private static instance: DbManager;
    private client: MongoClient;

    private constructor(){
        const { protocol, username, password, host, appName } : dbSettings =  require('../dbsettings.json');

        const uri = `${protocol}://${username}:${password}@${host}/?retryWrites=true&w=majority&appName=${appName}`;

        // Create a MongoClient with a MongoClientOptions object to set the Stable API version
        this.client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
    }

    static getInstance(){
        if(!this.instance){
            this.instance = new DbManager();
        }

        return this.instance;
    }

    private async run(action: Function = () => {}) {
        let actionValue = null;

        try {
          // Connect the client to the server	(optional starting in v4.7)
          await this.client.connect();
          // Send a ping to confirm a successful connection
          await this.client.db("admin").command({ ping: 1 });
          console.log("Pinged your deployment. You successfully connected to MongoDB!");

          actionValue = await action();
        } finally {
          // Ensures that the client will close when you finish/error
          await this.client.close();
        }

        return actionValue
    }

    async getTarget(targetName: string){
        return await this.run(() =>  require(`../targets/${targetName}.json`));
    }

    async setTarget(targetName: string, targetConfig: ITarget){
        return await this.run( async () => await Bun.write(`../targets/${targetName}.json`, JSON.stringify(targetConfig)));
    }
}


export default DbManager.getInstance();
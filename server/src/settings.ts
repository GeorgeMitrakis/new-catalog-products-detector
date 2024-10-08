interface ISettings {
    proxy : {
        protocol: string,
        host : string,
        username : string,
        password : string
    },
    database : {
        protocol: string,
        username : string,
        password : string,
        host : string,
        appName: string
    }
}

class SettingsProvider {

    private _settings : ISettings | null = null;
        
    constructor(){ }

    getSettings() {
        if(!this._settings){
            this._settings = require('../settings/production.json');
        }

        return this._settings!;
    }
}

const settings = new SettingsProvider();

export default settings;


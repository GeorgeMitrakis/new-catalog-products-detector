import settings from '../settings/production.json' assert { type: 'json' }

export class Settings{

    private _settings : typeof settings | null = null;
        
    constructor(){ }

    getSettings() {
        if(!this._settings){
            this._settings = settings;
        }

        return this._settings;
    }
}


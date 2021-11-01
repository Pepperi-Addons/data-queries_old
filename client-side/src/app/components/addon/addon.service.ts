import { Observable } from 'rxjs';
import jwt from 'jwt-decode';
import { PapiClient } from '@pepperi-addons/papi-sdk';
import { Injectable } from '@angular/core';
import { PepDataConvertorService, PepHttpService, PepSessionService } from '@pepperi-addons/ngx-lib';
import { PepDialogActionButton, PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';



@Injectable({ providedIn: 'root' })
export class AddonService {

    accessToken = '';
    parsedToken: any
    papiBaseURL = ''
    addonUUID;
    queries:[]=[];
    get papiClient(): PapiClient {
        return new PapiClient({
            baseURL: this.papiBaseURL,
            token: this.session.getIdpToken(),
            addonUUID: this.addonUUID,
            suppressLogging:true
        })
    }

    constructor(
        public session:  PepSessionService
        ,public pepperiDataConverter: PepDataConvertorService
        ,private pepHttp: PepHttpService,
        public dialogService: PepDialogService

    ) {
        const accessToken = this.session.getIdpToken();
        this.parsedToken = jwt(accessToken);
        this.papiBaseURL = this.parsedToken["pepperi.baseurl"]
    }
    ngOnInit() {
    }
  
    async get(endpoint: string): Promise<any> {
        return await this.papiClient.get(endpoint);
    }

    async post(endpoint: string, body: any): Promise<any> {
        return await this.papiClient.post(endpoint, body);
    }

    pepGet(endpoint: string): Observable<any> {
        return this.pepHttp.getPapiApiCall(endpoint);
    }

    pepPost(endpoint: string, body: any): Observable<any> {
        return this.pepHttp.postPapiApiCall(endpoint, body);

    }

    openDialog(title: string, content: string, callback?: any) {
        const actionButton: PepDialogActionButton = {
            title: "OK",
            className: "",
            callback: callback,

        };
        const dialogConfig = this.dialogService.getDialogConfig({ disableClose: true, panelClass: 'pepperi-standalone' }, 'inline')
        //dialogConfig.minWidth = '30px';
        const dialogData = new PepDialogData({
            title: title,
            content: content,
            actionButtons: [actionButton],
            actionsType: "custom",
            showClose: false,

        });
        this.dialogService.openDefaultDialog(dialogData, dialogConfig);
    }

}


/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import { PapiClient } from '@pepperi-addons/papi-sdk';
import { DATA_QUREIES_TABLE_NAME } from './models/data-query';

export async function install(client: Client, request: Request): Promise<any> {

    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey
    });

    await papiClient.addons.data.schemes.post({
        Name: DATA_QUREIES_TABLE_NAME,
        Type: 'data',
        Fields: {
            Resource: { Type: 'String' },
            Type:{Type: 'String'},
            
        }
    });
    return {success:true,resultObject:{}}
}

export async function uninstall(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

export async function upgrade(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

export async function downgrade(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}
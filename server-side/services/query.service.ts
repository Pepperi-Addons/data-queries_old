import { PapiClient, InstalledAddon } from '@pepperi-addons/papi-sdk'
import { Client, Request } from '@pepperi-addons/debug-server';
import { v4 as uuid } from 'uuid';
import config from '../../addon.config.json'
import { DATA_QUREIES_TABLE_NAME, IntervalUnit, IntervalUnits, UserTypes } from '../models/data-query';
import { validate } from 'jsonschema';
import { QueriesScheme } from '../models/queries-scheme';

class QueryService {

    papiClient: PapiClient
    
    constructor(private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            addonSecretKey: client.AddonSecretKey
        });
    }

    async upsert(client: Client, request: Request) {

        const adal = this.papiClient.addons.data.uuid(config.AddonUUID).table(DATA_QUREIES_TABLE_NAME);
        const body = request.body;

        const validation = validate(body, QueriesScheme, { allowUnknownAttributes: false, });

        if (!validation.valid) {
            throw new Error(validation.toString());
        }

        if (!body.Key) {
            body.Key = uuid();
        }

        const chart = await adal.upsert(body);
        return chart;
    }

    async find(query: any) {

        const adal = this.papiClient.addons.data.uuid(config.AddonUUID).table(DATA_QUREIES_TABLE_NAME);

        if (query.key) {
            const chart = await adal.key(query.key).get();
            return chart;
        }
        else {
            const charts = await adal.find(query);
            return charts;
        }
    }

    private async getDataQuery(key: string) {
        // try {
        //     const chart = await this.papiClient.addons.data.uuid(config.AddonUUID).table(chartsTableScheme.Name).key(key).get();
        //     return chart;
        // }
        // catch (e) {
        //     return undefined;
        // }
    }
}

export default QueryService;
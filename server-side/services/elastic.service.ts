import { PapiClient, InstalledAddon } from '@pepperi-addons/papi-sdk'
import { Client, Request } from '@pepperi-addons/debug-server';
import { v4 as uuid } from 'uuid';
import config from '../../addon.config.json'
import { AggregatedField, DataQuery, DataTypes, DATA_QUREIES_TABLE_NAME, IntervalUnit, IntervalUnits } from '../models/data-query';
import { validate } from 'jsonschema';
import { QueriesScheme } from '../models/queries-scheme';
import esb, { Aggregation, dateHistogramAggregation, Query, termQuery } from 'elastic-builder';
import { callElasticSearchLambda } from '@pepperi-addons/system-addon-utils';
import jwtDecode from 'jwt-decode';


class ElasticService {

    papiClient: PapiClient;

    intervalUnitMap: { [key in IntervalUnit]: string } = {
        Days: 'd',
        Weeks: 'w',
        Months: 'M',
        Years: 'y',
    }

    constructor(private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            addonSecretKey: client.AddonSecretKey
        });
    }

    async executeUserDefinedQuery(client: Client, request: Request) {

        //test
        const accountsExternalIDs = ["kk1", "kk2"];

        const query: DataQuery = await this.getUserDefinedQuery(request);
        const distributorUUID = (<any>jwtDecode(client.OAuthAccessToken))["pepperi.distributoruuid"];
        const endpoint = `${distributorUUID}/_search`;
        const method = 'POST';

        let requestBody = new esb.RequestBodySearch().size(0);

        // filter by type
        requestBody.query(esb.boolQuery().must(esb.matchQuery('ElasticSearchType', query.Resource)));

        // filter by scoped account
        requestBody.agg(esb.termsAggregation('AccountExternalID', 'Account.ExternalID').include(accountsExternalIDs));


        // handle aggregation by series
        for (const serie of query.Series) {
            // handle aggregation by break by
            const calenderInterval = `${this.intervalUnitMap[serie.BreakBy.IntervalUnit]}${serie.BreakBy.Interval}`;
            requestBody.agg(esb.dateHistogramAggregation(serie.BreakBy.FieldID, serie.BreakBy.FieldID).calendarInterval(calenderInterval));

            for (const aggregatedField of serie.AggregatedFields) {
                let agg = this.getAggregator(aggregatedField);
                requestBody.agg(agg);
            }
        }

        const body = requestBody.toJSON();
        console.log(JSON.stringify(body));
        const lambdaResponse = await callElasticSearchLambda(endpoint, method, JSON.stringify(body), null, true);
    }

    private getAggregator(aggregatedField: AggregatedField) {
        let agg;
        switch (aggregatedField.Aggregator) {
            case 'Sum':
                agg = esb.sumAggregation(aggregatedField.FieldID, aggregatedField.FieldID);
                break;
            case 'Count':
                agg = esb.valueCountAggregation(aggregatedField.FieldID, aggregatedField.FieldID);
                break;
            case 'Average':
                agg = esb.avgAggregation(aggregatedField.FieldID, aggregatedField.FieldID);
                break;
        }
        return agg;
    }

    private async getUserDefinedQuery(request: Request) {

        const queryKey = request.query?.query_id;

        if (!queryKey) {
            throw new Error(`Missing request parameters: query_id`);
        }

        const adal = this.papiClient.addons.data.uuid(config.AddonUUID).table(DATA_QUREIES_TABLE_NAME);
        const query = await adal.key(queryKey).get();

        if (!query) {
            throw new Error(`Invalid request parameters: query_id`);
        }
        return <DataQuery>query;
    }
}

export default ElasticService;
import { PapiClient, InstalledAddon } from '@pepperi-addons/papi-sdk'
import { Client, Request } from '@pepperi-addons/debug-server';
import { v4 as uuid } from 'uuid';
import config from '../../addon.config.json'
import { AggregatedField, DataQuery, DataTypes, DATA_QUREIES_TABLE_NAME, GroupBy, IntervalUnit, IntervalUnits, Serie } from '../models/data-query';
import { validate } from 'jsonschema';
import { QueriesScheme } from '../models/queries-scheme';
import esb, { Aggregation, DateHistogramAggregation, dateHistogramAggregation, dateRangeAggregation, Query, termQuery } from 'elastic-builder';
import { callElasticSearchLambda } from '@pepperi-addons/system-addon-utils';
import jwtDecode from 'jwt-decode';
import { DataQueryResponse } from '../models/data-query-response';


class ElasticService {

    papiClient: PapiClient;

    intervalUnitMap: { [key in IntervalUnit]: string } = {
        Days: 'd',
        Weeks: 'w',
        Months: 'M',
        Years: 'y',
    }

    intervalUnitFormat: { [key in IntervalUnit]: string } = {
        Days: 'dd',
        Weeks: 'MM-dd',
        Months: 'MM',
        Years: 'yyyy',
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

        const query: DataQuery = await this.getUserDefinedQuery(request);
        const distributorUUID = (<any>jwtDecode(client.OAuthAccessToken))["pepperi.distributoruuid"];
        let endpoint = `${distributorUUID}/_search`;

        //to remove
        endpoint = `9a559f05-c41e-49a8-8de4-3155952f465f/_search`
        const method = 'POST';

        let elasticRequestBody = new esb.RequestBodySearch().size(0);

        // filter by type
        elasticRequestBody.query(esb.boolQuery().must(esb.matchQuery('ElasticSearchType', query.Resource)));
        let aggregations: Aggregation[] = [];

        // filter by scoped account
        if (query.GroupBy) {
            query.GroupBy.forEach(groupBy => {
                aggregations.push(this.buildAggregationQuery(groupBy, aggregations));
            });
        }
        // handle aggregation by series
        for (const serie of query.Series) {
            // handle aggregation by break by
            aggregations.push(this.buildAggregationQuery(serie.BreakBy, aggregations));

            for (const aggregatedField of serie.AggregatedFields) {
                let agg = this.getAggregator(aggregatedField);
                aggregations.push(agg);
                //elasticRequestBody.agg(agg);
            }
        }

        // build nested aggregations from array of aggregations
        let aggs: esb.Aggregation = this.buildNestedAggregations(aggregations);
        elasticRequestBody.agg(aggs);

        const body = elasticRequestBody.toJSON();
        console.log(`lambdaBody: ${JSON.stringify(body)}`);

        //const lambdaResponse = await callElasticSearchLambda(endpoint, method, JSON.stringify(body), null, true);
        // console.log(`lambdaResponse: ${JSON.stringify(lambdaResponse)}`);

        // if (!lambdaResponse.success) {
        //     console.log(`Failed to execute data query ID: ${query.Key}, lambdaBody: ${JSON.stringify(body)}`)
        //     throw new Error(`Failed to execute data query ID: ${query.Key}`);
        // }

        let response: DataQueryResponse = this.buildResponseFromElasticResults(null, query);

        return response;
    }

    private buildResponseFromElasticResults(lambdaResponse, query: DataQuery) {

        lambdaResponse = {
            "aggregations": {
                "Transaction.ActionDateTime": {
                    "buckets": [
                        {
                            "key_as_string": "2018",
                            "key": 1514764800000,
                            "doc_count": 7133021,
                            "Item.MainCategory": {
                                "doc_count_error_upper_bound": 2941,
                                "sum_other_doc_count": 106658,
                                "buckets": [
                                    {
                                        "key": "Pocket",
                                        "doc_count": 5378821,
                                        "UnitsQuantity_Sum": {
                                            "value": 41341803.0
                                        }
                                    },
                                    {
                                        "key": "Hallmark",
                                        "doc_count": 978372,
                                        "UnitsQuantity_Sum": {
                                            "value": 4180953.0
                                        }
                                    },
                                    {
                                        "key": "Box",
                                        "doc_count": 417201,
                                        "UnitsQuantity_Sum": {
                                            "value": 12965525.0
                                        }
                                    },
                                    {
                                        "key": "Tesco",
                                        "doc_count": 125464,
                                        "UnitsQuantity_Sum": {
                                            "value": 829635.0
                                        }
                                    },
                                    {
                                        "key": "Waitrose",
                                        "doc_count": 36452,
                                        "UnitsQuantity_Sum": {
                                            "value": 420233.0
                                        }
                                    },
                                    {
                                        "key": "Danillo",
                                        "doc_count": 26058,
                                        "UnitsQuantity_Sum": {
                                            "value": 137353.0
                                        }
                                    },
                                    {
                                        "key": "Morrisons",
                                        "doc_count": 19776,
                                        "UnitsQuantity_Sum": {
                                            "value": 170668.0
                                        }
                                    },
                                    {
                                        "key": "Tailormade",
                                        "doc_count": 17010,
                                        "UnitsQuantity_Sum": {
                                            "value": 89371.0
                                        }
                                    },
                                    {
                                        "key": "Carte Blanche Greetings",
                                        "doc_count": 14317,
                                        "UnitsQuantity_Sum": {
                                            "value": 72968.0
                                        }
                                    },
                                    {
                                        "key": "Me To You",
                                        "doc_count": 12365,
                                        "UnitsQuantity_Sum": {
                                            "value": 66713.0
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "key_as_string": "2019",
                            "key": 1546300800000,
                            "doc_count": 9298518,
                            "Item.MainCategory": {
                                "doc_count_error_upper_bound": 3899,
                                "sum_other_doc_count": 153792,
                                "buckets": [
                                    {
                                        "key": "Pocket",
                                        "doc_count": 5377363,
                                        "UnitsQuantity_Sum": {
                                            "value": 26425553.0
                                        }
                                    },
                                    {
                                        "key": "Hallmark",
                                        "doc_count": 2095774,
                                        "UnitsQuantity_Sum": {
                                            "value": 12127732.0
                                        }
                                    },
                                    {
                                        "key": "Box",
                                        "doc_count": 1227128,
                                        "UnitsQuantity_Sum": {
                                            "value": 35572682.0
                                        }
                                    },
                                    {
                                        "key": "Tesco",
                                        "doc_count": 194520,
                                        "UnitsQuantity_Sum": {
                                            "value": 982884.0
                                        }
                                    },
                                    {
                                        "key": "Morrisons",
                                        "doc_count": 107618,
                                        "UnitsQuantity_Sum": {
                                            "value": 1486518.0
                                        }
                                    },
                                    {
                                        "key": "Waitrose",
                                        "doc_count": 41994,
                                        "UnitsQuantity_Sum": {
                                            "value": 215629.0
                                        }
                                    },
                                    {
                                        "key": "Me To You",
                                        "doc_count": 30175,
                                        "UnitsQuantity_Sum": {
                                            "value": 362776.0
                                        }
                                    },
                                    {
                                        "key": "Danillo",
                                        "doc_count": 26204,
                                        "UnitsQuantity_Sum": {
                                            "value": 149810.0
                                        }
                                    },
                                    {
                                        "key": "Emotional Rescue",
                                        "doc_count": 21241,
                                        "UnitsQuantity_Sum": {
                                            "value": 227876.0
                                        }
                                    },
                                    {
                                        "key": "Carte Blanche Greetings",
                                        "doc_count": 20199,
                                        "UnitsQuantity_Sum": {
                                            "value": 218149.0
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }
        let response: DataQueryResponse = new DataQueryResponse();

        Object.keys(lambdaResponse.aggregations).forEach( (key) => {
            response.Groups.push(key);
            lambdaResponse.aggregations[key].buckets.forEach(bucket => {
                let dataSet = {};
                dataSet[key] = bucket[`key_as_string`];
                query.Series.forEach(series => {
                    bucket[series.BreakBy.FieldID].buckets.forEach(serieBucket => {
                        series.AggregatedFields.forEach(aggregationField => {
                            const key = serieBucket['key_as_string'] ? serieBucket['key_as_string'] : serieBucket.key;
                            // if the series already exists in series - dont add it
                            if (response.Series.indexOf(key) == -1) {
                                response.Series.push(key);
                            }
                            const aggName = this.buildAggragationFieldString(aggregationField);
                            dataSet[key] = serieBucket[aggName].value;
                        });
                    });
                    response.DataSet.push(dataSet);
                });
            });

        });
        return response;
    }

    private buildNestedAggregations(aggregations: esb.Aggregation[]) {
        let aggs: any = null;
        for (let i = aggregations.length - 1; i >= 0; i--) {
            if (i === aggregations.length - 1) {
                aggs = aggregations[i];
            } else {
                aggs = aggregations[i].agg(aggs);
            }
        }
        return aggs;
    }

    // build sggregation - if the type field is date time build dateHistogramAggregation else termsAggregation
    private buildAggregationQuery(groupBy: GroupBy, sggregations: esb.Aggregation[]) {
        let query;
        if (groupBy.IntervalUnit && groupBy.Interval) {
            const calenderInterval = `${groupBy.Interval}${this.intervalUnitMap[groupBy.IntervalUnit]}`;
            query = esb.dateHistogramAggregation(groupBy.FieldID, groupBy.FieldID).calendarInterval(calenderInterval).format(this.intervalUnitFormat[groupBy.IntervalUnit]);
        } else {
            query = esb.termsAggregation(groupBy.FieldID, `${groupBy.FieldID}.keyword`);
        }
        return query;
    }

    private buildAggragationFieldString(aggregatedField: AggregatedField):string {
        return `${aggregatedField.FieldID}_${aggregatedField.Aggregator}`
    }

    private getAggregator(aggregatedField: AggregatedField) {
        let agg;
        const aggName = this.buildAggragationFieldString(aggregatedField);
        switch (aggregatedField.Aggregator) {
            case 'Sum':
                agg = esb.sumAggregation(aggName, aggregatedField.FieldID);
                break;
            case 'Count':
                agg = esb.valueCountAggregation(aggName, aggregatedField.FieldID);
                break;
            case 'Average':
                agg = esb.avgAggregation(aggName, aggregatedField.FieldID);
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
import { PapiClient, InstalledAddon } from '@pepperi-addons/papi-sdk'
import { Client, Request } from '@pepperi-addons/debug-server';
import { v4 as uuid } from 'uuid';
import config from '../../addon.config.json'
import { AggregatedField, DataQuery, DataTypes, DATA_QUREIES_TABLE_NAME, GroupBy, IntervalUnit, IntervalUnits, Serie } from '../models/data-query';
import { validate } from 'jsonschema';
import { QueriesScheme } from '../models/queries-scheme';
import esb, { Aggregation, DateHistogramAggregation, dateHistogramAggregation, dateRangeAggregation, maxBucketAggregation, Query, termQuery } from 'elastic-builder';
import { callElasticSearchLambda } from '@pepperi-addons/system-addon-utils';
import jwtDecode from 'jwt-decode';
import { DataQueryResponse } from '../models/data-query-response';


class ElasticService {

    papiClient: PapiClient;

    constructor(private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            addonSecretKey: client.AddonSecretKey
        });
    }
    MaxAggregationSize = 100;

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

        const lambdaResponse = await callElasticSearchLambda(endpoint, method, JSON.stringify(body), null, true);
        console.log(`lambdaResponse: ${JSON.stringify(lambdaResponse)}`);

        if (!lambdaResponse.success) {
            console.log(`Failed to execute data query ID: ${query.Key}, lambdaBody: ${JSON.stringify(body)}`)
            throw new Error(`Failed to execute data query ID: ${query.Key}`);
        }
        // const lambdaResponse = {
        //     resultObject: null
        // };
        let response: DataQueryResponse = this.buildResponseFromElasticResults(lambdaResponse.resultObject, query);

        return response;
    }

    private buildResponseFromElasticResults(lambdaResponse, query: DataQuery) {

        // lambdaResponse = {
        //     "aggregations" : {
        //         "Item.MainCategory" : {
        //           "doc_count_error_upper_bound" : 0,
        //           "sum_other_doc_count" : 14774530,
        //           "buckets" : [
        //             {
        //               "key" : "28 Celsius",
        //               "doc_count" : 21,
        //               "Transaction.ActionDateTime" : {
        //                 "buckets" : [
        //                   {
        //                     "key_as_string" : "2019",
        //                     "key" : 1546300800000,
        //                     "doc_count" : 16,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 338.0
        //                     }
        //                   },
        //                   {
        //                     "key_as_string" : "2018",
        //                     "key" : 1514764800000,
        //                     "doc_count" : 5,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 23.0
        //                     }
        //                   }
        //                 ]
        //               }
        //             },
        //             {
        //               "key" : "Abacus Cards",
        //               "doc_count" : 947,
        //               "Transaction.ActionDateTime" : {
        //                 "buckets" : [
        //                   {
        //                     "key_as_string" : "2019",
        //                     "key" : 1546300800000,
        //                     "doc_count" : 298,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 1445.0
        //                     }
        //                   },
        //                   {
        //                     "key_as_string" : "2018",
        //                     "key" : 1514764800000,
        //                     "doc_count" : 649,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 3162.0
        //                     }
        //                   }
        //                 ]
        //               }
        //             },
        //             {
        //               "key" : "All Joy Designs",
        //               "doc_count" : 2,
        //               "Transaction.ActionDateTime" : {
        //                 "buckets" : [
        //                   {
        //                     "key_as_string" : "2019",
        //                     "key" : 1546300800000,
        //                     "doc_count" : 2,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 2.0
        //                     }
        //                   }
        //                 ]
        //               }
        //             },
        //             {
        //               "key" : "Archivist",
        //               "doc_count" : 19,
        //               "Transaction.ActionDateTime" : {
        //                 "buckets" : [
        //                   {
        //                     "key_as_string" : "2018",
        //                     "key" : 1514764800000,
        //                     "doc_count" : 19,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 60.0
        //                     }
        //                   }
        //                 ]
        //               }
        //             },
        //             {
        //               "key" : "ArtPress",
        //               "doc_count" : 721,
        //               "Transaction.ActionDateTime" : {
        //                 "buckets" : [
        //                   {
        //                     "key_as_string" : "2019",
        //                     "key" : 1546300800000,
        //                     "doc_count" : 563,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 3317.0
        //                     }
        //                   },
        //                   {
        //                     "key_as_string" : "2018",
        //                     "key" : 1514764800000,
        //                     "doc_count" : 158,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 664.0
        //                     }
        //                   }
        //                 ]
        //               }
        //             },
        //             {
        //               "key" : "Belly Button",
        //               "doc_count" : 1882,
        //               "Transaction.ActionDateTime" : {
        //                 "buckets" : [
        //                   {
        //                     "key_as_string" : "2019",
        //                     "key" : 1546300800000,
        //                     "doc_count" : 1554,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 7360.0
        //                     }
        //                   },
        //                   {
        //                     "key_as_string" : "2018",
        //                     "key" : 1514764800000,
        //                     "doc_count" : 328,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 1689.0
        //                     }
        //                   }
        //                 ]
        //               }
        //             },
        //             {
        //               "key" : "Black Olive",
        //               "doc_count" : 164,
        //               "Transaction.ActionDateTime" : {
        //                 "buckets" : [
        //                   {
        //                     "key_as_string" : "2019",
        //                     "key" : 1546300800000,
        //                     "doc_count" : 9,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 44.0
        //                     }
        //                   },
        //                   {
        //                     "key_as_string" : "2018",
        //                     "key" : 1514764800000,
        //                     "doc_count" : 155,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 849.0
        //                     }
        //                   }
        //                 ]
        //               }
        //             },
        //             {
        //               "key" : "Blue Eyed Sun",
        //               "doc_count" : 4064,
        //               "Transaction.ActionDateTime" : {
        //                 "buckets" : [
        //                   {
        //                     "key_as_string" : "2019",
        //                     "key" : 1546300800000,
        //                     "doc_count" : 2247,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 7549.0
        //                     }
        //                   },
        //                   {
        //                     "key_as_string" : "2018",
        //                     "key" : 1514764800000,
        //                     "doc_count" : 1817,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 8011.0
        //                     }
        //                   }
        //                 ]
        //               }
        //             },
        //             {
        //               "key" : "Bluebell 33",
        //               "doc_count" : 1823,
        //               "Transaction.ActionDateTime" : {
        //                 "buckets" : [
        //                   {
        //                     "key_as_string" : "2019",
        //                     "key" : 1546300800000,
        //                     "doc_count" : 772,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 4668.0
        //                     }
        //                   },
        //                   {
        //                     "key_as_string" : "2018",
        //                     "key" : 1514764800000,
        //                     "doc_count" : 1051,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 5693.0
        //                     }
        //                   }
        //                 ]
        //               }
        //             },
        //             {
        //               "key" : "Box",
        //               "doc_count" : 1644329,
        //               "Transaction.ActionDateTime" : {
        //                 "buckets" : [
        //                   {
        //                     "key_as_string" : "2019",
        //                     "key" : 1546300800000,
        //                     "doc_count" : 1227128,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 3.5572682E7
        //                     }
        //                   },
        //                   {
        //                     "key_as_string" : "2018",
        //                     "key" : 1514764800000,
        //                     "doc_count" : 417201,
        //                     "UnitsQuantity_Sum" : {
        //                       "value" : 1.2965525E7
        //                     }
        //                   }
        //                 ]
        //               }
        //             }
        //           ]
        //         }
        //       }
        // }
        let response: DataQueryResponse = new DataQueryResponse();

        Object.keys(lambdaResponse.aggregations).forEach((key) => {
            // remove the dots since chart js doesnt support it
            const keyString = this.cutDotNotation(key);
            response.Groups.push(keyString);
            lambdaResponse.aggregations[key].buckets.forEach(bucket => {
                let dataSet = {};
                const keyName = this.getKeyAggregationName(bucket);
                dataSet[keyString] = keyName;
                query.Series.forEach(series => {
                    bucket[series.BreakBy.FieldID].buckets.forEach(serieBucket => {
                        series.AggregatedFields.forEach(aggregationField => {
                            const keyName = this.getKeyAggregationName(serieBucket);;
                            const keyString = this.cutDotNotation(keyName);

                            // if the series already exists in series - dont add it
                            if (response.Series.indexOf(keyString) == -1) {
                                response.Series.push(keyString);
                            }
                            const aggName = this.buildAggragationFieldString(aggregationField);
                            dataSet[keyString] = serieBucket[aggName].value;
                        });
                    });
                    response.DataSet.push(dataSet);
                });
            });

        });
        return response;
    }

    private cutDotNotation(key: string) {
        return key.split('.').join("");
    }

    private getKeyAggregationName(bucket: any) {
        // in cate of histogram aggregation we want the key as data and not timestamp
        return bucket['key_as_string'] ? bucket['key_as_string'] : bucket.key;
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

        // Maximum size of each aggregation is 100
        const topAggs = groupBy.Top?.Max ? groupBy.Top.Max : this.MaxAggregationSize;

        // there is a There is a difference between data histogram aggregation and terms aggregation. 
        // data histogram aggregation has no size.
        // This aggregation is already selective in the sense that the number of buckets is manageable through the interval 
        // so it is necessary to do nested aggregation to get size buckets
        const isDateHistogramAggregation = groupBy.IntervalUnit && groupBy.Interval;
        let query;
        if (isDateHistogramAggregation) {
            const calenderInterval = `${groupBy.Interval}${this.intervalUnitMap[groupBy.IntervalUnit!]}`;
            query = esb.dateHistogramAggregation(groupBy.FieldID, groupBy.FieldID).calendarInterval(calenderInterval).format(this.intervalUnitFormat[groupBy.IntervalUnit!]);
        } else {
            query = esb.termsAggregation(groupBy.FieldID, `${groupBy.FieldID}.keyword`);
        }

        //Handle the sorting
        //query.order('_key', groupBy.Top?.Ascending ? 'asc' : 'desc');

        // nested aggregation to get size buckets
        if (isDateHistogramAggregation) {
            query.aggs([esb.bucketSortAggregation('Top').size(topAggs)])
        }
        return query;
    }

    private buildAggragationFieldString(aggregatedField: AggregatedField): string {
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
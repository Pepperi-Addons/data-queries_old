export const QueriesScheme =
{
    "type": "object",
    "properties": {
        "Resource": {
            "type": "string",
            "enum": ["all_activities", "transactions", "transaction_lines"]

        },
        "Type": {
            "type": "string",
            "enum": ["Single", "Series", "MultiSeries"]
        },
        "Series": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "properties": {
                    "AggregatedFields": {
                        "type": "array",
                        "minItems": 1,
                        "items": {
                            "type": "object",
                            "properties": {
                                "FieldID": {
                                    "type": "string"
                                },
                                "Alias": {
                                    "type": "string"
                                },
                                "Aggregator": {
                                    "type": "string",
                                    "enum": ["Sum", "Count", "Average"]
                                }
                            },
                            "additionalProperties": false,
                            "required": [
                                "FieldID",
                                "Aggregator"
                            ]
                        }
                    },
                    "BreakBy": {
                        "type": "object",
                        "properties": {
                            "FieldID": {
                                "type": "string"
                            },
                            "Interval": {
                                "type": "integer"
                            },
                            "IntervalUnit": {
                                "type": "string",
                                "enum": ["Days", "Weeks", "Months", "Years"]
                            },
                            "Top": {
                                "type": "object",
                                "properties": {
                                    "FieldID": {
                                        "type": "string"
                                    },
                                    "Max": {
                                        "type": "integer",
                                        "maximum": 100
                                    },
                                    "Ascending": {
                                        "type": "boolean"
                                    }
                                },
                                "additionalProperties": false
                            }
                        },
                        "additionalProperties": false,
                        "required": [
                            "FieldID"
                        ]
                    },
                    "Scope": {
                        "type": "object",
                        "properties": {
                            "Account": {
                                "type": "string",
                                "enum": ["Assigned", "All"]
                            },
                            "User": {
                                "type": "string",
                                "enum": ["Current", "UnderMyRole", "All"]
                            }
                        },
                        "additionalProperties": false,
                    },
                    "DynamicFilterFields":{
                        "type": "array",
                        "items":{
                            "type":"string"
                        }
                    },
                    "Filter":{
                        "type":"object"
                    }
                },
                "additionalProperties": false,
                "required": [
                    "AggregatedFields"
                ]
            }
        },
        "GroupBy": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "FieldID": {
                        "type": "string"
                    },
                    "Interval": {
                        "type": "integer"
                    },
                    "IntervalUnit": {
                        "type": "string",
                        "enum": ["Days", "Weeks", "Months", "Years"]
                    },
                    "Top": {
                        "type": "object",
                        "properties": {
                            "FieldID": {
                                "type": "string"
                            },
                            "Max": {
                                "type": "integer",
                                "maximum": 100
                            },
                            "Ascending": {
                                "type": "Ascending"
                            }
                        },
                        "additionalProperties": false
                    }
                },
                "additionalProperties": false
            }
        },
        "ModificationDateTime": {
            "type": "string"
        },
        "CreationDateTime": {
            "type": "string"
        },
        "Hidden": {
            "type": "boolean"
        },
        "Key": {
            "type": "string"
        },
        "Name": {
            "type": "string"
        },
        "Description": {
            "type": "string"
        },
    },
    "required": [
        "Resource",
        "Type",
        "Series"
    ],
    "additionalProperties": false

}


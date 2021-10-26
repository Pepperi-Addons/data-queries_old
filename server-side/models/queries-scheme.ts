export const QueriesScheme =
{
    "type": "object",
    "properties": {
        "Resource": {
            "type": "string",
            "enum": ["all_activities","transactions", "transaction_lines"]
            
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
                            }
                        },
                        "required": [
                            "FieldID"
                        ]
                    },
                    "Scope": {
                        "type": "oblect",
                        "properties": {
                            "Account": {
                                "type": "string",
                                "enum": ["Assigned", "All"]
                            },
                            "User": {
                                "type": "string",
                                "enum":  ["Current", "UnderMyRole", "All"]
                            }
                        }
                    }
                },
                "required": [
                    "AggregatedFields"
                ]
            }
        },
        "GroupBy": {
            "type":"array",
            "items":{   
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
                    }
                }
            }
        },
        "ModificationDateTime":{
            "type":"string"
        },
        "CreationDateTime":{
            "type":"string"
        },
        "Hidden":{
            "type":"boolean"
        },
        "Key":{
            "type":"string"
        },
    },
    "required": [
        "Resource",
        "Type",
        "Series"
    ],
    "additionalProperties": false
    
}


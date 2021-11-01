export class DataQueryResponse {
    Groups: string[];
    Series: string[];
    DataSet: { [key: string]: string }[];

    constructor() { 
        this.Groups = [];
        this.Series=[];
        this.DataSet=[];
     }  
}


// {
// 	"Groups": [
// 		"Transaction.ActionDateTime"
// 	],
// 	"Series": [
// 		"PKT Order Training Account",
// 		"Account B"
// 	],
// 	"DataSet": [
// 		{
// 			"ActionDateTime": "2018",
// 			"2018-01": 30rere,
// 			"shufersal": 50
// 		},
// 		{
// 			"ActionDate": "01/02/01",
// 			"rami": 20,
// 			"shufersal": 30
// 		}
// 	]
// }
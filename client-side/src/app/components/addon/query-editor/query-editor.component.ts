import { Component, OnInit } from '@angular/core';
import { IPepFieldValueChangeEvent } from '@pepperi-addons/ngx-lib';

@Component({
  selector: 'addon-query-editor',
  templateUrl: './query-editor.component.html',
  styleUrls: ['./query-editor.component.scss']
})
export class QueryEditorComponent implements OnInit {
  activeTabIndex = 0;


  constructor() { }
  chartsOptions = [{ key: 'Series', value: 'Series' }, { key: 'Line', value: 'Line' }];
  resourceOptions = [{ key: '2', value: 'trnsactions' }, { key: '99', value: 'all activities' }];
  aggregationsOptions = [{ key: 'sum', value: 'sum' }, { key: 'average', value: 'average' }, { key: 'count', value: 'count' }];
  aggregationsFieldsOptions = [{ key: 'accountTsaChain', value: 'AccountTSAChain' }, { key: 'transactionType', value: 'TransactionType' }];
  breakByOptions = [{ key: 'accountTsaChain', value: 'AccountTSAChain' }, { key: 'transactionType', value: 'TransactionType' }];
  intervalOptions = [{ key: 'days', value: 'Days' }, { key: 'weeks', value: 'Weeks' }, { key: 'months', value: 'Months' }, { key: 'years', value: 'Years' }];
  orderOptions = [{ key: 'asc', value: 'Ascending' }, { key: 'desc', value: 'Decending' }];




  ngOnInit(): void {
  }

  tabClick(e) {
    this.activeTabIndex = e.index;
  }

  onChartSelected(event: IPepFieldValueChangeEvent) {

  }


  onValueChanged(element, $event) {
    // switch (element) {
    //   case 'Name': {
    //     this.chart.Name = $event;
    //     break;
    //   }
    //   case 'Description': {
    //     this.chart.Description = $event;
    //     break;
    //   }
    //   case 'Type': {
    //     this.chart.Type = $event;
    //     break;
    //   }
    // }
  }
}

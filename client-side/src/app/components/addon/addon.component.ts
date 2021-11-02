import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { map } from 'rxjs/operators';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { AddonService, PepperiTableComponent } from './index';
import { Observable } from 'rxjs';
import { InstalledAddon } from '@pepperi-addons/papi-sdk';
import { ActivatedRoute } from '@angular/router';
import { IPepFieldValueChangeEvent, PepAddonService, PepLayoutService, PepLoaderService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import 'systemjs'
import 'systemjs/dist/extras/amd'

@Component({
  selector: 'addon-module',
  templateUrl: './addon.component.html',
  styleUrls: ['./addon.component.scss'],
  providers: [TranslatePipe]
})
export class AddonComponent implements OnInit {

  screenSize: PepScreenSizeType;
  queriesOptions: { key: string, value: string }[] = [];
  chartsOptions: { key: string, value: string }[] = [];

  dataSource$: Observable<any[]>
  displayedColumns = ['Name', 'Description'];
  @Input() hostObject: any;
  @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(PepperiTableComponent) table: PepperiTableComponent;
  ScriptURI: any;
  selectedChart: any;
  selectedQuery: any;
  queryResult: any;
  chartInstance: any;


  constructor(
    public layoutService: PepLayoutService,
    public dialog: PepDialogService,
    public translate: TranslateService,
    private addonService: PepAddonService,
    public pluginService: AddonService,
    public routeParams: ActivatedRoute,
    public loaderService: PepLoaderService,
    private cd: ChangeDetectorRef,
  ) {

    this.layoutService.onResize$.subscribe(size => {
      this.screenSize = size;
    });
    this.pluginService.addonUUID = this.routeParams.snapshot.params['addon_uuid'];

  }

  ngOnInit() {
    //    this.dataSource$ = this.addonService.pepGet(`/addons/installed_addons`)
    //    .pipe(
    //        map((addons: InstalledAddon[]) =>
    //          addons.filter(addon => addon?.Addon).map(addon => addon?.Addon))
    //     );

    this.addonService.getAddonApiCall(this.pluginService.addonUUID, 'api', 'queries').toPromise().then((dataQueries) => {
      dataQueries.forEach(dataQuerie => {
        this.queriesOptions.push({ key: dataQuerie.Key, value: dataQuerie.Name })
      });
    });
    this.addonService.getAddonApiCall('3d118baf-f576-4cdb-a81e-c2cc9af4d7ad', 'api', 'charts').toPromise().then((charts) => {
      charts.forEach(chart => {
        this.chartsOptions.push({ key: chart.Key, value: chart.Name })
      });
    })
  }

  openDialog() {
    const content = this.translate.instant('Dialog_Body');
    const title = this.translate.instant('Dialog_Title');
    const dataMsg = new PepDialogData({ title, actionsType: "close", content });
    this.dialog.openDefaultDialog(dataMsg);
  }

  onChartSelected(event: IPepFieldValueChangeEvent) {
    if (event) {
      this.addonService.getAddonApiCall('3d118baf-f576-4cdb-a81e-c2cc9af4d7ad', 'api', `charts?where=Key='${event}'`).toPromise().then((chart) => {
        this.selectedChart = chart[0];
        if (this.queryResult) {
          this.importChartFileAndExecute();
        }
      });
    } else {
      this.selectedChart = event;
      this.chartInstance = undefined;
    }
  }

  onDataQuerySelected(event: IPepFieldValueChangeEvent) {
    if (event) {
      this.addonService.postAddonApiCall(this.pluginService.addonUUID, 'elastic', `execute?query_id=${event}`).toPromise().then((dataQuery) => {
        this.addonService.getAddonApiCall(this.pluginService.addonUUID, 'api', `queries?where=Key='${event}'`).toPromise().then((query) => {
          this.selectedQuery = query[0];
          this.queryResult = dataQuery;
          if (this.selectedChart) {
            this.importChartFileAndExecute();
          }
        });
      });
    }
    else {
      this.queryResult = event;
      this.chartInstance = undefined;
    }

  }

  onFileSelect(event) {
    debugger;
    this.loaderService.show();
    this.cd.detectChanges();
    let fileStr = event.fileStr;
    console.log(fileStr);
    this.ScriptURI = fileStr;
    this.loaderService.hide();

  }

  private importChartFileAndExecute() {

    System.import(this.selectedChart.ScriptURI).then((res) => {
      const configuration = {
        label: this.selectedQuery.Name
      }
      this.loadSrcJSFiles(res.deps).then(() => {
        const previewDiv = document.getElementById("previewArea");
        this.chartInstance = new res.default.default(previewDiv, configuration);
        this.chartInstance.data = this.queryResult;
        this.chartInstance.update();
        this.loaderService.hide();

      }).catch(err => {
        this.handleErrorDialog(this.translate.instant("FailedExecuteFile"));
      })
    }).catch(err => {
      console.log(err);
      this.handleErrorDialog(this.translate.instant("FailedExecuteFile"));
    });
  }

  loadSrcJSFiles(imports) {

    let promises = [];

    imports.forEach(src => {
      promises.push(new Promise<void>((resolve) => {
        debugger
        const existing = document.getElementById(src);
        debugger;
        if (!existing) {
          let _oldDefine = window['define'];
          window['define'] = null;

          const node = document.createElement('script');
          node.src = src;
          node.id = src;
          node.onload = (script) => {
            window['define'] = _oldDefine;
            resolve()
          };
          node.onerror = (script) => {
            this.handleErrorDialog(this.translate.instant("FailedLoadLibrary", {
              library: script['target'].id
            }));
          };
          document.getElementsByTagName('head')[0].appendChild(node);
        }
        else {
          resolve();
        }
      }));
    });
    return Promise.all(promises);
  }

  private handleErrorDialog(message: string) {
    this.loaderService.hide();
    this.pluginService.openDialog(this.translate.instant("Error"), message);
  }
}

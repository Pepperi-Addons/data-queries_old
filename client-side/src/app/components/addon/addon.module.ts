import { MatCardModule } from '@angular/material/card';
import { AddonService } from './addon.service';
// import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { PepFieldTitleModule } from '@pepperi-addons/ngx-lib/field-title';
import { AddonComponent } from './index';
import { PepperiTableComponent } from './pepperi-table.component'
import { MatDialogModule } from '@angular/material/dialog';
import { PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { PepAddonService, PepCustomizationService, PepFileService, PepHttpService } from '@pepperi-addons/ngx-lib';
import { PepSelectModule } from '@pepperi-addons/ngx-lib/select';
import { PepPageLayoutModule } from '@pepperi-addons/ngx-lib/page-layout';
import { PepSideBarModule } from '@pepperi-addons/ngx-lib/side-bar';
import { PepTopBarModule } from '@pepperi-addons/ngx-lib/top-bar';
import { PepListModule } from '@pepperi-addons/ngx-lib/list';
import { PepAttachmentModule } from '@pepperi-addons/ngx-lib/attachment';
import { MatTabsModule } from '@angular/material/tabs';
import { QueryEditorComponent } from './query-editor/query-editor.component';

export function createTranslateLoader(http: HttpClient, fileService: PepFileService, addonService: PepAddonService) {
    const translationsPath: string = fileService.getAssetsTranslationsPath();
    const translationsSuffix: string = fileService.getAssetsTranslationsSuffix();
    const addonStaticFolder = addonService.getAddonStaticFolder();

    return new MultiTranslateHttpLoader(http, [
        {
            prefix:
                addonStaticFolder.length > 0
                    ? addonStaticFolder + translationsPath
                    : translationsPath,
            suffix: translationsSuffix,
        },
        {
            prefix:
                addonStaticFolder.length > 0
                    ? addonStaticFolder + "assets/i18n/"
                    : "/assets/i18n/",
            suffix: ".json",
        },
    ]);
}

@NgModule({
    declarations: [
        AddonComponent,
        PepperiTableComponent
    ],
    imports: [
        CommonModule,
        PepPageLayoutModule,
        PepSideBarModule,
        HttpClientModule,
        MatDialogModule,
        MatCardModule,
        PepFieldTitleModule,
        MatTabsModule,
        PepAttachmentModule,
        //// When not using module as sub-addon please remark this for not loading twice resources
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient, PepFileService, PepAddonService]
            }, isolate: false
        }),
        //// Example for importing tree-shakeable @pepperi-addons/ngx-lib components to a module
        // PepNgxLibModule,
        // PepButtonModule,
        PepSelectModule,
        PepTopBarModule,
        PepListModule


    ],
    exports: [AddonComponent],
    providers: [
        AddonService,
        HttpClient,
        TranslateStore,
        PepHttpService,
        PepAddonService,
        PepFileService,
        PepCustomizationService,
        PepDialogService
    ]
})
export class AddonModule {
    constructor(
        translate: TranslateService
    ) {

        let userLang = 'en';
        translate.setDefaultLang(userLang);
        userLang = translate.getBrowserLang().split('-')[0]; // use navigator lang if available

        if (location.href.indexOf('userLang=en') > -1) {
            userLang = 'en';
        }
        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(userLang).subscribe((res: any) => {
            // In here you can put the code you want. At this point the lang will be loaded
        });
    }
}

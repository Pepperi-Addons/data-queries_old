import { AddonModule } from './components/addon/addon.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { MatIconModule } from '@angular/material/icon';
import { createTranslateLoader } from './components/addon';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { PepPageLayoutModule } from '@pepperi-addons/ngx-lib/page-layout';
import { PepSizeDetectorModule } from '@pepperi-addons/ngx-lib/size-detector';
import { PepAddonService, PepFileService } from '@pepperi-addons/ngx-lib';


@NgModule({
    declarations: [
        AppComponent

    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AddonModule,
        AppRoutingModule,
        PepSizeDetectorModule,
        MatIconModule,
        //PepIconModule,
        //PepTopBarModule,
        // PepMenuModule,
        PepPageLayoutModule,
        // PepSideBarModule,
        // PepFieldTitleModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient, PepFileService, PepAddonService]
            }
        })

    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}





import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { AuthGuard, NoAuthGuard } from './guards';
import { ErrorInterceptor, JwtInterceptor } from './interceptors';

import { AppMaterialModule } from '../app-material/app-material.module';
import { CoreRoutingModule } from './core-routing.module';

import { DefaultComponent } from './layouts/default/default.component';
import { MainComponent } from './layouts/main/main.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UserModule } from '../user/user.module';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    BsDropdownModule,
    AppMaterialModule,
    CoreRoutingModule,
    UserModule
  ],
  declarations: [
    DefaultComponent,
    MainComponent,
    SidebarComponent,
    FooterComponent,
    HeaderComponent,
  ],
  exports: [],
  providers: [AuthGuard, NoAuthGuard],
})
export class CoreModule { }

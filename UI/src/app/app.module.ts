import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AppMaterialModule } from './app-material/app-material.module';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';

import { ErrorInterceptor, JwtInterceptor } from './core/interceptors';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { UsersListComponent } from './users-list/users-list.component';
import { RegisterComponent } from './register/register.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { WalletComponent } from './wallet/wallet.component';
import { CreateOfferComponent } from './create-offer/create-offer.component';
import { ManagePoliciesComponent } from './manage-policies/manage-policies.component';
import { LspComponent } from './user-dashboards/lsp/lsp.component';
import { SellerComponent } from './user-dashboards/seller/seller.component';
import { AdminComponent } from './user-dashboards/admin/admin.component';
import { CreateComponent } from './manage-policies/create/create.component';
import { ListComponent } from './manage-policies/list/list.component';
import { PolicyEstimationComponent } from './policy-estimation/policy-estimation.component';
import { BrokerComponent } from './user-dashboards/broker/broker.component';
import { UserModule } from './user/user.module';
import { InsurerComponent } from './user-dashboards/insurer/insurer.component';
import { MedicalUnderWriterComponent } from './user-dashboards/medical-under-writer/medical-under-writer.component';
import { ViewPolicyComponent } from './manage-policies/view-policy/view-policy.component';
import { MedicalReportsComponent } from './manage-policies/medical-reports/medical-reports.component';
import { TransferDocumentComponent } from './manage-policies/transfer-document/transfer-document.component';
import { ProfileComponent } from './profile/profile.component';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    UserManagementComponent,
    ChangePasswordComponent,
    UsersListComponent,
    RegisterComponent,
    TransactionHistoryComponent,
    WalletComponent,
    CreateOfferComponent,
    ManagePoliciesComponent,
    LspComponent,
    SellerComponent,
    AdminComponent,
    CreateComponent,
    ListComponent,
    PolicyEstimationComponent,
    BrokerComponent,
    InsurerComponent,
    MedicalUnderWriterComponent,
    ViewPolicyComponent,
    MedicalReportsComponent,
    TransferDocumentComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    AppMaterialModule,
    AppRoutingModule,
    SharedModule,
    UserModule,
    NgxSpinnerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }

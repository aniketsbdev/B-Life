import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, NoAuthGuard } from './guards';

import { DefaultComponent } from './layouts/default/default.component';
import { MainComponent } from './layouts/main/main.component';

import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { TransactionHistoryComponent } from '../transaction-history/transaction-history.component';
import { WalletComponent } from '../wallet/wallet.component';
import { CreateOfferComponent } from '../create-offer/create-offer.component';
import { ManagePoliciesComponent } from '../manage-policies/manage-policies.component';
import { CreateComponent } from '../manage-policies/create/create.component';
import { UserAddEditComponent } from '../user/user-add-edit/user-add-edit.component';
import { UserListComponent } from '../user/user-list/user-list.component';
import { KycManagementComponent } from '../user/kyc-management/kyc-management.component';
import { CompanyManagementComponent } from '../user/company-management/company-management.component';
import { PolicyEstimationComponent } from '../policy-estimation/policy-estimation.component';
import { AddEditCompanyComponent } from '../user/add-edit-company/add-edit-company.component';
import { ProfileComponent } from '../profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    canActivate: [NoAuthGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'prefix' },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
    ],
  },
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'createUser',
        component: UserAddEditComponent,
      },
      {
        path: 'editUser/:id',
        component: UserAddEditComponent,
      },
      {
        path: 'createCompany',
        component: AddEditCompanyComponent,
      },
      {
        path: 'editCompany/:id',
        component: AddEditCompanyComponent,
      },
      {
        path: 'company-management',
        component: CompanyManagementComponent,
      },
      {

        path: 'estimate-policy',
        component: PolicyEstimationComponent,
      },
      {
        path: 'policies',
        children: [
          {
            path: '',
            redirectTo: '/dashboard',
            pathMatch: 'full'
          },
          {
            path: 'create',
            component: CreateComponent
          },
          {
            path: 'edit/:id',
            component: CreateComponent
          }
        ]
      },
      {
        path: 'create-offer',
        component: CreateOfferComponent,
      },
      {
        path: 'wallet',
        component: WalletComponent,
      },
      {
        path: 'transaction-history',
        component: TransactionHistoryComponent,
      },
      {
        path: 'user',
        component: UserListComponent,
      },
      {
        path: 'kyc-management',
        component: KycManagementComponent,
      },
      {
        path: 'profile/:id',
        component: ProfileComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoreRoutingModule { }

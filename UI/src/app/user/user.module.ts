import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAddEditComponent } from './user-add-edit/user-add-edit.component';
import { UserListComponent } from './user-list/user-list.component';
import { KycManagementComponent } from './kyc-management/kyc-management.component';
import { AppMaterialModule } from '../app-material/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyManagementComponent } from './company-management/company-management.component';
import { AddEditCompanyComponent } from './add-edit-company/add-edit-company.component';



@NgModule({
  declarations: [
    UserAddEditComponent,
    UserListComponent,
    KycManagementComponent,
    CompanyManagementComponent,
    AddEditCompanyComponent
  ],
  imports: [
    CommonModule,
    AppMaterialModule,
    SharedModule,
    ReactiveFormsModule
  ],
  exports: [
    UserListComponent
  ]
})
export class UserModule { }

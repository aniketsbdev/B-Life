import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../app-material/app-material.module';
import { ExtendedFormControlComponent } from './components/extended-form-control/extended-form-control.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { CompareValidatorDirective } from './directives/compare-validator.directive';
import { ProgressComponent } from './components/progress/progress.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { PageHeadingComponent } from './components/page-heading/page-heading.component';
import { NoDataFoundComponent } from "./components/no-data-found/no-data-found.component";
import { SearchComponent } from "./components/search/search.component";
import { FormErrorMessageComponent } from "./components/form-error-message/form-error-message.component";

@NgModule({
  declarations: [
    ExtendedFormControlComponent,
    BreadcrumbComponent,
    CompareValidatorDirective,
    ProgressComponent,
    AlertsComponent,
    ConfirmDialogComponent,
    PaginatorComponent,
    PageHeadingComponent,
    NoDataFoundComponent,
    SearchComponent,
    FormErrorMessageComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, AppMaterialModule],
  exports: [
    ExtendedFormControlComponent,
    BreadcrumbComponent,
    CompareValidatorDirective,
    ProgressComponent,
    AlertsComponent,
    PaginatorComponent,
    PageHeadingComponent,
    NoDataFoundComponent,
    SearchComponent,
    FormErrorMessageComponent
  ],
})
export class SharedModule {}

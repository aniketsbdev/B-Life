import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { NoWhitespaceValidator } from 'src/app/core/validators/no-whitespace.validator';
import { CompareValidator } from 'src/app/shared/directives/compare-validator.directive';

@Component({
  selector: 'app-add-edit-company',
  templateUrl: './add-edit-company.component.html',
  styleUrls: ['./add-edit-company.component.css']
})
export class AddEditCompanyComponent implements OnInit {

  form: FormGroup;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  errorDefs = {};
  isRequestPending = false;
  buttonType = 'Add';
  heading: string = 'Add Organisation';
  id: string = '';
  details = null;
  refreshCompanies = false;
  selectedCompanyType: string = '';
  userTypes = null;
  companyTypes = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private validationService: ValidationService,
    public router: Router,
    private commonService: CommonService,
    private currentRoute: ActivatedRoute,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.userTypes = this.commonService.getCompanyTypes();
    const allowedAccountTypes = [1, 2, 3];
    Object.keys(this.userTypes).forEach(typeKey => {
      // console.log(typeof typeKey, 'type key checked');
      if (allowedAccountTypes.includes(parseInt(typeKey))) {
        this.companyTypes.push({ id: typeKey, name: this.userTypes[typeKey] })
      }
    });
    this.errorDefs = this.validationService.getValidationMessagesByKey('company');
    this.currentRoute.paramMap.subscribe(route => {
      if (route['params']['id']) {
        this.heading = "Edit Organisation";
        this.buttonType = 'Edit';
        this.id = route['params'].id;
        this.getCompany();
      }
    });
    this.createForm();
  }

  getCompany() {
    this.spinner.show();
    this.apiService.getCompanyById(this.id).subscribe(
      (res: any) => {
        console.log(res, 'response');
        this.details = res.data;
        this.updateForm();
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        this.commonService.showAlertMessage("error", error);
      }
    );
  }

  createForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, NoWhitespaceValidator()]],
      licenseNumber: ['', [Validators.required, NoWhitespaceValidator()]],
      companyType: [null, [Validators.required, NoWhitespaceValidator()]],
      contactNumber: ['', [NoWhitespaceValidator()]],
      // name: [''],
      // licenseNumber: [''],
      // companyType: [null],
      // contactNumber: [''],
      address1: ['', [NoWhitespaceValidator()]],
      address2: ['', [NoWhitespaceValidator()]],
      city: ['', [NoWhitespaceValidator()]],
      county: ['', [NoWhitespaceValidator()]],
      zipCode: ['', [NoWhitespaceValidator()]],
      state: ['', [NoWhitespaceValidator()]],
      country: ['', [NoWhitespaceValidator()]]
    });
  }

  updateForm() {
    const formValues = {
      // insurerId: parseInt(this.details.insurerId),
      name: this.details.name,
      licenseNumber: this.details.licenseNumber,
      companyType: this.details.companyType,
      // userType: this.details.userType,
      // lspOrgId: this.details.lspOrgId,
      // licenseNumber: this.details.licenseNumber,
      // organisationName: this.details.organisationName,
      contactNumber: this.details.contactNumber,
      address1: this.details.address1,
      address2: this.details.address2,
      city: this.details.city,
      county: this.details.county,
      zipCode: this.details.zipCode,
      state: this.details.state,
      country: this.details.country,
    };

    this.companyTypeChanged(this.details.companyType);
    this.patchFormValues(formValues);
  }

  patchFormValues(object) {
    this.form.patchValue(object);
  }

  addUpdateCompany() {
    this.errorMessage = '';
    this.successMessage = '';
    this.submitted = true;
    this.refreshCompanies = false;

    this.validationService.removeServerErrors(this.form);

    if (this.form.invalid) {
      return false;
    }

    this.isRequestPending = true;
    // console.log('form', this.form);
    console.log(this.form.value);

    const formData = this.form.value;
    const postData = formData;
    delete postData.confirmPassword;

    this.spinner.show();
    this.apiService.addUpdateCompany(postData, this.id).subscribe(
      (resp: any) => {
        this.successMessage = 'Record created successfuly';
        if (formData.id) {
          this.successMessage = 'Record updated successfuly';
        }
        this.refreshCompanies = true;
        this.isRequestPending = false;
        this.spinner.hide();
        this.routeToList();
      },
      (error) => {
        // add the validation messages to form errors if any
        if (error.errors && Object.keys(error.errors).length > 0) {
          this.validationService.addValidationMessages(this.form, error.errors, this.errorDefs);
        } else {
          this.errorMessage = error.message;
        }
        this.isRequestPending = false;
        this.spinner.hide();
      }
    );

  }

  routeToList() {
    this.router.navigate(['/company-management']);
  }

  companyTypeChanged(value) {
    this.selectedCompanyType = value;
    if (this.selectedCompanyType === 'Medical Underwriter') {
      // this.form.addControl('ssn', new FormControl('', Validators.required));
      // this.form.addControl('ssn', {r()]])
    } else {
      // this.form.removeControl('ssn');
    }
  }

}

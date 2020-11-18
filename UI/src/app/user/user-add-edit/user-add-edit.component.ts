import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NoWhitespaceValidator } from '../../core/validators/no-whitespace.validator';
import { CompareValidator } from '../../shared/directives/compare-validator.directive';
import { ApiService } from '../../core/services/api.service';
import { ValidationService } from '../../core/services/validation.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-user-add-edit',
  templateUrl: './user-add-edit.component.html',
  styleUrls: ['./user-add-edit.component.css']
})
export class UserAddEditComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  errorDefs = {};
  isRequestPending = false;
  buttonType = 'Add';
  heading: string = 'Add';
  id: string = '';
  details = null;
  refreshUsers = false;

  dobRequired: Boolean = false;

  userTypes = null;
  accountTypes = [];
  availableCompanies: any[] = [];
  listOfCompanies = {
    lspCompanies: [],
    insurerCompanies: [],
    muwCmpanies: [],
    brokerCompanies: []
  };
  todayDate = new Date();
  selectedUser: string = '';
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private validationService: ValidationService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService,
    public router: Router,
    public currentRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.userTypes = this.commonService.getUserTypes();
    const allowedAccountTypes = [1, 2, 3, 4, 5, 6];

    this.prepareCompanies();
    Object.keys(this.userTypes).forEach(typeKey => {
      // console.log(typeof typeKey, 'type key checked');
      if (allowedAccountTypes.includes(parseInt(typeKey))) {
        this.accountTypes.push({ id: typeKey, name: this.userTypes[typeKey] })
      }
    });
    this.errorDefs = this.validationService.getValidationMessagesByKey('user');
    this.currentRoute.paramMap.subscribe(route => {
      if (route['params']['id']) {

        console.log(route['params']['id']);
        this.heading = "Edit User";
        this.buttonType = "Edit";
        this.id = route['params'].id;
        this.getUser();
      }
    });

    this.createForm();
  }

  getUser() {
    this.spinner.show();
    this.apiService.getUserById(this.id).subscribe(
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

  updateForm() {
    const formValues = {
      // insurerId: parseInt(this.details.insurerId),
      firstName: this.details.firstName,
      lastName: this.details.lastName,
      email: this.details.email,
      dateOfBirth: this.details.dateOfBirth,
      userType: this.details.userType,
      lspOrgId: this.details.lspOrgId,
      licenseNumber: this.details.licenseNumber,
      company: this.details.company,
      contactNumber: this.details.contactNumber,
      address1: this.details.address1,
      address2: this.details.address2,
      city: this.details.city,
      county: this.details.county,
      zipCode: this.details.zipCode,
      state: this.details.state,
      country: this.details.country,
    };

    this.userTypeChanged(this.details.userType);
    this.patchFormValues(formValues);
  }

  patchFormValues(object) {
    this.form.patchValue(object);
  }

  createForm() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, NoWhitespaceValidator()]],
      lastName: ['', [Validators.required, NoWhitespaceValidator()]],
      email: [
        '',
        [
          Validators.required,
          NoWhitespaceValidator(),
          Validators.pattern(
            "[a-zA-Z0-9._!#$%^&*()'-]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}"
          ),
        ],
      ],
      dateOfBirth: [null],
      password: [
        '',
        [
          Validators.required,
          NoWhitespaceValidator(),
          Validators.pattern(
            '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}'
          ),
        ],
      ],
      confirmPassword: [
        '',
        [
          Validators.required,
          NoWhitespaceValidator(),
          CompareValidator('password'),
        ],
      ],
      userType: [null, [Validators.required]],
      lspOrgId: ['', [NoWhitespaceValidator()]],
      licenseNumber: ['', [NoWhitespaceValidator()]],
      company: [null, [NoWhitespaceValidator()]],
      contactNumber: ['', [NoWhitespaceValidator()]],
      address1: ['', [NoWhitespaceValidator()]],
      address2: ['', [NoWhitespaceValidator()]],
      city: ['', [NoWhitespaceValidator()]],
      county: ['', [NoWhitespaceValidator()]],
      zipCode: ['', [NoWhitespaceValidator()]],
      state: ['', [NoWhitespaceValidator()]],
      country: ['', [NoWhitespaceValidator()]]
    });
  }

  addUpdateUser() {
    this.errorMessage = '';
    this.successMessage = '';
    this.submitted = true;
    this.refreshUsers = false;

    if (this.form.invalid) {
      return false;
    }

    this.isRequestPending = true;
    // console.log('form', this.form);
    console.log(this.form.value);

    const formData = this.form.value;
    const postData = formData;
    delete postData.confirmPassword;

    this.apiService.addUpdateUser(postData, this.id).subscribe(
      (resp: any) => {
        this.successMessage = 'Record created successfuly';
        if (formData.id) {
          this.successMessage = 'Record updated successfuly';
        }
        this.refreshUsers = true;
        this.isRequestPending = false;
        this.routeToList();
      },
      (error) => {
        this.errorMessage = 'Something went wrong';
        this.isRequestPending = false;
      }
    );

  }

  editUser(user) {
    // console.log(user, 'user');
    this.errorMessage = '';
    this.successMessage = '';
    const userDetails = { ...user, confirmPassword: user.password };
    this.form.patchValue(userDetails);
    this.heading = 'Edit';
    this.buttonType = 'Update';

    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  userTypeChanged(value) {
    this.availableCompanies = [];
    this.selectedUser = value;

    const dateOfBirth = this.form.get('dateOfBirth');
    const companyType = this.form.get('company');

    if (this.selectedUser == '1') {
      dateOfBirth.setValidators([Validators.required, NoWhitespaceValidator()]);
      companyType.setValidators([NoWhitespaceValidator()]);
      this.dobRequired = true;
    }
    if (this.selectedUser == '4') {
      this.availableCompanies = this.listOfCompanies.muwCmpanies;
      dateOfBirth.setValidators(null);
      companyType.setValidators([Validators.required, NoWhitespaceValidator()]);
      this.dobRequired = false;
    }
    if (this.selectedUser == '3') {
      this.availableCompanies = this.listOfCompanies.insurerCompanies;
      dateOfBirth.setValidators(null);
      companyType.setValidators([Validators.required, NoWhitespaceValidator()]);
      this.dobRequired = false;
    }
    if (this.selectedUser == '2') {
      this.availableCompanies = this.listOfCompanies.lspCompanies;
      dateOfBirth.setValidators(null);
      companyType.setValidators([Validators.required, NoWhitespaceValidator()]);
      this.dobRequired = false;
    }
    if (this.selectedUser == '5' || this.selectedUser == '6') {
      dateOfBirth.setValidators([Validators.required, NoWhitespaceValidator()]);
      companyType.setValidators([NoWhitespaceValidator()]);
      this.dobRequired = true;
    }

    dateOfBirth.updateValueAndValidity();

    if (this.selectedUser === 'Medical Underwriter') {
      this.form.addControl('ssn', new FormControl('', Validators.required));
      // this.form.addControl('ssn', {r()]])
    } else {
      this.form.removeControl('ssn');
    }
  }

  prepareCompanies() {
    this.apiService.getCompanies().subscribe((res: any) => {
      res.data.forEach(company => {
        if (company.companyType == 3) {
          this.listOfCompanies.muwCmpanies.push(company);
        }
        if (company.companyType == 1) {
          this.listOfCompanies.insurerCompanies.push(company);
        }
        if (company.companyType == 2) {
          this.listOfCompanies.lspCompanies.push(company);
        }
      });
    });
  }

  routeToList() {
    this.router.navigateByUrl('/dashboard');
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgxSpinnerService } from 'ngx-spinner';

import { NoWhitespaceValidator } from '../core/validators/no-whitespace.validator';
import { ApiService } from '../core/services/api.service';
import { CommonService } from '../core/services/common.service';
import { ValidationService } from '../core/services/validation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  errorMessage: string;
  errorDefs = {};
  isRequestPending = false;

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private validationService: ValidationService,
    private fb: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.errorDefs = this.validationService.getValidationMessagesByKey('login');

    this.form = this.fb.group({
      username: ['', [Validators.required, NoWhitespaceValidator()]],
      password: ['', [Validators.required, NoWhitespaceValidator()]],
      // remember: [false],
    });
  }

  login() {
    // console.log(this.form, 'form');

    this.errorMessage = '';
    this.submitted = true;

    if (this.form.valid && this.isRequestPending === false) {
      this.spinner.show();
      this.isRequestPending = true;

      const formValues = this.form.value;
      const formData = {
        email: formValues.username,
        password: formValues.password
      };

      this.apiService.login(formData).subscribe(
        (resp: any) => {
          if (resp) {
            // console.log('user details', resp);
            const userTypes = this.commonService.getUserTypes();
            const responseData = {
              ...resp.data,
              fullName: resp.data?.firstName + ' ' + resp.data?.lastName,
              userTypeName: userTypes[resp.data.userType]
            };
            this.commonService.setUserDetails(responseData);
            this.commonService.showAlertMessage("success", resp.message);
            this.router.navigate(['/dashboard']);
          }
          this.isRequestPending = false;
          this.spinner.hide();
        },
        (error) => {
          this.isRequestPending = false;
          // add the validation messages to form errors if any
          if (error.errors && Object.keys(error.errors).length > 0) {
            this.validationService.addValidationMessages(this.form, error.errors, this.errorDefs);
          } else {
            this.errorMessage = error.message;
          }
          this.spinner.hide();
        }
      );
    }
  }

  register() {
    this.router.navigate(['register']);
  }
}

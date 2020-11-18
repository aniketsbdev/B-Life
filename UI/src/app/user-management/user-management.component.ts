import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { NoWhitespaceValidator } from '../core/validators/no-whitespace.validator';
import { CompareValidator } from '../shared/directives/compare-validator.directive';
import { ApiService } from '../core/services/api.service';
import { ValidationService } from '../core/services/validation.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  errorDefs = {};
  isRequestPending = false;
  buttonType = 'Add';
  mode = 'Add';
  refreshUsers = false;
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private validationService: ValidationService,
    public router: Router
  ) {}

  ngOnInit() {
    this.errorDefs = this.validationService.getValidationMessagesByKey('user');
    // console.log(this.errorDefs, 'error defs');
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      id: [null],
      firstName: ['', [Validators.required, NoWhitespaceValidator()]],
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
      password: [
        '',
        [
          Validators.required,
          NoWhitespaceValidator(),
          Validators.pattern(
            '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{7,}'
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
      role: ['', [Validators.required]],
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
    const formData = this.form.value;
    const postData = {
      firstName: formData.firstName,
      email: formData.email,
      password: formData.password,
      role: +formData.role,
    };

    this.apiService.addUpdateUser(postData, formData.id).subscribe(
      (resp: any) => {
        this.successMessage = 'Record created successfuly';
        if (formData.id) {
          this.successMessage = 'Record updated successfuly';
        }
        this.refreshUsers = true;
        this.isRequestPending = false;
      },
      (error) => {
        this.errorMessage = 'Something went wrong';
        this.isRequestPending = false;
      }
    );

    // if (this.userDetail.valid) {
    //   data.userName =
    //     data.userName.charAt(0).toUpperCase() + data.userName.slice(1);
    //   if (this.editMode) {
    //     let updatePayload = {
    //       Id: this.userInfo.Id,
    //       UserName: data.userName,
    //       EmailId: data.email,
    //       RoleId: data.role,
    //       Password: data.password,
    //     };
    //     this.service.updateUser(updatePayload).subscribe(
    //       (res: any) => {
    //         if (res == 'Record Already Exist in a database') {
    //           this.errorMessage = 'User already exists in database.';
    //           this.failure(this.errorMessage);
    //         } else {
    //           this.buttonType = 'SUBMIT';
    //           this.successMessage = 'Record updated successfuly';
    //           this.success(this.successMessage);
    //           this.editMode = false;
    //         }
    //       },
    //       (error) => {
    //         this.errorMessage = 'Something went wrong';
    //         this.failure(this.errorMessage);
    //         this.editMode = false;
    //       }
    //     );
    //   } else {
    //     let payload = {
    //       UserId: this.userId,
    //       UserName: data.userName,
    //       EmailId: data.email,
    //       RoleId: data.role,
    //       Password: data.password,
    //     };
    //     this.service.addUser(payload).subscribe(
    //       (res: any) => {
    //         if (res == 'Record Already Exist in a database') {
    //           this.errorMessage = 'User already exists in database.';
    //           this.failure(this.errorMessage);
    //         } else {
    //           this.successMessage = 'Record added successfuly';
    //           this.success(this.successMessage);
    //         }
    //       },
    //       (error) => {
    //         this.errorMessage = 'Something went wrong';
    //         this.failure(this.errorMessage);
    //       }
    //     );
    //   }
    // } else {
    //   this.errorMessage = 'Please Fill Mandatory Fields';
    //   this.showErrors = true;
    // }
  }

  editUser(user) {
    // console.log(user, 'user');
    this.errorMessage = '';
    this.successMessage = '';
    const userDetails = { ...user, confirmPassword: user.password };
    this.form.patchValue(userDetails);
    this.mode = 'Edit';
    this.buttonType = 'Update';

    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }
}

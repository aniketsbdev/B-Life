import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgxSpinnerService } from 'ngx-spinner';

import { NoWhitespaceValidator } from '../core/validators/no-whitespace.validator';
import { CompareValidator } from "../shared/directives/compare-validator.directive";
import { ApiService } from '../core/services/api.service';
import { CommonService } from '../core/services/common.service';
import { ValidationService } from '../core/services/validation.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  errorMessage: string;
  errorDefs = {};
  isRequestPending = false;
  userTypes = null;
  accountTypes = [];
  maxDate = new Date();
  kycFile: any;
  allowedExtensions = ['pdf']
  maxFileSize = 5 * 1024 * 1024;

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private validationService: ValidationService,
    private fb: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Setting Max Date for Date Validation
    // const currentYear = new Date().getFullYear();
    this.maxDate = new Date();

    this.userTypes = this.commonService.getUserTypes();
    const allowedAccountTypes = [5, 6];
    Object.keys(this.userTypes).forEach(typeKey => {
      // console.log(typeof typeKey, 'type key checked');
      if (allowedAccountTypes.includes(parseInt(typeKey))) {
        this.accountTypes.push({ id: typeKey, name: this.userTypes[typeKey] })
      }
    });
    this.errorDefs = this.validationService.getValidationMessagesByKey('register');

    this.form = this.fb.group({
      // userType: [null],
      // firstName: [''],
      // lastName: [''],
      // email: [''],
      // dateOfBirth: [null],
      // password: [''],
      // confirmPassword: [""],
      userType: [null, [Validators.required]],
      firstName: ['', [Validators.required, NoWhitespaceValidator()]],
      lastName: ['', [Validators.required, NoWhitespaceValidator()]],
      email: ['', [Validators.required, NoWhitespaceValidator(), Validators.email]],
      dateOfBirth: [null, [Validators.required, NoWhitespaceValidator()]],
      kycDocument: [null, [Validators.required, NoWhitespaceValidator()]],
      password: ['', [
        Validators.required,
        NoWhitespaceValidator(),
        Validators.pattern(
          '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}'
        ),
      ]],
      confirmPassword: [
        "",
        [Validators.required, NoWhitespaceValidator(), CompareValidator('password')],
      ],
    });
  }

  register() {
    this.errorMessage = '';
    this.submitted = true;

    // remove server errors if any
    this.validationService.removeServerErrors(this.form);

    if (this.form.valid && this.isRequestPending === false) {
      this.spinner.show();
      this.isRequestPending = true;

      const formData = this.registrationFormData(this.form.value);

      this.apiService.register(formData).subscribe(
        (resp: any) => {
          this.commonService.showAlertMessage("success", resp.message);
          this.router.navigate(['login']);
          this.isRequestPending = false;
          this.spinner.hide();
        },
        (error) => {

          this.isRequestPending = false;
          this.spinner.hide();

          // add the validation messages to form errors if any
          if (error.errors && Object.keys(error.errors).length > 0) {
            this.validationService.addValidationMessages(this.form, error.errors, this.errorDefs);
          } else {
            this.errorMessage = error.message;
          }
        }
      );
    }
  }

  onFileChange(event) {
    let reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.form.patchValue({
          kycFile: reader.result
        });

        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }

  kycFileUpload(files) {
    this.kycFile = files[0];
    const extension = this.kycFile.name.split(".").pop();
    if (this.allowedExtensions.indexOf(extension) === -1) {
      this.form.get("kycDocument").setErrors({ extension: true });
      this.errorDefs['kycDocument']['extension'] = `Only ${this.allowedExtensions.join()} extension(s) are allowed`
      return true;
    }

    const fileSize = this.kycFile.size;

    if (fileSize > this.maxFileSize) {
      this.form.get("kycDocument").setErrors({ fileSize: true });
      this.errorDefs['kycDocument']['fileSize'] = `Max allowed file size is 5 MB`
      return true;
    }
  }

  registrationFormData(data) {
    const formData = new FormData();
    formData.append("userType", data.userType);
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("dateOfBirth", data.dateOfBirth);
    formData.append("password", data.password);
    if (this.kycFile && this.kycFile.name) {
      formData.append("kycDocument", this.kycFile);
    }

    return formData;
  }

  login() {
    this.router.navigate(['login']);
  }

}

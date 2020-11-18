import { Component, OnInit } from "@angular/core";
import { FormGroup, FormArray, FormBuilder, Validators } from "@angular/forms";

import { NgxSpinnerService } from "ngx-spinner";

import { ApiService } from "../../core/services/api.service";
import { ValidationService } from "../../core/services/validation.service";
import { NoWhitespaceValidator } from "../../core/validators/no-whitespace.validator";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "../../core/services/common.service";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  submitted = false;
  form: FormGroup;
  errorMessage = "";
  errorDefs = {};
  details = null;
  id = '';
  heading = "Add Policy";
  isLoading = false;
  companies = [];
  muwCompanies = [];
  maxDate = new Date();
  policyFile: any;
  ownerKycDocument: any;
  allowedExtensions = ['pdf']
  maxFileSize = 5 * 1024 * 1024;

  policyOwner = [
    { value: true, name: 'Self' },
    { value: false, name: 'Other' },
  ]
  userType = 6;
  isPolicyOwner = true;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private validationService: ValidationService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    const user = this.commonService.getUserDetails();

    this.userType = user.userType;

    console.log('I am inside create update policy');
    this.errorDefs = this.validationService.getValidationMessagesByKey(
      "policies"
    );

    this.apiService.getCompanies({ companyType: 1 }).subscribe((res: any) => {
      this.companies = res.data;
    });
    this.apiService.getCompanies({ companyType: 3 }).subscribe((res: any) => {
      this.muwCompanies = res.data;
    });

    this.form = this.fb.group({
      // company: [0],
      // medicalUnderWriterCompany: [0],
      // policyNumber: [''],
      // faceValue: [''],
      // annualPremium: [''],
      // cashSurrenderValue: [''],
      // policyStartDate: [''],
      // deathBenefit: [''],
      // beneficiary: [''],
      // policyDocument: [''],
      company: ['', [Validators.required]],
      medicalUnderWriterCompany: ['', [Validators.required]],
      policyNumber: ['', [Validators.required, NoWhitespaceValidator()]],
      faceValue: ['', [Validators.required, NoWhitespaceValidator()]],
      annualPremium: ['', [Validators.required, NoWhitespaceValidator()]],
      cashSurrenderValue: ['', [Validators.required, NoWhitespaceValidator()]],
      policyStartDate: ['', [Validators.required]],
      deathBenefit: ['', [Validators.required, NoWhitespaceValidator()]],
      beneficiary: ['', [NoWhitespaceValidator()]],
      policyDocument: ['', [Validators.required]],
      isPolicyOwner: [true],
      policyOwnerName: [''],
      policyOwnerDob: [''],
      policyOwnerEmail: [''],
      ownerKycDocument: ['']
    });

    this.route.params.subscribe((params: any) => {
      if (params.id) {
        this.heading = "Edit Policy";
        this.id = params.id;
        this.getPolicy();
        this.form.get('policyDocument').setValidators(null);
      }
    });
  }

  policyFileUpload(files) {
    this.policyFile = files[0];
    const extension = this.policyFile.name.split(".").pop();
    if (this.allowedExtensions.indexOf(extension) === -1) {
      this.form.get("policyDocument").setErrors({ extension: true });
      this.errorDefs['policyDocument']['extension'] = `Only ${this.allowedExtensions.join()} extension(s) are allowed`
      return true;
    }

    const fileSize = this.policyFile.size;

    if (fileSize > this.maxFileSize) {
      this.form.get("policyDocument").setErrors({ fileSize: true });
      this.errorDefs['policyDocument']['fileSize'] = `Max allowed file size is 5 MB`
      return true;
    }
  }

  kycFileUpload(files) {
    this.ownerKycDocument = files[0];
    const extension = this.ownerKycDocument.name.split(".").pop();
    if (this.allowedExtensions.indexOf(extension) === -1) {
      this.form.get("ownerKycDocument").setErrors({ extension: true });
      this.errorDefs['ownerKycDocument']['extension'] = `Only ${this.allowedExtensions.join()} extension(s) are allowed`
      return true;
    }

    const fileSize = this.ownerKycDocument.size;

    if (fileSize > this.maxFileSize) {
      this.form.get("ownerKycDocument").setErrors({ fileSize: true });
      this.errorDefs['ownerKycDocument']['fileSize'] = `Max allowed file size is 5 MB`
      return true;
    }
  }

  onPolicyOwnerChange() {
    const isPolicyOwner = this.form.get('isPolicyOwner').value;
    const policyOwnerName = this.form.get('policyOwnerName');
    const policyOwnerDob = this.form.get('policyOwnerDob');
    const policyOwnerEmail = this.form.get('policyOwnerEmail');
    const ownerKycDocument = this.form.get('ownerKycDocument');
    

    if (isPolicyOwner) {
      policyOwnerName.setValidators(null);
      policyOwnerDob.setValidators(null);
      policyOwnerEmail.setValidators(null);
      ownerKycDocument.setValidators(null);
    } else {
      policyOwnerName.setValidators([Validators.required, NoWhitespaceValidator()]);
      policyOwnerDob.setValidators([Validators.required]);
      policyOwnerEmail.setValidators([Validators.required, NoWhitespaceValidator(), Validators.email]);
      ownerKycDocument.setValidators([Validators.required]);
    }

    policyOwnerName.updateValueAndValidity();
    policyOwnerDob.updateValueAndValidity();
    policyOwnerEmail.updateValueAndValidity();
    ownerKycDocument.updateValueAndValidity();

    this.isPolicyOwner = isPolicyOwner;
  }

  // Fetch policy details and fill form controls
  getPolicy() {
    this.spinner.show();
    this.apiService.getPolicyById(this.id).subscribe(
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
      company: this.details.company,
      medicalUnderWriterCompany: this.details.medicalUnderWriterCompany,
      policyNumber: this.details.policyNumber,
      faceValue: this.details.faceValue,
      annualPremium: this.details.annualPremium,
      cashSurrenderValue: this.details.cashSurrenderValue,
      policyStartDate: this.details.policyStartDate,
      deathBenefit: this.details.deathBenefit,
      beneficiary: this.details.beneficiary,
      isPolicyOwner: this.details.isPolicyOwner,
      policyOwnerName: this.details.policyOwnerName,
      policyOwnerDob: this.details.policyOwnerDob,
      policyOwnerEmail: this.details.policyOwnerEmail
    };

    this.patchFormValues(formValues);

    this.onPolicyOwnerChange();
  }

  patchFormValues(object) {
    this.form.patchValue(object);
  }

  submit() {
    this.errorMessage = "";
    this.submitted = true;

    console.log(this.form, 'form ....');

    // remove server errors if any
    this.validationService.removeServerErrors(this.form);

    if (this.form.invalid) {
      return false;
    }

    this.spinner.show();

    const formData = this.policyFormData(this.form.value);
    this.apiService
      .createUpdatePolicy(this.id, formData)
      .subscribe(
        (res) => {
          this.formSuccess();
        },
        (error) => {
          this.formErrors(error);
        }
      );
  }

  policyFormData(data) {
    const formData = new FormData();
    formData.append("company", data.company);
    formData.append("medicalUnderWriterCompany", data.medicalUnderWriterCompany);
    formData.append("policyNumber", data.policyNumber);
    formData.append("faceValue", data.faceValue);
    formData.append("annualPremium", data.annualPremium);
    formData.append("cashSurrenderValue", data.cashSurrenderValue);
    formData.append("policyStartDate", data.policyStartDate);
    formData.append("deathBenefit", data.deathBenefit);
    formData.append("beneficiary", data.beneficiary);
    formData.append("isPolicyOwner", data.isPolicyOwner);
    formData.append("policyOwnerName", data.policyOwnerName);
    formData.append("policyOwnerDob", data.policyOwnerDob);
    formData.append("policyOwnerEmail", data.policyOwnerEmail);
    if (this.policyFile && this.policyFile.name) {
      formData.append("policyDocument", this.policyFile);
    }
    if (this.ownerKycDocument && this.ownerKycDocument.name) {
      formData.append("ownerKycDocument", this.ownerKycDocument);
    }

    return formData;
  }

  formSuccess() {
    this.spinner.hide();
    let flashMessage = "Policy added successfully.";

    if (this.id) {
      flashMessage = "Policy updated successfully.";
    }

    this.commonService.showAlertMessage("success", flashMessage);
    this.router.navigate(['policies']);
  }

  formErrors(error) {
    this.spinner.hide();

    // add the validation messages to form errors if any
    if (error.errors && Object.keys(error.errors).length > 0) {
      this.validationService.addValidationMessages(this.form, error.errors, this.errorDefs);
      console.log(this.form, this.errorDefs, 'error found');
    } else {
      this.errorMessage = error.message;
    }
  }
}

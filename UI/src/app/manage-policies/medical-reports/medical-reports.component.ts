import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ValidationService } from "../../core/services/validation.service";
import { NoWhitespaceValidator } from "../../core/validators/no-whitespace.validator";

@Component({
  selector: 'app-medical-reports',
  templateUrl: './medical-reports.component.html',
  styleUrls: ['./medical-reports.component.css']
})
export class MedicalReportsComponent implements OnInit {
  
  submitted = false;
  form: FormGroup;
  errorMessage = "";
  errorDefs = {};
  policyFile: any;
  allowedExtensions = ['pdf']
  maxFileSize = 5 * 1024 * 1024;

  constructor(
    public dialogRef: MatDialogRef<MedicalReportsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private apiService: ApiService,
    private validationService: ValidationService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.errorDefs = this.validationService.getValidationMessagesByKey(
      "policies"
    );
    this.form = this.fb.group({
      lifeExpectancy: ['', [Validators.required, NoWhitespaceValidator()]],
      medicalDocument: ['', [Validators.required]],
    });
  }

  policyFileUpload(files) {
    this.policyFile = files[0];
    const extension = this.policyFile.name.split(".").pop();
    if (this.allowedExtensions.indexOf(extension) === -1) {
      this.form.get("medicalDocument").setErrors({ extension: true });
      this.errorDefs['medicalDocument']['extension'] = `Only ${this.allowedExtensions.join()} extension(s) are allowed`
      return true;
    }

    const fileSize = this.policyFile.size;

    if (fileSize > this.maxFileSize) {
      this.form.get("medicalDocument").setErrors({ fileSize: true });
      this.errorDefs['medicalDocument']['fileSize'] = `Max allowed file size is 5 MB`
      return true;
    }
  }

  submit() {
    this.errorMessage = "";
    this.submitted = true;

    // remove server errors if any
    this.validationService.removeServerErrors(this.form);

    if (this.form.invalid) {
      return false;
    }

    this.spinner.show();

    const formData = this.policyFormData(this.form.value);
    this.apiService
      .updatePolicyMedicalReports(this.data.id, formData)
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
    formData.append("lifeExpectancy", data.lifeExpectancy);
    if (this.policyFile && this.policyFile.name) {
      formData.append("medicalDocument", this.policyFile);
    }

    return formData;
  }

  formSuccess() {
    this.spinner.hide();
    let flashMessage = "Policy medical document added successfully.";

    this.commonService.showAlertMessage("success", flashMessage);
    this.dialogRef.close();
  }

  formErrors(error) {
    this.spinner.hide();

    // add the validation messages to form errors if any
    if (error.errors && Object.keys(error.errors).length > 0) {
      this.validationService.addValidationMessages(this.form, error.errors, this.errorDefs);
      // console.log(this.form, this.errorDefs, 'error found');
    } else {
      this.errorMessage = error.message;
    }
  }
}

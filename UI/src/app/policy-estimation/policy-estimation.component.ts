import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

import { NgxSpinnerService } from "ngx-spinner";

import { ApiService } from "../core/services/api.service";
import { ValidationService } from "../core/services/validation.service";
import { NoWhitespaceValidator } from "../core/validators/no-whitespace.validator";
import { CommonService } from "../core/services/common.service";

@Component({
  selector: 'app-policy-estimation',
  templateUrl: './policy-estimation.component.html',
  styleUrls: ['./policy-estimation.component.css']
})
export class PolicyEstimationComponent implements OnInit {
  submitted = false;
  form: FormGroup;
  errorMessage = "";
  errorDefs = {};
  heading = "Check Eligibility & Estimate Policy";

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private serverValidationService: ValidationService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.errorDefs = this.serverValidationService.getValidationMessagesByKey(
      "estimate_policy"
    );

    this.form = this.fb.group({
      age: [null, [Validators.required, Validators.min(0)]],
      faceValue: [null, [Validators.required, Validators.min(0)]],
      lifeExpectancy: [null, [Validators.required, Validators.min(0)]],
      policyPayout: [null, [Validators.required, Validators.min(0)]],
      annualPremium: [null, [Validators.required, Validators.min(0)]]
    });
  }

  checkEligibility() {
    this.errorMessage = "";
    this.submitted = true;

    console.log(this.form, 'form .... eligibility');
    if (this.form.invalid) {
      return false;
    }

    this.spinner.show();

    const formData = this.form.value;
    this.apiService
      .checkEligibility(formData)
      .subscribe(
        (res) => {
          this.commonService.simpleDialogMessage(res.message);
          this.spinner.hide();
        },
        (error) => {
          console.log(error);
          this.commonService.simpleDialogMessage(error.message);
          this.spinner.hide();
        }
      );
  }

  estimatePolicy() {
    this.errorMessage = "";
    this.submitted = true;

    console.log(this.form, 'form .... estimate');
    if (this.form.invalid) {
      return false;
    }

    this.spinner.show();

    const formData = this.form.value;
    this.apiService
      .policyEstimation(formData)
      .subscribe(
        (res) => {
          this.commonService.simpleDialogMessage(res.message);
          this.spinner.hide();
        },
        (error) => {
          console.log(error);
          this.commonService.simpleDialogMessage(error.message);
          this.spinner.hide();
        }
      );
  }

  formErrors(error) {
    this.errorMessage = error;;
    this.spinner.hide();
  }
}

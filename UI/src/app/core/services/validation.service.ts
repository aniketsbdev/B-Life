import { Injectable } from '@angular/core';

import { FormArray, FormControl, FormGroup } from "@angular/forms";

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  // Types of error messages based on form and its controls
  validationMessages = {
    login: {
      username: {
        required: 'Email Id is required',
        whitespace: 'Only whitespace is not allowed',
        email: 'Not a valid Email Id'
      },
      password: {
        required: 'Password is required',
        whitespace: 'Only whitespace is not allowed',
      },
    },
    register: {
      userType: {
        required: 'Please select your account type',
      },
      firstName: {
        required: 'First Name is required',
        whitespace: 'Only whitespace is not allowed',
      },
      lastName: {
        required: 'Last Name is required',
        whitespace: 'Only whitespace is not allowed',
      },
      email: {
        required: 'Email is required',
        whitespace: 'Only whitespace is not allowed',
        email: 'Not a valid Email Id',
      },
      dateOfBirth: {
        required: 'Please choose your date of birth',
        whitespace: 'Only whitespace is not allowed',
      },
      kycDocument: {
        required: "Document is required",
      },
      password: {
        required: 'Password is required',
        whitespace: 'Only whitespace is not allowed',
        pattern:
          'Enter atleast 8 characters with one upper case character, one lower case character, one special character and one number',
      },
      confirmPassword: {
        required: 'Confirm Password is required',
        whitespace: 'Only whitespace is not allowed',
        compare: "Confirm Password do not match",
      }
    },
    user: {
      name: {
        required: 'Username is required',
        whitespace: 'Only whitespace is not allowed',
      },
      firstName: {
        required: 'First Name is required',
        whitespace: 'Only whitespace is not allowed',
      },
      lastName: {
        required: 'Last Name is required',
        whitespace: 'Only whitespace is not allowed',
      },
      email: {
        required: 'Email is required',
        whitespace: 'Only whitespace is not allowed',
        pattern: 'Not a valid Email Id',
      },
      dateOfBirth: {
        required: 'Please choose your date of birth',
        whitespace: 'Only whitespace is not allowed',
      },
      password: {
        required: 'Password is required',
        whitespace: 'Only whitespace is not allowed',
        pattern:
          'Please enter atleast 8 characters with combination of one upper case character, one lower case character, one special character and one number',
      },
      confirmPassword: {
        required: 'Confirm Password is required',
        whitespace: 'Only whitespace is not allowed',
        compare: 'Password & Confirm Password do not match',
      },
      userType: {
        required: 'Select a User Type',
      },
      lspOrgId: {
        required: 'Required Field',
        whitespace: 'Only whitespace is not allowed'
      },
      licenseNumber: {
        required: 'License Number is required',
        whitespace: 'Only whitespace is not allowed'
      },
      company: {
        required: 'Company is required',
        whitespace: 'Only whitespace is not allowed'
      },
      contactNumber: {
        required: 'Contact Number is required',
        whitespace: 'Only whitespace is not allowed'
      },
      address1: {
        required: 'Address 1 is required',
        whitespace: 'Only whitespace is not allowed'
      },
      address2: {
        required: 'Address 2  is required',
        whitespace: 'Only whitespace is not allowed'
      },
      city: {
        required: 'City is required',
        whitespace: 'Only whitespace is not allowed'
      },
      county: {
        required: 'County is required',
        whitespace: 'Only whitespace is not allowed'
      },
      zipCode: {
        required: 'Zip Code is required',
        whitespace: 'Only whitespace is not allowed'
      },
      state: {
        required: 'State  is required',
        whitespace: 'Only whitespace is not allowed'
      },
      country: {
        required: 'Country is required',
        whitespace: 'Only whitespace is not allowed'
      },
      walletBalance: {
        required: 'Wallet Balance is required',
        whitespace: 'Only whitespace is not allowed'
      },
      ssn: {
        required: 'SSN is Required',
        whitespace: 'Only whitespace is not allowed'
      }
    },
    search: {
      query: {
        required: "Search term is required",
        whitespace: "Only whitespace is not allowed",
      },
    },
    policies: {
      company: {
        required: 'Please select a organisation'
      },
      medicalUnderWriterCompany: {
        required: 'Please select a medical underwriter'
      },
      policyNumber: {
        required: 'Policy Number is required',
        whitespace: 'Only whitespace is not allowed'
      },
      faceValue: {
        required: 'Face Value is required',
        whitespace: 'Only whitespace is not allowed'
      },
      annualPremium: {
        required: 'Annual Premium is required',
        whitespace: 'Only whitespace is not allowed'
      },
      cashSurrenderValue: {
        required: 'Cash Surrender Value is required',
        whitespace: 'Only whitespace is not allowed'
      },
      policyStartDate: {
        required: 'Policy Start Date is required'
      },
      deathBenefit: {
        required: 'Death Benefit is required',
        whitespace: 'Only whitespace is not allowed'
      },
      beneficiary: {
        whitespace: 'Only whitespace is not allowed'
      },
      policyDocument: {
        required: "Policy document is required",
      },
      ownerKycDocument: {
        required: "Owner KYC document is required",
      },
      isPolicyOwner: {
        required: "Document is required",
      },
      policyOwnerName: {
        required: 'Owner Name is required',
        whitespace: 'Only whitespace is not allowed'
      },
      policyOwnerDob: {
        required: 'Owner DOB is required',
        whitespace: 'Only whitespace is not allowed'
      },
      policyOwnerEmail: {
        required: 'Owner Email is required',
        whitespace: 'Only whitespace is not allowed',
        email: "Not a valid email address"
      },
      lifeExpectancy: {
        required: 'Life Expectancy is required',
        whitespace: 'Only whitespace is not allowed',
      },
      medicalDocument: {
        required: "Document is required",
      },
      updatedPolicyDocument: {
        required: "Document is required",
      }
    },
    company: {
      name: {
        required: 'Name is required',
        whitespace: 'Only whitespace is not allowed'
      },
      licenseNumber: {
        required: 'License Number is required',
        whitespace: 'Only whitespace is not allowed'
      },
      companyType: {
        required: 'Organisation Type is required',
        whitespace: 'Only whitespace is not allowed'
      },
      contactNumber: {
        required: 'Contact Number is required',
        whitespace: 'Only whitespace is not allowed'
      },
      address1: {
        required: 'Required: address1',
        whitespace: 'Only whitespace is not allowed'
      },
      address2: {
        required: 'Required: address2',
        whitespace: 'Only whitespace is not allowed'
      },
      city: {
        required: 'Required: city',
        whitespace: 'Only whitespace is not allowed'
      },
      county: {
        required: 'Required: county',
        whitespace: 'Only whitespace is not allowed'
      },
      zipCode: {
        required: 'Required: zipCode',
        whitespace: 'Only whitespace is not allowed'
      },
      state: {
        required: 'Required: state',
        whitespace: 'Only whitespace is not allowed'
      },
      country: {
        required: 'Required: country',
        whitespace: 'Only whitespace is not allowed'
      },
      walletBalance: {
        required: 'Required: walletBalance',
        whitespace: 'Only whitespace is not allowed'
      },
      ssn: {
        required: 'SSN is Required',
        whitespace: 'Only whitespace is not allowed'
      }
    },
    estimate_policy: {
      age: {
        required: 'Policy Number is required',
        min: 'Should be greater than 0'
      },
      faceValue: {
        required: 'Face Value is required',
        min: 'Should be greater than 0'
      },
      annualPremium: {
        required: 'Annual Premium is required',
        min: 'Should be greater than 0'
      },
      lifeExpectancy: {
        required: 'Face Value is required',
        min: 'Should be greater than 0'
      },
      policyPayout: {
        required: 'Annual Premium is required',
        min: 'Should be greater than 0'
      },
    }
    // Keep all the Validations here
  };

  constructor() { }

  // get the error message based on key
  getValidationMessagesByKey(key: string) {
    return this.validationMessages[key];
  }


  // addValidationMessages(form, serverFormErrors, errorDefs) {
  //   Object.keys(serverFormErrors).forEach((key) => {
  //     form.get(key).setErrors({ serverError: true });
  //     errorDefs[key]['serverError'] = serverFormErrors[key];
  //   });
  // }

  // add the validation and message to a form control
  addValidationMessages(group, serverErrors, errorDefs) {
    const serverErrorsKeys = Object.keys(serverErrors);

    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);

      if (abstractControl instanceof FormGroup) {
        this.addValidationMessages(abstractControl, serverErrors, errorDefs);
      } else if (abstractControl instanceof FormArray) {
        // Need to be updated once we have control as form array
        // if (abstractControl.controls.length > 0) {
        //   for (const control of abstractControl.controls) {
        //     if (control instanceof FormGroup) {
        //       this.addValidationMessages(abstractControl, serverErrors, errorDefs);
        //     }

        //     if (control instanceof FormControl) {

        //     }
        //   }
        // }
      } else {
        if (serverErrorsKeys.includes(key)) {
          group.get(key).setErrors({ serverError: true });
          errorDefs[key]['serverError'] = serverErrors[key];
        }
      }
    });
  }

  // remove the server errors from a form for all the form controls
  removeServerErrors(group) {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.removeServerErrors(abstractControl);
      } else if (abstractControl instanceof FormArray) {
        for (const control of abstractControl.controls) {
          if (control instanceof FormGroup) {
            this.removeServerErrors(control);
          } else {
            if (control.errors && control.errors.serverError) {
              control.setErrors(null);
            }
          }
        }
      } else {
        if (abstractControl.errors && abstractControl.errors.serverError) {
          abstractControl.setErrors(null);
        }
      }
    });
  }
}

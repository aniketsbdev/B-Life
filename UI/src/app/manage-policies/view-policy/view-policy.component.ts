import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';

import { saveAs } from 'file-saver';

@Component({
  selector: 'app-view-policy',
  templateUrl: './view-policy.component.html',
  styleUrls: ['./view-policy.component.css']
})
export class ViewPolicyComponent implements OnInit {

  Object = Object;
  viewPolicyData: any[] = [];
  companyDetails: string = null;
  muwCompanyDetails: string = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commonService: CommonService,
    private apiService: ApiService,
    private spinner: NgxSpinnerService
  ) {
  }

  ngOnInit(): void {
    this.spinner.show();
    if (this.data.company) {
      this.apiService.getCompanyById(this.data.company).subscribe(
        (res: any) => {
          console.log(res, 'response');
          this.companyDetails = res.data.name;
          // if (this.muwCompanyDetails) {
          //   this.mapPolicyDetails();
          // }
          this.spinner.hide();
        },
        (error) => {
          this.spinner.hide();
          this.commonService.showAlertMessage("error", error);
        }
      );
    }
    if (this.data.medicalUnderWriterCompany) {
      this.apiService.getCompanyById(this.data.medicalUnderWriterCompany).subscribe(
        (res: any) => {
          console.log(res, 'response');
          this.muwCompanyDetails = res.data.name;
          // if (this.companyDetails) {
          //   this.mapPolicyDetails();
          // }
          this.spinner.hide();
        },
        (error) => {
          this.spinner.hide();
          this.commonService.showAlertMessage("error", error);
        }
      );
    }
  }

  mapPolicyDetails() {
    // Creating Required Values Array
    for (const key of Object.keys(this.data)) {
      if (
        key == '_id' ||
        key == 'id' ||
        key == 'status' ||
        key == 'lspCompany' ||
        // key == 'medicalUnderWriterCompany' ||
        key == 'seller' ||
        key == 'medicalDocument' ||
        key == 'updatedPolicyDocument' ||
        key == 'processedByInsurer' ||
        key == 'processedByUnderwriter' ||
        key == 'verifiedByInsurer' ||
        key == 'verifiedByUnderwriter' ||
        key == 'isPolicyOwner' ||
        key == 'policyDocument' ||
        key == '__v'
      ) {
        // console.log(this.data[key]);
      } else {
        this.viewPolicyData.push({
          key: key,
          name: '',
          value: this.data[key]
        });
      }
    }

    // Providing Names
    this.viewPolicyData = this.viewPolicyData.map(item => {
      if (item.key == 'processedByInsurer') {
        item.name = 'Processed By Insurer'
      }
      if (item.key == 'processedByUnderwriter') {
        item.name = 'Processed By Underwriter'

      }
      if (item.key == 'verifiedByInsurer') {
        item.name = 'Verified By Insurer'

      }
      if (item.key == 'verifiedByUnderwriter') {
        item.name = 'Verified By Underwriter'

      }
      if (item.key == 'company') {
        item.name = 'Insurance Company'
        item.value = this.companyDetails['name'];

      }
      if (item.key == 'medicalUnderWriterCompany') {
        item.name = 'Medical Underwriter Company'
        item.value = this.muwCompanyDetails['name'];

      }
      if (item.key == 'policyNumber') {
        item.name = 'Policy Number'

      }
      if (item.key == 'faceValue') {
        item.name = 'Face Value'

      }
      if (item.key == 'annualPremium') {
        item.name = 'Annual Premium'

      }
      if (item.key == 'cashSurrenderValue') {
        item.name = 'Cash Surrender Value'

      }
      if (item.key == 'policyStartDate') {
        item.name = 'Policy Start Date'

      }
      if (item.key == 'deathBenefit') {
        item.name = 'Death Benefit'

      }
      if (item.key == 'beneficiary') {
        item.name = 'Beneficiary'

      }
      if (item.key == 'seller') {
        item.name = 'Seller'

      }
      if (item.key == 'createdAt') {
        item.name = 'Policy Created On'
        item.value = this.commonService.formatDateUsingMoment(
          item.value,
          "MM/DD/YYYY"
        );
      }
      if (item.key == 'updatedAt') {
        item.name = 'Policy Updated On'
        item.value = this.commonService.formatDateUsingMoment(
          item.value,
          "MM/DD/YYYY"
        );
      }
      if (item.key == 'statusName') {
        item.name = 'Status'

      }
      if (item.key == 'isPolicyOwner') {
        item.name = 'Policy Owner?'

      }
      if (item.key == 'policyOwnerName') {
        item.name = 'Policy Owner Name'

      }
      if (item.key == 'policyOwnerDob') {
        item.name = 'Policy Owner DOB'
        item.value = this.commonService.formatDateUsingMoment(
          item.value,
          "MM/DD/YYYY"
        );
      }
      if (item.key == 'policyOwnerEmail') {
        item.name = 'Policy Owner Email'

      }

      if (item.key == 'lifeExpectancy') {
        item.name = 'Life Expectancy'

      }

      if (item.key == 'offerAmount') {
        item.name = 'Offer Amount'

      }
      return item;
    });
    console.log(this.viewPolicyData);

  }

  downloadPolicyDocument(type) {
    this.apiService.getPolicyDocument(this.data.id, type).subscribe(
      (res: any) => {
        saveAs(res, `${type}-document.pdf`);
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        this.commonService.showAlertMessage("error", error);
      }
    );
  }

}

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { ApiService } from '../core/services/api.service';
import { CommonService } from "../core/services/common.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ViewPolicyComponent } from './view-policy/view-policy.component';

@Component({
  selector: 'app-manage-policies',
  templateUrl: './manage-policies.component.html',
  styleUrls: ['./manage-policies.component.css']
})

export class ManagePoliciesComponent implements OnInit {
  policies = [];
  paginationData;
  limit = 4;
  searchTerm = "";
  policyDocument;

  insurers = [
    { id: 1, name: "Test Insurer" }
  ];

  constructor(
    private router: Router,
    private commonService: CommonService,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {

    this.getPolicies();
  }

  searchBasedOnTerms(searchQuery) {
    this.searchTerm = searchQuery;
    this.getPolicies(1);
  }

  getResultsByPage($event) {
    const page = $event.currentPage;
    this.getPolicies(page);
  }

  getValue(data) {
    console.log(data);

    return "Hey";
  }

  getPolicies(page = 1) {
    this.spinner.show();
    const data = {};
    if (this.searchTerm) {
      data['policyNumber'] = this.searchTerm;
    }
    const skip = (page - 1) * this.limit;
    this.apiService.getPolicies(data, skip, this.limit).subscribe(
      (resp: any) => {
        const statusTypes = this.commonService.getStatusTypes();

        if (resp.status) {
          this.policies = resp.data;

          this.policies.map(policy => {
            policy.policyStartDate = this.commonService.formatDateUsingMoment(
              policy.policyStartDate,
              "MM/DD/YYYY"
            );
            policy.statusName = statusTypes[policy.status];
            return policy;
          })
        }

        this.paginationData = {
          total: resp.count,
          pageIndex: page,
        };
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
      }
    );
  }

  edit(id) {
    this.router.navigate(["/policies/edit", id]);
  }

  viewPolicy(data) {
    this.dialog.open(ViewPolicyComponent, {
      data,
      height: '70%', width: '50%'
    });
  }

  sellPolicy(id) {
    this.spinner.show();
    this.apiService.createUpdatePolicy(id, { status: 2 }).subscribe(
      (res) => {
        this.formSuccess();
      },
      (error) => {
        this.formErrors(error);
      }
    );

  }

  acceptPolicyOffer(policy) {
    Swal.fire({
      title: `Accept the Offer of $${policy.offerAmount}?`,
      showCancelButton: true,
      confirmButtonText: `Accept`,
      denyButtonText: `Cancel`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.apiService.createUpdatePolicy(policy._id, { status: 6 }).subscribe(
          (resp: any) => {
            Swal.fire(`Offer of $${policy.offerAmount} Accepted!`, '', 'success');
            this.getPolicies(1);
            // this.routeToList();
          },
          (error) => {
            this.formErrors(error);
            this.spinner.hide();
          });
      }
    });
  }

  rejectPolicyOffer(policy) {
    console.log("Remove", policy);
    Swal.fire({
      title: `Reject the Offer of $${policy.offerAmount}?`,
      showCancelButton: true,
      confirmButtonText: `Reject`,
      denyButtonText: `Cancel`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.createUpdatePolicy(policy._id, { status: 7 }).subscribe(
          (resp: any) => {
            Swal.fire(`Offer of $${policy.offerAmount} Rejected.`, '', 'warning');
            this.getPolicies(1);
            // this.routeToList();
          },
          (error) => {
            this.formErrors(error);
            this.spinner.hide();
          });
      }
    });
  }

  formSuccess() {
    this.spinner.hide();
    let flashMessage = "Policy Sent for Sale successfully.";
    this.commonService.showAlertMessage("success", flashMessage);
    this.getPolicies(1);
  }

  formErrors(error) {
    // this.errorMessage = error;;
    this.spinner.hide();
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ViewPolicyComponent } from 'src/app/manage-policies/view-policy/view-policy.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lsp',
  templateUrl: './lsp.component.html',
  styleUrls: ['./lsp.component.css']
})
export class LspComponent implements OnInit {
  policyStatus: string = 'Active Requests';
  policies = [];
  paginationData;
  limit = 4;
  searchTerm = "";
  errorMessage = "";
  actionHeader = "Action";

  insurers = [
    { id: 1, name: "Test Insurer" }
  ];

  activeRequests = 0;
  cancelledRequests = 0;
  offersCreated = 0;

  companies = {};

  constructor(
    private router: Router,
    private commonService: CommonService,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.apiService.getCompanies({ companyType: 3 }).subscribe((res: any) => {
      res.data.forEach(company => this.companies[company._id] = company.name)
    });

    this.getUserStats();
    this.getPolicies();
  }

  getUserStats() {
    this.apiService.getLspPolicyStats().subscribe(
      (resp: any) => {
        this.activeRequests = resp.data.activeRequests;
        this.cancelledRequests = resp.data.cancelledRequests;
        this.offersCreated = resp.data.offersCreated;
      },
      (error) => {
        this.spinner.hide();
      }
    );
  }

  searchBasedOnTerms(searchQuery) {
    this.searchTerm = searchQuery;
    this.getPolicies(1);
  }

  getResultsByPage($event) {
    const page = $event.currentPage;
    this.getPolicies(page);
  }

  changeHeader(type) {
    if (type == 4) {
      this.actionHeader = 'Amount Offered';
    } else if (type == 5) {
      this.actionHeader = 'Rejection Reason';
    } else if (type == 2) {
      this.actionHeader = 'Action';
    }
    // return true;
  }

  getPolicies(page = 1, policyStatus = 2) {
    console.log(policyStatus);

    this.spinner.show();
    const data = {};
    if (this.searchTerm) {
      data['policyNumber'] = this.searchTerm;
    }
    data['policyStatus'] = policyStatus;
    const skip = (page - 1) * this.limit;
    this.apiService.getPolicies(data, skip, this.limit).subscribe(
      (resp: any) => {
        console.log('resp', resp);
        if (resp.status) {
          this.policies = resp.data;
          const statusTypes = this.commonService.getStatusTypes();
          this.policies.map(policy => {
            policy.policyStartDate = this.commonService.formatDateUsingMoment(
              policy.policyStartDate,
              "MM/DD/YYYY"
            )
            policy.statusName = statusTypes[policy.status];
          });
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

  async acceptPolicyOffer(policy) {
    const { value: number } = await Swal.fire({
      title: 'Accept and Make an Offer.',
      input: 'number',
      inputPlaceholder: 'Enter Offer Amount',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter Amount!'
        }
      },
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: `Create`,
      denyButtonText: `Cancel`,
    });
    if (number) {
      this.apiService.createUpdatePolicy(policy._id, { status: 4, offerAmount: number }).subscribe(
        (resp: any) => {
          Swal.fire('Offer Created!', '', 'success');
          this.getUserStats();
          this.getPolicies(1);
        },
        (error) => {
          this.spinner.hide();
        }
      );
    } else {
      Swal.fire('Policy Not Modified.', '', 'info')
    };
  }

  async rejectPolicyOffer(policy) {

    const { value: text } = await Swal.fire({
      title: 'Reject the Offer.',
      input: 'text',
      inputPlaceholder: 'Enter Reason',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter Rejection Reason!'
        }
      },
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: `Reject`,
      denyButtonText: `Cancel`,
    });
    if (text) {
      this.apiService.createUpdatePolicy(policy._id, { status: 5, rejectionReason: text }).subscribe(
        (resp: any) => {
          Swal.fire('Policy Rejected!', '', 'info');
          this.getUserStats();
          this.getPolicies(1);
        },
        (error) => {
          this.spinner.hide();
        }
      );
    } else {
      Swal.fire('Policy Not Modified.', '', 'info')
    };

  }

  getRequestedUsers(policyStatus) {
    this.getPolicies(1, policyStatus);
    if (policyStatus == 2) {
      this.policyStatus = 'Active Requests';
    }
    if (policyStatus == 6) {
      this.policyStatus = 'Cancelled Requests';
    }
    if (policyStatus == 5) {
      this.policyStatus = 'Offers Created';
    }
  }

  formSuccess() {
    this.spinner.hide();
    let flashMessage = "Policy Sent for Sale successfully.";
    this.commonService.showAlertMessage("success", flashMessage);
    this.getPolicies(1);
  }

  formErrors(error) {
    this.errorMessage = error;;
    this.spinner.hide();
  }

}

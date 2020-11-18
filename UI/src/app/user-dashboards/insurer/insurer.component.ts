import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';

import { MatDialog } from '@angular/material/dialog';

import { TransferDocumentComponent } from '../../manage-policies/transfer-document/transfer-document.component';
import Swal from 'sweetalert2';
import { ViewPolicyComponent } from 'src/app/manage-policies/view-policy/view-policy.component';

@Component({
  selector: 'app-insurer',
  templateUrl: './insurer.component.html',
  styleUrls: ['./insurer.component.css']
})
export class InsurerComponent implements OnInit {
  policyStatus: string = 'Active Requests';
  policies = [];
  paginationData;
  limit = 4;
  searchTerm = "";
  errorMessage = "";

  activeRequests = 0;
  cancelledRequests = 0;
  offersCreated = 0;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog
    ) { }

  ngOnInit(): void {
    // this.apiService.getLspPolicyStats().subscribe(
    //   (resp: any) => {
    //     this.activeRequests = resp.data.activeRequests;
    //     this.cancelledRequests = resp.data.cancelledRequests;
    //     this.offersCreated = resp.data.offersCreated;
    //   },
    //   (error) => {
    //     this.spinner.hide();
    //   }
    // );
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

  getPolicies(page = 1) {
    this.spinner.show();
    const data = {
      policyStatus: 3
    };
    if (this.searchTerm) {
      data['policyNumber'] = this.searchTerm;
      
    }
    
    const skip = (page - 1) * this.limit;
    this.apiService.getPolicies(data, skip, this.limit).subscribe(
      (resp: any) => {
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

  approve(data) {
    this.spinner.show();
    this.apiService.createUpdatePolicy(data._id, { processedByInsurer: true, verifiedByInsurer: true }).subscribe(
      (resp: any) => {
        Swal.fire('Policy verified successfully!', '', 'success');
          this.getPolicies(1);
      },
      (error) => {
        this.spinner.hide();
      }
    );
  }

  reject(data) {
    this.spinner.show();
    this.apiService.createUpdatePolicy(data._id, { processedByInsurer: true, verifiedByInsurer: false }).subscribe(
      (resp: any) => {
        Swal.fire('Policy rejected successfully!', '', 'success');
          this.getPolicies(1);
      },
      (error) => {
        this.spinner.hide();
      }
    );
  }

  documentUpdated(data) {
    const dialogRef = this.dialog.open(TransferDocumentComponent, {
      data,
      height: '70%', 
      width: '70%',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getPolicies(1);
    });
  }

  viewPolicy(data) {
    this.dialog.open(ViewPolicyComponent, {
      data,
      height: '70%', width: '50%'
    });
  }
}

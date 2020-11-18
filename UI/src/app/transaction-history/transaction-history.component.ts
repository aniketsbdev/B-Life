import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../core/services/api.service';
import { CommonService } from '../core/services/common.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {

  isLoadingResults: Boolean = true;
  transactions: any[] = [];
  limit = 5;
  paginationData: {} = {};
  searchTerm: string = "";
  selectedUser: {} = {};
  userTypes = null;
  userTypesList = [];

  constructor(
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private commonService: CommonService
  ) {
  }

  ngOnInit(): void {
    this.getTransactions();
  }

  searchBasedOnTerms(searchQuery) {
    this.searchTerm = searchQuery;
    this.getTransactions(1);
  }

  getResultsByPage($event) {
    console.log($event);
    const page = $event.currentPage;
    this.getTransactions(page);
  }

  getTransactions(page = 1) {
    this.spinner.show();
    const data = {
      externalUser: false
    };
    if (this.searchTerm) {
      data['email'] = this.searchTerm;
    }
    console.log(this.limit);

    const skip = (page - 1) * this.limit;
    this.apiService.getTransactions(data, skip, this.limit).subscribe(
      (resp: any) => {
        if (resp.status) {
          console.log(this.userTypesList);
          this.transactions = resp.data;
          // this.users = resp.data.map(user => {
          //   let userType = this.userTypesList.filter(newUser => newUser.id == user.userType);
          //   console.log(user.userType, userType[0].name);
          //   user.userType = userType[0].name;
          //   user.name = `${user.firstName} ${user.lastName}`;
          //   return user;
          // });
        }
        // this.transactions = [];
        this.paginationData = {
          total: resp.count,
          pageIndex: page
        };
        console.log(this.paginationData);
        // this.isRequestPending = false;
        this.spinner.hide();
      },
      (error) => {
        // this.isRequestPending = false;
        // this.errorMessage = 'Something went wrong. Please try again';
        this.spinner.hide();
      }
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from 'src/app/core/services/common.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-company-management',
  templateUrl: './company-management.component.html',
  styleUrls: ['./company-management.component.css']
})
export class CompanyManagementComponent implements OnInit {
  isLoadingResults: Boolean = true;
  companies: any[] = [];
  limit = 5;
  paginationData: {} = {};
  searchTerm: string = "";
  selectedCompany: {} = {};
  userTypes = null;
  companyTypes = [];

  constructor(
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private commonService: CommonService
  ) {
  }

  ngOnInit(): void {
    this.userTypes = this.commonService.getCompanyTypes();
    const allowedAccountTypes = [1, 2, 3];
    Object.keys(this.userTypes).forEach(typeKey => {
      // console.log(typeof typeKey, 'type key checked');
      if (allowedAccountTypes.includes(parseInt(typeKey))) {
        this.companyTypes.push({ id: typeKey, name: this.userTypes[typeKey] })
      }
    });
    this.getCompanies();
  }

  searchBasedOnTerms(searchQuery) {
    this.searchTerm = searchQuery;
    this.getCompanies(1);
  }

  getResultsByPage($event) {
    console.log($event);
    const page = $event.currentPage;
    this.getCompanies(page);
  }

  getCompanies(page = 1) {
    this.spinner.show();
    const data = {};
    if (this.searchTerm) {
      data['name'] = this.searchTerm;
      data['licenseNumber'] = this.searchTerm;
    }
    const skip = (page - 1) * this.limit;
    this.apiService.getCompanies(data, skip, this.limit).subscribe(
      (resp: any) => {
        if (resp.status) {
          this.companies = resp.data.map(user => {
            let userType = this.companyTypes.filter(newUser => newUser.id == user.companyType);
            user.companyType = userType[0].name;
            return user;
          });
        }
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

  addNewCompany() {
    this.router.navigate(['/createCompany']);
    // this.router.navigate(['/user-management?id=' + this.selectedCompany['_id']]);
  }

  goToEditCompany(selectedCompany) {
    this.selectedCompany = selectedCompany;
    console.log(selectedCompany);
    this.router.navigate(['/editCompany/' + this.selectedCompany['_id']]);
  }

}

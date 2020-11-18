import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from 'src/app/core/services/common.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  isLoadingResults: Boolean = true;
  users: any[] = [];
  limit = 5;
  paginationData: {} = {};
  searchTerm: string = "";
  selectedUser: {} = {};
  userTypes = null;
  userTypesList = [];
  userCount = 0;
  kycCount = 0;

  constructor(
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private commonService: CommonService
  ) {
  }

  ngOnInit(): void {
    this.userTypes = this.commonService.getUserTypes();
    const allowedAccountTypes = [1, 2, 3, 4, 5, 6];
    Object.keys(this.userTypes).forEach(typeKey => {
      // console.log(typeof typeKey, 'type key checked');
      if (allowedAccountTypes.includes(parseInt(typeKey))) {
        this.userTypesList.push({ id: typeKey, name: this.userTypes[typeKey] })
      }
    });
    this.getUsers();
  }

  searchBasedOnTerms(searchQuery) {
    this.searchTerm = searchQuery;
    this.getUsers(1);
  }

  getResultsByPage($event) {
    const page = $event.currentPage;
    this.getUsers(page);
  }

  getUsers(page = 1) {
    this.spinner.show();
    const data = {
      externalUser: false
    };
    if (this.searchTerm) {
      data['email'] = this.searchTerm;
    }

    const skip = (page - 1) * this.limit;
    this.apiService.getUsers(data, skip, this.limit).subscribe(
      (resp: any) => {

        if (resp.status) {
          this.userCount = resp.count;
          this.users = resp.data.map(user => {
            let userType = this.userTypesList.filter(newUser => newUser.id == user.userType);
            if ((user.userType == 5 || user.userType == 6) && user.kycChecked === false && this.kycCount == 0) {
              this.kycCount++;
            }
            user.userTypeName = userType[0].name;
            user.name = `${user.firstName} ${user.lastName}`;
            return user;
          });
        }
        this.paginationData = {
          total: resp.count,
          pageIndex: page
        };
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

  addNewUser() {
    this.router.navigate(['/createUser']);
    // this.router.navigate(['/user-management?id=' + this.selectedUser['_id']]);
  }

  goToEditUser(selectedUser) {
    this.selectedUser = selectedUser;
    this.router.navigate(['/editUser/' + this.selectedUser['_id']]);
  }

  downloadKycDocument(id, type) {
    this.apiService.getKycDocument(id, type).subscribe(
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonService } from 'src/app/core/services/common.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-kyc-management',
  templateUrl: './kyc-management.component.html',
  styleUrls: ['./kyc-management.component.css']
})
export class KycManagementComponent implements OnInit {
  isLoadingResults: Boolean = true;
  users: any[] = [];
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
    console.log($event);
    const page = $event.currentPage;
    this.getUsers(page);
  }

  getUsers(page = 1) {
    this.spinner.show();
    const data = {
      externalUser: true
    };
    if (this.searchTerm) {
      data['email'] = this.searchTerm;
    }
    const skip = (page - 1) * this.limit;
    this.apiService.getUsers(data, skip, this.limit).subscribe(
      (resp: any) => {
        if (resp.status) {
          this.users = resp.data.map(user => {
            let userType = this.userTypesList.filter(newUser => newUser.id == user.userType);
            console.log(user.userType, userType[0].name);
            user.userTypeName = userType[0].name;
            user.name = `${user.firstName} ${user.lastName}`;
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

  addNewUser() {
    this.router.navigate(['/createUser']);
    // this.router.navigate(['/user-management?id=' + this.selectedUser['_id']]);
  }

  acceptKyc(user) {
    console.log("Accept", user);
    Swal.fire({
      title: 'Do you want to accept the KYC and allow User Access?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `Save`,
      denyButtonText: `Don't save`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.apiService.addUpdateUser({ isActive: true, kycChecked: true }, user._id).subscribe(
          (resp: any) => {
            Swal.fire('Saved!', '', 'success')
            this.getUsers(1);
            // this.routeToList();
          },
          (error) => {
            this.spinner.hide();
          }
        );

      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info')
      }
    });
  }

  removeKyc(user) {
    console.log("Remove", user);
    Swal.fire({
      title: 'Do you want to reject the KYC and remove User Access?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `Save`,
      denyButtonText: `Don't save`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.addUpdateUser({ isActive: false, kycChecked: true }, user._id).subscribe(
          (resp: any) => {
            Swal.fire('Saved!', '', 'success');
            this.getUsers(1);
            // this.routeToList();
          },
          (error) => {
            this.spinner.hide();
          }
        );

      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info')
      }
    });
  }

  goToEditUser(selectedUser) {
    this.selectedUser = selectedUser;
    console.log(selectedUser);
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

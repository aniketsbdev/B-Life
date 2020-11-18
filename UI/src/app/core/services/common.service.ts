import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import Swal from 'sweetalert2'

import * as moment from "moment";

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private router: Router) { }

  isSideNavOpen = true;

  private userTypes = {
    1: "Admin",
    2: "LSP",
    3: "Insurer",
    4: "Medical Underwriter", //Medical Under Writer 
    5: "Broker",
    6: "Seller"
  }

  private companyTypes = {
    1: "Insurance",
    2: "LSP",
    3: "Medical Underwriter"
  }

  private statusTypes = {
    1: "Created",
    2: "Verification Pending",
    3: "Verified",
    4: "Offer Created",
    5: "Rejected",
    6: "Offer Accepted",
    7: "Offer Rejected",
    8: "Transfer Complete",
    // 9: "Transfer Complete"
  }

  private menuItems = [
    {
      name: 'dashboard',
      title: 'Home',
      route: '/dashboard',
      icon: 'fa fa-home',
      allowedUserTypes: [
        1, 2, 3, 4, 5, 6
      ]
    },
    // {
    //   name: 'manage_policy',
    //   title: 'Manage Policies',
    //   route: '/manage-policies',
    //   icon: 'fa fa-file',
    //   allowedUserTypes: [2]
    // },
    {
      name: 'estimate_policy',
      title: 'Estimate Policy',
      route: '/estimate-policy',
      icon: 'fa fa-file',
      allowedUserTypes: [5, 6]
    },
    // {
    //   name: 'create_offer',
    //   title: 'Create Offer',
    //   route: '/create-offer',
    //   icon: 'fa fa-certificate',
    //   allowedUserTypes: [2]
    // },
    {
      name: 'wallet',
      title: 'Wallet',
      route: '/wallet',
      icon: 'fa fa-user',
      allowedUserTypes: [2, 5, 6]
    },
    {
      name: 'transaction_history',
      title: 'Transaction History',
      route: '/transaction-history',
      icon: 'fa fa-history',
      allowedUserTypes: [2, 5, 6]
    },
    {
      name: 'kyc_management',
      title: 'KYC Management',
      route: '/kyc-management',
      icon: 'fa fa-id-card-o',
      allowedUserTypes: [1]
    },
    // {
    //   name: 'user_management',
    //   title: 'User Management',
    //   route: '/user-management',
    //   icon: 'fa fa-history',
    //   allowedUserTypes: [this.userTypes.Admin]
    // },
    // {
    //   name: 'user_list',
    //   title: 'Users List',
    //   route: '/user',
    //   icon: 'fa fa-list',
    //   allowedUserTypes: [1]
    // },
    {
      name: 'company_management',
      title: 'Organisation Management',
      route: '/company-management',
      icon: 'fa fa-building',
      allowedUserTypes: [1]
    }
  ]

  private sidenavStatus = new Subject<boolean>();

  toggleSideNav() {
    this.isSideNavOpen = !this.isSideNavOpen;
    this.sidenavStatus.next(this.isSideNavOpen);
  }

  onSidenavStatusUpdate(): Observable<any> {
    return this.sidenavStatus.asObservable();
  }

  setUserDetails(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUserDetails() {
    return JSON.parse(localStorage.getItem('user'));
  }

  // clear user details
  clearLoginDetails() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getUserTypes() {
    return this.userTypes;
  }

  getCompanyTypes() {
    return this.companyTypes;
  }

  getStatusTypes() {
    return this.statusTypes;
  }

  menuBasedOnUserType(userType) {
    const menu = [];

    if (userType) {
      this.menuItems.forEach(item => {
        if (item.allowedUserTypes.includes(userType)) {
          menu.push(item);
        }
      });
    }

    return menu;
  }

  showAlertMessage(type, message) {
    Swal.fire({
      icon: type,
      title: message,
      // text: message,
      timer: 4000,
      toast: true,
      position: 'bottom-start',
      showConfirmButton: false,
      showCloseButton: true
    })
  }

  simpleDialogMessage(message) {
    Swal.fire(message);
  }

  formatDateUsingMoment(date, format) {
    return moment(date).format(format);
  }
}

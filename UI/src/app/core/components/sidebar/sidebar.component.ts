import { Component, OnInit } from '@angular/core';

import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  isAdmin = false;
  showSideNav = true;
  menuItems = [];
  constructor(private commonService: CommonService) {}

  ngOnInit(): void {
    const user = this.commonService.getUserDetails();
    const userType = user.userType ? user.userType : '';
    this.menuItems = this.commonService.menuBasedOnUserType(userType);

    this.commonService.onSidenavStatusUpdate().subscribe(status => {
      // console.log(status, 'status');
      this.showSideNav = status;
    });
  }
}

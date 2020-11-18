import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { NgxSpinnerService } from 'ngx-spinner';

import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  user = null;
  notifications: Notification[] = [];
  private subscription;
  imageurl = null;
  id = null;

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    private domSanitizer: DomSanitizer,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.user = this.commonService.getUserDetails();
    this.id = this.user._id;
    this.getUser();
    // this.notificationService.getNotification();
    this.subscription = this.notificationService.getNotification().subscribe(notification => {
      console.log(notification);
      this.notifications.unshift(notification);
      // this.notifications.push(notification);
      if (this.notifications.length > 3) {
        this.notifications.pop();
      }
    }
    )
  }

  getUser() {
    this.spinner.show();
    this.apiService.getUserById(this.id).subscribe(
      (res: any) => {
        console.log(res, 'response');
        if (res.data.avatar && res.data.avatar != '') {
          let TYPED_ARRAY = new Uint8Array(res.data.avatar.data);

          const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
          }, '');

          let base64String = btoa(STRING_CHAR);
          this.imageurl = this.domSanitizer.bypassSecurityTrustUrl('data: image/jpg; base64,' + base64String);
        }
        else this.imageurl = '../../../../assets/img/profile/default-profile.png';
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
        this.commonService.showAlertMessage("error", error);
      }
    );
  }

  toggleSideNav() {
    this.commonService.toggleSideNav();
  }

  logout() {
    this.spinner.show();

    this.apiService.logout().subscribe(
      (resp: any) => {
        this.commonService.clearLoginDetails();
        this.commonService.showAlertMessage("success", resp.message);
        this.spinner.hide();
      },
      (error) => {
        this.commonService.clearLoginDetails();
        this.commonService.showAlertMessage("success", error);
        this.spinner.hide();
      }
    );
  }

  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
  }
}

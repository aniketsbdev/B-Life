import { Component, OnInit } from '@angular/core';

import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  isLoggedIn = false;

  constructor(private commonService: CommonService) {}

  ngOnInit(): void {
    this.isLoggedIn = false;
    const user = this.commonService.getUserDetails();
    if (user) {
      this.isLoggedIn = true;
    }
    // console.log(user, 'user ....');
  }
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ApiService } from '../core/services/api.service';
import { CommonService } from '../core/services/common.service';
import { ValidationService } from '../core/services/validation.service';

import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  userType = 0;
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
    private validationService: ValidationService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const user = this.commonService.getUserDetails();
    this.userType = user.userType ? user.userType : 6;
  }
}

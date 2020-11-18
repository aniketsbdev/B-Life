import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  SimpleChange,
  ViewChild,
  HostListener,
} from '@angular/core';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css'],
})
export class UsersListComponent implements OnInit, OnChanges {
  @Input() refreshUsers;
  @Output() editUser = new EventEmitter<any>();

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;

  userData: Array<any> = [];
  displayedColumns: string[] = ['index', 'name', 'email', 'role', 'actions'];
  errorMessage = '';
  successMessage = '';
  isRequestPending = false;

  constructor(private apiService: ApiService) {}

  ngOnChanges(changes: SimpleChanges) {
    const refreshUsers: SimpleChange = changes.refreshUsers;
    if (refreshUsers && refreshUsers.currentValue) {
      this.getUsersData();
    }
  }

  ngOnInit(): void {
    this.getUsersData();
  }

  getUsersData() {
    this.userData = [];
    // this.apiService.getUsers().subscribe((res: any) => {
    //   const recordsCount = res ? Object.keys(res).length : 0;
    //   if (recordsCount == 0) {
    //     this.userData = [];
    //     this.dataSource = new MatTableDataSource(this.userData);
    //     this.dataSource.sort = this.sort;
    //   } else {
    //     Object.keys(res).forEach(
    //       (key) => {
    //         const user = res[key];
    //         this.userData.push({
    //           id: key,
    //           name: user.name,
    //           email: user.email,
    //           role: user.role,
    //           roleName: +user.role === 1 ? 'Admin' : 'Business User',
    //           password: user.password,
    //         });
    //         this.dataSource = new MatTableDataSource(this.userData);
    //         this.dataSource.sort = this.sort;
    //       },
    //       (error) => {
    //         this.errorMessage = 'Something went wrong';
    //       }
    //     );
    //   }
    // });
  }

  editUserClicked(data) {
    this.editUser.emit(data);
  }

  deleteUser(data) {
    if (this.isRequestPending) {
      return false;
    }

    this.isRequestPending = true;
    // console.log(data, 'data');
    this.apiService.deleteUser(data.id).subscribe(
      (res) => {
        this.successMessage = 'Record deleted successfuly';
        this.getUsersData();
        this.isRequestPending = false;
      },
      (error) => {
        this.errorMessage = 'Something went wrong';
        this.isRequestPending = false;
      }
    );
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

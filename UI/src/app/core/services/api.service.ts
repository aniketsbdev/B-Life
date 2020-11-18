import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { filter, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) { }

  // login user using username and password
  login(data) {
    return this.http.post<any>(`${environment.apiUrl}/login`, data);
  }

  // logout user
  logout() {
    return this.http.post<any>(`${environment.apiUrl}/logout`, {});
  }

  // logout From All Devices
  logoutFromAllDevices() {
    return this.http.post<any>(`${environment.apiUrl}/logout-all-devices`, {});
  }

  // register user
  register(data) {
    return this.http.post<any>(`${environment.apiUrl}/register`, data);
  }

  // create update users
  addUpdateUser(data, id = null) {
    console.log(data, id, "hereh");
    if (id) {

      return this.http.patch<any>(
        `${environment.apiUrl}/users/${id}`,
        data
      );
    } else {
      return this.http.post<any>(`${environment.apiUrl}/users`, data);
    }
  }

  changeAvatar(data, id = null) {
    return this.http.post<any>(`${environment.apiUrl}/users/me/avatar`, data);
  }

  // create update users
  walletTransaction(data) {
    return this.http.post<any>(`${environment.apiUrl}/users/wallet`, data);
  }

  // create update users
  deleteUser(id) {
    return this.http.delete<any>(`${environment.apiUrl}/users/${id}.json`);
  }

  // get users
  getUsers(data = {}, skip = 0, limit = 10) {
    const filters = this.addFilters(data);
    return this.http.get<any>(`${environment.apiUrl}/users/?skip=${skip}&limit=${limit}${filters}`);
  }

  getTransactions(data = {}, skip = 0, limit = 10) {
    const filters = this.addFilters(data);
    return this.http.get<any>(`${environment.apiUrl}/users/transactions?skip=${skip}&limit=${limit}${filters}`);
  }

  getWalletAmount() {
    return this.http.get<any>(`${environment.apiUrl}/users/wallet`);
  }

  getUserById(id) {
    return this.http.get<any>(`${environment.apiUrl}/users/${id}`);
  }

  // get policies
  getPolicies(data = {}, skip = 0, limit = 10) {
    const filters = this.addFilters(data);
    return this.http.get<any>(`${environment.apiUrl}/policies?skip=${skip}&limit=${limit}${filters}`);
  }

  // get Policy Document
  getPolicyDocument(id, type) {
    let headers = new HttpHeaders();
    const requestOptions: Object = {
      headers: headers.set('Accept', 'application/pdf'),
      responseType: 'blob'
    }
    return this.http.get<any>(`${environment.apiUrl}/policies/${id}/document?type=${type}`, requestOptions);
  }

  // get KYC Document
  getKycDocument(id, type) {
    let headers = new HttpHeaders();
    const requestOptions: Object = {
      headers: headers.set('Accept', 'application/pdf'),
      responseType: 'blob'
    }
    return this.http.get<any>(`${environment.apiUrl}/users/${id}/kycDocument?type=${type}`, requestOptions);
  }

  // get Policy By Id
  getPolicyById(id) {
    return this.http.get<any>(`${environment.apiUrl}/policies/${id}`);
  }

  // create or update policy
  createUpdatePolicy(id = '', data) {
    if (id) {
      return this.http.patch<any>(`${environment.apiUrl}/policies/${id}`, data);
    } else {
      return this.http.post<any>(`${environment.apiUrl}/policies/`, data);
    }
  }

  getBrokerPolicyStats() {
    return this.http.get<any>(`${environment.apiUrl}/policies/broker-stats`);
  }

  getLspPolicyStats() {
    return this.http.get<any>(`${environment.apiUrl}/policies/lsp-stats`);
  }

  // Company CRUD
  getCompanies(data = {}, skip = 0, limit = 10) {
    const filters = this.addFilters(data);
    return this.http.get<any>(`${environment.apiUrl}/companies?skip=${skip}&limit=${limit}${filters}`);
  }

  getCompanyById(id) {
    return this.http.get<any>(`${environment.apiUrl}/companies/${id}`);
  }

  addUpdateCompany(data, id = null) {
    // console.log(data, id, "hereh");
    if (id) {

      return this.http.patch<any>(
        `${environment.apiUrl}/companies/${id}`,
        data
      );
    } else {
      return this.http.post<any>(`${environment.apiUrl}/companies`, data);
    }
  }

  // check policy eligibility
  checkEligibility(data) {
    return this.http.post<any>(`${environment.apiUrl}/policies/eligibility`, data);
  }

  // policy estimation
  policyEstimation(data) {
    return this.http.post<any>(`${environment.apiUrl}/policies/estimation`, data);
  }

  addFilters(data) {
    let filters = '';
    if (Object.keys(data).length > 0) {
      Object.keys(data).forEach(key => {
        filters += `&${key}=${data[key]}`;
      })
    }

    return filters;
  }

  // create or update policy
  updatePolicyMedicalReports(id, data) {
    if (id) {
      return this.http.patch<any>(`${environment.apiUrl}/policies/update-medical-report/${id}`, data);
    }
  }

  // create or update policy
  updatePolicyTransferDocument(id, data) {
    if (id) {
      return this.http.patch<any>(`${environment.apiUrl}/policies/update-transfer-document/${id}`, data);
    }
  }
}

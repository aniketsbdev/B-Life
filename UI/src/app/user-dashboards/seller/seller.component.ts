import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-seller',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.css']
})
export class SellerComponent implements OnInit {
  myPolicies = [];
  constructor() { }

  ngOnInit(): void {
    this.myPolicies.push({
      policy_number: '200001',
      effective_date: '07-31-1980',
      face_value: '120000',
      status: 'in_progress'
    }, {
      policy_number: '220001',
      effective_date: '07-21-1980',
      face_value: '125000',
      status: 'not_applicable'
    }, {
      policy_number: '202001',
      effective_date: '05-11-1980',
      face_value: '1270000',
      status: 'not_applicable'
    }, {
      policy_number: '201001',
      effective_date: '07-21-1980',
      face_value: '160000',
      status: 'in_progress'
    });
  }

}

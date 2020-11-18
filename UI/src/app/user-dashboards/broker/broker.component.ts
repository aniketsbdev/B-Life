import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-broker',
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.css']
})
export class BrokerComponent implements OnInit {
  totalPolicies = 0;
  soldPolicies = 0;
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.getBrokerPolicyStats().subscribe(
      (resp: any) => {
        this.totalPolicies = resp.data.totalPolicies;
        this.soldPolicies = resp.data.soldPolicies;
      },
      (error) => {
        // this.spinner.hide();
      }
    );
  }

}

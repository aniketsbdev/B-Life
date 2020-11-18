import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { ApiService } from '../core/services/api.service';
import { CommonService } from '../core/services/common.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {

  walletAmount = 0;
  userId = null;
  userDetails = {};

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.userDetails = this.commonService.getUserDetails();
    this.getWalletDetails();
  };

  getWalletDetails() {

    this.apiService.getWalletAmount().subscribe(res => {
      this.spinner.show();
      this.walletAmount = parseInt(res.data.wallet);
      this.userId = res.data._id;
      console.log(res.data);
      this.spinner.hide();
    });
  }

  async addMoney() {
    const { value: number } = await Swal.fire({
      title: 'Add Amount',
      input: 'number',
      inputPlaceholder: 'Enter Amount to add',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter Amount!'
        }
      },
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: `Add`,
      denyButtonText: `Cancel`,
    });
    if (number) {
      let newAmount = parseInt(number) + this.walletAmount;
      console.log(newAmount, number, this.walletAmount);
      console.log(typeof (newAmount), typeof (number), typeof (this.walletAmount));

      this.apiService.walletTransaction({ wallet: newAmount }).subscribe(
        (resp: any) => {
          Swal.fire('Amount Added!', '', 'success');
          this.spinner.show();
          this.getWalletDetails();
        },
        (error) => {
          this.spinner.hide();
        }
      );
    };
  }

}

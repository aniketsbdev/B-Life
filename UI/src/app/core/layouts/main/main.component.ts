import { Component, OnInit } from '@angular/core';

import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  constructor(private commonService: CommonService) {}

  ngOnInit(): void {}
}

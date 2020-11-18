import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css'],
})
export class AlertsComponent implements OnInit {
  @Input() type;
  @Input() message;
  constructor() {}

  ngOnInit(): void {}

  hideMessage() {
    this.message = '';
  }
}

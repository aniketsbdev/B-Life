import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-extended-form-control',
  templateUrl: './extended-form-control.component.html',
  styleUrls: ['./extended-form-control.component.css'],
})
export class ExtendedFormControlComponent implements OnChanges {
  constructor() {}

  @Input() inputErrors: any;
  @Input() errorDefs: any;
  @Input() formSubmitted: boolean;

  errorMessage = '';
  errorFound = false;

  ngOnChanges(changes: SimpleChanges): void {
    this.errorMessage = '';
    this.errorFound = false;
    if (this.inputErrors && this.formSubmitted) {
      Object.keys(this.errorDefs).some((key) => {
        if (this.inputErrors[key]) {
          this.errorMessage = this.errorDefs[key];
          this.errorFound = true;
          return true;
        }
      });
    }
  }
}

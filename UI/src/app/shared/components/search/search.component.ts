import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";

import { NoWhitespaceValidator } from "../../../core/validators/no-whitespace.validator";
import { ValidationService } from "../../../core/services/validation.service";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"]
})
export class SearchComponent implements OnInit {
  @Output() search = new EventEmitter<string>();
  form: FormGroup;
  errorDefs = {};
  submitted = false;
  constructor(
    private fb: FormBuilder,
    private serverValidationService: ValidationService
  ) {}

  ngOnInit() {
    this.errorDefs = this.serverValidationService.getValidationMessagesByKey(
      "search"
    );

    this.form = this.fb.group({
      query: ["", [Validators.required, NoWhitespaceValidator()]]
    });
  }

  searchResults(showAll) {
    this.submitted = false;
    if (showAll) {
      this.form.patchValue({ query: "" });
      this.search.next("");
    } else {
      if (this.form.invalid) {
        this.submitted = true;
        return false;
      }
      const queryTerm = this.form.get("query").value;

      this.search.next(queryTerm);
    }
  }
}

import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent implements OnInit, OnChanges {
  @Input() paginationData;
  @Input() itemsPerPage = 10;
  @Output() page = new EventEmitter<any>();
  firstPage = 1;
  currentPage = 1;
  nextPage = 2;
  previousPage = 1;
  totalPages = 1;
  maxLinksToShow = 10;
  allPagesArray = [];
  showPagination = false;

  constructor() {
    console.log(this.paginationData, this.itemsPerPage);
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.paginationData.currentValue) {
      const currentValue = changes.paginationData.currentValue;
      this.getTotalPages(currentValue.total, currentValue.pageIndex);
    }
  }

  ngOnInit() {}

  getTotalPages(totalItems, currentPage) {
    if (totalItems > 0) {
      this.currentPage = currentPage;
      let linksToShow = this.maxLinksToShow;
      this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
      let incrementor = 1;
      console.log(totalItems, this.totalPages, this.itemsPerPage);
      if (this.totalPages >= linksToShow) {
        const midLink = Math.floor(linksToShow / 2);

        const startIndex = this.currentPage - midLink;
        const endIndex = this.currentPage + midLink;
        if (startIndex > 0) {
          incrementor = startIndex;
        }

        if (endIndex >= this.totalPages) {
          incrementor = this.totalPages + 1 - linksToShow;
        }
      } else {
        linksToShow = this.totalPages;
      }

      this.allPagesArray = Array.from(
        Array(linksToShow),
        (x, index) => index + incrementor
      );
      // console.log(this.allPagesArray);
      this.showPagination = true;
    }
  }

  getPreviousPageData() {
    if (this.currentPage === 1) {
      return false;
    }

    this.currentPage = this.currentPage - 1;
    this.outputCurrentPage();
  }

  getNextPageData() {
    if (this.currentPage === this.totalPages) {
      return false;
    }

    this.currentPage = this.currentPage + 1;
    this.outputCurrentPage();
  }

  getFirstPageData() {
    if (this.currentPage === 1) {
      return false;
    }

    this.currentPage = 1;
    this.outputCurrentPage();
  }

  getLastPageData() {
    if (this.currentPage === this.totalPages) {
      return false;
    }

    this.currentPage = this.totalPages;
    this.outputCurrentPage();
  }

  getCurrentPageData(page) {
    if (this.currentPage === page) {
      return false;
    }

    this.currentPage = page;
    this.outputCurrentPage();
  }

  outputCurrentPage() {
    this.page.emit({ currentPage: this.currentPage });
  }
}

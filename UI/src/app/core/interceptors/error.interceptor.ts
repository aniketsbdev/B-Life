import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonService } from '../../core/services/common.service';

@Injectable()
/**
 * Handle errors after http resquest is complete
 */
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private commonService: CommonService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err) => {
        console.log(err, 'interceptor err');
        // const errors = {
        //   errors: null,
        //   message: 
        // }
        if (err.status === 401) {
          // auto logout if 401 response returned from api
          this.commonService.clearLoginDetails();
        }
        
        err.error.message = err.error.message && err.error.message !== '' ? err.error.message : err.statusText;
        
        return throwError(err.error);
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})

export class NotificationService {

  private url: 'http://localhost:3000'
  private socket = io('http://localhost:3000');
  constructor(
    // private socket: Socket
  ) {
    // this.socket = io(this.url);
  }

  // sendMessage(msg: string) {
  //   this.socket.emit("message", msg);
  // }

  // getNotification() {
  //   return this.socket
  //     .fromEvent("message")
  //     .pipe(map((data) => data));
  // }
  getNotification(): Observable<Notification> {
    let observable = new Observable<Notification>(observer => {

      console.log(this.socket);
      this.socket.on('new_notification', (data) => {
        console.log(data);
        

        let notification: Notification = data;
        observer.next(notification);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }
}
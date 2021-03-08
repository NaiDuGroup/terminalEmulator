import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class HelpService {

  constructor() { }

  call(): Observable<{}> {
    
    const event = new Subject<{}>();

    setTimeout(() => {
      event.next({ line: "This is a Technical Task provided by Kivork 2021!" });
      event.next({ line: "Welcome to this awesome terminal!" });
      event.next({ line: "What can you do here? :D" });
      event.next({ line: " " });
    }, 100);

    setTimeout(() => {
      event.next({ line: "Get current weather measurements by city name:" });
      event.next({ line: "        weather <cityName>" });
      event.next({ line: " " });
    }, 300);

    setTimeout(() => {
      event.next({ line: "Clear the screen:" });
      event.next({ line: "        clear" });
      event.next({ line: " " });
    }, 400);

    setTimeout(() => {
      event.next({ line: "Get help:" });
      event.next({ line: "        help" });
      event.next({ line: " " });
      event.complete();
    }, 500);

    return event.asObservable();
    
  }
}

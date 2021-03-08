import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { OpenWeatherMapHttpService } from './open-weather-map-http.service';

@Injectable()
export class WeatherService {

  constructor(
    private _httpWeatherService: OpenWeatherMapHttpService,
  ) { }

  call(cityName: string): Observable<{}> {
    
    const event = new Subject<{}>();

    setTimeout(() => {
      event.next({ line: "Sending request ..." });
    }, 100);

    setTimeout(() => {
      event.next({ line: "Receiving response ...", newLine: false });
    }, 5000);

    setTimeout(() => { 
      this._httpWeatherService.getWeatherByCityName(cityName).subscribe((response) => {
        event.next({ line: " ", newLine: false });
        event.next({ line: "Country: " + response.sys.country });
        event.next({ line: "City: " + response.name });
        event.next({ line: "Temperature: " + response.main.temp + "C" });
        event.next({ line: "Description: " + response.weather[0].description });
        event.next({ line: " "});
      }, err => {
        event.next({ line: " ", newLine: false });
        event.next({ line: "        Oooops! " + err.error.message });
        event.next({ line: " " });
      });
    }, 7500);

    setTimeout(() => {
      event.complete();
    }, 10000);

    return event.asObservable();
  }

  
}

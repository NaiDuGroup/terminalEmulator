import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiWeatherMapGetWeatherByCityName } from '../api';

@Injectable({
  providedIn: 'root'
})
export class OpenWeatherMapHttpService {

  private _apiKey: string = "b1ccadb885e5069232fce04c7291679b";

  constructor(
    private _http: HttpClient
  ) { }

  getWeatherByCityName(city: string): Observable<any> {
    return this._http.get<Observable<any>>(apiWeatherMapGetWeatherByCityName(), {
      params: {
        q: city.toString(),
        units: "metric",
        appid: this._apiKey
      }
    })
  }
}

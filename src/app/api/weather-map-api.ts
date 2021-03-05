import { environment } from "../../environments/environment";

export const apiWeatherMapGetWeatherByCityName = () => `${environment.openWeatherMapApiHost}/weather`;
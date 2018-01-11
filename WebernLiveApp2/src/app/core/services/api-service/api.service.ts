import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { AppConfig } from '../../../app.config';
import { ApiServiceError } from './api-service-error';
import { ApiServiceResult } from './api-service-result';

@Injectable()
export class ApiService {

    httpGetUrl: string = '';

    constructor(private http: HttpClient) {}

    /**
     * Performs a HTTP GET request to the Knora API.
     * @param url
     * @param options
     * @returns {Observable<any>}
     */
    httpGet(url: string, httpGetParams?: HttpParams ): Observable<any> {
        if (!httpGetParams) { httpGetParams = new HttpParams(); }
        const httpGetHeaders = new HttpHeaders().set('Accept', 'application/json');
        this.httpGetUrl = AppConfig.API_ENDPOINT + url;

        return this.http
            .get(
               this.httpGetUrl,
               {
                   observe: 'response',
                   params: httpGetParams,
                   headers: httpGetHeaders
               })
            .pipe(
                tap(response => {
                        console.info('ApiService# getUrl: ', this.httpGetUrl);
                        console.info('ApiService#httpGet.response: ', response);
                }),
                map((response: HttpResponse<any>) => {
                    try {
                        const apiServiceResult: ApiServiceResult = new ApiServiceResult();
                        apiServiceResult.status = response.status;
                        apiServiceResult.statusText = response.statusText;
                        apiServiceResult.body = response.body;
                        apiServiceResult.url = url;
                        return apiServiceResult;
                    } catch (e) {
                        // return ApiService.handleError(response, url);
                    }
                }),
                catchError(this.handleError('ApiService#httpGet', []))
            );
    }

    /**
     * Performs a HTTP POST request to the Knora API.
     * @param url
     * @param body
     * @param options
     * @returns {Observable<any>}
     */
    /*
    httpPost(url: string, body?: any, options?: RequestOptionsArgs): Observable<any> {
        if (!body) body = {};
        if (!options) options = {};
        return this.http.post(AppConfig.API_ENDPOINT + url, body, options).map((response: Response) => {
                try {
                    let apiServiceResult: ApiServiceResult = new ApiServiceResult();
                    apiServiceResult.status = response.status;
                    apiServiceResult.statusText = response.statusText;
                    apiServiceResult.body = response.json();
                    return apiServiceResult;
                } catch (e) {
                    return this.handleError(response);
                }
            }).catch((error: any) => {
                return Observable.throw(this.handleError(error));
            });
    }
    */

    /*
    static handleError(error: any, url: string): ApiServiceError {

        const response = new ApiServiceError();
        if (error instanceof HttpResponse) {
            // console.log(error);
            response.status = error.status;
            response.statusText = error.statusText;
            if (!response.statusText) {
                response.statusText = 'Connection to API endpoint failed';
            }
            response.route = url;
        } else {
            response.status = 0;
            response.statusText = 'Connection to API endpoint failed';
            response.route = url;
        }

        // response.status === 401 --> Unauthorized; password is wrong
        // response.status === 404 --> Not found; username is wrong
        return response;

    }


    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T> (operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            this.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }

    private log(message: string) {
        console.log(message);
    }


}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { defaultIfEmpty, map } from 'rxjs/operators';

import { ApiService, ConversionService } from '@awg-core/services/';
import {
    GeoDataJson,
    HlistJson,
    ResourceContextResponseJson,
    ResourceFullResponseJson,
    SearchResponseJson,
    SelectionJson
} from '@awg-shared/api-objects';
import { IResourceDataResponse, ResourceData, ResourceDetail } from '@awg-views/data-view/models';

/**
 * The DataApi service.
 *
 * It handles the search requests to the given (SALSAH) API
 * for the data view and provides the fulltext search data
 * and the resource detail data.
 *
 * Provided in: `root`.
 */
@Injectable({
    providedIn: 'root'
})
export class DataApiService extends ApiService {
    /**
     * Public variable: projectId.
     *
     * It keeps the SALSAH specific id of the webern project ('6').
     */
    projectId = '6';

    /**
     * Public variable: resourceSuffix.
     *
     * It keeps the SALSAH specific suffix for a resource ('_-_local').
     */
    resourceSuffix = '_-_local';

    /**
     * Public variable: routes.
     *
     * It keeps the SALSAH specific routes for
     * resources, search, geonames, hlists and selections.
     */
    routes = {
        resources: 'resources/',
        search: 'search/',
        geonames: 'geonames/',
        hlists: 'hlists/',
        selections: 'selections/'
    };

    /**
     * Constructor of the DataApiService.
     *
     * It declares a public {@link HttpClient} instance
     * to handle http requests and a private {@link ConversionService}
     * instance for the conversion of the response data.
     *
     * @param {HttpClient} http Instance of the HttpClient.
     * @param {ConversionService} conversionService Instance of the ConversionService.
     */
    constructor(http: HttpClient, private conversionService: ConversionService) {
        super(http);
        this.serviceName = 'DataApiService';
    }

    /**
     * Public method: getFulltextSearchData.
     *
     * It sets the path and params for a fulltext search query
     * to retrieve all results for the searchstring
     * from the given (SALSAH) API.
     *
     * @params {string} searchString The search string of the query.
     * @params {string} [nRows] The optional number of rows to return with the query.
     * @params {string} [startAt] The optional start position in the result list to return results.
     *
     * @returns {Observable<SearchResponseJson>} The observable with the SearchResponseJson data.
     */
    getFulltextSearchData(searchString: string, nRows?: string, startAt?: string): Observable<SearchResponseJson> {
        if (!searchString) {
            return;
        }
        // default values
        if (!nRows) {
            nRows = '-1';
        }
        if (!startAt) {
            startAt = '0';
        }

        // set path and params of query
        const queryPath: string = this.routes.search + searchString;

        const queryHttpParams = new HttpParams()
            .set('searchtype', 'fulltext')
            .set('filter_by_project', this.projectId)
            .set('show_nrows', nRows)
            .set('start_at', startAt);

        const searchData$: Observable<SearchResponseJson> = this.getApiResponse(
            SearchResponseJson,
            queryPath,
            queryHttpParams
        );

        // request to API
        return searchData$.pipe(
            map((searchResponse: SearchResponseJson) => {
                // conversion of search results for HTML display
                return this.conversionService.convertFullTextSearchResults(searchResponse);
            })
        );
    }

    /**
     * Public method: getResourceData.
     *
     * It provides the data for the resource detail view
     * as an ResourceData observable.
     *
     * @params {string} resourceId The id of the requested resource.
     *
     * @returns {Observable<ResourceData>} The observable with the resource data.
     */
    getResourceData(resourceId: string): Observable<ResourceData> {
        if (!resourceId) {
            return;
        }

        const fullResponseData$: Observable<ResourceFullResponseJson> = this.getResourceFullResponseData(resourceId);
        const contextData$: Observable<ResourceContextResponseJson> = this.getResourceContextData(resourceId);

        return observableForkJoin([fullResponseData$, contextData$]).pipe(
            // default empty value
            defaultIfEmpty([new ResourceFullResponseJson(), new ResourceContextResponseJson()]),

            // map the forkJoined response to a ResourceData object
            map((resourceDataResponse: IResourceDataResponse) => {
                return this.prepareResourceData(resourceDataResponse, resourceId);
            })
        );
    }

    /**
     * Private method: prepareResourceData.
     *
     * It converts the data response of a requested resource
     * to a ResourceData object.
     *
     * @params {IResourceDataResponse} resourceData The data response of the requested resource.
     * @params {string} resourceId The id of the requested resource.
     *
     * @returns {ResourceData} The resource data object.
     */
    private prepareResourceData(resourceDataResponse: IResourceDataResponse, resourceId: string): ResourceData {
        if (Object.keys(resourceDataResponse[0]).length === 0 && resourceDataResponse[0].constructor === Object) {
            return new ResourceData(new ResourceFullResponseJson(), undefined);
        }

        // convert data for displaying resource detail
        const resourceDetail: ResourceDetail = this.conversionService.convertResourceData(
            resourceDataResponse,
            resourceId
        );

        // return new resource data
        return new ResourceData(resourceDataResponse[0], resourceDetail);
    }

    /**
     * Private method: getResourceContextData.
     *
     * It calls the {@link getResourceDataResponseFromApi} method to
     * provide an Observable with the ResourceContextResponseJson data.
     *
     * @params {string} resourceId The id of the requested resource.
     *
     * @returns {Observable<ResourceContextResponseJson>} The observable of the response data.
     */
    private getResourceContextData(resourceId: string): Observable<ResourceContextResponseJson> {
        return this.getResourceDataResponseFromApi(ResourceContextResponseJson, resourceId);
    }

    /**
     * Private method: getResourceFullResponseData.
     *
     * It calls the {@link getResourceDataResponseFromApi} method to
     * provide an Observable with the ResourceFullResponseJson data.
     *
     * @params {string} resourceId The id of the requested resource.
     *
     * @returns {Observable<ResourceFullResponseJson>} The observable of the response data.
     */
    private getResourceFullResponseData(resourceId: string): Observable<ResourceFullResponseJson> {
        return this.getResourceDataResponseFromApi(ResourceFullResponseJson, resourceId);
    }

    /**
     * Private method: getGeoData.
     *
     * * It calls the {@link getResourceDataResponseFromApi} method to
     * provide an Observable with the GeoDataJson data.
     *
     * NOT USED.
     *
     * IMPLEMENTATION FOR FUTURE USE.
     *
     * @params {string} resourceId The id of the requested resource.
     *
     * @returns {Observable<GeoDataJson>} The observable of the response data.
     */
    private getGeoData(resourceId: string): Observable<GeoDataJson> {
        return this.getResourceDataResponseFromApi(GeoDataJson, resourceId);
    }

    /**
     * Private method: getHlistData.
     *
     * * It calls the {@link getResourceDataResponseFromApi} method to
     * provide an Observable with the HlistJson data.
     *
     * NOT USED.
     *
     * IMPLEMENTATION FOR FUTURE USE.
     *
     * @params {string} resourceId The id of the requested resource.
     *
     * @returns {Observable<HlistJson>} The observable of the response data.
     */
    private getHlistData(resourceId: string): Observable<HlistJson> {
        return this.getResourceDataResponseFromApi(HlistJson, resourceId);
    }

    /**
     * Private method: getSelectionsData.
     *
     * * It calls the {@link getResourceDataResponseFromApi} method to
     * provide an Observable with the SelectionJson data.
     *
     * NOT USED.
     *
     * IMPLEMENTATION FOR FUTURE USE.
     *
     * @params {string} resourceId The id of the requested resource.
     *
     * @returns {Observable<SelectionJson>} The observable of the response data.
     */
    private getSelectionsData(resourceId: string): Observable<SelectionJson> {
        return this.getResourceDataResponseFromApi(SelectionJson, resourceId);
    }

    /**
     * Private method: getResourceDataResponseFromApi.
     *
     * It prepares the calls to the given (SALSAH) API
     * for a resource id depending on the responseJsonType
     * and the given resource id.
     *
     * @param {*} responseJsonType The given json type of the API response.
     * @param {string} id The given id of a resource.
     *
     * @returns {Observable<any>} The observable of the HTTP response.
     */
    private getResourceDataResponseFromApi(responseJsonType: any, id: string): Observable<any> {
        // init query path and params
        let queryPath: string;
        let queryHttpParams: HttpParams = new HttpParams();

        // set path and params of query depending on responseJsonType
        switch (responseJsonType) {
            case GeoDataJson:
                queryPath = this.routes.geonames + id;
                queryHttpParams = queryHttpParams.set('reqtype', 'node');
                break;
            case HlistJson:
                queryPath = this.routes.hlists + id;
                break;
            case ResourceContextResponseJson:
                queryPath = this.routes.resources + id + this.resourceSuffix;
                queryHttpParams = queryHttpParams.set('reqtype', 'context');
                break;
            case ResourceFullResponseJson:
                queryPath = this.routes.resources + id + this.resourceSuffix;
                break;
            case SelectionJson:
                queryPath = this.routes.selections + id;
                break;
        }

        // trigger call to API
        return this.getApiResponse(responseJsonType, queryPath, queryHttpParams);
    }

    /**
     * Private method: getNodeIdFromAttributes.
     *
     * It gets a node id from the prop.attributes
     * of a selections or hlists value.
     *
     * NOT USED.
     *
     * IMPLEMENTATION FOR FUTURE USE.
     *
     * @param {string} attributes The given prop.attributes.
     *
     * @returns {string} id The node id.
     */
    private getNodeIdFromAttributes(attributes: string): string {
        // identify node id from prop.attributes
        // e.g. "hlist=17" or "selection=77"
        return attributes.split('=')[1].toString();
    }
}

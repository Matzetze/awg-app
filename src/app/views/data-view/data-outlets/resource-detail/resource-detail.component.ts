import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { NgbTabsetConfig } from '@ng-bootstrap/ng-bootstrap';

import { DataStreamerService, LoadingService } from '@awg-core/services';
import { DataApiService } from '@awg-views/data-view/services';

import { ResourceData } from '@awg-views/data-view/models';

@Component({
    selector: 'awg-resource-detail',
    templateUrl: './resource-detail.component.html',
    styleUrls: ['./resource-detail.component.css'],
    providers: [NgbTabsetConfig],
    changeDetection: ChangeDetectionStrategy.Default
})
export class ResourceDetailComponent implements OnInit {
    resourceData: ResourceData;

    oldId: string;
    resourceId: string;

    errorMessage: any = undefined;

    tabTitle = {
        html: 'Detail',
        raw: 'JSON (raw)',
        converted: 'JSON (converted)'
    };

    get httpGetUrl(): string {
        return this.dataApiService.httpGetUrl;
    }

    get isLoading$(): Observable<boolean> {
        return this.loadingService.getLoadingStatus();
    }

    constructor(
        private loadingService: LoadingService,
        private route: ActivatedRoute,
        private router: Router,
        private dataApiService: DataApiService,
        private streamerService: DataStreamerService,
        config: NgbTabsetConfig
    ) {
        config.justify = 'justified';
    }

    /**
     * Angular life cycle hook: ngOnInit.
     *
     * It calls the containing methods
     * when initializing the component.
     */
    ngOnInit() {
        this.routeToSidenav();
        this.getResourceData();
    }

    getResourceData() {
        // observe route params
        this.route.paramMap
            .pipe(
                switchMap((params: ParamMap) => {
                    // short cut for id param
                    const id = params.get('id');

                    // update current resource id via streamer service
                    this.updateResourceId(id);

                    // fetch resource data depending on param id
                    return this.dataApiService.getResourceData(id);
                })
            )
            .subscribe((data: ResourceData) => {
                // subscribe to resource data to trigger loading service
                this.resourceData = data;
            });
    }

    updateResourceId(id: string) {
        // store current resource id
        this.resourceId = id;

        // share current id via streamer service
        this.streamerService.updateResourceId(id);
    }

    /**
     * Public method: navigateToResource.
     *
     * It navigates to the '/data/resource' route
     * with the given id.
     *
     * If nextId is emitted, use nextId for navigation,
     * else navigate to oldId (backButton). If oldId
     * not exists (first call), use resourceId.
     *
     * @param {string} [nextId] The given resource id.
     * @returns {void} Navigates to the resource.
     */
    navigateToResource(nextId?: string): void {
        const showId = nextId ? nextId : this.oldId ? this.oldId : this.resourceId;
        // save resourceId as oldId
        this.oldId = this.resourceId;
        // update resourceId
        this.resourceId = showId;

        // navigate to new resource
        this.router.navigate(['/data/resource', +this.resourceId]);
    }

    /**
     * Public method: routeToSidenav.
     *
     * It activates the secondary outlet with the resource-info.
     *
     * @returns {void} Activates the resource-info side outlet.
     */
    routeToSidenav(): void {
        this.router.navigate([{ outlets: { side: 'resourceInfo' } }], {
            preserveFragment: true,
            queryParamsHandling: 'preserve'
        });
    }
}

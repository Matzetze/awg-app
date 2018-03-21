import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Meta } from '../../core/core-models';
import { MetaService } from '../../core/services';

@Component({
    selector: 'awg-home-view',
    templateUrl: './home-view.component.html',
    styleUrls: ['./home-view.component.css']
})
export class HomeViewComponent implements OnInit {

    public meta: Meta;
    public editors: string;
    public lastModified: string;

    constructor(
        private router: Router,
        private metaService: MetaService
    ) { }

    ngOnInit() {
        this.provideMetaData();
        this.routeToSidenav();
    }

    public provideMetaData(): void {
        this.meta = this.metaService.getMetaData();
        this.editors = this.meta.edition.editors;
        this.lastModified = this.meta.edition.lastModified;
    }

    public routeToSidenav(): void {
        this.router.navigate([{ outlets: { side: 'editionInfo' }}]);
    }
}
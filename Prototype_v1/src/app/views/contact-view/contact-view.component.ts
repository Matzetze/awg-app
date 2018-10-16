import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MetaService } from '@awg-core/services';
import { Meta } from '@awg-core/core-models';

@Component({
    selector: 'awg-contact-view',
    templateUrl: './contact-view.component.html',
    styleUrls: ['./contact-view.component.css']
})
export class ContactViewComponent implements OnInit {
    contactTitle = 'Impressum';
    contactId = 'masthead';

    dateFormat = 'd. MMMM yyyy';
    meta: Meta;
    today: number;

    constructor(private metaService: MetaService, private route: ActivatedRoute, private router: Router) {}

    ngOnInit() {
        this.provideMetaData();
        this.routeToSidenav();
        // this.scrollTo();
        this.today = Date.now();
    }

    provideMetaData(): void {
        this.meta = this.metaService.getMetaData();
    }

    routeToSidenav(): void {
        // opens the side-info outlet while preserving the router fragment for scrolling
        this.router.navigate([{ outlets: { side: 'contactInfo' } }], { preserveFragment: true });
    }
}

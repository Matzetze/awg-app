import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'awg-edition-view',
    templateUrl: './edition-view.component.html',
    styleUrls: ['./edition-view.component.css']
})
export class EditionViewComponent implements OnInit {
    editionTitle = 'Beispieledition ausgewählter Skizzen zu <em>Vier Lieder</em> op. 12, Nr. 1';
    editionId = 'edition';

    constructor(private router: Router) {}

    ngOnInit() {
        this.routeToSidenav();
    }

    routeToSidenav(): void {
        // opens the side-info outlet while preserving the router fragment for scrolling
        this.router.navigate([{ outlets: { side: 'editionInfo' } }], { preserveFragment: true });
    }
}
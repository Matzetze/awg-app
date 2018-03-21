import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'awg-structure-view',
    templateUrl: './structure-view.component.html',
    styleUrls: ['./structure-view.component.css']
})
export class StructureViewComponent implements OnInit {

    public structureTitle = 'Datenstrukturmodell';
    public structureId = 'structure';

    constructor(private router: Router) { }

    ngOnInit() {
        this.routeToSidenav();
    }

    public routeToSidenav(): void {
        this.router.navigate([{ outlets: { side: 'structureInfo' }}]);
    }

}
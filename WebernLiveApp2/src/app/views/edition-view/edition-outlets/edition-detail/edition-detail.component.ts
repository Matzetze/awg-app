import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Sheet } from '../../sheet';
import { EditionService } from '../../edition.service';

@Component({
    selector: 'awg-edition-detail',
    templateUrl: './edition-detail.component.html',
    styleUrls: ['./edition-detail.component.css']
})
export class EditionDetailComponent implements OnInit {

    public tkaData: string;
    public sheetsData: string;

    private errorMessage: string = undefined;

    // init sheets
    sheet2: string ='Aa:SkI/2';
    sheet3: string ='Aa:SkI/3';
    sheet4: string ='Aa:SkI/4';
    sheet5: string ='Aa:SkI/5';
    sheet: string = this.sheet2;

    // TODO
    showTkA: boolean = false;
    items: string[] = [
        this.sheet2,
        this.sheet3,
        this.sheet4,
        this.sheet5
    ]

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _editionService: EditionService
    ) { }

    ngOnInit() {
        this.getTka();
        this.getSheets();
    }

    private onSheetSelect(sheet: Sheet) {
        this._router.navigate(['/edition/detail', sheet.id]);
    }

    private getTka() {
        this._editionService.getJsonData('/textcritics.json')
            .subscribe(
                (data) => {
                    this.tkaData = data;
                    // console.log('EView: textcritics: ', this.tkaData);
                    this.showTkA = false;
                },
                error => {
                    this.errorMessage = <any>error;
                }
            );
    }

    private getSheets() {
        this._editionService.getJsonData('/sheets.json')
            .subscribe(
                (data) => {
                    this.sheetsData = data;
                },
                error => {
                    this.errorMessage = <any>error;
                }
            );
    }

}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BibliographyService } from './bibliography.service';
import { SearchResponseJson, SubjectItemJson } from '../../../../api-service/api-objects';

@Component({
    selector: 'awg-bibliography',
    templateUrl: './bibliography.component.html',
    styleUrls: ['./bibliography.component.css']
})
export class BibliographyComponent implements OnInit {

    public bibListResponse: SearchResponseJson = new SearchResponseJson();
    public bibList: SubjectItemJson[];
    private selectedBibItem: SubjectItemJson;
    private isBibListLoaded: boolean = false;

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _bibliographyService: BibliographyService
    ) { }

    ngOnInit() {
        this.getBibList();
    }

    getBibList(): void {
        this._bibliographyService.getBibliographyList()
            .subscribe((bibListResponse: SearchResponseJson) => {
                    this.bibListResponse = bibListResponse;
                    console.info('BibComp#bibListResponse', this.bibListResponse);
                    this.bibList = this.bibListResponse.subjects.slice(1,10);
                    this.isBibListLoaded = true;
                }
            );
    }

    onItemSelect(item: SubjectItemJson): void {
        this.selectedBibItem = item;
    }

    /*
        gotoDetail(id: string): void {
            let link = ['/search', 'bibliography/detail', id];
            this._router.navigate(link);
        }
    */
    /*
     delete(bibItem: BibEntry): void {
     this._bibliographyService
     .delete(bibItem.id)
     .then(() => {
     this.bibList = this.bibList.filter(b => b !== bibItem);
     if (this.selectedBibItem === bibItem) { this.selectedBibItem = null; }
     });
     }
     */
}

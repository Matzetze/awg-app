import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Sheet } from '../../../models/sheet.model';

@Component({
    selector: 'awg-edition-sheet-control',
    templateUrl: './edition-sheet-control.component.html',
    styleUrls: ['./edition-sheet-control.component.css']
})
export class EditionSheetControlComponent implements OnInit {
    @Input() sheets: Sheet[];
    @Input() selectedSheet: Sheet;
    @Output() selectSheetRequest: EventEmitter<Sheet> = new EventEmitter();

    constructor( ) {}

    ngOnInit() {

    }

    private isSelectedSheet(sheet: Sheet) {
        return sheet.id === this.selectedSheet.id;
    }

    private selectSheet(sheet: Sheet) {
        this.selectSheetRequest.emit(sheet);
    }

}
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, Input } from '@angular/core';

import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { EditionSvgSheet, EditionSvgOverlay, Textcritics } from '@awg-views/edition-view/models';

import { EditionAccoladeComponent } from './edition-accolade.component';

// mock components
@Component({ selector: 'awg-edition-detail-notification', template: '' })
class EditionDetailNotificationStubComponent {}

@Component({ selector: 'awg-edition-svg-sheet-nav', template: '' })
class EditionSvgSheetNavStubComponent {
    @Input()
    svgSheetsData: EditionSvgSheet[];
    @Input()
    selectedSvgSheet: EditionSvgSheet;

    // TODO: handle outputs
}

@Component({ selector: 'awg-edition-svg-sheet', template: '' })
class EditionSvgSheetStubComponent {
    @Input()
    selectedSvgSheet: EditionSvgSheet;
    @Input()
    selectedOverlay: EditionSvgOverlay;

    // TODO: handle outputs
}

@Component({ selector: 'awg-edition-tka-table', template: '' })
class EditionTkaTableStubComponent {
    @Input()
    selectedTextcritics: Textcritics[];

    // TODO: handle outputs
}

describe('EditionAccoladeComponent', () => {
    let component: EditionAccoladeComponent;
    let fixture: ComponentFixture<EditionAccoladeComponent>;
    let compDe: DebugElement;
    let compEl: any;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgbAccordionModule],
            declarations: [
                EditionAccoladeComponent,
                EditionDetailNotificationStubComponent,
                EditionSvgSheetStubComponent,
                EditionSvgSheetNavStubComponent,
                EditionTkaTableStubComponent
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditionAccoladeComponent);
        component = fixture.componentInstance;
        compDe = fixture.debugElement;
        compEl = compDe.nativeElement;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

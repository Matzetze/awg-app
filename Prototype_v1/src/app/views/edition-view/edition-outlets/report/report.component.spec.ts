/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of as observableOf } from 'rxjs';
import Spy = jasmine.Spy;

import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { CompileHtmlComponent } from '@awg-shared/compile-html';
import { ModalComponent } from '@awg-shared/modal/modal.component';
import { SourceList, TextcriticsList } from '@awg-views/edition-view/models';
import { EditionDataService } from '@awg-views/edition-view/services';

import { ReportComponent } from './report.component';

// mock components
@Component({ selector: 'awg-heading', template: '' })
class HeadingStubComponent {
    @Input()
    title: string;
    @Input()
    id: string;
}

@Component({ selector: 'awg-sources', template: '' })
class SourcesStubComponent {
    @Input()
    sourceListData: SourceList;

    // TODO: handle output
}

@Component({ selector: 'awg-textcritics', template: '' })
class TextcritisStubComponent {
    @Input()
    textcriticsData: TextcriticsList;

    // TODO: handle output
}

describe('ReportComponent', () => {
    let component: ReportComponent;
    let fixture: ComponentFixture<ReportComponent>;

    let getDataSpy: Spy;

    beforeEach(async(() => {
        // create a fake service object with a `getData()` spy
        const mockEditionDataService = jasmine.createSpyObj('EditionDataService', ['getEditionReportData']);
        // make the spy return a synchronous Observable with the test data
        getDataSpy = mockEditionDataService.getEditionReportData.and.returnValue(observableOf({})); // TODO: provide real test data

        TestBed.configureTestingModule({
            imports: [NgbModalModule, RouterTestingModule],
            declarations: [
                CompileHtmlComponent,
                ReportComponent,
                HeadingStubComponent,
                SourcesStubComponent,
                TextcritisStubComponent,
                ModalComponent
            ],
            providers: [{ provide: EditionDataService, useValue: mockEditionDataService }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReportComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('AFTER initial data binding', () => {
        beforeEach(() => {
            // trigger initial data binding
            fixture.detectChanges();
        });

        it('should have called `getData()`', () => {
            // `getEditionReportData()` called immediately after init
            expect(getDataSpy.calls.any()).toBe(true, 'getData called');
        });
    });
});

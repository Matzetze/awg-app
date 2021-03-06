/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterLinkStubDirective } from '@testing/router-stubs';

import { CompileHtmlComponent } from '@awg-shared/compile-html';
import { SourceEvaluationComponent } from './source-evaluation.component';

describe('SourceEvaluationComponent', () => {
    let component: SourceEvaluationComponent;
    let fixture: ComponentFixture<SourceEvaluationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SourceEvaluationComponent, CompileHtmlComponent, RouterLinkStubDirective]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SourceEvaluationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

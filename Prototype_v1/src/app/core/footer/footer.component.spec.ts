/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { RouterLinkStubDirective } from '@testing/router-stubs';

import { FooterComponent } from './footer.component';
import { FooterLogoComponent } from './footer-logo/footer-logo.component';
import { Logos, Meta } from '@awg-core/core-models';

/**
 * Testing Variables
 */
let component: FooterComponent;
let fixture: ComponentFixture<FooterComponent>;

let expectedMeta: Meta;
let expectedLogos: Logos;

let linkDes;
let routerLinks;

/***************************
 *
 * Tests for FooterComponent
 *
 ***************************/
describe('FooterComponent', () => {
    describe('> stand-alone setup', standAloneSetup);
});

///////////////////////////////
/**
 * Testing the component for itself (stand-alone)
 */
function standAloneSetup() {
    // Configuration of TestModule
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FooterComponent, FooterLogoComponent, RouterLinkStubDirective]
        }).compileComponents();
    }));

    beforeEach(() => {
        // create Component & return ComponentFixture
        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('BEFORE initial data binding', () => {
        it('should not have metaData', () => {
            expect(component.meta).toBeUndefined();
        });

        it('should contain footer logo component (real)', () => {
            const footerLogoEl = fixture.debugElement.query(By.directive(FooterLogoComponent));
            expect(footerLogoEl).toBeTruthy();
        });
    });

    describe('AFTER initial data binding', () => {
        // pretend that the component was wired to something that supplied a metaData
        beforeEach(() => {
            // mock the input values supplied by the parent component
            expectedMeta = new Meta();
            expectedMeta['page'] = {
                yearStart: 2015,
                yearRecent: 2017,
                version: '1.0.0',
                versionReleaseDate: '8. November 2016'
            };
            expectedLogos = {
                unibas: {
                    id: 'unibaslogo',
                    src: 'assets/img/uni.svg',
                    alt: 'Logo Uni Basel',
                    href: 'http://www.unibas.ch'
                },
                snf: { id: 'snflogo', src: 'assets/img/snf.jpg', alt: 'Logo SNF', href: 'http://www.snf.ch' }
            };

            // simulate the parent setting the input properties
            component.meta = expectedMeta;
            component.logos = expectedLogos;

            // trigger initial data binding
            fixture.detectChanges();
        });

        it('should have metaData', () => {
            expect(component.meta).toBeDefined();
        });

        it('should display values', () => {
            const expectedVersion = expectedMeta.page.version;
            const expectedVersionDate = expectedMeta.page.versionReleaseDate;
            const expectedYearStart = expectedMeta.page.yearStart;
            const expectedYearRecent = expectedMeta.page.yearRecent;

            // find debug elements
            const versionDe = fixture.debugElement.query(By.css('#version'));
            const versionDateDe = fixture.debugElement.query(By.css('#versionDate'));
            const copyDe = fixture.debugElement.query(By.css('#copyrightPeriod'));

            // find native elements
            const versionEl = versionDe.nativeElement;
            const versionDateEl = versionDateDe.nativeElement;
            const copyEl = copyDe.nativeElement;

            expect(versionEl.textContent).toContain(expectedVersion);
            expect(versionDateEl.textContent).toContain(expectedVersionDate);
            expect(copyEl.textContent).toContain(expectedYearStart + '–' + expectedYearRecent);
        });

        it('should pass down logos to footer logo component', () => {
            const footerLogoEl = fixture.debugElement.queryAll(By.directive(FooterLogoComponent));
            const footerLogoCmps = [];
            footerLogoEl.forEach(el => {
                footerLogoCmps.push(el.injector.get(FooterLogoComponent) as FooterLogoComponent);
            });

            expect(footerLogoCmps.length).toBe(2, 'should have 2 footer logos');

            expect(footerLogoCmps[0].logo).toBeTruthy();
            expect(footerLogoCmps[0].logo).toBe(expectedLogos.unibas, 'should have unibas logo');

            expect(footerLogoCmps[1].logo).toBeTruthy();
            expect(footerLogoCmps[1].logo).toBe(expectedLogos.snf, 'should have snf logo');
        });

        describe('[routerLink]', () => {
            beforeEach(() => {
                // find DebugElements with an attached RouterLinkStubDirective
                linkDes = fixture.debugElement.queryAll(By.directive(RouterLinkStubDirective));

                // get attached link directive instances using each DebugElement's injector
                routerLinks = linkDes.map(de => de.injector.get(RouterLinkStubDirective));
            });

            it('... can get routerLink from template', () => {
                expect(routerLinks.length).toBe(1, 'should have 1 routerLink');
                console.log(routerLinks);
                expect(routerLinks[0].linkParams[0]).toBe('/contact');
            });

            it('... can click Contact link in template', () => {
                const contactLinkDe = linkDes[0]; // contact link DebugElement
                const contactLink = routerLinks[0]; // contact link directive

                expect(contactLink.navigatedTo).toBeNull('should not have navigated yet');

                contactLinkDe.triggerEventHandler('click', null);
                fixture.detectChanges();

                expect(contactLink.navigatedTo[0]).toBe('/contact');
            });
        });
    });
}

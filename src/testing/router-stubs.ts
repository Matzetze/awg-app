/* tslint:disable:no-input-rename */
/* tslint:disable:directive-selector component-selector */
import { Component, Directive, HostListener, Injectable, Input, NgModule } from '@angular/core';
import { NavigationExtras, QueryParamsHandling } from '@angular/router';

import { AppModule } from '@awg-app/app.module';

// #docregion router-link-stub
/**
 * A RouterLink test double (stub) with a `click` listener.
 *
 * Use the `routerLink` input to set the `navigatedTo` value
 * after click.
 */
@Directive({
    selector: '[routerLink]'
})
export class RouterLinkStubDirective {
    /**
     * Input with navigation parameters.
     */
    @Input('routerLink')
    linkParams: any;

    /**
     * Input with query parameters.
     */
    @Input('queryParams')
    queryParams?: any;

    /**
     * Input with query param handling option.
     */
    @Input('queryParamsHandling')
    queryParamsHandling?: QueryParamsHandling = '';

    /**
     * The router params after navigation.
     */
    navigatedTo: any = null;

    /**
     * Listener that sets the navigation target after click.
     */
    @HostListener('click')
    onClick() {
        this.navigatedTo = this.linkParams;
    }
}
// #enddocregion router-link-stub

// #docregion router-outlet-stub
/**
 * A RouterOutlet test double (stub).
 */
@Component({
    selector: 'router-outlet',
    template: ''
})
export class RouterOutletStubComponent {}
// #enddocregion router-outlet-stub

// #docregion router-stub
/**
 * A Router test double (stub) for components that use the Router.
 *
 * Use the `navigate()` method to set the next navigation target.
 */
@Injectable()
export class RouterStub {
    /**
     * A`router.navigate` test double (stub)
     * to navigate to the next target.
     *
     * @params {any[]} commands - Array of navigation commands
     * @params {NavigationExtras} [extras] - Optional NavigationExtras
     *
     * @returns {void}
     */
    navigate(commands: any[], extras?: NavigationExtras): void {}
}
// #enddocregion router-stub

// #docregion activated-route-stub
import { convertToParamMap, ParamMap, Params } from '@angular/router';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

/**
 * An ActivatedRoute test double (stub) with a `paramMap` observable.
 *
 * Use the `setParamMap()` method to add the next `paramMap` value.
 */
@Injectable()
export class ActivatedRouteStub {
    /**
     * Private BehaviorSubject to handle test route parameters.
     */
    private paramSubject = new BehaviorSubject(this.testParams);

    /**
     * Readonly ActivatedRoute.params test double (stub)
     * as observable (`BehaviorSubject`).
     */
    readonly params = this.paramSubject.asObservable();

    /**
     * Private variable for test parameters.
     */
    private _testParams: {};

    /**
     * Getter for test route parameters.
     * @returns The latest test route parameters.
     */
    get testParams() {
        return this._testParams;
    }

    /**
     * Setter for test route parameters.
     * @param params The test route parameters to be set.
     */
    set testParams(params: {}) {
        this._testParams = params;
        this.paramSubject.next(params);
    }

    /**
     * Getter for the ActivatedRoute.snapshot.params.
     * @returns Snapshot of the test route parameters.
     */
    get snapshot() {
        return { params: this.testParams };
    }

    /**
     * Private ReplaySubject to handle route paramMaps.
     */
    private paramMapSubject = new ReplaySubject<ParamMap>();

    /**
     * Constructor for the ActivatedRoute.paramMap test double (stub).
     *
     * @param {Params} [initialParams] The optional initial route parameters.
     */
    constructor(initialParams?: Params) {
        this.setParamMap(initialParams);
    }

    /**
     * An ActivatedRoute.paramMap test double (stub)
     * as observable (`ReplaySubject`).
     */
    readonly paramMap = this.paramMapSubject.asObservable();

    /**
     * Set the paramMap observable's next value.
     *
     * @param {Params} [params] The optional route parameters to be set.
     */
    setParamMap(params?: Params) {
        this.paramMapSubject.next(convertToParamMap(params));
    }
}
// #enddocregion activated-route-stub

/**
 * A fake router module.
 *
 * Needed so that `aot` build is working. But it isn't used throughout our tests and/or app.
 */
@NgModule({
    imports: [AppModule],
    declarations: [RouterLinkStubDirective, RouterOutletStubComponent]
})
export class FakeRouterModule {}

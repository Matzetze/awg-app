import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import Spy = jasmine.Spy;
import { Type } from '@angular/core';
import { CompileHtmlComponent } from '@awg-shared/compile-html';

// global helper functions for expects

/* get debug element and check for its existence and length*/
export function getAndExpectDebugElementByCss(
    inDe: DebugElement,
    selector: string,
    length: number,
    expLength: number,
    suffixMsg?: string
): DebugElement[] {
    const outDe = inDe.queryAll(By.css(selector));

    if (!suffixMsg) {
        suffixMsg = '';
    }

    expectDebugElement(outDe, selector, length, expLength, suffixMsg);

    return outDe;
}

export function getAndExpectDebugElementByDirective(
    inDe: DebugElement,
    selectorType: Type<any>,
    length: number,
    expLength: number,
    suffixMsg?: string
): DebugElement[] {
    const outDe = inDe.queryAll(By.directive(selectorType));

    if (!suffixMsg) {
        suffixMsg = '';
    }

    expectDebugElement(outDe, selectorType, length, expLength, suffixMsg);

    return outDe;
}

export function expectDebugElement(
    de: DebugElement[],
    selector: string | Type<any>,
    length: number,
    expLength: number,
    suffixMsg: string
): void {
    if (selector instanceof Type) {
        selector = selector.name;
    }
    const failMsg = suffixMsg
        ? `should have ${expLength} ${selector} ${suffixMsg}`
        : `should have ${expLength} ${selector}`;

    expect(de).toBeDefined();
    expect(de.length).toBe(length, failMsg);
}

/* check if, how often and with which arguments a spy has been called */
export function expectSpyCall(spy: Spy, nTimes: number, expectedValue?: any) {
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(nTimes);
    if (expectedValue) {
        expect(spy.calls.mostRecent().args[0]).toBe(expectedValue);
    }
}

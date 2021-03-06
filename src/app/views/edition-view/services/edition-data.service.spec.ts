import { async, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Data } from '@angular/router';

import {
    EditionConstants,
    EditionWorks,
    EditionWork,
    SourceList,
    SourceDescriptionList,
    SourceEvaluationList,
    TextcriticsList,
    Source
} from '@awg-views/edition-view/models';

import { EditionDataService } from './edition-data.service';

describe('EditionDataService', () => {
    let editionDataService: EditionDataService;

    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;

    let expectedEditionWork: EditionWork;

    const expectedBASE = `${EditionConstants.editionAssets.baseRoute}/series1/section5/op12`; // TODO: generate from EditionWorks
    const regexBase = new RegExp(expectedBASE);
    const expectedFolioConvoluteFilePath = `${expectedBASE}/${EditionConstants.editionAssets.folioConvoluteFile}`;
    const expectedSheetsFilePath = `${expectedBASE}/${EditionConstants.editionAssets.svgSheetsFile}`;
    const expectedSourceListFilePath = `${expectedBASE}/${EditionConstants.editionAssets.sourceListFile}`;
    const expectedSourceDescriptionFilePath = `${expectedBASE}/${EditionConstants.editionAssets.sourceDescriptionListFile}`;
    const expectedSourceEvaluationFilePath = `${expectedBASE}/${EditionConstants.editionAssets.sourceEvaluationListFile}`;
    const expectedTextcriticsFilePath = `${expectedBASE}/${EditionConstants.editionAssets.textcriticsFile}`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, HttpClientTestingModule],
            providers: [EditionDataService]
        });
        // inject services and http client handler
        editionDataService = TestBed.get(EditionDataService);
        httpClient = TestBed.get(HttpClient);
        httpTestingController = TestBed.get(HttpTestingController);

        // data
        expectedEditionWork = EditionWorks.op12;
    });

    // after every test, assert that there are no more pending requests
    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(editionDataService).toBeTruthy();
    });

    describe('httpTestingController', () => {
        it(`... should issue a mocked http get request`, async(() => {
            const testData: Data = { name: 'TestData' };

            httpClient.get<Data>('/foo/bar').subscribe(data => {
                expect(data).toEqual(testData);
            });

            // match the request url
            const call = httpTestingController.expectOne({
                url: '/foo/bar'
            });

            // check for GET request
            expect(call.request.method).toBe('GET');

            // respond with mocked data
            call.flush(testData);
        }));
    });

    describe('#getEditionDetailData', () => {
        describe('request', () => {
            it(`... should perform an HTTP GET request to convolute, sheets & textcritics file`, async(() => {
                // call service function
                editionDataService.getEditionDetailData(expectedEditionWork).subscribe();

                // expect one request to to every file with given settings
                const call = httpTestingController.match((req: HttpRequest<any>) => {
                    return req.method === 'GET' && req.responseType === 'json' && regexBase.test(req.url);
                });

                expect(call.length).toBe(3);
                expect(call[0].request.method).toBe('GET', 'should be GET');
                expect(call[1].request.method).toBe('GET', 'should be GET');
                expect(call[2].request.method).toBe('GET', 'should be GET');
                expect(call[0].request.responseType).toBe('json', 'should be json');
                expect(call[1].request.responseType).toBe('json', 'should be json');
                expect(call[2].request.responseType).toBe('json', 'should be json');
                expect(call[0].request.url).toBe(
                    expectedFolioConvoluteFilePath,
                    `should be ${expectedFolioConvoluteFilePath}`
                );
                expect(call[1].request.url).toBe(expectedSheetsFilePath, `should be ${expectedSheetsFilePath}`);
                expect(call[2].request.url).toBe(
                    expectedTextcriticsFilePath,
                    `should be ${expectedTextcriticsFilePath}`
                );
            }));
        });
    });

    describe('#getEditionReportData', () => {
        describe('request', () => {
            it(`... should perform an HTTP GET request to sourceList, sourceDescription, sourceEvaluation & textcritics file`, async(() => {
                // call service function
                editionDataService.getEditionReportData(expectedEditionWork).subscribe();

                // expect one request to to every file with given settings
                const call = httpTestingController.match((req: HttpRequest<any>) => {
                    return req.method === 'GET' && req.responseType === 'json' && regexBase.test(req.url);
                });

                expect(call.length).toEqual(4);
                expect(call[0].request.method).toBe('GET', 'should be GET');
                expect(call[1].request.method).toBe('GET', 'should be GET');
                expect(call[2].request.method).toBe('GET', 'should be GET');
                expect(call[3].request.method).toBe('GET', 'should be GET');
                expect(call[0].request.responseType).toBe('json', 'should be json');
                expect(call[1].request.responseType).toBe('json', 'should be json');
                expect(call[2].request.responseType).toBe('json', 'should be json');
                expect(call[3].request.responseType).toBe('json', 'should be json');
                expect(call[0].request.url).toBe(expectedSourceListFilePath, `should be ${expectedSourceListFilePath}`);
                expect(call[1].request.url).toBe(
                    expectedSourceDescriptionFilePath,
                    `should be ${expectedSourceDescriptionFilePath}`
                );
                expect(call[2].request.url).toBe(
                    expectedSourceEvaluationFilePath,
                    `should be ${expectedSourceEvaluationFilePath}`
                );
                expect(call[3].request.url).toBe(
                    expectedTextcriticsFilePath,
                    `should be ${expectedTextcriticsFilePath}`
                );
            }));
        });

        describe('response', () => {
            describe('success', () => {
                it('... should return a forkJoined Observable(SourceList, SourceDescriptionList, SourceEvaluationList,  TextcriticsList)', async(() => {
                    const expectedResult = [
                        new SourceList(),
                        new SourceDescriptionList(),
                        new SourceEvaluationList(),
                        new TextcriticsList()
                    ];

                    // call service function (success)
                    editionDataService.getEditionReportData(expectedEditionWork).subscribe(res => {
                        expect(res).toBeTruthy();
                        expect<number>(res.length).toEqual(expectedResult.length, `should be ${expectedResult.length}`);
                        expect(res).toEqual(expectedResult, `should be ${expectedResult}`);
                    });

                    // expect one request to to every file with given settings
                    const call = httpTestingController.match((req: HttpRequest<any>) => {
                        return req.method === 'GET' && req.responseType === 'json' && regexBase.test(req.url);
                    });

                    expect(call.length).toEqual(expectedResult.length);
                    expect(call[0].request.method).toBe('GET', 'should be GET');
                    expect(call[1].request.method).toBe('GET', 'should be GET');
                    expect(call[2].request.method).toBe('GET', 'should be GET');
                    expect(call[3].request.method).toBe('GET', 'should be GET');
                    expect(call[0].request.responseType).toBe('json', 'should be json');
                    expect(call[1].request.responseType).toBe('json', 'should be json');
                    expect(call[2].request.responseType).toBe('json', 'should be json');
                    expect(call[3].request.responseType).toBe('json', 'should be json');
                    expect(call[0].request.url).toBe(
                        expectedSourceListFilePath,
                        `should be ${expectedSourceListFilePath}`
                    );
                    expect(call[1].request.url).toBe(
                        expectedSourceDescriptionFilePath,
                        `should be ${expectedSourceDescriptionFilePath}`
                    );
                    expect(call[2].request.url).toBe(
                        expectedSourceEvaluationFilePath,
                        `should be ${expectedSourceEvaluationFilePath}`
                    );
                    expect(call[3].request.url).toBe(
                        expectedTextcriticsFilePath,
                        `should be ${expectedTextcriticsFilePath}`
                    );

                    // mock input from HTTP request
                    call[0].flush(expectedResult[0]);
                    call[1].flush(expectedResult[1]);
                    call[2].flush(expectedResult[2]);
                    call[3].flush(expectedResult[3]);
                }));
            });

            describe('fail', () => {
                it(`... should return [[], [], [], []] if all requests failed`, async(() => {
                    const expectedResult = [
                        new SourceList(),
                        new SourceDescriptionList(),
                        new SourceEvaluationList(),
                        new TextcriticsList()
                    ];

                    // call service function (success)
                    editionDataService.getEditionReportData(expectedEditionWork).subscribe((res: any) => {
                        expect(res.length).toBe(expectedResult.length, `should be ${expectedResult.length}`);
                        expect(res[0]).toEqual([], `should be empty array`);
                        expect(res[1]).toEqual([], `should be empty array`);
                        expect(res[2]).toEqual([], `should be empty array`);
                        expect(res[3]).toEqual([], `should be empty array`);
                    });

                    // expect one request to to every file with given settings
                    const call = httpTestingController.match((req: HttpRequest<any>) => {
                        return req.method === 'GET' && req.responseType === 'json' && regexBase.test(req.url);
                    });

                    call[0].error(null, new HttpErrorResponse({ error: 'ERROR_LOADING_SOURCELIST' }));
                    call[1].error(null, new HttpErrorResponse({ error: 'ERROR_LOADING_SOURCELISTDESCRIPTION' }));
                    call[2].error(null, new HttpErrorResponse({ error: 'ERROR_LOADING_SOURCELISTEVALUATION' }));
                    call[3].error(null, new HttpErrorResponse({ error: 'ERROR_LOADING_TEXTCRITICS' }));
                }));

                it(`... should return [sourceList, [], [], []] if all but sourceList requests failed`, async(() => {
                    const expectedResult = [
                        new SourceList(),
                        new SourceDescriptionList(),
                        new SourceEvaluationList(),
                        new TextcriticsList()
                    ];

                    // call service function (success)
                    editionDataService.getEditionReportData(expectedEditionWork).subscribe((res: any) => {
                        expect(res.length).toBe(expectedResult.length, `should be ${expectedResult.length}`);
                        expect(res[0]).toBe(expectedResult[0], `should be ${expectedResult[0]}`);
                        expect(res[1]).toEqual([], `should be empty array`);
                        expect(res[2]).toEqual([], `should be empty array`);
                        expect(res[3]).toEqual([], `should be empty array`);
                    });

                    // expect one request to to every file with given settings
                    const call = httpTestingController.match((req: HttpRequest<any>) => {
                        return req.method === 'GET' && req.responseType === 'json' && regexBase.test(req.url);
                    });

                    call[0].flush(expectedResult[0]);
                    call[1].error(new ErrorEvent('ERROR_LOADING_SOURCELISTDESCRIPTION'));
                    call[2].error(new ErrorEvent('ERROR_LOADING_SOURCELISTEVALUATION'));
                    call[3].error(new ErrorEvent('ERROR_LOADING_TEXTCRITICS'));
                }));

                it(`... should return [sourcelist, SourceDescriptionList, SourceEvaluationList, []] if textcritics request failed`, async(() => {
                    const expectedResult = [
                        new SourceList(),
                        new SourceDescriptionList(),
                        new SourceEvaluationList(),
                        new TextcriticsList()
                    ];

                    // call service function (success)
                    editionDataService.getEditionReportData(expectedEditionWork).subscribe((res: any) => {
                        expect(res.length).toBe(expectedResult.length, `should be ${expectedResult.length}`);
                        expect(res[0]).toBe(expectedResult[0], `should be ${expectedResult[0]}`);
                        expect(res[1]).toBe(expectedResult[1], `should be ${expectedResult[1]}`);
                        expect(res[2]).toBe(expectedResult[2], `should be ${expectedResult[2]}`);
                        expect(res[3]).toEqual([], `should be empty array`);
                    });

                    // expect one request to to every file with given settings
                    const call = httpTestingController.match((req: HttpRequest<any>) => {
                        return req.method === 'GET' && req.responseType === 'json' && regexBase.test(req.url);
                    });

                    call[0].flush(expectedResult[0]);
                    call[1].flush(expectedResult[1]);
                    call[2].flush(expectedResult[2]);
                    call[3].error(null, new HttpErrorResponse({ error: 'ERROR_LOADING_TEXTCRITICS' }));
                }));

                it(`... should return [sourceList, [], [], textcritics] if middle requests failed`, async(() => {
                    const expectedResult = [
                        new SourceList(),
                        new SourceDescriptionList(),
                        new SourceEvaluationList(),
                        new TextcriticsList()
                    ];

                    // call service function (success)
                    editionDataService.getEditionReportData(expectedEditionWork).subscribe((res: any) => {
                        expect(res.length).toEqual(expectedResult.length, `should be ${expectedResult.length}`);
                        expect(res[0]).toBe(expectedResult[0], `should be ${expectedResult[0]}`);
                        expect(res[1]).toEqual([], `should be empty array`);
                        expect(res[2]).toEqual([], `should be empty array`);
                        expect(res[3]).toBe(expectedResult[3], `should be ${expectedResult[3]}`);
                    });

                    // expect one request to to every file with given settings
                    const call = httpTestingController.match((req: HttpRequest<any>) => {
                        return req.method === 'GET' && req.responseType === 'json' && regexBase.test(req.url);
                    });

                    call[0].flush(expectedResult[0]);
                    call[1].error(null, new HttpErrorResponse({ error: 'ERROR_LOADING_SOURCEDESCRIPTIONLIST' }));
                    call[2].error(null, new HttpErrorResponse({ error: 'ERROR_LOADING_SOURCEEVALUATIONLIST' }));
                    call[3].flush(expectedResult[3]);
                }));

                it(`... should return [[], descriptionList, evaluationList, textcritics] if sourcelist request failed`, async(() => {
                    const expectedResult = [
                        new SourceList(),
                        new SourceDescriptionList(),
                        new SourceEvaluationList(),
                        new TextcriticsList()
                    ];

                    // call service function (success)
                    editionDataService.getEditionReportData(expectedEditionWork).subscribe((res: any) => {
                        expect(res.length).toEqual(expectedResult.length, `should be ${expectedResult.length}`);
                        expect(res[0]).toEqual([], `should be empty array`);
                        expect(res[1]).toBe(expectedResult[1], `should be ${expectedResult[1]}`);
                        expect(res[2]).toBe(expectedResult[2], `should be ${expectedResult[2]}`);
                        expect(res[3]).toBe(expectedResult[3], `should be ${expectedResult[3]}`);
                    });

                    // expect one request to to every file with given settings
                    const call = httpTestingController.match((req: HttpRequest<any>) => {
                        return req.method === 'GET' && req.responseType === 'json' && regexBase.test(req.url);
                    });

                    call[0].error(null, new HttpErrorResponse({ error: 'ERROR_LOADING_SOURCELIST' }));
                    call[1].flush(expectedResult[1]);
                    call[2].flush(expectedResult[2]);
                    call[3].flush(expectedResult[3]);
                }));
            });
        });
    });
});

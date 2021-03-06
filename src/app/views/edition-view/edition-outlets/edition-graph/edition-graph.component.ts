import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { EditionConstants, EditionWork, GraphList } from '@awg-views/edition-view/models';
import { EditionDataService, EditionService } from '@awg-views/edition-view/services';

/**
 * The EditionGraph component.
 *
 * It contains the graph section
 * of the edition view of the app.
 */
@Component({
    selector: 'awg-edition-graph',
    templateUrl: './edition-graph.component.html',
    styleUrls: ['./edition-graph.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionGraphComponent implements OnInit {
    /**
     * Public variable: editionWork.
     *
     * It keeps the information about the current composition.
     */
    editionWork: EditionWork;

    /**
     * Public variable: editionGraphData$.
     *
     * It keeps the observable of the edition graph data.
     */
    editionGraphData$: Observable<GraphList>;

    /**
     * Readonly constant: graphImages.
     *
     * It keeps the paths to static graph images.
     */
    readonly graphImages = {
        op12: '',
        op25: EditionConstants.graphImageOp25.route
    };

    /**
     * Public variable: errorObject.
     *
     * It keeps an errorObject for the service calls.
     */
    errorObject = null;

    /**
     * Self-referring variable needed for CompileHtml library.
     */
    ref: EditionGraphComponent;

    /**
     * Constructor of the EditionGraphComponent.
     *
     * It declares a private instances of
     * the EditionDataService and EditionService.
     *
     * @param {EditionDataService} editionDataService Instance of the EditionDataService.
     * @param {EditionService} editionService Instance of the EditionService.
     */
    constructor(private editionDataService: EditionDataService, private editionService: EditionService) {
        this.ref = this;
    }

    /**
     * Angular life cycle hook: ngOnInit.
     *
     * It calls the containing methods
     * when initializing the component.
     */
    ngOnInit() {
        this.getEditionGraphData();
    }

    /**
     * Public method: getEditionGraphData.
     *
     * It gets the the current edition work of the edition service
     * and the observable of the corresponding graph data
     * from the EditionDataService.
     *
     * @returns {void} Gets the current edition work and the corresponding graph data.
     */
    getEditionGraphData(): void {
        this.editionGraphData$ = this.editionService
            // get current editionWork from editionService
            .getEditionWork()
            .pipe(
                switchMap((work: EditionWork) => {
                    // set current editionWork
                    this.editionWork = work;
                    // get graph data from editionDataService
                    return this.editionDataService.getEditionGraphData(this.editionWork);
                }),
                // error handling
                catchError(err => {
                    this.errorObject = err;
                    return throwError(err);
                })
            );
    }
}

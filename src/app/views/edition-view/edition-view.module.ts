import { NgModule } from '@angular/core';
import { SharedModule } from '@awg-shared/shared.module';

import { EditionDetailModule } from './edition-outlets/edition-detail/edition-detail.module';
import { EditionIntroModule } from './edition-outlets/edition-intro/edition-intro.module';
import { EditionGraphModule } from './edition-outlets/edition-graph/edition-graph.module';
import { ReportModule } from './edition-outlets/report/report.module';
/* Routing Module */
import { EditionViewRoutingModule, routedEditionViewComponents } from './edition-view-routing.module';

/**
 * The editionView module.
 *
 * It embeds the edition components and their
 * [routing definition]{@link EditionViewRoutingModule}
 * as well as the {@link EditionDetailModule},
 * {@link ReportModule} and {@link SharedModule}.
 */
@NgModule({
    imports: [
        SharedModule,
        EditionDetailModule,
        EditionGraphModule,
        EditionIntroModule,
        ReportModule,
        EditionViewRoutingModule
    ],
    declarations: [routedEditionViewComponents]
})
export class EditionViewModule {}

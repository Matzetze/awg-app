import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EditionViewComponent } from './edition-view.component';
import { EditionDetailComponent } from './edition-outlets/edition-detail';
import { EditionOverviewComponent } from './edition-outlets/edition-overview.component';
import { IntroComponent } from './edition-outlets/intro';
import { ReportComponent } from './edition-outlets/report';

/* routes of the EditionModule */
const editionRoutes: Routes = [
    {
        path: '',
        component: EditionViewComponent,
        children: [
            {
                path: '',
                component: EditionOverviewComponent,
                children: [
                    { path: 'intro', component: IntroComponent },
                    { path: 'detail', component: EditionDetailComponent },
                    { path: 'detail/:id', component: EditionDetailComponent },
                    { path: 'report', component: ReportComponent }
                ]
            }
        ]
    }
];

/**
 * Routed components of the {@link EditionModule}:
 * {@link IntroComponent}, {@link EditionDetailComponent},
 * {@link ReportComponent}.
 */
export const routedEditionComponents = [
    EditionViewComponent,
    EditionDetailComponent,
    IntroComponent,
    EditionOverviewComponent,
    ReportComponent
];

/**
 * Edition module routing.
 *
 * It activates the editionRoutes.
 */
@NgModule({
    imports: [RouterModule.forChild(editionRoutes)],
    exports: [RouterModule]
})
export class EditionRoutingModule {}

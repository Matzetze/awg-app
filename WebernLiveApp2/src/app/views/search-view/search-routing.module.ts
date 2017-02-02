import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchViewComponent } from './search-view.component';

import { BibliographyComponent } from './search-outlets/bibliography/bibliography.component';
import { BibliographyDetailComponent } from './search-outlets/bibliography/bibliography-detail/bibliography-detail.component';
import { SearchFormComponent } from './search-outlets/search-panel/search-form/search-form.component';
import { SearchOverviewComponent } from './search-outlets/search-overview.component';
import { SearchPanelComponent } from './search-outlets/search-panel/search-panel.component';
import { SearchResultsComponent } from './search-outlets/search-panel/search-results/search-results.component';
import { SearchResultDetailComponent } from './search-outlets/search-panel/search-result-detail/search-result-detail.component';
import { TimelineComponent } from './search-outlets/timeline/timeline.component';


const searchRoutes: Routes = [
    { path: 'search',  component: SearchViewComponent,
        children: [
            { path: '', component: SearchOverviewComponent,
                children: [
                    { path: 'fulltext', component: SearchPanelComponent,
                        /*
                        children: [
                            { path: 'form', component: SearchFormComponent },
                            { path: 'results', component: SearchResultsComponent },
                            { path: 'result/:id', component: SearchResultDetailComponent }
                        ]*/
                    },
                    { path: 'timeline', component: TimelineComponent },
                    { path: 'bibliography', component: BibliographyComponent,
                        children: [
                            { path: 'detail/:id', component: BibliographyDetailComponent }
                        ]
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [ RouterModule.forChild(searchRoutes) ],
    exports: [ RouterModule ]

})
export class SearchRoutingModule { }

export const routedComponents = [
    SearchViewComponent,
    BibliographyComponent,
    BibliographyDetailComponent,
    SearchOverviewComponent,
    SearchPanelComponent,
    SearchResultsComponent,
    SearchResultDetailComponent,
    TimelineComponent
];

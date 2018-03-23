import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { BibliographyRoutingModule, routedComponents} from './bibliography-routing.module';

import { BibliographySearchComponent } from './bibliography-search/bibliography-search.component';
import { BibliographyListComponent } from './bibliography-list/bibliography-list.component';
import { BibliographyFormatPipe } from './bibliography-format.pipe';

import { BibliographyService } from '../../services';

@NgModule({
    imports: [
        SharedModule,
        BibliographyRoutingModule
    ],
    declarations: [
        routedComponents,
        BibliographySearchComponent,
        BibliographyListComponent,
        BibliographyFormatPipe
    ],
    exports: [
        routedComponents,
        BibliographySearchComponent,
        BibliographyListComponent,
        BibliographyFormatPipe
    ],
    providers: [ BibliographyService ]
})
export class BibliographyModule { }

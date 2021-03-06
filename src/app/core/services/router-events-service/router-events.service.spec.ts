import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { RouterEventsService } from './router-events.service';

describe('RouterEventsService', () => {
    let routerEventsService: RouterEventsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [RouterEventsService]
        });

        // inject service
        routerEventsService = TestBed.get(RouterEventsService);
    });

    it('should be created', () => {
        expect(routerEventsService).toBeTruthy();
    });
});

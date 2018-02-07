import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ResourceDetailContent } from '../../../../models';

@Component({
    selector: 'awg-resource-detail-html-content',
    templateUrl: './resource-detail-html-content.component.html',
    styleUrls: [
        './resource-detail-html-content.component.css',
        '../resource-detail-html.component.css',
    ]
})
export class ResourceDetailHtmlContentComponent implements OnInit {
    @Input() content: ResourceDetailContent;
    @Output() resourceRequest: EventEmitter<string> = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }


    navigateToResource(id?: string): void {
        if (id) { id.toString(); }
        this.resourceRequest.emit(id);
    }


    navigateToSearchResults(): void {
        // TODO navigation to image or connected objects details
        console.log('ResourceDetailHtmlContent# got navigation request');
    }


}

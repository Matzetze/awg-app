import { Injectable } from '@angular/core';

import { ApiService } from '../api-service/api.service';
import { ResourceFullResponseJson, SearchResponseJson } from '../../../shared/api-objects';

import {
    ResourceDetail,
    ResourceDetailHeader,
    ResourceDetailIncomingLinks,
    ResourceDetailProps
} from '../../../views/search-view/resource-detail-models';
import {IncomingItemJson} from "../../../shared/api-objects/resource-response-formats/src/incoming-item-json";
import {Observable} from "rxjs/Observable";

declare var htmlConverter;
declare var dateConverter;

@Injectable()
export class ConversionService extends ApiService {

    /******************************************
     *
     *  convert full text search results
     *  for displaying
     *
     *****************************************/
    public convertFullTextSearchResults(results: SearchResponseJson): SearchResponseJson {
        results['subjects'].forEach(res => {
            // clean value labels
            res.valuelabel[0] = res.valuelabel[0].replace(' (Richtext)', '');
            res.obj_id = res.obj_id.replace('_-_local', '');

            // =>Chronologie: salsah standoff needs to be converted before displaying
            // valuetype_id 14 = valuelabel 'Ereignis'
            if (res.valuetype_id[0] == '14') {
                let htmlstr: string = this.convertStandoffToHTML(res.value[0]['utf8str'], res.value[0]['textattr']);

                // replace salsah links
                htmlstr = this.replaceSalsahLink(htmlstr);

                // strip & replace <p>-tags for displaying objtitle
                htmlstr = htmlstr.replace(/<\/p><p>/g, '<br />').replace(/<p>|<\/p>/g, '').replace(htmlstr, '«$&»');
                res.value[0] = htmlstr;
            }
        });
        return results;
    }


    /******************************************
     *
     * convert object properties for displaying
     *
     *****************************************/
    public convertObjectProperties(data: ResourceFullResponseJson) {
        let convObj = {};

        // add lastmod state
        convObj['lastmod'] = data['resinfo']['lastmod'];

        Object.keys(data['props']).forEach((key:string) => {
            let prop = data['props'][key];
            let propValue:[string] = [''];

            // check if values property is defined
            if ('values' in prop) {
                //check for gui-elements
                switch (prop.valuetype_id) {
                    case '4':
                        // DATE: salsah object needs to be converted (using plugin "dateConverter")
                        if (prop.values[0] !== '') {
                            propValue[0] = this.convertDateValue(prop.values[0]);
                        }
                        break; //END date

                    case '7':
                        // SELECTION PULLDOWN: selection nodes have to be read seperately
                        if (prop.values[0] !== '') {
                            // identify id of selection-list from prop.attributes
                            // e.g. "selection=66"
                            let selectionId: string = prop.attributes.split("=")[1].toString();

                            // get selection from salsah api
                            this.getSelectionsById(selectionId).subscribe(
                                (data: Object) => {
                                    let selectionArr = data['selection'];
                                    // localize id in selection-list object and identify the label
                                    for (let i = 0; i < selectionArr.length; i++) {
                                        if (prop.values[0] == selectionArr[i].id) {
                                            propValue[0] = selectionArr[i].label;
                                        }
                                    }
                                },
                                err => console.log(err)
                            );
                        } else {
                            // empty value
                            propValue[0] = '';
                        }
                        //TODO: doesn't work yet
                        console.log('convService#selectionOuterLoop: ', propValue[0]);
                        break; //END selection

                    case '14':
                        // RICHTEXT: salsah standoff needs to be converted

                        // check for multiple && not empty values
                        if (prop.values.length > 0 && prop.values[0].utf8str !== '') {
                            // clean value labels
                            prop.label = prop.label.replace(' (Richtext)', '');

                            for (let i = 0; i < prop.values.length; i++) {
                                // init
                                let htmlstr = '';

                                // convert linear salsah standoff to html (using plugin "convert_lin2html")
                                htmlstr = this.convertStandoffToHTML(prop.values[i].utf8str, prop.values[i].textattr);

                                // replace salsah links & <p>-tags
                                htmlstr = this.replaceSalsahLink(htmlstr);
                                htmlstr = htmlstr.replace('<p>', '').replace('</p>', '');

                                // trim string
                                propValue[i] = htmlstr.trim();

                                // replace bibliography links
                                if (prop.label == 'Online-Zugang') {
                                    propValue[i] = this.replaceBiblioLink(propValue[i]);
                                }
                            }

                            // empty values
                        } else {
                            propValue[0] = '';
                        };
                        break; // END richtext

                    default: // '1'=> TEXT: properties come as they are
                        if (prop.values[0] !== '')
                        {
                            for (let i = 0; i < prop.values.length; i++)
                            {
                                propValue[i] = prop.values[i].trim();
                            }
                        } else {
                            // empty text value
                            propValue[0] = '';
                        }
                } // END switch
                if (propValue.length > 1) {
                    convObj[prop.label] = propValue; // => array
                } else if (propValue.length === 1) {
                    convObj[prop.label] = propValue[0]; // => string
                }
            } // END if value

            // extract publication year from publication date
            /*
             TODO#add:
             let splitDate;
             if (splitDate = convObj['Publikationsdatum']) {
             let s = splitDate.split(' ');
             convObj['Jahr'] = s[s.length-1];
             }
             */

        }); // END forEach PROPS
        // TODO#rm
        // console.log('convObj: ', convObj );

        return convObj;
    } // END convertObjectProperties (func)


    public prepareRestrictedObject(data: ResourceFullResponseJson): ResourceDetail {
        let id = data.resdata.res_id;
        let detail: ResourceDetail = new ResourceDetail();
        detail['header'] = {
            'objID': id,
            'icon': 'http://www.salsah.org/app/icons/16x16/delete.png',
            'type': 'restricted',
            'title': 'Kein Zugriff auf dieses Objekt möglich',
            'lastmod': '---'
        };
        console.log('No access to resource: ', id);
        return detail;
    }

    public prepareAccessObject(data: ResourceFullResponseJson): ResourceDetail {
        // convert properties
        data = this.convertGUISpecificProps(data);

        // prepare parts of resourceDetail
        let detail: ResourceDetail = new ResourceDetail();
        detail = {
            header: this.prepareResourceDetailHeader(data),
            image: [''],
            incoming: this.prepareResourceDetailIncomingLinks(data.incoming),
            props: this.prepareResourceDetailProperties(data.props)
        };
        console.log('preparedDetail: ', detail);

        return detail;
    }


    private prepareResourceDetailHeader(data) {
        let header: ResourceDetailHeader = new ResourceDetailHeader();
        let info = data.resinfo;
        let id = data.resdata.res_id;
        let props = data.props;

        if (typeof info !== undefined) {
            // extract common default metadata for header
            header['objID'] = id;
            header['icon'] = info.restype_iconscrs;
            header['type'] = info.restype_label;
            header['lastmod'] = info.lastmod;

            // extract restype specific title metadata
            switch (info.restype_id) {
                // PERSON
                case '45':
                    const lname: string = props['salsah:lastname'].toHtml[0],
                        fname: string = props['salsah:firstname'].toHtml[0];
                    header['title'] = fname + ' ' + lname;
                    break;

                // KORRESPONDENZ (same as SUPPLEMENT)
                case '29':
                // SUPPLEMENT
                case '125':
                    header['title'] = props['dc:title'].toHtml[0] + '<br/>' + props['dc:date'].toHtml[0];
                    break;

                // WERK
                case '43':
                    header['title'] = props['dc:title'].toHtml[0];
                    break;

                // MUSIKSTÜCK (Moldenhauer-Nummer)
                case '36':
                    header['title'] = '[M ' + props['webern:mnr'].toHtml[0] + '] ' + props['dc:title'].toHtml[0];
                    break;

                // CHRONOLOGIE
                case '28':
                    // richtext value has already been converted in detail using plugin "convert_lin2html"
                    let htmlstr = props['webern:event_rt'].toHtml[0];

                    // strip & replace <p>-tags for displaying title
                    htmlstr = htmlstr.replace(/<\/p><p>/g, '<br />').replace(/<p>|<\/p>/g, '').replace(htmlstr, '«$&»');

                    header['title'] = htmlstr;
                    break;

                // DEFAULT
                default:
                    header['title'] = info.restype_description;

            }
        } else {
            // header for undefined object
            header = {
                'objID': id,
                'icon': 'http://www.salsah.org/app/icons/16x16/delete.png',
                'type': '---',
                'title': '---',
                'lastmod': '---'
            };
        }
        return header;
    }

    private prepareResourceDetailIncomingLinks(incoming: IncomingItemJson[]) {
        let incomingLinks: ResourceDetailIncomingLinks[] = [];
        incoming.forEach(ins => {
            incomingLinks.push({
                id: ins.ext_res_id.id,
                value: ins.value,
                icon: ins.resinfo.restype_iconsrc
            });
        });
        return incomingLinks;
    }

    private prepareResourceDetailProperties(props) {
        let detailProperties: ResourceDetailProps[] = [];

        // loop through property keys
        Object.keys(props).forEach((key: string) => {
            const prop: any = props[key];

            // clean value labels
            if (prop.label) {
                prop.label = prop.label.replace(' (Richtext)', '');
            }

            // push default values into searchDetailProperties
            detailProperties.push({
                pid: prop.pid,
                guielement: prop.guielement,
                label: prop.label,
                value: prop.toHtml
            });
        }); // END forEach props
        return detailProperties;
    };


    private convertGUISpecificProps(data) {
        // loop through all properties and add toHtml values
        Object.keys(data['props']).forEach((key: string) => {
            let prop = this.addHtmlValues(data['props'][key]);
            data['props'][key] = prop;
        });
        return data;
    };

    private addHtmlValues(prop, url?): [string] {
        prop['toHtml'] = [''];

        if (prop.values) {
            switch (prop.valuetype_id) {

                case '4':   // DATE: salsah object needs to be converted (using plugin "dateConverter")
                    for (let i = 0; i < prop.values.length; i++) {
                        prop['toHtml'][i] = this.convertDateValue(prop.values[i]);
                    }
                    break; // END date

                case '6':   // LINKVALUE (searchbox): links to another salsah object need to be converted
                    for (let i = 0; i < prop.values.length; i++) {
                        prop['toHtml'][i] = this.convertLinkValue(prop, i);
                    }
                    break; // END linkvalue

                case '7': // SELECTION (pulldown): selection nodes have to be read seperately
                    this.convertSelectionValue(prop);
                    break; // END selection

                case '12': // HLIST: hlist nodes have to be called seperately
                        this.convertHlistValue(prop);
                    break; // END hlist

                case '14':  // RICHTEXT: salsah standoff needs to be converted
                    for (let i = 0; i < prop.values.length; i++) {
                        prop['toHtml'][i] = this.convertRichtextValue(prop.values[i].utf8str, prop.values[i].textattr);
                    }
                    break; // END richtext
                /*
                 case '15': // GeoNAMES: GeoName nodes have to be converted
                 if (prop.values[0] !== '') {
                 // values[0] gives reference id to
                 // url + /api/geonames/{{:id}}?reqtype=node
                 // result is an array nodelist (properties: id, label, name) with nodes from 0 to n

                 // identify geonames gui-id from prop.values
                 // e.g. ["4136"] or ["4136", "4132"]
                 let geogui_id = prop.values;

                 for (let i = 0; i < geogui_id.length; i++) {
                 // get geonames gui data
                 $http.get(url + '/api/geonames/' + geogui_id[i] + '?reqtype=node').then(function (response){

                 // geo-object
                 let geo = {
                 data:           [],
                 label:          '',
                 label_string:   '',
                 label_url:      '',
                 gnid:           ''
                 };
                 geo.data = response.data.nodelist;

                 // get labels from nodelist array
                 geo.label_string = geo.data[0].label;
                 for (let j = 1; j < geo.data.length; j++) {
                 geo.label_string += ', ' + geo.data[j].label;
                 if (j == geo.data.length-1) {
                 // get geonames-id gnid from last array item
                 geo.gnid = geo.data[j].name.replace('gnid:', '');
                 // short label
                 geo.label = geo.data[j].label;
                 }
                 }

                 // include geonames icon & url to gnid, embedded in <p>-tags
                 geo.label_url = geo.label.replace(geo.label, '<p>$& <a href="http://www.geonames.org/' + geo.gnid + '" title="' + geo.label_string + '" target="_blank"><img src="img/geonames.png" height="25" width="25" alt="' + geo.label + '" /></a></p>')

                 propValue[0] += geo.label_url;
                 });
                 };
                 } else {
                 // EMPTY VALUE
                 propValue[0] = '';
                 };
                 break; // END geonames
                 */
                // '1' => TEXT: properties come as they are
                default:
                    for (let i = 0; i < prop.values.length; i++) {
                        prop['toHtml'][i] = prop.values[i];
                    }
            } // END switch
        } else {
            // console.log('empty prop.values for', prop.guielement.toUpperCase(), 'in property "', prop.label, '" :::: ');
        }
        return prop;
    }


    /******************************************
     *
     * convert date values
     *
     *****************************************/
    private convertDateValue(dateObj) {
        let date = dateConverter(dateObj);
        date = date.replace(' (G)', '');
        return date;
    }

    /******************************************
     *
     * convert hlist values
     *
     *****************************************/
    private convertHlistValue(prop) {
        // identify id of hlist from prop.attributes
        // e.g. "hlist=17"
        const hlistId: string = prop.attributes.split('=')[1].toString();

        // get hlist data
        return this.getHListById(hlistId).subscribe(
            (hlistData) => {
                let hlist = hlistData.hlist;
                console.info('propvalues: ', prop.values.length , ' HLIST: ', hlist.length);
                // localize id in hlist object and identify the label
                for (let i = 0; i < prop.values.length; i++) {
                    for (let j = 0; j < hlist.length; j++) {
                        if (prop.values[i] === hlist[j]['id']) {
                            prop['toHtml'][i] = hlist[j].label;
                        }
                    }
                }

            },
            err => console.log(err)
        );
    }

    /******************************************
     *
     * convert link values
     *
     *****************************************/
    private convertLinkValue(prop, i: number) {
        // add <a>-tag with click-directive; linktext is stored in "$&"
        return prop.value_firstprops[i].replace(prop.value_firstprops[i], '<a (click)="ref.showObject(' + prop.values[i] + ')">$& (' + prop.value_restype[i] + ')<a/>');
    }

    /******************************************
     *
     * convert richtext values
     *
     *****************************************/
    private convertRichtextValue(str: string, attr: string) {
        // convert salsah standoff to html (using plugin "convert_lin2html")
        let htmlstr: string = this.convertStandoffToHTML(str, attr);

        // replace salsah links
        htmlstr = this.replaceSalsahLink(htmlstr);

        return htmlstr;
    }

    // TODO: check if it is possible to unify with hlist conversion?
    /******************************************
     *
     * convert selection values
     *
     *****************************************/
    private convertSelectionValue(prop) {
        // identify id of selection-list from prop.attributes
        // e.g. "selection=66"
        const selectionId: string = prop.attributes.split('=')[1].toString();

        // get selection-list data
        return this.getSelectionsById(selectionId).subscribe(
            (selectionData) => {
                let selection = selectionData['selection'];
                // localize id in selection-list object and identify the label
                for (let i = 0; i < prop.values.length; i++) {
                    for (let j = 0; j < selection.length; j++) {
                        if (prop.values[i] === selection[j].id) {
                            prop['toHtml'][i] = selection[j].label;
                        }
                    }
                }
            },
            err => console.log(err)
        );
    }

    /******************************************
     *
     *  convert linear salsah standoff
     *  (string with textattributes)
     *  to html using plugin "convert_lin2html"
     *
     *****************************************/
    private convertStandoffToHTML(str: string, attr: string): string {
        return htmlConverter(JSON.parse(attr), str);
    }

    /******************************************
     *
     * get hlist object from salsah api
     *
     *****************************************/
    private getHListById(hlistId: string): Observable<any> {
        let queryString: string = '/hlists/' + hlistId;
        return this.httpGet(queryString);
    }

    /******************************************
     *
     * get selection list object from salsah api
     *
     *****************************************/
    private getSelectionsById(selectionId: string): Observable<any> {
        let queryString: string = '/selections/' + selectionId;
        return this.httpGet(queryString);
    }


    /******************************************
     *
     *  find inner links in online-access-property
     *  and rebuild the values for displaying
     *
     *****************************************/
    private replaceBiblioLink(str: string){
        let tmpStr,
            splitStr,
            nameStr,
            linkStr,
            regExLink = /<a (.*?)>(.*?)<\/a>/i; // regexp for links

        // check for double spaces
        str = str.replace('  ', ' ');

        //split "str" behind parentheses
        splitStr = str.split(') ');

        // get name of link from 1st part of "splitstr
        nameStr = splitStr[0].replace('(', '');

        // check for link in 2nd part of "splitstr"
        if (linkStr = regExLink.exec(splitStr[1])) {
            // ... link with <a> tag
            tmpStr = '<a target="_blank" ' + linkStr[1] + '>' + nameStr + '</a>';
        } else if (nameStr != 'DOI') {
            //... <a> tag is missing, add it
            tmpStr = '<a target="_blank" href="' + splitStr[1] + '">' + nameStr + '</a>';
        } else {
            // no links, pure string
            tmpStr = nameStr + ': ' + splitStr[1];
        }
        return tmpStr;
    }

    /******************************************
     *
     * find inner salsah links in richtext
     * and replace them with click-directive
     *
     *****************************************/
    private replaceSalsahLink(str: string): string {
        let patNum = /\d{4,8}/,    // regexp for object id (4-7 DIGITS)
            patLink = /<a href="(http:\/\/www.salsah.org\/api\/resources\/\d{4,8})" class="salsah-link">(.*?)<\/a>/i, // regexp for salsah links
            p;

        // check only for salsah links
        while (p = patLink.exec(str)) {
            // i.e.: as long as patLink is detected in str do...

            // identify resource id
            let res_id = patNum.exec(p[1])[0];

            // replace href attribute with click-directive
            // linktext is stored in second regexp-result p[2]
            str = str.replace(p[0], '<a (click)="ref.showObject(' + res_id + '); $event.stopPropagation()">' + p[2] + '</a>');
        } //END while

        return str;
    }

}

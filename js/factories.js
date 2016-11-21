angular.module('prototypeApp.factories', []);




/*********************************************************************

                    awgFactory

**********************************************************************/

app.factory('awgFactory', ['$timeout', '$location', '$anchorScroll', function($timeout, $location, $anchorScroll){

    // ################################
    //
    //  SCROLLS TO AN ID ON THE SAME PAGE
    //  (AS WITH ROUTING INNER PAGE HASH
    //  ANCHORS DON'T WORK)
    //
    // ################################

    function scrollTo(id) {
        //TIMEOUT IS NEEDED TO HAVE THE PAGE FULLY LOADED/COMPILED BEFORE SCROLLING
        return $timeout(function(){
            // save original hash
            var old = $location.hash();
            // set new hash id
            $location.hash(id);
            // scroll to id
            $anchorScroll();
            //reset original hash
            $location.hash(old);
        }, '');
    };


    function extractYear(obj){
        return obj.date.dateString.split(' ')[3];
    };

    // ################################
    //
    //     RETURN awgFactories
    //
    // ################################

    return {
        scrollTo:      scrollTo,      //RETURNS A FUNCTION
        extractYear:   extractYear    //RETURNS A STRING
    };
}]);




/**********************************************************************

                    salsahAPIfactory

**********************************************************************/

app.factory('salsahAPIfactory', ['$http', '$q', function($http, $q){

    // ################################
    //
    //  CONVERTS LINEAR SALSAH STANDOFF
    //  (string with textattributes)
    //  TO HTML USING PLUGIN "convert_lin2html"
    //
    // ################################

    function convert(str, attr){
        return convert_lin2html(JSON.parse(attr), str);
    }; //END convert (func)




    // ################################
    //
    //  FINDS INNER SALSAH LINKS IN RICHTEXT
    //  AND REPLACES THEM WITH NG-CLICK-DIRECTIVE
    //
    // ################################

    function replaceSalsahLink(str){
        var patNum = /\d{4,8}/,    //REGEXP FOR OBJECT ID (4-7 DIGITS)
            patLink = /<a href="(http:\/\/www.salsah.org\/api\/resources\/\d{4,8})" class="salsah-link">(.*?)<\/a>/i; //REGEXP FOR SALSAH LINKS

        //CHECK ONLY! FOR SALSAH LINKS
        while (p = patLink.exec(str)) {
            //i.e.: AS LONG AS patLink IS DETECTED IN htmlstr DO...

            //IDENTIFY RESOURCE ID
            var res_id = patNum.exec(p[1])[0];

            //REPLACE HREF ATTRIBUTE WITH NG-CLICK-DIRECTIVE
            //LINKTEXT IS STORED IN SECOND RegExp-RESULT p[2]
            str = str.replace(p[0], '<a ng-click="showObject(' + res_id + ')">' + p[2] + '</a>');
        }; //END while

        return str;
    }; //END replaceSalsahLink (func)




    // ################################
    //
    //  CALLS AN OBJECT VIA http.get AND
    //  PREPARES RESULT OBJECT RETURNED AS
    //  PROMISE RESPONSE TO CONTROLLER
    //
    // ################################

    //MAIN: GET SEARCh OBJECT & RETURN DATA TO CONTROLLER
    function getSearchObject(url, id){
        return getSearchObjectPromise(url, id, 'context').then(function (response){
            return checkContext(tmp, url, id, response.data.resource_context);
        });
    }; //END getSearchObject (func)


        //RETURNS A SINGLE SEARCH OBJECT PROMISE
        function getSearchObjectPromise(url, id, context){
            if (context === 'context') {
                return $http.get(url + '/api/resources/' + id + '_-_local?restype=info&reqtype=context');
            }
            return $http.get(url + '/api/resources/' + id + '_-_local');
        }; //END getSearchObjectPromise (func)


        // CHECK FOR IMAGE OBJECTS & RETURN OBJECT DATA
        function checkContext(tmp, url, id, contextdata) {

            var tmp = {'header': {}, 'image':[], 'props':[], 'incoming':[]};
            var img_size, preview;

            //IMAGE OBJECT (context == 2)
            if (contextdata.context == 2  && contextdata.resclass_name === "image") {
                if (contextdata.res_id.length === contextdata.firstprop.length) {
                    for (var i = 0; i < contextdata.res_id.length; i++) {
                        //find proper image solution [3] = reduction 3
                        img_size = contextdata.locations[i];
                        preview = (img_size[3]) ? img_size[3] : img_size[0];
                        tmp.image.push({
                            res_id: contextdata.res_id[i],
                            guielement: contextdata.resclass_name,
                            label: contextdata.firstprop[i],
                            value: preview.path,
                            full: img_size[img_size.length-1].path
                        });
                    }
                } else {
                    console.warn('Array length for context objects is not consistent!');
                };
                return getData(url, id, tmp);

            // STANDARD OBJECT (context == 0 || 1)
            } else if (contextdata.context < 2 ) {
                return getData(url, id, tmp);
            };
        } //END checkContext (func)


            //GET DATA
            function getData(url, id, tmp) {

                var data = {};

                return getSearchObjectPromise(url, id).then(function (response){
                    data = response.data;
                    if (data.access === 'OK') {
                        prepareIncomingObjects(data, tmp);
                        prepareSearchObject(url, id, data, tmp);
                    }
                    // ELSE no acces to objects
                    else {
                        prepareRestrictedObjects(id, tmp);
                    };
                    return tmp;
                });
            }; // END getData (func)


                    //PREPARE INCOMING PROPERTIES
                    function prepareIncomingObjects(data, tmp) {
                        angular.forEach(data.incoming, function(ins){
                            tmp['incoming'].push({
                                id: ins.ext_res_id.id,
                                value: ins.value,
                                icon: ins.resinfo.restype_iconsrc
                            });
                        });
                    };// END prepareIncomingProperties (func)


                    //PREPARE RESTRICTED PROPERTIES
                    function prepareRestrictedObjects(id, tmp) {
                        console.log('No access');
                        tmp['incoming'] = '';
                        tmp['header'] = {
                            'objID': id,
                            'icon': 'http://www.salsah.org/app/icons/16x16/delete.png',
                            'type': 'restricted',
                            'title': 'Kein Zugriff auf dieses Objekt möglich',
                            'lastmod': '---'
                        }
                    }; //END prepareRestrictedProperties (func)


                    //PREPARE OBJECT PROPERTIES
                    function prepareSearchObject(url, id, data, tmp) {
                        var props, info = {};
                        props = data.props;
                        info = data.resinfo;

                        prepareObjectProperties(url, props, tmp);
                        prepareObjectHeader(id, info, props, tmp);
                    };


                        //PREPARE OBJECT PROPERTIES
                        function prepareObjectProperties(url, props, tmp) {
                            //LOOPT THROUGH PROPERTIES
                            angular.forEach(props, function(prop){
                                var prop_value = [''];

                                //CLEAN VALUE LABELS
                                if (prop.label) {
                                    prop.label = prop.label.replace(' (Richtext)', '');
                                }

                                //CHECK IF VALUES PROPERTY IS DEFINED
                                if ('values' in prop) {

                                    prop_value = convertGUISpecificValues(url, prop);

                                    //PUSH VALUES INTO TMP VARIABLE
                                    tmp.props.push({
                                        pid: prop.pid,
                                        guielement: prop.guielement,
                                        label: prop.label,
                                        value: prop_value
                                    });

                                //ELSE IF VALUES PROPERTY NOT DEFINED
                                //PUSH EMPTY VALUE INTO TMP VARIABLE
                                } else {
                                    tmp.props.push({
                                        pid: prop.pid,
                                        guielement: prop.guielement,
                                        label: prop.label,
                                        value: ''
                                    });
                                };
                            }); //END forEach PROPS
                        };


                        //PREPARE OBJECT META INFOS
                        function prepareObjectHeader(id, info, props, tmp) {
                            switch (info.restype_id) {
                                //PERSON
                                case '45':
                                    var lname = props['salsah:lastname'].values[0],
                                        fname = props['salsah:firstname'].values[0];
                                    tmp['header'] = {
                                        'objID': id,
                                        'icon': info.restype_iconsrc,
                                        'type': info.restype_label,
                                        'title': fname + ' ' + lname,
                                        'lastmod': info.lastmod
                                    }
                                    break;

                                //KORRESPONDENZ
                                case '29':
                                    tmp['header'] = {
                                        'objID': id,
                                        'icon': info.restype_iconsrc,
                                        'type': info.restype_label,
                                        'title': props['dc:title'].values[0] + "<br/>" + props['dc:date'].values[0],
                                        'lastmod': info.lastmod
                                    }
                                    break;

                                //SUPPLEMENT
                                case '125':
                                    tmp['header'] = {
                                        'objID': id,
                                        'icon': info.restype_iconsrc,
                                        'type': info.restype_label,
                                        'title': props['dc:title'].values[0] + "<br/>" + props['dc:date'].values[0],
                                        'lastmod': info.lastmod
                                    }
                                    break;

                                // WERK
                                case '43':
                                    tmp['header'] = {
                                        'objID': id,
                                        'icon': info.restype_iconsrc,
                                        'type': info.restype_label,
                                        'title': props['dc:title'].values[0],
                                        'lastmod': info.lastmod
                                    }
                                    break;

                                // MUSIKSTÜCK (Moldenhauer-Nummer)
                                case '36':
                                    tmp['header'] = {
                                        'objID': id,
                                        'icon': info.restype_iconsrc,
                                        'type': info.restype_label,
                                        'title': '[M ' + props['webern:mnr'].values[0] + '] ' + props['dc:title'].values[0],
                                        'lastmod': info.lastmod
                                    }
                                    break;

                                // CHRONOLOGIE
                                case '28':
                                    var htmlstr = '';

                                    // RICHTEXT VALUE HAS ALREADY BEEN CONVERTED IN TMP USING PLUGIN "convert_lin2html"
                                    htmlstr = tmp.props[0].value[0];

                                    //STRIP & REPLACE <p>-TAGS FOR DISPLAYING OBJTITLE
                                    htmlstr = htmlstr.replace(/<\/p><p>/g, '<br />');
                                    htmlstr = htmlstr.replace(/<p>|<\/p>/g, '');
                                    htmlstr = htmlstr.replace(htmlstr, '«$&»');
                                    tmp['header'] = {
                                        'objID': id,
                                        'icon': info.restype_iconsrc,
                                        'type': info.restype_label,
                                        'title': htmlstr,
                                        'lastmod': info.lastmod
                                    }
                                    break;

                                default:
                                    tmp['header'] = {
                                        'objID': id,
                                        'icon': typeof info !== undefined ? info.restype_iconsrc :  'http://www.salsah.org/app/icons/16x16/delete.png',
                                        'type': typeof info !== undefined ? info.restype_label : '---',
                                        'title': typeof info !== undefined ? info.restype_description : '---',
                                        'lastmod': typeof info !== undefined ? info.lastmod : '---'
                                    };
                            }; //END switch MTEA-INFOS
                        };


                            //CHECK FOR GUI-ELEMENTS & CONVERT SPECIFIC VALUES
                            function convertGUISpecificValues(url, prop) {
                                var propval = [''];

                                switch (prop.valuetype_id) {

                                    case '4': // DATE: SALSAH OBJECT NEEDS TO BE CONVERTED (USING PLUGIN "convert_jul2greg.js")
                                        prop.values[0] = convert_date(prop.values[0]);
                                        propval[0] = prop.values[0];
                                        break; //END date

                                    case '6': // RESOURCEPOINTER SEARCHBOX: LINKAGE TO ANOTHER SALSAH OBJECT NEEDS TO BE CONVERTED
                                        if (prop.values.length > 0) {
                                            for (var i = 0; i < prop.values.length; i++){
                                                //ADD <p> & <a> with NG-CLICK-DIRECTIVE
                                                //LINKTEXT IS STORED IN $&
                                                propval[0] += prop.value_firstprops[i].replace(prop.value_firstprops[i], '<p><a ng-click="showObject(' + prop.values[i] + ')">$& (' + prop.value_restype[i] + ')<a/></p>');
                                            } //END for
                                        } else {
                                            console.log('= 0:::: ' + propval[0]);
                                        }
                                        break; //END searchbox

                                    case '7': // SELECTION PULLDOWN: SELECTION NODES HAVE TO BE READ SEPERATLY
                                        if (prop.values[0] !== '') {

                                            //IDENTIFY ID OF SELECTION-LIST FROM prop.attributes
                                            //e.g. "selection=66"
                                            var q = prop.attributes.split("=");

                                            //GET SELECTION-LIST DATA
                                            $http.get(url + '/api/selections/' + q[1]).then(function (response){
                                                var selection = response.data.selection;

                                                //LOCALIZE ID IN SELECTION-LIST AND IDENTIFY THE LABEL
                                                for (var i = 0; i < selection.length; i++) {
                                                    if (selection[i].id == prop.values[0]) propval[0] = selection[i].label;
                                                }
                                                return propval[0];
                                            });
                                        } else {
                                            // EMPTY VALUE
                                            propval[0] = '';
                                        };
                                        break; //END selection

                                    case '12': // HLIST: HLIST NODES HAVE TO BE CALLED SEPERATLY
                                        if (prop.values[0] !== '') {
                                            //VALUES[0] gives reference id to
                                            // url + /api/hlists/{{:id}}?reqtype=node
                                            //result is an array nodelist (properties: id, label, name) with nodes from 0 to n

                                            //IDENTIFY HLIST ID FROM prop.values
                                            //e.g. ["4128"] or ["4128", "4130"]
                                            var hlist_id = prop.values;

                                            for (var i = 0; i < hlist_id.length; i++) {
                                                //GET HLIST DATA
                                                $http.get(url + '/api/hlists/' + hlist_id[i] + '?reqtype=node').then(function (response){
                                                    var hlist = response.data.nodelist;

                                                    //GET LABELS FROM NODELIST ARRAY
                                                    var hlist_string = hlist[0].label;
                                                    for (var j = 1; j < hlist.length; j++) {
                                                        hlist_string += ' > ' + hlist[j].label;
                                                        if (j == hlist.length-1) {
                                                            //SHORT LABEL
                                                            hlist_label = hlist[j].label;
                                                        };
                                                    };

                                                    // WRAP hlist_string WITH <p>-TAGS
                                                    hlist_string = hlist_string.replace(hlist_string, '<p>$&</p>');

                                                    propval[0] += hlist_string;
                                                });
                                            };
                                        } else {
                                            // EMPTY VALUE
                                            propval[0] = '';
                                        };
                                        break; //END hlist

                                    case '14': // RICHTEXT: SALSAH STANDOFF NEEDS TO BE CONVERTED
                                        //CHECK FOR MUTLIPLE && NOT EMPTY VALUES
                                        if (prop.values.length > 0 && prop.values[0].utf8str !== '') {
                                            for (var i = 0; i < prop.values.length; i++){

                                                //INIT
                                                var htmlstr = '';

                                                //CONVERT LINEAR SALSAH STANDOFF TO HTML (USING PLUGIN "convert_lin2html")
                                                htmlstr = convert(prop.values[i].utf8str, prop.values[i].textattr);

                                                //REPLACE SALSAH LINKS
                                                htmlstr = replaceSalsahLink(htmlstr);

                                                //CHECK IF <p>-TAGS NOT EXIST (indexOf -1), THEN ADD THEM & CONCAT STRING TO propval[0]
                                                if (htmlstr.indexOf('<p>') === -1) {
                                                    propval[0] += htmlstr.replace(htmlstr, '<p>$&</p>');
                                                } else {
                                                    propval[0] += htmlstr;
                                                };
                                            };

                                        //EMPTY VALUES
                                        } else {
                                            propval[0] = '';
                                        };
                                        break; //END richtext

                                    case '15': // GeoNAMES: GeoName NODES HAVE TO BE CALLED SEPERATLY
                                        if (prop.values[0] !== '') {
                                            //VALUES[0] gives reference id to
                                            // url + /api/geonames/{{:id}}?reqtype=node
                                            //result is an array nodelist (properties: id, label, name) with nodes from 0 to n

                                            //IDENTIFY GEONAMES GUI-ID FROM prop.values
                                            //e.g. ["4136"] or ["4136", "4132"]
                                            var geogui_id = prop.values;

                                            for (var i = 0; i < geogui_id.length; i++) {
                                                //GET GEONAMES GUI DATA
                                                $http.get(url + '/api/geonames/' + geogui_id[i] + '?reqtype=node').then(function (response){

                                                    //GEO-OBJECT
                                                    var geo = {
                                                            data:           [],
                                                            label:          '',
                                                            label_string:   '',
                                                            label_url:      '',
                                                            gnid:           ''
                                                    };
                                                    geo.data = response.data.nodelist;

                                                    //GET LABELS FROM NODELIST ARRAY
                                                    geo.label_string = geo.data[0].label;
                                                    for (var j = 1; j < geo.data.length; j++) {
                                                         geo.label_string += ', ' + geo.data[j].label;
                                                         if (j == geo.data.length-1) {
                                                             //GET GEONAMESID gnid FROM LAST ARRAY ITEM
                                                             geo.gnid = geo.data[j].name.replace('gnid:', '');
                                                             //SHORT LABEL
                                                             geo.label = geo.data[j].label;
                                                         }
                                                    };

                                                    //INCLUDE geonames ICON & URL TO GNID, EMBEDDED IN <p>-TAGS
                                                    geo.label_url = geo.label.replace(geo.label, '<p>$& <a href="http://www.geonames.org/' + geo.gnid + '" title="' + geo.label_string + '" target="_blank"><img src="img/geonames.png" height="25" width="25" alt="' + geo.label + '" /></a></p>')

                                                    propval[0] += geo.label_url;
                                                });
                                            };
                                        } else {
                                            // EMPTY VALUE
                                            propval[0] = '';
                                        };
                                        break; //END geonames

                                    default: // '1'=> TEXT: PROPERTIES COME AS THEY ARE
                                        if (prop.values[0] !== '') {
                                            propval[0] += prop.values[0];
                                            for (var i = 1; i < prop.values.length; i++){
                                                propval[0] += "<br/>" + prop.values[i];
                                            };
                                        } else {

                                            // EMPTY TEXT VALUE
                                            propval[0] = '';
                                        };
                                }; //END switch

                                return propval;
                            };





    // ################################
    //
    //  FULLTEXTSEARCH VIA SALSAH API
    //
    // ################################

    function fulltextSearch(url, query) {

        //GET DATA
        return $http.get(url + '/api/search/' + query + '?searchtype=fulltext&filter_by_project=6').then(function (response){
            tmp = response.data;

            // =>Chronologie =>Ereignis: SALSAH STANDOFF NEEDS TO BE CONVERTED BEFORE DISPLAYING
            angular.forEach(tmp.subjects, function(subj){

                //CLEAN VALUE LABELS
                subj.valuelabel[0] = subj.valuelabel[0].replace(' (Richtext)', '');
                subj.obj_id = subj.obj_id.replace('_-_local', '');

                //valuetype_id 14 = valuelabel 'Ereignis'
                if (subj.valuetype_id[0] == '14') {
                    var htmlstr = '';
                    htmlstr = convert(subj.value[0].utf8str, subj.value[0].textattr);

                    //REPLACE SALSAH LINKS
                    htmlstr = replaceSalsahLink(htmlstr);

                    //STRIP & REPLACE <p>-TAGS FOR DISPLAYING OBJTITLE
                    htmlstr = htmlstr.replace(/<\/p><p>/g, '<br />');
                    htmlstr = htmlstr.replace(/<p>|<\/p>/g, '');
                    htmlstr = htmlstr.replace(htmlstr, '«$&»');
                    subj.value[0] = htmlstr;
                }; // END if
            }); // END forEach

            return tmp;
        }); // END then
    }; //END fulltextSearch (func)




    // ################################
    //
    //  GET DAILY EVENTS VIA SALSAH API
    //
    // ################################

    //MAIN: GET DAILY EVENTS & RETURN DATA TO CONTROLLER
    function getDailyEvent(url, dateObj, objClasses){
        return getAllDailyPromises(url, dateObj, objClasses).then(function(response){
            return prepareResultObject(response);
        });
    }; //END getDailyEvent (func)


            //RETURNS ALL CHRONOLOGY EVENT PROMISES
            function getAllDailyPromises(url, dateObj, objClasses){
                //INIT
                var promises = [],
                    years = [],
                    searchYearDiff = dateObj.searchEnd - dateObj.searchStart + 1,
                    idObj = prepareIdObject(objClasses),
                    len = idObj.restypeID.length;

                //GET PROMISES
                for (var i = 0; i < searchYearDiff; i++) {
                    years[i] = dateObj.searchStart + i;
                    //call GETDAILYPROMISE for every year between searchStart and searchEnd for every propertyID
                    for (var j = 0; j < len; j++) {
                        promises[len*i + j] = getDailyPromise(url, idObj.restypeID[j], idObj.propertyID[j], years[i], dateObj.month, dateObj.day);
                    };
                }; //END for

                return $q.all(promises);
            }; //END getAllDailyPromises (func)


            //RETURNS A SINGLE CHRONOLOGY EVENT PROMISE
            function getDailyPromise(url, restypeID, propertyID, year, month, day){
                return $http.get(url + '/api/search/?searchtype=extended&filter_by_project=6&filter_by_restype=' + restypeID + '&property_id=' + propertyID + '&compop=EQ&searchval=GREGORIAN%3A' + year + '-' + month + '-' + day);
            }; //END getDailyPromise (func)


            //EXTRACTS RESTYPE- & PROPERTYIDs FROM objClasses OBJECT
            function prepareIdObject(objClasses){
                var idObj = {
                        restypeID: [],
                        propertyID: [],
                        pushID: function(a, b){
                            return a.push(b);
                        }
                    },
                    objKeys = Object.keys(objClasses),
                    objLength = objKeys.length;

                for (var i = 0; i < objLength; i++) {
                    idObj.pushID(idObj.restypeID, objClasses[objKeys[i]].restypeID);
                    idObj.pushID(idObj.propertyID, objClasses[objKeys[i]].propertyID[0]);
                    if (objClasses[objKeys[i]].propertyID.length > 1) {
                        for (var j = 1; j < objClasses[objKeys[i]].propertyID.length; j++) {
                            idObj.pushID(idObj.restypeID, objClasses[objKeys[i]].restypeID);
                            idObj.pushID(idObj.propertyID, objClasses[objKeys[i]].propertyID[j]);
                        };
                    };
                };
                return idObj;
            }; //END prepareIdObject (func)


            //PREPARES RESULT OBJECT FROM PROMISE RESPONSE
            function prepareResultObject(response){
                //INIT
                var resultObj = {
                        overallQueries: response.length,
                        searchResults: []
                    },
                    tmp;

                for (var i = 0; i < response.length; i++) {
                    //if results are not empty...
                    if (response[i].data.subjects.toString() !== '') {
                        // catch results in temporary variable
                        tmp = response[i].data.subjects;
                        for (var j = 0; j < tmp.length; j++) {
                            //... exclude periods, take care only of events from a specific day
                            if (tmp[j].value[1].dateval1 === tmp[j].value[1].dateval2) {
                                //... & push result into data array
                                resultObj['searchResults'].push({
                                    objID: tmp[j].obj_id.replace('_-_local', ''),
                                    objLabel: tmp[j].iconlabel,
                                    objSrc: tmp[j].iconsrc,
                                    value: {
                                        label: tmp[j].valuelabel[0].replace(' (Richtext)', ''),
                                        valueString: convertValueString(tmp[j].value[0])
                                    },
                                    date: {
                                        label: tmp[j].valuelabel[1],
                                        dateString: convert_date(tmp[j].value[1])
                                    },
                                    jdate: tmp[j].value[1]
                                }); //END push
                            }; //END inner if
                        }; //END inner for
                    }; //END outer if
                }; //END outer for

                //if there is no data...
                if (resultObj == '' || resultObj === []) {
                    //... notification about no results
                    resultObj['searchResults'].push({
                        objID: '',
                        objLabel: '',
                        objSrc: '',
                        value: {
                            label: 'Ereignis',
                            utf: 'Zum heutigen Datum kein Eintrag nachgewiesen.'
                        },
                        date: {
                            label: '',
                            dateString: '' //dateObj.y_start + '–' + dateObj.y_end
                        },
                        jdate: ''
                    });
                } else {
                    //... sort resultObj ascending by jdate.dateval1
                    resultObj['searchResults'].sort(function(obj1, obj2){
                        return obj1.jdate.dateval1 - obj2.jdate.dateval1;
                    });
                };

                return resultObj;
            }; //END prepareResultObject (func)


            //RETURNS CONVERTED STANDOFF AS STRING OR ONLY STRING DEPENDING ON TYPEOF VALUE
            function convertValueString(value){
                if (typeof value === 'string') {
                    return value;
                } else if (typeof value === 'object') {
                    return convert_lin2html(value.textattr, value.utf8str);
                };
            }; //END convertValueString (func)


    // ################################
    //
    //     RETURN salsahAPI FACTORIES
    //
    // ################################


    return {
        convert2html: convert,              //RETURNS A STRING
        getObject: getSearchObject,         //RETURNS A PROMISE
        fulltextSearch: fulltextSearch,     //RETURNS A PROMISE
        getDailyEvent: getDailyEvent        //RETURNS A PROMISE
    };
}]);

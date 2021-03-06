/*
 * This service is adapted from Mads Holten's Sparql Visualizer
 * cf. https://github.com/MadsHolten/sparql-visualizer
 */

import { Injectable } from '@angular/core';

import { Namespace, QueryResult, QueryTypeIndex, Triple, TripleComponent } from '../models';

import * as N3 from 'n3';

/**
 * Declared variable: rdfstore.
 *
 * It provides access to the rdfstore library.
 */
declare var rdfstore;

/**
 * The GraphVisualizer service.
 *
 * It handles the query requests of the graph visualizer.
 *
 * Provided in: `graph-visualizer.module`.
 */
@Injectable()
export class GraphVisualizerService {
    /**
     * Private variable: store.
     *
     * It keeps the rdfstore instance.
     */
    private store: any;

    /**
     * Constructor of the GraphVisualizerService.
     */
    constructor() {}

    /**
     * Public method: abbreviateTriples.
     *
     * It abbreviates the given triples according to the given namespaces.
     *
     * @param {Triple[]} triples The given triples.
     * @param {string} namespaces The given namespaces.
     * @param {string} [mimeType] The given optional mimeType.
     *
     * @returns {Triple[]} The array of abbreviated triples.
     */
    abbreviateTriples(triples: Triple[], namespaces: Namespace, mimeType?: string): Triple[] {
        if (!mimeType) {
            mimeType = 'text/turtle';
        }
        return triples.map((triple: Triple) => {
            let s: TripleComponent = triple.subject.nominalValue;
            let p: TripleComponent = triple.predicate.nominalValue;
            let o: TripleComponent = triple.object.nominalValue;

            // Abbreviate turtle format
            if (mimeType === 'text/turtle') {
                if (this.abbreviate(s, namespaces) != null) {
                    s = this.abbreviate(s, namespaces);
                }
                if (this.abbreviate(p, namespaces) != null) {
                    p = this.abbreviate(p, namespaces);
                }
                if (this.abbreviate(o, namespaces) != null) {
                    o = this.abbreviate(o, namespaces);
                }
            }
            return { subject: s, predicate: p, object: o };
        });
    }

    /**
     * Public method: appendNamespacesToQuery.
     *
     * It appends namespaces for prefixes used in a SPARQL query.
     *
     * @param {string} query The given query.
     * @param {string} ttlString The given turtle string with possible prefixes.
     *
     * @returns {string} The query with appended namespaces.
     */
    appendNamespacesToQuery(query: string, ttlString: string): string {
        if (!query || !ttlString) {
            return;
        }
        // get namespaces from triples
        const namespaces: Namespace = this.extractNamespacesFromTTL(ttlString);

        // get prefixes from query
        const prefixes: string[] = this.extractPrefixesFromQuery(query);

        // Append the used namespaces to the query
        const keys = Object.keys(namespaces);
        let pfxString = '';
        keys.forEach(key => {
            if (prefixes.indexOf(key) !== -1) {
                pfxString += `PREFIX ${key} ${namespaces[key]}\n`;
            }
        });

        if (pfxString !== '') {
            query = pfxString + '\n' + query;
        }

        return query;
    }

    /**
     * Public method: doQuery.
     *
     * It performs a query against the rdfstore.
     *
     * @param {string} queryType The given query type.
     * @param {string} query The given query.
     * @param {string} ttlString The given turtle string.
     * @param {string} [mimeType] The optional given mimetype.
     *
     * @returns {Promise<Triple[]>} A promise of the query result triples.
     */
    doQuery(queryType: string, query: string, ttlString: string, mimeType?: string): Promise<Triple[]> {
        if (!mimeType) {
            mimeType = 'text/turtle';
        }

        return this.createStore()
            .then(store => {
                // console.log('STORE', store);
                this.store = store;

                return this.loadTriplesInStore(store, ttlString, mimeType);
            })
            .then((storeSize: number) => {
                // console.log('STORESIZE', storeSize);
                return this.executeQuery(this.store, query);
            })
            .then((res: QueryResult) => {
                // console.log('RES', res);
                const data: QueryResult = res;

                // Reformat data if select query
                if (queryType === 'select') {
                    console.log('got SELECT request');
                    // return this.sparqlJSON(data).data;
                }

                /**
                 * NB! THE PREFIXING SHOULD BE HANDLED BY A PIPE!
                 */

                // get namespaces
                return this.getNamespaces(ttlString).then((namespaces: Namespace) => {
                    // Process result
                    return this.abbreviateTriples(data.triples, namespaces, mimeType);
                });
            });
    }

    /**
     * Public method: getQuerytype.
     *
     * It gets the query type from a given query.
     *
     * @param {string} query The given query.
     *
     * @returns {string} The query type.
     */
    getQuerytype(query: string): string {
        let keyWords: QueryTypeIndex[] = [
            { queryType: 'select', index: -1 },
            { queryType: 'construct', index: -1 },
            { queryType: 'count', index: -1 },
            { queryType: 'describe', index: -1 },
            { queryType: 'insert', index: -1 },
            { queryType: 'delete', index: -1 }
        ];

        // Get indexes and set a variable if at least one matches + store lowest index
        let match = false; // Set to true if some keyword match is found
        let low = Infinity;
        let lowest: QueryTypeIndex;
        let type: string;

        keyWords = keyWords.map(item => {
            item.index = query.toLowerCase().indexOf(item.queryType);
            if (item.index !== -1) {
                match = true;
                if (item.index < low) {
                    low = item.index;
                }
            }
            return item;
        });

        // If none of the keywords match return null
        if (!match) {
            return null;
        }

        // If more exist, take the lowest
        lowest = keyWords.find(item => item.index === low);
        if (!lowest) {
            return null;
        }
        type = lowest.queryType;

        if (type === 'insert' || type === 'delete') {
            return 'update';
        }

        return type;
    }

    /**
     * Private method: abbreviate.
     *
     * It abbreviates the namespaces of a given iri.
     *
     * @param {*} iri The given iri.
     * @param {Namespace} namespaces The given namespaces.
     *
     * @returns {TripleComponent} The abbreviated triple component.
     */
    private abbreviate(iri: any, namespaces: Namespace): TripleComponent {
        let newVal: TripleComponent = null;
        // If FoI has 'http' in its name, continue
        if (iri.indexOf('http') !== -1) {
            // Loop over prefixes
            Object.entries(namespaces).forEach(([key, value], index) => {
                // If the FoI has the prefixed namespace in its name, return it
                if (iri.indexOf(value) !== -1) {
                    newVal = iri.replace(value, key + ':');
                }
            });
        }
        return newVal;
    }

    /**
     * Private method: createStore.
     *
     * It creates an instance of the triple store.
     *
     * @returns {Promise<any>} A promise of the triple store instance.
     */
    private createStore(): Promise<any> {
        return new Promise((resolve, reject) => {
            rdfstore.create((err, store) => {
                if (err) {
                    reject(err);
                }
                resolve(store);
            });
        });
    }

    /**
     * Private method: executeQuery.
     *
     * It executes a given query against a given triple store.
     *
     * @param {any} store The given triplestore.
     * @param {string} query The given query string.
     *
     * @returns {Promise<QueryResult>} A promise of the query result.
     */
    private executeQuery(store: any, query: string): Promise<QueryResult> {
        // console.log('executeQuery# QUERY', query);
        return new Promise((resolve, reject) => {
            store.execute(query, (err, res: QueryResult) => {
                if (err) {
                    console.error('executeQuery# got ERROR', err);
                    reject(err);
                }
                // console.log('executeQuery# RESOLVED', res);
                resolve(res);
            });
        });
    }

    /**
     * Private method: extractNamespacesFromTTL.
     *
     * It extracts the namespaces from a given triple string.
     *
     * @param {string} triples The given triple string.
     *
     * @returns {Promise<Namespace>} A promise of the namespaces.
     */
    private extractNamespacesFromTTL(triples: string) {
        // Replace all whitespace characters with a single space and split by space
        // remove empty values
        const arr = triples
            .replace(/\s/g, ' ')
            .split(' ')
            .filter(el => el !== '');

        // Get index of all occurences of @prefix
        const prefixIndexArray = arr.reduce((a, e, i) => {
            if (e === '@prefix') {
                a.push(i);
            }
            return a;
        }, []);

        const obj = {};
        prefixIndexArray.forEach(prefixIndex => {
            obj[arr[prefixIndex + 1]] = arr[prefixIndex + 2];
        });

        console.log(obj);

        return obj;
    }

    /**
     * Private method: extractPrefixesFromQuery.
     *
     * It identifies the prefixes that are used in a SPARQL query.
     *
     * @param {string} query The given query.
     *
     * @returns {string[]} A string array of the used namespaces.
     */
    private extractPrefixesFromQuery(query: string): string[] {
        const nameSpaces: string[] = [];

        const regex = /[a-zA-Z]+:/g;
        let m;

        // tslint:disable-next-line:no-conditional-assignment
        while ((m = regex.exec(query)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            m.forEach(match => {
                if (nameSpaces.indexOf(match) === -1) {
                    nameSpaces.push(match);
                }
            });
        }
        return nameSpaces;
    }

    /**
     * Private method: getNamespaces.
     *
     * It extracts the namespaces from a given triple string.
     *
     * @param {string} triples The given triple string.
     *
     * @returns {Promise<Namespace>} A promise of the namespaces.
     */
    private getNamespaces(triples: string): Promise<Namespace> {
        // parse triples
        const parser = new N3.Parser();

        // console.log('PARSER', parser);
        return new Promise((resolve, reject) => {
            parser.parse(triples, (err, triple, prefixes) => {
                if (!triple) {
                    resolve(prefixes);
                }
                if (err) {
                    reject(err);
                }
            });
        });
    }

    /**
     * Private method: loadTriplesInStore.
     *
     * It loads the given triple string into the given triplestore.
     *
     * @param {any} store The given triplestore.
     * @param {string} triples The given triple string.
     * @param {string} [mimeType] The optional given mimetype.
     *
     * @returns {Promise<number>} A promise of the size of the triples loaded into the store.
     */
    private loadTriplesInStore(store: any, triples: string, mimeType?: string): Promise<number> {
        if (!mimeType) {
            mimeType = 'text/turtle';
        }

        return new Promise((resolve, reject) => {
            store.load(mimeType, triples, (err, size) => {
                if (err) {
                    console.error('loadTriplesInStore# got error', err);
                    reject(err);
                }
                // console.log('loadTriplesInStore# resolved', size);
                resolve(size);
            });
        });
    }

    /*
    TODO: needed only for SELECT request

    private renameKeys(obj, newKeys) {
        const keyValues = Object.keys(obj).map(key => {
            const newKey = newKeys[key] || key;
            return { [newKey]: obj[key] };
        });
        return Object.assign({}, ...keyValues);
    }


    private sparqlJSON(data) {
        if (!data) {
            return;
        }
        // Get variable keys
        const varKeys = Object.keys(data[0]);

        // check that it doesn't return null results
        if (data[0][varKeys[0]] == null) {
            return { status: 400, data: 'Query returned no results' };
        }

        // Flatten object array
        const b = _.flatMap(data);

        // Rename keys according to below mapping table
        const map = {
            token: 'type',
            type: 'datatype',
            lang: 'xml:lang'
        };

        // Loop over data to rename the keys
        for (const i in b) {
            if (b.hasOwnProperty(i)) {
                for (const key in varKeys) {
                    if (varKeys.hasOwnProperty(key)) {
                        b[i][varKeys[key]] = this.renameKeys(b[i][varKeys[key]], map);
                    }
                }
            }
        }

        // Re-format data
        const reformatted = { head: { vars: varKeys }, results: { bindings: b } };

        return { status: 200, data: reformatted };
    }*/
}

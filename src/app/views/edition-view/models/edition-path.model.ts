import { EditionConstants } from './edition-constants';

/**
 * The EditionPath class.
 *
 * It is used in the context of the edition view
 * to store information about the url path of an edition.
 */
export class EditionPath {
    /**
     * The short label of a composition.
     */
    shortLabel: string;

    /**
     * The full label of a composition.
     */
    fullLabel: string;

    /**
     * The route to the composition section.
     */
    compositionRoute: string;

    /**
     * The path to the series of an edition.
     */
    seriesRoute: string;

    /**
     * The path to the section of an edition.
     */
    sectionRoute: string;

    /**
     * The route to the type of an edition.
     */
    typeRoute: string;

    /**
     * The route to the intro section of an edition.
     */
    introRoute: string;

    /**
     * The route to the detail section of an edition.
     */
    detailRoute: string;

    /**
     * The route to the report section of an edition.
     */
    reportRoute: string;

    /**
     * The root route of an edition.
     */
    rootRoute: string;

    /**
     * Constructor of the EditionPath class.
     *
     * It initializes the class with a composition Object from the EditionConstants.
     *
     * @param {any} compositionObj The given composition object.
     * @param {string} series The given series object.
     * @param {string} section The given section object.
     * @param {string} type The given type object.
     */
    constructor(compositionObj: any, series?: any, section?: any, type?: any) {
        const delimiter = '/';

        this.shortLabel = compositionObj.short ? compositionObj.short : '';
        this.fullLabel = compositionObj.full ? compositionObj.full : '';
        this.compositionRoute = compositionObj.path ? compositionObj.path : '';
        this.seriesRoute = series ? series.path : ''; // EditionConstants.series1.path;
        this.sectionRoute = section ? section.path : ''; // EditionConstants.section1.path;
        this.typeRoute = type ? type.path : ''; // EditionConstants.textEdition.path;
        this.introRoute = EditionConstants.editionIntro.path;
        this.detailRoute = EditionConstants.editionDetail.path;
        this.reportRoute = EditionConstants.editionReport.path;

        let rootPath = EditionConstants.editionRoute; // '/edition'
        // rootPath += this.series;
        // rootPath += this.section;
        rootPath += EditionConstants.compositionRoute; // '/composition'
        // rootPath += this.typePath;

        this.rootRoute = rootPath + this.compositionRoute + delimiter;
    }
}

function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var n=0;n<t.length;n++){var a=t[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}function _createClass(e,t,n){return t&&_defineProperties(e.prototype,t),n&&_defineProperties(e,n),e}(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{"6hVp":function(e,t,n){"use strict";n.r(t),t.default='<div class="col-12 col-xl-9 awg-page-not-found">\n    <h2 id="awg-page-not-found-title">{{ pageNotFoundTitle }}</h2>\n\n    <h5 id="awg-page-not-found-subtitle">{{ pageNotFoundSubTitle }}</h5>\n\n    <div class="my-4">\n        <img [src]="pageNotFoundImgPath" width="100%" />\n    </div>\n\n    <h5 id="awg-page-not-found-contact">\n        Kontaktieren sie uns gerne unter:\n        <a [href]="awgContactUrl" target="_blank" rel="noopener noreferrer">anton-webern.ch</a>\n    </h5>\n\n    <h5 id="awg-page-not-found-back" class="mt-4">\n        Zur\xfcck zur Startseite: <a [routerLink]="[\'/home\']" routerLinkActive="active">Home</a>\n    </h5>\n</div>\n'},Mn13:function(e,t,n){"use strict";n.r(t),t.default=""},bGOC:function(e,t,n){"use strict";n.r(t);var a=n("mrSG"),o=n("8Y7J"),i=n("PCNd"),r=n("iInd"),c=n("aR35"),s=function(){function e(){_classCallCheck(this,e),this.pageNotFoundTitle="Entschuldigung, diese Seite gibt es hier nicht\u2026",this.pageNotFoundSubTitle="\u2026 aber m\xf6glicherweise k\xf6nnen wir Ihnen anders weiterhelfen?",this._pageNotFoundImgPath="assets/img/page-not-found/Webern_Books.jpg",this._awgContactUrl=c.a.AWG_PROJECT_URL+"index.php?id=41"}return _createClass(e,[{key:"pageNotFoundImgPath",get:function(){return this._pageNotFoundImgPath}},{key:"awgContactUrl",get:function(){return this._awgContactUrl}}]),e}(),u=[{path:"",component:s=Object(a.a)([Object(o.n)({selector:"awg-page-not-found-view",template:__importDefault(n("6hVp")).default,changeDetection:o.j.OnPush,styles:[__importDefault(n("Mn13")).default]})],s)}],l=[s],d=function e(){_classCallCheck(this,e)};d=Object(a.a)([Object(o.K)({imports:[r.e.forChild(u)],exports:[r.e]})],d),n.d(t,"PageNotFoundViewModule",(function(){return h}));var h=function e(){_classCallCheck(this,e)};h=Object(a.a)([Object(o.K)({imports:[i.a,d],declarations:[l]})],h)}}]);
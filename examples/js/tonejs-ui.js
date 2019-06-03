!function(t){var e={};function n(i){if(e[i])return e[i].exports;var o=e[i]={i:i,l:!1,exports:{}};return t[i].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,i){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(i,o,function(e){return t[e]}.bind(null,o));return i},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=140)}([function(t,e,n){"use strict";
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const i=new WeakMap,o=t=>"function"==typeof t&&i.has(t),r=void 0!==window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,s=(t,e,n=null)=>{let i=e;for(;i!==n;){const e=i.nextSibling;t.removeChild(i),i=e}},a={},l=`{{lit-${String(Math.random()).slice(2)}}}`,c=`\x3c!--${l}--\x3e`,u=new RegExp(`${l}|${c}`),h="$lit$";class d{constructor(t,e){this.parts=[],this.element=e;let n=-1,i=0;const o=[],r=e=>{const s=e.content,a=document.createTreeWalker(s,133,null,!1);let c,d;for(;a.nextNode();){n++,c=d;const e=d=a.currentNode;if(1===e.nodeType){if(e.hasAttributes()){const o=e.attributes;let r=0;for(let t=0;t<o.length;t++)o[t].value.indexOf(l)>=0&&r++;for(;r-- >0;){const o=t.strings[i],r=v.exec(o)[2],s=r.toLowerCase()+h,a=e.getAttribute(s).split(u);this.parts.push({type:"attribute",index:n,name:r,strings:a}),e.removeAttribute(s),i+=a.length-1}}"TEMPLATE"===e.tagName&&r(e)}else if(3===e.nodeType){const t=e.nodeValue;if(t.indexOf(l)<0)continue;const r=e.parentNode,s=t.split(u),a=s.length-1;i+=a;for(let t=0;t<a;t++)r.insertBefore(""===s[t]?f():document.createTextNode(s[t]),e),this.parts.push({type:"node",index:n++});r.insertBefore(""===s[a]?f():document.createTextNode(s[a]),e),o.push(e)}else if(8===e.nodeType)if(e.nodeValue===l){const t=e.parentNode,r=e.previousSibling;null===r||r!==c||r.nodeType!==Node.TEXT_NODE?t.insertBefore(f(),e):n--,this.parts.push({type:"node",index:n++}),o.push(e),null===e.nextSibling?t.insertBefore(f(),e):n--,d=c,i++}else{let t=-1;for(;-1!==(t=e.nodeValue.indexOf(l,t+1));)this.parts.push({type:"node",index:-1})}}};r(e);for(const t of o)t.parentNode.removeChild(t)}}const p=t=>-1!==t.index,f=()=>document.createComment(""),v=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=\/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class b{constructor(t,e,n){this._parts=[],this.template=t,this.processor=e,this.options=n}update(t){let e=0;for(const n of this._parts)void 0!==n&&n.setValue(t[e]),e++;for(const t of this._parts)void 0!==t&&t.commit()}_clone(){const t=r?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),e=this.template.parts;let n=0,i=0;const o=t=>{const r=document.createTreeWalker(t,133,null,!1);let s=r.nextNode();for(;n<e.length&&null!==s;){const t=e[n];if(p(t))if(i===t.index){if("node"===t.type){const t=this.processor.handleTextExpression(this.options);t.insertAfterNode(s),this._parts.push(t)}else this._parts.push(...this.processor.handleAttributeExpressions(s,t.name,t.strings,this.options));n++}else i++,"TEMPLATE"===s.nodeName&&o(s.content),s=r.nextNode();else this._parts.push(void 0),n++}};return o(t),r&&(document.adoptNode(t),customElements.upgrade(t)),t}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */class m{constructor(t,e,n,i){this.strings=t,this.values=e,this.type=n,this.processor=i}getHTML(){const t=this.strings.length-1;let e="";for(let n=0;n<t;n++){const t=this.strings[n];let i=!1;e+=t.replace(v,(t,e,n,o)=>(i=!0,e+n+h+o+l)),i||(e+=c)}return e+this.strings[t]}getTemplateElement(){const t=document.createElement("template");return t.innerHTML=this.getHTML(),t}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const g=t=>null===t||!("object"==typeof t||"function"==typeof t);class y{constructor(t,e,n){this.dirty=!0,this.element=t,this.name=e,this.strings=n,this.parts=[];for(let t=0;t<n.length-1;t++)this.parts[t]=this._createPart()}_createPart(){return new x(this)}_getValue(){const t=this.strings,e=t.length-1;let n="";for(let i=0;i<e;i++){n+=t[i];const e=this.parts[i];if(void 0!==e){const t=e.value;if(null!=t&&(Array.isArray(t)||"string"!=typeof t&&t[Symbol.iterator]))for(const e of t)n+="string"==typeof e?e:String(e);else n+="string"==typeof t?t:String(t)}}return n+=t[e]}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class x{constructor(t){this.value=void 0,this.committer=t}setValue(t){t===a||g(t)&&t===this.value||(this.value=t,o(t)||(this.committer.dirty=!0))}commit(){for(;o(this.value);){const t=this.value;this.value=a,t(this)}this.value!==a&&this.committer.commit()}}class _{constructor(t){this.value=void 0,this._pendingValue=void 0,this.options=t}appendInto(t){this.startNode=t.appendChild(f()),this.endNode=t.appendChild(f())}insertAfterNode(t){this.startNode=t,this.endNode=t.nextSibling}appendIntoPart(t){t._insert(this.startNode=f()),t._insert(this.endNode=f())}insertAfterPart(t){t._insert(this.startNode=f()),this.endNode=t.endNode,t.endNode=this.startNode}setValue(t){this._pendingValue=t}commit(){for(;o(this._pendingValue);){const t=this._pendingValue;this._pendingValue=a,t(this)}const t=this._pendingValue;t!==a&&(g(t)?t!==this.value&&this._commitText(t):t instanceof m?this._commitTemplateResult(t):t instanceof Node?this._commitNode(t):Array.isArray(t)||t[Symbol.iterator]?this._commitIterable(t):this._commitText(t))}_insert(t){this.endNode.parentNode.insertBefore(t,this.endNode)}_commitNode(t){this.value!==t&&(this.clear(),this._insert(t),this.value=t)}_commitText(t){const e=this.startNode.nextSibling;t=null==t?"":t,e===this.endNode.previousSibling&&e.nodeType===Node.TEXT_NODE?e.textContent=t:this._commitNode(document.createTextNode("string"==typeof t?t:String(t))),this.value=t}_commitTemplateResult(t){const e=this.options.templateFactory(t);if(this.value&&this.value.template===e)this.value.update(t.values);else{const n=new b(e,t.processor,this.options),i=n._clone();n.update(t.values),this._commitNode(i),this.value=n}}_commitIterable(t){Array.isArray(this.value)||(this.value=[],this.clear());const e=this.value;let n,i=0;for(const o of t)void 0===(n=e[i])&&(n=new _(this.options),e.push(n),0===i?n.appendIntoPart(this):n.insertAfterPart(e[i-1])),n.setValue(o),n.commit(),i++;i<e.length&&(e.length=i,this.clear(n&&n.endNode))}clear(t=this.startNode){s(this.startNode.parentNode,t.nextSibling,this.endNode)}}class w{constructor(t,e,n){if(this.value=void 0,this._pendingValue=void 0,2!==n.length||""!==n[0]||""!==n[1])throw new Error("Boolean attributes can only contain a single expression");this.element=t,this.name=e,this.strings=n}setValue(t){this._pendingValue=t}commit(){for(;o(this._pendingValue);){const t=this._pendingValue;this._pendingValue=a,t(this)}if(this._pendingValue===a)return;const t=!!this._pendingValue;this.value!==t&&(t?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name)),this.value=t,this._pendingValue=a}}class S extends y{constructor(t,e,n){super(t,e,n),this.single=2===n.length&&""===n[0]&&""===n[1]}_createPart(){return new E(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class E extends x{}let k=!1;try{const t={get capture(){return k=!0,!1}};window.addEventListener("test",t,t),window.removeEventListener("test",t,t)}catch(t){}class M{constructor(t,e,n){this.value=void 0,this._pendingValue=void 0,this.element=t,this.eventName=e,this.eventContext=n,this._boundHandleEvent=(t=>this.handleEvent(t))}setValue(t){this._pendingValue=t}commit(){for(;o(this._pendingValue);){const t=this._pendingValue;this._pendingValue=a,t(this)}if(this._pendingValue===a)return;const t=this._pendingValue,e=this.value,n=null==t||null!=e&&(t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive),i=null!=t&&(null==e||n);n&&this.element.removeEventListener(this.eventName,this._boundHandleEvent,this._options),i&&(this._options=A(t),this.element.addEventListener(this.eventName,this._boundHandleEvent,this._options)),this.value=t,this._pendingValue=a}handleEvent(t){"function"==typeof this.value?this.value.call(this.eventContext||this.element,t):this.value.handleEvent(t)}}const A=t=>t&&(k?{capture:t.capture,passive:t.passive,once:t.once}:t.capture);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const I=new class{handleAttributeExpressions(t,e,n,i){const o=e[0];return"."===o?new S(t,e.slice(1),n).parts:"@"===o?[new M(t,e.slice(1),i.eventContext)]:"?"===o?[new w(t,e.slice(1),n)]:new y(t,e,n).parts}handleTextExpression(t){return new _(t)}};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */function C(t){let e=T.get(t.type);void 0===e&&(e={stringsArray:new WeakMap,keyString:new Map},T.set(t.type,e));let n=e.stringsArray.get(t.strings);if(void 0!==n)return n;const i=t.strings.join(l);return void 0===(n=e.keyString.get(i))&&(n=new d(t,t.getTemplateElement()),e.keyString.set(i,n)),e.stringsArray.set(t.strings,n),n}const T=new Map,N=new WeakMap,P=(t,...e)=>new m(t,e,"html",I),O=NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_COMMENT|NodeFilter.SHOW_TEXT;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */function R(t,e){const{element:{content:n},parts:i}=t,o=document.createTreeWalker(n,O,null,!1);let r=F(i),s=i[r],a=-1,l=0;const c=[];let u=null;for(;o.nextNode();){a++;const t=o.currentNode;for(t.previousSibling===u&&(u=null),e.has(t)&&(c.push(t),null===u&&(u=t)),null!==u&&l++;void 0!==s&&s.index===a;)s.index=null!==u?-1:s.index-l,s=i[r=F(i,r)]}c.forEach(t=>t.parentNode.removeChild(t))}const $=t=>{let e=t.nodeType===Node.DOCUMENT_FRAGMENT_NODE?0:1;const n=document.createTreeWalker(t,O,null,!1);for(;n.nextNode();)e++;return e},F=(t,e=-1)=>{for(let n=e+1;n<t.length;n++){const e=t[n];if(p(e))return n}return-1};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const z=(t,e)=>`${t}--${e}`;let D=!0;void 0===window.ShadyCSS?D=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected.Please update to at least @webcomponents/webcomponentsjs@2.0.2 and@webcomponents/shadycss@1.3.1."),D=!1);const L=t=>e=>{const n=z(e.type,t);let i=T.get(n);void 0===i&&(i={stringsArray:new WeakMap,keyString:new Map},T.set(n,i));let o=i.stringsArray.get(e.strings);if(void 0!==o)return o;const r=e.strings.join(l);if(void 0===(o=i.keyString.get(r))){const n=e.getTemplateElement();D&&window.ShadyCSS.prepareTemplateDom(n,t),o=new d(e,n),i.keyString.set(r,o)}return i.stringsArray.set(e.strings,o),o},q=["html","svg"],j=new Set,H=(t,e,n)=>{j.add(n);const i=t.querySelectorAll("style");if(0===i.length)return;const o=document.createElement("style");for(let t=0;t<i.length;t++){const e=i[t];e.parentNode.removeChild(e),o.textContent+=e.textContent}if((t=>{q.forEach(e=>{const n=T.get(z(e,t));void 0!==n&&n.keyString.forEach(t=>{const{element:{content:e}}=t,n=new Set;Array.from(e.querySelectorAll("style")).forEach(t=>{n.add(t)}),R(t,n)})})})(n),function(t,e,n=null){const{element:{content:i},parts:o}=t;if(null==n)return void i.appendChild(e);const r=document.createTreeWalker(i,O,null,!1);let s=F(o),a=0,l=-1;for(;r.nextNode();)for(l++,r.currentNode===n&&(a=$(e),n.parentNode.insertBefore(e,n));-1!==s&&o[s].index===l;){if(a>0){for(;-1!==s;)o[s].index+=a,s=F(o,s);return}s=F(o,s)}}(e,o,e.element.content.firstChild),window.ShadyCSS.prepareTemplateStyles(e.element,n),window.ShadyCSS.nativeShadow){const n=e.element.content.querySelector("style");t.insertBefore(n.cloneNode(!0),t.firstChild)}else{e.element.content.insertBefore(o,e.element.content.firstChild);const t=new Set;t.add(o),R(e,t)}},V=t=>null!==t,B=t=>t?"":null,G=(t,e)=>e!==t&&(e==e||t==t),U={attribute:!0,type:String,reflect:!1,hasChanged:G},W=new Promise(t=>t(!0)),Y=1,K=4,J=8;class X extends HTMLElement{constructor(){super(),this._updateState=0,this._instanceProperties=void 0,this._updatePromise=W,this._changedProperties=new Map,this._reflectingProperties=void 0,this.initialize()}static get observedAttributes(){this._finalize();const t=[];for(const[e,n]of this._classProperties){const i=this._attributeNameForProperty(e,n);void 0!==i&&(this._attributeToPropertyMap.set(i,e),t.push(i))}return t}static createProperty(t,e=U){if(!this.hasOwnProperty("_classProperties")){this._classProperties=new Map;const t=Object.getPrototypeOf(this)._classProperties;void 0!==t&&t.forEach((t,e)=>this._classProperties.set(e,t))}if(this._classProperties.set(t,e),this.prototype.hasOwnProperty(t))return;const n="symbol"==typeof t?Symbol():`__${t}`;Object.defineProperty(this.prototype,t,{get(){return this[n]},set(i){const o=this[t];this[n]=i,this._requestPropertyUpdate(t,o,e)},configurable:!0,enumerable:!0})}static _finalize(){if(this.hasOwnProperty("_finalized")&&this._finalized)return;const t=Object.getPrototypeOf(this);"function"==typeof t._finalize&&t._finalize(),this._finalized=!0,this._attributeToPropertyMap=new Map;const e=this.properties,n=[...Object.getOwnPropertyNames(e),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(e):[]];for(const t of n)this.createProperty(t,e[t])}static _attributeNameForProperty(t,e){const n=void 0!==e&&e.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof t?t.toLowerCase():void 0}static _valueHasChanged(t,e,n=G){return n(t,e)}static _propertyValueFromAttribute(t,e){const n=e&&e.type;if(void 0===n)return t;const i=n===Boolean?V:"function"==typeof n?n:n.fromAttribute;return i?i(t):t}static _propertyValueToAttribute(t,e){if(void 0===e||void 0===e.reflect)return;return(e.type===Boolean?B:e.type&&e.type.toAttribute||String)(t)}initialize(){this.renderRoot=this.createRenderRoot(),this._saveInstanceProperties()}_saveInstanceProperties(){for(const[t]of this.constructor._classProperties)if(this.hasOwnProperty(t)){const e=this[t];delete this[t],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(t,e)}}_applyInstanceProperties(){for(const[t,e]of this._instanceProperties)this[t]=e;this._instanceProperties=void 0}createRenderRoot(){return this.attachShadow({mode:"open"})}connectedCallback(){this._updateState&Y?void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this):this.requestUpdate()}disconnectedCallback(){}attributeChangedCallback(t,e,n){e!==n&&this._attributeToProperty(t,n)}_propertyToAttribute(t,e,n=U){const i=this.constructor,o=i._propertyValueToAttribute(e,n);if(void 0!==o){const e=i._attributeNameForProperty(t,n);void 0!==e&&(this._updateState=this._updateState|J,null===o?this.removeAttribute(e):this.setAttribute(e,o),this._updateState=this._updateState&~J)}}_attributeToProperty(t,e){if(!(this._updateState&J)){const n=this.constructor,i=n._attributeToPropertyMap.get(t);if(void 0!==i){const t=n._classProperties.get(i);this[i]=n._propertyValueFromAttribute(e,t)}}}requestUpdate(t,e){if(void 0!==t){const n=this.constructor._classProperties.get(t)||U;return this._requestPropertyUpdate(t,e,n)}return this._invalidate()}_requestPropertyUpdate(t,e,n){return this.constructor._valueHasChanged(this[t],e,n.hasChanged)?(this._changedProperties.has(t)||this._changedProperties.set(t,e),!0===n.reflect&&(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(t,n)),this._invalidate()):this.updateComplete}async _invalidate(){if(!this._hasRequestedUpdate){let t;this._updateState=this._updateState|K;const e=this._updatePromise;this._updatePromise=new Promise(e=>t=e),await e,this._validate(),t(!this._hasRequestedUpdate)}return this.updateComplete}get _hasRequestedUpdate(){return this._updateState&K}_validate(){if(this._instanceProperties&&this._applyInstanceProperties(),this.shouldUpdate(this._changedProperties)){const t=this._changedProperties;this.update(t),this._markUpdated(),this._updateState&Y||(this._updateState=this._updateState|Y,this.firstUpdated(t)),this.updated(t)}else this._markUpdated()}_markUpdated(){this._changedProperties=new Map,this._updateState=this._updateState&~K}get updateComplete(){return this._updatePromise}shouldUpdate(t){return!0}update(t){if(void 0!==this._reflectingProperties&&this._reflectingProperties.size>0){for(const[t,e]of this._reflectingProperties)this._propertyToAttribute(t,this[t],e);this._reflectingProperties=void 0}}updated(t){}firstUpdated(t){}}X._attributeToPropertyMap=new Map,X._finalized=!0,X._classProperties=new Map,X.properties={};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
Q((t,e)=>t.querySelector(e)),Q((t,e)=>t.querySelectorAll(e));function Q(t){return e=>(n,i)=>{Object.defineProperty(n,i,{get(){return t(this.renderRoot,e)},enumerable:!0,configurable:!0})}}n.d(e,"a",function(){return Z}),n.d(e,"b",function(){return P});
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class Z extends X{update(t){super.update(t);const e=this.render();e instanceof m&&this.constructor.render(e,this.renderRoot,{scopeName:this.localName,eventContext:this})}render(){}}Z.render=((t,e,n)=>{const i=n.scopeName,o=N.has(e),r=e instanceof ShadowRoot&&D&&t instanceof m,a=r&&!j.has(i),l=a?document.createDocumentFragment():e;if(((t,e,n)=>{let i=N.get(e);void 0===i&&(s(e,e.firstChild),N.set(e,i=new _(Object.assign({templateFactory:C},n))),i.appendInto(e)),i.setValue(t),i.commit()})(t,l,Object.assign({templateFactory:L(i)},n)),a){const t=N.get(l);N.delete(l),t.value instanceof b&&H(l,t.value.template,i),s(e,e.firstChild),e.appendChild(l),N.set(e,t)}!o&&r&&window.ShadyCSS.styleElement(e.host)})},function(t,e,n){var i=n(3),o=n(13),r=n(16),s=n(17),a=n(21),l=function(t,e,n){var c,u,h,d,p=t&l.F,f=t&l.G,v=t&l.S,b=t&l.P,m=t&l.B,g=f?i:v?i[e]||(i[e]={}):(i[e]||{}).prototype,y=f?o:o[e]||(o[e]={}),x=y.prototype||(y.prototype={});for(c in f&&(n=e),n)h=((u=!p&&g&&void 0!==g[c])?g:n)[c],d=m&&u?a(h,i):b&&"function"==typeof h?a(Function.call,h):h,g&&s(g,c,h,t&l.U),y[c]!=h&&r(y,c,d),b&&x[c]!=h&&(x[c]=h)};i.core=o,l.F=1,l.G=2,l.S=4,l.P=8,l.B=16,l.W=32,l.U=64,l.R=128,t.exports=l},function(t,e,n){var i=n(4);t.exports=function(t){if(!i(t))throw TypeError(t+" is not an object!");return t}},function(t,e){var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e,n){var i=n(54)("wks"),o=n(39),r=n(3).Symbol,s="function"==typeof r;(t.exports=function(t){return i[t]||(i[t]=s&&r[t]||(s?r:o)("Symbol."+t))}).store=i},function(t,e,n){"use strict";(function(t){n.d(e,"a",function(){return o});var i=n(0);class o extends i.a{static get properties(){return{collapsed:{type:Boolean}}}constructor(){super(),this.collapsed=!1,this._syncTimeout=-1}setAttribute(t,e,n){e.set(n)}bind(e){Array.from(this.shadowRoot.querySelectorAll("[attribute]")).forEach(n=>{const i=n.getAttribute("attribute");this.addEventListener(i,n=>{t.Tone.isDefined(e[i])&&(t.Tone.isDefined(e[i].value)?e[i].value=n.detail:e[i]=n.detail),this.sync(e)})}),Array.from(this.shadowRoot.querySelectorAll("[component]")).forEach(t=>{const n=t.getAttribute("component");t&&t.bind(e[n])}),this.sync(e),this.addEventListener("collapse",()=>this.sync(e)),this.addEventListener("sync",()=>this.sync(e))}sync(t){Array.from(this.shadowRoot.querySelectorAll("[attribute]")).forEach(e=>{const n=e.getAttribute("attribute");void 0!==t[n]&&e.sync(t)}),Array.from(this.shadowRoot.querySelectorAll("[component]")).forEach(e=>{const n=e.getAttribute("component");void 0!==t[n]&&e.sync(t[n])}),clearTimeout(this._syncTimeout),this._syncTimeout=setTimeout(()=>{const e=Array.from(this.shadowRoot.querySelectorAll(".viz"));e.length&&e.forEach(e=>e.visualize(t))},10)}}}).call(this,n(135))},function(t,e,n){var i=n(2),o=n(100),r=n(24),s=Object.defineProperty;e.f=n(9)?Object.defineProperty:function(t,e,n){if(i(t),e=r(e,!0),i(n),o)try{return s(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[e]=n.value),t}},function(t,e,n){t.exports=!n(5)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,e,n){var i=n(26),o=Math.min;t.exports=function(t){return t>0?o(i(t),9007199254740991):0}},function(t,e,n){var i=n(25);t.exports=function(t){return Object(i(t))}},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e){var n=t.exports={version:"2.5.7"};"number"==typeof __e&&(__e=n)},function(t,e,n){var i=n(51),o=n(25);t.exports=function(t){return i(o(t))}},function(t,e){var n={}.hasOwnProperty;t.exports=function(t,e){return n.call(t,e)}},function(t,e,n){var i=n(8),o=n(33);t.exports=n(9)?function(t,e,n){return i.f(t,e,o(1,n))}:function(t,e,n){return t[e]=n,t}},function(t,e,n){var i=n(3),o=n(16),r=n(15),s=n(39)("src"),a=Function.toString,l=(""+a).split("toString");n(13).inspectSource=function(t){return a.call(t)},(t.exports=function(t,e,n,a){var c="function"==typeof n;c&&(r(n,"name")||o(n,"name",e)),t[e]!==n&&(c&&(r(n,s)||o(n,s,t[e]?""+t[e]:l.join(String(e)))),t===i?t[e]=n:a?t[e]?t[e]=n:o(t,e,n):(delete t[e],o(t,e,n)))})(Function.prototype,"toString",function(){return"function"==typeof this&&this[s]||a.call(this)})},function(t,e,n){var i=n(52),o=n(33),r=n(14),s=n(24),a=n(15),l=n(100),c=Object.getOwnPropertyDescriptor;e.f=n(9)?c:function(t,e){if(t=r(t),e=s(e,!0),l)try{return c(t,e)}catch(t){}if(a(t,e))return o(!i.f.call(t,e),t[e])}},function(t,e,n){var i=n(15),o=n(11),r=n(73)("IE_PROTO"),s=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),i(t,r)?t[r]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?s:null}},function(t,e,n){var i=n(1),o=n(5),r=n(25),s=/"/g,a=function(t,e,n,i){var o=String(r(t)),a="<"+e;return""!==n&&(a+=" "+n+'="'+String(i).replace(s,"&quot;")+'"'),a+">"+o+"</"+e+">"};t.exports=function(t,e){var n={};n[t]=e(a),i(i.P+i.F*o(function(){var e=""[t]('"');return e!==e.toLowerCase()||e.split('"').length>3}),"String",n)}},function(t,e,n){var i=n(12);t.exports=function(t,e,n){if(i(t),void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 2:return function(n,i){return t.call(e,n,i)};case 3:return function(n,i,o){return t.call(e,n,i,o)}}return function(){return t.apply(e,arguments)}}},function(t,e){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},function(t,e,n){"use strict";var i=n(5);t.exports=function(t,e){return!!t&&i(function(){e?t.call(null,function(){},1):t.call(null)})}},function(t,e,n){var i=n(4);t.exports=function(t,e){if(!i(t))return t;var n,o;if(e&&"function"==typeof(n=t.toString)&&!i(o=n.call(t)))return o;if("function"==typeof(n=t.valueOf)&&!i(o=n.call(t)))return o;if(!e&&"function"==typeof(n=t.toString)&&!i(o=n.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,e){t.exports=function(t){if(null==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e){var n=Math.ceil,i=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?i:n)(t)}},function(t,e,n){var i=n(1),o=n(13),r=n(5);t.exports=function(t,e){var n=(o.Object||{})[t]||Object[t],s={};s[t]=e(n),i(i.S+i.F*r(function(){n(1)}),"Object",s)}},function(t,e,n){var i=n(21),o=n(51),r=n(11),s=n(10),a=n(89);t.exports=function(t,e){var n=1==t,l=2==t,c=3==t,u=4==t,h=6==t,d=5==t||h,p=e||a;return function(e,a,f){for(var v,b,m=r(e),g=o(m),y=i(a,f,3),x=s(g.length),_=0,w=n?p(e,x):l?p(e,0):void 0;x>_;_++)if((d||_ in g)&&(b=y(v=g[_],_,m),t))if(n)w[_]=b;else if(b)switch(t){case 3:return!0;case 5:return v;case 6:return _;case 2:w.push(v)}else if(u)return!1;return h?-1:c||u?u:w}}},function(t,e,n){var i=n(102),o=n(74);t.exports=Object.keys||function(t){return i(t,o)}},function(t,e,n){var i=n(2),o=n(103),r=n(74),s=n(73)("IE_PROTO"),a=function(){},l=function(){var t,e=n(71)("iframe"),i=r.length;for(e.style.display="none",n(75).appendChild(e),e.src="javascript:",(t=e.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),l=t.F;i--;)delete l.prototype[r[i]];return l()};t.exports=Object.create||function(t,e){var n;return null!==t?(a.prototype=i(t),n=new a,a.prototype=null,n[s]=t):n=l(),void 0===e?n:o(n,e)}},function(t,e,n){"use strict";if(n(9)){var i=n(35),o=n(3),r=n(5),s=n(1),a=n(67),l=n(96),c=n(21),u=n(45),h=n(33),d=n(16),p=n(46),f=n(26),v=n(10),b=n(123),m=n(40),g=n(24),y=n(15),x=n(42),_=n(4),w=n(11),S=n(87),E=n(30),k=n(19),M=n(41).f,A=n(53),I=n(39),C=n(6),T=n(28),N=n(55),P=n(64),O=n(91),R=n(43),$=n(61),F=n(44),z=n(90),D=n(114),L=n(8),q=n(18),j=L.f,H=q.f,V=o.RangeError,B=o.TypeError,G=o.Uint8Array,U=Array.prototype,W=l.ArrayBuffer,Y=l.DataView,K=T(0),J=T(2),X=T(3),Q=T(4),Z=T(5),tt=T(6),et=N(!0),nt=N(!1),it=O.values,ot=O.keys,rt=O.entries,st=U.lastIndexOf,at=U.reduce,lt=U.reduceRight,ct=U.join,ut=U.sort,ht=U.slice,dt=U.toString,pt=U.toLocaleString,ft=C("iterator"),vt=C("toStringTag"),bt=I("typed_constructor"),mt=I("def_constructor"),gt=a.CONSTR,yt=a.TYPED,xt=a.VIEW,_t=T(1,function(t,e){return Mt(P(t,t[mt]),e)}),wt=r(function(){return 1===new G(new Uint16Array([1]).buffer)[0]}),St=!!G&&!!G.prototype.set&&r(function(){new G(1).set({})}),Et=function(t,e){var n=f(t);if(n<0||n%e)throw V("Wrong offset!");return n},kt=function(t){if(_(t)&&yt in t)return t;throw B(t+" is not a typed array!")},Mt=function(t,e){if(!(_(t)&&bt in t))throw B("It is not a typed array constructor!");return new t(e)},At=function(t,e){return It(P(t,t[mt]),e)},It=function(t,e){for(var n=0,i=e.length,o=Mt(t,i);i>n;)o[n]=e[n++];return o},Ct=function(t,e,n){j(t,e,{get:function(){return this._d[n]}})},Tt=function(t){var e,n,i,o,r,s,a=w(t),l=arguments.length,u=l>1?arguments[1]:void 0,h=void 0!==u,d=A(a);if(null!=d&&!S(d)){for(s=d.call(a),i=[],e=0;!(r=s.next()).done;e++)i.push(r.value);a=i}for(h&&l>2&&(u=c(u,arguments[2],2)),e=0,n=v(a.length),o=Mt(this,n);n>e;e++)o[e]=h?u(a[e],e):a[e];return o},Nt=function(){for(var t=0,e=arguments.length,n=Mt(this,e);e>t;)n[t]=arguments[t++];return n},Pt=!!G&&r(function(){pt.call(new G(1))}),Ot=function(){return pt.apply(Pt?ht.call(kt(this)):kt(this),arguments)},Rt={copyWithin:function(t,e){return D.call(kt(this),t,e,arguments.length>2?arguments[2]:void 0)},every:function(t){return Q(kt(this),t,arguments.length>1?arguments[1]:void 0)},fill:function(t){return z.apply(kt(this),arguments)},filter:function(t){return At(this,J(kt(this),t,arguments.length>1?arguments[1]:void 0))},find:function(t){return Z(kt(this),t,arguments.length>1?arguments[1]:void 0)},findIndex:function(t){return tt(kt(this),t,arguments.length>1?arguments[1]:void 0)},forEach:function(t){K(kt(this),t,arguments.length>1?arguments[1]:void 0)},indexOf:function(t){return nt(kt(this),t,arguments.length>1?arguments[1]:void 0)},includes:function(t){return et(kt(this),t,arguments.length>1?arguments[1]:void 0)},join:function(t){return ct.apply(kt(this),arguments)},lastIndexOf:function(t){return st.apply(kt(this),arguments)},map:function(t){return _t(kt(this),t,arguments.length>1?arguments[1]:void 0)},reduce:function(t){return at.apply(kt(this),arguments)},reduceRight:function(t){return lt.apply(kt(this),arguments)},reverse:function(){for(var t,e=kt(this).length,n=Math.floor(e/2),i=0;i<n;)t=this[i],this[i++]=this[--e],this[e]=t;return this},some:function(t){return X(kt(this),t,arguments.length>1?arguments[1]:void 0)},sort:function(t){return ut.call(kt(this),t)},subarray:function(t,e){var n=kt(this),i=n.length,o=m(t,i);return new(P(n,n[mt]))(n.buffer,n.byteOffset+o*n.BYTES_PER_ELEMENT,v((void 0===e?i:m(e,i))-o))}},$t=function(t,e){return At(this,ht.call(kt(this),t,e))},Ft=function(t){kt(this);var e=Et(arguments[1],1),n=this.length,i=w(t),o=v(i.length),r=0;if(o+e>n)throw V("Wrong length!");for(;r<o;)this[e+r]=i[r++]},zt={entries:function(){return rt.call(kt(this))},keys:function(){return ot.call(kt(this))},values:function(){return it.call(kt(this))}},Dt=function(t,e){return _(t)&&t[yt]&&"symbol"!=typeof e&&e in t&&String(+e)==String(e)},Lt=function(t,e){return Dt(t,e=g(e,!0))?h(2,t[e]):H(t,e)},qt=function(t,e,n){return!(Dt(t,e=g(e,!0))&&_(n)&&y(n,"value"))||y(n,"get")||y(n,"set")||n.configurable||y(n,"writable")&&!n.writable||y(n,"enumerable")&&!n.enumerable?j(t,e,n):(t[e]=n.value,t)};gt||(q.f=Lt,L.f=qt),s(s.S+s.F*!gt,"Object",{getOwnPropertyDescriptor:Lt,defineProperty:qt}),r(function(){dt.call({})})&&(dt=pt=function(){return ct.call(this)});var jt=p({},Rt);p(jt,zt),d(jt,ft,zt.values),p(jt,{slice:$t,set:Ft,constructor:function(){},toString:dt,toLocaleString:Ot}),Ct(jt,"buffer","b"),Ct(jt,"byteOffset","o"),Ct(jt,"byteLength","l"),Ct(jt,"length","e"),j(jt,vt,{get:function(){return this[yt]}}),t.exports=function(t,e,n,l){var c=t+((l=!!l)?"Clamped":"")+"Array",h="get"+t,p="set"+t,f=o[c],m=f||{},g=f&&k(f),y=!f||!a.ABV,w={},S=f&&f.prototype,A=function(t,n){j(t,n,{get:function(){return function(t,n){var i=t._d;return i.v[h](n*e+i.o,wt)}(this,n)},set:function(t){return function(t,n,i){var o=t._d;l&&(i=(i=Math.round(i))<0?0:i>255?255:255&i),o.v[p](n*e+o.o,i,wt)}(this,n,t)},enumerable:!0})};y?(f=n(function(t,n,i,o){u(t,f,c,"_d");var r,s,a,l,h=0,p=0;if(_(n)){if(!(n instanceof W||"ArrayBuffer"==(l=x(n))||"SharedArrayBuffer"==l))return yt in n?It(f,n):Tt.call(f,n);r=n,p=Et(i,e);var m=n.byteLength;if(void 0===o){if(m%e)throw V("Wrong length!");if((s=m-p)<0)throw V("Wrong length!")}else if((s=v(o)*e)+p>m)throw V("Wrong length!");a=s/e}else a=b(n),r=new W(s=a*e);for(d(t,"_d",{b:r,o:p,l:s,e:a,v:new Y(r)});h<a;)A(t,h++)}),S=f.prototype=E(jt),d(S,"constructor",f)):r(function(){f(1)})&&r(function(){new f(-1)})&&$(function(t){new f,new f(null),new f(1.5),new f(t)},!0)||(f=n(function(t,n,i,o){var r;return u(t,f,c),_(n)?n instanceof W||"ArrayBuffer"==(r=x(n))||"SharedArrayBuffer"==r?void 0!==o?new m(n,Et(i,e),o):void 0!==i?new m(n,Et(i,e)):new m(n):yt in n?It(f,n):Tt.call(f,n):new m(b(n))}),K(g!==Function.prototype?M(m).concat(M(g)):M(m),function(t){t in f||d(f,t,m[t])}),f.prototype=S,i||(S.constructor=f));var I=S[ft],C=!!I&&("values"==I.name||null==I.name),T=zt.values;d(f,bt,!0),d(S,yt,c),d(S,xt,!0),d(S,mt,f),(l?new f(1)[vt]==c:vt in S)||j(S,vt,{get:function(){return c}}),w[c]=f,s(s.G+s.W+s.F*(f!=m),w),s(s.S,c,{BYTES_PER_ELEMENT:e}),s(s.S+s.F*r(function(){m.of.call(f,1)}),c,{from:Tt,of:Nt}),"BYTES_PER_ELEMENT"in S||d(S,"BYTES_PER_ELEMENT",e),s(s.P,c,Rt),F(c),s(s.P+s.F*St,c,{set:Ft}),s(s.P+s.F*!C,c,zt),i||S.toString==dt||(S.toString=dt),s(s.P+s.F*r(function(){new f(1).slice()}),c,{slice:$t}),s(s.P+s.F*(r(function(){return[1,2].toLocaleString()!=new f([1,2]).toLocaleString()})||!r(function(){S.toLocaleString.call([1,2])})),c,{toLocaleString:Ot}),R[c]=C?I:T,i||C||d(S,ft,T)}}else t.exports=function(){}},function(t,e,n){var i=n(118),o=n(1),r=n(54)("metadata"),s=r.store||(r.store=new(n(121))),a=function(t,e,n){var o=s.get(t);if(!o){if(!n)return;s.set(t,o=new i)}var r=o.get(e);if(!r){if(!n)return;o.set(e,r=new i)}return r};t.exports={store:s,map:a,has:function(t,e,n){var i=a(e,n,!1);return void 0!==i&&i.has(t)},get:function(t,e,n){var i=a(e,n,!1);return void 0===i?void 0:i.get(t)},set:function(t,e,n,i){a(n,i,!0).set(t,e)},keys:function(t,e){var n=a(t,e,!1),i=[];return n&&n.forEach(function(t,e){i.push(e)}),i},key:function(t){return void 0===t||"symbol"==typeof t?t:String(t)},exp:function(t){o(o.S,"Reflect",t)}}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e,n){var i=n(39)("meta"),o=n(4),r=n(15),s=n(8).f,a=0,l=Object.isExtensible||function(){return!0},c=!n(5)(function(){return l(Object.preventExtensions({}))}),u=function(t){s(t,i,{value:{i:"O"+ ++a,w:{}}})},h=t.exports={KEY:i,NEED:!1,fastKey:function(t,e){if(!o(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!r(t,i)){if(!l(t))return"F";if(!e)return"E";u(t)}return t[i].i},getWeak:function(t,e){if(!r(t,i)){if(!l(t))return!0;if(!e)return!1;u(t)}return t[i].w},onFreeze:function(t){return c&&h.NEED&&l(t)&&!r(t,i)&&u(t),t}}},function(t,e){t.exports=!1},function(t,e,n){var i=n(6)("unscopables"),o=Array.prototype;null==o[i]&&n(16)(o,i,{}),t.exports=function(t){o[i][t]=!0}},function(t,e,n){var i=n(21),o=n(112),r=n(87),s=n(2),a=n(10),l=n(53),c={},u={};(e=t.exports=function(t,e,n,h,d){var p,f,v,b,m=d?function(){return t}:l(t),g=i(n,h,e?2:1),y=0;if("function"!=typeof m)throw TypeError(t+" is not iterable!");if(r(m)){for(p=a(t.length);p>y;y++)if((b=e?g(s(f=t[y])[0],f[1]):g(t[y]))===c||b===u)return b}else for(v=m.call(t);!(f=v.next()).done;)if((b=o(v,g,f.value,e))===c||b===u)return b}).BREAK=c,e.RETURN=u},function(t,e,n){var i;!function(n){"use strict";function o(){if(o.prototype._singleton)throw new Error("WebMidi is a singleton, it cannot be instantiated directly.");o.prototype._singleton=this,this._inputs=[],this._outputs=[],this._userHandlers={},this._stateChangeQueue=[],this._processingStateChange=!1,this._midiInterfaceEvents=["connected","disconnected"],this._notes=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],this._semitones={C:0,D:2,E:4,F:5,G:7,A:9,B:11},Object.defineProperties(this,{MIDI_SYSTEM_MESSAGES:{value:{sysex:240,timecode:241,songposition:242,songselect:243,tuningrequest:246,sysexend:247,clock:248,start:250,continue:251,stop:252,activesensing:254,reset:255,midimessage:0,unknownsystemmessage:-1},writable:!1,enumerable:!0,configurable:!1},MIDI_CHANNEL_MESSAGES:{value:{noteoff:8,noteon:9,keyaftertouch:10,controlchange:11,channelmode:11,programchange:12,channelaftertouch:13,pitchbend:14},writable:!1,enumerable:!0,configurable:!1},MIDI_REGISTERED_PARAMETER:{value:{pitchbendrange:[0,0],channelfinetuning:[0,1],channelcoarsetuning:[0,2],tuningprogram:[0,3],tuningbank:[0,4],modulationrange:[0,5],azimuthangle:[61,0],elevationangle:[61,1],gain:[61,2],distanceratio:[61,3],maximumdistance:[61,4],maximumdistancegain:[61,5],referencedistanceratio:[61,6],panspreadangle:[61,7],rollangle:[61,8]},writable:!1,enumerable:!0,configurable:!1},MIDI_CONTROL_CHANGE_MESSAGES:{value:{bankselectcoarse:0,modulationwheelcoarse:1,breathcontrollercoarse:2,footcontrollercoarse:4,portamentotimecoarse:5,dataentrycoarse:6,volumecoarse:7,balancecoarse:8,pancoarse:10,expressioncoarse:11,effectcontrol1coarse:12,effectcontrol2coarse:13,generalpurposeslider1:16,generalpurposeslider2:17,generalpurposeslider3:18,generalpurposeslider4:19,bankselectfine:32,modulationwheelfine:33,breathcontrollerfine:34,footcontrollerfine:36,portamentotimefine:37,dataentryfine:38,volumefine:39,balancefine:40,panfine:42,expressionfine:43,effectcontrol1fine:44,effectcontrol2fine:45,holdpedal:64,portamento:65,sustenutopedal:66,softpedal:67,legatopedal:68,hold2pedal:69,soundvariation:70,resonance:71,soundreleasetime:72,soundattacktime:73,brightness:74,soundcontrol6:75,soundcontrol7:76,soundcontrol8:77,soundcontrol9:78,soundcontrol10:79,generalpurposebutton1:80,generalpurposebutton2:81,generalpurposebutton3:82,generalpurposebutton4:83,reverblevel:91,tremololevel:92,choruslevel:93,celestelevel:94,phaserlevel:95,databuttonincrement:96,databuttondecrement:97,nonregisteredparametercoarse:98,nonregisteredparameterfine:99,registeredparametercoarse:100,registeredparameterfine:101},writable:!1,enumerable:!0,configurable:!1},MIDI_CHANNEL_MODE_MESSAGES:{value:{allsoundoff:120,resetallcontrollers:121,localcontrol:122,allnotesoff:123,omnimodeoff:124,omnimodeon:125,monomodeon:126,polymodeon:127},writable:!1,enumerable:!0,configurable:!1},octaveOffset:{value:0,writable:!0,enumerable:!0,configurable:!1}}),Object.defineProperties(this,{supported:{enumerable:!0,get:function(){return"requestMIDIAccess"in navigator}},enabled:{enumerable:!0,get:function(){return void 0!==this.interface}.bind(this)},inputs:{enumerable:!0,get:function(){return this._inputs}.bind(this)},outputs:{enumerable:!0,get:function(){return this._outputs}.bind(this)},sysexEnabled:{enumerable:!0,get:function(){return!(!this.interface||!this.interface.sysexEnabled)}.bind(this)},time:{enumerable:!0,get:function(){return performance.now()}}})}function r(t){var e=this;this._userHandlers={channel:{},system:{}},this._midiInput=t,Object.defineProperties(this,{connection:{enumerable:!0,get:function(){return e._midiInput.connection}},id:{enumerable:!0,get:function(){return e._midiInput.id}},manufacturer:{enumerable:!0,get:function(){return e._midiInput.manufacturer}},name:{enumerable:!0,get:function(){return e._midiInput.name}},state:{enumerable:!0,get:function(){return e._midiInput.state}},type:{enumerable:!0,get:function(){return e._midiInput.type}}}),this._initializeUserHandlers(),this._midiInput.onmidimessage=this._onMidiMessage.bind(this)}function s(t){var e=this;this._midiOutput=t,Object.defineProperties(this,{connection:{enumerable:!0,get:function(){return e._midiOutput.connection}},id:{enumerable:!0,get:function(){return e._midiOutput.id}},manufacturer:{enumerable:!0,get:function(){return e._midiOutput.manufacturer}},name:{enumerable:!0,get:function(){return e._midiOutput.name}},state:{enumerable:!0,get:function(){return e._midiOutput.state}},type:{enumerable:!0,get:function(){return e._midiOutput.type}}})}var a=new o;o.prototype.enable=function(t,e){return this.enabled?void 0:this.supported?void navigator.requestMIDIAccess({sysex:e}).then(function(e){function n(){clearTimeout(i),this._updateInputsAndOutputs(),this.interface.onstatechange=this._onInterfaceStateChange.bind(this),"function"==typeof t&&t.call(this),o.forEach(function(t){this._onInterfaceStateChange(t)}.bind(this))}var i,o=[],r=[];this.interface=e,this._resetInterfaceUserHandlers(),this.interface.onstatechange=function(t){o.push(t)};for(var s=e.inputs.values(),a=s.next();a&&!a.done;a=s.next())r.push(a.value.open());for(var l=e.outputs.values(),c=l.next();c&&!c.done;c=l.next())r.push(c.value.open());i=setTimeout(n.bind(this),200),Promise&&Promise.all(r).catch(function(t){}).then(n.bind(this))}.bind(this),function(e){"function"==typeof t&&t.call(this,e)}.bind(this)):void("function"==typeof t&&t(new Error("The Web MIDI API is not supported by your browser.")))},o.prototype.disable=function(){if(!this.supported)throw new Error("The Web MIDI API is not supported by your browser.");this.interface&&(this.interface.onstatechange=void 0),this.interface=void 0,this._inputs=[],this._outputs=[],this._resetInterfaceUserHandlers()},o.prototype.addListener=function(t,e){if(!this.enabled)throw new Error("WebMidi must be enabled before adding event listeners.");if("function"!=typeof e)throw new TypeError("The 'listener' parameter must be a function.");if(!(this._midiInterfaceEvents.indexOf(t)>=0))throw new TypeError("The specified event type is not supported.");return this._userHandlers[t].push(e),this},o.prototype.hasListener=function(t,e){if(!this.enabled)throw new Error("WebMidi must be enabled before checking event listeners.");if("function"!=typeof e)throw new TypeError("The 'listener' parameter must be a function.");if(!(this._midiInterfaceEvents.indexOf(t)>=0))throw new TypeError("The specified event type is not supported.");for(var n=0;n<this._userHandlers[t].length;n++)if(this._userHandlers[t][n]===e)return!0;return!1},o.prototype.removeListener=function(t,e){if(!this.enabled)throw new Error("WebMidi must be enabled before removing event listeners.");if(void 0!==e&&"function"!=typeof e)throw new TypeError("The 'listener' parameter must be a function.");if(this._midiInterfaceEvents.indexOf(t)>=0)if(e)for(var n=0;n<this._userHandlers[t].length;n++)this._userHandlers[t][n]===e&&this._userHandlers[t].splice(n,1);else this._userHandlers[t]=[];else{if(void 0!==t)throw new TypeError("The specified event type is not supported.");this._resetInterfaceUserHandlers()}return this},o.prototype.toMIDIChannels=function(t){var e;return(e="all"===t||void 0===t?["all"]:Array.isArray(t)?t:[t]).indexOf("all")>-1&&(e=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]),e.map(function(t){return parseInt(t)}).filter(function(t){return t>=1&&16>=t})},o.prototype.getInputById=function(t){if(!this.enabled)throw new Error("WebMidi is not enabled.");for(var e=0;e<this.inputs.length;e++)if(this.inputs[e].id===t)return this.inputs[e];return!1},o.prototype.getOutputById=function(t){if(!this.enabled)throw new Error("WebMidi is not enabled.");for(var e=0;e<this.outputs.length;e++)if(this.outputs[e].id===t)return this.outputs[e];return!1},o.prototype.getInputByName=function(t){if(!this.enabled)throw new Error("WebMidi is not enabled.");for(var e=0;e<this.inputs.length;e++)if(~this.inputs[e].name.indexOf(t))return this.inputs[e];return!1},o.prototype.getOctave=function(t){return null!=t&&t>=0&&127>=t?Math.floor(Math.floor(t)/12-1)+Math.floor(a.octaveOffset):void 0},o.prototype.getOutputByName=function(t){if(!this.enabled)throw new Error("WebMidi is not enabled.");for(var e=0;e<this.outputs.length;e++)if(~this.outputs[e].name.indexOf(t))return this.outputs[e];return!1},o.prototype.guessNoteNumber=function(t){var e=!1;if(t&&t.toFixed&&t>=0&&127>=t?e=Math.round(t):parseInt(t)>=0&&parseInt(t)<=127?e=parseInt(t):("string"==typeof t||t instanceof String)&&(e=this.noteNameToNumber(t)),!1===e)throw new Error("Invalid input value ("+t+").");return e},o.prototype.noteNameToNumber=function(t){"string"!=typeof t&&(t="");var e=t.match(/([CDEFGAB])(#{0,2}|b{0,2})(-?\d+)/i);if(!e)throw new RangeError("Invalid note name.");var n=a._semitones[e[1].toUpperCase()],i=12*(parseInt(e[3])+1-Math.floor(a.octaveOffset))+n;if(e[2].toLowerCase().indexOf("b")>-1?i-=e[2].length:e[2].toLowerCase().indexOf("#")>-1&&(i+=e[2].length),0>i||i>127)throw new RangeError("Invalid note name or note outside valid range.");return i},o.prototype._updateInputsAndOutputs=function(){this._updateInputs(),this._updateOutputs()},o.prototype._updateInputs=function(){for(var t=0;t<this._inputs.length;t++){for(var e=!0,n=this.interface.inputs.values(),i=n.next();i&&!i.done;i=n.next())if(this._inputs[t]._midiInput===i.value){e=!1;break}e&&this._inputs.splice(t,1)}this.interface&&this.interface.inputs.forEach(function(t){for(var e=!0,n=0;n<this._inputs.length;n++)this._inputs[n]._midiInput===t&&(e=!1);e&&this._inputs.push(new r(t))}.bind(this))},o.prototype._updateOutputs=function(){for(var t=0;t<this._outputs.length;t++){for(var e=!0,n=this.interface.outputs.values(),i=n.next();i&&!i.done;i=n.next())if(this._outputs[t]._midiOutput===i.value){e=!1;break}e&&this._outputs.splice(t,1)}this.interface&&this.interface.outputs.forEach(function(t){for(var e=!0,n=0;n<this._outputs.length;n++)this._outputs[n]._midiOutput===t&&(e=!1);e&&this._outputs.push(new s(t))}.bind(this))},o.prototype._onInterfaceStateChange=function(t){this._updateInputsAndOutputs();var e={timestamp:t.timeStamp,type:t.port.state};this.interface&&"connected"===t.port.state?"output"===t.port.type?e.port=this.getOutputById(t.port.id):"input"===t.port.type&&(e.port=this.getInputById(t.port.id)):e.port={connection:"closed",id:t.port.id,manufacturer:t.port.manufacturer,name:t.port.name,state:t.port.state,type:t.port.type},this._userHandlers[t.port.state].forEach(function(t){t(e)})},o.prototype._resetInterfaceUserHandlers=function(){for(var t=0;t<this._midiInterfaceEvents.length;t++)this._userHandlers[this._midiInterfaceEvents[t]]=[]},r.prototype.addListener=function(t,e,n){var i=this;if(void 0===e&&(e="all"),Array.isArray(e)||(e=[e]),e.forEach(function(t){if("all"!==t&&!(t>=1&&16>=t))throw new RangeError("The 'channel' parameter is invalid.")}),"function"!=typeof n)throw new TypeError("The 'listener' parameter must be a function.");if(void 0!==a.MIDI_SYSTEM_MESSAGES[t])this._userHandlers.system[t]||(this._userHandlers.system[t]=[]),this._userHandlers.system[t].push(n);else{if(void 0===a.MIDI_CHANNEL_MESSAGES[t])throw new TypeError("The specified event type is not supported.");if(e.indexOf("all")>-1){e=[];for(var o=1;16>=o;o++)e.push(o)}this._userHandlers.channel[t]||(this._userHandlers.channel[t]=[]),e.forEach(function(e){i._userHandlers.channel[t][e]||(i._userHandlers.channel[t][e]=[]),i._userHandlers.channel[t][e].push(n)})}return this},r.prototype.on=r.prototype.addListener,r.prototype.hasListener=function(t,e,n){var i=this;if("function"!=typeof n)throw new TypeError("The 'listener' parameter must be a function.");if(void 0===e&&(e="all"),e.constructor!==Array&&(e=[e]),void 0!==a.MIDI_SYSTEM_MESSAGES[t]){for(var o=0;o<this._userHandlers.system[t].length;o++)if(this._userHandlers.system[t][o]===n)return!0}else if(void 0!==a.MIDI_CHANNEL_MESSAGES[t]){if(e.indexOf("all")>-1){e=[];for(var r=1;16>=r;r++)e.push(r)}return!!this._userHandlers.channel[t]&&e.every(function(e){var o=i._userHandlers.channel[t][e];return o&&o.indexOf(n)>-1})}return!1},r.prototype.removeListener=function(t,e,n){var i=this;if(void 0!==n&&"function"!=typeof n)throw new TypeError("The 'listener' parameter must be a function.");if(void 0===e&&(e="all"),e.constructor!==Array&&(e=[e]),void 0!==a.MIDI_SYSTEM_MESSAGES[t])if(void 0===n)this._userHandlers.system[t]=[];else for(var o=0;o<this._userHandlers.system[t].length;o++)this._userHandlers.system[t][o]===n&&this._userHandlers.system[t].splice(o,1);else if(void 0!==a.MIDI_CHANNEL_MESSAGES[t]){if(e.indexOf("all")>-1){e=[];for(var r=1;16>=r;r++)e.push(r)}if(!this._userHandlers.channel[t])return this;e.forEach(function(e){var o=i._userHandlers.channel[t][e];if(o)if(void 0===n)i._userHandlers.channel[t][e]=[];else for(var r=0;r<o.length;r++)o[r]===n&&o.splice(r,1)})}else{if(void 0!==t)throw new TypeError("The specified event type is not supported.");this._initializeUserHandlers()}return this},r.prototype._initializeUserHandlers=function(){for(var t in a.MIDI_CHANNEL_MESSAGES)a.MIDI_CHANNEL_MESSAGES.hasOwnProperty(t)&&(this._userHandlers.channel[t]={});for(var e in a.MIDI_SYSTEM_MESSAGES)a.MIDI_SYSTEM_MESSAGES.hasOwnProperty(e)&&(this._userHandlers.system[e]=[])},r.prototype._onMidiMessage=function(t){if(this._userHandlers.system.midimessage.length>0){var e={target:this,data:t.data,timestamp:t.timeStamp,type:"midimessage"};this._userHandlers.system.midimessage.forEach(function(t){t(e)})}t.data[0]<240?this._parseChannelEvent(t):t.data[0]<=255&&this._parseSystemEvent(t)},r.prototype._parseChannelEvent=function(t){var e,n,i=t.data[0]>>4,o=1+(15&t.data[0]);t.data.length>1&&(e=t.data[1],n=t.data.length>2?t.data[2]:void 0);var r={target:this,data:t.data,timestamp:t.timeStamp,channel:o};i===a.MIDI_CHANNEL_MESSAGES.noteoff||i===a.MIDI_CHANNEL_MESSAGES.noteon&&0===n?(r.type="noteoff",r.note={number:e,name:a._notes[e%12],octave:a.getOctave(e)},r.velocity=n/127,r.rawVelocity=n):i===a.MIDI_CHANNEL_MESSAGES.noteon?(r.type="noteon",r.note={number:e,name:a._notes[e%12],octave:a.getOctave(e)},r.velocity=n/127,r.rawVelocity=n):i===a.MIDI_CHANNEL_MESSAGES.keyaftertouch?(r.type="keyaftertouch",r.note={number:e,name:a._notes[e%12],octave:a.getOctave(e)},r.value=n/127):i===a.MIDI_CHANNEL_MESSAGES.controlchange&&e>=0&&119>=e?(r.type="controlchange",r.controller={number:e,name:this.getCcNameByNumber(e)},r.value=n):i===a.MIDI_CHANNEL_MESSAGES.channelmode&&e>=120&&127>=e?(r.type="channelmode",r.controller={number:e,name:this.getChannelModeByNumber(e)},r.value=n):i===a.MIDI_CHANNEL_MESSAGES.programchange?(r.type="programchange",r.value=e):i===a.MIDI_CHANNEL_MESSAGES.channelaftertouch?(r.type="channelaftertouch",r.value=e/127):i===a.MIDI_CHANNEL_MESSAGES.pitchbend?(r.type="pitchbend",r.value=((n<<7)+e-8192)/8192):r.type="unknownchannelmessage",this._userHandlers.channel[r.type]&&this._userHandlers.channel[r.type][o]&&this._userHandlers.channel[r.type][o].forEach(function(t){t(r)})},r.prototype.getCcNameByNumber=function(t){if(!((t=Math.floor(t))>=0&&119>=t))throw new RangeError("The control change number must be between 0 and 119.");for(var e in a.MIDI_CONTROL_CHANGE_MESSAGES)if(a.MIDI_CONTROL_CHANGE_MESSAGES.hasOwnProperty(e)&&t===a.MIDI_CONTROL_CHANGE_MESSAGES[e])return e},r.prototype.getChannelModeByNumber=function(t){if(!((t=Math.floor(t))>=120&&status<=127))throw new RangeError("The control change number must be between 120 and 127.");for(var e in a.MIDI_CHANNEL_MODE_MESSAGES)if(a.MIDI_CHANNEL_MODE_MESSAGES.hasOwnProperty(e)&&t===a.MIDI_CHANNEL_MODE_MESSAGES[e])return e},r.prototype._parseSystemEvent=function(t){var e=t.data[0],n={target:this,data:t.data,timestamp:t.timeStamp};e===a.MIDI_SYSTEM_MESSAGES.sysex?n.type="sysex":e===a.MIDI_SYSTEM_MESSAGES.timecode?n.type="timecode":e===a.MIDI_SYSTEM_MESSAGES.songposition?n.type="songposition":e===a.MIDI_SYSTEM_MESSAGES.songselect?(n.type="songselect",n.song=t.data[1]):e===a.MIDI_SYSTEM_MESSAGES.tuningrequest?n.type="tuningrequest":e===a.MIDI_SYSTEM_MESSAGES.clock?n.type="clock":e===a.MIDI_SYSTEM_MESSAGES.start?n.type="start":e===a.MIDI_SYSTEM_MESSAGES.continue?n.type="continue":e===a.MIDI_SYSTEM_MESSAGES.stop?n.type="stop":e===a.MIDI_SYSTEM_MESSAGES.activesensing?n.type="activesensing":e===a.MIDI_SYSTEM_MESSAGES.reset?n.type="reset":n.type="unknownsystemmessage",this._userHandlers.system[n.type]&&this._userHandlers.system[n.type].forEach(function(t){t(n)})},s.prototype.send=function(t,e,n){if(!(t>=128&&255>=t))throw new RangeError("The status byte must be an integer between 128 (0x80) and 255 (0xFF).");void 0===e&&(e=[]),Array.isArray(e)||(e=[e]);var i=[];return e.forEach(function(t,e){var n=Math.floor(t);if(!(n>=0&&255>=n))throw new RangeError("Data bytes must be integers between 0 (0x00) and 255 (0xFF).");i.push(n)}),this._midiOutput.send([t].concat(i),parseFloat(n)||0),this},s.prototype.sendSysex=function(t,e,n){if(!a.sysexEnabled)throw new Error("Sysex message support must first be activated.");return n=n||{},t=[].concat(t),e.forEach(function(t){if(0>t||t>127)throw new RangeError("The data bytes of a sysex message must be integers between 0 (0x00) and 127 (0x7F).")}),e=t.concat(e,a.MIDI_SYSTEM_MESSAGES.sysexend),this.send(a.MIDI_SYSTEM_MESSAGES.sysex,e,this._parseTimeParameter(n.time)),this},s.prototype.sendTimecodeQuarterFrame=function(t,e){return e=e||{},this.send(a.MIDI_SYSTEM_MESSAGES.timecode,t,this._parseTimeParameter(e.time)),this},s.prototype.sendSongPosition=function(t,e){e=e||{};var n=(t=Math.floor(t)||0)>>7&127,i=127&t;return this.send(a.MIDI_SYSTEM_MESSAGES.songposition,[n,i],this._parseTimeParameter(e.time)),this},s.prototype.sendSongSelect=function(t,e){if(e=e||{},!((t=Math.floor(t))>=0&&127>=t))throw new RangeError("The song number must be between 0 and 127.");return this.send(a.MIDI_SYSTEM_MESSAGES.songselect,[t],this._parseTimeParameter(e.time)),this},s.prototype.sendTuningRequest=function(t){return t=t||{},this.send(a.MIDI_SYSTEM_MESSAGES.tuningrequest,void 0,this._parseTimeParameter(t.time)),this},s.prototype.sendClock=function(t){return t=t||{},this.send(a.MIDI_SYSTEM_MESSAGES.clock,void 0,this._parseTimeParameter(t.time)),this},s.prototype.sendStart=function(t){return t=t||{},this.send(a.MIDI_SYSTEM_MESSAGES.start,void 0,this._parseTimeParameter(t.time)),this},s.prototype.sendContinue=function(t){return t=t||{},this.send(a.MIDI_SYSTEM_MESSAGES.continue,void 0,this._parseTimeParameter(t.time)),this},s.prototype.sendStop=function(t){return t=t||{},this.send(a.MIDI_SYSTEM_MESSAGES.stop,void 0,this._parseTimeParameter(t.time)),this},s.prototype.sendActiveSensing=function(t){return t=t||{},this.send(a.MIDI_SYSTEM_MESSAGES.activesensing,[],this._parseTimeParameter(t.time)),this},s.prototype.sendReset=function(t){return t=t||{},this.send(a.MIDI_SYSTEM_MESSAGES.reset,void 0,this._parseTimeParameter(t.time)),this},s.prototype.stopNote=function(t,e,n){if("all"===t)return this.sendChannelMode("allnotesoff",0,e,n);var i=64;return(n=n||{}).rawVelocity?!isNaN(n.velocity)&&n.velocity>=0&&n.velocity<=127&&(i=n.velocity):!isNaN(n.velocity)&&n.velocity>=0&&n.velocity<=1&&(i=127*n.velocity),this._convertNoteToArray(t).forEach(function(t){a.toMIDIChannels(e).forEach(function(e){this.send((a.MIDI_CHANNEL_MESSAGES.noteoff<<4)+(e-1),[t,Math.round(i)],this._parseTimeParameter(n.time))}.bind(this))}.bind(this)),this},s.prototype.playNote=function(t,e,n){var i=64;if((n=n||{}).rawVelocity?!isNaN(n.velocity)&&n.velocity>=0&&n.velocity<=127&&(i=n.velocity):!isNaN(n.velocity)&&n.velocity>=0&&n.velocity<=1&&(i=127*n.velocity),n.time=this._parseTimeParameter(n.time),this._convertNoteToArray(t).forEach(function(t){a.toMIDIChannels(e).forEach(function(e){this.send((a.MIDI_CHANNEL_MESSAGES.noteon<<4)+(e-1),[t,Math.round(i)],n.time)}.bind(this))}.bind(this)),!isNaN(n.duration)){n.duration<=0&&(n.duration=0);var o=64;n.rawVelocity?!isNaN(n.release)&&n.release>=0&&n.release<=127&&(o=n.release):!isNaN(n.release)&&n.release>=0&&n.release<=1&&(o=127*n.release),this._convertNoteToArray(t).forEach(function(t){a.toMIDIChannels(e).forEach(function(e){this.send((a.MIDI_CHANNEL_MESSAGES.noteoff<<4)+(e-1),[t,Math.round(o)],(n.time||a.time)+n.duration)}.bind(this))}.bind(this))}return this},s.prototype.sendKeyAftertouch=function(t,e,n,i){var o=this;if(i=i||{},1>e||e>16)throw new RangeError("The channel must be between 1 and 16.");(isNaN(n)||0>n||n>1)&&(n=.5);var r=Math.round(127*n);return this._convertNoteToArray(t).forEach(function(t){a.toMIDIChannels(e).forEach(function(e){o.send((a.MIDI_CHANNEL_MESSAGES.keyaftertouch<<4)+(e-1),[t,r],o._parseTimeParameter(i.time))})}),this},s.prototype.sendControlChange=function(t,e,n,i){if(i=i||{},"string"==typeof t){if(!(t=a.MIDI_CONTROL_CHANGE_MESSAGES[t]))throw new TypeError("Invalid controller name.")}else if(!((t=Math.floor(t))>=0&&119>=t))throw new RangeError("Controller numbers must be between 0 and 119.");if(!((e=Math.floor(e)||0)>=0&&127>=e))throw new RangeError("Controller value must be between 0 and 127.");return a.toMIDIChannels(n).forEach(function(n){this.send((a.MIDI_CHANNEL_MESSAGES.controlchange<<4)+(n-1),[t,e],this._parseTimeParameter(i.time))}.bind(this)),this},s.prototype._selectRegisteredParameter=function(t,e,n){var i=this;if(t[0]=Math.floor(t[0]),!(t[0]>=0&&t[0]<=127))throw new RangeError("The control65 value must be between 0 and 127");if(t[1]=Math.floor(t[1]),!(t[1]>=0&&t[1]<=127))throw new RangeError("The control64 value must be between 0 and 127");return a.toMIDIChannels(e).forEach(function(o){i.sendControlChange(101,t[0],e,{time:n}),i.sendControlChange(100,t[1],e,{time:n})}),this},s.prototype._selectNonRegisteredParameter=function(t,e,n){var i=this;if(t[0]=Math.floor(t[0]),!(t[0]>=0&&t[0]<=127))throw new RangeError("The control63 value must be between 0 and 127");if(t[1]=Math.floor(t[1]),!(t[1]>=0&&t[1]<=127))throw new RangeError("The control62 value must be between 0 and 127");return a.toMIDIChannels(e).forEach(function(o){i.sendControlChange(99,t[0],e,{time:n}),i.sendControlChange(98,t[1],e,{time:n})}),this},s.prototype._setCurrentRegisteredParameter=function(t,e,n){var i=this;if((t=[].concat(t))[0]=Math.floor(t[0]),!(t[0]>=0&&t[0]<=127))throw new RangeError("The msb value must be between 0 and 127");return a.toMIDIChannels(e).forEach(function(o){i.sendControlChange(6,t[0],e,{time:n})}),t[1]=Math.floor(t[1]),t[1]>=0&&t[1]<=127&&a.toMIDIChannels(e).forEach(function(o){i.sendControlChange(38,t[1],e,{time:n})}),this},s.prototype._deselectRegisteredParameter=function(t,e){var n=this;return a.toMIDIChannels(t).forEach(function(i){n.sendControlChange(101,127,t,{time:e}),n.sendControlChange(100,127,t,{time:e})}),this},s.prototype.setRegisteredParameter=function(t,e,n,i){var o=this;if(i=i||{},!Array.isArray(t)){if(!a.MIDI_REGISTERED_PARAMETER[t])throw new Error("The specified parameter is not available.");t=a.MIDI_REGISTERED_PARAMETER[t]}return a.toMIDIChannels(n).forEach(function(r){o._selectRegisteredParameter(t,n,i.time),o._setCurrentRegisteredParameter(e,n,i.time),o._deselectRegisteredParameter(n,i.time)}),this},s.prototype.setNonRegisteredParameter=function(t,e,n,i){var o=this;if(i=i||{},!(t[0]>=0&&t[0]<=127&&t[1]>=0&&t[1]<=127))throw new Error("Position 0 and 1 of the 2-position parameter array must both be between 0 and 127.");return e=[].concat(e),a.toMIDIChannels(n).forEach(function(r){o._selectNonRegisteredParameter(t,n,i.time),o._setCurrentRegisteredParameter(e,n,i.time),o._deselectRegisteredParameter(n,i.time)}),this},s.prototype.incrementRegisteredParameter=function(t,e,n){var i=this;if(n=n||{},!Array.isArray(t)){if(!a.MIDI_REGISTERED_PARAMETER[t])throw new Error("The specified parameter is not available.");t=a.MIDI_REGISTERED_PARAMETER[t]}return a.toMIDIChannels(e).forEach(function(o){i._selectRegisteredParameter(t,e,n.time),i.sendControlChange(96,0,e,{time:n.time}),i._deselectRegisteredParameter(e,n.time)}),this},s.prototype.decrementRegisteredParameter=function(t,e,n){if(n=n||{},!Array.isArray(t)){if(!a.MIDI_REGISTERED_PARAMETER[t])throw new TypeError("The specified parameter is not available.");t=a.MIDI_REGISTERED_PARAMETER[t]}return a.toMIDIChannels(e).forEach(function(i){this._selectRegisteredParameter(t,e,n.time),this.sendControlChange(97,0,e,{time:n.time}),this._deselectRegisteredParameter(e,n.time)}.bind(this)),this},s.prototype.setPitchBendRange=function(t,e,n,i){var o=this;if(i=i||{},!((t=Math.floor(t)||0)>=0&&127>=t))throw new RangeError("The semitones value must be between 0 and 127");if(!((e=Math.floor(e)||0)>=0&&127>=e))throw new RangeError("The cents value must be between 0 and 127");return a.toMIDIChannels(n).forEach(function(r){o.setRegisteredParameter("pitchbendrange",[t,e],n,{time:i.time})}),this},s.prototype.setModulationRange=function(t,e,n,i){var o=this;if(i=i||{},!((t=Math.floor(t)||0)>=0&&127>=t))throw new RangeError("The semitones value must be between 0 and 127");if(!((e=Math.floor(e)||0)>=0&&127>=e))throw new RangeError("The cents value must be between 0 and 127");return a.toMIDIChannels(n).forEach(function(r){o.setRegisteredParameter("modulationrange",[t,e],n,{time:i.time})}),this},s.prototype.setMasterTuning=function(t,e,n){var i=this;if(n=n||{},-65>=(t=parseFloat(t)||0)||t>=64)throw new RangeError("The value must be a decimal number larger than -65 and smaller than 64.");var o=Math.floor(t)+64,r=t-Math.floor(t),s=(r=Math.round((r+1)/2*16383))>>7&127,l=127&r;return a.toMIDIChannels(e).forEach(function(t){i.setRegisteredParameter("channelcoarsetuning",o,e,{time:n.time}),i.setRegisteredParameter("channelfinetuning",[s,l],e,{time:n.time})}),this},s.prototype.setTuningProgram=function(t,e,n){var i=this;if(n=n||{},!((t=Math.floor(t))>=0&&127>=t))throw new RangeError("The program value must be between 0 and 127");return a.toMIDIChannels(e).forEach(function(o){i.setRegisteredParameter("tuningprogram",t,e,{time:n.time})}),this},s.prototype.setTuningBank=function(t,e,n){var i=this;if(n=n||{},!((t=Math.floor(t)||0)>=0&&127>=t))throw new RangeError("The bank value must be between 0 and 127");return a.toMIDIChannels(e).forEach(function(o){i.setRegisteredParameter("tuningbank",t,e,{time:n.time})}),this},s.prototype.sendChannelMode=function(t,e,n,i){if(i=i||{},"string"==typeof t){if(!(t=a.MIDI_CHANNEL_MODE_MESSAGES[t]))throw new TypeError("Invalid channel mode message name.")}else if(!((t=Math.floor(t))>=120&&127>=t))throw new RangeError("Channel mode numerical identifiers must be between 120 and 127.");if(0>(e=Math.floor(e)||0)||e>127)throw new RangeError("Value must be an integer between 0 and 127.");return a.toMIDIChannels(n).forEach(function(n){this.send((a.MIDI_CHANNEL_MESSAGES.channelmode<<4)+(n-1),[t,e],this._parseTimeParameter(i.time))}.bind(this)),this},s.prototype.sendProgramChange=function(t,e,n){var i=this;if(n=n||{},t=Math.floor(t),isNaN(t)||0>t||t>127)throw new RangeError("Program numbers must be between 0 and 127.");return a.toMIDIChannels(e).forEach(function(e){i.send((a.MIDI_CHANNEL_MESSAGES.programchange<<4)+(e-1),[t],i._parseTimeParameter(n.time))}),this},s.prototype.sendChannelAftertouch=function(t,e,n){var i=this;n=n||{},t=parseFloat(t),(isNaN(t)||0>t||t>1)&&(t=.5);var o=Math.round(127*t);return a.toMIDIChannels(e).forEach(function(t){i.send((a.MIDI_CHANNEL_MESSAGES.channelaftertouch<<4)+(t-1),[o],i._parseTimeParameter(n.time))}),this},s.prototype.sendPitchBend=function(t,e,n){var i=this;if(n=n||{},isNaN(t)||-1>t||t>1)throw new RangeError("Pitch bend value must be between -1 and 1.");var o=Math.round((t+1)/2*16383),r=o>>7&127,s=127&o;return a.toMIDIChannels(e).forEach(function(t){i.send((a.MIDI_CHANNEL_MESSAGES.pitchbend<<4)+(t-1),[s,r],i._parseTimeParameter(n.time))}),this},s.prototype._parseTimeParameter=function(t){var e,n;return"string"==typeof t&&"+"===t.substring(0,1)?(e=parseFloat(t))&&e>0&&(n=a.time+e):(e=parseFloat(t))>a.time&&(n=e),n},s.prototype._convertNoteToArray=function(t){var e=[];return Array.isArray(t)||(t=[t]),t.forEach(function(t){e.push(a.guessNoteNumber(t))}),e},void 0===(i=function(){return a}.apply(e,[]))||(t.exports=i)}()},function(t,e){var n=0,i=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+i).toString(36))}},function(t,e,n){var i=n(26),o=Math.max,r=Math.min;t.exports=function(t,e){return(t=i(t))<0?o(t+e,0):r(t,e)}},function(t,e,n){var i=n(102),o=n(74).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return i(t,o)}},function(t,e,n){var i=n(22),o=n(6)("toStringTag"),r="Arguments"==i(function(){return arguments}());t.exports=function(t){var e,n,s;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(n=function(t,e){try{return t[e]}catch(t){}}(e=Object(t),o))?n:r?i(e):"Object"==(s=i(e))&&"function"==typeof e.callee?"Arguments":s}},function(t,e){t.exports={}},function(t,e,n){"use strict";var i=n(3),o=n(8),r=n(9),s=n(6)("species");t.exports=function(t){var e=i[t];r&&e&&!e[s]&&o.f(e,s,{configurable:!0,get:function(){return this}})}},function(t,e){t.exports=function(t,e,n,i){if(!(t instanceof e)||void 0!==i&&i in t)throw TypeError(n+": incorrect invocation!");return t}},function(t,e,n){var i=n(17);t.exports=function(t,e,n){for(var o in e)i(t,o,e[o],n);return t}},function(t,e,n){var i=n(8).f,o=n(15),r=n(6)("toStringTag");t.exports=function(t,e,n){t&&!o(t=n?t:t.prototype,r)&&i(t,r,{configurable:!0,value:e})}},function(t,e,n){var i=n(1),o=n(25),r=n(5),s=n(79),a="["+s+"]",l=RegExp("^"+a+a+"*"),c=RegExp(a+a+"*$"),u=function(t,e,n){var o={},a=r(function(){return!!s[t]()||"​"!="​"[t]()}),l=o[t]=a?e(h):s[t];n&&(o[n]=l),i(i.P+i.F*a,"String",o)},h=u.trim=function(t,e){return t=String(o(t)),1&e&&(t=t.replace(l,"")),2&e&&(t=t.replace(c,"")),t};t.exports=u},function(t,e,n){var i=n(4);t.exports=function(t,e){if(!i(t)||t._t!==e)throw TypeError("Incompatible receiver, "+e+" required!");return t}},function(t,e,n){"use strict";n.d(e,"a",function(){return o});var i=n(0);class o extends i.a{static get properties(){return{buffer:{type:Array},alt:{type:String},min:{type:Number},max:{type:Number},color:{type:String}}}constructor(){super(),this.min=-1.1,this.max=1.1,this.buffer=new Float32Array(100),this.color="black"}drawBackground(t,e,n){}async visualize(t){}updated(){const t=this.shadowRoot.querySelector("canvas"),e=t.getContext("2d"),n=2*t.clientWidth,i=2*t.clientHeight;t.width=n,t.height=i,e.clearRect(0,0,n,i),this.drawBackground(e,n,i);e.lineWidth=4,e.beginPath(),this.buffer.forEach((t,o)=>{const r=Math.scale(o,0,this.buffer.length,4,n-4),s=Math.scale(t,this.max,this.min,0,i-4);0===o?e.moveTo(r,s):e.lineTo(r,s)}),e.lineCap="round",e.strokeStyle=this.color,e.stroke()}render(){return i.b`
			<style>
				:host {
					display: inline-block;
					width: 40px;
					height: 20px;
				}
				canvas {
					width: 100%;
					height: 100%;
				}
			</style>
			<canvas>
				${this.alt}
			</canvas>
		`}}},function(t,e,n){var i=n(22);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==i(t)?t.split(""):Object(t)}},function(t,e){e.f={}.propertyIsEnumerable},function(t,e,n){var i=n(42),o=n(6)("iterator"),r=n(43);t.exports=n(13).getIteratorMethod=function(t){if(null!=t)return t[o]||t["@@iterator"]||r[i(t)]}},function(t,e,n){var i=n(13),o=n(3),r=o["__core-js_shared__"]||(o["__core-js_shared__"]={});(t.exports=function(t,e){return r[t]||(r[t]=void 0!==e?e:{})})("versions",[]).push({version:i.version,mode:n(35)?"pure":"global",copyright:"© 2018 Denis Pushkarev (zloirock.ru)"})},function(t,e,n){var i=n(14),o=n(10),r=n(40);t.exports=function(t){return function(e,n,s){var a,l=i(e),c=o(l.length),u=r(s,c);if(t&&n!=n){for(;c>u;)if((a=l[u++])!=a)return!0}else for(;c>u;u++)if((t||u in l)&&l[u]===n)return t||u||0;return!t&&-1}}},function(t,e){e.f=Object.getOwnPropertySymbols},function(t,e,n){var i=n(22);t.exports=Array.isArray||function(t){return"Array"==i(t)}},function(t,e,n){"use strict";var i=n(35),o=n(1),r=n(17),s=n(16),a=n(43),l=n(59),c=n(47),u=n(19),h=n(6)("iterator"),d=!([].keys&&"next"in[].keys()),p=function(){return this};t.exports=function(t,e,n,f,v,b,m){l(n,e,f);var g,y,x,_=function(t){if(!d&&t in k)return k[t];switch(t){case"keys":case"values":return function(){return new n(this,t)}}return function(){return new n(this,t)}},w=e+" Iterator",S="values"==v,E=!1,k=t.prototype,M=k[h]||k["@@iterator"]||v&&k[v],A=M||_(v),I=v?S?_("entries"):A:void 0,C="Array"==e&&k.entries||M;if(C&&(x=u(C.call(new t)))!==Object.prototype&&x.next&&(c(x,w,!0),i||"function"==typeof x[h]||s(x,h,p)),S&&M&&"values"!==M.name&&(E=!0,A=function(){return M.call(this)}),i&&!m||!d&&!E&&k[h]||s(k,h,A),a[e]=A,a[w]=p,v)if(g={values:S?A:_("values"),keys:b?A:_("keys"),entries:I},m)for(y in g)y in k||r(k,y,g[y]);else o(o.P+o.F*(d||E),e,g);return g}},function(t,e,n){"use strict";var i=n(30),o=n(33),r=n(47),s={};n(16)(s,n(6)("iterator"),function(){return this}),t.exports=function(t,e,n){t.prototype=i(s,{next:o(1,n)}),r(t,e+" Iterator")}},function(t,e,n){var i=n(4),o=n(22),r=n(6)("match");t.exports=function(t){var e;return i(t)&&(void 0!==(e=t[r])?!!e:"RegExp"==o(t))}},function(t,e,n){var i=n(6)("iterator"),o=!1;try{var r=[7][i]();r.return=function(){o=!0},Array.from(r,function(){throw 2})}catch(t){}t.exports=function(t,e){if(!e&&!o)return!1;var n=!1;try{var r=[7],s=r[i]();s.next=function(){return{done:n=!0}},r[i]=function(){return s},t(r)}catch(t){}return n}},function(t,e,n){"use strict";var i=n(2);t.exports=function(){var t=i(this),e="";return t.global&&(e+="g"),t.ignoreCase&&(e+="i"),t.multiline&&(e+="m"),t.unicode&&(e+="u"),t.sticky&&(e+="y"),e}},function(t,e,n){"use strict";var i=n(16),o=n(17),r=n(5),s=n(25),a=n(6);t.exports=function(t,e,n){var l=a(t),c=n(s,l,""[t]),u=c[0],h=c[1];r(function(){var e={};return e[l]=function(){return 7},7!=""[t](e)})&&(o(String.prototype,t,u),i(RegExp.prototype,l,2==e?function(t,e){return h.call(t,this,e)}:function(t){return h.call(t,this)}))}},function(t,e,n){var i=n(2),o=n(12),r=n(6)("species");t.exports=function(t,e){var n,s=i(t).constructor;return void 0===s||null==(n=i(s)[r])?e:o(n)}},function(t,e,n){var i=n(3).navigator;t.exports=i&&i.userAgent||""},function(t,e,n){"use strict";var i=n(3),o=n(1),r=n(17),s=n(46),a=n(34),l=n(37),c=n(45),u=n(4),h=n(5),d=n(61),p=n(47),f=n(80);t.exports=function(t,e,n,v,b,m){var g=i[t],y=g,x=b?"set":"add",_=y&&y.prototype,w={},S=function(t){var e=_[t];r(_,t,"delete"==t?function(t){return!(m&&!u(t))&&e.call(this,0===t?0:t)}:"has"==t?function(t){return!(m&&!u(t))&&e.call(this,0===t?0:t)}:"get"==t?function(t){return m&&!u(t)?void 0:e.call(this,0===t?0:t)}:"add"==t?function(t){return e.call(this,0===t?0:t),this}:function(t,n){return e.call(this,0===t?0:t,n),this})};if("function"==typeof y&&(m||_.forEach&&!h(function(){(new y).entries().next()}))){var E=new y,k=E[x](m?{}:-0,1)!=E,M=h(function(){E.has(1)}),A=d(function(t){new y(t)}),I=!m&&h(function(){for(var t=new y,e=5;e--;)t[x](e,e);return!t.has(-0)});A||((y=e(function(e,n){c(e,y,t);var i=f(new g,e,y);return null!=n&&l(n,b,i[x],i),i})).prototype=_,_.constructor=y),(M||I)&&(S("delete"),S("has"),b&&S("get")),(I||k)&&S(x),m&&_.clear&&delete _.clear}else y=v.getConstructor(e,t,b,x),s(y.prototype,n),a.NEED=!0;return p(y,t),w[t]=y,o(o.G+o.W+o.F*(y!=g),w),m||v.setStrong(y,t,b),y}},function(t,e,n){for(var i,o=n(3),r=n(16),s=n(39),a=s("typed_array"),l=s("view"),c=!(!o.ArrayBuffer||!o.DataView),u=c,h=0,d="Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array".split(",");h<9;)(i=o[d[h++]])?(r(i.prototype,a,!0),r(i.prototype,l,!0)):u=!1;t.exports={ABV:c,CONSTR:u,TYPED:a,VIEW:l}},function(t,e,n){"use strict";t.exports=n(35)||!n(5)(function(){var t=Math.random();__defineSetter__.call(null,t,function(){}),delete n(3)[t]})},function(t,e,n){"use strict";var i=n(1);t.exports=function(t){i(i.S,t,{of:function(){for(var t=arguments.length,e=new Array(t);t--;)e[t]=arguments[t];return new this(e)}})}},function(t,e,n){"use strict";var i=n(1),o=n(12),r=n(21),s=n(37);t.exports=function(t){i(i.S,t,{from:function(t){var e,n,i,a,l=arguments[1];return o(this),(e=void 0!==l)&&o(l),null==t?new this:(n=[],e?(i=0,a=r(l,arguments[2],2),s(t,!1,function(t){n.push(a(t,i++))})):s(t,!1,n.push,n),new this(n))}})}},function(t,e,n){var i=n(4),o=n(3).document,r=i(o)&&i(o.createElement);t.exports=function(t){return r?o.createElement(t):{}}},function(t,e,n){var i=n(3),o=n(13),r=n(35),s=n(101),a=n(8).f;t.exports=function(t){var e=o.Symbol||(o.Symbol=r?{}:i.Symbol||{});"_"==t.charAt(0)||t in e||a(e,t,{value:s.f(t)})}},function(t,e,n){var i=n(54)("keys"),o=n(39);t.exports=function(t){return i[t]||(i[t]=o(t))}},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,e,n){var i=n(3).document;t.exports=i&&i.documentElement},function(t,e,n){"use strict";var i=n(29),o=n(56),r=n(52),s=n(11),a=n(51),l=Object.assign;t.exports=!l||n(5)(function(){var t={},e={},n=Symbol(),i="abcdefghijklmnopqrst";return t[n]=7,i.split("").forEach(function(t){e[t]=t}),7!=l({},t)[n]||Object.keys(l({},e)).join("")!=i})?function(t,e){for(var n=s(t),l=arguments.length,c=1,u=o.f,h=r.f;l>c;)for(var d,p=a(arguments[c++]),f=u?i(p).concat(u(p)):i(p),v=f.length,b=0;v>b;)h.call(p,d=f[b++])&&(n[d]=p[d]);return n}:l},function(t,e,n){var i=n(4),o=n(2),r=function(t,e){if(o(t),!i(e)&&null!==e)throw TypeError(e+": can't set as prototype!")};t.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(t,e,i){try{(i=n(21)(Function.call,n(18).f(Object.prototype,"__proto__").set,2))(t,[]),e=!(t instanceof Array)}catch(t){e=!0}return function(t,n){return r(t,n),e?t.__proto__=n:i(t,n),t}}({},!1):void 0),check:r}},function(t,e){t.exports=function(t,e,n){var i=void 0===n;switch(e.length){case 0:return i?t():t.call(n);case 1:return i?t(e[0]):t.call(n,e[0]);case 2:return i?t(e[0],e[1]):t.call(n,e[0],e[1]);case 3:return i?t(e[0],e[1],e[2]):t.call(n,e[0],e[1],e[2]);case 4:return i?t(e[0],e[1],e[2],e[3]):t.call(n,e[0],e[1],e[2],e[3])}return t.apply(n,e)}},function(t,e){t.exports="\t\n\v\f\r   ᠎             　\u2028\u2029\ufeff"},function(t,e,n){var i=n(4),o=n(77).set;t.exports=function(t,e,n){var r,s=e.constructor;return s!==n&&"function"==typeof s&&(r=s.prototype)!==n.prototype&&i(r)&&o&&o(t,r),t}},function(t,e,n){"use strict";var i=n(26),o=n(25);t.exports=function(t){var e=String(o(this)),n="",r=i(t);if(r<0||r==1/0)throw RangeError("Count can't be negative");for(;r>0;(r>>>=1)&&(e+=e))1&r&&(n+=e);return n}},function(t,e){t.exports=Math.sign||function(t){return 0==(t=+t)||t!=t?t:t<0?-1:1}},function(t,e){var n=Math.expm1;t.exports=!n||n(10)>22025.465794806718||n(10)<22025.465794806718||-2e-17!=n(-2e-17)?function(t){return 0==(t=+t)?t:t>-1e-6&&t<1e-6?t+t*t/2:Math.exp(t)-1}:n},function(t,e,n){var i=n(26),o=n(25);t.exports=function(t){return function(e,n){var r,s,a=String(o(e)),l=i(n),c=a.length;return l<0||l>=c?t?"":void 0:(r=a.charCodeAt(l))<55296||r>56319||l+1===c||(s=a.charCodeAt(l+1))<56320||s>57343?t?a.charAt(l):r:t?a.slice(l,l+2):s-56320+(r-55296<<10)+65536}}},function(t,e,n){var i=n(60),o=n(25);t.exports=function(t,e,n){if(i(e))throw TypeError("String#"+n+" doesn't accept regex!");return String(o(t))}},function(t,e,n){var i=n(6)("match");t.exports=function(t){var e=/./;try{"/./"[t](e)}catch(n){try{return e[i]=!1,!"/./"[t](e)}catch(t){}}return!0}},function(t,e,n){var i=n(43),o=n(6)("iterator"),r=Array.prototype;t.exports=function(t){return void 0!==t&&(i.Array===t||r[o]===t)}},function(t,e,n){"use strict";var i=n(8),o=n(33);t.exports=function(t,e,n){e in t?i.f(t,e,o(0,n)):t[e]=n}},function(t,e,n){var i=n(233);t.exports=function(t,e){return new(i(t))(e)}},function(t,e,n){"use strict";var i=n(11),o=n(40),r=n(10);t.exports=function(t){for(var e=i(this),n=r(e.length),s=arguments.length,a=o(s>1?arguments[1]:void 0,n),l=s>2?arguments[2]:void 0,c=void 0===l?n:o(l,n);c>a;)e[a++]=t;return e}},function(t,e,n){"use strict";var i=n(36),o=n(92),r=n(43),s=n(14);t.exports=n(58)(Array,"Array",function(t,e){this._t=s(t),this._i=0,this._k=e},function(){var t=this._t,e=this._k,n=this._i++;return!t||n>=t.length?(this._t=void 0,o(1)):o(0,"keys"==e?n:"values"==e?t[n]:[n,t[n]])},"values"),r.Arguments=r.Array,i("keys"),i("values"),i("entries")},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},function(t,e,n){var i,o,r,s=n(21),a=n(78),l=n(75),c=n(71),u=n(3),h=u.process,d=u.setImmediate,p=u.clearImmediate,f=u.MessageChannel,v=u.Dispatch,b=0,m={},g=function(){var t=+this;if(m.hasOwnProperty(t)){var e=m[t];delete m[t],e()}},y=function(t){g.call(t.data)};d&&p||(d=function(t){for(var e=[],n=1;arguments.length>n;)e.push(arguments[n++]);return m[++b]=function(){a("function"==typeof t?t:Function(t),e)},i(b),b},p=function(t){delete m[t]},"process"==n(22)(h)?i=function(t){h.nextTick(s(g,t,1))}:v&&v.now?i=function(t){v.now(s(g,t,1))}:f?(r=(o=new f).port2,o.port1.onmessage=y,i=s(r.postMessage,r,1)):u.addEventListener&&"function"==typeof postMessage&&!u.importScripts?(i=function(t){u.postMessage(t+"","*")},u.addEventListener("message",y,!1)):i="onreadystatechange"in c("script")?function(t){l.appendChild(c("script")).onreadystatechange=function(){l.removeChild(this),g.call(t)}}:function(t){setTimeout(s(g,t,1),0)}),t.exports={set:d,clear:p}},function(t,e,n){var i=n(3),o=n(93).set,r=i.MutationObserver||i.WebKitMutationObserver,s=i.process,a=i.Promise,l="process"==n(22)(s);t.exports=function(){var t,e,n,c=function(){var i,o;for(l&&(i=s.domain)&&i.exit();t;){o=t.fn,t=t.next;try{o()}catch(i){throw t?n():e=void 0,i}}e=void 0,i&&i.enter()};if(l)n=function(){s.nextTick(c)};else if(!r||i.navigator&&i.navigator.standalone)if(a&&a.resolve){var u=a.resolve(void 0);n=function(){u.then(c)}}else n=function(){o.call(i,c)};else{var h=!0,d=document.createTextNode("");new r(c).observe(d,{characterData:!0}),n=function(){d.data=h=!h}}return function(i){var o={fn:i,next:void 0};e&&(e.next=o),t||(t=o,n()),e=o}}},function(t,e,n){"use strict";var i=n(12);function o(t){var e,n;this.promise=new t(function(t,i){if(void 0!==e||void 0!==n)throw TypeError("Bad Promise constructor");e=t,n=i}),this.resolve=i(e),this.reject=i(n)}t.exports.f=function(t){return new o(t)}},function(t,e,n){"use strict";var i=n(3),o=n(9),r=n(35),s=n(67),a=n(16),l=n(46),c=n(5),u=n(45),h=n(26),d=n(10),p=n(123),f=n(41).f,v=n(8).f,b=n(90),m=n(47),g="prototype",y="Wrong index!",x=i.ArrayBuffer,_=i.DataView,w=i.Math,S=i.RangeError,E=i.Infinity,k=x,M=w.abs,A=w.pow,I=w.floor,C=w.log,T=w.LN2,N=o?"_b":"buffer",P=o?"_l":"byteLength",O=o?"_o":"byteOffset";function R(t,e,n){var i,o,r,s=new Array(n),a=8*n-e-1,l=(1<<a)-1,c=l>>1,u=23===e?A(2,-24)-A(2,-77):0,h=0,d=t<0||0===t&&1/t<0?1:0;for((t=M(t))!=t||t===E?(o=t!=t?1:0,i=l):(i=I(C(t)/T),t*(r=A(2,-i))<1&&(i--,r*=2),(t+=i+c>=1?u/r:u*A(2,1-c))*r>=2&&(i++,r/=2),i+c>=l?(o=0,i=l):i+c>=1?(o=(t*r-1)*A(2,e),i+=c):(o=t*A(2,c-1)*A(2,e),i=0));e>=8;s[h++]=255&o,o/=256,e-=8);for(i=i<<e|o,a+=e;a>0;s[h++]=255&i,i/=256,a-=8);return s[--h]|=128*d,s}function $(t,e,n){var i,o=8*n-e-1,r=(1<<o)-1,s=r>>1,a=o-7,l=n-1,c=t[l--],u=127&c;for(c>>=7;a>0;u=256*u+t[l],l--,a-=8);for(i=u&(1<<-a)-1,u>>=-a,a+=e;a>0;i=256*i+t[l],l--,a-=8);if(0===u)u=1-s;else{if(u===r)return i?NaN:c?-E:E;i+=A(2,e),u-=s}return(c?-1:1)*i*A(2,u-e)}function F(t){return t[3]<<24|t[2]<<16|t[1]<<8|t[0]}function z(t){return[255&t]}function D(t){return[255&t,t>>8&255]}function L(t){return[255&t,t>>8&255,t>>16&255,t>>24&255]}function q(t){return R(t,52,8)}function j(t){return R(t,23,4)}function H(t,e,n){v(t[g],e,{get:function(){return this[n]}})}function V(t,e,n,i){var o=p(+n);if(o+e>t[P])throw S(y);var r=t[N]._b,s=o+t[O],a=r.slice(s,s+e);return i?a:a.reverse()}function B(t,e,n,i,o,r){var s=p(+n);if(s+e>t[P])throw S(y);for(var a=t[N]._b,l=s+t[O],c=i(+o),u=0;u<e;u++)a[l+u]=c[r?u:e-u-1]}if(s.ABV){if(!c(function(){x(1)})||!c(function(){new x(-1)})||c(function(){return new x,new x(1.5),new x(NaN),"ArrayBuffer"!=x.name})){for(var G,U=(x=function(t){return u(this,x),new k(p(t))})[g]=k[g],W=f(k),Y=0;W.length>Y;)(G=W[Y++])in x||a(x,G,k[G]);r||(U.constructor=x)}var K=new _(new x(2)),J=_[g].setInt8;K.setInt8(0,2147483648),K.setInt8(1,2147483649),!K.getInt8(0)&&K.getInt8(1)||l(_[g],{setInt8:function(t,e){J.call(this,t,e<<24>>24)},setUint8:function(t,e){J.call(this,t,e<<24>>24)}},!0)}else x=function(t){u(this,x,"ArrayBuffer");var e=p(t);this._b=b.call(new Array(e),0),this[P]=e},_=function(t,e,n){u(this,_,"DataView"),u(t,x,"DataView");var i=t[P],o=h(e);if(o<0||o>i)throw S("Wrong offset!");if(o+(n=void 0===n?i-o:d(n))>i)throw S("Wrong length!");this[N]=t,this[O]=o,this[P]=n},o&&(H(x,"byteLength","_l"),H(_,"buffer","_b"),H(_,"byteLength","_l"),H(_,"byteOffset","_o")),l(_[g],{getInt8:function(t){return V(this,1,t)[0]<<24>>24},getUint8:function(t){return V(this,1,t)[0]},getInt16:function(t){var e=V(this,2,t,arguments[1]);return(e[1]<<8|e[0])<<16>>16},getUint16:function(t){var e=V(this,2,t,arguments[1]);return e[1]<<8|e[0]},getInt32:function(t){return F(V(this,4,t,arguments[1]))},getUint32:function(t){return F(V(this,4,t,arguments[1]))>>>0},getFloat32:function(t){return $(V(this,4,t,arguments[1]),23,4)},getFloat64:function(t){return $(V(this,8,t,arguments[1]),52,8)},setInt8:function(t,e){B(this,1,t,z,e)},setUint8:function(t,e){B(this,1,t,z,e)},setInt16:function(t,e){B(this,2,t,D,e,arguments[2])},setUint16:function(t,e){B(this,2,t,D,e,arguments[2])},setInt32:function(t,e){B(this,4,t,L,e,arguments[2])},setUint32:function(t,e){B(this,4,t,L,e,arguments[2])},setFloat32:function(t,e){B(this,4,t,j,e,arguments[2])},setFloat64:function(t,e){B(this,8,t,q,e,arguments[2])}});m(x,"ArrayBuffer"),m(_,"DataView"),a(_[g],s.VIEW,!0),e.ArrayBuffer=x,e.DataView=_},function(t,e,n){var i=n(41),o=n(56),r=n(2),s=n(3).Reflect;t.exports=s&&s.ownKeys||function(t){var e=i.f(r(t)),n=o.f;return n?e.concat(n(t)):e}},function(t,e){t.exports=function(t,e){var n=e===Object(e)?function(t){return e[t]}:e;return function(e){return String(e).replace(t,n)}}},function(t,e,n){var i=n(357);t.exports="string"==typeof i?i:i.toString()},function(t,e,n){t.exports=!n(9)&&!n(5)(function(){return 7!=Object.defineProperty(n(71)("div"),"a",{get:function(){return 7}}).a})},function(t,e,n){e.f=n(6)},function(t,e,n){var i=n(15),o=n(14),r=n(55)(!1),s=n(73)("IE_PROTO");t.exports=function(t,e){var n,a=o(t),l=0,c=[];for(n in a)n!=s&&i(a,n)&&c.push(n);for(;e.length>l;)i(a,n=e[l++])&&(~r(c,n)||c.push(n));return c}},function(t,e,n){var i=n(8),o=n(2),r=n(29);t.exports=n(9)?Object.defineProperties:function(t,e){o(t);for(var n,s=r(e),a=s.length,l=0;a>l;)i.f(t,n=s[l++],e[n]);return t}},function(t,e,n){var i=n(14),o=n(41).f,r={}.toString,s="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[];t.exports.f=function(t){return s&&"[object Window]"==r.call(t)?function(t){try{return o(t)}catch(t){return s.slice()}}(t):o(i(t))}},function(t,e,n){"use strict";var i=n(12),o=n(4),r=n(78),s=[].slice,a={};t.exports=Function.bind||function(t){var e=i(this),n=s.call(arguments,1),l=function(){var i=n.concat(s.call(arguments));return this instanceof l?function(t,e,n){if(!(e in a)){for(var i=[],o=0;o<e;o++)i[o]="a["+o+"]";a[e]=Function("F,a","return new F("+i.join(",")+")")}return a[e](t,n)}(e,i.length,i):r(e,i,t)};return o(e.prototype)&&(l.prototype=e.prototype),l}},function(t,e,n){var i=n(3).parseInt,o=n(48).trim,r=n(79),s=/^[-+]?0[xX]/;t.exports=8!==i(r+"08")||22!==i(r+"0x16")?function(t,e){var n=o(String(t),3);return i(n,e>>>0||(s.test(n)?16:10))}:i},function(t,e,n){var i=n(3).parseFloat,o=n(48).trim;t.exports=1/i(n(79)+"-0")!=-1/0?function(t){var e=o(String(t),3),n=i(e);return 0===n&&"-"==e.charAt(0)?-0:n}:i},function(t,e,n){var i=n(22);t.exports=function(t,e){if("number"!=typeof t&&"Number"!=i(t))throw TypeError(e);return+t}},function(t,e,n){var i=n(4),o=Math.floor;t.exports=function(t){return!i(t)&&isFinite(t)&&o(t)===t}},function(t,e){t.exports=Math.log1p||function(t){return(t=+t)>-1e-8&&t<1e-8?t-t*t/2:Math.log(1+t)}},function(t,e,n){var i=n(82),o=Math.pow,r=o(2,-52),s=o(2,-23),a=o(2,127)*(2-s),l=o(2,-126);t.exports=Math.fround||function(t){var e,n,o=Math.abs(t),c=i(t);return o<l?c*(o/l/s+1/r-1/r)*l*s:(n=(e=(1+s/r)*o)-(e-o))>a||n!=n?c*(1/0):c*n}},function(t,e,n){var i=n(2);t.exports=function(t,e,n,o){try{return o?e(i(n)[0],n[1]):e(n)}catch(e){var r=t.return;throw void 0!==r&&i(r.call(t)),e}}},function(t,e,n){var i=n(12),o=n(11),r=n(51),s=n(10);t.exports=function(t,e,n,a,l){i(e);var c=o(t),u=r(c),h=s(c.length),d=l?h-1:0,p=l?-1:1;if(n<2)for(;;){if(d in u){a=u[d],d+=p;break}if(d+=p,l?d<0:h<=d)throw TypeError("Reduce of empty array with no initial value")}for(;l?d>=0:h>d;d+=p)d in u&&(a=e(a,u[d],d,c));return a}},function(t,e,n){"use strict";var i=n(11),o=n(40),r=n(10);t.exports=[].copyWithin||function(t,e){var n=i(this),s=r(n.length),a=o(t,s),l=o(e,s),c=arguments.length>2?arguments[2]:void 0,u=Math.min((void 0===c?s:o(c,s))-l,s-a),h=1;for(l<a&&a<l+u&&(h=-1,l+=u-1,a+=u-1);u-- >0;)l in n?n[a]=n[l]:delete n[a],a+=h,l+=h;return n}},function(t,e,n){n(9)&&"g"!=/./g.flags&&n(8).f(RegExp.prototype,"flags",{configurable:!0,get:n(62)})},function(t,e){t.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},function(t,e,n){var i=n(2),o=n(4),r=n(95);t.exports=function(t,e){if(i(t),o(e)&&e.constructor===t)return e;var n=r.f(t);return(0,n.resolve)(e),n.promise}},function(t,e,n){"use strict";var i=n(119),o=n(49);t.exports=n(66)("Map",function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},{get:function(t){var e=i.getEntry(o(this,"Map"),t);return e&&e.v},set:function(t,e){return i.def(o(this,"Map"),0===t?0:t,e)}},i,!0)},function(t,e,n){"use strict";var i=n(8).f,o=n(30),r=n(46),s=n(21),a=n(45),l=n(37),c=n(58),u=n(92),h=n(44),d=n(9),p=n(34).fastKey,f=n(49),v=d?"_s":"size",b=function(t,e){var n,i=p(e);if("F"!==i)return t._i[i];for(n=t._f;n;n=n.n)if(n.k==e)return n};t.exports={getConstructor:function(t,e,n,c){var u=t(function(t,i){a(t,u,e,"_i"),t._t=e,t._i=o(null),t._f=void 0,t._l=void 0,t[v]=0,null!=i&&l(i,n,t[c],t)});return r(u.prototype,{clear:function(){for(var t=f(this,e),n=t._i,i=t._f;i;i=i.n)i.r=!0,i.p&&(i.p=i.p.n=void 0),delete n[i.i];t._f=t._l=void 0,t[v]=0},delete:function(t){var n=f(this,e),i=b(n,t);if(i){var o=i.n,r=i.p;delete n._i[i.i],i.r=!0,r&&(r.n=o),o&&(o.p=r),n._f==i&&(n._f=o),n._l==i&&(n._l=r),n[v]--}return!!i},forEach:function(t){f(this,e);for(var n,i=s(t,arguments.length>1?arguments[1]:void 0,3);n=n?n.n:this._f;)for(i(n.v,n.k,this);n&&n.r;)n=n.p},has:function(t){return!!b(f(this,e),t)}}),d&&i(u.prototype,"size",{get:function(){return f(this,e)[v]}}),u},def:function(t,e,n){var i,o,r=b(t,e);return r?r.v=n:(t._l=r={i:o=p(e,!0),k:e,v:n,p:i=t._l,n:void 0,r:!1},t._f||(t._f=r),i&&(i.n=r),t[v]++,"F"!==o&&(t._i[o]=r)),t},getEntry:b,setStrong:function(t,e,n){c(t,e,function(t,n){this._t=f(t,e),this._k=n,this._l=void 0},function(){for(var t=this._k,e=this._l;e&&e.r;)e=e.p;return this._t&&(this._l=e=e?e.n:this._t._f)?u(0,"keys"==t?e.k:"values"==t?e.v:[e.k,e.v]):(this._t=void 0,u(1))},n?"entries":"values",!n,!0),h(e)}}},function(t,e,n){"use strict";var i=n(119),o=n(49);t.exports=n(66)("Set",function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},{add:function(t){return i.def(o(this,"Set"),t=0===t?0:t,t)}},i)},function(t,e,n){"use strict";var i,o=n(28)(0),r=n(17),s=n(34),a=n(76),l=n(122),c=n(4),u=n(5),h=n(49),d=s.getWeak,p=Object.isExtensible,f=l.ufstore,v={},b=function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},m={get:function(t){if(c(t)){var e=d(t);return!0===e?f(h(this,"WeakMap")).get(t):e?e[this._i]:void 0}},set:function(t,e){return l.def(h(this,"WeakMap"),t,e)}},g=t.exports=n(66)("WeakMap",b,m,l,!0,!0);u(function(){return 7!=(new g).set((Object.freeze||Object)(v),7).get(v)})&&(a((i=l.getConstructor(b,"WeakMap")).prototype,m),s.NEED=!0,o(["delete","has","get","set"],function(t){var e=g.prototype,n=e[t];r(e,t,function(e,o){if(c(e)&&!p(e)){this._f||(this._f=new i);var r=this._f[t](e,o);return"set"==t?this:r}return n.call(this,e,o)})}))},function(t,e,n){"use strict";var i=n(46),o=n(34).getWeak,r=n(2),s=n(4),a=n(45),l=n(37),c=n(28),u=n(15),h=n(49),d=c(5),p=c(6),f=0,v=function(t){return t._l||(t._l=new b)},b=function(){this.a=[]},m=function(t,e){return d(t.a,function(t){return t[0]===e})};b.prototype={get:function(t){var e=m(this,t);if(e)return e[1]},has:function(t){return!!m(this,t)},set:function(t,e){var n=m(this,t);n?n[1]=e:this.a.push([t,e])},delete:function(t){var e=p(this.a,function(e){return e[0]===t});return~e&&this.a.splice(e,1),!!~e}},t.exports={getConstructor:function(t,e,n,r){var c=t(function(t,i){a(t,c,e,"_i"),t._t=e,t._i=f++,t._l=void 0,null!=i&&l(i,n,t[r],t)});return i(c.prototype,{delete:function(t){if(!s(t))return!1;var n=o(t);return!0===n?v(h(this,e)).delete(t):n&&u(n,this._i)&&delete n[this._i]},has:function(t){if(!s(t))return!1;var n=o(t);return!0===n?v(h(this,e)).has(t):n&&u(n,this._i)}}),c},def:function(t,e,n){var i=o(r(e),!0);return!0===i?v(t).set(e,n):i[t._i]=n,t},ufstore:v}},function(t,e,n){var i=n(26),o=n(10);t.exports=function(t){if(void 0===t)return 0;var e=i(t),n=o(e);if(e!==n)throw RangeError("Wrong length!");return n}},function(t,e,n){"use strict";var i=n(57),o=n(4),r=n(10),s=n(21),a=n(6)("isConcatSpreadable");t.exports=function t(e,n,l,c,u,h,d,p){for(var f,v,b=u,m=0,g=!!d&&s(d,p,3);m<c;){if(m in l){if(f=g?g(l[m],m,n):l[m],v=!1,o(f)&&(v=void 0!==(v=f[a])?!!v:i(f)),v&&h>0)b=t(e,n,f,r(f.length),b,h-1)-1;else{if(b>=9007199254740991)throw TypeError();e[b]=f}b++}m++}return b}},function(t,e,n){var i=n(10),o=n(81),r=n(25);t.exports=function(t,e,n,s){var a=String(r(t)),l=a.length,c=void 0===n?" ":String(n),u=i(e);if(u<=l||""==c)return a;var h=u-l,d=o.call(c,Math.ceil(h/c.length));return d.length>h&&(d=d.slice(0,h)),s?d+a:a+d}},function(t,e,n){var i=n(29),o=n(14),r=n(52).f;t.exports=function(t){return function(e){for(var n,s=o(e),a=i(s),l=a.length,c=0,u=[];l>c;)r.call(s,n=a[c++])&&u.push(t?[n,s[n]]:s[n]);return u}}},function(t,e,n){var i=n(42),o=n(128);t.exports=function(t){return function(){if(i(this)!=t)throw TypeError(t+"#toJSON isn't generic");return o(this)}}},function(t,e,n){var i=n(37);t.exports=function(t,e){var n=[];return i(t,!1,n.push,n,e),n}},function(t,e){t.exports=Math.scale||function(t,e,n,i,o){return 0===arguments.length||t!=t||e!=e||n!=n||i!=i||o!=o?NaN:t===1/0||t===-1/0?t:(t-e)*(o-i)/(n-e)+i}},function(t,e,n){var i=n(42),o=n(6)("iterator"),r=n(43);t.exports=n(13).isIterable=function(t){var e=Object(t);return void 0!==e[o]||"@@iterator"in e||r.hasOwnProperty(i(e))}},function(t,e,n){"use strict";var i=n(132),o=n(78),r=n(12);t.exports=function(){for(var t=r(this),e=arguments.length,n=new Array(e),s=0,a=i._,l=!1;e>s;)(n[s]=arguments[s++])===a&&(l=!0);return function(){var i,r=arguments.length,s=0,c=0;if(!l&&!r)return o(t,n,this);if(i=n.slice(),l)for(;e>s;s++)i[s]===a&&(i[s]=arguments[c++]);for(;r>c;)i.push(arguments[c++]);return o(t,i,this)}}},function(t,e,n){t.exports=n(3)},function(t,e,n){var i=n(8),o=n(18),r=n(97),s=n(14);t.exports=function(t,e){for(var n,a=r(s(e)),l=a.length,c=0;l>c;)i.f(t,n=a[c++],o.f(e,n));return t}},function(t,e){t.exports=function(t){var e=[];return e.toString=function(){return this.map(function(e){var n=function(t,e){var n=t[1]||"",i=t[3];if(!i)return n;if(e&&"function"==typeof btoa){var o=(s=i,"/*# sourceMappingURL=data:application/json;charset=utf-8;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(s))))+" */"),r=i.sources.map(function(t){return"/*# sourceURL="+i.sourceRoot+t+" */"});return[n].concat(r).concat([o]).join("\n")}var s;return[n].join("\n")}(e,t);return e[2]?"@media "+e[2]+"{"+n+"}":n}).join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var i={},o=0;o<this.length;o++){var r=this[o][0];"number"==typeof r&&(i[r]=!0)}for(o=0;o<t.length;o++){var s=t[o];"number"==typeof s[0]&&i[s[0]]||(n&&!s[2]?s[2]=n:n&&(s[2]="("+s[2]+") and ("+n+")"),e.push(s))}},e}},function(t,e){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(t){"object"==typeof window&&(n=window)}t.exports=n},function(t,e){t.exports=function(t){function e(i){if(n[i])return n[i].exports;var o=n[i]={exports:{},id:i,loaded:!1};return t[i].call(o.exports,o,o.exports,e),o.loaded=!0,o.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}([function(t,e,n){"use strict";function i(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}Object.defineProperty(e,"__esModule",{value:!0}),e.default=function t(e){for(var n=arguments.length,s=Array(n>1?n-1:0),a=1;a<n;a++)s[a-1]=arguments[a];if(!s.length)return e;var l=s.shift();if((0,o.isObject)(e)&&(0,o.isObject)(l))for(var c in l)(0,o.isObject)(l[c])?(e[c]||Object.assign(e,i({},c,{})),t(e[c],l[c])):(0,r.isArray)(l[c])?(e[c]||Object.assign(e,i({},c,[])),e[c]=e[c].concat(l[c])):Object.assign(e,i({},c,l[c]));return t.apply(void 0,[e].concat(s))};var o=n(1),r=n(2);t.exports=e.default},function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};e.isObject=function(t){return t&&"object"===(void 0===t?"undefined":n(t))&&!Array.isArray(t)}},function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.isArray=function(t){return t&&Array.isArray(t)}}])},function(t,e,n){var i;!function(o){var r=/^\s+/,s=/\s+$/,a=0,l=o.round,c=o.min,u=o.max,h=o.random;function d(t,e){if(e=e||{},(t=t||"")instanceof d)return t;if(!(this instanceof d))return new d(t,e);var n=function(t){var e={r:0,g:0,b:0},n=1,i=null,a=null,l=null,h=!1,d=!1;"string"==typeof t&&(t=function(t){t=t.replace(r,"").replace(s,"").toLowerCase();var e,n=!1;if(T[t])t=T[t],n=!0;else if("transparent"==t)return{r:0,g:0,b:0,a:0,format:"name"};if(e=V.rgb.exec(t))return{r:e[1],g:e[2],b:e[3]};if(e=V.rgba.exec(t))return{r:e[1],g:e[2],b:e[3],a:e[4]};if(e=V.hsl.exec(t))return{h:e[1],s:e[2],l:e[3]};if(e=V.hsla.exec(t))return{h:e[1],s:e[2],l:e[3],a:e[4]};if(e=V.hsv.exec(t))return{h:e[1],s:e[2],v:e[3]};if(e=V.hsva.exec(t))return{h:e[1],s:e[2],v:e[3],a:e[4]};if(e=V.hex8.exec(t))return{r:$(e[1]),g:$(e[2]),b:$(e[3]),a:L(e[4]),format:n?"name":"hex8"};if(e=V.hex6.exec(t))return{r:$(e[1]),g:$(e[2]),b:$(e[3]),format:n?"name":"hex"};if(e=V.hex4.exec(t))return{r:$(e[1]+""+e[1]),g:$(e[2]+""+e[2]),b:$(e[3]+""+e[3]),a:L(e[4]+""+e[4]),format:n?"name":"hex8"};if(e=V.hex3.exec(t))return{r:$(e[1]+""+e[1]),g:$(e[2]+""+e[2]),b:$(e[3]+""+e[3]),format:n?"name":"hex"};return!1}(t));"object"==typeof t&&(B(t.r)&&B(t.g)&&B(t.b)?(p=t.r,f=t.g,v=t.b,e={r:255*O(p,255),g:255*O(f,255),b:255*O(v,255)},h=!0,d="%"===String(t.r).substr(-1)?"prgb":"rgb"):B(t.h)&&B(t.s)&&B(t.v)?(i=z(t.s),a=z(t.v),e=function(t,e,n){t=6*O(t,360),e=O(e,100),n=O(n,100);var i=o.floor(t),r=t-i,s=n*(1-e),a=n*(1-r*e),l=n*(1-(1-r)*e),c=i%6;return{r:255*[n,a,s,s,l,n][c],g:255*[l,n,n,a,s,s][c],b:255*[s,s,l,n,n,a][c]}}(t.h,i,a),h=!0,d="hsv"):B(t.h)&&B(t.s)&&B(t.l)&&(i=z(t.s),l=z(t.l),e=function(t,e,n){var i,o,r;function s(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+6*(e-t)*n:n<.5?e:n<2/3?t+(e-t)*(2/3-n)*6:t}if(t=O(t,360),e=O(e,100),n=O(n,100),0===e)i=o=r=n;else{var a=n<.5?n*(1+e):n+e-n*e,l=2*n-a;i=s(l,a,t+1/3),o=s(l,a,t),r=s(l,a,t-1/3)}return{r:255*i,g:255*o,b:255*r}}(t.h,i,l),h=!0,d="hsl"),t.hasOwnProperty("a")&&(n=t.a));var p,f,v;return n=P(n),{ok:h,format:t.format||d,r:c(255,u(e.r,0)),g:c(255,u(e.g,0)),b:c(255,u(e.b,0)),a:n}}(t);this._originalInput=t,this._r=n.r,this._g=n.g,this._b=n.b,this._a=n.a,this._roundA=l(100*this._a)/100,this._format=e.format||n.format,this._gradientType=e.gradientType,this._r<1&&(this._r=l(this._r)),this._g<1&&(this._g=l(this._g)),this._b<1&&(this._b=l(this._b)),this._ok=n.ok,this._tc_id=a++}function p(t,e,n){t=O(t,255),e=O(e,255),n=O(n,255);var i,o,r=u(t,e,n),s=c(t,e,n),a=(r+s)/2;if(r==s)i=o=0;else{var l=r-s;switch(o=a>.5?l/(2-r-s):l/(r+s),r){case t:i=(e-n)/l+(e<n?6:0);break;case e:i=(n-t)/l+2;break;case n:i=(t-e)/l+4}i/=6}return{h:i,s:o,l:a}}function f(t,e,n){t=O(t,255),e=O(e,255),n=O(n,255);var i,o,r=u(t,e,n),s=c(t,e,n),a=r,l=r-s;if(o=0===r?0:l/r,r==s)i=0;else{switch(r){case t:i=(e-n)/l+(e<n?6:0);break;case e:i=(n-t)/l+2;break;case n:i=(t-e)/l+4}i/=6}return{h:i,s:o,v:a}}function v(t,e,n,i){var o=[F(l(t).toString(16)),F(l(e).toString(16)),F(l(n).toString(16))];return i&&o[0].charAt(0)==o[0].charAt(1)&&o[1].charAt(0)==o[1].charAt(1)&&o[2].charAt(0)==o[2].charAt(1)?o[0].charAt(0)+o[1].charAt(0)+o[2].charAt(0):o.join("")}function b(t,e,n,i){return[F(D(i)),F(l(t).toString(16)),F(l(e).toString(16)),F(l(n).toString(16))].join("")}function m(t,e){e=0===e?0:e||10;var n=d(t).toHsl();return n.s-=e/100,n.s=R(n.s),d(n)}function g(t,e){e=0===e?0:e||10;var n=d(t).toHsl();return n.s+=e/100,n.s=R(n.s),d(n)}function y(t){return d(t).desaturate(100)}function x(t,e){e=0===e?0:e||10;var n=d(t).toHsl();return n.l+=e/100,n.l=R(n.l),d(n)}function _(t,e){e=0===e?0:e||10;var n=d(t).toRgb();return n.r=u(0,c(255,n.r-l(-e/100*255))),n.g=u(0,c(255,n.g-l(-e/100*255))),n.b=u(0,c(255,n.b-l(-e/100*255))),d(n)}function w(t,e){e=0===e?0:e||10;var n=d(t).toHsl();return n.l-=e/100,n.l=R(n.l),d(n)}function S(t,e){var n=d(t).toHsl(),i=(n.h+e)%360;return n.h=i<0?360+i:i,d(n)}function E(t){var e=d(t).toHsl();return e.h=(e.h+180)%360,d(e)}function k(t){var e=d(t).toHsl(),n=e.h;return[d(t),d({h:(n+120)%360,s:e.s,l:e.l}),d({h:(n+240)%360,s:e.s,l:e.l})]}function M(t){var e=d(t).toHsl(),n=e.h;return[d(t),d({h:(n+90)%360,s:e.s,l:e.l}),d({h:(n+180)%360,s:e.s,l:e.l}),d({h:(n+270)%360,s:e.s,l:e.l})]}function A(t){var e=d(t).toHsl(),n=e.h;return[d(t),d({h:(n+72)%360,s:e.s,l:e.l}),d({h:(n+216)%360,s:e.s,l:e.l})]}function I(t,e,n){e=e||6,n=n||30;var i=d(t).toHsl(),o=360/n,r=[d(t)];for(i.h=(i.h-(o*e>>1)+720)%360;--e;)i.h=(i.h+o)%360,r.push(d(i));return r}function C(t,e){e=e||6;for(var n=d(t).toHsv(),i=n.h,o=n.s,r=n.v,s=[],a=1/e;e--;)s.push(d({h:i,s:o,v:r})),r=(r+a)%1;return s}d.prototype={isDark:function(){return this.getBrightness()<128},isLight:function(){return!this.isDark()},isValid:function(){return this._ok},getOriginalInput:function(){return this._originalInput},getFormat:function(){return this._format},getAlpha:function(){return this._a},getBrightness:function(){var t=this.toRgb();return(299*t.r+587*t.g+114*t.b)/1e3},getLuminance:function(){var t,e,n,i=this.toRgb();return t=i.r/255,e=i.g/255,n=i.b/255,.2126*(t<=.03928?t/12.92:o.pow((t+.055)/1.055,2.4))+.7152*(e<=.03928?e/12.92:o.pow((e+.055)/1.055,2.4))+.0722*(n<=.03928?n/12.92:o.pow((n+.055)/1.055,2.4))},setAlpha:function(t){return this._a=P(t),this._roundA=l(100*this._a)/100,this},toHsv:function(){var t=f(this._r,this._g,this._b);return{h:360*t.h,s:t.s,v:t.v,a:this._a}},toHsvString:function(){var t=f(this._r,this._g,this._b),e=l(360*t.h),n=l(100*t.s),i=l(100*t.v);return 1==this._a?"hsv("+e+", "+n+"%, "+i+"%)":"hsva("+e+", "+n+"%, "+i+"%, "+this._roundA+")"},toHsl:function(){var t=p(this._r,this._g,this._b);return{h:360*t.h,s:t.s,l:t.l,a:this._a}},toHslString:function(){var t=p(this._r,this._g,this._b),e=l(360*t.h),n=l(100*t.s),i=l(100*t.l);return 1==this._a?"hsl("+e+", "+n+"%, "+i+"%)":"hsla("+e+", "+n+"%, "+i+"%, "+this._roundA+")"},toHex:function(t){return v(this._r,this._g,this._b,t)},toHexString:function(t){return"#"+this.toHex(t)},toHex8:function(t){return function(t,e,n,i,o){var r=[F(l(t).toString(16)),F(l(e).toString(16)),F(l(n).toString(16)),F(D(i))];if(o&&r[0].charAt(0)==r[0].charAt(1)&&r[1].charAt(0)==r[1].charAt(1)&&r[2].charAt(0)==r[2].charAt(1)&&r[3].charAt(0)==r[3].charAt(1))return r[0].charAt(0)+r[1].charAt(0)+r[2].charAt(0)+r[3].charAt(0);return r.join("")}(this._r,this._g,this._b,this._a,t)},toHex8String:function(t){return"#"+this.toHex8(t)},toRgb:function(){return{r:l(this._r),g:l(this._g),b:l(this._b),a:this._a}},toRgbString:function(){return 1==this._a?"rgb("+l(this._r)+", "+l(this._g)+", "+l(this._b)+")":"rgba("+l(this._r)+", "+l(this._g)+", "+l(this._b)+", "+this._roundA+")"},toPercentageRgb:function(){return{r:l(100*O(this._r,255))+"%",g:l(100*O(this._g,255))+"%",b:l(100*O(this._b,255))+"%",a:this._a}},toPercentageRgbString:function(){return 1==this._a?"rgb("+l(100*O(this._r,255))+"%, "+l(100*O(this._g,255))+"%, "+l(100*O(this._b,255))+"%)":"rgba("+l(100*O(this._r,255))+"%, "+l(100*O(this._g,255))+"%, "+l(100*O(this._b,255))+"%, "+this._roundA+")"},toName:function(){return 0===this._a?"transparent":!(this._a<1)&&(N[v(this._r,this._g,this._b,!0)]||!1)},toFilter:function(t){var e="#"+b(this._r,this._g,this._b,this._a),n=e,i=this._gradientType?"GradientType = 1, ":"";if(t){var o=d(t);n="#"+b(o._r,o._g,o._b,o._a)}return"progid:DXImageTransform.Microsoft.gradient("+i+"startColorstr="+e+",endColorstr="+n+")"},toString:function(t){var e=!!t;t=t||this._format;var n=!1,i=this._a<1&&this._a>=0;return e||!i||"hex"!==t&&"hex6"!==t&&"hex3"!==t&&"hex4"!==t&&"hex8"!==t&&"name"!==t?("rgb"===t&&(n=this.toRgbString()),"prgb"===t&&(n=this.toPercentageRgbString()),"hex"!==t&&"hex6"!==t||(n=this.toHexString()),"hex3"===t&&(n=this.toHexString(!0)),"hex4"===t&&(n=this.toHex8String(!0)),"hex8"===t&&(n=this.toHex8String()),"name"===t&&(n=this.toName()),"hsl"===t&&(n=this.toHslString()),"hsv"===t&&(n=this.toHsvString()),n||this.toHexString()):"name"===t&&0===this._a?this.toName():this.toRgbString()},clone:function(){return d(this.toString())},_applyModification:function(t,e){var n=t.apply(null,[this].concat([].slice.call(e)));return this._r=n._r,this._g=n._g,this._b=n._b,this.setAlpha(n._a),this},lighten:function(){return this._applyModification(x,arguments)},brighten:function(){return this._applyModification(_,arguments)},darken:function(){return this._applyModification(w,arguments)},desaturate:function(){return this._applyModification(m,arguments)},saturate:function(){return this._applyModification(g,arguments)},greyscale:function(){return this._applyModification(y,arguments)},spin:function(){return this._applyModification(S,arguments)},_applyCombination:function(t,e){return t.apply(null,[this].concat([].slice.call(e)))},analogous:function(){return this._applyCombination(I,arguments)},complement:function(){return this._applyCombination(E,arguments)},monochromatic:function(){return this._applyCombination(C,arguments)},splitcomplement:function(){return this._applyCombination(A,arguments)},triad:function(){return this._applyCombination(k,arguments)},tetrad:function(){return this._applyCombination(M,arguments)}},d.fromRatio=function(t,e){if("object"==typeof t){var n={};for(var i in t)t.hasOwnProperty(i)&&(n[i]="a"===i?t[i]:z(t[i]));t=n}return d(t,e)},d.equals=function(t,e){return!(!t||!e)&&d(t).toRgbString()==d(e).toRgbString()},d.random=function(){return d.fromRatio({r:h(),g:h(),b:h()})},d.mix=function(t,e,n){n=0===n?0:n||50;var i=d(t).toRgb(),o=d(e).toRgb(),r=n/100;return d({r:(o.r-i.r)*r+i.r,g:(o.g-i.g)*r+i.g,b:(o.b-i.b)*r+i.b,a:(o.a-i.a)*r+i.a})},d.readability=function(t,e){var n=d(t),i=d(e);return(o.max(n.getLuminance(),i.getLuminance())+.05)/(o.min(n.getLuminance(),i.getLuminance())+.05)},d.isReadable=function(t,e,n){var i,o,r=d.readability(t,e);switch(o=!1,(i=function(t){var e,n;e=((t=t||{level:"AA",size:"small"}).level||"AA").toUpperCase(),n=(t.size||"small").toLowerCase(),"AA"!==e&&"AAA"!==e&&(e="AA");"small"!==n&&"large"!==n&&(n="small");return{level:e,size:n}}(n)).level+i.size){case"AAsmall":case"AAAlarge":o=r>=4.5;break;case"AAlarge":o=r>=3;break;case"AAAsmall":o=r>=7}return o},d.mostReadable=function(t,e,n){var i,o,r,s,a=null,l=0;o=(n=n||{}).includeFallbackColors,r=n.level,s=n.size;for(var c=0;c<e.length;c++)(i=d.readability(t,e[c]))>l&&(l=i,a=d(e[c]));return d.isReadable(t,a,{level:r,size:s})||!o?a:(n.includeFallbackColors=!1,d.mostReadable(t,["#fff","#000"],n))};var T=d.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",rebeccapurple:"663399",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},N=d.hexNames=function(t){var e={};for(var n in t)t.hasOwnProperty(n)&&(e[t[n]]=n);return e}(T);function P(t){return t=parseFloat(t),(isNaN(t)||t<0||t>1)&&(t=1),t}function O(t,e){(function(t){return"string"==typeof t&&-1!=t.indexOf(".")&&1===parseFloat(t)})(t)&&(t="100%");var n=function(t){return"string"==typeof t&&-1!=t.indexOf("%")}(t);return t=c(e,u(0,parseFloat(t))),n&&(t=parseInt(t*e,10)/100),o.abs(t-e)<1e-6?1:t%e/parseFloat(e)}function R(t){return c(1,u(0,t))}function $(t){return parseInt(t,16)}function F(t){return 1==t.length?"0"+t:""+t}function z(t){return t<=1&&(t=100*t+"%"),t}function D(t){return o.round(255*parseFloat(t)).toString(16)}function L(t){return $(t)/255}var q,j,H,V=(j="[\\s|\\(]+("+(q="(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)")+")[,|\\s]+("+q+")[,|\\s]+("+q+")\\s*\\)?",H="[\\s|\\(]+("+q+")[,|\\s]+("+q+")[,|\\s]+("+q+")[,|\\s]+("+q+")\\s*\\)?",{CSS_UNIT:new RegExp(q),rgb:new RegExp("rgb"+j),rgba:new RegExp("rgba"+H),hsl:new RegExp("hsl"+j),hsla:new RegExp("hsla"+H),hsv:new RegExp("hsv"+j),hsva:new RegExp("hsva"+H),hex3:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex4:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex8:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/});function B(t){return!!V.CSS_UNIT.exec(t)}t.exports?t.exports=d:void 0===(i=function(){return d}.call(e,n,e,t))||(t.exports=i)}(Math)},function(t,e,n){var i=n(358),o=n(359),r=n(360),s=n(361),a=n(362),l=n(363);function c(t){this._setState(t),this._listeners={},this._bind()}c.prototype._setState=i._setState,c.prototype._extendState=i._extendState,c.prototype.set=i.set,c.prototype.get=i.get,c.prototype.down=o.down,c.prototype.up=o.up,c.prototype._trigger=o._trigger,c.prototype._bind=o._bind,c.prototype._map=r._map,c.prototype._offset=r._offset,c.prototype._isNote=r._isNote,c.prototype._toFrequency=r._toFrequency,c.prototype._keyMap=r._keyMap,c.prototype._addKey=s._addKey,c.prototype._removeKey=s._removeKey,c.prototype._isPressed=s._isPressed,c.prototype._makeNote=s._makeNote,c.prototype.clear=s.clear,c.prototype._update=s._update,c.prototype._diff=s._diff,c.prototype._prioritize=a._prioritize,c.prototype._last=a._last,c.prototype._first=a._first,c.prototype._highest=a._highest,c.prototype._lowest=a._lowest,c.prototype._isSpecialKey=l._isSpecialKey,c.prototype._specialKey=l._specialKey,c.prototype._specialKeyMap=l._specialKeyMap,t.exports=c},function(t,e,n){var i=n(364),o=i.library["bundle-node"]?i.library["dist-node"]:i.library.entry;t.exports=n(365)("./"+o)},function(t,e,n){n(141),t.exports=n(366)},function(t,e,n){n(142),n(339),n(53),n(341),n(130),n(342),n(343),n(344),n(345),n(346),n(347),n(348),n(349),n(350),n(351),t.exports=n(13)},function(t,e,n){n(143),n(145),n(146),n(147),n(148),n(149),n(150),n(151),n(152),n(153),n(154),n(155),n(156),n(157),n(158),n(159),n(161),n(162),n(163),n(164),n(165),n(166),n(167),n(168),n(169),n(170),n(171),n(172),n(173),n(174),n(175),n(176),n(177),n(178),n(179),n(180),n(181),n(182),n(183),n(184),n(185),n(186),n(187),n(188),n(189),n(190),n(191),n(192),n(193),n(194),n(195),n(196),n(197),n(198),n(199),n(200),n(201),n(202),n(203),n(204),n(205),n(206),n(207),n(208),n(209),n(210),n(211),n(212),n(213),n(214),n(215),n(216),n(217),n(218),n(219),n(220),n(221),n(223),n(224),n(226),n(227),n(228),n(229),n(230),n(231),n(232),n(234),n(235),n(236),n(237),n(238),n(239),n(240),n(241),n(242),n(243),n(244),n(245),n(246),n(91),n(247),n(248),n(115),n(249),n(250),n(251),n(252),n(253),n(118),n(120),n(121),n(254),n(255),n(256),n(257),n(258),n(259),n(260),n(261),n(262),n(263),n(264),n(265),n(266),n(267),n(268),n(269),n(270),n(271),n(272),n(273),n(274),n(275),n(276),n(277),n(278),n(279),n(280),n(281),n(282),n(283),n(284),n(285),n(286),n(287),n(288),n(289),n(290),n(291),n(292),n(293),n(294),n(295),n(296),n(297),n(298),n(299),n(300),n(301),n(302),n(303),n(304),n(305),n(306),n(307),n(308),n(309),n(310),n(311),n(312),n(313),n(314),n(315),n(316),n(317),n(318),n(319),n(320),n(321),n(322),n(323),n(324),n(325),n(326),n(327),n(328),n(329),n(330),n(331),n(332),n(333),n(334),n(335),n(336),n(337),n(338),t.exports=n(13)},function(t,e,n){"use strict";var i=n(3),o=n(15),r=n(9),s=n(1),a=n(17),l=n(34).KEY,c=n(5),u=n(54),h=n(47),d=n(39),p=n(6),f=n(101),v=n(72),b=n(144),m=n(57),g=n(2),y=n(4),x=n(14),_=n(24),w=n(33),S=n(30),E=n(104),k=n(18),M=n(8),A=n(29),I=k.f,C=M.f,T=E.f,N=i.Symbol,P=i.JSON,O=P&&P.stringify,R=p("_hidden"),$=p("toPrimitive"),F={}.propertyIsEnumerable,z=u("symbol-registry"),D=u("symbols"),L=u("op-symbols"),q=Object.prototype,j="function"==typeof N,H=i.QObject,V=!H||!H.prototype||!H.prototype.findChild,B=r&&c(function(){return 7!=S(C({},"a",{get:function(){return C(this,"a",{value:7}).a}})).a})?function(t,e,n){var i=I(q,e);i&&delete q[e],C(t,e,n),i&&t!==q&&C(q,e,i)}:C,G=function(t){var e=D[t]=S(N.prototype);return e._k=t,e},U=j&&"symbol"==typeof N.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof N},W=function(t,e,n){return t===q&&W(L,e,n),g(t),e=_(e,!0),g(n),o(D,e)?(n.enumerable?(o(t,R)&&t[R][e]&&(t[R][e]=!1),n=S(n,{enumerable:w(0,!1)})):(o(t,R)||C(t,R,w(1,{})),t[R][e]=!0),B(t,e,n)):C(t,e,n)},Y=function(t,e){g(t);for(var n,i=b(e=x(e)),o=0,r=i.length;r>o;)W(t,n=i[o++],e[n]);return t},K=function(t){var e=F.call(this,t=_(t,!0));return!(this===q&&o(D,t)&&!o(L,t))&&(!(e||!o(this,t)||!o(D,t)||o(this,R)&&this[R][t])||e)},J=function(t,e){if(t=x(t),e=_(e,!0),t!==q||!o(D,e)||o(L,e)){var n=I(t,e);return!n||!o(D,e)||o(t,R)&&t[R][e]||(n.enumerable=!0),n}},X=function(t){for(var e,n=T(x(t)),i=[],r=0;n.length>r;)o(D,e=n[r++])||e==R||e==l||i.push(e);return i},Q=function(t){for(var e,n=t===q,i=T(n?L:x(t)),r=[],s=0;i.length>s;)!o(D,e=i[s++])||n&&!o(q,e)||r.push(D[e]);return r};j||(a((N=function(){if(this instanceof N)throw TypeError("Symbol is not a constructor!");var t=d(arguments.length>0?arguments[0]:void 0),e=function(n){this===q&&e.call(L,n),o(this,R)&&o(this[R],t)&&(this[R][t]=!1),B(this,t,w(1,n))};return r&&V&&B(q,t,{configurable:!0,set:e}),G(t)}).prototype,"toString",function(){return this._k}),k.f=J,M.f=W,n(41).f=E.f=X,n(52).f=K,n(56).f=Q,r&&!n(35)&&a(q,"propertyIsEnumerable",K,!0),f.f=function(t){return G(p(t))}),s(s.G+s.W+s.F*!j,{Symbol:N});for(var Z="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),tt=0;Z.length>tt;)p(Z[tt++]);for(var et=A(p.store),nt=0;et.length>nt;)v(et[nt++]);s(s.S+s.F*!j,"Symbol",{for:function(t){return o(z,t+="")?z[t]:z[t]=N(t)},keyFor:function(t){if(!U(t))throw TypeError(t+" is not a symbol!");for(var e in z)if(z[e]===t)return e},useSetter:function(){V=!0},useSimple:function(){V=!1}}),s(s.S+s.F*!j,"Object",{create:function(t,e){return void 0===e?S(t):Y(S(t),e)},defineProperty:W,defineProperties:Y,getOwnPropertyDescriptor:J,getOwnPropertyNames:X,getOwnPropertySymbols:Q}),P&&s(s.S+s.F*(!j||c(function(){var t=N();return"[null]"!=O([t])||"{}"!=O({a:t})||"{}"!=O(Object(t))})),"JSON",{stringify:function(t){for(var e,n,i=[t],o=1;arguments.length>o;)i.push(arguments[o++]);if(n=e=i[1],(y(e)||void 0!==t)&&!U(t))return m(e)||(e=function(t,e){if("function"==typeof n&&(e=n.call(this,t,e)),!U(e))return e}),i[1]=e,O.apply(P,i)}}),N.prototype[$]||n(16)(N.prototype,$,N.prototype.valueOf),h(N,"Symbol"),h(Math,"Math",!0),h(i.JSON,"JSON",!0)},function(t,e,n){var i=n(29),o=n(56),r=n(52);t.exports=function(t){var e=i(t),n=o.f;if(n)for(var s,a=n(t),l=r.f,c=0;a.length>c;)l.call(t,s=a[c++])&&e.push(s);return e}},function(t,e,n){var i=n(1);i(i.S,"Object",{create:n(30)})},function(t,e,n){var i=n(1);i(i.S+i.F*!n(9),"Object",{defineProperty:n(8).f})},function(t,e,n){var i=n(1);i(i.S+i.F*!n(9),"Object",{defineProperties:n(103)})},function(t,e,n){var i=n(14),o=n(18).f;n(27)("getOwnPropertyDescriptor",function(){return function(t,e){return o(i(t),e)}})},function(t,e,n){var i=n(11),o=n(19);n(27)("getPrototypeOf",function(){return function(t){return o(i(t))}})},function(t,e,n){var i=n(11),o=n(29);n(27)("keys",function(){return function(t){return o(i(t))}})},function(t,e,n){n(27)("getOwnPropertyNames",function(){return n(104).f})},function(t,e,n){var i=n(4),o=n(34).onFreeze;n(27)("freeze",function(t){return function(e){return t&&i(e)?t(o(e)):e}})},function(t,e,n){var i=n(4),o=n(34).onFreeze;n(27)("seal",function(t){return function(e){return t&&i(e)?t(o(e)):e}})},function(t,e,n){var i=n(4),o=n(34).onFreeze;n(27)("preventExtensions",function(t){return function(e){return t&&i(e)?t(o(e)):e}})},function(t,e,n){var i=n(4);n(27)("isFrozen",function(t){return function(e){return!i(e)||!!t&&t(e)}})},function(t,e,n){var i=n(4);n(27)("isSealed",function(t){return function(e){return!i(e)||!!t&&t(e)}})},function(t,e,n){var i=n(4);n(27)("isExtensible",function(t){return function(e){return!!i(e)&&(!t||t(e))}})},function(t,e,n){var i=n(1);i(i.S+i.F,"Object",{assign:n(76)})},function(t,e,n){var i=n(1);i(i.S,"Object",{is:n(160)})},function(t,e){t.exports=Object.is||function(t,e){return t===e?0!==t||1/t==1/e:t!=t&&e!=e}},function(t,e,n){var i=n(1);i(i.S,"Object",{setPrototypeOf:n(77).set})},function(t,e,n){"use strict";var i=n(42),o={};o[n(6)("toStringTag")]="z",o+""!="[object z]"&&n(17)(Object.prototype,"toString",function(){return"[object "+i(this)+"]"},!0)},function(t,e,n){var i=n(1);i(i.P,"Function",{bind:n(105)})},function(t,e,n){var i=n(8).f,o=Function.prototype,r=/^\s*function ([^ (]*)/;"name"in o||n(9)&&i(o,"name",{configurable:!0,get:function(){try{return(""+this).match(r)[1]}catch(t){return""}}})},function(t,e,n){"use strict";var i=n(4),o=n(19),r=n(6)("hasInstance"),s=Function.prototype;r in s||n(8).f(s,r,{value:function(t){if("function"!=typeof this||!i(t))return!1;if(!i(this.prototype))return t instanceof this;for(;t=o(t);)if(this.prototype===t)return!0;return!1}})},function(t,e,n){var i=n(1),o=n(106);i(i.G+i.F*(parseInt!=o),{parseInt:o})},function(t,e,n){var i=n(1),o=n(107);i(i.G+i.F*(parseFloat!=o),{parseFloat:o})},function(t,e,n){"use strict";var i=n(3),o=n(15),r=n(22),s=n(80),a=n(24),l=n(5),c=n(41).f,u=n(18).f,h=n(8).f,d=n(48).trim,p=i.Number,f=p,v=p.prototype,b="Number"==r(n(30)(v)),m="trim"in String.prototype,g=function(t){var e=a(t,!1);if("string"==typeof e&&e.length>2){var n,i,o,r=(e=m?e.trim():d(e,3)).charCodeAt(0);if(43===r||45===r){if(88===(n=e.charCodeAt(2))||120===n)return NaN}else if(48===r){switch(e.charCodeAt(1)){case 66:case 98:i=2,o=49;break;case 79:case 111:i=8,o=55;break;default:return+e}for(var s,l=e.slice(2),c=0,u=l.length;c<u;c++)if((s=l.charCodeAt(c))<48||s>o)return NaN;return parseInt(l,i)}}return+e};if(!p(" 0o1")||!p("0b1")||p("+0x1")){p=function(t){var e=arguments.length<1?0:t,n=this;return n instanceof p&&(b?l(function(){v.valueOf.call(n)}):"Number"!=r(n))?s(new f(g(e)),n,p):g(e)};for(var y,x=n(9)?c(f):"MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","),_=0;x.length>_;_++)o(f,y=x[_])&&!o(p,y)&&h(p,y,u(f,y));p.prototype=v,v.constructor=p,n(17)(i,"Number",p)}},function(t,e,n){"use strict";var i=n(1),o=n(26),r=n(108),s=n(81),a=1..toFixed,l=Math.floor,c=[0,0,0,0,0,0],u="Number.toFixed: incorrect invocation!",h=function(t,e){for(var n=-1,i=e;++n<6;)i+=t*c[n],c[n]=i%1e7,i=l(i/1e7)},d=function(t){for(var e=6,n=0;--e>=0;)n+=c[e],c[e]=l(n/t),n=n%t*1e7},p=function(){for(var t=6,e="";--t>=0;)if(""!==e||0===t||0!==c[t]){var n=String(c[t]);e=""===e?n:e+s.call("0",7-n.length)+n}return e},f=function(t,e,n){return 0===e?n:e%2==1?f(t,e-1,n*t):f(t*t,e/2,n)};i(i.P+i.F*(!!a&&("0.000"!==8e-5.toFixed(3)||"1"!==.9.toFixed(0)||"1.25"!==1.255.toFixed(2)||"1000000000000000128"!==(0xde0b6b3a7640080).toFixed(0))||!n(5)(function(){a.call({})})),"Number",{toFixed:function(t){var e,n,i,a,l=r(this,u),c=o(t),v="",b="0";if(c<0||c>20)throw RangeError(u);if(l!=l)return"NaN";if(l<=-1e21||l>=1e21)return String(l);if(l<0&&(v="-",l=-l),l>1e-21)if(n=(e=function(t){for(var e=0,n=t;n>=4096;)e+=12,n/=4096;for(;n>=2;)e+=1,n/=2;return e}(l*f(2,69,1))-69)<0?l*f(2,-e,1):l/f(2,e,1),n*=4503599627370496,(e=52-e)>0){for(h(0,n),i=c;i>=7;)h(1e7,0),i-=7;for(h(f(10,i,1),0),i=e-1;i>=23;)d(1<<23),i-=23;d(1<<i),h(1,1),d(2),b=p()}else h(0,n),h(1<<-e,0),b=p()+s.call("0",c);return b=c>0?v+((a=b.length)<=c?"0."+s.call("0",c-a)+b:b.slice(0,a-c)+"."+b.slice(a-c)):v+b}})},function(t,e,n){"use strict";var i=n(1),o=n(5),r=n(108),s=1..toPrecision;i(i.P+i.F*(o(function(){return"1"!==s.call(1,void 0)})||!o(function(){s.call({})})),"Number",{toPrecision:function(t){var e=r(this,"Number#toPrecision: incorrect invocation!");return void 0===t?s.call(e):s.call(e,t)}})},function(t,e,n){var i=n(1);i(i.S,"Number",{EPSILON:Math.pow(2,-52)})},function(t,e,n){var i=n(1),o=n(3).isFinite;i(i.S,"Number",{isFinite:function(t){return"number"==typeof t&&o(t)}})},function(t,e,n){var i=n(1);i(i.S,"Number",{isInteger:n(109)})},function(t,e,n){var i=n(1);i(i.S,"Number",{isNaN:function(t){return t!=t}})},function(t,e,n){var i=n(1),o=n(109),r=Math.abs;i(i.S,"Number",{isSafeInteger:function(t){return o(t)&&r(t)<=9007199254740991}})},function(t,e,n){var i=n(1);i(i.S,"Number",{MAX_SAFE_INTEGER:9007199254740991})},function(t,e,n){var i=n(1);i(i.S,"Number",{MIN_SAFE_INTEGER:-9007199254740991})},function(t,e,n){var i=n(1),o=n(107);i(i.S+i.F*(Number.parseFloat!=o),"Number",{parseFloat:o})},function(t,e,n){var i=n(1),o=n(106);i(i.S+i.F*(Number.parseInt!=o),"Number",{parseInt:o})},function(t,e,n){var i=n(1),o=n(110),r=Math.sqrt,s=Math.acosh;i(i.S+i.F*!(s&&710==Math.floor(s(Number.MAX_VALUE))&&s(1/0)==1/0),"Math",{acosh:function(t){return(t=+t)<1?NaN:t>94906265.62425156?Math.log(t)+Math.LN2:o(t-1+r(t-1)*r(t+1))}})},function(t,e,n){var i=n(1),o=Math.asinh;i(i.S+i.F*!(o&&1/o(0)>0),"Math",{asinh:function t(e){return isFinite(e=+e)&&0!=e?e<0?-t(-e):Math.log(e+Math.sqrt(e*e+1)):e}})},function(t,e,n){var i=n(1),o=Math.atanh;i(i.S+i.F*!(o&&1/o(-0)<0),"Math",{atanh:function(t){return 0==(t=+t)?t:Math.log((1+t)/(1-t))/2}})},function(t,e,n){var i=n(1),o=n(82);i(i.S,"Math",{cbrt:function(t){return o(t=+t)*Math.pow(Math.abs(t),1/3)}})},function(t,e,n){var i=n(1);i(i.S,"Math",{clz32:function(t){return(t>>>=0)?31-Math.floor(Math.log(t+.5)*Math.LOG2E):32}})},function(t,e,n){var i=n(1),o=Math.exp;i(i.S,"Math",{cosh:function(t){return(o(t=+t)+o(-t))/2}})},function(t,e,n){var i=n(1),o=n(83);i(i.S+i.F*(o!=Math.expm1),"Math",{expm1:o})},function(t,e,n){var i=n(1);i(i.S,"Math",{fround:n(111)})},function(t,e,n){var i=n(1),o=Math.abs;i(i.S,"Math",{hypot:function(t,e){for(var n,i,r=0,s=0,a=arguments.length,l=0;s<a;)l<(n=o(arguments[s++]))?(r=r*(i=l/n)*i+1,l=n):r+=n>0?(i=n/l)*i:n;return l===1/0?1/0:l*Math.sqrt(r)}})},function(t,e,n){var i=n(1),o=Math.imul;i(i.S+i.F*n(5)(function(){return-5!=o(4294967295,5)||2!=o.length}),"Math",{imul:function(t,e){var n=+t,i=+e,o=65535&n,r=65535&i;return 0|o*r+((65535&n>>>16)*r+o*(65535&i>>>16)<<16>>>0)}})},function(t,e,n){var i=n(1);i(i.S,"Math",{log10:function(t){return Math.log(t)*Math.LOG10E}})},function(t,e,n){var i=n(1);i(i.S,"Math",{log1p:n(110)})},function(t,e,n){var i=n(1);i(i.S,"Math",{log2:function(t){return Math.log(t)/Math.LN2}})},function(t,e,n){var i=n(1);i(i.S,"Math",{sign:n(82)})},function(t,e,n){var i=n(1),o=n(83),r=Math.exp;i(i.S+i.F*n(5)(function(){return-2e-17!=!Math.sinh(-2e-17)}),"Math",{sinh:function(t){return Math.abs(t=+t)<1?(o(t)-o(-t))/2:(r(t-1)-r(-t-1))*(Math.E/2)}})},function(t,e,n){var i=n(1),o=n(83),r=Math.exp;i(i.S,"Math",{tanh:function(t){var e=o(t=+t),n=o(-t);return e==1/0?1:n==1/0?-1:(e-n)/(r(t)+r(-t))}})},function(t,e,n){var i=n(1);i(i.S,"Math",{trunc:function(t){return(t>0?Math.floor:Math.ceil)(t)}})},function(t,e,n){var i=n(1),o=n(40),r=String.fromCharCode,s=String.fromCodePoint;i(i.S+i.F*(!!s&&1!=s.length),"String",{fromCodePoint:function(t){for(var e,n=[],i=arguments.length,s=0;i>s;){if(e=+arguments[s++],o(e,1114111)!==e)throw RangeError(e+" is not a valid code point");n.push(e<65536?r(e):r(55296+((e-=65536)>>10),e%1024+56320))}return n.join("")}})},function(t,e,n){var i=n(1),o=n(14),r=n(10);i(i.S,"String",{raw:function(t){for(var e=o(t.raw),n=r(e.length),i=arguments.length,s=[],a=0;n>a;)s.push(String(e[a++])),a<i&&s.push(String(arguments[a]));return s.join("")}})},function(t,e,n){"use strict";n(48)("trim",function(t){return function(){return t(this,3)}})},function(t,e,n){"use strict";var i=n(84)(!0);n(58)(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,e=this._t,n=this._i;return n>=e.length?{value:void 0,done:!0}:(t=i(e,n),this._i+=t.length,{value:t,done:!1})})},function(t,e,n){"use strict";var i=n(1),o=n(84)(!1);i(i.P,"String",{codePointAt:function(t){return o(this,t)}})},function(t,e,n){"use strict";var i=n(1),o=n(10),r=n(85),s="".endsWith;i(i.P+i.F*n(86)("endsWith"),"String",{endsWith:function(t){var e=r(this,t,"endsWith"),n=arguments.length>1?arguments[1]:void 0,i=o(e.length),a=void 0===n?i:Math.min(o(n),i),l=String(t);return s?s.call(e,l,a):e.slice(a-l.length,a)===l}})},function(t,e,n){"use strict";var i=n(1),o=n(85);i(i.P+i.F*n(86)("includes"),"String",{includes:function(t){return!!~o(this,t,"includes").indexOf(t,arguments.length>1?arguments[1]:void 0)}})},function(t,e,n){var i=n(1);i(i.P,"String",{repeat:n(81)})},function(t,e,n){"use strict";var i=n(1),o=n(10),r=n(85),s="".startsWith;i(i.P+i.F*n(86)("startsWith"),"String",{startsWith:function(t){var e=r(this,t,"startsWith"),n=o(Math.min(arguments.length>1?arguments[1]:void 0,e.length)),i=String(t);return s?s.call(e,i,n):e.slice(n,n+i.length)===i}})},function(t,e,n){"use strict";n(20)("anchor",function(t){return function(e){return t(this,"a","name",e)}})},function(t,e,n){"use strict";n(20)("big",function(t){return function(){return t(this,"big","","")}})},function(t,e,n){"use strict";n(20)("blink",function(t){return function(){return t(this,"blink","","")}})},function(t,e,n){"use strict";n(20)("bold",function(t){return function(){return t(this,"b","","")}})},function(t,e,n){"use strict";n(20)("fixed",function(t){return function(){return t(this,"tt","","")}})},function(t,e,n){"use strict";n(20)("fontcolor",function(t){return function(e){return t(this,"font","color",e)}})},function(t,e,n){"use strict";n(20)("fontsize",function(t){return function(e){return t(this,"font","size",e)}})},function(t,e,n){"use strict";n(20)("italics",function(t){return function(){return t(this,"i","","")}})},function(t,e,n){"use strict";n(20)("link",function(t){return function(e){return t(this,"a","href",e)}})},function(t,e,n){"use strict";n(20)("small",function(t){return function(){return t(this,"small","","")}})},function(t,e,n){"use strict";n(20)("strike",function(t){return function(){return t(this,"strike","","")}})},function(t,e,n){"use strict";n(20)("sub",function(t){return function(){return t(this,"sub","","")}})},function(t,e,n){"use strict";n(20)("sup",function(t){return function(){return t(this,"sup","","")}})},function(t,e,n){var i=n(1);i(i.S,"Date",{now:function(){return(new Date).getTime()}})},function(t,e,n){"use strict";var i=n(1),o=n(11),r=n(24);i(i.P+i.F*n(5)(function(){return null!==new Date(NaN).toJSON()||1!==Date.prototype.toJSON.call({toISOString:function(){return 1}})}),"Date",{toJSON:function(t){var e=o(this),n=r(e);return"number"!=typeof n||isFinite(n)?e.toISOString():null}})},function(t,e,n){var i=n(1),o=n(222);i(i.P+i.F*(Date.prototype.toISOString!==o),"Date",{toISOString:o})},function(t,e,n){"use strict";var i=n(5),o=Date.prototype.getTime,r=Date.prototype.toISOString,s=function(t){return t>9?t:"0"+t};t.exports=i(function(){return"0385-07-25T07:06:39.999Z"!=r.call(new Date(-5e13-1))})||!i(function(){r.call(new Date(NaN))})?function(){if(!isFinite(o.call(this)))throw RangeError("Invalid time value");var t=this,e=t.getUTCFullYear(),n=t.getUTCMilliseconds(),i=e<0?"-":e>9999?"+":"";return i+("00000"+Math.abs(e)).slice(i?-6:-4)+"-"+s(t.getUTCMonth()+1)+"-"+s(t.getUTCDate())+"T"+s(t.getUTCHours())+":"+s(t.getUTCMinutes())+":"+s(t.getUTCSeconds())+"."+(n>99?n:"0"+s(n))+"Z"}:r},function(t,e,n){var i=Date.prototype,o=i.toString,r=i.getTime;new Date(NaN)+""!="Invalid Date"&&n(17)(i,"toString",function(){var t=r.call(this);return t==t?o.call(this):"Invalid Date"})},function(t,e,n){var i=n(6)("toPrimitive"),o=Date.prototype;i in o||n(16)(o,i,n(225))},function(t,e,n){"use strict";var i=n(2),o=n(24);t.exports=function(t){if("string"!==t&&"number"!==t&&"default"!==t)throw TypeError("Incorrect hint");return o(i(this),"number"!=t)}},function(t,e,n){var i=n(1);i(i.S,"Array",{isArray:n(57)})},function(t,e,n){"use strict";var i=n(21),o=n(1),r=n(11),s=n(112),a=n(87),l=n(10),c=n(88),u=n(53);o(o.S+o.F*!n(61)(function(t){Array.from(t)}),"Array",{from:function(t){var e,n,o,h,d=r(t),p="function"==typeof this?this:Array,f=arguments.length,v=f>1?arguments[1]:void 0,b=void 0!==v,m=0,g=u(d);if(b&&(v=i(v,f>2?arguments[2]:void 0,2)),null==g||p==Array&&a(g))for(n=new p(e=l(d.length));e>m;m++)c(n,m,b?v(d[m],m):d[m]);else for(h=g.call(d),n=new p;!(o=h.next()).done;m++)c(n,m,b?s(h,v,[o.value,m],!0):o.value);return n.length=m,n}})},function(t,e,n){"use strict";var i=n(1),o=n(88);i(i.S+i.F*n(5)(function(){function t(){}return!(Array.of.call(t)instanceof t)}),"Array",{of:function(){for(var t=0,e=arguments.length,n=new("function"==typeof this?this:Array)(e);e>t;)o(n,t,arguments[t++]);return n.length=e,n}})},function(t,e,n){"use strict";var i=n(1),o=n(14),r=[].join;i(i.P+i.F*(n(51)!=Object||!n(23)(r)),"Array",{join:function(t){return r.call(o(this),void 0===t?",":t)}})},function(t,e,n){"use strict";var i=n(1),o=n(75),r=n(22),s=n(40),a=n(10),l=[].slice;i(i.P+i.F*n(5)(function(){o&&l.call(o)}),"Array",{slice:function(t,e){var n=a(this.length),i=r(this);if(e=void 0===e?n:e,"Array"==i)return l.call(this,t,e);for(var o=s(t,n),c=s(e,n),u=a(c-o),h=new Array(u),d=0;d<u;d++)h[d]="String"==i?this.charAt(o+d):this[o+d];return h}})},function(t,e,n){"use strict";var i=n(1),o=n(12),r=n(11),s=n(5),a=[].sort,l=[1,2,3];i(i.P+i.F*(s(function(){l.sort(void 0)})||!s(function(){l.sort(null)})||!n(23)(a)),"Array",{sort:function(t){return void 0===t?a.call(r(this)):a.call(r(this),o(t))}})},function(t,e,n){"use strict";var i=n(1),o=n(28)(0),r=n(23)([].forEach,!0);i(i.P+i.F*!r,"Array",{forEach:function(t){return o(this,t,arguments[1])}})},function(t,e,n){var i=n(4),o=n(57),r=n(6)("species");t.exports=function(t){var e;return o(t)&&("function"!=typeof(e=t.constructor)||e!==Array&&!o(e.prototype)||(e=void 0),i(e)&&null===(e=e[r])&&(e=void 0)),void 0===e?Array:e}},function(t,e,n){"use strict";var i=n(1),o=n(28)(1);i(i.P+i.F*!n(23)([].map,!0),"Array",{map:function(t){return o(this,t,arguments[1])}})},function(t,e,n){"use strict";var i=n(1),o=n(28)(2);i(i.P+i.F*!n(23)([].filter,!0),"Array",{filter:function(t){return o(this,t,arguments[1])}})},function(t,e,n){"use strict";var i=n(1),o=n(28)(3);i(i.P+i.F*!n(23)([].some,!0),"Array",{some:function(t){return o(this,t,arguments[1])}})},function(t,e,n){"use strict";var i=n(1),o=n(28)(4);i(i.P+i.F*!n(23)([].every,!0),"Array",{every:function(t){return o(this,t,arguments[1])}})},function(t,e,n){"use strict";var i=n(1),o=n(113);i(i.P+i.F*!n(23)([].reduce,!0),"Array",{reduce:function(t){return o(this,t,arguments.length,arguments[1],!1)}})},function(t,e,n){"use strict";var i=n(1),o=n(113);i(i.P+i.F*!n(23)([].reduceRight,!0),"Array",{reduceRight:function(t){return o(this,t,arguments.length,arguments[1],!0)}})},function(t,e,n){"use strict";var i=n(1),o=n(55)(!1),r=[].indexOf,s=!!r&&1/[1].indexOf(1,-0)<0;i(i.P+i.F*(s||!n(23)(r)),"Array",{indexOf:function(t){return s?r.apply(this,arguments)||0:o(this,t,arguments[1])}})},function(t,e,n){"use strict";var i=n(1),o=n(14),r=n(26),s=n(10),a=[].lastIndexOf,l=!!a&&1/[1].lastIndexOf(1,-0)<0;i(i.P+i.F*(l||!n(23)(a)),"Array",{lastIndexOf:function(t){if(l)return a.apply(this,arguments)||0;var e=o(this),n=s(e.length),i=n-1;for(arguments.length>1&&(i=Math.min(i,r(arguments[1]))),i<0&&(i=n+i);i>=0;i--)if(i in e&&e[i]===t)return i||0;return-1}})},function(t,e,n){var i=n(1);i(i.P,"Array",{copyWithin:n(114)}),n(36)("copyWithin")},function(t,e,n){var i=n(1);i(i.P,"Array",{fill:n(90)}),n(36)("fill")},function(t,e,n){"use strict";var i=n(1),o=n(28)(5),r=!0;"find"in[]&&Array(1).find(function(){r=!1}),i(i.P+i.F*r,"Array",{find:function(t){return o(this,t,arguments.length>1?arguments[1]:void 0)}}),n(36)("find")},function(t,e,n){"use strict";var i=n(1),o=n(28)(6),r="findIndex",s=!0;r in[]&&Array(1)[r](function(){s=!1}),i(i.P+i.F*s,"Array",{findIndex:function(t){return o(this,t,arguments.length>1?arguments[1]:void 0)}}),n(36)(r)},function(t,e,n){n(44)("Array")},function(t,e,n){var i=n(3),o=n(80),r=n(8).f,s=n(41).f,a=n(60),l=n(62),c=i.RegExp,u=c,h=c.prototype,d=/a/g,p=/a/g,f=new c(d)!==d;if(n(9)&&(!f||n(5)(function(){return p[n(6)("match")]=!1,c(d)!=d||c(p)==p||"/a/i"!=c(d,"i")}))){c=function(t,e){var n=this instanceof c,i=a(t),r=void 0===e;return!n&&i&&t.constructor===c&&r?t:o(f?new u(i&&!r?t.source:t,e):u((i=t instanceof c)?t.source:t,i&&r?l.call(t):e),n?this:h,c)};for(var v=function(t){t in c||r(c,t,{configurable:!0,get:function(){return u[t]},set:function(e){u[t]=e}})},b=s(u),m=0;b.length>m;)v(b[m++]);h.constructor=c,c.prototype=h,n(17)(i,"RegExp",c)}n(44)("RegExp")},function(t,e,n){"use strict";n(115);var i=n(2),o=n(62),r=n(9),s=/./.toString,a=function(t){n(17)(RegExp.prototype,"toString",t,!0)};n(5)(function(){return"/a/b"!=s.call({source:"a",flags:"b"})})?a(function(){var t=i(this);return"/".concat(t.source,"/","flags"in t?t.flags:!r&&t instanceof RegExp?o.call(t):void 0)}):"toString"!=s.name&&a(function(){return s.call(this)})},function(t,e,n){n(63)("match",1,function(t,e,n){return[function(n){"use strict";var i=t(this),o=null==n?void 0:n[e];return void 0!==o?o.call(n,i):new RegExp(n)[e](String(i))},n]})},function(t,e,n){n(63)("replace",2,function(t,e,n){return[function(i,o){"use strict";var r=t(this),s=null==i?void 0:i[e];return void 0!==s?s.call(i,r,o):n.call(String(r),i,o)},n]})},function(t,e,n){n(63)("search",1,function(t,e,n){return[function(n){"use strict";var i=t(this),o=null==n?void 0:n[e];return void 0!==o?o.call(n,i):new RegExp(n)[e](String(i))},n]})},function(t,e,n){n(63)("split",2,function(t,e,i){"use strict";var o=n(60),r=i,s=[].push;if("c"=="abbc".split(/(b)*/)[1]||4!="test".split(/(?:)/,-1).length||2!="ab".split(/(?:ab)*/).length||4!=".".split(/(.?)(.?)/).length||".".split(/()()/).length>1||"".split(/.?/).length){var a=void 0===/()??/.exec("")[1];i=function(t,e){var n=String(this);if(void 0===t&&0===e)return[];if(!o(t))return r.call(n,t,e);var i,l,c,u,h,d=[],p=(t.ignoreCase?"i":"")+(t.multiline?"m":"")+(t.unicode?"u":"")+(t.sticky?"y":""),f=0,v=void 0===e?4294967295:e>>>0,b=new RegExp(t.source,p+"g");for(a||(i=new RegExp("^"+b.source+"$(?!\\s)",p));(l=b.exec(n))&&!((c=l.index+l[0].length)>f&&(d.push(n.slice(f,l.index)),!a&&l.length>1&&l[0].replace(i,function(){for(h=1;h<arguments.length-2;h++)void 0===arguments[h]&&(l[h]=void 0)}),l.length>1&&l.index<n.length&&s.apply(d,l.slice(1)),u=l[0].length,f=c,d.length>=v));)b.lastIndex===l.index&&b.lastIndex++;return f===n.length?!u&&b.test("")||d.push(""):d.push(n.slice(f)),d.length>v?d.slice(0,v):d}}else"0".split(void 0,0).length&&(i=function(t,e){return void 0===t&&0===e?[]:r.call(this,t,e)});return[function(n,o){var r=t(this),s=null==n?void 0:n[e];return void 0!==s?s.call(n,r,o):i.call(String(r),n,o)},i]})},function(t,e,n){"use strict";var i,o,r,s,a=n(35),l=n(3),c=n(21),u=n(42),h=n(1),d=n(4),p=n(12),f=n(45),v=n(37),b=n(64),m=n(93).set,g=n(94)(),y=n(95),x=n(116),_=n(65),w=n(117),S=l.TypeError,E=l.process,k=E&&E.versions,M=k&&k.v8||"",A=l.Promise,I="process"==u(E),C=function(){},T=o=y.f,N=!!function(){try{var t=A.resolve(1),e=(t.constructor={})[n(6)("species")]=function(t){t(C,C)};return(I||"function"==typeof PromiseRejectionEvent)&&t.then(C)instanceof e&&0!==M.indexOf("6.6")&&-1===_.indexOf("Chrome/66")}catch(t){}}(),P=function(t){var e;return!(!d(t)||"function"!=typeof(e=t.then))&&e},O=function(t,e){if(!t._n){t._n=!0;var n=t._c;g(function(){for(var i=t._v,o=1==t._s,r=0,s=function(e){var n,r,s,a=o?e.ok:e.fail,l=e.resolve,c=e.reject,u=e.domain;try{a?(o||(2==t._h&&F(t),t._h=1),!0===a?n=i:(u&&u.enter(),n=a(i),u&&(u.exit(),s=!0)),n===e.promise?c(S("Promise-chain cycle")):(r=P(n))?r.call(n,l,c):l(n)):c(i)}catch(t){u&&!s&&u.exit(),c(t)}};n.length>r;)s(n[r++]);t._c=[],t._n=!1,e&&!t._h&&R(t)})}},R=function(t){m.call(l,function(){var e,n,i,o=t._v,r=$(t);if(r&&(e=x(function(){I?E.emit("unhandledRejection",o,t):(n=l.onunhandledrejection)?n({promise:t,reason:o}):(i=l.console)&&i.error&&i.error("Unhandled promise rejection",o)}),t._h=I||$(t)?2:1),t._a=void 0,r&&e.e)throw e.v})},$=function(t){return 1!==t._h&&0===(t._a||t._c).length},F=function(t){m.call(l,function(){var e;I?E.emit("rejectionHandled",t):(e=l.onrejectionhandled)&&e({promise:t,reason:t._v})})},z=function(t){var e=this;e._d||(e._d=!0,(e=e._w||e)._v=t,e._s=2,e._a||(e._a=e._c.slice()),O(e,!0))},D=function(t){var e,n=this;if(!n._d){n._d=!0,n=n._w||n;try{if(n===t)throw S("Promise can't be resolved itself");(e=P(t))?g(function(){var i={_w:n,_d:!1};try{e.call(t,c(D,i,1),c(z,i,1))}catch(t){z.call(i,t)}}):(n._v=t,n._s=1,O(n,!1))}catch(t){z.call({_w:n,_d:!1},t)}}};N||(A=function(t){f(this,A,"Promise","_h"),p(t),i.call(this);try{t(c(D,this,1),c(z,this,1))}catch(t){z.call(this,t)}},(i=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1}).prototype=n(46)(A.prototype,{then:function(t,e){var n=T(b(this,A));return n.ok="function"!=typeof t||t,n.fail="function"==typeof e&&e,n.domain=I?E.domain:void 0,this._c.push(n),this._a&&this._a.push(n),this._s&&O(this,!1),n.promise},catch:function(t){return this.then(void 0,t)}}),r=function(){var t=new i;this.promise=t,this.resolve=c(D,t,1),this.reject=c(z,t,1)},y.f=T=function(t){return t===A||t===s?new r(t):o(t)}),h(h.G+h.W+h.F*!N,{Promise:A}),n(47)(A,"Promise"),n(44)("Promise"),s=n(13).Promise,h(h.S+h.F*!N,"Promise",{reject:function(t){var e=T(this);return(0,e.reject)(t),e.promise}}),h(h.S+h.F*(a||!N),"Promise",{resolve:function(t){return w(a&&this===s?A:this,t)}}),h(h.S+h.F*!(N&&n(61)(function(t){A.all(t).catch(C)})),"Promise",{all:function(t){var e=this,n=T(e),i=n.resolve,o=n.reject,r=x(function(){var n=[],r=0,s=1;v(t,!1,function(t){var a=r++,l=!1;n.push(void 0),s++,e.resolve(t).then(function(t){l||(l=!0,n[a]=t,--s||i(n))},o)}),--s||i(n)});return r.e&&o(r.v),n.promise},race:function(t){var e=this,n=T(e),i=n.reject,o=x(function(){v(t,!1,function(t){e.resolve(t).then(n.resolve,i)})});return o.e&&i(o.v),n.promise}})},function(t,e,n){"use strict";var i=n(122),o=n(49);n(66)("WeakSet",function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},{add:function(t){return i.def(o(this,"WeakSet"),t,!0)}},i,!1,!0)},function(t,e,n){"use strict";var i=n(1),o=n(67),r=n(96),s=n(2),a=n(40),l=n(10),c=n(4),u=n(3).ArrayBuffer,h=n(64),d=r.ArrayBuffer,p=r.DataView,f=o.ABV&&u.isView,v=d.prototype.slice,b=o.VIEW;i(i.G+i.W+i.F*(u!==d),{ArrayBuffer:d}),i(i.S+i.F*!o.CONSTR,"ArrayBuffer",{isView:function(t){return f&&f(t)||c(t)&&b in t}}),i(i.P+i.U+i.F*n(5)(function(){return!new d(2).slice(1,void 0).byteLength}),"ArrayBuffer",{slice:function(t,e){if(void 0!==v&&void 0===e)return v.call(s(this),t);for(var n=s(this).byteLength,i=a(t,n),o=a(void 0===e?n:e,n),r=new(h(this,d))(l(o-i)),c=new p(this),u=new p(r),f=0;i<o;)u.setUint8(f++,c.getUint8(i++));return r}}),n(44)("ArrayBuffer")},function(t,e,n){var i=n(1);i(i.G+i.W+i.F*!n(67).ABV,{DataView:n(96).DataView})},function(t,e,n){n(31)("Int8",1,function(t){return function(e,n,i){return t(this,e,n,i)}})},function(t,e,n){n(31)("Uint8",1,function(t){return function(e,n,i){return t(this,e,n,i)}})},function(t,e,n){n(31)("Uint8",1,function(t){return function(e,n,i){return t(this,e,n,i)}},!0)},function(t,e,n){n(31)("Int16",2,function(t){return function(e,n,i){return t(this,e,n,i)}})},function(t,e,n){n(31)("Uint16",2,function(t){return function(e,n,i){return t(this,e,n,i)}})},function(t,e,n){n(31)("Int32",4,function(t){return function(e,n,i){return t(this,e,n,i)}})},function(t,e,n){n(31)("Uint32",4,function(t){return function(e,n,i){return t(this,e,n,i)}})},function(t,e,n){n(31)("Float32",4,function(t){return function(e,n,i){return t(this,e,n,i)}})},function(t,e,n){n(31)("Float64",8,function(t){return function(e,n,i){return t(this,e,n,i)}})},function(t,e,n){var i=n(1),o=n(12),r=n(2),s=(n(3).Reflect||{}).apply,a=Function.apply;i(i.S+i.F*!n(5)(function(){s(function(){})}),"Reflect",{apply:function(t,e,n){var i=o(t),l=r(n);return s?s(i,e,l):a.call(i,e,l)}})},function(t,e,n){var i=n(1),o=n(30),r=n(12),s=n(2),a=n(4),l=n(5),c=n(105),u=(n(3).Reflect||{}).construct,h=l(function(){function t(){}return!(u(function(){},[],t)instanceof t)}),d=!l(function(){u(function(){})});i(i.S+i.F*(h||d),"Reflect",{construct:function(t,e){r(t),s(e);var n=arguments.length<3?t:r(arguments[2]);if(d&&!h)return u(t,e,n);if(t==n){switch(e.length){case 0:return new t;case 1:return new t(e[0]);case 2:return new t(e[0],e[1]);case 3:return new t(e[0],e[1],e[2]);case 4:return new t(e[0],e[1],e[2],e[3])}var i=[null];return i.push.apply(i,e),new(c.apply(t,i))}var l=n.prototype,p=o(a(l)?l:Object.prototype),f=Function.apply.call(t,p,e);return a(f)?f:p}})},function(t,e,n){var i=n(8),o=n(1),r=n(2),s=n(24);o(o.S+o.F*n(5)(function(){Reflect.defineProperty(i.f({},1,{value:1}),1,{value:2})}),"Reflect",{defineProperty:function(t,e,n){r(t),e=s(e,!0),r(n);try{return i.f(t,e,n),!0}catch(t){return!1}}})},function(t,e,n){var i=n(1),o=n(18).f,r=n(2);i(i.S,"Reflect",{deleteProperty:function(t,e){var n=o(r(t),e);return!(n&&!n.configurable)&&delete t[e]}})},function(t,e,n){"use strict";var i=n(1),o=n(2),r=function(t){this._t=o(t),this._i=0;var e,n=this._k=[];for(e in t)n.push(e)};n(59)(r,"Object",function(){var t,e=this._k;do{if(this._i>=e.length)return{value:void 0,done:!0}}while(!((t=e[this._i++])in this._t));return{value:t,done:!1}}),i(i.S,"Reflect",{enumerate:function(t){return new r(t)}})},function(t,e,n){var i=n(18),o=n(19),r=n(15),s=n(1),a=n(4),l=n(2);s(s.S,"Reflect",{get:function t(e,n){var s,c,u=arguments.length<3?e:arguments[2];return l(e)===u?e[n]:(s=i.f(e,n))?r(s,"value")?s.value:void 0!==s.get?s.get.call(u):void 0:a(c=o(e))?t(c,n,u):void 0}})},function(t,e,n){var i=n(18),o=n(1),r=n(2);o(o.S,"Reflect",{getOwnPropertyDescriptor:function(t,e){return i.f(r(t),e)}})},function(t,e,n){var i=n(1),o=n(19),r=n(2);i(i.S,"Reflect",{getPrototypeOf:function(t){return o(r(t))}})},function(t,e,n){var i=n(1);i(i.S,"Reflect",{has:function(t,e){return e in t}})},function(t,e,n){var i=n(1),o=n(2),r=Object.isExtensible;i(i.S,"Reflect",{isExtensible:function(t){return o(t),!r||r(t)}})},function(t,e,n){var i=n(1);i(i.S,"Reflect",{ownKeys:n(97)})},function(t,e,n){var i=n(1),o=n(2),r=Object.preventExtensions;i(i.S,"Reflect",{preventExtensions:function(t){o(t);try{return r&&r(t),!0}catch(t){return!1}}})},function(t,e,n){var i=n(8),o=n(18),r=n(19),s=n(15),a=n(1),l=n(33),c=n(2),u=n(4);a(a.S,"Reflect",{set:function t(e,n,a){var h,d,p=arguments.length<4?e:arguments[3],f=o.f(c(e),n);if(!f){if(u(d=r(e)))return t(d,n,a,p);f=l(0)}if(s(f,"value")){if(!1===f.writable||!u(p))return!1;if(h=o.f(p,n)){if(h.get||h.set||!1===h.writable)return!1;h.value=a,i.f(p,n,h)}else i.f(p,n,l(0,a));return!0}return void 0!==f.set&&(f.set.call(p,a),!0)}})},function(t,e,n){var i=n(1),o=n(77);o&&i(i.S,"Reflect",{setPrototypeOf:function(t,e){o.check(t,e);try{return o.set(t,e),!0}catch(t){return!1}}})},function(t,e,n){"use strict";var i=n(1),o=n(55)(!0);i(i.P,"Array",{includes:function(t){return o(this,t,arguments.length>1?arguments[1]:void 0)}}),n(36)("includes")},function(t,e,n){"use strict";var i=n(1),o=n(124),r=n(11),s=n(10),a=n(12),l=n(89);i(i.P,"Array",{flatMap:function(t){var e,n,i=r(this);return a(t),e=s(i.length),n=l(i,0),o(n,i,i,e,0,1,t,arguments[1]),n}}),n(36)("flatMap")},function(t,e,n){"use strict";var i=n(1),o=n(124),r=n(11),s=n(10),a=n(26),l=n(89);i(i.P,"Array",{flatten:function(){var t=arguments[0],e=r(this),n=s(e.length),i=l(e,0);return o(i,e,e,n,0,void 0===t?1:a(t)),i}}),n(36)("flatten")},function(t,e,n){"use strict";var i=n(1),o=n(84)(!0);i(i.P,"String",{at:function(t){return o(this,t)}})},function(t,e,n){"use strict";var i=n(1),o=n(125),r=n(65);i(i.P+i.F*/Version\/10\.\d+(\.\d+)? Safari\//.test(r),"String",{padStart:function(t){return o(this,t,arguments.length>1?arguments[1]:void 0,!0)}})},function(t,e,n){"use strict";var i=n(1),o=n(125),r=n(65);i(i.P+i.F*/Version\/10\.\d+(\.\d+)? Safari\//.test(r),"String",{padEnd:function(t){return o(this,t,arguments.length>1?arguments[1]:void 0,!1)}})},function(t,e,n){"use strict";n(48)("trimLeft",function(t){return function(){return t(this,1)}},"trimStart")},function(t,e,n){"use strict";n(48)("trimRight",function(t){return function(){return t(this,2)}},"trimEnd")},function(t,e,n){"use strict";var i=n(1),o=n(25),r=n(10),s=n(60),a=n(62),l=RegExp.prototype,c=function(t,e){this._r=t,this._s=e};n(59)(c,"RegExp String",function(){var t=this._r.exec(this._s);return{value:t,done:null===t}}),i(i.P,"String",{matchAll:function(t){if(o(this),!s(t))throw TypeError(t+" is not a regexp!");var e=String(this),n="flags"in l?String(t.flags):a.call(t),i=new RegExp(t.source,~n.indexOf("g")?n:"g"+n);return i.lastIndex=r(t.lastIndex),new c(i,e)}})},function(t,e,n){n(72)("asyncIterator")},function(t,e,n){n(72)("observable")},function(t,e,n){var i=n(1),o=n(97),r=n(14),s=n(18),a=n(88);i(i.S,"Object",{getOwnPropertyDescriptors:function(t){for(var e,n,i=r(t),l=s.f,c=o(i),u={},h=0;c.length>h;)void 0!==(n=l(i,e=c[h++]))&&a(u,e,n);return u}})},function(t,e,n){var i=n(1),o=n(126)(!1);i(i.S,"Object",{values:function(t){return o(t)}})},function(t,e,n){var i=n(1),o=n(126)(!0);i(i.S,"Object",{entries:function(t){return o(t)}})},function(t,e,n){"use strict";var i=n(1),o=n(11),r=n(12),s=n(8);n(9)&&i(i.P+n(68),"Object",{__defineGetter__:function(t,e){s.f(o(this),t,{get:r(e),enumerable:!0,configurable:!0})}})},function(t,e,n){"use strict";var i=n(1),o=n(11),r=n(12),s=n(8);n(9)&&i(i.P+n(68),"Object",{__defineSetter__:function(t,e){s.f(o(this),t,{set:r(e),enumerable:!0,configurable:!0})}})},function(t,e,n){"use strict";var i=n(1),o=n(11),r=n(24),s=n(19),a=n(18).f;n(9)&&i(i.P+n(68),"Object",{__lookupGetter__:function(t){var e,n=o(this),i=r(t,!0);do{if(e=a(n,i))return e.get}while(n=s(n))}})},function(t,e,n){"use strict";var i=n(1),o=n(11),r=n(24),s=n(19),a=n(18).f;n(9)&&i(i.P+n(68),"Object",{__lookupSetter__:function(t){var e,n=o(this),i=r(t,!0);do{if(e=a(n,i))return e.set}while(n=s(n))}})},function(t,e,n){var i=n(1);i(i.P+i.R,"Map",{toJSON:n(127)("Map")})},function(t,e,n){var i=n(1);i(i.P+i.R,"Set",{toJSON:n(127)("Set")})},function(t,e,n){n(69)("Map")},function(t,e,n){n(69)("Set")},function(t,e,n){n(69)("WeakMap")},function(t,e,n){n(69)("WeakSet")},function(t,e,n){n(70)("Map")},function(t,e,n){n(70)("Set")},function(t,e,n){n(70)("WeakMap")},function(t,e,n){n(70)("WeakSet")},function(t,e,n){var i=n(1);i(i.G,{global:n(3)})},function(t,e,n){var i=n(1);i(i.S,"System",{global:n(3)})},function(t,e,n){var i=n(1),o=n(22);i(i.S,"Error",{isError:function(t){return"Error"===o(t)}})},function(t,e,n){var i=n(1);i(i.S,"Math",{clamp:function(t,e,n){return Math.min(n,Math.max(e,t))}})},function(t,e,n){var i=n(1);i(i.S,"Math",{DEG_PER_RAD:Math.PI/180})},function(t,e,n){var i=n(1),o=180/Math.PI;i(i.S,"Math",{degrees:function(t){return t*o}})},function(t,e,n){var i=n(1),o=n(129),r=n(111);i(i.S,"Math",{fscale:function(t,e,n,i,s){return r(o(t,e,n,i,s))}})},function(t,e,n){var i=n(1);i(i.S,"Math",{iaddh:function(t,e,n,i){var o=t>>>0,r=n>>>0;return(e>>>0)+(i>>>0)+((o&r|(o|r)&~(o+r>>>0))>>>31)|0}})},function(t,e,n){var i=n(1);i(i.S,"Math",{isubh:function(t,e,n,i){var o=t>>>0,r=n>>>0;return(e>>>0)-(i>>>0)-((~o&r|~(o^r)&o-r>>>0)>>>31)|0}})},function(t,e,n){var i=n(1);i(i.S,"Math",{imulh:function(t,e){var n=+t,i=+e,o=65535&n,r=65535&i,s=n>>16,a=i>>16,l=(s*r>>>0)+(o*r>>>16);return s*a+(l>>16)+((o*a>>>0)+(65535&l)>>16)}})},function(t,e,n){var i=n(1);i(i.S,"Math",{RAD_PER_DEG:180/Math.PI})},function(t,e,n){var i=n(1),o=Math.PI/180;i(i.S,"Math",{radians:function(t){return t*o}})},function(t,e,n){var i=n(1);i(i.S,"Math",{scale:n(129)})},function(t,e,n){var i=n(1);i(i.S,"Math",{umulh:function(t,e){var n=+t,i=+e,o=65535&n,r=65535&i,s=n>>>16,a=i>>>16,l=(s*r>>>0)+(o*r>>>16);return s*a+(l>>>16)+((o*a>>>0)+(65535&l)>>>16)}})},function(t,e,n){var i=n(1);i(i.S,"Math",{signbit:function(t){return(t=+t)!=t?t:0==t?1/t==1/0:t>0}})},function(t,e,n){"use strict";var i=n(1),o=n(13),r=n(3),s=n(64),a=n(117);i(i.P+i.R,"Promise",{finally:function(t){var e=s(this,o.Promise||r.Promise),n="function"==typeof t;return this.then(n?function(n){return a(e,t()).then(function(){return n})}:t,n?function(n){return a(e,t()).then(function(){throw n})}:t)}})},function(t,e,n){"use strict";var i=n(1),o=n(95),r=n(116);i(i.S,"Promise",{try:function(t){var e=o.f(this),n=r(t);return(n.e?e.reject:e.resolve)(n.v),e.promise}})},function(t,e,n){var i=n(32),o=n(2),r=i.key,s=i.set;i.exp({defineMetadata:function(t,e,n,i){s(t,e,o(n),r(i))}})},function(t,e,n){var i=n(32),o=n(2),r=i.key,s=i.map,a=i.store;i.exp({deleteMetadata:function(t,e){var n=arguments.length<3?void 0:r(arguments[2]),i=s(o(e),n,!1);if(void 0===i||!i.delete(t))return!1;if(i.size)return!0;var l=a.get(e);return l.delete(n),!!l.size||a.delete(e)}})},function(t,e,n){var i=n(32),o=n(2),r=n(19),s=i.has,a=i.get,l=i.key,c=function(t,e,n){if(s(t,e,n))return a(t,e,n);var i=r(e);return null!==i?c(t,i,n):void 0};i.exp({getMetadata:function(t,e){return c(t,o(e),arguments.length<3?void 0:l(arguments[2]))}})},function(t,e,n){var i=n(120),o=n(128),r=n(32),s=n(2),a=n(19),l=r.keys,c=r.key,u=function(t,e){var n=l(t,e),r=a(t);if(null===r)return n;var s=u(r,e);return s.length?n.length?o(new i(n.concat(s))):s:n};r.exp({getMetadataKeys:function(t){return u(s(t),arguments.length<2?void 0:c(arguments[1]))}})},function(t,e,n){var i=n(32),o=n(2),r=i.get,s=i.key;i.exp({getOwnMetadata:function(t,e){return r(t,o(e),arguments.length<3?void 0:s(arguments[2]))}})},function(t,e,n){var i=n(32),o=n(2),r=i.keys,s=i.key;i.exp({getOwnMetadataKeys:function(t){return r(o(t),arguments.length<2?void 0:s(arguments[1]))}})},function(t,e,n){var i=n(32),o=n(2),r=n(19),s=i.has,a=i.key,l=function(t,e,n){if(s(t,e,n))return!0;var i=r(e);return null!==i&&l(t,i,n)};i.exp({hasMetadata:function(t,e){return l(t,o(e),arguments.length<3?void 0:a(arguments[2]))}})},function(t,e,n){var i=n(32),o=n(2),r=i.has,s=i.key;i.exp({hasOwnMetadata:function(t,e){return r(t,o(e),arguments.length<3?void 0:s(arguments[2]))}})},function(t,e,n){var i=n(32),o=n(2),r=n(12),s=i.key,a=i.set;i.exp({metadata:function(t,e){return function(n,i){a(t,e,(void 0!==i?o:r)(n),s(i))}}})},function(t,e,n){var i=n(1),o=n(94)(),r=n(3).process,s="process"==n(22)(r);i(i.G,{asap:function(t){var e=s&&r.domain;o(e?e.bind(t):t)}})},function(t,e,n){"use strict";var i=n(1),o=n(3),r=n(13),s=n(94)(),a=n(6)("observable"),l=n(12),c=n(2),u=n(45),h=n(46),d=n(16),p=n(37),f=p.RETURN,v=function(t){return null==t?void 0:l(t)},b=function(t){var e=t._c;e&&(t._c=void 0,e())},m=function(t){return void 0===t._o},g=function(t){m(t)||(t._o=void 0,b(t))},y=function(t,e){c(t),this._c=void 0,this._o=t,t=new x(this);try{var n=e(t),i=n;null!=n&&("function"==typeof n.unsubscribe?n=function(){i.unsubscribe()}:l(n),this._c=n)}catch(e){return void t.error(e)}m(this)&&b(this)};y.prototype=h({},{unsubscribe:function(){g(this)}});var x=function(t){this._s=t};x.prototype=h({},{next:function(t){var e=this._s;if(!m(e)){var n=e._o;try{var i=v(n.next);if(i)return i.call(n,t)}catch(t){try{g(e)}finally{throw t}}}},error:function(t){var e=this._s;if(m(e))throw t;var n=e._o;e._o=void 0;try{var i=v(n.error);if(!i)throw t;t=i.call(n,t)}catch(t){try{b(e)}finally{throw t}}return b(e),t},complete:function(t){var e=this._s;if(!m(e)){var n=e._o;e._o=void 0;try{var i=v(n.complete);t=i?i.call(n,t):void 0}catch(t){try{b(e)}finally{throw t}}return b(e),t}}});var _=function(t){u(this,_,"Observable","_f")._f=l(t)};h(_.prototype,{subscribe:function(t){return new y(t,this._f)},forEach:function(t){var e=this;return new(r.Promise||o.Promise)(function(n,i){l(t);var o=e.subscribe({next:function(e){try{return t(e)}catch(t){i(t),o.unsubscribe()}},error:i,complete:n})})}}),h(_,{from:function(t){var e="function"==typeof this?this:_,n=v(c(t)[a]);if(n){var i=c(n.call(t));return i.constructor===e?i:new e(function(t){return i.subscribe(t)})}return new e(function(e){var n=!1;return s(function(){if(!n){try{if(p(t,!1,function(t){if(e.next(t),n)return f})===f)return}catch(t){if(n)throw t;return void e.error(t)}e.complete()}}),function(){n=!0}})},of:function(){for(var t=0,e=arguments.length,n=new Array(e);t<e;)n[t]=arguments[t++];return new("function"==typeof this?this:_)(function(t){var e=!1;return s(function(){if(!e){for(var i=0;i<n.length;++i)if(t.next(n[i]),e)return;t.complete()}}),function(){e=!0}})}}),d(_.prototype,a,function(){return this}),i(i.G,{Observable:_}),n(44)("Observable")},function(t,e,n){var i=n(3),o=n(1),r=n(65),s=[].slice,a=/MSIE .\./.test(r),l=function(t){return function(e,n){var i=arguments.length>2,o=!!i&&s.call(arguments,2);return t(i?function(){("function"==typeof e?e:Function(e)).apply(this,o)}:e,n)}};o(o.G+o.B+o.F*a,{setTimeout:l(i.setTimeout),setInterval:l(i.setInterval)})},function(t,e,n){var i=n(1),o=n(93);i(i.G+i.B,{setImmediate:o.set,clearImmediate:o.clear})},function(t,e,n){for(var i=n(91),o=n(29),r=n(17),s=n(3),a=n(16),l=n(43),c=n(6),u=c("iterator"),h=c("toStringTag"),d=l.Array,p={CSSRuleList:!0,CSSStyleDeclaration:!1,CSSValueList:!1,ClientRectList:!1,DOMRectList:!1,DOMStringList:!1,DOMTokenList:!0,DataTransferItemList:!1,FileList:!1,HTMLAllCollection:!1,HTMLCollection:!1,HTMLFormElement:!1,HTMLSelectElement:!1,MediaList:!0,MimeTypeArray:!1,NamedNodeMap:!1,NodeList:!0,PaintRequestList:!1,Plugin:!1,PluginArray:!1,SVGLengthList:!1,SVGNumberList:!1,SVGPathSegList:!1,SVGPointList:!1,SVGStringList:!1,SVGTransformList:!1,SourceBufferList:!1,StyleSheetList:!0,TextTrackCueList:!1,TextTrackList:!1,TouchList:!1},f=o(p),v=0;v<f.length;v++){var b,m=f[v],g=p[m],y=s[m],x=y&&y.prototype;if(x&&(x[u]||a(x,u,d),x[h]||a(x,h,m),l[m]=d,g))for(b in i)x[b]||r(x,b,i[b],!0)}},function(t,e,n){"use strict";var i=n(21),o=n(1),r=n(33),s=n(76),a=n(30),l=n(19),c=n(29),u=n(8),h=n(340),d=n(12),p=n(37),f=n(130),v=n(59),b=n(92),m=n(4),g=n(14),y=n(9),x=n(15),_=function(t){var e=1==t,n=4==t;return function(o,r,s){var a,l,c,u=i(r,s,3),h=g(o),d=e||7==t||2==t?new("function"==typeof this?this:k):void 0;for(a in h)if(x(h,a)&&(c=u(l=h[a],a,o),t))if(e)d[a]=c;else if(c)switch(t){case 2:d[a]=l;break;case 3:return!0;case 5:return l;case 6:return a;case 7:d[c[0]]=c[1]}else if(n)return!1;return 3==t||n?n:d}},w=_(6),S=function(t){return function(e){return new E(e,t)}},E=function(t,e){this._t=g(t),this._a=c(t),this._i=0,this._k=e};function k(t){var e=a(null);return null!=t&&(f(t)?p(t,!0,function(t,n){e[t]=n}):s(e,t)),e}v(E,"Dict",function(){var t,e=this._t,n=this._a,i=this._k;do{if(this._i>=n.length)return this._t=void 0,b(1)}while(!x(e,t=n[this._i++]));return b(0,"keys"==i?t:"values"==i?e[t]:[t,e[t]])}),k.prototype=null,o(o.G+o.F,{Dict:k}),o(o.S,"Dict",{keys:S("keys"),values:S("values"),entries:S("entries"),forEach:_(0),map:_(1),filter:_(2),some:_(3),every:_(4),find:_(5),findKey:w,mapPairs:_(7),reduce:function(t,e,n){d(e);var i,o,r=g(t),s=c(r),a=s.length,l=0;if(arguments.length<3){if(!a)throw TypeError("Reduce of empty object with no initial value");i=r[s[l++]]}else i=Object(n);for(;a>l;)x(r,o=s[l++])&&(i=e(i,r[o],o,t));return i},keyOf:h,includes:function(t,e){return void 0!==(e==e?h(t,e):w(t,function(t){return t!=t}))},has:x,get:function(t,e){if(x(t,e))return t[e]},set:function(t,e,n){return y&&e in Object?u.f(t,e,r(0,n)):t[e]=n,t},isDict:function(t){return m(t)&&l(t)===k.prototype}})},function(t,e,n){var i=n(29),o=n(14);t.exports=function(t,e){for(var n,r=o(t),s=i(r),a=s.length,l=0;a>l;)if(r[n=s[l++]]===e)return n}},function(t,e,n){var i=n(2),o=n(53);t.exports=n(13).getIterator=function(t){var e=o(t);if("function"!=typeof e)throw TypeError(t+" is not iterable!");return i(e.call(t))}},function(t,e,n){var i=n(3),o=n(13),r=n(1),s=n(131);r(r.G+r.F,{delay:function(t){return new(o.Promise||i.Promise)(function(e){setTimeout(s.call(e,!0),t)})}})},function(t,e,n){var i=n(132),o=n(1);n(13)._=i._=i._||{},o(o.P+o.F,"Function",{part:n(131)})},function(t,e,n){var i=n(1);i(i.S+i.F,"Object",{isObject:n(4)})},function(t,e,n){var i=n(1);i(i.S+i.F,"Object",{classof:n(42)})},function(t,e,n){var i=n(1),o=n(133);i(i.S+i.F,"Object",{define:o})},function(t,e,n){var i=n(1),o=n(133),r=n(30);i(i.S+i.F,"Object",{make:function(t,e){return o(r(t),e)}})},function(t,e,n){"use strict";n(58)(Number,"Number",function(t){this._l=+t,this._i=0},function(){var t=this._i++,e=!(t<this._l);return{done:e,value:e?void 0:t}})},function(t,e,n){var i=n(1),o=n(98)(/[\\^$*+?.()|[\]{}]/g,"\\$&");i(i.S,"RegExp",{escape:function(t){return o(t)}})},function(t,e,n){"use strict";var i=n(1),o=n(98)(/[&<>"']/g,{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"});i(i.P+i.F,"String",{escapeHTML:function(){return o(this)}})},function(t,e,n){"use strict";var i=n(1),o=n(98)(/&(?:amp|lt|gt|quot|apos);/g,{"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&apos;":"'"});i(i.P+i.F,"String",{unescapeHTML:function(){return o(this)}})},function(t,e,n){var i=n(353);"string"==typeof i&&(i=[[t.i,i,""]]);var o={hmr:!0,transform:void 0,insertInto:void 0};n(354)(i,o);i.locals&&(t.exports=i.locals)},function(t,e,n){(t.exports=n(134)(!1)).push([t.i,"/*@import url('https://fonts.googleapis.com/css?family=Roboto+Mono');*/\n\nbody {\n\t--label-font-family: sans-serif;\n\t--label-font-size: 14px;\n\n\t--title-font-family: sans-serif;\n\t--title-font-size: 16px;\n\n\t--body-font-family: sans-serif;\n\t--body-font-size: 14px;\n\n\t--color-gray: #a0a0a0;\n\t--color-light-gray: #eee;\n\t--color-dark-gray: #777;\n\t--color-magenta: #F734D7;\n\t--color-teal: #22DBC0;\n\n\t--outline-color: var(--color-dark-gray);\n\n\t--shadow-low: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);\n\t--shadow-medium: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);\n\t--shadow-high: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);\n\n\t--default-margin: 8px 0px 0px 0px;\n\t--side-panel-width: 240px;\n\t--side-panel-transition: 0.2s;\n\n\tfont-family: var(--body-font-family);\n\tfont-size: var(--body-font-size);\n\tline-height: 1.4em;\n\n}\n\nbody #interface {\n\tmax-width: 600px;\n\twidth: 100%;\n\tmin-width: 300px;\n\tmargin: 0 auto;\n}\n\nbody #interface * {\n\tdisplay: inline-block;\n\tmargin: 5px 0;\n\twidth: 100%;\n}",""])},function(t,e,n){var i,o,r={},s=(i=function(){return window&&document&&document.all&&!window.atob},function(){return void 0===o&&(o=i.apply(this,arguments)),o}),a=function(t){var e={};return function(t,n){if("function"==typeof t)return t();if(void 0===e[t]){var i=function(t,e){return e?e.querySelector(t):document.querySelector(t)}.call(this,t,n);if(window.HTMLIFrameElement&&i instanceof window.HTMLIFrameElement)try{i=i.contentDocument.head}catch(t){i=null}e[t]=i}return e[t]}}(),l=null,c=0,u=[],h=n(355);function d(t,e){for(var n=0;n<t.length;n++){var i=t[n],o=r[i.id];if(o){o.refs++;for(var s=0;s<o.parts.length;s++)o.parts[s](i.parts[s]);for(;s<i.parts.length;s++)o.parts.push(g(i.parts[s],e))}else{var a=[];for(s=0;s<i.parts.length;s++)a.push(g(i.parts[s],e));r[i.id]={id:i.id,refs:1,parts:a}}}}function p(t,e){for(var n=[],i={},o=0;o<t.length;o++){var r=t[o],s=e.base?r[0]+e.base:r[0],a={css:r[1],media:r[2],sourceMap:r[3]};i[s]?i[s].parts.push(a):n.push(i[s]={id:s,parts:[a]})}return n}function f(t,e){var n=a(t.insertInto);if(!n)throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");var i=u[u.length-1];if("top"===t.insertAt)i?i.nextSibling?n.insertBefore(e,i.nextSibling):n.appendChild(e):n.insertBefore(e,n.firstChild),u.push(e);else if("bottom"===t.insertAt)n.appendChild(e);else{if("object"!=typeof t.insertAt||!t.insertAt.before)throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");var o=a(t.insertAt.before,n);n.insertBefore(e,o)}}function v(t){if(null===t.parentNode)return!1;t.parentNode.removeChild(t);var e=u.indexOf(t);e>=0&&u.splice(e,1)}function b(t){var e=document.createElement("style");if(void 0===t.attrs.type&&(t.attrs.type="text/css"),void 0===t.attrs.nonce){var i=function(){0;return n.nc}();i&&(t.attrs.nonce=i)}return m(e,t.attrs),f(t,e),e}function m(t,e){Object.keys(e).forEach(function(n){t.setAttribute(n,e[n])})}function g(t,e){var n,i,o,r;if(e.transform&&t.css){if(!(r="function"==typeof e.transform?e.transform(t.css):e.transform.default(t.css)))return function(){};t.css=r}if(e.singleton){var s=c++;n=l||(l=b(e)),i=_.bind(null,n,s,!1),o=_.bind(null,n,s,!0)}else t.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=function(t){var e=document.createElement("link");return void 0===t.attrs.type&&(t.attrs.type="text/css"),t.attrs.rel="stylesheet",m(e,t.attrs),f(t,e),e}(e),i=function(t,e,n){var i=n.css,o=n.sourceMap,r=void 0===e.convertToAbsoluteUrls&&o;(e.convertToAbsoluteUrls||r)&&(i=h(i));o&&(i+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+" */");var s=new Blob([i],{type:"text/css"}),a=t.href;t.href=URL.createObjectURL(s),a&&URL.revokeObjectURL(a)}.bind(null,n,e),o=function(){v(n),n.href&&URL.revokeObjectURL(n.href)}):(n=b(e),i=function(t,e){var n=e.css,i=e.media;i&&t.setAttribute("media",i);if(t.styleSheet)t.styleSheet.cssText=n;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(n))}}.bind(null,n),o=function(){v(n)});return i(t),function(e){if(e){if(e.css===t.css&&e.media===t.media&&e.sourceMap===t.sourceMap)return;i(t=e)}else o()}}t.exports=function(t,e){if("undefined"!=typeof DEBUG&&DEBUG&&"object"!=typeof document)throw new Error("The style-loader cannot be used in a non-browser environment");(e=e||{}).attrs="object"==typeof e.attrs?e.attrs:{},e.singleton||"boolean"==typeof e.singleton||(e.singleton=s()),e.insertInto||(e.insertInto="head"),e.insertAt||(e.insertAt="bottom");var n=p(t,e);return d(n,e),function(t){for(var i=[],o=0;o<n.length;o++){var s=n[o];(a=r[s.id]).refs--,i.push(a)}t&&d(p(t,e),e);for(o=0;o<i.length;o++){var a;if(0===(a=i[o]).refs){for(var l=0;l<a.parts.length;l++)a.parts[l]();delete r[a.id]}}}};var y,x=(y=[],function(t,e){return y[t]=e,y.filter(Boolean).join("\n")});function _(t,e,n,i){var o=n?"":i.css;if(t.styleSheet)t.styleSheet.cssText=x(e,o);else{var r=document.createTextNode(o),s=t.childNodes;s[e]&&t.removeChild(s[e]),s.length?t.insertBefore(r,s[e]):t.appendChild(r)}}},function(t,e){t.exports=function(t){var e="undefined"!=typeof window&&window.location;if(!e)throw new Error("fixUrls requires window.location");if(!t||"string"!=typeof t)return t;var n=e.protocol+"//"+e.host,i=n+e.pathname.replace(/\/[^\/]*$/,"/");return t.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi,function(t,e){var o,r=e.trim().replace(/^"(.*)"$/,function(t,e){return e}).replace(/^'(.*)'$/,function(t,e){return e});return/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(r)?t:(o=0===r.indexOf("//")?r:0===r.indexOf("/")?n+r:i+r.replace(/^\.\//,""),"url("+JSON.stringify(o)+")")})}},function(t,e,n){"use strict";(function(t){n(0);var e=n(50);customElements.define("tone-viz-oscillator",class extends e.a{constructor(){super(),this.min=-1.1,this.max=1.1,this.alt="oscillator waveform"}async visualize(e){const n=e.get(),i=await t.Tone.Offline(()=>{const t=new e.constructor(n);t.frequency.value=200,t.detune.value=0,t.volume.value=0,t.toMaster().start(0).stop(.005)},.005);this.buffer=i.toArray(0),this.requestUpdate()}})}).call(this,n(135))},function(t,e,n){(t.exports=n(134)(!1)).push([t.i,':host{display:inline-block}#container{margin-top:5px;display:inline-block;width:100%}#container label,#container #units{font-size:var(--label-font-size);font-family:var(--label-font-family);float:left}#container #units[hidden]{display:none}#container input[type="number"]{padding:0;float:right;-webkit-appearance:none;border:none;text-align:right;font-size:var(--label-font-size);font-family:var(--label-font-family);outline-color:var(--outline-color);outline-offset:1px;width:70px;background-color:transparent}#container input[type="number"]:invalid{box-shadow:none}#container #units{float:right}#container #slider{margin-top:5px;width:100%;display:inline-block;position:relative;height:20px}#container #slider input[type="range"]{opacity:0;padding:0;margin:0;width:100%;height:20px}#container #slider #line,#container #slider #circle,#container #slider #anchor{pointer-events:none;position:absolute;left:0px;top:0px}#container #slider #line{position:absolute;top:50%;transform:translate(0, -50%);height:4px;border-radius:2px;width:100%;background-color:#aaa}#container #slider #line #anchor{position:absolute;width:0%;top:0px;height:100%;background-color:black;border-radius:2px}#container #slider #line #anchor.left{left:0px}#container #slider #line #anchor.center{left:50%}#container #slider #circle{--computed-thumb-height: var(--thumb-height, 24px);--computed-thumb-width: var(--thumb-width, 24px);border-radius:2px;width:var(--computed-thumb-width);height:var(--computed-thumb-height);top:calc((20px - var(--computed-thumb-height)) / 2);background-color:black;box-shadow:var(--shadow-low)}#container #slider #circle.focus{outline:5px auto var(--focus-ring-color, black)}\n',""])},function(t,e){t.exports={_setState:function(t){t||(t={}),this._state={},this._extendState({polyphony:4,rows:1,priority:"last",rootNote:60,octaveControls:!0,octave:0,velocityControls:!0,velocity:127,keys:[],buffer:[]}),this._extendState(t)},_extendState:function(t){for(var e in t)this._state[e]=t[e]},set:function(){return 1===arguments.length?this._extendState(arguments[0]):this._state[arguments[0]]=arguments[1],this},get:function(t){return this._state[t]}}},function(t,e){t.exports={down:function(t){this._listeners.down=(this._listeners.down||[]).concat(t)},up:function(t){this._listeners.up=(this._listeners.up||[]).concat(t)},_trigger:function(t){var e=this;if(e._listeners[t]&&e._listeners[t].length){var n=Array.prototype.slice.call(arguments);n.splice(0,1),e._listeners[t].forEach(function(t){t.apply(e,n)})}},_bind:function(){var t=this;if("undefined"!=typeof window&&window.document){window.document.addEventListener("keydown",function(e){t._addKey(e)}),window.document.addEventListener("keyup",function(e){t._removeKey(e)});var e=!0;setInterval(function(){window.document.hasFocus()!==e&&((e=!e)||t.clear())},100)}}}},function(t,e){t.exports={_map:function(t){return this._keyMap[this._state.rows][t]+this._offset()},_offset:function(){return this._state.rootNote-this._keyMap[this._state.rows].root+12*this._state.octave},_isNote:function(t){return!!this._keyMap[this._state.rows][t]},_toFrequency:function(t){return 440*Math.pow(2,(t-69)/12)},_keyMap:{1:{root:60,65:60,87:61,83:62,69:63,68:64,70:65,84:66,71:67,89:68,72:69,85:70,74:71,75:72,79:73,76:74,80:75,186:76,222:77},2:{root:60,90:60,83:61,88:62,68:63,67:64,86:65,71:66,66:67,72:68,78:69,74:70,77:71,188:72,76:73,190:74,186:75,191:76,81:72,50:73,87:74,51:75,69:76,82:77,53:78,84:79,54:80,89:81,55:82,85:83,73:84,57:85,79:86,48:87,80:88,219:89,187:90,221:91}}}},function(t,e){t.exports={_addKey:function(t){if(this._isNote(t.keyCode)&&!this._isPressed(t.keyCode)){var e=this._makeNote(t.keyCode);this._state.keys=(this._state.keys||[]).concat(e),this._update()}else this._isSpecialKey(t.keyCode)&&this._specialKey(t.keyCode)},_removeKey:function(t){if(this._isPressed(t.keyCode)){for(var e,n=0;n<this._state.keys.length;n++)if(this._state.keys[n].keyCode===t.keyCode){e=this._state.keys[n];break}this._state.keys.splice(this._state.keys.indexOf(e),1),this._update()}},_isPressed:function(t){if(!this._state.keys||!this._state.keys.length)return!1;for(var e=0;e<this._state.keys.length;e++)if(this._state.keys[e].keyCode===t)return!0;return!1},_makeNote:function(t){return{keyCode:t,note:this._map(t),frequency:this._toFrequency(this._map(t)),velocity:this._state.velocity}},clear:function(){var t=this;t._state.buffer.forEach(function(e){e.velocity=0,t._trigger("up",e)}),t._state.keys=[],t._state.buffer=[]},_update:function(){var t=this._state.buffer;this._prioritize(),this._diff(t)},_diff:function(t){var e=this,n=t.map(function(t){return t.keyCode}),i=e._state.buffer.map(function(t){return t.keyCode}),o=[];n.forEach(function(t){-1===i.indexOf(t)&&o.push(t)});var r=[];i.forEach(function(t){-1===n.indexOf(t)&&r.push(t)}),r.forEach(function(t){for(var n=0;n<e._state.buffer.length;n++)if(e._state.buffer[n].keyCode===t){e._trigger("down",e._state.buffer[n]);break}}),o.forEach(function(n){for(var i=0;i<t.length;i++)if(t[i].keyCode===n){t[i].velocity=0,e._trigger("up",t[i]);break}})}}},function(t,e){t.exports={_prioritize:function(){var t=this;t._state.keys.length?(t._state.polyphony>=t._state.keys.length?t._state.keys=t._state.keys.map(function(t){return t.isActive=!0,t}):(t._state.keys=t._state.keys.map(function(t){return t.isActive=!1,t}),t["_"+t._state.priority]()),t._state.buffer=[],t._state.keys.forEach(function(e){e.isActive&&t._state.buffer.push(e)})):t._state.buffer=[]},_last:function(){for(var t=this._state.keys.length-this._state.polyphony;t<this._state.keys.length;t++)this._state.keys[t].isActive=!0},_first:function(){for(var t=0;t<this._state.polyphony;t++)this._state.keys[t].isActive=!0},_highest:function(){var t=this._state.keys.map(function(t){return t.note});t.sort(function(t,e){return e===t?0:e<t?-1:1}),t.splice(this._state.polyphony,Number.MAX_VALUE),this._state.keys.forEach(function(e){-1!==t.indexOf(e.note)&&(e.isActive=!0)})},_lowest:function(){var t=this._state.keys.map(function(t){return t.note});t.sort(function(t,e){return t===e?0:t<e?-1:1}),t.splice(this._state.polyphony,Number.MAX_VALUE),this._state.keys.forEach(function(e){-1!==t.indexOf(e.note)&&(e.isActive=!0)})}}},function(t,e){t.exports={_isSpecialKey:function(t){return 1===this._state.rows&&this._specialKeyMap[t]},_specialKey:function(t){"octave"===this._specialKeyMap[t].type&&this._state.octaveControls?this._state.octave+=this._specialKeyMap[t].value:"velocity"===this._specialKeyMap[t].type&&this._state.velocityControls&&(this._state.velocity=this._specialKeyMap[t].value)},_specialKeyMap:{90:{type:"octave",value:-1},88:{type:"octave",value:1},49:{type:"velocity",value:1},50:{type:"velocity",value:14},51:{type:"velocity",value:28},52:{type:"velocity",value:42},53:{type:"velocity",value:56},54:{type:"velocity",value:70},55:{type:"velocity",value:84},56:{type:"velocity",value:98},57:{type:"velocity",value:112},48:{type:"velocity",value:127}}}},function(t){t.exports={_from:"nested-object-assign",_id:"nested-object-assign@1.0.3",_inBundle:!1,_integrity:"sha512-kgq1CuvLyUcbcIuTiCA93cQ2IJFSlRwXcN+hLcb2qLJwC2qrePHGZZa7IipyWqaWF6tQjdax2pQnVxdq19Zzwg==",_location:"/nested-object-assign",_phantomChildren:{},_requested:{type:"tag",registry:!0,raw:"nested-object-assign",name:"nested-object-assign",escapedName:"nested-object-assign",rawSpec:"",saveSpec:null,fetchSpec:"latest"},_requiredBy:["#DEV:/","#USER"],_resolved:"https://registry.npmjs.org/nested-object-assign/-/nested-object-assign-1.0.3.tgz",_shasum:"5aca69390d9affe5a612152b5f0843ae399ac597",_spec:"nested-object-assign",_where:"/Users/ymann/Development/third-party/tonejs-ui",author:{name:"Geta AS / Eirik Horvath",url:"https://github.com/Geta"},bugs:{url:"https://github.com/Geta/NestedObjectAssign/issues"},bundleDependencies:!1,deprecated:!1,description:"Package to support nested merging of objects & properties, using Object.Assign",devDependencies:{babel:"^6.3.26","babel-core":"^6.4.0","babel-eslint":"^5.0.0-beta6","babel-loader":"^6.2.1","babel-plugin-add-module-exports":"^0.1.2","babel-preset-es2015":"^6.3.13",chai:"^3.4.1","clean-webpack-plugin":"^0.1.8",del:"^2.2.0",eslint:"^1.10.3","eslint-config-airbnb":"^4.0.0","eslint-loader":"^1.2.0","eslint-plugin-react":"^3.16.1","eslint-plugin-standard":"^1.3.1",gulp:"^3.9.0","gulp-babel":"^6.1.1","gulp-env":"^0.2.0","gulp-eslint":"^1.1.1","gulp-load-plugins":"^1.2.0","gulp-util":"^3.0.6",mocha:"^2.3.4","object-assign":"^4.0.1",webpack:"^1.12.11","webpack-node-externals":"^0.4.1"},files:["README.md","index.js","lib","dist"],homepage:"https://github.com/Geta/NestedObjectAssign",keywords:["es6","npm","nested","object","assign"],library:{name:"nestedObjectAssign",entry:"nestedObjectAssign.js","dist-node":"nestedObjectAssign.js","dist-web":"nestedObjectAssign.web.js","bundle-node":!0},license:"MIT",main:"./index.js",name:"nested-object-assign",repository:{type:"git",url:"git+https://github.com/Geta/NestedObjectAssign.git"},scripts:{build:"gulp build","build-all":"gulp","build-dev":"gulp build-dev","build-web":"gulp build-web","build-web-dev":"gulp build-web-dev",postversion:"git push && git push --tags",prepublish:"npm run build-all",preversion:"npm run build-all && npm run unit",start:"npm run-script build-dev",test:"npm run unit-watch",unit:"mocha --compilers js:babel-core/register --colors ./test/*.spec.js","unit-watch":"mocha --compilers js:babel-core/register --colors -w ./test/*.spec.js",version:"git add ."},version:"1.0.3"}},function(t,e,n){var i={"./nestedObjectAssign":136,"./nestedObjectAssign.js":136};function o(t){var e=r(t);return n(e)}function r(t){var e=i[t];if(!(e+1)){var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}return e}o.keys=function(){return Object.keys(i)},o.resolve=r,t.exports=o,o.id=365},function(t,e,n){"use strict";n.r(e);n(352);var i=n(0),o=n(7);n(356);
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
function r(t,e,n){return{index:t,removed:e,addedCount:n}}
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
window.JSCompiler_renameProperty=function(t,e){return t};const s=0,a=1,l=2,c=3;function u(t,e,n,i,o,u){let d,p=0,f=0,v=Math.min(n-e,u-o);if(0==e&&0==o&&(p=function(t,e,n){for(let i=0;i<n;i++)if(!h(t[i],e[i]))return i;return n}(t,i,v)),n==t.length&&u==i.length&&(f=function(t,e,n){let i=t.length,o=e.length,r=0;for(;r<n&&h(t[--i],e[--o]);)r++;return r}(t,i,v-p)),o+=p,u-=f,(n-=f)-(e+=p)==0&&u-o==0)return[];if(e==n){for(d=r(e,[],0);o<u;)d.removed.push(i[o++]);return[d]}if(o==u)return[r(e,[],n-e)];let b=function(t){let e=t.length-1,n=t[0].length-1,i=t[e][n],o=[];for(;e>0||n>0;){if(0==e){o.push(l),n--;continue}if(0==n){o.push(c),e--;continue}let r,u=t[e-1][n-1],h=t[e-1][n],d=t[e][n-1];(r=h<d?h<u?h:u:d<u?d:u)==u?(u==i?o.push(s):(o.push(a),i=u),e--,n--):r==h?(o.push(c),e--,i=h):(o.push(l),n--,i=d)}return o.reverse(),o}(function(t,e,n,i,o,r){let s=r-o+1,a=n-e+1,l=new Array(s);for(let t=0;t<s;t++)l[t]=new Array(a),l[t][0]=t;for(let t=0;t<a;t++)l[0][t]=t;for(let n=1;n<s;n++)for(let r=1;r<a;r++)if(h(t[e+r-1],i[o+n-1]))l[n][r]=l[n-1][r-1];else{let t=l[n-1][r]+1,e=l[n][r-1]+1;l[n][r]=t<e?t:e}return l}(t,e,n,i,o,u));d=void 0;let m=[],g=e,y=o;for(let t=0;t<b.length;t++)switch(b[t]){case s:d&&(m.push(d),d=void 0),g++,y++;break;case a:d||(d=r(g,[],0)),d.addedCount++,g++,d.removed.push(i[y]),y++;break;case l:d||(d=r(g,[],0)),d.addedCount++,g++;break;case c:d||(d=r(g,[],0)),d.removed.push(i[y]),y++}return d&&m.push(d),m}function h(t,e){return t===e}
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let d=0,p=0,f=[],v=0,b=document.createTextNode("");new window.MutationObserver(function(){const t=f.length;for(let e=0;e<t;e++){let t=f[e];if(t)try{t()}catch(t){setTimeout(()=>{throw t})}}f.splice(0,t),p+=t}).observe(b,{characterData:!0});const m={run:t=>(b.textContent=v++,f.push(t),d++),cancel(t){const e=t-p;if(e>=0){if(!f[e])throw new Error("invalid async handle: "+t);f[e]=null}}};
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
function g(t){return"slot"===t.localName}class y{static getFlattenedNodes(t){return g(t)?(t=t).assignedNodes({flatten:!0}):Array.from(t.childNodes).map(t=>g(t)?(t=t).assignedNodes({flatten:!0}):[t]).reduce((t,e)=>t.concat(e),[])}constructor(t,e){this._shadyChildrenObserver=null,this._nativeChildrenObserver=null,this._connected=!1,this._target=t,this.callback=e,this._effectiveNodes=[],this._observer=null,this._scheduled=!1,this._boundSchedule=(()=>{this._schedule()}),this.connect(),this._schedule()}connect(){g(this._target)?this._listenSlots([this._target]):this._target.children&&(this._listenSlots(this._target.children),window.ShadyDOM?this._shadyChildrenObserver=ShadyDOM.observeChildren(this._target,t=>{this._processMutations(t)}):(this._nativeChildrenObserver=new MutationObserver(t=>{this._processMutations(t)}),this._nativeChildrenObserver.observe(this._target,{childList:!0}))),this._connected=!0}disconnect(){g(this._target)?this._unlistenSlots([this._target]):this._target.children&&(this._unlistenSlots(this._target.children),window.ShadyDOM&&this._shadyChildrenObserver?(ShadyDOM.unobserveChildren(this._shadyChildrenObserver),this._shadyChildrenObserver=null):this._nativeChildrenObserver&&(this._nativeChildrenObserver.disconnect(),this._nativeChildrenObserver=null)),this._connected=!1}_schedule(){this._scheduled||(this._scheduled=!0,m.run(()=>this.flush()))}_processMutations(t){this._processSlotMutations(t),this.flush()}_processSlotMutations(t){if(t)for(let e=0;e<t.length;e++){let n=t[e];n.addedNodes&&this._listenSlots(n.addedNodes),n.removedNodes&&this._unlistenSlots(n.removedNodes)}}flush(){if(!this._connected)return!1;window.ShadyDOM&&ShadyDOM.flush(),this._nativeChildrenObserver?this._processSlotMutations(this._nativeChildrenObserver.takeRecords()):this._shadyChildrenObserver&&this._processSlotMutations(this._shadyChildrenObserver.takeRecords()),this._scheduled=!1;let t={target:this._target,addedNodes:[],removedNodes:[]},e=this.constructor.getFlattenedNodes(this._target),n=(i=e,o=this._effectiveNodes,u(i,0,i.length,o,0,o.length));var i,o;for(let e,i=0;i<n.length&&(e=n[i]);i++)for(let n,i=0;i<e.removed.length&&(n=e.removed[i]);i++)t.removedNodes.push(n);for(let i,o=0;o<n.length&&(i=n[o]);o++)for(let n=i.index;n<i.index+i.addedCount;n++)t.addedNodes.push(e[n]);this._effectiveNodes=e;let r=!1;return(t.addedNodes.length||t.removedNodes.length)&&(r=!0,this.callback.call(this._target,t)),r}_listenSlots(t){for(let e=0;e<t.length;e++){let n=t[e];g(n)&&n.addEventListener("slotchange",this._boundSchedule)}}_unlistenSlots(t){for(let e=0;e<t.length;e++){let n=t[e];g(n)&&n.removeEventListener("slotchange",this._boundSchedule)}}}const x=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;class _ extends i.a{static get properties(){return{selectedIndex:{type:Number},attribute:{type:String}}}constructor(){super(),this.selectedIndex=-1,this.options=[],this._observer=new y(this,t=>{this.options=[...this.options,...t.addedNodes.filter(t=>"option"===t.nodeName.toLowerCase())],this.options.length&&-1===this.selectedIndex&&(this.selectedIndex=0),this.requestUpdate()})}updated(t){if(t.has("selectedIndex")&&-1!==this.selectedIndex){const t=this.shadowRoot.querySelector("select");this.dispatchEvent(new CustomEvent("change",{detail:this.value,composed:!0,bubbles:!0})),t&&(t.selectedIndex=this.selectedIndex),this.attribute&&this.dispatchEvent(new CustomEvent(this.attribute,{detail:this.value,composed:!0,bubbles:!0}))}}get value(){return this.options[this.selectedIndex].getAttribute("value")}set value(t){const e=this.options.findIndex(e=>e.getAttribute("value")===t.toString());-1!==e&&(this.selectedIndex=e)}sync(t){this.value=t[this.attribute]}render(){return i.b`
			<style>
				:host {
					display: block;
				}
				#container {
					height: 24px;
					display: inline-block;
					position: relative;
				}
				select {
					width: 100%;
					text-overflow: ellipses;
					display: inline-block;
					padding-right: 30px;
					font-size: 14px;
					padding-left: 10px;
					height: 24px;
					line-height: 18px;
					border-radius: 12px;
					-webkit-appearance: none;
					background-color: transparent;
					border:2px solid var(--border-color, var(--color-gray));
					box-sizing: border-box;
					outline-color: var(--outline-color);
					outline-offset: 1px;
				}
				#arrow {
					position: absolute;
					right: 15px;
					top: 0px;
					width: 10px;
					height: 10px;
					font-size: 8px;
					color: var(--border-color, var(--color-gray));
					pointer-events: none;
					line-height: 12px;
				}

				#arrow svg {
					fill: var(--border-color, var(--color-gray));
				}
			</style>
			<div id="container">
				<select @change=${t=>this.selectedIndex=t.target.selectedIndex}>
					${this.options}
				</select>
				<div id="arrow">${x}</div>
			</div>
		`}}customElements.define("tone-select",_);customElements.define("tone-select-attribute",class extends _{static get properties(){return{label:{type:String},attribute:{type:String}}}constructor(){super(),this.label=""}sync(t){this.value=t[this.attribute]}set(t){t[this.attribute]!==this.value&&(t[this.attribute]=this.value)}render(){return i.b`
			<style>
				#attribute-container {
					display: block;
					height: 24px;
				}
				label, #container {
					height: 24px;
					line-height: 24px;
					display: block;
				}
				label {
					float: left;
					font-family: var(--label-font-family);
					font-size: var(--label-font-size);
				}
				#container {
					float: right;
				}
			</style>
			<div id="attribute-container">
				<label>${this.label}</label>
				${super.render()}
			</div>
		`}});customElements.define("tone-oscillator-type",class extends i.a{static get properties(){return{attribute:{type:String},nocustom:{type:Boolean},label:{type:String}}}constructor(){super(),this.nocustom=!1,this.value="sine"}sync(t){const e=t[this.attribute];this.value=e;const n=this.shadowRoot.querySelector("tone-select-attribute");n&&n.options.forEach(t=>{const n=t.getAttribute("value");e.includes(n)&&(this.shadowRoot.querySelector("tone-select-attribute").value=n)})}render(){return i.b`
			<tone-select-attribute label=${this.label} attribute=${this.attribute}>
				<option value="sine">sine</option>
				<option value="square">square</option>
				<option value="sawtooth">sawtooth</option>
				<option value="triangle">triangle</option>
				${this.nocustom?i.b``:i.b`<option value="custom">custom</option>`}
			</tone-select-attribute>
		`}});customElements.define("tone-oscillator",class extends o.a{static get properties(){return{label:{type:String},sourceType:{type:String},omni:{type:Boolean},frequency:{type:Boolean}}}constructor(){super(),this.label="Oscillator",this.sourceType="oscillator"}setAttribute(t,e,n){"type"===t?"oscillator"===this.sourceType?n.type=e.value:"am"===this.sourceType||"fat"===this.sourceType||"fm"===this.sourceType?n.type=`${this.sourceType}${e.value}`:n.type=e.value:e.set(n)}updated(t){t.has("sourceType")&&this.dispatchEvent(new CustomEvent("sourceType",{detail:this.sourceType,composed:!0,bubbles:!0}))}renderAttributes(){return i.b`
			<style>
				#sourceType {
					position: absolute;
					top: 8px;
					right: 80px;
					background-color: white;
				}

				#attributeContainer {
					margin-top: 20px;
				}

				tone-oscillator-type:not([display]), tone-slider:not([display]), tone-multislider:not([display]){
					display: none;
				}

			</style>
			${this.omni?i.b`<tone-select 
				@change=${t=>this.sourceType=t.detail}
				slot="top" 
				attribute="sourceType"
				id="sourceType">
				<option value="oscillator">basic</option>
				<option value="fm">fm</option>
				<option value="am">am</option>
				<option value="fat">fat</option>
				<option value="pulse">pulse</option>
				<option value="pwm">pwm</option>
			</tone-select>`:i.b``}
			<div id="attributeContainer">

				<tone-oscillator-type 
					?display=${"pulse"!==this.sourceType&&"pwm"!==this.sourceType}
					label="${"fm"===this.sourceType||"am"===this.sourceType?"Carrier Type":"Type"}"
					attribute="baseType">
				</tone-oscillator-type>
				<tone-multislider 
					?display=${"pulse"!==this.sourceType&&"pwm"!==this.sourceType}
					length="32"
					label="Partials"
					attribute="partials">
				</tone-multislider>
				<tone-slider 
					?display=${"pulse"!==this.sourceType&&"pwm"!==this.sourceType}
					attribute="partialCount"
					min="0" 
					max="32" 
					value="0" 
					integer
					label="Partial Count">
				</tone-slider>

				<tone-oscillator-type 
					?display=${"fm"===this.sourceType||"am"===this.sourceType}
					nocustom
					label="Modulator Type"
					attribute="modulationType">
				</tone-oscillator-type>
				<tone-slider 
					?display=${"fm"===this.sourceType}
					attribute="modulationIndex"
					min="0.1" 
					max="20" 
					exp="1.5" 
					value="2"
					label="Modulation Index">
				</tone-slider>
				<tone-slider 
					?display=${"fm"===this.sourceType||"am"===this.sourceType}
					attribute="harmonicity"
					min="0.25" 
					max="5" 
					value="2"
					label="Harmonicity">
				</tone-slider>

				<tone-slider 
					?display=${"fat"===this.sourceType}
					attribute="spread"
					min="2" 
					max="100" 
					value="20" 
					units="cents"
					label="Spread">
				</tone-slider>
				<tone-slider 
					?display=${"fat"===this.sourceType}
					default="0"
					attribute="count"
					integer
					value="2"
					min="1" 
					max="10" 
					label="Count">
				</tone-slider>

				<tone-slider 
					?display=${"pulse"===this.sourceType}
					default="0"
					attribute="width"
					min="0" 
					max="1" 
					value="0" 
					label="Width">
				</tone-slider>	
				
				<tone-slider 
					?display=${"pwm"===this.sourceType}
					default="0"
					attribute="modulationFrequency"
					min="0.1" 
					max="10" 
					value="0.5" 
					units="hz"
					label="Modulation Frequency">
				</tone-slider>		
			</div>
		`}render(){return i.b`
			<style>
				tone-slider {
					display: block;
					margin-top: 5px;
				}

				tone-oscillator-type {
					margin-top: 10px;
					display: block;
				}

				tone-multislider {
					margin-top: 10px;
				}

				tone-viz-oscillator {
					position: absolute;
					top: 9px;
					right: 20px;
				}
			</style>
			<tone-rack label="${this.label}" ?collapsed=${this.collapsed}>
				<tone-viz-oscillator slot="top" class="viz"></tone-viz-oscillator>
				${this.frequency?i.b`
					<tone-slider 
						attribute="frequency"
						min="20" 
						max="10000" 
						value="440" 
						exp="2"
						units="hz"
						label="frequency">
					</tone-slider>`:i.b``}
				${this.renderAttributes()}
			</tone-rack>
		`}});const w=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/><path fill="none" d="M0 24V0h24v24H0z"/></svg>`,S=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;customElements.define("tone-rack",class extends i.a{static get properties(){return{collapsed:{type:Boolean},incollapsable:{type:Boolean},square:{type:Boolean},label:{type:String},color:{type:String}}}constructor(){super(),this.incollapsable=!1,this.collapsed=!1,this.square=!1}updated(t){const e=t=>{t.dispatchEvent(new CustomEvent("collapse",{detail:this.collapsed,composed:!0,bubbles:!0}))};t.has("collapsed")&&(e(this),Array.from(this.children).forEach(t=>{t.assignedNodes?Array.from(t.assignedNodes()).forEach(t=>e(t)):e(t),t.dispatchEvent(new CustomEvent("collapse",{detail:this.collapsed,composed:!0,bubbles:!0}))}))}_keydown(t){"ArrowRight"===t.key||"ArrowDown"===t.key?this.collapsed=!1:"ArrowLeft"!==t.key&&"ArrowUp"!==t.key||(this.collapsed=!0)}render(){return i.b`
			<style>
				:host {
					display: block;
					min-width: 300px;
					width: 100%;
				}
				button {
					position: absolute;
					top: 20px;
					left: 12px;
					border: none;
					-webkit-appearance: none;
					width: 24px;
					height: 24px;
					margin: 0;
					padding: 0;
					transform: translate(0, -50%);
					outline-color: var(--outline-color);
					background-color: transparent;
				}

				#container {
					box-sizing: border-box;
					position: relative;
					border: 2px solid black;
					border-radius: 22px;
					padding: 20px;
					background-color: white;
					width: 100%;
				}

				#container[square]{
					border-radius: 0px;
					background-color: #eee;
					padding: 30px 5px 5px 5px;
					border-color: #eee;
					min-width: 310px;
				}

				#padding {
					height: 10px;
				}

				#container.closed {
					height: 0px;
					overflow: hidden;
					padding: 20px;
				}

				#label {
					position: absolute;
					left: 45px;
					top: 12px;
					font-family: var(--title-font-family);
					font-size: var(--title-font-size);
					font-weight: normal;
					margin: 0;
				}
				#label[hidden]{
					display: none;
				}

				#container.closed::slotted:not([top]){
					display: none;
				}
				
			</style>
			<div id="container" class=${this.collapsed?"closed":"open"} ?square=${this.square}>
				${this.incollapsable?i.b``:i.b`
					<button 
						@keydown=${this._keydown.bind(this)}
						@click=${()=>this.collapsed=!this.collapsed}
						aria-label='collapse menu'
						role="checkbox" aria-checked="${this.collapsed}">${this.collapsed?w:S}</button>`}
				<h2 id="label">${this.label}</h2>
				<div id="padding"></div>
				<slot name="top"></slot>
				${this.collapsed?i.b``:i.b`<slot></slot>`}
			</div>
		`}});customElements.define("tone-toggle",class extends i.a{static get properties(){return{label:{type:String},checked:{type:Boolean},attribute:{type:String}}}constructor(){super(),this.label="",this.checked=!1}updated(t){t.has("checked")&&(this.dispatchEvent(new CustomEvent("change",{detail:this.checked,composed:!0,bubbles:!0})),this.attribute&&this.dispatchEvent(new CustomEvent(this.attribute,{detail:this.checked,composed:!0,bubbles:!0})))}sync(t){const e=this.attribute;this.checked=t[e]}set(t){t[this.attribute]=this.checked}_clicked(t){t.stopPropagation(),this.checked=!this.checked,this.shadowRoot.querySelector("button").focus()}render(){return i.b`
			<style>
				:host {
					display: block;
				}

				#container {
					display: block;
				}

				label {
					font-family: var(--label-font-family);
					font-size: var(--label-font-size);
					min-width: 80px;
					display: inline-block;
					margin-right: 20px;
				}

				#check-container {
					width: 30px;
					height: 10px;
					display: inline-block;
					position: relative;
				}

				#check-container #background {
					position: absolute;
					width: 100%;
					height: 100%;
					background-color: var(--color-gray);
					border-radius: 5px;
				}

				#check-container button {
					-webkit-appearance: none;
					width: 20px;
					height: 20px;
					left: 0px;
					margin: 0;
					padding: 0;
					border: none;
					background-color: var(--color-light-gray);
					border-radius: 50%;
					top: 50%;
					position: absolute;
					transform: translate(0, -50%);
					outline-color: var(--outline-color);
					transition: left 0.1s;
					// box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
					box-shadow: var(--shadow-low);
				}

				#check-container button[checked] {
					left: 10px;
					background-color: black;
				}

			</style>
			<div id="container">
				<label for="checkbox">${this.label}</label>
				<div id="check-container"
					@click=${this._clicked.bind(this)}>
					<div id="background"></div>
					<button name="checkbox" 
						?checked=${this.checked}
						@click=${this._clicked.bind(this)}
						aria-checked=${this.checked} 
						aria-role="checkbox"
						id="thumb"></button>
				<div>
			</div>
		`}});const E="data:audio/mp3;base64,//MkxAAHiAICWABElBeKPL/RANb2w+yiT1g/gTok//lP/W/l3h8QO/OCdCqCW2Cw//MkxAQHkAIWUAhEmAQXWUOFW2dxPu//9mr60ElY5sseQ+xxesmHKtZr7bsqqX2L//MkxAgFwAYiQAhEAC2hq22d3///9FTV6tA36JdgBJoOGgc+7qvqej5Zu7/7uI9l//MkxBQHAAYi8AhEAO193vt9KGOq+6qcT7hhfN5FTInmwk8RkqKImTM55pRQHQSq//MkxBsGkgoIAABHhTACIJLf99nVI///yuW1uBqWfEu7CgNPWGpUadBmZ////4sL//MkxCMHMAH9iABEmAsKioqKigsLCwtVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVV//MkxCkECAUYCAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";async function k(t){if("suspended"===Tone.context.state){const e=Tone.context.resume(),n=document.createElement("audio");n.controls=!1,n.preload="auto",n.loop=!1,n.src=E,n.title="Tone.js Examples";let i=Promise.resolve();try{i=await n.play()}catch(t){i=Promise.resolve(),console.log("did not start audio")}await Promise.all([i,e])}}const M=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`,A=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 6h12v12H6z"/></svg>`;customElements.define("tone-play-toggle",class extends i.a{static get properties(){return{playing:{type:Boolean},disabled:{type:Boolean}}}constructor(){super(),this.playing=!1}updated(t){t.has("playing")&&(this.dispatchEvent(new CustomEvent("change",{detail:this.playing,composed:!0,bubbles:!0})),this.dispatchEvent(new CustomEvent("play",{detail:this.playing,composed:!0,bubbles:!0})))}bind(t){this.addEventListener("change",e=>{e.detail?t.start():t.stop()}),setInterval(()=>{"stopped"===t.state&&(this.playing=!1)},100)}async _clicked(t){await k(),this.playing=!this.playing}render(){return i.b`
			<style>
				:host {
					display: inline-block;
					min-width: 80px;
					width: 100%;
				}

				#container {
					display: inline-block;
					width: 100%;
				}

				label {
					font-family: var(--label-font-family);
					font-size: var(--label-font-size);
					margin-right: 20px;
				}

				button {
					box-sizing: border-box;
					width: 100%;
					height: 44px;
					outline-color: var(--outline-color);
					border: 2px solid black;
					border-radius: 22px;
					padding: 0px;
					font-size: 30px;
					text-align: center;
					cursor: pointer;
					transition: box-shadow 0.1s;
					box-shadow: var(--shadow-low);
				}

				button:hover, button:focus {
					box-shadow: var(--shadow-medium);
				}

				button[disabled]{
					opacity: 0.5;
				}

				button svg {
					margin-top: 4px;
					width: 30px;
					height: 30px;
				}

			</style>
			<div id="container">
				<button 
					?disabled=${this.disabled}
					?playing=${this.playing}
					@click=${this._clicked.bind(this)}
					aria-label="Play" .aria-checked=${this.playing}>
					${this.playing?A:M}
				</button>
			</div>
		`}});var I=n(137),C=n.n(I);customElements.define("tone-player-viz",class extends i.a{static get properties(){return{color:{type:String},loading:{type:Boolean}}}constructor(){super(),this.color="black",this.loading=!0}_computeRMS(t,e){if(this._waveform&&this._waveform.length===e)return;const n=t.toArray(0),i=[];for(let t=0;t<e;t++){const o=Math.floor(Math.scale(t,0,e,0,n.length-64)),r=o+64;let s=0;for(let t=o;t<r;t++)s+=Math.pow(n[t],2);const a=Math.sqrt(s/64);i[t]=a}const o=Math.max(...i);this._waveform=i.map(t=>Math.scale(Math.pow(t,.8),0,o,0,1))}visualize(t){if(this.loading=!t.loaded,t.loaded){const e=t.buffer,n=this.shadowRoot.querySelector("canvas");n.width=2*n.clientWidth,n.height=2*n.clientHeight;const{width:i,height:o}=n,r=n.getContext("2d");r.clearRect(0,0,i,o),this._computeRMS(e,i);const s=Math.scale(t.loopStart,0,e.duration,0,i);let a=Math.scale(t.loopEnd,0,e.duration,0,i);0===t.loopEnd&&(a=i),r.fillStyle=this.color;const l=C()(this.color).setAlpha(.2).toRgbString();this._waveform.forEach((e,n)=>{const c=e*o,u=t.reverse?i-n:n;t.loop&&(r.fillStyle=s>u||u>a?l:this.color),r.fillRect(u,o/2-c/2,1,c),r.fill()})}}render(){return i.b`
			<style>
				:host {
					display: inline-block;
					width: 60px;
					height: 20px;
					position: relative;
				}
				canvas {
					width: 100%;
					height: 100%;
				}

				#loading {
					position: absolute;
					bottom: 4px;
					font-family: var(--label-font-family);
					font-size: var(--label-font-size);
				}

				#loading[hidden]{
					display: none;
				}
			</style>
			<canvas>
				the audio file's waveform
			</canvas>
			<div id="loading" ?hidden=${!this.loading} style="color: ${this.color}">loading</div>
		`}});customElements.define("tone-player",class extends o.a{static get properties(){return{label:{type:String},duration:{type:Number}}}constructor(){super(),this.label="Player",this.duration=0}bind(t){const e=setInterval(()=>{t.loaded&&(clearInterval(e),this.duration=t.buffer.duration,this.sync(t))},100);super.bind(t)}render(){return i.b`
			<style>
				:host {
					display: block;
				}

				tone-slider, tone-toggle {
					display: block;
					margin-top: 10px;
				}

				tone-player-viz#top {
					position: absolute;
					top: 9px;
					right: 15px;
				}

				tone-rack:not([collapsed]) tone-player-viz#top{
					display: none;
				}

				tone-player-viz#bottom {
					position: relative;
					display: block;
					width: calc(100% - 20px);
					height: 60px;
					background-color: black;
					border-radius: 10px;
					padding: 10px;
					margin-top: 20px;
				}

				tone-play-toggle {
					position: absolute;
					top: 5px;
					left: 50%;
					transform: translate(-50%, 0);
				}

			</style>
			<tone-rack 
				@collapse=${t=>this.collapsed=t.detail}
				?collapsed=${this.collapsed} label="${this.label}">
				<tone-player-viz slot="top" class="viz" id="top" color="black"></tone-player-viz>
				<tone-player-viz class="viz" id="bottom" color="white"></tone-player-viz>
				<tone-slider 
					min="0.5"
					max="2"
					exp="2"
					value="1"
					label="Playback Rate"
					attribute="playbackRate">
				</tone-slider>
				<tone-toggle 
					label="Loop"
					attribute="loop">
				</tone-toggle>
				<tone-slider 
					min="0"
					value="0"
					label="Loop Start"
					.max=${this.duration}
					attribute="loopStart">
				</tone-slider>
				<tone-slider 
					min="0"
					value="0"
					label="Loop End"
					.max=${this.duration}
					attribute="loopEnd">
				</tone-slider>
				<tone-toggle 
					label="Reverse"
					attribute="reverse">
				</tone-toggle>
			</tone-rack>
		`}});var T=n(99),N=n.n(T);customElements.define("tone-slider",class extends i.a{static get properties(){return{min:{type:Number},max:{type:Number},step:{type:Number},value:{type:Number},default:{type:Number},exp:{type:Number},anchor:{type:String},label:{type:String},units:{type:String},integer:{type:Boolean},attribute:{type:String},bare:{type:Boolean}}}constructor(){super(),this.min=0,this.max=100,this.step=1,this.value=50,this.exp=1,this.anchor="left",this.integer=!1,this.bare=!1,this._setThrottle=-1}_logValue(t){const e=Math.pow(t,this.exp),n=Math.pow(1,this.exp),i=Math.pow(101,this.exp);let o=Math.scale(e,n,i,this.min,this.max);this.integer&&(o=Math.round(o)),this.value=o,this.dispatchEvent(new CustomEvent("input",{composed:!0,detail:this.value}))}_exp(t,e){return Math.sign(t)*Math.pow(Math.abs(t),e)}_logPosition(){const t=Math.scale(this.value,this.min,this.max,Math.pow(1,this.exp),Math.pow(101,this.exp));return Math.pow(t,1/this.exp)}_beautifyVal(){const t=Math.abs(this.min-this.max);return t>10||this.integer?this.value.toFixed(0):t>1&&1===this.exp?this.value.toFixed(1):this.value.toFixed(2)}_getStep(){const t=Math.abs(this.min-this.max);return t>10||this.integer?1:t>1&&1===this.exp?.1:.01}sync(t){const e=this.attribute;void 0!==t[e].value?this.value=Math.clamp(t[e].value,this.min,this.max):this.value=Math.clamp(t[e],this.min,this.max)}set(t){const e=this.attribute;isFinite(this.value)&&(void 0!==t[e].value?t[e].value!==this.value&&(t[e].value=this.value):t[e]!==this.value&&(t[e]=this.value))}updated(t){super.updated(t),t.has("value")&&(this.dispatchEvent(new CustomEvent("change",{composed:!0,detail:this.value,bubbles:!0})),this.attribute&&this.dispatchEvent(new CustomEvent(this.attribute,{composed:!0,detail:this.value,bubbles:!0})))}_numberInput(t){const e=Math.clamp(parseFloat(t.target.value),this.min,this.max);this.integer?this.value=Math.floor(e):this.value=e}render(){const t=Math.clamp(this._logPosition(),0,100);let e=t-1,n=0;return"center"===this.anchor&&(n=50-Math.max(50-e,0),e=Math.abs(50-e)),i.b`
			<style>
				${N.a}
			</style>
			<div id="container" @keydown=${t=>"Backspace"===t.key&&void 0!==this.default?this.value=this.default:""}>
				<label ?hidden=${this.bare} for="value">${this.label}</label>
				<span ?hidden=${this.bare} id="units">${this.units}</span>
				<input ?hidden=${this.bare} name="value" type="number"
					@change=${this._numberInput.bind(this)}
					.min=${this.min}
					.max=${this.max}
					.step=${this._getStep()}
					.value=${this._beautifyVal()}>
				<div id="slider">
					<input name="value" type="range"
						@input=${t=>this._logValue(parseFloat(t.target.value))}
						min="1"
						max="101"
						.step=${Math.pow(this.step,1/this.exp)}
						@focus=${()=>this.shadowRoot.querySelector("#circle").classList.add("focus")}
						@blur=${()=>this.shadowRoot.querySelector("#circle").classList.remove("focus")}
						.value=${t}>
					<div id="line">
						<div id="anchor" class=${this.anchor} style="width:${e.toString()}%; left:${n.toString()}%"></div>
					</div>
					<div id="circle" style="left: calc(${(t-1).toString()}% - ${(12*(t-1)/100).toString()}px);"></div>
				</div>
			</div>
		`}});customElements.define("tone-noise",class extends o.a{static get properties(){return{label:{type:String}}}constructor(){super(),this.label="Noise"}render(){return i.b`
			<style>
				:host {
					display: block;
				}

				tone-slider, tone-select-attribute {
					display: block;
					margin-top: 10px;
				}

			</style>
			<tone-rack label="${this.label}" ?collapsed=${this.collapsed}>
				<tone-select-attribute
					attribute="type"
					label="Type">
					<option value="white">white</option>
					<option value="brown">brown</option>
					<option value="pink">pink</option>
				</tone-select-attribute>
				<tone-slider 
					min="0.1"
					max="4"
					exp="2"
					value="1"
					label="Playback Rate"
					attribute="playbackRate">
				</tone-slider>
			</tone-rack>
		`}});customElements.define("tone-oscilloscope",class extends i.a{constructor(){super(),this._waveform=new Tone.Waveform(256)}bind(t){t.connect(this._waveform),this._canvas=this.shadowRoot.querySelector("canvas"),this._canvas.width=2*this._canvas.clientWidth,this._canvas.height=2*this._canvas.clientHeight,this._context=this._canvas.getContext("2d"),this.loop(),window.addEventListener("resize",()=>{this._canvas.width=2*this._canvas.clientWidth,this._canvas.height=2*this._canvas.clientHeight})}loop(){requestAnimationFrame(this.loop.bind(this));const t=this._waveform.getValue(),e=this._canvas.width,n=this._canvas.height;this._context.clearRect(0,0,e,n),this._context.beginPath(),this._context.lineWidth=4,t.forEach((i,o)=>{const r=Math.scale(o,0,t.length,0,e),s=Math.scale(i,-1,1,0,n);0===o?this._context.moveTo(r,s):this._context.lineTo(r,s)}),this._context.lineCap="round",this._context.strokeStyle="white",this._context.stroke()}render(){return i.b`
			<style>
				:host {
					display: inline-block;
					width: 45px;
					height: 24px;
					border-radius: 15px;
					padding: 4px;
					box-sizing: border-box;
					background-color: #aaa;
					overflow: hidden;
				}
				canvas {
					width: 100%;
					height: 100%;
				}
			</style>
			<canvas>
				waveform of current playing audio
			</canvas>
		`}});const P=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0zm0 0h24v24H0z" fill="none"/><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/></svg>`,O=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;customElements.define("tone-microphone",class extends o.a{static get properties(){return{label:{type:String},open:{type:Boolean},supported:{type:Boolean}}}constructor(){super(),this.label="Noise",this.inputs=[],this.supported=Tone.UserMedia.supported}async bind(t){if(!this.supported)return;setInterval(()=>{this.open="started"===t.state},100);const e=this.shadowRoot.querySelector("tone-select");this.shadowRoot.querySelector("#mic").addEventListener("click",n=>{k(),this.open?t.close():t.open(e.value)}),e.addEventListener("change",n=>{this.open&&t.open(e.value)}),this.shadowRoot.querySelector("tone-oscilloscope").bind(t),this.inputs=await Tone.UserMedia.enumerateDevices(),this.requestUpdate()}render(){return i.b`
			<style>
				:host {
					display: block;
				}

				#container {
					width: 100%;
					min-width: 100px;
					height: 44px;
					box-sizing: border-box;
					border-radius: 22px;
					border: 2px solid black;
					position: relative;
				}

				#mic {
					background-color: transparent;
					outline-color: var(--outline-color);
					border: none;
					-webkit-appearance: none;
					height: 100%;
					margin-left: 10px;
					margin-top: 1px;
				}

				tone-oscilloscope {
					position: absolute;
					right: 10px;
					top: 8px;
				}

				tone-select {
					max-width: 200px;
					position: absolute;
					left: 50%;
					transform: translate(-50%, 0);
					top: 8px;
				}

				button[disabled] {
					opacity: 0.5;
				}

				#notSupported {
					display: inline-block;
					color: #aaa;
					top: -6px;
				    position: relative;
					margin-left: 10px;
				}

			</style>
			<div id="container">
				<button 
					?disabled=${!this.supported}
					id="mic" aria-label="microphone" aria-checked=${this.open}>
					${this.open?O:P}
				</button>
				${this.supported?i.b`
					<tone-select>
						${this.inputs.map(t=>i.b`
							<option value=${t.deviceId}>${t.label}</option>
						`)}
					</tone-select>
					<tone-oscilloscope></tone-oscilloscope>
				`:i.b`
					<div id="notSupported"> UserMedia Not Supported</div>
				`}
			</div>
		`}});customElements.define("tone-grain-player",class extends o.a{static get properties(){return{label:{type:String},duration:{type:Number}}}constructor(){super(),this.label="GrainPlayer",this.duration=0}bind(t){const e=setInterval(()=>{t.loaded&&(clearInterval(e),this.duration=t.buffer.duration,this.sync(t))},100);super.bind(t)}render(){return i.b`
			<style>
				:host {
					display: block;
				}

				tone-slider, tone-toggle {
					display: block;
					margin-top: 10px;
				}

				tone-player-viz#top {
					position: absolute;
					top: 9px;
					right: 15px;
				}

				tone-rack:not([collapsed]) tone-player-viz#top{
					display: none;
				}

				tone-player-viz#bottom {
					position: relative;
					display: block;
					width: calc(100% - 20px);
					height: 60px;
					background-color: black;
					border-radius: 10px;
					padding: 10px;
					margin-top: 20px;
				}

				tone-play-toggle {
					position: absolute;
					top: 5px;
					left: 50%;
					transform: translate(-50%, 0);
				}

			</style>
			<tone-rack 
				@collapse=${t=>this.collapsed=t.detail}
				?collapsed=${this.collapsed} label="${this.label}">
				<tone-player-viz slot="top" class="viz" id="top" color="black"></tone-player-viz>
				<tone-player-viz class="viz" id="bottom" color="white"></tone-player-viz>
				<tone-slider 
					min="0.5"
					max="2"
					exp="2"
					value="1"
					label="Playback Rate"
					attribute="playbackRate">
				</tone-slider>
				<tone-slider 
					min="-1200"
					max="1200"
					default="0"
					anchor="center"
					value="0"
					label="Detune"
					units="cents"
					attribute="detune">
				</tone-slider>
				<tone-slider 
					min="0.01"
					max="0.5"
					value="0.1"
					label="Grain Size"
					attribute="grainSize">
				</tone-slider>
				<tone-slider 
					min="0.01"
					max="0.2"
					value="0.1"
					label="Overlap"
					attribute="overlap">
				</tone-slider>
				<tone-toggle 
					label="Loop"
					attribute="loop">
				</tone-toggle>
				<tone-slider 
					min="0"
					value="0"
					label="Loop Start"
					.max=${this.duration}
					attribute="loopStart">
				</tone-slider>
				<tone-slider 
					min="0"
					value="0"
					label="Loop End"
					.max=${this.duration}
					attribute="loopEnd">
				</tone-slider>
				<tone-toggle 
					label="Reverse"
					attribute="reverse">
				</tone-toggle>
			</tone-rack>
		`}});customElements.define("tone-multislider",class extends i.a{static get properties(){return{label:{type:String},length:{type:Number},attribute:{type:String}}}constructor(){super(),this.length=32,this.value=Array.from(new Float32Array(this.length))}_scaleArray(t){const e=Math.max(1,...t);return t.slice(0,this.length).map(t=>Math.clamp(Math.abs(t/e),0,1))}sync(t){this._scaleArray(t[this.attribute]).toString()!==this.value&&(this.value=this._scaleArray(t[this.attribute]),this.requestUpdate())}set(t){t[this.attribute]=this.value}_eventToXY(t){return{x:t.offsetX/t.target.offsetWidth,y:1-t.offsetY/t.target.offsetHeight}}mousedown(t){if(t.buttons){const{x:e,y:n}=this._eventToXY(t),i=this.value.length;if(this.value[Math.floor(e*this.length)]=n,i!==this.value.length)for(let t=0;t<this.value.length;t++)this.value[t]||(this.value[t]=0);this.requestUpdate(),this.dispatchEvent(new CustomEvent("change",{detail:this.value,composed:!0})),this.attribute&&this.dispatchEvent(new CustomEvent(this.attribute,{composed:!0,detail:this.value,bubbles:!0}))}}render(){const t=this.value;return i.b`
			<style>
				:host {
					display: block;
				}

				#container {
					position: relative;
					width: 100%;
					height: 55px;
					display: block;
					background-color: #eee;
					margin-top: 5px;
				}

				.slider {
					width: calc(100% / ${this.length});
					display: inline-block;
					height: 100%;
					position: relative;
					float: left;
					pointer-events: none;
				}

				.slider .fill {
					color: green;
					width: 100%;
					height: 0%;
					background-color: #777;
					position: absolute;
					bottom: 0px;
				}

				label {
					font-family: var(--label-font-family);
					font-size: var(--label-font-size);
				}
			</style>
			<label>${this.label}</label>
			<div id="container" 
				@mousedown=${this.mousedown}
				@mousemove=${this.mousedown}>
				${t.map(t=>i.b`
					<span class="slider">
						<div class="fill" style="height : ${Math.ceil(100*t).toString()}%"></div>
					</span>
				`)}
			</div>
		`}});var R=n(138),$=n.n(R);customElements.define("tone-keyboard-note",class extends i.a{static get properties(){return{note:{type:Number},color:{type:String},activecolor:{type:String},active:{type:Boolean},velocity:{type:Number},touchid:{type:Number}}}fromMidi(t){return Tone.Midi(t).toNote()}constructor(){super(),this.color="#eee",this.activecolor="white",this.active=!1,this.touchid=-1}updated(t){if(t.has("active")){const t=this.active?"noteon":"noteoff";this.active||(this.touchid=-1),this.dispatchEvent(new CustomEvent(t,{detail:{name:this.fromMidi(this.note),midi:this.note,velocity:this.active?1:0},composed:!0,bubbles:!0}))}}mouseover(t){t.buttons&&(this.active=!0,this.shadowRoot.querySelector("button").focus())}keydown(t){k(),t.repeat||" "!==t.key&&"Enter"!==t.key||(this.active=!0)}keyup(t){" "!==t.key&&"Enter"!==t.key||(this.active=!1)}touchstart(t){t.preventDefault(),this.touchid=t.touches[0].identifier,this.active=!0}render(){const t=0!==this.note;return i.b`
			<style>
				
				:host {
					display: block;
				}

				#container {
					width: 100%;
					height: 100%;
					display: block;
				}

				#container:not([show]){
					opacity: 0;
					margin: 2px;
					pointer-events: none;
				}

				button {
					border: none;
					-webkit-appearance: none;
					--key-margin: 2px;
					width: 100%;
					height: 100%;
					border: 2px solid white;
					box-sizing: border-box;
					padding: 0;
					outline: none;
					transition: background-color 0.2s;
					color: transparent;
					font-size: 0px;
					border-radius: 2px;
				}
				button[active] {
					background-color: #666!important;
					transition-duration: 0s;
				}
				button:focus {
					border-color: #666;
				}
			</style>
			<div id="container" ?show=${t}>
				${t?i.b`
					<button 
						?active=${this.active}
						@mouseover=${this.mouseover.bind(this)}
						@mouseleave=${()=>this.active=!1}
						@mousedown=${()=>this.active=!0}
						@touchstart=${this.touchstart.bind(this)}
						@touchend=${()=>this.active=!1}
						@mouseup=${()=>this.active=!1}
						@keydown=${this.keydown.bind(this)}
						@keyup=${this.keyup.bind(this)}
						style="background-color: ${this.active?this.activecolor:this.color};">
							${this.fromMidi(this.note).replace("#","♯")}
						</button>`:i.b``}
			</div>
		`}});customElements.define("tone-keyboard-octave",class extends i.a{static get properties(){return{octave:{type:Number}}}constructor(){super(),this.octave=1}noteon(t){this.shadowRoot.querySelector(`tone-keyboard-note[note="${t}"]`).active=!0}noteoff(t){this.shadowRoot.querySelector(`tone-keyboard-note[note="${t}"]`).active=!1}_getNoteByTouchId(t){const e=Array.from(this.shadowRoot.querySelectorAll("tone-keyboard-note")).find(e=>e.touchid===t);if(e&&e.note)return e}render(){const t=12*this.octave,e=[0,2,4,5,7,9,11].map(e=>e+t),n=[0,1,3,0,6,8,10,0].map(e=>e?e+t:0);return i.b`
			<style>

				#container {
					display: block;
					position: relative;
					height: 100%;
					width: 100%;
				}
				tone-keyboard-note {
					order: 0;
					flex-grow: 1;
				}

				#white-notes {
					position: absolute;
					left: 0px;
					top: 0px;
					width: 100%;
					height: 100%;
					display: flex;
					flex-direction: row;
				}

				#black-notes {
					position: absolute;
					top: 0px;
					width: 100%;
					display: flex;
					flex-direction: row;
					height: 55%;
				}

				#black-notes tone-keyboard-note:first-child, #black-notes tone-keyboard-note:last-child {
					flex-grow: 0.5;
					pointer-events: none;
				}

			</style>
			<div id="container">
				<div id="white-notes">
				${e.map(t=>i.b`
					<tone-keyboard-note color="#aaa" note="${t.toString()}"></tone-keyboard-note>
				`)}
				</div>
				<div id="black-notes">
				${n.map(t=>i.b`
					<tone-keyboard-note color="black" note="${t.toString()}"></tone-keyboard-note>
				`)}
				</div>
			</div>
		`}});customElements.define("tone-keyboard",class extends i.a{static get properties(){return{rootoctave:{type:Number},octaves:{type:Number},polyphonic:{type:Boolean}}}constructor(){super(),this.rootoctave=4,this.octaves=4,this.polyphonic=!1,this._computerKeyboard=new $.a({polyphony:1/0}),this._computerKeyboard.down(t=>{k(),this.noteon(t.note)}),this._computerKeyboard.up(t=>{this.noteoff(t.note)})}_getNoteByTouchId(t){const e=Array.from(this.shadowRoot.querySelectorAll("tone-keyboard-octave")).find(e=>e._getNoteByTouchId(t));if(e)return e._getNoteByTouchId(t)}_touchmove(t){Array.from(t.changedTouches).forEach(t=>{this._getNoteByTouchId(t.identifier);const e=this._getNoteByTouchId(t.identifier),n=this.shadowRoot.elementFromPoint(t.clientX,t.clientY);if(n&&n.shadowRoot){const i=n.shadowRoot.elementFromPoint(t.clientX,t.clientY);i&&i.note&&e.note!==i.note&&(e.active=!1,e.touchid=-1,i.active=!0,i.touchid=t.identifier)}})}_touchend(t){Array.from(t.changedTouches).forEach(t=>{this._getNoteByTouchId(t.identifier);const e=this._getNoteByTouchId(t.identifier);e&&e.active&&(e.active=!1,e.touchid=-1)})}noteon(t){const e=Math.floor(t/12),n=this.shadowRoot.querySelector(`tone-keyboard-octave[octave="${e}"]`);n&&n.noteon(t)}noteoff(t){const e=Math.floor(t/12),n=this.shadowRoot.querySelector(`tone-keyboard-octave[octave="${e}"]`);n&&n.noteoff(t)}render(){const t=[];for(let e=this.rootoctave;e<this.rootoctave+this.octaves;e++)t.push(e);return i.b`
			<style>
				#container {
					display: flex;
					background-color: white;
					height: 80px;
				}

				tone-keyboard-octave {
					flex-grow: 1;
				}
			</style>
			<div id="container"
				@touchmove=${this._touchmove.bind(this)}
				@touchend=${this._touchend.bind(this)}>
				${t.map(t=>i.b`
					<tone-keyboard-octave octave=${t.toString()}></tone-keyboard-octave>
				`)}
			</div>
		`}});var F=n(38),z=n.n(F);customElements.define("tone-midi-in",class extends i.a{constructor(){super(),z.a.enable(t=>{t&&error(t),z.a.addListener("connected",t=>{"input"===t.port.type&&this.requestUpdate()}),z.a.addListener("disconnected",t=>{this.requestUpdate()})})}_flash(){clearTimeout(this._flashTimeout);const t=this.shadowRoot.querySelector("#light");t.classList.add("flash"),this._flashTimeout=setTimeout(()=>t.classList.remove("flash"),100)}_connectMidi(t){if("none"===t.target.value)return void this.shadowRoot.querySelector("#light").classList.remove("connected");this.shadowRoot.querySelector("#light").classList.add("connected");const e=z.a.getInputById(t.target.value);e.addListener("noteon","all",t=>{const e=`${t.note.name}${t.note.octave}`,n=t.note.number;this._flash(),this.dispatchEvent(new CustomEvent("noteon",{detail:{name:e,midi:n,velocity:t.velocity},composed:!0,bubbles:!0}))}),e.addListener("noteoff","all",t=>{const e=`${t.note.name}${t.note.octave}`,n=t.note.number;this._flash(),this.dispatchEvent(new CustomEvent("noteoff",{detail:{name:e,midi:n,velocity:t.velocity},composed:!0,bubbles:!0}))}),e.addListener("controlchange","all",t=>{this._flash()})}render(){return window.WebMidi=z.a,z.a.supported?i.b`
				<style>
					:host {
						display: block;
					}

					#container {
						display: block;
						margin-bottom: 10px;
					}

					label {
						font-family: var(--label-font-family);
						font-size: var(--label-font-size);
						margin-right: 10px;
					}

					tone-select, label {
						display: inline-block;
					}

					#container {
						position: relative;
					}

					#light {
						width: 10px;
						height: 10px;
						background-color: white;
						display: inline-block;
					}

					#light.connected {
						background-color: var(--color-gray);
					}

					#light.connected.flash {
						background-color: black!important;
					}

				</style>
				<div id="container">
					<div id="light"></div>
					<label>MIDI</label>
					<tone-select
						@change=${this._connectMidi.bind(this)}>
						<option value="none">none</option>
						${z.a.inputs.map(t=>i.b`
							<option value=${t.id}>${t.name}</option>
						`)}
					</tone-select>
				</div>
			`:i.b``}});customElements.define("tone-piano",class extends i.a{static get properties(){return{polyphonic:{type:Boolean}}}constructor(){super()}bind(t){this.addEventListener("noteon",e=>{t.triggerAttack(e.detail.name)}),this.addEventListener("noteoff",e=>{this.polyphonic?t.triggerRelease(e.detail.name):t.triggerRelease()})}firstUpdated(){super.firstUpdated();const t=this.shadowRoot.querySelector("tone-keyboard");this.shadowRoot.querySelector("tone-midi-in").addEventListener("noteon",e=>{e.stopPropagation(),t.noteon(e.detail.midi)}),this.shadowRoot.querySelector("tone-midi-in").addEventListener("noteoff",e=>{e.stopPropagation(),t.noteoff(e.detail.midi)}),window.addEventListener("resize",this._resize.bind(this)),setTimeout(()=>this._resize(),100)}_resize(){const t=this.shadowRoot.querySelector("#container").clientWidth,e=Math.clamp(Math.floor(t/100)-1,1,8),n=Math.ceil(Math.scale(e,1,8,5,1));this.shadowRoot.querySelector("tone-keyboard").setAttribute("rootoctave",n),this.shadowRoot.querySelector("tone-keyboard").setAttribute("octaves",e)}render(){return i.b`
			<style>
				:host {
					display: block;
				}

				#container {
					background-color: var(--color-light-gray);
					position: relative;
					padding: 5px;
					display: block;
				}

				tone-keyboard {
					display: block;
					clear: both;
				}

				tone-midi-in {
				    position: relative;
				    top: 5px;
				    right: 5px;
				    display: inline-block;
				    float: right;
				}

			</style>
			<div id="container">
				<tone-midi-in>
				</tone-midi-in>
				<tone-keyboard ?polyphonic=${this.polyphonic}></tone-keyboard>
			</div>
		`}});customElements.define("tone-button",class extends i.a{static get properties(){return{label:{type:String},disabled:{type:Boolean}}}constructor(){super()}_clicked(t){k(),this.disabled&&t.stopPropagation()}render(){return i.b`
			<style>
				:host {
					display: inline-block;
					min-width: 80px;
					width: 100%;
					--computed-button-height : var(--button-height, 44px);
				}

				#container {
					display: inline-block;
					width: 100%;
				}

				button {
					box-sizing: border-box;
					width: 100%;
					height: var(--computed-button-height);
					outline-color: var(--outline-color);
					border: 2px solid black;
					border-radius: calc(var(--computed-button-height) / 2);
					padding: 0px;
					font-family: var(--label-font-family);
					font-size: var(--label-font-size);
					text-align: center;
					cursor: pointer;
					transition: box-shadow 0.1s;
					box-shadow: var(--shadow-low);
				}

				button:not([disabled]):hover, button:not([disabled]):focus {
					box-shadow: var(--shadow-medium);
				}

				button:active {
					color: var(--color-gray);
					border-color: var(--color-gray);
				}

				button[disabled]{
					opacity: 0.5;
				}

			</style>
			<div id="container">
				<button 
					?disabled=${this.disabled}
					@click=${this._clicked.bind(this)}>
					${this.label}
				</button>
			</div>
		`}});customElements.define("tone-trigger",class extends i.a{static get properties(){return{triggered:{type:Boolean},disabled:{type:Boolean}}}constructor(){super(),this.triggered=!1}updated(t){t.has("triggered")&&this.dispatchEvent(new CustomEvent("change",{detail:this.triggered,composed:!0,bubbles:!0}))}bind(t){this.addEventListener("change",e=>{e.detail?t.start():t.stop()})}_mousedown(t){k(),"touchstart"===t.type&&t.preventDefault(),this.triggered=!0}_keydown(t){k()," "!==t.key&&"Enter"!==t.key||(this.triggered=!0)}_keyup(t){" "!==t.key&&"Enter"!==t.key||(this.triggered=!1)}render(){return i.b`
			<style>
				:host {
					display: inline-block;
					min-width: 80px;
					width: 100%;
				}

				#container {
					display: inline-block;
					width: 100%;
				}

				label {
					font-family: var(--label-font-family);
					font-size: var(--label-font-size);
					margin-right: 20px;
				}

				button {
					position: relative;
					box-sizing: border-box;
					width: 100%;
					height: 44px;
					outline-color: var(--outline-color);
					border: 2px solid black;
					border-radius: 22px;
					padding: 0px;
					font-size: 30px;
					text-align: center;
					cursor: pointer;
					transition: box-shadow 0.1s;
					box-shadow: var(--shadow-low);
				}

				button:hover, button:focus {
					box-shadow: var(--shadow-medium);
				}

				button #ring {
					width: 20px;
					height: 20px;
					position: absolute;
					border-radius: 50%;
					left: 50%;
					top: 50%;
					transform: translate(-50%, -50%);
					border: 2px solid black;
					box-sizing: border-box;
					transition: all 0.1s;
				}

				button[triggered] #ring {
					width: 30px;
					height: 30px;
				}

				button #circle {
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translate(-50%, -50%);
					width: 100%;
					height: 100%;
					border-radius: 50%;
					transition: all 0.1s;
					background-color: black;
				}

				button[triggered] #circle {
					width: 0px;
					height: 0px;
				}

				button[disabled] {
					opacity: 0.5;
				}

			</style>
			<div id="container">
				<button 
					?disabled=${this.disabled}
					?triggered=${this.triggered}
					@keydown=${this._keydown.bind(this)}
					@keyup=${this._keyup.bind(this)}
					@mousedown=${this._mousedown.bind(this)}
					@touchstart=${this._mousedown.bind(this)}
					@mouseup=${()=>this.triggered=!1}
					@touchend=${()=>this.triggered=!1}
					aria-label="Trigger" .aria-checked=${this.triggered}>
					<div id="ring">
						<div id="circle"></div>
					</div>
					
				</button>
			</div>
		`}});customElements.define("tone-step-sequencer",class extends i.a{static get properties(){return{label:{type:String},rows:{type:Number},columns:{type:Number},highlight:{type:Number}}}constructor(){super(),this.rows=4,this.columns=16,this.highlight=-1,this.values=[],this.adding=!1}get currentColumn(){return this.values[Math.clamp(this.highlight,0,this.columns-1)]}_mousedown(t,e,n){t.cancelable&&t.preventDefault(),this.adding=!this.values[e][n],this.values[e][n]=this.adding,this.requestUpdate()}_mousemove(t,e,n){if(t.cancelable&&t.preventDefault(),t.buttons)this.values[e][n]=this.adding,this.requestUpdate();else if(t.changedTouches){const{clientWidth:i,clientHeight:o}=this.shadowRoot.querySelector("#container"),{top:r,left:s}=this.getBoundingClientRect();Array.from(t.changedTouches).forEach(t=>{const a=(t.clientX-s)/i,l=(t.clientY-r)/o;e=Math.floor(a*this.columns),n=Math.floor(l*this.rows),this.values[e][n]=this.adding}),this.requestUpdate()}}updated(t){if(t.has("columns")||t.has("rows")){this.values=[];for(let t=0;t<this.columns;t++){const t=[];for(let e=0;e<this.rows;e++)t[e]=!1;this.values.push(t)}this.requestUpdate()}}render(){return i.b`
			<style>
				:host {
					display: inline-block;
					width: 100%;
					height: 120px;
				}
				#container {
					width: 100%;
					height: 100%;
					display: flex;
				}
				.column {
					flex: 1;
					display: flex;
					flex-direction: column;
				}

				.column.highlight {
					background-color: var(--color-gray);
				}

				.column.highlight .row {
					transition-duration: 0.4s;
				}

				.column.highlight .row.filled {
					transition: background-color 0.1s;
				}

				.column.highlight .row.filled{
					background-color: white;
				}

				.row {
					flex: 1;
					margin: 1px;
					background-color: var(--color-light-gray);
					transition: background-color 0s;
				}

				.row.filled {
					background-color: var(--color-teal);
				}
			</style>
			<div id="container">
				${this.values.map((t,e)=>i.b`
					<div class="column ${e===this.highlight?"highlight":""}">
						${t.map((t,n)=>i.b`
							<div
								@mousemove=${t=>this._mousemove(t,e,n)} 
								@touchmove=${t=>this._mousemove(t,e,n)} 
								@mousedown=${t=>this._mousedown(t,e,n)} 
								@touchstart=${t=>this._mousedown(t,e,n)} 
								@touchend=${()=>this.adding=!1} 
								@mouseup=${()=>this.adding=!1} 
								class="row ${t?"filled":""}"></div>
						`)}
					</div>
				`)}
			</div>
		`}});customElements.define("tone-position",class extends i.a{static get properties(){return{position:{type:Number},min:{type:Number},max:{type:Number}}}constructor(){super(),this.position=0,this.min=0,this.max=1,this._dragging=!1}bind(t){this.tone=t,this.loop(t)}updated(t){if(t.has("position")){const t=Math.scale(this.position,this.min,this.max,0,1);this.dispatchEvent(new CustomEvent("position",{detail:t,composed:!0}))}}loop(t){requestAnimationFrame(this.loop.bind(this,t)),this._dragging||(this.position=t.progress)}_change(t){if(this._dragging=!0,clearTimeout(this._dragTimeout),this._dragTimeout=setTimeout(()=>this._dragging=!1,200),this.tone){const e=Math.scale(t.detail,this.min,this.max,0,this.tone.loopEnd);this.tone.seconds=e,this.position=this.tone.progress}}render(){return i.b`
			<style>
				:host {
					display: block;
				}

				tone-slider {
					display: block;
					width: 100%;
				}

			</style>
			<div id="container">
				<tone-slider
					.value=${this.position}
					@input=${this._change.bind(this)}
					.min=${this.min}
					.max=${this.max}
					bare>
				</tone-slider>
			</div>
		`}});customElements.define("tone-slider-2d",class extends i.a{static get properties(){return{x:{type:Number},y:{type:Number}}}constructor(){super(),this.x=.5,this.y=.5}_resize(){const t=this.shadowRoot.querySelector("#container");this._slider.resize(t.clientWidth,t.clientHeight)}_getXY(t){t.stopPropagation(),t.preventDefault();const{clientWidth:e,clientHeight:n}=this.shadowRoot.querySelector("#container");let i=t.offsetX,o=t.offsetY;if(t.changedTouches){const{top:e,left:n}=this.getBoundingClientRect();i=t.changedTouches[0].clientX-n,o=t.changedTouches[0].clientY-e}return{x:Math.clamp(i/e,0,1),y:1-Math.clamp(o/n,0,1)}}_mousedown(t){const{x:e,y:n}=this._getXY(t);this.x=e,this.y=n,this.dispatchEvent(new CustomEvent("mousedown",{detail:{x:this.x,y:this.y},composed:!0}))}_mouseup(t){const{x:e,y:n}=this._getXY(t);this.x=e,this.y=n,this.dispatchEvent(new CustomEvent("mouseup",{detail:{x:this.x,y:this.y},composed:!0}))}_mousemove(t){if(t.buttons||t.changedTouches){const{x:e,y:n}=this._getXY(t);this.x=e,this.y=n,this.dispatchEvent(new CustomEvent("change",{detail:{x:this.x,y:this.y},composed:!0}))}}_mouseleave(t){t.buttons&&this._mouseup(t)}render(){return i.b`
			<style>
				:host {
					display: inline-block;
					width: 100%;
					height: 120px;
				}
				#container {
					width: 100%;
					height: 100%;
					background-color: var(--color-light-gray);
					position: relative;
					overflow: hidden;
				}

				#circle {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 30px;
					height: 30px;
					border-radius: 50%;
					background-color: var(--color-teal);
					pointer-events: none;
				}
			</style>
			<div id="container" 
				@mouseup=${this._mouseup.bind(this)}
				@touchend=${this._mouseup.bind(this)}
				@mousedown=${this._mousedown.bind(this)}
				@touchstart=${this._mousedown.bind(this)}
				@mousemove=${this._mousemove.bind(this)}
				@touchmove=${this._mousemove.bind(this)}
				@mouseleave=${this._mouseleave.bind(this)}>
				<div id="circle" style="left : ${(100*this.x).toString()}% ; top : ${(100*(1-this.y)).toString()}%">
				</div>
			</div>
		`}});var D=n(50);customElements.define("tone-envelope-viz",class extends D.a{constructor(){super(),this.min=0,this.max=1.1,this.duration=.1,this.alt="envelope curve"}async visualize(t){const e=t.get(),n=e.attack+e.decay+e.release,i=await Tone.Offline(()=>{const t=(new Tone.Envelope).toMaster();t.set(e),t.attack*=1,t.decay*=1,t.release*=1,t.toMaster(),t.triggerAttack(.001),t.triggerRelease(1*(e.attack+e.decay+.01)+.001)},1*(n+.01)+.002);this.buffer=i.toArray(0),this.requestUpdate()}});customElements.define("tone-envelope-curve",class extends i.a{static get properties(){return{label:{type:String},attribute:{type:String},basic:{type:Boolean}}}constructor(){super(),this.basic=!1}sync(t){const e=t[this.attribute];this.shadowRoot.querySelector("tone-select-attribute").value=e}get value(){return this.shadowRoot.querySelector("tone-select-attribute").value}set value(t){this.shadowRoot.querySelector("tone-select-attribute").value=t}render(){let t=i.b``;return this.basic||(t=i.b`
				<option value="bounce">bounce</option>
				<option value="ripple">ripple</option>
				<option value="step">step</option>
				<option value="cosine">cosine</option>
				<option value="sine">sine</option>
			`),i.b`
			<tone-select-attribute 
				label=${this.label} attribute=${this.attribute}>
				<option value="linear">linear</option>
				<option value="exponential">exponential</option>
				${t}
			</div>
		`}});class L extends o.a{static get properties(){return{label:{type:String}}}constructor(){super(),this.label="Envelope",this.collapsed=!1}renderAttributes(){return i.b``}render(){return i.b`
			<style>
				#top.viz {
					position: absolute;
					top: 9px;
					right: 20px;
					width: 50px;
				}
				tone-rack:not([collapsed]) #top.viz{
					display: none;
				}
				#bottom.viz {
					position: relative;
					display: block;
					width: calc(100% - 20px);
					height: 60px;
					background-color: black;
					border-radius: 10px;
					padding: 10px;
					margin-top: 20px;
				}
				tone-slider {
					display: block;
					margin-top: 10px;
				}
				tone-envelope-curve {
					display: block;
					margin-top: 5px;
				}
			</style>
			<tone-rack 
				@collapse=${t=>this.collapsed=t.detail}
				?collapsed=${this.collapsed} label="${this.label}">
				<tone-envelope-viz class="viz" id="top" slot="top"></tone-envelope-viz>
				<tone-envelope-viz class="viz" id="bottom" color="#eee"></tone-envelope-viz>
				<tone-slider 
					attribute="attack"
					min="0.01" 
					max="2" 
					exp="2"
					value="0.01" 
					label="Attack">
				</tone-slider>
				<tone-envelope-curve
					label="Attack Curve"
					attribute="attackCurve"
					></tone-envelope-curve>
				<tone-slider 
					attribute="decay"
					min="0.01" 
					max="2" 
					exp="2"
					value="0.01" 
					label="Decay">
				</tone-slider>
				<tone-envelope-curve
					basic
					label="Decay Curve"
					attribute="decayCurve"
					></tone-envelope-curve>
				<tone-slider 
					attribute="sustain"
					min="0" 
					max="1" 
					value="0.01" 
					label="Sustain">
				</tone-slider>
				<tone-slider 
					attribute="release"
					min="0.01" 
					max="4" 
					exp="2"
					value="0.01" 
					label="Release">
				</tone-slider>
				<tone-envelope-curve
					label="Release Curve"
					attribute="releaseCurve"
					></tone-envelope-curve>
				${this.renderAttributes()}
			</tone-rack>
		`}}customElements.define("tone-envelope",L);customElements.define("tone-frequency-envelope",class extends L{renderAttributes(){return i.b`
			<tone-slider 
				attribute="baseFrequency"
				min="20" 
				max="20000" 
				value="400"
				units="hz"
				exp="2"
				label="Frequency">
			</tone-slider>
			<tone-slider 
				attribute="octaves"
				min="-8" 
				max="8" 
				value="2" 
				label="Octaves">
			</tone-slider>
		`}});customElements.define("tone-meter",class extends i.a{static get properties(){return{stereo:{type:Boolean},level:{type:Boolean},color:{type:String}}}constructor(){super(),this.color="#777"}bind(t){if(this.stereo,this.stereo){const e=new Tone.Split;t.connect(e),this._meters=[new Tone.Meter(.9),new Tone.Meter(.9)],e.left.connect(this._meters[0]),e.right.connect(this._meters[1])}else this._meters=[new Tone.Meter(.9)],t.connect(this._meters[0]);this._canvas=this.shadowRoot.querySelector("canvas"),this._canvas.width=2*this._canvas.clientWidth,this._canvas.height=2*this._canvas.clientHeight,this._context=this._canvas.getContext("2d"),this.loop(),window.addEventListener("resize",()=>{this._canvas.width=2*this._canvas.clientWidth,this._canvas.height=2*this._canvas.clientHeight})}loop(){requestAnimationFrame(this.loop.bind(this));const{width:t,height:e}=this._canvas,n=this._meters.map(t=>t.getLevel()),i=n.map(t=>Math.clamp(Math.scale(t,-100,6,0,e),4,e));this._context.clearRect(0,0,t,e);const o=t/this._meters.length;this._context.fillStyle=this.color;const r=this._meters.length>1?5:0;i.forEach((t,n)=>{this._context.fillRect(n*o+r*n,e-t,o-r,t)}),this.level&&Array.from(this.shadowRoot.querySelectorAll(".level")).forEach((t,e)=>{let i=n[e];i<-100&&(i=-1/0),t.textContent=i.toFixed(2)})}render(){let t=i.b``;return this.level&&(t=this.stereo?i.b`
					<div class="level">-Infinity</div>
					<div class="level">-Infinity</div>
				`:i.b`
					<div class="level">-Infinity</div>
				`),i.b`
			<style>
				:host {
					display: inline-block;
					width: 45px;
					height: 24px;
					border-radius: 4px;
					padding: 4px;
					box-sizing: border-box;
					background-color: #aaa;
					overflow: hidden;
				}
				#container {
					width: 100%;
					height: 100%;
					display: inline-block;
				}
				canvas {
					width: 100%;
					height: 100%;
				}
				canvas.hasLevel {
					height: calc(100% - 15px);
				}
				#level {
					height: 10px;
					line-height: 10px;
					display: flex;
				}
				.level {
					flex-grow: 1;
					font-family: monospace;
					font-size: 10px;
					text-align: center;
				}
			</style>
			<div id="container">
				<canvas class=${this.level?"hasLevel":""}>
					audio meter level
				</canvas>
				${this.level?i.b`
					<div id="level" style="color:${this.color}">${t}</div>`:i.b``}
			</div>
		`}});var q=n(139),j=n.n(q);customElements.define("tone-presets",class extends i.a{static get properties(){return{label:{type:String},presets:{type:String}}}constructor(){super(),this.label="Presets",this.presets=JSON.stringify("[]"),this._options={}}bind(t){this.addEventListener("preset",e=>{const n=new t.constructor,i=n.get();n.dispose();const o=j()({},i,e.detail);t.set(o),this.dispatchEvent(new CustomEvent("sync",{detail:o,composed:!0,bubbles:!0}))})}_clicked(t,e){const n=Object.assign({},e);this.dispatchEvent(new CustomEvent("preset",{detail:n,composed:!0,bubbles:!0}))}render(){if("undefined"!==this.presets){const t=JSON.parse(this.presets);return i.b`
				<style>
					:host {
						display: block;
					}

					#container {
						display: flex;
					}

					#label {
						height: 20px;
						line-height: 20px;
						margin-left: 10px;
						margin-right: 10px;
					}

					#label, button {
						font-family: var(--label-font-family);
						font-size: var(--label-font-size);
						display: inline-block;
						color: var(--color-dark-gray);
					}

					#presets {
						display: inline-block;
					}

					button {
						font-family: monospace;
						border: none;
						-webkit-appearance: none;
						width: 20px;
						height: 20px;
						border: 2px solid var(--color-dark-gray);
						padding-left: 5px;
						color: var(--color-dark-gray);
						border-radius: 10px;
						text-align: center;
						background-color: transparent;
						font-size: 10px;
						outline-color: var(--outline-color);
						margin-left: 5px;
						margin-bottom: 5px;
						font-weight: bold;
					}

					button#copy {
						width: 40px;
						font-family: var(--label-font-family);
					}

					button.selected {
						background-color: white;
					}

					button:active {
						color: var(--color-gray);
						border-color: var(--color-gray);
					}
				</style>
				<div id="container">
					<div id="label">${this.label}</div>
					<div id="presets">
						${t.map((t,e)=>i.b`
							<button @click=${e=>this._clicked(e,t)}>
								${(e+1).toString()}
							</button>`)}
						<!--button id="copy">copy</button-->
					</div>
				</div>
			`}return i.b``}});class H extends o.a{static get properties(){return{label:{type:String},presets:{type:String},nopresets:{type:Boolean},collapsed:{type:Boolean},effect:{type:Boolean},polyphonic:{type:Boolean}}}constructor(){super(),this.label="",this.effect=!1,this.polyphonic=!1}bind(t){this.shadowRoot.querySelector("tone-meter").bind(t);const e=this.shadowRoot.querySelector("tone-presets");e&&e.bind(t),this.polyphonic?t.voices.forEach(t=>super.bind(t)):super.bind(t)}renderAttributes(){return i.b``}render(){const t=i.b`
			<div id="drywet" slot="top">
				<label>Dry/Wet</label>
				<tone-slider 
					label="Dry/Wet"
					attribute="wet"
					min="0"
					max="1"
					bare
					value="1"></tone-slider>
			</div>
		`;return i.b`
			<style>
				:host {
					display: block;
				}

				tone-meter {
					position: absolute;
					top: 8px;
					right: 8px;
					width: 24px;
					height: 24px;
					background-color: white;
				}

				tone-presets {
					margin-top: 15px;
				}

				tone-slider, tone-oscillator-type, tone-select-attribute {
					width: 90%;
					min-width: 300px;
					display: block;
					margin: 10px auto;
				}

				#attributeContainer * {
					display: block;
					margin-top: 10px;
				}

				#drywet {
					position: absolute;
					right: 60px;
					top: 0px;
					width: 50%;
					max-width: 150px;
					min-width: 100px;
				}

				#drywet tone-slider {
					display: inline-block;
					margin: 0;
					width: calc(100% - 64px);
					min-width: unset;
					float: right;
				}

				label {
					position: relative;
					top: 10px;
					width: 60px;
					display: inline-block;
					font-family: var(--label-font-family);
					font-size: var(--label-font-size);
				}

				@media only screen and (max-width: 600px) {
					#drywet label {
						display: none;
					}
				}

			</style>
			<tone-rack square ?collapsed=${this.collapsed} label=${this.label}>
				<tone-meter slot="top"></tone-meter>
				${this.effect?t:i.b``}
				<div id="attributeContainer">
					${this.renderAttributes()}
				</div>
				${this.nopresets?i.b``:i.b`<tone-presets presets=${this.presets}></tone-presets>`}
			</tone-rack square>
		`}}customElements.define("tone-instrument",H);const V=[{portamento:0,oscillator:{type:"fatsine4",spread:60,count:10},envelope:{attack:.4,decay:.01,sustain:1,attackCurve:"sine",releaseCurve:"sine",release:.4}},{portamento:0,oscillator:{type:"square4"},envelope:{attack:2,decay:1,sustain:.2,release:2}},{portamento:0,oscillator:{type:"pulse",width:.8},envelope:{attack:.01,decay:.05,sustain:.2,releaseCurve:"bounce",release:.4}},{portamento:.2,oscillator:{type:"sawtooth"},envelope:{attack:.03,decay:.1,sustain:.2,release:.02}},{portamento:.2,oscillator:{partials:[1,0,2,0,3]},envelope:{attack:.001,decay:1.2,sustain:0,release:1.2}},{portamento:.2,oscillator:{type:"fatcustom",partials:[.2,1,0,.5,.1],spread:40,count:3},envelope:{attack:.001,decay:1.6,sustain:0,release:1.6}},{portamento:0,oscillator:{type:"fatsawtooth",count:3,spread:30},envelope:{attack:.01,decay:.1,sustain:.5,release:.4,attackCurve:"exponential"}},{portamento:0,oscillator:{type:"sine"},envelope:{attack:.001,decay:.1,sustain:.1,release:1.2}}];customElements.define("tone-synth",class extends H{constructor(){super(),this.label="Synth",this.presets=JSON.stringify(V)}renderAttributes(){return i.b`
			<tone-slider 
				label="Portamento"
				attribute="portamento"
				min="0"
				max="0.3"
				value="0"></tone-slider>
			<tone-envelope 
				component="envelope"
				collapsed label="Envelope"></tone-envelope>
			<tone-oscillator 
				omni
				component="oscillator"
				collapsed label="Oscillator"></tone-oscillator>
		`}});const B=[{portamento:0,oscillator:{type:"square"},filter:{Q:6,type:"lowpass",rolloff:-24},envelope:{attack:.005,decay:.1,sustain:.9,release:1},filterEnvelope:{attack:.06,decay:.2,sustain:.5,release:2,baseFrequency:200,octaves:7,exponent:2}},{portamento:0,oscillator:{type:"sawtooth"},filter:{Q:2,type:"bandpass",rolloff:-24},envelope:{attack:.01,decay:.1,sustain:.2,release:.6},filterEnvelope:{attack:.02,decay:.4,sustain:1,release:.7,releaseCurve:"linear",baseFrequency:20,octaves:5}},{portamento:0,oscillator:{type:"fmsquare5",modulationType:"triangle",modulationIndex:2,harmonicity:.501},filter:{Q:1,type:"lowpass",rolloff:-24},envelope:{attack:.01,decay:.1,sustain:.4,release:2},filterEnvelope:{attack:.01,decay:.1,sustain:.8,release:1.5,baseFrequency:50,octaves:4.4}},{portamento:.08,oscillator:{type:"custom",partials:[2,1,3,2,.4]},filter:{Q:4,type:"lowpass",rolloff:-48},envelope:{attack:.04,decay:.06,sustain:.4,release:1},filterEnvelope:{attack:.01,decay:.1,sustain:.6,release:1.5,baseFrequency:50,octaves:3.4}},{portamento:.01,oscillator:{type:"sawtooth"},filter:{Q:2,type:"lowpass",rolloff:-24},envelope:{attack:.1,decay:.1,sustain:.6,release:.5},filterEnvelope:{attack:.05,decay:.8,sustain:.4,release:1.5,baseFrequency:2e3,octaves:1.5}},{portamento:0,oscillator:{type:"pwm",modulationFrequency:1},filter:{Q:6,rolloff:-24},envelope:{attack:.025,decay:.3,sustain:.9,release:2},filterEnvelope:{attack:.245,decay:.131,sustain:.5,release:2,baseFrequency:20,octaves:7.2,exponent:2}},{portamento:0,oscillator:{type:"sawtooth"},filter:{Q:3,type:"highpass",rolloff:-12},envelope:{attack:.01,decay:.3,sustain:0,release:.9},filterEnvelope:{attack:.01,decay:.1,sustain:0,release:.1,baseFrequency:800,octaves:-1.2}}];customElements.define("tone-mono-synth",class extends H{constructor(){super(),this.label="MonoSynth",this.presets=JSON.stringify(B)}renderAttributes(){return i.b`
			<tone-slider 
				label="Portamento"
				attribute="portamento"
				min="0"
				max="0.1"
				value="0"></tone-slider>
			<tone-envelope 
				component="envelope" 
				collapsed 
				label="Envelope"></tone-envelope>
			<tone-oscillator 
				omni
				component="oscillator" 
				class="rack" collapsed label="Oscillator"></tone-oscillator>
			<tone-filter 
				component="filter"
				class="rack" collapsed label="Filter"></tone-filter>
			<tone-frequency-envelope 
				component="filterEnvelope"
				collapsed 
				label="Filter Envelope"></tone-frequency-envelope>
		`}});const G=[{frequency:300,envelope:{attack:.001,decay:.20958529411764706,sustain:0,release:.4888,attackCurve:"linear",decayCurve:"exponential",releaseCurve:"exponential"},harmonicity:17.075,modulationIndex:36.84,resonance:378.8235294117647,octaves:2.25},{frequency:200,envelope:{attack:.01,decay:.0427764705882353,sustain:0,release:.4888,attackCurve:"linear",decayCurve:"linear",releaseCurve:"exponential"},harmonicity:12,modulationIndex:21.04,resonance:106.19607843137256,octaves:4},{frequency:300,envelope:{attack:.09584313725490196,decay:.26265196078431374,sustain:0,release:.4888,attackCurve:"ripple",decayCurve:"exponential",releaseCurve:"exponential"},harmonicity:.5,modulationIndex:11.56,resonance:474.0882352941176,octaves:.99},{frequency:300,envelope:{attack:.001,decay:.4,sustain:0,release:.2,attackCurve:"linear",decayCurve:"exponential",releaseCurve:"exponential"},harmonicity:12,modulationIndex:20,resonance:800,octaves:1.5}];customElements.define("tone-metal-synth",class extends H{constructor(){super(),this.label="MetalSynth",this.presets=JSON.stringify(G)}renderAttributes(){return i.b`
			<tone-slider 
				label="Harmonicity"
				attribute="harmonicity"
				min="0.5"
				max="20"
				value="1"></tone-slider>
			<tone-slider 
				label="Modulation Index"
				attribute="modulationIndex"
				min="0.5"
				max="40"
				value="1"></tone-slider>
			<tone-slider 
				label="Resonance"
				attribute="resonance"
				min="100"
				max="8000"
				exp="2"
				value="4000"></tone-slider>
			<tone-slider 
				label="Octaves"
				attribute="octaves"
				min="0.5"
				max="4"
				value="1.5"></tone-slider>
			<tone-envelope 
				component="envelope" 
				collapsed 
				label="Envelope"></tone-envelope>
		`}});const U=[{pitchDecay:.0033411764705882354,octaves:.8300000000000001,oscillator:{frequency:440,detune:0,phase:0,type:"fmsine",modulationIndex:.1,modulationType:"sawtooth",harmonicity:.44,volume:0,mute:!1},envelope:{attack:6e-4,decay:.25,sustain:0,release:1.4,attackCurve:"exponential",decayCurve:"exponential",releaseCurve:"exponential"}},{pitchDecay:.008,octaves:2,oscillator:{type:"sine",frequency:440,detune:0,phase:0,partialCount:0,volume:0,mute:!1},envelope:{attack:6e-4,decay:.5,sustain:0,release:1.4,attackCurve:"exponential",decayCurve:"exponential",releaseCurve:"exponential"}},{pitchDecay:.019729411764705884,octaves:4.845,oscillator:{frequency:440,detune:0,phase:0,spread:80.4,count:3,type:"fatsine",partialCount:0,volume:0,mute:!1},envelope:{attack:.011560784313725491,decay:.22226666666666667,sustain:0,release:1.4,attackCurve:"sine",decayCurve:"exponential",releaseCurve:"exponential"}}];customElements.define("tone-membrane-synth",class extends H{constructor(){super(),this.label="MembraneSynth",this.presets=JSON.stringify(U)}renderAttributes(){return i.b`
			<tone-slider 
				label="Pitch Decay"
				attribute="pitchDecay"
				min="0.001"
				max="0.2"
				exp="2"
				value="0.01"></tone-slider>
			<tone-slider 
				label="Octaves"
				attribute="octaves"
				min="0.5"
				max="6"
				value="1.5"></tone-slider>
			<tone-oscillator 
				omni
				component="oscillator" 
				collapsed 
				label="Oscillator"></tone-oscillator>
			<tone-envelope 
				component="envelope" 
				collapsed 
				label="Envelope"></tone-envelope>
		`}});customElements.define("tone-noise-synth",class extends H{constructor(){super(),this.label="NoiseSynth"}renderAttributes(){return i.b`
			<tone-noise 
				label="Noise"
				collapsed
				component="noise"></tone-noise>
			<tone-envelope 
				component="envelope" 
				collapsed 
				label="Envelope"></tone-envelope>
		`}});const W=[{harmonicity:1,modulationIndex:20.848,portamento:.024,oscillator:{type:"sawtooth9",frequency:440,detune:0,phase:0,partialCount:9},envelope:{attack:.012926470588235294,decay:.05975,sustain:.16,release:.18211764705882355,attackCurve:"exponential",decayCurve:"exponential",releaseCurve:"exponential"},modulation:{type:"custom",frequency:440,detune:0,phase:0,partials:[.8105694691387023,0,.0900632743487447,0,.03242277876554809,0,.016542234064055146,0,.010007030483193857,0,.00669892123255126,0,.004796269048158,0,.6,0,.0028047386475387615,.4727272727272728,.002245344789857901,0,.0018380260071172384,0,.0015322674274833694,0,.0012969111506219236,.8727272727272728,.0011118922759104286,0,.0009638162534348421,0,.0008434645880735718,0],partialCount:32},modulationEnvelope:{attack:.012926470588235294,decay:.08784411764705882,sustain:0,release:.08627941176470588,attackCurve:"exponential",decayCurve:"exponential",releaseCurve:"cosine"}},{harmonicity:1.515,modulationIndex:6.483999999999999,detune:0,oscillator:{type:"sawtooth3",frequency:440,detune:0,phase:0,partialCount:3,volume:0,mute:!1},envelope:{attack:.010585294117647059,decay:.27689411764705885,sustain:0,release:.7328941176470589,attackCurve:"linear",decayCurve:"exponential",releaseCurve:"exponential"},modulation:{type:"square",frequency:440,detune:0,phase:0,partialCount:0,volume:0,mute:!1},modulationEnvelope:{attack:.01,decay:.05975,sustain:0,release:.13635,attackCurve:"exponential",decayCurve:"exponential",releaseCurve:"exponential"},portamento:0},{harmonicity:1.655,modulationIndex:40,detune:0,oscillator:{type:"square",frequency:440,detune:0,phase:0,partialCount:0,volume:0,mute:!1},envelope:{attack:.09584313725490196,decay:.13174117647058822,sustain:.25,release:.5,attackCurve:"exponential",decayCurve:"exponential",releaseCurve:"exponential"},modulation:{type:"triangle",frequency:440,detune:0,phase:0,partialCount:0,volume:0,mute:!1},modulationEnvelope:{attack:.0427764705882353,decay:.8596519607843138,sustain:.08,release:3.392894117647059,attackCurve:"linear",decayCurve:"exponential",releaseCurve:"exponential"},portamento:.15899999999999997}];customElements.define("tone-fm-synth",class extends H{constructor(){super(),this.label="FMSynth",this.presets=JSON.stringify(W)}renderAttributes(){return i.b`
			<tone-slider 
				label="Portamento"
				attribute="portamento"
				min="0"
				max="0.3"
				value="0"></tone-slider>
			<tone-slider 
				label="Harmonicity"
				attribute="harmonicity"
				min="0.5"
				max="4"
				value="1"></tone-slider>
			<tone-slider 
				label="Modulation Index"
				attribute="modulationIndex"
				min="0.1"
				max="40"
				value="1"></tone-slider>
			<tone-envelope 
				component="envelope"
				collapsed 
				label="Carrier Envelope"></tone-envelope>
			<tone-oscillator 
				omni
				component="oscillator"
				collapsed label="Carrier Oscillator"></tone-oscillator>
			<tone-envelope 
				component="modulationEnvelope"
				collapsed 
				label="Modulation Envelope"></tone-envelope>
			<tone-oscillator 
				component="modulation"
				collapsed label="Modulation Oscillator"></tone-oscillator>
		`}});const Y=[{harmonicity:3.51,detune:0,oscillator:{type:"sawtooth",frequency:440,detune:0,phase:0,partialCount:0,volume:0,mute:!1},envelope:{attack:.01682843137254902,decay:.2,sustain:.3,release:.3,attackCurve:"linear",decayCurve:"exponential",releaseCurve:"exponential"},modulation:{type:"sine",frequency:440,detune:0,phase:0,partialCount:0,volume:0,mute:!1},modulationEnvelope:{attack:.6661147058823529,decay:1.1665411764705882,sustain:1,release:2.151691176470588,attackCurve:"linear",decayCurve:"exponential",releaseCurve:"exponential"},portamento:0},{harmonicity:2.88,detune:0,oscillator:{frequency:440,detune:0,phase:0,width:0,volume:0,mute:!1,type:"pulse"},envelope:{attack:.20958529411764706,decay:1.9219607843137254,sustain:.08,release:1.5132911764705883,attackCurve:"exponential",decayCurve:"linear",releaseCurve:"exponential"},modulation:{type:"square",frequency:440,detune:0,phase:0,partialCount:0,volume:0,mute:!1},modulationEnvelope:{attack:.01682843137254902,decay:1.1665411764705882,sustain:1,release:2.151691176470588,attackCurve:"linear",decayCurve:"exponential",releaseCurve:"exponential"},portamento:0},{harmonicity:2.355,detune:0,oscillator:{type:"sawtooth",frequency:440,detune:0,phase:0,partialCount:0,volume:0,mute:!1},envelope:{attack:.19729411764705884,decay:1.1072313725490197,sustain:.3,release:2.8358588235294118,attackCurve:"linear",decayCurve:"exponential",releaseCurve:"exponential"},modulation:{type:"triangle",frequency:440,detune:0,phase:0,partialCount:0,volume:0,mute:!1},modulationEnvelope:{attack:.09584313725490196,decay:1.1665411764705882,sustain:1,release:2.151691176470588,attackCurve:"linear",decayCurve:"exponential",releaseCurve:"exponential"},portamento:0}];customElements.define("tone-am-synth",class extends H{constructor(){super(),this.label="AMSynth",this.presets=JSON.stringify(Y)}renderAttributes(){return i.b`
			<tone-slider 
				label="Portamento"
				attribute="portamento"
				min="0"
				max="0.3"
				value="0"></tone-slider>
			<tone-slider 
				label="Harmonicity"
				attribute="harmonicity"
				min="0.5"
				max="4"
				value="1"></tone-slider>
			<tone-envelope 
				component="envelope"
				collapsed 
				label="Carrier Envelope"></tone-envelope>
			<tone-oscillator 
				omni
				component="oscillator"
				collapsed label="Carrier Oscillator"></tone-oscillator>
			<tone-envelope 
				component="modulationEnvelope"
				collapsed 
				label="Modulation Envelope"></tone-envelope>
			<tone-oscillator 
				component="modulation"
				collapsed label="Modulation Oscillator"></tone-oscillator>
		`}});customElements.define("tone-sampler",class extends H{constructor(){super(),this.label="Sampler"}renderAttributes(){return i.b`
			<tone-slider 
				label="Attack"
				attribute="attack"
				min="0"
				max="0.3"
				value="0"></tone-slider>
			<tone-slider 
				label="Release"
				attribute="release"
				min="0"
				max="1.5"
				value="0.1"></tone-slider>
			<tone-select-attribute 
				attribute="curve"
				label="Curve">
				<option value="linear">linear</option>
				<option value="exponential">exponential</option>
				</tone-select-attribute>
		`}});customElements.define("tone-duo-synth",class extends H{constructor(){super(),this.label="MembraneSynth"}renderAttributes(){return i.b`
			<tone-slider 
				label="Vibrato Rate"
				attribute="vibratoRate"
				min="0.1"
				max="5"
				units="hz"
				value="1"></tone-slider>
			<tone-slider 
				label="Vibrato Amount"
				attribute="vibratoAmount"
				min="0"
				max="1"
				value="1"></tone-slider>
			<tone-slider 
				label="Harmonicity"
				attribute="harmonicity"
				min="0.5"
				max="4"
				value="1"></tone-slider>
			<tone-mono-synth 
				component="voice0" 
				collapsed 
				nopresets
				label="Voice 0"></tone-mono-synth>
			<tone-mono-synth 
				component="voice1" 
				collapsed 
				nopresets
				label="Voice 1"></tone-mono-synth>
		`}});customElements.define("tone-filter-viz",class extends D.a{constructor(){super(),this.min=0,this.max=2.5,this.alt="filter response curve"}drawBackground(t,e,n){t.fillStyle="rgba(255, 255, 255, 0.3)",t.fillRect(0,.6*n,e,3),t.fill()}async visualize(t){this.buffer=t.getFrequencyResponse().map(t=>Math.pow(t,.5)),this.requestUpdate()}});customElements.define("tone-filter",class extends o.a{static get properties(){return{label:{type:String},frequency:{type:Boolean}}}constructor(){super(),this.label="Filter"}render(){return i.b`
			<style>
				#top.viz {
					position: absolute;
					top: 9px;
					right: 20px;
					width: 50px;
				}
				tone-rack:not([collapsed]) #top.viz{
					display: none;
				}
				#bottom.viz {
					position: relative;
					display: block;
					width: calc(100% - 20px);
					height: 60px;
					background-color: black;
					border-radius: 10px;
					padding: 10px;
					margin-top: 20px;
				}
				tone-slider {
					display: block;
					margin-top: 10px;
				}
				tone-select-attribute {
					display: block;
					margin-top: 5px;
				}
			</style>
			<tone-rack 
				@collapse=${t=>this.collapsed=t.detail}
				?collapsed=${this.collapsed} label="${this.label}">
				<tone-filter-viz class="viz" slot="top" id="top"></tone-filter-viz>
				<tone-filter-viz class="viz" id="bottom" color="white"></tone-filter-viz>
				<tone-select-attribute 
					label="Type"
					attribute="type">
						<option value="lowpass">lowpass</option>
						<option value="highpass">highpass</option>
						<option value="bandpass">bandpass</option>
						<option value="lowshelf">lowshelf</option>
						<option value="highshelf">highshelf</option>
						<option value="peaking">peaking</option>
						<option value="notch">notch</option>
						<option value="allpass">allpass</option>
				</tone-select-attribute>
				<tone-select-attribute 
					label="Rolloff"
					attribute="rolloff">
					<option value="-12">-12</option>
					<option value="-24">-24</option>
					<option value="-48">-48</option>
					<option value="-96">-96</option>
				</tone-select-attribute>
				${this.frequency?i.b`
					<tone-slider attribute="frequency"
						value="5000"
						min="20"
						max="20000"
						exp="2"
						units="hz"
						label="Frequency"
						></tone-slider>
				`:i.b``}
				<tone-slider attribute="Q"
					value="1"
					min="0"
					max="10"
					label="Q"
					></tone-slider>
				<tone-slider attribute="gain"
					value="0"
					min="-20"
					max="3"
					units="dB"
					label="Gain"
					></tone-slider>
			</tone-rack>
		`}});customElements.define("tone-volume-slider",class extends i.a{static get properties(){return{value:{type:Number},attribute:{type:String}}}constructor(){super(),this.value=0}sync(t){this.shadowRoot.querySelector("tone-slider").sync(t)}render(){return i.b`
			<style>
				:host {
					--computed-slider-height : var(--slider-height, 100px);
					display: inline-block;
				}
				#slider-container {
					height: var(--computed-slider-height);
					width: 40px;
					display: block;
					margin: 0 auto;
					position: relative;					
				}
				tone-slider {
					position: absolute;
					left: 0px;
					top: 0px;
					width: var(--computed-slider-height);
					transform: rotate(-90deg) translate(-100%, 0);
					transform-origin: top left;
				}

				#number {
					margin-top: 10px;
					width: 100%;
					text-align: center;
					font-family: monospace;
					font-size: 12px;
				}

				#container {
					position: relative;
				}

			</style>
			<div id="container">
				<div id="slider-container">
					<tone-slider 
						default="0"
						attribute=${this.attribute}
						max="6"
						min="-80"
						exp="0.4"
						.value="${this.value}"
						@change=${t=>this.value=t.detail}
						bare></tone-slider>
				</div>
				<div id="number">${this.value>=0?"+":""}${this.value.toFixed(0)} db</div>
			</div>
		`}});customElements.define("tone-channel",class extends o.a{static get properties(){return{label:{type:String},solo:{type:Boolean},mute:{type:Boolean},muted:{type:Boolean}}}bind(t){this.shadowRoot.querySelector("tone-meter").bind(t),this.addEventListener("mute",e=>{t.mute=e.detail}),this.addEventListener("solo",e=>{t.solo=e.detail}),setInterval(()=>{this.muted=t.muted},100),super.bind(t)}updated(t){super.updated(t),t.has("solo")&&this.dispatchEvent(new CustomEvent("solo",{detail:this.solo,composed:!0,bubbles:!0})),t.has("mute")&&this.dispatchEvent(new CustomEvent("mute",{detail:this.mute,composed:!0,bubbles:!0}))}render(){return i.b`
			<style>
				:host {
					display: inline-block;
				}
				h2 {
					text-align: center;
					font-family: var(--label-font-family);
					font-size: var(--label-font-size);
					font-weight: normal;
					margin: 0;
					padding: 0;
					padding-bottom: 5px;
				}
				tone-volume-slider, tone-slider {
					display: block;
				}
				#volume {
					padding: 10px;
					position: relative;
				    background-color: var(--color-light-gray);
				}
				#volume tone-volume-slider {
					z-index: 1;
					position: relative;
				}
				#volume tone-meter {
					pointer-events: none;
					z-index: 0;
					position: absolute;
					top: 0px;
					left: 0px;
					width: 100%;
					height: calc(100% - 25px);
					background-color: var(--color-light-gray)
				}
				#container {
					border: 2px solid black;
					border-radius: 10px;
					padding: 10px;
				}
				tone-meter {
					position: absolute;
				}

				#buttons {
					margin-top: 10px;
					display: flex;
				}

				button {
					flex-grow: 1;
					display: inline-block;
					margin: 0 2px;
					border: 2px solid black;
					outline-color: var(--outline-color);
					-webkit-appearance: none;
					padding: 0px 5px;
					height: 20px;
					border-radius: 12px;
					width: 40%;
				}

				button.enabled {
					color: white;
				}

				button#solo.enabled {
					background-color: #149df1;
				}
				button#mute.enabled {
					background-color: #ff672a;
				}
				button[disabled] {
					opacity: 0.5;
					background-color: #ff672a;
					color: white;
				}
			</style>
			<div id="container">
				<h2>${this.label}</h2>
				<div id="volume">
					<tone-meter stereo></tone-meter>
					<tone-volume-slider
						attribute="volume">
					</tone-volume-slider>
				</div>
				<tone-slider
					bare
					min="-1"
					max="1"
					default="0"
					value="0"
					anchor="center"
					attribute="pan">
				</tone-slider>
				<div id="buttons">
					<button id="solo" aria-checked=${this.solo} 
						@click=${t=>this.solo=!this.solo}
						class=${this.solo?"enabled":""}>
						solo</button>
					<button id="mute" aria-checked=${this.mute}
						?disabled=${this.muted&&!this.mute}
						class="${this.mute?"enabled":""}"
						@click=${t=>this.mute=!this.mute}>
					mute</button>
				</div>
			</div>
		`}});customElements.define("tone-transport",class extends o.a{static get properties(){return{controls:{type:Boolean},position:{type:Boolean}}}constructor(){super(),this.collapsed=!0}bind(t){super.bind(t),this.shadowRoot.querySelector("tone-play-toggle").bind(t),setInterval(()=>{this.shadowRoot.querySelector("#position").textContent=t.position},100)}render(){return i.b`
			<style>
				:host {
					display: block;
				}
				#container {
					background-color: var(--color-light-gray);
					padding: 5px;
				}
				tone-play-toggle {
					width: 50%;
				}
				#top {
					position: relative;
				}
				#top tone-play-toggle {
					width: 60%;
				}
				#top #position {
					background-color: white;
					padding: 5px;
					position: absolute;
					width: 30%;
					right: 8px;
					transform: translate(0%, -50%);
					text-align: center;
					top: 50%;
					font-family: monospace;
				}
				tone-rack {
					margin-top: 10px;
				}

				tone-slider, tone-toggle {
					display: block;
					margin-top: 10px;
				}
				tone-slider {
					width: 80%;
					margin: 10px auto 0;
				}
				#tempo {
					width: calc(100% - 10px);
				}
			</style>
			<div id="container">
				<div id="top">
					<tone-play-toggle></tone-play-toggle>
					<div id="position">0:0:0</div>
				</div>
				<tone-slider
					id="tempo"
					min="60"
					max="240"
					label="Tempo"
					exp="2"
					units="bpm"
					attribute="bpm">
				</tone-slider>
				${this.controls?i.b`
					<tone-rack square label="Transport Settings" ?collapsed=${this.collapsed}>
						<tone-toggle
							label="Loop"
							attribute="loop">
						</tone-toggle>
						<tone-slider
							min="0"
							max="10"
							label="Loop Start"
							attribute="loopStart">
						</tone-slider>
						<tone-slider
							min="0"
							max="10"
							label="Loop End"
							attribute="loopEnd">
						</tone-slider>
					</tone-rack>
				`:i.b``}
			</div>
		`}});customElements.define("tone-compressor",class extends o.a{static get properties(){return{label:{type:String}}}constructor(){super(),this.label="Compressor",this.collapsed=!1}renderAttributes(){return i.b``}render(){return i.b`
			<style>
				#top.viz {
					position: absolute;
					top: 9px;
					right: 20px;
					width: 50px;
				}
				#bottom.viz {
					position: relative;
					display: block;
					width: calc(100% - 20px);
					height: 60px;
					background-color: black;
					border-radius: 10px;
					padding: 10px;
					margin-top: 20px;
				}
				tone-rack:not([collapsed]) #top.viz{
					display: none;
				}
				tone-slider {
					display: block;
					margin-top: 10px;
				}
				
			</style>
			<tone-rack 
				@collapse=${t=>this.collapsed=t.detail}
				?collapsed=${this.collapsed} label="${this.label}">
				
				<tone-slider 
					attribute="attack"
					min="0.001" 
					max="1" 
					value="0.1" 
					label="Attack">
				</tone-slider>
				<tone-slider 
					attribute="release"
					min="0.001" 
					max="1" 
					value="0.1" 
					label="Release">
				</tone-slider>
				<tone-slider 
					attribute="threshold"
					min="-60" 
					max="0" 
					value="-12" 
					exp="0.5"
					label="Threshold">
				</tone-slider>
				<tone-slider 
					attribute="ratio"
					min="1" 
					max="20" 
					value="4" 
					label="Ratio">
				</tone-slider>
				<tone-slider 
					attribute="knee"
					min="0" 
					max="40" 
					value="30" 
					label="Knee">
				</tone-slider>
			</tone-rack>
		`}});const K=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`,J=(i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`,i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`);customElements.define("tone-unmute",class extends o.a{static get properties(){return{suspended:{type:Boolean},muted:{type:Boolean},focused:{type:Boolean},novolume:{type:Boolean}}}constructor(){super(),this.suspended=!0,this.muted=!1,this.focused=!1,setInterval(()=>{this.suspended="suspended"===Tone.context.state},100)}updated(t){if(t.has("muted")){Tone.Master.mute=this.muted;const t=this.shadowRoot.querySelector("#volume");this.novolume||this.muted||t.min!=t.value||(t.value=0)}}_clicked(t){k(),"suspended"!==Tone.context.state&&(this.muted=!this.muted)}_adjustVolume(t){t.detail===t.target.min?this.muted=!0:this.muted=!1,Tone.Master.volume.value=t.detail}render(){return i.b`
			<style>
				:host {
					display: block;
					position: fixed;
					top: 10px;
					right: 10px;
				}

				#container {
					position: absolute;
					width: 44px;
					height: 44px;
					right: 0px;
					top: 0px;
					border-radius: 24px;
					border: 2px solid black;
					background-color: white;
					overflow: hidden;
					transition: width 0.2s;
					box-shadow: var(--shadow-medium);
				}

				#container:hover:not([novolume]), #container[focused]:not([novolume]) {
					width: 144px;
				}

				#container:hover tone-slider, #container[focused] tone-slider {
					opacity: 1;
					width: 80px;
				}

				tone-slider {
					position: absolute;
					left: 16px;
					top: 2px;
					width: 0px;
					opacity: 0;
					transition: width 0.2s, opacity 0.2s;;
				}

				#speaker {
					position: absolute;
					top: 10px;
					right: 10px;
					background-color: transparent;
					outline-color: var(--outline-color);
					border: none;
					-webkit-appearance: none;
					height: 24px;
					width: 24px;
					padding: 0px;
					cursor: pointer;
				}

				#speaker svg {
					width: 100%;
					height: 100%;
				}

			</style>
			<div id="container" ?focused=${this.focused} ?novolume=${this.novolume}>
				<button 
					@blur=${t=>this.focused=!1}
					@focus=${t=>this.focused=!0}
					@click=${this._clicked.bind(this)}
					id="speaker" aria-label="speaker" aria-checked=${this.suspended}>
					${this.suspended||this.muted?K:J}
				</button>

				${this.novolume?i.b``:i.b`
					<tone-slider 
						@blur=${t=>this.focused=!1}
						@focus=${t=>this.focused=!0}
						id="volume"
						@change=${this._adjustVolume.bind(this)}
						bare min="-60" max="0" value="0"></tone-slider>`}
				
			</div>
		`}});customElements.define("tone-top-bar",class extends i.a{constructor(){super()}updated(){const t=this.shadowRoot.querySelector("canvas");t.width=2*t.clientWidth,t.width=2*t.clientHeight;const{width:e,height:n}=t,i=t.getContext("2d"),o=function(t){const e=new Array(t),n=new Array(t),i=new Array(t),o=new Array(t),r=[e,i,o,n];for(let n=0;n<t;n++)e[n]=Math.sin(2*Math.PI*n/t);for(let e=0;e<t;e++)i[e]=(e+t/2)%t/t*2-1;for(let e=0;e<t;e++)o[e]=e<t/3?e/(t/3)*2-1:e<2*t/3?2*(1-(e-t/3)/(t/3))-1:(e-2*t/3)/(t/3)*2-1;for(let e=0;e<t;e++){const i=t/16;n[e]=e<i?-1:e<t/2?1:e<t-i?-1:1}return r[Math.floor(Math.random()*r.length)]}(e+1);i.beginPath(),o.forEach((t,e)=>{const o=Math.scale(t,-1,1,.25*n,.75*n);0===e?i.moveTo(e,o):i.lineTo(e,o)}),i.lineTo(e,n),i.lineTo(0,n),i.fillStyle="#22DBC0",i.fill()}render(){return i.b`
			<style>

				:host {
					display: block;
					height: 44px;
					width: 100%;
				}

				#container {
					background-color: black;
					width: 100%;
					height: 100%;
				}

				#logo {
					color: white;
					font-family: 'Roboto Mono', monospace;
					font-size: 20px;
					line-height: 44px;
					margin-left: 60px;
					position: relative;
					display: inline-block;
				}

				#logo #text {
					display: inline-block;
					position: relative;
				}

				#logo canvas {
					position: absolute;
					right: -1px;
					background-color: #F734D7;
					height: 26px;
					width: 26px;
					top: 10px;
				}

				tone-unmute {
					position: fixed;
					top: 6px;
					right: 6px;
					z-index: 1000;
				}

			</style>
			<tone-unmute></tone-unmute>
			<div id="container">
				<a id="logo" href="https://tonejs.github.io">
					<canvas></canvas>
					<div id="text">Tone.js</div>
				</a>
			</div>
		`}});customElements.define("tone-content",class extends i.a{render(){return i.b`
			<style>

				:host {
					display: block;
					width: 100%;
				}
				#content {
					width: 80%;
					min-width: 320px;
					max-width: 600px;
					margin: 40px auto 60px;
				}

			</style>
			<div id="content">
				<slot></slot>
			</div>
		`}});const X=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`,Q=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;customElements.define("tone-drawer",class extends i.a{static get properties(){return{collapsed:{type:Boolean},label:{type:String}}}constructor(){super(),this.collapsed=window.innerHeight<700,this.label="Components"}updated(t){if(t.has("collapsed")&&!this.collapsed){const t=t=>{t.dispatchEvent(new CustomEvent("collapse",{detail:this.collapsed,composed:!0,bubbles:!0}))};Array.from(this.children).forEach(e=>{e.assignedNodes?Array.from(e.assignedNodes()).forEach(e=>t(e)):t(e),e.dispatchEvent(new CustomEvent("collapse",{detail:this.collapsed,composed:!0,bubbles:!0}))}),window.dispatchEvent(new CustomEvent("resize"))}}render(){return i.b`
			<style>

				:host {
					display: block;
					width: 100%;
					max-height: 100%;
					position: fixed;
					bottom: 0px;
					left: 0px;
					overflow-y: auto;
					background-color: white;
					z-index: 100;
				}

				button {
					padding: 0px;
					width: calc(100% - 24px);
					-webkit-appearance: none;
					background-color: white;
					border: none;
					outline-color: var(--outline-color);
					margin-left: 12px;
					margin-top: 8px;
				}

				button svg {
					width: 24px;
					float: left;
					height: 100%;
				}

				#content {
					width: 100%;
					display: block;
					border-top: 2px solid black;
					box-shadow: var(--shadow-high);
					position: relative;
					z-index: 10000;
				}

				#content[collapsed]{
					height: 40px;
					overflow: hidden;
				}

				#slots {
					padding: 0 10px 10px 10px;
					width: calc(100% - 20px);
					display: block;
				}

				h2 {
					font-weight: normal;
					font-family: var(--label-font-family);
					font-size: var(--label-font-size);
					display: inline-block;
					position: absolute;
					margin: 0px;
					top: 12px;
					left: 50px;
					pointer-events: none;
				}

				::slotted(*) {
					margin-top: 10px;
					display: block;
				}

			</style>
			<div id="content" ?collapsed=${this.collapsed}>
				<button 
					aria-label="expand"
					aria-checked=${this.collapsed}
					@click=${()=>this.collapsed=!this.collapsed}>
					${this.collapsed?Q:X}
				</button>
				<h2>${this.label}</h2>
				<div id="slots">
					${this.collapsed?i.b``:i.b`<slot></slot>`}
				</div>
			</div>
		`}});customElements.define("tone-explanation",class extends i.a{static get properties(){return{label:{type:String}}}constructor(){super()}render(){return i.b`
			<style>

				:host {
					display: block;
					width: 100%;
					margin-top: 8px;
					box-shadow: var(--shadow-low);
					background-color: var(--color-light-gray);
					margin-bottom: 30px;
				}

				#container {
					width: 100%;
					height: auto;
				}

				#title {
					width: calc(100% - 20px);
					padding: 5px;
					margin: 5px;
					font-family: var(--title-font-family);
					font-size: var(--title-font-size);
					font-weight: normal;
					border-bottom: 2px solid black;
				}

				#body {
					min-height: 20px;
					padding: 10px;
				}

				::slotted(text){
					font-family: var(--body-font-family);
					font-size: var(--body-font-size);
				}

				::slotted(code){
					font-family: monospace;
				}

				::slotted(a){
					color: var(--color-magenta);
				}

			</style>
			<div id="container">
				<h2 id="title">${this.label}</h2>
				<div id="body">
					<slot></slot>
				</div>
			</div>
		`}});customElements.define("tone-loader",class extends i.a{static get properties(){return{loaded:{type:Boolean},progress:{type:Number}}}constructor(){super(),this.progress=0,this.loaded=!1,Tone.Buffer.on("progress",t=>{this.progress=t}),Tone.loaded().then(()=>{this.loaded=!0,setTimeout(()=>{this.remove()},500)})}render(){return i.b`
			<style>
				#container {
					position: fixed;
					top: 0px;
					left: 0px;
					bottom: 0px;
					right: 0px;
					z-index: 100000;
					background-color: rgba(0, 0, 0, 0.5);
					opacity: 1;
					transition: opacity 0.3s;
				}

				#container.loaded {
					opacity: 0;
					pointer-events: none;
				}

				#loader {
					width: 200px;
					height: 10px;
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					background-color: white;
					padding: 2px;
				}

				#bar {
					background-color: black;
					width: 0%;
					height: 100%;
					transition: width 0.1s;
				}

			</style>
			<div id="container" class=${this.loaded?"loaded":""}>
				<div id="loader" 
					role="progressbar" 
					aria-valuenow=${this.progress} 
					aria-valuemin="0" aria-valuemax="100">
						<div id="bar" style="width: ${(100*this.progress).toString()}%"></div>
				</div>
			</div>
		`}});const Z=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`,tt=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>`;customElements.define("tone-side-panel",class extends i.a{static get properties(){return{collapsed:{type:Boolean}}}constructor(){super(),this.collapsed=!0,this.examples={},this.fetchExamples()}async fetchExamples(){try{const t=await fetch("./js/ExampleList.json");this.examples=await t.json(),this.requestUpdate()}catch(t){console.log("could not load example list")}}updated(t){t.has("collapsed")&&this.dispatchEvent(new CustomEvent("collapse",{detail:this.collapsed,composed:!0}))}render(){const t=0===Object.keys(this.examples).length;return i.b`
			<style>
				:host {
					display: inline-block;
					position: relative;
				}

				#container {
					width: var(--side-panel-width);
					height: 100%;
					left: 0px;
					top: 0px;
					position: absolute;
					background-color: black;
					transition: width var(--side-panel-transition), box-shadow var(--side-panel-transition);
					box-shadow: var(--shadow-high);
					overflow: auto;
					overflow-x: hidden;
					color: white;
				}

				#content {
					min-width: 200px;
				}

				h2, h3 {
					background-color: black;
					color: white;
					font-family: var(--label-font-family);
					font-size: var(--label-font-size);
					margin: 0px auto;
				}

				h2 {
					font-size: var(--title-font-size);
					margin: 20px 10px;
				}

				h3 {
					width: 90%;
					padding: 2px 5px;
					font-weight: bold;
					border-bottom: 2px solid white;
				}

				ul {
					padding: 0px 5px 10px;
					margin: 5px;
				}

				li {
					list-style-type: none;
					margin: 0px;
					padding: 0px;
					font-family: var(--label-font-family);
					font-size: var(--label-font-size);
				}

				li a {
					color: white;
					text-decoration: none;
				}

				#close {
					position: absolute;
					right: 5px;
					top: 12px;
					background-color: transparent;
					border: none;
					outline-color: var(--outline-color);
					-webkit-appearance: none;
					transition: right var(--side-panel-transition);
				}

				#close svg {
					fill: white;
				}

				[collapsed] #close {
					right: -48px;
				}

				#container[collapsed]{
					overflow: visible;
					box-shadow: none;
				}

				#loading {
					margin-left: 20px;
				}

			</style>
			<div id="container" ?collapsed=${this.collapsed}>
				<button id="close" 
					@click=${()=>this.collapsed=!this.collapsed}
					aria-label="close">${this.collapsed?tt:Z}</button>
				<div id="content">
				${this.collapsed?i.b``:i.b`
					<h2>Examples</h2>
					<div id="loading">${t?"Loading...":""}</div>
					${Object.entries(this.examples).map(([t,e])=>i.b`
						<h3>${t}</h3>
						<ul>
							${Object.entries(e).map(([t,e])=>i.b`
								<li><a href="${e}.html">${t}</a></li>
							`)}
						</ul>
					`)}
				`}
				</div>
			</div>
		`}});customElements.define("tone-example",class extends i.a{static get properties(){return{collapsed:{type:Boolean},open:{type:Boolean}}}constructor(){super(),this.collapsed=!0}updated(t){t.has("open")&&(this.collapsed=!this.open)}render(){return i.b`
			<style>
				:host {
					display: inline-block;
					--top-bar-height: 44px;
				}

				#container {
					position: absolute;
					top: 0px;
					left: 0px;
					width: 100%;
					height: 100%;
				}

				#container[collapsed]{
					--side-panel-width : 0px;
				}

				#container[collapsed] tone-side-panel {
					position: absolute;
				}

				tone-side-panel {
					position: fixed;
					height: 100%;
					top: 0px;
					z-index: 2;
					transition: all var(--side-panel-transition);
					// top: var(--top-bar-height);
					// height: calc(100% - var(--top-bar-height));
				}

				tone-top-bar {
					width: 100%;
					right: 0px;
				}

				#main {
					--margin: 4px;
					transition: width var(--side-panel-transition);
					display: inline-block;
					width: calc(100% - var(--side-panel-width) - var(--margin) * 2);
					right: var(--margin);
					top: var(--margin);
					position: absolute;
				}

				::slotted(tone-drawer){
					width: calc(100% - var(--side-panel-width));
					transition: width var(--side-panel-transition);
					right: 0px;
					left: unset;
				}

				@media only screen and (max-width: 700px) {
					#main {
						width: calc(100% - var(--margin) * 2);
					}
				}
			</style>
			<div id="container" ?collapsed=${this.collapsed}>
				<tone-side-panel
					?collapsed=${this.collapsed}
					@collapse=${t=>this.collapsed=t.detail}
					></tone-side-panel>
				<div id="main">
					<tone-top-bar></tone-top-bar>
					<slot></slot>
				</div>
			</div>
		`}});customElements.define("tone-waveform",class extends i.a{constructor(){super(),this._waveform=function(t){const e=new Array(t),n=new Array(t),i=new Array(t),o=new Array(t),r=[e,i,o,n];for(let n=0;n<t;n++)e[n]=Math.sin(2*Math.PI*n/t);for(let e=0;e<t;e++)i[e]=(e+t/2)%t/t*2-1;for(let e=0;e<t;e++)o[e]=e<t/3?e/(t/3)*2-1:e<2*t/3?2*(1-(e-t/3)/(t/3))-1:(e-2*t/3)/(t/3)*2-1;for(let e=0;e<t;e++){var s=t/16;n[e]=e<s?-1:e<t/2?1:e<t-s?-1:1}return{sawtooth:i,sine:e,triangle:o,square:n,random:r[Math.floor(Math.random()*r.length)]}}(512).random,this._analyser=new Tone.Waveform(512),this._signal=(new Tone.Zero).connect(this._analyser),this._silentThresh=.001,this._rms=0}firstUpdated(){super.firstUpdated(),this._loop()}bind(t){t.connect(this._analyser)}_loop(){requestAnimationFrame(this._loop.bind(this));const t=this.shadowRoot.querySelector("canvas"),e=this.shadowRoot.querySelector("#container"),n=t.getContext("2d");t.width=2*e.clientWidth,t.height=2*e.clientHeight;const i=this._analyser.getValue();this._isSilent(i)?this._drawAnalysis(this._waveform,!0,n):this._drawAnalysis(i,!1,n)}_isSilent(t){let e=0;for(let n=0;n<t.length;n++)e+=Math.pow(t[n],2);const n=Math.sqrt(e/t.length);return this._rms=Math.max(n,.9*this._rms),this._rms<this._silentThresh}_drawAnalysis(t,e,n){const{width:i,height:o}=n.canvas;let r,s=.2*o;e&&(s=Math.scale(this._rms,0,this._silentThresh,.2*o,.5*o)),n.clearRect(0,0,i,o),n.beginPath();for(let e=0,a=t.length;e<a;e++){const l=Math.scale(e,0,a-1,0,i),c=Math.scale(t[e],-1,1,o-s,s);0===e?(r=c,n.moveTo(l,c)):n.lineTo(l,c)}n.lineTo(i,o),n.lineTo(0,o),n.lineTo(0,r),n.lineCap="round",n.fillStyle="#22DBC0",n.fill()}render(){return i.b`
			<style>

				:host, #container, canvas {
					width: 100%;
					height: 100%;
					position: absolute;
					top: 0px;
					left: 0px;
				}

				#container {
					background-color: var(--color-magenta);
				}

			</style>
			<div id="container">
				<canvas></canvas>
			</div>
		`}});const et=i.b`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;customElements.define("tone-start-context",class extends i.a{static get properties(){return{running:{type:Boolean},disabled:{type:Boolean}}}constructor(){super(),this.running=!1}firstUpdated(){const t=setInterval(()=>{this.running="running"===Tone.context.state,this.running&&clearInterval(t)},100)}async _clicked(t){await k(),this.running="running"===Tone.context.state}render(){return i.b`
			<style>
				:host {
					display: block;
					position: fixed;
					top: 10px;
					right: 10px;
				}

				#container {
					position: absolute;
					width: 44px;
					height: 44px;
					right: 0px;
					top: 0px;
					opacity: 1;
					transition: opacity 0.2s;
				}

				#container[running]{
					opacity: 0;
					pointer-events: none;
				}

				button {
					box-sizing: border-box;
					width: 100%;
					height: 44px;
					outline-color: var(--outline-color);
					border: 2px solid black;
					border-radius: 22px;
					padding: 0px;
					font-size: 30px;
					text-align: center;
					cursor: pointer;
					transition: box-shadow 0.1s;
					box-shadow: var(--shadow-low);
				}

				button:hover, button:focus {
					box-shadow: var(--shadow-medium);
				}

				button svg {
					margin-top: 4px;
					width: 30px;
					height: 30px;
				}

			</style>
			<div id="container" ?running=${this.running}>
				<button 
					@click=${this._clicked.bind(this)}
					aria-label="Start">
					${et}
				</button>
			</div>
		`}});customElements.define("tone-demo",class extends i.a{static get properties(){return{autoplay:{type:Boolean}}}firstUpdated(){super.firstUpdated(),this.shadowRoot.querySelector("tone-waveform").bind(Tone.Master)}render(){return i.b`
			<style>

				:host, #container, tone-waveform {
					width: 100%;
					height: 100%;
					position: absolute;
					top: 0px;
					left: 0px;
				}

				tone-waveform {
					z-index: 0;
				}

				#content {
					position: relative;
					width: 80%;
					min-width: 200px;
					max-width: 400px;
					margin: 40px auto 0px;
					z-index: 1;
				}

				tone-unmute {
					z-index: 10;
				}

				::slotted(tone-trigger), ::slotted(tone-button), ::slotted(tone-play-toggle), ::slotted(tone-slider){
					width: 100%;
					display: block;
					margin-bottom: 10px;
				}

				::slotted(*){
					font-family: var(--title-font-family);
					font-size: var(--title-font-size);
				}

				tone-start-context {
					position: fixed;
					top: 10px;
					right: 10px;
				}

			</style>
			<div id="container">
				<tone-waveform></tone-waveform>
				${this.autoplay?i.b`<tone-start-context></tone-start-context>`:i.b``}
				<div id="content">
					<slot></slot>
				</div>
			</div>
		`}});customElements.define("tone-fft",class extends i.a{constructor(){super(),this._fft=new Tone.FFT(256)}bind(t){t.connect(this._fft),this._canvas=this.shadowRoot.querySelector("canvas"),this._canvas.width=2*this._canvas.clientWidth,this._canvas.height=2*this._canvas.clientHeight,this._context=this._canvas.getContext("2d"),this.loop(),window.addEventListener("resize",()=>{this._canvas.width=2*this._canvas.clientWidth,this._canvas.height=2*this._canvas.clientHeight})}loop(){requestAnimationFrame(this.loop.bind(this));const t=this._fft.getValue(),e=this._canvas.width,n=this._canvas.height;this._context.clearRect(0,0,e,n),this._context.fillStyle="white",t.forEach((i,o)=>{const r=Math.scale(o,0,t.length,0,e),s=Math.clamp(Math.scale(i,-100,0,0,n),0,n);this._context.fillRect(r,n/2-s/2,2,s),this._context.fill()})}render(){return i.b`
			<style>
				:host {
					display: inline-block;
					width: 45px;
					height: 24px;
					border-radius: 15px;
					padding: 4px;
					box-sizing: border-box;
					background-color: #aaa;
					overflow: hidden;
				}
				canvas {
					width: 100%;
					height: 100%;
				}
			</style>
			<canvas>
				waveform of current playing audio
			</canvas>
		`}});customElements.define("tone-loop",class extends i.a{static get properties(){return{color:{type:String}}}constructor(){super(),this.color="#777"}bind(t){this._canvas=this.shadowRoot.querySelector("canvas"),this._canvas.width=2*this._canvas.clientWidth,this._canvas.height=2*this._canvas.clientHeight,this._context=this._canvas.getContext("2d"),this.loop(t),window.addEventListener("resize",()=>{this._canvas.width=2*this._canvas.clientWidth,this._canvas.height=2*this._canvas.clientHeight})}loop(t){requestAnimationFrame(this.loop.bind(this,t));const{width:e,height:n}=this._canvas,i=this._context;i.clearRect(0,0,e,n),i.fillStyle="#eee";const o=Math.min(e,n);i.arc(e/2,n/2,o/2,0,2*Math.PI,!1),i.fill();const r=t.progress;i.beginPath(),i.fillStyle=this.color,i.moveTo(e/2,n/2);const s=Math.PI/2;i.arc(e/2,n/2,o/2,-s,r*Math.PI*2-s,!1),i.fill()}render(){return i.b`
			<style>
				:host {
					display: inline-block;
					width: 45px;
					height: 24px;
					border-radius: 4px;
					padding: 4px;
					box-sizing: border-box;
					overflow: hidden;
				}
				#container {
					width: 100%;
					height: 100%;
					display: inline-block;
				}
				canvas {
					width: 100%;
					height: 100%;
				}
			</style>
			<div id="container">
				<canvas class=${this.level?"hasLevel":""}>
					audio meter level
				</canvas>
			</div>
		`}});class nt extends H{constructor(){super(),this.effect=!0}}customElements.define("tone-effect",nt);customElements.define("tone-chorus",class extends nt{constructor(){super(),this.label="Chorus"}renderAttributes(){return i.b`
			<tone-slider 
				label="Frequency"
				attribute="frequency"
				min="0.1"
				max="4"
				units="hz"
				value="1"></tone-slider>
			<tone-slider 
				label="Delay Time"
				attribute="delayTime"
				min="0.1"
				exp="2"
				max="20"
				units="ms"
				value="1"></tone-slider>
			<tone-slider 
				label="Spread"
				attribute="spread"
				min="0"
				max="360"
				units="deg"
				value="1"></tone-slider>
			<tone-slider 
				label="Depth"
				attribute="depth"
				min="0"
				max="1"
				value="0.5"></tone-slider>
			<tone-oscillator-type
				attribute="type"
				label="Type"
				nocustom
				></tone-oscillator-type>
		`}});customElements.define("tone-chebyshev",class extends nt{constructor(){super(),this.label="Chebyshev"}renderAttributes(){return i.b`
			<tone-slider 
				label="Order"
				attribute="order"
				min="1"
				integer
				max="100"
				value="1"></tone-slider>
		`}});customElements.define("tone-freeverb",class extends nt{constructor(){super(),this.label="Freeverb"}renderAttributes(){return i.b`
			<tone-slider 
				label="Room Size"
				attribute="roomSize"
				min="0.1"
				max="0.95"
				value="1"></tone-slider>
			<tone-slider 
				label="Dampening"
				attribute="dampening"
				min="100"
				max="5000"
				exp="2"
				units="hz"
				value="2000"></tone-slider>
		`}});customElements.define("tone-tremolo",class extends nt{constructor(){super(),this.label="Tremolo"}renderAttributes(){return i.b`
			<tone-slider 
				label="Frequency"
				attribute="frequency"
				min="0.1"
				max="20"
				units="hz"
				value="1"></tone-slider>
			<tone-slider 
				label="Spread"
				attribute="spread"
				min="0"
				max="360"
				units="deg"
				value="1"></tone-slider>
			<tone-slider 
				label="Depth"
				attribute="depth"
				min="0"
				max="1"
				value="0.5"></tone-slider>
			<tone-oscillator-type
				attribute="type"
				label="Type"
				nocustom
				></tone-oscillator-type>
		`}});customElements.define("tone-auto-filter",class extends nt{constructor(){super(),this.label="AutoFilter"}renderAttributes(){return i.b`
			<tone-slider 
				label="Frequency"
				attribute="frequency"
				min="0.1"
				max="20"
				units="hz"
				value="1"></tone-slider>
			<tone-slider 
				label="Base Frequency"
				attribute="baseFrequency"
				min="20"
				max="4000"
				units="hz"
				value="200"></tone-slider>
			<tone-slider 
				label="Octaves"
				attribute="octaves"
				min="0.5"
				max="5"
				value="2.5"></tone-slider>
			<tone-slider 
				label="Depth"
				attribute="depth"
				min="0"
				max="1"
				value="0.5"></tone-slider>
			<tone-oscillator-type
				attribute="type"
				label="Type"
				nocustom></tone-oscillator-type>
			<tone-filter
				collapsed
				component="filter"
				label="Filter"></tone-filter>
		`}});customElements.define("tone-auto-panner",class extends nt{constructor(){super(),this.label="AutoPanner"}renderAttributes(){return i.b`
			<tone-slider 
				label="Frequency"
				attribute="frequency"
				min="0.1"
				max="20"
				units="hz"
				value="1"></tone-slider>
			<tone-slider 
				label="Depth"
				attribute="depth"
				min="0"
				max="1"
				value="0.5"></tone-slider>
			<tone-oscillator-type
				attribute="type"
				label="Type"
				nocustom></tone-oscillator-type>
		`}});customElements.define("tone-ping-pong-delay",class extends nt{constructor(){super(),this.label="PingPongDelay"}renderAttributes(){return i.b`
			<tone-slider 
				label="Delay Time"
				attribute="delayTime"
				min="0.01"
				max="1"
				value="0.25"></tone-slider>
			<tone-slider 
				label="Feedback"
				attribute="feedback"
				min="0"
				max="0.95"
				value="0.5"></tone-slider>
		`}});customElements.define("tone-reverb",class extends nt{static get properties(){return{generating:{type:Boolean}}}constructor(){super(),this.label="Reverb",this.generating=!1}bind(t){super.bind(t),this.generate(t);let e=-1;this.addEventListener("change",()=>{this.generating=!0,clearTimeout(e),e=setTimeout(()=>{this.generate(t)},100)})}async generate(t){this.generating=!0,await t.generate(),this.generating=!1}renderAttributes(){return i.b`
			${this.generating?i.b`
					<div style="position: absolute; top: 2px; left: 110px; color: var(--color-dark-gray);"
						id="#generating">Generating...</div>
				`:i.b``}
			<tone-slider 
				label="Decay"
				attribute="decay"
				min="0.1"
				max="4"
				value="1"></tone-slider>
			<tone-slider 
				label="Predelay"
				attribute="preDelay"
				min="0.001"
				max="0.1"
				value="0"></tone-slider>
		`}});customElements.define("tone-distortion",class extends nt{constructor(){super(),this.label="Distortion"}renderAttributes(){return i.b`
			<tone-slider 
				label="Distortion"
				attribute="distortion"
				min="0"
				max="1"
				value="1"></tone-slider>
		`}})}]);
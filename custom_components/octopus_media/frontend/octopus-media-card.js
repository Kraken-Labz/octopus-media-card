const re = globalThis, we = re.ShadowRoot && (re.ShadyCSS === void 0 || re.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, xe = /* @__PURE__ */ Symbol(), Oe = /* @__PURE__ */ new WeakMap();
let Je = class {
  constructor(e, i, s) {
    if (this._$cssResult$ = !0, s !== xe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = i;
  }
  get styleSheet() {
    let e = this.o;
    const i = this.t;
    if (we && e === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (e = Oe.get(i)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && Oe.set(i, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ut = (t) => new Je(typeof t == "string" ? t : t + "", void 0, xe), k = (t, ...e) => {
  const i = t.length === 1 ? t[0] : e.reduce((s, r, o) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[o + 1], t[0]);
  return new Je(i, t, xe);
}, gt = (t, e) => {
  if (we) t.adoptedStyleSheets = e.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of e) {
    const s = document.createElement("style"), r = re.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = i.cssText, t.appendChild(s);
  }
}, Re = we ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let i = "";
  for (const s of e.cssRules) i += s.cssText;
  return ut(i);
})(t) : t;
const { is: ft, defineProperty: mt, getOwnPropertyDescriptor: bt, getOwnPropertyNames: yt, getOwnPropertySymbols: vt, getPrototypeOf: wt } = Object, de = globalThis, Me = de.trustedTypes, xt = Me ? Me.emptyScript : "", $t = de.reactiveElementPolyfillSupport, Y = (t, e) => t, oe = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? xt : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let i = t;
  switch (e) {
    case Boolean:
      i = t !== null;
      break;
    case Number:
      i = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(t);
      } catch {
        i = null;
      }
  }
  return i;
} }, $e = (t, e) => !ft(t, e), ze = { attribute: !0, type: String, converter: oe, reflect: !1, useDefault: !1, hasChanged: $e };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), de.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let H = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, i = ze) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(e, i), !i.noAccessor) {
      const s = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(e, s, i);
      r !== void 0 && mt(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, i, s) {
    const { get: r, set: o } = bt(this.prototype, e) ?? { get() {
      return this[i];
    }, set(a) {
      this[i] = a;
    } };
    return { get: r, set(a) {
      const c = r?.call(this);
      o?.call(this, a), this.requestUpdate(e, c, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ze;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Y("elementProperties"))) return;
    const e = wt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Y("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Y("properties"))) {
      const i = this.properties, s = [...yt(i), ...vt(i)];
      for (const r of s) this.createProperty(r, i[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const i = litPropertyMetadata.get(e);
      if (i !== void 0) for (const [s, r] of i) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, s] of this.elementProperties) {
      const r = this._$Eu(i, s);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const i = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const r of s) i.unshift(Re(r));
    } else e !== void 0 && i.push(Re(e));
    return i;
  }
  static _$Eu(e, i) {
    const s = i.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const s of i.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return gt(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, i, s) {
    this._$AK(e, s);
  }
  _$ET(e, i) {
    const s = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, s);
    if (r !== void 0 && s.reflect === !0) {
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : oe).toAttribute(i, s.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, i) {
    const s = this.constructor, r = s._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = s.getPropertyOptions(r), a = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : oe;
      this._$Em = r;
      const c = a.fromAttribute(i, o.type);
      this[r] = c ?? this._$Ej?.get(r) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, i, s, r = !1, o) {
    if (e !== void 0) {
      const a = this.constructor;
      if (r === !1 && (o = this[e]), s ??= a.getPropertyOptions(e), !((s.hasChanged ?? $e)(o, i) || s.useDefault && s.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, s)))) return;
      this.C(e, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, i, { useDefault: s, reflect: r, wrapped: o }, a) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? i ?? this[e]), o !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (i = void 0), this._$AL.set(e, i)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, o] of this._$Ep) this[r] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, o] of s) {
        const { wrapped: a } = o, c = this[r];
        a !== !0 || this._$AL.has(r) || c === void 0 || this.C(r, void 0, o, c);
      }
    }
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(i);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
H.elementStyles = [], H.shadowRootOptions = { mode: "open" }, H[Y("elementProperties")] = /* @__PURE__ */ new Map(), H[Y("finalized")] = /* @__PURE__ */ new Map(), $t?.({ ReactiveElement: H }), (de.reactiveElementVersions ??= []).push("2.1.2");
const _e = globalThis, Ne = (t) => t, ae = _e.trustedTypes, Fe = ae ? ae.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Qe = "$lit$", M = `lit$${Math.random().toFixed(9).slice(2)}$`, Xe = "?" + M, _t = `<${Xe}>`, B = document, Z = () => B.createComment(""), K = (t) => t === null || typeof t != "object" && typeof t != "function", Se = Array.isArray, St = (t) => Se(t) || typeof t?.[Symbol.iterator] == "function", fe = `[ 	
\f\r]`, V = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, De = /-->/g, Be = />/g, z = RegExp(`>|${fe}(?:([^\\s"'>=/]+)(${fe}*=${fe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), He = /'/g, je = /"/g, et = /^(?:script|style|textarea|title)$/i, At = (t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }), n = At(1), j = /* @__PURE__ */ Symbol.for("lit-noChange"), p = /* @__PURE__ */ Symbol.for("lit-nothing"), Ue = /* @__PURE__ */ new WeakMap(), F = B.createTreeWalker(B, 129);
function tt(t, e) {
  if (!Se(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Fe !== void 0 ? Fe.createHTML(e) : e;
}
const kt = (t, e) => {
  const i = t.length - 1, s = [];
  let r, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = V;
  for (let c = 0; c < i; c++) {
    const l = t[c];
    let h, u, g = -1, w = 0;
    for (; w < l.length && (a.lastIndex = w, u = a.exec(l), u !== null); ) w = a.lastIndex, a === V ? u[1] === "!--" ? a = De : u[1] !== void 0 ? a = Be : u[2] !== void 0 ? (et.test(u[2]) && (r = RegExp("</" + u[2], "g")), a = z) : u[3] !== void 0 && (a = z) : a === z ? u[0] === ">" ? (a = r ?? V, g = -1) : u[1] === void 0 ? g = -2 : (g = a.lastIndex - u[2].length, h = u[1], a = u[3] === void 0 ? z : u[3] === '"' ? je : He) : a === je || a === He ? a = z : a === De || a === Be ? a = V : (a = z, r = void 0);
    const m = a === z && t[c + 1].startsWith("/>") ? " " : "";
    o += a === V ? l + _t : g >= 0 ? (s.push(h), l.slice(0, g) + Qe + l.slice(g) + M + m) : l + M + (g === -2 ? c : m);
  }
  return [tt(t, o + (t[i] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class J {
  constructor({ strings: e, _$litType$: i }, s) {
    let r;
    this.parts = [];
    let o = 0, a = 0;
    const c = e.length - 1, l = this.parts, [h, u] = kt(e, i);
    if (this.el = J.createElement(h, s), F.currentNode = this.el.content, i === 2 || i === 3) {
      const g = this.el.content.firstChild;
      g.replaceWith(...g.childNodes);
    }
    for (; (r = F.nextNode()) !== null && l.length < c; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const g of r.getAttributeNames()) if (g.endsWith(Qe)) {
          const w = u[a++], m = r.getAttribute(g).split(M), $ = /([.?@])?(.*)/.exec(w);
          l.push({ type: 1, index: o, name: $[2], strings: m, ctor: $[1] === "." ? Ct : $[1] === "?" ? Et : $[1] === "@" ? It : he }), r.removeAttribute(g);
        } else g.startsWith(M) && (l.push({ type: 6, index: o }), r.removeAttribute(g));
        if (et.test(r.tagName)) {
          const g = r.textContent.split(M), w = g.length - 1;
          if (w > 0) {
            r.textContent = ae ? ae.emptyScript : "";
            for (let m = 0; m < w; m++) r.append(g[m], Z()), F.nextNode(), l.push({ type: 2, index: ++o });
            r.append(g[w], Z());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Xe) l.push({ type: 2, index: o });
      else {
        let g = -1;
        for (; (g = r.data.indexOf(M, g + 1)) !== -1; ) l.push({ type: 7, index: o }), g += M.length - 1;
      }
      o++;
    }
  }
  static createElement(e, i) {
    const s = B.createElement("template");
    return s.innerHTML = e, s;
  }
}
function U(t, e, i = t, s) {
  if (e === j) return e;
  let r = s !== void 0 ? i._$Co?.[s] : i._$Cl;
  const o = K(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(t), r._$AT(t, i, s)), s !== void 0 ? (i._$Co ??= [])[s] = r : i._$Cl = r), r !== void 0 && (e = U(t, r._$AS(t, e.values), r, s)), e;
}
class Pt {
  constructor(e, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: i }, parts: s } = this._$AD, r = (e?.creationScope ?? B).importNode(i, !0);
    F.currentNode = r;
    let o = F.nextNode(), a = 0, c = 0, l = s[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let h;
        l.type === 2 ? h = new ee(o, o.nextSibling, this, e) : l.type === 1 ? h = new l.ctor(o, l.name, l.strings, this, e) : l.type === 6 && (h = new Tt(o, this, e)), this._$AV.push(h), l = s[++c];
      }
      a !== l?.index && (o = F.nextNode(), a++);
    }
    return F.currentNode = B, r;
  }
  p(e) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, i), i += s.strings.length - 2) : s._$AI(e[i])), i++;
  }
}
class ee {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, i, s, r) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = e, this._$AB = i, this._$AM = s, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && e?.nodeType === 11 && (e = i.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, i = this) {
    e = U(this, e, i), K(e) ? e === p || e == null || e === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : e !== this._$AH && e !== j && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : St(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== p && K(this._$AH) ? this._$AA.nextSibling.data = e : this.T(B.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: i, _$litType$: s } = e, r = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = J.createElement(tt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === r) this._$AH.p(i);
    else {
      const o = new Pt(r, this), a = o.u(this.options);
      o.p(i), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let i = Ue.get(e.strings);
    return i === void 0 && Ue.set(e.strings, i = new J(e)), i;
  }
  k(e) {
    Se(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, r = 0;
    for (const o of e) r === i.length ? i.push(s = new ee(this.O(Z()), this.O(Z()), this, this.options)) : s = i[r], s._$AI(o), r++;
    r < i.length && (this._$AR(s && s._$AB.nextSibling, r), i.length = r);
  }
  _$AR(e = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); e !== this._$AB; ) {
      const s = Ne(e).nextSibling;
      Ne(e).remove(), e = s;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class he {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, i, s, r, o) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = e, this.name = i, this._$AM = r, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = p;
  }
  _$AI(e, i = this, s, r) {
    const o = this.strings;
    let a = !1;
    if (o === void 0) e = U(this, e, i, 0), a = !K(e) || e !== this._$AH && e !== j, a && (this._$AH = e);
    else {
      const c = e;
      let l, h;
      for (e = o[0], l = 0; l < o.length - 1; l++) h = U(this, c[s + l], i, l), h === j && (h = this._$AH[l]), a ||= !K(h) || h !== this._$AH[l], h === p ? e = p : e !== p && (e += (h ?? "") + o[l + 1]), this._$AH[l] = h;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ct extends he {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === p ? void 0 : e;
  }
}
class Et extends he {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== p);
  }
}
class It extends he {
  constructor(e, i, s, r, o) {
    super(e, i, s, r, o), this.type = 5;
  }
  _$AI(e, i = this) {
    if ((e = U(this, e, i, 0) ?? p) === j) return;
    const s = this._$AH, r = e === p && s !== p || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, o = e !== p && (s === p || r);
    r && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Tt {
  constructor(e, i, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    U(this, e);
  }
}
const Ot = _e.litHtmlPolyfillSupport;
Ot?.(J, ee), (_e.litHtmlVersions ??= []).push("3.3.3");
const Rt = (t, e, i) => {
  const s = i?.renderBefore ?? e;
  let r = s._$litPart$;
  if (r === void 0) {
    const o = i?.renderBefore ?? null;
    s._$litPart$ = r = new ee(e.insertBefore(Z(), o), o, void 0, i ?? {});
  }
  return r._$AI(t), r;
};
const Ae = globalThis;
class x extends H {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Rt(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return j;
  }
}
x._$litElement$ = !0, x.finalized = !0, Ae.litElementHydrateSupport?.({ LitElement: x });
const Mt = Ae.litElementPolyfillSupport;
Mt?.({ LitElement: x });
(Ae.litElementVersions ??= []).push("4.2.2");
const P = (t) => (e, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
const zt = { attribute: !0, type: String, converter: oe, reflect: !1, hasChanged: $e }, Nt = (t = zt, e, i) => {
  const { kind: s, metadata: r } = i;
  let o = globalThis.litPropertyMetadata.get(r);
  if (o === void 0 && globalThis.litPropertyMetadata.set(r, o = /* @__PURE__ */ new Map()), s === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(i.name, t), s === "accessor") {
    const { name: a } = i;
    return { set(c) {
      const l = e.get.call(this);
      e.set.call(this, c), this.requestUpdate(a, l, t, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(a, void 0, t, c), c;
    } };
  }
  if (s === "setter") {
    const { name: a } = i;
    return function(c) {
      const l = this[a];
      e.call(this, c), this.requestUpdate(a, l, t, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function d(t) {
  return (e, i) => typeof i == "object" ? Nt(t, e, i) : ((s, r, o) => {
    const a = r.hasOwnProperty(o);
    return r.constructor.createProperty(o, s), a ? Object.getOwnPropertyDescriptor(r, o) : void 0;
  })(t, e, i);
}
function v(t) {
  return d({ ...t, state: !0, attribute: !1 });
}
const Ft = (t, e, i) => (i.configurable = !0, i.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, i), i);
function Dt(t, e) {
  return (i, s, r) => {
    const o = (a) => a.renderRoot?.querySelector(t) ?? null;
    return Ft(i, s, { get() {
      return o(this);
    } });
  };
}
async function Bt(t) {
  return (await t.connection.sendMessagePromise({
    type: "octopus_media/get_entries"
  })).entries;
}
function Ht(t, e, i) {
  return t.connection.subscribeMessage((s) => i(s.snapshot), {
    type: "octopus_media/subscribe_snapshot",
    entry_id: e
  });
}
var jt = Object.defineProperty, Ut = Object.getOwnPropertyDescriptor, it = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ut(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && jt(e, i, r), r;
};
let ne = class extends x {
  constructor() {
    super(...arguments), this.message = "No media to display";
  }
  render() {
    return n`<div role="status">
      <span class="mark" aria-hidden="true"><ha-icon icon="mdi:octopus"></ha-icon></span>
      <strong>${this.message}</strong>
      <small>Octopus Media</small>
    </div>`;
  }
};
ne.styles = k`
    div {
      align-items: center;
      color: var(--octopus-media-muted, #8fa4ad);
      display: flex;
      flex-direction: column;
      background: radial-gradient(
        circle at center,
        color-mix(in srgb, var(--octopus-accent, #8b5cf6) 13%, transparent),
        transparent 58%
      );
      border-radius: var(--octopus-radius-poster, 12px);
      gap: 5px;
      justify-content: center;
      min-height: 96px;
      text-align: center;
    }
    .mark {
      align-items: center;
      background: color-mix(in srgb, var(--octopus-accent, #8b5cf6) 15%, transparent);
      border: 1px solid color-mix(in srgb, var(--octopus-accent, #8b5cf6) 32%, transparent);
      border-radius: 999px;
      color: var(--octopus-accent, #8b5cf6);
      display: flex;
      height: 38px;
      justify-content: center;
      margin-bottom: 3px;
      width: 38px;
    }
    ha-icon {
      height: 20px;
      width: 20px;
    }
    strong {
      color: var(--octopus-text, #f3f6fb);
      font-size: 12px;
      font-weight: 550;
    }
    small {
      color: var(--octopus-muted, #8795a8);
      font-size: 9px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  `;
it([
  d({ type: String })
], ne.prototype, "message", 2);
ne = it([
  P("octopus-empty-state")
], ne);
var Lt = Object.defineProperty, Wt = Object.getOwnPropertyDescriptor, st = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Wt(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Lt(e, i, r), r;
};
let le = class extends x {
  constructor() {
    super(...arguments), this.message = "Unable to load media";
  }
  render() {
    return n`<div role="alert"><span aria-hidden="true">!</span>${this.message}</div>`;
  }
};
le.styles = k`
    div {
      align-items: center;
      color: #ffb8b8;
      display: flex;
      gap: 10px;
      justify-content: center;
      min-height: 96px;
      text-align: center;
    }
    span {
      align-items: center;
      border: 1px solid #ff7b7b;
      border-radius: 50%;
      display: inline-flex;
      height: 28px;
      justify-content: center;
      width: 28px;
    }
  `;
st([
  d({ type: String })
], le.prototype, "message", 2);
le = st([
  P("octopus-error-state")
], le);
const Vt = [
  "poster-small",
  "poster-medium",
  "poster-large",
  "backdrop-small",
  "backdrop-medium"
], N = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 360"><rect width="240" height="360" fill="#101820"/><path d="M76 166h88v64H76z" fill="none" stroke="#3dd6c6" stroke-width="6"/><circle cx="120" cy="126" r="32" fill="none" stroke="#3dd6c6" stroke-width="6"/><path d="m92 222 28-28 28 28" fill="none" stroke="#3dd6c6" stroke-width="6"/></svg>'
), Le = 300, qt = 3e4;
function Gt(t) {
  return Vt.includes(t);
}
function Yt(t) {
  return /^image_[A-Za-z0-9_-]{32}$/.test(t);
}
function We(t, e, i) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(t) || !Yt(e))
    throw new Error("invalid_image_request");
  if (!Gt(i)) throw new Error("invalid_image_variant");
  return `/api/octopus_media/image/${encodeURIComponent(t)}/${e}/${i}`;
}
class Zt {
  constructor(e, i = Date.now) {
    this.connection = e, this.now = i, this.cache = /* @__PURE__ */ new Map(), this.inflight = /* @__PURE__ */ new Map();
  }
  resolve(e) {
    const i = We(e.entryId, e.imageRef, e.variant), s = this.cache.get(i);
    if (s && s.expiresAt - qt > this.now())
      return Promise.resolve(s.path);
    const r = this.inflight.get(i);
    if (r) return r;
    const o = this.sign(i).finally(() => this.inflight.delete(i));
    return this.inflight.set(i, o), o;
  }
  invalidate(e) {
    this.cache.delete(We(e.entryId, e.imageRef, e.variant));
  }
  release() {
  }
  async sign(e) {
    const i = await this.connection.sendMessagePromise({
      type: "auth/sign_path",
      path: e,
      expires: Le
    });
    if (typeof i.path != "string" || !i.path.startsWith(`${e}?`) || i.path.includes("://"))
      throw new Error("invalid_signed_path");
    return this.cache.set(e, {
      expiresAt: this.now() + Le * 1e3,
      path: i.path
    }), i.path;
  }
}
const Ve = /* @__PURE__ */ new WeakMap();
function qe(t) {
  const e = t.connection;
  let i = Ve.get(e);
  return i || (i = new Zt(t.connection), Ve.set(e, i)), i;
}
var Kt = Object.defineProperty, Jt = Object.getOwnPropertyDescriptor, R = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Jt(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Kt(e, i, r), r;
};
let I = class extends x {
  constructor() {
    super(...arguments), this.entryId = "", this.variant = "poster-medium", this.alt = "", this.backdrop = !1, this.imageUrl = N, this.imageState = "idle", this.nearViewport = !1, this.generation = 0, this.renewalAttempts = 0, this.onLoad = () => {
      this.imageUrl !== N && (this.imageState = "loaded", this.dispatchEvent(
        new CustomEvent("octopus-image-ready", {
          bubbles: !0,
          composed: !0,
          detail: { imageRef: this.imageRef }
        })
      ));
    }, this.onError = () => {
      this.handleImageError();
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.armObserver();
  }
  disconnectedCallback() {
    this.generation += 1, this.observer?.disconnect(), this.observer = void 0, this.retryTimer !== void 0 && window.clearTimeout(this.retryTimer), this.retryTimer = void 0, super.disconnectedCallback();
  }
  updated(t) {
    (t.has("imageRef") || t.has("entryId") || t.has("variant") || t.has("hass")) && this.resetImage();
  }
  render() {
    return n`<img
      src=${this.imageUrl}
      alt=${this.alt}
      data-state=${this.imageState}
      loading="lazy"
      decoding="async"
      @load=${this.onLoad}
      @error=${this.onError}
    />`;
  }
  armObserver() {
    if (!(this.observer || !this.isConnected)) {
      if (typeof IntersectionObserver > "u") {
        this.nearViewport = !0, this.loadSignedPath();
        return;
      }
      this.observer = new IntersectionObserver(
        (t) => {
          t.some((e) => e.isIntersecting || e.intersectionRatio > 0) && (this.nearViewport = !0, this.observer?.disconnect(), this.observer = void 0, this.loadSignedPath());
        },
        { rootMargin: "180px 180px", threshold: 0.01 }
      ), this.observer.observe(this);
    }
  }
  resetImage() {
    this.generation += 1, this.renewalAttempts = 0, this.imageUrl = N, this.imageState = "idle", this.retryTimer !== void 0 && window.clearTimeout(this.retryTimer), this.retryTimer = void 0, this.nearViewport && this.loadSignedPath();
  }
  request() {
    if (!(!this.hass || !this.imageRef || !this.entryId))
      return { entryId: this.entryId, imageRef: this.imageRef, variant: this.variant };
  }
  async loadSignedPath() {
    const t = this.hass, e = this.request();
    if (!e || !t) {
      this.imageState = "missing";
      return;
    }
    const i = this.generation;
    this.imageState = "loading";
    try {
      const s = await qe(t).resolve(e);
      i === this.generation && (this.imageUrl = s);
    } catch {
      if (i !== this.generation) return;
      this.imageState = "temporary", this.imageUrl = N, this.scheduleBackoffRetry();
    }
  }
  async handleImageError() {
    const t = this.request();
    if (!t || !this.hass) {
      this.imageState = "missing", this.imageUrl = N;
      return;
    }
    if (this.renewalAttempts === 0) {
      this.renewalAttempts = 1, qe(this.hass).invalidate(t), this.imageUrl = N, await this.updateComplete, await this.loadSignedPath();
      return;
    }
    this.imageState = "missing", this.imageUrl = N;
  }
  scheduleBackoffRetry() {
    this.renewalAttempts > 0 || this.retryTimer !== void 0 || (this.renewalAttempts = 1, this.retryTimer = window.setTimeout(() => {
      this.retryTimer = void 0, this.loadSignedPath();
    }, 5e3));
  }
};
I.styles = k`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
    img {
      display: block;
      height: 100%;
      object-fit: cover;
      opacity: 1;
      transition: opacity 160ms ease;
      width: 100%;
    }
    img[data-state="idle"],
    img[data-state="loading"] {
      opacity: 0.72;
    }
    @media (prefers-reduced-motion: reduce) {
      img {
        transition: none;
      }
    }
  `;
R([
  d({ attribute: !1 })
], I.prototype, "hass", 2);
R([
  d({ type: String })
], I.prototype, "entryId", 2);
R([
  d({ type: String })
], I.prototype, "imageRef", 2);
R([
  d({ type: String })
], I.prototype, "variant", 2);
R([
  d({ type: String })
], I.prototype, "alt", 2);
R([
  d({ type: Boolean })
], I.prototype, "backdrop", 2);
R([
  v()
], I.prototype, "imageUrl", 2);
R([
  v()
], I.prototype, "imageState", 2);
I = R([
  P("octopus-media-image")
], I);
var Qt = Object.defineProperty, Xt = Object.getOwnPropertyDescriptor, rt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Xt(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Qt(e, i, r), r;
};
let ce = class extends x {
  constructor() {
    super(...arguments), this.message = "Loading media";
  }
  render() {
    return n`<div role="status" aria-live="polite"><span></span>${this.message}</div>`;
  }
};
ce.styles = k`
    div {
      align-items: center;
      color: var(--octopus-media-muted, #8fa4ad);
      display: flex;
      gap: 10px;
      justify-content: center;
      min-height: 96px;
    }
    span {
      animation: pulse 1s ease-in-out infinite alternate;
      background: var(--octopus-media-accent, #3dd6c6);
      border-radius: 50%;
      height: 10px;
      width: 10px;
    }
    @keyframes pulse {
      to {
        opacity: 0.3;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      span {
        animation: none;
      }
    }
  `;
rt([
  d({ type: String })
], ce.prototype, "message", 2);
ce = rt([
  P("octopus-loading-state")
], ce);
const ye = ["recent", "upcoming", "playing", "carousel"], ot = ["auto", "strip", "grid", "hero", "compact", "portrait", "list"], ei = ["auto", "midnight", "ocean", "jellyfin", "neutral"], at = [
  "cinematic-overlay",
  "gallery-clean",
  "octopus-glass",
  "cinematic-octopus-gallery",
  "playing-hero-cinematic"
], ve = "select_entry", E = {
  type: "custom:octopus-media-card",
  entry_id: ve,
  mode: "recent",
  layout: "auto",
  height: "auto",
  sections: ["recent", "upcoming", "playing"],
  item_count: 12,
  posters_visible: "auto",
  density: "auto",
  header_alignment: "start",
  theme: "midnight",
  visual_concept: "cinematic-overlay",
  title_position: "overlay",
  autoplay: !1,
  cycle_interval: 10,
  show_arrows: !0,
  show_indicators: !0,
  show_titles: !0,
  show_dates: !0,
  show_ratings: !0,
  show_badges: !0,
  show_device: !0,
  show_user: !0,
  show_progress: !0,
  show_time: !0,
  thumbnail_size: "medium"
}, q = (t, e) => typeof t == "string" && e.includes(t), me = (t, e, i, s) => {
  if (t === void 0) return e;
  if (!Number.isInteger(t) || Number(t) < i || Number(t) > s)
    throw new Error(`Expected an integer between ${String(i)} and ${String(s)}`);
  return Number(t);
};
function nt(t) {
  if (typeof t != "object" || t === null)
    throw new Error("Card configuration must be an object");
  const e = t;
  if (e.type !== "custom:octopus-media-card")
    throw new Error("Invalid card type");
  if (typeof e.entry_id != "string" || e.entry_id.trim() === "")
    throw new Error("entry_id is required");
  if (e.mode !== void 0 && !q(e.mode, ye))
    throw new Error("Invalid mode");
  if (e.layout !== void 0 && !q(e.layout, ot))
    throw new Error("Invalid layout");
  if (e.visual_concept !== void 0 && !q(e.visual_concept, at))
    throw new Error("Invalid visual concept");
  if (e.title_position !== void 0 && !q(e.title_position, ["overlay", "below"]))
    throw new Error("Invalid title position");
  const i = e.height ?? E.height;
  if (i !== "auto" && (!Number.isFinite(i) || Number(i) < 80))
    throw new Error("height must be auto or at least 80 pixels");
  const s = Array.isArray(e.sections) ? e.sections.filter(
    (r) => q(r, ["recent", "upcoming", "playing"])
  ) : E.sections;
  return {
    ...E,
    ...e,
    type: "custom:octopus-media-card",
    entry_id: e.entry_id.trim(),
    mode: e.mode ?? E.mode,
    layout: e.layout ?? E.layout,
    height: i,
    sections: s.length > 0 ? [...s] : [...E.sections],
    item_count: me(e.item_count, E.item_count, 1, 50),
    cycle_interval: me(e.cycle_interval, E.cycle_interval, 5, 3600),
    posters_visible: e.posters_visible === void 0 || e.posters_visible === "auto" ? "auto" : me(e.posters_visible, 3, 1, 5)
  };
}
const D = [280, 450, 700, 1e3], Ge = 12, Ye = ["xs", "sm", "md", "lg", "xl"];
function ti(t) {
  return t < D[0] ? "xs" : t < D[1] ? "sm" : t < D[2] ? "md" : t < D[3] ? "lg" : "xl";
}
function ii(t, e) {
  if (!e) return ti(t);
  let i = Ye.indexOf(e);
  for (; i < D.length && t >= (D[i] ?? Number.POSITIVE_INFINITY) + Ge; )
    i += 1;
  for (; i > 0 && t < (D[i - 1] ?? Number.NEGATIVE_INFINITY) - Ge; )
    i -= 1;
  return Ye[i] ?? "xl";
}
function si(t, e, i) {
  return e === "xs" ? t === "playing" ? "list" : "compact" : e === "sm" ? t === "playing" ? i >= 200 ? "hero" : "compact" : "strip" : e === "md" ? t === "playing" ? i >= 200 ? "hero" : "list" : "strip" : t === "playing" ? "hero" : i >= 360 ? "grid" : "strip";
}
class ri {
  update(e, i, s) {
    return this.bucket = ii(i, this.bucket), si(e, this.bucket, s);
  }
  get currentBucket() {
    return this.bucket;
  }
}
const oi = ({ entryId: t, hass: e, items: i, width: s }) => {
  const r = i.slice(0, 3);
  return n`
    <div class="layout compact" data-layout="compact">
      ${r.map(
    (o, a) => n`
          <article
            class=${`compact-item ${a === 0 ? "featured" : ""}`}
            aria-label=${o.title}
          >
            <octopus-media-image
              .hass=${e}
              .entryId=${t}
              .imageRef=${o.poster_ref}
              .variant=${s < 420 ? "poster-small" : "poster-medium"}
              .alt=${o.title}
            ></octopus-media-image>
            <div class="compact-overlay">
              <strong title=${o.title}>${o.title}</strong>
              ${a === 0 && o.subtitle ? n`<span>${o.subtitle}</span>` : ""}
            </div>
          </article>
        `
  )}
    </div>
  `;
}, ai = {
  recent: "Recently added",
  upcoming: "Upcoming",
  playing: "Playing now",
  playingEyebrow: "Now playing",
  carousel: "Media",
  loading: "Loading media",
  empty: "No media to display",
  upcomingEmpty: "Nothing scheduled for now",
  noPlaying: "No active playback",
  noPlayingSecondary: "Your next session will appear here automatically.",
  unavailable: "Jellyfin is currently unavailable",
  jellyfinUnavailable: "Jellyfin unavailable",
  unavailableSecondary: "Waiting for the media service to reconnect.",
  upcomingNotConfigured: "Upcoming media will be available in a future setup phase",
  error: "Unable to load media",
  notConfigured: "The integration is not configured yet",
  stale: "Showing the last available update",
  partial: "Some media could not be displayed",
  staleShort: "Last known data",
  partialShort: "Partial data",
  playingStatus: "Playing",
  pausedStatus: "Paused",
  playbackProgress: "Playback progress",
  watchedSuffix: "watched",
  remainingPrefix: "Remaining",
  sessions: "Playback sessions",
  previousSession: "Previous session",
  nextSession: "Next session",
  session: "Session",
  movie: "Movie",
  series: "Series",
  episode: "Episode",
  pending: "Pending",
  downloaded: "Downloaded"
}, ni = {
  recent: "Recém-adicionados",
  upcoming: "Em breve",
  upcomingEmpty: "Nada previsto por enquanto",
  playing: "Tocando agora",
  playingEyebrow: "EM REPRODUÇÃO",
  carousel: "Mídia",
  loading: "Carregando mídia",
  empty: "Nenhuma mídia para exibir",
  noPlaying: "Nenhuma reprodução ativa",
  noPlayingSecondary: "Sua próxima sessão aparecerá aqui automaticamente.",
  unavailable: "O Jellyfin está indisponível no momento",
  jellyfinUnavailable: "Jellyfin indisponível",
  unavailableSecondary: "Aguardando o serviço de mídia se reconectar.",
  upcomingNotConfigured: "As próximas mídias estarão disponíveis em uma futura fase de configuração",
  error: "Não foi possível carregar a mídia",
  notConfigured: "A integração ainda não está configurada",
  stale: "Exibindo a última atualização disponível",
  partial: "Algumas mídias não puderam ser exibidas",
  staleShort: "Últimos dados válidos",
  partialShort: "Dados parciais",
  playingStatus: "Tocando",
  pausedStatus: "Pausado",
  playbackProgress: "Progresso da reprodução",
  watchedSuffix: "assistido",
  remainingPrefix: "Restam",
  sessions: "Sessões de reprodução",
  previousSession: "Sessão anterior",
  nextSession: "Próxima sessão",
  session: "Sessão",
  movie: "Filme",
  series: "Série",
  episode: "Episódio",
  pending: "Pendente",
  downloaded: "Baixado"
};
function f(t, e) {
  return t?.toLowerCase().startsWith("pt") ? ni[e] : ai[e];
}
var li = Object.defineProperty, ci = Object.getOwnPropertyDescriptor, T = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ci(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && li(e, i, r), r;
};
let S = class extends x {
  constructor() {
    super(...arguments), this.entryId = "", this.variant = "poster-medium", this.showTitle = !0, this.showBadge = !0, this.showSubtitle = !0, this.titlePosition = "overlay", this.focused = !1, this.itemIndex = 0, this.announceFocus = () => {
      this.item && this.dispatchEvent(
        new CustomEvent("octopus-media-focus", {
          bubbles: !0,
          composed: !0,
          detail: { index: this.itemIndex, ref: this.item.ref }
        })
      );
    }, this.announceHoverFocus = (t) => {
      t.pointerType === "mouse" && this.announceFocus();
    };
  }
  render() {
    return this.item ? n`
      <article
        aria-label=${this.item.title}
        tabindex="0"
        data-focused=${String(this.focused)}
        data-title-position=${this.titlePosition}
        @focus=${this.announceFocus}
        @pointerenter=${this.announceHoverFocus}
        @pointerdown=${this.announceFocus}
      >
        <div class="image-frame">
          <octopus-media-image
            .hass=${this.hass}
            .entryId=${this.entryId}
            .imageRef=${this.item.poster_ref}
            .variant=${this.variant}
            .alt=${this.item.title}
          ></octopus-media-image>
          ${this.showBadge ? n`<span class="badge">${this.badgeLabel()}</span>` : p}
          ${this.showTitle && this.titlePosition === "overlay" ? n`<div class="overlay-copy">
                  <h3 class="title">${this.item.title}</h3>
                  ${this.showSubtitle && this.item.subtitle ? n`<p>${this.item.subtitle}</p>` : p}
                </div>` : p}
        </div>
        ${this.showTitle && this.titlePosition === "below" ? n`<h3 class="title">${this.item.title}</h3>` : p}
        ${this.titlePosition === "below" && this.showSubtitle && this.item.subtitle ? n`<p>${this.item.subtitle}</p>` : p}
      </article>
    ` : p;
  }
  badgeLabel() {
    return this.item ? this.item.type === "episode" && "season" in this.item && "episode" in this.item && this.item.season !== null && this.item.episode !== null ? `T${String(this.item.season).padStart(2, "0")}E${String(this.item.episode).padStart(2, "0")}` : f(this.hass?.language, this.item.type) : "";
  }
};
S.styles = k`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
      min-width: 0;
    }
    article {
      color: var(--octopus-text, #f3f6fb);
      display: grid;
      gap: 3px;
      grid-template-rows: minmax(0, 1fr) auto auto;
      height: 100%;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
    }
    article:focus-visible {
      border-radius: var(--octopus-radius-poster, 12px);
      outline: 2px solid var(--octopus-accent-secondary, #43d8d1);
      outline-offset: -2px;
    }
    .image-frame {
      aspect-ratio: 2 / 3;
      background: var(--octopus-surface-elevated, #101820);
      border: 1px solid color-mix(in srgb, var(--octopus-border, #293748) 70%, transparent);
      border-radius: var(--octopus-radius-poster, 12px);
      box-shadow: 0 9px 22px rgb(0 0 0 / 28%);
      box-sizing: border-box;
      height: 100%;
      justify-self: center;
      max-width: 100%;
      min-height: 0;
      overflow: hidden;
      position: relative;
      transition:
        transform 180ms ease,
        box-shadow 180ms ease;
      width: auto;
    }
    article:hover .image-frame,
    article:focus-visible .image-frame {
      box-shadow: 0 12px 26px rgb(0 0 0 / 34%);
      transform: translateY(-2px);
    }
    octopus-media-image {
      display: block;
      height: 100%;
      width: 100%;
    }
    .badge {
      backdrop-filter: blur(8px);
      background: rgb(7 12 22 / 68%);
      border: 1px solid
        color-mix(in srgb, var(--octopus-accent-secondary, #43d8d1) 38%, transparent);
      border-radius: 999px;
      color: var(--octopus-text, #f3f6fb);
      font-size: 8px;
      left: 7px;
      line-height: 1;
      padding: 3px 5px;
      position: absolute;
      top: 7px;
    }
    .overlay-copy {
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgb(3 7 14 / 24%) 18%,
        rgb(3 7 14 / 92%) 100%
      );
      bottom: 0;
      box-sizing: border-box;
      display: grid;
      gap: 2px;
      left: 0;
      padding: 28px 8px 8px;
      position: absolute;
      right: 0;
    }
    .title {
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      display: -webkit-box;
      font-size: clamp(11px, 2.5cqi, 12px);
      font-weight: 600;
      line-height: 1.14;
      margin: 1px 2px 0;
      overflow: hidden;
      overflow-wrap: anywhere;
    }
    p {
      color: var(--octopus-muted, #8795a8);
      font-size: 9px;
      margin: 0 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .overlay-copy .title,
    .overlay-copy p {
      color: var(--octopus-text, #f3f6fb);
      margin-inline: 0;
      text-shadow: 0 1px 4px rgb(0 0 0 / 65%);
    }
    .overlay-copy p {
      color: color-mix(in srgb, var(--octopus-text, #f3f6fb) 72%, transparent);
    }
    @media (hover: none) {
      article:hover .image-frame {
        transform: none;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .image-frame {
        transition: none;
      }
    }
  `;
T([
  d({ attribute: !1 })
], S.prototype, "item", 2);
T([
  d({ attribute: !1 })
], S.prototype, "hass", 2);
T([
  d({ type: String })
], S.prototype, "entryId", 2);
T([
  d({ type: String })
], S.prototype, "variant", 2);
T([
  d({ type: Boolean })
], S.prototype, "showTitle", 2);
T([
  d({ type: Boolean })
], S.prototype, "showBadge", 2);
T([
  d({ type: Boolean })
], S.prototype, "showSubtitle", 2);
T([
  d({ type: String })
], S.prototype, "titlePosition", 2);
T([
  d({ type: Boolean, reflect: !0 })
], S.prototype, "focused", 2);
T([
  d({ type: Number })
], S.prototype, "itemIndex", 2);
S = T([
  P("octopus-media-poster")
], S);
const pi = ({ config: t, entryId: e, hass: i, items: s }) => n`
  <div class="layout grid" data-layout="grid">
    ${s.map(
  (r) => n`
        <octopus-media-poster
          .item=${r}
          .hass=${i}
          .entryId=${e}
          .variant=${"poster-medium"}
          .showTitle=${t.show_titles}
          .showBadge=${t.show_badges}
          .titlePosition=${t.title_position}
        ></octopus-media-poster>
      `
)}
  </div>
`;
var di = Object.defineProperty, hi = Object.getOwnPropertyDescriptor, ke = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? hi(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && di(e, i, r), r;
};
let Q = class extends x {
  constructor() {
    super(...arguments), this.showSubtitle = !0;
  }
  render() {
    return this.item ? n`
      <strong>${this.item.title}</strong>
      ${this.showSubtitle && this.item.subtitle ? n`<span>${this.item.subtitle}</span>` : p}
    ` : p;
  }
};
Q.styles = k`
    :host {
      display: grid;
      gap: 4px;
      max-height: 100%;
      min-width: 0;
      overflow: hidden;
    }
    strong {
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      display: -webkit-box;
      font-size: var(--octopus-metadata-title-size, inherit);
      line-height: var(--octopus-metadata-title-line-height, normal);
      overflow: hidden;
      overflow-wrap: anywhere;
    }
    span {
      color: var(--octopus-media-muted, #8fa4ad);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;
ke([
  d({ attribute: !1 })
], Q.prototype, "item", 2);
ke([
  d({ type: Boolean })
], Q.prototype, "showSubtitle", 2);
Q = ke([
  P("octopus-media-metadata")
], Q);
var ui = Object.defineProperty, gi = Object.getOwnPropertyDescriptor, C = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? gi(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && ui(e, i, r), r;
};
function G(t) {
  if (!Number.isFinite(t) || t <= 0) return "0:00";
  const e = Math.floor(t), i = Math.floor(e / 3600), s = Math.floor(e % 3600 / 60), r = e % 60;
  return i > 0 ? `${String(i)}:${String(s).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${String(s)}:${String(r).padStart(2, "0")}`;
}
function fi(t) {
  if (!Number.isFinite(t) || t <= 0) return;
  const e = Math.max(1, Math.round(t / 60)), i = Math.floor(e / 60), s = e % 60;
  return i === 0 ? `${String(s)} min` : s > 0 ? `${String(i)}h${String(s).padStart(2, "0")}` : `${String(i)}h`;
}
function mi(t, e) {
  const i = [], s = t.type === "movie" && /^\d{4}$/.test(t.subtitle ?? "") ? t.subtitle : null;
  s && i.push(s);
  const r = fi(t.duration_seconds);
  if (r && i.push(r), i.push(...t.genres.filter((o) => o.trim()).slice(0, 2)), t.rating !== null && Number.isFinite(t.rating)) {
    const o = new Intl.NumberFormat(e ?? "en", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1
    }).format(t.rating);
    i.push(`★ ${o}`);
  }
  return i;
}
function bi(t) {
  return [
    t.video_resolution?.trim(),
    t.video_hdr ? "HDR" : void 0,
    t.audio_channels?.trim()
  ].filter((e) => !!e).slice(0, 3);
}
function yi(t) {
  return t.type === "episode" && t.still_ref ? { ref: t.still_ref, variant: "poster-large" } : t.backdrop_ref ? { ref: t.backdrop_ref, variant: "backdrop-medium" } : t.still_ref ? { ref: t.still_ref, variant: "poster-large" } : { variant: "backdrop-medium" };
}
let _ = class extends x {
  constructor() {
    super(...arguments), this.items = [], this.entryId = "", this.heroState = "ready", this.stale = !1, this.partial = !1, this.serviceOffline = !1, this.activeIndex = 0, this.onScroll = () => {
      this.scrollFrame !== void 0 && cancelAnimationFrame(this.scrollFrame), this.scrollFrame = requestAnimationFrame(() => {
        this.scrollFrame = void 0;
        const t = this.track, e = [...this.renderRoot.querySelectorAll(".session")];
        if (!t || e.length < 2) return;
        const i = t.getBoundingClientRect().left;
        let s = 0, r = Number.POSITIVE_INFINITY;
        e.forEach((o, a) => {
          const c = Math.abs(o.getBoundingClientRect().left - i);
          c < r && (s = a, r = c);
        }), s !== this.activeIndex && this.activate(s, !1);
      });
    };
  }
  disconnectedCallback() {
    this.stopCycleTimer(), this.scrollFrame !== void 0 && cancelAnimationFrame(this.scrollFrame), super.disconnectedCallback();
  }
  updated(t) {
    if (t.has("items") || t.has("focusedRef")) {
      const e = this.items.findIndex((s) => s.ref === this.focusedRef), i = e >= 0 ? e : Math.min(this.activeIndex, this.items.length - 1);
      i !== this.activeIndex && i >= 0 && (this.activeIndex = i);
    }
    (t.has("items") || t.has("config") || t.has("heroState") || t.has("activeIndex")) && this.reconcileCycleTimer();
  }
  render() {
    if (this.heroState !== "ready" || this.items.length === 0)
      return this.renderState();
    const t = this.items.length > 1;
    return n`
      <section
        class=${`playing-hero ${t ? "multiple" : ""}`}
        aria-label=${this.config?.title ?? f(this.language, "playing")}
      >
        <div class="session-track" @scroll=${this.onScroll}>
          ${this.items.map((e, i) => this.renderSession(e, i))}
        </div>
        ${t ? this.renderNavigation() : p}
      </section>
    `;
  }
  renderState() {
    const t = this.heroState === "unavailable";
    return n`
      <section
        class=${`playing-state ${t ? "unavailable" : "empty"}`}
        role=${t ? "status" : "region"}
        aria-label=${t ? f(this.language, "jellyfinUnavailable") : f(this.language, "noPlaying")}
      >
        <span class="state-glow" aria-hidden="true"></span>
        <ha-icon
          icon=${t ? "mdi:server-off" : "mdi:octopus"}
          aria-hidden="true"
        ></ha-icon>
        <div>
          <strong
            >${t ? f(this.language, "jellyfinUnavailable") : f(this.language, "noPlaying")}</strong
          >
          <p>
            ${t ? f(this.language, "unavailableSecondary") : f(this.language, "noPlayingSecondary")}
          </p>
        </div>
      </section>
    `;
  }
  renderSession(t, e) {
    const i = e === this.activeIndex, s = yi(t), r = t.duration_seconds > 0, o = r ? Math.min(100, Math.max(0, t.progress)) : 0, a = Math.round(o), c = r ? Math.max(0, t.duration_seconds - t.position_seconds) : 0, l = mi(t, this.language), h = bi(t), u = l.length > 0 || h.length > 0, g = f(
      this.language,
      t.state === "paused" ? "pausedStatus" : "playingStatus"
    ), w = t.device_alias ?? t.device_name, m = [
      g,
      t.title,
      t.subtitle,
      this.config?.show_device ? w : void 0,
      this.config?.show_user ? t.user_name : void 0,
      r ? `${G(t.position_seconds)} / ${G(t.duration_seconds)}` : void 0
    ].filter(Boolean).join(", ");
    return n`
      <article
        class=${`session ${t.state}${this.stale || this.serviceOffline ? " stale" : ""}`}
        data-active=${String(i)}
        data-has-duration=${String(r)}
        data-session-index=${String(e)}
        tabindex=${i ? "0" : "-1"}
        aria-label=${m}
        @focus=${() => {
      this.activate(e, !1);
    }}
        @click=${() => {
      this.activate(e, !1);
    }}
        @keydown=${($) => {
      this.onSessionKeydown($, e);
    }}
      >
        ${s.ref ? n`<octopus-media-image
                class="backdrop"
                aria-hidden="true"
                .hass=${this.hass}
                .entryId=${this.entryId}
                .imageRef=${s.ref}
                .variant=${s.variant}
                .alt=${""}
                .backdrop=${!0}
              ></octopus-media-image>` : p}
        <span class="color-wash" aria-hidden="true"></span>
        <span class="vignette" aria-hidden="true"></span>
        <div class="session-content">
          <div class="poster-shell">
            <octopus-media-image
              class="poster-art"
              .hass=${this.hass}
              .entryId=${this.entryId}
              .imageRef=${t.poster_ref ?? void 0}
              .variant=${"poster-medium"}
              .alt=${t.title}
            ></octopus-media-image>
          </div>
          <div class="copy">
            <span class="playback-eyebrow">${f(this.language, "playingEyebrow")}</span>
            <div class="copy-topline">
              ${this.config?.show_badges ? n`<span class=${`state-badge ${t.state}`}>
                      <ha-icon
                        icon=${t.state === "paused" ? "mdi:pause" : "mdi:play"}
                        aria-hidden="true"
                      ></ha-icon>
                      ${g}
                    </span>` : p}
              <span class="media-kind">${f(this.language, t.type)}</span>
            </div>
            <div class="title-block">
              ${this.config?.show_titles ? n`<h3>${t.title}</h3>
                      ${t.subtitle ? n`<p class=${`editorial-meta ${t.type}`}>${t.subtitle}</p>` : p}` : p}
            </div>
            ${u ? n`<div class="enriched-metadata">
                    ${l.length > 0 ? n`<p class="editorial-line">
                            ${l.map(($) => n`<span>${$}</span>`)}
                          </p>` : p}
                    ${h.length > 0 ? n`<div class="technical-chips">
                            ${h.map(($) => n`<span>${$}</span>`)}
                          </div>` : p}
                  </div>` : p}
            <div class="session-context">
              <div class="session-meta">
                ${this.config?.show_device ? n`<span
                        ><ha-icon icon="mdi:television-play" aria-hidden="true"></ha-icon
                        >${w}</span
                      >` : p}
                ${this.config?.show_user ? n`<span
                        ><ha-icon icon="mdi:account" aria-hidden="true"></ha-icon
                        >${t.user_name}</span
                      >` : p}
              </div>
              ${this.stale || this.partial || this.serviceOffline ? n`<div class="data-flags" role="status">
                      ${this.stale || this.serviceOffline ? n`<span>${f(this.language, "staleShort")}</span>` : p}
                      ${this.partial ? n`<span>${f(this.language, "partialShort")}</span>` : p}
                    </div>` : p}
            </div>
            ${this.config?.show_progress && r ? n`<div class="progress-block">
                    <div
                      class="progress-track"
                      role="progressbar"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow=${String(a)}
                      aria-label=${f(this.language, "playbackProgress")}
                    >
                      <span style=${`width:${String(o)}%`}></span>
                    </div>
                    ${this.config.show_time ? n`
                            <div class="times">
                              <span class="position"
                                >${G(t.position_seconds)}</span
                              >
                              <span class="duration"
                                >${G(t.duration_seconds)}</span
                              >
                            </div>
                            <div class="progress-summary">
                              <strong class="percentage"
                                >${a}%
                                ${f(this.language, "watchedSuffix")}</strong
                              >
                              <span class="remaining"
                                >${f(this.language, "remainingPrefix")}
                                ${G(c)}</span
                              >
                            </div>
                          ` : p}
                  </div>` : p}
          </div>
        </div>
      </article>
    `;
  }
  renderNavigation() {
    const t = this.config;
    return n`
      ${t?.show_arrows ? n`<div class="session-arrows" aria-label=${f(this.language, "sessions")}>
              <button
                type="button"
                aria-label=${f(this.language, "previousSession")}
                ?disabled=${this.activeIndex === 0}
                @click=${() => {
      this.activate(this.activeIndex - 1, !0);
    }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label=${f(this.language, "nextSession")}
                ?disabled=${this.activeIndex >= this.items.length - 1}
                @click=${() => {
      this.activate(this.activeIndex + 1, !0);
    }}
              >
                ›
              </button>
            </div>` : p}
      ${t?.show_indicators ? n`<div
              class="session-indicators"
              role="group"
              aria-label=${f(this.language, "sessions")}
            >
              ${this.items.map(
      (e, i) => n`<button
                    type="button"
                    data-active=${String(i === this.activeIndex)}
                    aria-label=${`${f(this.language, "session")} ${String(i + 1)}: ${e.title}`}
                    @click=${() => {
        this.activate(i, !0);
      }}
                  ></button>`
    )}
            </div>` : p}
    `;
  }
  onSessionKeydown(t, e) {
    if (t.key !== "ArrowLeft" && t.key !== "ArrowRight") return;
    t.preventDefault();
    const i = t.key === "ArrowRight" ? 1 : -1;
    this.activate(e + i, !0);
  }
  activate(t, e) {
    const i = Math.min(this.items.length - 1, Math.max(0, t)), s = this.items[i];
    if (!s) return;
    this.activeIndex = i, this.dispatchEvent(
      new CustomEvent("octopus-media-focus", {
        bubbles: !0,
        composed: !0,
        detail: { index: i, ref: s.ref }
      })
    );
    const r = this.renderRoot.querySelector(
      `[data-session-index="${String(i)}"]`
    );
    typeof r?.scrollIntoView == "function" && r.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" }), e && r?.focus({ preventScroll: !0 });
  }
  reconcileCycleTimer() {
    if (!(this.heroState === "ready" && !!this.config?.autoplay && this.items.length > 1 && this.isConnected)) {
      this.stopCycleTimer();
      return;
    }
    const e = Math.max(5, this.config?.cycle_interval ?? 10) * 1e3;
    this.stopCycleTimer(), this.cycleTimer = window.setInterval(() => {
      const i = (this.activeIndex + 1) % this.items.length;
      this.activate(i, !1);
    }, e);
  }
  stopCycleTimer() {
    this.cycleTimer !== void 0 && window.clearInterval(this.cycleTimer), this.cycleTimer = void 0;
  }
};
_.styles = k`
    :host {
      container-type: inline-size;
      display: block;
      height: 100%;
      min-height: 0;
      min-width: 0;
    }
    .playing-hero,
    .playing-state {
      border: 0;
      border-radius: 13px;
      box-sizing: border-box;
      height: 100%;
      isolation: isolate;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
      position: relative;
    }
    .playing-state {
      background:
        radial-gradient(circle at 11% 32%, rgb(21 163 177 / 24%), transparent 36%) padding-box,
        radial-gradient(circle at 88% 40%, rgb(121 58 191 / 30%), transparent 42%) padding-box,
        linear-gradient(108deg, #032831, #0a101e 50%, #271035) padding-box;
      border: 1px solid rgb(174 202 221 / 30%);
    }
    .playing-hero {
      background:
        radial-gradient(circle at 11% 32%, rgb(21 163 177 / 24%), transparent 36%) padding-box,
        radial-gradient(circle at 88% 40%, rgb(121 58 191 / 30%), transparent 42%) padding-box,
        linear-gradient(108deg, #032831, #0a101e 50%, #271035) padding-box;
      padding: 0;
      transition: filter 160ms ease;
    }
    .session-track {
      display: flex;
      height: 100%;
      min-width: 0;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      touch-action: pan-x pan-y;
    }
    .session-track::-webkit-scrollbar {
      display: none;
    }
    .session {
      background: linear-gradient(112deg, rgb(2 15 21 / 62%), rgb(14 10 26 / 54%));
      box-sizing: border-box;
      flex: 0 0 100%;
      height: 100%;
      isolation: isolate;
      min-width: 0;
      outline: none;
      overflow: hidden;
      position: relative;
      scroll-snap-align: start;
    }
    @media (hover: hover) and (pointer: fine) {
      .playing-hero:has(.session:hover) {
        filter: brightness(1.018);
      }
    }
    .playing-hero:has(.session:focus-visible) {
      filter: brightness(1.018);
    }
    .session.paused .backdrop {
      opacity: 0.6;
      filter: blur(19px) saturate(0.58) brightness(0.46);
    }
    .backdrop,
    .color-wash,
    .vignette {
      inset: -18px;
      pointer-events: none;
      position: absolute;
    }
    .backdrop {
      filter: blur(17px) saturate(0.78) brightness(0.58);
      opacity: 0.84;
      transform: scale(1.075);
      z-index: -3;
    }
    .color-wash {
      background:
        linear-gradient(
          90deg,
          rgb(0 38 47 / 86%),
          rgb(4 15 25 / 68%) 34%,
          rgb(11 10 24 / 38%) 64%,
          rgb(52 15 72 / 54%)
        ),
        radial-gradient(circle at 22% 54%, rgb(36 198 199 / 22%), transparent 34%),
        radial-gradient(circle at 84% 38%, rgb(142 74 212 / 17%), transparent 40%);
      z-index: -2;
    }
    .vignette {
      box-shadow:
        inset 0 0 58px 12px rgb(0 0 0 / 56%),
        inset 0 -46px 52px rgb(0 0 0 / 42%);
      z-index: -1;
    }
    .session-content {
      align-items: center;
      box-sizing: border-box;
      display: grid;
      gap: 13px;
      grid-template-columns: minmax(100px, 31.5%) minmax(0, 1fr);
      height: 100%;
      min-width: 0;
      padding: 10px 12px;
    }
    .poster-shell {
      aspect-ratio: 2 / 3;
      border: 1px solid rgb(203 220 235 / 18%);
      border-radius: 10px;
      box-shadow: 0 12px 26px rgb(0 0 0 / 42%);
      justify-self: start;
      max-height: 100%;
      max-width: 120px;
      overflow: hidden;
      width: 100%;
    }
    .poster-art {
      height: 100%;
      width: 100%;
    }
    .copy {
      align-content: stretch;
      display: grid;
      gap: 0;
      grid-template-rows: auto auto auto minmax(6px, 1fr) auto auto;
      height: min(100%, 160px);
      min-width: 0;
      overflow: hidden;
    }
    .playback-eyebrow {
      align-self: start;
      color: rgb(128 222 218 / 74%);
      font-size: 7.8px;
      font-weight: 650;
      grid-row: 1;
      letter-spacing: 0.14em;
      line-height: 1;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .copy-topline,
    .session-meta,
    .data-flags,
    .times {
      align-items: center;
      display: flex;
      min-width: 0;
    }
    .copy-topline {
      gap: 7px;
      grid-row: 2;
    }
    .state-badge,
    .media-kind,
    .data-flags span {
      align-items: center;
      backdrop-filter: blur(8px);
      border: 1px solid rgb(117 225 216 / 18%);
      border-radius: 999px;
      display: inline-flex;
      font-size: 9px;
      font-weight: 650;
      gap: 3px;
      letter-spacing: 0.02em;
      line-height: 1;
      padding: 3.5px 7px;
      white-space: nowrap;
    }
    .state-badge.playing {
      background: rgb(13 126 119 / 48%);
      border-color: rgb(89 232 219 / 30%);
      box-shadow: 0 0 13px rgb(36 205 198 / 12%);
      color: #8ff2df;
    }
    .state-badge.paused {
      background: rgb(116 74 147 / 54%);
      border-color: rgb(216 166 255 / 32%);
      box-shadow: 0 0 13px rgb(162 103 224 / 12%);
      color: #ebd2ff;
    }
    .state-badge ha-icon {
      --mdc-icon-size: 9px;
      display: inline-flex;
      flex: 0 0 9px;
      height: 9px;
      overflow: visible;
      width: 9px;
    }
    .media-kind {
      background: rgb(3 9 16 / 38%);
      border-color: rgb(210 222 235 / 12%);
      color: rgb(218 227 239 / 68%);
      font-weight: 520;
    }
    h3 {
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      color: #f5f4f8;
      display: -webkit-box;
      font-size: clamp(14px, 4.35cqi, 16px);
      font-weight: 620;
      letter-spacing: -0.01em;
      line-height: 1.06;
      margin: 0;
      overflow: hidden;
      overflow-wrap: anywhere;
    }
    .title-block {
      display: grid;
      gap: 3px;
      grid-row: 3;
      margin-top: 6px;
      min-width: 0;
    }
    .editorial-meta {
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      color: rgb(232 230 240 / 78%);
      display: -webkit-box;
      font-size: 9.5px;
      font-weight: 540;
      line-height: 1.18;
      margin: 0;
      overflow: hidden;
      overflow-wrap: anywhere;
    }
    .editorial-meta.episode {
      color: rgb(196 225 231 / 86%);
    }
    .enriched-metadata {
      display: none;
      min-width: 0;
    }
    .enriched-metadata p {
      margin: 0;
    }
    .editorial-line {
      color: rgb(203 219 227 / 76%);
      font-size: 9.5px;
      font-weight: 540;
      line-height: 1.2;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .editorial-line span + span::before {
      color: rgb(159 183 196 / 48%);
      content: " · ";
    }
    .technical-chips {
      align-items: center;
      display: flex;
      flex-wrap: nowrap;
      gap: 5px;
      min-width: 0;
      overflow: hidden;
    }
    .technical-chips span {
      background: rgb(4 13 22 / 32%);
      border: 1px solid rgb(151 206 219 / 12%);
      border-radius: 999px;
      color: rgb(197 218 228 / 68%);
      flex: 0 0 auto;
      font-size: 8px;
      font-weight: 560;
      letter-spacing: 0.035em;
      line-height: 1;
      padding: 3px 6px;
      white-space: nowrap;
    }
    .session-meta {
      color: rgb(223 230 240 / 82%);
      flex-wrap: wrap;
      font-size: 9.5px;
      gap: 5px 10px;
      line-height: 1.15;
    }
    .session-meta span {
      align-items: center;
      background: rgb(2 11 19 / 24%);
      border: 1px solid rgb(159 213 220 / 10%);
      border-radius: 999px;
      display: inline-flex;
      gap: 6px;
      max-width: 100%;
      overflow: visible;
      padding: 3.5px 6px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .session-meta ha-icon {
      --mdc-icon-size: 13px;
      display: inline-flex;
      flex: 0 0 auto;
      flex-shrink: 0;
      color: rgb(109 224 218 / 76%);
      height: 13px;
      line-height: 1;
      overflow: visible;
      width: 13px;
    }
    .session-context {
      align-self: end;
      display: grid;
      gap: 4px;
      grid-row: 5;
      min-width: 0;
    }
    .data-flags {
      gap: 4px;
    }
    .data-flags span {
      background: rgb(101 65 16 / 42%);
      border-color: rgb(244 201 109 / 22%);
      color: #f4d287;
      font-size: 7.8px;
      padding: 2px 5px;
    }
    .progress-block {
      display: grid;
      gap: 4px;
      grid-row: 6;
      margin-top: 8px;
      min-width: 0;
    }
    .progress-track {
      background: rgb(214 226 242 / 18%);
      border: 1px solid rgb(211 229 244 / 8%);
      border-radius: 999px;
      box-sizing: border-box;
      height: 6px;
      overflow: visible;
      position: relative;
    }
    .progress-track > span {
      background: linear-gradient(90deg, #7f5be3, #39d0ce);
      border-radius: inherit;
      box-shadow:
        0 0 9px rgb(57 208 206 / 45%),
        inset 0 0 3px rgb(255 255 255 / 24%);
      display: block;
      height: 100%;
      max-width: 100%;
      position: relative;
      transition: width 800ms linear;
    }
    .progress-track > span::after {
      background: #8ffcf0;
      border-radius: 50%;
      box-shadow: 0 0 7px #42d8d2;
      content: "";
      height: 7px;
      position: absolute;
      right: -2px;
      top: -1.5px;
      width: 7px;
    }
    .times {
      color: rgb(226 233 244 / 82%);
      font-size: 8.8px;
      font-variant-numeric: tabular-nums;
      font-weight: 560;
      justify-content: space-between;
      line-height: 1;
    }
    .progress-summary {
      align-items: center;
      color: rgb(210 219 232 / 68%);
      display: flex;
      font-size: 8.8px;
      justify-content: space-between;
      line-height: 1.1;
      min-width: 0;
    }
    .percentage {
      color: #a9f2e8;
      font-size: inherit;
      font-weight: 620;
    }
    .remaining {
      font-variant-numeric: tabular-nums;
      margin-left: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .session.paused .progress-track > span,
    .session.stale .progress-track > span {
      transition: none;
    }
    .session-arrows {
      bottom: 9px;
      display: flex;
      gap: 4px;
      position: absolute;
      right: 9px;
      z-index: 6;
    }
    .session-arrows button {
      align-items: center;
      background: rgb(3 8 15 / 42%);
      border: 1px solid rgb(217 225 239 / 14%);
      border-radius: 50%;
      color: rgb(237 241 248 / 78%);
      display: inline-flex;
      font: inherit;
      height: 23px;
      justify-content: center;
      padding: 0;
      width: 23px;
    }
    .session-arrows button:disabled {
      opacity: 0.22;
    }
    .session-arrows button:not(:disabled):hover,
    .session-arrows button:not(:disabled):focus-visible {
      border-color: rgb(71 213 211 / 48%);
      color: white;
      outline: none;
    }
    .session-indicators {
      display: flex;
      gap: 4px;
      left: 50%;
      position: absolute;
      bottom: 7px;
      transform: translateX(-50%);
      z-index: 6;
    }
    .session-indicators button {
      background: rgb(229 233 244 / 28%);
      border: 0;
      border-radius: 999px;
      height: 3px;
      padding: 0;
      transition: width 140ms ease;
      width: 8px;
    }
    .session-indicators button[data-active="true"] {
      background: linear-gradient(90deg, #a272f0, #48d4d0);
      width: 17px;
    }
    .playing-state {
      align-items: center;
      display: grid;
      gap: 14px;
      grid-template-columns: auto minmax(0, 1fr);
      padding: 20px 24px;
    }
    .playing-state::before {
      background:
        radial-gradient(circle at 24% 48%, rgb(30 190 191 / 14%), transparent 32%),
        radial-gradient(circle at 86% 40%, rgb(139 74 211 / 20%), transparent 42%);
      content: "";
      inset: 0;
      pointer-events: none;
      position: absolute;
    }
    .playing-state .state-glow {
      background: radial-gradient(circle, rgb(128 72 210 / 28%), transparent 70%);
      border-radius: 50%;
      height: 120px;
      left: -24px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 150px;
    }
    .playing-state > ha-icon {
      color: #ab73f2;
      filter: drop-shadow(0 0 13px rgb(146 85 226 / 38%));
      height: 42px;
      position: relative;
      width: 42px;
    }
    .playing-state.unavailable > ha-icon {
      color: #d9a85f;
    }
    .playing-state div {
      display: grid;
      gap: 5px;
      min-width: 0;
      position: relative;
    }
    .playing-state strong {
      color: #f1edf7;
      font-size: 15px;
      font-weight: 620;
      line-height: 1.1;
    }
    .playing-state p {
      color: rgb(211 215 228 / 64%);
      font-size: 9.5px;
      line-height: 1.3;
      margin: 0;
    }
    @container (min-width: 560px) {
      .session-content {
        gap: 24px;
        grid-template-columns: 138px minmax(0, 1fr);
        padding: 10px 28px 10px 14px;
      }
      .poster-shell {
        height: 100%;
        max-height: none;
        max-width: 138px;
        width: auto;
      }
      .copy {
        align-content: stretch;
        gap: 0;
        grid-template-rows: auto auto auto auto minmax(8px, 1fr) auto auto;
        height: 100%;
        padding: 2px 0;
      }
      .playback-eyebrow {
        font-size: 8.2px;
        margin-bottom: 6px;
      }
      .copy-topline {
        align-self: start;
      }
      h3 {
        font-size: clamp(18px, 2.5cqi, 20px);
      }
      .title-block {
        align-content: start;
        margin-top: 6px;
      }
      .editorial-meta {
        font-size: 11px;
      }
      .editorial-meta.movie {
        display: none;
      }
      .enriched-metadata {
        align-self: start;
        display: grid;
        grid-row: 4;
        margin-top: 5px;
      }
      .enriched-metadata .technical-chips {
        display: none;
      }
      .editorial-line span:nth-child(n + 4) {
        display: none;
      }
      .session-context {
        grid-row: 6;
      }
      .session-meta {
        align-self: end;
        font-size: 10.25px;
        gap: 8px 16px;
      }
      .session-meta span {
        gap: 7px;
        padding: 4px 9px;
      }
      .session-meta ha-icon {
        --mdc-icon-size: 14px;
        height: 14px;
        width: 14px;
      }
      .progress-block {
        gap: 5px;
        grid-row: 7;
        margin-top: 9px;
      }
      .times,
      .progress-summary {
        font-size: 9.5px;
      }
      .progress-track {
        height: 6px;
      }
      .playing-hero.multiple .session {
        flex-basis: calc(100% - 112px);
      }
    }
    @container (min-width: 640px) {
      .editorial-line span:nth-child(4) {
        display: inline;
      }
    }
    @container (min-width: 700px) {
      .enriched-metadata {
        gap: 6px;
      }
      .enriched-metadata .technical-chips {
        display: flex;
      }
      .editorial-line {
        font-size: 10px;
      }
      .editorial-line span:nth-child(n) {
        display: inline;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .session-track {
        scroll-behavior: auto;
      }
      .playing-hero,
      .progress-track > span,
      .session-indicators button {
        transition: none;
      }
    }
  `;
C([
  d({ attribute: !1 })
], _.prototype, "config", 2);
C([
  d({ attribute: !1 })
], _.prototype, "hass", 2);
C([
  d({ attribute: !1 })
], _.prototype, "items", 2);
C([
  d({ type: String })
], _.prototype, "entryId", 2);
C([
  d({ type: String })
], _.prototype, "focusedRef", 2);
C([
  d({ type: String })
], _.prototype, "language", 2);
C([
  d({ type: String })
], _.prototype, "heroState", 2);
C([
  d({ type: Boolean })
], _.prototype, "stale", 2);
C([
  d({ type: Boolean })
], _.prototype, "partial", 2);
C([
  d({ type: Boolean })
], _.prototype, "serviceOffline", 2);
C([
  v()
], _.prototype, "activeIndex", 2);
C([
  Dt(".session-track")
], _.prototype, "track", 2);
_ = C([
  P("octopus-playing-hero")
], _);
var vi = Object.defineProperty, wi = Object.getOwnPropertyDescriptor, lt = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? wi(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && vi(e, i, r), r;
};
let pe = class extends x {
  constructor() {
    super(...arguments), this.value = 0;
  }
  render() {
    const t = Math.min(100, Math.max(0, this.value));
    return n`
      <div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow=${t}>
        <span style=${`width:${String(t)}%`}></span>
      </div>
    `;
  }
};
pe.styles = k`
    div {
      background: #25343b;
      border-radius: 999px;
      height: 5px;
      overflow: hidden;
    }
    span {
      background: var(--octopus-media-accent, #3dd6c6);
      display: block;
      height: 100%;
    }
  `;
lt([
  d({ type: Number })
], pe.prototype, "value", 2);
pe = lt([
  P("octopus-progress-bar")
], pe);
const Ze = (t) => "progress" in t, xi = (t) => {
  const {
    config: e,
    entryId: i,
    focusedItemRef: s,
    hass: r,
    height: o,
    heroState: a,
    items: c,
    language: l,
    mode: h,
    partial: u,
    serviceOffline: g,
    stale: w
  } = t;
  if (h === "playing") {
    const $ = c.filter(Ze);
    return n`
      <octopus-playing-hero
        .config=${e}
        .entryId=${i}
        .focusedRef=${s}
        .hass=${r}
        .heroState=${a ?? ($.length > 0 ? "ready" : "empty")}
        .items=${$}
        .language=${l}
        .partial=${u ?? !1}
        .serviceOffline=${g ?? !1}
        .stale=${w ?? !1}
      ></octopus-playing-hero>
    `;
  }
  const m = c[0];
  return n`
    <div class="layout hero" data-layout="hero">
      ${m ? n`
              <octopus-media-image
                class="hero-backdrop"
                .hass=${r}
                .entryId=${i}
                .imageRef=${"backdrop_ref" in m ? m.backdrop_ref ?? m.still_ref : void 0}
                .variant=${"backdrop_ref" in m && m.backdrop_ref ? "backdrop-medium" : "poster-large"}
                .alt=${""}
                .backdrop=${!0}
              ></octopus-media-image>
              <octopus-media-poster
                .item=${m}
                .hass=${r}
                .entryId=${i}
                .variant=${"poster-medium"}
                .showTitle=${!1}
                .showBadge=${e.show_badges && o >= 185}
                .showSubtitle=${!1}
                .titlePosition=${e.title_position}
              ></octopus-media-poster>
              <div class="hero-copy">
                <octopus-media-metadata
                  .item=${m}
                  .showSubtitle=${o >= 155}
                ></octopus-media-metadata>
                ${Ze(m) ? n`<octopus-progress-bar .value=${m.progress}></octopus-progress-bar>` : p}
              </div>
            ` : p}
    </div>
  `;
};
var $i = Object.defineProperty, _i = Object.getOwnPropertyDescriptor, Pe = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? _i(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && $i(e, i, r), r;
};
let X = class extends x {
  render() {
    return this.item ? n`<span>${f(this.hass?.language, this.item.type)}</span>` : p;
  }
};
X.styles = k`
    span {
      backdrop-filter: blur(8px);
      background: color-mix(in srgb, var(--octopus-surface-elevated, #111c2a) 68%, transparent);
      border: 1px solid var(--octopus-border, #293748);
      border-radius: 999px;
      color: var(--octopus-media-muted, #8fa4ad);
      display: inline-flex;
      font-size: 8px;
      padding: 3px 5px;
    }
  `;
Pe([
  d({ attribute: !1 })
], X.prototype, "item", 2);
Pe([
  d({ attribute: !1 })
], X.prototype, "hass", 2);
X = Pe([
  P("octopus-media-badges")
], X);
var Si = Object.defineProperty, Ai = Object.getOwnPropertyDescriptor, ue = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ai(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Si(e, i, r), r;
};
let L = class extends x {
  constructor() {
    super(...arguments), this.entryId = "";
  }
  render() {
    return this.item ? n`<octopus-media-image
      .hass=${this.hass}
      .entryId=${this.entryId}
      .imageRef=${this.item.poster_ref}
      .variant=${"poster-small"}
      .alt=${this.item.title}
    ></octopus-media-image>` : p;
  }
};
L.styles = k`
    :host {
      align-items: center;
      display: flex;
      height: 100%;
      justify-content: center;
      min-height: 0;
      min-width: 0;
    }
    octopus-media-image {
      aspect-ratio: 2 / 3;
      border: 1px solid var(--octopus-media-border, #334851);
      border-radius: 8px;
      display: block;
      height: var(--octopus-thumbnail-height, 64px);
      max-height: 100%;
      max-width: 100%;
      overflow: hidden;
    }
  `;
ue([
  d({ attribute: !1 })
], L.prototype, "item", 2);
ue([
  d({ attribute: !1 })
], L.prototype, "hass", 2);
ue([
  d({ type: String })
], L.prototype, "entryId", 2);
L = ue([
  P("octopus-media-thumbnail")
], L);
const ki = ({ config: t, entryId: e, hass: i, items: s }) => n`
  <div class="layout list" data-layout="list">
    ${s.map(
  (r) => n`
        <div class="list-row">
          <octopus-media-thumbnail
            .item=${r}
            .hass=${i}
            .entryId=${e}
          ></octopus-media-thumbnail>
          <octopus-media-metadata .item=${r}></octopus-media-metadata>
          ${t.show_badges ? n`<octopus-media-badges .item=${r} .hass=${i}></octopus-media-badges>` : null}
        </div>
      `
)}
  </div>
`, Pi = ({ config: t, entryId: e, hass: i, items: s }) => n`
  <div class="layout portrait" data-layout="portrait">
    ${s.map(
  (r) => n`
        <octopus-media-poster
          .item=${r}
          .hass=${i}
          .entryId=${e}
          .variant=${"poster-large"}
          .showTitle=${t.show_titles}
          .showBadge=${t.show_badges}
          .titlePosition=${t.title_position}
        ></octopus-media-poster>
      `
)}
  </div>
`;
var Ci = Object.defineProperty, Ei = Object.getOwnPropertyDescriptor, y = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ei(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Ci(e, i, r), r;
};
let b = class extends x {
  constructor() {
    super(...arguments), this.items = [], this.entryId = "", this.posterHeight = 160, this.posterWidth = 106.67, this.gap = 10, this.wide = !1, this.showTitles = !0, this.showDates = !0, this.showRatings = !0, this.showBadges = !0, this.showArrows = !0, this.variant = "recent", this.partial = !1, this.stale = !1, this.canGoBack = !1, this.canGoForward = !1, this.itemSignature = "", this.onPointerEnter = (t, e) => {
      t.pointerType === "mouse" && this.announceFocus(e);
    }, this.onScroll = () => {
      this.updateNavigation(), this.scrollFrame !== void 0 && cancelAnimationFrame(this.scrollFrame), this.scrollFrame = requestAnimationFrame(() => {
        this.scrollFrame = void 0;
        const t = this.track();
        if (!t) return;
        const e = t.getBoundingClientRect().left + t.clientWidth / 2, s = [...this.renderRoot.querySelectorAll(".poster")].reduce(
          (o, a, c) => {
            const l = a.getBoundingClientRect(), h = Math.abs(l.left + l.width / 2 - e);
            return !o || h < o.distance ? { distance: h, index: c } : o;
          },
          void 0
        ), r = s ? this.items[s.index] : void 0;
        r && this.announceFocus(r);
      });
    }, this.onWheel = (t) => {
      const e = this.track();
      !e || Math.abs(t.deltaX) >= Math.abs(t.deltaY) || t.deltaY === 0 || e.scrollWidth <= e.clientWidth || (t.preventDefault(), e.scrollLeft += t.deltaY);
    }, this.onKeyDown = (t) => {
      t.key !== "ArrowLeft" && t.key !== "ArrowRight" || (t.preventDefault(), this.scrollByPage(t.key === "ArrowLeft" ? -1 : 1));
    };
  }
  disconnectedCallback() {
    this.resizeObserver?.disconnect(), this.resizeObserver = void 0, this.scrollFrame !== void 0 && cancelAnimationFrame(this.scrollFrame), this.scrollFrame = void 0, super.disconnectedCallback();
  }
  firstUpdated() {
    const t = this.track();
    t && typeof ResizeObserver < "u" && (this.resizeObserver = new ResizeObserver(() => this.updateNavigation()), this.resizeObserver.observe(t)), this.resetForItems();
  }
  updated() {
    const t = this.items.map((e) => e.ref).join("|");
    t !== this.itemSignature && this.resetForItems(t), queueMicrotask(() => this.updateNavigation());
  }
  render() {
    const t = `--octopus-strip-poster-height:${String(this.posterHeight)}px;--octopus-strip-poster-width:${String(this.posterWidth)}px;--octopus-strip-gap:${String(this.gap)}px`;
    return n`
      <div
        class="track"
        style=${t}
        role="list"
        aria-label=${f(
      this.hass?.language,
      this.variant === "upcoming" ? "upcoming" : "recent"
    )}
        @keydown=${this.onKeyDown}
        @scroll=${this.onScroll}
        @wheel=${this.onWheel}
      >
        ${this.items.map(
      (e) => n`
            <button
              class="poster"
              type="button"
              role="listitem"
              aria-label=${this.accessibleLabel(e)}
              data-focused=${String(e.ref === this.focusedRef)}
              @pointerenter=${(i) => this.onPointerEnter(i, e)}
              @click=${() => this.announceFocus(e)}
              @focus=${() => this.announceFocus(e)}
            >
              <span class="frame">
                <octopus-media-image
                  .hass=${this.hass}
                  .entryId=${this.entryId}
                  .imageRef=${e.poster_ref ?? void 0}
                  .variant=${this.posterWidth < 125 ? "poster-small" : "poster-medium"}
                  .alt=${e.title}
                ></octopus-media-image>
                ${this.variant === "recent" && this.showBadges ? n`<span class="badge">${this.badge(e)}</span>` : p}
                ${this.showTitles ? n`
                        <span class="copy-gradient">
                          <span class="title">${e.title}</span>
                          ${this.metadata(e) ? n`<span class="metadata">${this.metadata(e)}</span>` : p}
                          ${this.upcomingEpisodeSubtitle(e) ? n`<span class="episode-subtitle"
                                  >${this.upcomingEpisodeSubtitle(e)}</span
                                >` : p}
                        </span>
                      ` : p}
              </span>
            </button>
          `
    )}
      </div>
      ${this.showArrows ? n`
              <button
                class="arrow previous"
                type="button"
                aria-label="Voltar pôsteres"
                ?hidden=${!this.canGoBack}
                @click=${() => this.scrollByPage(-1)}
              >
                ‹
              </button>
              <button
                class="arrow next"
                type="button"
                aria-label="Avançar pôsteres"
                ?hidden=${!this.canGoForward}
                @click=${() => this.scrollByPage(1)}
              >
                ›
              </button>
            ` : p}
      ${this.stale ? n`<span class="state stale" role="status">${f(this.hass?.language, "stale")}</span>` : p}
      ${this.partial ? n`<span class="state partial" role="status">${f(this.hass?.language, "partialShort")}</span>` : p}
    `;
  }
  track() {
    return this.renderRoot.querySelector(".track");
  }
  resetForItems(t = this.items.map((e) => e.ref).join("|")) {
    this.itemSignature = t;
    const e = this.track();
    e && (e.scrollLeft = 0), this.updateNavigation();
    const i = this.items[0];
    i && this.announceFocus(i);
  }
  updateNavigation() {
    const t = this.track();
    t && (this.canGoBack = t.scrollLeft > 2, this.canGoForward = t.scrollLeft + t.clientWidth < t.scrollWidth - 2);
  }
  scrollByPage(t) {
    const e = this.track();
    e && e.scrollBy({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      left: t * e.clientWidth * 0.82
    });
  }
  announceFocus(t) {
    t.ref !== this.focusedRef && this.dispatchEvent(
      new CustomEvent("octopus-media-focus", {
        bubbles: !0,
        composed: !0,
        detail: { ref: t.ref }
      })
    );
  }
  accessibleLabel(t) {
    const e = this.metadata(t);
    return e ? `${t.title}, ${e}` : t.title;
  }
  badge(t) {
    if (this.variant === "upcoming") return t.type === "episode" ? "EPISÓDIO" : "FILME";
    if (t.type === "episode" && "season" in t && t.season !== null) {
      const e = `T${String(t.season).padStart(2, "0")}`;
      return t.episode === null ? e : `${e}E${String(t.episode).padStart(2, "0")}`;
    }
    return f(this.hass?.language, t.type);
  }
  metadata(t) {
    if (this.variant === "upcoming" && "release_at" in t) {
      const i = this.upcomingDate(t);
      return t.type === "episode" ? [t.season_number !== null && t.season_number !== void 0 ? `T${String(t.season_number).padStart(2, "0")}${t.episode_number === null || t.episode_number === void 0 ? "" : `E${String(t.episode_number).padStart(2, "0")}`}` : "", i].filter(Boolean).join(" · ") : [i, this.releaseType(t.release_type)].filter(Boolean).join(" · ");
    }
    const e = [];
    if (this.showDates)
      if ("season" in t && t.season !== null) {
        const i = `T${String(t.season).padStart(2, "0")}`;
        e.push(
          t.episode === null ? i : `${i}E${String(t.episode).padStart(2, "0")}`
        );
      } else "year" in t && t.year !== null ? e.push(String(t.year)) : "release_at" in t ? e.push(this.formatDate(t.release_at)) : t.subtitle && e.push(t.subtitle);
    return this.showRatings && "rating" in t && t.rating !== null && e.push(`★ ${t.rating.toFixed(1)}`), e.join(" · ");
  }
  upcomingEpisodeSubtitle(t) {
    if (!(this.variant !== "upcoming" || t.type !== "episode" || !this.wide))
      return t.subtitle ?? void 0;
  }
  upcomingDate(t) {
    if (t.relative_day === "today") return "HOJE";
    if (t.relative_day === "tomorrow") return "AMANHÃ";
    const e = t.all_day && /^\d{4}-\d{2}-\d{2}$/.test(t.release_at) ? /* @__PURE__ */ new Date(`${t.release_at}T12:00:00Z`) : new Date(t.release_at);
    if (Number.isNaN(e.getTime())) return "";
    const i = new Intl.DateTimeFormat(this.hass?.language ?? "pt-BR", {
      day: "2-digit",
      month: "short",
      timeZone: this.hass?.config.time_zone ?? "UTC"
    }).format(e).replace(".", "").replace(/\s+DE\s+/i, " ").toUpperCase();
    if (t.all_day) return i;
    const s = new Intl.DateTimeFormat(this.hass?.language ?? "pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !1,
      timeZone: this.hass?.config.time_zone ?? "UTC"
    }).format(e);
    return `${i} · ${s}`;
  }
  releaseType(t) {
    if (t)
      return { digital: "Digital", physical: "Físico", cinema: "Cinema", theatrical: "Cinema" }[t.toLowerCase()];
  }
  formatDate(t) {
    const e = new Date(t);
    return Number.isNaN(e.getTime()) ? "" : new Intl.DateTimeFormat(this.hass?.language ?? "pt-BR", {
      day: "2-digit",
      month: "short",
      timeZone: this.hass?.config.time_zone ?? "UTC"
    }).format(e);
  }
};
b.styles = k`
    :host {
      display: block;
      height: 100%;
      min-width: 0;
      position: relative;
    }
    .track {
      align-items: center;
      display: flex;
      gap: var(--octopus-strip-gap, 10px);
      height: 100%;
      justify-content: flex-start;
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-inline: contain;
      scroll-behavior: smooth;
      scrollbar-width: none;
      touch-action: pan-x pan-y;
    }
    .track::-webkit-scrollbar {
      display: none;
    }
    .poster {
      appearance: none;
      background: transparent;
      border: 0;
      box-sizing: border-box;
      color: inherit;
      cursor: pointer;
      flex: 0 0 var(--octopus-strip-poster-width);
      height: var(--octopus-strip-poster-height);
      margin: 0;
      padding: 0;
      position: relative;
      scroll-snap-align: start;
      text-align: left;
      transform: translateY(0) scale(1);
      transition:
        transform 150ms ease,
        filter 150ms ease;
      width: var(--octopus-strip-poster-width);
    }
    .poster:first-child {
      transform-origin: left center;
    }
    .frame {
      aspect-ratio: 2 / 3;
      border: 1px solid rgb(225 236 247 / 16%);
      border-radius: 9px;
      box-shadow: 0 7px 15px rgb(0 0 0 / 36%);
      box-sizing: border-box;
      display: block;
      height: 100%;
      overflow: hidden;
      position: relative;
      transition:
        border-color 150ms ease,
        box-shadow 150ms ease;
      width: 100%;
    }
    octopus-media-image {
      height: 100%;
      width: 100%;
    }
    .copy-gradient {
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgb(2 4 8 / 3%) 34%,
        rgb(2 4 8 / 16%) 54%,
        rgb(2 4 8 / 58%) 76%,
        rgb(2 4 8 / 94%) 100%
      );
      bottom: 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      height: 42%;
      justify-content: flex-end;
      left: 0;
      padding: 20px 6px 6px;
      position: absolute;
      right: 0;
    }
    .title {
      color: rgb(242 244 248 / 88%);
      display: -webkit-box;
      font-size: 10.5px;
      font-weight: 600;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      letter-spacing: -0.01em;
      line-height: 1.06;
      overflow: hidden;
      overflow-wrap: anywhere;
    }
    .metadata {
      color: rgb(203 213 226 / 66%);
      font-size: 8.5px;
      line-height: 1.04;
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :host([wide]) .metadata {
      color: rgb(111 220 231 / 82%);
    }
    .episode-subtitle {
      color: rgb(203 213 226 / 58%);
      display: none;
      font-size: 8px;
      line-height: 1.04;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :host([wide]) .episode-subtitle {
      display: block;
    }
    .badge {
      backdrop-filter: blur(7px);
      background: rgb(3 7 12 / 70%);
      border: 1px solid rgb(230 239 247 / 16%);
      border-radius: 999px;
      color: rgb(242 244 248 / 84%);
      font-size: 7.75px;
      left: 5px;
      line-height: 14px;
      max-width: calc(100% - 10px);
      overflow: hidden;
      padding: 0 4px;
      position: absolute;
      text-overflow: ellipsis;
      top: 5px;
      white-space: nowrap;
    }
    .poster:hover,
    .poster:focus-visible,
    .poster[data-focused="true"] {
      filter: brightness(1.04);
      transform: translateY(-3px) scale(1.02);
      z-index: 2;
    }
    .poster:hover .frame,
    .poster:focus-visible .frame,
    .poster[data-focused="true"] .frame {
      border-color: color-mix(
        in srgb,
        var(--octopus-media-accent, #aa75f2) 72%,
        rgb(97 211 226 / 45%)
      );
      box-shadow:
        0 15px 29px rgb(0 0 0 / 52%),
        0 0 0 1px rgb(97 211 226 / 12%),
        0 0 17px color-mix(in srgb, var(--octopus-media-accent, #aa75f2) 28%, transparent);
    }
    .poster:hover .title,
    .poster:focus-visible .title,
    .poster[data-focused="true"] .title {
      color: #fff;
    }
    .arrow {
      align-items: center;
      backdrop-filter: blur(8px);
      background: rgb(4 7 13 / 62%);
      border: 1px solid rgb(222 231 242 / 16%);
      border-radius: 999px;
      color: rgb(244 247 251 / 76%);
      cursor: pointer;
      display: flex;
      font-size: 14px;
      height: 22px;
      justify-content: center;
      opacity: 0.4;
      padding: 0;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 22px;
      z-index: 4;
    }
    .arrow:hover,
    .arrow:focus-visible {
      opacity: 0.94;
    }
    .arrow[hidden] {
      display: none;
    }
    .previous {
      left: -6px;
    }
    .next {
      right: -6px;
    }
    .state {
      bottom: -1px;
      font-size: 8px;
      position: absolute;
      right: 4px;
    }
    .stale {
      color: #f4c96d;
    }
    .partial {
      color: #d7b6ff;
    }
    :host([wide]) .previous {
      left: -30px;
    }
    :host([wide]) .next {
      right: -30px;
    }
    @media (pointer: coarse) {
      .arrow {
        display: none;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .track {
        scroll-behavior: auto;
      }
      .poster,
      .frame {
        transition: none;
      }
    }
  `;
y([
  d({ attribute: !1 })
], b.prototype, "hass", 2);
y([
  d({ attribute: !1 })
], b.prototype, "items", 2);
y([
  d({ type: String })
], b.prototype, "entryId", 2);
y([
  d({ type: String })
], b.prototype, "focusedRef", 2);
y([
  d({ type: Number })
], b.prototype, "posterHeight", 2);
y([
  d({ type: Number })
], b.prototype, "posterWidth", 2);
y([
  d({ type: Number })
], b.prototype, "gap", 2);
y([
  d({ type: Boolean, reflect: !0 })
], b.prototype, "wide", 2);
y([
  d({ type: Boolean })
], b.prototype, "showTitles", 2);
y([
  d({ type: Boolean })
], b.prototype, "showDates", 2);
y([
  d({ type: Boolean })
], b.prototype, "showRatings", 2);
y([
  d({ type: Boolean })
], b.prototype, "showBadges", 2);
y([
  d({ type: Boolean })
], b.prototype, "showArrows", 2);
y([
  d({ type: String })
], b.prototype, "variant", 2);
y([
  d({ type: Boolean })
], b.prototype, "partial", 2);
y([
  d({ type: Boolean })
], b.prototype, "stale", 2);
y([
  v()
], b.prototype, "canGoBack", 2);
y([
  v()
], b.prototype, "canGoForward", 2);
b = y([
  P("octopus-media-strip")
], b);
const Ii = 18, Ti = 70, Oi = 30, Ri = 0.22;
function Ce(t, e, i = "auto", s = Number.POSITIVE_INFINITY) {
  const r = t < 560, a = Math.max(1, t - (r ? Ii : Ti)), c = r ? 3 : 5;
  let h = Math.max(1, Math.min(i === "auto" ? c : i, Math.max(1, s)));
  const u = r ? 10 : 12, g = Math.max(1, e - Oi), w = (se) => {
    const Te = s > se, dt = Te ? Ri : 0, ht = Te ? se : Math.max(0, se - 1);
    return Math.max(1, (a - ht * u) / (se + dt) * 1.5);
  };
  let m = w(h);
  const $ = Math.min(c, Math.max(1, s));
  h < $ && m > g && s > h && (h = $, m = w(h));
  const Ee = Math.min(g, m), te = Ee * (2 / 3), ie = Math.max(
    1,
    Math.min(s, Math.floor((a + u) / (te + u)))
  ), ct = s > ie, pt = ie * te + Math.max(0, ie - 1) * u, Ie = ct ? Math.max(0, a - pt - u) : 0;
  return {
    gap: u,
    peekFraction: Ie / te,
    peekWidth: Ie,
    posterHeight: Ee,
    posterWidth: te,
    usefulWidth: a,
    visibleFullItems: ie
  };
}
const Mi = ({
  config: t,
  entryId: e,
  focusedItemRef: i,
  hass: s,
  height: r,
  items: o,
  width: a
}) => {
  const c = Ce(a, r, t.posters_visible, o.length);
  return n`
    <octopus-media-strip
      class="layout strip"
      data-layout="strip"
      .hass=${s}
      .items=${o}
      .entryId=${e}
      .focusedRef=${i}
      .posterHeight=${c.posterHeight}
      .posterWidth=${c.posterWidth}
      .gap=${c.gap}
      .wide=${a >= 560}
      .showTitles=${t.show_titles}
      .showDates=${t.show_dates}
      .showRatings=${t.show_ratings}
      .showBadges=${t.show_badges}
      .showArrows=${t.show_arrows}
    ></octopus-media-strip>
  `;
}, zi = ({
  config: t,
  entryId: e,
  hass: i,
  items: s,
  width: r,
  height: o,
  partial: a,
  stale: c
}) => {
  const l = Ce(r, o, t.posters_visible, s.length);
  return n`
    <octopus-media-strip
      class="layout upcoming"
      data-layout="upcoming"
      variant="upcoming"
      .partial=${a ?? !1}
      .stale=${c ?? !1}
      .hass=${i}
      .items=${s}
      .entryId=${e}
      .posterHeight=${l.posterHeight}
      .posterWidth=${l.posterWidth}
      .gap=${l.gap}
      .wide=${r >= 560}
      .showTitles=${t.show_titles}
      .showDates=${!0}
      .showRatings=${!1}
      .showBadges=${t.show_badges}
      .showArrows=${t.show_arrows}
    ></octopus-media-strip>
  `;
};
function Ke(t, e) {
  switch (t) {
    case "grid":
      return pi(e);
    case "hero":
      return xi(e);
    case "compact":
      return oi(e);
    case "portrait":
      return Pi(e);
    case "list":
      return ki(e);
    case "strip":
      return Mi(e);
  }
}
function Ni(t) {
  return zi(t);
}
var Fi = Object.defineProperty, Di = Object.getOwnPropertyDescriptor, ge = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Di(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && Fi(e, i, r), r;
};
const Bi = Array.from({ length: 12 }, (t, e) => ({
  ref: `editor_fixture_${String(e + 1).padStart(2, "0")}`,
  type: e === 2 ? "episode" : "movie",
  title: e === 1 ? "The Very Long Fictional Voyage Beyond Quiet Constellations" : [
    "Violet Tides",
    "Silent Meridian",
    "Octopus Station",
    "Neon Harbor",
    "Glass Moons",
    "Midnight Signal"
  ][e % 6] ?? "Fixture Media",
  subtitle: "Fictional preview",
  year: 2030 - e % 4,
  season: e === 2 ? 2 : null,
  episode: e === 2 ? 4 : null,
  episode_count: e === 2 ? 1 : 0,
  added_at: "2030-04-05T10:00:00Z",
  rating: 7.2 + e % 7 / 10,
  poster_ref: null,
  still_ref: null,
  backdrop_ref: null
})), be = [
  {
    ref: "editor_playing_fixture_01",
    device_name: "Fictional display",
    device_alias: "Octopus lounge",
    user_name: "Demo viewer",
    state: "playing",
    type: "episode",
    title: "Harbor of Small Comets",
    genres: ["Drama", "Adventure"],
    rating: 8.7,
    video_resolution: "1080p",
    video_hdr: !1,
    audio_channels: "5.1",
    subtitle: "T02E04 · A Map of Quiet Water",
    position_seconds: 1240,
    duration_seconds: 3120,
    progress: 39.74,
    poster_ref: null,
    still_ref: null,
    backdrop_ref: null,
    updated_at: "2030-04-05T12:00:00Z"
  },
  {
    ref: "editor_playing_fixture_02",
    device_name: "Fictional tablet",
    device_alias: null,
    user_name: "Sample viewer",
    state: "paused",
    type: "movie",
    title: "Lanterns Beyond Europa",
    genres: ["Science fiction"],
    rating: null,
    video_resolution: null,
    video_hdr: !1,
    audio_channels: null,
    subtitle: "2029",
    position_seconds: 1800,
    duration_seconds: 5400,
    progress: 33.33,
    poster_ref: null,
    still_ref: null,
    backdrop_ref: null,
    updated_at: "2030-04-05T12:00:00Z"
  }
];
let W = class extends x {
  constructor() {
    super(...arguments), this.entries = [], this.previewWidth = 390, this.onBooleanChange = (t) => {
      const e = t.target, i = e.dataset.field;
      i && this.updateConfig({ [i]: e.checked });
    };
  }
  set hass(t) {
    this.hassValue = t, this.loadEntries();
  }
  get hass() {
    return this.hassValue;
  }
  setConfig(t) {
    this.config = nt(t);
  }
  render() {
    if (!this.config) return n``;
    const t = this.compatibleModes();
    return n`
      <div class="form">
        <label>
          Integration
          <select .value=${this.config.entry_id} @change=${this.onEntryChange}>
            ${this.entries.map(
      (e) => n`<option value=${e.entry_id}>${e.title}</option>`
    )}
          </select>
        </label>
        <label>
          Mode
          <select .value=${this.config.mode} @change=${this.onModeChange}>
            ${t.map((e) => n`<option value=${e}>${e}</option>`)}
          </select>
        </label>
        <label>
          Layout
          <select .value=${this.config.layout} @change=${this.onLayoutChange}>
            ${ot.map((e) => n`<option value=${e}>${e}</option>`)}
          </select>
        </label>
        <label>
          Title
          <input .value=${this.config.title ?? ""} @input=${this.onTitleInput} />
        </label>
        <label>
          Visual concept
          <select .value=${this.config.visual_concept} @change=${this.onConceptChange}>
            ${at.map((e) => n`<option value=${e}>${e}</option>`)}
          </select>
        </label>
        <label>
          Title position
          <select .value=${this.config.title_position} @change=${this.onTitlePositionChange}>
            <option value="overlay">overlay</option>
            <option value="below">below</option>
          </select>
        </label>
        <label>
          Height
          <input
            .value=${String(this.config.height)}
            inputmode="numeric"
            @change=${this.onHeightChange}
          />
        </label>
        <label>
          Theme
          <select .value=${this.config.theme} @change=${this.onThemeChange}>
            ${ei.map((e) => n`<option value=${e}>${e}</option>`)}
          </select>
        </label>
        <label>
          Accent color
          <input
            type="color"
            .value=${this.config.accent_color ?? "#8b5cf6"}
            @input=${this.onAccentInput}
          />
        </label>
        <label>
          Item count
          <input
            type="number"
            min="1"
            max="50"
            .value=${String(this.config.item_count)}
            @change=${this.onItemCountChange}
          />
        </label>
        <fieldset>
          <legend>${this.isPlayingHeroPreview() ? "Playing hero" : "Strip content"}</legend>
          ${this.booleanControl("Titles", "show_titles", this.config.show_titles)}
          ${this.booleanControl("Badges", "show_badges", this.config.show_badges)}
          ${this.isPlayingHeroPreview() ? n`
                  ${this.booleanControl("Device", "show_device", this.config.show_device)}
                  ${this.booleanControl("User", "show_user", this.config.show_user)}
                  ${this.booleanControl("Progress", "show_progress", this.config.show_progress)}
                  ${this.booleanControl("Time", "show_time", this.config.show_time)}
                  ${this.booleanControl("Autoplay", "autoplay", this.config.autoplay)}
                  ${this.booleanControl(
      "Indicators",
      "show_indicators",
      this.config.show_indicators
    )}
                ` : ""}
          ${this.booleanControl("Arrows", "show_arrows", this.config.show_arrows)}
        </fieldset>
        ${this.isPlayingHeroPreview() ? n`<label>
                Cycle interval (seconds)
                <input
                  type="number"
                  min="5"
                  max="3600"
                  .value=${String(this.config.cycle_interval)}
                  @change=${this.onCycleIntervalChange}
                />
              </label>` : ""}
        <section
          class="preview-panel"
          aria-label=${this.isPlayingHeroPreview() ? "Playing hero preview" : "Official strip preview"}
        >
          <div class="preview-toolbar">
            <strong
              >${this.isPlayingHeroPreview() ? "Playing hero preview" : "Official strip preview"}</strong
            >
            <div class="preview-widths" role="group" aria-label="Preview width">
              ${[390, 800].map(
      (e) => n`
                  <button
                    type="button"
                    data-selected=${String(e === this.previewWidth)}
                    @click=${() => {
        this.previewWidth = e;
      }}
                  >
                    ${e}px
                  </button>
                `
    )}
            </div>
          </div>
          ${this.renderPreview()}
          <p>Prévia determinística: títulos e imagens são inteiramente fictícios.</p>
        </section>
      </div>
    `;
  }
  renderPreview() {
    if (!this.config) return n``;
    const t = typeof this.config.height == "number" ? Math.min(280, Math.max(180, this.config.height)) : this.previewWidth === 390 ? 210 : 240;
    if (this.isPlayingHeroPreview())
      return this.renderPlayingHeroPreview(t);
    const e = Bi.slice(0, this.config.item_count), i = Ce(
      this.previewWidth,
      t,
      this.config.posters_visible,
      e.length
    ), s = [
      `--preview-width:${String(this.previewWidth)}px`,
      `--preview-height:${String(t)}px`,
      `--octopus-media-accent:${this.config.accent_color ?? "#8b5cf6"}`
    ].join(";");
    return n`
      <article class="preview-card" data-wide=${String(this.previewWidth >= 560)} style=${s}>
        <header>
          <span
            ><ha-icon icon="mdi:octopus"></ha-icon>${this.config.title ?? "Recém-adicionados"}</span
          >
          <small>${e.length}</small>
        </header>
        <octopus-media-strip
          .hass=${void 0}
          .items=${e}
          .entryId=${"editor-fixture"}
          .focusedRef=${e[0]?.ref}
          .posterHeight=${i.posterHeight}
          .posterWidth=${i.posterWidth}
          .gap=${i.gap}
          .wide=${this.previewWidth >= 560}
          .showTitles=${this.config.show_titles}
          .showDates=${this.config.show_dates}
          .showRatings=${this.config.show_ratings}
          .showBadges=${this.config.show_badges}
          .showArrows=${this.config.show_arrows}
        ></octopus-media-strip>
      </article>
    `;
  }
  renderPlayingHeroPreview(t) {
    if (!this.config) return n``;
    const e = [
      `--preview-width:${String(this.previewWidth)}px`,
      `--preview-height:${String(t)}px`,
      `--octopus-media-accent:${this.config.accent_color ?? "#8b5cf6"}`
    ].join(";");
    return n`
      <article class="preview-card playing-preview" style=${e}>
        <header>
          <span><ha-icon icon="mdi:octopus"></ha-icon>${this.config.title ?? "Tocando agora"}</span>
          <small>${be.length}</small>
        </header>
        <octopus-playing-hero
          .config=${this.config}
          .hass=${void 0}
          .entryId=${"editor-fixture"}
          .items=${be}
          .focusedRef=${be[0]?.ref}
          .language=${this.hassValue?.language}
          .heroState=${"ready"}
        ></octopus-playing-hero>
      </article>
    `;
  }
  isPlayingHeroPreview() {
    return this.config?.mode === "playing" && (this.config.layout === "hero" || this.config.layout === "auto");
  }
  booleanControl(t, e, i) {
    return n`
      <label class="check">
        <input
          type="checkbox"
          data-field=${e}
          .checked=${i}
          @change=${this.onBooleanChange}
        />
        ${t}
      </label>
    `;
  }
  async loadEntries() {
    if (this.hassValue)
      try {
        this.entries = await Bt(this.hassValue), this.entries.length === 1 && this.config?.entry_id === "select_entry" && this.updateConfig({ entry_id: this.entries[0]?.entry_id ?? "select_entry" });
      } catch {
        this.entries = [];
      }
  }
  compatibleModes() {
    const t = this.entries.find((s) => s.entry_id === this.config?.entry_id);
    if (!t) return [...ye];
    const e = ye.filter((s) => s === "carousel" || t.capabilities[s]), i = e.some((s) => s !== "carousel");
    return e.filter((s) => s !== "carousel" || i);
  }
  updateConfig(t) {
    this.config && (this.config = { ...this.config, ...t }, this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: !0,
        composed: !0,
        detail: { config: this.config }
      })
    ));
  }
  onEntryChange(t) {
    this.updateConfig({ entry_id: t.target.value });
  }
  onModeChange(t) {
    this.updateConfig({ mode: t.target.value });
  }
  onLayoutChange(t) {
    this.updateConfig({ layout: t.target.value });
  }
  onTitleInput(t) {
    this.updateConfig({ title: t.target.value });
  }
  onConceptChange(t) {
    this.updateConfig({
      visual_concept: t.target.value
    });
  }
  onTitlePositionChange(t) {
    this.updateConfig({
      title_position: t.target.value
    });
  }
  onHeightChange(t) {
    const e = t.target.value.trim();
    this.updateConfig({ height: e === "auto" ? "auto" : Number(e) });
  }
  onThemeChange(t) {
    this.updateConfig({ theme: t.target.value });
  }
  onAccentInput(t) {
    this.updateConfig({ accent_color: t.target.value });
  }
  onItemCountChange(t) {
    const e = Number(t.target.value);
    this.updateConfig({ item_count: Math.min(50, Math.max(1, Math.round(e))) });
  }
  onCycleIntervalChange(t) {
    const e = Number(t.target.value);
    this.updateConfig({ cycle_interval: Math.min(3600, Math.max(5, Math.round(e))) });
  }
};
W.styles = k`
    .form {
      display: grid;
      gap: 12px;
      padding: 8px 0;
    }
    label {
      display: grid;
      font: inherit;
      gap: 5px;
    }
    fieldset {
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 8px;
      display: flex;
      gap: 16px;
      margin: 0;
      padding: 10px;
    }
    .check {
      align-items: center;
      display: flex;
      gap: 6px;
    }
    .check input {
      min-height: 0;
    }
    input,
    select {
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 8px;
      color: var(--primary-text-color, #111);
      font: inherit;
      min-height: 44px;
      padding: 8px;
    }
    p {
      color: var(--secondary-text-color, #666);
      font-size: 12px;
      margin: 0;
    }
    .preview-panel {
      display: grid;
      gap: 8px;
      min-width: 0;
      overflow: hidden;
    }
    .preview-toolbar {
      align-items: center;
      display: flex;
      justify-content: space-between;
    }
    .preview-widths {
      display: flex;
      gap: 6px;
    }
    button {
      background: var(--secondary-background-color, #eef0f3);
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 7px;
      color: var(--primary-text-color, #111);
      cursor: pointer;
      padding: 6px 9px;
    }
    button[data-selected="true"] {
      border-color: var(--octopus-media-accent, #8b5cf6);
      box-shadow: 0 0 0 1px var(--octopus-media-accent, #8b5cf6);
    }
    .preview-card {
      --octopus-text: #f3f6fb;
      background:
        radial-gradient(circle at 13% 35%, rgb(24 174 191 / 34%), transparent 34%),
        radial-gradient(circle at 72% 24%, rgb(139 82 214 / 32%), transparent 37%),
        linear-gradient(105deg, #032d36, #121329 48%, #321447);
      border-radius: 14px;
      box-sizing: border-box;
      color: #f3f6fb;
      display: grid;
      grid-template-rows: 22px minmax(0, 1fr);
      height: var(--preview-height);
      max-width: 100%;
      overflow: hidden;
      padding: 0 9px;
      width: var(--preview-width);
    }
    .preview-card[data-wide="true"] {
      padding-inline: 35px;
    }
    .preview-card header {
      align-items: center;
      display: flex;
      font-size: 12.5px;
      justify-content: space-between;
    }
    .preview-card header span {
      align-items: center;
      display: flex;
      gap: 5px;
    }
    .preview-card ha-icon {
      color: var(--octopus-media-accent, #aa75f2);
      height: 14px;
      width: 14px;
    }
    .preview-card small {
      opacity: 0.7;
    }
  `;
ge([
  v()
], W.prototype, "config", 2);
ge([
  v()
], W.prototype, "entries", 2);
ge([
  v()
], W.prototype, "previewWidth", 2);
W = ge([
  P("octopus-media-editor")
], W);
const Hi = k`
  :host {
    --octopus-bg: #060a12;
    --octopus-surface: rgb(13 22 35 / 92%);
    --octopus-surface-elevated: #111c2a;
    --octopus-accent: #8b5cf6;
    --octopus-accent-secondary: #39c6c8;
    --octopus-text: #f3f6fb;
    --octopus-muted: #8795a8;
    --octopus-border: rgb(147 171 196 / 17%);
    --octopus-radius-card: 19px;
    --octopus-radius-poster: 12px;
    --octopus-media-accent: var(--octopus-accent);
    --octopus-media-background: var(--octopus-surface);
    --octopus-media-border: var(--octopus-border);
    --octopus-media-title: var(--octopus-text);
    --octopus-media-text: var(--octopus-text);
    --octopus-media-muted: var(--octopus-muted);
    display: block;
    min-width: 0;
  }
  .card {
    background:
      radial-gradient(circle at 14% -24%, rgb(68 202 204 / 13%), transparent 42%),
      radial-gradient(circle at 92% 112%, rgb(139 92 246 / 13%), transparent 46%),
      linear-gradient(145deg, #0d1724 0%, var(--octopus-bg) 72%);
    border: 1px solid var(--octopus-border);
    border-radius: var(--octopus-radius-card);
    box-shadow:
      0 18px 42px rgb(0 0 0 / 28%),
      inset 0 1px rgb(255 255 255 / 4%);
    box-sizing: border-box;
    color: var(--octopus-text);
    container-type: size;
    display: grid;
    font-family: var(--paper-font-body1_-_font-family, Inter, system-ui, sans-serif);
    gap: 6px;
    grid-template-rows: 22px minmax(0, 1fr);
    min-width: 0;
    overflow: hidden;
    padding: 9px 10px 10px;
    position: relative;
  }
  .card::after {
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--octopus-accent) 58%, transparent),
      transparent
    );
    content: "";
    height: 1px;
    left: 12%;
    opacity: 0.5;
    position: absolute;
    right: 56%;
    top: 0;
  }
  .card[data-concept="gallery-clean"] {
    --octopus-surface: #0b1420;
    --octopus-surface-elevated: #121d29;
    --octopus-accent: #6d7f93;
    --octopus-accent-secondary: #48b7b9;
    background: linear-gradient(155deg, #101a27, #080d15 76%);
    box-shadow: 0 14px 34px rgb(0 0 0 / 22%);
  }
  .card[data-concept="gallery-clean"]::after {
    opacity: 0.18;
  }
  .card[data-concept="octopus-glass"] {
    --octopus-bg: #070813;
    --octopus-surface: rgb(17 17 34 / 76%);
    --octopus-surface-elevated: rgb(24 28 48 / 90%);
    --octopus-accent: #9b6cff;
    --octopus-accent-secondary: #3ed5d0;
    backdrop-filter: blur(18px) saturate(118%);
    background:
      radial-gradient(circle at 12% -18%, rgb(62 213 208 / 16%), transparent 45%),
      radial-gradient(circle at 88% 116%, rgb(155 108 255 / 20%), transparent 48%),
      linear-gradient(145deg, rgb(19 23 43 / 91%), rgb(6 8 18 / 95%));
    box-shadow:
      0 18px 44px rgb(0 0 0 / 31%),
      inset 0 1px rgb(255 255 255 / 6%);
  }
  .card[data-concept="cinematic-octopus-gallery"] {
    --octopus-bg: #060710;
    --octopus-surface: rgb(15 16 33 / 78%);
    --octopus-surface-elevated: rgb(22 25 43 / 88%);
    --octopus-accent: #9c6dff;
    --octopus-accent-secondary: #3bd4d0;
    backdrop-filter: blur(18px) saturate(116%);
    background:
      radial-gradient(circle at 12% -14%, rgb(50 220 213 / 24%), transparent 44%),
      radial-gradient(circle at 88% 108%, rgb(158 91 255 / 34%), transparent 52%),
      linear-gradient(145deg, rgb(11 28 42 / 95%), rgb(13 8 30 / 97%));
    gap: 3px;
    grid-template-rows: 18px minmax(0, 1fr);
    isolation: isolate;
    padding: 6px 8px;
  }
  .card[data-concept="cinematic-octopus-gallery"]::after {
    opacity: 0.34;
    z-index: 4;
  }
  .card[data-concept="cinematic-octopus-gallery"] header,
  .card[data-concept="cinematic-octopus-gallery"] .content {
    position: relative;
    z-index: 3;
  }
  .card[data-concept="cinematic-octopus-gallery"] h2 {
    font-size: 12.5px;
  }
  .card[data-concept="cinematic-octopus-gallery"] .context {
    font-size: 8.5px;
    height: 16px;
    min-width: 16px;
  }
  .card[data-playing-hero="true"] {
    background: transparent;
    border: 0;
    box-shadow: none;
    gap: 0;
    grid-template-rows: minmax(0, 1fr);
    border-radius: 0;
    overflow: visible;
    padding: 0;
  }
  .card[data-playing-hero="true"]::after {
    display: none;
  }
  .card[data-playing-hero="true"] .content {
    height: 100%;
  }
  .ambient-background {
    filter: blur(28px) brightness(0.48) saturate(0.58) contrast(1.12);
    inset: -34px;
    opacity: 0.92;
    pointer-events: none;
    position: absolute;
    transform: scale(1.16);
    z-index: -4;
  }
  .ambient-preload {
    height: 1px;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    position: absolute;
    width: 1px;
    z-index: -1;
  }
  .ambient-color,
  .ambient-vignette {
    inset: 0;
    pointer-events: none;
    position: absolute;
    z-index: -3;
  }
  .ambient-color {
    background:
      radial-gradient(circle at 15% 49%, rgb(6 121 137 / 42%), transparent 39%),
      radial-gradient(circle at 56% 18%, rgb(97 131 162 / 14%), transparent 28%),
      radial-gradient(circle at 88% 45%, rgb(111 52 166 / 48%), transparent 46%),
      linear-gradient(100deg, rgb(2 37 46 / 66%), rgb(20 13 36 / 42%) 54%, rgb(58 21 82 / 64%));
  }
  .card[data-layout="strip"][data-has-ambient="false"] .ambient-color {
    background:
      radial-gradient(circle at 13% 35%, rgb(24 174 191 / 34%), transparent 34%),
      radial-gradient(circle at 72% 24%, rgb(139 82 214 / 32%), transparent 37%),
      radial-gradient(circle at 91% 82%, rgb(67 32 116 / 48%), transparent 42%),
      linear-gradient(105deg, #032d36, #121329 48%, #321447);
  }
  .ambient-vignette {
    box-shadow: inset 0 0 78px 21px rgb(0 0 0 / 58%);
    z-index: -1;
  }
  .card[data-layout="strip"] {
    background: #06080d;
    border-color: color-mix(in srgb, var(--divider-color, #778198) 38%, transparent);
    border-radius: 14px;
    box-shadow: none;
    gap: 0;
    grid-template-rows: 22px minmax(0, 1fr);
    isolation: isolate;
    padding: 0 9px;
  }
  .card[data-mode="upcoming"] {
    border: 0;
    box-shadow: none;
    grid-template-rows: 22px 122px;
    min-height: 160px;
  }
  .card[data-mode="upcoming"].fixed {
    height: 160px;
  }
  .card[data-mode="upcoming"] .heading {
    background: transparent;
    border: 0;
    border-radius: 0;
    padding: 2px 2px 0;
  }
  .card[data-mode="upcoming"] .heading ha-icon {
    color: var(--octopus-media-accent, #aa75f2);
  }
  .card[data-mode="upcoming"] .context {
    display: none;
  }
  .card[data-layout="strip"][data-wide="true"] {
    padding-inline: 35px;
  }
  .card[data-layout="strip"]::after {
    display: none;
  }
  .card[data-layout="strip"] header,
  .card[data-layout="strip"] .content {
    min-width: 0;
    position: relative;
    z-index: 1;
  }
  .card[data-layout="strip"] header {
    gap: 6px;
    padding: 2px 2px 0;
  }
  .card[data-layout="strip"] .heading {
    align-items: center;
    backdrop-filter: blur(8px);
    background: rgb(5 9 16 / 28%);
    border: 1px solid rgb(188 143 241 / 10%);
    border-radius: 999px;
    display: flex;
    gap: 5px;
    min-width: 0;
    padding: 2px 6px 2px 4px;
  }
  .card[data-layout="strip"] ha-icon {
    color: var(--octopus-media-accent, #aa75f2);
    height: 14px;
    width: 14px;
  }
  .card[data-layout="strip"] h2 {
    font-size: 12.5px;
    font-weight: 620;
    line-height: 1;
  }
  .card[data-layout="strip"] .context {
    background: rgb(13 17 28 / 62%);
    border-color: rgb(174 128 237 / 20%);
    color: rgb(228 218 244 / 72%);
    font-size: 9px;
    height: 15px;
    min-width: 16px;
  }
  .card[data-mode="upcoming"] .heading {
    backdrop-filter: none;
    background: transparent;
    border: 0;
    border-radius: 0;
    padding: 2px 2px 0;
  }
  .card[data-mode="upcoming"] .context {
    display: none;
  }
  .card[data-layout="strip"] .content {
    gap: 0;
  }
  .card[data-header-alignment="center"] header {
    justify-content: center;
  }
  .card[data-header-alignment="center"] .context {
    position: absolute;
    right: 2px;
  }
  .card[data-header-alignment="end"] header {
    flex-direction: row-reverse;
  }
  .card.fixed {
    height: var(--octopus-card-height);
  }
  header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    min-height: 20px;
    min-width: 0;
  }
  .heading {
    align-items: center;
    display: flex;
    gap: 7px;
    min-width: 0;
  }
  ha-icon {
    color: var(--octopus-accent);
    height: 15px;
    width: 15px;
  }
  h2 {
    color: var(--octopus-text);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.01em;
    line-height: 1.1;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .context {
    align-items: center;
    background: color-mix(in srgb, var(--octopus-surface-elevated) 78%, transparent);
    border: 1px solid var(--octopus-border);
    border-radius: 999px;
    color: var(--octopus-muted);
    display: inline-flex;
    font-size: 9px;
    height: 18px;
    justify-content: center;
    min-width: 18px;
    padding-inline: 4px;
  }
  .content {
    display: grid;
    gap: 3px;
    grid-template-rows: minmax(0, 1fr) auto auto;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }
  .layout {
    height: 100%;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }
  .grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(min(138px, 100%), 1fr));
    overflow: auto;
    scrollbar-width: none;
  }
  .grid::-webkit-scrollbar,
  .list::-webkit-scrollbar,
  .portrait::-webkit-scrollbar {
    display: none;
  }
  .hero {
    align-items: center;
    border-radius: calc(var(--octopus-radius-card) - 7px);
    box-sizing: border-box;
    display: grid;
    gap: 14px;
    grid-template-columns: minmax(70px, min(29%, 126px)) minmax(0, 1fr);
    isolation: isolate;
    overflow: hidden;
    padding: 7px 12px 7px 8px;
    position: relative;
  }
  .hero::after {
    background: linear-gradient(
      90deg,
      rgb(5 8 15 / 82%) 0%,
      rgb(5 8 15 / 48%) 48%,
      rgb(5 8 15 / 74%) 100%
    );
    content: "";
    inset: 0;
    position: absolute;
    z-index: -1;
  }
  .hero .hero-backdrop {
    filter: blur(2px) saturate(0.85) brightness(0.52);
    inset: -8px;
    opacity: 0.74;
    position: absolute;
    transform: scale(1.04);
    z-index: -2;
  }
  .hero octopus-media-poster {
    height: 100%;
    min-height: 0;
    position: relative;
  }
  .hero-copy {
    --octopus-metadata-title-line-height: 1.1;
    --octopus-metadata-title-size: clamp(17px, 4.2cqi, 25px);
    display: grid;
    gap: 9px;
    max-height: 100%;
    min-width: 0;
    overflow: hidden;
    position: relative;
  }
  .compact {
    display: grid;
    gap: 7px;
    grid-template-columns: minmax(0, 1.45fr) repeat(2, minmax(0, 1fr));
  }
  .compact-item {
    border-radius: var(--octopus-radius-poster);
    min-width: 0;
    overflow: hidden;
    position: relative;
  }
  .compact-item octopus-media-image {
    height: 100%;
    width: 100%;
  }
  .compact-item::after {
    background: linear-gradient(180deg, transparent 34%, rgb(3 7 14 / 92%));
    content: "";
    inset: 0;
    pointer-events: none;
    position: absolute;
  }
  .compact-overlay {
    bottom: 0;
    display: grid;
    gap: 2px;
    left: 0;
    padding: 7px;
    position: absolute;
    right: 0;
    z-index: 1;
  }
  .compact-overlay strong {
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    font-size: 10px;
    line-height: 1.12;
    overflow: hidden;
  }
  .compact-overlay span {
    color: var(--octopus-muted);
    font-size: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .list {
    display: grid;
    gap: 6px;
    overflow: auto;
    scrollbar-width: none;
  }
  .list-row {
    align-items: center;
    background: color-mix(in srgb, var(--octopus-surface-elevated) 44%, transparent);
    border-radius: 10px;
    display: grid;
    gap: 9px;
    grid-template-columns: auto minmax(0, 1fr) auto;
    min-width: 0;
    padding: 5px;
  }
  .portrait {
    display: grid;
    gap: 11px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    overflow: auto;
    scrollbar-width: none;
  }
  .stale,
  .partial {
    color: #f4c96d;
    font-size: 9px;
    margin: 0;
  }
  .partial {
    color: #d7b6ff;
  }
  .upcoming-empty {
    align-items: center;
    color: var(--octopus-muted);
    display: flex;
    font-size: 11px;
    gap: 7px;
    justify-content: center;
    min-height: 88px;
  }
  .upcoming-empty ha-icon {
    color: var(--octopus-accent-secondary);
    height: 18px;
    width: 18px;
  }
  @media (max-width: 430px) {
    .card {
      padding-inline: 8px;
    }
    .hero {
      gap: 10px;
      grid-template-columns: minmax(68px, 30%) minmax(0, 1fr);
      padding-inline: 6px 9px;
    }
    .compact {
      gap: 5px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
var ji = Object.defineProperty, Ui = Object.getOwnPropertyDescriptor, O = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ui(e, i) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (s ? a(e, i, r) : a(r)) || r);
  return s && r && ji(e, i, r), r;
};
let A = class extends x {
  constructor() {
    super(...arguments), this.loading = !0, this.containerWidth = 390, this.containerHeight = 210, this.localPlaying = [], this.subscriptionPending = !1, this.subscriptionGeneration = 0, this.reconnectDelay = 1e3, this.progressTickAt = 0, this.autoLayout = new ri(), this.onMediaFocus = (t) => {
      if (!this.config) return;
      const e = this.effectiveMode(this.config), i = typeof this.config.height == "number" ? this.config.height : this.containerHeight, s = this.resolveLayout(this.config, e, i), r = e === "playing" && s === "hero";
      if (s !== "strip" && !r) return;
      const o = t.detail;
      if (typeof o.ref != "string" || o.ref === this.focusedItemRef) return;
      const a = this.itemsForMode(e).find((l) => l.ref === o.ref);
      if (!a || (this.focusedItemRef = a.ref, r)) return;
      const c = this.artworkFor(a);
      if (!c) {
        this.ambientArtwork = void 0, this.pendingAmbientArtwork = void 0;
        return;
      }
      if (this.sameArtwork(c, this.ambientArtwork)) {
        this.pendingAmbientArtwork = void 0;
        return;
      }
      this.pendingAmbientArtwork = c;
    }, this.onAmbientPreloadReady = (t) => {
      const e = t.detail;
      typeof e.imageRef != "string" || e.imageRef !== this.pendingAmbientArtwork?.imageRef || (this.ambientArtwork = this.pendingAmbientArtwork, this.pendingAmbientArtwork = void 0);
    };
  }
  set hass(t) {
    this.hassValue = t, this.requestUpdate(), this.ensureSubscription();
  }
  get hass() {
    return this.hassValue;
  }
  setConfig(t) {
    const e = this.config?.entry_id;
    this.config = nt(t), e !== this.config.entry_id && this.resetSubscription(), this.synchronizeFocusAndAmbient(!0), this.ensureSubscription();
  }
  static getStubConfig() {
    return { ...E, sections: [...E.sections] };
  }
  static getConfigElement() {
    return document.createElement("octopus-media-editor");
  }
  getCardSize() {
    return typeof this.config?.height == "number" ? Math.max(1, Math.ceil(this.config.height / 50)) : 4;
  }
  connectedCallback() {
    super.connectedCallback(), this.startResizeObserver(), this.ensureSubscription();
  }
  disconnectedCallback() {
    this.subscriptionGeneration += 1, this.unsubscribe?.(), this.unsubscribe = void 0, this.clearReconnectTimer(), this.stopProgressTimer(), this.resizeObserver?.disconnect(), this.resizeObserver = void 0, this.resizeFrame !== void 0 && cancelAnimationFrame(this.resizeFrame), super.disconnectedCallback();
  }
  render() {
    const t = this.config ?? E, e = this.hassValue?.language, i = this.effectiveMode(t), s = t.title ?? (i === "upcoming" ? this.t("upcoming", e).toUpperCase() : this.t(i, e)), r = t.height, o = typeof r == "number", a = o ? r : this.containerHeight, c = this.resolveLayout(t, i, a), l = c === "strip", h = i === "playing" && c === "hero", u = [
      o ? `--octopus-card-height:${String(r)}px` : "",
      t.accent_color ? `--octopus-media-accent:${t.accent_color}` : ""
    ].filter(Boolean).join(";");
    return n`
      <article
        class=${`card ${o ? "fixed" : ""}`}
        data-theme=${t.theme}
        data-concept=${t.visual_concept}
        data-title-position=${t.title_position}
        data-header-alignment=${t.header_alignment}
        data-layout=${c}
        data-mode=${i}
        data-wide=${String(this.containerWidth >= 560)}
        data-has-ambient=${String(l && !!this.ambientArtwork)}
        data-playing-hero=${String(h)}
        style=${u}
        @octopus-media-focus=${this.onMediaFocus}
      >
        ${l ? this.renderAmbientBackground(t) : p}
        ${h ? p : n`<header>
                <span class="heading">
                  <ha-icon icon="mdi:octopus" aria-hidden="true"></ha-icon>
                  <h2>${s}</h2>
                </span>
                ${this.snapshot && i !== "upcoming" ? n`<span
                        class="context"
                        aria-label=${`${String(this.itemsForMode(i).length)} itens`}
                        >${this.itemsForMode(i).length}</span
                      >` : p}
              </header>`}
        <section class="content">
          ${this.renderContent(t, i, e, c, a)}
        </section>
      </article>
    `;
  }
  renderAmbientBackground(t) {
    return n`
      ${this.ambientArtwork ? n`<octopus-media-image
              class="ambient-background"
              aria-hidden="true"
              .hass=${this.hassValue}
              .entryId=${t.entry_id}
              .imageRef=${this.ambientArtwork.imageRef}
              .variant=${this.ambientArtwork.variant}
              .alt=${""}
              .backdrop=${!0}
            ></octopus-media-image>` : p}
      ${this.pendingAmbientArtwork ? n`<octopus-media-image
              class="ambient-preload"
              aria-hidden="true"
              .hass=${this.hassValue}
              .entryId=${t.entry_id}
              .imageRef=${this.pendingAmbientArtwork.imageRef}
              .variant=${this.pendingAmbientArtwork.variant}
              .alt=${""}
              .backdrop=${!0}
              @octopus-image-ready=${this.onAmbientPreloadReady}
            ></octopus-media-image>` : p}
      <span class="ambient-color" aria-hidden="true"></span>
      <span class="ambient-vignette" aria-hidden="true"></span>
    `;
  }
  renderContent(t, e, i, s, r) {
    if (t.entry_id === ve)
      return n`<octopus-empty-state
        .message=${this.t("notConfigured", i)}
      ></octopus-empty-state>`;
    if (this.loading)
      return n`<octopus-loading-state
        .message=${this.t("loading", i)}
      ></octopus-loading-state>`;
    if (e === "playing" && s === "hero") {
      const l = this.localPlaying.slice(0, t.item_count), h = this.snapshot?.availability.jellyfin.state === "offline", u = this.snapshot?.playing;
      return Ke("hero", {
        config: t,
        entryId: t.entry_id,
        focusedItemRef: this.focusedItemRef ?? l[0]?.ref,
        hass: this.hassValue,
        heroState: l.length > 0 ? "ready" : h || this.error ? "unavailable" : "empty",
        items: l,
        language: i,
        mode: e,
        partial: u?.partial ?? !1,
        serviceOffline: h,
        stale: u?.stale ?? !1,
        height: r,
        width: this.containerWidth
      });
    }
    if (this.error)
      return n`<octopus-error-state
        .message=${this.t("error", i)}
      ></octopus-error-state>`;
    if (!this.snapshot)
      return n`<octopus-empty-state
        .message=${this.t("notConfigured", i)}
      ></octopus-empty-state>`;
    const a = this.itemsForMode(e).slice(0, t.item_count);
    if (e === "upcoming" && this.snapshot.availability.radarr.state === "not_configured" && this.snapshot.availability.sonarr.state === "not_configured")
      return n`<octopus-empty-state
        .message=${this.t("upcomingNotConfigured", i)}
      ></octopus-empty-state>`;
    if ((e === "recent" || e === "playing") && this.snapshot.availability.jellyfin.state === "offline" && a.length === 0)
      return n`<octopus-error-state
        .message=${this.t("unavailable", i)}
      ></octopus-error-state>`;
    if (a.length === 0) {
      if (e === "upcoming")
        return n`<div class="upcoming-empty" role="status">
          <ha-icon icon="mdi:calendar-blank-outline" aria-hidden="true"></ha-icon>
          <span>${this.t("upcomingEmpty", i)}</span>
        </div>`;
      const l = e === "playing" ? "noPlaying" : "empty";
      return n`<octopus-empty-state
        .message=${this.t(l, i)}
      ></octopus-empty-state>`;
    }
    const c = this.snapshot[e];
    return e === "upcoming" ? Ni({
      config: t,
      entryId: t.entry_id,
      focusedItemRef: this.focusedItemRef ?? a[0]?.ref,
      hass: this.hassValue,
      height: r,
      items: a,
      partial: c.partial,
      stale: c.stale,
      width: this.containerWidth
    }) : n`
      ${Ke(s, {
      config: t,
      entryId: t.entry_id,
      focusedItemRef: this.focusedItemRef ?? a[0]?.ref,
      hass: this.hassValue,
      height: r,
      items: a,
      language: i,
      mode: e,
      width: this.containerWidth
    })}
      ${c.stale ? n`<p class="stale" role="status">${this.t("stale", i)}</p>` : p}
      ${c.partial ? n`<p class="partial" role="status">${this.t("partial", i)}</p>` : p}
    `;
  }
  effectiveMode(t) {
    return t.mode === "carousel" ? t.sections[0] ?? "recent" : t.mode;
  }
  resolveLayout(t, e, i) {
    return t.layout === "auto" ? this.autoLayout.update(e, this.containerWidth, i) : t.layout;
  }
  itemsForMode(t) {
    return t === "playing" ? this.localPlaying : this.snapshot?.[t].items ?? [];
  }
  t(t, e) {
    return f(e, t);
  }
  async ensureSubscription() {
    if (!this.isConnected || !this.config || !this.hassValue || this.config.entry_id === ve || this.unsubscribe || this.subscriptionPending)
      return;
    const t = ++this.subscriptionGeneration;
    this.subscriptionPending = !0, this.loading = !0, this.error = void 0;
    try {
      const e = await Ht(
        this.hassValue,
        this.config.entry_id,
        (i) => {
          t === this.subscriptionGeneration && (this.snapshot = i, this.localPlaying = i.playing.items.map((s) => ({ ...s })), this.synchronizeFocusAndAmbient(!0), this.reconcileProgressTimer(), this.loading = !1, this.error = void 0);
        }
      );
      t !== this.subscriptionGeneration ? e() : (this.unsubscribe = e, this.reconnectDelay = 1e3);
    } catch (e) {
      t === this.subscriptionGeneration && (this.error = e instanceof Error ? e.message : "subscription_failed", this.loading = !1, this.scheduleReconnect());
    } finally {
      t === this.subscriptionGeneration && (this.subscriptionPending = !1);
    }
  }
  resetSubscription() {
    this.subscriptionGeneration += 1, this.unsubscribe?.(), this.unsubscribe = void 0, this.clearReconnectTimer(), this.stopProgressTimer(), this.snapshot = void 0, this.localPlaying = [], this.focusedItemRef = void 0, this.ambientArtwork = void 0, this.pendingAmbientArtwork = void 0, this.loading = !0, this.error = void 0;
  }
  scheduleReconnect() {
    if (this.reconnectTimer !== void 0 || !this.isConnected) return;
    const t = this.subscriptionGeneration, e = this.reconnectDelay;
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 3e4), this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = void 0, t === this.subscriptionGeneration && this.ensureSubscription();
    }, e);
  }
  clearReconnectTimer() {
    this.reconnectTimer !== void 0 && window.clearTimeout(this.reconnectTimer), this.reconnectTimer = void 0;
  }
  reconcileProgressTimer() {
    this.progressTickAt = Date.now(), this.snapshot?.availability.jellyfin.state !== "offline" && this.snapshot?.playing.stale !== !0 && this.localPlaying.some((e) => e.state === "playing" && e.duration_seconds > 0) ? this.progressTimer ??= window.setInterval(() => this.advancePlayingProgress(), 1e3) : this.stopProgressTimer();
  }
  advancePlayingProgress() {
    const t = Date.now(), e = Math.max(0, (t - this.progressTickAt) / 1e3);
    this.progressTickAt = t, e !== 0 && (this.localPlaying = this.localPlaying.map((i) => {
      if (i.state !== "playing" || i.duration_seconds <= 0) return i;
      const s = Math.min(i.duration_seconds, i.position_seconds + e);
      return {
        ...i,
        position_seconds: s,
        progress: Math.min(100, Math.max(0, s / i.duration_seconds * 100))
      };
    }));
  }
  stopProgressTimer() {
    this.progressTimer !== void 0 && window.clearInterval(this.progressTimer), this.progressTimer = void 0;
  }
  synchronizeFocusAndAmbient(t) {
    if (!this.config || !this.snapshot) return;
    const e = this.itemsForMode(this.effectiveMode(this.config)).slice(
      0,
      this.config.item_count
    ), i = e.find((r) => r.ref === this.focusedItemRef) ?? e[0];
    this.focusedItemRef = i?.ref;
    const s = this.artworkFor(i);
    t && (this.ambientArtwork = s, this.pendingAmbientArtwork = void 0);
  }
  artworkFor(t) {
    if (t) {
      if ("backdrop_ref" in t && t.backdrop_ref)
        return { imageRef: t.backdrop_ref, variant: "backdrop-medium" };
      if ("still_ref" in t && t.still_ref)
        return { imageRef: t.still_ref, variant: "poster-large" };
      if (t.poster_ref)
        return { imageRef: t.poster_ref, variant: "poster-large" };
    }
  }
  sameArtwork(t, e) {
    return t?.imageRef === e?.imageRef && t?.variant === e?.variant;
  }
  startResizeObserver() {
    this.resizeObserver || typeof ResizeObserver > "u" || (this.resizeObserver = new ResizeObserver((t) => {
      const e = t[0];
      if (!e) return;
      const i = e.contentBoxSize[0], s = i?.inlineSize ?? e.contentRect.width, r = i?.blockSize ?? e.contentRect.height;
      this.resizeFrame !== void 0 && cancelAnimationFrame(this.resizeFrame), this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = void 0, s > 0 && Math.abs(s - this.containerWidth) >= 0.5 && (this.containerWidth = s), r > 0 && Math.abs(r - this.containerHeight) >= 0.5 && (this.containerHeight = r);
      });
    }), this.resizeObserver.observe(this));
  }
};
A.styles = Hi;
O([
  v()
], A.prototype, "config", 2);
O([
  v()
], A.prototype, "snapshot", 2);
O([
  v()
], A.prototype, "loading", 2);
O([
  v()
], A.prototype, "error", 2);
O([
  v()
], A.prototype, "containerWidth", 2);
O([
  v()
], A.prototype, "containerHeight", 2);
O([
  v()
], A.prototype, "localPlaying", 2);
O([
  v()
], A.prototype, "focusedItemRef", 2);
O([
  v()
], A.prototype, "ambientArtwork", 2);
O([
  v()
], A.prototype, "pendingAmbientArtwork", 2);
A = O([
  P("octopus-media-card")
], A);
window.customCards = window.customCards ?? [];
window.customCards.some((t) => t.type === "octopus-media-card") || window.customCards.push({
  type: "octopus-media-card",
  name: "Octopus Media Card",
  description: "Poster-focused Jellyfin, Radarr, and Sonarr card",
  preview: !0
});
export {
  A as OctopusMediaCard
};

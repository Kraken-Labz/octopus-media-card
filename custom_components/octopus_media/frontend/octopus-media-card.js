const nt = globalThis, wt = nt.ShadowRoot && (nt.ShadyCSS === void 0 || nt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, xt = /* @__PURE__ */ Symbol(), Ot = /* @__PURE__ */ new WeakMap();
let Jt = class {
  constructor(t, i, a) {
    if (this._$cssResult$ = !0, a !== xt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (wt && t === void 0) {
      const a = i !== void 0 && i.length === 1;
      a && (t = Ot.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), a && Ot.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const fe = (e) => new Jt(typeof e == "string" ? e : e + "", void 0, xt), E = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((a, r, s) => a + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + e[s + 1], e[0]);
  return new Jt(i, e, xt);
}, me = (e, t) => {
  if (wt) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const a = document.createElement("style"), r = nt.litNonce;
    r !== void 0 && a.setAttribute("nonce", r), a.textContent = i.cssText, e.appendChild(a);
  }
}, Rt = wt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const a of t.cssRules) i += a.cssText;
  return fe(i);
})(e) : e;
const { is: be, defineProperty: ve, getOwnPropertyDescriptor: ye, getOwnPropertyNames: we, getOwnPropertySymbols: xe, getPrototypeOf: $e } = Object, ut = globalThis, zt = ut.trustedTypes, _e = zt ? zt.emptyScript : "", Se = ut.reactiveElementPolyfillSupport, Z = (e, t) => e, lt = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? _e : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let i = e;
  switch (t) {
    case Boolean:
      i = e !== null;
      break;
    case Number:
      i = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(e);
      } catch {
        i = null;
      }
  }
  return i;
} }, $t = (e, t) => !be(e, t), Nt = { attribute: !0, type: String, converter: lt, reflect: !1, useDefault: !1, hasChanged: $t };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), ut.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let H = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = Nt) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const a = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(t, a, i);
      r !== void 0 && ve(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, i, a) {
    const { get: r, set: s } = ye(this.prototype, t) ?? { get() {
      return this[i];
    }, set(o) {
      this[i] = o;
    } };
    return { get: r, set(o) {
      const p = r?.call(this);
      s?.call(this, o), this.requestUpdate(t, p, a);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Nt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Z("elementProperties"))) return;
    const t = $e(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Z("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Z("properties"))) {
      const i = this.properties, a = [...we(i), ...xe(i)];
      for (const r of a) this.createProperty(r, i[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0) for (const [a, r] of i) this.elementProperties.set(a, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, a] of this.elementProperties) {
      const r = this._$Eu(i, a);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const a = new Set(t.flat(1 / 0).reverse());
      for (const r of a) i.unshift(Rt(r));
    } else t !== void 0 && i.push(Rt(t));
    return i;
  }
  static _$Eu(t, i) {
    const a = i.attribute;
    return a === !1 ? void 0 : typeof a == "string" ? a : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const a of i.keys()) this.hasOwnProperty(a) && (t.set(a, this[a]), delete this[a]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return me(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, i, a) {
    this._$AK(t, a);
  }
  _$ET(t, i) {
    const a = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, a);
    if (r !== void 0 && a.reflect === !0) {
      const s = (a.converter?.toAttribute !== void 0 ? a.converter : lt).toAttribute(i, a.type);
      this._$Em = t, s == null ? this.removeAttribute(r) : this.setAttribute(r, s), this._$Em = null;
    }
  }
  _$AK(t, i) {
    const a = this.constructor, r = a._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const s = a.getPropertyOptions(r), o = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : lt;
      this._$Em = r;
      const p = o.fromAttribute(i, s.type);
      this[r] = p ?? this._$Ej?.get(r) ?? p, this._$Em = null;
    }
  }
  requestUpdate(t, i, a, r = !1, s) {
    if (t !== void 0) {
      const o = this.constructor;
      if (r === !1 && (s = this[t]), a ??= o.getPropertyOptions(t), !((a.hasChanged ?? $t)(s, i) || a.useDefault && a.reflect && s === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, a)))) return;
      this.C(t, i, a);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: a, reflect: r, wrapped: s }, o) {
    a && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? i ?? this[t]), s !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || a || (i = void 0), this._$AL.set(t, i)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, s] of this._$Ep) this[r] = s;
        this._$Ep = void 0;
      }
      const a = this.constructor.elementProperties;
      if (a.size > 0) for (const [r, s] of a) {
        const { wrapped: o } = s, p = this[r];
        o !== !0 || this._$AL.has(r) || p === void 0 || this.C(r, void 0, s, p);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), this._$EO?.forEach((a) => a.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (a) {
      throw t = !1, this._$EM(), a;
    }
    t && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
H.elementStyles = [], H.shadowRootOptions = { mode: "open" }, H[Z("elementProperties")] = /* @__PURE__ */ new Map(), H[Z("finalized")] = /* @__PURE__ */ new Map(), Se?.({ ReactiveElement: H }), (ut.reactiveElementVersions ??= []).push("2.1.2");
const _t = globalThis, Ft = (e) => e, ct = _t.trustedTypes, Dt = ct ? ct.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Xt = "$lit$", z = `lit$${Math.random().toFixed(9).slice(2)}$`, Qt = "?" + z, Ae = `<${Qt}>`, j = document, K = () => j.createComment(""), J = (e) => e === null || typeof e != "object" && typeof e != "function", St = Array.isArray, ke = (e) => St(e) || typeof e?.[Symbol.iterator] == "function", mt = `[ 	
\f\r]`, q = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ut = /-->/g, Lt = />/g, F = RegExp(`>|${mt}(?:([^\\s"'>=/]+)(${mt}*=${mt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), jt = /'/g, Bt = /"/g, te = /^(?:script|style|textarea|title)$/i, Pe = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), n = Pe(1), W = /* @__PURE__ */ Symbol.for("lit-noChange"), l = /* @__PURE__ */ Symbol.for("lit-nothing"), Ht = /* @__PURE__ */ new WeakMap(), U = j.createTreeWalker(j, 129);
function ee(e, t) {
  if (!St(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Dt !== void 0 ? Dt.createHTML(t) : t;
}
const Ee = (e, t) => {
  const i = e.length - 1, a = [];
  let r, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = q;
  for (let p = 0; p < i; p++) {
    const c = e[p];
    let u, g, h = -1, w = 0;
    for (; w < c.length && (o.lastIndex = w, g = o.exec(c), g !== null); ) w = o.lastIndex, o === q ? g[1] === "!--" ? o = Ut : g[1] !== void 0 ? o = Lt : g[2] !== void 0 ? (te.test(g[2]) && (r = RegExp("</" + g[2], "g")), o = F) : g[3] !== void 0 && (o = F) : o === F ? g[0] === ">" ? (o = r ?? q, h = -1) : g[1] === void 0 ? h = -2 : (h = o.lastIndex - g[2].length, u = g[1], o = g[3] === void 0 ? F : g[3] === '"' ? Bt : jt) : o === Bt || o === jt ? o = F : o === Ut || o === Lt ? o = q : (o = F, r = void 0);
    const m = o === F && e[p + 1].startsWith("/>") ? " " : "";
    s += o === q ? c + Ae : h >= 0 ? (a.push(u), c.slice(0, h) + Xt + c.slice(h) + z + m) : c + z + (h === -2 ? p : m);
  }
  return [ee(e, s + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), a];
};
class X {
  constructor({ strings: t, _$litType$: i }, a) {
    let r;
    this.parts = [];
    let s = 0, o = 0;
    const p = t.length - 1, c = this.parts, [u, g] = Ee(t, i);
    if (this.el = X.createElement(u, a), U.currentNode = this.el.content, i === 2 || i === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (r = U.nextNode()) !== null && c.length < p; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const h of r.getAttributeNames()) if (h.endsWith(Xt)) {
          const w = g[o++], m = r.getAttribute(h).split(z), x = /([.?@])?(.*)/.exec(w);
          c.push({ type: 1, index: s, name: x[2], strings: m, ctor: x[1] === "." ? Ce : x[1] === "?" ? Me : x[1] === "@" ? Te : gt }), r.removeAttribute(h);
        } else h.startsWith(z) && (c.push({ type: 6, index: s }), r.removeAttribute(h));
        if (te.test(r.tagName)) {
          const h = r.textContent.split(z), w = h.length - 1;
          if (w > 0) {
            r.textContent = ct ? ct.emptyScript : "";
            for (let m = 0; m < w; m++) r.append(h[m], K()), U.nextNode(), c.push({ type: 2, index: ++s });
            r.append(h[w], K());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Qt) c.push({ type: 2, index: s });
      else {
        let h = -1;
        for (; (h = r.data.indexOf(z, h + 1)) !== -1; ) c.push({ type: 7, index: s }), h += z.length - 1;
      }
      s++;
    }
  }
  static createElement(t, i) {
    const a = j.createElement("template");
    return a.innerHTML = t, a;
  }
}
function V(e, t, i = e, a) {
  if (t === W) return t;
  let r = a !== void 0 ? i._$Co?.[a] : i._$Cl;
  const s = J(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== s && (r?._$AO?.(!1), s === void 0 ? r = void 0 : (r = new s(e), r._$AT(e, i, a)), a !== void 0 ? (i._$Co ??= [])[a] = r : i._$Cl = r), r !== void 0 && (t = V(e, r._$AS(e, t.values), r, a)), t;
}
class Ie {
  constructor(t, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: i }, parts: a } = this._$AD, r = (t?.creationScope ?? j).importNode(i, !0);
    U.currentNode = r;
    let s = U.nextNode(), o = 0, p = 0, c = a[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let u;
        c.type === 2 ? u = new it(s, s.nextSibling, this, t) : c.type === 1 ? u = new c.ctor(s, c.name, c.strings, this, t) : c.type === 6 && (u = new Oe(s, this, t)), this._$AV.push(u), c = a[++p];
      }
      o !== c?.index && (s = U.nextNode(), o++);
    }
    return U.currentNode = j, r;
  }
  p(t) {
    let i = 0;
    for (const a of this._$AV) a !== void 0 && (a.strings !== void 0 ? (a._$AI(t, a, i), i += a.strings.length - 2) : a._$AI(t[i])), i++;
  }
}
class it {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, a, r) {
    this.type = 2, this._$AH = l, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = a, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && t?.nodeType === 11 && (t = i.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, i = this) {
    t = V(this, t, i), J(t) ? t === l || t == null || t === "" ? (this._$AH !== l && this._$AR(), this._$AH = l) : t !== this._$AH && t !== W && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ke(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== l && J(this._$AH) ? this._$AA.nextSibling.data = t : this.T(j.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: i, _$litType$: a } = t, r = typeof a == "number" ? this._$AC(t) : (a.el === void 0 && (a.el = X.createElement(ee(a.h, a.h[0]), this.options)), a);
    if (this._$AH?._$AD === r) this._$AH.p(i);
    else {
      const s = new Ie(r, this), o = s.u(this.options);
      s.p(i), this.T(o), this._$AH = s;
    }
  }
  _$AC(t) {
    let i = Ht.get(t.strings);
    return i === void 0 && Ht.set(t.strings, i = new X(t)), i;
  }
  k(t) {
    St(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let a, r = 0;
    for (const s of t) r === i.length ? i.push(a = new it(this.O(K()), this.O(K()), this, this.options)) : a = i[r], a._$AI(s), r++;
    r < i.length && (this._$AR(a && a._$AB.nextSibling, r), i.length = r);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); t !== this._$AB; ) {
      const a = Ft(t).nextSibling;
      Ft(t).remove(), t = a;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class gt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, a, r, s) {
    this.type = 1, this._$AH = l, this._$AN = void 0, this.element = t, this.name = i, this._$AM = r, this.options = s, a.length > 2 || a[0] !== "" || a[1] !== "" ? (this._$AH = Array(a.length - 1).fill(new String()), this.strings = a) : this._$AH = l;
  }
  _$AI(t, i = this, a, r) {
    const s = this.strings;
    let o = !1;
    if (s === void 0) t = V(this, t, i, 0), o = !J(t) || t !== this._$AH && t !== W, o && (this._$AH = t);
    else {
      const p = t;
      let c, u;
      for (t = s[0], c = 0; c < s.length - 1; c++) u = V(this, p[a + c], i, c), u === W && (u = this._$AH[c]), o ||= !J(u) || u !== this._$AH[c], u === l ? t = l : t !== l && (t += (u ?? "") + s[c + 1]), this._$AH[c] = u;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === l ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ce extends gt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === l ? void 0 : t;
  }
}
class Me extends gt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== l);
  }
}
class Te extends gt {
  constructor(t, i, a, r, s) {
    super(t, i, a, r, s), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = V(this, t, i, 0) ?? l) === W) return;
    const a = this._$AH, r = t === l && a !== l || t.capture !== a.capture || t.once !== a.once || t.passive !== a.passive, s = t !== l && (a === l || r);
    r && this.element.removeEventListener(this.name, this, a), s && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Oe {
  constructor(t, i, a) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = a;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    V(this, t);
  }
}
const Re = _t.litHtmlPolyfillSupport;
Re?.(X, it), (_t.litHtmlVersions ??= []).push("3.3.3");
const ze = (e, t, i) => {
  const a = i?.renderBefore ?? t;
  let r = a._$litPart$;
  if (r === void 0) {
    const s = i?.renderBefore ?? null;
    a._$litPart$ = r = new it(t.insertBefore(K(), s), s, void 0, i ?? {});
  }
  return r._$AI(e), r;
};
const At = globalThis;
class $ extends H {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ze(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return W;
  }
}
$._$litElement$ = !0, $.finalized = !0, At.litElementHydrateSupport?.({ LitElement: $ });
const Ne = At.litElementPolyfillSupport;
Ne?.({ LitElement: $ });
(At.litElementVersions ??= []).push("4.2.2");
const I = (e) => (t, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
const Fe = { attribute: !0, type: String, converter: lt, reflect: !1, hasChanged: $t }, De = (e = Fe, t, i) => {
  const { kind: a, metadata: r } = i;
  let s = globalThis.litPropertyMetadata.get(r);
  if (s === void 0 && globalThis.litPropertyMetadata.set(r, s = /* @__PURE__ */ new Map()), a === "setter" && ((e = Object.create(e)).wrapped = !0), s.set(i.name, e), a === "accessor") {
    const { name: o } = i;
    return { set(p) {
      const c = t.get.call(this);
      t.set.call(this, p), this.requestUpdate(o, c, e, !0, p);
    }, init(p) {
      return p !== void 0 && this.C(o, void 0, e, p), p;
    } };
  }
  if (a === "setter") {
    const { name: o } = i;
    return function(p) {
      const c = this[o];
      t.call(this, p), this.requestUpdate(o, c, e, !0, p);
    };
  }
  throw Error("Unsupported decorator location: " + a);
};
function d(e) {
  return (t, i) => typeof i == "object" ? De(e, t, i) : ((a, r, s) => {
    const o = r.hasOwnProperty(s);
    return r.constructor.createProperty(s, a), o ? Object.getOwnPropertyDescriptor(r, s) : void 0;
  })(e, t, i);
}
function v(e) {
  return d({ ...e, state: !0, attribute: !1 });
}
const Ue = (e, t, i) => (i.configurable = !0, i.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, i), i);
function Le(e, t) {
  return (i, a, r) => {
    const s = (o) => o.renderRoot?.querySelector(e) ?? null;
    return Ue(i, a, { get() {
      return s(this);
    } });
  };
}
async function je(e) {
  return (await e.connection.sendMessagePromise({
    type: "octopus_media/get_entries"
  })).entries;
}
function ie(e, t, i) {
  return e.connection.subscribeMessage((a) => i(a.snapshot), {
    type: "octopus_media/subscribe_snapshot",
    entry_id: t
  });
}
function ae(e) {
  return !e || typeof e != "object" ? !1 : e.code === "not_found" ? !0 : (e instanceof Error || "message" in e && typeof e.message == "string" ? e.message : "").includes("Config entry is not loaded");
}
var Be = Object.defineProperty, He = Object.getOwnPropertyDescriptor, kt = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? He(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && Be(t, i, r), r;
};
let Q = class extends $ {
  constructor() {
    super(...arguments), this.message = "No media to display", this.secondary = "";
  }
  render() {
    return n`<div role="status">
      <span class="mark" aria-hidden="true"><ha-icon icon="mdi:octopus"></ha-icon></span>
      <strong>${this.message}</strong>
      <small>${this.secondary || "Octopus Media"}</small>
    </div>`;
  }
};
Q.styles = E`
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
kt([
  d({ type: String })
], Q.prototype, "message", 2);
kt([
  d({ type: String })
], Q.prototype, "secondary", 2);
Q = kt([
  I("octopus-empty-state")
], Q);
var We = Object.defineProperty, Ve = Object.getOwnPropertyDescriptor, re = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? Ve(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && We(t, i, r), r;
};
let pt = class extends $ {
  constructor() {
    super(...arguments), this.message = "Unable to load media";
  }
  render() {
    return n`<div role="alert"><span aria-hidden="true">!</span>${this.message}</div>`;
  }
};
pt.styles = E`
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
re([
  d({ type: String })
], pt.prototype, "message", 2);
pt = re([
  I("octopus-error-state")
], pt);
const Ge = [
  "poster-small",
  "poster-medium",
  "poster-large",
  "backdrop-small",
  "backdrop-medium"
], D = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 360"><rect width="240" height="360" fill="#101820"/><path d="M76 166h88v64H76z" fill="none" stroke="#3dd6c6" stroke-width="6"/><circle cx="120" cy="126" r="32" fill="none" stroke="#3dd6c6" stroke-width="6"/><path d="m92 222 28-28 28 28" fill="none" stroke="#3dd6c6" stroke-width="6"/></svg>'
), Wt = 300, qe = 3e4;
function Ye(e) {
  return Ge.includes(e);
}
function Ze(e) {
  return /^image_[A-Za-z0-9_-]{32}$/.test(e);
}
function Vt(e, t, i) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(e) || !Ze(t))
    throw new Error("invalid_image_request");
  if (!Ye(i)) throw new Error("invalid_image_variant");
  return `/api/octopus_media/image/${encodeURIComponent(e)}/${t}/${i}`;
}
class Ke {
  constructor(t, i = Date.now) {
    this.connection = t, this.now = i, this.cache = /* @__PURE__ */ new Map(), this.inflight = /* @__PURE__ */ new Map();
  }
  resolve(t) {
    const i = Vt(t.entryId, t.imageRef, t.variant), a = this.cache.get(i);
    if (a && a.expiresAt - qe > this.now())
      return Promise.resolve(a.path);
    const r = this.inflight.get(i);
    if (r) return r;
    const s = this.sign(i).finally(() => this.inflight.delete(i));
    return this.inflight.set(i, s), s;
  }
  invalidate(t) {
    this.cache.delete(Vt(t.entryId, t.imageRef, t.variant));
  }
  release() {
  }
  async sign(t) {
    const i = await this.connection.sendMessagePromise({
      type: "auth/sign_path",
      path: t,
      expires: Wt
    });
    if (typeof i.path != "string" || !i.path.startsWith(`${t}?`) || i.path.includes("://"))
      throw new Error("invalid_signed_path");
    return this.cache.set(t, {
      expiresAt: this.now() + Wt * 1e3,
      path: i.path
    }), i.path;
  }
}
const Gt = /* @__PURE__ */ new WeakMap();
function qt(e) {
  const t = e.connection;
  let i = Gt.get(t);
  return i || (i = new Ke(e.connection), Gt.set(t, i)), i;
}
var Je = Object.defineProperty, Xe = Object.getOwnPropertyDescriptor, R = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? Xe(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && Je(t, i, r), r;
};
let M = class extends $ {
  constructor() {
    super(...arguments), this.entryId = "", this.variant = "poster-medium", this.alt = "", this.backdrop = !1, this.imageUrl = D, this.imageState = "idle", this.nearViewport = !1, this.generation = 0, this.renewalAttempts = 0, this.onLoad = () => {
      this.imageUrl !== D && (this.imageState = "loaded", this.dispatchEvent(
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
  updated(e) {
    (e.has("imageRef") || e.has("entryId") || e.has("variant") || e.has("hass")) && this.resetImage();
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
        (e) => {
          e.some((t) => t.isIntersecting || t.intersectionRatio > 0) && (this.nearViewport = !0, this.observer?.disconnect(), this.observer = void 0, this.loadSignedPath());
        },
        { rootMargin: "180px 180px", threshold: 0.01 }
      ), this.observer.observe(this);
    }
  }
  resetImage() {
    this.generation += 1, this.renewalAttempts = 0, this.imageUrl = D, this.imageState = "idle", this.retryTimer !== void 0 && window.clearTimeout(this.retryTimer), this.retryTimer = void 0, this.nearViewport && this.loadSignedPath();
  }
  request() {
    if (!(!this.hass || !this.imageRef || !this.entryId))
      return { entryId: this.entryId, imageRef: this.imageRef, variant: this.variant };
  }
  async loadSignedPath() {
    const e = this.hass, t = this.request();
    if (!t || !e) {
      this.imageState = "missing";
      return;
    }
    const i = this.generation;
    this.imageState = "loading";
    try {
      const a = await qt(e).resolve(t);
      i === this.generation && (this.imageUrl = a);
    } catch {
      if (i !== this.generation) return;
      this.imageState = "temporary", this.imageUrl = D, this.scheduleBackoffRetry();
    }
  }
  async handleImageError() {
    const e = this.request();
    if (!e || !this.hass) {
      this.imageState = "missing", this.imageUrl = D;
      return;
    }
    if (this.renewalAttempts === 0) {
      this.renewalAttempts = 1, qt(this.hass).invalidate(e), this.imageUrl = D, await this.updateComplete, await this.loadSignedPath();
      return;
    }
    this.imageState = "missing", this.imageUrl = D;
  }
  scheduleBackoffRetry() {
    this.renewalAttempts > 0 || this.retryTimer !== void 0 || (this.renewalAttempts = 1, this.retryTimer = window.setTimeout(() => {
      this.retryTimer = void 0, this.loadSignedPath();
    }, 5e3));
  }
};
M.styles = E`
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
    :host([data-appearance="light"]) img,
    :host([data-appearance="light"]) img[data-state="idle"],
    :host([data-appearance="light"]) img[data-state="loading"] {
      filter: none;
      mix-blend-mode: normal;
      opacity: 1;
    }
    @media (prefers-reduced-motion: reduce) {
      img {
        transition: none;
      }
    }
  `;
R([
  d({ attribute: !1 })
], M.prototype, "hass", 2);
R([
  d({ type: String })
], M.prototype, "entryId", 2);
R([
  d({ type: String })
], M.prototype, "imageRef", 2);
R([
  d({ type: String })
], M.prototype, "variant", 2);
R([
  d({ type: String })
], M.prototype, "alt", 2);
R([
  d({ type: Boolean })
], M.prototype, "backdrop", 2);
R([
  v()
], M.prototype, "imageUrl", 2);
R([
  v()
], M.prototype, "imageState", 2);
M = R([
  I("octopus-media-image")
], M);
var Qe = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, se = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? ti(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && Qe(t, i, r), r;
};
let dt = class extends $ {
  constructor() {
    super(...arguments), this.message = "Loading media";
  }
  render() {
    return n`<div role="status" aria-live="polite"><span></span>${this.message}</div>`;
  }
};
dt.styles = E`
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
se([
  d({ type: String })
], dt.prototype, "message", 2);
dt = se([
  I("octopus-loading-state")
], dt);
const bt = ["recent", "upcoming", "playing"], ei = ["auto", "strip", "grid", "hero", "compact", "portrait", "list"], ii = [
  "cinematic-overlay",
  "gallery-clean",
  "octopus-glass",
  "cinematic-octopus-gallery",
  "playing-hero-cinematic"
], vt = "select_entry", k = {
  type: "custom:octopus-media-card",
  entry_id: vt,
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
  thumbnail_size: "medium",
  appearance: "auto",
  auto_scroll: !1,
  auto_scroll_interval: 6
}, B = (e, t) => typeof e == "string" && t.includes(e), ot = (e, t, i, a) => {
  if (e === void 0) return t;
  if (!Number.isInteger(e) || Number(e) < i || Number(e) > a)
    throw new Error(`Expected an integer between ${String(i)} and ${String(a)}`);
  return Number(e);
};
function oe(e) {
  if (typeof e != "object" || e === null)
    throw new Error("Card configuration must be an object");
  const t = e;
  if (t.type !== "custom:octopus-media-card")
    throw new Error("Invalid card type");
  if (typeof t.entry_id != "string" || t.entry_id.trim() === "")
    throw new Error("entry_id is required");
  if (t.mode !== void 0 && !B(t.mode, bt))
    throw new Error("Invalid mode");
  if (t.layout !== void 0 && !B(t.layout, ei))
    throw new Error("Invalid layout");
  if (t.visual_concept !== void 0 && !B(t.visual_concept, ii))
    throw new Error("Invalid visual concept");
  if (t.appearance !== void 0 && !B(t.appearance, ["auto", "dark", "light"]))
    throw new Error("Invalid appearance");
  if (t.title_position !== void 0 && !B(t.title_position, ["overlay", "below"]))
    throw new Error("Invalid title position");
  const i = t.height ?? k.height;
  if (i !== "auto" && (!Number.isFinite(i) || Number(i) < 80))
    throw new Error("height must be auto or at least 80 pixels");
  const a = Array.isArray(t.sections) ? t.sections.filter(
    (r) => B(r, ["recent", "upcoming", "playing"])
  ) : k.sections;
  return {
    ...k,
    ...t,
    type: "custom:octopus-media-card",
    entry_id: t.entry_id.trim(),
    mode: t.mode ?? k.mode,
    layout: t.layout ?? k.layout,
    height: i,
    sections: a.length > 0 ? [...a] : [...k.sections],
    item_count: ot(t.item_count, k.item_count, 1, 50),
    cycle_interval: ot(t.cycle_interval, k.cycle_interval, 5, 3600),
    appearance: t.appearance ?? k.appearance,
    auto_scroll: t.auto_scroll === !0,
    auto_scroll_interval: ot(
      t.auto_scroll_interval,
      k.auto_scroll_interval,
      2,
      3600
    ),
    posters_visible: t.posters_visible === void 0 || t.posters_visible === "auto" ? "auto" : ot(t.posters_visible, 3, 1, 5)
  };
}
const L = [280, 450, 700, 1e3], Yt = 12, Zt = ["xs", "sm", "md", "lg", "xl"];
function ai(e) {
  return e < L[0] ? "xs" : e < L[1] ? "sm" : e < L[2] ? "md" : e < L[3] ? "lg" : "xl";
}
function ri(e, t) {
  if (!t) return ai(e);
  let i = Zt.indexOf(t);
  for (; i < L.length && e >= (L[i] ?? Number.POSITIVE_INFINITY) + Yt; )
    i += 1;
  for (; i > 0 && e < (L[i - 1] ?? Number.NEGATIVE_INFINITY) - Yt; )
    i -= 1;
  return Zt[i] ?? "xl";
}
function si(e, t, i) {
  return t === "xs" ? e === "playing" ? "list" : "compact" : t === "sm" ? e === "playing" ? i >= 200 ? "hero" : "compact" : "strip" : t === "md" ? e === "playing" ? i >= 200 ? "hero" : "list" : "strip" : e === "playing" ? "hero" : i >= 360 ? "grid" : "strip";
}
class ne {
  update(t, i, a) {
    return this.bucket = ri(i, this.bucket), si(t, this.bucket, a);
  }
  get currentBucket() {
    return this.bucket;
  }
}
const oi = ({ entryId: e, hass: t, items: i, width: a }) => {
  const r = i.slice(0, 3);
  return n`
    <div class="layout compact" data-layout="compact">
      ${r.map(
    (s, o) => n`
          <article
            class=${`compact-item ${o === 0 ? "featured" : ""}`}
            aria-label=${s.title}
          >
            <octopus-media-image
              .hass=${t}
              .entryId=${e}
              .imageRef=${s.poster_ref}
              .variant=${a < 420 ? "poster-small" : "poster-medium"}
              .alt=${s.title}
            ></octopus-media-image>
            <div class="compact-overlay">
              <strong title=${s.title}>${s.title}</strong>
              ${o === 0 && s.subtitle ? n`<span>${s.subtitle}</span>` : ""}
            </div>
          </article>
        `
  )}
    </div>
  `;
}, ni = {
  recent: "Recently added",
  recentEyebrow: "Recent",
  upcoming: "Upcoming",
  upcomingEyebrow: "Upcoming",
  playing: "Playing now",
  playingEyebrow: "Now playing",
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
  configurationNotFound: "Octopus configuration not found",
  configurationNotFoundSecondary: "Edit this card and select an Octopus Media integration.",
  previousConfigurationUnavailable: "Previous configuration (unavailable)",
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
  downloaded: "Downloaded",
  integration: "Integration",
  selectIntegration: "Select an integration",
  contentMode: "Content / mode",
  mode: "Mode",
  layout: "Layout",
  title: "Title",
  height: "Height",
  appearance: "Appearance",
  itemCount: "Item count",
  postersVisible: "Posters visible",
  content: "Content",
  titles: "Titles",
  dates: "Dates",
  ratings: "Ratings",
  badges: "Badges",
  arrows: "Arrows",
  device: "Device",
  user: "User",
  progress: "Progress",
  time: "Time",
  autoScroll: "Auto-scroll",
  autoScrollInterval: "Auto-scroll interval (seconds)",
  appearanceAuto: "Follow Home Assistant",
  appearanceDark: "Dark",
  appearanceLight: "Light",
  preview: "Preview",
  previewWidth: "Preview width",
  previewCard: "Card preview",
  previewUnavailable: "Live preview is unavailable",
  fictionalPreview: "Deterministic preview: titles and images are fictional.",
  previousPosters: "Previous posters",
  nextPosters: "Next posters",
  today: "Today",
  tomorrow: "Tomorrow",
  digital: "Digital",
  physical: "Physical",
  cinema: "Cinema"
}, li = {
  recent: "Recém-adicionados",
  recentEyebrow: "Recentes",
  upcoming: "Em breve",
  upcomingEyebrow: "Em breve",
  upcomingEmpty: "Nada previsto por enquanto",
  playing: "Tocando agora",
  playingEyebrow: "EM REPRODUÇÃO",
  loading: "Carregando mídia",
  empty: "Nenhuma mídia para exibir",
  noPlaying: "Nenhuma reprodução ativa",
  noPlayingSecondary: "Sua próxima sessão aparecerá aqui automaticamente.",
  unavailable: "O Jellyfin está indisponível no momento",
  jellyfinUnavailable: "Jellyfin indisponível",
  unavailableSecondary: "Aguardando o serviço de mídia se reconectar.",
  upcomingNotConfigured: "As próximas mídias estarão disponíveis em uma futura fase de configuração",
  error: "Não foi possível carregar a mídia",
  configurationNotFound: "Configuração do Octopus não encontrada",
  configurationNotFoundSecondary: "Edite este cartão e selecione uma integração Octopus Media.",
  previousConfigurationUnavailable: "Configuração anterior (indisponível)",
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
  downloaded: "Baixado",
  integration: "Integração",
  selectIntegration: "Selecione uma integração",
  contentMode: "Conteúdo / modo",
  mode: "Modo",
  layout: "Layout",
  title: "Título",
  height: "Altura",
  appearance: "Aparência",
  itemCount: "Quantidade de itens",
  postersVisible: "Pôsteres visíveis",
  content: "Conteúdo",
  titles: "Títulos",
  dates: "Datas",
  ratings: "Avaliações",
  badges: "Badges",
  arrows: "Setas",
  device: "Dispositivo",
  user: "Usuário",
  progress: "Progresso",
  time: "Tempo",
  autoScroll: "Rolagem automática",
  autoScrollInterval: "Intervalo da rolagem (segundos)",
  appearanceAuto: "Seguir o Home Assistant",
  appearanceDark: "Escuro",
  appearanceLight: "Claro",
  preview: "Prévia",
  previewWidth: "Largura da prévia",
  previewCard: "Prévia do card",
  previewUnavailable: "A prévia ao vivo está indisponível",
  fictionalPreview: "Prévia determinística: títulos e imagens são fictícios.",
  previousPosters: "Pôsteres anteriores",
  nextPosters: "Próximos pôsteres",
  today: "Hoje",
  tomorrow: "Amanhã",
  digital: "Digital",
  physical: "Físico",
  cinema: "Cinema"
};
function f(e, t) {
  return e?.toLowerCase().startsWith("pt") ? li[t] : ni[t];
}
var ci = Object.defineProperty, pi = Object.getOwnPropertyDescriptor, T = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? pi(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && ci(t, i, r), r;
};
let P = class extends $ {
  constructor() {
    super(...arguments), this.entryId = "", this.variant = "poster-medium", this.showTitle = !0, this.showBadge = !0, this.showSubtitle = !0, this.titlePosition = "overlay", this.focused = !1, this.itemIndex = 0, this.announceFocus = () => {
      this.item && this.dispatchEvent(
        new CustomEvent("octopus-media-focus", {
          bubbles: !0,
          composed: !0,
          detail: { index: this.itemIndex, ref: this.item.ref }
        })
      );
    }, this.announceHoverFocus = (e) => {
      e.pointerType === "mouse" && this.announceFocus();
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
          ${this.showBadge ? n`<span class="badge">${this.badgeLabel()}</span>` : l}
          ${this.showTitle && this.titlePosition === "overlay" ? n`<div class="overlay-copy">
                  <h3 class="title">${this.item.title}</h3>
                  ${this.showSubtitle && this.item.subtitle ? n`<p>${this.item.subtitle}</p>` : l}
                </div>` : l}
        </div>
        ${this.showTitle && this.titlePosition === "below" ? n`<h3 class="title">${this.item.title}</h3>` : l}
        ${this.titlePosition === "below" && this.showSubtitle && this.item.subtitle ? n`<p>${this.item.subtitle}</p>` : l}
      </article>
    ` : l;
  }
  badgeLabel() {
    return this.item ? this.item.type === "episode" && "season" in this.item && "episode" in this.item && this.item.season !== null && this.item.episode !== null ? `T${String(this.item.season).padStart(2, "0")}E${String(this.item.episode).padStart(2, "0")}` : f(this.hass?.language, this.item.type) : "";
  }
};
P.styles = E`
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
], P.prototype, "item", 2);
T([
  d({ attribute: !1 })
], P.prototype, "hass", 2);
T([
  d({ type: String })
], P.prototype, "entryId", 2);
T([
  d({ type: String })
], P.prototype, "variant", 2);
T([
  d({ type: Boolean })
], P.prototype, "showTitle", 2);
T([
  d({ type: Boolean })
], P.prototype, "showBadge", 2);
T([
  d({ type: Boolean })
], P.prototype, "showSubtitle", 2);
T([
  d({ type: String })
], P.prototype, "titlePosition", 2);
T([
  d({ type: Boolean, reflect: !0 })
], P.prototype, "focused", 2);
T([
  d({ type: Number })
], P.prototype, "itemIndex", 2);
P = T([
  I("octopus-media-poster")
], P);
const di = ({ config: e, entryId: t, hass: i, items: a }) => n`
  <div class="layout grid" data-layout="grid">
    ${a.map(
  (r) => n`
        <octopus-media-poster
          .item=${r}
          .hass=${i}
          .entryId=${t}
          .variant=${"poster-medium"}
          .showTitle=${e.show_titles}
          .showBadge=${e.show_badges}
          .titlePosition=${e.title_position}
        ></octopus-media-poster>
      `
)}
  </div>
`;
var hi = Object.defineProperty, ui = Object.getOwnPropertyDescriptor, Pt = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? ui(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && hi(t, i, r), r;
};
let tt = class extends $ {
  constructor() {
    super(...arguments), this.showSubtitle = !0;
  }
  render() {
    return this.item ? n`
      <strong>${this.item.title}</strong>
      ${this.showSubtitle && this.item.subtitle ? n`<span>${this.item.subtitle}</span>` : l}
    ` : l;
  }
};
tt.styles = E`
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
Pt([
  d({ attribute: !1 })
], tt.prototype, "item", 2);
Pt([
  d({ type: Boolean })
], tt.prototype, "showSubtitle", 2);
tt = Pt([
  I("octopus-media-metadata")
], tt);
var gi = Object.defineProperty, fi = Object.getOwnPropertyDescriptor, A = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? fi(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && gi(t, i, r), r;
};
function Y(e) {
  if (!Number.isFinite(e) || e <= 0) return "0:00";
  const t = Math.floor(e), i = Math.floor(t / 3600), a = Math.floor(t % 3600 / 60), r = t % 60;
  return i > 0 ? `${String(i)}:${String(a).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${String(a)}:${String(r).padStart(2, "0")}`;
}
function mi(e) {
  if (!Number.isFinite(e) || e <= 0) return;
  const t = Math.max(1, Math.round(e / 60)), i = Math.floor(t / 60), a = t % 60;
  return i === 0 ? `${String(a)} min` : a > 0 ? `${String(i)}h${String(a).padStart(2, "0")}` : `${String(i)}h`;
}
function bi(e, t) {
  const i = [], a = e.type === "movie" && /^\d{4}$/.test(e.subtitle ?? "") ? e.subtitle : null;
  a && i.push(a);
  const r = mi(e.duration_seconds);
  if (r && i.push(r), i.push(...e.genres.filter((s) => s.trim()).slice(0, 2)), e.rating !== null && Number.isFinite(e.rating)) {
    const s = new Intl.NumberFormat(t ?? "en", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1
    }).format(e.rating);
    i.push(`★ ${s}`);
  }
  return i;
}
function vi(e) {
  return [
    e.video_resolution?.trim(),
    e.video_hdr ? "HDR" : void 0,
    e.audio_channels?.trim()
  ].filter((t) => !!t).slice(0, 3);
}
function yi(e) {
  return e.type === "episode" && e.still_ref ? { ref: e.still_ref, variant: "poster-large" } : e.backdrop_ref ? { ref: e.backdrop_ref, variant: "backdrop-medium" } : e.still_ref ? { ref: e.still_ref, variant: "poster-large" } : { variant: "backdrop-medium" };
}
let _ = class extends $ {
  constructor() {
    super(...arguments), this.items = [], this.entryId = "", this.appearance = "dark", this.heroState = "ready", this.stale = !1, this.partial = !1, this.serviceOffline = !1, this.activeIndex = 0, this.onScroll = () => {
      this.scrollFrame !== void 0 && cancelAnimationFrame(this.scrollFrame), this.scrollFrame = requestAnimationFrame(() => {
        this.scrollFrame = void 0;
        const e = this.track, t = [...this.renderRoot.querySelectorAll(".session")];
        if (!e || t.length < 2) return;
        const i = e.getBoundingClientRect().left;
        let a = 0, r = Number.POSITIVE_INFINITY;
        t.forEach((s, o) => {
          const p = Math.abs(s.getBoundingClientRect().left - i);
          p < r && (a = o, r = p);
        }), a !== this.activeIndex && this.activate(a, !1);
      });
    };
  }
  disconnectedCallback() {
    this.stopCycleTimer(), this.scrollFrame !== void 0 && cancelAnimationFrame(this.scrollFrame), super.disconnectedCallback();
  }
  updated(e) {
    if (e.has("items") || e.has("focusedRef")) {
      const t = this.items.findIndex((a) => a.ref === this.focusedRef), i = t >= 0 ? t : Math.min(this.activeIndex, this.items.length - 1);
      i !== this.activeIndex && i >= 0 && (this.activeIndex = i);
    }
    (e.has("items") || e.has("config") || e.has("heroState") || e.has("activeIndex")) && this.reconcileCycleTimer();
  }
  render() {
    if (this.heroState !== "ready" || this.items.length === 0)
      return this.renderState();
    const e = this.items.length > 1;
    return n`
      <section
        class=${`playing-hero ${e ? "multiple" : ""}`}
        aria-label=${this.config?.title ?? f(this.language, "playing")}
      >
        <div class="session-track" @scroll=${this.onScroll}>
          ${this.items.map((t, i) => this.renderSession(t, i))}
        </div>
        ${e ? this.renderNavigation() : l}
      </section>
    `;
  }
  renderState() {
    const e = this.heroState === "unavailable";
    return n`
      <section
        class=${`playing-state ${e ? "unavailable" : "empty"}`}
        role=${e ? "status" : "region"}
        aria-label=${e ? f(this.language, "jellyfinUnavailable") : f(this.language, "noPlaying")}
      >
        <span class="state-glow" aria-hidden="true"></span>
        <ha-icon
          icon=${e ? "mdi:server-off" : "mdi:octopus"}
          aria-hidden="true"
        ></ha-icon>
        <div>
          <strong
            >${e ? f(this.language, "jellyfinUnavailable") : f(this.language, "noPlaying")}</strong
          >
          <p>
            ${e ? f(this.language, "unavailableSecondary") : f(this.language, "noPlayingSecondary")}
          </p>
        </div>
      </section>
    `;
  }
  renderSession(e, t) {
    const i = t === this.activeIndex, a = yi(e), r = e.duration_seconds > 0, s = r ? Math.min(100, Math.max(0, e.progress)) : 0, o = Math.round(s), p = r ? Math.max(0, e.duration_seconds - e.position_seconds) : 0, c = bi(e, this.language), u = vi(e), g = c.length > 0 || u.length > 0, h = f(
      this.language,
      e.state === "paused" ? "pausedStatus" : "playingStatus"
    ), w = e.device_alias ?? e.device_name, m = [
      h,
      e.title,
      e.subtitle,
      this.config?.show_device ? w : void 0,
      this.config?.show_user ? e.user_name : void 0,
      r ? `${Y(e.position_seconds)} / ${Y(e.duration_seconds)}` : void 0
    ].filter(Boolean).join(", ");
    return n`
      <article
        class=${`session ${e.state}${this.stale || this.serviceOffline ? " stale" : ""}`}
        data-active=${String(i)}
        data-has-duration=${String(r)}
        data-session-index=${String(t)}
        tabindex=${i ? "0" : "-1"}
        aria-label=${m}
        @focus=${() => {
      this.activate(t, !1);
    }}
        @click=${() => {
      this.activate(t, !1);
    }}
        @keydown=${(x) => {
      this.onSessionKeydown(x, t);
    }}
      >
        ${a.ref ? n`<octopus-media-image
                class="backdrop"
                aria-hidden="true"
                .hass=${this.hass}
                .entryId=${this.entryId}
                .imageRef=${a.ref}
                .variant=${a.variant}
                .alt=${""}
                .backdrop=${!0}
              ></octopus-media-image>` : l}
        <span class="color-wash" aria-hidden="true"></span>
        <span class="vignette" aria-hidden="true"></span>
        <div class="session-content">
          <div class="poster-shell">
            <octopus-media-image
              class="poster-art"
              data-appearance=${this.appearance}
              .hass=${this.hass}
              .entryId=${this.entryId}
              .imageRef=${e.poster_ref ?? void 0}
              .variant=${"poster-medium"}
              .alt=${e.title}
            ></octopus-media-image>
          </div>
          <div class="copy">
            <span class="playback-eyebrow">${f(this.language, "playingEyebrow")}</span>
            <div class="copy-topline">
              ${this.config?.show_badges ? n`<span class=${`state-badge ${e.state}`}>
                      <ha-icon
                        icon=${e.state === "paused" ? "mdi:pause" : "mdi:play"}
                        aria-hidden="true"
                      ></ha-icon>
                      ${h}
                    </span>` : l}
              <span class="media-kind">${f(this.language, e.type)}</span>
            </div>
            <div class="title-block">
              ${this.config?.show_titles ? n`<h3>${e.title}</h3>
                      ${e.subtitle ? n`<p class=${`editorial-meta ${e.type}`}>${e.subtitle}</p>` : l}` : l}
            </div>
            ${g ? n`<div class="enriched-metadata">
                    ${c.length > 0 ? n`<p class="editorial-line">
                            ${c.map((x) => n`<span>${x}</span>`)}
                          </p>` : l}
                    ${u.length > 0 ? n`<div class="technical-chips">
                            ${u.map((x) => n`<span>${x}</span>`)}
                          </div>` : l}
                  </div>` : l}
            <div class="session-context">
              <div class="session-meta">
                ${this.config?.show_device ? n`<span
                        ><ha-icon icon="mdi:television-play" aria-hidden="true"></ha-icon
                        >${w}</span
                      >` : l}
                ${this.config?.show_user ? n`<span
                        ><ha-icon icon="mdi:account" aria-hidden="true"></ha-icon
                        >${e.user_name}</span
                      >` : l}
              </div>
              ${this.stale || this.partial || this.serviceOffline ? n`<div class="data-flags" role="status">
                      ${this.stale || this.serviceOffline ? n`<span>${f(this.language, "staleShort")}</span>` : l}
                      ${this.partial ? n`<span>${f(this.language, "partialShort")}</span>` : l}
                    </div>` : l}
            </div>
            ${this.config?.show_progress && r ? n`<div class="progress-block">
                    <div
                      class="progress-track"
                      role="progressbar"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow=${String(o)}
                      aria-label=${f(this.language, "playbackProgress")}
                    >
                      <span style=${`width:${String(s)}%`}></span>
                    </div>
                    ${this.config.show_time ? n`
                            <div class="times">
                              <span class="position"
                                >${Y(e.position_seconds)}</span
                              >
                              <span class="duration"
                                >${Y(e.duration_seconds)}</span
                              >
                            </div>
                            <div class="progress-summary">
                              <strong class="percentage"
                                >${o}%
                                ${f(this.language, "watchedSuffix")}</strong
                              >
                              <span class="remaining"
                                >${f(this.language, "remainingPrefix")}
                                ${Y(p)}</span
                              >
                            </div>
                          ` : l}
                  </div>` : l}
          </div>
        </div>
      </article>
    `;
  }
  renderNavigation() {
    const e = this.config;
    return n`
      ${e?.show_arrows ? n`<div class="session-arrows" aria-label=${f(this.language, "sessions")}>
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
            </div>` : l}
      ${e?.show_indicators ? n`<div
              class="session-indicators"
              role="group"
              aria-label=${f(this.language, "sessions")}
            >
              ${this.items.map(
      (t, i) => n`<button
                    type="button"
                    data-active=${String(i === this.activeIndex)}
                    aria-label=${`${f(this.language, "session")} ${String(i + 1)}: ${t.title}`}
                    @click=${() => {
        this.activate(i, !0);
      }}
                  ></button>`
    )}
            </div>` : l}
    `;
  }
  onSessionKeydown(e, t) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = e.key === "ArrowRight" ? 1 : -1;
    this.activate(t + i, !0);
  }
  activate(e, t) {
    const i = Math.min(this.items.length - 1, Math.max(0, e)), a = this.items[i];
    if (!a) return;
    this.activeIndex = i, this.dispatchEvent(
      new CustomEvent("octopus-media-focus", {
        bubbles: !0,
        composed: !0,
        detail: { index: i, ref: a.ref }
      })
    );
    const r = this.renderRoot.querySelector(
      `[data-session-index="${String(i)}"]`
    );
    typeof r?.scrollIntoView == "function" && r.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" }), t && r?.focus({ preventScroll: !0 });
  }
  reconcileCycleTimer() {
    if (!(this.heroState === "ready" && !!this.config?.autoplay && this.items.length > 1 && this.isConnected)) {
      this.stopCycleTimer();
      return;
    }
    const t = Math.max(5, this.config?.cycle_interval ?? 10) * 1e3;
    this.stopCycleTimer(), this.cycleTimer = window.setInterval(() => {
      const i = (this.activeIndex + 1) % this.items.length;
      this.activate(i, !1);
    }, t);
  }
  stopCycleTimer() {
    this.cycleTimer !== void 0 && window.clearInterval(this.cycleTimer), this.cycleTimer = void 0;
  }
};
_.styles = E`
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
      gap: 10px;
      grid-template-columns: minmax(100px, 31.5%) minmax(0, 1fr);
      height: 100%;
      min-width: 0;
      padding: 5px 12px;
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
      height: min(100%, 180px);
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
      margin-bottom: 3px;
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
      margin-top: 4px;
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
      margin-top: 5px;
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
    :host([data-appearance="light"]) .playing-hero,
    :host([data-appearance="light"]) .playing-state {
      color: #172832;
      background:
        radial-gradient(circle at 11% 32%, rgb(21 163 177 / 16%), transparent 36%),
        radial-gradient(circle at 88% 40%, rgb(121 58 191 / 12%), transparent 42%),
        linear-gradient(108deg, #e8f3f3, #f4f1f7 50%, #eee7f4);
      border-color: rgb(43 104 111 / 20%);
    }
    :host([data-appearance="light"]) .session {
      background: linear-gradient(112deg, rgb(250 255 255 / 80%), rgb(234 243 246 / 72%));
    }
    :host([data-appearance="light"]) .backdrop {
      display: none;
    }
    :host([data-appearance="light"]) .color-wash {
      background:
        linear-gradient(
          90deg,
          rgb(239 252 252 / 90%),
          rgb(244 248 252 / 78%) 42%,
          rgb(244 238 252 / 72%)
        ),
        radial-gradient(circle at 22% 54%, rgb(36 198 199 / 18%), transparent 34%),
        radial-gradient(circle at 84% 38%, rgb(142 74 212 / 14%), transparent 40%);
    }
    :host([data-appearance="light"]) .vignette {
      box-shadow: inset 0 0 48px 8px rgb(38 95 102 / 10%);
    }
    :host([data-appearance="light"]) h3,
    :host([data-appearance="light"]) .playing-state strong {
      color: #172832;
    }
    :host([data-appearance="light"]) .editorial-meta,
    :host([data-appearance="light"]) .session-meta,
    :host([data-appearance="light"]) .session-meta span,
    :host([data-appearance="light"]) .playing-state p {
      color: #5d7179;
    }
    :host([data-appearance="light"]) .playback-eyebrow,
    :host([data-appearance="light"]) .session-meta ha-icon,
    :host([data-appearance="light"]) .percentage {
      color: #147b80;
    }
    :host([data-appearance="light"]) .media-kind,
    :host([data-appearance="light"]) .technical-chips span,
    :host([data-appearance="light"]) .session-meta span,
    :host([data-appearance="light"]) .session-arrows button {
      background: rgb(255 255 255 / 62%);
      border-color: rgb(30 139 145 / 18%);
      color: #45616a;
    }
    :host([data-appearance="light"]) .editorial-meta,
    :host([data-appearance="light"]) .editorial-meta.episode,
    :host([data-appearance="light"]) .editorial-line,
    :host([data-appearance="light"]) .session-meta,
    :host([data-appearance="light"]) .times,
    :host([data-appearance="light"]) .progress-summary {
      color: #4a646d;
    }
    :host([data-appearance="light"]) .progress-track {
      background: rgb(35 100 109 / 14%);
      border-color: rgb(30 139 145 / 16%);
    }
    @media (prefers-color-scheme: light) {
      :host([data-appearance="auto"]) .playing-hero,
      :host([data-appearance="auto"]) .playing-state {
        color: #172832;
        background:
          radial-gradient(circle at 11% 32%, rgb(21 163 177 / 16%), transparent 36%),
          radial-gradient(circle at 88% 40%, rgb(121 58 191 / 12%), transparent 42%),
          linear-gradient(108deg, #e8f3f3, #f4f1f7 50%, #eee7f4);
        border-color: rgb(43 104 111 / 20%);
      }
      :host([data-appearance="auto"]) h3,
      :host([data-appearance="auto"]) .playing-state strong {
        color: #172832;
      }
      :host([data-appearance="auto"]) .editorial-meta,
      :host([data-appearance="auto"]) .session-meta,
      :host([data-appearance="auto"]) .session-meta span,
      :host([data-appearance="auto"]) .playing-state p {
        color: #5d7179;
      }
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
A([
  d({ attribute: !1 })
], _.prototype, "config", 2);
A([
  d({ attribute: !1 })
], _.prototype, "hass", 2);
A([
  d({ attribute: !1 })
], _.prototype, "items", 2);
A([
  d({ type: String })
], _.prototype, "entryId", 2);
A([
  d({ type: String })
], _.prototype, "focusedRef", 2);
A([
  d({ type: String })
], _.prototype, "language", 2);
A([
  d({ type: String, attribute: "data-appearance" })
], _.prototype, "appearance", 2);
A([
  d({ type: String })
], _.prototype, "heroState", 2);
A([
  d({ type: Boolean })
], _.prototype, "stale", 2);
A([
  d({ type: Boolean })
], _.prototype, "partial", 2);
A([
  d({ type: Boolean })
], _.prototype, "serviceOffline", 2);
A([
  v()
], _.prototype, "activeIndex", 2);
A([
  Le(".session-track")
], _.prototype, "track", 2);
_ = A([
  I("octopus-playing-hero")
], _);
var wi = Object.defineProperty, xi = Object.getOwnPropertyDescriptor, le = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? xi(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && wi(t, i, r), r;
};
let ht = class extends $ {
  constructor() {
    super(...arguments), this.value = 0;
  }
  render() {
    const e = Math.min(100, Math.max(0, this.value));
    return n`
      <div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow=${e}>
        <span style=${`width:${String(e)}%`}></span>
      </div>
    `;
  }
};
ht.styles = E`
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
le([
  d({ type: Number })
], ht.prototype, "value", 2);
ht = le([
  I("octopus-progress-bar")
], ht);
const Kt = (e) => "progress" in e, $i = (e) => {
  const {
    config: t,
    entryId: i,
    focusedItemRef: a,
    hass: r,
    height: s,
    heroState: o,
    items: p,
    language: c,
    mode: u,
    partial: g,
    serviceOffline: h,
    stale: w
  } = e;
  if (u === "playing") {
    const x = p.filter(Kt);
    return n`
      <octopus-playing-hero
        .config=${t}
        data-appearance=${t.appearance}
        .entryId=${i}
        .focusedRef=${a}
        .hass=${r}
        .heroState=${o ?? (x.length > 0 ? "ready" : "empty")}
        .items=${x}
        .language=${c}
        .partial=${g ?? !1}
        .serviceOffline=${h ?? !1}
        .stale=${w ?? !1}
      ></octopus-playing-hero>
    `;
  }
  const m = p[0];
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
                .showBadge=${t.show_badges && s >= 185}
                .showSubtitle=${!1}
                .titlePosition=${t.title_position}
              ></octopus-media-poster>
              <div class="hero-copy">
                <octopus-media-metadata
                  .item=${m}
                  .showSubtitle=${s >= 155}
                ></octopus-media-metadata>
                ${Kt(m) ? n`<octopus-progress-bar .value=${m.progress}></octopus-progress-bar>` : l}
              </div>
            ` : l}
    </div>
  `;
};
var _i = Object.defineProperty, Si = Object.getOwnPropertyDescriptor, Et = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? Si(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && _i(t, i, r), r;
};
let et = class extends $ {
  render() {
    return this.item ? n`<span>${f(this.hass?.language, this.item.type)}</span>` : l;
  }
};
et.styles = E`
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
Et([
  d({ attribute: !1 })
], et.prototype, "item", 2);
Et([
  d({ attribute: !1 })
], et.prototype, "hass", 2);
et = Et([
  I("octopus-media-badges")
], et);
var Ai = Object.defineProperty, ki = Object.getOwnPropertyDescriptor, ft = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? ki(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && Ai(t, i, r), r;
};
let G = class extends $ {
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
    ></octopus-media-image>` : l;
  }
};
G.styles = E`
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
ft([
  d({ attribute: !1 })
], G.prototype, "item", 2);
ft([
  d({ attribute: !1 })
], G.prototype, "hass", 2);
ft([
  d({ type: String })
], G.prototype, "entryId", 2);
G = ft([
  I("octopus-media-thumbnail")
], G);
const Pi = ({ config: e, entryId: t, hass: i, items: a }) => n`
  <div class="layout list" data-layout="list">
    ${a.map(
  (r) => n`
        <div class="list-row">
          <octopus-media-thumbnail
            .item=${r}
            .hass=${i}
            .entryId=${t}
          ></octopus-media-thumbnail>
          <octopus-media-metadata .item=${r}></octopus-media-metadata>
          ${e.show_badges ? n`<octopus-media-badges .item=${r} .hass=${i}></octopus-media-badges>` : null}
        </div>
      `
)}
  </div>
`, Ei = ({ config: e, entryId: t, hass: i, items: a }) => n`
  <div class="layout portrait" data-layout="portrait">
    ${a.map(
  (r) => n`
        <octopus-media-poster
          .item=${r}
          .hass=${i}
          .entryId=${t}
          .variant=${"poster-large"}
          .showTitle=${e.show_titles}
          .showBadge=${e.show_badges}
          .titlePosition=${e.title_position}
        ></octopus-media-poster>
      `
)}
  </div>
`;
var Ii = Object.defineProperty, Ci = Object.getOwnPropertyDescriptor, y = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? Ci(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && Ii(t, i, r), r;
};
let b = class extends $ {
  constructor() {
    super(...arguments), this.items = [], this.entryId = "", this.posterHeight = 160, this.posterWidth = 106.67, this.gap = 10, this.wide = !1, this.showTitles = !0, this.showDates = !0, this.showRatings = !0, this.showArrows = !0, this.autoScroll = !1, this.autoScrollInterval = 6, this.appearance = "dark", this.variant = "recent", this.partial = !1, this.stale = !1, this.canGoBack = !1, this.canGoForward = !1, this.itemSignature = "", this.autoScrollPaused = !1, this.onPointerEnter = (e, t) => {
      e.pointerType === "mouse" && this.announceFocus(t);
    }, this.onScroll = () => {
      this.updateNavigation(), this.scrollFrame !== void 0 && cancelAnimationFrame(this.scrollFrame), this.scrollFrame = requestAnimationFrame(() => {
        this.scrollFrame = void 0;
        const e = this.track();
        if (!e) return;
        const t = e.getBoundingClientRect().left + e.clientWidth / 2, a = [...this.renderRoot.querySelectorAll(".poster")].reduce(
          (s, o, p) => {
            const c = o.getBoundingClientRect(), u = Math.abs(c.left + c.width / 2 - t);
            return !s || u < s.distance ? { distance: u, index: p } : s;
          },
          void 0
        ), r = a ? this.items[a.index] : void 0;
        r && this.announceFocus(r);
      });
    }, this.onWheel = (e) => {
      this.pauseAutoScroll();
      const t = this.track();
      !t || Math.abs(e.deltaX) >= Math.abs(e.deltaY) || e.deltaY === 0 || t.scrollWidth <= t.clientWidth || (e.preventDefault(), t.scrollLeft += e.deltaY);
    }, this.onPointerEnterTrack = () => this.pauseAutoScroll(), this.onPointerLeaveTrack = () => this.resumeAutoScroll(), this.onPointerDownTrack = () => this.pauseAutoScroll(), this.onPointerUpTrack = () => this.resumeAutoScroll(), this.onFocusInTrack = () => this.pauseAutoScroll(), this.onFocusOutTrack = (e) => {
      const t = e.relatedTarget;
      (!(t instanceof Node) || !this.track()?.contains(t)) && this.resumeAutoScroll();
    }, this.onKeyDown = (e) => {
      e.key !== "ArrowLeft" && e.key !== "ArrowRight" || (e.preventDefault(), this.scrollByPage(e.key === "ArrowLeft" ? -1 : 1));
    };
  }
  reducedMotion() {
    return typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  disconnectedCallback() {
    this.resizeObserver?.disconnect(), this.resizeObserver = void 0, this.scrollFrame !== void 0 && cancelAnimationFrame(this.scrollFrame), this.scrollFrame = void 0, this.stopAutoScroll(), super.disconnectedCallback();
  }
  firstUpdated() {
    const e = this.track();
    e && typeof ResizeObserver < "u" && (this.resizeObserver = new ResizeObserver(() => this.updateNavigation()), this.resizeObserver.observe(e)), this.resetForItems(), this.reconcileAutoScroll();
  }
  updated() {
    const e = this.items.map((t) => t.ref).join("|");
    e !== this.itemSignature && this.resetForItems(e), queueMicrotask(() => this.updateNavigation()), this.reconcileAutoScroll();
  }
  render() {
    const e = `--octopus-strip-poster-height:${String(this.posterHeight)}px;--octopus-strip-poster-width:${String(this.posterWidth)}px;--octopus-strip-gap:${String(this.gap)}px`;
    return n`
      <div
        class="track"
        style=${e}
        role="list"
        aria-label=${f(
      this.hass?.language,
      this.variant === "upcoming" ? "upcoming" : "recent"
    )}
        @keydown=${this.onKeyDown}
        @scroll=${this.onScroll}
        @wheel=${this.onWheel}
        @pointerenter=${this.onPointerEnterTrack}
        @pointerleave=${this.onPointerLeaveTrack}
        @pointerdown=${this.onPointerDownTrack}
        @pointerup=${this.onPointerUpTrack}
        @focusin=${this.onFocusInTrack}
        @focusout=${this.onFocusOutTrack}
      >
        ${this.items.map(
      (t) => n`
            <button
              class="poster"
              type="button"
              role="listitem"
              aria-label=${this.accessibleLabel(t)}
              data-focused=${String(t.ref === this.focusedRef)}
              @pointerenter=${(i) => this.onPointerEnter(i, t)}
              @click=${() => this.announceFocus(t)}
              @focus=${() => this.announceFocus(t)}
            >
              <span class="frame">
                <octopus-media-image
                  data-appearance=${this.appearance}
                  .hass=${this.hass}
                  .entryId=${this.entryId}
                  .imageRef=${t.poster_ref ?? void 0}
                  .variant=${this.posterWidth < 125 ? "poster-small" : "poster-medium"}
                  .alt=${t.title}
                ></octopus-media-image>
                ${this.showTitles ? n`
                        <span class="copy-gradient">
                          <span class="title">${t.title}</span>
                          ${this.metadata(t) ? n`<span class="metadata">${this.metadata(t)}</span>` : l}
                          ${this.upcomingEpisodeSubtitle(t) ? n`<span class="episode-subtitle"
                                  >${this.upcomingEpisodeSubtitle(t)}</span
                                >` : l}
                        </span>
                      ` : l}
              </span>
            </button>
          `
    )}
      </div>
      ${this.showArrows ? n`
              <button
                class="arrow previous"
                type="button"
                aria-label=${f(this.hass?.language, "previousPosters")}
                ?hidden=${!this.canGoBack}
                @click=${() => this.scrollByPage(-1)}
              >
                ‹
              </button>
              <button
                class="arrow next"
                type="button"
                aria-label=${f(this.hass?.language, "nextPosters")}
                ?hidden=${!this.canGoForward}
                @click=${() => this.scrollByPage(1)}
              >
                ›
              </button>
            ` : l}
      ${this.stale ? n`<span class="state stale" role="status">${f(this.hass?.language, "stale")}</span>` : l}
      ${this.partial ? n`<span class="state partial" role="status">${f(this.hass?.language, "partialShort")}</span>` : l}
    `;
  }
  track() {
    return this.renderRoot.querySelector(".track");
  }
  resetForItems(e = this.items.map((t) => t.ref).join("|")) {
    this.itemSignature = e;
    const t = this.track();
    t && (t.scrollLeft = 0), this.updateNavigation();
    const i = this.items[0];
    i && this.announceFocus(i);
  }
  updateNavigation() {
    const e = this.track();
    e && (this.canGoBack = e.scrollLeft > 2, this.canGoForward = e.scrollLeft + e.clientWidth < e.scrollWidth - 2);
  }
  scrollByPage(e) {
    const t = this.track();
    t && t.scrollBy({
      behavior: this.reducedMotion() ? "auto" : "smooth",
      left: e * t.clientWidth * 0.82
    });
  }
  reconcileAutoScroll() {
    if (this.stopAutoScroll(), !this.autoScroll || this.items.length < 2 || this.reducedMotion())
      return;
    const e = this.track();
    !e || e.scrollWidth <= e.clientWidth + 2 || this.autoScrollPaused || (this.autoScrollTimer = window.setInterval(
      () => this.advanceAutoScroll(),
      Math.max(2, this.autoScrollInterval) * 1e3
    ));
  }
  stopAutoScroll() {
    this.autoScrollTimer !== void 0 && window.clearInterval(this.autoScrollTimer), this.autoScrollTimer = void 0;
  }
  pauseAutoScroll() {
    this.autoScrollPaused = !0, this.stopAutoScroll();
  }
  resumeAutoScroll() {
    this.autoScrollPaused && (this.autoScrollPaused = !1, this.reconcileAutoScroll());
  }
  advanceAutoScroll() {
    const e = this.track();
    if (!e || e.scrollWidth <= e.clientWidth + 2) {
      this.stopAutoScroll();
      return;
    }
    const t = this.renderRoot.querySelector(".poster");
    if (!t) return;
    const i = t.offsetWidth + this.gap, a = e.scrollLeft + e.clientWidth >= e.scrollWidth - i - 2;
    e.scrollTo({ left: a ? 0 : e.scrollLeft + i, behavior: "smooth" });
  }
  announceFocus(e) {
    e.ref !== this.focusedRef && this.dispatchEvent(
      new CustomEvent("octopus-media-focus", {
        bubbles: !0,
        composed: !0,
        detail: { ref: e.ref }
      })
    );
  }
  accessibleLabel(e) {
    const t = this.metadata(e);
    return t ? `${e.title}, ${t}` : e.title;
  }
  metadata(e) {
    if (this.variant === "upcoming" && "release_at" in e) {
      const i = this.upcomingDate(e);
      return e.type === "episode" ? [e.season_number !== null && e.season_number !== void 0 ? `T${String(e.season_number).padStart(2, "0")}${e.episode_number === null || e.episode_number === void 0 ? "" : `E${String(e.episode_number).padStart(2, "0")}`}` : "", i].filter(Boolean).join(" · ") : [i, this.wide ? this.releaseType(e.release_type) : void 0].filter(Boolean).join(" · ");
    }
    const t = [];
    if (this.showDates)
      if ("season" in e && e.season !== null) {
        const i = `T${String(e.season).padStart(2, "0")}`;
        t.push(
          e.episode === null ? i : `${i}E${String(e.episode).padStart(2, "0")}`
        );
      } else "year" in e && e.year !== null ? t.push(String(e.year)) : "release_at" in e ? t.push(this.formatDate(e.release_at)) : e.subtitle && t.push(e.subtitle);
    return this.showRatings && "rating" in e && e.rating !== null && t.push(`★ ${e.rating.toFixed(1)}`), t.join(" · ");
  }
  upcomingEpisodeSubtitle(e) {
    if (!(this.variant !== "upcoming" || e.type !== "episode" || !this.wide))
      return e.subtitle ?? void 0;
  }
  upcomingDate(e) {
    if (e.relative_day === "today") return f(this.hass?.language, "today");
    if (e.relative_day === "tomorrow") return f(this.hass?.language, "tomorrow");
    const t = e.all_day && /^\d{4}-\d{2}-\d{2}$/.test(e.release_at) ? /* @__PURE__ */ new Date(`${e.release_at}T12:00:00Z`) : new Date(e.release_at);
    if (Number.isNaN(t.getTime())) return "";
    const i = new Intl.DateTimeFormat(this.hass?.language ?? "pt-BR", {
      day: "2-digit",
      month: "short",
      timeZone: this.hass?.config.time_zone ?? "UTC"
    }).format(t).replace(".", "").replace(/\s+DE\s+/i, " ").toUpperCase();
    if (e.all_day) return i;
    const a = new Intl.DateTimeFormat(this.hass?.language ?? "pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !1,
      timeZone: this.hass?.config.time_zone ?? "UTC"
    }).format(t);
    return `${i} · ${a}`;
  }
  releaseType(e) {
    if (!e) return;
    const t = e.toLowerCase(), i = t === "digital" ? "digital" : t === "physical" ? "physical" : t === "cinema" || t === "theatrical" ? "cinema" : void 0;
    return i ? f(this.hass?.language, i) : void 0;
  }
  formatDate(e) {
    const t = new Date(e);
    return Number.isNaN(t.getTime()) ? "" : new Intl.DateTimeFormat(this.hass?.language ?? "pt-BR", {
      day: "2-digit",
      month: "short",
      timeZone: this.hass?.config.time_zone ?? "UTC"
    }).format(t);
  }
};
b.styles = E`
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
    :host([variant="upcoming"]) .copy-gradient {
      height: 56%;
      padding: 24px 7px 7px;
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
    :host([data-appearance="light"]) .title,
    :host([data-appearance="light"]) .poster:hover .title,
    :host([data-appearance="light"]) .poster:focus-visible .title,
    :host([data-appearance="light"]) .poster[data-focused="true"] .title {
      color: rgb(255 255 255 / 94%);
    }
    :host([data-appearance="light"]) .metadata,
    :host([data-appearance="light"]) .episode-subtitle {
      color: var(--octopus-media-muted, #5d7179);
    }
    :host([data-appearance="light"]) .frame {
      border-color: rgb(28 99 107 / 20%);
      box-shadow: 0 8px 18px rgb(32 87 94 / 18%);
    }
    :host([data-appearance="light"]) .copy-gradient {
      background: linear-gradient(
        180deg,
        rgb(2 8 12 / 0%) 0%,
        rgb(2 8 12 / 12%) 34%,
        rgb(2 8 12 / 46%) 58%,
        rgb(2 8 12 / 82%) 100%
      );
    }
    :host([data-appearance="light"]) .title,
    :host([data-appearance="light"]) .poster:hover .title,
    :host([data-appearance="light"]) .poster:focus-visible .title,
    :host([data-appearance="light"]) .poster[data-focused="true"] .title,
    :host([data-appearance="light"]) .metadata,
    :host([data-appearance="light"]) .episode-subtitle {
      color: rgb(255 255 255 / 94%);
    }
    :host([data-appearance="light"]) .badge {
      background: rgb(250 255 255 / 78%);
      border-color: rgb(30 139 145 / 22%);
      color: #27434b;
    }
    :host([data-appearance="light"]) .arrow {
      background: rgb(255 255 255 / 78%);
      border-color: rgb(30 139 145 / 22%);
      box-shadow: 0 5px 14px rgb(32 87 94 / 16%);
      color: #24515a;
    }
    @media (prefers-color-scheme: light) {
      :host([data-appearance="auto"]) .title,
      :host([data-appearance="auto"]) .poster:hover .title,
      :host([data-appearance="auto"]) .poster:focus-visible .title,
      :host([data-appearance="auto"]) .poster[data-focused="true"] .title {
        color: var(--octopus-media-title, #172832);
      }
      :host([data-appearance="auto"]) .metadata,
      :host([data-appearance="auto"]) .episode-subtitle {
        color: var(--octopus-media-muted, #5d7179);
      }
    }
    :host([variant="upcoming"]) .title {
      font-size: 11px;
      line-height: 1.1;
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
    :host([variant="upcoming"]) .metadata {
      color: rgb(210 220 232 / 78%);
      font-size: 9px;
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
    :host([data-appearance="light"]) .poster:hover {
      filter: none;
    }
    :host([data-appearance="light"]) .poster:hover .frame {
      border-color: rgb(38 125 135 / 24%);
      box-shadow: 0 11px 23px rgb(32 87 94 / 20%);
    }
    :host([data-appearance="light"]) .poster:focus-visible,
    :host([data-appearance="light"]) .poster[data-focused="true"] {
      filter: none;
    }
    :host([data-appearance="light"]) .poster:focus-visible .frame,
    :host([data-appearance="light"]) .poster[data-focused="true"] .frame {
      border-color: rgb(27 157 166 / 72%);
      box-shadow:
        0 10px 22px rgb(32 87 94 / 18%),
        0 0 0 2px rgb(27 157 166 / 58%);
    }
    .poster:hover .title,
    .poster:focus-visible .title,
    .poster[data-focused="true"] .title {
      color: #fff;
    }
    :host([data-appearance="light"]) .poster:hover .title,
    :host([data-appearance="light"]) .poster:focus-visible .title,
    :host([data-appearance="light"]) .poster[data-focused="true"] .title {
      color: var(--octopus-media-title, #172832);
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
], b.prototype, "showArrows", 2);
y([
  d({ type: Boolean })
], b.prototype, "autoScroll", 2);
y([
  d({ type: Number })
], b.prototype, "autoScrollInterval", 2);
y([
  d({ type: String, attribute: "data-appearance" })
], b.prototype, "appearance", 2);
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
  I("octopus-media-strip")
], b);
const Mi = 18, Ti = 70, Oi = 30, Ri = 0.22;
function zi(e, t, i = "auto", a = Number.POSITIVE_INFINITY, r = a) {
  const s = e < 560, p = Math.max(1, e - (s ? Mi : Ti)), c = s ? 3 : 5;
  let g = Math.max(1, Math.min(i === "auto" ? c : i, Math.max(1, r)));
  const h = s ? 10 : 12, w = Math.max(1, t - Oi), m = (st) => {
    const Tt = r > st, ue = Tt ? Ri : 0, ge = Tt ? st : Math.max(0, st - 1);
    return Math.max(1, (p - ge * h) / (st + ue) * 1.5);
  };
  let x = m(g);
  const It = Math.min(c, Math.max(1, r));
  g < It && x > w && r > g && (g = It, x = m(g));
  const Ct = Math.min(w, x), at = Ct * (2 / 3), rt = Math.max(
    1,
    Math.min(a, Math.floor((p + h) / (at + h)))
  ), de = a > rt, he = rt * at + Math.max(0, rt - 1) * h, Mt = de ? Math.max(0, p - he - h) : 0;
  return {
    gap: h,
    peekFraction: Mt / at,
    peekWidth: Mt,
    posterHeight: Ct,
    posterWidth: at,
    usefulWidth: p,
    visibleFullItems: rt
  };
}
function Ni(e, t, i = "auto", a = Number.POSITIVE_INFINITY) {
  return zi(
    e,
    t,
    i,
    a,
    Number.POSITIVE_INFINITY
  );
}
const ce = ({
  config: e,
  entryId: t,
  focusedItemRef: i,
  hass: a,
  height: r,
  items: s,
  mode: o,
  partial: p,
  stale: c,
  width: u
}) => {
  const g = o === "upcoming", h = Ni(
    u,
    r,
    e.posters_visible,
    s.length
  );
  return n`
    <octopus-media-strip
      class="layout strip"
      data-layout="strip"
      data-appearance=${e.appearance}
      variant=${g ? "upcoming" : "recent"}
      .partial=${p ?? !1}
      .stale=${c ?? !1}
      .hass=${a}
      .items=${s}
      .entryId=${t}
      .focusedRef=${i}
      .posterHeight=${h.posterHeight}
      .posterWidth=${h.posterWidth}
      .gap=${h.gap}
      .wide=${u >= 560}
      .showTitles=${e.show_titles}
      .showDates=${g || e.show_dates}
      .showRatings=${g ? !1 : e.show_ratings}
      .showArrows=${e.show_arrows}
      .autoScroll=${e.auto_scroll}
      .autoScrollInterval=${e.auto_scroll_interval}
    ></octopus-media-strip>
  `;
};
function yt(e, t) {
  switch (e) {
    case "grid":
      return di(t);
    case "hero":
      return $i(t);
    case "compact":
      return oi(t);
    case "portrait":
      return Ei(t);
    case "list":
      return Pi(t);
    case "strip":
      return ce(t);
  }
}
function pe(e) {
  return ce(e);
}
var Fi = Object.defineProperty, Di = Object.getOwnPropertyDescriptor, N = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? Di(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && Fi(t, i, r), r;
};
let O = class extends $ {
  constructor() {
    super(...arguments), this.entries = [], this.previewWidth = 600, this.previewLoading = !1, this.configurationMissing = !1, this.previewGeneration = 0, this.autoLayout = new ne();
  }
  set hass(e) {
    this.hassValue = e, this.loadEntries(), this.ensurePreviewSubscription();
  }
  get hass() {
    return this.hassValue;
  }
  setConfig(e) {
    const t = this.config?.entry_id;
    this.config = oe(e), t !== this.config.entry_id && this.resetPreviewSubscription(), this.ensurePreviewSubscription();
  }
  connectedCallback() {
    super.connectedCallback(), this.ensurePreviewSubscription();
  }
  disconnectedCallback() {
    this.resetPreviewSubscription(), this.resizeObserver?.disconnect(), this.resizeObserver = void 0, super.disconnectedCallback();
  }
  firstUpdated() {
    typeof ResizeObserver > "u" || (this.resizeObserver = new ResizeObserver(([e]) => {
      const t = e?.contentRect.width ?? 0;
      t > 0 && Math.abs(t - this.previewWidth) >= 1 && (this.previewWidth = Math.max(320, Math.round(t)));
    }), this.resizeObserver.observe(this));
  }
  render() {
    if (!this.config) return n``;
    const e = this.compatibleModes();
    return n`
      <div class="form">
        <label>
          ${this.t("integration")}
          <select @change=${this.onEntryChange}>
            ${this.config.entry_id === "select_entry" ? n`<option value="select_entry" selected>
                    ${this.t("selectIntegration")}
                  </option>` : l}
            ${this.selectedEntryMissing ? n`<option value=${this.config.entry_id} selected>
                    ${this.t("previousConfigurationUnavailable")}
                  </option>` : l}
            ${this.entries.map(
      (t) => n`<option
                  value=${t.entry_id}
                  ?selected=${t.entry_id === this.config?.entry_id}
                >
                  ${t.title}
                </option>`
    )}
          </select>
        </label>
        ${this.configurationMissing || this.selectedEntryMissing ? n`<p class="configuration-warning" role="alert">
                <strong>${this.t("configurationNotFound")}</strong>
                <span>${this.t("configurationNotFoundSecondary")}</span>
              </p>` : l}
        <label>
          ${this.t("contentMode")}
          <select .value=${this.config.mode} @change=${this.onModeChange}>
            ${e.map((t) => n`<option value=${t}>${this.t(t)}</option>`)}
          </select>
        </label>
        <label>
          ${this.t("appearance")}
          <select .value=${this.config.appearance} @change=${this.onAppearanceChange}>
            <option value="auto">${this.t("appearanceAuto")}</option>
            <option value="dark">${this.t("appearanceDark")}</option>
            <option value="light">${this.t("appearanceLight")}</option>
          </select>
        </label>
        ${this.isStripMode() ? n`
                <label>
                  ${this.t("itemCount")}
                  <input
                    type="number"
                    min="1"
                    max="50"
                    .value=${String(this.config.item_count)}
                    @change=${this.onItemCountChange}
                  />
                </label>
                <label class="check standalone">
                  <input
                    type="checkbox"
                    .checked=${this.config.auto_scroll}
                    @change=${this.onAutoScrollChange}
                  />
                  ${this.t("autoScroll")}
                </label>
                ${this.config.auto_scroll ? n`<label>
                        ${this.t("autoScrollInterval")}
                        <input
                          type="number"
                          min="2"
                          max="3600"
                          .value=${String(this.config.auto_scroll_interval)}
                          @change=${this.onAutoScrollIntervalChange}
                        />
                      </label>` : l}
              ` : l}
        <section class="preview-panel" aria-label=${this.t("previewCard")}>
          <strong>${this.t("preview")}</strong>
          ${this.renderPreview()}
        </section>
      </div>
    `;
  }
  renderPreview() {
    if (!this.config || this.config.entry_id === "select_entry")
      return n`<octopus-empty-state
        .message=${this.t("selectIntegration")}
      ></octopus-empty-state>`;
    if (this.configurationMissing || this.selectedEntryMissing)
      return n`<octopus-empty-state
        .message=${this.t("configurationNotFound")}
        .secondary=${this.t("configurationNotFoundSecondary")}
      ></octopus-empty-state>`;
    if (this.previewLoading)
      return n`<octopus-loading-state .message=${this.t("loading")}></octopus-loading-state>`;
    if (this.previewError)
      return n`<octopus-error-state .message=${this.previewError}></octopus-error-state>`;
    if (!this.previewSnapshot)
      return n`<octopus-empty-state
        .message=${this.t("previewUnavailable")}
      ></octopus-empty-state>`;
    const e = this.effectiveMode(), t = this.previewSnapshot[e], i = t.items.slice(0, this.config.item_count), a = e === "playing" ? 240 : 210, r = this.config.layout === "auto" ? this.autoLayout.update(e, this.previewWidth, a) : this.config.layout, s = this.previewSnapshot.availability.jellyfin.state === "offline", o = e !== "playing", p = i.length > 0 ? l : e === "playing" && (s || t.stale) ? n`<octopus-error-state .message=${this.t("unavailable")}></octopus-error-state>` : e === "upcoming" && this.previewSnapshot.availability.radarr.state === "not_configured" && this.previewSnapshot.availability.sonarr.state === "not_configured" ? n`<octopus-empty-state
                .message=${this.t("upcomingNotConfigured")}
              ></octopus-empty-state>` : n`<octopus-empty-state
                .message=${this.t(e === "playing" ? "noPlaying" : "empty")}
              ></octopus-empty-state>`;
    return n`
      <article
        class="preview-card real-preview"
        data-appearance=${this.previewAppearance()}
        data-mode=${e}
        data-wide=${String(this.previewWidth >= 560)}
      >
        ${o ? n`
                <header>
                  <span>${this.t(e === "recent" ? "recentEyebrow" : "upcomingEyebrow")}</span>
                  <small>${i.length}</small>
                </header>
              ` : l}
        ${p !== l ? p : e === "upcoming" ? pe({
      config: this.config,
      entryId: this.config.entry_id,
      focusedItemRef: i[0]?.ref,
      hass: this.hassValue,
      height: a,
      items: i,
      language: this.hassValue?.language,
      mode: e,
      partial: t.partial,
      stale: t.stale,
      width: this.previewWidth
    }) : yt(r, {
      config: this.config,
      entryId: this.config.entry_id,
      focusedItemRef: i[0]?.ref,
      hass: this.hassValue,
      height: a,
      heroState: e === "playing" ? "ready" : void 0,
      items: i,
      language: this.hassValue?.language,
      mode: e,
      partial: t.partial,
      serviceOffline: s,
      stale: t.stale,
      width: this.previewWidth
    })}
      </article>
    `;
  }
  effectiveMode() {
    return this.config?.mode ?? "recent";
  }
  isStripMode() {
    return this.effectiveMode() !== "playing";
  }
  previewAppearance() {
    return this.config?.appearance === "light" ? "light" : this.config?.appearance === "dark" ? "dark" : this.hassValue?.themes?.darkMode === !1 ? "light" : "dark";
  }
  async loadEntries() {
    if (this.hassValue)
      try {
        this.entries = await je(this.hassValue), this.entries.length === 1 && this.config?.entry_id === "select_entry" && this.updateConfig({ entry_id: this.entries[0]?.entry_id ?? "select_entry" });
      } catch {
        this.entries = [];
      }
  }
  compatibleModes() {
    const e = this.entries.find((t) => t.entry_id === this.config?.entry_id);
    return e ? bt.filter((t) => e.capabilities[t]) : [...bt];
  }
  get selectedEntryMissing() {
    return !!(this.config && this.config.entry_id !== "select_entry" && !this.entries.some((e) => e.entry_id === this.config?.entry_id));
  }
  updateConfig(e) {
    this.config && (this.config = { ...this.config, ...e }, this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: !0,
        composed: !0,
        detail: { config: this.config }
      })
    ), this.ensurePreviewSubscription());
  }
  onEntryChange(e) {
    const t = e.target.value;
    t !== this.config?.entry_id && this.resetPreviewSubscription(), this.updateConfig({ entry_id: t });
  }
  onModeChange(e) {
    this.updateConfig({ mode: e.target.value });
  }
  onAppearanceChange(e) {
    this.updateConfig({
      appearance: e.target.value
    });
  }
  onItemCountChange(e) {
    const t = Number(e.target.value);
    this.updateConfig({ item_count: Math.min(50, Math.max(1, Math.round(t))) });
  }
  onAutoScrollIntervalChange(e) {
    const t = Number(e.target.value);
    this.updateConfig({ auto_scroll_interval: Math.min(3600, Math.max(2, Math.round(t))) });
  }
  onAutoScrollChange(e) {
    this.updateConfig({ auto_scroll: e.target.checked });
  }
  t(e) {
    return f(this.hassValue?.language, e);
  }
  async ensurePreviewSubscription() {
    const e = this.config?.entry_id;
    if (!this.isConnected || !this.hassValue || !e || e === "select_entry" || this.previewUnsubscribe && this.previewEntryId === e) return;
    this.resetPreviewSubscription();
    const t = ++this.previewGeneration;
    this.previewEntryId = e, this.previewLoading = !0, this.previewError = void 0, this.configurationMissing = !1;
    try {
      const i = await ie(this.hassValue, e, (a) => {
        t === this.previewGeneration && (this.previewSnapshot = a, this.previewLoading = !1, this.previewError = void 0);
      });
      t !== this.previewGeneration ? i() : this.previewUnsubscribe = i;
    } catch (i) {
      if (t !== this.previewGeneration) return;
      this.previewLoading = !1, this.configurationMissing = ae(i), this.previewError = i instanceof Error ? i.message : this.t("previewUnavailable");
    }
  }
  resetPreviewSubscription() {
    this.previewGeneration += 1, this.previewUnsubscribe?.(), this.previewUnsubscribe = void 0, this.previewEntryId = void 0, this.previewSnapshot = void 0, this.previewLoading = !1, this.previewError = void 0, this.configurationMissing = !1;
  }
};
O.styles = E`
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
    .configuration-warning {
      background: color-mix(in srgb, var(--warning-color, #d98b22) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--warning-color, #d98b22) 45%, transparent);
      border-radius: 8px;
      display: grid;
      gap: 3px;
      padding: 10px;
    }
    .preview-panel {
      display: grid;
      gap: 8px;
      min-width: 0;
      overflow: hidden;
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
      height: 240px;
      max-width: 100%;
      overflow: hidden;
      padding: 0 9px;
      width: 100%;
    }
    .preview-card[data-appearance="light"] {
      --octopus-text: #172832;
      background:
        radial-gradient(circle at 13% 35%, rgb(41 190 195 / 18%), transparent 34%),
        radial-gradient(circle at 72% 24%, rgb(157 112 220 / 14%), transparent 37%),
        linear-gradient(105deg, #e8f3f3, #f4f1f7 48%, #eee7f4);
      color: #172832;
    }
    .real-preview[data-mode="recent"],
    .real-preview[data-mode="upcoming"] {
      height: 210px;
    }
    .real-preview[data-mode="playing"] {
      grid-template-rows: minmax(0, 1fr);
    }
    .real-preview > octopus-media-strip,
    .real-preview > octopus-playing-hero,
    .real-preview > octopus-empty-state,
    .real-preview > octopus-error-state,
    .real-preview > octopus-loading-state {
      display: block;
      height: 100%;
      min-height: 0;
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
N([
  v()
], O.prototype, "config", 2);
N([
  v()
], O.prototype, "entries", 2);
N([
  v()
], O.prototype, "previewWidth", 2);
N([
  v()
], O.prototype, "previewSnapshot", 2);
N([
  v()
], O.prototype, "previewLoading", 2);
N([
  v()
], O.prototype, "previewError", 2);
N([
  v()
], O.prototype, "configurationMissing", 2);
O = N([
  I("octopus-media-editor")
], O);
const Ui = E`
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
    --octopus-strip-background: #06080d;
    --octopus-strip-border: color-mix(in srgb, var(--divider-color, #778198) 38%, transparent);
    --octopus-strip-eyebrow: var(--octopus-accent-secondary);
    --octopus-strip-context-text: rgb(188 223 228 / 72%);
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
  .card[data-appearance="light"] {
    --octopus-bg: #eef4f5;
    --octopus-surface: rgb(255 255 255 / 86%);
    --octopus-surface-elevated: #ffffff;
    --octopus-text: #172832;
    --octopus-muted: #5d7179;
    --octopus-border: rgb(43 104 111 / 18%);
    --octopus-strip-background:
      radial-gradient(circle at 12% -18%, rgb(44 194 196 / 18%), transparent 44%),
      radial-gradient(circle at 88% 118%, rgb(143 92 246 / 12%), transparent 48%),
      linear-gradient(145deg, #faffff, #e4f0f2 74%);
    --octopus-strip-border: rgb(32 104 112 / 18%);
    --octopus-strip-eyebrow: #147b80;
    --octopus-strip-context-text: #46616a;
    background:
      radial-gradient(circle at 14% -24%, rgb(62 190 193 / 18%), transparent 42%),
      radial-gradient(circle at 92% 112%, rgb(139 92 246 / 10%), transparent 46%),
      linear-gradient(145deg, #ffffff 0%, var(--octopus-bg) 72%);
    color: var(--octopus-text);
    box-shadow:
      0 14px 34px rgb(26 73 81 / 14%),
      inset 0 1px rgb(255 255 255 / 80%);
  }
  @media (prefers-color-scheme: light) {
    .card[data-appearance="auto"] {
      --octopus-bg: #eef4f5;
      --octopus-surface: rgb(255 255 255 / 86%);
      --octopus-surface-elevated: #ffffff;
      --octopus-text: #172832;
      --octopus-muted: #5d7179;
      --octopus-border: rgb(43 104 111 / 18%);
      background:
        radial-gradient(circle at 14% -24%, rgb(62 190 193 / 18%), transparent 42%),
        radial-gradient(circle at 92% 112%, rgb(139 92 246 / 10%), transparent 46%),
        linear-gradient(145deg, #ffffff 0%, var(--octopus-bg) 72%);
      color: var(--octopus-text);
      box-shadow:
        0 14px 34px rgb(26 73 81 / 14%),
        inset 0 1px rgb(255 255 255 / 80%);
    }
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
  .card[data-playing-hero="true"]:not(.fixed) {
    min-height: 210px;
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
    background: var(--octopus-strip-background);
    border-color: var(--octopus-strip-border);
    border-radius: 14px;
    box-shadow: none;
    gap: 0;
    grid-template-rows: 22px minmax(0, 1fr);
    isolation: isolate;
    padding: 0 9px;
  }
  .card[data-layout="strip"]:not(.fixed) {
    min-height: 210px;
  }
  .card[data-layout="strip"][data-appearance="light"] .ambient-background {
    display: none;
  }
  .card[data-layout="strip"][data-appearance="light"] .ambient-color {
    background:
      radial-gradient(circle at 13% 35%, rgb(32 188 193 / 12%), transparent 38%),
      radial-gradient(circle at 82% 18%, rgb(143 92 246 / 10%), transparent 42%),
      linear-gradient(
        105deg,
        rgb(251 255 255 / 48%),
        rgb(232 243 245 / 24%) 52%,
        rgb(244 237 251 / 34%)
      );
  }
  .card[data-layout="strip"][data-appearance="light"] .ambient-vignette {
    box-shadow: inset 0 0 42px 8px rgb(37 101 108 / 7%);
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
    display: flex;
    gap: 0;
    min-width: 0;
    padding: 2px 2px 0;
  }
  .card[data-layout="strip"] ha-icon {
    color: var(--octopus-media-accent, #aa75f2);
    height: 14px;
    width: 14px;
  }
  .card[data-layout="strip"] h2 {
    color: var(--octopus-strip-eyebrow);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.13em;
    line-height: 1.1;
    text-transform: uppercase;
  }
  .card[data-layout="strip"] .context {
    background: transparent;
    border: 0;
    border-radius: 0;
    color: var(--octopus-strip-context-text);
    font-size: 9px;
    font-variant-numeric: tabular-nums;
    height: auto;
    min-width: 0;
    padding: 0 2px;
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
var Li = Object.defineProperty, ji = Object.getOwnPropertyDescriptor, C = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? ji(t, i) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (r = (a ? o(t, i, r) : o(r)) || r);
  return a && r && Li(t, i, r), r;
};
let S = class extends $ {
  constructor() {
    super(...arguments), this.loading = !0, this.configurationMissing = !1, this.containerWidth = 390, this.containerHeight = 210, this.localPlaying = [], this.subscriptionPending = !1, this.subscriptionGeneration = 0, this.reconnectDelay = 1e3, this.progressTickAt = 0, this.autoLayout = new ne(), this.onMediaFocus = (e) => {
      if (!this.config) return;
      const t = this.effectiveMode(this.config), i = typeof this.config.height == "number" ? this.config.height : this.containerHeight, a = this.resolveLayout(this.config, t, i), r = t === "playing" && a === "hero";
      if (a !== "strip" && !r) return;
      const s = e.detail;
      if (typeof s.ref != "string" || s.ref === this.focusedItemRef) return;
      const o = this.itemsForMode(t).find((c) => c.ref === s.ref);
      if (!o || (this.focusedItemRef = o.ref, r)) return;
      const p = this.artworkFor(o);
      if (!p) {
        this.ambientArtwork = void 0, this.pendingAmbientArtwork = void 0;
        return;
      }
      if (this.sameArtwork(p, this.ambientArtwork)) {
        this.pendingAmbientArtwork = void 0;
        return;
      }
      this.pendingAmbientArtwork = p;
    }, this.onAmbientPreloadReady = (e) => {
      const t = e.detail;
      typeof t.imageRef != "string" || t.imageRef !== this.pendingAmbientArtwork?.imageRef || (this.ambientArtwork = this.pendingAmbientArtwork, this.pendingAmbientArtwork = void 0);
    };
  }
  set hass(e) {
    this.hassValue = e, this.requestUpdate(), this.ensureSubscription();
  }
  get hass() {
    return this.hassValue;
  }
  setConfig(e) {
    const t = this.config?.entry_id;
    this.config = oe(e), t !== this.config.entry_id && this.resetSubscription(), this.synchronizeFocusAndAmbient(!0), this.ensureSubscription();
  }
  static getStubConfig() {
    return { ...k, sections: [...k.sections] };
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
    this.subscriptionGeneration += 1, this.subscriptionPending = !1, this.unsubscribe?.(), this.unsubscribe = void 0, this.clearReconnectTimer(), this.stopProgressTimer(), this.resizeObserver?.disconnect(), this.resizeObserver = void 0, this.resizeFrame !== void 0 && cancelAnimationFrame(this.resizeFrame), super.disconnectedCallback();
  }
  render() {
    const e = this.config ?? k, t = this.hassValue?.language, i = this.effectiveMode(e), a = { ...e, appearance: this.resolveAppearance(e.appearance) }, r = e.title ?? (i === "upcoming" ? this.t("upcoming", t).toUpperCase() : this.t(i, t)), s = e.height, o = typeof s == "number", p = o ? s : this.containerHeight, c = this.resolveLayout(e, i, p), u = c === "strip", g = u ? this.t(i === "recent" ? "recentEyebrow" : "upcomingEyebrow", t) : r, h = i === "playing" && c === "hero", w = [
      o ? `--octopus-card-height:${String(s)}px` : "",
      e.accent_color ? `--octopus-media-accent:${e.accent_color}` : ""
    ].filter(Boolean).join(";");
    return n`
      <article
        class=${`card ${o ? "fixed" : ""}`}
        data-theme=${e.theme}
        data-appearance=${a.appearance}
        data-concept=${e.visual_concept}
        data-title-position=${e.title_position}
        data-header-alignment=${e.header_alignment}
        data-layout=${c}
        data-mode=${i}
        data-wide=${String(this.containerWidth >= 560)}
        data-has-ambient=${String(u && !!this.ambientArtwork)}
        data-playing-hero=${String(h)}
        style=${w}
        @octopus-media-focus=${this.onMediaFocus}
      >
        ${u ? this.renderAmbientBackground(e) : l}
        ${h ? l : n`<header>
                <span class="heading">
                  ${u ? l : n`<ha-icon icon="mdi:octopus" aria-hidden="true"></ha-icon>`}
                  <h2>${g}</h2>
                </span>
                ${this.snapshot && u ? n`<span
                        class="context"
                        aria-label=${`${String(this.itemsForMode(i).length)} itens`}
                        >${this.itemsForMode(i).length}</span
                      >` : l}
              </header>`}
        <section class="content">
          ${this.renderContent(a, i, t, c, p)}
        </section>
      </article>
    `;
  }
  renderAmbientBackground(e) {
    return n`
      ${this.ambientArtwork ? n`<octopus-media-image
              class="ambient-background"
              aria-hidden="true"
              .hass=${this.hassValue}
              .entryId=${e.entry_id}
              .imageRef=${this.ambientArtwork.imageRef}
              .variant=${this.ambientArtwork.variant}
              .alt=${""}
              .backdrop=${!0}
            ></octopus-media-image>` : l}
      ${this.pendingAmbientArtwork ? n`<octopus-media-image
              class="ambient-preload"
              aria-hidden="true"
              .hass=${this.hassValue}
              .entryId=${e.entry_id}
              .imageRef=${this.pendingAmbientArtwork.imageRef}
              .variant=${this.pendingAmbientArtwork.variant}
              .alt=${""}
              .backdrop=${!0}
              @octopus-image-ready=${this.onAmbientPreloadReady}
            ></octopus-media-image>` : l}
      <span class="ambient-color" aria-hidden="true"></span>
      <span class="ambient-vignette" aria-hidden="true"></span>
    `;
  }
  renderContent(e, t, i, a, r) {
    if (e.entry_id === vt)
      return n`<octopus-empty-state
        .message=${this.t("notConfigured", i)}
      ></octopus-empty-state>`;
    if (this.configurationMissing)
      return n`<octopus-empty-state
        .message=${this.t("configurationNotFound", i)}
        .secondary=${this.t("configurationNotFoundSecondary", i)}
      ></octopus-empty-state>`;
    if (this.loading)
      return n`<octopus-loading-state
        .message=${this.t("loading", i)}
      ></octopus-loading-state>`;
    if (t === "playing" && a === "hero") {
      const c = this.localPlaying.slice(0, e.item_count), u = this.snapshot?.availability.jellyfin.state === "offline", g = this.snapshot?.playing;
      return yt("hero", {
        config: e,
        entryId: e.entry_id,
        focusedItemRef: this.focusedItemRef ?? c[0]?.ref,
        hass: this.hassValue,
        heroState: c.length > 0 ? "ready" : u || this.error ? "unavailable" : "empty",
        items: c,
        language: i,
        mode: t,
        partial: g?.partial ?? !1,
        serviceOffline: u,
        stale: g?.stale ?? !1,
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
    const o = this.itemsForMode(t).slice(0, e.item_count);
    if (t === "upcoming" && this.snapshot.availability.radarr.state === "not_configured" && this.snapshot.availability.sonarr.state === "not_configured")
      return n`<octopus-empty-state
        .message=${this.t("upcomingNotConfigured", i)}
      ></octopus-empty-state>`;
    if ((t === "recent" || t === "playing") && this.snapshot.availability.jellyfin.state === "offline" && o.length === 0)
      return n`<octopus-error-state
        .message=${this.t("unavailable", i)}
      ></octopus-error-state>`;
    if (o.length === 0) {
      if (t === "upcoming")
        return n`<div class="upcoming-empty" role="status">
          <ha-icon icon="mdi:calendar-blank-outline" aria-hidden="true"></ha-icon>
          <span>${this.t("upcomingEmpty", i)}</span>
        </div>`;
      const c = t === "playing" ? "noPlaying" : "empty";
      return n`<octopus-empty-state
        .message=${this.t(c, i)}
      ></octopus-empty-state>`;
    }
    const p = this.snapshot[t];
    return t === "upcoming" ? pe({
      config: e,
      entryId: e.entry_id,
      focusedItemRef: this.focusedItemRef ?? o[0]?.ref,
      hass: this.hassValue,
      height: r,
      items: o,
      mode: t,
      partial: p.partial,
      stale: p.stale,
      width: this.containerWidth
    }) : n`
      ${yt(a, {
      config: e,
      entryId: e.entry_id,
      focusedItemRef: this.focusedItemRef ?? o[0]?.ref,
      hass: this.hassValue,
      height: r,
      items: o,
      language: i,
      mode: t,
      width: this.containerWidth
    })}
      ${p.stale ? n`<p class="stale" role="status">${this.t("stale", i)}</p>` : l}
      ${p.partial ? n`<p class="partial" role="status">${this.t("partial", i)}</p>` : l}
    `;
  }
  effectiveMode(e) {
    return e.mode;
  }
  resolveAppearance(e) {
    return e !== "auto" ? e : this.hassValue?.themes?.darkMode === !1 ? "light" : "dark";
  }
  resolveLayout(e, t, i) {
    return e.layout === "auto" ? this.autoLayout.update(t, this.containerWidth, i) : e.layout;
  }
  itemsForMode(e) {
    return e === "playing" ? this.localPlaying : this.snapshot?.[e].items ?? [];
  }
  t(e, t) {
    return f(t, e);
  }
  async ensureSubscription() {
    if (!this.isConnected || !this.config || !this.hassValue || this.config.entry_id === vt || this.unsubscribe || this.subscriptionPending)
      return;
    const e = ++this.subscriptionGeneration;
    this.subscriptionPending = !0, this.loading = !0, this.error = void 0, this.configurationMissing = !1;
    try {
      const t = await ie(
        this.hassValue,
        this.config.entry_id,
        (i) => {
          e === this.subscriptionGeneration && (this.snapshot = i, this.localPlaying = i.playing.items.map((a) => ({ ...a })), this.synchronizeFocusAndAmbient(!0), this.reconcileProgressTimer(), this.loading = !1, this.error = void 0);
        }
      );
      e !== this.subscriptionGeneration ? t() : (this.unsubscribe = t, this.reconnectDelay = 1e3);
    } catch (t) {
      e === this.subscriptionGeneration && (this.configurationMissing = ae(t), this.error = t instanceof Error ? t.message : "subscription_failed", this.loading = !1, this.scheduleReconnect());
    } finally {
      e === this.subscriptionGeneration && (this.subscriptionPending = !1);
    }
  }
  resetSubscription() {
    this.subscriptionGeneration += 1, this.subscriptionPending = !1, this.unsubscribe?.(), this.unsubscribe = void 0, this.clearReconnectTimer(), this.stopProgressTimer(), this.snapshot = void 0, this.localPlaying = [], this.focusedItemRef = void 0, this.ambientArtwork = void 0, this.pendingAmbientArtwork = void 0, this.loading = !0, this.error = void 0, this.configurationMissing = !1;
  }
  scheduleReconnect() {
    if (this.reconnectTimer !== void 0 || !this.isConnected) return;
    const e = this.subscriptionGeneration, t = this.reconnectDelay;
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 3e4), this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = void 0, e === this.subscriptionGeneration && this.ensureSubscription();
    }, t);
  }
  clearReconnectTimer() {
    this.reconnectTimer !== void 0 && window.clearTimeout(this.reconnectTimer), this.reconnectTimer = void 0;
  }
  reconcileProgressTimer() {
    this.progressTickAt = Date.now(), this.snapshot?.availability.jellyfin.state !== "offline" && this.snapshot?.playing.stale !== !0 && this.localPlaying.some((t) => t.state === "playing" && t.duration_seconds > 0) ? this.progressTimer ??= window.setInterval(() => this.advancePlayingProgress(), 1e3) : this.stopProgressTimer();
  }
  advancePlayingProgress() {
    const e = Date.now(), t = Math.max(0, (e - this.progressTickAt) / 1e3);
    this.progressTickAt = e, t !== 0 && (this.localPlaying = this.localPlaying.map((i) => {
      if (i.state !== "playing" || i.duration_seconds <= 0) return i;
      const a = Math.min(i.duration_seconds, i.position_seconds + t);
      return {
        ...i,
        position_seconds: a,
        progress: Math.min(100, Math.max(0, a / i.duration_seconds * 100))
      };
    }));
  }
  stopProgressTimer() {
    this.progressTimer !== void 0 && window.clearInterval(this.progressTimer), this.progressTimer = void 0;
  }
  synchronizeFocusAndAmbient(e) {
    if (!this.config || !this.snapshot) return;
    const t = this.itemsForMode(this.effectiveMode(this.config)).slice(
      0,
      this.config.item_count
    ), i = t.find((r) => r.ref === this.focusedItemRef) ?? t[0];
    this.focusedItemRef = i?.ref;
    const a = this.artworkFor(i);
    e && (this.ambientArtwork = a, this.pendingAmbientArtwork = void 0);
  }
  artworkFor(e) {
    if (e) {
      if ("backdrop_ref" in e && e.backdrop_ref)
        return { imageRef: e.backdrop_ref, variant: "backdrop-medium" };
      if ("still_ref" in e && e.still_ref)
        return { imageRef: e.still_ref, variant: "poster-large" };
      if (e.poster_ref)
        return { imageRef: e.poster_ref, variant: "poster-large" };
    }
  }
  sameArtwork(e, t) {
    return e?.imageRef === t?.imageRef && e?.variant === t?.variant;
  }
  startResizeObserver() {
    this.resizeObserver || typeof ResizeObserver > "u" || (this.resizeObserver = new ResizeObserver((e) => {
      const t = e[0];
      if (!t) return;
      const i = t.contentBoxSize[0], a = i?.inlineSize ?? t.contentRect.width, r = i?.blockSize ?? t.contentRect.height;
      this.resizeFrame !== void 0 && cancelAnimationFrame(this.resizeFrame), this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = void 0, a > 0 && Math.abs(a - this.containerWidth) >= 0.5 && (this.containerWidth = a), r > 0 && Math.abs(r - this.containerHeight) >= 0.5 && (this.containerHeight = r);
      });
    }), this.resizeObserver.observe(this));
  }
};
S.styles = Ui;
C([
  v()
], S.prototype, "config", 2);
C([
  v()
], S.prototype, "snapshot", 2);
C([
  v()
], S.prototype, "loading", 2);
C([
  v()
], S.prototype, "error", 2);
C([
  v()
], S.prototype, "configurationMissing", 2);
C([
  v()
], S.prototype, "containerWidth", 2);
C([
  v()
], S.prototype, "containerHeight", 2);
C([
  v()
], S.prototype, "localPlaying", 2);
C([
  v()
], S.prototype, "focusedItemRef", 2);
C([
  v()
], S.prototype, "ambientArtwork", 2);
C([
  v()
], S.prototype, "pendingAmbientArtwork", 2);
S = C([
  I("octopus-media-card")
], S);
window.customCards = window.customCards ?? [];
window.customCards.some((e) => e.type === "octopus-media-card") || window.customCards.push({
  type: "octopus-media-card",
  name: "Octopus Media Card",
  description: "Poster-focused Jellyfin, Radarr, and Sonarr card",
  preview: !0
});
export {
  S as OctopusMediaCard
};

/**
 * Lightweight, self-contained browser/DOM/WebCrypto/Firebase-compat sandbox
 * built on Node.js built-ins (node:vm, node:crypto, node:fs, node:path).
 * Designed for opaque-box E2E testing of client-side scripts.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

export class MockStorage {
  constructor(initial = {}) {
    this._map = new Map(Object.entries(initial).map(([k, v]) => [String(k), String(v)]));
  }
  get length() { return this._map.size; }
  key(i) { return Array.from(this._map.keys())[i] ?? null; }
  getItem(k) { return this._map.has(String(k)) ? this._map.get(String(k)) : null; }
  setItem(k, v) { this._map.set(String(k), String(v)); }
  removeItem(k) { this._map.delete(String(k)); }
  clear() { this._map.clear(); }
}

class MockEvent {
  constructor(type, opts = {}) {
    this.type = type;
    this.bubbles = Boolean(opts.bubbles);
    this.cancelable = Boolean(opts.cancelable);
    this.defaultPrevented = false;
    this.target = opts.target || null;
    this.currentTarget = null;
    this.key = opts.key || '';
    Object.assign(this, opts);
  }
  preventDefault() { this.defaultPrevented = true; }
  stopPropagation() {}
}

class MockClassList {
  constructor(el) { this._el = el; }
  _set() {
    const cls = this._el.getAttribute('class') || '';
    return new Set(cls.split(/\s+/).filter(Boolean));
  }
  _save(set) {
    if (set.size === 0) this._el.removeAttribute('class');
    else this._el.setAttribute('class', Array.from(set).join(' '));
  }
  add(...tokens) { const s = this._set(); tokens.forEach(t => s.add(t)); this._save(s); }
  remove(...tokens) { const s = this._set(); tokens.forEach(t => s.delete(t)); this._save(s); }
  contains(token) { return this._set().has(token); }
  toggle(token, force) {
    const s = this._set();
    const has = s.has(token);
    const next = force !== undefined ? Boolean(force) : !has;
    if (next) s.add(token); else s.delete(token);
    this._save(s);
    return next;
  }
}

function parseSimpleAttrs(attrStr) {
  const attrs = {};
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m;
  while ((m = re.exec(attrStr)) !== null) {
    const name = m[1].toLowerCase();
    const val = m[2] ?? m[3] ?? m[4] ?? '';
    attrs[name] = val;
  }
  return attrs;
}

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function decodeEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function parseHtmlInto(doc, parent, html) {
  const tokens = String(html).split(/(<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>)/g);
  const stack = [parent];
  let inRawTag = null;

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (!tok) continue;

    if (inRawTag) {
      const closeRe = new RegExp(`^</${inRawTag}\\s*>`, 'i');
      if (closeRe.test(tok)) {
        stack.pop();
        inRawTag = null;
      } else {
        stack[stack.length - 1].appendChild(doc.createTextNode(tok));
      }
      continue;
    }

    if (tok.startsWith('<!--')) continue;
    if (tok.startsWith('<!')) continue;

    if (tok.startsWith('</')) {
      const tag = tok.slice(2, -1).trim().toLowerCase();
      while (stack.length > 1) {
        const top = stack.pop();
        if (top.tagName.toLowerCase() === tag) break;
      }
      continue;
    }

    if (tok.startsWith('<')) {
      const selfClosing = tok.endsWith('/>');
      const inner = tok.slice(1, selfClosing ? -2 : -1).trim();
      const spaceIdx = inner.search(/\s/);
      const tag = (spaceIdx === -1 ? inner : inner.slice(0, spaceIdx)).toLowerCase();
      const attrStr = spaceIdx === -1 ? '' : inner.slice(spaceIdx + 1);
      const el = doc.createElement(tag);
      const attrs = parseSimpleAttrs(attrStr);
      for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, decodeEntities(v));
      }
      stack[stack.length - 1].appendChild(el);
      if (!selfClosing && !VOID_TAGS.has(tag)) {
        stack.push(el);
        if (tag === 'script' || tag === 'style') {
          inRawTag = tag;
        }
      }
      continue;
    }

    stack[stack.length - 1].appendChild(doc.createTextNode(decodeEntities(tok)));
  }
}

function matchSingleSelector(el, sel) {
  if (!el || el.nodeType !== 1) return false;
  let rest = sel.trim();
  if (!rest) return false;

  // Tag at start
  const tagMatch = rest.match(/^([a-zA-Z0-9_-]+)/);
  if (tagMatch) {
    if (el.tagName.toLowerCase() !== tagMatch[1].toLowerCase()) return false;
    rest = rest.slice(tagMatch[0].length);
  }

  while (rest.length > 0) {
    if (rest[0] === '#') {
      const m = rest.match(/^#([a-zA-Z0-9_-]+)/);
      if (!m || el.id !== m[1]) return false;
      rest = rest.slice(m[0].length);
    } else if (rest[0] === '.') {
      const m = rest.match(/^\.([a-zA-Z0-9_-]+)/);
      if (!m || !el.classList.contains(m[1])) return false;
      rest = rest.slice(m[0].length);
    } else if (rest[0] === '[') {
      const m = rest.match(/^\[([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\]]*)))?\]/);
      if (!m) return false;
      const attr = m[1];
      const expected = m[2] ?? m[3] ?? m[4];
      if (!el.hasAttribute(attr)) return false;
      if (expected !== undefined && el.getAttribute(attr) !== expected) return false;
      rest = rest.slice(m[0].length);
    } else {
      return false;
    }
  }
  return true;
}

function matchesSelector(el, selector) {
  const parts = selector.split(',').map(s => s.trim()).filter(Boolean);
  for (const part of parts) {
    const chain = part.split(/\s+/).filter(Boolean);
    if (chain.length === 0) continue;
    if (!matchSingleSelector(el, chain[chain.length - 1])) continue;
    let cur = el.parentNode;
    let idx = chain.length - 2;
    while (idx >= 0 && cur) {
      if (cur.nodeType === 1 && matchSingleSelector(cur, chain[idx])) {
        idx--;
      }
      cur = cur.parentNode;
    }
    if (idx < 0) return true;
  }
  return false;
}

class MockNode {
  constructor(nodeType, ownerDocument) {
    this.nodeType = nodeType;
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.childNodes = [];
    this._listeners = new Map();
  }
  get firstChild() { return this.childNodes[0] || null; }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; }
  get nextSibling() {
    if (!this.parentNode) return null;
    const idx = this.parentNode.childNodes.indexOf(this);
    return idx >= 0 ? (this.parentNode.childNodes[idx + 1] || null) : null;
  }
  appendChild(node) {
    if (node.parentNode) node.parentNode.removeChild(node);
    node.parentNode = this;
    this.childNodes.push(node);
    if (this.ownerDocument && this.ownerDocument._onNodeAttached) {
      this.ownerDocument._onNodeAttached(node, this);
    }
    return node;
  }
  insertBefore(node, ref) {
    if (!ref) return this.appendChild(node);
    if (node.parentNode) node.parentNode.removeChild(node);
    const idx = this.childNodes.indexOf(ref);
    if (idx === -1) return this.appendChild(node);
    node.parentNode = this;
    this.childNodes.splice(idx, 0, node);
    if (this.ownerDocument && this.ownerDocument._onNodeAttached) {
      this.ownerDocument._onNodeAttached(node, this);
    }
    return node;
  }
  removeChild(node) {
    const idx = this.childNodes.indexOf(node);
    if (idx >= 0) {
      this.childNodes.splice(idx, 1);
      node.parentNode = null;
    }
    return node;
  }
  replaceChild(newNode, oldNode) {
    const idx = this.childNodes.indexOf(oldNode);
    if (idx === -1) throw new Error('replaceChild: oldNode not found');
    if (newNode.parentNode) newNode.parentNode.removeChild(newNode);
    oldNode.parentNode = null;
    newNode.parentNode = this;
    this.childNodes[idx] = newNode;
    if (this.ownerDocument && this.ownerDocument._onNodeReplaced) {
      this.ownerDocument._onNodeReplaced(newNode, oldNode, this);
    }
    if (this.ownerDocument && this.ownerDocument._onNodeAttached) {
      this.ownerDocument._onNodeAttached(newNode, this);
    }
    return oldNode;
  }
  replaceWith(...nodes) {
    if (!this.parentNode) return;
    const parent = this.parentNode;
    const idx = parent.childNodes.indexOf(this);
    if (idx === -1) return;
    if (nodes.length === 1 && nodes[0] instanceof MockNode) {
      parent.replaceChild(nodes[0], this);
      return;
    }
    const next = this.nextSibling;
    parent.removeChild(this);
    for (const n of nodes) {
      const node = typeof n === 'string' ? this.ownerDocument.createTextNode(n) : n;
      parent.insertBefore(node, next);
    }
  }
  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }
  replaceChildren(...nodes) {
    while (this.childNodes.length > 0) {
      this.removeChild(this.childNodes[this.childNodes.length - 1]);
    }
    for (const n of nodes) {
      const node = typeof n === 'string' ? this.ownerDocument.createTextNode(n) : n;
      this.appendChild(node);
    }
  }
  addEventListener(type, fn) {
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    this._listeners.get(type).add(fn);
  }
  removeEventListener(type, fn) {
    if (this._listeners.has(type)) this._listeners.get(type).delete(fn);
  }
  dispatchEvent(ev) {
    if (!ev.target) ev.target = this;
    let cur = this;
    while (cur) {
      ev.currentTarget = cur;
      const set = cur._listeners?.get(ev.type);
      if (set) {
        for (const fn of Array.from(set)) fn.call(cur, ev);
      }
      cur = ev.bubbles ? cur.parentNode : null;
    }
    return !ev.defaultPrevented;
  }
}

class MockTextNode extends MockNode {
  constructor(text, doc) {
    super(3, doc);
    this.data = String(text);
  }
  get textContent() { return this.data; }
  set textContent(v) { this.data = String(v); }
  cloneNode() { return this.ownerDocument.createTextNode(this.data); }
}

class MockComment extends MockNode {
  constructor(text, doc) {
    super(8, doc);
    this.data = String(text);
  }
  get textContent() { return this.data; }
  cloneNode() { return this.ownerDocument.createComment(this.data); }
}

class MockElement extends MockNode {
  constructor(tagName, doc) {
    super(1, doc);
    this.tagName = String(tagName).toUpperCase();
    this._attrs = new Map();
    this.classList = new MockClassList(this);
    this.style = { setProperty() {}, removeProperty() {} };
    this.value = '';
    this.disabled = false;
    this.hidden = false;
    this.focused = false;
    this._executed = false;
    this.dataset = new Proxy({}, {
      get: (_, prop) => {
        const attr = 'data-' + String(prop).replace(/[A-Z]/g, m => '-' + m.toLowerCase());
        return this._attrs.get(attr);
      },
      set: (_, prop, val) => {
        const attr = 'data-' + String(prop).replace(/[A-Z]/g, m => '-' + m.toLowerCase());
        this._attrs.set(attr, String(val));
        return true;
      },
      deleteProperty: (_, prop) => {
        const attr = 'data-' + String(prop).replace(/[A-Z]/g, m => '-' + m.toLowerCase());
        this._attrs.delete(attr);
        return true;
      }
    });
  }
  get children() { return this.childNodes.filter(n => n.nodeType === 1); }
  get id() { return this._attrs.get('id') || ''; }
  set id(v) { this.setAttribute('id', v); }
  get name() { return this._attrs.get('name') || ''; }
  set name(v) { this.setAttribute('name', v); }
  get src() { return this._attrs.get('src') || ''; }
  set src(v) { this.setAttribute('src', v); }
  get href() { return this._attrs.get('href') || ''; }
  set href(v) { this.setAttribute('href', v); }
  get className() { return this._attrs.get('class') || ''; }
  set className(v) { this.setAttribute('class', v); }

  setAttribute(k, v) {
    const key = String(k).toLowerCase();
    this._attrs.set(key, String(v));
    if (key === 'hidden') this.hidden = true;
    if (key === 'disabled') this.disabled = true;
    if (key === 'value') this.value = String(v);
  }
  getAttribute(k) {
    const key = String(k).toLowerCase();
    return this._attrs.has(key) ? this._attrs.get(key) : null;
  }
  hasAttribute(k) { return this._attrs.has(String(k).toLowerCase()); }
  removeAttribute(k) {
    const key = String(k).toLowerCase();
    this._attrs.delete(key);
    if (key === 'hidden') this.hidden = false;
    if (key === 'disabled') this.disabled = false;
  }
  get attributes() {
    return Array.from(this._attrs.entries()).map(([name, value]) => ({ name, value }));
  }

  get textContent() {
    return this.childNodes.map(c => c.textContent).join('');
  }
  set textContent(v) {
    this.childNodes = [];
    if (v !== '' && v !== null && v !== undefined) {
      this.appendChild(this.ownerDocument.createTextNode(String(v)));
    }
  }

  get innerHTML() {
    return this.childNodes.map(c => {
      if (c.nodeType === 3) return c.data;
      if (c.nodeType === 1) {
        const tag = c.tagName.toLowerCase();
        const attrs = Array.from(c._attrs.entries()).map(([k, v]) => ` ${k}="${v}"`).join('');
        if (VOID_TAGS.has(tag)) return `<${tag}${attrs}>`;
        return `<${tag}${attrs}>${c.innerHTML}</${tag}>`;
      }
      return '';
    }).join('');
  }
  set innerHTML(html) {
    this.childNodes = [];
    parseHtmlInto(this.ownerDocument, this, html);
  }

  querySelectorAll(sel) {
    const out = [];
    const walk = node => {
      for (const ch of node.children) {
        if (matchesSelector(ch, sel)) out.push(ch);
        walk(ch);
      }
    };
    walk(this);
    return out;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  closest(sel) {
    let cur = this;
    while (cur && cur.nodeType === 1) {
      if (matchesSelector(cur, sel)) return cur;
      cur = cur.parentNode;
    }
    return null;
  }
  focus() {
    this.focused = true;
    if (this.ownerDocument) this.ownerDocument.activeElement = this;
  }
  click() {
    if (typeof this.onclick === 'function') this.onclick(new MockEvent('click', { target: this }));
    this.dispatchEvent(new MockEvent('click', { bubbles: true, target: this }));
  }
  select() {}
  reset() {
    for (const el of this.querySelectorAll('input, textarea, select')) {
      el.value = '';
    }
  }
  cloneNode(deep = false) {
    const copy = this.ownerDocument.createElement(this.tagName.toLowerCase());
    for (const [k, v] of this._attrs.entries()) copy.setAttribute(k, v);
    copy.value = this.value;
    copy.hidden = this.hidden;
    copy.disabled = this.disabled;
    if (deep) {
      for (const ch of this.childNodes) {
        copy.appendChild(ch.nodeType === 3 ? this.ownerDocument.createTextNode(ch.data) : ch.cloneNode(true));
      }
    }
    return copy;
  }
  get elements() {
    const list = this.querySelectorAll('input, textarea, select, button');
    const proxy = [...list];
    for (const el of list) {
      if (el.name) proxy[el.name] = el;
      if (el.id && !proxy[el.id]) proxy[el.id] = el;
    }
    return proxy;
  }
}

export class MockDocument extends MockNode {
  constructor(isLive = true) {
    super(9, null);
    this.ownerDocument = this;
    this._isLive = isLive;
    this.readyState = 'complete';
    this.activeElement = null;
    this.documentWriteCalls = [];
    this.documentElement = this.createElement('html');
    this.head = this.createElement('head');
    this.body = this.createElement('body');
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.childNodes.push(this.documentElement);
    this._onNodeAttached = null;
    this._onNodeReplaced = null;
  }
  createElement(tag) { return new MockElement(tag, this); }
  createTextNode(text) { return new MockTextNode(text, this); }
  createComment(text) { return new MockComment(text, this); }
  importNode(node, deep = false) {
    const clone = node.cloneNode(deep);
    const reown = n => {
      n.ownerDocument = this;
      for (const ch of n.childNodes) reown(ch);
    };
    reown(clone);
    return clone;
  }
  get title() {
    const t = this.head ? this.head.querySelector('title') : null;
    return t ? t.textContent : '';
  }
  set title(v) {
    let t = this.head ? this.head.querySelector('title') : null;
    if (!t && this.head) {
      t = this.createElement('title');
      this.head.appendChild(t);
    }
    if (t) t.textContent = String(v);
  }
  getElementById(id) {
    return this.documentElement.querySelector('#' + id);
  }
  querySelector(sel) { return this.documentElement.querySelector(sel); }
  querySelectorAll(sel) { return this.documentElement.querySelectorAll(sel); }
  open() {}
  write(html) {
    this.documentWriteCalls.push(String(html));
  }
  close() {}
  execCommand() { return false; }
}

/**
 * Shared RTDB store so multiple independent Firebase clients (e.g. teacher & student)
 * can share the exact same database state, listeners, and security rules.
 */
export function createFirebaseStore(initialDbData = {}, options = {}) {
  return {
    dbData: structuredClone(initialDbData),
    connected: options.connected ?? true,
    listeners: new Map(), // path -> Set<{ event, cb, errCb }>
    uidCounter: 1
  };
}

/**
 * In-memory Firebase Compat Mock (App, Auth, RTDB) with optional RtdbRulesEvaluator
 * and optional shared RTDB store.
 */
export function createFirebaseMock(options = {}) {
  const {
    dbData = {},
    store = null,
    currentUser = null,
    rulesEvaluator = null,
    enforceRules = false,
    failScripts = false,
    failAuth = false,
    failDbReads = false,
    connected = true
  } = options;

  const state = store || createFirebaseStore(dbData, { connected });
  state.apps = state.apps || [];
  let defaultUser = currentUser ? { ...currentUser } : null;

  function getVal(pathStr) {
    const segs = pathStr.split('/').filter(Boolean);
    let cur = state.dbData;
    for (const s of segs) {
      if (cur && typeof cur === 'object' && Object.prototype.hasOwnProperty.call(cur, s)) {
        cur = cur[s];
      } else {
        return null;
      }
    }
    return cur === undefined ? null : structuredClone(cur);
  }

  function setVal(pathStr, val) {
    const segs = pathStr.split('/').filter(Boolean);
    if (segs.length === 0) {
      state.dbData = structuredClone(val || {});
      return;
    }
    let cur = state.dbData;
    for (let i = 0; i < segs.length - 1; i++) {
      if (!cur[segs[i]] || typeof cur[segs[i]] !== 'object') cur[segs[i]] = {};
      cur = cur[segs[i]];
    }
    const last = segs[segs.length - 1];
    if (val === null || val === undefined) delete cur[last];
    else cur[last] = structuredClone(val);
  }

  function resolveTimestamps(v) {
    if (v && typeof v === 'object') {
      if (v['.sv'] === 'timestamp') return Date.now();
      if (Array.isArray(v)) return v.map(resolveTimestamps);
      const out = {};
      for (const [k, val] of Object.entries(v)) out[k] = resolveTimestamps(val);
      return out;
    }
    return v;
  }

  function makeSnap(key, val) {
    return {
      key,
      exists: () => val !== null && val !== undefined,
      val: () => (val === undefined ? null : structuredClone(val)),
      forEach: fn => {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          for (const [k, v] of Object.entries(val)) {
            if (fn(makeSnap(k, v)) === true) break;
          }
        }
      }
    };
  }

  function notifyPath(targetPath, eventType, snap) {
    const set = state.listeners.get(targetPath);
    if (!set) return;
    for (const entry of Array.from(set)) {
      if (entry.event === eventType) entry.cb(snap);
    }
  }

  function notifyWrite(targetPath, oldVal, newVal) {
    const segs = targetPath.split('/').filter(Boolean);
    // Notify 'value' on targetPath and all ancestors
    for (let i = segs.length; i >= 0; i--) {
      const p = segs.slice(0, i).join('/');
      const key = i === 0 ? null : segs[i - 1];
      notifyPath(p, 'value', makeSnap(key, getVal(p)));
    }
    // Notify child_added / child_changed / child_removed on parent
    if (segs.length >= 1) {
      const parentPath = segs.slice(0, -1).join('/');
      const childKey = segs[segs.length - 1];
      if (newVal === null || newVal === undefined) {
        notifyPath(parentPath, 'child_removed', makeSnap(childKey, oldVal));
      } else if (oldVal === null || oldVal === undefined) {
        notifyPath(parentPath, 'child_added', makeSnap(childKey, newVal));
      } else {
        notifyPath(parentPath, 'child_changed', makeSnap(childKey, newVal));
      }
    }
  }

  function makeRef(pathStr, appAuth) {
    const norm = String(pathStr || '').replace(/^\/+|\/+$/g, '');
    return {
      key: norm.split('/').pop() || null,
      child(sub) {
        const s = String(sub).replace(/^\/+|\/+$/g, '');
        return makeRef(norm ? `${norm}/${s}` : s, appAuth);
      },
      async once(eventType, cb, errCb) {
        // Defer via macrotask (8ms) so synchronous on('child_added') initial children (2ms)
        // fire after room.on() is registered and before once('value') completes.
        await new Promise(r => setTimeout(r, 8));
        try {
          if (failDbReads) throw new Error('network error');
          let snap;
          if (norm === '.info/connected') {
            snap = makeSnap('connected', state.connected);
          } else {
            if (enforceRules && rulesEvaluator) {
              const res = rulesEvaluator.canRead(norm, appAuth.currentUser, state.dbData);
              if (!res.allowed) {
                const err = new Error(res.reason);
                err.code = 'PERMISSION_DENIED';
                throw err;
              }
            }
            snap = makeSnap(norm.split('/').pop() || null, getVal(norm));
          }
          if (typeof cb === 'function') cb(snap);
          return snap;
        } catch (err) {
          if (typeof errCb === 'function') errCb(err);
          throw err;
        }
      },
      on(eventType, cb, errCb) {
        if (enforceRules && rulesEvaluator && norm !== '.info/connected') {
          const res = rulesEvaluator.canRead(norm, appAuth.currentUser, state.dbData);
          if (!res.allowed) {
            const err = new Error(res.reason);
            err.code = 'PERMISSION_DENIED';
            queueMicrotask(() => { if (typeof errCb === 'function') errCb(err); });
            return cb;
          }
        }
        if (!state.listeners.has(norm)) state.listeners.set(norm, new Set());
        const entry = { event: eventType, cb, errCb };
        state.listeners.get(norm).add(entry);

        if (norm === '.info/connected' && eventType === 'value') {
          queueMicrotask(() => cb(makeSnap('connected', state.connected)));
        } else if (eventType === 'value') {
          const val = getVal(norm);
          queueMicrotask(() => cb(makeSnap(norm.split('/').pop() || null, val)));
        } else if (eventType === 'child_added') {
          const val = getVal(norm);
          if (val && typeof val === 'object') {
            setTimeout(() => {
              for (const [k, v] of Object.entries(val)) {
                if (state.listeners.get(norm)?.has(entry)) {
                  cb(makeSnap(k, v));
                }
              }
            }, 2);
          }
        }
        return cb;
      },
      off(eventType, cb) {
        const set = state.listeners.get(norm);
        if (!set) return;
        for (const entry of Array.from(set)) {
          if ((!eventType || entry.event === eventType) && (!cb || entry.cb === cb)) {
            set.delete(entry);
          }
        }
      },
      async set(rawVal) {
        const val = resolveTimestamps(rawVal);
        if (enforceRules && rulesEvaluator) {
          const res = rulesEvaluator.canWrite(norm, val, appAuth.currentUser, state.dbData);
          if (!res.allowed) {
            const err = new Error(res.reason);
            err.code = 'PERMISSION_DENIED';
            throw err;
          }
        }
        const oldVal = getVal(norm);
        setVal(norm, val);
        notifyWrite(norm, oldVal, val);
      },
      async remove() {
        return this.set(null);
      },
      onDisconnect() {
        return { remove: async () => {} };
      }
    };
  }

  function makeApp(name, cfg) {
    let appUser = name === '[DEFAULT]' ? defaultUser : null;
    const appAuthListeners = new Set();
    const authObj = {
      get currentUser() { return appUser; },
      set currentUser(u) { appUser = u; },
      async setPersistence() {},
      onAuthStateChanged(cb) {
        appAuthListeners.add(cb);
        queueMicrotask(() => {
          if (failAuth) return;
          cb(appUser);
        });
        return () => appAuthListeners.delete(cb);
      },
      async signInAnonymously() {
        if (failAuth) throw new Error('auth failed');
        appUser = { uid: `anon_${state.uidCounter++}`, isAnonymous: true, provider: 'anonymous' };
        for (const cb of appAuthListeners) cb(appUser);
        return { user: appUser };
      },
      async signInWithEmailAndPassword(email) {
        if (failAuth) throw new Error('auth failed');
        appUser = { uid: `profe_${state.uidCounter++}`, email, isAnonymous: false, provider: 'password' };
        for (const cb of appAuthListeners) cb(appUser);
        return { user: appUser };
      },
      async createUserWithEmailAndPassword(email) {
        if (failAuth) throw new Error('auth failed');
        appUser = {
          uid: `profe_${state.uidCounter++}`,
          email,
          isAnonymous: false,
          provider: 'password',
          async updateProfile() {}
        };
        for (const cb of appAuthListeners) cb(appUser);
        return { user: appUser };
      },
      async signOut() {
        appUser = null;
        for (const cb of appAuthListeners) cb(null);
      }
    };
    return {
      name,
      options: cfg,
      auth: () => authObj,
      database: () => ({ ref: p => makeRef(p, authObj) })
    };
  }

  const firebase = {
    apps: [],
    initializeApp(cfg, name = '[DEFAULT]') {
      const existing = firebase.apps.find(a => a.name === name);
      if (existing) return existing;
      const app = makeApp(name, cfg);
      firebase.apps.push(app);
      return app;
    },
    auth: Object.assign(() => firebase.apps[0]?.auth(), {
      Auth: { Persistence: { NONE: 'none', LOCAL: 'local' } }
    }),
    database: Object.assign(() => firebase.apps[0]?.database(), {
      ServerValue: { TIMESTAMP: { '.sv': 'timestamp' } }
    })
  };

  return {
    firebase,
    state,
    getRaw: p => getVal(p),
    setRaw: (p, v) => {
      const old = getVal(p);
      setVal(p, v);
      notifyWrite(p, old, v);
    },
    listenerCount: p => (state.listeners.get(p)?.size || 0),
    failScripts
  };
}

/**
 * Creates a full browser-like vm context with DOM, Storage, WebCrypto,
 * DOMParser, script execution, and configurable Firebase mock.
 */
export function createBrowserEnv(options = {}) {
  const {
    repoRoot = process.cwd(),
    url = 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html',
    html = '<!doctype html><html><head><title>Test</title></head><body><div id="caja"></div></body></html>',
    localStorageData = {},
    sessionStorageData = {},
    firebaseMock = null,
    preloadFirebase = false,
    fetchHandler = null,
    readyState = 'complete'
  } = options;

  const parsedUrl = new URL(url);
  const document = new MockDocument(true);
  document.readyState = readyState;
  const localStorage = new MockStorage(localStorageData);
  const sessionStorage = new MockStorage(sessionStorageData);
  const navigations = [];
  const clipboardWrites = [];
  const loadedScripts = [];

  const location = {
    href: parsedUrl.href,
    origin: parsedUrl.origin,
    protocol: parsedUrl.protocol,
    host: parsedUrl.host,
    hostname: parsedUrl.hostname,
    pathname: parsedUrl.pathname,
    search: parsedUrl.search,
    hash: parsedUrl.hash,
    replace(next) { navigations.push({ type: 'replace', url: String(next) }); },
    assign(next) { navigations.push({ type: 'assign', url: String(next) }); },
    reload() { navigations.push({ type: 'reload', url: location.href }); }
  };

  const history = {
    replaceState(_state, _title, nextUrl) {
      const u = new URL(nextUrl, location.origin);
      location.href = u.href;
      location.pathname = u.pathname;
      location.search = u.search;
      location.hash = u.hash;
      navigations.push({ type: 'replaceState', url: String(nextUrl) });
    }
  };

  const createdBlobs = new Map();
  let blobCounter = 1;
  class MockBlob {
    constructor(parts = [], opts = {}) {
      this._parts = parts;
      this.type = opts.type || '';
    }
    async text() {
      return this._parts.map(p => (typeof p === 'string' ? p : new TextDecoder().decode(p))).join('');
    }
    async arrayBuffer() {
      const txt = await this.text();
      return new TextEncoder().encode(txt).buffer;
    }
  }
  const PatchedURL = class extends URL {};
  PatchedURL.createObjectURL = blob => {
    const u = `blob:${parsedUrl.origin}/${blobCounter++}`;
    createdBlobs.set(u, blob);
    return u;
  };
  PatchedURL.revokeObjectURL = () => {};

  const windowObj = {
    location,
    history,
    document,
    localStorage,
    sessionStorage,
    crypto: webcrypto,
    TextEncoder,
    TextDecoder,
    URL: PatchedURL,
    URLSearchParams,
    Blob: MockBlob,
    Event: MockEvent,
    CustomEvent: MockEvent,
    atob: s => Buffer.from(s, 'base64').toString('binary'),
    btoa: s => Buffer.from(s, 'binary').toString('base64'),
    setTimeout: (fn, ms, ...args) => {
      const t = setTimeout(fn, ms, ...args);
      if (t && typeof t.unref === 'function') t.unref();
      return t;
    },
    clearTimeout,
    setInterval: (fn, ms, ...args) => {
      const t = setInterval(fn, ms, ...args);
      if (t && typeof t.unref === 'function') t.unref();
      return t;
    },
    clearInterval,
    queueMicrotask,
    console,
    navigator: {
      clipboard: {
        async writeText(t) { clipboardWrites.push(String(t)); }
      }
    },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    open(u, target) { navigations.push({ type: 'open', url: String(u), target }); },
    fetch: async (reqUrl, init) => {
      if (fetchHandler) return fetchHandler(reqUrl, init);
      return { ok: false, status: 404, async text() { return ''; }, async arrayBuffer() { return new ArrayBuffer(0); } };
    }
  };
  windowObj.window = windowObj;
  windowObj.self = windowObj;
  windowObj.globalThis = windowObj;

  if (preloadFirebase && firebaseMock) {
    windowObj.firebase = firebaseMock.firebase;
  }

  class MockDOMParser {
    parseFromString(str, type) {
      const doc = new MockDocument(false);
      const htmlOpen = String(str).match(/<html([^>]*)>/i);
      if (htmlOpen && htmlOpen[1]) {
        for (const [k, v] of Object.entries(parseSimpleAttrs(htmlOpen[1]))) {
          doc.documentElement.setAttribute(k, decodeEntities(v));
        }
      }
      const headMatch = String(str).match(/<head([^>]*)>([\s\S]*?)<\/head>/i);
      const bodyMatch = String(str).match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
      if (headMatch) {
        if (headMatch[1]) {
          for (const [k, v] of Object.entries(parseSimpleAttrs(headMatch[1]))) {
            doc.head.setAttribute(k, decodeEntities(v));
          }
        }
        parseHtmlInto(doc, doc.head, headMatch[2]);
      }
      if (bodyMatch) {
        if (bodyMatch[1]) {
          for (const [k, v] of Object.entries(parseSimpleAttrs(bodyMatch[1]))) {
            doc.body.setAttribute(k, decodeEntities(v));
          }
        }
        parseHtmlInto(doc, doc.body, bodyMatch[2]);
      }
      if (!headMatch && !bodyMatch) parseHtmlInto(doc, doc.body, str);
      return doc;
    }
  }
  windowObj.DOMParser = MockDOMParser;

  const context = vm.createContext(windowObj);

  // Parse initial HTML into document
  const htmlOpen = String(html).match(/<html([^>]*)>/i);
  if (htmlOpen && htmlOpen[1]) {
    for (const [k, v] of Object.entries(parseSimpleAttrs(htmlOpen[1]))) {
      document.documentElement.setAttribute(k, decodeEntities(v));
    }
  }
  const headMatch = String(html).match(/<head([^>]*)>([\s\S]*?)<\/head>/i);
  const bodyMatch = String(html).match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
  if (headMatch) parseHtmlInto(document, document.head, headMatch[2]);
  if (bodyMatch) parseHtmlInto(document, document.body, bodyMatch[2]);

  // Hook script execution when a <script> (or subtree containing <script>) is attached to live document
  function handleScriptAttach(node) {
    if (node.nodeType !== 1) return;
    if (node.tagName === 'SCRIPT' && !node._executed) {
      node._executed = true;
      const src = node.getAttribute('src');
      if (src) {
        loadedScripts.push(src);
        queueMicrotask(() => {
          if (src.includes('firebasejs/')) {
            if (firebaseMock && firebaseMock.failScripts) {
              if (typeof node.onerror === 'function') node.onerror(new Error('network error'));
              node.dispatchEvent(new MockEvent('error'));
              return;
            }
            if (firebaseMock && !windowObj.firebase) {
              windowObj.firebase = firebaseMock.firebase;
            }
            if (typeof node.onload === 'function') node.onload();
            node.dispatchEvent(new MockEvent('load'));
          } else {
            const rel = src.replace(/^\//, '').split('?')[0];
            const full = path.join(repoRoot, rel);
            if (fs.existsSync(full)) {
              const code = fs.readFileSync(full, 'utf8');
              vm.runInContext(code, context, { filename: full });
              if (typeof node.onload === 'function') node.onload();
              node.dispatchEvent(new MockEvent('load'));
            } else {
              if (typeof node.onerror === 'function') node.onerror(new Error('not found: ' + rel));
              node.dispatchEvent(new MockEvent('error'));
            }
          }
        });
      } else if (node.textContent && node.textContent.trim()) {
        vm.runInContext(node.textContent, context, { filename: 'inline-script.js' });
      }
      return;
    }
    for (const ch of node.children) {
      handleScriptAttach(ch);
    }
  }

  function isAttachedToLiveDoc(node) {
    let cur = node;
    while (cur) {
      if (cur === document.documentElement) return true;
      cur = cur.parentNode;
    }
    return false;
  }

  document._onNodeAttached = (node, parent) => {
    if (isAttachedToLiveDoc(parent)) {
      handleScriptAttach(node);
    }
  };
  document._onNodeReplaced = (newNode, oldNode) => {
    if (oldNode === document.head && newNode.tagName === 'HEAD') document.head = newNode;
    if (oldNode === document.body && newNode.tagName === 'BODY') document.body = newNode;
  };

  return {
    window: windowObj,
    document,
    context,
    localStorage,
    sessionStorage,
    navigations,
    clipboardWrites,
    loadedScripts,
    createdBlobs,
    runFile(relPath) {
      const full = path.isAbsolute(relPath) ? relPath : path.join(repoRoot, relPath);
      const code = fs.readFileSync(full, 'utf8');
      return vm.runInContext(code, context, { filename: full });
    },
    runScript(code, filename = 'test-script.js') {
      return vm.runInContext(code, context, { filename });
    },
    triggerDOMContentLoaded() {
      document.readyState = 'interactive';
      document.dispatchEvent(new MockEvent('DOMContentLoaded'));
      document.readyState = 'complete';
    }
  };
}

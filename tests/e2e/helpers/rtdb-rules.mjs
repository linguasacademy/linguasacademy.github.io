/**
 * Opaque-box Firebase Realtime Database rules evaluator.
 * Parses database.rules.json and evaluates .read, .write, and .validate
 * expressions with Firebase RTDB semantics (top-down .read/.write OR-inheritance,
 * recursive .validate AND-cascade on newData, $wildcard binding, and $other fallback).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export class RuleSnapshot {
  constructor(value, rootData, pathSegments = []) {
    this._value = value === undefined ? null : value;
    this._rootData = rootData;
    this._path = pathSegments;
  }

  exists() {
    return this._value !== null && this._value !== undefined;
  }

  val() {
    return this._value === undefined ? null : this._value;
  }

  isString() {
    return typeof this._value === 'string';
  }

  isNumber() {
    return typeof this._value === 'number' && Number.isFinite(this._value);
  }

  isBoolean() {
    return typeof this._value === 'boolean';
  }

  hasChildren(keys) {
    if (!this._value || typeof this._value !== 'object' || Array.isArray(this._value)) {
      return false;
    }
    if (!Array.isArray(keys)) {
      return Object.keys(this._value).length > 0;
    }
    return keys.every(k => Object.prototype.hasOwnProperty.call(this._value, k) && this._value[k] !== null && this._value[k] !== undefined);
  }

  child(childPath) {
    const parts = String(childPath).split('/').filter(Boolean);
    let cur = this._value;
    for (const p of parts) {
      if (cur && typeof cur === 'object' && Object.prototype.hasOwnProperty.call(cur, p)) {
        cur = cur[p];
      } else {
        cur = null;
        break;
      }
    }
    return new RuleSnapshot(cur, this._rootData, [...this._path, ...parts]);
  }
}

function getAtPath(obj, segments) {
  let cur = obj;
  for (const seg of segments) {
    if (cur && typeof cur === 'object' && Object.prototype.hasOwnProperty.call(cur, seg)) {
      cur = cur[seg];
    } else {
      return null;
    }
  }
  return cur === undefined ? null : cur;
}

function setAtPath(obj, segments, value) {
  const clone = obj ? structuredClone(obj) : {};
  if (segments.length === 0) return structuredClone(value);
  let cur = clone;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    if (!cur[seg] || typeof cur[seg] !== 'object') {
      cur[seg] = {};
    }
    cur = cur[seg];
  }
  const last = segments[segments.length - 1];
  if (value === null || value === undefined) {
    delete cur[last];
  } else {
    cur[last] = structuredClone(value);
  }
  return clone;
}

function resolveRuleChild(ruleNode, key, wildcards) {
  if (!ruleNode || typeof ruleNode !== 'object') return null;
  if (Object.prototype.hasOwnProperty.call(ruleNode, key) && !key.startsWith('.')) {
    return { node: ruleNode[key], wildcards };
  }
  // Find a $wildcard child (excluding $other unless no other $wildcard matches)
  let otherEntry = null;
  for (const k of Object.keys(ruleNode)) {
    if (k.startsWith('$')) {
      if (k === '$other') {
        otherEntry = k;
      } else {
        return {
          node: ruleNode[k],
          wildcards: { ...wildcards, [k]: key }
        };
      }
    }
  }
  if (otherEntry) {
    return {
      node: ruleNode[otherEntry],
      wildcards: { ...wildcards, [otherEntry]: key }
    };
  }
  return null;
}

function normalizeAuth(auth) {
  if (!auth) return null;
  if (auth.provider !== undefined) return auth;
  return { ...auth, provider: auth.isAnonymous ? 'anonymous' : 'password' };
}

function evalExpr(expr, ctx) {
  if (typeof expr === 'boolean') return expr;
  if (typeof expr !== 'string') return false;
  const trimmed = expr.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  // Support RTDB .matches(/.../flags) if used
  const sandbox = {
    auth: normalizeAuth(ctx.auth),
    root: ctx.root,
    data: ctx.data,
    newData: ctx.newData,
    now: ctx.now ?? Date.now(),
    ...ctx.wildcards
  };
  // String.matches(regex) de las reglas de RTDB: se define dentro del contexto aislado
  return Boolean(vm.runInNewContext(
    `String.prototype.matches = function (re) { return re.test(String(this)); }; (${trimmed})`,
    sandbox
  ));
}

export class RtdbRulesEvaluator {
  constructor(rulesJson) {
    this.rules = rulesJson.rules || rulesJson;
  }

  static fromFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return new RtdbRulesEvaluator(JSON.parse(raw));
  }

  static fromRepo(repoRoot) {
    return RtdbRulesEvaluator.fromFile(path.join(repoRoot, 'database.rules.json'));
  }

  canRead(targetPath, auth = null, dbData = {}) {
    const segments = String(targetPath).split('/').filter(Boolean);
    const rootSnap = new RuleSnapshot(dbData, dbData, []);
    let ruleNode = this.rules;
    let wildcards = {};

    // Check root .read first
    if (ruleNode['.read'] !== undefined) {
      const dataSnap = new RuleSnapshot(dbData, dbData, []);
      if (evalExpr(ruleNode['.read'], { auth, root: rootSnap, data: dataSnap, newData: dataSnap, wildcards })) {
        return { allowed: true, reason: 'root .read granted' };
      }
    }

    for (let i = 0; i < segments.length; i++) {
      const resolved = resolveRuleChild(ruleNode, segments[i], wildcards);
      if (!resolved) break;
      ruleNode = resolved.node;
      wildcards = resolved.wildcards;

      if (ruleNode['.read'] !== undefined) {
        const subPath = segments.slice(0, i + 1);
        const dataSnap = new RuleSnapshot(getAtPath(dbData, subPath), dbData, subPath);
        if (evalExpr(ruleNode['.read'], { auth, root: rootSnap, data: dataSnap, newData: dataSnap, wildcards })) {
          return { allowed: true, reason: `.read granted at /${subPath.join('/')}` };
        }
      }
    }

    return { allowed: false, reason: `PERMISSION_DENIED: read at /${segments.join('/')}` };
  }

  canWrite(targetPath, newValue, auth = null, dbData = {}) {
    const segments = String(targetPath).split('/').filter(Boolean);
    const rootSnap = new RuleSnapshot(dbData, dbData, []);
    const newRootData = setAtPath(dbData, segments, newValue);

    let ruleNode = this.rules;
    let wildcards = {};
    let writeAllowed = false;
    const ruleChain = [{ node: ruleNode, path: [], wildcards: { ...wildcards } }];

    // Check root .write
    if (ruleNode['.write'] !== undefined) {
      const dataSnap = new RuleSnapshot(dbData, dbData, []);
      const newDataSnap = new RuleSnapshot(newRootData, newRootData, []);
      if (evalExpr(ruleNode['.write'], { auth, root: rootSnap, data: dataSnap, newData: newDataSnap, wildcards })) {
        writeAllowed = true;
      }
    }

    for (let i = 0; i < segments.length; i++) {
      const resolved = resolveRuleChild(ruleNode, segments[i], wildcards);
      if (!resolved) {
        ruleNode = null;
        break;
      }
      ruleNode = resolved.node;
      wildcards = resolved.wildcards;
      const subPath = segments.slice(0, i + 1);
      ruleChain.push({ node: ruleNode, path: subPath, wildcards: { ...wildcards } });

      if (!writeAllowed && ruleNode['.write'] !== undefined) {
        const dataSnap = new RuleSnapshot(getAtPath(dbData, subPath), dbData, subPath);
        const newDataSnap = new RuleSnapshot(getAtPath(newRootData, subPath), newRootData, subPath);
        if (evalExpr(ruleNode['.write'], { auth, root: rootSnap, data: dataSnap, newData: newDataSnap, wildcards })) {
          writeAllowed = true;
        }
      }
    }

    if (!writeAllowed) {
      return { allowed: false, reason: `PERMISSION_DENIED: no .write rule granted access at /${segments.join('/')}` };
    }

    // Deleting (newValue === null) skips .validate on the deleted node itself,
    // but still validates any existing ancestor nodes in ruleChain.
    if (newValue === null || newValue === undefined) {
      for (const entry of ruleChain.slice(0, -1)) {
        if (entry.node && entry.node['.validate'] !== undefined) {
          const afterVal = getAtPath(newRootData, entry.path);
          if (afterVal !== null && afterVal !== undefined) {
            const dataSnap = new RuleSnapshot(getAtPath(dbData, entry.path), dbData, entry.path);
            const newDataSnap = new RuleSnapshot(afterVal, newRootData, entry.path);
            const ok = evalExpr(entry.node['.validate'], {
              auth,
              root: rootSnap,
              data: dataSnap,
              newData: newDataSnap,
              wildcards: entry.wildcards
            });
            if (!ok) {
              return {
                allowed: false,
                reason: `PERMISSION_DENIED: ancestor .validate failed on delete at /${entry.path.join('/')} (${entry.node['.validate']})`
              };
            }
          }
        }
      }
      return { allowed: true, reason: 'delete allowed' };
    }

    // Validate all ancestor + target .validate rules
    for (const entry of ruleChain) {
      if (entry.node && entry.node['.validate'] !== undefined) {
        const dataSnap = new RuleSnapshot(getAtPath(dbData, entry.path), dbData, entry.path);
        const newDataSnap = new RuleSnapshot(getAtPath(newRootData, entry.path), newRootData, entry.path);
        const ok = evalExpr(entry.node['.validate'], {
          auth,
          root: rootSnap,
          data: dataSnap,
          newData: newDataSnap,
          wildcards: entry.wildcards
        });
        if (!ok) {
          return {
            allowed: false,
            reason: `PERMISSION_DENIED: .validate failed at /${entry.path.join('/')} (${entry.node['.validate']})`
          };
        }
      }
    }

    // Recursively validate children of the written value against descendant rules (including $other)
    if (ruleNode) {
      const childCheck = this._validateDescendants(ruleNode, segments, newValue, getAtPath(dbData, segments), auth, rootSnap, newRootData, wildcards);
      if (!childCheck.allowed) {
        return childCheck;
      }
    }

    return { allowed: true, reason: 'write and validate passed' };
  }

  _validateDescendants(ruleNode, currentPath, newVal, oldVal, auth, rootSnap, newRootData, wildcards) {
    if (!newVal || typeof newVal !== 'object' || Array.isArray(newVal)) {
      return { allowed: true };
    }
    for (const key of Object.keys(newVal)) {
      const childVal = newVal[key];
      if (childVal === null || childVal === undefined) continue;
      const resolved = resolveRuleChild(ruleNode, key, wildcards);
      if (!resolved) continue; // No rule defined for this child key
      const childRule = resolved.node;
      const childWildcards = resolved.wildcards;
      const childPath = [...currentPath, key];
      const oldChildVal = (oldVal && typeof oldVal === 'object') ? oldVal[key] ?? null : null;

      if (childRule['.validate'] !== undefined) {
        const dataSnap = new RuleSnapshot(oldChildVal, rootSnap._rootData, childPath);
        const newDataSnap = new RuleSnapshot(childVal, newRootData, childPath);
        const ok = evalExpr(childRule['.validate'], {
          auth,
          root: rootSnap,
          data: dataSnap,
          newData: newDataSnap,
          wildcards: childWildcards
        });
        if (!ok) {
          return {
            allowed: false,
            reason: `PERMISSION_DENIED: descendant .validate failed at /${childPath.join('/')} (${childRule['.validate']})`
          };
        }
      }

      const nested = this._validateDescendants(childRule, childPath, childVal, oldChildVal, auth, rootSnap, newRootData, childWildcards);
      if (!nested.allowed) return nested;
    }
    return { allowed: true };
  }
}

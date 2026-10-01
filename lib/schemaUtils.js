/**
 * Game-agnostic helpers for working with a game-type schema.
 *
 * A schema is: { sharedFields: <field tree>, playerFields: <field tree> }
 * A field tree node is either:
 *   - a field def: { type, playerEditable, default, label? }
 *   - a group: a plain object whose keys are more field-tree nodes
 *
 * State shape produced/consumed here: { shared: {...}, players: { p1: {...}, p2: {...} } }
 * Paths are dot-strings like "shared.round" or "players.p1.tactic1.progress".
 *
 * UMD wrapper: works via require() on the server and as a <script> tag in the browser.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SchemaUtils = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  function isFieldDef(node) {
    return !!node && typeof node === 'object' && typeof node.type === 'string';
  }

  function buildFromFieldTree(node) {
    if (isFieldDef(node)) {
      return Array.isArray(node.default) ? node.default.slice() : node.default;
    }
    const out = {};
    Object.keys(node).forEach((key) => {
      out[key] = buildFromFieldTree(node[key]);
    });
    return out;
  }

  function buildDefaultState(schema) {
    return {
      shared: buildFromFieldTree(schema.sharedFields),
      players: {
        p1: buildFromFieldTree(schema.playerFields),
        p2: buildFromFieldTree(schema.playerFields),
      },
    };
  }

  // Resolves a full state path ("shared.round" / "players.p1.tactic1.progress")
  // to its field def in the schema. Returns null if the path doesn't exist.
  function getFieldDef(schema, path) {
    const parts = path.split('.');
    const root = parts.shift();
    let node;
    if (root === 'shared') {
      node = schema.sharedFields;
    } else if (root === 'players') {
      parts.shift(); // consume the "p1"/"p2" slot segment - both players share playerFields
      node = schema.playerFields;
    } else {
      return null;
    }
    for (let i = 0; i < parts.length; i++) {
      if (!node || typeof node !== 'object') return null;
      node = node[parts[i]];
    }
    return isFieldDef(node) ? node : null;
  }

  // Lists every leaf field as { path, def }, walking a field tree under a given path prefix.
  // Used to drive form generation (e.g. listFieldPaths(schema.playerFields, 'players.p1')).
  function listFieldPaths(node, prefix) {
    if (isFieldDef(node)) {
      return [{ path: prefix, def: node }];
    }
    let results = [];
    Object.keys(node).forEach((key) => {
      const childPrefix = prefix ? `${prefix}.${key}` : key;
      results = results.concat(listFieldPaths(node[key], childPrefix));
    });
    return results;
  }

  function validateValue(fieldDef, value) {
    const type = fieldDef.type;
    if (type === 'string') return String(value);
    if (type === 'number') {
      const n = Number(value);
      if (Number.isNaN(n)) throw new Error('Invalid number value');
      return n;
    }
    if (type === 'bool') return Boolean(value);
    if (type === 'enum') {
      if (!Array.isArray(fieldDef.values) || fieldDef.values.indexOf(value) === -1) {
        throw new Error('Invalid enum value');
      }
      return value;
    }
    const boolArrayMatch = /^bool\[(\d+)\]$/.exec(type);
    if (boolArrayMatch) {
      const len = Number(boolArrayMatch[1]);
      if (!Array.isArray(value) || value.length !== len) {
        throw new Error('Invalid bool array value');
      }
      return value.map(Boolean);
    }
    throw new Error('Unknown field type: ' + type);
  }

  function setAtPath(obj, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    let node = obj;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (node[part] == null || typeof node[part] !== 'object') node[part] = {};
      node = node[part];
    }
    node[last] = value;
  }

  function getAtPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  }

  function isOwnSlotPath(path, slot) {
    return path === `players.${slot}` || path.indexOf(`players.${slot}.`) === 0;
  }

  function fieldLabel(path, def) {
    if (def && def.label) return def.label;
    const last = path.split('.').pop();
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/([A-Z])/g, ' $1');
  }

  return {
    buildDefaultState,
    getFieldDef,
    listFieldPaths,
    validateValue,
    setAtPath,
    getAtPath,
    isOwnSlotPath,
    fieldLabel,
  };
}));

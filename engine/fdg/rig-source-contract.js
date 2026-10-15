import { RIG_LIMITS } from './rig-project.js';

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fields = Object.freeze(['id', 'src', 'width', 'height', 'sha256']);
const localSource = value => {
  if (typeof value !== 'string' || !value.length || value.length > 2048
    || /[\x00-\x20\x7f\\]/.test(value) || value.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(value)) return false;
  try {
    const path = decodeURIComponent(value.split(/[?#]/, 1)[0]);
    return path.length > 0 && !path.includes('\\') && !path.split('/').some(part => part === '.' || part === '..');
  } catch { return false; }
};

export class RigSourceContractError extends TypeError {
  constructor(errors) {
    super(`Rig source contract: ${errors.join('; ')}`);
    this.name = 'RigSourceContractError';
    this.errors = [...errors];
  }
}

/** Declared identity only: no image decode, byte hashing, approval or texture replacement. */
export function rigSourceIdentity(rig) {
  const texture = rig?.materials?.[0]?.texture, provenance = rig?.provenance;
  return Object.freeze({
    id: provenance?.sourceId ?? provenance?.source ?? texture?.src ?? null,
    src: texture?.src ?? null,
    width: texture?.width ?? null,
    height: texture?.height ?? null,
    sha256: provenance?.sourceSha256 ?? null,
  });
}

/** Copy the selected manifest before asynchronous loading and compare all five fields exactly. */
export function createRigSourceContract(expectedSource) {
  const errors = [];
  if (!record(expectedSource)) throw new RigSourceContractError(['expectedSource must be an object.']);
  const selected = Object.fromEntries(fields.map(field => [field, expectedSource[field]]));
  if (typeof selected.id !== 'string' || !selected.id.trim().length || selected.id.length > 2048
    || /[\x00-\x1f\x7f]/.test(selected.id)) errors.push('id must be a nonempty source identifier (up to 2048 characters).');
  if (!localSource(selected.src)) errors.push('src must be an exact local asset path without traversal.');
  for (const field of ['width', 'height']) {
    if (!Number.isInteger(selected[field]) || selected[field] < 1 || selected[field] > RIG_LIMITS.textureDimension) {
      errors.push(`${field} must be an integer in 1..${RIG_LIMITS.textureDimension}.`);
    }
  }
  if (typeof selected.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(selected.sha256)) errors.push('sha256 must contain 64 lowercase hex characters.');
  if (errors.length) throw new RigSourceContractError(errors);
  const expected = Object.freeze(selected);
  return Object.freeze({
    expected,
    validate(rig) {
      const actual = rigSourceIdentity(rig), mismatches = [];
      for (const field of fields) {
        if (actual[field] !== expected[field]) mismatches.push(`${field}: expected ${String(expected[field])}, received ${String(actual[field])}.`);
      }
      const provenance = rig?.provenance;
      if (provenance?.source !== undefined && provenance.source !== actual.src) mismatches.push('provenance.source differs from the selected material texture src.');
      if (provenance?.sourceSize !== undefined && (!Array.isArray(provenance.sourceSize)
        || provenance.sourceSize.length !== 2 || provenance.sourceSize[0] !== actual.width || provenance.sourceSize[1] !== actual.height)) {
        mismatches.push('provenance.sourceSize differs from the selected material texture dimensions.');
      }
      if (mismatches.length) throw new RigSourceContractError(mismatches);
      return actual;
    },
  });
}

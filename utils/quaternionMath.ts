import { Quaternion } from '../types';

// Modular arithmetic helper
export const mod = (n: number, m: number): number => {
  return ((n % m) + m) % m;
};

// Modular inverse using extended Euclidean algorithm
export const modInverse = (a: number, m: number): number => {
  let [old_r, r] = [a, m];
  let [old_s, s] = [1, 0];
  let [old_t, t] = [0, 1];

  while (r !== 0) {
    const quotient = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
    [old_t, t] = [t, old_t - quotient * t];
  }

  return mod(old_s, m);
};

export const createQuaternion = (w: number, x: number, y: number, z: number): Quaternion => ({ w, x, y, z });

export const addQ = (q1: Quaternion, q2: Quaternion, modulus?: number): Quaternion => {
  if (modulus) {
    return {
      w: mod(q1.w + q2.w, modulus),
      x: mod(q1.x + q2.x, modulus),
      y: mod(q1.y + q2.y, modulus),
      z: mod(q1.z + q2.z, modulus),
    };
  }
  return {
    w: q1.w + q2.w,
    x: q1.x + q2.x,
    y: q1.y + q2.y,
    z: q1.z + q2.z,
  };
};

export const mulQ = (q1: Quaternion, q2: Quaternion, modulus?: number): Quaternion => {
  // Hamilton product
  // w = w1w2 - x1x2 - y1y2 - z1z2
  // x = w1x2 + x1w2 + y1z2 - z1y2
  // y = w1y2 - x1z2 + y1w2 + z1x2
  // z = w1z2 + x1y2 - y1x2 + z1w2
  
  const w = q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z;
  const x = q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y;
  const y = q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x;
  const z = q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w;

  if (modulus) {
    return {
      w: mod(w, modulus),
      x: mod(x, modulus),
      y: mod(y, modulus),
      z: mod(z, modulus),
    };
  }
  return { w, x, y, z };
};

export const conjugateQ = (q: Quaternion, modulus?: number): Quaternion => {
  if (modulus) {
    return {
      w: mod(q.w, modulus),
      x: mod(-q.x, modulus),
      y: mod(-q.y, modulus),
      z: mod(-q.z, modulus),
    };
  }
  return { w: q.w, x: -q.x, y: -q.y, z: -q.z };
};

export const normSqQ = (q: Quaternion, modulus?: number): number => {
  const val = q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z;
  return modulus ? mod(val, modulus) : val;
};

export const invQ = (q: Quaternion, modulus?: number): Quaternion | null => {
  const nSq = normSqQ(q, modulus);
  if (nSq === 0) return null; // Non-invertible

  if (modulus) {
    // In Modular arithmetic: q^-1 = conjugate(q) * (normSq)^-1
    // We need to find modular inverse of nSq
    try {
      const nSqInv = modInverse(nSq, modulus); // This might fail if gcd(nSq, modulus) != 1
      const conj = conjugateQ(q, modulus);
      // Multiply scalar nSqInv by each component
      return {
        w: mod(conj.w * nSqInv, modulus),
        x: mod(conj.x * nSqInv, modulus),
        y: mod(conj.y * nSqInv, modulus),
        z: mod(conj.z * nSqInv, modulus),
      };
    } catch (e) {
      return null;
    }
  } else {
    const conj = conjugateQ(q);
    return {
      w: conj.w / nSq,
      x: conj.x / nSq,
      y: conj.y / nSq,
      z: conj.z / nSq,
    };
  }
};

export const randomQuaternion = (max: number): Quaternion => ({
  w: Math.floor(Math.random() * max),
  x: Math.floor(Math.random() * max),
  y: Math.floor(Math.random() * max),
  z: Math.floor(Math.random() * max),
});

export const formatQ = (q: Quaternion): string => {
  return `[${q.w.toFixed(0)}, ${q.x.toFixed(0)}i, ${q.y.toFixed(0)}j, ${q.z.toFixed(0)}k]`;
};

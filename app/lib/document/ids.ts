import { customAlphabet } from "nanoid";

// ~309 thousand years or 2T IDs needed, in order to have a 1% probability of at least one collision.

const alphabet = "abcdefghijklmnopqrstuvwxyz-1234567890ABCDEFGHIJKLMNOPQRSTUV";
const nanoid = customAlphabet(alphabet, 15);

export type Id = string & {
  readonly __brand: "Id";
  readonly __length: 15;
  readonly __alphabet: "abcdefghijklmnopqrstuvwxyz-1234567890ABCDEFGHIJKLMNOPQRSTUV";
};

export const generateId = (): Id => nanoid() as Id;

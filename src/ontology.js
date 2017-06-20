import UUID from './uuid';
import Key from './key';

export const invalidate = new Key(new UUID());

export const nameKey = new Key(new UUID());

export const transaction = new Key(new UUID());

export const transactionTime = new Key(new UUID());

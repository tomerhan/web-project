import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in .env.local');
}

export function signToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET as string);
}

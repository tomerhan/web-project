import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../utils/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { name, email, institution, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || undefined);
    const users = db.collection('users');

    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email,
      institution: institution || null,
      password: hashed,
      role: 'student',
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);
    const created = { ...newUser, _id: result.insertedId };
    const token = signToken({ sub: created._id.toString(), email: created.email });

    const safeUser = { ...created } as any;
    delete safeUser.password;

    return res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

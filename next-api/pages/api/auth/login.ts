import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../utils/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || undefined);
    const users = db.collection('users');

    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const safeUser = { ...user } as any;
    delete safeUser.password;
    const token = signToken({ sub: user._id.toString(), email: user.email });

    return res.status(200).json({ user: safeUser, token });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/* Simple Express API server for auth (MongoDB) */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const clientPromise = require('./lib/mongodb');

dotenv.config();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'please_change_me';
const HAS_MONGO = Boolean(process.env.MONGODB_URI);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, mongoConfigured: HAS_MONGO });
});

function mongoConfigured(res) {
  if (HAS_MONGO) return true;
  res.status(503).json({ error: 'MongoDB is not configured yet' });
  return false;
}

app.post('/auth/register', async (req, res) => {
  const { name, email, institution, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (!mongoConfigured(res)) return;

  try {
    const client = await clientPromise();
    const db = client.db(process.env.MONGODB_DB || undefined);
    const users = db.collection('users');

    const existing = await users.findOne({ email });
    if (existing) return res.status(409).json({ error: 'User exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = { name, email, institution: institution || null, password: hashed, role: 'student', createdAt: new Date() };
    const result = await users.insertOne(newUser);
    const created = { ...newUser, _id: result.insertedId };
    const token = jwt.sign({ sub: created._id.toString(), email: created.email }, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = { ...created };
    delete safeUser.password;
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error('register', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (!mongoConfigured(res)) return;

  try {
    const client = await clientPromise();
    const db = client.db(process.env.MONGODB_DB || undefined);
    const users = db.collection('users');
    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const safeUser = { ...user };
    delete safeUser.password;
    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('login', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// ensure unique index on users.email
async function ensureIndexes() {
  if (!HAS_MONGO) {
    console.log('Skipping index creation because MONGODB_URI is not configured');
    return;
  }

  try {
    const client = await clientPromise();
    const db = client.db(process.env.MONGODB_DB || undefined);
    const users = db.collection('users');
    await users.createIndex({ email: 1 }, { unique: true });
    console.log('Index ensured: users.email (unique)');
  } catch (err) {
    console.error('ensureIndexes', err);
  }
}

app.listen(PORT, async () => {
  console.log(`API server running on http://localhost:${PORT}`);
  await ensureIndexes();
});

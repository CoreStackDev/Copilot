import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-change-in-production';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, role } = req.body as {
    name?: string;
    email?: string;
    role?: string;
  };

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const [firstName, ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ') || '';

  const payload = {
    sub: email.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    given_name: firstName,
    family_name: lastName,
    role: role || 'Employee',
    iss: 'https://sso-copilot-demo.vercel.app',
    aud: 'sso-copilot-app',
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
  return res.status(200).json({ token });
}

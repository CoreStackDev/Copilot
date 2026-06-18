import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-change-in-production';

const COPILOT_TOKEN_ENDPOINT =
  process.env.COPILOT_TOKEN_ENDPOINT ||
  'https://defaultf20abba84f784e78aa1652b987f3b2.8f.environment.api.powerplatform.com/copilotstudio/dataverse-backed/unauthenticated/bots/cr084_SSOAssistant/directline/token?api-version=2022-03-01-preview';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate the SSO token from the request body
  const { ssoToken } = req.body as { ssoToken?: string };
  if (!ssoToken) {
    return res.status(401).json({ error: 'No SSO token provided' });
  }

  let userClaims: jwt.JwtPayload;
  try {
    userClaims = jwt.verify(ssoToken, JWT_SECRET) as jwt.JwtPayload;
  } catch {
    return res.status(401).json({ error: 'Invalid or expired SSO token' });
  }

  // Exchange for a Copilot Direct Line token
  try {
    const copilotRes = await fetch(COPILOT_TOKEN_ENDPOINT, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!copilotRes.ok) {
      const text = await copilotRes.text();
      console.error('Copilot token endpoint error:', copilotRes.status, text);
      return res.status(502).json({ error: 'Failed to obtain Copilot token' });
    }

    const { token, conversationId } = await copilotRes.json() as {
      token: string;
      conversationId?: string;
    };

    // Return DL token + user context to the client
    return res.status(200).json({
      directLineToken: token,
      conversationId,
      userContext: {
        userName: userClaims.name as string,
        userEmail: userClaims.email as string,
        userId: userClaims.sub as string,
        userRole: userClaims.role as string,
        firstName: userClaims.given_name as string,
        lastName: userClaims.family_name as string,
      },
    });
  } catch (err) {
    console.error('Copilot token fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

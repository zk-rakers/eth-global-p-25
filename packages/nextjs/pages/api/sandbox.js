import { Sandbox } from '@e2b/code-interpreter';
import { MistralClient } from '@mistralai/mistralai';

const client = new MistralClient(process.env.MISTRAL_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const sandbox = await Sandbox.create({
      apiKey: process.env.E2B_API_KEY
    });

    try {
      const result = await sandbox.runCode(code);
      return res.status(200).json({ 
        stdout: result.stdout,
        stderr: result.stderr
      });
    } finally {
      await sandbox.close();
    }
  } catch (error) {
    console.error('Sandbox error:', error);
    return res.status(500).json({ error: error.message });
  }
} 
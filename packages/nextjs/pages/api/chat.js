import { Mistral } from '@mistralai/mistralai';
import { Sandbox } from '@e2b/code-interpreter';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing or invalid messages array' });
    }

    const client = new Mistral(process.env.MISTRAL_API_KEY);
	console.log(process.env.MISTRAL_API_KEY);
    const model = 'mistral-large-latest';

    const tools = [
      {
        type: 'function',
        function: {
          name: 'execute_python',
          description: 'Execute python code in a Jupyter notebook cell and return result',
          parameters: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'The python code to execute in a single cell',
              },
            },
            required: ['code'],
          },
        },
      },
    ];

    let response;
    try {
      response = await client.chat.complete({
        model,
        messages,
        tools,
      });
    } catch (mistralError) {
      console.error('🔴 Mistral API call failed:', mistralError.message);
      return res.status(500).json({ error: 'Mistral API call failed' });
    }

    if (!response.choices || !response.choices[0]?.message) {
      return res.status(500).json({ error: 'No response from model' });
    }

    const responseMessage = response.choices[0].message;
    let finalContent = responseMessage.content || '';

    if (responseMessage.tool_calls) {
      const updatedMessages = [...messages, responseMessage];

      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.function.name === 'execute_python') {
          let sandbox;
          try {
            sandbox = await Sandbox.create({
              apiKey: process.env.E2B_API_KEY,
            });

            const code = JSON.parse(toolCall.function.arguments).code;
            const execution = await sandbox.runCode(code);
            const result = execution.stdout;

            updatedMessages.push({
              role: 'tool',
              name: 'execute_python',
              content: result,
              tool_call_id: toolCall.id,
            });

            const finalResponse = await client.chat.complete({
              model,
              messages: updatedMessages,
            });

            if (finalResponse.choices && finalResponse.choices[0]?.message?.content) {
              finalContent = finalResponse.choices[0].message.content;
            }
          } catch (e2bError) {
            console.error('🔴 E2B sandbox error:', e2bError.message);
            return res.status(500).json({ error: 'Failed to execute tool call in sandbox' });
          } finally {
            if (sandbox) await sandbox.close();
          }
        }
      }
    }

    return res.status(200).json({ content: finalContent });
  } catch (error) {
    console.error('🔴 Chat handler error:', error.message);
    console.error('🔴 Stack:', error.stack);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

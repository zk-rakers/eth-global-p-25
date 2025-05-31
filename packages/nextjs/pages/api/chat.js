import { Mistral } from '@mistralai/mistralai';
import { Sandbox } from '@e2b/code-interpreter';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    // Create Mistral client
    const client = new Mistral(process.env.MISTRAL_API_KEY);
    const model = "mistral-large-latest";

    // Define the tools
    const tools = [{
      "type": "function",
      "function": {
        "name": "execute_python",
        "description": "Execute python code in a Jupyter notebook cell and return result",
        "parameters": {
          "type": "object",
          "properties": {
            "code": {
              "type": "string",
              "description": "The python code to execute in a single cell"
            }
          },
          "required": ["code"]
        }
      }
    }];

    // Send the prompt to the model
    const response = await client.chat.complete({
      model: model,
      messages: messages,
      tools: tools
    });

    // Get the response message
    const responseMessage = response.choices[0].message;
    let finalContent = responseMessage.content || '';

    // Execute the tool if it's called by the model
    if (responseMessage.tool_calls) {
      const updatedMessages = [...messages, responseMessage];

      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.function.name === "execute_python") {
          // Create a sandbox and execute the code
          const sandbox = await Sandbox.create({
            apiKey: process.env.E2B_API_KEY
          });

          try {
            const code = JSON.parse(toolCall.function.arguments).code;
            const execution = await sandbox.runCode(code);
            const result = execution.stdout;

            // Send the result back to the model
            updatedMessages.push({
              role: "tool",
              name: "execute_python",
              content: result,
              tool_call_id: toolCall.id,
            });

            // Generate the final response
            const finalResponse = await client.chat.complete({
              model: model,
              messages: updatedMessages,
            });

            finalContent = finalResponse.choices[0].message.content;
          } finally {
            await sandbox.close();
          }
        }
      }
    }

    return res.status(200).json({ content: finalContent });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error.message });
  }
} 
import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const assertApiKey = () => {
  if (!ENV.qwenApiKey && !ENV.anthropicApiKey) {
    throw new Error("No AI API key configured. Set QWEN_API_KEY in your .env file.");
  }
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

// ─── Qwen via OpenAI-compatible API ──────────────────────────────────────────
async function invokeQwen(params: InvokeParams): Promise<InvokeResult> {
  const { messages, maxTokens, max_tokens } = params;

  // Qwen accepts standard OpenAI message format (system role is fine)
  const normalised = messages.map(m => ({
    role: m.role as string,
    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
  }));

  const body = {
    model: "qwen-plus",          // Qwen 3.5 Plus — change to "qwen-max" for highest quality
    max_tokens: maxTokens || max_tokens || 1024,
    messages: normalised,
  };

  const response = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${ENV.qwenApiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Qwen API error: ${response.status} ${response.statusText} – ${errorText}`);
  }

  const data = await response.json() as {
    id: string;
    model: string;
    choices: Array<{ index: number; message: { role: string; content: string }; finish_reason: string }>;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  };

  const fullText = data.choices[0]?.message?.content ?? "";

  return {
    id: data.id,
    created: Math.floor(Date.now() / 1000),
    model: data.model,
    // Provide content[] for any code that reads it the Anthropic way
    content: [{ type: "text", text: fullText }],
    choices: data.choices.map(c => ({
      index: c.index,
      message: { role: "assistant" as const, content: c.message.content },
      finish_reason: c.finish_reason,
    })),
    usage: data.usage,
  } as unknown as InvokeResult;
}

// ─── Anthropic fallback (used only if QWEN_API_KEY is not set) ───────────────
async function invokeAnthropic(params: InvokeParams): Promise<InvokeResult> {
  const { messages, maxTokens, max_tokens } = params;

  const systemMsg = messages.find(m => m.role === "system");
  const system = systemMsg
    ? (typeof systemMsg.content === "string" ? systemMsg.content : JSON.stringify(systemMsg.content))
    : undefined;

  const filtered = messages
    .filter(m => m.role === "user" || m.role === "assistant")
    .map(m => ({
      role: m.role as "user" | "assistant",
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    }));

  const body: Record<string, unknown> = {
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens || max_tokens || 1024,
    messages: filtered,
  };
  if (system) body.system = system;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ENV.anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText} – ${errorText}`);
  }

  const data = await response.json() as {
    id: string; model: string;
    content: Array<{ type: string; text: string }>;
    usage?: { input_tokens: number; output_tokens: number };
  };

  const fullText = data.content.filter(c => c.type === "text").map(c => c.text).join("");

  return {
    id: data.id,
    created: Math.floor(Date.now() / 1000),
    model: data.model,
    content: data.content,
    choices: [{
      index: 0,
      message: { role: "assistant" as const, content: fullText },
      finish_reason: "stop",
    }],
    usage: data.usage ? {
      prompt_tokens: data.usage.input_tokens,
      completion_tokens: data.usage.output_tokens,
      total_tokens: data.usage.input_tokens + data.usage.output_tokens,
    } : undefined,
  } as unknown as InvokeResult;
}

// ─── Public entry point — prefers Qwen, falls back to Anthropic ──────────────
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();
  if (ENV.qwenApiKey) return invokeQwen(params);
  return invokeAnthropic(params);
}

// ─── Streaming entry point — returns a ReadableStream of SSE chunks ─────────
export async function invokeLLMStream(
  params: Pick<InvokeParams, "messages" | "maxTokens">,
): Promise<ReadableStream<Uint8Array>> {
  assertApiKey();
  if (ENV.qwenApiKey) return streamQwen(params);
  return streamAnthropic(params);
}

async function streamQwen(
  params: Pick<InvokeParams, "messages" | "maxTokens">,
): Promise<ReadableStream<Uint8Array>> {
  const normalised = params.messages.map(m => ({
    role: m.role as string,
    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
  }));

  const response = await fetch(
    "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ENV.qwenApiKey}`,
      },
      body: JSON.stringify({
        model: "qwen-plus",
        max_tokens: params.maxTokens || 1024,
        messages: normalised,
        stream: true,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Qwen stream error: ${response.status} – ${errorText}`);
  }

  return response.body as ReadableStream<Uint8Array>;
}

async function streamAnthropic(
  params: Pick<InvokeParams, "messages" | "maxTokens">,
): Promise<ReadableStream<Uint8Array>> {
  const systemMsg = params.messages.find(m => m.role === "system");
  const system = systemMsg
    ? (typeof systemMsg.content === "string" ? systemMsg.content : JSON.stringify(systemMsg.content))
    : undefined;

  const filtered = params.messages
    .filter(m => m.role === "user" || m.role === "assistant")
    .map(m => ({
      role: m.role as "user" | "assistant",
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    }));

  const body: Record<string, unknown> = {
    model: "claude-haiku-4-5-20251001",
    max_tokens: params.maxTokens || 1024,
    messages: filtered,
    stream: true,
  };
  if (system) body.system = system;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ENV.anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic stream error: ${response.status} – ${errorText}`);
  }

  return response.body as ReadableStream<Uint8Array>;
}

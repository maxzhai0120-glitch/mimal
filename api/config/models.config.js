export const modelConfigs = {
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    apiKeyEnv: 'OPENAI_API_KEY',
    maxTokens: 4096,
    temperature: 0.7,
    supportsJsonMode: true,
  },
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    apiKeyEnv: 'OPENAI_API_KEY',
    maxTokens: 4096,
    temperature: 0.7,
    supportsJsonMode: true,
  },
  'claude-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    maxTokens: 4096,
    temperature: 0.7,
    supportsJsonMode: false,
  },
};

export function getAvailableModels() {
  return Object.entries(modelConfigs)
    .filter(([_, config]) => process.env[config.apiKeyEnv])
    .map(([id, config]) => ({
      id,
      name: id === 'gpt-4o-mini' ? 'GPT-4o Mini' : id === 'gpt-4o' ? 'GPT-4o' : 'Claude 3.5 Sonnet',
      provider: config.provider,
    }));
}

export function getModelConfig(modelId) {
  const config = modelConfigs[modelId];
  if (!config) throw new Error(`Unknown model: ${modelId}`);
  if (!process.env[config.apiKeyEnv]) throw new Error(`API key not configured for ${modelId}`);
  return config;
}

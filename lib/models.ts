/**
 * Model configuration loader from public/models.json
 * No database required - pure JSON-based configuration
 */

export type AIModel = {
  id: string;
  name: string;
  endpoint: string;
  modelName: string;
  description: string;
  active: boolean;
};

const DEFAULT_MODELS: AIModel[] = [
  {
    id: "ielts-scorer-v1",
    name: "IELTS Scorer v1",
    endpoint: "http://127.0.0.1:1234/api/v1/chat",
    modelName: "qwen2.5-omni-7b",
    description: "Default local LM Studio IELTS speaking scorer",
    active: true,
  },
];

/**
 * Fetch all models from public/models.json
 */
export async function loadModels(): Promise<AIModel[]> {
  try {
    const response = await fetch("/models.json", {
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("Failed to load models.json, using defaults");
      return DEFAULT_MODELS;
    }

    const data = await response.json();
    const models = data.models as AIModel[];

    if (!Array.isArray(models) || models.length === 0) {
      console.warn("No models found in models.json, using defaults");
      return DEFAULT_MODELS;
    }

    return models;
  } catch (error) {
    console.error("Error loading models:", error);
    return DEFAULT_MODELS;
  }
}

/**
 * Get the currently active model
 */
export async function getActiveModel(): Promise<AIModel> {
  const models = await loadModels();
  return models.find((m) => m.active) || models[0] || DEFAULT_MODELS[0];
}

/**
 * Get all available models
 */
export async function getAllModels(): Promise<AIModel[]> {
  return loadModels();
}

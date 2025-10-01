import { AIProvider, PromptType, AIModel } from '../types';

export interface AIResponse {
  text: string;
  model: string;
  tokensUsed?: number;
  provider: AIProvider;
}

// Промпт шаблоны для разных типов улучшения
export const promptTemplates = {
  civitai: {
    ru: `Ты - эксперт по генерации изображений в Stable Diffusion и Civitai. 
Улучши этот промпт для создания изображения, сделай его более детальным и специфичным:

Оригинальный промпт: "{prompt}"

Улучшенный промпт должен:
1. Быть на английском языке
2. Включать детали о стиле, освещении, композиции
3. Содержать технические параметры (разрешение, качество)
4. Учитывать лучшие практики Stable Diffusion

Верни только улучшенный промпт без дополнительных объяснений.`,
    
    en: `You are an expert in Stable Diffusion and Civitai image generation.
Improve this prompt to create better images, make it more detailed and specific:

Original prompt: "{prompt}"

The improved prompt should:
1. Be in English
2. Include details about style, lighting, composition
3. Contain technical parameters (resolution, quality)
4. Follow Stable Diffusion best practices

Return only the improved prompt without additional explanations.`
  },

  universal: {
    ru: `Улучши этот промпт, сделав его более четким, детальным и эффективным для любой ИИ модели:

Оригинальный промпт: "{prompt}"

Улучшенный промпт должен:
1. Быть более конкретным и четким
2. Содержать контекст и примеры
3. Включать инструкции по формату ответа
4. Быть универсальным для разных задач

Верни только улучшенный промпт.`,

    en: `Improve this prompt to make it clearer, more detailed and effective for any AI model:

Original prompt: "{prompt}"

The improved prompt should:
1. Be more specific and clear
2. Contain context and examples
3. Include response format instructions
4. Be universal for different tasks

Return only the improved prompt.`
  },

  textual: {
    ru: `Оптимизируй этот промпт для текстовых ИИ моделей (ChatGPT, Claude, Gemini):

Оригинальный промпт: "{prompt}"

Улучшенный промпт должен:
1. Использовать четкую структуру
2. Содержать роль для ИИ
3. Включать примеры желаемого результата
4. Быть оптимизированным для диалога

Верни только улучшенный промпт.`,

    en: `Optimize this prompt for text AI models (ChatGPT, Claude, Gemini):

Original prompt: "{prompt}"

The improved prompt should:
1. Use clear structure
2. Contain an AI role
3. Include examples of desired output
4. Be optimized for dialogue

Return only the improved prompt.`
  }
};

// Доступные модели
export const availableModels: AIModel[] = [
  // OpenRouter бесплатные модели
  {
    id: 'microsoft/wizardlm-2-8x22b',
    name: 'WizardLM-2 8x22B',
    provider: 'openrouter',
    free: true,
    contextLength: 65536,
    description: 'Мощная бесплатная модель от Microsoft'
  },
  {
    id: 'mistralai/mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B Instruct',
    provider: 'openrouter',
    free: true,
    contextLength: 32768,
    description: 'Быстрая модель Mixtral для инструкций'
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'LLaMA 3.1 8B',
    provider: 'openrouter',
    free: true,
    contextLength: 131072,
    description: 'Последняя модель LLaMA от Meta'
  },
  
  // HuggingFace бесплатные модели
  {
    id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    name: 'Mixtral 8x7B (HF)',
    provider: 'huggingface',
    free: true,
    contextLength: 32768,
    description: 'Mixtral через HuggingFace'
  },
  {
    id: 'microsoft/DialoGPT-large',
    name: 'DialoGPT Large',
    provider: 'huggingface',
    free: true,
    contextLength: 1024,
    description: 'Диалоговая модель от Microsoft'
  }
];

// OpenRouter API Client
class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
  }

  async improvePrompt(originalPrompt: string, promptType: PromptType, model: string, language: 'ru' | 'en' = 'ru'): Promise<AIResponse> {
    const template = promptTemplates[promptType][language];
    const systemPrompt = template.replace('{prompt}', originalPrompt);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ai-prompt-improver.com',
          'X-Title': 'AI Prompt Improver'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: systemPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        text: data.choices[0]?.message?.content || 'Ошибка генерации',
        model: model,
        tokensUsed: data.usage?.total_tokens,
        provider: 'openrouter'
      };
    } catch (error) {
      console.error('OpenRouter error:', error);
      throw new Error('Не удалось подключиться к OpenRouter API');
    }
  }
}

// HuggingFace API Client
class HuggingFaceClient {
  private apiKey: string;
  private baseUrl = 'https://api-inference.huggingface.co/models';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY || '';
  }

  async improvePrompt(originalPrompt: string, promptType: PromptType, model: string, language: 'ru' | 'en' = 'ru'): Promise<AIResponse> {
    const template = promptTemplates[promptType][language];
    const prompt = template.replace('{prompt}', originalPrompt);

    try {
      const response = await fetch(`${this.baseUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        text: data[0]?.generated_text || 'Ошибка генерации',
        model: model,
        provider: 'huggingface'
      };
    } catch (error) {
      console.error('HuggingFace error:', error);
      throw new Error('Не удалось подключиться к HuggingFace API');
    }
  }
}

// Poe API Client (через неофициальный API)
class PoeClient {
  private token: string;
  private baseUrl = 'https://poe.com/api';

  constructor(token?: string) {
    this.token = token || process.env.POE_TOKEN || '';
  }

  async improvePrompt(originalPrompt: string, promptType: PromptType, model: string, language: 'ru' | 'en' = 'ru'): Promise<AIResponse> {
    const template = promptTemplates[promptType][language];
    const prompt = template.replace('{prompt}', originalPrompt);

    try {
      // Примечание: Для Poe API нужен специальный клиент или библиотека
      // Здесь показан примерный интерфейс
      
      // Альтернативно можно использовать прямые запросы к моделям
      // через официальные API (OpenAI, Anthropic, Google)
      
      return {
        text: 'Poe API интеграция в разработке. Используйте OpenRouter или HuggingFace.',
        model: model,
        provider: 'poe'
      };
    } catch (error) {
      console.error('Poe error:', error);
      throw new Error('Не удалось подключиться к Poe API');
    }
  }
}

// Главный AI сервис
export class AIService {
  private openRouter: OpenRouterClient;
  private huggingFace: HuggingFaceClient;
  private poe: PoeClient;

  constructor() {
    this.openRouter = new OpenRouterClient();
    this.huggingFace = new HuggingFaceClient();
    this.poe = new PoeClient();
  }

  async improvePrompt(
    originalPrompt: string,
    provider: AIProvider,
    model: string,
    promptType: PromptType,
    language: 'ru' | 'en' = 'ru'
  ): Promise<AIResponse> {
    switch (provider) {
      case 'openrouter':
        return this.openRouter.improvePrompt(originalPrompt, promptType, model, language);
      case 'huggingface':
        return this.huggingFace.improvePrompt(originalPrompt, promptType, model, language);
      case 'poe':
        return this.poe.improvePrompt(originalPrompt, promptType, model, language);
      default:
        throw new Error(`Неподдерживаемый провайдер: ${provider}`);
    }
  }

  getAvailableModels(provider?: AIProvider): AIModel[] {
    if (provider) {
      return availableModels.filter(model => model.provider === provider);
    }
    return availableModels;
  }

  getModelById(id: string): AIModel | undefined {
    return availableModels.find(model => model.id === id);
  }
}

export const aiService = new AIService();
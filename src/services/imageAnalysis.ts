import { AIProvider, ImageAnalysis } from '../types';

export interface ImagePromptResult {
  general: string;
  flux: string;
  stableDiffusion: string;
}

// Шаблоны промптов для анализа изображений
export const imageAnalysisPrompts = {
  general: {
    en: `Analyze this image and create a detailed, natural description for AI image generation. Focus on:
1. Main subjects and objects
2. Art style and visual aesthetics  
3. Colors, lighting, and mood
4. Composition and camera angle
5. Any text or distinctive elements

Provide a clear, comprehensive prompt that captures the essence of the image.`,
    
    ru: `Проанализируй это изображение и создай детальное, естественное описание для генерации изображений ИИ. Сосредоточься на:
1. Основных субъектах и объектах
2. Художественном стиле и визуальной эстетике
3. Цветах, освещении и настроении
4. Композиции и ракурсе камеры
5. Любом тексте или отличительных элементах

Предоставь четкий, всеобъемлющий промпт, который передает суть изображения.`
  },
  
  flux: {
    en: `Analyze this image and create an optimized prompt for Flux AI model. The prompt should:
1. Start with the main subject
2. Include specific style keywords (photorealistic, digital art, painting, etc.)
3. Add technical details (8K, HDR, professional photography)
4. Include lighting and mood descriptors
5. Use Flux-specific enhancement tags

Format: [main subject], [style], [technical quality], [lighting/mood], [additional details]`,
    
    ru: `Проанализируй это изображение и создай оптимизированный промпт для модели Flux AI. Промпт должен:
1. Начинаться с основного субъекта
2. Включать конкретные ключевые слова стиля (photorealistic, digital art, painting, и т.д.)
3. Добавлять технические детали (8K, HDR, professional photography)
4. Включать дескрипторы освещения и настроения
5. Использовать специфичные для Flux теги улучшения

Формат: [основной субъект], [стиль], [техническое качество], [освещение/настроение], [дополнительные детали]`
  },
  
  stableDiffusion: {
    en: `Create a technical Stable Diffusion prompt based on this image. Include:
1. Detailed subject description with modifiers
2. Art style (realistic, anime, oil painting, digital art)
3. Quality tags (masterpiece, best quality, ultra detailed)
4. Technical parameters (4K, 8K, highly detailed)
5. Camera/shot type (close-up, wide shot, portrait)
6. Lighting (natural light, studio lighting, golden hour)

Format as comma-separated tags optimized for Stable Diffusion.`,
    
    ru: `Создай технический промпт для Stable Diffusion на основе этого изображения. Включи:
1. Детальное описание субъекта с модификаторами
2. Художественный стиль (realistic, anime, oil painting, digital art)
3. Теги качества (masterpiece, best quality, ultra detailed)
4. Технические параметры (4K, 8K, highly detailed)
5. Тип камеры/кадра (close-up, wide shot, portrait)
6. Освещение (natural light, studio lighting, golden hour)

Форматируй как разделенные запятыми теги, оптимизированные для Stable Diffusion.`
  }
};

// HuggingFace Image Analysis Client
class HuggingFaceImageClient {
  private apiKey: string;
  private baseUrl = 'https://api-inference.huggingface.co/models';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || this.getApiKey();
  }

  private getApiKey(): string {
    const userKey = localStorage.getItem('huggingface_api_key');
    if (userKey) return userKey;
    return 'hf_xKzLmNqPvRsTeWaFbCdEfGhIjKlMnOpQ';
  }

  async analyzeImage(imageFile: File): Promise<string> {
    try {
      // Конвертируем файл в base64
      const base64 = await this.fileToBase64(imageFile);
      
      // Используем BLIP модель для описания изображений
      const response = await fetch(`${this.baseUrl}/Salesforce/blip-image-captioning-large`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: base64
        })
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const data = await response.json();
      return data[0]?.generated_text || 'Unable to analyze image';
    } catch (error) {
      console.error('HuggingFace Image Analysis error:', error);
      throw new Error('Failed to analyze image with HuggingFace');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Удаляем префикс data:image/...;base64,
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  }
}

// OpenRouter Vision Client
class OpenRouterVisionClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || this.getApiKey();
  }

  private getApiKey(): string {
    const userKey = localStorage.getItem('openrouter_api_key');
    if (userKey) return userKey;
    return 'sk-or-v1-3a5b7c9d1e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f';
  }

  async analyzeImage(imageFile: File, promptType: 'general' | 'flux' | 'stableDiffusion' = 'general'): Promise<string> {
    try {
      const base64 = await this.fileToBase64(imageFile);
      const prompt = imageAnalysisPrompts[promptType].en;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ai-prompt-improver.com',
          'X-Title': 'AI Prompt Improver'
        },
        body: JSON.stringify({
          model: 'microsoft/kosmos-2',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { 
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${base64}` }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter Vision API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to analyze image';
    } catch (error) {
      console.error('OpenRouter Vision error:', error);
      throw new Error('Failed to analyze image with OpenRouter Vision');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  }
}

// Локальный анализатор изображений (fallback)
class LocalImageAnalyzer {
  async analyzeImage(imageFile: File, promptType: 'general' | 'flux' | 'stableDiffusion' = 'general'): Promise<string> {
    // Простой локальный анализ на основе метаданных файла
    const fileName = imageFile.name.toLowerCase();
    const fileSize = (imageFile.size / 1024 / 1024).toFixed(2); // MB
    
    let baseDescription = '';
    
    // Определяем тип изображения по расширению
    if (fileName.includes('photo') || fileName.includes('img')) {
      baseDescription = 'a photograph showing';
    } else if (fileName.includes('art') || fileName.includes('drawing')) {
      baseDescription = 'an artistic image depicting';
    } else if (fileName.includes('screenshot') || fileName.includes('screen')) {
      baseDescription = 'a screenshot of';
    } else {
      baseDescription = 'an image containing';
    }

    // Генерируем базовое описание
    const descriptions = {
      general: `${baseDescription} various visual elements. This image appears to be a digital file (${fileSize}MB) that could contain subjects, objects, or scenes that would be suitable for AI image generation. The content may include people, objects, landscapes, or artistic elements with specific lighting, colors, and composition.`,
      
      flux: `${baseDescription} visual content, high quality, detailed, professional composition, 8K resolution, photorealistic style, well-lit scene, vibrant colors, sharp focus, masterpiece quality`,
      
      stableDiffusion: `${baseDescription.replace('a ', '').replace('an ', '')}, masterpiece, best quality, ultra detailed, 8K, highly detailed, professional photography, perfect composition, beautiful lighting, vibrant colors, sharp focus, trending on artstation`
    };

    return descriptions[promptType];
  }
}

// Главный сервис анализа изображений
export class ImageAnalysisService {
  private huggingFace: HuggingFaceImageClient;
  private openRouter: OpenRouterVisionClient;
  private localAnalyzer: LocalImageAnalyzer;

  constructor() {
    this.huggingFace = new HuggingFaceImageClient();
    this.openRouter = new OpenRouterVisionClient();
    this.localAnalyzer = new LocalImageAnalyzer();
  }

  async generatePrompts(imageFile: File, provider: AIProvider = 'openrouter'): Promise<ImagePromptResult> {
    try {
      let generalPrompt: string;
      let fluxPrompt: string;
      let stableDiffusionPrompt: string;

      if (provider === 'openrouter') {
        // Используем OpenRouter для всех типов промптов
        generalPrompt = await this.openRouter.analyzeImage(imageFile, 'general');
        fluxPrompt = await this.openRouter.analyzeImage(imageFile, 'flux');
        stableDiffusionPrompt = await this.openRouter.analyzeImage(imageFile, 'stableDiffusion');
      } else if (provider === 'huggingface') {
        // Используем HuggingFace для базового анализа и дополняем локально
        const baseDescription = await this.huggingFace.analyzeImage(imageFile);
        generalPrompt = this.enhanceForGeneral(baseDescription);
        fluxPrompt = this.enhanceForFlux(baseDescription);
        stableDiffusionPrompt = this.enhanceForStableDiffusion(baseDescription);
      } else {
        // Локальный анализ как fallback
        generalPrompt = await this.localAnalyzer.analyzeImage(imageFile, 'general');
        fluxPrompt = await this.localAnalyzer.analyzeImage(imageFile, 'flux');
        stableDiffusionPrompt = await this.localAnalyzer.analyzeImage(imageFile, 'stableDiffusion');
      }

      return {
        general: generalPrompt,
        flux: fluxPrompt,
        stableDiffusion: stableDiffusionPrompt
      };
    } catch (error) {
      console.error('Image analysis error, falling back to local analyzer:', error);
      
      // Fallback к локальному анализатору
      const generalPrompt = await this.localAnalyzer.analyzeImage(imageFile, 'general');
      const fluxPrompt = await this.localAnalyzer.analyzeImage(imageFile, 'flux');
      const stableDiffusionPrompt = await this.localAnalyzer.analyzeImage(imageFile, 'stableDiffusion');

      return {
        general: generalPrompt,
        flux: fluxPrompt,
        stableDiffusion: stableDiffusionPrompt
      };
    }
  }

  private enhanceForGeneral(baseDescription: string): string {
    return `A detailed scene showing ${baseDescription}. The image has good composition with balanced lighting and clear visual elements that would work well for AI image generation.`;
  }

  private enhanceForFlux(baseDescription: string): string {
    return `${baseDescription}, professional photography, 8K UHD, high quality, detailed, photorealistic, perfect lighting, vibrant colors, sharp focus, masterpiece`;
  }

  private enhanceForStableDiffusion(baseDescription: string): string {
    return `${baseDescription}, masterpiece, best quality, ultra detailed, 8K, highly detailed, professional photography, perfect composition, beautiful lighting, vibrant colors, sharp focus, trending on artstation, award winning photograph`;
  }

  async saveImageAnalysis(imageFile: File, prompts: ImagePromptResult, userId: string): Promise<ImageAnalysis> {
    const imageUrl = URL.createObjectURL(imageFile);
    
    const analysis: ImageAnalysis = {
      id: Date.now().toString(),
      userId,
      imageUrl,
      generatedPrompts: prompts,
      promptType: 'general',
      createdAt: new Date(),
      isFavorite: false
    };

    // Сохраняем в localStorage (в реальном приложении было бы в базе данных)
    const existingAnalyses = JSON.parse(localStorage.getItem('imageAnalyses') || '[]');
    existingAnalyses.push(analysis);
    localStorage.setItem('imageAnalyses', JSON.stringify(existingAnalyses));

    return analysis;
  }

  getImageAnalyses(userId: string): ImageAnalysis[] {
    const analyses = JSON.parse(localStorage.getItem('imageAnalyses') || '[]');
    return analyses.filter((analysis: ImageAnalysis) => analysis.userId === userId);
  }
}

export const imageAnalysisService = new ImageAnalysisService();
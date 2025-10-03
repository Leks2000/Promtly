import { ImageAnalysisResult, ImagePromptMode } from '../types';

export interface ImageAnalysisService {
  analyzeImage(imageFile: File, userId: string): Promise<ImageAnalysisResult>;
}

class ImageAnalysisAPI implements ImageAnalysisService {
  private apiKey: string;
  
  constructor() {
    // В реальном приложении это будет из переменных окружения
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  async analyzeImage(imageFile: File, userId: string): Promise<ImageAnalysisResult> {
    try {
      // Конвертируем изображение в base64
      const base64Image = await this.fileToBase64(imageFile);
      
      // Отправляем запрос к API для анализа изображения
      // В реальном приложении здесь будет вызов к OpenAI Vision API или другому сервису
      const analysisResponse = await this.callImageAnalysisAPI(base64Image);
      
      // Создаем результат анализа
      const result: ImageAnalysisResult = {
        id: this.generateId(),
        userId,
        imageUrl: base64Image,
        fileName: imageFile.name,
        generalPrompt: analysisResponse.general,
        midjourneyPrompt: analysisResponse.midjourney,
        stableDiffusionPrompt: analysisResponse.stableDiffusion,
        createdAt: new Date()
      };

      return result;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error('Failed to analyze image');
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async callImageAnalysisAPI(base64Image: string): Promise<{
    general: string;
    midjourney: string;
    stableDiffusion: string;
  }> {
    // Моковые данные для демонстрации
    // В реальном приложении здесь будет вызов к реальному API
    
    const mockPrompts = [
      {
        general: "A beautifully composed photograph showcasing vibrant colors and professional lighting. The image features excellent composition with balanced elements, creating an aesthetically pleasing visual narrative. High-quality photography with attention to detail and artistic perspective.",
        midjourney: "professional photography, vibrant colors, excellent composition, balanced lighting, high quality, artistic perspective, detailed, aesthetic --ar 16:9 --v 6 --style raw --s 250",
        stableDiffusion: "(masterpiece, best quality, ultra-detailed), professional photography, vibrant colors, excellent composition, balanced lighting, high resolution, artistic perspective, photorealistic, 8k, sharp details"
      },
      {
        general: "An atmospheric scene with dramatic lighting and rich textures. The composition demonstrates strong visual storytelling with carefully arranged elements that create depth and visual interest. The color palette enhances the overall mood and emotional impact.",
        midjourney: "atmospheric scene, dramatic lighting, rich textures, visual storytelling, depth, moody colors, cinematic composition --ar 3:2 --v 6 --style cinematic --s 300",
        stableDiffusion: "(atmospheric, dramatic lighting), rich textures, visual storytelling, depth of field, moody color palette, cinematic composition, high contrast, professional photography"
      },
      {
        general: "A stunning portrait featuring natural lighting and excellent subject positioning. The image demonstrates professional technique with careful attention to facial expressions, pose dynamics, and background composition that enhances the subject without distraction.",
        midjourney: "portrait photography, natural lighting, professional technique, expressive, dynamic pose, clean background, studio quality --ar 4:5 --v 6 --style portrait --s 200",
        stableDiffusion: "portrait photography, natural lighting, professional technique, (detailed face:1.2), expressive eyes, dynamic pose, clean background, studio lighting, high resolution"
      }
    ];

    // Возвращаем случайный промпт для демонстрации
    const randomPrompt = mockPrompts[Math.floor(Math.random() * mockPrompts.length)];
    
    // Имитируем задержку API
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    return randomPrompt;
  }

  private generateId(): string {
    return 'img_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Альтернативная реализация с использованием OpenAI API
class OpenAIImageAnalysis implements ImageAnalysisService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeImage(imageFile: File, userId: string): Promise<ImageAnalysisResult> {
    try {
      const base64Image = await this.fileToBase64(imageFile);
      const imageUrl = base64Image;

      // Генерируем три различных типа промптов параллельно
      const [generalPrompt, midjourneyPrompt, stableDiffusionPrompt] = await Promise.all([
        this.generatePrompt(imageUrl, 'general'),
        this.generatePrompt(imageUrl, 'midjourney'),
        this.generatePrompt(imageUrl, 'stable-diffusion')
      ]);

      const result: ImageAnalysisResult = {
        id: this.generateId(),
        userId,
        imageUrl: base64Image,
        fileName: imageFile.name,
        generalPrompt,
        midjourneyPrompt,
        stableDiffusionPrompt,
        createdAt: new Date()
      };

      return result;
    } catch (error) {
      console.error('OpenAI image analysis error:', error);
      throw new Error('Failed to analyze image with OpenAI');
    }
  }

  private async generatePrompt(imageUrl: string, mode: ImagePromptMode): Promise<string> {
    const prompts = {
      general: "Analyze this image and provide a detailed, natural language description that could be used to recreate a similar image. Focus on composition, lighting, colors, mood, and visual elements. Keep it under 200 words.",
      
      midjourney: "Analyze this image and create a Midjourney prompt that would generate a similar image. Include style parameters, aspect ratio suggestions, and specific Midjourney syntax. Focus on artistic style, composition, and technical parameters that Midjourney understands.",
      
      'stable-diffusion': "Analyze this image and create a Stable Diffusion prompt with proper formatting. Include quality tags, style descriptors, and technical parameters. Use parentheses for emphasis and proper SD syntax. Aim for effective prompt engineering."
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompts[mode]
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate prompt for this image.';

    } catch (error) {
      console.error(`Error generating ${mode} prompt:`, error);
      
      // Fallback промпты если API недоступен
      const fallbackPrompts = {
        general: "A detailed image with careful composition, good lighting, and artistic elements that create visual interest and aesthetic appeal.",
        midjourney: "detailed artwork, good composition, artistic lighting, high quality --ar 16:9 --v 6 --style raw",
        'stable-diffusion': "(high quality, detailed), artistic composition, good lighting, aesthetic, masterpiece"
      };
      
      return fallbackPrompts[mode];
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private generateId(): string {
    return 'oai_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Factory для создания сервиса анализа изображений
export function createImageAnalysisService(provider: 'mock' | 'openai' = 'mock', apiKey?: string): ImageAnalysisService {
  switch (provider) {
    case 'openai':
      if (!apiKey) {
        console.warn('OpenAI API key not provided, falling back to mock service');
        return new ImageAnalysisAPI();
      }
      return new OpenAIImageAnalysis(apiKey);
    case 'mock':
    default:
      return new ImageAnalysisAPI();
  }
}

// Экспорт по умолчанию
export const imageAnalysisService = createImageAnalysisService();
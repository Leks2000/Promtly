import { ImageAnalysis } from '../types';

/**
 * Сервис для анализа изображений с помощью бесплатных AI моделей
 */
export class ImageAnalysisService {
  
  /**
   * Анализирует изображение и генерирует промпты в трех форматах
   */
  static async analyzeImage(imageFile: File): Promise<{
    general: string;
    flux: string;
    stableDiffusion: string;
  }> {
    try {
      // Конвертируем изображение в base64
      const base64Image = await this.convertToBase64(imageFile);
      
      // Используем бесплатные API для анализа
      const analysis = await this.callFreeVisionAPI(base64Image);
      
      // Генерируем промпты в разных форматах
      const prompts = this.generatePrompts(analysis);
      
      return prompts;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error('Не удалось проанализировать изображение');
    }
  }

  /**
   * Конвертирует файл в base64
   */
  private static convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Вызывает бесплатные API для анализа изображений
   */
  private static async callFreeVisionAPI(base64Image: string): Promise<string> {
    // Пробуем несколько бесплатных API в порядке приоритета
    
    try {
      // 1. HuggingFace Vision API (бесплатный)
      return await this.callHuggingFaceVision(base64Image);
    } catch (error) {
      console.warn('HuggingFace Vision API failed, trying alternative:', error);
    }

    try {
      // 2. OpenRouter с бесплатной моделью Vision
      return await this.callOpenRouterVision(base64Image);
    } catch (error) {
      console.warn('OpenRouter Vision API failed, trying alternative:', error);
    }

    try {
      // 3. Резервный локальный анализ
      return await this.performLocalAnalysis(base64Image);
    } catch (error) {
      console.warn('Local analysis failed:', error);
    }

    throw new Error('Все методы анализа изображения недоступны');
  }

  /**
   * HuggingFace Vision API для анализа изображений
   */
  private static async callHuggingFaceVision(base64Image: string): Promise<string> {
    const apiKey = localStorage.getItem('huggingface_api_key');
    
    // Убираем префикс data:image/...;base64,
    const imageData = base64Image.split(',')[1];
    
    const response = await fetch('https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey || 'hf_demo'}`, // Используем demo key если нет API ключа
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: imageData,
        options: {
          wait_for_model: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const result = await response.json();
    return result[0]?.generated_text || 'Image analysis completed';
  }

  /**
   * OpenRouter Vision API (бесплатная модель)
   */
  private static async callOpenRouterVision(base64Image: string): Promise<string> {
    const apiKey = localStorage.getItem('openrouter_api_key');
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not found');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Prompt Improver'
      },
      body: JSON.stringify({
        model: 'microsoft/kosmos-2', // Бесплатная vision модель
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and describe what you see in detail. Focus on the main subjects, composition, style, colors, and visual elements.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || 'Image analysis completed';
  }

  /**
   * Локальный анализ изображения (резервный метод)
   */
  private static async performLocalAnalysis(base64Image: string): Promise<string> {
    // Простой анализ на основе размера и формата изображения
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const aspectRatio = width / height;
        
        let description = 'An image with ';
        
        // Анализ соотношения сторон
        if (aspectRatio > 1.5) {
          description += 'landscape orientation, ';
        } else if (aspectRatio < 0.67) {
          description += 'portrait orientation, ';
        } else {
          description += 'square composition, ';
        }
        
        // Анализ размера
        if (width > 1920 || height > 1920) {
          description += 'high resolution, ';
        } else if (width > 1024 || height > 1024) {
          description += 'medium resolution, ';
        } else {
          description += 'standard resolution, ';
        }
        
        description += 'containing visual elements that would benefit from detailed analysis for prompt generation';
        
        resolve(description);
      };
      img.src = base64Image;
    });
  }

  /**
   * Генерирует промпты в трех форматах на основе анализа
   */
  private static generatePrompts(analysis: string): {
    general: string;
    flux: string;
    stableDiffusion: string;
  } {
    // Базовые ключевые слова из анализа
    const baseDescription = analysis.toLowerCase();
    
    // General Image Prompt - естественный язык
    const general = this.generateGeneralPrompt(analysis);
    
    // Flux - оптимизированный для Flux моделей
    const flux = this.generateFluxPrompt(analysis);
    
    // Stable Diffusion - с техническими параметрами
    const stableDiffusion = this.generateStableDiffusionPrompt(analysis);
    
    return {
      general,
      flux,
      stableDiffusion
    };
  }

  /**
   * Генерирует общий промпт на естественном языке
   */
  private static generateGeneralPrompt(analysis: string): string {
    const prompt = `${analysis}. Create a detailed, natural language description focusing on the composition, lighting, subjects, and overall visual style of the image.`;
    return prompt.charAt(0).toUpperCase() + prompt.slice(1);
  }

  /**
   * Генерирует промпт для Flux моделей
   */
  private static generateFluxPrompt(analysis: string): string {
    const fluxKeywords = [
      'high quality', 'detailed composition', 'professional lighting',
      'modern style', 'vibrant colors', 'sharp focus', 'cinematic'
    ];
    
    // Извлекаем ключевые слова из анализа
    const keywords = this.extractKeywords(analysis);
    
    // Комбинируем с Flux-специфичными терминами
    const combinedKeywords = [...keywords, ...fluxKeywords.slice(0, 3)];
    
    return combinedKeywords.join(', ') + ', optimized for Flux AI generation';
  }

  /**
   * Генерирует промпт для Stable Diffusion
   */
  private static generateStableDiffusionPrompt(analysis: string): string {
    const sdKeywords = [
      'masterpiece', 'best quality', 'ultra detailed', '8k resolution',
      'photorealistic', 'professional photography', 'perfect composition',
      'dramatic lighting', 'vibrant colors', 'sharp focus', 'artstation quality'
    ];
    
    // Извлекаем и обрабатываем ключевые слова
    const keywords = this.extractKeywords(analysis);
    
    // Добавляем SD-специфичные термины
    const enhancedKeywords = [...keywords, ...sdKeywords.slice(0, 5)];
    
    return enhancedKeywords.join(', ');
  }

  /**
   * Извлекает ключевые слова из анализа изображения
   */
  private static extractKeywords(text: string): string[] {
    // Простое извлечение ключевых слов
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'this', 'that', 'these', 'those'];
    
    const keywords = words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .filter(word => /^[a-zA-Z]+$/.test(word)) // Только буквы
      .slice(0, 10); // Берем первые 10 ключевых слов
    
    return [...new Set(keywords)]; // Удаляем дубликаты
  }

  /**
   * Проверяет доступность API сервисов
   */
  static async checkAPIAvailability(): Promise<{
    huggingface: boolean;
    openrouter: boolean;
  }> {
    const results = {
      huggingface: false,
      openrouter: false
    };

    // Проверяем HuggingFace
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer hf_demo'
        }
      });
      results.huggingface = response.status !== 403;
    } catch (error) {
      console.warn('HuggingFace API check failed:', error);
    }

    // Проверяем OpenRouter
    try {
      const apiKey = localStorage.getItem('openrouter_api_key');
      if (apiKey) {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        results.openrouter = response.ok;
      }
    } catch (error) {
      console.warn('OpenRouter API check failed:', error);
    }

    return results;
  }
}
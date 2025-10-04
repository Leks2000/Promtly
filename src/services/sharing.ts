import { ShareablePrompt } from '../types';
import { databaseService } from './database';

export interface ShareResult {
  shareId: string;
  shareUrl: string;
  qrCodeUrl: string;
}

export class SharingService {
  private baseShareUrl = 'https://ai-prompt-improver.com/shared';

  // Создание расшаренного промпта
  async sharePrompt(
    title: string,
    content: string,
    type: 'general' | 'civitai' | 'universal' | 'textual',
    tags: string[],
    createdBy: string
  ): Promise<ShareResult> {
    try {
      // Создаем запись в БД
      const shareablePrompt: ShareablePrompt = {
        id: this.generateShareId(),
        title,
        content,
        type,
        tags,
        createdBy,
        createdAt: new Date()
      };

      const sharedPrompt = await databaseService.sharePrompt(shareablePrompt);
      const shareUrl = `${this.baseShareUrl}/${sharedPrompt.id}`;
      const qrCodeUrl = await this.generateQRCode(shareUrl);

      return {
        shareId: sharedPrompt.id,
        shareUrl,
        qrCodeUrl
      };
    } catch (error) {
      console.error('Error sharing prompt:', error);
      throw new Error('Не удалось поделиться промптом');
    }
  }

  // Получение расшаренного промпта
  async getSharedPrompt(shareId: string): Promise<ShareablePrompt | null> {
    try {
      return await databaseService.getSharedPrompt(shareId);
    } catch (error) {
      console.error('Error getting shared prompt:', error);
      return null;
    }
  }

  // Генерация QR-кода
  private async generateQRCode(text: string): Promise<string> {
    try {
      // Используем бесплатный API для генерации QR-кодов
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/`;
      const params = new URLSearchParams({
        size: '200x200',
        data: text,
        format: 'png'
      });

      return `${qrApiUrl}?${params.toString()}`;
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback: простой QR код
      return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(text)}`;
    }
  }

  // Копирование ссылки в буфер обмена
  async copyShareLink(shareUrl: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        return true;
      } else {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const result = document.execCommand('copy');
        textArea.remove();
        
        return result;
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  // Создание ссылки для социальных сетей
  generateSocialShareLinks(shareUrl: string, title: string) {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    return {
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      vk: `https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };
  }

  // Генерация встраиваемого кода
  generateEmbedCode(shareId: string): string {
    return `<iframe 
  src="${this.baseShareUrl}/embed/${shareId}" 
  width="100%" 
  height="400" 
  frameborder="0" 
  scrolling="no"
  title="AI Prompt">
</iframe>`;
  }

  // Экспорт промпта в различных форматах
  exportPrompt(prompt: ShareablePrompt, format: 'json' | 'txt' | 'md'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(prompt, null, 2);
      
      case 'txt':
        return `Title: ${prompt.title}
Type: ${prompt.type}
Tags: ${prompt.tags.join(', ')}
Created: ${prompt.createdAt.toLocaleDateString()}

${prompt.content}`;

      case 'md':
        return `# ${prompt.title}

**Type:** ${prompt.type}  
**Tags:** ${prompt.tags.join(', ')}  
**Created:** ${prompt.createdAt.toLocaleDateString()}  

## Prompt

\`\`\`
${prompt.content}
\`\`\``;

      default:
        return prompt.content;
    }
  }

  // Скачивание файла
  downloadFile(content: string, filename: string, mimeType: string): void {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Освобождаем память
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }

  // Импорт промпта из файла
  async importPrompt(file: File): Promise<Partial<ShareablePrompt> | null> {
    try {
      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        return {
          title: data.title || 'Imported Prompt',
          content: data.content || text,
          type: data.type || 'universal',
          tags: Array.isArray(data.tags) ? data.tags : []
        };
      } else {
        // Для текстовых файлов
        return {
          title: file.name.replace(/\.[^/.]+$/, ""),
          content: text,
          type: 'universal',
          tags: []
        };
      }
    } catch (error) {
      console.error('Error importing prompt:', error);
      return null;
    }
  }

  // Проверка валидности ссылки расшаривания
  isValidShareUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.includes('/shared/') && 
             urlObj.pathname.split('/').pop()?.length === 8;
    } catch {
      return false;
    }
  }

  // Извлечение shareId из URL
  extractShareId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const shareId = pathParts[pathParts.length - 1];
      
      return shareId.length === 8 ? shareId.toUpperCase() : null;
    } catch {
      return null;
    }
  }

  // Генерация уникального ID для расшаривания
  private generateShareId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Получение статистики расшаривания
  async getShareStats(shareId: string): Promise<{
    viewCount: number;
    createdAt: Date;
  } | null> {
    try {
      const prompt = await this.getSharedPrompt(shareId);
      if (!prompt) return null;

      return {
        viewCount: (prompt as any).viewCount || 0,
        createdAt: prompt.createdAt
      };
    } catch (error) {
      console.error('Error getting share stats:', error);
      return null;
    }
  }

  // Создание короткой ссылки (опционально)
  async createShortLink(shareUrl: string): Promise<string> {
    try {
      // Можно интегрировать с сервисами коротких ссылок
      // Например: bit.ly, tinyurl.com, is.gd
      
      // Пример с is.gd API (бесплатный)
      const response = await fetch('https://is.gd/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `format=simple&url=${encodeURIComponent(shareUrl)}`
      });

      if (response.ok) {
        const shortUrl = await response.text();
        return shortUrl.trim();
      }
    } catch (error) {
      console.error('Error creating short link:', error);
    }

    // Fallback: возвращаем оригинальную ссылку
    return shareUrl;
  }

  // Валидация контента перед расшариванием
  validatePromptForSharing(content: string, title: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!title.trim()) {
      errors.push('Заголовок не может быть пустым');
    }

    if (title.length > 100) {
      errors.push('Заголовок не должен превышать 100 символов');
    }

    if (!content.trim()) {
      errors.push('Содержимое промпта не может быть пустым');
    }

    if (content.length > 10000) {
      errors.push('Промпт не должен превышать 10,000 символов');
    }

    // Проверка на недопустимый контент
    const forbiddenWords = ['spam', 'hack', 'virus', 'malware'];
    const lowerContent = content.toLowerCase();
    const lowerTitle = title.toLowerCase();
    
    forbiddenWords.forEach(word => {
      if (lowerContent.includes(word) || lowerTitle.includes(word)) {
        errors.push(`Недопустимое слово: ${word}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const sharingService = new SharingService();
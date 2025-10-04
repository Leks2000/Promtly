import { fileURLToPath } from 'url';
import path from 'path';
import { build } from 'vite';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.chdir(__dirname);

async function buildExtension() {
  console.log('🚀 Building AI Prompt Improver Chrome Extension...');

  try {
    // Build the React app
    console.log('📦 Building React application...');
    await build({
      root: 'src',
      build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            popup: path.resolve(__dirname, 'src/index.html'),
          },
          output: {
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]',
          },
        },
        cssCodeSplit: false,
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        },
      },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    });

    // Copy manifest.json to dist
    console.log('📋 Copying manifest.json...');
    await fs.copy('manifest.json', 'dist/manifest.json');

    // Copy background script
    console.log('⚙️ Copying background script...');
    await fs.copy('src/background.js', 'dist/background.js');

    // Copy icons to dist (create placeholder if not exists)
    console.log('🎨 Setting up icons...');
    if (await fs.pathExists('icons')) {
      await fs.copy('icons', 'dist/icons');
    } else {
      await fs.ensureDir('dist/icons');
      
      // Create simple placeholder icons
      const placeholderSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="20" fill="url(#grad)"/>
  <path d="M64 32L80 48H72V80H88L64 96L40 80H56V48H48L64 32Z" fill="white"/>
</svg>`;
      
      // Create SVG files for different sizes
      const sizes = [16, 32, 48, 128];
      for (const size of sizes) {
        const svgContent = placeholderSVG.replace(/128/g, size.toString());
        await fs.writeFile(`dist/icons/icon${size}.svg`, svgContent);
      }
      
      console.log('⚠️  Created placeholder icons. Replace with your own PNG icons in dist/icons/');
    }

    // Create .env.example if not exists
    console.log('📝 Creating configuration files...');
    if (!(await fs.pathExists('.env.example'))) {
      const envExample = `# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here

# AI Providers API Keys
OPENROUTER_API_KEY=your_openrouter_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here
POE_TOKEN=your_poe_token_here

# Google Ads (optional)
GOOGLE_ADS_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxxx
GOOGLE_ADS_SLOT_ID=xxxxxxxxxx

# Development
NODE_ENV=production`;
      
      await fs.writeFile('.env.example', envExample);
    }

    // Update manifest with environment variables if .env exists
    if (await fs.pathExists('.env')) {
      console.log('🔧 Updating manifest with environment variables...');
      
      // Read .env file
      const envContent = await fs.readFile('.env', 'utf-8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      });
      
      // Update manifest
      const manifest = await fs.readJson('dist/manifest.json');
      
      if (envVars.GOOGLE_CLIENT_ID) {
        manifest.oauth2.client_id = envVars.GOOGLE_CLIENT_ID;
      }
      
      await fs.writeJson('dist/manifest.json', manifest, { spaces: 2 });
    }

    // Create installation instructions
    const installInstructions = `# 🎉 AI Prompt Improver - Установка завершена!

## 📦 Файлы расширения готовы в папке ./dist/

### 🔧 Установка в Chrome:
1. Откройте Chrome и перейдите на chrome://extensions/
2. Включите "Режим разработчика" (Developer mode)
3. Нажмите "Загрузить распакованное расширение" (Load unpacked)
4. Выберите папку ./dist/

### ⚙️ Первоначальная настройка:
1. Настройте API ключи в .env файле (см. .env.example)
2. Обновите Google Client ID в manifest.json
3. Пересоберите расширение: npm run build:extension

### 📖 Документация:
- README.md - основная документация
- INSTALLATION.md - подробное руководство по установке  
- DEVELOPMENT.md - руководство для разработчиков

### 🆘 Поддержка:
- GitHub Issues: https://github.com/your-username/ai-prompt-improver/issues
- Email: support@ai-prompt-improver.com

Удачного использования! 🚀`;

    await fs.writeFile('dist/INSTALL.txt', installInstructions);

    console.log('✅ Chrome Extension built successfully!');
    console.log('📁 Output directory: ./dist/');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('   1. Configure API keys in .env file');
    console.log('   2. Update Google Client ID in manifest.json');
    console.log('   3. Load ./dist/ folder in Chrome Extensions');
    console.log('');
    console.log('📖 See INSTALLATION.md for detailed setup instructions');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildExtension();
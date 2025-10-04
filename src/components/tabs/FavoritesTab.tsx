import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Search, 
  Filter,
  Copy, 
  Share,
  Trash2, 
  Check,
  Tag,
  Plus,
  Grid,
  List
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

import { FavoritePrompt, PromptType } from '../../types';

const FavoritesTab: React.FC = () => {
  const { 
    favorites, 
    loadFavorites, 
    removeFromFavorites,
    sharePrompt,
    copyToClipboard,
    user
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);

  // Фильтрация избранного
  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => item.tags.includes(tag));

    return matchesSearch && matchesCategory && matchesTags;
  });

  // Получение всех категорий
  const categories = ['all', ...new Set(favorites.map(f => f.category))];
  
  // Получение всех тегов
  const allTags = [...new Set(favorites.flatMap(f => f.tags))];

  const handleCopy = async (content: string, id: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShare = async (item: FavoritePrompt) => {
    if (!user) return;

    try {
      const result = await sharePrompt(
        item.title,
        item.content,
        item.category as PromptType,
        item.tags
      );
      alert(`Промпт расшарен! Ссылка: ${result.shareUrl}`);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить из избранного?')) {
      await removeFromFavorites(id);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-red-500" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Избранное
          </h1>
          <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {filteredFavorites.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            title={`Переключить на ${viewMode === 'grid' ? 'список' : 'сетку'}`}
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить</span>
          </button>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div className="space-y-3">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по избранному..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Фильтры */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          
          {/* Категории */}
          <div className="flex flex-wrap gap-1">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category === 'all' ? 'Все' : category}
              </button>
            ))}
          </div>

          {/* Теги */}
          {allTags.length > 0 && (
            <>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
              <div className="flex flex-wrap gap-1">
                {allTags.slice(0, 5).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full transition-all duration-200 ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Очистить фильтры */}
          {(selectedCategory !== 'all' || selectedTags.length > 0) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTags([]);
              }}
              className="text-xs text-red-500 hover:text-red-700 ml-2"
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      {/* Список избранного */}
      <div className="flex-1 overflow-hidden">
        {filteredFavorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Heart className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {favorites.length === 0 ? 'Нет избранных промптов' : 'Ничего не найдено'}
            </p>
            <p className="text-sm text-center">
              {favorites.length === 0 
                ? 'Сохраняйте полезные промпты в избранное для быстрого доступа'
                : 'Попробуйте изменить критерии поиска'}
            </p>
          </div>
        ) : (
          <div className={`h-full overflow-y-auto space-y-3 ${
            viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-3'
          }`}>
            {filteredFavorites.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        Использовано: {item.usageCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 ml-3">
                    <button
                      onClick={() => handleCopy(item.content, item.id)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                      title="Копировать"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleShare(item)}
                      className="p-1 text-gray-400 hover:text-purple-500 transition-colors duration-200"
                      title="Поделиться"
                    >
                      <Share className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                  {item.content}
                </p>

                {/* Теги */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesTab;
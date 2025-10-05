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
import { getTranslation } from '../../utils/translations';
import { FavoritePrompt, PromptType } from '../../types';

const FavoritesTab: React.FC = () => {
  const { 
    favorites, 
    settings, 
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
  const [showAddDialog, setShowAddDialog] = useState(false);
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
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Main Content Container */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Избранное
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Коллекция сохранённых промптов
                  </p>
                </div>
                <span className="px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                  {filteredFavorites.length} промптов
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200"
                title={`Переключить на ${viewMode === 'grid' ? 'список' : 'сетку'}`}
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/25 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по избранному..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Фильтры:</span>
              </div>
              
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 text-sm rounded-lg border transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-600'
                    }`}
                  >
                    {category === 'all' ? 'Все' : category}
                  </button>
                ))}
              </div>

              {/* Tags */}
              {allTags.length > 0 && (
                <>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 5).map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-lg border transition-all duration-200 ${
                          selectedTags.includes(tag)
                            ? 'bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/25'
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Clear filters */}
              {(selectedCategory !== 'all' || selectedTags.length > 0) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedTags([]);
                  }}
                  className="text-sm text-red-500 hover:text-red-700 px-2 py-1 rounded transition-colors duration-200"
                >
                  Очистить фильтры
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Favorites List */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
                <Heart className="w-12 h-12 opacity-50" />
              </div>
              <p className="text-xl font-medium mb-2">
                {favorites.length === 0 ? 'Нет избранных промптов' : 'Ничего не найдено'}
              </p>
              <p className="text-sm text-center text-gray-400 dark:text-gray-500">
                {favorites.length === 0 
                  ? 'Сохраняйте полезные промпты в избранное для быстрого доступа'
                  : 'Попробуйте изменить критерии поиска'}
              </p>
            </div>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' 
              : 'space-y-4'
          }`}>
            {filteredFavorites.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Использовано: {item.usageCount} раз
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleCopy(item.content, item.id)}
                      className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200"
                      title="Копировать"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleShare(item)}
                      className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200"
                      title="Поделиться"
                    >
                      <Share className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 mb-4">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed line-clamp-4">
                    {item.content}
                  </p>
                </div>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-600"
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
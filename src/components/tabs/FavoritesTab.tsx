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
  List,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import UpgradeModal from '../UpgradeModal';
import { FavoritePrompt, PromptType } from '../../types';

const FavoritesTab: React.FC = () => {
  const { 
    favorites, 
    loadFavorites, 
    removeFromFavorites,
    sharePrompt,
    copyToClipboard,
    user,
    checkCanPerformAction,
    getUserSubscriptionType,
    usageStats,
    freemiumLimits
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [, setShowAddDialog] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const subscriptionType = getUserSubscriptionType();

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

  const handleAddFavorite = async () => {
    if (!user) return;
    
    const canAdd = await checkCanPerformAction('favorites');
    if (!canAdd.canPerform) {
      setShowUpgradeModal(true);
      return;
    }
    
    setShowAddDialog(true);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Избранное
            </h1>
            <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {filteredFavorites.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
              title={`Переключить на ${viewMode === 'grid' ? 'список' : 'сетку'}`}
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>

            <button
              onClick={handleAddFavorite}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
        </div>

        {/* Freemium Status */}
        {subscriptionType === 'free' && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <div className="font-medium text-amber-800 dark:text-amber-300">
                    Избранное: {usageStats.favoritesUsed}/{freemiumLimits.favorites}
                  </div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    Обновитесь до Pro для безлимитного сохранения
                  </div>
                </div>
              </div>
              <div className="w-24 bg-amber-200 dark:bg-amber-800 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((usageStats.favoritesUsed / freemiumLimits.favorites) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Поиск и фильтры */}
        <div className="space-y-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по избранному..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Фильтры */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 text-gray-500">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Фильтры:</span>
            </div>
            
            {/* Категории */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25'
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
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 5).map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-xl transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Tag className="w-4 h-4" />
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
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Очистить
              </button>
            )}
          </div>
        </div>

        {/* Список избранного */}
        <div className="space-y-4">
          {filteredFavorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              <Heart className="w-20 h-20 mb-6 opacity-50" />
              <p className="text-xl font-medium mb-3">
                {favorites.length === 0 ? 'Нет избранных промптов' : 'Ничего не найдено'}
              </p>
              <p className="text-center max-w-md">
                {favorites.length === 0 
                  ? 'Сохраняйте полезные промпты в избранное для быстрого доступа'
                  : 'Попробуйте изменить критерии поиска'}
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredFavorites.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-800 dark:text-blue-200 rounded-full">
                          {item.category}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Использовано: {item.usageCount}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopy(item.content, item.id)}
                        className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all duration-200"
                        title="Копировать"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleShare(item)}
                        className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200"
                        title="Поделиться"
                      >
                        <Share className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        title="Удалить"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
                    {item.content}
                  </p>

                  {/* Теги */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={`Избранное (${usageStats.favoritesUsed}/${freemiumLimits.favorites})`}
        currentUsage={usageStats.favoritesUsed}
        limit={freemiumLimits.favorites}
      />
    </div>
  );
};

export default FavoritesTab;
import React, { useState } from 'react';
import { 
  Crown, 
  CheckCircle, 
  Star, 
  Clock, 
  Shield, 
  Zap,
  X,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { SubscriptionPlan } from '../types';
import clsx from 'clsx';

interface ProSubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProSubscription: React.FC<ProSubscriptionProps> = ({ isOpen, onClose }) => {
  const { user, settings } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock subscription plans
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'pro-monthly',
      name: 'Pro Monthly',
      price: 9.99,
      currency: 'USD',
      duration: 30,
      historyLimit: -1, // unlimited
      features: [
        'Unlimited History Storage',
        'Priority AI Processing',
        'Advanced Image Analysis',
        'Export & Import Data',
        'Priority Support',
        'No Advertisements'
      ]
    },
    {
      id: 'pro-yearly',
      name: 'Pro Yearly',
      price: 99.99,
      currency: 'USD',
      duration: 365,
      historyLimit: -1,
      popular: true,
      features: [
        'Unlimited History Storage',
        'Priority AI Processing',
        'Advanced Image Analysis',
        'Export & Import Data',
        'Priority Support',
        'No Advertisements',
        '2 Months Free',
        'Beta Features Access'
      ]
    }
  ];

  const handlePurchase = async (planId: string) => {
    if (!user) return;

    setSelectedPlan(planId);
    setIsProcessing(true);

    try {
      // Here you would integrate with a payment processor like Stripe
      // For now, we'll simulate the process
      
      // Redirect to external payment page
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (plan) {
        // Create checkout session URL (mock)
        const checkoutUrl = `https://your-payment-processor.com/checkout?plan=${planId}&user=${user.id}`;
        
        // Open in new tab
        window.open(checkoutUrl, '_blank');
        
        // In a real implementation, you would:
        // 1. Create checkout session on your backend
        // 2. Redirect user to payment processor
        // 3. Handle webhook for successful payment
        // 4. Update user's pro status in database
      }
      
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getTranslation('upgradeToPro', settings.language)}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Unlock unlimited history and advanced features
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Current Plan Status */}
        {user && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {getTranslation('currentPlan', settings.language)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.isPro ? getTranslation('proPlan', settings.language) : getTranslation('freePlan', settings.language)}
                </p>
              </div>
              <div className="text-right">
                {user.isPro ? (
                  <div className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">Pro Active</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-500 dark:text-gray-400">
                      {getTranslation('historyLimit', settings.language)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={clsx(
                  'relative border-2 rounded-2xl p-6 transition-all duration-200 cursor-pointer',
                  {
                    'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105': plan.popular,
                    'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500': !plan.popular
                  }
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{getTranslation('popular', settings.language)}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        /{plan.duration === 30 ? getTranslation('month', settings.language) : getTranslation('year', settings.language)}
                      </span>
                    </div>
                    {plan.duration === 365 && (
                      <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                        Save $20 per year!
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={isProcessing || user?.isPro}
                    className={clsx(
                      'w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2',
                      {
                        'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg': !user?.isPro && !plan.popular,
                        'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg scale-105': !user?.isPro && plan.popular,
                        'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed': user?.isPro,
                        'opacity-50 cursor-wait': isProcessing && selectedPlan === plan.id
                      }
                    )}
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      <>
                        <Zap className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : user?.isPro ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Current Plan</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <span>{getTranslation('buyPro', settings.language)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Why upgrade to Pro?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {getTranslation('unlimitedHistory', settings.language)}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Store all your prompts forever, never lose your work
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Priority Processing
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Faster AI responses and priority queue access
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Crown className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Advanced Features
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Access to beta features and advanced tools
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {getTranslation('noAds', settings.language)}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Clean interface without any advertisements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProSubscription;
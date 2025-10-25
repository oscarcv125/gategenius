import { Calendar, TrendingUp, Users, Zap } from 'lucide-react';

/**
 * Navigation Component
 * Owner: Oscar
 */
export default function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'expiry',
      name: 'Expiration Intelligence',
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      owner: 'Hermann'
    },
    {
      id: 'consumption',
      name: 'Consumption Prediction',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      owner: 'Diego'
    },
    {
      id: 'productivity',
      name: 'Workforce Planning',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      owner: 'Oscar'
    },
    {
      id: 'integration',
      name: 'Smart Assignment',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      owner: 'Oscar'
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm
                  transition-colors whitespace-nowrap
                  ${isActive
                    ? `border-primary-600 ${tab.color}`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
                {isActive && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${tab.bgColor} ${tab.color}`}>
                    {tab.owner}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

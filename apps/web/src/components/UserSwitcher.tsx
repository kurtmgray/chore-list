import { useUser } from '../contexts/UserContext';

export function UserSwitcher() {
  const { currentUser, availableUsers, switchUser } = useUser();

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-600">Switch user:</span>
      <div className="flex space-x-2">
        {availableUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => switchUser(user.id)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${currentUser?.id === user.id
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }
            `}
          >
            <span className="text-lg mr-2">{user.avatar}</span>
            {user.first_name}
          </button>
        ))}
      </div>
    </div>
  );
}
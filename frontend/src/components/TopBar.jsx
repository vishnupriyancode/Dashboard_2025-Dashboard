import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon, BellIcon, EllipsisVerticalIcon, CogIcon } from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';

const TopBar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications] = useState([
    { id: 1, message: 'New API request received', time: '5m ago' },
    { id: 2, message: 'System update completed', time: '1h ago' },
    { id: 3, message: 'Weekly report available', time: '2h ago' },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900">API Dashboard</h2>
      </div>
      <div className="flex items-center space-x-4">
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="inline-flex items-center rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none">
            <EllipsisVerticalIcon className="h-6 w-6" aria-hidden="true" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => navigate('/profile')}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } flex w-full items-center px-4 py-2 text-sm`}
                  >
                    <UserCircleIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                    {user ? user.username : 'User'}
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => navigate('/profile')}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } flex w-full items-center px-4 py-2 text-sm`}
                  >
                    <CogIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                    Profile Settings
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <div className="relative">
                    <button
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <BellIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                      Notifications
                      <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {notifications.length}
                      </span>
                    </button>
                  </div>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default TopBar; 
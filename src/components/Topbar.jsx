import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usrImg from '../assets/usr.png';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const path = location.pathname;
  const title = {
    '/': { title: 'Shop', subtitle: 'Shop > Books' },
    '/stores': { title: 'Stores', subtitle: 'Admin > Stores' },
    '/author': { title: 'Authors', subtitle: 'Admin > Authors' },
    '/books': { title: 'Books', subtitle: 'Admin > Books' },
    '/store/:storeId': { title: 'Store Inventory', subtitle: 'Admin > Store Inventory' },
    '/browsebooks': { title: 'Browse Books', subtitle: 'Shop > Books' },
    '/browseauthors': { title: 'Browse Authors', subtitle: 'Shop > Authors' },
  };

  const handleSignOut = () => {
    signOut();        // clear user from context
    navigate('/login'); // redirect to login page
  };

  return (
    <div className='h-24 border-b border-b-secondary-text flex justify-between items-center px-4'>
      <div className='flex flex-col justify-start items-start'>
        <p className='text-lg text-secondary-text'>{title[path]?.title}</p>
        <p className='font-light text-secondary-text'>{title[path]?.subtitle}</p>
      </div>

      <div className='flex items-center gap-2'>
        <img src={usrImg} alt="profile" className='ml-4 rounded w-10 h-10' />
        <p className='text-secondary-text font-light'> {user?.name || ''} </p>
        {user && (
          <button
            onClick={handleSignOut}
            className='ml-4 bg-red-500 text-white px-3 py-1 rounded'
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};

export default Topbar;
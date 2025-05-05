import React from 'react';
import { NavLink } from 'react-router-dom';
import { TruckIcon, HomeIcon, FileTextIcon, BarChart2Icon, PackageIcon, UsersIcon, UserIcon, SheetIcon as FleetIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <TruckIcon className="h-8 w-8 text-white" />
        <span className="ml-2 text-white text-xl font-bold">TransManager</span>
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `${isActive 
              ? 'bg-primary-800 text-white' 
              : 'text-white hover:bg-primary-600'} 
              group flex items-center px-2 py-2 text-base font-medium rounded-md`
          }
          end
        >
          <HomeIcon className="mr-4 h-6 w-6" />
          {t('dashboard')}
        </NavLink>
        <NavLink 
          to="/operations" 
          className={({ isActive }) => 
            `${isActive 
              ? 'bg-primary-800 text-white' 
              : 'text-white hover:bg-primary-600'} 
              group flex items-center px-2 py-2 text-base font-medium rounded-md`
          }
        >
          <PackageIcon className="mr-4 h-6 w-6" />
          {t('operations')}
        </NavLink>
        <NavLink 
          to="/providers" 
          className={({ isActive }) => 
            `${isActive 
              ? 'bg-primary-800 text-white' 
              : 'text-white hover:bg-primary-600'} 
              group flex items-center px-2 py-2 text-base font-medium rounded-md`
          }
        >
          <UsersIcon className="mr-4 h-6 w-6" />
          {t('serviceProviders')}
        </NavLink>
        <NavLink 
          to="/clients" 
          className={({ isActive }) => 
            `${isActive 
              ? 'bg-primary-800 text-white' 
              : 'text-white hover:bg-primary-600'} 
              group flex items-center px-2 py-2 text-base font-medium rounded-md`
          }
        >
          <UserIcon className="mr-4 h-6 w-6" />
          {t('clients')}
        </NavLink>
        <NavLink 
          to="/fleet" 
          className={({ isActive }) => 
            `${isActive 
              ? 'bg-primary-800 text-white' 
              : 'text-white hover:bg-primary-600'} 
              group flex items-center px-2 py-2 text-base font-medium rounded-md`
          }
        >
          <TruckIcon className="mr-4 h-6 w-6" />
          Fleet
        </NavLink>
        <NavLink 
          to="/documents" 
          className={({ isActive }) => 
            `${isActive 
              ? 'bg-primary-800 text-white' 
              : 'text-white hover:bg-primary-600'} 
              group flex items-center px-2 py-2 text-base font-medium rounded-md`
          }
        >
          <FileTextIcon className="mr-4 h-6 w-6" />
          {t('documentRegistry')}
        </NavLink>
        <NavLink 
          to="/reports" 
          className={({ isActive }) => 
            `${isActive 
              ? 'bg-primary-800 text-white' 
              : 'text-white hover:bg-primary-600'} 
              group flex items-center px-2 py-2 text-base font-medium rounded-md`
          }
        >
          <BarChart2Icon className="mr-4 h-6 w-6" />
          {t('reports')}
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
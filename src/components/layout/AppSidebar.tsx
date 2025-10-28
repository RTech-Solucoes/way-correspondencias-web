'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CaretLeftIcon, CaretRightIcon, CaretDownIcon, CheckIcon } from '@phosphor-icons/react';
import { useSidebar } from '@/context/sidebar/SidebarContext';
import { PageDef } from "@/types/pages/pages";
import { usePermittedPages } from "@/hooks/use-permitted-pages";
import { MODULES_DEF } from "@/constants/pages";
import { Button } from '@/components/ui/button';


export function AppSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, sidebarWidth, selectedModule, setSelectedModule } = useSidebar();
  const [isModuleSelectorOpen, setIsModuleSelectorOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModuleSelectorOpen(false);
      }
    };

    if (isModuleSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModuleSelectorOpen]);

  const allMenuItems: PageDef[] = usePermittedPages();
  
  const menuItems = allMenuItems.filter(item => item.module === selectedModule);
  
  const recursosItems = allMenuItems.filter(item => item.module === 'recursos');
  
  const currentModule = MODULES_DEF.find(mod => mod.id === selectedModule);
  const ModuleIcon = currentModule?.icon;

  return (
    <aside
      className="fixed left-0 top-[82px] bottom-0 bg-white border-r border-gray-200 overflow-y-auto z-40 transition-all duration-300 flex flex-col"
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            onClick={() => setIsModuleSelectorOpen(!isModuleSelectorOpen)}
            className={`w-full flex items-center justify-between px-3 h-14 py-4.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? currentModule?.label : undefined}
          >
            <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
              {ModuleIcon && <ModuleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />}
              {!isCollapsed && (
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Gestão</span>
                  <span className="text-sm font-medium truncate">{currentModule?.label.replace('Gestão de ', '').replace('Gestão ', '')}</span>
                </div>
              )}
            </div>
            {!isCollapsed && <CaretDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isModuleSelectorOpen ? 'rotate-180' : ''}`} />}
          </Button>

          {isModuleSelectorOpen && !isCollapsed && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {MODULES_DEF.map((module) => {
                const Icon = module.icon;
                const isSelected = module.id === selectedModule;
                
                return (
                  <Button
                    variant="ghost"
                    key={module.id}
                    onClick={() => {
                      setSelectedModule(module.id);
                      setIsModuleSelectorOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 h-12 text-sm transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="flex-1 text-left truncate">{module.label}</span>
                    {isSelected && <CheckIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (pathname.startsWith(item.path + '/') && item.path !== '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'} ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
              />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}

        {!isCollapsed && recursosItems.length > 0 && (
          <div className="pt-4 pb-2">
            <h3 className="px-3 text-xs font-semibold  uppercase tracking-wider">
              Gestão de Recursos
            </h3>
          </div>
        )}

        {recursosItems.map((item) => {
          const isActive = pathname === item.path || (pathname.startsWith(item.path + '/') && item.path !== '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'} ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
              />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {isCollapsed ? (
            <CaretRightIcon className="h-5 w-5" />
          ) : (
            <>
              <CaretLeftIcon className="h-5 w-5 mr-2" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
} 
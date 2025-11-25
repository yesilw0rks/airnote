
import React from 'react';
import { Cast, Plus, LayoutGrid, Hash, LogOut, User } from 'lucide-react';

interface SidebarProps {
  spaces: string[];
  currentSpace: string;
  onSelectSpace: (space: string) => void;
  onAddSpace: () => void;
  onSignOut: () => void;
  user?: { id: string, email?: string | null };
}

export const Sidebar: React.FC<SidebarProps> = ({
  spaces,
  currentSpace,
  onSelectSpace,
  onAddSpace,
  onSignOut,
  user
}) => {
  return (
    <div className="w-64 bg-air-surface border-r border-air-border h-screen flex flex-col flex-shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cast className="text-white" size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">airnote</span>
      </div>

      <div className="px-4 py-2 text-xs font-semibold text-air-muted uppercase tracking-wider">
        Spaces
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <button
          onClick={() => onSelectSpace('All Notes')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
            currentSpace === 'All Notes' 
              ? 'bg-air-accent/10 text-air-accent font-medium' 
              : 'text-air-muted hover:bg-air-border/50 hover:text-air-text'
          }`}
        >
          <LayoutGrid size={18} />
          All Notes
        </button>

        {spaces.map((space) => (
          <button
            key={space}
            onClick={() => onSelectSpace(space)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
              currentSpace === space 
                ? 'bg-air-accent/10 text-air-accent font-medium' 
                : 'text-air-muted hover:bg-air-border/50 hover:text-air-text'
            }`}
          >
            <Hash size={18} />
            {space}
          </button>
        ))}

        <button
          onClick={onAddSpace}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-air-muted hover:text-air-accent hover:bg-air-accent/5 transition-colors text-sm mt-2 group"
        >
          <div className="w-[18px] h-[18px] flex items-center justify-center border border-air-muted/30 rounded group-hover:border-air-accent/50">
            <Plus size={12} />
          </div>
          Create Space
        </button>
      </div>

      <div className="p-4 border-t border-air-border space-y-2">
        {user && (
           <div className="px-3 py-2 text-xs text-air-muted flex flex-col gap-1 mb-2">
             <div className="font-bold text-white flex items-center gap-2">
               <User size={12} />
               {user.email ? user.email.split('@')[0] : 'User'}
             </div>
             <div className="opacity-50 truncate">{user.email || user.id}</div>
           </div>
        )}
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-air-muted hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

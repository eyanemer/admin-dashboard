import React from 'react';

/**
 * Spinner de chargement global ou local.
 */
const Loader = ({ fullScreen }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
      <p className="text-sm font-medium text-slate-500">Chargement...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;

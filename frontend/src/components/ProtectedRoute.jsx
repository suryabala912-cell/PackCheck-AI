import React from 'react';

export default function ProtectedRoute({ currentUser, allowedRoles, children, onNavigateLogin }) {
  if (!currentUser) {
    if (onNavigateLogin) {
      onNavigateLogin();
    }
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = currentUser.role || 'ENFORCEMENT_OFFICER';
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="max-w-xl mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-3">
          <h2 className="text-lg font-bold text-rose-400">Access Denied (403 Forbidden)</h2>
          <p className="text-xs text-slate-400">
            Your current account role (<strong>{userRole}</strong>) does not have authorization to view this page.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
}

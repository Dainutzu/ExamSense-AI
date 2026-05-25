import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}

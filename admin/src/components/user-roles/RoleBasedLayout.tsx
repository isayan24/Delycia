import { UI_ACCESS } from "./roleBasedAccess";
import { useUserRole } from "./useUserRole";
import NetworkOfflineNotification from "../common/NetworkOfflineNotification";

/**
 * Layout wrapper that conditionally renders sidebar and header based on role
 */
interface RoleBasedLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  minimalHeader?: React.ReactNode;
}

export function RoleBasedLayout({
  children,
  sidebar,
  header,
  minimalHeader,
}: RoleBasedLayoutProps) {
  const { userRole } = useUserRole();

  if (!userRole) {
    return <>{children}</>;
  }

  const roleId = userRole.id;

  // Determine what UI components to show
  const showSidebar =
    UI_ACCESS.sidebar.customer.includes(roleId) ||
    UI_ACCESS.sidebar.delivery.includes(roleId) ||
    UI_ACCESS.sidebar.management.includes(roleId);

  const showFullHeader = UI_ACCESS.header.full.includes(roleId);
  const showMinimalHeader = UI_ACCESS.header.minimal.includes(roleId);

  return (
    <div className="min-h-screen bg-gray-50">
      <NetworkOfflineNotification />
      {/* Header */}
      {showFullHeader && header}
      {showMinimalHeader && (minimalHeader || header)}

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && sidebar && (
          <aside className="w-64 min-h-screen bg-white shadow-sm">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${showSidebar ? "ml-0" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

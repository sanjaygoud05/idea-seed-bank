import { Leaf, LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/common/NavLink';
import { NAV_ITEMS } from '@/constants/navigation';
import { useAuth } from '@/hooks/useAuth';

export function AppSidebar() {
  const { user, signOut } = useAuth();
  return (
    <Sidebar className="bg-sidebar-background">
      <SidebarHeader className="h-14 px-4 flex items-center justify-start border-b border-sidebar-border w-full">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground leading-tight">EcoTwin AI</h1>
            <p className="text-xs text-muted-foreground leading-tight">Sustainability Intelligence</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-5">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {NAV_ITEMS.map((item, index) => (
                <SidebarMenuItem
                  key={item.title}
                  className="animate-slide-in-left opacity-0 [animation-fill-mode:forwards] border-b border-sidebar-border m-0 p-0"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <SidebarMenuButton asChild className="h-10 m-0 p-0">
                    <NavLink
                      to={item.url}
                      className="flex items-center justify-start gap-3 px-5 h-10 w-full rounded-none text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {user && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground truncate px-2">{user.email}</p>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-2 px-2 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

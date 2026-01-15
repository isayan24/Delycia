import {
  Home,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "@/hooks/usePathname";
import {
  SidebarGroup,  
  SidebarMenu, 
  useSidebar,
} from "@/components/ui/sidebar";
// import { categoryLinks } from "@/data/categoryLinks";
import SidebarItem from "./SidebarItem";
// import CollapsableCategory from "../../navigation/CollapsableCategory";

export function AdminNavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon | any;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const { open, setOpen,toggleSidebar } = useSidebar(); 

  // TODO: change this categories from the categoryItem.ts
  return (
    <SidebarGroup>
      <div className="flex items-center gap-2 w-full px-2 py-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md cursor-pointer"
           onClick={toggleSidebar}>
        <ChevronRight className={`h-5 w-5 pl-1 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
        {open && <span className="text-sm">Collapse</span>}
      </div>
      <SidebarMenu>
        {items.map((category) => (
          <SidebarItem
            key={category.title}
            title={category.title}
            isActive={pathname === category.url}
            url={category.url}
            icon={category.icon || Home}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
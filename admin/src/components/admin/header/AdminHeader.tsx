 
import { useRoleBasedUI } from "@/components/user-roles/useRoleBasedUI";
import { RestaurantDropdown } from "./RestaurantDropdown";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AdminHeader() {  
  const { getHeaderType } = useRoleBasedUI();
  const isMobile = useIsMobile();
 
  
  return (
    <header className="adminHeader flex items-center justify-between bg-[#ffffffd6] backdrop-blur-sm overflow-x-auto border-b  px-[1rem] py-[2rem] overflow-y-hidden">
      
      <section className={`${getHeaderType == "full" && isMobile && "ml-[2rem]"} w-[6rem] shrink-0`}>
        <img src="/delycia-full.png" alt="logo" className="w-full" />
      </section>

      <section className="flex items-center gap-2">
        {/* <div>
          <Bell/>
        </div>
        <div>
          <Settings/>
        </div> */}
        {/* <div className="w-[6rem] justify-center flex">
          <Select defaultValue="online">
            <SelectTrigger className="w-fit">
              <SelectValue className={``} placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem> 
            </SelectContent>
          </Select>
        </div> */}
        <RestaurantDropdown/>
        <div>
        {/* <ProfileHeader user={userData} /> */}
        </div>
      </section>
    </header>
  );
}

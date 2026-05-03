import { usePopover } from '@hooks/usePopover';
import { UserIcon, SignOutIcon } from "@icons";
import useAuth from "@providers/AuthContext";


const UserMenu = () => {
  const { popovers, togglePopover } = usePopover();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div className="navbar-user relative flex flex-row justify-center items-center gap-4">
    <button className="p-0 bg-transparent popover-button" id="user-menu-button" onClick={() => togglePopover("user-menu")}>
      <UserIcon className="text-secondary bg-surface-raised rounded-full p-2" height="44px" width="44px" />
    </button>

    {popovers["user-menu"] && (
    <div className="popover flex flex-col gap-4 absolute right-0 top-full mt-6 w-48 bg-surface-raised p-4 rounded-2xl shadow-lg z-50">
      <p className="type-label-md text-white">Hello, {user.firstName}!</p>
      <ul className="flex flex-col gap-2">
      <li className="type-label-sm block w-full text-left text-text-default">Profile</li>
      <li className="type-label-sm block w-full text-left text-text-default">Settings</li>
      <li className="type-label-sm block w-full text-left text-text-default">Account</li>
      </ul>
      <button className="type-label-sm block w-full text-text-default" onClick={handleLogout}>
      Sign Out
      <SignOutIcon className="inline-block ml-2" height={16} width={16} />
      </button>
    </div>
    )}

    </div>
  )
}

export default UserMenu;
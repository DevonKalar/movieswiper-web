import { Link, NavLink } from "react-router-dom";
import useAuth from "@providers/AuthContext";
import Modal from "@components/common/Modal";
import SignUpForm from "@components/auth/SignUpForm";
import LoginForm from "@components/auth/LoginForm";
import UserMenu from "@components/auth/UserMenu";
import { usePopover } from "@hooks/usePopover";
import { SignOutIcon } from "@icons";

const Header = () => {
    const { isAuthenticated, isGuest, logout, user } = useAuth();
    const { popovers, togglePopover } = usePopover();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    return (

        <header className="flex flex-row justify-center items-center min-h-16 p-4">
            {/* Desktop */}
            <div className="hidden md:grid w-full max-w-7xl grid-cols-[270px_1fr_270px] items-center">
                <Link to="/" className="home-link">
                    <h1 className="type-display-sm text-white m-0">MovieSwiper</h1>
                </Link>
                <div className="menu-wrapper flex flex-row justify-center gap-8">
                    <nav className="flex flex-row gap-4 justify-center items-center">
                        <NavLink to="/" className="nav-link text-white">
                            Discover
                        </NavLink>
                        <NavLink to="/watchlist" className="nav-link text-white">
                            Watchlist
                        </NavLink>
                    </nav>
                </div>
                {isAuthenticated ? (
                    <div className="flex justify-end">
                        <UserMenu />
                    </div>
                ) : (
                    <div className="navbar-buttons-wrapper flex flex-row justify-end gap-2">
                        <Modal buttonText="Login"
                            buttonClass="border-2 bg-transparent border-primary-muted text-primary-muted"
                            modalClass="flex flex-col justify-center gap-4 items-between"
                        >
                            <LoginForm />
                        </Modal>
                        <Modal
                            buttonText="Sign Up"
                            modalClass="flex flex-col justify-center gap-4 items-between w-full max-w-lg"
                        >
                            <SignUpForm />
                        </Modal>
                    </div>
                )}
            </div>
            {/* Mobile */}
            <div className="mobile-header relative flex flex-row justify-between items-center w-full md:hidden">
                <Link to="/" className="home-link">
                    <h1 className="text-white m-0 type-heading-lg">MovieSwiper</h1>
                </Link>
                <button className={`${popovers["mobile-menu"] ? "bg-primary-hover" : ""} mobile-menu-button popover-button`} id="mobile-menu-button" onClick={() => togglePopover("mobile-menu")}>
                    Menu
                </button>
                {popovers["mobile-menu"] && (
                    <div className="mobile-collapse-menu absolute right-0 top-full w-full bg-surface-raised p-4 mt-4 rounded-2xl flex flex-col gap-2 z-50 popover">
                        <nav className="flex flex-col gap-2 justify-center items-end px-4 py-2">
                            <NavLink to="/" onClick={() => togglePopover("mobile-menu")} className="nav-link text-white">
                                Discover
                            </NavLink>
                            <NavLink to="/watchlist" onClick={() => togglePopover("mobile-menu")} className="nav-link text-white">
                                Watchlist
                            </NavLink>
                            {isAuthenticated && (
                                <>
                                    <hr className="border-1 w-full border-border-strong" />
                                    <NavLink to="/account" className="nav-link text-white">
                                        Account
                                    </NavLink>
                                </>
                            )}
                        </nav>
                        {isAuthenticated ? (
                            <>
                                <p className="type-label-md self-center">Logged in as {isGuest ? 'Guest' : user.firstName}, not you?</p>
                                <button className="type-label-sm block w-full text-text-default" onClick={handleLogout}>
                                    Sign Out
                                    <SignOutIcon className="inline-block ml-2" height={16} width={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Modal buttonText="Login"
                                    buttonClass="border-2 bg-transparent border-primary-muted text-primary-muted"
                                    modalClass="flex flex-col justify-center gap-4 items-between w-full max-w-lg mx-4"
                                >
                                    <LoginForm />
                                </Modal>
                                <Modal
                                    buttonText="Sign Up"
                                    modalClass="flex flex-col justify-center gap-4 items-between w-full max-w-lg mx-4"
                                >
                                    <SignUpForm />
                                </Modal>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;

import { FaChevronLeft, FaSignOutAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

type FooterProps = {
    onToggle: () => void;
    collapsed: boolean;
};

export default function Footer({ onToggle, collapsed }: FooterProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profilePicture } = useAuth();

    function logout() {
        navigate("/login")
    }

    return (
        <div className="flex flex-col gap-2 select-none">
            {collapsed && (
                <div
                    onClick={() => logout()}
                    className="flex items-center cursor-pointer transition duration-150 half-rounded
                    border border-gray-500 bg-white shadow-sm justify-center px-2 py-3 hover:bg-gray-200 hover:text-red-400"
                >
                    <div className="text-xl">
                        <FaSignOutAlt />
                    </div>
                </div>
            )}

            <div
                className={`flex items-center h-full text-sm transition-all
            ${collapsed ? "justify-center" : "justify-start gap-4"}`}
            >
                <div
                    onClick={() => navigate("/admin/profile" + location.search)}
                    className="rounded-full h-10 w-10 bg-gray-200 shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition"
                >
                    {profilePicture && (
                        <img src={profilePicture} alt="User Image" className="w-full h-full object-cover rounded-full" />
                    )}
                </div>

                {!collapsed && (
                    <div className="flex flex-col justify-between grow h-full select-none">
                        <div
                            onClick={() => navigate("/admin/profile")}
                            className="cursor-pointer hover:text-accent transition"
                        >
                            {user?.username}
                        </div>
                        <div
                            onClick={() => logout()}
                            className="hover:text-red-500 transition cursor-pointer"
                        >
                            Logout
                        </div>
                    </div>
                )}

                <div
                    onClick={onToggle}
                    className="h-full cursor-pointer hover:text-black transition w-12 flex items-center justify-center"
                >
                    <FaChevronLeft
                        className={`transition-transform duration-300 ${
                            collapsed ? "rotate-180" : ""
                        }`}
                    />
                </div>
            </div>
        </div>


    );
}
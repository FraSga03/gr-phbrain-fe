import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext.tsx";

export default function Profile() {
    const { user, profilePicture } = useAuth();

    return (
        <div className="flex flex-col gap-6 select-none">
            <Card title={`${user?.username}'s profile`}>
                <div className="flex flex-col">
                    <div className="flex items-center gap-6">
                        <div
                            className="rounded-full h-18 w-18 bg-gray-200 shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition"
                        >
                            {profilePicture && (
                                <img src={profilePicture} alt="User Image" className="w-full h-full object-cover rounded-full" />
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                        <span className="text-2xl font-semibold text-accent">
                            {user?.username}
                        </span>
                            <span className="text-sm text-gray-500">
                            ID: {user?.id}
                        </span>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button>Change password</button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext.tsx";
import { useState } from "react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import ChangePasswordForm from "../../components/ChangePasswordForm";

export default function Profile() {
    const { user, profilePicture } = useAuth();
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);

    return (
        <div className="flex flex-col gap-3 select-none">
            <Card title={`${user?.username}'s profile`}>
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <div
                            className="rounded-full h-18 w-18 bg-gray-200 shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition"
                        >
                            {profilePicture && (
                                <img src={profilePicture} alt="User Image" className="w-full h-full object-cover rounded-full" />
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-2xl font-semibold text-accent">
                                {user?.username}
                            </span>
                                <span className="text-sm text-gray-500">
                                ID: {user?.id}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => setIsChangePasswordOpen(true)}>
                            Change password
                        </Button>
                    </div>
                </div>
            </Card>

            <Modal
                open={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
                title="Change password"
            >
                <ChangePasswordForm
                    onSuccess={() => setIsChangePasswordOpen(false)}
                    onCancel={() => setIsChangePasswordOpen(false)}
                />
            </Modal>
        </div>
    );
}

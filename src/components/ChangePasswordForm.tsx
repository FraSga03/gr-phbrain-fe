import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { type ChangePasswordForm, changePasswordSchema } from "../schemas/ChangePasswordForm.ts";
import { changePassword } from "../service/AuthService.ts";
import { withSubmitLock } from "../utils/withSubmitLock.ts";
import Input from "./InputField";
import Button from "./Button";

type ChangePasswordFormProps = {
    onSuccess?: () => void;
    onCancel?: () => void;
};

export default function ChangePasswordFormComponent({ onSuccess, onCancel }: ChangePasswordFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordForm>({
        resolver: zodResolver(changePasswordSchema),
        mode: "onSubmit",
    });

    const onSubmit = withSubmitLock(async (data: ChangePasswordForm) => {
        await changePassword(data.currentPassword, data.newPassword).then(() => {
            toast.success("Password updated!");
            reset();
            onSuccess?.();
        });
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <Input
                label="Current password"
                type="password"
                placeholder="Enter your current password"
                error={errors.currentPassword}
                registration={register("currentPassword")}
            />
            <Input
                label="New password"
                type="password"
                placeholder="Enter your new password"
                error={errors.newPassword}
                registration={register("newPassword")}
            />
            <Input
                label="Confirm new password"
                type="password"
                placeholder="Repeat your new password"
                error={errors.confirmPassword}
                registration={register("confirmPassword")}
            />

            <div className="flex justify-end gap-2 mt-2">
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Loading..." : "Update"}
                </Button>
            </div>
        </form>
    );
}

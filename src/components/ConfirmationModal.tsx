import type { ReactNode } from "react";
import Modal from "./Modal.tsx";
import Button from "./Button.tsx";

type ConfirmationModalProps = {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    width?: string;
    children: ReactNode;
};

export default function ConfirmationModal({
    open,
    onCancel,
    onConfirm,
    title = "Are you sure?",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    width,
    children,
}: ConfirmationModalProps) {
    return (
        <Modal open={open} onClose={onCancel} title={title} width={width}>
            <div className="flex flex-col gap-4">
                <div>{children}</div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button type="button" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

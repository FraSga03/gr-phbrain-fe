import type { ReactNode } from "react";
import ReactModal from "react-modal";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    width?: string;
    children: ReactNode;
};

ReactModal.setAppElement("#root");

export default function Modal({ open, onClose, title, width = "32rem", children }: ModalProps) {
    return (
        <ReactModal
            isOpen={open}
            onRequestClose={onClose}
            shouldCloseOnEsc
            shouldCloseOnOverlayClick
            ariaHideApp={false}
            overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            className="bg-white rounded shadow-lg max-w-[90vw] max-h-[90vh] overflow-auto outline-none"
            style={{ content: { width } }}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="text-accent text-xl font-semibold">{title}</div>
            </div>
            <div className="p-4">{children}</div>
        </ReactModal>
    );
}

import { FaSpinner } from "react-icons/fa";

export default function WorkInProgress() {

    return (
        <div className="h-full text-4xl font-bold flex flex-col gap-5 justify-center items-center">
            <span className="text-accent">WORK IN PROGRESS</span>

            <FaSpinner className="animate-spin duration-1000" />
        </div>
    );
}
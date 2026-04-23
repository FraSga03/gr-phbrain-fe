export default function Spinner() {
    return (
        <div className="flex items-center justify-center h-screen w-full bg-accent-bg">
            <div className="h-10 w-10 rounded-full border-4 bg-accent-bg border-t-accent animate-spin duration-1000 border-dashed" />
        </div>
    );
}

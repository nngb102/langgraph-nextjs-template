interface MessageInputProps {
    isLoading: boolean;
    onSubmit: (message: string) => void;
    onStop: () => void;
}

export function MessageInput({ isLoading, onSubmit, onStop }: MessageInputProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const message = new FormData(form).get("message") as string;
        if (!message.trim()) return;
        form.reset();
        onSubmit(message);
    };

    return (
        <div className="border-t bg-white p-4 shadow-sm">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    name="message"
                    placeholder="Type your message..."
                    className="flex-1 rounded-lg border-2 border-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 shadow-sm text-gray-700 placeholder-gray-500"
                    disabled={isLoading}
                />
                {isLoading ? (
                    <button
                        type="button"
                        onClick={onStop}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
                    >
                        Stop
                    </button>
                ) : (
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
                    >
                        Send
                    </button>
                )}
            </form>
        </div>
    );
}

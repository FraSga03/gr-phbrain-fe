export function withSubmitLock<T>(fn: (data: T) => Promise<void>) {
    let running = false;

    return async (data: T) => {
        if (running) return;

        running = true;
        try {
            await fn(data);
        } finally {
            running = false;
        }
    };
};
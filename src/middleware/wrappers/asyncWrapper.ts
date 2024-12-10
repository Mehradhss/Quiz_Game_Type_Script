type AsyncFunction = (...args: any[]) => Promise<void>;

/**
 * Asynchronous wrapper function to handle errors better.
 * @param func The asynchronous function to be wrapped.
 * @returns A wrapped asynchronous function with enhanced error handling.
 */
export default function asyncWrapper(func: AsyncFunction): AsyncFunction {
    return async (...args: any[]) => {
        try {
            await func(...args);
        } catch (error: any) {
            console.error('An error occurred:', error)
            throw error;
        }
    }
}
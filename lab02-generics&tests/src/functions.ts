import { delay } from './delay';

// 3.4
function getRandomDelay(): number {
    return Math.floor(Math.random() * 100) + 50;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
}

function getUser(id: string): UserProfile {
    return {id, name: `User${id}`, email: `user${id}@example.com`};
}

export async function fetchUserProfiles(userIds: string[]): Promise<UserProfile[]> {
    try {
        if (userIds.length === 0) return [];

        const promises: Promise<UserProfile>[] = [];

        for (const id of userIds) {
            promises.push(
                (async () => {
                    await delay(getRandomDelay());
                    return getUser(id);
                })()
            )
        }

        return Promise.all(promises);

    } catch {
        return [];
    }
}


//3.5
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    let attempts: number = 0
    let lastError: unknown;
    const retryCountMs: number = 100;

    while (attempts < maxRetries) {
        attempts++;
        console.log(`Cпроба ${attempts}...`);

        try {
            return await operation();
        } catch (error) {
            lastError = error

            if (attempts < maxRetries) {
                console.log(`Помилка, чекаємо ${retryCountMs}`);
                await delay(retryCountMs);
            }
        }
    }

    throw lastError;
}


//3.6
function batchArray<T>(arr: T[], batchSize: number):T[][] {
    let results: T[][] = [];

    while (arr.length) {
        results.push(arr.splice(0, batchSize));
    }

    return results;
}

export async function processInBatches<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
    const batches = batchArray(items, batchSize);
    let results: R[] = [];

    for (const batch of batches) {
        results.push(...await processor(batch));
    }

    return results;
}

//3.7
export async function raceWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T>{
    return Promise.race([
        promise,
        new Promise<T>((_, rej) =>
            setTimeout(() => rej(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}
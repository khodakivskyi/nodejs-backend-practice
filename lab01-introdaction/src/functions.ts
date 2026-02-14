export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


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
export async function retryOperation(
    operation: () => Promise<unknown>,
    maxRetries: number = 3
): Promise<unknown> {
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

    return lastError;
}


//3.6
function batchArray(arr: number[], batchSize: number) {
    let results = [];

    while (arr.length) {
        results.push(arr.splice(0, batchSize));
    }

    return results;
}

export async function processInBatches(
    items: number[],
    batchSize: number,
    processor: (batch: number[]) => Promise<number[]>
): Promise<number[]> {
    const batches = batchArray(items, batchSize);
    let results: number [][] = [];

    for (const batch of batches) {
        results.push(await processor(batch));
    }

    return results.flat();
}

//3.7
export async function raceWithTimeout(
    promise: Promise<unknown>,
    timeoutMs: number
): Promise<unknown>{
    return Promise.race([
        promise,
        new Promise<unknown>((_, rej) =>
            setTimeout(() => rej(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}
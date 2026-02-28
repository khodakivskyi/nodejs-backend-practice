jest.mock('./delay', () => ({
    delay: jest.fn(() => Promise.resolve()),
}));

import {fetchUserProfiles, processInBatches, raceWithTimeout, retryOperation} from './functions';
import {delay} from './delay';

describe('fetchUserProfiles', () => {
    test('повертає пустий масив, якщо userIds порожній', async () => {
        const result = await fetchUserProfiles([]);
        expect(result).toEqual([]);
    });

    test('повертає масив UserProfile для переданих id', async () => {
        const userIds = ['1', '2', '5'];
        const result = await fetchUserProfiles(userIds);

        expect(result).toHaveLength(3);
        expect(result).toEqual([
            {id: '1', name: 'User1', email: 'user1@example.com'},
            {id: '2', name: 'User2', email: 'user2@example.com'},
            {id: '5', name: 'User5', email: 'user5@example.com'},
        ]);
    });

    test('коректно обробляє дублікати userIds', async () => {
        const userIds = ['1', '1', '5'];

        const result = await fetchUserProfiles(userIds);

        expect(result).toHaveLength(3);
        expect(result.map(u => u.id)).toEqual(['1', '1', '5']);
    });
});

beforeEach(() => {
    (delay as jest.Mock).mockClear();
});

describe('retryOperation', () => {
    test('повертає результат з першої спроби', async () => {
        const operation: jest.Mock<Promise<string>, []> = jest.fn<Promise<string>, []>()
            .mockResolvedValue('success');

        const result = await retryOperation(operation);

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
        expect(delay).not.toHaveBeenCalled();
    });

    test('успішно виконується після кількох помилок', async () => {
        const operation: jest.Mock<Promise<string>, []> = jest.fn<Promise<string>, []>()
            .mockRejectedValueOnce(new Error('error 1'))
            .mockRejectedValueOnce(new Error('error 2')).mockResolvedValue('success');

        const result = await retryOperation(operation);

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(3);
        expect(delay).toHaveBeenCalledTimes(2);
    });

    test('кидає помилку після перевищення maxRetries', async () => {
        const error = new Error('error');
        const operation: jest.Mock<Promise<string>, []> = jest.fn<Promise<string>, []>()
            .mockRejectedValue(error);

        await expect(retryOperation(operation, 3)).rejects.toThrow(error);

        expect(operation).toHaveBeenCalledTimes(3);
        expect(delay).toHaveBeenCalledTimes(2);
    });

    test('не робить retry, якщо maxRetries = 1', async () => {
        const error = new Error('fail');
        const operation: jest.Mock<Promise<string>, []> = jest.fn<Promise<string>, []>()
            .mockRejectedValue(error);

        await expect(retryOperation(operation, 1)).rejects.toThrow(error);

        expect(operation).toHaveBeenCalledTimes(1);
        expect(delay).not.toHaveBeenCalled();
    });
});

beforeEach(() => {
    (delay as jest.Mock).mockClear();
});

describe('processInBatches', () => {
    test('обробляє всі елементи послідовно', async () => {
        const processor: jest.Mock<Promise<number[]>, [number[]]> = jest.fn<Promise<number[]>, [number[]]>(
            async (batch) => batch.map(x => x * 2)
        );
        const items = [1, 2, 3, 4, 5, 6];
        const result = await processInBatches(items, 2, processor);

        expect(result).toEqual([2, 4, 6, 8, 10, 12]);
        expect(processor).toHaveBeenCalledTimes(3);

        const firstCall = processor.mock.calls[0];
        expect(firstCall![0]).toEqual([1, 2]);

        const lastCall = processor.mock.calls[processor.mock.calls.length - 1];
        expect(lastCall![0]).toEqual([5, 6]);
    });

    test('працює з порожнім масивом', async () => {
        const processor: jest.Mock<Promise<number[]>, [number[]]> = jest.fn<Promise<number[]>, [number[]]>();
        const result = await processInBatches([], 2, processor);

        expect(result).toEqual([]);
        expect(processor).not.toHaveBeenCalled();
    });

    test('коректно обробляє батчі не повного розміру', async () => {
        const processor: jest.Mock<Promise<number[]>, [number[]]> = jest.fn<Promise<number[]>, [number[]]>(
            async (batch) => batch.map(x => x * 2)
        );
        const items = [1, 2, 3, 4, 5];
        const result = await processInBatches(items, 2, processor);

        expect(result).toEqual([2, 4, 6, 8, 10]);
        expect(processor).toHaveBeenCalledTimes(3);
    });
});

describe('raceWithTimeout', () => {
    test('успішно повертає результат, якщо promise встигає', async () => {
        const promise = Promise.resolve('success');

        const resultPromise = await raceWithTimeout(promise, 2000);
        expect(resultPromise).toBe('success');
    });

    test('викидає помилку timeout, якщо promise не встигає', async () => {
        const promise = new Promise<string>(res => setTimeout(() => res('success'), 2000));

        const resultPromise = raceWithTimeout(promise, 1000);
        await expect(resultPromise).rejects.toThrow(Error);
    });
});
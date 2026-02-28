import { delay } from './delay';

jest.useFakeTimers();

describe('delay', ()=>{
    test('delay виконує setTimeout на потрібний час',  async ()=>{
        const promise = delay(1000);
        jest.advanceTimersByTime(1000);
        await expect(promise).resolves.toBeUndefined();
    });
});
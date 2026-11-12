

jest.mock('../../src/persistence', () => ({
    removeItem: jest.fn(),
    getItem: jest.fn(),
}));
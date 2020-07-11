Object.defineProperty(document, "head", {
    value: {
        appendChild: jest.fn()
    }
});

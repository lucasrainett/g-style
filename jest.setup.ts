Object.defineProperty(document, "head", {
    value: {
        appendChild: jest.fn()
    }
});

Object.defineProperty(document, "querySelector", {
	value:  jest.fn()
});

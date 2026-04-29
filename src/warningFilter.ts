if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;

  console.error = (...args) => {
    if (typeof args[0] === 'string') {
      if (
        args[0].includes('findDOMNode is deprecated') ||
        args[0].includes('Instance created by `useForm` is not connected')
      ) {
        return;
      }
    }
    originalError.apply(console, args);
  };
}

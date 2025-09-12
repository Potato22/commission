export const devConsole: (...args: any[]) => void = import.meta.env.DEV
    ? console.log.bind(window.console)
    : () => {};
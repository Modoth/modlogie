export default interface IAsyncTextReader {
    size(): Promise<number>;
    read(): Promise<[string, boolean]>;
    cache(): string
}
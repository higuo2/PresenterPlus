// The TensorFlow hand-pose package imports this symbol for its optional
// MediaPipe runtime. PresenterPlus uses the package's TFJS + WASM runtime,
// so this compatibility export is never instantiated at runtime.
export class Hands {
  constructor(_options: {
    locateFile?: (file: string, prefix: string) => string
  }) {}

  setOptions(_options: Record<string, unknown>) {}

  onResults(_callback: (results: unknown) => void) {}

  send(_input: { image: unknown }) {
    return Promise.resolve()
  }

  close() {}

  reset() {}

  initialize() {
    return Promise.resolve()
  }
}

import { Uri, languages } from 'monaco-editor-core'
import editorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker'
import * as onigasm from 'onigasm'
import onigasmWasm from 'onigasm/lib/onigasm.wasm?url'
import { getOrCreateModel } from './utils'
import vueWorker from './vue.worker?worker'

let initted = false
export function initMonaco() {
  if (initted) { return }
  loadMonacoEnv()
  loadWasm()
  initted = true
}

export function loadWasm() {
  return onigasm.loadWASM(onigasmWasm)
}

export class WorkerHost {
  onFetchCdnFile(uri: string, text: string) {
    getOrCreateModel(Uri.parse(uri), undefined, text)
  }
}

export interface WorkerMessage {
  event: 'init'
  tsVersion: string
  tsLocale?: string
}

export function loadMonacoEnv() {
  // eslint-disable-next-line no-restricted-globals
  ;(self as any).MonacoEnvironment = {
    async getWorker(_: any, label: string) {
      if (label === 'vue') {
        // eslint-disable-next-line new-cap
        const worker = new vueWorker()
        const init = new Promise<void>((resolve) => {
          worker.addEventListener('message', (data) => {
            if (data.data === 'inited') {
              resolve()
            }
          })
        })
        await init
        return worker
      }
      // eslint-disable-next-line new-cap
      return new editorWorker()
    },
  }
  languages.register({ id: 'vue', extensions: ['.vue'] })
  languages.register({ id: 'javascript', extensions: ['.js'] })
  languages.register({ id: 'typescript', extensions: ['.ts'] })
  languages.register({ id: 'json', extensions: ['.json'] })
}

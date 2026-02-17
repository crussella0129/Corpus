import { ElectronAPI } from '@electron-toolkit/preload'
import type { CorpusApi } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: CorpusApi
  }
}

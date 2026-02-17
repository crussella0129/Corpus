import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { processReview, getDueCards, undoReview } from '../fsrs/scheduler'
import type { Rating } from '../../shared/types'

export function registerReviewHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.REVIEW_PROCESS_RATING,
    (_event, cardId: number, rating: Rating, durationMs: number) => {
      return processReview(cardId, rating, durationMs)
    }
  )

  ipcMain.handle(IPC_CHANNELS.REVIEW_GET_SESSION, (_event, limit: number = 50) => {
    return getDueCards(limit)
  })

  ipcMain.handle(IPC_CHANNELS.REVIEW_UNDO, (_event, cardId: number) => {
    return undoReview(cardId)
  })
}

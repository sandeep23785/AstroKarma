import { create } from 'zustand'

interface ToastState {
  message: string | null
  flash: (message: string) => void
}

let timer: ReturnType<typeof setTimeout> | undefined

export const useToast = create<ToastState>((set) => ({
  message: null,
  flash: (message) => {
    set({ message })
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => set({ message: null }), 2200)
  },
}))

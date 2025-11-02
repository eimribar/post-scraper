"use client"

import React, { useEffect, useRef, useState } from "react"
import { Upload } from "lucide-react"

export type LinkedInUrlInputProps = {
  onSubmit?: (url: string) => void
  onBatchUpload?: () => void
  isProcessing?: boolean
}

export function LinkedInUrlInput({
  onSubmit,
  onBatchUpload,
  isProcessing = false
}: LinkedInUrlInputProps) {
  const [prompt, setPrompt] = useState("")

  // Typing placeholder animation (runs only when input is empty)
  const basePlaceholder = "Paste your"
  const suggestionsRef = useRef<string[]>([
    " LinkedIn post URL",
    " competitor's post URL",
    " colleague's post URL",
    " company's post URL",
    " influencer's post URL",
    " potential client's post URL",
    " industry leader's post URL",
  ])
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState<string>(basePlaceholder)
  const typingStateRef = useRef({
    suggestionIndex: 0,
    charIndex: 0,
    deleting: false,
    running: true,
  })
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    typingStateRef.current.running = true
    const typeSpeed = 70 // ms per char
    const deleteSpeed = 40
    const pauseAtEnd = 1200 // pause after full word
    const pauseBetween = 500 // pause after clearing

    function schedule(fn: () => void, delay: number) {
      const id = window.setTimeout(fn, delay)
      timersRef.current.push(id)
    }

    function clearTimers() {
      for (const id of timersRef.current) window.clearTimeout(id)
      timersRef.current = []
    }

    function step() {
      if (!typingStateRef.current.running) return
      // Only animate when empty
      if (prompt !== "") {
        setAnimatedPlaceholder(basePlaceholder)
        schedule(step, 300)
        return
      }

      const state = typingStateRef.current
      const suggestions = suggestionsRef.current
      const current = suggestions[state.suggestionIndex % suggestions.length] || ""

      if (!state.deleting) {
        // typing forward
        const nextIndex = state.charIndex + 1
        const next = current.slice(0, nextIndex)
        setAnimatedPlaceholder(basePlaceholder + next)
        state.charIndex = nextIndex
        if (nextIndex >= current.length) {
          // full word typed
          schedule(() => {
            state.deleting = true
            step()
          }, pauseAtEnd)
        } else {
          schedule(step, typeSpeed)
        }
      } else {
        // deleting back to base
        const nextIndex = Math.max(0, state.charIndex - 1)
        const next = current.slice(0, nextIndex)
        setAnimatedPlaceholder(basePlaceholder + next)
        state.charIndex = nextIndex
        if (nextIndex <= 0) {
          state.deleting = false
          state.suggestionIndex = (state.suggestionIndex + 1) % suggestions.length
          schedule(step, pauseBetween)
        } else {
          schedule(step, deleteSpeed)
        }
      }
    }

    // kick off
    clearTimers()
    schedule(step, 400)
    return () => {
      typingStateRef.current.running = false
      clearTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && onSubmit) {
      onSubmit(prompt)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form
        className="flex items-center justify-center"
        onSubmit={handleSubmit}
      >
        <div className="relative w-full">
          <div className="relative rounded-2xl p-[2px] shadow-[0_1px_2px_0_rgba(0,0,0,0.06)] bg-gradient-to-br from-white/10 via-white/5 to-black/20">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={animatedPlaceholder}
              rows={5}
              disabled={isProcessing}
              className="w-full h-32 sm:h-36 resize-none rounded-2xl bg-[rgba(15,15,20,0.55)] border border-white/10 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#1f3dbc]/40 focus:border-[#1f3dbc]/40 backdrop-blur-md px-4 py-4 pr-16 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            aria-label="Submit LinkedIn URL"
            className="absolute right-3 bottom-3 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#f0f2ff] text-black hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M7 17L17 7"/>
                <path d="M7 7h10v10"/>
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Batch Upload Button */}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={onBatchUpload}
          disabled={isProcessing}
          className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
          <span>Or batch upload multiple URLs</span>
        </button>
      </div>
    </div>
  )
}

import { Circle } from './generate'

export const ImagePromise = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    let img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(img)
    img.src = src
  })
}

// Shuffle an array randomly
export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length
  let randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}

// Read as data url
export function fetchAsBlob(src: string, signal?: AbortSignal): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    fetch(src, { signal })
      .then(raw => raw.blob())
      .then(blob => resolve(blob))
      .catch(reject)
  })
}

export function overlap(c1: Circle, c2: Circle) {
  const dist = Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2))
  return dist < c1.r + c2.r
}

export function gcd(a: number, b: number) {
  a = Math.abs(a)
  b = Math.abs(b)
  if (b > a) {
    ;[b, a] = [a, b]
  }

  while (true) {
    if (b === 0) return a

    a %= b
    if (a === 0) return b

    b %= a
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

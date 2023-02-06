import { Img } from './App'
import { shuffle } from './util'

export const sizes = [
  // 17, 19, 23, 27, 28, 31, 31, 37, 37, 40, 42, 42, 42, 43, 44, 47, 47, 49, 49, 50, 50, 50, 53, 54,
  57, 58, 58, 58, 60, 60, 62, 64, 65, 66, 67, 68, 78, 80, 82, 84, 89, 90, 93, 91, 90, 87, 138, 150,
  57, 58, 58, 58, 60, 60, 62, 64, 65, 66, 67, 68, 78, 80, 82, 84, 89, 90, 93, 91, 90, 87, 138, 150,
  57, 58, 58, 58, 60, 60, 62, 64, 65, 66, 67, 68, 78, 80, 82, 84, 89, 90, 93, 91, 90, 87, 138, 150,
  300,
]

export interface MotifMap {
  circles: Circle[]
  mapSize: [number, number]
}

export interface Circle {
  id: number
  url: string
  x: number
  y: number
  r: number
}

export interface MotifMapEntry {
  id: number
  src: string
}

const MOTIF_SIZE_MULTIPLIER = 1.0
const MOTIF_DENSITY = 1.05 // >= 1.0, the smaller, the denser
const NUM_MOTIFS_TO_FETCH = -1 // -1 means all
const NUM_MOTIFS_TO_DRAW = -1 // -1 means all

export function generateMap(motifs: Img[], width: number, height: number): MotifMap {
  // randomize a number of motifs to fetch
  let selectedMotifs = motifs.filter(motif => typeof motif.url === 'string')
  selectedMotifs = shuffle(selectedMotifs)
  if (selectedMotifs.length >= NUM_MOTIFS_TO_FETCH && NUM_MOTIFS_TO_FETCH > 0)
    selectedMotifs = selectedMotifs.slice(0, NUM_MOTIFS_TO_FETCH)

  let num_motifs = motifs.length
  if (NUM_MOTIFS_TO_DRAW > 0) num_motifs = NUM_MOTIFS_TO_DRAW

  // construct fetching objects
  const entries = selectedMotifs.map(motif => {
    return {
      src: motif.url,
      id: motif.id,
    }
  })

  // generate map
  const radii = Array.from(
    { length: num_motifs }, // IMPORTANT / Number of total motifs on the map
    () => sizes[Math.floor(Math.random() * sizes.length)] * MOTIF_SIZE_MULTIPLIER, // change multiplier to generate bigger or smaller circles
  )

  // calculate rectangle size
  const radiusSqAverage = radii.reduce((p, c) => p + c * c, 0) / radii.length
  const area = num_motifs * radiusSqAverage * Math.PI * MOTIF_DENSITY
  const ratio = width / height
  const MAP_HEIGHT = Math.sqrt(area / ratio)
  const MAP_WIDTH = ratio * MAP_HEIGHT

  // generate circles
  let circles = drawCircles(radii, entries, MAP_WIDTH, MAP_HEIGHT)

  // adjust circles so that they don't overlap
  // TODO: implement positive adjustment
  const circles_: Circle[] = []
  circles.forEach(c1 => {
    circles_.forEach(c2 => {
      const dist = Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2))
      const difference = c1.r + c2.r - dist

      // if circles overlap, dynamically change their radiuses so that they don't
      if (difference > 0) {
        c1.r -= (difference * c1.r) / (c1.r + c2.r)
        c2.r -= (difference * c2.r) / (c1.r + c2.r)
      }
    })

    circles_.push(c1)
  })
  circles = circles_

  // center circles on map
  // const [centerX, centerY] = [MAP_WIDTH / 2, MAP_HEIGHT / 2]
  // circles = circles.map(c => {
  //   return {
  //     id: c.id,
  //     url: c.url,
  //     r: c.r,
  //     x: c.x - centerX,
  //     y: c.y - centerY,
  //   }
  // })

  return { circles, mapSize: [MAP_WIDTH, MAP_HEIGHT] }
}

function createGrid(columns: number, rows: number, size: number, width: number, height: number) {
  const grid = []
  let y = size / 2.0

  for (let row = 0; row < rows; row++) {
    const distanceFromTop = y
    const distanceFromBottom = height - y
    for (let col = 0; col < columns; col++) {
      const i = row * columns + col
      grid[i] = distanceFromTop < distanceFromBottom ? distanceFromTop : distanceFromBottom
    }
    y += size
  }

  let x = size / 2.0

  for (let col = 0; col < columns; col++) {
    let distanceFromLeft = x
    let distanceFromRight = width - x
    for (let row = 0; row < rows; row++) {
      let i = row * columns + col
      if (grid[i] > distanceFromLeft) {
        grid[i] = distanceFromLeft
      }
      if (grid[i] > distanceFromRight) {
        grid[i] = distanceFromRight
      }
    }
    x += size
  }

  return grid
}

function drawCircles(
  circles: number[],
  motifs: MotifMapEntry[],
  width: number,
  height: number,
): Circle[] {
  const size = Math.sqrt(Math.sqrt(width * height))
  const columns = Math.ceil(width / size)
  const rows = Math.ceil(height / size)
  const grid = createGrid(columns, rows, size, width, height)
  const circleArray = []

  circles = circles.sort() //.reverse()
  for (let circle = 0; circle < circles.length; circle++) {
    const radius = circles[circle]

    // Find gridpoint with largest distance from anything
    let i = 0
    let maxR = 0
    let maxC = 0
    let maxDist = grid[0]

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (maxDist < grid[i]) {
          maxR = row
          maxC = col
          maxDist = grid[i]
        }
        i++
      }
    }

    let x = size / 2.0 + maxC * size
    let y = size / 2.0 + maxR * size
    const idx = circle
    const motif = motifs[idx]
    const id = motif.id

    let offset = (maxDist - radius) / 100.0
    x += 0.05 * Math.random() * offset
    y += 0.05 * Math.random() * offset

    // Update Distance array with new circle;
    i = 0
    let yy = size / 2.0

    for (let r = 0; r < rows; r++) {
      let xx = size / 2.0

      for (let c = 0; c < columns; c++) {
        let d2 = (xx - x) * (xx - x) + (yy - y) * (yy - y)
        let prev2 = grid[i] + radius
        prev2 *= prev2

        if (prev2 > d2) {
          let d = Math.sqrt(d2) - radius
          if (grid[i] > d) {
            grid[i] = d
          }
        }
        xx += size
        i++
      }

      yy += size
    }

    circleArray.push({
      id,
      x,
      y,
      r: radius,
      url: motif.src,
    })
  }

  return circleArray
}

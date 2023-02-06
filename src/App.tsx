import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { generateMap } from './generate';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

interface MotifResponse {
  id: number
  CarrierMaterial: string
  Century: string
  Country: string
  Region: string
  Settlement: string
  Description: string
  ExactDate: string
  InventoryNumber: string
  Title: string
  SubTitle: string
  OriginalObjectName: string
  TimeRange: string
  SourceFileName: string
  VectorFileName: string
  OriginalAiFile: { url: string }
  OriginalObjectPhoto: PhotoResponse
  VectorizedObjectPhoto: PhotoResponse
  TagList: { Name: string; id: number }[]
  TechnicList: { Name: string; id: number }[]
}

interface PhotoResponse {
  formats: {
    large?: { url: string }
    medium?: { url: string }
    small?: { url: string }
    thumbnail?: { url: string }
  }
  url: string,
  width: number,
  height: number
}

export interface Img {
  id: number,
  url: string,
  width: number,
  height: number
}

function App() {
  const [motifs, setMotifs] = useState<Img[]>([])
  const motifMap = useMemo(() => {
    if (motifs.length == 0)
      return

    return generateMap(motifs, window.innerWidth, window.innerHeight)
  }, [motifs])
  // const containerRef = useRef<HTMLDivElement>(null)

  const fetchMotifs = async () => {
    const response = await fetch('http://localhost:1337/cards?_start=0&_limit=1000')
    const data = (await response.json()) as MotifResponse[]
    const images: Img[] = data.map(d => {
      return {
        id: d.id,
        url: 'http://localhost:1337' + d.VectorizedObjectPhoto.url,
        width: d.VectorizedObjectPhoto.width,
        height: d.VectorizedObjectPhoto.height
      }
    })
    setMotifs(images)
  }
  useEffect(() => void fetchMotifs(), [])
  
  return (motifMap &&
    <TransformWrapper centerOnInit={true} >
      <TransformComponent wrapperStyle={{ maxWidth: "100%", maxHeight: "100vh" }} >
        <div
          style={{
              position: "relative",
              width: `${motifMap.mapSize[0]}px`,
              height: `${motifMap.mapSize[1]}px`,
              border: "1px solid red"
          }}
          >
          {motifMap.circles.map(circle => (
              <div
                key={circle.id}
                style={{
                  position: "absolute",
                  left: `${circle.x - circle.r}px`,
                  top: `${circle.y - circle.r}px`,

                  cursor: "pointer",
                  borderRadius: "50%",
                  padding: "3px",
                  // background: "blue",
                  stroke: "red",
                }}
                onClick={() => console.log("clicked", circle.id)}
                >
                <img
                  data-motif-id={circle.id}
                  src={circle.url}
                  width={2 * circle.r}
                  height={2 * circle.r}
                  />
              </div>
          ))}
        </div>
      </TransformComponent>
    </TransformWrapper>
  ) || (<></>);
}
export default App;

import { useState, useEffect } from "react"
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core"
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout"

import "@react-pdf-viewer/core/lib/styles/index.css"
import "@react-pdf-viewer/default-layout/lib/styles/index.css"

const JumpToFirstMatchExample = ({ fileUrl, keyword, pageNum }) => {
  const [isDocumentLoaded, setDocumentLoaded] = useState(false)
  const handleDocumentLoad = () => setDocumentLoaded(true)

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    toolbarPlugin: {
        fullScreenPlugin: {
            // Zoom to fit the screen after entering and exiting the full screen mode
            onEnterFullScreen: (zoom) => {
                zoom(SpecialZoomLevel.PageWidth);
            },
            onExitFullScreen: (zoom) => {
                zoom(SpecialZoomLevel.PageWidth);
            },
        },
    },
});
  const { toolbarPluginInstance } = defaultLayoutPluginInstance
  const { searchPluginInstance } = toolbarPluginInstance
  const { highlight, setTargetPages } = searchPluginInstance

  setTargetPages((targetPage) => targetPage.pageIndex === pageNum-1);

  useEffect(() => {
    if (isDocumentLoaded) {
        const searchWithReducedText = async (text) => {
            var results = await highlight(text);
            var slicedTextBack = text;
            var slicedTextFront = text;
            while (results.length === 0 && slicedTextBack.length > 10){
                slicedTextBack = slicedTextBack.slice(0, -5);
                results = await highlight(slicedTextBack);
                // console.log("Reduced Text (Back):", slicedTextBack);
                // console.log("Results:", results);
            }
            while (results.length === 0 && slicedTextFront.length > 10){
                slicedTextFront = slicedTextFront.slice(5);
                results = await highlight(slicedTextFront);
                // console.log("Reduced Text (Front):", slicedTextFront);
                // console.log("Results:", results);
            }
            if (results.length > 0){
                console.log("Found a match:", results);
            }
            else {
                console.log("No match found:", results);
            }
        };
        searchWithReducedText(keyword);
    }
  }, [isDocumentLoaded, keyword]);

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.js">
        <div style={{ height: "720px" }}>
        <Viewer
            initialPage = {pageNum-1}
            fileUrl={fileUrl}
            plugins={[defaultLayoutPluginInstance, searchPluginInstance]}
            onDocumentLoad={handleDocumentLoad}
            defaultScale={SpecialZoomLevel.PageWidth}
        />
        </div>
    </Worker>
  )
}

export default JumpToFirstMatchExample

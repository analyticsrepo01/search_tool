import React, { useEffect, useState } from "react";
import PdfViewer from "./PdfViewer";
import * as pdfjsLib from "pdfjs-dist";
import 'pdfjs-dist/web/pdf_viewer.css'; 

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/build/pdf.min.js"

const Chatbot = () => {
  const pdfUrl = "https://arxiv.org/pdf/1708.08021.pdf";
  const searchText = "AVIK CHAUDHURI"; 
  const [testHighlights, setTestHighlights] = useState([]);
  const getNextId = () => String(Math.random()).slice(2)
  const pageNum = 1; 

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const newTestHighlights = [];

        // Get the specific page
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Iterate through text items on the page
        textContent.items.forEach((textItem) => {
          const text = textItem.str;

          // Check if the text contains the desired string
          if (text.includes(searchText)) {
            // Create a highlight object and add it to the newTestHighlights
            const highlight = {
              content: { text },
              position: { pageNumber: pageNum, ...textItem.transform },
              comment: { text: 'Your comment', emoji: '🔥' },
              id: getNextId(), // Generate a unique ID
            };

            newTestHighlights.push(highlight);
          }
        });

        setTestHighlights(newTestHighlights);
      } catch (error) {
        console.log('Error fetching PDF:', error);
      }
    };
    fetchPdf();
  }, [pdfUrl, pageNum]); // Include pageNum as a dependency

  return (
    <>
      <PdfViewer pdfUrl={pdfUrl} answer={searchText} pageNum={1} highlights={testHighlights} />
      <p>Loading...</p>
    </>
  );
};

export default Chatbot;

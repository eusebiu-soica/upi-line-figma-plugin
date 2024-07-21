// This shows the HTML page in "ui.html".
import * as JSZip from "jszip";
figma.showUI(__html__, { width: 450, height: 560 });

figma.on("selectionchange", async () => {
  const selection = figma.currentPage.selection;
  console.log(selection);

  if (selection.length === 1) {
    const node = selection[0];
    figma.ui.postMessage({
      type: "loading",
    });

    if (node.type) {
      try {
        const svg = await node.exportAsync({ format: "SVG" });

        function uint8ArrayToString(uintArray: Uint8Array): string {
          let decodedString = "";
          for (let i = 0; i < uintArray.length; i++) {
            decodedString += String.fromCharCode(uintArray[i]);
          }
          return decodedString;
        }

        const svgString = uint8ArrayToString(svg);
        const svgStringFormatted = "<!----- "+ node.name + " ----->" + "\n"+ svgString

        figma.ui.postMessage({
          type: "display-svg",
          svg: svgStringFormatted,
          name: node.name,
        });
      } catch (error) {
        console.error("Error exporting SVG:", error);
      }
    }
  } else if (selection.length > 1) {
    const nodes = selection;
    let concatStr = "";
    
    const zip = new JSZip();
    async function processNodes(nodes: any) {
      for (const nodeElement of nodes) {
        if (nodeElement.type) {
          try {
            const svg = await nodeElement.exportAsync({ format: "SVG" });

            function uint8ArrayToString(uintArray: Uint8Array): string {
              let decodedString = "";
              for (let i = 0; i < uintArray.length; i++) {
                decodedString += String.fromCharCode(uintArray[i]);
              }
              return decodedString;
            }

            const svgString = uint8ArrayToString(svg);
            concatStr += "<!----- "+ nodeElement.name + " ----->" + "\n"+ svgString + "\n";

            zip.file(nodeElement.name + ".svg", svgString);
            const zipContent = await zip.generateAsync({ type: "uint8array" });
            figma.ui.postMessage({
              type: "display-svg",
              svg: concatStr,
              isMultipleSelect: true,
              zip: zipContent
            });
          } catch (error) {
            console.error("Error exporting archive:", error);
          }
        }
      }
    }

    await processNodes(nodes);
  } else {
    figma.showUI(__html__, { width: 450, height: 560 });
  }
});

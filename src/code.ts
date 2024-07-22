import * as JSZip from "jszip";
figma.showUI(__html__, { width: 450, height: 560 });

function uint8ArrayToString(uintArray: Uint8Array): string {
  let decodedString = "";
  for (let i = 0; i < uintArray.length; i++) {
    decodedString += String.fromCharCode(uintArray[i]);
  }
  return decodedString;
}

async function processSingleNode(node: any) {
  try {
    console.log(node.type)
    if (!node.type) return;
    const svg = await node.exportAsync({ format: "SVG" });
    const svgString = uint8ArrayToString(svg);
    const svgStringFormatted = `<!----- ${node.name} ----->\n${svgString}`;

    figma.ui.postMessage({
      type: "display-svg",
      svg: svgStringFormatted,
      name: node.name,
    });
  } catch (error) {
    console.error("Error exporting SVG:", error);
  }
}

async function processMultipleNodes(nodes: any) {
  let concatStr = "";
  const zip = new JSZip();

  for (const nodeElement of nodes) {
    if (nodeElement.type) {
      try {
        const svg = await nodeElement.exportAsync({ format: "SVG" });
        const svgString = uint8ArrayToString(svg);
        concatStr += `<!----- ${nodeElement.name} ----->\n${svgString}\n`;

        zip.file(`${nodeElement.name}.svg`, svgString);
      } catch (error) {
        console.error("Error exporting SVG:", error);
      }
    }
  }

  const zipContent = await zip.generateAsync({ type: "uint8array" });

  figma.ui.postMessage({
    type: "display-svg",
    svg: concatStr,
    isMultipleSelect: true,
    zip: zipContent,
  });
}

figma.on("selectionchange", () => {
  figma.ui.postMessage({
    type: "loading",
  });
  const selection = figma.currentPage.selection;
  console.log(selection)
  setTimeout(async () => {
    if (selection.length === 1) {
      await processSingleNode(selection[0]);
    } else if (selection.length > 1) {
      await processMultipleNodes(selection);
    } else {
      figma.showUI(__html__, { width: 450, height: 560 });
    }
  }, 100);
});

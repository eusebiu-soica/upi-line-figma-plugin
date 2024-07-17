// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 450, height: 560 });

figma.on("selectionchange", async () => {

  const selection = figma.currentPage.selection;
  console.log(selection);

  if (selection.length > 0) {
    const node = selection[0];
    figma.ui.postMessage({
      type: "loading",
    });

    if (node.type) {
      try {
        setTimeout(async () => {
          const svg = await node.exportAsync({ format: "SVG" });
          function uint8ArrayToString(uintArray: any) {
            let decodedString = "";
            for (let i = 0; i < uintArray.length; i++) {
              decodedString += String.fromCharCode(uintArray[i]);
            }
            return decodedString;
          }

          const svgString = uint8ArrayToString(svg);

          figma.ui.postMessage({
            type: "display-svg",
            svg: svgString,
            name: node.name,
          });
        }, 100);
      } catch (error) {
        console.error("Error exporting SVG:", error);
      }
    }
  }else{
    figma.showUI(__html__, { width: 450, height: 560 });   
  }
});

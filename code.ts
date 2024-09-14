// This plugin will automatically convert all vector nodes to Figma rectangles

async function convertVectorToRectangle(node: VectorNode, cornerRadius: number): Promise<RectangleNode> {
  const rect = figma.createRectangle();
  
  // Copy properties
  Object.assign(rect, {
    x: node.x,
    y: node.y,
    opacity: node.opacity,
    blendMode: node.blendMode,
    constraints: { ...node.constraints },
    name: "Native Rectangle" // Changed this line to set the new name
  });
  
  rect.resize(node.width, node.height);
  
  // Set corner radius to the input value
  rect.cornerRadius = cornerRadius;
  
  // Copy fills, strokes, and effects
  ['fills', 'strokes', 'effects'].forEach(prop => {
    if (node[prop].length > 0) {
      rect[prop] = JSON.parse(JSON.stringify(node[prop]));
    }
  });
  
  if (node.strokes.length > 0) {
    rect.strokeWeight = node.strokeWeight;
    rect.strokeAlign = node.strokeAlign;
  }
  
  // Replace the original node
  node.parent?.insertChild(node.parent.children.indexOf(node), rect);
  node.remove();
  
  return rect;
}

async function convertVectorsWithoutStrokes(frame: FrameNode, cornerRadius: number): Promise<number> {
  let count = 0;
  for (const node of frame.findAll(n => n.type === "VECTOR" && n.strokes.length === 0)) {
    await convertVectorToRectangle(node as VectorNode, cornerRadius);
    count++;
  }
  return count;
}

// Main execution
figma.showUI(__html__);

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'run-plugin') {
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      const selectedNodes = figma.currentPage.selection;
      if (selectedNodes.length !== 1 || selectedNodes[0].type !== "FRAME") {
        throw new Error("Please select a single frame");
      }
      const count = await convertVectorsWithoutStrokes(selectedNodes[0] as FrameNode, msg.cornerRadius);
      figma.closePlugin(`Converted ${count} vectors without strokes to rectangles.`);
    } catch (error) {
      figma.closePlugin(`Error: ${error.message}`);
    }
  }
};

figma.showUI(__html__, {
  width: 300,
  height: 250,
  title: "Vector to Rectangles"
});
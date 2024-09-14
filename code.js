"use strict";
// This plugin will automatically convert all vector nodes to Figma rectangles
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function convertVectorToRectangle(node, cornerRadius) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const rect = figma.createRectangle();
        // Copy properties
        Object.assign(rect, {
            x: node.x,
            y: node.y,
            opacity: node.opacity,
            blendMode: node.blendMode,
            constraints: Object.assign({}, node.constraints),
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
        (_a = node.parent) === null || _a === void 0 ? void 0 : _a.insertChild(node.parent.children.indexOf(node), rect);
        node.remove();
        return rect;
    });
}
function convertVectorsWithoutStrokes(frame, cornerRadius) {
    return __awaiter(this, void 0, void 0, function* () {
        let count = 0;
        for (const node of frame.findAll(n => n.type === "VECTOR" && n.strokes.length === 0)) {
            yield convertVectorToRectangle(node, cornerRadius);
            count++;
        }
        return count;
    });
}
// Main execution
figma.showUI(__html__);
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.type === 'run-plugin') {
        try {
            yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
            const selectedNodes = figma.currentPage.selection;
            if (selectedNodes.length !== 1 || selectedNodes[0].type !== "FRAME") {
                throw new Error("Please select a single frame");
            }
            const count = yield convertVectorsWithoutStrokes(selectedNodes[0], msg.cornerRadius);
            figma.closePlugin(`Converted ${count} vectors without strokes to rectangles.`);
        }
        catch (error) {
            figma.closePlugin(`Error: ${error.message}`);
        }
    }
});
figma.showUI(__html__, {
    width: 300,
    height: 250,
    title: "Vector to Rectangles"
});

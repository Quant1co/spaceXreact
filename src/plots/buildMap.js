import { geoMercator, geoPath, select } from "d3";
import worldGeometry from "../geo.json";

export function createWorldMapElement() {
    const plotWidth = 1000;
    const plotHeight = 600;
    const plotInsets = { top: 20, right: 20, bottom: 20, left: 100 };

    const mapElement = document.createElement("div");
    mapElement.classList.add("map");
    const drawingLayer = select(mapElement).append("svg")
        .attr("width", plotWidth + plotInsets.left + plotInsets.right)
        .attr("height", plotHeight + plotInsets.top + plotInsets.bottom)
        .append("g")
        .attr("transform", `translate(${plotInsets.left},${plotInsets.top})`);

    const worldProjection = geoMercator()
        .scale(70)
        .center([0, 20])
        .translate([plotWidth / 2 - plotInsets.left, plotHeight / 2 - plotInsets.top]);
    drawingLayer.append("g").selectAll("path")
        .data(worldGeometry.features)
        .join("path")
        .attr("class", "topo")
        .attr("d", geoPath(worldProjection))
        .style("opacity", 0.7);

    return mapElement;
}
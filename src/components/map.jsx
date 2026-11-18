import { geoMercator, geoPath, select, zoom } from "d3";
import { useEffect, useRef } from "react";
import worldGeometry from "../geo.json";

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 600;
const MAP_INSETS = { top: 20, right: 20, bottom: 20, left: 100 };

export function LaunchSiteMap({ sites = [], activeSiteId = null }) {
    const mapHostRef = useRef(null);

    useEffect(() => {
        const mapHost = select(mapHostRef.current);
        let mapSvg = mapHost.select("svg");
        const worldProjection = geoMercator()
            .scale(70)
            .center([0, 20])
            .translate([MAP_WIDTH / 2 - MAP_INSETS.left, MAP_HEIGHT / 2 - MAP_INSETS.top]);

        if (mapSvg.empty()) {
            mapSvg = mapHost.append("svg")
                .attr("width", MAP_WIDTH + MAP_INSETS.left + MAP_INSETS.right)
                .attr("height", MAP_HEIGHT + MAP_INSETS.top + MAP_INSETS.bottom);

            const layerOffset = `translate(${MAP_INSETS.left},${MAP_INSETS.top})`;
            const countryLayer = mapSvg.append("g").attr("class", "map-g").attr("transform", layerOffset);
            mapSvg.append("g").attr("class", "pins-g").attr("transform", layerOffset);

            countryLayer.selectAll("path")
                .data(worldGeometry.features)
                .join("path")
                .attr("class", "topo")
                .attr("d", geoPath(worldProjection))
                .style("opacity", 0.7);

            const mapZoom = zoom()
                .scaleExtent([1, 8])
                .on("zoom", zoomEvent => mapSvg.selectAll("g").attr("transform", zoomEvent.transform));
            mapSvg.call(mapZoom);
        }

        const isActiveSite = site => site.id === activeSiteId;
        const projectSite = site => worldProjection([site.longitude, site.latitude]) ?? [0, 0];

        mapSvg.select(".pins-g").selectAll("circle")
            .data(sites, site => site.id)
            .join(
                addedSites => addedSites.append("circle")
                    .attr("r", 5)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1.5),
                existingSites => existingSites.attr("r", site => isActiveSite(site) ? 8 : 5),
                removedSites => removedSites.remove()
            )
            .attr("class", site => isActiveSite(site) ? "pin highlighted" : "pin")
            .attr("fill", site => isActiveSite(site) ? "#d62728" : "#1f77b4")
            .attr("cx", site => projectSite(site)[0])
            .attr("cy", site => projectSite(site)[1]);
    }, [sites, activeSiteId]);

    return <div className="mapContainer map" ref={mapHostRef} />;
}
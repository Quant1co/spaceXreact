import { useEffect, useState } from "react";
import { LaunchLibraryClient } from "../api/spacex";
import { LaunchSidebar } from "./launchList";
import { LaunchSiteMap } from "./map";

export function LaunchDashboard() {
    const [pastLaunches, setPastLaunches] = useState([]);
    const [mapSites, setMapSites] = useState([]);
    const [activeSiteId, setActiveSiteId] = useState(null);

    useEffect(() => {
        const apiClient = new LaunchLibraryClient();
        let isMounted = true;

        Promise.all([apiClient.fetchLaunchRecords(), apiClient.fetchSiteCatalog()])
            .then(([launchRecords, siteCatalog]) => {
                if (!isMounted) return;

                const catalogSites = LaunchLibraryClient.mapSitesFromCatalog(siteCatalog);
                const knownSiteIds = new Set([
                    ...catalogSites.map(site => site.id),
                    ...LaunchLibraryClient.siteIdsInLaunches(launchRecords),
                ]);
                const visibleLaunches = LaunchLibraryClient.launchesAtKnownSites(launchRecords, knownSiteIds)
                    .filter(record => record.net && new Date(record.net) <= Date.now());

                
                const combinedSites = [...catalogSites];
                for (const launchSite of LaunchLibraryClient.mapSitesFromLaunches(visibleLaunches)) {
                    if (!combinedSites.some(catalogSite => catalogSite.id === launchSite.id)) {
                        combinedSites.push(launchSite);
                    }
                }

                setPastLaunches(visibleLaunches);
                setMapSites(combinedSites);
            })
            .catch(requestError => {
                if (isMounted) console.warn("Unable to load launch data:", requestError.message);
            });

        return () => { isMounted = false; };
    }, []);

    return (
        <main className="main">
            <LaunchSidebar records={pastLaunches} onSiteHover={setActiveSiteId} />
            <LaunchSiteMap sites={mapSites} activeSiteId={activeSiteId} />
        </main>
    );
}
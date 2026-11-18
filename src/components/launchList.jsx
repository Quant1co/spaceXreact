function collectSidebarEntries(records) {
    const entries = [];
    const seenPairs = new Set();

    for (const record of records) {
        const site = record.pad;
        const siteId = site ? site.id : null;
        const vehicleName = record.name.split(" | ")[0];
        const pairKey = `${vehicleName}||${siteId || ""}`;

        if (seenPairs.has(pairKey)) continue;
        seenPairs.add(pairKey);
        entries.push({ launchId: record.id, vehicleName, siteId, siteName: site?.name || "" });
    }
    return entries;
}

export function LaunchSidebar({ records = [], onSiteHover }) {
    return (
        <aside className="aside" id="launchesContainer">
            <h3>Launches</h3>
            <div id="listContainer">
                <ul>
                    {collectSidebarEntries(records).map(({ launchId, vehicleName, siteId, siteName }) => (
                        <li
                            key={launchId}
                            data-pad={siteId || ""}
                            onMouseEnter={() => onSiteHover?.(siteId)}
                            onMouseLeave={() => onSiteHover?.(null)}
                            style={{ cursor: "pointer", padding: "4px 8px" }}
                        >
                            {vehicleName}
                            {siteId && ` — ${siteName}`}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
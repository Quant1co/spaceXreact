const CACHE_LIFETIME_MS = 60 * 60 * 1000;
const responsesByUrl = new Map();

function readCachedResponse(requestUrl) {
    const savedResponse = responsesByUrl.get(requestUrl);
    if (savedResponse && Date.now() < savedResponse.expiresAt) {
        return savedResponse.body;
    }
    responsesByUrl.delete(requestUrl);
    return null;
}

function storeResponse(requestUrl, body) {
    responsesByUrl.set(requestUrl, { body, expiresAt: Date.now() + CACHE_LIFETIME_MS });
}

async function requestCachedJson(requestUrl) {
    const cachedBody = readCachedResponse(requestUrl);
    if (cachedBody !== null) return cachedBody;

    const httpResponse = await fetch(requestUrl);
    if (!httpResponse.ok) {
        throw new Error(`API error ${httpResponse.status} for ${requestUrl}`);
    }
    const responseBody = await httpResponse.json();
    storeResponse(requestUrl, responseBody);
    return responseBody;
}

function readSiteCoordinates(site) {
    const rawLatitude = site?.latitude ?? site?.location?.latitude;
    const rawLongitude = site?.longitude ?? site?.location?.longitude;
    if (rawLatitude == null || rawLongitude == null) return null;
    return { latitude: Number(rawLatitude), longitude: Number(rawLongitude) };
}

function hasEmbeddedCoordinates(record) {
    return record?.pad?.latitude != null && record.pad.longitude != null;
}

export class LaunchLibraryClient {
    constructor(apiRoot = "https://ll.thespacedevs.com/2.3.0/") {
        this.apiRoot = apiRoot;
    }

    async fetchLaunchRecords() {
        const launchRecords = [];
        let pageUrl = `${this.apiRoot}launches/?lsp__id=121&limit=100&ordering=-net`;
        while (pageUrl) {
            const pageBody = await requestCachedJson(pageUrl);
            launchRecords.push(...(pageBody.results ?? pageBody));
            pageUrl = pageBody.next;
        }
        return launchRecords;
    }

    async fetchSiteCatalog() {
        const catalogBody = await requestCachedJson(`${this.apiRoot}pads/?agencies_ids=121`);
        return catalogBody.results ?? catalogBody;
    }

    static siteIdsInLaunches(records) {
        return new Set(records.filter(hasEmbeddedCoordinates).map(record => record.pad.id));
    }

    static launchesAtKnownSites(records, knownSiteIds) {
        return records.filter(record => record?.pad && knownSiteIds.has(record.pad.id));
    }

    static mapSitesFromCatalog(siteCatalog) {
        return siteCatalog.flatMap(site => {
            const coordinates = readSiteCoordinates(site);
            return coordinates ? [{ id: site.id, name: site.name, ...coordinates }] : [];
        });
    }

    static mapSitesFromLaunches(records) {
        const mappedSiteIds = new Set();
        const mapSites = [];
        for (const record of records) {
            if (!hasEmbeddedCoordinates(record)) continue;
            const site = record.pad;
            if (mappedSiteIds.has(site.id)) continue;

            mappedSiteIds.add(site.id);
            mapSites.push({
                id: site.id,
                name: site.name,
                latitude: Number(site.latitude),
                longitude: Number(site.longitude),
            });
        }
        return mapSites;
    }
}
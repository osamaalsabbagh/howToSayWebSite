(function(window){
    const PLAY_BASE = 'https://play.google.com/store/apps/details?id=com.howtosay.app';
    const APPLE_BASE = 'https://apps.apple.com/us/app/how-to-say/id6745604243';
    const APPLE_PROVIDER_TOKEN = '127823002';
    const DOWNLOAD_PATH = '/download.html';

    function getUtmParams(){
        const params = new URLSearchParams(window.location.search);
        return {
            utm_source:  params.get('utm_source')  || '',
            utm_medium:  params.get('utm_medium')  || '',
            utm_campaign:params.get('utm_campaign')|| '',
            utm_term:    params.get('utm_term')    || '',
            utm_content: params.get('utm_content') || ''
        };
    }

    function buildPlayUrl(utm){
        const refParts = [];
        if(utm.utm_source)  refParts.push('utm_source=' + encodeURIComponent(utm.utm_source));
        if(utm.utm_medium)  refParts.push('utm_medium=' + encodeURIComponent(utm.utm_medium));
        if(utm.utm_campaign)refParts.push('utm_campaign=' + encodeURIComponent(utm.utm_campaign));
        if(utm.utm_term)    refParts.push('utm_term=' + encodeURIComponent(utm.utm_term));
        if(utm.utm_content) refParts.push('utm_content=' + encodeURIComponent(utm.utm_content));
        let url = PLAY_BASE;
        if(refParts.length){
            url += '&referrer=' + encodeURIComponent(refParts.join('&'));
        }
        return url;
    }

    function buildAppleUrl(utm, opts){
        if(!opts){opts = { providerToken: APPLE_PROVIDER_TOKEN, mt: 8 }}
        const url = new URL(APPLE_BASE, window.location.origin);
        opts = opts || {};
        if(opts.providerToken){
            url.searchParams.set('pt', opts.providerToken);
        }

        // Preserve all UTM parameters so Apple analytics and GA receive the
        // same campaign information as Google Play.
        if(utm.utm_source)  url.searchParams.set('utm_source', utm.utm_source);
        if(utm.utm_medium)  url.searchParams.set('utm_medium', utm.utm_medium);
        if(utm.utm_campaign)url.searchParams.set('utm_campaign', utm.utm_campaign);
        if(utm.utm_term)    url.searchParams.set('utm_term', utm.utm_term);
        if(utm.utm_content) url.searchParams.set('utm_content', utm.utm_content);

        let ct = utm.utm_campaign || [utm.utm_source, utm.utm_medium].filter(Boolean).join('-');
        if(ct){
            ct = ct.replace(/\s+/g, '-').slice(0,100);
            url.searchParams.set('ct', ct);
        }
        if(opts.mt){
            url.searchParams.set('mt', String(opts.mt));
        }
        return url.toString();
    }

    function buildDownloadUrl(){
        return window.location.origin + DOWNLOAD_PATH + (window.location.search || '');
    }

    function updateStoreButtonLink(linkElement, url, eventName, utm){
        if (linkElement) {
            linkElement.href = url;
            linkElement.addEventListener("click", function (e) {
                const payload = Object.assign({ link_url: url }, utm);
                window.gtag && gtag('event', eventName, payload);
            });
        }
    }

    window.linkUtils = {
        getUtmParams: getUtmParams,
        buildPlayUrl: buildPlayUrl,
        buildAppleUrl: buildAppleUrl,
        buildDownloadUrl: buildDownloadUrl,
        updateStoreButtonLink: updateStoreButtonLink,
        PLAY_BASE: PLAY_BASE,
        APPLE_BASE: APPLE_BASE,
        DOWNLOAD_PATH: DOWNLOAD_PATH,
        APPLE_PROVIDER_TOKEN: APPLE_PROVIDER_TOKEN
    };
})(window);


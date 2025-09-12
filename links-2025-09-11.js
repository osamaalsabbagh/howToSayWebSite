(function(window){
    const PLAY_BASE = 'https://play.google.com/store/apps/details?id=com.howtosay.app';
    // اختياري: نمط موحّد وخفيف للحملات
    const APPLE_BASE = 'https://apps.apple.com/app/apple-store/id6745604243';
    const APPLE_PROVIDER_TOKEN = '127823002';
    const DOWNLOAD_PATH = '/download.html';

    function normalize(val){
        return (val || '').trim();
    }
    function toLowerSafe(val){
        return normalize(val).toLowerCase();
    }

    function getUtmParams(){
        const params = new URLSearchParams(window.location.search);
        // تطبيع وخفض حروف UTM الأساسية لتوحيد التقارير
        const utm_source   = toLowerSafe(params.get('utm_source'));
        const utm_medium   = toLowerSafe(params.get('utm_medium'));
        const utm_campaign = toLowerSafe(params.get('utm_campaign'));

        // الحقول الإضافية تُترك كما هي (قد ترغب بالحفاظ على الحالة)
        const utm_term     = normalize(params.get('utm_term'));
        const utm_content  = normalize(params.get('utm_content'));
        const utm_id       = normalize(params.get('utm_id'));
        const utm_source_platform = normalize(params.get('utm_source_platform'));

        return { utm_source, utm_medium, utm_campaign, utm_term, utm_content, utm_id, utm_source_platform };
    }

    function buildPlayUrl(utm){
        // وفق توثيق جوجل: تمرير UTM داخل referrer (مرمّزة URL-encoded)
        // https://developer.android.com/google/play/installreferrer
        const refParts = [];
        if(utm.utm_source)           refParts.push('utm_source=' + encodeURIComponent(utm.utm_source));
        if(utm.utm_medium)           refParts.push('utm_medium=' + encodeURIComponent(utm.utm_medium));
        if(utm.utm_campaign)         refParts.push('utm_campaign=' + encodeURIComponent(utm.utm_campaign));
        if(utm.utm_term)             refParts.push('utm_term=' + encodeURIComponent(utm.utm_term));
        if(utm.utm_content)          refParts.push('utm_content=' + encodeURIComponent(utm.utm_content));
        if(utm.utm_id)               refParts.push('utm_id=' + encodeURIComponent(utm.utm_id));
        if(utm.utm_source_platform)  refParts.push('utm_source_platform=' + encodeURIComponent(utm.utm_source_platform));

        let url = PLAY_BASE;
        if(refParts.length){
            url += '&referrer=' + encodeURIComponent(refParts.join('&'));
        }
        return url;
    }

    function sanitizeCt(raw){
        // اشتقاق ct من utm_campaign أو (source-medium)
        let ct = normalize(raw);
        ct = ct.replace(/\s+/g, '-').toLowerCase();
        // السماح بحروف-أرقام وواصلات وشرطات سفلية فقط
        ct = ct.replace(/[^a-z0-9\-_]/g, '-').slice(0, 100);
        return ct;
    }

    function buildAppleUrl(utm, opts){
        // وفق App Store Connect: استخدام pt / ct (+ mt=8 اختياري)
        // https://developer.apple.com/help/app-store-connect/view-app-analytics/manage-campaigns/
        if (!opts) { opts = { providerToken: APPLE_PROVIDER_TOKEN, mt: 8 }; }

        const url = new URL(APPLE_BASE);
        if (opts.providerToken) url.searchParams.set('pt', opts.providerToken);

        // تمرير UTM كما هي (لأغراض GA4/تقارير أخرى)
        if(utm.utm_source)           url.searchParams.set('utm_source', utm.utm_source);
        if(utm.utm_medium)           url.searchParams.set('utm_medium', utm.utm_medium);
        if(utm.utm_campaign)         url.searchParams.set('utm_campaign', utm.utm_campaign);
        if(utm.utm_term)             url.searchParams.set('utm_term', utm.utm_term);
        if(utm.utm_content)          url.searchParams.set('utm_content', utm.utm_content);
        if(utm.utm_id)               url.searchParams.set('utm_id', utm.utm_id);
        if(utm.utm_source_platform)  url.searchParams.set('utm_source_platform', utm.utm_source_platform);

        const baseCt = utm.utm_campaign || [utm.utm_source, utm.utm_medium].filter(Boolean).join('-');
        const ct = sanitizeCt(baseCt);
        if (ct) url.searchParams.set('ct', ct);

        if (opts.mt) url.searchParams.set('mt', String(opts.mt));
        return url.toString();
    }

    function buildDownloadUrl(){
        return window.location.origin + DOWNLOAD_PATH + (window.location.search || '');
    }

    function updateStoreButtonLink(linkElement, url, eventName, utm){
        if (!linkElement) return;
        linkElement.href = url;

        linkElement.addEventListener('click', function () {
            const payload = Object.assign({ link_url: url }, utm);
            if (window.gtag) { gtag('event', eventName, payload); }
        });
    }

    function updateQrImageSrc(imageElement, url){
        imageElement.src = 'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=' + encodeURIComponent(url);
        imageElement.onerror = function(){
            imageElement.onerror = null;
            imageElement.src = 'images/qr-code.png';
        };
    }

    window.linkUtils = {
        getUtmParams,
        buildPlayUrl,
        buildAppleUrl,
        buildDownloadUrl,
        updateStoreButtonLink,
        updateQrImageSrc,
        PLAY_BASE,
        APPLE_BASE,
        DOWNLOAD_PATH,
        APPLE_PROVIDER_TOKEN
    };
})(window);
// DOM-Based Ecommerce Tracking Data Extractor
// Training page:
// https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops

function extractPriceData(rawPrice) {
    const cleanedTextPrice = rawPrice?.replace?.('$', '').trim() || null;

    const numericPrice = typeof cleanedTextPrice === 'string' && cleanedTextPrice !== ''
        ? Number(cleanedTextPrice)
        : null;

    return typeof numericPrice === 'number' && !Number.isNaN(numericPrice)
        ? numericPrice
        : null;
}

// 1. Select product cards from the DOM
const productCards = document.querySelectorAll('[itemscope][itemtype*="Product"]');

// 2. Extract raw product data from the DOM
const extractedData = [];

for (let i = 0; i < productCards.length; i++) {
    const productCard = productCards[i] || null;

    const productElement = productCard?.querySelector?.('[itemprop="name"]') || null;
    const priceElement = productCard?.querySelector?.('[itemprop="price"]') || null;
    const currencyElement = productCard?.querySelector?.('[itemprop="priceCurrency"]') || null;

    const rawTitleAttribute =
        productElement?.getAttribute('title') ||
        productElement?.textContent ||
        null;

    const extractedTitle = typeof rawTitleAttribute === 'string' && rawTitleAttribute.trim() !== ''
        ? rawTitleAttribute.trim()
        : null;

    const rawHref = productElement?.getAttribute('href') || null;

    const extractedUrl = typeof rawHref === 'string' && rawHref.trim() !== ''
        ? productElement.href.trim()
        : null;

    const rawTextPrice = priceElement?.textContent || null;

    const rawPrice = typeof rawTextPrice === 'string' && rawTextPrice.trim() !== ''
        ? rawTextPrice.trim()
        : null;

    const rawTextCurrency = currencyElement?.getAttribute('content') || null;

    const extractedCurrency = typeof rawTextCurrency === 'string' && rawTextCurrency.trim() !== ''
        ? rawTextCurrency.trim()
        : null;

    extractedData.push({
        product: {
            extractedTitle: extractedTitle,
            extractedUrl: extractedUrl,
            rawPrice: rawPrice,
            extractedCurrency: extractedCurrency
        },
        page: {
            type: 'product_list_page'
        }
    });
}

// 3. Process, validate, map, and diagnose each product item
const processingResults = extractedData.map(function (extractedDataItem, index) {
    const productName = extractedDataItem?.product?.extractedTitle || null;
    const productUrl = extractedDataItem?.product?.extractedUrl || null;
    const productPrice = extractPriceData(extractedDataItem?.product?.rawPrice);
    const productCurrency = extractedDataItem?.product?.extractedCurrency || null;
    const productPageType = extractedDataItem?.page?.type || null;

    const productNameIsValid = typeof productName === 'string' && productName !== '';
    const productUrlIsValid = typeof productUrl === 'string' && productUrl !== '';
    const productPriceIsValid = typeof productPrice === 'number';
    const productCurrencyIsValid = typeof productCurrency === 'string' && productCurrency !== '';
    const productPageTypeIsValid = typeof productPageType === 'string' && productPageType !== '';

    const trackingItemIsValid =
        productNameIsValid &&
        productUrlIsValid &&
        productPriceIsValid &&
        productCurrencyIsValid &&
        productPageTypeIsValid;

    const failedChecks = [];

    if (!productNameIsValid) {
        failedChecks.push('invalid_product_name');
    }

    if (!productUrlIsValid) {
        failedChecks.push('invalid_product_url');
    }

    if (!productPriceIsValid) {
        failedChecks.push('invalid_product_price');
    }

    if (!productCurrencyIsValid) {
        failedChecks.push('invalid_product_currency');
    }

    if (!productPageTypeIsValid) {
        failedChecks.push('invalid_page_type');
    }

    const trackingItem = {
        product: {
            name: productName,
            url: productUrl,
            price: productPrice,
            currency: productCurrency
        },
        page: {
            type: productPageType
        },
        validation: {
            productNameIsValid: productNameIsValid,
            productUrlIsValid: productUrlIsValid,
            productPriceIsValid: productPriceIsValid,
            productCurrencyIsValid: productCurrencyIsValid,
            productPageTypeIsValid: productPageTypeIsValid,
            trackingItemIsValid: trackingItemIsValid
        },
        failedChecks: failedChecks
    };

    const dataLayerItem = trackingItem.validation.trackingItemIsValid
        ? {
            item_name: trackingItem.product.name,
            price: trackingItem.product.price,
            currency: trackingItem.product.currency,
            item_url: trackingItem.product.url,
            page_type: trackingItem.page.type
        }
        : null;

    const mappingIsApplicable = dataLayerItem !== null;

    const productNameMappingIsValid = mappingIsApplicable
        ? dataLayerItem.item_name === trackingItem.product.name
        : null;

    const productPriceMappingIsValid = mappingIsApplicable
        ? dataLayerItem.price === trackingItem.product.price
        : null;

    const productCurrencyMappingIsValid = mappingIsApplicable
        ? dataLayerItem.currency === trackingItem.product.currency
        : null;

    const productUrlMappingIsValid = mappingIsApplicable
        ? dataLayerItem.item_url === trackingItem.product.url
        : null;

    const productPageTypeMappingIsValid = mappingIsApplicable
        ? dataLayerItem.page_type === trackingItem.page.type
        : null;

    const mappingIsValid = mappingIsApplicable
        ? productNameMappingIsValid &&
          productPriceMappingIsValid &&
          productCurrencyMappingIsValid &&
          productUrlMappingIsValid &&
          productPageTypeMappingIsValid
        : null;

    return {
        index: index,
        status: trackingItem.validation.trackingItemIsValid ? 'SEND' : 'SKIP',
        failedChecks: failedChecks,
        trackingItem: trackingItem,
        dataLayerItem: dataLayerItem,
        mapping: {
            mappingIsApplicable: mappingIsApplicable,
            productNameMappingIsValid: productNameMappingIsValid,
            productPriceMappingIsValid: productPriceMappingIsValid,
            productCurrencyMappingIsValid: productCurrencyMappingIsValid,
            productUrlMappingIsValid: productUrlMappingIsValid,
            productPageTypeMappingIsValid: productPageTypeMappingIsValid,
            mappingIsValid: mappingIsValid
        }
    };
});

// 4. Build valid dataLayer items
const dataLayerItems = processingResults
    .filter(processingResultItem => processingResultItem.dataLayerItem !== null)
    .map(processingResultItem => processingResultItem.dataLayerItem);

// 5. Build final dataLayer-style event
const dataLayerEvent = dataLayerItems.length > 0
    ? {
        event: 'view_item_list',
        ecommerce: {
            items: dataLayerItems
        },
        page_type: 'product_list_page'
    }
    : null;

// 6. Build readable processing summary
const processingSummary = processingResults.map(function (processingResultItem) {
    return {
        index: processingResultItem.index,
        productName: processingResultItem.trackingItem.product.name,
        status: processingResultItem.status,
        failedChecks: processingResultItem.failedChecks
    };
});

// 7. Build QA report
const qaReport = processingResults.reduce(function (accumulator, currentItem) {
    accumulator.totalItems++;

    if (currentItem.status === 'SEND') {
        accumulator.sendCount++;
    }

    if (currentItem.status === 'SKIP') {
        accumulator.skipCount++;
    }

    if (currentItem.trackingItem.validation.productNameIsValid === false) {
        accumulator.invalidNameCount++;
    }

    if (currentItem.trackingItem.validation.productUrlIsValid === false) {
        accumulator.invalidUrlCount++;
    }

    if (currentItem.trackingItem.validation.productPriceIsValid === false) {
        accumulator.invalidPriceCount++;
    }

    if (currentItem.trackingItem.validation.productCurrencyIsValid === false) {
        accumulator.invalidCurrencyCount++;
    }

    if (currentItem.trackingItem.validation.productPageTypeIsValid === false) {
        accumulator.invalidPageTypeCount++;
    }

    if (currentItem.mapping.mappingIsValid === true) {
        accumulator.mappingValidCount++;
    }

    if (currentItem.mapping.mappingIsValid === false) {
        accumulator.mappingInvalidCount++;
    }

    if (currentItem.mapping.mappingIsApplicable === false) {
        accumulator.mappingNotApplicableCount++;
    }

    return accumulator;
}, {
    totalItems: 0,
    sendCount: 0,
    skipCount: 0,
    dataLayerItemsCount: dataLayerItems.length,
    invalidNameCount: 0,
    invalidUrlCount: 0,
    invalidPriceCount: 0,
    invalidCurrencyCount: 0,
    invalidPageTypeCount: 0,
    mappingValidCount: 0,
    mappingInvalidCount: 0,
    mappingNotApplicableCount: 0
});

// 8. Build high-level summary report
const outputStatus = dataLayerItems.length > 0 && dataLayerEvent !== null
    ? 'READY'
    : 'NO_VALID_ITEMS';

let qualityStatus = null;

if (qaReport.mappingInvalidCount > 0) {
    qualityStatus = 'MAPPING_ISSUES';
} else if (qaReport.skipCount > 0) {
    qualityStatus = 'HAS_SKIPPED_ITEMS';
} else {
    qualityStatus = 'CLEAN';
}

const summaryReport = {
    projectName: 'DOM-Based Ecommerce Tracking Data Extractor',
    pageType: 'product_list_page',
    outputStatus: outputStatus,
    qualityStatus: qualityStatus,
    output: {
        dataLayerEventCreated: dataLayerEvent !== null,
        dataLayerItemsCount: dataLayerItems.length
    },
    qa: qaReport
};

// 9. Verify that QA counters match actual processing results
const actualSendCount = processingResults.filter(item => item.status === 'SEND').length;
const actualSkipCount = processingResults.filter(item => item.status === 'SKIP').length;

const consistencyChecks = {
    totalCountMatches:
        qaReport.totalItems === processingResults.length,

    sendCountMatchesActual:
        qaReport.sendCount === actualSendCount,

    skipCountMatchesActual:
        qaReport.skipCount === actualSkipCount,

    dataLayerItemsCountMatches:
        qaReport.dataLayerItemsCount === actualSendCount,

    sendSkipCountMatches:
        qaReport.sendCount + qaReport.skipCount === qaReport.totalItems,

    mappingCountMatches:
        qaReport.mappingValidCount +
        qaReport.mappingInvalidCount +
        qaReport.mappingNotApplicableCount ===
        qaReport.totalItems
};

// 10. Console output for review and debugging
console.table(processingSummary);
console.table(dataLayerItems);

console.log('dataLayerEvent:', dataLayerEvent);
console.log('qaReport:', qaReport);
console.log('summaryReport:', summaryReport);
console.log('consistencyChecks:', consistencyChecks);

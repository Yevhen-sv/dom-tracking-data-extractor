# DOM-Based Ecommerce Tracking Data Extractor

DOM-based ecommerce tracking data extraction pipeline with validation, mapping, QA reports, and consistency checks.

## Project Overview

This project is a DOM-based ecommerce tracking data extraction pipeline.

It uses the webscraper.io laptop listing page as a training website. The selectors are specific to this page structure, but the pipeline architecture can be reused for other ecommerce pages.

The script extracts product data from the DOM, normalizes and validates each product item, maps valid items into a dataLayer-style ecommerce format, and builds a `view_item_list` payload.

It also generates QA reports and consistency checks to support debugging, mapping verification, and data quality validation.

---

## Project Scope

This project is built for the webscraper.io laptop listing page.

The selectors are specific to this page structure, so they are not universal.

On another ecommerce website, the extraction layer would need to be adapted, but the general pipeline architecture would remain reusable.

---

## What the Script Does

The script:

- selects product cards from the DOM
- extracts product name, URL, price, and currency
- cleans and validates each product item
- creates internal tracking items
- maps valid items into a dataLayer-style ecommerce format
- builds a `view_item_list` payload
- generates QA reports for debugging and data quality validation
- provides consistency checks to verify that QA counters match the actual processing results

---

## Data Flow

The data flow shows how product data moves through the pipeline: from DOM product cards to raw extracted data, then to processed tracking items, mapped dataLayer-style items, the final `view_item_list` payload, and QA reports.

### Conceptual flow

```text
DOM product cards
→ raw extracted data
→ processed tracking items
→ mapped dataLayer-style items
→ final dataLayer-style event
→ QA reports and consistency checks
```

### Technical flow

```text
productCards
→ extractedData
→ processingResults
→ dataLayerItems
→ dataLayerEvent
→ processingSummary
→ qaReport
→ summaryReport
→ consistencyChecks
```

---

## Main Pipeline Layers

### productCards

Selected product card elements from the DOM.

### extractedData

Raw product data extracted from the DOM before processing, validation, or mapping.

### trackingItem

A processed internal tracking item that contains normalized product data, page context, validation flags, and failed checks.

### dataLayerItem

A mapped ecommerce item created from a valid tracking item and prepared for a dataLayer-style ecommerce format.

### processingResults

The main source of truth after processing. Each item contains index, status, tracking item, dataLayer item, failed checks, and mapping diagnostics.

### dataLayerItems

All valid mapped items ready to be included in the ecommerce payload.

### dataLayerEvent

The final dataLayer-style `view_item_list` ecommerce payload.

### processingSummary

A readable per-item debug table that includes index, product name, status, and failed checks.

### qaReport

The main QA report that contains general processing counters, data quality counters, and mapping diagnostics.

### summaryReport

A high-level project summary that shows output status, quality status, output details, and QA results.

### consistencyChecks

Checks whether QA counters match the actual processing results.

---

## QA and Debugging

The project includes several QA and debugging layers: `summaryReport`, `qaReport`, `processingSummary`, and `consistencyChecks`.

These reports help identify different classes of issues, including extraction, processing, validation, mapping, and reporting problems.

The debugging flow starts from high-level reports such as `summaryReport`, `qaReport`, and `consistencyChecks`, then moves to `processingSummary`, `processingResults[index]`, and `extractedData[index]` to identify the root cause.

```text
summaryReport
→ qaReport
→ consistencyChecks
→ processingSummary
→ processingResults[index]
→ extractedData[index]
→ root cause
```

---

## Example Output

A successful run on the webscraper.io laptop listing page produces 117 valid product items:

```text
productCards.length = 117
extractedData.length = 117
processingResults.length = 117
dataLayerItems.length = 117

summaryReport.outputStatus = "READY"
summaryReport.qualityStatus = "CLEAN"
```

Example `dataLayerItem`:

```js
dataLayerItems[12]
```

```js
{
    "item_name": "Asus VivoBook Max",
    "price": 399,
    "currency": "USD",
    "item_url": "https://webscraper.io/test-sites/e-commerce/allinone/product/45",
    "page_type": "product_list_page"
}
```

---

## Controlled Break Tests

Controlled break tests were used to verify that the pipeline can detect, classify, and report different types of issues.

Examples:

- invalid price format → `invalidPriceCount` increases
- missing product name → `invalidNameCount` increases
- missing product URL → `invalidUrlCount` increases
- missing currency → `invalidCurrencyCount` increases
- broken mapping logic → `mappingInvalidCount` increases
- broken QA counter logic → `consistencyChecks` detects counter mismatches

These tests help confirm that the project can distinguish between extraction, validation, mapping, and reporting issues, instead of treating all errors as the same type of problem.

---

## What This Project Demonstrates

This project demonstrates:

- DOM data extraction
- data cleaning and normalization
- field validation with failed checks and item-level diagnostics
- mapping internal tracking items into a dataLayer-style ecommerce format
- payload construction for a `view_item_list` event
- QA reporting and consistency checks
- debugging logic for extraction, validation, mapping, and reporting issues

---

## Limitations

This project is site-specific. It is built for the webscraper.io laptop listing page, so the selectors are not universal.

For another ecommerce website, the extraction layer would need to be adapted to match the page DOM structure.

The project builds a dataLayer-style ecommerce payload for a `view_item_list` event, but it does not send data to GA4 directly.

---

## Next Steps

Possible future improvements:

- add real `dataLayer.push()`
- reuse the extraction logic for product click tracking
- connect the payload to GTM / GA4
- validate outgoing requests in the Network tab
- add currency handling logic and support for additional price formats
- add a debug mode toggle for easier QA and troubleshooting

---

## Key Engineering Decisions

- `processingResults` is used as the main source of truth after processing.
- Raw DOM data and processed tracking data are stored in separate layers to keep DOM extraction separate from data cleaning, normalization, and validation.
- Invalid items are excluded from the final `dataLayerItems` array to prevent broken data from entering the payload.
- Mapping validation is separated from field validation to detect mapping-specific issues.
- QA reports are separated from consistency checks to verify both data quality and report accuracy.
- Controlled break tests are used to verify that the pipeline can detect and classify different types of issues.

---

## Key Takeaways

- Selectors in the extraction layer are site-specific, but the pipeline architecture is reusable.
- Raw data, processed data, mapped data, and reports should be separated into clear layers.
- A tracking pipeline should not only build a payload, but also validate, explain, and verify the data.
- QA reports help classify different issue types instead of treating all errors as one general problem.
- Good debugging starts from high-level reports and then moves to item-level diagnostics.

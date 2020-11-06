/*jslint browser */
/*globals ebSlugify */

// Setup tasks on pages

// Options
// -------
var ebElementsToGetIDs = 'p, li, dt, dd';

// Assign IDs and fingerprints to the ebElementsToGetIDs, e.g. for bookmarking.
// IDs contain the number of the element in the doc, with an eb- prefix.
// Then we add a data-fingerprint attribute with several components,
// so that we have different ways to mark and recognise an element,
// in future, if we suspect the bookmarks are out,
// and could fall back to the fingerprints to identify a bookmark,
// e.g. after the document has been edited. The fingerprint components
// are separated by dashes, for splitting into arrays in JS,
// constructing a queryselector (e.g. DIV:nth-child(1) > P:nth-child(2)),
// and/or as a fallback by comparing opening and/or closing strings.
// So a fingerprint comprises:
// - The element's ancestor tagNames: DIV-
// - For each ancestor, its sibling index: 0-
// - The element's tagName: P-
// - The element's index among its siblings: 1-
// - Opening [a-z] characters from element's content: itwasthebestoftimesi-
// - Closing [a-z] characters from element's content: greeofcomparisononly

// A utility function to get the index of an element
// among its siblings, where index = 1 (not 0).
// Credit https://stackoverflow.com/a/23528539/1781075
function ebGetSiblingIndex(element) {
    'use strict';
    var parent = element.parentNode;
    var index = Array.prototype.indexOf.call(parent.children, element);
    return index + 1;
}

// Assign fingerprints to all elements with IDs.
// The fingerprint does not contain the ID, because
// the point of the fingerprint is to be a substitute
// for the ID when the ID changes.
var ebFingerprintsAssigned = false;
function ebAssignFingerprints(element, ancestorTagNames) {
    'use strict';

    // If we're starting off, with no element provided,
    // start with the #content div.
    if (!element) {
        element = document.getElementById('content');
    }

    // Only fingerprint elements with IDs,
    // and elements that contain elements with IDs
    if (!element.id && element.querySelector('[id]') === null) {
        return;
    }

    // Create en empty string to complete.
    var fingerprint = '';

    // If we've been given an ancestor tagName string, add it,
    // otherwise use the element's parentElement only.
    if (ancestorTagNames) {
        fingerprint += ancestorTagNames;
    } else {
        fingerprint += element.parentElement.tagName
                + '-'
                + ebGetSiblingIndex(element.parentElement)
                + '-';
    }

    // Add the element's own tagName
    fingerprint += element.tagName + '-';

    // Add the element's sibling index
    fingerprint += ebGetSiblingIndex(element) + '-';

    // Remember the tagName string at this point,
    // to pass to child elements.
    var descendantTagNames = fingerprint;

    // Add an opening [a-z] string
    var openingString = ebSlugify(element.innerText.slice(0, 20)).replace(/-/g, '');
    // Add a closing [a-z] string
    var closingString = ebSlugify(element.innerText.slice(-20)).replace(/-/g, '');

    // Add them to the fingerprint
    fingerprint += openingString + '-';
    fingerprint += closingString;

    // Set the data-fingerprint attribute
    element.setAttribute('data-fingerprint', fingerprint);

    // Get the children and fingerprint them, too.
    // We need to convert the HTMLCollection to an array before doing forEach.
    var children = Array.prototype.slice.call(element.children);
    children.forEach(function (child) {
        ebAssignFingerprints(child, descendantTagNames);
    });

    // Set ebFingerprintsAssigned to true
    ebFingerprintsAssigned = true;
}

var ebIDsAssigned = false;
function ebAssignIDs(container) {
    'use strict';

    // If no container provided, use the #content div
    if (!container) {
        container = document.getElementById('content');
    }

    // Count from 1, giving an ID to every element without one
    var elementCounter = 1;
    var idCounter = 1;
    var elementsToID = container.querySelectorAll(ebElementsToGetIDs);
    elementsToID.forEach(function (element) {
        elementCounter += 1;
        if (!element.id) {
            element.id = 'eb-' + idCounter;
            idCounter += 1;
        }
        // Once done, set status, e.g. for the accordion and bookmarking.
        // elementsToID indexes from 0, and elementCounter starts at 1, so
        // we're done when elementCounter > the number of elementsToID.
        if (elementCounter > elementsToID.length) {
            ebIDsAssigned = true;
            ebAssignFingerprints();
        }
    });
}

// Assign IDs and data-fingerprint attributes, set ebIDsAssigned to true
ebAssignIDs();

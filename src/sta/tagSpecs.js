// tag-specs="div.card,span.lead": a tag picks its wrapper elements (and classes) by attribute.
// Groups separated by "|" are handed down to nested tags; "&" inside a group stands for a deeper "|".
//   tag-specs="div,div.amazing,div|h1,h2,div.description&div.nested-deeper,div|div,div"
export function tagSpec(tagSpecs, index) {
    const spec = tagSpecs.split('|')[0].split(',')[index];

    if (!spec) {
        throw new Error(`STA: tag-specs "${tagSpecs}" has no entry at position ${index}.`);
    }

    const [tag, ...classes] = spec.trim().split('.');

    return {tag, classes: classes.join(' ')};
}

// The tag-specs string to hand to the nested tag at depth k, or false when there is none.
export function nestedTagSpecs(tagSpecs, k) {
    const nesting = tagSpecs.split('|');

    if (nesting.length < k + 1) {
        return false;
    }

    return nesting[k].replaceAll('&', '|').replaceAll('||', '&');
}

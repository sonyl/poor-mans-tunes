import _sanitizeHtml from 'sanitize-html';


function sanitize(dirty) {
    return _sanitizeHtml(dirty, {
        transformTags: {
            a: _sanitizeHtml.simpleTransform('a', {target: '_blank'})
        }
    });
}

export const sanitizeHtml = dirty => ({__html: sanitize(dirty)});

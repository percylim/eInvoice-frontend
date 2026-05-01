 /**
 * Escape string for mysql. Don't use native function,
 * because it doesn't work without connect.
 */
//import React from 'react';
export default function escapeStr (str) {
    return str.replace(/[\\"']/g, "\\$&").replace(/[\n]/g, "\\n")
                .replace(/[\r]/g, "\\r").replace(/\x0/g, "\\0");
};
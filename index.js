module.exports = (source) => {
    // Pattern match for start of file
    const startPattern = /^\(function.*\n/m;

    // Pattern for end of file
    const endPattern = /}\)\(createjs(.|\n)*AdobeAn;/m;
    
    // Pattern match for finding files in the manifest
    const manifestFilePattern = /{[\n\s]*src:((['"])([\w/.%\-]*)\2)/gm;

    // Replace all the manifest URLS with require() calls to pack the image assets.
    let output = source.replace(manifestFilePattern, (match, matchWithQuote, q, filename) => {
        return match.replace(matchWithQuote, `require("./${filename}")`)
    });

    // The pattern to match to extract the properties for a library outside the factory method
    // which initializes the rest of the library object. This is useful in order to set canvas background,
    // size, and opacity before createJS might be loaded into memory.
    const propertiesPattern = /lib\.properties(?:\W*)=([^;]*);/m;

    // extract the properties object from the library so we can access it before constructing the rest of the library object.
    let propertiesMatch = propertiesPattern.exec(output);

    let extractedProperties = propertiesMatch[1];
    output = output.replace(extractedProperties, " Object.assign({}, properties)");
    
    // Pattern to discover the stage root name
    const exportRootPattern = /\/\/ stage content:\s*\(lib\.([^ =]*)/m;    
    
    // The name of the root movie
    const exportRootName = exportRootPattern.exec(source)[1];

    // Shim createjs into module
    const startShim = `
        let properties = ${extractedProperties};
        function makeDefinition(cjs) {
            let an = {};
`

    // Export the library and the composition for this animation
    const endShim = `
        lib.Root = lib.${exportRootName};
        return {
            library: lib,
            spriteSheets: ss,
            images: img
        }
    }

    module.exports = { makeDefinition, properties };
`
    output = output.replace(startPattern, startShim);
    output = output.replace(endPattern, endShim);
    
    return output;
}

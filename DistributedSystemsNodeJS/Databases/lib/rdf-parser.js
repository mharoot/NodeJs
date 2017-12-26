'use strict';
const
  fs = require('fs'),
  cheerio = require('cheerio');

/**
 * Like the request module we used earlier, this module sets its exports to a function.  Users of the module will call this function, passing in a path to a file and a callback to invoke with the extracted data.
 */
module.exports = function(filename, callback) {
    
    function extract_array($obj) {
      let obj_array = Array();

      for (let i = 0; i < $obj.length; i++) {
        obj_array.push($obj[i]);
      }
      return obj_array;
    }
    // The main module function reads the specified file asynchronously, then loads the data into cheerio.
    
    fs.readFile(filename, function(err, data) {
      if (err) { 
        callback(err); 
        return;
      }
      let 
      // cheerio gives back an object we assign to the $ variable.  This object works much like the jQuery global function $--it provides methods for querying and modifying elements.
        $ = cheerio.load(data.toString()),
      
      // The collect function is a utility method for extracting an array of text nodes from a set of element nodes.
        collect = function(index, elem) {
            return $(elem).text();
        };

      // The bulk of the logic for this module is encapsulated in these four lines.
        callback(null, {
        // we look for the <pgterms:ebook> tag, read its rdf:about=attribute, and pull out just the numerical portion.
          _id: $('pgterms\\:ebook').attr('rdf:about').replace('ebooks/', ''),

        // we grab the text content of the <dcterms:title> tag.
          title: $('dcterms\\:title').text(),

        // we find all the <pgterms:name> elements under a <pgterms:agent>
          authors: extract_array( $('pgterms\\:agent pgterms\\:name').map(collect) ),
        
        // Lastly, we use the sibling operator (~) to find the <rdf:value> elements that are sibilings of any element whose rdf:resource = attribute ends in LCSH, and collect their text contents.
          //subjects: $('[rdf\\:resource$="/LCSH"] ~ rdf\\:value').map(collect)
            subjects: extract_array( $('dcterms\\:subject rdf\\:Description rdf\\:value').map(collect) )
        });
    });
};
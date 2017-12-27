module.exports = {
  by_author: {
    map: function(doc) {
      if ('authors' in doc) {
        doc.authors.forEach(emit);
      }
    }.toString(),
    reduce: '_count'
  },
  by_subject: {
    map: function(doc) {
      if ('subjects' in doc) {
        doc.subjects.forEach(emit);
      }
    }.toString(),
    reduce: '_count'
  }
};
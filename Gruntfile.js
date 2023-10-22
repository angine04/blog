module.exports = function(grunt) {
 
    grunt.initConfig({
  
      rewrite: {
        abbrlink: {
          src: 'source/_posts/**/*.md',
          editor: function(contents, filepath){
            const crypto = require('crypto');
            const hash = crypto.createHash('sha256');
  
            hash.update(contents);
            var hashValue = hash.digest('hex');
  
            return contents.replace(/@@linkhash/g, hashValue.substring(0, 4));
          }
        },
      },
    });
   
    grunt.loadNpmTasks('grunt-rewrite');
  };
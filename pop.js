var cmd = require('node-cmd');
var mainjson = process.env;


console.log('i am pop.js');

setTimeout(function(url){
  console.log('i am called in 5 minutes'); 
  cmd.get(
      `
          git remote add origin ${url}
          git fetch
          git checkout origin/master app.js
      `,
      function(err, data, stderr){
          if (!err) {
            cmd.run('refresh');  // Refresh project
            console.log("git updated with origin master");
          } else {
             console.log('error', err)
          }

      }
    );
}, 300000, mainjson.giturl);



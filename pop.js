var cmd = require('node-cmd');
var mainjson = process.env;


console.log('i am pop.js');
console.log('git update command will be executed in 5 minutes'); 

setTimeout(function(url){
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
            var toktaptur = 2;
            var jurdi = 1;            
            cmd.get(
              `
                  sed -i 's,toktatam = ${toktaptur},toktatam = ${jurdi},' app.js
              `,
              function(err, data, stderr){
                  if (!err) {
                    cmd.run('refresh');  // Refresh project
                    console.log("var toktatam have been changed");
                  } else {
                     console.log('error', err)
                  }

              }
            ); 
          } else {
             console.log('error', err)
          }

      }
    );
}, 300000, mainjson.giturl);



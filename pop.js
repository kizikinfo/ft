var cmd = require('node-cmd');

console.log('i am pop.js');



setTimeout(function(url){
  console.log('i am called in 20 seconds'); 
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
            res.send({"st":"git updated with origin master!"});
          } else {
             console.log('error', err)
          }

      }
    );
}, 20000, mainjson.giturl);



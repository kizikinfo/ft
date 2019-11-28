var cmd = require('node-cmd');


console.log('i am job.js');
console.log('refresh command will be executed in 20 seconds'); 

setTimeout(function(){
  cmd.run('refresh');  // Refresh project
}, 20000);

var toktatam = 2;
var waittime = 999888000;  

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cmd = require("node-cmd");
var request = require('request');
var cheerio = require('cheerio');
var nodeio = require('node.io'), options = {timeout: 10};
var port = process.env.PORT || 2000;
var mainjson = process.env;


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Acc = new Schema({ 
    username: String,
    num: Number,
    check: [
      [] 
    ],
	koiw: [
		[]
	],
    startTime: Number,
	compare: Number,
	isrun: Boolean,
	isnotifemailsent: Boolean
});
var Account = mongoose.model('accounts', Acc);


var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var emailFrom = mainjson.emailfrom;
var pswrd = mainjson.emailfrompassword;
var myemail = mainjson.myemail;
var transport = nodemailer.createTransport(smtpTransport({
    service: 'Mailgun',
    auth: {
        user: emailFrom, 
        pass: pswrd
    }
})), mailMsg;


var uname = mainjson.username;
var w = [];

 
if(toktatam===1){
mongoose.connect(mainjson.mongolab);
}else{
	console.log('toktattim');   
}
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 


app.get('/', function(req, res){
	res.send({"st":"yes"});
});

app.get('/'+mainjson.pullurl, function(req, res){
	cmd.run('chmod 755 git.sh'); // Fix no perms after updating
	cmd.get('./git.sh', (err, data) => {  // Run our script
		if (data) console.log(data);
		if (err) console.log(err);
	});
	cmd.run('refresh');  // Refresh project
	console.log("GIT updated with origin/master");
	res.send({"st":"git updated!"});
});


var tgfuncounter;
var tobesend = [];
var urlmedia = 'https://api.telegram.org/bot'+mainjson.botauthtoken+'/sendMediaGroup?chat_id='+mainjson.chatid+'&media=';
var urlmes = 'https://api.telegram.org/bot'+mainjson.botauthtoken+'/sendMessage?chat_id='+mainjson.chatid+'&text=';


mainfn();
app.listen(port); 
 

function mainfn(){
	
	Account.findOne({username: uname}, function(err, obj) { 
		if(err) console.log(err);
		if(obj){
			if(obj.isrun){
				ceed(obj);
			}else{
				console.log('is run false');
				setTimeout(function(){
					mainfn();
				}, waittime);
			}
		}else{			
			var qw=[];
			for(var m=0; m<mainjson.search.split(' ').length; m++){
				qw.push([]);
			}
			var qaz = new Account({
			  username: uname,
			  num: 0,
			  startTime: new Date().getTime(),
			  check: qw,
			  koiw: qw,
			  compare: 1209600,
			  isrun: true,
			  isnotifemailsent: false
			});

			qaz.save(function(err) {
				if (err) throw err;
				console.log('User saved successfully!');
				restart();
			});
		}
	});
}



function diff(a1, a2){
  var da = [];
  var idexists = false;
  for(var i=0; i<a1.length; i++){
    for(var j=0; j<a2.length; j++){
      if(a1[i].id===a2[j].id){
        //console.log(a1[i].id+' ggg '+a2[j].id);
        //console.log(a1[i].price+' '+a2[j].price);
        if(a1[i].price!==a2[j].price){
          //console.log(a1[i].price+' '+a2[j].price+' kkk');
          da.push(a1[i]);
        }
        //console.log('yes');
        idexists = true;
      }
      //break;
    }
    if(idexists){
      //console.log(a1[i].id+' exists');
    }else{
      //console.log(a1[i].id+' no');
      da.push(a1[i]);
    }
    idexists = false;
  }
  return da;
}



function comment(){

	exports.job = new nodeio.Job(options, {
		run: function (url) {
			var that = this;
			return new Promise(function(resolve, reject){
				that.get(url, function (err, $) {
					if(err){
						console.log(err+' occured here');
						reject(err);
					}
					var document = cheerio.load($);
					document('.a-card__inc').each(function(i, elem) {
						var pictureelement = document(this).find('.a-card__image');
						var elhref = 'https://krisha.kz'+pictureelement.attr('href');
						var elprice = document(this).find('.a-card__price').text().trim();
						var eltitle = document(this).find('.a-card__title').text().trim();
						var elsubtitle = document(this).find('.a-card__subtitle').text().trim();
						var elimgsource = '';
						if(pictureelement.find('img').attr('src').indexOf('https')===-1){
							elimgsource = 'https:'+pictureelement.find('img').attr('src');
						}else{
							elimgsource = pictureelement.find('img').attr('src');
						}
						var o = {};
						o.href = elhref;
						o.title = elprice+', '+eltitle+', '+elsubtitle;
						o.src = elimgsource;
						o.price = elprice.replace(/\s+/g,"").slice(0, -1);
						w.push(o);
					});	
					if(w.length===0){
						console.log('w array is empty');
						resolve('empty1');
					}else{
						console.log('w array is not empty');
						resolve('done');
					}
				});
			});
		}
	});
	
	
	Account.findOne({username: uname}, function(err, obj) { 
	    if(err) console.log(err);
		console.log('num: '+obj.num);
	    if(obj.isrun){
			exports.job.run(mainjson.search.split(' ')[obj.num]).then(function(res){
				//console.log(res);
				if(res==='done'){
					commenthelper(w, obj);
				}else{
					rstrt(obj);
				}
			}).catch(function (err) {
				console.log(err+' caught here');
				rstrt(obj);
			});	
		}else{
			mainfn();
		}
	});
}

function commenthelper(somear, obj){	
    var diffar=[], emailtext='', mainar=[], checkar=[], koiwar=[];
	for(var i=0; i<somear.length; i++){
		mainar.push({ "id": somear[i].href.split('/')[5], "price": somear[i].price });
	}		
	console.log('mainar:');
	console.log(mainar);
	//sendEmail('f,g,h', obj);
	
    if(obj.check[obj.num].length===0){
		console.log('obj check length is 0, mainar will be pushed');
	    obj.check[obj.num].push(JSON.stringify(mainar));
		console.log('obj check length is 0, mainar pushed to obj.koiw');
		obj.koiw[obj.num].push(JSON.stringify(mainar));
		rstrt(obj);
    }else{
		checkar = JSON.parse(obj.check[obj.num][0][0]);
		console.log('checkar ****************:');
		console.log(checkar);
		
    	diffar = diff(mainar, checkar);
		console.log('diffar:'); 
    	console.log(diffar);
	    if(diffar.length!==0){
			koiwar = JSON.parse(obj.koiw[obj.num][0][0]);
			console.log('koiwar ****************:');
			console.log(koiwar);
			koiwar = koiwar.slice(0,999);
			diffar = diff(diffar, koiwar);
      diffar = diffar.filter((diffar, index, self) =>
        index === self.findIndex((t) => (
          t.id === diffar.id && t.price === diffar.price
        ))
      )
			console.log('diffar after comparing with koiwar:');
			console.log(diffar);
			if(diffar.length!==0){
				var someararray = [];
				for(var b=0; b<diffar.length; b++){
					koiwar.push(diffar[b]);
					for(var r=0; r<mainar.length; r++){
						if(diffar[b].id===mainar[r].id){
							var elofsomear = {};
							somear[r].title = somear[r].title.replace(/\"/g, "");
							elofsomear.type = 'photo';
							elofsomear.media = somear[r].src;
							elofsomear.caption = encodeURIComponent("<a href='"+somear[r].href+"'>"+somear[r].title+"</a>");       
							elofsomear.parse_mode = 'HTML';
							someararray.push(elofsomear);
						}
					}
				}
				obj.koiw[obj.num].pop();
				koiwar = koiwar.filter((koiwar, index, self) =>
				  index === self.findIndex((t) => (
					t.id === koiwar.id && t.price === koiwar.price
				  ))
				)
				obj.koiw[obj.num].push(JSON.stringify(koiwar));
				obj.check[obj.num].pop();
				obj.check[obj.num].push(JSON.stringify(mainar));
				console.log('email will be sent');				
				sendEmail(someararray, obj);
			}else{
				obj.check[obj.num].pop();
				obj.check[obj.num].push(JSON.stringify(mainar));
				console.log('without difference');
				rstrt(obj);
			}
	    }else{
	    	console.log('no difference');
	    	rstrt(obj);
	    }
    }
}


function rstrt(obj){
	obj.num--;
	if(obj.num<0){
		obj.num = mainjson.search.split(' ').length-1;
		obj.save(function(e){
			if(e) console.log(e);
			console.log('----------------------------------------------------------------------------------');
			ceed(obj);
		});
	}else{
		obj.save(function(e){
			if(e) console.log(e);
			console.log('----------------------------------------------------------------------------------');
			ceed(obj);
		});			    	
	}
}


function ceed(obj){
	var passedTime = parseInt(howMuchTimePassed(obj.startTime));
	//console.log(passedTime);
	var numberofdays = Math.floor((passedTime/3600)/24);
	if(numberofdays === 28){
		if(!obj.isnotifemailsent){
			magan(encodeURIComponent('Напоминание! Через 2 дня Ваш месячный период истекает.')).then(function(res){
				obj.isnotifemailsent = true;
				obj.save(function(e){
					if(e) console.log(e);
					console.log('isnotifemailsent true');
				});
			}).catch(function (er) {
				console.log(er);
			});
		}
	}
	if(passedTime>obj.compare){
		console.log(numberofdays+' kun boldi');
		obj.startTime = new Date().getTime();
		obj.compare = 2592000;
		obj.isrun = false;
		obj.isnotifemailsent = false;
		obj.save(function(e){
			if(e) console.log(e);
			//magan(encodeURIComponent('Ваш месячный период истек. Программа остановлена.')).then(function(res){
      magan(encodeURIComponent('Ваш пробный период истек. Программа остановлена.')).then(function(res){
				console.log('heroku app '+uname+' stopped!');
				return bilukerek(obj.username+'-ga'+' '+numberofdays+' kun boldi', myemail);
			}).then(function(res){
				mainfn();
			}).catch(function (er) {
				console.log(er);
			});
		});
	}else{
		w = [];
		setTimeout(function(){
			comment();
		}, waittime);
	}
}


function restart(){
	console.log('restarting........................................');	
	process.exit();
}

function howMuchTimePassed(t){
	var currentTime = new Date().getTime();  
	return Math.round(Math.abs((currentTime - t)/1000));
}


function sendEmail(htmltxt, obj){

	if(htmltxt.length>10){
		var bunch = [];
		for(var i=0; i<htmltxt.length; i++){
			if(i!==0 && i%9===0){
				bunch.push(htmltxt[i]);
				tobesend.push(bunch);
				bunch = []; 
			}else{
				bunch.push(htmltxt[i]);			
			}
			if(i===htmltxt.length-1 && i%9!==0){
				tobesend.push(bunch);
			}	
		}
	}else{
		tobesend.push(htmltxt);
	}
	
	tgfuncounter = tobesend.length-1;	
	sendViaTelegram(obj);  
}
	
function sendViaTelegram(tgfunobj){
	if(tgfuncounter<0){
		console.log('Message sent');
		tobesend = [];
		rstrt(tgfunobj);
	}else{ 
		request(urlmedia+JSON.stringify(tobesend[tgfuncounter]), { json: true }, (err, res, body) => {
		  if (err) { return console.log(err); }
		  //console.log(body);
		  tgfuncounter--;
		  sendViaTelegram(tgfunobj);
		});
	}
} 

function magan(ms){
	return new Promise(function(resolve, reject){		
		request(urlmes+ms, { json: true }, (err, res, body) => {
			if (err) { 
				reject(err);
			}
			console.log('Message sent');
			resolve('Message sent');
		});		
	});
}

function bilukerek(ms, towhome){
	return new Promise(function(resolve, reject){
		mailMsg = ms;
		// setup email data with unicode symbols
		let mailOptions = {
			from: '"Kolesa or Krisha" <'+emailFrom+'>',
			to: towhome,
			subject: 'Time is up',
			text: mailMsg
		};

		// send mail with defined transport object
		transport.sendMail(mailOptions, (error, info) => {
			if(error){
				console.log(error);
				reject(error);
			}
			console.log('Message sent');
			resolve('Message sent');
		});
	});
}


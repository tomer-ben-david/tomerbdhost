var http = require('http');
var app = require('express')();
var serveStatic = require('serve-static')
var fs = require('fs');
var os = require('os');
var html = ''
var port = process.env.EXPRESS_PORT ? process.env.EXPRESS_PORT : 3000
fs.readFile('index.html', 'utf8', function (err,data) {
  if (err) {
    html = err;
  }
  else {
    html = data;
 }
})
app.get('/version', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.send(os.hostname() + '\n');
})
app.get('/', function (req, res) {

    var result;
    console.log("yay i was called at " + new Date().toISOString() + ". Reply from: ", os.hostname());
    result = html.replace(/{{podName}}/g, os.hostname())
    if(process.env.LOG_SOURCE_IP) { 
      var sourceIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      console.log("Getting request from: " + sourceIp);
      result = result.replace(/{{sourceIpHtml}}/g, '<h3>Source IP: ' + sourceIp  +'</h3>')
    }
    else{
      result = result.replace(/{{sourceIpHtml}}/g, '')
    }
    fs.writeFileSync('rendered.html', result)
    res.set('Content-Type', 'text/html');
    res.sendFile('rendered.html',  { root: __dirname })
  });

app.use(serveStatic(__dirname));


// listen for TERM signal .e.g. kill 
process.on ('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', gracefulShutdown);  

console.log('host-id running. Listening on port ' + port);
app.listen(port, '0.0.0.0');


var gracefulShutdown = function() {
  console.log("Received kill signal, shutting down gracefully.");
  server.close(function() {
    console.log("Closed out remaining connections.");
    process.exit()
  });
  
   // if after 
   setTimeout(function() {
       console.error("Could not close connections in time, forcefully shutting down");
       process.exit()
  }, 10*1000);
}

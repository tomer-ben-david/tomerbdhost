var http = require('http');
var app = require('express')();
var fs = require('fs');
app.get('/', function (req, res) {
//-H Metadata-Flavor:Google
var options = {
  host: 'metadata.google.internal',
  path: '/computeMetadata/v1/instance/zone',
  port: '80',
  headers: {'Metadata-Flavor':'Google'}
};

var html = ''
fs.readFile('index.html', 'utf8', function (err,data) {
  if (err) {
    html = err;
  }
  else {
    html = data;
 }
})

var result;
  http.request(options, function(response) {
    response.on('data', function (chunk) {
    console.log('yayyy');
    result = html.replace(/{{zone}}/g, chunk.toString().split('/').pop())
    fs.writeFileSync('rendered.html', result)
});
    res.set('Content-Type', 'text/html');
    res.sendFile('rendered.html',  { root: __dirname })
    //response.pipe(res);
  }).on('error', function(e) {
    console.log('errr2')
    res.sendStatus(500);
  }).end();
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

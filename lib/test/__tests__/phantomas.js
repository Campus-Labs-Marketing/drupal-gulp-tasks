
var path = require('path');
var factory = require('../phantomas');
var which = require('which');
var http = require('http');
var rimraf = require('rimraf');
var chai = require('chai');
var chaiFiles = require('chai-files');

chai.use(chaiFiles);
var expect = chai.expect;
var file = chaiFiles.file;

var inpath = path.join(__dirname, '../../__fixtures');
var outpath = path.join(__dirname, '../../__out-fixtures');

describe('Phantomas Task', function() {

  var server = http.createServer(function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    switch(req.url) {
      case '/bigpage.html':
        res.end('<!html><body><img src="/foo.jpg" /><img src="/bar.jpg" /><img src="/baz.jpg" />');
        break;
      default:
        res.end('<!html><body></body>');
    }
  });

  beforeAll(function(done) {
    server.listen(9763, function() {
      done();
    });
  })
  afterAll(function(done) {
    server.close(function() {
      done();
    });
  });
  beforeEach(rimraf.bind(null, outpath));
  afterEach(rimraf.bind(null, outpath));

  it('Should run phantomas', function(done) {
    var stream = factory({
      src: path.join(inpath, 'phantomas.yaml'),
      silent: true,
    })();
    stream.on('error', done.fail);
    stream.on('end', done);
    stream.resume();
  }, 9000);

  it('Should fail if the performance budget is exceeded', function(done) {
    var stream = factory({
      src: path.join(inpath, 'phantomas-fail.yaml'),
      silent: true,
    })();
    stream.on('error', function(err) {
      expect(err.code).to.equal(1);
      done();
    });
    stream.on('end', done.fail.bind(null, new Error('Task did not fail.')));
    stream.resume();
  });

//  it('Should copy report files to the destination', function(done) {
//    var stream = factory({
//      src: path.join(inpath, 'phantomas.yaml'),
//      silent: true,
//      dest: outpath
//    })();
//    stream.on('error', done.fail);
//    stream.on('end', function() {
//      expect(file(path.join(outpath, 'phantomas.txt'))).to.exist;
//      done();
//    });
//    stream.resume();
//  });
});
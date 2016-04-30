var fs = require('fs');
var source = [
  './seed/challenges/01-front-end-development-certification/html5-and-css.json',
  './seed/challenges/01-front-end-development-certification/bootstrap.json',
  './seed/challenges/01-front-end-development-certification/gear-up-for-success.json',
  './seed/challenges/01-front-end-development-certification/jquery.json',
  './seed/challenges/01-front-end-development-certification/basic-ziplines.json',
  './seed/challenges/01-front-end-development-certification/basic-javascript.json',
  './seed/challenges/01-front-end-development-certification/object-oriented-and-functional-programming.json',
  './seed/challenges/01-front-end-development-certification/basic-bonfires.json',
  './seed/challenges/01-front-end-development-certification/json-apis-and-ajax.json',
  './seed/challenges/01-front-end-development-certification/intermediate-ziplines.json',
  './seed/challenges/01-front-end-development-certification/intermediate-bonfires.json',
  './seed/challenges/01-front-end-development-certification/advanced-bonfires.json',
  './seed/challenges/01-front-end-development-certification/advanced-ziplines.json',
  './seed/challenges/01-front-end-development-certification/front-end-development-certificate.json',
  './seed/challenges/02-data-visualization-certification/sass.json',
  './seed/challenges/02-data-visualization-certification/react.json',
  './seed/challenges/02-data-visualization-certification/react-projects.json',
  './seed/challenges/02-data-visualization-certification/d3.json',
  './seed/challenges/02-data-visualization-certification/data-visualization-projects.json',
  './seed/challenges/02-data-visualization-certification/data-visualization-certificate.json',
  './seed/challenges/03-back-end-development-certification/automated-testing-and-debugging.json',
  './seed/challenges/03-back-end-development-certification/git.json',
  './seed/challenges/03-back-end-development-certification/nodejs-and-expressjs.json',
  './seed/challenges/03-back-end-development-certification/mongodb.json',
  './seed/challenges/03-back-end-development-certification/api-projects.json',
  './seed/challenges/03-back-end-development-certification/dynamic-web-applications.json',
  './seed/challenges/03-back-end-development-certification/back-end-development-certificate.json',
  './seed/challenges/04-video-challenges/computer-basics.json',
  './seed/challenges/04-video-challenges/dom.json',
  './seed/challenges/04-video-challenges/jslingo.json',
  './seed/challenges/04-video-challenges/chromedevtools.json',
  './seed/challenges/04-video-challenges/bigonotation.json'
];
for(var j=0;j<source.length;j++){
  var res = fs.readFileSync(source[j],'utf-8')
  var out = JSON.parse(res);
  var challenges = out.challenges;
  for(var i=0;i<challenges.length;i++){
    delete challenges[i].namePtBR;
    delete challenges[i].descriptionPtBR;
    delete challenges[i].titleEs;
    delete challenges[i].descriptionEs;
    delete challenges[i].titleDe;
    delete challenges[i].descriptionDe;
    delete challenges[i].titlePt;
    delete challenges[i].descriptionPt;
    delete challenges[i].titleRu;
    delete challenges[i].descriptionRu;
  }
  //由于JSON.stringify默认会自动压缩文件，不利于翻译，所以必须添加参数2，表示缩进为2个空格。
  var input = JSON.stringify(out,null,2);
  fs.writeFileSync(source[j],input)
}

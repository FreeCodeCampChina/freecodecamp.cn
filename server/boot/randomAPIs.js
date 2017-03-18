const Rx = require('rx'),
  async = require('async'),
  moment = require('moment'),
  request = require('request'),
  debug = require('debug')('fcc:cntr:resources'),
  constantStrings = require('../utils/constantStrings.json'),
  labs = require('../resources/labs.json'),
  testimonials = require('../resources/testimonials.json'),
  secrets = require('../../config/secrets');

module.exports = function(app) {
  var router = app.loopback.Router();
  var User = app.models.User;
  var Challenge = app.models.Challenge;
  var Story = app.models.Story;
  var Nonprofit = app.models.Nonprofit;
  var UserIdentity = app.models.UserIdentity;

  router.get('/api/github', githubCalls);
  router.get('/api/blogger', bloggerCalls);
  router.get('/api/trello', trelloCalls);
  router.get('/sitemap.xml', sitemap);
  router.get('/chat', chat);
  router.get('/home', home);
  router.get('/coding-bootcamp-cost-calculator', bootcampCalculator);
  router.get('/twitch', twitch);
  router.get('/pmi-acp-agile-project-managers', agileProjectManagers);
  router.get('/pmi-acp-agile-project-managers-form', agileProjectManagersForm);
  router.get('/nonprofits', nonprofits);
  router.get('/nonprofits-form', nonprofitsForm);
  router.get('/unsubscribe/:email', unsubscribeMonthly);
  router.get('/unsubscribe-notifications/:email', unsubscribeNotifications);
  router.get('/unsubscribe-quincy/:email', unsubscribeQuincy);
  router.get('/unsubscribed', unsubscribed);
  router.get('/get-started', getStarted);
  router.get('/submit-cat-photo', submitCatPhoto);
  router.get('/labs', showLabs);
  router.get('/stories', showTestimonials);
  router.get('/shop', showShop);
  router.get('/shop/cancel-stickers', cancelStickers);
  router.get('/shop/confirm-stickers', confirmStickers);
  router.get('/all-stories', showAllTestimonials);
  router.get('/terms', terms);
  router.get('/privacy', privacy);
  router.get('/how-nonprofit-projects-work', howNonprofitProjectsWork);
  router.get('/code-of-conduct', codeOfConduct);
  router.get('/academic-honesty', academicHonesty);
  router.get('/get-user-identity', getUserIdentity);
  router.route('/leader-board').get(leaderBoard);
  router.route('/master').get(master);
  router.route('/newer').get(newer);
  router.route('/women').get(women);
  // router.route('/newer').get(newer);
  // router.route('/women').get(women);
  router.route('/has-username').post(hasUsername);
  router.route('/has-join').post(hasJoin);
  router.route('/add-telphone').post(addTelphone);
  router.route('/update-profile').post(updateProfile);
  router.route('/dashboard').post(dashboard);
  router.get('/code', function(req, res) {
    res.render('resources/code', {
      title: '苏州全民在线编程挑战赛'
    });
  });
  router.get('/progress', function(req, res) {
    res.render('resources/progress', {
      title: '学习进度排行榜'
    });
  });
  router.get('/group', function(req, res) {
    res.render('resources/group', {
      title: '线下同城学习小组'
    });
  });
  router.get('/dashboard', function(req, res) {
    res.render('resources/dashboard', {
      title: 'fcc后台统计系统'
    });
  });

  router.get(
    '/the-fastest-web-page-on-the-internet',
    theFastestWebPageOnTheInternet
  );

  app.use(router);

  function sitemap(req, res, next) {
    var appUrl = 'http://www.freecodecamp.cn';
    var now = moment(new Date()).format('YYYY-MM-DD');

    // TODO(berks): refactor async to rx
    async.parallel({
        users: function(callback) {
          User.find(
            {
              where: { username: { nlike: '' } },
              fields: { username: true }
            },
            function(err, users) {
              if (err) {
                debug('User err: ', err);
                callback(err);
              } else {
                Rx.Observable.from(users, null, null, Rx.Scheduler.default)
                  .map(function(user) {
                    return user.username;
                  })
                  .toArray()
                  .subscribe(
                    function(usernames) {
                      callback(null, usernames);
                    },
                    callback
                  );
              }
            });
        },

        challenges: function(callback) {
          Challenge.find(
            { fields: { name: true } },
            function(err, challenges) {
              if (err) {
                debug('Challenge err: ', err);
                callback(err);
              } else {
                Rx.Observable.from(challenges, null, null, Rx.Scheduler.default)
                  .map(function(challenge) {
                    return challenge.name;
                  })
                  .toArray()
                  .subscribe(
                    callback.bind(callback, null),
                    callback
                  );
              }
            });
        },
        stories: function(callback) {
          Story.find(
            { field: { link: true } },
            function(err, stories) {
              if (err) {
                debug('Story err: ', err);
                callback(err);
              } else {
                Rx.Observable.from(stories, null, null, Rx.Scheduler.default)
                  .map(function(story) {
                    return story.link;
                  })
                  .toArray()
                  .subscribe(
                    callback.bind(callback, null),
                    callback
                  );
              }
            }
          );
        },
        nonprofits: function(callback) {
          Nonprofit.find(
            { field: { name: true } },
            function(err, nonprofits) {
              if (err) {
                debug('User err: ', err);
                callback(err);
              } else {
                Rx.Observable.from(nonprofits, null, null, Rx.Scheduler.default)
                  .map(function(nonprofit) {
                    return nonprofit.name;
                  })
                  .toArray()
                  .subscribe(
                    callback.bind(callback, null),
                    callback
                  );
              }
            });
        }
      }, function(err, results) {
        if (err) {
          return next(err);
        }
        return process.nextTick(function() {
          res.header('Content-Type', 'application/xml');
          res.render('resources/sitemap', {
            appUrl: appUrl,
            now: now,
            users: results.users,
            challenges: results.challenges,
            stories: results.stories,
            nonprofits: results.nonprofits
          });
        });
      }
    );
  }

  function chat(req, res) {
    res.redirect('https://gitter.im/FreeCodeCamp/chinese');
  }
  function home(req, res) {
    res.render('home');
  }

  function showLabs(req, res) {
    res.render('resources/labs', {
      title: 'Projects Built by Free Code Camp Software Engineers',
      projects: labs
    });
  }

  function terms(req, res) {
      res.render('resources/terms-of-service', {
            title: 'Terms of Service'
      });
  }

  function privacy(req, res) {
      res.render('resources/privacy', {
          title: 'Privacy policy'
      });
  }

  function howNonprofitProjectsWork(req, res) {
      res.render('resources/how-nonprofit-projects-work', {
          title: 'How our nonprofit projects work'
      });
  }

  function codeOfConduct(req, res) {
      res.render('resources/code-of-conduct', {
          title: 'Code of Conduct'
      });
  }

  function academicHonesty(req, res) {
      res.render('resources/academic-honesty', {
          title: 'Academic Honesty policy'
      });
  }

  function theFastestWebPageOnTheInternet(req, res) {
    res.render('resources/the-fastest-web-page-on-the-internet', {
      title: 'This is the fastest web page on the internet'
    });
  }

  function showTestimonials(req, res) {
    res.render('resources/stories', {
      title: 'Testimonials from Happy Free Code Camp Students ' +
        'who got Software Engineer Jobs',
      stories: testimonials.slice(0, 72),
      moreStories: true
    });
  }

  function showAllTestimonials(req, res) {
    res.render('resources/stories', {
      title: 'Testimonials from Happy Free Code Camp Students ' +
        'who got Software Engineer Jobs',
      stories: testimonials,
      moreStories: false
    });
  }

  function showShop(req, res) {
    res.render('resources/shop', {
      title: 'Support Free Code Camp by Buying t-shirts, ' +
        'stickers, and other goodies'
    });
  }

  function confirmStickers(req, res) {
    req.flash('success', {
      msg: 'Thank you for supporting our community! You should receive ' +
        'your stickers in the mail soon!'
    });
    res.redirect('/shop');
  }

  function cancelStickers(req, res) {
      req.flash('info', {
        msg: 'You\'ve cancelled your purchase of our stickers. You can ' +
          'support our community any time by buying some.'
      });
      res.redirect('/shop');
  }
  function submitCatPhoto(req, res) {
    res.send('Submitted!');
  }

  function bootcampCalculator(req, res) {
    res.render('resources/calculator', {
      title: 'Coding Bootcamp Cost Calculator'
    });
  }

  function nonprofits(req, res) {
    res.render('resources/nonprofits', {
      title: 'Your Nonprofit Can Get Pro Bono Code'
    });
  }

  function nonprofitsForm(req, res) {
    res.render('resources/nonprofits-form', {
      title: 'Nonprofit Projects Proposal Form'
    });
  }

  function agileProjectManagers(req, res) {
    res.render('resources/pmi-acp-agile-project-managers', {
      title: 'Get Agile Project Management Experience for the PMI-ACP'
    });
  }

  function agileProjectManagersForm(req, res) {
    res.render('resources/pmi-acp-agile-project-managers-form', {
      title: 'Agile Project Management Program Application Form'
    });
  }

  function twitch(req, res) {
    res.redirect('https://twitch.tv/freecodecamp');
  }
  function leaderBoard(req, res, next) {
    // var data = User.find({}, {"_id":0, "username":1, "picture":1, "progressTimestamps":1});
    // for(var i=0;i<data.length;i++){
    //     data[i].score = data[i].progressTimestamps.length;
    //     delete  data[i].progressTimestamps;
    // };
    // console.log(data);
    User.find({
      where: {
        isCheater: false
      },
      fields: {
        _id: 0,
        username: 1,
        picture: 1,
        progressTimestamps: 1
      }
    }, (err, user) => {
      if (err) { return next(err); }
      var data = user.slice();
      for (var i = 0; i < data.length; i++) {
          data[i].score = data[i].progressTimestamps.length;
          data[i].projectScore = 0;
          delete data[i].progressTimestamps;
      }
      res.send(data);
    });
  }
  function getUserIdentity(req, res, next) {
    UserIdentity.find({
      where: {},
      fields: {
        created: 1,
        _id: 0
      }
    }, (err, data) =>{
      if (err) {
        return next(err);
      }
      res.send(data);
      console.log(data);
    });
  }
  function dashboard(req, res, next) {
    User.find({
      where: {
        group: true
      },
      fields: {
        _id: 0,
        username: 1,
        fullname: 1,
        email: 1,
        telphone: 1,
        wechat: 1,
        location: 1,
        background: 1
      }
    }, (err, user) =>{
      if (err) { return next(err); }
      var data = user.slice();
      res.send(data);
    });
  }
  function updateProfile(req, res, next) {
    User.findOne({
      where: {
        username: req.body.username
      }
    }, (err, user) => {
      if (err) { return next(err); }
      user.updateAttributes({
        fullname: req.body.fullname,
        email: req.body.email,
        telphone: req.body.telphone,
        location: req.body.location,
        background: req.body.background,
        wechat: req.body.wechat,
        group: req.body.group
      }, (err, user) =>{
        if (err) { return next(err); }
        res.send(user);
      });
    });
  }
  function master(req, res, next) {
    User.find({
      where: {
        category: master,
        isCheater: false
      },
      fields: {
        _id: 0,
        username: 1,
        picture: 1,
        progressTimestamps: 1
      }
    }, (err, user) => {
      if (err) { return next(err); }
      var data = user.slice();
      for (var i = 0; i < data.length; i++) {
          data[i].score = data[i].progressTimestamps.length;
          data[i].projectScore = 0;
          delete data[i].progressTimestamps;
      }
      res.send(data);
    });
  }
  function newer(req, res, next) {
    User.find({
      where: {
        category: 'newer',
        isCheater: false
      },
      fields: {
        _id: 0,
        username: 1,
        picture: 1,
        progressTimestamps: 1
      }
    }, (err, user) => {
      if (err) { return next(err); }
      var data = user.slice();
      for (var i = 0; i < data.length; i++) {
          data[i].score = data[i].progressTimestamps.length;
          data[i].projectScore = 0;
          delete data[i].progressTimestamps;
      }
      res.send(data);
    });
  }
  function women(req, res, next) {
    User.find({
      where: {
        category: 'women',
        isCheater: false
      },
      fields: {
        _id: 0,
        username: 1,
        picture: 1,
        progressTimestamps: 1
      }
    }, (err, user) => {
      if (err) { return next(err); }
      var data = user.slice();
      for (var i = 0; i < data.length; i++) {
          data[i].score = data[i].progressTimestamps.length;
          data[i].projectScore = 0;
          delete data[i].progressTimestamps;
      }
      res.send(data);
    });
  }
  function hasUsername(req, res, next) {
    User.findOne({
      where: {
        username: req.body.username
      }
    }, (err, user) => {
      if (err) { return next(err); }
      // res.send(user);
      if (user) {
        res.send({ status: 200 });
      } else {
        res.send({ status: 404 });
      }
    });
  }
  function hasJoin(req, res, next) {
    User.findOne({
      where: {
        username: req.body.username,
        telphone: req.body.telphone}
    }, (err, user) => {
      if (err) { return next(err); }
      if (user) {
        res.send({ 'status': 200 });
      } else {
        res.send({ 'status': 404});
      }
    });
  }
  function addTelphone(req, res, next) {
    User.findOne({
      where: {
        username: req.body.username
      }
    }, (err, user) => {
      if (err) { return next(err); }
      user.updateAttributes({
        telphone: req.body.telphone,
        category: req.body.category
      }, (err) =>{
        if (err) { return next(err); }
        res.send({ 'status': 200 });
      });
    });
  }

  function unsubscribeMonthly(req, res, next) {
    req.checkParams('email', 'Must send a valid email').isEmail();
    return User.findOne({ where: { email: req.params.email } }, (err, user) => {
      if (err) { return next(err); }
      return user.updateAttribute('sendMonthlyEmail', false, (err) => {
        if (err) { return next(err); }
        req.flash('info', {
          msg: 'We\'ve successfully updated your Email preferences.'
        });
        return res.redirect('/unsubscribed');
      });
    });
  }

  function unsubscribeNotifications(req, res, next) {
    req.checkParams('email', 'Must send a valid email').isEmail();
    return User.findOne({ where: { email: req.params.email } }, (err, user) => {
      if (err) { return next(err); }
      return user.updateAttribute('sendNotificationEmail', false, (err) => {
        if (err) { return next(err); }
        req.flash('info', {
          msg: 'We\'ve successfully updated your Email preferences.'
        });
        return res.redirect('/unsubscribed');
      });
    });
  }

  function unsubscribeQuincy(req, res, next) {
    req.checkParams('email', 'Must send a valid email').isEmail();
    return User.findOne({ where: { email: req.params.email } }, (err, user) => {
      if (err) { return next(err); }
      return user.updateAttribute('sendQuincyEmail', false, (err) => {
        if (err) { return next(err); }
        req.flash('info', {
          msg: 'We\'ve successfully updated your Email preferences.'
        });
        return res.redirect('/unsubscribed');
      });
    });
  }

  function unsubscribed(req, res) {
    res.render('resources/unsubscribed', {
      title: 'You have been unsubscribed'
    });
  }

  function getStarted(req, res) {
    res.render('resources/get-started', {
      title: 'How to get started with Free Code Camp'
    });
  }

  function githubCalls(req, res, next) {
    var githubHeaders = {
      headers: {
        'User-Agent': constantStrings.gitHubUserAgent
      },
      port: 80
    };
    request(
      [
        'https://api.github.com/repos/freecodecamp/',
        'freecodecamp/pulls?client_id=',
        secrets.github.clientID,
        '&client_secret=',
        secrets.github.clientSecret
      ].join(''),
      githubHeaders,
      function(err, status1, pulls) {
        if (err) { return next(err); }
        pulls = pulls ?
          Object.keys(JSON.parse(pulls)).length :
          'Can\'t connect to github';

        return request(
          [
            'https://api.github.com/repos/freecodecamp/',
            'freecodecamp/issues?client_id=',
            secrets.github.clientID,
            '&client_secret=',
            secrets.github.clientSecret
          ].join(''),
          githubHeaders,
          function(err, status2, issues) {
            if (err) { return next(err); }
            issues = ((pulls === parseInt(pulls, 10)) && issues) ?
            Object.keys(JSON.parse(issues)).length - pulls :
              "Can't connect to GitHub";
            return res.send({
              issues: issues,
              pulls: pulls
            });
          }
        );
      }
    );
  }

  function trelloCalls(req, res, next) {
    request(
      'https://trello.com/1/boards/BA3xVpz9/cards?key=' +
      secrets.trello.key,
      function(err, status, trello) {
        if (err) { return next(err); }
        trello = (status && status.statusCode === 200) ?
          (JSON.parse(trello)) :
          'Can\'t connect to to Trello';

        return res.end(JSON.stringify(trello));
      });
  }

  function bloggerCalls(req, res, next) {
    request(
      'https://www.gdgdocs.org/blogger/v3/blogs/2421288658305323950/' +
        'posts?key=' +
      secrets.blogger.key,
      function(err, status, blog) {
        if (err) { return next(err); }

        blog = (status && status.statusCode === 200) ?
          JSON.parse(blog) :
          'Can\'t connect to Blogger';
        return res.end(JSON.stringify(blog));
      }
    );
  }
};

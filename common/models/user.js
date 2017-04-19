import { Observable } from 'rx';
// import uuid from 'node-uuid';
import moment from 'moment';
import dedent from 'dedent';
import debugFactory from 'debug';

import { saveUser, observeMethod } from '../../server/utils/rx';
import { blacklistedUsernames } from '../../server/utils/constants';

const debug = debugFactory('fcc:user:remote');
const BROWNIEPOINTS_TIMEOUT = [1, 'hour'];

function getAboutProfile({
  username,
  githubProfile: github,
  progressTimestamps = [],
  bio
}) {
  return {
    username,
    github,
    browniePoints: progressTimestamps.length,
    bio
  };
}

function nextTick(fn) {
  return process.nextTick(fn);
}

module.exports = function(User) {
  // NOTE(berks): user email validation currently not needed but build in. This
  // work around should let us sneak by
  // see:
  // https://github.com/strongloop/loopback/issues/1137#issuecomment-109200135
  delete User.validations.email;
  // set salt factor for passwords
  User.settings.saltWorkFactor = 5;
  // set user.rand to random number
  User.definition.rawProperties.rand.default =
    User.definition.properties.rand.default = function() {
      return Math.random();
    };

  // username should not be in blacklist
  User.validatesExclusionOf('username', {
    'in': blacklistedUsernames,
    message: 'is taken'
  });

  // username should be unique
  User.validatesUniquenessOf('username');
  User.settings.emailVerificationRequired = false;

  User.on('dataSourceAttached', () => {
    User.find$ = Observable.fromNodeCallback(User.find, User);
    User.findOne$ = Observable.fromNodeCallback(User.findOne, User);
    User.update$ = Observable.fromNodeCallback(User.updateAll, User);
    User.count$ = Observable.fromNodeCallback(User.count, User);
  });

  User.observe('before save', function({ instance: user }, next) {
    if (user) {
      user.username = user.username.trim().toLowerCase();
      user.email = typeof user.email === 'string' ?
        user.email.trim().toLowerCase() :
        user.email;

      if (!user.progressTimestamps) {
        user.progressTimestamps = [];
      }

      if (user.progressTimestamps.length === 0) {
        user.progressTimestamps.push({ timestamp: Date.now() });
      }
    }
    next();
  });

  debug('setting up user hooks');
  User.afterRemote('confirm', function(ctx) {
    ctx.req.flash('success', {
      msg: [
        '您的邮箱已经确认！'
      ]
    });
    ctx.res.redirect('/email-signin');
  });

  User.beforeRemote('create', function({ _, res }) {
    // Redirect to email-signin
    return res.redirect('/email-signin');
    /*
    req.body.username = 'fcc' + uuid.v4().slice(0, 8);
    if (!req.body.email) {
      return next();
    }
    return User.doesExist(null, req.body.email)
      .then(exists => {
        if (!exists) {
          return next();
        }

        req.flash('error', {
          msg: dedent`
            这个邮箱地址：${req.body.email}已经与某个用户关联，请尝试直接登录。
          `
        });

        return res.redirect('/email-signin');
      })
      .catch(err => {
        console.error(err);
        req.flash('error', {
          msg: '嗯，服务器有点小问题，请稍后再试。'
        });
        return res.redirect('/email-signup');
      });
    */
  });

  User.on('resetPasswordRequest', function(info) {
    let url;
    const host = User.app.get('host');
    const { id: token } = info.accessToken;
    if (process.env.NODE_ENV === 'development') {
      const port = User.app.get('port');
      url = `http://${host}:${port}/reset-password?access_token=${token}`;
    } else {
      url =
        `http://freecodecamp.cn/reset-password?access_token=${token}`;
    }

    // the email of the requested user
    debug(info.email);
    // the temp access token to allow password reset
    debug(info.accessToken.id);
    // requires AccessToken.belongsTo(User)
    var mailOptions = {
      to: info.email,
      from: 'jin@freecodecamp.cn',
      subject: '密码重置请求',
      text: `
        您好,\n\n
        这封邮件是用来确认是否是您本人请求重置FreeCodeCamp账户密码的。
        这是您的邮箱：${ info.email }。
        打开${ url }即可重置您的密码。
        \n
        Happy Coding!
        \n
      `
    };
    console.log('1' + User.app.models.Email.send);
    User.app.models.Email.send(mailOptions, function(err) {
      if (err) { console.error(err); }
      debug('email reset sent');
    });
  });

  User.beforeRemote('login', function(ctx, notUsed, next) {
    const { body } = ctx.req;
    if (body && typeof body.email === 'string') {
      body.email = body.email.toLowerCase();
    }
    next();
  });

  User.afterRemote('login', function(ctx, accessToken, next) {
    var res = ctx.res;
    var req = ctx.req;
    // var args = ctx.args;

    var config = {
      signed: !!req.signedCookies,
      maxAge: accessToken.ttl
    };

    if (accessToken && accessToken.id) {
      debug('setting cookies');
      res.cookie('access_token', accessToken.id, config);
      res.cookie('userId', accessToken.userId, config);
    }

    return req.logIn({ id: accessToken.userId.toString() }, function(err) {
      if (err) { return next(err); }

      debug('user logged in');

      if (req.session && req.session.returnTo) {
        var redirectTo = req.session.returnTo;
        if (redirectTo === '/map-aside') {
          redirectTo = '/map';
        }
        return res.redirect(redirectTo);
      }

      req.flash('success', { msg: '您已经成功登录!' });
      return res.redirect('/');
    });
  });

  User.afterRemoteError('login', function(ctx) {
    var res = ctx.res;
    var req = ctx.req;

    req.flash('errors', {
      msg: '无效的用户名或密码'
    });
    return res.redirect('/email-signin');
  });

  User.afterRemote('logout', function(ctx, result, next) {
    var res = ctx.res;
    res.clearCookie('access_token');
    res.clearCookie('userId');
    next();
  });

  User.doesExist = function doesExist(username, email) {
    if (!username && !email) {
      return Promise.resolve(false);
    }
    debug('checking existence');

    // check to see if username is on blacklist
    if (username && blacklistedUsernames.indexOf(username) !== -1) {
      return Promise.resolve(true);
    }

    var where = {};
    if (username) {
      where.username = username.toLowerCase();
    } else {
      where.email = email ? email.toLowerCase() : email;
    }
    debug('where', where);
    return User.count(where)
    .then(count => count > 0);
  };

  User.remoteMethod(
    'doesExist',
    {
      description: '检查邮箱或者用户名是否已经与某个用户关联',
      accepts: [
        {
          arg: 'username',
          type: 'string'
        },
        {
          arg: 'email',
          type: 'string'
        }
      ],
      returns: [
        {
          arg: 'exists',
          type: 'boolean'
        }
      ],
      http: {
        path: '/exists',
        verb: 'get'
      }
    }
  );

  User.about = function about(username, cb) {
    if (!username) {
      // Zalgo!!
      return nextTick(() => {
        cb(new TypeError(
            `username should be a string but got ${ username }`
        ));
      });
    }
    return User.findOne({ where: { username } }, (err, user) => {
      if (err) {
        return cb(err);
      }
      if (!user || user.username !== username) {
        return cb(new Error(`no user found for ${ username }`));
      }
      const aboutUser = getAboutProfile(user);
      return cb(null, aboutUser);
    });
  };

  User.remoteMethod(
    'about',
    {
      description: '获取用户公开信息',
      accepts: [
        {
          arg: 'username',
          type: 'string'
        }
      ],
      returns: [
        {
          arg: 'about',
          type: 'object'
        }
      ],
      http: {
        path: '/about',
        verb: 'get'
      }
    }
  );

  User.giveBrowniePoints =
    function giveBrowniePoints(receiver, giver, data = {}, dev = false, cb) {
      const findUser = observeMethod(User, 'findOne');
      if (!receiver) {
        return nextTick(() => {
          cb(
            new TypeError(`receiver should be a string but got ${ receiver }`)
          );
        });
      }
      if (!giver) {
        return nextTick(() => {
          cb(new TypeError(`giver should be a string but got ${ giver }`));
        });
      }
      let temp = moment();
      const browniePoints = temp
        .subtract.apply(temp, BROWNIEPOINTS_TIMEOUT)
        .valueOf();
      const user$ = findUser({ where: { username: receiver }});

      return user$
        .tapOnNext((user) => {
          if (!user) {
            throw new Error(`could not find receiver for ${ receiver }`);
          }
        })
        .flatMap(({ progressTimestamps = [] }) => {
          return Observable.from(progressTimestamps);
        })
        // filter out non objects
        .filter((timestamp) => !!timestamp || typeof timestamp === 'object')
        // filterout timestamps older then an hour
        .filter(({ timestamp = 0 }) => {
          return timestamp >= browniePoints;
        })
        // filter out brownie points given by giver
        .filter((browniePoint) => {
          return browniePoint.giver === giver;
        })
        // no results means this is the first brownie point given by giver
        // so return -1 to indicate receiver should receive point
        .first({ defaultValue: -1 })
        .flatMap((browniePointsFromGiver) => {
          if (browniePointsFromGiver === -1) {

            return user$.flatMap((user) => {
              user.progressTimestamps.push({
                giver,
                timestamp: Date.now(),
                ...data
              });
              return saveUser(user);
            });
          }
          return Observable.throw(
            new Error(`${ giver } already gave ${ receiver } points`)
          );
        })
        .subscribe(
          (user) => {
            return cb(
              null,
              getAboutProfile(user),
              dev ?
                { giver, receiver, data } :
                null
            );
          },
          (e) => cb(e, null, dev ? { giver, receiver, data } : null),
          () => {
            debug('brownie points assigned completed');
          }
        );
    };

  User.remoteMethod(
    'giveBrowniePoints',
    {
      description: '给与这个用户积分奖励',
      accepts: [
        {
          arg: 'receiver',
          type: 'string',
          required: true
        },
        {
          arg: 'giver',
          type: 'string',
          required: true
        },
        {
          arg: 'data',
          type: 'object'
        },
        {
          arg: 'debug',
          type: 'boolean'
        }
      ],
      returns: [
        {
          arg: 'about',
          type: 'object'
        },
        {
          arg: 'debug',
          type: 'object'
        }
      ],
      http: {
        path: '/give-brownie-points',
        verb: 'POST'
      }
    }
  );

  // user.updateTo$(updateData: Object) => Observable[Number]
  User.prototype.update$ = function update$(updateData) {
    const id = this.getId();
    const updateOptions = { allowExtendedOperators: true };
    if (
        !updateData ||
        typeof updateData !== 'object' ||
        !Object.keys(updateData).length
    ) {
      return Observable.throw(new Error(
        dedent`
          updateData must be an object with at least one key,
          but got ${updateData} with ${Object.keys(updateData).length}
        `.split('\n').join(' ')
      ));
    }
    return this.constructor.update$({ id }, updateData, updateOptions);
  };
};

import { Observable } from 'rx';
import debugFactory from 'debug';

const debug = debugFactory('fcc:user:remote');

function destroyAllRelated(id, Model) {
  return Observable.fromNodeCallback(
    Model.destroyAll,
    Model
  )({ userId: id });
}

module.exports = function(app) {
  var User = app.models.User;
  var UserIdentity = app.models.UserIdentity;
  var UserCredential = app.models.UserCredential;
  var Email = app.models.Email;
  console.log(Email.send);
  User.observe('before delete', function(ctx, next) {
    debug('removing user', ctx.where);
    var id = ctx.where && ctx.where.id ? ctx.where.id : null;
    if (!id) {
      return next();
    }
    return Observable.combineLatest(
      destroyAllRelated(id, UserIdentity),
      destroyAllRelated(id, UserCredential),
      function(identData, credData) {
        return {
          identData: identData,
          credData: credData
        };
      }
    )
      .subscribe(
        function(data) {
          debug('deleted', data);
        },
        function(err) {
          debug('error deleting user %s stuff', id, err);
          next(err);
        },
        function() {
          debug('user stuff deleted for user %s', id);
          next();
        }
      );
  });

  // set email varified false on user email signup
  // should not be set with oauth signin methods
  User.beforeRemote('create', function(ctx, user, next) {
    var body = ctx.req.body;
    if (body) {
      body.emailVerified = false;
    }
    next();
  });

  // send welcome email to new camper
  User.afterRemote('create', function({ req, res }, user, next) {
    debug('user created, sending email');
    if (!user.email) { return next(); }
    const redirect = req.session && req.session.returnTo ?
      req.session.returnTo :
      '/';
      console.log(redirect);
    console.log(user.email);
    var mailOptions = {
      type: 'email',
      to: user.email,
      from: 'team@freecodecamp.cn',
      subject: '欢迎来到FreeCodeCamp!',
      redirect: '/',
      text: [
        '来自加利福利亚州的问候!\n\n',
        '谢谢您加入我们的社区。\n',
        '在你使用FreeCodeCamp的过程中有任何问题，都可以给我们发邮件。\n',
        '如果你有空，可以添加我们的微信公众号： ',
        'freecodecamp\n\n',
        '祝您闯关愉快!\n\n',
        '- the Free Code Camp Team'
      ].join('')
    };

    debug('sending welcome email');
    return Email.send(mailOptions, function(err) {
      if (err) { console.log(err); return next(err); }
      return req.logIn(user, function(err) {
        if (err) { console.log(err); return next(err); }

        req.flash('success', {
          msg: [ '欢迎来到Free Code Camp!我们已经为您创建好了账户。' ]
        });
        return res.redirect(redirect);
      });
    });
  });
};

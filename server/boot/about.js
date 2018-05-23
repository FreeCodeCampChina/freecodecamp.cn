import dedent from 'dedent';
import moment from 'moment';

import { observeMethod } from '../utils/rx';

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function about(app) {
  const router = app.loopback.Router();
  const User = app.models.User;
  const userCount$ = observeMethod(User, 'count');

  function showAbout(req, res, next) {
    const daysRunning = moment().diff(new Date('5/5/2016'), 'days');

    userCount$()
      .map(camperCount => numberWithCommas(camperCount))
      .doOnNext(camperCount => {
        res.render('resources/about', {
          camperCount,
          daysRunning,
          title: dedent`
            About our Open Source Community, our social media presence,
            and how to contact us`.split('\n').join(' '),
          globalCompletedCount: numberWithCommas(
            12952 + (Math.floor((Date.now() - 1463557575258) / 18000))
          )
        });
      })
      .subscribe(() => {}, next);
  }

  router.get('/about', showAbout);
  app.use(router);
}

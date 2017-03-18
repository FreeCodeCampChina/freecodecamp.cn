import _ from 'lodash';
import dedent from 'dedent';
import moment from 'moment';
import { Observable, Scheduler } from 'rx';
import debug from 'debug';
import accepts from 'accepts';
import { isMongoId } from 'validator';

import {
  dasherize,
  unDasherize,
  getMDNLinks,
  randomVerb,
  randomPhrase,
  randomCompliment
} from '../utils';

import { observeMethod } from '../utils/rx';

import {
  ifNoUserSend
} from '../utils/middleware';

import getFromDisk$ from '../utils/getFromDisk$';
import badIdMap from '../utils/bad-id-map';

const isDev = process.env.NODE_ENV !== 'production';
const isBeta = !!process.env.BETA;
const log = debug('fcc:challenges');
const challengesRegex = /^(bonfire|waypoint|zipline|basejump|checkpoint)/i;
const challengeView = {
  0: 'challenges/showHTML',
  1: 'challenges/showJS',
  2: 'challenges/showVideo',
  3: 'challenges/showZiplineOrBasejump',
  4: 'challenges/showZiplineOrBasejump',
  5: 'challenges/showBonfire',
  7: 'challenges/showStep'
};

function isChallengeCompleted(user, challengeId) {
  if (!user) {
    return false;
  }
  return !!user.challengeMap[challengeId];
}

/*
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
*/

function buildUserUpdate(
  user,
  challengeId,
  completedChallenge,
  timezone
) {
  const updateData = { $set: {} };
  let finalChallenge;
  const { timezone: userTimezone, challengeMap = {} } = user;

  const oldChallenge = challengeMap[challengeId];
  const alreadyCompleted = !!oldChallenge;


  if (alreadyCompleted) {
    // add data from old challenge
    finalChallenge = {
      ...completedChallenge,
      completedDate: oldChallenge.completedDate,
      lastUpdated: completedChallenge.completedDate
    };
  } else {
    if (challengeId) {
      updateData.$push = {
        progressTimestamps: {
          timestamp: Date.now(),
          completedChallenge: challengeId
        }
      };
      finalChallenge = completedChallenge;
    }
  }

  updateData.$set = {
    [`challengeMap.${challengeId}`]: finalChallenge
  };

  if (
    timezone &&
    timezone !== 'UTC' &&
    (!userTimezone || userTimezone === 'UTC')
  ) {
    updateData.$set = {
      ...updateData.$set,
      timezone: userTimezone
    };
  }

  log('user update data', updateData);

  return { alreadyCompleted, updateData };
}


// small helper function to determine whether to mark something as new
const dateFormat = 'MMM MMMM DD, YYYY';
function shouldShowNew(element, block) {
  if (element) {
    return typeof element.releasedOn !== 'undefined' &&
      moment(element.releasedOn, dateFormat).diff(moment(), 'days') >= -60;
  }

  if (block) {
    const newCount = block.reduce((sum, { markNew }) => {
      if (markNew) {
        return sum + 1;
      }
      return sum;
    }, 0);
    return newCount / block.length * 100 === 100;
  }
  return null;
}

// meant to be used with a filter method
// on an array or observable stream
// true if challenge should be passed through
// false if should filter challenge out of array or stream
function shouldNotFilterComingSoon({ isComingSoon, isBeta: challengeIsBeta }) {
  return isDev ||
    !isComingSoon ||
    (isBeta && challengeIsBeta);
}

function getRenderData$(user, challenge$, origChallengeName, solution) {
  const challengeName = unDasherize(origChallengeName)
    .replace(challengesRegex, '');

  const testChallengeName = new RegExp(challengeName, 'i');
  log('looking for %s', testChallengeName);

  return challenge$
    .map(challenge => challenge.toJSON())
    .filter((challenge) => {
      return shouldNotFilterComingSoon(challenge) &&
        challenge.type !== 'hike' &&
        testChallengeName.test(challenge.name);
    })
    .last({ defaultValue: null })
    .flatMap(challenge => {
      log('enviroment ' + isDev);
      if (challenge && isDev) {
        return getFromDisk$(challenge);
      }
      return Observable.just(challenge);
    })
    .flatMap(challenge => {

      // Handle not found
      if (!challenge) {
        log('did not find challenge for ' + origChallengeName);
        return Observable.just({
          type: 'redirect',
          redirectUrl: '/map',
          message: dedent`
    We couldn't find a challenge with the name ${origChallengeName}.
    Please double check the name.
          `
        });
      }

      if (dasherize(challenge.name) !== origChallengeName) {
        let redirectUrl = `/challenges/${dasherize(challenge.name)}`;

        if (solution) {
          redirectUrl += `?solution=${encodeURIComponent(solution)}`;
        }

        return Observable.just({
          type: 'redirect',
          redirectUrl
        });
      }

      // save user does nothing if user does not exist
      return Observable.just({
        data: {
          ...challenge,
          // identifies if a challenge is completed
          isCompleted: isChallengeCompleted(user, challenge.id),

          // video challenges
          video: challenge.challengeSeed[0],

          // bonfires specific
          bonfires: challenge,
          MDNkeys: challenge.MDNlinks,
          MDNlinks: getMDNLinks(challenge.MDNlinks),

          // htmls specific
          verb: randomVerb(),
          phrase: randomPhrase(),
          compliment: randomCompliment(),

          // Google Analytics
          gaName: challenge.title + '~' + challenge.checksum
        }
      });
    });
}

// create a stream of an array of all the challenge blocks
function getSuperBlocks$(challenge$, challengeMap) {
  return challenge$
    // mark challenge completed
    .map(challengeModel => {
      const challenge = challengeModel.toJSON();
      challenge.completed = !!challengeMap[challenge.id];
      challenge.markNew = shouldShowNew(challenge);

      if (challenge.type === 'hike') {
        challenge.url = '/videos/' + challenge.dashedName;
      } else {
        challenge.url = '/challenges/' + challenge.dashedName;
      }

      return challenge;
    })
    // group challenges by block | returns a stream of observables
    .groupBy(challenge => challenge.block)
    // turn block group stream into an array
    .flatMap(block$ => block$.toArray())
    .map(blockArray => {
      const completedCount = blockArray.reduce((sum, { completed }) => {
        if (completed) {
          return sum + 1;
        }
        return sum;
      }, 0);
      const isBeta = _.every(blockArray, 'isBeta');
      const isComingSoon = _.every(blockArray, 'isComingSoon');
      const isRequired = _.every(blockArray, 'isRequired');

      return {
        isBeta,
        isComingSoon,
        isRequired,
        name: blockArray[0].block,
        superBlock: blockArray[0].superBlock,
        dashedName: dasherize(blockArray[0].block),
        markNew: shouldShowNew(null, blockArray),
        challenges: blockArray,
        completed: completedCount / blockArray.length * 100,
        time: blockArray[0] && blockArray[0].time || '???'
      };
    })
    .toArray()
    .flatMap(blocks => Observable.from(blocks, null, null, Scheduler.default))
    .groupBy(block => block.superBlock)
    .flatMap(blocks$ => blocks$.toArray())
    .map(superBlockArray => ({
      name: superBlockArray[0].superBlock,
      blocks: superBlockArray
    }))
    .toArray();
}

function getChallengeById$(challenge$, challengeId) {
  // return first challenge if no id is given
  if (!challengeId) {
    return challenge$
      .map(challenge => challenge.toJSON())
      .filter(shouldNotFilterComingSoon)
      // filter out hikes
      .filter(({ superBlock }) => !(/^videos/gi).test(superBlock))
      .first();
  }
  return challenge$
    .map(challenge => challenge.toJSON())
    // filter out challenges coming soon
    .filter(shouldNotFilterComingSoon)
    // filter out hikes
    .filter(({ superBlock }) => !(/^videos/gi).test(superBlock))
    .filter(({ id }) => id === challengeId);
}

function getNextChallenge$(challenge$, blocks$, challengeId) {
  return getChallengeById$(challenge$, challengeId)
    // now lets find the block it belongs to
    .flatMap(challenge => {
      // find the index of the block this challenge resides in
      const blockIndex$ = blocks$
        .findIndex(({ name }) => name === challenge.block);


      return blockIndex$
        .flatMap(blockIndex => {
          // could not find block?
          if (blockIndex === -1) {
            return Observable.throw(
              'could not find challenge block for ' + challenge.block
            );
          }
          const firstChallengeOfNextBlock$ = blocks$
            .elementAt(blockIndex + 1, {})
            .map(({ challenges = [] }) => challenges[0]);

          return blocks$
            .filter(shouldNotFilterComingSoon)
            .elementAt(blockIndex)
            .flatMap(block => {
              // find where our challenge lies in the block
              const challengeIndex$ = Observable.from(
                block.challenges,
                null,
                null,
                Scheduler.default
              )
                .findIndex(({ id }) => id === challengeId);

              // grab next challenge in this block
              return challengeIndex$
                .map(index => {
                  return block.challenges[index + 1];
                })
                .flatMap(nextChallenge => {
                  if (!nextChallenge) {
                    return firstChallengeOfNextBlock$;
                  }
                  return Observable.just(nextChallenge);
                });
            });
        });
    })
    .first();
}

module.exports = function(app) {
  const router = app.loopback.Router();

  const challengesQuery = {
    order: [
      'superOrder ASC',
      'order ASC',
      'suborder ASC'
    ]
  };

  // challenge model
  const Challenge = app.models.Challenge;
  // challenge find query stream
  const findChallenge$ = observeMethod(Challenge, 'find');
  // create a stream of all the challenges
  const challenge$ = findChallenge$(challengesQuery)
    .flatMap(challenges => Observable.from(
      challenges,
      null,
      null,
      Scheduler.default
    ))
    // filter out all challenges that have isBeta flag set
    // except in development or beta site
    .filter(challenge => isDev || isBeta || !challenge.isBeta)
    .shareReplay();

  // create a stream of challenge blocks
  const blocks$ = challenge$
    .map(challenge => challenge.toJSON())
    .filter(shouldNotFilterComingSoon)
    // group challenges by block | returns a stream of observables
    .groupBy(challenge => challenge.block)
    // turn block group stream into an array
    .flatMap(blocks$ => blocks$.toArray())
    // turn array into stream of object
    .map(blocksArray => ({
      name: blocksArray[0].block,
      dashedName: dasherize(blocksArray[0].block),
      challenges: blocksArray,
      superBlock: blocksArray[0].superBlock,
      order: blocksArray[0].order
    }))
    // filter out hikes
    .filter(({ superBlock }) => {
      return !(/^videos/gi).test(superBlock);
    })
    .shareReplay();

  const firstChallenge$ = challenge$
    .first()
    .map(challenge => challenge.toJSON())
    .shareReplay();

  const lastChallenge$ = challenge$
    .last()
    .map(challenge => challenge.toJSON())
    .shareReplay();

  const send200toNonUser = ifNoUserSend(true);

  router.post(
    '/completed-challenge/',
    send200toNonUser,
    completedChallenge
  );
  router.post(
    '/completed-zipline-or-basejump',
    send200toNonUser,
    completedZiplineOrBasejump
  );

  router.get('/map', showMap.bind(null, false));
  router.get('/map-aside', showMap.bind(null, true));
  router.get(
    '/challenges/current-challenge',
    redirectToCurrentChallenge
  );
  router.get(
    '/challenges/next-challenge',
    redirectToNextChallenge
  );

  router.get('/challenges/:challengeName', showChallenge);

  app.use(router);

  function redirectToCurrentChallenge(req, res, next) {
    let challengeId = req.query.id || req.cookies.currentChallengeId;
    // prevent serialized null/undefined from breaking things

    if (badIdMap[challengeId]) {
      challengeId = badIdMap[challengeId];
    }

    if (!isMongoId('' + challengeId)) {
      challengeId = null;
    }

    getChallengeById$(challenge$, challengeId)
      .doOnNext(({ dashedName })=> {
        if (!dashedName) {
          log('no challenge found for %s', challengeId);
          req.flash('info', {
            msg: `We coudn't find a challenge with the id ${challengeId}`
          });
          res.redirect('/map');
        }
        res.redirect('/challenges/' + dashedName);
      })
      .subscribe(() => {}, next);
  }

  function redirectToNextChallenge(req, res, next) {
    let challengeId = req.query.id || req.cookies.currentChallengeId;

    if (badIdMap[challengeId]) {
      challengeId = badIdMap[challengeId];
    }

    if (!isMongoId('' + challengeId)) {
      challengeId = null;
    }

    Observable.combineLatest(
      firstChallenge$,
      lastChallenge$
    )
      .flatMap(([firstChallenge, { id: lastChallengeId } ]) => {
        // no id supplied, load first challenge
        if (!challengeId) {
          return Observable.just(firstChallenge);
        }
        // camper just completed last challenge
        if (challengeId === lastChallengeId) {
          return Observable.just()
            .doOnCompleted(() => {
              req.flash('info', {
                msg: dedent`
                  Once you have completed all of our challenges, you should
                  join our <a href="https://gitter.im/freecodecamp/HalfWayClub"
                  target="_blank">Half Way Club</a> and start getting
                  ready for our nonprofit projects.
                `.split('\n').join(' ')
              });
              return res.redirect('/map');
            });
        }

        return getNextChallenge$(challenge$, blocks$, challengeId);
      })
      .doOnNext(({ dashedName } = {}) => {
        if (!dashedName) {
          log('no challenge found for %s', challengeId);
          res.redirect('/map');
        }
        res.redirect('/challenges/' + dashedName);
      })
      .subscribe(() => {}, next);
  }

  function showChallenge(req, res, next) {
    const solution = req.query.solution;
    const challengeName = req.params.challengeName.replace(challengesRegex, '');

    getRenderData$(req.user, challenge$, challengeName, solution)
      .subscribe(
        ({ type, redirectUrl, message, data }) => {
          if (message) {
            req.flash('info', {
              msg: message
            });
          }
          if (type === 'redirect') {
            log('redirecting to %s', redirectUrl);
            return res.redirect(redirectUrl);
          }
          var view = challengeView[data.challengeType];
          if (data.id) {
            res.cookie('currentChallengeId', data.id, {
              expires: new Date(2147483647000)});
          }
          return res.render(view, data);
        },
        next,
        function() {}
      );
  }

  function completedChallenge(req, res, next) {
    req.checkBody('id', 'id must be a ObjectId').isMongoId();
    req.checkBody('name', 'name must be at least 3 characters')
      .isString()
      .isLength({ min: 3 });
    req.checkBody('challengeType', 'challengeType must be an integer')
      .isNumber();

    const type = accepts(req).type('html', 'json', 'text');

    const errors = req.validationErrors(true);

    if (errors) {
      if (type === 'json') {
        return res.status(403).send({ errors });
      }

      log('errors', errors);
      return res.sendStatus(403);
    }

    const completedDate = Date.now();
    const {
      id,
      name,
      challengeType,
      solution,
      timezone
    } = req.body;

    const { alreadyCompleted, updateData } = buildUserUpdate(
      req.user,
      id,
      {
        id,
        challengeType,
        solution,
        name,
        completedDate
      },
      timezone
    );

    const user = req.user;
    const points = alreadyCompleted ?
      user.progressTimestamps.length :
      user.progressTimestamps.length + 1;

    return user.update$(updateData)
      .doOnNext(({ count }) => log('%s documents updated', count))
      .subscribe(
        () => {},
        next,
        function() {
          if (type === 'json') {
            return res.json({
              points,
              alreadyCompleted
            });
          }
          return res.sendStatus(200);
        }
      );
  }

  function completedZiplineOrBasejump(req, res, next) {
    const type = accepts(req).type('html', 'json', 'text');
    req.checkBody('id', 'id must be an ObjectId').isMongoId();
    req.checkBody('name', 'Name must be at least 3 characters')
      .isString()
      .isLength({ min: 3 });
    req.checkBody('challengeType', 'must be a number')
      .isNumber();
    req.checkBody('solution', 'solution must be a url').isURL();

    const errors = req.validationErrors(true);

    if (errors) {
      if (type === 'json') {
        return res.status(403).send({ errors });
      }
      log('errors', errors);
      return res.sendStatus(403);
    }

    const { user, body = {} } = req;

    const completedChallenge = _.pick(
      body,
      [ 'id', 'name', 'solution', 'githubLink', 'challengeType' ]
    );
    completedChallenge.challengeType = +completedChallenge.challengeType;
    completedChallenge.completedDate = Date.now();

    if (
      !completedChallenge.solution ||
      // only basejumps require github links
      (
        completedChallenge.challengeType === 4 &&
        !completedChallenge.githubLink
      )
    ) {
      req.flash('errors', {
        msg: 'You haven\'t supplied the necessary URLs for us to inspect ' +
          'your work.'
      });
      return res.sendStatus(403);
    }


    const {
      alreadyCompleted,
      updateData
    } = buildUserUpdate(req.user, completedChallenge.id, completedChallenge);

    return user.update$(updateData)
      .doOnNext(({ count }) => log('%s documents updated', count))
      .doOnNext(() => {
        if (type === 'json') {
          return res.send({
            alreadyCompleted,
            points: alreadyCompleted ?
              user.progressTimestamps.length :
              user.progressTimestamps.length + 1
          });
        }
        return res.status(200).send(true);
      })
      .subscribe(() => {}, next);
  }

  function showMap(showAside, { user = {} }, res, next) {
    const { challengeMap = {} } = user;

    return getSuperBlocks$(challenge$, challengeMap)
      .subscribe(
        superBlocks => {
          res.render('map/show', {
            superBlocks,
            title: 'A Map to Learn to Code and Become a Software Engineer',
            showAside
          });
        },
        next
      );
  }
};

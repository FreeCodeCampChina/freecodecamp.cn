import helmet from 'helmet';

let trusted = [
  "'self'"
];

if (process.env.NODE_ENV !== 'production') {
  trusted.push('ws://localhost:3000');
}

export default function csp() {
  return helmet.csp({
    directives: {
      defaultSrc: trusted,
      scriptSrc: [
        "'unsafe-eval'",
        "'unsafe-inline'",
        '*.google-analytics.com',
        '*.gstatic.com',
        'https://*.gdgdocs.org',
        'https://*.cloudflare.com',
        '*.cloudflare.com',
        'https://*.gitter.im',
        'https://*.cdnjs.com',
        '*.cdnjs.com',
        'https://*.jsdelivr.com',
        '*.jsdelivr.com',
        '*.twimg.com',
        'https://*.twimg.com',
        '*.qbox.me',
        'https://*.qbox.me',
        '*.growingio.com',
        'https://*.growingio.com',
        'vimeo.com',
        '*.clouddn.com',
        'https://*.clouddn.com',
        'https://www.sdk.cn',
        'https://sdk.cn'
      ].concat(trusted),
      connectSrc: [
        'vimeo.com',
        'tags.growingio.com',
        'api.growingio.com'
      ].concat(trusted),
      styleSrc: [
        "'unsafe-inline'",
        '*.gstatic.com',
        '*.googleapis.com',
        'https://*.googleapis.com',
        '*.gdgdocs.org',
        'https://*.gdgdocs.org',
        '*.bootstrapcdn.com',
        'https://*.bootstrapcdn.com',
        '*.bootcss.com',
        'https://*.bootcss.com',
        '*.cloudflare.com',
        'https://*.cloudflare.com',
        '*.clouddn.com',
        'https://*.clouddn.com',
        '*.gdgdocs.org',
        'https://*.gdgdocs.org'
      ].concat(trusted),
      fontSrc: [
        '*.cloudflare.com',
        'https://*.cloudflare.com',
        '*.bootstrapcdn.com',
        '*.bootcss.com',
        'https://*.bootcss.com',
        '*.googleapis.com',
        'https://*.googleapis.com',
        '*.gdgdocs.org',
        'https://*.gdgdocs.org',
        '*.gstatic.com',
        'https://*.bootstrapcdn.com',
        '*.qnssl.com',
        'https://*.qnssl.com'
      ].concat(trusted),
      imgSrc: [
        // allow all input since we have user submitted images for
        // public profile
        '*',
        'data:'
      ],
      mediaSrc: [
        '*.bitly.com',
        '*.amazonaws.com',
        '*.twitter.com'
      ].concat(trusted),
      frameSrc: [
        '*.gitter.im',
        '*.gitter.im https:',
        '*.vimeo.com',
        '*.twitter.com',
        '*.ghbtns.com',
        '*.freecatphotoapp.com',
        'freecodecamp.github.io'
      ].concat(trusted)
    },
    // set to true if you only want to report errors
    reportOnly: false,
    // set to true if you want to set all headers
    setAllHeaders: false,
    // set to true if you want to force buggy CSP in Safari 5
    safari5: false
  });
}

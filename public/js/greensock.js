(function(t, e) {
    "use strict";
    var i = t.GreenSockGlobals = t.GreenSockGlobals || t;
    if (!i.TweenLite) {
        var n, s, r, o, a, l = function(t) {
            var e, n = t.split("."), s = i;
            for (e = 0; n.length > e; e++)
                s[n[e]] = s = s[n[e]] || {};
            return s
        }
        , h = l("com.greensock"), u = 1e-10, _ = function(t) {
            var e, i = [], n = t.length;
            for (e = 0; e !== n; i.push(t[e++]))
                ;
            return i
        }
        , c = function() {}
        , f = function() {
            var t = Object.prototype.toString
              , e = t.call([]);
            return function(i) {
                return null  != i && (i instanceof Array || "object" == typeof i && !!i.push && t.call(i) === e)
            }
        }(), p = {}, d = function(n, s, r, o) {
            this.sc = p[n] ? p[n].sc : [],
            p[n] = this,
            this.gsClass = null ,
            this.func = r;
            var a = [];
            this.check = function(h) {
                for (var u, _, c, f, m = s.length, v = m; --m > -1; )
                    (u = p[s[m]] || new d(s[m],[])).gsClass ? (a[m] = u.gsClass,
                    v--) : h && u.sc.push(this);
                if (0 === v && r)
                    for (_ = ("com.greensock." + n).split("."),
                    c = _.pop(),
                    f = l(_.join("."))[c] = this.gsClass = r.apply(r, a),
                    o && (i[c] = f,
                    "function" == typeof define && define.amd ? define((t.GreenSockAMDPath ? t.GreenSockAMDPath + "/" : "") + n.split(".").pop(), [], function() {
                        return f
                    }) : n === e && "undefined" != typeof module && module.exports && (module.exports = f)),
                    m = 0; this.sc.length > m; m++)
                        this.sc[m].check()
            }
            ,
            this.check(!0)
        }
        , m = t._gsDefine = function(t, e, i, n) {
            return new d(t,e,i,n)
        }
        , v = h._class = function(t, e, i) {
            return e = e || function() {}
            ,
            m(t, [], function() {
                return e
            }, i),
            e
        }
        ;
        m.globals = i;
        var g = [0, 0, 1, 1]
          , w = []
          , y = v("easing.Ease", function(t, e, i, n) {
            this._func = t,
            this._type = i || 0,
            this._power = n || 0,
            this._params = e ? g.concat(e) : g
        }, !0)
          , T = y.map = {}
          , P = y.register = function(t, e, i, n) {
            for (var s, r, o, a, l = e.split(","), u = l.length, _ = (i || "easeIn,easeOut,easeInOut").split(","); --u > -1; )
                for (r = l[u],
                s = n ? v("easing." + r, null , !0) : h.easing[r] || {},
                o = _.length; --o > -1; )
                    a = _[o],
                    T[r + "." + a] = T[a + r] = s[a] = t.getRatio ? t : t[a] || new t
        }
        ;
        for (r = y.prototype,
        r._calcEnd = !1,
        r.getRatio = function(t) {
            if (this._func)
                return this._params[0] = t,
                this._func.apply(null , this._params);
            var e = this._type
              , i = this._power
              , n = 1 === e ? 1 - t : 2 === e ? t : .5 > t ? 2 * t : 2 * (1 - t);
            return 1 === i ? n *= n : 2 === i ? n *= n * n : 3 === i ? n *= n * n * n : 4 === i && (n *= n * n * n * n),
            1 === e ? 1 - n : 2 === e ? n : .5 > t ? n / 2 : 1 - n / 2
        }
        ,
        n = ["Linear", "Quad", "Cubic", "Quart", "Quint,Strong"],
        s = n.length; --s > -1; )
            r = n[s] + ",Power" + s,
            P(new y(null ,null ,1,s), r, "easeOut", !0),
            P(new y(null ,null ,2,s), r, "easeIn" + (0 === s ? ",easeNone" : "")),
            P(new y(null ,null ,3,s), r, "easeInOut");
        T.linear = h.easing.Linear.easeIn,
        T.swing = h.easing.Quad.easeInOut;
        var b = v("events.EventDispatcher", function(t) {
            this._listeners = {},
            this._eventTarget = t || this
        });
        r = b.prototype,
        r.addEventListener = function(t, e, i, n, s) {
            s = s || 0;
            var r, l, h = this._listeners[t], u = 0;
            for (null  == h && (this._listeners[t] = h = []),
            l = h.length; --l > -1; )
                r = h[l],
                r.c === e && r.s === i ? h.splice(l, 1) : 0 === u && s > r.pr && (u = l + 1);
            h.splice(u, 0, {
                c: e,
                s: i,
                up: n,
                pr: s
            }),
            this !== o || a || o.wake()
        }
        ,
        r.removeEventListener = function(t, e) {
            var i, n = this._listeners[t];
            if (n)
                for (i = n.length; --i > -1; )
                    if (n[i].c === e)
                        return n.splice(i, 1),
                        void 0
        }
        ,
        r.dispatchEvent = function(t) {
            var e, i, n, s = this._listeners[t];
            if (s)
                for (e = s.length,
                i = this._eventTarget; --e > -1; )
                    n = s[e],
                    n.up ? n.c.call(n.s || i, {
                        type: t,
                        target: i
                    }) : n.c.call(n.s || i)
        }
        ;
        var S = t.requestAnimationFrame
          , x = t.cancelAnimationFrame
          , k = Date.now || function() {
            return (new Date).getTime()
        }
          , A = k();
        for (n = ["ms", "moz", "webkit", "o"],
        s = n.length; --s > -1 && !S; )
            S = t[n[s] + "RequestAnimationFrame"],
            x = t[n[s] + "CancelAnimationFrame"] || t[n[s] + "CancelRequestAnimationFrame"];
        v("Ticker", function(t, e) {
            var i, n, s, r, l, h = this, _ = k(), f = e !== !1 && S, p = 500, d = 33, m = function(t) {
                var e, o, a = k() - A;
                a > p && (_ += a - d),
                A += a,
                h.time = (A - _) / 1e3,
                e = h.time - l,
                (!i || e > 0 || t === !0) && (h.frame++,
                l += e + (e >= r ? .004 : r - e),
                o = !0),
                t !== !0 && (s = n(m)),
                o && h.dispatchEvent("tick")
            }
            ;
            b.call(h),
            h.time = h.frame = 0,
            h.tick = function() {
                m(!0)
            }
            ,
            h.lagSmoothing = function(t, e) {
                p = t || 1 / u,
                d = Math.min(e, p, 0)
            }
            ,
            h.sleep = function() {
                null  != s && (f && x ? x(s) : clearTimeout(s),
                n = c,
                s = null ,
                h === o && (a = !1))
            }
            ,
            h.wake = function() {
                null  !== s ? h.sleep() : h.frame > 10 && (A = k() - p + 5),
                n = 0 === i ? c : f && S ? S : function(t) {
                    return setTimeout(t, 0 | 1e3 * (l - h.time) + 1)
                }
                ,
                h === o && (a = !0),
                m(2)
            }
            ,
            h.fps = function(t) {
                return arguments.length ? (i = t,
                r = 1 / (i || 60),
                l = this.time + r,
                h.wake(),
                void 0) : i
            }
            ,
            h.useRAF = function(t) {
                return arguments.length ? (h.sleep(),
                f = t,
                h.fps(i),
                void 0) : f
            }
            ,
            h.fps(t),
            setTimeout(function() {
                f && (!s || 5 > h.frame) && h.useRAF(!1)
            }, 1500)
        }),
        r = h.Ticker.prototype = new h.events.EventDispatcher,
        r.constructor = h.Ticker;
        var E = v("core.Animation", function(t, e) {
            if (this.vars = e = e || {},
            this._duration = this._totalDuration = t || 0,
            this._delay = Number(e.delay) || 0,
            this._timeScale = 1,
            this._active = e.immediateRender === !0,
            this.data = e.data,
            this._reversed = e.reversed === !0,
            G) {
                a || o.wake();
                var i = this.vars.useFrames ? F : G;
                i.add(this, i._time),
                this.vars.paused && this.paused(!0)
            }
        });
        o = E.ticker = new h.Ticker,
        r = E.prototype,
        r._dirty = r._gc = r._initted = r._paused = !1,
        r._totalTime = r._time = 0,
        r._rawPrevTime = -1,
        r._next = r._last = r._onUpdate = r._timeline = r.timeline = null ,
        r._paused = !1;
        var R = function() {
            a && k() - A > 2e3 && o.wake(),
            setTimeout(R, 2e3)
        }
        ;
        R(),
        r.play = function(t, e) {
            return null  != t && this.seek(t, e),
            this.reversed(!1).paused(!1)
        }
        ,
        r.pause = function(t, e) {
            return null  != t && this.seek(t, e),
            this.paused(!0)
        }
        ,
        r.resume = function(t, e) {
            return null  != t && this.seek(t, e),
            this.paused(!1)
        }
        ,
        r.seek = function(t, e) {
            return this.totalTime(Number(t), e !== !1)
        }
        ,
        r.restart = function(t, e) {
            return this.reversed(!1).paused(!1).totalTime(t ? -this._delay : 0, e !== !1, !0)
        }
        ,
        r.reverse = function(t, e) {
            return null  != t && this.seek(t || this.totalDuration(), e),
            this.reversed(!0).paused(!1)
        }
        ,
        r.render = function() {}
        ,
        r.invalidate = function() {
            return this
        }
        ,
        r.isActive = function() {
            var t, e = this._timeline, i = this._startTime;
            return !e || !this._gc && !this._paused && e.isActive() && (t = e.rawTime()) >= i && i + this.totalDuration() / this._timeScale > t
        }
        ,
        r._enabled = function(t, e) {
            return a || o.wake(),
            this._gc = !t,
            this._active = this.isActive(),
            e !== !0 && (t && !this.timeline ? this._timeline.add(this, this._startTime - this._delay) : !t && this.timeline && this._timeline._remove(this, !0)),
            !1
        }
        ,
        r._kill = function() {
            return this._enabled(!1, !1)
        }
        ,
        r.kill = function(t, e) {
            return this._kill(t, e),
            this
        }
        ,
        r._uncache = function(t) {
            for (var e = t ? this : this.timeline; e; )
                e._dirty = !0,
                e = e.timeline;
            return this
        }
        ,
        r._swapSelfInParams = function(t) {
            for (var e = t.length, i = t.concat(); --e > -1; )
                "{self}" === t[e] && (i[e] = this);
            return i
        }
        ,
        r.eventCallback = function(t, e, i, n) {
            if ("on" === (t || "").substr(0, 2)) {
                var s = this.vars;
                if (1 === arguments.length)
                    return s[t];
                null  == e ? delete s[t] : (s[t] = e,
                s[t + "Params"] = f(i) && -1 !== i.join("").indexOf("{self}") ? this._swapSelfInParams(i) : i,
                s[t + "Scope"] = n),
                "onUpdate" === t && (this._onUpdate = e)
            }
            return this
        }
        ,
        r.delay = function(t) {
            return arguments.length ? (this._timeline.smoothChildTiming && this.startTime(this._startTime + t - this._delay),
            this._delay = t,
            this) : this._delay
        }
        ,
        r.duration = function(t) {
            return arguments.length ? (this._duration = this._totalDuration = t,
            this._uncache(!0),
            this._timeline.smoothChildTiming && this._time > 0 && this._time < this._duration && 0 !== t && this.totalTime(this._totalTime * (t / this._duration), !0),
            this) : (this._dirty = !1,
            this._duration)
        }
        ,
        r.totalDuration = function(t) {
            return this._dirty = !1,
            arguments.length ? this.duration(t) : this._totalDuration
        }
        ,
        r.time = function(t, e) {
            return arguments.length ? (this._dirty && this.totalDuration(),
            this.totalTime(t > this._duration ? this._duration : t, e)) : this._time
        }
        ,
        r.totalTime = function(t, e, i) {
            if (a || o.wake(),
            !arguments.length)
                return this._totalTime;
            if (this._timeline) {
                if (0 > t && !i && (t += this.totalDuration()),
                this._timeline.smoothChildTiming) {
                    this._dirty && this.totalDuration();
                    var n = this._totalDuration
                      , s = this._timeline;
                    if (t > n && !i && (t = n),
                    this._startTime = (this._paused ? this._pauseTime : s._time) - (this._reversed ? n - t : t) / this._timeScale,
                    s._dirty || this._uncache(!1),
                    s._timeline)
                        for (; s._timeline; )
                            s._timeline._time !== (s._startTime + s._totalTime) / s._timeScale && s.totalTime(s._totalTime, !0),
                            s = s._timeline
                }
                this._gc && this._enabled(!0, !1),
                (this._totalTime !== t || 0 === this._duration) && (this.render(t, e, !1),
                D.length && Q())
            }
            return this
        }
        ,
        r.progress = r.totalProgress = function(t, e) {
            return arguments.length ? this.totalTime(this.duration() * t, e) : this._time / this.duration()
        }
        ,
        r.startTime = function(t) {
            return arguments.length ? (t !== this._startTime && (this._startTime = t,
            this.timeline && this.timeline._sortChildren && this.timeline.add(this, t - this._delay)),
            this) : this._startTime
        }
        ,
        r.timeScale = function(t) {
            if (!arguments.length)
                return this._timeScale;
            if (t = t || u,
            this._timeline && this._timeline.smoothChildTiming) {
                var e = this._pauseTime
                  , i = e || 0 === e ? e : this._timeline.totalTime();
                this._startTime = i - (i - this._startTime) * this._timeScale / t
            }
            return this._timeScale = t,
            this._uncache(!1)
        }
        ,
        r.reversed = function(t) {
            return arguments.length ? (t != this._reversed && (this._reversed = t,
            this.totalTime(this._timeline && !this._timeline.smoothChildTiming ? this.totalDuration() - this._totalTime : this._totalTime, !0)),
            this) : this._reversed
        }
        ,
        r.paused = function(t) {
            if (!arguments.length)
                return this._paused;
            if (t != this._paused && this._timeline) {
                a || t || o.wake();
                var e = this._timeline
                  , i = e.rawTime()
                  , n = i - this._pauseTime;
                !t && e.smoothChildTiming && (this._startTime += n,
                this._uncache(!1)),
                this._pauseTime = t ? i : null ,
                this._paused = t,
                this._active = this.isActive(),
                !t && 0 !== n && this._initted && this.duration() && this.render(e.smoothChildTiming ? this._totalTime : (i - this._startTime) / this._timeScale, !0, !0)
            }
            return this._gc && !t && this._enabled(!0, !1),
            this
        }
        ;
        var C = v("core.SimpleTimeline", function(t) {
            E.call(this, 0, t),
            this.autoRemoveChildren = this.smoothChildTiming = !0
        });
        r = C.prototype = new E,
        r.constructor = C,
        r.kill()._gc = !1,
        r._first = r._last = null ,
        r._sortChildren = !1,
        r.add = r.insert = function(t, e) {
            var i, n;
            if (t._startTime = Number(e || 0) + t._delay,
            t._paused && this !== t._timeline && (t._pauseTime = t._startTime + (this.rawTime() - t._startTime) / t._timeScale),
            t.timeline && t.timeline._remove(t, !0),
            t.timeline = t._timeline = this,
            t._gc && t._enabled(!0, !0),
            i = this._last,
            this._sortChildren)
                for (n = t._startTime; i && i._startTime > n; )
                    i = i._prev;
            return i ? (t._next = i._next,
            i._next = t) : (t._next = this._first,
            this._first = t),
            t._next ? t._next._prev = t : this._last = t,
            t._prev = i,
            this._timeline && this._uncache(!0),
            this
        }
        ,
        r._remove = function(t, e) {
            return t.timeline === this && (e || t._enabled(!1, !0),
            t._prev ? t._prev._next = t._next : this._first === t && (this._first = t._next),
            t._next ? t._next._prev = t._prev : this._last === t && (this._last = t._prev),
            t._next = t._prev = t.timeline = null ,
            this._timeline && this._uncache(!0)),
            this
        }
        ,
        r.render = function(t, e, i) {
            var n, s = this._first;
            for (this._totalTime = this._time = this._rawPrevTime = t; s; )
                n = s._next,
                (s._active || t >= s._startTime && !s._paused) && (s._reversed ? s.render((s._dirty ? s.totalDuration() : s._totalDuration) - (t - s._startTime) * s._timeScale, e, i) : s.render((t - s._startTime) * s._timeScale, e, i)),
                s = n
        }
        ,
        r.rawTime = function() {
            return a || o.wake(),
            this._totalTime
        }
        ;
        var I = v("TweenLite", function(e, i, n) {
            if (E.call(this, i, n),
            this.render = I.prototype.render,
            null  == e)
                throw "Cannot tween a null target.";
            this.target = e = "string" != typeof e ? e : I.selector(e) || e;
            var s, r, o, a = e.jquery || e.length && e !== t && e[0] && (e[0] === t || e[0].nodeType && e[0].style && !e.nodeType), l = this.vars.overwrite;
            if (this._overwrite = l = null  == l ? q[I.defaultOverwrite] : "number" == typeof l ? l >> 0 : q[l],
            (a || e instanceof Array || e.push && f(e)) && "number" != typeof e[0])
                for (this._targets = o = _(e),
                this._propLookup = [],
                this._siblings = [],
                s = 0; o.length > s; s++)
                    r = o[s],
                    r ? "string" != typeof r ? r.length && r !== t && r[0] && (r[0] === t || r[0].nodeType && r[0].style && !r.nodeType) ? (o.splice(s--, 1),
                    this._targets = o = o.concat(_(r))) : (this._siblings[s] = $(r, this, !1),
                    1 === l && this._siblings[s].length > 1 && X(r, this, null , 1, this._siblings[s])) : (r = o[s--] = I.selector(r),
                    "string" == typeof r && o.splice(s + 1, 1)) : o.splice(s--, 1);
            else
                this._propLookup = {},
                this._siblings = $(e, this, !1),
                1 === l && this._siblings.length > 1 && X(e, this, null , 1, this._siblings);
            (this.vars.immediateRender || 0 === i && 0 === this._delay && this.vars.immediateRender !== !1) && (this._time = -u,
            this.render(-this._delay))
        }, !0)
          , M = function(e) {
            return e.length && e !== t && e[0] && (e[0] === t || e[0].nodeType && e[0].style && !e.nodeType)
        }
          , O = function(t, e) {
            var i, n = {};
            for (i in t)
                B[i] || i in e && "transform" !== i && "x" !== i && "y" !== i && "width" !== i && "height" !== i && "className" !== i && "border" !== i || !(!N[i] || N[i] && N[i]._autoCSS) || (n[i] = t[i],
                delete t[i]);
            t.css = n
        }
        ;
        r = I.prototype = new E,
        r.constructor = I,
        r.kill()._gc = !1,
        r.ratio = 0,
        r._firstPT = r._targets = r._overwrittenProps = r._startAt = null ,
        r._notifyPluginsOfEnabled = r._lazy = !1,
        I.version = "1.13.1",
        I.defaultEase = r._ease = new y(null ,null ,1,1),
        I.defaultOverwrite = "auto",
        I.ticker = o,
        I.autoSleep = !0,
        I.lagSmoothing = function(t, e) {
            o.lagSmoothing(t, e)
        }
        ,
        I.selector = t.$ || t.jQuery || function(e) {
            var i = t.$ || t.jQuery;
            return i ? (I.selector = i,
            i(e)) : "undefined" == typeof document ? e : document.querySelectorAll ? document.querySelectorAll(e) : document.getElementById("#" === e.charAt(0) ? e.substr(1) : e)
        }
        ;
        var D = []
          , L = {}
          , z = I._internals = {
            isArray: f,
            isSelector: M,
            lazyTweens: D
        }
          , N = I._plugins = {}
          , U = z.tweenLookup = {}
          , j = 0
          , B = z.reservedProps = {
            ease: 1,
            delay: 1,
            overwrite: 1,
            onComplete: 1,
            onCompleteParams: 1,
            onCompleteScope: 1,
            useFrames: 1,
            runBackwards: 1,
            startAt: 1,
            onUpdate: 1,
            onUpdateParams: 1,
            onUpdateScope: 1,
            onStart: 1,
            onStartParams: 1,
            onStartScope: 1,
            onReverseComplete: 1,
            onReverseCompleteParams: 1,
            onReverseCompleteScope: 1,
            onRepeat: 1,
            onRepeatParams: 1,
            onRepeatScope: 1,
            easeParams: 1,
            yoyo: 1,
            immediateRender: 1,
            repeat: 1,
            repeatDelay: 1,
            data: 1,
            paused: 1,
            reversed: 1,
            autoCSS: 1,
            lazy: 1
        }
          , q = {
            none: 0,
            all: 1,
            auto: 2,
            concurrent: 3,
            allOnStart: 4,
            preexisting: 5,
            "true": 1,
            "false": 0
        }
          , F = E._rootFramesTimeline = new C
          , G = E._rootTimeline = new C
          , Q = z.lazyRender = function() {
            var t = D.length;
            for (L = {}; --t > -1; )
                n = D[t],
                n && n._lazy !== !1 && (n.render(n._lazy, !1, !0),
                n._lazy = !1);
            D.length = 0
        }
        ;
        G._startTime = o.time,
        F._startTime = o.frame,
        G._active = F._active = !0,
        setTimeout(Q, 1),
        E._updateRoot = I.render = function() {
            var t, e, i;
            if (D.length && Q(),
            G.render((o.time - G._startTime) * G._timeScale, !1, !1),
            F.render((o.frame - F._startTime) * F._timeScale, !1, !1),
            D.length && Q(),
            !(o.frame % 120)) {
                for (i in U) {
                    for (e = U[i].tweens,
                    t = e.length; --t > -1; )
                        e[t]._gc && e.splice(t, 1);
                    0 === e.length && delete U[i]
                }
                if (i = G._first,
                (!i || i._paused) && I.autoSleep && !F._first && 1 === o._listeners.tick.length) {
                    for (; i && i._paused; )
                        i = i._next;
                    i || o.sleep()
                }
            }
        }
        ,
        o.addEventListener("tick", E._updateRoot);
        var $ = function(t, e, i) {
            var n, s, r = t._gsTweenID;
            if (U[r || (t._gsTweenID = r = "t" + j++)] || (U[r] = {
                target: t,
                tweens: []
            }),
            e && (n = U[r].tweens,
            n[s = n.length] = e,
            i))
                for (; --s > -1; )
                    n[s] === e && n.splice(s, 1);
            return U[r].tweens
        }
          , X = function(t, e, i, n, s) {
            var r, o, a, l;
            if (1 === n || n >= 4) {
                for (l = s.length,
                r = 0; l > r; r++)
                    if ((a = s[r]) !== e)
                        a._gc || a._enabled(!1, !1) && (o = !0);
                    else if (5 === n)
                        break;
                return o
            }
            var h, _ = e._startTime + u, c = [], f = 0, p = 0 === e._duration;
            for (r = s.length; --r > -1; )
                (a = s[r]) === e || a._gc || a._paused || (a._timeline !== e._timeline ? (h = h || Y(e, 0, p),
                0 === Y(a, h, p) && (c[f++] = a)) : _ >= a._startTime && a._startTime + a.totalDuration() / a._timeScale > _ && ((p || !a._initted) && 2e-10 >= _ - a._startTime || (c[f++] = a)));
            for (r = f; --r > -1; )
                a = c[r],
                2 === n && a._kill(i, t) && (o = !0),
                (2 !== n || !a._firstPT && a._initted) && a._enabled(!1, !1) && (o = !0);
            return o
        }
          , Y = function(t, e, i) {
            for (var n = t._timeline, s = n._timeScale, r = t._startTime; n._timeline; ) {
                if (r += n._startTime,
                s *= n._timeScale,
                n._paused)
                    return -100;
                n = n._timeline
            }
            return r /= s,
            r > e ? r - e : i && r === e || !t._initted && 2 * u > r - e ? u : (r += t.totalDuration() / t._timeScale / s) > e + u ? 0 : r - e - u
        }
        ;
        r._init = function() {
            var t, e, i, n, s, r = this.vars, o = this._overwrittenProps, a = this._duration, l = !!r.immediateRender, h = r.ease;
            if (r.startAt) {
                this._startAt && (this._startAt.render(-1, !0),
                this._startAt.kill()),
                s = {};
                for (n in r.startAt)
                    s[n] = r.startAt[n];
                if (s.overwrite = !1,
                s.immediateRender = !0,
                s.lazy = l && r.lazy !== !1,
                s.startAt = s.delay = null ,
                this._startAt = I.to(this.target, 0, s),
                l)
                    if (this._time > 0)
                        this._startAt = null ;
                    else if (0 !== a)
                        return
            } else if (r.runBackwards && 0 !== a)
                if (this._startAt)
                    this._startAt.render(-1, !0),
                    this._startAt.kill(),
                    this._startAt = null ;
                else {
                    i = {};
                    for (n in r)
                        B[n] && "autoCSS" !== n || (i[n] = r[n]);
                    if (i.overwrite = 0,
                    i.data = "isFromStart",
                    i.lazy = l && r.lazy !== !1,
                    i.immediateRender = l,
                    this._startAt = I.to(this.target, 0, i),
                    l) {
                        if (0 === this._time)
                            return
                    } else
                        this._startAt._init(),
                        this._startAt._enabled(!1)
                }
            if (this._ease = h = h ? h instanceof y ? h : "function" == typeof h ? new y(h,r.easeParams) : T[h] || I.defaultEase : I.defaultEase,
            r.easeParams instanceof Array && h.config && (this._ease = h.config.apply(h, r.easeParams)),
            this._easeType = this._ease._type,
            this._easePower = this._ease._power,
            this._firstPT = null ,
            this._targets)
                for (t = this._targets.length; --t > -1; )
                    this._initProps(this._targets[t], this._propLookup[t] = {}, this._siblings[t], o ? o[t] : null ) && (e = !0);
            else
                e = this._initProps(this.target, this._propLookup, this._siblings, o);
            if (e && I._onPluginEvent("_onInitAllProps", this),
            o && (this._firstPT || "function" != typeof this.target && this._enabled(!1, !1)),
            r.runBackwards)
                for (i = this._firstPT; i; )
                    i.s += i.c,
                    i.c = -i.c,
                    i = i._next;
            this._onUpdate = r.onUpdate,
            this._initted = !0
        }
        ,
        r._initProps = function(e, i, n, s) {
            var r, o, a, l, h, u;
            if (null  == e)
                return !1;
            L[e._gsTweenID] && Q(),
            this.vars.css || e.style && e !== t && e.nodeType && N.css && this.vars.autoCSS !== !1 && O(this.vars, e);
            for (r in this.vars) {
                if (u = this.vars[r],
                B[r])
                    u && (u instanceof Array || u.push && f(u)) && -1 !== u.join("").indexOf("{self}") && (this.vars[r] = u = this._swapSelfInParams(u, this));
                else if (N[r] && (l = new N[r])._onInitTween(e, this.vars[r], this)) {
                    for (this._firstPT = h = {
                        _next: this._firstPT,
                        t: l,
                        p: "setRatio",
                        s: 0,
                        c: 1,
                        f: !0,
                        n: r,
                        pg: !0,
                        pr: l._priority
                    },
                    o = l._overwriteProps.length; --o > -1; )
                        i[l._overwriteProps[o]] = this._firstPT;
                    (l._priority || l._onInitAllProps) && (a = !0),
                    (l._onDisable || l._onEnable) && (this._notifyPluginsOfEnabled = !0)
                } else
                    this._firstPT = i[r] = h = {
                        _next: this._firstPT,
                        t: e,
                        p: r,
                        f: "function" == typeof e[r],
                        n: r,
                        pg: !1,
                        pr: 0
                    },
                    h.s = h.f ? e[r.indexOf("set") || "function" != typeof e["get" + r.substr(3)] ? r : "get" + r.substr(3)]() : parseFloat(e[r]),
                    h.c = "string" == typeof u && "=" === u.charAt(1) ? parseInt(u.charAt(0) + "1", 10) * Number(u.substr(2)) : Number(u) - h.s || 0;
                h && h._next && (h._next._prev = h)
            }
            return s && this._kill(s, e) ? this._initProps(e, i, n, s) : this._overwrite > 1 && this._firstPT && n.length > 1 && X(e, this, i, this._overwrite, n) ? (this._kill(i, e),
            this._initProps(e, i, n, s)) : (this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration) && (L[e._gsTweenID] = !0),
            a)
        }
        ,
        r.render = function(t, e, i) {
            var n, s, r, o, a = this._time, l = this._duration, h = this._rawPrevTime;
            if (t >= l)
                this._totalTime = this._time = l,
                this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1,
                this._reversed || (n = !0,
                s = "onComplete"),
                0 === l && (this._initted || !this.vars.lazy || i) && (this._startTime === this._timeline._duration && (t = 0),
                (0 === t || 0 > h || h === u) && h !== t && (i = !0,
                h > u && (s = "onReverseComplete")),
                this._rawPrevTime = o = !e || t || h === t ? t : u);
            else if (1e-7 > t)
                this._totalTime = this._time = 0,
                this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0,
                (0 !== a || 0 === l && h > 0 && h !== u) && (s = "onReverseComplete",
                n = this._reversed),
                0 > t ? (this._active = !1,
                0 === l && (this._initted || !this.vars.lazy || i) && (h >= 0 && (i = !0),
                this._rawPrevTime = o = !e || t || h === t ? t : u)) : this._initted || (i = !0);
            else if (this._totalTime = this._time = t,
            this._easeType) {
                var _ = t / l
                  , c = this._easeType
                  , f = this._easePower;
                (1 === c || 3 === c && _ >= .5) && (_ = 1 - _),
                3 === c && (_ *= 2),
                1 === f ? _ *= _ : 2 === f ? _ *= _ * _ : 3 === f ? _ *= _ * _ * _ : 4 === f && (_ *= _ * _ * _ * _),
                this.ratio = 1 === c ? 1 - _ : 2 === c ? _ : .5 > t / l ? _ / 2 : 1 - _ / 2
            } else
                this.ratio = this._ease.getRatio(t / l);
            if (this._time !== a || i) {
                if (!this._initted) {
                    if (this._init(),
                    !this._initted || this._gc)
                        return;
                    if (!i && this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration))
                        return this._time = this._totalTime = a,
                        this._rawPrevTime = h,
                        D.push(this),
                        this._lazy = t,
                        void 0;
                    this._time && !n ? this.ratio = this._ease.getRatio(this._time / l) : n && this._ease._calcEnd && (this.ratio = this._ease.getRatio(0 === this._time ? 0 : 1))
                }
                for (this._lazy !== !1 && (this._lazy = !1),
                this._active || !this._paused && this._time !== a && t >= 0 && (this._active = !0),
                0 === a && (this._startAt && (t >= 0 ? this._startAt.render(t, e, i) : s || (s = "_dummyGS")),
                this.vars.onStart && (0 !== this._time || 0 === l) && (e || this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || w))),
                r = this._firstPT; r; )
                    r.f ? r.t[r.p](r.c * this.ratio + r.s) : r.t[r.p] = r.c * this.ratio + r.s,
                    r = r._next;
                this._onUpdate && (0 > t && this._startAt && this._startTime && this._startAt.render(t, e, i),
                e || (this._time !== a || n) && this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || w)),
                s && (!this._gc || i) && (0 > t && this._startAt && !this._onUpdate && this._startTime && this._startAt.render(t, e, i),
                n && (this._timeline.autoRemoveChildren && this._enabled(!1, !1),
                this._active = !1),
                !e && this.vars[s] && this.vars[s].apply(this.vars[s + "Scope"] || this, this.vars[s + "Params"] || w),
                0 === l && this._rawPrevTime === u && o !== u && (this._rawPrevTime = 0))
            }
        }
        ,
        r._kill = function(t, e) {
            if ("all" === t && (t = null ),
            null  == t && (null  == e || e === this.target))
                return this._lazy = !1,
                this._enabled(!1, !1);
            e = "string" != typeof e ? e || this._targets || this.target : I.selector(e) || e;
            var i, n, s, r, o, a, l, h;
            if ((f(e) || M(e)) && "number" != typeof e[0])
                for (i = e.length; --i > -1; )
                    this._kill(t, e[i]) && (a = !0);
            else {
                if (this._targets) {
                    for (i = this._targets.length; --i > -1; )
                        if (e === this._targets[i]) {
                            o = this._propLookup[i] || {},
                            this._overwrittenProps = this._overwrittenProps || [],
                            n = this._overwrittenProps[i] = t ? this._overwrittenProps[i] || {} : "all";
                            break
                        }
                } else {
                    if (e !== this.target)
                        return !1;
                    o = this._propLookup,
                    n = this._overwrittenProps = t ? this._overwrittenProps || {} : "all"
                }
                if (o) {
                    l = t || o,
                    h = t !== n && "all" !== n && t !== o && ("object" != typeof t || !t._tempKill);
                    for (s in l)
                        (r = o[s]) && (r.pg && r.t._kill(l) && (a = !0),
                        r.pg && 0 !== r.t._overwriteProps.length || (r._prev ? r._prev._next = r._next : r === this._firstPT && (this._firstPT = r._next),
                        r._next && (r._next._prev = r._prev),
                        r._next = r._prev = null ),
                        delete o[s]),
                        h && (n[s] = 1);
                    !this._firstPT && this._initted && this._enabled(!1, !1)
                }
            }
            return a
        }
        ,
        r.invalidate = function() {
            return this._notifyPluginsOfEnabled && I._onPluginEvent("_onDisable", this),
            this._firstPT = null ,
            this._overwrittenProps = null ,
            this._onUpdate = null ,
            this._startAt = null ,
            this._initted = this._active = this._notifyPluginsOfEnabled = this._lazy = !1,
            this._propLookup = this._targets ? {} : [],
            this
        }
        ,
        r._enabled = function(t, e) {
            if (a || o.wake(),
            t && this._gc) {
                var i, n = this._targets;
                if (n)
                    for (i = n.length; --i > -1; )
                        this._siblings[i] = $(n[i], this, !0);
                else
                    this._siblings = $(this.target, this, !0)
            }
            return E.prototype._enabled.call(this, t, e),
            this._notifyPluginsOfEnabled && this._firstPT ? I._onPluginEvent(t ? "_onEnable" : "_onDisable", this) : !1
        }
        ,
        I.to = function(t, e, i) {
            return new I(t,e,i)
        }
        ,
        I.from = function(t, e, i) {
            return i.runBackwards = !0,
            i.immediateRender = 0 != i.immediateRender,
            new I(t,e,i)
        }
        ,
        I.fromTo = function(t, e, i, n) {
            return n.startAt = i,
            n.immediateRender = 0 != n.immediateRender && 0 != i.immediateRender,
            new I(t,e,n)
        }
        ,
        I.delayedCall = function(t, e, i, n, s) {
            return new I(e,0,{
                delay: t,
                onComplete: e,
                onCompleteParams: i,
                onCompleteScope: n,
                onReverseComplete: e,
                onReverseCompleteParams: i,
                onReverseCompleteScope: n,
                immediateRender: !1,
                useFrames: s,
                overwrite: 0
            })
        }
        ,
        I.set = function(t, e) {
            return new I(t,0,e)
        }
        ,
        I.getTweensOf = function(t, e) {
            if (null  == t)
                return [];
            t = "string" != typeof t ? t : I.selector(t) || t;
            var i, n, s, r;
            if ((f(t) || M(t)) && "number" != typeof t[0]) {
                for (i = t.length,
                n = []; --i > -1; )
                    n = n.concat(I.getTweensOf(t[i], e));
                for (i = n.length; --i > -1; )
                    for (r = n[i],
                    s = i; --s > -1; )
                        r === n[s] && n.splice(i, 1)
            } else
                for (n = $(t).concat(),
                i = n.length; --i > -1; )
                    (n[i]._gc || e && !n[i].isActive()) && n.splice(i, 1);
            return n
        }
        ,
        I.killTweensOf = I.killDelayedCallsTo = function(t, e, i) {
            "object" == typeof e && (i = e,
            e = !1);
            for (var n = I.getTweensOf(t, e), s = n.length; --s > -1; )
                n[s]._kill(i, t)
        }
        ;
        var V = v("plugins.TweenPlugin", function(t, e) {
            this._overwriteProps = (t || "").split(","),
            this._propName = this._overwriteProps[0],
            this._priority = e || 0,
            this._super = V.prototype
        }, !0);
        if (r = V.prototype,
        V.version = "1.10.1",
        V.API = 2,
        r._firstPT = null ,
        r._addTween = function(t, e, i, n, s, r) {
            var o, a;
            return null  != n && (o = "number" == typeof n || "=" !== n.charAt(1) ? Number(n) - i : parseInt(n.charAt(0) + "1", 10) * Number(n.substr(2))) ? (this._firstPT = a = {
                _next: this._firstPT,
                t: t,
                p: e,
                s: i,
                c: o,
                f: "function" == typeof t[e],
                n: s || e,
                r: r
            },
            a._next && (a._next._prev = a),
            a) : void 0
        }
        ,
        r.setRatio = function(t) {
            for (var e, i = this._firstPT, n = 1e-6; i; )
                e = i.c * t + i.s,
                i.r ? e = Math.round(e) : n > e && e > -n && (e = 0),
                i.f ? i.t[i.p](e) : i.t[i.p] = e,
                i = i._next
        }
        ,
        r._kill = function(t) {
            var e, i = this._overwriteProps, n = this._firstPT;
            if (null  != t[this._propName])
                this._overwriteProps = [];
            else
                for (e = i.length; --e > -1; )
                    null  != t[i[e]] && i.splice(e, 1);
            for (; n; )
                null  != t[n.n] && (n._next && (n._next._prev = n._prev),
                n._prev ? (n._prev._next = n._next,
                n._prev = null ) : this._firstPT === n && (this._firstPT = n._next)),
                n = n._next;
            return !1
        }
        ,
        r._roundProps = function(t, e) {
            for (var i = this._firstPT; i; )
                (t[this._propName] || null  != i.n && t[i.n.split(this._propName + "_").join("")]) && (i.r = e),
                i = i._next
        }
        ,
        I._onPluginEvent = function(t, e) {
            var i, n, s, r, o, a = e._firstPT;
            if ("_onInitAllProps" === t) {
                for (; a; ) {
                    for (o = a._next,
                    n = s; n && n.pr > a.pr; )
                        n = n._next;
                    (a._prev = n ? n._prev : r) ? a._prev._next = a : s = a,
                    (a._next = n) ? n._prev = a : r = a,
                    a = o
                }
                a = e._firstPT = s
            }
            for (; a; )
                a.pg && "function" == typeof a.t[t] && a.t[t]() && (i = !0),
                a = a._next;
            return i
        }
        ,
        V.activate = function(t) {
            for (var e = t.length; --e > -1; )
                t[e].API === V.API && (N[(new t[e])._propName] = t[e]);
            return !0
        }
        ,
        m.plugin = function(t) {
            if (!(t && t.propName && t.init && t.API))
                throw "illegal plugin definition.";
            var e, i = t.propName, n = t.priority || 0, s = t.overwriteProps, r = {
                init: "_onInitTween",
                set: "setRatio",
                kill: "_kill",
                round: "_roundProps",
                initAll: "_onInitAllProps"
            }, o = v("plugins." + i.charAt(0).toUpperCase() + i.substr(1) + "Plugin", function() {
                V.call(this, i, n),
                this._overwriteProps = s || []
            }, t.global === !0), a = o.prototype = new V(i);
            a.constructor = o,
            o.API = t.API;
            for (e in r)
                "function" == typeof t[e] && (a[r[e]] = t[e]);
            return o.version = t.version,
            V.activate([o]),
            o
        }
        ,
        n = t._gsQueue) {
            for (s = 0; n.length > s; s++)
                n[s]();
            for (r in p)
                p[r].func || t.console.log("GSAP encountered missing dependency: com.greensock." + r)
        }
        a = !1
    }
})("undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window, "TweenLite");
var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
    "use strict";
    _gsScope._gsDefine("easing.Back", ["easing.Ease"], function(t) {
        var e, i, n, s = _gsScope.GreenSockGlobals || _gsScope, r = s.com.greensock, o = 2 * Math.PI, a = Math.PI / 2, l = r._class, h = function(e, i) {
            var n = l("easing." + e, function() {}, !0)
              , s = n.prototype = new t;
            return s.constructor = n,
            s.getRatio = i,
            n
        }
        , u = t.register || function() {}
        , _ = function(t, e, i, n) {
            var s = l("easing." + t, {
                easeOut: new e,
                easeIn: new i,
                easeInOut: new n
            }, !0);
            return u(s, t),
            s
        }
        , c = function(t, e, i) {
            this.t = t,
            this.v = e,
            i && (this.next = i,
            i.prev = this,
            this.c = i.v - e,
            this.gap = i.t - t)
        }
        , f = function(e, i) {
            var n = l("easing." + e, function(t) {
                this._p1 = t || 0 === t ? t : 1.70158,
                this._p2 = 1.525 * this._p1
            }, !0)
              , s = n.prototype = new t;
            return s.constructor = n,
            s.getRatio = i,
            s.config = function(t) {
                return new n(t)
            }
            ,
            n
        }
        , p = _("Back", f("BackOut", function(t) {
            return (t -= 1) * t * ((this._p1 + 1) * t + this._p1) + 1
        }), f("BackIn", function(t) {
            return t * t * ((this._p1 + 1) * t - this._p1)
        }), f("BackInOut", function(t) {
            return 1 > (t *= 2) ? .5 * t * t * ((this._p2 + 1) * t - this._p2) : .5 * ((t -= 2) * t * ((this._p2 + 1) * t + this._p2) + 2)
        })), d = l("easing.SlowMo", function(t, e, i) {
            e = e || 0 === e ? e : .7,
            null  == t ? t = .7 : t > 1 && (t = 1),
            this._p = 1 !== t ? e : 0,
            this._p1 = (1 - t) / 2,
            this._p2 = t,
            this._p3 = this._p1 + this._p2,
            this._calcEnd = i === !0
        }, !0), m = d.prototype = new t;
        return m.constructor = d,
        m.getRatio = function(t) {
            var e = t + (.5 - t) * this._p;
            return this._p1 > t ? this._calcEnd ? 1 - (t = 1 - t / this._p1) * t : e - (t = 1 - t / this._p1) * t * t * t * e : t > this._p3 ? this._calcEnd ? 1 - (t = (t - this._p3) / this._p1) * t : e + (t - e) * (t = (t - this._p3) / this._p1) * t * t * t : this._calcEnd ? 1 : e
        }
        ,
        d.ease = new d(.7,.7),
        m.config = d.config = function(t, e, i) {
            return new d(t,e,i)
        }
        ,
        e = l("easing.SteppedEase", function(t) {
            t = t || 1,
            this._p1 = 1 / t,
            this._p2 = t + 1
        }, !0),
        m = e.prototype = new t,
        m.constructor = e,
        m.getRatio = function(t) {
            return 0 > t ? t = 0 : t >= 1 && (t = .999999999),
            (this._p2 * t >> 0) * this._p1
        }
        ,
        m.config = e.config = function(t) {
            return new e(t)
        }
        ,
        i = l("easing.RoughEase", function(e) {
            e = e || {};
            for (var i, n, s, r, o, a, l = e.taper || "none", h = [], u = 0, _ = 0 | (e.points || 20), f = _, p = e.randomize !== !1, d = e.clamp === !0, m = e.template instanceof t ? e.template : null , v = "number" == typeof e.strength ? .4 * e.strength : .4; --f > -1; )
                i = p ? Math.random() : 1 / _ * f,
                n = m ? m.getRatio(i) : i,
                "none" === l ? s = v : "out" === l ? (r = 1 - i,
                s = r * r * v) : "in" === l ? s = i * i * v : .5 > i ? (r = 2 * i,
                s = .5 * r * r * v) : (r = 2 * (1 - i),
                s = .5 * r * r * v),
                p ? n += Math.random() * s - .5 * s : f % 2 ? n += .5 * s : n -= .5 * s,
                d && (n > 1 ? n = 1 : 0 > n && (n = 0)),
                h[u++] = {
                    x: i,
                    y: n
                };
            for (h.sort(function(t, e) {
                return t.x - e.x
            }),
            a = new c(1,1,null ),
            f = _; --f > -1; )
                o = h[f],
                a = new c(o.x,o.y,a);
            this._prev = new c(0,0,0 !== a.t ? a : a.next)
        }, !0),
        m = i.prototype = new t,
        m.constructor = i,
        m.getRatio = function(t) {
            var e = this._prev;
            if (t > e.t) {
                for (; e.next && t >= e.t; )
                    e = e.next;
                e = e.prev
            } else
                for (; e.prev && e.t >= t; )
                    e = e.prev;
            return this._prev = e,
            e.v + (t - e.t) / e.gap * e.c
        }
        ,
        m.config = function(t) {
            return new i(t)
        }
        ,
        i.ease = new i,
        _("Bounce", h("BounceOut", function(t) {
            return 1 / 2.75 > t ? 7.5625 * t * t : 2 / 2.75 > t ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : 2.5 / 2.75 > t ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375
        }), h("BounceIn", function(t) {
            return 1 / 2.75 > (t = 1 - t) ? 1 - 7.5625 * t * t : 2 / 2.75 > t ? 1 - (7.5625 * (t -= 1.5 / 2.75) * t + .75) : 2.5 / 2.75 > t ? 1 - (7.5625 * (t -= 2.25 / 2.75) * t + .9375) : 1 - (7.5625 * (t -= 2.625 / 2.75) * t + .984375)
        }), h("BounceInOut", function(t) {
            var e = .5 > t;
            return t = e ? 1 - 2 * t : 2 * t - 1,
            t = 1 / 2.75 > t ? 7.5625 * t * t : 2 / 2.75 > t ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : 2.5 / 2.75 > t ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375,
            e ? .5 * (1 - t) : .5 * t + .5
        })),
        _("Circ", h("CircOut", function(t) {
            return Math.sqrt(1 - (t -= 1) * t)
        }), h("CircIn", function(t) {
            return -(Math.sqrt(1 - t * t) - 1)
        }), h("CircInOut", function(t) {
            return 1 > (t *= 2) ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1)
        })),
        n = function(e, i, n) {
            var s = l("easing." + e, function(t, e) {
                this._p1 = t || 1,
                this._p2 = e || n,
                this._p3 = this._p2 / o * (Math.asin(1 / this._p1) || 0)
            }, !0)
              , r = s.prototype = new t;
            return r.constructor = s,
            r.getRatio = i,
            r.config = function(t, e) {
                return new s(t,e)
            }
            ,
            s
        }
        ,
        _("Elastic", n("ElasticOut", function(t) {
            return this._p1 * Math.pow(2, -10 * t) * Math.sin((t - this._p3) * o / this._p2) + 1
        }, .3), n("ElasticIn", function(t) {
            return -(this._p1 * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - this._p3) * o / this._p2))
        }, .3), n("ElasticInOut", function(t) {
            return 1 > (t *= 2) ? -.5 * this._p1 * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - this._p3) * o / this._p2) : .5 * this._p1 * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - this._p3) * o / this._p2) + 1
        }, .45)),
        _("Expo", h("ExpoOut", function(t) {
            return 1 - Math.pow(2, -10 * t)
        }), h("ExpoIn", function(t) {
            return Math.pow(2, 10 * (t - 1)) - .001
        }), h("ExpoInOut", function(t) {
            return 1 > (t *= 2) ? .5 * Math.pow(2, 10 * (t - 1)) : .5 * (2 - Math.pow(2, -10 * (t - 1)))
        })),
        _("Sine", h("SineOut", function(t) {
            return Math.sin(t * a)
        }), h("SineIn", function(t) {
            return -Math.cos(t * a) + 1
        }), h("SineInOut", function(t) {
            return -.5 * (Math.cos(Math.PI * t) - 1)
        })),
        l("easing.EaseLookup", {
            find: function(e) {
                return t.map[e]
            }
        }, !0),
        u(s.SlowMo, "SlowMo", "ease,"),
        u(i, "RoughEase", "ease,"),
        u(e, "SteppedEase", "ease,"),
        p
    }, !0)
}),
_gsScope._gsDefine && _gsScope._gsQueue.pop()();
(function() {
    var t, e, i, n, s, r, o = true;
    a();
    _();
    l();
    function a() {
        t = $("#banner").width();
        e = $("#banner").height();
        r = {
            x: t / 2,
            y: e / 2
        };
        i = document.getElementById("animate-net");
        i.width = t;
        i.height = e;
        n = i.getContext("2d");
        s = [];
        for (var o = 0; o < t - t / 10; o = o + t / 10) {
            for (var a = 0; a < e - e / 10; a = a + e / 10) {
                var l = o + Math.random() * t / 10;
                var h = a + Math.random() * e / 10;
                var u = {
                    x: l,
                    originX: l,
                    y: h,
                    originY: h
                };
                s.push(u)
            }
        }
        for (var _ = 0; _ < s.length; _++) {
            var c = [];
            var f = s[_];
            for (var p = 0; p < s.length; p++) {
                var v = s[p];
                if (!(f == v)) {
                    var g = false;
                    for (var w = 0; w < 5; w++) {
                        if (!g) {
                            if (c[w] == undefined) {
                                c[w] = v;
                                g = true
                            }
                        }
                    }
                    for (var w = 0; w < 5; w++) {
                        if (!g) {
                            if (m(f, v) < m(f, c[w])) {
                                c[w] = v;
                                g = true
                            }
                        }
                    }
                }
            }
            f.closest = c
        }
        for (var _ in s) {
            var y = new d(s[_],2 + Math.random() * 2,"rgba(255,255,255,0.3)");
            s[_].circle = y
        }
    }
    function l() {
        if (!("ontouchstart" in window)) {
            window.addEventListener("mousemove", h)
        }
        window.addEventListener("scroll", u)
    }
    function h(t) {
        var e = posy = 0;
        if (t.pageX || t.pageY) {
            e = t.pageX;
            posy = t.pageY
        } else if (t.clientX || t.clientY) {
            e = t.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = t.clientY + document.body.scrollTop + document.documentElement.scrollTop
        }
        r.x = e;
        r.y = posy
    }
    function u() {
        if (document.body.scrollTop > e)
            o = false;
        else
            o = true
    }
    function _() {
        c();
        for (var t in s) {
            f(s[t])
        }
    }
    function c() {
        if (o) {
            n.clearRect(0, 0, t, e);
            for (var i in s) {
                if (Math.abs(m(r, s[i])) < 2e3) {
                    s[i].active = .2;
                    s[i].circle.active = .6
                } else if (Math.abs(m(r, s[i])) < 2e4) {
                    s[i].active = .1;
                    s[i].circle.active = .3
                } else if (Math.abs(m(r, s[i])) < 5e4) {
                    s[i].active = .07;
                    s[i].circle.active = .1
                } else if (Math.abs(m(r, s[i])) < 2e5) {
                    s[i].active = .05;
                    s[i].circle.active = .05
                } else {
                    s[i].active = 0;
                    s[i].circle.active = 0
                }
                p(s[i]);
                s[i].circle.draw()
            }
        }
        requestAnimationFrame(c)
    }
    function f(t) {
        TweenLite.to(t, 1 + 1 * Math.random(), {
            x: t.originX - 50 + Math.random() * 100,
            y: t.originY - 50 + Math.random() * 100,
            ease: Circ.easeInOut,
            onComplete: function() {
                f(t)
            }
        })
    }
    function p(t) {
        if (!t.active)
            return;
        for (var e in t.closest) {
            n.beginPath();
            n.moveTo(t.x, t.y);
            n.lineTo(t.closest[e].x, t.closest[e].y);
            n.strokeStyle = "rgba(156,217,249," + t.active + ")";
            n.stroke()
        }
    }
    function d(t, e, i) {
        var s = this;
        (function() {
            s.pos = t || null ;
            s.radius = e || null ;
            s.color = i || null
        })();
        this.draw = function() {
            if (!s.active)
                return;
            n.beginPath();
            n.arc(s.pos.x, s.pos.y, s.radius, 0, 2 * Math.PI, false);
            n.fillStyle = "rgba(255,255,255," + s.active + ")";
            n.fill()
        }
    }
    function m(t, e) {
        return Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2)
    }
})();

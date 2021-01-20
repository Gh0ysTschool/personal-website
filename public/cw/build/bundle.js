
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\cw\Unit.svelte generated by Svelte v3.29.0 */
    const file = "src\\components\\cw\\Unit.svelte";

    function create_fragment(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "unit svelte-2691e1");
    			toggle_class(div, "mon", /*unit*/ ctx[0].tier == 1);
    			toggle_class(div, "goo", /*unit*/ ctx[0].tier == 2);
    			toggle_class(div, "gate", /*unit*/ ctx[0].gate);
    			add_location(div, file, 54, 0, 1376);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[4](div);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*unit*/ 1) {
    				toggle_class(div, "mon", /*unit*/ ctx[0].tier == 1);
    			}

    			if (dirty & /*unit*/ 1) {
    				toggle_class(div, "goo", /*unit*/ ctx[0].tier == 2);
    			}

    			if (dirty & /*unit*/ 1) {
    				toggle_class(div, "gate", /*unit*/ ctx[0].gate);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[4](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Unit", slots, []);
    	let { choose } = $$props;
    	let dispatch = createEventDispatcher();
    	let { unit = { owner: { faction: { color: "black" } } } } = $$props;
    	let el;

    	onMount(x => {
    		let imgurl = (unit.type == "cult" ? unit.owner : "") + unit.type.toLowerCase().replaceAll("'", "").split(" ").join("");

    		$$invalidate(
    			1,
    			el.style.background = ({
    				"bg": "red",
    				"gc": "green",
    				"ys": "yellow",
    				"cc": "blue"
    			})[unit.owner] + ` url(./${imgurl}.webp) center center`,
    			el
    		);

    		$$invalidate(1, el.style.backgroundSize = "100% 100%", el);
    	});

    	let click = e => {
    		e.stopPropagation();
    		choose("unit", unit);
    	};

    	const writable_props = ["choose", "unit"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Unit> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(1, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("choose" in $$props) $$invalidate(3, choose = $$props.choose);
    		if ("unit" in $$props) $$invalidate(0, unit = $$props.unit);
    	};

    	$$self.$capture_state = () => ({
    		choose,
    		createEventDispatcher,
    		dispatch,
    		unit,
    		onMount,
    		el,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("choose" in $$props) $$invalidate(3, choose = $$props.choose);
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("unit" in $$props) $$invalidate(0, unit = $$props.unit);
    		if ("el" in $$props) $$invalidate(1, el = $$props.el);
    		if ("click" in $$props) $$invalidate(2, click = $$props.click);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [unit, el, click, choose, div_binding];
    }

    class Unit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { choose: 3, unit: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Unit",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*choose*/ ctx[3] === undefined && !("choose" in props)) {
    			console.warn("<Unit> was created without expected prop 'choose'");
    		}
    	}

    	get choose() {
    		throw new Error("<Unit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set choose(value) {
    		throw new Error("<Unit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unit() {
    		throw new Error("<Unit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unit(value) {
    		throw new Error("<Unit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\cw\Gate.svelte generated by Svelte v3.29.0 */
    const file$1 = "src\\components\\cw\\Gate.svelte";

    // (39:0) {#if place.gate && place.nocults}
    function create_if_block(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "gate svelte-1hbe3mt");
    			add_location(div, file$1, 38, 33, 948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[6](div);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[6](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(39:0) {#if place.gate && place.nocults}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*place*/ ctx[0].gate && /*place*/ ctx[0].nocults && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*place*/ ctx[0].gate && /*place*/ ctx[0].nocults) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Gate", slots, []);
    	let { choose } = $$props;
    	let dispatch = createEventDispatcher();
    	let place = { name: "place", gate: 0, nocults: 0 };
    	let { name = "place" } = $$props;
    	let { places = { place } } = $$props;
    	let el;

    	let click = e => {
    		e.stopPropagation();
    		choose("gate", place);
    	};

    	const writable_props = ["choose", "name", "places"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gate> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(1, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("choose" in $$props) $$invalidate(3, choose = $$props.choose);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    		if ("places" in $$props) $$invalidate(5, places = $$props.places);
    	};

    	$$self.$capture_state = () => ({
    		choose,
    		createEventDispatcher,
    		dispatch,
    		place,
    		name,
    		places,
    		afterUpdate,
    		el,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("choose" in $$props) $$invalidate(3, choose = $$props.choose);
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("place" in $$props) $$invalidate(0, place = $$props.place);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    		if ("places" in $$props) $$invalidate(5, places = $$props.places);
    		if ("el" in $$props) $$invalidate(1, el = $$props.el);
    		if ("click" in $$props) $$invalidate(2, click = $$props.click);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*places, name*/ 48) {
    			 $$invalidate(0, place = places[name]);
    		}
    	};

    	return [place, el, click, choose, name, places, div_binding];
    }

    class Gate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { choose: 3, name: 4, places: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gate",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*choose*/ ctx[3] === undefined && !("choose" in props)) {
    			console.warn("<Gate> was created without expected prop 'choose'");
    		}
    	}

    	get choose() {
    		throw new Error("<Gate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set choose(value) {
    		throw new Error("<Gate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Gate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Gate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get places() {
    		throw new Error("<Gate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set places(value) {
    		throw new Error("<Gate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\cw\Glyphs.svelte generated by Svelte v3.29.0 */
    const file$2 = "src\\components\\cw\\Glyphs.svelte";

    // (40:0) {#if place.glyphs.includes("desecration")}
    function create_if_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Φ";
    			attr_dev(div, "class", "gate svelte-1eguei6");
    			add_location(div, file$2, 39, 42, 963);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[5](div);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(40:0) {#if place.glyphs.includes(\\\"desecration\\\")}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let show_if = /*place*/ ctx[0].glyphs.includes("desecration");
    	let if_block_anchor;
    	let if_block = show_if && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*place*/ 1) show_if = /*place*/ ctx[0].glyphs.includes("desecration");

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Glyphs", slots, []);
    	let { choose } = $$props;
    	let dispatch = createEventDispatcher();
    	let place = { name: "place", gate: 0, nocults: 0 };
    	let { name = "place" } = $$props;
    	let { places = { place } } = $$props;
    	let el;

    	let click = e => {
    		e.stopPropagation();
    		choose("gate", place);
    	};

    	const writable_props = ["choose", "name", "places"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Glyphs> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(1, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("choose" in $$props) $$invalidate(2, choose = $$props.choose);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    		if ("places" in $$props) $$invalidate(4, places = $$props.places);
    	};

    	$$self.$capture_state = () => ({
    		choose,
    		createEventDispatcher,
    		dispatch,
    		place,
    		name,
    		places,
    		afterUpdate,
    		el,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("choose" in $$props) $$invalidate(2, choose = $$props.choose);
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("place" in $$props) $$invalidate(0, place = $$props.place);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    		if ("places" in $$props) $$invalidate(4, places = $$props.places);
    		if ("el" in $$props) $$invalidate(1, el = $$props.el);
    		if ("click" in $$props) click = $$props.click;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*places, name*/ 24) {
    			 $$invalidate(0, place = places[name]);
    		}
    	};

    	return [place, el, choose, name, places, div_binding];
    }

    class Glyphs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { choose: 2, name: 3, places: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Glyphs",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*choose*/ ctx[2] === undefined && !("choose" in props)) {
    			console.warn("<Glyphs> was created without expected prop 'choose'");
    		}
    	}

    	get choose() {
    		throw new Error("<Glyphs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set choose(value) {
    		throw new Error("<Glyphs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Glyphs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Glyphs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get places() {
    		throw new Error("<Glyphs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set places(value) {
    		throw new Error("<Glyphs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function crossfade(_a) {
        var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
        const to_receive = new Map();
        const to_send = new Map();
        function crossfade(from, node, params) {
            const { delay = 0, duration = d => Math.sqrt(d) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
            const to = node.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const dw = from.width / to.width;
            const dh = from.height / to.height;
            const d = Math.sqrt(dx * dx + dy * dy);
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            const opacity = +style.opacity;
            return {
                delay,
                duration: is_function(duration) ? duration(d) : duration,
                easing,
                css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
            };
        }
        function transition(items, counterparts, intro) {
            return (node, params) => {
                items.set(params.key, {
                    rect: node.getBoundingClientRect()
                });
                return () => {
                    if (counterparts.has(params.key)) {
                        const { rect } = counterparts.get(params.key);
                        counterparts.delete(params.key);
                        return crossfade(rect, node, params);
                    }
                    // if the node is disappearing altogether
                    // (i.e. wasn't claimed by the other list)
                    // then we need to supply an outro
                    items.delete(params.key);
                    return fallback && fallback(node, params, intro);
                };
            };
        }
        return [
            transition(to_send, to_receive, false),
            transition(to_receive, to_send, true)
        ];
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src\components\cw\Map.svelte generated by Svelte v3.29.0 */

    const { Map: Map_1 } = globals;
    const file$3 = "src\\components\\cw\\Map.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_10(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_11(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_12(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_13(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_14(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_15(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_16(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    // (161:110) {#each units.filter(u=>u.place=='arcticocean') as unit (unit.id)}
    function create_each_block_16(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 175, 3637);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_16.name,
    		type: "each",
    		source: "(161:110) {#each units.filter(u=>u.place=='arcticocean') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:542) {#each units.filter(u=>u.place=='northpacific') as unit (unit.id)}
    function create_each_block_15(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 608, 4070);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_15.name,
    		type: "each",
    		source: "(161:542) {#each units.filter(u=>u.place=='northpacific') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:977) {#each units.filter(u=>u.place=='northamerica') as unit (unit.id)}
    function create_each_block_14(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 1043, 4505);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_14.name,
    		type: "each",
    		source: "(161:977) {#each units.filter(u=>u.place=='northamerica') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:1415) {#each units.filter(u=>u.place=='northatlantic') as unit (unit.id)}
    function create_each_block_13(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 1482, 4944);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_13.name,
    		type: "each",
    		source: "(161:1415) {#each units.filter(u=>u.place=='northatlantic') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:1850) {#each units.filter(u=>u.place=='scandinavia') as unit (unit.id)}
    function create_each_block_12(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 1915, 5377);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_12.name,
    		type: "each",
    		source: "(161:1850) {#each units.filter(u=>u.place=='scandinavia') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:2264) {#each units.filter(u=>u.place=='europe') as unit (unit.id)}
    function create_each_block_11(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 2324, 5786);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_11.name,
    		type: "each",
    		source: "(161:2264) {#each units.filter(u=>u.place=='europe') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:2672) {#each units.filter(u=>u.place=='northasia') as unit (unit.id)}
    function create_each_block_10(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 2735, 6197);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_10.name,
    		type: "each",
    		source: "(161:2672) {#each units.filter(u=>u.place=='northasia') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:3098) {#each units.filter(u=>u.place=='southamerica') as unit (unit.id)}
    function create_each_block_9(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 3164, 6626);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(161:3098) {#each units.filter(u=>u.place=='southamerica') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:3524) {#each units.filter(u=>u.place=='southasia') as unit (unit.id)}
    function create_each_block_8(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 3587, 7049);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(161:3524) {#each units.filter(u=>u.place=='southasia') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:3932) {#each units.filter(u=>u.place=='arabia') as unit (unit.id)}
    function create_each_block_7(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 3992, 7454);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(161:3932) {#each units.filter(u=>u.place=='arabia') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:4343) {#each units.filter(u=>u.place=='westafrica') as unit (unit.id)}
    function create_each_block_6(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 4407, 7869);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(161:4343) {#each units.filter(u=>u.place=='westafrica') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:4769) {#each units.filter(u=>u.place=='indianocean') as unit (unit.id)}
    function create_each_block_5(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 4834, 8296);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(161:4769) {#each units.filter(u=>u.place=='indianocean') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:5195) {#each units.filter(u=>u.place=='eastafrica') as unit (unit.id)}
    function create_each_block_4(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 5259, 8721);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(161:5195) {#each units.filter(u=>u.place=='eastafrica') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:5618) {#each units.filter(u=>u.place=='antarctica') as unit (unit.id)}
    function create_each_block_3(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 5682, 9144);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(161:5618) {#each units.filter(u=>u.place=='antarctica') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:6050) {#each units.filter(u=>u.place=='southatlantic') as unit (unit.id)}
    function create_each_block_2(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 6117, 9579);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(161:6050) {#each units.filter(u=>u.place=='southatlantic') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:6488) {#each units.filter(u=>u.place=='southpacific') as unit (unit.id)}
    function create_each_block_1(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 6554, 10016);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(161:6488) {#each units.filter(u=>u.place=='southpacific') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    // (161:6914) {#each units.filter(u=>u.place=='australia') as unit (unit.id)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let unit;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[41],
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(unit.$$.fragment);
    			add_location(div, file$3, 160, 6977, 10439);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unit, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const unit_changes = {};
    			if (dirty[0] & /*units*/ 1) unit_changes.unit = /*unit*/ ctx[41];
    			if (dirty[0] & /*choose*/ 2) unit_changes.choose = /*choose*/ ctx[1];
    			unit.$set(unit_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[22], { key: /*unit*/ ctx[41].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[21], { key: /*unit*/ ctx[41].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unit);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(161:6914) {#each units.filter(u=>u.place=='australia') as unit (unit.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div17;
    	let div0;
    	let each_blocks_16 = [];
    	let each0_lookup = new Map_1();
    	let each0_anchor;
    	let gate0;
    	let glyphs0;
    	let div1;
    	let each_blocks_15 = [];
    	let each1_lookup = new Map_1();
    	let each1_anchor;
    	let gate1;
    	let glyphs1;
    	let div2;
    	let each_blocks_14 = [];
    	let each2_lookup = new Map_1();
    	let each2_anchor;
    	let gate2;
    	let glyphs2;
    	let div3;
    	let each_blocks_13 = [];
    	let each3_lookup = new Map_1();
    	let each3_anchor;
    	let gate3;
    	let glyphs3;
    	let div4;
    	let each_blocks_12 = [];
    	let each4_lookup = new Map_1();
    	let each4_anchor;
    	let gate4;
    	let glyphs4;
    	let div5;
    	let each_blocks_11 = [];
    	let each5_lookup = new Map_1();
    	let each5_anchor;
    	let gate5;
    	let glyphs5;
    	let div6;
    	let each_blocks_10 = [];
    	let each6_lookup = new Map_1();
    	let each6_anchor;
    	let gate6;
    	let glyphs6;
    	let div7;
    	let each_blocks_9 = [];
    	let each7_lookup = new Map_1();
    	let each7_anchor;
    	let gate7;
    	let glyphs7;
    	let div8;
    	let each_blocks_8 = [];
    	let each8_lookup = new Map_1();
    	let each8_anchor;
    	let gate8;
    	let glyphs8;
    	let div9;
    	let each_blocks_7 = [];
    	let each9_lookup = new Map_1();
    	let each9_anchor;
    	let gate9;
    	let glyphs9;
    	let div10;
    	let each_blocks_6 = [];
    	let each10_lookup = new Map_1();
    	let each10_anchor;
    	let gate10;
    	let glyphs10;
    	let div11;
    	let each_blocks_5 = [];
    	let each11_lookup = new Map_1();
    	let each11_anchor;
    	let gate11;
    	let glyphs11;
    	let div12;
    	let each_blocks_4 = [];
    	let each12_lookup = new Map_1();
    	let each12_anchor;
    	let gate12;
    	let glyphs12;
    	let div13;
    	let each_blocks_3 = [];
    	let each13_lookup = new Map_1();
    	let each13_anchor;
    	let gate13;
    	let glyphs13;
    	let div14;
    	let each_blocks_2 = [];
    	let each14_lookup = new Map_1();
    	let each14_anchor;
    	let gate14;
    	let glyphs14;
    	let div15;
    	let each_blocks_1 = [];
    	let each15_lookup = new Map_1();
    	let each15_anchor;
    	let gate15;
    	let glyphs15;
    	let div16;
    	let each_blocks = [];
    	let each16_lookup = new Map_1();
    	let each16_anchor;
    	let gate16;
    	let glyphs16;
    	let div18;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_16 = /*units*/ ctx[0].filter(func);
    	validate_each_argument(each_value_16);
    	const get_key = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_16, get_each_context_16, get_key);

    	for (let i = 0; i < each_value_16.length; i += 1) {
    		let child_ctx = get_each_context_16(ctx, each_value_16, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_16[i] = create_each_block_16(key, child_ctx));
    	}

    	gate0 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "arcticocean",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs0 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "arcticocean",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_15 = /*units*/ ctx[0].filter(func_1);
    	validate_each_argument(each_value_15);
    	const get_key_1 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_15, get_each_context_15, get_key_1);

    	for (let i = 0; i < each_value_15.length; i += 1) {
    		let child_ctx = get_each_context_15(ctx, each_value_15, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks_15[i] = create_each_block_15(key, child_ctx));
    	}

    	gate1 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "northpacific",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs1 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "northpacific",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_14 = /*units*/ ctx[0].filter(func_2);
    	validate_each_argument(each_value_14);
    	const get_key_2 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_14, get_each_context_14, get_key_2);

    	for (let i = 0; i < each_value_14.length; i += 1) {
    		let child_ctx = get_each_context_14(ctx, each_value_14, i);
    		let key = get_key_2(child_ctx);
    		each2_lookup.set(key, each_blocks_14[i] = create_each_block_14(key, child_ctx));
    	}

    	gate2 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "northamerica",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs2 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "northamerica",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_13 = /*units*/ ctx[0].filter(func_3);
    	validate_each_argument(each_value_13);
    	const get_key_3 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_13, get_each_context_13, get_key_3);

    	for (let i = 0; i < each_value_13.length; i += 1) {
    		let child_ctx = get_each_context_13(ctx, each_value_13, i);
    		let key = get_key_3(child_ctx);
    		each3_lookup.set(key, each_blocks_13[i] = create_each_block_13(key, child_ctx));
    	}

    	gate3 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "northatlantic",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs3 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "northatlantic",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_12 = /*units*/ ctx[0].filter(func_4);
    	validate_each_argument(each_value_12);
    	const get_key_4 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_12, get_each_context_12, get_key_4);

    	for (let i = 0; i < each_value_12.length; i += 1) {
    		let child_ctx = get_each_context_12(ctx, each_value_12, i);
    		let key = get_key_4(child_ctx);
    		each4_lookup.set(key, each_blocks_12[i] = create_each_block_12(key, child_ctx));
    	}

    	gate4 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "scandinavia",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs4 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "scandinavia",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_11 = /*units*/ ctx[0].filter(func_5);
    	validate_each_argument(each_value_11);
    	const get_key_5 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_11, get_each_context_11, get_key_5);

    	for (let i = 0; i < each_value_11.length; i += 1) {
    		let child_ctx = get_each_context_11(ctx, each_value_11, i);
    		let key = get_key_5(child_ctx);
    		each5_lookup.set(key, each_blocks_11[i] = create_each_block_11(key, child_ctx));
    	}

    	gate5 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "europe",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs5 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "europe",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_10 = /*units*/ ctx[0].filter(func_6);
    	validate_each_argument(each_value_10);
    	const get_key_6 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_10, get_each_context_10, get_key_6);

    	for (let i = 0; i < each_value_10.length; i += 1) {
    		let child_ctx = get_each_context_10(ctx, each_value_10, i);
    		let key = get_key_6(child_ctx);
    		each6_lookup.set(key, each_blocks_10[i] = create_each_block_10(key, child_ctx));
    	}

    	gate6 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "northasia",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs6 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "northasia",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_9 = /*units*/ ctx[0].filter(func_7);
    	validate_each_argument(each_value_9);
    	const get_key_7 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_9, get_each_context_9, get_key_7);

    	for (let i = 0; i < each_value_9.length; i += 1) {
    		let child_ctx = get_each_context_9(ctx, each_value_9, i);
    		let key = get_key_7(child_ctx);
    		each7_lookup.set(key, each_blocks_9[i] = create_each_block_9(key, child_ctx));
    	}

    	gate7 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "southamerica",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs7 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "southamerica",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_8 = /*units*/ ctx[0].filter(func_8);
    	validate_each_argument(each_value_8);
    	const get_key_8 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_8, get_each_context_8, get_key_8);

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		let child_ctx = get_each_context_8(ctx, each_value_8, i);
    		let key = get_key_8(child_ctx);
    		each8_lookup.set(key, each_blocks_8[i] = create_each_block_8(key, child_ctx));
    	}

    	gate8 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "southasia",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs8 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "southasia",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_7 = /*units*/ ctx[0].filter(func_9);
    	validate_each_argument(each_value_7);
    	const get_key_9 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_7, get_each_context_7, get_key_9);

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		let child_ctx = get_each_context_7(ctx, each_value_7, i);
    		let key = get_key_9(child_ctx);
    		each9_lookup.set(key, each_blocks_7[i] = create_each_block_7(key, child_ctx));
    	}

    	gate9 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "arabia",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs9 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "arabia",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_6 = /*units*/ ctx[0].filter(func_10);
    	validate_each_argument(each_value_6);
    	const get_key_10 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_6, get_each_context_6, get_key_10);

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		let child_ctx = get_each_context_6(ctx, each_value_6, i);
    		let key = get_key_10(child_ctx);
    		each10_lookup.set(key, each_blocks_6[i] = create_each_block_6(key, child_ctx));
    	}

    	gate10 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "westafrica",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs10 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "westafrica",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_5 = /*units*/ ctx[0].filter(func_11);
    	validate_each_argument(each_value_5);
    	const get_key_11 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_5, get_each_context_5, get_key_11);

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		let child_ctx = get_each_context_5(ctx, each_value_5, i);
    		let key = get_key_11(child_ctx);
    		each11_lookup.set(key, each_blocks_5[i] = create_each_block_5(key, child_ctx));
    	}

    	gate11 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "indianocean",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs11 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "indianocean",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_4 = /*units*/ ctx[0].filter(func_12);
    	validate_each_argument(each_value_4);
    	const get_key_12 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_4, get_each_context_4, get_key_12);

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		let child_ctx = get_each_context_4(ctx, each_value_4, i);
    		let key = get_key_12(child_ctx);
    		each12_lookup.set(key, each_blocks_4[i] = create_each_block_4(key, child_ctx));
    	}

    	gate12 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "eastafrica",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs12 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "eastafrica",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_3 = /*units*/ ctx[0].filter(func_13);
    	validate_each_argument(each_value_3);
    	const get_key_13 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_3, get_each_context_3, get_key_13);

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		let child_ctx = get_each_context_3(ctx, each_value_3, i);
    		let key = get_key_13(child_ctx);
    		each13_lookup.set(key, each_blocks_3[i] = create_each_block_3(key, child_ctx));
    	}

    	gate13 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "antarctica",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs13 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "antarctica",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_2 = /*units*/ ctx[0].filter(func_14);
    	validate_each_argument(each_value_2);
    	const get_key_14 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key_14);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key_14(child_ctx);
    		each14_lookup.set(key, each_blocks_2[i] = create_each_block_2(key, child_ctx));
    	}

    	gate14 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "southatlantic",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs14 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "southatlantic",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value_1 = /*units*/ ctx[0].filter(func_15);
    	validate_each_argument(each_value_1);
    	const get_key_15 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key_15);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key_15(child_ctx);
    		each15_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	gate15 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "southpacific",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs15 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "southpacific",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value = /*units*/ ctx[0].filter(func_16);
    	validate_each_argument(each_value);
    	const get_key_16 = ctx => /*unit*/ ctx[41].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key_16);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_16(child_ctx);
    		each16_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	gate16 = new Gate({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "australia",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	glyphs16 = new Glyphs({
    			props: {
    				places: /*places*/ ctx[2],
    				name: "australia",
    				choose: /*choose*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div17 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_16.length; i += 1) {
    				each_blocks_16[i].c();
    			}

    			each0_anchor = empty();
    			create_component(gate0.$$.fragment);
    			create_component(glyphs0.$$.fragment);
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_15.length; i += 1) {
    				each_blocks_15[i].c();
    			}

    			each1_anchor = empty();
    			create_component(gate1.$$.fragment);
    			create_component(glyphs1.$$.fragment);
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_14.length; i += 1) {
    				each_blocks_14[i].c();
    			}

    			each2_anchor = empty();
    			create_component(gate2.$$.fragment);
    			create_component(glyphs2.$$.fragment);
    			div3 = element("div");

    			for (let i = 0; i < each_blocks_13.length; i += 1) {
    				each_blocks_13[i].c();
    			}

    			each3_anchor = empty();
    			create_component(gate3.$$.fragment);
    			create_component(glyphs3.$$.fragment);
    			div4 = element("div");

    			for (let i = 0; i < each_blocks_12.length; i += 1) {
    				each_blocks_12[i].c();
    			}

    			each4_anchor = empty();
    			create_component(gate4.$$.fragment);
    			create_component(glyphs4.$$.fragment);
    			div5 = element("div");

    			for (let i = 0; i < each_blocks_11.length; i += 1) {
    				each_blocks_11[i].c();
    			}

    			each5_anchor = empty();
    			create_component(gate5.$$.fragment);
    			create_component(glyphs5.$$.fragment);
    			div6 = element("div");

    			for (let i = 0; i < each_blocks_10.length; i += 1) {
    				each_blocks_10[i].c();
    			}

    			each6_anchor = empty();
    			create_component(gate6.$$.fragment);
    			create_component(glyphs6.$$.fragment);
    			div7 = element("div");

    			for (let i = 0; i < each_blocks_9.length; i += 1) {
    				each_blocks_9[i].c();
    			}

    			each7_anchor = empty();
    			create_component(gate7.$$.fragment);
    			create_component(glyphs7.$$.fragment);
    			div8 = element("div");

    			for (let i = 0; i < each_blocks_8.length; i += 1) {
    				each_blocks_8[i].c();
    			}

    			each8_anchor = empty();
    			create_component(gate8.$$.fragment);
    			create_component(glyphs8.$$.fragment);
    			div9 = element("div");

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				each_blocks_7[i].c();
    			}

    			each9_anchor = empty();
    			create_component(gate9.$$.fragment);
    			create_component(glyphs9.$$.fragment);
    			div10 = element("div");

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].c();
    			}

    			each10_anchor = empty();
    			create_component(gate10.$$.fragment);
    			create_component(glyphs10.$$.fragment);
    			div11 = element("div");

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].c();
    			}

    			each11_anchor = empty();
    			create_component(gate11.$$.fragment);
    			create_component(glyphs11.$$.fragment);
    			div12 = element("div");

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			each12_anchor = empty();
    			create_component(gate12.$$.fragment);
    			create_component(glyphs12.$$.fragment);
    			div13 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			each13_anchor = empty();
    			create_component(gate13.$$.fragment);
    			create_component(glyphs13.$$.fragment);
    			div14 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			each14_anchor = empty();
    			create_component(gate14.$$.fragment);
    			create_component(glyphs14.$$.fragment);
    			div15 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			each15_anchor = empty();
    			create_component(gate15.$$.fragment);
    			create_component(glyphs15.$$.fragment);
    			div16 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each16_anchor = empty();
    			create_component(gate16.$$.fragment);
    			create_component(glyphs16.$$.fragment);
    			div18 = element("div");
    			attr_dev(div0, "class", "l arcticocean svelte-138shqo");
    			attr_dev(div0, "name", "arcticocean");
    			add_location(div0, file$3, 160, 19, 3481);
    			attr_dev(div1, "class", "l northpacific svelte-138shqo");
    			attr_dev(div1, "name", "northpacific");
    			add_location(div1, file$3, 160, 448, 3910);
    			attr_dev(div2, "class", "l northamerica svelte-138shqo");
    			attr_dev(div2, "name", "northamerica");
    			add_location(div2, file$3, 160, 883, 4345);
    			attr_dev(div3, "class", "l northatlantic svelte-138shqo");
    			attr_dev(div3, "name", "northatlantic");
    			add_location(div3, file$3, 160, 1318, 4780);
    			attr_dev(div4, "class", "l scandinavia svelte-138shqo");
    			attr_dev(div4, "name", "scandinavia");
    			add_location(div4, file$3, 160, 1759, 5221);
    			attr_dev(div5, "class", "l europe svelte-138shqo");
    			attr_dev(div5, "name", "europe");
    			add_location(div5, file$3, 160, 2188, 5650);
    			attr_dev(div6, "class", "l northasia svelte-138shqo");
    			attr_dev(div6, "name", "northasia");
    			add_location(div6, file$3, 160, 2587, 6049);
    			attr_dev(div7, "class", "l southamerica svelte-138shqo");
    			attr_dev(div7, "name", "southamerica");
    			add_location(div7, file$3, 160, 3004, 6466);
    			attr_dev(div8, "class", "l southasia svelte-138shqo");
    			attr_dev(div8, "name", "southasia");
    			add_location(div8, file$3, 160, 3439, 6901);
    			attr_dev(div9, "class", "l arabia svelte-138shqo");
    			attr_dev(div9, "name", "arabia");
    			add_location(div9, file$3, 160, 3856, 7318);
    			attr_dev(div10, "class", "l westafrica svelte-138shqo");
    			attr_dev(div10, "name", "westafrica");
    			add_location(div10, file$3, 160, 4255, 7717);
    			attr_dev(div11, "class", "l indianocean svelte-138shqo");
    			attr_dev(div11, "name", "indianocean");
    			add_location(div11, file$3, 160, 4678, 8140);
    			attr_dev(div12, "class", "l eastafrica svelte-138shqo");
    			attr_dev(div12, "name", "eastafrica");
    			add_location(div12, file$3, 160, 5107, 8569);
    			attr_dev(div13, "class", "l antarctica svelte-138shqo");
    			attr_dev(div13, "name", "antarctica");
    			add_location(div13, file$3, 160, 5530, 8992);
    			attr_dev(div14, "class", "l southatlantic svelte-138shqo");
    			attr_dev(div14, "name", "southatlantic");
    			add_location(div14, file$3, 160, 5953, 9415);
    			attr_dev(div15, "class", "l southpacific svelte-138shqo");
    			attr_dev(div15, "name", "southpacific");
    			add_location(div15, file$3, 160, 6394, 9856);
    			attr_dev(div16, "class", "l australia svelte-138shqo");
    			attr_dev(div16, "name", "australia");
    			add_location(div16, file$3, 160, 6829, 10291);
    			attr_dev(div17, "class", "grid2 svelte-138shqo");
    			add_location(div17, file$3, 160, 0, 3462);
    			attr_dev(div18, "class", "grid svelte-138shqo");
    			add_location(div18, file$3, 160, 7252, 10714);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div17, anchor);
    			append_dev(div17, div0);

    			for (let i = 0; i < each_blocks_16.length; i += 1) {
    				each_blocks_16[i].m(div0, null);
    			}

    			append_dev(div0, each0_anchor);
    			mount_component(gate0, div0, null);
    			mount_component(glyphs0, div0, null);
    			/*div0_binding*/ ctx[23](div0);
    			append_dev(div17, div1);

    			for (let i = 0; i < each_blocks_15.length; i += 1) {
    				each_blocks_15[i].m(div1, null);
    			}

    			append_dev(div1, each1_anchor);
    			mount_component(gate1, div1, null);
    			mount_component(glyphs1, div1, null);
    			/*div1_binding*/ ctx[24](div1);
    			append_dev(div17, div2);

    			for (let i = 0; i < each_blocks_14.length; i += 1) {
    				each_blocks_14[i].m(div2, null);
    			}

    			append_dev(div2, each2_anchor);
    			mount_component(gate2, div2, null);
    			mount_component(glyphs2, div2, null);
    			/*div2_binding*/ ctx[25](div2);
    			append_dev(div17, div3);

    			for (let i = 0; i < each_blocks_13.length; i += 1) {
    				each_blocks_13[i].m(div3, null);
    			}

    			append_dev(div3, each3_anchor);
    			mount_component(gate3, div3, null);
    			mount_component(glyphs3, div3, null);
    			/*div3_binding*/ ctx[26](div3);
    			append_dev(div17, div4);

    			for (let i = 0; i < each_blocks_12.length; i += 1) {
    				each_blocks_12[i].m(div4, null);
    			}

    			append_dev(div4, each4_anchor);
    			mount_component(gate4, div4, null);
    			mount_component(glyphs4, div4, null);
    			/*div4_binding*/ ctx[27](div4);
    			append_dev(div17, div5);

    			for (let i = 0; i < each_blocks_11.length; i += 1) {
    				each_blocks_11[i].m(div5, null);
    			}

    			append_dev(div5, each5_anchor);
    			mount_component(gate5, div5, null);
    			mount_component(glyphs5, div5, null);
    			/*div5_binding*/ ctx[28](div5);
    			append_dev(div17, div6);

    			for (let i = 0; i < each_blocks_10.length; i += 1) {
    				each_blocks_10[i].m(div6, null);
    			}

    			append_dev(div6, each6_anchor);
    			mount_component(gate6, div6, null);
    			mount_component(glyphs6, div6, null);
    			/*div6_binding*/ ctx[29](div6);
    			append_dev(div17, div7);

    			for (let i = 0; i < each_blocks_9.length; i += 1) {
    				each_blocks_9[i].m(div7, null);
    			}

    			append_dev(div7, each7_anchor);
    			mount_component(gate7, div7, null);
    			mount_component(glyphs7, div7, null);
    			/*div7_binding*/ ctx[30](div7);
    			append_dev(div17, div8);

    			for (let i = 0; i < each_blocks_8.length; i += 1) {
    				each_blocks_8[i].m(div8, null);
    			}

    			append_dev(div8, each8_anchor);
    			mount_component(gate8, div8, null);
    			mount_component(glyphs8, div8, null);
    			/*div8_binding*/ ctx[31](div8);
    			append_dev(div17, div9);

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				each_blocks_7[i].m(div9, null);
    			}

    			append_dev(div9, each9_anchor);
    			mount_component(gate9, div9, null);
    			mount_component(glyphs9, div9, null);
    			/*div9_binding*/ ctx[32](div9);
    			append_dev(div17, div10);

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].m(div10, null);
    			}

    			append_dev(div10, each10_anchor);
    			mount_component(gate10, div10, null);
    			mount_component(glyphs10, div10, null);
    			/*div10_binding*/ ctx[33](div10);
    			append_dev(div17, div11);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].m(div11, null);
    			}

    			append_dev(div11, each11_anchor);
    			mount_component(gate11, div11, null);
    			mount_component(glyphs11, div11, null);
    			/*div11_binding*/ ctx[34](div11);
    			append_dev(div17, div12);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(div12, null);
    			}

    			append_dev(div12, each12_anchor);
    			mount_component(gate12, div12, null);
    			mount_component(glyphs12, div12, null);
    			/*div12_binding*/ ctx[35](div12);
    			append_dev(div17, div13);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div13, null);
    			}

    			append_dev(div13, each13_anchor);
    			mount_component(gate13, div13, null);
    			mount_component(glyphs13, div13, null);
    			/*div13_binding*/ ctx[36](div13);
    			append_dev(div17, div14);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div14, null);
    			}

    			append_dev(div14, each14_anchor);
    			mount_component(gate14, div14, null);
    			mount_component(glyphs14, div14, null);
    			/*div14_binding*/ ctx[37](div14);
    			append_dev(div17, div15);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div15, null);
    			}

    			append_dev(div15, each15_anchor);
    			mount_component(gate15, div15, null);
    			mount_component(glyphs15, div15, null);
    			/*div15_binding*/ ctx[38](div15);
    			append_dev(div17, div16);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div16, null);
    			}

    			append_dev(div16, each16_anchor);
    			mount_component(gate16, div16, null);
    			mount_component(glyphs16, div16, null);
    			/*div16_binding*/ ctx[39](div16);
    			insert_dev(target, div18, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div1, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div2, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div3, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div4, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div5, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div6, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div7, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div8, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div9, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div10, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div11, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div12, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div13, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div14, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div15, "click", /*click*/ ctx[20], false, false, false),
    					listen_dev(div16, "click", /*click*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_16 = /*units*/ ctx[0].filter(func);
    				validate_each_argument(each_value_16);
    				group_outros();
    				for (let i = 0; i < each_blocks_16.length; i += 1) each_blocks_16[i].r();
    				validate_each_keys(ctx, each_value_16, get_each_context_16, get_key);
    				each_blocks_16 = update_keyed_each(each_blocks_16, dirty, get_key, 1, ctx, each_value_16, each0_lookup, div0, fix_and_outro_and_destroy_block, create_each_block_16, each0_anchor, get_each_context_16);
    				for (let i = 0; i < each_blocks_16.length; i += 1) each_blocks_16[i].a();
    				check_outros();
    			}

    			const gate0_changes = {};
    			if (dirty[0] & /*places*/ 4) gate0_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate0_changes.choose = /*choose*/ ctx[1];
    			gate0.$set(gate0_changes);
    			const glyphs0_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs0_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs0_changes.choose = /*choose*/ ctx[1];
    			glyphs0.$set(glyphs0_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_15 = /*units*/ ctx[0].filter(func_1);
    				validate_each_argument(each_value_15);
    				group_outros();
    				for (let i = 0; i < each_blocks_15.length; i += 1) each_blocks_15[i].r();
    				validate_each_keys(ctx, each_value_15, get_each_context_15, get_key_1);
    				each_blocks_15 = update_keyed_each(each_blocks_15, dirty, get_key_1, 1, ctx, each_value_15, each1_lookup, div1, fix_and_outro_and_destroy_block, create_each_block_15, each1_anchor, get_each_context_15);
    				for (let i = 0; i < each_blocks_15.length; i += 1) each_blocks_15[i].a();
    				check_outros();
    			}

    			const gate1_changes = {};
    			if (dirty[0] & /*places*/ 4) gate1_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate1_changes.choose = /*choose*/ ctx[1];
    			gate1.$set(gate1_changes);
    			const glyphs1_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs1_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs1_changes.choose = /*choose*/ ctx[1];
    			glyphs1.$set(glyphs1_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_14 = /*units*/ ctx[0].filter(func_2);
    				validate_each_argument(each_value_14);
    				group_outros();
    				for (let i = 0; i < each_blocks_14.length; i += 1) each_blocks_14[i].r();
    				validate_each_keys(ctx, each_value_14, get_each_context_14, get_key_2);
    				each_blocks_14 = update_keyed_each(each_blocks_14, dirty, get_key_2, 1, ctx, each_value_14, each2_lookup, div2, fix_and_outro_and_destroy_block, create_each_block_14, each2_anchor, get_each_context_14);
    				for (let i = 0; i < each_blocks_14.length; i += 1) each_blocks_14[i].a();
    				check_outros();
    			}

    			const gate2_changes = {};
    			if (dirty[0] & /*places*/ 4) gate2_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate2_changes.choose = /*choose*/ ctx[1];
    			gate2.$set(gate2_changes);
    			const glyphs2_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs2_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs2_changes.choose = /*choose*/ ctx[1];
    			glyphs2.$set(glyphs2_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_13 = /*units*/ ctx[0].filter(func_3);
    				validate_each_argument(each_value_13);
    				group_outros();
    				for (let i = 0; i < each_blocks_13.length; i += 1) each_blocks_13[i].r();
    				validate_each_keys(ctx, each_value_13, get_each_context_13, get_key_3);
    				each_blocks_13 = update_keyed_each(each_blocks_13, dirty, get_key_3, 1, ctx, each_value_13, each3_lookup, div3, fix_and_outro_and_destroy_block, create_each_block_13, each3_anchor, get_each_context_13);
    				for (let i = 0; i < each_blocks_13.length; i += 1) each_blocks_13[i].a();
    				check_outros();
    			}

    			const gate3_changes = {};
    			if (dirty[0] & /*places*/ 4) gate3_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate3_changes.choose = /*choose*/ ctx[1];
    			gate3.$set(gate3_changes);
    			const glyphs3_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs3_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs3_changes.choose = /*choose*/ ctx[1];
    			glyphs3.$set(glyphs3_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_12 = /*units*/ ctx[0].filter(func_4);
    				validate_each_argument(each_value_12);
    				group_outros();
    				for (let i = 0; i < each_blocks_12.length; i += 1) each_blocks_12[i].r();
    				validate_each_keys(ctx, each_value_12, get_each_context_12, get_key_4);
    				each_blocks_12 = update_keyed_each(each_blocks_12, dirty, get_key_4, 1, ctx, each_value_12, each4_lookup, div4, fix_and_outro_and_destroy_block, create_each_block_12, each4_anchor, get_each_context_12);
    				for (let i = 0; i < each_blocks_12.length; i += 1) each_blocks_12[i].a();
    				check_outros();
    			}

    			const gate4_changes = {};
    			if (dirty[0] & /*places*/ 4) gate4_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate4_changes.choose = /*choose*/ ctx[1];
    			gate4.$set(gate4_changes);
    			const glyphs4_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs4_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs4_changes.choose = /*choose*/ ctx[1];
    			glyphs4.$set(glyphs4_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_11 = /*units*/ ctx[0].filter(func_5);
    				validate_each_argument(each_value_11);
    				group_outros();
    				for (let i = 0; i < each_blocks_11.length; i += 1) each_blocks_11[i].r();
    				validate_each_keys(ctx, each_value_11, get_each_context_11, get_key_5);
    				each_blocks_11 = update_keyed_each(each_blocks_11, dirty, get_key_5, 1, ctx, each_value_11, each5_lookup, div5, fix_and_outro_and_destroy_block, create_each_block_11, each5_anchor, get_each_context_11);
    				for (let i = 0; i < each_blocks_11.length; i += 1) each_blocks_11[i].a();
    				check_outros();
    			}

    			const gate5_changes = {};
    			if (dirty[0] & /*places*/ 4) gate5_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate5_changes.choose = /*choose*/ ctx[1];
    			gate5.$set(gate5_changes);
    			const glyphs5_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs5_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs5_changes.choose = /*choose*/ ctx[1];
    			glyphs5.$set(glyphs5_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_10 = /*units*/ ctx[0].filter(func_6);
    				validate_each_argument(each_value_10);
    				group_outros();
    				for (let i = 0; i < each_blocks_10.length; i += 1) each_blocks_10[i].r();
    				validate_each_keys(ctx, each_value_10, get_each_context_10, get_key_6);
    				each_blocks_10 = update_keyed_each(each_blocks_10, dirty, get_key_6, 1, ctx, each_value_10, each6_lookup, div6, fix_and_outro_and_destroy_block, create_each_block_10, each6_anchor, get_each_context_10);
    				for (let i = 0; i < each_blocks_10.length; i += 1) each_blocks_10[i].a();
    				check_outros();
    			}

    			const gate6_changes = {};
    			if (dirty[0] & /*places*/ 4) gate6_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate6_changes.choose = /*choose*/ ctx[1];
    			gate6.$set(gate6_changes);
    			const glyphs6_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs6_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs6_changes.choose = /*choose*/ ctx[1];
    			glyphs6.$set(glyphs6_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_9 = /*units*/ ctx[0].filter(func_7);
    				validate_each_argument(each_value_9);
    				group_outros();
    				for (let i = 0; i < each_blocks_9.length; i += 1) each_blocks_9[i].r();
    				validate_each_keys(ctx, each_value_9, get_each_context_9, get_key_7);
    				each_blocks_9 = update_keyed_each(each_blocks_9, dirty, get_key_7, 1, ctx, each_value_9, each7_lookup, div7, fix_and_outro_and_destroy_block, create_each_block_9, each7_anchor, get_each_context_9);
    				for (let i = 0; i < each_blocks_9.length; i += 1) each_blocks_9[i].a();
    				check_outros();
    			}

    			const gate7_changes = {};
    			if (dirty[0] & /*places*/ 4) gate7_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate7_changes.choose = /*choose*/ ctx[1];
    			gate7.$set(gate7_changes);
    			const glyphs7_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs7_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs7_changes.choose = /*choose*/ ctx[1];
    			glyphs7.$set(glyphs7_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_8 = /*units*/ ctx[0].filter(func_8);
    				validate_each_argument(each_value_8);
    				group_outros();
    				for (let i = 0; i < each_blocks_8.length; i += 1) each_blocks_8[i].r();
    				validate_each_keys(ctx, each_value_8, get_each_context_8, get_key_8);
    				each_blocks_8 = update_keyed_each(each_blocks_8, dirty, get_key_8, 1, ctx, each_value_8, each8_lookup, div8, fix_and_outro_and_destroy_block, create_each_block_8, each8_anchor, get_each_context_8);
    				for (let i = 0; i < each_blocks_8.length; i += 1) each_blocks_8[i].a();
    				check_outros();
    			}

    			const gate8_changes = {};
    			if (dirty[0] & /*places*/ 4) gate8_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate8_changes.choose = /*choose*/ ctx[1];
    			gate8.$set(gate8_changes);
    			const glyphs8_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs8_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs8_changes.choose = /*choose*/ ctx[1];
    			glyphs8.$set(glyphs8_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_7 = /*units*/ ctx[0].filter(func_9);
    				validate_each_argument(each_value_7);
    				group_outros();
    				for (let i = 0; i < each_blocks_7.length; i += 1) each_blocks_7[i].r();
    				validate_each_keys(ctx, each_value_7, get_each_context_7, get_key_9);
    				each_blocks_7 = update_keyed_each(each_blocks_7, dirty, get_key_9, 1, ctx, each_value_7, each9_lookup, div9, fix_and_outro_and_destroy_block, create_each_block_7, each9_anchor, get_each_context_7);
    				for (let i = 0; i < each_blocks_7.length; i += 1) each_blocks_7[i].a();
    				check_outros();
    			}

    			const gate9_changes = {};
    			if (dirty[0] & /*places*/ 4) gate9_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate9_changes.choose = /*choose*/ ctx[1];
    			gate9.$set(gate9_changes);
    			const glyphs9_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs9_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs9_changes.choose = /*choose*/ ctx[1];
    			glyphs9.$set(glyphs9_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_6 = /*units*/ ctx[0].filter(func_10);
    				validate_each_argument(each_value_6);
    				group_outros();
    				for (let i = 0; i < each_blocks_6.length; i += 1) each_blocks_6[i].r();
    				validate_each_keys(ctx, each_value_6, get_each_context_6, get_key_10);
    				each_blocks_6 = update_keyed_each(each_blocks_6, dirty, get_key_10, 1, ctx, each_value_6, each10_lookup, div10, fix_and_outro_and_destroy_block, create_each_block_6, each10_anchor, get_each_context_6);
    				for (let i = 0; i < each_blocks_6.length; i += 1) each_blocks_6[i].a();
    				check_outros();
    			}

    			const gate10_changes = {};
    			if (dirty[0] & /*places*/ 4) gate10_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate10_changes.choose = /*choose*/ ctx[1];
    			gate10.$set(gate10_changes);
    			const glyphs10_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs10_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs10_changes.choose = /*choose*/ ctx[1];
    			glyphs10.$set(glyphs10_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_5 = /*units*/ ctx[0].filter(func_11);
    				validate_each_argument(each_value_5);
    				group_outros();
    				for (let i = 0; i < each_blocks_5.length; i += 1) each_blocks_5[i].r();
    				validate_each_keys(ctx, each_value_5, get_each_context_5, get_key_11);
    				each_blocks_5 = update_keyed_each(each_blocks_5, dirty, get_key_11, 1, ctx, each_value_5, each11_lookup, div11, fix_and_outro_and_destroy_block, create_each_block_5, each11_anchor, get_each_context_5);
    				for (let i = 0; i < each_blocks_5.length; i += 1) each_blocks_5[i].a();
    				check_outros();
    			}

    			const gate11_changes = {};
    			if (dirty[0] & /*places*/ 4) gate11_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate11_changes.choose = /*choose*/ ctx[1];
    			gate11.$set(gate11_changes);
    			const glyphs11_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs11_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs11_changes.choose = /*choose*/ ctx[1];
    			glyphs11.$set(glyphs11_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_4 = /*units*/ ctx[0].filter(func_12);
    				validate_each_argument(each_value_4);
    				group_outros();
    				for (let i = 0; i < each_blocks_4.length; i += 1) each_blocks_4[i].r();
    				validate_each_keys(ctx, each_value_4, get_each_context_4, get_key_12);
    				each_blocks_4 = update_keyed_each(each_blocks_4, dirty, get_key_12, 1, ctx, each_value_4, each12_lookup, div12, fix_and_outro_and_destroy_block, create_each_block_4, each12_anchor, get_each_context_4);
    				for (let i = 0; i < each_blocks_4.length; i += 1) each_blocks_4[i].a();
    				check_outros();
    			}

    			const gate12_changes = {};
    			if (dirty[0] & /*places*/ 4) gate12_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate12_changes.choose = /*choose*/ ctx[1];
    			gate12.$set(gate12_changes);
    			const glyphs12_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs12_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs12_changes.choose = /*choose*/ ctx[1];
    			glyphs12.$set(glyphs12_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_3 = /*units*/ ctx[0].filter(func_13);
    				validate_each_argument(each_value_3);
    				group_outros();
    				for (let i = 0; i < each_blocks_3.length; i += 1) each_blocks_3[i].r();
    				validate_each_keys(ctx, each_value_3, get_each_context_3, get_key_13);
    				each_blocks_3 = update_keyed_each(each_blocks_3, dirty, get_key_13, 1, ctx, each_value_3, each13_lookup, div13, fix_and_outro_and_destroy_block, create_each_block_3, each13_anchor, get_each_context_3);
    				for (let i = 0; i < each_blocks_3.length; i += 1) each_blocks_3[i].a();
    				check_outros();
    			}

    			const gate13_changes = {};
    			if (dirty[0] & /*places*/ 4) gate13_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate13_changes.choose = /*choose*/ ctx[1];
    			gate13.$set(gate13_changes);
    			const glyphs13_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs13_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs13_changes.choose = /*choose*/ ctx[1];
    			glyphs13.$set(glyphs13_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_2 = /*units*/ ctx[0].filter(func_14);
    				validate_each_argument(each_value_2);
    				group_outros();
    				for (let i = 0; i < each_blocks_2.length; i += 1) each_blocks_2[i].r();
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key_14);
    				each_blocks_2 = update_keyed_each(each_blocks_2, dirty, get_key_14, 1, ctx, each_value_2, each14_lookup, div14, fix_and_outro_and_destroy_block, create_each_block_2, each14_anchor, get_each_context_2);
    				for (let i = 0; i < each_blocks_2.length; i += 1) each_blocks_2[i].a();
    				check_outros();
    			}

    			const gate14_changes = {};
    			if (dirty[0] & /*places*/ 4) gate14_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate14_changes.choose = /*choose*/ ctx[1];
    			gate14.$set(gate14_changes);
    			const glyphs14_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs14_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs14_changes.choose = /*choose*/ ctx[1];
    			glyphs14.$set(glyphs14_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value_1 = /*units*/ ctx[0].filter(func_15);
    				validate_each_argument(each_value_1);
    				group_outros();
    				for (let i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].r();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key_15);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key_15, 1, ctx, each_value_1, each15_lookup, div15, fix_and_outro_and_destroy_block, create_each_block_1, each15_anchor, get_each_context_1);
    				for (let i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].a();
    				check_outros();
    			}

    			const gate15_changes = {};
    			if (dirty[0] & /*places*/ 4) gate15_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate15_changes.choose = /*choose*/ ctx[1];
    			gate15.$set(gate15_changes);
    			const glyphs15_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs15_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs15_changes.choose = /*choose*/ ctx[1];
    			glyphs15.$set(glyphs15_changes);

    			if (dirty[0] & /*units, choose*/ 3) {
    				const each_value = /*units*/ ctx[0].filter(func_16);
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context, get_key_16);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_16, 1, ctx, each_value, each16_lookup, div16, fix_and_outro_and_destroy_block, create_each_block, each16_anchor, get_each_context);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}

    			const gate16_changes = {};
    			if (dirty[0] & /*places*/ 4) gate16_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) gate16_changes.choose = /*choose*/ ctx[1];
    			gate16.$set(gate16_changes);
    			const glyphs16_changes = {};
    			if (dirty[0] & /*places*/ 4) glyphs16_changes.places = /*places*/ ctx[2];
    			if (dirty[0] & /*choose*/ 2) glyphs16_changes.choose = /*choose*/ ctx[1];
    			glyphs16.$set(glyphs16_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_16.length; i += 1) {
    				transition_in(each_blocks_16[i]);
    			}

    			transition_in(gate0.$$.fragment, local);
    			transition_in(glyphs0.$$.fragment, local);

    			for (let i = 0; i < each_value_15.length; i += 1) {
    				transition_in(each_blocks_15[i]);
    			}

    			transition_in(gate1.$$.fragment, local);
    			transition_in(glyphs1.$$.fragment, local);

    			for (let i = 0; i < each_value_14.length; i += 1) {
    				transition_in(each_blocks_14[i]);
    			}

    			transition_in(gate2.$$.fragment, local);
    			transition_in(glyphs2.$$.fragment, local);

    			for (let i = 0; i < each_value_13.length; i += 1) {
    				transition_in(each_blocks_13[i]);
    			}

    			transition_in(gate3.$$.fragment, local);
    			transition_in(glyphs3.$$.fragment, local);

    			for (let i = 0; i < each_value_12.length; i += 1) {
    				transition_in(each_blocks_12[i]);
    			}

    			transition_in(gate4.$$.fragment, local);
    			transition_in(glyphs4.$$.fragment, local);

    			for (let i = 0; i < each_value_11.length; i += 1) {
    				transition_in(each_blocks_11[i]);
    			}

    			transition_in(gate5.$$.fragment, local);
    			transition_in(glyphs5.$$.fragment, local);

    			for (let i = 0; i < each_value_10.length; i += 1) {
    				transition_in(each_blocks_10[i]);
    			}

    			transition_in(gate6.$$.fragment, local);
    			transition_in(glyphs6.$$.fragment, local);

    			for (let i = 0; i < each_value_9.length; i += 1) {
    				transition_in(each_blocks_9[i]);
    			}

    			transition_in(gate7.$$.fragment, local);
    			transition_in(glyphs7.$$.fragment, local);

    			for (let i = 0; i < each_value_8.length; i += 1) {
    				transition_in(each_blocks_8[i]);
    			}

    			transition_in(gate8.$$.fragment, local);
    			transition_in(glyphs8.$$.fragment, local);

    			for (let i = 0; i < each_value_7.length; i += 1) {
    				transition_in(each_blocks_7[i]);
    			}

    			transition_in(gate9.$$.fragment, local);
    			transition_in(glyphs9.$$.fragment, local);

    			for (let i = 0; i < each_value_6.length; i += 1) {
    				transition_in(each_blocks_6[i]);
    			}

    			transition_in(gate10.$$.fragment, local);
    			transition_in(glyphs10.$$.fragment, local);

    			for (let i = 0; i < each_value_5.length; i += 1) {
    				transition_in(each_blocks_5[i]);
    			}

    			transition_in(gate11.$$.fragment, local);
    			transition_in(glyphs11.$$.fragment, local);

    			for (let i = 0; i < each_value_4.length; i += 1) {
    				transition_in(each_blocks_4[i]);
    			}

    			transition_in(gate12.$$.fragment, local);
    			transition_in(glyphs12.$$.fragment, local);

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks_3[i]);
    			}

    			transition_in(gate13.$$.fragment, local);
    			transition_in(glyphs13.$$.fragment, local);

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			transition_in(gate14.$$.fragment, local);
    			transition_in(glyphs14.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(gate15.$$.fragment, local);
    			transition_in(glyphs15.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(gate16.$$.fragment, local);
    			transition_in(glyphs16.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks_16.length; i += 1) {
    				transition_out(each_blocks_16[i]);
    			}

    			transition_out(gate0.$$.fragment, local);
    			transition_out(glyphs0.$$.fragment, local);

    			for (let i = 0; i < each_blocks_15.length; i += 1) {
    				transition_out(each_blocks_15[i]);
    			}

    			transition_out(gate1.$$.fragment, local);
    			transition_out(glyphs1.$$.fragment, local);

    			for (let i = 0; i < each_blocks_14.length; i += 1) {
    				transition_out(each_blocks_14[i]);
    			}

    			transition_out(gate2.$$.fragment, local);
    			transition_out(glyphs2.$$.fragment, local);

    			for (let i = 0; i < each_blocks_13.length; i += 1) {
    				transition_out(each_blocks_13[i]);
    			}

    			transition_out(gate3.$$.fragment, local);
    			transition_out(glyphs3.$$.fragment, local);

    			for (let i = 0; i < each_blocks_12.length; i += 1) {
    				transition_out(each_blocks_12[i]);
    			}

    			transition_out(gate4.$$.fragment, local);
    			transition_out(glyphs4.$$.fragment, local);

    			for (let i = 0; i < each_blocks_11.length; i += 1) {
    				transition_out(each_blocks_11[i]);
    			}

    			transition_out(gate5.$$.fragment, local);
    			transition_out(glyphs5.$$.fragment, local);

    			for (let i = 0; i < each_blocks_10.length; i += 1) {
    				transition_out(each_blocks_10[i]);
    			}

    			transition_out(gate6.$$.fragment, local);
    			transition_out(glyphs6.$$.fragment, local);

    			for (let i = 0; i < each_blocks_9.length; i += 1) {
    				transition_out(each_blocks_9[i]);
    			}

    			transition_out(gate7.$$.fragment, local);
    			transition_out(glyphs7.$$.fragment, local);

    			for (let i = 0; i < each_blocks_8.length; i += 1) {
    				transition_out(each_blocks_8[i]);
    			}

    			transition_out(gate8.$$.fragment, local);
    			transition_out(glyphs8.$$.fragment, local);

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				transition_out(each_blocks_7[i]);
    			}

    			transition_out(gate9.$$.fragment, local);
    			transition_out(glyphs9.$$.fragment, local);

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				transition_out(each_blocks_6[i]);
    			}

    			transition_out(gate10.$$.fragment, local);
    			transition_out(glyphs10.$$.fragment, local);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				transition_out(each_blocks_5[i]);
    			}

    			transition_out(gate11.$$.fragment, local);
    			transition_out(glyphs11.$$.fragment, local);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				transition_out(each_blocks_4[i]);
    			}

    			transition_out(gate12.$$.fragment, local);
    			transition_out(glyphs12.$$.fragment, local);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				transition_out(each_blocks_3[i]);
    			}

    			transition_out(gate13.$$.fragment, local);
    			transition_out(glyphs13.$$.fragment, local);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			transition_out(gate14.$$.fragment, local);
    			transition_out(glyphs14.$$.fragment, local);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(gate15.$$.fragment, local);
    			transition_out(glyphs15.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(gate16.$$.fragment, local);
    			transition_out(glyphs16.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div17);

    			for (let i = 0; i < each_blocks_16.length; i += 1) {
    				each_blocks_16[i].d();
    			}

    			destroy_component(gate0);
    			destroy_component(glyphs0);
    			/*div0_binding*/ ctx[23](null);

    			for (let i = 0; i < each_blocks_15.length; i += 1) {
    				each_blocks_15[i].d();
    			}

    			destroy_component(gate1);
    			destroy_component(glyphs1);
    			/*div1_binding*/ ctx[24](null);

    			for (let i = 0; i < each_blocks_14.length; i += 1) {
    				each_blocks_14[i].d();
    			}

    			destroy_component(gate2);
    			destroy_component(glyphs2);
    			/*div2_binding*/ ctx[25](null);

    			for (let i = 0; i < each_blocks_13.length; i += 1) {
    				each_blocks_13[i].d();
    			}

    			destroy_component(gate3);
    			destroy_component(glyphs3);
    			/*div3_binding*/ ctx[26](null);

    			for (let i = 0; i < each_blocks_12.length; i += 1) {
    				each_blocks_12[i].d();
    			}

    			destroy_component(gate4);
    			destroy_component(glyphs4);
    			/*div4_binding*/ ctx[27](null);

    			for (let i = 0; i < each_blocks_11.length; i += 1) {
    				each_blocks_11[i].d();
    			}

    			destroy_component(gate5);
    			destroy_component(glyphs5);
    			/*div5_binding*/ ctx[28](null);

    			for (let i = 0; i < each_blocks_10.length; i += 1) {
    				each_blocks_10[i].d();
    			}

    			destroy_component(gate6);
    			destroy_component(glyphs6);
    			/*div6_binding*/ ctx[29](null);

    			for (let i = 0; i < each_blocks_9.length; i += 1) {
    				each_blocks_9[i].d();
    			}

    			destroy_component(gate7);
    			destroy_component(glyphs7);
    			/*div7_binding*/ ctx[30](null);

    			for (let i = 0; i < each_blocks_8.length; i += 1) {
    				each_blocks_8[i].d();
    			}

    			destroy_component(gate8);
    			destroy_component(glyphs8);
    			/*div8_binding*/ ctx[31](null);

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				each_blocks_7[i].d();
    			}

    			destroy_component(gate9);
    			destroy_component(glyphs9);
    			/*div9_binding*/ ctx[32](null);

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].d();
    			}

    			destroy_component(gate10);
    			destroy_component(glyphs10);
    			/*div10_binding*/ ctx[33](null);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].d();
    			}

    			destroy_component(gate11);
    			destroy_component(glyphs11);
    			/*div11_binding*/ ctx[34](null);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].d();
    			}

    			destroy_component(gate12);
    			destroy_component(glyphs12);
    			/*div12_binding*/ ctx[35](null);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].d();
    			}

    			destroy_component(gate13);
    			destroy_component(glyphs13);
    			/*div13_binding*/ ctx[36](null);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].d();
    			}

    			destroy_component(gate14);
    			destroy_component(glyphs14);
    			/*div14_binding*/ ctx[37](null);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			destroy_component(gate15);
    			destroy_component(glyphs15);
    			/*div15_binding*/ ctx[38](null);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(gate16);
    			destroy_component(glyphs16);
    			/*div16_binding*/ ctx[39](null);
    			if (detaching) detach_dev(div18);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = u => u.place == "arcticocean";
    const func_1 = u => u.place == "northpacific";
    const func_2 = u => u.place == "northamerica";
    const func_3 = u => u.place == "northatlantic";
    const func_4 = u => u.place == "scandinavia";
    const func_5 = u => u.place == "europe";
    const func_6 = u => u.place == "northasia";
    const func_7 = u => u.place == "southamerica";
    const func_8 = u => u.place == "southasia";
    const func_9 = u => u.place == "arabia";
    const func_10 = u => u.place == "westafrica";
    const func_11 = u => u.place == "indianocean";
    const func_12 = u => u.place == "eastafrica";
    const func_13 = u => u.place == "antarctica";
    const func_14 = u => u.place == "southatlantic";
    const func_15 = u => u.place == "southpacific";
    const func_16 = u => u.place == "australia";

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Map", slots, []);
    	let { units = [] } = $$props;
    	let { choose } = $$props;

    	onMount(x => {
    		
    	});

    	let dispatch = createEventDispatcher();
    	let click = e => choose("place", e.target.getAttribute("name"));

    	let arcticocean,
    		northpacific,
    		northamerica,
    		northatlantic,
    		scandinavia,
    		europe,
    		northasia,
    		southamerica,
    		southasia,
    		arabia,
    		westafrica,
    		indianocean,
    		eastafrica,
    		antarctica,
    		southatlantic,
    		southpacific,
    		australia;

    	let { places = {} } = $$props;

    	const [send, receive] = crossfade({
    		duration: d => Math.sqrt(d * 200),
    		fallback(node, params) {
    			const style = getComputedStyle(node);
    			const transform = style.transform === "none" ? "" : style.transform;

    			return {
    				duration: 600,
    				easing: quintOut,
    				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
    			};
    		}
    	});

    	const writable_props = ["units", "choose", "places"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			arcticocean = $$value;
    			$$invalidate(3, arcticocean);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			northpacific = $$value;
    			$$invalidate(4, northpacific);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			northamerica = $$value;
    			$$invalidate(5, northamerica);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			northatlantic = $$value;
    			$$invalidate(6, northatlantic);
    		});
    	}

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			scandinavia = $$value;
    			$$invalidate(7, scandinavia);
    		});
    	}

    	function div5_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			europe = $$value;
    			$$invalidate(8, europe);
    		});
    	}

    	function div6_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			northasia = $$value;
    			$$invalidate(9, northasia);
    		});
    	}

    	function div7_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			southamerica = $$value;
    			$$invalidate(10, southamerica);
    		});
    	}

    	function div8_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			southasia = $$value;
    			$$invalidate(11, southasia);
    		});
    	}

    	function div9_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			arabia = $$value;
    			$$invalidate(12, arabia);
    		});
    	}

    	function div10_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			westafrica = $$value;
    			$$invalidate(13, westafrica);
    		});
    	}

    	function div11_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			indianocean = $$value;
    			$$invalidate(14, indianocean);
    		});
    	}

    	function div12_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			eastafrica = $$value;
    			$$invalidate(15, eastafrica);
    		});
    	}

    	function div13_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			antarctica = $$value;
    			$$invalidate(16, antarctica);
    		});
    	}

    	function div14_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			southatlantic = $$value;
    			$$invalidate(17, southatlantic);
    		});
    	}

    	function div15_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			southpacific = $$value;
    			$$invalidate(18, southpacific);
    		});
    	}

    	function div16_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			australia = $$value;
    			$$invalidate(19, australia);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("units" in $$props) $$invalidate(0, units = $$props.units);
    		if ("choose" in $$props) $$invalidate(1, choose = $$props.choose);
    		if ("places" in $$props) $$invalidate(2, places = $$props.places);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Unit,
    		Gate,
    		Glyphs,
    		onMount,
    		units,
    		choose,
    		dispatch,
    		click,
    		arcticocean,
    		northpacific,
    		northamerica,
    		northatlantic,
    		scandinavia,
    		europe,
    		northasia,
    		southamerica,
    		southasia,
    		arabia,
    		westafrica,
    		indianocean,
    		eastafrica,
    		antarctica,
    		southatlantic,
    		southpacific,
    		australia,
    		places,
    		quintOut,
    		crossfade,
    		flip,
    		send,
    		receive
    	});

    	$$self.$inject_state = $$props => {
    		if ("units" in $$props) $$invalidate(0, units = $$props.units);
    		if ("choose" in $$props) $$invalidate(1, choose = $$props.choose);
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("click" in $$props) $$invalidate(20, click = $$props.click);
    		if ("arcticocean" in $$props) $$invalidate(3, arcticocean = $$props.arcticocean);
    		if ("northpacific" in $$props) $$invalidate(4, northpacific = $$props.northpacific);
    		if ("northamerica" in $$props) $$invalidate(5, northamerica = $$props.northamerica);
    		if ("northatlantic" in $$props) $$invalidate(6, northatlantic = $$props.northatlantic);
    		if ("scandinavia" in $$props) $$invalidate(7, scandinavia = $$props.scandinavia);
    		if ("europe" in $$props) $$invalidate(8, europe = $$props.europe);
    		if ("northasia" in $$props) $$invalidate(9, northasia = $$props.northasia);
    		if ("southamerica" in $$props) $$invalidate(10, southamerica = $$props.southamerica);
    		if ("southasia" in $$props) $$invalidate(11, southasia = $$props.southasia);
    		if ("arabia" in $$props) $$invalidate(12, arabia = $$props.arabia);
    		if ("westafrica" in $$props) $$invalidate(13, westafrica = $$props.westafrica);
    		if ("indianocean" in $$props) $$invalidate(14, indianocean = $$props.indianocean);
    		if ("eastafrica" in $$props) $$invalidate(15, eastafrica = $$props.eastafrica);
    		if ("antarctica" in $$props) $$invalidate(16, antarctica = $$props.antarctica);
    		if ("southatlantic" in $$props) $$invalidate(17, southatlantic = $$props.southatlantic);
    		if ("southpacific" in $$props) $$invalidate(18, southpacific = $$props.southpacific);
    		if ("australia" in $$props) $$invalidate(19, australia = $$props.australia);
    		if ("places" in $$props) $$invalidate(2, places = $$props.places);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		units,
    		choose,
    		places,
    		arcticocean,
    		northpacific,
    		northamerica,
    		northatlantic,
    		scandinavia,
    		europe,
    		northasia,
    		southamerica,
    		southasia,
    		arabia,
    		westafrica,
    		indianocean,
    		eastafrica,
    		antarctica,
    		southatlantic,
    		southpacific,
    		australia,
    		click,
    		send,
    		receive,
    		div0_binding,
    		div1_binding,
    		div2_binding,
    		div3_binding,
    		div4_binding,
    		div5_binding,
    		div6_binding,
    		div7_binding,
    		div8_binding,
    		div9_binding,
    		div10_binding,
    		div11_binding,
    		div12_binding,
    		div13_binding,
    		div14_binding,
    		div15_binding,
    		div16_binding
    	];
    }

    class Map$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { units: 0, choose: 1, places: 2 }, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*choose*/ ctx[1] === undefined && !("choose" in props)) {
    			console.warn("<Map> was created without expected prop 'choose'");
    		}
    	}

    	get units() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set units(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get choose() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set choose(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get places() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set places(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\cw\Tooltip.svelte generated by Svelte v3.29.0 */
    const file$4 = "src\\components\\cw\\Tooltip.svelte";
    const get_custom_tip_slot_changes = dirty => ({});
    const get_custom_tip_slot_context = ctx => ({});

    // (106:290) {:else}
    function create_else_block(ctx) {
    	let current;
    	const custom_tip_slot_template = /*#slots*/ ctx[13]["custom-tip"];
    	const custom_tip_slot = create_slot(custom_tip_slot_template, ctx, /*$$scope*/ ctx[12], get_custom_tip_slot_context);

    	const block = {
    		c: function create() {
    			if (custom_tip_slot) custom_tip_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (custom_tip_slot) {
    				custom_tip_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (custom_tip_slot) {
    				if (custom_tip_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(custom_tip_slot, custom_tip_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_custom_tip_slot_changes, get_custom_tip_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(custom_tip_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(custom_tip_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (custom_tip_slot) custom_tip_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(106:290) {:else}",
    		ctx
    	});

    	return block;
    }

    // (106:237) {#if tip}
    function create_if_block$2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*tip*/ ctx[0]);
    			attr_dev(div, "class", "default-tip svelte-kudgmo");
    			attr_dev(div, "style", /*style*/ ctx[7]);
    			add_location(div, file$4, 105, 246, 8876);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tip*/ 1) set_data_dev(t, /*tip*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(106:237) {#if tip}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let span;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	const if_block_creators = [create_if_block$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tip*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			div0 = element("div");
    			if_block.c();
    			attr_dev(span, "class", "tooltip-slot svelte-kudgmo");
    			add_location(span, file$4, 105, 110, 8740);
    			attr_dev(div0, "class", "tooltip svelte-kudgmo");
    			toggle_class(div0, "active", /*active*/ ctx[5]);
    			toggle_class(div0, "left", /*left*/ ctx[4]);
    			toggle_class(div0, "right", /*right*/ ctx[2]);
    			toggle_class(div0, "bottom", /*bottom*/ ctx[3]);
    			toggle_class(div0, "top", /*top*/ ctx[1]);
    			add_location(div0, file$4, 105, 157, 8787);
    			attr_dev(div1, "class", "tooltip-wrapper svelte-kudgmo");
    			add_location(div1, file$4, 105, 0, 8630);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			/*div1_binding*/ ctx[14](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "mouseover", /*hoverhandle*/ ctx[8], false, false, false),
    					listen_dev(div1, "mouseleave", /*leavehandle*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div0, null);
    			}

    			if (dirty & /*active*/ 32) {
    				toggle_class(div0, "active", /*active*/ ctx[5]);
    			}

    			if (dirty & /*left*/ 16) {
    				toggle_class(div0, "left", /*left*/ ctx[4]);
    			}

    			if (dirty & /*right*/ 4) {
    				toggle_class(div0, "right", /*right*/ ctx[2]);
    			}

    			if (dirty & /*bottom*/ 8) {
    				toggle_class(div0, "bottom", /*bottom*/ ctx[3]);
    			}

    			if (dirty & /*top*/ 2) {
    				toggle_class(div0, "top", /*top*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if_blocks[current_block_type_index].d();
    			/*div1_binding*/ ctx[14](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tooltip", slots, ['default','custom-tip']);

    	let { tip = "" } = $$props,
    		{ key } = $$props,
    		{ top = false } = $$props,
    		{ right = false } = $$props,
    		{ bottom = false } = $$props,
    		{ left = false } = $$props,
    		{ active = false } = $$props,
    		{ color = "#757575" } = $$props;

    	let descriptions = {
    		"Absorb": "(Pre-Battle): If a Shoggoth is present, Eliminate one or more of your Monsters or Cultists in the Battle. For each Unit so removed, add 3 dice to the Shoggoth's Combat for that Battle.",
    		"Devolve": "(Ongoing): After any player's Action, you may replace any number of your Acolyte Cultists on the Map with the same number of Deep Ones from your Pool.",
    		"Dreams": "(Action: Cost 2): Choose an Area containing an enemy's Acolyte Cultist. Your enemy must Eliminate one of his Acolyte Cultists from that Area and replace it with one from your Pool.",
    		"Regenerate": "(Post-Battle): Assign up to 2 Kill or Pain Battle results to the same Starspawn. If 2 Kills are applied, the Starpspawn is Killed. On any other combination of Kill or Pain results, the Starspawn is only Pained.",
    		"Submerge": "(Action: Cost 1): If Cthulhu is in an ocean or sea Area, remove him from the Map and place him on your Faction Card, along with any or all of your Units in the Area. Later, as a 0-cost Action, you may place Cthulhu, plus all accompanying Units, into any Area.",
    		"Y'hn Nthlei": "(Ongoing): During the Gather Power Phase, if Cthulhu is in play, gain 1 Power for each enemy-controlled Gate in an ocean or sea Area.",
    		"Immortal": "(Ongoing): Once Cthulhu has Awakened, he costs only 4 Power each subsequent time he is Awakened. Whenever you Awaken any Great Old One, gain 1 Elder Sign.",
    		"Devour": "(Pre-Battle): The enemy player chooses and Eliminates one of his Monsters or Cultists in the Battle.",
    		"Abduct": "(Pre-Battle): Eliminate one or more Nightgaunts from the Battle. For each one Eliminated, your enemy must Eliminate one of his own Monsters or Cultists from the Battle.",
    		"Emissary of the Outer Gods": "(Post-Battle): Unless an enemy Great Old One is involved in the Battle, a Kill applied to Nyarlathotep becomes a Pain. If Nyarlathotep cannot be Pained due to being surrounded, he is not Eliminated.",
    		"Invisibility": "(Pre-Battle): Select one Monster or Cultist (from either Faction) for each Flying Polyp present and 'exempt' it. The selected Unit does not participate in the rest of the Battle.",
    		"Madness": "(Ongoing): After all Pain results have been assigned, you, rather than the Units' owners, choose the Area(s) to which all Pained Units will go. You may apply these results in any order (rather than the normal 'attacker first, then defender'), but you must still follow all other rules. Do this even for Battles in which you did not participate.",
    		"Seek and Destroy": "(Pre-Battle): Immediately move any or all Hunting Horrors from any Area(s) into the Battle Area.",
    		"The Thousand Forms": "(Action: Cost 0): If Nyarlathotep is in play, roll a die. Your foes lose that much Power between them; they have 1 minute to decide how much each loses. If they cannot agree, you receive Power equal to the number rolled. Flip this spellbook over; it cannot be used again in this Action Phase. During the Gather Power Phase, flip it face-up again.",
    		"Flight": "(Ongoing): All of your Units can fly (even Cultists). When Moved, they can travel 2 Areas. They can fly over Areas containing enemy units.",
    		"The Habinger": "(Post-Battle): If Nyarlathotep is in a Battle in which one or more enemy Great Old Ones are Pained or Killed, you receive Power equal to half of the cost of Awakening those Great Old Ones. For each enemy Great Old One Pained or Killed, you may choose to receive 2 Elder Signs instead of Power.",
    		"He Who Must Not Be Named": "(Action: Cost 1): Move Hastur to any Area containing a Cultist of any Faction. You may then take a second, different Action. You may NOT take The Screaming Dead as your second Action.",
    		"Passion": "(Ongoing): When one or more of your Cultists are Eliminated by an enemy (Killed, Captured, etc.), gain 1 Power.",
    		"Shriek of the Byakhee": "(Action: Cost 1): Move any or all Byakhee from their current Area(s) to any one Area on the Map.",
    		"The Screaming Dead": "(Action: Cost 1): Move the King in Yellow to an adjacent Area. Any Undead in the same Area can move with him for free. You may then take a second, different Action. You may NOT take He Who is Not to be Named as your second Action.",
    		"The Third Eye": "(Ongoing): If Hastur is in play, the cost of Desecration is reduced by 1. If the Desecration succeeds, you also receive 1 Elder Sign.",
    		"Zin Gaya": "(Action: Cost 1): Choose an Area containing any of your Undead and at least one enemy Acolyte Cultist. Your enemy Eliminates one of his Acolyte Cultists from that Area. Place an Undead from your Pool into that Area.",
    		"Feast": "(Gather Power Phase): Gain +1 Power for each Area containing both a Desecration token and one or more of your Units.",
    		"Desecrate": "(Action: Cost 2): If the King is in an Area with no Desecration token, roll 1 die. If the roll is equal to or less than the number of your Units in the Area (including the King), place a Desecration token in the Area. Whether you succeed or fail, place a Monster or Cultist with a cost of 2 or less in the Area.",
    		"Vengence": "(Post-Battle): If Hastur is involved in a Battle, choose which Combat results are applied to which enemy Units (e.g., apply a Kill to a particular Great Old One).",
    		"Blood Sacrifice": "(Doom Phase): If Shub-Niggurath is in play during the Doom Phase, you can choose to eliminate one of your Cultists. If you do, gain 1 Elder Sign.",
    		"Frenzy": "(Ongoing): Your Cultists now have 1 Combat.",
    		"Ghroth": "(Action: Cost 2): Roll a die. If the result is less than or equal to the number of Areas containing Fungi, your enemies must Eliminate a number of Cultists equal to the die roll. They have 1 minute in which to decide how to distribute these Eliminations. If time runs out, you choose for them. If the die roll is greater than the number of Areas with Fungi, place any Faction's Acolyte anywhere on the map.",
    		"Necrophagy": "(Post-Battle): Move any or all Ghouls (who did not participate in the Battle) from any Area to the Battle Area, even if your Faction was not involved in the Battle. Each side involved in the Battle suffers an additional Pain result for each Ghoul moved in this way.",
    		"The Red Sign": "(Ongoing): Dark Young can Create and Control Gates. Each adds 1 to Shub-Niggurath's Combat and each provides 1 Power during the Gather Power Phase. They do not act as Cultists with respect to any other purpose.",
    		"The Thousand Young": "(Ongoing): If Shub-Niggurath is in play, Ghouls, Fungi, and Dark Young each cost 1 less Power to Summon.",
    		"Avatar": "(Action: Cost 1): Choose an Area and a Faction. Swap the location of Shub-Niggurath with that of a Monster or Cultist in the chosen Area. The owner of the chosen Faction chooses which Unit to relocate.",
    		"Fertility Cult": "(Ongoing): You may Summon Monsters as an Unlimited Action."
    	};

    	onMount(f => {
    		el = document.body.querySelector(".tooltip");
    	});

    	let el,
    		style = `background-color: ${color};`,
    		wrapper,
    		hoverhandle = () => {
    			el.classList.remove("hidden");
    			el.style.left = wrapper.getBoundingClientRect().x - el.offsetWidth + "px";
    			el.style.top = wrapper.getBoundingClientRect().y - el.offsetHeight + 10 + "px";
    			el.innerText = descriptions[key];
    		},
    		leavehandle = () => {
    			el.classList.add("hidden");
    		};

    	const writable_props = ["tip", "key", "top", "right", "bottom", "left", "active", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tooltip> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrapper = $$value;
    			$$invalidate(6, wrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("tip" in $$props) $$invalidate(0, tip = $$props.tip);
    		if ("key" in $$props) $$invalidate(10, key = $$props.key);
    		if ("top" in $$props) $$invalidate(1, top = $$props.top);
    		if ("right" in $$props) $$invalidate(2, right = $$props.right);
    		if ("bottom" in $$props) $$invalidate(3, bottom = $$props.bottom);
    		if ("left" in $$props) $$invalidate(4, left = $$props.left);
    		if ("active" in $$props) $$invalidate(5, active = $$props.active);
    		if ("color" in $$props) $$invalidate(11, color = $$props.color);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tip,
    		key,
    		top,
    		right,
    		bottom,
    		left,
    		active,
    		color,
    		descriptions,
    		el,
    		style,
    		wrapper,
    		hoverhandle,
    		leavehandle
    	});

    	$$self.$inject_state = $$props => {
    		if ("tip" in $$props) $$invalidate(0, tip = $$props.tip);
    		if ("key" in $$props) $$invalidate(10, key = $$props.key);
    		if ("top" in $$props) $$invalidate(1, top = $$props.top);
    		if ("right" in $$props) $$invalidate(2, right = $$props.right);
    		if ("bottom" in $$props) $$invalidate(3, bottom = $$props.bottom);
    		if ("left" in $$props) $$invalidate(4, left = $$props.left);
    		if ("active" in $$props) $$invalidate(5, active = $$props.active);
    		if ("color" in $$props) $$invalidate(11, color = $$props.color);
    		if ("descriptions" in $$props) descriptions = $$props.descriptions;
    		if ("el" in $$props) el = $$props.el;
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("wrapper" in $$props) $$invalidate(6, wrapper = $$props.wrapper);
    		if ("hoverhandle" in $$props) $$invalidate(8, hoverhandle = $$props.hoverhandle);
    		if ("leavehandle" in $$props) $$invalidate(9, leavehandle = $$props.leavehandle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tip,
    		top,
    		right,
    		bottom,
    		left,
    		active,
    		wrapper,
    		style,
    		hoverhandle,
    		leavehandle,
    		key,
    		color,
    		$$scope,
    		slots,
    		div1_binding
    	];
    }

    class Tooltip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			tip: 0,
    			key: 10,
    			top: 1,
    			right: 2,
    			bottom: 3,
    			left: 4,
    			active: 5,
    			color: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tooltip",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[10] === undefined && !("key" in props)) {
    			console.warn("<Tooltip> was created without expected prop 'key'");
    		}
    	}

    	get tip() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tip(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\cw\Description.svelte generated by Svelte v3.29.0 */

    const file$5 = "src\\components\\cw\\Description.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let t_value = (/*descriptions*/ ctx[1][/*tag*/ ctx[0]] || "") + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			set_style(div, "background", "black");
    			add_location(div, file$5, 15, 0, 1424);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tag*/ 1 && t_value !== (t_value = (/*descriptions*/ ctx[1][/*tag*/ ctx[0]] || "") + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Description", slots, []);
    	let { tag = "" } = $$props;

    	let descriptions = {
    		"Absorb": "(Pre-Battle): If a Shoggoth is present, Eliminate one or more of your Monsters or Cultists in the Battle. For each Unit so removed, add 3 dice to the Shoggoth's Combat for that Battle.",
    		"Devolve": "(Ongoing): After any player's Action, you may replace any number of your Acolyte Cultists on the Map with the same number of Deep Ones from your Pool.",
    		"Dreams": "(Action: Cost 2): Choose an Area containing an enemy's Acolyte Cultist. Your enemy must Eliminate one of his Acolyte Cultists from that Area and replace it with one from your Pool.",
    		"Regenerate": "(Post-Battle): Assign up to 2 Kill or Pain Battle results to the same Starspawn. If 2 Kills are applied, the Starpspawn is Killed. On any other combination of Kill or Pain results, the Starspawn is only Pained.",
    		"Submerge": "(Action: Cost 1): If Cthulhu is in an ocean or sea Area, remove him from the Map and place him on your Faction Card, along with any or all of your Units in the Area. Later, as a 0-cost Action, you may place Cthulhu, plus all accompanying Units, into any Area.",
    		"Y'ha Nthlei": "(Ongoing): During the Gather Power Phase, if Cthulhu is in play, gain 1 Power for each enemy-controlled Gate in an ocean or sea Area."
    	};

    	const writable_props = ["tag"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Description> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("tag" in $$props) $$invalidate(0, tag = $$props.tag);
    	};

    	$$self.$capture_state = () => ({ tag, descriptions });

    	$$self.$inject_state = $$props => {
    		if ("tag" in $$props) $$invalidate(0, tag = $$props.tag);
    		if ("descriptions" in $$props) $$invalidate(1, descriptions = $$props.descriptions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tag, descriptions];
    }

    class Description extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { tag: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Description",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get tag() {
    		throw new Error("<Description>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tag(value) {
    		throw new Error("<Description>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\cw\Player.svelte generated by Svelte v3.29.0 */
    const file$6 = "src\\components\\cw\\Player.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_4$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (85:165) {#each player.faction.bookreqs as book}
    function create_each_block_4$1(ctx) {
    	let li;
    	let t_value = /*book*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-1f8aljx");
    			add_location(li, file$6, 84, 204, 2071);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*player*/ 2 && t_value !== (t_value = /*book*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4$1.name,
    		type: "each",
    		source: "(85:165) {#each player.faction.bookreqs as book}",
    		ctx
    	});

    	return block;
    }

    // (85:226) {#each player.books as book}
    function create_each_block_3$1(ctx) {
    	let li;
    	let t_value = /*book*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "active svelte-1f8aljx");
    			add_location(li, file$6, 84, 254, 2121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*player*/ 2 && t_value !== (t_value = /*book*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(85:226) {#each player.books as book}",
    		ctx
    	});

    	return block;
    }

    // (85:310) {#each player.units.filter( u => u.place == '') as unit}
    function create_each_block_2$1(ctx) {
    	let unit;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[11],
    				choose: /*choose*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(unit.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(unit, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const unit_changes = {};
    			if (dirty & /*player*/ 2) unit_changes.unit = /*unit*/ ctx[11];
    			if (dirty & /*choose*/ 1) unit_changes.choose = /*choose*/ ctx[0];
    			unit.$set(unit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(unit, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(85:310) {#each player.units.filter( u => u.place == '') as unit}",
    		ctx
    	});

    	return block;
    }

    // (85:411) {#each G.units.filter( u => u.place == player.faction.name) as unit}
    function create_each_block_1$1(ctx) {
    	let unit;
    	let current;

    	unit = new Unit({
    			props: {
    				unit: /*unit*/ ctx[11],
    				choose: /*choose*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(unit.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(unit, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const unit_changes = {};
    			if (dirty & /*G, player*/ 6) unit_changes.unit = /*unit*/ ctx[11];
    			if (dirty & /*choose*/ 1) unit_changes.choose = /*choose*/ ctx[0];
    			unit.$set(unit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(unit, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(85:411) {#each G.units.filter( u => u.place == player.faction.name) as unit}",
    		ctx
    	});

    	return block;
    }

    // (85:566) <Tooltip key="{book}" left>
    function create_default_slot(ctx) {
    	let div;
    	let t_value = /*book*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "book svelte-1f8aljx");
    			add_location(div, file$6, 84, 593, 2460);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*player*/ 2 && t_value !== (t_value = /*book*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(85:566) <Tooltip key=\\\"{book}\\\" left>",
    		ctx
    	});

    	return block;
    }

    // (85:530) {#each player.faction.books as book}
    function create_each_block$1(ctx) {
    	let tooltip;
    	let current;

    	tooltip = new Tooltip({
    			props: {
    				key: /*book*/ ctx[8],
    				left: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tooltip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tooltip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tooltip_changes = {};
    			if (dirty & /*player*/ 2) tooltip_changes.key = /*book*/ ctx[8];

    			if (dirty & /*$$scope, player*/ 1048578) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tooltip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(85:530) {#each player.faction.books as book}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let t0_value = /*player*/ ctx[1].faction.name + "";
    	let t0;
    	let t1;
    	let t2_value = /*player*/ ctx[1].doom + "";
    	let t2;
    	let t3;
    	let t4_value = /*player*/ ctx[1].power + "";
    	let t4;
    	let t5;
    	let t6_value = /*player*/ ctx[1].books.length + "";
    	let t6;
    	let ul;
    	let each0_anchor;
    	let div0;
    	let each2_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*player*/ ctx[1].faction.bookreqs;
    	validate_each_argument(each_value_4);
    	let each_blocks_4 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_4[i] = create_each_block_4$1(get_each_context_4$1(ctx, each_value_4, i));
    	}

    	let each_value_3 = /*player*/ ctx[1].books;
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*player*/ ctx[1].units.filter(func$1);
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = /*G*/ ctx[2].units.filter(/*func_1*/ ctx[5]);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*player*/ ctx[1].faction.books;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			t0 = text(t0_value);
    			t1 = text(" | dm ");
    			t2 = text(t2_value);
    			t3 = text(" | pw ");
    			t4 = text(t4_value);
    			t5 = text(" | sb ");
    			t6 = text(t6_value);
    			ul = element("ul");

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			each0_anchor = empty();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			each2_anchor = empty();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "units svelte-1f8aljx");
    			add_location(div0, file$6, 84, 291, 2158);
    			attr_dev(ul, "class", "details svelte-1f8aljx");
    			add_location(ul, file$6, 84, 144, 2011);
    			attr_dev(div1, "class", "player2 svelte-1f8aljx");
    			add_location(div1, file$6, 84, 0, 1867);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(ul, null);
    			}

    			append_dev(ul, each0_anchor);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(ul, null);
    			}

    			append_dev(ul, div0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div0, each2_anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			/*div1_binding*/ ctx[6](div1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*player*/ 2) && t0_value !== (t0_value = /*player*/ ctx[1].faction.name + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*player*/ 2) && t2_value !== (t2_value = /*player*/ ctx[1].doom + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*player*/ 2) && t4_value !== (t4_value = /*player*/ ctx[1].power + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*player*/ 2) && t6_value !== (t6_value = /*player*/ ctx[1].books.length + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*player*/ 2) {
    				each_value_4 = /*player*/ ctx[1].faction.bookreqs;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4$1(ctx, each_value_4, i);

    					if (each_blocks_4[i]) {
    						each_blocks_4[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_4[i] = create_each_block_4$1(child_ctx);
    						each_blocks_4[i].c();
    						each_blocks_4[i].m(ul, each0_anchor);
    					}
    				}

    				for (; i < each_blocks_4.length; i += 1) {
    					each_blocks_4[i].d(1);
    				}

    				each_blocks_4.length = each_value_4.length;
    			}

    			if (dirty & /*player*/ 2) {
    				each_value_3 = /*player*/ ctx[1].books;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_3$1(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(ul, div0);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_3.length;
    			}

    			if (dirty & /*player, choose*/ 3) {
    				each_value_2 = /*player*/ ctx[1].units.filter(func$1);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(div0, each2_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*G, player, choose*/ 7) {
    				each_value_1 = /*G*/ ctx[2].units.filter(/*func_1*/ ctx[5]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*player*/ 2) {
    				each_value = /*player*/ ctx[1].faction.books;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_4, detaching);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			/*div1_binding*/ ctx[6](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$1 = u => u.place == "";

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Player", slots, []);
    	let { choose } = $$props, { player } = $$props, { G } = $$props;
    	let dispatch = createEventDispatcher();
    	let el;

    	onMount(x => {
    		$$invalidate(3, el.style.color = player.faction.color, el); //'linear-gradient(70deg,#363636,'+player.faction.color+')'
    	});

    	let click = e => {
    		e.stopPropagation();
    		choose("player", player);
    	};

    	const writable_props = ["choose", "player", "G"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Player> was created with unknown prop '${key}'`);
    	});

    	const func_1 = u => u.place == player.faction.name;

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(3, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("choose" in $$props) $$invalidate(0, choose = $$props.choose);
    		if ("player" in $$props) $$invalidate(1, player = $$props.player);
    		if ("G" in $$props) $$invalidate(2, G = $$props.G);
    	};

    	$$self.$capture_state = () => ({
    		choose,
    		player,
    		G,
    		Unit,
    		Tooltip,
    		Description,
    		createEventDispatcher,
    		dispatch,
    		onMount,
    		el,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("choose" in $$props) $$invalidate(0, choose = $$props.choose);
    		if ("player" in $$props) $$invalidate(1, player = $$props.player);
    		if ("G" in $$props) $$invalidate(2, G = $$props.G);
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("el" in $$props) $$invalidate(3, el = $$props.el);
    		if ("click" in $$props) $$invalidate(4, click = $$props.click);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [choose, player, G, el, click, func_1, div1_binding];
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { choose: 0, player: 1, G: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*choose*/ ctx[0] === undefined && !("choose" in props)) {
    			console.warn("<Player> was created without expected prop 'choose'");
    		}

    		if (/*player*/ ctx[1] === undefined && !("player" in props)) {
    			console.warn("<Player> was created without expected prop 'player'");
    		}

    		if (/*G*/ ctx[2] === undefined && !("G" in props)) {
    			console.warn("<Player> was created without expected prop 'G'");
    		}
    	}

    	get choose() {
    		throw new Error("<Player>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set choose(value) {
    		throw new Error("<Player>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get player() {
    		throw new Error("<Player>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set player(value) {
    		throw new Error("<Player>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get G() {
    		throw new Error("<Player>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set G(value) {
    		throw new Error("<Player>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const place = (name='',adjacent=[],ocean=false,glyphs=[],gate=0) => ({glyphs,name,adjacent,ocean,gate,renderGate:f=>{}});
    const 
        arcticocean = place('arcticocean',['northamerica','northatlantic','northpacific','scandinavia','northasia'],true),
        northpacific = place('northpacific',['arcticocean','northamerica','southamerica','indianocean','southpacific','northasia','southasia']),
        northamerica = place('northamerica',['southamerica','northatlantic','accrticocean','northpacific'],false,['\\o/']),
        northatlantic = place('northatlantic',['southamerica','northamerica','southatlantic','northpacific','arcticocean','europe','westafrica','arabia','scandinavia'],true),
        scandinavia = place('scandinavia',['arcticocean','northatlantic','europe','northasia'],false,['\\|/']),
        europe = place('europe',['northatlantic','arabia','northasia','scandinavia'],false,['\\|/']),
        northasia = place('northasia',['arcticocean','scandinavia','europe','arabia','southasia','northpacific'],false,['\\|/']),
        arabia = place('arabia',['eastafrica','westafrica','europe','southasia','indianocean','northasia','northatlantic'],false,['\\|/']),
        southasia = place('southasia',['arabia','northasia','northpacific','indianocean'],false,['\\|/']),
        southamerica = place('southamerica',['northpacific','southpacific','northatlantic','southatlantic','northamerica'],false,['\\o/']),
        westafrica = place('westafrica',['eastafrica','southatlantic','northatlantic','arabia','indianocean'],false,['\\-/']),
        indianocean = place('indianocean',['northpacific','southasia','arabia','eastafrica','westafrica','antarctica','southatlantic','southpacific'],true),
        southpacific = place('southpacific',['australia','indianocean','northpacific','antarctica','southamerica','southatlantic'],true),
        southatlantic = place('southatlantic',['southpacific','southamerica','northatlantic','antarctica','eastafrica','westafrica'],true),
        eastafrica = place('eastafrica',['southatlantic','westafrica','arabia','indianocean'],false,['\\-/']),
        australia = place('australia',['indianocean','southpacific'],false,['\\-/']),
        antarctica = place('antarctica',['indianocean','southatlantic','southpacific']);
        const places = {arcticocean, northpacific, northamerica, northatlantic, scandinavia, europe, northasia, southamerica, southasia, arabia, westafrica, indianocean, eastafrica, antarctica, southatlantic, southpacific, australia};

    let G, phs, H$1;
    let faction = (g,p,h) => {
        G = g;
        phs = p;
        H$1 = h;
        let books = ["Blood Sacrifice","Frenzy","Ghroth","Necrophagy","The Red Sign","The Thousand Young"];
        let bookinit = ["Blood Sacrifice","Frenzy","Ghroth","Necrophagy","The Red Sign","The Thousand Young"];
        // {
        //     "Blood Sacrifice":blood,
        //     "Frenzy":frenzy,
        //     "Ghroth":ghroth,
        //     "Necrophagy":necrophagy,
        //     "The Red Sign":redsign,
        //     "The Thousand Young":thousand
        // }
        H$1["Blood Sacrifice"]=blood;
        H$1["Frenzy"]=frenzy;
        H$1["Ghroth"]=ghroth;
        H$1["Necrophagy"]=necrophagy;
        H$1["The Red Sign"]=redsign;
        H$1["The Thousand Young"]=thousand;
        let bookreqs = [
            'sac 2 cults',
            'be in 4 areas',
            'be in 6 areas',
            'be in 8 areas',
            "Awaken Shub Nigur'rath",
            'be in all enemy areas'
            // {'sac 2 cults':f=>false },
            // {'be in 4 areas':f=> Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).length > 3 },
            // {'be in 6 areas':f=> Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).length > 5 },
            // {'be in 8 areas':f=> Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).length > 7 },
            // {"Awaken Shub Nigur'rath":f=> G.state.choices.awaken.unit?.type=="Shub Nigur'rath"},
            // {'be in all enemy areas':f=> G.state.players.filter( pl => pl.units.filter( un => Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).includes(un.place) ).length).length == G.state.players.length  }
        ];
        H$1['sac 2 cults']=f=>false;
        H$1['be in 4 areas']=f=> Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).length > 3; 
        H$1['be in 6 areas']=f=> Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).length > 5; 
        H$1['be in 8 areas']=f=> Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).length > 7; 
        H$1["Awaken Shub Nigur'rath"]=f=> G.state.choices.awaken.unit?.type=="Shub Nigur'rath";
        H$1['be in all enemy areas']=f=> G.state.players.filter( pl => pl.units.filter( un => Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).includes(un.place) ).length).length == G.state.players.length;

        let color = 'red';
        let start = 'westafrica';
        let name = 'bg';
        let units = [];
        let awakenshub = {
            awakenplaces: () => G.player.units.filter( u => u.gate ).map( u => u.place ),
            awakenreq: ()=>G.player.power > 7 && G.player.units.filter( u => u.place != '' && u.type == 'cult').length > 1 && G.player.units.filter( u => u.gate ).length,
            cost: ()=>{ G.player.power-=8; G.player.sac = 2; phs.setStage('bg-sacunit');},
        };
        H$1["Shub Nigur'rath"]=awakenshub;
        let initUnits = p => {
            p.units = [
                ...p.units,
                {...H$1.unit("Shub Nigur'rath",name,'',8,()=>p.units.filter( u => u.type == 'cult').length,2),...awakenshub},
                ...[0,1,].map( f=> H$1.unit('Ghoul',name,'',1,0,1)),
                ...[0,1,2,3].map( f=> H$1.unit('Fungi',name,'',2,1,1)),
                ...[0,1,2].map( f=> H$1.unit('Dark Young',name,'',3,2,1,1)),
            ];
        };
        
        fertility();
        bgsac();
        sac2cult();
        avatar();
        return {books,bookreqs,bookinit,color,start,name,units,initUnits}
    };

    let lim = 1, init$1 = f => {};
    let sac2cult = () => phs.addPhase('sac 2 cultists',{
        lim,
        req : f => G.player.faction.name=='bg' && G.player.faction.bookreqs.includes('sac 2 cults'),
        start : 'unit',
        stages: {               
            unit : {
                init : f => G.player.sacs = 2,
                options : f => G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'unit' || np == 'sac 2 cultists' ) && G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ).includes(c)) {
                            G.player.sacs--;
                            c.place = '';
                            c.gate = 0;
                            if (G.player.sacs == 0) {
                                H$1['sac 2 cults'] = f => true;
                                phs.endPhase();
                            }
                            else H$1.forceRerender();
                        }
                    }
                }
            }
        }
    });
    let bgsac = () => phs.addStage('bg-sacunit',{
        init : f => G.player.sacs = 2,
        options : f => G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ),
        moves : {
            choose : (np, c) => {
                if ( (np == 'unit' || np == 'bg-sacunit') && G.player.units.filter( u => u.type == 'cult' ).includes(c) ) {
                    G.player.sacs--;
                    c.place = '';
                    c.gate = 0;
                    H$1.forceRerender();
                    if (G.player.sacs == 0) phs.endStage();
                }
            }
        }
    },'awaken');

    let avatar = () => {
        G.state.choices.avatar = {place:null,faction:null,unit:null};
        phs.addPhase('avatar',{
            lim,
            init: init$1,
            req : f => G.player.faction.name=='bg' && G.player.units.find( u => u.type == "Shub Nigur'rath" && u.place != '' ) && G.player.power >= 1,
            start : 'place',
            stages: {               
                place : {
                    next : 'faction',
                    options : f => Object.keys(G.state.places).filter( p => G.units.map( u => u.place ).includes(p) ),
                    moves : {
                        choose : (np, c) => {
                            if ( np == 'place' && G.units.map( u => u.place ).includes(c)) {
                                G.state.choices.avatar.place = c;
                                phs.endStage();
                            }
                        }
                    }
                },
                faction : {
                    next : 'unit',
                    options : f => G.state.players.filter( p => p.units.map( u => u.place).includes( G.state.choices.avatar.place ) ).map( p => p.faction.name ),
                    moves : {
                        choose : (np, c) => {
                            if  ( np == 'faction' && G.state.players.filter( p => p.units.map( u => u.place).includes( G.state.choices.avatar.place ) ).map( p => p.faction.name ).includes(c) ){
                                G.state.choices.avatar.faction = G.state.players.find( p => p.faction.name == c);
                                G.state.stage = 'resolve';
                                phs.interuptStage('avatar','unit',G.state.players.indexOf(G.state.choices.avatar.faction));
                            }
                            else if ( np == 'player' && G.state.players.filter( p => p.units.map( u => u.place).includes( G.state.choices.avatar.place ) ).includes(c) ) {
                                G.state.choices.avatar.faction = c;
                                G.state.stage = 'resolve';
                                phs.interuptStage('avatar','unit',G.state.players.indexOf(G.state.choices.avatar.faction));
                            }
                        }
                    }
                },
                unit : {
                    next : 'resolve',
                    options : f => G.state.choices.avatar.faction.units.filter( u => u.place == G.state.choices.avatar.place ),
                    moves : {
                        choose : (np, c) => {
                            if  ( np == 'unit' && G.state.choices.avatar.faction.units.filter( u => u.place == G.state.choices.avatar.place ).includes(c) ){
                                G.state.choices.avatar.unit = c;
                                phs.endStage();
                            }
                        }
                    }
                },
                resolve : {
                    init : f => {
                        G.state.choices.avatar.unit.place = G.state.choices.avatar.place;
                        G.state.turn.pi = G.state.players.indexOf(G.state.players.find(p => p.faction.name == 'bg'));
                        G.state.players[G.state.turn.pi].power--;
                        G.state.players[G.state.turn.pi].units.find( u => u.name == "Shub Nigur'rath").place = G.state.choices.avatar.place;
                        phs.endStage();
                    },
                    moves : {},
                    options : f => [],
                }

            }
        });
    };

    let necrophagy = () => {
        G.state.choices.necro = { once : null };
        phs.addStage('necrounits',{
            options : f => G.player.units.filter( u => u.type == 'Ghoul' && u.place != '' && !u.moved),
            init : f => {
                if ( G.state.choices.necro.once) {G.state.choices.necro.once = null; phs.endStage();}
                else {
                    G.state.stage = 'assignpretreats';
                    phs.interuptStage('fight','necrounits',G.state.players.indexOf(G.state.players.find( p => p.faction.name == 'bg' )));
                }
            },
            moves : {
                choose : (np,c) => {
                    if ( c.type == 'Ghoul' && c.place != '' && !c.moved) {
                        G.state.choices.fight.enemy.pains++;
                        G.state.choices.fight.player.pains++;
                        c.moved = 1;
                        c.place = G.state.choices.fight.place;
                        H$1.forceRerender();
                    }
                },
                done : f => {        
                    G.state.choices.necro.once = 1;
                    G.player.units.map( u => u.moved = 0);
                    phs.returnStage();
                },
            }
        },'fight','placeeretreats');
    };

    let ghroth = () => {
        G.state.choices.ghroth = { roll : 0, offers : [], tries : 3, negotiated : 0 };
        phs.addPhase('ghroth',{
            lim,
            init : f => {
                G.state.choices.ghroth.roll = roll(G.state.places.filter( p => G.player.units.filter( u => u.type == 'Fungi' ).map( u => u.place).includes(p) ).length );
                G.state.choices.ghroth.offers = Array(G.state.players.length).fill(0);
                G.state.turn.pi++;
            },
            req : f => G.player.faction.name == 'bg' && G.player.power > 1,
            start : 'negotiate',
            stages: {               
                negotiate : {
                    next : 'unit',
                    options : f => Array(G.state.choices.ghroth.roll+1).fill(0).map( (l,i) => i).filter( l => l < G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ).length ),
                    moves : {
                        choose : (np, c) => {
                            if ( np == 'negotiate' && Array(G.state.choices.ghroth.roll+1).fill(0).map( (l,i) => i).filter( l => l <= G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ).length ).includes(c) ) {
                                G.state.choices.ghroth.offers[G.state.turn.pi%G.state.players.length] = c;
                                G.state.turn.pi++;
                                if ( G.state.players[G.state.turn.pi].faction.name=='bg') {
                                    tries--;
                                    G.state.choices.ghroth.negotiated = (G.state.choices.ghroth.offers.reduce((acc,cur)=>acc+cur,0) >= G.state.choices.ghroth.roll );
                                }
                                if ( G.state.choices.ghroth.tries || G.state.choices.ghroth.negotiated) G.state.turn.pi++;
                                if (!G.state.choices.ghroth.tries || G.state.choices.ghroth.negotiated) setStage( (G.state.choices.ghroth.negotiated) ? 'unit' : 'altunit');
                                H$1.forceRerender();
                            }
                            
                        },
                    }
                },             
                unit : {
                    next : '',
                    options : f => G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ),
                    moves : {
                        choose : (np, c) => {
                            if ( np == 'unit' && G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ).includes(c)) {
                                c.place = '';
                                G.state.choices.ghroth.offers[G.state.turn.pi%G.state.players.length]--;
                                if(!G.state.choices.ghroth.offers[G.state.turn.pi%G.state.players.length]) G.state.turn.pi++;
                                H$1.forceRerender();
                                if(!G.state.choices.ghroth.offers.reduce((acc,cur)=>acc+cur,0)) phs.endStage();
                            }
                        },
                    }
                },             
                altunit : {
                    init : f => G.state.choices.ghroth.offers = G.state.choices.ghroth.offers.reduce((acc,cur)=>acc+cur,0),
                    next : '',
                    options : f => G.units.filter( u=> u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ),
                    moves : {
                        choose : (np, c) => {
                            if ( np == 'unit' && G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ).includes(c)) {
                                c.place = '';
                                G.state.choices.ghroth.offers--;
                                H$1.forceRerender();
                                if(!G.state.choices.ghroth.offers) phs.endStage();
                            }
                        },
                    }
                }
            }
        });
    };

    let blood = () => {
        phs.addStage('bloodinit',{
            init : f => phs.interuptStage( 'doom','blood',G.state.players.indexOf( G.state.players.find( p => p.faction.name=='bg') ) ),
            options : f => [],
            moves : { choose : (np,c) => {} }
        },'doom','doom');
        
        phs.addStage('blood',{
            next : 'bloodunit',
            options : f => ['blood sacrifice'],
            moves : { 
                choose : (np,c) => {
                    if ( c == 'blood sacrifice') phs.endStage();
                },
                done : f => phs.returnStage()
            }
        },'doom');
        
        phs.addStage('bloodunit',{
            options : f => G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ),
            moves : { 
                choose : (np,c) => {
                    if ( (np == 'unit' || np == 'bloodunit') && G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ) ) {
                        c.place = '';
                        G.player.signs++;
                        phs.returnStage();
                    }
                }
            }
        },'doom');
    };

    let fertility = () => phs.addStage('fertility',{
        init : f => {G.state.turn.lim+=G.player.faction.name=='bg';phs.endStage();},
        options : f => [],
        moves : { choose : (np,c) => {}}
    },'summon','place');

    let frenzy = () => G.player.units.filter( u => u.type == 'cult' ).map( u => u.combat = 1 );

    let thousand = () => G.player.units.filter( u => u.tier == 1 ).map( u => {let cost = 0+u.cost; u.cost = f => cost - G.units.find( un => un.type == "Shub Nigur'rath").place != ''; });

    let redsign = () => G.player.units.filter( u => u.type == 'Dark Young' ).map( u => u.gatherer = 1 );

    let G$1, phs$1, H$2;
    let faction$1 = (g,p,h) => {
        G$1 = g;
        phs$1 = p;
        H$2 = h;
        let books = ["Abduct","Emissary of the Outer Gods","Invisibility","Madness","Seek and Destroy","The Thousand Forms"];
        let bookinit = ["Abduct","Emissary of the Outer Gods","Invisibility","Madness","Seek and Destroy","The Thousand Forms"];
        // {
        //     "Abduct":abduct,
        //     "Emissary of the Outer Gods":emissary,
        //     "Invisibility":invisibility,
        //     "Madness":madness,
        //     "Seek and Destroy":seekanddestroy,
        //     "The Thousand Forms":thousandforms
        // }
        
        H$2["Abduct"]=abduct;
        H$2["Emissary of the Outer Gods"]=emissary;
        H$2["Invisibility"]=invisibility;
        H$2["Madness"]=madness;
        H$2["Seek and Destroy"]=seekanddestroy;
        H$2["The Thousand Forms"]=thousandforms;
        let bookreqs = [
            'pay 4 power',
            'pay 6 power',
            '3 gates / 12 power',
            '4 gates / 16 power',
            'capture',
            "Awaken Nyarlathotap",
            // {'pay 4 power':f=>false },
            // {'pay 6 power':f=>false },
            // {'3 gates / 12 power':f=> G.player.units.filter( u => u.gate ).length > 2 || G.player.power > 11 },
            // {'4 gates / 16 power':f=> G.player.units.filter( u => u.gate ).length > 3 || G.player.power > 15 },
            // {'capture':f=> units.filter( u => u.place == G.player.faction).length },
            // {"Awaken Nyarlathotap":f=> G.state.choices.awaken.unit?.type=='Nyarlathotap'},
        ];
        H$2['pay 4 power']=f=>false; 
        H$2['pay 6 power']=f=>false; 
        H$2['3 gates / 12 power']=f=> G$1.player.units.filter( u => u.gate ).length > 2 || G$1.player.power > 11; 
        H$2['4 gates / 16 power']=f=> G$1.player.units.filter( u => u.gate ).length > 3 || G$1.player.power > 15; 
        H$2['capture']=f=> units.filter( u => u.place == G$1.player.faction).length; 
        H$2["Awaken Nyarlathotap"]=f=> G$1.state.choices.awaken.unit?.type=='Nyarlathotap';
        let color = 'blue';
        let start = 'southasia';
        let name = 'cc';
        let units = [];
        
        let awakennarl = {
            awakenplaces: () => G$1.player.units.filter( u => u.gate ).map( u => u.place ),
            awakenreq: () => G$1.player.power > 9 && G$1.player.units.filter( u => u.gate ).length,
            cost: () => { G$1.player.power-=10; phs$1.endStage(); },
        };
        H$2['Nyarlathotap']=awakennarl;
        let initUnits = p => {
            p.units = [
                ...p.units,
                {...H$2.unit("Nyarlathotap",name,'',10,()=>p.books.length + G$1.state.choices.fight.enemy.books.length,2),...awakennarl},
                ...[0,1,3].map( f=> H$2.unit('Nightgaunt',name,'',1,0,1)),
                ...[0,1,2].map( f=> H$2.unit('Flying Polyp',name,'',2,1,1)),
                ...[0,1].map( f=> H$2.unit('Hunting Horror',name,'',3,2,1)),
            ];
            flight();
        };
        let faction = {bookinit,books,bookreqs,color,start,name,units,initUnits};
        pay4();
        pay6();
        pay10();
        harbinger();
        return faction
    };
    let hasBookReq = ( b ) => G$1.player.faction.bookreqs.includes( o );
    let pay4 = () => phs$1.addPhase('pay 4 power',{
        req : f => G$1.player.faction.name == 'cc' && G$1.player.power > 3 && hasBookReq(),
        init : f => {G$1.player.power -= 4; H$2['pay 4 power'] = F=>true; endStage(); }
    });
    let pay6 = () => phs$1.addPhase('pay 6 power',{
        req : f => G$1.player.faction.name == 'cc' && G$1.player.power > 5 && hasBookReq(),
        init : f => {G$1.player.power -= 6; H$2['pay 6 power'] = F=>true; endStage(); }
    });
    let pay10 = () => phs$1.addPhase('pay 10 power',{
        req : f => G$1.player.faction.name == 'cc' && G$1.player.power > 9 && hasBookReq() && hasBookReq(),
        init : f => {G$1.player.power -= 10; H$2['pay 4 power'] = F=>true;H$2['pay 6 power'] = F=>true; endStage(); }
    });
    let harbinged = [];
    let involved = false;
    let harbinger = () => {
        phs$1.addStage('harb0',{
            init : f => {
                involved = [G$1.state.choices.fight.player,G$1.state.choices.fight.enemy].find( p => p.faction.name == 'cc')?.units.find( u => u.type == 'Nyarlathotap').place == G$1.state.choices.fight.place;
                if(involved && G$1.state.choices.fight.unit.tier >= 2) harbinged.push(G$1.state.choices.fight.unit);phs$1.endStage();},
        },'fight','assignpkills');
        phs$1.addStage('harb1',{
            init : f => {if(involved && G$1.state.choices.fight.unit.tier >= 2) harbinged.push(G$1.state.choices.fight.unit);phs$1.endStage();},
        },'fight','assignpretreats');
        phs$1.addStage('harb2',{
            init : f => {if(involved && G$1.state.choices.fight.unit.tier >= 2) harbinged.push(G$1.state.choices.fight.unit);phs$1.endStage();},
        },'fight','assigneretreats');
        phs$1.addStage('harb3',{
            init : f => {if(involved && G$1.state.choices.fight.unit.tier >= 2) harbinged.push(G$1.state.choices.fight.unit);phs$1.endStage();},
        },'fight','assignekills');
        phs$1.addStage('harbresolve',{
            init : f => {if(involved && harbinged.length) phs$1.interuptStage('fight','harbresolve',G$1.state.players.indexOf(G$1.state.players.find( p => p.faction.name == 'cc'))); },
            options : f => harbinged.map( h => ['+2 signs '+h.type,h.cost/2+' power  '+h.type]),
            moves : {
                choose : (np,c) => {
                    if ( !harbinged.map( h => ['+2 signs',h.cost/2+' power']).includes(c)) return
                    if ( c.includes('+2 signs')) G$1.player.signs++;
                    if ( c.includes( ' power ')) G$1.player.power += Number(c.split('')[0]);
                    harbinged = harbinged.filter( u => u.type != c.split('').slice(8).join('') );
                    if (!harbinged.length) { phs$1.returnStage(); if (G$1.state.stage == 'harbresolve') phs$1.endStage(); }
                }
            }
        },'fight','placeeretreats');
    };
    let seekanddestroy = () => phs$1.addStage('seek and destroy',{
        init : f => {
            involved = [G$1.state.choices.fight.player,G$1.state.choices.fight.enemy].find( p => p.faction.name == 'cc')?.units.find( u => u.type == 'Nyarlathotap').place == G$1.state.choices.fight.place;
            if (!G$1.player.units.filter( u => u.type == 'Hunting Horror' && G$1.state.places[u.place] ).length ) {phs$1.endStage();return;}
            phs$1.interuptStage('fight','seek and destroy',G$1.state.players.indexOf(G$1.state.players.find( p => p.faction.name == 'cc' ) ) );
        },
        options : f => G$1.player.units.filter( u => u.type == 'Hunting Horror' && G$1.state.places[u.place] ),
        moves : {
            choose : (np,c) => {
                if ( np != 'unit' || np != 'seek and destroy' || !G$1.player.units.filter( u => u.type == 'Hunting Horror' && G$1.state.places[u.place] ).includes(c)) return
                c.place = G$1.state.choices.fight.place;
                if (!G$1.player.units.filter( u => u.type == 'Hunting Horror' && G$1.state.places[u.place] ).length) {
                    phs$1.returnStage();
                    phs$1.endStage();
                }
            },
            done : f => {phs$1.returnStage();phs$1.endStage();}
        }

    },'fight','enemy');

    let madness = () => {
        let madphase = {
            init : f => {
                phs$1.interuptStage('fight','placeeretreats',G$1.state.players.indexOf(G$1.state.players.find( p => p.faction.name == 'cc' ) ));
            },
            options : f => G$1.state.places[G$1.state.choices.fight.unit.place].adjacent.filter( p => !G$1.state.choices.fight.enemy.units.map( u => u.place ).includes(p)),
            moves : {
                choose : (np, c) => {
                    if ( G$1.state.places[G$1.state.choices.fight.unit.place].adjacent.filter( p => !G$1.state.choices.fight.enemy.units.map( u => u.place ).includes(p)).includes( c ) ) {
                        G$1.state.choices.fight.unit.place = c;
                        G$1.state.choices.fight.temp.phase.pains--;
                        H$2.forceRerender();
                    }
                    if ( !G$1.state.choices.fight.player.temp.phase.pains || !G$1.state.choices.fight.player.units.filter( u => u.place == G$1.state.choices.fight.place ).length )  {
                        phs$1.returnStage();
                        phs$1.endStage();
                    } else {
                        phs$1.returnStage();
                        phs$1.setStage('assignpretreats');
                    }
                }
            }
        };
        G$1.phases.fight.stages.placepretreats = {...madphase,next:'assignekills'};
        G$1.phases.fight.stages.placeeretreats = {
            init : f => {
                phs$1.interuptStage('fight','placeeretreats',G$1.state.players.indexOf(G$1.state.players.find( p => p.faction.name == 'cc' ) ));
            },
            options : f => G$1.state.places[choices.fight.unit.place].adjacent.filter( p => !G$1.state.choices.fight.player.units.map( u => u.place ).includes(p)),
            moves : {
                choose : (np, c) => {
                    if ( G$1.state.places[choices.fight.unit.place].adjacent.filter( p => !G$1.state.choices.fight.player.units.map( u => u.place ).includes(p)).includes( c ) ) {
                        G$1.state.choices.fight.unit.place = c;
                        G$1.state.choices.fight.enemy.temp.phase.pains--;
                        H$2.forceRerender();
                    }
                    if ( !G$1.state.choices.fight.enemy.pains || !G$1.state.choices.fight.enemy.units.filter( u => u.place == G$1.state.choices.fight.place ).length ) {
                        phs$1.returnStage(); phs$1.endStage();
                        G$1.state.choices.fight.place = null;
                        G$1.state.choices.fight.enemy = null;
                        G$1.state.choices.fight.unit = null;
                    } else {
                        phs$1.returnStage();
                        phs$1.setStage('assignpretreats');
                    }
                }
            }
        };
    };
    let emissary = () => phs$1.addStage('emissary',{
        init : f => {
            G$1.state.players.find( p => p.faction.name == 'cc' ).units.find( u => u.type == 'Nyarlathtap' ).invulnerable = (
                !G$1.state.choices.fight.enemy.units.find( u => H$2.findPlyr(u.owner).faction.name != 'cc' && u.tier == 2 && u.place == G$1.state.choices.fight.place) ||
                !G$1.state.choices.fight.player.units.find( u => H$2.findPlyr(u.owner).faction.name != 'cc' && u.tier == 2 && u.place == G$1.state.choices.fight.place)
            );
            phs$1.endStage();
        },
    },'fight','roll');
    let invis = 0;
    let invisibility = () => {
        phs$1.addStage('invisunit',{
            init : f => {
                if ( G$1.state.choices.fight.player.faction.name != 'cc' && G$1.state.choices.fight.enemy.faction.name != 'cc' ) {phs$1.endStage(); return}
                phs$1.interuptStage('fight','invisunit',G$1.state.players.indexOf(G$1.state.players.find( p => p.faction.name == 'cc' ) ));
                invis = G$1.units.filter( u => u.type == 'Flying Polyp' && u.place == G$1.state.choices.fight.place );
            },
            options : f => [...G$1.state.choices.fight.player.units,...G$1.state.choices.fight.enemy.units,].filter( u => u.place == G$1.state.choices.fight.place ),
            moves : {
                choose : (np,c) => {
                    if (np != 'unit' || np != 'invisunit' || ![...G$1.state.choices.fight.player.units,...G$1.state.choices.fight.enemy.units,].filter( u => u.place == G$1.state.choices.fight.place ).includes(c) ) return
                    c.place = 'invisible';
                    invis--;
                    H$2.forceRerender();
                    if (!invis) {phs$1.returnStage();phs$1.endStage();}
                },
                done : f => {phs$1.returnStage();phs$1.endStage();},
            }
        },'fight','roll');
        phs$1.addStage('invisreturn',{
            init : f => {
                G$1.units.filter( u.place == 'invisible' ).map( u => u.place = G$1.state.choices.fight.place );
                endStage();
            }
        },'fight','placeeretreats');
    };
    let abductions = 0;
    let abduct = () => {
        phs$1.addStage('abductunit',{
            init : f => {
                if ( G$1.state.choices.fight.player.faction.name != 'cc' && G$1.state.choices.fight.enemy.faction.name != 'cc' ) {phs$1.endStage(); return}
                phs$1.interuptStage('fight','abductunit',G$1.state.players.indexOf(G$1.state.players.find( p => p.faction.name == 'cc' ) ));
                abductions = 0;
            },
            options : f => [...G$1.state.choices.fight.player.units,...G$1.state.choices.fight.enemy.units,].filter( u => u.type == 'Nightgaunt' && u.place == G$1.state.choices.fight.place ),
            moves : {
                choose : (np,c) => {
                    if (np != 'unit' || np != 'abductunit' || ![...G$1.state.choices.fight.player.units,...G$1.state.choices.fight.enemy.units,].filter( u => u.place == G$1.state.choices.fight.place ).includes(c) ) return
                    c.place = '';
                    abductions++;
                    if (![...G$1.state.choices.fight.player.units,...G$1.state.choices.fight.enemy.units,].filter( u => u.type == 'Nightgaunt' && u.place == G$1.state.choices.fight.place ).length) {phs$1.returnStage();phs$1.endStage();}
                    else H$2.forceRerender();
                },
                done : f => {phs$1.returnStage();phs$1.endStage();},
            }
        },'fight','enemy');
        phs$1.addStage('abductenemyunit',{
            init : f => {
                if ( G$1.state.choices.fight.player.faction.name != 'cc' && G$1.state.choices.fight.enemy.faction.name != 'cc' ) {phs$1.endStage(); return}
                let p = [G$1.state.choices.fight.player.units,G$1.state.choices.fight.enemy].find( p => p.faction.name != 'cc');
                phs$1.interuptStage('fight','abductenemyunit',G$1.state.players.indexOf(p));
                abductions = 0;
            },
            options : f => [G$1.state.choices.fight.player.units,G$1.state.choices.fight.enemy].find( p => p.faction.name != 'cc').units.filter( u => u.place == G$1.state.choices.fight.place && u.tier < 2 ),
            moves : {
                choose : (np,c) => {
                    if (np != 'unit' || np != 'abductenemyunit' || ![G$1.state.choices.fight.player.units,G$1.state.choices.fight.enemy].find( p => p.faction.name != 'cc').units.filter( u => u.place == G$1.state.choices.fight.place && u.tier < 2 ).includes(c) ) return
                    c.place = '';
                    abductions--;
                    if (!abductions || ![G$1.state.choices.fight.player.units,G$1.state.choices.fight.enemy].find( p => p.faction.name != 'cc').units.filter( u => u.place == G$1.state.choices.fight.place && u.tier < 2 ).length) {phs$1.returnStage();phs$1.endStage();}
                    else H$2.forceRerender();
                },
            }
        },'fight','abductunit');
    };
    let flight = () => {
        G$1.state.players.find( p => p.faction.name == 'cc' ).units.map( u => u.speed = 2 );
    }; 
    let thousandforms = f => {
        G$1.state.choices.thousandforms = { once : 1, roll : 0, offers : [], tries : 3, negotiated : 0 };
        phs$1.addPhase('thousand forms',{
            req : f => G$1.state.choices.thousandforms.once && G$1.player.faction.name == 'cc' &&  hasBookReq(),
            init : f => { 
                G$1.state.choices.thousandforms.roll = roll(G$1.state.places.filter( p => G$1.player.units.filter( u => u.type == 'Fungi' ).map( u => u.place).includes(p) ).length );
                G$1.state.choices.thousandforms.offers = Array(G$1.state.players.length).fill(0);
                G$1.state.turn.pi++;
                G$1.state.choices.thousandforms.once = 0;
            },
            start : 'negotiate',
            stages: {               
                negotiate : {
                    next : 'power',
                    options : f => Array(G$1.state.choices.thousandforms.roll+1).fill(0).map( (l,i) => i).filter( l => l < G$1.player.units.filter( u => u.type == 'cult' && Object.keys(G$1.state.places).includes(u.place) ).length ),
                    moves : {
                        choose : (np, c) => {
                            if ( np == 'negotiate' && Array(G$1.state.choices.thousandforms.roll+1).fill(0).map( (l,i) => i).filter( l => l <= G$1.player.power ).includes(c) ) {
                                G$1.state.choices.thousandforms.offers[G$1.state.turn.pi%G$1.state.players.length] = c;
                                G$1.state.turn.pi++;
                                if ( G$1.state.players[G$1.state.turn.pi].faction.name=='cc') {
                                    tries--;
                                    G$1.state.choices.thousandforms.negotiated = (G$1.state.choices.thousandforms.offers.reduce((acc,cur)=>acc+cur,0) >= G$1.state.choices.thousandforms.roll );
                                }
                                if (!G$1.state.choices.thousandforms.tries || G$1.state.choices.thousandforms.negotiated) setStage( (G$1.state.choices.thousandforms.negotiated) ? 'losepower' : 'gainpower');
                                H$2.forceRerender();
                            }
                            
                        },
                    }
                },             
                losepower : {
                    init : f => {
                        G$1.pllayers.map( (p,i) => p.power -= G$1.state.choices.thousandforms.offers[i] );
                        phs$1.endStage();
                    },
                },             
                gainpower : {
                    init : f => {
                        G$1.player.power += G$1.state.choices.thousandforms.roll;
                        phs$1.endStage();
                    },
                }
            }
        } ); 
    };

    let G$2, phs$2, H$3;
    let faction$2 = (g,p,h) => {
        G$2 = g;
        phs$2 = p;
        H$3 = h;
        let oceans = Object.keys(G$2.state.places).filter( p => G$2.state.places[p].oceans);
        let books = ["Absorb", "Devolve", "Dreams", "Regenerate", "Submerge", "Y'hn Nthlei"];
        let bookinit = ["Absorb", "Devolve", "Dreams", "Regenerate", "Submerge", "Y'hn Nthlei"];
        // {
        //     "Absorb":absorb,
        //     "Devolve":devolve,
        //     "Dreams":dream,
        //     "Regenerate":regenerate,
        //     "Submerge":()=>{submerge();emerge();},
        //     "Y'hn Nthlei":yhanthlei
        // }
        H$3["Absorb"]=absorb;
        H$3["Devolve"]=devolve;
        H$3["Dreams"]=dream;
        H$3["Regenerate"]=regenerate;
        H$3["Submerge"]=()=>{submerge();emerge();};
        H$3["Y'hn Nthlei"]=yhanthlei;
                
        let bookreqs = [
            '1st doom + sign',
            'kill/devour enemy',
            'kill/devour 2 enemies',
            '3/4 Ocean Gates',
            'Awaken Cthulhu',
            'doom + 5 books + sign'
            // {'1st doom + sign':f=>G.phase=='doom' },
            // {'kill/devour enemy':f=> G.state.choices.fight.enemy?.temp.phase.kills+G.state.choices.fight.enemy?.temp.phase.devour == 1 || G.state.choices.fight.enemy?.temp.phase.kills+G.state.choices.fight.enemy?.temp.phase.devour == 3  },
            // {'kill/devour 2 enemies':f=> G.state.choices.fight.enemy?.temp.phase.kills+G.state.choices.fight.enemy?.temp.phase.devour == 2 || G.state.choices.fight.enemy?.temp.phase.kills+G.state.choices.fight.enemy?.temp.phase.devour == 3 },
            // {'3/4 Ocean Gates':f=> G.player.units.filter( u => u.gate && oceans.includes( u.place )).length > 2 || Object.values(G.state.places).filter( p => p.ocean && p.gate ).length > 3 },
            // {'Awaken Cthulhu':f=> G.state.choices.awaken.unit?.type=='Great Cthulhu'},
            // {'doom + 5 books + sign':f=> G.state.phase == 'doom' && G.player.books.length == 5}
        ];
        H$3['1st doom + sign']=f=>G$2.state.phase=='doom'; 
        H$3['kill/devour enemy']=f=> G$2.state.choices.fight.enemy?.temp.phase.kills+G$2.state.choices.fight.enemy?.temp.phase.devour == 1 || G$2.state.choices.fight.enemy?.temp.phase.kills+G$2.state.choices.fight.enemy?.temp.phase.devour == 3; 
        H$3['kill/devour 2 enemies']=f=> G$2.state.choices.fight.enemy?.temp.phase.kills+G$2.state.choices.fight.enemy?.temp.phase.devour == 2 || G$2.state.choices.fight.enemy?.temp.phase.kills+G$2.state.choices.fight.enemy?.temp.phase.devour == 3; 
        H$3['3/4 Ocean Gates']=f=> G$2.player.units.filter( u => u.gate && oceans.includes( u.place )).length > 2 || Object.values(G$2.state.places).filter( p => p.ocean && p.gate ).length > 3; 
        H$3['Awaken Cthulhu']=f=> G$2.state.choices.awaken.unit?.type=='Great Cthulhu';
        H$3['doom + 5 books + sign']=f=> G$2.state.phase == 'doom' && G$2.player.books.length == 5;

        let color = 'green';
        let start = 'southpacific';
        let name = 'gc';
        let units = [];
        let cost = 10;
        let awakencthu = {
            awakenplaces: () => [G$2.player.faction.start],
            awakenreq: () => G$2.player.power > 9 && G$2.state.places[G$2.player.faction.start].gate,
            cost: () => { G$2.player.power-=cost; cost = 4; G$2.player.signs++; phs$2.endStage(); },
        };
        H$3['Great Cthulhu']=awakencthu;
        let initUnits = p => {
            p.units = [
                ...p.units,
                {...H$3.unit("Great Cthulhu",name,'',10,6,2),...awakencthu},
                ...[0,1,2,3].map( f=> H$3.unit('Deep One',name,'',1,1,1)),
                ...[0,1].map( f=> H$3.unit('Shoggoth',name,'',2,2,1)),
                ...[0,1].map( f=> H$3.unit('Starspawn',name,'',3,3,1,1)),
            ];
        };
        devour();
        immortal();
        return {bookinit,books,bookreqs,color,start,name,units,initUnits}   
    };

    let lim$1 = 1, unlim = 1;

    let emerge = () => phs$2.addPhase( 'emerge',{
        lim: lim$1,
        start : 'place',
        req: f => G$2.player.faction.name == 'gc' && G$2.player.units.find( u => u.type == 'Great Cthulhu').place == 'submerged',
        stages: {               
            place : {
                options : f => Object.keys(G$2.state.places),
                moves : {
                    choose : (np, c) => {
                        if ((np == 'place' || np == 'emerge') && Object.keys(G$2.state.places).includes(c)) {
                            G$2.player.units.filter( u => u.place == 'submerged').map( u => u.place = c);
                            phs$2.endStage();
                        }
                    }
                }
            }
        }
    });
    let submerge = () => phs$2.addPhase('submerge', {
        lim: lim$1,
        start : 'unit',
        req: f =>  G$2.player.faction.name == 'gc' && G$2.player.units.find( u => u.type == 'Great Cthulhu' && G$2.state.places[u.place] ),
        stages: {               
            unit : {
                options : f => G$2.player.units.filter( u => u.place = G$2.player.units.find( u => u.type == 'Greath Cthulhu').place ),
                moves : {
                    choose : (np, c) => {
                        if ((np == 'unit' || np == 'submerge') && G$2.player.units.filter( u => u.place = G$2.player.units.find( u => u.type == 'Greath Cthulhu').place ).includes(c)) {
                            c.place = 'submerged';
                            H$3.forceRerender();
                        }
                    },
                    done : f => {
                        G$2.player.units.find( u => u.type == 'Greath Cthulhu').place = 'submerged';
                        G$2.player.power--;
                        phs$2.endStage();
                    }
                },
            }
        }
    });
    let dream = () => phs$2.addPhase('dream', {
        lim: lim$1,
        start : 'place',
        req: f => G$2.player.power > 1 && G$2.player.units.filter( u => u.type == 'cult' && u.place == '' ).length && G$2.units.filter( u => u.type == 'cult' && G$2.state.places[u.place] && H$3.findPlyr(u.owner).faction.name != 'gc' ).length,
        stages: {               
            place : {
                next : 'player',
                options : f => Object.keys(G$2.state.places).filter( p => G$2.units.find( u => u.type == cult && H$3.findPlyr(u.owner).faction.name != 'gc' ) ),
                moves : {
                    choose : (np, c) => {
                        if ((np == 'place' || np == 'dream') && Object.keys(G$2.state.places).filter( p => G$2.units.find( u => u.type == cult && H$3.findPlyr(u.owner).faction != 'gc' ) ).includes(c)) {
                            G$2.state.choices.dream.places = c;
                            phs$2.endStage();
                        }
                    }
                },
            },         
            player : {
                next:'util',
                options : f => G$2.state.players.filter( p => p.units.find( u => u.place == G$2.state.choices.dream.place ) && p.faction.name != 'gc'),//.map( p => p.faction.name ),
                moves : {
                    choose : (np, c) => {
                        if (np == 'player' && G$2.state.players.filter( p => p.units.find( u => u.place == G$2.state.choices.dream.place ) && p.faction.name != 'gc').includes(c)) {
                            G$2.state.choices.dream.player = c;
                            phs$2.endStage();
                        }
                    }
                },
            },
            util : {
                options : f => [],
                init : f => {phs$2.interuptStage('dream','unit',G$2.state.players.indexOf(G$2.state.choices.dream.player));},
                moves : {
                    choose : (np,c) => {},
                    done : (np, c) => phs$2.endStage()
                },
            },
            unit : {
                options : f => G$2.player.units.filter( u => u.type == 'cult' && u.place == G$2.state.choices.dream.place ),
                moves : {
                    choose : (np, c) => {
                        if ((np == 'unit' || np == 'dream') && G$2.player.units.filter( u => u.type == 'cult' && u.place == G$2.state.choices.dream.place ).includes(c)) {
                            G$2.state.choices.dream.unit = c;
                            c.place = '';
                            G$2.state.players.find( p => p.faction.name='gc').units.find( u => u.type == 'cult' && u.place == '' ).place = G$2.state.choices.dreams.place;
                            phs$2.returnStage();
                        }
                    }
                },
            },
        }
    });
    let devolve = () => {
        G$2.state.choices.devolve = {unit:null};
        let dvstage = {
            unit : {
                options: f => G$2.player.units.filter( u => u.type=='cult' && G$2.state.places[u.place]),
                moves : {
                    choose : (np,c) => {
                        if ((np != 'unit' && np != 'devolveunit' ) || !G$2.player.units.filter( u => u.type=='cult' && G$2.state.places[u.place]).includes(c)) return
                        G$2.state.choices.devolve.unit = c;
                        G$2.player.units.find( u => u.type=='Deep One' && u.place=='' ).place = c.place;
                        c.place = '';
                        c.gate = 0;
                        if (!G$2.player.units.find( u => u.type=='Deep One' && u.place=='' )) phs$2.endStage();
                        H$3.forceRerender();
                    },
                    done : (np,c) => phs$2.endStage(),
                }
            }
        };
        phs$2.addPhase('devolve',{
            start : 'unit',
            unlim,
            req: f => G$2.player.faction.name=='gc' && G$2.player.units.find( u => u.type=='cult' && G$2.state.places[u.place]) && G$2.player.units.find( u => u.type=='Deep One' && u.place=='' ),
            stages: {
                unit : {...dvstage.unit}
            }
        });
        dvstage.unit.init = f => { 
            if (G$2.player.faction.name != 'gc' 
                && G$2.units.find( u => 
                H$3.findPlyr(u.owner).faction.name != 'gc' 
                && (u.combat || u.tier)
                && G$2.state.players.find( p => p.faction.name=='gc' ).units.filter( u => !u.tier).map(u => u.place).includes(u.place)) )
                    phs$2.interuptStage('action','devolveunit',G$2.state.players.indexOf(G$2.state.players.find( p => p.faction.name=='gc')));
            else phs$2.endStage();
        };
        dvstage.unit.moves.done = f => {phs$2.returnStage();phs$2.endStage();};
        dvstage.unit.next = ''+G$2.phases.action.start||'';
        G$2.phases.action.start = 'devolveunit';
        G$2.phases.action.stages['devolveunit'] = dvstage.unit;

    };
    let devoured;
    let devour = () => {
        let dvstage = {
            init : f => { 
                devoured = ([G$2.state.choices.fight.player, G$2.state.choices.fight.enemy].find( p => p.faction.name == 'gc')) ? [G$2.state.choices.fight.player, G$2.state.choices.fight.enemy].find( p => p.faction.name == 'gc') : null;
                if (!devoued || G$2.units.find( u => u.type = 'Great Cthulhu').place != G$2.state.choices.fight.place || !devoured.units.find( u => u.tier < 2 && u.place == G$2.state.choices.fight.place )) {
                    phs$2.endStage();
                    return 
                }
                G$2.state.turn.pi = G$2.state.players.indexOf(devoured);
                H$3.forceRerender();
            },
            options : f => (devoured) ? devoured.units.filter( u => u.tier < 2 && u.place == G$2.state.choices.fight.place ) : [],
            moves : {
                choose : (np,c) => {
                    if ( np != 'unit' || np != 'devourunit' || !devoured?.units.filter( u => u.tier < 2 && u.place == G$2.state.choices.fight.place ).includes(c)) return
                    c.place = '';
                    G$2.state.turn.pi = G$2.state.players.indexOf([G$2.state.choices.fight.player, G$2.state.choices.fight.enemy].find( p => p.faction.name != devoured.faction.name));
                    phs$2.endStage();
                }
            }
        };
        phs$2.addStage('devourunit',dvstage,'fight','roll');
    };
    let yhanthlei = () => {
        let yhstage = {
            init : f=>{
                G$2.state.players.find( p => p.faction.name == 'gc' ).power += G$2.player.power += oceans.filter( o => G$2.state.places[o].gate && G$2.units.filter( u => u.place == o && u.gate && H$3.findPlyr(u.owner).faction.name != 'gc' ).length ).length;
                phs$2.endStage();
            },
            options : f=>[],
            moves : {
                choose : (np,c) => {}
            },
        };
        yhstage.next = G$2.phases.gather.start||'';
        G$2.phases.gather.start = 'yhanthlei';
        G$2.phases.gather.stages['yhanthlei'] = yhstage;
    };
    let regenerate = () => phs$2.addStage( 'regenerate',{
        init : f=>{
            G$2.state.players.find( p => p.faction.name=='gc').units.filter( u => u.type == 'Starspawn' && u.place == G$2.state.choices.fight.place).map( f => (G$2.state.players.find( p => p.faction.name=='gc').temp.phase.kills) ? G$2.state.players.find( p => p.faction.name=='gc').temp.phase.kills-- : G$2.state.players.find( p => p.faction.name=='gc').temp.phase.pains--);
            phs$2.endStage();
        },
        options : f=>[],
        moves : {
            choose : (np,c) => {}
        },
    },'fight','roll');
    let absorb = () => phs$2.addStage( 'absorbunit',{
        init : f=>{
            G$2.units.filter( u => u.type == 'Shoggoth').map( u => u.absorb = 0);
            if ( ![G$2.state.choices.fight.player,G$2.state.choices.fight.enemy].find( p => p.faction.name == 'gc') || !G$2.units.find( u => u.type == 'Shoggoth' && u.place == G$2.state.choices.fight.place) ) {
                phs$2.endStage();
                return
            }
            phs$2.interuptStage('fight','absorbunit',G$2.state.players.indexOf(G$2.state.players.find( p => p.faction.name == 'gc')));
        },
        options : f=>G$2.player.units.filter( u => u.tier < 2 && u.type != 'Shoggoth' && u.place == G$2.state.choices.fight.place),
        moves : {
            choose : (np,c) => {
                if ( ( np != 'unit' && np != 'absorbunit') || !G$2.player.units.filter( u => u.tier < 2 && u.type != 'Shoggoth' && u.place == G$2.state.choices.fight.place).includes(c) ) return
                c.place = '';
                G$2.units.find( u => u.type == 'Shoggoth' && u.place == G$2.state.choices.fight.place).absorb+=3;
                H$3.forceRerender();
            },
            done : (np,c) => {phs$2.returnStage(); if(G$2.state.stage == 'absorbunit') phs$2.endStage();}
        },
    },'fight','enemy');
    let immortal = () => phs$2.addStage( 'immortal', {
        init : f => {
            G$2.player.sign += (G$2.player.faction.name == 'gc' && G$2.state.choices.awaken.unit.tier >= 2);
            phs$2.endStage();
        }
    }, 'awaken','place');

    let G$3, phs$3, H$4;
    let faction$3 = (g,p,h) => {
        G$3 = g;
        phs$3 = p;
        H$4 = h;
        let books = ["He Who Must Not Be Named","Passion","Shriek of the Byakhee","The Screaming Dead","The Third Eye","Zin Gaya"];
        let bookinit = ["He Who Must Not Be Named","Passion","Shriek of the Byakhee","The Screaming Dead","The Third Eye","Zin Gaya"];
        // {
        //     "He Who Must Not Be Named":named,
        //     "Passion":passion,
        //     "Shriek of the Byakhee":shriek,
        //     "The Screaming Dead":scream,
        //     "The Third Eye":thirdeye,
        //     "Zin Gaya":zingaya
        // }
        H$4["He Who Must Not Be Named"]=named;
        H$4["Passion"]=passion;
        H$4["Shriek of the Byakhee"]=shriek;
        H$4["The Screaming Dead"]=scream;
        H$4["The Third Eye"]=thirdeye;
        H$4["Zin Gaya"]=zingaya;
                
        let bookreqs = [
            'gift 3 doom',
            'Desecrate \\|/',
            'Desecrate \\o/',
            'Desecrate \\-/',
            "Awaken King in Yellow",
            "Awaken Hastur"
            // {'gift 3 doom':f=>false },
            // {'Desecrate \\|/':f=> Object.values(G.state.places).filter( p => p.desecrated && p.glyphs['\\|/']).length },
            // {'Desecrate \\o/':f=> Object.values(G.state.places).filter( p => p.desecrated && p.glyphs['\\o/']).length },
            // {'Desecrate \\-/':f=> Object.values(G.state.places).filter( p => p.desecrated && p.glyphs['\\-/']).length },
            // {"Awaken King in Yellow":f=> G.state.choices.awaken.unit?.type=='King in Yellow'},
            // {"Awaken Hastur":f=> G.state.choices.awaken.unit?.type=='Hastur'}
        ];
        
        H$4['gift 3 doom']=f=>false; 
        H$4['Desecrate \\|/']=f=> Object.values(G$3.state.places).filter( p => p.desecrated && p.glyphs['\\|/']).length; 
        H$4['Desecrate \\o/']=f=> Object.values(G$3.state.places).filter( p => p.desecrated && p.glyphs['\\o/']).length; 
        H$4['Desecrate \\-/']=f=> Object.values(G$3.state.places).filter( p => p.desecrated && p.glyphs['\\-/']).length; 
        H$4["Awaken King in Yellow"]=f=> G$3.state.choices.awaken.unit?.type=='King in Yellow';
        H$4["Awaken Hastur"]=f=> G$3.state.choices.awaken.unit?.type=='Hastur';

        let color = 'yellow';
        let start = 'europe';
        let name = 'ys';
        let units = [];
        let awakenking = {
            awakenplaces: () => Object.keys(G$3.state.places).filter( p => !G$3.state.places[p].gate && G$3.player.units.filter( u => u.place == p).length ),
            awakenreq: () => G$3.player.power > 3 && Object.keys(G$3.state.places).filter( p => !G$3.state.places[p].gate && G$3.player.units.filter( u => u.place == p).length ).length,
            cost: () => { G$3.player.power-=4; phs$3.endStage(); },
        };
        let awakenhast = {
            awakenplaces: () => G$3.player.units.filter( u => u.gate && u.place == G$3.player.units.find( u => u.type == 'King in Yellow' ).place ).map( u => u.place ),
            awakenreq: () => G$3.player.power > 9 && G$3.player.units.filter( u => u.gate && u.place == G$3.player.units.find( u => u.type == 'King in Yellow' ).place ).length,
            cost: () => { G$3.player.power-=10; phs$3.endStage(); },
        };
        H$4['Hastur'] = awakenhast;
        H$4['King in Yellow'] = awakenking;
        let initUnits = p => {
            p.units = [
                ...p.units,
                {...H$4.unit("Hastur",name,'',10,f=>G$3.ritual.cost,2),...awakenhast},
                {...H$4.unit("King in Yellow",name,'',4,0,2),...awakenking},
                ...[0,1,2,3,4,5].map( f=> H$4.unit('Undead',name,'',1,f=>G$3.units.filter( u => u.place == G$3.state.choices.combat.place && u.type == "Undead").length-1,1)),
                ...[0,1,2,3].map( f=> H$4.unit("Byakhee",name,'',2,f=>G$3.units.filter( u => u.place == G$3.state.choices.combat.place && u.type == "Bya'khee").length+1,1)),
            ];
        };

        desecrate();
        gift3doom();
        vengence();
        feast();
        let faction = {bookinit,books,bookreqs,color,start,name,units,initUnits};
        return faction
    };

    let lim$2 = 1, unlim$1 = 1;
    let gift3doom = () => phs$3.addPhase('gift 3 doom',{
        lim: lim$2,
        req : f => G$3.player.faction.name=='ys' && G$3.player.faction.bookreqs.includes('gift 3 doom'),
        start : 'player',
        stages: {               
            player : {
                options : f => G$3.state.players.filter( p => p.faction.name != 'ys' ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'player' || np == 'gift 3 doom' ) && G$3.state.players.filter( p => p.faction.name != 'ys' ).includes(c)) {
                            c.doom+=3;
                            H$4['gift 3 doom'] = f => true;
                            phs$3.endPhase();
                        }
                    }
                }
            }
        }
    });

    let named = () => {
        G$3.player.temp.turn.named = 1;
        phs$3.addPhase('named',{
            unlim: unlim$1,
            req : f => G$3.player.faction.name == 'ys' && G$3.player.units.find( u => u.type == 'Hastur' && G$3.state.places[u.place] ) && !G$3.player.temp.turn.named && !G$3.player.temp.turn.scream && G$3.player.power > 0,
            start : 'place',
            stages: {               
                place : {
                    options : f=>Array.from( new Set(G$3.unit.filter( u => u.type == 'cult' && u.faction.name != 'ys' ).map( u => u.place ) ) ),
                    moves : {
                        choose : (np, c) => {
                            if ( ( np == 'place' || np == 'named' ) && Array.from( new Set(G$3.unit.filter( u => u.type == 'cult' && u.faction.name != 'ys' ).map( u => u.place ) ) ).includes(c)) {
                                G$3.player.temp.turn.named = 1;
                                G$3.player.units.find( u => u.type == 'Hastur' ).place = c;
                                G$3.player.power--;
                                phs$3.endPhase();
                            }
                        }
                    }
                }
            }
        });
    };

    let shriek = () => {
        G$3.state.choices.shriek = {place:null};
        phs$3.addPhase('shriek',{
            lim: lim$2,
            req : f => G$3.player.faction.name == 'ys' && G$3.player.units.find( u => u.type == 'Byakhee' && G$3.state.places[u.place]) && G$3.player.power > 0,
            start : 'place',
            stages: {               
                place : {
                    next : 'unit',
                    options : f=>G$3.state.places,
                    moves : {
                        choose : (np, c) => {
                            if ( ( np == 'place' || np == 'shriek' ) && G$3.state.places.includes(c) ) {
                                G$3.state.choices.shriek.place = c;
                                G$3.player.power--;
                                phs$3.endPhase();
                            }
                        }
                    }
                },              
                unit : {
                    options : f=> G$3.player.units.filter( u => u.type == 'Byakhee' && G$3.state.places[u.place] && u.place != G$3.state.choices.shriek.place ),
                    moves : {
                        choose : (np, c) => {
                            if ( ( np == 'unit' || np == 'shriek' ) && G$3.player.units.filter( u => u.type == 'Byakhee' && G$3.state.places[u.place] && u.place != G$3.state.choices.shriek.place ).includes(c) ) {
                                c.place = G$3.state.choices.shriek.place;
                                H$4.forceRerender();
                            }
                        },
                        done : f => phs$3.endStage()
                    }
                }
            }
        });
    };

    let zingaya = () => {
        G$3.state.choices.zingaya = {place:null};
        phs$3.addPhase('shriek',{
            lim: lim$2,
            req : f => G$3.player.faction.name == 'ys' && G$3.player.units.find( u => u.type == 'Undead' && u.place == '' ) && G$3.player.units.find( u => u.type == 'Undead' && G$3.state.places[u.place] && G$3.units.find( uu => H$4.findPlyr(uu.owner).faction.name != 'ys' && uu.type == 'cult' && uu.place == u.place) ) && G$3.player.power > 0,
            start : 'place',
            stages: {               
                place : {
                    next : 'unit',
                    options : f=> Array.from( new Set( G$3.player.units.find( u => u.type == 'Undead' && G$3.state.places[u.place] && G$3.units.find( uu => H$4.findPlyr(uu.owner).faction.name != 'ys' && uu.type == 'cult' && uu.place == u.place) ).map( u => u.place ) ) ),
                    moves : {
                        choose : (np, c) => {
                            if ( ( np == 'place' || np == 'zingaya' ) && Array.from( new Set( G$3.player.units.find( u => u.type == 'Undead' && G$3.state.places[u.place] && G$3.units.find( uu => H$4.findPlyr(uu.owner).faction.name != 'ys' && uu.type == 'cult' && uu.place == u.place) ).map( u => u.place ) ) ).includes(c) ) {
                                G$3.state.choices.zingaya.place = c;
                                phs$3.endPhase();
                            }
                        }
                    }
                },              
                unit : {
                    options : f=> G$3.units.filter( u => H$4.findPlyr(u.owner).faction.name != 'ys' && u.type == 'cult' && u.place == G$3.state.choices.zingaya.place ),
                    moves : {
                        choose : (np, c) => {
                            if ( ( np == 'unit' || np == 'zingaya' ) && G$3.units.filter( u => H$4.findPlyr(u.owner).faction.name != 'ys' && u.type == 'cult' && u.place == G$3.state.choices.zingaya.place ).includes(c) ) {
                                G$3.player.units.find( u => u.type == 'Undead' && u.place == '' ).place = c.place;
                                G$3.player.power--;
                                c.place = '';
                                phs$3.endStage();
                            }
                        },
                    }
                }
            }
        });
    };

    let desecrate = () => {
        let roll;
        phs$3.addPhase('desecrate',{
            lim: lim$2,
            req : f => G$3.player.faction.name == 'ys' && G$3.player.units.find( u => u.type == 'King in Yellow' && G$3.state.places[u.place] ) && !G$3.state.places[G$3.player.units.find( u => u.type == 'King in Yellow' && !G$3.state.places[u.place] ).place].glyphs.includes('desecration') && G$3.player.power > 1,
            start : 'roll',
            stages: {               
                roll : {
                    init : f=> {
                        G$3.player.power-= (2 - ( G$3.player.books.includes("The Third Eye") && G$3.state.places[ G$3.player.units.find( u => u.type == 'Hastur' ).place ] ) );
                        roll = phs$3.roll(1);
                        if (phs$3.roll(1) >= G$3.player.units.filter( u => u.place == G$3.player.units.find( u => u.type == 'King in Yellow' ).place ).length ) {
                            G$3.state.places[G$3.player.units.find( u => u.type == 'King in Yellow' ).place].glyphs.push('desecration');
                            phs$3.endStage();
                        } else {
                            phs$3.setStage('unit');
                        }
                    },
                },              
                unit : {
                    options : f=> G$3.player.units.filter( u => H$4.findPlyr(u.owner).faction.name != 'ys' && u.cost <= 2 && u.place == '' ),
                    moves : {
                        choose : (np, c) => {
                            if ( ( np == 'unit' || np == 'desecrate' ) && G$3.player.units.filter( u => H$4.findPlyr(u.owner).faction.name != 'ys' && u.cost <= 2 && u.place == '' ).includes(c) ) {
                                c.place = G$3.player.units.find( u => u.type = 'King in Yellow' );
                                phs$3.endStage();
                            }
                        },
                        done : f=>phs$3.endStage()
                    }
                }
            }
        });
    };

    let scream = () => {
        G$3.player.temp.turn.scream = 1;
        G$3.state.choices.scream = {place:null};
        phs$3.addPhase('scream',{
            unlim: unlim$1,
            req : f => G$3.player.faction.name == 'ys' && G$3.state.places[G$3.player.units.find( u => u.type = 'King in Yellow' ).place] && !G$3.player.temp.turn.named && !G$3.player.temp.turn.scream && G$3.player.power > 0,
            start : 'place',
            stages: {               
                place : {
                    next : 'unit',
                    options : f=>G$3.state.places[ G$3.player.units.find( u => u.type == 'King in Yellow' ).place ].adjacent,
                    moves : {
                        choose : (np, c) => {
                            if ( ( np == 'place' || np == 'scream' ) && G$3.state.places[ G$3.player.units.find( u => u.type == 'King in Yellow' ).place ].adjacent.includes(c) ) {
                                G$3.state.choices.scream.place = c;
                                G$3.player.temp.turn.scream = 1;
                                G$3.player.power--;
                                phs$3.endPhase();
                            }
                        }
                    }
                },
                unit : {
                    options : f=> G$3.player.units.filter( u => u.type == 'Undead' && u.place == G$3.player.units.find( u => u.type = 'King in Yellow' ).place ),
                    moves : {
                        choose : (np, c) => {
                            if ( ( np == 'place' || np == 'scream' ) && G$3.player.units.filter( u => u.type == 'Undead' && u.place == G$3.player.units.find( u => u.type = 'King in Yellow' ).place ).includes(c) ) {
                                c.place = G$3.state.choices.scream.place;
                                if ( G$3.player.units.filter( u => u.type == 'Undead' && u.place == G$3.player.units.find( u => u.type = 'King in Yellow' ).place ).length )
                                    H$4.forceRerender();
                                else {
                                    G$3.player.units.find( u => u.type = 'King in Yellow' ).place = G$3.state.choices.scream.place;
                                    phs$3.endStage();
                                }
                            }
                        },
                        done : f => {
                            G$3.player.units.find( u => u.type = 'King in Yellow' ).place = G$3.state.choices.scream.place;
                            phs$3.endStage();
                        }
                    }
                }
            }
        });
    };

    let feast = () => phs$3.addStage('feast',{
        init : f => {
            G$3.state.players.find( p => p.faction.name == 'ys' ).power += G$3.state.places.filter( p => G$3.state.places[p].glyphs.includes('desecration') && G$3.units.find( u => u.place == p) ).length;
            phs$3.endStage();
        }
    },'gather','start');

    let passion = () => {
        let cultists = G$3.player.units.filter( u => u.type == 'cult' && G$3.state.places[u.place] ).length;
        let pastage = {
            init : f=>{
                if ( G$3.state.players.find( p => p.faction.name == 'ys' ).units.filter( u => u.type == 'cult' && G$3.state.places[u.place] ).length < cultists )
                    G$3.state.players.find( p => p.faction.name == 'ys' ).power += cultists - G$3.state.players.find( p => p.faction.name == 'ys' ).units.filter( u => u.type == 'cult' && G$3.state.places[u.place] ).length;
                cultists = G$3.state.players.find( p => p.faction.name == 'ys' ).units.filter( u => u.type == 'cult' && G$3.state.places[u.place] ).length;
                phs$3.endStage();
            },
        };
        pastage.next = G$3.phases.action.start||'';
        G$3.phases.action.start = 'passion';
        G$3.phases.action.stages['passion'] = pastage;
    };

    let thirdeye = () => {
        phs$3.addStage('thirdeye',{
            init : f => {
                G$3.player.signs += G$3.state.places.includes( G$3.player.units.find( u => u.type == 'Hastur' ).place );
                phs$3.endStage();
            }
        },'desecrate','roll');
    };

    let vengence = () => {
        let interupted;
        phs$3.phases.fight.stages.assignekills.init = {
            init : f => {
                interupted = [G$3.state.choices.fight.enemy,G$3.state.choices.fight.player].find( p => p.faction.name == 'ys' ) && G$3.units.find( u => u.type == 'Hastur').place == G$3.state.choices.fight.place;
                if ( interupted )
                    phs$3.interuptStage('fight','assignekills',G$3.state.players.indexOf(G$3.state.players.find( p => p.faction.name == 'ys' ) ));
            },
        };
        phs$3.addStage('veng-e',{
            init : f => {
                if ( interupted ) {
                    interupted = false;
                    phs$3.returnStage();
                    phs$3.endStage();
                }
                else
                    phs$3.endStage();
            }
        },'fight','assignekills');
        phs$3.phases.fight.stages.assignpkills.init = {
            init : f => {
                interupted = [G$3.state.choices.fight.enemy,G$3.state.choices.fight.player].find( p => p.faction.name == 'ys' ) && G$3.units.find( u => u.type == 'Hastur').place == G$3.state.choices.fight.place;
                if ( interupted )
                    phs$3.interuptStage('fight','assignpkills',G$3.state.players.indexOf(G$3.state.players.find( p => p.faction.name == 'ys' ) ));
            },
        };
        phs$3.addStage('veng-p',{
            init : f => {
                if ( interupted ) {
                    interupted = false;
                    phs$3.returnStage();
                    phs$3.endStage();
                }
                else
                    phs$3.endStage();
            }
        },'fight','assignpkills');
    };

    let factions = (G,phases,H) => G.factions = {bg:faction(G,phases,H),cc:faction$1(G,phases,H),gc:faction$2(G,phases,H),ys:faction$3(G,phases,H)};

    let G$4, lim$3 = 1, H$5;
    let findPlyr = (name) => G$4.state.players.find( p => p.faction.name == name);
    let stealableUnitsIn = (p) => {
        let tmpunits = [];
            tmpunits = G$4.units.filter( u => u.place == p );
            let dom = {};
            G$4.state.players.map( p => dom[p.faction.name] = 0);
            tmpunits.map( u => 
                dom[findPlyr(u.owner).faction.name] = (dom[findPlyr(u.owner).faction.name] < u.tier) 
                ? u.tier : dom[findPlyr(u.owner).faction.name]
            );
            tmpunits = tmpunits.filter( u => 
                u.tier == 0 && dom[findPlyr(u.owner).faction.name] < dom[G$4.player.faction.name] 
            );
            return tmpunits
    };
    let calcDamage = (p) => {
        let r = roll$1( p.units.filter( u => u.place == choices.fight.place ).map( u => typeof u.combat == 'function' ? u.combat() : u.combat ) );
        p.temp.phase.kills = r.filter( e => e > 4 ).length;
        p.temp.phase.pains = r.filter( e => e < 5 && e > 2).length;
    };
    let roll$1 = ( dice ) => Math.floor((Math.random() * 6) + 1);
    let endTurn = t => { 
        G$4.state.players.map( p => p.temp.turn = {} );
        if (!G$4.state.players.filter( p => p.power ).length) 
            phases.setPhase('gather');
        G$4.state.turn.lim=1; 
        G$4.state.turn.pi++;
        while(G$4.state.phase == 'action' && !G$4.state.players[G$4.state.turn.pi%G$4.state.players.length].power) 
            G$4.state.turn.pi++;
        H$5.forceRerender();
    };
    let returnStage = f => {};
    let interuptStage = (inphase,instage,inpi) => {
        let rphase = ''+G$4.state.phase;
        let rstage = ''+G$4.state.stage;
        let rpi = 0+G$4.state.turn.pi;
        returnStage = phases.returnStage = f => {
            G$4.state.phase = rphase;
            G$4.state.stage = rstage;
            G$4.state.turn.pi = rpi;
            H$5.forceRerender();
            if (G$4.state.phase == 'action' && !G$4.phases.action.stages.start.options().length) endTurn();
            else if (G$4.state.stage && !G$4.phases[G$4.state.phase].stages[G$4.state.stage].options().length) endStage$1();
            else if (G$4.phases[G$4.state.phase].options && !G$4.phases[G$4.state.phase].options().length) endStage$1();
        };
        G$4.state.phase = inphase;
        G$4.state.stage = instage;
        G$4.state.turn.pi = inpi;
        H$5.forceRerender();
    };
    // let checkbooks = () => 
    //     G.state.players.map( p => p.faction.bookreqs.map( (l,i) => {
    //         if (Object.values(l)[0]()){
    //             p.faction.bookreqs[i] = {'waiting...':f=>false}
    //             interuptStage('book','book',G.state.players.indexOf(p))
    //         }
    //     }))
    let checkbooks = () => 
        G$4.state.players.map( p => p.faction.bookreqs.map( (l,i) => {
            console.log(l,H$5[l]);
            if (H$5[l]()){
                p.faction.bookreqs[i] = 'waiting...';
                interuptStage('book','book',G$4.state.players.indexOf(p));
            }
        }));
    let lostGates = g => Object.keys(G$4.state.places).filter( p => G$4.state.places[p].gate && !G$4.units.filter( u => u.place == p && u.gate).length );
    let autoMountGates = g => {
        lostGates().map( pl => {
            let stop = 0;
            G$4.state.players.map( p => {
                let cults = p.units.filter( u => u.type == 'cult' && u.place == pl );
                if (cults.length && !stop) {
                    cults[0].gate = pl;
                    stop = 1;
                }
            });
            G$4.state.places[pl].nocults = !stop;
        });
    };
    let phaseInit = () => {
        if (G$4.state.stage && G$4.phases[G$4.state.phase].stages[G$4.state.stage].init)
            G$4.phases[G$4.state.phase].stages[G$4.state.stage].init(); 
        else if (G$4.state.stage == '' && G$4.phases[G$4.state.phase].init)
            G$4.phases[G$4.state.phase].init(); 
        
    };
    let setStage$1 = s => {G$4.state.stage = s; phaseInit(); H$5.forceRerender();};
    let endStage$1 = s => {autoMountGates(); if (G$4.phases[G$4.state.phase].stages[G$4.state.stage].next) {setStage$1(G$4.phases[G$4.state.phase].stages[G$4.state.stage].next);} else {endPhase();}};
    let setPhase = p => {
        G$4.state.phase = p;
        G$4.state.stage = G$4.phases[G$4.state.phase].start||'';
        autoMountGates();
        checkbooks();
        phaseInit();
        H$5.forceRerender();
    };
    let endPhase = p => {
        G$4.state.players.map( p => p.temp.phase = {} );
        if (G$4.phases[G$4.state.phase].lim) 
            G$4.state.turn.lim--;
        G$4.state.phase = (G$4.phases[G$4.state.phase].next) ? G$4.phases[G$4.state.phase].next : 'action';
        G$4.state.stage = G$4.phases[G$4.state.phase].start||'';
        autoMountGates();
        checkbooks();
        phaseInit();
        H$5.forceRerender();
        if (G$4.state.phase == 'action' && !G$4.phases.action.stages.start.options().length) endTurn();
    };
    let addStage=(s,stage,phase,prev)=>{
        G$4.phases[phase].stages[s] = stage;
        if (prev) {
            stage.next = ''+(G$4.phases[phase].stages[prev].next||'');
            G$4.phases[phase].stages[prev].next = s;
        } //else G.phases[phase].start = s
    };
    let addPhase=(p,phase)=>{G$4.phases[p]=phase;};
    let phases = {
        addPhase,
        roll: roll$1,
        addStage,
        interuptStage,
        endPhase,
        endStage: endStage$1,
        setPhase,
        setStage: setStage$1,
        returnStage,
        init : (g,h) => {
            G$4 = g; H$5 = h; G$4.phases = {...phases.phases};
            G$4.state.choices = {
                book : {
                    book : null,
                },
                awaken : {
                    unit : null,
                    place : null,
                },
                move : {
                    unit : null,
                    place : null,
                },
                fight : {
                    place : null,
                    enemy : null,
                },
                hire : {
                    place : null,
                },
                open : {
                    place : null,
                },
                summon : {
                    unit : null,
                    place : null,
                },
                steal : {
                    place : null,
                    unit : null,
                },
            };
        },

        phases : {
            gather : {
                start : 'start',
                stages : {
                    start : {
                        init : f => {
                            Object.keys(G$4.state.choices).map( k => {
                                if (G$4.state.choices[k].once !== undefined)
                                    G$4.state.choices[k].once = 1;
                            });
                            G$4.state.players.map( 
                                p => p.power += lostGates().length 
                                + p.units.filter(
                                    u => (u.type == 'cult' || u.gatherer) 
                                    && Object.keys(G$4.state.places).includes(u.place)
                                ).length 
                                + 2 
                                * p.units.filter( 
                                    u => u.gate
                                ).length 
                                + G$4.units.filter( 
                                    u => u.place == p.faction.name 
                                ).map( 
                                    u => u.place = ''
                                ).length
                            );
                            let highest = G$4.player;
                            G$4.state.players.map( p => highest = (p.power > highest.power) ? p : highest);
                            G$4.state.turn.pi = G$4.state.players.indexOf(highest);
                            G$4.state.players.map( p => p.power = (p.power < highest.power/2) ? highest.power/2 : p.power);
                        },
                        options : f => ['keep turn order','reverse turn order'],
                        moves : {
                            choose : (np,c) => {
                                let p = G$4.state.players[G$4.state.turn.pi%G$4.state.players.length];
                                if( ['keep turn order','reverse turn order'].includes(c) ) {
                                    if (c == 'reverse turn order') {
                                        G$4.state.players = G$4.state.players.reverse();
                                        G$4.state.turn.pi = G$4.state.players.indexOf(G$4.state.players.find( pp => pp.faction.name == p.faction.name));
                                    }
                                    G$4.state.players.map( p => p.ritual = 1);
                                    setPhase('doom');
                                }
                            }
                        }
                    },
                }
            },
            doom : {
                start : 'doom',
                stages : {
                    doom : {
                        options : f => ['ritual',"don't ritual"],
                        moves : {
                            choose : (np,c) => {
                                if (np != 'doom') 
                                    return
                                G$4.player.units.filter( u => u.gate ).map( f => G$4.player.doom++);
                                G$4.player.ritual = 0;
                                if (c == 'ritual' && G$4.player.power >= G$4.ritualcost) {
                                    G$4.player.units.filter( u => u.gate ).map( f => G$4.player.doom++);
                                    G$4.player.units.filter( u => u.tier==2 ).map( f => G$4.player.signs++);
                                    G$4.player.power -= G$4.ritualcost;
                                    G$4.rituals++;
                                }
                                G$4.state.turn.pi++;        
                                if (!G$4.state.players.filter( p => p.ritual).length) endStage$1();
                                H$5.forceRerender();
                            },
                            // done : (np,c) => { G.player.power = 0; endTurn(); }
                        }
                    }
                }
            },
            action : {
                start : 'start',
                stages : {
                    start : {
                        options : f => Object.keys(G$4.phases).filter( p => (G$4.phases[p].unlim || (G$4.phases[p].lim && G$4.state.turn.lim)) && (!G$4.phases[p].req || G$4.phases[p].req())),
                        moves : {
                            choose : (np,c) => {
                                console.log('choosen',np,c);if (np == 'start') setPhase(c);},
                            done : (np,c) => { G$4.player.power = 0; endTurn(); }
                        }
                    }
                }
            },
            move : {
                lim: lim$3,
                start : 'unit',
                stages: {               
                        unit : {
                            next : 'place',
                            options : f => G$4.player.units.filter( u => G$4.state.places[u.place] && !u.moved),
                            moves : {
                                choose : (np, c) => {
                                    if (np == 'unit' && G$4.player.units.filter( u => G$4.state.places[u.place] ).map( u => u.id ).includes(c.id) /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                        G$4.state.choices.move.unit = c;
                                        endStage$1();
                                    }
                                },
                                done : f => {
                                    endPhase();
                                    G$4.player.units.map( u => u.moved = 0);
                                }
                            },
                        },
                        place : {
                            next : 'unit',
                            options : f => (G$4.state.choices.move.unit.speed == 2 ) ? Array.from( new Set(G$4.state.places[G$4.state.choices.move.unit.place].adjacent.reduce( (acc,p) => acc.concat(G$4.state.places[p].adjacent), []) ) ) : G$4.state.places[G$4.state.choices.move.unit.place].adjacent,
                            moves : {
                                choose : (np, c) => {
                                    if (np == 'place' && ((G$4.state.choices.move.unit.speed == 2 ) ? Array.from( new Set(G$4.state.places[G$4.state.choices.move.unit.place].adjacent.reduce( (acc,p) => acc.concat(G$4.state.places[p].adjacent), []) ) ) : G$4.state.places[G$4.state.choices.move.unit.place].adjacent).includes(c)) {
                                        G$4.state.choices.move.place = c;
                                        G$4.state.choices.move.unit.gate = 0;
                                        G$4.state.choices.move.unit.place = c;
                                        G$4.state.choices.move.unit.moved = 1;
                                        G$4.player.power--;
                                        G$4.state.choices.move.unit = null;
                                        G$4.state.choices.move.place = null;
                                        H$5.forceRerender();
                                        if (G$4.player.power == 0) {
                                            endPhase();
                                            G$4.player.units.map( u => u.moved = 0);
                                        }
                                        else endStage$1();
                                    }
                                }
                            },
                        },
                    }
            },
            fight : {
                lim: lim$3,
                start : 'place',
                req : f=>Object.keys(G$4.state.places).find( p => G$4.player.units.find( u => u.fight != 0 && u.place == p) && G$4.units.find( u => u.place == p && findPlyr(u.owner).faction.name != G$4.player.faction.name ) ),
                init : f => G$4.state.choices.fight.player = G$4.state.players[G$4.state.turn.pi],
                stages : {
                    place : {
                        next : 'enemy',
                        options : f => Object.keys(G$4.state.places).filter( p => G$4.player.units.filter( u => u.place == p && u.fight != 0 ).length ),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'place' && Object.keys(G$4.state.places).filter( p => G$4.player.units.find( u => u.fight != 0 && u.place == p) && G$4.units.find( u => u.place == p && findPlyr(u.owner).faction.name != G$4.player.faction.name ) ).includes(c) ) {
                                    G$4.state.choices.fight.place = c;
                                    endStage$1();
                                }
                            }
                        },
                    },
                    enemy : {
                        next : 'roll',
                        options : f => G$4.state.players.filter( p => p.faction.name != G$4.player.faction.name && p.units.filter( u => u.place == G$4.state.choices.fight.place).length ),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'enemy' && G$4.state.players.filter( p => p.faction.name != G$4.player.faction.name && p.units.filter( u => u.place == G$4.state.choices.fight.place).length ) /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                    G$4.state.choices.fight.enemy = c;
                                    G$4.player.power--;
                                    endPhase();
                                }
                            }
                        },
                    }, 
                    roll : {
                        next : 'assignpkills',
                        init : f => { 
                            calcDamage(G$4.player);
                            calcDamage(G$4.state.choices.fight.enemy);
                            endPhase();
                        },
                        options : f => [],
                        moves : {
                            choose : (np,c) => {}
                        }
                    },
                    assignpkills : {
                        next : 'assignpretreats',
                        options : f => G$4.player.units.filter( u => u.place == G$4.state.choices.fight.place && (!u?.invulnerable ) ),
                        moves : {
                            choose : (np, c) => {
                                if ( G$4.player.units.filter( u => u.place == G$4.state.choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                    c.place = '';
                                    c.gate = 0;
                                    G$4.player.temp.phase.kills--;
                                    H$5.forceRerender();
                                }
                                if ( !G$4.player.temp.phase.kills || !G$4.player.units.filter( u => u.place == G$4.state.choices.fight.place ).length ) 
                                    endStage$1();
                            }
                        }
                    },
                    assignpretreats : {
                        next : 'placepretreats',
                        options : f => G$4.player.units.filter( u => u.place == G$4.state.choices.fight.place ),
                        moves : {
                            choose : (np, c) => {
                                if ( G$4.player.units.filter( u => u.place == G$4.state.choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                    G$4.choice.fight.unit = c;
                                    endStage$1();
                                }
                            }
                        }
                    },
                    placepretreats : {
                        next : 'assignekills',
                        options : f => G$4.state.places[G$4.state.choices.fight.unit.place].adjacent.filter( p => !G$4.state.choices.fight.enemy.units.map( u => u.place ).includes(p)),
                        moves : {
                            choose : (np, c) => {
                                if ( G$4.state.places[G$4.state.choices.fight.unit.place].adjacent.filter( p => !G$4.state.choices.fight.enemy.units.map( u => u.place ).includes(p)).includes( c ) ) {
                                    G$4.state.choices.fight.unit.place = c;
                                    G$4.player.temp.phase.pains--;
                                    H$5.forceRerender();
                                }
                                if ( !G$4.player.temp.phase.pains || !G$4.player.units.filter( u => u.place == G$4.state.choices.fight.place ).length ) 
                                    endStage$1();
                                else
                                    setStage$1('assignpretreats');
                            }
                        }
                    },
                    assignekills : {
                        next : 'assigneretreats',
                        options : f => G$4.state.choices.fight.enemy.units.filter( u => u.place == G$4.state.choices.fight.place ),
                        moves : {
                            choose : (np, c) => {
                                if ( G$4.state.choices.fight.enemy.units.filter( u => u.place == G$4.state.choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                    c.place = '';
                                    c.gate = 0;
                                    G$4.state.choices.fight.enemy.temp.phase.kills--;
                                    H$5.forceRerender();
                                }
                                if ( !G$4.state.choices.fight.enemy.kills || !G$4.state.choices.fight.enemy.units.filter( u => u.place == G$4.state.choices.fight.place ).length ) 
                                    endStage$1();
                            }
                        }
                    },
                    assigneretreats : {
                        next : 'placeeretreats',
                        options : f => G$4.state.choices.fight.enemy.units.filter( u => u.place == G$4.state.choices.fight.place ),
                        moves : {
                            choose : (np, c) => {
                                if ( G$4.state.choices.fight.enemy.units.filter( u => u.place == G$4.state.choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                    G$4.choice.fight.unit = c;
                                    endStage$1();
                                }
                            }
                        }
                    },
                    placeeretreats : {
                        options : f => G$4.state.places[choices.fight.unit.place].adjacent.filter( p => !G$4.player.units.map( u => u.place ).includes(p)),
                        moves : {
                            choose : (np, c) => {
                                if ( G$4.state.places[choices.fight.unit.place].adjacent.filter( p => !player.units.map( u => u.place ).includes(p)).includes( c ) ) {
                                    G$4.state.choices.fight.unit.place = c;
                                    G$4.state.choices.fight.enemy.temp.phase.pains--;
                                    H$5.forceRerender();
                                }
                                if ( !G$4.state.choices.fight.enemy.pains || !G$4.state.choices.fight.enemy.units.filter( u => u.place == G$4.state.choices.fight.place ).length ) {
                                    endStage$1();
                                    G$4.state.choices.fight.place = null;
                                    G$4.state.choices.fight.enemy = null;
                                    G$4.state.choices.fight.unit = null;
                                } else
                                    setStage$1('assignpretreats');
                            }
                        }
                    }
                }
            },
            hire : {
                lim: lim$3,
                start : 'place',
                req : f => G$4.player.units.find( u => u.type == 'cult' && u.place == '' ),
                stages : {
                    place : {
                        options : f => Array.from( new Set( G$4.player.units.map( u => u.place ) ) ),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'place' && G$4.player.units.map( u => u.place ).includes(c) ) {
                                    G$4.state.choices.hire.place = c;
                                    let u = G$4.player.units.find( u => u.place == '' && u.type == 'cult');
                                    if (!u) setPhase('action');
                                    u.place = c;
                                    G$4.player.power--;
                                    G$4.state.choices.hire.place = null;
                                    endPhase();
                                }
                            }
                        }
                    },
                }
            },
            open : {
                lim: lim$3,
                start : 'place',
                req : f => G$4.player.power > 2 && Object.keys(G$4.state.places).find( p => !G$4.units.find( u => u.gate == p) && G$4.player.units.find( u => u.place == p && u.type == 'cult' ) ),
                stages : {
                    place : {
                        options : f => Object.keys(G$4.state.places).filter( p => !G$4.state.places[p].gate && G$4.player.units.filter( u => u.type == 'cult' ).map( u => u.place ).includes(p) ),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'place' && G$4.player.units.filter( u => u.type == 'cult' ).map( u => u.place ).includes(c) ) {
                                    G$4.state.choices.open.place = c;
                                    G$4.state.places[G$4.state.choices.open.place].gate = 1;
                                    G$4.player.power-=3;
                                    endPhase();
                                }
                            }
                        }
                    },
                }
            },
            summon : {
                lim: lim$3,
                start : 'unit',
                stages : {
                    unit : {
                        next : 'place',
                        options : f => G$4.player.units.filter( u => !G$4.state.places[u.place] && u.tier==1 && ((typeof u.cost == 'function') ? u.cost() : u.cost) <= G$4.player.power),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'unit' && !G$4.state.places[c.place] && c.cost <= G$4.player.power /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                    G$4.state.choices.summon.unit = c;
                                    endStage$1();
                                }
                            },
                            done : f => {
                                endPhase();
                            }
                        },
                    },
                    place : {
                        options : f => G$4.player.units.filter( u => u.gate ).map( u => u.place ),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'place' && G$4.player.units.filter( u => u.gate ).map( u => u.place ).includes(c)) {
                                    G$4.state.choices.summon.place = c;
                                    G$4.state.choices.summon.unit.place = c;
                                    G$4.player.power -= G$4.state.choices.summon.unit.cost;
                                    G$4.state.choices.summon.unit = null;
                                    G$4.state.choices.summon.place = null;
                                    H$5.forceRerender();
                                    endStage$1();
                                }
                            }
                        },
                    },
                }
            },
            // awaken : {
            //     lim,
            //     start : 'unit',
            //     req : f => G.player.units.filter( u => u.tier == 2 && u.place == '' && u.awakenreq()).length,
            //     stages : {
            //         unit : {
            //             next : 'place',
            //             options : f => G.player.units.filter( u => u.tier==2 && u.awakenreq()),
            //             moves : {
            //                 choose : (np, c) => {
            //                     if (np == 'unit' && G.player.units.filter( u => u.tier==2 && u.awakenreq()).includes(c)) {
            //                         G.state.choices.awaken.unit = c
            //                         endStage()
            //                     }
            //                 },
            //                 done : f => {
            //                     endPhase()
            //                 }
            //             },
            //         },
            //         place : {
            //             options : f => G.state.choices.awaken.unit.awakenplaces(),
            //             moves : {
            //                 choose : (np, c) => {
            //                     if (np == 'place' && G.state.choices.awaken.unit.awakenplaces().includes(c)) {
            //                         G.state.choices.awaken.place = c
            //                         G.state.choices.awaken.unit.place = c
            //                         // G.player.power -= G.state.choices.awaken.unit.cost
            //                         // G.state.choices.awaken.unit = null
            //                         // G.state.choices.awaken.place = null
            //                         G.state.choices.awaken.unit.cost()
            //                         H.forceRerender()
            //                         // endStage()
            //                     }
            //                 }
            //             },
            //         },
            //     }
            // },
            awaken : {
                lim: lim$3,
                start : 'unit',
                req : f => G$4.player.units.filter( u => u.tier == 2 && u.place == '' && H$5[u.type].awakenreq()).length,
                stages : {
                    unit : {
                        next : 'place',
                        options : f => G$4.player.units.filter( u => u.tier==2 && H$5[u.type].awakenreq()),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'unit' && G$4.player.units.filter( u => u.tier==2 && H$5[u.type].awakenreq()).includes(c)) {
                                    G$4.state.choices.awaken.unit = c;
                                    endStage$1();
                                }
                            },
                            done : f => {
                                endPhase();
                            }
                        },
                    },
                    place : {
                        options : f => H$5[G$4.state.choices.awaken.unit.type].awakenplaces(),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'place' && H$5[G$4.state.choices.awaken.unit.type].awakenplaces().includes(c)) {
                                    G$4.state.choices.awaken.place = c;
                                    G$4.state.choices.awaken.unit.place = c;
                                    H$5[G$4.state.choices.awaken.unit.type].cost();
                                    H$5.forceRerender();
                                }
                            }
                        },
                    },
                }
            },
            steal : {
                lim: lim$3,
                start : 'place',
                req : f => Object.keys(G$4.state.places).filter( p =>stealableUnitsIn(p).length ).length,
                stages : {
                    place : {
                        next : 'unit',
                        options : f => Object.keys(G$4.state.places).filter( p =>stealableUnitsIn(p).length ),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'place' && stealableUnitsIn(c).length ) {
                                    G$4.state.choices.steal.place = c;
                                    G$4.state.choices.steal.gate = 0;
                                    endStage$1();
                                }
                            }
                        },
                    },
                    unit : {
                        options : f => stealableUnitsIn(G$4.state.choices.steal.place),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'unit' && stealableUnitsIn(G$4.state.choices.steal.place).map( u => u.id).includes(c.id) /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                    G$4.state.choices.steal.unit = c;
                                    c.place = G$4.player.faction.name;
                                    G$4.state.choices.steal.unit = null;
                                    G$4.state.choices.steal.place = null;
                                    endPhase();
                                }
                            }
                        },
                    },
                }
            },
            // book : {
            //     start : 'book',
            //     stages : {
            //         book : {
            //             options : f => G.player.faction.books,
            //             moves : {
            //                 choose : (np, c) => {
            //                     if (np == 'book' && G.player.faction.books.includes(c) ) {
            //                         G.state.choices.book.book = c
            //                         G.player.books = [...G.player.books, c ]
            //                         G.player.faction.bookreqs = G.player.faction.bookreqs.filter( b => !b['waiting...'])
            //                         G.player.faction.books = G.player.faction.books.filter( b => b != G.state.choices.book.book)
            //                         G.player.faction.bookinit[c]()
            //                         returnStage()
            //                     }
            //                 }
            //             },
            //         },
            //     }
            // },
            book : {
                start : 'book',
                stages : {
                    book : {
                        options : f => G$4.player.faction.books,
                        moves : {
                            choose : (np, c) => {
                                if (np == 'book' && G$4.player.faction.books.includes(c) ) {
                                    G$4.state.choices.book.book = c;
                                    G$4.player.books = [...G$4.player.books, c ];
                                    G$4.player.faction.bookreqs = G$4.player.faction.bookreqs.filter( b => b != 'waiting...');
                                    G$4.player.faction.books = G$4.player.faction.books.filter( b => b != G$4.state.choices.book.book);
                                    H$5[c]();
                                    returnStage();
                                }
                            }
                        },
                    },
                }
            },
        }
    };

    /* src\components\cw\Game.svelte generated by Svelte v3.29.0 */

    const { Map: Map_1$1, Object: Object_1, console: console_1 } = globals;
    const file$7 = "src\\components\\cw\\Game.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (119:193) {#each G.state.players as player (player.faction.name)}
    function create_each_block_1$2(key_1, ctx) {
    	let first;
    	let player_1;
    	let current;

    	player_1 = new Player({
    			props: {
    				choose: H.choose,
    				player: /*player*/ ctx[3],
    				G: /*G*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(player_1.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(player_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const player_1_changes = {};
    			if (dirty & /*G*/ 1) player_1_changes.player = /*player*/ ctx[3];
    			if (dirty & /*G*/ 1) player_1_changes.G = /*G*/ ctx[0];
    			player_1.$set(player_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(player_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(player_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(player_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(119:193) {#each G.state.players as player (player.faction.name)}",
    		ctx
    	});

    	return block;
    }

    // (119:797) {:else}
    function create_else_block$1(ctx) {
    	let li;
    	let t_value = /*action*/ ctx[19] + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-11jcp7s");
    			add_location(li, file$7, 118, 804, 5303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					li,
    					"click",
    					function () {
    						if (is_function(/*click*/ ctx[2](/*action*/ ctx[19]))) /*click*/ ctx[2](/*action*/ ctx[19]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*G*/ 1 && t_value !== (t_value = /*action*/ ctx[19] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(119:797) {:else}",
    		ctx
    	});

    	return block;
    }

    // (119:703) 
    function create_if_block_3(ctx) {
    	let li;
    	let t_value = /*action*/ ctx[19].faction.name + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			set_style(li, "color", /*action*/ ctx[19].faction.color);
    			attr_dev(li, "class", "svelte-11jcp7s");
    			add_location(li, file$7, 118, 703, 5202);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					li,
    					"click",
    					function () {
    						if (is_function(/*click*/ ctx[2](/*action*/ ctx[19]))) /*click*/ ctx[2](/*action*/ ctx[19]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*G*/ 1 && t_value !== (t_value = /*action*/ ctx[19].faction.name + "")) set_data_dev(t, t_value);

    			if (dirty & /*G*/ 1) {
    				set_style(li, "color", /*action*/ ctx[19].faction.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(119:703) ",
    		ctx
    	});

    	return block;
    }

    // (119:422) {#if G.state.stage.includes("unit")}
    function create_if_block_2(ctx) {
    	let li;
    	let t0_value = /*action*/ ctx[19].type + "";
    	let t0;
    	let t1;
    	let t2_value = (/*action*/ ctx[19].place || "pool") + "";
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" in ");
    			t2 = text(t2_value);
    			set_style(li, "color", H.findPlyr(/*action*/ ctx[19].owner).faction.color);
    			attr_dev(li, "class", "svelte-11jcp7s");
    			add_location(li, file$7, 118, 458, 4957);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);

    			if (!mounted) {
    				dispose = listen_dev(
    					li,
    					"click",
    					function () {
    						if (is_function(/*click*/ ctx[2](/*action*/ ctx[19]))) /*click*/ ctx[2](/*action*/ ctx[19]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*G*/ 1 && t0_value !== (t0_value = /*action*/ ctx[19].type + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*G*/ 1 && t2_value !== (t2_value = (/*action*/ ctx[19].place || "pool") + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*G*/ 1) {
    				set_style(li, "color", H.findPlyr(/*action*/ ctx[19].owner).faction.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(119:422) {#if G.state.stage.includes(\\\"unit\\\")}",
    		ctx
    	});

    	return block;
    }

    // (119:395) {#each G.actions as action}
    function create_each_block$2(ctx) {
    	let show_if;
    	let show_if_1;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*G*/ 1) show_if = !!/*G*/ ctx[0].state.stage.includes("unit");
    		if (show_if) return create_if_block_2;
    		if (show_if_1 == null || dirty & /*G*/ 1) show_if_1 = !!(/*G*/ ctx[0].state.stage.includes("player") || /*G*/ ctx[0].state.stage.includes("enemy") || /*G*/ ctx[0].state.stage.includes("faction"));
    		if (show_if_1) return create_if_block_3;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(119:395) {#each G.actions as action}",
    		ctx
    	});

    	return block;
    }

    // (119:1068) 
    function create_if_block_1(ctx) {
    	let li;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "done";
    			attr_dev(li, "class", "svelte-11jcp7s");
    			add_location(li, file$7, 118, 1068, 5567);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					li,
    					"click",
    					function () {
    						if (is_function(/*clientCheck*/ ctx[1](/*G*/ ctx[0].phases[/*G*/ ctx[0].state.phase].moves.done))) /*clientCheck*/ ctx[1](/*G*/ ctx[0].phases[/*G*/ ctx[0].state.phase].moves.done).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(119:1068) ",
    		ctx
    	});

    	return block;
    }

    // (119:860) {#if G.phases[G.state.phase]?.stages[G.state.stage]?.moves?.done}
    function create_if_block$3(ctx) {
    	let li;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "done";
    			attr_dev(li, "class", "svelte-11jcp7s");
    			add_location(li, file$7, 118, 925, 5424);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					li,
    					"click",
    					function () {
    						if (is_function(/*clientCheck*/ ctx[1](/*G*/ ctx[0].phases[/*G*/ ctx[0].state.phase].stages[/*G*/ ctx[0].state.stage].moves.done))) /*clientCheck*/ ctx[1](/*G*/ ctx[0].phases[/*G*/ ctx[0].state.phase].stages[/*G*/ ctx[0].state.stage].moves.done).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(119:860) {#if G.phases[G.state.phase]?.stages[G.state.stage]?.moves?.done}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div0;
    	let map;
    	let div2;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map_1$1();
    	let div1;
    	let t;
    	let ul;
    	let each1_anchor;
    	let current;

    	map = new Map$1({
    			props: {
    				choose: H.choose,
    				units: /*G*/ ctx[0].units,
    				places: /*G*/ ctx[0].state.places
    			},
    			$$inline: true
    		});

    	let each_value_1 = /*G*/ ctx[0].state.players;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*player*/ ctx[3].faction.name;
    	validate_each_keys(ctx, each_value_1, get_each_context_1$2, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$2(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1$2(key, child_ctx));
    	}

    	let each_value = /*G*/ ctx[0].actions;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	function select_block_type_1(ctx, dirty) {
    		if (/*G*/ ctx[0].phases[/*G*/ ctx[0].state.phase]?.stages[/*G*/ ctx[0].state.stage]?.moves?.done) return create_if_block$3;
    		if (/*G*/ ctx[0].phases[/*G*/ ctx[0].state.phase]?.moves?.done) return create_if_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(map.$$.fragment);
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			div1 = element("div");
    			t = text("actions");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "tooltip hidden");
    			set_style(div0, "position", "absolute");
    			set_style(div0, "background", "black");
    			set_style(div0, "width", "10em");
    			set_style(div0, "z-index", "100");
    			add_location(div0, file$7, 118, 0, 4499);
    			set_style(ul, "padding", "0");
    			attr_dev(ul, "class", "svelte-11jcp7s");
    			add_location(ul, file$7, 118, 373, 4872);
    			attr_dev(div1, "class", "actions svelte-11jcp7s");
    			set_style(div1, "color", /*G*/ ctx[0].player.faction.color);
    			add_location(div1, file$7, 118, 305, 4804);
    			attr_dev(div2, "class", "hud svelte-11jcp7s");
    			add_location(div2, file$7, 118, 176, 4675);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(map, target, anchor);
    			insert_dev(target, div2, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div2, div1);
    			append_dev(div1, t);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, each1_anchor);
    			if (if_block) if_block.m(ul, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const map_changes = {};
    			if (dirty & /*G*/ 1) map_changes.units = /*G*/ ctx[0].units;
    			if (dirty & /*G*/ 1) map_changes.places = /*G*/ ctx[0].state.places;
    			map.$set(map_changes);

    			if (dirty & /*H, G*/ 1) {
    				const each_value_1 = /*G*/ ctx[0].state.players;
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1$2, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div2, outro_and_destroy_block, create_each_block_1$2, div1, get_each_context_1$2);
    				check_outros();
    			}

    			if (dirty & /*H, G, click*/ 5) {
    				each_value = /*G*/ ctx[0].actions;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, each1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(ul, null);
    				}
    			}

    			if (!current || dirty & /*G*/ 1) {
    				set_style(div1, "color", /*G*/ ctx[0].player.faction.color);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(map.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(map.$$.fragment, local);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(map, detaching);
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			destroy_each(each_blocks, detaching);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Game", slots, []);

    	let firebaseConfig = {
    		apiKey: "AIzaSyAtutNxHpxtCJi3EUB3irfhNiTfoMu1zLY",
    		authDomain: "cw-wars.firebaseapp.com",
    		databaseURL: "https://cw-wars-default-rtdb.firebaseio.com",
    		projectId: "cw-wars",
    		storageBucket: "cw-wars.appspot.com",
    		messagingSenderId: "311965598360",
    		appId: "1:311965598360:web:b4f0ff76188930035e86ed"
    	};

    	firebase.initializeApp(firebaseConfig);
    	let client = new URLSearchParams(window.location.search).get("faction") || "observer";

    	let helpers = {
    		"waiting...": f => false,
    		findPlyr: name => G.state.players.find(p => p.faction.name == name),
    		forceRerender: () => {
    			H.push();
    			$$invalidate(0, G);
    		},
    		initGame: () => {
    			$$invalidate(
    				0,
    				G.ritualtracks = {
    					3: [5, 6, 7, 8, 9, 10],
    					4: [5, 6, 7, 7, 8, 8, 9, 10],
    					5: [5, 6, 6, 7, 7, 8, 8, 9, 9, 10]
    				},
    				G
    			);

    			$$invalidate(0, G.rituals = 0, G);
    			phases.init(G, helpers);
    			factions(G, phases, helpers);

    			$$invalidate(
    				0,
    				G.state.players = Object.values(G.factions).map(f => ({
    					units: [],
    					faction: f,
    					doom: 0,
    					power: 8,
    					books: [],
    					temp: {}
    				})),
    				G
    			);

    			G.state.players.map(p => {
    				p.units = Array(6).fill(null).map(u => helpers.unit("cult", p.faction.name, p.faction.start));
    				p.units[2].gate = p.faction.start;
    				places[p.faction.start].gate = 1;
    				p.faction.initUnits(p);
    			});

    			$$invalidate(
    				0,
    				G.state.turn = {
    					lim: 1,
    					pi: G.state.players.indexOf(helpers.findPlyr("gc")) || 0
    				},
    				G
    			);

    			$$invalidate(0, G.state.phase = "action", G);
    			$$invalidate(0, G.state.stage = "start", G);
    		},
    		log: f => console.log(G, H, phases),
    		push: f => {
    			firebase.database().ref("game/" + 1).set(JSON.stringify({ ...G.state, sender: client }));
    		},
    		pull: f => firebase.database().ref("game/" + 1).on("value", g => {
    			if (JSON.parse(g.val()).sender == client) return;
    			let books = [];

    			JSON.parse(g.val()).players.map(p => p.books.map(b => {
    				if (!H.findPlyr(p.faction.name).books.includes(b)) books.push[b];
    			}));

    			$$invalidate(0, G.state = JSON.parse(g.val()), G);
    			books.map(b => H[b]());
    		}),
    		newGame: () => {
    			H.initGame(G);
    			H.push();
    		},
    		genId: () => {
    			
    		},
    		unit: (type = "", owner = {}, place = "", cost = 0, fight = 0, tier = 0, gather = 0) => ({
    			id: genid(),
    			type,
    			owner,
    			place,
    			cost,
    			fight,
    			gather,
    			tier,
    			gate: 0
    		})
    	};

    	window.H = helpers;
    	let genid = f => nonce++;
    	let players, turn, phase, stage, choices, units, player, nonce = 0;

    	let G = {
    		phases,
    		player,
    		units,
    		state: {
    			choices,
    			players,
    			places,
    			phases,
    			turn,
    			phase,
    			stage
    		}
    	};

    	helpers.initGame();
    	H.pull();
    	let actions = [];

    	let choose = x => {
    		
    	};

    	let noop = (np, c) => {
    		
    	};

    	let clientCheck = func => () => {
    		if (G.player.faction.name == client) func();
    	};

    	let click = action => f => {
    		if (G.player.faction.name == client) H.choose(G.state.stage, action);
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Map: Map$1,
    		Player,
    		places,
    		factions,
    		phases,
    		Unit,
    		faction,
    		firebaseConfig,
    		client,
    		helpers,
    		genid,
    		players,
    		turn,
    		phase,
    		stage,
    		choices,
    		units,
    		player,
    		nonce,
    		G,
    		actions,
    		choose,
    		noop,
    		clientCheck,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("firebaseConfig" in $$props) firebaseConfig = $$props.firebaseConfig;
    		if ("client" in $$props) client = $$props.client;
    		if ("helpers" in $$props) helpers = $$props.helpers;
    		if ("genid" in $$props) genid = $$props.genid;
    		if ("players" in $$props) players = $$props.players;
    		if ("turn" in $$props) turn = $$props.turn;
    		if ("phase" in $$props) phase = $$props.phase;
    		if ("stage" in $$props) stage = $$props.stage;
    		if ("choices" in $$props) choices = $$props.choices;
    		if ("units" in $$props) units = $$props.units;
    		if ("player" in $$props) $$invalidate(3, player = $$props.player);
    		if ("nonce" in $$props) nonce = $$props.nonce;
    		if ("G" in $$props) $$invalidate(0, G = $$props.G);
    		if ("actions" in $$props) actions = $$props.actions;
    		if ("choose" in $$props) choose = $$props.choose;
    		if ("noop" in $$props) $$invalidate(18, noop = $$props.noop);
    		if ("clientCheck" in $$props) $$invalidate(1, clientCheck = $$props.clientCheck);
    		if ("click" in $$props) $$invalidate(2, click = $$props.click);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*G*/ 1) {
    			 $$invalidate(0, G.player = G.state.players[G.state.turn.pi % G.state.players.length], G);
    		}

    		if ($$self.$$.dirty & /*G*/ 1) {
    			 $$invalidate(0, G.units = G.state.players.reduce((acc, cur) => [...acc, ...cur.units], []), G);
    		}

    		if ($$self.$$.dirty & /*G*/ 1) {
    			 $$invalidate(0, G.ritualcost = G.ritualtracks[G.state.players.length][G.rituals], G);
    		}

    		if ($$self.$$.dirty & /*G*/ 1) {
    			 $$invalidate(
    				0,
    				G.actions = G.state.stage == ""
    				? G.phases[G.state.phase]?.options() || []
    				: G.phases[G.state.phase].stages[G.state.stage]?.options() || [],
    				G
    			);
    		}

    		if ($$self.$$.dirty & /*G*/ 1) {
    			 H.choose = (G.state.stage == ""
    			? G.phases[G.state.phase]?.moves?.choose || noop
    			: G.phases[G.state.phase].stages[G.state.stage]?.moves?.choose) || noop;
    		}
    	};

    	return [G, clientCheck, click, player];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.29.0 */
    const file$8 = "src\\App.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let game;
    	let current;
    	game = new Game({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(game.$$.fragment);
    			attr_dev(div, "class", "world svelte-1mhq47q");
    			add_location(div, file$8, 9, 0, 225);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(game, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(game.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(game.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(game);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Game });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    //import linksResources from './resources/linksResources';

    const app = new App({
    	target: document.body,
    	props: {
    		// try to comment out the line below and see what happens on save
    		// name: 'friend', 
    		//links: linksResources,
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.ReactTypeahead=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

function classNames() {
	var classes = '';
	var arg;

	for (var i = 0; i < arguments.length; i++) {
		arg = arguments[i];
		if (!arg) {
			continue;
		}

		if ('string' === typeof arg || 'number' === typeof arg) {
			classes += ' ' + arg;
		} else if (Object.prototype.toString.call(arg) === '[object Array]') {
			classes += ' ' + classNames.apply(null, arg);
		} else if ('object' === typeof arg) {
			for (var key in arg) {
				if (!arg.hasOwnProperty(key) || !arg[key]) {
					continue;
				}
				classes += ' ' + key;
			}
		}
	}
	return classes.substr(1);
}

// safely export classNames for node / browserify
if (typeof module !== 'undefined' && module.exports) {
	module.exports = classNames;
}

// safely export classNames for RequireJS
if (typeof define !== 'undefined' && define.amd) {
	define('classnames', [], function() {
		return classNames;
	});
}

},{}],2:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

var _assign = require('object-assign');

var emptyObject = require('fbjs/lib/emptyObject');
var _invariant = require('fbjs/lib/invariant');

if (process.env.NODE_ENV !== 'production') {
  var warning = require('fbjs/lib/warning');
}

var MIXINS_KEY = 'mixins';

// Helper function to allow the creation of anonymous functions which do not
// have .name set to the name of the variable being assigned to.
function identity(fn) {
  return fn;
}

var ReactPropTypeLocationNames;
if (process.env.NODE_ENV !== 'production') {
  ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };
} else {
  ReactPropTypeLocationNames = {};
}

function factory(ReactComponent, isValidElement, ReactNoopUpdateQueue) {
  /**
   * Policies that describe methods in `ReactClassInterface`.
   */

  var injectedMixins = [];

  /**
   * Composite components are higher-level components that compose other composite
   * or host components.
   *
   * To create a new type of `ReactClass`, pass a specification of
   * your new class to `React.createClass`. The only requirement of your class
   * specification is that you implement a `render` method.
   *
   *   var MyComponent = React.createClass({
   *     render: function() {
   *       return <div>Hello World</div>;
   *     }
   *   });
   *
   * The class specification supports a specific protocol of methods that have
   * special meaning (e.g. `render`). See `ReactClassInterface` for
   * more the comprehensive protocol. Any other properties and methods in the
   * class specification will be available on the prototype.
   *
   * @interface ReactClassInterface
   * @internal
   */
  var ReactClassInterface = {
    /**
     * An array of Mixin objects to include when defining your component.
     *
     * @type {array}
     * @optional
     */
    mixins: 'DEFINE_MANY',

    /**
     * An object containing properties and methods that should be defined on
     * the component's constructor instead of its prototype (static methods).
     *
     * @type {object}
     * @optional
     */
    statics: 'DEFINE_MANY',

    /**
     * Definition of prop types for this component.
     *
     * @type {object}
     * @optional
     */
    propTypes: 'DEFINE_MANY',

    /**
     * Definition of context types for this component.
     *
     * @type {object}
     * @optional
     */
    contextTypes: 'DEFINE_MANY',

    /**
     * Definition of context types this component sets for its children.
     *
     * @type {object}
     * @optional
     */
    childContextTypes: 'DEFINE_MANY',

    // ==== Definition methods ====

    /**
     * Invoked when the component is mounted. Values in the mapping will be set on
     * `this.props` if that prop is not specified (i.e. using an `in` check).
     *
     * This method is invoked before `getInitialState` and therefore cannot rely
     * on `this.state` or use `this.setState`.
     *
     * @return {object}
     * @optional
     */
    getDefaultProps: 'DEFINE_MANY_MERGED',

    /**
     * Invoked once before the component is mounted. The return value will be used
     * as the initial value of `this.state`.
     *
     *   getInitialState: function() {
     *     return {
     *       isOn: false,
     *       fooBaz: new BazFoo()
     *     }
     *   }
     *
     * @return {object}
     * @optional
     */
    getInitialState: 'DEFINE_MANY_MERGED',

    /**
     * @return {object}
     * @optional
     */
    getChildContext: 'DEFINE_MANY_MERGED',

    /**
     * Uses props from `this.props` and state from `this.state` to render the
     * structure of the component.
     *
     * No guarantees are made about when or how often this method is invoked, so
     * it must not have side effects.
     *
     *   render: function() {
     *     var name = this.props.name;
     *     return <div>Hello, {name}!</div>;
     *   }
     *
     * @return {ReactComponent}
     * @required
     */
    render: 'DEFINE_ONCE',

    // ==== Delegate methods ====

    /**
     * Invoked when the component is initially created and about to be mounted.
     * This may have side effects, but any external subscriptions or data created
     * by this method must be cleaned up in `componentWillUnmount`.
     *
     * @optional
     */
    componentWillMount: 'DEFINE_MANY',

    /**
     * Invoked when the component has been mounted and has a DOM representation.
     * However, there is no guarantee that the DOM node is in the document.
     *
     * Use this as an opportunity to operate on the DOM when the component has
     * been mounted (initialized and rendered) for the first time.
     *
     * @param {DOMElement} rootNode DOM element representing the component.
     * @optional
     */
    componentDidMount: 'DEFINE_MANY',

    /**
     * Invoked before the component receives new props.
     *
     * Use this as an opportunity to react to a prop transition by updating the
     * state using `this.setState`. Current props are accessed via `this.props`.
     *
     *   componentWillReceiveProps: function(nextProps, nextContext) {
     *     this.setState({
     *       likesIncreasing: nextProps.likeCount > this.props.likeCount
     *     });
     *   }
     *
     * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
     * transition may cause a state change, but the opposite is not true. If you
     * need it, you are probably looking for `componentWillUpdate`.
     *
     * @param {object} nextProps
     * @optional
     */
    componentWillReceiveProps: 'DEFINE_MANY',

    /**
     * Invoked while deciding if the component should be updated as a result of
     * receiving new props, state and/or context.
     *
     * Use this as an opportunity to `return false` when you're certain that the
     * transition to the new props/state/context will not require a component
     * update.
     *
     *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
     *     return !equal(nextProps, this.props) ||
     *       !equal(nextState, this.state) ||
     *       !equal(nextContext, this.context);
     *   }
     *
     * @param {object} nextProps
     * @param {?object} nextState
     * @param {?object} nextContext
     * @return {boolean} True if the component should update.
     * @optional
     */
    shouldComponentUpdate: 'DEFINE_ONCE',

    /**
     * Invoked when the component is about to update due to a transition from
     * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
     * and `nextContext`.
     *
     * Use this as an opportunity to perform preparation before an update occurs.
     *
     * NOTE: You **cannot** use `this.setState()` in this method.
     *
     * @param {object} nextProps
     * @param {?object} nextState
     * @param {?object} nextContext
     * @param {ReactReconcileTransaction} transaction
     * @optional
     */
    componentWillUpdate: 'DEFINE_MANY',

    /**
     * Invoked when the component's DOM representation has been updated.
     *
     * Use this as an opportunity to operate on the DOM when the component has
     * been updated.
     *
     * @param {object} prevProps
     * @param {?object} prevState
     * @param {?object} prevContext
     * @param {DOMElement} rootNode DOM element representing the component.
     * @optional
     */
    componentDidUpdate: 'DEFINE_MANY',

    /**
     * Invoked when the component is about to be removed from its parent and have
     * its DOM representation destroyed.
     *
     * Use this as an opportunity to deallocate any external resources.
     *
     * NOTE: There is no `componentDidUnmount` since your component will have been
     * destroyed by that point.
     *
     * @optional
     */
    componentWillUnmount: 'DEFINE_MANY',

    /**
     * Replacement for (deprecated) `componentWillMount`.
     *
     * @optional
     */
    UNSAFE_componentWillMount: 'DEFINE_MANY',

    /**
     * Replacement for (deprecated) `componentWillReceiveProps`.
     *
     * @optional
     */
    UNSAFE_componentWillReceiveProps: 'DEFINE_MANY',

    /**
     * Replacement for (deprecated) `componentWillUpdate`.
     *
     * @optional
     */
    UNSAFE_componentWillUpdate: 'DEFINE_MANY',

    // ==== Advanced methods ====

    /**
     * Updates the component's currently mounted DOM representation.
     *
     * By default, this implements React's rendering and reconciliation algorithm.
     * Sophisticated clients may wish to override this.
     *
     * @param {ReactReconcileTransaction} transaction
     * @internal
     * @overridable
     */
    updateComponent: 'OVERRIDE_BASE'
  };

  /**
   * Similar to ReactClassInterface but for static methods.
   */
  var ReactClassStaticInterface = {
    /**
     * This method is invoked after a component is instantiated and when it
     * receives new props. Return an object to update state in response to
     * prop changes. Return null to indicate no change to state.
     *
     * If an object is returned, its keys will be merged into the existing state.
     *
     * @return {object || null}
     * @optional
     */
    getDerivedStateFromProps: 'DEFINE_MANY_MERGED'
  };

  /**
   * Mapping from class specification keys to special processing functions.
   *
   * Although these are declared like instance properties in the specification
   * when defining classes using `React.createClass`, they are actually static
   * and are accessible on the constructor instead of the prototype. Despite
   * being static, they must be defined outside of the "statics" key under
   * which all other static methods are defined.
   */
  var RESERVED_SPEC_KEYS = {
    displayName: function(Constructor, displayName) {
      Constructor.displayName = displayName;
    },
    mixins: function(Constructor, mixins) {
      if (mixins) {
        for (var i = 0; i < mixins.length; i++) {
          mixSpecIntoComponent(Constructor, mixins[i]);
        }
      }
    },
    childContextTypes: function(Constructor, childContextTypes) {
      if (process.env.NODE_ENV !== 'production') {
        validateTypeDef(Constructor, childContextTypes, 'childContext');
      }
      Constructor.childContextTypes = _assign(
        {},
        Constructor.childContextTypes,
        childContextTypes
      );
    },
    contextTypes: function(Constructor, contextTypes) {
      if (process.env.NODE_ENV !== 'production') {
        validateTypeDef(Constructor, contextTypes, 'context');
      }
      Constructor.contextTypes = _assign(
        {},
        Constructor.contextTypes,
        contextTypes
      );
    },
    /**
     * Special case getDefaultProps which should move into statics but requires
     * automatic merging.
     */
    getDefaultProps: function(Constructor, getDefaultProps) {
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps = createMergedResultFunction(
          Constructor.getDefaultProps,
          getDefaultProps
        );
      } else {
        Constructor.getDefaultProps = getDefaultProps;
      }
    },
    propTypes: function(Constructor, propTypes) {
      if (process.env.NODE_ENV !== 'production') {
        validateTypeDef(Constructor, propTypes, 'prop');
      }
      Constructor.propTypes = _assign({}, Constructor.propTypes, propTypes);
    },
    statics: function(Constructor, statics) {
      mixStaticSpecIntoComponent(Constructor, statics);
    },
    autobind: function() {}
  };

  function validateTypeDef(Constructor, typeDef, location) {
    for (var propName in typeDef) {
      if (typeDef.hasOwnProperty(propName)) {
        // use a warning instead of an _invariant so components
        // don't show up in prod but only in __DEV__
        if (process.env.NODE_ENV !== 'production') {
          warning(
            typeof typeDef[propName] === 'function',
            '%s: %s type `%s` is invalid; it must be a function, usually from ' +
              'React.PropTypes.',
            Constructor.displayName || 'ReactClass',
            ReactPropTypeLocationNames[location],
            propName
          );
        }
      }
    }
  }

  function validateMethodOverride(isAlreadyDefined, name) {
    var specPolicy = ReactClassInterface.hasOwnProperty(name)
      ? ReactClassInterface[name]
      : null;

    // Disallow overriding of base class methods unless explicitly allowed.
    if (ReactClassMixin.hasOwnProperty(name)) {
      _invariant(
        specPolicy === 'OVERRIDE_BASE',
        'ReactClassInterface: You are attempting to override ' +
          '`%s` from your class specification. Ensure that your method names ' +
          'do not overlap with React methods.',
        name
      );
    }

    // Disallow defining methods more than once unless explicitly allowed.
    if (isAlreadyDefined) {
      _invariant(
        specPolicy === 'DEFINE_MANY' || specPolicy === 'DEFINE_MANY_MERGED',
        'ReactClassInterface: You are attempting to define ' +
          '`%s` on your component more than once. This conflict may be due ' +
          'to a mixin.',
        name
      );
    }
  }

  /**
   * Mixin helper which handles policy validation and reserved
   * specification keys when building React classes.
   */
  function mixSpecIntoComponent(Constructor, spec) {
    if (!spec) {
      if (process.env.NODE_ENV !== 'production') {
        var typeofSpec = typeof spec;
        var isMixinValid = typeofSpec === 'object' && spec !== null;

        if (process.env.NODE_ENV !== 'production') {
          warning(
            isMixinValid,
            "%s: You're attempting to include a mixin that is either null " +
              'or not an object. Check the mixins included by the component, ' +
              'as well as any mixins they include themselves. ' +
              'Expected object but got %s.',
            Constructor.displayName || 'ReactClass',
            spec === null ? null : typeofSpec
          );
        }
      }

      return;
    }

    _invariant(
      typeof spec !== 'function',
      "ReactClass: You're attempting to " +
        'use a component class or function as a mixin. Instead, just use a ' +
        'regular object.'
    );
    _invariant(
      !isValidElement(spec),
      "ReactClass: You're attempting to " +
        'use a component as a mixin. Instead, just use a regular object.'
    );

    var proto = Constructor.prototype;
    var autoBindPairs = proto.__reactAutoBindPairs;

    // By handling mixins before any other properties, we ensure the same
    // chaining order is applied to methods with DEFINE_MANY policy, whether
    // mixins are listed before or after these methods in the spec.
    if (spec.hasOwnProperty(MIXINS_KEY)) {
      RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
    }

    for (var name in spec) {
      if (!spec.hasOwnProperty(name)) {
        continue;
      }

      if (name === MIXINS_KEY) {
        // We have already handled mixins in a special case above.
        continue;
      }

      var property = spec[name];
      var isAlreadyDefined = proto.hasOwnProperty(name);
      validateMethodOverride(isAlreadyDefined, name);

      if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
        RESERVED_SPEC_KEYS[name](Constructor, property);
      } else {
        // Setup methods on prototype:
        // The following member methods should not be automatically bound:
        // 1. Expected ReactClass methods (in the "interface").
        // 2. Overridden methods (that were mixed in).
        var isReactClassMethod = ReactClassInterface.hasOwnProperty(name);
        var isFunction = typeof property === 'function';
        var shouldAutoBind =
          isFunction &&
          !isReactClassMethod &&
          !isAlreadyDefined &&
          spec.autobind !== false;

        if (shouldAutoBind) {
          autoBindPairs.push(name, property);
          proto[name] = property;
        } else {
          if (isAlreadyDefined) {
            var specPolicy = ReactClassInterface[name];

            // These cases should already be caught by validateMethodOverride.
            _invariant(
              isReactClassMethod &&
                (specPolicy === 'DEFINE_MANY_MERGED' ||
                  specPolicy === 'DEFINE_MANY'),
              'ReactClass: Unexpected spec policy %s for key %s ' +
                'when mixing in component specs.',
              specPolicy,
              name
            );

            // For methods which are defined more than once, call the existing
            // methods before calling the new property, merging if appropriate.
            if (specPolicy === 'DEFINE_MANY_MERGED') {
              proto[name] = createMergedResultFunction(proto[name], property);
            } else if (specPolicy === 'DEFINE_MANY') {
              proto[name] = createChainedFunction(proto[name], property);
            }
          } else {
            proto[name] = property;
            if (process.env.NODE_ENV !== 'production') {
              // Add verbose displayName to the function, which helps when looking
              // at profiling tools.
              if (typeof property === 'function' && spec.displayName) {
                proto[name].displayName = spec.displayName + '_' + name;
              }
            }
          }
        }
      }
    }
  }

  function mixStaticSpecIntoComponent(Constructor, statics) {
    if (!statics) {
      return;
    }

    for (var name in statics) {
      var property = statics[name];
      if (!statics.hasOwnProperty(name)) {
        continue;
      }

      var isReserved = name in RESERVED_SPEC_KEYS;
      _invariant(
        !isReserved,
        'ReactClass: You are attempting to define a reserved ' +
          'property, `%s`, that shouldn\'t be on the "statics" key. Define it ' +
          'as an instance property instead; it will still be accessible on the ' +
          'constructor.',
        name
      );

      var isAlreadyDefined = name in Constructor;
      if (isAlreadyDefined) {
        var specPolicy = ReactClassStaticInterface.hasOwnProperty(name)
          ? ReactClassStaticInterface[name]
          : null;

        _invariant(
          specPolicy === 'DEFINE_MANY_MERGED',
          'ReactClass: You are attempting to define ' +
            '`%s` on your component more than once. This conflict may be ' +
            'due to a mixin.',
          name
        );

        Constructor[name] = createMergedResultFunction(Constructor[name], property);

        return;
      }

      Constructor[name] = property;
    }
  }

  /**
   * Merge two objects, but throw if both contain the same key.
   *
   * @param {object} one The first object, which is mutated.
   * @param {object} two The second object
   * @return {object} one after it has been mutated to contain everything in two.
   */
  function mergeIntoWithNoDuplicateKeys(one, two) {
    _invariant(
      one && two && typeof one === 'object' && typeof two === 'object',
      'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.'
    );

    for (var key in two) {
      if (two.hasOwnProperty(key)) {
        _invariant(
          one[key] === undefined,
          'mergeIntoWithNoDuplicateKeys(): ' +
            'Tried to merge two objects with the same key: `%s`. This conflict ' +
            'may be due to a mixin; in particular, this may be caused by two ' +
            'getInitialState() or getDefaultProps() methods returning objects ' +
            'with clashing keys.',
          key
        );
        one[key] = two[key];
      }
    }
    return one;
  }

  /**
   * Creates a function that invokes two functions and merges their return values.
   *
   * @param {function} one Function to invoke first.
   * @param {function} two Function to invoke second.
   * @return {function} Function that invokes the two argument functions.
   * @private
   */
  function createMergedResultFunction(one, two) {
    return function mergedResult() {
      var a = one.apply(this, arguments);
      var b = two.apply(this, arguments);
      if (a == null) {
        return b;
      } else if (b == null) {
        return a;
      }
      var c = {};
      mergeIntoWithNoDuplicateKeys(c, a);
      mergeIntoWithNoDuplicateKeys(c, b);
      return c;
    };
  }

  /**
   * Creates a function that invokes two functions and ignores their return vales.
   *
   * @param {function} one Function to invoke first.
   * @param {function} two Function to invoke second.
   * @return {function} Function that invokes the two argument functions.
   * @private
   */
  function createChainedFunction(one, two) {
    return function chainedFunction() {
      one.apply(this, arguments);
      two.apply(this, arguments);
    };
  }

  /**
   * Binds a method to the component.
   *
   * @param {object} component Component whose method is going to be bound.
   * @param {function} method Method to be bound.
   * @return {function} The bound method.
   */
  function bindAutoBindMethod(component, method) {
    var boundMethod = method.bind(component);
    if (process.env.NODE_ENV !== 'production') {
      boundMethod.__reactBoundContext = component;
      boundMethod.__reactBoundMethod = method;
      boundMethod.__reactBoundArguments = null;
      var componentName = component.constructor.displayName;
      var _bind = boundMethod.bind;
      boundMethod.bind = function(newThis) {
        for (
          var _len = arguments.length,
            args = Array(_len > 1 ? _len - 1 : 0),
            _key = 1;
          _key < _len;
          _key++
        ) {
          args[_key - 1] = arguments[_key];
        }

        // User is trying to bind() an autobound method; we effectively will
        // ignore the value of "this" that the user is trying to use, so
        // let's warn.
        if (newThis !== component && newThis !== null) {
          if (process.env.NODE_ENV !== 'production') {
            warning(
              false,
              'bind(): React component methods may only be bound to the ' +
                'component instance. See %s',
              componentName
            );
          }
        } else if (!args.length) {
          if (process.env.NODE_ENV !== 'production') {
            warning(
              false,
              'bind(): You are binding a component method to the component. ' +
                'React does this for you automatically in a high-performance ' +
                'way, so you can safely remove this call. See %s',
              componentName
            );
          }
          return boundMethod;
        }
        var reboundMethod = _bind.apply(boundMethod, arguments);
        reboundMethod.__reactBoundContext = component;
        reboundMethod.__reactBoundMethod = method;
        reboundMethod.__reactBoundArguments = args;
        return reboundMethod;
      };
    }
    return boundMethod;
  }

  /**
   * Binds all auto-bound methods in a component.
   *
   * @param {object} component Component whose method is going to be bound.
   */
  function bindAutoBindMethods(component) {
    var pairs = component.__reactAutoBindPairs;
    for (var i = 0; i < pairs.length; i += 2) {
      var autoBindKey = pairs[i];
      var method = pairs[i + 1];
      component[autoBindKey] = bindAutoBindMethod(component, method);
    }
  }

  var IsMountedPreMixin = {
    componentDidMount: function() {
      this.__isMounted = true;
    }
  };

  var IsMountedPostMixin = {
    componentWillUnmount: function() {
      this.__isMounted = false;
    }
  };

  /**
   * Add more to the ReactClass base class. These are all legacy features and
   * therefore not already part of the modern ReactComponent.
   */
  var ReactClassMixin = {
    /**
     * TODO: This will be deprecated because state should always keep a consistent
     * type signature and the only use case for this, is to avoid that.
     */
    replaceState: function(newState, callback) {
      this.updater.enqueueReplaceState(this, newState, callback);
    },

    /**
     * Checks whether or not this composite component is mounted.
     * @return {boolean} True if mounted, false otherwise.
     * @protected
     * @final
     */
    isMounted: function() {
      if (process.env.NODE_ENV !== 'production') {
        warning(
          this.__didWarnIsMounted,
          '%s: isMounted is deprecated. Instead, make sure to clean up ' +
            'subscriptions and pending requests in componentWillUnmount to ' +
            'prevent memory leaks.',
          (this.constructor && this.constructor.displayName) ||
            this.name ||
            'Component'
        );
        this.__didWarnIsMounted = true;
      }
      return !!this.__isMounted;
    }
  };

  var ReactClassComponent = function() {};
  _assign(
    ReactClassComponent.prototype,
    ReactComponent.prototype,
    ReactClassMixin
  );

  /**
   * Creates a composite component class given a class specification.
   * See https://facebook.github.io/react/docs/top-level-api.html#react.createclass
   *
   * @param {object} spec Class specification (which must define `render`).
   * @return {function} Component constructor function.
   * @public
   */
  function createClass(spec) {
    // To keep our warnings more understandable, we'll use a little hack here to
    // ensure that Constructor.name !== 'Constructor'. This makes sure we don't
    // unnecessarily identify a class without displayName as 'Constructor'.
    var Constructor = identity(function(props, context, updater) {
      // This constructor gets overridden by mocks. The argument is used
      // by mocks to assert on what gets mounted.

      if (process.env.NODE_ENV !== 'production') {
        warning(
          this instanceof Constructor,
          'Something is calling a React component directly. Use a factory or ' +
            'JSX instead. See: https://fb.me/react-legacyfactory'
        );
      }

      // Wire up auto-binding
      if (this.__reactAutoBindPairs.length) {
        bindAutoBindMethods(this);
      }

      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;

      this.state = null;

      // ReactClasses doesn't have constructors. Instead, they use the
      // getInitialState and componentWillMount methods for initialization.

      var initialState = this.getInitialState ? this.getInitialState() : null;
      if (process.env.NODE_ENV !== 'production') {
        // We allow auto-mocks to proceed as if they're returning null.
        if (
          initialState === undefined &&
          this.getInitialState._isMockFunction
        ) {
          // This is probably bad practice. Consider warning here and
          // deprecating this convenience.
          initialState = null;
        }
      }
      _invariant(
        typeof initialState === 'object' && !Array.isArray(initialState),
        '%s.getInitialState(): must return an object or null',
        Constructor.displayName || 'ReactCompositeComponent'
      );

      this.state = initialState;
    });
    Constructor.prototype = new ReactClassComponent();
    Constructor.prototype.constructor = Constructor;
    Constructor.prototype.__reactAutoBindPairs = [];

    injectedMixins.forEach(mixSpecIntoComponent.bind(null, Constructor));

    mixSpecIntoComponent(Constructor, IsMountedPreMixin);
    mixSpecIntoComponent(Constructor, spec);
    mixSpecIntoComponent(Constructor, IsMountedPostMixin);

    // Initialize the defaultProps property after all mixins have been merged.
    if (Constructor.getDefaultProps) {
      Constructor.defaultProps = Constructor.getDefaultProps();
    }

    if (process.env.NODE_ENV !== 'production') {
      // This is a tag to indicate that the use of these method names is ok,
      // since it's used with createClass. If it's not, then it's likely a
      // mistake so we'll warn you to use the static property, property
      // initializer or constructor respectively.
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps.isReactClassApproved = {};
      }
      if (Constructor.prototype.getInitialState) {
        Constructor.prototype.getInitialState.isReactClassApproved = {};
      }
    }

    _invariant(
      Constructor.prototype.render,
      'createClass(...): Class specification must implement a `render` method.'
    );

    if (process.env.NODE_ENV !== 'production') {
      warning(
        !Constructor.prototype.componentShouldUpdate,
        '%s has a method called ' +
          'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' +
          'The name is phrased as a question because the function is ' +
          'expected to return a value.',
        spec.displayName || 'A component'
      );
      warning(
        !Constructor.prototype.componentWillRecieveProps,
        '%s has a method called ' +
          'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?',
        spec.displayName || 'A component'
      );
      warning(
        !Constructor.prototype.UNSAFE_componentWillRecieveProps,
        '%s has a method called UNSAFE_componentWillRecieveProps(). ' +
          'Did you mean UNSAFE_componentWillReceiveProps()?',
        spec.displayName || 'A component'
      );
    }

    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in ReactClassInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }

    return Constructor;
  }

  return createClass;
}

module.exports = factory;

}).call(this,require('_process'))
},{"_process":10,"fbjs/lib/emptyObject":5,"fbjs/lib/invariant":6,"fbjs/lib/warning":7,"object-assign":9}],3:[function(require,module,exports){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

var React = require('react');
var factory = require('./factory');

if (typeof React === 'undefined') {
  throw Error(
    'create-react-class could not find the React object. If you are using script tags, ' +
      'make sure that React is being loaded before create-react-class.'
  );
}

// Hack to grab NoopUpdateQueue from isomorphic React
var ReactNoopUpdateQueue = new React.Component().updater;

module.exports = factory(
  React.Component,
  React.isValidElement,
  ReactNoopUpdateQueue
);

},{"./factory":2,"react":"react"}],4:[function(require,module,exports){
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;
},{}],5:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

var emptyObject = {};

if (process.env.NODE_ENV !== 'production') {
  Object.freeze(emptyObject);
}

module.exports = emptyObject;
}).call(this,require('_process'))
},{"_process":10}],6:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
}).call(this,require('_process'))
},{"_process":10}],7:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

var emptyFunction = require('./emptyFunction');

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  var printWarning = function printWarning(format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  warning = function warning(condition, format) {
    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

module.exports = warning;
}).call(this,require('_process'))
},{"./emptyFunction":4,"_process":10}],8:[function(require,module,exports){
/*
 * Fuzzy
 * https://github.com/myork/fuzzy
 *
 * Copyright (c) 2012 Matt York
 * Licensed under the MIT license.
 */

(function() {

var root = this;

var fuzzy = {};

// Use in node or in browser
if (typeof exports !== 'undefined') {
  module.exports = fuzzy;
} else {
  root.fuzzy = fuzzy;
}

// Return all elements of `array` that have a fuzzy
// match against `pattern`.
fuzzy.simpleFilter = function(pattern, array) {
  return array.filter(function(str) {
    return fuzzy.test(pattern, str);
  });
};

// Does `pattern` fuzzy match `str`?
fuzzy.test = function(pattern, str) {
  return fuzzy.match(pattern, str) !== null;
};

// If `pattern` matches `str`, wrap each matching character
// in `opts.pre` and `opts.post`. If no match, return null
fuzzy.match = function(pattern, str, opts) {
  opts = opts || {};
  var patternIdx = 0
    , result = []
    , len = str.length
    , totalScore = 0
    , currScore = 0
    // prefix
    , pre = opts.pre || ''
    // suffix
    , post = opts.post || ''
    // String to compare against. This might be a lowercase version of the
    // raw string
    , compareString =  opts.caseSensitive && str || str.toLowerCase()
    , ch;

  pattern = opts.caseSensitive && pattern || pattern.toLowerCase();

  // For each character in the string, either add it to the result
  // or wrap in template if it's the next string in the pattern
  for(var idx = 0; idx < len; idx++) {
    ch = str[idx];
    if(compareString[idx] === pattern[patternIdx]) {
      ch = pre + ch + post;
      patternIdx += 1;

      // consecutive characters should increase the score more than linearly
      currScore += 1 + currScore;
    } else {
      currScore = 0;
    }
    totalScore += currScore;
    result[result.length] = ch;
  }

  // return rendered string if we have a match for every char
  if(patternIdx === pattern.length) {
    // if the string is an exact match with pattern, totalScore should be maxed
    totalScore = (compareString === pattern) ? Infinity : totalScore;
    return {rendered: result.join(''), score: totalScore};
  }

  return null;
};

// The normal entry point. Filters `arr` for matches against `pattern`.
// It returns an array with matching values of the type:
//
//     [{
//         string:   '<b>lah' // The rendered string
//       , index:    2        // The index of the element in `arr`
//       , original: 'blah'   // The original element in `arr`
//     }]
//
// `opts` is an optional argument bag. Details:
//
//    opts = {
//        // string to put before a matching character
//        pre:     '<b>'
//
//        // string to put after matching character
//      , post:    '</b>'
//
//        // Optional function. Input is an entry in the given arr`,
//        // output should be the string to test `pattern` against.
//        // In this example, if `arr = [{crying: 'koala'}]` we would return
//        // 'koala'.
//      , extract: function(arg) { return arg.crying; }
//    }
fuzzy.filter = function(pattern, arr, opts) {
  if(!arr || arr.length === 0) {
    return [];
  }
  if (typeof pattern !== 'string') {
    return arr;
  }
  opts = opts || {};
  return arr
    .reduce(function(prev, element, idx, arr) {
      var str = element;
      if(opts.extract) {
        str = opts.extract(element);
      }
      var rendered = fuzzy.match(pattern, str, opts);
      if(rendered != null) {
        prev[prev.length] = {
            string: rendered.rendered
          , score: rendered.score
          , index: idx
          , original: element
        };
      }
      return prev;
    }, [])

    // Sort by score. Browsers are inconsistent wrt stable/unstable
    // sorting, so force stable by using the index in the case of tie.
    // See http://ofb.net/~sethml/is-sort-stable.html
    .sort(function(a,b) {
      var compare = b.score - a.score;
      if(compare) return compare;
      return a.index - b.index;
    });
};


}());


},{}],9:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],10:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],11:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var printWarning = function() {};

if (process.env.NODE_ENV !== 'production') {
  var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
  var loggedTypeFailures = {};
  var has = Function.call.bind(Object.prototype.hasOwnProperty);

  printWarning = function(text) {
    var message = 'Warning: ' + text;
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            var err = Error(
              (componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' +
              'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.'
            );
            err.name = 'Invariant Violation';
            throw err;
          }
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        if (error && !(error instanceof Error)) {
          printWarning(
            (componentName || 'React class') + ': type specification of ' +
            location + ' `' + typeSpecName + '` is invalid; the type checker ' +
            'function must return `null` or an `Error` but returned a ' + typeof error + '. ' +
            'You may have forgotten to pass an argument to the type checker ' +
            'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
            'shape all require an argument).'
          );
        }
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          printWarning(
            'Failed ' + location + ' type: ' + error.message + (stack != null ? stack : '')
          );
        }
      }
    }
  }
}

/**
 * Resets warning cache when testing.
 *
 * @private
 */
checkPropTypes.resetWarningCache = function() {
  if (process.env.NODE_ENV !== 'production') {
    loggedTypeFailures = {};
  }
}

module.exports = checkPropTypes;

}).call(this,require('_process'))
},{"./lib/ReactPropTypesSecret":15,"_process":10}],12:[function(require,module,exports){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');

function emptyFunction() {}
function emptyFunctionWithReset() {}
emptyFunctionWithReset.resetWarningCache = emptyFunction;

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    var err = new Error(
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
    err.name = 'Invariant Violation';
    throw err;
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    elementType: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim,

    checkPropTypes: emptyFunctionWithReset,
    resetWarningCache: emptyFunction
  };

  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

},{"./lib/ReactPropTypesSecret":15}],13:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var ReactIs = require('react-is');
var assign = require('object-assign');

var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
var checkPropTypes = require('./checkPropTypes');

var has = Function.call.bind(Object.prototype.hasOwnProperty);
var printWarning = function() {};

if (process.env.NODE_ENV !== 'production') {
  printWarning = function(text) {
    var message = 'Warning: ' + text;
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };
}

function emptyFunctionThatReturnsNull() {
  return null;
}

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    elementType: createElementTypeTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker,
    exact: createStrictShapeTypeChecker,
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          var err = new Error(
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
          err.name = 'Invariant Violation';
          throw err;
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            printWarning(
              'You are manually calling a React.PropTypes validation ' +
              'function for the `' + propFullName + '` prop on `' + componentName  + '`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.'
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunctionThatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!ReactIs.isValidElementType(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      if (process.env.NODE_ENV !== 'production') {
        if (arguments.length > 1) {
          printWarning(
            'Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' +
            'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).'
          );
        } else {
          printWarning('Invalid argument supplied to oneOf, expected an array.');
        }
      }
      return emptyFunctionThatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
        var type = getPreciseType(value);
        if (type === 'symbol') {
          return String(value);
        }
        return value;
      });
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (has(propValue, key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? printWarning('Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunctionThatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        printWarning(
          'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
          'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.'
        );
        return emptyFunctionThatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createStrictShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      // We need to check all keys in case some are required but missing from
      // props.
      var allKeys = assign({}, props[propName], shapeTypes);
      for (var key in allKeys) {
        var checker = shapeTypes[key];
        if (!checker) {
          return new PropTypeError(
            'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +
            '\nBad object: ' + JSON.stringify(props[propName], null, '  ') +
            '\nValid keys: ' +  JSON.stringify(Object.keys(shapeTypes), null, '  ')
          );
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // falsy value can't be a Symbol
    if (!propValue) {
      return false;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

}).call(this,require('_process'))
},{"./checkPropTypes":11,"./lib/ReactPropTypesSecret":15,"_process":10,"object-assign":9,"react-is":18}],14:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

if (process.env.NODE_ENV !== 'production') {
  var ReactIs = require('react-is');

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = require('./factoryWithTypeCheckers')(ReactIs.isElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = require('./factoryWithThrowingShims')();
}

}).call(this,require('_process'))
},{"./factoryWithThrowingShims":12,"./factoryWithTypeCheckers":13,"_process":10,"react-is":18}],15:[function(require,module,exports){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;

},{}],16:[function(require,module,exports){
(function (process){
/** @license React v16.8.6
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';



if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var hasSymbol = typeof Symbol === 'function' && Symbol.for;

var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace;
var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;

function isValidElementType(type) {
  return typeof type === 'string' || typeof type === 'function' ||
  // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE);
}

/**
 * Forked from fbjs/warning:
 * https://github.com/facebook/fbjs/blob/e66ba20ad5be433eb54423f2b097d829324d9de6/packages/fbjs/src/__forks__/warning.js
 *
 * Only change is we use console.warn instead of console.error,
 * and do nothing when 'console' is not supported.
 * This really simplifies the code.
 * ---
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var lowPriorityWarning = function () {};

{
  var printWarning = function (format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.warn(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  lowPriorityWarning = function (condition, format) {
    if (format === undefined) {
      throw new Error('`lowPriorityWarning(condition, format, ...args)` requires a warning ' + 'message argument');
    }
    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

var lowPriorityWarning$1 = lowPriorityWarning;

function typeOf(object) {
  if (typeof object === 'object' && object !== null) {
    var $$typeof = object.$$typeof;
    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        var type = object.type;

        switch (type) {
          case REACT_ASYNC_MODE_TYPE:
          case REACT_CONCURRENT_MODE_TYPE:
          case REACT_FRAGMENT_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
            return type;
          default:
            var $$typeofType = type && type.$$typeof;

            switch ($$typeofType) {
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_PROVIDER_TYPE:
                return $$typeofType;
              default:
                return $$typeof;
            }
        }
      case REACT_LAZY_TYPE:
      case REACT_MEMO_TYPE:
      case REACT_PORTAL_TYPE:
        return $$typeof;
    }
  }

  return undefined;
}

// AsyncMode is deprecated along with isAsyncMode
var AsyncMode = REACT_ASYNC_MODE_TYPE;
var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
var ContextConsumer = REACT_CONTEXT_TYPE;
var ContextProvider = REACT_PROVIDER_TYPE;
var Element = REACT_ELEMENT_TYPE;
var ForwardRef = REACT_FORWARD_REF_TYPE;
var Fragment = REACT_FRAGMENT_TYPE;
var Lazy = REACT_LAZY_TYPE;
var Memo = REACT_MEMO_TYPE;
var Portal = REACT_PORTAL_TYPE;
var Profiler = REACT_PROFILER_TYPE;
var StrictMode = REACT_STRICT_MODE_TYPE;
var Suspense = REACT_SUSPENSE_TYPE;

var hasWarnedAboutDeprecatedIsAsyncMode = false;

// AsyncMode should be deprecated
function isAsyncMode(object) {
  {
    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
      hasWarnedAboutDeprecatedIsAsyncMode = true;
      lowPriorityWarning$1(false, 'The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
    }
  }
  return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
}
function isConcurrentMode(object) {
  return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
}
function isContextConsumer(object) {
  return typeOf(object) === REACT_CONTEXT_TYPE;
}
function isContextProvider(object) {
  return typeOf(object) === REACT_PROVIDER_TYPE;
}
function isElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}
function isForwardRef(object) {
  return typeOf(object) === REACT_FORWARD_REF_TYPE;
}
function isFragment(object) {
  return typeOf(object) === REACT_FRAGMENT_TYPE;
}
function isLazy(object) {
  return typeOf(object) === REACT_LAZY_TYPE;
}
function isMemo(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
}
function isPortal(object) {
  return typeOf(object) === REACT_PORTAL_TYPE;
}
function isProfiler(object) {
  return typeOf(object) === REACT_PROFILER_TYPE;
}
function isStrictMode(object) {
  return typeOf(object) === REACT_STRICT_MODE_TYPE;
}
function isSuspense(object) {
  return typeOf(object) === REACT_SUSPENSE_TYPE;
}

exports.typeOf = typeOf;
exports.AsyncMode = AsyncMode;
exports.ConcurrentMode = ConcurrentMode;
exports.ContextConsumer = ContextConsumer;
exports.ContextProvider = ContextProvider;
exports.Element = Element;
exports.ForwardRef = ForwardRef;
exports.Fragment = Fragment;
exports.Lazy = Lazy;
exports.Memo = Memo;
exports.Portal = Portal;
exports.Profiler = Profiler;
exports.StrictMode = StrictMode;
exports.Suspense = Suspense;
exports.isValidElementType = isValidElementType;
exports.isAsyncMode = isAsyncMode;
exports.isConcurrentMode = isConcurrentMode;
exports.isContextConsumer = isContextConsumer;
exports.isContextProvider = isContextProvider;
exports.isElement = isElement;
exports.isForwardRef = isForwardRef;
exports.isFragment = isFragment;
exports.isLazy = isLazy;
exports.isMemo = isMemo;
exports.isPortal = isPortal;
exports.isProfiler = isProfiler;
exports.isStrictMode = isStrictMode;
exports.isSuspense = isSuspense;
  })();
}

}).call(this,require('_process'))
},{"_process":10}],17:[function(require,module,exports){
/** @license React v16.8.6
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';Object.defineProperty(exports,"__esModule",{value:!0});
var b="function"===typeof Symbol&&Symbol.for,c=b?Symbol.for("react.element"):60103,d=b?Symbol.for("react.portal"):60106,e=b?Symbol.for("react.fragment"):60107,f=b?Symbol.for("react.strict_mode"):60108,g=b?Symbol.for("react.profiler"):60114,h=b?Symbol.for("react.provider"):60109,k=b?Symbol.for("react.context"):60110,l=b?Symbol.for("react.async_mode"):60111,m=b?Symbol.for("react.concurrent_mode"):60111,n=b?Symbol.for("react.forward_ref"):60112,p=b?Symbol.for("react.suspense"):60113,q=b?Symbol.for("react.memo"):
60115,r=b?Symbol.for("react.lazy"):60116;function t(a){if("object"===typeof a&&null!==a){var u=a.$$typeof;switch(u){case c:switch(a=a.type,a){case l:case m:case e:case g:case f:case p:return a;default:switch(a=a&&a.$$typeof,a){case k:case n:case h:return a;default:return u}}case r:case q:case d:return u}}}function v(a){return t(a)===m}exports.typeOf=t;exports.AsyncMode=l;exports.ConcurrentMode=m;exports.ContextConsumer=k;exports.ContextProvider=h;exports.Element=c;exports.ForwardRef=n;
exports.Fragment=e;exports.Lazy=r;exports.Memo=q;exports.Portal=d;exports.Profiler=g;exports.StrictMode=f;exports.Suspense=p;exports.isValidElementType=function(a){return"string"===typeof a||"function"===typeof a||a===e||a===m||a===g||a===f||a===p||"object"===typeof a&&null!==a&&(a.$$typeof===r||a.$$typeof===q||a.$$typeof===h||a.$$typeof===k||a.$$typeof===n)};exports.isAsyncMode=function(a){return v(a)||t(a)===l};exports.isConcurrentMode=v;exports.isContextConsumer=function(a){return t(a)===k};
exports.isContextProvider=function(a){return t(a)===h};exports.isElement=function(a){return"object"===typeof a&&null!==a&&a.$$typeof===c};exports.isForwardRef=function(a){return t(a)===n};exports.isFragment=function(a){return t(a)===e};exports.isLazy=function(a){return t(a)===r};exports.isMemo=function(a){return t(a)===q};exports.isPortal=function(a){return t(a)===d};exports.isProfiler=function(a){return t(a)===g};exports.isStrictMode=function(a){return t(a)===f};
exports.isSuspense=function(a){return t(a)===p};

},{}],18:[function(require,module,exports){
(function (process){
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react-is.production.min.js');
} else {
  module.exports = require('./cjs/react-is.development.js');
}

}).call(this,require('_process'))
},{"./cjs/react-is.development.js":16,"./cjs/react-is.production.min.js":17,"_process":10}],19:[function(require,module,exports){
var Accessor = {
  IDENTITY_FN: function (input) {
    return input;
  },

  generateAccessor: function (field) {
    return function (object) {
      return object[field];
    };
  },

  generateOptionToStringFor: function (prop) {
    if (typeof prop === 'string') {
      return this.generateAccessor(prop);
    } else if (typeof prop === 'function') {
      return prop;
    } else {
      return this.IDENTITY_FN;
    }
  },

  valueForOption: function (option, object) {
    if (typeof option === 'string') {
      return object[option];
    } else if (typeof option === 'function') {
      return option(object);
    } else {
      return object;
    }
  }
};

module.exports = Accessor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjY2Vzc29yLmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwiSURFTlRJVFlfRk4iLCJpbnB1dCIsImdlbmVyYXRlQWNjZXNzb3IiLCJmaWVsZCIsIm9iamVjdCIsImdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3IiLCJwcm9wIiwidmFsdWVGb3JPcHRpb24iLCJvcHRpb24iLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxXQUFXO0FBQ2JDLGVBQWEsVUFBU0MsS0FBVCxFQUFnQjtBQUFFLFdBQU9BLEtBQVA7QUFBZSxHQURqQzs7QUFHYkMsb0JBQWtCLFVBQVNDLEtBQVQsRUFBZ0I7QUFDaEMsV0FBTyxVQUFTQyxNQUFULEVBQWlCO0FBQUUsYUFBT0EsT0FBT0QsS0FBUCxDQUFQO0FBQXVCLEtBQWpEO0FBQ0QsR0FMWTs7QUFPYkUsNkJBQTJCLFVBQVNDLElBQVQsRUFBZTtBQUN4QyxRQUFJLE9BQU9BLElBQVAsS0FBZ0IsUUFBcEIsRUFBOEI7QUFDNUIsYUFBTyxLQUFLSixnQkFBTCxDQUFzQkksSUFBdEIsQ0FBUDtBQUNELEtBRkQsTUFFTyxJQUFJLE9BQU9BLElBQVAsS0FBZ0IsVUFBcEIsRUFBZ0M7QUFDckMsYUFBT0EsSUFBUDtBQUNELEtBRk0sTUFFQTtBQUNMLGFBQU8sS0FBS04sV0FBWjtBQUNEO0FBQ0YsR0FmWTs7QUFpQmJPLGtCQUFnQixVQUFTQyxNQUFULEVBQWlCSixNQUFqQixFQUF5QjtBQUN2QyxRQUFJLE9BQU9JLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDOUIsYUFBT0osT0FBT0ksTUFBUCxDQUFQO0FBQ0QsS0FGRCxNQUVPLElBQUksT0FBT0EsTUFBUCxLQUFrQixVQUF0QixFQUFrQztBQUN2QyxhQUFPQSxPQUFPSixNQUFQLENBQVA7QUFDRCxLQUZNLE1BRUE7QUFDTCxhQUFPQSxNQUFQO0FBQ0Q7QUFDRjtBQXpCWSxDQUFmOztBQTRCQUssT0FBT0MsT0FBUCxHQUFpQlgsUUFBakIiLCJmaWxlIjoiYWNjZXNzb3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQWNjZXNzb3IgPSB7XG4gIElERU5USVRZX0ZOOiBmdW5jdGlvbihpbnB1dCkgeyByZXR1cm4gaW5wdXQ7IH0sXG5cbiAgZ2VuZXJhdGVBY2Nlc3NvcjogZnVuY3Rpb24oZmllbGQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7IHJldHVybiBvYmplY3RbZmllbGRdOyB9O1xuICB9LFxuXG4gIGdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3I6IGZ1bmN0aW9uKHByb3ApIHtcbiAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZUFjY2Vzc29yKHByb3ApO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3AgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBwcm9wO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5JREVOVElUWV9GTjtcbiAgICB9XG4gIH0sXG5cbiAgdmFsdWVGb3JPcHRpb246IGZ1bmN0aW9uKG9wdGlvbiwgb2JqZWN0KSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gb2JqZWN0W29wdGlvbl07XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gb3B0aW9uKG9iamVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBY2Nlc3NvcjtcbiJdfQ==
},{}],20:[function(require,module,exports){
/**
 * PolyFills make me sad
 */
var KeyEvent = KeyEvent || {};
KeyEvent.DOM_VK_UP = KeyEvent.DOM_VK_UP || 38;
KeyEvent.DOM_VK_DOWN = KeyEvent.DOM_VK_DOWN || 40;
KeyEvent.DOM_VK_BACK_SPACE = KeyEvent.DOM_VK_BACK_SPACE || 8;
KeyEvent.DOM_VK_RETURN = KeyEvent.DOM_VK_RETURN || 13;
KeyEvent.DOM_VK_ENTER = KeyEvent.DOM_VK_ENTER || 14;
KeyEvent.DOM_VK_ESCAPE = KeyEvent.DOM_VK_ESCAPE || 27;
KeyEvent.DOM_VK_TAB = KeyEvent.DOM_VK_TAB || 9;

module.exports = KeyEvent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtleWV2ZW50LmpzIl0sIm5hbWVzIjpbIktleUV2ZW50IiwiRE9NX1ZLX1VQIiwiRE9NX1ZLX0RPV04iLCJET01fVktfQkFDS19TUEFDRSIsIkRPTV9WS19SRVRVUk4iLCJET01fVktfRU5URVIiLCJET01fVktfRVNDQVBFIiwiRE9NX1ZLX1RBQiIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBOzs7QUFHQSxJQUFJQSxXQUFXQSxZQUFZLEVBQTNCO0FBQ0FBLFNBQVNDLFNBQVQsR0FBcUJELFNBQVNDLFNBQVQsSUFBc0IsRUFBM0M7QUFDQUQsU0FBU0UsV0FBVCxHQUF1QkYsU0FBU0UsV0FBVCxJQUF3QixFQUEvQztBQUNBRixTQUFTRyxpQkFBVCxHQUE2QkgsU0FBU0csaUJBQVQsSUFBOEIsQ0FBM0Q7QUFDQUgsU0FBU0ksYUFBVCxHQUF5QkosU0FBU0ksYUFBVCxJQUEwQixFQUFuRDtBQUNBSixTQUFTSyxZQUFULEdBQXdCTCxTQUFTSyxZQUFULElBQXlCLEVBQWpEO0FBQ0FMLFNBQVNNLGFBQVQsR0FBeUJOLFNBQVNNLGFBQVQsSUFBMEIsRUFBbkQ7QUFDQU4sU0FBU08sVUFBVCxHQUFzQlAsU0FBU08sVUFBVCxJQUF1QixDQUE3Qzs7QUFFQUMsT0FBT0MsT0FBUCxHQUFpQlQsUUFBakIiLCJmaWxlIjoia2V5ZXZlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFBvbHlGaWxscyBtYWtlIG1lIHNhZFxuICovXG52YXIgS2V5RXZlbnQgPSBLZXlFdmVudCB8fCB7fTtcbktleUV2ZW50LkRPTV9WS19VUCA9IEtleUV2ZW50LkRPTV9WS19VUCB8fCAzODtcbktleUV2ZW50LkRPTV9WS19ET1dOID0gS2V5RXZlbnQuRE9NX1ZLX0RPV04gfHwgNDA7XG5LZXlFdmVudC5ET01fVktfQkFDS19TUEFDRSA9IEtleUV2ZW50LkRPTV9WS19CQUNLX1NQQUNFIHx8IDg7XG5LZXlFdmVudC5ET01fVktfUkVUVVJOID0gS2V5RXZlbnQuRE9NX1ZLX1JFVFVSTiB8fCAxMztcbktleUV2ZW50LkRPTV9WS19FTlRFUiA9IEtleUV2ZW50LkRPTV9WS19FTlRFUiB8fCAxNDtcbktleUV2ZW50LkRPTV9WS19FU0NBUEUgPSBLZXlFdmVudC5ET01fVktfRVNDQVBFIHx8IDI3O1xuS2V5RXZlbnQuRE9NX1ZLX1RBQiA9IEtleUV2ZW50LkRPTV9WS19UQUIgfHwgOTtcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlFdmVudDtcbiJdfQ==
},{}],21:[function(require,module,exports){
var Typeahead = require('./typeahead');
var Tokenizer = require('./tokenizer');

module.exports = {
  Typeahead: Typeahead,
  Tokenizer: Tokenizer
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0LXR5cGVhaGVhZC5qcyJdLCJuYW1lcyI6WyJUeXBlYWhlYWQiLCJyZXF1aXJlIiwiVG9rZW5pemVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsWUFBWUMsUUFBUSxhQUFSLENBQWhCO0FBQ0EsSUFBSUMsWUFBWUQsUUFBUSxhQUFSLENBQWhCOztBQUVBRSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZKLGFBQVdBLFNBREk7QUFFZkUsYUFBV0E7QUFGSSxDQUFqQiIsImZpbGUiOiJyZWFjdC10eXBlYWhlYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgVHlwZWFoZWFkID0gcmVxdWlyZSgnLi90eXBlYWhlYWQnKTtcbnZhciBUb2tlbml6ZXIgPSByZXF1aXJlKCcuL3Rva2VuaXplcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVHlwZWFoZWFkOiBUeXBlYWhlYWQsXG4gIFRva2VuaXplcjogVG9rZW5pemVyXG59O1xuIl19
},{"./tokenizer":22,"./typeahead":24}],22:[function(require,module,exports){
var Accessor = require("../accessor");
var React = window.React || require('react');
var Token = require("./token");
var KeyEvent = require("../keyevent");
var Typeahead = require("../typeahead");
var classNames = require("classnames");
var createReactClass = require("create-react-class");
var PropTypes = require("prop-types");

function _arraysAreDifferent(array1, array2) {
  if (array1.length != array2.length) {
    return true;
  }
  for (var i = array2.length - 1; i >= 0; i--) {
    if (array2[i] !== array1[i]) {
      return true;
    }
  }
}

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
var TypeaheadTokenizer = createReactClass({
  displayName: "TypeaheadTokenizer",

  propTypes: {
    name: PropTypes.string,
    options: PropTypes.array,
    customClasses: PropTypes.object,
    allowCustomValues: PropTypes.number,
    defaultSelected: PropTypes.array,
    initialValue: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    inputProps: PropTypes.object,
    onTokenRemove: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyPress: PropTypes.func,
    onKeyUp: PropTypes.func,
    onTokenAdd: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    filterOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    searchOptions: PropTypes.func,
    displayOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    formInputOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    maxVisible: PropTypes.number,
    resultsTruncatedMessage: PropTypes.string,
    defaultClassNames: PropTypes.bool,
    showOptionsWhenEmpty: PropTypes.bool
  },

  getInitialState: function () {
    return {
      // We need to copy this to avoid incorrect sharing
      // of state across instances (e.g., via getDefaultProps())
      selected: this.props.defaultSelected.slice(0),

      // ref callback
      typeahead: React.createRef()
    };
  },

  getDefaultProps: function () {
    return {
      options: [],
      defaultSelected: [],
      customClasses: {},
      allowCustomValues: 0,
      initialValue: "",
      placeholder: "",
      disabled: false,
      inputProps: {},
      defaultClassNames: true,
      filterOption: null,
      searchOptions: null,
      displayOption: function (token) {
        return token;
      },
      formInputOption: null,
      onKeyDown: function (event) {},
      onKeyPress: function (event) {},
      onKeyUp: function (event) {},
      onFocus: function (event) {},
      onBlur: function (event) {},
      onTokenAdd: function () {},
      onTokenRemove: function () {},
      showOptionsWhenEmpty: false
    };
  },

  componentWillReceiveProps: function (nextProps) {
    // if we get new defaultProps, update selected
    if (_arraysAreDifferent(this.props.defaultSelected, nextProps.defaultSelected)) {
      this.setState({ selected: nextProps.defaultSelected.slice(0) });
    }
  },

  focus: function () {
    this._typeahead.focus();
  },

  getSelectedTokens: function () {
    return this.state.selected;
  },

  // TODO: Support initialized tokens
  //
  _renderTokens: function () {
    var tokenClasses = {};
    tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;
    var classList = classNames(tokenClasses);
    var result = this.state.selected.map(function (selected) {
      var displayString = Accessor.valueForOption(this.props.displayOption, selected);
      var value = Accessor.valueForOption(this.props.formInputOption || this.props.displayOption, selected);
      return React.createElement(
        Token,
        {
          key: displayString,
          className: classList,
          onRemove: this._removeTokenForValue,
          object: selected,
          value: value,
          name: this.props.name
        },
        displayString
      );
    }, this);
    return result;
  },

  _getOptionsForTypeahead: function () {
    // return this.props.options without this.selected
    return this.props.options;
  },

  _onKeyDown: function (event) {
    // We only care about intercepting backspaces
    if (event.keyCode === KeyEvent.DOM_VK_BACK_SPACE) {
      return this._handleBackspace(event);
    }
    this.props.onKeyDown(event);
  },

  _handleBackspace: function (event) {
    // No tokens
    if (!this.state.selected.length) {
      return;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    // var entry = this.refs.typeahead.refs.entry;
    var entry = this._typeahead._entry;
    if (entry.selectionStart == entry.selectionEnd && entry.selectionStart == 0) {
      this._removeTokenForValue(this.state.selected[this.state.selected.length - 1]);
      event.preventDefault();
    }
  },

  _removeTokenForValue: function (value) {
    var index = this.state.selected.indexOf(value);
    if (index == -1) {
      return;
    }

    this.state.selected.splice(index, 1);
    this.setState({ selected: this.state.selected });
    this.props.onTokenRemove(value);
    return;
  },

  _addTokenForValue: function (value) {
    if (this.state.selected.indexOf(value) != -1) {
      return;
    }
    this.state.selected.push(value);
    this.setState({ selected: this.state.selected });
    this._typeahead.setEntryText("");
    this.props.onTokenAdd(value);
  },

  render: function () {
    var classes = {};
    classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;
    var classList = classNames(classes);
    var tokenizerClasses = [this.props.defaultClassNames && "typeahead-tokenizer"];
    tokenizerClasses[this.props.className] = !!this.props.className;
    var tokenizerClassList = classNames(tokenizerClasses);
    var _this = this;
    var typeaheadRef = function (c) {
      _this._typeahead = c;
    };

    return React.createElement(
      "div",
      { className: tokenizerClassList },
      this._renderTokens(),
      React.createElement(Typeahead, {
        ref: typeaheadRef,
        className: classList,
        placeholder: this.props.placeholder,
        disabled: this.props.disabled,
        inputProps: this.props.inputProps,
        allowCustomValues: this.props.allowCustomValues,
        customClasses: this.props.customClasses,
        options: this._getOptionsForTypeahead(),
        initialValue: this.props.initialValue,
        maxVisible: this.props.maxVisible,
        resultsTruncatedMessage: this.props.resultsTruncatedMessage,
        onOptionSelected: this._addTokenForValue,
        onKeyDown: this._onKeyDown,
        onKeyPress: this.props.onKeyPress,
        onKeyUp: this.props.onKeyUp,
        onFocus: this.props.onFocus,
        onBlur: this.props.onBlur,
        displayOption: this.props.displayOption,
        defaultClassNames: this.props.defaultClassNames,
        filterOption: this.props.filterOption,
        searchOptions: this.props.searchOptions,
        showOptionsWhenEmpty: this.props.showOptionsWhenEmpty
      })
    );
  }
});

module.exports = TypeaheadTokenizer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwicmVxdWlyZSIsIlJlYWN0IiwiVG9rZW4iLCJLZXlFdmVudCIsIlR5cGVhaGVhZCIsImNsYXNzTmFtZXMiLCJjcmVhdGVSZWFjdENsYXNzIiwiUHJvcFR5cGVzIiwiX2FycmF5c0FyZURpZmZlcmVudCIsImFycmF5MSIsImFycmF5MiIsImxlbmd0aCIsImkiLCJUeXBlYWhlYWRUb2tlbml6ZXIiLCJwcm9wVHlwZXMiLCJuYW1lIiwic3RyaW5nIiwib3B0aW9ucyIsImFycmF5IiwiY3VzdG9tQ2xhc3NlcyIsIm9iamVjdCIsImFsbG93Q3VzdG9tVmFsdWVzIiwibnVtYmVyIiwiZGVmYXVsdFNlbGVjdGVkIiwiaW5pdGlhbFZhbHVlIiwicGxhY2Vob2xkZXIiLCJkaXNhYmxlZCIsImJvb2wiLCJpbnB1dFByb3BzIiwib25Ub2tlblJlbW92ZSIsImZ1bmMiLCJvbktleURvd24iLCJvbktleVByZXNzIiwib25LZXlVcCIsIm9uVG9rZW5BZGQiLCJvbkZvY3VzIiwib25CbHVyIiwiZmlsdGVyT3B0aW9uIiwib25lT2ZUeXBlIiwic2VhcmNoT3B0aW9ucyIsImRpc3BsYXlPcHRpb24iLCJmb3JtSW5wdXRPcHRpb24iLCJtYXhWaXNpYmxlIiwicmVzdWx0c1RydW5jYXRlZE1lc3NhZ2UiLCJkZWZhdWx0Q2xhc3NOYW1lcyIsInNob3dPcHRpb25zV2hlbkVtcHR5IiwiZ2V0SW5pdGlhbFN0YXRlIiwic2VsZWN0ZWQiLCJwcm9wcyIsInNsaWNlIiwidHlwZWFoZWFkIiwiY3JlYXRlUmVmIiwiZ2V0RGVmYXVsdFByb3BzIiwidG9rZW4iLCJldmVudCIsImNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXh0UHJvcHMiLCJzZXRTdGF0ZSIsImZvY3VzIiwiX3R5cGVhaGVhZCIsImdldFNlbGVjdGVkVG9rZW5zIiwic3RhdGUiLCJfcmVuZGVyVG9rZW5zIiwidG9rZW5DbGFzc2VzIiwiY2xhc3NMaXN0IiwicmVzdWx0IiwibWFwIiwiZGlzcGxheVN0cmluZyIsInZhbHVlRm9yT3B0aW9uIiwidmFsdWUiLCJfcmVtb3ZlVG9rZW5Gb3JWYWx1ZSIsIl9nZXRPcHRpb25zRm9yVHlwZWFoZWFkIiwiX29uS2V5RG93biIsImtleUNvZGUiLCJET01fVktfQkFDS19TUEFDRSIsIl9oYW5kbGVCYWNrc3BhY2UiLCJlbnRyeSIsIl9lbnRyeSIsInNlbGVjdGlvblN0YXJ0Iiwic2VsZWN0aW9uRW5kIiwicHJldmVudERlZmF1bHQiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJfYWRkVG9rZW5Gb3JWYWx1ZSIsInB1c2giLCJzZXRFbnRyeVRleHQiLCJyZW5kZXIiLCJjbGFzc2VzIiwidG9rZW5pemVyQ2xhc3NlcyIsImNsYXNzTmFtZSIsInRva2VuaXplckNsYXNzTGlzdCIsIl90aGlzIiwidHlwZWFoZWFkUmVmIiwiYyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLElBQUlBLFdBQVdDLFFBQVEsYUFBUixDQUFmO0FBQ0EsSUFBSUMsUUFBUUQsUUFBUSxPQUFSLENBQVo7QUFDQSxJQUFJRSxRQUFRRixRQUFRLFNBQVIsQ0FBWjtBQUNBLElBQUlHLFdBQVdILFFBQVEsYUFBUixDQUFmO0FBQ0EsSUFBSUksWUFBWUosUUFBUSxjQUFSLENBQWhCO0FBQ0EsSUFBSUssYUFBYUwsUUFBUSxZQUFSLENBQWpCO0FBQ0EsSUFBSU0sbUJBQW1CTixRQUFRLG9CQUFSLENBQXZCO0FBQ0EsSUFBSU8sWUFBWVAsUUFBUSxZQUFSLENBQWhCOztBQUVBLFNBQVNRLG1CQUFULENBQTZCQyxNQUE3QixFQUFxQ0MsTUFBckMsRUFBNkM7QUFDM0MsTUFBSUQsT0FBT0UsTUFBUCxJQUFpQkQsT0FBT0MsTUFBNUIsRUFBb0M7QUFDbEMsV0FBTyxJQUFQO0FBQ0Q7QUFDRCxPQUFLLElBQUlDLElBQUlGLE9BQU9DLE1BQVAsR0FBZ0IsQ0FBN0IsRUFBZ0NDLEtBQUssQ0FBckMsRUFBd0NBLEdBQXhDLEVBQTZDO0FBQzNDLFFB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ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFjY2Vzc29yID0gcmVxdWlyZShcIi4uL2FjY2Vzc29yXCIpO1xudmFyIFJlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xudmFyIFRva2VuID0gcmVxdWlyZShcIi4vdG9rZW5cIik7XG52YXIgS2V5RXZlbnQgPSByZXF1aXJlKFwiLi4va2V5ZXZlbnRcIik7XG52YXIgVHlwZWFoZWFkID0gcmVxdWlyZShcIi4uL3R5cGVhaGVhZFwiKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZShcImNsYXNzbmFtZXNcIik7XG52YXIgY3JlYXRlUmVhY3RDbGFzcyA9IHJlcXVpcmUoXCJjcmVhdGUtcmVhY3QtY2xhc3NcIik7XG52YXIgUHJvcFR5cGVzID0gcmVxdWlyZShcInByb3AtdHlwZXNcIik7XG5cbmZ1bmN0aW9uIF9hcnJheXNBcmVEaWZmZXJlbnQoYXJyYXkxLCBhcnJheTIpIHtcbiAgaWYgKGFycmF5MS5sZW5ndGggIT0gYXJyYXkyLmxlbmd0aCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGZvciAodmFyIGkgPSBhcnJheTIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoYXJyYXkyW2ldICE9PSBhcnJheTFbaV0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEEgdHlwZWFoZWFkIHRoYXQsIHdoZW4gYW4gb3B0aW9uIGlzIHNlbGVjdGVkLCBpbnN0ZWFkIG9mIHNpbXBseSBmaWxsaW5nXG4gKiB0aGUgdGV4dCBlbnRyeSB3aWRnZXQsIHByZXBlbmRzIGEgcmVuZGVyYWJsZSBcInRva2VuXCIsIHRoYXQgbWF5IGJlIGRlbGV0ZWRcbiAqIGJ5IHByZXNzaW5nIGJhY2tzcGFjZSBvbiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lIHdpdGggdGhlIGtleWJvYXJkLlxuICovXG52YXIgVHlwZWFoZWFkVG9rZW5pemVyID0gY3JlYXRlUmVhY3RDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIG5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgb3B0aW9uczogUHJvcFR5cGVzLmFycmF5LFxuICAgIGN1c3RvbUNsYXNzZXM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgYWxsb3dDdXN0b21WYWx1ZXM6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgZGVmYXVsdFNlbGVjdGVkOiBQcm9wVHlwZXMuYXJyYXksXG4gICAgaW5pdGlhbFZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBsYWNlaG9sZGVyOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBpbnB1dFByb3BzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIG9uVG9rZW5SZW1vdmU6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uS2V5RG93bjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlQcmVzczogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlVcDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Ub2tlbkFkZDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Gb2N1czogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25CbHVyOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBmaWx0ZXJPcHRpb246IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5mdW5jXSksXG4gICAgc2VhcmNoT3B0aW9uczogUHJvcFR5cGVzLmZ1bmMsXG4gICAgZGlzcGxheU9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBmb3JtSW5wdXRPcHRpb246IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5mdW5jXSksXG4gICAgbWF4VmlzaWJsZTogUHJvcFR5cGVzLm51bWJlcixcbiAgICByZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBkZWZhdWx0Q2xhc3NOYW1lczogUHJvcFR5cGVzLmJvb2wsXG4gICAgc2hvd09wdGlvbnNXaGVuRW1wdHk6IFByb3BUeXBlcy5ib29sXG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gV2UgbmVlZCB0byBjb3B5IHRoaXMgdG8gYXZvaWQgaW5jb3JyZWN0IHNoYXJpbmdcbiAgICAgIC8vIG9mIHN0YXRlIGFjcm9zcyBpbnN0YW5jZXMgKGUuZy4sIHZpYSBnZXREZWZhdWx0UHJvcHMoKSlcbiAgICAgIHNlbGVjdGVkOiB0aGlzLnByb3BzLmRlZmF1bHRTZWxlY3RlZC5zbGljZSgwKSxcblxuICAgICAgLy8gcmVmIGNhbGxiYWNrXG4gICAgICB0eXBlYWhlYWQ6IFJlYWN0LmNyZWF0ZVJlZigpXG4gICAgfTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBvcHRpb25zOiBbXSxcbiAgICAgIGRlZmF1bHRTZWxlY3RlZDogW10sXG4gICAgICBjdXN0b21DbGFzc2VzOiB7fSxcbiAgICAgIGFsbG93Q3VzdG9tVmFsdWVzOiAwLFxuICAgICAgaW5pdGlhbFZhbHVlOiBcIlwiLFxuICAgICAgcGxhY2Vob2xkZXI6IFwiXCIsXG4gICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICBpbnB1dFByb3BzOiB7fSxcbiAgICAgIGRlZmF1bHRDbGFzc05hbWVzOiB0cnVlLFxuICAgICAgZmlsdGVyT3B0aW9uOiBudWxsLFxuICAgICAgc2VhcmNoT3B0aW9uczogbnVsbCxcbiAgICAgIGRpc3BsYXlPcHRpb246IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgIH0sXG4gICAgICBmb3JtSW5wdXRPcHRpb246IG51bGwsXG4gICAgICBvbktleURvd246IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uS2V5UHJlc3M6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uS2V5VXA6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uQmx1cjogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25Ub2tlbkFkZDogZnVuY3Rpb24oKSB7fSxcbiAgICAgIG9uVG9rZW5SZW1vdmU6IGZ1bmN0aW9uKCkge30sXG4gICAgICBzaG93T3B0aW9uc1doZW5FbXB0eTogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIC8vIGlmIHdlIGdldCBuZXcgZGVmYXVsdFByb3BzLCB1cGRhdGUgc2VsZWN0ZWRcbiAgICBpZiAoXG4gICAgICBfYXJyYXlzQXJlRGlmZmVyZW50KHRoaXMucHJvcHMuZGVmYXVsdFNlbGVjdGVkLCBuZXh0UHJvcHMuZGVmYXVsdFNlbGVjdGVkKVxuICAgICkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkOiBuZXh0UHJvcHMuZGVmYXVsdFNlbGVjdGVkLnNsaWNlKDApIH0pO1xuICAgIH1cbiAgfSxcblxuICBmb2N1czogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdHlwZWFoZWFkLmZvY3VzKCk7XG4gIH0sXG5cbiAgZ2V0U2VsZWN0ZWRUb2tlbnM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnNlbGVjdGVkO1xuICB9LFxuXG4gIC8vIFRPRE86IFN1cHBvcnQgaW5pdGlhbGl6ZWQgdG9rZW5zXG4gIC8vXG4gIF9yZW5kZXJUb2tlbnM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0b2tlbkNsYXNzZXMgPSB7fTtcbiAgICB0b2tlbkNsYXNzZXNbdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLnRva2VuXSA9ICEhdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzXG4gICAgICAudG9rZW47XG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXModG9rZW5DbGFzc2VzKTtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZC5tYXAoZnVuY3Rpb24oc2VsZWN0ZWQpIHtcbiAgICAgIHZhciBkaXNwbGF5U3RyaW5nID0gQWNjZXNzb3IudmFsdWVGb3JPcHRpb24oXG4gICAgICAgIHRoaXMucHJvcHMuZGlzcGxheU9wdGlvbixcbiAgICAgICAgc2VsZWN0ZWRcbiAgICAgICk7XG4gICAgICB2YXIgdmFsdWUgPSBBY2Nlc3Nvci52YWx1ZUZvck9wdGlvbihcbiAgICAgICAgdGhpcy5wcm9wcy5mb3JtSW5wdXRPcHRpb24gfHwgdGhpcy5wcm9wcy5kaXNwbGF5T3B0aW9uLFxuICAgICAgICBzZWxlY3RlZFxuICAgICAgKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxUb2tlblxuICAgICAgICAgIGtleT17ZGlzcGxheVN0cmluZ31cbiAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTGlzdH1cbiAgICAgICAgICBvblJlbW92ZT17dGhpcy5fcmVtb3ZlVG9rZW5Gb3JWYWx1ZX1cbiAgICAgICAgICBvYmplY3Q9e3NlbGVjdGVkfVxuICAgICAgICAgIHZhbHVlPXt2YWx1ZX1cbiAgICAgICAgICBuYW1lPXt0aGlzLnByb3BzLm5hbWV9XG4gICAgICAgID5cbiAgICAgICAgICB7ZGlzcGxheVN0cmluZ31cbiAgICAgICAgPC9Ub2tlbj5cbiAgICAgICk7XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICBfZ2V0T3B0aW9uc0ZvclR5cGVhaGVhZDogZnVuY3Rpb24oKSB7XG4gICAgLy8gcmV0dXJuIHRoaXMucHJvcHMub3B0aW9ucyB3aXRob3V0IHRoaXMuc2VsZWN0ZWRcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vcHRpb25zO1xuICB9LFxuXG4gIF9vbktleURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gV2Ugb25seSBjYXJlIGFib3V0IGludGVyY2VwdGluZyBiYWNrc3BhY2VzXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IEtleUV2ZW50LkRPTV9WS19CQUNLX1NQQUNFKSB7XG4gICAgICByZXR1cm4gdGhpcy5faGFuZGxlQmFja3NwYWNlKGV2ZW50KTtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbktleURvd24oZXZlbnQpO1xuICB9LFxuXG4gIF9oYW5kbGVCYWNrc3BhY2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gTm8gdG9rZW5zXG4gICAgaWYgKCF0aGlzLnN0YXRlLnNlbGVjdGVkLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSB0b2tlbiBPTkxZIHdoZW4gYmtzcCBwcmVzc2VkIGF0IGJlZ2lubmluZyBvZiBsaW5lXG4gICAgLy8gd2l0aG91dCBhIHNlbGVjdGlvblxuICAgIC8vIHZhciBlbnRyeSA9IHRoaXMucmVmcy50eXBlYWhlYWQucmVmcy5lbnRyeTtcbiAgICB2YXIgZW50cnkgPSB0aGlzLl90eXBlYWhlYWQuX2VudHJ5O1xuICAgIGlmIChcbiAgICAgIGVudHJ5LnNlbGVjdGlvblN0YXJ0ID09IGVudHJ5LnNlbGVjdGlvbkVuZCAmJlxuICAgICAgZW50cnkuc2VsZWN0aW9uU3RhcnQgPT0gMFxuICAgICkge1xuICAgICAgdGhpcy5fcmVtb3ZlVG9rZW5Gb3JWYWx1ZShcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFt0aGlzLnN0YXRlLnNlbGVjdGVkLmxlbmd0aCAtIDFdXG4gICAgICApO1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH0sXG5cbiAgX3JlbW92ZVRva2VuRm9yVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZC5pbmRleE9mKHZhbHVlKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlLnNlbGVjdGVkLnNwbGljZShpbmRleCwgMSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkIH0pO1xuICAgIHRoaXMucHJvcHMub25Ub2tlblJlbW92ZSh2YWx1ZSk7XG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIF9hZGRUb2tlbkZvclZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkLmluZGV4T2YodmFsdWUpICE9IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWQucHVzaCh2YWx1ZSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkIH0pO1xuICAgIHRoaXMuX3R5cGVhaGVhZC5zZXRFbnRyeVRleHQoXCJcIik7XG4gICAgdGhpcy5wcm9wcy5vblRva2VuQWRkKHZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjbGFzc2VzID0ge307XG4gICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMudHlwZWFoZWFkXSA9ICEhdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzXG4gICAgICAudHlwZWFoZWFkO1xuICAgIHZhciBjbGFzc0xpc3QgPSBjbGFzc05hbWVzKGNsYXNzZXMpO1xuICAgIHZhciB0b2tlbml6ZXJDbGFzc2VzID0gW1xuICAgICAgdGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lcyAmJiBcInR5cGVhaGVhZC10b2tlbml6ZXJcIlxuICAgIF07XG4gICAgdG9rZW5pemVyQ2xhc3Nlc1t0aGlzLnByb3BzLmNsYXNzTmFtZV0gPSAhIXRoaXMucHJvcHMuY2xhc3NOYW1lO1xuICAgIHZhciB0b2tlbml6ZXJDbGFzc0xpc3QgPSBjbGFzc05hbWVzKHRva2VuaXplckNsYXNzZXMpO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyIHR5cGVhaGVhZFJlZiA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIF90aGlzLl90eXBlYWhlYWQgPSBjO1xuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e3Rva2VuaXplckNsYXNzTGlzdH0+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJUb2tlbnMoKX1cbiAgICAgICAgPFR5cGVhaGVhZFxuICAgICAgICAgIHJlZj17dHlwZWFoZWFkUmVmfVxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NMaXN0fVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfVxuICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAgIGlucHV0UHJvcHM9e3RoaXMucHJvcHMuaW5wdXRQcm9wc31cbiAgICAgICAgICBhbGxvd0N1c3RvbVZhbHVlcz17dGhpcy5wcm9wcy5hbGxvd0N1c3RvbVZhbHVlc31cbiAgICAgICAgICBjdXN0b21DbGFzc2VzPXt0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXN9XG4gICAgICAgICAgb3B0aW9ucz17dGhpcy5fZ2V0T3B0aW9uc0ZvclR5cGVhaGVhZCgpfVxuICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5wcm9wcy5pbml0aWFsVmFsdWV9XG4gICAgICAgICAgbWF4VmlzaWJsZT17dGhpcy5wcm9wcy5tYXhWaXNpYmxlfVxuICAgICAgICAgIHJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlPXt0aGlzLnByb3BzLnJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlfVxuICAgICAgICAgIG9uT3B0aW9uU2VsZWN0ZWQ9e3RoaXMuX2FkZFRva2VuRm9yVmFsdWV9XG4gICAgICAgICAgb25LZXlEb3duPXt0aGlzLl9vbktleURvd259XG4gICAgICAgICAgb25LZXlQcmVzcz17dGhpcy5wcm9wcy5vbktleVByZXNzfVxuICAgICAgICAgIG9uS2V5VXA9e3RoaXMucHJvcHMub25LZXlVcH1cbiAgICAgICAgICBvbkZvY3VzPXt0aGlzLnByb3BzLm9uRm9jdXN9XG4gICAgICAgICAgb25CbHVyPXt0aGlzLnByb3BzLm9uQmx1cn1cbiAgICAgICAgICBkaXNwbGF5T3B0aW9uPXt0aGlzLnByb3BzLmRpc3BsYXlPcHRpb259XG4gICAgICAgICAgZGVmYXVsdENsYXNzTmFtZXM9e3RoaXMucHJvcHMuZGVmYXVsdENsYXNzTmFtZXN9XG4gICAgICAgICAgZmlsdGVyT3B0aW9uPXt0aGlzLnByb3BzLmZpbHRlck9wdGlvbn1cbiAgICAgICAgICBzZWFyY2hPcHRpb25zPXt0aGlzLnByb3BzLnNlYXJjaE9wdGlvbnN9XG4gICAgICAgICAgc2hvd09wdGlvbnNXaGVuRW1wdHk9e3RoaXMucHJvcHMuc2hvd09wdGlvbnNXaGVuRW1wdHl9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlYWhlYWRUb2tlbml6ZXI7XG4iXX0=
},{"../accessor":19,"../keyevent":20,"../typeahead":24,"./token":23,"classnames":1,"create-react-class":3,"prop-types":14,"react":"react"}],23:[function(require,module,exports){
var React = window.React || require('react');
var classNames = require('classnames');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
var Token = createReactClass({
  displayName: 'Token',

  propTypes: {
    className: PropTypes.string,
    name: PropTypes.string,
    children: PropTypes.string,
    object: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onRemove: PropTypes.func,
    value: PropTypes.string
  },

  render: function () {
    var className = classNames(["typeahead-token", this.props.className]);

    return React.createElement(
      'div',
      { className: className },
      this._renderHiddenInput(),
      this.props.children,
      this._renderCloseButton()
    );
  },

  _renderHiddenInput: function () {
    // If no name was set, don't create a hidden input
    if (!this.props.name) {
      return null;
    }

    return React.createElement('input', {
      type: 'hidden',
      name: this.props.name + '[]',
      value: this.props.value || this.props.object
    });
  },

  _renderCloseButton: function () {
    if (!this.props.onRemove) {
      return "";
    }
    return React.createElement(
      'a',
      { className: this.props.className || "typeahead-token-close", href: '#', onClick: function (event) {
          this.props.onRemove(this.props.object);
          event.preventDefault();
        }.bind(this) },
      '\xD7'
    );
  }
});

module.exports = Token;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRva2VuLmpzIl0sIm5hbWVzIjpbIlJlYWN0IiwicmVxdWlyZSIsImNsYXNzTmFtZXMiLCJjcmVhdGVSZWFjdENsYXNzIiwiUHJvcFR5cGVzIiwiVG9rZW4iLCJwcm9wVHlwZXMiLCJjbGFzc05hbWUiLCJzdHJpbmciLCJuYW1lIiwiY2hpbGRyZW4iLCJvYmplY3QiLCJvbmVPZlR5cGUiLCJvblJlbW92ZSIsImZ1bmMiLCJ2YWx1ZSIsInJlbmRlciIsInByb3BzIiwiX3JlbmRlckhpZGRlbklucHV0IiwiX3JlbmRlckNsb3NlQnV0dG9uIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsImJpbmQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxRQUFRQyxRQUFRLE9BQVIsQ0FBWjtBQUNBLElBQUlDLGFBQWFELFFBQVEsWUFBUixDQUFqQjtBQUNBLElBQUlFLG1CQUFtQkYsUUFBUSxvQkFBUixDQUF2QjtBQUNBLElBQUlHLFlBQVlILFFBQVEsWUFBUixDQUFoQjs7QUFFQTs7OztBQUlBLElBQUlJLFFBQVFGLGlCQUFpQjtBQUFBOztBQUMzQkcsYUFBVztBQUNUQyxlQUFXSCxVQUFVSSxNQURaO0FBRVRDLFVBQU1MLFVBQVVJLE1BRlA7QUFHVEUsY0FBVU4sVUFBVUksTUFIWDtBQUlURyxZQUFRUCxVQUFVUSxTQUFWLENBQW9CLENBQzFCUixVQUFVSSxNQURnQixFQUUxQkosVUFBVU8sTUFGZ0IsQ0FBcEIsQ0FKQztBQVFURSxjQUFVVCxVQUFVVSxJQVJYO0FBU1RDLFdBQU9YLFVBQVVJO0FBVFIsR0FEZ0I7O0FBYTNCUSxVQUFRLFlBQVc7QUFDakIsUUFBSVQsWUFBWUwsV0FBVyxDQUN6QixpQkFEeUIsRUFFekIsS0FBS2UsS0FBTCxDQUFXVixTQUZjLENBQVgsQ0FBaEI7O0FBS0EsV0FDRTtBQUFBO0FBQUEsUUFBSyxXQUFXQSxTQUFoQjtBQUNHLFdBQUtXLGtCQUFMLEVBREg7QUFFRyxXQUFLRCxLQUFMLENBQVdQLFFBRmQ7QUFHRyxXQUFLUyxrQkFBTDtBQUhILEtBREY7QUFPRCxHQTFCMEI7O0FBNEIzQkQsc0JBQW9CLFlBQVc7QUFDN0I7QUFDQSxRQUFJLENBQUMsS0FBS0QsS0FBTCxDQUFXUixJQUFoQixFQUFzQjtBQUNwQixhQUFPLElBQVA7QUFDRDs7QUFFRCxXQUNFO0FBQ0UsWUFBSyxRQURQO0FBRUUsWUFBTyxLQUFLUSxLQUFMLENBQVdSLElBQVgsR0FBa0IsSUFGM0I7QUFHRSxhQUFRLEtBQUtRLEtBQUwsQ0FBV0YsS0FBWCxJQUFvQixLQUFLRSxLQUFMLENBQVdOO0FBSHpDLE1BREY7QUFPRCxHQXpDMEI7O0FBMkMzQlEsc0JBQW9CLFlBQVc7QUFDN0IsUUFBSSxDQUFDLEtBQUtGLEtBQUwsQ0FBV0osUUFBaEIsRUFBMEI7QUFDeEIsYUFBTyxFQUFQO0FBQ0Q7QUFDRCxXQUNFO0FBQUE7QUFBQSxRQUFHLFdBQVcsS0FBS0ksS0FBTCxDQUFXVixTQUFYLElBQXdCLHVCQUF0QyxFQUErRCxNQUFLLEdBQXBFLEVBQXdFLFNBQVMsVUFBU2EsS0FBVCxFQUFnQjtBQUM3RixlQUFLSCxLQUFMLENBQVdKLFFBQVgsQ0FBb0IsS0FBS0ksS0FBTCxDQUFXTixNQUEvQjtBQUNBUyxnQkFBTUMsY0FBTjtBQUNELFNBSDhFLENBRzdFQyxJQUg2RSxDQUd4RSxJQUh3RSxDQUFqRjtBQUFBO0FBQUEsS0FERjtBQU1EO0FBckQwQixDQUFqQixDQUFaOztBQXdEQUMsT0FBT0MsT0FBUCxHQUFpQm5CLEtBQWpCIiwiZmlsZSI6InRva2VuLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIGNyZWF0ZVJlYWN0Q2xhc3MgPSByZXF1aXJlKCdjcmVhdGUtcmVhY3QtY2xhc3MnKTtcbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbi8qKlxuICogRW5jYXBzdWxhdGVzIHRoZSByZW5kZXJpbmcgb2YgYW4gb3B0aW9uIHRoYXQgaGFzIGJlZW4gXCJzZWxlY3RlZFwiIGluIGFcbiAqIFR5cGVhaGVhZFRva2VuaXplclxuICovXG52YXIgVG9rZW4gPSBjcmVhdGVSZWFjdENsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgY2hpbGRyZW46IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgb2JqZWN0OiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBQcm9wVHlwZXMub2JqZWN0LFxuICAgIF0pLFxuICAgIG9uUmVtb3ZlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICB2YWx1ZTogUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzTmFtZSA9IGNsYXNzTmFtZXMoW1xuICAgICAgXCJ0eXBlYWhlYWQtdG9rZW5cIixcbiAgICAgIHRoaXMucHJvcHMuY2xhc3NOYW1lXG4gICAgXSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZX0+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJIaWRkZW5JbnB1dCgpfVxuICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgICAge3RoaXMuX3JlbmRlckNsb3NlQnV0dG9uKCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxuXG4gIF9yZW5kZXJIaWRkZW5JbnB1dDogZnVuY3Rpb24oKSB7XG4gICAgLy8gSWYgbm8gbmFtZSB3YXMgc2V0LCBkb24ndCBjcmVhdGUgYSBoaWRkZW4gaW5wdXRcbiAgICBpZiAoIXRoaXMucHJvcHMubmFtZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxpbnB1dFxuICAgICAgICB0eXBlPVwiaGlkZGVuXCJcbiAgICAgICAgbmFtZT17IHRoaXMucHJvcHMubmFtZSArICdbXScgfVxuICAgICAgICB2YWx1ZT17IHRoaXMucHJvcHMudmFsdWUgfHwgdGhpcy5wcm9wcy5vYmplY3QgfVxuICAgICAgLz5cbiAgICApO1xuICB9LFxuXG4gIF9yZW5kZXJDbG9zZUJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uUmVtb3ZlKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxhIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWUgfHwgXCJ0eXBlYWhlYWQtdG9rZW4tY2xvc2VcIn0gaHJlZj1cIiNcIiBvbkNsaWNrPXtmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIHRoaXMucHJvcHMub25SZW1vdmUodGhpcy5wcm9wcy5vYmplY3QpO1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0uYmluZCh0aGlzKX0+JiN4MDBkNzs8L2E+XG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9rZW47XG4iXX0=
},{"classnames":1,"create-react-class":3,"prop-types":14,"react":"react"}],24:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Accessor = require("../accessor");
var React = window.React || require('react');
var TypeaheadSelector = require("./selector");
var KeyEvent = require("../keyevent");
var fuzzy = require("fuzzy");
var classNames = require("classnames");
var createReactClass = require("create-react-class");
var PropTypes = require("prop-types");

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
var Typeahead = createReactClass({
  displayName: "Typeahead",

  propTypes: {
    name: PropTypes.string,
    customClasses: PropTypes.object,
    maxVisible: PropTypes.number,
    resultsTruncatedMessage: PropTypes.string,
    options: PropTypes.array,
    allowCustomValues: PropTypes.number,
    initialValue: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    textarea: PropTypes.bool,
    inputProps: PropTypes.object,
    onOptionSelected: PropTypes.func,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyPress: PropTypes.func,
    onKeyUp: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    filterOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    searchOptions: PropTypes.func,
    displayOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    inputDisplayOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    formInputOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    defaultClassNames: PropTypes.bool,
    customListComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    showOptionsWhenEmpty: PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      options: [],
      customClasses: {},
      allowCustomValues: 0,
      initialValue: "",
      value: "",
      placeholder: "",
      disabled: false,
      textarea: false,
      inputProps: {},
      onOptionSelected: function (option) {},
      onChange: function (event) {},
      onKeyDown: function (event) {},
      onKeyPress: function (event) {},
      onKeyUp: function (event) {},
      onFocus: function (event) {},
      onBlur: function (event) {},
      filterOption: null,
      searchOptions: null,
      inputDisplayOption: null,
      defaultClassNames: true,
      customListComponent: TypeaheadSelector,
      showOptionsWhenEmpty: false,
      resultsTruncatedMessage: null
    };
  },

  getInitialState: function () {
    return {
      // The options matching the entry value
      searchResults: this.getOptionsForValue(this.props.initialValue, this.props.options),

      // This should be called something else, "entryValue"
      entryValue: this.props.value || this.props.initialValue,

      // A valid typeahead value
      selection: this.props.value,

      // Index of the selection
      selectionIndex: null,

      // Keep track of the focus state of the input element, to determine
      // whether to show options when empty (if showOptionsWhenEmpty is true)
      isFocused: false,

      // true when focused, false onOptionSelected
      showResults: false
    };
  },

  _shouldSkipSearch: function (input) {
    var emptyValue = !input || input.trim().length == 0;

    // this.state must be checked because it may not be defined yet if this function
    // is called from within getInitialState
    var isFocused = this.state && this.state.isFocused;
    return !(this.props.showOptionsWhenEmpty && isFocused) && emptyValue;
  },

  getOptionsForValue: function (value, options) {
    if (this._shouldSkipSearch(value)) {
      return [];
    }

    var searchOptions = this._generateSearchFunction();
    return searchOptions(value, options);
  },

  setEntryText: function (value) {
    this._entry.value = value;
    this._onTextEntryUpdated();
  },

  focus: function () {
    this._entry.focus();
  },

  _hasCustomValue: function () {
    if (this.props.allowCustomValues > 0 && this.state.entryValue.length >= this.props.allowCustomValues && this.state.searchResults.indexOf(this.state.entryValue) < 0) {
      return true;
    }
    return false;
  },

  _getCustomValue: function () {
    if (this._hasCustomValue()) {
      return this.state.entryValue;
    }
    return null;
  },

  _renderIncrementalSearchResults: function () {
    // Nothing has been entered into the textbox
    if (this._shouldSkipSearch(this.state.entryValue)) {
      return "";
    }

    // Something was just selected
    if (this.state.selection) {
      return "";
    }

    var _this = this;
    var selRef = function (c) {
      _this.sel = c;
    };

    return React.createElement(this.props.customListComponent, {
      ref: selRef,
      options: this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible) : this.state.searchResults,
      areResultsTruncated: this.props.maxVisible && this.state.searchResults.length > this.props.maxVisible,
      resultsTruncatedMessage: this.props.resultsTruncatedMessage,
      onOptionSelected: this._onOptionSelected,
      allowCustomValues: this.props.allowCustomValues,
      customValue: this._getCustomValue(),
      customClasses: this.props.customClasses,
      selectionIndex: this.state.selectionIndex,
      defaultClassNames: this.props.defaultClassNames,
      displayOption: Accessor.generateOptionToStringFor(this.props.displayOption)
    });
  },

  getSelection: function () {
    var index = this.state.selectionIndex;
    if (this._hasCustomValue()) {
      if (index === 0) {
        return this.state.entryValue;
      } else {
        index--;
      }
    }
    return this.state.searchResults[index];
  },

  _onOptionSelected: function (option, event) {
    // Accessing the ref using this.props.inputField.value;
    var nEntry = this._entry;
    nEntry.focus();

    var displayOption = Accessor.generateOptionToStringFor(this.props.inputDisplayOption || this.props.displayOption);
    var optionString = displayOption(option, 0);

    var formInputOption = Accessor.generateOptionToStringFor(this.props.formInputOption || displayOption);
    var formInputOptionString = formInputOption(option);

    nEntry.value = optionString;
    this.setState({
      searchResults: this.getOptionsForValue(optionString, this.props.options),
      selection: formInputOptionString,
      entryValue: optionString,
      showResults: false
    });
    return this.props.onOptionSelected(option, event);
  },

  _onTextEntryUpdated: function () {
    var value = this._entry.value;
    this.setState({
      searchResults: this.getOptionsForValue(value, this.props.options),
      selection: "",
      entryValue: value
    });
  },

  _onEnter: function (event) {
    var selection = this.getSelection();
    if (!selection) {
      return this.props.onKeyDown(event);
    }
    return this._onOptionSelected(selection, event);
  },

  _onEscape: function () {
    this.setState({
      selectionIndex: null
    });
  },

  _onTab: function (event) {
    var selection = this.getSelection();
    var option = selection ? selection : this.state.searchResults.length > 0 ? this.state.searchResults[0] : null;

    if (option === null && this._hasCustomValue()) {
      option = this._getCustomValue();
    }

    if (option !== null) {
      return this._onOptionSelected(option, event);
    }
  },

  eventMap: function (event) {
    var events = {};

    events[KeyEvent.DOM_VK_UP] = this.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  },

  _nav: function (delta) {
    if (!this._hasHint()) {
      return;
    }
    var newIndex = this.state.selectionIndex === null ? delta == 1 ? 0 : delta : this.state.selectionIndex + delta;
    var length = this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible).length : this.state.searchResults.length;
    if (this._hasCustomValue()) {
      length += 1;
    }

    if (newIndex < 0) {
      newIndex += length;
    } else if (newIndex >= length) {
      newIndex -= length;
    }

    this.setState({ selectionIndex: newIndex });
  },

  navDown: function () {
    this._nav(1);
  },

  navUp: function () {
    this._nav(-1);
  },

  _onChange: function (event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
    this._onTextEntryUpdated();
  },

  _onKeyDown: function (event) {
    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler.
    // Also skip if the user is pressing the shift key, since none of our handlers are looking for shift
    if (!this._hasHint() || event.shiftKey) {
      return this.props.onKeyDown(event);
    }

    var handler = this.eventMap()[event.keyCode];

    if (handler) {
      handler(event);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    event.preventDefault();
  },

  componentWillReceiveProps: function (nextProps) {
    var searchResults = this.getOptionsForValue(this.state.entryValue, nextProps.options);
    var showResults = Boolean(searchResults.length) && this.state.isFocused;
    this.setState({
      searchResults: searchResults,
      showResults: showResults
    });
  },

  render: function () {
    var inputClasses = {};
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    var inputClassList = classNames(inputClasses);

    var classes = {
      typeahead: this.props.defaultClassNames
    };
    classes[this.props.className] = !!this.props.className;
    var classList = classNames(classes);

    var InputElement = this.props.textarea ? "textarea" : "input";

    var _this = this;
    var entryRef = function (c) {
      _this._entry = c;
    };
    return React.createElement(
      "div",
      { className: classList },
      this._renderHiddenInput(),
      React.createElement(InputElement, _extends({
        ref: entryRef,
        type: "text",
        disabled: this.props.disabled
      }, this.props.inputProps, {
        placeholder: this.props.placeholder,
        className: inputClassList,
        value: this.state.entryValue,
        onChange: this._onChange,
        onKeyDown: this._onKeyDown,
        onKeyPress: this.props.onKeyPress,
        onKeyUp: this.props.onKeyUp,
        onFocus: this._onFocus,
        onBlur: this._onBlur
      })),
      this.state.showResults && this._renderIncrementalSearchResults()
    );
  },
  _onFocus: function (event) {
    this.setState({ isFocused: true, showResults: true }, function () {
      this._onTextEntryUpdated();
    }.bind(this));
    if (this.props.onFocus) {
      return this.props.onFocus(event);
    }
  },

  _onBlur: function (event) {
    this.setState({ isFocused: false }, function () {
      this._onTextEntryUpdated();
    }.bind(this));
    if (this.props.onBlur) {
      return this.props.onBlur(event);
    }
  },

  _renderHiddenInput: function () {
    if (!this.props.name) {
      return null;
    }

    return React.createElement("input", {
      type: "hidden",
      name: this.props.name,
      value: this.state.selection
    });
  },

  _generateSearchFunction: function () {
    var searchOptionsProp = this.props.searchOptions;
    var filterOptionProp = this.props.filterOption;
    if (typeof searchOptionsProp === "function") {
      if (filterOptionProp !== null) {
        console.warn("searchOptions prop is being used, filterOption prop will be ignored");
      }
      return searchOptionsProp;
    } else if (typeof filterOptionProp === "function") {
      return function (value, options) {
        return options.filter(function (o) {
          return filterOptionProp(value, o);
        });
      };
    } else {
      var mapper;
      if (typeof filterOptionProp === "string") {
        mapper = Accessor.generateAccessor(filterOptionProp);
      } else {
        mapper = Accessor.IDENTITY_FN;
      }
      return function (value, options) {
        return fuzzy.filter(value, options, { extract: mapper }).map(function (res) {
          return options[res.index];
        });
      };
    }
  },

  _hasHint: function () {
    return this.state.searchResults.length > 0 || this._hasCustomValue();
  }
});

module.exports = Typeahead;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwicmVxdWlyZSIsIlJlYWN0IiwiVHlwZWFoZWFkU2VsZWN0b3IiLCJLZXlFdmVudCIsImZ1enp5IiwiY2xhc3NOYW1lcyIsImNyZWF0ZVJlYWN0Q2xhc3MiLCJQcm9wVHlwZXMiLCJUeXBlYWhlYWQiLCJwcm9wVHlwZXMiLCJuYW1lIiwic3RyaW5nIiwiY3VzdG9tQ2xhc3NlcyIsIm9iamVjdCIsIm1heFZpc2libGUiLCJudW1iZXIiLCJyZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZSIsIm9wdGlvbnMiLCJhcnJheSIsImFsbG93Q3VzdG9tVmFsdWVzIiwiaW5pdGlhbFZhbHVlIiwidmFsdWUiLCJwbGFjZWhvbGRlciIsImRpc2FibGVkIiwiYm9vbCIsInRleHRhcmVhIiwiaW5wdXRQcm9wcyIsIm9uT3B0aW9uU2VsZWN0ZWQiLCJmdW5jIiwib25DaGFuZ2UiLCJvbktleURvd24iLCJvbktleVByZXNzIiwib25LZXlVcCIsIm9uRm9jdXMiLCJvbkJsdXIiLCJmaWx0ZXJPcHRpb24iLCJvbmVPZlR5cGUiLCJzZWFyY2hPcHRpb25zIiwiZGlzcGxheU9wdGlvbiIsImlucHV0RGlzcGxheU9wdGlvbiIsImZvcm1JbnB1dE9wdGlvbiIsImRlZmF1bHRDbGFzc05hbWVzIiwiY3VzdG9tTGlzdENvbXBvbmVudCIsImVsZW1lbnQiLCJzaG93T3B0aW9uc1doZW5FbXB0eSIsImdldERlZmF1bHRQcm9wcyIsIm9wdGlvbiIsImV2ZW50IiwiZ2V0SW5pdGlhbFN0YXRlIiwic2VhcmNoUmVzdWx0cyIsImdldE9wdGlvbnNGb3JWYWx1ZSIsInByb3BzIiwiZW50cnlWYWx1ZSIsInNlbGVjdGlvbiIsInNlbGVjdGlvbkluZGV4IiwiaXNGb2N1c2VkIiwic2hvd1Jlc3VsdHMiLCJfc2hvdWxkU2tpcFNlYXJjaCIsImlucHV0IiwiZW1wdHlWYWx1ZSIsInRyaW0iLCJsZW5ndGgiLCJzdGF0ZSIsIl9nZW5lcmF0ZVNlYXJjaEZ1bmN0aW9uIiwic2V0RW50cnlUZXh0IiwiX2VudHJ5IiwiX29uVGV4dEVudHJ5VXBkYXRlZCIsImZvY3VzIiwiX2hhc0N1c3RvbVZhbHVlIiwiaW5kZXhPZiIsIl9nZXRDdXN0b21WYWx1ZSIsIl9yZW5kZXJJbmNyZW1lbnRhbFNlYXJjaFJlc3VsdHMiLCJfdGhpcyIsInNlbFJlZiIsImMiLCJzZWwiLCJzbGljZSIsIl9vbk9wdGlvblNlbGVjdGVkIiwiZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0ZvciIsImdldFNlbGVjdGlvbiIsImluZGV4IiwibkVudHJ5Iiwib3B0aW9uU3RyaW5nIiwiZm9ybUlucHV0T3B0aW9uU3RyaW5nIiwic2V0U3RhdGUiLCJfb25FbnRlciIsIl9vbkVzY2FwZSIsIl9vblRhYiIsImV2ZW50TWFwIiwiZXZlbnRzIiwiRE9NX1ZLX1VQIiwibmF2VXAiLCJET01fVktfRE9XTiIsIm5hdkRvd24iLCJET01fVktfUkVUVVJOIiwiRE9NX1ZLX0VOVEVSIiwiRE9NX1ZLX0VTQ0FQRSIsIkRPTV9WS19UQUIiLCJfbmF2IiwiZGVsdGEiLCJfaGFzSGludCIsIm5ld0luZGV4IiwiX29uQ2hhbmdlIiwiX29uS2V5RG93biIsInNoaWZ0S2V5IiwiaGFuZGxlciIsImtleUNvZGUiLCJwcmV2ZW50RGVmYXVsdCIsImNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXh0UHJvcHMiLCJCb29sZWFuIiwicmVuZGVyIiwiaW5wdXRDbGFzc2VzIiwiaW5wdXRDbGFzc0xpc3QiLCJjbGFzc2VzIiwidHlwZWFoZWFkIiwiY2xhc3NOYW1lIiwiY2xhc3NMaXN0IiwiSW5wdXRFbGVtZW50IiwiZW50cnlSZWYiLCJfcmVuZGVySGlkZGVuSW5wdXQiLCJfb25Gb2N1cyIsIl9vbkJsdXIiLCJiaW5kIiwic2VhcmNoT3B0aW9uc1Byb3AiLCJmaWx0ZXJPcHRpb25Qcm9wIiwiY29uc29sZSIsIndhcm4iLCJmaWx0ZXIiLCJvIiwibWFwcGVyIiwiZ2VuZXJhdGVBY2Nlc3NvciIsIklERU5USVRZX0ZOIiwiZXh0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UEQsTUFPTyxJQUFJLE9BQU9DLGdCQUFQLEtBQTRCLFVBQWhDLEVBQTRDO0FBQ2pELGFBQU8sVUFBU3hHLEtBQVQsRUFBZ0JKLE9BQWhCLEVBQXlCO0FBQzlCLGVBQU9BLFFBQVErRyxNQUFSLENBQWUsVUFBU0MsQ0FBVCxFQUFZO0FBQ2hDLGlCQUFPSixpQkFBaUJ4RyxLQUFqQixFQUF3QjRHLENBQXhCLENBQVA7QUFDRCxTQUZNLENBQVA7QUFHRCxPQUpEO0FBS0QsS0FOTSxNQU1BO0FBQ0wsVUFBSUMsTUFBSjtBQUNBLFVBQUksT0FBT0wsZ0JBQVAsS0FBNEIsUUFBaEMsRUFBMEM7QUFDeENLLGlCQUFTbkksU0FBU29JLGdCQUFULENBQTBCTixnQkFBMUIsQ0FBVDtBQUNELE9BRkQsTUFFTztBQUNMSyxpQkFBU25JLFNBQVNxSSxXQUFsQjtBQUNEO0FBQ0QsYUFBTyxVQUFTL0csS0FBVCxFQUFnQkosT0FBaEIsRUFBeUI7QUFDOUIsZUFBT2IsTUFDSjRILE1BREksQ0FDRzNHLEtBREgsRUFDVUosT0FEVixFQUNtQixFQUFFb0gsU0FBU0gsTUFBWCxFQURuQixFQUVKSSxHQUZJLENBRUEsVUFBU0MsR0FBVCxFQUFjO0FBQ2pCLGlCQUFPdEgsUUFBUXNILElBQUl2RCxLQUFaLENBQVA7QUFDRCxTQUpJLENBQVA7QUFLRCxPQU5EO0FBT0Q7QUFDRixHQS9iOEI7O0FBaWMvQm9CLFlBQVUsWUFBVztBQUNuQixXQUFPLEtBQUt0QyxLQUFMLENBQVdiLGFBQVgsQ0FBeUJZLE1BQXpCLEdBQWtDLENBQWxDLElBQXVDLEtBQUtPLGVBQUwsRUFBOUM7QUFDRDtBQW5jOEIsQ0FBakIsQ0FBaEI7O0FBc2NBb0UsT0FBT0MsT0FBUCxHQUFpQmpJLFNBQWpCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFjY2Vzc29yID0gcmVxdWlyZShcIi4uL2FjY2Vzc29yXCIpO1xudmFyIFJlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xudmFyIFR5cGVhaGVhZFNlbGVjdG9yID0gcmVxdWlyZShcIi4vc2VsZWN0b3JcIik7XG52YXIgS2V5RXZlbnQgPSByZXF1aXJlKFwiLi4va2V5ZXZlbnRcIik7XG52YXIgZnV6enkgPSByZXF1aXJlKFwiZnV6enlcIik7XG52YXIgY2xhc3NOYW1lcyA9IHJlcXVpcmUoXCJjbGFzc25hbWVzXCIpO1xudmFyIGNyZWF0ZVJlYWN0Q2xhc3MgPSByZXF1aXJlKFwiY3JlYXRlLXJlYWN0LWNsYXNzXCIpO1xudmFyIFByb3BUeXBlcyA9IHJlcXVpcmUoXCJwcm9wLXR5cGVzXCIpO1xuXG4vKipcbiAqIEEgXCJ0eXBlYWhlYWRcIiwgYW4gYXV0by1jb21wbGV0aW5nIHRleHQgaW5wdXRcbiAqXG4gKiBSZW5kZXJzIGFuIHRleHQgaW5wdXQgdGhhdCBzaG93cyBvcHRpb25zIG5lYXJieSB0aGF0IHlvdSBjYW4gdXNlIHRoZVxuICoga2V5Ym9hcmQgb3IgbW91c2UgdG8gc2VsZWN0LiAgUmVxdWlyZXMgQ1NTIGZvciBNQVNTSVZFIERBTUFHRS5cbiAqL1xudmFyIFR5cGVhaGVhZCA9IGNyZWF0ZVJlYWN0Q2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGN1c3RvbUNsYXNzZXM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgbWF4VmlzaWJsZTogUHJvcFR5cGVzLm51bWJlcixcbiAgICByZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBvcHRpb25zOiBQcm9wVHlwZXMuYXJyYXksXG4gICAgYWxsb3dDdXN0b21WYWx1ZXM6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgaW5pdGlhbFZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBsYWNlaG9sZGVyOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB0ZXh0YXJlYTogUHJvcFR5cGVzLmJvb2wsXG4gICAgaW5wdXRQcm9wczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBvbk9wdGlvblNlbGVjdGVkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlEb3duOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbktleVByZXNzOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbktleVVwOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkZvY3VzOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkJsdXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIGZpbHRlck9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBzZWFyY2hPcHRpb25zOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBkaXNwbGF5T3B0aW9uOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMuZnVuY10pLFxuICAgIGlucHV0RGlzcGxheU9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBmb3JtSW5wdXRPcHRpb246IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5mdW5jXSksXG4gICAgZGVmYXVsdENsYXNzTmFtZXM6IFByb3BUeXBlcy5ib29sLFxuICAgIGN1c3RvbUxpc3RDb21wb25lbnQ6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUHJvcFR5cGVzLmVsZW1lbnQsXG4gICAgICBQcm9wVHlwZXMuZnVuY1xuICAgIF0pLFxuICAgIHNob3dPcHRpb25zV2hlbkVtcHR5OiBQcm9wVHlwZXMuYm9vbFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9wdGlvbnM6IFtdLFxuICAgICAgY3VzdG9tQ2xhc3Nlczoge30sXG4gICAgICBhbGxvd0N1c3RvbVZhbHVlczogMCxcbiAgICAgIGluaXRpYWxWYWx1ZTogXCJcIixcbiAgICAgIHZhbHVlOiBcIlwiLFxuICAgICAgcGxhY2Vob2xkZXI6IFwiXCIsXG4gICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICB0ZXh0YXJlYTogZmFsc2UsXG4gICAgICBpbnB1dFByb3BzOiB7fSxcbiAgICAgIG9uT3B0aW9uU2VsZWN0ZWQ6IGZ1bmN0aW9uKG9wdGlvbikge30sXG4gICAgICBvbkNoYW5nZTogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25LZXlEb3duOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBvbktleVByZXNzOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBvbktleVVwOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBvbkZvY3VzOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBvbkJsdXI6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIGZpbHRlck9wdGlvbjogbnVsbCxcbiAgICAgIHNlYXJjaE9wdGlvbnM6IG51bGwsXG4gICAgICBpbnB1dERpc3BsYXlPcHRpb246IG51bGwsXG4gICAgICBkZWZhdWx0Q2xhc3NOYW1lczogdHJ1ZSxcbiAgICAgIGN1c3RvbUxpc3RDb21wb25lbnQ6IFR5cGVhaGVhZFNlbGVjdG9yLFxuICAgICAgc2hvd09wdGlvbnNXaGVuRW1wdHk6IGZhbHNlLFxuICAgICAgcmVzdWx0c1RydW5jYXRlZE1lc3NhZ2U6IG51bGxcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFRoZSBvcHRpb25zIG1hdGNoaW5nIHRoZSBlbnRyeSB2YWx1ZVxuICAgICAgc2VhcmNoUmVzdWx0czogdGhpcy5nZXRPcHRpb25zRm9yVmFsdWUoXG4gICAgICAgIHRoaXMucHJvcHMuaW5pdGlhbFZhbHVlLFxuICAgICAgICB0aGlzLnByb3BzLm9wdGlvbnNcbiAgICAgICksXG5cbiAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGNhbGxlZCBzb21ldGhpbmcgZWxzZSwgXCJlbnRyeVZhbHVlXCJcbiAgICAgIGVudHJ5VmFsdWU6IHRoaXMucHJvcHMudmFsdWUgfHwgdGhpcy5wcm9wcy5pbml0aWFsVmFsdWUsXG5cbiAgICAgIC8vIEEgdmFsaWQgdHlwZWFoZWFkIHZhbHVlXG4gICAgICBzZWxlY3Rpb246IHRoaXMucHJvcHMudmFsdWUsXG5cbiAgICAgIC8vIEluZGV4IG9mIHRoZSBzZWxlY3Rpb25cbiAgICAgIHNlbGVjdGlvbkluZGV4OiBudWxsLFxuXG4gICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBmb2N1cyBzdGF0ZSBvZiB0aGUgaW5wdXQgZWxlbWVudCwgdG8gZGV0ZXJtaW5lXG4gICAgICAvLyB3aGV0aGVyIHRvIHNob3cgb3B0aW9ucyB3aGVuIGVtcHR5IChpZiBzaG93T3B0aW9uc1doZW5FbXB0eSBpcyB0cnVlKVxuICAgICAgaXNGb2N1c2VkOiBmYWxzZSxcblxuICAgICAgLy8gdHJ1ZSB3aGVuIGZvY3VzZWQsIGZhbHNlIG9uT3B0aW9uU2VsZWN0ZWRcbiAgICAgIHNob3dSZXN1bHRzOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgX3Nob3VsZFNraXBTZWFyY2g6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgdmFyIGVtcHR5VmFsdWUgPSAhaW5wdXQgfHwgaW5wdXQudHJpbSgpLmxlbmd0aCA9PSAwO1xuXG4gICAgLy8gdGhpcy5zdGF0ZSBtdXN0IGJlIGNoZWNrZWQgYmVjYXVzZSBpdCBtYXkgbm90IGJlIGRlZmluZWQgeWV0IGlmIHRoaXMgZnVuY3Rpb25cbiAgICAvLyBpcyBjYWxsZWQgZnJvbSB3aXRoaW4gZ2V0SW5pdGlhbFN0YXRlXG4gICAgdmFyIGlzRm9jdXNlZCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5pc0ZvY3VzZWQ7XG4gICAgcmV0dXJuICEodGhpcy5wcm9wcy5zaG93T3B0aW9uc1doZW5FbXB0eSAmJiBpc0ZvY3VzZWQpICYmIGVtcHR5VmFsdWU7XG4gIH0sXG5cbiAgZ2V0T3B0aW9uc0ZvclZhbHVlOiBmdW5jdGlvbih2YWx1ZSwgb3B0aW9ucykge1xuICAgIGlmICh0aGlzLl9zaG91bGRTa2lwU2VhcmNoKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHZhciBzZWFyY2hPcHRpb25zID0gdGhpcy5fZ2VuZXJhdGVTZWFyY2hGdW5jdGlvbigpO1xuICAgIHJldHVybiBzZWFyY2hPcHRpb25zKHZhbHVlLCBvcHRpb25zKTtcbiAgfSxcblxuICBzZXRFbnRyeVRleHQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdGhpcy5fZW50cnkudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLl9vblRleHRFbnRyeVVwZGF0ZWQoKTtcbiAgfSxcblxuICBmb2N1czogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fZW50cnkuZm9jdXMoKTtcbiAgfSxcblxuICBfaGFzQ3VzdG9tVmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgIGlmIChcbiAgICAgIHRoaXMucHJvcHMuYWxsb3dDdXN0b21WYWx1ZXMgPiAwICYmXG4gICAgICB0aGlzLnN0YXRlLmVudHJ5VmFsdWUubGVuZ3RoID49IHRoaXMucHJvcHMuYWxsb3dDdXN0b21WYWx1ZXMgJiZcbiAgICAgIHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5pbmRleE9mKHRoaXMuc3RhdGUuZW50cnlWYWx1ZSkgPCAwXG4gICAgKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIF9nZXRDdXN0b21WYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2hhc0N1c3RvbVZhbHVlKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLmVudHJ5VmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIF9yZW5kZXJJbmNyZW1lbnRhbFNlYXJjaFJlc3VsdHM6IGZ1bmN0aW9uKCkge1xuICAgIC8vIE5vdGhpbmcgaGFzIGJlZW4gZW50ZXJlZCBpbnRvIHRoZSB0ZXh0Ym94XG4gICAgaWYgKHRoaXMuX3Nob3VsZFNraXBTZWFyY2godGhpcy5zdGF0ZS5lbnRyeVZhbHVlKSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgLy8gU29tZXRoaW5nIHdhcyBqdXN0IHNlbGVjdGVkXG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBzZWxSZWYgPSBmdW5jdGlvbihjKSB7XG4gICAgICBfdGhpcy5zZWwgPSBjO1xuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHRoaXMucHJvcHMuY3VzdG9tTGlzdENvbXBvbmVudFxuICAgICAgICByZWY9e3NlbFJlZn1cbiAgICAgICAgb3B0aW9ucz17XG4gICAgICAgICAgdGhpcy5wcm9wcy5tYXhWaXNpYmxlXG4gICAgICAgICAgICA/IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5zbGljZSgwLCB0aGlzLnByb3BzLm1heFZpc2libGUpXG4gICAgICAgICAgICA6IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0c1xuICAgICAgICB9XG4gICAgICAgIGFyZVJlc3VsdHNUcnVuY2F0ZWQ9e1xuICAgICAgICAgIHRoaXMucHJvcHMubWF4VmlzaWJsZSAmJlxuICAgICAgICAgIHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5sZW5ndGggPiB0aGlzLnByb3BzLm1heFZpc2libGVcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZT17dGhpcy5wcm9wcy5yZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZX1cbiAgICAgICAgb25PcHRpb25TZWxlY3RlZD17dGhpcy5fb25PcHRpb25TZWxlY3RlZH1cbiAgICAgICAgYWxsb3dDdXN0b21WYWx1ZXM9e3RoaXMucHJvcHMuYWxsb3dDdXN0b21WYWx1ZXN9XG4gICAgICAgIGN1c3RvbVZhbHVlPXt0aGlzLl9nZXRDdXN0b21WYWx1ZSgpfVxuICAgICAgICBjdXN0b21DbGFzc2VzPXt0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXN9XG4gICAgICAgIHNlbGVjdGlvbkluZGV4PXt0aGlzLnN0YXRlLnNlbGVjdGlvbkluZGV4fVxuICAgICAgICBkZWZhdWx0Q2xhc3NOYW1lcz17dGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lc31cbiAgICAgICAgZGlzcGxheU9wdGlvbj17QWNjZXNzb3IuZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0ZvcihcbiAgICAgICAgICB0aGlzLnByb3BzLmRpc3BsYXlPcHRpb25cbiAgICAgICAgKX1cbiAgICAgIC8+XG4gICAgKTtcbiAgfSxcblxuICBnZXRTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXg7XG4gICAgaWYgKHRoaXMuX2hhc0N1c3RvbVZhbHVlKCkpIHtcbiAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5lbnRyeVZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5kZXgtLTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0c1tpbmRleF07XG4gIH0sXG5cbiAgX29uT3B0aW9uU2VsZWN0ZWQ6IGZ1bmN0aW9uKG9wdGlvbiwgZXZlbnQpIHtcbiAgICAvLyBBY2Nlc3NpbmcgdGhlIHJlZiB1c2luZyB0aGlzLnByb3BzLmlucHV0RmllbGQudmFsdWU7XG4gICAgdmFyIG5FbnRyeSA9IHRoaXMuX2VudHJ5O1xuICAgIG5FbnRyeS5mb2N1cygpO1xuXG4gICAgdmFyIGRpc3BsYXlPcHRpb24gPSBBY2Nlc3Nvci5nZW5lcmF0ZU9wdGlvblRvU3RyaW5nRm9yKFxuICAgICAgdGhpcy5wcm9wcy5pbnB1dERpc3BsYXlPcHRpb24gfHwgdGhpcy5wcm9wcy5kaXNwbGF5T3B0aW9uXG4gICAgKTtcbiAgICB2YXIgb3B0aW9uU3RyaW5nID0gZGlzcGxheU9wdGlvbihvcHRpb24sIDApO1xuXG4gICAgdmFyIGZvcm1JbnB1dE9wdGlvbiA9IEFjY2Vzc29yLmdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3IoXG4gICAgICB0aGlzLnByb3BzLmZvcm1JbnB1dE9wdGlvbiB8fCBkaXNwbGF5T3B0aW9uXG4gICAgKTtcbiAgICB2YXIgZm9ybUlucHV0T3B0aW9uU3RyaW5nID0gZm9ybUlucHV0T3B0aW9uKG9wdGlvbik7XG5cbiAgICBuRW50cnkudmFsdWUgPSBvcHRpb25TdHJpbmc7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWFyY2hSZXN1bHRzOiB0aGlzLmdldE9wdGlvbnNGb3JWYWx1ZShvcHRpb25TdHJpbmcsIHRoaXMucHJvcHMub3B0aW9ucyksXG4gICAgICBzZWxlY3Rpb246IGZvcm1JbnB1dE9wdGlvblN0cmluZyxcbiAgICAgIGVudHJ5VmFsdWU6IG9wdGlvblN0cmluZyxcbiAgICAgIHNob3dSZXN1bHRzOiBmYWxzZVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uT3B0aW9uU2VsZWN0ZWQob3B0aW9uLCBldmVudCk7XG4gIH0sXG5cbiAgX29uVGV4dEVudHJ5VXBkYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5fZW50cnkudmFsdWU7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWFyY2hSZXN1bHRzOiB0aGlzLmdldE9wdGlvbnNGb3JWYWx1ZSh2YWx1ZSwgdGhpcy5wcm9wcy5vcHRpb25zKSxcbiAgICAgIHNlbGVjdGlvbjogXCJcIixcbiAgICAgIGVudHJ5VmFsdWU6IHZhbHVlXG4gICAgfSk7XG4gIH0sXG5cbiAgX29uRW50ZXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIHNlbGVjdGlvbiA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG4gICAgaWYgKCFzZWxlY3Rpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uS2V5RG93bihldmVudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vbk9wdGlvblNlbGVjdGVkKHNlbGVjdGlvbiwgZXZlbnQpO1xuICB9LFxuXG4gIF9vbkVzY2FwZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3Rpb25JbmRleDogbnVsbFxuICAgIH0pO1xuICB9LFxuXG4gIF9vblRhYjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgc2VsZWN0aW9uID0gdGhpcy5nZXRTZWxlY3Rpb24oKTtcbiAgICB2YXIgb3B0aW9uID0gc2VsZWN0aW9uXG4gICAgICA/IHNlbGVjdGlvblxuICAgICAgOiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMubGVuZ3RoID4gMFxuICAgICAgPyB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHNbMF1cbiAgICAgIDogbnVsbDtcblxuICAgIGlmIChvcHRpb24gPT09IG51bGwgJiYgdGhpcy5faGFzQ3VzdG9tVmFsdWUoKSkge1xuICAgICAgb3B0aW9uID0gdGhpcy5fZ2V0Q3VzdG9tVmFsdWUoKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9uICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fb25PcHRpb25TZWxlY3RlZChvcHRpb24sIGV2ZW50KTtcbiAgICB9XG4gIH0sXG5cbiAgZXZlbnRNYXA6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGV2ZW50cyA9IHt9O1xuXG4gICAgZXZlbnRzW0tleUV2ZW50LkRPTV9WS19VUF0gPSB0aGlzLm5hdlVwO1xuICAgIGV2ZW50c1tLZXlFdmVudC5ET01fVktfRE9XTl0gPSB0aGlzLm5hdkRvd247XG4gICAgZXZlbnRzW0tleUV2ZW50LkRPTV9WS19SRVRVUk5dID0gZXZlbnRzW1xuICAgICAgS2V5RXZlbnQuRE9NX1ZLX0VOVEVSXG4gICAgXSA9IHRoaXMuX29uRW50ZXI7XG4gICAgZXZlbnRzW0tleUV2ZW50LkRPTV9WS19FU0NBUEVdID0gdGhpcy5fb25Fc2NhcGU7XG4gICAgZXZlbnRzW0tleUV2ZW50LkRPTV9WS19UQUJdID0gdGhpcy5fb25UYWI7XG5cbiAgICByZXR1cm4gZXZlbnRzO1xuICB9LFxuXG4gIF9uYXY6IGZ1bmN0aW9uKGRlbHRhKSB7XG4gICAgaWYgKCF0aGlzLl9oYXNIaW50KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIG5ld0luZGV4ID1cbiAgICAgIHRoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXggPT09IG51bGxcbiAgICAgICAgPyBkZWx0YSA9PSAxXG4gICAgICAgICAgPyAwXG4gICAgICAgICAgOiBkZWx0YVxuICAgICAgICA6IHRoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXggKyBkZWx0YTtcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy5wcm9wcy5tYXhWaXNpYmxlXG4gICAgICA/IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5zbGljZSgwLCB0aGlzLnByb3BzLm1heFZpc2libGUpLmxlbmd0aFxuICAgICAgOiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMubGVuZ3RoO1xuICAgIGlmICh0aGlzLl9oYXNDdXN0b21WYWx1ZSgpKSB7XG4gICAgICBsZW5ndGggKz0gMTtcbiAgICB9XG5cbiAgICBpZiAobmV3SW5kZXggPCAwKSB7XG4gICAgICBuZXdJbmRleCArPSBsZW5ndGg7XG4gICAgfSBlbHNlIGlmIChuZXdJbmRleCA+PSBsZW5ndGgpIHtcbiAgICAgIG5ld0luZGV4IC09IGxlbmd0aDtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHsgc2VsZWN0aW9uSW5kZXg6IG5ld0luZGV4IH0pO1xuICB9LFxuXG4gIG5hdkRvd246IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX25hdigxKTtcbiAgfSxcblxuICBuYXZVcDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbmF2KC0xKTtcbiAgfSxcblxuICBfb25DaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQpO1xuICAgIH1cbiAgICB0aGlzLl9vblRleHRFbnRyeVVwZGF0ZWQoKTtcbiAgfSxcblxuICBfb25LZXlEb3duOiBmdW5jdGlvbihldmVudCkge1xuICAgIC8vIElmIHRoZXJlIGFyZSBubyB2aXNpYmxlIGVsZW1lbnRzLCBkb24ndCBwZXJmb3JtIHNlbGVjdG9yIG5hdmlnYXRpb24uXG4gICAgLy8gSnVzdCBwYXNzIHRoaXMgdXAgdG8gdGhlIHVwc3RyZWFtIG9uS2V5ZG93biBoYW5kbGVyLlxuICAgIC8vIEFsc28gc2tpcCBpZiB0aGUgdXNlciBpcyBwcmVzc2luZyB0aGUgc2hpZnQga2V5LCBzaW5jZSBub25lIG9mIG91ciBoYW5kbGVycyBhcmUgbG9va2luZyBmb3Igc2hpZnRcbiAgICBpZiAoIXRoaXMuX2hhc0hpbnQoKSB8fCBldmVudC5zaGlmdEtleSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25LZXlEb3duKGV2ZW50KTtcbiAgICB9XG5cbiAgICB2YXIgaGFuZGxlciA9IHRoaXMuZXZlbnRNYXAoKVtldmVudC5rZXlDb2RlXTtcblxuICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyKGV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25LZXlEb3duKGV2ZW50KTtcbiAgICB9XG4gICAgLy8gRG9uJ3QgcHJvcGFnYXRlIHRoZSBrZXlzdHJva2UgYmFjayB0byB0aGUgRE9NL2Jyb3dzZXJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIHZhciBzZWFyY2hSZXN1bHRzID0gdGhpcy5nZXRPcHRpb25zRm9yVmFsdWUoXG4gICAgICB0aGlzLnN0YXRlLmVudHJ5VmFsdWUsXG4gICAgICBuZXh0UHJvcHMub3B0aW9uc1xuICAgICk7XG4gICAgdmFyIHNob3dSZXN1bHRzID0gQm9vbGVhbihzZWFyY2hSZXN1bHRzLmxlbmd0aCkgJiYgdGhpcy5zdGF0ZS5pc0ZvY3VzZWQ7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWFyY2hSZXN1bHRzOiBzZWFyY2hSZXN1bHRzLFxuICAgICAgc2hvd1Jlc3VsdHM6IHNob3dSZXN1bHRzXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5wdXRDbGFzc2VzID0ge307XG4gICAgaW5wdXRDbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5pbnB1dF0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlc1xuICAgICAgLmlucHV0O1xuICAgIHZhciBpbnB1dENsYXNzTGlzdCA9IGNsYXNzTmFtZXMoaW5wdXRDbGFzc2VzKTtcblxuICAgIHZhciBjbGFzc2VzID0ge1xuICAgICAgdHlwZWFoZWFkOiB0aGlzLnByb3BzLmRlZmF1bHRDbGFzc05hbWVzXG4gICAgfTtcbiAgICBjbGFzc2VzW3RoaXMucHJvcHMuY2xhc3NOYW1lXSA9ICEhdGhpcy5wcm9wcy5jbGFzc05hbWU7XG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG5cbiAgICB2YXIgSW5wdXRFbGVtZW50ID0gdGhpcy5wcm9wcy50ZXh0YXJlYSA/IFwidGV4dGFyZWFcIiA6IFwiaW5wdXRcIjtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyIGVudHJ5UmVmID0gZnVuY3Rpb24oYykge1xuICAgICAgX3RoaXMuX2VudHJ5ID0gYztcbiAgICB9O1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NMaXN0fT5cbiAgICAgICAge3RoaXMuX3JlbmRlckhpZGRlbklucHV0KCl9XG4gICAgICAgIDxJbnB1dEVsZW1lbnRcbiAgICAgICAgICByZWY9e2VudHJ5UmVmfVxuICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgICB7Li4udGhpcy5wcm9wcy5pbnB1dFByb3BzfVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfVxuICAgICAgICAgIGNsYXNzTmFtZT17aW5wdXRDbGFzc0xpc3R9XG4gICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuZW50cnlWYWx1ZX1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9XG4gICAgICAgICAgb25LZXlEb3duPXt0aGlzLl9vbktleURvd259XG4gICAgICAgICAgb25LZXlQcmVzcz17dGhpcy5wcm9wcy5vbktleVByZXNzfVxuICAgICAgICAgIG9uS2V5VXA9e3RoaXMucHJvcHMub25LZXlVcH1cbiAgICAgICAgICBvbkZvY3VzPXt0aGlzLl9vbkZvY3VzfVxuICAgICAgICAgIG9uQmx1cj17dGhpcy5fb25CbHVyfVxuICAgICAgICAvPlxuICAgICAgICB7dGhpcy5zdGF0ZS5zaG93UmVzdWx0cyAmJiB0aGlzLl9yZW5kZXJJbmNyZW1lbnRhbFNlYXJjaFJlc3VsdHMoKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG4gIF9vbkZvY3VzOiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICB7IGlzRm9jdXNlZDogdHJ1ZSwgc2hvd1Jlc3VsdHM6IHRydWUgfSxcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9vblRleHRFbnRyeVVwZGF0ZWQoKTtcbiAgICAgIH0uYmluZCh0aGlzKVxuICAgICk7XG4gICAgaWYgKHRoaXMucHJvcHMub25Gb2N1cykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25Gb2N1cyhldmVudCk7XG4gICAgfVxuICB9LFxuXG4gIF9vbkJsdXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgIHsgaXNGb2N1c2VkOiBmYWxzZSB9LFxuICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX29uVGV4dEVudHJ5VXBkYXRlZCgpO1xuICAgICAgfS5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkJsdXIpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uQmx1cihldmVudCk7XG4gICAgfVxuICB9LFxuXG4gIF9yZW5kZXJIaWRkZW5JbnB1dDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8aW5wdXRcbiAgICAgICAgdHlwZT1cImhpZGRlblwiXG4gICAgICAgIG5hbWU9e3RoaXMucHJvcHMubmFtZX1cbiAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuc2VsZWN0aW9ufVxuICAgICAgLz5cbiAgICApO1xuICB9LFxuXG4gIF9nZW5lcmF0ZVNlYXJjaEZ1bmN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VhcmNoT3B0aW9uc1Byb3AgPSB0aGlzLnByb3BzLnNlYXJjaE9wdGlvbnM7XG4gICAgdmFyIGZpbHRlck9wdGlvblByb3AgPSB0aGlzLnByb3BzLmZpbHRlck9wdGlvbjtcbiAgICBpZiAodHlwZW9mIHNlYXJjaE9wdGlvbnNQcm9wID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGlmIChmaWx0ZXJPcHRpb25Qcm9wICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBcInNlYXJjaE9wdGlvbnMgcHJvcCBpcyBiZWluZyB1c2VkLCBmaWx0ZXJPcHRpb24gcHJvcCB3aWxsIGJlIGlnbm9yZWRcIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNlYXJjaE9wdGlvbnNQcm9wO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGZpbHRlck9wdGlvblByb3AgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLmZpbHRlcihmdW5jdGlvbihvKSB7XG4gICAgICAgICAgcmV0dXJuIGZpbHRlck9wdGlvblByb3AodmFsdWUsIG8pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBtYXBwZXI7XG4gICAgICBpZiAodHlwZW9mIGZpbHRlck9wdGlvblByb3AgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgbWFwcGVyID0gQWNjZXNzb3IuZ2VuZXJhdGVBY2Nlc3NvcihmaWx0ZXJPcHRpb25Qcm9wKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcHBlciA9IEFjY2Vzc29yLklERU5USVRZX0ZOO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBmdXp6eVxuICAgICAgICAgIC5maWx0ZXIodmFsdWUsIG9wdGlvbnMsIHsgZXh0cmFjdDogbWFwcGVyIH0pXG4gICAgICAgICAgLm1hcChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zW3Jlcy5pbmRleF07XG4gICAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH1cbiAgfSxcblxuICBfaGFzSGludDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5sZW5ndGggPiAwIHx8IHRoaXMuX2hhc0N1c3RvbVZhbHVlKCk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGVhaGVhZDtcbiJdfQ==
},{"../accessor":19,"../keyevent":20,"./selector":26,"classnames":1,"create-react-class":3,"fuzzy":8,"prop-types":14,"react":"react"}],25:[function(require,module,exports){
var React = window.React || require('react');
var classNames = require("classnames");
var createReactClass = require("create-react-class");
var PropTypes = require("prop-types");

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = createReactClass({
  displayName: "TypeaheadOption",

  propTypes: {
    customClasses: PropTypes.object,
    customValue: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.string,
    hover: PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      customClasses: {},
      onClick: function (event) {
        event.preventDefault();
      }
    };
  },

  render: function () {
    var classes = {};
    classes[this.props.customClasses.hover || "hover"] = !!this.props.hover;
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;

    if (this.props.customValue) {
      classes[this.props.customClasses.customAdd] = !!this.props.customClasses.customAdd;
    }

    var classList = classNames(classes);

    // For some reason onClick is not fired when clicked on an option
    // onMouseDown is used here as a workaround of #205 and other
    // related tickets
    return React.createElement(
      "li",
      {
        className: classList,
        onClick: this._onClick,
        onMouseDown: this._onClick
      },
      React.createElement(
        "a",
        { href: "javascript: void 0;", className: this._getClasses() },
        this.props.children
      )
    );
  },

  _getClasses: function () {
    var classes = {
      "typeahead-option": true
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;

    return classNames(classes);
  },

  _onClick: function (event) {
    event.preventDefault();
    return this.props.onClick(event);
  }
});

module.exports = TypeaheadOption;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9wdGlvbi5qcyJdLCJuYW1lcyI6WyJSZWFjdCIsInJlcXVpcmUiLCJjbGFzc05hbWVzIiwiY3JlYXRlUmVhY3RDbGFzcyIsIlByb3BUeXBlcyIsIlR5cGVhaGVhZE9wdGlvbiIsInByb3BUeXBlcyIsImN1c3RvbUNsYXNzZXMiLCJvYmplY3QiLCJjdXN0b21WYWx1ZSIsInN0cmluZyIsIm9uQ2xpY2siLCJmdW5jIiwiY2hpbGRyZW4iLCJob3ZlciIsImJvb2wiLCJnZXREZWZhdWx0UHJvcHMiLCJldmVudCIsInByZXZlbnREZWZhdWx0IiwicmVuZGVyIiwiY2xhc3NlcyIsInByb3BzIiwibGlzdEl0ZW0iLCJjdXN0b21BZGQiLCJjbGFzc0xpc3QiLCJfb25DbGljayIsIl9nZXRDbGFzc2VzIiwibGlzdEFuY2hvciIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLElBQUlBLFFBQVFDLFFBQVEsT0FBUixDQUFaO0FBQ0EsSUFBSUMsYUFBYUQsUUFBUSxZQUFSLENBQWpCO0FBQ0EsSUFBSUUsbUJBQW1CRixRQUFRLG9CQUFSLENBQXZCO0FBQ0EsSUFBSUcsWUFBWUgsUUFBUSxZQUFSLENBQWhCOztBQUVBOzs7QUFHQSxJQUFJSSxrQkFBa0JGLGlCQUFpQjtBQUFBOztBQUNyQ0csYUFBVztBQUNUQyxtQkFBZUgsVUFBVUksTUFEaEI7QUFFVEMsaUJBQWFMLFVBQVVNLE1BRmQ7QUFHVEMsYUFBU1AsVUFBVVEsSUFIVjtBQUlUQyxjQUFVVCxVQUFVTSxNQUpYO0FBS1RJLFdBQU9WLFVBQVVXO0FBTFIsR0FEMEI7O0FBU3JDQyxtQkFBaUIsWUFBVztBQUMxQixXQUFPO0FBQ0xULHFCQUFlLEVBRFY7QUFFTEksZUFBUyxVQUFTTSxLQUFULEVBQWdCO0FBQ3ZCQSxjQUFNQyxjQUFOO0FBQ0Q7QUFKSSxLQUFQO0FBTUQsR0FoQm9DOztBQWtCckNDLFVBQVEsWUFBVztBQUNqQixRQUFJQyxVQUFVLEVBQWQ7QUFDQUEsWUFBUSxLQUFLQyxLQUFMLENBQVdkLGFBQVgsQ0FBeUJPLEtBQXpCLElBQWtDLE9BQTFDLElBQXFELENBQUMsQ0FBQyxLQUFLTyxLQUFMLENBQVdQLEtBQWxFO0FBQ0FNLFlBQVEsS0FBS0MsS0FBTCxDQUFXZCxhQUFYLENBQXlCZSxRQUFqQyxJQUE2QyxDQUFDLENBQUMsS0FBS0QsS0FBTCxDQUFXZCxhQUFYLENBQzVDZSxRQURIOztBQUdBLFFBQUksS0FBS0QsS0FBTCxDQUFXWixXQUFmLEVBQTRCO0FBQzFCVyxjQUFRLEtBQUtDLEtBQUwsQ0FBV2QsYUFBWCxDQUF5QmdCLFNBQWpDLElBQThDLENBQUMsQ0FBQyxLQUFLRixLQUFMLENBQVdkLGFBQVgsQ0FDN0NnQixTQURIO0FBRUQ7O0FBRUQsUUFBSUMsWUFBWXRCLFdBQVdrQixPQUFYLENBQWhCOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQ0U7QUFBQTtBQUFBO0FBQ0UsbUJBQVdJLFNBRGI7QUFFRSxpQkFBUyxLQUFLQyxRQUZoQjtBQUdFLHFCQUFhLEtBQUtBO0FBSHBCO0FBS0U7QUFBQTtBQUFBLFVBQUcsTUFBSyxxQkFBUixFQUE4QixXQUFXLEtBQUtDLFdBQUwsRUFBekM7QUFDRyxhQUFLTCxLQUFMLENBQVdSO0FBRGQ7QUFMRixLQURGO0FBV0QsR0E3Q29DOztBQStDckNhLGVBQWEsWUFBVztBQUN0QixRQUFJTixVQUFVO0FBQ1osMEJBQW9CO0FBRFIsS0FBZDtBQUdBQSxZQUFRLEtBQUtDLEtBQUwsQ0FBV2QsYUFBWCxDQUF5Qm9CLFVBQWpDLElBQStDLENBQUMsQ0FBQyxLQUFLTixLQUFMLENBQVdkLGFBQVgsQ0FDOUNvQixVQURIOztBQUdBLFdBQU96QixXQUFXa0IsT0FBWCxDQUFQO0FBQ0QsR0F2RG9DOztBQXlEckNLLFlBQVUsVUFBU1IsS0FBVCxFQUFnQjtBQUN4QkEsVUFBTUMsY0FBTjtBQUNBLFdBQU8sS0FBS0csS0FBTCxDQUFXVixPQUFYLENBQW1CTSxLQUFuQixDQUFQO0FBQ0Q7QUE1RG9DLENBQWpCLENBQXRCOztBQStEQVcsT0FBT0MsT0FBUCxHQUFpQnhCLGVBQWpCIiwiZmlsZSI6Im9wdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZShcImNsYXNzbmFtZXNcIik7XG52YXIgY3JlYXRlUmVhY3RDbGFzcyA9IHJlcXVpcmUoXCJjcmVhdGUtcmVhY3QtY2xhc3NcIik7XG52YXIgUHJvcFR5cGVzID0gcmVxdWlyZShcInByb3AtdHlwZXNcIik7XG5cbi8qKlxuICogQSBzaW5nbGUgb3B0aW9uIHdpdGhpbiB0aGUgVHlwZWFoZWFkU2VsZWN0b3JcbiAqL1xudmFyIFR5cGVhaGVhZE9wdGlvbiA9IGNyZWF0ZVJlYWN0Q2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBjdXN0b21DbGFzc2VzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIGN1c3RvbVZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGhvdmVyOiBQcm9wVHlwZXMuYm9vbFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGN1c3RvbUNsYXNzZXM6IHt9LFxuICAgICAgb25DbGljazogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzZXMgPSB7fTtcbiAgICBjbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5ob3ZlciB8fCBcImhvdmVyXCJdID0gISF0aGlzLnByb3BzLmhvdmVyO1xuICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLmxpc3RJdGVtXSA9ICEhdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzXG4gICAgICAubGlzdEl0ZW07XG5cbiAgICBpZiAodGhpcy5wcm9wcy5jdXN0b21WYWx1ZSkge1xuICAgICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMuY3VzdG9tQWRkXSA9ICEhdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzXG4gICAgICAgIC5jdXN0b21BZGQ7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG5cbiAgICAvLyBGb3Igc29tZSByZWFzb24gb25DbGljayBpcyBub3QgZmlyZWQgd2hlbiBjbGlja2VkIG9uIGFuIG9wdGlvblxuICAgIC8vIG9uTW91c2VEb3duIGlzIHVzZWQgaGVyZSBhcyBhIHdvcmthcm91bmQgb2YgIzIwNSBhbmQgb3RoZXJcbiAgICAvLyByZWxhdGVkIHRpY2tldHNcbiAgICByZXR1cm4gKFxuICAgICAgPGxpXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NMaXN0fVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrfVxuICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5fb25DbGlja31cbiAgICAgID5cbiAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6IHZvaWQgMDtcIiBjbGFzc05hbWU9e3RoaXMuX2dldENsYXNzZXMoKX0+XG4gICAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICAgIDwvYT5cbiAgICAgIDwvbGk+XG4gICAgKTtcbiAgfSxcblxuICBfZ2V0Q2xhc3NlczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzZXMgPSB7XG4gICAgICBcInR5cGVhaGVhZC1vcHRpb25cIjogdHJ1ZVxuICAgIH07XG4gICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMubGlzdEFuY2hvcl0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlc1xuICAgICAgLmxpc3RBbmNob3I7XG5cbiAgICByZXR1cm4gY2xhc3NOYW1lcyhjbGFzc2VzKTtcbiAgfSxcblxuICBfb25DbGljazogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uQ2xpY2soZXZlbnQpO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlYWhlYWRPcHRpb247XG4iXX0=
},{"classnames":1,"create-react-class":3,"prop-types":14,"react":"react"}],26:[function(require,module,exports){
var React = window.React || require('react');
var TypeaheadOption = require("./option");
var classNames = require("classnames");
var createReactClass = require("create-react-class");
var PropTypes = require("prop-types");

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
var TypeaheadSelector = createReactClass({
  displayName: "TypeaheadSelector",

  propTypes: {
    options: PropTypes.array,
    allowCustomValues: PropTypes.number,
    customClasses: PropTypes.object,
    customValue: PropTypes.string,
    selectionIndex: PropTypes.number,
    onOptionSelected: PropTypes.func,
    displayOption: PropTypes.func.isRequired,
    defaultClassNames: PropTypes.bool,
    areResultsTruncated: PropTypes.bool,
    resultsTruncatedMessage: PropTypes.string
  },

  getDefaultProps: function () {
    return {
      selectionIndex: null,
      customClasses: {},
      allowCustomValues: 0,
      customValue: null,
      onOptionSelected: function (option) {},
      defaultClassNames: true
    };
  },

  render: function () {
    // Don't render if there are no options to display
    if (!this.props.options.length && this.props.allowCustomValues <= 0) {
      return false;
    }

    var classes = {
      "typeahead-selector": this.props.defaultClassNames
    };
    classes[this.props.customClasses.results] = this.props.customClasses.results;
    var classList = classNames(classes);

    // CustomValue should be added to top of results list with different class name
    var customValue = null;
    var customValueOffset = 0;
    if (this.props.customValue !== null) {
      customValueOffset++;
      customValue = React.createElement(
        TypeaheadOption,
        {
          key: this.props.customValue,
          hover: this.props.selectionIndex === 0,
          customClasses: this.props.customClasses,
          customValue: this.props.customValue,
          onClick: this._onClick.bind(this, this.props.customValue)
        },
        this.props.customValue
      );
    }

    var results = this.props.options.map(function (result, i) {
      var displayString = this.props.displayOption(result, i);
      var uniqueKey = displayString + "_" + i;
      return React.createElement(
        TypeaheadOption,
        {
          key: uniqueKey,
          hover: this.props.selectionIndex === i + customValueOffset,
          customClasses: this.props.customClasses,
          onClick: this._onClick.bind(this, result)
        },
        displayString
      );
    }, this);

    if (this.props.areResultsTruncated && this.props.resultsTruncatedMessage !== null) {
      var resultsTruncatedClasses = {
        "results-truncated": this.props.defaultClassNames
      };
      resultsTruncatedClasses[this.props.customClasses.resultsTruncated] = this.props.customClasses.resultsTruncated;
      var resultsTruncatedClassList = classNames(resultsTruncatedClasses);

      results.push(React.createElement(
        "li",
        { key: "results-truncated", className: resultsTruncatedClassList },
        this.props.resultsTruncatedMessage
      ));
    }

    return React.createElement(
      "ul",
      { className: classList },
      customValue,
      results
    );
  },

  _onClick: function (result, event) {
    return this.props.onOptionSelected(result, event);
  }
});

module.exports = TypeaheadSelector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbIlJlYWN0IiwicmVxdWlyZSIsIlR5cGVhaGVhZE9wdGlvbiIsImNsYXNzTmFtZXMiLCJjcmVhdGVSZWFjdENsYXNzIiwiUHJvcFR5cGVzIiwiVHlwZWFoZWFkU2VsZWN0b3IiLCJwcm9wVHlwZXMiLCJvcHRpb25zIiwiYXJyYXkiLCJhbGxvd0N1c3RvbVZhbHVlcyIsIm51bWJlciIsImN1c3RvbUNsYXNzZXMiLCJvYmplY3QiLCJjdXN0b21WYWx1ZSIsInN0cmluZyIsInNlbGVjdGlvbkluZGV4Iiwib25PcHRpb25TZWxlY3RlZCIsImZ1bmMiLCJkaXNwbGF5T3B0aW9uIiwiaXNSZXF1aXJlZCIsImRlZmF1bHRDbGFzc05hbWVzIiwiYm9vbCIsImFyZVJlc3VsdHNUcnVuY2F0ZWQiLCJyZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZSIsImdldERlZmF1bHRQcm9wcyIsIm9wdGlvbiIsInJlbmRlciIsInByb3BzIiwibGVuZ3RoIiwiY2xhc3NlcyIsInJlc3VsdHMiLCJjbGFzc0xpc3QiLCJjdXN0b21WYWx1ZU9mZnNldCIsIl9vbkNsaWNrIiwiYmluZCIsIm1hcCIsInJlc3VsdCIsImkiLCJkaXNwbGF5U3RyaW5nIiwidW5pcXVlS2V5IiwicmVzdWx0c1RydW5jYXRlZENsYXNzZXMiLCJyZXN1bHRzVHJ1bmNhdGVkIiwicmVzdWx0c1RydW5jYXRlZENsYXNzTGlzdCIsInB1c2giLCJldmVudCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLElBQUlBLFFBQVFDLFFBQVEsT0FBUixDQUFaO0FBQ0EsSUFBSUMsa0JBQWtCRCxRQUFRLFVBQVIsQ0FBdEI7QUFDQSxJQUFJRSxhQUFhRixRQUFRLFlBQVIsQ0FBakI7QUFDQSxJQUFJRyxtQkFBbUJILFFBQVEsb0JBQVIsQ0FBdkI7QUFDQSxJQUFJSSxZQUFZSixRQUFRLFlBQVIsQ0FBaEI7O0FBRUE7Ozs7QUFJQSxJQUFJSyxvQkFBb0JGLGlCQUFpQjtBQUFB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QUtiLEtBQUwsQ0FBV2hCLGFBQVgsQ0FBeUI4QixnQkFEM0IsSUFFSSxLQUFLZCxLQUFMLENBQVdoQixhQUFYLENBQXlCOEIsZ0JBRjdCO0FBR0EsVUFBSUMsNEJBQTRCeEMsV0FBV3NDLHVCQUFYLENBQWhDOztBQUVBVixjQUFRYSxJQUFSLENBQ0U7QUFBQTtBQUFBLFVBQUksS0FBSSxtQkFBUixFQUE0QixXQUFXRCx5QkFBdkM7QUFDRyxhQUFLZixLQUFMLENBQVdKO0FBRGQsT0FERjtBQUtEOztBQUVELFdBQ0U7QUFBQTtBQUFBLFFBQUksV0FBV1EsU0FBZjtBQUNHbEIsaUJBREg7QUFFR2lCO0FBRkgsS0FERjtBQU1ELEdBakdzQzs7QUFtR3ZDRyxZQUFVLFVBQVNHLE1BQVQsRUFBaUJRLEtBQWpCLEVBQXdCO0FBQ2hDLFdBQU8sS0FBS2pCLEtBQUwsQ0FBV1gsZ0JBQVgsQ0FBNEJvQixNQUE1QixFQUFvQ1EsS0FBcEMsQ0FBUDtBQUNEO0FBckdzQyxDQUFqQixDQUF4Qjs7QUF3R0FDLE9BQU9DLE9BQVAsR0FBaUJ6QyxpQkFBakIiLCJmaWxlIjoic2VsZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG52YXIgVHlwZWFoZWFkT3B0aW9uID0gcmVxdWlyZShcIi4vb3B0aW9uXCIpO1xudmFyIGNsYXNzTmFtZXMgPSByZXF1aXJlKFwiY2xhc3NuYW1lc1wiKTtcbnZhciBjcmVhdGVSZWFjdENsYXNzID0gcmVxdWlyZShcImNyZWF0ZS1yZWFjdC1jbGFzc1wiKTtcbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKFwicHJvcC10eXBlc1wiKTtcblxuLyoqXG4gKiBDb250YWluZXIgZm9yIHRoZSBvcHRpb25zIHJlbmRlcmVkIGFzIHBhcnQgb2YgdGhlIGF1dG9jb21wbGV0aW9uIHByb2Nlc3NcbiAqIG9mIHRoZSB0eXBlYWhlYWRcbiAqL1xudmFyIFR5cGVhaGVhZFNlbGVjdG9yID0gY3JlYXRlUmVhY3RDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIG9wdGlvbnM6IFByb3BUeXBlcy5hcnJheSxcbiAgICBhbGxvd0N1c3RvbVZhbHVlczogUHJvcFR5cGVzLm51bWJlcixcbiAgICBjdXN0b21DbGFzc2VzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIGN1c3RvbVZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHNlbGVjdGlvbkluZGV4OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIG9uT3B0aW9uU2VsZWN0ZWQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIGRpc3BsYXlPcHRpb246IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgZGVmYXVsdENsYXNzTmFtZXM6IFByb3BUeXBlcy5ib29sLFxuICAgIGFyZVJlc3VsdHNUcnVuY2F0ZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIHJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlOiBQcm9wVHlwZXMuc3RyaW5nXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2VsZWN0aW9uSW5kZXg6IG51bGwsXG4gICAgICBjdXN0b21DbGFzc2VzOiB7fSxcbiAgICAgIGFsbG93Q3VzdG9tVmFsdWVzOiAwLFxuICAgICAgY3VzdG9tVmFsdWU6IG51bGwsXG4gICAgICBvbk9wdGlvblNlbGVjdGVkOiBmdW5jdGlvbihvcHRpb24pIHt9LFxuICAgICAgZGVmYXVsdENsYXNzTmFtZXM6IHRydWVcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgLy8gRG9uJ3QgcmVuZGVyIGlmIHRoZXJlIGFyZSBubyBvcHRpb25zIHRvIGRpc3BsYXlcbiAgICBpZiAoIXRoaXMucHJvcHMub3B0aW9ucy5sZW5ndGggJiYgdGhpcy5wcm9wcy5hbGxvd0N1c3RvbVZhbHVlcyA8PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzZXMgPSB7XG4gICAgICBcInR5cGVhaGVhZC1zZWxlY3RvclwiOiB0aGlzLnByb3BzLmRlZmF1bHRDbGFzc05hbWVzXG4gICAgfTtcbiAgICBjbGFzc2VzW1xuICAgICAgdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLnJlc3VsdHNcbiAgICBdID0gdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLnJlc3VsdHM7XG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG5cbiAgICAvLyBDdXN0b21WYWx1ZSBzaG91bGQgYmUgYWRkZWQgdG8gdG9wIG9mIHJlc3VsdHMgbGlzdCB3aXRoIGRpZmZlcmVudCBjbGFzcyBuYW1lXG4gICAgdmFyIGN1c3RvbVZhbHVlID0gbnVsbDtcbiAgICB2YXIgY3VzdG9tVmFsdWVPZmZzZXQgPSAwO1xuICAgIGlmICh0aGlzLnByb3BzLmN1c3RvbVZhbHVlICE9PSBudWxsKSB7XG4gICAgICBjdXN0b21WYWx1ZU9mZnNldCsrO1xuICAgICAgY3VzdG9tVmFsdWUgPSAoXG4gICAgICAgIDxUeXBlYWhlYWRPcHRpb25cbiAgICAgICAgICBrZXk9e3RoaXMucHJvcHMuY3VzdG9tVmFsdWV9XG4gICAgICAgICAgaG92ZXI9e3RoaXMucHJvcHMuc2VsZWN0aW9uSW5kZXggPT09IDB9XG4gICAgICAgICAgY3VzdG9tQ2xhc3Nlcz17dGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzfVxuICAgICAgICAgIGN1c3RvbVZhbHVlPXt0aGlzLnByb3BzLmN1c3RvbVZhbHVlfVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2suYmluZCh0aGlzLCB0aGlzLnByb3BzLmN1c3RvbVZhbHVlKX1cbiAgICAgICAgPlxuICAgICAgICAgIHt0aGlzLnByb3BzLmN1c3RvbVZhbHVlfVxuICAgICAgICA8L1R5cGVhaGVhZE9wdGlvbj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdHMgPSB0aGlzLnByb3BzLm9wdGlvbnMubWFwKGZ1bmN0aW9uKHJlc3VsdCwgaSkge1xuICAgICAgdmFyIGRpc3BsYXlTdHJpbmcgPSB0aGlzLnByb3BzLmRpc3BsYXlPcHRpb24ocmVzdWx0LCBpKTtcbiAgICAgIHZhciB1bmlxdWVLZXkgPSBkaXNwbGF5U3RyaW5nICsgXCJfXCIgKyBpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFR5cGVhaGVhZE9wdGlvblxuICAgICAgICAgIGtleT17dW5pcXVlS2V5fVxuICAgICAgICAgIGhvdmVyPXt0aGlzLnByb3BzLnNlbGVjdGlvbkluZGV4ID09PSBpICsgY3VzdG9tVmFsdWVPZmZzZXR9XG4gICAgICAgICAgY3VzdG9tQ2xhc3Nlcz17dGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzfVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2suYmluZCh0aGlzLCByZXN1bHQpfVxuICAgICAgICA+XG4gICAgICAgICAge2Rpc3BsYXlTdHJpbmd9XG4gICAgICAgIDwvVHlwZWFoZWFkT3B0aW9uPlxuICAgICAgKTtcbiAgICB9LCB0aGlzKTtcblxuICAgIGlmIChcbiAgICAgIHRoaXMucHJvcHMuYXJlUmVzdWx0c1RydW5jYXRlZCAmJlxuICAgICAgdGhpcy5wcm9wcy5yZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZSAhPT0gbnVsbFxuICAgICkge1xuICAgICAgdmFyIHJlc3VsdHNUcnVuY2F0ZWRDbGFzc2VzID0ge1xuICAgICAgICBcInJlc3VsdHMtdHJ1bmNhdGVkXCI6IHRoaXMucHJvcHMuZGVmYXVsdENsYXNzTmFtZXNcbiAgICAgIH07XG4gICAgICByZXN1bHRzVHJ1bmNhdGVkQ2xhc3Nlc1tcbiAgICAgICAgdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLnJlc3VsdHNUcnVuY2F0ZWRcbiAgICAgIF0gPSB0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMucmVzdWx0c1RydW5jYXRlZDtcbiAgICAgIHZhciByZXN1bHRzVHJ1bmNhdGVkQ2xhc3NMaXN0ID0gY2xhc3NOYW1lcyhyZXN1bHRzVHJ1bmNhdGVkQ2xhc3Nlcyk7XG5cbiAgICAgIHJlc3VsdHMucHVzaChcbiAgICAgICAgPGxpIGtleT1cInJlc3VsdHMtdHJ1bmNhdGVkXCIgY2xhc3NOYW1lPXtyZXN1bHRzVHJ1bmNhdGVkQ2xhc3NMaXN0fT5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5yZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZX1cbiAgICAgICAgPC9saT5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDx1bCBjbGFzc05hbWU9e2NsYXNzTGlzdH0+XG4gICAgICAgIHtjdXN0b21WYWx1ZX1cbiAgICAgICAge3Jlc3VsdHN9XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH0sXG5cbiAgX29uQ2xpY2s6IGZ1bmN0aW9uKHJlc3VsdCwgZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbk9wdGlvblNlbGVjdGVkKHJlc3VsdCwgZXZlbnQpO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlYWhlYWRTZWxlY3RvcjtcbiJdfQ==
},{"./option":25,"classnames":1,"create-react-class":3,"prop-types":14,"react":"react"}]},{},[21])(21)
});
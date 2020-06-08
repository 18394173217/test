(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ?
        exports.module = factory() :
        typeof define === 'function' && define.amd ?
        define(factory) : (global.utils = factory())
})(this, (function() {
	/**
     * 深度克隆
     */
    function deepClone(dest, src) {
        for (var item in src) {
            switch (typeof src[item]) {
                case 'function':
                    dest[item] = src[item]
                    break;
                case 'array':
                case 'number':
                case 'string':
                case 'object':
                case 'boolean':
                    dest[item] = JSON.parse(JSON.stringify(src[item]))
                default:

            }
        }
        return dest;
    }
})
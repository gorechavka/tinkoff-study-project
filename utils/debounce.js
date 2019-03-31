function debounce(func, ms){
    let timer = null;
    return function debouncedFunc(...args){
        timer&&clearTimeout(timer);

        timer = setTimeout(() => {
            func.call(this, ...args);
            timer = null;
        }, ms)

        return debouncedFunc;
    }
}
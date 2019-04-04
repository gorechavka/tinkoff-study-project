'use strict'
function createModel(){
    let state = {},
        listeners = [],
        cache = new Map(),
        controller = null,
        lastRequest = null;

    function init(){
        if (localStorage.getItem('lastState')) {
            setState(JSON.parse(localStorage.getItem('lastState')));
        } else state = {
            tags:[],
            counts: 0,
            moviesData: [],
            error: false
        }
    }

    function addListener(listener){
        listeners.push(listener);
    }

    function setState(newState){
     
        listeners.forEach( listener => listener(newState));

        state = Object.assign({}, state, newState);
        if (!state.error && !state.loading){

            
            localStorage.clear();
            localStorage.setItem('lastState', JSON.stringify(getState()));
        }
    }

    function getState(){
        return state;
    }

    async function getMoviesData(request) {

        setState({loading: true});

        const curState = getState();
        let data;

        try {
            if (cache.has(request)) data = await cache.get(request);
            else {
                lastRequest = request;

                controller&&controller.abort();

                controller = new AbortController();
                const signal = controller.signal;
                
                
                data = await fetch(`http://www.omdbapi.com/?type=movie&apikey=dfe51d16&s=${lastRequest}`, {signal})
                            .then( res => {
                                controller, lastRequest = null;
                                return res.json()
                            })
                            .catch(err => {
                                if (err.name !== 'AbortError') console.log(err.message);
                            });

                if (signal.aborted){
                    controller = null;
                    return;
                }
                
                data = await getFullData(data);
            
                cache.set(request, data);
            }

            if (!data.Response === 'True') throw new Error(`Error: ${data.status} ${data.statusText}`);
            const newState = {
                tags: [request,...curState.tags.filter( tag => tag!==request )],
                counts: data.totalResults,
                moviesData: data.Search.map(movie => ({
                    title: movie.Title,
                    poster: movie.Poster,
                    year: movie.Year,
                    genre: movie.Genre,
                    link: `https://www.imdb.com/title/${movie.imdbID}`,
                    rate: movie.imdbRating
                })),
                error:false,
                loading:false
            };

            setState(newState);

        } catch (err) {
            setState({error: true});
        }
    }

    async function getFullData(data){
        let counter = 0;
        for (let movie of data.Search){
            data.Search[counter++] = await fetch(`http://www.omdbapi.com/?apikey=dfe51d16&t=${movie.Title}`).then(res => res.json());
        }
        return data;
    }

    function removeTag(targetTag){
        const curState = getState();
        setState({
            tags: curState.tags.filter( tag => tag!==targetTag)
        })
    }

    return {
        init,
        addListener,
        getMoviesData,
        removeTag
    }

}
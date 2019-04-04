'use strict'
function createModel(){
    let state = {},
        listeners = [],
        cache = new Map(),
        apikey = 'dfe51d16',
        url = `http://www.omdbapi.com/`,
        controller;

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

        state = {...state, ...newState};
        if (!state.error && !state.loading){

            localStorage.clear();
            localStorage.setItem('lastState', JSON.stringify(state));
        }
    }

    async function getMoviesData(request) {

        setState({loading: true});

        const curState = state;
        let data;

        try {
            if (cache.has(request)) data = await cache.get(request);
            else {
                controller&&controller.abort();

                controller = new AbortController();
                const signal = controller.signal;
                
                
                data = await fetch(`${url}?apikey=${apikey}&type=movie&s=${request}`, {signal})
                            .then( res => {
                                controller = undefined;
                                return res.json()
                            })
                            .catch(err => {
                                if (err.name !== 'AbortError') console.log(err.message);
                            });

                if (signal.aborted){
                    controller = undefined;
                    return;
                }
                
                data.Search = await getFullData(data.Search);
            
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
        let requests = data.map( movie => fetch(`${url}?apikey=${apikey}&t=${movie.Title}`).then(res => res.json()));
        return await Promise.all(requests);
    }

    function removeTag(targetTag){
        const curState = state;
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
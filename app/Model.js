class Model{
    constructor(){
        this.state = {};
        this.cache = new Map();
    }

    init(connector){
        this.connector = connector;

        //check last saved state
        if (localStorage.getItem('lastState')) this.setState(JSON.parse(localStorage.getItem('lastState')));
        else this.state = {
            tags:[],
            counts: 0,
            moviesData: [],
            error: false
        }
    }

    setState(newState){
        this.errorTimer&&clearTimeout(this.errorTimer);
        console.log(newState);
        this.connector.sendUpdates(newState);
        this.state = Object.assign({}, this.state, newState);
        if (!this.state.error){

            //requests with error aren't kept in localStorage
            localStorage.clear();
            localStorage.setItem('lastState', JSON.stringify(this.getState()));
        }
    }

    getState(){
        return this.state;
    }

    async getMoviesData(request) {

        //tells component to show preloader
        this.setState({loading: true});

        const curState = this.getState();
        let data;

        try {
            //check cached requests first
            if (this.cache.has(request)) data = await this.cache.get(request);
            else {
                this.lastRequest = request
                /*пыталась таким образом отменять ненужные запросы,
                которые присылаются по ходу ввода, но 
                поиск получается какой-то дерганый :(*/
                this.controller&&this.controller.abort();

                this.controller = new AbortController();
                const signal = this.controller.signal;
                
                //request general data about all movies
                data = await fetch(`http://www.omdbapi.com/?type=movie&apikey=dfe51d16&s=${this.lastRequest}`, {signal})
                            .then( res => {
                                this.controller, this.lastRequest = null;
                                return res.json()
                            })
                            .catch(err => {
                                if (err.name !== 'AbortError') console.log(err.message);
                            });

                //check if aborted
                if (signal.aborted){
                    this.controller = null;
                    console.log(`aborted ${request}`)
                    return;
                }

                //request additional data(genre, rating, etc)
                
                data = await this.getFullData(data);
            
                this.cache.set(request, data);
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

            this.setState(newState);

        } catch (err) {
            this.setState({error: true});
        }
    }

    async getFullData(data){
        let counter = 0;
        for (let movie of data.Search){
            data.Search[counter++] = await fetch(`http://www.omdbapi.com/?apikey=dfe51d16&t=${movie.Title}`).then(res => res.json());
        }
        return data;
    }

    removeTag(targetTag){
        const curState = this.getState();
        this.setState({
            tags: curState.tags.filter( tag => tag!==targetTag)
        })
    }

}
'use strict'
function createComponent(connector){
    
    let el = document.querySelector('.main'),
        search = document.getElementById('search'),
        history = document.querySelector('.search-box__history'),
        results = document.querySelector('.results'),
        eventHandlers = [onSearch, onScroll, onTagClick, onKeyDown, onClear],
        preloader,
        cardsContainer,
        header;
    
    function init(){
        initEvents();
    }

    function initEvents(){
        eventHandlers.forEach( handler => handler());
    }

    function onSearch(){
        let searchHandler = () => {
            if (search.value === '') return;
            connector.notify({event: 'search', data: search.value});
        };

        

        searchHandler = debounce(searchHandler, 200);

        search.addEventListener('focus', () => el.classList.add('search_active'));
        search.addEventListener('blur', () => {
            if (search.value !== '') return;
            el.classList.remove('search_active');
        });

        search.addEventListener('input', searchHandler);
        search.addEventListener('submit', e => e.preventDefault());


    }

    function onTagClick(){
        const tagClickHandler = (e) => {
            e.preventDefault();
            if (!e.target.classList.contains('history-item')) return;

            if (e.altKey) connector.notify({event: 'remove_tag', data: e.target.dataset.movie});
            else {
                if (e.target === history.firstElementChild) return;
                connector.notify({event: 'search', data: e.target.dataset.movie});
                search.value = e.target.dataset.movie
            }
        }
        
        history.addEventListener('click', tagClickHandler);
        history.addEventListener('doubleclick', e => e.preventDefault());
    }

    function onScroll(){
        const scrollHandler = () => {
            if (window.pageYOffset > search.getBoundingClientRect().bottom) {
                if (!el.classList.contains('scroll')) el.classList.add('scroll');
            } else {
                el.classList.remove('scroll');
            }
        }

        window.addEventListener('scroll', scrollHandler);
    }

    function onKeyDown(){
        const keyDownHandler = (e) => {
            if (e.keyCode < 32) return;
            search.focus();
        }

        document.addEventListener('keydown', keyDownHandler);
    }

    function onClear() {
        const clearButtonHandler = () => {
            search.focus();
            search.value = '';
        }

        el.querySelector('.clear').addEventListener('click', clearButtonHandler);
    }

    //functions to render request data

    function showPreloader(){
        if (!preloader){
            removeChildren(results);
            preloader = createPreloader();
            results.appendChild(preloader);
        }
    }

    function hidePreloader(){
        if (preloader) {
            preloader.remove();
            preloader = undefined;
        }
    }

    function renderCards(moviesData){
        const container = document.createDocumentFragment();

        if (cardsContainer) cardsContainer.remove();
        
        cardsContainer = document.createElement('div');
        cardsContainer.classList.add('results__wrapper');

        moviesData.forEach(movie => {
            cardsContainer.appendChild(createCard(movie));
        });
        container.appendChild(cardsContainer);

        hidePreloader();

        results.appendChild(container);
    }

    function renderResultsHeader(counts) {
        if (header) header.remove();
        header = document.createElement('h2');
        header.classList.add('results__info');
        header.textContent = `Нашли ${counts} ${chooseEnding(counts)}`;
        results.insertBefore(header, results.firstElementChild);
    }

    function renderTags(tags){
        removeChildren(history);
        const tagsContainer = document.createDocumentFragment();
        tags.forEach( tag => {
            tagsContainer.appendChild(createTag(tag));
        })
        history.appendChild(tagsContainer);
    }

    function renderError(error){
        if (!error) return;

        removeChildren(results); 
        hidePreloader();

        if (search.value === '') return;

        if (header) header.remove();
        header = document.createElement('h2');
        header.classList.add('results__info');
        header.textContent = `Мы не поняли о чем речь ¯\_(ツ)_/¯`;
        results.appendChild(header);
    }


    function createCard (cardData){
        const movieCard = document.createElement('movie-card');
        movieCard.title = cardData.title;
        movieCard.link = cardData.link;
        movieCard.poster = cardData.poster;
        movieCard.year = cardData.year;
        movieCard.genre = cardData.genre;
        movieCard.rate = cardData.rate;

        return movieCard;
    }

    function createTag(tag){
        const newTag = document.createElement('a');
        newTag.classList.add('history-item');
        newTag.href = `/?search=${tag}`;
        newTag.target = '_blank';
        newTag.textContent = tag;
        newTag.dataset.movie = tag;
        return newTag;
    }

    
    init();

    return {
        showPreloader,
        hidePreloader,
        renderCards,
        renderResultsHeader,
        renderTags,
        renderError
    }
}
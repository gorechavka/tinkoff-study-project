const movieTempl = document.createElement('template');
movieTempl.classList.add('movie-template');
movieTempl.innerHTML = `
<a class = result>
  <div class="result__data ">
      <div class = "result__rate"></div>
      <h3 class="result__name "></h3>
      <div class="result__features result__year"></div>
      <div class = "result__features result__genre"></div>
  </div>
</a>
`

const params = ['title', 'poster', 'link', 'year', 'genre', 'rate'];

class MovieCard extends HTMLElement{
    constructor(){
      super();
      defineParamsProps(params, this);
    }
    
    connectedCallback(){
      this.appendChild(movieTempl.content.cloneNode(true));
      this.updateContent();
    }

    updateContent(){
      this.querySelector('.result__name').textContent = this.title;

      if (this.poster !== 'N/A') {
        
        const poster = document.createElement('img');
        poster.classList.add('result__poster');
        poster.src = this.poster;
        poster.onload = () => {
          poster.alt = this.title;
          this.querySelector('a').appendChild(poster)
          poster.parentNode.classList.add('loaded');  
          this.querySelector('.result__rate').textContent = this.rate;
          this.querySelector('.result__rate').classList.add(setRate(this.rate));
        }
      }
      this.querySelector('a').href = this.link;
      this.querySelector('.result__year').textContent = this.year;
      this.querySelector('.result__genre').textContent = this.genre;

    }
}

customElements.define('movie-card', MovieCard)

//accessory functions
function defineParamsProps(params, context){
    params.forEach( param => Object.defineProperty(context, param, {
        get(){
            return this.getAttribute(param);
        },
        set(val){
            this.setAttribute(param, val)
        }
    }))
}

function setRate(rate){
    if (rate >= 8) return 'good';
    else if (rate >= 6) return 'norm';
    else if (rate >= 4) return 'sad';
    else return 'bad'; 
}
const chooseEnding = (num) => {
  if (Math.round(num%100/10)===1) return 'фильмов'
  switch (num%10){
      case 1:
        return 'фильм';
      case 2||3||4:
        return 'фильма';
      default:
        return 'фильмов'
  }
}
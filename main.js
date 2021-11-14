
const createDrops = () => {
    const rain = document.querySelector('.rain')
    const drop = document.querySelector('.drop')
    const numberOfDrops = 150
    for (let i = 0; i < numberOfDrops; i++) {
      rain.appendChild(drop.cloneNode())
    }
  }
  
  window.onload = () => {
    createDrops();
  }
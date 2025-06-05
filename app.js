const display = document.getElementById('display');
const btn = document.querySelectorAll("button");

btn.forEach( btn => {btn.addEventListener('click', () => {


  if (btn.id === 'delete=all'){
    display.textContent = '0';
    return;
  }

  if (btn.id === 'delete'){
    if (display.textContent.length <= 1 || display.textContent === 'ERROR!!' ){
      display.textContent = '0';
    } else {
      display.textContent = display.textContent.slice(0,-1);
    }
    return;
  }

  if (btn.id === 'equal'){
    try {
      const displayFixed = display.textContent.replace(/x/g,'*');

      if (/^[0-9/*+.-]+$/.test(displayFixed) && !/[/*+.-]{2,}/.test(displayFixed)){
        display.textContent = eval(displayFixed);
      } else {
        display.textContent = 'ERROR!!';
      }
    } catch {
      display.textContent = 'ERROR!!';
    }
    return;
  }

  if (display.textContent === '0' || display.textContent === 'ERROR!!'){
    display.textContent = btn.textContent;
  } else {
    display.textContent += btn.textContent;
  }

  }
)})
var particleCanvas = null;

function getParticleOptions() {
  const isDark = document.body.classList.contains('dark');
  return {
    particleColor: isDark ? '#ffffff' : '#000000',
    background: isDark ? '#0f1419' : '#d8dee8',
    interactive: true,
    speed: 'slow',
    density: '7000'
  };
}

function initParticles() {
  try {
    const canvasDiv = document.getElementById('container');
    if (!canvasDiv) {
      return;
    }
    
    if (particleCanvas) {
      canvasDiv.innerHTML = '';
    }
    
    const options = getParticleOptions();
    particleCanvas = new ParticleNetwork(canvasDiv, options);
  } catch (error) {
    console.error(error);
  }
}

function updateParticleTheme() {
  if (!particleCanvas) {
    initParticles();
    return;
  }
  
  try {
    const newOptions = getParticleOptions();
    particleCanvas.options.particleColor = newOptions.particleColor;
    particleCanvas.options.background = newOptions.background;
    
    const canvasDiv = document.getElementById('container');
    if (canvasDiv && canvasDiv.firstChild) {
      canvasDiv.firstChild.style.background = newOptions.background;
    }
  } catch (error) {
    initParticles();
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

document.addEventListener('DOMContentLoaded', function() {
  initParticles();
  
  const debouncedUpdateParticleTheme = debounce(updateParticleTheme, 100);
  
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        debouncedUpdateParticleTheme();
      }
    });
  });
  
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
});

(function(){
  function forwardMouse(e){
    try{
      if(!particleCanvas) return;
      var canvas = particleCanvas.canvas;
      var p = particleCanvas.p;
      if(!canvas || !p) return;
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      p.x = x;
      p.y = y;
    }catch(err){
      console.error(err);
    }
  }

  if(window.PointerEvent){
    window.addEventListener('pointermove', forwardMouse, {passive: true});
  } else {
    window.addEventListener('mousemove', forwardMouse, {passive: true});
  }
})();

(function(){
  try{
    var container = document.getElementById('container');
    var uiCard = document.getElementById('ui-card');
    var title = uiCard && uiCard.querySelector('.card-title');

    if(!container || !uiCard) return;

    var _interactTimeout = null;
    function setInteracting(on){
      if(on){
        if(_interactTimeout){ clearTimeout(_interactTimeout); _interactTimeout = null; }
        container.classList.add('ui-interacting');
        uiCard.classList.add('ui-interacting');
        if(title) title.classList.add('glow');
      } else {
        if(_interactTimeout) clearTimeout(_interactTimeout);
        _interactTimeout = setTimeout(function(){
          container.classList.remove('ui-interacting');
          uiCard.classList.remove('ui-interacting');
          if(title) title.classList.remove('glow');
          _interactTimeout = null;
        }, 120);
      }
    }

    uiCard.addEventListener('pointerenter', function(){ setInteracting(true); }, {passive:true});
    uiCard.addEventListener('pointerleave', function(){ setInteracting(false); }, {passive:true});

    uiCard.addEventListener('focusin', function(){ setInteracting(true); });
    uiCard.addEventListener('focusout', function(){ setInteracting(false); });

  }catch(err){
    console.error(err);
  }
})();


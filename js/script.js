// SVG for markers dot
const markerSvg = `
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="6" fill="#0071B9"/>
  </svg>
`;

// Parse data 
const fetchCities = () => {
  return fetch("js/cities.json");
};

async function createGlobe(){
  try {
    // Parse data from json 
    const res = await fetchCities();
    const data = await res.json();
    
    /* Create globe and cards with data */
    const Globe = new ThreeGlobe({ animateIn: true });
    Globe.globeImageUrl('img/map.png');
    
    Globe.atmosphereColor('#D9D5D7');
    Globe.htmlElementsData(data.cities);
    Globe.htmlElement(city => {
      const card = createCard(city, markerSvg);
      return card;
    }); 
    createScene(Globe);

    // Filters click event to switch globe position 
    const continents = document.querySelectorAll('.continent');
    for (const button of continents) {
      button.addEventListener('click', (e) => {
        const activeContinent = document.querySelector('.active');
        activeContinent.classList.remove('active');
        e.currentTarget.classList.add('active');
        cleanAll();
        switch (e.currentTarget.id) {
          case 'europe':
            Globe.rotation.y = 0;
            break;
          case 'amerique':
            Globe.rotation.y = 27;
            break;
          case 'asie':
            Globe.rotation.y = 130;
            break;
          case 'africa':
            Globe.rotation.y = 1;
            break;
        }
      });
    };
  } catch (err) {
    console.log(err);
  }
}

// Function to create cards called in createGlobe() 
const createCard = (city, markerSvg) => {
  const card = document.createElement("div");
  card.className = "card";

  // Style marker
  const marker = document.createElement('div');
  marker.classList.add('marker');
  marker.innerHTML = markerSvg;
  
 // Open and close cards
marker.addEventListener('click', () => { 
    cleanAll();
    marker.classList.add('current-marker');

    const markerContent = marker.parentNode.querySelector('.card-body');
    markerContent.classList.add('is-open');

    const card = marker.parentNode;
    card.classList.add('highzindx');
})
card.appendChild(marker);

  // Get image 
  const cardImage = document.createElement("img");
  cardImage.className = "card-image";
  cardImage.src = city.img;
  card.appendChild(cardImage);

  // Body
  const cardBody = document.createElement("div");
  cardBody.className = "card-body";
  card.appendChild(cardBody);

  // Close card
  const closeCard = document.createElement("div");
  closeCard.className = "close-card";
  closeCard.onclick = () => {
    cleanAll();
  };
  cardBody.appendChild(closeCard);

  // Name of the filiales
  const title = document.createElement("h3");
  title.innerText = city.name;
  title.className = "card-title";
  cardBody.appendChild(title);

  // Contact
  const contact = document.createElement("p");
  contact.innerText = city.contact;
  cardBody.appendChild(contact);

  // Factories
  const cardInfos = document.createElement("span");
  cardInfos.className = "card-factories";
  // Handle pluralize or hide if no factory
  if (city.units === 0) {
    cardInfos.style.display = "none";
  } else if (city.units === 1) {
    cardInfos.innerText = `${city.units} unité de productions`;
  } else {
    cardInfos.innerText = `${city.units} unités de productions`;
  }

  // Add link 
  let cta = document.createElement('a');
  cta.innerText = "Visiter le site web";
  cta.href = city.website;
  cta.target = '_blank';
  cta.classList.add('card-cta');
  
  // Add all that shit to card
  cardBody.append(cardImage, title, contact, cardInfos, cta, closeCard);
  card.append(cardBody);
  
  return card;
}

// Scene Setup
const createScene = (globe) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF5F5F5);
  scene.add(globe);
  scene.add(new THREE.AmbientLight(0xFFFFFF));

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 1000);
  camera.position.z = 300;

  const tbControls = new THREE.TrackballControls(camera, renderers[0].domElement);
  tbControls.minDistance = 300;
  tbControls.maxDistance = 300;
  tbControls.enableDamping = true;
  tbControls.autoRotate = true;
  tbControls.rotateSpeed = 2;
  tbControls.staticMoving = true;
  tbControls.noZoom = true;
  tbControls.update();
  //tbControls.zoomSpeed = 0.8;

  globe.setPointOfView(camera.position, globe.position);
  tbControls.addEventListener('change', () => {
    globe.setPointOfView(camera.position, globe.position);
  });

  globe.rotation.x = 0.60;
  
  // Render every frame
  (function animate() {
    tbControls.update();
    renderers.forEach(r => r.render(scene, camera));
    requestAnimationFrame(animate);
    //globe.rotation.y -= 0.0005;
  })();
}

createGlobe();

// Setup WebGL 3D & 2D Rendereres for globe, cards and dots
const renderers = [new THREE.WebGLRenderer({antialias:true, alpha: true}), new THREE.CSS2DRenderer()];
renderers.forEach((r, idx) => {
  r.setSize(window.innerWidth, window.innerHeight);
  if (idx > 0) {
    r.domElement.style.position = 'absolute';
    r.domElement.style.top = '0px';
    r.domElement.style.pointerEvents = 'none';
  }
  document.getElementById('globe').appendChild(r.domElement);
})

function cleanAll() {
  const markers = document.querySelectorAll('*');
  markers.forEach((element) => {
      element.classList.remove('current-marker');
      element.classList.remove('is-open');
      element.classList.remove('highzindx');
  })
}
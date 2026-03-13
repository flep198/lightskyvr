function printAllLights() {
  // Get the A-Frame scene
  const scene = document.querySelector('a-scene');
  
  if (!scene) {
    console.error('A-Frame scene not found.');
    return;
  }
  
  // Function to recursively find lights in the scene
  function findLights(element) {
    let lights = [];
    
    if (element.hasAttribute && element.hasAttribute('light')) {
      lights.push(element);
    }
    
    if (element.children && element.children.length > 0) {
      for (let i = 0; i < element.children.length; i++) {
        lights = lights.concat(findLights(element.children[i]));
      }
    }
    
    return lights;
  }

  // Find all lights in the scene
  const lights = findLights(scene);

  // Print lights to the console
  if (lights.length > 0) {
    console.log('Lights in the scene:', lights);
  } else {
    console.log('No lights found in the scene.');
  }
}

// Call the function to print all lights
printAllLights();

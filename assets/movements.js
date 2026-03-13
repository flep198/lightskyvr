AFRAME.registerComponent('change-on-click', {
  schema: {
    target: { type: 'vec3' }
  },

  init: function () {
    var el = this.el;  // Reference to the entity with this component (i.e., the box)
    var player = document.querySelector('#player');  // Reference to the player entity
    var camera = player.querySelector('[camera]'); // Reference to the camera entity inside player
    var target = this.data.target;  // The target position
    
    // Array of loading screen IDs
    var loadingScreens = ['#loading-screen-1', '#loading-screen-2', '#loading-screen-3', '#loading-screen-4', '#loading-screen-5', '#loading-screen-6', '#loading-screen-7', '#loading-screen-8', '#loading-screen-9'];
    var shownScreens = [];  // To track which screens have been shown
    
    // Get reference to the HTML5 audio element
    var clickSound = document.querySelector('#click-sound');

    this.el.addEventListener('click', function () {
      // Play the click sound if the audio element exists
      if (clickSound) {
        clickSound.play();
      }
      
      // Step 1: Create a black sphere around the camera/player head
      var blackSphere = document.createElement('a-sphere');
      blackSphere.setAttribute('id', 'black-sphere');
      blackSphere.setAttribute('position', '0 0 0');
      blackSphere.setAttribute('scale', '0.5 0.5 0.5');
      blackSphere.setAttribute('color', '#000000');
      blackSphere.setAttribute('material', 'opacity: 0; shader: flat');
      camera.appendChild(blackSphere);

      // Animation to smoothly make the black sphere opaque
      blackSphere.setAttribute('animation__opaque', {
        property: 'material.opacity',
        from: 0,
        to: 1,
        dur: 1000, // 1 second duration for opacity transition
        easing: 'easeInOutQuad'
      });

      // Step 2: Wait for the black sphere to become opaque
      setTimeout(function () {
        // Move the player's position to -250 0 0
        player.setAttribute('position', '-250 0 0');

        // Animation to smoothly make the black sphere translucent
        blackSphere.setAttribute('animation__translucent', {
          property: 'material.opacity',
          from: 1,
          to: 0,
          dur: 1000, // 1 second duration for opacity transition
          easing: 'easeInOutQuad'
        });

        // Wait for the sphere to become translucent
        setTimeout(function () {
          // Step 3: Display a random image in front of the player
          var loadingImageId = getRandomScreen();
          var loadingImage = document.createElement('a-image');
          loadingImage.setAttribute('id', 'loading-image');
          loadingImage.setAttribute('src', loadingImageId);
          
          // Calculate scale to maintain original aspect ratio
          var aspectRatio = 993 / 324; // Example aspect ratio (width / height)
          var height = 2.5; // Example height in world units
          var width = aspectRatio * height;
          
          loadingImage.setAttribute('scale', `${width} ${height} 1`);
          loadingImage.setAttribute('material', 'opacity: 0; shader: flat');
          
          // Position the image in front of the player
          var playerPosition = player.getAttribute('position');
          loadingImage.setAttribute('position', `${playerPosition.x} ${playerPosition.y+1} ${playerPosition.z - 10}`);
          
          // Append the image to the scene
          el.sceneEl.appendChild(loadingImage);

          // Animation to smoothly fade in the image
          loadingImage.setAttribute('animation__fade-in', {
            property: 'material.opacity',
            from: 0,
            to: 1,
            dur: 1000, // 1 second duration for fade-in
            easing: 'easeInOutQuad'
          });

          // Wait for 10 seconds while displaying the image
          setTimeout(function () {
            // Animation to smoothly fade out the image
            loadingImage.setAttribute('animation__fade-out', {
              property: 'material.opacity',
              from: 1,
              to: 0,
              dur: 1000, // 1 second duration for fade-out
              easing: 'easeInOutQuad'
            });

            // Wait for the image to fade out
            setTimeout(function () {
              el.sceneEl.removeChild(loadingImage);

              // Step 4: Animation to gradually make the black sphere opaque again
              blackSphere.setAttribute('animation__opaque', {
                property: 'material.opacity',
                from: 0,
                to: 1,
                dur: 1000, // 1 second duration for opacity transition
                easing: 'easeInOutQuad'
              });

              // Wait for the black sphere to become opaque
              setTimeout(function () {
                // Move the player's position to the target location
                player.setAttribute('position', target);

                // Step 5: Animation to gradually make the black sphere translucent again
                blackSphere.setAttribute('animation__translucent', {
                  property: 'material.opacity',
                  from: 1,
                  to: 0,
                  dur: 1000, // 1 second duration for opacity transition
                  easing: 'easeInOutQuad'
                });

                // Remove the black sphere after transitioning to new position
                setTimeout(function () {
                  camera.removeChild(blackSphere);

                  // Trigger haptic feedback on the left controller
                  var leftHand = document.querySelector('#leftHand');
                  if (leftHand && leftHand.components['oculus-touch-controls']) {
                    var gamepad = leftHand.components['oculus-touch-controls'].controller;
                    if (gamepad && gamepad.hapticActuators && gamepad.hapticActuators[0]) {
                      var actuator = gamepad.hapticActuators[0];
                      actuator.pulse(1.0, 100); // Pulse at full strength for 100ms
                      setTimeout(function () {
                        actuator.pulse(1.0, 100); // Pulse at full strength for 100ms
                      }, 150);
                      setTimeout(function () {
                        actuator.pulse(1.0, 100); // Pulse at full strength for 100ms
                      }, 300);
                    }
                  }
                }, 1000); // Wait for the black sphere to become translucent
              }, 1000); // Wait for the black sphere to become opaque
            }, 1000); // Wait for the image to fade out
          }, 10000); // Wait for 10 seconds after displaying the image
        }, 1000); // Wait for the sphere to become translucent
      }, 1000); // Wait for the black sphere to become opaque

      // Function to get a random screen that hasn't been shown yet
      function getRandomScreen() {
        // If all screens have been shown, reset the shownScreens array
        if (shownScreens.length === loadingScreens.length) {
          shownScreens = [];
        }

        // Choose a random screen that hasn't been shown yet
        var remainingScreens = loadingScreens.filter(function (screen) {
          return !shownScreens.includes(screen);
        });

        var randomIndex = Math.floor(Math.random() * remainingScreens.length);
        var chosenScreen = remainingScreens[randomIndex];
        shownScreens.push(chosenScreen); // Mark as shown
        return chosenScreen;
      }

      // Step 6: Add loading dots/spheres animation
      var loadingBar = document.createElement('a-entity');
      loadingBar.setAttribute('position', "0 3 -10");
          
      // Append the loading bar to the player entity
      player.appendChild(loadingBar);

      // Create 10 yellow spheres
      for (var i = 0; i < 10; i++) {
        var sphere = document.createElement('a-sphere');
        sphere.setAttribute('position', `${i - 4.5} 0 0`); // Adjust spacing
        sphere.setAttribute('radius', '0.1');
        sphere.setAttribute('color', '#FFE872'); // Yellow color
        sphere.setAttribute('opacity', '0'); // Start invisible
        sphere.setAttribute('material', 'shader: flat');

        // Animation to gradually appear
        sphere.setAttribute('animation__appear', {
          property: 'opacity',
          from: 0,
          to: 1,
          dur: 1000, // 1 second duration for fade-in
          easing: 'easeInOutQuad',
          delay: i * 1000 // Delay each sphere appearance
        });

        // Animation to gradually disappear
        sphere.setAttribute('animation__disappear', {
          property: 'opacity',
          from: 1,
          to: 0,
          dur: 1000, // 1 second duration for fade-out
          easing: 'easeInOutQuad',
          delay: 9000 // Start disappearing after 9 seconds
        });

        loadingBar.appendChild(sphere);
      }

      // Remove spheres after they have faded out
      setTimeout(function () {
        loadingBar.parentNode.removeChild(loadingBar);
      }, 12000); // Wait for 10 seconds after displaying the image
    });
  }
});





// function to handle polar coordinates 
AFRAME.registerComponent('polar-coords', {
        schema: {
          radius: { type: 'number', default: 1 },
          theta: { type: 'number', default: 0 },  // in degrees
          phi: { type: 'number', default: 90 },    // in degrees
          center: { type: 'vec3', default: { x: 0, y: 0, z: 0 } }  // center position
        },

        init: function () {
          this.updatePosition();
        },

        update: function () {
          this.updatePosition();
        },

        updatePosition: function () {
          var data = this.data;
          
          // Convert degrees to radians
          var thetaRad = THREE.MathUtils.degToRad(data.theta);
          var phiRad = THREE.MathUtils.degToRad(data.phi);
          
          // Convert polar coordinates to Cartesian coordinates
          var x = data.radius * Math.cos(thetaRad) * Math.cos(phiRad);
          var y = data.radius * Math.sin(thetaRad);
          var z = data.radius * Math.cos(thetaRad) * Math.sin(phiRad);

          // Add the center position offset
          x += data.center.x;
          y += data.center.y;
          z += data.center.z;
          
          // Set the position of the entity
          this.el.setAttribute('position', { x: x, y: y, z: z });
        }
      });


//make text automatically face camera
AFRAME.registerComponent('text-facing-camera', {
      schema: {
        target: { type: 'vec3', default: { x: 0, y: 0, z: 0 } }  // center position
      },

      tick: function () {
        // Get reference to target position
        var targetPosition = new THREE.Vector3(this.data.target.x, this.data.target.y, this.data.target.z);

        // Rotate the text entity to face the target position
        this.el.object3D.lookAt(targetPosition);
      }
    });

//create hover effect for transition spheres
//create hover effect for transition spheres
AFRAME.registerComponent('hover-effect', {
  schema: {
    hoverColor: { type: 'color', default: '#FF0000' },  // Default hover color is red
    scaleIncrement: { type: 'number', default: 1.2 }   // Default scale increment is 20%
  },

  init: function () {
    var el = this.el;
    var data = this.data;
    var originalColor = el.getAttribute('color');
    var originalScale = el.getAttribute('scale');
    var hoveredScale = {
      x: 1.2,
      y: 1.2,
      z: 1.2
    };

    el.addEventListener('mouseenter', function () {
      // Animate to hovered scale
      el.setAttribute('animation__scale', {
        property: 'scale',
        to: `${hoveredScale.x} ${hoveredScale.y} ${hoveredScale.z}`, // Use backticks here
        dur: 300,  // Animation duration in milliseconds
        easing: 'easeOutElastic'  // Easing function for smooth animation
      });

      // Change color to hover color
      el.setAttribute('color', data.hoverColor);

      // Trigger haptic feedback on the right hand controller
      var rightHand = document.querySelector('#rightHand');
      if (rightHand && rightHand.components['laser-controls']) {
        var gamepad = rightHand.components['laser-controls'].controller;
        if (gamepad && gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
          var actuator = gamepad.hapticActuators[0];
          actuator.pulse(0.5, 100); // Pulse at 50% strength for 100ms
        }
      }
    });

    el.addEventListener('mouseleave', function () {
      // Animate back to original scale
      el.setAttribute('animation__scale', {
        property: 'scale',
        to: "1 1 1", // Use backticks here
        dur: 300,  // Animation duration in milliseconds
        easing: 'easeOutElastic'  // Easing function for smooth animation
      });

      // Revert color back to original
      el.setAttribute('color', originalColor);
    });
  }
});





//handle sounds and lights from different scenes
AFRAME.registerComponent('scene-manager', {
    init: function () {
        var player = document.querySelector('#player');
        var atacamaLights = document.querySelector('#atacama-lights');
        var atacamaSound = document.querySelector('#atacama-sound');
        var muebLights = document.querySelector('#mueb-lights');
        var muebSound = document.querySelector('#mueb-sound');
        var alpsLights = document.querySelector('#alps-lights');
        var alpsSound = document.querySelector('#alps-sound');
        var nyLights = document.querySelector("#ny-lights");
        var nyLights2 = document.querySelector("#ny-lights2");
        var nySound =  document.querySelector("#ny-sound");
        var hiroLights = document.querySelector("#hiro-lights");
        var hiroSound = document.querySelector("#hiro-sound");
      
        var handTexture = document.querySelector("#hand_texture");
      
        // Example logic: Listen for player position changes and activate/deactivate lights and sounds accordingly
        player.addEventListener('componentchanged', function (event) {
            if (event.detail.name === 'position') {
                var playerPosition = player.getAttribute('position');

              
                // Hide environment entity when not in Atacama scene
                var environment = document.querySelector('a-entity[environment]');
                if (playerPosition.x > 100 || player.Position < -100) {
                    environment.setAttribute('visible', false);
                }
              
                // Example condition based on player's position
                if (playerPosition.x <= 100 && playerPosition.x >= -100) {
                    // Activate Atacama lights and sound
                    atacamaLights.setAttribute('light', 'intensity', 0.5);
                    atacamaSound.setAttribute('sound', 'volume', 1.0);
                    environment.setAttribute('visible', true);
                    handTexture.setAttribute("src","#info_atacama");

                    // Deactivate Muenchberg and Alps lights and sound (if needed)
                    muebLights.setAttribute('light', 'intensity', 0);
                    muebSound.setAttribute('sound', 'volume', 0);
                    alpsLights.setAttribute('light', 'intensity', 0);
                    alpsSound.setAttribute('sound', 'volume', 0);
                    nyLights.setAttribute("light", "intensity",0);
                    nyLights2.setAttribute("light", "intensity",0);
                    nySound.setAttribute("sound","volume",0);
                    hiroLights.setAttribute("light", "intensity",0);
                    hiroSound.setAttribute("sound","volume",0);
                } else if (playerPosition.x > 100 && playerPosition.x <= 350) {
                    // Activate Muenchberg lights and sound
                    muebLights.setAttribute('light', 'intensity', 0.6);
                    muebSound.setAttribute('sound', 'volume', 1.0);
                    handTexture.setAttribute("src","#info_mueb");

                    // Deactivate Atacama and Alps lights and sound (if needed)
                    atacamaLights.setAttribute('light', 'intensity', 0);
                    atacamaSound.setAttribute('sound', 'volume', 0);
                    alpsLights.setAttribute('light', 'intensity', 0);
                    alpsSound.setAttribute('sound', 'volume', 0);
                    nyLights.setAttribute("light", "intensity",0);
                    nyLights2.setAttribute("light", "intensity",0);
                    nySound.setAttribute("sound","volume",0);
                    hiroLights.setAttribute("light", "intensity",0);
                    hiroSound.setAttribute("sound","volume",0);
                } else if (playerPosition.x > 350 && playerPosition.x <= 650) {
                    // Activate Alps lights and sound
                    alpsLights.setAttribute('light', 'intensity', 0.6);
                    alpsSound.setAttribute('sound', 'volume', 1.0);
                    handTexture.setAttribute("src","#info_alps");

                    // Deactivate Atacama and Muenchberg lights and sound (if needed)
                    atacamaLights.setAttribute('light', 'intensity', 0);
                    atacamaSound.setAttribute('sound', 'volume', 0);
                    muebLights.setAttribute('light', 'intensity', 0);
                    muebSound.setAttribute('sound', 'volume', 0);
                    nyLights.setAttribute("light", "intensity",0);
                    nyLights2.setAttribute("light", "intensity",0);
                    nySound.setAttribute("sound","volume",0);
                    hiroLights.setAttribute("light", "intensity",0);
                    hiroSound.setAttribute("sound","volume",0);
                  
                } else if (playerPosition.x > 600 && playerPosition.x <= 850) {
                    // Activate New York lights and sound
                    nyLights.setAttribute('light', 'intensity', 0.05);
                    nyLights2.setAttribute("light", "intensity",0.5);
                    nySound.setAttribute('sound', 'volume', 1.0);
                    handTexture.setAttribute("src","#info_ny");

                    // Deactivate others
                    atacamaLights.setAttribute('light', 'intensity', 0);
                    atacamaSound.setAttribute('sound', 'volume', 0);
                    muebLights.setAttribute('light', 'intensity', 0);
                    muebSound.setAttribute('sound', 'volume', 0);
                    alpsLights.setAttribute("light", "intensity",0);
                    alpsSound.setAttribute("sound","volume",0);
                    hiroLights.setAttribute("light", "intensity",0);
                    hiroSound.setAttribute("sound","volume",0);
                } else if (playerPosition.x > 850) {
                    // Activate Hiroshima
                    hiroLights.setAttribute('light', 'intensity', 0.05);
                    hiroSound.setAttribute('sound', 'volume', 1.0);
                    handTexture.setAttribute("src","#info_hiro");

                    // Deactivate others
                    atacamaLights.setAttribute('light', 'intensity', 0);
                    atacamaSound.setAttribute('sound', 'volume', 0);
                    muebLights.setAttribute('light', 'intensity', 0);
                    muebSound.setAttribute('sound', 'volume', 0);
                    nyLights.setAttribute("light", "intensity",0);
                    nyLights2.setAttribute("light", "intensity",0);
                    nySound.setAttribute("sound","volume",0);
                    alpsLights.setAttribute("light", "intensity",0);
                    alpsSound.setAttribute("sound","volume",0);
                } else if (playerPosition.x < -100) {
                    handTexture.setAttribute("src","#info_default");
                  
                    // Deactivate all scenes
                    muebLights.setAttribute('light', 'intensity', 0.0);
                    muebSound.setAttribute('sound', 'volume', 0.0);
                    atacamaLights.setAttribute('light', 'intensity', 0);
                    atacamaSound.setAttribute('sound', 'volume', 0);
                    alpsLights.setAttribute('light', 'intensity', 0);
                    alpsSound.setAttribute('sound', 'volume', 0);
                    nyLights.setAttribute("light", "intensity",0);
                    nyLights2.setAttribute("light", "intensity",0);
                    nySound.setAttribute("sound","volume",0);
                    hiroLights.setAttribute("light", "intensity",0);
                    hiroSound.setAttribute("sound","volume",0);
                }
            }
        });
    }
});


//reset player to start position after long press of X
AFRAME.registerComponent('reset-on-long-press', {
  init: function () {
    var el = this.el;
    var timeout = null;
    var durationThreshold = 5000; // 5 seconds in milliseconds

    // Create the filling circle animation entity
    var circleAnimation = document.createElement('a-entity');
    circleAnimation.setAttribute('geometry', {
      primitive: 'ring',
      radiusInner: 0.01,
      radiusOuter: 0.02,
    });
    circleAnimation.setAttribute('material', {
      color: '#00FF00',
      opacity: 0,
      shader: 'flat',
    });
    circleAnimation.setAttribute('scale', '0 0 0');

    // Append to camera entity
    var player = document.querySelector('#player');
    var camera = player.querySelector('[camera]');
    camera.appendChild(circleAnimation);

    // Function to start the filling animation
    function startFillAnimation() {
      circleAnimation.setAttribute('animation__scale', {
        property: 'scale',
        from: '0 0 0',
        to: '1 1 1',
        dur: durationThreshold,
        easing: 'linear',
      });
      circleAnimation.setAttribute('animation__opacity', {
        property: 'material.opacity',
        from: 0,
        to: 0.5,
        dur: durationThreshold,
        easing: 'linear',
      });
    }

    // Event listener for xbuttondown event
    el.addEventListener('xbuttondown', function (event) {
      timeout = setTimeout(function () {
        // Reset player to position -500 0 0
        var player = document.querySelector('#player');
        player.setAttribute('position', '-500 0 0');

        // Optional: Perform additional actions upon long press
        console.log('Player reset due to long press.');
      }, durationThreshold);

      // Start the filling animation when long press starts
      startFillAnimation();
    });

    // Event listener for xbuttonup event
    el.addEventListener('xbuttonup', function (event) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      // Reset the filling animation
      circleAnimation.setAttribute('animation__scale', {
        property: 'scale',
        to: '0 0 0',
        dur: 0,
      });
      circleAnimation.setAttribute('animation__opacity', {
        property: 'material.opacity',
        to: 0,
        dur: 0,
      });
    });
  }
});





//refresh page upon A press on right controller
AFRAME.registerComponent('reload-on-button-hold', {
        init: function () {
          var el = this.el;
          var holdTimeout;
          var requiredHoldTime = 5000; // 5 seconds

          el.addEventListener('abuttondown', function () {
            // Set timeout to reload the page after 5 seconds
            holdTimeout = setTimeout(function () {
              window.location.reload();
            }, requiredHoldTime);
          });

          el.addEventListener('abuttonup', function () {
            // Clear the timeout if the button is released before 5 seconds
            clearTimeout(holdTimeout);
          });
        }
      })


//Add random walk for Llama
AFRAME.registerComponent('random-walk', {
  init: function () {
    this.direction = new THREE.Vector3(); // Vector to store direction
    this.walkSpeed = 0.001; // Adjust speed as needed
    this.rotationSpeed = 0.1; // Adjust rotation speed as needed
    this.randomizeDirection(); // Start with a random direction

    // Set boundaries
    this.minX = -30; // Adjust as needed
    this.maxX = 30; // Adjust as needed
    this.minZ = -30; // Adjust as needed
    this.maxZ = 30; // Adjust as needed

    // Minimum distance to player
    this.minDistanceToPlayer = 3;

    // Random break variables
    this.isWalking = true; // Flag to track walking state
    this.breakDuration = this.getRandomBreakDuration(); // Initial break duration
    this.breakTimer = 0; // Timer to count break duration

    // Reference to sound entity
    this.soundEntity = document.querySelector('#llama-sound');

    // Reference to player entity
    this.playerEntity = document.querySelector('#player');

    // Flag to track if currently spinning
    this.isSpinning = false;

    // Add click event listener for the llama
    this.el.addEventListener('click', this.onClick.bind(this));
  },

  onClick: function () {
    if (!this.isSpinning) {
      // Execute "Spin" animation once
      this.isSpinning = true;
      this.el.setAttribute('animation-mixer', {
        clip: 'Spin',
        loop: 'once',
        crossFadeDuration: 0,
        timeScale: 0.5
      });

      // After the "Spin" animation is done, resume walking
      setTimeout(() => {
        this.isSpinning = false;

        // Resume walking animation if not too close to player
        if (this.isWalking) {
          this.currentAnimation = 'Run';
          this.el.setAttribute('animation-mixer', {
            clip: 'Run',
            loop: 'repeat',
            repetitions: Infinity,
            crossFadeDuration: 0,
            timeScale: 0.2
          });
        }
      }, 500 / 0.5); // Assuming the "Spin" animation duration is 0.5 seconds, adjust as needed
    }
  },

  tick: function (time, delta) {
    // Calculate distance to player
    const distanceToPlayer = this.playerEntity ? this.el.object3D.position.distanceTo(this.playerEntity.object3D.position) : Infinity;

    if (!this.isSpinning) {
      if (this.isWalking) {
        // Check if llama is too close to the player
        if (distanceToPlayer < this.minDistanceToPlayer) {
          // Llama is too close to the player, switch to break state
          this.isWalking = false;
          this.breakTimer = 0; // Reset break timer
          this.breakDuration = this.getRandomBreakDuration(); // Get new break duration

          // Play 'Idle_A' animation if not already playing
          if (this.currentAnimation !== 'Idle_A') {
            this.currentAnimation = 'Idle_A';
            this.el.setAttribute('animation-mixer', {
              clip: 'Idle_A',
              loop: 'repeat',
              repetitions: Infinity,
              crossFadeDuration: 0,
              timeScale: 0.1
            });
          }

          // Pause sound when stopping
          if (this.soundEntity) {
            this.soundEntity.components.sound.pause();
          }
        } else {
          // Move the entity along its current direction
          this.el.object3D.position.addScaledVector(this.direction, this.walkSpeed * delta);

          // Check boundaries and adjust position if needed
          this.checkBounds();

          // Rotate the entity to face its movement direction
          this.el.object3D.lookAt(this.el.object3D.position.x + this.direction.x, this.el.object3D.position.y, this.el.object3D.position.z + this.direction.z);

          // Play 'Run' animation if not already playing
          if (this.currentAnimation !== 'Run') {
            this.currentAnimation = 'Run';
            this.el.setAttribute('animation-mixer', {
              clip: 'Run',
              loop: 'repeat',
              repetitions: Infinity,
              crossFadeDuration: 0,
              timeScale: 0.2
            });
          }

          // Check if it's time to take a break
          if (this.breakTimer >= this.breakDuration) {
            this.isWalking = false;
            this.breakTimer = 0;
            this.breakDuration = this.getRandomBreakDuration();

            // Pause sound when stopping
            if (this.soundEntity) {
              this.soundEntity.components.sound.pause();
            }
          } else {
            this.breakTimer += delta / 1000; // Convert milliseconds to seconds
          }
        }
      } else {
        // Llama is taking a break
        // Play 'Idle_A' animation if not already playing
        if (this.currentAnimation !== 'Idle_A') {
          this.currentAnimation = 'Idle_A';
          this.el.setAttribute('animation-mixer', {
            clip: 'Idle_A',
            loop: 'repeat',
            repetitions: Infinity,
            crossFadeDuration: 0,
            timeScale: 0.1
          });
        }

        // After break duration, resume walking if not too close to player
        if (this.breakTimer >= this.breakDuration) {
          if (distanceToPlayer >= this.minDistanceToPlayer) {
            this.isWalking = true;
            this.breakTimer = 0;
            this.breakDuration = this.getRandomBreakDuration();
            this.randomizeDirection(); // Randomize direction upon resuming walk

            // Resume sound when resuming walking
            if (this.soundEntity) {
              this.soundEntity.components.sound.play();
            }
          } else {
            // If still too close, continue to break and check again
            this.breakTimer = 0;
            this.breakDuration = this.getRandomBreakDuration();
          }
        } else {
          this.breakTimer += delta / 1000; // Convert milliseconds to seconds
        }
      }
    }
  },

  randomizeDirection: function () {
    // Generate a random direction vector
    this.direction.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
  },

  checkBounds: function () {
    // Ensure entity stays within boundaries
    if (this.el.object3D.position.x < this.minX) {
      this.el.object3D.position.x = this.minX;
      this.randomizeDirection(); // Randomize direction upon hitting boundary
    }
    if (this.el.object3D.position.x > this.maxX) {
      this.el.object3D.position.x = this.maxX;
      this.randomizeDirection();
    }
    if (this.el.object3D.position.z < this.minZ) {
      this.el.object3D.position.z = this.minZ;
      this.randomizeDirection();
    }
    if (this.el.object3D.position.z > this.maxZ) {
      this.el.object3D.position.z = this.maxZ;
      this.randomizeDirection();
    }
  },

  getRandomBreakDuration: function () {
    // Generate a random break duration between 1 to 5 seconds (adjust as needed)
    return Math.random() * 4 + 1; // Random between 1 to 5 seconds
  }
});








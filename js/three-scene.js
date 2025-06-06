// Three.js Scene Controller for 3D Effects
class ThreeSceneController {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.geometries = [];
        this.animationId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        this.init();
    }    init() {
        this.container = document.getElementById('three-container');
        if (!this.container) {
            return;
        }

        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.createParticleSystem();
        this.createFloatingGeometry();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0f0f0f, 1, 1000);
    }

    setupCamera() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 500;
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        
        // Enable shadows for more realistic effects
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
    }

    createParticleSystem() {
        const particleCount = 2000;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        // Create particle positions and properties
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions
            positions[i3] = (Math.random() - 0.5) * 2000;
            positions[i3 + 1] = (Math.random() - 0.5) * 2000;
            positions[i3 + 2] = (Math.random() - 0.5) * 1000;
            
            // Random velocities
            velocities[i3] = (Math.random() - 0.5) * 2;
            velocities[i3 + 1] = (Math.random() - 0.5) * 2;
            velocities[i3 + 2] = (Math.random() - 0.5) * 2;
            
            // Golden colors with variations
            const golden = new THREE.Color(0xd4af37);
            const orange = new THREE.Color(0xff6b35);
            const color = golden.lerp(orange, Math.random());
            
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Random sizes
            sizes[i] = Math.random() * 4 + 1;
        }

        // Create geometry and material
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                pixelRatio: { value: window.devicePixelRatio }
            },
            vertexShader: `
                uniform float time;
                uniform float pixelRatio;
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    pos.x += sin(time * 0.001 + position.y * 0.01) * 10.0;
                    pos.y += cos(time * 0.001 + position.x * 0.01) * 10.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                    
                    vAlpha = smoothstep(-800.0, -200.0, mvPosition.z);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    float distance = length(gl_PointCoord - vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
                    
                    float glow = sin(time * 0.002) * 0.5 + 0.5;
                    alpha *= vAlpha * (0.5 + glow * 0.5);
                    
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
        
        // Store references for animation
        this.particlePositions = positions;
        this.particleVelocities = velocities;
        this.particleMaterial = material;
    }

    createFloatingGeometry() {
        // Create floating geometric shapes
        const shapes = [];
        
        // Floating cubes with wireframe
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.BoxGeometry(30, 30, 30);
            const material = new THREE.MeshBasicMaterial({
                color: 0xd4af37,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });
            
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                (Math.random() - 0.5) * 800,
                (Math.random() - 0.5) * 600,
                (Math.random() - 0.5) * 400
            );
            
            cube.rotation.x = Math.random() * Math.PI;
            cube.rotation.y = Math.random() * Math.PI;
            
            shapes.push(cube);
            this.scene.add(cube);
        }
        
        // Floating torus
        for (let i = 0; i < 3; i++) {
            const geometry = new THREE.TorusGeometry(40, 10, 8, 16);
            const material = new THREE.MeshBasicMaterial({
                color: 0xff6b35,
                wireframe: true,
                transparent: true,
                opacity: 0.2
            });
            
            const torus = new THREE.Mesh(geometry, material);
            torus.position.set(
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 800,
                (Math.random() - 0.5) * 500
            );
            
            shapes.push(torus);
            this.scene.add(torus);
        }
        
        this.geometries = shapes;
    }

    setupEventListeners() {
        // Mouse movement for parallax effect
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX - window.innerWidth / 2) / 100;
            this.mouseY = (event.clientY - window.innerHeight / 2) / 100;
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Scroll handler for parallax
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    handleScroll() {
        const scrollY = window.pageYOffset;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollProgress = scrollY / maxScroll;
        
        // Adjust camera position based on scroll
        this.camera.position.z = 500 + scrollProgress * 200;
        
        // Rotate the entire scene slightly
        if (this.particleSystem) {
            this.particleSystem.rotation.y = scrollProgress * Math.PI * 0.5;
        }
    }

    updateParticles(time) {
        if (!this.particleSystem) return;
        
        const positions = this.particleSystem.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Add floating motion
            positions[i] += this.particleVelocities[i] * 0.5;
            positions[i + 1] += this.particleVelocities[i + 1] * 0.5;
            positions[i + 2] += this.particleVelocities[i + 2] * 0.5;
            
            // Wrap around screen boundaries
            if (positions[i] > 1000) positions[i] = -1000;
            if (positions[i] < -1000) positions[i] = 1000;
            if (positions[i + 1] > 1000) positions[i + 1] = -1000;
            if (positions[i + 1] < -1000) positions[i + 1] = 1000;
            if (positions[i + 2] > 500) positions[i + 2] = -500;
            if (positions[i + 2] < -500) positions[i + 2] = 500;
        }
        
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        
        // Update shader time uniform
        if (this.particleMaterial) {
            this.particleMaterial.uniforms.time.value = time;
        }
    }

    updateGeometry(time) {
        this.geometries.forEach((shape, index) => {
            // Rotate shapes
            shape.rotation.x += 0.01;
            shape.rotation.y += 0.01;
            shape.rotation.z += 0.005;
            
            // Add floating motion
            shape.position.y += Math.sin(time * 0.001 + index) * 0.5;
            shape.position.x += Math.cos(time * 0.0008 + index) * 0.3;
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const time = Date.now();
        
        // Smooth camera movement based on mouse
        this.targetX = this.mouseX;
        this.targetY = this.mouseY;
        
        this.camera.position.x += (this.targetX - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.targetY - this.camera.position.y) * 0.05;
        
        // Update scene elements
        this.updateParticles(time);
        this.updateGeometry(time);
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up Three.js resources
        this.scene.clear();
        this.renderer.dispose();
        
        // Remove canvas from DOM
        if (this.container && this.renderer.domElement) {
            this.container.removeChild(this.renderer.domElement);
        }
    }

    // Method to pause/resume animations based on page visibility
    handleVisibilityChange(isVisible) {
        if (!isVisible) {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        } else {
            if (!this.animationId) {
                this.animate();
            }
        }
    }
}

// Initialize Three.js scene when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.threeScene = new ThreeSceneController();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.threeScene) {
        window.threeScene.handleVisibilityChange(!document.hidden);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThreeSceneController;
}

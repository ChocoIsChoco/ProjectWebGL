import { THREE } from '../../index.js';

export function createTerrain() {
    const size = 15;
    const segments = 64;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        
        const dist = Math.sqrt(x * x + y * y);
        let height = 0;
        
        if (dist > 2) {
            height = Math.sin(x * 0.8) * Math.cos(y * 0.8) * 0.8;
            height += Math.sin(x * 2.0 + y * 1.5) * 0.2;
        }
        
        pos.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshLambertMaterial({
        color: 0x4676b6,
        wireframe: false,
        side: THREE.DoubleSide
    });
    
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    
    return terrain;
}

export class Physics {
  public distance(obj1: { x: number; y: number }, obj2: { x: number; y: number }): number {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public checkCollision(
    obj1: { x: number; y: number; radius?: number },
    obj2: { x: number; y: number; radius?: number }
  ): boolean {
    const distance = this.distance(obj1, obj2);
    const radius1 = obj1.radius || 12;
    const radius2 = obj2.radius || 12;
    return distance < radius1 + radius2;
  }

  public resolveCollision(
    obj1: { x: number; y: number; vx?: number; vy?: number },
    obj2: { x: number; y: number; vx?: number; vy?: number }
  ) {
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Separate objects
    const overlap = 24 - distance;
    obj1.x -= nx * overlap * 0.5;
    obj1.y -= ny * overlap * 0.5;
    obj2.x += nx * overlap * 0.5;
    obj2.y += ny * overlap * 0.5;
  }
}

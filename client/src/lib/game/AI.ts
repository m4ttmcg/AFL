import { Player } from "./Player";
import { Ball } from "./Ball";

export class AI {
  public updatePlayer(player: Player, ball: Ball, allPlayers: Player[], deltaTime: number) {
    // Simple AI logic
    if (ball.isNearPlayer(player)) {
      // If player has ball, move towards goal
      const goalX = player.team === 'home' ? 1180 : 20;
      const goalY = 400;
      player.updateAI(goalX, goalY, deltaTime);
    } else {
      // Move towards ball
      player.updateAI(ball.x, ball.y, deltaTime);
    }
  }
}

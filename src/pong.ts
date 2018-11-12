import Velocity from "./velocity";
import Puck from "./puck";
import Paddle from "./paddle";

export default class Pong {
    puck: Puck;
    paddle_l: Paddle;
    paddle_r: Paddle;

    constructor(
        public width: number,
        public height: number,
        public game_over: () => void
    ) {
        const half_width = Math.floor(width / 2),
            half_height = Math.floor(height / 2);

        const puck_width = 20, puck_height = 20,
            puck_y = half_height - Math.round(puck_height / 2);
        this.puck = new Puck(
            puck_width, puck_height,
            half_width, half_height, 3);

        const paddle_width = 20, paddle_height = 100,
            paddle_y = half_height - Math.round(paddle_height / 2);
        this.paddle_l = new Paddle(0, paddle_y, paddle_width, paddle_height);
        this.paddle_r = new Paddle(
            width - paddle_width, paddle_y, paddle_width, paddle_height);
    }

    tick(): void {
        this.puck.tick();
        this.paddle_l.tick();
        this.paddle_r.tick();

        // Paddle/puck collision check
        this.paddle_l.bounce(this.puck);
        this.paddle_r.bounce(this.puck);

        // TODO don't reverse vel multiple times in single tick

        // Puck/ceiling or puck/floor collision check
        if (this.puck.left <= 0 || this.puck.right >= this.width) {
            this.puck.vel.x *= -1;
        }
        if (this.puck.top <= 0 || this.puck.bottom >= this.height) {
            this.puck.vel.y *= -1;
        }

        // Puck/wall collision check (victory condition)
        if (this.puck.left <= 0 || this.puck.right >= this.width) {
            this.game_over();
        }
    }
}
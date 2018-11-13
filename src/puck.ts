import Paddle from "./paddle";
import Velocity from "./velocity";

export default class Puck {
    vel: Velocity;

    get right(): number { return this.left + this.width; }
    get bottom(): number { return this.top + this.height; }

    constructor(
        public width: number, public height: number,
        public left: number, public top: number,
        speed: number
    ) {
        // Calculate random initial vector with given speed.
        this.vel = Velocity.random_with_r(speed);
    }

    tick(): void {
        this.left += this.vel.x;
        this.top += this.vel.y;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "magenta";
        ctx.fillRect(
            Math.round(this.left),
            Math.round(this.top),
            Math.round(this.width),
            Math.round(this.height)
        );
    }
}

import Input from "./input";
import Pong from "./pong";

export default class Paddle {
    constructor(
        public left: number,
        public top: number,
        public width: number,
        public height: number,
        public input: Input,
        private pong: Pong
    ) { }

    get right(): number { return this.left + this.width; }
    get bottom(): number { return this.top + this.height; }
    get center_x(): number { return this.left + this.width / 2; }
    get center_y(): number { return this.top + this.height / 2; }
    get pulling(): boolean {
        return (
            (this.moving_down || this.moving_up) &&
            !(this.moving_down && this.moving_up)
        );
    }

    moving_down = false;
    moving_up = false;

    static readonly move_speed = 2;
    static readonly grab_force = 0.1;

    tick(): void {
        const puck = this.pong.puck;

        // Apply paddle movement
        if (this.moving_down && this.bottom < this.pong.height) {
            this.top += Paddle.move_speed;
        }
        if (this.moving_up && this.top > 0) {
            this.top -= Paddle.move_speed;
        }

        // Is the puck touching or overlapping this paddle at all?
        if (
            (puck.left <= this.right) &&
            (puck.right >= this.left) &&
            (puck.top <= this.bottom) &&
            (puck.bottom >= this.top)
        ) {
            let x_overlap: number,
                y_overlap: number,
                x_teleport: number,
                y_teleport: number,
                bend_up_factor: number | undefined,
                bend_down_factor: number | undefined;

            const right_overlap = this.right - puck.left;
            const left_overlap = puck.right - this.left;

            // Is the puck at the paddle's left or right edge?
            // The answer is whichever overlap is lesser.
            if (right_overlap < left_overlap) {
                x_teleport = this.right;
                x_overlap = right_overlap;
            } else {
                x_teleport = this.left - puck.width;
                x_overlap = left_overlap;
            }

            const bottom_overlap = this.bottom - puck.top;
            const top_overlap = puck.bottom - this.top;

            // Is the puck at the paddle's top or bottom edge?
            // Again, it's edge with the lesser overlap.
            if (bottom_overlap < top_overlap) {
                y_teleport = this.bottom;
                y_overlap = bottom_overlap;

                if (bottom_overlap < (puck.height * 2)) {
                    // When puck is just off the paddle's bottom, angle it
                    // downwards in proportion to how little of it is overlapping.
                    bend_down_factor = 1 - (bottom_overlap / (puck.height * 2));
                }
            } else {
                y_teleport = this.top - puck.height;
                y_overlap = top_overlap;

                if (top_overlap < (puck.height * 2)) {
                    // When puck is just off the paddle's TOP, angle it
                    // UPwards in proportion to how little of it is overlapping.
                    bend_up_factor = 1 - (top_overlap / (puck.height * 2));
                }
            }

            // Is the puck hitting a vertical or horizontal edge?
            // Take the lesser of the overlap results from above to find out.
            //
            // Note: if they're equal, both axes get reversed,
            // because the puck is exactly hitting a corner!
            //
            // Also, move the puck to line up exactly with the edge it's
            // bouncing off, so the paddle appears to push it if it's moving.
            // (This also avoids the problem of the puck getting stuck inside
            // the paddle in a bouncing loop.)
            if (x_overlap <= y_overlap) {
                puck.left = x_teleport;
                puck.vel.x *= -1;

                if (bend_up_factor !== undefined) {
                    puck.vel.bend_up(bend_up_factor);
                }
                else if (bend_down_factor !== undefined) {
                    puck.vel.bend_down(bend_down_factor);
                }
            }
            else if (x_overlap >= y_overlap) {
                puck.top = y_teleport;
                puck.vel.y *= -1;
            }
        }

        this.input.tick(this, this.pong);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.pulling ? "yellow" : "limegreen";
        ctx.fillRect(this.left, this.top, this.width, this.height);
    }
}

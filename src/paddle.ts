import Pong from './pong'

export default class Paddle {
    static readonly pull_force = 0.1
    static readonly move_speed = 3 // should maybe be 2 in magnetic mode?

    public left_boundary = 0
    public right_boundary = 0

    public moving_down = false
    public moving_up = false
    public moving_left = false
    public moving_right = false
    public trying_to_grab = false

    constructor(
        public left: number,
        public top: number,
        public width: number,
        public height: number,
        private pong: Pong
    ) {}

    init(): void {
        if (this.center_x < this.pong.center_x) {
            this.left_boundary = 0
            this.right_boundary = this.pong.center_x - this.pong.puck.width / 2
        } else {
            this.left_boundary = this.pong.center_x + this.pong.puck.width / 2
            this.right_boundary = this.pong.width
        }
    }

    get right(): number {
        return this.left + this.width
    }

    get bottom(): number {
        return this.top + this.height
    }

    get center_x(): number {
        return this.left + this.width / 2
    }

    get center_y(): number {
        return this.top + this.height / 2
    }

    get pulling(): boolean {
        // Paddle exerts attractive force on puck when moving
        // in any direction: ((down XOR up) OR (left XOR right)).
        // The xors are because both can be true but that results
        // in standing still along that axis.
        //
        // TODO don't allow pulling by moving against a wall?
        // (i.e. standing still)
        //
        // prettier-ignore
        return (
            this.pong.game_mode.magnetic
            &&
            (
                (
                    (this.moving_down || this.moving_up) &&
                    !(this.moving_down && this.moving_up)
                )
                ||
                (
                    (this.moving_right || this.moving_left) &&
                    !(this.moving_right && this.moving_left)
                )
            )
        )
    }

    get should_apply_grabbing(): boolean {
        return this.pong.game_mode.grabbing && this.trying_to_grab
    }

    // FIXME: factor me out too
    public calculateBounce(): void {
        const puck = this.pong.puck
        let x_overlap: number,
            y_overlap: number,
            x_teleport: number,
            y_teleport: number,
            bend_up_factor: number | undefined,
            bend_down_factor: number | undefined

        const right_overlap = this.right - puck.left
        const left_overlap = puck.right - this.left

        // Is the puck at the paddle's left or right edge?
        // The answer is whichever overlap is lesser.
        if (right_overlap < left_overlap) {
            x_teleport = this.right
            x_overlap = right_overlap
        } else {
            x_teleport = this.left - puck.width
            x_overlap = left_overlap
        }

        const bottom_overlap = this.bottom - puck.top
        const top_overlap = puck.bottom - this.top

        // Is the puck at the paddle's top or bottom edge?
        // Again, it's edge with the lesser overlap.
        if (bottom_overlap < top_overlap) {
            y_teleport = this.bottom
            y_overlap = bottom_overlap

            if (bottom_overlap < puck.height * 2) {
                // When puck is just off the paddle's bottom, angle it
                // downwards in proportion to how little of it is overlapping.
                bend_down_factor = 1 - bottom_overlap / (puck.height * 2)
            }
        } else {
            y_teleport = this.top - puck.height
            y_overlap = top_overlap

            if (top_overlap < puck.height * 2) {
                // When puck is just off the paddle's TOP, angle it
                // UPwards in proportion to how little of it is overlapping.
                bend_up_factor = 1 - top_overlap / (puck.height * 2)
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
            puck.left = x_teleport
            puck.vel.x *= -1

            if (bend_up_factor !== undefined) {
                puck.vel.bend_up(bend_up_factor)
            } else if (bend_down_factor !== undefined) {
                puck.vel.bend_down(bend_down_factor)
            }
        } else if (x_overlap >= y_overlap) {
            puck.top = y_teleport
            puck.vel.y *= -1
        }
    }
}

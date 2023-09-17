import Paddle from './paddle'
import Velocity from './velocity'

export default class Puck {
    vel: Velocity
    grabbed_by: Paddle | undefined

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

    constructor(
        public width: number,
        public height: number,
        public left: number,
        public top: number,
        speed: number,
        private paddles: Paddle[]
    ) {
        // Calculate random initial vector with given speed.
        this.vel = Velocity.random_with_r(speed, speed * 1.5)
    }

    tick(): void {
        // Don't move if grabbed -- paddle will apply
        // movement (but keep velocity for when it's released)
        if (this.grabbed_by !== undefined) return

        // Apply current velocity
        this.left += this.vel.x
        this.top += this.vel.y

        // Apply gravity toward any moving paddle
        for (const paddle of this.paddles) {
            if (paddle.pulling) {
                const rel_x = paddle.center_x - this.center_x
                const rel_y = paddle.center_y - this.center_y
                this.vel.apply_force_toward(Paddle.pull_force, rel_x, rel_y)
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'magenta'
        ctx.fillRect(
            Math.round(this.left),
            Math.round(this.top),
            Math.round(this.width),
            Math.round(this.height)
        )
    }
}

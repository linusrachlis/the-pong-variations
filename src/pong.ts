import Puck from './puck'
import Paddle from './paddle'
import * as util from './util'
import { GameMode } from './main'

export default class Pong {
    puck: Puck
    paddle_l: Paddle
    paddle_r: Paddle

    is_over = false

    constructor(
        public game_mode: GameMode,
        public width: number,
        public height: number
    ) {
        const half_width = Math.floor(width / 2)
        const half_height = Math.floor(height / 2)

        const puck_width = 20
        const puck_height = 20
        this.puck = new Puck(
            puck_width,
            puck_height,
            half_width,
            half_height,
            3
        )

        const paddle_width = 20,
            paddle_height = 100,
            paddle_y = half_height - Math.round(paddle_height / 2)
        this.paddle_l = new Paddle(
            0,
            paddle_y,
            paddle_width,
            paddle_height,
            this
        )
        this.paddle_r = new Paddle(
            width - paddle_width,
            paddle_y,
            paddle_width,
            paddle_height,
            this
        )
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.clearRect(0, 0, this.width, this.height)
        this.paddle_l.draw(ctx)
        this.paddle_r.draw(ctx)
        this.puck.draw(ctx)

        if (this.is_over) {
            util.paint_text(
                ctx,
                'GAME OVER!',
                'bold 48px sans-serif',
                this.width / 2,
                this.height / 2
            )
            util.paint_text(
                ctx,
                'Space to restart',
                '16px sans-serif',
                this.width / 2,
                this.height / 2 + 48
            )
        }
    }

    tick(): void {
        this.puck.tick()
        this.paddle_l.tick()
        this.paddle_r.tick()

        // TODO don't reverse vel multiple times in single tick

        // Puck/ceiling or puck/floor collision check
        if (this.puck.top <= 0 || this.puck.bottom >= this.height) {
            this.puck.vel.y *= -1
        }

        // Puck/wall collision check (victory condition)
        if (this.puck.left <= 0 || this.puck.right >= this.width) {
            this.is_over = true
        }
    }
}

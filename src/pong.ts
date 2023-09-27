import { PlayerSide } from './enums'
import Input from './input'
import { GameMode } from './main'
import Paddle from './paddle'
import Puck from './puck'

export default class Pong {
    puck: Puck
    paddle_l: Paddle
    paddle_r: Paddle
    paddles: Record<PlayerSide, Paddle>
    center_x: number
    center_y: number

    is_over = false

    constructor(
        public game_mode: GameMode,
        public width: number,
        public height: number,
        input_l: Input,
        input_r: Input
    ) {
        this.center_x = width / 2
        this.center_y = height / 2

        const paddle_width = 20
        const paddle_height = 100
        const paddle_y = this.center_y - Math.round(paddle_height / 2)
        this.paddle_l = new Paddle(
            0,
            paddle_y,
            paddle_width,
            paddle_height,
            input_l,
            this
        )
        this.paddle_r = new Paddle(
            width - paddle_width,
            paddle_y,
            paddle_width,
            paddle_height,
            input_r,
            this
        )
        this.paddles = {
            [PlayerSide.LEFT]: this.paddle_l,
            [PlayerSide.RIGHT]: this.paddle_r,
        }

        const puck_width = 20,
            puck_height = 20
        this.puck = new Puck(
            puck_width,
            puck_height,
            this.center_x,
            this.center_y,
            3
        )

        this.paddle_l.init()
        this.paddle_r.init()
    }
}

import { PlayerSide } from './enums'
import { GameState, Paddle } from './state'

export interface Input {
    tick(paddle: Paddle, game_state: GameState): void
}

export class HumanInput implements Input {
    moving_up = false
    moving_down = false
    moving_left = false
    moving_right = false
    trying_to_grab = false

    tick(paddle: Paddle): void {
        paddle.moving_up = this.moving_up
        paddle.moving_down = this.moving_down
        paddle.moving_left = this.moving_left
        paddle.moving_right = this.moving_right
        paddle.trying_to_grab = this.trying_to_grab
    }
}

export type InputMap = Map<PlayerSide, Input>

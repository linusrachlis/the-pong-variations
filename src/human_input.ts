import Input from './input'
import Paddle from './paddle'
import Pong from './pong'

export default class HumanInput implements Input {
    moving_up = false
    moving_down = false
    moving_left = false
    moving_right = false
    trying_to_grab = false

    debugMode = false

    debugLog(): void {
        const {
            moving_down,
            moving_up,
            moving_left,
            moving_right,
            trying_to_grab,
        } = this
        console.log('input', {
            moving_down,
            moving_up,
            moving_left,
            moving_right,
            trying_to_grab,
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tick(paddle: Paddle, _pong: Pong): void {
        if (this.debugMode) this.debugLog()

        paddle.moving_up = this.moving_up
        paddle.moving_down = this.moving_down
        paddle.moving_left = this.moving_left
        paddle.moving_right = this.moving_right
        paddle.trying_to_grab = this.trying_to_grab
    }
}

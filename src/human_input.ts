import Input from './input'
import Paddle from './paddle'
import Pong from './pong'

export default class HumanInput implements Input {
    moving_up = false
    moving_down = false

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tick(paddle: Paddle, _pong: Pong): void {
        paddle.moving_up = this.moving_up
        paddle.moving_down = this.moving_down
    }
}

import Paddle from './paddle'
import Pong from './pong'
import Puck from './puck'

export const gameplay_tick = (game: Pong) => {
    puck_tick(game.puck, [game.paddle_l, game.paddle_r])
    paddle_tick(game, game.paddle_l, game.puck)
    paddle_tick(game, game.paddle_r, game.puck)

    // TODO don't reverse vel multiple times in single tick

    // Puck/ceiling or puck/floor collision check
    if (game.puck.top <= 0 || game.puck.bottom >= game.height) {
        game.puck.vel.y *= -1
    }

    // Puck/wall collision check (victory condition)
    if (game.puck.left <= 0 || game.puck.right >= game.width) {
        game.is_over = true
    }
}

const paddle_tick = (game: Pong, paddle: Paddle, puck: Puck): void => {
    // Apply paddle movement (and apply to puck too, if paddle paddle's
    // grabbing it)
    if (paddle.moving_down && paddle.bottom < game.height) {
        paddle.top += Paddle.move_speed
        if (puck.grabbed_by === paddle) {
            puck.top += Paddle.move_speed
        }
    }
    if (paddle.moving_up && paddle.top > 0) {
        paddle.top -= Paddle.move_speed
        if (puck.grabbed_by === paddle) {
            puck.top -= Paddle.move_speed
        }
    }

    // 2D movement stuff
    if (paddle.moving_left && paddle.left > paddle.left_boundary) {
        paddle.left -= Paddle.move_speed
        if (puck.grabbed_by === paddle) {
            puck.left -= Paddle.move_speed
        }
    }
    if (paddle.moving_right && paddle.right < paddle.right_boundary) {
        paddle.left += Paddle.move_speed
        if (puck.grabbed_by === paddle) {
            puck.left += Paddle.move_speed
        }
    }

    // Is the puck touching or overlapping paddle paddle at all?
    if (
        puck.left <= paddle.right &&
        puck.right >= paddle.left &&
        puck.top <= paddle.bottom &&
        puck.bottom >= paddle.top
    ) {
        if (paddle.should_apply_grabbing && puck.grabbed_by === undefined) {
            // Apply grab
            puck.grabbed_by = paddle
        } else if (
            !paddle.should_apply_grabbing &&
            puck.grabbed_by === paddle
        ) {
            // Release
            puck.grabbed_by = undefined
        }

        // If puck is grabbed, don't do bounce calculation now
        if (puck.grabbed_by === undefined) paddle.calculateBounce()
    }

    paddle.input.tick(paddle, game)
}

const puck_tick = (puck: Puck, paddles: Paddle[]): void => {
    // Don't move if grabbed -- paddle will apply
    // movement (but keep velocity for when it's released)
    if (puck.grabbed_by !== undefined) return

    // Apply current velocity
    puck.left += puck.vel.x
    puck.top += puck.vel.y

    // Apply gravity toward any moving paddle
    for (const paddle of paddles) {
        if (paddle.pulling) {
            const rel_x = paddle.center_x - puck.center_x
            const rel_y = paddle.center_y - puck.center_y
            puck.vel.apply_force_toward(Paddle.pull_force, rel_x, rel_y)
        }
    }
}

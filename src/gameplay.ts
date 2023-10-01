import { InputMap } from './input'
import { GameMode, GameState, Paddle, Puck } from './state'
import { Velocity } from './velocity'

export function init_game(
    game_mode: GameMode,
    width: number,
    height: number,
    inputs: InputMap
): GameState {
    const center_x = width / 2
    const center_y = height / 2
    const paddle_width = 20
    const paddle_height = 100
    const puck_width = 20
    const puck_height = 20
    const paddle_y = center_y - Math.round(paddle_height / 2)
    const paddle_l = init_paddle(
        0,
        paddle_y,
        paddle_width,
        paddle_height,
        center_x,
        puck_width
    )
    const paddle_r = init_paddle(
        width - paddle_width,
        paddle_y,
        paddle_width,
        paddle_height,
        center_x,
        puck_width
    )

    const puck = init_puck(puck_width, puck_height, center_x, center_y, 3)
    const pong = new GameState(
        game_mode,
        width,
        height,
        inputs,
        puck,
        paddle_l,
        paddle_r,
        center_x,
        center_y
    )

    return pong
}

function init_paddle(
    left: number,
    top: number,
    width: number,
    height: number,
    center_x: number,
    puck_width: number
): Paddle {
    const paddle = new Paddle(left, top, width, height)
    if (paddle.center_x < center_x) {
        paddle.left_boundary = 0
        paddle.right_boundary = center_x - puck_width / 2
    } else {
        paddle.left_boundary = center_x + puck_width / 2
        paddle.right_boundary = width
    }
    return paddle
}

const init_puck = (
    width: number,
    height: number,
    left: number,
    top: number,
    speed: number
): Puck => {
    // Calculate random initial vector with given speed.
    const vel = Velocity.random_with_r(speed, speed * 1.5)
    const puck = new Puck(width, height, left, top, vel)
    return puck
}

export function paddle_is_pulling(
    game_state: GameState,
    paddle: Paddle
): boolean {
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
        game_state.game_mode.magnetic
        &&
        (
            (
                (paddle.moving_down || paddle.moving_up) &&
                !(paddle.moving_down && paddle.moving_up)
            )
            ||
            (
                (paddle.moving_right || paddle.moving_left) &&
                !(paddle.moving_right && paddle.moving_left)
            )
        )
    )
}

export function input_tick(game_state: GameState) {
    for (const [side, input] of game_state.inputs) {
        input.tick(game_state.paddles[side], game_state)
    }
}

export function gameplay_tick(game_state: GameState) {
    const paddles = [game_state.paddle_l, game_state.paddle_r]
    const puck = game_state.puck

    update_puck_position(puck, paddles, game_state)

    for (const paddle of paddles) {
        update_paddle_position(game_state, paddle, puck)

        // Is the puck touching or overlapping the paddle at all?
        if (
            puck.left <= paddle.right &&
            puck.right >= paddle.left &&
            puck.top <= paddle.bottom &&
            puck.bottom >= paddle.top
        ) {
            check_if_paddle_has_grabbed_puck(
                game_state,
                paddle,
                game_state.puck
            )

            // If puck is grabbed, don't do bounce calculation now
            if (game_state.puck.grabbed_by === undefined) {
                compute_puck_bounce_with_paddle(paddle, puck)
            }
        }
    }

    // TODO don't reverse vel multiple times in single tick (e.g. in case of
    // collision with both a paddle and floor/ceiling?)

    // Puck/ceiling or puck/floor collision check
    if (
        game_state.puck.top <= 0 ||
        game_state.puck.bottom >= game_state.height
    ) {
        game_state.puck.vel.y *= -1
    }

    // Puck/wall collision check (victory condition)
    if (
        game_state.puck.left <= 0 ||
        game_state.puck.right >= game_state.width
    ) {
        game_state.is_over = true
    }
}

function update_paddle_position(
    game_state: GameState,
    paddle: Paddle,
    puck: Puck
): void {
    // Apply paddle movement (and apply to puck too, if paddle paddle's
    // grabbing it)
    if (paddle.moving_down && paddle.bottom < game_state.height) {
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
}

function check_if_paddle_has_grabbed_puck(
    game_state: GameState,
    paddle: Paddle,
    puck: Puck
): void {
    const should_apply_grabbing_this_tick =
        game_state.game_mode.grabbing && paddle.trying_to_grab
    if (should_apply_grabbing_this_tick && puck.grabbed_by === undefined) {
        // Apply grab
        puck.grabbed_by = paddle
    } else if (!should_apply_grabbing_this_tick && puck.grabbed_by === paddle) {
        // Release
        puck.grabbed_by = undefined
    }
}

export function compute_puck_bounce_with_paddle(
    paddle: Paddle,
    puck: Puck
): void {
    let x_overlap: number,
        y_overlap: number,
        x_teleport: number,
        y_teleport: number,
        bend_up_factor: number | undefined,
        bend_down_factor: number | undefined

    const right_overlap = paddle.right - puck.left
    const left_overlap = puck.right - paddle.left

    // Is the puck at the paddle's left or right edge?
    // The answer is whichever overlap is lesser.
    if (right_overlap < left_overlap) {
        x_teleport = paddle.right
        x_overlap = right_overlap
    } else {
        x_teleport = paddle.left - puck.width
        x_overlap = left_overlap
    }

    const bottom_overlap = paddle.bottom - puck.top
    const top_overlap = puck.bottom - paddle.top

    // Is the puck at the paddle's top or bottom edge?
    // Again, it's edge with the lesser overlap.
    if (bottom_overlap < top_overlap) {
        y_teleport = paddle.bottom
        y_overlap = bottom_overlap

        if (bottom_overlap < puck.height * 2) {
            // When puck is just off the paddle's bottom, angle it
            // downwards in proportion to how little of it is overlapping.
            bend_down_factor = 1 - bottom_overlap / (puck.height * 2)
        }
    } else {
        y_teleport = paddle.top - puck.height
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

function update_puck_position(
    puck: Puck,
    paddles: Paddle[],
    game_state: GameState
): void {
    // Don't move if grabbed -- paddle will apply
    // movement (but keep velocity for when it's released)
    if (puck.grabbed_by !== undefined) return

    // Apply current velocity
    puck.left += puck.vel.x
    puck.top += puck.vel.y

    // Apply gravity toward any moving paddle
    for (const paddle of paddles) {
        if (paddle_is_pulling(game_state, paddle)) {
            const rel_x = paddle.center_x - puck.center_x
            const rel_y = paddle.center_y - puck.center_y
            puck.vel.apply_force_toward(Paddle.pull_force, rel_x, rel_y)
        }
    }
}

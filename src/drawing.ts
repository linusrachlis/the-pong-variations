import { paddle_is_pulling } from './gameplay'
import { GameState, Paddle, Puck } from './state'

export const draw_game = (
    ctx: CanvasRenderingContext2D,
    game_state: GameState
): void => {
    ctx.clearRect(0, 0, game_state.width, game_state.height)
    draw_paddle(ctx, game_state, game_state.paddle_l)
    draw_paddle(ctx, game_state, game_state.paddle_r)
    draw_puck(ctx, game_state.puck)

    if (game_state.is_over) {
        paint_text(
            ctx,
            'GAME OVER!',
            'bold 48px sans-serif',
            game_state.width / 2,
            game_state.height / 2
        )
        paint_text(
            ctx,
            'Space to restart',
            '16px sans-serif',
            game_state.width / 2,
            game_state.height / 2 + 48
        )
    }
}

const draw_paddle = (
    ctx: CanvasRenderingContext2D,
    game_state: GameState,
    paddle: Paddle
): void => {
    ctx.fillStyle = paddle_is_pulling(game_state, paddle)
        ? 'yellow'
        : 'limegreen'
    ctx.fillRect(paddle.left, paddle.top, paddle.width, paddle.height)
}

const draw_puck = (ctx: CanvasRenderingContext2D, puck: Puck): void => {
    ctx.fillStyle = 'magenta'
    ctx.fillRect(
        Math.round(puck.left),
        Math.round(puck.top),
        Math.round(puck.width),
        Math.round(puck.height)
    )
}

const paint_text = (
    ctx: CanvasRenderingContext2D,
    text: string,
    style: string,
    x: number,
    y: number
): void => {
    ctx.font = style
    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.fillText(text, x, y)
}

import Paddle from './paddle'
import Pong from './pong'
import Puck from './puck'

export const draw_game = (ctx: CanvasRenderingContext2D, game: Pong): void => {
    ctx.clearRect(0, 0, game.width, game.height)
    draw_paddle(ctx, game.paddle_l)
    draw_paddle(ctx, game.paddle_r)
    draw_puck(ctx, game.puck)

    if (game.is_over) {
        paint_text(
            ctx,
            'GAME OVER!',
            'bold 48px sans-serif',
            game.width / 2,
            game.height / 2
        )
        paint_text(
            ctx,
            'Space to restart',
            '16px sans-serif',
            game.width / 2,
            game.height / 2 + 48
        )
    }
}

const draw_paddle = (ctx: CanvasRenderingContext2D, paddle: Paddle): void => {
    ctx.fillStyle = paddle.pulling ? 'yellow' : 'limegreen'
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

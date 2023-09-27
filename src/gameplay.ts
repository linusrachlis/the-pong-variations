import Pong from './pong'

export const gameplay_tick = (game: Pong) => {
    game.puck.tick()
    game.paddle_l.tick()
    game.paddle_r.tick()

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

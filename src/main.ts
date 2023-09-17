import Pong from './pong'

export class GameMode {
    grabbing = false
    magnetic = false
}

window.addEventListener('load', () => {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
        console.error('Canvas not supported')
        return
    }
    const tick_length = 1000 / 60

    const grabbing_mode_checkbox = <HTMLInputElement>(
        document.getElementById('grabbing_mode')!
    )
    const magnetic_mode_checkbox = <HTMLInputElement>(
        document.getElementById('magnetic_mode')!
    )
    const game_mode = new GameMode()
    const update_game_mode = (): void => {
        game_mode.grabbing = grabbing_mode_checkbox.checked
        game_mode.magnetic = magnetic_mode_checkbox.checked
    }
    update_game_mode()
    grabbing_mode_checkbox.addEventListener('change', update_game_mode)
    magnetic_mode_checkbox.addEventListener('change', update_game_mode)

    let pong: Pong | undefined
    let tick_interval: number

    const paint = () => {
        if (pong === undefined) return
        pong.draw(ctx)
        if (!pong.is_over) window.requestAnimationFrame(paint)
    }

    const tick = () => {
        if (pong === undefined || pong.is_over) {
            clearInterval(tick_interval)
            return
        }
        pong.tick()
    }

    const new_game = () => {
        if (pong !== undefined && pong.is_over) {
            pong = undefined
        }
        if (pong !== undefined) {
            return // Won't restart if exists and isn't over
        }
        pong = new Pong(game_mode, canvas.width, canvas.height)
        tick_interval = window.setInterval(tick, tick_length)
        window.requestAnimationFrame(paint)
    }
    new_game()

    const handle_key_event = (e: KeyboardEvent): void => {
        if (pong === undefined) return

        // This lower case is a thought for later. I want to use shift instead
        // for grabbing. But then e.key may be capitals.
        switch (e.key.toLowerCase()) {
            // Movement
            case 'q':
                {
                    pong.paddle_l.moving_up = e.type == 'keydown'
                }
                break
            case 'z':
                {
                    pong.paddle_l.moving_down = e.type == 'keydown'
                }
                break
            case 'p':
                {
                    pong.paddle_r.moving_up = e.type == 'keydown'
                }
                break
            case ',':
                {
                    pong.paddle_r.moving_down = e.type == 'keydown'
                }
                break

            // Grabbing
            case 'a':
                {
                    pong.paddle_l.trying_to_grab = e.type == 'keydown'
                }
                break
            case 'l':
                {
                    pong.paddle_r.trying_to_grab = e.type == 'keydown'
                }
                break

            // Restart
            case ' ':
            case 'Spacebar':
                {
                    if (e.type == 'keyup') new_game()
                }
                break
        }
    }

    window.addEventListener('keydown', handle_key_event)
    window.addEventListener('keyup', handle_key_event)
})

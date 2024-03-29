import { GameMode, GameState } from './state'
import AI from './ai'
import { PlayerInput, PlayerSide } from './enums'
import { HumanInput, Input, InputMap } from './input'
import { draw_game } from './drawing'
import { gameplay_tick, init_game, input_tick } from './gameplay'

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

    let game_state: GameState | undefined

    const human_input_l = new HumanInput()
    const human_input_r = new HumanInput()
    const human_inputs = {
        [PlayerSide.LEFT]: human_input_l,
        [PlayerSide.RIGHT]: human_input_r,
    }

    const player_inputs: InputMap = new Map<PlayerSide, Input>([
        [PlayerSide.LEFT, human_input_l],
        [PlayerSide.RIGHT, new AI()],
    ])

    let tick_interval: number

    const paint = () => {
        if (game_state === undefined) return
        draw_game(ctx, game_state)
        if (!game_state.is_over) window.requestAnimationFrame(paint)
    }

    const tick = () => {
        if (game_state === undefined || game_state.is_over) {
            clearInterval(tick_interval)
            return
        }
        input_tick(game_state)
        gameplay_tick(game_state)
    }

    const new_game = () => {
        if (game_state !== undefined && game_state.is_over) {
            game_state = undefined
        }
        if (game_state !== undefined) {
            return // Won't restart if exists and isn't over
        }
        game_state = init_game(
            game_mode,
            canvas.width,
            canvas.height,
            player_inputs
        )
        tick_interval = window.setInterval(tick, tick_length)
        window.requestAnimationFrame(paint)
    }
    new_game()

    const handle_key_event = (e: KeyboardEvent): void => {
        if (game_state === undefined) return

        // NOTE: horizonal movement is disabled pending
        // https://github.com/linusrachlis/the-pong-variations/issues/11

        switch (e.code) {
            // Movement: left paddle
            case 'KeyW':
                human_input_l.moving_up = e.type == 'keydown'
                break
            // case 'KeyA':
            //     human_input_l.moving_left = e.type == 'keydown'
            //     break
            case 'KeyS':
                human_input_l.moving_down = e.type == 'keydown'
                break
            // case 'KeyD':
            //     human_input_l.moving_right = e.type == 'keydown'
            //     break

            // Movement: right paddle
            case 'ArrowUp':
                human_input_r.moving_up = e.type == 'keydown'
                break
            // case 'ArrowLeft':
            //     human_input_r.moving_left = e.type == 'keydown'
            //     break
            case 'ArrowDown':
                human_input_r.moving_down = e.type == 'keydown'
                break
            // case 'ArrowRight':
            //     human_input_r.moving_right = e.type == 'keydown'
            //     break

            // Grabbing
            case 'ShiftLeft':
                human_input_l.trying_to_grab = e.type == 'keydown'
                break
            case 'ShiftRight':
                human_input_r.trying_to_grab = e.type == 'keydown'
                break

            // Restart
            case 'Space':
                // Using keyup rather than keydown so it doesn't repeat when the
                // key is held
                if (e.type == 'keyup') new_game()
                break
        }
    }

    window.addEventListener('keydown', handle_key_event)
    window.addEventListener('keyup', handle_key_event)
    window.addEventListener('click', (e: MouseEvent) => {
        if (
            e.target &&
            e.target instanceof HTMLElement &&
            e.target.matches('button.mode_switch')
        ) {
            const sidebar = <HTMLElement>e.target.closest('.sidebar')
            const help_panel = <HTMLElement>sidebar.querySelector('.help')
            const ai_panel = <HTMLElement>sidebar.querySelector('.ai_panel')
            const side = <PlayerSide>e.target.dataset.side

            switch (e.target.dataset.to) {
                case PlayerInput.AI:
                    {
                        help_panel.classList.add('hidden_panel')
                        ai_panel.classList.remove('hidden_panel')
                        player_inputs.set(side, new AI())
                    }
                    break
                case PlayerInput.HUMAN:
                    {
                        ai_panel.classList.add('hidden_panel')
                        help_panel.classList.remove('hidden_panel')
                        player_inputs.set(side, human_inputs[side])
                    }
                    break
            }
        }
    })
})

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
    let tick_interval_id: number | undefined
    let running = false
    let game_state: GameState | undefined
    const game_mode = new GameMode()

    const grabbing_mode_checkbox = <HTMLInputElement>(
        document.getElementById('grabbing_mode')!
    )
    const magnetic_mode_checkbox = <HTMLInputElement>(
        document.getElementById('magnetic_mode')!
    )
    const update_game_mode = (): void => {
        game_mode.grabbing = grabbing_mode_checkbox.checked
        game_mode.magnetic = magnetic_mode_checkbox.checked
    }
    update_game_mode()
    grabbing_mode_checkbox.addEventListener('change', update_game_mode)
    magnetic_mode_checkbox.addEventListener('change', update_game_mode)

    const keyboard_captured_message = <HTMLInputElement>(
        document.querySelector('#keyboard_captured_message')!
    )
    const keyboard_not_captured_message = <HTMLInputElement>(
        document.querySelector('#keyboard_not_captured_message')!
    )
    const resume_button = <HTMLInputElement>(
        document.querySelector('#keyboard_not_captured_message button')!
    )
    const sync_pause_resume_ui = (): void => {
        if (running) {
            keyboard_captured_message.classList.remove('hidden_ui')
            keyboard_not_captured_message.classList.add('hidden_ui')
        } else {
            keyboard_captured_message.classList.add('hidden_ui')
            keyboard_not_captured_message.classList.remove('hidden_ui')
        }
    }
    sync_pause_resume_ui()
    const pause_game = (): void => {
        // Only do this stuff if the game is not already paused
        if (!running) return

        window.clearInterval(tick_interval_id)
        running = false
        sync_pause_resume_ui()
    }
    const resume_game = (): void => {
        // Only do this stuff if the game is not already running
        if (running) return

        tick_interval_id = window.setInterval(tick, tick_length)
        window.requestAnimationFrame(paint)
        running = true
        sync_pause_resume_ui()
    }
    resume_button.addEventListener('click', (): void => {
        if (game_state === undefined) new_game()
        else resume_game()
    })

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

    const paint = (): void => {
        if (game_state === undefined) return
        draw_game(ctx, game_state)
        if (!game_state.is_over) window.requestAnimationFrame(paint)
    }

    const tick = (): void => {
        if (game_state === undefined || game_state.is_over) {
            clearInterval(tick_interval_id)
            return
        }
        input_tick(game_state)
        gameplay_tick(game_state)
    }

    const new_game = (): void => {
        if (game_state !== undefined && game_state.is_over) {
            running = false
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
        resume_game()
    }

    const handle_key_event = (e: KeyboardEvent): void => {
        if (!running) return

        // NOTE: all key events for the relevant key codes are captured, even
        // though only some of them affect the game (e.g. keydown/keyup)
        let capture = false

        // NOTE: horizonal movement is disabled pending
        // https://github.com/linusrachlis/the-pong-variations/issues/11
        switch (e.code) {
            // Movement: left paddle
            case 'KeyW':
                human_input_l.moving_up = e.type == 'keydown'
                capture = true
                break
            // case 'KeyA':
            //     human_input_l.moving_left = e.type == 'keydown'
            //     break
            case 'KeyS':
                human_input_l.moving_down = e.type == 'keydown'
                capture = true
                break
            // case 'KeyD':
            //     human_input_l.moving_right = e.type == 'keydown'
            //     break

            // Movement: right paddle
            case 'ArrowUp':
                human_input_r.moving_up = e.type == 'keydown'
                capture = true
                break
            // case 'ArrowLeft':
            //     human_input_r.moving_left = e.type == 'keydown'
            //     break
            case 'ArrowDown':
                human_input_r.moving_down = e.type == 'keydown'
                capture = true
                break
            // case 'ArrowRight':
            //     human_input_r.moving_right = e.type == 'keydown'
            //     break

            // Grabbing
            case 'ShiftLeft':
                human_input_l.trying_to_grab = e.type == 'keydown'
                capture = true
                break
            case 'ShiftRight':
                human_input_r.trying_to_grab = e.type == 'keydown'
                capture = true
                break

            case 'Digit1':
                if (e.type == 'keydown') grabbing_mode_checkbox.click()
                capture = true
                break

            case 'Digit2':
                if (e.type == 'keydown') magnetic_mode_checkbox.click()
                capture = true
                break

            // Restart
            case 'Space':
                // Using keyup rather than keydown so it doesn't repeat when the
                // key is held
                if (e.type == 'keyup') new_game()
                capture = true
                break

            case 'Escape':
                if (e.type == 'keydown') pause_game()
        }

        if (capture) {
            e.preventDefault()
            e.stopPropagation()
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
                        help_panel.classList.add('hidden_ui')
                        ai_panel.classList.remove('hidden_ui')
                        player_inputs.set(side, new AI())
                    }
                    break
                case PlayerInput.HUMAN:
                    {
                        ai_panel.classList.add('hidden_ui')
                        help_panel.classList.remove('hidden_ui')
                        player_inputs.set(side, human_inputs[side])
                    }
                    break
            }
        }
    })
})

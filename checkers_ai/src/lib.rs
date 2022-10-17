#![warn(clippy::pedantic)]

use checkers_game::{Game, ValidMove};

#[must_use]
pub fn pick_move(state: &Game) -> Option<ValidMove> {
    search(state, 5).1
}

fn search(state: &Game, depth: u8) -> (i8, Option<ValidMove>) {
    if depth == 0 {
        return (board_value(state), None);
    }
    state
        .all_valid_moves()
        .map(|vm| {
            let new_state = state
                .play_move(vm)
                .expect("invalid move returned by all_valid_moves");
            let next_depth = if vm.eat.is_some() { depth } else { depth - 1 };
            let (mut value, _) = search(&new_state, next_depth);
            if new_state.turn != state.turn {
                value *= -1;
            }
            (value, Some(vm))
        })
        .max_by_key(|&(v, _)| v)
        .unwrap_or((i8::MIN, None))
}

fn board_value(state: &Game) -> i8 {
    state
        .board
        .iter()
        .flatten()
        .map(|p| if p.color() == state.turn { 1 } else { -1 } * if p.is_king() { 2 } else { 1 })
        .sum()
}

#[cfg(test)]
mod tests {}

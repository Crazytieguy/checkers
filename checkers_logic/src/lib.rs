#![warn(clippy::pedantic)]

use std::ops::Range;

use Color::{Black, Red};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Color {
    Red,
    Black,
}

impl Color {
    #[must_use]
    pub fn other(self) -> Self {
        match self {
            Red => Black,
            Black => Red,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum Piece {
    Red,
    Black,
    RedKing,
    BlackKing,
}

impl Piece {
    fn color(self) -> Color {
        match self {
            Piece::Red | Piece::RedKing => Red,
            Piece::Black | Piece::BlackKing => Black,
        }
    }

    fn is_king(self) -> bool {
        match self {
            Piece::Red | Piece::Black => false,
            Piece::RedKing | Piece::BlackKing => true,
        }
    }

    fn crown(self) -> Self {
        match self {
            Piece::Red | Piece::RedKing => Piece::RedKing,
            Piece::Black | Piece::BlackKing => Piece::BlackKing,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Game {
    turn: Color,
    in_chain_piece_idx: Option<usize>,
    board: [Option<Piece>; 32],
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ValidMove<'a> {
    pub from: usize,
    pub to: usize,
    eat: Option<usize>,
    for_game: &'a Game,
}

impl Game {
    #[must_use]
    pub fn new() -> Self {
        let mut board = [None; 32];
        board[..12].fill(Some(Piece::Red));
        board[20..].fill(Some(Piece::Black));
        Self {
            turn: Black,
            in_chain_piece_idx: None,
            board,
        }
    }

    #[must_use]
    pub fn play_move(
        &self,
        ValidMove {
            from,
            to,
            eat,
            for_game,
        }: ValidMove,
    ) -> Option<Self> {
        if !std::ptr::eq(for_game, self) {
            return None;
        }
        let mut piece = self.board[from]?;
        if (piece.color() == Black && row(to) == 0) || (piece.color() == Red && row(to) == 7) {
            piece = piece.crown();
        }
        let mut state = *self;
        state.board[to] = Some(piece);
        state.board[from] = None;
        if let Some(eat_idx) = eat {
            state.board[eat_idx] = None;
            state.in_chain_piece_idx = Some(to);
            if state.all_valid_moves().next().is_none() {
                state.in_chain_piece_idx = None;
                state.turn = state.turn.other();
            }
        } else {
            state.turn = state.turn.other();
        }
        Some(state)
    }

    fn generate_valid_moves(
        &self,
        from_range: Range<usize>,
        eat: bool,
    ) -> impl Iterator<Item = ValidMove> {
        from_range.flat_map(move |from| {
            self.board
                .get(from)
                .and_then(std::option::Option::as_ref)
                .into_iter()
                .filter(|p| p.color() == self.turn)
                .flat_map(move |&p| directions(p, eat))
                .filter_map(move |diff| self.validate_final(from, diff, eat))
        })
    }

    // from_piece, turn, and diffs are already garuanteed to be valid
    fn validate_final(
        &self,
        from: usize,
        (row_diff, col_diff): (isize, isize),
        eat: bool,
    ) -> Option<ValidMove> {
        let from_row = row(from);
        let from_col = column(from);
        let to = position_add_to_idx(from_row, from_col, row_diff, col_diff)?;
        // can't land on a piece
        if self.board[to].is_some() {
            return None;
        }
        // moving 1 is valid
        if !eat {
            return Some(ValidMove {
                from,
                to,
                eat: None,
                for_game: self,
            });
        }
        let eat_idx = position_add_to_idx(from_row, from_col, row_diff / 2, col_diff / 2)?;
        // no piece to eat
        if self.board.get(eat_idx)?.as_ref()?.color() == self.turn {
            return None;
        }
        Some(ValidMove {
            from,
            to,
            eat: Some(eat_idx),
            for_game: self,
        })
    }

    pub fn all_valid_moves(&self) -> impl Iterator<Item = ValidMove> {
        if let Some(in_chain_piece_idx) = self.in_chain_piece_idx {
            return self
                .generate_valid_moves(in_chain_piece_idx..in_chain_piece_idx, true)
                .peekable();
        }

        let mut eats = self
            .generate_valid_moves(0..self.board.len(), true)
            .peekable();

        if eats.peek().is_some() {
            eats
        } else {
            self.generate_valid_moves(0..self.board.len(), false)
                .peekable()
        }
    }
}

fn directions(p: Piece, eat: bool) -> impl Iterator<Item = (isize, isize)> {
    let [down, right, up, left] = [1, 1, -1, -1].map(|n| if eat { n * 2 } else { n });
    [down, up]
        .into_iter()
        .filter(move |&row_diff| {
            p.is_king()
                || match p.color() {
                    Red => row_diff == down,
                    Black => row_diff == up,
                }
        })
        .flat_map(move |row_diff| [(row_diff, right), (row_diff, left)])
}

impl Default for Game {
    fn default() -> Self {
        Self::new()
    }
}

fn position_add_to_idx(
    from_row: usize,
    from_col: usize,
    row_diff: isize,
    col_diff: isize,
) -> Option<usize> {
    let to_row = from_row.checked_add_signed(row_diff)?;
    let to_col = from_col.checked_add_signed(col_diff)?;
    if to_row > 7 || to_col > 7 {
        None
    } else {
        Some(to_row * 4 + to_col / 2)
    }
}

fn row(idx: usize) -> usize {
    idx / 4
}

fn column(idx: usize) -> usize {
    2 * (idx % 4) + usize::from(row(idx) % 2 == 0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn correct_initial_valid_moves() {
        let game = Game::new();
        let valid_moves = game.all_valid_moves().collect::<Vec<_>>();
        assert!(valid_moves.iter().all(|m| m.eat.is_none()));

        let assert_is_present =
            |from, to| assert!(valid_moves.iter().any(|m| m.from == from && m.to == to));

        assert_is_present(20, 16);
        assert_is_present(21, 17);
        assert_is_present(21, 16);
        assert_is_present(22, 18);
        assert_is_present(22, 17);
        assert_is_present(23, 19);
        assert_is_present(23, 18);
    }
}
